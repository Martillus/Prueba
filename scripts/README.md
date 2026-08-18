# Bufetes de abogados sin web — Distrito Centro de Madrid

`madrid_abogados_sin_web.py` localiza todos los despachos de abogados del
distrito Centro de Madrid y genera un Excel separando los que **no tienen
página web** de los que sí.

## Qué zona cubre

Distrito Centro oficial: Palacio, Embajadores, Cortes, Justicia, Universidad y Sol.
El área se recorre con una rejilla de 202 celdas (separación 180 m, radio 140 m),
y cada resultado se filtra después contra el polígono del distrito, así que no se
cuelan despachos de Chamberí, Salamanca o Retiro.

## Uso

Instala la única dependencia:

    pip install openpyxl

### Opción A — Google Maps (recomendada, es la que refleja Google Maps)

Necesita una clave con **Places API (New)** habilitada en Google Cloud:

    export GOOGLE_MAPS_API_KEY="AIza..."
    python3 scripts/madrid_abogados_sin_web.py --source google -o bufetes.xlsx

Son unas 202 llamadas a Nearby Search por ejecución. Consulta el precio y el tramo
gratuito vigentes en la consola de Google Cloud antes de lanzarlo.

### Opción B — OpenStreetMap (gratis, sin clave)

    python3 scripts/madrid_abogados_sin_web.py --source osm -o bufetes.xlsx

Sin coste ni registro, pero OSM tiene bastantes menos despachos pequeños dados de
alta que Google, así que la lista sale más corta.

## Opciones

| Opción | Para qué sirve |
|---|---|
| `--source google\|osm` | Fuente de datos (por defecto `google`) |
| `--api-key` | Clave de Google si prefieres no usar la variable de entorno |
| `-o, --output` | Ruta del `.xlsx` de salida |
| `--spacing` / `--radius` | Densidad de la rejilla en metros |
| `--json-out` | Guarda además el volcado crudo en JSON |
| `--quiet` | Sin log de progreso |

Si al terminar avisa de que varias celdas devolvieron el máximo de 20 resultados,
baja `--spacing` y `--radius` (p. ej. `--spacing 120 --radius 95`) y repite: es la
señal de que alguna zona estaba saturada y podrían faltar despachos.

## Qué contiene el Excel

- **Sin web** — el listado que interesa.
- **Con web** — el resto, para contrastar.
- **Metodología** — fecha de extracción, fuente, totales y criterios aplicados.

Columnas: nombre, dirección, C.P., teléfono, valoración, nº de reseñas, categoría,
estado, ficha en el mapa, latitud, longitud e ID de origen.

## Una advertencia importante sobre el criterio

"Sin web" significa **que la ficha del negocio no declara ningún sitio web**. No es
exactamente lo mismo que no tener presencia online: hay despachos que solo usan
LinkedIn o Instagram, y otros que tienen web pero nunca la enlazaron en su ficha.
Antes de usar la lista comercialmente conviene validar una muestra a mano.

Los despachos marcados como cerrados definitivamente se excluyen automáticamente.
