// F&B → Venue Intelligence Feedback Service — Phase 6A (isolated candidates).
//
// Derives CANDIDATE learning signals from recorded F&B decisions and stores them in
// an ISOLATED table (venue_intelligence_candidates). A candidate is a *proposal*
// awaiting human review — NEVER confirmed Venue DNA, NEVER truth.
//
// Doctrine: docs/architecture/FNB_TO_VENUE_INTELLIGENCE_FEEDBACK_PHASE_6_PLAN.md,
//           docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md
//
// HARD RULES (enforced by design):
//   - Deterministic. No AI, no prompts, no network.
//   - Dependency-injected db for storage; never imports the live db.
//   - NEVER mutates Venue DNA: no writes to venue_intelligence / venue_briefs /
//     venue_dna_enrichment, no mergeVenueDna, no promotion path.
//   - No Event Builder / Cocktail Lab imports. No generation behavior.
//   - Candidate-only: status defaults to 'candidate'; nothing here confirms truth.
//   - Conservative: generation produces NO candidate; selection produces NO candidate
//     in Phase 6A; only explicit rejection reasons/constraints produce candidates.
//   - Never fabricates evidence; absent optional fields stay NULL (no fake defaults).
//   - A single decision never yields 'high' confidence.

import { randomUUID } from 'node:crypto'

// ── Controlled vocabularies ──────────────────────────────────────────────────

// Phase 6A active types only. Others are reserved (see the Phase 6 plan §4).
export const CANDIDATE_TYPES = Object.freeze([
  'taste_direction_signal',
  'operational_constraint_signal',
  // reserved for later phases (NOT derived in 6A):
  'guest_preference_signal',
  'menu_positioning_signal',
  'pricing_sensitivity_signal',
  'preparation_capacity_signal',
  'service_complexity_signal',
  'venue_identity_signal',
])

// Types Phase 6A is allowed to DERIVE (a stricter subset of CANDIDATE_TYPES).
const DERIVABLE_TYPES_6A = Object.freeze(['taste_direction_signal', 'operational_constraint_signal'])

export const CANDIDATE_STATUSES = Object.freeze(['candidate', 'superseded', 'archived'])

// `unreviewed` is the creation default. The rest are set by human review (Phase 7A).
// NOTE: there is deliberately NO 'promoted_to_dna' status — accepted = useful signal
// only, never Venue DNA promotion (promotion is a separate, later, owner-gated phase).
export const HUMAN_REVIEW_STATUSES = Object.freeze(['unreviewed', 'reviewed', 'accepted', 'rejected', 'needs_changes'])

// The subset a human review ACTION may set (cannot set back to 'unreviewed').
export const REVIEW_ACTION_STATUSES = Object.freeze(['reviewed', 'accepted', 'rejected', 'needs_changes'])

export const CONFIDENCE_LEVELS = Object.freeze(['low', 'medium']) // never 'high' from F&B feedback in 6A

export const SOURCE_DOMAIN = 'fnb'

// Explicit rejection reasons mapped to a candidate type. Only EXPLICIT reasons
// produce candidates; anything not listed yields no candidate (no inference).
const REASON_TO_CANDIDATE = Object.freeze({
  // taste direction (explicit palate feedback)
  too_sweet:   { type: 'taste_direction_signal', note: 'rejected as too sweet' },
  too_sour:    { type: 'taste_direction_signal', note: 'rejected as too sour' },
  too_bitter:  { type: 'taste_direction_signal', note: 'rejected as too bitter' },
  too_boozy:   { type: 'taste_direction_signal', note: 'rejected as too boozy' },
  too_bland:   { type: 'taste_direction_signal', note: 'rejected as too bland' },
  off_balance: { type: 'taste_direction_signal', note: 'rejected as off balance' },
  // operational constraints (explicit execution feedback)
  too_complex:      { type: 'operational_constraint_signal', note: 'rejected as too complex to execute' },
  too_slow:         { type: 'operational_constraint_signal', note: 'rejected as too slow for service' },
  no_equipment:     { type: 'operational_constraint_signal', note: 'rejected — required equipment unavailable' },
  ingredient_unavailable: { type: 'operational_constraint_signal', note: 'rejected — ingredient unavailable' },
  prep_heavy:       { type: 'operational_constraint_signal', note: 'rejected — prep burden too high' },
})

// ── DDL (single source of truth — shared by server boot and the in-memory test) ─

export const VENUE_INTELLIGENCE_CANDIDATES_DDL = `
CREATE TABLE IF NOT EXISTS venue_intelligence_candidates (
  id                   TEXT    PRIMARY KEY,
  venue_id             TEXT    NOT NULL,
  source_domain        TEXT    NOT NULL,
  source_decision_id   TEXT,
  candidate_type       TEXT    NOT NULL,
  candidate_summary    TEXT,
  candidate_payload_json TEXT,
  evidence_json        TEXT,
  provenance_json      TEXT,
  confidence_json      TEXT,
  status               TEXT    NOT NULL DEFAULT 'candidate',
  human_review_status  TEXT    NOT NULL DEFAULT 'unreviewed',
  reviewed_by          TEXT,
  reviewed_at          TEXT,
  review_note          TEXT,
  created_at           TEXT    DEFAULT CURRENT_TIMESTAMP,
  updated_at           TEXT    DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_vic_venue        ON venue_intelligence_candidates(venue_id);
CREATE INDEX IF NOT EXISTS idx_vic_venue_type   ON venue_intelligence_candidates(venue_id, candidate_type);
CREATE INDEX IF NOT EXISTS idx_vic_venue_review ON venue_intelligence_candidates(venue_id, human_review_status);
CREATE INDEX IF NOT EXISTS idx_vic_venue_source ON venue_intelligence_candidates(venue_id, source_decision_id);
`

// Compact JSON columns: serialized on write, parsed on read; absent → NULL.
const JSON_FIELDS = Object.freeze([
  'candidate_payload_json', 'evidence_json', 'provenance_json', 'confidence_json',
])

// ── small helpers (pure) ─────────────────────────────────────────────────────

function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0 }
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
function explicitReasons(decision) {
  const reasons = decision && decision.decision_payload && decision.decision_payload.reasons
  if (!Array.isArray(reasons)) return []
  return reasons.map(r => String(r || '').trim().toLowerCase()).filter(Boolean)
}

// ── Evidence scoring ─────────────────────────────────────────────────────────

/**
 * Score a derived candidate's evidence. A single decision is at most 'low'.
 * 'medium' requires corroboration count >= 2 (passed in candidate._corroboration).
 * NEVER returns 'high'. Pure.
 */
export function scoreFnbCandidateEvidence(candidate) {
  const c = candidate || {}
  const corroboration = Number(c._corroboration) || 1
  const level = corroboration >= 2 ? 'medium' : 'low'
  return {
    level,
    basis: corroboration >= 2
      ? `corroborated across ${corroboration} explicit F&B decisions`
      : 'single explicit F&B decision',
  }
}

// ── Derivation (pure, conservative) ──────────────────────────────────────────

/**
 * Derive candidate signals from ONE recorded fb_decisions row. Returns Candidate[]
 * (usually [] — most decisions produce nothing). Conservative per Phase 6 plan:
 *   - cocktail_menu_generated → [] (circular: target came from Venue DNA itself)
 *   - cocktail_selected       → [] (Phase 6A: acceptance is too weak; no candidate)
 *   - cocktail_rejected       → a candidate ONLY for each EXPLICIT mapped reason
 * Never infers guest preference, pricing, or broad venue identity. Never fabricates.
 */
export function deriveFnbVenueCandidatesFromDecision(decision) {
  const d = decision || {}
  if (!d || typeof d !== 'object' || !d.decision_type) return []

  // Generation is HESTIA acting on existing understanding — not new venue evidence.
  if (d.decision_type === 'cocktail_menu_generated') return []
  // A single human save is too weak in Phase 6A; produce no candidate.
  if (d.decision_type === 'cocktail_selected') return []
  // Only explicit rejections produce candidates.
  if (d.decision_type !== 'cocktail_rejected') return []

  const reasons = explicitReasons(d)
  if (!reasons.length) return [] // rejection without an explicit reason → no candidate

  const subjectName = (d.subject_ref && d.subject_ref.cocktail_name) || (d.recipe_snapshot && d.recipe_snapshot.name) || null
  const seenTypes = new Set()
  const candidates = []

  for (const reason of reasons) {
    const map = REASON_TO_CANDIDATE[reason]
    if (!map || !DERIVABLE_TYPES_6A.includes(map.type)) continue
    if (seenTypes.has(map.type)) continue // one candidate per type per decision
    seenTypes.add(map.type)

    const raw = {
      candidate_type: map.type,
      source_domain: SOURCE_DOMAIN,
      source_decision_id: d.id || null,
      candidate_summary: subjectName ? `${map.note} (${subjectName})` : map.note,
      candidate_payload: { reason, subject: subjectName, base_spirit: (d.decision_payload && d.decision_payload.base_spirit) || null },
      evidence: [{ source: 'rejection_history', decision_id: d.id || null, reason }],
      provenance: { origin: 'specialist_decision', domain: 'fnb', route: 'ci_rejections' },
      _corroboration: 1,
    }
    raw.confidence = scoreFnbCandidateEvidence(raw)
    candidates.push(raw)
  }

  return candidates
}

// ── Normalization / validation ───────────────────────────────────────────────

/**
 * Validate + normalize a candidate into a storable row. Throws on invalid required
 * fields/vocabularies. Pure. Absent optionals → null (no fake defaults). Strips the
 * internal `_corroboration` hint. Confidence is never 'high'.
 */
export function normalizeFnbCandidate(candidate, venueId) {
  if (!isNonEmptyString(venueId)) throw new Error('fnbVenueFeedback: venueId is required.')
  if (!candidate || typeof candidate !== 'object') throw new Error('fnbVenueFeedback: candidate object is required.')
  if (!CANDIDATE_TYPES.includes(candidate.candidate_type)) {
    throw new Error(`fnbVenueFeedback: invalid candidate_type "${candidate.candidate_type}".`)
  }
  const status = candidate.status == null ? 'candidate' : candidate.status
  if (!CANDIDATE_STATUSES.includes(status)) throw new Error(`fnbVenueFeedback: invalid status "${status}".`)
  const review = candidate.human_review_status == null ? 'unreviewed' : candidate.human_review_status
  if (!HUMAN_REVIEW_STATUSES.includes(review)) throw new Error(`fnbVenueFeedback: invalid human_review_status "${review}".`)

  // Confidence guard: never persist 'high' from F&B feedback.
  let confidence = candidate.confidence ?? null
  if (confidence && typeof confidence === 'object' && confidence.level && !CONFIDENCE_LEVELS.includes(confidence.level)) {
    confidence = { ...confidence, level: 'low' }
  }

  return {
    id: isNonEmptyString(candidate.id) ? candidate.id : randomUUID(),
    venue_id: venueId,
    source_domain: isNonEmptyString(candidate.source_domain) ? candidate.source_domain : SOURCE_DOMAIN,
    source_decision_id: normScalar(candidate.source_decision_id),
    candidate_type: candidate.candidate_type,
    candidate_summary: normScalar(candidate.candidate_summary),
    candidate_payload_json: serializeJson(candidate.candidate_payload_json ?? candidate.candidate_payload),
    evidence_json: serializeJson(candidate.evidence_json ?? candidate.evidence),
    provenance_json: serializeJson(candidate.provenance_json ?? candidate.provenance),
    confidence_json: serializeJson(candidate.confidence_json ?? confidence),
    status,
    human_review_status: review,
    reviewed_by: normScalar(candidate.reviewed_by),
    reviewed_at: normScalar(candidate.reviewed_at),
  }
}

function shapeRow(raw) {
  if (!raw) return null
  const out = { ...raw }
  for (const f of JSON_FIELDS) out[f.replace(/_json$/, '')] = parseJson(raw[f])
  return out
}

const INSERT_COLUMNS = Object.freeze([
  'id', 'venue_id', 'source_domain', 'source_decision_id', 'candidate_type',
  'candidate_summary', 'candidate_payload_json', 'evidence_json', 'provenance_json',
  'confidence_json', 'status', 'human_review_status', 'reviewed_by', 'reviewed_at',
])

// ── Storage API (dependency-injected db) ─────────────────────────────────────

/**
 * Create a candidate (candidate-only; never Venue DNA). Dedupes by
 * (venue_id, candidate_type, source_decision_id): if a matching row exists, returns
 * it instead of inserting a duplicate. Returns { ok, id, deduped? }.
 */
export function createVenueIntelligenceCandidate(db, venueId, candidate) {
  const row = normalizeFnbCandidate(candidate, venueId)

  // Dedup (only meaningful when a source_decision_id is present).
  if (row.source_decision_id) {
    const existing = db.prepare(
      'SELECT * FROM venue_intelligence_candidates WHERE venue_id = ? AND candidate_type = ? AND source_decision_id = ?'
    ).get(venueId, row.candidate_type, row.source_decision_id)
    if (existing) return { ok: true, id: existing.id, deduped: true }
  }

  const placeholders = INSERT_COLUMNS.map(() => '?').join(', ')
  db.prepare(`INSERT INTO venue_intelligence_candidates (${INSERT_COLUMNS.join(', ')}) VALUES (${placeholders})`)
    .run(...INSERT_COLUMNS.map(c => row[c]))
  return { ok: true, id: row.id, deduped: false }
}

/** Read one candidate by id, venue-scoped. Returns shaped row or null. */
export function getVenueIntelligenceCandidateById(db, venueId, candidateId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(candidateId)) return null
  const raw = db.prepare('SELECT * FROM venue_intelligence_candidates WHERE id = ? AND venue_id = ?').get(candidateId, venueId)
  return shapeRow(raw)
}

/**
 * List candidates for a venue (newest first). filters: { candidate_type,
 * human_review_status, status, limit }. Venue-scoped. Validates filter values.
 */
export function listVenueIntelligenceCandidatesForVenue(db, venueId, filters = {}) {
  if (!isNonEmptyString(venueId)) return []
  const where = ['venue_id = ?']
  const args = [venueId]
  if (filters.candidate_type != null) {
    if (!CANDIDATE_TYPES.includes(filters.candidate_type)) throw new Error(`fnbVenueFeedback: invalid candidate_type filter "${filters.candidate_type}".`)
    where.push('candidate_type = ?'); args.push(filters.candidate_type)
  }
  if (filters.human_review_status != null) {
    if (!HUMAN_REVIEW_STATUSES.includes(filters.human_review_status)) throw new Error(`fnbVenueFeedback: invalid human_review_status filter "${filters.human_review_status}".`)
    where.push('human_review_status = ?'); args.push(filters.human_review_status)
  }
  if (filters.status != null) {
    if (!CANDIDATE_STATUSES.includes(filters.status)) throw new Error(`fnbVenueFeedback: invalid status filter "${filters.status}".`)
    where.push('status = ?'); args.push(filters.status)
  }
  const limit = Math.max(1, Math.min(200, Number(filters.limit) || 50))
  const rows = db.prepare(
    `SELECT * FROM venue_intelligence_candidates WHERE ${where.join(' AND ')} ORDER BY created_at DESC, rowid DESC LIMIT ?`
  ).all(...args, limit)
  return rows.map(shapeRow)
}

/**
 * Non-blocking wrapper (Phase 6B). The ONLY entry point a live route should call.
 * Derives candidates from one decision and stores each (deduped). NEVER throws:
 * any error (derivation, validation, db) is caught and returned. A ledger/route
 * failure can therefore never be caused by candidate writes.
 *
 * Returns:
 *   { ok: true, created, skipped, candidateIds }   — on success (created may be 0)
 *   { ok: false, error, created, skipped, candidateIds } — on a caught failure
 *
 * Candidate writes require a source_decision_id on the decision (for dedupe); a
 * decision without one yields no writes (skipped). Candidate-only; no Venue DNA.
 */
export function safeRecordVenueIntelligenceCandidates(db, venueId, decision, onError) {
  const result = { ok: true, created: 0, skipped: 0, candidateIds: [] }
  try {
    const candidates = deriveFnbVenueCandidatesFromDecision(decision)
    if (!candidates.length) return result
    for (const c of candidates) {
      // Dedupe is keyed on source_decision_id; without it, do not write (avoid spam).
      if (!isNonEmptyString(c.source_decision_id)) { result.skipped++; continue }
      const res = createVenueIntelligenceCandidate(db, venueId, c)
      if (res && res.ok) {
        result.candidateIds.push(res.id)
        if (res.deduped) result.skipped++; else result.created++
      } else {
        result.skipped++
      }
    }
    return result
  } catch (error) {
    if (typeof onError === 'function') {
      try { onError(error) } catch { /* logging must never break the caller */ }
    }
    return { ...result, ok: false, error: error && error.message ? error.message : String(error) }
  }
}

/**
 * Phase 7A — human review/approval of a candidate (SIGNAL ONLY, never Venue DNA).
 * Updates ONLY review fields on venue_intelligence_candidates: human_review_status,
 * reviewed_by, reviewed_at (now), and review_note (if the column exists). It NEVER
 * touches candidate content (type/payload/evidence/provenance/confidence), NEVER
 * mutates Venue DNA, NEVER calls mergeVenueDna, NEVER writes venue_intelligence /
 * venue_briefs / venue_dna_enrichment, and has NO promotion semantics.
 *
 * `accepted` means "accepted as a useful signal" — NOT promoted to Venue DNA.
 *
 * @param reviewInput { human_review_status (∈ REVIEW_ACTION_STATUSES), reviewed_by?, review_note? }
 * @returns the updated, shaped candidate row, or null when not found / cross-venue.
 */
export function markVenueIntelligenceCandidateReviewed(db, venueId, candidateId, reviewInput = {}) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(candidateId)) {
    throw new Error('fnbVenueFeedback: venueId and candidateId are required.')
  }
  const status = reviewInput.human_review_status
  if (!REVIEW_ACTION_STATUSES.includes(status)) {
    throw new Error(`fnbVenueFeedback: invalid review status "${status}".`)
  }
  // Venue-scoped existence check — cross-venue or missing → null (no foreign write).
  const existing = db.prepare('SELECT id FROM venue_intelligence_candidates WHERE id = ? AND venue_id = ?').get(candidateId, venueId)
  if (!existing) return null

  const reviewedBy = normScalar(reviewInput.reviewed_by)
  const reviewNote = normScalar(reviewInput.review_note)

  // Set only the review fields; review_note set defensively (column added in 7A).
  db.prepare(`
    UPDATE venue_intelligence_candidates
    SET human_review_status = ?, reviewed_by = ?, reviewed_at = datetime('now'),
        review_note = ?, updated_at = datetime('now')
    WHERE id = ? AND venue_id = ?
  `).run(status, reviewedBy, reviewNote, candidateId, venueId)

  return getVenueIntelligenceCandidateById(db, venueId, candidateId)
}
