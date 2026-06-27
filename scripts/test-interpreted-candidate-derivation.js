#!/usr/bin/env node
/**
 * Service-level test for the Interpreted Intelligence Candidate derivation (EAE Slice 3B).
 *
 *   deriveInterpretedCandidatesForVenue(db, venueId)
 *
 * No server boot, no HTTP, no AI, no network. Runs the REAL service against a REAL in-memory
 * node:sqlite db. Proves the FIRST Intelligence layer is honest and safe:
 *   • every candidate is evidence-bound (non-empty supporting_evidence_refs → real review rows);
 *   • a split concept (kept AND rejected) yields a 'contradiction_signal' that PRESERVES both
 *     sides (supporting + conflicting refs) and is capped to 'low' confidence — never averaged;
 *   • a kept-only concept yields a 'missing_data_signal' that NEVER claims medium/high strength
 *     (independence wall: one concept = one thread; floor-only), with explicit missing_evidence;
 *   • a held review makes the candidate 'needs_owner_clarification';
 *   • concept_refs are NEVER merged (no cross-concept corroboration manufactured);
 *   • a rejected-only / held-only concept yields NO candidate;
 *   • venue isolation + record_space isolation (a 'live_venue' row is ignored);
 *   • empty/unknown venue → base shape, empty candidate list, honest limitations;
 *   • only allowed candidate_type / status vocabulary appears (confirmation is unexpressible);
 *   • the derivation creates ZERO review rows and ZERO audit events;
 *   • the serialized output carries NO forbidden truth/promotion vocabulary;
 *   • the derivation function's source touches no Venue DNA store and performs no write.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-interpreted-candidate-derivation.js
 */

import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import * as svc from '../src/services/venueIntelligence/discoveryCandidateReviewService.js'

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

console.log('\nInterpreted Intelligence Candidates (EAE Slice 3B) — service test\n')

const db = new DatabaseSync(':memory:')
db.exec(svc.DISCOVERY_CANDIDATE_REVIEWS_DDL)
db.exec(svc.DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL)

const reviewCount = () => db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_reviews').get().n
const auditCount = () => db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_review_events').get().n
const realReviewIds = () => new Set(db.prepare('SELECT id FROM discovery_candidate_reviews').all().map(r => r.id))

// ── Seed via the REAL writer (concept_draft, server-hard-coded) ───────────────
const CONCEPT_SINGLE = randomUUID()   // one kept review → missing_data, insufficient_evidence
const CONCEPT_MULTI = randomUUID()    // two kept reviews, one conversation → weak independence, still no strength
const CONCEPT_SPLIT = randomUUID()    // kept + rejected → contradiction_signal
const CONCEPT_HELD = randomUUID()     // kept + held → missing_data, needs_owner_clarification
const CONCEPT_REJECTED = randomUUID() // rejected-only → NO candidate
const CONCEPT_B = randomUUID()        // venue B isolation

const snap = (band, dest) => ({
  signal: 'focus on elegance', evidence: 'e', confidence_band: band,
  dna_status_label: 'candidate only', suggested_destination: dest || 'Venue Memory',
})

// Single kept review (high band, on its own) — must NOT become a high-confidence candidate.
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_SINGLE, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('high'), conversation_ref: '0:0' })

// Two kept reviews under the SAME conversation_ref — weak independence; never corroborated strength.
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_MULTI, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('high'), conversation_ref: '5:0' })
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_MULTI, { id: randomUUID(), review_action: 'edited', candidate_snapshot: snap('medium'), conversation_ref: '5:0' })

// Split concept: a kept (high) AND a rejected → contradiction, capped low, both sides preserved.
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_SPLIT, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('high'), conversation_ref: '7:0' })
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_SPLIT, { id: randomUUID(), review_action: 'rejected', candidate_snapshot: snap('high'), conversation_ref: '7:1' })

// Kept + held → missing_data, needs_owner_clarification.
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_HELD, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('medium'), conversation_ref: '8:0' })
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_HELD, { id: randomUUID(), review_action: 'held', candidate_snapshot: snap('low'), conversation_ref: '8:1' })

// Rejected-only → no kept meaning → NO candidate.
svc.upsertDiscoveryReview(db, 'venue_A', CONCEPT_REJECTED, { id: randomUUID(), review_action: 'rejected', candidate_snapshot: snap('high'), conversation_ref: '9:0' })

// Venue B: its own concept, must never appear under A.
svc.upsertDiscoveryReview(db, 'venue_B', CONCEPT_B, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('high'), conversation_ref: '0:0' })

// record_space isolation: a 'live_venue' row for venue A inserted DIRECTLY (the writer only ever
// writes 'concept_draft'). It must be ignored by the derivation.
db.prepare(`
  INSERT INTO discovery_candidate_reviews
    (id, venue_id, concept_ref, record_space, candidate_snapshot_json, review_action, provenance)
  VALUES (?, 'venue_A', ?, 'live_venue', ?, 'captured', 'owner_conversation')
`).run(randomUUID(), randomUUID(), JSON.stringify(snap('high')))

// ── Derive venue A ─────────────────────────────────────────────────────────────
const reviewsBefore = reviewCount(), auditBefore = auditCount()
const a = svc.deriveInterpretedCandidatesForVenue(db, 'venue_A')

ok(a.scope === 'concept_draft', 'scope is concept_draft')
ok(a.interpretation_only === true, 'interpretation_only is true')
ok(typeof a.derived_at === 'string' && a.derived_at.length > 0, 'derived_at timestamp present')
ok(Array.isArray(a.limitations) && a.limitations.length >= 4, 'honest limitations present')
ok(Array.isArray(a.candidates), 'candidates is an array')

const byConcept = (ref) => a.candidates.filter(c => c.concept_ref === ref)
const ids = realReviewIds()

// Every candidate is evidence-bound and points at REAL rows; vocabulary is constrained.
for (const c of a.candidates) {
  ok(svc.CANDIDATE_TYPES.includes(c.candidate_type), `candidate_type allowed: ${c.candidate_type}`)
  ok(svc.CANDIDATE_STATUSES.includes(c.status), `status allowed: ${c.status}`)
  ok(c.source_record_space === 'concept_draft', 'candidate source_record_space concept_draft')
  ok(Array.isArray(c.supporting_evidence_refs) && c.supporting_evidence_refs.length >= 1,
    `candidate has non-empty supporting_evidence_refs (${c.candidate_type})`)
  ok(c.supporting_evidence_refs.every(r => ids.has(r.review_id)),
    'every supporting ref points at a real saved review row')
  ok(Array.isArray(c.conflicting_evidence_refs), 'conflicting_evidence_refs always present (may be empty)')
  ok(c.confidence_band === null || ['low', 'medium', 'high'].includes(c.confidence_band),
    'confidence_band is a word band or null')
  // The independence wall: nothing in 3B may ever present corroborated medium/high strength.
  ok(c.confidence_band !== 'medium' && c.confidence_band !== 'high',
    `candidate never claims medium/high strength (got ${c.confidence_band})`)
  ok(c.destination_hint === null, 'destination_hint is inert (null) in 3B')
  ok(typeof c.suggested_owner_question === 'string' && c.suggested_owner_question.includes('?'),
    'candidate routes back to the owner with a question')
  ok(typeof c.created_from_summary_version === 'string' && c.created_from_summary_version.startsWith('derived-live@'),
    'candidate carries derive-live provenance')
}

// CONCEPT_SINGLE → missing_data, insufficient_evidence, no strength despite a 'high' snapshot.
{
  const cs = byConcept(CONCEPT_SINGLE)
  ok(cs.length === 1 && cs[0].candidate_type === 'missing_data_signal', 'single kept review → missing_data_signal')
  ok(cs[0] && cs[0].status === 'insufficient_evidence', 'single kept review → insufficient_evidence')
  ok(cs[0] && cs[0].confidence_band === null, 'single kept review → no inflated confidence (null)')
  ok(cs[0] && cs[0].missing_evidence.some(m => /saved once/i.test(m)), 'single kept review → "saved once" gap stated')
  ok(cs[0] && cs[0].conflicting_evidence_refs.length === 0, 'kept-only concept → empty conflicting refs')
}

// CONCEPT_MULTI → still missing_data; two same-conversation rows are NOT corroboration.
{
  const cm = byConcept(CONCEPT_MULTI)
  ok(cm.length === 1 && cm[0].candidate_type === 'missing_data_signal', 'two same-thread kept → missing_data_signal')
  ok(cm[0] && cm[0].confidence_band === null, 'two same-thread kept → never upgraded to a strength band')
  ok(cm[0] && cm[0].supporting_evidence_refs.length === 2, 'both kept rows cited as supporting evidence')
  ok(cm[0] && cm[0].missing_evidence.some(m => /single saved conversation|independence is weak/i.test(m)),
    'weak-independence gap stated explicitly')
}

// CONCEPT_SPLIT → contradiction_signal: both sides preserved, capped low, never averaged.
{
  const csp = byConcept(CONCEPT_SPLIT)
  ok(csp.length === 1 && csp[0].candidate_type === 'contradiction_signal', 'kept + rejected → contradiction_signal')
  ok(csp[0] && csp[0].status === 'contradicted', 'contradiction → status contradicted')
  ok(csp[0] && csp[0].supporting_evidence_refs.length === 1 && csp[0].conflicting_evidence_refs.length === 1,
    'contradiction preserves BOTH sides (1 supporting + 1 conflicting)')
  ok(csp[0] && csp[0].conflicting_evidence_refs.every(r => ids.has(r.review_id)),
    'conflicting refs point at real saved rows')
  ok(csp[0] && csp[0].confidence_band === 'low', 'contradiction caps confidence at low (high snapshot not honored)')
}

// CONCEPT_HELD → missing_data, needs_owner_clarification.
{
  const ch = byConcept(CONCEPT_HELD)
  ok(ch.length === 1 && ch[0].candidate_type === 'missing_data_signal', 'kept + held → missing_data_signal')
  ok(ch[0] && ch[0].status === 'needs_owner_clarification', 'held review → needs_owner_clarification')
  ok(ch[0] && ch[0].missing_evidence.some(m => /held/i.test(m)), 'held review surfaced in missing_evidence')
}

// CONCEPT_REJECTED → no kept meaning → NO candidate.
ok(byConcept(CONCEPT_REJECTED).length === 0, 'rejected-only concept → no candidate')

// No cross-concept merge: each emitting concept appears as its own candidate.
ok(byConcept(CONCEPT_SINGLE).length <= 1 && byConcept(CONCEPT_MULTI).length <= 1,
  'concept_refs are never merged into a single candidate')

// ── Venue isolation ─────────────────────────────────────────────────────────
ok(!a.candidates.some(c => c.concept_ref === CONCEPT_B), 'venue B concept never appears under venue A')
const b = svc.deriveInterpretedCandidatesForVenue(db, 'venue_B')
ok(b.candidates.every(c => c.concept_ref === CONCEPT_B), 'venue B sees only its own concept')
ok(!b.candidates.some(c => [CONCEPT_SINGLE, CONCEPT_MULTI, CONCEPT_SPLIT].includes(c.concept_ref)),
  'venue A concepts never appear under venue B')

// ── record_space isolation: the live_venue row produced no candidate ──────────
ok(a.candidates.length === byConcept(CONCEPT_SINGLE).length + byConcept(CONCEPT_MULTI).length
   + byConcept(CONCEPT_SPLIT).length + byConcept(CONCEPT_HELD).length,
  'only concept_draft concepts yield candidates (live_venue row ignored)')

// ── Empty / unknown venue ─────────────────────────────────────────────────────
const empty = svc.deriveInterpretedCandidatesForVenue(db, 'venue_EMPTY')
ok(empty.candidates.length === 0, 'empty venue → no candidates')
ok(Array.isArray(empty.limitations) && empty.limitations.length >= 4, 'empty venue → honest limitations present')
const blank = svc.deriveInterpretedCandidatesForVenue(db, '')
ok(blank.candidates.length === 0, 'blank venueId → no candidates (no throw)')

// ── Read-only: zero rows created, zero audit appended ─────────────────────────
ok(reviewCount() === reviewsBefore, 'derivation created ZERO review rows')
ok(auditCount() === auditBefore, 'derivation appended ZERO audit events')

// ── Forbidden truth/promotion vocabulary ───────────────────────────────────────
// The guardrail phrase "not confirmed Venue DNA" is permitted (a negative; creates no state).
// Strip it first, then scan for forbidden positive vocabulary.
const serialized = JSON.stringify([a, b, empty]).toLowerCase().replace(/not confirmed venue dna/g, '')
const FORBIDDEN = ['confirmed', 'approved', 'promoted', 'verified', 'canonical', 'dna-ready', 'dna_ready',
  'truth score', 'readiness score', 'readiness meter', 'dna updated']
for (const word of FORBIDDEN) {
  ok(!serialized.includes(word), `output contains no forbidden word: "${word}"`)
}
// No percentage value presented as confidence.
ok(!/[0-9]+\s*%/.test(JSON.stringify([a, b, empty])), 'output contains no percentage value')

// ── No DNA-store / Venue-DNA-merge contact in the derivation code path ──────────
// Scope the static check to the NEW function's region only (the file header comments deliberately
// reference the forbidden surfaces to DECLARE non-use; scanning the whole file would match docs).
const __dirname = dirname(fileURLToPath(import.meta.url))
const serviceSrc = readFileSync(resolve(__dirname, '..', 'src', 'services', 'venueIntelligence', 'discoveryCandidateReviewService.js'), 'utf8')
const fnStart = serviceSrc.indexOf('export function deriveInterpretedCandidatesForVenue')
ok(fnStart !== -1, 'deriveInterpretedCandidatesForVenue located in source')
const fnRegion = fnStart !== -1 ? serviceSrc.slice(fnStart) : ''
ok(!/mergeVenueDna/.test(fnRegion), 'derivation code never references the Venue DNA merge path')
ok(!/venue_dna_json|venue_briefs|venue_dna_enrichment|venue_intelligence/.test(fnRegion),
  'derivation code never references any canonical Venue DNA store')
ok(!/INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM/i.test(fnRegion),
  'derivation code performs no INSERT/UPDATE/DELETE (read-only)')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
try { db.close() } catch { /* in-memory */ }
process.exit(failed > 0 ? 1 : 0)
