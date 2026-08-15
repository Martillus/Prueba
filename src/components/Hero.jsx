import { HeroScene } from './SolarArt'
import { IconStar, IconArrow, IconCheck } from './icons'

export default function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-36">
      {/* Fondo decorativo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-sun-200/50 blur-3xl" />
        <div className="absolute top-40 left-[-8%] h-72 w-72 rounded-full bg-flare-400/20 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-8">
        {/* Columna de texto */}
        <div className="text-center lg:text-left">
          {/* Insignia Google */}
          <a
            href="#resenas"
            className="inline-flex items-center gap-2 rounded-full border border-sun-300 bg-white px-3.5 py-1.5 text-sm font-medium text-navy-800 shadow-sm"
          >
            <span className="flex text-sun-500" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar key={i} width={15} height={15} />
              ))}
            </span>
            <span className="font-semibold">Valoración 4,9/5 en Google</span>
            <span className="text-navy-800/60">· +260 reseñas</span>
          </a>

          <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl lg:text-6xl">
            Tu <span className="text-flare-500">independencia energética</span> empieza en el tejado
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-navy-800/80 lg:mx-0">
            En <strong className="font-semibold text-navy-900">Xolary</strong> instalamos placas y baterías
            solares para maximizar tu ahorro y darte energía 100&nbsp;% limpia, también frente a los cortes de luz.
            Instalaciones rápidas, limpias y con toda la documentación gestionada por nosotros.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <a
              href="#contacto"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-flare-500 px-7 py-4 text-base font-semibold text-white shadow-[0_10px_30px_-8px_rgba(249,115,22,0.6)] transition-all hover:bg-flare-600 hover:shadow-[0_14px_36px_-8px_rgba(249,115,22,0.7)] sm:w-auto"
            >
              Solicitar presupuesto gratuito
              <IconArrow width={19} height={19} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#servicios"
              className="inline-flex w-full items-center justify-center rounded-full border border-navy-900/15 bg-white px-7 py-4 text-base font-semibold text-navy-900 transition-colors hover:border-navy-900/30 sm:w-auto"
            >
              Ver servicios
            </a>
          </div>

          {/* Puntos de confianza */}
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-navy-800/80 lg:justify-start">
            {['Instalación rápida y limpia', 'Documentación incluida', 'Energía 100 % limpia'].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <IconCheck width={17} height={17} className="text-sun-600" /> {t}
              </li>
            ))}
          </ul>
        </div>

        {/* Columna ilustración */}
        <div className="relative">
          <div className="relative mx-auto max-w-lg">
            <HeroScene className="w-full drop-shadow-[0_24px_50px_rgba(11,31,51,0.22)]" />

            {/* Tarjeta flotante de ahorro */}
            <div className="absolute -bottom-4 left-2 flex items-center gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_18px_40px_-14px_rgba(11,31,51,0.4)] backdrop-blur sm:-left-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-sun-100 text-sun-700">
                <IconStar width={22} height={22} />
              </div>
              <div className="leading-tight">
                <p className="text-xl font-extrabold text-navy-900">4,9/5</p>
                <p className="text-xs text-navy-800/70">+260 reseñas en Google</p>
              </div>
            </div>

            {/* Tarjeta flotante de ahorro % */}
            <div className="absolute -top-3 right-0 rounded-2xl bg-navy-900 px-4 py-3 text-white shadow-lg sm:-right-4">
              <p className="text-2xl font-extrabold leading-none text-sun-300">−70%</p>
              <p className="mt-1 text-xs text-white/75">en tu factura de luz</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
