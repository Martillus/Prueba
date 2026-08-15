import Logo from './Logo'
import { IconPhone, IconMap, IconBolt } from './icons'

const NAV = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Servicios', href: '#servicios' },
  { label: 'Baterías', href: '#baterias' },
  { label: 'Instalaciones', href: '#instalaciones' },
  { label: 'Reseñas', href: '#resenas' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white/80">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Marca */}
          <div>
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
              Placas y baterías solares en Madrid. Maximizamos tu ahorro y tu independencia energética
              con energía 100 % limpia.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-medium text-white/80">
              🏳️‍🌈 Amigable con la comunidad LGBTQ+
            </p>
          </div>

          {/* Navegación */}
          <div className="md:justify-self-center">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">Navegación</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-8 gap-y-2.5 text-sm">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="text-white/70 transition-colors hover:text-sun-300">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <IconMap width={18} height={18} className="mt-0.5 shrink-0 text-sun-300" />
                <span>C. del Conde de Aranda, 1, bajo derecha, Salamanca, 28001 Madrid</span>
              </li>
              <li>
                <a href="tel:+34910606716" className="flex items-center gap-3 hover:text-sun-300">
                  <IconPhone width={18} height={18} className="shrink-0 text-sun-300" />
                  910 60 67 16
                </a>
              </li>
              <li>
                <a href="https://xolary.com" className="flex items-center gap-3 hover:text-sun-300">
                  <IconBolt width={18} height={18} className="shrink-0 text-sun-300" />
                  xolary.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Xolary. Todos los derechos reservados.</p>
          <p>Energía 100 % limpia · Independencia energética · Madrid</p>
        </div>
      </div>
    </footer>
  )
}
