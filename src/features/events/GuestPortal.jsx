import React, { useState, useEffect } from 'react'

const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:3001'

async function portalGet(token) {
  const res = await fetch(`${API_BASE}/api/guest-portal/${token}`)
  if (!res.ok) throw new Error('Event not found')
  return res.json()
}

async function portalRsvp(token, data) {
  const res = await fetch(`${API_BASE}/api/guest-portal/${token}/rsvp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'RSVP failed')
  return json
}

function StatusBadge({ status }) {
  const colors = {
    confirmed: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    in_preparation: 'bg-amber-900/60 text-amber-300 border-amber-700',
    live: 'bg-green-900/60 text-green-300 border-green-700',
    completed: 'bg-zinc-800 text-zinc-400 border-zinc-600',
    cancelled: 'bg-red-900/60 text-red-300 border-red-700',
  }
  const labels = {
    confirmed: 'Confirmed', in_preparation: 'In Preparation',
    live: 'Live Now', completed: 'Completed', cancelled: 'Cancelled'
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${colors[status] || 'bg-zinc-800 text-zinc-400 border-zinc-600'}`}>
      {labels[status] || status}
    </span>
  )
}

function RsvpForm({ token, onSuccess }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', dietary: '', plus_one: false, plus_one_name: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Please enter your name.'); return }
    setSubmitting(true)
    setError(null)
    try {
      const result = await portalRsvp(token, form)
      onSuccess(result.guest)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Full name *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
          placeholder="Your name"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            placeholder="+1 234 567 8900"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Dietary requirements</label>
        <input
          type="text"
          value={form.dietary}
          onChange={e => set('dietary', e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
          placeholder="Vegan, gluten-free, allergies…"
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          id="plus-one"
          type="checkbox"
          checked={form.plus_one}
          onChange={e => set('plus_one', e.target.checked)}
          className="rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
        />
        <label htmlFor="plus-one" className="text-sm text-zinc-300">Bringing a plus one</label>
      </div>
      {form.plus_one && (
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Plus one name</label>
          <input
            type="text"
            value={form.plus_one_name}
            onChange={e => set('plus_one_name', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
            placeholder="Their name"
          />
        </div>
      )}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white font-semibold text-sm transition-colors"
      >
        {submitting ? 'Submitting…' : 'Confirm my attendance'}
      </button>
    </form>
  )
}

export default function GuestPortal({ token }) {
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rsvpDone, setRsvpDone] = useState(false)
  const [rsvpGuest, setRsvpGuest] = useState(null)

  useEffect(() => {
    portalGet(token)
      .then(data => setEvent(data.event))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0c09] flex items-center justify-center">
        <div className="text-zinc-400 text-sm">Loading event…</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#0d0c09] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-2xl font-light text-white mb-2">Event not found</p>
          <p className="text-zinc-400 text-sm">This link may have expired or the event was cancelled.</p>
        </div>
      </div>
    )
  }

  const isCancelled = event.status === 'cancelled'

  function formatDate(dateStr) {
    if (!dateStr) return ''
    try {
      return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    } catch { return dateStr }
  }

  function formatTime(t) {
    if (!t) return ''
    const [h, m] = t.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return `${hour % 12 || 12}:${m} ${ampm}`
  }

  return (
    <div className="min-h-screen bg-[#0d0c09] text-[#f5f5f0]">
      {/* Header bar */}
      <div className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-zinc-500 tracking-widest uppercase">HESTIA Events</span>
        <StatusBadge status={event.status} />
      </div>

      <div className="max-w-lg mx-auto px-4 py-10 space-y-8">
        {/* Event hero */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light tracking-tight" style={{ color: event.theme_color || '#c9a96e' }}>
            {event.name}
          </h1>
          <p className="text-zinc-400 text-sm">{formatDate(event.event_date)}</p>
          <p className="text-zinc-500 text-sm">{formatTime(event.start_time)} — {formatTime(event.end_time)}</p>
          {event.location && <p className="text-zinc-400 text-sm">{event.location}</p>}
        </div>

        {/* Host message */}
        {event.host_message && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-sm text-zinc-300 leading-relaxed italic">"{event.host_message}"</p>
            <p className="text-xs text-zinc-500 mt-2">— {event.client_name}</p>
          </div>
        )}

        {/* RSVP section */}
        {!isCancelled && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
            {rsvpDone ? (
              <div className="text-center py-4 space-y-2">
                <div className="text-3xl">✓</div>
                <p className="text-white font-medium">You're confirmed!</p>
                <p className="text-zinc-400 text-sm">
                  Thank you, {rsvpGuest?.name || 'guest'}. We look forward to seeing you.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-widest">RSVP</h2>
                <RsvpForm token={token} onSuccess={guest => { setRsvpDone(true); setRsvpGuest(guest) }} />
              </>
            )}
          </div>
        )}

        {isCancelled && (
          <div className="bg-red-950/40 border border-red-800 rounded-xl p-5 text-center">
            <p className="text-red-300 font-medium">This event has been cancelled.</p>
            <p className="text-red-400 text-sm mt-1">Please contact the organiser for more information.</p>
          </div>
        )}

        <p className="text-center text-zinc-600 text-xs">Powered by HESTIA</p>
      </div>
    </div>
  )
}
