import React, { useState } from 'react'
import { cx, formatMoney } from '../../utils/format'
import { Card, Button, Label, Header, Metric, List, MiniFact } from '../../components/AppPrimitives'
import { STAFF } from '../../data/staff'
import { ACTION_BOARD_ITEMS } from '../../data/businessMemory'
import { INITIAL_SHIFT_PROFILE } from '../../data/operations'
import { Sparkles, ClipboardCheck } from 'lucide-react'

function ShiftBriefingWidget({ openActions, latestReport, latestEvent, goToPage }) {
  const urgentActions = openActions.filter(item => item.priority === 'urgent')
  const briefingItems = [
    urgentActions[0]?.title || 'Confirm floor readiness before doors open.',
    latestReport?.urgent_items || latestReport?.shift_summary || 'No archived End Of Day handoff yet. Closing reports should feed tomorrow briefing.',
    latestEvent ? `Event plan active: ${latestEvent.name} with projected profit ${formatMoney(latestEvent.projected_profit || latestEvent.calculations?.grossProfit || 0)}.` : 'No saved event plan in the current briefing stack.'
  ]

  return (
    <section className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_35%),#1a1a1a]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Live Shift Briefing
            </div>
            <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Before service, align the room on the few things that matter.</h2>
          </div>
          <span className="rounded-full border border-red-800/50 bg-red-950/25 px-3 py-1 text-xs font-black text-red-200">{urgentActions.length} urgent</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {briefingItems.map((item, index) => (
            <div key={item} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
              <div className="mb-2 font-serif text-3xl font-black text-[#6b705c]">0{index + 1}</div>
              <p className="text-sm leading-7 text-[#e8dcc0]">{item}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#c9a96e]/15">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Pre-Shift Micro Training
        </div>
        <p className="mb-4 text-sm leading-7 text-[#e8dcc0]">The correct training unit for today is not a full course. It is the smallest drill that reduces tonight's highest risk.</p>
        <div className="space-y-3">
          <button type="button" onClick={() => goToPage('serviceRecovery')} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-left text-sm font-bold text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]">Run 5-minute recovery language calibration</button>
          <button type="button" onClick={() => goToPage('simulation')} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-left text-sm font-bold text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]">Score one pressure scenario before lineup</button>
          <button type="button" onClick={() => goToPage('sopSheets')} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-left text-sm font-bold text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]">Review delay SOP with exact guest language</button>
        </div>
      </Card>
    </section>
  )
}

export default function ActionBoard({ t, currentUser, goToPage, reportArchive = [], eventPlans = [], actionItems = ACTION_BOARD_ITEMS, setActionItems, serviceIncidents = [], onUpdateIncident, employeePerformance = {}, employeeTasks = [], onUpdateEmployeeTask, supplyRisks = [], shiftProfile = INITIAL_SHIFT_PROFILE, budgetRequests = [], ownerNotes = [], onOwnerNote }) {
  const items = actionItems
  const open = items.filter(item => !item.done)
  const completed = items.filter(item => item.done)
  const urgent = open.filter(item => item.priority === 'urgent').length
  const [newTask, setNewTask] = useState('')
  const [ownerNoteDraft, setOwnerNoteDraft] = useState('')
  const latestEvent = eventPlans[0]
  const activeEmployees = STAFF.filter(item => item.status !== 'At Risk')
  const weakEmployees = STAFF.filter(item => item.status === 'Needs Coaching' || item.status === 'At Risk')
  const incompleteAcademy = STAFF.filter(item => item.progress < 80)
  const vipCapable = STAFF.filter(item => item.simulation >= 85).length
  const openEmployeeTasks = employeeTasks.filter(task => task.status !== 'done')
  const eventTaskCompletion = employeeTasks.length ? Math.round(((employeeTasks.length - openEmployeeTasks.length) / employeeTasks.length) * 100) : 100
  const priorityClass = {
    urgent: 'border-red-800/50 bg-red-950/25 text-red-200',
    high: 'border-amber-800/50 bg-amber-950/25 text-amber-200',
    normal: 'border-[#6b705c]/30 bg-[#6b705c]/10 text-[#e8dcc0]'
  }

  function toggle(id) {
    setActionItems?.(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item))
  }

  function addTask() {
    if (!newTask.trim()) return
    const task = { id: `manager-task-${Date.now()}`, priority: 'high', title: newTask.trim(), owner: currentUser?.username || 'Manager', due: 'Today', signal: 'Manager-created control tower task', page: 'actionBoard', done: false }
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
      <Header eyebrow={t.pages.actionBoard} title="Shift Operations Control Tower" body="A live manager operating room for today's floor status, staff risk, incidents, shortages, event prep, approvals, and owner communication." />

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Shift Type" value={shiftProfile.shiftType} sub={new Date().toLocaleDateString()} />
        <Metric label="Expected Covers" value={String(shiftProfile.expectedCovers)} sub={`${shiftProfile.vipReservations} VIP reservations`} />
        <Metric label="Event Today" value={shiftProfile.eventToday ? 'Yes' : 'No'} sub={latestEvent?.name || 'No event attached'} />
        <Metric label="Pressure Level" value={shiftProfile.pressureLevel} sub="Floor load estimate" />
        <Metric label="Open Actions" value={String(open.length)} sub={`${urgent} urgent`} />
      </div>

      <div className="space-y-8">
        <Card className="border-[#c9a96e]/20">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <Label>Open Employee Event Tasks</Label>
              <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{openEmployeeTasks.length} open tasks</h2>
              <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">Completion across event-generated employee execution work: {eventTaskCompletion}%.</p>
            </div>
            <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-xs font-black text-[#c9a96e]">{employeeTasks.length} total</span>
          </div>
          {employeeTasks.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {employeeTasks.slice(0, 6).map(task => (
                <article key={task.id} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-black text-[#f5f5f0]">{task.title}</span>
                    <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase', task.status === 'done' ? 'border-emerald-800/50 text-emerald-200' : task.status === 'inProgress' ? 'border-amber-800/50 text-amber-200' : 'border-[#6b705c]/50 text-[#e8dcc0]')}>{task.status}</span>
                  </div>
                  <p className="text-xs leading-6 text-[#e8dcc0]">{task.department} - {task.assignedRole} - Due {task.dueDate} - {task.linkedEventName}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" disabled={task.status === 'inProgress'} onClick={() => onUpdateEmployeeTask?.(task.id, 'inProgress')}>In Progress</Button>
                    <Button disabled={task.status === 'done'} onClick={() => onUpdateEmployeeTask?.(task.id, 'done')}>Done</Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-[#e8dcc0]">No approved or operational-planning event has generated employee tasks yet.</p>
          )}
        </Card>

        <Card>
          <Label>Staff On Duty Snapshot</Label>
          <div className="grid gap-4 md:grid-cols-5">
            <MiniFact label="Active Employees" value={activeEmployees.length} />
            <MiniFact label="Absent Employees" value="1" />
            <MiniFact label="Weak / New" value={weakEmployees.length} />
            <MiniFact label="Incomplete Academy" value={incompleteAcademy.length} />
            <MiniFact label="VIP Capable" value={vipCapable} />
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div><Label>Priority Action Board</Label><h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Urgent unresolved work</h2></div>
            <div className="flex min-w-[280px] flex-1 gap-3 md:max-w-xl">
              <input value={newTask} onChange={event => setNewTask(event.target.value)} placeholder="Add shortage, prep, owner request, event task..." className="min-h-11 flex-1 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
              <Button onClick={addTask}>Add</Button>
            </div>
          </div>
          <div className="space-y-3">
            {items.map(item => (
              <article key={item.id} className={cx('rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 transition hover:border-[#c9a96e]/40', item.done && 'opacity-55')}>
              <div className="flex items-start gap-4">
                <button type="button" onClick={() => toggle(item.id)} className={cx('mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition', item.done ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 hover:border-[#c9a96e]')}>
                  {item.done ? 'OK' : ''}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]', priorityClass[item.priority])}>{item.priority}</span>
                    <span className="rounded-full border border-[#6b705c]/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]">{item.due}</span>
                  </div>
                  <h2 className="text-sm font-black leading-6 text-[#f5f5f0]">{item.title}</h2>
                  <p className="mt-2 text-xs leading-6 text-[#e8dcc0]">{item.signal}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-[#e8dcc0]">Owner: {item.owner}</span>
                    <Button variant="ghost" onClick={() => goToPage(item.page)}>Open Module</Button>
                  </div>
                </div>
              </div>
              </article>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <Label>Live Service Incident Feed</Label>
            <div className="space-y-3">
              {serviceIncidents.slice(0, 8).map(incident => (
                <article key={incident.id} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-black text-[#f5f5f0]">{incident.employeeName} - {incident.issueType}</span>
                    <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase', incident.resolved ? 'border-emerald-800/50 text-emerald-200' : 'border-red-800/50 text-red-200')}>{incident.resolved ? 'resolved' : 'unresolved'}</span>
                  </div>
                  <p className="text-xs leading-6 text-[#e8dcc0]">{incident.time} - {incident.guestTable} - {incident.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" disabled={incident.resolved} onClick={() => onUpdateIncident?.(incident.id, { resolved: true })}>Resolve</Button>
                    <Button variant="ghost" onClick={() => onUpdateIncident?.(incident.id, { escalated: true })}>Escalate</Button>
                    <Button variant="ghost" onClick={() => onUpdateIncident?.(incident.id, { coachingNote: 'Manager coaching note added.' })}>Add Coaching Note</Button>
                  </div>
                </article>
              ))}
            </div>
          </Card>
          <div className="space-y-6">
            <Card><Label>Shortage & Supply Risk</Label><List items={supplyRisks.map(item => `${item.level.toUpperCase()}: ${item.item} - ${item.detail}`)} /></Card>
            <Card><Label>Upcoming Event Prep</Label><List items={eventPlans.slice(0, 3).map(event => `${event.eventDate || 'Date pending'} - ${event.name} - ${event.status || 'Inquiry'}`)} /></Card>
          </div>
        </div>

        <Card>
          <Label>Quick Manager Actions</Label>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => goToPage('budgetRequest')}>Submit Budget Request</Button>
            <Button variant="secondary" onClick={() => goToPage('eventOrchestrator')}>Open Event Planner</Button>
            <Button variant="secondary" onClick={() => goToPage('endOfDay')}>Open End Of Day</Button>
            <Button variant="secondary" onClick={() => goToPage('staffProgression')}>Open Staff Coaching</Button>
          </div>
        </Card>

        <Card className="border-[#c9a96e]/20">
          <Label>Owner Communication Strip</Label>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-3">{ownerNotes.slice(0, 4).map(note => <div key={note.id} className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm text-[#e8dcc0]">{note.from}: {note.body}</div>)}</div>
            <div>
              <textarea value={ownerNoteDraft} onChange={event => setOwnerNoteDraft(event.target.value)} placeholder="Send owner note..." rows={4} className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
              <Button className="mt-3" onClick={sendNote}>Send Owner Note</Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
