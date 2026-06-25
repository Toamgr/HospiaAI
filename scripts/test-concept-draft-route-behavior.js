#!/usr/bin/env node
/**
 * Behavioral (integration) test for the Concept Drafts Workspace (Slice 2a) READ-ONLY routes.
 *
 * Mounts the two real read route handlers (copied verbatim in shape from server.js) on a
 * minimal express app, behind a requireAuth model that faithfully mirrors server.js (401
 * without a role, 403 for a role not in the allow-list, admin global bypass). They run against
 * the REAL service and a REAL in-memory node:sqlite db, over real HTTP. Proves end-to-end:
 *   • owner + admin GET succeed; manager is 403; unauthenticated is 401;
 *   • cross-venue isolation holds (venue B cannot see venue A's drafts);
 *   • malformed concept_ref detail → 400; unknown concept_ref → 404;
 *   • NO write route exists on the base (PUT/POST/DELETE → 404 from express);
 *   • the reads mutate nothing (review + audit row counts unchanged).
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-concept-draft-route-behavior.js
 */

import express from 'express'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import * as svc from '../src/services/venueIntelligence/discoveryCandidateReviewService.js'

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

const db = new DatabaseSync(':memory:')
db.exec(svc.DISCOVERY_CANDIDATE_REVIEWS_DDL)
db.exec(svc.DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL)

const reviewCount = () => db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_reviews').get().n
const auditCount = () => db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_review_events').get().n

// Faithful model of server.js requireAuth.
function requireAuth(...allowedRoles) {
  return (req, res, next) => {
    const role = req.header('X-Role')
    if (!role) return res.status(401).json({ error: 'Authorization required.' })
    req.user = { id: 'u1', full_name: 'Test User', role }
    req.venueId = req.header('X-Venue') || 'venue_A'
    if (allowedRoles.length > 0 && role !== 'admin' && !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden.' })
    }
    next()
  }
}

const app = express()
app.use(express.json())

app.get('/api/discovery-concept-drafts', requireAuth('owner', 'admin'), (req, res) => {
  try {
    const filters = {}
    if (req.query.limit != null) filters.limit = Number(req.query.limit)
    res.json({ ok: true, drafts: svc.listConceptDraftsForVenue(db, req.venueId, filters) })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

app.get('/api/discovery-concept-drafts/:conceptRef', requireAuth('owner', 'admin'), (req, res) => {
  try {
    const draft = svc.getConceptDraftDetail(db, req.venueId, req.params.conceptRef)
    if (!draft) return res.status(404).json({ ok: false, error: 'No concept draft found for this venue.' })
    res.json({ ok: true, draft })
  } catch (err) {
    if (err && err.code === 'BAD_REQUEST') return res.status(400).json({ ok: false, error: err.message })
    res.status(500).json({ error: err.message })
  }
})

// Seed: venue A has one concept with two saved reviews; venue B has its own concept.
const CONCEPT_A = randomUUID()
const CONCEPT_B = randomUUID()
const SNAP = { signal: 'focus on elegance', evidence: 'e', confidence_band: 'low', dna_status_label: 'candidate only', suggested_destination: 'Venue Memory' }
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_A, { id: randomUUID(), review_action: 'captured', candidate_snapshot: SNAP, conversation_ref: '0:0' })
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_A, { id: randomUUID(), review_action: 'held', candidate_snapshot: SNAP, conversation_ref: '0:1' })
svc.upsertDiscoveryReview(db, 'venue_B', CONCEPT_B, { id: randomUUID(), review_action: 'captured', candidate_snapshot: SNAP, conversation_ref: '0:0' })

function req(server, method, path, { role, venue = 'venue_A', body } = {}) {
  const { port } = server.address()
  const headers = { 'Content-Type': 'application/json', 'X-Venue': venue, Connection: 'close' }
  if (role) headers['X-Role'] = role
  return fetch(`http://127.0.0.1:${port}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  }).then(async r => ({ status: r.status, json: await r.json().catch(() => ({})) }))
}

const server = app.listen(0, async () => {
  console.log('\nConcept Drafts Workspace routes — behavioral (read-only) test\n')
  try {
    const reviewsBefore = reviewCount(), auditBefore = auditCount()

    // Owner list.
    const ownerList = await req(server, 'GET', '/api/discovery-concept-drafts', { role: 'owner' })
    ok(ownerList.status === 200 && Array.isArray(ownerList.json.drafts) && ownerList.json.drafts.length === 1,
      '[owner] GET list succeeds, returns venue A’s single concept draft')
    ok(ownerList.json.drafts[0] && ownerList.json.drafts[0].review_count === 2, '[owner] draft groups two saved reviews')

    // Admin list (read allowed).
    const adminList = await req(server, 'GET', '/api/discovery-concept-drafts', { role: 'admin' })
    ok(adminList.status === 200 && adminList.json.drafts.length === 1, '[admin] GET list succeeds (read)')

    // Manager forbidden; unauthenticated 401.
    const managerList = await req(server, 'GET', '/api/discovery-concept-drafts', { role: 'manager' })
    ok(managerList.status === 403, '[manager] GET list is 403')
    const anonList = await req(server, 'GET', '/api/discovery-concept-drafts', {})
    ok(anonList.status === 401, '[anon] GET list is 401')

    // Cross-venue isolation: venue B cannot see venue A's concept.
    const venueBList = await req(server, 'GET', '/api/discovery-concept-drafts', { role: 'owner', venue: 'venue_B' })
    ok(venueBList.status === 200 && venueBList.json.drafts.length === 1 && venueBList.json.drafts[0].concept_ref === CONCEPT_B,
      '[isolation] venue B sees only its own concept')
    const venueBHasA = venueBList.json.drafts.some(d => d.concept_ref === CONCEPT_A)
    ok(!venueBHasA, '[isolation] venue A concept never appears under venue B')

    // Detail readback (owner).
    const detail = await req(server, 'GET', `/api/discovery-concept-drafts/${CONCEPT_A}`, { role: 'owner' })
    ok(detail.status === 200 && detail.json.draft && Array.isArray(detail.json.draft.reviews) && detail.json.draft.reviews.length === 2,
      '[owner] GET detail returns the two saved snapshots')

    // Cross-venue detail → 404.
    const detailCross = await req(server, 'GET', `/api/discovery-concept-drafts/${CONCEPT_A}`, { role: 'owner', venue: 'venue_B' })
    ok(detailCross.status === 404, '[isolation] venue B requesting venue A concept detail → 404')

    // Malformed concept_ref → 400; unknown → 404.
    const malformed = await req(server, 'GET', '/api/discovery-concept-drafts/not-a-uuid', { role: 'owner' })
    ok(malformed.status === 400, '[validation] malformed concept_ref → 400 (no write)')
    const unknown = await req(server, 'GET', `/api/discovery-concept-drafts/${randomUUID()}`, { role: 'owner' })
    ok(unknown.status === 404, '[validation] unknown concept_ref → 404')

    // No write route on this base — PUT/POST/DELETE → 404 from express.
    const putAttempt = await req(server, 'PUT', `/api/discovery-concept-drafts/${CONCEPT_A}`, { role: 'owner', body: { x: 1 } })
    ok(putAttempt.status === 404, '[read-only] PUT on the concept-drafts base → 404 (no such route)')
    const postAttempt = await req(server, 'POST', '/api/discovery-concept-drafts', { role: 'owner', body: { x: 1 } })
    ok(postAttempt.status === 404, '[read-only] POST on the concept-drafts base → 404 (no such route)')

    // Reads mutated nothing.
    ok(reviewCount() === reviewsBefore, '[read-only] no review rows created by reads')
    ok(auditCount() === auditBefore, '[read-only] no audit rows created by reads')
  } catch (e) {
    failed++; console.error('  [FAIL] unexpected error:', e && e.message)
  } finally {
    console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
    process.exitCode = failed > 0 ? 1 : 0
    try { db.close() } catch { /* in-memory */ }
    server.close()
  }
})
