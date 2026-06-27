// Owner Meaning Capture — Raw Owner Answer Persistence (Slice 4D).
//
// Persists ONLY the owner's verbatim answer to a HESTIA interpreted-candidate question,
// plus the exact server-authored question/candidate snapshot context, into an ISOLATED,
// owner-writable, append-only-audited Venue Memory table. It is a SIBLING of
// discovery_candidate_reviews — a new, isolated record class in the same Memory layer,
// modeled field-for-field on discoveryCandidateReviewService.js's posture.
//
// Governing docs (binding, in precedence order):
//   docs/architecture/OWNER_MEANING_CAPTURE_DESIGN.md                 (4A — doctrine)
//   docs/architecture/OWNER_MEANING_CAPTURE_SCHEMA_REVIEW.md          (4C — schema review)
//   docs/architecture/OWNER_MEANING_CAPTURE_IMPLEMENTATION_DECISIONS.md (4C.1 — locked decisions)
//   docs/architecture/OWNER_MEANING_CAPTURE_DDL_CONTRACT.md           (4C.2 — exact DDL contract)
//
// HARD DOCTRINE (enforced by design — if a line here contradicts it, it is a bug):
//   - This layer preserves the owner's WORDS. It NEVER persists HESTIA's interpretation of
//     those words. The highest self-confirmation risk field (a HESTIA-authored meaning column)
//     does not exist in this schema and is impossible to express.
//   - owner_response_raw is stored BYTE-FOR-BYTE: validation may REJECT (blank / over 8000),
//     it NEVER rewrites, trims, case-folds, paraphrases, summarizes, translates, or truncates
//     the stored value.
//   - candidate_snapshot_json is SERVER-AUTHORED, mandatory (NOT NULL), and immutable. It is
//     built field-by-field from the live re-derived candidate — never spread wholesale, so no
//     routing earmark / promotion hint / ephemeral candidate id can leak into it.
//   - provenance is server-hard-coded 'owner_response'; record_space is server-hard-coded
//     'concept_draft' ('live_venue' is never written); status is server-set 'owner_answer_captured'.
//   - venue_id is the ACCESS BOUNDARY only — never the subject. The subject is the concept thread.
//   - This module IMPORTS NOTHING DNA-related. It NEVER calls mergeVenueDna and NEVER writes
//     venue_dna_json / venue_intelligence / venue_briefs / venue_dna_enrichment. (Asserted by test.)
//   - The status / provenance / event vocabulary makes confirmation IMPOSSIBLE TO EXPRESS:
//     there is NO confirmed / approved / promoted / final value and NO promotion-eligibility
//     handle anywhere.
//   - Append-only for content. A "changed answer" is a NEW row (supersession is a later slice).
//   - Deterministic. No AI, no prompts, no network. Dependency-injected db.

import { randomUUID, createHash } from 'node:crypto'

// ── Constants / controlled vocabulary ─────────────────────────────────────────

// Declares which fingerprint algorithm produced a row's candidate_fingerprint, so the
// algorithm can evolve to a _v2 without silently re-binding existing records (4C.1 §7).
export const OWNER_MEANING_FINGERPRINT_VERSION = 'owner_meaning_candidate_fingerprint_v1'

// Capture-record lifecycle vocabulary. The allow-list contains all three so a future flow needs
// no schema change; 4D EMITS only 'owner_answer_captured' (4C.2 §5). There is deliberately NO
// confirmation/promotion value — confirmation is unexpressible (vocabulary, not vigilance).
export const OWNER_MEANING_STATUSES = Object.freeze([
  'owner_answer_captured',
  'superseded_by_later_answer',
  'candidate_no_longer_present',
])
export const OWNER_MEANING_STATUS_CAPTURED = 'owner_answer_captured'

// Authority class — server-hard-coded, never client-supplied. Exactly one allowed value.
export const OWNER_MEANING_PROVENANCE = Object.freeze(['owner_response'])
export const OWNER_MEANING_PROVENANCE_DEFAULT = 'owner_response'

// Memory partition / conflation guard — server-hard-coded, never read from the client.
// 'live_venue' is never written here, so a draft can never be read as live-venue truth.
export const OWNER_MEANING_RECORD_SPACE = 'concept_draft'

// Audit event vocabulary. Allow-list contains all three; 4D emits only 'owner_answer_captured'
// (4C.2 §4). No confirmation/promotion event exists.
export const OWNER_MEANING_EVENT_TYPES = Object.freeze([
  'owner_answer_captured',
  'owner_answer_superseded',
  'candidate_no_longer_present',
])

// confidence_band is null or 'low' only, NEVER numeric. 4D leaves it null (4C.2 §5): the owner's
// words do not need a HESTIA-authored band to be preserved.
export const OWNER_MEANING_CONFIDENCE_BANDS = Object.freeze([null, 'low'])

// owner_response_raw bound — validation only; the stored value is never truncated (4C.1 §9).
export const OWNER_RESPONSE_RAW_MAX = 8000

// Audit-read (Slice 4D.2) pagination bounds. A read list is paged, newest-first, venue-scoped.
// An invalid/blank/<1 limit falls back to the default; a limit above the max is clamped DOWN to
// the max (never widened); a negative/invalid offset becomes 0. Read-only — no value here affects
// what is stored, only how much of the existing audit is returned at once.
export const OWNER_MEANING_LIST_DEFAULT_LIMIT = 25
export const OWNER_MEANING_LIST_MAX_LIMIT = 100

// ── small helpers (pure) ──────────────────────────────────────────────────────

function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0 }
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isUuidLike(v) { return isNonEmptyString(v) && UUID_RE.test(v.trim()) }
function serializeJson(v) {
  if (v === null || v === undefined) return null
  if (typeof v === 'string') return v
  return JSON.stringify(v)
}
function parseJson(v) { if (v === null || v === undefined) return null; try { return JSON.parse(v) } catch { return null } }
function badRequest(message) { const e = new Error(message); e.code = 'BAD_REQUEST'; return e }

// Count characters as code points (not UTF-16 code units) so the 8000 bound reflects characters.
function charLength(str) { return [...str].length }

// Pull the stable, real discovery_candidate_reviews.id values out of a candidate's evidence ref
// arrays (supporting + conflicting). These are the deterministic fingerprint inputs — never the
// ephemeral per-derivation candidate id (4C.2 §9). Returned sorted-ascending so array order can
// never vary the fingerprint.
function stableEvidenceReviewIds(candidate) {
  const out = []
  for (const key of ['supporting_evidence_refs', 'conflicting_evidence_refs']) {
    const refs = candidate && Array.isArray(candidate[key]) ? candidate[key] : []
    for (const ref of refs) {
      const id = ref && (ref.review_id ?? ref.id)
      if (isNonEmptyString(id)) out.push(String(id).trim())
    }
  }
  return [...new Set(out)].sort()
}

// ── DDL (single source of truth — shared by server boot and the in-memory tests) ─
//
// NOTE (load-bearing): owner_meaning_capture_events.capture_id is a LOGICAL reference, NOT a
// DB-enforced foreign key. The audit row is written BEFORE the capture row exists (audit-first;
// see createOwnerMeaningCapture). An enforced FK would reject that ordering. Do NOT add a FOREIGN
// KEY clause and do NOT enable PRAGMA foreign_keys for these tables (mirrors the discovery audit
// table). A HESTIA-authored "meaning" column is DELIBERATELY ABSENT from owner_meaning_captures.
//
// CHECK constraints encode the closed §5 vocabularies as a cheap second wall behind the
// service-level validation — they do not replace it (4C.2 §6).

export const OWNER_MEANING_CAPTURES_DDL = `
CREATE TABLE IF NOT EXISTS owner_meaning_captures (
  id                      TEXT    PRIMARY KEY,
  venue_id                TEXT    NOT NULL,
  concept_ref             TEXT    NOT NULL,
  candidate_fingerprint   TEXT    NOT NULL,
  fingerprint_version     TEXT    NOT NULL,
  candidate_snapshot_json TEXT    NOT NULL,
  snapshot_taken_at       TEXT    NOT NULL,
  question_text           TEXT    NOT NULL,
  question_reason         TEXT    NOT NULL,
  owner_response_raw      TEXT    NOT NULL,
  confidence_band         TEXT             CHECK (confidence_band IS NULL OR confidence_band = 'low'),
  uncertainty_notes_json  TEXT,
  provenance              TEXT    NOT NULL CHECK (provenance = 'owner_response'),
  record_space            TEXT    NOT NULL CHECK (record_space = 'concept_draft'),
  status                  TEXT    NOT NULL CHECK (status IN ('owner_answer_captured','superseded_by_later_answer','candidate_no_longer_present')),
  superseded_by           TEXT,
  supersedes              TEXT,
  created_by              TEXT    NOT NULL,
  created_at              TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_captures_venue_id                  ON owner_meaning_captures(venue_id);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_captures_venue_concept_ref         ON owner_meaning_captures(venue_id, concept_ref);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_captures_venue_candidate_fingerprint ON owner_meaning_captures(venue_id, candidate_fingerprint);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_captures_venue_status              ON owner_meaning_captures(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_captures_created_at                ON owner_meaning_captures(created_at);
`

export const OWNER_MEANING_CAPTURE_EVENTS_DDL = `
CREATE TABLE IF NOT EXISTS owner_meaning_capture_events (
  id                 TEXT NOT NULL PRIMARY KEY,
  venue_id           TEXT NOT NULL,
  capture_id         TEXT NOT NULL,
  event_type         TEXT NOT NULL CHECK (event_type IN ('owner_answer_captured','owner_answer_superseded','candidate_no_longer_present')),
  event_payload_json TEXT NOT NULL,
  created_by         TEXT NOT NULL,
  created_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_capture_events_venue_id   ON owner_meaning_capture_events(venue_id);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_capture_events_capture_id ON owner_meaning_capture_events(capture_id);
CREATE INDEX IF NOT EXISTS idx_owner_meaning_capture_events_created_at ON owner_meaning_capture_events(created_at);
`

// ── Fingerprint (deterministic, server-computed) ───────────────────────────────

/**
 * Deterministic candidate fingerprint. The SAME candidate produces the SAME fingerprint across
 * live derivations (the stable join key, since the per-derivation candidate id is ephemeral —
 * 4C.2 §9). Computed ONLY from stable inputs, in a fixed canonical order, with the evidence-id
 * list sorted so array order can never vary the result. Server-computed from server-trusted
 * evidence refs; a client-supplied fingerprint is NEVER accepted as authoritative.
 *
 * Disambiguation rule (locked for 4D): because deriveInterpretedCandidatesForVenue emits at most
 * ONE candidate per concept_ref, the tuple (record_space, concept_ref, candidate_type, sorted
 * stable supporting/conflicting review ids) fully identifies a 4D candidate. No free issue-text
 * input is needed to disambiguate, so the fingerprint stays fully mechanical and deterministic.
 *
 * @param input { record_space?, concept_ref, candidate_type, supporting_review_ids:[], fingerprint_version? }
 */
export function deriveOwnerMeaningCandidateFingerprint(input) {
  if (!input || typeof input !== 'object') throw badRequest('ownerMeaningCapture: fingerprint input object is required.')
  const conceptRef = isNonEmptyString(input.concept_ref) ? input.concept_ref.trim() : null
  const candidateType = isNonEmptyString(input.candidate_type) ? input.candidate_type.trim() : null
  if (!conceptRef) throw badRequest('ownerMeaningCapture: concept_ref is required for the fingerprint.')
  if (!candidateType) throw badRequest('ownerMeaningCapture: candidate_type is required for the fingerprint.')

  const ids = Array.isArray(input.supporting_review_ids)
    ? [...new Set(input.supporting_review_ids.filter(isNonEmptyString).map(v => String(v).trim()))].sort()
    : []
  if (ids.length === 0) throw badRequest('ownerMeaningCapture: at least one stable supporting evidence id is required for the fingerprint.')

  // Fixed key order + sorted id list → a stable canonical serialization, then a stable digest.
  const canonical = JSON.stringify({
    record_space: input.record_space || OWNER_MEANING_RECORD_SPACE,
    concept_ref: conceptRef,
    candidate_type: candidateType,
    supporting_review_ids: ids,
    fingerprint_version: input.fingerprint_version || OWNER_MEANING_FINGERPRINT_VERSION,
  })
  return createHash('sha256').update(canonical).digest('hex')
}

// ── Snapshot (server-authored, field-by-field) ─────────────────────────────────
//
// Build the immutable candidate snapshot from a live re-derived candidate. Built field-by-field
// (NEVER spread wholesale) so the ephemeral candidate id, any routing earmark, and any
// promotion/DNA hint are structurally excluded. The owner's answer is NOT part of the snapshot —
// it lives in owner_response_raw, kept separate (the snapshot is what HESTIA showed; the response
// is what the owner said; never merged). 4C.2 §10.

function buildCandidateSnapshot(candidate, candidateFingerprint) {
  const arr = (v) => (Array.isArray(v) ? v : [])
  return {
    candidate_type: candidate.candidate_type,
    concept_ref: candidate.concept_ref,
    status: candidate.status ?? null,
    interpretation_title: candidate.interpretation_title ?? null,
    interpretation_summary: candidate.interpretation_summary ?? null,
    suggested_owner_question: candidate.suggested_owner_question ?? null,
    supporting_evidence_refs: arr(candidate.supporting_evidence_refs),
    conflicting_evidence_refs: arr(candidate.conflicting_evidence_refs),
    missing_evidence: arr(candidate.missing_evidence),
    uncertainty_notes: arr(candidate.uncertainty_notes),
    // The candidate's OWN word band (or null) as displayed — only the word 'low' is preserved;
    // anything else (incl. any numeric) collapses to null. Never numeric, never raised.
    confidence_band: candidate.confidence_band === 'low' ? 'low' : null,
    created_from_summary_version: candidate.created_from_summary_version ?? null,
    // Self-describing so the snapshot can be re-verified against the stored fingerprint.
    candidate_fingerprint: candidateFingerprint,
    fingerprint_version: OWNER_MEANING_FINGERPRINT_VERSION,
  }
}

// The verbatim "why HESTIA asked" basis, drawn from the candidate's missing-evidence /
// uncertainty notes (4C.2 §3 col 9). Required and non-empty for the two emitted candidate types
// (their derivation always populates missing_evidence). A genuinely absent basis is a 400, never
// a fabricated reason and never a blank NOT NULL row.
function deriveQuestionReason(candidate) {
  const fromMissing = Array.isArray(candidate.missing_evidence)
    ? candidate.missing_evidence.filter(isNonEmptyString) : []
  if (fromMissing.length > 0) return fromMissing.join(' ')
  const fromNotes = Array.isArray(candidate.uncertainty_notes)
    ? candidate.uncertainty_notes.filter(isNonEmptyString) : []
  if (fromNotes.length > 0) return fromNotes.join(' ')
  return null
}

// ── Read shaping ───────────────────────────────────────────────────────────────

function shapeCaptureRow(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    venue_id: raw.venue_id,
    concept_ref: raw.concept_ref,
    candidate_fingerprint: raw.candidate_fingerprint,
    fingerprint_version: raw.fingerprint_version,
    candidate_snapshot: parseJson(raw.candidate_snapshot_json),
    snapshot_taken_at: raw.snapshot_taken_at,
    question_text: raw.question_text,
    question_reason: raw.question_reason,
    owner_response_raw: raw.owner_response_raw,
    confidence_band: raw.confidence_band ?? null,
    uncertainty_notes: parseJson(raw.uncertainty_notes_json),
    provenance: raw.provenance,
    record_space: raw.record_space,
    status: raw.status,
    superseded_by: raw.superseded_by ?? null,
    supersedes: raw.supersedes ?? null,
    created_by: raw.created_by,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  }
}

// ── Storage API (dependency-injected db) ───────────────────────────────────────

/**
 * Create one Owner Meaning Capture from an owner's verbatim answer to a server-derived
 * interpreted candidate. Owner-only at the route layer; never Venue DNA.
 *
 * AUDIT-FIRST ORDERING IS LOAD-BEARING — DO NOT REORDER, AND FKs MUST STAY OFF:
 *   1) mint capture.id (the audit references it, so it must exist as a value first),
 *   2) INSERT the append-only 'owner_answer_captured' audit event FIRST,
 *   3) THEN INSERT the capture row.
 * If step 3 fails, the orphan audit event is benign (a recorded attempt that did not land);
 * a state change must NEVER be un-audited. node:sqlite has no db.transaction(); consistency
 * comes from this ordering, not a transaction wrapper.
 *
 * The candidate is the SERVER-RE-DERIVED live candidate (the route re-derives it from req.venueId
 * and selects it by concept_ref). The snapshot, question_text, question_reason, candidate_type,
 * and fingerprint are all SERVER-AUTHORED from it — the client never supplies the snapshot body
 * or a trusted fingerprint.
 *
 * @param params { venueId, conceptRef, ownerResponseRaw, candidate, createdBy }
 * @returns the shaped, stored capture row.
 */
export function createOwnerMeaningCapture(db, params = {}) {
  const { venueId, conceptRef, ownerResponseRaw, candidate, createdBy } = params

  if (!isNonEmptyString(venueId)) throw badRequest('ownerMeaningCapture: venueId is required.')
  if (!isUuidLike(conceptRef)) throw badRequest('ownerMeaningCapture: a valid UUID concept_ref is required.')

  // Server-derived snapshot is mandatory: without a live candidate there is nothing to freeze.
  if (!candidate || typeof candidate !== 'object') {
    throw badRequest('ownerMeaningCapture: candidate_snapshot is required (no live candidate to capture).')
  }
  if (!isNonEmptyString(candidate.concept_ref) || candidate.concept_ref !== conceptRef) {
    throw badRequest('ownerMeaningCapture: candidate concept_ref does not match the requested concept_ref.')
  }
  if (!isNonEmptyString(candidate.candidate_type)) {
    throw badRequest('ownerMeaningCapture: candidate_type is required from the candidate snapshot.')
  }

  // question_text — verbatim, captured at ask time (never re-derived later).
  const questionText = candidate.suggested_owner_question
  if (!isNonEmptyString(questionText)) {
    throw badRequest('ownerMeaningCapture: question_text (suggested_owner_question) is required.')
  }
  // question_reason — the candidate's missing-evidence / contradiction basis, verbatim.
  const questionReason = deriveQuestionReason(candidate)
  if (!isNonEmptyString(questionReason)) {
    throw badRequest('ownerMeaningCapture: question_reason (candidate basis) is required.')
  }

  // Stable supporting evidence refs → required for a deterministic fingerprint.
  const supportingReviewIds = stableEvidenceReviewIds(candidate)
  if (supportingReviewIds.length === 0) {
    throw badRequest('ownerMeaningCapture: stable supporting evidence refs are required to fingerprint the candidate.')
  }

  // owner_response_raw — validate to ACCEPT/REJECT only; store the original bytes untouched.
  if (typeof ownerResponseRaw !== 'string' || ownerResponseRaw.trim().length === 0) {
    throw badRequest('ownerMeaningCapture: owner_response_raw must be a non-empty answer.')
  }
  if (charLength(ownerResponseRaw) > OWNER_RESPONSE_RAW_MAX) {
    throw badRequest(`ownerMeaningCapture: owner_response_raw exceeds ${OWNER_RESPONSE_RAW_MAX} characters.`)
  }

  // Server-computed fingerprint (never trusted from the client).
  const candidateFingerprint = deriveOwnerMeaningCandidateFingerprint({
    record_space: OWNER_MEANING_RECORD_SPACE,
    concept_ref: conceptRef,
    candidate_type: candidate.candidate_type,
    supporting_review_ids: supportingReviewIds,
    fingerprint_version: OWNER_MEANING_FINGERPRINT_VERSION,
  })

  const snapshot = buildCandidateSnapshot(candidate, candidateFingerprint)
  const uncertaintyNotes = Array.isArray(candidate.uncertainty_notes)
    ? candidate.uncertainty_notes.filter(isNonEmptyString) : []

  const captureId = randomUUID()
  const createdByValue = isNonEmptyString(createdBy) ? createdBy : 'owner'

  // ── STEP 2 — AUDIT-FIRST. This INSERT must precede the capture insert. capture_id is a
  //    LOGICAL ref (no enforced FK). ──
  db.prepare(`
    INSERT INTO owner_meaning_capture_events
      (id, venue_id, capture_id, event_type, event_payload_json, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(), venueId, captureId, OWNER_MEANING_STATUS_CAPTURED,
    JSON.stringify({
      to_status: OWNER_MEANING_STATUS_CAPTURED,
      concept_ref: conceptRef,
      candidate_fingerprint: candidateFingerprint,
      fingerprint_version: OWNER_MEANING_FINGERPRINT_VERSION,
    }),
    createdByValue,
  )

  // ── STEP 3 — INSERT the capture row. owner_response_raw is bound VERBATIM (the original bytes).
  //    provenance / record_space / status are SERVER-SET; confidence_band is left null in 4D. ──
  db.prepare(`
    INSERT INTO owner_meaning_captures
      (id, venue_id, concept_ref, candidate_fingerprint, fingerprint_version,
       candidate_snapshot_json, snapshot_taken_at, question_text, question_reason,
       owner_response_raw, confidence_band, uncertainty_notes_json, provenance, record_space,
       status, superseded_by, supersedes, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, NULL, ?, ?, ?, ?, NULL, NULL, ?, datetime('now'), datetime('now'))
  `).run(
    captureId, venueId, conceptRef, candidateFingerprint, OWNER_MEANING_FINGERPRINT_VERSION,
    serializeJson(snapshot), questionText, questionReason,
    ownerResponseRaw, uncertaintyNotes.length > 0 ? serializeJson(uncertaintyNotes) : null,
    OWNER_MEANING_PROVENANCE_DEFAULT, OWNER_MEANING_RECORD_SPACE,
    OWNER_MEANING_STATUS_CAPTURED, createdByValue,
  )

  return getOwnerMeaningCaptureById(db, venueId, captureId)
}

/**
 * Read one capture by id, venue-scoped and record_space-scoped. A cross-venue id → null (no
 * foreign read, no foreign write). Full, parsed snapshot. (Read helper for the route response
 * and tests — no read ROUTE is added in 4D.)
 */
export function getOwnerMeaningCaptureById(db, venueId, captureId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(captureId)) return null
  const raw = db.prepare(
    "SELECT * FROM owner_meaning_captures WHERE id = ? AND venue_id = ? AND record_space = 'concept_draft'"
  ).get(captureId, venueId)
  return shapeCaptureRow(raw)
}

/**
 * Read the append-only audit trail for one capture, venue-scoped (forensics / tests). Newest
 * first. The audit is a complete record regardless of whether the capture row landed.
 */
export function listOwnerMeaningCaptureEvents(db, venueId, captureId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(captureId)) return []
  return db.prepare(
    'SELECT * FROM owner_meaning_capture_events WHERE capture_id = ? AND venue_id = ? ORDER BY created_at DESC, rowid DESC'
  ).all(captureId, venueId).map(e => ({ ...e, event_payload: parseJson(e.event_payload_json) }))
}

// ── Audit read list (Slice 4D.2) ───────────────────────────────────────────────

// Clamp a requested page limit into [1, MAX]; any non-finite / <1 value falls back to the default.
// Never widens past the max — an over-large request is reduced, never honored.
function clampListLimit(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return OWNER_MEANING_LIST_DEFAULT_LIMIT
  const i = Math.floor(n)
  if (i < 1) return OWNER_MEANING_LIST_DEFAULT_LIMIT
  return Math.min(i, OWNER_MEANING_LIST_MAX_LIMIT)
}

// Clamp a requested offset to a non-negative integer; any non-finite / negative value becomes 0.
function clampListOffset(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 0
  const i = Math.floor(n)
  return i < 0 ? 0 : i
}

/**
 * Paginated, venue-scoped audit list of owner meaning captures, newest first. READ-ONLY: it runs
 * SELECTs only and mutates nothing. Venue scope is the SERVER-resolved venueId (the route passes
 * req.venueId) — a client can never widen it, and captures of another venue are never returned.
 *
 * Only the stable candidate identity (candidate_fingerprint) is offered as a filter — the ephemeral
 * per-derivation candidate id is deliberately NOT stored, so there is no candidate_id column to
 * filter on (and inventing one would be fabrication). Ordering is created_at DESC then rowid DESC
 * so ties (same-second inserts) stay deterministic for tests.
 *
 * @param db
 * @param venueId server-resolved access boundary (required)
 * @param opts { limit?, offset?, candidateFingerprint? }
 * @returns { captures: [shaped row + event_count], pagination: { limit, offset, count, has_more } }
 */
export function listOwnerMeaningCaptures(db, venueId, opts = {}) {
  const limit = clampListLimit(opts.limit)
  const offset = clampListOffset(opts.offset)
  if (!isNonEmptyString(venueId)) {
    return { captures: [], pagination: { limit, offset, count: 0, has_more: false } }
  }

  const where = ['venue_id = ?', "record_space = 'concept_draft'"]
  const args = [venueId]
  const fingerprint = isNonEmptyString(opts.candidateFingerprint) ? opts.candidateFingerprint.trim() : null
  if (fingerprint) { where.push('candidate_fingerprint = ?'); args.push(fingerprint) }
  const whereSql = where.join(' AND ')

  const total = db.prepare(`SELECT COUNT(*) AS n FROM owner_meaning_captures WHERE ${whereSql}`).get(...args).n

  const rows = db.prepare(
    `SELECT *,
       (SELECT COUNT(*) FROM owner_meaning_capture_events e
         WHERE e.capture_id = owner_meaning_captures.id AND e.venue_id = owner_meaning_captures.venue_id) AS event_count
     FROM owner_meaning_captures
     WHERE ${whereSql}
     ORDER BY created_at DESC, rowid DESC
     LIMIT ? OFFSET ?`
  ).all(...args, limit, offset)

  const captures = rows.map(r => {
    const shaped = shapeCaptureRow(r)
    shaped.event_count = Number.isFinite(Number(r.event_count)) ? Number(r.event_count) : 0
    return shaped
  })

  return {
    captures,
    pagination: { limit, offset, count: captures.length, has_more: offset + captures.length < total },
  }
}
