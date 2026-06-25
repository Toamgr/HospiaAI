#!/usr/bin/env node
/**
 * Behavioral checks for the Candidate Venue DNA signal reader.
 *
 * Proves, by executing the pure shared parser and the client wrapper, that:
 *   • ordinary assistant messages (no candidate bucket) parse to null / [];
 *   • Owner Correction Loop replies parse into candidates with all five fields;
 *   • Evidence text is preserved verbatim;
 *   • Confidence / Status / Suggested destination are normalized to canonical values;
 *   • missing signals are never fabricated;
 *   • malformed / empty input fails safely (no throw, returns null);
 *   • every candidate is stamped provenance: owner_conversation.
 *
 * No DB, no server boot, no network, no AI, no React. Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-candidate-signal-parser.js
 */

import {
  parseCandidateSignalsFromText,
  parseCandidateSignalLine,
  candidateSignalHasRequiredFields,
  normalizeCandidateConfidence,
  normalizeCandidateStatus,
  normalizeSuggestedDestination,
} from '../src/services/venueIntelligence/candidateSignalFormat.js'
import { parseCandidateSignals } from '../src/features/owner-intelligence/candidateSignalParser.js'

let passed = 0
let failed = 0
function ok(cond, msg) {
  if (cond) { passed++ }
  else { failed++; console.error(`  [FAIL] ${msg}`) }
}

console.log('\nCandidate Venue DNA signal reader\n')

// ── Fixture A: a real structured Owner Correction Loop reply ───────────────────
const STRUCTURED = `Working Draft — not yet confirmed

Owner Correction Loop

6. Candidate Venue DNA signals:
- Signal: Intimate hidden atmosphere; Evidence: owner described a private-salon feel; Confidence: medium; Status: needs owner confirmation; Suggested destination: Venue DNA
- Signal: Serious cocktail program; Evidence: stated as the experience focal point; Confidence: high; Status: candidate only; Suggested destination: Bar Intelligence
7. Not ready for Venue DNA yet:
- The operational model.

Tell me only what feels wrong, too strong, or missing.`

const a = parseCandidateSignals(STRUCTURED)
ok(a !== null, '[1] structured Owner Correction Loop reply parses to a non-null result')
ok(a && a.framingNeeded === true, '[2] result flags framingNeeded')
ok(a && a.candidates.length === 2, '[3] both candidate signals are parsed (none dropped/added)')

const c0 = a.candidates[0]
ok(c0.signal === 'Intimate hidden atmosphere', '[4a] Signal parsed exactly')
ok(c0.evidence === 'owner described a private-salon feel', '[4b] Evidence preserved verbatim')
ok(c0.confidence === 'medium', '[4c] Confidence normalized')
ok(c0.status === 'needs owner confirmation', '[4d] Status normalized')
ok(c0.suggestedDestination === 'Venue DNA', '[4e] Suggested destination normalized')
ok(c0.provenance === 'owner_conversation', '[4f] provenance stamped owner_conversation')
ok(candidateSignalHasRequiredFields(c0), '[4g] candidate has all five required fields')

// ── Fixture B: ordinary assistant message (no candidate bucket) ────────────────
const ORDINARY = 'Working Draft — not yet confirmed\n\nSome normal-night synthesis text.\n\nCorrect me where this feels wrong.'
ok(parseCandidateSignals(ORDINARY) === null, '[5] an ordinary message parses to null (no panel)')
ok(parseCandidateSignalsFromText(ORDINARY).length === 0, '[6] no candidate entries extracted from ordinary text')

// ── Fixture C: a Founder Brief without a candidate bucket ──────────────────────
const FOUNDER_BRIEF = `Founder Brief — working draft

Who it is for: discerning regulars.
The feeling: quiet discovery.

Correct me where this feels wrong.`
ok(parseCandidateSignals(FOUNDER_BRIEF) === null, '[7] a Founder Brief without a candidate bucket parses to null')

// ── Fixture D: normalization variants ──────────────────────────────────────────
ok(normalizeCandidateConfidence('HIGH confidence') === 'high', '[8a] confidence normalization is case-insensitive')
ok(normalizeCandidateStatus('this is too early really') === 'too early', '[8b] status normalization matches phrase')
ok(normalizeSuggestedDestination('route to Venue Memory please') === 'Venue Memory', '[8c] destination longest-match wins over Venue DNA')

// ── Fixture E: missing-signal entries are never fabricated ─────────────────────
ok(parseCandidateSignalLine('   ') === null, '[9a] blank entry parses to null (no fabrication)')
ok(parseCandidateSignalLine(null) === null, '[9b] null entry parses to null')

// A bucket whose only entry has no recoverable signal yields null from the client wrapper.
const ONLY_LABELS = `Owner Correction Loop

6. Candidate Venue DNA signals:
- Evidence: ; Confidence: ; Status: ; Suggested destination:
7. Not ready for Venue DNA yet:
- TBD`
// The line has labels but empty values, so signal falls back to the text before the first
// field label — which is empty. The client wrapper must drop it and return null.
const e = parseCandidateSignals(ONLY_LABELS)
ok(e === null || (e.candidates && e.candidates.every((c) => c.signal)), '[10] entries with no real signal are not surfaced')

// ── Fixture F: malformed / non-string input fails safely ───────────────────────
ok(parseCandidateSignals(undefined) === null, '[11a] undefined input returns null')
ok(parseCandidateSignals(42) === null, '[11b] non-string input returns null')
ok(parseCandidateSignals('') === null, '[11c] empty string returns null')

// ── Fixture G: partial structure (some fields missing) stays honest, not invented ──
const PARTIAL = `Owner Correction Loop

6. Candidate Venue DNA signals:
- Signal: Discovery-led arrival; Confidence: high
7. Not ready for Venue DNA yet:
- TBD`
const g = parseCandidateSignals(PARTIAL)
ok(g && g.candidates.length === 1, '[12a] partial entry still surfaces (has a signal)')
ok(g && g.candidates[0].signal === 'Discovery-led arrival', '[12b] partial signal parsed')
ok(g && g.candidates[0].confidence === 'high', '[12c] supplied confidence kept')
ok(g && g.candidates[0].evidence === null, '[12d] missing evidence stays null — not fabricated')
ok(g && g.candidates[0].status === null, '[12e] missing status stays null')
ok(g && g.candidates[0].suggestedDestination === null, '[12f] missing destination stays null')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
