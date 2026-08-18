#!/usr/bin/env python3
"""
Extrae los bufetes de abogados del distrito Centro de Madrid y genera un Excel
con los que NO tienen pagina web.

Fuentes soportadas:
  --source google    Google Places API (New). Refleja lo que se ve en Google Maps.
                     Requiere clave en GOOGLE_MAPS_API_KEY o --api-key.
  --source osm       OpenStreetMap via Overpass API. Gratis y sin clave, pero la
                     cobertura de despachos pequenos es menor que la de Google.

Uso tipico:
    export GOOGLE_MAPS_API_KEY="AIza..."
    python3 scripts/madrid_abogados_sin_web.py --source google -o bufetes.xlsx

    python3 scripts/madrid_abogados_sin_web.py --source osm -o bufetes.xlsx
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


def build_grid(poly: list[tuple[float, float]], spacing_m: float) -> list[tuple[float, float]]:
    """Rejilla de centros de busqueda que cubre el poligono."""
    min_lat, min_lon, max_lat, max_lon = polygon_bbox(poly)
    mid_lat = (min_lat + max_lat) / 2
    d_lat = spacing_m / LAT_M
    d_lon = spacing_m / lon_m(mid_lat)

    # margen de una celda para que los circulos cubran tambien el borde
    points = []
    lat = min_lat - d_lat
    while lat <= max_lat + d_lat:
        lon = min_lon - d_lon
        while lon <= max_lon + d_lon:
            # nos quedamos con la celda si su centro o alguna esquina cae dentro
            corners = [
                (lat, lon),
                (lat + d_lat / 2, lon), (lat - d_lat / 2, lon),
                (lat, lon + d_lon / 2), (lat, lon - d_lon / 2),
            ]
            if any(point_in_polygon(a, b, poly) for a, b in corners):
                points.append((lat, lon))
            lon += d_lon
        lat += d_lat
    return points


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


def fetch_google(api_key: str, poly, spacing_m: float, radius_m: float,
                 verbose: bool = True) -> dict[str, dict]:
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": FIELD_MASK,
    }
    grid = build_grid(poly, spacing_m)
    if verbose:
        print(f"[google] {len(grid)} celdas de busqueda (radio {radius_m:.0f} m)", file=sys.stderr)

    found: dict[str, dict] = {}
    saturated = 0
    for i, (lat, lon) in enumerate(grid, 1):
        payload = {
            "includedTypes": ["lawyer"],
            "maxResultCount": 20,
            "languageCode": "es",
            "regionCode": "ES",
            "locationRestriction": {
                "circle": {"center": {"latitude": lat, "longitude": lon}, "radius": radius_m}
            },
        }
        data = _post_json(PLACES_URL, payload, headers)
        places = data.get("places", [])
        if len(places) >= 20:
            saturated += 1
        for p in places:
            pid = p.get("id")
            if pid:
                found[pid] = p
        if verbose and i % 10 == 0:
            print(f"[google] celda {i}/{len(grid)} - {len(found)} despachos unicos",
                  file=sys.stderr)
        time.sleep(0.06)

    if verbose and saturated:
        print(f"[google] AVISO: {saturated} celdas devolvieron el maximo de 20 resultados. "
              f"Reduce --spacing/--radius para no perder despachos.", file=sys.stderr)
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

OVERPASS_QUERY = """
[out:json][timeout:120];
area["name"="Madrid"]["admin_level"="7"]->.m;
area["name"="Centro"]["admin_level"="9"](area.m)->.c;
(
  nwr["office"="lawyer"](area.c);
  nwr["amenity"="lawyer"](area.c);
  nwr["shop"="lawyer"](area.c);
);
out center tags;
"""


def fetch_osm(verbose: bool = True) -> list[dict]:
    data_enc = urllib.parse.urlencode({"data": OVERPASS_QUERY}).encode()
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
    ap.add_argument("--source", choices=["google", "osm"], default="google")
    ap.add_argument("--api-key", default=os.environ.get("GOOGLE_MAPS_API_KEY", ""))
    ap.add_argument("-o", "--output", default="bufetes_madrid_centro_sin_web.xlsx")
    ap.add_argument("--spacing", type=float, default=180.0,
                    help="separacion de la rejilla en metros (default 180)")
    ap.add_argument("--radius", type=float, default=140.0,
                    help="radio de cada busqueda en metros (default 140)")
    ap.add_argument("--json-out", default="", help="volcado crudo de los resultados")
    ap.add_argument("--quiet", action="store_true")
    args = ap.parse_args()

    verbose = not args.quiet

    if args.source == "google":
        if not args.api_key:
            print("ERROR: falta la clave. Exporta GOOGLE_MAPS_API_KEY o usa --api-key.\n"
                  "Necesitas la Places API (New) habilitada en tu proyecto de Google Cloud.",
                  file=sys.stderr)
            return 2
        raw = fetch_google(args.api_key, CENTRO_POLYGON, args.spacing, args.radius, verbose)
        records = [normalize_google(p) for p in raw.values()]
        fuente_desc = "Google Places API (New), tipo 'lawyer'"
    else:
        elements = fetch_osm(verbose)
        records = [normalize_osm(e) for e in elements]
        fuente_desc = "OpenStreetMap / Overpass API (office=lawyer)"

    # nos quedamos solo con lo que cae dentro del distrito Centro
    dentro = [r for r in records
              if r["lat"] is not None and r["lon"] is not None
              and point_in_polygon(r["lat"], r["lon"], CENTRO_POLYGON)]
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
        "Zona": "Distrito Centro de Madrid (Palacio, Embajadores, Cortes, Justicia, Universidad, Sol)",
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
        "Rejilla": f"separacion {args.spacing:.0f} m, radio {args.radius:.0f} m",
    }

    write_xlsx(sin_web, con_web, args.output, meta)
    print(f"OK -> {args.output}: {len(sin_web)} sin web / {len(activos)} despachos activos")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
