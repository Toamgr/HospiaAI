#!/usr/bin/env node
/**
 * Behavioral (integration) test for the New Venue Discovery — Fidelity Review Persistence
 * routes (Slice 1), focused on the OWNER-ONLY write rule.
 *
 * It mounts the THREE real route handlers (copied verbatim in shape from server.js, including
 * the explicit in-handler admin-write block) on a minimal express app, behind a requireAuth
 * model that FAITHFULLY mirrors server.js requireAuth: 401 without a role, 403 for a role not
 * in the allow-list, and the platform-admin GLOBAL BYPASS. They run against the REAL service
 * and a REAL in-memory node:sqlite db, over real HTTP. This proves the contract end-to-end:
 *   • owner PUT succeeds and writes; admin PUT is 403 and writes NOTHING (zero audit + zero
 *     review rows); non-owner roles are 403; unauthenticated is 401; admin retains GET read.
 *
 * The companion static audit (test-discovery-review-route-audit.js) separately proves server.js
 * itself contains the same admin guard BEFORE the sole writer.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-discovery-review-route-behavior.js
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

const auditCount = () => db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_review_events').get().n
const reviewCount = () => db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_reviews').get().n

// Faithful model of server.js requireAuth: role from header, 401 if absent, admin bypasses the
// allow-list, others must be in it (else 403), and req.venueId is resolved per request.
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

app.get('/api/discovery-reviews', requireAuth('owner', 'admin'), (req, res) => {
  try {
    const filters = {}
    if (typeof req.query.concept_ref === 'string') filters.concept_ref = req.query.concept_ref
    if (req.query.limit != null) filters.limit = Number(req.query.limit)
    res.json({ ok: true, reviews: svc.listDiscoveryReviewsForVenue(db, req.venueId, filters) })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

app.get('/api/discovery-reviews/:reviewId', requireAuth('owner', 'admin'), (req, res) => {
  try {
    const review = svc.getDiscoveryReviewById(db, req.venueId, req.params.reviewId)
    if (!review) return res.status(404).json({ ok: false, error: 'No discovery review found for this venue.' })
    res.json({ ok: true, review })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

app.put('/api/discovery-reviews/:reviewId', requireAuth('owner'), (req, res) => {
  try {
    // OWNER-ONLY fidelity write — re-exclude the platform-admin bypass HERE, before any write.
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'Fidelity reviews are owner-only; admin is read-only here.' })
    }
    const body = req.body || {}
    const review = svc.upsertDiscoveryReview(db, req.venueId, body.concept_ref, {
      id: req.params.reviewId,
      review_action: body.review_action,
      chosen_destination: body.chosen_destination,
      owner_edit: body.owner_edit,
      candidate_snapshot: body.candidate_snapshot,
      conversation_ref: body.conversation_ref,
      reviewed_by: (req.user && (req.user.full_name || req.user.id)) || null,
    })
    res.json({ ok: true, review })
  } catch (err) {
    if (err && err.code === 'NOT_FOUND') return res.status(404).json({ ok: false, error: 'Not found.' })
    res.status(400).json({ error: err.message })
  }
})

const CONCEPT = randomUUID()
const SNAP = { signal: 's', evidence: 'e', confidence_band: 'low', dna_status_label: 'candidate only', suggested_destination: 'Venue DNA' }

function req(server, method, path, { role, body } = {}) {
  const { port } = server.address()
  // Connection: close → no keep-alive sockets linger, so server.close() completes promptly.
  const headers = { 'Content-Type': 'application/json', 'X-Venue': 'venue_A', Connection: 'close' }
  if (role) headers['X-Role'] = role
  return fetch(`http://127.0.0.1:${port}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  }).then(async r => ({ status: r.status, json: await r.json().catch(() => ({})) }))
}

const server = app.listen(0, async () => {
  console.log('\nDiscovery fidelity-review routes — behavioral (owner-only write) test\n')
  try {
    const ownerId = randomUUID()
    // 4. Owner PUT succeeds and writes.
    const ownerPut = await req(server, 'PUT', `/api/discovery-reviews/${ownerId}`, {
      role: 'owner', body: { concept_ref: CONCEPT, review_action: 'captured', candidate_snapshot: SNAP, conversation_ref: '0:0' },
    })
    ok(ownerPut.status === 200 && ownerPut.json.ok, '[4] owner PUT succeeds (200)')
    ok(reviewCount() === 1 && auditCount() === 1, '[4] owner PUT wrote one review + one audit row')

    // 1/2/3. Admin PUT → 403, zero new audit + zero new review rows.
    const auditBefore = auditCount(), reviewBefore = reviewCount()
    const adminPut = await req(server, 'PUT', `/api/discovery-reviews/${randomUUID()}`, {
      role: 'admin', body: { concept_ref: CONCEPT, review_action: 'captured', candidate_snapshot: SNAP, conversation_ref: '0:1' },
    })
    ok(adminPut.status === 403, '[1] admin PUT returns 403')
    ok(auditCount() - auditBefore === 0, '[2] admin PUT created ZERO audit rows')
    ok(reviewCount() - reviewBefore === 0, '[3] admin PUT created ZERO review rows')

    // 3b. Admin PUT targeting the OWNER's existing review id also writes nothing (no mutation).
    const adminMutate = await req(server, 'PUT', `/api/discovery-reviews/${ownerId}`, {
      role: 'admin', body: { concept_ref: CONCEPT, review_action: 'rejected', candidate_snapshot: SNAP, conversation_ref: '0:0' },
    })
    ok(adminMutate.status === 403, '[3b] admin PUT on an existing owner review → 403')
    ok(svc.getDiscoveryReviewById(db, 'venue_A', ownerId).review_action === 'captured',
      "[3b] owner's review is UNMUTATED by the admin attempt (still 'captured')")

    // 5. Admin GET list + by-id still succeed (read preserved).
    const adminList = await req(server, 'GET', `/api/discovery-reviews?concept_ref=${CONCEPT}`, { role: 'admin' })
    ok(adminList.status === 200 && Array.isArray(adminList.json.reviews) && adminList.json.reviews.length === 1,
      '[5] admin GET list succeeds and returns the owner-saved review')
    const adminById = await req(server, 'GET', `/api/discovery-reviews/${ownerId}`, { role: 'admin' })
    ok(adminById.status === 200 && adminById.json.ok, '[5] admin GET by-id succeeds')

    // Extra: non-owner role blocked at requireAuth; unauthenticated 401.
    const managerPut = await req(server, 'PUT', `/api/discovery-reviews/${randomUUID()}`, {
      role: 'manager', body: { concept_ref: CONCEPT, review_action: 'captured', candidate_snapshot: SNAP },
    })
    ok(managerPut.status === 403, '[extra] manager PUT is 403 (requireAuth gate)')
    const anonPut = await req(server, 'PUT', `/api/discovery-reviews/${randomUUID()}`, {
      body: { concept_ref: CONCEPT, review_action: 'captured', candidate_snapshot: SNAP },
    })
    ok(anonPut.status === 401, '[extra] unauthenticated PUT is 401')
  } catch (e) {
    failed++; console.error('  [FAIL] unexpected error:', e && e.message)
  } finally {
    console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
    // Exit cleanly WITHOUT process.exit(): forcing exit on Windows races in-flight handle
    // teardown (the libuv UV_HANDLE_CLOSING assertion). Set the code, close the handles, and
    // let the event loop drain on its own. undici's keep-alive timers are unref'd, so nothing
    // holds the loop open once the server + db are closed.
    process.exitCode = failed > 0 ? 1 : 0
    try { db.close() } catch { /* in-memory */ }
    server.close()
  }
})
