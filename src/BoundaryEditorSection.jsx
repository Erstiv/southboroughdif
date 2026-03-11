import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { pointInPolygon, parcelNearBoundary, polygonAreaSqMi } from './geometry';

const DEFAULT_BOUNDARY = [
  [-71.536,42.290],[-71.537,42.293],[-71.538,42.296],[-71.540,42.299],
  [-71.541,42.302],[-71.540,42.305],[-71.538,42.308],[-71.537,42.309],
  [-71.535,42.308],[-71.533,42.308],[-71.530,42.308],[-71.527,42.308],
  [-71.524,42.309],[-71.522,42.310],[-71.524,42.312],[-71.524,42.316],
  [-71.524,42.318],[-71.520,42.319],[-71.516,42.318],[-71.510,42.316],
  [-71.509,42.314],[-71.509,42.312],[-71.509,42.310],[-71.507,42.308],
  [-71.505,42.306],[-71.500,42.304],[-71.496,42.303],[-71.490,42.305],
  [-71.488,42.304],[-71.488,42.301],[-71.490,42.299],[-71.492,42.297],
  [-71.495,42.295],[-71.498,42.294],[-71.502,42.293],[-71.508,42.292],
  [-71.514,42.291],[-71.520,42.290],[-71.525,42.290],[-71.528,42.291],
  [-71.532,42.290],[-71.536,42.290]
];

const TOUCH_THRESHOLD = 200; // feet

const USE_CODE_COLORS = { '1': '#3b82f6', '3': '#f59e0b', '4': '#8b5cf6', '9': '#10b981', '8': '#10b981' };

export default function BoundaryEditorSection({ allParcels, boundaryVertices, onSaveBoundary, authToken, currentUser }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polygonRef = useRef(null);
  const vertexMarkersRef = useRef([]);
  const midpointMarkersRef = useRef([]);
  const parcelMarkersRef = useRef([]);
  const overlayRef = useRef(null);
  // Track boundary in a ref so drag handlers always see latest value
  const boundaryRef = useRef(null);

  const [boundary, setBoundaryState] = useState(() => {
    const init = boundaryVertices && boundaryVertices.length >= 3 ? boundaryVertices : DEFAULT_BOUNDARY;
    if (init.length > 0 && (init[0][0] !== init[init.length-1][0] || init[0][1] !== init[init.length-1][1])) {
      return [...init, init[0]];
    }
    return [...init];
  });

  // Wrapper to keep ref in sync
  const setBoundary = useCallback((valOrFn) => {
    setBoundaryState(prev => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      boundaryRef.current = next;
      return next;
    });
  }, []);

  // Initialize ref
  useEffect(() => { boundaryRef.current = boundary; }, []);

  const [mode, setMode] = useState('move');
  const [history, setHistory] = useState([]);
  const [insideParcels, setInsideParcels] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [saved, setSaved] = useState(false);
  const userName = currentUser?.displayName || 'Unknown';
  const [lockInfo, setLockInfo] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [serverStatus, setServerStatus] = useState('');

  // Load boundary from server on mount
  useEffect(() => {
    fetch('/api/boundary')
      .then(r => r.json())
      .then(data => {
        if (data.vertices && data.vertices.length >= 3) {
          let verts = data.vertices;
          if (verts[0][0] !== verts[verts.length-1][0] || verts[0][1] !== verts[verts.length-1][1]) {
            verts = [...verts, verts[0]];
          }
          setBoundary(verts);
        }
        if (data.lock) {
          setLockInfo(data.lock);
          setIsLocked(true);
        }
      })
      .catch(() => { /* server API not available, use local boundary */ });
  }, []);

  const authHeaders = { 'Content-Type': 'application/json', ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}) };

  const computeInsideParcels = useCallback((verts) => {
    if (!allParcels || !verts || verts.length < 3) return [];
    const closed = verts[0][0] === verts[verts.length-1][0] && verts[0][1] === verts[verts.length-1][1]
      ? verts : [...verts, verts[0]];
    return allParcels.filter(p => {
      const lon = p.centroid_lon || 0, lat = p.centroid_lat || 0;
      return pointInPolygon(lon, lat, closed) || parcelNearBoundary(lon, lat, closed, TOUCH_THRESHOLD);
    });
  }, [allParcels]);

  useEffect(() => {
    const inside = computeInsideParcels(boundary);
    setInsideParcels(inside);
    setSaved(false);
  }, [boundary, computeInsideParcels]);

  const totalVal = insideParcels.reduce((s, p) => s + (p.total_val || p.totalVal || 0), 0);
  const totalAcres = insideParcels.reduce((s, p) => s + (p.lot_size || p.acres || 0), 0);
  const areaSqMi = boundary.length >= 3 ? polygonAreaSqMi(boundary) : 0;
  const vertexCount = boundary.length > 0 && boundary[0][0] === boundary[boundary.length-1][0] ? boundary.length - 1 : boundary.length;

  // Check if current user can edit
  const canEdit = !isLocked || (lockInfo && lockInfo.lockedBy === userName);

  // --- Map initialization ---
  useEffect(() => {
    if (mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([42.304, -71.516], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OSM', maxZoom: 19
    }).addTo(map);
    const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri', maxZoom: 19
    });
    L.control.layers({ 'Street': map._layers[Object.keys(map._layers)[0]], 'Satellite': sat }).addTo(map);
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // --- Render boundary polygon, vertices, parcels ---
  // Use a separate render function instead of re-creating markers on every boundary change during drag
  const renderMap = useCallback(() => {
    const map = mapInstanceRef.current;
    const currentBoundary = boundaryRef.current || boundary;
    if (!map) return;

    // Clear old layers
    if (polygonRef.current) map.removeLayer(polygonRef.current);
    vertexMarkersRef.current.forEach(m => map.removeLayer(m));
    midpointMarkersRef.current.forEach(m => map.removeLayer(m));
    parcelMarkersRef.current.forEach(m => map.removeLayer(m));
    vertexMarkersRef.current = [];
    midpointMarkersRef.current = [];
    parcelMarkersRef.current = [];

    if (currentBoundary.length < 3) return;

    // Draw polygon
    const latLngs = currentBoundary.map(b => [b[1], b[0]]);
    polygonRef.current = L.polygon(latLngs, {
      color: '#991b1b', weight: 2.5, fillColor: '#991b1b',
      fillOpacity: 0.06, dashArray: '6, 3', interactive: false
    }).addTo(map);

    const n = currentBoundary[0][0] === currentBoundary[currentBoundary.length-1][0] &&
              currentBoundary[0][1] === currentBoundary[currentBoundary.length-1][1]
      ? currentBoundary.length - 1 : currentBoundary.length;

    for (let i = 0; i < n; i++) {
      const [lon, lat] = currentBoundary[i];
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;background:${mode === 'delete' ? '#ef4444' : '#dc2626'};border:2px solid white;border-radius:50%;cursor:${mode === 'move' ? 'grab' : 'pointer'};box-shadow:0 1px 3px rgba(0,0,0,0.3);margin-left:-7px;margin-top:-7px;"></div>`,
        iconSize: [14, 14]
      });
      const marker = L.marker([lat, lon], { icon, draggable: mode === 'move' && canEdit });

      if (mode === 'move' && canEdit) {
        marker.on('dragstart', () => {
          // Save history before drag
          setHistory(h => [...h.slice(-49), JSON.parse(JSON.stringify(boundaryRef.current))]);
        });
        marker.on('drag', (e) => {
          const pos = e.target.getLatLng();
          const cur = boundaryRef.current;
          if (!cur) return;
          const next = [...cur];
          next[i] = [pos.lng, pos.lat];
          // If dragging first vertex, also update closing vertex
          if (i === 0 && next.length > 1) {
            next[next.length - 1] = [pos.lng, pos.lat];
          }
          boundaryRef.current = next;
          // Update polygon visually without triggering full re-render
          if (polygonRef.current) {
            polygonRef.current.setLatLngs(next.map(b => [b[1], b[0]]));
          }
        });
        marker.on('dragend', () => {
          // Commit the drag result to React state
          const final = boundaryRef.current;
          if (final) {
            setBoundaryState([...final]);
          }
        });
      }

      if (mode === 'delete' && canEdit) {
        marker.on('click', () => {
          if (n <= 3) return;
          setHistory(h => [...h.slice(-49), JSON.parse(JSON.stringify(currentBoundary))]);
          setBoundary(prev => {
            const next = [...prev];
            next.splice(i, 1);
            if (i === 0 && next.length > 0) next[next.length - 1] = [...next[0]];
            return next;
          });
        });
      }

      marker.bindTooltip(`Vertex ${i + 1}`, { direction: 'top', offset: [0, -10] });
      marker.addTo(map);
      vertexMarkersRef.current.push(marker);

      // Midpoints for adding vertices between existing ones
      if (mode === 'move' && canEdit) {
        const ni = (i + 1) % n;
        const mLon = (currentBoundary[i][0] + currentBoundary[ni][0]) / 2;
        const mLat = (currentBoundary[i][1] + currentBoundary[ni][1]) / 2;
        const mIcon = L.divIcon({
          className: '',
          html: '<div style="width:10px;height:10px;background:rgba(37,99,235,0.6);border:1.5px solid white;border-radius:50%;cursor:pointer;margin-left:-5px;margin-top:-5px;"></div>',
          iconSize: [10, 10]
        });
        const mid = L.marker([mLat, mLon], { icon: mIcon });
        mid.on('click', () => {
          setHistory(h => [...h.slice(-49), JSON.parse(JSON.stringify(currentBoundary))]);
          setBoundary(prev => {
            const next = [...prev];
            next.splice(i + 1, 0, [mLon, mLat]);
            return next;
          });
        });
        mid.bindTooltip('Click to add vertex', { direction: 'top', offset: [0, -8] });
        mid.addTo(map);
        midpointMarkersRef.current.push(mid);
      }
    }

    // Parcels
    const closed = currentBoundary[0][0] === currentBoundary[currentBoundary.length-1][0] ? currentBoundary : [...currentBoundary, currentBoundary[0]];
    allParcels.forEach(p => {
      const lon = p.centroid_lon || 0, lat = p.centroid_lat || 0;
      const inside = pointInPolygon(lon, lat, closed);
      const touching = !inside && parcelNearBoundary(lon, lat, closed, TOUCH_THRESHOLD);
      const included = inside || touching;
      const code = (p.use_code || p.useCode || '')[0];
      const color = USE_CODE_COLORS[code] || '#6b7280';
      const val = (p.total_val || p.totalVal || 0);
      const valStr = val >= 1e6 ? '$' + (val / 1e6).toFixed(1) + 'M' : '$' + Math.round(val / 1e3) + 'K';

      const cm = L.circleMarker([lat, lon], {
        radius: included ? 5 : 3,
        fillColor: color, color: included ? '#fff' : '#999',
        weight: included ? 1.5 : 0.5, fillOpacity: included ? 0.85 : 0.2,
      });
      cm.bindPopup(`<b>${p.address || p.addr}</b><br>${p.street || ''}<br>${p.owner}<br>${valStr}<br><em>${included ? (touching ? 'Touching' : 'Inside') : 'Outside'}</em>`);
      cm.addTo(map);
      parcelMarkersRef.current.push(cm);
    });
  }, [mode, allParcels, canEdit]);

  // Re-render map when boundary or mode changes (but NOT during drag)
  useEffect(() => {
    renderMap();
  }, [boundary, mode, renderMap]);

  // Click-to-add mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !canEdit) return;
    const handler = (e) => {
      if (mode !== 'add') return;
      const lon = e.latlng.lng, lat = e.latlng.lat;
      const cur = boundaryRef.current || boundary;
      let bestDist = Infinity, bestIdx = 0;
      for (let i = 0; i < cur.length - 1; i++) {
        const dx = cur[i+1][0] - cur[i][0], dy = cur[i+1][1] - cur[i][1];
        const lenSq = dx*dx + dy*dy;
        const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, ((lon - cur[i][0])*dx + (lat - cur[i][1])*dy) / lenSq));
        const cx = cur[i][0] + t*dx, cy = cur[i][1] + t*dy;
        const d = Math.sqrt((lon-cx)**2 + (lat-cy)**2);
        if (d < bestDist) { bestDist = d; bestIdx = i + 1; }
      }
      setHistory(h => [...h.slice(-49), JSON.parse(JSON.stringify(cur))]);
      setBoundary(prev => { const next = [...prev]; next.splice(bestIdx, 0, [lon, lat]); return next; });
    };
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [mode, canEdit]);

  // Overlay toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (showOverlay && !overlayRef.current) {
      const bounds = [[42.285, -71.545], [42.325, -71.480]];
      overlayRef.current = L.imageOverlay('/district-map.png', bounds, { opacity: 0.3 }).addTo(map);
    } else if (!showOverlay && overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }
  }, [showOverlay]);

  // --- Actions ---
  const undo = () => {
    if (history.length === 0) return;
    setBoundary(history[history.length - 1]);
    setHistory(h => h.slice(0, -1));
  };

  const resetToDefault = () => {
    if (!window.confirm('Reset to default boundary (original traced outline)?')) return;
    setHistory(h => [...h.slice(-49), JSON.parse(JSON.stringify(boundary))]);
    setBoundary([...DEFAULT_BOUNDARY]);
  };

  const clearAll = () => {
    if (!window.confirm('Clear the entire boundary? You will start with a blank map. This cannot be undone.')) return;
    setHistory([]);
    setBoundary([]);
    setInsideParcels([]);
  };

  const toggleLock = async () => {
    const action = isLocked ? 'unlock' : 'lock';
    try {
      const res = await fetch('/api/boundary/lock', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (res.ok) {
        setIsLocked(action === 'lock');
        setLockInfo(data.lock);
        setServerStatus(action === 'lock' ? 'Locked for editing' : 'Unlocked');
        setTimeout(() => setServerStatus(''), 3000);
      } else {
        setServerStatus(data.error || 'Lock failed');
        setTimeout(() => setServerStatus(''), 5000);
      }
    } catch {
      setServerStatus('Server not available — lock not applied');
      setTimeout(() => setServerStatus(''), 5000);
    }
  };

  const saveBoundary = async () => {
    const verts = boundary.length > 0 && boundary[0][0] === boundary[boundary.length-1][0]
      ? boundary.slice(0, -1) : boundary;

    // Save to server
    try {
      const res = await fetch('/api/boundary', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          vertices: verts,
          parcelsInsideCount: insideParcels.length
        })
      });
      const data = await res.json();
      if (res.ok) {
        setServerStatus('Saved to server');
        setIsLocked(false);
        setLockInfo(null);
      } else {
        setServerStatus(data.error || 'Save failed');
      }
    } catch {
      setServerStatus('Server not available — saved locally only');
    }

    // Also save locally as fallback
    localStorage.setItem('southborough-dif-boundary', JSON.stringify({
      vertices: verts, savedAt: new Date().toISOString()
    }));

    // Notify parent
    onSaveBoundary(verts, insideParcels);
    setSaved(true);
    setTimeout(() => { setSaved(false); setServerStatus(''); }, 3000);
  };

  const exportJSON = () => {
    const data = {
      boundary: (boundary[0][0] === boundary[boundary.length-1][0] ? boundary.slice(0,-1) : boundary).map(b => ({lon: b[0], lat: b[1]})),
      parcels: insideParcels.map(p => ({
        address: p.address || p.addr, street: p.street || '', owner: p.owner,
        total_val: p.total_val || p.totalVal, lot_size: p.lot_size || p.acres,
        use_code: p.use_code || p.useCode, lat: p.centroid_lat, lon: p.centroid_lon
      })),
      stats: { count: insideParcels.length, totalAssessed: totalVal, totalAcres, areaSqMi }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'dif-boundary-export.json'; a.click();
  };

  const exportCSV = () => {
    const rows = [['Address','Street','Owner','Total Assessed','Lot Size','Use Code','Latitude','Longitude']];
    insideParcels.forEach(p => rows.push([
      `"${p.address || p.addr}"`, `"${p.street || ''}"`, `"${(p.owner||'').replace(/"/g,'""')}"`,
      p.total_val || p.totalVal, (p.lot_size || p.acres || 0).toFixed(2),
      p.use_code || p.useCode, (p.centroid_lat||0).toFixed(6), (p.centroid_lon||0).toFixed(6)
    ]));
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = 'dif-parcels.csv'; a.click();
  };

  const filteredParcels = searchTerm
    ? insideParcels.filter(p => ((p.address||p.addr)+' '+(p.street||'')+' '+p.owner).toLowerCase().includes(searchTerm.toLowerCase()))
    : insideParcels;

  const modeLabels = { move: 'Drag vertices to reshape', add: 'Click map to add points', delete: 'Click vertices to remove' };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', margin: '-2rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      {/* Sidebar */}
      <div style={{ width: '320px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
        {/* Lock status bar */}
        {isLocked && lockInfo && (
          <div style={{ padding: '8px 12px', background: lockInfo.lockedBy === userName ? '#dbeafe' : '#fef3c7',
            borderBottom: '1px solid #e2e8f0', fontSize: '12px',
            color: lockInfo.lockedBy === userName ? '#1e40af' : '#92400e' }}>
            {lockInfo.lockedBy === userName
              ? 'You have the editing lock'
              : `Locked by ${lockInfo.lockedBy} — view only`}
          </div>
        )}

        {/* Tools */}
        <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Edit Tools</span>
            <button onClick={toggleLock}
              style={{ padding: '3px 8px', border: '1px solid ' + (isLocked ? '#f59e0b' : '#cbd5e1'),
                borderRadius: '5px', background: isLocked ? '#fef3c7' : 'white',
                color: isLocked ? '#92400e' : '#64748b', cursor: 'pointer', fontSize: '11px' }}>
              {isLocked ? 'Unlock' : 'Lock for editing'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {['move', 'add', 'delete'].map(m => (
              <button key={m} onClick={() => setMode(m)} disabled={!canEdit}
                style={{ padding: '5px 10px', border: '1px solid ' + (mode === m ? '#1e3a5f' : '#cbd5e1'),
                  borderRadius: '5px', background: mode === m ? '#1e3a5f' : 'white',
                  color: mode === m ? 'white' : (m === 'delete' ? '#dc2626' : '#334155'),
                  cursor: canEdit ? 'pointer' : 'not-allowed', fontSize: '12px',
                  opacity: canEdit ? 1 : 0.5 }}>
                {m === 'move' ? 'Move' : m === 'add' ? '+ Add' : 'Delete'}
              </button>
            ))}
            <button onClick={undo} disabled={!canEdit || history.length === 0}
              style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '5px', background: 'white',
                cursor: canEdit ? 'pointer' : 'not-allowed', fontSize: '12px', color: '#334155',
                opacity: canEdit && history.length > 0 ? 1 : 0.5 }}>Undo</button>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <button onClick={resetToDefault} disabled={!canEdit}
              style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '5px', background: 'white',
                cursor: canEdit ? 'pointer' : 'not-allowed', fontSize: '12px', color: '#334155',
                opacity: canEdit ? 1 : 0.5 }}>Reset to Default</button>
            <button onClick={clearAll} disabled={!canEdit}
              style={{ padding: '5px 10px', border: '1px solid #fca5a5', borderRadius: '5px', background: '#fef2f2',
                cursor: canEdit ? 'pointer' : 'not-allowed', fontSize: '12px', color: '#991b1b',
                opacity: canEdit ? 1 : 0.5 }}>Clear All</button>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button onClick={saveBoundary} disabled={!canEdit}
              style={{ padding: '5px 12px', border: '1px solid #059669', borderRadius: '5px',
                background: saved ? '#059669' : 'white', color: saved ? 'white' : '#059669',
                cursor: canEdit ? 'pointer' : 'not-allowed', fontSize: '12px', fontWeight: 600,
                opacity: canEdit ? 1 : 0.5 }}>
              {saved ? 'Saved!' : 'Save Boundary'}
            </button>
            <button onClick={exportJSON} style={{ padding: '5px 10px', border: '1px solid #6ee7b7', borderRadius: '5px', background: 'white', color: '#059669', cursor: 'pointer', fontSize: '12px' }}>JSON</button>
            <button onClick={exportCSV} style={{ padding: '5px 10px', border: '1px solid #6ee7b7', borderRadius: '5px', background: 'white', color: '#059669', cursor: 'pointer', fontSize: '12px' }}>CSV</button>
          </div>
          <div style={{ marginTop: '6px' }}>
            <label style={{ fontSize: '12px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <input type="checkbox" checked={showOverlay} onChange={e => setShowOverlay(e.target.checked)} />
              Show Discussion Draft overlay
            </label>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{modeLabels[mode]}</div>
          {serverStatus && (
            <div style={{ marginTop: '4px', fontSize: '11px', color: serverStatus.includes('fail') || serverStatus.includes('not available') ? '#dc2626' : '#059669', fontWeight: 600 }}>
              {serverStatus}
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', background: 'white' }}>
          <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', fontWeight: 600 }}>District Statistics</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <StatCard label="Parcels" value={insideParcels.length} />
            <StatCard label="Assessed Value" value={totalVal >= 1e6 ? '$' + (totalVal/1e6).toFixed(1) + 'M' : '$' + Math.round(totalVal/1e3) + 'K'} small />
            <StatCard label="Total Acres" value={totalAcres.toFixed(0)} />
            <StatCard label="Vertices" value={vertexCount} />
          </div>
          <div style={{ marginTop: '8px', padding: '6px 8px', borderRadius: '5px', fontSize: '12px',
            background: areaSqMi > 3.9 ? '#fef2f2' : '#ecfdf5',
            color: areaSqMi > 3.9 ? '#991b1b' : '#065f46',
            border: '1px solid ' + (areaSqMi > 3.9 ? '#fca5a5' : '#6ee7b7') }}>
            DIF Area: <b>{areaSqMi.toFixed(2)} sq mi</b> {areaSqMi > 3.9 ? '— exceeds 3.9 sq mi limit!' : `of 3.9 sq mi limit (${(areaSqMi/3.9*100).toFixed(0)}%)`}
          </div>
        </div>

        {/* Parcel List */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>Parcels ({filteredParcels.length})</span>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search..." style={{ padding: '3px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', width: '120px' }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredParcels.sort((a, b) => ((a.street||'')+(a.address||a.addr||'')).localeCompare((b.street||'')+(b.address||b.addr||''))).map((p, i) => {
              const val = (p.total_val || p.totalVal || 0);
              const valStr = val >= 1e6 ? '$' + (val/1e6).toFixed(1) + 'M' : '$' + Math.round(val/1e3) + 'K';
              return (
                <div key={p.loc_id || p.id || i}
                  onClick={() => mapInstanceRef.current?.setView([p.centroid_lat, p.centroid_lon], 17)}
                  style={{ padding: '6px 12px', borderBottom: '1px solid #f1f5f9', fontSize: '12px', cursor: 'pointer' }}>
                  <div style={{ fontWeight: 600, color: '#1e3a5f' }}>{p.address || p.addr}</div>
                  <div style={{ color: '#64748b', marginTop: '1px' }}>{p.street || ''} &bull; {valStr} &bull; {(p.lot_size || p.acres || 0).toFixed(2)} ac</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, small }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: '5px', padding: '6px 8px', border: '1px solid #e2e8f0' }}>
      <div style={{ fontSize: '11px', color: '#64748b' }}>{label}</div>
      <div style={{ fontSize: small ? '14px' : '18px', fontWeight: 700, color: '#1e3a5f' }}>{value}</div>
    </div>
  );
}
