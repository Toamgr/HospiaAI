#!/usr/bin/env node
/**
 * Static source guards for OwnerMeaningComposer (Owner Meaning Capture — Slice 4E, first WRITE UI).
 * No DB, no render, no network. Verifies, by reading the component source, that the owner-facing
 * answer composer obeys the slice boundaries:
 *   • OWNER-ONLY: gated on currentUser.role === 'owner'; renders null for any other/missing role;
 *   • it WRITES through exactly ONE existing route — POST /api/owner-meaning-captures — with a
 *     MINIMAL payload (concept_ref + owner_response_raw) and NO client venue_id and NO
 *     interpreted/confirmed-meaning field;
 *   • it reads only the existing GETs (interpreted candidates + captures list + single capture);
 *   • empty/whitespace submit is blocked; success clears the composer and refreshes the list;
 *   • it renders raw owner evidence (owner_response_raw); never labels anything confirmed Venue DNA;
 *   • NO approve/promote/apply-to-DNA/confirm affordance; NO mergeVenueDna / Venue DNA mutation;
 *   • it is mounted in OwnerAIHome after InterpretedCandidatesPanel, with the currentUser prop;
 *   • InterpretedCandidatesPanel's 4B read-only preview lock is untouched (composer is separate).
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-owner-meaning-capture-composer-ui.js
 *   (or: npm run test:owner-meaning-capture-composer-ui)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const COMPOSER_PATH = resolve(ROOT, 'src/features/owner-intelligence/OwnerMeaningComposer.jsx')
const HOME_PATH = resolve(ROOT, 'src/features/owner-intelligence/OwnerAIHome.jsx')
const PANEL_PATH = resolve(ROOT, 'src/features/owner-intelligence/InterpretedCandidatesPanel.jsx')

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

const src = readFileSync(COMPOSER_PATH, 'utf8')
const home = readFileSync(HOME_PATH, 'utf8')
const panel = readFileSync(PANEL_PATH, 'utf8')

// Visible copy: collapse JS string concatenation ('a ' + 'b' → 'a b').
const copy = src.replace(/'\s*\+\s*'/g, '')
// Comment-stripped source for "does not use X" guards.
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .map((line) => line.replace(/\/\/.*$/, ''))
  .join('\n')
// Comment-stripped visible copy (concatenation collapsed) — for product-claim word scans, so a
// guardrail doc-comment that names a forbidden word does not trip the check.
const visibleCopy = code.replace(/'\s*\+\s*'/g, '')

console.log('\nOwner Meaning Composer — write UI static guards\n')

// 1. OWNER-ONLY visibility.
ok(/currentUser\?\.role\s*===\s*'owner'/.test(code), '[1] gated on currentUser.role === "owner"')
ok(/if\s*\(\s*!isOwner\s*\)\s*return\s+null/.test(code), '[1b] renders null for any non-owner / missing role')

// 2. Exactly one write verb, to the existing capture POST, with a minimal safe payload.
const apiPostCount = (code.match(/apiPost\(/g) || []).length
ok(apiPostCount === 1, `[2] exactly one apiPost call (got ${apiPostCount})`)
ok(/apiPost\(\s*['"]\/api\/owner-meaning-captures['"]/.test(code), '[2b] the write targets POST /api/owner-meaning-captures')
for (const token of ['apiPut', 'apiPatch', 'apiDelete']) {
  ok(!code.includes(token), `[2c] no other write verb: ${token}`)
}
const payloadMatch = code.match(/apiPost\(\s*['"]\/api\/owner-meaning-captures['"]\s*,\s*\{([^}]*)\}/)
ok(!!payloadMatch, '[2d] POST payload is an inline object literal')
const payload = payloadMatch ? payloadMatch[1] : ''
ok(/concept_ref\s*:/.test(payload), '[2e] payload includes concept_ref')
ok(/owner_response_raw\s*:/.test(payload), '[2f] payload includes owner_response_raw (the raw answer)')
// Only those two keys — and none of the forbidden ones.
const payloadKeys = payload.split(',').map(s => s.split(':')[0].trim()).filter(Boolean)
ok(payloadKeys.length === 2, `[2g] payload carries exactly two keys (got ${payloadKeys.join('|') || 'none'})`)
for (const token of ['venue_id', 'venueId', 'captured_owner_meaning', 'confirmed', 'interpretation', 'meaning', 'eligible_for_future_proposal', 'proposed_dna_change', 'dna_target']) {
  ok(!payload.includes(token), `[2h] payload does NOT include forbidden/derived field: ${token}`)
}

// 3. Reads only the existing GET routes (no fabricated/extra data source).
ok(/apiGet\(\s*['"]\/api\/discovery-interpreted-candidates['"]\s*\)/.test(code), '[3] reads the live suggested questions (interpreted candidates GET)')
ok(/apiGet\(\s*['"]\/api\/owner-meaning-captures\?limit=\d+['"]\s*\)/.test(code), '[3b] reads the recent captures audit list (GET)')
ok(/apiGet\(\s*`\/api\/owner-meaning-captures\/\$\{encodeURIComponent\(captureId\)\}`\s*\)/.test(code), '[3c] reads a single capture + trail (GET :captureId)')

// 4. Empty/whitespace submit blocked; submit guarded.
ok(/answer\.trim\(\)\.length\s*>\s*0/.test(code), '[4] submit enabled only when the answer is non-empty/non-whitespace')
ok(/answer\.trim\(\)\.length\s*===\s*0/.test(code), '[4b] submit handler early-returns on an empty/whitespace answer')
ok(/canSubmit/.test(code), '[4c] a canSubmit gate governs the button')

// 5. Success clears the composer AFTER save and refreshes the recent captures list.
const postIdx = code.indexOf('apiPost(')
const setAnswerEmptyIdx = code.indexOf("setAnswer('')")
const reloadIdx = code.indexOf('loadCaptures()', postIdx)
ok(setAnswerEmptyIdx > postIdx, '[5] composer is cleared (setAnswer("")) only after the POST resolves')
ok(reloadIdx > postIdx, '[5b] recent captures are refreshed after a successful save')
ok(/Saved as owner evidence\./.test(src), '[5c] success state says "Saved as owner evidence."')
ok(/Nothing was changed/.test(src), '[5d] error state reassures nothing was changed')

// 6. Renders raw owner evidence; recent list reads from the endpoint only.
ok(/owner_response_raw/.test(code), '[6] renders the raw owner response (owner_response_raw)')
ok(/res\?\.captures/.test(code), '[6b] recent captures come only from the endpoint response')
ok(!/fabricat|sampleData|demoData|dummyData|fakeCapture|mockCapture/i.test(code), '[6c] no fabricated/sample/demo evidence in component logic')

// 7. Submit copy is evidence language — never a confirm/apply/promote/DNA control.
ok(/Save as owner evidence/.test(src), '[7] submit button reads "Save as owner evidence"')
for (const phrase of ['Apply to DNA', 'Update Venue DNA', 'Add to Venue DNA', 'Confirm meaning', 'Confirm as Venue DNA', 'Approve', 'Promote', 'Mark as confirmed']) {
  ok(!copy.includes(phrase), `[7b] forbidden control/label absent: "${phrase}"`)
}
for (const token of ['onConfirm', 'onApprove', 'onPromote', 'handleConfirm', 'handleApprove', 'handlePromote', 'applyToDna', 'updateVenueDna']) {
  ok(!code.includes(token), `[7c] no decision/DNA handler: ${token}`)
}

// 8. No Venue DNA mutation / no mergeVenueDna anywhere.
ok(!code.includes('mergeVenueDna'), '[8] no mergeVenueDna reference')
for (const token of ['venue_dna_json', 'venue_briefs', 'venue_dna_enrichment', 'venue_intelligence', '/api/venue-dna', 'venue-dna']) {
  ok(!code.includes(token), `[8b] no Venue DNA store/route reference: ${token}`)
}

// 9. No positive-claim "truth" vocabulary (these never appear even in legitimate negatives).
const lc = visibleCopy.toLowerCase()
for (const word of ['approved', 'promoted', 'canonical', 'verified', 'truth', 'readiness', 'final identity', 'learned this', 'venue dna updated', 'captured owner meaning', 'hestia knows']) {
  ok(!lc.includes(word), `[9] forbidden positive-claim absent: "${word}"`)
}
// The persisted-meaning tokens belong to the (forbidden) design vocabulary, never this UI.
for (const token of ['captured_owner_meaning', 'eligible_for_future_proposal']) {
  ok(!code.includes(token), `[9b] no forbidden persistence token: "${token}"`)
}

// 10. Honest framing + states present.
ok(/not confirmed Venue DNA|not be confirmed|nothing was confirmed/i.test(src) || /will not treat it as confirmed Venue DNA/.test(copy),
  '[10] framing states a saved answer is not confirmed Venue DNA')
ok(/No owner meaning question is ready yet\./.test(src), '[10b] honest empty state for no available question')
ok(/candLoading/.test(code), '[10c] loading state present')
ok(/candError/.test(code) && /submitError/.test(code), '[10d] error states present (load + submit)')

// 11. Mounted in OwnerAIHome AFTER InterpretedCandidatesPanel, with the currentUser prop.
ok(/import OwnerMeaningComposer from '\.\/OwnerMeaningComposer'/.test(home), '[11] OwnerAIHome imports the composer')
ok(/<OwnerMeaningComposer\s+currentUser=\{currentUser\}/.test(home), '[11b] composer is passed currentUser (owner gate)')
const icIdx = home.indexOf('<InterpretedCandidatesPanel')
const omcIdx = home.indexOf('<OwnerMeaningComposer')
ok(icIdx !== -1 && omcIdx !== -1 && omcIdx > icIdx, '[11c] mounted as a sibling AFTER InterpretedCandidatesPanel')

// 12. The 4B read-only preview lock on InterpretedCandidatesPanel is untouched (composer is separate).
const panelCode = panel.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n')
ok(!/<input|<textarea|<form|onSubmit|handleSubmit/.test(panelCode), '[12] InterpretedCandidatesPanel still has no composer affordance')
ok(!/apiPost|apiPut|apiPatch|apiDelete/.test(panelCode), '[12b] InterpretedCandidatesPanel still issues no write verb')
ok(/Read-only preview/.test(panel), '[12c] InterpretedCandidatesPanel read-only preview label still present')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
process.exit(failed > 0 ? 1 : 0)
