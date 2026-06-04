import heroVineyard from '../../../assets/wine-atlas/hero-vineyard.jpg'
import grapeMacro    from '../../../assets/wine-atlas/grape-macro.jpg'
import cellar        from '../../../assets/wine-atlas/cellar.jpg'
import atlasMap      from '../../../assets/wine-atlas/atlas-map.jpg'
import glass         from '../../../assets/wine-atlas/glass.jpg'
import terroir       from '../../../assets/wine-atlas/terroir.jpg'
import { REGIONS, GRAPES_INDEX, TASTING_MATRIX, PINOT_NOIR_ATTRIBUTES } from '../atlasData'

// ── Design tokens (inline, scoped to this component) ──
const C = {
  ivory:          '#f5f0e8',
  parchment:      '#ede6d5',
  foreground:     '#2a1c14',
  burgundy:       '#7a1818',
  burgundyDeep:   '#3f0d0d',
  amber:          '#c4950a',
  border:         '#ccb898',
  mutedFg:        '#6b4e38',
  card:           '#f0e5cc',
}

const font = {
  display: 'Cormorant Garamond, Cormorant, serif',
  serif:   'Cormorant Garamond, serif',
  sans:    'Inter, Helvetica Neue, sans-serif',
  mono:    'JetBrains Mono, monospace',
}

const eyebrow = {
  fontFamily:    font.sans,
  fontSize:      '0.6875rem',
  fontWeight:    500,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color:         C.burgundy,
}

export default function AtlasHome({ setView }) {
  return (
    <div style={{ backgroundColor: C.ivory, color: C.foreground }}>

      {/* ─── HERO — Atlas Cover ─────────────────────────────────── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: '100svh', minHeight: '720px', backgroundColor: C.burgundyDeep }}
      >
        <img
          src={heroVineyard}
          alt="Vineyard at dawn in a European wine region, mist rising over the rows"
          className="absolute inset-0 h-full w-full object-cover wa-img-cinematic wa-anim-slow-zoom"
          style={{ opacity: 0.9 }}
          width={1920} height={1280}
        />
        {/* Cinematic vignette */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, rgba(63,13,13,0.55) 0%, transparent 50%, rgba(63,13,13,0.85) 100%)` }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to right, rgba(63,13,13,0.40) 0%, transparent 60%)` }}
        />

        <div
          className="relative z-10 h-full flex flex-col justify-between px-6 md:px-12 pt-32 pb-12 mx-auto"
          style={{ maxWidth: '1600px' }}
        >
          <div className="grid grid-cols-12 gap-6 flex-1 items-end">
            <div className="col-span-12 md:col-span-9">
              <div className="wa-anim-fade-up">
                <div className="flex items-center gap-4" style={{ color: 'rgba(245,240,232,0.70)' }}>
                  <span style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Chapter One</span>
                  <span style={{ height: '1px', width: '48px', backgroundColor: 'rgba(245,240,232,0.40)', display: 'inline-block' }} />
                  <span style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>The Atlas Opens</span>
                </div>
              </div>

              <h1
                className="wa-anim-fade-up wa-anim-delay-1 wa-font-display mt-8"
                style={{
                  fontFamily: font.display,
                  color: C.ivory,
                  lineHeight: 0.92,
                  fontSize: 'clamp(3.5rem, 11vw, 11rem)',
                  letterSpacing: '-0.01em',
                  fontWeight: 400,
                }}
              >
                The <em style={{ color: C.amber }}>Wine</em><br />Atlas
              </h1>

              <p
                className="wa-anim-fade-up wa-anim-delay-2 mt-10 max-w-xl"
                style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.85)', fontSize: '1.25rem', lineHeight: 1.6 }}
              >
                A cinematic geography of vine, soil, and season — and a private academy
                for those who would learn to read wine as a sommelier reads the world.
              </p>
            </div>

            <div className="col-span-12 md:col-span-3 wa-anim-fade-up wa-anim-delay-3 md:text-right">
              <div style={{ fontFamily: font.sans, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.60)', marginBottom: '0.75rem' }}>Folio</div>
              <div style={{ fontFamily: font.display, fontSize: '3rem', color: C.ivory, lineHeight: 1 }}>№ 01</div>
              <div style={{ marginTop: '1.5rem', fontFamily: font.sans, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.60)' }}>
                Hestia Editions<br />MMXXVI
              </div>
            </div>
          </div>

          <div
            className="wa-anim-fade-up wa-anim-delay-3 mt-12 flex items-end justify-between pt-6"
            style={{ borderTop: '1px solid rgba(245,240,232,0.25)' }}
          >
            <div style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.70)' }}>
              Burgundy · 47.0°N · Côte d'Or
            </div>
            <button
              onClick={() => setView('regions')}
              className="group flex items-center gap-3 transition-colors bg-transparent border-0 cursor-pointer"
              style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.ivory }}
            >
              <span>Enter the Atlas</span>
              <span style={{ display: 'inline-block', height: '1px', width: '48px', backgroundColor: 'currentColor', transition: 'width 0.3s' }} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── EDITORIAL OPENING ──────────────────────────────────── */}
      <section className="mx-auto px-6 md:px-12 py-32 md:py-44" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-12 gap-8 md:gap-12">
          <div className="col-span-12 md:col-span-3">
            <div style={eyebrow}>Editor's Letter</div>
            <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: C.mutedFg, fontFamily: font.mono }}>I — Of Place & Patience</div>
          </div>

          <div className="col-span-12 md:col-span-6">
            <p style={{ fontFamily: font.display, fontSize: 'clamp(1.8rem, 2.4vw, 2.6rem)', lineHeight: 1.25, color: C.burgundyDeep, fontWeight: 400 }}>
              <em style={{ fontFamily: font.serif }}>Wine</em> is the only beverage that
              insists on being from <em>somewhere</em>. It is the
              memory of a hillside, a season's weather, the patience of a winemaker who
              has watched the same stretch of sky for forty harvests.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-8 text-sm leading-relaxed" style={{ color: `${C.foreground}cc` }}>
              <p>
                The Hestia Wine Atlas is not a course, nor a database. It is a
                publication — a slow, deliberate cartography of vineyards,
                grapes, and the human craft that turns geography into glass.
              </p>
              <p>
                Each region is a chapter. Each grape, a character. Each tasting note,
                a small piece of forensic literature. Read it as you would a serious
                book — and you will, in time, taste like a sommelier.
              </p>
            </div>
            <div className="mt-12 wa-rule-line" />
            <div className="mt-6 flex items-center gap-4">
              <div
                className="grid place-items-center rounded-full"
                style={{ height: '3rem', width: '3rem', backgroundColor: C.burgundy, color: C.ivory, fontFamily: font.display, fontSize: '1.125rem' }}
              >
                M
              </div>
              <div>
                <div style={{ fontFamily: font.serif, fontStyle: 'italic', color: C.burgundyDeep }}>Margaux Verrier</div>
                <div style={{ ...eyebrow, color: C.mutedFg, marginTop: '2px' }}>Editor in Chief · WSET Diploma</div>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 md:pl-6">
            <div className="overflow-hidden" style={{ aspectRatio: '3/4' }}>
              <img src={glass} alt="A crystal glass of red wine in candlelight" loading="lazy"
                className="h-full w-full object-cover wa-img-cinematic" width={1200} height={1500} />
            </div>
            <div style={{ marginTop: '0.75rem', ...eyebrow, color: C.mutedFg }}>
              Plate I — A Burgundy at Candlelight
            </div>
          </div>
        </div>
      </section>

      {/* ─── REGIONS ATLAS ──────────────────────────────────────── */}
      <section className="relative overflow-hidden py-32 md:py-44" style={{ backgroundColor: C.burgundyDeep, color: C.ivory }}>
        <img src={atlasMap} alt="" aria-hidden
          className="absolute inset-0 h-full w-full object-cover mix-blend-screen"
          style={{ opacity: 0.15 }} loading="lazy" width={1600} height={1100} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${C.burgundyDeep} 0%, rgba(63,13,13,0.85) 50%, ${C.burgundyDeep} 100%)` }} />

        <div className="relative mx-auto px-6 md:px-12" style={{ maxWidth: '1600px' }}>
          <div className="grid grid-cols-12 gap-8 mb-20">
            <div className="col-span-12 md:col-span-4">
              <div style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.amber }}>Folio II</div>
              <h2 style={{ fontFamily: font.display, fontSize: 'clamp(3.5rem,8vw,8rem)', lineHeight: 0.95, color: C.ivory, fontWeight: 400, marginTop: '1.5rem' }}>
                The <em style={{ color: C.amber }}>Regions</em>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-5 md:col-start-7 self-end">
              <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.85)', fontSize: '1.125rem', lineHeight: 1.6 }}>
                Twelve countries. Forty-seven appellations of consequence. Each region
                is a confession of climate, of soil, of cultural temperament expressed
                through fermentation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-x-8 gap-y-10">
            {REGIONS.map((r, i) => (
              <button
                key={r.name}
                onClick={() => setView('regions')}
                className={`group wa-hover-rise bg-transparent border-0 cursor-pointer text-left pt-6 ${i === 0 ? 'col-span-12 lg:col-span-8' : 'col-span-12 sm:col-span-6 lg:col-span-4'}`}
                style={{ borderTop: '1px solid rgba(245,240,232,0.20)' }}
              >
                <div className="flex items-baseline justify-between" style={{ fontFamily: font.sans, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.55)' }}>
                  <span>Region {r.n}</span>
                  <span>{r.lat}</span>
                </div>
                <div style={{ fontFamily: font.display, fontSize: i === 0 ? 'clamp(3rem,8vw,8rem)' : 'clamp(2rem,5vw,5rem)', lineHeight: 1, color: C.ivory, marginTop: '1.5rem', fontWeight: 400, transition: 'color 0.2s' }}
                  className="group-hover:text-wa-amber"
                  onMouseEnter={e => e.currentTarget.style.color = C.amber}
                  onMouseLeave={e => e.currentTarget.style.color = C.ivory}
                >
                  {r.name}
                </div>
                <div style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.70)', marginTop: '1rem' }}>{r.country}</div>
                <div style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.50)', marginTop: '0.5rem' }}>
                  Signature · {r.grape}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED GRAPE — Editorial Spread ──────────────────── */}
      <section className="mx-auto px-6 md:px-12 py-32 md:py-44" style={{ maxWidth: '1600px' }}>
        <div style={eyebrow} className="mb-12">Folio III · Grape of the Week</div>
        <div className="grid grid-cols-12 gap-8 md:gap-16 items-center">
          <div className="col-span-12 md:col-span-6 lg:col-span-5">
            <div className="overflow-hidden" style={{ aspectRatio: '4/5' }}>
              <img src={grapeMacro} alt="Macro photograph of dark wine grapes on the vine"
                loading="lazy" className="h-full w-full object-cover wa-img-cinematic"
                width={1400} height={1750} />
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-7">
            <div style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.burgundy }}>Vitis Vinifera · Black-skinned</div>
            <h3 style={{ fontFamily: font.display, fontSize: 'clamp(3rem,7vw,7rem)', lineHeight: 0.9, color: C.burgundyDeep, marginTop: '1rem', fontWeight: 400 }}>
              Pinot<br /><em>Noir</em>
            </h3>

            <p style={{ fontFamily: font.serif, fontStyle: 'italic', fontSize: '1.25rem', color: `${C.foreground}cc`, maxWidth: '36rem', lineHeight: 1.6, marginTop: '2rem' }}>
              The translucent aristocrat of Burgundy. Thin-skinned, restless, and almost
              impossible to grow well — which is precisely why it has broken the hearts
              of more winemakers than any other variety.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6">
              {PINOT_NOIR_ATTRIBUTES.map(([k, v]) => (
                <div key={k} style={{ borderTop: `1px solid ${C.border}`, paddingTop: '0.75rem' }}>
                  <div style={{ fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mutedFg }}>{k}</div>
                  <div style={{ fontFamily: font.serif, color: C.burgundyDeep, fontSize: '1rem', marginTop: '0.25rem' }}>{v}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setView('grapes')}
              className="mt-12 inline-flex items-center gap-3 transition-colors bg-transparent border-0 cursor-pointer"
              style={{ fontFamily: font.sans, fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.burgundy }}
            >
              <span>Read the Full Grape Profile</span>
              <span style={{ display: 'inline-block', height: '1px', width: '48px', backgroundColor: 'currentColor' }} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── WSET TASTING SPREAD ────────────────────────────────── */}
      <section className="relative py-32 md:py-44" style={{ backgroundColor: C.parchment }}>
        <div className="mx-auto px-6 md:px-12" style={{ maxWidth: '1600px' }}>
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-5">
              <div style={eyebrow}>Folio IV · The Academy</div>
              <h2 style={{ fontFamily: font.display, fontSize: 'clamp(3rem,8vw,8rem)', lineHeight: 0.95, color: C.burgundyDeep, marginTop: '1.5rem', fontWeight: 400 }}>
                The <em>Systematic</em><br />Approach
              </h2>
              <p style={{ fontFamily: font.serif, fontStyle: 'italic', fontSize: '1.125rem', color: `${C.foreground}cc`, maxWidth: '28rem', lineHeight: 1.6, marginTop: '2rem' }}>
                We teach the WSET tasting method as it is taught in the great trade
                rooms of London and Paris — but slower, with more patience and a great
                deal more atmosphere.
              </p>
              <button
                onClick={() => setView('academy')}
                className="mt-12 inline-flex items-center gap-3 transition-colors bg-transparent border-0 cursor-pointer"
                style={{ fontFamily: font.sans, fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.burgundy }}
              >
                <span>Enter the Academy</span>
                <span style={{ display: 'inline-block', height: '1px', width: '48px', backgroundColor: 'currentColor' }} />
              </button>
            </div>

            <div className="col-span-12 md:col-span-7">
              <div style={{ border: `1px solid ${C.border}`, backgroundColor: `${C.ivory}99` }}>
                {TASTING_MATRIX.map((row, idx) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-12"
                    style={{ borderBottom: idx < TASTING_MATRIX.length - 1 ? `1px solid ${C.border}` : 'none' }}
                  >
                    <div
                      className="col-span-3 p-5 md:p-6"
                      style={{ borderRight: `1px solid ${C.border}`, backgroundColor: `${C.parchment}99` }}
                    >
                      <div style={eyebrow}>{row.label}</div>
                    </div>
                    <div className="col-span-9 p-5 md:p-6 space-y-1" style={{ fontFamily: font.serif, color: C.burgundyDeep }}>
                      {row.items.map(it => <div key={it} style={{ fontSize: '0.95rem' }}>{it}</div>)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '1rem', fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mutedFg, textAlign: 'right' }}>
                Specimen Note · Gevrey-Chambertin 1er Cru · 2019
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PULL QUOTE ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: '80vh', minHeight: '600px' }}>
        <img src={cellar} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover wa-img-cinematic wa-anim-slow-zoom" loading="lazy" width={1600} height={1100} />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(63,13,13,0.65)' }} />
        <div className="relative h-full mx-auto px-6 md:px-12 flex items-center" style={{ maxWidth: '1400px' }}>
          <blockquote className="max-w-3xl" style={{ margin: 0 }}>
            <div style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.amber, marginBottom: '2rem' }}>A Sommelier's Note</div>
            <p style={{ fontFamily: font.display, fontStyle: 'italic', color: C.ivory, fontSize: 'clamp(2rem,5vw,5rem)', lineHeight: 1.1, fontWeight: 400 }}>
              "To taste wine seriously is to read a landscape with your tongue —
              to find, in a single glass, the slope of a hill and the kindness
              of a winemaker."
            </p>
            <footer style={{ marginTop: '2.5rem', color: 'rgba(245,240,232,0.70)', fontFamily: font.sans, fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              — Henri Lacombe · Maître Sommelier, Lyon
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ─── GRAPE INDEX ────────────────────────────────────────── */}
      <section className="mx-auto px-6 md:px-12 py-32 md:py-44" style={{ maxWidth: '1600px' }}>
        <div className="flex items-end justify-between mb-16">
          <div>
            <div style={eyebrow}>Folio V</div>
            <h2 style={{ fontFamily: font.display, fontSize: 'clamp(3rem,7vw,7rem)', color: C.burgundyDeep, lineHeight: 0.95, fontWeight: 400, marginTop: '1rem' }}>
              An <em>Index</em> of Grapes
            </h2>
          </div>
          <button
            onClick={() => setView('grapes')}
            className="hidden md:inline-block transition-colors bg-transparent border-0 cursor-pointer"
            style={{ fontFamily: font.sans, fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.burgundy }}
          >
            View all twelve →
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {GRAPES_INDEX.map((g, i) => (
            <button
              key={g.name}
              onClick={() => setView('grapes')}
              className="group w-full grid grid-cols-12 gap-4 text-left transition-colors bg-transparent border-0 cursor-pointer px-1"
              style={{ borderBottom: `1px solid ${C.border}`, padding: '1.75rem 0.25rem' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = `${C.parchment}80`}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="col-span-1" style={{ fontFamily: font.mono, fontSize: '0.75rem', color: C.mutedFg }}>{String(i + 1).padStart(2, '0')}</div>
              <div className="col-span-11 md:col-span-5">
                <div style={{ fontFamily: font.display, fontSize: 'clamp(1.5rem,4vw,4rem)', color: C.burgundyDeep, fontWeight: 400, transition: 'font-style 0.2s' }}>
                  {g.name}
                </div>
              </div>
              <div className="col-span-6 md:col-span-2" style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mutedFg }}>
                {g.color}
              </div>
              <div className="col-span-6 md:col-span-3" style={{ fontFamily: font.serif, fontStyle: 'italic', color: `${C.foreground}bb`, fontSize: '0.9rem' }}>
                {g.structure}
              </div>
              <div className="hidden md:block col-span-1 text-right" style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.burgundy }}>
                {g.home}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ─── TERROIR CLOSER ─────────────────────────────────────── */}
      <section className="relative">
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-7 relative overflow-hidden" style={{ height: '60vh', minHeight: '400px' }}>
            <img src={terroir} alt="Terraced vineyard at sunset" loading="lazy"
              className="absolute inset-0 h-full w-full object-cover wa-img-cinematic"
              width={1600} height={1100} />
          </div>
          <div className="col-span-12 md:col-span-5 flex flex-col justify-center p-10 md:p-16 lg:p-24" style={{ backgroundColor: C.burgundyDeep, color: C.ivory }}>
            <div style={{ fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.amber, marginBottom: '1.5rem' }}>
              Coming in the Next Folio
            </div>
            <h3 style={{ fontFamily: font.display, fontSize: 'clamp(2.5rem,5vw,5rem)', lineHeight: 0.95, fontWeight: 400 }}>
              <em>Terroir</em> — The Unspoken Author of Every Wine
            </h3>
            <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.85)', lineHeight: 1.6, marginTop: '2rem' }}>
              We trace the journey of one Nebbiolo grape from limestone soil to glass,
              and ask why the same vine, planted forty metres lower, makes an entirely
              different wine.
            </p>
            <button
              onClick={() => setView('academy')}
              className="mt-10 inline-flex items-center gap-3 transition-colors bg-transparent border-0 cursor-pointer"
              style={{ fontFamily: font.sans, fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.ivory }}
            >
              <span>Subscribe to the Atlas</span>
              <span style={{ display: 'inline-block', height: '1px', width: '48px', backgroundColor: 'currentColor' }} />
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
