import React, { useState, useMemo } from 'react'
import { cx } from '../../utils/format'
import { STAFF } from '../../data/staff'
import { Header, Label, Card, Metric, Progress } from '../../components/AppPrimitives'

export default function StaffReadiness({ t }) {
  const [serviceContext, setServiceContext] = useState('standard')
  const avgProgress = Math.round(STAFF.reduce((sum, item) => sum + item.progress, 0) / STAFF.length)
  const avgSimulation = Math.round(STAFF.reduce((sum, item) => sum + item.simulation, 0) / STAFF.length)
  const coachingCount = STAFF.filter(item => item.status === 'Needs Coaching' || item.status === 'At Risk').length

  const serviceRequirements = {
    standard: { label: 'Standard Shift', minSim: 70, weight: 'Balanced' },
    highVolume: { label: 'High Volume / Peak', minSim: 80, weight: 'Efficiency' },
    vipEvent: { label: 'VIP / Fine Dining', minSim: 85, weight: 'Recovery & Language' }
  }

  const deploymentMetrics = useMemo(() => {
    const req = serviceRequirements[serviceContext]
    const readyStaff = STAFF.filter(s => s.simulation >= req.minSim).length
    const teamScore = Math.round((readyStaff / STAFF.length) * 100)
    return { readyStaff, teamScore, req }
  }, [serviceContext])

  const statusClass = {
    Certified: 'border-emerald-800/50 bg-emerald-950/25 text-emerald-200',
    Active: 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]',
    'Needs Coaching': 'border-amber-800/50 bg-amber-950/25 text-amber-200',
    'At Risk': 'border-red-800/50 bg-red-950/25 text-red-200'
  }

  return (
    <>
      <Header eyebrow={t.pages.staffReadiness} title="Team Deployment Optimizer" body="Move beyond tracking progress. Optimize your floor plan based on actual simulation scores and tonight's service requirements." />

      <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_350px]">
        <Card className="border-[#c9a96e]/20 bg-[#1a1a1a]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Label>Tonight's Service Context</Label>
              <div className="flex gap-2">
                {Object.entries(serviceRequirements).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setServiceContext(key)}
                    className={cx(
                      'rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition',
                      serviceContext === key ? 'border-[#c9a96e] bg-[#c9a96e] text-[#0d0c09]' : 'border-[#6b705c]/30 text-[#e8dcc0] hover:border-[#c9a96e]/50'
                    )}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#6b705c]/30 p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0] mb-2">Team Readiness Score</div>
              <div className={cx('font-serif text-5xl font-black', deploymentMetrics.teamScore > 80 ? 'text-emerald-400' : 'text-[#c9a96e]')}>
                {deploymentMetrics.teamScore}%
              </div>
              <p className="mt-2 text-xs text-[#e8dcc0]">Based on {deploymentMetrics.req.minSim}% simulation threshold</p>
            </div>
            <div className="rounded-2xl border border-[#6b705c]/30 p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0] mb-2">Deployment Strategy</div>
              <div className="text-lg font-bold text-[#f5f5f0]">{deploymentMetrics.readyStaff} of {STAFF.length} staff cleared</div>
              <p className="mt-2 text-xs text-[#e8dcc0]">Critical focus: {deploymentMetrics.req.weight}</p>
            </div>
          </div>
        </Card>
        <Card className="border-[#c9a96e]/20">
          <Label>AI Allocation Guidance</Label>
          <p className="text-sm leading-7 text-[#e8dcc0]">
            {deploymentMetrics.teamScore < 70
              ? "Warning: Team technical depth is insufficient for this service level. Assign Noa B. to the primary VIP zone and mandate a 10-minute briefing for Dana and Oren."
              : "Team is healthy for standard operations. Leverage Yoav S. as shift lead for secondary zones."}
          </p>
        </Card>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Avg Training" value={`${avgProgress}%`} sub="Across active staff" />
        <Metric label="Avg Simulation" value={`${avgSimulation}%`} sub="Target: 85%" />
        <Metric label="Certified" value={String(STAFF.filter(item => item.status === 'Certified').length)} sub={`${STAFF.length} staff tracked`} />
        <Metric label="Coaching Required" value={String(coachingCount)} sub="Manager attention" />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#e8dcc0]">
                <th className="border-b border-[#6b705c]/30 p-3">Staff Member</th>
                <th className="border-b border-[#6b705c]/30 p-3">Academy</th>
                <th className="border-b border-[#6b705c]/30 p-3">Simulation</th>
                <th className="border-b border-[#6b705c]/30 p-3">Strongest Area</th>
                <th className="border-b border-[#6b705c]/30 p-3">Needs Work</th>
                <th className="border-b border-[#6b705c]/30 p-3">Status</th>
                <th className="border-b border-[#6b705c]/30 p-3">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {STAFF.map(item => (
                <tr key={item.name} className="text-sm transition hover:bg-[#6b705c]/10">
                  <td className="border-b border-[#6b705c]/30 p-3">
                    <div className="font-black text-[#f5f5f0]">{item.name}</div>
                    <div className="text-xs text-[#e8dcc0]">{item.role}</div>
                  </td>
                  <td className="border-b border-[#6b705c]/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="min-w-[90px] flex-1"><Progress value={item.progress} label={item.name} /></div>
                      <span className="w-9 text-xs font-black text-[#e8dcc0]">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="border-b border-[#6b705c]/30 p-3">
                    <span className={cx('font-black', item.simulation >= 80 ? 'text-emerald-400' : item.simulation >= 65 ? 'text-[#c9a96e]' : 'text-red-400')}>{item.simulation}%</span>
                  </td>
                  <td className="border-b border-[#6b705c]/30 p-3 text-xs text-[#e8dcc0]">{item.strong}</td>
                  <td className="border-b border-[#6b705c]/30 p-3 text-xs text-[#e8dcc0]">{item.weak}</td>
                  <td className="border-b border-[#6b705c]/30 p-3"><span className={cx('rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]', statusClass[item.status])}>{item.status}</span></td>
                  <td className="border-b border-[#6b705c]/30 p-3 text-xs leading-5 text-[#e8dcc0]">{item.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="mt-5 border-amber-900/40 bg-amber-950/10">
        <Label>Highest Leverage Coaching Move</Label>
        <p className="text-sm leading-7 text-[#e8dcc0]">Do not wait for a guest complaint to discover readiness risk. Dana and Oren should complete one recovery simulation before the weekend, then be paired with Noa for live language calibration.</p>
      </Card>
    </>
  )
}
