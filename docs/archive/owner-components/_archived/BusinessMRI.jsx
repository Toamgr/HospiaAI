// ARCHIVED — pre-seed scope reduction. Restore in Phase 2.
import React from 'react'
import { cx } from '../../../utils/format'
import { Card, Label, Header } from '../../../components/AppPrimitives'

export default function BusinessMRI({ t }) {
  const dimensions = [
    ['First Impression', 84, 'good'],
    ['Delay Communication', 61, 'warning'],
    ['Complaint Recovery', 67, 'warning'],
    ['Natural Upselling', 52, 'critical'],
    ['Farewell And Return Intent', 91, 'good'],
    ['Staff Readiness', 74, 'warning'],
    ['Beverage Service', 83, 'good']
  ]
  const score = Math.round(dimensions.reduce((sum, item) => sum + item[1], 0) / dimensions.length)
  const colors = { good: 'bg-emerald-500 text-emerald-300', warning: 'bg-amber-500 text-amber-300', critical: 'bg-red-500 text-red-300' }

  return (
    <>
      <Header eyebrow={t.pages.businessMRI} title="Business MRI" body="A diagnostic scan of the service dimensions that influence revenue, guest trust, and management focus." />
      <Card className="mb-6 border-[#c9a96e]/20 bg-[#1a1a1a]">
        <div className="flex flex-wrap items-center gap-6">
          <div><div className="font-serif text-7xl font-black text-[#c9a96e]">{score}</div><div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">Overall MRI Score</div></div>
          <p className="max-w-2xl font-serif text-2xl leading-10 text-[#f5f5f0]">Two weak points are currently dragging operational value: Natural Upselling and Delay Communication.</p>
        </div>
      </Card>
      <Card>
        <Label>Dimension Scan</Label>
        <div className="space-y-4">
          {dimensions.map(([label, value, status]) => (
            <div key={label} className="grid gap-3 sm:grid-cols-[220px_1fr_60px] sm:items-center">
              <div className="text-sm font-bold text-[#e8dcc0]">{label}</div>
              <div className="h-2 overflow-hidden rounded-full bg-[#6b705c]/30"><div className={cx('h-full rounded-full', colors[status].split(' ')[0])} style={{ width: `${value}%` }} /></div>
              <div className={cx('text-sm font-black sm:text-right', colors[status].split(' ')[1])}>{value}%</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
