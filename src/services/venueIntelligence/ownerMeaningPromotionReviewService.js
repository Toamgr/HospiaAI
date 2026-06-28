// Owner Meaning Promotion — Owner Review Action Runtime (Slice 4L).
//
// The FIRST runtime owner DECISION writer for the promotion layer. It records the owner's judgement
// of an already-generated promotion candidate (owner_meaning_promotion_candidates) and appends its
// append-only audit event (owner_meaning_promotion_events). It is the writer behind STAGE 3 (approval)
// of the 4F four-stage model (capture → proposal → approval → application).
//
// Three owner-only review actions:
//   - approve_meaning   → status owner_approved        , event owner_approved
//   - reject_candidate  → status owner_rejected        , event owner_rejected
//   - request_revision  → status revision_requested    , event owner_requested_revision
//
// Governing docs (binding, in precedence order):
//   docs/architecture/OWNER_MEANING_PROMOTION_OWNER_REVIEW_ACTION_CONTRACT.md  (4K — review doctrine)
//   docs/architecture/OWNER_MEANING_PROMOTION_REVIEW_DESIGN.md                 (4F — doctrine)
//   docs/architecture/VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md          (DNA application deferral)
//   docs/architecture/OWNER_MEANING_PROMOTION_DDL_CONTRACT.md                  (4F.1 — exact DDL / vocabulary)
//   docs/architecture/OWNER_MEANING_PROMOTION_READ_API_CONTRACT.md             (4F.2 — read shapes)
//
// HARD DOCTRINE (enforced by design — if a line here contradicts it, it is a bug):
//   - CORE PRINCIPLE: approve_meaning ≠ apply_to_dna. Approving the MEANING records that the owner
//     agrees with HESTIA's reading; it is NOT a DNA write. application.blocked STAYS true after every
//     review action; allowed_actions for DNA/application stay false/unavailable.
//   - This writer NEVER mutates Venue DNA. It imports NOTHING DNA-related, NEVER calls mergeVenueDna,
//     and NEVER writes venue_dna_json / venue_intelligence / venue_briefs / venue_dna_enrichment /
//     venue_intelligence_candidates. (Asserted by audit test.)
//   - It writes ONLY the two promotion tables: it UPDATEs the candidate's review state and INSERTs an
//     append-only event. It NEVER applies, NEVER proposes a DNA patch, NEVER marks evidence-only
//     (those are deferred to future DDL slices), and NEVER writes (or re-writes) owner_meaning_captures.
//   - It uses ONLY the existing 4F.1 status + event vocabulary — NO new status, NO new event_type,
//     NO DDL/CHECK change. The finer action semantics live in the event payload's `action`.
//   - venue_id is the ACCESS BOUNDARY only — server-resolved, never client-supplied. A candidate from
//     another venue is unreachable (scoped SELECT → safe NOT_FOUND); a client venue_id never widens scope.
//   - OWNER-ONLY at the route layer (requireAuth('owner') + in-handler admin re-exclusion). A decision
//     event carries actor_type 'owner' with the owner's user id, so it stays distinguishable from a
//     generation event (actor_type 'hestia_suggestion' / null user id).
//   - Only a REVIEWABLE candidate (draft_suggestion | needs_owner_review) can be decided. A terminal /
//     already-decided / parked candidate → CONFLICT (the route maps to 409). A repeated decision on an
//     already-decided candidate is therefore a safe 409, never an uncontrolled duplicate event.
//   - AUDIT-FIRST ordering is load-bearing (mirrors the capture/generation writers): the decision event
//     is inserted BEFORE the candidate row is updated. node:sqlite has no db.transaction(); consistency
//     comes from this ordering, not a wrapper. An orphan audit row after a failed candidate update is
//     benign; an un-audited state change is a bug.
//
// Deterministic. No AI, no prompts, no network. Dependency-injected db (node:sqlite compatible).

import { randomUUID } from 'node:crypto'
import {
  OWNER_MEANING_PROMOTION_SCHEMA_VERSION,
  OWNER_MEANING_PROMOTION_RECORD_SPACE,
  getOwnerMeaningPromotionCandidateById,
} from './ownerMeaningPromotionService.js'

// ── Review action vocabulary (maps to existing 4F.1 status/event vocabulary only) ─────────────

// The candidate statuses from which an owner decision is legal (4K §5). A generated candidate is at
// 'draft_suggestion' (4J); 'needs_owner_review' is also reviewable if a future surfacing step sets it.
export const OWNER_MEANING_PROMOTION_REVIEWABLE_STATUSES = Object.freeze([
  'draft_suggestion',
  'needs_owner_review',
])

// Each owner review action maps to ONE existing 4F.1 status + ONE existing 4F.1 event type. The finer
// semantics (approve_meaning vs a future apply-approval) live in the event payload `action`, NOT in a
// new status/event_type — per 4K §8 (event vocabulary expansion is a separate reviewed DDL slice).
export const OWNER_MEANING_PROMOTION_REVIEW_ACTIONS = Object.freeze({
  approve_meaning: { nextStatus: 'owner_approved', eventType: 'owner_approved' },
  reject_candidate: { nextStatus: 'owner_rejected', eventType: 'owner_rejected' },
  request_revision: { nextStatus: 'revision_requested', eventType: 'owner_requested_revision' },
})

// Actor class for an owner DECISION event (4F.1 §4.1) — distinguishable from a generation event.
export const OWNER_MEANING_PROMOTION_REVIEW_ACTOR_TYPE = 'owner'

// ── small helpers (pure) ──────────────────────────────────────────────────────

function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0 }
function serializeJson(v) { return v === undefined ? null : JSON.stringify(v) }
function badRequest(message) { const e = new Error(message); e.code = 'BAD_REQUEST'; return e }
function notFound(message) { const e = new Error(message); e.code = 'NOT_FOUND'; return e }
function conflict(message) { const e = new Error(message); e.code = 'CONFLICT'; return e }

// A short, trimmed owner-supplied note (or null). Free text — the ONLY owner-supplied field on a
// decision (4F.1 §3.1 owner_decision_note). Never interpreted as DNA, never applied.
function cleanNote(v) {
  if (!isNonEmptyString(v)) return null
  return v.trim()
}

// ── Candidate read (venue-scoped, record_space-scoped) ─────────────────────────

// Load the raw candidate row for a review decision, venue-scoped + record_space-scoped. A cross-venue
// or unknown id resolves to undefined (the route turns it into a safe 404 — no foreign read, no leak).
function loadCandidateInVenue(db, venueId, candidateId) {
  return db.prepare(
    'SELECT id, venue_id, status, proposed_target_path, source_capture_ids_json ' +
    'FROM owner_meaning_promotion_candidates WHERE id = ? AND venue_id = ? AND record_space = ?'
  ).get(candidateId, venueId, OWNER_MEANING_PROMOTION_RECORD_SPACE)
}

// ── The review writer (shared core) ─────────────────────────────────────────────

/**
 * Apply ONE owner review decision to ONE generated promotion candidate. Owner-triggered at the route
 * layer; NEVER Venue DNA. Deterministic and conservative.
 *
 * Behavior:
 *   - missing/blank venueId / candidateId / unknown action → throws BAD_REQUEST (route → 400)
 *   - candidate not resolvable in-venue                    → throws NOT_FOUND   (route → 404)
 *   - candidate not in a reviewable status                 → throws CONFLICT    (route → 409)
 *   - otherwise                                            → { action, candidate:<updated>, previousStatus, nextStatus }
 *
 * application.blocked STAYS true on the returned candidate; no DNA is read or written; no mergeVenueDna.
 *
 * @param db
 * @param params { venueId, candidateId, action, actor?:{ id, role }, reason?, revisionRequest? }
 * @returns { action, candidate, previousStatus, nextStatus }
 */
export function applyOwnerMeaningPromotionReviewAction(db, params = {}) {
  const { venueId, candidateId, action, actor, reason, revisionRequest } = params

  if (!isNonEmptyString(venueId)) throw badRequest('ownerMeaningPromotionReview: venueId is required.')
  if (!isNonEmptyString(candidateId)) throw badRequest('ownerMeaningPromotionReview: candidateId is required.')
  const mapping = OWNER_MEANING_PROMOTION_REVIEW_ACTIONS[action]
  if (!mapping) throw badRequest(`ownerMeaningPromotionReview: unknown review action: ${String(action)}.`)

  // Candidate load — venue-scoped. Cross-venue / unknown → safe NOT_FOUND (zero writes).
  const candidate = loadCandidateInVenue(db, venueId, candidateId.trim())
  if (!candidate) throw notFound('ownerMeaningPromotionReview: no promotion candidate found for this venue.')

  // Transition guard — only a REVIEWABLE candidate can be decided. A terminal / already-decided /
  // parked candidate is a safe CONFLICT (409). This makes a repeated decision a 409, never a dup event.
  const previousStatus = candidate.status
  if (!OWNER_MEANING_PROMOTION_REVIEWABLE_STATUSES.includes(previousStatus)) {
    throw conflict(`ownerMeaningPromotionReview: candidate is not reviewable (status: ${previousStatus}).`)
  }
  const nextStatus = mapping.nextStatus

  const note = cleanNote(reason)
  const revisionReq = cleanNote(revisionRequest)
  const actorUserId = actor && isNonEmptyString(actor.id) ? actor.id : null
  const actorRole = actor && isNonEmptyString(actor.role) ? actor.role : null
  const targetPath = candidate.proposed_target_path || null
  const sourceCaptureIdsJson = candidate.source_capture_ids_json || null
  const eventPayload = {
    action,                      // approve_meaning | reject_candidate | request_revision (finer semantics here)
    reason: note,                // owner free text, or null
    ...(revisionReq ? { revision_request: revisionReq } : {}),
    previous_status: previousStatus,
    next_status: nextStatus,
    application_blocked: true,   // an owner decision NEVER unblocks DNA application
  }
  const idempotencyKey = `omp_review:${action}:${candidate.id}`

  // ── STEP 1 — AUDIT-FIRST. candidate_id is a LOGICAL ref (no enforced FK). This INSERT precedes the
  //    candidate UPDATE; an orphan event after a failed update is benign. Owner decision → actor_type
  //    'owner' + the owner's user id (distinguishable from a generation event). ──
  db.prepare(`
    INSERT INTO owner_meaning_promotion_events
      (id, venue_id, candidate_id, event_type, actor_type, actor_user_id, actor_role,
       event_payload_json, previous_status, next_status, target_path, source_capture_ids_json,
       idempotency_key, schema_version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(), venueId, candidate.id,
    mapping.eventType,
    OWNER_MEANING_PROMOTION_REVIEW_ACTOR_TYPE,
    actorUserId, actorRole,
    JSON.stringify(eventPayload),
    previousStatus, nextStatus,
    targetPath, sourceCaptureIdsJson,
    idempotencyKey,
    OWNER_MEANING_PROMOTION_SCHEMA_VERSION,
  )

  // ── STEP 2 — UPDATE the candidate's review state. Only review columns change: status, the owner
  //    decision record, and the decision timestamp(s). application stays blocked (the reserved
  //    applied_*/dna_application_ref fields are NEVER touched here). updated_at touched. ──
  const approvedAtSql = action === 'approve_meaning' ? 'CURRENT_TIMESTAMP' : 'approved_at'
  const rejectedAtSql = action === 'reject_candidate' ? 'CURRENT_TIMESTAMP' : 'rejected_at'
  db.prepare(`
    UPDATE owner_meaning_promotion_candidates
       SET status = ?,
           owner_decision_note = ?,
           reviewed_by_user_id = ?,
           reviewed_at = CURRENT_TIMESTAMP,
           approved_at = ${approvedAtSql},
           rejected_at = ${rejectedAtSql},
           updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND venue_id = ? AND record_space = ?
  `).run(
    nextStatus,
    note,
    actorUserId,
    candidate.id, venueId, OWNER_MEANING_PROMOTION_RECORD_SPACE,
  )

  return {
    action,
    previousStatus,
    nextStatus,
    candidate: getOwnerMeaningPromotionCandidateById(db, venueId, candidate.id),
  }
}

// ── Thin owner-facing wrappers (one per route) ─────────────────────────────────

/** approve_meaning — the owner confirms HESTIA's reading correctly captures their intent/meaning.
 *  NOT an application: application.blocked stays true; no DNA is read or written. */
export function approveOwnerMeaningPromotionCandidateMeaning(db, { venueId, candidateId, actor, reason } = {}) {
  return applyOwnerMeaningPromotionReviewAction(db, { venueId, candidateId, action: 'approve_meaning', actor, reason })
}

/** reject_candidate — the owner declines the candidate (wrong / irrelevant / unsafe / not useful). */
export function rejectOwnerMeaningPromotionCandidate(db, { venueId, candidateId, actor, reason } = {}) {
  return applyOwnerMeaningPromotionReviewAction(db, { venueId, candidateId, action: 'reject_candidate', actor, reason })
}

/** request_revision — the owner asks HESTIA to reinterpret / ask for clarification. Parks the
 *  candidate; does NOT generate a new candidate in this slice. */
export function requestRevisionOwnerMeaningPromotionCandidate(db, { venueId, candidateId, actor, reason, revisionRequest } = {}) {
  return applyOwnerMeaningPromotionReviewAction(db, { venueId, candidateId, action: 'request_revision', actor, reason, revisionRequest })
}
