#!/usr/bin/env node
/**
 * Venue Intelligence — explicit-brief + concept-exploration guard (P1 fix).
 *
 * Two layers, no DB / no server boot / no network / no AI:
 *
 *  PART A — unit tests of the pure classifier
 *    src/services/venueIntelligence/venueIntelligenceIntent.js
 *    Verifies that concept exploration ("a new place inspired by …") is NOT merged
 *    into canonical Venue DNA, that an explicit current-venue update IS merged, and
 *    that ordinary discovery still merges.
 *
 *  PART B — static source assertions on server.js
 *    Verifies the message handler routes the canonical-DNA write through the guard,
 *    keeps mergeVenueDna as the single writer, and that the system instruction now
 *    encodes the explicit-brief deliverables + exploration-isolation rules — without
 *    breaking the safety invariants other VI tests rely on.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-venue-intelligence-intent.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import {
  classifyVenueIntelligenceIntent,
  VENUE_INTELLIGENCE_INTENT_MODES,
} from '../src/services/venueIntelligence/venueIntelligenceIntent.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SERVER_PATH = resolve(ROOT, 'server.js')

let passed = 0
let failed = 0
function ok(cond, msg) {
  if (cond) { passed++ }
  else { failed++; console.error(`  [FAIL] ${msg}`) }
}

console.log('\nVenue Intelligence intent guard — deterministic tests\n')

// ── PART A — classifier unit tests ───────────────────────────────────────────

// The exact QA Paradiso/SIPS brief (Hebrew): new concept + explicit deliverables.
const PARADISO = 'אני רוצה לבנות מקום חדש בהשראת התחושה של Paradiso Barcelona ו-SIPS Barcelona, אבל לא להעתיק אותם. תעזור לי לבנות Venue DNA ראשוני, בריף קונספט, קווי שירות, סגנון תפריט קוקטיילים, 6 קוקטיילים מקוריים, וסיכונים תפעוליים.'
const paradiso = classifyVenueIntelligenceIntent(PARADISO)
ok(paradiso.isExploration === true, '[A1] Paradiso brief is detected as concept exploration')
ok(paradiso.isExplicitBrief === true, '[A2] Paradiso brief is detected as an explicit artifact request')
ok(paradiso.mergeIntoCanonicalDna === false, '[A3] Paradiso brief is NOT merged into canonical Venue DNA')
ok(paradiso.mode === VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION, '[A4] Paradiso brief mode = concept_exploration')

// English exploration variants — all must withhold the canonical write.
for (const msg of [
  'I want to build a new place inspired by a hidden speakeasy, very immersive',
  'Imagine a new bar concept, in the spirit of a theatrical cocktail lab',
  'Can we use Paradiso as a benchmark for a new venue?',
  'what if we opened a new spot from scratch',
]) {
  const r = classifyVenueIntelligenceIntent(msg)
  ok(r.mergeIntoCanonicalDna === false, `[A5] exploration withholds canonical merge: "${msg.slice(0, 38)}…"`)
}

// Ordinary current-venue discovery — must STILL merge (no regression).
for (const msg of [
  'We never say no to a guest directly, we always offer an alternative.',
  'My team struggles to stay consistent on busy Friday nights.',
  'Our regulars come for the intimacy and the jazz early in the evening.',
  'The cocktail program leans on fresh citrus and low-ABV aperitivo serves.',
]) {
  const r = classifyVenueIntelligenceIntent(msg)
  ok(r.mergeIntoCanonicalDna === true, `[A6] discovery still merges: "${msg.slice(0, 38)}…"`)
  ok(r.mode === VENUE_INTELLIGENCE_INTENT_MODES.CURRENT_VENUE, `[A6b] discovery mode = current_venue: "${msg.slice(0, 24)}…"`)
}

// Exploration explicitly tied to the current venue — override allows the merge.
const tied = classifyVenueIntelligenceIntent('I want to evolve my venue with a new concept inspired by Paradiso — update my venue DNA with this direction.')
ok(tied.isExploration === true, '[A7] exploration cue still detected when tied to current venue')
ok(tied.wantsCurrentVenueUpdate === true, '[A7b] explicit current-venue update detected')
ok(tied.mergeIntoCanonicalDna === true, '[A7c] explicit "update my venue" overrides the exploration guard')

// Empty / junk input must be safe (default: current-venue, merge true — no crash).
for (const msg of ['', null, undefined, '   ']) {
  const r = classifyVenueIntelligenceIntent(msg)
  ok(r && r.mergeIntoCanonicalDna === true, `[A8] empty input is safe and defaults to merge (${JSON.stringify(msg)})`)
}

// ── PART B — static source assertions on server.js ───────────────────────────

const src = readFileSync(SERVER_PATH, 'utf8')

// Import + usage wired.
ok(/classifyVenueIntelligenceIntent/.test(src), '[B1] server imports/uses classifyVenueIntelligenceIntent')
ok(/from\s+["']\.\/src\/services\/venueIntelligence\/venueIntelligenceIntent\.js["']/.test(src),
  '[B1b] classifier imported from the pure module')

// Isolate the message handler body.
const startIdx = src.indexOf("app.post('/api/venue-intelligence/message'")
ok(startIdx !== -1, '[B2] message handler located')
const after = src.slice(startIdx + 1)
const nextRel = after.search(/app\.(get|post|put|patch|delete)\(/)
const handler = nextRel === -1 ? src.slice(startIdx) : src.slice(startIdx, startIdx + 1 + nextRel)

// The single sanctioned writer is still called (invariant other tests rely on).
ok(/mergeVenueDna\(state\.venueDNA, ai\.venueDNA\)/.test(handler),
  '[B3] handler still computes mergeVenueDna(state.venueDNA, ai.venueDNA)')
// The canonical write is gated by the intent guard.
ok(/intent\s*=\s*classifyVenueIntelligenceIntent\(message\)/.test(handler),
  '[B4] handler classifies the owner message intent')
ok(/intent\.mergeIntoCanonicalDna\s*\?/.test(handler),
  '[B5] the persisted venueDNA is gated by intent.mergeIntoCanonicalDna')

// Deterministic explicit-brief reinforcement: on an explicit-brief turn the handler
// appends a forceful directive to the system instruction before calling the model.
ok(/const\s+VENUE_INTELLIGENCE_EXPLICIT_BRIEF_DIRECTIVE\s*=/.test(src),
  '[B5a] explicit-brief directive constant is defined')
ok(/composeExplicitBriefInstruction\(\s*\n?\s*buildVenueIntelligenceSystemInstruction\(state\),\s*intent\.isExplicitBrief\)/.test(handler),
  '[B5b] handler composes the instruction via intent-aware composeExplicitBriefInstruction')
ok(/function composeExplicitBriefInstruction/.test(src),
  '[B5b2] composeExplicitBriefInstruction is defined')
// On explicit-brief turns the competing 9-section template is removed and the
// directive appended; on ordinary turns the template is kept (only sentinels stripped).
ok(/NINE_SECTION_DRAFT_BLOCK/.test(src) && /\.replace\(NINE_SECTION_DRAFT_BLOCK, ''\)/.test(src),
  '[B5b3] composer strips the 9-section template block on explicit-brief turns')
ok(/\[\[NINE_SECTION_DRAFT\]\]/.test(src) && /\[\[\/NINE_SECTION_DRAFT\]\]/.test(src),
  '[B5b4] 9-section template is wrapped in strip sentinels in the prompt')
ok(/\+ VENUE_INTELLIGENCE_EXPLICIT_BRIEF_DIRECTIVE/.test(src),
  '[B5b5] directive is appended on explicit-brief turns')
ok(/AT LEAST 6 original cocktail concepts/i.test(src) && /Do NOT place them under "Still Missing"/i.test(src),
  '[B5c] directive forces >=6 cocktails and forbids deferring them to Still Missing')
// buildVenueIntelligenceSystemInstruction(state) call shape preserved (other tests rely on it).
ok(/buildVenueIntelligenceSystemInstruction\(state\)/.test(handler),
  '[B5d] handler still builds the instruction from buildVenueIntelligenceSystemInstruction(state)')

// Structured cocktailConcepts response field + deterministic backstop composition.
ok(/"cocktailConcepts"/.test(src) && /RULES FOR cocktailConcepts/.test(src),
  '[B5e] JSON schema defines a structured cocktailConcepts array + rules')
ok(/function ensureCocktailConceptsInReply/.test(src) && /function formatCocktailConceptLine/.test(src),
  '[B5f] deterministic cocktail-composition helpers exist')
ok(/intent\.isExplicitBrief\)\s*reply\s*=\s*ensureCocktailConceptsInReply\(reply,\s*ai\.cocktailConcepts\)/.test(handler),
  '[B5g] handler surfaces cocktail concepts into the reply on explicit-brief turns')
// The backstop never fabricates: it returns the reply unchanged when the array is empty.
ok(/if \(lines\.length === 0\) return reply/.test(src),
  '[B5h] backstop no-ops (no fabrication) when no concepts were produced')

// Safety invariants preserved inside the handler.
ok(!/['"]confirmed['"]/.test(handler), '[B6] handler writes no confirmed-DNA tier literal')
ok(!/\bDELETE\b/.test(handler), '[B6b] handler performs no DELETE')
ok(!/unlock_readiness/.test(handler) && !/Full Intelligence Mode/i.test(handler),
  '[B6c] handler does not touch Full Intelligence Mode / unlock')

// System instruction now encodes the explicit-brief deliverables.
const fnIdx = src.indexOf('function buildVenueIntelligenceSystemInstruction')
const promptAfter = src.slice(fnIdx)
const nextFnRel = promptAfter.slice(1).search(/\nasync function |\nfunction /)
const prompt = nextFnRel === -1 ? promptAfter : promptAfter.slice(0, nextFnRel + 1)

ok(/EXPLICIT BRIEF/.test(prompt), '[B7] prompt has an EXPLICIT BRIEF deliverables rule')
ok(/never reply with only questions|Do NOT respond with only clarifying questions/i.test(prompt),
  '[B7b] explicit-brief rule forbids questions-only replies')
ok(/6 original cocktail concepts/i.test(prompt), '[B7c] explicit-brief rule asks for 6 original cocktail concepts')
ok(/NEVER copy any real venue/i.test(prompt), '[B7d] forbids copying real venues recipes/brand language')
ok(/Operational risks/i.test(prompt), '[B7e] explicit-brief rule includes operational risks')
ok(/What is NOT yet confirmed Venue DNA/i.test(prompt), '[B7f] explicit-brief rule labels not-yet-confirmed')
ok(/Next best question — exactly ONE/i.test(prompt), '[B7g] explicit-brief rule keeps one next-best question')

// Explicit-brief OUTPUT CONTRACT — the quality gap: requested artifacts must be
// produced now, at least six cocktail concepts, never deferred to "still missing".
ok(/AT LEAST 6 original cocktail concepts/i.test(prompt),
  '[B7h] explicit-brief rule requires AT LEAST 6 cocktail concepts')
ok(/you MUST invent at least six/i.test(prompt),
  '[B7i] explicit-brief rule forces six concepts even when info is missing')
ok(/takes PRECEDENCE/i.test(prompt),
  '[B7j] explicit-brief format takes precedence over the generic 9-section draft')
ok(/NEVER move a requested artifact into a "still missing"|never (used as a reason )?to withhold/i.test(prompt),
  '[B7k] requested artifacts are never deferred to a still-missing/next-steps list')
ok(/Missing venue information must NEVER be used as a reason to withhold/i.test(prompt),
  '[B7l] missing venue info must not block first-pass artifacts')
ok(/ARTIFACTS VS VENUE FACTS/i.test(prompt),
  '[B7m] prompt separates creative deliverables from venue facts')
// Per-cocktail attributes requested (flavor / glass / service / difficulty).
for (const attr of ['flavor direction', 'glass / serve style', 'one-line service idea', 'difficulty']) {
  ok(new RegExp(attr.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&'), 'i').test(prompt),
    `[B7n] each cocktail concept asks for "${attr}"`)
}
// The 9-section generic draft must explicitly defer to the explicit-brief format.
ok(/use the EXPLICIT BRIEF format below instead|overrides this one/i.test(prompt),
  '[B7o] generic 9-section draft defers to the explicit-brief format on deliverable requests')

// System instruction encodes the concept-exploration isolation rule.
ok(/CONCEPT EXPLORATION vs THIS VENUE/.test(prompt), '[B8] prompt distinguishes exploration vs this venue')
ok(/EXPLORATION \/ DRAFT only/i.test(prompt), '[B8b] exploration is labelled draft-only')
ok(/Paradiso or SIPS/i.test(prompt), '[B8c] names Paradiso/SIPS as inspiration-only')

// Pre-existing draft-label invariant retained.
ok(/not yet confirmed/i.test(prompt), '[B9] "not yet confirmed" labelling retained')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
