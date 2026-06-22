#!/usr/bin/env node
/**
 * Static audit of the Venue Intelligence chat route (Phase 9E-1A):
 *   POST /api/venue-intelligence/message
 *
 * No DB, no server boot, no network, no AI. These assertions verify — by reading
 * server.js source — the safety properties relied on before wiring this route to
 * the OwnerAIHome chat surface:
 *   • the route exists, is owner-gated and venue-scoped;
 *   • it returns a chat-shaped assistant reply;
 *   • it builds working Venue DNA via mergeVenueDna (signal-level understanding);
 *   • it never finalizes identity: no Full Intelligence Mode unlock, no confirmed-DNA
 *     promotion, no reset from inside the handler;
 *   • it contains no fake KPI language.
 *
 * This is an AUDIT, not an activation: it asserts the route's shape so a later phase
 * can wire chat with confidence. It does not change the route.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-venue-intelligence-message-route-audit.js
 *   (or: npm run test:venue-intelligence-message-audit)
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

console.log('\nVenue Intelligence message route — static audit\n')

// 1. The route exists.
ok(/app\.post\(\s*['"]\/api\/venue-intelligence\/message['"]/.test(src),
  '[1] POST /api/venue-intelligence/message is registered')

// 2. It is auth-gated to owner (admin always passes requireAuth).
ok(/app\.post\(\s*['"]\/api\/venue-intelligence\/message['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(src),
  "[2] route is gated with requireAuth('owner')")

// Isolate the handler body (from this route to the next app.<method>( registration).
const startIdx = src.indexOf("app.post('/api/venue-intelligence/message'")
ok(startIdx !== -1, 'message handler located in server.js')
const after = src.slice(startIdx + 1)
const nextRel = after.search(/app\.(get|post|put|patch|delete)\(/)
const handler = nextRel === -1 ? src.slice(startIdx) : src.slice(startIdx, startIdx + 1 + nextRel)

// 3. Venue-scoped via req.venueId.
ok(/req\.venueId/.test(handler), '[3] handler is venue-scoped via req.venueId')

// 4. Does not call reset / does not delete from inside this handler.
ok(!handler.includes('/reset'), '[4] handler does not call a reset path')
ok(!/\bDELETE\b/.test(handler), '[4b] handler performs no DELETE')

// 5. Does not unlock or expose Full Intelligence Mode.
ok(!/unlock_readiness/.test(handler), '[5] handler does not touch unlock_readiness')
ok(!/Full Intelligence Mode/i.test(handler), '[5b] handler does not reference Full Intelligence Mode')
ok(!/foundation_ready/.test(handler), '[5c] handler does not assert foundation_ready')

// 6. No fake KPI language in the handler.
for (const kpi of ['revenue:', 'margin:', 'ROI', 'guest satisfaction', 'occupancy:']) {
  ok(!handler.includes(kpi), `[6] handler has no fake KPI field "${kpi}"`)
}

// 7. mergeVenueDna IS used here (expected) — this route builds working Venue DNA.
ok(/mergeVenueDna\(/.test(handler), '[7] handler builds Venue DNA via mergeVenueDna (signal-level understanding)')
// It persists to venue_dna_json (working understanding), as documented.
ok(/venue_dna_json/.test(handler) && /UPDATE\s+venue_intelligence/i.test(handler),
  '[7b] handler persists working DNA to venue_dna_json')

// 8. Response shape includes a chat-suitable assistant reply.
ok(/res\.json\(\s*\{[^}]*\breply\b/.test(handler), '[8] response includes an assistant "reply" field')

// 9. No candidate→confirmed-DNA promotion path from this handler. The owner-led
//    conversation writes working signals only; it never promotes F&B candidates to
//    DNA and never marks a dimension "confirmed".
ok(!/markVenueIntelligenceCandidate/i.test(handler), '[9] handler does not review/promote candidates')
ok(!/safeRecordVenueIntelligenceCandidates/.test(handler), '[9b] handler does not write candidate records')
ok(!/['"]confirmed['"]/.test(handler), '[9c] handler does not write a confirmed-DNA tier')

// Documentation anchor: the candidate system explicitly has NO candidate→DNA path.
ok(/NO candidate→DNA path|has NO candidate/i.test(src),
  '[9d] candidate routes still document no candidate→DNA promotion')

// 10. Beverage-development routing is an OUTPUT-only concern: it changes the prompt
//     composition for the turn, never the canonical-DNA write gate, the writer, auth,
//     or venue scoping. The handler routes beverage-dev turns to the handoff composer.
ok(/intent\.isBeverageDevelopment/.test(handler),
  '[10] handler consults intent.isBeverageDevelopment for output routing')
ok(/composeBeverageDevelopmentInstruction\(/.test(handler),
  '[10b] handler composes the Bar Intelligence handoff instruction on beverage-dev turns')
// The canonical-DNA write remains gated SOLELY by intent.mergeIntoCanonicalDna — the
// beverage flag must not appear on the persistence gate.
ok(/intent\.mergeIntoCanonicalDna\s*\?\s*mergedDNA\s*:\s*state\.venueDNA/.test(handler),
  '[10c] canonical-DNA write still gated only by intent.mergeIntoCanonicalDna (beverage flag is output-only)')
// The forced cocktail-list backstop is suppressed on beverage-development turns.
ok(/intent\.isExplicitBrief\s*&&\s*!intent\.isBeverageDevelopment\s*&&\s*!intent\.isExperienceSynthesis\s*&&\s*!intent\.wantsFounderBrief\)\s*reply\s*=\s*ensureCocktailConceptsInReply/.test(handler),
  '[10d] handler does NOT force a cocktail list on beverage-development turns')
// Still no destructive / finalization side effects on this new path.
ok(!/['"]confirmed['"]/.test(handler), '[10e] beverage path adds no confirmed-DNA tier literal')
ok(!/\bDELETE\b/.test(handler), '[10f] beverage path adds no DELETE')

// 11. Normal-night synthesis routing is ALSO an OUTPUT-only concern: it changes the
//     prompt composition for the turn, never the canonical-DNA write gate, the writer,
//     auth, or venue scoping. The handler routes synthesis turns to the synthesis composer.
ok(/intent\.isExperienceSynthesis/.test(handler),
  '[11] handler consults intent.isExperienceSynthesis for output routing')
ok(/composeNormalNightSynthesisInstruction\(/.test(handler),
  '[11b] handler composes the synthesis instruction on synthesis turns')
// The canonical-DNA write remains gated SOLELY by intent.mergeIntoCanonicalDna.
ok(/intent\.mergeIntoCanonicalDna\s*\?\s*mergedDNA\s*:\s*state\.venueDNA/.test(handler),
  '[11c] canonical-DNA write still gated only by intent.mergeIntoCanonicalDna (synthesis flag is output-only)')
// The forced cocktail-list backstop is suppressed on synthesis turns.
ok(/!intent\.isBeverageDevelopment\s*&&\s*!intent\.isExperienceSynthesis\s*&&\s*!intent\.wantsFounderBrief\)\s*reply\s*=\s*ensureCocktailConceptsInReply/.test(handler),
  '[11d] handler does NOT force a cocktail list on synthesis turns')
// The weak "tell me more" fallback string was removed; the fallback no longer interviews.
ok(!/Tell me a little more about how that plays out on a normal night/.test(handler),
  '[11e] handler no longer falls back to the weak "tell me more…" interview prompt')
// The synthesis path deterministically guarantees the correction invitation (so the
// turn ends with a correction request, never another broad interview question).
ok(/reply\s*=\s*ensureCorrectionInvitation\(reply\)/.test(handler),
  '[11e2] handler guarantees the correction invitation on synthesis turns')
// No destructive / finalization side effects on the synthesis path.
ok(!/['"]confirmed['"]/.test(handler), '[11f] synthesis path adds no confirmed-DNA tier literal')

// 12. Founder Brief routing is ALSO output-only: it changes the prompt composition and
//     the reply backstop for the turn, never the canonical-DNA write gate, the writer,
//     auth, or venue scoping. It must NEVER return the generic one-line fallback.
ok(/intent\.wantsFounderBrief/.test(handler),
  '[12] handler consults intent.wantsFounderBrief for output routing')
ok(/composeFounderBriefInstruction\(/.test(handler),
  '[12b] handler composes the Founder Brief instruction on founder-brief turns')
// Canonical-DNA write remains gated SOLELY by intent.mergeIntoCanonicalDna.
ok(/intent\.mergeIntoCanonicalDna\s*\?\s*mergedDNA\s*:\s*state\.venueDNA/.test(handler),
  '[12c] canonical-DNA write still gated only by intent.mergeIntoCanonicalDna (founder flag is output-only)')
// The deterministic backstop prevents the one-line fallback on founder-brief turns.
ok(/looksLikeFounderBrief\(modelReply\)\s*\?\s*modelReply\s*:\s*founderBriefCouldNotGenerate\(\)/.test(handler),
  '[12d] full Founder Brief path forces a brief or honest error-style response (never the one-liner)')
ok(/modelReply\s*\|\|\s*founderBriefNotEnoughYet\(\)/.test(handler),
  '[12e] not-enough Founder Brief path returns an honest response (never the one-liner)')
// Founder Brief yields to beverage development (backstop gated off on beverage turns).
ok(/intent\.wantsFounderBrief\s*&&\s*!intent\.isBeverageDevelopment/.test(handler),
  '[12f] founder-brief backstop yields to beverage development')
// No destructive / finalization side effects on the founder-brief path.
ok(!/['"]confirmed['"]/.test(handler), '[12g] founder-brief path adds no confirmed-DNA tier literal')
ok(!/\bDELETE\b/.test(handler), '[12h] founder-brief path adds no DELETE')

// 13. Owner Correction Loop routing is ALSO output-only: it changes the prompt composition
//     and the reply backstop for the turn, never the canonical-DNA write gate, the writer,
//     auth, or venue scoping. It must NEVER return the generic one-line fallback, and must
//     end with the loop-specific closing line. Crucially, it surfaces candidate Venue DNA
//     signals as OUTPUT ONLY — it writes NO candidate records and promotes NOTHING to DNA.
ok(/intent\.wantsOwnerCorrectionLoop/.test(handler),
  '[13] handler consults intent.wantsOwnerCorrectionLoop for output routing')
ok(/composeOwnerCorrectionLoopInstruction\(/.test(handler),
  '[13b] handler composes the Owner Correction Loop instruction on correction-loop turns')
// Canonical-DNA write remains gated SOLELY by intent.mergeIntoCanonicalDna.
ok(/intent\.mergeIntoCanonicalDna\s*\?\s*mergedDNA\s*:\s*state\.venueDNA/.test(handler),
  '[13c] canonical-DNA write still gated only by intent.mergeIntoCanonicalDna (correction-loop flag is output-only)')
// The deterministic backstop prevents the one-line fallback and guarantees the closing line.
ok(/looksLikeOwnerCorrectionLoop\(modelReply\)\s*\?\s*modelReply\s*:\s*ownerCorrectionLoopCouldNotGenerate\(\)/.test(handler),
  '[13d] full correction-loop path forces a loop or honest error-style response (never the one-liner)')
ok(/reply\s*=\s*ensureCorrectionLoopClosing\(reply\)/.test(handler),
  '[13e] correction-loop path guarantees the loop-specific closing line')
ok(/modelReply\s*\|\|\s*ownerCorrectionLoopNotEnoughYet\(\)/.test(handler),
  '[13f] not-enough correction-loop path returns an honest response (never the one-liner)')
// Correction loop yields to beverage development (backstop gated off on beverage turns).
ok(/intent\.wantsOwnerCorrectionLoop\s*&&\s*!intent\.isBeverageDevelopment/.test(handler),
  '[13g] correction-loop backstop yields to beverage development')
// CANDIDATE SIGNALS ARE OUTPUT-ONLY — no DB candidate write, no candidate→DNA promotion.
ok(!/safeRecordVenueIntelligenceCandidates/.test(handler), '[13h] correction-loop path writes no candidate records')
ok(!/markVenueIntelligenceCandidate/i.test(handler), '[13i] correction-loop path promotes no candidates')
ok(!/['"]confirmed['"]/.test(handler), '[13j] correction-loop path adds no confirmed-DNA tier literal')
ok(!/\bDELETE\b/.test(handler), '[13k] correction-loop path adds no DELETE')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
