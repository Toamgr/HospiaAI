#!/usr/bin/env node
/**
 * Static checks for Venue Intelligence chat quality (Phase 9E-2).
 *
 * Verifies, by reading server.js, that the Venue Intelligence system instruction
 * (buildVenueIntelligenceSystemInstruction) encodes the Venue-DNA-builder contract:
 *   • mission awareness; answer direct status questions first;
 *   • produce a Working Venue DNA Draft once a threshold of areas is known;
 *   • at most one focused question; forbid completion/confirmation language;
 *   • never infer a venue name from the owner's name;
 *   • distinguish working signals → draft → owner-confirmed DNA;
 *   • response shape unchanged (no backend schema break).
 *
 * No DB, no server boot, no network, no AI. Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-venue-intelligence-chat-quality.js
 *   (or: npm run test:venue-intelligence-chat-quality)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SERVER_PATH = resolve(ROOT, 'server.js')

let passed = 0
let failed = 0
function ok(cond, msg) {
  if (cond) { passed++ }
  else { failed++; console.error(`  [FAIL] ${msg}`) }
}

const src = readFileSync(SERVER_PATH, 'utf8')

// Isolate the system-instruction builder so the contract checks target the prompt.
const fnIdx = src.indexOf('function buildVenueIntelligenceSystemInstruction')
ok(fnIdx !== -1, 'buildVenueIntelligenceSystemInstruction exists')
const after = src.slice(fnIdx)
const nextFnRel = after.slice(1).search(/\nasync function |\nfunction /)
const prompt = nextFnRel === -1 ? after : after.slice(0, nextFnRel + 1)

console.log('\nVenue Intelligence chat quality — static prompt contract\n')

// 1. Mission awareness — HESTIA knows it is the Venue DNA builder.
ok(/Venue DNA builder/i.test(prompt), '[1] prompt states the Venue DNA builder mission')
ok(/MISSION/.test(prompt), '[1b] explicit MISSION section present')

// 2. Direct status questions answered first, never dodged.
ok(/DIRECT STATUS QUESTIONS/i.test(prompt), '[2] direct-status-question handling section present')
ok(/answer it directly|answer first|answer.*in the first sentence/i.test(prompt), '[2b] instructs to answer directly first')
ok(/when will I get the DNA|give me the DNA|how many more questions/i.test(prompt), '[2c] recognizes owner status questions')

// 3. Working draft behavior + format.
ok(/Working Venue DNA Draft/i.test(prompt), '[3] Working Venue DNA Draft behavior present')
ok(/not yet confirmed/i.test(prompt), '[3b] draft labelled "not yet confirmed"')
ok(/Still Missing Before Confirmation/i.test(prompt), '[3c] draft includes a still-missing section')
ok(/Next Best Question/i.test(prompt), '[3d] draft includes a single next-best-question section')

// 4. Draft threshold rule — produce once enough areas are known; stop endless interview.
ok(/DRAFT THRESHOLD/i.test(prompt), '[4] draft threshold rule present')
ok(/Do not (wait for every dimension|keep interviewing)/i.test(prompt), '[4b] stops endless questioning at threshold')

// 5. One-question discipline.
ok(/at most one|at most ONE/i.test(prompt), '[5] at-most-one-question discipline present')
ok(/QUESTION DISCIPLINE/i.test(prompt), '[5b] explicit question-discipline section')
// Discourages the observed generic questions.
ok(/What feedback have you received|What challenges have you faced|operational challenges are most pressing/i.test(prompt),
  '[5c] names the generic questions to avoid')

// 6. No completion/confirmation language without confirmation architecture.
ok(/FORBIDDEN COMPLETION LANGUAGE/i.test(prompt), '[6] forbidden-completion-language section present')
for (const phrase of ['completed DNA', 'final DNA', 'confirmed DNA', 'Full Intelligence Mode']) {
  ok(prompt.includes(phrase), `[6b] prompt explicitly forbids "${phrase}"`)
}
ok(/never say|Never claim|Forbidden|do not (say|claim)/i.test(prompt), '[6c] framed as a prohibition')

// 7. Signals vs draft vs owner-confirmed distinction.
ok(/working signals.*draft.*owner-confirmed|signals → draft|owner-confirmed Venue DNA/i.test(prompt),
  '[7] distinguishes working signals → draft → owner-confirmed DNA')

// 8. Venue name not inferred from the owner/user name.
ok(/VENUE NAME RULE/i.test(prompt), '[8] venue-name rule present')
ok(/never derive a venue name from the owner|do not state a venue name unless/i.test(prompt),
  '[8b] forbids inferring the venue name from a person')
ok(/this cocktail bar|"the venue"|'the venue'/i.test(prompt), '[8c] provides a safe fallback name')

// 9. No fabrication / no invented numbers or KPIs (pre-existing guardrail retained).
ok(/no invented numbers or KPIs|never invent (facts|a number)/i.test(prompt), '[9] anti-fabrication guardrail retained')

// 10. Response shape unchanged — no backend schema break (existing keys intact).
for (const key of ['"reply"', '"stage"', '"objective"', '"venueDNA"', '"focusSuggestions"']) {
  ok(prompt.includes(key), `[10] response shape still includes ${key}`)
}

// 11. The route still uses this instruction and mergeVenueDna (writer untouched).
ok(/buildVenueIntelligenceSystemInstruction\(state\)/.test(src), '[11] route builds the instruction from session state')
ok(/mergeVenueDna\(state\.venueDNA, ai\.venueDNA\)/.test(src), '[11b] message route still merges via mergeVenueDna (unchanged)')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
