#!/usr/bin/env node
/**
 * Deterministic tests for the pure read-only Venue DNA taxonomy constants
 * (Phase 9E-3B). No DB, no server boot, no network, no AI.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-venue-dna-taxonomy.js   (or: npm run test:venue-dna-taxonomy)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import {
  VENUE_DNA_TAXONOMY_VERSION,
  VENUE_DNA_DIMENSION_CATEGORIES,
  VENUE_DNA_DIMENSION_TIERS,
  VENUE_DNA_DIMENSION_STATUSES,
  VENUE_DNA_EVIDENCE_TYPES,
  VENUE_DNA_EVIDENCE_TIERS,
  VENUE_DNA_CONFIDENCE_SEMANTICS,
  getVenueDnaTaxonomy,
  getVenueDnaDimension,
  listVenueDnaDimensions,
  listVenueDnaDimensionIds,
  validateVenueDnaDimensionId,
  groupVenueDnaDimensionsByCategory,
  groupVenueDnaDimensionsByTier,
  listConfirmationCriticalDimensions,
  getWorkingDraftThresholdGroups,
  describeVenueDnaConfidence,
  listVenueDnaDimensionStatuses,
  listVenueDnaEvidenceTypes,
} from '../src/services/venueIntelligence/venueDnaTaxonomy.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const MODULE_PATH = resolve(ROOT, 'src/services/venueIntelligence/venueDnaTaxonomy.js')

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

console.log('\nVenue DNA taxonomy — deterministic tests\n')

const EXPECTED_CATEGORIES = ['foundation', 'module_specific', 'advanced']
const EXPECTED_TIERS = ['stable_dna', 'evolving_signal', 'operational_signal', 'proposal_only']
const REQUIRED_DIM_FIELDS = [
  'key', 'name', 'category', 'tier', 'description', 'evidence',
  'answeredWhen', 'partialWhen', 'neverInfer',
  'blocksDraft', 'blocksConfirmation', 'trackedToday', 'modules',
]
const ALLOWED_TRACKED = ['yes', 'partial', 'no']

// ── 1. Stable version ─────────────────────────────────────────────────────────
{
  eq(typeof VENUE_DNA_TAXONOMY_VERSION, 'string', '[1] version is a string')
  ok(VENUE_DNA_TAXONOMY_VERSION.length > 0, '[1] version is non-empty')
  eq(getVenueDnaTaxonomy().version, VENUE_DNA_TAXONOMY_VERSION, '[1] taxonomy snapshot reports the version')
}

// ── 2. Helper functions exist ─────────────────────────────────────────────────
{
  for (const [name, fn] of Object.entries({
    getVenueDnaTaxonomy, getVenueDnaDimension, listVenueDnaDimensions,
    listVenueDnaDimensionIds, validateVenueDnaDimensionId,
    groupVenueDnaDimensionsByCategory, groupVenueDnaDimensionsByTier,
    listConfirmationCriticalDimensions, getWorkingDraftThresholdGroups,
    describeVenueDnaConfidence, listVenueDnaDimensionStatuses, listVenueDnaEvidenceTypes,
  })) {
    eq(typeof fn, 'function', `[2] ${name} is a function`)
  }
}

// ── 3. Dimension count + uniqueness ───────────────────────────────────────────
const dims = listVenueDnaDimensions()
{
  eq(dims.length, 35, '[3] taxonomy has 35 dimensions (14 foundation + 19 module-specific + 2 advanced)')
  const ids = listVenueDnaDimensionIds()
  eq(ids.length, 35, '[3] 35 dimension ids')
  eq(new Set(ids).size, ids.length, '[3] dimension ids are unique')
  // snake_case keys
  for (const id of ids) ok(/^[a-z][a-z0-9_]*$/.test(id), `[3] key is snake_case: ${id}`)
}

// ── 4. No duplicate labels ────────────────────────────────────────────────────
{
  const names = dims.map(d => d.name)
  eq(new Set(names).size, names.length, '[4] dimension names (labels) are unique')
}

// ── 5. Required fields exist for every dimension + allowed enums ───────────────
{
  for (const dim of dims) {
    for (const f of REQUIRED_DIM_FIELDS) ok(f in dim, `[5] dimension ${dim.key} has field ${f}`)
    ok(EXPECTED_CATEGORIES.includes(dim.category), `[5] ${dim.key} category is known (${dim.category})`)
    ok(EXPECTED_TIERS.includes(dim.tier), `[5] ${dim.key} tier is known (${dim.tier})`)
    ok(ALLOWED_TRACKED.includes(dim.trackedToday), `[5] ${dim.key} trackedToday is allowed (${dim.trackedToday})`)
    ok(typeof dim.blocksDraft === 'boolean', `[5] ${dim.key} blocksDraft is boolean`)
    ok(
      typeof dim.blocksConfirmation === 'boolean' || dim.blocksConfirmation === 'conditional',
      `[5] ${dim.key} blocksConfirmation is boolean|conditional`,
    )
    ok(Array.isArray(dim.modules) && dim.modules.length > 0, `[5] ${dim.key} has modules`)
    for (const s of ['description', 'evidence', 'answeredWhen', 'partialWhen', 'neverInfer']) {
      ok(typeof dim[s] === 'string' && dim[s].length > 0, `[5] ${dim.key} ${s} is a non-empty string`)
    }
  }
}

// ── 6. Categories are known/allowed and match counts ──────────────────────────
{
  const catKeys = Object.keys(VENUE_DNA_DIMENSION_CATEGORIES)
  eq(JSON.stringify(catKeys), JSON.stringify(EXPECTED_CATEGORIES), '[6] category enum matches expected set/order')
  const byCat = groupVenueDnaDimensionsByCategory()
  eq(Object.keys(byCat).length, 3, '[6] grouped into 3 categories')
  eq(byCat.foundation.length, 14, '[6] 14 foundation dimensions')
  eq(byCat.module_specific.length, 19, '[6] 19 module-specific dimensions')
  eq(byCat.advanced.length, 2, '[6] 2 advanced dimensions')
  // every dimension category is a known key
  for (const dim of dims) ok(catKeys.includes(dim.category), `[6] ${dim.key} category in enum`)
}

// ── 7. Tiers known + all four represented ─────────────────────────────────────
{
  const tierKeys = Object.keys(VENUE_DNA_DIMENSION_TIERS)
  eq(JSON.stringify(tierKeys), JSON.stringify(EXPECTED_TIERS), '[7] tier enum matches expected set/order')
  const byTier = groupVenueDnaDimensionsByTier()
  for (const t of EXPECTED_TIERS) ok(byTier[t] && byTier[t].length > 0, `[7] tier ${t} has at least one dimension`)
  const totalGrouped = EXPECTED_TIERS.reduce((n, t) => n + byTier[t].length, 0)
  eq(totalGrouped, 35, '[7] every dimension is assigned exactly one known tier')
}

// ── 8. All dimensions retrievable by ID; validation works ─────────────────────
{
  for (const id of listVenueDnaDimensionIds()) {
    const dim = getVenueDnaDimension(id)
    ok(dim && dim.key === id, `[8] getVenueDnaDimension(${id}) returns the dimension`)
    ok(validateVenueDnaDimensionId(id), `[8] validateVenueDnaDimensionId(${id}) is true`)
  }
  eq(getVenueDnaDimension('does_not_exist'), null, '[8] unknown id returns null')
  eq(validateVenueDnaDimensionId('does_not_exist'), false, '[8] unknown id fails validation')
  eq(validateVenueDnaDimensionId(undefined), false, '[8] undefined fails validation')
}

// ── 9. Confirmation-critical set is a subset of known keys ────────────────────
{
  const cc = listConfirmationCriticalDimensions()
  ok(Array.isArray(cc) && cc.length > 0, '[9] confirmation-critical list is non-empty')
  for (const k of cc) ok(validateVenueDnaDimensionId(k), `[9] confirmation-critical key is a real dimension: ${k}`)
  // spec §3.2 core eight must be present
  for (const k of [
    'venue_identity', 'owner_intent', 'target_guest_segments', 'emotional_promise',
    'service_philosophy', 'non_negotiables', 'what_venue_must_never_become', 'staff_behavior_standards',
  ]) ok(cc.includes(k), `[9] core confirmation-critical dimension present: ${k}`)
}

// ── 10. Working-draft OR-groups reference only known keys ─────────────────────
{
  const groups = getWorkingDraftThresholdGroups()
  ok(Array.isArray(groups) && groups.length === 7, '[10] 7 working-draft OR-groups (spec §6)')
  for (const group of groups) {
    ok(Array.isArray(group) && group.length > 0, '[10] each OR-group is a non-empty array')
    for (const k of group) ok(validateVenueDnaDimensionId(k), `[10] OR-group key is a real dimension: ${k}`)
  }
}

// ── 11. Status + evidence models ──────────────────────────────────────────────
{
  const statuses = listVenueDnaDimensionStatuses()
  for (const s of [
    'not_asked', 'mentioned', 'partial', 'answered', 'needs_precision',
    'needs_owner_confirmation', 'confirmed', 'contradicted', 'not_relevant',
  ]) ok(s in statuses, `[11] status defined: ${s}`)
  eq(Object.keys(VENUE_DNA_DIMENSION_STATUSES).length, 9, '[11] 9 statuses (spec §4)')

  const evTypes = listVenueDnaEvidenceTypes()
  for (const t of [
    'owner_provided_fact', 'owner_provided_belief', 'operational_signal',
    'inferred_signal', 'contradiction', 'confirmation', 'missing',
  ]) ok(t in evTypes, `[11] evidence type defined: ${t}`)
  eq(Object.keys(VENUE_DNA_EVIDENCE_TYPES).length, 7, '[11] 7 evidence types (spec §5)')

  // evidence tiers: assumption is never usable; confirmed_truth only in confirmed DNA
  eq(VENUE_DNA_EVIDENCE_TIERS.assumption.usableInDraft, false, '[11] assumption never usable in draft')
  eq(VENUE_DNA_EVIDENCE_TIERS.assumption.usableInConfirmedDna, false, '[11] assumption never usable in confirmed DNA')
  eq(VENUE_DNA_EVIDENCE_TIERS.confirmed_truth.usableInConfirmedDna, true, '[11] confirmed_truth usable in confirmed DNA')
}

// ── 12. Confidence semantics = coverage, not certainty ────────────────────────
{
  eq(VENUE_DNA_CONFIDENCE_SEMANTICS.means, 'engine-calibrated evidence coverage', '[12] confidence means coverage')
  ok(/certainty/.test(VENUE_DNA_CONFIDENCE_SEMANTICS.does_not_mean), '[12] confidence explicitly is not certainty')
  eq(describeVenueDnaConfidence(0).band, 'none', '[12] 0 → none band')
  eq(describeVenueDnaConfidence(30).band, 'low', '[12] 30 → low band')
  eq(describeVenueDnaConfidence(50).band, 'forming', '[12] 50 → forming band')
  eq(describeVenueDnaConfidence(60).band, 'working', '[12] 60 → working band')
  eq(describeVenueDnaConfidence(90).band, 'strong', '[12] 90 → strong band')
  eq(describeVenueDnaConfidence(150).band, null, '[12] out-of-range → null band')
  eq(describeVenueDnaConfidence('nope').band, null, '[12] non-numeric → null band')
}

// ── 13. Determinism ───────────────────────────────────────────────────────────
{
  eq(
    JSON.stringify(getVenueDnaTaxonomy()),
    JSON.stringify(getVenueDnaTaxonomy()),
    '[13] getVenueDnaTaxonomy is deterministic',
  )
  eq(
    JSON.stringify(listVenueDnaDimensions()),
    JSON.stringify(listVenueDnaDimensions()),
    '[13] listVenueDnaDimensions is deterministic',
  )
}

// ── 14. Read-only: callers cannot mutate the canonical source ─────────────────
{
  const a = getVenueDnaDimension('venue_identity')
  a.name = 'MUTATED'
  a.modules.push('HACK')
  const b = getVenueDnaDimension('venue_identity')
  eq(b.name, 'Venue identity', '[14] mutating a returned dimension does not affect the source')
  ok(!b.modules.includes('HACK'), '[14] mutating a returned modules array does not affect the source')

  const list = listVenueDnaDimensions()
  list.pop()
  eq(listVenueDnaDimensions().length, 35, '[14] mutating a returned list does not shrink the source')

  const tax = getVenueDnaTaxonomy()
  tax.dimensions = []
  eq(getVenueDnaTaxonomy().dimensions.length, 35, '[14] mutating a returned snapshot does not affect the source')

  const groups = getWorkingDraftThresholdGroups()
  groups[0].push('HACK')
  ok(!getWorkingDraftThresholdGroups()[0].includes('HACK'), '[14] mutating returned OR-groups does not affect the source')
}

// ── 15. Source purity (static checks) — no DB / no AI / no writer / no keys ────
{
  const src = readFileSync(MODULE_PATH, 'utf8')
  // No imports at all (self-contained).
  ok(!/^\s*import\s/m.test(src), '[15] taxonomy imports nothing (self-contained)')
  ok(!/\brequire\(/.test(src), '[15] taxonomy uses no require()')
  // Never references the canonical Venue DNA writer / schema mutators.
  ok(!/mergeVenueDna/.test(src), '[15] taxonomy does not reference mergeVenueDna')
  ok(!/\bserver\.js\b/.test(src), '[15] taxonomy does not import server.js')
  // No AI providers / API keys.
  ok(!/openai|gemini|anthropic|generativelanguage|api[_-]?key/i.test(src), '[15] no AI provider or API-key references')
  // No DB / network calls.
  ok(!/DatabaseSync|sqlite|db\.(prepare|exec|run)|fetch\(|axios|https?:\/\//i.test(src), '[15] no DB or network calls')
  // No fake venue facts (known demo tokens must never appear here).
  ok(!/cohen-levi|kahi|paradiso|sips\b/i.test(src), '[15] no fabricated/demo venue names embedded')
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
