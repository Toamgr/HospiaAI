import React from 'react'
import { cx } from '../../utils/format'
import { Card, Header, Metric } from '../../components/AppPrimitives'
import { BUSINESS_MEMORY } from '../../data/businessMemory'

export default function BusinessMemoryPage({ t, reportArchive = [], businessMemory = BUSINESS_MEMORY }) {
  const hasBackendReportMemory = businessMemory.some(e => e.type === 'report' || e.title?.startsWith('End Of Day'))
  const reportEvents = hasBackendReportMemory ? [] : reportArchive.slice(0, 8).map(report => ({
    date: report.shift_date || report.submitted_at?.slice(0, 10) || 'Recent',
    type: 'report',
    title: `End Of Day submitted by ${report.manager_name || 'Manager'}`,
    detail: report.urgent_items || report.shift_summary || 'Shift report submitted successfully.'
  }))
  const normalizedMemory = businessMemory.map(e => ({
    date: e.date || e.event_date || e.created_at?.slice(0, 10) || 'Recent',
    type: e.type || 'note',
    title: e.title,
    detail: e.detail
  }))
  const memoryEvents = [...reportEvents, ...normalizedMemory]

  // Derive busiest shift day from real report archive (needs ≥2 data points)
  const dayFreq = {}
  reportArchive.forEach(r => {
    if (r.shift_date) {
      try {
        const day = new Date(r.shift_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
        dayFreq[day] = (dayFreq[day] || 0) + 1
      } catch {}
    }
  })
  const dayEntries = Object.entries(dayFreq).sort((a, b) => b[1] - a[1])
  const busiestDay = dayEntries.length >= 2 ? dayEntries[0][0] : null

  // Count real alert-type memory events
  const alertCount = businessMemory.filter(e => e.type === 'alert').length

  const style = {
    alert: 'border-red-900/40',
    win: 'border-emerald-900/40',
    note: 'border-[#6b705c]/30',
    report: 'border-[#c9a96e]/25',
    event: 'border-[#c9a96e]/30 bg-[#1a1a1a]'
  }

  return (
    <>
      <Header
        eyebrow={t.pages.businessMemory}
        title="Business Memory"
        body="A persistent record of operational events, wins, risks, and patterns. This is the layer that makes HESTIA more valuable every shift."
      />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric
          label="Memory Events"
          value={String(memoryEvents.length)}
          sub={`${reportArchive.length} archived reports`}
        />
        <Metric
          label="Busiest Shift Day"
          value={busiestDay ?? '—'}
          sub={busiestDay ? 'Most reported shift' : 'Needs more shift reports'}
        />
        <Metric
          label="Risk Events"
          value={alertCount > 0 ? String(alertCount) : 'None'}
          sub={alertCount > 0 ? 'Flagged alerts in memory' : 'No risks recorded yet'}
        />
      </div>

      {memoryEvents.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/[0.05] mb-4">◎</div>
            <p className="text-sm font-bold text-[#e8dcc0]/55 mb-3">No business memory yet.</p>
            <p className="mx-auto max-w-sm text-xs leading-6 text-[#e8dcc0]/30">
              HESTIA will record events here as shifts are closed out, incidents are logged, and operational patterns emerge from real data.
            </p>
          </div>
        </Card>
      ) : (
        <div className="relative space-y-4 ps-6">
          <div className="absolute bottom-0 start-2 top-0 w-px bg-[#6b705c]/30" />
          {memoryEvents.map(event => (
            <article key={`${event.date}-${event.title}`} className="relative">
              <div className={cx(
                'absolute -start-5 top-6 h-3 w-3 rounded-full border-2 border-[#0d0c09]',
                event.type === 'alert' ? 'bg-red-500' : event.type === 'win' ? 'bg-emerald-500' : 'bg-[#c9a96e]'
              )} />
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
      )}
    </>
  )
}
