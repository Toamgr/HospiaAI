import { useState, useEffect } from 'react'
import { fetchRejections, fetchTasteDna } from '../../services/api/cocktailIntelligenceApi'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(str) {
  if (!str) return ''
  try {
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '' }
}

function formatFlavorProfile(fp) {
  if (!fp) return null
  if (Array.isArray(fp)) return fp.join(', ') || null
  if (typeof fp === 'string') return fp || null
  return null
}

const REASON_LABELS = {
  too_strong:         'Too strong',
  wrong_flavors:      "Wrong flavors",
  taste_fail:         "Doesn't taste good",
  too_complex:        'Too complex',
  too_expensive:      'Too expensive',
  identity_mismatch:  "Doesn't fit identity",
  just_experimenting: 'Experimenting',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition ${
        active
          ? 'bg-[#c9a96e] text-[#0d0c09]'
          : 'text-[#6b705c] hover:text-[#f5f5f0]'
      }`}
    >
      {label}
    </button>
  )
}

function ReasonBadge({ reasonId }) {
  const label = REASON_LABELS[reasonId] || reasonId
  const isExp = reasonId === 'just_experimenting'
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
        isExp
          ? 'border-[#6b705c]/20 text-[#6b705c]'
          : 'border-red-500/25 bg-red-950/20 text-red-400'
      }`}
    >
      {label}
    </span>
  )
}

// ── View 1: Taste DNA Panel ───────────────────────────────────────────────────

// patternStates: { [pattern]: 'unconfirmed' | 'confirmed' | 'dismissed' }
function TasteDnaPanel({ tasteDna, loading, error, patternStates, onConfirm, onDismiss }) {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="text-sm text-[#6b705c] animate-pulse">Loading taste memory…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    )
  }

  const rejectedFlavors = tasteDna ? JSON.parse(tasteDna.rejected_flavors_json || '[]') : []
  const rejectedSpirits = tasteDna ? JSON.parse(tasteDna.rejected_spirits_json  || '[]') : []
  const isEmpty = rejectedFlavors.length === 0 && rejectedSpirits.length === 0

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-16 text-center">
        <div className="text-2xl mb-4 text-[#6b705c]/40">⊘</div>
        <p className="text-sm font-semibold text-[#6b705c]">No patterns learned yet.</p>
        <p className="text-xs text-[#6b705c]/50 mt-2 max-w-xs mx-auto leading-relaxed">
          Rejections will build your venue's Taste DNA automatically. The Beverage Director learns what to avoid after 2+ rejections of the same pattern.
        </p>
      </div>
    )
  }

  const confirmedCount = rejectedFlavors.filter(f => patternStates[f.pattern] === 'confirmed').length

  return (
    <div className="flex flex-col gap-6">
      {/* Rejected flavor patterns */}
      {rejectedFlavors.length > 0 && (
        <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 p-6">
          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#6b705c] mb-4">
            Rejected Flavor Patterns
          </div>

          <div className="flex flex-col gap-4">
            {rejectedFlavors
              .sort((a, b) => b.count - a.count)
              .map((f, i) => {
                const state = patternStates[f.pattern] || 'unconfirmed'
                const isConfirmed  = state === 'confirmed'
                const isDismissed  = state === 'dismissed'

                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 transition-opacity ${isDismissed ? 'opacity-35' : ''}`}
                  >
                    {/* Bar */}
                    <div className="flex-1 h-1.5 rounded-full bg-[#6b705c]/15 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isConfirmed ? 'bg-red-500/70' : isDismissed ? 'bg-[#6b705c]/30' : 'bg-red-500/40'
                        }`}
                        style={{ width: `${Math.min((f.count / (rejectedFlavors[0]?.count || 1)) * 100, 100)}%` }}
                      />
                    </div>

                    {/* Label + count */}
                    <div className="shrink-0 flex items-center gap-2 min-w-[160px]">
                      <span className={`text-sm font-semibold capitalize ${isDismissed ? 'text-[#6b705c]' : 'text-[#e8dcc0]/80'}`}>
                        {f.pattern}
                      </span>
                      <span className="text-[10px] text-red-400/60">
                        {f.count}×
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="shrink-0 flex items-center gap-1.5">
                      {isConfirmed ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <span className="text-[11px]">✓</span> Confirmed
                        </span>
                      ) : isDismissed ? (
                        <button
                          onClick={() => onConfirm(f.pattern)}
                          className="text-[10px] text-[#6b705c] hover:text-[#e8dcc0] transition underline underline-offset-2"
                        >
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onConfirm(f.pattern)}
                            className="rounded-lg border border-emerald-500/25 bg-emerald-950/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-950/40 transition"
                          >
                            ✓ Confirm
                          </button>
                          <button
                            onClick={() => onDismiss(f.pattern)}
                            className="rounded-lg border border-[#6b705c]/20 px-2 py-0.5 text-[10px] font-bold text-[#6b705c] hover:border-[#6b705c]/40 hover:text-[#e8dcc0] transition"
                          >
                            ✕ Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
          </div>

          {/* Footer note */}
          <div className="mt-5 pt-4 border-t border-[#6b705c]/10 flex items-start gap-2">
            <span className="text-[10px] text-emerald-400/60 font-bold shrink-0">
              {confirmedCount > 0 ? `${confirmedCount} confirmed` : 'None confirmed'}
            </span>
            <span className="text-[10px] text-[#6b705c]/40 italic">
              — Only confirmed patterns are passed to the Beverage Director.
            </span>
          </div>
        </div>
      )}

      {/* Rejected spirits */}
      {rejectedSpirits.length > 0 && (
        <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 p-6">
          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#6b705c] mb-4">
            Avoided Spirit Categories
          </div>
          <div className="flex flex-wrap gap-2">
            {rejectedSpirits.map((spirit, i) => (
              <span
                key={i}
                className="rounded-full border border-red-500/25 bg-red-950/20 px-3 py-1 text-xs font-semibold text-red-400 capitalize"
              >
                {spirit}
              </span>
            ))}
          </div>
          <p className="mt-4 text-[10px] text-[#6b705c]/40 italic">
            Spirits rejected 2+ times for identity mismatch or being too strong.
          </p>
        </div>
      )}
    </div>
  )
}

// ── View 2: Rejection Log ─────────────────────────────────────────────────────

function RejectionLog({ rejections, loading, error }) {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="text-sm text-[#6b705c] animate-pulse">Loading rejection log…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    )
  }

  if (rejections.length === 0) {
    return (
      <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-16 text-center">
        <p className="text-sm text-[#6b705c]">No rejections logged yet.</p>
        <p className="text-xs text-[#6b705c]/50 mt-1.5">
          Reject cocktails in the Menu Generator to build this log.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 overflow-hidden">
      {rejections.map((r, i) => {
        const profile     = r.cocktail_profile || {}
        const reasons     = Array.isArray(r.reasons) ? r.reasons : []
        const isLast      = i === rejections.length - 1
        const baseSpirit  = profile.base_spirit  // stored in cocktail_profile_json as of this fix
        const flavorStr   = formatFlavorProfile(profile.flavor_profile)

        return (
          <div
            key={r.id ?? i}
            className={`px-6 py-5 ${!isLast ? 'border-b border-[#6b705c]/08' : ''}`}
          >
            {/* Name row */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-[15px] font-bold text-[#f5f5f0] leading-snug">{r.cocktail_name}</h3>
              <div className="shrink-0 text-right">
                <div className="text-[10px] text-[#6b705c]">{formatDate(r.rejected_at)}</div>
                {r.rejected_by && (
                  <div className="text-[9px] text-[#6b705c]/50 mt-0.5">by {r.rejected_by}</div>
                )}
              </div>
            </div>

            {/* Context row: base spirit + flavor profile */}
            {(baseSpirit || flavorStr) && (
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-3">
                {baseSpirit && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a96e]/60">
                    {baseSpirit}
                  </span>
                )}
                {baseSpirit && flavorStr && (
                  <span className="text-[#6b705c]/30 text-[10px]">·</span>
                )}
                {flavorStr && (
                  <span className="text-[11px] text-[#6b705c] italic">{flavorStr}</span>
                )}
              </div>
            )}

            {/* Reason badges */}
            {reasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {reasons.map((id, ri) => (
                  <ReasonBadge key={ri} reasonId={id} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function RejectionMemory() {
  const [tab, setTab]               = useState('dna')
  const [tasteDna, setTasteDna]     = useState(null)
  const [rejections, setRejections] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  // { [pattern]: 'unconfirmed' | 'confirmed' | 'dismissed' }
  const [patternStates, setPatternStates] = useState({})

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([fetchTasteDna(), fetchRejections()])
      .then(([dnaRes, rejRes]) => {
        if (cancelled) return
        setTasteDna(dnaRes?.taste_dna || null)
        setRejections(rejRes?.rejections || [])
      })
      .catch(() => {
        if (!cancelled) setError('Could not load rejection data.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  function handleConfirm(pattern) {
    setPatternStates(prev => ({ ...prev, [pattern]: 'confirmed' }))
  }

  function handleDismiss(pattern) {
    setPatternStates(prev => ({ ...prev, [pattern]: 'dismissed' }))
  }

  const logCount = rejections.filter(r => !r.reasons?.includes('just_experimenting')).length

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl border border-[#6b705c]/20 p-1 bg-[#0d0c09]/60 mb-7 max-w-xs">
        <TabButton label="Taste DNA" active={tab === 'dna'} onClick={() => setTab('dna')} />
        <TabButton
          label={`Rejection Log${logCount > 0 ? ` (${logCount})` : ''}`}
          active={tab === 'log'}
          onClick={() => setTab('log')}
        />
      </div>

      {tab === 'dna' && (
        <TasteDnaPanel
          tasteDna={tasteDna}
          loading={loading}
          error={error}
          patternStates={patternStates}
          onConfirm={handleConfirm}
          onDismiss={handleDismiss}
        />
      )}

      {tab === 'log' && (
        <RejectionLog rejections={rejections} loading={loading} error={error} />
      )}
    </div>
  )
}
