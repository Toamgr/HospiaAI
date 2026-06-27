#!/usr/bin/env node
/**
 * Behavioral (integration) test for the Owner Meaning Capture AUDIT READ routes (Slice 4D.2):
 *   GET /api/owner-meaning-captures            (paginated list)
 *   GET /api/owner-meaning-captures/:captureId (single + event trail)
 *
 * Mounts the REAL route handlers (copied verbatim in shape from server.js, including the explicit
 * in-handler admin-read block) on a minimal express app, behind a requireAuth model that
 * FAITHFULLY mirrors server.js requireAuth: 401 without a role, 403 for a role not in the
 * allow-list, and the platform-admin GLOBAL BYPASS. Runs against the REAL service + a REAL
 * in-memory node:sqlite db over real HTTP, with captures seeded through the real writer.
 *
 * Proves end-to-end:
 *   • owner can LIST captures (200, object with captures[] + pagination) and READ ONE (200);
 *   • admin → 403 on BOTH routes (zero read access this slice);
 *   • manager / bar_manager → 403; unauthenticated → 401;
 *   • invalid limit/offset handled safely (200, defaults); max limit enforced (clamped to 100);
 *   • a cross-venue capture id cannot be read (safe 404, never foreign leakage);
 *   • an unknown id → safe 404;
 *   • the read responses expose owner words + server context but NO captured/confirmed-meaning field;
 *   • GET routes never mutate (row + audit counts unchanged across the whole run).
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-owner-meaning-capture-read-route-behavior.js
 */

import express from 'express'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import * as omc from '../src/services/venueIntelligence/ownerMeaningCaptureService.js'

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

const db = new DatabaseSync(':memory:')
db.exec(omc.OWNER_MEANING_CAPTURES_DDL)
db.exec(omc.OWNER_MEANING_CAPTURE_EVENTS_DDL)

const capCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_captures').get().n
const audCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_capture_events').get().n

function candidate(venueId, concept) {
  return {
    candidate_id: randomUUID(), venue_id: venueId, source_record_space: 'concept_draft',
    concept_ref: concept, destination_hint: null,
    created_from_summary_version: 'derived-live@2026-06-27T00:00:00.000Z',
    candidate_type: 'missing_data_signal', status: 'insufficient_evidence',
    interpretation_title: 'Possible signal — evidence not yet sufficient', interpretation_summary: 'Saved meaning kept.',
    supporting_evidence_refs: [{ review_id: randomUUID(), concept_ref: concept, review_action: 'captured', confidence_band: null }],
    conflicting_evidence_refs: [], missing_evidence: ['No corroboration yet.'], uncertainty_notes: ['Suspicion only.'],
    confidence_band: null, suggested_owner_question: 'Does this belong to the venue identity?',
  }
}
function seed(venueId, response) {
  const concept = randomUUID()
  return omc.createOwnerMeaningCapture(db, { venueId, conceptRef: concept, ownerResponseRaw: response, candidate: candidate(venueId, concept), createdBy: 'Tal Millo' })
}

// Seed: 2 captures in venue_A, 1 in venue_B.
const a1 = seed('venue_A', 'We host guests, not customers.')
const a2 = seed('venue_A', 'The room is candlelit on purpose.')
const b1 = seed('venue_B', 'Venue B private — must never leak to A.')
const seededCapBaseline = capCount(), seededAudBaseline = audCount()

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
app.get('/api/owner-meaning-captures', requireAuth('owner'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'Owner Meaning Capture is owner-only; admin has no read access here.' })
    }
    const result = omc.listOwnerMeaningCaptures(db, req.venueId, {
      limit: req.query.limit, offset: req.query.offset, candidateFingerprint: req.query.candidate_fingerprint,
    })
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message })
  }
})

// ── Verbatim-shape GET one handler ───────────────────────────────────────────
app.get('/api/owner-meaning-captures/:captureId', requireAuth('owner'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'Owner Meaning Capture is owner-only; admin has no read access here.' })
    }
    const capture = omc.getOwnerMeaningCaptureById(db, req.venueId, req.params.captureId)
    if (!capture) return res.status(404).json({ ok: false, error: 'No owner meaning capture found for this venue.' })
    const events = omc.listOwnerMeaningCaptureEvents(db, req.venueId, req.params.captureId)
    res.json({ ok: true, capture, events })
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message })
  }
})

function call(server, path, { role, venue = 'venue_A' } = {}) {
  const { port } = server.address()
  const headers = { 'Content-Type': 'application/json', Connection: 'close' }
  if (role) headers['X-Role'] = role
  if (venue) headers['X-Venue'] = venue
  return fetch(`http://127.0.0.1:${port}${path}`, { method: 'GET', headers }).then(async r => ({ status: r.status, json: await r.json().catch(() => ({})) }))
}

const LIST = '/api/owner-meaning-captures'

const server = app.listen(0, async () => {
  console.log('\nOwner Meaning Capture READ routes — behavioral (owner-only read) test\n')
  try {
    // [owner] list.
    const ownerList = await call(server, LIST, { role: 'owner', venue: 'venue_A' })
    ok(ownerList.status === 200 && ownerList.json.ok, '[owner] GET list → 200')
    ok(Array.isArray(ownerList.json.captures) && ownerList.json.pagination, '[owner] list returns object with captures[] + pagination')
    ok(ownerList.json.captures.length === 2, '[owner] venue_A list has exactly 2 captures')
    ok(ownerList.json.captures[0].id === a2.id && ownerList.json.captures[1].id === a1.id, '[owner] list is newest-first')
    ok(!ownerList.json.captures.some(c => c.id === b1.id), '[owner] venue_A list does NOT leak venue_B capture')

    // [owner] read one + events.
    const ownerOne = await call(server, `${LIST}/${a1.id}`, { role: 'owner', venue: 'venue_A' })
    ok(ownerOne.status === 200 && ownerOne.json.ok, '[owner] GET one → 200')
    ok(ownerOne.json.capture && ownerOne.json.capture.id === a1.id, '[owner] returns the correct capture')
    ok(Array.isArray(ownerOne.json.events) && ownerOne.json.events.length === 1, '[owner] returns the event trail')
    ok(ownerOne.json.capture.owner_response_raw === 'We host guests, not customers.', '[owner] owner_response_raw returned verbatim')

    // [admin] blocked on BOTH routes.
    const adminList = await call(server, LIST, { role: 'admin' })
    ok(adminList.status === 403, '[admin] GET list → 403 (no read access this slice)')
    const adminOne = await call(server, `${LIST}/${a1.id}`, { role: 'admin' })
    ok(adminOne.status === 403, '[admin] GET one → 403')

    // [manager] / [bar_manager] / [non-owner] blocked.
    ok((await call(server, LIST, { role: 'manager' })).status === 403, '[manager] GET list → 403')
    ok((await call(server, LIST, { role: 'bar_manager' })).status === 403, '[bar_manager] GET list → 403')
    ok((await call(server, `${LIST}/${a1.id}`, { role: 'chef' })).status === 403, '[chef] GET one → 403')

    // [unauthenticated] → 401.
    ok((await call(server, LIST, {})).status === 401, '[anon] GET list → 401')
    ok((await call(server, `${LIST}/${a1.id}`, {})).status === 401, '[anon] GET one → 401')

    // Invalid limit/offset handled safely; max enforced.
    const bad = await call(server, `${LIST}?limit=abc&offset=-9`, { role: 'owner', venue: 'venue_A' })
    ok(bad.status === 200 && bad.json.pagination.limit === omc.OWNER_MEANING_LIST_DEFAULT_LIMIT && bad.json.pagination.offset === 0,
      '[safe] invalid limit/offset fall back to defaults (200)')
    const max = await call(server, `${LIST}?limit=9999`, { role: 'owner', venue: 'venue_A' })
    ok(max.status === 200 && max.json.pagination.limit === omc.OWNER_MEANING_LIST_MAX_LIMIT, '[safe] max limit enforced (clamped to 100)')

    // Cross-venue capture cannot be read (owner of venue_B asking for venue_A's id).
    const cross = await call(server, `${LIST}/${a1.id}`, { role: 'owner', venue: 'venue_B' })
    ok(cross.status === 404, '[scoping] cross-venue capture id → 404 (no foreign leakage)')

    // Unknown id → safe 404.
    const unknown = await call(server, `${LIST}/${randomUUID()}`, { role: 'owner', venue: 'venue_A' })
    ok(unknown.status === 404, '[404] unknown capture id → 404')

    // Read responses expose no captured/confirmed-meaning field.
    const blob = JSON.stringify(ownerList.json) + JSON.stringify(ownerOne.json)
    for (const token of ['captured_owner_meaning', 'eligible_for_future_proposal', 'proposed_dna_change', 'dna_target', 'confirmed_meaning']) {
      ok(!blob.includes(token), `[isolation] read response exposes no forbidden field: ${token}`)
    }

    // GET routes never mutated anything across the whole run.
    ok(capCount() === seededCapBaseline, '[read-only] capture row count unchanged by GET traffic')
    ok(audCount() === seededAudBaseline, '[read-only] audit row count unchanged by GET traffic')
  } catch (e) {
    failed++; console.error('  [FAIL] unexpected error:', e && e.message)
  } finally {
    console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
    process.exitCode = failed > 0 ? 1 : 0
    try { db.close() } catch { /* in-memory */ }
    server.close()
  }
})
