import { useState } from 'react'
import { IconPhone, IconMap, IconBolt, IconCheck, IconArrow } from './icons'

export default function Contact() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contacto" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-navy-900 shadow-2xl">
          <div className="grid lg:grid-cols-2">
            {/* Información */}
            <div className="relative p-8 text-white sm:p-12">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-flare-500/25 blur-3xl" />
              <p className="relative text-sm font-semibold uppercase tracking-widest text-sun-300">
                Presupuesto gratuito
              </p>
              <h2 className="relative mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Da el paso hacia tu ahorro
              </h2>
              <p className="relative mt-4 max-w-md text-white/75">
                Cuéntanos cómo es tu vivienda o negocio y te preparamos un estudio sin compromiso.
                Sin letra pequeña: solo energía limpia y ahorro.
              </p>

              <ul className="relative mt-9 space-y-5">
                <li>
                  <a href="tel:+34910606716" className="group flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-sun-300 transition-colors group-hover:bg-white/15">
                      <IconPhone width={22} height={22} />
                    </span>
                    <span>
                      <span className="block text-sm text-white/60">Llámanos</span>
                      <span className="block text-lg font-semibold">910 60 67 16</span>
                    </span>
                  </a>
                </li>
                <li className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-sun-300">
                    <IconMap width={22} height={22} />
                  </span>
                  <span>
                    <span className="block text-sm text-white/60">Visítanos</span>
                    <span className="block font-semibold leading-snug">
                      C. del Conde de Aranda, 1, bajo derecha
                      <br className="hidden sm:block" /> Salamanca, 28001 Madrid
                    </span>
                  </span>
                </li>
                <li className="flex items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-sun-300">
                    <IconBolt width={22} height={22} />
                  </span>
                  <span>
                    <span className="block text-sm text-white/60">Online</span>
                    <a href="https://xolary.com" className="block text-lg font-semibold hover:text-sun-300">
                      xolary.com
                    </a>
                  </span>
                </li>
              </ul>
            </div>

            {/* Formulario */}
            <div className="bg-white p-8 sm:p-12">
              {sent ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-sun-100 text-sun-600">
                    <IconCheck width={34} height={34} />
                  </span>
                  <h3 className="mt-5 text-2xl font-bold text-navy-900">¡Gracias!</h3>
                  <p className="mt-2 max-w-xs text-navy-800/75">
                    Hemos recibido tu solicitud. Un asesor de Xolary te llamará muy pronto para preparar
                    tu presupuesto gratuito.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="nombre" className="mb-1.5 block text-sm font-semibold text-navy-900">
                      Nombre
                    </label>
                    <input
                      id="nombre" name="nombre" type="text" required autoComplete="name"
                      className="w-full rounded-xl border border-navy-900/15 bg-cloud-50 px-4 py-3 text-navy-900 outline-none transition-colors focus:border-flare-500 focus:ring-2 focus:ring-flare-500/30"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="telefono" className="mb-1.5 block text-sm font-semibold text-navy-900">
                        Teléfono
                      </label>
                      <input
                        id="telefono" name="telefono" type="tel" required autoComplete="tel"
                        className="w-full rounded-xl border border-navy-900/15 bg-cloud-50 px-4 py-3 text-navy-900 outline-none transition-colors focus:border-flare-500 focus:ring-2 focus:ring-flare-500/30"
                        placeholder="600 000 000"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy-900">
                        Email
                      </label>
                      <input
                        id="email" name="email" type="email" autoComplete="email"
                        className="w-full rounded-xl border border-navy-900/15 bg-cloud-50 px-4 py-3 text-navy-900 outline-none transition-colors focus:border-flare-500 focus:ring-2 focus:ring-flare-500/30"
                        placeholder="tucorreo@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="mensaje" className="mb-1.5 block text-sm font-semibold text-navy-900">
                      ¿Qué necesitas?
                    </label>
                    <textarea
                      id="mensaje" name="mensaje" rows={4}
                      className="w-full resize-none rounded-xl border border-navy-900/15 bg-cloud-50 px-4 py-3 text-navy-900 outline-none transition-colors focus:border-flare-500 focus:ring-2 focus:ring-flare-500/30"
                      placeholder="Vivienda unifamiliar, quiero placas y batería…"
                    />
                  </div>
                  <button
                    type="submit"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-flare-500 px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(249,115,22,0.6)] transition-all hover:bg-flare-600"
                  >
                    Solicitar presupuesto gratuito
                    <IconArrow width={19} height={19} className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <p className="text-center text-xs text-navy-800/55">
                    Respuesta rápida · Sin compromiso · Estudio 100 % gratuito
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
