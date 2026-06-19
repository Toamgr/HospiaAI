// Owner AI Home — Phase 9C-4: read-only Venue DNA completeness surface.
//
// The calm, intelligence-first owner surface defined in
// docs/architecture/OWNER_AI_HOME_AND_VENUE_DNA_BUILD_MODE_PHASE_9A_SPEC.md.
// It renders on UI-skill Palette B (Editorial Light) and now presents the
// DETERMINISTIC Venue DNA foundation-readiness model, read-only.
//
// PHASE GUARDRAILS — do not violate in this file:
//   • READ-ONLY. The only network call is GET /api/venue-intelligence/completeness.
//   • Do NOT call sendMessage, /message, /reset, candidate APIs, or any POST/PATCH/DELETE.
//   • No Venue DNA mutation. No Full Intelligence Mode. No AI/model calls.
//   • The conversation input is inert — it has no submit handler that writes.
//   • Coverage is deterministic Venue DNA completeness — NEVER "AI confidence".
// The real Build Mode conversation activates in a later phase (9E), only after the
// confirmation checkpoints (9D) connect. unlock_readiness is always false here.

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

// Owner-facing foundation status copy. Never framed as AI confidence or a score
// of the business — this is structured Venue DNA coverage only.
const FOUNDATION_STATUS_COPY = {
  not_started:              { title: 'HESTIA is ready to learn this venue.', body: 'Nothing has been established yet. Venue DNA Build Mode will gather the venue’s identity, intent, and the night you build around.' },
  early_learning:           { title: 'HESTIA has early signals.', body: 'A few signals are forming, but not enough to establish the foundation. HESTIA keeps listening before it concludes anything.' },
  building:                 { title: 'HESTIA is building the venue foundation.', body: 'Core areas are taking shape. Several foundation-critical areas still need to be understood and confirmed.' },
  needs_owner_confirmation: { title: 'Owner confirmation is needed.', body: 'HESTIA understands the foundation but will not treat identity-level claims as settled until you confirm them.' },
  foundation_ready:         { title: 'Venue foundation is ready for the next phase.', body: 'The foundation-critical areas are established and confirmed. Full Intelligence Mode remains a separate, later step.' },
}

// Calm, owner-facing labels for the dimension groupings. No harsh "missing".
const GROUPS = [
  { key: 'known',        label: 'Known so far',           hint: 'Understood from what you’ve shared.' },
  { key: 'needsConfirm', label: 'Awaiting your confirmation', hint: 'Understood, but HESTIA won’t settle these without you.' },
  { key: 'learning',     label: 'Still learning',         hint: 'Forming — not enough evidence yet.' },
  { key: 'notTracked',   label: 'Not explored yet',       hint: 'HESTIA hasn’t gathered this yet.' },
]

function groupForStatus(dim) {
  if (dim.status === 'answered' || dim.status === 'confirmed') return 'known'
  if (dim.status === 'needs_confirmation') return 'needsConfirm'
  if (dim.status === 'missing' && dim.tracked_today === 'no') return 'notTracked'
  return 'learning' // partial, unclear, contradicted, or tracked-but-empty
}

// Ceremonial intelligence presence — an engraved double-ring sigil on ivory, in
// the classical Hestia register. Calm and restrained: no glow, no sci-fi excess.
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
        {/* engraved outer hairline ring — restrained gold */}
        <div className="absolute inset-[5px] rounded-full" style={{ border: `1px solid ${C.amber}`, opacity: 0.32 }} aria-hidden="true" />
        {/* engraved inner hairline ring — charcoal linework */}
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

// A quiet, honest coverage bar — labeled as completeness, never confidence.
function CoverageBar({ score }) {
  const pct = Math.max(0, Math.min(100, Number(score) || 0))
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>Foundation coverage</span>
        <span className="font-serif text-2xl font-bold" style={{ color: C.burgundy }}>{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: C.inset }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.burgundy }} />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed" style={{ color: C.text3 }}>
        Coverage reflects structured Venue DNA completeness, not performance or confidence.
      </p>
    </div>
  )
}

function DimensionChip({ dim }) {
  const dashed = dim.status === 'missing'
  return (
    <span className="rounded-full px-2.5 py-1 text-[11px]"
      style={{
        border: dashed ? `1px dashed ${C.borderEmp}` : `1px solid ${C.borderSub}`,
        background: dashed ? 'transparent' : C.inset,
        color: dashed ? C.text3 : C.text2,
      }}>
      {dim.label}
    </span>
  )
}

export default function OwnerAIHome({ currentUser } = {}) {
  // Read-only deterministic completeness model. The ONLY call this surface makes.
  const [completeness, setCompleteness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    // Phase 9C-4: read-only — GET completeness only. No sendMessage, no writes.
    apiGet('/api/venue-intelligence/completeness')
      .then(res => { if (!cancelled) setCompleteness(res?.completeness || null) })
      .catch(err => {
        // Dev-only: name the endpoint so a stale backend (missing route) is obvious.
        if (import.meta?.env?.DEV) console.error('[OwnerAIHome] GET /api/venue-intelligence/completeness failed:', err)
        if (!cancelled) setError('HESTIA could not read the Venue DNA foundation right now. Nothing was changed.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const status = completeness?.foundation_status || 'not_started'
  const statusCopy = FOUNDATION_STATUS_COPY[status] || FOUNDATION_STATUS_COPY.not_started
  const dimensions = Array.isArray(completeness?.dimensions) ? completeness.dimensions : []
  const notStarted = status === 'not_started' || completeness?.not_enough_data
  const nextQuestion = completeness?.recommended_next_question
  const unlocked = completeness?.unlock_readiness === true // always false in 9C

  // Group dimensions calmly by what they need from here.
  const grouped = { known: [], needsConfirm: [], learning: [], notTracked: [] }
  for (const dim of dimensions) grouped[groupForStatus(dim)].push(dim)

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
          <EngravedRule />
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed" style={{ color: C.text2 }}>
            This is where HESTIA learns your venue and, in time, helps you run it. For now it is a
            read-only build surface: it shows the deterministic Venue DNA foundation — what HESTIA
            knows, what it’s still learning, and what will need your confirmation. Signals are not
            confirmed Venue DNA.
          </p>
        </div>

        {/* Primary input shell — inert. No submit, no POST. */}
        <div className="mb-8">
          <div className="flex items-end gap-2 rounded-2xl p-2"
            style={{ background: C.card, border: `1px solid ${C.borderSub}`, boxShadow: '0 1px 4px rgba(26,22,18,0.06)' }}>
            <textarea
              rows={2}
              disabled
              aria-disabled="true"
              placeholder="Venue DNA Build Mode is being prepared. This input is intentionally inactive until confirmation checkpoints are connected."
              className="flex-1 resize-none rounded-xl bg-transparent px-3 py-2 text-sm outline-none"
              style={{ color: C.text }}
            />
            <button
              type="button"
              disabled
              aria-disabled="true"
              title="Venue DNA Build Mode activates in a later phase"
              className="cursor-default rounded-xl px-5 py-2 text-sm font-semibold"
              style={{ border: `1px solid ${C.borderEmp}`, color: C.text3, background: C.inset }}
            >
              Soon
            </button>
          </div>
          <p className="mt-2 text-center text-[11px]" style={{ color: C.text3 }}>
            HESTIA separates signals from confirmed Venue DNA. Nothing here mutates the venue profile.
          </p>
        </div>

        {/* Completeness-driven content */}
        <div className="space-y-4">
          {loading ? (
            <Panel>
              <Eyebrow>Venue DNA foundation</Eyebrow>
              <p className="mt-3 text-sm" style={{ color: C.text2 }}>Reading Venue DNA foundation…</p>
              <div className="mt-4 space-y-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-5 animate-pulse rounded" style={{ background: C.inset, width: `${70 - i * 12}%` }} />
                ))}
              </div>
            </Panel>
          ) : error ? (
            <Panel className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ border: `1px solid ${C.borderEmp}`, color: C.amber }} aria-hidden="true">
                <span className="font-serif text-lg">◈</span>
              </div>
              <Eyebrow>Venue DNA foundation</Eyebrow>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: C.text2 }}>{error}</p>
              <p className="mx-auto mt-2 max-w-md text-[11px] leading-relaxed" style={{ color: C.text3 }}>
                This surface is read-only. No Venue DNA was written or altered.
              </p>
            </Panel>
          ) : (
            <>
              {/* 1 + 2. Foundation status + coverage — one clear card */}
              <Panel>
                <Eyebrow>Foundation status</Eyebrow>
                <h2 className="mt-3 font-serif text-2xl font-bold leading-snug" style={{ color: C.text }}>
                  {statusCopy.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: C.text2 }}>
                  {statusCopy.body}
                </p>
                <div className="mt-5 border-t pt-5" style={{ borderColor: C.borderSub }}>
                  <CoverageBar score={completeness?.foundation_score} />
                </div>
              </Panel>

              {/* 4. What HESTIA will explore next */}
              {nextQuestion && (
                <Panel>
                  <Eyebrow>What HESTIA will explore next</Eyebrow>
                  <p className="mt-3 font-serif text-lg italic leading-snug" style={{ color: C.text }}>
                    “{nextQuestion}”
                  </p>
                  <p className="mt-3 text-[12px] leading-relaxed" style={{ color: C.text3 }}>
                    This is the next question HESTIA will ask once Venue DNA Build Mode is activated. It
                    is shown here for transparency — it is not interactive yet.
                  </p>
                </Panel>
              )}

              {/* 3. What HESTIA knows so far — compact, collapsible to reduce dashboard feel */}
              <Panel>
                {notStarted ? (
                  <>
                    <Eyebrow>What HESTIA knows so far</Eyebrow>
                    <p className="mt-3 text-sm leading-relaxed" style={{ color: C.text2 }}>
                      HESTIA has not built enough Venue DNA yet. As Build Mode runs, the venue’s identity,
                      intent, and the guests you build the night around will appear here.
                    </p>
                  </>
                ) : (
                  <details>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                      <Eyebrow>What HESTIA knows so far</Eyebrow>
                      <span className="text-[11px]" style={{ color: C.text3 }}>
                        {grouped.known.length} known · {grouped.needsConfirm.length} to confirm · {grouped.learning.length} forming
                      </span>
                    </summary>
                    <div className="mt-5 space-y-5">
                      {GROUPS.map(group => {
                        const items = grouped[group.key]
                        if (!items.length) return null
                        return (
                          <div key={group.key}>
                            <div className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>
                              {group.label}
                            </div>
                            <div className="mb-2 text-[11px]" style={{ color: C.text3 }}>{group.hint}</div>
                            <div className="flex flex-wrap gap-1.5">
                              {items.map(dim => <DimensionChip key={dim.key} dim={dim} />)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </details>
                )}
              </Panel>

              {/* 5. Why Full Intelligence Mode is locked */}
              <Panel>
                <div className="flex items-center justify-between gap-3">
                  <Eyebrow>Full Intelligence Mode</Eyebrow>
                  <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ border: `1px solid ${C.borderEmp}`, color: C.text3, background: C.inset }}>
                    {unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: C.text2 }}>
                  Full Intelligence Mode remains locked until the venue foundation is complete and
                  identity-level claims are confirmed. This is by design: HESTIA does not act on an
                  unfinished venue identity.
                </p>
              </Panel>
            </>
          )}
        </div>

        {/* Footer guardrail */}
        <p className="mt-10 text-center text-[11px]" style={{ color: C.text3 }}>
          Read-only surface. Coverage is deterministic Venue DNA completeness — not AI confidence — and
          no Venue DNA changes are made from this page.
        </p>
      </div>
    </div>
  )
}
