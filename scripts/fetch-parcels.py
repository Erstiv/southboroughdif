#!/usr/bin/env python3
"""
Fetch all Southborough parcels from MassGIS ArcGIS API and filter to the DIF boundary.
Run on your Mac:  python3 scripts/fetch-parcels.py

The DIF boundary polygon is approximated from the Discussion Draft #2 map (2/15/26).
It follows Route 9 from near I-495 on the west to the Framingham/Ashland border on the east.
"""

import urllib.request
import urllib.parse
import json
import ssl
import sys

# Same ArcGIS endpoint the live interactive map uses
BASE_URL = "https://services1.arcgis.com/hGdibHYSPO59RG1h/arcgis/rest/services/L3_TAXPAR_POLY_ASSESS_gdb/FeatureServer/0/query"

# Field names from MassGIS layer
FIELDS = "LOC_ID,MAP_PAR_ID,SITE_ADDR,FULL_STR,TOTAL_VAL,BLDG_VAL,LAND_VAL,LOT_SIZE,USE_CODE,OWNER1,FY"

# Allow self-signed certs just in case
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def fetch_parcels(where_clause, offset=0):
    """Fetch parcels from MassGIS ArcGIS"""
    params = {
        'where': where_clause,
        'outFields': FIELDS,
        'returnGeometry': 'true',
        'outSR': '4326',
        'f': 'geojson',
        'resultOffset': str(offset),
        'resultRecordCount': '1000',
    }
    url = BASE_URL + '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req, timeout=60, context=ctx)
    return json.loads(resp.read())


def fetch_all(where_clause):
    """Fetch all results, handling pagination"""
    all_features = []
    offset = 0
    while True:
        data = fetch_parcels(where_clause, offset)
        features = data.get('features', [])
        if not features:
            break
        all_features.extend(features)
        if len(features) < 1000:
            break
        offset += len(features)
    return all_features


def get_centroid(geometry):
    """Get centroid of a polygon/multipolygon"""
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


def rings_from_geometry(geometry):
    """Get all coordinate rings from a geometry for intersection testing"""
    coords = geometry.get('coordinates', [])
    gtype = geometry.get('type', '')
    rings = []
    if gtype == 'Polygon' and coords:
        rings = coords
    elif gtype == 'MultiPolygon' and coords:
        for poly in coords:
            rings.extend(poly)
    return rings


def point_in_polygon(x, y, polygon):
    """Ray casting algorithm"""
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def parcel_intersects_boundary(geometry, boundary):
    """Check if any vertex of the parcel is in the boundary, or the centroid is"""
    # Check centroid first (fast path)
    lon, lat = get_centroid(geometry)
    if lon is not None and point_in_polygon(lon, lat, boundary):
        return True, lon, lat

    # Check if any vertex of the parcel polygon is inside boundary
    rings = rings_from_geometry(geometry)
    for ring in rings:
        for coord in ring:
            if point_in_polygon(coord[0], coord[1], boundary):
                return True, lon, lat

    # Check if any boundary vertex is inside the parcel (for large parcels containing boundary points)
    if rings:
        for bx, by in boundary:
            if point_in_polygon(bx, by, rings[0]):
                return True, lon, lat

    return False, lon, lat


# ============================================================
# APPROXIMATE DIF BOUNDARY from Discussion Draft #2 (2/15/26)
# Traced from the red outline on the map
# Route 9 corridor, Southborough MA
# West: near I-495/Westborough border
# East: near Framingham/Ashland border
# The boundary does NOT extend north past Main Street
# ============================================================

DIF_BOUNDARY = [
    # Western end — near I-495 / Westborough border
    # The boundary starts at the southwestern corner near Rt 9 & I-495
    (-71.5340, 42.3020),
    (-71.5350, 42.3050),
    (-71.5350, 42.3080),
    (-71.5340, 42.3110),
    (-71.5310, 42.3130),
    (-71.5280, 42.3145),

    # Northwest side — runs east along north side of Route 9
    # Stays south of Main Street
    (-71.5240, 42.3155),
    (-71.5200, 42.3165),
    (-71.5160, 42.3170),
    (-71.5120, 42.3175),
    (-71.5080, 42.3180),
    (-71.5040, 42.3185),
    (-71.5000, 42.3185),

    # Central area — wider section around Parkerville / Cordaville
    (-71.4960, 42.3190),
    (-71.4920, 42.3190),
    (-71.4880, 42.3185),
    (-71.4840, 42.3180),
    (-71.4800, 42.3180),
    (-71.4760, 42.3185),

    # East of center — toward Turnpike Rd area
    (-71.4720, 42.3190),
    (-71.4680, 42.3195),
    (-71.4640, 42.3200),
    (-71.4600, 42.3205),

    # Eastern section — wider area near Framingham border
    (-71.4560, 42.3210),
    (-71.4520, 42.3215),
    (-71.4490, 42.3220),
    (-71.4460, 42.3220),

    # Northeast corner — near Framingham/Ashland
    (-71.4430, 42.3215),
    (-71.4410, 42.3200),
    (-71.4400, 42.3180),

    # Eastern tip
    (-71.4395, 42.3160),
    (-71.4400, 42.3140),

    # South side going west — below Route 9
    (-71.4410, 42.3120),
    (-71.4430, 42.3100),
    (-71.4460, 42.3085),
    (-71.4500, 42.3070),
    (-71.4540, 42.3060),
    (-71.4580, 42.3055),
    (-71.4620, 42.3050),
    (-71.4660, 42.3045),
    (-71.4700, 42.3040),
    (-71.4740, 42.3038),
    (-71.4780, 42.3035),

    # Central south
    (-71.4820, 42.3035),
    (-71.4860, 42.3033),
    (-71.4900, 42.3030),
    (-71.4940, 42.3030),
    (-71.4980, 42.3028),
    (-71.5020, 42.3025),
    (-71.5060, 42.3025),
    (-71.5100, 42.3022),
    (-71.5140, 42.3020),
    (-71.5180, 42.3018),

    # Southwest — back toward I-495
    (-71.5220, 42.3015),
    (-71.5260, 42.3015),
    (-71.5300, 42.3015),
    (-71.5340, 42.3020),  # close the polygon
]


def main():
    print("=" * 80)
    print("Southborough DIF Parcel Fetcher")
    print("Querying MassGIS ArcGIS for TOWN_ID=277 parcels...")
    print("=" * 80)

    # Strategy: query by street names that could be in the DIF corridor,
    # PLUS a geographic bounding box to catch anything we miss
    street_queries = [
        ("BOSTON", "TOWN_ID=277 AND FULL_STR LIKE '%BOSTON%'"),
        ("TURNPIKE", "TOWN_ID=277 AND FULL_STR LIKE '%TURNPIKE%'"),
        ("CORDAVILLE", "TOWN_ID=277 AND FULL_STR LIKE '%CORDAVILLE%'"),
        ("PARKERVILLE", "TOWN_ID=277 AND FULL_STR LIKE '%PARKERVILLE%'"),
        ("MIDDLE", "TOWN_ID=277 AND FULL_STR LIKE '%MIDDLE%'"),
        ("SOUTHVILLE", "TOWN_ID=277 AND FULL_STR LIKE '%SOUTHVILLE%'"),
        ("WOODLAND", "TOWN_ID=277 AND FULL_STR LIKE '%WOODLAND%'"),
        ("FLAGG", "TOWN_ID=277 AND FULL_STR LIKE '%FLAGG%'"),
        ("OAK HILL", "TOWN_ID=277 AND FULL_STR LIKE '%OAK HILL%'"),
        ("FRAMINGHAM", "TOWN_ID=277 AND FULL_STR LIKE '%FRAMINGHAM%'"),
        ("DEERFOOT", "TOWN_ID=277 AND FULL_STR LIKE '%DEERFOOT%'"),
        ("PINE HILL", "TOWN_ID=277 AND FULL_STR LIKE '%PINE HILL%'"),
        ("SEARS", "TOWN_ID=277 AND FULL_STR LIKE '%SEARS%'"),
        ("RICHARDS", "TOWN_ID=277 AND FULL_STR LIKE '%RICHARDS%'"),
        ("WASHINGTON", "TOWN_ID=277 AND FULL_STR LIKE '%WASHINGTON%'"),
        ("PARK", "TOWN_ID=277 AND FULL_STR LIKE '%PARK%'"),
        ("FAYVILLE", "TOWN_ID=277 AND FULL_STR LIKE '%FAYVILLE%'"),
        ("MAIN", "TOWN_ID=277 AND FULL_STR LIKE '%MAIN%'"),
        ("CENTRAL", "TOWN_ID=277 AND FULL_STR LIKE '%CENTRAL%'"),
        ("ATWOOD", "TOWN_ID=277 AND FULL_STR LIKE '%ATWOOD%'"),
    ]

    all_parcels = []
    seen_ids = set()

    for name, where in street_queries:
        try:
            features = fetch_all(where)
            new_count = 0
            for f in features:
                pid = f['properties'].get('LOC_ID', '')
                if pid and pid not in seen_ids:
                    seen_ids.add(pid)
                    all_parcels.append(f)
                    new_count += 1
            print(f"  {name:15s}: {len(features):4d} found, {new_count:4d} new")
        except Exception as e:
            print(f"  {name:15s}: ERROR - {e}")

    print(f"\nTotal unique parcels from street queries: {len(all_parcels)}")

    # Now filter to parcels within or touching the DIF boundary
    print("\nFiltering to DIF boundary...")
    dif_parcels = []
    outside = []

    for parcel in all_parcels:
        geom = parcel.get('geometry')
        if not geom:
            outside.append(parcel)
            continue

        intersects, lon, lat = parcel_intersects_boundary(geom, DIF_BOUNDARY)
        if intersects:
            dif_parcels.append((parcel, lon, lat))
        else:
            outside.append(parcel)

    print(f"  Parcels INSIDE DIF boundary: {len(dif_parcels)}")
    print(f"  Parcels OUTSIDE DIF boundary: {len(outside)}")

    # Sort by address
    dif_parcels.sort(key=lambda x: (x[0]['properties'].get('FULL_STR', ''), x[0]['properties'].get('SITE_ADDR', '')))

    # Summary stats
    total_val = sum(p[0]['properties'].get('TOTAL_VAL', 0) or 0 for p in dif_parcels)
    total_acres = sum(p[0]['properties'].get('LOT_SIZE', 0) or 0 for p in dif_parcels)

    print(f"\n{'='*80}")
    print(f"DIF PARCELS: {len(dif_parcels)} total")
    print(f"Total Assessed Value: ${total_val:,.0f}")
    print(f"Total Acres: {total_acres:.2f}")
    print(f"{'='*80}")

    # Print each parcel
    for parcel, lon, lat in dif_parcels:
        p = parcel['properties']
        addr = p.get('SITE_ADDR', '') or ''
        owner = (p.get('OWNER1', '') or '')[:40]
        val = p.get('TOTAL_VAL', 0) or 0
        acres = p.get('LOT_SIZE', 0) or 0
        use = p.get('USE_CODE', '') or ''
        print(f"  {addr:35s} | ${val:>12,.0f} | {acres:6.2f}ac | {use:4s} | {owner}")

    # Output as JavaScript for App.jsx
    print(f"\n\n// ===== COPY BELOW INTO App.jsx (replace ROUTE9_PARCELS) =====")
    print("const ROUTE9_PARCELS = [")
    for parcel, lon, lat in dif_parcels:
        p = parcel['properties']
        loc_id = (p.get('LOC_ID', '') or '').replace('"', '\\"')
        addr = (p.get('SITE_ADDR', '') or '').replace('"', '\\"').strip()
        owner = (p.get('OWNER1', '') or '').replace('"', '\\"').strip()
        total_val = p.get('TOTAL_VAL', 0) or 0
        bld_val = p.get('BLDG_VAL', 0) or 0
        land_val = p.get('LAND_VAL', 0) or 0
        lot_size = p.get('LOT_SIZE', 0) or 0
        use_code = (p.get('USE_CODE', '') or '').strip()

        print(f'  {{id:"{loc_id}",addr:"{addr}",totalVal:{total_val},bldgVal:{bld_val},landVal:{land_val},acres:{lot_size},useCode:"{use_code}",owner:"{owner}"}},')

    print("];")
    print(f"// Total: {len(dif_parcels)} parcels | ${total_val:,.0f} assessed | {total_acres:.2f} acres")

    # Save full data as JSON for reference
    output = {
        'summary': {
            'total_parcels': len(dif_parcels),
            'total_assessed_value': total_val,
            'total_acres': total_acres,
        },
        'parcels': [
            {
                'loc_id': p['properties'].get('LOC_ID'),
                'address': p['properties'].get('SITE_ADDR'),
                'owner': p['properties'].get('OWNER1'),
                'total_val': p['properties'].get('TOTAL_VAL'),
                'bldg_val': p['properties'].get('BLDG_VAL'),
                'land_val': p['properties'].get('LAND_VAL'),
                'lot_size': p['properties'].get('LOT_SIZE'),
                'use_code': p['properties'].get('USE_CODE'),
                'street': p['properties'].get('FULL_STR'),
                'centroid_lon': lon,
                'centroid_lat': lat,
            }
            for p, lon, lat in dif_parcels
        ]
    }

    with open('scripts/dif-parcels.json', 'w') as f:
        json.dump(output, f, indent=2)
    print(f"\nFull data saved to scripts/dif-parcels.json")

    # Also list the parcels that were OUTSIDE for review
    print(f"\n\n// ===== PARCELS OUTSIDE BOUNDARY (for review) =====")
    for parcel in outside[:20]:
        p = parcel['properties']
        addr = p.get('SITE_ADDR', '') or ''
        lon, lat = get_centroid(parcel.get('geometry', {}))
        print(f"//   {addr:35s} | centroid: ({lon:.4f}, {lat:.4f})" if lon else f"//   {addr:35s} | no geometry")


if __name__ == '__main__':
    main()
