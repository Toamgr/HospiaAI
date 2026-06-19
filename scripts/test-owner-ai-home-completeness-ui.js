#!/usr/bin/env node
/**
 * Static source guards for Owner AI Home — Phase 9C-4 completeness integration.
 * No DB, no render, no network. Verifies, by reading the component source, that
 * OwnerAIHome reads the read-only completeness endpoint and never mutates Venue DNA.
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
// Source with line/block comments stripped, for "does not call X" guards. We do
// not want a guardrail comment ("do not call /message") to trip a forbidden check.
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .map(line => line.replace(/\/\/.*$/, ''))
  .join('\n')

console.log('\nOwner AI Home — completeness UI static guards\n')

// 1. Calls the completeness endpoint.
ok(/apiGet\(\s*['"]\/api\/venue-intelligence\/completeness['"]\s*\)/.test(code),
  '[1] OwnerAIHome calls GET /api/venue-intelligence/completeness')

// 2/3. Does not call /message or /reset.
ok(!code.includes('/api/venue-intelligence/message'), '[2] does not call /api/venue-intelligence/message')
ok(!code.includes('/api/venue-intelligence/reset'), '[3] does not call /api/venue-intelligence/reset')
ok(!code.includes('/candidates'), '[3b] does not call candidate review APIs')

// 4. No POST/PATCH/DELETE helpers used.
for (const token of ['apiPost', 'apiPatch', 'apiDelete', 'apiPut']) {
  ok(!code.includes(token), `[4] does not use ${token} (read-only)`)
}

// 5. Does not reference mergeVenueDna.
ok(!code.includes('mergeVenueDna'), '[5] does not reference mergeVenueDna')

// 6. No external AI / raw fetch.
for (const token of ['OpenAI', 'Gemini', 'fetch(']) {
  ok(!code.includes(token), `[6] no direct ${token} call`)
}

// 7. Does not claim Full Intelligence Mode is active.
ok(!/Full Intelligence Mode\s+(is\s+)?active/i.test(src), '[7] does not claim Full Intelligence Mode active')
ok(/Full Intelligence Mode remains locked/i.test(src), '[7b] explains Full Intelligence Mode is locked')

// 8. Read-only / inactive wording for the input.
ok(/intentionally inactive/i.test(src), '[8] input uses intentionally-inactive wording')
ok(/disabled/.test(src), '[8b] input is disabled')

// 9/10. Uses foundation_status and recommended_next_question from the model.
ok(/foundation_status/.test(src), '[9] uses foundation_status')
ok(/recommended_next_question/.test(src), '[10] uses recommended_next_question')

// Honest framing: coverage is not labeled as AI confidence / business score.
ok(/Foundation coverage/i.test(src), '[10b] labels the score as "Foundation coverage"')
ok(!/AI confidence/i.test(src) || /not\s+ai\s+confidence/i.test(src),
  '[10c] does not present coverage as AI confidence')

// 11. No fake KPI labels (revenue/margin/sales/ROI/guest satisfaction).
for (const kpi of ['revenue', 'margin', 'sales', 'ROI', 'guest satisfaction', 'occupancy']) {
  ok(!new RegExp(kpi, 'i').test(src), `[11] no fake KPI label "${kpi}"`)
}

// Loading / error / empty honest states present.
ok(/Reading Venue DNA foundation/i.test(src), 'honest loading state present')
ok(/could not read the Venue DNA foundation/i.test(src), 'honest error state present')
ok(/has not built enough Venue DNA/i.test(src), 'honest empty/not-started state present')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
