#!/usr/bin/env node
/**
 * Static source guardrail audit for Owner Meaning Capture (Slice 4D):
 *   - the service module:  src/services/venueIntelligence/ownerMeaningCaptureService.js
 *   - the write route:     POST /api/owner-meaning-captures  (server.js)
 *
 * No DB, no server boot, no network, no AI. These assertions verify — by reading source — the
 * doctrine the layer must hold (OWNER_MEANING_CAPTURE_DDL_CONTRACT.md §12 source-level guards):
 *   • the service/route import NOTHING DNA-related and NEVER call mergeVenueDna;
 *   • no write to any Venue DNA store (venue_dna_json / venue_intelligence / venue_briefs /
 *     venue_dna_enrichment); the service writes ONLY the two owner_meaning tables;
 *   • the forbidden persistence/promotion vocabulary is ABSENT from runtime source
 *     (captured_owner_meaning / eligible_for_future_proposal / proposed_dna_change / dna_target /
 *     destination_hint) — confirmation/promotion is unexpressible;
 *   • the route is OWNER-ONLY for write, with an explicit admin re-exclusion BEFORE the sole
 *     writer (so an admin write creates zero rows), venue-scoped, and adds exactly ONE write verb;
 *   • both tables are booted and the service is imported;
 *   • the 4B read-only preview lock remains in place (no answer composer added in 4D).
 *
 * Exits 0 on pass, 1 on failure. Run: node scripts/test-owner-meaning-capture-route-audit.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SERVICE_REL = 'src/services/venueIntelligence/ownerMeaningCaptureService.js'
const server = readFileSync(resolve(ROOT, 'server.js'), 'utf8')
const service = readFileSync(resolve(ROOT, SERVICE_REL), 'utf8')
const panel = readFileSync(resolve(ROOT, 'src/features/owner-intelligence/InterpretedCandidatesPanel.jsx'), 'utf8')

// Forbidden persistence/promotion tokens that must NEVER appear in runtime source (these test
// assertion lists naturally contain them; the runtime files must not).
const FORBIDDEN_TOKENS = ['captured_owner_meaning', 'eligible_for_future_proposal', 'proposed_dna_change', 'dna_target', 'destination_hint']
const DNA_STORES = ['venue_dna_json', 'venue_intelligence', 'venue_briefs', 'venue_dna_enrichment']

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

console.log('\nOwner Meaning Capture — static source guardrail audit\n')

// ── Boot + import (server.js) ────────────────────────────────────────────────
ok(/import\s*\{[^}]*OWNER_MEANING_CAPTURES_DDL[^}]*\}\s*from\s*["']\.\/src\/services\/venueIntelligence\/ownerMeaningCaptureService\.js["']/.test(server),
  '[boot] server imports the owner meaning capture service')
ok(/db\.exec\(OWNER_MEANING_CAPTURES_DDL\)/.test(server), '[boot] boots owner_meaning_captures table')
ok(/db\.exec\(OWNER_MEANING_CAPTURE_EVENTS_DDL\)/.test(server), '[boot] boots owner_meaning_capture_events table')

// ── Route exists + owner-only gating ─────────────────────────────────────────
ok(/app\.post\(\s*['"]\/api\/owner-meaning-captures['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*\)/.test(server),
  '[POST] exists, owner-ONLY gated')
ok(!/app\.post\(\s*['"]\/api\/owner-meaning-captures['"]\s*,\s*requireAuth\(\s*['"]owner['"]\s*,\s*['"]admin['"]/.test(server),
  '[POST] admin is NOT granted write at requireAuth')
// Exactly one owner-meaning write verb is added (the single approved 4D route).
const ownerMeaningWriteVerbs = (server.match(/app\.(post|put|patch|delete)\(\s*['"]\/api\/owner-meaning-captures/g) || [])
ok(ownerMeaningWriteVerbs.length === 1, `[POST] exactly ONE owner-meaning write verb (got ${ownerMeaningWriteVerbs.length})`)

// ── Isolate the route handler region ─────────────────────────────────────────
const startIdx = server.indexOf("app.post('/api/owner-meaning-captures'")
ok(startIdx !== -1, 'route handler located')
// Bound the region at the next sibling section (the Venue Intelligence Bridge follows immediately
// and legitimately writes brief/DNA stores — it must NOT fall inside this isolation region).
const bridgeIdx = server.indexOf('Venue Intelligence Bridge', startIdx)
const after = server.slice(startIdx + 1)
const nextRel = after.search(/app\.(get|post|put|patch|delete)\(/)
const fallbackEnd = nextRel === -1 ? server.length : startIdx + 1 + nextRel
const endIdx = bridgeIdx > startIdx ? bridgeIdx : fallbackEnd
const region = server.slice(startIdx, endIdx)

// ── Admin re-exclusion precedes the sole writer ──────────────────────────────
const adminGuardIdx = region.search(/req\.user\s*&&\s*req\.user\.role\s*===\s*['"]admin['"]/)
ok(adminGuardIdx !== -1, "[admin] handler has an explicit req.user.role === 'admin' block")
ok(/role\s*===\s*['"]admin['"]\s*\)\s*\{\s*return\s+res\.status\(403\)/.test(region.replace(/\n/g, ' ')),
  '[admin] admin block returns 403')
const writerIdx = region.indexOf('createOwnerMeaningCapture(')
ok(writerIdx !== -1, '[admin] handler calls createOwnerMeaningCapture (the sole writer)')
ok(adminGuardIdx !== -1 && writerIdx !== -1 && adminGuardIdx < writerIdx,
  '[admin] 403 admin block precedes createOwnerMeaningCapture → zero capture + zero audit rows on admin write')

// ── Venue scoping; venue_id never the client subject ─────────────────────────
ok(/req\.venueId/.test(region), '[scoping] route is venue-scoped via req.venueId')
ok(!/defaultVenueId\(/.test(region), '[scoping] no defaultVenueId() in the handler')
ok(/concept_ref/.test(region), '[input] concept_ref is read from the body')
ok(!/body\.venue_id/.test(region), '[input] venue_id is NOT read from the client body')
ok(!/body\.provenance/.test(region) && !/body\.record_space/.test(region) && !/body\.candidate_fingerprint/.test(region),
  '[input] provenance / record_space / fingerprint are NOT read from the client (server-derived)')

// ── No Venue DNA contact, no confirmation, no promotion (route region) ────────
ok(!/mergeVenueDna/.test(region), '[isolation] no mergeVenueDna in the route')
ok(!new RegExp(`(INSERT\\s+INTO|UPDATE)\\s+(${DNA_STORES.join('|')})\\b`, 'i').test(region),
  '[isolation] no Venue DNA store write in the route')
ok(!/['"]confirmed['"]/.test(region), '[isolation] no confirmed-DNA tier literal in the route')
ok(!/\/promote|\/confirm/.test(region), '[isolation] no /promote or /confirm route')
ok(!/\bapp\.delete\(/.test(region), '[isolation] no DELETE verb in the region')
for (const token of FORBIDDEN_TOKENS) {
  ok(!region.includes(token), `[isolation] route source contains no forbidden token: ${token}`)
}

// ── Service module guardrails ────────────────────────────────────────────────
// A doctrine comment may NAME mergeVenueDna to forbid it; what must never exist is a CALL or an
// IMPORT (mirrors the discovery service audit posture).
ok(!/\bmergeVenueDna\s*\(/.test(service), '[service] never CALLS mergeVenueDna')
ok(!service.split('\n').some(l => /^\s*import\b/.test(l) && new RegExp(`(mergeVenueDna|${DNA_STORES.join('|')})`).test(l)),
  '[service] imports nothing DNA-related')
ok(!new RegExp(`(INSERT\\s+INTO|UPDATE)\\s+(${DNA_STORES.join('|')})\\b`, 'i').test(service),
  '[service] never writes a Venue DNA store')
ok((service.match(/(INSERT\s+INTO|UPDATE)\s+(\w+)/gi) || []).every(s => /owner_meaning_capture/i.test(s)),
  '[service] only writes the two owner_meaning_capture tables')
ok(!/askGemini|openai|gemini|fetch\s*\(/i.test(service), '[service] makes no AI / network calls')
for (const token of FORBIDDEN_TOKENS) {
  ok(!service.includes(token), `[service] source contains no forbidden token: ${token}`)
}
// No HESTIA-authored "meaning" column and no numeric confidence column declared.
ok(!/captured_owner_meaning\s+TEXT/i.test(service), '[service] no HESTIA-authored meaning column declared')
ok(!/confidence_score|confidence_pct|confidence_value|confidence\s+(INTEGER|REAL|NUMERIC)/i.test(service),
  '[service] no numeric confidence column declared')
ok(!/export\s+(function|const)\s+\w*([Pp]romot|[Cc]onfirm|[Tt]oVenueDna|[Aa]pplyToDna|[Mm]erge)/.test(service),
  '[service] exports no promotion / confirm-to-DNA / merge function')

// ── 4B read-only preview lock still in place (no composer added in 4D) ────────
const panelCode = panel.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n')
ok(!/<input|<textarea|<form|onSubmit|onSave|handleSave|handleSubmit/.test(panelCode),
  '[4B lock] InterpretedCandidatesPanel still has no answer composer (no input/textarea/form/submit)')
ok(/Read-only preview/.test(panel), '[4B lock] read-only preview label still present')
ok(!/apiPost|apiPut|apiPatch|apiDelete/.test(panelCode) && !/fetch\s*\(/.test(panelCode),
  '[4B lock] panel still issues no write verb (GET-only)')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
