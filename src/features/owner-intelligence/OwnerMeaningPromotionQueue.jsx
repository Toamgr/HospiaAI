// OwnerMeaningPromotionQueue — Owner Meaning Promotion, the first READ-ONLY review surface (Slice 4H).
//
// Exposes the existing promotion candidate queue to the OWNER as an inspection / review depth layer.
// It is strictly observational: it shows PROPOSED changes, REFERENCED (never rewritten) owner
// evidence, and BLOCKED application. It changes no byte of state.
//
// It uses ONLY the two already-shipped read-only GET routes — it adds NO new backend behavior:
//   • GET /api/owner-meaning-promotion-candidates              → the paginated candidate queue
//   • GET /api/owner-meaning-promotion-candidates/:candidateId → one candidate + source captures + events
//
// CRITICAL PRODUCT TRUTH — stated plainly in the UI, non-removable:
//   • Nothing here changes Venue DNA. There is NO approve / reject / request-revision / apply-to-DNA
//     / promote / confirm affordance, for any role. The queue is read-only inspection only.
//   • allowed_actions are ALL false; application is BLOCKED (application.blocked: true). The UI says so.
//   • The proposed diff is PROPOSED, not applied — never "updated" / "confirmed" / "HESTIA learned this".
//   • Candidates are blocked from application until a future, separately-reviewed owner review
//     workflow exists. None exists in this slice.
//   • OWNER ONLY. The backend blocks every non-owner role (admin included); this surface additionally
//     refuses to render for any role that is not exactly 'owner'.
//
// ACCESSIBILITY (matches the 4E.1/4E.2 bar): every control is a real <button> (no clickable divs);
// fetch state is announced through a polite live region (role=status, aria-live=polite); opening a
// candidate moves focus to the detail heading and closing returns focus to the row that opened it;
// the detail region is labelled.
//
// Palette B (Editorial Light) — matches the host OwnerAIHome surface (never mix palettes).

import { useCallback, useEffect, useRef, useState } from 'react'
import { apiGet } from '../../services/api/client'

const C = {
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

// Shared keyboard focus-visible ring (premium, calm — a soft burgundy halo, never a neon outline).
const FOCUS_RING = 'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(107,39,55,0.14)]'

// Non-removable honesty framing — present in every non-loading state of this read-only surface.
const READONLY_NOTE =
  'Read-only inspection. No Venue DNA changes are made here. These are proposed candidates HESTIA ' +
  'drew from your saved evidence — nothing is approved, applied, or confirmed, and there is no ' +
  'control here that could change that.'

// Owner-facing labels for the closed candidate-status vocabulary (4F.1 §5). Word labels only —
// never invented certainty.
const STATUS_LABEL = {
  draft_suggestion:    'Draft suggestion',
  needs_owner_review:  'Needs owner review',
  owner_approved:      'Owner approved',
  owner_rejected:      'Owner rejected',
  revision_requested:  'Revision requested',
  superseded:          'Superseded',
  expired:             'Expired',
  application_blocked: 'Application blocked',
}

// The four forward-declared actions a future writer slice MAY add. Here every one is unavailable,
// surfaced as disabled, non-interactive evidence — never as a working control.
const ACTION_LABEL = {
  approve:          'Approve',
  reject:           'Reject',
  request_revision: 'Request revision',
  apply_to_dna:     'Apply to DNA',
}

function shortId(id) {
  const s = String(id || '')
  return s.length > 8 ? `…${s.slice(-8)}` : s
}

function formatDateTime(value) {
  if (!value) return null
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') + 'Z' : value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Render any JSON-ish value as honest, readable text — never a fabricated default.
function renderValue(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  try { return JSON.stringify(value, null, 2) } catch { return String(value) }
}

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.amber }}>
      {children}
    </div>
  )
}

// Confidence as a plain word band — low | medium ONLY (4F.1 §6.3). NEVER a number, meter, or percentage.
function ConfidenceBand({ label }) {
  const level = label === 'medium' ? 2 : label === 'low' ? 1 : 0
  return (
    <span className="inline-flex items-center gap-1.5"
      title="Confidence is a reasoned word band from the cited evidence — not certainty, not a score, and not confirmation.">
      <span className="flex items-center gap-1" aria-hidden="true">
        {[1, 2].map((n) => (
          <span key={n} className="h-1.5 w-1.5 rounded-full"
            style={{ background: n <= level ? C.amber : 'transparent', border: `1px solid ${C.borderEmp}` }} />
        ))}
      </span>
      <span className="text-[11px]" style={{ color: label ? C.text2 : C.text3 }}>
        {label ? `${label} confidence` : 'confidence not recorded'}
      </span>
    </span>
  )
}

function StatusBadge({ status }) {
  return (
    <span className="shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
      style={{ border: `1px solid ${C.borderEmp}`, color: C.burgundy, background: C.inset }}>
      {STATUS_LABEL[status] || status || 'unknown'}
    </span>
  )
}

// A single candidate row in the list — a button that opens the read-only detail. Communicates the
// status, target, confidence, timing, blocked application, and that actions are unavailable.
function CandidateRow({ candidate, onOpen, rowRef }) {
  const c = candidate || {}
  const created = formatDateTime(c.created_at)
  const updated = formatDateTime(c.updated_at)
  const evidenceCount = c.evidence?.source_capture_count
  return (
    <li>
      <button
        type="button"
        ref={rowRef}
        onClick={() => onOpen(c.id)}
        aria-label={`Inspect promotion candidate ${shortId(c.id)} — read-only, no Venue DNA changes`}
        className={`w-full rounded-xl px-4 py-3 text-left transition hover:border-current ${FOCUS_RING}`}
        style={{ background: C.card, border: `1px solid ${C.borderSub}`, color: C.text2 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-serif text-[14px] font-semibold leading-snug" style={{ color: C.text }}>
              {c.proposed_target_label || c.proposed_target_path || 'Proposed change'}
            </p>
            {c.proposed_meaning_summary && (
              <p className="mt-0.5 text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                {c.proposed_meaning_summary}
              </p>
            )}
            <p className="mt-1 text-[10px]" style={{ color: C.text3 }}>
              <span className="font-mono">{shortId(c.id)}</span>
              {created ? ` · proposed ${created}` : ''}
              {updated && updated !== created ? ` · updated ${updated}` : ''}
              {Number.isFinite(Number(evidenceCount)) ? ` · ${evidenceCount} source ${evidenceCount === 1 ? 'capture' : 'captures'}` : ''}
            </p>
          </div>
          <StatusBadge status={c.status} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <ConfidenceBand label={c.confidence?.label} />
          <span className="rounded-full px-2 py-0.5 text-[10px]"
            style={{ border: `1px dashed ${C.borderEmp}`, color: C.text3 }}>
            application blocked
          </span>
          <span className="rounded-full px-2 py-0.5 text-[10px]"
            style={{ border: `1px dashed ${C.borderEmp}`, color: C.text3 }}>
            actions unavailable
          </span>
        </div>
      </button>
    </li>
  )
}

// One audit event line — observational, never an action the owner took here.
function EventLine({ event }) {
  const e = event || {}
  const when = formatDateTime(e.created_at)
  return (
    <li className="font-mono text-[10px]" style={{ color: C.text3 }}>
      {when || '—'} · {e.event_type || 'event'}
      {e.previous_status || e.next_status
        ? ` · ${e.previous_status || '—'} → ${e.next_status || '—'}`
        : ''}
      {e.actor_type ? ` · ${e.actor_type}` : ''}
    </li>
  )
}

// One resolved source capture — VERBATIM owner words, byte-for-byte, never rewritten. A capture that
// no longer resolves in-venue is shown honestly as missing, never dropped.
function SourceCapture({ capture }) {
  const cap = capture || {}
  if (cap.missing) {
    return (
      <li className="rounded-xl px-3.5 py-3" style={{ background: C.inset, border: `1px dashed ${C.borderEmp}` }}>
        <p className="text-[11px] leading-relaxed" style={{ color: C.text3 }}>
          A referenced source capture (<span className="font-mono">{shortId(cap.id)}</span>) is no longer
          available in this venue. It is kept in the reference count for honesty, not fetched from elsewhere.
        </p>
      </li>
    )
  }
  const when = formatDateTime(cap.created_at)
  return (
    <li className="rounded-xl px-3.5 py-3" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
      <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: C.text3 }}>
        {when ? `Owner evidence · ${when}` : 'Owner evidence'} · raw, verbatim
      </p>
      {cap.question_text && (
        <p className="mt-1.5 text-[11px] italic leading-relaxed" style={{ color: C.text3 }}>
          In answer to: “{cap.question_text}”
        </p>
      )}
      <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed" style={{ color: C.text }}>
        {cap.owner_response_raw}
      </p>
      {cap.candidate_fingerprint && (
        <p className="mt-1.5 font-mono text-[10px]" style={{ color: C.text3 }}>
          fingerprint …{String(cap.candidate_fingerprint).slice(-8)}
          {cap.event_count != null ? ` · ${cap.event_count} audit ${cap.event_count === 1 ? 'event' : 'events'}` : ''}
        </p>
      )}
    </li>
  )
}

// The read-only detail for one candidate: proposed diff, confidence + factors, contradictions,
// missing evidence, source evidence, audit timeline, allowed_actions (all unavailable), and the
// blocked-application banner. Honest empty states everywhere — never a fabricated field.
function CandidateDetail({ detail, loading, error, headingRef, onClose }) {
  const candidate = detail?.candidate || null
  const sourceCaptures = Array.isArray(detail?.source_captures) ? detail.source_captures : []
  const events = Array.isArray(detail?.events) ? detail.events : []
  const allowedActions = detail?.allowed_actions || null
  const factors = candidate?.confidence?.factors
  const contradictions = Array.isArray(candidate?.confidence?.contradictions) ? candidate.confidence.contradictions : []
  const missingEvidence = Array.isArray(candidate?.confidence?.missing_evidence) ? candidate.confidence.missing_evidence : []
  const before = renderValue(candidate?.current_value_snapshot_json)
  const after = renderValue(candidate?.proposed_value_json)
  const patch = renderValue(candidate?.proposed_dna_patch_json)

  return (
    <div className="mt-4" role="region" aria-label="Promotion candidate detail — read-only">
      <button
        type="button"
        onClick={onClose}
        className={`rounded-md px-1.5 py-0.5 text-[11px] underline ${FOCUS_RING}`}
        style={{ color: C.text3 }}
      >
        ← back to the promotion queue
      </button>

      <div role="status" aria-live="polite" aria-atomic="true">
        {loading && <p className="mt-3 text-[12px]" style={{ color: C.text3 }}>Reading the proposed change and its evidence…</p>}
        {error && <p className="mt-3 text-[12px] leading-relaxed" style={{ color: C.burgundy }}>{error}</p>}
      </div>

      {!loading && !error && !candidate && (
        <p className="mt-3 text-[12px]" style={{ color: C.text3 }}>
          This promotion candidate is no longer available in this venue.
        </p>
      )}

      {!loading && !error && candidate && (
        <div className="mt-3">
          <div className="flex items-start justify-between gap-3">
            <h3 ref={headingRef} tabIndex={-1} className="font-serif text-[16px] font-semibold leading-snug outline-none" style={{ color: C.text }}>
              {candidate.proposed_target_label || candidate.proposed_target_path || 'Proposed change'}
            </h3>
            <StatusBadge status={candidate.status} />
          </div>
          <p className="mt-1 text-[10px]" style={{ color: C.text3 }}>
            <span className="font-mono">{shortId(candidate.id)}</span>
            {candidate.proposed_target_path ? ` · target: ${candidate.proposed_target_path}` : ''}
            {formatDateTime(candidate.created_at) ? ` · proposed ${formatDateTime(candidate.created_at)}` : ''}
          </p>

          {/* Blocked application — the most important read-only truth, stated first. */}
          <div className="mt-3 rounded-xl px-3.5 py-2.5" style={{ background: 'rgba(107,39,55,0.05)', border: `1px solid ${C.burgundy}` }}>
            <p className="text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
              <span aria-hidden="true">⊘ </span>
              Application is blocked in this slice. {candidate.application?.block_reason || 'Venue DNA application is not enabled in this contract.'}{' '}
              This queue is read-only. Venue DNA is unchanged.
            </p>
          </div>

          {/* Proposed diff — clearly PROPOSED, not applied. */}
          <div className="mt-4">
            <Eyebrow>Proposed change · not applied</Eyebrow>
            {candidate.proposed_meaning_summary && (
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                {candidate.proposed_meaning_summary}
              </p>
            )}
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl px-3 py-2.5" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: C.text3 }}>Current value (before)</p>
                <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed" style={{ color: before ? C.text : C.text3 }}>
                  {before ?? 'No current value recorded.'}
                </pre>
              </div>
              <div className="rounded-xl px-3 py-2.5" style={{ background: C.card, border: `1px solid ${C.borderEmp}` }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: C.burgundy }}>Proposed value (after — not applied)</p>
                <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed" style={{ color: after ? C.text : C.text3 }}>
                  {after ?? 'No proposed value recorded.'}
                </pre>
              </div>
            </div>
            {patch && (
              <div className="mt-2 rounded-xl px-3 py-2.5" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: C.text3 }}>Proposed patch (would apply if ever permitted)</p>
                <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed" style={{ color: C.text2 }}>{patch}</pre>
              </div>
            )}
            {candidate.proposal_rationale && (
              <p className="mt-2 text-[11px] leading-relaxed" style={{ color: C.text3 }}>
                <span className="font-semibold" style={{ color: C.text2 }}>Why HESTIA drew this: </span>
                {candidate.proposal_rationale}
              </p>
            )}
            {candidate.impact_note && (
              <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.text3 }}>
                <span className="font-semibold" style={{ color: C.text2 }}>Who reads this field: </span>
                {candidate.impact_note}
              </p>
            )}
          </div>

          {/* Confidence — word band + factors; honest empties. Never a decorative number. */}
          <div className="mt-4">
            <Eyebrow>Confidence</Eyebrow>
            <div className="mt-1"><ConfidenceBand label={candidate.confidence?.label} /></div>
            {factors && typeof factors === 'object' && Object.keys(factors).length > 0 ? (
              <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                {Object.entries(factors).map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3">
                    <dt className="text-[11px]" style={{ color: C.text3 }}>{k.replace(/_/g, ' ')}</dt>
                    <dd className="text-[11px] font-medium" style={{ color: C.text2 }}>
                      {Array.isArray(v) ? (v.length ? v.join(', ') : '—') : (v === null || v === undefined || v === '' ? '—' : String(v))}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-1.5 text-[11px]" style={{ color: C.text3 }}>No confidence factors available yet.</p>
            )}
          </div>

          {/* Contradictions — surfaced honestly. */}
          <div className="mt-4">
            <Eyebrow>Contradictions</Eyebrow>
            {contradictions.length > 0 ? (
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                {contradictions.map((item, i) => (
                  <li key={i} className="text-[11px] leading-relaxed" style={{ color: C.text2 }}>{renderValue(item)}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-[11px]" style={{ color: C.text3 }}>No contradictions recorded.</p>
            )}
          </div>

          {/* Missing evidence — surfaced honestly. */}
          <div className="mt-4">
            <Eyebrow>Missing evidence</Eyebrow>
            {missingEvidence.length > 0 ? (
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
                {missingEvidence.map((item, i) => (
                  <li key={i} className="text-[11px] leading-relaxed" style={{ color: C.text2 }}>{renderValue(item)}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1.5 text-[11px]" style={{ color: C.text3 }}>No missing-evidence notes recorded.</p>
            )}
          </div>

          {/* Source evidence — verbatim owner words. */}
          <div className="mt-4">
            <Eyebrow>Source evidence · {sourceCaptures.length}</Eyebrow>
            {sourceCaptures.length > 0 ? (
              <ul className="mt-2 space-y-2.5">
                {sourceCaptures.map((cap, i) => <SourceCapture key={(cap && cap.id) || i} capture={cap} />)}
              </ul>
            ) : (
              <p className="mt-1.5 text-[11px]" style={{ color: C.text3 }}>No source evidence resolved for this candidate.</p>
            )}
          </div>

          {/* Audit timeline. */}
          <div className="mt-4">
            <Eyebrow>Events · audit timeline · {events.length}</Eyebrow>
            {events.length > 0 ? (
              <ul className="mt-1.5 space-y-0.5">
                {events.map((e, i) => <EventLine key={(e && e.id) || i} event={e} />)}
              </ul>
            ) : (
              <p className="mt-1.5 text-[11px]" style={{ color: C.text3 }}>No audit events recorded yet.</p>
            )}
          </div>

          {/* allowed_actions — forward-declared, ALL unavailable. Non-interactive evidence, never controls. */}
          <div className="mt-4">
            <Eyebrow>Actions · all unavailable in this read-only slice</Eyebrow>
            {allowedActions ? (
              <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Available actions, all unavailable">
                {Object.keys(ACTION_LABEL).map((key) => {
                  const enabled = allowedActions[key] === true
                  return (
                    <li
                      key={key}
                      aria-disabled="true"
                      className="rounded-full px-2.5 py-1 text-[10px] font-medium"
                      style={{ border: `1px dashed ${C.borderEmp}`, color: C.text3, opacity: 0.7 }}
                    >
                      {ACTION_LABEL[key]} — {enabled ? 'available' : 'unavailable'}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="mt-1.5 text-[11px]" style={{ color: C.text3 }}>No action hints available.</p>
            )}
            <p className="mt-2 text-[11px] leading-relaxed" style={{ color: C.text3 }}>
              These are forward-declared hints only. No approve, reject, request-revision, or apply-to-DNA
              control exists in this slice. A future owner review workflow — separately reviewed — would be
              the first place any of these could ever become available, and only for the owner.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OwnerMeaningPromotionQueue({ currentUser } = {}) {
  // OWNER-ONLY VISIBILITY. The backend already blocks every non-owner role (admin included); this
  // surface additionally refuses to render for any role that is not exactly 'owner'. (The role gate
  // is applied at render time, AFTER all hooks below, per the Rules of Hooks.)
  const isOwner = currentUser?.role === 'owner'

  const [list, setList] = useState(null)
  const [counts, setCounts] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  // Focus management: remember which row opened the detail so closing returns focus there; move
  // focus to the detail heading when it lands.
  const rowRefs = useRef(new Map())
  const detailHeadingRef = useRef(null)
  const lastOpenedRef = useRef(null)

  const loadList = useCallback(() => {
    setLoading(true)
    setError(null)
    return apiGet('/api/owner-meaning-promotion-candidates')
      .then((res) => {
        setList(Array.isArray(res?.candidates) ? res.candidates : [])
        setCounts(res?.counts && typeof res.counts === 'object' ? res.counts : null)
      })
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[OwnerMeaningPromotionQueue] GET list failed:', err)
        setError('HESTIA could not load the promotion queue right now. Nothing was changed.')
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { if (isOwner) loadList() }, [isOwner, loadList])

  const openCandidate = useCallback((candidateId) => {
    lastOpenedRef.current = candidateId
    setSelectedId(candidateId)
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    apiGet(`/api/owner-meaning-promotion-candidates/${encodeURIComponent(candidateId)}`)
      .then((res) => setDetail(res || null))
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[OwnerMeaningPromotionQueue] GET detail failed:', err)
        setDetailError('HESTIA could not open this promotion candidate. Nothing was changed.')
      })
      .finally(() => setDetailLoading(false))
  }, [])

  const closeCandidate = useCallback(() => {
    const opener = lastOpenedRef.current
    setSelectedId(null)
    setDetail(null)
    setDetailError(null)
    // Return focus to the row that opened the detail (predictable, never trapped).
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => rowRefs.current.get(opener)?.focus())
    } else {
      rowRefs.current.get(opener)?.focus()
    }
  }, [])

  // Move focus to the detail heading once it has rendered (after the detail GET resolves or errors).
  useEffect(() => {
    if (!selectedId) return
    if (detailLoading) return
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => detailHeadingRef.current?.focus())
    } else {
      detailHeadingRef.current?.focus()
    }
  }, [selectedId, detailLoading])

  // OWNER-ONLY: render nothing at all for any other (or missing) role.
  if (!isOwner) return null

  const rows = Array.isArray(list) ? list : []
  const totalCount = counts && typeof counts === 'object'
    ? Object.values(counts).reduce((sum, n) => sum + (Number(n) || 0), 0)
    : rows.length

  return (
    <details className="mt-6">
      <summary className={`flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 ${FOCUS_RING}`}
        style={{ border: `1px solid ${C.borderSub}`, background: C.card }}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>
          Meaning Promotion Queue · read-only
        </span>
        <span className="text-[11px]" style={{ color: C.text3 }}>
          {loading ? 'Loading…' : `${rows.length} ${rows.length === 1 ? 'candidate' : 'candidates'}`}
        </span>
      </summary>

      <div className="mt-3 rounded-2xl p-5 sm:p-6" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
        {/* Non-removable honesty framing. */}
        <Eyebrow>Promotion review · read-only inspection — no Venue DNA changes</Eyebrow>
        <p className="mt-2 text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
          {READONLY_NOTE}
        </p>

        {/* ── Detail (read-only) view ── */}
        {selectedId ? (
          <CandidateDetail
            detail={detail}
            loading={detailLoading}
            error={detailError}
            headingRef={detailHeadingRef}
            onClose={closeCandidate}
          />
        ) : (
          /* ── List view ── */
          <div className="mt-4">
            {/* Polite live region for the list fetch state. */}
            <div role="status" aria-live="polite" aria-atomic="true">
              {loading && <p className="text-[12px]" style={{ color: C.text3 }}>Reading the promotion queue…</p>}
              {!loading && error && (
                <p className="text-[12px] leading-relaxed" style={{ color: C.burgundy }}>{error}</p>
              )}
            </div>

            {!loading && error && (
              <button type="button" onClick={loadList}
                className={`mt-2 rounded-md px-1.5 py-0.5 text-[11px] underline ${FOCUS_RING}`} style={{ color: C.text3 }}>
                Retry loading the queue
              </button>
            )}

            {!loading && !error && rows.length === 0 && (
              <p className="mt-1 text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                No promotion candidates are queued yet. Owner meaning captures you save can later become
                promotion candidates for HESTIA to propose — but none have been queued for this venue.
                Nothing is generated here, and nothing changes Venue DNA.
              </p>
            )}

            {!loading && !error && rows.length > 0 && (
              <>
                {counts && typeof counts === 'object' && (
                  <div className="mt-1 flex flex-wrap gap-1.5" aria-label="Candidate counts by status">
                    {Object.entries(counts)
                      .filter(([, n]) => Number(n) > 0)
                      .map(([status, n]) => (
                        <span key={status} className="rounded-full px-2.5 py-0.5 text-[10px]"
                          style={{ border: `1px solid ${C.borderSub}`, background: C.card, color: C.text3 }}>
                          {STATUS_LABEL[status] || status}: {n}
                        </span>
                      ))}
                  </div>
                )}
                <p className="mt-2 text-[11px]" style={{ color: C.text3 }}>
                  {totalCount} {totalCount === 1 ? 'candidate' : 'candidates'} in this venue. Select one to inspect
                  its proposed change, evidence, and audit trail — read-only.
                </p>
                <ul className="mt-3 space-y-2.5">
                  {rows.map((c, i) => (
                    <CandidateRow
                      key={(c && c.id) || i}
                      candidate={c}
                      onOpen={openCandidate}
                      rowRef={(el) => { if (c && c.id) { if (el) rowRefs.current.set(c.id, el); else rowRefs.current.delete(c.id) } }}
                    />
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {/* Footer guardrail — the product truth, stated plainly. */}
        <p className="mt-6 border-t pt-3 text-[11px] leading-relaxed" style={{ borderColor: C.borderSub, color: C.text3 }}>
          This is a read-only review queue. There is no approve, reject, request-revision, or apply-to-DNA
          control here. Application is blocked, allowed actions are all unavailable, and nothing in this queue
          changes Venue DNA. Only a future, separately-reviewed owner workflow could ever act on a candidate.
        </p>
      </div>
    </details>
  )
}
