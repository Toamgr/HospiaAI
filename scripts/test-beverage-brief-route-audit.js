#!/usr/bin/env node
/**
 * Static source guardrail audit for Beverage Slice 1A (Owner Beverage Brief → F&B Inbox):
 *   - services:  src/services/beverage/ownerBeverageBriefService.js
 *                src/services/beverage/fnbBriefReviewService.js
 *   - routes:    the /api/owner-beverage-briefs* and /api/fnb-* handlers in server.js
 *   - UI:        src/features/beverage/OwnerBeverageBrief.jsx, BeverageBriefInbox.jsx
 *
 * No DB, no server boot, no network, no AI. Verifies by reading source:
 *   • role gates: owner routes are owner-gated (writes exclude admin BEFORE the writer);
 *     F&B routes are fb_director-gated; unauthorized roles never reach the inbox;
 *   • venue scoping: handlers use req.venueId only; venue_id is never read from the client body;
 *   • isolation: no Venue DNA store contact, no AI/generation call, no fallback content;
 *   • honesty: the inbox UI carries the honest empty state and NO static sample brief data;
 *   • registration: tables booted, pages registered, page roles correct.
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-beverage-brief-route-audit.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const read = (rel) => readFileSync(resolve(ROOT, rel), 'utf8')

const server = read('server.js')
const briefSvc = read('src/services/beverage/ownerBeverageBriefService.js')
const reviewSvc = read('src/services/beverage/fnbBriefReviewService.js')
const ownerUi = read('src/features/beverage/OwnerBeverageBrief.jsx')
const inboxUi = read('src/features/beverage/BeverageBriefInbox.jsx')
const navConfig = read('src/config/navigationConfig.js')
const pageRenderer = read('src/PageRenderer.jsx')
const briefApi = read('src/services/api/beverageBriefApi.js')

const DNA_STORES = ['venue_dna_json', 'venue_intelligence', 'venue_briefs', 'venue_dna_enrichment']

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

console.log('\nBeverage Slice 1A — static source guardrail audit\n')

// ── Boot + import (server.js) ────────────────────────────────────────────────
ok(/import\s*\{[^}]*OWNER_BEVERAGE_BRIEFS_DDL[^}]*\}\s*from\s*["']\.\/src\/services\/beverage\/ownerBeverageBriefService\.js["']/.test(server),
  '[boot] server imports the owner beverage brief service')
ok(/import\s*\{[^}]*FNB_BRIEF_REVIEWS_DDL[^}]*\}\s*from\s*["']\.\/src\/services\/beverage\/fnbBriefReviewService\.js["']/.test(server),
  '[boot] server imports the F&B brief review service')
ok(/db\.exec\(OWNER_BEVERAGE_BRIEFS_DDL\)/.test(server), '[boot] boots owner_beverage_briefs')
ok(/db\.exec\(BEVERAGE_BRIEF_EVENTS_DDL\)/.test(server), '[boot] boots beverage_brief_events')
ok(/db\.exec\(FNB_BRIEF_REVIEWS_DDL\)/.test(server), '[boot] boots fnb_brief_reviews')

// ── Route gates ──────────────────────────────────────────────────────────────
ok(/app\.post\(\s*['"]\/api\/owner-beverage-briefs['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[owner POST] create is owner-gated')
ok(/app\.put\(\s*['"]\/api\/owner-beverage-briefs\/:briefId['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[owner PUT] draft edit is owner-gated')
ok(/app\.post\(\s*['"]\/api\/owner-beverage-briefs\/:briefId\/submit['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[owner submit] is owner-gated')
ok(/app\.get\(\s*['"]\/api\/owner-beverage-briefs['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[owner GET list] is owner-gated')
ok(/app\.get\(\s*['"]\/api\/fnb-beverage-brief-inbox['"]\s*,\s*requireAuth\(\s*['"]fb_director['"]\s*\)/.test(server),
  '[inbox GET] is fb_director-gated (owner/manager/bar_manager blocked at requireAuth)')
ok(/app\.post\(\s*['"]\/api\/fnb-brief-reviews['"]\s*,\s*requireAuth\(\s*['"]fb_director['"]\s*\)/.test(server),
  '[review POST] is fb_director-gated')
ok(/app\.patch\(\s*['"]\/api\/fnb-brief-reviews\/:reviewId['"]\s*,\s*requireAuth\(\s*['"]fb_director['"]\s*\)/.test(server),
  '[review PATCH] is fb_director-gated')

// ── Isolate the Slice 1A route region ────────────────────────────────────────
// The routes header (— F&B Inbox) is distinct from the DDL boot comment (— F&B review);
// anchoring on the header keeps the region tight around the Slice 1A handlers only.
const startIdx = server.indexOf('Beverage Slice 1A — Owner Beverage Direction Brief → F&B Inbox')
const endIdx = server.indexOf('Beverage Slice 1A routes — END')
ok(startIdx !== -1 && endIdx > startIdx, '[region] Slice 1A route region located and bounded')
const region = server.slice(startIdx, endIdx)

// Strip // and /* */ comments so doctrine prose (e.g. "before the UPDATE lands") never
// counts as SQL — only real statements in code/template literals are audited.
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/[^\n]*/gm, '').replace(/([^:'"])\/\/[^\n]*/g, '$1')

// Owner writes exclude the platform-admin bypass BEFORE the writer runs.
for (const writer of ['createOwnerBeverageBrief(', 'updateOwnerBeverageBriefDraft(', 'submitOwnerBeverageBrief(']) {
  const wIdx = region.indexOf(writer)
  ok(wIdx !== -1, `[admin] region calls ${writer.slice(0, -1)}`)
  const before = region.slice(0, wIdx)
  const lastGuard = before.lastIndexOf("req.user.role === 'admin'")
  ok(lastGuard !== -1, `[admin] admin re-exclusion precedes ${writer.slice(0, -1)} (zero rows on admin write)`)
}

// Venue scoping — server-resolved only, never the client body.
ok(/req\.venueId/.test(region), '[scoping] region uses req.venueId')
ok(!/body\.venue_id|req\.body\.venue_id|params\.venueId/.test(region), '[scoping] venue_id is never read from the client')
ok(!/body\.owner_user_id|body\.reviewer_user_id|body\.field_provenance|body\.status\s*===\s*['"]submitted/.test(region),
  '[input] author / provenance are never client-supplied')

// Isolation — no DNA contact, no AI, no generation in the region or the services.
for (const [name, src] of [['route region', stripComments(region)], ['brief service', stripComments(briefSvc)], ['review service', stripComments(reviewSvc)]]) {
  ok(!/mergeVenueDna/.test(src), `[isolation] ${name}: no mergeVenueDna`)
  ok(!new RegExp(`(INSERT\\s+INTO|UPDATE)\\s+(${DNA_STORES.join('|')})\\b`, 'i').test(src),
    `[isolation] ${name}: no Venue DNA store write`)
  ok(!/askGemini|openai|generateCocktail|cocktailProposal|fetch\s*\(/i.test(src),
    `[isolation] ${name}: no AI / generation / network call`)
}
ok((stripComments(briefSvc).match(/(INSERT\s+INTO|UPDATE)\s+(\w+)/g) || []).every(s => /owner_beverage_briefs|beverage_brief_events/i.test(s)),
  '[isolation] brief service writes only its two tables')
ok((stripComments(reviewSvc).match(/(INSERT\s+INTO|UPDATE)\s+(\w+)/g) || []).every(s => /fnb_brief_reviews|beverage_brief_events/i.test(s)),
  '[isolation] review service writes only reviews + events — NEVER owner_beverage_briefs')

// ── UI honesty ───────────────────────────────────────────────────────────────
ok(inboxUi.includes('No beverage briefs waiting.'), '[ui] inbox carries the honest empty state')
// A doctrine comment may NAME sample/demo content to forbid it; what must never exist is a
// concrete fake-data identifier or seeded brief object in runtime source.
for (const [name, src] of [['owner form', ownerUi], ['inbox', inboxUi]]) {
  ok(!/mockBrief|fakeBrief|sampleBrief|demoBrief|placeholderBrief|FAKE_|SAMPLE_|DEMO_|MOCK_/i.test(src),
    `[ui] ${name}: no static sample/demo brief identifier`)
  ok(!/fields:\s*\{[^}]*['"][^'"]{3,}['"]/.test(src.replace(/\/\/[^\n]*/g, '')),
    `[ui] ${name}: no hardcoded brief field content object`)
  ok(!/askGemini|generateCocktail|cocktailProposal/i.test(src), `[ui] ${name}: no AI generation call`)
}
ok(!/placeholder=/.test(ownerUi), '[ui] owner form inputs carry no example placeholder content')
// The API client speaks only to the Slice 1A routes.
ok(!/\/api\/(?!owner-beverage-briefs|fnb-beverage-brief-inbox|fnb-brief-reviews)/.test(briefApi),
  '[ui] beverageBriefApi calls only the Slice 1A routes')

// ── Registration ─────────────────────────────────────────────────────────────
ok(/beverageBrief:\s*\{[^}]*roles:\s*\[\s*['"]owner['"]\s*,\s*['"]admin['"]\s*\]/s.test(navConfig),
  '[nav] beverageBrief page is owner/admin')
ok(/beverageBriefInbox:\s*\{[^}]*roles:\s*\[\s*['"]fb_director['"]\s*\]/s.test(navConfig),
  '[nav] beverageBriefInbox page is fb_director ONLY (bar_manager and admin page-gated out)')
ok(/beverageBrief:\s*<OwnerBeverageBrief/.test(pageRenderer), '[render] owner page registered')
ok(/beverageBriefInbox:\s*<BeverageBriefInbox/.test(pageRenderer), '[render] inbox page registered')

console.log(`\n  ${passed} passed, ${failed} failed\n`)
process.exit(failed === 0 ? 0 : 1)
