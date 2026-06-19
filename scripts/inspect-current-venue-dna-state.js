#!/usr/bin/env node
/**
 * READ-ONLY Venue DNA first-run diagnostic (Phase 9D-0).
 *
 * Prints, for every venue_intelligence row in the local SQLite DB:
 *   • venue id (+ venue name if joinable)
 *   • whether venue_dna_json exists and which fields are non-empty
 *   • the deterministic evaluator summary (status / score / missing required)
 *   • the exact signal/confidence fields contributing to the score
 *
 * STRICTLY READ-ONLY: opens the DB read-only, runs only SELECTs, performs no
 * INSERT/UPDATE/DELETE/reset/mutation, and prints no secrets.
 *
 * Run: node scripts/inspect-current-venue-dna-state.js
 *   (or: npm run inspect:venue-dna-state)
 */

import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildVenueDnaCompleteness } from '../src/services/venueIntelligence/venueDnaCompletenessEvaluator.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'data', 'hospia.sqlite')

const SIGNAL_KEYS = [
  'hospitalityStyle', 'businessTypeSignals', 'guestExperienceSignals', 'beverageSignals',
  'foodSignals', 'serviceSignals', 'trainingSignals', 'operationalPainPoints',
  'ownerPriorities', 'emotionalDrivers', 'growthOpportunities', 'openQuestions',
]

function arrLen(v) { return Array.isArray(v) ? v.filter(x => String(x ?? '').trim()).length : 0 }

let db
try {
  // Open read-only — this process must never be able to write.
  db = new DatabaseSync(DB_PATH, { readOnly: true })
} catch (err) {
  console.error(`Could not open DB read-only at ${DB_PATH}: ${err.message}`)
  process.exit(1)
}

console.log(`\nVenue DNA first-run diagnostic (READ-ONLY)\nDB: ${DB_PATH}\n`)

let rows = []
try {
  rows = db.prepare('SELECT venue_id, stage, venue_dna_json, updated_at FROM venue_intelligence ORDER BY venue_id').all()
} catch (err) {
  console.error(`Could not read venue_intelligence: ${err.message}`)
  process.exit(1)
}

if (!rows.length) {
  console.log('No venue_intelligence rows exist yet → a true new owner would see not_started / 0.\n')
  process.exit(0)
}

for (const row of rows) {
  let venueName = ''
  try {
    const v = db.prepare('SELECT name FROM venues WHERE id = ?').get(row.venue_id)
    venueName = v?.name ? ` (${v.name})` : ''
  } catch { /* venues table optional */ }

  let dna = {}
  let malformed = false
  try { dna = JSON.parse(row.venue_dna_json || '{}') } catch { malformed = true; dna = {} }

  const nonEmptySignals = SIGNAL_KEYS
    .map(k => [k, arrLen(dna[k])])
    .filter(([, n]) => n > 0)
  const confidence = (dna.confidence && typeof dna.confidence === 'object') ? dna.confidence : {}
  const nonZeroConfidence = Object.entries(confidence).filter(([, v]) => Number(v) > 0)
  const hasSummary = typeof dna.summary === 'string' && dna.summary.trim().length > 0

  const r = buildVenueDnaCompleteness(dna)

  console.log('─'.repeat(64))
  console.log(`venue_id: ${row.venue_id}${venueName}   stage: ${row.stage || 'story'}   updated: ${row.updated_at || 'n/a'}`)
  console.log(`venue_dna_json: ${malformed ? 'MALFORMED (recovered to {})' : (row.venue_dna_json ? `present (${row.venue_dna_json.length} chars)` : 'empty')}`)
  console.log(`evaluator → status=${r.foundation_status}  score=${r.foundation_score}  unlock=${r.unlock_readiness}`)
  console.log(`required answered: [${r.required_dimensions_answered.join(', ') || 'none'}]`)
  console.log(`required missing : [${r.missing_required_dimensions.join(', ') || 'none'}]`)
  console.log(`needs confirmation: [${r.needs_confirmation_dimensions.join(', ') || 'none'}]`)
  console.log('contributing fields:')
  if (nonEmptySignals.length) {
    for (const [k, n] of nonEmptySignals) console.log(`   • ${k}: ${n} signal(s)`)
  } else {
    console.log('   • (no non-empty signal arrays)')
  }
  if (nonZeroConfidence.length) {
    console.log(`   • confidence: ${nonZeroConfidence.map(([k, v]) => `${k}=${v}`).join(', ')}`)
  } else {
    console.log('   • confidence: all zero')
  }
  console.log(`   • summary: ${hasSummary ? 'present' : 'empty'}`)
}

console.log('─'.repeat(64))
console.log('\nNote: a true new owner with no conversation has an empty venue_dna_json')
console.log('and the evaluator returns not_started / 0. Any score above 0 reflects real')
console.log('signals captured by a prior Venue Learning conversation for that venue.\n')
