import React from 'react'
import { cx } from '../../utils/format'
import { Card, Header, Metric } from '../../components/AppPrimitives'
import { BUSINESS_MEMORY } from '../../data/businessMemory'

export default function BusinessMemoryPage({ t, reportArchive = [], businessMemory = BUSINESS_MEMORY }) {
  const hasBackendReportMemory = businessMemory.some(event => event.type === 'report' || event.title?.startsWith('End Of Day'))
  const reportEvents = hasBackendReportMemory ? [] : reportArchive.slice(0, 8).map(report => ({
    date: report.shift_date || report.submitted_at?.slice(0, 10) || 'Recent',
    type: 'report',
    title: `End Of Day submitted by ${report.manager_name || 'Manager'}`,
    detail: report.urgent_items || report.shift_summary || 'Shift report submitted successfully through EmailJS.'
  }))
  const normalizedMemory = businessMemory.map(event => ({
    date: event.date || event.event_date || event.created_at?.slice(0, 10) || 'Recent',
    type: event.type || 'note',
    title: event.title,
    detail: event.detail
  }))
  const memoryEvents = [...reportEvents, ...normalizedMemory]
  const style = {
    alert: 'border-red-900/40',
    win: 'border-emerald-900/40',
    note: 'border-[#6b705c]/30',
    report: 'border-[#c9a96e]/25',
    event: 'border-[#c9a96e]/30 bg-[#1a1a1a]'
  }

  return (
    <>
      <Header eyebrow={t.pages.businessMemory} title="Business Memory" body="A persistent record of operational events, wins, risks, and patterns. This is the layer that makes HESTIA more valuable every shift." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Memory Events" value={String(memoryEvents.length)} sub={`${reportArchive.length} archived reports`} />
        <Metric label="Recurring Pattern" value="Friday" sub="Delay pressure" />
        <Metric label="Open Human Risk" value="Dana P." sub="At Risk status" />
      </div>
      <div className="relative space-y-4 ps-6">
        <div className="absolute bottom-0 start-2 top-0 w-px bg-[#6b705c]/30" />
        {memoryEvents.map(event => (
          <article key={`${event.date}-${event.title}`} className="relative">
            <div className={cx('absolute -start-5 top-6 h-3 w-3 rounded-full border-2 border-[#0d0c09]', event.type === 'alert' ? 'bg-red-500' : event.type === 'win' ? 'bg-emerald-500' : 'bg-[#c9a96e]')} />
            <Card className={style[event.type] || style.note}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{event.type}</span>
                <span className="text-xs text-[#e8dcc0]">{event.date}</span>
              </div>
              <h2 className="font-serif text-xl font-black text-[#f5f5f0]">{event.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">{event.detail}</p>
            </Card>
          </article>
        ))}
      </div>
    </>
  )
}
