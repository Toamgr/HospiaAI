#!/usr/bin/env node
/**
 * Behavioral (integration) test for the Owner Meaning Promotion READ routes (Slice 4G.1):
 *   GET /api/owner-meaning-promotion-candidates             (paginated queue)
 *   GET /api/owner-meaning-promotion-candidates/:candidateId (single + source captures + events)
 *
 * Mounts the REAL route handlers (copied verbatim in shape from server.js, including the explicit
 * in-handler admin-read block and the BAD_REQUEST→400 / else→500 mapping) on a minimal express app,
 * behind a requireAuth model that FAITHFULLY mirrors server.js requireAuth: 401 without a role, 403
 * for a role not in the allow-list, and the platform-admin GLOBAL BYPASS. Runs against the REAL
 * service + a REAL in-memory node:sqlite db over real HTTP.
 *
 * Candidates are seeded DIRECTLY (no proposal generator exists in 4G.1); source captures are seeded
 * through the REAL capture writer.
 *
 * Proves end-to-end:
 *   • owner can LIST (200, object envelope { ok, candidates, pagination, counts }) and READ ONE (200);
 *   • admin → 403 on BOTH routes; manager / bar_manager → 403; unauthenticated → 401;
 *   • invalid status/confidence_label/target_path filter → 400; invalid limit/offset clamp (200);
 *   • a client ?venue_id cannot widen access; cross-venue / unknown id → safe 404;
 *   • response is an object (never a bare array); allowed_actions all false; application.blocked true;
 *   • confidence.score null; list uses excerpts; detail preserves full owner_response_raw;
 *   • GET routes never mutate (candidate + event counts unchanged across the whole run).
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-owner-meaning-promotion-read-route-behavior.js
 */

import express from 'express'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import * as promo from '../src/services/venueIntelligence/ownerMeaningPromotionService.js'
import * as omc from '../src/services/venueIntelligence/ownerMeaningCaptureService.js'

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

const db = new DatabaseSync(':memory:')
db.exec(promo.OWNER_MEANING_PROMOTION_CANDIDATES_DDL)
db.exec(promo.OWNER_MEANING_PROMOTION_EVENTS_DDL)
db.exec(omc.OWNER_MEANING_CAPTURES_DDL)
db.exec(omc.OWNER_MEANING_CAPTURE_EVENTS_DDL)

const candCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_promotion_candidates').get().n
const evtCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_promotion_events').get().n

function seedCapture(venueId, response) {
  const concept = randomUUID()
  const cand = {
    candidate_id: randomUUID(), venue_id: venueId, source_record_space: 'concept_draft',
    concept_ref: concept, destination_hint: null,
    created_from_summary_version: 'derived-live@2026-06-27T00:00:00.000Z',
    candidate_type: 'missing_data_signal', status: 'insufficient_evidence',
    interpretation_title: 'Possible signal', interpretation_summary: 'Saved meaning kept.',
    supporting_evidence_refs: [{ review_id: randomUUID(), concept_ref: concept, review_action: 'captured', confidence_band: null }],
    conflicting_evidence_refs: [], missing_evidence: ['No corroboration yet.'], uncertainty_notes: ['Suspicion only.'],
    confidence_band: null, suggested_owner_question: 'Does this belong to the venue identity?',
  }
  return omc.createOwnerMeaningCapture(db, { venueId, conceptRef: concept, ownerResponseRaw: response, candidate: cand, createdBy: 'Tal Millo' })
}

// TEST-LOCAL fixture (NOT a product writer): seed one candidate directly.
function seedCandidate(opts = {}) {
  const id = opts.id || randomUUID()
  db.prepare(`INSERT INTO owner_meaning_promotion_candidates
    (id, venue_id, source_capture_ids_json, source_capture_fingerprints_json,
     proposed_target_path, proposed_target_label, current_value_snapshot_json, proposed_value_json,
     proposed_meaning_summary, proposed_dna_patch_json, proposal_rationale, confidence_label,
     confidence_factors_json, contradictions_json, missing_evidence_json, impact_note,
     status, created_by_actor_type, created_at, updated_at, idempotency_key, candidate_fingerprint)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    id, opts.venueId || 'venue_A',
    JSON.stringify(opts.sourceCaptureIds || []), JSON.stringify(opts.sourceCaptureFingerprints || []),
    opts.targetPath || 'owner_notes', 'Owner notes', JSON.stringify(null), JSON.stringify(opts.proposedValue ?? 'A candlelit room.'),
    'Proposed reading (NOT confirmed).', JSON.stringify({ target_path: opts.targetPath || 'owner_notes', op: 'set', value: 'x' }),
    'Drawn from cited captures.', opts.confidenceLabel || 'low',
    JSON.stringify({ band: opts.confidenceLabel || 'low', evidence_count: (opts.sourceCaptureIds || []).length, recency: 'recent', consistency: 'consistent', source_type: 'owner_response', contradictions: [], missing_fields: [] }),
    JSON.stringify([]), JSON.stringify([]), 'Read by the owner identity specialists.',
    opts.status || 'needs_owner_review', 'hestia_suggestion', opts.createdAt || '2026-06-27 10:00:00', opts.createdAt || '2026-06-27 10:00:00',
    randomUUID(), randomUUID())
  return id
}

// Seed: 2 captures in venue_A (one long, to prove list truncation), 1 in venue_B.
const LONG = 'L'.repeat(400)
const capA1 = seedCapture('venue_A', 'We host guests, not customers.')
const capLong = seedCapture('venue_A', LONG)
const capB1 = seedCapture('venue_B', 'Venue B private — must never leak to A.')

const a1 = seedCandidate({ venueId: 'venue_A', status: 'needs_owner_review', targetPath: 'owner_notes', confidenceLabel: 'low', sourceCaptureIds: [capA1.id], sourceCaptureFingerprints: [capA1.candidate_fingerprint], createdAt: '2026-06-27 10:00:00' })
const a2 = seedCandidate({ venueId: 'venue_A', status: 'owner_approved', targetPath: 'service_style', confidenceLabel: 'medium', sourceCaptureIds: [capLong.id], sourceCaptureFingerprints: [capLong.candidate_fingerprint], createdAt: '2026-06-27 11:00:00' })
const b1 = seedCandidate({ venueId: 'venue_B', status: 'needs_owner_review', sourceCaptureIds: [capB1.id], sourceCaptureFingerprints: [capB1.candidate_fingerprint], createdAt: '2026-06-27 12:00:00' })
const seededCandBaseline = candCount(), seededEvtBaseline = evtCount()

// Faithful model of server.js requireAuth: role from header, 401 if absent, admin bypasses the
// allow-list, others must be in it (else 403); req.venueId resolved per request from X-Venue.
function requireAuth(...allowedRoles) {
  return (req, res, next) => {
    const role = req.header('X-Role')
    if (!role) return res.status(401).json({ error: 'Authorization required.' })
    req.user = { id: 'u1', full_name: 'Tal Millo', role }
    req.venueId = req.header('X-Venue') || 'venue_A'
    if (allowedRoles.length > 0 && role !== 'admin' && !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden.' })
    }
    next()
  }
}

const app = express()
app.use(express.json())

// ── Verbatim-shape GET list handler ──────────────────────────────────────────
app.get('/api/owner-meaning-promotion-candidates', requireAuth('owner'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'Owner Meaning Promotion is owner-only.' })
    }
    const result = promo.listOwnerMeaningPromotionCandidates(db, req.venueId, {
      limit: req.query.limit, offset: req.query.offset, status: req.query.status,
      targetPath: req.query.target_path, confidenceLabel: req.query.confidence_label,
      includeCounts: req.query.include_counts === undefined ? true : req.query.include_counts !== 'false',
      includeSourcePreview: req.query.include_source_preview === undefined ? true : req.query.include_source_preview !== 'false',
    })
    res.json({ ok: true, ...result })
  } catch (err) {
    if (err && err.code === 'BAD_REQUEST') return res.status(400).json({ ok: false, error: err.message })
    res.status(500).json({ ok: false, error: 'Could not read promotion candidates.' })
  }
})

// ── Verbatim-shape GET one handler ───────────────────────────────────────────
app.get('/api/owner-meaning-promotion-candidates/:candidateId', requireAuth('owner'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'Owner Meaning Promotion is owner-only.' })
    }
    const candidate = promo.getOwnerMeaningPromotionCandidateById(db, req.venueId, req.params.candidateId)
    if (!candidate) return res.status(404).json({ ok: false, error: 'No promotion candidate found for this venue.' })
    const source_captures = promo.resolveSourceCapturesForPromotionCandidate(db, req.venueId, candidate)
    const events = promo.listOwnerMeaningPromotionEvents(db, req.venueId, req.params.candidateId)
    res.json({ ok: true, candidate, source_captures, events, allowed_actions: { ...promo.OWNER_MEANING_PROMOTION_ALLOWED_ACTIONS } })
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Could not read the promotion candidate.' })
  }
})

function call(server, path, { role, venue = 'venue_A' } = {}) {
  const { port } = server.address()
  const headers = { 'Content-Type': 'application/json', Connection: 'close' }
  if (role) headers['X-Role'] = role
  if (venue) headers['X-Venue'] = venue
  return fetch(`http://127.0.0.1:${port}${path}`, { method: 'GET', headers }).then(async r => ({ status: r.status, json: await r.json().catch(() => ({})) }))
}

const LIST = '/api/owner-meaning-promotion-candidates'

const server = app.listen(0, async () => {
  console.log('\nOwner Meaning Promotion READ routes — behavioral (owner-only read) test\n')
  try {
    // [owner] list.
    const ownerList = await call(server, LIST, { role: 'owner', venue: 'venue_A' })
    ok(ownerList.status === 200 && ownerList.json.ok, '[owner] GET list → 200')
    ok(Array.isArray(ownerList.json.candidates) && !!ownerList.json.pagination, '[owner] list returns object with candidates[] + pagination')
    ok(!Array.isArray(ownerList.json), '[envelope] response is an object, never a bare array')
    ok(!!ownerList.json.counts && ownerList.json.counts.needs_owner_review === 1 && ownerList.json.counts.owner_approved === 1, '[owner] counts present')
    ok(ownerList.json.candidates.length === 2, '[owner] venue_A list has exactly 2 candidates')
    ok(ownerList.json.candidates[0].id === a2 && ownerList.json.candidates[1].id === a1, '[owner] list newest-first')
    ok(!ownerList.json.candidates.some(c => c.id === b1), '[owner] list does NOT leak venue_B candidate')
    ok(ownerList.json.candidates.every(c => c.confidence.score === null), '[owner] confidence.score null in list')
    ok(ownerList.json.candidates.every(c => c.application.blocked === true), '[owner] application.blocked true in list')
    ok(!JSON.stringify(ownerList.json).includes(LONG), '[list] no full owner_response_raw leaked in list (excerpt only)')
    ok(ownerList.json.candidates.every(c => !('venue_id' in c)), '[list] venue_id omitted from list rows')

    // [owner] read one + source captures + events.
    const ownerOne = await call(server, `${LIST}/${a1}`, { role: 'owner', venue: 'venue_A' })
    ok(ownerOne.status === 200 && ownerOne.json.ok, '[owner] GET one → 200')
    ok(ownerOne.json.candidate && ownerOne.json.candidate.id === a1, '[owner] returns the correct candidate')
    ok(!('venue_id' in ownerOne.json.candidate), '[detail] venue_id omitted from detail')
    ok(Array.isArray(ownerOne.json.source_captures) && ownerOne.json.source_captures.length === 1, '[owner] returns source_captures')
    ok(ownerOne.json.source_captures[0].owner_response_raw === 'We host guests, not customers.', '[detail] preserves full owner_response_raw byte-for-byte')
    ok(Array.isArray(ownerOne.json.events), '[owner] returns events array')
    ok(ownerOne.json.allowed_actions && Object.values(ownerOne.json.allowed_actions).every(v => v === false), '[detail] allowed_actions ALL false')
    ok(ownerOne.json.candidate.application.blocked === true, '[detail] application.blocked true')
    ok(ownerOne.json.candidate.confidence.score === null, '[detail] confidence.score null')

    // [admin] blocked on BOTH routes.
    ok((await call(server, LIST, { role: 'admin' })).status === 403, '[admin] GET list → 403 (no read access this slice)')
    ok((await call(server, `${LIST}/${a1}`, { role: 'admin' })).status === 403, '[admin] GET one → 403')

    // [manager] / [bar_manager] / [non-owner] blocked.
    ok((await call(server, LIST, { role: 'manager' })).status === 403, '[manager] GET list → 403')
    ok((await call(server, LIST, { role: 'bar_manager' })).status === 403, '[bar_manager] GET list → 403')
    ok((await call(server, `${LIST}/${a1}`, { role: 'chef' })).status === 403, '[chef] GET one → 403')

    // [unauthenticated] → 401.
    ok((await call(server, LIST, {})).status === 401, '[anon] GET list → 401')
    ok((await call(server, `${LIST}/${a1}`, {})).status === 401, '[anon] GET one → 401')

    // Invalid closed-vocab filters → 400.
    ok((await call(server, `${LIST}?status=nope`, { role: 'owner' })).status === 400, '[400] invalid status filter')
    ok((await call(server, `${LIST}?status=applied_to_dna_future`, { role: 'owner' })).status === 400, '[400] reserved status filter')
    ok((await call(server, `${LIST}?confidence_label=high`, { role: 'owner' })).status === 400, '[400] invalid confidence_label filter')
    ok((await call(server, `${LIST}?target_path=venue_dna_json`, { role: 'owner' })).status === 400, '[400] invalid target_path filter')

    // Valid filters → 200.
    const approved = await call(server, `${LIST}?status=owner_approved`, { role: 'owner' })
    ok(approved.status === 200 && approved.json.candidates.length === 1, '[filter] status=owner_approved → 1')

    // Invalid limit/offset clamp/default (200, no 400).
    const bad = await call(server, `${LIST}?limit=abc&offset=-9`, { role: 'owner' })
    ok(bad.status === 200 && bad.json.pagination.limit === promo.OWNER_MEANING_PROMOTION_LIST_DEFAULT_LIMIT && bad.json.pagination.offset === 0, '[safe] invalid limit/offset → defaults (200)')
    const max = await call(server, `${LIST}?limit=9999`, { role: 'owner' })
    ok(max.status === 200 && max.json.pagination.limit === promo.OWNER_MEANING_PROMOTION_LIST_MAX_LIMIT, '[safe] max limit enforced (clamped to 100)')

    // Client venue_id cannot widen access (a venue_B owner cannot see venue_A via ?venue_id).
    const widen = await call(server, `${LIST}?venue_id=venue_A`, { role: 'owner', venue: 'venue_B' })
    ok(widen.status === 200 && !widen.json.candidates.some(c => c.id === a1 || c.id === a2), '[scoping] client ?venue_id cannot widen access')

    // Cross-venue detail → safe 404 (venue_B owner asking for venue_A id).
    ok((await call(server, `${LIST}/${a1}`, { role: 'owner', venue: 'venue_B' })).status === 404, '[scoping] cross-venue candidate id → 404 (no foreign leakage)')
    // Unknown id → safe 404.
    ok((await call(server, `${LIST}/${randomUUID()}`, { role: 'owner', venue: 'venue_A' })).status === 404, '[404] unknown candidate id → 404')

    // GET routes never mutated anything across the whole run.
    ok(candCount() === seededCandBaseline, '[read-only] candidate row count unchanged by GET traffic')
    ok(evtCount() === seededEvtBaseline, '[read-only] event row count unchanged by GET traffic')
  } catch (e) {
    failed++; console.error('  [FAIL] unexpected error:', e && e.message)
  } finally {
    console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
    process.exitCode = failed > 0 ? 1 : 0
    try { db.close() } catch { /* in-memory */ }
    server.close()
  }
})
