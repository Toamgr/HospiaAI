// Owner Meaning Promotion — Candidate Generation Runtime Writer (Slice 4J).
//
// The FIRST safe runtime writer for the promotion layer. It turns ONE stored owner meaning capture
// (owner_meaning_captures, Venue Memory — the owner's verbatim words) into ONE owner-reviewable
// promotion candidate row (owner_meaning_promotion_candidates) plus its append-only audit event
// (owner_meaning_promotion_events). It is the writer behind STAGE 2 (proposal) of the 4F
// four-stage model (capture → proposal → approval → application).
//
// Governing docs (binding, in precedence order):
//   docs/architecture/OWNER_MEANING_PROMOTION_REVIEW_DESIGN.md                 (4F   — doctrine)
//   docs/architecture/VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md          (DNA application deferral)
//   docs/architecture/OWNER_MEANING_PROMOTION_DDL_CONTRACT.md                  (4F.1 — exact DDL / vocabulary)
//   docs/architecture/OWNER_MEANING_PROMOTION_READ_API_CONTRACT.md             (4F.2 — read shapes)
//   docs/architecture/OWNER_MEANING_PROMOTION_CANDIDATE_GENERATION_CONTRACT.md (4I   — generation contract)
//
// HARD DOCTRINE (enforced by design — if a line here contradicts it, it is a bug):
//   - This writer NEVER mutates Venue DNA. It imports NOTHING DNA-related, NEVER calls
//     mergeVenueDna, and NEVER writes venue_dna_json / venue_intelligence / venue_briefs /
//     venue_dna_enrichment / venue_intelligence_candidates. (Asserted by audit test.)
//   - It NEVER approves, rejects, requests revision, or applies. It writes ONLY the two promotion
//     tables (candidate + append-only event). application.blocked stays true; allowed_actions stay
//     false; status is a safe, NON-APPLIED draft.
//   - It NEVER writes (or re-writes) owner_meaning_captures — capture evidence is READ-ONLY.
//   - venue_id is the ACCESS BOUNDARY only — server-resolved, never client-supplied. A capture from
//     another venue is unreachable (scoped SELECT → safe NOT_FOUND).
//   - The proposed value is derived ONLY from the capture's owner_response_raw. No POS / shift /
//     staff / guest / sales / menu / DNA fact is invented. Contradictions stay empty unless real
//     stored conflict evidence exists (none is read in 4J). Missing evidence is recorded honestly.
//   - Confidence from a SINGLE owner capture is capped at 'low' (the DDL/4F.2 'medium' band wants
//     >= 2 recent consistent captures; 'high' is never produced). confidence_score stays null.
//   - Idempotent: a deterministic candidate_fingerprint dedupes re-generation from unchanged
//     evidence — a repeat returns the existing candidate (skipped), never an uncontrolled duplicate.
//   - AUDIT-FIRST ordering is load-bearing (mirrors the capture writer): the candidate_created event
//     is inserted BEFORE the candidate row. node:sqlite has no db.transaction(); consistency comes
//     from this ordering, not a wrapper. An orphan audit row after a failed candidate insert is
//     benign; an un-audited state change is a bug.
//
// Deterministic. No AI, no prompts, no network. Dependency-injected db (node:sqlite compatible).

import { randomUUID, createHash } from 'node:crypto'
import {
  OWNER_MEANING_PROMOTION_SCHEMA_VERSION,
  OWNER_MEANING_PROMOTION_RECORD_SPACE,
  getOwnerMeaningPromotionCandidateById,
} from './ownerMeaningPromotionService.js'

// ── Generation constants (conservative first writer) ──────────────────────────

// The single narrow, low-risk target path the first writer promotes into (4I §4 / §16, 4F.1 §6.2).
// Declaring other taxonomy categories does NOT open their paths — generation classifies to exactly
// this one bounded field.
export const OWNER_MEANING_PROMOTION_GENERATION_TARGET_PATH = 'owner_notes'
export const OWNER_MEANING_PROMOTION_GENERATION_TARGET_LABEL = 'Owner notes'

// A single owner capture can never reach the 'medium' band (which wants >= 2 recent, consistent
// captures, 4F.1 §13). The conservative first writer therefore caps confidence at 'low'.
export const OWNER_MEANING_PROMOTION_GENERATION_CONFIDENCE_LABEL = 'low'

// The DDL audit vocabulary (4F.1 §4.2, enforced by CHECK) does NOT contain a 'candidate_generated'
// or 'candidate_generation_skipped' event type — 'candidate_created' is the always-emitted draft
// event (4F.1 §4.2). A generated candidate therefore stores 'candidate_created'; the generation
// semantics live in the event payload's `reason`. A SKIPPED generation has no allowed event type,
// so it writes NO event row (the closed CHECK vocabulary is not widened in this slice).
export const OWNER_MEANING_PROMOTION_GENERATION_EVENT_TYPE = 'candidate_created'

// AI-generated draft → 'hestia_suggestion' actor with a null user id, so generation events stay
// distinguishable from owner-decision events (4F.1 §4.1 / 4I §11). The owner only TRIGGERS the draft.
export const OWNER_MEANING_PROMOTION_GENERATION_ACTOR_TYPE = 'hestia_suggestion'

// Safe, NON-APPLIED initial status (the DDL default draft state, 4F.1 §5). It is not an approval and
// not an application; application stays blocked regardless of status.
export const OWNER_MEANING_PROMOTION_GENERATION_INITIAL_STATUS = 'draft_suggestion'

// A capture whose trimmed answer has fewer than this many word tokens is too weak to promote as a
// proposal — it is SKIPPED (not blocked, not promoted as strong truth), per 4I §6/§7. The stored
// capture is never blank (the capture writer rejects blank), so this guards thin/one-word answers.
export const OWNER_MEANING_PROMOTION_GENERATION_MIN_WORDS = 3

// ── small helpers (pure) ──────────────────────────────────────────────────────

function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0 }
function serializeJson(v) { return v === undefined ? null : JSON.stringify(v) }
function badRequest(message) { const e = new Error(message); e.code = 'BAD_REQUEST'; return e }
function notFound(message) { const e = new Error(message); e.code = 'NOT_FOUND'; return e }

// Word count over a normalized form (analysis only — never rewrites the stored evidence).
function wordCount(str) {
  const t = String(str || '').trim()
  if (t.length === 0) return 0
  return t.split(/\s+/).filter(Boolean).length
}

// Normalize the patch for the FINGERPRINT INPUT ONLY (whitespace/key-order) — never for the stored
// patch (4F.1 §6.1). Same evidence + same target + same proposed value ⇒ same fingerprint.
function normalizePatchForFingerprint(patch) {
  return JSON.stringify({
    target_path: patch.target_path,
    op: patch.op,
    value: typeof patch.value === 'string' ? patch.value.replace(/\s+/g, ' ').trim() : patch.value,
  })
}

/**
 * Deterministic candidate fingerprint (4F.1 §6.1) — the dedupe anchor. Computed in a fixed canonical
 * order with the source-fingerprint list sorted so array order can never vary the result. Forbidden
 * inputs: any ephemeral id, any randomUUID, any client-supplied value.
 */
export function deriveOwnerMeaningPromotionCandidateFingerprint({ venueId, targetPath, sourceCaptureFingerprints, patch }) {
  const fingerprints = Array.isArray(sourceCaptureFingerprints)
    ? [...new Set(sourceCaptureFingerprints.filter(isNonEmptyString).map(v => String(v).trim()))].sort()
    : []
  const canonical = JSON.stringify({
    record_space: OWNER_MEANING_PROMOTION_RECORD_SPACE,
    venue_id: venueId,
    proposed_target_path: targetPath,
    source_capture_fingerprints: fingerprints,
    proposed_dna_patch: normalizePatchForFingerprint(patch),
    schema_version: OWNER_MEANING_PROMOTION_SCHEMA_VERSION,
  })
  return createHash('sha256').update(canonical).digest('hex')
}

// ── Capture read (evidence — READ-ONLY) ────────────────────────────────────────

// Load ONE owner meaning capture, venue-scoped + record_space-scoped. A cross-venue or unknown id
// resolves to null (the route turns it into a safe 404 — no foreign read, no existence leak).
function loadCaptureInVenue(db, venueId, captureId) {
  return db.prepare(
    "SELECT id, venue_id, concept_ref, candidate_fingerprint, owner_response_raw, created_at " +
    "FROM owner_meaning_captures WHERE id = ? AND venue_id = ? AND record_space = 'concept_draft'"
  ).get(captureId, venueId)
}

// ── Candidate generation (the writer) ──────────────────────────────────────────

/**
 * Generate ONE promotion candidate from ONE stored owner meaning capture. Owner-triggered at the
 * route layer; never Venue DNA. Deterministic and conservative.
 *
 * Behavior:
 *   - missing/blank captureId            → throws BAD_REQUEST (route → 400)
 *   - capture not resolvable in-venue    → throws NOT_FOUND   (route → 404)
 *   - capture too weak (thin answer)     → { created:false, skipped:true, reason:'too_weak', candidate:null }
 *   - duplicate of an existing candidate → { created:false, skipped:true, reason:'duplicate', candidate:<existing> }
 *   - otherwise                          → { created:true,  skipped:false, candidate:<new> }
 *
 * The proposed value is derived ONLY from owner_response_raw. current_value is recorded as null
 * (unknown — no Venue DNA is read in 4J). contradictions stay empty; missing evidence is recorded.
 * confidence is 'low' (single capture); confidence_score stays null. application stays blocked.
 *
 * @param db
 * @param params { venueId, captureId, triggeredBy? }
 * @returns { created, skipped, reason?, candidate }
 */
export function generateOwnerMeaningPromotionCandidate(db, params = {}) {
  const { venueId, captureId } = params

  if (!isNonEmptyString(venueId)) throw badRequest('ownerMeaningPromotionGenerate: venueId is required.')
  if (!isNonEmptyString(captureId)) throw badRequest('ownerMeaningPromotionGenerate: capture_id is required.')

  // Evidence load — venue-scoped. Cross-venue / unknown → safe NOT_FOUND.
  const capture = loadCaptureInVenue(db, venueId, captureId.trim())
  if (!capture) throw notFound('ownerMeaningPromotionGenerate: no owner meaning capture found for this venue.')

  // The owner's verbatim words are the ONLY evidence. Normalize for ANALYSIS ONLY (trim) — the
  // stored capture stays byte-for-byte; the proposed VALUE (a derived proposal) may be trimmed.
  const rawValue = typeof capture.owner_response_raw === 'string' ? capture.owner_response_raw : ''
  const proposedValue = rawValue.trim()

  // Too-weak guard: a thin answer is SKIPPED, never promoted as strong truth (4I §6/§7).
  if (wordCount(proposedValue) < OWNER_MEANING_PROMOTION_GENERATION_MIN_WORDS) {
    return { created: false, skipped: true, reason: 'too_weak', candidate: null }
  }

  const targetPath = OWNER_MEANING_PROMOTION_GENERATION_TARGET_PATH
  const targetLabel = OWNER_MEANING_PROMOTION_GENERATION_TARGET_LABEL
  const sourceCaptureIds = [capture.id]
  const sourceCaptureFingerprints = isNonEmptyString(capture.candidate_fingerprint) ? [capture.candidate_fingerprint] : []

  // Bounded single-field domain patch — PROPOSED, explicitly NOT applied (4F.1 §3 col 11 / 4I §5).
  const proposedPatch = {
    target_path: targetPath,
    op: 'add',
    value: proposedValue,
    applied: false,
    application_status: 'not_applied',
  }

  // Deterministic identity / dedupe anchor (4F.1 §6.1 / §9).
  const candidateFingerprint = deriveOwnerMeaningPromotionCandidateFingerprint({
    venueId, targetPath, sourceCaptureFingerprints, patch: proposedPatch,
  })
  const idempotencyKey = `omp_gen:${candidateFingerprint}`

  // Idempotency guard: a candidate with the SAME fingerprint in this venue already exists → return
  // it (skipped), never an uncontrolled duplicate. Service-layer dedupe (the schema index is
  // non-unique; node:sqlite is single-threaded here).
  const existing = db.prepare(
    "SELECT id FROM owner_meaning_promotion_candidates WHERE venue_id = ? AND candidate_fingerprint = ? AND record_space = 'concept_draft'"
  ).get(venueId, candidateFingerprint)
  if (existing) {
    return {
      created: false,
      skipped: true,
      reason: 'duplicate',
      candidate: getOwnerMeaningPromotionCandidateById(db, venueId, existing.id),
    }
  }

  // Conservative derived fields — honest about uncertainty.
  const proposedMeaningSummary = "Proposed reading of the owner's captured words (NOT confirmed, NOT applied)."
  const proposalRationale = "Drawn from the owner's captured words; proposed as an owner note. Not applied to Venue DNA."
  // Single owner capture, no operational corroboration read → record missing evidence honestly.
  const missingEvidence = ['no_supporting_operational_evidence']
  const contradictions = [] // empty/unknown — no stored conflict evidence is read in 4J
  const confidenceFactors = {
    band: OWNER_MEANING_PROMOTION_GENERATION_CONFIDENCE_LABEL,
    evidence_count: sourceCaptureIds.length,
    recency: capture.created_at || null,
    consistency: 'single_capture',
    source_type: 'owner_response',
    contradictions,
    missing_fields: missingEvidence,
  }

  const candidateId = randomUUID()

  // ── STEP 1 — AUDIT-FIRST. candidate_id is a LOGICAL ref (no enforced FK). This INSERT precedes
  //    the candidate insert; an orphan event after a failed candidate write is benign. ──
  db.prepare(`
    INSERT INTO owner_meaning_promotion_events
      (id, venue_id, candidate_id, event_type, actor_type, actor_user_id, actor_role,
       event_payload_json, previous_status, next_status, target_path, source_capture_ids_json,
       idempotency_key, schema_version)
    VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, NULL, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(), venueId, candidateId,
    OWNER_MEANING_PROMOTION_GENERATION_EVENT_TYPE,
    OWNER_MEANING_PROMOTION_GENERATION_ACTOR_TYPE,
    JSON.stringify({
      reason: 'candidate_generated',
      generated_from_capture_id: capture.id,
      to_status: OWNER_MEANING_PROMOTION_GENERATION_INITIAL_STATUS,
      target_path: targetPath,
      confidence_label: OWNER_MEANING_PROMOTION_GENERATION_CONFIDENCE_LABEL,
      application_blocked: true,
    }),
    OWNER_MEANING_PROMOTION_GENERATION_INITIAL_STATUS,
    targetPath,
    serializeJson(sourceCaptureIds),
    idempotencyKey,
    OWNER_MEANING_PROMOTION_SCHEMA_VERSION,
  )

  // ── STEP 2 — INSERT the candidate row. current_value_snapshot_json is null (unknown — no DNA is
  //    read); confidence_score is left to its NULL default; reserved applied_*/dna_application_ref
  //    stay null; record_space / schema_version / created_at default. ──
  db.prepare(`
    INSERT INTO owner_meaning_promotion_candidates
      (id, venue_id, source_capture_ids_json, source_capture_fingerprints_json,
       proposed_target_path, proposed_target_label, current_value_snapshot_json, proposed_value_json,
       proposed_meaning_summary, proposed_dna_patch_json, proposal_rationale,
       confidence_label, confidence_factors_json, contradictions_json, missing_evidence_json,
       impact_note, status, created_by_actor_type, idempotency_key, candidate_fingerprint)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    candidateId, venueId,
    serializeJson(sourceCaptureIds), serializeJson(sourceCaptureFingerprints),
    targetPath, targetLabel,
    serializeJson(null),            // current_value_snapshot_json — the BEFORE is unknown (no DNA read)
    serializeJson(proposedValue),   // proposed_value_json — derived ONLY from owner_response_raw
    proposedMeaningSummary,
    serializeJson(proposedPatch),
    proposalRationale,
    OWNER_MEANING_PROMOTION_GENERATION_CONFIDENCE_LABEL,
    serializeJson(confidenceFactors),
    serializeJson(contradictions),
    serializeJson(missingEvidence),
    'Read by the owner identity specialists.',
    OWNER_MEANING_PROMOTION_GENERATION_INITIAL_STATUS,
    OWNER_MEANING_PROMOTION_GENERATION_ACTOR_TYPE,
    idempotencyKey,
    candidateFingerprint,
  )

  return {
    created: true,
    skipped: false,
    candidate: getOwnerMeaningPromotionCandidateById(db, venueId, candidateId),
  }
}
