import React, { useState, useRef, useEffect } from 'react'
import { cx } from '../../utils/format'

// Phase 8 — Multi-Venue Foundation.
//
// A quiet, editorial venue switcher for the top bar. It only renders when the
// operator can reach more than one venue (single-venue installs stay frictionless).
// Owners / platform admins also get a minimal "New venue" affordance. Visual
// language follows the Operational Dark palette (gold #c9a96e on near-black).
export default function VenueSelector({ venues = [], currentVenueId, onSwitch, onCreate, canCreate = false }) {
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ name: '', venueType: '', description: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setCreating(false) } }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  // One venue (or none): the selector is unnecessary — render nothing.
  if (!venues || venues.length <= 1) return null

  const current = venues.find(v => v.id === currentVenueId) || venues[0]

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.venueType.trim()) { setError('Name and type are required.'); return }
    setBusy(true); setError('')
    try {
      await onCreate?.({ name: form.name.trim(), venueType: form.venueType.trim(), description: form.description.trim() })
      setForm({ name: '', venueType: '', description: '' })
      setCreating(false); setOpen(false)
    } catch (err) {
      setError(err?.message || 'Could not create the venue.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={ref} className="relative hidden lg:block">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] px-4 py-2.5 text-left transition hover:border-[#c9a96e]/40"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="block">
          <span className="block text-[8px] font-black uppercase tracking-[0.28em] text-[#e8dcc0]/45">Venue</span>
          <span className="block max-w-[180px] truncate text-xs font-black uppercase tracking-widest text-[#c9a96e]">{current?.name || '—'}</span>
        </span>
        <span className={cx('text-[#c9a96e] transition-transform', open && 'rotate-180')}>▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#3a3a3a] bg-[#141414] shadow-2xl shadow-black/50">
          <ul className="max-h-72 overflow-y-auto py-1.5" role="listbox" aria-label="Select venue">
            {venues.map(v => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => { onSwitch?.(v.id); setOpen(false) }}
                  className={cx(
                    'flex w-full items-start gap-2 px-4 py-2.5 text-left transition',
                    v.id === currentVenueId ? 'bg-[#c9a96e]/[0.08]' : 'hover:bg-white/[0.03]'
                  )}
                  role="option"
                  aria-selected={v.id === currentVenueId}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-black uppercase tracking-[0.12em] text-[#f5f5f0]">{v.name}</span>
                    {v.venue_type && (
                      <span className="block truncate text-[9px] uppercase tracking-[0.16em] text-[#e8dcc0]/40">{v.venue_type}</span>
                    )}
                  </span>
                  {v.id === currentVenueId && <span className="mt-0.5 text-[10px] text-[#c9a96e]">●</span>}
                </button>
              </li>
            ))}
          </ul>

          {canCreate && (
            <div className="border-t border-[#2a2a2a]">
              {!creating ? (
                <button
                  type="button"
                  onClick={() => { setCreating(true); setError('') }}
                  className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e] transition hover:bg-[#c9a96e]/[0.06]"
                >
                  + New venue
                </button>
              ) : (
                <form onSubmit={handleCreate} className="space-y-2 px-4 py-3">
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Venue name"
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-xs text-[#f5f0e8] placeholder:text-[#5a5550] focus:border-[#c9a96e]/50 focus:outline-none"
                    autoFocus
                  />
                  <input
                    value={form.venueType}
                    onChange={e => setForm(f => ({ ...f, venueType: e.target.value }))}
                    placeholder="Venue type (e.g. Cocktail Bar)"
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-xs text-[#f5f0e8] placeholder:text-[#5a5550] focus:border-[#c9a96e]/50 focus:outline-none"
                  />
                  <input
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Description (optional)"
                    className="w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-xs text-[#f5f0e8] placeholder:text-[#5a5550] focus:border-[#c9a96e]/50 focus:outline-none"
                  />
                  {error && <p className="text-[10px] text-[#c17f2a]">{error}</p>}
                  <div className="flex gap-2 pt-0.5">
                    <button
                      type="submit"
                      disabled={busy}
                      className="flex-1 rounded-lg bg-[#c9a96e] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#11100d] transition hover:bg-[#d8bb84] disabled:opacity-50"
                    >
                      {busy ? 'Creating…' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setCreating(false); setError('') }}
                      className="rounded-lg border border-[#2a2a2a] px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/55 transition hover:text-[#f5f5f0]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
