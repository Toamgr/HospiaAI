import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import {
  AmbientGlow, HairlineRule, Kicker, Meta, PullQuote, Reveal,
} from './MagazineEditorialPrimitives'
import { MagazineFlavorWheel } from './MagazineFlavorWheel'
import { getCocktail, getRelated } from '../../content/cocktails'

export default function MagazineCocktailDetail({ slug, onNavigate }) {
  const cocktail = getCocktail(slug)
  if (!cocktail) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh', paddingTop: '10rem' }}>
        <div style={{ textAlign: 'center' }}>
          <Kicker>Not Found</Kicker>
          <h1 className="h-display mt-4 text-paper" style={{ fontSize: 'var(--mag-text-h2)' }}>
            That feature is not in the library.
          </h1>
          <button onClick={() => onNavigate('stories')} className="meta text-amber reveal-link mt-8" style={{ display: 'inline-block', marginTop: '2rem' }}>
            Return to the Library →
          </button>
        </div>
      </div>
    )
  }

  const related = getRelated(cocktail.related)

  return (
    <>
      <ArticleOpener cocktail={cocktail} />
      <ArticleBody cocktail={cocktail} />
      <PullQuoteSection note={cocktail.bartenderNote} />
      <IngredientLedger cocktail={cocktail} />
      <TechniqueSteps cocktail={cocktail} />
      <FlavorAndCulture cocktail={cocktail} />
      <RelatedReading related={related} currentSlug={cocktail.slug} onNavigate={onNavigate} />
    </>
  )
}

/* ─── Article Opener ─────────────────────────────────────────────────────── */

function ArticleOpener({ cocktail }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 100])
  const scale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.06])

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ minHeight: '100svh', paddingTop: '3.5rem' }}>
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <img
          src={cocktail.image}
          alt={cocktail.name}
          className="absolute inset-0 w-full h-full object-cover img-plate"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" />
      </motion.div>

      <AmbientGlow className="w-[600px] h-[600px]" style={{ top: '25%', right: 0 }} />

      <div className="relative mx-auto max-w-[1480px] px-5 md:px-10 flex items-end pb-16 md:pb-28" style={{ minHeight: '100svh' }}>
        <div className="max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <Kicker>{cocktail.kicker}</Kicker>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-display text-paper mt-6"
            style={{ fontSize: 'clamp(3.5rem, 2rem + 8vw, 8rem)', lineHeight: 0.92, letterSpacing: '-0.035em' }}
          >
            {cocktail.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5 }}
            className="deck mt-8 md:mt-10 max-w-2xl"
          >
            {cocktail.deck}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 max-w-3xl"
          >
            <Stat label="Origin" value={cocktail.era} />
            <Stat label="Family" value={cocktail.family} />
            <Stat label="Base" value={cocktail.baseSpirit} />
            <Stat label="Glass" value={cocktail.glass} />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <Meta className="text-amber-deep">{label}</Meta>
      <div className="mt-2 text-paper font-display" style={{ fontSize: '1.125rem', lineHeight: 1.4 }}>{value}</div>
    </div>
  )
}

/* ─── Article Body ───────────────────────────────────────────────────────── */

function ArticleBody({ cocktail }) {
  return (
    <section className="py-24 md:py-40">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <Reveal>
          <div className="grid md:grid-cols-[1fr_3fr] gap-8 md:gap-16">
            <div>
              <Kicker>History</Kicker>
              <HairlineRule className="mt-4" />
              <Meta className="mt-4 block text-amber-deep">{cocktail.origin}</Meta>
            </div>
            <div className="prose-editorial">
              {cocktail.history.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Pull Quote (Bartender Note) ────────────────────────────────────────── */

function PullQuoteSection({ note }) {
  return (
    <section className="bg-ink-deep py-16 md:py-24">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <Reveal>
          <Kicker className="block">The Bartender</Kicker>
          <PullQuote quote={note.quote} attribution={note.attribution} />
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Ingredient Ledger ──────────────────────────────────────────────────── */

function IngredientLedger({ cocktail }) {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <Reveal>
          <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
            <div>
              <Kicker>The Recipe</Kicker>
              <h2 className="h-display text-h3 mt-4 text-paper">Ingredients & Measures</h2>
              <p className="text-paper-dim mt-4 max-w-xs" style={{ fontSize: 'var(--mag-text-body)' }}>
                One serving. Adjust at your own peril.
              </p>
            </div>
            <div>
              <HairlineRule />
              {cocktail.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-4 items-baseline"
                  style={{ padding: '1.25rem 0', borderBottom: '1px solid oklch(0.55 0.08 70 / 0.4)' }}
                >
                  <span className="folio col-span-12 md:col-span-2">{String(i + 1).padStart(2, '0')}</span>
                  <div className="col-span-4 md:col-span-3">
                    <span className="font-display text-amber" style={{ fontSize: '1.5rem' }}>{ing.measure}</span>
                  </div>
                  <div className="col-span-8 md:col-span-7">
                    <div className="font-display text-paper" style={{ fontSize: '1.25rem' }}>{ing.name}</div>
                    {ing.note && (
                      <div className="text-muted-foreground italic mt-1" style={{ fontSize: '0.875rem' }}>{ing.note}</div>
                    )}
                  </div>
                </div>
              ))}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                <Stat label="Glass" value={cocktail.glass} />
                <Stat label="Garnish" value={cocktail.garnish} />
                <Stat label="Method" value={cocktail.method} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Technique Steps ────────────────────────────────────────────────────── */

function TechniqueSteps({ cocktail }) {
  return (
    <section className="py-24 md:py-32 bg-ink-deep">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <Reveal>
          <Kicker>The Technique</Kicker>
          <h2 className="h-display text-h2 mt-4 text-paper max-w-2xl">How it is built, and why.</h2>
        </Reveal>
        <div className="mt-16" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {cocktail.technique.map((t, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-12 items-start">
                <div className="font-display text-amber/40" style={{ fontSize: 'clamp(5rem, 7rem, 7rem)', lineHeight: 1, color: 'oklch(0.74 0.13 65 / 0.4)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="h-display text-paper" style={{ fontSize: 'var(--mag-text-h3)' }}>{t.title}</h3>
                  <p className="text-paper-dim mt-4 max-w-2xl" style={{ lineHeight: 1.78, fontSize: 'var(--mag-text-body)' }}>{t.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Flavor & Culture ───────────────────────────────────────────────────── */

function FlavorAndCulture({ cocktail }) {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-[1480px] px-5 md:px-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start">
          <Reveal>
            <Kicker>Tasting Profile</Kicker>
            <h2 className="h-display text-h3 mt-4 text-paper">The Flavor Wheel</h2>
            <div className="mt-12">
              <MagazineFlavorWheel points={cocktail.flavor} />
            </div>
            <p className="text-paper-dim mt-10" style={{ lineHeight: 1.78, fontSize: 'var(--mag-text-body)' }}>{cocktail.tasting}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <Kicker>Cultural Context</Kicker>
            <h2 className="h-display text-h3 mt-4 text-paper">The hour it belongs to.</h2>
            <p className="text-paper-dim mt-10" style={{ lineHeight: 1.78, fontSize: '1.125rem' }}>{cocktail.cultural}</p>
            <HairlineRule ornament className="mt-16" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ─── Related Reading ────────────────────────────────────────────────────── */

function RelatedReading({ related, currentSlug, onNavigate }) {
  const filtered = related.filter((r) => r && r.slug !== currentSlug).slice(0, 3)
  if (!filtered.length) return null

  return (
    <section className="py-24 md:py-32 bg-ink-deep">
      <div className="mx-auto max-w-[1480px] px-5 md:px-10">
        <Reveal>
          <Kicker>Further Reading</Kicker>
          <h2 className="h-display text-h2 mt-4 text-paper">From the same shelf.</h2>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((r, i) => (
            <Reveal key={r.slug} delay={i * 0.08}>
              <button
                onClick={() => onNavigate({ slug: r.slug })}
                className="group w-full text-left"
                style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
                  <img
                    src={r.image}
                    alt={r.name}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover img-plate"
                    style={{ transition: 'transform 1400ms ease-out' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" style={{ opacity: 0.7 }} />
                </div>
                <div className="mt-6">
                  <Meta className="text-amber-deep">{r.era}</Meta>
                  <h3 className="h-display mt-2 text-paper" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)', transition: 'color 700ms' }}>
                    {r.name}
                  </h3>
                  <p className="text-paper-dim mt-2" style={{ fontSize: 'var(--mag-text-body)' }}>{r.tagline}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
