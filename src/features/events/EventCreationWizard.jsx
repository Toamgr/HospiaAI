import React, { useState } from 'react'

const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'private', label: 'Private Party' },
  { value: 'bar_event', label: 'Bar Event' },
  { value: 'other', label: 'Other' }
]

const THEME_COLORS = [
  '#c9a96e', '#d4a574', '#a8c5a0', '#89b4cc', '#c4a0c0',
  '#e8b4b8', '#b8d4a8', '#f0c080', '#8ca8c8', '#c8b8a0'
]

const AESTHETIC_SUBGENRES = [
  {
    value: 'quiet_sanctuary',
    label: 'Quiet Sanctuary',
    description: 'Understated. Restorative. Natural materials. The guest is held, not impressed.',
  },
  {
    value: 'cinematic_narrative',
    label: 'Cinematic Narrative',
    description: 'Story-driven. The venue is the protagonist. Every detail is a scene direction.',
  },
  {
    value: 'theatrical_mystique',
    label: 'Theatrical Mystique',
    description: 'Atmospheric. High contrast. The event world has its own physics.',
  },
]

const IMPACT_MOMENTS = [
  { value: 'arrival',   label: 'Arrival',          description: 'The first sensory impression.' },
  { value: 'social',    label: 'Social Hour',       description: 'Cocktail reception & exploration.' },
  { value: 'signature', label: 'Signature Moment',  description: 'The single peak moment.' },
  { value: 'dining',    label: 'Dining',            description: 'The sustained sensory experience.' },
  { value: 'closing',   label: 'Closing',           description: 'How guests are sent home.' },
]

const MOOD_KEYWORD_OPTIONS = [
  'Intimate', 'Timeless', 'Elevated', 'Warm', 'Dramatic', 'Editorial',
  'Mediterranean', 'Cinematic', 'Rustic', 'Luminous', 'Refined', 'Raw',
  'Abundant', 'Minimal', 'Desert', 'Coastal', 'Festive', 'Contemplative',
  'Sun-Warmed', 'Moody', 'Grand', 'Quiet', 'Artisanal', 'Bold',
]

const STEPS = ['Event Details', 'Guests & Seating', 'Creative Direction', 'Review']

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              i < current ? 'bg-amber-600 text-white' :
              i === current ? 'bg-amber-500 text-black' :
              'bg-zinc-800 text-zinc-500'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === current ? 'text-amber-400' : 'text-zinc-500'}`}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < current ? 'bg-amber-700' : 'bg-zinc-800'}`} />}
        </React.Fragment>
      ))}
    </div>
  )
}

function FieldLabel({ children, required, optional }) {
  return (
    <label className="block text-sm text-zinc-400 mb-1">
      {children}
      {required && <span className="text-amber-500 ml-0.5">*</span>}
      {optional && <span className="text-zinc-600 ml-1.5 text-xs font-normal">(optional)</span>}
    </label>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 placeholder-zinc-600"
    />
  )
}

function Textarea({ ...props }) {
  return (
    <textarea
      {...props}
      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 placeholder-zinc-600 resize-none"
    />
  )
}

// ── Step 1: Event Details ──────────────────────────────────────────────────────

function Step1({ form, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel required>Event name</FieldLabel>
        <Input value={form.name} onChange={e => onChange('name', e.target.value)} placeholder="e.g. Cohen-Levi Wedding Reception" />
      </div>
      <div>
        <FieldLabel required>Event type</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          {EVENT_TYPES.map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange('event_type', t.value)}
              className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                form.event_type === t.value
                  ? 'bg-amber-600 border-amber-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel required>Event date</FieldLabel>
          <Input type="date" value={form.event_date} onChange={e => onChange('event_date', e.target.value)} />
        </div>
        <div>
          <FieldLabel optional>Location</FieldLabel>
          <Input value={form.location} onChange={e => onChange('location', e.target.value)} placeholder="Venue name / address" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel required>Start time</FieldLabel>
          <Input type="time" value={form.start_time} onChange={e => onChange('start_time', e.target.value)} />
        </div>
        <div>
          <FieldLabel required>End time</FieldLabel>
          <Input type="time" value={form.end_time} onChange={e => onChange('end_time', e.target.value)} />
        </div>
      </div>

      {/* Venue character — lives next to location */}
      <div>
        <FieldLabel optional>Venue character</FieldLabel>
        <Textarea
          value={form.venue_character}
          onChange={e => onChange('venue_character', e.target.value)}
          rows={2}
          placeholder={'One sentence: what does the space actually feel like? e.g. “Raw limestone walls, Crusader-era arched ceilings, candlelight as the only warmth.”'}
        />
        <p className="text-xs text-zinc-600 mt-1">Used by ZOHAR to anchor the visual brief in physical reality.</p>
      </div>

      <div className="border-t border-zinc-800 pt-4 space-y-3">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Client details</p>
        <div>
          <FieldLabel required>Client name</FieldLabel>
          <Input value={form.client_name} onChange={e => onChange('client_name', e.target.value)} placeholder="Full name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel optional>Phone</FieldLabel>
            <Input type="tel" value={form.client_phone} onChange={e => onChange('client_phone', e.target.value)} placeholder="+1 234 567 8900" />
          </div>
          <div>
            <FieldLabel optional>Email</FieldLabel>
            <Input type="email" value={form.client_email} onChange={e => onChange('client_email', e.target.value)} placeholder="client@example.com" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Guests & Seating ───────────────────────────────────────────────────

function Step2({ form, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel required>Expected guests</FieldLabel>
          <Input
            type="number" min="1"
            value={form.expected_guests}
            onChange={e => onChange('expected_guests', parseInt(e.target.value) || 0)}
            placeholder="120"
          />
        </div>
        <div>
          <FieldLabel optional>Tables</FieldLabel>
          <Input
            type="number" min="0"
            value={form.table_count}
            onChange={e => onChange('table_count', parseInt(e.target.value) || 0)}
            placeholder="12"
          />
          <p className="text-xs text-zinc-600 mt-1">Leave 0 — set seating later</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
        <input
          id="plus-one" type="checkbox"
          checked={form.plus_one_allowed}
          onChange={e => onChange('plus_one_allowed', e.target.checked)}
          className="rounded border-zinc-600 bg-zinc-900 text-amber-500 focus:ring-amber-500"
        />
        <div>
          <label htmlFor="plus-one" className="text-sm text-zinc-200 font-medium">Allow plus ones</label>
          <p className="text-xs text-zinc-500">Guests can bring one additional person via the portal</p>
        </div>
      </div>
      <div>
        <FieldLabel optional>Special notes</FieldLabel>
        <Textarea
          value={form.notes}
          onChange={e => onChange('notes', e.target.value)}
          rows={3}
          placeholder="Kosher, dietary requirements, VIP arrangements…"
        />
      </div>
    </div>
  )
}

// ── Step 3: Creative Direction ─────────────────────────────────────────────────

function Step3({ form, onChange }) {
  function toggleMoodKeyword(kw) {
    const current = form.confirmed_mood_keywords || []
    if (current.includes(kw)) {
      onChange('confirmed_mood_keywords', current.filter(k => k !== kw))
    } else if (current.length < 5) {
      onChange('confirmed_mood_keywords', [...current, kw])
    }
  }

  const selectedKeywords = form.confirmed_mood_keywords || []

  return (
    <div className="space-y-6">

      {/* ZOHAR context label */}
      <div
        style={{
          padding: '12px 16px',
          background: 'rgba(201,169,110,0.04)',
          border: '1px solid rgba(201,169,110,0.14)',
          borderRadius: 8,
        }}
      >
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.55)', margin: '0 0 4px' }}>
          ZOHAR · Creative Direction
        </p>
        <p className="text-xs text-zinc-500">
          These inputs transform the design brief from categorization into creative direction. All fields are optional — but each one significantly improves ZOHAR's output.
        </p>
      </div>

      {/* Aesthetic Subgenre */}
      <div>
        <FieldLabel optional>Aesthetic philosophy</FieldLabel>
        <div className="space-y-2 mt-1">
          {AESTHETIC_SUBGENRES.map(s => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange('aesthetic_subgenre', form.aesthetic_subgenre === s.value ? '' : s.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: form.aesthetic_subgenre === s.value ? 'rgba(201,169,110,0.08)' : 'transparent',
                border: form.aesthetic_subgenre === s.value ? '1px solid rgba(201,169,110,0.35)' : '1px solid #2a2a2a',
                borderRadius: 8,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  background: form.aesthetic_subgenre === s.value ? '#C9A96E' : 'transparent',
                  border: form.aesthetic_subgenre === s.value ? '2px solid #C9A96E' : '2px solid #3A3A3A',
                  transition: 'all 150ms ease',
                }}
              />
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: form.aesthetic_subgenre === s.value ? '#F5F0E8' : '#9A9590', margin: 0, letterSpacing: '0.01em' }}>
                  {s.label}
                </p>
                <p style={{ fontSize: 11, color: '#5A5550', margin: '3px 0 0', lineHeight: 1.5 }}>
                  {s.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Impact Moment */}
      <div>
        <FieldLabel optional>Primary impact moment</FieldLabel>
        <p className="text-xs text-zinc-600 mb-2">Which moment receives maximum creative investment?</p>
        <div className="grid grid-cols-1 gap-1.5">
          {IMPACT_MOMENTS.map(m => (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange('primary_impact_moment', form.primary_impact_moment === m.value ? '' : m.value)}
              style={{
                padding: '10px 14px',
                background: form.primary_impact_moment === m.value ? 'rgba(201,169,110,0.08)' : 'transparent',
                border: form.primary_impact_moment === m.value ? '1px solid rgba(201,169,110,0.30)' : '1px solid #2a2a2a',
                borderRadius: 7,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 150ms ease',
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                background: form.primary_impact_moment === m.value ? '#C9A96E' : '#2A2A2A',
                transition: 'background 150ms ease',
              }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: form.primary_impact_moment === m.value ? '#F5F0E8' : '#5A5550', minWidth: 100 }}>
                {m.label}
              </span>
              <span style={{ fontSize: 11, color: '#3A3A3A', lineHeight: 1.4 }}>{m.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood Keywords */}
      <div>
        <FieldLabel optional>Mood keywords</FieldLabel>
        <p className="text-xs text-zinc-600 mb-2">Select 3–5 words that describe this event. These become the emotional register of the brief.</p>
        <div className="flex flex-wrap gap-2">
          {MOOD_KEYWORD_OPTIONS.map(kw => {
            const selected = selectedKeywords.includes(kw)
            const disabled = !selected && selectedKeywords.length >= 5
            return (
              <button
                key={kw}
                type="button"
                disabled={disabled}
                onClick={() => toggleMoodKeyword(kw)}
                style={{
                  padding: '5px 13px',
                  background: selected ? 'rgba(201,169,110,0.10)' : 'transparent',
                  border: selected ? '1px solid rgba(201,169,110,0.35)' : '1px solid #2A2A2A',
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: selected ? 600 : 400,
                  color: selected ? '#C9A96E' : disabled ? '#2A2A2A' : '#5A5550',
                  cursor: disabled ? 'default' : 'pointer',
                  transition: 'all 150ms ease',
                  letterSpacing: '0.03em',
                }}
              >
                {kw}
              </button>
            )
          })}
        </div>
        {selectedKeywords.length > 0 && (
          <p className="text-xs text-zinc-600 mt-2">{selectedKeywords.length} of 5 selected</p>
        )}
      </div>

      {/* The Single Sentence */}
      <div>
        <FieldLabel optional>The single sentence</FieldLabel>
        <Textarea
          value={form.single_sentence}
          onChange={e => onChange('single_sentence', e.target.value)}
          rows={2}
          placeholder='What should guests say the morning after? e.g. "I have never felt so transported."'
        />
        <p className="text-xs text-zinc-600 mt-1">ZOHAR's north star for every design decision.</p>
      </div>

      {/* Anti-Reference */}
      <div>
        <FieldLabel optional>What this event must NOT look like</FieldLabel>
        <Textarea
          value={form.anti_reference}
          onChange={e => onChange('anti_reference', e.target.value)}
          rows={2}
          placeholder='e.g. "Not a Pinterest wedding. Not the generic gold-and-white luxury look. Not cold or corporate."'
        />
        <p className="text-xs text-zinc-600 mt-1">Negative constraints are as creatively powerful as positive ones.</p>
      </div>

      {/* Theme color + host message — kept from original Step 3 */}
      <div className="border-t border-zinc-800 pt-4 space-y-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Portal & branding</p>
        <div>
          <FieldLabel optional>Theme color</FieldLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {THEME_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => onChange('theme_color', color)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  form.theme_color === color ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <input
              type="color"
              value={form.theme_color}
              onChange={e => onChange('theme_color', e.target.value)}
              className="w-8 h-8 rounded-full border-2 border-zinc-600 cursor-pointer bg-transparent"
              title="Custom color"
            />
          </div>
          <p className="text-xs text-zinc-500 mt-1">Used in the guest portal header</p>
        </div>
        <div>
          <FieldLabel optional>Host message</FieldLabel>
          <Textarea
            value={form.host_message}
            onChange={e => onChange('host_message', e.target.value)}
            rows={3}
            placeholder="A personal message from the host, shown to guests on their portal page…"
          />
          {form.host_message && (
            <div className="border border-zinc-700 rounded-xl p-4 space-y-1 mt-2">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Portal preview</p>
              <p className="text-sm text-zinc-300 italic">"{form.host_message}"</p>
              <p className="text-xs text-zinc-500">— {form.client_name || 'Host'}</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

// ── Step 4: Review ─────────────────────────────────────────────────────────────

function Step4({ form }) {
  const typeLabel = EVENT_TYPES.find(t => t.value === form.event_type)?.label || form.event_type
  const subgenreLabel = AESTHETIC_SUBGENRES.find(s => s.value === form.aesthetic_subgenre)?.label || null
  const impactLabel  = IMPACT_MOMENTS.find(m => m.value === form.primary_impact_moment)?.label || null

  function formatDate(d) {
    if (!d) return '—'
    try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
    catch { return d }
  }

  const rows = [
    ['Event name', form.name || '—'],
    ['Type', typeLabel],
    ['Date', formatDate(form.event_date)],
    ['Time', form.start_time && form.end_time ? `${form.start_time} – ${form.end_time}` : '—'],
    ['Location', form.location || '—'],
    ['Client', form.client_name || '—'],
    ['Expected guests', form.expected_guests || '—'],
    ['Tables', form.table_count || 'Set later'],
    ['Plus ones', form.plus_one_allowed ? 'Allowed' : 'Not allowed'],
  ]

  const creativeRows = [
    ['Aesthetic philosophy', subgenreLabel || '—'],
    ['Primary impact moment', impactLabel || '—'],
    ['Mood keywords', (form.confirmed_mood_keywords || []).join(', ') || '—'],
    ['Single sentence', form.single_sentence || '—'],
  ].filter(([, v]) => v !== '—')

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">Review the event details before creating.</p>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start px-4 py-2.5 border-b border-zinc-800 last:border-0">
            <span className="text-xs text-zinc-500 w-36 shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-zinc-200">{value}</span>
          </div>
        ))}
      </div>

      {creativeRows.length > 0 && (
        <div
          style={{
            background: '#0A0A0A',
            border: '1px solid rgba(201,169,110,0.14)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
            <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(201,169,110,0.55)', margin: 0 }}>
              ZOHAR · Creative Direction
            </p>
          </div>
          {creativeRows.map(([label, value]) => (
            <div key={label} className="flex items-start px-4 py-2.5 border-b border-zinc-900 last:border-0">
              <span className="text-xs text-zinc-600 w-36 shrink-0 pt-0.5">{label}</span>
              <span className="text-xs text-zinc-400" style={{ fontStyle: label === 'Single sentence' ? 'italic' : 'normal' }}>{value}</span>
            </div>
          ))}
        </div>
      )}

      {form.host_message && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Host message</p>
          <p className="text-sm text-zinc-300 italic">"{form.host_message}"</p>
        </div>
      )}
      <div className="flex items-center gap-2 p-3 bg-amber-950/30 border border-amber-900/40 rounded-lg">
        <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        <p className="text-xs text-amber-300">Creating this event will generate a guest portal link and auto-schedule 5 preparation tasks.</p>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function EventCreationWizard({ onCreateEvent, onCancel }) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    name: '',
    event_type: 'private',
    event_date: '',
    start_time: '18:00',
    end_time: '23:00',
    location: '',
    client_name: '',
    client_phone: '',
    client_email: '',
    expected_guests: '',
    table_count: 0,
    plus_one_allowed: true,
    notes: '',
    host_message: '',
    theme_color: '#c9a96e',
    // Creative direction fields
    aesthetic_subgenre: '',
    single_sentence: '',
    anti_reference: '',
    venue_character: '',
    primary_impact_moment: '',
    confirmed_mood_keywords: [],
  })

  function onChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function validateStep() {
    if (step === 0) {
      if (!form.name.trim()) return 'Event name is required.'
      if (!form.event_date) return 'Event date is required.'
      if (!form.start_time) return 'Start time is required.'
      if (!form.end_time) return 'End time is required.'
      if (!form.client_name.trim()) return 'Client name is required.'
    }
    if (step === 1) {
      if (!form.expected_guests || form.expected_guests < 1) return 'Expected guests must be at least 1.'
    }
    return null
  }

  function next() {
    const err = validateStep()
    if (err) { setError(err); return }
    setError(null)
    setStep(s => s + 1)
  }

  function back() {
    setError(null)
    setStep(s => s - 1)
  }

  async function handleCreate() {
    setSubmitting(true)
    setError(null)
    try {
      await onCreateEvent({
        ...form,
        expected_guests: Number(form.expected_guests) || 0,
        table_count: Number(form.table_count) || 0,
        plus_one_allowed: form.plus_one_allowed ? 1 : 0,
        // Normalize empty strings to null for optional creative fields
        aesthetic_subgenre:    form.aesthetic_subgenre    || null,
        single_sentence:       form.single_sentence       || null,
        anti_reference:        form.anti_reference        || null,
        venue_character:       form.venue_character       || null,
        primary_impact_moment: form.primary_impact_moment || null,
        confirmed_mood_keywords: form.confirmed_mood_keywords.length > 0
          ? form.confirmed_mood_keywords : null,
      })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-light text-white">New Event</h2>
        <p className="text-sm text-zinc-500 mt-0.5">Set up the event, guest portal, and preparation tasks.</p>
      </div>

      <StepIndicator current={step} />

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
        {step === 0 && <Step1 form={form} onChange={onChange} />}
        {step === 1 && <Step2 form={form} onChange={onChange} />}
        {step === 2 && <Step3 form={form} onChange={onChange} />}
        {step === 3 && <Step4 form={form} />}
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 bg-red-950/50 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={step === 0 ? onCancel : back}
          className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          {step === 0 ? 'Cancel' : '← Back'}
        </button>

        <div className="flex gap-3">
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white text-sm font-medium transition-colors"
            >
              {submitting ? 'Creating…' : 'Create event'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
