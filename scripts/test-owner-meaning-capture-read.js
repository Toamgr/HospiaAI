#!/usr/bin/env node
/**
 * Deterministic service/persistence tests for the Owner Meaning Capture AUDIT READ layer
 * (Slice 4D.2): listOwnerMeaningCaptures + getOwnerMeaningCaptureById + listOwnerMeaningCaptureEvents.
 *
 * In-memory node:sqlite DatabaseSync(':memory:') + the exported DDL constants — no real DB, no
 * server boot, no network, no AI. Captures are created through the REAL writer
 * (createOwnerMeaningCapture) from real candidate shapes, then read back. Exits 0 on pass, 1 on fail.
 *
 * Covers (per the 4D.2 prompt):
 *   • list returns captures NEWEST-FIRST (deterministic via created_at DESC, rowid DESC);
 *   • list respects limit / offset; max limit enforced; invalid limit/offset fall back safely;
 *   • list filters by the SERVER venue (a client cannot widen it; venue_B never leaks into venue_A);
 *   • list is READ-ONLY (the row + audit counts are unchanged before/after, repeatable);
 *   • each list item carries event_count and the full server-authored snapshot/question context;
 *   • get-by-id returns the correct capture and its event trail;
 *   • cross-venue get-by-id → null (no foreign read);
 *   • owner_response_raw round-trips BYTE-FOR-BYTE on read (never trimmed/transformed);
 *   • candidate_snapshot / question context / fingerprint round-trip without any client override;
 *   • no captured_owner_meaning / interpreted-confirmed-meaning field is ever returned.
 *
 * Run: node scripts/test-owner-meaning-capture-read.js
 */

import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'

import('../src/services/venueIntelligence/ownerMeaningCaptureService.js')
  .then(runTests)
  .catch(err => { console.error('\n[FAIL] Could not import ownerMeaningCaptureService.js:', err.message); process.exit(1) })

function runTests(svc) {
  const {
    OWNER_MEANING_CAPTURES_DDL, OWNER_MEANING_CAPTURE_EVENTS_DDL,
    OWNER_MEANING_LIST_DEFAULT_LIMIT, OWNER_MEANING_LIST_MAX_LIMIT,
    createOwnerMeaningCapture, listOwnerMeaningCaptures,
    getOwnerMeaningCaptureById, listOwnerMeaningCaptureEvents,
  } = svc

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }

  console.log('\n\x1b[1mHESTIA Owner Meaning Capture — Audit Read (Slice 4D.2) Tests\x1b[0m\n')

  const VENUE_A = 'venue_A', VENUE_B = 'venue_B'

  // A live re-derived candidate, parameterized so each capture can target a distinct concept (→ a
  // distinct stable fingerprint). Mirrors deriveInterpretedCandidatesForVenue's shape and carries
  // an ephemeral candidate_id + routing earmark so we can prove neither leaks on read.
  function candidate(concept, reviewIds, overrides = {}) {
    return {
      candidate_id: randomUUID(),     // EPHEMERAL — never load-bearing
      venue_id: VENUE_A,
      source_record_space: 'concept_draft',
      concept_ref: concept,
      destination_hint: null,         // routing earmark — never leaks
      created_from_summary_version: 'derived-live@2026-06-27T00:00:00.000Z',
      candidate_type: 'missing_data_signal',
      status: 'insufficient_evidence',
      interpretation_title: 'Possible signal — evidence not yet sufficient to interpret',
      interpretation_summary: 'This concept has saved meaning the owner kept.',
      supporting_evidence_refs: reviewIds.map(id => ({ review_id: id, concept_ref: concept, review_action: 'captured', confidence_band: null })),
      conflicting_evidence_refs: [],
      missing_evidence: ['No second, independent concept corroborates this meaning yet.'],
      uncertainty_notes: ['Evidence-bound suspicion only.'],
      confidence_band: null,
      suggested_owner_question: 'Does this saved meaning belong to the venue identity, or need more evidence?',
      ...overrides,
    }
  }

  const db = new DatabaseSync(':memory:')
  db.exec(OWNER_MEANING_CAPTURES_DDL)
  db.exec(OWNER_MEANING_CAPTURE_EVENTS_DDL)

  // Helper: create a capture in a venue and return the stored row.
  function makeCapture(venueId, concept, response, createdBy = 'Tal Millo') {
    return createOwnerMeaningCapture(db, {
      venueId, conceptRef: concept, ownerResponseRaw: response,
      candidate: { ...candidate(concept, [randomUUID(), randomUUID()]), venue_id: venueId },
      createdBy,
    })
  }

  // ── Seed: three captures in venue_A (ordered), one in venue_B ─────────────────
  section('Seed')
  const cA1 = makeCapture(VENUE_A, randomUUID(), 'First: we host guests, not customers.')
  const cA2 = makeCapture(VENUE_A, randomUUID(), 'Second: the room is candlelit on purpose.')
  const cA3 = makeCapture(VENUE_A, randomUUID(), 'Third:   whitespace and 日本語 kept verbatim.   ')
  const cB1 = makeCapture(VENUE_B, randomUUID(), 'Venue B private capture — must never leak to A.')
  assert('seeded 3 venue_A + 1 venue_B captures', !!(cA1 && cA2 && cA3 && cB1))

  // ── list: newest-first ───────────────────────────────────────────────────────
  section('list — newest first')
  const allA = listOwnerMeaningCaptures(db, VENUE_A, {})
  assert('returns an object with captures[] + pagination (not a bare array)',
    allA && Array.isArray(allA.captures) && allA.pagination && typeof allA.pagination === 'object')
  assert('venue_A list has exactly 3 captures', allA.captures.length === 3, `got ${allA.captures.length}`)
  assert('newest first (cA3, cA2, cA1)',
    allA.captures[0].id === cA3.id && allA.captures[1].id === cA2.id && allA.captures[2].id === cA1.id,
    allA.captures.map(c => c.id).join(','))
  assert('each item carries event_count = 1', allA.captures.every(c => c.event_count === 1))
  assert('default limit reflected in pagination', allA.pagination.limit === OWNER_MEANING_LIST_DEFAULT_LIMIT)
  assert('pagination.count = page length (3)', allA.pagination.count === 3)
  assert('has_more false (all returned)', allA.pagination.has_more === false)

  // ── list: limit / offset ─────────────────────────────────────────────────────
  section('list — limit / offset')
  const page1 = listOwnerMeaningCaptures(db, VENUE_A, { limit: 2, offset: 0 })
  assert('limit=2 returns 2 newest', page1.captures.length === 2 && page1.captures[0].id === cA3.id && page1.captures[1].id === cA2.id)
  assert('limit=2 has_more true (1 left)', page1.pagination.has_more === true)
  const page2 = listOwnerMeaningCaptures(db, VENUE_A, { limit: 2, offset: 2 })
  assert('offset=2 returns the remaining 1 (cA1)', page2.captures.length === 1 && page2.captures[0].id === cA1.id)
  assert('offset=2 has_more false', page2.pagination.has_more === false)
  const offPastEnd = listOwnerMeaningCaptures(db, VENUE_A, { limit: 2, offset: 99 })
  assert('offset past end returns empty page, has_more false', offPastEnd.captures.length === 0 && offPastEnd.pagination.has_more === false)

  // ── list: invalid limit/offset fall back safely; max enforced ────────────────
  section('list — safe limit/offset clamping')
  assert('limit="abc" → default', listOwnerMeaningCaptures(db, VENUE_A, { limit: 'abc' }).pagination.limit === OWNER_MEANING_LIST_DEFAULT_LIMIT)
  assert('limit=0 → default', listOwnerMeaningCaptures(db, VENUE_A, { limit: 0 }).pagination.limit === OWNER_MEANING_LIST_DEFAULT_LIMIT)
  assert('limit=-5 → default', listOwnerMeaningCaptures(db, VENUE_A, { limit: -5 }).pagination.limit === OWNER_MEANING_LIST_DEFAULT_LIMIT)
  assert('limit=9999 → clamped to max', listOwnerMeaningCaptures(db, VENUE_A, { limit: 9999 }).pagination.limit === OWNER_MEANING_LIST_MAX_LIMIT)
  assert('offset=-5 → 0', listOwnerMeaningCaptures(db, VENUE_A, { offset: -5 }).pagination.offset === 0)
  assert('offset="xyz" → 0', listOwnerMeaningCaptures(db, VENUE_A, { offset: 'xyz' }).pagination.offset === 0)

  // ── list: venue scoping ──────────────────────────────────────────────────────
  section('list — venue scoping')
  const allB = listOwnerMeaningCaptures(db, VENUE_B, {})
  assert('venue_B list has exactly 1 capture', allB.captures.length === 1 && allB.captures[0].id === cB1.id)
  assert('venue_A list contains NONE of venue_B captures', !allA.captures.some(c => c.id === cB1.id))
  assert('blank venueId → empty safe result', listOwnerMeaningCaptures(db, '', {}).captures.length === 0)

  // ── list: candidate_fingerprint filter (stable identity; no candidate_id column) ─
  section('list — candidate_fingerprint filter')
  const fpA1 = cA1.candidate_fingerprint
  const fpFiltered = listOwnerMeaningCaptures(db, VENUE_A, { candidateFingerprint: fpA1 })
  assert('filter by fingerprint returns only that candidate thread',
    fpFiltered.captures.length === 1 && fpFiltered.captures[0].id === cA1.id)
  assert('unknown fingerprint returns empty', listOwnerMeaningCaptures(db, VENUE_A, { candidateFingerprint: 'nope' }).captures.length === 0)

  // ── list: read-only (no mutation) ────────────────────────────────────────────
  section('list — read-only')
  const capCountBefore = db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_captures').get().n
  const audCountBefore = db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_capture_events').get().n
  listOwnerMeaningCaptures(db, VENUE_A, {})
  listOwnerMeaningCaptures(db, VENUE_A, { limit: 1 })
  const capCountAfter = db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_captures').get().n
  const audCountAfter = db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_capture_events').get().n
  assert('listing does not change the capture row count', capCountBefore === capCountAfter)
  assert('listing does not change the audit row count', audCountBefore === audCountAfter)
  const repeat = listOwnerMeaningCaptures(db, VENUE_A, {})
  assert('repeated list is identical (deterministic)', JSON.stringify(repeat) === JSON.stringify(allA))

  // ── get-by-id ────────────────────────────────────────────────────────────────
  section('get-by-id + events')
  const one = getOwnerMeaningCaptureById(db, VENUE_A, cA2.id)
  assert('get-by-id returns the correct capture', one && one.id === cA2.id)
  const events = listOwnerMeaningCaptureEvents(db, VENUE_A, cA2.id)
  assert('events trail present (1 owner_answer_captured event)',
    events.length === 1 && events[0].event_type === 'owner_answer_captured')
  assert('event carries event_payload_json + parsed event_payload', !!events[0].event_payload_json && !!events[0].event_payload)
  assert('cross-venue get-by-id → null (no foreign read)', getOwnerMeaningCaptureById(db, VENUE_B, cA2.id) === null)
  assert('cross-venue events → empty', listOwnerMeaningCaptureEvents(db, VENUE_B, cA2.id).length === 0)

  // ── byte-for-byte + server-authored context round-trip ───────────────────────
  section('round-trip integrity')
  const tricky = 'Third:   whitespace and 日本語 kept verbatim.   '
  const trickyFromList = listOwnerMeaningCaptures(db, VENUE_A, {}).captures.find(c => c.id === cA3.id)
  const trickyFromGet = getOwnerMeaningCaptureById(db, VENUE_A, cA3.id)
  assert('owner_response_raw round-trips byte-for-byte via list', trickyFromList.owner_response_raw === tricky)
  assert('owner_response_raw round-trips byte-for-byte via get-by-id', trickyFromGet.owner_response_raw === tricky)
  assert('candidate_snapshot is present + parsed on read', trickyFromGet.candidate_snapshot && typeof trickyFromGet.candidate_snapshot === 'object')
  assert('question_text round-trips (server-authored)', typeof trickyFromGet.question_text === 'string' && trickyFromGet.question_text.length > 0)
  assert('question_reason round-trips (server-authored)', typeof trickyFromGet.question_reason === 'string' && trickyFromGet.question_reason.length > 0)
  assert('candidate_fingerprint round-trips + matches the write-time value', trickyFromGet.candidate_fingerprint === cA3.candidate_fingerprint)
  assert('snapshot does NOT carry the ephemeral candidate_id as a load-bearing field',
    !('candidate_id' in trickyFromGet.candidate_snapshot))
  assert('snapshot does NOT carry a routing earmark (destination_hint)', !('destination_hint' in trickyFromGet.candidate_snapshot))

  // ── no interpreted / confirmed-meaning field on read ─────────────────────────
  section('no forbidden field on read')
  const serialized = JSON.stringify({ list: allA, one, events })
  for (const token of ['captured_owner_meaning', 'eligible_for_future_proposal', 'proposed_dna_change', 'dna_target', 'confirmed_meaning']) {
    assert(`read surface exposes no forbidden field: ${token}`, !serialized.includes(token))
  }

  console.log(`\n──────────────────────────────────────────`)
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) { console.log('\x1b[31m[FAIL]\x1b[0m'); process.exit(1) }
  console.log('\x1b[32m[PASS] All tests passed.\x1b[0m')
  try { db.close() } catch { /* in-memory */ }
  process.exit(0)
}
