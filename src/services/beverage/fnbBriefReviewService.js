// F&B Brief Review — persistence (Beverage Slice 1A).
//
// The F&B DIRECTOR's review layer over a submitted Owner Beverage Direction Brief. A review is
// a SEPARATE record: notes, per-field adjustments stored as a DIFF, and a decision status. It
// NEVER writes to owner_beverage_briefs — the owner's submitted values are immutable and are
// only ever copied INTO the diff for self-description.
//
// Governing docs (binding):
//   docs/architecture/BEVERAGE_INTELLIGENCE_BRAIN_GAP_ANALYSIS_2026_07.md
//   docs/architecture/BEVERAGE_UX_SYSTEM_OWNER_BRIEF_AND_REPORT_MEMORY_2026_07.md
//
// HARD DOCTRINE (enforced by design):
//   - No UPDATE/INSERT touches owner_beverage_briefs from this module. Adjustments live ONLY
//     in fnb_brief_reviews.field_adjustments_json as { field: { owner_value, adjusted_value,
//     note, adjusted_at } } — owner_value is copied from the brief at write time.
//   - One review per brief (Slice 1A). A second create is a CONFLICT.
//   - A review can only be opened on a SUBMITTED brief — never a draft.
//   - Once decided (approved / declined / clarification_requested) a review is closed:
//     further edits are CONFLICT. decided_at is set exactly once.
//   - venue_id is the server-resolved access boundary; cross-venue ids → null / NOT_FOUND.
//   - Audit-first ordering into beverage_brief_events (shared audit table; logical refs, no
//     FK, no PRAGMA foreign_keys — do not add either).
//   - Deterministic. No AI, no prompts, no network. Nothing DNA-related is imported or written.

import { randomUUID } from 'node:crypto'
import { BRIEF_CONTENT_FIELDS } from './ownerBeverageBriefService.js'

// ── Constants / closed vocabularies ───────────────────────────────────────────

export const REVIEW_STATUSES = Object.freeze(['in_review', 'approved', 'declined', 'clarification_requested'])
export const REVIEW_STATUS_IN_REVIEW = 'in_review'
// The three legal decisions out of in_review. There is no other transition in Slice 1A.
export const REVIEW_DECISION_STATUSES = Object.freeze(['approved', 'declined', 'clarification_requested'])

export const REVIEW_NOTES_MAX = 8000
export const ADJUSTMENT_NOTE_MAX = 2000
export const ADJUSTMENT_VALUE_MAX = 4000

// ── small helpers (pure) ──────────────────────────────────────────────────────

function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0 }
function parseJson(v) { if (v === null || v === undefined) return null; try { return JSON.parse(v) } catch { return null } }
function badRequest(message) { const e = new Error(message); e.code = 'BAD_REQUEST'; return e }
function conflict(message) { const e = new Error(message); e.code = 'CONFLICT'; return e }
function notFound(message) { const e = new Error(message); e.code = 'NOT_FOUND'; return e }
function charLength(str) { return [...str].length }

// ── DDL ────────────────────────────────────────────────────────────────────────
//
// owner_beverage_brief_id is a LOGICAL reference (no enforced FK) — same posture as the
// beverage_brief_events table. Do NOT add a FOREIGN KEY clause.

export const FNB_BRIEF_REVIEWS_DDL = `
CREATE TABLE IF NOT EXISTS fnb_brief_reviews (
  id                       TEXT PRIMARY KEY,
  venue_id                 TEXT NOT NULL,
  owner_beverage_brief_id  TEXT NOT NULL,
  reviewer_user_id         TEXT NOT NULL,
  status                   TEXT NOT NULL CHECK (status IN ('in_review','approved','declined','clarification_requested')),
  notes                    TEXT,
  field_adjustments_json   TEXT NOT NULL DEFAULT '{}',
  created_at               TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  decided_at               TEXT
);
CREATE INDEX IF NOT EXISTS idx_fnb_brief_reviews_venue_id ON fnb_brief_reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_fnb_brief_reviews_brief_id ON fnb_brief_reviews(owner_beverage_brief_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fnb_brief_reviews_one_per_brief ON fnb_brief_reviews(venue_id, owner_beverage_brief_id);
`

// ── Audit writer (audit-first; same table as the brief service) ───────────────

function writeReviewEvent(db, { venueId, briefId, reviewId, eventType, payload, createdBy }) {
  db.prepare(`
    INSERT INTO beverage_brief_events (id, venue_id, brief_id, review_id, event_type, event_payload_json, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), venueId, briefId, reviewId, eventType, JSON.stringify(payload ?? {}), createdBy)
}

// ── Read shaping ───────────────────────────────────────────────────────────────

function shapeReviewRow(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    venue_id: raw.venue_id,
    owner_beverage_brief_id: raw.owner_beverage_brief_id,
    reviewer_user_id: raw.reviewer_user_id,
    status: raw.status,
    notes: raw.notes ?? null,
    field_adjustments: parseJson(raw.field_adjustments_json) || {},
    created_at: raw.created_at,
    decided_at: raw.decided_at ?? null,
  }
}

// ── Adjustment validation ──────────────────────────────────────────────────────

// Validate ONE incoming adjustment { field, adjusted_value, note? }. The field must be one of
// the eleven brief content fields; values are text (the diff records the director's suggested
// wording — even for cocktail_count it is stored as the typed suggestion, never applied).
function validateAdjustment(adj) {
  if (!adj || typeof adj !== 'object' || Array.isArray(adj)) throw badRequest('fnbBriefReview: each adjustment must be an object.')
  const field = adj.field
  if (!BRIEF_CONTENT_FIELDS.includes(field)) throw badRequest(`fnbBriefReview: unknown adjustment field "${field}".`)
  const adjustedValue = adj.adjusted_value
  if (typeof adjustedValue !== 'string' && typeof adjustedValue !== 'number') {
    throw badRequest(`fnbBriefReview: adjustment for "${field}" needs an adjusted_value.`)
  }
  const valueText = String(adjustedValue)
  if (valueText.trim().length === 0) throw badRequest(`fnbBriefReview: adjustment for "${field}" needs a non-empty adjusted_value.`)
  if (charLength(valueText) > ADJUSTMENT_VALUE_MAX) throw badRequest(`fnbBriefReview: adjustment for "${field}" exceeds ${ADJUSTMENT_VALUE_MAX} characters.`)
  let note = null
  if (adj.note !== null && adj.note !== undefined) {
    if (typeof adj.note !== 'string') throw badRequest(`fnbBriefReview: adjustment note for "${field}" must be text.`)
    if (charLength(adj.note) > ADJUSTMENT_NOTE_MAX) throw badRequest(`fnbBriefReview: adjustment note for "${field}" exceeds ${ADJUSTMENT_NOTE_MAX} characters.`)
    note = adj.note.trim().length > 0 ? adj.note : null
  }
  return { field, adjusted_value: valueText, note }
}

// ── Storage API (dependency-injected db) ───────────────────────────────────────

/**
 * Open a review on a SUBMITTED brief. One review per brief. Audit-first ('review_created').
 * The brief row is read for validation only — never written.
 *
 * @param params { venueId, briefId, reviewerUserId }
 */
export function createFnbBriefReview(db, params = {}) {
  const { venueId, briefId, reviewerUserId } = params
  if (!isNonEmptyString(venueId)) throw badRequest('fnbBriefReview: venueId is required.')
  if (!isNonEmptyString(briefId)) throw badRequest('fnbBriefReview: briefId is required.')
  if (!isNonEmptyString(reviewerUserId)) throw badRequest('fnbBriefReview: reviewerUserId is required.')

  const brief = db.prepare('SELECT * FROM owner_beverage_briefs WHERE id = ? AND venue_id = ?').get(briefId, venueId)
  if (!brief) throw notFound('No beverage brief found for this venue.')
  if (brief.status !== 'submitted') throw conflict('A review can only be opened on a submitted brief.')

  const existing = db.prepare(
    'SELECT id FROM fnb_brief_reviews WHERE owner_beverage_brief_id = ? AND venue_id = ?'
  ).get(briefId, venueId)
  if (existing) throw conflict('This brief already has a review.')

  const reviewId = randomUUID()

  writeReviewEvent(db, {
    venueId, briefId, reviewId, eventType: 'review_created',
    payload: { to_status: REVIEW_STATUS_IN_REVIEW },
    createdBy: reviewerUserId,
  })

  db.prepare(`
    INSERT INTO fnb_brief_reviews
      (id, venue_id, owner_beverage_brief_id, reviewer_user_id, status, notes, field_adjustments_json, created_at, decided_at)
    VALUES (?, ?, ?, ?, ?, NULL, '{}', datetime('now'), NULL)
  `).run(reviewId, venueId, briefId, reviewerUserId, REVIEW_STATUS_IN_REVIEW)

  return getFnbBriefReviewById(db, venueId, reviewId)
}

/**
 * Update an OPEN (in_review) review: set notes, add field adjustments (a DIFF — the owner's
 * value is copied in from the brief, the brief row is never written), and/or decide.
 * A decided review is closed: any further call is CONFLICT.
 *
 * @param params { venueId, reviewId, reviewerUserId, notes?, adjustments?, status? }
 */
export function updateFnbBriefReview(db, params = {}) {
  const { venueId, reviewId, reviewerUserId, notes, adjustments, status } = params
  if (!isNonEmptyString(venueId) || !isNonEmptyString(reviewId)) throw badRequest('fnbBriefReview: venueId and reviewId are required.')
  if (!isNonEmptyString(reviewerUserId)) throw badRequest('fnbBriefReview: reviewerUserId is required.')

  const review = db.prepare('SELECT * FROM fnb_brief_reviews WHERE id = ? AND venue_id = ?').get(reviewId, venueId)
  if (!review) throw notFound('No brief review found for this venue.')
  if (review.status !== REVIEW_STATUS_IN_REVIEW) {
    throw conflict('This review was already decided and is closed.')
  }

  const brief = db.prepare('SELECT * FROM owner_beverage_briefs WHERE id = ? AND venue_id = ?')
    .get(review.owner_beverage_brief_id, venueId)
  if (!brief) throw notFound('The reviewed brief no longer resolves in this venue.')

  // notes — replace-on-write review-layer text (the review is the director's living worksheet
  // until decided). Validation may reject; it never rewrites.
  let nextNotes = review.notes ?? null
  if (notes !== undefined) {
    if (notes === null) nextNotes = null
    else {
      if (typeof notes !== 'string') throw badRequest('fnbBriefReview: notes must be text.')
      if (charLength(notes) > REVIEW_NOTES_MAX) throw badRequest(`fnbBriefReview: notes exceed ${REVIEW_NOTES_MAX} characters.`)
      nextNotes = notes.trim().length > 0 ? notes : null
    }
  }

  // adjustments — validated, then merged into the diff map keyed by field. owner_value is
  // copied from the CURRENT brief row (immutable post-submit, so this is the submitted value).
  const currentAdjustments = parseJson(review.field_adjustments_json) || {}
  const addedFields = []
  if (adjustments !== undefined && adjustments !== null) {
    if (!Array.isArray(adjustments)) throw badRequest('fnbBriefReview: adjustments must be an array.')
    for (const rawAdj of adjustments) {
      const adj = validateAdjustment(rawAdj)
      currentAdjustments[adj.field] = {
        owner_value: brief[adj.field] ?? null,
        adjusted_value: adj.adjusted_value,
        note: adj.note,
        adjusted_at: new Date().toISOString(),
      }
      addedFields.push(adj.field)
    }
  }

  // status — only the three legal decisions, only out of in_review.
  let nextStatus = review.status
  let decide = false
  if (status !== undefined && status !== null) {
    if (!REVIEW_DECISION_STATUSES.includes(status)) {
      throw badRequest(`fnbBriefReview: status must be one of ${REVIEW_DECISION_STATUSES.join(', ')}.`)
    }
    nextStatus = status
    decide = true
  }

  // AUDIT-FIRST — one event per meaningful change, before the UPDATE lands.
  for (const field of addedFields) {
    writeReviewEvent(db, {
      venueId, briefId: review.owner_beverage_brief_id, reviewId,
      eventType: 'review_adjustment_added',
      payload: { field },
      createdBy: reviewerUserId,
    })
  }
  if (decide) {
    writeReviewEvent(db, {
      venueId, briefId: review.owner_beverage_brief_id, reviewId,
      eventType: 'review_status_changed',
      payload: { from_status: review.status, to_status: nextStatus },
      createdBy: reviewerUserId,
    })
  }

  db.prepare(`
    UPDATE fnb_brief_reviews
    SET notes = ?, field_adjustments_json = ?, status = ?,
        decided_at = CASE WHEN ? THEN datetime('now') ELSE decided_at END
    WHERE id = ? AND venue_id = ?
  `).run(nextNotes, JSON.stringify(currentAdjustments), nextStatus, decide ? 1 : 0, reviewId, venueId)

  return getFnbBriefReviewById(db, venueId, reviewId)
}

/** Read one review, venue-scoped. Cross-venue id → null. */
export function getFnbBriefReviewById(db, venueId, reviewId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(reviewId)) return null
  const raw = db.prepare('SELECT * FROM fnb_brief_reviews WHERE id = ? AND venue_id = ?').get(reviewId, venueId)
  return shapeReviewRow(raw)
}

/** Read the review for one brief, venue-scoped. None → null (an honest gap, not an error). */
export function getFnbBriefReviewForBrief(db, venueId, briefId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(briefId)) return null
  const raw = db.prepare('SELECT * FROM fnb_brief_reviews WHERE owner_beverage_brief_id = ? AND venue_id = ?').get(briefId, venueId)
  return shapeReviewRow(raw)
}

/**
 * The F&B inbox: SUBMITTED briefs for this venue, newest submission first, each with its
 * review state (or null — honestly unreviewed). Draft briefs are NEVER listed here. Read-only.
 */
export function listFnbBriefInbox(db, venueId) {
  if (!isNonEmptyString(venueId)) return []
  const rows = db.prepare(`
    SELECT b.*, r.id AS review_id, r.status AS review_status, r.decided_at AS review_decided_at
    FROM owner_beverage_briefs b
    LEFT JOIN fnb_brief_reviews r ON r.owner_beverage_brief_id = b.id AND r.venue_id = b.venue_id
    WHERE b.venue_id = ? AND b.status = 'submitted'
    ORDER BY b.submitted_at DESC, b.rowid DESC
  `).all(venueId)
  return rows.map(raw => {
    const fields = {}
    for (const field of BRIEF_CONTENT_FIELDS) fields[field] = raw[field] ?? null
    return {
      id: raw.id,
      venue_id: raw.venue_id,
      owner_user_id: raw.owner_user_id,
      status: raw.status,
      fields,
      field_provenance: parseJson(raw.field_provenance_json),
      created_at: raw.created_at,
      submitted_at: raw.submitted_at ?? null,
      review: raw.review_id
        ? { id: raw.review_id, status: raw.review_status, decided_at: raw.review_decided_at ?? null }
        : null,
    }
  })
}
