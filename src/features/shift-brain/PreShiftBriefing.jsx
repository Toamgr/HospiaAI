import React, { useState } from 'react'
import { apiPost } from '../../services/api/client'
import {
  loadManagerActionStatuses, loadManagerActionCarryForward,
  deriveOperationalActions, enrichActions, getCarryForwardActions,
  PRIORITY_STYLE, PRIORITY_LABEL,
} from '../operations/operationalIntelligenceUtils'

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

function BriefingItem({ id, label, meta, priority, briefed, onToggle }) {
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
          {meta && <p className="text-xs text-[#e8dcc0]/70">{meta}</p>}
        </div>
      </div>
    </article>
  )
}

const STATUS_CONFIG = {
  clear:     { label: 'Operationally Clear',            border: 'border-emerald-800/50 bg-emerald-950/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  attention: { label: 'Attention Required',             border: 'border-yellow-800/50 bg-yellow-950/20',   text: 'text-yellow-400', dot: 'bg-yellow-400' },
  critical:  { label: 'Critical — Address Before Service', border: 'border-red-800/50 bg-red-950/20',     text: 'text-red-400',    dot: 'bg-red-400' }
}

export default function PreShiftBriefing({ t, currentUser, actionItems = [], serviceIncidents = [], eventPlans = [], notes = [], reportArchive = [], shiftBrain }) {
  const [briefed, setBriefed] = useState({})
  const [checklistDone, setChecklistDone] = useState({})
  const [started, setStarted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Manager-flagged carry-forward items from previous shift (reads localStorage set by ManagerActionCenter)
  const managerCarryForward = (() => {
    const statuses      = loadManagerActionStatuses()
    const carryForwards = loadManagerActionCarryForward()
    const derived       = deriveOperationalActions(actionItems, serviceIncidents, notes, reportArchive)
    const enriched      = enrichActions(derived, statuses, carryForwards, serviceIncidents, actionItems)
    return getCarryForwardActions(enriched)
  })()

  const openActions = actionItems.filter(item => !item.done)
  const recentIncidents = serviceIncidents.filter(item => {
    if (item.resolved) return false
    const date = item.date || item.shift_date || item.created_at || ''
    if (!date) return true
    return (Date.now() - new Date(date).getTime()) / 86400000 <= 7
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

  function toggleChecklist(id) {
    setChecklistDone(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function startShift() {
    setSaving(true)
    try {
      await apiPost('/api/business-memory', {
        type: 'note',
        title: `Pre-shift briefing started by ${currentUser?.username || 'Manager'}`,
        detail: `Briefed ${briefedCount}/${totalItems} items. Open actions: ${openActions.length}. Unresolved incidents: ${recentIncidents.length}. Status: ${shiftBrain?.summary?.operationalStatus || 'unknown'}.`,
        date: TODAY
      })
    } catch {
      // silent — snapshot is best-effort
    }
    setStarted(true)
    setSaving(false)
  }

  const status = shiftBrain?.summary?.operationalStatus || 'clear'
  const statusConfig = STATUS_CONFIG[status]

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
      <header className="mb-24 lg:mb-32">
        <div className="mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e]">Shift Brain — Pre-Shift</div>
        <h1 className="max-w-5xl font-serif text-6xl font-black leading-[1] tracking-tighter text-[#f5f5f0] sm:text-8xl lg:text-9xl">Pre-Shift Briefing</h1>
        <p className="mt-12 max-w-3xl text-xl font-light leading-relaxed text-[#e8dcc0] opacity-80 italic">
          Review every open signal before service begins. Acknowledge each item, then start the shift to save a briefing snapshot.
        </p>
      </header>

      {shiftBrain && (
        <div className={cx('mb-6 rounded-2xl border p-4', statusConfig.border)}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={cx('h-2.5 w-2.5 rounded-full', statusConfig.dot)} />
              <span className={cx('text-sm font-black uppercase tracking-wider', statusConfig.text)}>{statusConfig.label}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-[#e8dcc0]/70">
              <span>{shiftBrain.summary.openActions} open actions</span>
              <span>{shiftBrain.summary.unresolvedIncidents} unresolved incidents</span>
              {shiftBrain.summary.eventsToday > 0 && (
                <span>{shiftBrain.summary.eventsToday} event{shiftBrain.summary.eventsToday !== 1 ? 's' : ''} today</span>
              )}
            </div>
          </div>
        </div>
      )}

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

      <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
        {/* Briefable items */}
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

        {/* Intelligence panel */}
        {(shiftBrain || managerCarryForward.length > 0) && (
          <div className="space-y-4">
            {/* Manager-flagged carry-forward items from previous shift */}
            {managerCarryForward.length > 0 && (
              <div className="rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-3">
                  Carry-Forward From Previous Shift ({managerCarryForward.length})
                </div>
                <div className="space-y-2.5">
                  {managerCarryForward.slice(0, 8).map(a => (
                    <div key={a.id} className="flex items-start gap-2">
                      <span className={cx('shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]', PRIORITY_STYLE[a.priority])}>
                        {PRIORITY_LABEL[a.priority]}
                      </span>
                      <span className="text-xs leading-5 text-[#e8dcc0]">{a.title}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] leading-5 text-[#e8dcc0]/30">
                  Flagged in Manager Action Center by the previous shift's manager.
                </p>
              </div>
            )}

            {shiftBrain && shiftBrain.recommendedFocus.length > 0 && (
              <div className="rounded-2xl border border-[#6b705c]/30 bg-[#14130f] p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-3">Recommended Focus</div>
                <ul className="space-y-2.5">
                  {shiftBrain.recommendedFocus.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#e8dcc0] leading-6">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {shiftBrain && shiftBrain.riskSignals.length > 0 && (
              <div className="rounded-2xl border border-yellow-800/40 bg-yellow-950/10 p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 mb-3">Risk Signals</div>
                <ul className="space-y-2.5">
                  {shiftBrain.riskSignals.map(s => (
                    <li key={s.id} className="flex items-start gap-2 text-sm leading-6">
                      <span className={cx('mt-2 h-1.5 w-1.5 shrink-0 rounded-full', s.severity === 'high' ? 'bg-red-400' : 'bg-yellow-400')} />
                      <span className="text-[#e8dcc0]">{s.signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {shiftBrain && shiftBrain.carryForwardItems.length > 0 && (
              <div className="rounded-2xl border border-[#6b705c]/30 bg-[#14130f] p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-3">Stale Open Items</div>
                <div className="space-y-2">
                  {shiftBrain.carryForwardItems.map(item => (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                      <span className="text-xs text-[#e8dcc0] leading-5 line-clamp-2">{item.label}</span>
                      <span className="shrink-0 rounded border border-[#6b705c]/30 px-1.5 py-0.5 text-[10px] font-black text-[#e8dcc0]/60 whitespace-nowrap">
                        {item.daysOpen}d open
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shiftBrain && shiftBrain.managerChecklist.length > 0 && (
              <div className="rounded-2xl border border-[#6b705c]/30 bg-[#14130f] p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-3">Manager Checklist</div>
                <div className="space-y-2">
                  {shiftBrain.managerChecklist.map(item => {
                    const done = Boolean(checklistDone[item.id])
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleChecklist(item.id)}
                        className={cx('flex w-full items-start gap-2.5 text-left transition', done ? 'opacity-50' : '')}
                      >
                        <span className={cx('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[9px] font-black transition', done ? 'border-[#c9a96e] bg-[#c9a96e] text-[#0d0c09]' : 'border-[#6b705c]/50')}>
                          {done ? '✓' : ''}
                        </span>
                        <span className={cx('text-xs leading-5', done ? 'line-through text-[#e8dcc0]/40' : 'text-[#e8dcc0]')}>{item.text}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {shiftBrain && shiftBrain.servicePatterns.length > 0 && (
              <div className="rounded-2xl border border-[#6b705c]/20 bg-[#14130f] p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-3">Service Patterns</div>
                <div className="space-y-2">
                  {shiftBrain.servicePatterns.map(p => (
                    <div key={p.category} className="flex items-center justify-between">
                      <span className="text-xs text-[#e8dcc0]">{p.category}</span>
                      <div className="flex items-center gap-2">
                        <span className={cx('h-1.5 w-1.5 rounded-full', p.severity === 'high' ? 'bg-red-400' : 'bg-yellow-400')} />
                        <span className="text-xs font-black text-[#c9a96e]">{p.count}×</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
