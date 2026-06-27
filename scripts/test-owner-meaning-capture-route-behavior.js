#!/usr/bin/env node
/**
 * Behavioral (integration) test for the Owner Meaning Capture write route (Slice 4D):
 *   POST /api/owner-meaning-captures
 *
 * It mounts the REAL route handler (copied verbatim in shape from server.js, including the
 * explicit in-handler admin-write block and the server-side candidate re-derivation) on a minimal
 * express app, behind a requireAuth model that FAITHFULLY mirrors server.js requireAuth: 401
 * without a role, 403 for a role not in the allow-list, and the platform-admin GLOBAL BYPASS.
 * It runs against the REAL services (discovery derivation + owner meaning capture) and a REAL
 * in-memory node:sqlite db, over real HTTP. A real saved discovery review is seeded first so a
 * live interpreted candidate genuinely derives for the concept.
 *
 * Proves end-to-end:
 *   • owner POST succeeds (201) and writes one capture + one audit row;
 *   • admin POST → 403 and writes NOTHING (zero capture + zero audit rows);
 *   • manager / bar_manager → 403; unauthenticated → 401;
 *   • blank answer → 400, > 8000 → 400, missing/unknown concept_ref → 400 — each writes nothing;
 *   • the response exposes the owner's words but NO DNA / promotion / captured-meaning field;
 *   • captures are venue-scoped via req.venueId.
 *
 * The companion static audit (test-owner-meaning-capture-route-audit.js) separately proves
 * server.js itself contains the same admin guard before the sole writer and never touches DNA.
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-owner-meaning-capture-route-behavior.js
 */

import express from 'express'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import * as discovery from '../src/services/venueIntelligence/discoveryCandidateReviewService.js'
import * as omc from '../src/services/venueIntelligence/ownerMeaningCaptureService.js'

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

const db = new DatabaseSync(':memory:')
db.exec(discovery.DISCOVERY_CANDIDATE_REVIEWS_DDL)
db.exec(discovery.DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL)
db.exec(omc.OWNER_MEANING_CAPTURES_DDL)
db.exec(omc.OWNER_MEANING_CAPTURE_EVENTS_DDL)

const captureCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_captures').get().n
const auditCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_capture_events').get().n

// Seed a real saved discovery review so a live missing_data_signal candidate derives for CONCEPT.
const CONCEPT = randomUUID()
discovery.upsertDiscoveryReview(db, 'venue_A', CONCEPT, {
  id: randomUUID(), review_action: 'captured',
  candidate_snapshot: { signal: 'Intimate, low-lit cocktail focus', evidence: 'Owner described a candlelit room.', confidence_band: 'low', dna_status_label: 'candidate only', suggested_destination: 'Venue DNA' },
  conversation_ref: '1:0',
})

// Faithful model of server.js requireAuth: role from header, 401 if absent, admin bypasses the
// allow-list, others must be in it (else 403), req.venueId resolved per request.
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

app.post('/api/owner-meaning-captures', requireAuth('owner'), (req, res) => {
  try {
    // OWNER-ONLY — re-exclude the platform-admin bypass HERE, before any re-derivation or write.
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'Owner Meaning Capture is owner-only; admin is read-only here.' })
    }
    const body = req.body || {}
    const conceptRef = body.concept_ref
    const derivation = discovery.deriveInterpretedCandidatesForVenue(db, req.venueId)
    const candidate = (derivation.candidates || []).find((c) => c.concept_ref === conceptRef)
    if (!candidate) {
      return res.status(400).json({ ok: false, error: 'No live interpreted candidate for this concept — nothing was captured.' })
    }
    const capture = omc.createOwnerMeaningCapture(db, {
      venueId: req.venueId, conceptRef, ownerResponseRaw: body.owner_response_raw, candidate,
      createdBy: (req.user && (req.user.full_name || req.user.id)) || null,
    })
    res.status(201).json({ ok: true, capture, note: 'Saved as your words in Venue Memory. Venue DNA was not changed, and nothing was confirmed.' })
  } catch (err) {
    if (err && err.code === 'NOT_FOUND') return res.status(404).json({ ok: false, error: 'Not found.' })
    res.status(400).json({ error: err.message })
  }
})

function req(server, method, path, { role, body } = {}) {
  const { port } = server.address()
  const headers = { 'Content-Type': 'application/json', 'X-Venue': 'venue_A', Connection: 'close' }
  if (role) headers['X-Role'] = role
  return fetch(`http://127.0.0.1:${port}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  }).then(async r => ({ status: r.status, json: await r.json().catch(() => ({})) }))
}

const PATH = '/api/owner-meaning-captures'

const server = app.listen(0, async () => {
  console.log('\nOwner Meaning Capture route — behavioral (owner-only write) test\n')
  try {
    // [owner] success.
    const ownerPost = await req(server, 'POST', PATH, { role: 'owner', body: { concept_ref: CONCEPT, owner_response_raw: 'We host guests, not customers.' } })
    ok(ownerPost.status === 201 && ownerPost.json.ok, '[owner] POST succeeds (201)')
    ok(captureCount() === 1 && auditCount() === 1, '[owner] POST wrote one capture + one audit row')
    ok(ownerPost.json.capture && ownerPost.json.capture.owner_response_raw === 'We host guests, not customers.',
      '[owner] response returns the verbatim owner answer')
    ok(ownerPost.json.capture.status === 'owner_answer_captured' && ownerPost.json.capture.provenance === 'owner_response',
      '[owner] response carries server-set status + provenance')
    ok(/Venue DNA was not changed/i.test(ownerPost.json.note), '[owner] note states Venue DNA was not changed')
    // Response exposes NO DNA / promotion / captured-meaning field.
    const responseStr = JSON.stringify(ownerPost.json)
    for (const token of ['captured_owner_meaning', 'eligible_for_future_proposal', 'proposed_dna_change', 'dna_target', 'venue_dna_json', 'destination_hint']) {
      ok(!responseStr.includes(token), `[owner] response exposes no forbidden field: ${token}`)
    }

    // [admin] → 403, writes nothing.
    const capBefore = captureCount(), audBefore = auditCount()
    const adminPost = await req(server, 'POST', PATH, { role: 'admin', body: { concept_ref: CONCEPT, owner_response_raw: 'admin trying to write' } })
    ok(adminPost.status === 403, '[admin] POST returns 403')
    ok(captureCount() - capBefore === 0, '[admin] POST created ZERO capture rows')
    ok(auditCount() - audBefore === 0, '[admin] POST created ZERO audit rows')

    // [manager] / [bar_manager] → 403 at requireAuth.
    const mgr = await req(server, 'POST', PATH, { role: 'manager', body: { concept_ref: CONCEPT, owner_response_raw: 'x' } })
    ok(mgr.status === 403, '[manager] POST is 403')
    const barMgr = await req(server, 'POST', PATH, { role: 'bar_manager', body: { concept_ref: CONCEPT, owner_response_raw: 'x' } })
    ok(barMgr.status === 403, '[bar_manager] POST is 403')

    // [unauthenticated] → 401.
    const anon = await req(server, 'POST', PATH, { body: { concept_ref: CONCEPT, owner_response_raw: 'x' } })
    ok(anon.status === 401, '[anon] unauthenticated POST is 401')

    // [400] blank answer / over-limit / missing+unknown concept_ref — each writes nothing.
    const beforeBad = captureCount()
    const blank = await req(server, 'POST', PATH, { role: 'owner', body: { concept_ref: CONCEPT, owner_response_raw: '   \n  ' } })
    ok(blank.status === 400, '[400] blank owner_response_raw rejected')
    const over = await req(server, 'POST', PATH, { role: 'owner', body: { concept_ref: CONCEPT, owner_response_raw: 'x'.repeat(8001) } })
    ok(over.status === 400, '[400] over-limit (> 8000) owner_response_raw rejected')
    const missing = await req(server, 'POST', PATH, { role: 'owner', body: { owner_response_raw: 'no concept_ref' } })
    ok(missing.status === 400, '[400] missing concept_ref rejected (no candidate match)')
    const unknown = await req(server, 'POST', PATH, { role: 'owner', body: { concept_ref: randomUUID(), owner_response_raw: 'unknown concept' } })
    ok(unknown.status === 400, '[400] unknown concept_ref rejected (candidate does not derive)')
    ok(captureCount() - beforeBad === 0, '[400] none of the rejected requests wrote a capture row')

    // Venue scoping — the owner-saved capture is scoped to venue_A only.
    ok(omc.getOwnerMeaningCaptureById(db, 'venue_B', ownerPost.json.capture.id) === null,
      '[scoping] capture is not readable under another venue')
  } catch (e) {
    failed++; console.error('  [FAIL] unexpected error:', e && e.message)
  } finally {
    console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
    process.exitCode = failed > 0 ? 1 : 0
    try { db.close() } catch { /* in-memory */ }
    server.close()
  }
})
