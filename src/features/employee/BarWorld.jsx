import React from 'react'

function BarWorldCard({ eyebrow, title, description, cta, onClick, upcoming }) {
  return (
    <div className={`rounded-[1.25rem] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.022)] ${
      upcoming
        ? 'border-[#6b705c]/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.014),rgba(0,0,0,0.18))]'
        : 'border-[#6b705c]/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.028),rgba(0,0,0,0.14))]'
    }`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="text-[8px] font-black uppercase tracking-[0.26em] text-[#c9a96e]/75">{eyebrow}</div>
        {upcoming && (
          <span className="rounded-full border border-[#6b705c]/20 bg-white/[0.022] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/38">
            Coming soon
          </span>
        )}
      </div>
      <h2 className="font-serif text-[1.15rem] font-black leading-tight text-[#f5f5f0]">{title}</h2>
      <p className="mt-2 text-[11px] leading-relaxed text-[#e8dcc0]/50">{description}</p>
      {cta && onClick && (
        <button
          type="button"
          onClick={onClick}
          className="group mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-[#6b705c]/12 bg-white/[0.016] px-4 py-3 text-left transition-all duration-300 hover:border-[#c9a96e]/22 hover:bg-[#c9a96e]/[0.032]"
        >
          <span className="text-[13px] font-semibold leading-tight text-[#f5f5f0] transition duration-300 group-hover:text-[#c9a96e]">{cta}</span>
          <span className="shrink-0 text-[10px] text-[#6b705c]/45 transition duration-300 group-hover:text-[#c9a96e]">→</span>
        </button>
      )}
    </div>
  )
}

export default function BarWorld({ goToPage }) {
  const cards = [
    {
      eyebrow: 'Training',
      title: 'Bar Course',
      description: 'Structured bar education — technique, classic specs, spirits, and service culture. The full Bar Course is being built here inside Bar World. Current academy content is available through HESTIA Courses.',
      cta: 'Visit HESTIA Academy',
      page: 'courses',
    },
    {
      eyebrow: 'Reading',
      title: 'Classic Cocktails',
      description: "The bartender's reading world — classic specs, recipes, origin stories, and bar culture. Living magazine material for shift preparation and craft.",
      cta: 'Open Magazine',
      page: 'cocktailsMagazine',
    },
    {
      eyebrow: 'Craft',
      title: 'Technique',
      description: 'Bar technique reference — stir, shake, build, and layer. Step-by-step method guides prepared for future bar course lessons.',
      upcoming: true,
    },
    {
      eyebrow: 'Service',
      title: 'Service Notes',
      description: 'Hospitality service standards, table etiquette, and guest interaction reference for shift preparation.',
      upcoming: true,
    },
  ]

  return (
    <section className="relative min-h-[calc(100vh-4.75rem)]">
      <div className="mx-auto max-w-3xl">
        <header className="mb-7 pt-1">
          <div className="mb-2 text-[8px] font-black uppercase tracking-[0.34em] text-[#c9a96e]">Bar World</div>
          <h1 className="font-serif text-[clamp(1.9rem,4vw,3rem)] font-black leading-[0.97] tracking-tight text-[#f5f5f0]">Your bar education.</h1>
          <p className="mt-2.5 max-w-lg text-sm leading-6 text-[#e8dcc0]/60">Course material, classic specs, technique, and service reference — everything for the craft.</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map(card => (
            <BarWorldCard
              key={card.title}
              {...card}
              onClick={card.page ? () => goToPage(card.page) : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
