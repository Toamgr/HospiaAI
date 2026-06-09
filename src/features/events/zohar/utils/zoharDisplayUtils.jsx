/**
 * Zohar display utilities — shared UI primitives and formatting helpers.
 * Used across all Zohar child components.
 * No intelligence logic: purely rendering primitives and color/label constants.
 */

import React, { useState } from 'react'

// ── Color helpers ──────────────────────────────────────────────────────────────

export function scoreColor(score) {
  if (score >= 75) return '#4A7C59'
  if (score >= 40) return '#C9A96E'
  return '#C17F2A'
}

export function scoreTextColor(score) {
  if (score >= 75) return '#6BAF80'
  if (score >= 40) return '#C9A96E'
  return '#D4943A'
}

export function severityColor(severity) {
  const s = (severity || '').toLowerCase()
  if (s === 'critical') return '#c05050'
  if (s === 'high')     return '#D4943A'
  if (s === 'medium')   return '#C9A96E'
  return '#6BAF80'
}

export function statusStyle(status) {
  if (status === 'Ready')       return { color: '#6BAF80', border: 'rgba(74,124,89,0.28)',   bg: 'rgba(74,124,89,0.07)' }
  if (status === 'In Progress') return { color: '#C9A96E', border: 'rgba(201,169,110,0.28)', bg: 'rgba(201,169,110,0.06)' }
  return                               { color: '#C44A4A', border: 'rgba(196,74,74,0.28)',   bg: 'rgba(196,74,74,0.06)' }
}

export function confidenceDot(confidence) {
  if (confidence === 'high')   return '#6BAF80'
  if (confidence === 'medium') return '#C9A96E'
  return '#5A5550'
}

// ── Shared UI primitives ───────────────────────────────────────────────────────

export function Card({ children, style }) {
  return (
    <div style={{ background: '#141414', border: '1px solid #1E1E1E', borderRadius: 8, overflow: 'hidden', ...style }}>
      {children}
    </div>
  )
}

export function CardHead({ children, right }) {
  return (
    <div style={{ padding: '9px 14px', borderBottom: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5A5550' }}>
        {children}
      </span>
      {right}
    </div>
  )
}

export function FieldRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '5px 14px', borderBottom: '1px solid #141414', gap: 12 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#5A5550', flexShrink: 0, paddingTop: 1 }}>
        {label}
      </span>
      <span style={{ fontSize: 10.5, color: '#9A9590', textAlign: 'right', lineHeight: 1.5 }}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '—')}
      </span>
    </div>
  )
}

export function NoteRow({ label, value }) {
  return (
    <div style={{ padding: '7px 14px', borderBottom: '1px solid #141414' }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#5A5550', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: '#9A9590', lineHeight: 1.6 }}>
        {value || '—'}
      </div>
    </div>
  )
}

export function BulletRow({ text, dotColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 14px' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dotColor || '#5A5550', flexShrink: 0, marginTop: 5, display: 'inline-block' }} />
      <span style={{ fontSize: 10.5, color: '#9A9590', lineHeight: 1.55 }}>{text}</span>
    </div>
  )
}

export function ZMark() {
  return (
    <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
        <path d="M3.5 3.5H14.5L4.5 14.5H14.5" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function GhostButton({ children, onClick, disabled, danger }) {
  const baseColor = danger ? '#C44A4A' : '#C9A96E'
  const baseBg    = danger ? 'rgba(196,74,74,0.07)' : 'rgba(201,169,110,0.07)'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'rgba(90,84,80,0.07)' : baseBg,
        border: `1px solid ${disabled ? '#2A2A2A' : (danger ? 'rgba(196,74,74,0.22)' : 'rgba(201,169,110,0.22)')}`,
        borderRadius: 5, color: disabled ? '#3A3A3A' : baseColor, cursor: disabled ? 'default' : 'pointer',
        padding: '5px 11px', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
        transition: 'all 150ms ease',
      }}
    >
      {children}
    </button>
  )
}

export function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        background: copied ? 'rgba(74,124,89,0.12)' : 'rgba(201,169,110,0.07)',
        border: `1px solid ${copied ? 'rgba(74,124,89,0.28)' : 'rgba(201,169,110,0.22)'}`,
        borderRadius: 5, color: copied ? '#6BAF80' : '#C9A96E', cursor: 'pointer',
        padding: '5px 11px', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em',
        textTransform: 'uppercase', transition: 'all 150ms ease',
      }}
    >
      {copied ? 'Copied ✓' : label}
    </button>
  )
}

export function ScoreBar({ score, color }) {
  return (
    <div style={{ height: 3, borderRadius: 2, background: '#1E1E1E', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, score))}%`, background: color, borderRadius: 2, transition: 'width 600ms ease' }} />
    </div>
  )
}
