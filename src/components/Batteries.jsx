import { SceneSunset } from './SolarArt'
import { IconBolt, IconShield, IconClock, IconLeaf } from './icons'

const BENEFITS = [
  { icon: IconShield, title: 'Respaldo ante apagones', text: 'Si se va la luz, tu casa sigue encendida automáticamente.' },
  { icon: IconClock, title: 'Energía 24/7', text: 'Usa de noche la energía solar que almacenaste durante el día.' },
  { icon: IconBolt, title: 'Más autoconsumo', text: 'Aprovecha hasta el último vatio que generan tus placas.' },
  { icon: IconLeaf, title: '100 % limpia', text: 'Reduce tu huella de carbono y gana independencia real.' },
]

export default function Batteries() {
  return (
    <section id="baterias" className="relative overflow-hidden bg-navy-900 py-20 text-white sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-flare-500/20 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-sun-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
        <div className="reveal">
          <p className="text-sm font-semibold uppercase tracking-widest text-sun-300">Baterías solares</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Nunca más te quedes sin luz
          </h2>
          <p className="mt-4 max-w-lg text-lg text-white/75">
            Las baterías inteligentes de Xolary almacenan la energía que producen tus placas para que la uses
            cuando quieras. Independencia energética real, ahorro máximo y tranquilidad frente a cualquier corte.
          </p>

          <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {BENEFITS.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="flex gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-sun-300">
                    <Icon width={22} height={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm text-white/65">{b.text}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <a
            href="#contacto"
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-sun-400 px-6 py-3.5 text-base font-semibold text-navy-950 transition-colors hover:bg-sun-300"
          >
            Quiero mi batería solar
          </a>
        </div>

        <div className="reveal">
          <div className="overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
            <SceneSunset className="w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
