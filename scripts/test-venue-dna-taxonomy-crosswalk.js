#!/usr/bin/env node
/**
 * Deterministic tests for the pure read-only Venue DNA taxonomy ↔ 9C completeness
 * crosswalk (Phase 9E-3C-0). No DB, no server boot, no network, no AI.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-venue-dna-taxonomy-crosswalk.js
 *      (or: npm run test:venue-dna-taxonomy-crosswalk)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import {
  VENUE_DNA_CROSSWALK_VERSION,
  CROSSWALK_MAPPING_TYPES,
  VENUE_DNA_CROSSWALK_MAPPING_TYPE_KEYS,
  getVenueDnaTaxonomyCrosswalk,
  listLiveCompletenessKeys,
  getTaxonomyKeysForCompletenessKey,
  getCompletenessKeysForTaxonomyKey,
  describeCompletenessTaxonomyMapping,
  listTaxonomyOnlyDimensions,
  listCompletenessOnlyDimensions,
  validateCompletenessKey,
  mapCompletenessResultToTaxonomyView,
} from '../src/services/venueIntelligence/venueDnaTaxonomyCrosswalk.js'
import {
  validateVenueDnaDimensionId,
  listVenueDnaDimensionIds,
} from '../src/services/venueIntelligence/venueDnaTaxonomy.js'
import {
  buildVenueDnaCompleteness,
  VENUE_DNA_COMPLETENESS_DIMENSIONS,
} from '../src/services/venueIntelligence/venueDnaCompletenessEvaluator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const CROSSWALK_PATH = resolve(ROOT, 'src/services/venueIntelligence/venueDnaTaxonomyCrosswalk.js')
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

console.log('\nVenue DNA taxonomy ↔ 9C crosswalk — deterministic tests\n')

const VALID_MAPPING_TYPES = ['exact', 'renamed', 'overlapping', 'split', 'live_only', 'taxonomy_only']

// ── 0. Version + exports ──────────────────────────────────────────────────────
{
  eq(typeof VENUE_DNA_CROSSWALK_VERSION, 'string', '[0] version is a string')
  ok(VENUE_DNA_CROSSWALK_VERSION.length > 0, '[0] version is non-empty')
  for (const [name, fn] of Object.entries({
    getVenueDnaTaxonomyCrosswalk, listLiveCompletenessKeys, getTaxonomyKeysForCompletenessKey,
    getCompletenessKeysForTaxonomyKey, describeCompletenessTaxonomyMapping,
    listTaxonomyOnlyDimensions, listCompletenessOnlyDimensions, validateCompletenessKey,
    mapCompletenessResultToTaxonomyView,
  })) {
    eq(typeof fn, 'function', `[0] ${name} is a function`)
  }
  eq(JSON.stringify(VENUE_DNA_CROSSWALK_MAPPING_TYPE_KEYS), JSON.stringify(VALID_MAPPING_TYPES),
    '[0] mapping-type keys match the expected set/order')
}

// ── 1. Every live 9C completeness key is represented (and matches the evaluator) ─
{
  const liveKeys = listLiveCompletenessKeys()
  eq(liveKeys.length, 16, '[1] crosswalk declares 16 live 9C completeness keys')
  // The crosswalk's live keys must EXACTLY match the shipped evaluator's keys.
  const evaluatorKeys = VENUE_DNA_COMPLETENESS_DIMENSIONS.map(d => d.key)
  eq(evaluatorKeys.length, 16, '[1] evaluator still has 16 dimensions')
  eq(JSON.stringify([...liveKeys].sort()), JSON.stringify([...evaluatorKeys].sort()),
    '[1] crosswalk live keys == evaluator dimension keys (no drift)')
  for (const k of evaluatorKeys) ok(validateCompletenessKey(k), `[1] live key represented: ${k}`)
  eq(new Set(liveKeys).size, liveKeys.length, '[1] live keys are unique')
  // Known mappings from the audit are present and correct.
  const expected = {
    venue_identity: ['venue_identity'],
    owner_intent: ['owner_intent'],
    service_philosophy: ['service_philosophy'],
    non_negotiables: ['non_negotiables'],
    beverage_identity: ['beverage_identity'],
    brand_language: ['brand_language'],
    target_guests: ['target_guest_segments'],
    what_venue_is_not: ['what_venue_must_never_become'],
    emotional_atmosphere: ['emotional_promise'],
    hospitality_promise: ['hospitality_philosophy'],
    food_identity: ['fnb_identity'],
    operational_constraints: ['operational_pain_points', 'operational_constraints'],
    team_service_style: ['staff_behavior_standards', 'training_philosophy'],
    growth_opportunities: ['growth_ambition'],
    risk_drift: ['identity_drift_risks'],
    event_identity: [],
  }
  for (const [k, taxKeys] of Object.entries(expected)) {
    eq(JSON.stringify(getTaxonomyKeysForCompletenessKey(k)), JSON.stringify(taxKeys),
      `[1] ${k} maps to ${JSON.stringify(taxKeys)}`)
  }
}

// ── 2. Every mapped taxonomy key exists in the taxonomy ────────────────────────
{
  const cw = getVenueDnaTaxonomyCrosswalk()
  for (const m of cw.mappings) {
    for (const t of m.taxonomyKeys) {
      ok(validateVenueDnaDimensionId(t), `[2] mapped taxonomy key is real: ${t} (from ${m.completenessKey})`)
    }
  }
}

// ── 3. All mapping types are valid ─────────────────────────────────────────────
{
  const cw = getVenueDnaTaxonomyCrosswalk()
  for (const m of cw.mappings) {
    ok(VALID_MAPPING_TYPES.includes(m.mappingType), `[3] ${m.completenessKey} has a valid mapping type (${m.mappingType})`)
    // split ⇒ >1 target; live_only ⇒ 0 targets; everything else ⇒ exactly 1.
    if (m.mappingType === 'split') ok(m.taxonomyKeys.length > 1, `[3] split ${m.completenessKey} has multiple targets`)
    else if (m.mappingType === 'live_only') eq(m.taxonomyKeys.length, 0, `[3] live_only ${m.completenessKey} has no target`)
    else eq(m.taxonomyKeys.length, 1, `[3] ${m.mappingType} ${m.completenessKey} has exactly one target`)
  }
  for (const key of VALID_MAPPING_TYPES) ok(key in CROSSWALK_MAPPING_TYPES, `[3] mapping type defined: ${key}`)
}

// ── 4. event_identity is explicitly live-only ──────────────────────────────────
{
  eq(JSON.stringify(getTaxonomyKeysForCompletenessKey('event_identity')), '[]', '[4] event_identity has no taxonomy target')
  const only = listCompletenessOnlyDimensions()
  ok(only.some(d => d.completenessKey === 'event_identity'), '[4] event_identity listed as completeness-only')
  eq(only.length, 1, '[4] exactly one completeness-only dimension')
  const desc = describeCompletenessTaxonomyMapping('event_identity')
  eq(desc.mappingType, 'live_only', '[4] event_identity mapping type is live_only')
}

// ── 5. Taxonomy-only dimensions are explicitly listed (derived, no drift) ──────
{
  const taxOnly = listTaxonomyOnlyDimensions()
  const taxOnlyKeys = taxOnly.map(d => d.taxonomyKey)
  // Derived = all taxonomy ids minus every key referenced by a 9C mapping.
  const allTaxonomyIds = listVenueDnaDimensionIds()
  const cw = getVenueDnaTaxonomyCrosswalk()
  const mapped = new Set(cw.mappings.flatMap(m => m.taxonomyKeys))
  const expectedTaxOnly = allTaxonomyIds.filter(id => !mapped.has(id))
  eq(JSON.stringify([...taxOnlyKeys].sort()), JSON.stringify([...expectedTaxOnly].sort()),
    '[5] taxonomy-only == taxonomy ids minus mapped ids (derived)')
  // 35 total taxonomy dims, 17 covered by 9C ⇒ 18 taxonomy-only.
  eq(allTaxonomyIds.length, 35, '[5] taxonomy still has 35 dimensions')
  eq(mapped.size, 17, '[5] 17 taxonomy keys are covered by a 9C mapping')
  eq(taxOnly.length, 18, '[5] 18 taxonomy-only dimensions (no 9C counterpart)')
  // None of the taxonomy-only dims are accidentally also a mapping target.
  for (const k of taxOnlyKeys) ok(!mapped.has(k), `[5] taxonomy-only key not also mapped: ${k}`)
  // Spot-check a few that MUST be taxonomy-only and one that must NOT.
  for (const k of ['business_purpose', 'demographic_reality', 'menu_philosophy', 'owner_confirmation_status']) {
    ok(taxOnlyKeys.includes(k), `[5] ${k} is taxonomy-only`)
  }
  // staff_behavior_standards IS covered (via the team_service_style split) — not taxonomy-only.
  ok(!taxOnlyKeys.includes('staff_behavior_standards'), '[5] staff_behavior_standards is NOT taxonomy-only (covered by team_service_style split)')
}

// ── 6. No taxonomy-only dimension is silently marked answered/confirmed ─────────
{
  // Even on a fully-confirmed 9C result, taxonomy-only dims must read not_evaluated.
  const confirmed = buildVenueDnaCompleteness(answeredTrackableRequiredDna(), {
    confirmations: {
      venue_identity: true, owner_intent: true, target_guests: true,
      service_philosophy: true, non_negotiables: true, what_venue_is_not: true,
    },
  })
  const view = mapCompletenessResultToTaxonomyView(confirmed)
  for (const d of view.taxonomy_only_dimensions) {
    eq(d.projectedStatus, 'not_evaluated_by_9c', `[6] taxonomy-only ${d.taxonomyKey} is not_evaluated_by_9c`)
    eq(d.confirmed, false, `[6] taxonomy-only ${d.taxonomyKey} is never confirmed`)
    ok(d.projectedStatus !== 'answered', `[6] taxonomy-only ${d.taxonomyKey} never answered`)
  }
  // No projected dimension anywhere is ever 'confirmed'.
  for (const d of view.dimensions) eq(d.confirmed, false, `[6] projected ${d.taxonomyKey || d.sourceCompletenessKey} confirmed=false`)
  ok(view.dimensions.every(d => d.projectedStatus !== 'confirmed'), '[6] no projected status is "confirmed"')
  eq(view.unlock_readiness, false, '[6] taxonomy view forces unlock_readiness false')
  eq(view.confirmation_tier_available, false, '[6] confirmation tier not available (9D not built)')
}

// ── 7. trackedToday "no" and "partial" are preserved honestly ──────────────────
{
  // Construct a DNA where signal-trackable required dims are answered.
  const answered = buildVenueDnaCompleteness(answeredTrackableRequiredDna())
  const view = mapCompletenessResultToTaxonomyView(answered)

  // staff_behavior_standards is trackedToday 'no' → must project to not_tracked,
  // even though its 9C source (team_service_style) has signal evidence.
  const sbs = view.dimensions.find(d => d.taxonomyKey === 'staff_behavior_standards')
  ok(sbs, '[7] staff_behavior_standards present in view')
  eq(sbs.trackedToday, 'no', '[7] staff_behavior_standards trackedToday is no')
  eq(sbs.projectedStatus, 'not_tracked', '[7] trackedToday:no projects to not_tracked')
  eq(sbs.storageClamped, true, '[7] trackedToday:no is storage-clamped')

  // training_philosophy is trackedToday 'partial' → never confidently covered.
  const tp = view.dimensions.find(d => d.taxonomyKey === 'training_philosophy')
  eq(tp.trackedToday, 'partial', '[7] training_philosophy trackedToday is partial')
  ok(!['answered', 'needs_owner_confirmation'].includes(tp.projectedStatus),
    `[7] trackedToday:partial never confidently covered (got ${tp.projectedStatus})`)

  // A 'yes'-tracked dim may keep an answered-ish status (not clamped by storage).
  const vi = view.dimensions.find(d => d.taxonomyKey === 'venue_identity')
  eq(vi.trackedToday, 'yes', '[7] venue_identity trackedToday is yes')

  // Crosswalk snapshot reports the same honesty for the mapping details.
  const desc = describeCompletenessTaxonomyMapping('team_service_style')
  const sbsDetail = desc.taxonomyKeyDetails.find(t => t.key === 'staff_behavior_standards')
  eq(sbsDetail.trackedToday, 'no', '[7] mapping detail honestly reports staff_behavior_standards as not tracked')
}

// ── 8. Returned data is immutable; caller mutation cannot affect source ─────────
{
  const a = getVenueDnaTaxonomyCrosswalk()
  a.mappings = []
  a.liveCompletenessKeys.push('HACK')
  eq(getVenueDnaTaxonomyCrosswalk().mappings.length, 16, '[8] mutating snapshot.mappings does not affect source')
  ok(!getVenueDnaTaxonomyCrosswalk().liveCompletenessKeys.includes('HACK'), '[8] mutating liveCompletenessKeys does not affect source')

  const keys = listLiveCompletenessKeys()
  keys.pop()
  eq(listLiveCompletenessKeys().length, 16, '[8] mutating a returned key list does not shrink the source')

  const taxKeys = getTaxonomyKeysForCompletenessKey('operational_constraints')
  taxKeys.push('HACK')
  eq(getTaxonomyKeysForCompletenessKey('operational_constraints').length, 2, '[8] mutating returned taxonomy keys does not affect source')

  const only = listTaxonomyOnlyDimensions()
  only.pop()
  eq(listTaxonomyOnlyDimensions().length, 18, '[8] mutating taxonomy-only list does not shrink the source')

  const desc = describeCompletenessTaxonomyMapping('venue_identity')
  desc.mappingType = 'MUTATED'
  eq(describeCompletenessTaxonomyMapping('venue_identity').mappingType, 'exact', '[8] mutating a description does not affect source')
}

// ── 9. Helper functions are deterministic ──────────────────────────────────────
{
  eq(JSON.stringify(getVenueDnaTaxonomyCrosswalk()), JSON.stringify(getVenueDnaTaxonomyCrosswalk()),
    '[9] getVenueDnaTaxonomyCrosswalk is deterministic')
  const d = answeredTrackableRequiredDna()
  const r = buildVenueDnaCompleteness(d)
  eq(JSON.stringify(mapCompletenessResultToTaxonomyView(r)), JSON.stringify(mapCompletenessResultToTaxonomyView(r)),
    '[9] mapCompletenessResultToTaxonomyView is deterministic')
}

// ── Reverse lookup + validation edge cases ─────────────────────────────────────
{
  eq(JSON.stringify(getCompletenessKeysForTaxonomyKey('operational_constraints')), JSON.stringify(['operational_constraints']),
    'reverse lookup: operational_constraints ← operational_constraints')
  eq(JSON.stringify(getCompletenessKeysForTaxonomyKey('venue_identity')), JSON.stringify(['venue_identity']),
    'reverse lookup: venue_identity ← venue_identity')
  eq(JSON.stringify(getCompletenessKeysForTaxonomyKey('business_purpose')), '[]',
    'reverse lookup: taxonomy-only business_purpose has no 9C source')
  eq(getCompletenessKeysForTaxonomyKey('does_not_exist'), null, 'reverse lookup: unknown taxonomy key → null')
  eq(getTaxonomyKeysForCompletenessKey('does_not_exist'), null, 'forward lookup: unknown 9C key → null')
  eq(describeCompletenessTaxonomyMapping('does_not_exist'), null, 'describe: unknown key → null')
  eq(validateCompletenessKey('venue_identity'), true, 'validateCompletenessKey: known key true')
  eq(validateCompletenessKey('does_not_exist'), false, 'validateCompletenessKey: unknown key false')
  eq(validateCompletenessKey(undefined), false, 'validateCompletenessKey: undefined false')
}

// ── Input safety: view does not mutate the result; tolerates junk ──────────────
{
  const r = buildVenueDnaCompleteness(answeredTrackableRequiredDna())
  const before = JSON.stringify(r)
  mapCompletenessResultToTaxonomyView(r)
  eq(JSON.stringify(r), before, 'mapCompletenessResultToTaxonomyView does not mutate input')
  // Junk inputs do not throw and never assert confirmed/unlock.
  for (const junk of [null, undefined, {}, { dimensions: 'nope' }, 42, 'x']) {
    let threw = false
    let v
    try { v = mapCompletenessResultToTaxonomyView(junk) } catch { threw = true }
    ok(!threw, `junk input does not throw: ${JSON.stringify(junk)}`)
    eq(v.unlock_readiness, false, `junk input → unlock_readiness false: ${JSON.stringify(junk)}`)
    ok(v.dimensions.every(d => d.confirmed === false), `junk input → nothing confirmed: ${JSON.stringify(junk)}`)
  }
}

// ── 10–13. Static source guards — crosswalk must be pure ───────────────────────
{
  const src = readFileSync(CROSSWALK_PATH, 'utf8')
  // [10] No server import.
  ok(!/\bserver\.js\b/.test(src), '[10] crosswalk does not import server.js')
  // [11] No reference to the canonical Venue DNA writer.
  ok(!/mergeVenueDna/.test(src), '[11] crosswalk does not reference mergeVenueDna')
  // [12] No DB / network / AI / API keys.
  ok(!/openai|gemini|anthropic|generativelanguage|api[_-]?key/i.test(src), '[12] no AI provider or API-key references')
  ok(!/DatabaseSync|sqlite|db\.(prepare|exec|run)|fetch\(|axios|https?:\/\//i.test(src), '[12] no DB or network calls')
  ok(!/\brequire\(/.test(src), '[12] crosswalk uses no require()')
  // [13] No fabricated/demo venue names.
  ok(!/cohen-levi|kahi|paradiso|sips\b/i.test(src), '[13] no fabricated/demo venue names embedded')
  // It must import ONLY the pure taxonomy constants (no live-evaluator coupling).
  // Parse the actual module specifiers so multi-line imports and comment mentions
  // (the header names the evaluator's path descriptively) don't confuse the check.
  const importSpecifiers = [...src.matchAll(/\bfrom\s+['"]([^'"]+)['"]/g)].map(m => m[1])
  ok(importSpecifiers.length > 0, '[13] crosswalk has imports')
  ok(importSpecifiers.every(s => /venueDnaTaxonomy\.js$/.test(s)), '[13] crosswalk imports only from venueDnaTaxonomy.js')
  ok(!importSpecifiers.some(s => /venueDnaCompletenessEvaluator/.test(s)), '[13] crosswalk does not import the live 9C evaluator at module load')
}

// ── 14. Existing 9C evaluator behavior remains unchanged ───────────────────────
{
  // Empty DNA → not_started, no unlock, all six required missing (same as 9C tests).
  const empty = buildVenueDnaCompleteness({})
  eq(empty.foundation_status, 'not_started', '[14] empty DNA → not_started (9C unchanged)')
  eq(empty.unlock_readiness, false, '[14] empty DNA → unlock false (9C unchanged)')
  eq(empty.foundation_score, 0, '[14] empty DNA → score 0 (9C unchanged)')
  eq(empty.dimensions.length, 16, '[14] evaluator still reports 16 dimensions')
  // Evaluator source still pure (no second writer crept in).
  const ev = readFileSync(EVALUATOR_PATH, 'utf8')
  ok(!/mergeVenueDna/.test(ev), '[14] evaluator still does not reference mergeVenueDna')
  ok(/export\s+function\s+buildVenueDnaCompleteness/.test(ev), '[14] evaluator still exports buildVenueDnaCompleteness')
}

// ── helpers (kept at the bottom to mirror sibling test style; hoisted) ─────────
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
  d.trainingSignals = ['mentored', 'shadow shifts'] // partial-tracked signals
  return d
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
