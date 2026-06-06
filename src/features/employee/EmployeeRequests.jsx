import React, { useState, useMemo } from 'react'
import { EMPLOYEE_REQUEST_TYPES, EMPLOYEE_REQUEST_URGENCY } from '../../data/operations'
import { RequestStatusChip } from '../../utils/requestStatus'
import { Card, Button, Label, Header, TextArea, Alert, LabSelect, Field } from '../../components/AppPrimitives'

const EMPTY_FORM = {
  type: EMPLOYEE_REQUEST_TYPES[0],
  message: '',
  urgency: 'Normal',
  relatedShift: ''
}

export default function EmployeeRequests({ currentUser, employeeRequests = [], onSubmit }) {
  const employeeName = currentUser?.username || 'Employee'
  const [form, setForm] = useState(EMPTY_FORM)
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
    if (!form.message.trim()) {
      setStatus({ type: 'error', message: 'Add a message before submitting.' })
      return
    }
    const payload = {
      title: form.type,
      category: form.type,
      description: form.message.trim() + (form.relatedShift.trim() ? `\n\nRelated shift: ${form.relatedShift.trim()}` : ''),
      urgency: form.urgency,
      relatedShift: form.relatedShift.trim() || null
    }
    const saved = onSubmit?.(payload)
    setStatus({ type: 'success', message: `${saved.title} sent to manager review.` })
    setForm(EMPTY_FORM)
  }

  return (
    <>
      <Header
        eyebrow="Employee Requests"
        title="Request what you need."
        body="Shift swaps, days off, manager notes, and operational needs. Managers review requests before anything is escalated."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-[#c9a96e]/18">
          <form onSubmit={submit} className="space-y-5">
            <LabSelect
              label="What do you need?"
              value={form.type}
              options={EMPLOYEE_REQUEST_TYPES}
              onChange={value => update('type', value)}
            />
            <TextArea
              id="employee-request-message"
              label="Message"
              value={form.message}
              onChange={value => update('message', value)}
              rows={4}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <LabSelect
                label="Urgency"
                value={form.urgency}
                options={EMPLOYEE_REQUEST_URGENCY}
                onChange={value => update('urgency', value)}
              />
              <Field
                id="employee-request-shift"
                label="Related Shift (optional)"
                value={form.relatedShift}
                onChange={value => update('relatedShift', value)}
              />
            </div>
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
                <p className="text-xs leading-5 text-[#e8dcc0]/70">{request.category} · {request.urgency} · {new Date(request.created_at).toLocaleString()}</p>
              </article>
            )) : (
              <p className="text-sm leading-7 text-[#e8dcc0]">No requests yet. Use this for shift swaps, days off, manager notes, personal issues, or missing equipment.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}
