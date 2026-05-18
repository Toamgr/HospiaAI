import React from 'react'
import { Card, Label } from '../../../components/AppPrimitives'
import { BAR_PROGRAMME } from '../data/eventBrainDemoData'

export default function BarProgramme() {
  return (
    <Card>
      <Label>Bar Programme</Label>
      <div className="mb-4 font-serif text-sm font-black tracking-tight text-[#f5f5f0]">
        Signature List
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <div className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#c9a96e] opacity-70">
            Cocktails
          </div>
          <ul className="space-y-1.5">
            {BAR_PROGRAMME.cocktails.map(name => (
              <li key={name} className="text-[11px] text-[#e8dcc0] opacity-75">{name}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#e8dcc0] opacity-45">
            Mocktails
          </div>
          <ul className="space-y-1.5">
            {BAR_PROGRAMME.mocktails.map(name => (
              <li key={name} className="text-[11px] text-[#e8dcc0] opacity-75">{name}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-[#6b705c]/15 bg-[#1a1a1a] p-3">
        <div className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#c9a96e] opacity-60">
          Bar Locations
        </div>
        <div className="space-y-1.5">
          {[
            ['Main Bar', 'Full programme'],
            ['Garden / Pool Bar', 'Cocktails + mocktails'],
            ['Late-Night Station', 'Bites + selected drinks']
          ].map(([loc, prog]) => (
            <div key={loc} className="flex items-center justify-between text-[10px]">
              <span className="text-[#e8dcc0] opacity-55">{loc}</span>
              <span className="font-medium text-[#f5f5f0]">{prog}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
