import React from 'react'
import { Card, Label } from '../../../components/AppPrimitives'

const INVESTOR_POINTS = [
  'One premium venue pilot can become a repeatable model',
  'High-end venues have expensive operational mistakes',
  'AI planning saves management time',
  'Resorts, hotels, venues and hospitality groups can adopt the same model'
]

const PILOT_POINTS = [
  'Faster event planning',
  'Better staff readiness',
  'Smarter accessibility planning',
  'Better F&B forecasting',
  'Stronger client-facing event simulation',
  'Operational confidence before event day',
  'Premium digital experience aligned with luxury venue brands'
]

export function InvestorValueCard() {
  return (
    <Card>
      <Label>Strategic Value</Label>
      <div className="mb-3 font-serif text-sm font-black tracking-tight text-[#f5f5f0]">
        Why Investors Care
      </div>
      <p className="mb-4 text-[11px] font-light leading-relaxed text-[#e8dcc0] opacity-70">
        Premium resort-style venues require coordination across layout, staffing, accessibility,
        F&B, chef kitchen timing, bar operations, guest care, and client expectations. HESTIA
        turns this complexity into a repeatable intelligent operations system.
      </p>
      <ul className="space-y-2">
        {INVESTOR_POINTS.map(point => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]" />
            <span className="text-[11px] text-[#e8dcc0] opacity-70">{point}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export function PilotValueCard() {
  return (
    <Card>
      <Label>For Kahi</Label>
      <div className="mb-3 font-serif text-sm font-black tracking-tight text-[#f5f5f0]">
        Pilot Value
      </div>
      <ul className="space-y-2">
        {PILOT_POINTS.map(point => (
          <li key={point} className="flex items-start gap-2">
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#4F6B4A]/80 text-[9px] font-bold text-white">
              ✓
            </span>
            <span className="text-[11px] text-[#e8dcc0] opacity-70">{point}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
