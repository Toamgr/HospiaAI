// Owner Beverage Direction Brief — persistence (Beverage Slice 1A).
//
// Persists the OWNER's beverage direction, as typed, into a venue-scoped record with an
// append-only audit trail. Modeled field-for-field on the posture of
// src/services/venueIntelligence/ownerMeaningCaptureService.js.
//
// Governing docs (binding):
//   docs/architecture/BEVERAGE_INTELLIGENCE_BRAIN_GAP_ANALYSIS_2026_07.md
//   docs/architecture/BEVERAGE_UX_SYSTEM_OWNER_BRIEF_AND_REPORT_MEMORY_2026_07.md
//
// HARD DOCTRINE (enforced by design):
//   - The brief stores the owner's WORDS. No AI, no prompts, no network, no generation.
//   - No fake data: every content field is nullable; an empty field stays empty. There is no
//     default value, sample text, or fallback content anywhere in this module.
//   - field_provenance is SERVER-DERIVED from the stored values ('owner_typed' | 'empty') —
//     never accepted from the client.
//   - After submit the owner's version is IMMUTABLE: updateOwnerBeverageBriefDraft refuses
//     (CONFLICT) on any non-draft row. No other writer touches brief content fields.
//   - venue_id is the ACCESS BOUNDARY, always the server-resolved value. Cross-venue reads
//     return null/[] — never a foreign row.
//   - Audit-first ordering (audit event INSERT precedes the state write), mirroring the
//     owner-meaning tables. brief ids in the events table are LOGICAL refs — no FOREIGN KEY,
//     no PRAGMA foreign_keys. Do not add either.
//   - This module imports NOTHING DNA-related and never writes any Venue DNA store.

import { randomUUID } from 'node:crypto'

// ── Constants / closed vocabularies ───────────────────────────────────────────

export const BRIEF_STATUSES = Object.freeze(['draft', 'submitted'])
export const BRIEF_STATUS_DRAFT = 'draft'
export const BRIEF_STATUS_SUBMITTED = 'submitted'

// Per-field provenance vocabulary. Slice 1A knows only these two values: the owner typed the
// value, or the field is empty. (Later slices may add imported/derived classes — never here.)
export const BRIEF_FIELD_PROVENANCE = Object.freeze(['owner_typed', 'empty'])

// The eleven owner-typed content fields. cocktail_count is the only numeric field.
export const BRIEF_CONTENT_FIELDS = Object.freeze([
  'venue_type',
  'service_style',
  'intent_statement',
  'guest_profile',
  'flavor_direction',
  'cocktail_count',
  'zero_proof_stance',
  'constraints',
  'price_range',
  'staff_capability_note',
  'season_context',
])

// Audit event vocabulary for the whole Slice 1A workflow (brief + review share one audit table).
export const BEVERAGE_BRIEF_EVENT_TYPES = Object.freeze([
  'brief_created',
  'brief_submitted',
  'review_created',
  'review_status_changed',
  'review_adjustment_added',
])

// Validation bounds — validation may REJECT, it never rewrites or truncates a stored value.
export const BRIEF_TEXT_FIELD_MAX = 4000
export const BRIEF_COCKTAIL_COUNT_MIN = 1
export const BRIEF_COCKTAIL_COUNT_MAX = 60

// ── small helpers (pure) ──────────────────────────────────────────────────────

function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0 }
function parseJson(v) { if (v === null || v === undefined) return null; try { return JSON.parse(v) } catch { return null } }
function badRequest(message) { const e = new Error(message); e.code = 'BAD_REQUEST'; return e }
function conflict(message) { const e = new Error(message); e.code = 'CONFLICT'; return e }
function charLength(str) { return [...str].length }

// ── DDL (single source of truth — shared by server boot and the in-memory tests) ─
//
// beverage_brief_events.brief_id / review_id are LOGICAL references, NOT enforced FKs: the
// audit row is written BEFORE the state row exists (audit-first). Do NOT add FOREIGN KEY
// clauses and do NOT enable PRAGMA foreign_keys for these tables.

export const OWNER_BEVERAGE_BRIEFS_DDL = `
CREATE TABLE IF NOT EXISTS owner_beverage_briefs (
  id                     TEXT    PRIMARY KEY,
  venue_id               TEXT    NOT NULL,
  owner_user_id          TEXT    NOT NULL,
  status                 TEXT    NOT NULL CHECK (status IN ('draft','submitted')),
  venue_type             TEXT,
  service_style          TEXT,
  intent_statement       TEXT,
  guest_profile          TEXT,
  flavor_direction       TEXT,
  cocktail_count         INTEGER CHECK (cocktail_count IS NULL OR (cocktail_count >= 1 AND cocktail_count <= 60)),
  zero_proof_stance      TEXT,
  constraints            TEXT,
  price_range            TEXT,
  staff_capability_note  TEXT,
  season_context         TEXT,
  field_provenance_json  TEXT    NOT NULL,
  created_at             TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at           TEXT
);
CREATE INDEX IF NOT EXISTS idx_owner_beverage_briefs_venue_id     ON owner_beverage_briefs(venue_id);
CREATE INDEX IF NOT EXISTS idx_owner_beverage_briefs_venue_status ON owner_beverage_briefs(venue_id, status);
CREATE INDEX IF NOT EXISTS idx_owner_beverage_briefs_created_at   ON owner_beverage_briefs(created_at);
`

export const BEVERAGE_BRIEF_EVENTS_DDL = `
CREATE TABLE IF NOT EXISTS beverage_brief_events (
  id                 TEXT NOT NULL PRIMARY KEY,
  venue_id           TEXT NOT NULL,
  brief_id           TEXT NOT NULL,
  review_id          TEXT,
  event_type         TEXT NOT NULL CHECK (event_type IN ('brief_created','brief_submitted','review_created','review_status_changed','review_adjustment_added')),
  event_payload_json TEXT NOT NULL,
  created_by         TEXT NOT NULL,
  created_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_beverage_brief_events_venue_id ON beverage_brief_events(venue_id);
CREATE INDEX IF NOT EXISTS idx_beverage_brief_events_brief_id ON beverage_brief_events(brief_id);
CREATE INDEX IF NOT EXISTS idx_beverage_brief_events_created_at ON beverage_brief_events(created_at);
`

// ── Field validation + provenance (server-derived) ────────────────────────────

// Validate + normalize ONE content field. Text fields: a non-empty string is kept as typed
// (trim only decides emptiness, the stored value keeps the owner's original text); blank /
// null / undefined becomes null. cocktail_count: integer in [1, 60] or null.
function normalizeFieldValue(field, value) {
  if (value === null || value === undefined) return null
  if (field === 'cocktail_count') {
    if (value === '') return null
    const n = Number(value)
    if (!Number.isInteger(n)) throw badRequest('ownerBeverageBrief: cocktail_count must be a whole number.')
    if (n < BRIEF_COCKTAIL_COUNT_MIN || n > BRIEF_COCKTAIL_COUNT_MAX) {
      throw badRequest(`ownerBeverageBrief: cocktail_count must be between ${BRIEF_COCKTAIL_COUNT_MIN} and ${BRIEF_COCKTAIL_COUNT_MAX}.`)
    }
    return n
  }
  if (typeof value !== 'string') throw badRequest(`ownerBeverageBrief: ${field} must be text.`)
  if (value.trim().length === 0) return null
  if (charLength(value) > BRIEF_TEXT_FIELD_MAX) {
    throw badRequest(`ownerBeverageBrief: ${field} exceeds ${BRIEF_TEXT_FIELD_MAX} characters.`)
  }
  return value
}

// Extract the eleven content fields from a client payload, rejecting unknown field names so a
// client can never smuggle status/venue/provenance through the fields object.
function normalizeFields(fields) {
  if (fields === null || fields === undefined) return Object.fromEntries(BRIEF_CONTENT_FIELDS.map(f => [f, null]))
  if (typeof fields !== 'object' || Array.isArray(fields)) throw badRequest('ownerBeverageBrief: fields must be an object.')
  for (const key of Object.keys(fields)) {
    if (!BRIEF_CONTENT_FIELDS.includes(key)) throw badRequest(`ownerBeverageBrief: unknown field "${key}".`)
  }
  const out = {}
  for (const field of BRIEF_CONTENT_FIELDS) out[field] = normalizeFieldValue(field, fields[field])
  return out
}

// SERVER-DERIVED per-field provenance: 'owner_typed' when a value is stored, 'empty' otherwise.
// Never read from the client.
export function deriveFieldProvenance(values) {
  const out = {}
  for (const field of BRIEF_CONTENT_FIELDS) {
    out[field] = values[field] === null || values[field] === undefined ? 'empty' : 'owner_typed'
  }
  return out
}

// ── Read shaping ───────────────────────────────────────────────────────────────

function shapeBriefRow(raw) {
  if (!raw) return null
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
    updated_at: raw.updated_at,
    submitted_at: raw.submitted_at ?? null,
  }
}

// ── Audit writer (audit-first; shared within this module) ─────────────────────

function writeBriefEvent(db, { venueId, briefId, reviewId = null, eventType, payload, createdBy }) {
  db.prepare(`
    INSERT INTO beverage_brief_events (id, venue_id, brief_id, review_id, event_type, event_payload_json, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), venueId, briefId, reviewId, eventType, JSON.stringify(payload ?? {}), createdBy)
}

// ── Storage API (dependency-injected db) ───────────────────────────────────────

/**
 * Create a DRAFT owner beverage brief. All content fields may be empty — an empty draft is an
 * honest draft. Audit-first: the 'brief_created' event is written before the brief row.
 *
 * @param params { venueId, ownerUserId, fields? }
 */
export function createOwnerBeverageBrief(db, params = {}) {
  const { venueId, ownerUserId, fields } = params
  if (!isNonEmptyString(venueId)) throw badRequest('ownerBeverageBrief: venueId is required.')
  if (!isNonEmptyString(ownerUserId)) throw badRequest('ownerBeverageBrief: ownerUserId is required.')

  const values = normalizeFields(fields)
  const provenance = deriveFieldProvenance(values)
  const briefId = randomUUID()

  // AUDIT-FIRST — the event insert precedes the brief insert (logical ref, no FK).
  writeBriefEvent(db, {
    venueId, briefId, eventType: 'brief_created',
    payload: { to_status: BRIEF_STATUS_DRAFT },
    createdBy: ownerUserId,
  })

  db.prepare(`
    INSERT INTO owner_beverage_briefs
      (id, venue_id, owner_user_id, status,
       venue_type, service_style, intent_statement, guest_profile, flavor_direction,
       cocktail_count, zero_proof_stance, constraints, price_range, staff_capability_note,
       season_context, field_provenance_json, created_at, updated_at, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), NULL)
  `).run(
    briefId, venueId, ownerUserId, BRIEF_STATUS_DRAFT,
    values.venue_type, values.service_style, values.intent_statement, values.guest_profile,
    values.flavor_direction, values.cocktail_count, values.zero_proof_stance, values.constraints,
    values.price_range, values.staff_capability_note, values.season_context,
    JSON.stringify(provenance),
  )

  return getOwnerBeverageBriefById(db, venueId, briefId)
}

/**
 * Update a DRAFT brief's content fields. AUTHOR-ONLY (the route passes the session user; a
 * different owner of the same venue is refused). A submitted brief is IMMUTABLE — any attempt
 * throws CONFLICT and writes nothing. Provenance is re-derived server-side.
 *
 * @param params { venueId, briefId, ownerUserId, fields }
 */
export function updateOwnerBeverageBriefDraft(db, params = {}) {
  const { venueId, briefId, ownerUserId, fields } = params
  if (!isNonEmptyString(venueId) || !isNonEmptyString(briefId)) throw badRequest('ownerBeverageBrief: venueId and briefId are required.')
  if (!isNonEmptyString(ownerUserId)) throw badRequest('ownerBeverageBrief: ownerUserId is required.')

  const existing = db.prepare('SELECT * FROM owner_beverage_briefs WHERE id = ? AND venue_id = ?').get(briefId, venueId)
  if (!existing) { const e = new Error('No beverage brief found for this venue.'); e.code = 'NOT_FOUND'; throw e }
  if (existing.owner_user_id !== ownerUserId) {
    const e = new Error('Only the brief author can edit this draft.'); e.code = 'FORBIDDEN'; throw e
  }
  if (existing.status !== BRIEF_STATUS_DRAFT) {
    throw conflict('This brief was submitted and is now immutable. The owner version cannot be edited.')
  }

  const values = normalizeFields(fields)
  const provenance = deriveFieldProvenance(values)

  db.prepare(`
    UPDATE owner_beverage_briefs SET
      venue_type = ?, service_style = ?, intent_statement = ?, guest_profile = ?,
      flavor_direction = ?, cocktail_count = ?, zero_proof_stance = ?, constraints = ?,
      price_range = ?, staff_capability_note = ?, season_context = ?,
      field_provenance_json = ?, updated_at = datetime('now')
    WHERE id = ? AND venue_id = ? AND status = 'draft'
  `).run(
    values.venue_type, values.service_style, values.intent_statement, values.guest_profile,
    values.flavor_direction, values.cocktail_count, values.zero_proof_stance, values.constraints,
    values.price_range, values.staff_capability_note, values.season_context,
    JSON.stringify(provenance), briefId, venueId,
  )

  return getOwnerBeverageBriefById(db, venueId, briefId)
}

/**
 * Submit a DRAFT brief to the F&B Director. One-way: draft → submitted. AUTHOR-ONLY. After
 * this, the owner version is immutable. Audit-first ('brief_submitted' before the UPDATE).
 *
 * @param params { venueId, briefId, ownerUserId }
 */
export function submitOwnerBeverageBrief(db, params = {}) {
  const { venueId, briefId, ownerUserId } = params
  if (!isNonEmptyString(venueId) || !isNonEmptyString(briefId)) throw badRequest('ownerBeverageBrief: venueId and briefId are required.')
  if (!isNonEmptyString(ownerUserId)) throw badRequest('ownerBeverageBrief: ownerUserId is required.')

  const existing = db.prepare('SELECT * FROM owner_beverage_briefs WHERE id = ? AND venue_id = ?').get(briefId, venueId)
  if (!existing) { const e = new Error('No beverage brief found for this venue.'); e.code = 'NOT_FOUND'; throw e }
  if (existing.owner_user_id !== ownerUserId) {
    const e = new Error('Only the brief author can submit this brief.'); e.code = 'FORBIDDEN'; throw e
  }
  if (existing.status !== BRIEF_STATUS_DRAFT) {
    throw conflict('This brief was already submitted.')
  }

  writeBriefEvent(db, {
    venueId, briefId, eventType: 'brief_submitted',
    payload: { from_status: BRIEF_STATUS_DRAFT, to_status: BRIEF_STATUS_SUBMITTED },
    createdBy: ownerUserId,
  })

  db.prepare(`
    UPDATE owner_beverage_briefs
    SET status = 'submitted', submitted_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ? AND venue_id = ? AND status = 'draft'
  `).run(briefId, venueId)

  return getOwnerBeverageBriefById(db, venueId, briefId)
}

/** Read one brief, venue-scoped. A cross-venue id → null (never a foreign row). */
export function getOwnerBeverageBriefById(db, venueId, briefId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(briefId)) return null
  const raw = db.prepare('SELECT * FROM owner_beverage_briefs WHERE id = ? AND venue_id = ?').get(briefId, venueId)
  return shapeBriefRow(raw)
}

/**
 * List the venue's briefs, newest first, each carrying its review state (status only) when a
 * review exists. Read-only.
 */
export function listOwnerBeverageBriefsForVenue(db, venueId) {
  if (!isNonEmptyString(venueId)) return []
  const rows = db.prepare(`
    SELECT b.*, r.id AS review_id, r.status AS review_status, r.decided_at AS review_decided_at
    FROM owner_beverage_briefs b
    LEFT JOIN fnb_brief_reviews r ON r.owner_beverage_brief_id = b.id AND r.venue_id = b.venue_id
    WHERE b.venue_id = ?
    ORDER BY b.created_at DESC, b.rowid DESC
  `).all(venueId)
  return rows.map(raw => {
    const shaped = shapeBriefRow(raw)
    shaped.review = raw.review_id
      ? { id: raw.review_id, status: raw.review_status, decided_at: raw.review_decided_at ?? null }
      : null
    return shaped
  })
}

/** Append-only audit trail for one brief, venue-scoped, newest first. */
export function listBeverageBriefEvents(db, venueId, briefId) {
  if (!isNonEmptyString(venueId) || !isNonEmptyString(briefId)) return []
  return db.prepare(
    'SELECT * FROM beverage_brief_events WHERE brief_id = ? AND venue_id = ? ORDER BY created_at DESC, rowid DESC'
  ).all(briefId, venueId).map(e => ({ ...e, event_payload: parseJson(e.event_payload_json) }))
}
