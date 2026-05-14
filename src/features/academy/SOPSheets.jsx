import React, { useState } from 'react'
import { cx } from '../../utils/format'
import { Card, Label, Header } from '../../components/AppPrimitives'
import { SOP_SHEETS } from '../../data/courses'

export default function SOPSheets({ t }) {
  const [activeId, setActiveId] = useState(SOP_SHEETS[0].id)
  const active = SOP_SHEETS.find(item => item.id === activeId) || SOP_SHEETS[0]

  return (
    <>
      <Header eyebrow={t.pages.sopSheets} title="Service Standard Operating Procedures" body="Fast, precise SOP sheets for the moments that create or destroy guest trust." />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          {SOP_SHEETS.map(sheet => (
            <button key={sheet.id} type="button" onClick={() => setActiveId(sheet.id)} className={cx('w-full rounded-2xl border p-4 text-left transition', activeId === sheet.id ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 bg-[#1a1a1a] text-[#e8dcc0] hover:border-[#c9a96e]/40 hover:text-[#c9a96e]')}>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{sheet.code}</div>
              <div className="mt-1 text-sm font-black leading-5">{sheet.title}</div>
              <div className="mt-1 text-xs text-[#e8dcc0]">{sheet.category}</div>
            </button>
          ))}
        </div>
        <div className="space-y-5">
          <Card className="border-[#c9a96e]/20">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{active.code} - {active.category}</div>
                <h2 className="mt-2 font-serif text-4xl font-black text-[#f5f5f0]">{active.title}</h2>
              </div>
              <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]">{active.standard}</span>
            </div>
            <div className="space-y-3">
              {active.steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                  <span className="w-8 shrink-0 font-serif text-2xl font-black text-[#c9a96e]">{index + 1}</span>
                  <p className="text-sm leading-7 text-[#e8dcc0]">{step}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-[#c9a96e]/15 bg-[#1a1a1a]">
            <Label>Manager Note</Label>
            <p className="text-sm leading-7 text-[#e8dcc0]">{active.managerNote}</p>
          </Card>
        </div>
      </div>
    </>
  )
}
