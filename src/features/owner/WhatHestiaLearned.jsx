import { useState, useEffect } from 'react'
import { Card } from '../../components/AppPrimitives'
import { fetchOwnerIntelligence } from '../../services/api/venueBridgeApi'

// "What HESTIA Learned" — Phase 6 Owner Intelligence.
// A senior-advisor narrative built from Venue DNA, bridge briefs, operational
// signals + enrichment, and capability context. Not a dashboard, not KPIs.
// Renders nothing until there is something real to say — so the owner never sees
// an empty intelligence panel.

const TONE_STYLE = {
  gain:        { dot: 'bg-[#6BAF80]',  label: 'Gain' },
  watch:       { dot: 'bg-[#D4943A]',  label: 'Watch' },
  concern:     { dot: 'bg-[#C07070]',  label: 'Concern' },
  gap:         { dot: 'bg-[#8B7355]',  label: 'Gap' },
  opportunity: { dot: 'bg-[#c9a96e]',  label: 'Opportunity' }
}

export default function WhatHestiaLearned() {
  const [data, setData] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchOwnerIntelligence()
      .then(res => { if (!cancelled) setData(res) })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [])

  if (!loaded || !data?.active || !data.learnings?.length) return null

  return (
    <Card className="mb-6 border-[#c9a96e]/25 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.08),transparent_42%),#0f0f0e]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e]/70">What HESTIA Learned</div>
        <span className="rounded-full border border-[#c9a96e]/25 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]/45">
          Venue Intelligence
        </span>
      </div>

      {data.headline && (
        <p className="mb-5 max-w-3xl text-base font-bold leading-7 text-[#f5f5f0]">{data.headline}</p>
      )}

      <ol className="space-y-3">
        {data.learnings.map((l, i) => {
          const tone = TONE_STYLE[l.tone] || TONE_STYLE.watch
          return (
            <li key={i} className="flex gap-3 rounded-2xl border border-[#6b705c]/15 bg-[#14130f] px-4 py-3">
              <span className="mt-1 font-mono text-xs text-[#c9a96e]/60">{i + 1}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black text-[#f5f5f0]">{l.headline}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6b705c]/20 px-2 py-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-[#e8dcc0]/45">{tone.label}</span>
                  </span>
                </div>
                <p className="mt-1 text-xs leading-6 text-[#e8dcc0]/65">{l.detail}</p>
                <div className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#6b705c]">{l.source}</div>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="mt-4 text-[10px] text-[#e8dcc0]/25">
        Drawn from Venue Learning, the Venue Intelligence Bridge, and your live operations. No estimates or invented figures.
      </p>
    </Card>
  )
}
