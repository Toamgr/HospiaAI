import React, { useMemo } from 'react'
import { Card, Label } from '../../../components/AppPrimitives'
import { EVENT_BRIEF } from '../data/eventBrainDemoData'
import {
  calculateStaff,
  calculateFood,
  calculateBeverage,
  calculateBudget,
  formatCurrency
} from '../utils/eventBrainCalculations'

function MiniStat({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[#6b705c]/15 bg-[#1a1a1a] px-2 py-1.5">
      <span className="text-[9px] text-[#e8dcc0] opacity-50">{label}</span>
      <span className="text-[10px] font-black text-[#f5f5f0]">{value}</span>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <div className="mb-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#c9a96e] opacity-60">
        {label}
      </div>
      <div className="grid grid-cols-2 gap-1">{children}</div>
    </div>
  )
}

export default function PlanningSummary() {
  const b = EVENT_BRIEF
  const staff = useMemo(
    () => calculateStaff(b.totalGuests, b.barType, b.format, b.accessibility),
    []
  )
  const food = useMemo(() => calculateFood(b.totalGuests), [])
  const bev = useMemo(() => calculateBeverage(b.totalGuests), [])
  const budget = useMemo(() => calculateBudget(b.totalGuests, b.budgetPerPerson), [])

  return (
    <Card>
      <Label>AI Planning Summary</Label>
      <div className="mb-4 font-serif text-sm font-black tracking-tight text-[#f5f5f0]">
        Resort Operations Plan
      </div>
      <div className="space-y-4">
        <Section label={`Staff · ${staff.total} total`}>
          <MiniStat label="Event Mgr" value={staff.eventManager} />
          <MiniStat label="Waiters" value={staff.waiters} />
          <MiniStat label="Bartenders" value={staff.bartenders} />
          <MiniStat label="Kitchen" value={staff.kitchen} />
          <MiniStat label="Access. Host" value={staff.accessHost} />
          <MiniStat label="Concierge" value={staff.concierge} />
        </Section>
        <Section label="Food (chef-led)">
          <MiniStat label="Tasting" value={`${food.tastings} pc`} />
          <MiniStat label="Main" value={`${food.mainKg} kg`} />
          <MiniStat label="Sides" value={`${food.sidesKg} kg`} />
          <MiniStat label="Dessert" value={`${food.dessertKg} kg`} />
        </Section>
        <Section label="Beverage">
          <MiniStat label="Wine" value={`${bev.wineBottles} btl`} />
          <MiniStat label="Beer" value={bev.beerCans} />
          <MiniStat label="Soft" value={`${bev.softLitres} L`} />
          <MiniStat label="Ice" value={`${bev.iceKg} kg`} />
        </Section>
        <div>
          <div className="mb-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-[#c9a96e] opacity-60">
            Budget Split
          </div>
          <div className="space-y-1">
            {[
              ['Food 45%', formatCurrency(budget.food, b.currency)],
              ['Beverage 25%', formatCurrency(budget.beverage, b.currency)],
              ['Staff 20%', formatCurrency(budget.staff, b.currency)],
              ['Equipment 10%', formatCurrency(budget.equipment, b.currency)]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between text-[10px]">
                <span className="text-[#e8dcc0] opacity-50">{label}</span>
                <span className="font-black text-[#f5f5f0]">{value}</span>
              </div>
            ))}
            <div className="mt-1.5 flex items-center justify-between border-t border-[#6b705c]/20 pt-1.5 text-[11px]">
              <span className="font-black text-[#c9a96e] opacity-70">Total</span>
              <span className="font-black text-[#c9a96e]">
                {formatCurrency(budget.total, b.currency)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
