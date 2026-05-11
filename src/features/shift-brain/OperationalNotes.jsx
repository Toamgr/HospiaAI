import React, { useCallback, useEffect, useState } from 'react'
import { apiGet, apiPatch, apiPost } from '../../services/api/client'

const NOTE_TAGS = ['reminder', 'sop-deviation', 'staff-note', 'vendor-note', 'follow-up', 'vip']

const TAG_LABELS = {
  'reminder':      'Reminder',
  'sop-deviation': 'SOP Deviation',
  'staff-note':    'Staff Note',
  'vendor-note':   'Vendor Note',
  'follow-up':     'Follow-up',
  'vip':           'VIP Context'
}

const TAG_COLORS = {
  'reminder':      'bg-blue-900/30 text-blue-300 border-blue-800',
  'sop-deviation': 'bg-red-900/30 text-red-300 border-red-800',
  'staff-note':    'bg-purple-900/30 text-purple-300 border-purple-800',
  'vendor-note':   'bg-orange-900/30 text-orange-300 border-orange-800',
  'follow-up':     'bg-yellow-900/30 text-yellow-300 border-yellow-800',
  'vip':           'bg-[#c9a96e]/10 text-[#c9a96e] border-[#c9a96e]/30',
}

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

const SEED_NOTES = [
  { id: 'seed-1', content: 'Dinner service delay pressure expected between 19:30 and 20:15. Brief floor team before doors.', tag: 'reminder', pinned: true, archived: false, created_by: 'Manager', created_at: '2026-05-03T00:00:00.000Z' },
  { id: 'seed-2', content: 'Bar team improved second-drink recommendations after pre-shift role play.', tag: 'follow-up', pinned: false, archived: false, created_by: 'Manager', created_at: '2026-05-02T00:00:00.000Z' },
  { id: 'seed-3', content: 'Dana needs one-on-one recovery coaching before next weekend shift.', tag: 'staff-note', pinned: false, archived: false, created_by: 'Manager', created_at: '2026-04-30T00:00:00.000Z' }
]

export default function OperationalNotes({ t, currentUser, onNotesChange }) {
  const [notes, setNotes] = useState(SEED_NOTES)
  const [draft, setDraft] = useState('')
  const [selectedTag, setSelectedTag] = useState('reminder')
  const [filterTag, setFilterTag] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    apiGet('/api/notes')
      .then(data => {
        if (!mounted) return
        const fetched = data.notes || []
        setNotes(fetched.length ? fetched : SEED_NOTES)
      })
      .catch(() => {
        // backend unavailable — keep seed notes
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (onNotesChange) onNotesChange(notes)
  }, [notes, onNotesChange])

  async function addNote() {
    if (!draft.trim()) return
    setSaving(true)
    setError('')
    const newNote = {
      id: `note-local-${Date.now()}`,
      content: draft.trim(),
      tag: selectedTag,
      pinned: false,
      archived: false,
      created_by: currentUser?.username || 'Manager',
      created_at: new Date().toISOString()
    }
    setNotes(prev => [newNote, ...prev])
    setDraft('')

    try {
      const data = await apiPost('/api/notes', newNote)
      if (data.note) {
        setNotes(prev => prev.map(n => n.id === newNote.id ? data.note : n))
      }
    } catch {
      // kept in state, lost on refresh
    } finally {
      setSaving(false)
    }
  }

  async function togglePin(noteId) {
    const note = notes.find(n => n.id === noteId)
    if (!note) return
    const pinned = !note.pinned
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, pinned } : n))
    try {
      await apiPatch(`/api/notes/${noteId}`, { pinned })
    } catch {
      // local state is the fallback
    }
  }

  async function archiveNote(noteId) {
    setNotes(prev => prev.filter(n => n.id !== noteId))
    try {
      await apiPatch(`/api/notes/${noteId}`, { archived: true })
    } catch {
      // no-op
    }
  }

  const visible = notes
    .filter(n => !n.archived)
    .filter(n => filterTag === 'all' || n.tag === filterTag)
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.created_at) - new Date(a.created_at))

  return (
    <>
      <div className="mb-8">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e] mb-2">Shift Brain — Notes</div>
        <h1 className="font-serif text-4xl font-black text-[#f5f5f0] mb-3">Operational Notes</h1>
        <p className="text-[#e8dcc0] text-sm max-w-2xl">
          Capture observations that should survive the shift. Pinned notes surface in the next pre-shift briefing.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterTag('all')}
              className={cx('rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition', filterTag === 'all' ? 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 text-[#e8dcc0] hover:border-[#c9a96e]/30')}
            >
              All
            </button>
            {NOTE_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setFilterTag(tag)}
                className={cx('rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider transition', filterTag === tag ? 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 text-[#e8dcc0] hover:border-[#c9a96e]/30')}
              >
                {TAG_LABELS[tag]}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl border border-[#6b705c]/20 bg-[#14130f] animate-pulse" />)}
            </div>
          ) : visible.length ? (
            <div className="space-y-3">
              {visible.map(note => (
                <article key={note.id} className={cx('rounded-2xl border p-5 transition-all', note.pinned ? 'border-[#c9a96e]/35 bg-[#14130f]' : 'border-[#6b705c]/25 bg-[#14130f]')}>
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {note.pinned && (
                        <span className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a96e]">
                          Pinned
                        </span>
                      )}
                      <span className={cx('inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider', TAG_COLORS[note.tag] || TAG_COLORS.reminder)}>
                        {TAG_LABELS[note.tag] || note.tag}
                      </span>
                      <span className="text-xs text-[#e8dcc0]/60">
                        {note.created_at?.slice(0, 10)} · {note.created_by || 'Manager'}
                      </span>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => togglePin(note.id)}
                        className="text-xs font-bold text-[#e8dcc0]/60 transition hover:text-[#c9a96e]"
                      >
                        {note.pinned ? 'Unpin' : 'Pin'}
                      </button>
                      <button
                        type="button"
                        onClick={() => archiveNote(note.id)}
                        className="text-xs font-bold text-[#e8dcc0]/60 transition hover:text-red-400"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-[#e8dcc0]">{note.content}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-5xl mb-3 opacity-40">◎</div>
              <p className="text-[#e8dcc0] text-sm">No notes match this filter.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#6b705c]/30 bg-[#14130f] p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-4">Add Operational Note</div>

            <div className="mb-3">
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#e8dcc0]/60 mb-2">Tag</label>
              <div className="flex flex-wrap gap-1.5">
                {NOTE_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={cx('rounded border px-2 py-1 text-[10px] font-black uppercase tracking-wider transition', selectedTag === tag ? (TAG_COLORS[tag] || TAG_COLORS.reminder) : 'border-[#6b705c]/30 text-[#e8dcc0]/60 hover:border-[#c9a96e]/30')}
                  >
                    {TAG_LABELS[tag]}
                  </button>
                ))}
              </div>
            </div>

            <label className="block text-[10px] font-black uppercase tracking-wider text-[#e8dcc0]/60 mb-2">Note</label>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              rows={5}
              placeholder="Service delay pattern, staff observation, VIP context, recovery follow-up..."
              className="w-full resize-y rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm leading-7 text-[#f5f5f0] outline-none transition placeholder:text-[#e8dcc0]/40 focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
            />

            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

            <button
              type="button"
              onClick={addNote}
              disabled={saving || !draft.trim()}
              className="mt-3 w-full rounded-xl border border-[#c9a96e]/30 bg-[#c9a96e]/10 py-2.5 text-sm font-black uppercase tracking-wider text-[#c9a96e] transition hover:bg-[#c9a96e] hover:text-[#0d0c09] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Add Note'}
            </button>

            <p className="mt-4 text-xs leading-6 text-[#e8dcc0]/60">
              Pinned notes surface in the pre-shift briefing. Use tags to filter and recall operational patterns quickly.
            </p>
          </div>

          <div className="rounded-2xl border border-[#6b705c]/20 bg-[#14130f] p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-2">Summary</div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="font-serif text-3xl font-black text-[#f5f5f0]">{notes.filter(n => n.pinned && !n.archived).length}</div>
                <div className="text-[10px] uppercase tracking-wider text-[#e8dcc0]/60">Pinned</div>
              </div>
              <div>
                <div className="font-serif text-3xl font-black text-[#f5f5f0]">{notes.filter(n => !n.archived).length}</div>
                <div className="text-[10px] uppercase tracking-wider text-[#e8dcc0]/60">Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
