# Despacho Extra Legal — sitio web

Web estática de siete páginas para **Despacho Extra Legal**, abogados de extranjería en
C. de Serrano, 93, Of. 3E, 28006 Madrid.

Sin build, sin dependencias que instalar: se abre `index.html` en el navegador o se sube
la carpeta entera a cualquier hosting estático (GitHub Pages, Netlify, Vercel, un FTP).

---

## Antes de publicar

Estos puntos necesitan un dato real del despacho. Están marcados en el código con
`TODO`, `PENDIENTE` o una nota visible en la propia página.

| Qué | Dónde | Estado |
|---|---|---|
| **Enlace real de Calendly** | `https://calendly.com/` en las 8 páginas | Apunta a la home de Calendly, hay que sustituirlo |
| **Horario de atención** | `contacto.html` y `SCHEDULE` en `assets/js/main.js` | Puesto L–V 10:00–19:00. De Google solo consta «Apertura: 10:00 (lun)» — confirmar |
| **Equipo** | `despacho.html` | «Luis» (letrado) y «Arteaga» salen de las reseñas. Confirmar nombres completos, colegiación y funciones |
| **Correo, NIF y colegiación** | `aviso-legal.html` | Marcados como `PENDIENTE` |
| **Fotos** | ver abajo | Solo hay 2 imágenes, repetidas por el sitio |

Si cambia el horario, hay que tocarlo en **dos sitios**: la tabla de `contacto.html` y la
constante `SCHEDULE` de `assets/js/main.js`, que es la que calcula el indicador
«abierto / cerrado ahora» en hora de Madrid.

### Datos que ya son reales

Dirección, teléfono (662 45 71 85), coordenadas y plus code, valoración 4,9 sobre 182
reseñas, los temas de las reseñas (equipo 27, confianza 20, información 20, gestión 12),
las tres reseñas completas con la respuesta del despacho y la marca de espacio amigable
con la comunidad LGBTQ+. **No se ha inventado ninguna cifra de resultados ni de años de
experiencia**: no había fuente para ellas.

---

## Fotos

Solo se dispone de las dos fotos del perfil de Google. Se usan repartidas por todo el
sitio como «láminas» numeradas (Lám. 01 a Lám. 07) y se enlazan directamente a
`lh3.googleusercontent.com`.

**Cuando haya fotos propias**, lo recomendable es dejar de depender de Google:

1. Guardar las imágenes en `assets/img/`.
2. Buscar `lh3.googleusercontent.com` en los `.html` y sustituir cada `src`.
3. El atributo `data-fallback="assets/img/lamina.svg"` puede quedarse: es la lámina de
   respaldo que aparece si una imagen no carga, para que nunca se vea un hueco roto.

Los sitios donde encaja una foto nueva sin tocar nada más: la portada (`index.html`),
las láminas 03 y 04 de `servicios.html`, la 05 de `despacho.html`, la 06 de
`proceso.html` y la 07 de `contacto.html`, además de los dos retratos del equipo.

---

## Estructura

```
index.html          Portada
servicios.html      Doce áreas de extranjería (folios 001–012, con anclas propias)
despacho.html       Quiénes somos, equipo y compromisos
proceso.html        El método en seis pasos
resenas.html        4,9 · 182 reseñas, con las respuestas del despacho
recursos.html       Guías, 10 preguntas frecuentes y glosario
contacto.html       Formulario, datos, horario y cómo llegar
aviso-legal.html    Aviso legal y privacidad (plantilla a completar)

assets/css/style.css   Sistema de diseño y componentes comunes
assets/css/pages.css   Bloques propios de páginas interiores
assets/js/main.js      Toda la interacción
assets/img/            Lámina de respaldo y favicon
```

---

## El diseño

**Concepto: «El Expediente».** El mundo visual del cliente son los documentos oficiales
—sellos de registro, guilloches de visado, folios numerados, referencias mecanografiadas—.
La web toma ese lenguaje, que es justo lo que el cliente teme, y lo devuelve convertido en
algo calmado y caro.

**Color.** Verdinegro de tarjeta de residencia (`#0C2622`) sobre papel oficial
(`#ECEFE7`), con el violeta del tampón de registro (`#5A3FA6`) como único acento. El
latón (`#C8A24A`) queda reservado a las estrellas de la valoración y el verde jade
(`#3E8E78`) a los estados afirmativos.

**Tipografía.** *Newsreader* para los titulares (serif editorial de contraste alto, con
la cursiva como acento), *Hanken Grotesk* para el texto y *Courier Prime* en versalitas
para las referencias de expediente, que son el hilo conductor de todo el sitio.

**Elemento firma: el sello.** Un tampón circular en SVG que se imprime sobre la página
—baja, rebota y queda torcido— con el anillo de texto girando despacio. Aparece en la
portada con la nota de Google y cierra cada página en el bloque de llamada final.

Todos los colores, tamaños y tiempos están como variables CSS al principio de
`style.css`: cambiar la paleta entera es tocar seis líneas.

---

## Animación

Movimiento propio en JavaScript sin dependencias, más **GSAP + ScrollTrigger** desde CDN
para el paralaje y la expansión de las láminas.

- **Láminas que se expanden** (`data-gsap="expand"`): al entrar en pantalla el marco crece
  y la foto suelta su zoom, y sigue derivando despacio mientras cruza el encuadre.
- **Paralaje**: `data-parallax` en cualquier elemento, y deriva propia del guilloche.
- Portada de carga, cortina entre páginas, cursor propio, botones magnéticos, inclinación
  de láminas, revelados escalonados al desplazar, titulares que suben por líneas tras su
  máscara, contadores, cintas continuas, lámina que sigue al cursor sobre el índice de
  servicios, línea del expediente que se traza con el scroll, acordeones y barra de
  progreso de lectura.

**Si el CDN de GSAP no carga**, el paralaje cae a un motor propio en `requestAnimationFrame`
y las láminas se muestran en su estado final: la página funciona igual.

**`prefers-reduced-motion`** desactiva todo el movimiento y deja el contenido visible.

---

## Decisiones que conviene conocer

- **El formulario no tiene servidor.** Compone el mensaje y abre WhatsApp
  (662 45 71 85) para que sea la persona quien lo envíe. Así no hay datos personales
  almacenados en ningún sitio ni backend que mantener. Si en el futuro se quiere recibir
  por correo, se cambia el `submit` de `form()` en `main.js` por un `action` de Formspree,
  Netlify Forms o similar — y habrá que actualizar el punto 6 del aviso legal.
- **Sin JavaScript la web se sirve entera y legible.** Los estados ocultos de las
  animaciones cuelgan de la clase `.js`, que añade un script en línea en el `<head>`.
  Ninguna capa a pantalla completa puede quedarse tapando el contenido si algo falla.
- **`index.html` lleva datos estructurados** `LegalService` con dirección, coordenadas,
  horario y la valoración agregada, para la ficha de Google.
- Las reseñas se reproducen tal como se publicaron, con correcciones menores de
  puntuación, y se indica en la propia página que proceden del perfil público de Google.
- El contenido de `servicios.html` y `recursos.html` es divulgativo y lo advierte: la
  normativa de extranjería cambia a menudo.

---

## Publicar en GitHub Pages

Settings → Pages → Source: `Deploy from a branch`, rama y carpeta `/ (root)`.
No hace falta nada más: no hay proceso de compilación.
