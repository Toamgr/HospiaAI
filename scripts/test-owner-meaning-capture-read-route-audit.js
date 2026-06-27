#!/usr/bin/env node
/**
 * Static source guardrail audit for the Owner Meaning Capture AUDIT READ layer (Slice 4D.2):
 *   - the service read fn:  listOwnerMeaningCaptures (src/.../ownerMeaningCaptureService.js)
 *   - the read routes:      GET /api/owner-meaning-captures(/:captureId)  (server.js)
 *
 * No DB, no server boot, no network, no AI. Verifies — by reading source — that the read layer is
 * owner-only, admin-blocked, venue-scoped, and STRICTLY READ-ONLY (no write verb, no INSERT/UPDATE/
 * DELETE, no Venue DNA contact, no mergeVenueDna, no forbidden promotion/meaning vocabulary), and
 * that the 4D WRITE route is unchanged (still exactly one owner-only POST writer).
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-owner-meaning-capture-read-route-audit.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SERVICE_REL = 'src/services/venueIntelligence/ownerMeaningCaptureService.js'
const server = readFileSync(resolve(ROOT, 'server.js'), 'utf8')
const service = readFileSync(resolve(ROOT, SERVICE_REL), 'utf8')

const FORBIDDEN_TOKENS = ['captured_owner_meaning', 'eligible_for_future_proposal', 'proposed_dna_change', 'dna_target', 'destination_hint']
const DNA_STORES = ['venue_dna_json', 'venue_intelligence', 'venue_briefs', 'venue_dna_enrichment', 'venue_intelligence_candidates']

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

console.log('\nOwner Meaning Capture READ — static source guardrail audit\n')

// ── Import wiring ────────────────────────────────────────────────────────────
ok(/import\s*\{[^}]*listOwnerMeaningCaptures[^}]*\}\s*from\s*["']\.\/src\/services\/venueIntelligence\/ownerMeaningCaptureService\.js["']/.test(server),
  '[import] server imports listOwnerMeaningCaptures')
ok(/import\s*\{[^}]*getOwnerMeaningCaptureById[^}]*\}/.test(server) && /import\s*\{[^}]*listOwnerMeaningCaptureEvents[^}]*\}/.test(server),
  '[import] server imports getOwnerMeaningCaptureById + listOwnerMeaningCaptureEvents')

// ── Read routes exist + owner-only gating ────────────────────────────────────
ok(/app\.get\(\s*['"]\/api\/owner-meaning-captures['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[GET list] exists, owner-ONLY gated')
ok(/app\.get\(\s*['"]\/api\/owner-meaning-captures\/:captureId['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[GET one] exists, owner-ONLY gated')
ok(!/app\.get\(\s*['"]\/api\/owner-meaning-captures['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*,\s*['"]admin['"]/.test(server),
  '[GET] admin is NOT granted read at requireAuth')

// ── Write surface is UNCHANGED: still exactly one owner-only POST, no new write verb ─
const writeVerbs = (server.match(/app\.(post|put|patch|delete)\(\s*['"]\/api\/owner-meaning-captures/g) || [])
ok(writeVerbs.length === 1, `[4D lock] exactly ONE owner-meaning write verb remains (got ${writeVerbs.length})`)
ok(/app\.post\(\s*['"]\/api\/owner-meaning-captures['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[4D lock] the 4D POST write route is still present + owner-only')

// ── Isolate the read region (banner → Venue Intelligence Bridge) ─────────────
const startIdx = server.indexOf('Owner Meaning Capture — Audit Read API (Slice 4D.2)')
ok(startIdx !== -1, 'read region banner located')
const bridgeIdx = server.indexOf('Venue Intelligence Bridge', startIdx)
const region = server.slice(startIdx, bridgeIdx > startIdx ? bridgeIdx : server.length)

// ── Admin re-exclusion in BOTH read handlers, before any read service call ───
const adminGuards = (region.match(/req\.user\s*&&\s*req\.user\.role\s*===\s*['"]admin['"]/g) || [])
ok(adminGuards.length === 2, `[admin] both read handlers re-exclude admin (got ${adminGuards.length})`)
ok((region.match(/role\s*===\s*['"]admin['"]\s*\)\s*\{\s*return\s+res\.status\(403\)/g) || []).length === 2,
  '[admin] each admin block returns 403')
// admin guard precedes the list reader and the get-by-id reader.
const listIdx = region.indexOf('listOwnerMeaningCaptures(')
const getIdx = region.indexOf('getOwnerMeaningCaptureById(')
const firstAdmin = region.search(/req\.user\s*&&\s*req\.user\.role\s*===\s*['"]admin['"]/)
ok(firstAdmin !== -1 && listIdx !== -1 && firstAdmin < listIdx, '[admin] admin block precedes the list read')
ok(getIdx !== -1 && firstAdmin < getIdx, '[admin] admin block precedes the get-by-id read')

// ── Strictly read-only: no write verb, no SQL mutation in the read region ────
ok(!/app\.(post|put|patch|delete)\(/.test(region), '[read-only] read region adds NO write verb')
ok(!/(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b/i.test(region), '[read-only] read region issues NO SQL mutation')

// ── No Venue DNA contact / no promotion vocabulary in the read region ────────
ok(!/mergeVenueDna/.test(region), '[isolation] no mergeVenueDna in the read region')
ok(!new RegExp(`(INSERT\\s+INTO|UPDATE)\\s+(${DNA_STORES.join('|')})\\b`, 'i').test(region),
  '[isolation] no Venue DNA store write in the read region')
ok(!/['"]confirmed['"]/.test(region), '[isolation] no confirmed-DNA tier literal in the read region')
ok(!/\/promote|\/confirm/.test(region), '[isolation] no /promote or /confirm route')
for (const token of FORBIDDEN_TOKENS) {
  ok(!region.includes(token), `[isolation] read region contains no forbidden token: ${token}`)
}

// ── Venue scoping; venue_id never the client subject ─────────────────────────
ok(/req\.venueId/.test(region), '[scoping] read routes are venue-scoped via req.venueId')
ok(!/defaultVenueId\(/.test(region), '[scoping] no defaultVenueId() in the read region')
ok(!/body\.venue_id/.test(region) && !/query\.venue_id/.test(region), '[scoping] venue_id is NOT read from the client (body or query)')
ok(/404/.test(region), '[scoping] cross-venue / unknown id path returns a safe 404')

// ── Service read fn is SELECT-only ───────────────────────────────────────────
ok(/export\s+function\s+listOwnerMeaningCaptures\b/.test(service), '[service] listOwnerMeaningCaptures is exported')
const fnStart = service.indexOf('export function listOwnerMeaningCaptures')
const fnRest = service.slice(fnStart + 1)
const nextExport = fnRest.search(/\nexport\s+(function|const)\s/)
const fnBody = service.slice(fnStart, nextExport === -1 ? service.length : fnStart + 1 + nextExport)
ok(!/(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b/i.test(fnBody), '[service] listOwnerMeaningCaptures issues NO SQL mutation (SELECT-only)')
ok(/SELECT/i.test(fnBody), '[service] listOwnerMeaningCaptures reads via SELECT')
ok(!/mergeVenueDna/.test(fnBody), '[service] listOwnerMeaningCaptures never calls mergeVenueDna')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
