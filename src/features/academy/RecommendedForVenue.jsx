import { useState, useEffect } from 'react'
import { Card, Label } from '../../components/AppPrimitives'
import { fetchAcademyContext } from '../../services/api/venueBridgeApi'

// "Recommended For Your Venue" — additive Academy panel driven by Venue Intelligence.
// Shows venue-level capability signals and a prioritized learning order built from
// the EXISTING academies. Renders nothing when there is no venue signal yet, so the
// standard Academy view is unchanged for venues that haven't done Venue Learning.

const STATUS_STYLE = {
  gap:        { label: 'Gap',        cls: 'border-[#8B3A3A]/40 bg-[#8B3A3A]/10 text-[#C07070]' },
  developing: { label: 'Developing', cls: 'border-[#C17F2A]/40 bg-[#C17F2A]/10 text-[#D4943A]' },
  solid:      { label: 'Solid',      cls: 'border-[#4A7C59]/40 bg-[#4A7C59]/10 text-[#6BAF80]' },
  unknown:    { label: 'Unrated',    cls: 'border-[#6b705c]/30 bg-[#6b705c]/10 text-[#9A9590]' }
}

function CapabilityChip({ signal }) {
  const s = STATUS_STYLE[signal.status] || STATUS_STYLE.unknown
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${s.cls}`}>
      {signal.label}
      <span className="opacity-60">· {s.label}</span>
    </span>
  )
}

export default function RecommendedForVenue({ onOpenLesson }) {
  const [ctx, setCtx] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchAcademyContext()
      .then(res => { if (!cancelled) setCtx(res) })
      .catch(() => { if (!cancelled) setCtx(null) })
      .finally(() => { if (!cancelled) setLoaded(true) })
    return () => { cancelled = true }
  }, [])

  // Fallback: nothing renders until there is real venue capability signal.
  if (!loaded || !ctx?.active || !ctx.recommendations?.length) return null

  return (
    <Card className="mb-6 border-[#c9a96e]/25 bg-[radial-gradient(circle_at_top_left,rgba(201,169,110,0.07),transparent_40%),#0f0f0e]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Label>Recommended For Your Venue</Label>
          <p className="mt-1 max-w-2xl text-sm leading-7 text-[#e8dcc0]">
            Drawn from your Venue Intelligence — the capabilities your venue should build next, in order.
          </p>
        </div>
        <span className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a96e]/80">
          Venue-aware
        </span>
      </div>

      {/* Prioritized learning order — existing academies only */}
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {ctx.recommendations.map(rec => (
          <button
            key={rec.priority}
            type="button"
            disabled={!rec.lessonId}
            onClick={() => rec.lessonId && onOpenLesson?.(rec.academyId, rec.lessonId)}
            className="group flex items-start gap-3 rounded-2xl border border-[#6b705c]/25 bg-[#14130f] p-4 text-left transition hover:border-[#c9a96e]/45 disabled:cursor-default disabled:opacity-70"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c9a96e]/30 font-mono text-xs text-[#c9a96e]">
              {rec.priority}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black text-[#f5f5f0]">{rec.area}</span>
              <span className="mt-0.5 block text-[11px] leading-5 text-[#e8dcc0]/55 line-clamp-2">{rec.reason}</span>
              <span className="mt-1.5 block text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a96e]/70 group-hover:text-[#c9a96e]">
                {rec.academyTitle}{rec.lessonId ? ' · Open Academy' : ''}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Venue capability signals (venue-level, not employee scores) */}
      {ctx.capabilitySignals?.length > 0 && (
        <div className="mt-5 border-t border-[#6b705c]/15 pt-4">
          <div className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#6b705c]">Venue capability signals</div>
          <div className="flex flex-wrap gap-2">
            {ctx.capabilitySignals.map(sig => <CapabilityChip key={sig.key} signal={sig} />)}
          </div>
          <p className="mt-2 text-[10px] text-[#e8dcc0]/25">
            Venue-level indicators derived from Venue Intelligence — not individual employee scores.
          </p>
        </div>
      )}
    </Card>
  )
}
