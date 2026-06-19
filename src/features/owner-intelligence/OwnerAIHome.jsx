// Owner AI Home — Phase 9D-0: chat-first surface with honest first-run zero-state.
//
// The owner does not see a readiness dashboard. They see a calm conversational
// home. The deterministic completeness model works BEHIND THE SCENES to shape
// HESTIA's opening message and a collapsed "Backstage intelligence" section.
//
// FIRST-RUN TRUTH (Phase 9D-0):
//   • A true new owner (empty venue_dna_json) sees not_started → "HESTIA is ready
//     to learn this venue.", zero coverage, no known dimensions, Full Mode locked.
//   • A venue that already has signals is labelled honestly ("early Venue DNA
//     signals", "building") and NEVER implies confirmed/final Venue DNA.
//   • No foundation_score / percentage on the main surface — backstage only, and
//     labelled as coverage from EXISTING signals (a new venue does not start there).
//
// GUARDRAILS:
//   • READ-ONLY. The only network call is GET /api/venue-intelligence/completeness.
//   • Chat is NOT activated here (Build Mode input is inert) — no /message, /reset,
//     mergeVenueDna, AI, or any POST/PATCH/DELETE.
//   • Full Intelligence Mode stays locked. No fake KPIs, no fake progress.

import { useEffect, useState } from 'react'
import { apiGet } from '../../services/api/client'

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

// HESTIA's opening invitation + an honest one-line state ribbon, both shaped by the
// deterministic completeness state. Never a persisted/fabricated conversation turn,
// and never a score or percentage.
const STATE_COPY = {
  not_started: {
    ribbon: 'HESTIA is ready to learn this venue.',
    opening:
      "Before I can advise, I need to understand the venue. Tell me what this place is, who it’s for, and what kind of hospitality you want people to feel here.",
  },
  early_learning: {
    ribbon: 'This venue already has early Venue DNA signals — nothing is confirmed yet.',
    opening:
      "I have early signals about this venue. I still need to understand the owner intent, the guest promise, and what this place must never become.",
  },
  building: {
    ribbon: 'HESTIA is building the venue foundation — these signals are not confirmed Venue DNA.',
    opening:
      "I have early signals about this venue. I still need to understand the owner intent, the guest promise, and what this place must never become.",
  },
  needs_owner_confirmation: {
    ribbon: 'Owner confirmation is needed before this becomes Venue DNA.',
    opening:
      "I have enough signals to form an early picture, but I need your confirmation before treating any of it as Venue DNA.",
  },
  foundation_ready: {
    ribbon: 'The foundation is in place. Full Intelligence Mode stays locked until activation is built.',
    opening:
      "I understand the foundation of this venue. When activation is ready, ask me anything about it — and tell me the moment something changes.",
  },
}

// Owner-voiced prompts HESTIA will explore. Suggestions only — inert until Build
// Mode is implemented; they never fabricate a reply.
const SUGGESTED_PROMPTS = [
  'What kind of guests are we built for?',
  'What should this venue never become?',
  'What feeling should guests leave with?',
  'What makes our hospitality different?',
]

const STATUS_LABEL = {
  not_started: 'Not started',
  early_learning: 'Early learning',
  building: 'Building',
  needs_owner_confirmation: 'Needs owner confirmation',
  foundation_ready: 'Foundation ready',
}

// Ceremonial intelligence presence — an engraved double-ring sigil on ivory.
function Orb() {
  return (
    <div className="flex items-center justify-center">
      <div
        className="relative flex h-24 w-24 items-center justify-center rounded-full"
        style={{
          background: 'radial-gradient(circle at 50% 36%, rgba(107,39,55,0.10), rgba(184,134,11,0.05) 68%, transparent)',
          border: `1px solid ${C.borderEmp}`,
          boxShadow: '0 6px 22px rgba(26,22,18,0.10), inset 0 1px 0 rgba(255,255,255,0.65)',
        }}
      >
        <div className="absolute inset-[5px] rounded-full" style={{ border: `1px solid ${C.amber}`, opacity: 0.32 }} aria-hidden="true" />
        <div className="absolute inset-[11px] rounded-full" style={{ border: `1px solid ${C.borderEmp}` }} aria-hidden="true" />
        <span className="font-serif text-3xl" style={{ color: C.burgundy }}>◈</span>
      </div>
    </div>
  )
}

// A classical engraved divider — a hairline rule with a centered mark.
function EngravedRule() {
  return (
    <div className="mx-auto mt-6 flex max-w-[18rem] items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${C.borderEmp})` }} />
      <span className="text-[10px]" style={{ color: C.amber }}>✦</span>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${C.borderEmp})` }} />
    </div>
  )
}

function Sigil() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
      style={{ border: `1px solid ${C.borderEmp}`, background: C.inset, color: C.burgundy }}>
      <span className="font-serif text-[13px]">◈</span>
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
  // Read-only deterministic completeness — drives the opening message + backstage.
  const [completeness, setCompleteness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    apiGet('/api/venue-intelligence/completeness')
      .then(res => { if (!cancelled) setCompleteness(res?.completeness || null) })
      .catch(err => {
        if (import.meta?.env?.DEV) console.error('[OwnerAIHome] GET /api/venue-intelligence/completeness failed:', err)
        if (!cancelled) setError('HESTIA could not read the Venue DNA foundation right now. Nothing was changed.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const status = completeness?.foundation_status || 'not_started'
  const copy = STATE_COPY[status] || STATE_COPY.not_started
  const nextQuestion = completeness?.recommended_next_question
  const score = completeness?.foundation_score
  const missingRequired = Array.isArray(completeness?.missing_required_dimensions)
    ? completeness.missing_required_dimensions
    : []

  return (
    <div
      className="min-h-[calc(100vh-9rem)] -m-5 rounded-3xl px-5 py-10 sm:-m-7 sm:px-8 lg:-m-10 lg:px-12 xl:-m-14 2xl:-m-20"
      style={{ background: C.ground, color: C.text }}
    >
      <div className="mx-auto max-w-2xl">

        {/* Minimal top area */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Eyebrow>HESTIA · Venue Intelligence</Eyebrow>
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

        {/* ── Conversational home — ceremonial, centered ── */}
        <div className="text-center">
          <Orb />
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight sm:text-5xl" style={{ color: C.text }}>
            Talk to HESTIA about your venue
          </h1>

          {/* Honest state ribbon — distinguishes true-zero / early / confirmation-needed.
              No percentage here; loads quietly. */}
          {!loading && !error && (
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed" style={{ color: C.text2 }}>
              {copy.ribbon}
            </p>
          )}

          <EngravedRule />

          {/* HESTIA's opening invitation (not a persisted turn) */}
          <div className="mx-auto mt-8 max-w-xl">
            <div className="flex items-start gap-2.5 text-left">
              <Sigil />
              <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                style={{ background: C.card, color: C.text, border: `1px solid ${C.borderSub}`, borderTopLeftRadius: 6 }}>
                {loading ? 'Reading Venue DNA foundation…' : error ? error : copy.opening}
                {!loading && !error && nextQuestion && (
                  <span className="mt-2 block font-serif text-[13px] italic" style={{ color: C.text2 }}>
                    To begin: “{nextQuestion}”
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Primary input — INERT. Build Mode is not activated yet. ── */}
        <div className="mt-7">
          <div className="flex items-end gap-2 rounded-2xl p-2"
            style={{ background: C.card, border: `1px solid ${C.borderSub}`, boxShadow: '0 2px 10px rgba(26,22,18,0.07)' }}>
            <textarea
              rows={2}
              disabled
              aria-disabled="true"
              placeholder="Venue DNA Build Mode is being connected. For now, HESTIA is showing the first question it will ask — this input is intentionally inactive."
              className="flex-1 resize-none rounded-xl bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-70"
              style={{ color: C.text }}
            />
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Venue DNA Build Mode activates in a later phase"
              className="cursor-default self-end rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50"
              style={{ border: `1px solid ${C.borderEmp}`, color: C.text3, background: C.inset }}
            >
              Soon
            </button>
          </div>

          {/* Suggested owner prompts — what HESTIA will explore (inert previews). */}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {SUGGESTED_PROMPTS.map(p => (
              <span
                key={p}
                className="rounded-full px-3 py-1.5 text-[11px]"
                style={{ border: `1px solid ${C.borderSub}`, background: C.inset, color: C.text3 }}
              >
                {p}
              </span>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px]" style={{ color: C.text3 }}>
            HESTIA separates signals from confirmed Venue DNA. Nothing here mutates the venue profile.
          </p>
        </div>

        {/* ── Backstage intelligence — collapsed by default, never the product ── */}
        <details className="mt-10">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2"
            style={{ border: `1px solid ${C.borderSub}`, background: C.card }}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>
              Backstage intelligence
            </span>
            <span className="text-[11px]" style={{ color: C.text3 }}>Venue foundation details</span>
          </summary>

          <div className="mt-3 rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.borderSub}` }}>
            {loading ? (
              <p className="text-[12px]" style={{ color: C.text3 }}>Reading Venue DNA foundation…</p>
            ) : error ? (
              <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>{error}</p>
            ) : !completeness ? (
              <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                HESTIA has not built enough Venue DNA yet. The conversation above is how it begins.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: C.text3 }}>Foundation status</span>
                  <span className="text-[12px] font-semibold" style={{ color: C.text }}>{STATUS_LABEL[status] || status}</span>
                </div>

                {Number.isFinite(Number(score)) && (
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px]" style={{ color: C.text3 }}>Foundation coverage from existing Venue DNA signals</span>
                      <span className="text-[12px] font-semibold" style={{ color: C.text2 }}>{Math.max(0, Math.min(100, Number(score)))}%</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed" style={{ color: C.text3 }}>
                      Deterministic Venue DNA completeness — not performance, not AI confidence. A new venue starts at 0.
                    </p>
                  </div>
                )}

                {nextQuestion && (
                  <div>
                    <div className="text-[11px]" style={{ color: C.text3 }}>HESTIA’s next question</div>
                    <p className="mt-1 font-serif text-[13px] italic" style={{ color: C.text }}>“{nextQuestion}”</p>
                  </div>
                )}

                {missingRequired.length > 0 && (
                  <div>
                    <div className="text-[11px]" style={{ color: C.text3 }}>Still to understand</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {missingRequired.map(k => (
                        <span key={k} className="rounded-full px-2.5 py-1 text-[11px]"
                          style={{ border: `1px dashed ${C.borderEmp}`, color: C.text3 }}>
                          {k.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="border-t pt-3 text-[11px] leading-relaxed" style={{ borderColor: C.borderSub, color: C.text3 }}>
                  Full Intelligence Mode remains locked until HESTIA understands and the owner confirms the venue foundation.
                </p>
              </div>
            )}
          </div>
        </details>

        {/* Footer guardrail */}
        <p className="mt-8 text-center text-[11px]" style={{ color: C.text3 }}>
          Read-only surface. Nothing is confirmed as Venue DNA, and no Venue DNA is changed from this page.
        </p>
      </div>
    </div>
  )
}
