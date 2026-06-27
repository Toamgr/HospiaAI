// Owner Meaning Promotion — Read-only Candidate Queue (Slice 4G.1).
//
// Provides the two ISOLATED promotion tables' DDL and a STRICTLY READ-ONLY service over them:
// the proposal candidate queue (owner_meaning_promotion_candidates) and its append-only audit
// (owner_meaning_promotion_events). It is the read surface for stages 2–3 of the promotion model
// (proposal, approval) — AS OBSERVED, NEVER AS MUTATED.
//
// Governing docs (binding, in precedence order):
//   docs/architecture/OWNER_MEANING_PROMOTION_REVIEW_DESIGN.md              (4F  — doctrine)
//   docs/architecture/OWNER_MEANING_PROMOTION_DDL_CONTRACT.md               (4F.1 — exact DDL)
//   docs/architecture/OWNER_MEANING_PROMOTION_READ_API_CONTRACT.md          (4F.2 — read API)
//   docs/architecture/OWNER_MEANING_PROMOTION_READ_QUEUE_IMPLEMENTATION_PLAN.md (4G.0 — build sheet)
//
// HARD DOCTRINE (enforced by design — if a line here contradicts it, it is a bug):
//   - READ-ONLY. This module issues SELECTs only. It NEVER inserts, updates, deletes, creates an
//     event, changes a status, generates a candidate, refreshes confidence, or marks a candidate
//     reviewed/opened/approved. A read changes no byte of state.
//   - It IMPORTS NOTHING DNA-related. It NEVER calls mergeVenueDna and NEVER writes
//     venue_dna_json / venue_intelligence / venue_briefs / venue_dna_enrichment /
//     venue_intelligence_candidates. (Asserted by test.)
//   - There is NO proposal generator, NO approval/rejection/revision writer, NO apply-to-DNA here.
//     The ONLY rows that ever enter these tables in 4G.1 come from test seeds; no production code
//     path writes a candidate. The schema exists; the writes do not exist yet.
//   - venue_id is the ACCESS BOUNDARY only — never the subject, never client-supplied, never echoed
//     back in a response (4F.2 §4.3).
//   - Confidence is a reasoned word band ('low' | 'medium'); the internal numeric confidence_score
//     is NEVER surfaced (always null in the response) and is left null in 4G.
//   - Application (stage 4) is BLOCKED: application.blocked is always true; applied_* fields are
//     reserved/null; allowed_actions are all false.
//
// Deterministic. No AI, no prompts, no network. Dependency-injected db (node:sqlite compatible).

// ── Constants / controlled vocabulary (4F.1) ──────────────────────────────────

// Declares the contract version that produced a row, so the shape can evolve without re-binding
// old rows (4F.1 §3 col 36 / §4.1 col 15).
export const OWNER_MEANING_PROMOTION_SCHEMA_VERSION = 'owner_meaning_promotion_v1'

// Memory partition / conflation guard — server-hard-coded; a proposal is a draft, never live_venue
// (4F.1 §3 col 3). Reads filter on it.
export const OWNER_MEANING_PROMOTION_RECORD_SPACE = 'concept_draft'

// The candidate's own lifecycle (4F.1 §5). These EIGHT are the active, filterable, countable
// statuses. 'applied_to_dna_future' is RESERVED and unreachable (below) — NOT in this list, NOT
// filterable, NOT in counts.
export const OWNER_MEANING_PROMOTION_STATUSES = Object.freeze([
  'draft_suggestion',
  'needs_owner_review',
  'owner_approved',
  'owner_rejected',
  'revision_requested',
  'superseded',
  'expired',
  'application_blocked',
])

// RESERVED — a real Venue DNA write would reach this; no 4G.1 code transitions into it, and the
// read API never accepts it as a filter (→ 400) nor reports it in counts (4F.1 §5 / 4F.2 §5).
export const OWNER_MEANING_PROMOTION_RESERVED_STATUS = 'applied_to_dna_future'

// The full status set allowed by the storage-layer CHECK constraint. It INCLUDES the reserved
// value so a future application slice needs no migration — but reachability is enforced in code,
// never by the CHECK alone, and 4G.1 writes none of these (read-only).
export const OWNER_MEANING_PROMOTION_STATUS_CHECK_SET = Object.freeze([
  ...OWNER_MEANING_PROMOTION_STATUSES,
  OWNER_MEANING_PROMOTION_RESERVED_STATUS,
])

// The rendered confidence band — word band only, NEVER numeric (4F.1 §6.3). 'high' is not
// produced from owner-meaning evidence in 4G and is not accepted as a filter (→ 400).
export const OWNER_MEANING_PROMOTION_CONFIDENCE_LABELS = Object.freeze(['low', 'medium'])

// Audit event vocabulary (4F.1 §4.2). 'applied_to_dna_future' is reserved/inactive; no event is
// written by 4G.1 (read-only). There is NO confirmed / promoted_by_hestia / auto_applied event.
export const OWNER_MEANING_PROMOTION_EVENT_TYPES = Object.freeze([
  'candidate_created',
  'candidate_refreshed',
  'owner_review_opened',
  'owner_requested_revision',
  'owner_rejected',
  'owner_approved',
  'candidate_superseded',
  'candidate_expired',
  'application_blocked',
  'applied_to_dna_future',
])

// Audit actor classes (4F.1 §4.1 col 5). Never 'admin'/'manager' for a decision event.
export const OWNER_MEANING_PROMOTION_ACTOR_TYPES = Object.freeze(['owner', 'hestia_suggestion', 'system'])

// Server-controlled closed allow-list of promotable DNA target paths (4F.1 §6.2). NEVER free-form,
// NEVER client-supplied. Kept narrow + low-risk per the 4G recommendation. Used here only to
// VALIDATE the read-side target_path filter — no patching of any kind happens in a read slice.
export const OWNER_MEANING_PROMOTION_TARGET_PATHS = Object.freeze(['owner_notes', 'service_style'])

// Internal numeric confidence scale, if ever stored (4F.1 §6.3): 0.0–1.0. Left NULL in 4G; the
// CHECK enforces the range so an out-of-range value is rejected at the storage layer.
export const OWNER_MEANING_PROMOTION_CONFIDENCE_SCORE_MIN = 0.0
export const OWNER_MEANING_PROMOTION_CONFIDENCE_SCORE_MAX = 1.0

// Read-list pagination bounds (4F.2 §3.1 / §11). Invalid/blank/<1 limit → default; over-max → max
// (clamped down, never widened); invalid/negative offset → 0.
export const OWNER_MEANING_PROMOTION_LIST_DEFAULT_LIMIT = 25
export const OWNER_MEANING_PROMOTION_LIST_MAX_LIMIT = 100

// List source excerpts are a verbatim prefix of owner_response_raw, truncated to this length
// (4F.2 §8). Full raw text is detail-only.
export const OWNER_MEANING_PROMOTION_EXCERPT_MAX = 160

// The read-only forward-declared action hint (4F.2 §4.3). ALL false in this contract — a writer
// slice may later flip these, never here.
export const OWNER_MEANING_PROMOTION_ALLOWED_ACTIONS = Object.freeze({
  approve: false,
  reject: false,
  request_revision: false,
  apply_to_dna: false,
})

// Surfaced on every candidate's application object — application is blocked in this contract.
export const OWNER_MEANING_PROMOTION_APPLICATION_BLOCK_REASON =
  'Venue DNA application is not enabled in this contract.'

// ── small helpers (pure) ──────────────────────────────────────────────────────

function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0 }
function parseJson(v) { if (v === null || v === undefined) return null; try { return JSON.parse(v) } catch { return null } }
function badRequest(message) { const e = new Error(message); e.code = 'BAD_REQUEST'; return e }
function charLength(str) { return [...str].length }

function truncateChars(str, max) {
  const chars = [...str]
  return chars.length > max ? chars.slice(0, max).join('') : str
}

// Clamp a requested page limit into [1, MAX]; non-finite / <1 → default; over-max → clamped DOWN.
function clampListLimit(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return OWNER_MEANING_PROMOTION_LIST_DEFAULT_LIMIT
  const i = Math.floor(n)
  if (i < 1) return OWNER_MEANING_PROMOTION_LIST_DEFAULT_LIMIT
  return Math.min(i, OWNER_MEANING_PROMOTION_LIST_MAX_LIMIT)
}

// Clamp a requested offset to a non-negative integer; non-finite / negative → 0.
function clampListOffset(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  const i = Math.floor(n)
  return i < 0 ? 0 : i
}

// ── DDL (single source of truth — shared by server boot and the in-memory tests) ─
//
// NOTE (load-bearing): owner_meaning_promotion_events.candidate_id is a LOGICAL reference, NOT a
// DB-enforced foreign key. A future writer writes the audit row BEFORE the candidate row exists
// (audit-first ordering); an enforced FK would reject that ordering. Do NOT add a FOREIGN KEY
// clause and do NOT enable PRAGMA foreign_keys for these tables (mirrors the capture/discovery
// audit tables — current repo convention is FK-off for these audit-sibling tables).
//
// CHECK constraints encode the closed 4F.1 vocabularies as a cheap second wall behind the future
// writer's service-level validation — they do not replace it. The reserved fields applied_at /
// applied_by_user_id / dna_application_ref EXIST so a future application slice needs no migration,
// but are written by NO code path in 4G.1 (always null).

export const OWNER_MEANING_PROMOTION_CANDIDATES_DDL = `
CREATE TABLE IF NOT EXISTS owner_meaning_promotion_candidates (
  id                               TEXT    PRIMARY KEY,
  venue_id                         TEXT    NOT NULL,
  record_space                     TEXT    NOT NULL DEFAULT 'concept_draft' CHECK (record_space = 'concept_draft'),
  source_capture_ids_json          TEXT    NOT NULL,
  source_capture_fingerprints_json TEXT    NOT NULL,
  proposed_target_path             TEXT    NOT NULL,
  proposed_target_label            TEXT    NOT NULL,
  current_value_snapshot_json      TEXT    NOT NULL,
  proposed_value_json              TEXT    NOT NULL,
  proposed_meaning_summary         TEXT,
  proposed_dna_patch_json          TEXT    NOT NULL,
  proposal_rationale               TEXT,
  confidence_score                 REAL             DEFAULT NULL CHECK (confidence_score IS NULL OR (confidence_score >= 0.0 AND confidence_score <= 1.0)),
  confidence_label                 TEXT    NOT NULL DEFAULT 'low' CHECK (confidence_label IN ('low','medium')),
  confidence_factors_json          TEXT    NOT NULL,
  contradictions_json              TEXT,
  missing_evidence_json            TEXT,
  impact_note                      TEXT,
  status                           TEXT    NOT NULL DEFAULT 'draft_suggestion' CHECK (status IN ('draft_suggestion','needs_owner_review','owner_approved','owner_rejected','revision_requested','superseded','expired','application_blocked','applied_to_dna_future')),
  status_reason                    TEXT,
  created_by_actor_type            TEXT    NOT NULL CHECK (created_by_actor_type IN ('hestia_suggestion','system')),
  created_by_user_id               TEXT,
  created_at                       TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at                       TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by_user_id              TEXT,
  reviewed_at                      TEXT,
  owner_decision_note              TEXT,
  approved_at                      TEXT,
  rejected_at                      TEXT,
  superseded_by_candidate_id       TEXT,
  applied_at                       TEXT,
  applied_by_user_id               TEXT,
  dna_application_ref              TEXT,
  idempotency_key                  TEXT    NOT NULL,
  candidate_fingerprint            TEXT    NOT NULL,
  schema_version                   TEXT    NOT NULL DEFAULT 'owner_meaning_promotion_v1'
);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_promotion_candidates_venue_id          ON owner_meaning_promotion_candidates(venue_id);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_promotion_candidates_venue_status      ON owner_meaning_promotion_candidates(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_promotion_candidates_venue_target_path ON owner_meaning_promotion_candidates(venue_id, proposed_target_path);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_promotion_candidates_venue_fingerprint ON owner_meaning_promotion_candidates(venue_id, candidate_fingerprint);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_promotion_candidates_created_at        ON owner_meaning_promotion_candidates(created_at);
`

export const OWNER_MEANING_PROMOTION_EVENTS_DDL = `
CREATE TABLE IF NOT EXISTS owner_meaning_promotion_events (
  id                      TEXT NOT NULL PRIMARY KEY,
  venue_id                TEXT NOT NULL,
  candidate_id            TEXT NOT NULL,
  event_type              TEXT NOT NULL CHECK (event_type IN ('candidate_created','candidate_refreshed','owner_review_opened','owner_requested_revision','owner_rejected','owner_approved','candidate_superseded','candidate_expired','application_blocked','applied_to_dna_future')),
  actor_type              TEXT NOT NULL CHECK (actor_type IN ('owner','hestia_suggestion','system')),
  actor_user_id           TEXT,
  actor_role              TEXT,
  event_payload_json      TEXT NOT NULL,
  previous_status         TEXT,
  next_status             TEXT,
  target_path             TEXT,
  source_capture_ids_json TEXT,
  created_at              TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  idempotency_key         TEXT,
  schema_version          TEXT NOT NULL DEFAULT 'owner_meaning_promotion_v1'
);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_promotion_events_venue_id     ON owner_meaning_promotion_events(venue_id);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_promotion_events_candidate_id ON owner_meaning_promotion_events(candidate_id);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_promotion_events_created_at   ON owner_meaning_promotion_events(created_at);
`

// ── Read shaping (4F.2 §3.2 / §4.2) ────────────────────────────────────────────

// A short verbatim preview of the proposed value (list only). Never a confirmation, never applied.
function previewOf(jsonStr) {
  if (jsonStr === null || jsonStr === undefined) return null
  const s = typeof jsonStr === 'string' ? jsonStr : JSON.stringify(jsonStr)
  return truncateChars(s, OWNER_MEANING_PROMOTION_EXCERPT_MAX)
}

// A labeled excerpt of an owner capture's verbatim words (list only). The excerpt is a verbatim
// prefix of owner_response_raw, truncated to EXCERPT_MAX; is_excerpt makes truncation explicit so
// a UI never mistakes it for the full answer (4F.2 §8). Full raw text is detail-only.
function buildExcerpt(cap) {
  const raw = typeof cap.owner_response_raw === 'string' ? cap.owner_response_raw : ''
  return {
    capture_id: cap.id,
    created_at: cap.created_at,
    owner_response_excerpt: truncateChars(raw, OWNER_MEANING_PROMOTION_EXCERPT_MAX),
    is_excerpt: true,
    question_text: cap.question_text ?? null,
  }
}

// Resolve short labeled excerpts for a list row, venue-scoped. A capture id that does not resolve
// in-venue is simply not previewed (the honest count stays in source_capture_count); it is never
// fetched cross-venue.
function resolveExcerpts(db, venueId, ids) {
  const out = []
  for (const id of ids) {
    if (!isNonEmptyString(id)) continue
    const cap = db.prepare(
      "SELECT id, created_at, owner_response_raw, question_text FROM owner_meaning_captures WHERE id = ? AND venue_id = ? AND record_space = 'concept_draft'"
    ).get(id, venueId)
    if (cap) out.push(buildExcerpt(cap))
  }
  return out
}

// Shape one LIST candidate row (4F.2 §3.2). venue_id is OMITTED (access boundary, not data).
function shapeListRow(db, venueId, raw, includeSourcePreview) {
  const ids = parseJson(raw.source_capture_ids_json) || []
  const fingerprints = parseJson(raw.source_capture_fingerprints_json) || []
  return {
    id: raw.id,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    status: raw.status,
    status_reason: raw.status_reason ?? null,
    proposed_target_path: raw.proposed_target_path,
    proposed_target_label: raw.proposed_target_label,
    proposed_meaning_summary: raw.proposed_meaning_summary ?? null,
    proposed_value_preview: previewOf(raw.proposed_value_json),
    proposal_rationale: raw.proposal_rationale ?? null,
    confidence: {
      label: raw.confidence_label,
      score: null, // internal-only; NEVER surfaced as a user-facing number
      factors: parseJson(raw.confidence_factors_json) || {},
    },
    evidence: {
      source_capture_count: Array.isArray(ids) ? ids.length : 0,
      source_capture_fingerprints: Array.isArray(fingerprints) ? fingerprints : [],
      source_preview: includeSourcePreview ? resolveExcerpts(db, venueId, Array.isArray(ids) ? ids : []) : [],
    },
    review: {
      reviewed_at: raw.reviewed_at ?? null,
      reviewed_by_user_id: raw.reviewed_by_user_id ?? null,
      owner_decision_note: raw.owner_decision_note ?? null,
    },
    application: {
      applied_at: raw.applied_at ?? null,
      dna_application_ref: raw.dna_application_ref ?? null,
      blocked: true,
      block_reason: OWNER_MEANING_PROMOTION_APPLICATION_BLOCK_REASON,
    },
  }
}

// Shape the DETAIL candidate (4F.2 §4.2). venue_id is OMITTED. application blocked; confidence
// score null; the diff fields are PROPOSED, not applied.
function shapeDetailCandidate(raw) {
  return {
    id: raw.id,
    record_space: raw.record_space,
    status: raw.status,
    status_reason: raw.status_reason ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    proposed_target_path: raw.proposed_target_path,
    proposed_target_label: raw.proposed_target_label,
    current_value_snapshot_json: parseJson(raw.current_value_snapshot_json), // the BEFORE (historical)
    proposed_value_json: parseJson(raw.proposed_value_json),                 // the AFTER (bounded)
    proposed_meaning_summary: raw.proposed_meaning_summary ?? null,
    proposed_dna_patch_json: parseJson(raw.proposed_dna_patch_json),         // bounded delta — PROPOSED, not applied
    proposal_rationale: raw.proposal_rationale ?? null,
    confidence: {
      label: raw.confidence_label,
      score: null,
      factors: parseJson(raw.confidence_factors_json) || {},
      contradictions: parseJson(raw.contradictions_json) || [],
      missing_evidence: parseJson(raw.missing_evidence_json) || [],
    },
    impact_note: raw.impact_note ?? null,
    review: {
      reviewed_at: raw.reviewed_at ?? null,
      reviewed_by_user_id: raw.reviewed_by_user_id ?? null,
      owner_decision_note: raw.owner_decision_note ?? null,
      approved_at: raw.approved_at ?? null,
      rejected_at: raw.rejected_at ?? null,
    },
    application: {
      applied_at: raw.applied_at ?? null,
      applied_by_user_id: raw.applied_by_user_id ?? null,
      dna_application_ref: raw.dna_application_ref ?? null,
      blocked: true,
      block_reason: OWNER_MEANING_PROMOTION_APPLICATION_BLOCK_REASON,
    },
    superseded_by_candidate_id: raw.superseded_by_candidate_id ?? null,
    candidate_fingerprint: raw.candidate_fingerprint,
    schema_version: raw.schema_version,
  }
}

// ── Filter validation (4F.2 §3.1 / §8) ─────────────────────────────────────────
//
// Invalid CLOSED-VOCAB filter values throw BAD_REQUEST → the route returns 400 (a typo must not
// silently widen the result set). Operational params (limit/offset) clamp/default, never throw.
// Unknown param KEYS are simply not read here (the route never forwards them), so they cannot widen
// access. A client-supplied venue_id is never read.

function validatedStatusFilter(value) {
  if (value === undefined || value === null || value === '') return null
  if (value === OWNER_MEANING_PROMOTION_RESERVED_STATUS) {
    throw badRequest('Invalid status filter: applied_to_dna_future is reserved and cannot occur.')
  }
  if (!OWNER_MEANING_PROMOTION_STATUSES.includes(value)) {
    throw badRequest(`Invalid status filter: ${String(value)}.`)
  }
  return value
}

function validatedConfidenceLabelFilter(value) {
  if (value === undefined || value === null || value === '') return null
  if (!OWNER_MEANING_PROMOTION_CONFIDENCE_LABELS.includes(value)) {
    throw badRequest(`Invalid confidence_label filter: ${String(value)}.`)
  }
  return value
}

function validatedTargetPathFilter(value) {
  if (value === undefined || value === null || value === '') return null
  if (!OWNER_MEANING_PROMOTION_TARGET_PATHS.includes(value)) {
    throw badRequest(`Invalid target_path filter: ${String(value)}.`)
  }
  return value
}

// Per-status counts over the venue's candidates (4F.2 §11). Covers the 8 active statuses only; the
// reserved status is excluded (including a perpetual 0 would imply it is reachable).
function computeCounts(db, venueId) {
  const counts = {}
  for (const s of OWNER_MEANING_PROMOTION_STATUSES) counts[s] = 0
  if (!isNonEmptyString(venueId)) return counts
  const rows = db.prepare(
    "SELECT status, COUNT(*) AS n FROM owner_meaning_promotion_candidates WHERE venue_id = ? AND record_space = 'concept_draft' GROUP BY status"
  ).all(venueId)
  for (const r of rows) {
    if (Object.prototype.hasOwnProperty.call(counts, r.status)) counts[r.status] = Number(r.n) || 0
  }
  return counts
}

// ── Read API (dependency-injected db) — SELECT-ONLY ────────────────────────────

/**
 * Paginated, venue-scoped candidate queue, newest first. READ-ONLY: SELECTs only, mutates nothing.
 * Venue scope is the SERVER-resolved venueId (the route passes req.venueId); a client can never
 * widen it. Invalid closed-vocab filters throw BAD_REQUEST (→ 400); invalid limit/offset clamp.
 *
 * @param db
 * @param venueId server-resolved access boundary (required)
 * @param options { limit?, offset?, status?, targetPath?, confidenceLabel?, includeCounts?, includeSourcePreview? }
 * @returns { candidates: [shaped list row], pagination: { limit, offset, count, has_more }, counts? }
 */
export function listOwnerMeaningPromotionCandidates(db, venueId, options = {}) {
  const opts = options || {}
  const limit = clampListLimit(opts.limit)
  const offset = clampListOffset(opts.offset)
  const includeCounts = opts.includeCounts !== false      // default true
  const includeSourcePreview = opts.includeSourcePreview !== false // default true

  // Validate closed-vocab filters FIRST (an invalid filter is a 400 regardless of venue).
  const statusFilter = validatedStatusFilter(opts.status)
  const confidenceLabelFilter = validatedConfidenceLabelFilter(opts.confidenceLabel)
  const targetPathFilter = validatedTargetPathFilter(opts.targetPath)

  if (!isNonEmptyString(venueId)) {
    return {
      candidates: [],
      pagination: { limit, offset, count: 0, has_more: false },
      ...(includeCounts ? { counts: computeCounts(db, venueId) } : {}),
    }
  }

  const where = ['venue_id = ?', "record_space = 'concept_draft'"]
  const args = [venueId]
  if (statusFilter) { where.push('status = ?'); args.push(statusFilter) }
  if (confidenceLabelFilter) { where.push('confidence_label = ?'); args.push(confidenceLabelFilter) }
  if (targetPathFilter) { where.push('proposed_target_path = ?'); args.push(targetPathFilter) }
  const whereSql = where.join(' AND ')

  const total = db.prepare(
    `SELECT COUNT(*) AS n FROM owner_meaning_promotion_candidates WHERE ${whereSql}`
  ).get(...args).n

  const rows = db.prepare(
    `SELECT * FROM owner_meaning_promotion_candidates
     WHERE ${whereSql}
     ORDER BY created_at DESC, rowid DESC
     LIMIT ? OFFSET ?`
  ).all(...args, limit, offset)

  const candidates = rows.map(r => shapeListRow(db, venueId, r, includeSourcePreview))

  return {
    candidates,
    pagination: { limit, offset, count: candidates.length, has_more: offset + candidates.length < total },
    ...(includeCounts ? { counts: computeCounts(db, venueId) } : {}),
  }
}

/**
 * Read one candidate by id, venue-scoped and record_space-scoped. A cross-venue id OR an unknown
 * id → null (the route turns both into an identical safe 404; no existence leak). venue_id is
 * omitted from the shaped result. READ-ONLY.
 */
export function getOwnerMeaningPromotionCandidateById(db, venueId, candidateId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(candidateId)) return null
  const raw = db.prepare(
    "SELECT * FROM owner_meaning_promotion_candidates WHERE id = ? AND venue_id = ? AND record_space = 'concept_draft'"
  ).get(candidateId, venueId)
  if (!raw) return null
  return shapeDetailCandidate(raw)
}

/**
 * Read the append-only audit trail for one candidate, venue-scoped, newest first. READ-ONLY.
 */
export function listOwnerMeaningPromotionEvents(db, venueId, candidateId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(candidateId)) return []
  return db.prepare(
    'SELECT * FROM owner_meaning_promotion_events WHERE candidate_id = ? AND venue_id = ? ORDER BY created_at DESC, rowid DESC'
  ).all(candidateId, venueId).map(e => ({
    id: e.id,
    event_type: e.event_type,
    created_at: e.created_at,
    actor_type: e.actor_type,
    actor_role: e.actor_role ?? null,
    previous_status: e.previous_status ?? null,
    next_status: e.next_status ?? null,
    target_path: e.target_path ?? null,
    event_payload_json: parseJson(e.event_payload_json),
  }))
}

/**
 * Resolve the source captures for one candidate as VERBATIM evidence, venue-scoped. The candidate's
 * source_capture_ids_json is re-read from storage (by the candidate's stable id), then each id is
 * resolved against owner_meaning_captures WITHIN the same venue. A referenced capture that does not
 * resolve in-venue (deleted, never existed here, or cross-venue) is represented as a placeholder
 * { id, missing: true } — never silently dropped (the reference count stays honest) and never
 * fetched from another venue. Detail returns the FULL owner_response_raw byte-for-byte (4F.2 §8).
 * READ-ONLY.
 *
 * @param db
 * @param venueId server-resolved access boundary
 * @param candidate the shaped detail candidate (uses its stable id)
 * @returns array of resolved capture evidence rows / { id, missing: true } placeholders
 */
export function resolveSourceCapturesForPromotionCandidate(db, venueId, candidate) {
  if (!isNonEmptyString(venueId) || !candidate || !isNonEmptyString(candidate.id)) return []
  const rawRef = db.prepare(
    "SELECT source_capture_ids_json FROM owner_meaning_promotion_candidates WHERE id = ? AND venue_id = ? AND record_space = 'concept_draft'"
  ).get(candidate.id, venueId)
  if (!rawRef) return []
  const ids = parseJson(rawRef.source_capture_ids_json) || []
  if (!Array.isArray(ids)) return []

  return ids.map(id => {
    if (!isNonEmptyString(id)) return { id: String(id), missing: true }
    const cap = db.prepare(
      "SELECT * FROM owner_meaning_captures WHERE id = ? AND venue_id = ? AND record_space = 'concept_draft'"
    ).get(id, venueId)
    if (!cap) return { id, missing: true }
    const eventCount = db.prepare(
      'SELECT COUNT(*) AS n FROM owner_meaning_capture_events WHERE capture_id = ? AND venue_id = ?'
    ).get(id, venueId).n
    return {
      id: cap.id,
      created_at: cap.created_at,
      owner_response_raw: cap.owner_response_raw, // FULL, byte-for-byte — never rewritten/summarized
      question_text: cap.question_text,
      question_reason: cap.question_reason,
      candidate_snapshot_json: parseJson(cap.candidate_snapshot_json),
      candidate_fingerprint: cap.candidate_fingerprint,
      event_count: Number.isFinite(Number(eventCount)) ? Number(eventCount) : 0,
    }
  })
}
