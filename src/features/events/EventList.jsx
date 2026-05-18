import React, { useState } from 'react'

const STATUS_CONFIG = {
  draft:          { label: 'Draft',          color: 'text-zinc-400',   dot: 'bg-zinc-500' },
  confirmed:      { label: 'Confirmed',      color: 'text-emerald-400', dot: 'bg-emerald-500' },
  in_preparation: { label: 'In Preparation', color: 'text-amber-400',  dot: 'bg-amber-500' },
  ready:          { label: 'Ready',          color: 'text-sky-400',    dot: 'bg-sky-500' },
  live:           { label: 'Live',           color: 'text-green-400',  dot: 'bg-green-400 animate-pulse' },
  completed:      { label: 'Completed',      color: 'text-zinc-500',   dot: 'bg-zinc-600' },
  cancelled:      { label: 'Cancelled',      color: 'text-red-400',    dot: 'bg-red-500' }
}

const EVENT_TYPE_LABELS = {
  wedding: 'Wedding', corporate: 'Corporate', private: 'Private',
  bar_event: 'Bar Event', other: 'Other'
}

const FILTER_STATUSES = ['all', 'draft', 'confirmed', 'in_preparation', 'ready', 'live', 'completed', 'cancelled']

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return dateStr }
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr + 'T12:00:00') - new Date()) / 86400000)
  if (diff < 0) return null
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return `${diff}d`
}

export default function EventList({ events, isLoading, onSelectEvent, onCreateNew }) {
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = events.filter(e => {
    const matchStatus = filterStatus === 'all' || e.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q || e.name?.toLowerCase().includes(q) || e.client_name?.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const upcoming = filtered.filter(e => !['completed', 'cancelled'].includes(e.status))
  const past = filtered.filter(e => ['completed', 'cancelled'].includes(e.status))

  function EventCard({ event }) {
    const sc = STATUS_CONFIG[event.status] || STATUS_CONFIG.draft
    const days = daysUntil(event.event_date)
    const confirmedGuests = event.rsvp_confirmed || 0
    const totalGuests = event.expected_guests || 0

    return (
      <button
        type="button"
        onClick={() => onSelectEvent(event.id)}
        className="w-full text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-all group"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sc.dot}`} />
              <span className={`text-xs font-medium ${sc.color}`}>{sc.label}</span>
              <span className="text-xs text-zinc-600">·</span>
              <span className="text-xs text-zinc-500">{EVENT_TYPE_LABELS[event.event_type] || event.event_type}</span>
            </div>
            <h3 className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors truncate">
              {event.name}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">{event.client_name}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-zinc-300">{formatDate(event.event_date)}</p>
            {days && <p className="text-xs text-amber-500 font-medium">{days}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-500">Guests</span>
            <span className="text-xs text-zinc-300 font-medium">{totalGuests}</span>
          </div>
          {confirmedGuests > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-zinc-500">RSVP'd</span>
              <span className="text-xs text-emerald-400 font-medium">{confirmedGuests}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs text-zinc-500 truncate">{event.location}</span>
            </div>
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-light text-white">Events</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{events.length} event{events.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
        >
          + New event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search events or clients…"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
        >
          {FILTER_STATUSES.map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All statuses' : STATUS_CONFIG[s]?.label || s}</option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="text-center py-16 text-zinc-500 text-sm">Loading events…</div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-400 font-light text-lg">No events found</p>
          <p className="text-zinc-600 text-sm mt-1">{events.length === 0 ? 'Create your first event to get started.' : 'Try adjusting your filters.'}</p>
          {events.length === 0 && (
            <button
              type="button"
              onClick={onCreateNew}
              className="mt-4 px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-sm font-medium transition-colors"
            >
              Create first event
            </button>
          )}
        </div>
      )}

      {!isLoading && upcoming.length > 0 && (
        <div className="space-y-2">
          {filterStatus === 'all' && (
            <p className="text-xs text-zinc-600 uppercase tracking-widest">Upcoming</p>
          )}
          {upcoming.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      )}

      {!isLoading && past.length > 0 && (
        <div className="space-y-2">
          {filterStatus === 'all' && (
            <p className="text-xs text-zinc-600 uppercase tracking-widest">Past</p>
          )}
          {past.map(e => <EventCard key={e.id} event={e} />)}
        </div>
      )}
    </div>
  )
}
