// ARCHIVED — pre-seed scope reduction. Restore in Phase 2.
import React, { useState } from 'react'
import { cx, formatMoney } from '../../../utils/format'
import { Card, Button, Label, Header, Metric, MiniFact } from '../../../components/AppPrimitives'
import { RequestStatusChip } from '../../../utils/requestStatus'

export default function OwnerOperationalRequests({ employeeRequests = [], onReview }) {
  const [notes, setNotes] = useState({})
  const ownerQueue = employeeRequests.filter(request => ['pending_owner_review', 'approved_by_owner', 'rejected_by_owner'].includes(request.status))
  const pending = ownerQueue.filter(request => request.status === 'pending_owner_review')

  return (
    <>
      <Header eyebrow="Approved Operational Requests" title="Owner Operational Request Inbox" body="Only manager-approved employee requests appear here. Rejected manager requests never reach owner review." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Pending Owner Review" value={String(pending.length)} sub="Forwarded by manager" />
        <Metric label="Approved By Owner" value={String(ownerQueue.filter(item => item.status === 'approved_by_owner').length)} sub="Cleared requests" />
        <Metric label="Rejected By Owner" value={String(ownerQueue.filter(item => item.status === 'rejected_by_owner').length)} sub="Declined requests" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {ownerQueue.map(request => (
          <Card key={request.id} className={cx('border-l-4', request.status === 'pending_owner_review' ? 'border-l-[#c9a96e]' : request.status === 'approved_by_owner' ? 'border-l-emerald-700' : 'border-l-red-700')}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <Label>{request.category}</Label>
                <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{request.title}</h2>
              </div>
              <RequestStatusChip status={request.status} />
            </div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{request.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <MiniFact label="Employee" value={request.submittedBy} />
              <MiniFact label="Manager" value={request.managerReviewedBy || 'Pending'} />
              <MiniFact label="Urgency" value={request.urgency} />
              <MiniFact label="Cost" value={request.estimatedCost ? formatMoney(request.estimatedCost) : 'Unknown'} />
            </div>
            {request.managerNote && <p className="mt-4 rounded-2xl border border-[#6b705c]/20 bg-black/18 p-4 text-xs leading-6 text-[#e8dcc0]">Manager note: {request.managerNote}</p>}
            {request.status === 'pending_owner_review' && (
              <>
                <textarea value={notes[request.id] || ''} onChange={event => setNotes(prev => ({ ...prev, [request.id]: event.target.value }))} placeholder="Owner note..." rows={3} className="mt-4 w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-3 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={() => onReview?.(request.id, 'approve', notes[request.id] || 'Approved by owner.')}>Approve</Button>
                  <Button variant="secondary" onClick={() => onReview?.(request.id, 'reject', notes[request.id] || 'Rejected by owner.')}>Reject</Button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
      {!ownerQueue.length && (
        <Card>
          <p className="text-sm leading-7 text-[#e8dcc0]">No manager-approved operational requests are waiting for owner review.</p>
        </Card>
      )}
    </>
  )
}
