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

// 12. Beverage-development routing doctrine — deep cocktail R&D is handed to Bar
//     Intelligence rather than answered with a shallow generic cocktail list.
ok(/BEVERAGE DEVELOPMENT/i.test(prompt), '[12] prompt encodes a BEVERAGE DEVELOPMENT routing doctrine')
ok(/Bar Intelligence/i.test(prompt), '[12b] doctrine names Bar Intelligence as the specialist owner')
ok(/Bar Intelligence Handoff Brief/i.test(prompt), '[12c] doctrine produces a Bar Intelligence Handoff Brief')
ok(/will NOT treat untested preparations as final/i.test(prompt),
  '[12d] doctrine refuses to treat untested preparations as final truth')
ok(/preliminary concept slots|not final recipes or approved preparations/i.test(prompt),
  '[12e] cocktail ideas labelled preliminary concept slots, not final/approved recipes')
for (const name of ['Savory Delight', 'Spicy Elixir', 'Sweet Symphony']) {
  ok(prompt.includes(name), `[12f] doctrine names the shallow generic cocktail "${name}" to avoid`)
}
ok(/keep the Working Venue DNA draft SEPARATE/i.test(prompt),
  '[12g] doctrine keeps the Venue DNA draft separate from beverage R&D')

// 13. Beverage-development directive + composer exist and override the explicit-brief
//     cocktail-forcing path (output contract only — no schema/auth/merge change).
ok(/const\s+VENUE_INTELLIGENCE_BEVERAGE_DEVELOPMENT_DIRECTIVE\s*=/.test(src),
  '[13] beverage-development directive constant defined')
ok(/function composeBeverageDevelopmentInstruction/.test(src),
  '[13b] composeBeverageDevelopmentInstruction defined')
ok(/Leave the JSON "cocktailConcepts" array EMPTY/i.test(src),
  '[13c] beverage directive leaves the structured cocktail array empty (no forced list)')

// 14. Synthesize-before-interviewing doctrine — after enough concept signal, a
//     "normal night" / "show me the experience" prompt produces a synthesized Working
//     Draft instead of handing the synthesis back to the owner.
ok(/SYNTHESIZE BEFORE INTERVIEWING/i.test(prompt), '[14] prompt encodes a SYNTHESIZE BEFORE INTERVIEWING doctrine')
ok(/how does this play out on a normal night|normal night/i.test(prompt),
  '[14b] doctrine recognizes the normal-night render request')
ok(/Working Draft — not yet confirmed/.test(prompt),
  '[14c] doctrine labels the output a Working Draft — not yet confirmed')
ok(/NEVER reply "Tell me more about how that plays out on a normal night"|hands the synthesis back to the owner/i.test(prompt),
  '[14d] doctrine forbids the weak "tell me more" hand-back pattern')
ok(/Correct me where this feels wrong/.test(prompt),
  '[14e] doctrine ends with the correction invitation')
for (const beat of ['arrival', 'first impression', 'seating', 'service rhythm', 'cocktail role', 'food role', 'guest behavior', 'staff behavior', 'what the room must protect', 'what would signal success']) {
  ok(new RegExp(beat.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'), 'i').test(prompt),
    `[14f] doctrine walks the normal night through "${beat}"`)
}
ok(/never invent hard operational facts|exact capacity, prices, specific menu items/i.test(prompt),
  '[14g] doctrine forbids inventing hard operational facts')
ok(/Do NOT over-focus on cocktails|ONE line among many/i.test(prompt),
  '[14h] doctrine forbids over-focusing on cocktails')

// 15. Synthesis directive + composer exist (output-only; no schema/auth/merge change).
ok(/const\s+VENUE_INTELLIGENCE_NORMAL_NIGHT_SYNTHESIS_DIRECTIVE\s*=/.test(src),
  '[15] normal-night synthesis directive constant defined')
ok(/function composeNormalNightSynthesisInstruction/.test(src),
  '[15b] composeNormalNightSynthesisInstruction defined')
ok(/Leave the JSON "cocktailConcepts" array EMPTY/i.test(src),
  '[15c] synthesis directive leaves the structured cocktail array empty (no forced list)')
// The weak fallback string must no longer appear anywhere in the route.
ok(!/Tell me a little more about how that plays out on a normal night/.test(src),
  '[15d] the weak "tell me a little more…" fallback was removed from server.js')

// 16. Founder Brief v0.1 doctrine — after enough concept signal, a Founder Brief request
//     produces a structured 15-section brief, never a one-line fallback.
ok(/FOUNDER BRIEF v0\.1/i.test(prompt), '[16] prompt encodes a FOUNDER BRIEF v0.1 doctrine')
ok(/stop discovery|stop the discovery flow/i.test(prompt), '[16b] doctrine recognizes the stop-discovery request')
ok(/Working Draft — not yet confirmed/.test(prompt), '[16c] doctrine heads the brief Working Draft — not yet confirmed')
ok(/NEVER collapse to a one-line "working read"|never collapse to a one-line/i.test(prompt),
  '[16d] doctrine forbids collapsing to a one-line working read')
ok(/Correct me where this feels wrong/.test(prompt), '[16e] doctrine ends only with the correction invitation')
ok(/no closing question|no closing question\.|End ONLY with/i.test(prompt), '[16f] doctrine forbids a closing question on a full brief')
for (const sec of ['One-sentence concept', 'Founder intent', 'Emotional promise', 'Guest world', 'Primary occasions', 'Service philosophy', 'Spatial atmosphere', 'Beverage role', 'Food role', 'What the venue must protect', 'What the venue must never become', 'Early operational implications', 'Early risks or contradictions', 'What is already strong', 'What still needs decision']) {
  ok(prompt.includes(sec), `[16g] doctrine names the founder-brief section "${sec}"`)
}
ok(/premium hospitality voice, not SaaS onboarding|not SaaS onboarding/i.test(prompt),
  '[16h] doctrine demands premium hospitality voice, not SaaS onboarding')
ok(/major anchor when present, but NOT automatically the entire identity/i.test(prompt),
  '[16i] doctrine keeps the cocktail programme an anchor, not the whole identity')
ok(/If too little concept has been shared/i.test(prompt),
  '[16j] doctrine handles the not-enough case without an empty fallback')

// 17. Founder Brief directives + composer + deterministic backstops exist.
ok(/const\s+VENUE_INTELLIGENCE_FOUNDER_BRIEF_DIRECTIVE\s*=/.test(src),
  '[17] founder-brief directive constant defined')
ok(/const\s+VENUE_INTELLIGENCE_FOUNDER_BRIEF_INSUFFICIENT_DIRECTIVE\s*=/.test(src),
  '[17b] founder-brief "not enough yet" directive defined')
ok(/function composeFounderBriefInstruction/.test(src), '[17c] composeFounderBriefInstruction defined')
ok(/function looksLikeFounderBrief/.test(src) && /function founderBriefCouldNotGenerate/.test(src) && /function founderBriefNotEnoughYet/.test(src),
  '[17d] deterministic founder-brief backstops defined (no one-line placeholder)')

// 18. Founder Brief section fidelity — sections 10 ("What the venue must protect") and
//     11 ("What the venue must never become") must be kept DISTINCT, never merged.
ok(/Sections 10 and 11 are DISTINCT and must NEVER be merged/i.test(prompt),
  '[18] founder-brief doctrine keeps protect vs never-become distinct')
ok(/const\s+VENUE_INTELLIGENCE_FOUNDER_BRIEF_DIRECTIVE\s*=/.test(src) &&
   /Section 10 \("What the venue must protect"\) and section 11 \("What the venue must never become"\) are TWO SEPARATE sections/i.test(src),
  '[18b] founder-brief directive spells out the two-section distinction')

// 19. Owner Correction Loop doctrine — after the Founder Brief, help the owner correct,
//     do not continue discovery, surface candidate Venue DNA signals (candidates only).
ok(/OWNER CORRECTION LOOP/i.test(prompt), '[19] prompt encodes an OWNER CORRECTION LOOP doctrine')
ok(/do not continue discovery|DO NOT continue discovery/i.test(prompt),
  '[19b] doctrine forbids continuing discovery')
ok(/Working Draft — not yet confirmed/.test(prompt), '[19c] doctrine heads the loop Working Draft — not yet confirmed')
ok(/Tell me only what feels wrong, too strong, or missing/.test(prompt),
  '[19d] doctrine ends with the correction-loop closing line')
for (const bucket of ['Feels accurate', 'Feels promising but still unconfirmed', 'Feels too strong / too early', 'Needs owner decision', 'Should be softened before becoming Venue DNA', 'Candidate Venue DNA signals', 'Not ready for Venue DNA yet']) {
  ok(prompt.includes(bucket), `[19e] doctrine names the correction bucket "${bucket}"`)
}
ok(/Candidate signals are CANDIDATES ONLY|CANDIDATES ONLY/i.test(prompt),
  '[19f] doctrine states candidate signals are candidates only (never confirmed)')
for (const field of ['signal', 'evidence', 'confidence', 'status', 'suggested destination']) {
  ok(new RegExp(field, 'i').test(prompt), `[19g] doctrine names candidate field "${field}"`)
}
ok(/two DISTINCT lines: "What the venue must protect" and "What the venue must never become"|"What the venue must protect" and "What the venue must never become" — never merge/i.test(prompt),
  '[19h] doctrine keeps protect vs never-become distinct in the loop')
ok(/do not (treat the Founder Brief as confirmed Venue DNA|ask a long list of questions)/i.test(prompt),
  '[19i] doctrine forbids treating the brief as confirmed DNA / a long question list')

// 20. Owner Correction Loop directives + composer + deterministic backstops exist.
ok(/const\s+VENUE_INTELLIGENCE_OWNER_CORRECTION_LOOP_DIRECTIVE\s*=/.test(src),
  '[20] owner-correction-loop directive constant defined')
ok(/const\s+VENUE_INTELLIGENCE_OWNER_CORRECTION_LOOP_INSUFFICIENT_DIRECTIVE\s*=/.test(src),
  '[20b] owner-correction-loop "not enough yet" directive defined')
ok(/function composeOwnerCorrectionLoopInstruction/.test(src), '[20c] composeOwnerCorrectionLoopInstruction defined')
ok(/function looksLikeOwnerCorrectionLoop/.test(src) && /function ownerCorrectionLoopCouldNotGenerate/.test(src) && /function ownerCorrectionLoopNotEnoughYet/.test(src) && /function ensureCorrectionLoopClosing/.test(src),
  '[20d] deterministic correction-loop backstops defined (no one-line placeholder)')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
