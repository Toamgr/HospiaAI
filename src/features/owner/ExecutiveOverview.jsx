import React from 'react'
import { formatMoney } from '../../utils/format'
import { Card, Label, Header, Metric, List } from '../../components/AppPrimitives'

export default function ExecutiveOverview({ t, reportArchive = [], eventPlans = [] }) {
  const latestReport = reportArchive[0]
  const latestEvent = eventPlans[0]

  return (
    <>
      <Header eyebrow={t.areas.ownerIntelligence} title="Executive Overview" body="Owner-grade business intelligence: profit exposure, readiness risk, and the highest leverage decisions for this week." />
      <Card className="mb-6 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.18),transparent_35%),linear-gradient(135deg,#191812,#11100d)] p-7">
        <div className="max-w-4xl">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c9a96e]">Weekly Command Summary</div>
          <h2 className="mt-3 font-serif text-4xl font-black tracking-tight text-[#f5f5f0]">HESTIA identified NIS 27.1k in monthly leakage and NIS 12.9k recoverable within 30 days.</h2>
          <p className="mt-4 text-sm leading-8 text-[#e8dcc0]">The strongest drivers are compensation before recovery, missed beverage upsells, and unmanaged kitchen delays. The next move is not more data - it is manager execution.</p>
        </div>
      </Card>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Monthly Leakage" value="NIS 27.1k" sub="Identified" />
        <Metric label="Recoverable Now" value="NIS 12.9k" sub="30-day target" />
        <Metric label="Hospitality Score" value="87" sub="+4 this week" />
        <Metric label="EOD Archive" value={String(reportArchive.length)} sub={latestReport ? `Latest: ${latestReport.shift_date}` : 'No reports yet'} />
        <Metric label="Saved Events" value={String(eventPlans.length)} sub={latestEvent ? formatMoney(latestEvent.projected_profit || 0) : 'No event plans yet'} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><Label>Top Owner Priorities</Label><List items={['Enforce recovery-first compensation policy.', 'Mandate beverage recommendation training for floor and bar.', 'Resolve Dana P. readiness risk before weekend.', 'Review Friday delay pattern with manager and kitchen lead.']} /></Card>
        <Card><Label>{latestReport ? 'Latest End Of Day Signal' : t.copy.aiRecommendations}</Label><List items={latestReport ? [
          latestReport.shift_summary || 'No shift summary entered.',
          latestReport.complaints ? `Complaints: ${latestReport.complaints}` : 'No complaint detail entered.',
          latestReport.urgent_items ? `Urgent: ${latestReport.urgent_items}` : 'No urgent owner items entered.'
        ] : ['Treat service recovery as financial governance, not soft skills.', 'Use End Of Day consistency to build a defensible business memory layer.', 'Convert Knowledge Library usage into staff readiness signals in production.']} /></Card>
      </div>
    </>
  )
}
