import { useEffect } from 'react'
import terroir from '../../../assets/wine-atlas/terroir.jpg'
import { WINE_STYLES } from '../atlasData'

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

export default function AtlasStyles() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div style={{ backgroundColor: C.ivory, color: C.foreground }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ height: '70vh', minHeight: '520px', backgroundColor: C.burgundyDeep }}>
        <img src={terroir} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover wa-img-cinematic wa-anim-slow-zoom" style={{ opacity: 0.80 }} width={1600} height={1100} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(63,13,13,0.50) 0%, transparent 50%, ${C.burgundyDeep} 100%)` }} />
        <div className="relative h-full mx-auto px-6 md:px-12 flex flex-col justify-end pb-16" style={{ maxWidth: '1600px' }}>
          <div style={{ ...eyebrow, color: C.amber }} className="wa-anim-fade-up">Folio VI</div>
          <h1 className="wa-anim-fade-up wa-anim-delay-1" style={{ fontFamily: font.display, color: C.ivory, fontSize: 'clamp(3.5rem,12vw,11rem)', lineHeight: 0.9, fontWeight: 400, marginTop: '1.5rem' }}>
            The <em style={{ color: C.amber }}>Styles</em>
          </h1>
          <p className="wa-anim-fade-up wa-anim-delay-2" style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.85)', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '40rem', marginTop: '2rem' }}>
            Eight ways a grape may become a wine — each a tradition, a chemistry, and
            a way of receiving the harvest.
          </p>
        </div>
      </section>

      {/* ── Styles list ── */}
      <section className="mx-auto px-6 md:px-12 py-24 md:py-32" style={{ maxWidth: '1400px' }}>
        <div className="space-y-2">
          {WINE_STYLES.map((s, i) => (
            <article
              key={s.name}
              className="group grid grid-cols-12 gap-6 md:gap-12 py-12 md:py-16 -mx-3 px-3 transition-colors"
              style={{ borderTop: `1px solid ${C.border}` }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = `${C.parchment}66`}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="col-span-12 md:col-span-1 pt-3" style={{ fontFamily: font.mono, fontSize: '0.75rem', color: C.mutedFg }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="col-span-12 md:col-span-4">
                <h2 style={{ fontFamily: font.display, fontSize: 'clamp(2.5rem,5vw,5rem)', color: C.burgundyDeep, lineHeight: 1, fontWeight: 400, transition: 'font-style 0.2s' }}>
                  {s.name}
                </h2>
                <div style={{ ...eyebrow, color: C.amber, marginTop: '0.75rem' }}>{s.tagline}</div>
              </div>
              <div className="col-span-12 md:col-span-7">
                <p style={{ fontFamily: font.serif, fontSize: '1.25rem', color: `${C.foreground}cc`, lineHeight: 1.6, maxWidth: '40rem' }}>
                  {s.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  )
}
