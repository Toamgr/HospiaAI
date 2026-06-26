#!/usr/bin/env node
/**
 * Service-level test for the Evidence Summary (Evidence Accumulation Engine — Slice 1).
 *
 *   summarizeDiscoveryEvidenceForVenue(db, venueId)
 *
 * No server boot, no HTTP, no AI, no network. Runs the REAL service against a REAL in-memory
 * node:sqlite db. Proves the read-only MEMORY MIRROR is honest and safe:
 *   • totals / action_mix / destinations / dna_earmarks derive correctly from saved reviews;
 *   • per-concept fold groups by concept_ref and NEVER merges two concept_refs;
 *   • confidence_floor is the LOWEST band present, never inflated by repetition;
 *   • venue isolation: venue A evidence never leaks into venue B;
 *   • record_space isolation: a directly-inserted 'live_venue' row is ignored;
 *   • empty/unknown venue → base shape, zero counts, honest limitations;
 *   • the summary creates ZERO review rows and ZERO audit events;
 *   • the serialized response carries NO forbidden truth/promotion vocabulary.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-discovery-evidence-summary.js
 */

import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import * as svc from '../src/services/venueIntelligence/discoveryCandidateReviewService.js'

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

console.log('\nEvidence Summary (EAE Slice 1) — service test\n')

const db = new DatabaseSync(':memory:')
db.exec(svc.DISCOVERY_CANDIDATE_REVIEWS_DDL)
db.exec(svc.DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL)

const reviewCount = () => db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_reviews').get().n
const auditCount = () => db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_review_events').get().n

// ── Seed via the REAL writer (concept_draft, server-hard-coded) ───────────────
const CONCEPT_A1 = randomUUID()
const CONCEPT_A2 = randomUUID()
const CONCEPT_B = randomUUID()
const snap = (band, dest) => ({
  signal: 'focus on elegance', evidence: 'e', confidence_band: band,
  dna_status_label: 'candidate only', suggested_destination: dest || 'Venue Memory',
})

// Venue A, concept 1: two reviews (captured + held), low + medium bands, one Venue DNA earmark.
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_A1, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('medium'), chosen_destination: 'Venue DNA', conversation_ref: '0:0' })
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_A1, { id: randomUUID(), review_action: 'held', candidate_snapshot: snap('low'), chosen_destination: 'Venue Memory', conversation_ref: '0:1' })
// Venue A, concept 2: one review (rejected), high band.
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_A2, { id: randomUUID(), review_action: 'rejected', candidate_snapshot: snap('high'), conversation_ref: '1:0' })
// Venue B: its own concept, must never appear under A.
svc.upsertDiscoveryReview(db, 'venue_B', CONCEPT_B, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('high', 'Venue DNA'), chosen_destination: 'Venue DNA', conversation_ref: '0:0' })

// record_space isolation: insert a 'live_venue' row for venue A DIRECTLY (bypassing the writer,
// which only ever writes 'concept_draft'). It must be ignored by the summary.
db.prepare(`
  INSERT INTO discovery_candidate_reviews
    (id, venue_id, concept_ref, record_space, candidate_snapshot_json, review_action, provenance)
  VALUES (?, 'venue_A', ?, 'live_venue', ?, 'captured', 'owner_conversation')
`).run(randomUUID(), randomUUID(), JSON.stringify(snap('high')))

// ── Summarize venue A ─────────────────────────────────────────────────────────
const reviewsBefore = reviewCount(), auditBefore = auditCount()
const a = svc.summarizeDiscoveryEvidenceForVenue(db, 'venue_A')

ok(a.scope === 'concept_draft', 'scope is concept_draft')
ok(a.memory_only === true, 'memory_only is true')
ok(a.totals.saved_reviews === 3, `totals.saved_reviews === 3 (got ${a.totals.saved_reviews}) — live_venue row excluded`)
ok(a.totals.concept_refs === 2, `totals.concept_refs === 2 (got ${a.totals.concept_refs})`)
ok(a.totals.dna_earmarks === 1, `totals.dna_earmarks === 1 (got ${a.totals.dna_earmarks})`)
ok(a.action_mix.captured === 1 && a.action_mix.held === 1 && a.action_mix.rejected === 1 && a.action_mix.edited === 0,
  'action_mix counts the four real fidelity actions')

// Destinations: Venue DNA (1, earmarked), Venue Memory (1), Unrouted (1).
const dnaDest = a.destinations.find(d => d.destination === 'Venue DNA')
ok(dnaDest && dnaDest.count === 1 && dnaDest.dna_earmarked === true, 'Venue DNA destination counted + flagged dna_earmarked')
ok(a.destinations.some(d => d.destination === 'Unrouted' && d.count === 1), 'null route grouped under Unrouted')

// Concept fold + no merge.
ok(a.concepts.length === 2, 'two distinct concepts (concept_refs never merged)')
const c1 = a.concepts.find(c => c.concept_ref === CONCEPT_A1)
ok(c1 && c1.saved_review_count === 2, 'concept A1 groups its two saved reviews')
ok(c1 && c1.dna_earmarked_count === 1, 'concept A1 dna_earmarked_count === 1')
// Confidence floor = lowest band present. A1 has medium+low → floor 'low'. Overall has low → 'low'.
ok(c1 && c1.confidence_floor === 'low', `concept A1 confidence_floor === 'low' (floor, not inflated) (got ${c1 && c1.confidence_floor})`)
ok(a.confidence_floor === 'low', `overall confidence_floor === 'low' (got ${a.confidence_floor})`)
const c2 = a.concepts.find(c => c.concept_ref === CONCEPT_A2)
ok(c2 && c2.confidence_floor === 'high', 'concept A2 confidence_floor === high (its only band)')

// ── Venue isolation ─────────────────────────────────────────────────────────
ok(!a.concepts.some(c => c.concept_ref === CONCEPT_B), 'venue B concept never appears under venue A')
const b = svc.summarizeDiscoveryEvidenceForVenue(db, 'venue_B')
ok(b.totals.saved_reviews === 1 && b.concepts.length === 1 && b.concepts[0].concept_ref === CONCEPT_B,
  'venue B sees only its own single concept')
ok(!b.concepts.some(c => c.concept_ref === CONCEPT_A1 || c.concept_ref === CONCEPT_A2),
  'venue A concepts never appear under venue B')

// ── Empty / unknown venue ─────────────────────────────────────────────────────
const empty = svc.summarizeDiscoveryEvidenceForVenue(db, 'venue_EMPTY')
ok(empty.totals.saved_reviews === 0 && empty.totals.concept_refs === 0 && empty.totals.dna_earmarks === 0,
  'empty venue → zero totals')
ok(Array.isArray(empty.concepts) && empty.concepts.length === 0, 'empty venue → no concepts')
ok(Array.isArray(empty.limitations) && empty.limitations.length >= 3, 'empty venue → honest limitations present')
ok(empty.confidence_floor === undefined, 'empty venue → no fabricated confidence_floor')
// Missing/blank venueId is also safe.
const blank = svc.summarizeDiscoveryEvidenceForVenue(db, '')
ok(blank.totals.saved_reviews === 0, 'blank venueId → zero totals (no throw)')

// ── Read-only: zero rows created, zero audit appended ─────────────────────────
ok(reviewCount() === reviewsBefore, 'summary created ZERO review rows')
ok(auditCount() === auditBefore, 'summary appended ZERO audit events')

// ── Forbidden truth/promotion vocabulary ───────────────────────────────────────
// The project's existing guardrail phrase "not confirmed Venue DNA" is permitted (it states a
// negative, creates no state). Strip it first, then scan for forbidden positive vocabulary.
const serialized = JSON.stringify([a, b, empty]).toLowerCase().replace(/not confirmed venue dna/g, '')
const FORBIDDEN = ['confirmed', 'approved', 'promoted', 'verified', 'truth score', 'readiness score', 'dna updated']
for (const word of FORBIDDEN) {
  ok(!serialized.includes(word), `summary contains no forbidden word: "${word}"`)
}

// ── No DNA-store / mergeVenueDna contact in the Evidence Summary code path ──────
// Scope the static check to the NEW function's region only. (The file's header comments
// deliberately NAME mergeVenueDna and the DNA stores to DECLARE they are never used — scanning
// the whole file would match that documentation, not real usage.)
const __dirname = dirname(fileURLToPath(import.meta.url))
const serviceSrc = readFileSync(resolve(__dirname, '..', 'src', 'services', 'venueIntelligence', 'discoveryCandidateReviewService.js'), 'utf8')
const fnStart = serviceSrc.indexOf('export function summarizeDiscoveryEvidenceForVenue')
ok(fnStart !== -1, 'summarizeDiscoveryEvidenceForVenue located in source')
const fnRegion = fnStart !== -1 ? serviceSrc.slice(fnStart) : ''
ok(!/mergeVenueDna/.test(fnRegion), 'evidence-summary function never references mergeVenueDna')
ok(!/venue_dna_json|venue_briefs|venue_dna_enrichment|venue_intelligence/.test(fnRegion),
  'evidence-summary function never references any canonical Venue DNA / venue_intelligence store')
ok(!/INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM/i.test(fnRegion),
  'evidence-summary function performs no INSERT/UPDATE/DELETE (read-only)')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
try { db.close() } catch { /* in-memory */ }
process.exit(failed > 0 ? 1 : 0)
