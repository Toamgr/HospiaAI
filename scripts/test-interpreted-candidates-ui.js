#!/usr/bin/env node
/**
 * Static source guards for InterpretedCandidatesPanel (EAE Slice 3D-B).
 * No DB, no render, no network. Verifies, by reading the component source, that the
 * owner-facing read-only Interpreted Candidates UI obeys the design doc
 * (docs/architecture/NEW_VENUE_DISCOVERY_INTERPRETED_CANDIDATES_UI_DESIGN.md):
 *   • it calls ONLY GET /api/discovery-interpreted-candidates (one read, no second fetch);
 *   • it makes NO mutation call and NO Venue DNA / mergeVenueDna contact;
 *   • it exposes NO confirm/approve/promote/edit decision control, for any role;
 *   • it uses NO score/percentage/readiness/meter/progress-bar language or markup;
 *   • the empty state is honest (no fabricated candidates / fake insights);
 *   • the four states (loading/empty/populated/error) exist; error says "Nothing was changed";
 *   • the endpoint note + limitations are rendered; the non-removable framing is present;
 *   • candidate fields render as cautious signals; destination_hint stays inert;
 *   • the panel is mounted in OwnerAIHome as a sibling after EvidenceSummaryPanel.
 *
 * Forbidden positive-claim words are checked against COMMENT-STRIPPED source, so a guardrail
 * comment that names a forbidden word (to forbid it) does not trip the check. Allowed negative
 * phrases ("not confirmed Venue DNA", "cannot self-confirm", "no confirmation action") are
 * stripped before the positive-claim scan.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-interpreted-candidates-ui.js
 *   (or: npm run test:interpreted-candidates-ui)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PANEL_PATH = resolve(ROOT, 'src/features/owner-intelligence/InterpretedCandidatesPanel.jsx')
const HOME_PATH = resolve(ROOT, 'src/features/owner-intelligence/OwnerAIHome.jsx')

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

const src = readFileSync(PANEL_PATH, 'utf8')
const home = readFileSync(HOME_PATH, 'utf8')

// Copy view: collapse JS string-literal concatenation ('a ' + 'b' → 'a b') so multi-line
// product copy can be matched as the single string the user actually sees.
const copy = src.replace(/'\s*\+\s*'/g, '')

// Comment-stripped source for "does not use X" guards (a guardrail comment that names a
// forbidden token must not trip a forbidden-token check).
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .map((line) => line.replace(/\/\/.*$/, ''))
  .join('\n')

console.log('\nInterpreted Candidates — read-only UI static guards\n')

// 1. Calls ONLY the Slice 3C read endpoint.
ok(/apiGet\(\s*['"]\/api\/discovery-interpreted-candidates['"]\s*\)/.test(code),
  '[1] panel calls GET /api/discovery-interpreted-candidates')
const apiGetCount = (code.match(/apiGet\(/g) || []).length
ok(apiGetCount === 1, `[1b] exactly one apiGet call (got ${apiGetCount})`)
ok(!code.includes('/api/discovery-evidence-summary'), '[1c] does not call the evidence-summary route')
ok(!code.includes('/api/discovery-concept-drafts'), '[1d] does not call the concept-drafts route')
ok(!/\/candidates\b/.test(code.replace('/discovery-interpreted-candidates', '')), '[1e] does not call candidate review/mutation routes')

// 2. No mutation helpers / no raw fetch with a non-GET method.
for (const token of ['apiPost', 'apiPut', 'apiPatch', 'apiDelete']) {
  ok(!code.includes(token), `[2] does not use ${token}`)
}
ok(!/fetch\s*\(/.test(code), '[2b] does not use a raw fetch() call')
ok(!/method\s*:\s*['"](POST|PUT|PATCH|DELETE)['"]/i.test(code), '[2c] no non-GET HTTP method specified')

// 3. No Venue DNA endpoint / store reference.
for (const token of ['venue_dna_json', 'venue_briefs', 'venue_dna_enrichment', 'venue_intelligence', '/api/venue-dna', 'venue-dna']) {
  ok(!code.includes(token), `[3] no Venue DNA reference: ${token}`)
}

// 4. No mergeVenueDna reference.
ok(!code.includes('mergeVenueDna'), '[4] no mergeVenueDna reference')

// 5. No confirm/approve/promote/canonical positive-action control.
//    (onConfirm/onApprove/onPromote handlers, or such words in button/control context.)
for (const token of ['onConfirm', 'onApprove', 'onPromote', 'handleConfirm', 'handleApprove', 'handlePromote']) {
  ok(!code.includes(token), `[5] no decision handler: ${token}`)
}
// The only buttons present are Retry (a re-GET). No other <button> may exist.
const buttonCount = (code.match(/<button/g) || []).length
ok(buttonCount === 1, `[5b] exactly one <button> (Retry only) (got ${buttonCount})`)
ok(/onClick=\{loadCandidates\}/.test(code), '[5c] the only button re-issues the same GET (loadCandidates)')
// No answer/submit input for the owner question.
ok(!/<input|<textarea|<form|onSubmit/.test(code), '[5d] no input/textarea/form/onSubmit (display-only owner question)')

// 6. No score/percentage/readiness/meter/progress-bar language or markup.
//    Scan the COMMENT-STRIPPED source (so a guardrail comment naming a forbidden word does not
//    trip the check), as the visible-copy positive claim. Strip allowed negatives first.
const positive = code.toLowerCase()
  .replace(/not confirmed venue dna/g, '')
  .replace(/cannot self-confirm/g, '')
  .replace(/never self-confirm[s]?/g, '')
  .replace(/no confirmation\b/g, '')
  .replace(/confirmation action/g, '')
  .replace(/ever confirms venue dna/g, '')
  .replace(/a human ever confirms/g, '')
// Positive-claim forbidden words (must not be used as a product claim).
for (const word of ['confirmed', 'approved', 'canonical', 'promoted', 'verified', 'dna-ready', 'truth', 'readiness', 'percentage', 'hestia knows', 'final identity']) {
  ok(!positive.includes(word), `[6] forbidden positive-claim word absent: "${word}"`)
}
// No score-as-confidence, no percentage symbol, no meter/bar/gauge/ring markup.
ok(!/\bscore\b/i.test(positive), '[6b] no "score" language')
ok(!/%/.test(src), '[6c] no percent symbol in source')
ok(!/progress|<meter|role=['"]progressbar['"]|gauge|donut|\bring\b/i.test(code), '[6d] no progress/meter/gauge/ring markup')

// 7. Empty state is honest — no fabricated data.
ok(/No interpreted candidates yet\./.test(src), '[7] honest empty-state line present')
ok(/only raises a candidate when your reviewed evidence creates/i.test(src),
  '[7b] empty state explains candidates appear only from contradiction/missing-data signals')
ok(!/fabricat|sample|demo|placeholder|fakeCandidate|dummy/i.test(code), '[7c] no fabricated/sample/demo data in component logic')
// Candidates come only from the endpoint response (state initialised null, set from res.candidates).
ok(/res\?\.candidates/.test(code), '[7d] candidates come only from the endpoint response')

// 8. Renders endpoint note + limitations + the non-removable framing.
ok(/\{note\}/.test(code), '[8] renders the endpoint note')
ok(/limitations\.map/.test(code), '[8b] renders the endpoint limitations list')
ok(/FRAMING_LINE/.test(code) && /not confirmed Venue DNA/.test(src), '[8c] non-removable framing present (not confirmed Venue DNA)')
ok(/HESTIA cannot confirm/i.test(src) || /cannot confirm\b/i.test(src), '[8d] framing states HESTIA cannot self-confirm')
ok(/Contradictions and missing data are preserved/i.test(copy), '[8e] framing states contradictions + missing data preserved')
ok(/no confirmation\s+action/i.test(copy), '[8f] framing states no confirmation action exists')

// 9. Candidate types/fields are displayed as cautious signals.
ok(/Contradiction found/.test(src) && /Missing evidence/.test(src), '[9] both real candidate types have neutral textual badges')
ok(/contradiction_signal/.test(src) && /missing_data_signal/.test(src), '[9b] handles exactly the two real candidate types')
ok(!/positioning_signal|service_style_signal|guest_experience_signal|menu_or_bar_identity_signal|operational_constraint_signal|founder_intent_signal/.test(src),
  '[9c] no themed classification expansion')
for (const field of ['interpretation_title', 'interpretation_summary', 'supporting_evidence_refs', 'conflicting_evidence_refs', 'missing_evidence', 'confidence_band', 'uncertainty_notes', 'suggested_owner_question', 'status']) {
  ok(src.includes(field), `[9d] renders candidate field: ${field}`)
}
ok(/preserved, not resolved/i.test(src), '[9e] conflicting evidence framed as preserved, not resolved')
ok(/HESTIA would ask:/.test(src), '[9f] suggested_owner_question shown display-only ("HESTIA would ask:")')
// Confidence rendered as a word, never a number/meter.
ok(/evidence strength/i.test(src), '[9g] confidence rendered as textual evidence strength')
ok(/not captured/.test(src), '[9h] null confidence renders "not captured" (never defaulted to low)')

// 10. destination_hint stays inert (rendered only if present; non-interactive; attention-only framing).
ok(/c\.destination_hint\s*&&/.test(code), '[10] destination_hint rendered only when present')
ok(/owner attention only, not Venue DNA/i.test(src), '[10b] destination_hint framed as inert owner-attention only')

// 11. Four states present.
ok(/loading &&/.test(code), '[11] loading state present')
ok(/error &&/.test(code), '[11b] error state present')
ok(/count === 0/.test(code), '[11c] empty state present')
ok(/count > 0/.test(code), '[11d] populated state present')
ok(/Nothing was changed\./.test(src), '[11e] error copy reassures "Nothing was changed."')

// 12. Collapsed-by-default + mounted in OwnerAIHome after EvidenceSummaryPanel.
ok(/<details\b/.test(src) && !/<details[^>]*\bopen\b/.test(src), '[12] panel uses a <details> collapsed by default')
ok(/import InterpretedCandidatesPanel from '\.\/InterpretedCandidatesPanel'/.test(home), '[12b] OwnerAIHome imports the panel')
const evIdx = home.indexOf('<EvidenceSummaryPanel')
const icIdx = home.indexOf('<InterpretedCandidatesPanel')
ok(evIdx !== -1 && icIdx !== -1 && icIdx > evIdx, '[12c] mounted as a sibling AFTER EvidenceSummaryPanel')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
process.exit(failed > 0 ? 1 : 0)
