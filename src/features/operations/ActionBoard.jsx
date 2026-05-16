import React, { useState, useMemo, useEffect } from 'react'
import { cx } from '../../utils/format'
import { Card, Button, Label, Header } from '../../components/AppPrimitives'
import { ACTION_BOARD_ITEMS } from '../../data/businessMemory'
import {
  loadManagerActionStatuses, saveManagerActionStatuses,
  loadManagerActionCarryForward, saveManagerActionCarryForward,
  deriveOperationalActions, enrichActions,
  sortByPriorityThenAge,
  getOpenActions, getUrgentActions, getCarryForwardActions,
  PRIORITY_STYLE, PRIORITY_LABEL,
  SOURCE_STYLE, SOURCE_LABEL,
  STATUS_STYLE, STATUS_LABEL,
} from './operationalIntelligenceUtils'

// ─── ActionCard ────────────────────────────────────────────────────────────────
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

// ─── FilterBar ─────────────────────────────────────────────────────────────────
function FilterBar({ options, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-[#6b705c]/20 bg-[#14130f] p-1">
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

// ─── ActionBoard ───────────────────────────────────────────────────────────────
export default function ActionBoard({
  t,
  currentUser,
  goToPage,
  reportArchive   = [],
  eventPlans      = [],
  actionItems     = ACTION_BOARD_ITEMS,
  setActionItems,
  serviceIncidents = [],
  onUpdateIncident,
  employeePerformance = {},
  employeeTasks   = [],
  onUpdateEmployeeTask,
  supplyRisks     = [],
  budgetRequests  = [],
  ownerNotes      = [],
  onOwnerNote,
  shiftNotes      = [],
  shiftBrain,
  users           = [],
  assignedTasks   = [],
  onAddAssignedTask,
  onUpdateAssignedTask,
}) {
  // ── Intelligence layer (derived from real operational data) ─────────────────
  const [statuses,      setStatuses]      = useState(() => loadManagerActionStatuses())
  const [carryForwards, setCarryForwards] = useState(() => loadManagerActionCarryForward())
  const [filterStatus,   setFilterStatus]   = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterSource,   setFilterSource]   = useState('all')

  useEffect(() => { saveManagerActionStatuses(statuses) },      [statuses])
  useEffect(() => { saveManagerActionCarryForward(carryForwards) }, [carryForwards])

  const derived = useMemo(
    () => deriveOperationalActions(actionItems, serviceIncidents, shiftNotes, reportArchive),
    [actionItems, serviceIncidents, shiftNotes, reportArchive]
  )
  const enriched = useMemo(
    () => enrichActions(derived, statuses, carryForwards, serviceIncidents, actionItems),
    [derived, statuses, carryForwards, serviceIncidents, actionItems]
  )
  const filtered = useMemo(() =>
    enriched
      .filter(a => {
        if (filterStatus   !== 'all' && a.status   !== filterStatus)   return false
        if (filterPriority !== 'all' && a.priority  !== filterPriority) return false
        if (filterSource   !== 'all' && a.source    !== filterSource)   return false
        return true
      })
      .sort(sortByPriorityThenAge),
    [enriched, filterStatus, filterPriority, filterSource]
  )

  const openCount   = getOpenActions(enriched).length
  const urgentCount = getUrgentActions(enriched).length
  const carryCount  = getCarryForwardActions(enriched).length

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

  // ── Quick task board ────────────────────────────────────────────────────────
  const [newTask,        setNewTask]        = useState('')
  const [ownerNoteDraft, setOwnerNoteDraft] = useState('')

  // ── Assign task to employee ──────────────────────────────────────────────────
  const [assignTaskTitle,  setAssignTaskTitle]  = useState('')
  const [assignTargets,    setAssignTargets]    = useState([])
  const [assignPriority,   setAssignPriority]   = useState('normal')
  const [assignDue,        setAssignDue]        = useState('')

  const staffUsers = users.filter(u => u.role !== 'owner' && u.role !== 'admin' && u.username !== currentUser?.username)

  function handleAssignTask() {
    if (!assignTaskTitle.trim() || assignTargets.length === 0) return
    onAddAssignedTask?.({
      title:      assignTaskTitle.trim(),
      assignedTo: assignTargets,
      priority:   assignPriority,
      dueDate:    assignDue || null
    })
    setAssignTaskTitle('')
    setAssignTargets([])
    setAssignPriority('normal')
    setAssignDue('')
  }

  const open              = actionItems.filter(item => !item.done)
  const openEmployeeTasks = employeeTasks.filter(task => task.status !== 'done')
  const eventTaskCompletion = employeeTasks.length
    ? Math.round(((employeeTasks.length - openEmployeeTasks.length) / employeeTasks.length) * 100)
    : 100
  const latestEvent = eventPlans[0]

  const priorityClass = {
    urgent: 'border-red-800/50 bg-red-950/25 text-red-200',
    high:   'border-amber-800/50 bg-amber-950/25 text-amber-200',
    normal: 'border-[#6b705c]/30 bg-[#6b705c]/10 text-[#e8dcc0]'
  }

  function toggle(id) {
    setActionItems?.(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item))
  }

  function addTask() {
    if (!newTask.trim()) return
    const task = {
      id:       `manager-task-${Date.now()}`,
      priority: 'high',
      title:    newTask.trim(),
      owner:    currentUser?.username || 'Manager',
      due:      'Today',
      signal:   'Manager-created task',
      page:     'actionBoard',
      done:     false
    }
    setActionItems?.(prev => [task, ...prev].slice(0, 80))
    setNewTask('')
  }

  function sendNote() {
    if (!ownerNoteDraft.trim()) return
    onOwnerNote?.(ownerNoteDraft.trim())
    setOwnerNoteDraft('')
  }

  return (
    <>
      <Header
        eyebrow={t.pages.actionBoard}
        title="Shift Control"
        body="Consolidated shift intelligence — derived actions, incidents, events, employee tasks, and owner communication."
      />

      {/* ── Summary strip (real derived data) ─────────────────────────────── */}
      <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Open / In Progress', value: openCount,   danger: false,           accent: openCount > 0   },
          { label: 'Urgent Unresolved',  value: urgentCount, danger: urgentCount > 0, accent: false           },
          { label: 'Carry Forward',      value: carryCount,  accent: carryCount > 0,  danger: false           },
          { label: 'Quick Tasks Open',   value: open.length, accent: false,           danger: false           },
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

      <div className="space-y-8">

        {/* ── Operational Action Intelligence ───────────────────────────────── */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[10px] font-black uppercase tracking-[0.26em] text-[#c9a96e]">
              Operational Action Intelligence
            </div>
            <div className="flex flex-wrap gap-2">
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
                options={[['all', 'All Sources'], ['incident', 'Incident'], ['action_board', 'Action Board'], ['shift_note', 'Note'], ['report', 'EOD Report']]}
              />
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-[#6b705c]/12 bg-[#14130f] px-4 py-3">
            <p className="text-[10px] leading-5 text-[#e8dcc0]/35">
              <span className="font-black text-[#e8dcc0]/50">Priority (rule-based): </span>
              Urgent = high/critical incidents · urgent action items · EOD urgent items.
              Important = unresolved incidents · follow-up notes · actions open 3+ days.
              Suggested = derived from notes or reports, not manually created.
            </p>
          </div>

          {carryCount > 0 && (
            <div className="mb-4 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-1">
                Carry Forward — Next Shift
              </div>
              <p className="text-xs leading-5 text-[#e8dcc0]/55">
                {carryCount} unresolved item{carryCount !== 1 ? 's' : ''} flagged to carry into the next pre-shift briefing.
              </p>
            </div>
          )}

          {enriched.length === 0 ? (
            <Card>
              <div className="py-10 text-center">
                <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/[0.05] mb-4">◎</div>
                <p className="text-sm font-bold text-[#e8dcc0]/55 mb-3">No operational actions to display.</p>
                <p className="mx-auto max-w-sm text-xs leading-6 text-[#e8dcc0]/30">
                  Actions appear here once shift notes, service incidents, EOD report items, or manager tasks are created.
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

          {shiftBrain?.riskSignals?.length > 0 && (
            <div className="mt-8">
              <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/60">
                Shift Brain — Pattern Signals
              </div>
              <div className="space-y-2">
                {shiftBrain.riskSignals.map(sig => (
                  <div key={sig.id} className={cx(
                    'rounded-xl border px-4 py-3',
                    sig.severity === 'high' ? 'border-red-800/30 bg-red-950/10' : 'border-amber-800/20 bg-amber-950/[0.08]'
                  )}>
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
        </section>

        {/* ── Quick Task Board ─────────────────────────────────────────────── */}
        <Card>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Label>Quick Task Board</Label>
              <h2 className="font-serif text-2xl font-black text-[#f5f5f0]">Add tasks for this shift</h2>
            </div>
            <div className="flex min-w-[280px] flex-1 gap-3 md:max-w-xl">
              <input
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="Add shortage, prep, guest request, event task..."
                className="min-h-11 flex-1 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]"
              />
              <Button onClick={addTask}>Add</Button>
            </div>
          </div>
          {actionItems.length > 0 ? (
            <div className="space-y-3">
              {actionItems.map(item => (
                <article key={item.id} className={cx(
                  'rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 transition hover:border-[#c9a96e]/40',
                  item.done && 'opacity-55'
                )}>
                  <div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={cx(
                        'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition',
                        item.done ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 hover:border-[#c9a96e]'
                      )}
                    >
                      {item.done ? 'OK' : ''}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap gap-2">
                        <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]', priorityClass[item.priority] || priorityClass.normal)}>
                          {item.priority}
                        </span>
                        <span className="rounded-full border border-[#6b705c]/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]">
                          {item.due}
                        </span>
                      </div>
                      <h2 className="text-sm font-black leading-6 text-[#f5f5f0]">{item.title}</h2>
                      {item.signal && (
                        <p className="mt-1 text-xs leading-6 text-[#e8dcc0]/60">{item.signal}</p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-[#e8dcc0]/55">No tasks added yet. Use the input above to add a task for this shift.</p>
          )}
        </Card>

        {/* ── Assign Task to Employee ──────────────────────────────────────── */}
        <Card>
          <div className="mb-5">
            <Label>Assign Task to Employee</Label>
            <h2 className="font-serif text-2xl font-black text-[#f5f5f0]">Target a specific employee</h2>
          </div>
          <div className="space-y-4">
            <input
              value={assignTaskTitle}
              onChange={e => setAssignTaskTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAssignTask()}
              placeholder="Task description..."
              className="w-full min-h-11 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]"
            />
            <div className="grid gap-4 sm:grid-cols-[1fr_180px_160px_auto]">
              <div>
                <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-[#e8dcc0]/50">Assign to</div>
                <div className="flex flex-wrap gap-2 rounded-xl border border-[#6b705c]/25 bg-[#1a1a1a] p-3 min-h-[2.75rem]">
                  {staffUsers.length === 0 ? (
                    <span className="text-xs text-[#e8dcc0]/35">No staff accounts found.</span>
                  ) : staffUsers.map(u => (
                    <label key={u.username} className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={assignTargets.includes(u.username)}
                        onChange={e => setAssignTargets(prev =>
                          e.target.checked ? [...prev, u.username] : prev.filter(n => n !== u.username)
                        )}
                        className="accent-[#c9a96e]"
                      />
                      <span className="text-xs text-[#e8dcc0]">{u.username}</span>
                      <span className="text-[9px] text-[#e8dcc0]/35 uppercase tracking-wider">{u.role}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-[#e8dcc0]/50">Priority</div>
                <select
                  value={assignPriority}
                  onChange={e => setAssignPriority(e.target.value)}
                  className="w-full min-h-11 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <div className="mb-1.5 text-[10px] font-black uppercase tracking-wider text-[#e8dcc0]/50">Due (optional)</div>
                <input
                  type="date"
                  value={assignDue}
                  onChange={e => setAssignDue(e.target.value)}
                  className="w-full min-h-11 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAssignTask}
                  disabled={!assignTaskTitle.trim() || assignTargets.length === 0}
                >
                  Assign
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Targeted Employee Tasks (manager tracking) ────────────────────── */}
        {assignedTasks.length > 0 && (
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <Label>Targeted Employee Tasks</Label>
                <h2 className="font-serif text-2xl font-black text-[#f5f5f0]">
                  {assignedTasks.filter(t => t.status !== 'done').length} open
                </h2>
              </div>
              <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-xs font-black text-[#c9a96e]">
                {assignedTasks.length} total
              </span>
            </div>
            <div className="space-y-2.5">
              {assignedTasks.slice(0, 10).map(task => (
                <div key={task.id} className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] px-4 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-1.5">
                    <span className="text-sm font-black text-[#f5f5f0]">{task.title}</span>
                    <span className={cx(
                      'rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]',
                      task.status === 'done'        ? 'border-emerald-800/50 text-emerald-200' :
                      task.status === 'in_progress' ? 'border-amber-800/50 text-amber-200'    :
                                                       'border-[#6b705c]/40 text-[#e8dcc0]/55'
                    )}>
                      {task.status === 'done' ? 'Done' : task.status === 'in_progress' ? 'In Progress' : 'Open'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] text-[#e8dcc0]/40">
                    <span>→ {task.assignedTo?.join(', ')}</span>
                    {task.dueDate && <span>Due: {task.dueDate}</span>}
                    <span>{task.created_at?.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Open Employee Event Tasks ─────────────────────────────────────── */}
        {employeeTasks.length > 0 && (
          <Card className="border-[#c9a96e]/20">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <Label>Open Employee Event Tasks</Label>
                <h2 className="font-serif text-2xl font-black text-[#f5f5f0]">{openEmployeeTasks.length} open</h2>
                <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">Event task completion: {eventTaskCompletion}%</p>
              </div>
              <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-xs font-black text-[#c9a96e]">
                {employeeTasks.length} total
              </span>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {employeeTasks.slice(0, 6).map(task => (
                <article key={task.id} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-black text-[#f5f5f0]">{task.title}</span>
                    <span className={cx(
                      'rounded-full border px-2 py-0.5 text-[10px] font-black uppercase',
                      task.status === 'done'       ? 'border-emerald-800/50 text-emerald-200' :
                      task.status === 'inProgress' ? 'border-amber-800/50 text-amber-200' :
                                                     'border-[#6b705c]/50 text-[#e8dcc0]'
                    )}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-xs leading-6 text-[#e8dcc0]">
                    {task.department} · {task.assignedRole} · Due {task.dueDate}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" disabled={task.status === 'inProgress'} onClick={() => onUpdateEmployeeTask?.(task.id, 'inProgress')}>
                      In Progress
                    </Button>
                    <Button disabled={task.status === 'done'} onClick={() => onUpdateEmployeeTask?.(task.id, 'done')}>
                      Done
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        )}

        {/* ── Incidents + shift context ─────────────────────────────────────── */}
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <Label>Live Service Incident Feed</Label>
            {serviceIncidents.length ? (
              <div className="space-y-3">
                {serviceIncidents.slice(0, 8).map(incident => (
                  <article key={incident.id} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-sm font-black text-[#f5f5f0]">
                        {incident.employeeName} — {incident.issueType}
                      </span>
                      <span className={cx(
                        'rounded-full border px-2 py-0.5 text-[10px] font-black uppercase',
                        incident.resolved ? 'border-emerald-800/50 text-emerald-200' : 'border-red-800/50 text-red-200'
                      )}>
                        {incident.resolved ? 'Resolved' : 'Unresolved'}
                      </span>
                    </div>
                    <p className="text-xs leading-6 text-[#e8dcc0]">
                      {incident.time} · {incident.guestTable} · {incident.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="secondary" disabled={incident.resolved} onClick={() => onUpdateIncident?.(incident.id, { resolved: true })}>
                        Resolve
                      </Button>
                      <Button variant="ghost" onClick={() => onUpdateIncident?.(incident.id, { escalated: true })}>
                        Escalate
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-[#e8dcc0]/55">No incidents reported this shift.</p>
            )}
          </Card>

          <div className="space-y-6">
            {supplyRisks.length > 0 && (
              <Card>
                <Label>Shortage & Supply Risk</Label>
                <div className="mb-3 rounded-lg border border-amber-800/20 bg-amber-950/10 px-3 py-2">
                  <p className="text-[10px] text-amber-300/60">
                    Default risk indicators — update via Operational Notes when risks are confirmed for tonight.
                  </p>
                </div>
                <div className="space-y-2">
                  {supplyRisks.map(item => (
                    <div key={item.item} className="rounded-xl border border-[#6b705c]/25 bg-[#1a1a1a] p-3">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={cx(
                          'rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]',
                          item.level === 'critical' ? 'border-red-800/50 text-red-200' :
                          item.level === 'high'     ? 'border-amber-800/50 text-amber-200' :
                                                       'border-[#6b705c]/40 text-[#e8dcc0]'
                        )}>
                          {item.level}
                        </span>
                        <span className="text-xs font-black text-[#f5f5f0]">{item.item}</span>
                      </div>
                      <p className="text-[11px] leading-5 text-[#e8dcc0]/60">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card>
              <Label>Upcoming Event Prep</Label>
              {eventPlans.length ? (
                <div className="space-y-2">
                  {eventPlans.slice(0, 3).map(event => (
                    <div key={event.id || event.name} className="rounded-xl border border-[#6b705c]/25 bg-[#1a1a1a] p-3">
                      <div className="text-xs font-black text-[#f5f5f0]">{event.name}</div>
                      <div className="mt-1 text-[10px] text-[#e8dcc0]/55">
                        {event.eventDate || 'Date pending'} · {event.status || 'Enquiry'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#e8dcc0]/55">No upcoming events in the pipeline.</p>
              )}
            </Card>
          </div>
        </div>

        {/* ── Owner Communication ───────────────────────────────────────────── */}
        <Card className="border-[#c9a96e]/20">
          <Label>Owner Communication</Label>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-3">
              {ownerNotes.length ? (
                ownerNotes.slice(0, 4).map(note => (
                  <div key={note.id} className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm text-[#e8dcc0]">
                    {note.from}: {note.body}
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#e8dcc0]/45">No owner notes yet this shift.</p>
              )}
            </div>
            <div>
              <textarea
                value={ownerNoteDraft}
                onChange={e => setOwnerNoteDraft(e.target.value)}
                placeholder="Send a note to the owner..."
                rows={4}
                className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e] resize-none"
              />
              <Button className="mt-3" onClick={sendNote}>Send Note</Button>
            </div>
          </div>
        </Card>

        {/* ── Quick Navigation ──────────────────────────────────────────────── */}
        <Card>
          <Label>Quick Navigation</Label>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => goToPage('budgetRequest')}>Submit Budget Request</Button>
            <Button variant="secondary" onClick={() => goToPage('eventOrchestrator')}>Open Event Planner</Button>
            <Button variant="secondary" onClick={() => goToPage('endOfDay')}>Close Out Shift</Button>
            <Button variant="secondary" onClick={() => goToPage('staffProgression')}>Staff Coaching</Button>
          </div>
        </Card>

      </div>
    </>
  )
}
