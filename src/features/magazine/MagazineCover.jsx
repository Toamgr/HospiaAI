import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import {
  AmbientGlow, HairlineRule, Kicker, Meta, PullQuote, Reveal,
} from './MagazineEditorialPrimitives'
import { cocktails } from '../../content/cocktails'
import heroCover from '../../assets/magazine/hero-cover.jpg'
import barAtmosphere from '../../assets/magazine/bar-atmosphere.jpg'

export default function MagazineCover({ onNavigate }) {
  return (
    <>
      <CoverHero onNavigate={onNavigate} />
      <EditorLetter />
      <FeaturedStory onNavigate={onNavigate} />
      <ContactSheet onNavigate={onNavigate} />
      <IssueIndex onNavigate={onNavigate} />
      <CinematicPlate />
    </>
  )
}

/* ─── Cover Hero ─────────────────────────────────────────────────────────── */

function CoverHero({ onNavigate }) {
  const ref = useRef(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 120])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2])

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ minHeight: '100svh', paddingTop: '3.5rem' }}>
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <img
          src={heroCover}
          alt="A bartender stirring a cocktail in a darkly lit bar"
          className="absolute inset-0 w-full h-full object-cover img-plate"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/40 to-ink" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/30 to-transparent" />
      </motion.div>

      <AmbientGlow className="w-[700px] h-[700px] -top-32 -left-32" />

      <div className="relative mx-auto max-w-[1480px] px-5 md:px-10 flex flex-col" style={{ minHeight: '100svh' }}>
        <div className="pt-8 md:pt-14 flex items-center justify-between">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, ease: 'easeOut' }}>
            <Meta className="text-amber">Hestia · Classic Cocktails</Meta>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 0.15, ease: 'easeOut' }}>
            <Meta className="text-paper-dim">Issue Nº 01 · MMXXVI · Winter</Meta>
          </motion.div>
        </div>

        <div className="flex-1 flex items-end pb-16 md:pb-28">
          <div className="max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <Kicker>The Inaugural Issue</Kicker>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-cover mt-5 md:mt-8 text-paper"
            >
              The drinks
              <br />
              <span className="italic text-amber" style={{ fontWeight: 300 }}>that have</span>
              <br />
              outlasted us.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="deck mt-8 md:mt-12 max-w-2xl"
            >
              A field guide to the classics — their histories, their rituals,
              and the bartenders who keep them alive. From Florence in 1919
              to the speakeasies of Tokyo, an editorial atlas of the drinks
              that refuse to be forgotten.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.1 }}
              className="mt-12 md:mt-16 flex items-center gap-8"
            >
              <button onClick={() => onNavigate('stories')} className="meta text-paper reveal-link">
                Enter the Library →
              </button>
              <div className="hidden sm:block bg-rule" style={{ height: '2rem', width: '1px' }} />
              <button onClick={() => onNavigate({ slug: 'negroni' })} className="meta text-amber-deep reveal-link">
                Read the Feature
              </button>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.4 }}
          className="pb-6 md:pb-10 flex justify-between items-end"
        >
          <Meta className="text-muted-foreground">Cover Photograph · The Bartender's Hour</Meta>
          <Meta className="text-muted-foreground hidden md:block">Scroll ↓</Meta>
        </motion.div>
      </div>
    </section>
  )
}

/* ─── Editor's Letter ─────────────────────────────────────────────────────── */

function EditorLetter() {
  return (
    <section className="relative py-24 md:py-40">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <Reveal><Kicker>From the Editor</Kicker></Reveal>
        <Reveal delay={0.1}>
          <h2 className="h-display text-h2 mt-6 max-w-3xl text-paper">
            We started this magazine because nobody had bothered to make one.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-12 md:mt-16 grid md:grid-cols-[1fr_2fr] gap-8 md:gap-16">
            <div>
              <HairlineRule />
              <Meta className="mt-4 block text-amber-deep">N. Marlowe</Meta>
              <Meta className="block text-muted-foreground">Editor-in-Chief</Meta>
            </div>
            <div className="prose-editorial">
              <p>
                The classics are not a closed canon. They are a living
                inheritance — a set of recipes, yes, but also a set of gestures,
                temperatures, and arguments. The way a Negroni is built in
                Florence is not the way it is built in Tokyo, and both are
                correct. The way a Martini was poured in 1942 is not the way it
                will be poured tonight. The drinks have been evolving, quietly,
                for a hundred years, in the hands of the people who care about
                them most.
              </p>
              <p>
                This magazine exists to listen to those people. To photograph
                the drinks the way they deserve. To write about them with the
                care we would give to a building or a piece of music. Every
                issue is one frame of a very long conversation.
              </p>
              <p>
                Welcome to the first. Pour something. Stay a while.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ─── Featured Story ──────────────────────────────────────────────────────── */

function FeaturedStory({ onNavigate }) {
  const negroni = cocktails[0]
  return (
    <section className="relative py-24 md:py-40 bg-ink-deep">
      <div className="mx-auto max-w-[1480px] px-5 md:px-10">
        <Reveal>
          <div className="flex items-center justify-between">
            <Kicker>The Cover Feature</Kicker>
            <Meta className="text-muted-foreground hidden md:block">Pages 12 — 38</Meta>
          </div>
        </Reveal>
        <HairlineRule className="mt-6" />

        <div className="mt-12 md:mt-20 grid md:grid-cols-12 gap-8 md:gap-12 items-center">
          <Reveal className="md:col-span-7 order-2 md:order-1" delay={0.1}>
            <button
              onClick={() => onNavigate({ slug: negroni.slug })}
              className="relative w-full cursor-pointer"
              style={{ aspectRatio: '4/5', display: 'block', overflow: 'hidden', background: 'none', padding: 0, border: 'none' }}
            >
              <img
                src={negroni.image}
                alt={negroni.name}
                className="w-full h-full object-cover img-plate"
                style={{ display: 'block' }}
                loading="lazy"
              />
            </button>
          </Reveal>

          <Reveal className="md:col-span-5 order-1 md:order-2" delay={0.2}>
            <Meta className="text-amber-deep">{negroni.era}</Meta>
            <h2 className="h-display text-h1 mt-4 text-paper">
              The <span className="italic text-amber">Negroni</span>, properly understood.
            </h2>
            <p className="deck mt-8">{negroni.deck}</p>
            <button
              onClick={() => onNavigate({ slug: negroni.slug })}
              className="mt-10 meta text-paper reveal-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}
            >
              Read the feature →
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ─── Contact Sheet (all cocktails grid) ─────────────────────────────────── */

function ContactSheet({ onNavigate }) {
  const layouts = [
    'col-span-12 md:col-span-7 md:row-span-2',
    'col-span-6 md:col-span-5',
    'col-span-6 md:col-span-5',
    'col-span-6 md:col-span-4',
    'col-span-6 md:col-span-3',
  ]

  const displayCocktails = cocktails.slice(0, 5)

  return (
    <section className="relative py-24 md:py-40">
      <div className="mx-auto max-w-[1480px] px-5 md:px-10">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <Kicker>In This Issue</Kicker>
              <h2 className="h-display text-h2 mt-4 text-paper max-w-2xl">
                Five classics, photographed and written for the people who actually pour them.
              </h2>
            </div>
            <button onClick={() => onNavigate('stories')} className="meta text-amber reveal-link">
              The Full Library →
            </button>
          </div>
        </Reveal>

        <div className="mt-16 md:mt-24 grid grid-cols-12 gap-4 md:gap-6">
          {displayCocktails.map((c, i) => (
            <Reveal key={c.slug} className={layouts[i] || 'col-span-6'} delay={i * 0.06}>
              <button
                onClick={() => onNavigate({ slug: c.slug })}
                className="group relative block w-full h-full overflow-hidden"
                style={{ aspectRatio: i === 0 ? '4/5' : '3/4', background: 'none', padding: 0, border: 'none', cursor: 'pointer' }}
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover img-plate"
                  style={{ transition: 'transform 1400ms cubic-bezier(0.22,1,0.36,1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" style={{ opacity: 0.9 }} />
                <div className="absolute inset-0 p-5 md:p-7 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <span className="folio">№ {String(i + 1).padStart(2, '0')}</span>
                    <span className="meta text-amber-deep">{c.family}</span>
                  </div>
                  <div>
                    <Meta className="text-amber-deep">{c.era}</Meta>
                    <h3 className="h-display mt-2 text-paper" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)' }}>{c.name}</h3>
                    <p className="meta text-paper-dim mt-3" style={{ opacity: 0, transition: 'opacity 700ms' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    >Read the feature →</p>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Issue Index ─────────────────────────────────────────────────────────── */

function IssueIndex({ onNavigate }) {
  return (
    <section className="relative py-24 md:py-40 bg-ink-deep">
      <div className="mx-auto max-w-[1100px] px-5 md:px-10">
        <Reveal>
          <Kicker>Contents</Kicker>
          <h2 className="h-display text-h2 mt-4 text-paper">Issue Nº 01</h2>
        </Reveal>

        <div className="mt-16">
          {cocktails.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.03}>
              <button
                onClick={() => onNavigate({ slug: c.slug })}
                className="group w-full text-left py-7 border-t border-rule/40 last:border-b reveal-link"
                style={{ display: 'block', background: 'none', border: 'none', borderTop: `1px solid oklch(0.55 0.08 70 / 0.4)`, cursor: 'pointer', padding: '1.75rem 0', width: '100%' }}
              >
                <div className="grid grid-cols-12 items-baseline gap-4">
                  <span className="folio col-span-2 md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                  <div className="col-span-10 md:col-span-7">
                    <h3 className="h-display text-paper" style={{ fontSize: 'clamp(1.5rem, 1.2rem + 1.4vw, 2.25rem)', transition: 'color 700ms' }}>{c.name}</h3>
                    <p className="text-paper-dim mt-2 max-w-xl" style={{ fontSize: 'var(--mag-text-body)' }}>{c.tagline}</p>
                  </div>
                  <span className="meta text-muted-foreground hidden md:block col-span-3 text-right">{c.era}</span>
                  <span className="meta text-amber col-span-12 md:col-span-1 text-right" style={{ opacity: 0, transition: 'opacity 500ms' }}>→</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Cinematic Plate ─────────────────────────────────────────────────────── */

function CinematicPlate() {
  return (
    <section className="relative py-24 md:py-40">
      <Reveal>
        <div className="relative overflow-hidden" style={{ height: 'clamp(40vh, 80vh, 80vh)' }}>
          <img
            src={barAtmosphere}
            alt="A dimly lit speakeasy bar at night"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover img-plate"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto max-w-[1100px] px-5 md:px-10 w-full">
              <PullQuote
                quote="A cocktail is the smallest possible piece of theater. Two ounces of liquid, a single gesture, and an hour of someone's evening."
                attribution="— from the Editor's Letter"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
