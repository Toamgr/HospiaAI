#!/usr/bin/env node
/**
 * Static audit of the New Venue Discovery — Fidelity Review Persistence routes (Slice 1):
 *   GET  /api/discovery-reviews
 *   GET  /api/discovery-reviews/:reviewId
 *   PUT  /api/discovery-reviews/:reviewId
 *
 * No DB, no server boot, no network, no AI. These assertions verify — by reading server.js
 * source — the safety properties of the persistence surface:
 *   • routes exist, are venue-scoped, owner-only WRITE + owner/admin READ;
 *   • the write derives provenance / hard-codes record_space server-side (no client trust);
 *   • NO route accepts a DNA payload, calls mergeVenueDna, or writes a canonical DNA store;
 *   • NO /promote, NO /confirm, NO 'confirmed' tier;
 *   • both tables are booted and the service is imported.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-discovery-review-route-audit.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const src = readFileSync(resolve(ROOT, 'server.js'), 'utf8')

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

console.log('\nDiscovery fidelity-review routes — static audit\n')

// ── Boot + import ──────────────────────────────────────────────────────────────
ok(/import\s*\{[^}]*DISCOVERY_CANDIDATE_REVIEWS_DDL[^}]*\}\s*from\s*["']\.\/src\/services\/venueIntelligence\/discoveryCandidateReviewService\.js["']/.test(src),
  '[boot] server imports the discovery review service')
ok(/db\.exec\(DISCOVERY_CANDIDATE_REVIEWS_DDL\)/.test(src), '[boot] boots discovery_candidate_reviews table')
ok(/db\.exec\(DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL\)/.test(src), '[boot] boots discovery_candidate_review_events table')

// ── Routes exist + gating ───────────────────────────────────────────────────────
ok(/app\.get\(\s*['"]\/api\/discovery-reviews['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*,\s*['"]admin['"]\s*\)/.test(src),
  '[GET list] exists, owner/admin gated')
ok(/app\.get\(\s*['"]\/api\/discovery-reviews\/:reviewId['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*,\s*['"]admin['"]\s*\)/.test(src),
  '[GET by-id] exists, owner/admin gated')
ok(/app\.put\(\s*['"]\/api\/discovery-reviews\/:reviewId['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(src),
  '[PUT] exists, owner-ONLY (admin is never a fidelity-saver)')
// admin must NOT be on the write route.
ok(!/app\.put\(\s*['"]\/api\/discovery-reviews\/:reviewId['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*,\s*['"]admin['"]/.test(src),
  '[PUT] admin is NOT granted write')

// ── Isolate the route region (the three routes up to the Bridge section) ────────
const startIdx = src.indexOf("app.get('/api/discovery-reviews'")
ok(startIdx !== -1, 'route region located')
const endIdx = src.indexOf('Venue Intelligence Bridge', startIdx)
const region = endIdx > startIdx ? src.slice(startIdx, endIdx) : src.slice(startIdx, startIdx + 4000)

// ── Venue scoping ───────────────────────────────────────────────────────────────
ok((region.match(/req\.venueId/g) || []).length >= 3, '[scoping] every route is venue-scoped via req.venueId')
ok(!/defaultVenueId\(/.test(region), '[scoping] no defaultVenueId() in any handler')

// ── concept_ref required; provenance/record_space server-derived ────────────────
ok(/concept_ref/.test(region), '[PUT] concept_ref is read from the body and passed to the service (validated → 400)')
ok(/reviewed_by:\s*\(req\.user/.test(region), '[PUT] reviewed_by derived from req.user, not the client body')
// record_space + provenance are NOT read from the client body in the route.
ok(!/body\.record_space/.test(region), '[PUT] record_space is NOT read from the client (server-hard-coded in the service)')
ok(!/body\.provenance/.test(region), '[PUT] provenance is NOT read from the client (server-set in the service)')

// ── No Venue DNA contact, no confirmation, no promotion ─────────────────────────
ok(!/mergeVenueDna/.test(region), '[isolation] no mergeVenueDna in the routes')
ok(!/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment)\b/i.test(region),
  '[isolation] no canonical Venue DNA write in the routes')
ok(!/venue_dna_json/.test(region), '[isolation] no venue_dna_json write in the routes')
ok(!/['"]confirmed['"]/.test(region), '[isolation] no confirmed-DNA tier literal in the routes')
ok(!/\/promote|\/confirm/.test(region), '[isolation] no /promote or /confirm route')
ok(!/\bDELETE\b/.test(region), '[isolation] no DELETE in the routes')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
