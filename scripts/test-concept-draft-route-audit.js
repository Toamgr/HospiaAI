#!/usr/bin/env node
/**
 * Static audit of the Concept Drafts Workspace (Slice 2a) routes:
 *   GET  /api/discovery-concept-drafts
 *   GET  /api/discovery-concept-drafts/:conceptRef
 *
 * No DB, no server boot, no network, no AI. These assertions verify — by reading server.js
 * source — the safety properties of the read-only workspace surface:
 *   • both routes exist, are owner/admin GATED, and are venue-scoped via req.venueId;
 *   • there is NO write route on the concept-drafts base (no PUT/POST/PATCH/DELETE);
 *   • the region performs NO audit write, NO DNA store write, NO mergeVenueDna;
 *   • NO /promote, NO /confirm, NO 'confirmed'/'approved'/'promoted' vocabulary;
 *   • the static list route is declared BEFORE the :conceptRef param route (no swallow);
 *   • the service is imported with the two read-only workspace functions.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-concept-draft-route-audit.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const src = readFileSync(resolve(ROOT, 'server.js'), 'utf8')

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

console.log('\nConcept Drafts Workspace routes — static audit\n')

// ── Import ──────────────────────────────────────────────────────────────────────
ok(/import\s*\{[^}]*listConceptDraftsForVenue[^}]*getConceptDraftDetail[^}]*\}\s*from\s*["']\.\/src\/services\/venueIntelligence\/discoveryCandidateReviewService\.js["']/.test(src),
  '[import] server imports listConceptDraftsForVenue + getConceptDraftDetail from the discovery review service')

// ── Routes exist + gating ─────────────────────────────────────────────────────
ok(/app\.get\(\s*['"]\/api\/discovery-concept-drafts['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*,\s*['"]admin['"]\s*\)/.test(src),
  '[GET list] exists, owner/admin gated')
ok(/app\.get\(\s*['"]\/api\/discovery-concept-drafts\/:conceptRef['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*,\s*['"]admin['"]\s*\)/.test(src),
  '[GET detail] exists, owner/admin gated')

// ── No write route on this base (read-only slice) ─────────────────────────────
ok(!/app\.(put|post|patch|delete)\(\s*['"]\/api\/discovery-concept-drafts/.test(src),
  '[read-only] NO put/post/patch/delete route on /api/discovery-concept-drafts')

// ── Route ordering: static list BEFORE param route (no swallow) ────────────────
const listIdx = src.indexOf("app.get('/api/discovery-concept-drafts'")
const paramIdx = src.indexOf("app.get('/api/discovery-concept-drafts/:conceptRef'")
ok(listIdx !== -1 && paramIdx !== -1, 'both concept-draft routes located')
ok(listIdx !== -1 && paramIdx !== -1 && listIdx < paramIdx,
  '[ordering] static list route precedes the :conceptRef param route')

// ── Isolate the concept-drafts route region ───────────────────────────────────
// The region ends at the START of the next discovery section. Originally that was the
// 'Venue Intelligence Bridge' header; the Evidence Summary (EAE Slice 1) section was later
// inserted between, so terminate at whichever next-section header comes first. (Without this,
// the next section's honest guardrail comments — which NAME mergeVenueDna/promote/DELETE to
// declare they are unused — would bleed into this region and falsely fail the audit.)
const startIdx = listIdx
const nextSectionIdxs = [
  src.indexOf('Evidence Summary (EAE Slice 1)', startIdx),
  src.indexOf('Venue Intelligence Bridge', startIdx),
].filter(i => i > startIdx)
const endIdx = nextSectionIdxs.length ? Math.min(...nextSectionIdxs) : -1
const region = endIdx > startIdx ? src.slice(startIdx, endIdx) : src.slice(startIdx, startIdx + 4000)

// ── Venue scoping ─────────────────────────────────────────────────────────────
ok((region.match(/req\.venueId/g) || []).length >= 2, '[scoping] both routes are venue-scoped via req.venueId')
ok(!/defaultVenueId\(/.test(region), '[scoping] no defaultVenueId() in the handlers')

// ── No writes / no DNA / no confirmation vocabulary in the region ─────────────
ok(!/upsertDiscoveryReview/.test(region), '[read-only] region does not call the review writer')
ok(!/INSERT\s+INTO|UPDATE\s+\w+\s+SET/i.test(region), '[read-only] region performs no INSERT/UPDATE')
ok(!/mergeVenueDna/.test(region), '[isolation] no mergeVenueDna in the routes')
ok(!/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment)\b/i.test(region),
  '[isolation] no canonical Venue DNA write in the routes')
ok(!/venue_dna_json/.test(region), '[isolation] no venue_dna_json in the routes')
ok(!/['"](confirmed|approved|promoted)['"]/.test(region), '[isolation] no confirmed/approved/promoted vocabulary')
ok(!/\/promote|\/confirm/.test(region), '[isolation] no /promote or /confirm route')
ok(!/\bDELETE\b/.test(region), '[isolation] no DELETE in the routes')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
