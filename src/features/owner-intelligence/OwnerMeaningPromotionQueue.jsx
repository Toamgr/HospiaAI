// OwnerMeaningPromotionQueue — Owner Meaning Promotion review surface (Slice 4H read + Slice 4M review).
//
// Exposes the promotion candidate queue to the OWNER as an inspection + DECISION depth layer. It shows
// PROPOSED changes, REFERENCED (never rewritten) owner evidence, BLOCKED application, and — new in 4M —
// lets the owner record a REVIEW DECISION on a reviewable candidate.
//
// It uses the already-shipped GET read routes plus the already-shipped owner-only review WRITE routes —
// it adds NO new backend behavior:
//   • GET  /api/owner-meaning-promotion-candidates                          → the paginated candidate queue
//   • GET  /api/owner-meaning-promotion-candidates/:candidateId             → one candidate + captures + events
//   • POST /api/owner-meaning-promotion-candidates/:candidateId/approve-meaning   → owner confirms HESTIA's reading
//   • POST /api/owner-meaning-promotion-candidates/:candidateId/reject            → owner declines the candidate
//   • POST /api/owner-meaning-promotion-candidates/:candidateId/request-revision  → owner asks for a reinterpretation
//
// CRITICAL PRODUCT TRUTH — stated plainly in the UI, non-removable:
//   • approve_meaning ≠ apply_to_dna. Approving the meaning confirms HESTIA understood the owner intent.
//     It does NOT change Venue DNA, does NOT apply anything, and does NOT unblock application.
//   • There is NO control here that applies a candidate to Venue DNA, proposes a DNA patch, files a
//     candidate as evidence only, promotes, or otherwise mutates Venue DNA — for any role. Application
//     stays BLOCKED (application.blocked: true) before and after every review decision. The UI says so,
//     and never implies DNA changed.
//   • The three review controls call ONLY the three existing owner-only review POST routes above. They
//     never touch Venue DNA and the component never calls the Venue DNA merge writer (it imports only
//     apiGet/apiPost).
//   • A candidate is reviewable ONLY while its status is draft_suggestion | needs_owner_review (mirrors
//     the server's own guard). A decided/terminal candidate is shown as decided; the server is the
//     authority and returns a safe 409 if a stale view tries to decide it again.
//   • OWNER ONLY. The backend blocks every non-owner role (admin included); this surface additionally
//     refuses to render for any role that is not exactly 'owner'.
//
// ACCESSIBILITY (matches the 4E.1/4E.2 bar): every control is a real <button> (no clickable divs);
// fetch + decision state is announced through polite live regions (role=status, aria-live=polite);
// opening a candidate moves focus to the detail heading, a successful decision returns focus to the
// detail heading (the action buttons may disappear), closing returns focus to the row that opened it;
// the detail region is labelled; the reject/revision text inputs are labelled.
//
// Palette B (Editorial Light) — matches the host OwnerAIHome surface (never mix palettes).

import { useCallback, useEffect, useRef, useState } from 'react'
import { apiGet, apiPost } from '../../services/api/client'

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

// Non-removable honesty framing — present in every non-loading state of this review surface.
const REVIEW_NOTE =
  'Owner review. You can confirm HESTIA understood a meaning, decline a candidate, or ask for a ' +
  'revision. These are proposed candidates HESTIA drew from your saved evidence — no review decision ' +
  'changes Venue DNA, nothing is applied, and application stays blocked.'

// The statuses from which an owner decision is legal (mirrors the server's reviewable guard, 4L).
const REVIEWABLE_STATUSES = new Set(['draft_suggestion', 'needs_owner_review'])

// The three live review actions → their route slugs. apply_to_dna / propose_dna_patch /
// mark_evidence_only are deliberately ABSENT — no such control exists in this slice.
const REVIEW_ROUTE_SLUG = {
  approve_meaning:  'approve-meaning',
  reject_candidate: 'reject',
  request_revision: 'request-revision',
}

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

// A single candidate row in the list — a button that opens the review detail. Communicates the
// status, target, confidence, timing, blocked application, and whether owner review is available.
function CandidateRow({ candidate, onOpen, rowRef }) {
  const c = candidate || {}
  const created = formatDateTime(c.created_at)
  const updated = formatDateTime(c.updated_at)
  const evidenceCount = c.evidence?.source_capture_count
  const reviewable = REVIEWABLE_STATUSES.has(c.status)
  return (
    <li>
      <button
        type="button"
        ref={rowRef}
        onClick={() => onOpen(c.id)}
        aria-label={`Open promotion candidate ${shortId(c.id)} for owner review — no Venue DNA changes`}
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
            style={{ border: `1px solid ${C.borderSub}`, color: reviewable ? C.burgundy : C.text3, background: C.card }}>
            {reviewable ? 'review available' : 'reviewed'}
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

// ── Owner review controls (Slice 4M) ────────────────────────────────────────────
//
// The owner's three live decisions on a REVIEWABLE candidate. approve_meaning is visually and textually
// distinct from any DNA application: it confirms interpretation only, never changes Venue DNA, and never
// unblocks application. There is intentionally no control here that applies a candidate to Venue DNA,
// proposes a DNA patch, or files it as evidence only. A decided candidate shows its recorded decision
// instead of controls.
function OwnerReviewControls({ candidate, busyAction, error, conflict, success, onReview }) {
  const status = candidate?.status
  const reviewable = REVIEWABLE_STATUSES.has(status)
  const decisionNote = candidate?.review?.owner_decision_note
  const reviewedAt = formatDateTime(candidate?.review?.reviewed_at)

  // Which inline form is open (deliberate, two-step — never an accidental one-tap decision).
  const [openForm, setOpenForm] = useState(null) // 'approve_meaning' | 'reject_candidate' | 'request_revision' | null
  const [rejectReason, setRejectReason] = useState('')
  const [revisionText, setRevisionText] = useState('')
  const busy = Boolean(busyAction)

  // After a successful decision the candidate is no longer reviewable — close any open form + clear inputs.
  useEffect(() => {
    if (success) { setOpenForm(null); setRejectReason(''); setRevisionText('') }
  }, [success])

  const rejectFieldId = `omp-review-reject-${candidate?.id || 'x'}`
  const revisionFieldId = `omp-review-revision-${candidate?.id || 'x'}`

  return (
    <div className="mt-5 border-t pt-4" style={{ borderColor: C.borderSub }}>
      <Eyebrow>Owner review · this does not change Venue DNA</Eyebrow>
      <p className="mt-1 text-[11px] leading-relaxed" style={{ color: C.text3 }}>
        Approving the meaning confirms HESTIA understood the owner intent. It does not apply anything to
        Venue DNA. Venue DNA remains unchanged, and application remains blocked until a future,
        separately-reviewed DNA promotion workflow exists.
      </p>

      {/* Decision outcome — announced politely, never stealing focus. Honest copy only: never implies DNA changed. */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {success === 'approve_meaning' && (
          <div className="mt-3 rounded-xl px-3.5 py-2.5" style={{ background: C.card, border: `1px solid ${C.borderEmp}` }}>
            <p className="text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
              <span aria-hidden="true">✓ </span>
              Meaning approved. HESTIA recorded that you confirmed its reading. Your Venue DNA is unchanged,
              and application remains blocked.
            </p>
          </div>
        )}
        {success === 'reject_candidate' && (
          <div className="mt-3 rounded-xl px-3.5 py-2.5" style={{ background: C.card, border: `1px solid ${C.borderEmp}` }}>
            <p className="text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
              <span aria-hidden="true">✓ </span>
              Candidate rejected. It will not advance. Venue DNA is unchanged.
            </p>
          </div>
        )}
        {success === 'request_revision' && (
          <div className="mt-3 rounded-xl px-3.5 py-2.5" style={{ background: C.card, border: `1px solid ${C.borderEmp}` }}>
            <p className="text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
              <span aria-hidden="true">✓ </span>
              Revision requested. HESTIA will reinterpret from your evidence. Venue DNA is unchanged.
            </p>
          </div>
        )}
        {conflict && (
          <div className="mt-3 rounded-xl px-3.5 py-2.5" style={{ background: C.inset, border: `1px dashed ${C.borderEmp}` }}>
            <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>
              This candidate was already decided or is no longer reviewable. Nothing was changed — reopen it to see its current state.
            </p>
          </div>
        )}
        {error && (
          <div className="mt-3 rounded-xl px-3.5 py-2.5" style={{ background: 'rgba(107,39,55,0.05)', border: `1px solid ${C.burgundy}` }}>
            <p className="text-[12px] leading-relaxed" style={{ color: C.burgundy }}>{error}</p>
          </div>
        )}
      </div>

      {reviewable ? (
        <div className="mt-3">
          {openForm === null && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Owner review decisions">
              <button
                type="button"
                onClick={() => setOpenForm('approve_meaning')}
                disabled={busy}
                className={`rounded-xl px-4 py-2 text-[12px] font-semibold transition ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-45`}
                style={{ border: `1px solid ${C.burgundy}`, color: C.burgundy, background: 'rgba(107,39,55,0.06)' }}
              >
                Approve meaning
              </button>
              <button
                type="button"
                onClick={() => setOpenForm('reject_candidate')}
                disabled={busy}
                className={`rounded-xl px-4 py-2 text-[12px] font-medium transition ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-45`}
                style={{ border: `1px solid ${C.borderEmp}`, color: C.text2, background: C.card }}
              >
                Reject candidate
              </button>
              <button
                type="button"
                onClick={() => setOpenForm('request_revision')}
                disabled={busy}
                className={`rounded-xl px-4 py-2 text-[12px] font-medium transition ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-45`}
                style={{ border: `1px solid ${C.borderEmp}`, color: C.text2, background: C.card }}
              >
                Request revision
              </button>
            </div>
          )}

          {/* Approve meaning — deliberate confirm. Approving the meaning only; not an application. */}
          {openForm === 'approve_meaning' && (
            <div className="mt-1 rounded-xl px-3.5 py-3" role="group" aria-label="Confirm approve meaning"
              style={{ background: C.card, border: `1px solid ${C.borderEmp}` }}>
              <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                Confirm that HESTIA understood the owner intent. This records your judgement of the reading
                only — it does not change Venue DNA, and application stays blocked.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onReview('approve_meaning', {})}
                  disabled={busy}
                  aria-busy={busyAction === 'approve_meaning'}
                  className={`rounded-xl px-4 py-2 text-[12px] font-semibold transition ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-45`}
                  style={{ border: `1px solid ${C.burgundy}`, color: C.burgundy, background: 'rgba(107,39,55,0.06)' }}
                >
                  {busyAction === 'approve_meaning' ? 'Approving…' : 'Approve meaning'}
                </button>
                <button type="button" onClick={() => setOpenForm(null)} disabled={busy}
                  className={`rounded-xl px-3 py-2 text-[12px] transition ${FOCUS_RING} disabled:opacity-45`}
                  style={{ color: C.text3 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reject — optional reason. */}
          {openForm === 'reject_candidate' && (
            <div className="mt-1 rounded-xl px-3.5 py-3" role="group" aria-label="Reject candidate"
              style={{ background: C.card, border: `1px solid ${C.borderEmp}` }}>
              <label htmlFor={rejectFieldId} className="text-[11px] font-medium" style={{ color: C.text2 }}>
                Why is this candidate wrong, irrelevant, or not useful? (optional)
              </label>
              <textarea
                id={rejectFieldId}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={busy}
                rows={3}
                placeholder="Optional — a short reason, kept for your audit trail."
                className="mt-1.5 w-full resize-none rounded-xl border px-3.5 py-2.5 text-[12px] leading-relaxed outline-none transition border-[#E0D8CC] focus:border-[#6B2737] focus:shadow-[0_0_0_3px_rgba(107,39,55,0.10)] disabled:opacity-60"
                style={{ background: C.card, color: C.text }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onReview('reject_candidate', { reason: rejectReason })}
                  disabled={busy}
                  aria-busy={busyAction === 'reject_candidate'}
                  className={`rounded-xl px-4 py-2 text-[12px] font-semibold transition ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-45`}
                  style={{ border: `1px solid ${C.burgundy}`, color: C.burgundy, background: 'rgba(107,39,55,0.06)' }}
                >
                  {busyAction === 'reject_candidate' ? 'Rejecting…' : 'Reject candidate'}
                </button>
                <button type="button" onClick={() => setOpenForm(null)} disabled={busy}
                  className={`rounded-xl px-3 py-2 text-[12px] transition ${FOCUS_RING} disabled:opacity-45`}
                  style={{ color: C.text3 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Request revision — revision text (required). */}
          {openForm === 'request_revision' && (
            <div className="mt-1 rounded-xl px-3.5 py-3" role="group" aria-label="Request revision"
              style={{ background: C.card, border: `1px solid ${C.borderEmp}` }}>
              <label htmlFor={revisionFieldId} className="text-[11px] font-medium" style={{ color: C.text2 }}>
                What should HESTIA reinterpret or clarify?
              </label>
              <textarea
                id={revisionFieldId}
                value={revisionText}
                onChange={(e) => setRevisionText(e.target.value)}
                disabled={busy}
                rows={3}
                placeholder="Tell HESTIA what to reconsider — it will reinterpret from your evidence."
                className="mt-1.5 w-full resize-none rounded-xl border px-3.5 py-2.5 text-[12px] leading-relaxed outline-none transition border-[#E0D8CC] focus:border-[#6B2737] focus:shadow-[0_0_0_3px_rgba(107,39,55,0.10)] disabled:opacity-60"
                style={{ background: C.card, color: C.text }}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onReview('request_revision', { revisionRequest: revisionText })}
                  disabled={busy || revisionText.trim().length === 0}
                  aria-busy={busyAction === 'request_revision'}
                  className={`rounded-xl px-4 py-2 text-[12px] font-semibold transition ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-45`}
                  style={{ border: `1px solid ${C.burgundy}`, color: C.burgundy, background: 'rgba(107,39,55,0.06)' }}
                >
                  {busyAction === 'request_revision' ? 'Requesting…' : 'Request revision'}
                </button>
                <button type="button" onClick={() => setOpenForm(null)} disabled={busy}
                  className={`rounded-xl px-3 py-2 text-[12px] transition ${FOCUS_RING} disabled:opacity-45`}
                  style={{ color: C.text3 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[11px] leading-relaxed" style={{ color: C.text3 }}>
          This candidate has been decided{STATUS_LABEL[status] ? ` — ${STATUS_LABEL[status].toLowerCase()}` : ''}
          {reviewedAt ? ` on ${reviewedAt}` : ''}. No further review actions are available. Venue DNA is
          unchanged and application remains blocked.
        </p>
      )}

      {decisionNote && (
        <p className="mt-3 text-[11px] leading-relaxed" style={{ color: C.text3 }}>
          <span className="font-semibold" style={{ color: C.text2 }}>Your note: </span>
          “{decisionNote}”
        </p>
      )}
    </div>
  )
}

// The review detail for one candidate: proposed diff, confidence + factors, contradictions, missing
// evidence, source evidence, audit timeline, owner review controls, and the blocked-application banner.
// Honest empty states everywhere — never a fabricated field.
function CandidateDetail({ detail, loading, error, headingRef, onClose, review }) {
  const candidate = detail?.candidate || null
  const sourceCaptures = Array.isArray(detail?.source_captures) ? detail.source_captures : []
  const events = Array.isArray(detail?.events) ? detail.events : []
  const factors = candidate?.confidence?.factors
  const contradictions = Array.isArray(candidate?.confidence?.contradictions) ? candidate.confidence.contradictions : []
  const missingEvidence = Array.isArray(candidate?.confidence?.missing_evidence) ? candidate.confidence.missing_evidence : []
  const before = renderValue(candidate?.current_value_snapshot_json)
  const after = renderValue(candidate?.proposed_value_json)
  const patch = renderValue(candidate?.proposed_dna_patch_json)

  return (
    <div className="mt-4" role="region" aria-label="Promotion candidate detail — owner review">
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

          {/* Blocked application — the most important truth, stated first and unchanged by any review decision. */}
          <div className="mt-3 rounded-xl px-3.5 py-2.5" style={{ background: 'rgba(107,39,55,0.05)', border: `1px solid ${C.burgundy}` }}>
            <p className="text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
              <span aria-hidden="true">⊘ </span>
              Application is blocked in this slice. {candidate.application?.block_reason || 'Venue DNA application is not enabled in this contract.'}{' '}
              Reviewing a candidate never changes that. Venue DNA is unchanged.
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

          {/* Contradictions — surfaced honestly, kept visible even after a decision. */}
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

          {/* Missing evidence — surfaced honestly, kept visible even after a decision. */}
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

          {/* Owner review controls — approve meaning / reject / request revision. Never a DNA application. */}
          <OwnerReviewControls
            candidate={candidate}
            busyAction={review?.busyAction || null}
            error={review?.error || null}
            conflict={Boolean(review?.conflict)}
            success={review?.success || null}
            onReview={review?.onReview || (() => {})}
          />
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

  // Owner review (4M) decision state for the open candidate.
  const [reviewBusyAction, setReviewBusyAction] = useState(null) // 'approve_meaning' | 'reject_candidate' | 'request_revision'
  const [reviewError, setReviewError] = useState(null)
  const [reviewConflict, setReviewConflict] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(null)        // the succeeded action key

  // Focus management: remember which row opened the detail so closing returns focus there; move focus
  // to the detail heading when it lands, and again after a successful decision (action buttons may go).
  const rowRefs = useRef(new Map())
  const detailHeadingRef = useRef(null)
  const lastOpenedRef = useRef(null)
  const pendingHeadingFocusRef = useRef(false)

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

  // Fetch one candidate's detail. keepCurrent=true (a post-decision refresh) keeps the panel mounted
  // and the prior detail visible until the fresh read resolves; the default (initial open) clears it.
  const fetchDetail = useCallback((candidateId, { keepCurrent = false } = {}) => {
    if (!keepCurrent) setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    return apiGet(`/api/owner-meaning-promotion-candidates/${encodeURIComponent(candidateId)}`)
      .then((res) => setDetail(res || null))
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[OwnerMeaningPromotionQueue] GET detail failed:', err)
        setDetailError('HESTIA could not open this promotion candidate. Nothing was changed.')
      })
      .finally(() => setDetailLoading(false))
  }, [])

  const openCandidate = useCallback((candidateId) => {
    lastOpenedRef.current = candidateId
    pendingHeadingFocusRef.current = true
    setSelectedId(candidateId)
    // Reset review decision state for the newly opened candidate.
    setReviewBusyAction(null)
    setReviewError(null)
    setReviewConflict(false)
    setReviewSuccess(null)
    fetchDetail(candidateId)
  }, [fetchDetail])

  const closeCandidate = useCallback(() => {
    const opener = lastOpenedRef.current
    setSelectedId(null)
    setDetail(null)
    setDetailError(null)
    setReviewBusyAction(null)
    setReviewError(null)
    setReviewConflict(false)
    setReviewSuccess(null)
    // Return focus to the row that opened the detail (predictable, never trapped).
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => rowRefs.current.get(opener)?.focus())
    } else {
      rowRefs.current.get(opener)?.focus()
    }
  }, [])

  // Submit ONE owner review decision via the matching existing review POST route. On success: refresh
  // the candidate detail (updated status + events + review fields) and the list (counts/status). NEVER
  // touches Venue DNA; the only writes are the three review POST routes.
  const submitReview = useCallback((action, { reason, revisionRequest } = {}) => {
    const slug = REVIEW_ROUTE_SLUG[action]
    if (!selectedId || !slug) return
    setReviewBusyAction(action)
    setReviewError(null)
    setReviewConflict(false)
    setReviewSuccess(null)

    const body = {}
    if (action === 'request_revision') {
      const text = (revisionRequest || '').trim()
      if (text) { body.reason = text; body.revision_request = text }
    } else {
      const note = (reason || '').trim()
      if (note) body.reason = note
    }

    return apiPost(`/api/owner-meaning-promotion-candidates/${encodeURIComponent(selectedId)}/${slug}`, body)
      .then(() => {
        setReviewSuccess(action)
        // Action buttons may disappear (candidate becomes non-reviewable) — move focus to the heading.
        pendingHeadingFocusRef.current = true
        return Promise.all([fetchDetail(selectedId, { keepCurrent: true }), loadList()])
      })
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[OwnerMeaningPromotionQueue] POST review failed:', err)
        if (err && err.status === 409) { setReviewConflict(true); return }
        if (err && err.status === 403) {
          setReviewError('Owner Meaning Promotion review is owner-only. Nothing was changed.')
          return
        }
        setReviewError('HESTIA could not record this review decision right now. Nothing was changed — please try again.')
      })
      .finally(() => setReviewBusyAction(null))
  }, [selectedId, fetchDetail, loadList])

  // Move focus to the detail heading once it has rendered, but ONLY when an open or a successful
  // decision requested it (consume the flag) — a passive re-fetch must not yank focus.
  useEffect(() => {
    if (!selectedId) return
    if (detailLoading) return
    if (!pendingHeadingFocusRef.current) return
    pendingHeadingFocusRef.current = false
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
          Meaning Promotion Queue · owner review
        </span>
        <span className="text-[11px]" style={{ color: C.text3 }}>
          {loading ? 'Loading…' : `${rows.length} ${rows.length === 1 ? 'candidate' : 'candidates'}`}
        </span>
      </summary>

      <div className="mt-3 rounded-2xl p-5 sm:p-6" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
        {/* Non-removable honesty framing. */}
        <Eyebrow>Promotion review · owner decisions — no Venue DNA changes</Eyebrow>
        <p className="mt-2 text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
          {REVIEW_NOTE}
        </p>

        {/* ── Detail (review) view ── */}
        {selectedId ? (
          <CandidateDetail
            detail={detail}
            loading={detailLoading}
            error={detailError}
            headingRef={detailHeadingRef}
            onClose={closeCandidate}
            review={{
              busyAction: reviewBusyAction,
              error: reviewError,
              conflict: reviewConflict,
              success: reviewSuccess,
              onReview: submitReview,
            }}
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
                  {totalCount} {totalCount === 1 ? 'candidate' : 'candidates'} in this venue. Select one to review
                  its proposed change, evidence, and audit trail — and record your decision.
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
          You can approve a meaning, reject a candidate, or request a revision here. None of these changes
          Venue DNA: approving a meaning confirms HESTIA's reading only, application stays blocked, and there
          is no control here that applies a candidate to Venue DNA. Only a future, separately-reviewed owner
          workflow could ever do that.
        </p>
      </div>
    </details>
  )
}
