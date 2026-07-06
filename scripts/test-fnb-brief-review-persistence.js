#!/usr/bin/env node
/**
 * Deterministic tests for the F&B Brief Review persistence layer
 * (Beverage Slice 1A — src/services/beverage/fnbBriefReviewService.js).
 *
 * In-memory node:sqlite DatabaseSync(':memory:') with the real DDLs — no real DB, no server
 * boot, no network, no AI. Exits 0 on pass, 1 on failure.
 *
 * Run: node scripts/test-fnb-brief-review-persistence.js
 */

import { DatabaseSync } from 'node:sqlite'

Promise.all([
  import('../src/services/beverage/ownerBeverageBriefService.js'),
  import('../src/services/beverage/fnbBriefReviewService.js'),
]).then(runTests).catch(err => {
  console.error('\n[FAIL] Could not import services:', err.message)
  process.exit(1)
})

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }
function throwsWithCode(fn, code, msg) {
  try { fn(); failed++; console.error(`  [FAIL] ${msg} (no throw)`) }
  catch (e) { ok(e.code === code, `${msg} (got code ${e.code}: ${e.message})`) }
}

function runTests([briefSvc, reviewSvc]) {
  const {
    OWNER_BEVERAGE_BRIEFS_DDL, BEVERAGE_BRIEF_EVENTS_DDL,
    createOwnerBeverageBrief, submitOwnerBeverageBrief, getOwnerBeverageBriefById,
    listBeverageBriefEvents,
  } = briefSvc
  const {
    FNB_BRIEF_REVIEWS_DDL,
    createFnbBriefReview, updateFnbBriefReview, getFnbBriefReviewById,
    getFnbBriefReviewForBrief, listFnbBriefInbox,
  } = reviewSvc

  const db = new DatabaseSync(':memory:')
  db.exec(OWNER_BEVERAGE_BRIEFS_DDL)
  db.exec(BEVERAGE_BRIEF_EVENTS_DDL)
  db.exec(FNB_BRIEF_REVIEWS_DDL)

  console.log('\nF&B Brief Review — persistence tests\n')

  // Fixture: one submitted brief and one still-draft brief in venue-1; one submitted in venue-2.
  const draftBrief = createOwnerBeverageBrief(db, { venueId: 'venue-1', ownerUserId: 'owner-1', fields: { intent_statement: 'Draft only.' } })
  const brief = createOwnerBeverageBrief(db, {
    venueId: 'venue-1', ownerUserId: 'owner-1',
    fields: { intent_statement: 'Bitter-forward, low sugar.', price_range: '₪58–₪72' },
  })
  submitOwnerBeverageBrief(db, { venueId: 'venue-1', briefId: brief.id, ownerUserId: 'owner-1' })
  const foreignBrief = createOwnerBeverageBrief(db, { venueId: 'venue-2', ownerUserId: 'owner-9', fields: {} })
  submitOwnerBeverageBrief(db, { venueId: 'venue-2', briefId: foreignBrief.id, ownerUserId: 'owner-9' })

  // ── inbox lists submitted briefs only, venue-scoped ──────────────────────────
  const inbox = listFnbBriefInbox(db, 'venue-1')
  ok(inbox.length === 1 && inbox[0].id === brief.id, 'inbox: lists ONLY the submitted brief (draft excluded)')
  ok(inbox[0].review === null, 'inbox: unreviewed brief carries review: null')
  ok(!inbox.some(b => b.id === foreignBrief.id), 'inbox: cross-venue brief is never listed')
  ok(listFnbBriefInbox(db, 'venue-3').length === 0, 'inbox: unknown venue → [] (honest empty)')

  // ── review can only open on a submitted brief ────────────────────────────────
  throwsWithCode(() => createFnbBriefReview(db, { venueId: 'venue-1', briefId: draftBrief.id, reviewerUserId: 'fnb-1' }),
    'CONFLICT', 'create: review on a DRAFT brief is refused')
  throwsWithCode(() => createFnbBriefReview(db, { venueId: 'venue-1', briefId: foreignBrief.id, reviewerUserId: 'fnb-1' }),
    'NOT_FOUND', 'create: cross-venue brief id → NOT_FOUND (no foreign write)')

  const review = createFnbBriefReview(db, { venueId: 'venue-1', briefId: brief.id, reviewerUserId: 'fnb-1' })
  ok(review && review.status === 'in_review', 'create: review opens as in_review')
  ok(review.reviewer_user_id === 'fnb-1', 'create: reviewer recorded')
  ok(review.decided_at === null, 'create: decided_at is null while open')
  ok(listBeverageBriefEvents(db, 'venue-1', brief.id).some(e => e.event_type === 'review_created'),
    'audit: review_created event written')

  // one review per brief
  throwsWithCode(() => createFnbBriefReview(db, { venueId: 'venue-1', briefId: brief.id, reviewerUserId: 'fnb-2' }),
    'CONFLICT', 'create: second review on the same brief is refused')

  // ── adjustments are a diff; the owner value is preserved, the brief untouched ─
  const withAdj = updateFnbBriefReview(db, {
    venueId: 'venue-1', reviewId: review.id, reviewerUserId: 'fnb-1',
    notes: 'Direction is sound; price ceiling is low for the intent.',
    adjustments: [{ field: 'price_range', adjusted_value: '₪64–₪84', note: 'Premium citrus program costs more.' }],
  })
  const adj = withAdj.field_adjustments.price_range
  ok(adj && adj.adjusted_value === '₪64–₪84', 'adjust: adjusted_value stored on the review')
  ok(adj.owner_value === '₪58–₪72', 'adjust: the OWNER value is copied into the diff, preserved verbatim')
  ok(adj.note === 'Premium citrus program costs more.', 'adjust: adjustment note stored')
  const briefAfter = getOwnerBeverageBriefById(db, 'venue-1', brief.id)
  ok(briefAfter.fields.price_range === '₪58–₪72', 'adjust: the brief row itself is NEVER overwritten')
  ok(briefAfter.fields.intent_statement === 'Bitter-forward, low sugar.', 'adjust: untouched fields stay untouched')
  ok(listBeverageBriefEvents(db, 'venue-1', brief.id).some(e => e.event_type === 'review_adjustment_added'),
    'audit: review_adjustment_added event written')

  // invalid adjustments are rejected
  throwsWithCode(() => updateFnbBriefReview(db, {
    venueId: 'venue-1', reviewId: review.id, reviewerUserId: 'fnb-1',
    adjustments: [{ field: 'not_a_field', adjusted_value: 'x' }],
  }), 'BAD_REQUEST', 'adjust: unknown field rejected')

  // ── decision: closes the review, sets decided_at, writes the audit event ─────
  throwsWithCode(() => updateFnbBriefReview(db, {
    venueId: 'venue-1', reviewId: review.id, reviewerUserId: 'fnb-1', status: 'submitted',
  }), 'BAD_REQUEST', 'decide: a non-decision status is rejected')

  const decided = updateFnbBriefReview(db, {
    venueId: 'venue-1', reviewId: review.id, reviewerUserId: 'fnb-1', status: 'clarification_requested',
  })
  ok(decided.status === 'clarification_requested', 'decide: decision status lands')
  ok(typeof decided.decided_at === 'string' && decided.decided_at.length > 0, 'decide: decided_at set')
  ok(listBeverageBriefEvents(db, 'venue-1', brief.id).some(e =>
    e.event_type === 'review_status_changed' && e.event_payload?.to_status === 'clarification_requested'),
    'audit: review_status_changed event carries from/to')

  // closed once decided
  throwsWithCode(() => updateFnbBriefReview(db, {
    venueId: 'venue-1', reviewId: review.id, reviewerUserId: 'fnb-1', notes: 'late edit',
  }), 'CONFLICT', 'decide: a decided review refuses further edits')
  ok(getFnbBriefReviewById(db, 'venue-1', review.id).notes === 'Direction is sound; price ceiling is low for the intent.',
    'decide: notes unchanged after the refused late edit')

  // ── venue scoping on review reads ────────────────────────────────────────────
  ok(getFnbBriefReviewById(db, 'venue-2', review.id) === null, 'scoping: cross-venue review read → null')
  ok(getFnbBriefReviewForBrief(db, 'venue-2', brief.id) === null, 'scoping: cross-venue review-for-brief → null')

  // inbox now reflects the decided review honestly
  const inboxAfter = listFnbBriefInbox(db, 'venue-1')
  ok(inboxAfter[0].review && inboxAfter[0].review.status === 'clarification_requested',
    'inbox: review state reflects the real decision')

  console.log(`\n  ${passed} passed, ${failed} failed\n`)
  process.exit(failed === 0 ? 0 : 1)
}
