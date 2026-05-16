import React from 'react'
import { formatMoney } from '../../utils/format'
import { Card, Label, Header, List } from '../../components/AppPrimitives'
import { CircleDollarSign } from 'lucide-react'

function ReportFact({ label, value }) {
  return (
    <div className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{label}</div>
      <p className="text-sm leading-7 text-[#f5f5f0]">{value}</p>
    </div>
  )
}

function OwnerValueLedger({ totalEventProfit, reportSignals, eventPlans, reportArchive }) {
  const ledger = [
    { label: 'Projected event profit pipeline', value: formatMoney(totalEventProfit), detail: `${eventPlans.length} saved Event Orchestrator plans` },
    { label: 'Operational risk signals captured', value: String(reportSignals), detail: `${reportArchive.length} End Of Day reports archived` },
    { label: 'Operational signals captured', value: String(reportSignals > 0 ? reportSignals : '—'), detail: reportSignals > 0 ? 'Reports with urgent items or complaints' : 'No urgent signals recorded yet' },
    { label: 'Staff progression tracked', value: String(reportArchive.length > 0 ? 'Active' : '—'), detail: 'See Staff Progression for coaching flags' }
  ]

  return (
    <Card className="mt-4 border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.1),transparent_36%),#14130f]">
      <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">
        <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
        Owner Value Ledger
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ledger.map(item => (
          <div key={item.label} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
            <div className="font-serif text-3xl font-black text-[#c9a96e]">{item.value}</div>
            <div className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{item.label}</div>
            <p className="mt-2 text-xs leading-5 text-[#e8dcc0]">{item.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function OwnerReport({ t, reportArchive = [], eventPlans = [] }) {
  const latestReport = reportArchive[0]
  const latestEvent = eventPlans[0]
  const totalEventProfit = eventPlans.reduce((sum, plan) => sum + Number(plan.projected_profit || plan.calculations?.grossProfit || 0), 0)
  const reportSignals = reportArchive.filter(report => report.urgent_items || report.complaints).length

  return (
    <>
      <Header eyebrow={t.pages.ownerReport} title="Owner Weekly Report" body="A boardroom-ready summary created from End Of Day reports, readiness data, profit leak signals, and business memory." />
      <Card className="mb-6 border-[#c9a96e]/20 bg-[#1a1a1a]">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c9a96e]">Executive Summary</div>
        {reportArchive.length > 0 ? (
          <>
            <h2 className="mt-3 font-serif text-4xl font-black text-[#f5f5f0]">
              {reportArchive.length} shift report{reportArchive.length !== 1 ? 's' : ''} archived. {reportSignals > 0 ? `${reportSignals} flagged urgent items or complaints.` : 'No urgent signals on record.'}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">Report intelligence grows with every submitted End Of Day. Patterns will surface as the archive builds.</p>
          </>
        ) : (
          <>
            <h2 className="mt-3 font-serif text-4xl font-black text-[#f5f5f0]">No report data yet.</h2>
            <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">Submit End Of Day reports consistently to build your owner report intelligence. No scores are computed until data exists.</p>
          </>
        )}
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><Label>Owner Actions Required</Label><List items={['Review pending budget approvals.', 'Review any EOD urgent items flagged by managers.', 'Approve pending event enquiries in the event pipeline.', 'Check operational requests inbox for escalated items.']} /></Card>
        <Card><Label>Operational Signals</Label><List items={reportArchive.length > 0 ? [
          `${reportArchive.length} End Of Day report${reportArchive.length !== 1 ? 's' : ''} archived.`,
          eventPlans.length > 0 ? `${eventPlans.length} event plan${eventPlans.length !== 1 ? 's' : ''} in pipeline.` : 'No event plans saved yet.',
          reportSignals > 0 ? `${reportSignals} report${reportSignals !== 1 ? 's' : ''} flagged urgent items or complaints.` : 'No urgent signals on record.',
          totalEventProfit > 0 ? `${formatMoney(totalEventProfit)} projected event profit in pipeline.` : 'No event profit data yet.'
        ] : ['No operational signals yet.', 'Submit End Of Day reports to start building your signal history.', 'Save events in the Event CRM to track pipeline revenue.', 'All figures will be derived from real venue activity.']} /></Card>
      </div>
      <OwnerValueLedger totalEventProfit={totalEventProfit} reportSignals={reportSignals} eventPlans={eventPlans} reportArchive={reportArchive} />
      <Card className="mt-4 border-[#c9a96e]/20">
        <Label>Latest Submitted End Of Day Report</Label>
        {latestReport ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ReportFact label="Shift Date" value={latestReport.shift_date} />
            <ReportFact label="Manager" value={latestReport.manager_name || 'Manager'} />
            <ReportFact label="Shift Summary" value={latestReport.shift_summary || 'No summary entered'} />
            <ReportFact label="Urgent Items" value={latestReport.urgent_items || 'No urgent items entered'} />
          </div>
        ) : (
          <p className="text-sm leading-7 text-[#e8dcc0]">No successful End Of Day submissions have been archived in this browser yet.</p>
        )}
      </Card>
      <Card className="mt-4 border-[#c9a96e]/20">
        <Label>Latest Saved Event Orchestrator Report</Label>
        {latestEvent ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ReportFact label="Event Plan" value={latestEvent.name} />
            <ReportFact label="Projected Revenue" value={formatMoney(latestEvent.projected_revenue || latestEvent.calculations?.revenue || 0)} />
            <ReportFact label="Projected Profit" value={formatMoney(latestEvent.projected_profit || latestEvent.calculations?.grossProfit || 0)} />
            <ReportFact label="Projected Margin" value={`${Number(latestEvent.projected_margin || latestEvent.calculations?.margin || 0).toFixed(1)}%`} />
          </div>
        ) : (
          <p className="text-sm leading-7 text-[#e8dcc0]">No saved Event Orchestrator plans yet.</p>
        )}
      </Card>
    </>
  )
}
