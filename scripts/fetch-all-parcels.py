#!/usr/bin/env python3
"""
Fetch ALL Southborough parcels from MassGIS ArcGIS API.
Run on your Mac or server (needs internet):
    python3 scripts/fetch-all-parcels.py

Outputs:
  - scripts/all-southborough-parcels.json  (full data)
  - src/parcelData.js  (auto-generated JS module)
  - Updates ROUTE9_PARCELS count in src/App.jsx
"""

import urllib.request
import urllib.parse
import json
import ssl
import sys
import os

BASE_URL = "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/L3_TAXPAR_POLY_ASSESS_gdb/FeatureServer/0/query"
FIELDS = "LOC_ID,MAP_PAR_ID,SITE_ADDR,FULL_STR,TOTAL_VAL,BLDG_VAL,LAND_VAL,LOT_SIZE,USE_CODE,OWNER1,FY"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def fetch_page(where, offset=0, count=2000):
    params = {
        'where': where,
        'outFields': FIELDS,
        'returnGeometry': 'true',
        'outSR': '4326',
        'f': 'geojson',
        'resultOffset': str(offset),
        'resultRecordCount': str(count),
    }
    url = BASE_URL + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req, timeout=120, context=ctx)
    return json.loads(resp.read())


def fetch_all(where):
    all_features = []
    offset = 0
    while True:
        print(f"  Fetching offset {offset}...")
        data = fetch_page(where, offset)
        features = data.get('features', [])
        if not features:
            break
        all_features.extend(features)
        print(f"    Got {len(features)} features (total: {len(all_features)})")
        if len(features) < 2000:
            break
        offset += len(features)
    return all_features


def get_centroid(geometry):
    coords = geometry.get('coordinates', [])
    gtype = geometry.get('type', '')
    if gtype == 'Polygon' and coords:
        ring = coords[0]
    elif gtype == 'MultiPolygon' and coords:
        ring = coords[0][0]
    else:
        return None, None
    if not ring:
        return None, None
    lons = [c[0] for c in ring]
    lats = [c[1] for c in ring]
    return sum(lons) / len(lons), sum(lats) / len(lats)


def main():
    print("=" * 80)
    print("Fetching ALL Southborough parcels from MassGIS")
    print("Query: TOWN_ID=277")
    print("=" * 80)

    features = fetch_all("TOWN_ID=277")
    print(f"\nTotal features returned: {len(features)}")

    # Deduplicate by LOC_ID
    seen = set()
    unique = []
    for f in features:
        pid = f['properties'].get('LOC_ID', '')
        if pid and pid not in seen:
            seen.add(pid)
            unique.append(f)

    print(f"Unique parcels (by LOC_ID): {len(unique)}")

    # Build parcel list with centroids
    parcels = []
    skipped = 0
    for f in unique:
        p = f['properties']
        geom = f.get('geometry')
        if not geom:
            skipped += 1
            continue

        lon, lat = get_centroid(geom)
        if lon is None or lat is None:
            skipped += 1
            continue

        parcels.append({
            'id': p.get('LOC_ID', ''),
            'address': (p.get('SITE_ADDR', '') or '').strip(),
            'street': (p.get('FULL_STR', '') or '').strip(),
            'owner': (p.get('OWNER1', '') or '').strip(),
            'total_val': p.get('TOTAL_VAL', 0) or 0,
            'bldg_val': p.get('BLDG_VAL', 0) or 0,
            'land_val': p.get('LAND_VAL', 0) or 0,
            'lot_size': p.get('LOT_SIZE', 0) or 0,
            'use_code': (p.get('USE_CODE', '') or '').strip(),
            'centroid_lon': round(lon, 6),
            'centroid_lat': round(lat, 6),
        })

    print(f"Parcels with valid geometry: {len(parcels)}")
    print(f"Skipped (no geometry): {skipped}")

    # Stats
    total_val = sum(p['total_val'] for p in parcels)
    total_acres = sum(p['lot_size'] for p in parcels)
    print(f"\nTotal assessed value: ${total_val:,.0f}")
    print(f"Total acres: {total_acres:,.2f}")

    # Sort by street then address
    parcels.sort(key=lambda p: (p['street'], p['address']))

    # Save full JSON
    script_dir = os.path.dirname(os.path.abspath(__file__))
    repo_dir = os.path.dirname(script_dir)

    json_path = os.path.join(script_dir, 'all-southborough-parcels.json')
    with open(json_path, 'w') as f:
        json.dump({
            'summary': {
                'total_parcels': len(parcels),
                'total_assessed_value': total_val,
                'total_acres': total_acres,
            },
            'parcels': parcels
        }, f, indent=2)
    print(f"\nSaved: {json_path}")

    # Generate parcelData.js
    js_path = os.path.join(repo_dir, 'src', 'parcelData.js')
    lines = ['// Auto-generated — ALL Southborough parcels from MassGIS']
    lines.append(f'// {len(parcels)} parcels, fetched {__import__("datetime").datetime.now().strftime("%Y-%m-%d %H:%M")}')
    lines.append('')
    lines.append('const PARCEL_CENTROIDS = [')
    for p in parcels:
        addr = p['address'].replace("'", "\\'").replace('"', '\\"')
        street = p['street'].replace("'", "\\'").replace('"', '\\"')
        owner = p['owner'].replace("'", "\\'").replace('"', '\\"')
        use = p['use_code']
        lines.append(f'  {{id:"{p["id"]}",address:"{addr}",street:"{street}",owner:"{owner}",total_val:{p["total_val"]},bldg_val:{p["bldg_val"]},land_val:{p["land_val"]},lot_size:{p["lot_size"]},use_code:"{use}",centroid_lon:{p["centroid_lon"]},centroid_lat:{p["centroid_lat"]}}},')
    lines.append('];')
    lines.append('')
    lines.append('export default PARCEL_CENTROIDS;')
    lines.append('')

    with open(js_path, 'w') as f:
        f.write('\n'.join(lines))
    print(f"Saved: {js_path}")

    # Also generate the ROUTE9_PARCELS format for App.jsx compatibility
    app_lines = []
    app_lines.append('const ROUTE9_PARCELS = [')
    for p in parcels:
        addr = p['address'].replace('"', '\\"')
        owner = p['owner'].replace('"', '\\"')
        app_lines.append(f'  {{id:"{p["id"]}",addr:"{addr}",totalVal:{p["total_val"]},bldgVal:{p["bldg_val"]},landVal:{p["land_val"]},acres:{p["lot_size"]},useCode:"{p["use_code"]}",owner:"{owner}"}},')
    app_lines.append('];')

    route9_path = os.path.join(script_dir, 'route9-parcels-all.js')
    with open(route9_path, 'w') as f:
        f.write('\n'.join(app_lines))
    print(f"Saved: {route9_path}")
    print(f"\nTo update App.jsx, replace the ROUTE9_PARCELS array with the contents of:")
    print(f"  {route9_path}")

    print(f"\n{'='*80}")
    print(f"DONE: {len(parcels)} parcels ready")
    print(f"{'='*80}")


if __name__ == '__main__':
    main()
