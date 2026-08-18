#!/usr/bin/env python3
"""
Extrae los bufetes de abogados de Madrid y genera un Excel con los que NO tienen
pagina web.

Areas (--area):
  m30      Todo el interior de la M-30, ~48 km2 (por defecto).
  centro   Solo el distrito Centro.

Fuentes (--source):
  google   Google Places API (New). Refleja lo que se ve en Google Maps.
           Requiere clave en GOOGLE_MAPS_API_KEY o --api-key.
  osm      OpenStreetMap via Overpass. Gratis y sin clave, pero cubre bastantes
           menos despachos pequenos que Google.

El barrido es adaptativo: empieza con celdas de 800 m y solo subdivide las que se
saturan (la API tope a 20 resultados por llamada), afinando hasta 100 m en zonas
densas. Unas 460 llamadas para toda la M-30 con cobertura completa.

Uso tipico:
    export GOOGLE_MAPS_API_KEY="AIza..."
    python3 scripts/madrid_abogados_sin_web.py --area m30 -o bufetes.xlsx --cache progreso.json

    python3 scripts/madrid_abogados_sin_web.py --area m30 --source osm -o bufetes.xlsx
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# ---------------------------------------------------------------------------
# Area de busqueda: distrito Centro de Madrid (Palacio, Embajadores, Cortes,
# Justicia, Universidad y Sol).
#
# Poligono aproximado que sigue los limites reales del distrito: Paseo del
# Prado/Recoletos al este, Bailen/Ronda de Segovia al oeste, Carranza-Sagasta-
# Genova al norte y las Rondas de Atocha/Valencia/Toledo al sur.
# Con --source osm el script intenta primero descargar el limite exacto.
# ---------------------------------------------------------------------------
CENTRO_POLYGON = [
    (40.4240, -3.7185),  # Cuesta de San Vicente
    (40.4270, -3.7115),  # Plaza de Espana
    (40.4295, -3.7080),  # Alberto Aguilera / San Bernardo
    (40.4300, -3.7010),  # Glorieta de Bilbao
    (40.4285, -3.6955),  # Sagasta
    (40.4265, -3.6925),  # Alonso Martinez / Genova
    (40.4245, -3.6905),  # Plaza de Colon
    (40.4195, -3.6920),  # Paseo de Recoletos / Cibeles
    (40.4155, -3.6925),  # Paseo del Prado
    (40.4085, -3.6925),  # Atocha
    (40.4050, -3.6985),  # Ronda de Atocha
    (40.4030, -3.7060),  # Ronda de Valencia
    (40.4055, -3.7135),  # Puerta de Toledo
    (40.4105, -3.7185),  # Ronda de Segovia
    (40.4160, -3.7195),  # Calle Segovia / Las Vistillas
    (40.4200, -3.7190),  # Bailen / Palacio Real
]

# ---------------------------------------------------------------------------
# Area 2: interior de la M-30.
#
# Poligono aproximado que traza el anillo de la M-30: Nudo Norte arriba,
# Avenida de la Paz por el este, Nudo Sur abajo, el Manzanares / Madrid Rio por
# el oeste y la Avenida de la Ilustracion cerrando por el noroeste.
# Abarca Centro y buena parte de Chamberi, Salamanca, Retiro, Arganzuela,
# Moncloa, Tetuan y Chamartin.
# ---------------------------------------------------------------------------
M30_POLYGON = [
    (40.4735, -3.6890),  # Nudo Norte
    (40.4720, -3.6700),  # M-30 noreste
    (40.4600, -3.6620),  # Avenida de la Paz norte
    (40.4480, -3.6600),  # Avenida de la Paz
    (40.4380, -3.6620),  # Ventas
    (40.4270, -3.6620),  # O'Donnell
    (40.4130, -3.6650),  # Avenida del Mediterraneo
    (40.4020, -3.6720),  # Puente de Vallecas
    (40.3900, -3.6790),  # M-30 sureste
    (40.3840, -3.6900),  # Nudo Sur / Legazpi
    (40.3830, -3.7000),  # Manzanares sur
    (40.3880, -3.7110),  # Marques de Vadillo
    (40.3960, -3.7180),  # Puente de Toledo
    (40.4080, -3.7260),  # Avenida de Portugal
    (40.4230, -3.7300),  # Puente de los Franceses
    (40.4350, -3.7280),  # Ciudad Universitaria
    (40.4480, -3.7280),  # Puerta de Hierro
    (40.4650, -3.7220),  # Avenida de la Ilustracion oeste
    (40.4780, -3.7100),  # Avenida de la Ilustracion norte
    (40.4790, -3.6980),  # M-30 noroeste
]

AREAS = {
    "centro": (CENTRO_POLYGON,
               "Distrito Centro de Madrid (Palacio, Embajadores, Cortes, "
               "Justicia, Universidad, Sol)"),
    "m30": (M30_POLYGON, "Interior de la M-30 de Madrid"),
}

LAT_M = 111_320.0  # metros por grado de latitud


def lon_m(lat: float) -> float:
    """Metros por grado de longitud a una latitud dada."""
    return LAT_M * math.cos(math.radians(lat))


def point_in_polygon(lat: float, lon: float, poly: list[tuple[float, float]]) -> bool:
    """Ray casting. poly es una lista de (lat, lon)."""
    inside = False
    n = len(poly)
    for i in range(n):
        y1, x1 = poly[i]
        y2, x2 = poly[(i + 1) % n]
        if (x1 > lon) != (x2 > lon):
            y_at = y1 + (lon - x1) * (y2 - y1) / (x2 - x1)
            if lat < y_at:
                inside = not inside
    return inside


def polygon_bbox(poly: list[tuple[float, float]]) -> tuple[float, float, float, float]:
    lats = [p[0] for p in poly]
    lons = [p[1] for p in poly]
    return min(lats), min(lons), max(lats), max(lons)


def cell_intersects(clat: float, clon: float, half_lat: float, half_lon: float,
                    poly: list[tuple[float, float]]) -> bool:
    """True si la celda toca el poligono (test por centro, esquinas y vertices)."""
    probes = [
        (clat, clon),
        (clat + half_lat, clon + half_lon), (clat + half_lat, clon - half_lon),
        (clat - half_lat, clon + half_lon), (clat - half_lat, clon - half_lon),
        (clat + half_lat, clon), (clat - half_lat, clon),
        (clat, clon + half_lon), (clat, clon - half_lon),
    ]
    if any(point_in_polygon(a, b, poly) for a, b in probes):
        return True
    # el poligono puede atravesar la celda sin que ninguna sonda caiga dentro
    return any(abs(vlat - clat) <= half_lat and abs(vlon - clon) <= half_lon
               for vlat, vlon in poly)


def initial_cells(poly: list[tuple[float, float]], cell_m: float) -> list[tuple[float, float, float]]:
    """Celdas cuadradas de lado cell_m que cubren el poligono: (lat, lon, lado)."""
    min_lat, min_lon, max_lat, max_lon = polygon_bbox(poly)
    mid_lat = (min_lat + max_lat) / 2
    d_lat = cell_m / LAT_M
    d_lon = cell_m / lon_m(mid_lat)

    cells = []
    lat = min_lat
    while lat < max_lat + d_lat:
        lon = min_lon
        while lon < max_lon + d_lon:
            clat, clon = lat + d_lat / 2, lon + d_lon / 2
            if cell_intersects(clat, clon, d_lat / 2, d_lon / 2, poly):
                cells.append((clat, clon, cell_m))
            lon += d_lon
        lat += d_lat
    return cells


# ---------------------------------------------------------------------------
# Fuente 1: Google Places API (New)
# ---------------------------------------------------------------------------

PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby"
PLACES_TEXT_URL = "https://places.googleapis.com/v1/places:searchText"

FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.addressComponents",
    "places.websiteUri",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.googleMapsUri",
    "places.primaryTypeDisplayName",
    "places.businessStatus",
])


def _post_json(url: str, payload: dict, headers: dict, retries: int = 4) -> dict:
    body = json.dumps(payload).encode("utf-8")
    last_err = None
    for attempt in range(retries):
        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")[:400]
            if exc.code in (429, 500, 502, 503, 504):
                last_err = f"HTTP {exc.code}: {detail}"
                time.sleep(2 ** attempt)
                continue
            raise SystemExit(f"Google Places devolvio HTTP {exc.code}: {detail}")
        except urllib.error.URLError as exc:
            last_err = str(exc)
            time.sleep(2 ** attempt)
    raise SystemExit(f"Google Places no responde tras {retries} intentos: {last_err}")


def fetch_google(api_key: str, poly, start_cell_m: float, min_cell_m: float,
                 verbose: bool = True, cache_path: str = "") -> dict[str, dict]:
    """Barrido adaptativo.

    Empieza con celdas grandes y subdivide en 4 solo las que se saturan (la API
    devuelve como mucho 20 resultados por llamada). Asi las zonas densas como
    Centro o Salamanca se afinan y las vacias no gastan llamadas.
    """
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": FIELD_MASK,
    }

    found: dict[str, dict] = {}
    done: set[str] = set()

    if cache_path and os.path.exists(cache_path):
        with open(cache_path, encoding="utf-8") as fh:
            cached = json.load(fh)
        found = cached.get("places", {})
        done = set(cached.get("done", []))
        if verbose:
            print(f"[google] reanudando: {len(found)} despachos, "
                  f"{len(done)} celdas ya hechas", file=sys.stderr)

    def save():
        if cache_path:
            tmp = cache_path + ".tmp"
            with open(tmp, "w", encoding="utf-8") as fh:
                json.dump({"places": found, "done": sorted(done)}, fh)
            os.replace(tmp, cache_path)

    stack = initial_cells(poly, start_cell_m)
    if verbose:
        print(f"[google] {len(stack)} celdas iniciales de {start_cell_m:.0f} m", file=sys.stderr)

    calls = 0
    unresolved = 0
    while stack:
        clat, clon, size = stack.pop()
        key = f"{clat:.6f},{clon:.6f},{size:.0f}"
        if key in done:
            continue

        radius = size * 0.7072  # media diagonal: el circulo cubre el cuadrado
        payload = {
            "includedTypes": ["lawyer"],
            "maxResultCount": 20,
            "languageCode": "es",
            "regionCode": "ES",
            "locationRestriction": {
                "circle": {"center": {"latitude": clat, "longitude": clon},
                           "radius": min(radius, 50000.0)}
            },
        }
        data = _post_json(PLACES_URL, payload, headers)
        calls += 1
        places = data.get("places", [])
        for p in places:
            if p.get("id"):
                found[p["id"]] = p

        if len(places) >= 20:
            half = size / 2
            if half >= min_cell_m:
                # celda saturada: la partimos en cuatro y reintentamos
                q_lat = (half / 2) / LAT_M
                q_lon = (half / 2) / lon_m(clat)
                for dlat in (q_lat, -q_lat):
                    for dlon in (q_lon, -q_lon):
                        stack.append((clat + dlat, clon + dlon, half))
            else:
                unresolved += 1

        done.add(key)
        if calls % 25 == 0:
            save()
            if verbose:
                print(f"[google] {calls} llamadas - {len(found)} despachos unicos "
                      f"- {len(stack)} celdas en cola", file=sys.stderr)
        time.sleep(0.05)

    save()
    if verbose:
        print(f"[google] terminado: {calls} llamadas, {len(found)} despachos unicos",
              file=sys.stderr)
        if unresolved:
            print(f"[google] AVISO: {unresolved} celdas seguian saturadas en el tamano "
                  f"minimo ({min_cell_m:.0f} m). Baja --min-cell para afinar mas.",
                  file=sys.stderr)
    return found


def normalize_google(p: dict) -> dict:
    loc = p.get("location") or {}
    postal = ""
    for comp in p.get("addressComponents") or []:
        if "postal_code" in (comp.get("types") or []):
            postal = comp.get("longText") or ""
            break
    return {
        "nombre": (p.get("displayName") or {}).get("text", ""),
        "direccion": p.get("formattedAddress", ""),
        "cp": postal,
        "telefono": p.get("nationalPhoneNumber") or p.get("internationalPhoneNumber") or "",
        "web": p.get("websiteUri") or "",
        "valoracion": p.get("rating") or "",
        "resenas": p.get("userRatingCount") or "",
        "categoria": (p.get("primaryTypeDisplayName") or {}).get("text", ""),
        "estado": p.get("businessStatus", ""),
        "maps_url": p.get("googleMapsUri", ""),
        "id": p.get("id", ""),
        "lat": loc.get("latitude"),
        "lon": loc.get("longitude"),
        "fuente": "Google Maps",
    }


# ---------------------------------------------------------------------------
# Fuente 2: OpenStreetMap / Overpass
# ---------------------------------------------------------------------------

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

def overpass_query(poly: list[tuple[float, float]]) -> str:
    coords = " ".join(f"{lat} {lon}" for lat, lon in poly)
    return f"""
[out:json][timeout:180];
(
  nwr["office"="lawyer"](poly:"{coords}");
  nwr["amenity"="lawyer"](poly:"{coords}");
  nwr["shop"="lawyer"](poly:"{coords}");
);
out center tags;
"""


def fetch_osm(poly, verbose: bool = True) -> list[dict]:
    data_enc = urllib.parse.urlencode({"data": overpass_query(poly)}).encode()
    last_err = None
    for endpoint in OVERPASS_ENDPOINTS:
        if verbose:
            print(f"[osm] probando {endpoint}", file=sys.stderr)
        try:
            req = urllib.request.Request(endpoint, data=data_enc, method="POST")
            with urllib.request.urlopen(req, timeout=180) as resp:
                return json.loads(resp.read().decode("utf-8")).get("elements", [])
        except Exception as exc:  # noqa: BLE001 - probamos el siguiente mirror
            last_err = exc
            continue
    raise SystemExit(f"Ningun endpoint de Overpass respondio. Ultimo error: {last_err}")


def normalize_osm(el: dict) -> dict:
    t = el.get("tags", {})
    lat = el.get("lat") or (el.get("center") or {}).get("lat")
    lon = el.get("lon") or (el.get("center") or {}).get("lon")
    street = t.get("addr:street", "")
    number = t.get("addr:housenumber", "")
    direccion = ", ".join(x for x in [f"{street} {number}".strip(), t.get("addr:city", "")] if x)
    return {
        "nombre": t.get("name", ""),
        "direccion": direccion,
        "cp": t.get("addr:postcode", ""),
        "telefono": t.get("phone") or t.get("contact:phone") or "",
        "web": t.get("website") or t.get("contact:website") or t.get("url") or "",
        "valoracion": "",
        "resenas": "",
        "categoria": t.get("office") or t.get("amenity") or t.get("shop") or "",
        "estado": "",
        "maps_url": f"https://www.openstreetmap.org/{el.get('type')}/{el.get('id')}",
        "id": f"{el.get('type')}/{el.get('id')}",
        "lat": lat,
        "lon": lon,
        "fuente": "OpenStreetMap",
    }


# ---------------------------------------------------------------------------
# Salida Excel
# ---------------------------------------------------------------------------

COLUMNS = [
    ("nombre", "Nombre del bufete", 42),
    ("direccion", "Direccion", 48),
    ("cp", "C.P.", 8),
    ("telefono", "Telefono", 18),
    ("valoracion", "Valoracion", 11),
    ("resenas", "Nº resenas", 11),
    ("categoria", "Categoria", 22),
    ("estado", "Estado", 16),
    ("maps_url", "Ficha en el mapa", 34),
    ("lat", "Latitud", 11),
    ("lon", "Longitud", 11),
    ("id", "ID fuente", 30),
]


def write_xlsx(sin_web: list[dict], con_web: list[dict], path: str, meta: dict) -> None:
    from openpyxl import Workbook
    from openpyxl.styles import Alignment, Font, PatternFill
    from openpyxl.utils import get_column_letter

    wb = Workbook()

    head_fill = PatternFill("solid", fgColor="1F3864")
    head_font = Font(color="FFFFFF", bold=True, size=11)

    def sheet(ws, rows):
        for c, (_, title, width) in enumerate(COLUMNS, 1):
            cell = ws.cell(row=1, column=c, value=title)
            cell.fill = head_fill
            cell.font = head_font
            cell.alignment = Alignment(vertical="center", horizontal="center", wrap_text=True)
            ws.column_dimensions[get_column_letter(c)].width = width
        ws.row_dimensions[1].height = 28
        for r, item in enumerate(rows, 2):
            for c, (key, _, _) in enumerate(COLUMNS, 1):
                ws.cell(row=r, column=c, value=item.get(key, ""))
        ws.freeze_panes = "A2"
        if rows:
            ws.auto_filter.ref = f"A1:{get_column_letter(len(COLUMNS))}{len(rows) + 1}"

    ws1 = wb.active
    ws1.title = "Sin web"
    sheet(ws1, sin_web)

    ws2 = wb.create_sheet("Con web")
    sheet(ws2, con_web)

    ws3 = wb.create_sheet("Metodologia")
    ws3.column_dimensions["A"].width = 34
    ws3.column_dimensions["B"].width = 80
    ws3.cell(row=1, column=1, value="Campo").font = Font(bold=True)
    ws3.cell(row=1, column=2, value="Valor").font = Font(bold=True)
    for r, (k, v) in enumerate(meta.items(), 2):
        ws3.cell(row=r, column=1, value=k).font = Font(bold=True)
        ws3.cell(row=r, column=2, value=str(v)).alignment = Alignment(wrap_text=True, vertical="top")

    wb.save(path)


# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--area", choices=sorted(AREAS), default="m30",
                    help="zona a barrer (default m30)")
    ap.add_argument("--source", choices=["google", "osm"], default="google")
    ap.add_argument("--api-key", default=os.environ.get("GOOGLE_MAPS_API_KEY", ""))
    ap.add_argument("-o", "--output", default="bufetes_madrid_centro_sin_web.xlsx")
    ap.add_argument("--cell", type=float, default=800.0,
                    help="lado de la celda inicial en metros (default 800)")
    ap.add_argument("--min-cell", type=float, default=100.0,
                    help="lado minimo al subdividir, en metros (default 100)")
    ap.add_argument("--cache", default="",
                    help="fichero de progreso para poder reanudar")
    ap.add_argument("--json-out", default="", help="volcado crudo de los resultados")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    verbose = not args.quiet
    poly, zona_desc = AREAS[args.area]

    if args.source == "google":
        if not args.api_key:
            print("ERROR: falta la clave. Exporta GOOGLE_MAPS_API_KEY o usa --api-key.\n"
                  "Necesitas la Places API (New) habilitada en tu proyecto de Google Cloud.",
                  file=sys.stderr)
            return 2
        raw = fetch_google(args.api_key, poly, args.cell, args.min_cell,
                           verbose, args.cache)
        records = [normalize_google(p) for p in raw.values()]
        fuente_desc = "Google Places API (New), tipo 'lawyer'"
    else:
        elements = fetch_osm(poly, verbose)
        records = [normalize_osm(e) for e in elements]
        fuente_desc = "OpenStreetMap / Overpass API (office=lawyer)"

    # nos quedamos solo con lo que cae dentro del distrito Centro
    dentro = [r for r in records
              if r["lat"] is not None and r["lon"] is not None
              and point_in_polygon(r["lat"], r["lon"], poly)]
    fuera = len(records) - len(dentro)

    # descartamos los cerrados definitivamente
    activos = [r for r in dentro if r.get("estado") != "CLOSED_PERMANENTLY"]

    sin_web = sorted([r for r in activos if not r["web"].strip()],
                     key=lambda r: r["nombre"].lower())
    con_web = sorted([r for r in activos if r["web"].strip()],
                     key=lambda r: r["nombre"].lower())

    if args.json_out:
        with open(args.json_out, "w", encoding="utf-8") as fh:
            json.dump(records, fh, ensure_ascii=False, indent=2)

    meta = {
        "Zona": zona_desc,
        "Fuente de datos": fuente_desc,
        "Fecha de extraccion": time.strftime("%Y-%m-%d %H:%M"),
        "Total localizados en la zona": len(dentro),
        "Descartados por estar fuera del poligono": fuera,
        "Cerrados definitivamente (excluidos)": len(dentro) - len(activos),
        "SIN pagina web": len(sin_web),
        "CON pagina web": len(con_web),
        "Criterio 'sin web'": "La ficha del negocio no declara ningun sitio web. "
                              "Puede tener perfil en redes sociales o una web no enlazada; "
                              "conviene validar antes de usarlo comercialmente.",
        "Barrido": f"adaptativo, celda inicial {args.cell:.0f} m, minima {args.min_cell:.0f} m",
    }

    write_xlsx(sin_web, con_web, args.output, meta)
    print(f"OK -> {args.output}: {len(sin_web)} sin web / {len(activos)} despachos activos")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
