import React from 'react'
import { cx } from '../../utils/format'
import { Card, Header } from '../../components/AppPrimitives'

export default function StrategicRecommendations({ t }) {
  const recs = [
    ['7 days', 'Issue recovery-first script mandate', 'NIS 8.4k monthly comp exposure', 'Require a documented recovery attempt before any compensation.'],
    ['14 days', 'Run beverage upsell training for floor and bar', 'NIS 6.2k monthly recoverable', 'Use Knowledge Library and Natural Upselling course as the training path.'],
    ['This week', 'Address at-risk staff readiness', 'Training investment protection', 'Review Staff Progression for coaching flags and create targeted plans before norms decay.'],
    ['30 days', 'Adjust Friday kitchen and floor briefing', 'NIS 4.8k delay leak prevention', 'Move briefing earlier and monitor delay incidents over two weekends.']
  ]

  return (
    <>
      <Header eyebrow={t.pages.strategicRecommendations} title="Strategic Recommendations" body="Prioritized decisions that connect service execution to owner-level value." />
      <div className="space-y-4">
        {recs.map(([horizon, title, impact, detail], index) => (
          <Card key={title} className={cx('border-l-4', index === 0 ? 'border-l-red-700' : index === 1 ? 'border-l-amber-700' : 'border-l-[#c9a96e]')}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="font-serif text-5xl font-black leading-none text-[#6b705c]">0{index + 1}</span>
                <div>
                  <span className="rounded-full border border-[#6b705c]/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]">{horizon}</span>
                  <h2 className="mt-2 font-serif text-2xl font-black text-[#f5f5f0]">{title}</h2>
                </div>
              </div>
              <div className="text-right text-sm font-black text-[#c9a96e]">{impact}</div>
            </div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{detail}</p>
          </Card>
        ))}
      </div>
    </>
  )
}
