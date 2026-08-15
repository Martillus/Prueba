/**
 * Logo de Xolary — sol radiante + wordmark.
 * Recreado como SVG vectorial (nítido en cualquier resolución).
 * variant: "dark"  -> wordmark oscuro (sobre fondos claros)
 *          "light" -> wordmark blanco (sobre fondos oscuros)
 */
export default function Logo({ variant = 'dark', className = '' }) {
  const wordColor = variant === 'light' ? '#ffffff' : '#0b1f33'
  const uid = variant // ids únicos por variante para evitar colisiones de gradiente

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Xolary">
      <SunMark id={uid} />
      <span
        className="text-[1.6rem] font-extrabold tracking-tight leading-none"
        style={{ color: wordColor }}
      >
        xolary
      </span>
    </span>
  )
}

function SunMark({ id }) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id={`sun-${id}`} x1="10" y1="8" x2="54" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fcd34d" />
          <stop offset="0.55" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="12" fill={`url(#sun-${id})`} />
      <g stroke={`url(#sun-${id})`} strokeWidth="4.2" strokeLinecap="round">
        <line x1="32" y1="4" x2="32" y2="13" />
        <line x1="32" y1="51" x2="32" y2="60" />
        <line x1="4" y1="32" x2="13" y2="32" />
        <line x1="51" y1="32" x2="60" y2="32" />
        <line x1="12" y1="12" x2="18.5" y2="18.5" />
        <line x1="45.5" y1="45.5" x2="52" y2="52" />
        <line x1="12" y1="52" x2="18.5" y2="45.5" />
        <line x1="45.5" y1="18.5" x2="52" y2="12" />
      </g>
    </svg>
  )
}
