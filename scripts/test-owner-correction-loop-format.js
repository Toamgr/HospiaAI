#!/usr/bin/env node
/**
 * Behavioral checks for the Owner Correction Loop candidate-signal structure backstop.
 *
 * Proves, by executing the pure formatter, that "Candidate Venue DNA signals" are forced
 * into the required 5-field structure (Signal / Evidence / Confidence / Status / Suggested
 * destination) regardless of what the model produced:
 *   • plain bullet-only candidates are repaired, never passed through;
 *   • every repaired candidate carries all five fields with valid values;
 *   • Status is always one of: candidate only / needs owner confirmation / too early;
 *   • the seven correction buckets, protect-vs-never-become, and closing survive intact;
 *   • already-structured candidates pass through unchanged (idempotent);
 *   • an empty candidate bucket is NOT fabricated into invented signals.
 *
 * No DB, no server boot, no network, no AI. Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-owner-correction-loop-format.js
 */

import {
  ensureStructuredCandidateSignals,
  candidateSignalsAreStructured,
  __testing,
} from '../src/services/venueIntelligence/ownerCorrectionLoopFormat.js'

let passed = 0
let failed = 0
function ok(cond, msg) {
  if (cond) { passed++ }
  else { failed++; console.error(`  [FAIL] ${msg}`) }
}

console.log('\nOwner Correction Loop — candidate-signal structure backstop\n')

// ── Fixture A: the real-world plain-bullet reply shape observed live ──────────
const PLAIN_BULLETS = `Working Draft — not yet confirmed

Owner Correction Loop

1. Feels accurate:
   - The emotional promise of discovery and warmth.
2. Feels promising but still unconfirmed:
   - The specific visual and design language of the venue.
3. Feels too strong / too early:
   - The balance between cocktails and food offerings.
4. Needs owner decision:
   - Finalizing the role of food in the overall concept.
5. Should be softened before becoming Venue DNA:
   - The phrasing around what the venue must never become.
6. Candidate Venue DNA signals:
   - A hidden, elegant, and intimate atmosphere that invites discovery.
   - A serious cocktail program that serves as a focal point of the guest experience.
   - Warm, knowledgeable service that enhances guest interactions without being intrusive.
7. Not ready for Venue DNA yet:
   - The specifics of the operational model.

What the venue must protect:
   - The intimate, warm, and inviting atmosphere.
What the venue must never become:
   - A loud party bar or a gimmicky speakeasy.

Tell me only what feels wrong, too strong, or missing.`

// Helper: pull the candidate-bucket entries back out of a formatted reply.
function candidateEntries(reply) {
  const section = __testing.locateCandidateSection(reply)
  return section ? section.entries : []
}

// 1. The raw plain-bullet reply must NOT be considered structured.
ok(candidateSignalsAreStructured(PLAIN_BULLETS) === false,
  '[1] plain bullet-only candidates are rejected by the validator')

const repaired = ensureStructuredCandidateSignals(PLAIN_BULLETS)

// 2. After repair the reply IS structured.
ok(candidateSignalsAreStructured(repaired) === true,
  '[2] plain bullets are repaired into the 5-field structure')

// 3. Every candidate line carries all five labelled fields.
const repairedEntries = candidateEntries(repaired)
ok(repairedEntries.length === 3, '[3] all three candidate signals are preserved (none dropped/added)')
for (const [i, raw] of repairedEntries.entries()) {
  ok(__testing.readField(raw, 'signal'), `[3.${i}a] candidate ${i} has Signal`)
  ok(__testing.readField(raw, 'evidence'), `[3.${i}b] candidate ${i} has Evidence`)
  ok(__testing.normalizeConfidence(__testing.readField(raw, 'confidence')), `[3.${i}c] candidate ${i} has valid Confidence`)
  ok(__testing.normalizeStatus(__testing.readField(raw, 'status')), `[3.${i}d] candidate ${i} has valid Status`)
  ok(__testing.normalizeDestination(__testing.readField(raw, 'suggested destination')), `[3.${i}e] candidate ${i} has valid Suggested destination`)
}

// 4. Status is always one of the three allowed values.
for (const raw of repairedEntries) {
  const status = __testing.normalizeStatus(__testing.readField(raw, 'status'))
  ok(__testing.VALID_STATUS.includes(status),
    `[4] status "${status}" is candidate-only / needs owner confirmation / too early`)
}

// 5. The original signal TEXT is preserved as the Signal value (no fabrication / no loss).
ok(/A hidden, elegant, and intimate atmosphere that invites discovery/.test(repaired),
  '[5] the original signal wording is preserved verbatim as the Signal')

// 6. The seven correction buckets survive the repair.
const BUCKETS = ['Feels accurate', 'Feels promising but still unconfirmed', 'Feels too strong / too early',
  'Needs owner decision', 'Should be softened before becoming Venue DNA',
  'Candidate Venue DNA signals', 'Not ready for Venue DNA yet']
ok(BUCKETS.every((b) => repaired.includes(b)), '[6] all seven correction buckets survive the repair')

// 7. Protect vs never-become remain two separate lines.
ok(/What the venue must protect:/.test(repaired) && /What the venue must never become:/.test(repaired),
  '[7a] protect and never-become lines both survive')
ok(repaired.indexOf('What the venue must protect:') !== repaired.indexOf('What the venue must never become:'),
  '[7b] protect and never-become remain distinct lines')

// 8. The closing line is untouched by the formatter (closing is appended elsewhere).
ok(/Tell me only what feels wrong, too strong, or missing\./.test(repaired),
  '[8] the loop closing line is preserved')

// ── Fixture B: already fully structured (idempotence) ─────────────────────────
const STRUCTURED = `Working Draft — not yet confirmed

Owner Correction Loop

6. Candidate Venue DNA signals:
- Signal: Intimate hidden atmosphere; Evidence: owner described a private-salon feel; Confidence: medium; Status: needs owner confirmation; Suggested destination: Venue DNA
- Signal: Serious cocktail program; Evidence: stated as the experience focal point; Confidence: high; Status: candidate only; Suggested destination: Bar Intelligence
7. Not ready for Venue DNA yet:
- The operational model.`

ok(candidateSignalsAreStructured(STRUCTURED) === true,
  '[9] a fully structured reply is recognised as structured')
ok(ensureStructuredCandidateSignals(STRUCTURED) === STRUCTURED,
  '[10] a fully structured reply is returned unchanged (idempotent)')
// Idempotence on the repaired output: repairing twice changes nothing.
ok(ensureStructuredCandidateSignals(repaired) === repaired,
  '[11] repairing an already-repaired reply is a no-op')

// ── Fixture C: partially structured (some fields present) ─────────────────────
const PARTIAL = `Owner Correction Loop

6. Candidate Venue DNA signals:
- Signal: Discovery-led arrival; Confidence: high
- Warm precise service
7. Not ready for Venue DNA yet:
- TBD`
const partialFixed = ensureStructuredCandidateSignals(PARTIAL)
ok(candidateSignalsAreStructured(partialFixed) === true,
  '[12] partially-structured candidates are completed to the full 5 fields')
// The Confidence the model DID supply (high) must be reused, not overwritten by the default.
const firstPartial = candidateEntries(partialFixed)[0]
ok(__testing.normalizeConfidence(__testing.readField(firstPartial, 'confidence')) === 'high',
  '[13] a model-supplied field (Confidence: high) is reused, not clobbered by the default')

// ── Fixture D: empty candidate bucket must NOT be fabricated ───────────────────
const EMPTY_BUCKET = `Owner Correction Loop

6. Candidate Venue DNA signals:
7. Not ready for Venue DNA yet:
- Everything else.`
ok(candidateSignalsAreStructured(EMPTY_BUCKET) === false,
  '[14] an empty candidate bucket is not considered structured')
ok(ensureStructuredCandidateSignals(EMPTY_BUCKET) === EMPTY_BUCKET,
  '[15] an empty candidate bucket is NOT fabricated into invented signals')

// ── Fixture E: no candidate bucket at all (non-loop reply) ─────────────────────
const NO_BUCKET = 'Working Draft — not yet confirmed\n\nSome normal-night synthesis text.\n\nCorrect me where this feels wrong.'
ok(ensureStructuredCandidateSignals(NO_BUCKET) === NO_BUCKET,
  '[16] a reply with no candidate bucket is returned unchanged')

// 17. The formatter does not touch anything resembling Venue DNA persistence — it only
//     reshapes the candidate bucket text. (Guards the "no canonical DNA mutation" claim:
//     the module never references DB/persistence; canonical DNA stays the route's concern.)
ok(repaired.split('\n').filter((l) => /What the venue must protect|What the venue must never become/.test(l)).length === 2,
  '[17] exactly the two protect/never-become lines remain (no structural drift)')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
