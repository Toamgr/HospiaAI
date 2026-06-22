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
// The canonical write is gated by the intent guard, with conversation context so a
// concept-exploration thread stays protected across continuation turns.
ok(/intent\s*=\s*classifyVenueIntelligenceIntent\(message,\s*\{\s*recentMessages:\s*state\.messages\s*\}\)/.test(handler),
  '[B4] handler classifies the owner message intent with recent conversation context')
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
ok(/intent\.isExplicitBrief\s*&&\s*!intent\.isBeverageDevelopment\s*&&\s*!intent\.isExperienceSynthesis\s*&&\s*!intent\.wantsFounderBrief\)\s*reply\s*=\s*ensureCocktailConceptsInReply\(reply,\s*ai\.cocktailConcepts\)/.test(handler),
  '[B5g] handler surfaces cocktail concepts into the reply on explicit-brief turns (but NOT on beverage-development, synthesis, or founder-brief turns)')
// The backstop never fabricates: it returns the reply unchanged when the array is empty.
ok(/if \(lines\.length === 0\) return reply/.test(src),
  '[B5h] backstop no-ops (no fabrication) when no concepts were produced')

// Beverage-development routing: a separate directive + composer override the
// explicit-brief cocktail-forcing path when the owner crosses into bar R&D.
ok(/const\s+VENUE_INTELLIGENCE_BEVERAGE_DEVELOPMENT_DIRECTIVE\s*=/.test(src),
  '[B5i] beverage-development directive constant is defined')
ok(/function composeBeverageDevelopmentInstruction/.test(src),
  '[B5j] composeBeverageDevelopmentInstruction is defined')
ok(/Bar Intelligence Handoff Brief/i.test(src),
  '[B5k] directive produces a Bar Intelligence Handoff Brief')
ok(/preliminary concept slots, not final recipes or approved preparations/i.test(src),
  '[B5l] directive labels any cocktail ideas as preliminary concept slots, not final recipes')
ok(/Leave the JSON "cocktailConcepts" array EMPTY/i.test(src),
  '[B5m] beverage directive leaves the structured cocktail array empty (no forced list)')
ok(/if \(intent\.isBeverageDevelopment\)\s*\{[\s\S]*?composeBeverageDevelopmentInstruction\(\s*\n?\s*buildVenueIntelligenceSystemInstruction\(state\),\s*intent\)/.test(handler),
  '[B5n] handler routes beverage-development turns to the handoff composer')
// Generic shallow cocktail names are explicitly discouraged in the directive.
ok(/Savory Delight|Spicy Elixir|Sweet Symphony/i.test(src) && /Do NOT invent a shallow generic cocktail list/i.test(src),
  '[B5o] directive forbids shallow generic cocktail-list behavior')

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

// System instruction encodes the beverage-development routing doctrine.
ok(/BEVERAGE DEVELOPMENT/i.test(prompt), '[B10] prompt has a BEVERAGE DEVELOPMENT routing doctrine')
ok(/belongs to Bar Intelligence, not Venue DNA|Bar Intelligence territory/i.test(prompt),
  '[B10b] doctrine routes deep cocktail R&D to Bar Intelligence, away from Venue DNA')
ok(/Savory Delight|Spicy Elixir|Sweet Symphony/i.test(prompt),
  '[B10c] doctrine names the shallow generic cocktail names to avoid')
ok(/preliminary concept slots|temperature-play slot|spicy aromatic slot/i.test(prompt),
  '[B10d] doctrine uses preliminary concept-slot language, not finished recipes')
ok(/will NOT treat untested preparations as final/i.test(prompt),
  '[B10e] doctrine refuses to treat untested preparations as final truth')

// ── PART C — conversation-level exploration continuity ───────────────────────
// The founder's exact multi-turn sequence: the concept turn carries cues; the
// continuation turns drop them but must STAY protected (no canonical DNA merge).

const T1 = 'אני רוצה לבנות מקום חדש בהשראת התחושה של Paradiso Barcelona ו-SIPS Barcelona, אבל לא להעתיק אותם. תעזור לי לבנות Venue DNA ראשוני, בריף קונספט, קווי שירות, סגנון תפריט קוקטיילים, וסיכונים תפעוליים.'
const T2 = 'i want to focus on innovation and complex cocktails- not just classic cocktails. our guests will be cocktail enthusiastics'
const T3 = '8 cocktails, at least 5 different new methods. 1 savory, 1 spicy, 1 sweet, 1 bitter, 1 sour, 1 umami'
const T4 = 'cold infusions, SOUS VID, nitrogen, foams, clouds, temperature games'

// Build the running history the handler would pass (prior turns only), turn by turn.
const history = []
function turn(text) {
  const intent = classifyVenueIntelligenceIntent(text, { recentMessages: history })
  history.push({ role: 'user', content: text })
  history.push({ role: 'model', content: 'ok' })
  return intent
}

const c1 = turn(T1)
ok(c1.mode === VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION, '[C1] T1 = concept_exploration')
ok(c1.mergeIntoCanonicalDna === false, '[C1b] T1 does NOT merge canonical DNA')

const c2 = turn(T2)
ok(c2.mode === VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION_CONTINUATION, '[C2] T2 = concept_exploration_continuation')
ok(c2.sessionInExploration === true, '[C2b] T2 sees the active exploration thread')
ok(c2.mergeIntoCanonicalDna === false, '[C2c] T2 does NOT merge canonical DNA (continuation protected)')

const c3 = turn(T3)
ok(c3.mode === VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION_CONTINUATION, '[C3] T3 = concept_exploration_continuation')
ok(c3.mergeIntoCanonicalDna === false, '[C3b] T3 does NOT merge canonical DNA')
ok(c3.requestedCocktailCount === 8, '[C3c] T3 tracks requestedCocktailCount = 8')

const c4 = turn(T4)
ok(c4.mode === VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION_CONTINUATION, '[C4] T4 = concept_exploration_continuation')
ok(c4.mergeIntoCanonicalDna === false, '[C4b] T4 does NOT merge canonical DNA')
ok(Array.isArray(c4.methods) && c4.methods.length >= 3, '[C4c] T4 detects preparation methods')

// All four turns protected → canonical DNA stays untouched across the whole brief.
ok([c1, c2, c3, c4].every(c => c.mergeIntoCanonicalDna === false),
  '[C5] every turn of the concept brief is protected (no canonical DNA mutation)')

// Ordinary current-venue discovery, with NO active exploration thread, still merges.
const discovery = [
  'We never say no to a guest directly, we always offer an alternative.',
  'My team struggles to stay consistent on busy Friday nights.',
  'Our cocktail list leans on fresh citrus and low-ABV aperitivo serves.',
]
for (const msg of discovery) {
  const r = classifyVenueIntelligenceIntent(msg, { recentMessages: [] })
  ok(r.mergeIntoCanonicalDna === true && r.mode === VENUE_INTELLIGENCE_INTENT_MODES.CURRENT_VENUE,
    `[C6] discovery still merges (no exploration thread): "${msg.slice(0, 30)}…"`)
}

// A current-venue topic AFTER an exploration thread (no continuation cue) still merges —
// continuity must not block genuine current-venue discovery.
const afterExploration = [{ role: 'user', content: T1 }, { role: 'model', content: 'ok' }]
const opsTurn = classifyVenueIntelligenceIntent('my staff keep forgetting the closing inventory checklist', { recentMessages: afterExploration })
ok(opsTurn.mergeIntoCanonicalDna === true, '[C7] non-topical current-venue ops talk after exploration still merges')

// Explicit current-venue override applies the exploration to the venue (merge allowed)
// and exits exploration mode for subsequent turns.
const overrideEn = classifyVenueIntelligenceIntent('apply this concept to my current venue and update the venue DNA', { recentMessages: afterExploration })
ok(overrideEn.wantsCurrentVenueUpdate === true, '[C8] explicit English override detected')
ok(overrideEn.mergeIntoCanonicalDna === true, '[C8b] override allows the merge')

const overrideHe = classifyVenueIntelligenceIntent('תעדכן את ה-DNA של המקום הנוכחי עם הקונספט הזה', { recentMessages: afterExploration })
ok(overrideHe.wantsCurrentVenueUpdate === true, '[C9] explicit Hebrew override detected')
ok(overrideHe.mergeIntoCanonicalDna === true, '[C9b] Hebrew override allows the merge')

// After an explicit override, a following continuation-style turn merges (mode exited).
const afterOverride = [
  { role: 'user', content: T1 }, { role: 'model', content: 'ok' },
  { role: 'user', content: 'apply this to my current venue' }, { role: 'model', content: 'ok' },
]
const postOverride = classifyVenueIntelligenceIntent('lets add more cocktails to the menu', { recentMessages: afterOverride })
ok(postOverride.mergeIntoCanonicalDna === true, '[C10] override ends exploration mode; later turns merge')

// Hebrew continuation cue inside an active exploration is still protected.
const heHistory = [{ role: 'user', content: T1 }, { role: 'model', content: 'ok' }]
const heCont = classifyVenueIntelligenceIntent('בוא נוסיף קוקטיילים עם טעמים חדשים ושיטות הכנה מתקדמות', { recentMessages: heHistory })
ok(heCont.mergeIntoCanonicalDna === false && heCont.mode === VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION_CONTINUATION,
  '[C11] Hebrew continuation inside exploration stays protected')

// New mode constant + backward-compatible single-arg call (no context → no continuation).
ok(VENUE_INTELLIGENCE_INTENT_MODES.EXPLORATION_CONTINUATION === 'concept_exploration_continuation',
  '[C12] EXPLORATION_CONTINUATION mode constant exists')
ok(classifyVenueIntelligenceIntent(T2).mergeIntoCanonicalDna === true,
  '[C13] single-arg (no context) T2 merges — backward compatible, no silent over-block')

// ── PART D — beverage-development detection (Bar Intelligence routing) ────────
// The OUTPUT gate that decides whether the turn produces a Bar Intelligence handoff
// brief instead of a shallow generic cocktail list. Independent of the DNA-merge gate.

// 1) Beverage-heavy owner turns are detected.
const bevCount = classifyVenueIntelligenceIntent('8 cocktails, at least 5 different new methods. 1 savory, 1 spicy, 1 sweet, 1 bitter, 1 sour, 1 umami')
ok(bevCount.isBeverageDevelopment === true, '[D1] "8 cocktails / 5 methods / flavor roles" is a beverage-development turn')
ok(bevCount.requestedCocktailCount === 8, '[D1b] requestedCocktailCount = 8 captured')
ok(bevCount.requestedMethodCount === 5, '[D1c] requestedMethodCount = 5 captured')
ok(bevCount.flavorRoles.length === 6, '[D1d] six flavor roles captured (savory/spicy/sweet/bitter/sour/umami)')

// 2) The "preparation recipe quality" concern is detected.
const concern = classifyVenueIntelligenceIntent('my concern is that you will not write the best preparations recipe for us')
ok(concern.preparationQualityConcern === true, '[D2] preparation/recipe quality concern detected')
ok(concern.isBeverageDevelopment === true, '[D2b] preparation-quality concern routes to beverage development')

// 3) A pure named-technique turn (no count) is still beverage development.
const techniques = classifyVenueIntelligenceIntent('cold infusions, sous vide, nitrogen, foams, clouds, temperature games')
ok(techniques.methods.length >= 3, '[D3] multiple named techniques captured')
ok(techniques.isBeverageDevelopment === true, '[D3b] a technique-heavy turn routes to beverage development')

// 4) An explicit flavor-role framework alone (3+ roles) routes to beverage development.
const roles = classifyVenueIntelligenceIntent('one savory, one spicy, one bitter, one sour cocktail')
ok(roles.flavorRoles.length >= 3, '[D4] 3+ explicit flavor roles captured')
ok(roles.isBeverageDevelopment === true, '[D4b] a flavor-role framework routes to beverage development')

// 5) Ordinary venue discovery is NOT a beverage-development turn (no over-firing).
for (const msg of [
  'Our cocktail list leans on fresh citrus and low-ABV aperitivo serves.',
  'The cocktail program is the heart of the room.',
  'lets add more cocktails to the menu',
  'We never say no to a guest directly, we always offer an alternative.',
]) {
  const r = classifyVenueIntelligenceIntent(msg)
  ok(r.isBeverageDevelopment === false, `[D5] ordinary discovery is NOT beverage development: "${msg.slice(0, 34)}…"`)
}

// 6) "sour" must not be triggered by substrings like "resource"/"source".
const falsePos = classifyVenueIntelligenceIntent('we want to be resourceful about our cocktail menu')
ok(!falsePos.flavorRoles.includes('sour'), '[D6] "resource" does not count as a "sour" flavor role')

// 7) Beverage development NEVER alters the DNA-merge gate — exploration stays protected,
//    ordinary current-venue beverage development still merges (output gate is orthogonal).
const bevInExploration = classifyVenueIntelligenceIntent(T3, { recentMessages: [{ role: 'user', content: T1 }, { role: 'model', content: 'ok' }] })
ok(bevInExploration.isBeverageDevelopment === true && bevInExploration.mergeIntoCanonicalDna === false,
  '[D7] beverage development inside exploration: routed AND canonical DNA still protected')
const bevCurrentVenue = classifyVenueIntelligenceIntent('for my venue: 8 cocktails with 5 new methods, one savory one spicy one bitter')
ok(bevCurrentVenue.isBeverageDevelopment === true && bevCurrentVenue.mergeIntoCanonicalDna === true,
  '[D8] beverage development tied to the current venue: routed AND still merges (gates orthogonal)')

// 8) Empty / junk input never reports beverage development.
for (const msg of ['', null, undefined, '   ']) {
  const r = classifyVenueIntelligenceIntent(msg)
  ok(r.isBeverageDevelopment === false, `[D9] empty input is not beverage development (${JSON.stringify(msg)})`)
}

// ── PART E — normal-night synthesis routing (synthesize-before-questioning) ───
// The OUTPUT gate that, once enough venue concept signal exists, makes a "normal night"
// / "show me the experience" prompt produce a synthesized Working Draft instead of yet
// another broad discovery question. Independent of the DNA-merge gate.

// A rich concept conversation: the owner has already laid out the venue concept.
const SYNTH_HISTORY = [
  { role: 'user', content: 'A hidden, elegant premium hybrid hospitality venue with a serious cocktail programme.' },
  { role: 'model', content: 'ok' },
  { role: 'user', content: 'It should feel like a private salon — an elegant apartment. Intimate, intelligent, warm, slightly mysterious.' },
  { role: 'model', content: 'ok' },
  { role: 'user', content: 'Warm, precise, quietly guided service. Discovery without gimmick. Small elegant food support, not a full restaurant.' },
  { role: 'model', content: 'ok' },
]

// 1) After enough concept signals, normal-night prompts route to synthesis.
for (const msg of [
  'so how does this play out on a normal night?',
  'what does this feel like in practice?',
  'show me the experience',
  'turn this into a working brief',
  'let me sit with that',
]) {
  const r = classifyVenueIntelligenceIntent(msg, { recentMessages: SYNTH_HISTORY })
  ok(r.wantsExperienceSynthesis === true, `[E1] synthesis cue detected: "${msg.slice(0, 34)}…"`)
  ok(r.isExperienceSynthesis === true, `[E1b] routes to synthesis once enough signal exists: "${msg.slice(0, 28)}…"`)
}

// 2) Synthesis NEVER changes the DNA-merge gate — concept exploration stays protected.
const synthInExploration = classifyVenueIntelligenceIntent('show me how this plays out on a normal night', {
  recentMessages: [{ role: 'user', content: T1 }, { role: 'model', content: 'ok' },
    { role: 'user', content: 'intimate elegant premium salon, warm guided service, serious cocktails' }, { role: 'model', content: 'ok' }],
})
ok(synthInExploration.isExperienceSynthesis === true, '[E2] synthesis fires inside an exploration thread')
ok(synthInExploration.mergeIntoCanonicalDna === false, '[E2b] synthesis does NOT merge canonical DNA inside exploration (output gate is orthogonal)')

// 3) With too little concept signal, a bare "let me sit with that" does NOT force synthesis.
const synthCold = classifyVenueIntelligenceIntent('let me sit with that', { recentMessages: [] })
ok(synthCold.wantsExperienceSynthesis === true, '[E3] synthesis cue still detected on a cold turn')
ok(synthCold.hasSufficientConceptContext === false, '[E3b] cold turn lacks sufficient concept context')
ok(synthCold.isExperienceSynthesis === false, '[E3c] cold turn does NOT force synthesis (gather first)')

// 4) Ordinary discovery (no synthesis cue) is never a synthesis turn, even with rich context.
for (const msg of [
  'Our regulars come for the intimacy and the jazz early in the evening.',
  'My team struggles to stay consistent on busy Friday nights.',
]) {
  const r = classifyVenueIntelligenceIntent(msg, { recentMessages: SYNTH_HISTORY })
  ok(r.isExperienceSynthesis === false, `[E4] ordinary discovery is NOT synthesis: "${msg.slice(0, 34)}…"`)
}

// 5) Synthesis tied to the current venue still synthesizes AND still merges (gates orthogonal).
const synthCurrent = classifyVenueIntelligenceIntent('for my venue, show me how a normal night plays out', { recentMessages: SYNTH_HISTORY })
ok(synthCurrent.isExperienceSynthesis === true, '[E5] synthesis fires for a current-venue render request')
ok(synthCurrent.mergeIntoCanonicalDna === true, '[E5b] current-venue synthesis still merges (output gate orthogonal)')

// 6) Empty / junk input never reports synthesis.
for (const msg of ['', null, undefined, '   ']) {
  const r = classifyVenueIntelligenceIntent(msg)
  ok(r.isExperienceSynthesis === false, `[E6] empty input is not synthesis (${JSON.stringify(msg)})`)
}

// ── PART F — server wiring for normal-night synthesis ────────────────────────
ok(/const\s+VENUE_INTELLIGENCE_NORMAL_NIGHT_SYNTHESIS_DIRECTIVE\s*=/.test(src),
  '[F1] normal-night synthesis directive constant is defined')
ok(/function composeNormalNightSynthesisInstruction/.test(src),
  '[F2] composeNormalNightSynthesisInstruction is defined')
ok(/if \(intent\.isExperienceSynthesis\)\s*\{[\s\S]*?composeNormalNightSynthesisInstruction\(/.test(handler),
  '[F3] handler routes synthesis turns to the synthesis composer')
ok(/Correct me where this feels wrong/.test(src),
  '[F4] directive ends with the correction invitation')
ok(/NEVER reply "Tell me more about how that plays out on a normal night"/.test(src),
  '[F5] directive explicitly forbids the weak "tell me more" pattern')
ok(/Working Draft — not yet confirmed/.test(src),
  '[F6] directive labels output as a Working Draft — not yet confirmed')
ok(/Leave the JSON "cocktailConcepts" array EMPTY/i.test(src),
  '[F7] synthesis directive leaves the structured cocktail array empty (no forced list)')
ok(/intent\.isExplicitBrief\s*&&\s*!intent\.isBeverageDevelopment\s*&&\s*!intent\.isExperienceSynthesis\s*&&\s*!intent\.wantsFounderBrief\)/.test(handler),
  '[F8] cocktail backstop is suppressed on synthesis and founder-brief turns')
ok(/function ensureCorrectionInvitation/.test(src) &&
   /else if \(intent\.isExperienceSynthesis\)\s*\{[\s\S]*?reply\s*=\s*ensureCorrectionInvitation\(reply\)/.test(handler),
  '[F8b] handler deterministically guarantees the correction invitation on synthesis turns')
// The weak fallback string must no longer be the hardcoded reply fallback.
ok(!/Tell me a little more about how that plays out on a normal night/.test(handler),
  '[F9] the weak "tell me a little more…" fallback string was removed from the handler')

// ── PART G — Founder Brief v0.1 routing (classifier) ─────────────────────────
// After enough concept signal, a Founder Brief request routes to a full structured
// brief; before enough signal, it routes to an honest "not enough yet" response.
// Independent of the DNA-merge gate.

// Reuse the rich concept conversation from PART E.
for (const msg of [
  'create a Founder Brief v0.1',
  'based on everything we have built so far, create a founder brief',
  'stop the discovery flow and turn this into a founder-level brief',
  'תבנה לי בריף מייסד',
  'תסכם את הקונספט',
]) {
  const r = classifyVenueIntelligenceIntent(msg, { recentMessages: SYNTH_HISTORY })
  ok(r.wantsFounderBrief === true, `[G1] founder-brief cue detected: "${msg.slice(0, 34)}…"`)
  ok(r.isFounderBrief === true, `[G1b] routes to a full Founder Brief once enough signal exists: "${msg.slice(0, 28)}…"`)
}

// 2) Before enough concept signal, a founder-brief request is detected but is NOT a full
//    brief (handler returns the honest "not enough yet" path, never an empty fallback).
const fbCold = classifyVenueIntelligenceIntent('create a founder brief', { recentMessages: [] })
ok(fbCold.wantsFounderBrief === true, '[G2] founder-brief cue still detected on a cold turn')
ok(fbCold.hasSufficientConceptContext === false, '[G2b] cold turn lacks sufficient concept context')
ok(fbCold.isFounderBrief === false, '[G2c] cold turn is NOT a full Founder Brief (handler gives "not enough yet")')

// 3) Founder Brief NEVER changes the DNA-merge gate — concept exploration stays protected.
const fbInExploration = classifyVenueIntelligenceIntent('based on everything we have built so far, create a founder brief', {
  recentMessages: [{ role: 'user', content: T1 }, { role: 'model', content: 'ok' },
    { role: 'user', content: 'intimate elegant premium salon, warm guided service, serious cocktails' }, { role: 'model', content: 'ok' }],
})
ok(fbInExploration.isFounderBrief === true, '[G3] founder brief fires inside an exploration thread')
ok(fbInExploration.mergeIntoCanonicalDna === false, '[G3b] founder brief does NOT merge canonical DNA inside exploration (output gate orthogonal)')

// 4) Founder brief tied to the current venue still briefs AND still merges (gates orthogonal).
const fbCurrent = classifyVenueIntelligenceIntent('for my venue, create a founder brief', { recentMessages: SYNTH_HISTORY })
ok(fbCurrent.isFounderBrief === true, '[G4] founder brief fires for a current-venue request')
ok(fbCurrent.mergeIntoCanonicalDna === true, '[G4b] current-venue founder brief still merges (output gate orthogonal)')

// 5) Beverage-heavy request takes precedence — a founder brief must NOT override deep
//    cocktail R&D (handler composes the beverage handoff; founder backstop is gated off).
const fbBeverage = classifyVenueIntelligenceIntent('create a founder brief with 8 cocktails and at least 5 new methods, one savory one spicy one bitter', { recentMessages: SYNTH_HISTORY })
ok(fbBeverage.wantsFounderBrief === true, '[G5] founder-brief cue present alongside beverage R&D')
ok(fbBeverage.isBeverageDevelopment === true, '[G5b] beverage development still detected (takes precedence in the handler)')

// 6) Ordinary discovery and normal-night synthesis are NOT founder-brief turns.
for (const msg of [
  'Our regulars come for the intimacy and the jazz early in the evening.',
  'so how does this play out on a normal night?',
]) {
  const r = classifyVenueIntelligenceIntent(msg, { recentMessages: SYNTH_HISTORY })
  ok(r.wantsFounderBrief === false, `[G6] not a founder-brief turn: "${msg.slice(0, 34)}…"`)
}

// 7) Empty / junk input never reports founder brief.
for (const msg of ['', null, undefined, '   ']) {
  const r = classifyVenueIntelligenceIntent(msg)
  ok(r.wantsFounderBrief === false && r.isFounderBrief === false, `[G7] empty input is not a founder brief (${JSON.stringify(msg)})`)
}

// ── PART H — server wiring for Founder Brief v0.1 ────────────────────────────
ok(/const\s+VENUE_INTELLIGENCE_FOUNDER_BRIEF_DIRECTIVE\s*=/.test(src),
  '[H1] founder-brief directive constant is defined')
ok(/const\s+VENUE_INTELLIGENCE_FOUNDER_BRIEF_INSUFFICIENT_DIRECTIVE\s*=/.test(src),
  '[H1b] founder-brief "not enough yet" directive constant is defined')
ok(/function composeFounderBriefInstruction/.test(src),
  '[H2] composeFounderBriefInstruction is defined')
ok(/if \(intent\.wantsFounderBrief\)\s*\{[\s\S]*?composeFounderBriefInstruction\(/.test(handler),
  '[H3] handler routes founder-brief turns to the founder-brief composer')
// Precedence: beverage development is composed AFTER (wins over) founder brief.
ok(handler.indexOf('composeFounderBriefInstruction(') < handler.indexOf('composeBeverageDevelopmentInstruction('),
  '[H3b] beverage development is composed after founder brief (beverage wins)')
// The directive encodes all 15 required sections, in order.
for (const sec of ['One-sentence concept', 'Founder intent', 'Emotional promise', 'Guest world', 'Primary occasions', 'Service philosophy', 'Spatial atmosphere', 'Beverage role', 'Food role', 'What the venue must protect', 'What the venue must never become', 'Early operational implications', 'Early risks or contradictions', 'What is already strong', 'What still needs decision']) {
  ok(src.includes(sec), `[H4] founder-brief directive includes section "${sec}"`)
}
ok(/Founder Brief v0\.1/.test(src), '[H4b] directive labels the output "Founder Brief v0.1"')
ok(/Working Draft — not yet confirmed/.test(src), '[H4c] directive heads the brief "Working Draft — not yet confirmed"')
ok(/Correct me where this feels wrong/.test(src), '[H4d] directive ends with the correction invitation')
ok(/DO NOT ask any question at the end|no closing question/i.test(src),
  '[H4e] directive forbids a closing question on a full brief')
ok(/Do NOT expose a (technical )?Discovery Map/i.test(src), '[H4f] directive forbids exposing a Discovery Map')
ok(/no exact capacity, no pricing, no specific menu items/i.test(src), '[H4g] directive forbids inventing hard facts')
ok(/Leave the JSON "cocktailConcepts" array EMPTY/i.test(src), '[H4h] founder-brief directive leaves the cocktail array empty')

// Deterministic backstops — never the one-line fallback.
ok(/function looksLikeFounderBrief/.test(src), '[H5] looksLikeFounderBrief structural check is defined')
ok(/function founderBriefCouldNotGenerate/.test(src), '[H5b] founderBriefCouldNotGenerate backstop is defined')
ok(/function founderBriefNotEnoughYet/.test(src), '[H5c] founderBriefNotEnoughYet backstop is defined')
ok(/if \(intent\.wantsFounderBrief\s*&&\s*!intent\.isBeverageDevelopment\)\s*\{/.test(handler),
  '[H5d] handler applies the founder-brief reply backstop (gated off on beverage turns)')
ok(/looksLikeFounderBrief\(modelReply\)\s*\?\s*modelReply\s*:\s*founderBriefCouldNotGenerate\(\)/.test(handler),
  '[H5e] full-brief path forces a structured brief or an honest error-style response (never the one-liner)')
ok(/modelReply\s*\|\|\s*founderBriefNotEnoughYet\(\)/.test(handler),
  '[H5f] not-enough path returns an honest "not enough yet" response, never the one-liner')
// The cocktail backstop is suppressed on founder-brief turns.
ok(/!intent\.isExperienceSynthesis\s*&&\s*!intent\.wantsFounderBrief\)\s*reply\s*=\s*ensureCocktailConceptsInReply/.test(handler),
  '[H5g] cocktail backstop is suppressed on founder-brief turns')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
