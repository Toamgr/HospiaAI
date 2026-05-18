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

const STEPS = ['Event Details', 'Guests & Seating', 'Theme & Message', 'Review']

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

function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm text-zinc-400 mb-1">
      {children}{required && <span className="text-amber-500 ml-0.5">*</span>}
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
          <FieldLabel>Location</FieldLabel>
          <Input value={form.location} onChange={e => onChange('location', e.target.value)} placeholder="Venue / room" />
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
      <div className="border-t border-zinc-800 pt-4 space-y-3">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Client details</p>
        <div>
          <FieldLabel required>Client name</FieldLabel>
          <Input value={form.client_name} onChange={e => onChange('client_name', e.target.value)} placeholder="Full name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Phone</FieldLabel>
            <Input type="tel" value={form.client_phone} onChange={e => onChange('client_phone', e.target.value)} placeholder="+1 234 567 8900" />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" value={form.client_email} onChange={e => onChange('client_email', e.target.value)} placeholder="client@example.com" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Step2({ form, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel required>Expected guests</FieldLabel>
          <Input
            type="number"
            min="1"
            value={form.expected_guests}
            onChange={e => onChange('expected_guests', parseInt(e.target.value) || 0)}
            placeholder="120"
          />
        </div>
        <div>
          <FieldLabel>Tables</FieldLabel>
          <Input
            type="number"
            min="0"
            value={form.table_count}
            onChange={e => onChange('table_count', parseInt(e.target.value) || 0)}
            placeholder="12"
          />
          <p className="text-xs text-zinc-600 mt-1">Leave 0 — set seating later</p>
        </div>
      </div>
      <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
        <input
          id="plus-one"
          type="checkbox"
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
        <FieldLabel>Special notes</FieldLabel>
        <textarea
          value={form.notes}
          onChange={e => onChange('notes', e.target.value)}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 placeholder-zinc-600 resize-none"
          placeholder="Kosher, dietary requirements, VIP arrangements…"
        />
      </div>
    </div>
  )
}

function Step3({ form, onChange }) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Theme color</FieldLabel>
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
        <FieldLabel>Host message</FieldLabel>
        <textarea
          value={form.host_message}
          onChange={e => onChange('host_message', e.target.value)}
          rows={4}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 placeholder-zinc-600 resize-none"
          placeholder="A personal message from the host, shown to guests on their portal page…"
        />
        <p className="text-xs text-zinc-500 mt-1">Optional — displayed on the guest RSVP portal</p>
      </div>
      {form.host_message && (
        <div className="border border-zinc-700 rounded-xl p-4 space-y-1">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Portal preview</p>
          <p className="text-sm text-zinc-300 italic">"{form.host_message}"</p>
          <p className="text-xs text-zinc-500">— {form.client_name || 'Host'}</p>
        </div>
      )}
    </div>
  )
}

function Step4({ form }) {
  const typeLabel = EVENT_TYPES.find(t => t.value === form.event_type)?.label || form.event_type

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
    ['Phone', form.client_phone || '—'],
    ['Email', form.client_email || '—'],
    ['Expected guests', form.expected_guests || '—'],
    ['Tables', form.table_count || 'Set later'],
    ['Plus ones', form.plus_one_allowed ? 'Allowed' : 'Not allowed'],
  ]

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
    theme_color: '#c9a96e'
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
        plus_one_allowed: form.plus_one_allowed ? 1 : 0
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
