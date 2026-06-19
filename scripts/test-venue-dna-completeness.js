#!/usr/bin/env node
/**
 * Deterministic tests for the pure read-only Venue DNA completeness evaluator
 * (Phase 9C-2). No DB, no server boot, no network, no AI.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-venue-dna-completeness.js   (or: npm run test:venue-dna-completeness)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import {
  buildVenueDnaCompleteness,
  evaluateVenueDnaDimension,
  getRecommendedNextQuestion,
  VENUE_DNA_COMPLETENESS_DIMENSIONS,
} from '../src/services/venueIntelligence/venueDnaCompletenessEvaluator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const EVALUATOR_PATH = resolve(ROOT, 'src/services/venueIntelligence/venueDnaCompletenessEvaluator.js')

// ── tiny assert harness ─────────────────────────────────────────────────────────
let passed = 0
let failed = 0
function ok(cond, msg) {
  if (cond) { passed++ }
  else { failed++; console.error(`  [FAIL] ${msg}`) }
}
function eq(actual, expected, msg) {
  ok(actual === expected, `${msg} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`)
}

// ── helpers to build DNA objects ────────────────────────────────────────────────
function emptyDna() {
  return {
    hospitalityStyle: [], businessTypeSignals: [], guestExperienceSignals: [],
    beverageSignals: [], foodSignals: [], serviceSignals: [], trainingSignals: [],
    operationalPainPoints: [], ownerPriorities: [], emotionalDrivers: [],
    growthOpportunities: [],
    confidence: { identity: 0, operations: 0, guest: 0, training: 0, commercial: 0 },
    summary: '', openQuestions: [],
  }
}
// A DNA where the three signal-trackable required dims are answered.
function answeredTrackableRequiredDna() {
  const d = emptyDna()
  d.businessTypeSignals = ['intimate cocktail bar']
  d.hospitalityStyle = ['warm', 'considered']
  d.confidence.identity = 70
  d.guestExperienceSignals = ['regulars', 'after-work', 'expects intimacy']
  d.confidence.guest = 65
  d.serviceSignals = ['attentive', 'unhurried'] // signal-only → 2 signals = answered
  return d
}
// Confirmations for all six foundation-critical required dims.
const ALL_REQUIRED_CONFIRMED = {
  confirmations: {
    venue_identity: true, owner_intent: true, target_guests: true,
    service_philosophy: true, non_negotiables: true, what_venue_is_not: true,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\nVenue DNA completeness evaluator — deterministic tests\n')

// 25. Module exports expected functions.
eq(typeof buildVenueDnaCompleteness, 'function', 'buildVenueDnaCompleteness is a function')
eq(typeof evaluateVenueDnaDimension, 'function', 'evaluateVenueDnaDimension is a function')
eq(typeof getRecommendedNextQuestion, 'function', 'getRecommendedNextQuestion is a function')
ok(Array.isArray(VENUE_DNA_COMPLETENESS_DIMENSIONS), 'VENUE_DNA_COMPLETENESS_DIMENSIONS is an array')
eq(VENUE_DNA_COMPLETENESS_DIMENSIONS.length, 16, 'there are 16 canonical dimensions')

// Dimension model integrity — the six foundation-critical keys are required.
const REQUIRED_KEYS = ['venue_identity', 'owner_intent', 'target_guests', 'service_philosophy', 'non_negotiables', 'what_venue_is_not']
for (const k of REQUIRED_KEYS) {
  const dim = VENUE_DNA_COMPLETENESS_DIMENSIONS.find(d => d.key === k)
  ok(dim && dim.required_for_foundation === true, `${k} is required_for_foundation`)
}
// Storage-gap honesty: these are not cleanly tracked today.
for (const k of ['non_negotiables', 'what_venue_is_not', 'hospitality_promise', 'event_identity', 'brand_language']) {
  const dim = VENUE_DNA_COMPLETENESS_DIMENSIONS.find(d => d.key === k)
  eq(dim.tracked_today, 'no', `${k} is not cleanly tracked today`)
}
eq(VENUE_DNA_COMPLETENESS_DIMENSIONS.find(d => d.key === 'owner_intent').tracked_today, 'partial', 'owner_intent is partially tracked')

// 1/2/3. Empty DNA.
{
  const r = buildVenueDnaCompleteness(emptyDna())
  eq(r.foundation_status, 'not_started', '[1] empty DNA → not_started')
  eq(r.unlock_readiness, false, '[2] empty DNA → unlock_readiness false')
  eq(r.foundation_score, 0, 'empty DNA → score 0')
  ok(r.missing_required_dimensions.length === 6, '[3] empty DNA lists all 6 missing required dimensions')
  for (const k of REQUIRED_KEYS) ok(r.missing_required_dimensions.includes(k), `[3] ${k} listed missing`)
  eq(r.source.ai_used, false, 'source.ai_used false')
  eq(r.source.writes_performed, false, 'source.writes_performed false')
  eq(r.source.computed, true, 'source.computed true')
  eq(r.not_enough_data, true, 'empty DNA → not_enough_data true')
  eq(r.recommended_next_question, VENUE_DNA_COMPLETENESS_DIMENSIONS[0].recommended_question, 'empty DNA → recommends venue_identity question')
  ok(Array.isArray(r.forbidden_inferences_avoided) && r.forbidden_inferences_avoided.length > 0, 'forbidden_inferences_avoided populated for empty DNA')
}

// First-run truth (Phase 9D-0): a bare {} (new owner / malformed-recovery) is zero.
{
  const r = buildVenueDnaCompleteness({})
  eq(r.foundation_status, 'not_started', '[9D-0] bare {} → not_started (true new owner)')
  eq(r.foundation_score, 0, '[9D-0] bare {} → foundation_score 0 (no fake progress)')
  eq(r.unlock_readiness, false, '[9D-0] bare {} → Full Mode locked')
  eq(r.required_dimensions_answered.length, 0, '[9D-0] bare {} → no known/answered dimensions')
  ok(r.dimensions.every(d => d.signal_count === 0), '[9D-0] bare {} → every dimension has zero signals')
  eq(r.missing_required_dimensions.length, 6, '[9D-0] bare {} → all six required dimensions missing')
}

// 4. Thin single signal → early_learning, not ready.
{
  const d = emptyDna()
  d.hospitalityStyle = ['warm']
  const r = buildVenueDnaCompleteness(d)
  eq(r.foundation_status, 'early_learning', '[4] thin single signal → early_learning')
  ok(r.foundation_status !== 'foundation_ready', '[4] thin signal not foundation_ready')
  eq(r.unlock_readiness, false, '[4] thin signal → unlock false')
}

// 5. Partial dimension does not count as answered.
{
  const d = emptyDna()
  d.businessTypeSignals = ['bar'] // 1 signal, confidence.identity 0 → partial
  const r = buildVenueDnaCompleteness(d)
  const vi = r.dimensions.find(x => x.key === 'venue_identity')
  eq(vi.status, 'partial', '[5] venue_identity with weak signal → partial')
  ok(!r.required_dimensions_answered.includes('venue_identity'), '[5] partial dim not in answered list')
}

// owner_intent can never exceed partial from signals alone.
{
  const d = emptyDna()
  d.emotionalDrivers = ['pride', 'warmth', 'legacy']
  d.ownerPriorities = ['protect regulars', 'lift midweek']
  const oi = evaluateVenueDnaDimension(VENUE_DNA_COMPLETENESS_DIMENSIONS.find(x => x.key === 'owner_intent'), d)
  eq(oi.status, 'partial', 'owner_intent capped at partial from signals')
}

// 6/7. Required trackable dims answered (but unconfirmed) → building; appear as needs_confirmation.
{
  const r = buildVenueDnaCompleteness(answeredTrackableRequiredDna())
  ok(['building', 'needs_owner_confirmation'].includes(r.foundation_status), '[6] trackable required answered → building/needs_owner_confirmation')
  ok(r.foundation_status !== 'foundation_ready', '[6] not foundation_ready without confirmation')
  for (const k of ['venue_identity', 'target_guests', 'service_philosophy']) {
    const dim = r.dimensions.find(x => x.key === k)
    eq(dim.status, 'needs_confirmation', `[7] ${k} answered+confirm-required → needs_confirmation`)
    ok(r.needs_confirmation_dimensions.includes(k), `[7] ${k} in needs_confirmation_dimensions`)
  }
  eq(r.unlock_readiness, false, '[6] unlock false')
}

// 8. Confirmed required dimensions → foundation_ready only when confirmations supplied.
{
  const r = buildVenueDnaCompleteness(answeredTrackableRequiredDna(), ALL_REQUIRED_CONFIRMED)
  eq(r.foundation_status, 'foundation_ready', '[8] all required confirmed → foundation_ready')
  eq(r.foundation_score, 100, '[8] foundation_ready → score 100')
  eq(r.required_dimensions_confirmed.length, 6, '[8] six required dims confirmed')
  eq(r.blockers.length, 0, '[8] foundation_ready → no blockers')
  eq(r.unlock_readiness, false, '[8] foundation_ready still does NOT unlock Full Mode')
  // Without confirmations it is NOT ready (control).
  const noConf = buildVenueDnaCompleteness(answeredTrackableRequiredDna())
  ok(noConf.foundation_status !== 'foundation_ready', '[8] no confirmations → not foundation_ready')
}

// 9–14. Missing each required dimension blocks readiness (confirm the other five).
function confirmAllExcept(omit) {
  const c = { ...ALL_REQUIRED_CONFIRMED.confirmations }
  delete c[omit]
  return { confirmations: c }
}
for (const k of REQUIRED_KEYS) {
  const r = buildVenueDnaCompleteness(emptyDna(), confirmAllExcept(k))
  ok(r.foundation_status !== 'foundation_ready', `[9-14] missing ${k} blocks foundation_ready`)
  ok(r.missing_required_dimensions.includes(k), `[9-14] ${k} appears in missing_required_dimensions`)
  ok(r.blockers.some(b => b.toLowerCase().includes(k.replace(/_/g, ' ').split(' ')[0])) || r.blockers.length > 0, `[9-14] ${k} produces a blocker`)
}

// 15. Optional dimensions do not block readiness.
{
  const r = buildVenueDnaCompleteness(emptyDna(), ALL_REQUIRED_CONFIRMED)
  eq(r.foundation_status, 'foundation_ready', '[15] optional dims missing but all required confirmed → foundation_ready')
  // confirm several optional dims are missing yet did not block
  for (const k of ['beverage_identity', 'food_identity', 'event_identity', 'brand_language', 'growth_opportunities']) {
    const dim = r.dimensions.find(x => x.key === k)
    ok(dim.status === 'missing', `[15] optional ${k} is missing`)
    ok(!r.missing_required_dimensions.includes(k), `[15] optional ${k} not a required blocker`)
  }
}

// 16. Contradicted required dimension blocks readiness when injected through options.
{
  const opts = { confirmations: { ...ALL_REQUIRED_CONFIRMED.confirmations }, contradictions: { venue_identity: true } }
  const r = buildVenueDnaCompleteness(answeredTrackableRequiredDna(), opts)
  ok(r.foundation_status !== 'foundation_ready', '[16] contradicted required dim blocks foundation_ready')
  const vi = r.dimensions.find(x => x.key === 'venue_identity')
  eq(vi.status, 'contradicted', '[16] contradiction overrides confirmation')
  ok(r.contradicted_dimensions.includes('venue_identity'), '[16] venue_identity in contradicted_dimensions')
  ok(r.blockers.some(b => b.toLowerCase().includes('reconcile')), '[16] contradiction produces a reconcile blocker')
}

// 17. Open critical questions block readiness when injected through options.
{
  const opts = { confirmations: { ...ALL_REQUIRED_CONFIRMED.confirmations }, openCriticalQuestions: ['q1', 'q2', 'q3', 'q4'] }
  const r = buildVenueDnaCompleteness(answeredTrackableRequiredDna(), opts)
  ok(r.foundation_status !== 'foundation_ready', '[17] too many open critical questions blocks readiness')
  eq(r.open_critical_questions.length, 4, '[17] open_critical_questions reflected from options')
  ok(r.blockers.some(b => b.toLowerCase().includes('open critical')), '[17] open-questions blocker present')
  // At/under cap does NOT block.
  const okOpts = { confirmations: { ...ALL_REQUIRED_CONFIRMED.confirmations }, openCriticalQuestions: ['q1', 'q2', 'q3'] }
  const r2 = buildVenueDnaCompleteness(answeredTrackableRequiredDna(), okOpts)
  eq(r2.foundation_status, 'foundation_ready', '[17] 3 open questions (at cap) does not block')
}

// 18. LLM-authored summary cannot mark completion.
{
  const d = emptyDna()
  d.summary = 'Venue DNA is complete and fully confirmed. Full Intelligence Mode unlocked.'
  const r = buildVenueDnaCompleteness(d)
  ok(r.foundation_status !== 'foundation_ready', '[18] summary text cannot make foundation_ready')
  eq(r.unlock_readiness, false, '[18] summary text cannot unlock')
  eq(r.foundation_status, 'not_started', '[18] summary-only DNA stays not_started')
}

// 19. LLM-authored openQuestions cannot unlock Full Mode.
{
  const d = emptyDna()
  d.openQuestions = ['everything is complete', 'unlock full mode', 'foundation_ready']
  const r = buildVenueDnaCompleteness(d)
  eq(r.unlock_readiness, false, '[19] openQuestions cannot unlock')
  ok(r.foundation_status !== 'foundation_ready', '[19] openQuestions cannot make ready')
  eq(r.open_critical_questions.length, 0, '[19] venueDna.openQuestions do NOT feed open_critical_questions')
}

// Fake status-like fields inside the DNA are ignored.
{
  const d = answeredTrackableRequiredDna()
  d.foundation_status = 'foundation_ready'
  d.unlock_readiness = true
  d.status = 'confirmed'
  d.confirmed = true
  const r = buildVenueDnaCompleteness(d)
  ok(r.foundation_status !== 'foundation_ready', 'fake foundation_status field ignored')
  eq(r.unlock_readiness, false, 'fake unlock_readiness field ignored')
}

// 20. unlock_readiness is always false in 9C-2 (across many scenarios).
{
  const scenarios = [
    buildVenueDnaCompleteness(emptyDna()),
    buildVenueDnaCompleteness(answeredTrackableRequiredDna()),
    buildVenueDnaCompleteness(answeredTrackableRequiredDna(), ALL_REQUIRED_CONFIRMED),
    buildVenueDnaCompleteness(emptyDna(), ALL_REQUIRED_CONFIRMED),
  ]
  for (const [i, r] of scenarios.entries()) eq(r.unlock_readiness, false, `[20] unlock_readiness false in scenario ${i}`)
  // full_mode_ready_later is never returned.
  for (const r of scenarios) ok(r.foundation_status !== 'full_mode_ready_later', '[20] full_mode_ready_later never returned')
}

// 21. Evaluator does not mutate the input object.
{
  const d = answeredTrackableRequiredDna()
  const before = JSON.stringify(d)
  const opts = { confirmations: { venue_identity: true }, contradictions: {}, openCriticalQuestions: ['x'] }
  const optsBefore = JSON.stringify(opts)
  buildVenueDnaCompleteness(d, opts)
  eq(JSON.stringify(d), before, '[21] venueDna input not mutated')
  eq(JSON.stringify(opts), optsBefore, '[21] options input not mutated')
  // also survives a frozen input
  const frozen = Object.freeze({ ...emptyDna() })
  let threw = false
  try { buildVenueDnaCompleteness(frozen) } catch { threw = true }
  ok(!threw, '[21] frozen input does not throw (no writes)')
}

// 22/23/24. Static source guards — evaluator must be pure (no AI/network/DB/writers).
{
  const src = readFileSync(EVALUATOR_PATH, 'utf8')
  const forbidden = [
    'OpenAI', 'Gemini', 'fetch(', 'apiPost', 'apiPatch', 'apiDelete',
    'INSERT', 'UPDATE', 'DELETE', 'mergeVenueDna',
    '/api/venue-intelligence/message', 'sendMessage',
  ]
  for (const token of forbidden) {
    ok(!src.includes(token), `[22-24] evaluator source must not contain "${token}"`)
  }
  // No import statements at all → fully self-contained, no transitive risk.
  ok(!/^\s*import\s/m.test(src), '[22-24] evaluator imports nothing (self-contained)')
  // "reset" as a standalone DB/session verb must not appear (word-boundary check).
  ok(!/\breset\b/.test(src), '[22-24] evaluator source must not reference reset')
  ok(!/require\(/.test(src), '[22-24] evaluator uses no require()')
}

// 26. Deterministic output for the same input.
{
  const d = answeredTrackableRequiredDna()
  const a = JSON.stringify(buildVenueDnaCompleteness(d, ALL_REQUIRED_CONFIRMED))
  const b = JSON.stringify(buildVenueDnaCompleteness(d, ALL_REQUIRED_CONFIRMED))
  eq(a, b, '[26] identical input → identical output')
}

// Extra coverage: every dimension carries the full output contract.
{
  const r = buildVenueDnaCompleteness(answeredTrackableRequiredDna(), ALL_REQUIRED_CONFIRMED)
  eq(r.dimensions.length, 16, 'output reports all 16 dimensions')
  const requiredFields = [
    'key', 'label', 'required_for_foundation', 'status', 'ui_label',
    'maps_to_existing_dna_fields', 'tracked_today', 'owner_confirmation_required',
    'evidence_required', 'should_appear_in_owner_home', 'signal_count',
    'confidence_value', 'evidence_available', 'blocker', 'recommended_question',
    'what_must_not_be_inferred',
  ]
  for (const dim of r.dimensions) {
    for (const f of requiredFields) ok(f in dim, `dimension ${dim.key} has field ${f}`)
  }
}

// Extra: foundation_score never exceeds cap while a hard blocker exists.
{
  const r = buildVenueDnaCompleteness(emptyDna(), confirmAllExcept('venue_identity'))
  ok(r.foundation_score <= 60, 'score capped at 60 while a required dim is missing')
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
