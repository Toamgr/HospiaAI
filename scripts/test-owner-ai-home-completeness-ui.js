#!/usr/bin/env node
/**
 * Static source guards for Owner AI Home — Phase 9D-0 first-run truth surface.
 * No DB, no render, no network. Verifies, by reading the component source, that:
 *   • the page is a conversational surface (not a readiness dashboard);
 *   • it is honest about first-run state (true-zero vs early-signals vs confirmation);
 *   • no foundation_score / percentage appears on the main surface (backstage only);
 *   • chat is NOT activated (Build Mode input is inert) and nothing mutates Venue DNA;
 *   • Full Intelligence Mode stays locked and no fake KPIs/progress are introduced.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-owner-ai-home-completeness-ui.js
 *   (or: npm run test:owner-ai-home-completeness-ui)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const HOME_PATH = resolve(ROOT, 'src/features/owner-intelligence/OwnerAIHome.jsx')

let passed = 0
let failed = 0
function ok(cond, msg) {
  if (cond) { passed++ }
  else { failed++; console.error(`  [FAIL] ${msg}`) }
}

const src = readFileSync(HOME_PATH, 'utf8')
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .map(line => line.replace(/\/\/.*$/, ''))
  .join('\n')

console.log('\nOwner AI Home — first-run truth UI static guards\n')

// 1. Reads the read-only completeness endpoint (opening message + backstage).
ok(/apiGet\(\s*['"]\/api\/venue-intelligence\/completeness['"]\s*\)/.test(code),
  '[1] OwnerAIHome calls GET /api/venue-intelligence/completeness')

// 2/3. Never calls /message, /reset, or candidate APIs.
ok(!code.includes('/api/venue-intelligence/message'), '[2] does not call /api/venue-intelligence/message')
ok(!code.includes('/api/venue-intelligence/reset'), '[3] does not call /api/venue-intelligence/reset')
ok(!code.includes('/candidates'), '[3b] does not call candidate review APIs')

// 4. No POST/PATCH/DELETE helpers used (read-only surface).
for (const token of ['apiPost', 'apiPatch', 'apiDelete', 'apiPut']) {
  ok(!code.includes(token), `[4] does not use ${token}`)
}

// 5. Does not reference mergeVenueDna or call AI/raw fetch.
ok(!code.includes('mergeVenueDna'), '[5] does not reference mergeVenueDna')
for (const token of ['OpenAI', 'Gemini', 'fetch(']) {
  ok(!code.includes(token), `[5b] no direct ${token} call`)
}

// 6. Chat is NOT activated — the Build Mode input is inert.
ok(/disabled/.test(src), '[6] input is disabled (Build Mode inert)')
ok(/intentionally inactive/i.test(src), '[6b] input uses intentionally-inactive wording')
ok(!/sendMessage/.test(code), '[6c] does not wire a live send handler')

// 7. Chat-first headline — not a dashboard/score hero.
ok(/Talk to HESTIA about your venue/i.test(src), '[7] hero headline is conversational')

// 8. Honest first-run state copy that distinguishes true-zero from existing signals.
ok(/HESTIA is ready to learn this venue/i.test(src), '[8] explicit zero-state copy present')
ok(/early Venue DNA signals/i.test(src), '[8b] distinguishes existing/early signals')
ok(/confirmation is needed before this becomes Venue DNA/i.test(src), '[8c] confirmation-needed copy present')

// 9. No DISPLAYED percentage on the main surface — a rendered percent is a JSX
//    expression immediately followed by "%" (e.g. `{score}%`). CSS percentages in
//    gradients/sizes are ignored. Any rendered percent must live inside backstage.
const detailsIdx = src.indexOf('<details')
const firstRenderedPct = src.search(/\}\s*%/)
ok(detailsIdx !== -1, '[9] backstage uses a <details> collapsible')
ok(firstRenderedPct === -1 || firstRenderedPct > detailsIdx,
  '[9b] no rendered percentage before the backstage <details> (none on the main surface)')
ok(!/<details[^>]*\bopen\b/.test(src), '[9c] backstage details is collapsed by default')
ok(/Backstage intelligence/i.test(src), '[9d] backstage section is labeled')
// Backstage coverage is honestly framed and notes a new venue starts at 0.
ok(/coverage from existing Venue DNA signals/i.test(src), '[9e] coverage labeled as from existing signals')
ok(/new venue starts at 0/i.test(src), '[9f] states a new venue starts at 0 (no fake progress)')

// 10. Completeness model used internally.
ok(/foundation_status/.test(src), '[10] uses foundation_status')
ok(/recommended_next_question/.test(src), '[10b] uses recommended_next_question')

// 11. Full Intelligence Mode locked, never "active".
ok(!/Full Intelligence Mode\s+(is\s+)?active/i.test(src), '[11] does not claim Full Intelligence Mode active')
ok(/Full Intelligence Mode remains locked/i.test(src), '[11b] states Full Intelligence Mode is locked')

// 12. No fake KPI labels.
for (const kpi of ['revenue', 'margin', 'sales', 'ROI', 'guest satisfaction', 'occupancy', 'profit']) {
  ok(!new RegExp(kpi, 'i').test(src), `[12] no fake KPI label "${kpi}"`)
}

// 13. Honest loading / error / empty states.
ok(/Reading Venue DNA foundation/i.test(src), '[13] honest loading state present')
ok(/could not read the Venue DNA foundation/i.test(src), '[13b] honest error state present')
ok(/has not built enough Venue DNA/i.test(src), '[13c] honest empty state present')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
