import React, { useEffect, useState, useCallback } from 'react'
import { apiPost } from '../../services/api/client'
import { apiGet } from '../../services/api/client'

const TODAY = new Date().toISOString().slice(0, 10)

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function PriorityBadge({ priority }) {
  const colors = {
    Critical: 'bg-red-900/40 text-red-300 border-red-800',
    urgent:   'bg-red-900/40 text-red-300 border-red-800',
    High:     'bg-orange-900/40 text-orange-300 border-orange-800',
    high:     'bg-orange-900/40 text-orange-300 border-orange-800',
    Medium:   'bg-yellow-900/40 text-yellow-300 border-yellow-800',
    normal:   'bg-yellow-900/40 text-yellow-300 border-yellow-800',
    Low:      'bg-[#6b705c]/30 text-[#e8dcc0] border-[#6b705c]/30',
  }
  return (
    <span className={cx('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border', colors[priority] || colors.Low)}>
      {priority}
    </span>
  )
}

function BriefingItem({ id, label, meta, priority, briefed, onToggle, children }) {
  return (
    <article className={cx('rounded-2xl border p-4 transition-all duration-300', briefed ? 'border-[#c9a96e]/20 opacity-50' : 'border-[#6b705c]/30 bg-[#14130f]')}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(id)}
          className={cx(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] font-black transition',
            briefed
              ? 'border-[#c9a96e] bg-[#c9a96e] text-[#0d0c09]'
              : 'border-[#6b705c]/50 hover:border-[#c9a96e]'
          )}
          aria-label={briefed ? 'Mark as unbriefed' : 'Mark as briefed'}
        >
          {briefed ? '✓' : ''}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {priority && <PriorityBadge priority={priority} />}
            <span className="text-sm font-bold text-[#f5f5f0]">{label}</span>
          </div>
          {meta && <p className="text-xs text-[#e8dcc0]/70 mb-1">{meta}</p>}
          {children}
        </div>
      </div>
    </article>
  )
}

export default function PreShiftBriefing({ t, currentUser, actionItems = [], serviceIncidents = [], eventPlans = [], notes = [] }) {
  const [briefed, setBriefed] = useState({})
  const [started, setStarted] = useState(false)
  const [saving, setSaving] = useState(false)

  const openActions = actionItems.filter(item => !item.done)
  const recentIncidents = serviceIncidents.filter(item => {
    if (item.resolved) return false
    const date = item.date || item.shift_date || item.created_at || ''
    if (!date) return true
    const daysAgo = (Date.now() - new Date(date).getTime()) / 86400000
    return daysAgo <= 7
  })
  const pinnedNotes = notes.filter(n => n.pinned && !n.archived)
  const todayEvents = eventPlans.filter(ev => {
    const date = ev.config?.eventDate || ev.eventDate || ev.created_at || ''
    return date.startsWith(TODAY)
  })

  const totalItems = openActions.length + recentIncidents.length + pinnedNotes.length + todayEvents.length
  const briefedCount = Object.values(briefed).filter(Boolean).length
  const readyToStart = briefedCount >= Math.ceil(totalItems * 0.5)

  function toggleBriefed(id) {
    setBriefed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function startShift() {
    setSaving(true)
    const snapshot = {
      open_actions: openActions.length,
      unresolved_incidents: recentIncidents.length,
      pinned_notes: pinnedNotes.length,
      briefed_items: briefedCount,
      total_items: totalItems,
      started_by: currentUser?.username || 'Manager',
      shift_date: TODAY
    }

    try {
      await apiPost('/api/business-memory', {
        type: 'note',
        title: `Pre-shift briefing started by ${snapshot.started_by}`,
        detail: `Briefed ${briefedCount}/${totalItems} items. Open actions: ${snapshot.open_actions}. Unresolved incidents: ${snapshot.unresolved_incidents}.`,
        date: TODAY
      })
    } catch {
      // silent — snapshot is best-effort
    }

    setStarted(true)
    setSaving(false)
  }

  if (started) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-7xl mb-6">✓</div>
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e] mb-3">Shift Active</div>
        <h2 className="font-serif text-4xl font-black text-[#f5f5f0] mb-4">Briefing complete. Shift started.</h2>
        <p className="text-[#e8dcc0] text-sm max-w-md">
          {briefedCount} of {totalItems} items acknowledged. Briefing snapshot saved to business memory.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e] mb-2">Shift Brain — Pre-Shift</div>
        <h1 className="font-serif text-4xl font-black text-[#f5f5f0] mb-3">Pre-Shift Briefing</h1>
        <p className="text-[#e8dcc0] text-sm max-w-2xl">
          Review every open signal before service begins. Acknowledge each item, then start the shift to save a briefing snapshot.
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-[#6b705c]/30 bg-[#14130f] p-4">
        <div>
          <span className="text-2xl font-black text-[#c9a96e]">{briefedCount}</span>
          <span className="text-[#e8dcc0] text-sm"> / {totalItems} items briefed</span>
        </div>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#6b705c]/30 max-w-xs">
          <div className="h-full rounded-full bg-[#c9a96e] transition-all duration-500" style={{ width: totalItems ? `${(briefedCount / totalItems) * 100}%` : '0%' }} />
        </div>
        <button
          type="button"
          onClick={startShift}
          disabled={saving || !readyToStart}
          className={cx(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all',
            readyToStart
              ? 'bg-[#c9a96e] text-[#0d0c09] hover:bg-[#e8d0a0]'
              : 'border border-[#6b705c]/30 text-[#e8dcc0]/50 cursor-not-allowed'
          )}
        >
          {saving ? 'Saving...' : 'Start Shift'}
        </button>
      </div>

      <div className="space-y-8">
        {openActions.length > 0 && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-3">Open Action Board ({openActions.length})</h2>
            <div className="space-y-2">
              {openActions.slice(0, 8).map(item => (
                <BriefingItem
                  key={item.id}
                  id={`action-${item.id}`}
                  label={item.title}
                  priority={item.priority}
                  meta={`Owner: ${item.owner || item.assignedPerson || 'Manager'} · Due: ${item.due || item.dueDate || '—'}`}
                  briefed={Boolean(briefed[`action-${item.id}`])}
                  onToggle={toggleBriefed}
                />
              ))}
            </div>
          </section>
        )}

        {recentIncidents.length > 0 && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-3">Unresolved Incidents — Last 7 Days ({recentIncidents.length})</h2>
            <div className="space-y-2">
              {recentIncidents.map(item => (
                <BriefingItem
                  key={item.id}
                  id={`incident-${item.id}`}
                  label={item.issue || item.description || item.type || 'Service incident'}
                  priority={item.severity || 'High'}
                  meta={`Date: ${item.date || item.shift_date || '—'} · Table: ${item.tableNumber || item.table_number || '—'}`}
                  briefed={Boolean(briefed[`incident-${item.id}`])}
                  onToggle={toggleBriefed}
                />
              ))}
            </div>
          </section>
        )}

        {todayEvents.length > 0 && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-3">Events Today ({todayEvents.length})</h2>
            <div className="space-y-2">
              {todayEvents.map(item => (
                <BriefingItem
                  key={item.id}
                  id={`event-${item.id}`}
                  label={item.name || item.config?.eventName || 'Event'}
                  priority="High"
                  meta={`Revenue: ${item.projected_revenue ? `NIS ${Math.round(item.projected_revenue).toLocaleString()}` : '—'} · Guests: ${item.config?.guestCount || '—'}`}
                  briefed={Boolean(briefed[`event-${item.id}`])}
                  onToggle={toggleBriefed}
                />
              ))}
            </div>
          </section>
        )}

        {pinnedNotes.length > 0 && (
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-3">Pinned Manager Notes ({pinnedNotes.length})</h2>
            <div className="space-y-2">
              {pinnedNotes.map(item => (
                <BriefingItem
                  key={item.id}
                  id={`note-${item.id}`}
                  label={item.content || item.text}
                  meta={`${item.tag || 'reminder'} · ${item.created_at?.slice(0, 10) || item.date || '—'} · ${item.created_by || item.author || 'Manager'}`}
                  briefed={Boolean(briefed[`note-${item.id}`])}
                  onToggle={toggleBriefed}
                />
              ))}
            </div>
          </section>
        )}

        {totalItems === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4 opacity-40">◎</div>
            <p className="text-[#c9a96e] font-black text-lg mb-2">Clean slate.</p>
            <p className="text-[#e8dcc0] text-sm">No open actions, incidents, pinned notes, or events today.</p>
            <button
              type="button"
              onClick={startShift}
              disabled={saving}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#c9a96e] text-[#0d0c09] font-black text-sm uppercase tracking-wider hover:bg-[#e8d0a0] transition"
            >
              {saving ? 'Saving...' : 'Start Shift'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
