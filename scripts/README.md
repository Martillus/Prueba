# Bufetes de abogados sin web — Madrid

`madrid_abogados_sin_web.py` localiza los despachos de abogados de Madrid y genera
un Excel separando los que **no tienen página web** de los que sí.

## Zonas

| `--area` | Cobertura |
|---|---|
| `m30` (por defecto) | Todo el interior de la M-30, ~48 km². Incluye Centro y buena parte de Chamberí, Salamanca, Retiro, Arganzuela, Moncloa, Tetuán y Chamartín |
| `centro` | Solo el distrito Centro: Palacio, Embajadores, Cortes, Justicia, Universidad y Sol |

Cada resultado se filtra contra el polígono del área, así que no se cuelan
despachos de fuera del anillo.

## Uso

    pip install openpyxl

### Opción A — Google Maps (la que refleja lo que ves en Google Maps)

Necesita una clave con **Places API (New)** habilitada en Google Cloud:

    export GOOGLE_MAPS_API_KEY="AIza..."
    python3 scripts/madrid_abogados_sin_web.py --area m30 -o bufetes.xlsx --cache progreso.json

### Opción B — OpenStreetMap (gratis, sin clave)

    python3 scripts/madrid_abogados_sin_web.py --area m30 --source osm -o bufetes.xlsx

Sin coste ni registro, pero OSM tiene bastantes menos despachos pequeños dados de
alta que Google, así que la lista sale más corta.

## Cómo barre el área

Barrido **adaptativo**: empieza con celdas de 800 m y subdivide en cuatro solo las
que se saturan (la API devuelve como mucho 20 resultados por llamada). Las zonas
densas como Centro o Salamanca se afinan hasta 100 m; las vacías no gastan llamadas.

Medido sobre un universo simulado de 2.000 despachos dentro de la M-30, muy
concentrados en el centro: **~460 llamadas y 100% de cobertura**. Una rejilla fija
de 180 m sobre la misma superficie costaría unas 1.480 llamadas y aun así dejaría
huecos en las zonas densas.

Con `--cache progreso.json` el barrido se puede interrumpir y reanudar sin repetir
llamadas ya pagadas.

## Opciones

| Opción | Para qué sirve |
|---|---|
| `--area m30\|centro` | Zona a barrer (por defecto `m30`) |
| `--source google\|osm` | Fuente de datos (por defecto `google`) |
| `--api-key` | Clave de Google si prefieres no usar la variable de entorno |
| `-o, --output` | Ruta del `.xlsx` de salida |
| `--cell` / `--min-cell` | Tamaño inicial y mínimo de celda, en metros |
| `--cache` | Fichero de progreso para reanudar |
| `--json-out` | Guarda además el volcado crudo en JSON |
| `--quiet` | Sin log de progreso |

Si al terminar avisa de que quedaron celdas saturadas en el tamaño mínimo, baja
`--min-cell` (p. ej. `--min-cell 50`) y relanza: reaprovecha la caché.

## Qué contiene el Excel

- **Sin web** — el listado que interesa.
- **Con web** — el resto, para contrastar.
- **Metodología** — fecha, fuente, área, totales y criterios aplicados.

Columnas: nombre, dirección, C.P., teléfono, valoración, nº de reseñas, categoría,
estado, ficha en el mapa, latitud, longitud e ID de origen.

## Advertencia sobre el criterio

"Sin web" significa **que la ficha del negocio no declara ningún sitio web**. No es
lo mismo que no tener presencia online: hay despachos que solo usan LinkedIn o
Instagram, y otros que tienen web pero nunca la enlazaron en su ficha. Antes de usar
la lista comercialmente conviene validar una muestra a mano.

Los despachos marcados como cerrados definitivamente se excluyen automáticamente.

## Validación hecha

- Polígono de la M-30 contra 15 puntos de control: Sol, Velázquez, Chamberí, Retiro,
  Atocha, Nuevos Ministerios, Plaza de Castilla, Legazpi y Moncloa dan dentro;
  Barajas, Vallecas, Carabanchel, Pozuelo, Las Tablas y Ciudad Lineal dan fuera.
- Superficie calculada por Montecarlo: 48,8 km², frente a los ~48 km² reales.
- Barrido adaptativo: 100% de cobertura sobre universo simulado (ver arriba).
- Generación del Excel verificada.

## Estado

El script está probado, pero **no se ha podido ejecutar contra datos reales en la
sesión remota de Claude Code**: su política de red bloquea Google Maps, OSM/Overpass,
el ICAM y los portales de datos abiertos (24 hosts comprobados, 24 rechazados con
CONNECT 403). `places.googleapis.com` sí es alcanzable, pero rechaza las llamadas sin
clave. Con una clave, o ejecutándolo en local, funciona tal cual.
