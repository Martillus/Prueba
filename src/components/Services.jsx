import { IconPanel, IconBattery, IconDoc, IconArrow } from './icons'

const SERVICES = [
  {
    icon: IconPanel,
    title: 'Instalación de Placas',
    text: 'Diseñamos e instalamos tu sistema fotovoltaico a medida. Montaje rápido y limpio, con paneles de alta eficiencia que producen desde el primer día.',
    points: ['Estudio y diseño personalizado', 'Instalación limpia en 1 día', 'Paneles de alta eficiencia'],
  },
  {
    icon: IconBattery,
    title: 'Baterías Inteligentes',
    text: 'Almacena la energía que generas de día y úsala cuando la necesites. Independencia real y respaldo automático frente a los cortes de luz.',
    points: ['Energía disponible 24/7', 'Respaldo ante apagones', 'Gestión inteligente del consumo'],
  },
  {
    icon: IconDoc,
    title: 'Gestión de Documentación',
    text: 'Nos ocupamos de todo el papeleo: legalización, subvenciones, permisos y trámites con la compañía. Tú solo disfrutas del ahorro.',
    points: ['Legalización y permisos', 'Tramitación de subvenciones', 'Alta de autoconsumo'],
  },
]

export default function Services() {
  return (
    <section id="servicios" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-flare-600">Qué hacemos</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Todo lo que necesitas para pasarte al sol
          </h2>
          <p className="mt-4 text-lg text-navy-800/75">
            Un servicio integral, del primer estudio a la puesta en marcha, sin que tú tengas que preocuparte de nada.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {SERVICES.map((s, i) => {
            const Icon = s.icon
            return (
              <article
                key={s.title}
                className="reveal group flex flex-col rounded-3xl border border-navy-900/8 bg-white p-8 shadow-[0_10px_40px_-18px_rgba(11,31,51,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-18px_rgba(11,31,51,0.28)]"
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sun-300 to-flare-500 text-white shadow-md">
                  <Icon width={28} height={28} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-navy-900">{s.title}</h3>
                <p className="mt-3 grow text-navy-800/75">{s.text}</p>
                <ul className="mt-6 space-y-2.5 border-t border-navy-900/8 pt-6">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm font-medium text-navy-800">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sun-100 text-sun-700">
                        <IconArrow width={13} height={13} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
