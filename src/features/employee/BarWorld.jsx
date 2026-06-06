import { useState } from 'react'
import ClassicCocktailsMagazine from '../magazine/ClassicCocktailsMagazine'

const TABS = [
  { id: 'academy',   label: 'Academy' },
  { id: 'classics',  label: 'Classics' },
  { id: 'technique', label: 'Technique' },
  { id: 'spirits',   label: 'Spirits' },
  { id: 'service',   label: 'Service' },
]

function BarWorldHeader({ tab, setTab }) {
  return (
    <div className="-mx-3 sm:-mx-5 lg:-mx-6 -mt-4 border-b border-[#c9a96e]/12 bg-[#080705]">
      <div className="flex items-center justify-between gap-4 px-4 py-[1.05rem] sm:px-6">

        {/* Brand */}
        <button
          type="button"
          onClick={() => setTab('classics')}
          className="flex shrink-0 items-baseline gap-2.5 border-0 bg-transparent p-0 cursor-pointer"
        >
          <span className="font-serif text-[1.1rem] font-black tracking-tight text-[#c9a96e]">
            Hestia
          </span>
          <span
            className="hidden sm:inline"
            style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.67rem', letterSpacing: '0.26em', textTransform: 'uppercase', color: 'rgba(232,220,192,0.48)' }}
          >
            Bar World
          </span>
        </button>

        {/* Tab navigation */}
        <nav
          className="flex flex-1 items-center justify-center gap-5 overflow-x-auto md:gap-8"
          aria-label="Bar World sections"
        >
          {TABS.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.68rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: tab === t.id ? '#c9a96e' : 'rgba(232,220,192,0.40)',
                background: 'none',
                border: 'none',
                borderBottom: tab === t.id ? '1.5px solid #c9a96e' : '1.5px solid transparent',
                paddingBottom: '2px',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'color 150ms',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Edition tag */}
        <div
          className="hidden shrink-0 md:block"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.64rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(232,220,192,0.22)' }}
        >
          Vol. I · MMXXVI
        </div>

      </div>
    </div>
  )
}

function AcademyPanel() {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="rounded-[1.25rem] border border-[#6b705c]/14 bg-[linear-gradient(145deg,rgba(255,255,255,0.028),rgba(0,0,0,0.14))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.022)]">
        <div className="mb-1.5 text-[8px] font-black uppercase tracking-[0.26em] text-[#c9a96e]/75">Training</div>
        <h2 className="font-serif text-xl font-black leading-tight text-[#f5f5f0]">Bar Course</h2>
        <p className="mt-3 text-sm leading-relaxed text-[#e8dcc0]/60">
          Structured bar education — technique, classic specs, spirits, and service culture.
          The Bar Course will live here inside Bar World.
        </p>
        <div className="mt-5">
          <span className="inline-block rounded-full border border-[#6b705c]/20 bg-white/[0.022] px-3 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/35">
            Bar Course in preparation
          </span>
        </div>
      </div>
    </div>
  )
}

function ComingSoonPanel({ eyebrow, title, body }) {
  return (
    <div className="mx-auto max-w-3xl py-8">
      <div className="rounded-[1.25rem] border border-[#6b705c]/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.014),rgba(0,0,0,0.18))] p-10 text-center">
        <div className="mb-2 text-[8px] font-black uppercase tracking-[0.26em] text-[#c9a96e]/38">{eyebrow}</div>
        <h2 className="font-serif text-lg font-black text-[#f5f5f0]/55">{title}</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#e8dcc0]/30">{body}</p>
        <span className="mt-5 inline-block rounded-full border border-[#6b705c]/18 bg-white/[0.018] px-3 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/25">
          In preparation
        </span>
      </div>
    </div>
  )
}

export default function BarWorld() {
  const [tab, setTab] = useState('classics')

  return (
    <section className="relative min-h-[calc(100vh-4.75rem)]">

      <BarWorldHeader tab={tab} setTab={setTab} />

      {tab === 'academy' && <AcademyPanel />}

      {tab === 'classics' && (
        // noTopOffset: the BarWorldHeader already absorbed the top margin offset
        <ClassicCocktailsMagazine isEmployee={true} noTopOffset={true} />
      )}

      {tab === 'technique' && (
        <ComingSoonPanel
          eyebrow="Craft"
          title="Technique"
          body="Bar technique reference — stir, shake, build, and layer. Step-by-step method guides are being prepared as part of the Bar Course inside Bar World."
        />
      )}

      {tab === 'spirits' && (
        <ComingSoonPanel
          eyebrow="Knowledge"
          title="Spirits"
          body="Spirits literacy — categories, distillation, tasting foundations, and vocabulary for service. Coming as part of the structured bar education."
        />
      )}

      {tab === 'service' && (
        <ComingSoonPanel
          eyebrow="Standards"
          title="Service"
          body="Bar service notes — guest interaction, station discipline, mise en place, and pre-service reference. Being prepared for shift use."
        />
      )}

    </section>
  )
}
