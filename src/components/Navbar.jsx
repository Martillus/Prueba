import { useEffect, useState } from 'react'
import Logo from './Logo'
import { IconMenu, IconClose, IconPhone } from './icons'

const LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Baterías', href: '#baterias' },
  { label: 'Reseñas', href: '#resenas' },
  { label: 'Contacto', href: '#contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Bloquea el scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-cloud-50/90 backdrop-blur-md shadow-[0_1px_0_rgba(11,31,51,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8" aria-label="Principal">
        <a href="#inicio" className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sun-500">
          <Logo variant="dark" />
        </a>

        {/* Enlaces escritorio */}
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-navy-800 transition-colors hover:text-flare-600"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="tel:+34910606716"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 transition-colors hover:text-flare-600"
          >
            <IconPhone width={18} height={18} /> 910 60 67 16
          </a>
          <a
            href="#contacto"
            className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy-800 hover:shadow-md"
          >
            Presupuesto gratis
          </a>
        </div>

        {/* Botón menú móvil */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-lg p-2 text-navy-900 md:hidden"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <IconClose width={26} height={26} /> : <IconMenu width={26} height={26} />}
        </button>
      </nav>

      {/* Panel móvil */}
      <div
        className={`md:hidden overflow-hidden border-t border-navy-900/5 bg-cloud-50 transition-[max-height,opacity] duration-300 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-1 px-5 py-4">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-navy-800 hover:bg-sun-100"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li className="mt-2">
            <a
              href="#contacto"
              onClick={() => setOpen(false)}
              className="block rounded-full bg-flare-500 px-5 py-3 text-center text-base font-semibold text-white shadow-sm"
            >
              Solicitar presupuesto gratuito
            </a>
          </li>
          <li>
            <a
              href="tel:+34910606716"
              className="mt-1 flex items-center justify-center gap-2 px-5 py-3 text-base font-semibold text-navy-900"
            >
              <IconPhone width={18} height={18} /> 910 60 67 16
            </a>
          </li>
        </ul>
      </div>
    </header>
  )
}
