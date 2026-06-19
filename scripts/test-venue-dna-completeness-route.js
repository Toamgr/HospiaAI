#!/usr/bin/env node
/**
 * Static source guards for the read-only Venue DNA completeness route (Phase 9C-3):
 *   GET /api/venue-intelligence/completeness
 *
 * No DB, no server boot, no network, no AI. These assertions verify — by reading
 * server.js source — that the route exists, is GET-only, is role+venue scoped like
 * the rest of venue-intelligence reads, calls the pure evaluator, returns
 * { ok: true, completeness }, and performs no writes/AI/network inside its handler.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-venue-dna-completeness-route.js  (or: npm run test:venue-dna-completeness-route)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SERVER_PATH = resolve(ROOT, 'server.js')
const EVALUATOR_PATH = resolve(ROOT, 'src/services/venueIntelligence/venueDnaCompletenessEvaluator.js')

// ── tiny assert harness ─────────────────────────────────────────────────────────
let passed = 0
let failed = 0
function ok(cond, msg) {
  if (cond) { passed++ }
  else { failed++; console.error(`  [FAIL] ${msg}`) }
}

const src = readFileSync(SERVER_PATH, 'utf8')

console.log('\nVenue DNA completeness route — static source guards\n')

// 1. The evaluator is imported into server.js.
ok(
  /import\s*\{[^}]*\bbuildVenueDnaCompleteness\b[^}]*\}\s*from\s*["'][^"']*venueDnaCompletenessEvaluator\.js["']/.test(src),
  '[1] server.js imports buildVenueDnaCompleteness from the evaluator',
)

// 2. Route exists and is GET-only.
ok(
  /app\.get\(\s*['"]\/api\/venue-intelligence\/completeness['"]/.test(src),
  '[2] GET /api/venue-intelligence/completeness route is registered',
)
ok(
  !/app\.(post|put|patch|delete)\(\s*['"]\/api\/venue-intelligence\/completeness['"]/.test(src),
  '[2] no POST/PUT/PATCH/DELETE on /completeness (GET-only)',
)

// Isolate the completeness handler body for targeted checks.
const startIdx = src.indexOf("app.get('/api/venue-intelligence/completeness'")
ok(startIdx !== -1, 'completeness handler located in server.js')
// Bound the handler at the next app.<method>( registration.
const after = src.slice(startIdx + 1)
const nextRouteRel = after.search(/app\.(get|post|put|patch|delete)\(/)
const handler = nextRouteRel === -1 ? src.slice(startIdx) : src.slice(startIdx, startIdx + 1 + nextRouteRel)

// 3. Role-gated like the existing venue-intelligence read (requireAuth('owner')).
ok(
  /requireAuth\(\s*['"]owner['"]\s*\)/.test(handler),
  "[3] route is gated with requireAuth('owner') like GET /api/venue-intelligence",
)

// 4. Venue-scoped via req.venueId.
ok(/req\.venueId/.test(handler), '[4] handler reads req.venueId (venue-scoped)')

// 5. Calls buildVenueDnaCompleteness.
ok(/buildVenueDnaCompleteness\s*\(/.test(handler), '[5] handler calls buildVenueDnaCompleteness')

// 6. Returns { ok: true, completeness }.
ok(/ok:\s*true/.test(handler) && /completeness/.test(handler), '[6] handler responds with { ok: true, completeness }')

// 7. No writes inside the handler.
for (const token of ['INSERT', 'UPDATE', 'DELETE', '.run(']) {
  ok(!handler.includes(token), `[7] handler performs no write ("${token}")`)
}

// 8. Does not call mergeVenueDna.
ok(!handler.includes('mergeVenueDna'), '[8] handler does not call mergeVenueDna')

// 9. No AI / network inside the handler.
for (const token of ['OpenAI', 'Gemini', 'fetch(', 'askVenueIntelligence', 'openai']) {
  ok(!handler.includes(token), `[9] handler makes no AI/network call ("${token}")`)
}

// 10. Confirmations default to empty (9D not wired yet).
ok(/confirmations:\s*\{\s*\}/.test(handler), '[10] confirmations default to {} (9D not wired)')

// 11. The existing POST message handler is still present and unchanged in shape.
ok(
  /app\.post\(\s*['"]\/api\/venue-intelligence\/message['"]/.test(src),
  '[11] POST /api/venue-intelligence/message still present',
)
// 12. The existing GET /api/venue-intelligence still returns { state }.
ok(
  /app\.get\(\s*['"]\/api\/venue-intelligence['"][\s\S]{0,400}res\.json\(\{\s*state\s*\}\)/.test(src),
  '[12] GET /api/venue-intelligence still responds with { state }',
)

// 13. The evaluator itself is unchanged-pure (sanity: still self-contained, no writers).
{
  const ev = readFileSync(EVALUATOR_PATH, 'utf8')
  ok(!/mergeVenueDna/.test(ev), '[13] evaluator still does not reference mergeVenueDna')
  ok(/export\s+function\s+buildVenueDnaCompleteness/.test(ev), '[13] evaluator still exports buildVenueDnaCompleteness')
}

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
