import { motion, useReducedMotion } from 'framer-motion'

export function Kicker({ children, className = '' }) {
  return <span className={`kicker ${className}`}>{children}</span>
}

export function Meta({ children, className = '' }) {
  return <span className={`meta ${className}`}>{children}</span>
}

export function Folio({ children, className = '' }) {
  return <span className={`folio ${className}`}>{children}</span>
}

export function HairlineRule({ ornament = false, className = '' }) {
  if (!ornament) return <div className={`hairline ${className}`} />
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="hairline flex-1" />
      <span style={{ fontFamily: 'var(--mag-font-display)', color: 'var(--mag-amber)', fontSize: '1.125rem', lineHeight: 1 }}>✦</span>
      <div className="hairline flex-1" />
    </div>
  )
}

export function PullQuote({ quote, attribution, className = '' }) {
  return (
    <figure className={`py-12 md:py-20 ${className}`}>
      <blockquote style={{
        fontFamily: 'var(--mag-font-display)',
        fontWeight: 300,
        fontStyle: 'italic',
        fontSize: 'clamp(1.5rem, 1rem + 2.4vw, 2.75rem)',
        lineHeight: 1.25,
        letterSpacing: '-0.015em',
        color: 'var(--mag-paper)',
      }}>
        <span style={{ color: 'var(--mag-amber)', paddingRight: '0.5rem', verticalAlign: 'top', fontSize: '1.875rem' }}>"</span>
        {quote}
        <span style={{ color: 'var(--mag-amber)', paddingLeft: '0.25rem', verticalAlign: 'top', fontSize: '1.875rem' }}>"</span>
      </blockquote>
      {attribution && (
        <figcaption className="meta mt-6 text-amber-deep">{attribution}</figcaption>
      )}
    </figure>
  )
}

export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />
}

export function Reveal({ children, className = '', delay = 0, y = 16, ...rest }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function AmbientGlow({ className = '' }) {
  return <div className={`ambient-glow ${className}`} aria-hidden="true" />
}
