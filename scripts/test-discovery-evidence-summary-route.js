#!/usr/bin/env node
/**
 * Behavioral (integration) test for the Evidence Summary (EAE Slice 1) READ-ONLY route:
 *   GET /api/discovery-evidence-summary
 *
 * Mounts the real route handler shape on a minimal express app, behind a requireAuth model that
 * faithfully mirrors server.js (401 without a role, 403 for a role not in the allow-list, admin
 * global bypass). Runs against the REAL service and a REAL in-memory node:sqlite db over real
 * HTTP. Proves end-to-end:
 *   • owner + admin GET succeed; manager is 403; unauthenticated is 401;
 *   • cross-venue isolation (venue B never sees venue A's evidence);
 *   • record_space isolation (a directly-inserted 'live_venue' row is ignored);
 *   • empty venue → 200 ok:true, zero totals, honest limitations;
 *   • this is GET-ONLY — admin has NO write path; PUT/POST/PATCH/DELETE → 404 from express;
 *   • the read mutates nothing (review + audit row counts unchanged);
 *   • the JSON response carries no forbidden truth/promotion vocabulary.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-discovery-evidence-summary-route.js
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

// Route handler shape copied verbatim from server.js.
app.get('/api/discovery-evidence-summary', requireAuth('owner', 'admin'), (req, res) => {
  try {
    const summary = svc.summarizeDiscoveryEvidenceForVenue(db, req.venueId)
    res.json({ ok: true, summary, note: 'Memory signals only — not confirmed Venue DNA.' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Seed: venue A has one concept with two saved reviews (one Venue DNA earmark); venue B its own.
const CONCEPT_A = randomUUID()
const CONCEPT_B = randomUUID()
const SNAP = { signal: 'focus on elegance', evidence: 'e', confidence_band: 'low', dna_status_label: 'candidate only', suggested_destination: 'Venue Memory' }
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_A, { id: randomUUID(), review_action: 'captured', candidate_snapshot: SNAP, chosen_destination: 'Venue DNA', conversation_ref: '0:0' })
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_A, { id: randomUUID(), review_action: 'held', candidate_snapshot: SNAP, conversation_ref: '0:1' })
svc.upsertDiscoveryReview(db, 'venue_B', CONCEPT_B, { id: randomUUID(), review_action: 'captured', candidate_snapshot: SNAP, conversation_ref: '0:0' })
// record_space isolation seed: a 'live_venue' row for venue A (must be ignored by the summary).
db.prepare(`
  INSERT INTO discovery_candidate_reviews
    (id, venue_id, concept_ref, record_space, candidate_snapshot_json, review_action, provenance)
  VALUES (?, 'venue_A', ?, 'live_venue', ?, 'captured', 'owner_conversation')
`).run(randomUUID(), randomUUID(), JSON.stringify(SNAP))

function req(server, method, path, { role, venue = 'venue_A', body } = {}) {
  const { port } = server.address()
  const headers = { 'Content-Type': 'application/json', 'X-Venue': venue, Connection: 'close' }
  if (role) headers['X-Role'] = role
  return fetch(`http://127.0.0.1:${port}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  }).then(async r => ({ status: r.status, json: await r.json().catch(() => ({})) }))
}

const PATH = '/api/discovery-evidence-summary'

const server = app.listen(0, async () => {
  console.log('\nEvidence Summary (EAE Slice 1) route — behavioral (read-only) test\n')
  try {
    const reviewsBefore = reviewCount(), auditBefore = auditCount()

    // Auth matrix.
    const anon = await req(server, 'GET', PATH, {})
    ok(anon.status === 401, '[anon] GET is 401')
    const owner = await req(server, 'GET', PATH, { role: 'owner' })
    ok(owner.status === 200 && owner.json.ok === true && owner.json.summary, '[owner] GET succeeds (200, ok:true)')
    const admin = await req(server, 'GET', PATH, { role: 'admin' })
    ok(admin.status === 200 && admin.json.ok === true, '[admin] GET succeeds (read)')
    const manager = await req(server, 'GET', PATH, { role: 'manager' })
    ok(manager.status === 403, '[manager] GET is 403')

    // Content: venue A sees its concept_draft evidence; live_venue row excluded.
    ok(owner.json.summary.totals.saved_reviews === 2, `[owner] saved_reviews === 2 (live_venue excluded) (got ${owner.json.summary.totals.saved_reviews})`)
    ok(owner.json.summary.totals.dna_earmarks === 1, '[owner] dna_earmarks === 1')
    ok(owner.json.summary.concepts.length === 1 && owner.json.summary.concepts[0].concept_ref === CONCEPT_A,
      '[owner] one concept, the venue A concept')

    // Cross-venue isolation.
    const venueB = await req(server, 'GET', PATH, { role: 'owner', venue: 'venue_B' })
    ok(venueB.status === 200 && venueB.json.summary.totals.saved_reviews === 1 && venueB.json.summary.concepts[0].concept_ref === CONCEPT_B,
      '[isolation] venue B sees only its own evidence')
    ok(!venueB.json.summary.concepts.some(c => c.concept_ref === CONCEPT_A), '[isolation] venue A concept never appears under venue B')

    // Empty venue → 200 ok:true, zero totals, limitations.
    const emptyV = await req(server, 'GET', PATH, { role: 'owner', venue: 'venue_EMPTY' })
    ok(emptyV.status === 200 && emptyV.json.ok === true, '[empty] GET succeeds 200 ok:true')
    ok(emptyV.json.summary.totals.saved_reviews === 0 && emptyV.json.summary.concepts.length === 0, '[empty] zero totals, no concepts')
    ok(Array.isArray(emptyV.json.summary.limitations) && emptyV.json.summary.limitations.length >= 3, '[empty] honest limitations present')

    // GET-ONLY — admin has NO write path. Any mutating verb → 404 (no such route).
    for (const m of ['PUT', 'POST', 'PATCH', 'DELETE']) {
      const attempt = await req(server, m, PATH, { role: 'admin', body: { x: 1 } })
      ok(attempt.status === 404, `[read-only] ${m} on the summary route → 404 (no such route; admin has no write path)`)
    }

    // The reads mutated nothing.
    ok(reviewCount() === reviewsBefore, '[read-only] no review rows created by reads')
    ok(auditCount() === auditBefore, '[read-only] no audit rows created by reads')

    // No forbidden truth/promotion vocabulary (allow the guardrail phrase "not confirmed Venue DNA").
    const serialized = JSON.stringify([owner.json, admin.json, venueB.json, emptyV.json]).toLowerCase().replace(/not confirmed venue dna/g, '')
    for (const word of ['confirmed', 'approved', 'promoted', 'verified', 'truth score', 'readiness score', 'dna updated']) {
      ok(!serialized.includes(word), `[copy] response contains no forbidden word: "${word}"`)
    }
  } catch (e) {
    failed++; console.error('  [FAIL] unexpected error:', e && e.message)
  } finally {
    console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
    process.exitCode = failed > 0 ? 1 : 0
    try { db.close() } catch { /* in-memory */ }
    server.close()
  }
})
