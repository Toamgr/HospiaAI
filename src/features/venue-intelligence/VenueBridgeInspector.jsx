import { useState, useEffect, useCallback } from 'react'
import { fetchVenueBriefs, regenerateVenueBriefs } from '../../services/api/venueBridgeApi'

// Developer visibility for the Venue Intelligence Bridge. Read-only inspection of
// the specialist briefs derived from Venue DNA — not a specialist module itself,
// and not a redesign of any existing surface. Owner/Admin only (gated by routing).

const STATUS_STYLE = {
  ready:               { label: 'READY',        cls: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300' },
  insufficient_signal: { label: 'AWAITING DNA', cls: 'border-[#6b705c]/30 bg-[#1a1a1a] text-[#6b705c]' }
}

function ConfidenceBadge({ value }) {
  return (
    <span className="font-mono text-[10px] text-[#c9a96e]/80">{Math.round(value || 0)}%</span>
  )
}

function ItemList({ label, items }) {
  if (!items?.length) return null
  return (
    <div>
      <div className="mb-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#6b705c]">{label}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-[#e8dcc0]/80">
            <span className="text-[#c9a96e]/50">—</span><span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BriefCard({ brief }) {
  const [rawOpen, setRawOpen] = useState(false)
  const status = STATUS_STYLE[brief.status] || STATUS_STYLE.insufficient_signal
  return (
    <div className="rounded-2xl border border-[#6b705c]/15 bg-[#0d0c09]/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#6b705c]">{brief.type}</div>
          <h3 className="mt-1 font-serif text-lg font-black leading-tight text-[#f5f5f0]">{brief.title}</h3>
          <div className="mt-1 text-[11px] text-[#e8dcc0]/55">{brief.team}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ConfidenceBadge value={brief.confidence} />
          <span className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] ${status.cls}`}>
            {status.label}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-[#e8dcc0]/85">{brief.headline}</p>

      <div className="mt-4 space-y-3.5">
        <ItemList label="Signals" items={brief.signals} />
        <ItemList label="Priorities" items={brief.priorities} />
        <ItemList label="Opportunities" items={brief.opportunities} />
        <ItemList label="Open questions" items={brief.openQuestions} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#6b705c]/15 pt-3">
        <div className="flex flex-wrap gap-1.5">
          {(brief.audience || []).map(role => (
            <span key={role} className="rounded-full border border-[#6b705c]/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#6b705c]">
              {role}
            </span>
          ))}
        </div>
        <button
          onClick={() => setRawOpen(v => !v)}
          className="font-mono text-[10px] text-[#6b705c] transition hover:text-[#c9a96e]"
        >
          {rawOpen ? 'hide JSON' : 'view JSON'}
        </button>
      </div>

      {rawOpen && (
        <pre className="mt-3 max-h-72 overflow-auto rounded-xl border border-[#6b705c]/15 bg-black/40 p-3 font-mono text-[10px] leading-relaxed text-[#e8dcc0]/70">
          {JSON.stringify(brief, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default function VenueBridgeInspector() {
  const [briefs, setBriefs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [regenerating, setRegenerating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchVenueBriefs()
      setBriefs(Array.isArray(res?.briefs) ? res.briefs : [])
    } catch (err) {
      setError(err?.message || 'Could not reach the Venue Intelligence Bridge.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true)
    setError(null)
    try {
      const res = await regenerateVenueBriefs()
      setBriefs(Array.isArray(res?.briefs) ? res.briefs : [])
    } catch (err) {
      setError(err?.message || 'Regeneration failed.')
    } finally {
      setRegenerating(false)
    }
  }, [])

  const generatedAt = briefs[0]?.generatedAt
  const sourceHash = briefs[0]?.sourceHash

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.26em] text-[#c9a96e]/70">Venue Intelligence Bridge</div>
          <h1 className="mt-2 font-serif text-3xl font-black leading-tight text-[#f5f5f0]">Brief Inspector</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#e8dcc0]/60">
            Developer view of the specialist briefs derived from Venue DNA. Briefs regenerate automatically as the
            venue conversation evolves. This surface is read-only — specialist modules consume these through the
            shared bridge service.
          </p>
          {(generatedAt || sourceHash) && (
            <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] text-[#6b705c]">
              {generatedAt && <span>generated: {new Date(generatedAt).toLocaleString()}</span>}
              {sourceHash && <span>source_hash: {sourceHash}</span>}
            </div>
          )}
        </div>
        <button
          onClick={handleRegenerate}
          disabled={regenerating || loading}
          className="shrink-0 rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e] transition hover:bg-[#c9a96e]/20 disabled:opacity-40"
        >
          {regenerating ? 'Regenerating…' : 'Regenerate briefs'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/25 bg-red-950/20 px-4 py-3 text-xs text-red-300/90">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-[#1a1a1a]/60" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {briefs.map(brief => <BriefCard key={brief.type} brief={brief} />)}
        </div>
      )}
    </div>
  )
}
