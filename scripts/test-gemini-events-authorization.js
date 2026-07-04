#!/usr/bin/env node
/**
 * Static authorization audit for the AI-generation and events routes. No DB, no server
 * boot, no network, no AI — it reads server.js source and verifies the role gates.
 *
 * Invariants:
 *   • The neutral POST /api/ai/cocktail-proposal route exists, is gated by the shared AI
 *     allow-list, and returns provider-agnostic metadata (task cocktail_proposal).
 *   • POST /api/gemini remains as a DEPRECATED ALIAS, still gated by the same allow-list.
 *   • The shared AI allow-list authorizes fb_director (Cocktail Lab is FB Director's R&D
 *     surface) plus manager/bar_manager/owner/admin/events_manager, and never authorizes
 *     employee or chef. Neither AI route is public.
 *   • GET /api/events does NOT list fb_director (that role has no events UI; the frontend
 *     skips the call via canAccessEvents), while remaining a gated, non-public route.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-gemini-events-authorization.js
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const src = readFileSync(resolve(ROOT, 'server.js'), 'utf8')

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

// Raw requireAuth(...) argument string for a route declaration, or null if absent.
function authArgFor(method, path) {
  const re = new RegExp(`app\\.${method}\\(\\s*["']${path.replace(/\//g, '\\/')}["']\\s*,\\s*requireAuth\\(([^)]*)\\)`)
  const m = src.match(re)
  return m ? m[1].trim() : null
}

// Resolves a requireAuth(...) argument to a concrete role list. Handles both string
// literals and the shared `...AI_GENERATION_ROLES` spread (parsed from its declaration).
function resolveRoles(arg) {
  if (arg == null) return null
  if (/\.\.\.AI_GENERATION_ROLES/.test(arg)) return aiGenerationRoles()
  return arg.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
}
function rolesFor(method, path) { return resolveRoles(authArgFor(method, path)) }

// Parses the AI_GENERATION_ROLES const array literal from server.js.
function aiGenerationRoles() {
  const m = src.match(/const\s+AI_GENERATION_ROLES\s*=\s*\[([^\]]*)\]/)
  if (!m) return null
  return m[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
}

console.log('\nAI generation + events routes — authorization audit\n')

// ── Shared AI allow-list ────────────────────────────────────────────────────────
const aiRoles = aiGenerationRoles()
ok(aiRoles !== null, '[ai] AI_GENERATION_ROLES allow-list is declared')
if (aiRoles) {
  for (const role of ['manager', 'bar_manager', 'fb_director', 'owner', 'admin', 'events_manager']) {
    ok(aiRoles.includes(role), `[ai] allow-list authorizes ${role}`)
  }
  ok(!aiRoles.includes('employee'), '[ai] allow-list does NOT authorize employee')
  ok(!aiRoles.includes('chef'), '[ai] allow-list does NOT authorize chef (chef uses /api/chef/generate-menu)')
}

// ── Neutral POST /api/ai/cocktail-proposal ──────────────────────────────────────
const neutralArg = authArgFor('post', '/api/ai/cocktail-proposal')
ok(neutralArg !== null, '[neutral] /api/ai/cocktail-proposal route exists and is guarded by requireAuth(...)')
ok(neutralArg && /\.\.\.AI_GENERATION_ROLES/.test(neutralArg), '[neutral] uses the shared AI allow-list (fb_director included)')
const neutralRoles = rolesFor('post', '/api/ai/cocktail-proposal')
ok(neutralRoles && neutralRoles.includes('fb_director'), '[neutral] authorizes fb_director')
ok(neutralRoles && neutralRoles.length > 0, '[neutral] is NOT public')
ok(/task:\s*["']cocktail_proposal["']/.test(src), '[neutral] response carries task metadata cocktail_proposal')
ok(/source:\s*["']ai_provider["']/.test(src), '[neutral] response carries source metadata ai_provider')
ok(/const\s+AI_PROVIDER_ID\s*=\s*["']gemini["']/.test(src), '[neutral] provider id is internal metadata, not a route/UI name')

// ── DEPRECATED ALIAS POST /api/gemini ───────────────────────────────────────────
const geminiArg = authArgFor('post', '/api/gemini')
ok(geminiArg !== null, '[alias] /api/gemini alias still exists (events builder + backward compat)')
ok(geminiArg && /\.\.\.AI_GENERATION_ROLES/.test(geminiArg), '[alias] uses the same shared AI allow-list')
const gemini = rolesFor('post', '/api/gemini')
ok(gemini && gemini.includes('fb_director'), '[alias] authorizes fb_director')
ok(gemini && gemini.length > 0, '[alias] is NOT public')

// ── GET /api/events ───────────────────────────────────────────────────────────
const events = rolesFor('get', '/api/events')
ok(events !== null, '[events] GET route exists and is guarded by requireAuth(...)')
if (events) {
  ok(events.length > 0, '[events] requireAuth is NON-empty — route is not public')
  ok(!events.includes('fb_director'), '[events] does NOT authorize fb_director (frontend skips the call for that role)')
  for (const role of ['manager', 'owner', 'admin', 'events_manager']) {
    ok(events.includes(role), `[events] authorizes ${role}`)
  }
}

// ── requireAuth still enforces auth + role (regression guard) ─────────────────
ok(/return res\.status\(401\)\.json\(\{\s*error:\s*["']Authorization required\./.test(src),
  '[guard] requireAuth returns 401 when no bearer token is present')
ok(/return res\.status\(403\)\.json\(\{\s*error:\s*["']Forbidden\./.test(src),
  '[guard] requireAuth returns 403 for a disallowed role')
ok(/\[HESTIA AUTH\] 403/.test(src),
  '[debug] requireAuth logs a non-secret 403 reason (role + required + method + path)')

console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${passed} passed, ${failed} failed\n`)
process.exit(failed === 0 ? 0 : 1)
