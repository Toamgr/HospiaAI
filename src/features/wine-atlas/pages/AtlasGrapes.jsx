import { useEffect } from 'react'
import grapeMacro from '../../../assets/wine-atlas/grape-macro.jpg'
import { GRAPES_FULL } from '../atlasData'

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

function Dots({ value, max = 5, color = 'burgundy' }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          style={{
            height: '6px', width: '6px', borderRadius: '50%',
            backgroundColor: i < value ? (color === 'amber' ? C.amber : C.burgundy) : C.border,
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  )
}

export default function AtlasGrapes() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div style={{ backgroundColor: C.ivory, color: C.foreground }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ height: '70vh', minHeight: '520px', backgroundColor: C.burgundyDeep }}>
        <img src={grapeMacro} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover wa-img-cinematic wa-anim-slow-zoom" style={{ opacity: 0.85 }} width={1400} height={1750} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${C.burgundyDeep} 0%, rgba(63,13,13,0.40) 50%, rgba(63,13,13,0.70) 100%)` }} />
        <div className="relative h-full mx-auto px-6 md:px-12 flex flex-col justify-end pb-16" style={{ maxWidth: '1600px' }}>
          <div style={{ ...eyebrow, color: C.amber }} className="wa-anim-fade-up">Folio III</div>
          <h1 className="wa-anim-fade-up wa-anim-delay-1" style={{ fontFamily: font.display, color: C.ivory, fontSize: 'clamp(3.5rem,12vw,11rem)', lineHeight: 0.9, fontWeight: 400, marginTop: '1.5rem' }}>
            The <em style={{ color: C.amber }}>Grapes</em>
          </h1>
          <p className="wa-anim-fade-up wa-anim-delay-2" style={{ fontFamily: font.serif, fontStyle: 'italic', color: 'rgba(245,240,232,0.85)', fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '40rem', marginTop: '2rem' }}>
            Twelve varieties that shaped the modern wine world — each a personality,
            a climate, and a way of seeing.
          </p>
        </div>
      </section>

      {/* ── Grape cards ── */}
      <section className="mx-auto px-6 md:px-12 py-24 md:py-32" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
          {GRAPES_FULL.map((g, i) => (
            <article key={g.name} className="group wa-hover-rise pt-8" style={{ borderTop: `1px solid ${C.border}` }}>
              <div className="flex items-baseline justify-between" style={{ fontFamily: font.sans, fontSize: '0.68rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mutedFg }}>
                <span>№ {String(i + 1).padStart(2, '0')}</span>
                <span>{g.color} · {g.home}</span>
              </div>
              <h2 style={{ fontFamily: font.display, fontSize: 'clamp(2.5rem,5vw,5rem)', color: C.burgundyDeep, lineHeight: 1, fontWeight: 400, marginTop: '1.5rem', transition: 'font-style 0.2s' }}>
                {g.name}
              </h2>
              <p style={{ fontFamily: font.serif, fontStyle: 'italic', color: `${C.foreground}cc`, fontSize: '1.125rem', marginTop: '1.25rem' }}>
                {g.notes}
              </p>

              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { label: 'Body',     value: g.body,   color: 'burgundy' },
                  { label: 'Acidity',  value: g.acid,   color: 'amber' },
                  { label: 'Tannin',   value: g.tannin, color: 'burgundy' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ fontFamily: font.sans, fontSize: '0.65rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: C.mutedFg, marginBottom: '0.5rem' }}>
                      {label}
                    </div>
                    <Dots value={value} color={color} />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  )
}
