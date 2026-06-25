// New Venue Discovery — Fidelity Review Persistence (Slice 1).
//
// Persists the inline panel's existing fidelity-review choices
// (captured | edited | held | rejected, + re-route + owner-edit overlay) into an
// ISOLATED, owner-writable, fully provenance-stamped, append-only-audited Venue Memory
// table. This is the Phase 7A pattern (markVenueIntelligenceCandidateReviewed persisted
// human review of a candidate WITHOUT touching DNA), re-applied to the discovery source.
//
// Governing docs (binding):
//   docs/architecture/NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_IMPLEMENTATION_SCOPE.md
//   docs/architecture/NEW_VENUE_DISCOVERY_PERSISTENCE_SCOPING_RESOLUTION.md
//   docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md
//
// HARD DOCTRINE (enforced by design — if a line here contradicts it, it is a bug):
//   - Fidelity approval means "HESTIA captured what I meant." It is NOT "confirmed Venue DNA."
//   - The stored vocabulary makes confirmation IMPOSSIBLE TO EXPRESS: there is NO
//     'confirmed'/'approved'/'promoted' value and NO confirmation_ref column.
//   - This module IMPORTS NOTHING DNA-related. It NEVER calls mergeVenueDna and NEVER writes
//     venue_dna_json / venue_briefs / venue_dna_enrichment / venue_intelligence. (Asserted by test.)
//   - record_space is server-hard-coded 'concept_draft'; 'live_venue' is never written.
//   - venue_id is the ACCESS BOUNDARY only — never the subject of the record. The subject is
//     the concept (concept_ref) in record_space 'concept_draft'.
//   - 'Suggested destination: Venue DNA' is an INERT earmark (a boolean + display string in a
//     concept_draft row). It has structurally no DNA target. It is never a write path.
//   - Confidence may only be LOWERED, re-enforced server-side. Saving is never corroboration.
//   - Deterministic. No AI, no prompts, no network. Dependency-injected db.
//
// The 5 candidate fields come verbatim from candidateSignalFormat.js
// (signal · evidence · confidence · status · suggestedDestination). That is the ONLY signal
// source. Importing it is NOT a DNA import — it is the signal contract.

import { randomUUID } from 'node:crypto'
import { VALID_DESTINATION, DEFAULT_EVIDENCE } from './candidateSignalFormat.js'

// re-export so callers/tests can see the conservative default this surface preserves verbatim.
export { VALID_DESTINATION, DEFAULT_EVIDENCE }

// ── Controlled vocabularies ──────────────────────────────────────────────────

// 1:1 map to the shipped panel actions (ACTION_LABEL in CandidateReviewPanel.jsx).
// There is deliberately NO 'confirmed' / 'approved' / 'promoted' — confirmation is
// impossible to express (vocabulary, not vigilance).
export const REVIEW_ACTIONS = Object.freeze(['captured', 'edited', 'held', 'rejected'])

// Provenance is permanent and SERVER-SET (never trusted from the client).
export const PROVENANCE = Object.freeze(['owner_conversation', 'owner_edit'])

// Coverage band — never a percentage, never certainty.
export const CONFIDENCE_BANDS = Object.freeze(['low', 'medium', 'high'])

// Evidence taxonomy (orientation; null when genuinely absent — never fabricated).
export const EVIDENCE_TYPES = Object.freeze([
  'owner_provided_fact', 'owner_provided_belief', 'inferred_signal', 'missing',
])

// The ONLY record_space this surface ever writes. Hard-coded, never read from the client.
// 'live_venue' is reserved for a future, separate, explicitly-designated path (9D-era).
export const RECORD_SPACE = 'concept_draft'

const CONFIDENCE_RANK = Object.freeze({ low: 1, medium: 2, high: 3 })

// ── DDL (single source of truth — shared by server boot and the in-memory test) ─
//
// NOTE (load-bearing): discovery_candidate_review_events.review_id is a LOGICAL
// reference, NOT a DB-enforced foreign key. The audit row is written BEFORE the review
// row exists (audit-first; see upsertDiscoveryReview). An enforced FK would reject that
// ordering. Do NOT add a FOREIGN KEY clause and do NOT enable PRAGMA foreign_keys for
// these tables. confirmation_ref is DELIBERATELY ABSENT from discovery_candidate_reviews.

export const DISCOVERY_CANDIDATE_REVIEWS_DDL = `
CREATE TABLE IF NOT EXISTS discovery_candidate_reviews (
  id                      TEXT    PRIMARY KEY,
  venue_id                TEXT    NOT NULL,
  concept_ref             TEXT    NOT NULL,
  record_space            TEXT    NOT NULL DEFAULT 'concept_draft',
  conversation_ref        TEXT,
  candidate_snapshot_json TEXT    NOT NULL,
  snapshot_taken_at       TEXT,
  review_action           TEXT    NOT NULL,
  chosen_destination      TEXT,
  dna_earmarked           INTEGER NOT NULL DEFAULT 0,
  owner_edit_json         TEXT,
  provenance              TEXT    NOT NULL,
  evidence_type           TEXT,
  reviewed_by             TEXT,
  reviewed_at             TEXT,
  created_at              TEXT    DEFAULT CURRENT_TIMESTAMP,
  updated_at              TEXT    DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dcr_venue          ON discovery_candidate_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_dcr_venue_concept  ON discovery_candidate_reviews(venue_id, concept_ref);
CREATE INDEX IF NOT EXISTS idx_dcr_venue_space    ON discovery_candidate_reviews(venue_id, record_space);
`

export const DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL = `
CREATE TABLE IF NOT EXISTS discovery_candidate_review_events (
  id               TEXT PRIMARY KEY,
  review_id        TEXT NOT NULL,
  venue_id         TEXT NOT NULL,
  concept_ref      TEXT,
  changed_by       TEXT,
  changed_at       TEXT DEFAULT CURRENT_TIMESTAMP,
  from_action      TEXT,
  to_action        TEXT,
  from_destination TEXT,
  to_destination   TEXT,
  edit_delta_json  TEXT,
  reason_note      TEXT
);
CREATE INDEX IF NOT EXISTS idx_dcre_venue         ON discovery_candidate_review_events(venue_id);
CREATE INDEX IF NOT EXISTS idx_dcre_review        ON discovery_candidate_review_events(review_id);
CREATE INDEX IF NOT EXISTS idx_dcre_venue_concept ON discovery_candidate_review_events(venue_id, concept_ref);
`

// ── small helpers (pure) ─────────────────────────────────────────────────────

function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0 }
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isUuidLike(v) { return isNonEmptyString(v) && UUID_RE.test(v.trim()) }
function serializeJson(v) {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v
  return JSON.stringify(v)
}
function parseJson(v) { if (v === null || v === undefined) return null; try { return JSON.parse(v) } catch { return null } }
function normScalar(v) {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v.trim() === '' ? null : v
  return v
}

// Normalize the immutable 5-field candidate snapshot. Accepts BOTH the parser shape
// (signal/evidence/confidence/status/suggestedDestination) and the canonical snapshot
// shape (…/confidence_band/dna_status_label/suggested_destination). DEFAULT_EVIDENCE is
// stored VERBATIM when that is what existed — never upgraded into real evidence.
function normalizeSnapshot(snap) {
  if (!snap || typeof snap !== 'object') return null
  const rawBand = snap.confidence_band ?? snap.confidence ?? null
  const band = CONFIDENCE_BANDS.includes(rawBand) ? rawBand : null
  const dest = snap.suggested_destination ?? snap.suggestedDestination ?? null
  return {
    signal: normScalar(snap.signal),
    evidence: normScalar(snap.evidence), // verbatim; DEFAULT_EVIDENCE preserved, never upgraded
    confidence_band: band,
    dna_status_label: normScalar(snap.dna_status_label ?? snap.status),
    suggested_destination: normScalar(dest),
  }
}

// Owner edit overlay — the owner's own words. Kept SEPARATE from the snapshot; never merged.
// Only the fields the owner changed are present. confidence_band may only LOWER (enforced in
// normalizeDiscoveryReview against the immutable snapshot band).
function normalizeOwnerEdit(edit) {
  if (!edit || typeof edit !== 'object') return null
  const out = {}
  const signal = normScalar(edit.signal)
  const evidence = normScalar(edit.evidence)
  const rawBand = edit.confidence_band ?? edit.confidence ?? null
  const band = CONFIDENCE_BANDS.includes(rawBand) ? rawBand : null
  if (signal != null) out.signal = signal
  if (evidence != null) out.evidence = evidence
  if (band != null) out.confidence_band = band
  return Object.keys(out).length > 0 ? out : null
}

// ── Normalization / validation ───────────────────────────────────────────────

/**
 * Validate + normalize a fidelity-review input into storable fields. Throws (caller maps
 * to 400) on invalid vocabulary so 'confirmed'/'approved'/'promoted' are rejected by
 * absence. Pure. Server-authoritative fields (provenance, record_space) are set here and
 * NEVER trusted from the client.
 *
 * @param existingSnapshot the already-stored immutable snapshot (parsed) when updating an
 *   existing review; null on first save. The snapshot is immutable, so when updating, the stored
 *   snapshot — not any re-sent client snapshot — is authoritative for the confidence floor.
 */
export function normalizeDiscoveryReview(input, venueId, existingSnapshot = null) {
  if (!isNonEmptyString(venueId)) throw new Error('discoveryReview: venueId is required.')
  if (!input || typeof input !== 'object') throw new Error('discoveryReview: review input object is required.')

  // review_action ∈ the four values. 'confirmed'/'approved'/'promoted' are rejected by absence.
  const reviewAction = input.review_action
  if (!REVIEW_ACTIONS.includes(reviewAction)) {
    throw new Error(`discoveryReview: invalid review_action "${reviewAction}".`)
  }

  // chosen_destination must be one of the seven canonical destinations, or null.
  const chosenDestination = normScalar(input.chosen_destination)
  if (chosenDestination != null && !VALID_DESTINATION.includes(chosenDestination)) {
    throw new Error(`discoveryReview: invalid chosen_destination "${chosenDestination}".`)
  }

  // 'Venue DNA' route is an INERT earmark — a boolean only. It has structurally no DNA
  // target. This is the ENTIRE effect of a 'Venue DNA' route.
  const dnaEarmarked = chosenDestination === 'Venue DNA' ? 1 : 0

  // Immutable snapshot: the stored snapshot wins on update (immutability + floor integrity);
  // a client-sent snapshot is used only on first save.
  const snapshotInput = input.candidate_snapshot != null ? normalizeSnapshot(input.candidate_snapshot) : null
  const effectiveSnapshot = existingSnapshot || snapshotInput || null

  // Owner edit overlay. Confidence may only be LOWERED — raising is a fabricated evidence
  // claim laundered through the API. Reject (preferred — surfaces the bug).
  const ownerEdit = normalizeOwnerEdit(input.owner_edit)
  if (ownerEdit && ownerEdit.confidence_band != null) {
    const editRank = CONFIDENCE_RANK[ownerEdit.confidence_band] || 0
    const snapRank = effectiveSnapshot && effectiveSnapshot.confidence_band
      ? (CONFIDENCE_RANK[effectiveSnapshot.confidence_band] || 0)
      : 0
    if (editRank > snapRank) {
      throw new Error('discoveryReview: confidence may only be lowered, never raised.')
    }
  }

  // provenance is SERVER-SET: 'owner_edit' iff an overlay is present, else 'owner_conversation'.
  const provenance = ownerEdit ? 'owner_edit' : 'owner_conversation'

  // evidence_type — taxonomy; null when absent (never fabricated).
  const evidenceType = normScalar(input.evidence_type)
  if (evidenceType != null && !EVIDENCE_TYPES.includes(evidenceType)) {
    throw new Error(`discoveryReview: invalid evidence_type "${evidenceType}".`)
  }

  return {
    review_action: reviewAction,
    record_space: RECORD_SPACE, // server-hard-coded; never read from the client
    chosen_destination: chosenDestination,
    dna_earmarked: dnaEarmarked,
    owner_edit: ownerEdit,
    owner_edit_json: serializeJson(ownerEdit),
    provenance,
    evidence_type: evidenceType,
    conversation_ref: normScalar(input.conversation_ref),
    reviewed_by: normScalar(input.reviewed_by),
    reason_note: normScalar(input.reason_note),
    candidate_snapshot: effectiveSnapshot,
    candidate_snapshot_json: effectiveSnapshot ? serializeJson(effectiveSnapshot) : null,
    snapshot_taken_at: normScalar(input.snapshot_taken_at),
  }
}

// ── Read shaping ─────────────────────────────────────────────────────────────

// Full, parsed row (single-record read).
function shapeFullRow(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    venue_id: raw.venue_id,
    concept_ref: raw.concept_ref,
    record_space: raw.record_space,
    conversation_ref: raw.conversation_ref,
    candidate_snapshot: parseJson(raw.candidate_snapshot_json),
    snapshot_taken_at: raw.snapshot_taken_at,
    review_action: raw.review_action,
    chosen_destination: raw.chosen_destination,
    dna_earmarked: raw.dna_earmarked === 1 || raw.dna_earmarked === true,
    owner_edit: parseJson(raw.owner_edit_json),
    provenance: raw.provenance,
    evidence_type: raw.evidence_type,
    reviewed_by: raw.reviewed_by,
    reviewed_at: raw.reviewed_at,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  }
}

// Compact list projection — NO large JSON (the immutable snapshot blob stays out of lists).
// A single derived snapshot_signal string is included so the panel can detect source drift
// without pulling the full snapshot.
function shapeCompactRow(raw) {
  if (!raw) return null
  const snap = parseJson(raw.candidate_snapshot_json)
  return {
    id: raw.id,
    concept_ref: raw.concept_ref,
    conversation_ref: raw.conversation_ref,
    review_action: raw.review_action,
    chosen_destination: raw.chosen_destination,
    dna_earmarked: raw.dna_earmarked === 1 || raw.dna_earmarked === true,
    owner_edit: parseJson(raw.owner_edit_json),
    provenance: raw.provenance,
    evidence_type: raw.evidence_type,
    snapshot_signal: snap && snap.signal ? snap.signal : null,
    snapshot_taken_at: raw.snapshot_taken_at,
    reviewed_by: raw.reviewed_by,
    reviewed_at: raw.reviewed_at,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  }
}

// ── Storage API (dependency-injected db) ─────────────────────────────────────

/**
 * Upsert a fidelity review (current state) + append its audit event. Owner-only at the
 * route layer; never Venue DNA.
 *
 * AUDIT-FIRST ORDERING IS LOAD-BEARING — DO NOT REORDER, AND FKs MUST STAY OFF:
 *   1) mint review.id (the audit references it, so it must exist as a value first),
 *   2) INSERT the append-only audit event FIRST,
 *   3) THEN idempotently upsert the review row within (venue_id, concept_ref) scope.
 * If step 3 fails, the orphan audit event is benign (a recorded attempt that did not land);
 * a state change must NEVER be un-audited. node:sqlite has no db.transaction(); consistency
 * comes from this ordering + idempotency on a stable id, not from a transaction wrapper.
 *
 * concept_ref is REQUIRED and UUID-shaped. venue_id is NEVER substituted for it.
 * The candidate_snapshot is IMMUTABLE: a subsequent action change never rewrites
 * candidate_snapshot_json or snapshot_taken_at.
 *
 * @returns the shaped, full review row.
 */
export function upsertDiscoveryReview(db, venueId, conceptRef, input) {
  if (!isNonEmptyString(venueId)) throw new Error('discoveryReview: venueId is required.')
  // concept_ref is the draft/concept thread key — required, UUID-shaped, NEVER venue_id.
  if (!isUuidLike(conceptRef)) {
    throw new Error('discoveryReview: a valid UUID concept_ref is required.')
  }

  // Stable upsert key. The client owns review.id continuity per candidate within a thread.
  const reviewId = isUuidLike(input && input.id) ? input.id : randomUUID()

  // Foreign-id guard: the id is a global PRIMARY KEY. If a row with this id already exists
  // under a DIFFERENT venue, this is a cross-venue id → 404, NEVER a foreign write. If it
  // exists under THIS venue but a different concept_ref, the concept binding is being changed
  // — reject (400) rather than silently re-bind. A brand-new id falls through to first-save.
  const anyById = db.prepare('SELECT venue_id, concept_ref FROM discovery_candidate_reviews WHERE id = ?').get(reviewId)
  if (anyById) {
    if (anyById.venue_id !== venueId) {
      const e = new Error('discoveryReview: no review found for this venue.')
      e.code = 'NOT_FOUND'
      throw e
    }
    if (anyById.concept_ref !== conceptRef) {
      throw new Error('discoveryReview: concept_ref does not match this review.')
    }
  }

  // Existing row WITHIN (venue_id, concept_ref) scope — for immutable snapshot reuse and the
  // audit from-state. A brand-new id never matches → treated as a first save.
  const existing = db.prepare(
    'SELECT * FROM discovery_candidate_reviews WHERE id = ? AND venue_id = ? AND concept_ref = ?'
  ).get(reviewId, venueId, conceptRef)
  const existingSnapshot = existing ? parseJson(existing.candidate_snapshot_json) : null

  const norm = normalizeDiscoveryReview(input, venueId, existingSnapshot)

  // First save MUST carry a snapshot (the column is NOT NULL; we never fabricate one).
  if (!norm.candidate_snapshot_json) {
    throw new Error('discoveryReview: candidate_snapshot is required on first save.')
  }

  // ── STEP 2 — AUDIT-FIRST. This INSERT must precede the review upsert. Reordering this
  //    breaks the "no un-audited state change" guarantee. review_id is a LOGICAL ref. ──
  db.prepare(`
    INSERT INTO discovery_candidate_review_events
      (id, review_id, venue_id, concept_ref, changed_by, from_action, to_action,
       from_destination, to_destination, edit_delta_json, reason_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(), reviewId, venueId, conceptRef, norm.reviewed_by,
    existing ? existing.review_action : null, norm.review_action,
    existing ? existing.chosen_destination : null, norm.chosen_destination,
    norm.owner_edit_json, norm.reason_note,
  )

  // ── STEP 3 — idempotent upsert of the review row keyed on the stable id. Re-running the
  //    same save converges; a retry after a partial failure is safe. The snapshot is NEVER
  //    rewritten on update. ──
  if (existing) {
    db.prepare(`
      UPDATE discovery_candidate_reviews
      SET review_action = ?, chosen_destination = ?, dna_earmarked = ?, owner_edit_json = ?,
          provenance = ?, evidence_type = ?, conversation_ref = ?, reviewed_by = ?,
          reviewed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ? AND venue_id = ? AND concept_ref = ?
    `).run(
      norm.review_action, norm.chosen_destination, norm.dna_earmarked, norm.owner_edit_json,
      norm.provenance, norm.evidence_type, norm.conversation_ref, norm.reviewed_by,
      reviewId, venueId, conceptRef,
    )
  } else {
    db.prepare(`
      INSERT INTO discovery_candidate_reviews
        (id, venue_id, concept_ref, record_space, conversation_ref, candidate_snapshot_json,
         snapshot_taken_at, review_action, chosen_destination, dna_earmarked, owner_edit_json,
         provenance, evidence_type, reviewed_by, reviewed_at)
      VALUES (?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')), ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      reviewId, venueId, conceptRef, RECORD_SPACE, norm.conversation_ref, norm.candidate_snapshot_json,
      norm.snapshot_taken_at, norm.review_action, norm.chosen_destination, norm.dna_earmarked,
      norm.owner_edit_json, norm.provenance, norm.evidence_type, norm.reviewed_by,
    )
  }

  return getDiscoveryReviewById(db, venueId, reviewId)
}

/**
 * List a venue's / concept's persisted reviews (newest first). Venue-scoped and filtered to
 * record_space = 'concept_draft' (the conflation guard: no discovery review can ever be read
 * as live-venue truth). Compact projection — no large snapshot JSON.
 *
 * @param filters { concept_ref?, limit }
 */
export function listDiscoveryReviewsForVenue(db, venueId, filters = {}) {
  if (!isNonEmptyString(venueId)) return []
  const where = ['venue_id = ?', "record_space = 'concept_draft'"]
  const args = [venueId]
  if (filters.concept_ref != null) {
    if (!isNonEmptyString(filters.concept_ref)) return []
    where.push('concept_ref = ?'); args.push(String(filters.concept_ref))
  }
  const limit = Math.max(1, Math.min(200, Number(filters.limit) || 50))
  const rows = db.prepare(
    `SELECT * FROM discovery_candidate_reviews WHERE ${where.join(' AND ')} ORDER BY created_at DESC, rowid DESC LIMIT ?`
  ).all(...args, limit)
  return rows.map(shapeCompactRow)
}

/**
 * Read one review by id, venue-scoped and record_space-scoped. A cross-venue id → null (no
 * foreign read, no foreign write). Full, parsed snapshot.
 */
export function getDiscoveryReviewById(db, venueId, reviewId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(reviewId)) return null
  const raw = db.prepare(
    "SELECT * FROM discovery_candidate_reviews WHERE id = ? AND venue_id = ? AND record_space = 'concept_draft'"
  ).get(reviewId, venueId)
  return shapeFullRow(raw)
}

/**
 * Read the append-only audit trail for one review, venue-scoped (forensics / tests). Newest
 * first. The audit is a complete record regardless of whether the review row landed.
 */
export function listDiscoveryReviewEvents(db, venueId, reviewId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(reviewId)) return []
  return db.prepare(
    'SELECT * FROM discovery_candidate_review_events WHERE review_id = ? AND venue_id = ? ORDER BY changed_at DESC, rowid DESC'
  ).all(reviewId, venueId).map(e => ({ ...e, edit_delta: parseJson(e.edit_delta_json) }))
}
