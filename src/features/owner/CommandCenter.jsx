import React, { useState } from 'react'
import { cx, formatMoney } from '../../utils/format'
import { Card, Button, Label, Header, Metric, List, SmallReportFact, Alert } from '../../components/AppPrimitives'
import { PROFIT_LEAKS } from '../../data/businessMemory'
import { EVENT_TIERS } from '../../data/events'

const PULSE_CONFIG = {
  clear:     { label: 'Operationally Clear',              dot: 'bg-emerald-400', text: 'text-emerald-400', border: 'border-emerald-800/25', bg: 'bg-emerald-950/10' },
  attention: { label: 'Requires Attention',               dot: 'bg-yellow-400',  text: 'text-yellow-400',  border: 'border-yellow-800/25',  bg: 'bg-yellow-950/10'  },
  critical:  { label: 'Critical — Action Before Service', dot: 'bg-red-400',     text: 'text-red-400',     border: 'border-red-800/25',     bg: 'bg-red-950/10'     }
}

function ShiftPulseCard({ shiftBrain, goToPage }) {
  if (!shiftBrain) return null
  const { summary, riskSignals, recommendedFocus, eventPressure } = shiftBrain
  const pc = PULSE_CONFIG[summary.operationalStatus] || PULSE_CONFIG.clear
  const highRisks = riskSignals.filter(s => s.severity === 'high').slice(0, 2)
  const focusItems = recommendedFocus.slice(0, highRisks.length >= 2 ? 1 : 2)

  return (
    <section className={cx('rounded-[2.5rem] border p-6 sm:p-8', pc.border, pc.bg)}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className={cx('h-2.5 w-2.5 rounded-full', pc.dot)} />
          <span className={cx('text-sm font-black uppercase tracking-widest', pc.text)}>{pc.label}</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#e8dcc0]/35">· Shift Pulse</span>
        </div>
        <button
          type="button"
          onClick={() => goToPage('preShiftBriefing')}
          className="text-[10px] font-black uppercase tracking-wider text-[#c9a96e] transition hover:text-[#e8d0a0]"
        >
          Open Shift Brain →
        </button>
      </div>

      <div className="mb-5 flex flex-wrap gap-8">
        <div>
          <div className={cx('font-serif text-3xl font-black', summary.openActions > 0 ? 'text-[#f5f5f0]' : 'text-[#e8dcc0]/40')}>{summary.openActions}</div>
          <div className="text-[10px] uppercase tracking-wider text-[#e8dcc0]/60">Open Actions</div>
        </div>
        <div>
          <div className={cx('font-serif text-3xl font-black', summary.unresolvedIncidents > 0 ? 'text-[#f5f5f0]' : 'text-[#e8dcc0]/40')}>{summary.unresolvedIncidents}</div>
          <div className="text-[10px] uppercase tracking-wider text-[#e8dcc0]/60">Unresolved Incidents</div>
        </div>
        {summary.urgentActions > 0 && (
          <div>
            <div className="font-serif text-3xl font-black text-red-400">{summary.urgentActions}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#e8dcc0]/60">Urgent</div>
          </div>
        )}
        {eventPressure.totalGuestsToday > 0 && (
          <div>
            <div className="font-serif text-3xl font-black text-[#c9a96e]">{eventPressure.totalGuestsToday}</div>
            <div className="text-[10px] uppercase tracking-wider text-[#e8dcc0]/60">Guests Tonight</div>
          </div>
        )}
      </div>

      {(highRisks.length > 0 || focusItems.length > 0) && (
        <div className="space-y-2 border-t border-[#6b705c]/20 pt-5">
          {highRisks.map(s => (
            <div key={s.id} className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              <span className="text-sm text-[#e8dcc0]">{s.signal}</span>
            </div>
          ))}
          {focusItems.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]" />
              <span className="text-sm text-[#e8dcc0]/75">{f}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function OwnerIntelligenceCard({ title, count, items = [], action, onClick }) {
  return (
    <Card className="border-[#c9a96e]/15">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <Label>{title}</Label>
          <div className="font-serif text-4xl font-black text-[#c9a96e]">{count}</div>
        </div>
        {action && <Button variant="secondary" onClick={onClick}>{action}</Button>}
      </div>
      <List items={items.length ? items : ['No current items.']} />
    </Card>
  )
}

function OwnerEventEnquiryApprovalPanel({ currentUser, pendingEventEnquiries = [], onApproveEventEnquiry }) {
  const [approvalStatus, setApprovalStatus] = useState(null)
  const [approvingId, setApprovingId] = useState('')
  const canApprove = ['owner', 'admin'].includes(currentUser?.role)

  if (!canApprove || (!pendingEventEnquiries.length && !approvalStatus)) return null

  async function approve(eventId) {
    setApprovingId(eventId)
    setApprovalStatus(null)
    const result = await onApproveEventEnquiry?.(eventId)
    setApprovingId('')
    if (!result?.ok) {
      setApprovalStatus({ type: 'error', message: result?.message || 'Could not approve event enquiry.' })
      return
    }
    setApprovalStatus({
      type: result.emailSent ? 'success' : 'error',
      message: result.message || (result.emailSent ? 'Event enquiry approved.' : 'Event approved, but owner email could not be sent.')
    })
  }

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-[#c9a96e]/30 bg-[radial-gradient(circle_at_88%_0%,rgba(201,169,110,0.18),transparent_34%),linear-gradient(135deg,#17140e,#090907)] p-6 shadow-[0_32px_110px_rgba(0,0,0,0.42)] sm:p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.26em] text-[#c9a96e]">Owner Approval Note</div>
          <h2 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">New Event Enquiry Pending Approval</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#e8dcc0]">Manager-created enquiries stay out of operational planning until ownership approves the commercial opportunity.</p>
        </div>
        <span className="rounded-full border border-[#c9a96e]/25 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{pendingEventEnquiries.length} pending</span>
      </div>

      {approvalStatus && <Alert type={approvalStatus.type}>{approvalStatus.message}</Alert>}

      {pendingEventEnquiries.length ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {pendingEventEnquiries.map(event => {
            const config = event.config || {}
            const calculations = event.calculations || {}
            return (
              <article key={event.id} className="rounded-[2rem] border border-[#6b705c]/25 bg-black/24 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{event.eventDate || config.eventDate || 'Date pending'}</div>
                    <h3 className="mt-1 break-words font-serif text-3xl font-black leading-8 text-[#f5f5f0]">{event.name}</h3>
                  </div>
                  <span className="rounded-full border border-amber-700/40 bg-amber-950/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-200">Pending Approval</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SmallReportFact label="Contact" value={event.contactPerson || config.contactPerson || 'Not provided'} />
                  <SmallReportFact label="Guests" value={event.guests || calculations.guests || config.guests || 0} />
                  <SmallReportFact label="Budget / Revenue" value={formatMoney(event.projected_revenue || event.budget || calculations.revenue || 0)} />
                  <SmallReportFact label="Event Time" value={calculations.eventTime || `${config.startTime || ''} - ${config.endTime || ''}`} />
                </div>
                <p className="mt-4 line-clamp-4 rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] p-4 text-sm leading-7 text-[#e8dcc0]">{event.summary || config.eventSummary || 'No generated summary available.'}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#e8dcc0]">{event.eventType || config.eventType || 'Event'} / {EVENT_TIERS[config.tier]?.label || config.tier || 'Service tier pending'}</span>
                  <Button onClick={() => approve(event.id)} disabled={approvingId === event.id}>
                    {approvingId === event.id ? 'Approving...' : 'Approve Enquiry'}
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-[#6b705c]/25 bg-black/20 p-4 text-sm leading-7 text-[#e8dcc0]">No pending event enquiries remain in the owner approval queue.</p>
      )}
    </section>
  )
}

export default function CommandCenter({ t, currentUser, goToPage, reportArchive = [], eventPlans = [], businessMemory = [], budgetRequests = [], employeeRequests = [], serviceIncidents = [], actionItems = [], notifications = [], onApproveEventEnquiry, shiftBrain }) {
  const pendingBudgets = budgetRequests.filter(item => item.status === 'pending')
  const pendingOperationalRequests = employeeRequests.filter(item => item.status === 'pending_owner_review')
  const pendingEventEnquiries = eventPlans.filter(item => item.status === 'ENQUIRY_PENDING_OWNER_APPROVAL' || item.config?.eventStatus === 'ENQUIRY_PENDING_OWNER_APPROVAL')
  const unresolvedIncidents = serviceIncidents.filter(item => !item.resolved)
  const openActions = actionItems.filter(item => !item.done)
  const pipelineRevenue = eventPlans.reduce((sum, event) => sum + Number(event.projected_revenue || event.budget || 0), 0)
  const executionRate = actionItems.length ? Math.round(((actionItems.length - openActions.length) / actionItems.length) * 100) : 100

  const HEADER_TITLE = {
    clear:     'Venue is operating cleanly tonight.',
    attention: 'Your venue has items requiring review before service.',
    critical:  'Critical items require your attention before service.'
  }
  const headerTitle = shiftBrain
    ? (HEADER_TITLE[shiftBrain.summary.operationalStatus] || 'Your venue, fully connected.')
    : 'Your venue, fully connected.'

  return (
    <>
      <Header
        eyebrow={t.areas.command}
        title={headerTitle}
        body="Owner-only operating intelligence: financial exposure, manager execution, event revenue, budget approvals, and critical business memory."
      />

      <div className="space-y-10">
        <ShiftPulseCard shiftBrain={shiftBrain} goToPage={goToPage} />

        <OwnerEventEnquiryApprovalPanel
          currentUser={currentUser}
          pendingEventEnquiries={pendingEventEnquiries}
          onApproveEventEnquiry={onApproveEventEnquiry}
        />

        <Card className="bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_40%),linear-gradient(135deg,#191812,#0d0c09)] p-12 lg:p-20">
          <div className="grid gap-16 xl:grid-cols-[1fr_420px] xl:items-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e]">Financial Overview</div>
              <h2 className="mt-6 max-w-4xl font-serif text-5xl font-black leading-[1.05] tracking-tight text-[#f5f5f0] sm:text-7xl">
                Tonight's exposure is operational, not cosmetic.
              </h2>
              <p className="mt-10 max-w-2xl text-xl leading-relaxed text-[#e8dcc0] opacity-80 italic">Budget approvals, unresolved incidents, and event readiness are now connected to the same owner command layer.</p>
              <div className="mt-12 flex flex-col gap-5 sm:flex-row">
                <Button onClick={() => goToPage('budgetApprovals')}>Review Budget Approvals</Button>
                <Button variant="secondary" onClick={() => goToPage('weeklySummary')}>Open Weekly Summary</Button>
              </div>
            </div>
            <Metric label="Financial Exposure" value={formatMoney(pendingBudgets.reduce((sum, item) => sum + Number(item.amount || 0), 0) + unresolvedIncidents.length * 650)} sub="Budgets + unresolved incidents" large />
          </div>
        </Card>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Metric label="Manager Execution Rate" value={`${executionRate}%`} sub={`${openActions.length} open actions`} />
          <Metric label="Resolved Incidents" value={String(serviceIncidents.filter(i => i.resolved).length)} sub="All-time resolved" />
          <Metric label="Event Pipeline" value={formatMoney(pipelineRevenue)} sub={`${eventPlans.length} saved events`} />
          <Metric label="Event Enquiries" value={String(pendingEventEnquiries.length)} sub="Pending owner approval" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <OwnerIntelligenceCard title="Pending Budget Approvals" count={pendingBudgets.length} action="Open approvals" onClick={() => goToPage('budgetApprovals')} items={pendingBudgets.map(item => `${item.department}: ${formatMoney(item.amount)} - ${item.reason}`)} />
          <OwnerIntelligenceCard title="Approved Operational Requests" count={pendingOperationalRequests.length} action="Open request inbox" onClick={() => goToPage('ownerOperationalRequests')} items={pendingOperationalRequests.slice(0, 4).map(item => `${item.category}: ${item.title} - ${item.urgency}`)} />
          <OwnerIntelligenceCard title="Upcoming Events Revenue Pipeline" count={eventPlans.length} action="Open event CRM" onClick={() => goToPage('eventOrchestrator')} items={eventPlans.slice(0, 4).map(event => `${event.eventDate || 'Date pending'} - ${event.name} - ${formatMoney(event.projected_revenue || event.budget || 0)}`)} />
          <OwnerIntelligenceCard title="Service Incident Trend Overview" count={unresolvedIncidents.length} items={serviceIncidents.slice(0, 4).map(item => `${item.severity} - ${item.issueType} - ${item.employeeName} - ${item.resolved ? 'resolved' : 'unresolved'}`)} />
          <OwnerIntelligenceCard title="Weekly Profit Leak Detection" count={PROFIT_LEAKS.filter(item => item.risk !== 'low').length} action="Open profit leaks" onClick={() => goToPage('profitLeaks')} items={PROFIT_LEAKS.slice(0, 4).map(item => `${item.category}: ${formatMoney(item.monthly)}/mo`)} />
          <OwnerIntelligenceCard title="Business Memory Critical Notes" count={businessMemory.length} action="Open memory" onClick={() => goToPage('businessMemory')} items={businessMemory.slice(0, 4).map(item => `${item.type}: ${item.title}`)} />
          <OwnerIntelligenceCard title="Manager Performance Snapshot" count={executionRate} items={[`${executionRate}% action execution`, `${reportArchive.length} EOD reports archived`, `${openActions.filter(item => item.priority === 'urgent').length} urgent tasks open`]} />
        </div>
      </div>
    </>
  )
}
