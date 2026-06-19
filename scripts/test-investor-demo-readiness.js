#!/usr/bin/env node
/**
 * Investor demo readiness — static safety guards (Phase 9C-5).
 * No DB, no render, no network, no AI. Reads source files and asserts the honest,
 * read-only demo path holds: Owner AI Home stays read-only, Full Intelligence Mode
 * stays locked, the owner default landing is NOT switched to Owner AI Home, and the
 * completeness endpoint still exists.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-investor-demo-readiness.js
 *   (or: npm run test:investor-demo-readiness)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const read = (rel) => readFileSync(resolve(ROOT, rel), 'utf8')

// Strip comments so guardrail prose (e.g. "do not call /message") can't trip a check.
function codeOnly(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n')
}

let passed = 0
let failed = 0
function ok(cond, msg) {
  if (cond) { passed++ }
  else { failed++; console.error(`  [FAIL] ${msg}`) }
}

const homeSrc = read('src/features/owner-intelligence/OwnerAIHome.jsx')
const homeCode = codeOnly(homeSrc)
const serverSrc = read('server.js')
const routesSrc = read('src/config/routes.js')
const roleSrc = read('src/config/roleConfig.js')
const navSrc = read('src/config/navigationConfig.js')
const pkg = JSON.parse(read('package.json'))

console.log('\nInvestor demo readiness — static safety guards\n')

// 1. OwnerAIHome references the read-only completeness endpoint.
ok(/\/api\/venue-intelligence\/completeness/.test(homeCode),
  '[1] OwnerAIHome references /api/venue-intelligence/completeness')

// 2. OwnerAIHome does not reference /message.
ok(!homeCode.includes('/api/venue-intelligence/message'),
  '[2] OwnerAIHome does not reference /api/venue-intelligence/message')

// 3. OwnerAIHome does not POST/PATCH/DELETE.
for (const token of ['apiPost', 'apiPatch', 'apiDelete', 'apiPut']) {
  ok(!homeCode.includes(token), `[3] OwnerAIHome does not use ${token}`)
}

// 4. OwnerAIHome does not claim Full Intelligence Mode active; it states it is locked.
ok(!/Full Intelligence Mode\s+(is\s+)?active/i.test(homeSrc),
  '[4] OwnerAIHome does not claim Full Intelligence Mode active')
ok(/Full Intelligence Mode remains locked/i.test(homeSrc),
  '[4b] OwnerAIHome states Full Intelligence Mode is locked')

// 5. OwnerAIHome does not change default routing (no router/landing imports here).
for (const token of ['firstAllowedPage', 'firstAllowedArea', 'PAGE_ROUTES', 'defaultPage']) {
  ok(!homeCode.includes(token), `[5] OwnerAIHome does not touch routing (${token})`)
}

// 6. Route/nav config does not switch the owner default landing to ownerHome.
//    The command group must list operationalPulse BEFORE ownerHome (default = first allowed page).
const cmdMatch = navSrc.match(/command:\s*\{[\s\S]*?pages:\s*\[([\s\S]*?)\]/)
ok(cmdMatch && cmdMatch[1].indexOf('operationalPulse') !== -1 &&
   cmdMatch[1].indexOf('operationalPulse') < cmdMatch[1].indexOf('ownerHome'),
  '[6] owner command nav lists operationalPulse before ownerHome (default landing unchanged)')
ok(/operationalPulse:\s*'\/owner'/.test(routesSrc),
  '[6b] operationalPulse remains mapped to /owner')
ok(/ownerHome:\s*'\/owner\/home'/.test(routesSrc),
  '[6c] ownerHome remains mapped to /owner/home (not /owner)')
// roleConfig still derives the default landing from the first allowed page (no ownerHome override).
ok(/firstAllowedPage/.test(roleSrc) && !/default[A-Za-z]*\s*[:=]\s*['"]ownerHome['"]/.test(roleSrc),
  '[6d] no hard default override to ownerHome in roleConfig')

// 7. server.js still exposes the completeness endpoint (GET-only).
ok(/app\.get\(\s*['"]\/api\/venue-intelligence\/completeness['"]/.test(serverSrc),
  '[7] server.js still has GET /api/venue-intelligence/completeness')

// 8. No fake KPI phrases in OwnerAIHome.
for (const kpi of ['revenue', 'sales', 'ROI', 'guest satisfaction', 'margin', 'occupancy', 'profit']) {
  ok(!new RegExp(kpi, 'i').test(homeSrc), `[8] OwnerAIHome has no fake KPI phrase "${kpi}"`)
}

// 9. Existing 9C test scripts are present in package.json.
for (const s of [
  'test:venue-dna-completeness',
  'test:venue-dna-completeness-route',
  'test:owner-ai-home-completeness-ui',
]) {
  ok(typeof pkg.scripts?.[s] === 'string', `[9] package.json defines script "${s}"`)
}

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
