#!/usr/bin/env node
/**
 * Static source guards for Owner AI Home — Phase 9E-1B chat-active surface.
 * No DB, no render, no network. Verifies, by reading the component source, that:
 *   • chat is wired through the sanctioned hook (venueIntelligence.sendMessage) —
 *     no direct /message call, no AI, no writes from the component;
 *   • the input is active only when a real sendMessage is available, and blocks
 *     empty sends; loading/error states are honest;
 *   • assistant turns are real (no fabricated replies);
 *   • the deterministic completeness model stays behind the scenes (collapsed
 *     backstage, no percentage on the main surface);
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
// Comment-stripped source for "does not call X" guards (a guardrail comment that
// names /message must not trip a forbidden-token check).
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n')
  .map(line => line.replace(/\/\/.*$/, ''))
  .join('\n')

console.log('\nOwner AI Home — chat-active UI static guards\n')

// 1. Reads the read-only completeness endpoint (opening message + backstage).
ok(/apiGet\(\s*['"]\/api\/venue-intelligence\/completeness['"]\s*\)/.test(code),
  '[1] OwnerAIHome calls GET /api/venue-intelligence/completeness')

// 2. Chat is wired through the sanctioned hook — not a direct /message call.
ok(/venueIntelligence/.test(code), '[2] consumes the venueIntelligence prop (sanctioned hook)')
ok(/sendMessage/.test(code), '[2b] delegates sending to hook.sendMessage')
ok(/chatActive/.test(code), '[2c] gates the input on real chat availability (chatActive)')
ok(!code.includes('/api/venue-intelligence/message'), '[2d] does not call /api/venue-intelligence/message directly')
ok(!code.includes('/api/venue-intelligence/reset'), '[2e] does not call /api/venue-intelligence/reset')
ok(!code.includes('/candidates'), '[2f] does not call candidate review APIs')

// 3. No POST/PATCH/DELETE helpers, no mergeVenueDna, no direct AI/fetch.
for (const token of ['apiPost', 'apiPatch', 'apiDelete', 'apiPut', 'mergeVenueDna', 'OpenAI', 'Gemini', 'fetch(']) {
  ok(!code.includes(token), `[3] does not use ${token}`)
}

// 4. Active input only when sendMessage exists; empty sends blocked.
ok(/disabled=\{!chatActive/.test(code), '[4] input/send disabled unless chatActive')
ok(/!input\.trim\(\)/.test(code), '[4b] send blocked on empty input')
ok(/if\s*\(\s*!trimmed\b/.test(code), '[4c] handleSend blocks empty/whitespace messages')
// Inactive fallback exists (input stays inert if the hook is unavailable).
ok(/intentionally inactive/i.test(src), '[4d] inert fallback wording present when chat unavailable')

// 5. No fabricated assistant replies — assistant turns come only from hook messages.
ok(/messages\.map/.test(code), '[5] renders real hook messages')
ok(!/fabricat/i.test(code), '[5b] no fabricated reply construction')
ok(/sending\s*&&\s*<TypingBubble/.test(code), '[5c] shows a real loading/typing state while sending')

// 6. Honest send error surfaced from the hook.
ok(/sendError/.test(code), '[6] surfaces the hook send error honestly')

// 7. Chat-first headline.
ok(/Talk to HESTIA about your venue/i.test(src), '[7] hero headline is conversational')

// 8. Honest product-truth copy (working signals, not confirmed DNA).
ok(/builds working Venue DNA signals/i.test(src), '[8] states conversation builds working signals')
ok(/not confirmed Venue DNA/i.test(src), '[8b] states signals are not confirmed Venue DNA')
ok(/HESTIA is ready to learn this venue/i.test(src), '[8c] explicit first-run zero-state copy present')

// 9. No percentage on the main surface — any rendered "%" lives inside backstage.
const detailsIdx = src.indexOf('<details')
const firstRenderedPct = src.search(/\}\s*%/)
ok(detailsIdx !== -1, '[9] backstage uses a <details> collapsible')
ok(firstRenderedPct === -1 || firstRenderedPct > detailsIdx,
  '[9b] no rendered percentage before the backstage <details>')
ok(!/<details[^>]*\bopen\b/.test(src), '[9c] backstage details is collapsed by default')
ok(/Backstage intelligence/i.test(src), '[9d] backstage section is labeled')

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

// 13. Honest loading / error / empty backstage states.
ok(/Reading Venue DNA foundation/i.test(src), '[13] honest loading state present')
ok(/could not read the Venue DNA foundation/i.test(src), '[13b] honest error state present')
ok(/has not built enough Venue DNA/i.test(src), '[13c] honest empty state present')

console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
if (failed > 0) process.exit(1)
process.exit(0)
