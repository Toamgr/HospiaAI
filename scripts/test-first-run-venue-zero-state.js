#!/usr/bin/env node
/**
 * First-run Venue DNA zero-state checks (Phase 9D-1).
 *
 * Proves, deterministically and READ-ONLY, that a fresh owner/venue starts from
 * truth — no fake progress, no fake known dimensions, Full Mode locked — and that
 * Owner AI Home carries honest first-run copy.
 *
 * A brand-new venue's server row is lazily created with venue_dna_json = '{}', so
 * its effective DNA is exactly emptyVenueDna(). This test reconstructs that fresh
 * shape WITHOUT opening the database (it imports no sqlite, runs no SQL), so it
 * cannot modify venue-main or any other venue.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-first-run-venue-zero-state.js
 *   (or: npm run test:first-run-venue-zero-state)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { buildVenueDnaCompleteness } from '../src/services/venueIntelligence/venueDnaCompletenessEvaluator.js'
import { emptyVenueDna } from '../src/features/venue-intelligence/venueDnaModel.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const HOME_PATH = resolve(ROOT, 'src/features/owner-intelligence/OwnerAIHome.jsx')
const EVALUATOR_PATH = resolve(ROOT, 'src/services/venueIntelligence/venueDnaCompletenessEvaluator.js')

let passed = 0
let failed = 0
function ok(cond, msg) {
  if (cond) { passed++ }
  else { failed++; console.error(`  [FAIL] ${msg}`) }
}
function eq(a, b, msg) {
  ok(a === b, `${msg} (expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`)
}

console.log('\nFirst-run Venue DNA zero-state checks\n')

// The two shapes a fresh venue can present on first read:
//   • emptyVenueDna()  — the lazily-created row ({ ...emptyVenueDna(), ...{} })
//   • {}               — a malformed/missing venue_dna_json recovered to {}
const FRESH_SHAPES = {
  'emptyVenueDna()': emptyVenueDna(),
  'bare {} (malformed/missing recovery)': {},
}

for (const [label, dna] of Object.entries(FRESH_SHAPES)) {
  const r = buildVenueDnaCompleteness(dna)

  // 1. Fresh venue starts with empty Venue DNA → a computed model with no progress.
  eq(r.source?.computed, true, `[1] ${label}: completeness is computed`)

  // 2. Completeness endpoint shape returns not_started.
  eq(r.foundation_status, 'not_started', `[2] ${label}: foundation_status = not_started`)

  // 3. Score is 0.
  eq(r.foundation_score, 0, `[3] ${label}: foundation_score = 0`)

  // 4. unlock_readiness is false (Full Intelligence Mode locked).
  eq(r.unlock_readiness, false, `[4] ${label}: unlock_readiness = false`)

  // 5. No known/answered dimensions; every dimension has zero signals/evidence.
  eq(r.required_dimensions_answered.length, 0, `[5] ${label}: no answered required dimensions`)
  eq(r.required_dimensions_confirmed.length, 0, `[5b] ${label}: no confirmed required dimensions`)
  ok(r.dimensions.every(d => d.signal_count === 0), `[5c] ${label}: every dimension has zero signals`)
  ok(r.dimensions.every(d => d.evidence_available === false), `[5d] ${label}: no dimension has evidence`)
  eq(r.missing_required_dimensions.length, 6, `[5e] ${label}: all six required dimensions missing`)
  eq(r.not_enough_data, true, `[5f] ${label}: not_enough_data = true`)
}

// 6. Owner AI Home carries explicit first-run zero-state copy.
const homeSrc = readFileSync(HOME_PATH, 'utf8')
ok(/HESTIA is ready to learn this venue/i.test(homeSrc), '[6] OwnerAIHome has zero-state copy')
ok(/foundation_status/.test(homeSrc), '[6b] OwnerAIHome drives copy from foundation_status')

// 7. No fake KPI language in Owner AI Home.
for (const kpi of ['revenue', 'margin', 'sales', 'ROI', 'guest satisfaction', 'occupancy', 'profit']) {
  ok(!new RegExp(kpi, 'i').test(homeSrc), `[7] OwnerAIHome has no fake KPI label "${kpi}"`)
}

// 8. The existing venue (e.g. venue-main) cannot be modified by computing
//    completeness: the evaluator is pure (opens no DB, runs no write). This check
//    itself imports only fs + the pure evaluator/model — it never opens a database.
const evalSrc = readFileSync(EVALUATOR_PATH, 'utf8')
for (const token of ['node:sqlite', 'DatabaseSync', 'INSERT', 'UPDATE', 'DELETE', '.run(']) {
  ok(!evalSrc.includes(token), `[8] evaluator performs no DB access/write ("${token}")`)
}

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
