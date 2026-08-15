import { SceneBlueSky, SceneRooftop, SceneSunset, SceneSnow } from './SolarArt'

const ITEMS = [
  { Scene: SceneBlueSky, title: 'Autoconsumo residencial', tag: 'Cielo despejado' },
  { Scene: SceneRooftop, title: 'Instalación sobre tejado', tag: 'Vivienda unifamiliar' },
  { Scene: SceneSunset, title: 'Parque de generación', tag: 'Máximo rendimiento' },
  { Scene: SceneSnow, title: 'Rinden todo el año', tag: 'También en invierno' },
]

export default function Gallery() {
  return (
    <section id="instalaciones" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-flare-600">Nuestro trabajo</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Instalaciones que generan ahorro cada día
          </h2>
          <p className="mt-4 text-lg text-navy-800/75">
            Placas y baterías que rinden en cualquier tejado y en cualquier época del año.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ Scene, title, tag }, i) => (
            <figure
              key={title}
              className="reveal group relative overflow-hidden rounded-3xl shadow-[0_12px_40px_-16px_rgba(11,31,51,0.3)] ring-1 ring-navy-900/8"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <Scene className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 to-transparent p-4 pt-10 text-white">
                <span className="inline-block rounded-full bg-sun-400/90 px-2.5 py-0.5 text-[11px] font-semibold text-navy-950">
                  {tag}
                </span>
                <p className="mt-1.5 font-semibold leading-tight">{title}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
