/* Iconos SVG ligeros (stroke), estilo lineal coherente. */
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const IconPanel = (p) => (
  <svg {...base} {...p}>
    <path d="M4 15h16l-1.6-9H5.6L4 15Z" />
    <path d="M12 6v9M8.4 6l-.4 9M15.6 6l.4 9M4.6 10.5h14.8" />
    <path d="M12 15v3M8 21h8" />
  </svg>
)

export const IconBattery = (p) => (
  <svg {...base} {...p}>
    <rect x="3" y="7" width="15" height="10" rx="2.2" />
    <path d="M21 10.5v3" />
    <path d="M11.2 9.5 8.8 12.6h2.6L9 15" />
  </svg>
)

export const IconDoc = (p) => (
  <svg {...base} {...p}>
    <path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M13 3v5h5" />
    <path d="m8.5 14.5 2 2 4-4.5" />
  </svg>
)

export const IconPhone = (p) => (
  <svg {...base} {...p}>
    <path d="M6.5 3.5h3l1.2 3.4-1.7 1.3a11 11 0 0 0 4.8 4.8l1.3-1.7 3.4 1.2v3a1.5 1.5 0 0 1-1.6 1.5A15 15 0 0 1 5 5.1 1.5 1.5 0 0 1 6.5 3.5Z" />
  </svg>
)

export const IconStar = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M12 3.2l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.6 9.3l5.8-.8L12 3.2Z" />
  </svg>
)

export const IconMap = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s6.5-5.6 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10.6" r="2.3" />
  </svg>
)

export const IconArrow = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const IconCheck = (p) => (
  <svg {...base} {...p}>
    <path d="M5 12.5l4.5 4.5L19 6.5" />
  </svg>
)

export const IconBolt = (p) => (
  <svg {...base} {...p}>
    <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z" />
  </svg>
)

export const IconShield = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 2.5v5.5c0 4.6-3 8.2-7 9.5-4-1.3-7-4.9-7-9.5V5.5L12 3Z" />
    <path d="m9 12 2 2 4-4.2" />
  </svg>
)

export const IconClock = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
)

export const IconLeaf = (p) => (
  <svg {...base} {...p}>
    <path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14 0 0-1-3 1-6" />
    <path d="M9 15c2-2 4-3 7-3.5" />
  </svg>
)

export const IconSavings = (p) => (
  <svg {...base} {...p}>
    <path d="M4 8.5C4 6 7.6 4 12 4s8 2 8 4.5V15c0 2.5-3.6 4.5-8 4.5S4 17.5 4 15V8.5Z" />
    <path d="M4 8.5C4 11 7.6 13 12 13s8-2 8-4.5M9.5 15.5h5" />
  </svg>
)

export const IconMenu = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const IconClose = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconQuote = (p) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="M9.5 6C6.5 7.2 5 9.6 5 13v5h6v-6H7.7C7.7 9.6 8.6 8 10.4 7.2L9.5 6Zm9 0C15.5 7.2 14 9.6 14 13v5h6v-6h-3.3c0-2.4.9-4 2.7-4.8L18.5 6Z" />
  </svg>
)
