import React, { useState } from 'react'
import { formatMoney } from '../../utils/format'
import { Card, Button, Label, Field, TextArea, Alert, Header, List, LabSelect } from '../../components/AppPrimitives'

export default function BudgetRequestPage({ t, onSubmit, budgetRequests = [], currentUser }) {
  const [form, setForm] = useState({ title: '', department: 'Bar', reason: '', amount: '', urgency: 'Medium', roi: '', notes: '' })
  const [status, setStatus] = useState(null)
  const myRequests = budgetRequests.filter(item => item.managerName === currentUser?.username)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.reason.trim() || !Number(form.amount)) {
      setStatus({ type: 'error', message: 'Title, reason, and amount are required.' })
      return
    }
    const saved = onSubmit?.(form)
    setStatus({ type: 'success', message: `${saved.title} submitted to owner approval queue.` })
    setForm({ title: '', department: 'Bar', reason: '', amount: '', urgency: 'Medium', roi: '', notes: '' })
  }

  return (
    <>
      <Header eyebrow={t.pages.budgetRequest} title="Submit Budget Request" body="Manager request workflow connected to owner approvals, notifications, and response status." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <form onSubmit={submit} className="space-y-5">
            <Field id="budget-title" label="Request Title" value={form.title} onChange={value => update('title', value)} />
            <div className="grid gap-5 md:grid-cols-3">
              <LabSelect label="Department" value={form.department} options={['Bar', 'Kitchen', 'Floor', 'Events', 'Training', 'Maintenance']} onChange={value => update('department', value)} />
              <Field id="budget-amount" label="Amount Requested" type="number" value={form.amount} onChange={value => update('amount', value)} />
              <LabSelect label="Urgency" value={form.urgency} options={['Low', 'Medium', 'High', 'Critical']} onChange={value => update('urgency', value)} />
            </div>
            <TextArea id="budget-reason" label="Reason" value={form.reason} onChange={value => update('reason', value)} />
            <TextArea id="budget-roi" label="Expected ROI" value={form.roi} onChange={value => update('roi', value)} rows={3} />
            <TextArea id="budget-notes" label="Notes" value={form.notes} onChange={value => update('notes', value)} rows={3} />
            {status && <Alert type={status.type}>{status.message}</Alert>}
            <Button type="submit">Submit For Owner Approval</Button>
          </form>
        </Card>
        <Card>
          <Label>Your Budget Responses</Label>
          <List items={myRequests.length ? myRequests.map(item => `${item.status.toUpperCase()}: ${item.title} - ${formatMoney(item.amount)}${item.responseNote ? ` - ${item.responseNote}` : ''}`) : ['No submitted requests yet.']} />
        </Card>
      </div>
    </>
  )
}
