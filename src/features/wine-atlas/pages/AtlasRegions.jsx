import { useEffect } from 'react'
import atlasMap from '../../../assets/wine-atlas/atlas-map.jpg'
import terroir   from '../../../assets/wine-atlas/terroir.jpg'
import { COUNTRIES } from '../atlasData'

const C = {
  ivory:        '#f5f0e8',
  parchment:    '#ede6d5',
  foreground:   '#2a1c14',
  burgundy:     '#7a1818',
  burgundyDeep: '#3f0d0d',
  amber:        '#c4950a',
  border:       '#ccb898',
  mutedFg:      '#6b4e38',
}
const font = {
  display: 'Cormorant Garamond, Cormorant, serif',
  serif:   'Cormorant Garamond, serif',
  sans:    'Inter, Helvetica Neue, sans-serif',
  mono:    'JetBrains Mono, monospace',
}
const eyebrow = {
  fontFamily: font.sans, fontSize: '0.6875rem', fontWeight: 500,
  letterSpacing: '0.22em', textTransform: 'uppercase', color: C.burgundy,
}

export default function AtlasRegions() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div style={{ backgroundColor: C.ivory, color: C.foreground }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ height: '70vh', minHeight: '500px', backgroundColor: C.burgundyDeep }}>
        <img src={atlasMap} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover mix-blend-screen wa-anim-slow-zoom" style={{ opacity: 0.30 }} width={1600} height={1100} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(63,13,13,0.60) 0%, ${C.burgundyDeep} 100%)` }} />
        <div className="relative h-full mx-auto px-6 md:px-12 flex flex-col justify-end pb-16" style={{ maxWidth: '1600px' }}>
          <div style={{ ...eyebrow, color: C.amber }} className="wa-anim-fade-up">Folio II</div>
          <h1 className="wa-anim-fade-up wa-anim-delay-1" style={{ fontFamily: font.display, color: C.ivory, fontSize: 'clamp(3.5rem,12vw,11rem)', lineHeight: 0.9, fontWeight: 400, marginTop: '1.5rem' }}>
            The <em style={{ color: C.amber }}>Regions</em>
          </h1>
          <p className="wa-anim-fade-up wa-anim-delay-2" style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.85)', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '40rem', marginTop: '2rem' }}>
            An atlas of the world's vineyards — twelve countries, traced country by
            country, hillside by hillside.
          </p>
        </div>
      </section>

      {/* ── Country list ── */}
      <section className="mx-auto px-6 md:px-12 py-24 md:py-32" style={{ maxWidth: '1600px' }}>
        <div className="space-y-16">
          {COUNTRIES.map((c, i) => (
            <article key={c.name} className="grid grid-cols-12 gap-6 md:gap-12 pt-10" style={{ borderTop: `1px solid ${C.border}` }}>
              <div className="col-span-12 md:col-span-1 pt-2" style={{ fontFamily: font.mono, fontSize: '0.75rem', color: C.mutedFg }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="col-span-12 md:col-span-4">
                <div style={eyebrow}>Country</div>
                <h2 style={{ fontFamily: font.display, fontSize: 'clamp(2.5rem,5vw,5rem)', color: C.burgundyDeep, lineHeight: 1, fontWeight: 400, marginTop: '0.75rem' }}>{c.name}</h2>
              </div>
              <div className="col-span-12 md:col-span-7">
                <div style={{ ...eyebrow, marginBottom: '1rem' }}>Principal Appellations</div>
                <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {c.regions.map(r => (
                    <li key={r}>
                      <span style={{ fontFamily: font.serif, fontSize: '1.25rem', color: C.burgundyDeep, display: 'inline-block' }}>
                        {r}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Closing quote ── */}
      <section className="relative overflow-hidden" style={{ height: '60vh' }}>
        <img src={terroir} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover wa-img-cinematic" loading="lazy" width={1600} height={1100} />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(63,13,13,0.60)' }} />
        <div className="relative h-full mx-auto px-6 md:px-12 flex items-center" style={{ maxWidth: '1400px' }}>
          <blockquote className="max-w-2xl" style={{ margin: 0 }}>
            <p style={{ fontFamily: font.display, fontStyle: 'italic', color: C.ivory, fontSize: 'clamp(1.75rem,4vw,4rem)', lineHeight: 1.15, fontWeight: 400 }}>
              "Show me a map of the soil and I will show you the wine that will be made there."
            </p>
            <footer style={{ marginTop: '2rem', fontFamily: font.sans, fontSize: '0.7rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.amber }}>
              — Old French Adage
            </footer>
          </blockquote>
        </div>
      </section>

    </div>
  )
}
