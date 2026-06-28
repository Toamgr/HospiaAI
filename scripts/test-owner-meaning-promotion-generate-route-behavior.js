#!/usr/bin/env node
/**
 * Behavioral (integration) test for the Owner Meaning Promotion CANDIDATE GENERATION route (Slice 4J):
 *   POST /api/owner-meaning-promotion-candidates/generate   (owner-only candidate writer)
 *
 * Plus the two existing READ routes (mounted to prove a generated candidate reads back blocked):
 *   GET  /api/owner-meaning-promotion-candidates
 *   GET  /api/owner-meaning-promotion-candidates/:candidateId
 *
 * Mounts the REAL route handlers (copied verbatim in shape from server.js, including the explicit
 * in-handler admin block and the NOT_FOUND→404 / BAD_REQUEST→400 / else→500 mapping) on a minimal
 * express app, behind a requireAuth model that FAITHFULLY mirrors server.js requireAuth: 401 without
 * a role, 403 for a role not in the allow-list, and the platform-admin GLOBAL BYPASS. Runs against
 * the REAL services + a REAL in-memory node:sqlite db over real HTTP. Source captures are seeded
 * through the REAL capture writer.
 *
 * Proves end-to-end:
 *   • owner can generate a candidate from an in-venue capture (201, created:true), and it reads back
 *     via GET with application.blocked:true + allowed_actions all false;
 *   • admin → 403 (zero rows written); manager / bar_manager / chef → 403; unauthenticated → 401;
 *   • missing capture_id → 400; unknown capture → 404; a client ?venue_id / body venue_id cannot widen
 *     access; a cross-venue capture cannot be used → 404;
 *   • repeated generation is idempotent (skipped:true, no duplicate row); too-weak answer → skipped;
 *   • the GET routes remain read-only (no owner_review_opened, counts unchanged by reads).
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-owner-meaning-promotion-generate-route-behavior.js
 */

import express from 'express'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import * as promo from '../src/services/venueIntelligence/ownerMeaningPromotionService.js'
import * as gen from '../src/services/venueIntelligence/ownerMeaningPromotionGenerationService.js'
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
const reviewOpenedCount = () => db.prepare("SELECT COUNT(*) AS n FROM owner_meaning_promotion_events WHERE event_type='owner_review_opened'").get().n

function seedCapture(venueId, response) {
  const concept = randomUUID()
  const cand = {
    candidate_id: randomUUID(), venue_id: venueId, source_record_space: 'concept_draft',
    concept_ref: concept, destination_hint: null,
    created_from_summary_version: 'derived-live@2026-06-28T00:00:00.000Z',
    candidate_type: 'missing_data_signal', status: 'insufficient_evidence',
    interpretation_title: 'Possible signal', interpretation_summary: 'Saved meaning kept.',
    supporting_evidence_refs: [{ review_id: randomUUID(), concept_ref: concept, review_action: 'captured', confidence_band: null }],
    conflicting_evidence_refs: [], missing_evidence: ['No corroboration yet.'], uncertainty_notes: ['Suspicion only.'],
    confidence_band: null, suggested_owner_question: 'Does this belong to the venue identity?',
  }
  return omc.createOwnerMeaningCapture(db, { venueId, conceptRef: concept, ownerResponseRaw: response, candidate: cand, createdBy: 'Tal Millo' })
}

// Seed captures: a strong one in venue_A, a weak one in venue_A, one in venue_B.
const capA1 = seedCapture('venue_A', 'We host guests, not customers — a candlelit, spirit-forward room.')
const capWeak = seedCapture('venue_A', 'no.')
const capB1 = seedCapture('venue_B', 'Venue B private — must never be promotable from A.')

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

// ── Verbatim-shape POST generate handler ─────────────────────────────────────
app.post('/api/owner-meaning-promotion-candidates/generate', requireAuth('owner'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'Owner Meaning Promotion is owner-only.' })
    }
    const body = req.body || {}
    const captureId = body.capture_id
    if (!captureId || typeof captureId !== 'string' || captureId.trim().length === 0) {
      return res.status(400).json({ ok: false, error: 'capture_id is required.' })
    }
    const result = gen.generateOwnerMeaningPromotionCandidate(db, {
      venueId: req.venueId, captureId, triggeredBy: (req.user && (req.user.full_name || req.user.id)) || null,
    })
    return res.status(result.created ? 201 : 200).json({ ok: true, ...result })
  } catch (err) {
    if (err && err.code === 'NOT_FOUND') return res.status(404).json({ ok: false, error: 'No owner meaning capture found for this venue.' })
    if (err && err.code === 'BAD_REQUEST') return res.status(400).json({ ok: false, error: err.message })
    return res.status(500).json({ ok: false, error: 'Could not generate the promotion candidate.' })
  }
})

// ── Verbatim-shape GET list + GET one handlers (read-back) ───────────────────
app.get('/api/owner-meaning-promotion-candidates', requireAuth('owner'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') return res.status(403).json({ ok: false, error: 'Owner Meaning Promotion is owner-only.' })
    const result = promo.listOwnerMeaningPromotionCandidates(db, req.venueId, {
      limit: req.query.limit, offset: req.query.offset, status: req.query.status,
      targetPath: req.query.target_path, confidenceLabel: req.query.confidence_label,
    })
    res.json({ ok: true, ...result })
  } catch (err) {
    if (err && err.code === 'BAD_REQUEST') return res.status(400).json({ ok: false, error: err.message })
    res.status(500).json({ ok: false, error: 'Could not read promotion candidates.' })
  }
})
app.get('/api/owner-meaning-promotion-candidates/:candidateId', requireAuth('owner'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') return res.status(403).json({ ok: false, error: 'Owner Meaning Promotion is owner-only.' })
    const candidate = promo.getOwnerMeaningPromotionCandidateById(db, req.venueId, req.params.candidateId)
    if (!candidate) return res.status(404).json({ ok: false, error: 'No promotion candidate found for this venue.' })
    const source_captures = promo.resolveSourceCapturesForPromotionCandidate(db, req.venueId, candidate)
    const events = promo.listOwnerMeaningPromotionEvents(db, req.venueId, req.params.candidateId)
    res.json({ ok: true, candidate, source_captures, events, allowed_actions: { ...promo.OWNER_MEANING_PROMOTION_ALLOWED_ACTIONS } })
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Could not read the promotion candidate.' })
  }
})

const GEN = '/api/owner-meaning-promotion-candidates/generate'
const LIST = '/api/owner-meaning-promotion-candidates'

function call(server, method, path, { role, venue = 'venue_A', body } = {}) {
  const { port } = server.address()
  const headers = { 'Content-Type': 'application/json', Connection: 'close' }
  if (role) headers['X-Role'] = role
  if (venue) headers['X-Venue'] = venue
  const init = { method, headers }
  if (body !== undefined) init.body = JSON.stringify(body)
  return fetch(`http://127.0.0.1:${port}${path}`, init).then(async r => ({ status: r.status, json: await r.json().catch(() => ({})) }))
}

const server = app.listen(0, async () => {
  console.log('\nOwner Meaning Promotion GENERATION route — behavioral (owner-only write) test\n')
  try {
    // ── auth / scope: blocked roles write NOTHING ──
    const baseC = candCount(), baseE = evtCount()
    ok((await call(server, 'POST', GEN, { role: 'admin', body: { capture_id: capA1.id } })).status === 403, '[admin] generate → 403')
    ok((await call(server, 'POST', GEN, { role: 'manager', body: { capture_id: capA1.id } })).status === 403, '[manager] generate → 403')
    ok((await call(server, 'POST', GEN, { role: 'bar_manager', body: { capture_id: capA1.id } })).status === 403, '[bar_manager] generate → 403')
    ok((await call(server, 'POST', GEN, { role: 'chef', body: { capture_id: capA1.id } })).status === 403, '[chef] generate → 403')
    ok((await call(server, 'POST', GEN, { body: { capture_id: capA1.id } })).status === 401, '[anon] generate → 401')
    ok(candCount() === baseC && evtCount() === baseE, '[auth] blocked roles wrote ZERO candidate + ZERO event rows')

    // ── owner happy path: 201 created ──
    const created = await call(server, 'POST', GEN, { role: 'owner', venue: 'venue_A', body: { capture_id: capA1.id } })
    ok(created.status === 201 && created.json.ok && created.json.created === true, '[owner] generate → 201 created:true')
    const newId = created.json.candidate && created.json.candidate.id
    ok(typeof newId === 'string', '[owner] generation returns the new candidate id')
    ok(created.json.candidate.application.blocked === true, '[owner] generated candidate application.blocked true')
    ok(created.json.candidate.confidence.label === 'low' && created.json.candidate.confidence.score === null, '[owner] generated candidate confidence low / score null')
    ok(candCount() === baseC + 1 && evtCount() === baseE + 1, '[owner] exactly one candidate + one event written')

    // ── read-back via GET: blocked + all actions false ──
    const detail = await call(server, 'GET', `${LIST}/${newId}`, { role: 'owner', venue: 'venue_A' })
    ok(detail.status === 200 && detail.json.candidate.id === newId, '[read-back] GET one returns the generated candidate')
    ok(detail.json.allowed_actions && Object.values(detail.json.allowed_actions).every(v => v === false), '[read-back] allowed_actions ALL false')
    ok(detail.json.candidate.application.blocked === true, '[read-back] application.blocked true')
    ok(Array.isArray(detail.json.source_captures) && detail.json.source_captures.length === 1 && detail.json.source_captures[0].id === capA1.id, '[read-back] resolves the source capture')
    ok(detail.json.source_captures[0].owner_response_raw === 'We host guests, not customers — a candlelit, spirit-forward room.', '[read-back] source capture raw preserved byte-for-byte')

    // ── idempotency: repeat → skipped, no dup ──
    const dupC = candCount(), dupE = evtCount()
    const repeat = await call(server, 'POST', GEN, { role: 'owner', venue: 'venue_A', body: { capture_id: capA1.id } })
    ok(repeat.status === 200 && repeat.json.skipped === true && repeat.json.reason === 'duplicate', '[idempotent] repeat generate → 200 skipped:duplicate')
    ok(repeat.json.candidate && repeat.json.candidate.id === newId, '[idempotent] repeat returns the SAME candidate')
    ok(candCount() === dupC && evtCount() === dupE, '[idempotent] no duplicate candidate / event row created')

    // ── too-weak answer → skipped, no row ──
    const weakC = candCount(), weakE = evtCount()
    const weak = await call(server, 'POST', GEN, { role: 'owner', venue: 'venue_A', body: { capture_id: capWeak.id } })
    ok(weak.status === 200 && weak.json.skipped === true && weak.json.reason === 'too_weak' && weak.json.candidate === null, '[weak] thin answer → 200 skipped:too_weak (no candidate)')
    ok(candCount() === weakC && evtCount() === weakE, '[weak] skipped generation wrote nothing')

    // ── input validation ──
    ok((await call(server, 'POST', GEN, { role: 'owner', body: {} })).status === 400, '[400] missing capture_id → 400')
    ok((await call(server, 'POST', GEN, { role: 'owner', body: { capture_id: '   ' } })).status === 400, '[400] blank capture_id → 400')
    ok((await call(server, 'POST', GEN, { role: 'owner', body: { capture_id: randomUUID() } })).status === 404, '[404] unknown capture_id → 404')

    // ── venue scope: client cannot widen; cross-venue capture unusable ──
    const scopeC = candCount(), scopeE = evtCount()
    // A venue_B owner cannot generate from a venue_A capture (even passing a body venue_id).
    const crossBody = await call(server, 'POST', GEN, { role: 'owner', venue: 'venue_B', body: { capture_id: capA1.id, venue_id: 'venue_A' } })
    ok(crossBody.status === 404, '[scoping] cross-venue capture + body venue_id cannot widen access → 404')
    ok(candCount() === scopeC && evtCount() === scopeE, '[scoping] cross-venue attempt wrote nothing')
    // venue_B can generate from its OWN capture, and it never appears in venue_A.
    const bGen = await call(server, 'POST', GEN, { role: 'owner', venue: 'venue_B', body: { capture_id: capB1.id } })
    ok(bGen.status === 201 && bGen.json.created === true, '[scoping] venue_B generates from its own capture → 201')
    ok((await call(server, 'GET', `${LIST}/${bGen.json.candidate.id}`, { role: 'owner', venue: 'venue_A' })).status === 404, '[scoping] venue_B candidate is unreachable from venue_A → 404')

    // ── GET stays read-only: no owner_review_opened ever emitted ──
    await call(server, 'GET', LIST, { role: 'owner', venue: 'venue_A' })
    await call(server, 'GET', `${LIST}/${newId}`, { role: 'owner', venue: 'venue_A' })
    ok(reviewOpenedCount() === 0, '[read-only] no owner_review_opened event ever emitted (GET stays pure)')
  } catch (e) {
    failed++; console.error('  [FAIL] unexpected error:', e && e.message)
  } finally {
    console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
    process.exitCode = failed > 0 ? 1 : 0
    try { db.close() } catch { /* in-memory */ }
    server.close()
  }
})
