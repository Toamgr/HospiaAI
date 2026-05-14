import React, { useState } from 'react'
import { cx, formatMoney } from '../../utils/format'
import { RequestStatusChip } from '../../utils/requestStatus'
import { Card, Button, Label, Header, Metric, MiniFact } from '../../components/AppPrimitives'

export default function ManagerEmployeeRequests({ employeeRequests = [], onReview }) {
  const [notes, setNotes] = useState({})
  const pending = employeeRequests.filter(request => request.status === 'pending_manager_review')
  const reviewed = employeeRequests.filter(request => request.status !== 'pending_manager_review')

  return (
    <>
      <Header eyebrow="Employee Requests" title="Manager Request Review" body="Review employee operational requests before anything reaches owner/admin. Approve only what should move into the owner inbox." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Pending Manager Review" value={String(pending.length)} sub="Need decision" />
        <Metric label="Forwarded To Owner" value={String(employeeRequests.filter(item => item.status === 'pending_owner_review').length)} sub="Manager approved" />
        <Metric label="Rejected By Manager" value={String(employeeRequests.filter(item => item.status === 'rejected_by_manager').length)} sub="Stopped before owner" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {[...pending, ...reviewed].map(request => (
          <Card key={request.id} className={cx('border-l-4', request.status === 'pending_manager_review' ? 'border-l-amber-700' : request.status === 'rejected_by_manager' ? 'border-l-red-700' : 'border-l-[#c9a96e]')}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <Label>{request.category}</Label>
                <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{request.title}</h2>
              </div>
              <RequestStatusChip status={request.status} />
            </div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{request.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniFact label="Submitted By" value={request.submittedBy} />
              <MiniFact label="Urgency" value={request.urgency} />
              <MiniFact label="Estimated Cost" value={request.estimatedCost ? formatMoney(request.estimatedCost) : 'Unknown'} />
            </div>
            {request.status === 'pending_manager_review' && (
              <>
                <textarea value={notes[request.id] || ''} onChange={event => setNotes(prev => ({ ...prev, [request.id]: event.target.value }))} placeholder="Manager note..." rows={3} className="mt-4 w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-3 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={() => onReview?.(request.id, 'approve', notes[request.id] || 'Approved for owner review.')}>Approve And Forward</Button>
                  <Button variant="secondary" onClick={() => onReview?.(request.id, 'reject', notes[request.id] || 'Not approved for owner escalation.')}>Reject</Button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
      {!employeeRequests.length && (
        <Card>
          <p className="text-sm leading-7 text-[#e8dcc0]">No employee operational requests yet.</p>
        </Card>
      )}
    </>
  )
}
