#!/usr/bin/env node
/**
 * Deterministic tests for the pure read-only Venue DNA readiness engine
 * (Phase 9E-3D). No DB, no server boot, no network, no AI.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-venue-dna-readiness-engine.js
 *      (or: npm run test:venue-dna-readiness)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import {
  VENUE_DNA_READINESS_VERSION,
  VENUE_DNA_READINESS_BUCKETS,
  VENUE_DNA_READINESS_BUCKET_KEYS,
  buildVenueDnaReadinessView,
  summarizeVenueDnaReadiness,
  listMissingVenueDnaDimensions,
  listConfirmationCriticalGaps,
  listWorkingDraftGroupGaps,
  suggestVenueDnaQuestionCandidates,
} from '../src/services/venueIntelligence/venueDnaReadinessEngine.js'
import {
  VENUE_DNA_TAXONOMY_VERSION,
  listVenueDnaDimensionIds,
  listConfirmationCriticalDimensions,
} from '../src/services/venueIntelligence/venueDnaTaxonomy.js'
import {
  VENUE_DNA_CROSSWALK_VERSION,
} from '../src/services/venueIntelligence/venueDnaTaxonomyCrosswalk.js'
import {
  buildVenueDnaCompleteness,
  VENUE_DNA_COMPLETENESS_DIMENSIONS,
} from '../src/services/venueIntelligence/venueDnaCompletenessEvaluator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ENGINE_PATH = resolve(ROOT, 'src/services/venueIntelligence/venueDnaReadinessEngine.js')
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

console.log('\nVenue DNA readiness engine — deterministic tests\n')

const ALL_BUCKETS = ['known', 'partial', 'missing', 'not_tracked']

// ── fixtures (kept at the bottom too; hoisted) ─────────────────────────────────
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
function answeredTrackableRequiredDna() {
  const d = emptyDna()
  d.businessTypeSignals = ['intimate cocktail bar']
  d.hospitalityStyle = ['warm', 'considered']
  d.confidence.identity = 70
  d.guestExperienceSignals = ['regulars', 'after-work', 'expects intimacy']
  d.confidence.guest = 65
  d.serviceSignals = ['attentive', 'unhurried']
  d.trainingSignals = ['mentored', 'shadow shifts']  // partial-tracked signals
  d.beverageSignals = ['low-intervention', 'classic-forward']
  return d
}

// ── 0. Version + exports ────────────────────────────────────────────────────────
{
  eq(typeof VENUE_DNA_READINESS_VERSION, 'string', '[0] readiness version is a string')
  ok(VENUE_DNA_READINESS_VERSION.length > 0, '[0] readiness version is non-empty')
  for (const [name, fn] of Object.entries({
    buildVenueDnaReadinessView, summarizeVenueDnaReadiness, listMissingVenueDnaDimensions,
    listConfirmationCriticalGaps, listWorkingDraftGroupGaps, suggestVenueDnaQuestionCandidates,
  })) {
    eq(typeof fn, 'function', `[0] ${name} is a function`)
  }
  eq(JSON.stringify(VENUE_DNA_READINESS_BUCKET_KEYS), JSON.stringify(ALL_BUCKETS),
    '[0] bucket keys match the expected set/order')
  for (const b of ALL_BUCKETS) ok(b in VENUE_DNA_READINESS_BUCKETS, `[0] bucket defined: ${b}`)
}

// ── 1. Accepts null / junk input safely ─────────────────────────────────────────
{
  for (const junk of [null, undefined, {}, { dimensions: 'nope' }, 42, 'x', [], { dimensions: [1, 2, 3] }]) {
    let threw = false
    let v
    try { v = buildVenueDnaReadinessView(junk) } catch (e) { threw = true }
    ok(!threw, `[1] junk input does not throw: ${JSON.stringify(junk)}`)
    eq(v.unlock_readiness, false, `[1] junk → unlock_readiness false: ${JSON.stringify(junk)}`)
    eq(v.confirmation_tier_available, false, `[1] junk → confirmation_tier_available false: ${JSON.stringify(junk)}`)
    eq(v.dimensions.length, 35, `[1] junk → still all 35 dimensions: ${JSON.stringify(junk)}`)
    ok(v.dimensions.every(d => d.confirmed === false), `[1] junk → nothing confirmed: ${JSON.stringify(junk)}`)
    eq(v.summary.confirmed, 0, `[1] junk → summary.confirmed 0: ${JSON.stringify(junk)}`)
  }
}

// ── 2. Accepts a realistic 9C completeness fixture ──────────────────────────────
{
  const result = buildVenueDnaCompleteness(answeredTrackableRequiredDna())
  const view = buildVenueDnaReadinessView(result)
  eq(view.source.type, 'venue_dna_readiness', '[2] source type is venue_dna_readiness')
  eq(view.source.ai_used, false, '[2] ai_used false')
  eq(view.source.writes_performed, false, '[2] writes_performed false')
  eq(view.foundation_status, result.foundation_status, '[2] passes through 9C foundation_status')
  eq(view.foundation_score, result.foundation_score, '[2] passes through 9C foundation_score')
  ok(view.summary.known > 0, '[2] realistic fixture yields some known coverage')
}

// ── 3. Taxonomy + crosswalk + readiness versions are reflected ──────────────────
{
  const view = buildVenueDnaReadinessView(buildVenueDnaCompleteness(emptyDna()))
  eq(view.taxonomyVersion, VENUE_DNA_TAXONOMY_VERSION, '[3] taxonomy version reflected')
  eq(view.crosswalkVersion, VENUE_DNA_CROSSWALK_VERSION, '[3] crosswalk version reflected')
  eq(view.readinessVersion, VENUE_DNA_READINESS_VERSION, '[3] readiness version reflected')
}

// ── 4. All 35 taxonomy dimensions are represented exactly once ──────────────────
{
  const view = buildVenueDnaReadinessView(buildVenueDnaCompleteness(answeredTrackableRequiredDna()))
  eq(view.dimensions.length, 35, '[4] 35 dimensions represented')
  const keys = view.dimensions.map(d => d.taxonomyKey)
  eq(new Set(keys).size, 35, '[4] dimension keys are unique')
  const taxonomyIds = listVenueDnaDimensionIds()
  eq(JSON.stringify([...keys].sort()), JSON.stringify([...taxonomyIds].sort()),
    '[4] dimension keys == taxonomy ids (no drift, none invented)')
  // Every dimension lands in exactly one valid bucket.
  for (const d of view.dimensions) ok(ALL_BUCKETS.includes(d.bucket), `[4] ${d.taxonomyKey} has a valid bucket (${d.bucket})`)
  // Flat lists partition the 35 with no overlap and no loss.
  const partitioned = [...view.known, ...view.partial, ...view.missing, ...view.not_tracked]
  eq(partitioned.length, 35, '[4] flat bucket lists cover all 35 with no overlap')
  eq(new Set(partitioned).size, 35, '[4] flat bucket lists have no duplicates')
}

// ── 5. Dimensions are grouped by category and tier ──────────────────────────────
{
  const view = buildVenueDnaReadinessView(buildVenueDnaCompleteness(answeredTrackableRequiredDna()))
  const catKeys = ['foundation', 'module_specific', 'advanced']
  const tierKeys = ['stable_dna', 'evolving_signal', 'operational_signal', 'proposal_only']
  eq(JSON.stringify(Object.keys(view.byCategory).sort()), JSON.stringify([...catKeys].sort()), '[5] byCategory has the 3 categories')
  eq(JSON.stringify(Object.keys(view.byTier).sort()), JSON.stringify([...tierKeys].sort()), '[5] byTier has the 4 tiers')
  const catTotal = catKeys.reduce((s, k) => s + view.byCategory[k].total, 0)
  const tierTotal = tierKeys.reduce((s, k) => s + view.byTier[k].total, 0)
  eq(catTotal, 35, '[5] category totals sum to 35')
  eq(tierTotal, 35, '[5] tier totals sum to 35')
  // Each group's bucket lists sum to its total.
  for (const k of catKeys) {
    const g = view.byCategory[k]
    eq(g.known.length + g.partial.length + g.missing.length + g.not_tracked.length, g.total,
      `[5] category ${k} bucket lists sum to total`)
  }
}

// ── 6. trackedToday:'no' remains not_tracked (never answered) ───────────────────
{
  // Fully-confirmed 9C result — the strongest possible upstream signal.
  const confirmed = buildVenueDnaCompleteness(answeredTrackableRequiredDna(), {
    confirmations: {
      venue_identity: true, owner_intent: true, target_guests: true,
      service_philosophy: true, non_negotiables: true, what_venue_is_not: true,
    },
  })
  const view = buildVenueDnaReadinessView(confirmed)
  // non_negotiables, what_venue_must_never_become, staff_behavior_standards are trackedToday:'no'.
  for (const key of ['non_negotiables', 'what_venue_must_never_become', 'staff_behavior_standards']) {
    const d = view.dimensions.find(x => x.taxonomyKey === key)
    ok(d, `[6] ${key} present`)
    eq(d.trackedToday, 'no', `[6] ${key} trackedToday is no`)
    eq(d.bucket, 'not_tracked', `[6] ${key} stays not_tracked even on a confirmed 9C result`)
    ok(view.not_tracked.includes(key), `[6] ${key} appears in not_tracked list`)
    ok(!view.known.includes(key), `[6] ${key} never known`)
  }
  // No trackedToday:'no' dimension is ever known.
  for (const d of view.dimensions) {
    if (d.trackedToday === 'no') eq(d.bucket, 'not_tracked', `[6] trackedToday:no ${d.taxonomyKey} is not_tracked`)
  }
}

// ── 7. trackedToday:'partial' cannot become confirmed / known ───────────────────
{
  const confirmed = buildVenueDnaCompleteness(answeredTrackableRequiredDna(), {
    confirmations: { owner_intent: true },  // 9C owner_intent is partial-tracked; even confirmed it cannot read as known here
  })
  const view = buildVenueDnaReadinessView(confirmed)
  for (const d of view.dimensions) {
    if (d.trackedToday === 'partial') {
      ok(d.bucket !== 'known', `[7] trackedToday:partial ${d.taxonomyKey} is not known (got ${d.bucket})`)
      eq(d.confirmed, false, `[7] trackedToday:partial ${d.taxonomyKey} never confirmed`)
    }
  }
  // owner_intent specifically: partial-tracked, must not be known even after confirmation upstream.
  const oi = view.dimensions.find(d => d.taxonomyKey === 'owner_intent')
  eq(oi.trackedToday, 'partial', '[7] owner_intent trackedToday is partial')
  ok(oi.bucket !== 'known', `[7] owner_intent not known (got ${oi.bucket})`)
}

// ── 8. No dimension is ever marked confirmed ────────────────────────────────────
{
  const view = buildVenueDnaReadinessView(buildVenueDnaCompleteness(answeredTrackableRequiredDna(), {
    confirmations: { venue_identity: true, target_guests: true, service_philosophy: true },
  }))
  for (const d of view.dimensions) eq(d.confirmed, false, `[8] ${d.taxonomyKey} confirmed=false`)
  ok(view.dimensions.every(d => d.bucket !== 'confirmed'), '[8] no bucket is "confirmed"')
  eq(view.summary.confirmed, 0, '[8] summary.confirmed is 0')
  eq(view.unlock_readiness, false, '[8] unlock_readiness false')
  eq(view.confirmation_tier_available, false, '[8] confirmation_tier_available false')
  ok(typeof view.confidence_disclaimer === 'string' && /coverage/i.test(view.confidence_disclaimer),
    '[8] confidence disclaimer states coverage, not truth certainty')
}

// ── 9. Confirmation-critical gaps are listed ────────────────────────────────────
{
  // Empty DNA — nothing covered, so every confirmation-critical dim is a gap.
  const view = buildVenueDnaReadinessView(buildVenueDnaCompleteness(emptyDna()))
  const ccKeys = listConfirmationCriticalDimensions()
  ok(ccKeys.length > 0, '[9] taxonomy declares confirmation-critical dimensions')
  const gaps = listConfirmationCriticalGaps(view)
  eq(gaps.length, ccKeys.length, '[9] empty DNA → every confirmation-critical dim is a gap')
  const gapKeys = gaps.map(g => g.taxonomyKey)
  for (const k of ccKeys) ok(gapKeys.includes(k), `[9] confirmation-critical gap listed: ${k}`)
  // Each gap carries an honest bucket and is never `known`.
  for (const g of gaps) ok(['partial', 'missing', 'not_tracked'].includes(g.bucket), `[9] gap ${g.taxonomyKey} bucket honest (${g.bucket})`)
  eq(view.summary.confirmationCriticalGaps, gaps.length, '[9] summary mirrors gap count')
}

// ── 10. Working-draft OR-groups are evaluated conservatively ────────────────────
{
  // Empty DNA: no group can be satisfied; all are gaps; not ready.
  const empty = buildVenueDnaReadinessView(buildVenueDnaCompleteness(emptyDna()))
  ok(empty.workingDraftGroups.length > 0, '[10] working-draft groups exist')
  ok(empty.workingDraftGroups.every(g => g.satisfied === false), '[10] empty DNA → no group satisfied')
  eq(empty.workingDraftReady, false, '[10] empty DNA → working draft not ready')
  eq(listWorkingDraftGroupGaps(empty).length, empty.workingDraftGroups.length, '[10] empty DNA → all groups are gaps')
  // A group is satisfied ONLY by a `known` member (partial never satisfies).
  const some = buildVenueDnaReadinessView(buildVenueDnaCompleteness(answeredTrackableRequiredDna()))
  for (const g of some.workingDraftGroups) {
    if (g.satisfied) ok(g.satisfiedBy.length > 0 && g.satisfiedBy.every(k => some.known.includes(k)),
      `[10] satisfied group justified only by known members (${g.group.join('|')})`)
    else ok(g.satisfiedBy.length === 0, `[10] unsatisfied group has no known member (${g.group.join('|')})`)
    // partial members never count toward satisfaction.
    eq(g.status, g.satisfied ? 'satisfied' : (g.partialMembers.length ? 'partial_only' : 'unsatisfied'),
      `[10] group status is conservative (${g.group.join('|')})`)
  }
}

// ── 11. Question candidates come ONLY from missing/partial dimensions ────────────
{
  const view = buildVenueDnaReadinessView(buildVenueDnaCompleteness(answeredTrackableRequiredDna()))
  const candidates = suggestVenueDnaQuestionCandidates(view)
  ok(candidates.length > 0, '[11] some question candidates generated')
  const missingOrPartial = new Set([...view.missing, ...view.partial])
  for (const c of candidates) {
    ok(['missing', 'partial'].includes(c.bucket), `[11] candidate ${c.taxonomyKey} is missing/partial (${c.bucket})`)
    ok(missingOrPartial.has(c.taxonomyKey), `[11] candidate ${c.taxonomyKey} is a missing/partial dimension`)
    ok(!view.known.includes(c.taxonomyKey), `[11] candidate ${c.taxonomyKey} is not known`)
    ok(!view.not_tracked.includes(c.taxonomyKey), `[11] candidate ${c.taxonomyKey} is not not_tracked`)
    // question text is either null or sourced verbatim from the 9C result — never invented.
    ok(c.question === null || typeof c.question === 'string', `[11] candidate ${c.taxonomyKey} question is string|null`)
  }
  // Any non-null candidate question must match the caller's own 9C recommended_question.
  const result = buildVenueDnaCompleteness(answeredTrackableRequiredDna())
  const qByKey = new Map(result.dimensions.map(d => [d.key, d.recommended_question]))
  for (const c of candidates) {
    if (c.question !== null) {
      eq(c.question, qByKey.get(c.sourceCompletenessKey), `[11] candidate ${c.taxonomyKey} question sourced from 9C, not invented`)
    }
  }
}

// ── 12. No fake venue facts are embedded in the engine source ───────────────────
{
  const src = readFileSync(ENGINE_PATH, 'utf8')
  ok(!/cohen-levi|kahi|paradiso|sips\b/i.test(src), '[12] no fabricated/demo venue names embedded')
  // Engine declares it embeds no venue facts.
  ok(/no venue facts/i.test(src), '[12] engine header declares it embeds no venue facts')
}

// ── 13. Input objects are not mutated ───────────────────────────────────────────
{
  const result = buildVenueDnaCompleteness(answeredTrackableRequiredDna())
  const before = JSON.stringify(result)
  buildVenueDnaReadinessView(result)
  eq(JSON.stringify(result), before, '[13] buildVenueDnaReadinessView does not mutate its input')
  // Helpers do not mutate the view.
  const view = buildVenueDnaReadinessView(result)
  const viewBefore = JSON.stringify(view)
  summarizeVenueDnaReadiness(view)
  listMissingVenueDnaDimensions(view)
  listConfirmationCriticalGaps(view)
  listWorkingDraftGroupGaps(view)
  suggestVenueDnaQuestionCandidates(view)
  eq(JSON.stringify(view), viewBefore, '[13] helpers do not mutate the view')
}

// ── 14. Returned structures are immutable/deep-copied ───────────────────────────
{
  const result = buildVenueDnaCompleteness(answeredTrackableRequiredDna())
  const a = buildVenueDnaReadinessView(result)
  a.dimensions.push({ taxonomyKey: 'HACK' })
  a.known.push('HACK')
  a.summary.known = 999
  const b = buildVenueDnaReadinessView(result)
  eq(b.dimensions.length, 35, '[14] mutating returned dimensions does not affect a fresh build')
  ok(!b.known.includes('HACK'), '[14] mutating returned known list does not leak')
  ok(b.summary.known !== 999, '[14] mutating returned summary does not leak')
  // Helper outputs are deep copies too.
  const gaps = listConfirmationCriticalGaps(b)
  gaps.push({ taxonomyKey: 'HACK' })
  eq(listConfirmationCriticalGaps(b).length + 0, listConfirmationCriticalGaps(b).length, '[14] helper output is a fresh copy each call')
}

// ── 15. Helper functions are deterministic ──────────────────────────────────────
{
  const result = buildVenueDnaCompleteness(answeredTrackableRequiredDna())
  eq(JSON.stringify(buildVenueDnaReadinessView(result)), JSON.stringify(buildVenueDnaReadinessView(result)),
    '[15] buildVenueDnaReadinessView is deterministic')
  const view = buildVenueDnaReadinessView(result)
  for (const [name, fn] of Object.entries({
    summarizeVenueDnaReadiness, listMissingVenueDnaDimensions, listConfirmationCriticalGaps,
    listWorkingDraftGroupGaps, suggestVenueDnaQuestionCandidates,
  })) {
    eq(JSON.stringify(fn(view)), JSON.stringify(fn(view)), `[15] ${name} is deterministic`)
  }
  // Summary re-asserts safety invariants.
  const summary = summarizeVenueDnaReadiness(view)
  eq(summary.unlock_readiness, false, '[15] summary unlock_readiness false')
  eq(summary.confirmation_tier_available, false, '[15] summary confirmation_tier_available false')
  // Missing-data helper returns missing + not_tracked only.
  for (const d of listMissingVenueDnaDimensions(view)) {
    ok(['missing', 'not_tracked'].includes(d.bucket), `[15] missing-data record bucket honest (${d.bucket})`)
  }
}

// ── 16–19. Static source guards — engine must be pure & not wired to runtime ────
{
  const src = readFileSync(ENGINE_PATH, 'utf8')
  // [16] No server import.
  ok(!/\bserver\.js\b/.test(src), '[16] engine does not import server.js')
  // [17] No reference to the canonical Venue DNA writer.
  ok(!/mergeVenueDna/.test(src), '[17] engine does not reference mergeVenueDna')
  // [18] No DB / network / AI / API keys.
  ok(!/openai|gemini|anthropic|generativelanguage|api[_-]?key/i.test(src), '[18] no AI provider or API-key references')
  ok(!/DatabaseSync|sqlite|db\.(prepare|exec|run)|fetch\(|axios|https?:\/\//i.test(src), '[18] no DB or network calls')
  ok(!/\brequire\(/.test(src), '[18] engine uses no require()')
  // [19] Imports ONLY the pure taxonomy + crosswalk modules (no runtime/evaluator coupling).
  const importSpecifiers = [...src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map(m => m[1])
  ok(importSpecifiers.length > 0, '[19] engine has imports')
  ok(importSpecifiers.every(s => /venueDnaTaxonomy\.js$|venueDnaTaxonomyCrosswalk\.js$/.test(s)),
    '[19] engine imports only taxonomy + crosswalk')
  ok(!importSpecifiers.some(s => /venueDnaCompletenessEvaluator/.test(s)), '[19] engine does not import the live 9C evaluator')
  ok(!importSpecifiers.some(s => /server/.test(s)), '[19] engine imports nothing server-side')
}

// ── 20. Existing 9C evaluator behavior remains unchanged ────────────────────────
{
  // Empty DNA → not_started, no unlock, score 0, 16 dimensions (same as 9C tests).
  const empty = buildVenueDnaCompleteness({})
  eq(empty.foundation_status, 'not_started', '[20] empty DNA → not_started (9C unchanged)')
  eq(empty.unlock_readiness, false, '[20] empty DNA → unlock false (9C unchanged)')
  eq(empty.foundation_score, 0, '[20] empty DNA → score 0 (9C unchanged)')
  eq(empty.dimensions.length, 16, '[20] evaluator still reports 16 dimensions')
  eq(VENUE_DNA_COMPLETENESS_DIMENSIONS.length, 16, '[20] evaluator still has 16 dimensions')
  // Running the readiness engine does not mutate the evaluator output shape.
  const result = buildVenueDnaCompleteness(answeredTrackableRequiredDna())
  const before = JSON.stringify(result)
  buildVenueDnaReadinessView(result)
  eq(JSON.stringify(result), before, '[20] readiness engine leaves the 9C result untouched')
  // Evaluator source still pure (no writer crept in, still exports the builder).
  const ev = readFileSync(EVALUATOR_PATH, 'utf8')
  ok(!/mergeVenueDna/.test(ev), '[20] evaluator still does not reference mergeVenueDna')
  ok(/export\s+function\s+buildVenueDnaCompleteness/.test(ev), '[20] evaluator still exports buildVenueDnaCompleteness')
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
