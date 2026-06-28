#!/usr/bin/env node
/**
 * Deterministic service/persistence tests for the Owner Meaning Promotion OWNER REVIEW ACTION
 * runtime (Slice 4L): approve_meaning / reject_candidate / request_revision.
 *
 * In-memory node:sqlite DatabaseSync(':memory:') + the exported DDL constants — no real DB, no
 * server boot, no network, no AI. Source captures are seeded through the REAL capture writer and
 * candidates through the REAL generation writer (so review runs against real generated rows).
 * Exits 0 on pass, 1 on failure.
 *
 * Covers (per OWNER_MEANING_PROMOTION_OWNER_REVIEW_ACTION_CONTRACT.md §5/§7/§8/§12/§13):
 *   • approve updates status → owner_approved + appends owner_approved event (action: approve_meaning);
 *   • reject  updates status → owner_rejected + appends owner_rejected event (action: reject_candidate);
 *   • request-revision → revision_requested + owner_requested_revision event (action: request_revision);
 *   • event payload carries action, reason, previous_status, next_status; actor is owner + user id;
 *   • application.blocked STAYS true after every action (approve_meaning ≠ apply_to_dna);
 *   • allowed_actions remain non-DNA/non-application (read shape stays blocked);
 *   • invalid transitions (decide an already-decided / parked candidate) throw CONFLICT — no dup event;
 *   • missing ids / unknown action throw BAD_REQUEST; cross-venue / unknown candidate throws NOT_FOUND;
 *   • client cannot widen venue scope; no Venue DNA table is ever written.
 *
 * Run: node scripts/test-owner-meaning-promotion-review-persistence.js
 */

import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'

Promise.all([
  import('../src/services/venueIntelligence/ownerMeaningPromotionReviewService.js'),
  import('../src/services/venueIntelligence/ownerMeaningPromotionGenerationService.js'),
  import('../src/services/venueIntelligence/ownerMeaningPromotionService.js'),
  import('../src/services/venueIntelligence/ownerMeaningCaptureService.js'),
])
  .then(([review, gen, promo, capture]) => runTests(review, gen, promo, capture))
  .catch(err => { console.error('\n[FAIL] Could not import services:', err.message); process.exit(1) })

function runTests(review, gen, promo, capture) {
  const {
    applyOwnerMeaningPromotionReviewAction,
    approveOwnerMeaningPromotionCandidateMeaning,
    rejectOwnerMeaningPromotionCandidate,
    requestRevisionOwnerMeaningPromotionCandidate,
  } = review
  const { generateOwnerMeaningPromotionCandidate } = gen
  const {
    OWNER_MEANING_PROMOTION_CANDIDATES_DDL, OWNER_MEANING_PROMOTION_EVENTS_DDL,
    getOwnerMeaningPromotionCandidateById, listOwnerMeaningPromotionEvents,
  } = promo
  const { OWNER_MEANING_CAPTURES_DDL, OWNER_MEANING_CAPTURE_EVENTS_DDL, createOwnerMeaningCapture } = capture

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }
  function throwsCode(fn, code) { try { fn(); return false } catch (e) { return e && e.code === code } }

  console.log('\n\x1b[1mHESTIA Owner Meaning Promotion — Owner Review Action Persistence Tests\x1b[0m\n')

  const VENUE_A = 'venue_A', VENUE_B = 'venue_B'
  const OWNER = { id: 'owner_1', role: 'owner' }

  const db = new DatabaseSync(':memory:')
  db.exec(OWNER_MEANING_PROMOTION_CANDIDATES_DDL)
  db.exec(OWNER_MEANING_PROMOTION_EVENTS_DDL)
  db.exec(OWNER_MEANING_CAPTURES_DDL)
  db.exec(OWNER_MEANING_CAPTURE_EVENTS_DDL)

  const evtCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_promotion_events').get().n
  const statusOf = (id, venue = VENUE_A) => db.prepare('SELECT status FROM owner_meaning_promotion_candidates WHERE id = ? AND venue_id = ?').get(id, venue)?.status

  function seedCapture(venueId, response) {
    const concept = randomUUID()
    const cand = {
      candidate_id: randomUUID(), venue_id: venueId, source_record_space: 'concept_draft',
      concept_ref: concept, destination_hint: null,
      created_from_summary_version: 'derived-live@2026-06-28T00:00:00.000Z',
      candidate_type: 'missing_data_signal', status: 'insufficient_evidence',
      interpretation_title: 'Possible signal', interpretation_summary: 'Saved meaning kept.',
      supporting_evidence_refs: [{ review_id: randomUUID(), concept_ref: concept, review_action: 'captured', confidence_band: null }],
      conflicting_evidence_refs: [], missing_evidence: ['No corroboration yet.'], uncertainty_notes: ['Suspicion only.'],
      confidence_band: null, suggested_owner_question: 'Does this belong to the venue identity?',
    }
    return createOwnerMeaningCapture(db, { venueId, conceptRef: concept, ownerResponseRaw: response, candidate: cand, createdBy: 'Tal Millo' })
  }
  // Seed a generated candidate in a venue, return its id.
  function seedCandidate(venueId, response) {
    const cap = seedCapture(venueId, response)
    const r = generateOwnerMeaningPromotionCandidate(db, { venueId, captureId: cap.id })
    if (!r.created) throw new Error('seed candidate not created: ' + JSON.stringify(r))
    return r.candidate.id
  }

  // ── approve_meaning ───────────────────────────────────────────────────────────
  section('approve_meaning → owner_approved (NOT applied)')
  const cApprove = seedCandidate(VENUE_A, 'We host guests, not customers — a candlelit, spirit-forward room.')
  assert('generated candidate starts reviewable (draft_suggestion)', statusOf(cApprove) === 'draft_suggestion')
  const eBefore = evtCount()
  const rApprove = approveOwnerMeaningPromotionCandidateMeaning(db, { venueId: VENUE_A, candidateId: cApprove, actor: OWNER, reason: 'Yes — that is exactly what I meant.' })
  assert('approve returns action approve_meaning', rApprove.action === 'approve_meaning')
  assert('approve sets previous/next status', rApprove.previousStatus === 'draft_suggestion' && rApprove.nextStatus === 'owner_approved')
  assert('status persisted as owner_approved', statusOf(cApprove) === 'owner_approved')
  assert('exactly one event appended', evtCount() === eBefore + 1)
  assert('application.blocked STAYS true after approve_meaning (approve ≠ apply)', rApprove.candidate.application.blocked === true)
  assert('reserved applied_* fields still null after approve', rApprove.candidate.application.applied_at === null && rApprove.candidate.application.dna_application_ref === null)
  assert('review fields recorded (reviewed_by + approved_at)',
    rApprove.candidate.review.reviewed_by_user_id === OWNER.id && rApprove.candidate.review.approved_at !== null && rApprove.candidate.review.rejected_at === null)
  assert('owner_decision_note stored', rApprove.candidate.review.owner_decision_note === 'Yes — that is exactly what I meant.')

  const apEvents = listOwnerMeaningPromotionEvents(db, VENUE_A, cApprove)
  const apEvt = apEvents.find(e => e.event_type === 'owner_approved')
  assert('owner_approved event appended', !!apEvt)
  assert('event payload carries action approve_meaning + reason', apEvt.event_payload_json.action === 'approve_meaning' && apEvt.event_payload_json.reason === 'Yes — that is exactly what I meant.')
  assert('event payload carries previous/next status', apEvt.event_payload_json.previous_status === 'draft_suggestion' && apEvt.event_payload_json.next_status === 'owner_approved')
  assert('event payload marks application_blocked true', apEvt.event_payload_json.application_blocked === true)
  assert('event actor is owner (distinguishable from generation)', apEvt.actor_type === 'owner')
  const apRaw = db.prepare("SELECT * FROM owner_meaning_promotion_events WHERE candidate_id = ? AND event_type='owner_approved'").get(cApprove)
  assert('event venue-scoped + owner user id recorded', apRaw.venue_id === VENUE_A && apRaw.actor_user_id === OWNER.id && apRaw.actor_role === 'owner')
  assert('event records target_path + source captures', apRaw.target_path === 'owner_notes' && typeof apRaw.source_capture_ids_json === 'string')

  // ── reject_candidate ────────────────────────────────────────────────────────────
  section('reject_candidate → owner_rejected')
  const cReject = seedCandidate(VENUE_A, 'The bar should lead the menu identity, full stop.')
  const rReject = rejectOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A, candidateId: cReject, actor: OWNER, reason: 'Not relevant.' })
  assert('reject returns action reject_candidate', rReject.action === 'reject_candidate')
  assert('status persisted as owner_rejected', statusOf(cReject) === 'owner_rejected')
  assert('application.blocked stays true after reject', rReject.candidate.application.blocked === true)
  assert('rejected_at set, approved_at null', rReject.candidate.review.rejected_at !== null && rReject.candidate.review.approved_at === null)
  const rjEvt = listOwnerMeaningPromotionEvents(db, VENUE_A, cReject).find(e => e.event_type === 'owner_rejected')
  assert('owner_rejected event appended w/ action reject_candidate', rjEvt && rjEvt.event_payload_json.action === 'reject_candidate')

  // ── request_revision ──────────────────────────────────────────────────────────
  section('request_revision → revision_requested')
  const cRev = seedCandidate(VENUE_A, 'Service should feel warm but unobtrusive, never scripted.')
  const rRev = requestRevisionOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A, candidateId: cRev, actor: OWNER, reason: 'Re-read this.', revisionRequest: 'Focus on the warmth, not the speed.' })
  assert('request-revision returns action request_revision', rRev.action === 'request_revision')
  assert('status persisted as revision_requested', statusOf(cRev) === 'revision_requested')
  assert('application.blocked stays true after request-revision', rRev.candidate.application.blocked === true)
  const rvEvt = listOwnerMeaningPromotionEvents(db, VENUE_A, cRev).find(e => e.event_type === 'owner_requested_revision')
  assert('owner_requested_revision event appended w/ action + revision_request',
    rvEvt && rvEvt.event_payload_json.action === 'request_revision' && rvEvt.event_payload_json.revision_request === 'Focus on the warmth, not the speed.')
  // request_revision does NOT generate a new candidate in this slice.
  assert('request_revision did not create a superseding candidate', db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_promotion_candidates WHERE venue_id = ?').get(VENUE_A).n === 3)

  // ── invalid transitions → CONFLICT (no duplicate events) ────────────────────────
  section('invalid transitions are blocked (safe conflict, no duplicate events)')
  const evBeforeConflict = evtCount()
  assert('approve on an already-approved candidate → CONFLICT',
    throwsCode(() => approveOwnerMeaningPromotionCandidateMeaning(db, { venueId: VENUE_A, candidateId: cApprove, actor: OWNER }), 'CONFLICT'))
  assert('reject on an already-approved candidate → CONFLICT',
    throwsCode(() => rejectOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A, candidateId: cApprove, actor: OWNER }), 'CONFLICT'))
  assert('approve on a rejected candidate → CONFLICT (rejected cannot be approved)',
    throwsCode(() => approveOwnerMeaningPromotionCandidateMeaning(db, { venueId: VENUE_A, candidateId: cReject, actor: OWNER }), 'CONFLICT'))
  assert('approve on a revision_requested candidate → CONFLICT (parked, not reviewable)',
    throwsCode(() => approveOwnerMeaningPromotionCandidateMeaning(db, { venueId: VENUE_A, candidateId: cRev, actor: OWNER }), 'CONFLICT'))
  assert('no event rows written by any blocked transition', evtCount() === evBeforeConflict)
  assert('approved candidate stays owner_approved after blocked retries', statusOf(cApprove) === 'owner_approved')

  // ── input validation + venue scope ──────────────────────────────────────────────
  section('input validation + venue scope')
  assert('missing venueId → BAD_REQUEST', throwsCode(() => applyOwnerMeaningPromotionReviewAction(db, { candidateId: cApprove, action: 'approve_meaning' }), 'BAD_REQUEST'))
  assert('missing candidateId → BAD_REQUEST', throwsCode(() => applyOwnerMeaningPromotionReviewAction(db, { venueId: VENUE_A, action: 'approve_meaning' }), 'BAD_REQUEST'))
  assert('unknown action → BAD_REQUEST', throwsCode(() => applyOwnerMeaningPromotionReviewAction(db, { venueId: VENUE_A, candidateId: cApprove, action: 'apply_to_dna' }), 'BAD_REQUEST'))
  assert('unknown candidate → NOT_FOUND', throwsCode(() => approveOwnerMeaningPromotionCandidateMeaning(db, { venueId: VENUE_A, candidateId: randomUUID(), actor: OWNER }), 'NOT_FOUND'))

  const cB = seedCandidate(VENUE_B, 'Venue B private — must never be reviewable from A.')
  const crossBefore = evtCount()
  assert('cross-venue candidate cannot be reviewed (A cannot decide B) → NOT_FOUND',
    throwsCode(() => approveOwnerMeaningPromotionCandidateMeaning(db, { venueId: VENUE_A, candidateId: cB, actor: OWNER }), 'NOT_FOUND'))
  assert('cross-venue attempt wrote nothing', evtCount() === crossBefore)
  assert('venue_B candidate is untouched (still reviewable in its own venue)', statusOf(cB, VENUE_B) === 'draft_suggestion')
  assert('venue_B owner CAN decide its own candidate', approveOwnerMeaningPromotionCandidateMeaning(db, { venueId: VENUE_B, candidateId: cB, actor: OWNER }).nextStatus === 'owner_approved')

  // ── no Venue DNA mutation ────────────────────────────────────────────────────────
  section('no Venue DNA mutation')
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name)
  assert('no venue DNA table created by the review writer',
    !tables.some(n => /venue_dna|venue_intelligence|venue_briefs|venue_dna_enrichment/.test(n)))
  assert('detail read still reports application blocked for a decided candidate',
    getOwnerMeaningPromotionCandidateById(db, VENUE_A, cApprove).application.blocked === true)

  console.log('\n──────────────────────────────────────────')
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) { console.log('\x1b[31m[FAIL]\x1b[0m'); process.exit(1) }
  console.log('\x1b[32m[PASS] All tests passed.\x1b[0m')
  try { db.close() } catch { /* in-memory */ }
  process.exit(0)
}
