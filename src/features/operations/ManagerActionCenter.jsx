import { useState, useMemo, useEffect } from 'react'
import { cx } from '../../utils/format'
import { Card, Label, Header } from '../../components/AppPrimitives'
import {
  STATUS_KEY, CARRY_KEY,
  loadManagerActionStatuses, saveManagerActionStatuses,
  loadManagerActionCarryForward, saveManagerActionCarryForward,
  deriveOperationalActions, enrichActions,
  sortByPriorityThenAge,
  getOpenActions, getUrgentActions, getCarryForwardActions,
  PRIORITY_STYLE, PRIORITY_LABEL,
  SOURCE_STYLE, SOURCE_LABEL,
  STATUS_STYLE, STATUS_LABEL,
} from './operationalIntelligenceUtils'

// ─── ActionCard ───────────────────────────────────────────────────────────────
function ActionCard({ action, onStatusChange, onCarryForwardToggle }) {
  const isResolved   = action.status === 'resolved'
  const isInProgress = action.status === 'in_progress'

  return (
    <article className={cx(
      'rounded-2xl border border-[#6b705c]/20 bg-[#14130f] p-4 transition',
      isResolved ? 'opacity-50' : 'hover:border-[#6b705c]/35'
    )}>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className={cx('rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.13em]', PRIORITY_STYLE[action.priority])}>
          {PRIORITY_LABEL[action.priority]}
        </span>
        <span className={cx('rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.13em]', SOURCE_STYLE[action.source] || 'border-[#6b705c]/25 text-[#e8dcc0]/50')}>
          {SOURCE_LABEL[action.source] || action.source}
        </span>
        {action.suggested && (
          <span className="rounded-full border border-[#6b705c]/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.13em] text-[#e8dcc0]/35">
            Suggested
          </span>
        )}
        <span className={cx('ml-auto rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.13em]', STATUS_STYLE[action.status])}>
          {STATUS_LABEL[action.status]}
        </span>
      </div>

      <h3 className={cx('text-sm font-black leading-6', isResolved ? 'line-through text-[#e8dcc0]/35' : 'text-[#f5f5f0]')}>
        {action.title}
      </h3>
      {action.detail && (
        <p className="mt-1 text-xs leading-5 text-[#e8dcc0]/45">{action.detail}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#e8dcc0]/40">
          {action.owner && <span>Owner: {action.owner}</span>}
          {action.due   && <span>Due: {action.due}</span>}
          {action.daysOpen >= 3 && !isResolved && (
            <span className="font-bold text-amber-400/65">{action.daysOpen}d open</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onCarryForwardToggle(action.id)}
            className={cx(
              'rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] transition',
              action.carryForward
                ? 'border-[#c9a96e]/35 bg-[#c9a96e]/10 text-[#c9a96e]'
                : 'border-[#6b705c]/20 text-[#e8dcc0]/30 hover:border-[#6b705c]/40 hover:text-[#e8dcc0]/50'
            )}
          >
            {action.carryForward ? '→ Carry Forward' : 'Carry Forward'}
          </button>

          {!isResolved && !isInProgress && (
            <button
              type="button"
              onClick={() => onStatusChange(action, 'in_progress')}
              className="rounded-full border border-amber-800/35 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-amber-300/75 transition hover:bg-amber-950/20"
            >
              In Progress
            </button>
          )}
          {!isResolved && (
            <button
              type="button"
              onClick={() => onStatusChange(action, 'resolved')}
              className="rounded-full border border-emerald-800/35 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-300/75 transition hover:bg-emerald-950/20"
            >
              Resolve
            </button>
          )}
          {isResolved && (
            <button
              type="button"
              onClick={() => onStatusChange(action, 'open')}
              className="rounded-full border border-[#6b705c]/25 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]/40 transition hover:border-[#6b705c]/40"
            >
              Reopen
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
function FilterBar({ options, active, onChange }) {
  return (
    <div className="flex gap-1 rounded-xl border border-[#6b705c]/20 bg-[#14130f] p-1">
      {options.map(([value, text]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={cx(
            'rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider transition',
            active === value ? 'bg-[#c9a96e] text-[#0d0c09]' : 'text-[#e8dcc0]/45 hover:text-[#e8dcc0]'
          )}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

// ─── ManagerActionCenter ──────────────────────────────────────────────────────
export default function ManagerActionCenter({
  actionItems      = [],
  setActionItems,
  serviceIncidents = [],
  onUpdateIncident,
  shiftNotes       = [],
  reportArchive    = [],
  shiftBrain,
}) {
  const [statuses,      setStatuses]      = useState(() => loadManagerActionStatuses())
  const [carryForwards, setCarryForwards] = useState(() => loadManagerActionCarryForward())
  const [filterStatus,   setFilterStatus]   = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterSource,   setFilterSource]   = useState('all')

  useEffect(() => { saveManagerActionStatuses(statuses) }, [statuses])
  useEffect(() => { saveManagerActionCarryForward(carryForwards) }, [carryForwards])

  const derived = useMemo(
    () => deriveOperationalActions(actionItems, serviceIncidents, shiftNotes, reportArchive),
    [actionItems, serviceIncidents, shiftNotes, reportArchive]
  )

  const enriched = useMemo(
    () => enrichActions(derived, statuses, carryForwards, serviceIncidents, actionItems),
    [derived, statuses, carryForwards, serviceIncidents, actionItems]
  )

  const filtered = useMemo(() => enriched
    .filter(a => {
      if (filterStatus   !== 'all' && a.status   !== filterStatus)   return false
      if (filterPriority !== 'all' && a.priority  !== filterPriority) return false
      if (filterSource   !== 'all' && a.source    !== filterSource)   return false
      return true
    })
    .sort(sortByPriorityThenAge),
    [enriched, filterStatus, filterPriority, filterSource]
  )

  function handleStatusChange(action, newStatus) {
    setStatuses(prev => ({ ...prev, [action.id]: newStatus }))
    if (newStatus === 'resolved') {
      if (action.source === 'incident')     onUpdateIncident?.(action.sourceId, { resolved: true })
      if (action.source === 'action_board') setActionItems?.(prev => prev.map(a => a.id === action.sourceId ? { ...a, done: true }  : a))
    }
    if (newStatus === 'open') {
      if (action.source === 'incident')     onUpdateIncident?.(action.sourceId, { resolved: false })
      if (action.source === 'action_board') setActionItems?.(prev => prev.map(a => a.id === action.sourceId ? { ...a, done: false } : a))
    }
  }

  function toggleCarryForward(actionId) {
    setCarryForwards(prev => ({ ...prev, [actionId]: !prev[actionId] }))
  }

  const openCount   = getOpenActions(enriched).length
  const urgentCount = getUrgentActions(enriched).length
  const carryCount  = getCarryForwardActions(enriched).length

  return (
    <>
      <Header
        eyebrow="Shift Control"
        title="Manager Action Center"
        body="Open incidents, unresolved actions, follow-up notes, and EOD urgent items — consolidated in one place. Suggested items are clearly labeled. Only actions from confirmed sources (action board, incidents) update their source records when resolved."
      />

      {/* Summary strip */}
      <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Open / In Progress', value: openCount,       danger: false,           accent: openCount > 0   },
          { label: 'Urgent Unresolved',  value: urgentCount,     danger: urgentCount > 0, accent: false           },
          { label: 'Carry Forward',      value: carryCount,      accent: carryCount > 0,  danger: false           },
          { label: 'Total Actions',      value: enriched.length, accent: false,           danger: false           },
        ].map(({ label, value, danger, accent }) => (
          <div key={label} className={cx(
            'rounded-2xl border p-4',
            danger ? 'border-red-800/35 bg-red-950/10' : accent ? 'border-[#c9a96e]/15 bg-[#c9a96e]/5' : 'border-[#6b705c]/15 bg-[#14130f]'
          )}>
            <div className={cx(
              'font-serif text-3xl font-black',
              danger ? 'text-red-300' : accent ? 'text-[#c9a96e]' : 'text-[#f5f5f0]'
            )}>{value}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/45">{label}</div>
          </div>
        ))}
      </div>

      {/* Priority method transparency note */}
      <div className="mb-5 rounded-xl border border-[#6b705c]/12 bg-[#14130f] px-4 py-3">
        <p className="text-[10px] leading-5 text-[#e8dcc0]/35">
          <span className="font-black text-[#e8dcc0]/50">Priority (rule-based): </span>
          Urgent = high/critical incidents · urgent action items · SOP deviation notes · EOD urgent items.
          Important = any unresolved incident · follow-up notes · EOD complaints · actions open 3+ days.
          Normal = general open actions. Suggested = derived from notes or reports, not manually created.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <FilterBar
          active={filterStatus}
          onChange={setFilterStatus}
          options={[['all', 'All Status'], ['open', 'Open'], ['in_progress', 'In Progress'], ['resolved', 'Resolved']]}
        />
        <FilterBar
          active={filterPriority}
          onChange={setFilterPriority}
          options={[['all', 'All Priority'], ['urgent', 'Urgent'], ['important', 'Important'], ['normal', 'Normal']]}
        />
        <FilterBar
          active={filterSource}
          onChange={setFilterSource}
          options={[['all', 'All Sources'], ['incident', 'Incident'], ['action_board', 'Action Board'], ['shift_note', 'Shift Note'], ['report', 'EOD Report']]}
        />
      </div>

      {/* Carry-forward banner */}
      {carryCount > 0 && (
        <div className="mb-5 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-1">Carry Forward — Next Shift</div>
          <p className="text-xs leading-5 text-[#e8dcc0]/55">
            {carryCount} unresolved item{carryCount !== 1 ? 's' : ''} flagged to carry into the next pre-shift briefing.
          </p>
        </div>
      )}

      {/* Action list */}
      {enriched.length === 0 ? (
        <Card>
          <Label>No Actions Yet</Label>
          <div className="py-10 text-center">
            <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/[0.05] mb-4">◎</div>
            <p className="text-sm font-bold text-[#e8dcc0]/55 mb-3">No operational actions to display.</p>
            <p className="mx-auto max-w-sm text-xs leading-6 text-[#e8dcc0]/30">
              Actions appear here once shift notes (tagged follow-up or pinned), service incidents,
              End Of Day report urgent items, or manager action board items are created.
            </p>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <p className="py-4 text-sm text-[#e8dcc0]/45">No actions match the current filters. Clear a filter to see more.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(action => (
            <ActionCard
              key={action.id}
              action={action}
              onStatusChange={handleStatusChange}
              onCarryForwardToggle={toggleCarryForward}
            />
          ))}
        </div>
      )}

      {/* Shift Brain risk signals */}
      {shiftBrain?.riskSignals?.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/60">
            Shift Brain — Pattern Signals
          </div>
          <div className="space-y-2">
            {shiftBrain.riskSignals.map(sig => (
              <div
                key={sig.id}
                className={cx(
                  'rounded-xl border px-4 py-3',
                  sig.severity === 'high'
                    ? 'border-red-800/30 bg-red-950/10'
                    : 'border-amber-800/20 bg-amber-950/8'
                )}
              >
                <p className={cx(
                  'text-xs leading-5',
                  sig.severity === 'high' ? 'text-red-300/75' : 'text-amber-300/65'
                )}>
                  {sig.signal}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-[#e8dcc0]/25">
            Pattern signals are generated by Shift Brain from open incidents, stale actions, and event data — not manually entered.
          </p>
        </div>
      )}
    </>
  )
}
