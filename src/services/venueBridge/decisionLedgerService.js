// F&B Decision Ledger Service — Phase 2 (write-only-first foundation).
//
// Records WHY F&B decisions were made (rationale, evidence, confidence, assumptions,
// snapshots, constraints, validation targets). This is the durable decision memory
// that later unlocks on-demand "why?" explanations (Phase 4), provenance-gated
// Venue/Taste DNA feedback candidates (Phase 6), and POS validation (Phase 8).
//
// Doctrine: docs/architecture/DECISION_LEDGER_DOCTRINE.md +
//           docs/architecture/FNB_DECISION_LEDGER_IMPLEMENTATION_SPEC.md
//
// HARD RULES (enforced by design):
//   - Dependency-injected db: every function receives `db` explicitly. This module
//     never imports the live database.
//   - No AI calls. No prompt logic. No generation behavior.
//   - No Venue DNA / venue_intelligence / venue_briefs / venue_dna_enrichment writes.
//   - No Event Cocktail Menu Builder import. No Cocktail Lab import.
//   - Never fabricates data: absent optional fields are stored as NULL (no fake {}/[]).
//   - Every read and write is venue-scoped.
//
// `db` is a node:sqlite DatabaseSync handle (or any object exposing the same
// prepare().run()/get()/all() interface — e.g. an in-memory DB in tests).

import { randomUUID } from 'node:crypto'

// ── Controlled vocabularies (validated in code, not via DB CHECK) ────────────────

// Active in Phase 2 (the three real CI write points wired in Phase 3):
//   cocktail_menu_generated → POST /api/ci/generate (menu flow)
//   cocktail_selected       → POST /api/ci/cocktails
//   cocktail_rejected       → POST /api/ci/rejections
// The remaining values are reserved for later phases (accepted, but not yet written live).
export const DECISION_TYPES = Object.freeze([
  'cocktail_menu_generated',
  'cocktail_selected',
  'cocktail_rejected',
  // reserved (later phases):
  'recipe_adjusted',
  'taste_direction_chosen',
  'menu_architecture_chosen',
  'operational_constraint_identified',
  'pricing_assumption_made',
  'future_pos_validation_target_created',
])

export const DECISION_STATUSES = Object.freeze(['recorded', 'superseded', 'archived'])

export const HUMAN_REVIEW_STATUSES = Object.freeze(['unreviewed', 'approved', 'rejected', 'needs_changes'])

// Which engine produced the decision. Kept narrow to prevent naming drift.
export const SOURCE_ENGINES = Object.freeze(['ci_omer', 'cocktail_lab', 'event_builder', 'system'])

// Provenance + evidence vocabularies (documented; carried inside JSON payloads).
export const PROVENANCE_TYPES = Object.freeze([
  'owner_conversation', 'specialist_decision', 'sales_signal', 'ai_inference', 'operational_event',
])
export const EVIDENCE_TYPES = Object.freeze([
  'venue_dna', 'taste_dna', 'omer_brief', 'classic_calibration', 'costing', 'rejection_history', 'operational_signal',
])

// ── DDL (single source of truth — shared by server boot and the in-memory test) ──

export const FB_DECISIONS_DDL = `
CREATE TABLE IF NOT EXISTS fb_decisions (
  id                              TEXT    PRIMARY KEY,
  venue_id                        TEXT    NOT NULL,
  decision_type                   TEXT    NOT NULL,
  source_engine                   TEXT    NOT NULL,
  source_request_id               TEXT,
  related_menu_id                 INTEGER,
  related_cocktail_id             INTEGER,
  related_event_id                TEXT,
  subject_ref_json                TEXT,
  decision_title                  TEXT,
  decision_summary                TEXT,
  decision_payload_json           TEXT,
  venue_dna_snapshot_json         TEXT,
  venue_dna_hash                  TEXT,
  taste_profile_target_json       TEXT,
  recipe_snapshot_json            TEXT,
  menu_snapshot_json              TEXT,
  operational_constraints_json    TEXT,
  assumptions_json                TEXT,
  missing_fields_json             TEXT,
  evidence_json                   TEXT,
  provenance_json                 TEXT,
  confidence_json                 TEXT,
  explanation_basis_json          TEXT,
  future_validation_targets_json  TEXT,
  status                          TEXT    NOT NULL DEFAULT 'recorded',
  human_review_status             TEXT    NOT NULL DEFAULT 'unreviewed',
  approved_by                     TEXT,
  approved_at                     TEXT,
  created_at                      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at                      TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_fb_decisions_venue       ON fb_decisions(venue_id);
CREATE INDEX IF NOT EXISTS idx_fb_decisions_venue_type  ON fb_decisions(venue_id, decision_type);
CREATE INDEX IF NOT EXISTS idx_fb_decisions_venue_time  ON fb_decisions(venue_id, created_at);
`

// Columns that hold compact JSON. Serialized on write, parsed on read.
// Absent values stay NULL — never a fabricated {} / [].
const JSON_FIELDS = Object.freeze([
  'subject_ref_json',
  'decision_payload_json',
  'venue_dna_snapshot_json',
  'taste_profile_target_json',
  'recipe_snapshot_json',
  'menu_snapshot_json',
  'operational_constraints_json',
  'assumptions_json',
  'missing_fields_json',
  'evidence_json',
  'provenance_json',
  'confidence_json',
  'explanation_basis_json',
  'future_validation_targets_json',
])

// Plain (non-JSON) optional scalar columns.
const SCALAR_OPTIONAL_FIELDS = Object.freeze([
  'source_request_id',
  'related_menu_id',
  'related_cocktail_id',
  'related_event_id',
  'decision_title',
  'decision_summary',
  'venue_dna_hash',
])

// ── Internal helpers (pure) ─────────────────────────────────────────────────────

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0
}

// Serialize a value to compact JSON, preserving NULL for absent values.
// `null`/`undefined` → null (no fake defaults). Strings already containing JSON
// are passed through if they are objects/arrays; otherwise the value is stringified.
function serializeJson(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') {
    // Allow callers to pass a pre-serialized JSON string; store as-is.
    return value
  }
  return JSON.stringify(value)
}

function parseJson(value) {
  if (value === null || value === undefined) return null
  try { return JSON.parse(value) } catch { return null }
}

// Normalize an optional scalar: '' / undefined → null; numbers pass through.
function normScalar(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value.trim() === '' ? null : value
  return value
}

/**
 * Pure validator + normalizer. Returns a fully-shaped row object ready for INSERT.
 * Throws on invalid required fields / vocabularies. No db, no side effects.
 * Absent optional fields become null (never fabricated).
 */
export function buildFbDecisionRecord(venueId, input = {}) {
  if (!isNonEmptyString(venueId)) {
    throw new Error('decisionLedger: venueId is required.')
  }
  if (!input || typeof input !== 'object') {
    throw new Error('decisionLedger: input object is required.')
  }
  if (!DECISION_TYPES.includes(input.decision_type)) {
    throw new Error(`decisionLedger: invalid decision_type "${input.decision_type}".`)
  }
  if (!SOURCE_ENGINES.includes(input.source_engine)) {
    throw new Error(`decisionLedger: invalid source_engine "${input.source_engine}".`)
  }
  const status = input.status === undefined || input.status === null ? 'recorded' : input.status
  if (!DECISION_STATUSES.includes(status)) {
    throw new Error(`decisionLedger: invalid status "${status}".`)
  }
  const humanReview = input.human_review_status === undefined || input.human_review_status === null
    ? 'unreviewed'
    : input.human_review_status
  if (!HUMAN_REVIEW_STATUSES.includes(humanReview)) {
    throw new Error(`decisionLedger: invalid human_review_status "${humanReview}".`)
  }

  const row = {
    id: isNonEmptyString(input.id) ? input.id : randomUUID(),
    venue_id: venueId,
    decision_type: input.decision_type,
    source_engine: input.source_engine,
    status,
    human_review_status: humanReview,
    approved_by: normScalar(input.approved_by),
    approved_at: normScalar(input.approved_at),
  }
  for (const f of SCALAR_OPTIONAL_FIELDS) row[f] = normScalar(input[f])
  for (const f of JSON_FIELDS) {
    // Accept either the *_json key or a convenience key without the suffix.
    const bare = f.replace(/_json$/, '')
    const value = input[f] !== undefined ? input[f] : input[bare]
    row[f] = serializeJson(value)
  }
  return row
}

// Shape a raw DB row into a consumer object. Each JSON column is kept as its raw
// `*_json` value (string|null) AND exposed parsed under its bare key
// (e.g. `taste_profile_target_json` raw + `taste_profile_target` parsed), so both
// raw-null checks and ergonomic parsed access work.
function shapeRow(raw) {
  if (!raw) return null
  const out = { ...raw }
  for (const f of JSON_FIELDS) {
    const bare = f.replace(/_json$/, '')
    out[bare] = parseJson(raw[f])
  }
  return out
}

// Ordered column list for INSERT (created_at/updated_at use DB defaults).
const INSERT_COLUMNS = Object.freeze([
  'id', 'venue_id', 'decision_type', 'source_engine',
  ...SCALAR_OPTIONAL_FIELDS,
  ...JSON_FIELDS,
  'status', 'human_review_status', 'approved_by', 'approved_at',
])

// ── Public API (dependency-injected db) ─────────────────────────────────────────

/**
 * Append one decision. Returns { ok, id }. Throws on validation error.
 * Caller (Phase 3) MUST wrap this so a write failure never blocks generation.
 */
export function createFbDecision(db, venueId, input = {}) {
  const row = buildFbDecisionRecord(venueId, input)
  const placeholders = INSERT_COLUMNS.map(() => '?').join(', ')
  const sql = `INSERT INTO fb_decisions (${INSERT_COLUMNS.join(', ')}) VALUES (${placeholders})`
  db.prepare(sql).run(...INSERT_COLUMNS.map(c => row[c]))
  return { ok: true, id: row.id }
}

/**
 * Non-blocking wrapper around createFbDecision. This is the ONLY entry point live
 * routes (Phase 3) should call. It NEVER throws: any error (validation, db, etc.)
 * is caught and returned as { ok: false, error }, so a ledger failure can never
 * block or alter generation, save, or rejection behavior.
 *
 * `onError` (optional) is invoked with the caught error for safe logging. If
 * `onError` itself throws, that is swallowed too — this function still never throws.
 *
 * Returns { ok: true, decisionId } on success, or { ok: false, error } on failure.
 * No AI, no Venue DNA mutation, no Event/Lab imports — same purity as the rest of
 * the service.
 */
export function safeRecordFbDecision(db, venueId, input = {}, onError) {
  try {
    const { id } = createFbDecision(db, venueId, input)
    return { ok: true, decisionId: id }
  } catch (error) {
    if (typeof onError === 'function') {
      try { onError(error) } catch { /* logging must never break the caller */ }
    }
    return { ok: false, error: error && error.message ? error.message : String(error) }
  }
}

/** Read one decision by id, venue-scoped. Returns the shaped row or null. */
export function getFbDecisionById(db, venueId, decisionId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(decisionId)) return null
  const raw = db.prepare('SELECT * FROM fb_decisions WHERE id = ? AND venue_id = ?').get(decisionId, venueId)
  return shapeRow(raw)
}

/**
 * List decisions for a venue (newest first). filters: { limit, offset, since }.
 * limit clamped to [1, 200] (default 50). `since` is a created_at lower bound.
 */
export function listFbDecisionsForVenue(db, venueId, filters = {}) {
  if (!isNonEmptyString(venueId)) return []
  const limit = Math.max(1, Math.min(200, Number(filters.limit) || 50))
  const offset = Math.max(0, Number(filters.offset) || 0)
  const since = isNonEmptyString(filters.since) ? filters.since : null
  // rowid DESC is the deterministic insertion-order tiebreaker when created_at
  // collides at one-second resolution (append-only ledger, rapid writes).
  const sql = since
    ? 'SELECT * FROM fb_decisions WHERE venue_id = ? AND created_at >= ? ORDER BY created_at DESC, rowid DESC LIMIT ? OFFSET ?'
    : 'SELECT * FROM fb_decisions WHERE venue_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ? OFFSET ?'
  const rows = since
    ? db.prepare(sql).all(venueId, since, limit, offset)
    : db.prepare(sql).all(venueId, limit, offset)
  return rows.map(shapeRow)
}

/** List decisions of one type for a venue (newest first). Throws on invalid type. */
export function listFbDecisionsByType(db, venueId, decisionType) {
  if (!DECISION_TYPES.includes(decisionType)) {
    throw new Error(`decisionLedger: invalid decision_type "${decisionType}".`)
  }
  if (!isNonEmptyString(venueId)) return []
  const rows = db.prepare(
    'SELECT * FROM fb_decisions WHERE venue_id = ? AND decision_type = ? ORDER BY created_at DESC, rowid DESC'
  ).all(venueId, decisionType)
  return rows.map(shapeRow)
}

/**
 * Mark a decision's human review status. The ONLY post-create mutation allowed.
 * Updates human_review_status, approved_by, approved_at (on approval), updated_at.
 * Does NOT touch decision content and NEVER mutates Venue DNA.
 * Returns { ok } or throws if the decision does not exist for this venue.
 */
export function markFbDecisionReviewed(db, venueId, decisionId, reviewInput = {}) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(decisionId)) {
    throw new Error('decisionLedger: venueId and decisionId are required.')
  }
  const status = reviewInput.human_review_status
  if (!HUMAN_REVIEW_STATUSES.includes(status)) {
    throw new Error(`decisionLedger: invalid human_review_status "${status}".`)
  }
  const existing = db.prepare('SELECT id FROM fb_decisions WHERE id = ? AND venue_id = ?').get(decisionId, venueId)
  if (!existing) {
    throw new Error('decisionLedger: decision not found for this venue.')
  }
  const approvedBy = normScalar(reviewInput.approved_by)
  db.prepare(`
    UPDATE fb_decisions
    SET human_review_status = ?,
        approved_by = ?,
        approved_at = CASE WHEN ? = 'approved' THEN datetime('now') ELSE approved_at END,
        updated_at = datetime('now')
    WHERE id = ? AND venue_id = ?
  `).run(status, approvedBy, status, decisionId, venueId)
  return { ok: true }
}

// ── Optional pure mapping helper (NO live usage in Phase 2) ──────────────────────
//
// Maps a CI/Omer generation context into the createFbDecision input shape. Pure:
// returns a plain object; performs no db write and is not called by any live route.
// Documents the Phase 3 mapping without wiring it.
export function buildFbDecisionFromCiGeneration(input = {}) {
  const i = input || {}
  return {
    decision_type: 'cocktail_menu_generated',
    source_engine: 'ci_omer',
    source_request_id: i.requestId ?? null,
    related_menu_id: i.menuId ?? null,
    decision_title: i.title ?? null,
    decision_summary: i.summary ?? null,
    decision_payload: i.params ?? null,
    venue_dna_snapshot: i.venueDnaSnapshot ?? null,
    venue_dna_hash: i.venueDnaHash ?? null,
    taste_profile_target: i.tasteProfileTarget ?? null,
    operational_constraints: i.operationalConstraints ?? null,
    assumptions: i.assumptions ?? null,
    missing_fields: i.missingFields ?? null,
    evidence: i.evidence ?? null,
    provenance: i.provenance ?? { origin: 'specialist_decision' },
    confidence: i.confidence ?? null,
    explanation_basis: i.explanationBasis ?? null,
    future_validation_targets: i.futureValidationTargets ?? null,
  }
}
