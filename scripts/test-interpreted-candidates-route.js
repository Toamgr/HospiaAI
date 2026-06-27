#!/usr/bin/env node
/**
 * Behavioral (integration) test for the Interpreted Intelligence Candidates (EAE Slice 3C)
 * READ-ONLY route:
 *   GET /api/discovery-interpreted-candidates
 *
 * Mounts the real route handler shape on a minimal express app, behind a requireAuth model that
 * faithfully mirrors server.js (401 without a role, 403 for a role not in the allow-list, admin
 * global bypass). Runs against the REAL Slice 3B service and a REAL in-memory node:sqlite db over
 * real HTTP. Proves end-to-end:
 *   • owner + admin GET succeed; manager/employee are 403; unauthenticated is 401;
 *   • venue scoping uses req.venueId; cross-venue isolation (venue B never sees venue A);
 *   • the route returns the derivation service output (candidates + careful note + limitations);
 *   • empty venue → 200 ok:true, zero candidates, honest limitations, no fabricated data;
 *   • only the service's two candidate types appear; no themed classification leaks in;
 *   • confidence is only low/null (never medium/high/score/percentage);
 *   • destination_hint stays inert null;
 *   • this is GET-ONLY — admin has NO write path; PUT/POST/PATCH/DELETE → 404 from express;
 *   • the read mutates nothing (review + audit row counts unchanged);
 *   • the JSON response carries no forbidden confirmation/promotion vocabulary.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-interpreted-candidates-route.js
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
app.get('/api/discovery-interpreted-candidates', requireAuth('owner', 'admin'), (req, res) => {
  try {
    const result = svc.deriveInterpretedCandidatesForVenue(db, req.venueId)
    res.json({
      ok: true,
      candidates: result.candidates,
      note: 'Interpreted candidates are evidence-bound signals only. They are not confirmed Venue DNA. HESTIA cannot self-confirm its own interpretation; contradictions and missing data are preserved, never resolved here.',
      limitations: result.limitations,
    })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ── Seed via the REAL writer (concept_draft, server-hard-coded) ───────────────
const CONCEPT_SPLIT = randomUUID()   // kept + rejected → contradiction_signal
const CONCEPT_SINGLE = randomUUID()  // one kept review → missing_data_signal
const CONCEPT_B = randomUUID()       // venue B isolation
const snap = (band) => ({ signal: 'focus on elegance', evidence: 'e', confidence_band: band, dna_status_label: 'candidate only', suggested_destination: 'Venue Memory' })

svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_SPLIT, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('high'), conversation_ref: '0:0' })
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_SPLIT, { id: randomUUID(), review_action: 'rejected', candidate_snapshot: snap('high'), conversation_ref: '0:1' })
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_SINGLE, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('high'), conversation_ref: '1:0' })
svc.upsertDiscoveryReview(db, 'venue_B', CONCEPT_B, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('high'), conversation_ref: '0:0' })

// record_space isolation: a 'live_venue' row for venue A inserted DIRECTLY (must be ignored).
db.prepare(`
  INSERT INTO discovery_candidate_reviews
    (id, venue_id, concept_ref, record_space, candidate_snapshot_json, review_action, provenance)
  VALUES (?, 'venue_A', ?, 'live_venue', ?, 'captured', 'owner_conversation')
`).run(randomUUID(), randomUUID(), JSON.stringify(snap('high')))

function req(server, method, path, { role, venue = 'venue_A', body } = {}) {
  const { port } = server.address()
  const headers = { 'Content-Type': 'application/json', 'X-Venue': venue, Connection: 'close' }
  if (role) headers['X-Role'] = role
  return fetch(`http://127.0.0.1:${port}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  }).then(async r => ({ status: r.status, json: await r.json().catch(() => ({})) }))
}

const PATH = '/api/discovery-interpreted-candidates'

const server = app.listen(0, async () => {
  console.log('\nInterpreted Intelligence Candidates (EAE Slice 3C) route — behavioral (read-only) test\n')
  try {
    const reviewsBefore = reviewCount(), auditBefore = auditCount()

    // ── Auth matrix ──────────────────────────────────────────────────────────
    const anon = await req(server, 'GET', PATH, {})
    ok(anon.status === 401, '[anon] GET is 401')
    const owner = await req(server, 'GET', PATH, { role: 'owner' })
    ok(owner.status === 200 && owner.json.ok === true && Array.isArray(owner.json.candidates),
      '[owner] GET succeeds (200, ok:true, candidates array)')
    const admin = await req(server, 'GET', PATH, { role: 'admin' })
    ok(admin.status === 200 && admin.json.ok === true, '[admin] GET succeeds (read)')
    const manager = await req(server, 'GET', PATH, { role: 'manager' })
    ok(manager.status === 403, '[manager] GET is 403')
    const employee = await req(server, 'GET', PATH, { role: 'employee' })
    ok(employee.status === 403, '[employee] GET is 403')

    // ── Returns the derivation service output ──────────────────────────────────
    const direct = svc.deriveInterpretedCandidatesForVenue(db, 'venue_A')
    ok(owner.json.candidates.length === direct.candidates.length,
      `[parity] route returns the service candidate set (got ${owner.json.candidates.length}, service ${direct.candidates.length})`)
    ok(owner.json.candidates.length === 2, '[content] venue A yields 2 candidates (split + single; live_venue ignored)')

    const split = owner.json.candidates.find(c => c.concept_ref === CONCEPT_SPLIT)
    const single = owner.json.candidates.find(c => c.concept_ref === CONCEPT_SINGLE)
    ok(split && split.candidate_type === 'contradiction_signal', '[content] split concept → contradiction_signal')
    ok(split && split.confidence_band === 'low', '[content] contradiction confidence capped at low')
    ok(split && split.conflicting_evidence_refs.length >= 1, '[content] contradiction preserves the conflicting side')
    ok(single && single.candidate_type === 'missing_data_signal', '[content] single kept review → missing_data_signal')
    ok(single && single.confidence_band === null, '[content] missing_data confidence is null (no inflation)')

    // Only the two service candidate types appear; destination_hint inert; only low/null bands.
    for (const c of owner.json.candidates) {
      ok(['contradiction_signal', 'missing_data_signal'].includes(c.candidate_type),
        `[scope] no candidate type beyond service output (got ${c.candidate_type})`)
      ok(c.destination_hint === null, '[scope] destination_hint stays inert null')
      ok(c.confidence_band === null || c.confidence_band === 'low',
        `[scope] confidence is only low/null (got ${c.confidence_band})`)
      ok(Array.isArray(c.supporting_evidence_refs) && c.supporting_evidence_refs.length >= 1,
        '[evidence] candidate is evidence-bound (non-empty supporting refs)')
    }

    // ── Careful note + limitations present and on-message ──────────────────────
    ok(typeof owner.json.note === 'string' &&
      /evidence-bound/i.test(owner.json.note) &&
      /not confirmed venue dna/i.test(owner.json.note) &&
      /self-confirm/i.test(owner.json.note) &&
      /contradiction/i.test(owner.json.note) &&
      /missing data/i.test(owner.json.note),
      '[copy] note states evidence-bound, not confirmed Venue DNA, cannot self-confirm, contradictions + missing data preserved')
    ok(Array.isArray(owner.json.limitations) && owner.json.limitations.length >= 4,
      '[copy] limitations array present')

    // ── Venue scoping / cross-venue isolation ──────────────────────────────────
    const venueB = await req(server, 'GET', PATH, { role: 'owner', venue: 'venue_B' })
    ok(venueB.status === 200 && venueB.json.candidates.every(c => c.concept_ref === CONCEPT_B),
      '[isolation] venue B sees only its own concept')
    ok(!venueB.json.candidates.some(c => c.concept_ref === CONCEPT_SPLIT || c.concept_ref === CONCEPT_SINGLE),
      '[isolation] venue A concepts never appear under venue B')

    // ── Empty venue → honest, no fabricated data ───────────────────────────────
    const emptyV = await req(server, 'GET', PATH, { role: 'owner', venue: 'venue_EMPTY' })
    ok(emptyV.status === 200 && emptyV.json.ok === true, '[empty] GET succeeds 200 ok:true')
    ok(Array.isArray(emptyV.json.candidates) && emptyV.json.candidates.length === 0, '[empty] zero candidates (no fabrication)')
    ok(Array.isArray(emptyV.json.limitations) && emptyV.json.limitations.length >= 4, '[empty] honest limitations present')

    // ── GET-ONLY — admin has NO write path. Any mutating verb → 404. ───────────
    for (const m of ['PUT', 'POST', 'PATCH', 'DELETE']) {
      const attempt = await req(server, m, PATH, { role: 'admin', body: { x: 1 } })
      ok(attempt.status === 404, `[read-only] ${m} on the route → 404 (no such route; admin has no write path)`)
    }

    // ── The reads mutated nothing ──────────────────────────────────────────────
    ok(reviewCount() === reviewsBefore, '[read-only] no review rows created by reads')
    ok(auditCount() === auditBefore, '[read-only] no audit rows created by reads')

    // ── Forbidden confirmation/promotion vocabulary + no scores/percentages ────
    // The guardrail phrase "not confirmed Venue DNA" is permitted (a negative; creates no state).
    const serialized = JSON.stringify([owner.json, admin.json, venueB.json, emptyV.json]).toLowerCase().replace(/not confirmed venue dna/g, '')
    const FORBIDDEN = ['confirmed', 'approved', 'canonical', 'promoted', 'verified', 'dna-ready', 'dna_ready',
      'truth score', 'readiness score', 'readiness meter', 'dna updated']
    for (const word of FORBIDDEN) {
      ok(!serialized.includes(word), `[copy] response contains no forbidden word: "${word}"`)
    }
    ok(!/[0-9]+\s*%/.test(JSON.stringify([owner.json, venueB.json, emptyV.json])), '[copy] response contains no percentage value')
  } catch (e) {
    failed++; console.error('  [FAIL] unexpected error:', e && e.message)
  } finally {
    console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
    process.exitCode = failed > 0 ? 1 : 0
    try { db.close() } catch { /* in-memory */ }
    server.close()
  }
})
