// ARCHIVED — pre-seed scope reduction. Restore in Phase 2.
import React, { useState } from 'react'
import { cx, formatMoney } from '../../../utils/format'
import { Card, Label, Header, Metric } from '../../../components/AppPrimitives'
import { PROFIT_LEAKS } from '../../../data/businessMemory'

export default function ProfitLeaks({ t }) {
  const [leakFixRate, setLeakFixRate] = useState(30)
  const total = PROFIT_LEAKS.reduce((sum, leak) => sum + (leak.monthly ?? 0), 0)
  const projectedRecovery = Math.round(total * (leakFixRate / 100))

  const riskClass = { high: 'border-red-800/50 bg-red-950/25 text-red-200', medium: 'border-amber-800/50 bg-amber-950/25 text-amber-200', low: 'border-[#6b705c]/50 bg-[#6b705c]/25 text-[#e8dcc0]' }

  return (
    <>
      <Header eyebrow={t.pages.profitLeaks} title="Profit Leak Intelligence" body="Revenue leaving the building through preventable execution failures. Use the calculator below to model your recovery ROI." />

      <section className="mb-12">
        <Card className="bg-gradient-to-br from-[#1c1b17] to-[#0a0a08] border-[#c9a96e]/30">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] items-center">
            <div>
              <Label>Leak Recovery Modeling</Label>
              <h2 className="font-serif text-4xl font-black text-[#f5f5f0] mb-6">
                If we improve execution by <span className="text-[#c9a96e]">{leakFixRate}%</span>...
              </h2>
              <input
                type="range"
                min="5"
                max="100"
                value={leakFixRate}
                onChange={(e) => setLeakFixRate(e.target.value)}
                className="w-full h-2 bg-[#6b705c]/30 rounded-lg appearance-none cursor-pointer accent-[#c9a96e]"
              />
              <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]">
                <span>Incremental Fix</span>
                <span>Full Transformation</span>
              </div>
            </div>
            <div className="text-center p-6 rounded-3xl bg-[#c9a96e]/10 border border-[#c9a96e]/20">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">Est. Monthly Recovery</div>
              <div className="font-serif text-5xl font-black text-[#f5f5f0]">{total > 0 ? `NIS ${projectedRecovery.toLocaleString()}` : '—'}</div>
              <div className="mt-2 text-xs text-[#e8dcc0]">{total > 0 ? `NIS ${(projectedRecovery * 12).toLocaleString()} / year` : 'No data — connect real venue data'}</div>
            </div>
          </div>
        </Card>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Total Monthly Leakage" value={total > 0 ? `NIS ${total.toLocaleString()}` : '—'} sub="Detected exposure" />
        <Metric label="Recoverable In 30 Days" value="—" sub="Connect real venue data" />
        <Metric label="High Risk Leaks" value={String(PROFIT_LEAKS.filter(leak => leak.risk === 'high').length)} sub="Immediate action" />
      </div>
      <div className="space-y-4">
        {PROFIT_LEAKS.map(leak => (
          <Card key={leak.category} className={cx('border-l-4', leak.risk === 'high' ? 'border-l-red-700' : leak.risk === 'medium' ? 'border-l-amber-700' : 'border-l-[#6b705c]')}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
              <span className={cx('rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]', riskClass[leak.risk])}>{leak.risk} risk - {leak.trend}</span>
              <div className="text-right">
                <div className="font-serif text-3xl font-black text-[#c9a96e]">{leak.monthly != null ? `NIS ${leak.monthly.toLocaleString()}/mo` : '—'}</div>
                <div className="text-xs text-[#e8dcc0]">{leak.weekly != null ? `NIS ${leak.weekly.toLocaleString()}/week` : '—'}</div>
              </div>
            </div>
            <h2 className="font-serif text-2xl font-black text-[#f5f5f0]">{leak.category}</h2>
            <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">{leak.note}</p>
          </Card>
        ))}
      </div>
    </>
  )
}
