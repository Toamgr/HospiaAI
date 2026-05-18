import React, { useState, useRef, useEffect } from 'react'

const RSVP_COLORS = {
  confirmed: 'text-emerald-400',
  pending: 'text-zinc-400',
  declined: 'text-red-400',
  maybe: 'text-amber-400'
}

function GuestCheckinCard({ guest, onCheckin }) {
  const [checking, setChecking] = useState(false)
  const isIn = !!guest.checked_in_at

  async function handleCheckin() {
    if (isIn || checking) return
    setChecking(true)
    try { await onCheckin(guest.id) }
    finally { setChecking(false) }
  }

  return (
    <div className={`flex items-center gap-4 px-4 py-4 border-b border-zinc-800 last:border-0 transition-colors ${isIn ? 'bg-emerald-950/20' : 'hover:bg-zinc-800/40'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-medium shrink-0 ${isIn ? 'bg-emerald-800 text-emerald-200' : 'bg-zinc-700 text-zinc-300'}`}>
        {isIn ? '✓' : (guest.name || '?')[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-base font-medium ${isIn ? 'text-emerald-300' : 'text-white'}`}>{guest.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs ${RSVP_COLORS[guest.rsvp_status] || 'text-zinc-500'}`}>{guest.rsvp_status || 'pending'}</span>
          {guest.table_name && <span className="text-xs text-zinc-500">· {guest.table_name}</span>}
          {guest.dietary && <span className="text-xs text-zinc-600">· {guest.dietary}</span>}
          {guest.plus_one && <span className="text-xs text-zinc-600">· +1{guest.plus_one_name ? `: ${guest.plus_one_name}` : ''}</span>}
        </div>
      </div>
      <div className="shrink-0">
        {isIn ? (
          <div className="text-center">
            <p className="text-xs text-emerald-400 font-medium">Checked in</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleCheckin}
            disabled={checking}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white text-sm font-medium transition-colors active:scale-95"
          >
            {checking ? '…' : 'Check in'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function EventCheckin({ event, guests, onCheckinGuest, onBack }) {
  const [search, setSearch] = useState('')
  const [filterMode, setFilterMode] = useState('all')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const checkedIn = guests.filter(g => g.checked_in_at).length
  const total = guests.length

  const filtered = guests.filter(g => {
    const q = search.toLowerCase()
    const matchSearch = !q || g.name?.toLowerCase().includes(q) || g.phone?.includes(q)
    if (filterMode === 'in') return matchSearch && g.checked_in_at
    if (filterMode === 'out') return matchSearch && !g.checked_in_at
    return matchSearch
  })

  const progress = total > 0 ? Math.round((checkedIn / total) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="text-zinc-500 hover:text-white text-sm transition-colors shrink-0">←</button>
        <div className="flex-1">
          <h1 className="text-lg font-light text-white">{event.name}</h1>
          <p className="text-xs text-zinc-500">Live check-in</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-light text-white">{checkedIn}</span>
            <span className="text-lg text-zinc-500 ml-1">/ {total}</span>
          </div>
          <span className="text-xl font-light text-amber-400">{progress}%</span>
        </div>
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-zinc-500">{total - checkedIn} guests not yet arrived</p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search guest name…"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="px-3 text-zinc-500 hover:text-white">✕</button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[['all', 'All'], ['out', 'Not arrived'], ['in', 'Checked in']].map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setFilterMode(mode)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
              filterMode === mode ? 'bg-amber-600 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Guest list */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            {search ? `No guests matching "${search}"` : 'No guests in this view.'}
          </div>
        ) : (
          filtered.map(guest => (
            <GuestCheckinCard
              key={guest.id}
              guest={guest}
              onCheckin={(guestId) => onCheckinGuest(event.id, guestId)}
            />
          ))
        )}
      </div>

      {checkedIn === total && total > 0 && (
        <div className="text-center py-4">
          <p className="text-emerald-400 font-medium">All guests have arrived!</p>
        </div>
      )}
    </div>
  )
}
