# Xolary — Sitio web corporativo

Landing page profesional, responsiva y optimizada para **Xolary**, empresa de
instalación de **placas y baterías solares** en Madrid.

## Stack

- ⚛️ **React 18** + **Vite 6** — desarrollo ultrarrápido con HMR
- 🎨 **Tailwind CSS v4** — sistema de diseño con paleta solar propia
- 🖼️ Ilustraciones e iconos **100 % SVG** (sin dependencias externas ni peticiones de red)
- ♿ HTML5 semántico, enfoque **mobile-first** y respeto por `prefers-reduced-motion`

## Puesta en marcha

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo -> http://localhost:5173
npm run build    # build de producción en /dist
npm run preview  # previsualizar el build
```

## Estructura

```
├─ index.html                 # HTML raíz + metadatos SEO
├─ public/
│  └─ favicon.svg             # icono (sol de Xolary)
└─ src/
   ├─ main.jsx                # punto de entrada
   ├─ index.css               # Tailwind v4 + sistema de diseño (tokens, animaciones)
   ├─ App.jsx                 # composición de la landing
   ├─ hooks/
   │  └─ useReveal.js         # animaciones de aparición al hacer scroll
   └─ components/
      ├─ Logo.jsx             # logo de Xolary (SVG)
      ├─ icons.jsx            # set de iconos SVG
      ├─ SolarArt.jsx         # ilustraciones de instalaciones solares
      ├─ Navbar.jsx           # navegación (Inicio, Baterías, Reseñas, Contacto)
      ├─ Hero.jsx             # titular + CTA + insignia 4,9/5 Google
      ├─ Services.jsx         # Placas · Baterías · Documentación
      ├─ Batteries.jsx        # sección destacada de baterías
      ├─ Gallery.jsx          # galería de instalaciones
      ├─ Testimonials.jsx     # reseñas reales de clientes
      ├─ Contact.jsx          # formulario de presupuesto + datos
      └─ Footer.jsx           # dirección, teléfono y más
```

## Contacto de Xolary

- 📍 C. del Conde de Aranda, 1, bajo derecha, Salamanca, 28001 Madrid
- ☎️ 910 60 67 16
- 🌐 [xolary.com](https://xolary.com)
- ⭐ 4,9/5 en Google (+260 reseñas)
