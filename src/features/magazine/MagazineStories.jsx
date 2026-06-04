import { HairlineRule, Kicker, Meta, Reveal } from './MagazineEditorialPrimitives'
import { cocktails } from '../../content/cocktails'

export default function MagazineStories({ onNavigate }) {
  const variants = [
    'col-span-12 md:col-span-8',
    'col-span-6 md:col-span-4',
    'col-span-6 md:col-span-4',
    'col-span-12 md:col-span-5',
    'col-span-12 md:col-span-3',
  ]

  return (
    <>
      {/* Header */}
      <header className="pt-24 md:pt-36 pb-16 md:pb-24">
        <div className="mx-auto max-w-[1480px] px-5 md:px-10">
          <Reveal><Kicker>The Library</Kicker></Reveal>
          <Reveal delay={0.1}>
            <h1 className="h-display text-h1 mt-6 max-w-4xl text-paper">
              Every feature, every classic,
              <br />
              <span className="italic text-amber">in one place.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="deck mt-10 max-w-2xl">
              The archive is small, deliberately. Each entry is the result
              of weeks of writing, photography, and arguing with bartenders
              we trust.
            </p>
          </Reveal>
        </div>
      </header>

      {/* Broken-grid contact sheet */}
      <section className="pb-24 md:pb-32">
        <div className="mx-auto max-w-[1480px] px-5 md:px-10">
          <div className="grid grid-cols-12 gap-4 md:gap-6">
            {cocktails.map((c, i) => (
              <Reveal
                key={c.slug}
                className={variants[i % 5] || 'col-span-6'}
                delay={(i % 10) * 0.06}
              >
                <button
                  onClick={() => onNavigate({ slug: c.slug })}
                  className="group relative block w-full overflow-hidden"
                  style={{
                    aspectRatio: i % 5 === 0 ? '5/4' : (i % 5 === 1 || i % 5 === 2) ? '3/4' : i % 5 === 3 ? '5/4' : '3/4',
                    background: 'none',
                    padding: 0,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover img-plate"
                    style={{ transition: 'transform 1400ms ease-out' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                  <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-between">
                    <span className="folio">№ {String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <Meta className="text-amber-deep">{c.family}</Meta>
                      <h2 className="h-display mt-2 text-paper" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 3vw, 3rem)' }}>
                        {c.name}
                      </h2>
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Numbered editorial index */}
      <section className="bg-ink-deep py-24 md:py-32 pb-32">
        <div className="mx-auto max-w-[1100px] px-5 md:px-10">
          <Reveal>
            <Kicker>The Index</Kicker>
            <h2 className="h-display text-h2 mt-4 text-paper">Every story, in order.</h2>
          </Reveal>
          <HairlineRule className="mt-12" />
          {cocktails.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 15) * 0.03}>
              <button
                onClick={() => onNavigate({ slug: c.slug })}
                className="group w-full text-left"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                  alignItems: 'baseline',
                  gap: '1rem',
                  padding: '2rem 0',
                  borderBottom: `1px solid oklch(0.55 0.08 70 / 0.4)`,
                  background: 'none',
                  border: 'none',
                  borderBottomWidth: '1px',
                  borderBottomStyle: 'solid',
                  borderBottomColor: 'oklch(0.55 0.08 70 / 0.4)',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <span className="folio" style={{ gridColumn: 'span 2 / span 2' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ gridColumn: 'span 6 / span 6' }}>
                  <h3 className="h-display text-paper" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)', transition: 'color 700ms' }}>
                    {c.name}
                  </h3>
                  <p className="text-paper-dim mt-2" style={{ fontSize: 'var(--mag-text-body)' }}>{c.tagline}</p>
                </div>
                <span className="meta text-muted-foreground" style={{ gridColumn: 'span 3 / span 3' }}>{c.family}</span>
                <span className="meta text-amber-deep" style={{ gridColumn: 'span 1 / span 1', textAlign: 'right' }}>{c.era.split(',')[1]?.trim() || c.era}</span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
