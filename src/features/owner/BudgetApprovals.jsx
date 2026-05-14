import React, { useState } from 'react'
import { cx, formatMoney } from '../../utils/format'
import { Card, Button, Label, Header, Metric } from '../../components/AppPrimitives'

export default function BudgetApprovals({ t, budgetRequests = [], onRespond }) {
  const [responseNotes, setResponseNotes] = useState({})
  const pending = budgetRequests.filter(item => item.status === 'pending')

  return (
    <>
      <Header eyebrow={t.pages.budgetApprovals} title="Approve Budget" body="Owner approval board for manager requests with response status flowing back to manager operations." />
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Metric label="Pending Requests" value={String(pending.length)} sub="Need owner decision" />
        <Metric label="Pending Amount" value={formatMoney(pending.reduce((sum, item) => sum + Number(item.amount || 0), 0))} sub="Capital exposure" />
        <Metric label="Total Requests" value={String(budgetRequests.length)} sub="Local approval database" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {budgetRequests.map(request => (
          <Card key={request.id} className={cx('border-l-4', request.status === 'approved' ? 'border-l-emerald-700' : request.status === 'rejected' ? 'border-l-red-700' : 'border-l-[#c9a96e]')}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div><Label>{request.department}</Label><h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{request.title}</h2></div>
              <div className="text-right"><div className="font-serif text-3xl font-black text-[#c9a96e]">{formatMoney(request.amount)}</div><div className="text-xs text-[#e8dcc0]">{request.urgency}</div></div>
            </div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{request.reason}</p>
            <p className="mt-3 text-xs leading-6 text-[#e8dcc0]">ROI: {request.roi || 'Not specified'}</p>
            <p className="mt-2 text-xs leading-6 text-[#e8dcc0]">Manager: {request.managerName}</p>
            <textarea value={responseNotes[request.id] || ''} onChange={event => setResponseNotes(prev => ({ ...prev, [request.id]: event.target.value }))} placeholder="Owner response note..." rows={3} className="mt-4 w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-3 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button disabled={request.status !== 'pending'} onClick={() => onRespond?.(request.id, 'approved', responseNotes[request.id])}>Approve</Button>
              <Button variant="secondary" disabled={request.status !== 'pending'} onClick={() => onRespond?.(request.id, 'rejected', responseNotes[request.id])}>Reject</Button>
              <Button variant="ghost" disabled={request.status !== 'pending'} onClick={() => onRespond?.(request.id, 'needs more info', responseNotes[request.id] || 'Please provide more detail.')}>Need More Info</Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}
