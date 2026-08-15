import { IconStar, IconQuote } from './icons'

const REVIEWS = [
  {
    quote: 'Te asesoran de maravilla y los instaladores son super rapidos y limpios.',
    name: 'David B.',
    initial: 'D',
  },
  {
    quote: 'Cumplieron con los plazos acordados y el resultado superó mis expectativas.',
    name: 'Alegria Gely',
    initial: 'A',
  },
  {
    quote: 'Asesoramiento claro y personalizado, resolviendo todas mis dudas de forma profesional.',
    name: 'Sergio Jaen',
    initial: 'S',
  },
]

export default function Testimonials() {
  return (
    <section id="resenas" className="bg-cloud-100 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="reveal mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-flare-600">Reseñas</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>

          <div className="mt-5 inline-flex items-center gap-3 rounded-full border border-sun-300 bg-white px-5 py-2.5 shadow-sm">
            <span className="text-2xl font-extrabold text-navy-900">4,9</span>
            <span className="flex text-sun-500" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar key={i} width={18} height={18} />
              ))}
            </span>
            <span className="text-sm text-navy-800/70">en Google · +260 reseñas</span>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <figure
              key={r.name}
              className="reveal flex flex-col rounded-3xl bg-white p-8 shadow-[0_12px_40px_-18px_rgba(11,31,51,0.22)] ring-1 ring-navy-900/5"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <IconQuote width={34} height={34} className="text-sun-300" />
              <div className="mt-3 flex text-sun-500" aria-label="5 de 5 estrellas">
                {Array.from({ length: 5 }).map((_, s) => (
                  <IconStar key={s} width={17} height={17} />
                ))}
              </div>
              <blockquote className="mt-4 grow text-lg leading-relaxed text-navy-900">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-navy-900/8 pt-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-sun-300 to-flare-500 font-bold text-white">
                  {r.initial}
                </span>
                <div>
                  <p className="font-semibold text-navy-900">{r.name}</p>
                  <p className="text-xs text-navy-800/60">Cliente de Xolary</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
