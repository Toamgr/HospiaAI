import React, { useState } from 'react'
import CocktailMenuBuilder from '../components/CocktailMenuBuilder'

const STATUS_FLOW = ['draft', 'confirmed', 'in_preparation', 'ready', 'live', 'completed']
const STATUS_LABELS = {
  draft: 'Draft', confirmed: 'Confirmed', in_preparation: 'In Preparation',
  ready: 'Ready', live: 'Live', completed: 'Completed', cancelled: 'Cancelled'
}
const EVENT_TYPE_LABELS = {
  wedding: 'Wedding', corporate: 'Corporate', private: 'Private Party',
  bar_event: 'Bar Event', other: 'Other'
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return dateStr }
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr + 'T12:00:00') - new Date()) / 86400000)
  if (diff < 0) return `${Math.abs(diff)} days ago`
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `${diff} days`
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-500 uppercase tracking-widest">{label}</p>
      <p className={`text-2xl font-light mt-1 ${accent || 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function EventOverview({ event, guests, tasks, onUpdateEvent, onUpdateTask }) {
  const [editingStatus, setEditingStatus] = useState(false)
  const [saving, setSaving] = useState(false)

  const confirmedGuests = guests.filter(g => g.rsvp_status === 'confirmed').length
  const pendingTasks = tasks.filter(t => t.status !== 'done').length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const days = daysUntil(event.event_date)

  async function handleStatusChange(newStatus) {
    setSaving(true)
    try {
      await onUpdateEvent(event.id, { status: newStatus })
    } finally {
      setSaving(false)
      setEditingStatus(false)
    }
  }

  const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(event.status) + 1]

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Event date" value={event.event_date || '—'} sub={days} />
        <StatCard label="Expected guests" value={event.expected_guests || '—'} sub={confirmedGuests ? `${confirmedGuests} RSVP'd` : 'No RSVPs yet'} accent="text-amber-300" />
        <StatCard label="Tables" value={event.table_count || '—'} sub="configured" />
        <StatCard label="Tasks" value={`${doneTasks}/${tasks.length}`} sub={pendingTasks ? `${pendingTasks} pending` : 'All done'} accent={pendingTasks > 0 ? 'text-amber-400' : 'text-emerald-400'} />
      </div>

      {/* Status control */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Status</p>
          <button
            type="button"
            onClick={() => setEditingStatus(v => !v)}
            className="text-xs text-amber-500 hover:text-amber-400"
          >
            {editingStatus ? 'Close' : 'Change'}
          </button>
        </div>
        <p className="text-sm font-medium text-white">{STATUS_LABELS[event.status] || event.status}</p>

        {nextStatus && !editingStatus && event.status !== 'cancelled' && (
          <button
            type="button"
            onClick={() => handleStatusChange(nextStatus)}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-300 transition-colors"
          >
            {saving ? 'Saving…' : `Move to ${STATUS_LABELS[nextStatus]} →`}
          </button>
        )}

        {editingStatus && (
          <div className="flex flex-wrap gap-2 pt-1">
            {STATUS_FLOW.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => handleStatusChange(s)}
                disabled={saving || s === event.status}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  s === event.status
                    ? 'bg-amber-600 border-amber-500 text-white'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Event details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Event details</p>
        </div>
        {[
          ['Type', EVENT_TYPE_LABELS[event.event_type] || event.event_type],
          ['Date', formatDate(event.event_date)],
          ['Time', event.start_time && event.end_time ? `${event.start_time} – ${event.end_time}` : '—'],
          ['Location', event.location || '—'],
          ['Plus ones', event.plus_one_allowed ? 'Allowed' : 'Not allowed'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center px-5 py-3 border-b border-zinc-800 last:border-0">
            <span className="text-xs text-zinc-500 w-32 shrink-0">{label}</span>
            <span className="text-sm text-zinc-200">{value}</span>
          </div>
        ))}
      </div>

      {/* Client details */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Client</p>
        </div>
        {[
          ['Name', event.client_name || '—'],
          ['Phone', event.client_phone || '—'],
          ['Email', event.client_email || '—'],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center px-5 py-3 border-b border-zinc-800 last:border-0">
            <span className="text-xs text-zinc-500 w-32 shrink-0">{label}</span>
            <span className="text-sm text-zinc-200">{value}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      {event.notes && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Notes</p>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{event.notes}</p>
        </div>
      )}

      {/* Host message */}
      {event.host_message && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Host message (shown to guests)</p>
          <p className="text-sm text-zinc-300 italic">"{event.host_message}"</p>
        </div>
      )}

      {/* Portal link */}
      {event.portal_token && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Guest portal link</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-amber-300 bg-zinc-800 rounded px-2 py-1 truncate">
              {window.location.origin}/event/{event.portal_token}/guest
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(`${window.location.origin}/event/${event.portal_token}/guest`)}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors shrink-0"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-zinc-600">Share with guests to collect RSVPs and dietary requirements.</p>
        </div>
      )}

      {/* Cocktail menu builder */}
      <CocktailMenuBuilder event={event} tasks={tasks} onUpdateTask={onUpdateTask} />
    </div>
  )
}
