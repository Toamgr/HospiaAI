#!/usr/bin/env node
/**
 * Static source guardrail audit for the Owner Meaning Promotion READ layer (Slice 4G.1):
 *   - the service:      src/services/venueIntelligence/ownerMeaningPromotionService.js
 *   - the read routes:  GET /api/owner-meaning-promotion-candidates(/:candidateId)  (server.js)
 *
 * No DB, no server boot, no network, no AI. Verifies — by reading source (+ git working-tree
 * status) — that the promotion read layer is owner-only, admin-blocked, venue-scoped, and STRICTLY
 * READ-ONLY (no write verb, no INSERT/UPDATE/DELETE, no Venue DNA contact, no mergeVenueDna, no
 * owner_review_opened on GET), that NO writer route (approve/reject/request-revision/apply) and NO
 * POST/PUT/PATCH/DELETE promotion route was introduced, that the 4D capture WRITE route is
 * unchanged, and that NO UI file was touched by this slice.
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-owner-meaning-promotion-read-route-audit.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SERVICE_REL = 'src/services/venueIntelligence/ownerMeaningPromotionService.js'
const server = readFileSync(resolve(ROOT, 'server.js'), 'utf8')
const service = readFileSync(resolve(ROOT, SERVICE_REL), 'utf8')

const DNA_STORES = ['venue_dna_json', 'venue_intelligence', 'venue_briefs', 'venue_dna_enrichment', 'venue_intelligence_candidates']

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

// Strip block + line comments so the negative/isolation checks test CODE, not doctrine prose (the
// service + route comments legitimately NAME the forbidden tokens — "never calls mergeVenueDna",
// "no FOREIGN KEY" — to document the guarantee; those mentions must not trip the audit).
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

console.log('\nOwner Meaning Promotion READ — static source guardrail audit\n')

// ── Import wiring ────────────────────────────────────────────────────────────
ok(/import\s*\{[^}]*listOwnerMeaningPromotionCandidates[^}]*\}\s*from\s*["']\.\/src\/services\/venueIntelligence\/ownerMeaningPromotionService\.js["']/.test(server),
  '[import] server imports listOwnerMeaningPromotionCandidates from the promotion service')
ok(/import\s*\{[^}]*OWNER_MEANING_PROMOTION_CANDIDATES_DDL[^}]*OWNER_MEANING_PROMOTION_EVENTS_DDL[^}]*\}/.test(server),
  '[import] server imports both promotion DDL constants')

// ── Boot wiring exists + idempotent DDL ──────────────────────────────────────
ok(/db\.exec\(OWNER_MEANING_PROMOTION_CANDIDATES_DDL\)/.test(server) && /db\.exec\(OWNER_MEANING_PROMOTION_EVENTS_DDL\)/.test(server),
  '[boot] both promotion DDL constants are exec-wired at startup')
ok(/CREATE TABLE IF NOT EXISTS owner_meaning_promotion_candidates/.test(service) && /CREATE TABLE IF NOT EXISTS owner_meaning_promotion_events/.test(service),
  '[boot] DDL uses CREATE TABLE IF NOT EXISTS (idempotent)')
const serviceCode = stripComments(service)
ok(!/FOREIGN KEY/i.test(serviceCode) && !/PRAGMA\s+foreign_keys/i.test(serviceCode),
  '[boot] no enforced FK / no PRAGMA foreign_keys on the promotion tables (code)')

// ── Read routes exist + owner-only gating ────────────────────────────────────
ok(/app\.get\(\s*['"]\/api\/owner-meaning-promotion-candidates['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[GET list] exists, owner-ONLY gated')
ok(/app\.get\(\s*['"]\/api\/owner-meaning-promotion-candidates\/:candidateId['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[GET one] exists, owner-ONLY gated')
ok(!/app\.get\(\s*['"]\/api\/owner-meaning-promotion-candidates[^)]*requireAuth\(\s*['"]owner['"]\s*,\s*['"]admin['"]/.test(server),
  '[GET] admin not granted via requireAuth allow-list')

// ── No promotion WRITER route of any kind (GET-only surface) ─────────────────
const promotionWriteVerbs = (server.match(/app\.(post|put|patch|delete)\(\s*['"]\/api\/owner-meaning-promotion-candidates/g) || [])
ok(promotionWriteVerbs.length === 0, `[GET-only] no POST/PUT/PATCH/DELETE promotion route exists (got ${promotionWriteVerbs.length})`)
const promotionGets = (server.match(/app\.get\(\s*['"]\/api\/owner-meaning-promotion-candidates/g) || [])
ok(promotionGets.length === 2, `[GET-only] exactly TWO promotion GET routes (got ${promotionGets.length})`)
for (const writer of ['approve', 'reject', 'request-revision', 'apply']) {
  ok(!new RegExp(`/api/owner-meaning-promotion-candidates/[^'"\\s]*${writer}`).test(server),
    `[no-writer] no .../${writer} promotion route introduced`)
}

// ── 4D capture WRITE route UNCHANGED: still exactly one owner-only POST ───────
const captureWriteVerbs = (server.match(/app\.(post|put|patch|delete)\(\s*['"]\/api\/owner-meaning-captures/g) || [])
ok(captureWriteVerbs.length === 1, `[capture lock] exactly ONE owner-meaning-captures write verb remains (got ${captureWriteVerbs.length})`)
ok(/app\.post\(\s*['"]\/api\/owner-meaning-captures['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[capture lock] the 4D capture POST writer is still present + owner-only')

// ── Isolate the promotion read ROUTE region (unique route banner → explicit END marker) ──
// Anchor on the route banner's unique "— OWNER-ONLY READ" suffix (the boot-wiring comment shares
// the slice title but not this suffix) and bound at the self-delimiting END marker, so the region
// is exactly the two GET handlers regardless of neighbouring sections.
const startIdx = server.indexOf('Owner Meaning Promotion — Read-only Candidate Queue (Slice 4G.1) — OWNER-ONLY READ')
ok(startIdx !== -1, 'promotion read ROUTE region banner located')
const endIdx = server.indexOf('Owner Meaning Promotion routes — END', startIdx)
ok(endIdx > startIdx, 'promotion read ROUTE region END marker located')
const rawRegion = server.slice(startIdx, endIdx > startIdx ? endIdx : server.length)
ok(endIdx > startIdx && (endIdx - startIdx) < 8000, `[region] route region is bounded (${endIdx - startIdx} chars)`)
const region = stripComments(rawRegion)

// ── Admin re-exclusion in BOTH read handlers, before any read service call ───
const adminGuards = (region.match(/req\.user\s*&&\s*req\.user\.role\s*===\s*['"]admin['"]/g) || [])
ok(adminGuards.length === 2, `[admin] both read handlers re-exclude admin (got ${adminGuards.length})`)
ok((region.match(/role\s*===\s*['"]admin['"]\s*\)\s*\{\s*return\s+res\.status\(403\)/g) || []).length === 2,
  '[admin] each admin block returns 403')
const listIdx = region.indexOf('listOwnerMeaningPromotionCandidates(')
const getIdx = region.indexOf('getOwnerMeaningPromotionCandidateById(')
const firstAdmin = region.search(/req\.user\s*&&\s*req\.user\.role\s*===\s*['"]admin['"]/)
ok(firstAdmin !== -1 && listIdx !== -1 && firstAdmin < listIdx, '[admin] admin block precedes the list read')
ok(getIdx !== -1 && firstAdmin < getIdx, '[admin] admin block precedes the get-by-id read')

// ── Strictly read-only: no write verb, no SQL mutation in the read region (code only) ────
ok(!/app\.(post|put|patch|delete)\(/.test(region), '[read-only] promotion region adds NO write verb')
ok(!/(INSERT\s+INTO|UPDATE\s|DELETE\s+FROM)\b/i.test(region), '[read-only] promotion region issues NO SQL mutation')

// ── No Venue DNA contact / no review-event emission on GET (code only) ────────
ok(!/mergeVenueDna/.test(region), '[isolation] no mergeVenueDna call in the promotion region')
ok(!new RegExp(`(INSERT\\s+INTO|UPDATE)\\s+(${DNA_STORES.join('|')})\\b`, 'i').test(region),
  '[isolation] no Venue DNA store write in the promotion region')
ok(!/owner_review_opened/.test(region), '[isolation] no owner_review_opened event emitted from a GET')
ok(!/\/promote|\/confirm/.test(region), '[isolation] no /promote or /confirm route')

// ── Venue scoping; venue_id never the client subject ─────────────────────────
ok(/req\.venueId/.test(region), '[scoping] read routes are venue-scoped via req.venueId')
ok(!/defaultVenueId\(/.test(region), '[scoping] no defaultVenueId() in the promotion region')
ok(!/body\.venue_id/.test(region) && !/query\.venue_id/.test(region), '[scoping] venue_id is NOT read from the client (body or query)')
ok(/404/.test(region), '[scoping] cross-venue / unknown id path returns a safe 404')
ok(/allowed_actions/.test(region) && /OWNER_MEANING_PROMOTION_ALLOWED_ACTIONS/.test(region), '[detail] allowed_actions surfaced (all-false constant)')

// ── Service module is READ-ONLY (whole file) ─────────────────────────────────
ok(/export\s+function\s+listOwnerMeaningPromotionCandidates\b/.test(service), '[service] list reader exported')
ok(/export\s+function\s+getOwnerMeaningPromotionCandidateById\b/.test(service), '[service] detail reader exported')
ok(/export\s+function\s+listOwnerMeaningPromotionEvents\b/.test(service), '[service] events reader exported')
ok(/export\s+function\s+resolveSourceCapturesForPromotionCandidate\b/.test(service), '[service] source-capture resolver exported')
ok(!/(INSERT\s+INTO|UPDATE\s|DELETE\s+FROM)\b/i.test(serviceCode), '[service] module issues NO SQL mutation anywhere (read-only)')
ok(!/mergeVenueDna/.test(serviceCode), '[service] module never calls mergeVenueDna')
ok(!/export\s+function\s+(create|approve|reject|requestRevision|apply|promote|merge)\w*Promotion/i.test(service),
  '[service] no writer/approval/apply function is exported')

// ── No UI file touched by this slice (git working-tree audit) ────────────────
let changed = []
try {
  changed = execSync('git -C "' + ROOT + '" status --porcelain', { encoding: 'utf8' })
    .split('\n').map(l => l.slice(3).trim()).filter(Boolean)
} catch { changed = [] }
const uiChanged = changed.filter(p => /\.(jsx|tsx|css)$/i.test(p) || /(^|\/)src\/features\//.test(p) || /OwnerMeaningComposer/.test(p) || /PageRenderer/.test(p))
ok(uiChanged.length === 0, `[no-ui] this slice touches no UI file (offenders: ${uiChanged.join(', ') || 'none'})`)

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
