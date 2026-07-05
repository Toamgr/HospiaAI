#!/usr/bin/env node
/**
 * Deterministic behavioral test for Employee Availability identity resolution + the
 * employee-record backfill (the "Employee record not found for this user." fix).
 *
 * In-memory node:sqlite DatabaseSync(':memory:') mirroring the relevant server.js schema
 * and SQL — no real DB, no server boot, no network. Exits 0 on pass, 1 on failure.
 *
 * Proves:
 *   • an EMPLOYEE auth user with no employees row (the Hadar scenario) is linked by the
 *     backfill (canonical link employees.user_id = auth_users.id), by role + identity —
 *     not by name;
 *   • the backfill is idempotent and never duplicates an already-linked employee;
 *   • non-employee auth users are never backfilled;
 *   • identity resolves per user_id (an employee cannot resolve to another's record);
 *   • availability upsert stores under the resolved employee_id, scoped by week;
 *   • after backfill, every seeded employee user has exactly one matching employees row.
 *
 * Run: node scripts/test-employee-availability-identity.js
 */

import { DatabaseSync } from 'node:sqlite'

let passed = 0, failed = 0
function assert(label, cond, detail) {
  if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${label}${detail ? ` — ${detail}` : ''}`) }
}

const db = new DatabaseSync(':memory:')
db.exec(`
  CREATE TABLE auth_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES auth_users(id),
    display_name TEXT NOT NULL,
    gender TEXT NOT NULL DEFAULT 'M',
    sub_role TEXT NOT NULL DEFAULT 'waiter',
    joined_date TEXT NOT NULL,
    email TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE employee_shift_constraints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER REFERENCES employees(id),
    week_start TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    constraints_json TEXT
  );
`)

// ── Seed: an original-account employee WITHOUT an employees row (Hadar scenario), a
//    later-batch employee WITH one, and a manager (non-employee). ────────────────────
db.prepare("INSERT INTO auth_users (id, full_name, role, created_at) VALUES (6,'Hadar Vaknin','employee','2026-01-05 10:00:00')").run()
db.prepare("INSERT INTO auth_users (id, full_name, role, created_at) VALUES (9,'Tali Raicher','employee','2026-04-01 10:00:00')").run()
db.prepare("INSERT INTO auth_users (id, full_name, role, created_at) VALUES (7,'Zohar Zach','manager','2026-01-05 10:00:00')").run()
db.prepare("INSERT INTO employees (user_id, display_name, joined_date) VALUES (9,'Tali Raicher','2026-04-01')").run()

// getEmployeeForUser — canonical resolution used by the availability routes.
const getEmployeeForUser = (userId) => db.prepare('SELECT * FROM employees WHERE user_id=?').get(userId)

console.log('\nEmployee Availability identity + backfill — behavioral test\n')

// Before backfill: Hadar cannot be resolved (this is the reported bug).
assert('[pre] Hadar (user 6) has no employee record before backfill', !getEmployeeForUser(6))
assert('[pre] Tali (user 9) is already linked', !!getEmployeeForUser(9))

// ── The backfill (identical to server.js backfillEmployeeRecords) ───────────────────
function backfillEmployeeRecords() {
  const orphans = db.prepare(`
    SELECT u.id, u.full_name, u.created_at
    FROM auth_users u
    WHERE u.role = 'employee' AND u.is_active = 1
      AND NOT EXISTS (SELECT 1 FROM employees e WHERE e.user_id = u.id)
  `).all()
  const insertEmployee = db.prepare("INSERT INTO employees (user_id, display_name, joined_date) VALUES (?,?,?)")
  for (const u of orphans) {
    const joined = (u.created_at && String(u.created_at).slice(0, 10)) || new Date().toISOString().slice(0, 10)
    insertEmployee.run(u.id, u.full_name || `Employee ${u.id}`, joined)
  }
  return orphans.length
}

const linked = backfillEmployeeRecords()
assert('[backfill] linked exactly the one orphan employee (Hadar)', linked === 1, `linked=${linked}`)

// After backfill.
const hadar = getEmployeeForUser(6)
assert('[post] Hadar now resolves to an employee record', !!hadar)
assert('[post] Hadar record is linked by user_id (identity, not name)', hadar && hadar.user_id === 6)
assert('[post] Hadar joined_date came from the auth account', hadar && hadar.joined_date === '2026-01-05')

// Non-employee is never backfilled.
assert('[post] manager (user 7) did NOT get an employees row', !getEmployeeForUser(7))

// Idempotent — a second run links nothing and creates no duplicate.
const secondRun = backfillEmployeeRecords()
assert('[idempotent] second backfill links nothing', secondRun === 0)
assert('[idempotent] Hadar still has exactly one employees row',
  db.prepare('SELECT COUNT(*) AS c FROM employees WHERE user_id=6').get().c === 1)

// Identity isolation — each user resolves to their own distinct record.
assert('[identity] user 6 and user 9 resolve to different employee_ids',
  getEmployeeForUser(6).id !== getEmployeeForUser(9).id)

// Availability upsert stores under the RESOLVED employee_id (never a body-supplied id).
function submitAvailability(userId, week_start, constraints) {
  const emp = getEmployeeForUser(userId)
  if (!emp) return { error: 'unlinked' }
  const existing = db.prepare('SELECT id FROM employee_shift_constraints WHERE employee_id=? AND week_start=?').get(emp.id, week_start)
  if (existing) {
    db.prepare('UPDATE employee_shift_constraints SET constraints_json=? WHERE id=?').run(JSON.stringify(constraints), existing.id)
  } else {
    db.prepare('INSERT INTO employee_shift_constraints (employee_id, week_start, constraints_json) VALUES (?,?,?)').run(emp.id, week_start, JSON.stringify(constraints))
  }
  return { ok: true, employee_id: emp.id }
}

const WEEK = '2026-07-06'
const r6 = submitAvailability(6, WEEK, { sunday: 'available' })
const r9 = submitAvailability(9, WEEK, { sunday: 'unavailable' })
assert('[submit] Hadar submission saved under her own employee_id', r6.ok && r6.employee_id === hadar.id)
assert('[submit] Tali submission saved under her own employee_id', r9.ok && r9.employee_id === getEmployeeForUser(9).id)
assert('[submit] the two employees have separate availability rows',
  db.prepare('SELECT COUNT(*) AS c FROM employee_shift_constraints WHERE week_start=?').get(WEEK).c === 2)
const hadarRow = db.prepare('SELECT constraints_json FROM employee_shift_constraints WHERE employee_id=? AND week_start=?').get(hadar.id, WEEK)
assert('[submit] Hadar row holds HER constraints, not another employee\'s',
  JSON.parse(hadarRow.constraints_json).sunday === 'available')

// Upsert (re-submit) updates in place — no duplicate row.
submitAvailability(6, WEEK, { sunday: 'partial' })
assert('[upsert] re-submit updates in place (still one row for Hadar/week)',
  db.prepare('SELECT COUNT(*) AS c FROM employee_shift_constraints WHERE employee_id=? AND week_start=?').get(hadar.id, WEEK).c === 1)

// Full-directory invariant: after backfill every employee user has a matching row.
const stillMissing = db.prepare(`
  SELECT u.id FROM auth_users u
  WHERE u.role='employee' AND u.is_active=1
    AND NOT EXISTS (SELECT 1 FROM employees e WHERE e.user_id=u.id)
`).all()
assert('[invariant] no employee user is left without an employees row', stillMissing.length === 0, `missing=${stillMissing.length}`)

console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${passed} passed, ${failed} failed\n`)
process.exit(failed === 0 ? 0 : 1)
