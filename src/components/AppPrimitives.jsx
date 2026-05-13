import React from 'react'
import { cx, titleCase } from '../utils/format'

export function Card({ children, className = '' }) {
  return (
    <section className={cx('rounded-[1.5rem] border border-[#6b705c]/10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a08] p-5 lg:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]', className)}>
      {children}
    </section>
  )
}

export function Button({ children, onClick, variant = 'primary', className = '', disabled, type = 'button' }) {
  const styles = {
    primary: 'bg-[#c9a96e] text-[#0d0c09] hover:bg-[#dfc497] shadow-xl shadow-[#c9a96e]/10',
    secondary: 'border border-[#6b705c]/30 bg-transparent text-[#f5f5f0] hover:border-[#c9a96e]/40 hover:text-[#c9a96e]',
    ghost: 'text-[#e8dcc0] hover:bg-[#6b705c]/20 hover:text-[#f5f5f0]'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex min-h-10 items-center justify-center rounded-xl px-5 py-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  )
}

export function Label({ children }) {
  return (
    <div className="mb-3 text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">
      {children}
    </div>
  )
}

export function Header({ eyebrow, title, body }) {
  return (
    <header className="mb-6 lg:mb-8">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e]">{eyebrow}</div>
      <h1 className="max-w-4xl font-serif text-3xl font-black leading-tight tracking-tighter text-[#f5f5f0] sm:text-4xl lg:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-[#e8dcc0] opacity-80 italic">{body}</p>
    </header>
  )
}

export function Field({ id, label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
      />
    </div>
  )
}

export function TextArea({ id, label, value, onChange, rows = 5 }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full resize-y rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm leading-7 text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
      />
    </div>
  )
}

export function Progress({ value, label }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
      <div className="h-2 overflow-hidden rounded-full bg-[#6b705c]/30">
        <div className="h-full rounded-full bg-[#c9a96e]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

export function ProgressBlock({ label, value }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-black text-[#c9a96e]">{value}%</span>
      </div>
      <Progress value={value} label={label} />
    </div>
  )
}

export function Metric({ label, value, sub, large = false }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full border border-[#c9a96e]/5" />
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e] opacity-60">{label}</div>
      <div className={cx('mt-3 font-serif font-black tracking-tighter text-[#f5f5f0]', large ? 'text-5xl' : 'text-3xl')}>{value}</div>
      <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-[#e8dcc0] opacity-40">{sub}</p>
    </Card>
  )
}

export function List({ items }) {
  return (
    <div className="grid gap-3">
      {items.map(item => (
        <div key={item} className="rounded-2xl border border-[#6b705c]/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-[#e8dcc0]">
          {item}
        </div>
      ))}
    </div>
  )
}

export function Alert({ type, children }) {
  const styles = {
    success: 'border-emerald-700/40 bg-emerald-950/25 text-emerald-200',
    error: 'border-red-700/40 bg-red-950/25 text-red-200',
    warning: 'border-amber-700/40 bg-amber-950/25 text-amber-200',
    info: 'border-[#6b705c]/30 bg-[#1a1a1a] text-[#e8dcc0]'
  }
  return (
    <div className={cx('rounded-2xl border p-4 text-sm leading-7', styles[type] || styles.info)}>
      {children}
    </div>
  )
}

export function MiniFact({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#6b705c]/30 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-bold text-[#e8dcc0]">{label}</span>
      <span className="font-serif text-xl font-black text-[#f5f5f0]">{value}</span>
    </div>
  )
}

export function SmallReportFact({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#6b705c]/25 bg-[#1a1a1a] p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
      <div className="mt-1 break-words text-xs font-black leading-5 text-[#f5f5f0]">{value}</div>
    </div>
  )
}

export function LabSelect({ label, value, options, onChange }) {
  const id = `lab-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{label}</label>
      <select id={id} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20">
        {options.map(option => <option key={option} value={option}>{titleCase(option) || option}</option>)}
      </select>
    </div>
  )
}

export function LanguageSwitcher({ t, lang, setLang }) {
  return (
    <div className="flex shrink-0 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-1">
      {[
        ['en', t.app.english],
        ['he', t.app.hebrew]
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => setLang(key)}
          className={cx(
            'rounded-lg px-3 py-1.5 text-xs font-black transition',
            lang === key ? 'bg-[#c9a96e] text-[#11100d]' : 'text-[#e8dcc0] hover:text-[#f5f5f0]'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
