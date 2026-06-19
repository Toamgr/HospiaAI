#!/usr/bin/env node
/**
 * Deterministic tests for the F&B → Venue Intelligence feedback candidate
 * foundation (Phase 6A — isolated candidates, no live writes, no Venue DNA).
 *
 * In-memory node:sqlite DatabaseSync(':memory:') + the exported DDL — no real DB,
 * no server boot, no network, no AI. Exits 0 on pass, 1 on failure.
 *
 * Run: node scripts/test-fnb-venue-feedback.js   (or: npm run test:fnb-feedback)
 */

import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

import('../src/services/venueBridge/fnbVenueFeedbackService.js')
  .then(runTests)
  .catch(err => { console.error('\n[FAIL] Could not import fnbVenueFeedbackService.js:', err.message); process.exit(1) })

function runTests(svc) {
  const {
    VENUE_INTELLIGENCE_CANDIDATES_DDL, CANDIDATE_TYPES, CANDIDATE_STATUSES, HUMAN_REVIEW_STATUSES,
    deriveFnbVenueCandidatesFromDecision, scoreFnbCandidateEvidence, normalizeFnbCandidate,
    createVenueIntelligenceCandidate, getVenueIntelligenceCandidateById, listVenueIntelligenceCandidatesForVenue,
    safeRecordVenueIntelligenceCandidates, markVenueIntelligenceCandidateReviewed,
    REVIEW_ACTION_STATUSES,
  } = svc

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }
  function throws(fn) { try { fn(); return false } catch { return true } }

  console.log('\n\x1b[1mHESTIA F&B → Venue Intelligence Candidates — Deterministic Tests\x1b[0m\n')

  const VENUE_A = 'venue_A', VENUE_B = 'venue_B'

  // ── Table + vocabularies ───────────────────────────────────────────────────
  section('Table creation + vocabularies')
  const db = new DatabaseSync(':memory:')
  db.exec(VENUE_INTELLIGENCE_CANDIDATES_DDL)
  const tbl = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='venue_intelligence_candidates'").get()
  assert('venue_intelligence_candidates table exists', !!tbl)
  assert('idempotent re-exec is safe', (() => { try { db.exec(VENUE_INTELLIGENCE_CANDIDATES_DDL); return true } catch { return false } })())
  assert('active candidate types present', ['taste_direction_signal', 'operational_constraint_signal'].every(t => CANDIDATE_TYPES.includes(t)))
  assert('statuses present', ['candidate', 'superseded', 'archived'].every(s => CANDIDATE_STATUSES.includes(s)))
  assert('review statuses present', ['unreviewed', 'accepted', 'rejected', 'needs_changes'].every(s => HUMAN_REVIEW_STATUSES.includes(s)))

  // ── Conservative derivation ────────────────────────────────────────────────
  section('Conservative derivation rules')
  assert('cocktail_menu_generated → NO candidate (circular)',
    deriveFnbVenueCandidatesFromDecision({ id: 'd1', decision_type: 'cocktail_menu_generated', taste_profile_target: { acidity: { min: 2, max: 4 } } }).length === 0)
  assert('cocktail_selected → NO candidate in 6A',
    deriveFnbVenueCandidatesFromDecision({ id: 'd2', decision_type: 'cocktail_selected', recipe_snapshot: { name: 'X' } }).length === 0)
  assert('cocktail_rejected WITHOUT explicit reason → NO candidate',
    deriveFnbVenueCandidatesFromDecision({ id: 'd3', decision_type: 'cocktail_rejected', decision_payload: {} }).length === 0)
  assert('rejected with non-mapped reason → NO candidate',
    deriveFnbVenueCandidatesFromDecision({ id: 'd3b', decision_type: 'cocktail_rejected', decision_payload: { reasons: ['just_experimenting'] } }).length === 0)
  assert('empty/null decision → NO candidate (no crash)',
    deriveFnbVenueCandidatesFromDecision(null).length === 0 && deriveFnbVenueCandidatesFromDecision({}).length === 0)

  const tasteC = deriveFnbVenueCandidatesFromDecision({
    id: 'd4', decision_type: 'cocktail_rejected',
    subject_ref: { cocktail_name: 'Too Sweet Sour' },
    decision_payload: { reasons: ['too_sweet'], base_spirit: 'rum' },
  })
  assert('explicit taste reason → taste_direction_signal', tasteC.length === 1 && tasteC[0].candidate_type === 'taste_direction_signal')
  assert('derived taste candidate carries source_decision_id', tasteC[0].source_decision_id === 'd4')
  assert('derived taste candidate confidence is low (single event)', tasteC[0].confidence.level === 'low')
  assert('derived taste candidate confidence NEVER high', tasteC[0].confidence.level !== 'high')
  assert('derived taste candidate evidence cites the reason', tasteC[0].evidence[0].reason === 'too_sweet')

  const opsC = deriveFnbVenueCandidatesFromDecision({
    id: 'd5', decision_type: 'cocktail_rejected',
    decision_payload: { reasons: ['too_complex'] },
  })
  assert('explicit operational reason → operational_constraint_signal', opsC.length === 1 && opsC[0].candidate_type === 'operational_constraint_signal')

  // multiple reasons → at most one per type, no duplicates
  const multiC = deriveFnbVenueCandidatesFromDecision({
    id: 'd6', decision_type: 'cocktail_rejected',
    decision_payload: { reasons: ['too_sweet', 'too_bitter', 'too_complex'] },
  })
  assert('multiple reasons → one candidate per type', multiC.length === 2 && new Set(multiC.map(c => c.candidate_type)).size === 2)

  // never derives reserved/excluded types
  assert('never derives guest_preference_signal', ![...tasteC, ...opsC, ...multiC].some(c => c.candidate_type === 'guest_preference_signal'))
  assert('never derives pricing_sensitivity_signal', ![...tasteC, ...opsC, ...multiC].some(c => c.candidate_type === 'pricing_sensitivity_signal'))
  assert('never derives venue_identity_signal', ![...tasteC, ...opsC, ...multiC].some(c => c.candidate_type === 'venue_identity_signal'))

  // scoring: corroboration raises to medium, never high
  assert('scoreFnbCandidateEvidence single → low', scoreFnbCandidateEvidence({ _corroboration: 1 }).level === 'low')
  assert('scoreFnbCandidateEvidence corroborated → medium', scoreFnbCandidateEvidence({ _corroboration: 3 }).level === 'medium')
  assert('scoreFnbCandidateEvidence never high', scoreFnbCandidateEvidence({ _corroboration: 99 }).level !== 'high')

  // ── Create + read + round-trip ─────────────────────────────────────────────
  section('Create + read + JSON round-trip')
  const created = createVenueIntelligenceCandidate(db, VENUE_A, tasteC[0])
  assert('create returns ok + id', created.ok && typeof created.id === 'string')
  const row = getVenueIntelligenceCandidateById(db, VENUE_A, created.id)
  assert('read by id (venue-scoped)', !!row && row.venue_id === VENUE_A)
  assert('status defaults to candidate', row.status === 'candidate')
  assert('human_review_status defaults to unreviewed', row.human_review_status === 'unreviewed')
  assert('source_domain = fnb', row.source_domain === 'fnb')
  assert('payload round-trips', row.candidate_payload.reason === 'too_sweet')
  assert('evidence round-trips', row.evidence[0].source === 'rejection_history')
  assert('confidence round-trips (low)', row.confidence.level === 'low')
  assert('created_at populated by DB default', isNonEmpty(row.created_at))

  // ── No fake defaults ───────────────────────────────────────────────────────
  section('No fake defaults')
  const minimal = normalizeFnbCandidate({ candidate_type: 'taste_direction_signal' }, VENUE_A)
  assert('absent payload stays null', minimal.candidate_payload_json === null)
  assert('absent evidence stays null', minimal.evidence_json === null)
  assert('absent source_decision_id stays null', minimal.source_decision_id === null)
  assert('absent reviewed_by/at stay null', minimal.reviewed_by === null && minimal.reviewed_at === null)

  // ── Validation ─────────────────────────────────────────────────────────────
  section('Validation')
  assert('missing venueId rejected', throws(() => normalizeFnbCandidate({ candidate_type: 'taste_direction_signal' }, '')))
  assert('invalid candidate_type rejected', throws(() => normalizeFnbCandidate({ candidate_type: 'nope' }, VENUE_A)))
  assert('invalid status rejected', throws(() => normalizeFnbCandidate({ candidate_type: 'taste_direction_signal', status: 'nope' }, VENUE_A)))
  assert('invalid human_review_status rejected', throws(() => normalizeFnbCandidate({ candidate_type: 'taste_direction_signal', human_review_status: 'nope' }, VENUE_A)))
  assert("confidence 'high' is downgraded, never persisted",
    JSON.parse(normalizeFnbCandidate({ candidate_type: 'taste_direction_signal', confidence: { level: 'high' } }, VENUE_A).confidence_json).level === 'low')
  assert('createVenueIntelligenceCandidate rejects invalid type', throws(() => createVenueIntelligenceCandidate(db, VENUE_A, { candidate_type: 'nope' })))

  // ── Filters ────────────────────────────────────────────────────────────────
  section('Listing + filters')
  createVenueIntelligenceCandidate(db, VENUE_A, opsC[0])
  const all = listVenueIntelligenceCandidatesForVenue(db, VENUE_A)
  assert('lists venue-A candidates', all.length === 2)
  assert('filter by candidate_type', listVenueIntelligenceCandidatesForVenue(db, VENUE_A, { candidate_type: 'operational_constraint_signal' }).length === 1)
  assert('filter by human_review_status', listVenueIntelligenceCandidatesForVenue(db, VENUE_A, { human_review_status: 'unreviewed' }).length === 2)
  assert('invalid filter type throws', throws(() => listVenueIntelligenceCandidatesForVenue(db, VENUE_A, { candidate_type: 'nope' })))

  // ── Dedup ──────────────────────────────────────────────────────────────────
  section('Deduplication')
  const dup = createVenueIntelligenceCandidate(db, VENUE_A, tasteC[0]) // same type + source_decision_id
  assert('duplicate (venue,type,decision) returns existing, no new row', dup.deduped === true && dup.id === created.id)
  assert('dedup did not add a row', listVenueIntelligenceCandidatesForVenue(db, VENUE_A).length === 2)

  // ── Cross-venue isolation ──────────────────────────────────────────────────
  section('Cross-venue isolation')
  createVenueIntelligenceCandidate(db, VENUE_B, tasteC[0])
  assert('venue B sees only its own', listVenueIntelligenceCandidatesForVenue(db, VENUE_B).length === 1)
  assert('venue A unchanged', listVenueIntelligenceCandidatesForVenue(db, VENUE_A).length === 2)
  assert('cross-venue read by id → null', getVenueIntelligenceCandidateById(db, VENUE_B, created.id) === null)

  // ── Guardrails: isolation from Venue DNA, no AI, no live writes ────────────
  section('Guardrails (static)')
  const src = readFileSync(resolve(ROOT, 'src/services/venueBridge/fnbVenueFeedbackService.js'), 'utf8')
  // Precise: detect an actual call (the service's guardrail comment intentionally names it).
  assert('service makes no mergeVenueDna call', !/\bmergeVenueDna\s*\(/.test(src))
  // No mergeVenueDna on any import line (the only mentions are in the guardrail comment).
  assert('service does not import mergeVenueDna', !src.split('\n').some(l => /^\s*import\b/.test(l) && /mergeVenueDna/.test(l)))
  assert('service never writes venue_intelligence/venue_briefs/venue_dna_enrichment',
    !/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment)\b/i.test(src))
  assert('service only writes venue_intelligence_candidates',
    (src.match(/(INSERT\s+INTO|UPDATE)\s+(\w+)/gi) || []).every(s => /venue_intelligence_candidates/i.test(s)))
  assert('service makes no AI/network calls', !/askGemini|fetch\(|openai|gemini/i.test(src))
  assert('service has no Event/Lab imports', !/eventCocktailMenuService|geminiCocktailAgent|cocktailService/.test(src))
  // Precise: no EXPORTED promotion/DNA-write function, and no Venue DNA write anywhere
  // (doctrine comments may legitimately use the word "promoted").
  assert('service exports no promotion-to-DNA function',
    !/export\s+(function|const)\s+\w*([Pp]romot|[Cc]onfirmVenueDna|[Aa]pplyToVenueDna|[Tt]oVenueDna)/.test(src)
    && !/\bmergeVenueDna\s*\(/.test(src) && !/venue_dna_json/.test(src))

  const serverSrc = readFileSync(resolve(ROOT, 'server.js'), 'utf8')
  assert('server inits the candidate table', /db\.exec\(VENUE_INTELLIGENCE_CANDIDATES_DDL\)/.test(serverSrc))
  assert('server uses only the safe wrapper (no bare createVenueIntelligenceCandidate call)',
    !/createVenueIntelligenceCandidate\(/.test(serverSrc))

  // ── Phase 6B: non-blocking wrapper (safeRecordVenueIntelligenceCandidates) ──
  section('Phase 6B: safeRecordVenueIntelligenceCandidates (non-blocking)')
  const rejWithReason = {
    id: 'led_1', decision_type: 'cocktail_rejected',
    subject_ref: { cocktail_name: 'Too Sweet Sour' },
    decision_payload: { reasons: ['too_sweet'], base_spirit: 'rum' },
  }
  const r1 = safeRecordVenueIntelligenceCandidates(db, VENUE_A, rejWithReason)
  assert('rejection w/ explicit reason → created >= 1', r1.ok === true && r1.created >= 1 && r1.candidateIds.length >= 1)
  assert('stored candidate is venue-scoped + low confidence',
    (() => { const c = getVenueIntelligenceCandidateById(db, VENUE_A, r1.candidateIds[0]); return c && c.venue_id === VENUE_A && c.confidence.level === 'low' })())

  // dedupe: same decision again → no new rows
  const r1b = safeRecordVenueIntelligenceCandidates(db, VENUE_A, rejWithReason)
  assert('repeat same decision → created 0 (deduped)', r1b.ok === true && r1b.created === 0)

  // no candidate derives → ok:true, created 0
  assert('generated menu → created 0', (() => { const r = safeRecordVenueIntelligenceCandidates(db, VENUE_A, { id: 'g1', decision_type: 'cocktail_menu_generated' }); return r.ok && r.created === 0 })())
  assert('selected cocktail → created 0', (() => { const r = safeRecordVenueIntelligenceCandidates(db, VENUE_A, { id: 's1', decision_type: 'cocktail_selected' }); return r.ok && r.created === 0 })())
  assert('rejection w/o explicit reason → created 0', (() => { const r = safeRecordVenueIntelligenceCandidates(db, VENUE_A, { id: 'x1', decision_type: 'cocktail_rejected', decision_payload: { reasons: ['just_experimenting'] } }); return r.ok && r.created === 0 })())

  // decision without a source_decision_id → not written (dedupe key missing), skipped
  const noId = safeRecordVenueIntelligenceCandidates(db, VENUE_A, { decision_type: 'cocktail_rejected', subject_ref: { cocktail_name: 'X' }, decision_payload: { reasons: ['too_sweet'] } })
  assert('no source_decision_id → created 0, skipped >= 1', noId.ok === true && noId.created === 0 && noId.skipped >= 1)

  // non-blocking on db failure: never throws, returns ok:false
  const throwingDb = { prepare() { throw new Error('db exploded') } }
  let threw = false, rf
  try { rf = safeRecordVenueIntelligenceCandidates(throwingDb, VENUE_A, rejWithReason) } catch { threw = true }
  assert('db failure never throws', threw === false)
  assert('db failure returns ok:false', rf && rf.ok === false && typeof rf.error === 'string')

  // onError is invoked, and a throwing onError is swallowed
  let onErrCalls = 0
  safeRecordVenueIntelligenceCandidates(throwingDb, VENUE_A, rejWithReason, () => { onErrCalls++ })
  assert('onError invoked on failure', onErrCalls === 1)
  let threw2 = false
  try { safeRecordVenueIntelligenceCandidates(throwingDb, VENUE_A, rejWithReason, () => { throw new Error('logger exploded') }) } catch { threw2 = true }
  assert('throwing onError is swallowed', threw2 === false)

  // ── Phase 6B: static route-wiring guards ───────────────────────────────────
  section('Phase 6B: static route guards')
  assert('server imports isFnbVenueFeedbackCandidatesEnabled', /isFnbVenueFeedbackCandidatesEnabled/.test(serverSrc))
  assert('server imports safeRecordVenueIntelligenceCandidates', /safeRecordVenueIntelligenceCandidates/.test(serverSrc))
  // candidate write appears exactly once, gated by the flag
  assert('exactly one candidate-write call site', (serverSrc.match(/safeRecordVenueIntelligenceCandidates\(/g) || []).length === 1)
  assert('candidate write is flag-gated', /if \(isFnbVenueFeedbackCandidatesEnabled\(\)[\s\S]*safeRecordVenueIntelligenceCandidates\(/.test(serverSrc))
  // it lives in the rejections route, NOT in generate/cocktails
  const rejIdx = serverSrc.indexOf("app.post('/api/ci/rejections'")
  const tasteIdx = serverSrc.indexOf('// ── CI TASTE DNA')
  const writeIdx = serverSrc.indexOf('safeRecordVenueIntelligenceCandidates(')
  assert('candidate write is inside the rejections route', writeIdx > rejIdx && writeIdx < tasteIdx)
  const genStart = serverSrc.indexOf("app.post('/api/ci/generate'")
  const genEnd = serverSrc.indexOf("app.post('/api/ci/rejections'")
  assert('no candidate write in /api/ci/generate', !serverSrc.slice(genStart, genEnd).includes('safeRecordVenueIntelligenceCandidates('))
  const cocktailsStart = serverSrc.indexOf("app.post('/api/ci/cocktails'")
  assert('no candidate write in /api/ci/cocktails', !serverSrc.slice(cocktailsStart, cocktailsStart + 2000).includes('safeRecordVenueIntelligenceCandidates('))
  // just_experimenting early-return precedes the candidate write
  assert('just_experimenting precedes candidate write', serverSrc.indexOf('just_experimenting') < writeIdx)
  // requires a real ledger decision id before writing
  assert('candidate write requires ledger.ok + decisionId', /ledger && ledger\.ok && ledger\.decisionId/.test(serverSrc))
  // rejection response shape unchanged
  assert('rejection response shape unchanged', serverSrc.includes('res.status(201).json({ ok: true, saved: true });'))
  // no Venue DNA mutation introduced near the wiring
  assert('no DNA-table write near candidate wiring',
    !/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment)\b/i.test(
      serverSrc.slice(rejIdx, tasteIdx)))

  // ── Phase 7A: human review/approval (signal-only) ──────────────────────────
  section('Phase 7A: candidate review (signal-only)')
  assert('REVIEW_ACTION_STATUSES = reviewed/accepted/rejected/needs_changes',
    ['reviewed', 'accepted', 'rejected', 'needs_changes'].every(s => REVIEW_ACTION_STATUSES.includes(s)) && REVIEW_ACTION_STATUSES.length === 4)
  assert('no promoted_to_dna status anywhere', !REVIEW_ACTION_STATUSES.includes('promoted_to_dna') && !CANDIDATE_STATUSES.includes('promoted_to_dna'))

  const seed = createVenueIntelligenceCandidate(db, VENUE_A, {
    candidate_type: 'taste_direction_signal', source_decision_id: 'rev_seed_1',
    candidate_payload: { reason: 'too_sweet' }, evidence: [{ source: 'rejection_history' }],
    confidence: { level: 'low' },
  })
  const reviewed = markVenueIntelligenceCandidateReviewed(db, VENUE_A, seed.id, { human_review_status: 'accepted', reviewed_by: 'owner@v', review_note: 'useful signal' })
  assert('review updates human_review_status', reviewed && reviewed.human_review_status === 'accepted')
  assert('review sets reviewed_by', reviewed.reviewed_by === 'owner@v')
  assert('review sets reviewed_at', typeof reviewed.reviewed_at === 'string' && reviewed.reviewed_at.length > 0)
  assert('review stores review_note', reviewed.review_note === 'useful signal')
  assert('review does NOT change candidate content',
    reviewed.candidate_type === 'taste_direction_signal' && reviewed.candidate_payload.reason === 'too_sweet' && reviewed.confidence.level === 'low')
  assert('accepted is NOT a promotion (status still candidate)', reviewed.status === 'candidate')
  assert('can move accepted → rejected', markVenueIntelligenceCandidateReviewed(db, VENUE_A, seed.id, { human_review_status: 'rejected' }).human_review_status === 'rejected')
  assert('can move rejected → needs_changes', markVenueIntelligenceCandidateReviewed(db, VENUE_A, seed.id, { human_review_status: 'needs_changes' }).human_review_status === 'needs_changes')
  assert('invalid review status throws', throws(() => markVenueIntelligenceCandidateReviewed(db, VENUE_A, seed.id, { human_review_status: 'nope' })))
  assert("cannot set 'unreviewed' via review action", throws(() => markVenueIntelligenceCandidateReviewed(db, VENUE_A, seed.id, { human_review_status: 'unreviewed' })))
  assert("cannot set 'promoted_to_dna' via review action", throws(() => markVenueIntelligenceCandidateReviewed(db, VENUE_A, seed.id, { human_review_status: 'promoted_to_dna' })))
  assert('missing ids throw', throws(() => markVenueIntelligenceCandidateReviewed(db, '', '', { human_review_status: 'accepted' })))
  assert('cross-venue review → null (no foreign write)', markVenueIntelligenceCandidateReviewed(db, VENUE_B, seed.id, { human_review_status: 'accepted' }) === null)
  assert('venue A row unchanged after cross-venue attempt', getVenueIntelligenceCandidateById(db, VENUE_A, seed.id).human_review_status === 'needs_changes')
  assert('review fn only touches venue_intelligence_candidates',
    (src.match(/(INSERT\s+INTO|UPDATE)\s+(\w+)/gi) || []).every(s => /venue_intelligence_candidates/i.test(s)))

  // ── Phase 7A: static route guards ──────────────────────────────────────────
  section('Phase 7A: static route guards')
  assert('list candidates route exists (CI_ROLES)', /app\.get\('\/api\/venue-intelligence\/candidates', requireAuth\(\.\.\.CI_ROLES\)/.test(serverSrc))
  assert('detail candidate route exists (CI_ROLES)', /app\.get\('\/api\/venue-intelligence\/candidates\/:candidateId', requireAuth\(\.\.\.CI_ROLES\)/.test(serverSrc))
  assert('review route exists and is owner/admin only', /app\.patch\('\/api\/venue-intelligence\/candidates\/:candidateId\/review', requireAuth\('owner', 'admin'\)/.test(serverSrc))
  assert('review route 404s cross-venue', /No candidate found for this venue/.test(serverSrc))
  const candRouteStart = serverSrc.indexOf("app.get('/api/venue-intelligence/candidates'")
  // End the region at the Venue Intelligence Bridge section (the `BRIDGE_READ_ROLES`
  // const is defined immediately after the candidate routes — ASCII-safe boundary
  // that excludes the bridge helper functions, which legitimately write venue tables).
  const candRouteEnd = serverSrc.indexOf('BRIDGE_READ_ROLES', candRouteStart)
  const candRegion = candRouteEnd > candRouteStart ? serverSrc.slice(candRouteStart, candRouteEnd) : serverSrc.slice(candRouteStart)
  assert('no mergeVenueDna in candidate routes', !/mergeVenueDna/.test(candRegion))
  assert('no DNA-table write in candidate routes',
    !/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment)\b/i.test(candRegion))
  assert('no promotion endpoint / promoted_to_dna anywhere', !/promote|promotion|promoted_to_dna/i.test(serverSrc))
  assert('review_note migration is idempotent ALTER', /ALTER TABLE venue_intelligence_candidates ADD COLUMN review_note TEXT/.test(serverSrc))

  // ── Results ────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────')
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) { console.log(`\x1b[31m[FAIL] ${failed} test(s) failed — fix before committing.\x1b[0m\n`); process.exit(1) }
  console.log(`\x1b[32m[PASS] All tests passed.\x1b[0m\n`); process.exit(0)

  function isNonEmpty(v) { return typeof v === 'string' && v.length > 0 }
}
