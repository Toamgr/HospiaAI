#!/usr/bin/env node
/**
 * Behavioral (integration) test for the Owner Meaning Promotion OWNER REVIEW ACTION routes (Slice 4L):
 *   POST /api/owner-meaning-promotion-candidates/:candidateId/approve-meaning
 *   POST /api/owner-meaning-promotion-candidates/:candidateId/reject
 *   POST /api/owner-meaning-promotion-candidates/:candidateId/request-revision
 *
 * Plus the existing GET detail route (to prove a decided candidate reads back blocked, actions false).
 *
 * Mounts the REAL route handlers (verbatim in shape from server.js, including the shared handler's
 * in-handler admin block and the NOT_FOUND→404 / CONFLICT→409 / BAD_REQUEST→400 / else→500 mapping)
 * on a minimal express app, behind a requireAuth model that FAITHFULLY mirrors server.js requireAuth:
 * 401 without a role, 403 for a role not in the allow-list, and the platform-admin GLOBAL BYPASS.
 * Runs against the REAL services + a REAL in-memory node:sqlite db over real HTTP. Candidates are
 * seeded through the REAL generation writer (which uses the REAL capture writer).
 *
 * Proves end-to-end:
 *   • owner can approve / reject / request-revision an in-venue reviewable candidate (200);
 *   • the decision reads back via GET with application.blocked:true + allowed_actions all false;
 *   • admin → 403 (zero rows written); manager / bar_manager / chef / employee → 403; anon → 401;
 *   • a client ?venue_id / body venue_id cannot widen access; a cross-venue candidate → 404 (no write);
 *   • unknown candidate → 404; deciding an already-decided candidate → 409 (no duplicate event);
 *   • action responses do not imply DNA application (note says Venue DNA not changed; blocked stays true).
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-owner-meaning-promotion-review-route-behavior.js
 */

import express from 'express'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import * as promo from '../src/services/venueIntelligence/ownerMeaningPromotionService.js'
import * as gen from '../src/services/venueIntelligence/ownerMeaningPromotionGenerationService.js'
import * as review from '../src/services/venueIntelligence/ownerMeaningPromotionReviewService.js'
import * as omc from '../src/services/venueIntelligence/ownerMeaningCaptureService.js'

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

const db = new DatabaseSync(':memory:')
db.exec(promo.OWNER_MEANING_PROMOTION_CANDIDATES_DDL)
db.exec(promo.OWNER_MEANING_PROMOTION_EVENTS_DDL)
db.exec(omc.OWNER_MEANING_CAPTURES_DDL)
db.exec(omc.OWNER_MEANING_CAPTURE_EVENTS_DDL)

const evtCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_promotion_events').get().n
const statusOf = (id, venue = 'venue_A') => db.prepare('SELECT status FROM owner_meaning_promotion_candidates WHERE id = ? AND venue_id = ?').get(id, venue)?.status

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
function seedCandidate(venueId, response) {
  const cap = seedCapture(venueId, response)
  return gen.generateOwnerMeaningPromotionCandidate(db, { venueId, captureId: cap.id }).candidate.id
}

// Faithful model of server.js requireAuth: role from header, 401 if absent, admin bypasses the
// allow-list, others must be in it (else 403); req.venueId resolved per request from X-Venue.
function requireAuth(...allowedRoles) {
  return (req, res, next) => {
    const role = req.header('X-Role')
    if (!role) return res.status(401).json({ error: 'Authorization required.' })
    req.user = { id: `u_${role}`, full_name: 'Tal Millo', role }
    req.venueId = req.header('X-Venue') || 'venue_A'
    if (allowedRoles.length > 0 && role !== 'admin' && !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden.' })
    }
    next()
  }
}

const app = express()
app.use(express.json())

// ── Verbatim-shape shared review handler (mirrors server.js) ─────────────────
function handleOwnerMeaningPromotionReview(reviewFn, req, res) {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'Owner Meaning Promotion is owner-only.' })
    }
    const body = req.body || {}
    const result = reviewFn(db, {
      venueId: req.venueId,
      candidateId: req.params.candidateId,
      actor: req.user ? { id: req.user.id, role: req.user.role } : null,
      reason: typeof body.reason === 'string' ? body.reason : undefined,
      revisionRequest: typeof body.revision_request === 'string' ? body.revision_request : undefined,
    })
    return res.json({ ok: true, ...result, note: 'Recorded the owner review decision. Venue DNA was not changed, and nothing was applied to DNA.' })
  } catch (err) {
    if (err && err.code === 'NOT_FOUND') return res.status(404).json({ ok: false, error: 'No promotion candidate found for this venue.' })
    if (err && err.code === 'CONFLICT') return res.status(409).json({ ok: false, error: 'This promotion candidate is not in a reviewable state.' })
    if (err && err.code === 'BAD_REQUEST') return res.status(400).json({ ok: false, error: err.message })
    return res.status(500).json({ ok: false, error: 'Could not record the owner review decision.' })
  }
}
app.post('/api/owner-meaning-promotion-candidates/:candidateId/approve-meaning', requireAuth('owner'), (req, res) => handleOwnerMeaningPromotionReview(review.approveOwnerMeaningPromotionCandidateMeaning, req, res))
app.post('/api/owner-meaning-promotion-candidates/:candidateId/reject', requireAuth('owner'), (req, res) => handleOwnerMeaningPromotionReview(review.rejectOwnerMeaningPromotionCandidate, req, res))
app.post('/api/owner-meaning-promotion-candidates/:candidateId/request-revision', requireAuth('owner'), (req, res) => handleOwnerMeaningPromotionReview(review.requestRevisionOwnerMeaningPromotionCandidate, req, res))

// ── Verbatim-shape GET one (read-back) ───────────────────────────────────────
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

const BASE = '/api/owner-meaning-promotion-candidates'
const approveUrl = id => `${BASE}/${id}/approve-meaning`
const rejectUrl = id => `${BASE}/${id}/reject`
const reviseUrl = id => `${BASE}/${id}/request-revision`

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
  console.log('\nOwner Meaning Promotion REVIEW routes — behavioral (owner-only decisions) test\n')
  try {
    // ── auth / scope: blocked roles write NOTHING ──
    const cAuth = seedCandidate('venue_A', 'We host guests, not customers — a candlelit, spirit-forward room.')
    const baseE = evtCount()
    ok((await call(server, 'POST', approveUrl(cAuth), { role: 'admin', body: { reason: 'x' } })).status === 403, '[admin] approve-meaning → 403')
    ok((await call(server, 'POST', rejectUrl(cAuth), { role: 'manager', body: {} })).status === 403, '[manager] reject → 403')
    ok((await call(server, 'POST', reviseUrl(cAuth), { role: 'bar_manager', body: {} })).status === 403, '[bar_manager] request-revision → 403')
    ok((await call(server, 'POST', approveUrl(cAuth), { role: 'chef', body: {} })).status === 403, '[chef] approve-meaning → 403')
    ok((await call(server, 'POST', approveUrl(cAuth), { role: 'employee', body: {} })).status === 403, '[employee] approve-meaning → 403')
    ok((await call(server, 'POST', approveUrl(cAuth), { body: {} })).status === 401, '[anon] approve-meaning → 401')
    ok(evtCount() === baseE, '[auth] blocked roles wrote ZERO event rows')
    ok(statusOf(cAuth) === 'draft_suggestion', '[auth] candidate status unchanged by blocked roles')

    // ── owner approve-meaning happy path ──
    const approved = await call(server, 'POST', approveUrl(cAuth), { role: 'owner', venue: 'venue_A', body: { reason: 'Exactly right.' } })
    ok(approved.status === 200 && approved.json.ok && approved.json.action === 'approve_meaning', '[owner] approve-meaning → 200 action approve_meaning')
    ok(approved.json.nextStatus === 'owner_approved', '[owner] approve sets nextStatus owner_approved')
    ok(approved.json.candidate.application.blocked === true, '[owner] approved candidate application.blocked STAYS true (approve ≠ apply)')
    ok(/not.*applied|not.*changed/i.test(approved.json.note || ''), '[owner] response note states Venue DNA not changed / not applied')
    ok(evtCount() === baseE + 1, '[owner] exactly one event written')

    // read-back blocked + actions false
    const detail = await call(server, 'GET', `${BASE}/${cAuth}`, { role: 'owner', venue: 'venue_A' })
    ok(detail.status === 200 && detail.json.candidate.status === 'owner_approved', '[read-back] GET shows owner_approved')
    ok(detail.json.allowed_actions && Object.values(detail.json.allowed_actions).every(v => v === false), '[read-back] allowed_actions ALL false (no DNA application)')
    ok(detail.json.candidate.application.blocked === true, '[read-back] application.blocked true after approve')

    // ── repeated approve → 409, no dup ──
    const dupE = evtCount()
    const repeat = await call(server, 'POST', approveUrl(cAuth), { role: 'owner', venue: 'venue_A', body: { reason: 'again' } })
    ok(repeat.status === 409, '[idempotent] repeat approve on owner_approved → 409')
    ok(evtCount() === dupE, '[idempotent] repeated approve wrote no duplicate event')

    // ── owner reject happy path ──
    const cR = seedCandidate('venue_A', 'The bar should lead the menu identity, full stop.')
    const rejected = await call(server, 'POST', rejectUrl(cR), { role: 'owner', venue: 'venue_A', body: { reason: 'Not relevant.' } })
    ok(rejected.status === 200 && rejected.json.action === 'reject_candidate' && rejected.json.nextStatus === 'owner_rejected', '[owner] reject → 200 owner_rejected')
    ok(rejected.json.candidate.application.blocked === true, '[owner] rejected candidate stays blocked')
    // rejected cannot be approved later
    ok((await call(server, 'POST', approveUrl(cR), { role: 'owner', venue: 'venue_A', body: {} })).status === 409, '[transition] rejected candidate cannot be approved → 409')

    // ── owner request-revision happy path ──
    const cV = seedCandidate('venue_A', 'Service should feel warm but unobtrusive, never scripted.')
    const revised = await call(server, 'POST', reviseUrl(cV), { role: 'owner', venue: 'venue_A', body: { reason: 'Re-read.', revision_request: 'Focus on warmth.' } })
    ok(revised.status === 200 && revised.json.action === 'request_revision' && revised.json.nextStatus === 'revision_requested', '[owner] request-revision → 200 revision_requested')
    ok((await call(server, 'POST', approveUrl(cV), { role: 'owner', venue: 'venue_A', body: {} })).status === 409, '[transition] revision_requested candidate is not directly approvable → 409')

    // ── unknown candidate → 404 ──
    ok((await call(server, 'POST', approveUrl(randomUUID()), { role: 'owner', venue: 'venue_A', body: {} })).status === 404, '[404] unknown candidate → 404')

    // ── venue scope: client cannot widen; cross-venue candidate unusable ──
    const cB = seedCandidate('venue_B', 'Venue B private — must never be reviewable from A.')
    const scopeE = evtCount()
    const cross = await call(server, 'POST', approveUrl(cB), { role: 'owner', venue: 'venue_A', body: { venue_id: 'venue_B' } })
    ok(cross.status === 404, '[scoping] cross-venue candidate + body venue_id cannot widen access → 404')
    ok(evtCount() === scopeE, '[scoping] cross-venue attempt wrote nothing')
    ok(statusOf(cB, 'venue_B') === 'draft_suggestion', '[scoping] venue_B candidate untouched by venue_A attempt')
    const bOk = await call(server, 'POST', approveUrl(cB), { role: 'owner', venue: 'venue_B', body: {} })
    ok(bOk.status === 200 && bOk.json.nextStatus === 'owner_approved', '[scoping] venue_B owner decides its OWN candidate → 200')
  } catch (e) {
    failed++; console.error('  [FAIL] unexpected error:', e && e.message)
  } finally {
    console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
    process.exitCode = failed > 0 ? 1 : 0
    try { db.close() } catch { /* in-memory */ }
    server.close()
  }
})
