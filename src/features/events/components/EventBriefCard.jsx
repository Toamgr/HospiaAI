import React from 'react'
import { Card, Label } from '../../../components/AppPrimitives'
import { EVENT_BRIEF } from '../data/eventBrainDemoData'

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-[#6b705c]/15 py-2 last:border-0">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#e8dcc0] opacity-50">{label}</span>
      <span className="text-[11px] font-medium text-[#f5f5f0]">{value}</span>
    </div>
  )
}

export default function EventBriefCard() {
  const b = EVENT_BRIEF
  return (
    <Card>
      <Label>Event Brief</Label>
      <div className="mb-3 font-serif text-base font-black tracking-tight text-[#f5f5f0]">
        {b.title}
      </div>
      <div>
        <Row label="Date" value={b.date} />
        <Row label="Guests" value={b.totalGuests} />
        <Row label="Budget / pax" value={`${b.currency}${b.budgetPerPerson}`} />
        <Row label="Service" value={b.serviceStyle} />
        <Row label="Bar" value={b.barType} />
        <Row label="Format" value={b.format} />
        <Row label="Style" value={b.style} />
      </div>
      <div className="mt-4 rounded-xl border border-[#6b705c]/15 bg-[#1a1a1a] p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#e8dcc0] opacity-50">Dietary</div>
        <p className="mt-1 text-[11px] text-[#e8dcc0] opacity-70">{b.dietary.join(' · ')}</p>
      </div>
      <div className="mt-2 rounded-xl border border-[#6b705c]/15 p-3">
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c9a96e] opacity-70">Special Requests</div>
        <p className="mt-1 text-[11px] font-light italic leading-relaxed text-[#e8dcc0] opacity-80">
          "{b.specialRequests}"
        </p>
      </div>
      <div className="mt-3">
        <div className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#c9a96e] opacity-60">
          Accessibility & Guest Care
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-[#4F6B4A]/40 bg-[#4F6B4A]/10 px-2 py-0.5 text-[9px] font-black text-[#4F6B4A]">
            ♿ {b.accessibility.wheelchairs} wheelchairs
          </span>
          <span className="rounded-full border border-[#4F6B4A]/40 bg-[#4F6B4A]/10 px-2 py-0.5 text-[9px] font-black text-[#4F6B4A]">
            · {b.accessibility.babyChairs} baby chairs
          </span>
          <span className="rounded-full border border-[#6b705c]/25 px-2 py-0.5 text-[9px] text-[#e8dcc0] opacity-55">
            {b.accessibility.elderly} elderly
          </span>
          <span className="rounded-full border border-[#4F6B4A]/40 bg-[#4F6B4A]/10 px-2 py-0.5 text-[9px] font-black text-[#4F6B4A]">
            ↔ Step-free
          </span>
          <span className="rounded-full border border-[#6b705c]/25 px-2 py-0.5 text-[9px] text-[#e8dcc0] opacity-55">
            Quiet family zone
          </span>
        </div>
      </div>
    </Card>
  )
}
