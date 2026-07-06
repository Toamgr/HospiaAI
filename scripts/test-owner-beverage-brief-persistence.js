#!/usr/bin/env node
/**
 * Deterministic tests for the Owner Beverage Direction Brief persistence layer
 * (Beverage Slice 1A — src/services/beverage/ownerBeverageBriefService.js).
 *
 * In-memory node:sqlite DatabaseSync(':memory:') with the real DDLs — no real DB, no server
 * boot, no network, no AI. Exits 0 on pass, 1 on failure.
 *
 * Run: node scripts/test-owner-beverage-brief-persistence.js
 */

import { DatabaseSync } from 'node:sqlite'

import(
  '../src/services/beverage/ownerBeverageBriefService.js'
).then(runTests).catch(err => {
  console.error('\n[FAIL] Could not import the service:', err.message)
  process.exit(1)
})

let passed = 0, failed = 0
function ok(cond, msg) { if (cond) { passed++ } else { failed++; console.error(`  [FAIL] ${msg}`) } }
function throwsWithCode(fn, code, msg) {
  try { fn(); failed++; console.error(`  [FAIL] ${msg} (no throw)`) }
  catch (e) { ok(e.code === code, `${msg} (got code ${e.code}: ${e.message})`) }
}

function runTests(svc) {
  const {
    OWNER_BEVERAGE_BRIEFS_DDL, BEVERAGE_BRIEF_EVENTS_DDL,
    createOwnerBeverageBrief, updateOwnerBeverageBriefDraft, submitOwnerBeverageBrief,
    getOwnerBeverageBriefById, listOwnerBeverageBriefsForVenue, listBeverageBriefEvents,
    BRIEF_CONTENT_FIELDS,
  } = svc

  const db = new DatabaseSync(':memory:')
  db.exec(OWNER_BEVERAGE_BRIEFS_DDL)
  db.exec(BEVERAGE_BRIEF_EVENTS_DDL)
  // The list join reads the reviews table; boot it via its own service DDL (real DDL, no mock).
  import('../src/services/beverage/fnbBriefReviewService.js').then(({ FNB_BRIEF_REVIEWS_DDL }) => {
    db.exec(FNB_BRIEF_REVIEWS_DDL)

    console.log('\nOwner Beverage Brief — persistence tests\n')

    // ── owner can create a draft brief ─────────────────────────────────────────
    const draft = createOwnerBeverageBrief(db, {
      venueId: 'venue-1', ownerUserId: 'owner-1',
      fields: { intent_statement: 'Calm, citrus-forward aperitivo hour.', cocktail_count: 8 },
    })
    ok(draft && draft.status === 'draft', 'create: returns a draft brief')
    ok(draft.owner_user_id === 'owner-1', 'create: records the owner author')
    ok(draft.fields.intent_statement === 'Calm, citrus-forward aperitivo hour.', 'create: stores typed text verbatim')
    ok(draft.fields.cocktail_count === 8, 'create: stores cocktail_count as a number')
    ok(draft.fields.venue_type === null, 'create: an untyped field is stored as null (honest empty)')
    ok(draft.submitted_at === null, 'create: submitted_at is null on a draft')

    // provenance is server-derived: owner_typed for typed fields, empty otherwise
    ok(draft.field_provenance.intent_statement === 'owner_typed', 'provenance: typed field = owner_typed')
    ok(draft.field_provenance.cocktail_count === 'owner_typed', 'provenance: typed numeric field = owner_typed')
    ok(draft.field_provenance.guest_profile === 'empty', 'provenance: untyped field = empty')
    ok(BRIEF_CONTENT_FIELDS.every(f => ['owner_typed', 'empty'].includes(draft.field_provenance[f])),
      'provenance: every field has a closed-vocabulary provenance value')

    // audit: brief_created exists
    const createdEvents = listBeverageBriefEvents(db, 'venue-1', draft.id)
    ok(createdEvents.some(e => e.event_type === 'brief_created'), 'audit: brief_created event written')

    // ── validation rejects, never rewrites ─────────────────────────────────────
    throwsWithCode(() => createOwnerBeverageBrief(db, {
      venueId: 'venue-1', ownerUserId: 'owner-1', fields: { cocktail_count: 2.5 },
    }), 'BAD_REQUEST', 'validation: fractional cocktail_count rejected')
    throwsWithCode(() => createOwnerBeverageBrief(db, {
      venueId: 'venue-1', ownerUserId: 'owner-1', fields: { made_up_field: 'x' },
    }), 'BAD_REQUEST', 'validation: unknown field rejected (no smuggled columns)')

    // ── owner can edit their draft ─────────────────────────────────────────────
    const edited = updateOwnerBeverageBriefDraft(db, {
      venueId: 'venue-1', briefId: draft.id, ownerUserId: 'owner-1',
      fields: { intent_statement: 'Calm, citrus-forward aperitivo hour.', guest_profile: 'Neighborhood regulars.' },
    })
    ok(edited.fields.guest_profile === 'Neighborhood regulars.', 'edit: draft field update lands')
    ok(edited.field_provenance.guest_profile === 'owner_typed', 'edit: provenance re-derived on update')
    ok(edited.fields.cocktail_count === null, 'edit: a field omitted on update becomes empty (full replace, no ghost value)')

    // author-only: another owner in the same venue cannot edit
    throwsWithCode(() => updateOwnerBeverageBriefDraft(db, {
      venueId: 'venue-1', briefId: draft.id, ownerUserId: 'owner-2', fields: {},
    }), 'FORBIDDEN', 'edit: non-author owner is refused')

    // ── owner can submit ───────────────────────────────────────────────────────
    const submitted = submitOwnerBeverageBrief(db, { venueId: 'venue-1', briefId: draft.id, ownerUserId: 'owner-1' })
    ok(submitted.status === 'submitted', 'submit: status becomes submitted')
    ok(typeof submitted.submitted_at === 'string' && submitted.submitted_at.length > 0, 'submit: submitted_at is set')
    const submittedEvents = listBeverageBriefEvents(db, 'venue-1', draft.id)
    ok(submittedEvents.some(e => e.event_type === 'brief_submitted'), 'audit: brief_submitted event written')

    // ── submitted brief cannot be edited silently (immutability) ───────────────
    throwsWithCode(() => updateOwnerBeverageBriefDraft(db, {
      venueId: 'venue-1', briefId: draft.id, ownerUserId: 'owner-1',
      fields: { intent_statement: 'REWRITTEN' },
    }), 'CONFLICT', 'immutability: editing a submitted brief throws CONFLICT')
    const afterAttempt = getOwnerBeverageBriefById(db, 'venue-1', draft.id)
    ok(afterAttempt.fields.intent_statement === 'Calm, citrus-forward aperitivo hour.',
      'immutability: the owner value is byte-for-byte unchanged after the edit attempt')
    throwsWithCode(() => submitOwnerBeverageBrief(db, { venueId: 'venue-1', briefId: draft.id, ownerUserId: 'owner-1' }),
      'CONFLICT', 'immutability: double submit throws CONFLICT')

    // ── venue scoping ──────────────────────────────────────────────────────────
    ok(getOwnerBeverageBriefById(db, 'venue-2', draft.id) === null, 'scoping: cross-venue read by id → null')
    ok(listOwnerBeverageBriefsForVenue(db, 'venue-2').length === 0, 'scoping: cross-venue list → [] (honest empty)')
    ok(listBeverageBriefEvents(db, 'venue-2', draft.id).length === 0, 'scoping: cross-venue audit read → []')

    // ── list carries review state honestly ─────────────────────────────────────
    const list = listOwnerBeverageBriefsForVenue(db, 'venue-1')
    ok(list.length === 1 && list[0].id === draft.id, 'list: venue list returns the brief')
    ok(list[0].review === null, 'list: unreviewed brief carries review: null (never a fake status)')

    // ── summary ────────────────────────────────────────────────────────────────
    console.log(`\n  ${passed} passed, ${failed} failed\n`)
    process.exit(failed === 0 ? 0 : 1)
  }).catch(err => {
    console.error('\n[FAIL] Could not import the review service DDL:', err.message)
    process.exit(1)
  })
}
