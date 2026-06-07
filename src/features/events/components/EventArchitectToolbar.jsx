import React from 'react'

const MODES = [
  { key: 'architect', label: 'Architect', desc: 'Full venue overview' },
  { key: 'guest-flow', label: 'Guest Flow', desc: 'Arrival and movement paths' },
  { key: 'service-flow', label: 'Service Flow', desc: 'Kitchen and runner paths' },
  { key: 'accessibility', label: 'Accessibility', desc: 'Step-free routes and accessible tables' },
]

function ModeButton({ mode, active, onClick }) {
  return (
    <button
      type="button"
      title={mode.desc}
      onClick={() => onClick(mode.key)}
      style={{
        padding: '5px 12px',
        borderRadius: 4,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        border: active
          ? '1px solid rgba(201,169,110,0.50)'
          : '1px solid #2A2A2A',
        background: active
          ? 'rgba(201,169,110,0.10)'
          : 'transparent',
        color: active ? '#C9A96E' : '#5A5550',
      }}
    >
      {mode.label}
    </button>
  )
}

function ActionButton({ label, onClick, disabled, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        padding: '4px 12px',
        borderRadius: 100,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 150ms ease',
        border: '1px solid #2A2A2A',
        background: 'transparent',
        color: disabled ? '#2A2A2A' : '#5A5550',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  )
}

export default function EventArchitectToolbar({ activeMode, onModeChange, onReset, onOpenVision, onOpenBrief, onUndo, canUndo }) {
  return (
    <div
      style={{
        background: '#0A0A0A',
        border: '1px solid #1A1A1A',
        borderRadius: 8,
        padding: '8px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {/* Mode controls */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {MODES.map(mode => (
          <ModeButton
            key={mode.key}
            mode={mode}
            active={activeMode === mode.key}
            onClick={onModeChange}
          />
        ))}
      </div>

      {/* Separator */}
      <div
        style={{
          width: 1,
          height: 20,
          background: '#1E1E1E',
          flexShrink: 0,
          alignSelf: 'center',
          margin: '0 2px',
        }}
      />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        <ActionButton
          label="↩ Undo"
          onClick={onUndo}
          disabled={!canUndo}
          title={canUndo ? 'Undo last change' : 'Nothing to undo'}
        />
        <ActionButton
          label="Optimize"
          disabled
          title="Optimize layout — coming in a future phase"
        />
        <ActionButton
          label="Export Brief"
          onClick={onOpenBrief}
          title="Export Event Architect Brief — print-friendly summary"
        />
        <ActionButton
          label="Reset Plan"
          onClick={onReset}
          title="Reset floor plan to default arrangement"
        />
        <ActionButton
          label="Why This Matters"
          onClick={onOpenVision}
          title="Strategic context — HESTIA Event Architect"
        />
      </div>

      {/* Mode context label */}
      <div
        style={{
          marginLeft: 'auto',
          fontSize: 9,
          color: '#3A3A3A',
          fontWeight: 700,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        {MODES.find(m => m.key === activeMode)?.desc ?? ''}
      </div>
    </div>
  )
}
