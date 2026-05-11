import React from 'react'

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const base = 'inline-flex items-center gap-2 font-semibold rounded transition-all disabled:opacity-40 disabled:cursor-not-allowed'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' }
  const variants = {
    primary: 'bg-hospia-gold text-hospia-black hover:bg-hospia-gold-light active:scale-95',
    secondary: 'bg-hospia-slate border border-hospia-border text-hospia-cream hover:border-hospia-gold hover:text-hospia-gold-light',
    ghost: 'text-hospia-muted hover:text-hospia-cream hover:bg-hospia-slate',
    danger: 'bg-hospia-danger text-white hover:opacity-90 active:scale-95',
    outline: 'border border-hospia-gold text-hospia-gold hover:bg-hospia-gold hover:text-hospia-black',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-hospia-slate border border-hospia-border rounded-hospia shadow-hospia ${className}`} {...props}>
      {children}
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  gold:    'bg-hospia-gold-dim text-hospia-gold-light border-hospia-gold-dim',
  green:   'bg-hospia-success-dim text-green-300 border-hospia-success-dim',
  red:     'bg-hospia-danger-dim text-red-300 border-hospia-danger-dim',
  gray:    'bg-hospia-slate text-hospia-muted border-hospia-border',
  blue:    'bg-blue-900/40 text-blue-300 border-blue-800',
  orange:  'bg-orange-900/40 text-orange-300 border-orange-800',
}

export function Badge({ color = 'gray', className = '', children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${BADGE_COLORS[color] || BADGE_COLORS.gray} ${className}`}>
      {children}
    </span>
  )
}

// ─── Metric ───────────────────────────────────────────────────────────────────
export function Metric({ label, value, sub, trend, className = '' }) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-hospia-muted'
  return (
    <Card className={`p-4 ${className}`}>
      <p className="text-xs font-medium text-hospia-muted uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold text-hospia-cream">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 ${trendColor}`}>{sub}</p>
      )}
    </Card>
  )
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-6 ${className}`}>
      <div>
        <h1 className="text-xl font-bold text-hospia-cream">{title}</h1>
        {subtitle && <p className="text-sm text-hospia-muted mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, error, className = '', children }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-medium text-hospia-muted uppercase tracking-wide mb-1">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 bg-hospia-graphite border border-hospia-border rounded text-hospia-cream placeholder-hospia-muted text-sm transition-colors focus:border-hospia-gold focus:outline-none ${className}`}
      {...props}
    />
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2 bg-hospia-graphite border border-hospia-border rounded text-hospia-cream placeholder-hospia-muted text-sm transition-colors focus:border-hospia-gold focus:outline-none resize-none ${className}`}
      {...props}
    />
  )
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ type = 'info', children, className = '' }) {
  const styles = {
    info:    'bg-blue-900/30 border-blue-700 text-blue-300',
    success: 'bg-hospia-success-dim border-hospia-success text-green-300',
    danger:  'bg-hospia-danger-dim border-hospia-danger text-red-300',
    warning: 'bg-orange-900/30 border-orange-700 text-orange-300',
  }
  return (
    <div className={`px-4 py-3 rounded border text-sm ${styles[type] || styles.info} ${className}`}>
      {children}
    </div>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ className = '' }) {
  return <hr className={`border-hospia-border my-4 ${className}`} />
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-hospia-muted mb-3 opacity-60">{icon}</div>}
      <p className="text-hospia-cream font-semibold mb-1">{title}</p>
      {subtitle && <p className="text-hospia-muted text-sm mb-4">{subtitle}</p>}
      {action}
    </div>
  )
}
