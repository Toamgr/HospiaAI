#!/usr/bin/env node
/**
 * Behavioral (integration) test for the F&B Beverage Brief Inbox routes (Beverage Slice 1A),
 * focused on the FB_DIRECTOR-ONLY rule: admin must be explicitly re-excluded on every one of
 * these four routes, not just relying on requireAuth's role allow-list.
 *
 * It mounts the FOUR real route handlers (copied verbatim in shape from server.js, including
 * the explicit in-handler admin re-exclusion) on a minimal express app, behind a requireAuth
 * model that FAITHFULLY mirrors server.js requireAuth: 401 without a role, 403 for a role not
 * in the allow-list, and the platform-admin GLOBAL BYPASS (which the in-handler check must then
 * override). They run against the REAL fnbBriefReviewService + ownerBeverageBriefService and a
 * REAL in-memory node:sqlite db, over real HTTP.
 *
 * Proves end-to-end:
 *   • fb_director succeeds on all four routes (GET inbox, GET one, POST review, PATCH review).
 *   • admin is 403 on all four routes, even though requireAuth alone would have let it through.
 *   • bar_manager and employee are 403 at requireAuth (never reach the handler).
 *   • the owner-authored brief routes are untouched and remain owner-only (regression guard —
 *     admin is still re-excluded there too, per the pre-existing pattern this PR matches).
 *
 * The companion static audit (test-beverage-brief-route-audit.js) separately proves server.js
 * itself contains this admin guard on all seven Slice 1A routes.
 *
 * Exits 0 on pass, 1 on failure.
 * Run: node scripts/test-fnb-beverage-brief-inbox-route-behavior.js
 */

import express from 'express'
import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import {
  OWNER_BEVERAGE_BRIEFS_DDL, BEVERAGE_BRIEF_EVENTS_DDL,
  createOwnerBeverageBrief, submitOwnerBeverageBrief, getOwnerBeverageBriefById,
} from '../src/services/beverage/ownerBeverageBriefService.js'
import {
  FNB_BRIEF_REVIEWS_DDL, createFnbBriefReview, updateFnbBriefReview, listFnbBriefInbox, getFnbBriefReviewForBrief,
} from '../src/services/beverage/fnbBriefReviewService.js'

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }

const db = new DatabaseSync(':memory:')
db.exec(OWNER_BEVERAGE_BRIEFS_DDL)
db.exec(BEVERAGE_BRIEF_EVENTS_DDL)
db.exec(FNB_BRIEF_REVIEWS_DDL)

function beverageBriefErrorStatus(err) {
  if (err && err.code === 'NOT_FOUND') return 404
  if (err && err.code === 'CONFLICT') return 409
  if (err && err.code === 'FORBIDDEN') return 403
  if (err && err.code === 'BAD_REQUEST') return 400
  return 500
}

// Faithful model of server.js requireAuth: role from header, 401 if absent, admin bypasses the
// allow-list, others must be in it (else 403), and req.venueId is resolved per request.
function requireAuth(...allowedRoles) {
  return (req, res, next) => {
    const role = req.header('X-Role')
    if (!role) return res.status(401).json({ error: 'Authorization required.' })
    req.user = { id: req.header('X-User') || 'u1', full_name: 'Test User', role }
    req.venueId = req.header('X-Venue') || 'venue_A'
    if (allowedRoles.length > 0 && role !== 'admin' && !allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden.' })
    }
    next()
  }
}

// ── beverageBriefErrorStatus mapping — unknown/unclassified errors must be 500, not 400 ────
ok(beverageBriefErrorStatus({ code: 'NOT_FOUND' }) === 404, '[error-status] NOT_FOUND -> 404')
ok(beverageBriefErrorStatus({ code: 'CONFLICT' }) === 409, '[error-status] CONFLICT -> 409')
ok(beverageBriefErrorStatus({ code: 'FORBIDDEN' }) === 403, '[error-status] FORBIDDEN -> 403')
ok(beverageBriefErrorStatus({ code: 'BAD_REQUEST' }) === 400, '[error-status] BAD_REQUEST -> 400')
ok(beverageBriefErrorStatus(new Error('unexpected DB failure')) === 500,
  '[error-status] an unclassified Error (no .code) -> 500, not 400')
ok(beverageBriefErrorStatus({ code: 'SOME_UNMAPPED_CODE' }) === 500,
  '[error-status] an unrecognized .code -> 500, not 400')

const app = express()
app.use(express.json())

// ── Owner routes (regression guard — untouched by this fix, admin already re-excluded) ──
app.post('/api/owner-beverage-briefs', requireAuth('owner'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'The beverage brief is owner-authored; admin cannot write one.' })
    }
    const brief = createOwnerBeverageBrief(db, { venueId: req.venueId, ownerUserId: String(req.user.id), fields: (req.body || {}).fields })
    res.status(201).json({ ok: true, brief })
  } catch (err) { res.status(beverageBriefErrorStatus(err)).json({ ok: false, error: err.message }) }
})
app.post('/api/owner-beverage-briefs/:briefId/submit', requireAuth('owner'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'The beverage brief is owner-authored; admin cannot submit one.' })
    }
    const brief = submitOwnerBeverageBrief(db, { venueId: req.venueId, briefId: req.params.briefId, ownerUserId: String(req.user.id) })
    res.json({ ok: true, brief })
  } catch (err) { res.status(beverageBriefErrorStatus(err)).json({ ok: false, error: err.message }) }
})

// ── F&B routes under test — admin explicitly re-excluded on all four ────────────────────
app.get('/api/fnb-beverage-brief-inbox', requireAuth('fb_director'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'The beverage brief inbox belongs to the F&B Director; admin cannot access it.' })
    }
    res.json({ ok: true, briefs: listFnbBriefInbox(db, req.venueId) })
  } catch (err) { res.status(beverageBriefErrorStatus(err)).json({ ok: false, error: err.message }) }
})

app.get('/api/fnb-beverage-brief-inbox/:briefId', requireAuth('fb_director'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'The beverage brief inbox belongs to the F&B Director; admin cannot access it.' })
    }
    const brief = getOwnerBeverageBriefById(db, req.venueId, req.params.briefId)
    if (!brief || brief.status !== 'submitted') return res.status(404).json({ ok: false, error: 'No submitted beverage brief found for this venue.' })
    res.json({ ok: true, brief, review: getFnbBriefReviewForBrief(db, req.venueId, req.params.briefId) })
  } catch (err) { res.status(beverageBriefErrorStatus(err)).json({ ok: false, error: err.message }) }
})

app.post('/api/fnb-brief-reviews', requireAuth('fb_director'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'The beverage brief inbox belongs to the F&B Director; admin cannot access it.' })
    }
    const review = createFnbBriefReview(db, { venueId: req.venueId, briefId: (req.body || {}).brief_id, reviewerUserId: String(req.user.id) })
    res.status(201).json({ ok: true, review })
  } catch (err) { res.status(beverageBriefErrorStatus(err)).json({ ok: false, error: err.message }) }
})

app.patch('/api/fnb-brief-reviews/:reviewId', requireAuth('fb_director'), (req, res) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return res.status(403).json({ ok: false, error: 'The beverage brief inbox belongs to the F&B Director; admin cannot access it.' })
    }
    const body = req.body || {}
    const review = updateFnbBriefReview(db, {
      venueId: req.venueId, reviewId: req.params.reviewId, reviewerUserId: String(req.user.id),
      notes: body.notes, adjustments: body.adjustments, status: body.status,
    })
    res.json({ ok: true, review })
  } catch (err) { res.status(beverageBriefErrorStatus(err)).json({ ok: false, error: err.message }) }
})

function req(server, method, path, { role, user, body } = {}) {
  const { port } = server.address()
  const headers = { 'Content-Type': 'application/json', 'X-Venue': 'venue_A', Connection: 'close' }
  if (role) headers['X-Role'] = role
  if (user) headers['X-User'] = user
  return fetch(`http://127.0.0.1:${port}${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  }).then(async r => ({ status: r.status, json: await r.json().catch(() => ({})) }))
}

const server = app.listen(0, async () => {
  console.log('\nF&B Beverage Brief Inbox routes — behavioral (fb_director-only) test\n')
  try {
    // Seed one SUBMITTED brief as the owner (via the owner routes, exercised here too).
    const created = await req(server, 'POST', '/api/owner-beverage-briefs', {
      role: 'owner', user: 'owner-1', body: { fields: { intent_statement: 'Bitter-forward, low sugar.' } },
    })
    ok(created.status === 201, '[seed] owner creates a draft brief')
    const briefId = created.json.brief.id
    const submitted = await req(server, 'POST', `/api/owner-beverage-briefs/${briefId}/submit`, { role: 'owner', user: 'owner-1' })
    ok(submitted.status === 200 && submitted.json.brief.status === 'submitted', '[seed] owner submits the brief')

    // ── fb_director succeeds on all four routes ──────────────────────────────────
    const fbList = await req(server, 'GET', '/api/fnb-beverage-brief-inbox', { role: 'fb_director' })
    ok(fbList.status === 200 && fbList.json.briefs.length === 1, '[fb_director] GET inbox succeeds and lists the submitted brief')

    const fbOne = await req(server, 'GET', `/api/fnb-beverage-brief-inbox/${briefId}`, { role: 'fb_director' })
    ok(fbOne.status === 200 && fbOne.json.brief.id === briefId, '[fb_director] GET one brief succeeds')

    const fbReview = await req(server, 'POST', '/api/fnb-brief-reviews', { role: 'fb_director', user: 'fnb-1', body: { brief_id: briefId } })
    ok(fbReview.status === 201 && fbReview.json.review.status === 'in_review', '[fb_director] POST review opens successfully')
    const reviewId = fbReview.json.review.id

    const fbPatch = await req(server, 'PATCH', `/api/fnb-brief-reviews/${reviewId}`, {
      role: 'fb_director', user: 'fnb-1', body: { status: 'approved' },
    })
    ok(fbPatch.status === 200 && fbPatch.json.review.status === 'approved', '[fb_director] PATCH review decides successfully')

    // ── admin is 403 on all four routes, despite the requireAuth global bypass ──────
    const adminList = await req(server, 'GET', '/api/fnb-beverage-brief-inbox', { role: 'admin' })
    ok(adminList.status === 403, '[admin] GET inbox is 403')

    const adminOne = await req(server, 'GET', `/api/fnb-beverage-brief-inbox/${briefId}`, { role: 'admin' })
    ok(adminOne.status === 403, '[admin] GET one brief is 403')

    const adminReview = await req(server, 'POST', '/api/fnb-brief-reviews', { role: 'admin', body: { brief_id: briefId } })
    ok(adminReview.status === 403, '[admin] POST review is 403')

    const adminPatch = await req(server, 'PATCH', `/api/fnb-brief-reviews/${reviewId}`, { role: 'admin', body: { status: 'declined' } })
    ok(adminPatch.status === 403, '[admin] PATCH review is 403')
    ok(getFnbBriefReviewForBrief(db, 'venue_A', briefId).status === 'approved',
      "[admin] the fb_director's decision is UNMUTATED by the admin attempt (still 'approved')")

    // ── bar_manager / employee never reach the handler (requireAuth gate) ───────────
    const barManagerList = await req(server, 'GET', '/api/fnb-beverage-brief-inbox', { role: 'bar_manager' })
    ok(barManagerList.status === 403, '[bar_manager] GET inbox is 403 (requireAuth gate)')
    const employeeList = await req(server, 'GET', '/api/fnb-beverage-brief-inbox', { role: 'employee' })
    ok(employeeList.status === 403, '[employee] GET inbox is 403 (requireAuth gate)')
    const anonList = await req(server, 'GET', '/api/fnb-beverage-brief-inbox', {})
    ok(anonList.status === 401, '[extra] unauthenticated GET inbox is 401')

    // ── owner routes remain owner-only, unaffected by this fix ──────────────────────
    const adminOwnerCreate = await req(server, 'POST', '/api/owner-beverage-briefs', { role: 'admin', body: { fields: {} } })
    ok(adminOwnerCreate.status === 403, '[regression] admin still cannot create an owner beverage brief')
    const ownerCreate2 = await req(server, 'POST', '/api/owner-beverage-briefs', { role: 'owner', user: 'owner-2', body: { fields: {} } })
    ok(ownerCreate2.status === 201, '[regression] owner can still create a brief')

    // ── an unclassified failure (DB gone) must surface as 500, never 400 ────────────
    // Closing the DB mid-request makes the underlying better-sqlite3 call throw a plain error
    // with no .code the service ever sets — exactly the "unexpected DB/server failure" case
    // that must not be misreported as a 400 client error. Must run LAST (db is unusable after).
    db.close()
    const dbGoneList = await req(server, 'GET', '/api/fnb-beverage-brief-inbox', { role: 'fb_director' })
    ok(dbGoneList.status === 500, '[unknown-error] GET inbox returns 500 (not 400) when the DB throws an unclassified error')
    const dbGoneOne = await req(server, 'GET', `/api/fnb-beverage-brief-inbox/${briefId}`, { role: 'fb_director' })
    ok(dbGoneOne.status === 500, '[unknown-error] GET one brief returns 500 (not 400) when the DB throws an unclassified error')
  } catch (e) {
    failed++; console.error('  [FAIL] unexpected error:', e && e.message)
  } finally {
    console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
    process.exitCode = failed > 0 ? 1 : 0
    try { db.close() } catch { /* in-memory */ }
    server.close()
  }
})
