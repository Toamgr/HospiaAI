import React from 'react'
import { Header, Card } from '../../components/AppPrimitives'

// Staff Readiness is hidden from navigation (hiddenInNav: true in navigationConfig).
// The simulation score data required to power this page does not yet exist in the
// data model — scores must come from real assessment results, not seeded values.
// This placeholder replaces the previous version that displayed demo staff names
// (Noa B., Dana P., Oren L., Yoav S.) and hardcoded simulation scores as real data.

export default function StaffReadiness({ t }) {
  return (
    <>
      <Header
        eyebrow="Staff"
        title="Team Deployment Optimizer"
        body="Optimize your floor plan based on simulation scores and tonight's service requirements."
      />
      <Card>
        <div className="py-14 text-center">
          <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/[0.05] mb-4">◎</div>
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c9a96e] mb-4">
            Not Yet Active
          </div>
          <p className="text-sm font-bold text-[#e8dcc0]/55 mb-3">
            Deployment optimization requires real simulation scores.
          </p>
          <p className="mx-auto max-w-sm text-xs leading-6 text-[#e8dcc0]/30">
            HESTIA will surface readiness scores and deployment recommendations once staff complete real simulation sessions and scores are recorded. No data is displayed until it is earned.
          </p>
        </div>
      </Card>
    </>
  )
}
