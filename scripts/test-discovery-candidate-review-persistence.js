#!/usr/bin/env node
/**
 * Deterministic tests for New Venue Discovery — Fidelity Review Persistence (Slice 1).
 *
 * In-memory node:sqlite DatabaseSync(':memory:') + the exported DDL constants — no real DB,
 * no server boot, no network, no AI. Exits 0 on pass, 1 on failure.
 *
 * Covers (per the implementation scope §3.19 / prompt §D):
 *   • upsert idempotent on review.id (re-save converges; no duplicate row);
 *   • audit row written BEFORE the review row; a simulated review-upsert failure leaves an
 *     orphan audit event and NO un-audited state change;
 *   • review_action outside {captured,edited,held,rejected} throws; confirmed/approved/promoted rejected;
 *   • owner_edit.confidence_band above the snapshot rank rejected (never raised);
 *   • record_space always 'concept_draft' regardless of client input; 'live_venue' never written;
 *   • venue_id scoping: cross-venue read/write → not found, never a foreign write;
 *   • dna_earmarked set for the 'Venue DNA' route; the module imports nothing DNA-related (by ABSENCE);
 *   • DEFAULT_EVIDENCE stored verbatim, never upgraded;
 *   • snapshot immutable across subsequent action changes; snapshot_taken_at preserved.
 *
 * Run: node scripts/test-discovery-candidate-review-persistence.js
 */

import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SERVICE_REL = 'src/services/venueIntelligence/discoveryCandidateReviewService.js'

import('../' + SERVICE_REL)
  .then(runTests)
  .catch(err => { console.error('\n[FAIL] Could not import discoveryCandidateReviewService.js:', err.message); process.exit(1) })

function runTests(svc) {
  const {
    DISCOVERY_CANDIDATE_REVIEWS_DDL, DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL,
    REVIEW_ACTIONS, PROVENANCE, CONFIDENCE_BANDS, RECORD_SPACE, DEFAULT_EVIDENCE,
    normalizeDiscoveryReview, upsertDiscoveryReview, listDiscoveryReviewsForVenue,
    getDiscoveryReviewById, listDiscoveryReviewEvents,
  } = svc

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }
  function throws(fn) { try { fn(); return false } catch { return true } }

  console.log('\n\x1b[1mHESTIA Discovery Candidate Review Persistence — Deterministic Tests\x1b[0m\n')

  const VENUE_A = 'venue_A', VENUE_B = 'venue_B'
  const CONCEPT = randomUUID()

  function snapshot(overrides = {}) {
    return {
      signal: 'Intimate, low-lit cocktail focus',
      evidence: 'Owner described a candlelit room with a short, spirit-forward list.',
      confidence_band: 'medium',
      dna_status_label: 'candidate only',
      suggested_destination: 'Venue DNA',
      ...overrides,
    }
  }

  // ── Table + vocabularies ───────────────────────────────────────────────────
  section('Tables + vocabularies')
  const db = new DatabaseSync(':memory:')
  db.exec(DISCOVERY_CANDIDATE_REVIEWS_DDL)
  db.exec(DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL)
  assert('discovery_candidate_reviews table exists',
    !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='discovery_candidate_reviews'").get())
  assert('discovery_candidate_review_events table exists',
    !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='discovery_candidate_review_events'").get())
  assert('idempotent re-exec is safe', (() => { try { db.exec(DISCOVERY_CANDIDATE_REVIEWS_DDL); db.exec(DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL); return true } catch { return false } })())
  assert('REVIEW_ACTIONS = captured/edited/held/rejected (exactly four)',
    REVIEW_ACTIONS.length === 4 && ['captured', 'edited', 'held', 'rejected'].every(a => REVIEW_ACTIONS.includes(a)))
  assert("NO 'confirmed'/'approved'/'promoted' in the vocabulary",
    !REVIEW_ACTIONS.includes('confirmed') && !REVIEW_ACTIONS.includes('approved') && !REVIEW_ACTIONS.includes('promoted'))
  assert('PROVENANCE = owner_conversation/owner_edit', PROVENANCE.length === 2 && PROVENANCE.includes('owner_conversation') && PROVENANCE.includes('owner_edit'))
  assert('CONFIDENCE_BANDS = low/medium/high (band, never %)', CONFIDENCE_BANDS.join(',') === 'low,medium,high')
  assert("RECORD_SPACE is 'concept_draft'", RECORD_SPACE === 'concept_draft')

  // ── Create + read + JSON round-trip ─────────────────────────────────────────
  section('Create + read + round-trip')
  const id1 = randomUUID()
  const row1 = upsertDiscoveryReview(db, VENUE_A, CONCEPT, {
    id: id1, review_action: 'captured', chosen_destination: 'Venue DNA',
    candidate_snapshot: snapshot(), conversation_ref: '3:0', reviewed_by: 'owner@v',
  })
  assert('upsert returns the shaped row', !!row1 && row1.id === id1 && row1.venue_id === VENUE_A)
  assert('concept_ref stored', row1.concept_ref === CONCEPT)
  assert("record_space hard-coded 'concept_draft'", row1.record_space === 'concept_draft')
  assert('review_action persisted', row1.review_action === 'captured')
  assert('snapshot round-trips (parsed)', row1.candidate_snapshot && row1.candidate_snapshot.signal === 'Intimate, low-lit cocktail focus')
  assert('provenance server-set to owner_conversation (no overlay)', row1.provenance === 'owner_conversation')
  assert('snapshot_taken_at populated', typeof row1.snapshot_taken_at === 'string' && row1.snapshot_taken_at.length > 0)
  assert('audit event written for the create', listDiscoveryReviewEvents(db, VENUE_A, id1).length === 1)
  assert('first audit event: from_action null → to_action captured',
    (() => { const e = listDiscoveryReviewEvents(db, VENUE_A, id1)[0]; return e.from_action === null && e.to_action === 'captured' })())

  // ── 'Venue DNA' route is an INERT earmark ───────────────────────────────────
  section("'Venue DNA' route = inert earmark")
  assert('dna_earmarked set true for Venue DNA destination', row1.dna_earmarked === true)
  const idMem = randomUUID()
  const rowMem = upsertDiscoveryReview(db, VENUE_A, CONCEPT, {
    id: idMem, review_action: 'captured', chosen_destination: 'Venue Memory', candidate_snapshot: snapshot(), conversation_ref: '3:1',
  })
  assert('dna_earmarked false for non-DNA destination', rowMem.dna_earmarked === false)

  // ── Idempotent upsert on review.id ──────────────────────────────────────────
  section('Idempotent upsert on review.id')
  const before = listDiscoveryReviewsForVenue(db, VENUE_A, { concept_ref: CONCEPT }).length
  const row1b = upsertDiscoveryReview(db, VENUE_A, CONCEPT, {
    id: id1, review_action: 'held', candidate_snapshot: snapshot(), conversation_ref: '3:0',
  })
  const after = listDiscoveryReviewsForVenue(db, VENUE_A, { concept_ref: CONCEPT }).length
  assert('re-save converges (no duplicate row)', after === before && row1b.id === id1)
  assert('re-save updates the action', getDiscoveryReviewById(db, VENUE_A, id1).review_action === 'held')
  assert('re-save appends a second audit event', listDiscoveryReviewEvents(db, VENUE_A, id1).length === 2)
  assert('second audit event: captured → held',
    (() => { const e = listDiscoveryReviewEvents(db, VENUE_A, id1)[0]; return e.from_action === 'captured' && e.to_action === 'held' })())

  // ── Snapshot immutability ───────────────────────────────────────────────────
  section('Snapshot immutability')
  const origTaken = getDiscoveryReviewById(db, VENUE_A, id1).snapshot_taken_at
  upsertDiscoveryReview(db, VENUE_A, CONCEPT, {
    id: id1, review_action: 'rejected',
    candidate_snapshot: snapshot({ signal: 'TAMPERED — should never overwrite', evidence: 'tampered', confidence_band: 'high' }),
    conversation_ref: '3:0',
  })
  const afterTamper = getDiscoveryReviewById(db, VENUE_A, id1)
  assert('snapshot signal NOT rewritten on subsequent action', afterTamper.candidate_snapshot.signal === 'Intimate, low-lit cocktail focus')
  assert('snapshot_taken_at preserved across action changes', afterTamper.snapshot_taken_at === origTaken)
  assert('action still updates while snapshot frozen', afterTamper.review_action === 'rejected')

  // ── Vocabulary rejection ────────────────────────────────────────────────────
  section('Vocabulary rejection (confirmation impossible to express)')
  assert("review_action 'confirmed' throws", throws(() => upsertDiscoveryReview(db, VENUE_A, CONCEPT, { id: randomUUID(), review_action: 'confirmed', candidate_snapshot: snapshot(), conversation_ref: '9:0' })))
  assert("review_action 'approved' throws", throws(() => normalizeDiscoveryReview({ review_action: 'approved', candidate_snapshot: snapshot() }, VENUE_A)))
  assert("review_action 'promoted' throws", throws(() => normalizeDiscoveryReview({ review_action: 'promoted', candidate_snapshot: snapshot() }, VENUE_A)))
  assert('unknown review_action throws', throws(() => normalizeDiscoveryReview({ review_action: 'nope', candidate_snapshot: snapshot() }, VENUE_A)))
  assert('invalid chosen_destination throws', throws(() => normalizeDiscoveryReview({ review_action: 'captured', chosen_destination: 'Live Venue DNA', candidate_snapshot: snapshot() }, VENUE_A)))

  // ── concept_ref required + validated ────────────────────────────────────────
  section('concept_ref required + validated (never venue_id)')
  assert('missing concept_ref throws', throws(() => upsertDiscoveryReview(db, VENUE_A, null, { review_action: 'captured', candidate_snapshot: snapshot() })))
  assert('malformed (non-UUID) concept_ref throws', throws(() => upsertDiscoveryReview(db, VENUE_A, 'not-a-uuid', { review_action: 'captured', candidate_snapshot: snapshot() })))
  assert('venue_id is NOT accepted as concept_ref', throws(() => upsertDiscoveryReview(db, VENUE_A, VENUE_A, { review_action: 'captured', candidate_snapshot: snapshot() })))

  // ── Confidence may only be lowered ──────────────────────────────────────────
  section('Confidence floor (only lowered, never raised)')
  // snapshot band = medium; raising to high is rejected.
  assert('owner_edit raising confidence band → rejected',
    throws(() => normalizeDiscoveryReview({ review_action: 'edited', candidate_snapshot: snapshot({ confidence_band: 'medium' }), owner_edit: { confidence_band: 'high' } }, VENUE_A)))
  assert('owner_edit lowering confidence band → allowed',
    !throws(() => normalizeDiscoveryReview({ review_action: 'edited', candidate_snapshot: snapshot({ confidence_band: 'medium' }), owner_edit: { confidence_band: 'low' } }, VENUE_A)))
  // overlay presence sets provenance owner_edit server-side
  assert('overlay present → provenance owner_edit (server-set)',
    normalizeDiscoveryReview({ review_action: 'edited', candidate_snapshot: snapshot(), owner_edit: { signal: 'my words' } }, VENUE_A).provenance === 'owner_edit')
  // a client cannot raise via an update either (stored snapshot authoritative)
  const idEdit = randomUUID()
  upsertDiscoveryReview(db, VENUE_A, CONCEPT, { id: idEdit, review_action: 'captured', candidate_snapshot: snapshot({ confidence_band: 'low' }), conversation_ref: '4:0' })
  assert('update cannot raise confidence above the IMMUTABLE stored band',
    throws(() => upsertDiscoveryReview(db, VENUE_A, CONCEPT, { id: idEdit, review_action: 'edited', candidate_snapshot: snapshot({ confidence_band: 'high' }), owner_edit: { confidence_band: 'high' }, conversation_ref: '4:0' })))

  // ── record_space hard-coded ─────────────────────────────────────────────────
  section('record_space hard-coded (client cannot set live_venue)')
  const idRs = randomUUID()
  const rowRs = upsertDiscoveryReview(db, VENUE_A, CONCEPT, {
    id: idRs, review_action: 'captured', record_space: 'live_venue', candidate_snapshot: snapshot(), conversation_ref: '5:0',
  })
  assert("client record_space 'live_venue' ignored → stored 'concept_draft'", rowRs.record_space === 'concept_draft')
  assert("no 'live_venue' row exists in the table",
    db.prepare("SELECT COUNT(*) AS n FROM discovery_candidate_reviews WHERE record_space = 'live_venue'").get().n === 0)

  // ── DEFAULT_EVIDENCE verbatim ───────────────────────────────────────────────
  section('Conservative DEFAULT_EVIDENCE stored verbatim')
  const idDef = randomUUID()
  const rowDef = upsertDiscoveryReview(db, VENUE_A, CONCEPT, {
    id: idDef, review_action: 'captured', candidate_snapshot: snapshot({ evidence: DEFAULT_EVIDENCE }), conversation_ref: '6:0',
  })
  assert('DEFAULT_EVIDENCE stored verbatim (never upgraded)', rowDef.candidate_snapshot.evidence === DEFAULT_EVIDENCE)

  // ── Cross-venue isolation ───────────────────────────────────────────────────
  section('venue_id scoping (access boundary only)')
  assert('cross-venue read by id → null', getDiscoveryReviewById(db, VENUE_B, id1) === null)
  assert('venue B list is empty', listDiscoveryReviewsForVenue(db, VENUE_B, {}).length === 0)
  // A write under venue B reusing venue A's id is a FOREIGN id → rejected (code NOT_FOUND →
  // route 404), NEVER a foreign write.
  let foreignErr = null
  try { upsertDiscoveryReview(db, VENUE_B, CONCEPT, { id: id1, review_action: 'captured', candidate_snapshot: snapshot(), conversation_ref: '3:0' }) }
  catch (e) { foreignErr = e }
  assert('foreign id under venue B → throws NOT_FOUND', foreignErr && foreignErr.code === 'NOT_FOUND')
  assert("venue A's row for id1 is UNCHANGED by the foreign attempt", getDiscoveryReviewById(db, VENUE_A, id1).review_action === 'rejected')
  // Venue B can still keep its OWN reviews under a fresh id (isolated).
  const vbRow = upsertDiscoveryReview(db, VENUE_B, CONCEPT, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snapshot(), conversation_ref: '3:0' })
  assert('venue B owns its own review under a fresh id', vbRow.venue_id === VENUE_B)
  assert('venue A list unaffected by venue B write', listDiscoveryReviewsForVenue(db, VENUE_A, { concept_ref: CONCEPT }).every(r => r.id !== vbRow.id))

  // ── List scoping ────────────────────────────────────────────────────────────
  section('List scoping (concept_draft only)')
  const listA = listDiscoveryReviewsForVenue(db, VENUE_A, { concept_ref: CONCEPT })
  assert('list returns venue A concept rows', listA.length >= 1 && listA.every(r => r.concept_ref === CONCEPT))
  assert('list is compact (no full snapshot blob)', listA.every(r => !('candidate_snapshot' in r) && ('snapshot_signal' in r)))

  // ── Audit-first ordering under partial failure ──────────────────────────────
  section('Audit-first ordering (orphan audit on review-write failure)')
  const idFail = randomUUID()
  // Proxy db that allows the existence SELECT and the audit INSERT, but fails the review
  // INSERT/UPDATE — simulating step 3 failing after the audit (step 2) has landed.
  const failingDb = {
    prepare(sql) {
      if (/(INSERT\s+INTO|UPDATE)\s+discovery_candidate_reviews\b/i.test(sql)) {
        return { run() { throw new Error('simulated review-upsert failure') } }
      }
      return db.prepare(sql)
    },
  }
  const threwOnReview = throws(() => upsertDiscoveryReview(failingDb, VENUE_A, CONCEPT, {
    id: idFail, review_action: 'captured', candidate_snapshot: snapshot(), conversation_ref: '7:0',
  }))
  assert('review-write failure surfaces (throws)', threwOnReview)
  assert('orphan audit event WAS written (no un-audited state change)', listDiscoveryReviewEvents(db, VENUE_A, idFail).length === 1)
  assert('NO review row landed for the failed write', getDiscoveryReviewById(db, VENUE_A, idFail) === null)

  // ── Guardrails: isolation from Venue DNA (static) ───────────────────────────
  section('Guardrails (static) — zero Venue DNA contact')
  const src = readFileSync(resolve(ROOT, SERVICE_REL), 'utf8')
  assert('service makes no mergeVenueDna call', !/\bmergeVenueDna\s*\(/.test(src))
  assert('service imports nothing DNA-related',
    !src.split('\n').some(l => /^\s*import\b/.test(l) && /(mergeVenueDna|venue_dna_json|venue_briefs|venue_dna_enrichment|venue_intelligence)/.test(l)))
  assert('service never writes venue_intelligence/venue_briefs/venue_dna_enrichment',
    !/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment)\b/i.test(src))
  assert('service only writes discovery_candidate_review tables',
    (src.match(/(INSERT\s+INTO|UPDATE)\s+(\w+)/gi) || []).every(s => /discovery_candidate_review/i.test(s)))
  assert('service makes no AI/network calls', !/askGemini|fetch\(|openai|gemini/i.test(src))
  assert('no confirmation_ref COLUMN declared', !/confirmation_ref\s+TEXT/i.test(src))
  assert('service exports no promotion/confirm-to-DNA function',
    !/export\s+(function|const)\s+\w*([Pp]romot|[Cc]onfirm|[Tt]oVenueDna|[Aa]pplyToDna)/.test(src))

  // ── Results ──────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────')
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) { console.log(`\x1b[31m[FAIL] ${failed} test(s) failed — fix before committing.\x1b[0m\n`); process.exit(1) }
  console.log(`\x1b[32m[PASS] All tests passed.\x1b[0m\n`); process.exit(0)
}
