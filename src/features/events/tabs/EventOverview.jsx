import React, { useState, useMemo } from 'react'
import '@fontsource/fraunces/600.css'
import '@fontsource/jetbrains-mono/400.css'
import CocktailMenuBuilder from '../components/CocktailMenuBuilder'
import { buildZoharBrief } from '../utils/zoharBriefOrchestrator'
import { buildDesignContext } from '../utils/eventDesignContext'

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

function StatCard({ label, value, sub, accentColor }) {
  return (
    <div style={{
      background: '#141414', border: '1px solid #2A2A2A',
      borderRadius: 10, padding: '14px 16px',
    }}>
      <p style={{
        fontSize: '0.58rem', fontWeight: 500, letterSpacing: '0.14em',
        textTransform: 'uppercase', color: '#5A5550', margin: 0, lineHeight: 1,
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '1.5rem', fontWeight: 400, margin: '8px 0 0',
        color: accentColor || '#F5F0E8', lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '0.68rem', color: '#5A5550', margin: '4px 0 0' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

export default function EventOverview({ event, guests, tasks, onUpdateEvent, onUpdateTask, currentUser, refreshDetail }) {
  const [editingStatus, setEditingStatus] = useState(false)
  const [saving, setSaving] = useState(false)

  // Compute event brief from available data (no tables/timeline in Overview context;
  // cocktailMenuBrief only needs event + guests so this is complete for bar planning).
  const brief = useMemo(
    () => buildZoharBrief({ event, guests, tables: [], tasks, timeline: [] }),
    [event, guests, tasks]
  )
  const designContext = useMemo(
    () => buildDesignContext({ event, brief }),
    [event, brief]
  )

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
        <StatCard label="Expected guests" value={event.expected_guests || '—'} sub={confirmedGuests ? `${confirmedGuests} RSVP'd` : 'No RSVPs yet'} accentColor="#C9A96E" />
        <StatCard label="Tables" value={event.table_count || '—'} sub="configured" />
        <StatCard label="Tasks" value={`${doneTasks}/${tasks.length}`} sub={pendingTasks ? `${pendingTasks} pending` : 'All done'} accentColor={pendingTasks > 0 ? '#D4943A' : '#6BAF80'} />
      </div>

      {/* Creative direction — surface ZOHAR inputs when present */}
      {(event.single_sentence || event.aesthetic_subgenre || (event.confirmed_mood_keywords?.length > 0)) && (
        <div style={{
          padding: '16px 20px',
          background: '#0A0A0A',
          border: '1px solid rgba(201,169,110,0.14)',
          borderRadius: 8,
          position: 'relative', overflow: 'hidden',
        }}>
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0, right: 0, pointerEvents: 'none',
            width: 120, height: 80,
            background: 'radial-gradient(circle at top right, rgba(201,169,110,0.05), transparent 70%)',
          }} />
          <p style={{
            fontSize: 8, fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'rgba(201,169,110,0.50)',
            margin: '0 0 10px',
          }}>
            Creative Direction
          </p>
          {event.single_sentence && (
            <p style={{
              fontFamily: '"Fraunces", serif',
              fontSize: '1.0rem', fontWeight: 600, fontStyle: 'italic',
              color: '#F5F0E8', margin: 0, lineHeight: 1.45, letterSpacing: '0.01em',
            }}>
              "{event.single_sentence}"
            </p>
          )}
          {(event.aesthetic_subgenre || event.confirmed_mood_keywords?.length > 0) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {event.aesthetic_subgenre && (
                <span style={{
                  fontSize: '0.62rem', fontWeight: 500, color: '#8B7355',
                  letterSpacing: '0.06em', textTransform: 'capitalize',
                }}>
                  {event.aesthetic_subgenre.replace(/_/g, ' ')}
                </span>
              )}
              {event.aesthetic_subgenre && event.confirmed_mood_keywords?.length > 0 && (
                <span style={{ color: '#2A2A2A', fontSize: '0.65rem' }}>·</span>
              )}
              {event.confirmed_mood_keywords?.slice(0, 4).map((kw, i) => (
                <span key={i} style={{
                  fontSize: '0.60rem', fontWeight: 500,
                  color: '#5A5550', letterSpacing: '0.04em',
                }}>
                  {i > 0 && <span style={{ marginRight: 6, color: '#2A2A2A' }}>·</span>}
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

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

      {/* Cocktail Programme — brief-driven: form auto-fills from event context */}
      <CocktailMenuBuilder
        event={event}
        tasks={tasks}
        onUpdateTask={onUpdateTask}
        brief={brief}
        designContext={designContext}
        onApproved={() => refreshDetail?.()}
      />
    </div>
  )
}
