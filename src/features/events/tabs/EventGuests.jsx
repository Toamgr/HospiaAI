import React, { useState } from 'react'

const RSVP_COLORS = {
  pending: 'text-zinc-400',
  confirmed: 'text-emerald-400',
  declined: 'text-red-400',
  maybe: 'text-amber-400'
}

function GuestRow({ guest, onUpdate, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/40 transition-colors">
      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300 shrink-0">
        {(guest.name || '?')[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{guest.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {guest.phone && <span className="text-xs text-zinc-500">{guest.phone}</span>}
          {guest.dietary && <span className="text-xs text-zinc-500 truncate">· {guest.dietary}</span>}
          {guest.plus_one && <span className="text-xs text-zinc-600">+1{guest.plus_one_name ? `: ${guest.plus_one_name}` : ''}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-medium ${RSVP_COLORS[guest.rsvp_status] || 'text-zinc-400'}`}>
          {guest.rsvp_status || 'pending'}
        </span>
        {guest.checked_in_at && (
          <span className="text-xs text-emerald-500 bg-emerald-950/40 border border-emerald-800 rounded px-1.5 py-0.5">✓ In</span>
        )}
        <button
          type="button"
          onClick={() => onRemove(guest.id)}
          className="text-zinc-600 hover:text-red-400 text-xs transition-colors ml-1"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function AddGuestForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', dietary: '', table_number: '', plus_one: false, plus_one_name: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(f, v) { setForm(prev => ({ ...prev, [f]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true)
    setError(null)
    try {
      await onAdd(form)
      onCancel()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 space-y-3">
      <p className="text-xs text-zinc-400 uppercase tracking-widest">Add guest</p>
      <div className="grid grid-cols-2 gap-2">
        <input className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500" placeholder="Full name *" value={form.name} onChange={e => set('name', e.target.value)} />
        <input className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500" placeholder="Phone" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <input className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500" placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} />
        <input className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500" placeholder="Dietary requirements" value={form.dietary} onChange={e => set('dietary', e.target.value)} />
      </div>
      <div className="flex items-center gap-3">
        <input id="ag-plus" type="checkbox" checked={form.plus_one} onChange={e => set('plus_one', e.target.checked)} className="rounded border-zinc-600 bg-zinc-900 text-amber-500" />
        <label htmlFor="ag-plus" className="text-sm text-zinc-300">Plus one</label>
        {form.plus_one && (
          <input className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500" placeholder="Plus one name" value={form.plus_one_name} onChange={e => set('plus_one_name', e.target.value)} />
        )}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white text-xs font-medium">{saving ? 'Adding…' : 'Add guest'}</button>
        <button type="button" onClick={onCancel} className="px-4 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs">Cancel</button>
      </div>
    </form>
  )
}

function ImportModal({ onImport, onClose }) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function parseGuests() {
    return text.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      const parts = line.split(/[,\t]/).map(p => p.trim())
      return { name: parts[0] || '', phone: parts[1] || '', email: parts[2] || '', dietary: parts[3] || '' }
    }).filter(g => g.name)
  }

  async function handleImport() {
    const guests = parseGuests()
    if (!guests.length) { setError('No valid guests found. Format: Name, Phone, Email, Dietary'); return }
    setSaving(true)
    setError(null)
    try {
      await onImport(guests)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-lg w-full space-y-4">
        <h3 className="text-white font-medium">Import guests</h3>
        <p className="text-xs text-zinc-400">One guest per line. Format: <code className="text-amber-300">Name, Phone, Email, Dietary</code></p>
        <textarea
          rows={8}
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 resize-none font-mono"
          placeholder={"Sarah Cohen, +972-50-111-2222, sarah@example.com, Vegan\nDavid Levi, +972-52-333-4444,, Gluten-free"}
        />
        <p className="text-xs text-zinc-500">{parseGuests().length} guest(s) detected</p>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={handleImport} disabled={saving} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white text-sm font-medium">{saving ? 'Importing…' : 'Import'}</button>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm">Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function EventGuests({ event, guests, onAddGuest, onImportGuests, onUpdateGuest, onRemoveGuest, onCheckinGuest }) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRsvp, setFilterRsvp] = useState('all')

  const filtered = guests.filter(g => {
    const q = search.toLowerCase()
    const matchSearch = !q || g.name?.toLowerCase().includes(q) || g.phone?.includes(q)
    const matchRsvp = filterRsvp === 'all' || g.rsvp_status === filterRsvp
    return matchSearch && matchRsvp
  })

  const confirmed = guests.filter(g => g.rsvp_status === 'confirmed').length
  const checkedIn = guests.filter(g => g.checked_in_at).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div><span className="text-lg font-light text-white">{guests.length}</span><span className="text-xs text-zinc-500 ml-1">total</span></div>
          <div><span className="text-lg font-light text-emerald-400">{confirmed}</span><span className="text-xs text-zinc-500 ml-1">confirmed</span></div>
          <div><span className="text-lg font-light text-sky-400">{checkedIn}</span><span className="text-xs text-zinc-500 ml-1">checked in</span></div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowImport(true)} className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-300 transition-colors">Import CSV</button>
          <button type="button" onClick={() => setShowAddForm(v => !v)} className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium">+ Add guest</button>
        </div>
      </div>

      {showAddForm && (
        <AddGuestForm
          onAdd={data => onAddGuest(event.id, data)}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search guests…"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
        />
        <select
          value={filterRsvp}
          onChange={e => setFilterRsvp(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
        >
          {['all', 'pending', 'confirmed', 'declined', 'maybe'].map(s => (
            <option key={s} value={s}>{s === 'all' ? 'All RSVPs' : s}</option>
          ))}
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            {guests.length === 0 ? 'No guests yet. Add guests or import a CSV.' : 'No guests match your filter.'}
          </div>
        ) : (
          filtered.map(guest => (
            <GuestRow
              key={guest.id}
              guest={guest}
              onUpdate={(patch) => onUpdateGuest(event.id, guest.id, patch)}
              onRemove={() => onRemoveGuest(event.id, guest.id)}
            />
          ))
        )}
      </div>

      {showImport && (
        <ImportModal
          onImport={(guestList) => onImportGuests(event.id, guestList)}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  )
}
