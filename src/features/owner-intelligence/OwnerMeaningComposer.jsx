// OwnerMeaningComposer — Owner Meaning Capture, the first WRITE surface (Slice 4E; a11y/visual
// polish in Slice 4E.1).
//
// Lets the OWNER answer HESTIA's suggested meaning question in their own words and save that raw
// answer as owner EVIDENCE. It is the human-input companion to the read-only 4B preview in
// InterpretedCandidatesPanel — that panel stays display-only; the answer is collected HERE.
//
// It uses ONLY the existing, already-shipped routes — it adds NO new backend behavior:
//   • GET  /api/discovery-interpreted-candidates   → the live suggested question(s) to answer
//   • POST /api/owner-meaning-captures             → save the raw owner answer (owner-only)
//   • GET  /api/owner-meaning-captures             → the recent captured-evidence audit list
//   • GET  /api/owner-meaning-captures/:captureId  → one capture + its event trail (on expand)
//
// CRITICAL PRODUCT TRUTH — stated plainly in the UI, non-removable:
//   • A saved answer is OWNER EVIDENCE, raw and verbatim — NOT confirmed Venue DNA, NOT a HESTIA
//     interpretation, NOT a decision. HESTIA will use it as evidence later; it confirms nothing now.
//   • There is NO approve / promote / apply-to-DNA / confirm affordance here, for any role.
//   • The composer NEVER touches Venue DNA and NEVER calls mergeVenueDna. The only write it issues
//     is the single owner-only POST above. The client never supplies a venue id (the API client
//     sends the active-venue header; the server is the scope authority).
//   • OWNER ONLY. The backend blocks admin/manager; this surface also hides itself from any role
//     that is not exactly 'owner' (and when the role is missing/uncertain).
//
// ACCESSIBILITY (4E.1): the textarea has an associated label + aria-describedby (question +
// counter); the live region (role=status, aria-live=polite) announces save success/error without
// stealing focus; the over-limit state sets aria-invalid; every control has an explicit accessible
// name; the inspect toggle exposes aria-expanded/aria-controls; loading lines are announced once,
// politely; after a submit resolves, focus returns predictably to the textarea (never trapped).
//
// Palette B (Editorial Light) — matches the host OwnerAIHome surface (never mix palettes).

import { useEffect, useRef, useState, useCallback } from 'react'
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

// Stable element ids for label / description wiring (single composer instance per owner home).
const QUESTION_ID = 'owner-meaning-question'
const COUNTER_ID  = 'owner-meaning-counter'

// Shared keyboard focus-visible ring (premium, calm — a soft burgundy halo, never a neon outline).
const FOCUS_RING = 'focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(107,39,55,0.14)]'

// Mirrors the backend bound (OWNER_RESPONSE_RAW_MAX, counted in code points). The composer never
// rewrites, summarizes, or silently trims the owner's words — it only blocks an over-long submit.
const MAX_CHARS = 8000

// Non-removable honesty framing — present in every non-loading state of this write surface.
const FRAMING_LINE =
  'Your answer is saved as owner evidence — your exact words, kept raw. HESTIA will not treat it as ' +
  'confirmed Venue DNA yet, and it is not a HESTIA interpretation. It is recorded for audit and used ' +
  'as evidence later; nothing here is confirmed on its own.'

function codePointLength(str) { return [...String(str || '')].length }

function formatDateTime(value) {
  if (!value) return null
  const d = new Date(typeof value === 'string' && value.includes(' ') ? value.replace(' ', 'T') + 'Z' : value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: C.amber }}>
      {children}
    </div>
  )
}

// One recent capture — raw owner EVIDENCE, never "truth". Expands to the full stored context +
// event trail via the single-capture GET. candidate_snapshot is framed as "what HESTIA showed at
// the time", never as confirmed meaning.
function CaptureRow({ capture, expanded, detail, detailLoading, onToggle }) {
  const c = capture || {}
  const when = formatDateTime(c.created_at)
  const fp = String(c.candidate_fingerprint || '').slice(-8)
  const snapshot = detail && detail.candidate_snapshot
  const events = (detail && Array.isArray(detail.events)) ? detail.events : []
  const detailId = `owner-meaning-detail-${c.id || 'row'}`

  return (
    <li className="rounded-xl px-3.5 py-3" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: C.text3 }}>
            {when ? `Saved for audit · ${when}` : 'Saved for audit'} · not yet confirmed as Venue DNA
          </p>
          {c.question_text && (
            <p className="mt-1.5 text-[11px] italic leading-relaxed" style={{ color: C.text3 }}>
              In answer to: “{c.question_text}”
            </p>
          )}
          <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed" style={{ color: C.text }}>
            {c.owner_response_raw}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggle(c.id)}
          aria-expanded={expanded}
          aria-controls={detailId}
          aria-label={expanded
            ? `Hide saved evidence details${when ? ` from ${when}` : ''}`
            : `Inspect saved evidence details${when ? ` from ${when}` : ''}`}
          className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] underline ${FOCUS_RING}`}
          style={{ color: C.text3 }}
        >
          {expanded ? 'Hide' : 'Inspect'}
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]" style={{ color: C.text3 }}>
        <span className="rounded-full px-2 py-0.5" style={{ border: `1px solid ${C.borderSub}`, background: C.card }}>
          raw owner response
        </span>
        {fp && <span className="font-mono">fingerprint …{fp}</span>}
        {c.event_count != null && <span>· {c.event_count} audit {c.event_count === 1 ? 'event' : 'events'}</span>}
      </div>

      {expanded && (
        <div id={detailId} role="region" aria-label="Captured context and audit trail"
          className="mt-3 border-t pt-3" style={{ borderColor: C.borderSub }}>
          {detailLoading && <p role="status" className="text-[11px]" style={{ color: C.text3 }}>Reading captured context…</p>}
          {!detailLoading && detail && (
            <div className="space-y-3">
              <div>
                <Eyebrow>Full owner response</Eyebrow>
                <p className="mt-1 whitespace-pre-wrap text-[12px] leading-relaxed" style={{ color: C.text }}>
                  {detail.capture && detail.capture.owner_response_raw}
                </p>
              </div>
              {detail.capture && (detail.capture.question_text || detail.capture.question_reason) && (
                <div>
                  <Eyebrow>Question context</Eyebrow>
                  {detail.capture.question_text && (
                    <p className="mt-1 text-[12px] leading-relaxed" style={{ color: C.text2 }}>“{detail.capture.question_text}”</p>
                  )}
                  {detail.capture.question_reason && (
                    <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: C.text3 }}>Why HESTIA asked: {detail.capture.question_reason}</p>
                  )}
                </div>
              )}
              {snapshot && (
                <div>
                  <Eyebrow>What HESTIA showed at the time</Eyebrow>
                  {snapshot.interpretation_title && (
                    <p className="mt-1 text-[12px] leading-relaxed" style={{ color: C.text2 }}>{snapshot.interpretation_title}</p>
                  )}
                  {snapshot.interpretation_summary && (
                    <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: C.text3 }}>{snapshot.interpretation_summary}</p>
                  )}
                  <p className="mt-1 text-[10px] italic" style={{ color: C.text3 }}>
                    Captured context only — what was on screen when you answered. Not confirmed Venue DNA.
                  </p>
                </div>
              )}
              {events.length > 0 && (
                <div>
                  <Eyebrow>Audit trail · {events.length}</Eyebrow>
                  <ul className="mt-1 space-y-0.5">
                    {events.map((e, i) => (
                      <li key={(e && e.id) || i} className="font-mono text-[10px]" style={{ color: C.text3 }}>
                        {formatDateTime(e && e.created_at) || '—'} · {(e && e.event_type) || 'event'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  )
}

export default function OwnerMeaningComposer({ currentUser } = {}) {
  // OWNER-ONLY VISIBILITY. The backend already blocks every non-owner role (admin included); this
  // surface additionally refuses to render for any role that is not exactly 'owner', and when the
  // role is missing/uncertain — never a faked or partial composer. (Hook order is preserved: the
  // role gate is applied at render time, AFTER all hooks below, per the Rules of Hooks.)
  const isOwner = currentUser?.role === 'owner'

  const [candidates, setCandidates] = useState(null)
  const [activeConcept, setActiveConcept] = useState(null)
  const [candLoading, setCandLoading] = useState(false)
  const [candError, setCandError] = useState(null)

  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [captures, setCaptures] = useState(null)
  const [capturesLoading, setCapturesLoading] = useState(false)

  const [expandedId, setExpandedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Focus returns here predictably after a submit resolves (success or error) — never trapped.
  const textareaRef = useRef(null)

  // Load the live suggested questions (the answerable interpreted candidates). Read-only.
  const loadCandidates = useCallback(() => {
    setCandLoading(true)
    setCandError(null)
    return apiGet('/api/discovery-interpreted-candidates')
      .then((res) => {
        const list = (Array.isArray(res?.candidates) ? res.candidates : [])
          .filter((c) => c && c.suggested_owner_question && c.concept_ref)
        setCandidates(list)
        setActiveConcept((prev) => (list.some((c) => c.concept_ref === prev) ? prev : (list[0]?.concept_ref || null)))
      })
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[OwnerMeaningComposer] GET /api/discovery-interpreted-candidates failed:', err)
        setCandError('HESTIA could not load your suggested question right now. Nothing was changed.')
      })
      .finally(() => setCandLoading(false))
  }, [])

  // Load the recent captured-evidence audit list. Read-only.
  const loadCaptures = useCallback(() => {
    setCapturesLoading(true)
    return apiGet('/api/owner-meaning-captures?limit=10')
      .then((res) => setCaptures(Array.isArray(res?.captures) ? res.captures : []))
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[OwnerMeaningComposer] GET /api/owner-meaning-captures failed:', err)
        setCaptures([])
      })
      .finally(() => setCapturesLoading(false))
  }, [])

  useEffect(() => { if (isOwner) { loadCandidates(); loadCaptures() } }, [isOwner, loadCandidates, loadCaptures])

  const list = Array.isArray(candidates) ? candidates : []
  const active = list.find((c) => c.concept_ref === activeConcept) || list[0] || null

  const answerLen = codePointLength(answer)
  const tooLong = answerLen > MAX_CHARS
  const canSubmit = Boolean(active) && answer.trim().length > 0 && !tooLong && !submitting

  // Save the RAW owner answer verbatim. Minimal payload: concept_ref + owner_response_raw. No venue
  // id (the API client sends the active-venue header), no interpreted/confirmed-meaning field.
  const handleSubmit = useCallback(() => {
    if (!active || answer.trim().length === 0 || tooLong || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    apiPost('/api/owner-meaning-captures', { concept_ref: active.concept_ref, owner_response_raw: answer })
      .then(() => {
        setSubmitSuccess(true)
        setAnswer('')              // clear only AFTER a successful save
        return loadCaptures()      // refresh the recent evidence list
      })
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[OwnerMeaningComposer] POST /api/owner-meaning-captures failed:', err)
        setSubmitError('HESTIA could not save your answer right now. Nothing was changed — please try again.')
      })
      .finally(() => {
        setSubmitting(false)
        // Predictable focus return — after the re-render re-enables the field. Never a focus trap;
        // the live region announces the outcome independently of where focus lands.
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => textareaRef.current?.focus())
        else textareaRef.current?.focus()
      })
  }, [active, answer, tooLong, submitting, loadCaptures])

  // Expand one capture → fetch its full context + event trail (single GET). Collapse clears it.
  const toggleDetail = useCallback((captureId) => {
    if (expandedId === captureId) { setExpandedId(null); setDetail(null); return }
    setExpandedId(captureId)
    setDetail(null)
    setDetailLoading(true)
    apiGet(`/api/owner-meaning-captures/${encodeURIComponent(captureId)}`)
      .then((res) => setDetail(res || null))
      .catch((err) => {
        if (import.meta?.env?.DEV) console.error('[OwnerMeaningComposer] GET /api/owner-meaning-captures/:id failed:', err)
        setDetail(null)
      })
      .finally(() => setDetailLoading(false))
  }, [expandedId])

  // OWNER-ONLY: render nothing at all for any other (or missing) role.
  if (!isOwner) return null

  const recent = Array.isArray(captures) ? captures : []

  return (
    <details className="mt-6">
      <summary className={`flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 ${FOCUS_RING}`}
        style={{ border: `1px solid ${C.borderSub}`, background: C.card }}>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>
          Answer HESTIA · save owner evidence
        </span>
        <span className="text-[11px]" style={{ color: C.text3 }}>
          {candLoading ? 'Loading…' : (active ? '1 question ready' : 'no question ready')}
        </span>
      </summary>

      <div className="mt-3 rounded-2xl p-5 sm:p-6" style={{ background: C.inset, border: `1px solid ${C.borderSub}` }}>
        {/* Non-removable honesty framing. */}
        <Eyebrow>Owner evidence · your words, kept raw — not confirmed Venue DNA</Eyebrow>
        <p className="mt-2 text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
          {FRAMING_LINE}
        </p>

        {/* ── Suggested Question Area ── */}
        {candLoading && (
          <p role="status" className="mt-5 text-[12px]" style={{ color: C.text3 }}>Reading HESTIA’s suggested question…</p>
        )}

        {!candLoading && candError && (
          <div className="mt-5">
            <p role="status" className="text-[12px] leading-relaxed" style={{ color: C.burgundy }}>{candError}</p>
            <button type="button" onClick={loadCandidates}
              className={`mt-2 rounded-md px-1.5 py-0.5 text-[11px] underline ${FOCUS_RING}`} style={{ color: C.text3 }}>
              Retry loading the question
            </button>
          </div>
        )}

        {/* Honest empty state — never a fabricated question. */}
        {!candLoading && !candError && candidates && !active && (
          <p className="mt-5 text-[12px] leading-relaxed" style={{ color: C.text2 }}>
            No owner meaning question is ready yet. HESTIA only asks when your reviewed evidence raises a
            signal worth your words. Until then, there is nothing to answer here.
          </p>
        )}

        {/* Active question + composer. */}
        {!candLoading && !candError && active && (
          <div className="mt-5">
            {/* If more than one question is answerable, let the owner choose which to answer. */}
            {list.length > 1 && (
              <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Choose which question to answer">
                {list.map((c) => {
                  const selected = c.concept_ref === active.concept_ref
                  const tail = String(c.concept_ref).slice(-6)
                  return (
                    <button
                      key={c.concept_ref}
                      type="button"
                      onClick={() => { setActiveConcept(c.concept_ref); setSubmitSuccess(false); setSubmitError(null) }}
                      aria-pressed={selected}
                      aria-label={`Answer the question for concept ending ${tail}`}
                      className={`rounded-full px-2.5 py-1 text-[10px] transition ${FOCUS_RING}`}
                      style={selected
                        ? { border: `1px solid ${C.burgundy}`, color: C.burgundy, background: 'rgba(107,39,55,0.06)' }
                        : { border: `1px solid ${C.borderSub}`, color: C.text3, background: C.card }}
                    >
                      concept …{tail}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="rounded-xl px-3.5 py-3" style={{ background: C.card, border: `1px solid ${C.borderEmp}` }}>
              <Eyebrow>HESTIA would like to understand</Eyebrow>
              <p id={QUESTION_ID} className="mt-1.5 text-[13px] leading-relaxed" style={{ color: C.text }}>
                <span className="font-semibold" style={{ color: C.burgundy }}>HESTIA asks: </span>
                {active.suggested_owner_question}
              </p>
            </div>

            {/* ── Composer ── */}
            <div className="mt-3.5">
              <label htmlFor="owner-meaning-answer" className="sr-only">Your answer to HESTIA’s question, in your own words</label>
              <textarea
                id="owner-meaning-answer"
                ref={textareaRef}
                value={answer}
                onChange={(e) => { setAnswer(e.target.value); setSubmitSuccess(false); setSubmitError(null) }}
                disabled={submitting}
                rows={4}
                aria-describedby={`${QUESTION_ID} ${COUNTER_ID}`}
                aria-invalid={tooLong}
                placeholder="Answer in your own words — exactly how you’d say it. Your phrasing is kept as-is."
                className={`w-full resize-none rounded-xl border px-3.5 py-3 text-[13px] leading-relaxed outline-none transition border-[#E0D8CC] focus:border-[#6B2737] focus:shadow-[0_0_0_3px_rgba(107,39,55,0.10)] disabled:opacity-60`}
                style={{ background: C.card, color: C.text }}
              />
              <div className="mt-1.5 flex items-center justify-between gap-3">
                <span id={COUNTER_ID} className="text-[10px] tabular-nums" style={{ color: tooLong ? C.burgundy : C.text3 }}>
                  {tooLong ? `Too long — ${answerLen} / ${MAX_CHARS} characters` : `${answerLen} / ${MAX_CHARS} characters`}
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  aria-busy={submitting}
                  className={`rounded-xl px-5 py-2 text-[12px] font-semibold transition ${FOCUS_RING} disabled:cursor-not-allowed disabled:opacity-45`}
                  style={{ border: `1px solid ${C.burgundy}`, color: C.burgundy, background: 'rgba(107,39,55,0.06)' }}
                >
                  {submitting ? 'Saving…' : 'Save as owner evidence'}
                </button>
              </div>

              {/* Live region — announces save outcome politely without stealing focus. Always present
                  so assistive tech registers it before a message appears. Honest copy only: never an
                  interpretation, never an optimistic DNA update. */}
              <div role="status" aria-live="polite" aria-atomic="true">
                {submitSuccess && (
                  <div className="mt-2.5 rounded-xl px-3.5 py-2.5" style={{ background: C.card, border: `1px solid ${C.borderEmp}` }}>
                    <p className="text-[12px] font-medium leading-relaxed" style={{ color: C.burgundy }}>
                      <span aria-hidden="true">✓ </span>
                      Saved as owner evidence. HESTIA recorded your words for audit — nothing was confirmed as Venue DNA.
                    </p>
                  </div>
                )}
                {submitError && (
                  <div className="mt-2.5 rounded-xl px-3.5 py-2.5" style={{ background: 'rgba(107,39,55,0.05)', border: `1px solid ${C.burgundy}` }}>
                    <p className="text-[12px] leading-relaxed" style={{ color: C.burgundy }}>{submitError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Recent Captures / Audit Preview ── */}
        <div className="mt-7 border-t pt-4" style={{ borderColor: C.borderSub }}>
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Recent owner evidence · saved for audit</Eyebrow>
            <span className="text-[10px]" style={{ color: C.text3 }}>
              {capturesLoading ? 'Loading…' : `${recent.length} recent`}
            </span>
          </div>

          {!capturesLoading && recent.length === 0 && (
            <p className="mt-3 text-[12px] leading-relaxed" style={{ color: C.text2 }}>
              No owner evidence saved yet. Answers you save will appear here as raw, auditable evidence —
              never as confirmed Venue DNA.
            </p>
          )}

          {recent.length > 0 && (
            <ul className="mt-3 space-y-2.5">
              {recent.map((cap, i) => (
                <CaptureRow
                  key={(cap && cap.id) || i}
                  capture={cap}
                  expanded={expandedId === (cap && cap.id)}
                  detail={expandedId === (cap && cap.id) ? detail : null}
                  detailLoading={detailLoading && expandedId === (cap && cap.id)}
                  onToggle={toggleDetail}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer guardrail — the product truth, stated plainly. */}
        <p className="mt-6 border-t pt-3 text-[11px] leading-relaxed" style={{ borderColor: C.borderSub, color: C.text3 }}>
          Saved answers are raw owner evidence. HESTIA will use them as evidence later — it does not confirm
          them, promote them, or change Venue DNA here. Only a human ever confirms Venue DNA.
        </p>
      </div>
    </details>
  )
}
