#!/usr/bin/env node
/**
 * Static audit of the Employee Availability (shift constraints) routes + the employee
 * backfill in server.js. No DB, no server boot, no network. Exits 0 on pass, 1 on fail.
 *
 * Verifies (by reading server.js source):
 *   • POST /api/employee-shifts/constraints is gated to employee/admin (never public);
 *   • it resolves identity via getEmployeeForUser(req.user.id) — the AUTHENTICATED user —
 *     and never reads an employee_id / staff id from req.body for identity (an employee
 *     cannot submit for another employee);
 *   • an unlinked profile returns the clear setup error + code, and no availability is
 *     written without a resolved employee id;
 *   • the GET route reports profileLinked so the client can block up front;
 *   • getEmployeeForUser resolves by the canonical employees.user_id link;
 *   • backfillEmployeeRecords exists, runs at startup, is role-scoped to employees,
 *     links by user_id, and is NOT hardcoded to any person (no "Hadar" literal).
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(resolve(__dirname, '..', 'server.js'), 'utf8')

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

// Isolates a route handler body from its declaration to the next `app.` route.
function routeBody(decl) {
  const start = src.indexOf(decl)
  if (start === -1) return null
  const next = src.indexOf('\napp.', start + decl.length)
  return src.slice(start, next === -1 ? start + 2000 : next)
}

console.log('\nEmployee Availability routes + backfill — static audit\n')

// ── POST constraints: gating + identity + honest failure ────────────────────────
const post = routeBody("app.post('/api/employee-shifts/constraints'")
ok(post !== null, '[post] route exists')
if (post) {
  ok(/requireAuth\(\s*'employee'\s*,\s*'admin'\s*\)/.test(post), '[post] gated to employee/admin (not public)')
  ok(/getEmployeeForUser\(\s*req\.user\.id\s*\)/.test(post), '[post] resolves identity from req.user.id (authenticated user)')
  ok(!/req\.body\.(employee_id|staff_member_id|staffId|employeeId|user_id)/.test(post),
    '[post] never derives identity from req.body (cannot submit for another employee)')
  ok(/employee_profile_unlinked/.test(post), '[post] returns a machine-readable unlinked code')
  ok(/not linked to this user/i.test(post), '[post] returns the clear setup error copy')
  ok(/INSERT INTO employee_shift_constraints[\s\S]*emp\.id/.test(post) && /UPDATE employee_shift_constraints[\s\S]*emp\.id/.test(post),
    '[post] writes availability under the resolved emp.id (never without one)')
}

// ── GET constraints: profile status for proactive client blocking ───────────────
const get = routeBody("app.get('/api/employee-shifts/constraints'")
ok(get !== null, '[get] route exists')
if (get) {
  ok(/requireAuth\(\s*'employee'/.test(get), '[get] gated (employee + management roles)')
  ok(/profileLinked:\s*false/.test(get), '[get] reports profileLinked:false when the employee has no record')
  ok(/profileLinked:\s*true/.test(get), '[get] reports profileLinked:true for a linked employee')
}

// ── Canonical identity link ─────────────────────────────────────────────────────
ok(/function getEmployeeForUser\(userId\)\s*\{\s*return db\.prepare\('SELECT \* FROM employees WHERE user_id=\?'\)/.test(src),
  '[identity] getEmployeeForUser resolves by employees.user_id')

// ── Backfill: seeded employees get linked, generically ──────────────────────────
const backfill = (() => {
  const start = src.indexOf('function backfillEmployeeRecords(')
  if (start === -1) return null
  const next = src.indexOf('\nfunction ', start + 1)
  return src.slice(start, next === -1 ? start + 2000 : next)
})()
ok(backfill !== null, '[backfill] backfillEmployeeRecords is defined')
ok(/backfillEmployeeRecords\(\)/.test(src.slice(0, src.indexOf('app.listen'))), '[backfill] invoked at startup')
if (backfill) {
  ok(/role\s*=\s*'employee'/.test(backfill), '[backfill] role-scoped to employees')
  ok(/e\.user_id\s*=\s*u\.id/.test(backfill), '[backfill] links by canonical user_id')
  ok(/NOT EXISTS/.test(backfill), '[backfill] only fills genuine gaps (idempotent)')
  ok(!/hadar/i.test(backfill), '[backfill] is NOT hardcoded to any person')
}

console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${passed} passed, ${failed} failed\n`)
process.exit(failed === 0 ? 0 : 1)
