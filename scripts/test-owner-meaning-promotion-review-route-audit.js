#!/usr/bin/env node
/**
 * Static source guardrail audit for the Owner Meaning Promotion OWNER REVIEW ACTION layer (Slice 4L):
 *   - the review writer:  src/services/venueIntelligence/ownerMeaningPromotionReviewService.js
 *   - the review routes:  POST .../:candidateId/approve-meaning | reject | request-revision  (server.js)
 *
 * No DB, no server boot, no network, no AI. Verifies — by reading source — that the review layer is
 * owner-only, admin-blocked, venue-scoped, and writes ONLY the two promotion tables: it NEVER mutates
 * Venue DNA, NEVER imports/calls mergeVenueDna, adds NO apply-to-dna / propose-dna-patch /
 * mark-evidence-only writer, accepts NO client venue_id, emits NO owner_review_opened, and changes NO
 * DDL / status-CHECK / event-vocabulary. Also confirms the read service stays SELECT-only, the GET
 * routes stay read-only, and NO UI file was touched by this slice.
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-owner-meaning-promotion-review-route-audit.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const REVIEW_SERVICE_REL = 'src/services/venueIntelligence/ownerMeaningPromotionReviewService.js'
const READ_SERVICE_REL = 'src/services/venueIntelligence/ownerMeaningPromotionService.js'
const server = readFileSync(resolve(ROOT, 'server.js'), 'utf8')
const reviewService = readFileSync(resolve(ROOT, REVIEW_SERVICE_REL), 'utf8')
const readService = readFileSync(resolve(ROOT, READ_SERVICE_REL), 'utf8')

const DNA_STORES = ['venue_dna_json', 'venue_intelligence', 'venue_briefs', 'venue_dna_enrichment', 'venue_intelligence_candidates']

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

// Strip block + line comments so negative checks test CODE, not the doctrine prose (which legitimately
// NAMES the forbidden tokens to document the guarantee).
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

console.log('\nOwner Meaning Promotion REVIEW — static source guardrail audit\n')

const reviewCode = stripComments(reviewService)

// ── Import wiring ────────────────────────────────────────────────────────────
ok(/import\s*\{[^}]*approveOwnerMeaningPromotionCandidateMeaning[^}]*\}\s*from\s*["']\.\/src\/services\/venueIntelligence\/ownerMeaningPromotionReviewService\.js["']/.test(server),
  '[import] server imports the review writers from the review service')

// ── The three review routes exist, owner-only ────────────────────────────────
for (const action of ['approve-meaning', 'reject', 'request-revision']) {
  ok(new RegExp(`app\\.post\\(\\s*['"]\\/api\\/owner-meaning-promotion-candidates\\/:candidateId\\/${action}['"]\\s*,\\s*requireAuth\\(\\s*['"]owner['"]\\s*\\)`).test(server),
    `[route] POST .../:candidateId/${action} exists, owner-ONLY gated`)
}

// Isolate the review ROUTE region (banner → END marker) to bound the route-level checks.
const startIdx = server.indexOf('Owner Meaning Promotion — Owner Review Action Runtime (Slice 4L) — OWNER-ONLY DECISIONS')
ok(startIdx !== -1, 'review ROUTE region banner located')
const endIdx = server.indexOf('Owner Meaning Promotion review routes — END', startIdx)
ok(endIdx > startIdx, 'review ROUTE region END marker located')
const rawRegion = server.slice(startIdx, endIdx > startIdx ? endIdx : server.length)
ok(endIdx > startIdx && (endIdx - startIdx) < 7000, `[region] review route region is bounded (${endIdx - startIdx} chars)`)
const region = stripComments(rawRegion)

// Admin re-exclusion exists in the shared handler and precedes the review call.
ok(/req\.user\s*&&\s*req\.user\.role\s*===\s*['"]admin['"]/.test(region), '[admin] review handler re-excludes admin in-handler')
ok(/role\s*===\s*['"]admin['"]\s*\)\s*\{\s*return\s+res\.status\(403\)/.test(region), '[admin] admin block returns 403')
const adminIdx = region.search(/req\.user\s*&&\s*req\.user\.role\s*===\s*['"]admin['"]/)
const reviewCallIdx = region.indexOf('reviewFn(')
ok(adminIdx !== -1 && reviewCallIdx !== -1 && adminIdx < reviewCallIdx, '[admin] admin block precedes the review call')

// Venue scope; venue_id never the client subject; safe 404 / 409 / 400 mapping.
ok(/req\.venueId/.test(region), '[scoping] route is venue-scoped via req.venueId')
ok(!/body\.venue_id/.test(region) && !/query\.venue_id/.test(region), '[scoping] venue_id is NOT read from the client (body or query)')
ok(!/defaultVenueId\(/.test(region), '[scoping] no defaultVenueId() in the review region')
ok(/status\(404\)/.test(region), '[scoping] cross-venue / unknown candidate path returns a safe 404')
ok(/status\(409\)/.test(region), '[transition] non-reviewable candidate path returns a safe 409')

// No DNA contact / no review-open event / no deferred writer in the review region.
ok(!/mergeVenueDna/.test(region), '[isolation] no mergeVenueDna call in the review region')
ok(!new RegExp(`(INSERT\\s+INTO|UPDATE)\\s+(${DNA_STORES.join('|')})\\b`, 'i').test(region),
  '[isolation] no Venue DNA store write in the review region')
ok(!/owner_review_opened/.test(region), '[isolation] no owner_review_opened emitted by the review routes')

// ── Promotion write surface: generate (4J) + 3 review (4L); NO deferred/DNA writers ──
const writeVerbs = (server.match(/app\.(post|put|patch|delete)\(\s*['"]\/api\/owner-meaning-promotion-candidates/g) || [])
ok(writeVerbs.length === 4, `[surface] exactly FOUR promotion write verbs exist — generate + 3 review (got ${writeVerbs.length})`)
for (const writer of ['apply', 'apply-to-dna', 'propose-dna-patch', 'mark-evidence-only', 'promote', 'confirm']) {
  ok(!new RegExp(`/api/owner-meaning-promotion-candidates/[^'"\\s]*${writer}`).test(server),
    `[no-writer] no .../${writer} promotion route introduced (deferred / DNA-crossing)`)
}

// ── The review service is a BOUNDED writer ───────────────────────────────────
ok(/export\s+function\s+applyOwnerMeaningPromotionReviewAction\b/.test(reviewService), '[service] review core function exported')
for (const fn of ['approveOwnerMeaningPromotionCandidateMeaning', 'rejectOwnerMeaningPromotionCandidate', 'requestRevisionOwnerMeaningPromotionCandidate']) {
  ok(new RegExp(`export\\s+function\\s+${fn}\\b`).test(reviewService), `[service] ${fn} exported`)
}
// Writes ONLY the two promotion tables (UPDATE candidate + INSERT event); never any other table.
const insertTargets = [...reviewCode.matchAll(/INSERT\s+INTO\s+([a-z_]+)/gi)].map(m => m[1].toLowerCase())
const updateTargets = [...reviewCode.matchAll(/UPDATE\s+([a-z_]+)/gi)].map(m => m[1].toLowerCase())
ok(insertTargets.length > 0 && insertTargets.every(t => t === 'owner_meaning_promotion_events'),
  `[service] review INSERTs ONLY the events table (got: ${[...new Set(insertTargets)].join(', ') || 'none'})`)
ok(updateTargets.length > 0 && updateTargets.every(t => t === 'owner_meaning_promotion_candidates'),
  `[service] review UPDATEs ONLY the candidates table (got: ${[...new Set(updateTargets)].join(', ') || 'none'})`)
ok(!/DELETE\s+FROM/i.test(reviewCode), '[service] review issues NO DELETE (append-only audit; status update only)')
// Never touches Venue DNA / capture tables / mergeVenueDna.
ok(!/mergeVenueDna/.test(reviewCode), '[service] review never calls mergeVenueDna')
ok(!new RegExp(`(INSERT\\s+INTO|UPDATE|DELETE\\s+FROM)\\s+(${DNA_STORES.join('|')})\\b`, 'i').test(reviewCode),
  '[service] review never writes a Venue DNA store')
ok(!/(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+owner_meaning_capture/i.test(reviewCode),
  '[service] review never writes owner_meaning_captures (evidence is read-only)')
// Reads the candidate only via a venue-scoped SELECT (record_space-scoped).
ok(/SELECT[\s\S]*FROM\s+owner_meaning_promotion_candidates[\s\S]*venue_id\s*=\s*\?/i.test(reviewService),
  '[service] review reads the candidate via a venue-scoped SELECT')
// No apply / propose-dna / mark-evidence-only / merge writer exported.
ok(!/export\s+function\s+(apply\w*ToDna|proposeDna\w*|markEvidence\w*|merge\w*)/i.test(reviewService),
  '[service] no apply-to-dna / propose-dna-patch / mark-evidence-only / merge writer exported')
// Never transitions into the reserved applied_to_dna_future status, and never sets applied_* fields.
ok(!/applied_to_dna_future/.test(reviewCode), '[service] review never transitions into applied_to_dna_future')
ok(!/\bapplied_at\s*=\s*(?!CURRENT_TIMESTAMP\s+AS)/.test(reviewCode) || !/SET[\s\S]*applied_by_user_id\s*=/.test(reviewCode),
  '[service] review never sets applied_by_user_id / dna_application_ref')
// Uses ONLY existing 4F.1 event types (owner_approved / owner_rejected / owner_requested_revision).
ok(/owner_approved/.test(reviewCode) && /owner_rejected/.test(reviewCode) && /owner_requested_revision/.test(reviewCode),
  '[vocabulary] review uses the existing 4F.1 event types (owner_approved / owner_rejected / owner_requested_revision)')
ok(!/candidate_generated|owner_marked_evidence_only|dna_patch_proposed|dna_patch_applied/.test(reviewCode),
  '[vocabulary] review introduces NO new event vocabulary (no evidence-only / dna-patch events)')

// ── No DDL / CHECK vocabulary change in this slice ───────────────────────────
ok(!/CREATE\s+TABLE/i.test(reviewCode), '[ddl] review service creates no table')
// The read service still owns the DDL, and its status/event CHECK sets are unchanged in this slice.
ok(/status\s+IN\s*\('draft_suggestion','needs_owner_review','owner_approved','owner_rejected','revision_requested','superseded','expired','application_blocked','applied_to_dna_future'\)/.test(readService),
  '[ddl] candidate status CHECK vocabulary is unchanged (4F.1)')
ok(/event_type\s+IN\s*\('candidate_created','candidate_refreshed','owner_review_opened','owner_requested_revision','owner_rejected','owner_approved','candidate_superseded','candidate_expired','application_blocked','applied_to_dna_future'\)/.test(readService),
  '[ddl] event_type CHECK vocabulary is unchanged (4F.1)')

// ── Read service stays SELECT-only; GET routes stay read-only ────────────────
const readCode = stripComments(readService)
ok(!/(INSERT\s+INTO|UPDATE\s|DELETE\s+FROM)\b/i.test(readCode.replace(/CREATE\s+TABLE[\s\S]*?;/gi, '')),
  '[read] read service remains SELECT-only (no INSERT/UPDATE/DELETE outside DDL)')
// The two GET routes must not emit owner_review_opened (no write on read).
const getListIdx = server.indexOf("app.get('/api/owner-meaning-promotion-candidates'")
const genBannerIdx = server.indexOf('Owner Meaning Promotion — Candidate Generation Runtime Writer (Slice 4J)')
ok(getListIdx !== -1 && genBannerIdx > getListIdx, '[read] GET routes precede the write regions')
const readRegion = stripComments(server.slice(getListIdx, genBannerIdx))
ok(!/owner_review_opened/.test(readRegion), '[read] GET routes emit no owner_review_opened (read-only)')

// ── No UI churn from this BACKEND slice (git working-tree audit) ─────────────
let changed = []
try {
  changed = execSync('git -C "' + ROOT + '" status --porcelain', { encoding: 'utf8' })
    .split('\n').map(l => l.slice(3).trim()).filter(Boolean)
} catch { changed = [] }
const uiChanged = changed.filter(p => /\.(jsx|tsx|css)$/i.test(p) || /(^|\/)src\/features\//.test(p))
ok(uiChanged.length === 0, `[no-ui] Slice 4L touched NO UI file (offenders: ${uiChanged.join(', ') || 'none'})`)

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
