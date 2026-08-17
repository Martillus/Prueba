import { useEffect, useRef } from 'react'

/* ============================================================
   HERO — Despiece de un coche controlado por scroll
   El scroll dentro de la sección (0 → 1) separa las piezas en
   oleadas: carrocería, cristales, habitáculo y mecánica.
   ============================================================ */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/* Centro del conjunto: la "cámara" se aleja escalando sobre este punto */
const VIEW = { w: 1200, h: 560, cx: 604, cy: 300 }
const SCALE_END = 0.56

/* Geometría base del vehículo (suelo del estudio en y = 430) */
const WHEEL = { r: 88, cy: 342, front: 300, rear: 900 }

/* Contorno de la carrocería: cuña baja de motor central */
const OUTLINE = `
M 95 322
C 95 300 104 288 124 282
C 165 268 210 246 248 228
C 264 220 280 217 300 217
C 326 217 348 225 368 234
L 416 240
C 436 243 448 243 456 242
C 486 214 528 180 578 164
L 672 158
C 742 160 802 182 852 210
C 890 216 960 220 1040 226
L 1092 232
C 1112 236 1122 248 1122 268
L 1122 336
C 1122 366 1112 386 1092 392
L 380 394
C 262 394 156 390 122 384
C 100 378 95 348 95 322 Z`

/* Solo el labio superior del paso de rueda: evita el aro completo */
const ARCH_LIPS = `M 205 342 A 95 95 0 0 0 395 342 M 805 342 A 95 95 0 0 0 995 342`

/* Invernadero: tres lunas separadas por pilares finos (A y B).
   Se restan de los paneles, así el pilar es chapa de verdad. */
const GLASS_WS = `M 458 242 C 486 214 522 182 556 168 L 588 164
  C 554 184 518 212 494 242 Z`
const GLASS_SIDE = `M 506 242 L 596 166 L 662 160 L 674 238 Z`
const GLASS_REAR = `M 688 237 L 682 161 C 742 166 794 186 846 212 L 852 224
  C 790 230 740 234 688 237 Z`
const CANOPY = `${GLASS_WS} ${GLASS_SIDE} ${GLASS_REAR}`

/* Reflejos comunes: se recortan a cada panel, así el brillo es continuo */
const HL_TOP = `M 100 290 C 270 242 470 204 690 200 C 900 196 1040 222 1124 254
  L 1124 278 C 1040 244 890 224 690 224 C 470 226 270 260 100 310 Z`
const HL_BOTTOM = `M 100 374 C 320 386 600 392 890 388 C 1010 386 1080 380 1124 370
  L 1124 400 C 1060 410 970 414 890 414 C 600 418 320 412 100 402 Z`
/* Línea de carácter: el pliegue que recorre el costado */
const CREASE = `M 140 296 C 320 274 520 260 740 256 C 920 254 1040 260 1122 272`

/* Regiones de corte: definen dónde empieza y acaba cada panel.
   Techo y aleta trasera llevan restadas las lunas. */
const REGIONS = {
  'r-splitter': 'M 40 370 L 212 370 L 212 430 L 40 430 Z',
  'r-front-bumper': 'M 40 180 L 200 180 L 200 372 L 40 372 Z',
  'r-front-fender': 'M 200 130 L 372 130 L 372 300 L 456 300 L 456 384 L 200 384 Z',
  'r-hood': 'M 372 120 L 456 120 L 456 300 L 372 300 Z',
  'r-roof': `M 456 120 L 770 120 L 770 258 L 456 258 Z ${CANOPY}`,
  'r-door': 'M 456 258 L 770 258 L 770 384 L 456 384 Z',
  'r-rear-quarter': `M 770 120 L 1046 120 L 1046 384 L 770 384 Z ${CANOPY}`,
  'r-rear-bumper': 'M 1042 180 L 1180 180 L 1180 372 L 1042 372 Z',
  'r-skirt': 'M 200 384 L 1046 384 L 1046 430 L 200 430 Z',
  'r-diffuser': 'M 1042 372 L 1180 372 L 1180 430 L 1042 430 Z',
}

/**
 * Cada pieza: centro de giro, desplazamiento final (unidades del viewBox),
 * rotación y ventana de scroll en la que se separa. El escalonado reproduce
 * un despiece real: primero la piel, al final la mecánica.
 */
const PARTS = [
  // — Carrocería exterior
  { id: 'splitter', cx: 150, cy: 386, dx: -300, dy: 150, rot: -6, start: 0.0, end: 0.34 },
  { id: 'skirt', cx: 620, cy: 392, dx: 40, dy: 120, rot: 2, start: 0.04, end: 0.4 },
  { id: 'front-bumper', cx: 140, cy: 310, dx: -380, dy: 40, rot: -8, start: 0.02, end: 0.38 },
  { id: 'headlight', cx: 185, cy: 268, dx: -300, dy: -110, rot: -10, start: 0.04, end: 0.4 },
  { id: 'front-fender', cx: 288, cy: 284, dx: -215, dy: -175, rot: -6, start: 0.06, end: 0.44 },
  { id: 'hood', cx: 414, cy: 256, dx: -70, dy: -220, rot: -4, start: 0.08, end: 0.46 },
  { id: 'mirror', cx: 492, cy: 240, dx: -120, dy: -60, rot: 12, start: 0.1, end: 0.46 },
  { id: 'door', cx: 612, cy: 322, dx: -55, dy: 165, rot: 3, start: 0.1, end: 0.48 },
  { id: 'rear-quarter', cx: 900, cy: 284, dx: 300, dy: -170, rot: 6, start: 0.12, end: 0.5 },
  { id: 'spoiler', cx: 1076, cy: 226, dx: 380, dy: -130, rot: 10, start: 0.14, end: 0.5 },
  { id: 'rear-bumper', cx: 1090, cy: 312, dx: 400, dy: 30, rot: 8, start: 0.14, end: 0.52 },
  { id: 'taillight', cx: 1088, cy: 272, dx: 330, dy: -70, rot: 8, start: 0.16, end: 0.52 },
  { id: 'diffuser', cx: 1080, cy: 392, dx: 370, dy: 140, rot: 6, start: 0.16, end: 0.52 },
  { id: 'roof', cx: 600, cy: 194, dx: 120, dy: -240, rot: -3, start: 0.18, end: 0.56 },
  // — Cristales
  { id: 'glass-front', cx: 520, cy: 202, dx: -20, dy: -180, rot: -8, start: 0.26, end: 0.62 },
  { id: 'glass-side', cx: 590, cy: 198, dx: 130, dy: -140, rot: -4, start: 0.28, end: 0.64 },
  { id: 'glass-rear', cx: 770, cy: 196, dx: 250, dy: -215, rot: 6, start: 0.3, end: 0.66 },
  // — Habitáculo
  { id: 'seats', cx: 595, cy: 282, dx: 60, dy: -55, rot: -6, start: 0.36, end: 0.72 },
  { id: 'dash', cx: 505, cy: 275, dx: -110, dy: -35, rot: -8, start: 0.38, end: 0.74 },
  { id: 'steering', cx: 518, cy: 290, dx: -175, dy: 30, rot: -14, start: 0.38, end: 0.74 },
  { id: 'fuel-cell', cx: 735, cy: 330, dx: 15, dy: 55, rot: 4, start: 0.4, end: 0.76 },
  // — Mecánica
  { id: 'radiator', cx: 158, cy: 330, dx: -250, dy: 120, rot: -6, start: 0.44, end: 0.8 },
  { id: 'engine', cx: 840, cy: 312, dx: 80, dy: -145, rot: -5, start: 0.48, end: 0.84 },
  { id: 'transaxle', cx: 945, cy: 330, dx: 235, dy: -80, rot: 6, start: 0.5, end: 0.86 },
  { id: 'exhaust', cx: 965, cy: 370, dx: 175, dy: 165, rot: 4, start: 0.52, end: 0.88 },
  { id: 'susp-front', cx: 300, cy: 342, dx: -300, dy: 55, rot: -8, start: 0.54, end: 0.88 },
  { id: 'susp-rear', cx: 900, cy: 342, dx: 300, dy: 75, rot: 8, start: 0.56, end: 0.9 },
  { id: 'wheel-front', cx: 300, cy: 342, dx: -125, dy: 135, rot: -22, start: 0.58, end: 0.94 },
  { id: 'wheel-rear', cx: 900, cy: 342, dx: 55, dy: 135, rot: 22, start: 0.6, end: 0.96 },
  { id: 'chassis', cx: 604, cy: 350, dx: -10, dy: 10, rot: 0, start: 0.6, end: 0.96 },
]

const PHASES = [
  { at: 0.0, label: 'Vehículo completo' },
  { at: 0.12, label: 'Carrocería' },
  { at: 0.3, label: 'Cristales' },
  { at: 0.46, label: 'Habitáculo' },
  { at: 0.62, label: 'Mecánica' },
  { at: 0.88, label: 'Despiece completo' },
]

export default function CarHero() {
  const trackRef = useRef(null)
  const assemblyRef = useRef(null)
  const parts = useRef({})
  const shutRef = useRef(null)
  const shadowRef = useRef(null)
  const wellsRef = useRef(null)
  const introRef = useRef(null)
  const cueRef = useRef(null)
  const hudRef = useRef(null)
  const outroRef = useRef(null)
  const barRef = useRef(null)
  const pctRef = useRef(null)
  const phaseRef = useRef(null)
  const countRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0

    const apply = (p) => {
      // La cámara se aleja mientras las piezas se separan
      const s = 1 - (1 - SCALE_END) * easeInOut(p)
      if (assemblyRef.current) assemblyRef.current.style.transform = `scale(${s})`

      let detached = 0
      for (const part of PARTS) {
        const el = parts.current[part.id]
        if (!el) continue
        const lp = easeOut(clamp01((p - part.start) / (part.end - part.start)))
        if (lp > 0.02) detached += 1
        el.style.transform = `translate(${part.dx * lp}px, ${part.dy * lp}px) rotate(${part.rot * lp}deg)`
      }

      // Las juntas de chapa y la sombra del suelo desaparecen al abrirse
      if (shutRef.current) shutRef.current.style.opacity = `${1 - clamp01(p / 0.08)}`
      if (shadowRef.current) shadowRef.current.style.opacity = `${0.55 * (1 - clamp01(p / 0.45))}`
      if (wellsRef.current) wellsRef.current.style.opacity = `${1 - clamp01((p - 0.06) / 0.34)}`

      // Capas de texto
      const fade = (el, v) => { if (el) el.style.opacity = `${v}` }
      fade(introRef.current, 1 - clamp01(p / 0.14))
      fade(cueRef.current, 1 - clamp01(p / 0.07))
      fade(hudRef.current, clamp01((p - 0.06) / 0.12) * (1 - clamp01((p - 0.94) / 0.06)))
      fade(outroRef.current, clamp01((p - 0.9) / 0.08))
      if (introRef.current) {
        introRef.current.style.transform = `translateY(${-40 * easeOut(clamp01(p / 0.2))}px)`
      }

      // HUD: fase, progreso y piezas separadas
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
      if (pctRef.current) pctRef.current.textContent = `${Math.round(p * 100)}%`
      if (countRef.current) countRef.current.textContent = `${detached} / ${PARTS.length}`
      if (phaseRef.current) {
        let label = PHASES[0].label
        for (const ph of PHASES) if (p >= ph.at) label = ph.label
        if (phaseRef.current.textContent !== label) phaseRef.current.textContent = label
      }
    }

    const read = () => {
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      apply(clamp01(total > 0 ? -rect.top / total : 0))
    }

    if (reduce) {
      // Sin movimiento: se muestra el coche montado, sin animar con el scroll
      apply(0)
      return
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const setPart = (id) => (el) => { if (el) parts.current[id] = el }
  const origin = (id) => {
    const p = PARTS.find((x) => x.id === id)
    return { transformOrigin: `${p.cx}px ${p.cy}px`, willChange: 'transform' }
  }
  /**
   * Panel de carrocería: dibuja la silueta completa y la recorta a su región,
   * de modo que el degradado y los reflejos son continuos en todo el coche y
   * cada pieza conserva su sombreado al separarse.
   */
  const Panel = ({ id, region }) => (
    <g ref={setPart(id)} style={origin(id)} clipPath={`url(#${region})`}>
      <g mask="url(#body)">
        <path d={OUTLINE} fill="url(#silver)" />
        <path d={HL_TOP} fill="#ffffff" opacity="0.55" />
        <path d={HL_BOTTOM} fill="#0b1116" opacity="0.16" />
        <path d={CREASE} fill="none" stroke="#ffffff" strokeWidth="3.5" opacity="0.6" />
        <path d={CREASE} fill="none" stroke="#5f676e" strokeWidth="1.6" opacity="0.5" transform="translate(0 5)" />
        {/* Canto de corte: hace legible cada pieza al despegarse */}
        <path d={REGIONS[region]} fill="none" stroke="#767e85" strokeWidth="2.4" opacity="0.7" />
        <path d={OUTLINE} fill="none" stroke="#5c646b" strokeWidth="1.8" opacity="0.6" />
        <path d={ARCH_LIPS} fill="none" stroke="#4e565d" strokeWidth="2.2" opacity="0.65" />
      </g>
    </g>
  )

  return (
    <section id="inicio" className="relative">
      <div ref={trackRef} className="h-[320vh] sm:h-[400vh]">
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Fondo de estudio */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 85% at 50% 38%, #e4e7ea 0%, #cfd4d8 38%, #a8aeb4 72%, #83898f 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(75% 55% at 50% 42%, rgba(255,255,255,0.55), transparent 70%)' }}
          />

          {/* Escenario del despiece. El SVG desborda a propósito (overflow
              visible) para que en móvil las piezas usen el alto disponible. */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
              className="w-full"
              style={{ overflow: 'visible', maxHeight: '100%' }}
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label="Coche deportivo que se desmonta en sus componentes al hacer scroll"
            >
              <defs>
                {/* Máscara del cuerpo: el contorno en blanco menos los pasos de
                    rueda en negro. Una máscara resta de verdad; un clipPath solo
                    puede unir, y con evenodd la parte del disco que sobresale por
                    debajo del bajo se rellenaba. */}
                <mask id="body" maskUnits="userSpaceOnUse" x="0" y="0" width={VIEW.w} height={VIEW.h}>
                  <path d={OUTLINE} fill="#ffffff" />
                  {[WHEEL.front, WHEEL.rear].map((x) => (
                    <circle key={x} cx={x} cy={WHEEL.cy} r="95" fill="#000000" />
                  ))}
                </mask>
                {/* Nada del vehículo se dibuja por debajo del suelo */}
                <clipPath id="above-ground" clipPathUnits="userSpaceOnUse">
                  <rect x="0" y="0" width={VIEW.w} height="429" />
                </clipPath>
                {Object.entries(REGIONS).map(([id, d]) => (
                  <clipPath key={id} id={id} clipPathUnits="userSpaceOnUse">
                    <path d={d} clipRule="evenodd" />
                  </clipPath>
                ))}

                {/* Chapa: claro arriba (cielo), banda oscura en el horizonte y
                    rebote del suelo abajo — así el plateado parece metálico */}
                <linearGradient id="silver" x1="0" y1="160" x2="0" y2="430" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#fdfefe" />
                  <stop offset="0.26" stopColor="#e6ebee" />
                  <stop offset="0.42" stopColor="#b6bec5" />
                  <stop offset="0.6" stopColor="#7f878f" />
                  <stop offset="0.82" stopColor="#949ca3" />
                  <stop offset="1" stopColor="#b4bbc1" />
                </linearGradient>
                <linearGradient id="glass" x1="0" y1="165" x2="0" y2="260" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#66737e" />
                  <stop offset="1" stopColor="#1f262c" />
                </linearGradient>
                <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#5b636b" />
                  <stop offset="1" stopColor="#24292f" />
                </linearGradient>
                <linearGradient id="steelLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#c3cad0" />
                  <stop offset="1" stopColor="#7d858c" />
                </linearGradient>
                <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#fcd34d" />
                  <stop offset="1" stopColor="#f97316" />
                </linearGradient>
                <radialGradient id="tyre" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0.62" stopColor="#20242a" />
                  <stop offset="0.9" stopColor="#31373e" />
                  <stop offset="1" stopColor="#171b20" />
                </radialGradient>
                <radialGradient id="disc" cx="0.42" cy="0.38" r="0.7">
                  <stop offset="0" stopColor="#8b939a" />
                  <stop offset="1" stopColor="#3c4249" />
                </radialGradient>
                <linearGradient id="rim" x1="0" y1="0" x2="0.4" y2="1">
                  <stop offset="0" stopColor="#eef1f3" />
                  <stop offset="1" stopColor="#959ca3" />
                </linearGradient>
                <radialGradient id="floor" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#33383d" stopOpacity="0.75" />
                  <stop offset="1" stopColor="#33383d" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Sombra en el suelo del estudio */}
              <g ref={shadowRef} opacity="0.55">
                <ellipse cx="604" cy="424" rx="510" ry="30" fill="url(#floor)" />
                <ellipse cx="604" cy="416" rx="330" ry="14" fill="#20252a" opacity="0.45" />
              </g>

              <g ref={assemblyRef} style={{ transformOrigin: `${VIEW.cx}px ${VIEW.cy}px`, willChange: 'transform' }}>
                {/* Interior del paso de rueda: sin él, el hueco deja ver el
                    fondo claro y la rueda parece recortada */}
                <g ref={wellsRef} clipPath="url(#above-ground)">
                  {[WHEEL.front, WHEEL.rear].map((x) => (
                    <circle key={x} cx={x} cy={WHEEL.cy} r="94" fill="#191d22" />
                  ))}
                </g>

                {/* ---------- MECÁNICA (bajo la carrocería) ---------- */}
                <g ref={setPart('chassis')} style={origin('chassis')}>
                  <path
                    d="M 214 336 L 296 326 L 350 320 L 466 314 L 478 292 L 700 288 L 716 314 L 866 318 L 984 328 L 1006 344
                       L 1006 378 L 962 390 L 260 390 L 212 368 Z"
                    fill="url(#steel)"
                  />
                  <path d="M 248 344 L 470 330 L 700 326 L 964 338 L 988 350 L 988 370 L 260 374 Z" fill="#41474e" />
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={i} x1={300 + i * 64} y1="334" x2={300 + i * 64} y2="386" stroke="#20252a" strokeWidth="2" opacity="0.6" />
                  ))}
                  <path d="M 470 314 L 700 310 L 700 292 L 478 296 Z" fill="#5a626a" />
                </g>

                <g ref={setPart('radiator')} style={origin('radiator')}>
                  <rect x="118" y="296" width="82" height="70" rx="5" fill="url(#steel)" />
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line key={i} x1="124" y1={303 + i * 8} x2="194" y2={303 + i * 8} stroke="#8f979e" strokeWidth="2.5" opacity="0.7" />
                  ))}
                  <rect x="112" y="291" width="94" height="9" rx="4" fill="url(#steelLight)" />
                </g>

                <g ref={setPart('fuel-cell')} style={origin('fuel-cell')}>
                  <rect x="698" y="300" width="76" height="60" rx="9" fill="#4a5158" />
                  <rect x="704" y="306" width="64" height="48" rx="6" fill="url(#steel)" />
                  <circle cx="736" cy="296" r="7" fill="url(#steelLight)" />
                </g>

                <g ref={setPart('engine')} style={origin('engine')}>
                  {/* Colectores de admisión */}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <rect key={i} x={786 + i * 18} y="274" width="12" height="16" rx="3" fill="url(#steelLight)" />
                  ))}
                  <path d="M 778 288 L 902 288 L 908 304 L 772 304 Z" fill="#6d757c" />
                  <path d="M 774 302 L 906 302 L 902 346 L 778 346 Z" fill="url(#steel)" />
                  <path d="M 784 308 L 896 308 L 892 330 L 788 330 Z" fill="#565e66" />
                  <circle cx="802" cy="338" r="9" fill="#767e86" />
                  <circle cx="870" cy="338" r="9" fill="#767e86" />
                  <rect x="840" y="266" width="26" height="10" rx="3" fill="url(#accent)" opacity="0.85" />
                </g>

                <g ref={setPart('transaxle')} style={origin('transaxle')}>
                  <path d="M 906 308 L 974 312 L 982 340 L 968 356 L 904 352 Z" fill="url(#steel)" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line key={i} x1={916 + i * 13} y1="312" x2={916 + i * 13} y2="352" stroke="#8f979e" strokeWidth="2" opacity="0.55" />
                  ))}
                </g>

                <g ref={setPart('exhaust')} style={origin('exhaust')}>
                  <path
                    d="M 792 348 C 832 358 882 366 932 368 L 1018 368"
                    fill="none" stroke="url(#steelLight)" strokeWidth="11" strokeLinecap="round"
                  />
                  <rect x="1016" y="354" width="82" height="30" rx="12" fill="url(#steelLight)" />
                  <circle cx="1110" cy="362" r="9" fill="#3a4046" stroke="#c3cad0" strokeWidth="3" />
                  <circle cx="1110" cy="380" r="9" fill="#3a4046" stroke="#c3cad0" strokeWidth="3" />
                </g>

                {[['susp-front', WHEEL.front], ['susp-rear', WHEEL.rear]].map(([id, x]) => (
                  <g key={id} ref={setPart(id)} style={origin(id)}>
                    <path d={`M ${x - 68} 310 L ${x - 8} 328`} stroke="url(#steelLight)" strokeWidth="9" strokeLinecap="round" />
                    <path d={`M ${x - 68} 380 L ${x - 6} 360`} stroke="url(#steelLight)" strokeWidth="9" strokeLinecap="round" />
                    <path d={`M ${x - 48} 294 L ${x - 16} 366`} stroke="#6d757c" strokeWidth="12" strokeLinecap="round" />
                    <path d={`M ${x - 48} 294 L ${x - 16} 366`} stroke="url(#accent)" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
                    <rect x={x - 14} y="316" width="18" height="54" rx="6" fill="url(#steel)" />
                  </g>
                ))}

                {/* ---------- HABITÁCULO ---------- */}
                <g ref={setPart('seats')} style={origin('seats')}>
                  {[558, 602].map((x) => (
                    <g key={x}>
                      <path
                        d={`M ${x} 258 C ${x - 4} 238 ${x + 10} 228 ${x + 28} 230 C ${x + 44} 234 ${x + 46} 252 ${x + 42} 268
                            L ${x + 44} 322 L ${x - 2} 324 Z`}
                        fill="#3c434a"
                      />
                      <path
                        d={`M ${x + 6} 252 C ${x + 4} 240 ${x + 14} 234 ${x + 26} 236 C ${x + 36} 240 ${x + 38} 252 ${x + 34} 264
                            L ${x + 36} 314 L ${x + 4} 316 Z`}
                        fill="#4e565e"
                      />
                    </g>
                  ))}
                </g>

                <g ref={setPart('dash')} style={origin('dash')}>
                  <path d="M 470 258 L 542 250 L 550 288 L 470 292 Z" fill="#3c434a" />
                  <rect x="486" y="262" width="40" height="14" rx="4" fill="url(#steelLight)" opacity="0.8" />
                </g>

                <g ref={setPart('steering')} style={origin('steering')}>
                  <circle cx="518" cy="290" r="23" fill="none" stroke="#2f353b" strokeWidth="7" />
                  <circle cx="518" cy="290" r="6" fill="#555d65" />
                  <line x1="498" y1="286" x2="538" y2="294" stroke="#2f353b" strokeWidth="5" />
                </g>

                {/* ---------- RUEDAS ---------- */}
                {[['wheel-front', WHEEL.front], ['wheel-rear', WHEEL.rear]].map(([id, x]) => (
                  <g key={id} ref={setPart(id)} style={origin(id)}>
                    <circle cx={x} cy={WHEEL.cy} r={WHEEL.r} fill="url(#tyre)" />
                    <circle cx={x} cy={WHEEL.cy} r={WHEEL.r - 2} fill="none" stroke="#12161a" strokeWidth="2" opacity="0.8" />
                    <circle cx={x} cy={WHEEL.cy} r="68" fill="none" stroke="#101418" strokeWidth="4" opacity="0.6" />
                    <circle cx={x} cy={WHEEL.cy} r="60" fill="url(#disc)" />
                    {Array.from({ length: 20 }).map((_, i) => (
                      <line
                        key={i}
                        x1={x} y1={WHEEL.cy} x2={x} y2={WHEEL.cy - 58}
                        stroke="#2b3137" strokeWidth="1.4" opacity="0.5"
                        transform={`rotate(${i * 18} ${x} ${WHEEL.cy})`}
                      />
                    ))}
                    <path
                      d={`M ${x - 10} ${WHEEL.cy - 60} a 60 60 0 0 0 -40 27 l 17 12 a 43 43 0 0 1 28 -20 Z`}
                      fill="url(#accent)"
                    />
                    <circle cx={x} cy={WHEEL.cy} r="62" fill="none" stroke="url(#rim)" strokeWidth="10" />
                    {Array.from({ length: 5 }).map((_, i) => (
                      <path
                        key={i}
                        d={`M ${x - 8} ${WHEEL.cy - 8} L ${x + 8} ${WHEEL.cy - 8} L ${x + 5} ${WHEEL.cy - 58} L ${x - 5} ${WHEEL.cy - 58} Z`}
                        fill="url(#rim)"
                        transform={`rotate(${i * 72} ${x} ${WHEEL.cy})`}
                      />
                    ))}
                    <circle cx={x} cy={WHEEL.cy} r="16" fill="url(#steelLight)" />
                    <circle cx={x} cy={WHEEL.cy} r="6" fill="#2a2f35" />
                  </g>
                ))}

                {/* ---------- CARROCERÍA ---------- */}
                <Panel id="skirt" region="r-skirt" />
                <Panel id="diffuser" region="r-diffuser" />
                <Panel id="splitter" region="r-splitter" />
                <Panel id="rear-quarter" region="r-rear-quarter" />
                <Panel id="door" region="r-door" />
                <Panel id="roof" region="r-roof" />
                <Panel id="front-fender" region="r-front-fender" />
                <Panel id="hood" region="r-hood" />
                <Panel id="front-bumper" region="r-front-bumper" />
                <Panel id="rear-bumper" region="r-rear-bumper" />

                {/* Lunas: encajan en los huecos restados a los paneles */}
                <g ref={setPart('glass-front')} style={origin('glass-front')}>
                  <path d={GLASS_WS} fill="url(#glass)" />
                  <path d="M 470 240 C 492 214 522 190 552 176 L 560 182 C 528 200 500 226 484 242 Z" fill="#ffffff" opacity="0.09" />
                </g>
                <g ref={setPart('glass-side')} style={origin('glass-side')}>
                  <path d={GLASS_SIDE} fill="url(#glass)" />
                  <path d="M 524 240 L 604 172 L 626 170 L 560 240 Z" fill="#ffffff" opacity="0.08" />
                </g>
                <g ref={setPart('glass-rear')} style={origin('glass-rear')}>
                  <path d={GLASS_REAR} fill="url(#glass)" />
                  <path d="M 726 234 L 722 172 C 762 178 796 192 826 212 Z" fill="#ffffff" opacity="0.07" />
                </g>

                {/* Faros, retrovisor y alerón */}
                <g ref={setPart('headlight')} style={origin('headlight')}>
                  <path d="M 142 276 C 168 262 198 250 224 242 L 232 262 C 204 270 176 282 150 296 Z" fill="#e9edf0" />
                  <path d="M 152 277 C 176 265 198 256 218 249 L 221 259 C 200 266 178 277 158 289 Z" fill="#9aa6b0" opacity="0.8" />
                </g>
                <g ref={setPart('taillight')} style={origin('taillight')}>
                  <path d="M 1058 260 L 1116 268 L 1116 290 L 1060 282 Z" fill="url(#accent)" />
                  <path d="M 1066 267 L 1108 273 L 1108 280 L 1067 275 Z" fill="#fff7e0" opacity="0.55" />
                </g>
                <g ref={setPart('mirror')} style={origin('mirror')}>
                  <path d="M 474 238 L 506 229 L 515 243 L 482 251 Z" fill="url(#silver)" />
                  <path d="M 470 246 L 482 244 L 484 252 L 472 253 Z" fill="#6b737a" />
                </g>
                <g ref={setPart('spoiler')} style={origin('spoiler')}>
                  <path d="M 1030 224 C 1066 216 1100 216 1124 222 L 1124 238 C 1092 230 1062 230 1032 238 Z" fill="url(#silver)" />
                </g>

                {/* Juntas de chapa: visibles solo con el coche montado */}
                <g ref={shutRef} mask="url(#body)" stroke="#6f777e" strokeWidth="1.8" fill="none" opacity="1">
                  <path d="M 200 242 L 200 390" opacity="0.55" />
                  <path d="M 456 242 L 456 390" opacity="0.55" />
                  <path d="M 770 232 L 770 390" opacity="0.5" />
                  <path d="M 1044 226 L 1044 390" opacity="0.5" />
                  <path d="M 372 232 L 372 300" opacity="0.4" />
                  <path d="M 210 384 L 1044 384" opacity="0.3" />
                </g>
              </g>
            </svg>
          </div>

          {/* ---------- Capa de texto ---------- */}
          <div className="pointer-events-none absolute inset-0">
            {/* Entrada */}
            <div
              ref={introRef}
              className="absolute inset-x-0 top-10 px-6 text-center sm:top-14"
              style={{ willChange: 'opacity, transform' }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-navy-900/55">
                Demo · Scroll animation
              </p>
              <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-navy-950 sm:text-5xl">
                Cada pieza,
                <br />
                <span className="text-flare-600">en su sitio</span>
              </h1>
              <p className="mx-auto mt-4 max-w-md text-base text-navy-900/70">
                Desplázate para desmontar el vehículo pieza a pieza.
              </p>
            </div>

            {/* Indicador de scroll */}
            <div
              ref={cueRef}
              className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2"
              style={{ willChange: 'opacity' }}
            >
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-navy-900/50">
                Scroll
              </span>
              <span className="flex h-9 w-5 items-start justify-center rounded-full border border-navy-900/25 p-1">
                <span className="h-2 w-1 animate-bounce rounded-full bg-navy-900/50" />
              </span>
            </div>

            {/* HUD técnico */}
            <div
              ref={hudRef}
              className="absolute inset-x-0 bottom-6 px-5 opacity-0 sm:px-10"
              style={{ willChange: 'opacity' }}
            >
              <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.28em] text-navy-900/50"
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                  >
                    Fase de despiece
                  </p>
                  <p ref={phaseRef} className="mt-1 text-xl font-bold tracking-tight text-navy-950 sm:text-2xl">
                    Vehículo completo
                  </p>
                </div>
                <div
                  className="flex items-center gap-4 text-navy-900/70"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
                >
                  <span className="text-xs tabular-nums">
                    <span ref={countRef}>0 / {PARTS.length}</span>
                    <span className="ml-1 text-navy-900/45">piezas</span>
                  </span>
                  <span ref={pctRef} className="text-xs tabular-nums text-navy-900/70">0%</span>
                </div>
              </div>
              <div className="mx-auto mt-2 h-[3px] max-w-5xl overflow-hidden rounded-full bg-navy-900/15">
                <div
                  ref={barRef}
                  className="h-full origin-left rounded-full bg-gradient-to-r from-sun-400 to-flare-500"
                  style={{ transform: 'scaleX(0)', willChange: 'transform' }}
                />
              </div>
            </div>

            {/* Salida */}
            <div
              ref={outroRef}
              className="pointer-events-auto absolute inset-x-0 bottom-16 px-6 text-center opacity-0"
              style={{ willChange: 'opacity' }}
            >
              <p className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-3xl">
                {PARTS.length} piezas, un solo scroll
              </p>
              <a
                href="#servicios"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800"
              >
                Seguir a la web
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
