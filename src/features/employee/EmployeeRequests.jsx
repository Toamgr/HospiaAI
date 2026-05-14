import React, { useState, useMemo } from 'react'
import { REQUEST_CATEGORIES, REQUEST_URGENCY } from '../../data/operations'
import { RequestStatusChip } from '../../utils/requestStatus'
import { Card, Button, Label, Header, Field, TextArea, Alert, LabSelect } from '../../components/AppPrimitives'

export default function EmployeeRequests({ currentUser, employeeRequests = [], onSubmit }) {
  const employeeName = currentUser?.username || 'Employee'
  const [form, setForm] = useState({
    title: '',
    category: 'Bar Supply',
    description: '',
    urgency: 'Medium',
    estimatedCost: ''
  })
  const [status, setStatus] = useState(null)
  const myRequests = useMemo(
    () => employeeRequests.filter(request => request.submittedBy === employeeName),
    [employeeName, employeeRequests]
  )

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setStatus({ type: 'error', message: 'Add a request title and a clear description before submitting.' })
      return
    }
    const saved = onSubmit?.(form)
    setStatus({ type: 'success', message: `${saved.title} sent to manager review.` })
    setForm({ title: '', category: 'Bar Supply', description: '', urgency: 'Medium', estimatedCost: '' })
  }

  return (
    <>
      <Header eyebrow="Employee Requests" title="Ask for what service needs." body="Submit supply, maintenance, stock, prep, or operational requests. Managers review first; only approved requests move to owner/admin." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-[#c9a96e]/18">
          <form onSubmit={submit} className="space-y-5">
            <Field id="employee-request-title" label="Request Title" value={form.title} onChange={value => update('title', value)} />
            <div className="grid gap-5 md:grid-cols-3">
              <LabSelect label="Category" value={form.category} options={REQUEST_CATEGORIES} onChange={value => update('category', value)} />
              <LabSelect label="Urgency" value={form.urgency} options={REQUEST_URGENCY} onChange={value => update('urgency', value)} />
              <Field id="employee-request-cost" label="Estimated Cost If Known" type="number" value={form.estimatedCost} onChange={value => update('estimatedCost', value)} />
            </div>
            <TextArea id="employee-request-description" label="Description" value={form.description} onChange={value => update('description', value)} rows={4} />
            {status && <Alert type={status.type}>{status.message}</Alert>}
            <Button type="submit">Submit To Manager</Button>
          </form>
        </Card>

        <Card>
          <Label>Your Request Pipeline</Label>
          <div className="space-y-3">
            {myRequests.length ? myRequests.slice(0, 8).map(request => (
              <article key={request.id} className="rounded-2xl border border-[#6b705c]/20 bg-black/18 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-black text-[#f5f5f0]">{request.title}</div>
                  <RequestStatusChip status={request.status} />
                </div>
                <p className="text-xs leading-5 text-[#e8dcc0]/70">{request.category} - {request.urgency} - {new Date(request.created_at).toLocaleString()}</p>
              </article>
            )) : (
              <p className="text-sm leading-7 text-[#e8dcc0]">No requests submitted yet. Use this for stock, prep, maintenance, paper, glassware, or bar supply needs.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
