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
ok(/intent\.isExplicitBrief\s*&&\s*!intent\.isBeverageDevelopment\)\s*reply\s*=\s*ensureCocktailConceptsInReply/.test(handler),
  '[10d] handler does NOT force a cocktail list on beverage-development turns')
// Still no destructive / finalization side effects on this new path.
ok(!/['"]confirmed['"]/.test(handler), '[10e] beverage path adds no confirmed-DNA tier literal')
ok(!/\bDELETE\b/.test(handler), '[10f] beverage path adds no DELETE')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
