/**
 * Ilustraciones vectoriales de instalaciones solares.
 * 100% SVG: nítidas, ligeras y sin dependencias externas.
 */

/* Rejilla de celdas para un panel (reutilizable) */
function PanelGrid({ x, y, w, h, cols = 6, rows = 4, cell = '#1e4b74', line = '#7fb2e0' }) {
  const cw = w / cols
  const ch = h / rows
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={x + c * cw + 0.6}
          y={y + r * ch + 0.6}
          width={cw - 1.2}
          height={ch - 1.2}
          rx="0.8"
          fill={cell}
        />,
      )
    }
  }
  return (
    <g>
      <rect x={x - 1.5} y={y - 1.5} width={w + 3} height={h + 3} rx="2" fill={line} />
      {cells}
    </g>
  )
}

/* ---------- Escena principal (Hero) ---------- */
export function HeroScene({ className = '' }) {
  return (
    <svg viewBox="0 0 420 360" className={className} role="img" aria-label="Instalación de placas solares bajo un cielo despejado">
      <defs>
        <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe3ff" />
          <stop offset="1" stopColor="#eaf6ff" />
        </linearGradient>
        <radialGradient id="hero-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff7d6" />
          <stop offset="0.5" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#f97316" />
        </radialGradient>
        <linearGradient id="hero-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2f6da3" />
          <stop offset="1" stopColor="#12314f" />
        </linearGradient>
      </defs>

      {/* Cielo */}
      <rect x="0" y="0" width="420" height="360" rx="24" fill="url(#hero-sky)" />
      {/* Sol */}
      <circle cx="322" cy="86" r="46" fill="url(#hero-sun)" opacity="0.95" />
      <circle cx="322" cy="86" r="66" fill="#fcd34d" opacity="0.18" />
      {/* Nubes */}
      <g fill="#ffffff" opacity="0.9">
        <ellipse cx="96" cy="70" rx="42" ry="18" />
        <ellipse cx="132" cy="78" rx="34" ry="15" />
        <ellipse cx="60" cy="80" rx="28" ry="13" />
        <ellipse cx="230" cy="120" rx="30" ry="12" opacity="0.7" />
        <ellipse cx="258" cy="126" rx="22" ry="10" opacity="0.7" />
      </g>

      {/* Suelo */}
      <path d="M0 300 Q210 268 420 300 L420 360 L0 360 Z" fill="#dbead9" />

      {/* Gran panel inclinado en perspectiva */}
      <g transform="translate(60 168) skewY(-9)">
        <rect x="0" y="0" width="300" height="120" rx="6" fill="url(#hero-panel)" />
        {Array.from({ length: 6 }).map((_, r) =>
          Array.from({ length: 10 }).map((_, c) => (
            <rect
              key={`${r}-${c}`}
              x={6 + c * 29}
              y={6 + r * 18.5}
              width={26}
              height={16}
              rx="1.5"
              fill={(r + c) % 2 ? '#2a5f92' : '#1c4571'}
              stroke="#7fb2e0"
              strokeWidth="0.6"
            />
          )),
        )}
      </g>
      {/* Soportes */}
      <g stroke="#9aa7ad" strokeWidth="4" strokeLinecap="round">
        <line x1="96" y1="300" x2="96" y2="272" />
        <line x1="330" y1="300" x2="330" y2="230" />
      </g>
    </svg>
  )
}

/* ---------- Galería: 4 escenas que reflejan instalaciones reales ---------- */

/* 1. Panel inclinado bajo cielo azul con nubes */
export function SceneBlueSky({ className = '' }) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label="Placas solares bajo un cielo azul despejado">
      <defs>
        <linearGradient id="bs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a9ae0" />
          <stop offset="1" stopColor="#acdcff" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#bs-sky)" />
      <g fill="#ffffff" opacity="0.92">
        <ellipse cx="110" cy="70" rx="52" ry="22" />
        <ellipse cx="160" cy="82" rx="40" ry="18" />
        <ellipse cx="300" cy="55" rx="46" ry="18" />
      </g>
      <g transform="translate(30 150) rotate(-6)">
        <rect x="0" y="0" width="360" height="150" fill="#123a5e" />
        {Array.from({ length: 5 }).map((_, r) =>
          Array.from({ length: 12 }).map((_, c) => (
            <rect key={`${r}-${c}`} x={4 + c * 29.5} y={4 + r * 29} width={27} height={27}
              fill={(r + c) % 2 ? '#1e4b74' : '#16405f'} stroke="#6fa8d8" strokeWidth="0.8" />
          )),
        )}
      </g>
    </svg>
  )
}

/* 2. Paneles sobre tejado de teja */
export function SceneRooftop({ className = '' }) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label="Placas solares instaladas sobre un tejado de teja">
      <defs>
        <linearGradient id="rf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ec5ee" />
          <stop offset="1" stopColor="#d8ecff" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#rf-sky)" />
      <g fill="#ffffff" opacity="0.75">
        <ellipse cx="90" cy="55" rx="40" ry="14" />
        <ellipse cx="310" cy="45" rx="34" ry="12" />
      </g>
      {/* Tejado de teja */}
      <path d="M0 300 L0 190 L400 130 L400 300 Z" fill="#c0562f" />
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M0 ${196 + i * 15} L400 ${136 + i * 15}`} stroke="#a9451f" strokeWidth="2" />
      ))}
      {/* Bloque de paneles */}
      <g transform="translate(70 150) rotate(-8.5)">
        <rect x="-6" y="-6" width="272" height="112" fill="#0f2f4c" />
        {Array.from({ length: 3 }).map((_, r) =>
          Array.from({ length: 6 }).map((_, c) => (
            <rect key={`${r}-${c}`} x={c * 44} y={r * 33} width={42} height={31}
              fill={(r + c) % 2 ? '#1e4b74' : '#16405f'} stroke="#6fa8d8" strokeWidth="1" />
          )),
        )}
      </g>
    </svg>
  )
}

/* 3. Filas de paneles al atardecer (oscuros) */
export function SceneSunset({ className = '' }) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label="Filas de placas solares oscuras iluminadas al atardecer">
      <defs>
        <linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3d55" />
          <stop offset="0.6" stopColor="#c96b3f" />
          <stop offset="1" stopColor="#f6b25b" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#ss-sky)" />
      <circle cx="330" cy="90" r="34" fill="#ffd98a" opacity="0.9" />
      {[0, 1, 2, 3].map((row) => {
        const y = 150 + row * 40
        const scale = 1 + row * 0.12
        return (
          <g key={row} transform={`translate(${40 - row * 12} ${y}) scale(${scale} 1)`}>
            <rect x="0" y="0" width="150" height="26" rx="2" fill="#2b2340" />
            {Array.from({ length: 8 }).map((_, c) => (
              <rect key={c} x={3 + c * 18.3} y={3} width={16} height={20} fill="#3a3358"
                stroke="#8a83b0" strokeWidth="0.5" />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/* 4. Nieve derritiéndose sobre los paneles */
export function SceneSnow({ className = '' }) {
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label="Nieve derritiéndose sobre placas solares en invierno">
      <defs>
        <linearGradient id="sn-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2c3742" />
          <stop offset="1" stopColor="#161d26" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="#233240" />
      <rect x="-10" y="20" width="420" height="280" fill="url(#sn-panel)" transform="rotate(-4 200 150)" />
      {/* rejilla */}
      <g stroke="#5b6b7a" strokeWidth="1" transform="rotate(-4 200 150)">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 50} y1="20" x2={i * 50} y2="300" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="-10" y1={30 + i * 48} x2="410" y2={30 + i * 48} />
        ))}
      </g>
      {/* Manchas de nieve */}
      <g fill="#f4f8fb">
        <path d="M20 70 q60 -18 120 6 q50 18 110 0 q40 -12 130 8 l0 30 q-70 16 -140 -2 q-60 -14 -120 4 q-50 14 -100 -6 Z" opacity="0.94" />
        <path d="M0 170 q80 -14 150 8 q60 18 130 -2 q60 -16 120 6 l0 26 q-70 14 -130 -4 q-70 -16 -140 4 q-60 12 -130 -6 Z" opacity="0.9" />
      </g>
      {/* Gotas */}
      <g fill="#bcd5e6">
        <circle cx="120" cy="130" r="2.4" />
        <circle cx="200" cy="150" r="2" />
        <circle cx="280" cy="128" r="2.6" />
        <circle cx="330" cy="200" r="2" />
      </g>
    </svg>
  )
}
