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
    { label: 'Recoverable service leakage', value: 'NIS 12.9k', detail: 'Current modeled monthly opportunity' },
    { label: 'Training risk under management', value: '2 staff', detail: 'At Risk / Needs Coaching status' }
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
        <h2 className="mt-3 font-serif text-4xl font-black text-[#f5f5f0]">Hospitality Score: 87/100. Recoverable value this month: NIS 12.9k.</h2>
        <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">Performance improved in farewell and first impression. Drag remains in upselling and delay communication.</p>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><Label>Owner Actions Required</Label><List items={['Approve recovery-first compensation policy.', 'Review Dana P. readiness plan.', 'Confirm beverage upsell training mandate.', 'Review Friday delay pattern with management.']} /></Card>
        <Card><Label>Commercial Signals</Label><List items={['NIS 27.1k monthly leakage detected.', 'NIS 42.6k protected revenue tracked.', '7-shift reporting streak reached.', 'Two staff members create elevated weekend risk.']} /></Card>
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
