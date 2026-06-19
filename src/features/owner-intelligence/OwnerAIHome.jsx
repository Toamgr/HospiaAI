// Owner AI Home — Phase 9B-1 static, read-only shell.
//
// This is the calm, intelligence-first owner surface defined in
// docs/architecture/OWNER_AI_HOME_AND_VENUE_DNA_BUILD_MODE_PHASE_9A_SPEC.md.
// It renders on UI-skill Palette B (Editorial Light) and shows the venue's
// CURRENT Venue DNA understanding read-only.
//
// PHASE 9B GUARDRAILS — do not violate in this file:
//   • READ-ONLY. The only network call is GET /api/venue-intelligence.
//   • Do NOT call sendMessage, /message, /reset, or any POST/PATCH/DELETE here.
//   • No Venue DNA mutation. No Full Intelligence Mode. No AI/model calls.
//   • The conversation input is inert — it has no submit handler that writes.
// The real Build Mode conversation activates in a later phase (9E), only after
// the deterministic completeness model (9C) and confirmation checkpoints (9D).

import { useEffect, useState } from 'react'
import { apiGet } from '../../services/api/client'
import {
  SIGNAL_GROUPS, CONFIDENCE_DIMENSIONS, STAGES, emptyVenueDna, hasAnySignal
} from '../venue-intelligence/venueDnaModel'

// ── Palette B — Editorial Light tokens (from skills/user/hestia-ui-design) ──────
const C = {
  ground:    '#F7F3EC', // warm ivory page ground — never pure white
  card:      '#FFFFFF',
  inset:     '#F0EBE0',
  borderSub: '#E0D8CC',
  borderEmp: '#C8BFB0',
  burgundy:  '#6B2737',
  amber:     '#B8860B',
  text:      '#1A1612',
  text2:     '#5A524A',
  text3:     '#9A9088',
}

// Calm intelligence presence — a refined mark, not an animated neon orb.
function Orb() {
  return (
    <div className="flex items-center justify-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          background: 'radial-gradient(circle at 50% 38%, rgba(107,39,55,0.10), rgba(184,134,11,0.06) 70%, transparent)',
          border: `1px solid ${C.borderEmp}`,
          boxShadow: '0 4px 16px rgba(26,22,18,0.08)',
        }}
      >
        <span className="font-serif text-3xl" style={{ color: C.burgundy }}>◈</span>
      </div>
    </div>
  )
}

function StageRail({ stage }) {
  const activeIndex = Math.max(0, STAGES.findIndex(s => s.key === stage))
  return (
    <div className="flex flex-wrap items-center gap-2">
      {STAGES.map((s, i) => {
        const active = i === activeIndex
        const passed = i < activeIndex
        return (
          <div
            key={s.key}
            className="flex items-center gap-2 rounded-full px-3 py-1"
            style={{
              border: `1px solid ${active ? C.burgundy : C.borderSub}`,
              background: active ? 'rgba(107,39,55,0.06)' : 'transparent',
              color: active ? C.burgundy : passed ? C.text2 : C.text3,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full"
              style={{ background: active || passed ? C.burgundy : 'transparent', border: active || passed ? 'none' : `1px solid ${C.borderEmp}` }} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">{s.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function ConfidenceDots({ value }) {
  const filled = Math.round(Math.max(0, Math.min(100, value || 0)) / 20) // 0..5
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map(i => (
        <span key={i} className="h-1.5 w-1.5 rounded-full"
          style={{ background: i < filled ? C.burgundy : 'transparent', border: i < filled ? 'none' : `1px solid ${C.borderEmp}` }} />
      ))}
    </div>
  )
}

function SignalChips({ label, items }) {
  if (!items?.length) return null
  return (
    <div>
      <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="rounded-full px-2.5 py-1 text-[11px]"
            style={{ border: `1px solid ${C.borderSub}`, background: C.inset, color: C.text2 }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-2xl p-6 ${className}`}
      style={{ background: C.card, border: `1px solid ${C.borderSub}`, boxShadow: '0 1px 4px rgba(26,22,18,0.06)' }}>
      {children}
    </div>
  )
}

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.amber }}>
      {children}
    </div>
  )
}

export default function OwnerAIHome({ currentUser } = {}) {
  // Read-only venue learning state. The ONLY call this shell makes.
  const [state, setState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    // Phase 9B: read-only shell — do not call sendMessage here.
    apiGet('/api/venue-intelligence')
      .then(res => { if (!cancelled) setState(res?.state || null) })
      .catch(() => { if (!cancelled) setError('We could not reach the venue learning session. The page is still readable; nothing was changed.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const venueDNA = { ...emptyVenueDna(), ...(state?.venueDNA || {}) }
  const stage = state?.stage || 'story'
  const populated = hasAnySignal(venueDNA)

  // "What is still missing" — honest, derived only from what is actually absent.
  const missingDimensions = CONFIDENCE_DIMENSIONS.filter(d => !(Number(venueDNA.confidence?.[d.key]) > 0))
  const openQuestions = Array.isArray(venueDNA.openQuestions) ? venueDNA.openQuestions : []

  return (
    <div
      className="min-h-[calc(100vh-9rem)] -m-5 rounded-3xl px-5 py-10 sm:-m-7 sm:px-8 lg:-m-10 lg:px-12 xl:-m-14 2xl:-m-20"
      style={{ background: C.ground, color: C.text }}
    >
      <div className="mx-auto max-w-3xl">

        {/* Minimal top area */}
        <div className="mb-10 flex items-center justify-between gap-4">
          <Eyebrow>Owner Intelligence</Eyebrow>
          <div className="flex items-center gap-3">
            {currentUser?.full_name && (
              <span className="text-[11px]" style={{ color: C.text3 }}>{currentUser.full_name}</span>
            )}
            <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ border: `1px solid ${C.burgundy}`, color: C.burgundy, background: 'rgba(107,39,55,0.05)' }}>
              Build Mode
            </span>
          </div>
        </div>

        {/* Center hero */}
        <div className="mb-10 text-center">
          <Orb />
          <h1 className="mt-6 font-serif text-5xl font-bold leading-tight" style={{ color: C.text }}>
            Owner AI Home
          </h1>
          <p className="mt-3 font-serif text-xl italic" style={{ color: C.text2 }}>
            Venue Intelligence, on demand
          </p>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed" style={{ color: C.text2 }}>
            This is where HESTIA learns your venue and, in time, helps you run it. For now this is a
            read-only build shell: it shows what HESTIA understands so far. The focused Venue DNA
            conversation activates after the confirmation checkpoints are implemented.
          </p>
        </div>

        {/* Primary input shell — inert. No submit, no POST. */}
        <div className="mb-4">
          <div className="flex items-end gap-2 rounded-2xl p-2"
            style={{ background: C.card, border: `1px solid ${C.borderSub}`, boxShadow: '0 1px 4px rgba(26,22,18,0.06)' }}>
            <textarea
              rows={2}
              disabled
              aria-disabled="true"
              placeholder="Venue DNA conversation activates in the next phase"
              className="flex-1 resize-none rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
              style={{ color: C.text }}
            />
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="cursor-default rounded-xl px-5 py-2 text-sm font-semibold"
              style={{ border: `1px solid ${C.borderEmp}`, color: C.text3, background: C.inset }}
            >
              Send
            </button>
          </div>
          <p className="mt-2 text-center text-[11px]" style={{ color: C.text3 }}>
            Coming soon: focused Venue DNA Build Mode
          </p>
        </div>

        {/* Read-only DNA status */}
        <div className="mt-8 space-y-4">
          {loading ? (
            <Panel>
              <div className="space-y-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-5 animate-pulse rounded" style={{ background: C.inset, width: `${70 - i * 12}%` }} />
                ))}
              </div>
            </Panel>
          ) : error ? (
            <Panel>
              <Eyebrow>Venue DNA foundation</Eyebrow>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: C.text2 }}>{error}</p>
            </Panel>
          ) : (
            <>
              {/* Stage + What HESTIA is learning */}
              <Panel>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Eyebrow>What HESTIA is learning</Eyebrow>
                  <StageRail stage={stage} />
                </div>

                {!populated ? (
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: C.text2 }}>
                    HESTIA has not learned enough about this venue yet. As the Venue DNA conversation
                    happens, its character, pressures, and priorities will appear here.
                  </p>
                ) : (
                  <div className="mt-5 space-y-5">
                    {venueDNA.summary && (
                      <div>
                        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>Working understanding</div>
                        <p className="text-[13px] leading-relaxed" style={{ color: C.text }}>{venueDNA.summary}</p>
                      </div>
                    )}

                    <div>
                      <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>Understanding depth</div>
                      <div className="space-y-1.5">
                        {CONFIDENCE_DIMENSIONS.map(dim => (
                          <div key={dim.key} className="flex items-center justify-between gap-3">
                            <span className="text-[12px]" style={{ color: C.text2 }}>{dim.label}</span>
                            <ConfidenceDots value={venueDNA.confidence?.[dim.key]} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {SIGNAL_GROUPS.map(g => (
                        <SignalChips key={g.key} label={g.label} items={venueDNA[g.key]} />
                      ))}
                    </div>
                  </div>
                )}
              </Panel>

              {/* What is still missing */}
              <Panel>
                <Eyebrow>What is still missing</Eyebrow>
                {missingDimensions.length === 0 && openQuestions.length === 0 ? (
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: C.text2 }}>
                    Nothing flagged as missing yet. Missing areas appear here as HESTIA works through the
                    Venue DNA foundation.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {missingDimensions.length > 0 && (
                      <div>
                        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>Not yet understood</div>
                        <div className="flex flex-wrap gap-1.5">
                          {missingDimensions.map(d => (
                            <span key={d.key} className="rounded-full px-2.5 py-1 text-[11px]"
                              style={{ border: `1px dashed ${C.borderEmp}`, color: C.text3 }}>
                              {d.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {openQuestions.length > 0 && (
                      <div>
                        <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>Open questions</div>
                        <ul className="space-y-1.5">
                          {openQuestions.map((q, i) => (
                            <li key={i} className="flex gap-2 text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                              <span style={{ color: C.amber }}>—</span><span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </Panel>
            </>
          )}
        </div>

        {/* Footer guardrail */}
        <p className="mt-10 text-center text-[11px]" style={{ color: C.text3 }}>
          Read-only shell. No Venue DNA changes are made from this page.
        </p>
      </div>
    </div>
  )
}
