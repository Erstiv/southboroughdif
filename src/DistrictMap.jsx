import React, { useEffect, useState, useRef, Component } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Error boundary to prevent map crashes from blanking the whole page
class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-slate-50 border-2 border-slate-300 rounded p-6">
          <p className="text-sm text-red-600 font-semibold mb-2">Map Component Error</p>
          <div className="bg-white border border-red-300 rounded p-4">
            <p className="text-sm text-slate-600 mb-4">The interactive map encountered an error. Showing static map instead.</p>
            <img src="/district-map.png" alt="District Map - Route 9 Corridor" className="w-full h-auto rounded border border-slate-200" />
            <p className="text-xs text-slate-500 mt-2">Discussion Draft #2 (2/15/26) — DIF area is within the 25% statutory limit (MGL Ch. 40Q §2).</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ARCGIS_URL = 'https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/L3_TAXPAR_POLY_ASSESS_gdb/FeatureServer/0/query';

const USE_CODE_COLORS = {
  "101": "#3b82f6", // Single Family — blue
  "102": "#6366f1", // Condo — indigo
  "104": "#8b5cf6", // Two Family — violet
  "109": "#a855f7", // Multiple Houses — purple
  "130": "#84cc16", // Vacant Land — lime
  "131": "#84cc16",
  "132": "#84cc16",
  "314": "#f97316", // Restaurant — orange
  "316": "#eab308", // Mixed Use — yellow
  "325": "#ef4444", // Motel — red
  "334": "#f59e0b", // Gas Station — amber
  "337": "#78716c", // Parking — stone
  "340": "#06b6d4", // Office — cyan
  "391": "#a3e635", // Vacant Commercial — lime bright
  "392": "#a3e635",
  "013": "#14b8a6", // Multiple Use — teal
  "915": "#64748b", // Government — slate
  "929": "#64748b",
  "930": "#64748b",
  "950": "#64748b",
  "960": "#64748b",
  "970": "#64748b",
  "971": "#64748b"
};

const USE_CODE_DESCRIPTIONS = {
  "101": "Single Family",
  "102": "Condo",
  "104": "Two Family",
  "109": "Multiple Houses",
  "130": "Vacant Land",
  "131": "Vacant Land",
  "132": "Vacant Land",
  "314": "Restaurant/Bar",
  "316": "Mixed Use",
  "325": "Motel",
  "334": "Gas Station",
  "337": "Parking Lot",
  "340": "General Office",
  "391": "Vacant Commercial",
  "392": "Vacant Commercial",
  "013": "Multiple Use",
  "915": "Government",
  "929": "Government",
  "930": "Government",
  "950": "Government",
  "960": "Government",
  "970": "Government",
  "971": "Government"
};

const formatCurrency = (val) => {
  if (!val) return '$0';
  return '$' + Math.round(val).toLocaleString();
};

// Auto-fit map bounds to GeoJSON
function FitBounds({ geojsonData }) {
  const map = useMap();
  useEffect(() => {
    if (geojsonData && geojsonData.features && geojsonData.features.length > 0) {
      const geoLayer = L.geoJSON(geojsonData);
      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [geojsonData, map]);
  return null;
}

function DistrictMapInner({ selectedParcelIds, onParcelClick }) {
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredParcel, setHoveredParcel] = useState(null);
  const selectedSet = new Set(selectedParcelIds || []);

  useEffect(() => {
    fetchParcels();
  }, []);

  const fetchParcels = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        where: "TOWN_ID=277 AND FULL_STR LIKE '%BOSTON%'",
        outFields: 'LOC_ID,MAP_PAR_ID,SITE_ADDR,FULL_STR,TOTAL_VAL,BLDG_VAL,LAND_VAL,LOT_SIZE,USE_CODE,OWNER1,FY',
        outSR: '4326',
        f: 'geojson',
        resultRecordCount: '200'
      });

      const response = await fetch(`${ARCGIS_URL}?${params}`);
      if (!response.ok) throw new Error(`API returned ${response.status}`);

      const data = await response.json();
      if (!data.features || data.features.length === 0) {
        throw new Error('No parcels returned from ArcGIS');
      }
      setGeojsonData(data);
    } catch (err) {
      console.error('Failed to fetch parcels:', err);
      setError(err.message);
    }
    setLoading(false);
  };

  const getStyle = (feature) => {
    const useCode = feature.properties.USE_CODE;
    const locId = feature.properties.LOC_ID;
    const isSelected = selectedSet.has(locId);
    const isHovered = hoveredParcel === locId;

    return {
      fillColor: USE_CODE_COLORS[useCode] || '#94a3b8',
      weight: isHovered ? 3 : isSelected ? 2 : 1,
      opacity: 1,
      color: isHovered ? '#ffffff' : isSelected ? '#1e3a5f' : '#475569',
      fillOpacity: isSelected ? 0.6 : 0.25,
      dashArray: isSelected ? null : '3'
    };
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;

    layer.on({
      mouseover: (e) => {
        setHoveredParcel(props.LOC_ID);
        e.target.setStyle({ weight: 3, color: '#ffffff', fillOpacity: 0.8 });
        e.target.bringToFront();
      },
      mouseout: (e) => {
        setHoveredParcel(null);
        // Reset to computed style
        const useCode = props.USE_CODE;
        const isSelected = selectedSet.has(props.LOC_ID);
        e.target.setStyle({
          fillColor: USE_CODE_COLORS[useCode] || '#94a3b8',
          weight: isSelected ? 2 : 1,
          color: isSelected ? '#1e3a5f' : '#475569',
          fillOpacity: isSelected ? 0.6 : 0.25,
          dashArray: isSelected ? null : '3'
        });
      },
      click: () => {
        if (onParcelClick) onParcelClick(props.LOC_ID);
      }
    });

    layer.bindPopup(`
      <div style="font-family: system-ui; min-width: 200px;">
        <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px; color: #1a202c;">${props.SITE_ADDR || 'No Address'}</div>
        <div style="font-size: 11px; color: #718096; margin-bottom: 8px; font-family: monospace;">${props.LOC_ID}</div>
        <table style="font-size: 11px; width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 2px 8px 2px 0; color: #4a5568;">Owner</td><td style="font-weight: 500;">${(props.OWNER1 || '').substring(0, 35)}</td></tr>
          <tr><td style="padding: 2px 8px 2px 0; color: #4a5568;">Total Value</td><td style="font-weight: 600; font-family: monospace;">${formatCurrency(props.TOTAL_VAL)}</td></tr>
          <tr><td style="padding: 2px 8px 2px 0; color: #4a5568;">Building</td><td style="font-family: monospace;">${formatCurrency(props.BLDG_VAL)}</td></tr>
          <tr><td style="padding: 2px 8px 2px 0; color: #4a5568;">Land</td><td style="font-family: monospace;">${formatCurrency(props.LAND_VAL)}</td></tr>
          <tr><td style="padding: 2px 8px 2px 0; color: #4a5568;">Lot Size</td><td>${props.LOT_SIZE ? props.LOT_SIZE.toFixed(2) + ' acres' : 'N/A'}</td></tr>
          <tr><td style="padding: 2px 8px 2px 0; color: #4a5568;">Use</td><td>${USE_CODE_DESCRIPTIONS[props.USE_CODE] || props.USE_CODE}</td></tr>
        </table>
      </div>
    `);
  };

  // Build legend
  const legendItems = [
    { color: '#3b82f6', label: 'Residential' },
    { color: '#06b6d4', label: 'Office/Commercial' },
    { color: '#eab308', label: 'Mixed Use' },
    { color: '#84cc16', label: 'Vacant Land' },
    { color: '#64748b', label: 'Government' },
    { color: '#ef4444', label: 'Hospitality' }
  ];

  if (loading) {
    return (
      <div className="bg-slate-50 border-2 border-slate-300 rounded p-6">
        <p className="text-sm text-slate-600 font-semibold mb-2">Loading District Map...</p>
        <div className="h-96 bg-white border border-slate-300 rounded flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-slate-500 text-sm">Fetching parcel data from MassGIS...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-50 border-2 border-slate-300 rounded p-6">
        <p className="text-sm text-red-600 font-semibold mb-2">Map Error</p>
        <div className="h-96 bg-white border border-red-300 rounded flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-red-600 font-semibold mb-2">Could not load parcel data</p>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <button onClick={fetchParcels} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-500">
              Retry
            </button>
            <div className="mt-4 border-t pt-4">
              <p className="text-xs text-slate-400 mb-2">Fallback: Static Map</p>
              <img src="/district-map.png" alt="District Map" className="w-full h-auto rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-2 border-slate-300 rounded p-6">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-slate-600 font-semibold">Interactive District Map — Route 9 Corridor</p>
        <span className="text-xs text-slate-400">{geojsonData?.features?.length || 0} parcels loaded from MassGIS</span>
      </div>
      <div className="bg-white border border-slate-300 rounded overflow-hidden relative" style={{ height: '500px' }}>
        <MapContainer
          center={[42.305, -71.555]}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {geojsonData && (
            <>
              <GeoJSON
                key={JSON.stringify(Array.from(selectedSet))}
                data={geojsonData}
                style={getStyle}
                onEachFeature={onEachFeature}
              />
              <FitBounds geojsonData={geojsonData} />
            </>
          )}
        </MapContainer>

        {/* Legend overlay */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded shadow-lg p-3 z-[1000]">
          <p className="text-xs font-semibold text-slate-700 mb-2">Parcel Types</p>
          {legendItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color, opacity: 0.7 }}></div>
              <span className="text-xs text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">Click any parcel for details. Data from MassGIS ArcGIS REST API (TOWN_ID=277). Boundaries are within the 25% statutory limit (MGL Ch. 40Q §2).</p>
    </div>
  );
}

export default function DistrictMap(props) {
  return (
    <MapErrorBoundary>
      <DistrictMapInner {...props} />
    </MapErrorBoundary>
  );
}
