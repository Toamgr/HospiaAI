#!/usr/bin/env node
/**
 * Static source guardrail audit for the Owner Meaning Promotion CANDIDATE GENERATION layer (Slice 4J):
 *   - the writer service: src/services/venueIntelligence/ownerMeaningPromotionGenerationService.js
 *   - the write route:    POST /api/owner-meaning-promotion-candidates/generate  (server.js)
 *
 * No DB, no server boot, no network, no AI. Verifies — by reading source — that the candidate
 * generation layer is owner-only, admin-blocked, venue-scoped, and writes ONLY the two promotion
 * tables: it NEVER mutates Venue DNA, NEVER imports/calls mergeVenueDna, adds NO approve / reject /
 * request-revision / apply writer, accepts NO client venue_id, and emits NO owner_review_opened.
 * Also confirms the generation route lives OUTSIDE the read-only region (so the read region's
 * read-only guarantees are unaffected) and that NO UI file was touched by this slice.
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-owner-meaning-promotion-generate-route-audit.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const GEN_SERVICE_REL = 'src/services/venueIntelligence/ownerMeaningPromotionGenerationService.js'
const server = readFileSync(resolve(ROOT, 'server.js'), 'utf8')
const genService = readFileSync(resolve(ROOT, GEN_SERVICE_REL), 'utf8')

const DNA_STORES = ['venue_dna_json', 'venue_intelligence', 'venue_briefs', 'venue_dna_enrichment', 'venue_intelligence_candidates']

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

// Strip block + line comments so negative checks test CODE, not the doctrine prose (which
// legitimately NAMES the forbidden tokens to document the guarantee).
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

console.log('\nOwner Meaning Promotion GENERATION — static source guardrail audit\n')

const genCode = stripComments(genService)

// ── Import wiring ────────────────────────────────────────────────────────────
ok(/import\s*\{\s*generateOwnerMeaningPromotionCandidate\s*\}\s*from\s*["']\.\/src\/services\/venueIntelligence\/ownerMeaningPromotionGenerationService\.js["']/.test(server),
  '[import] server imports generateOwnerMeaningPromotionCandidate from the generation service')

// ── The write route exists, owner-only, admin re-excluded ────────────────────
ok(/app\.post\(\s*['"]\/api\/owner-meaning-promotion-candidates\/generate['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[route] POST .../generate exists, owner-ONLY gated')

// Isolate the generation ROUTE region (banner → END marker) to bound the route-level checks.
const startIdx = server.indexOf('Owner Meaning Promotion — Candidate Generation Runtime Writer (Slice 4J) — OWNER-ONLY WRITE')
ok(startIdx !== -1, 'generation ROUTE region banner located')
const endIdx = server.indexOf('Owner Meaning Promotion generation route — END', startIdx)
ok(endIdx > startIdx, 'generation ROUTE region END marker located')
const rawRegion = server.slice(startIdx, endIdx > startIdx ? endIdx : server.length)
ok(endIdx > startIdx && (endIdx - startIdx) < 6000, `[region] generation route region is bounded (${endIdx - startIdx} chars)`)
const region = stripComments(rawRegion)

// Admin re-exclusion precedes the generation call.
ok(/req\.user\s*&&\s*req\.user\.role\s*===\s*['"]admin['"]/.test(region), '[admin] route re-excludes admin in-handler')
const adminIdx = region.search(/req\.user\s*&&\s*req\.user\.role\s*===\s*['"]admin['"]/)
const genCallIdx = region.indexOf('generateOwnerMeaningPromotionCandidate(')
ok(adminIdx !== -1 && genCallIdx !== -1 && adminIdx < genCallIdx, '[admin] admin block precedes the generation call')
ok(/role\s*===\s*['"]admin['"]\s*\)\s*\{\s*return\s+res\.status\(403\)/.test(region), '[admin] admin block returns 403')

// Venue scope; venue_id never the client subject; safe 400/404.
ok(/req\.venueId/.test(region), '[scoping] route is venue-scoped via req.venueId')
ok(!/body\.venue_id/.test(region) && !/query\.venue_id/.test(region), '[scoping] venue_id is NOT read from the client (body or query)')
ok(!/defaultVenueId\(/.test(region), '[scoping] no defaultVenueId() in the generation region')
ok(/status\(400\)/.test(region), '[validation] missing capture_id path returns a safe 400')
ok(/status\(404\)/.test(region), '[scoping] cross-venue / unknown capture path returns a safe 404')

// No DNA contact / no review-event / no other writer in the generation region.
ok(!/mergeVenueDna/.test(region), '[isolation] no mergeVenueDna call in the generation region')
ok(!new RegExp(`(INSERT\\s+INTO|UPDATE)\\s+(${DNA_STORES.join('|')})\\b`, 'i').test(region),
  '[isolation] no Venue DNA store write in the generation region')
ok(!/owner_review_opened/.test(region), '[isolation] no owner_review_opened emitted by the generation route')

// ── Promotion write verbs across server.js: the generate POST (4J) + the three owner review
//    decisions (4L: approve-meaning / reject / request-revision). NO apply / promote / propose-dna /
//    mark-evidence-only writer may exist (those remain deferred to future DDL slices). ───────────
const writeVerbs = (server.match(/app\.(post|put|patch|delete)\(\s*['"]\/api\/owner-meaning-promotion-candidates/g) || [])
ok(writeVerbs.length === 4, `[surface] exactly FOUR promotion write verbs exist — generate + 3 review (got ${writeVerbs.length})`)
ok(/app\.post\(\s*['"]\/api\/owner-meaning-promotion-candidates\/generate['"]/.test(server), '[surface] the generate write route still exists')
// The DNA-crossing / deferred writers must NOT exist as routes (apply-to-dna, propose-dna-patch,
// mark-evidence-only, promote, confirm). 'approve-meaning' / 'reject' / 'request-revision' are now
// LEGITIMATE 4L review routes and are intentionally NOT in this forbidden list.
for (const writer of ['apply', 'apply-to-dna', 'propose-dna-patch', 'mark-evidence-only', 'promote', 'confirm']) {
  ok(!new RegExp(`/api/owner-meaning-promotion-candidates/[^'"\\s]*${writer}`).test(server),
    `[no-writer] no .../${writer} promotion route introduced`)
}
// The generation REGION itself still introduces no approve/reject/apply writer (those live in the
// separate 4L review region, never inside the generation region).
for (const writer of ['approve', 'reject', 'request-revision', 'apply']) {
  ok(!new RegExp(`/api/owner-meaning-promotion-candidates/[^'"\\s]*${writer}`).test(region),
    `[no-writer] generation region introduces no .../${writer} route`)
}

// ── The generation service is a BOUNDED writer ───────────────────────────────
ok(/export\s+function\s+generateOwnerMeaningPromotionCandidate\b/.test(genService), '[service] generator function exported')
// Writes ONLY the two promotion tables (candidate + event); never any other table.
const insertTargets = [...genCode.matchAll(/INSERT\s+INTO\s+([a-z_]+)/gi)].map(m => m[1].toLowerCase())
ok(insertTargets.length > 0, '[service] generator performs INSERTs (it is the writer)')
ok(insertTargets.every(t => t === 'owner_meaning_promotion_candidates' || t === 'owner_meaning_promotion_events'),
  `[service] generator INSERTs ONLY the two promotion tables (got: ${[...new Set(insertTargets)].join(', ')})`)
// Never UPDATE/DELETE anything (no in-place mutation; append-only + a single candidate INSERT).
ok(!/(UPDATE\s|DELETE\s+FROM)\b/i.test(genCode), '[service] generator issues NO UPDATE/DELETE (append-only candidate + event)')
// Never touches Venue DNA / capture-write tables.
ok(!/mergeVenueDna/.test(genCode), '[service] generator never calls mergeVenueDna')
ok(!new RegExp(`(INSERT\\s+INTO|UPDATE|DELETE\\s+FROM)\\s+(${DNA_STORES.join('|')})\\b`, 'i').test(genCode),
  '[service] generator never writes a Venue DNA store')
ok(!/(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+owner_meaning_capture/i.test(genCode),
  '[service] generator never writes owner_meaning_captures (evidence is read-only)')
// It reads captures only via a venue-scoped SELECT.
ok(/SELECT[\s\S]*FROM\s+owner_meaning_captures[\s\S]*venue_id\s*=\s*\?/i.test(genService),
  '[service] generator reads captures via a venue-scoped SELECT')
// No approve/reject/apply writer exported from the generation service.
ok(!/export\s+function\s+(approve|reject|requestRevision|apply|promote|merge)\w*/i.test(genService),
  '[service] no approve/reject/apply/promote writer is exported from the generation service')
// application stays blocked / non-applied posture is encoded (no applied_to_dna_future transition).
ok(!/applied_to_dna_future/.test(genCode), '[service] generator never transitions into applied_to_dna_future')

// ── No UI churn from this BACKEND slice (git working-tree audit) ─────────────
let changed = []
try {
  changed = execSync('git -C "' + ROOT + '" status --porcelain', { encoding: 'utf8' })
    .split('\n').map(l => l.slice(3).trim()).filter(Boolean)
} catch { changed = [] }
const uiChanged = changed.filter(p => /\.(jsx|tsx|css)$/i.test(p) || /(^|\/)src\/features\//.test(p))
ok(uiChanged.length === 0, `[no-ui] Slice 4J touched NO UI file (offenders: ${uiChanged.join(', ') || 'none'})`)

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
