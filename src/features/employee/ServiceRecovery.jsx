import React, { useState } from 'react'
import { cx } from '../../utils/format'
import { Card, Button, Label, Header, Field, TextArea, Alert, LabSelect } from '../../components/AppPrimitives'

function PendingEmployeeTasksCard({ currentUser, employeeTasks = [], onUpdateEmployeeTask }) {
  const pendingTasks = employeeTasks.filter(task => task.status !== 'done')
  const completed = employeeTasks.length - pendingTasks.length
  const completion = employeeTasks.length ? Math.round((completed / employeeTasks.length) * 100) : 100

  return (
    <Card className="mb-8 border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.1),transparent_36%),#14130f]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Label>Pending Assigned Tasks</Label>
          <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Assigned work for today.</h2>
          <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">{currentUser?.username || 'Employee'} sees assigned shift tasks here as soon as management publishes operational planning.</p>
        </div>
        <div className="text-right">
          <div className="font-serif text-4xl font-black text-[#c9a96e]">{completion}%</div>
          <div className="text-xs font-bold text-[#e8dcc0]">{pendingTasks.length} pending</div>
        </div>
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
        <p className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm leading-7 text-[#e8dcc0]">No pending assigned event tasks yet. Approved or operational-planning events will appear here automatically.</p>
      )}
    </Card>
  )
}

export default function ServiceRecovery({ t, currentUser, onServiceIncident, employeeTasks = [], onUpdateEmployeeTask }) {
  const [form, setForm] = useState({
    issueType: 'Delay',
    guestTable: '',
    description: '',
    compensation: '',
    severity: 'medium',
    resolved: false
  })
  const [status, setStatus] = useState(null)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.guestTable.trim() || !form.description.trim()) {
      setStatus({ type: 'error', message: 'Add guest/table and a clear description before submitting.' })
      return
    }
    const saved = onServiceIncident?.(form)
    setStatus({ type: 'success', message: `Incident submitted to manager feed and Business Memory${saved?.resolved ? '.' : ' as unresolved.'}` })
    setForm({ issueType: 'Delay', guestTable: '', description: '', compensation: '', severity: 'medium', resolved: false })
  }

  return (
    <>
      <Header eyebrow={t.pages.serviceRecovery} title="Report An Issue" body="A simple operational channel for guest, table, service, or supply issues. Submit early so the shift can recover quickly." />
      <PendingEmployeeTasksCard currentUser={currentUser} employeeTasks={employeeTasks} onUpdateEmployeeTask={onUpdateEmployeeTask} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="border-[#c9a96e]/20">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <LabSelect label="Issue Type" value={form.issueType} options={['Delay', 'Food Quality', 'Beverage', 'Allergy', 'Language / Tone', 'Billing', 'Other']} onChange={value => update('issueType', value)} />
              <LabSelect label="Severity" value={form.severity} options={['low', 'medium', 'high']} onChange={value => update('severity', value)} />
              <Field id="employee-guest-table" label="Guest / Table" value={form.guestTable} onChange={value => update('guestTable', value)} />
              <Field id="employee-compensation" label="Compensation Offered" value={form.compensation} onChange={value => update('compensation', value)} />
            </div>
            <TextArea id="employee-incident-description" label="Description" value={form.description} onChange={value => update('description', value)} rows={5} />
            <label className="flex items-center gap-3 rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm font-bold text-[#e8dcc0]">
              <input type="checkbox" checked={form.resolved} onChange={event => update('resolved', event.target.checked)} className="accent-[#c9a96e]" />
              Resolved before escalation
            </label>
            {status && <Alert type={status.type}>{status.message}</Alert>}
            <Button type="submit">Submit Issue</Button>
          </form>
        </Card>
        <Card>
          <Label>Report Flow</Label>
          <List items={[
            'Report early. The manager feed is for protection and clarity.',
            'Include table, issue type, and what was already done.',
            'Unresolved issues create live manager actions automatically.',
            `Logged in employee: ${currentUser?.username || 'Employee'}`
          ]} />
        </Card>
      </div>
    </>
  )
}
