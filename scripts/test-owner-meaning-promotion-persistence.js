#!/usr/bin/env node
/**
 * Deterministic service/persistence tests for the Owner Meaning Promotion READ-ONLY queue
 * (Slice 4G.1): the two-table DDL + listOwnerMeaningPromotionCandidates +
 * getOwnerMeaningPromotionCandidateById + listOwnerMeaningPromotionEvents +
 * resolveSourceCapturesForPromotionCandidate.
 *
 * In-memory node:sqlite DatabaseSync(':memory:') + the exported DDL constants — no real DB, no
 * server boot, no network, no AI. Exits 0 on pass, 1 on failure.
 *
 * IMPORTANT — no proposal generator exists in 4G.1. Promotion candidates are seeded DIRECTLY into
 * owner_meaning_promotion_candidates via a TEST-LOCAL fixture (seedPromotionCandidateForTest) —
 * NOT a product writer (the service exports read methods + DDL constants ONLY). Source captures are
 * seeded through the REAL capture writer (createOwnerMeaningCapture) so evidence resolution is
 * exercised against real owner_response_raw.
 *
 * Covers (per OWNER_MEANING_PROMOTION_DDL_CONTRACT.md §12 + READ_API_CONTRACT §13 + the 4G.1 plan):
 *   • DDL creates both tables idempotently; tables + indexes exist;
 *   • valid candidate insert succeeds; invalid status / confidence_score / confidence_label /
 *     record_space / created_by_actor_type rejected by CHECK;
 *   • list newest-first, venue-scoped, paginated; closed-vocab filters work; invalid filter throws;
 *   • list uses EXCERPTS only (no full raw); list omits venue_id;
 *   • detail returns candidate (venue_id omitted) + source captures (full raw) + events;
 *   • cross-venue detail → null; cross-venue source capture ref → { missing:true };
 *   • read methods do not mutate row/event counts;
 *   • capture POST (real writer) cannot create a promotion candidate.
 *
 * Run: node scripts/test-owner-meaning-promotion-persistence.js
 */

import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'

Promise.all([
  import('../src/services/venueIntelligence/ownerMeaningPromotionService.js'),
  import('../src/services/venueIntelligence/ownerMeaningCaptureService.js'),
])
  .then(([promo, capture]) => runTests(promo, capture))
  .catch(err => { console.error('\n[FAIL] Could not import services:', err.message); process.exit(1) })

function runTests(promo, capture) {
  const {
    OWNER_MEANING_PROMOTION_CANDIDATES_DDL, OWNER_MEANING_PROMOTION_EVENTS_DDL,
    OWNER_MEANING_PROMOTION_SCHEMA_VERSION, OWNER_MEANING_PROMOTION_RECORD_SPACE,
    OWNER_MEANING_PROMOTION_STATUSES, OWNER_MEANING_PROMOTION_RESERVED_STATUS,
    OWNER_MEANING_PROMOTION_CONFIDENCE_LABELS, OWNER_MEANING_PROMOTION_EVENT_TYPES,
    OWNER_MEANING_PROMOTION_TARGET_PATHS,
    OWNER_MEANING_PROMOTION_LIST_DEFAULT_LIMIT, OWNER_MEANING_PROMOTION_LIST_MAX_LIMIT,
    OWNER_MEANING_PROMOTION_EXCERPT_MAX,
    listOwnerMeaningPromotionCandidates, getOwnerMeaningPromotionCandidateById,
    listOwnerMeaningPromotionEvents, resolveSourceCapturesForPromotionCandidate,
  } = promo
  const {
    OWNER_MEANING_CAPTURES_DDL, OWNER_MEANING_CAPTURE_EVENTS_DDL, createOwnerMeaningCapture,
  } = capture

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }
  function throws(fn) { try { fn(); return false } catch { return true } }

  console.log('\n\x1b[1mHESTIA Owner Meaning Promotion — Read-only Queue Persistence Tests\x1b[0m\n')

  const VENUE_A = 'venue_A', VENUE_B = 'venue_B'

  const db = new DatabaseSync(':memory:')
  db.exec(OWNER_MEANING_PROMOTION_CANDIDATES_DDL)
  db.exec(OWNER_MEANING_PROMOTION_EVENTS_DDL)
  db.exec(OWNER_MEANING_CAPTURES_DDL)
  db.exec(OWNER_MEANING_CAPTURE_EVENTS_DDL)

  const candCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_promotion_candidates').get().n
  const evtCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_promotion_events').get().n

  // ── TEST-LOCAL fixture (NOT a product writer) ───────────────────────────────
  // Seeds one candidate row directly. This exists ONLY so the read service has something to read;
  // it is never exported from the service and is unreachable from any route. A real proposal
  // generator is a future slice.
  function seedPromotionCandidateForTest(opts = {}) {
    const id = opts.id || randomUUID()
    const row = {
      id,
      venue_id: opts.venueId || VENUE_A,
      source_capture_ids_json: JSON.stringify(opts.sourceCaptureIds || []),
      source_capture_fingerprints_json: JSON.stringify(opts.sourceCaptureFingerprints || []),
      proposed_target_path: opts.targetPath || 'owner_notes',
      proposed_target_label: opts.targetLabel || 'Owner notes',
      current_value_snapshot_json: JSON.stringify(opts.currentValue ?? null),
      proposed_value_json: JSON.stringify(opts.proposedValue ?? 'A candlelit, spirit-forward room.'),
      proposed_meaning_summary: opts.meaningSummary ?? 'Proposed reading of the owner words (NOT confirmed).',
      proposed_dna_patch_json: JSON.stringify(opts.patch ?? { target_path: opts.targetPath || 'owner_notes', op: 'set', value: 'A candlelit, spirit-forward room.' }),
      proposal_rationale: opts.rationale ?? 'Drawn from the cited owner captures.',
      confidence_score: opts.confidenceScore ?? null,
      confidence_label: opts.confidenceLabel || 'low',
      confidence_factors_json: JSON.stringify(opts.factors ?? { band: opts.confidenceLabel || 'low', evidence_count: (opts.sourceCaptureIds || []).length, recency: 'recent', consistency: 'consistent', source_type: 'owner_response', contradictions: [], missing_fields: [] }),
      contradictions_json: JSON.stringify(opts.contradictions ?? []),
      missing_evidence_json: JSON.stringify(opts.missingEvidence ?? []),
      impact_note: opts.impactNote ?? 'Read by the owner identity specialists.',
      status: opts.status || 'needs_owner_review',
      status_reason: opts.statusReason ?? null,
      created_by_actor_type: opts.actorType || 'hestia_suggestion',
      created_by_user_id: opts.createdByUserId ?? null,
      created_at: opts.createdAt || '2026-06-27 00:00:00',
      updated_at: opts.updatedAt || opts.createdAt || '2026-06-27 00:00:00',
      idempotency_key: opts.idempotencyKey || randomUUID(),
      candidate_fingerprint: opts.fingerprint || randomUUID(),
      schema_version: OWNER_MEANING_PROMOTION_SCHEMA_VERSION,
    }
    db.prepare(`
      INSERT INTO owner_meaning_promotion_candidates
        (id, venue_id, source_capture_ids_json, source_capture_fingerprints_json,
         proposed_target_path, proposed_target_label, current_value_snapshot_json, proposed_value_json,
         proposed_meaning_summary, proposed_dna_patch_json, proposal_rationale, confidence_score,
         confidence_label, confidence_factors_json, contradictions_json, missing_evidence_json,
         impact_note, status, status_reason, created_by_actor_type, created_by_user_id,
         created_at, updated_at, idempotency_key, candidate_fingerprint, schema_version)
      VALUES (@id,@venue_id,@source_capture_ids_json,@source_capture_fingerprints_json,
         @proposed_target_path,@proposed_target_label,@current_value_snapshot_json,@proposed_value_json,
         @proposed_meaning_summary,@proposed_dna_patch_json,@proposal_rationale,@confidence_score,
         @confidence_label,@confidence_factors_json,@contradictions_json,@missing_evidence_json,
         @impact_note,@status,@status_reason,@created_by_actor_type,@created_by_user_id,
         @created_at,@updated_at,@idempotency_key,@candidate_fingerprint,@schema_version)
    `).run(row)
    return row
  }

  // Seed a real source capture via the REAL capture writer.
  function seedCapture(venueId, response) {
    const concept = randomUUID()
    const cand = {
      candidate_id: randomUUID(), venue_id: venueId, source_record_space: 'concept_draft',
      concept_ref: concept, destination_hint: null,
      created_from_summary_version: 'derived-live@2026-06-27T00:00:00.000Z',
      candidate_type: 'missing_data_signal', status: 'insufficient_evidence',
      interpretation_title: 'Possible signal', interpretation_summary: 'Saved meaning kept.',
      supporting_evidence_refs: [{ review_id: randomUUID(), concept_ref: concept, review_action: 'captured', confidence_band: null }],
      conflicting_evidence_refs: [], missing_evidence: ['No corroboration yet.'], uncertainty_notes: ['Suspicion only.'],
      confidence_band: null, suggested_owner_question: 'Does this belong to the venue identity?',
    }
    return createOwnerMeaningCapture(db, { venueId, conceptRef: concept, ownerResponseRaw: response, candidate: cand, createdBy: 'Tal Millo' })
  }

  // ── Tables + constants + idempotency ────────────────────────────────────────
  section('Tables + constants + idempotency')
  assert('owner_meaning_promotion_candidates table exists',
    !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='owner_meaning_promotion_candidates'").get())
  assert('owner_meaning_promotion_events table exists',
    !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='owner_meaning_promotion_events'").get())
  assert('idempotent re-exec is safe (no throw)',
    (() => { try { db.exec(OWNER_MEANING_PROMOTION_CANDIDATES_DDL); db.exec(OWNER_MEANING_PROMOTION_EVENTS_DDL); return true } catch { return false } })())
  const idxNames = db.prepare("SELECT name FROM sqlite_master WHERE type='index'").all().map(r => r.name)
  assert('candidate venue_id index exists', idxNames.includes('idx_owner_meaning_promotion_candidates_venue_id'))
  assert('candidate venue_status index exists', idxNames.includes('idx_owner_meaning_promotion_candidates_venue_status'))
  assert('events candidate_id index exists', idxNames.includes('idx_owner_meaning_promotion_events_candidate_id'))
  assert("record_space constant is 'concept_draft'", OWNER_MEANING_PROMOTION_RECORD_SPACE === 'concept_draft')
  assert("schema_version constant is 'owner_meaning_promotion_v1'", OWNER_MEANING_PROMOTION_SCHEMA_VERSION === 'owner_meaning_promotion_v1')
  assert('8 active statuses, reserved excluded',
    OWNER_MEANING_PROMOTION_STATUSES.length === 8 && !OWNER_MEANING_PROMOTION_STATUSES.includes(OWNER_MEANING_PROMOTION_RESERVED_STATUS))
  assert("reserved status is 'applied_to_dna_future'", OWNER_MEANING_PROMOTION_RESERVED_STATUS === 'applied_to_dna_future')
  assert('confidence labels = low | medium (never high)',
    OWNER_MEANING_PROMOTION_CONFIDENCE_LABELS.length === 2 && !OWNER_MEANING_PROMOTION_CONFIDENCE_LABELS.includes('high'))
  assert('event vocabulary has no confirmed/promoted/auto_applied event',
    !OWNER_MEANING_PROMOTION_EVENT_TYPES.some(e => /confirm|promoted_by|auto_applied/i.test(e)))

  // ── CHECK constraints (storage-layer wall) ──────────────────────────────────
  section('CHECK constraints reject forbidden values')
  assert('valid candidate insert succeeds', !!seedPromotionCandidateForTest({ id: randomUUID(), createdAt: '2026-06-27 00:00:00' }))
  assert('invalid status rejected by CHECK', throws(() => seedPromotionCandidateForTest({ status: 'confirmed' })))
  assert('invalid record_space rejected by CHECK', throws(() => db.prepare(
    `INSERT INTO owner_meaning_promotion_candidates
       (id, venue_id, record_space, source_capture_ids_json, source_capture_fingerprints_json,
        proposed_target_path, proposed_target_label, current_value_snapshot_json, proposed_value_json,
        proposed_dna_patch_json, confidence_factors_json, created_by_actor_type, idempotency_key, candidate_fingerprint)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(randomUUID(), VENUE_A, 'live_venue', '[]', '[]', 'owner_notes', 'Owner notes', 'null', '"x"', '{}', '{}', 'system', randomUUID(), randomUUID())))
  assert('invalid confidence_label rejected by CHECK', throws(() => seedPromotionCandidateForTest({ confidenceLabel: 'high' })))
  assert('out-of-range confidence_score rejected by CHECK', throws(() => seedPromotionCandidateForTest({ confidenceScore: 2.0 })))
  assert('in-range confidence_score accepted', !!seedPromotionCandidateForTest({ id: randomUUID(), confidenceScore: 0.4, createdAt: '2026-06-27 00:00:01' }))
  assert('invalid created_by_actor_type rejected by CHECK', throws(() => seedPromotionCandidateForTest({ actorType: 'owner' })))
  assert('invalid event_type rejected by CHECK', throws(() => db.prepare(
    `INSERT INTO owner_meaning_promotion_events (id, venue_id, candidate_id, event_type, actor_type, event_payload_json)
     VALUES (?,?,?,?,?,?)`
  ).run(randomUUID(), VENUE_A, randomUUID(), 'auto_applied', 'system', '{}')))

  // Clean slate for the read tests (drop the CHECK-test rows).
  db.exec('DELETE FROM owner_meaning_promotion_candidates')

  // ── Seed for read tests ─────────────────────────────────────────────────────
  section('Seed read fixtures')
  const capA1 = seedCapture(VENUE_A, '   We host guests, not customers. 日本語   ')
  const capA2 = seedCapture(VENUE_A, 'The room is candlelit on purpose.')
  const longText = 'L'.repeat(400) // > EXCERPT_MAX to prove list truncation
  const capLong = seedCapture(VENUE_A, longText)
  const capB1 = seedCapture(VENUE_B, 'Venue B private capture — must never leak to A.')

  const candA1 = seedPromotionCandidateForTest({
    id: randomUUID(), venueId: VENUE_A, status: 'needs_owner_review', targetPath: 'owner_notes',
    confidenceLabel: 'low', sourceCaptureIds: [capA1.id], sourceCaptureFingerprints: [capA1.candidate_fingerprint],
    createdAt: '2026-06-27 10:00:00',
  })
  const candA2 = seedPromotionCandidateForTest({
    id: randomUUID(), venueId: VENUE_A, status: 'owner_approved', targetPath: 'service_style',
    confidenceLabel: 'medium', sourceCaptureIds: [capA2.id, capLong.id],
    sourceCaptureFingerprints: [capA2.candidate_fingerprint, capLong.candidate_fingerprint],
    createdAt: '2026-06-27 11:00:00',
  })
  const candA3 = seedPromotionCandidateForTest({
    id: randomUUID(), venueId: VENUE_A, status: 'needs_owner_review', targetPath: 'owner_notes',
    confidenceLabel: 'low', sourceCaptureIds: [capLong.id], sourceCaptureFingerprints: [capLong.candidate_fingerprint],
    createdAt: '2026-06-27 12:00:00',
  })
  const candB1 = seedPromotionCandidateForTest({
    id: randomUUID(), venueId: VENUE_B, status: 'needs_owner_review', targetPath: 'owner_notes',
    sourceCaptureIds: [capB1.id], sourceCaptureFingerprints: [capB1.candidate_fingerprint],
    createdAt: '2026-06-27 13:00:00',
  })
  // Seed one audit event for candA1 directly (a future writer would do this; here it is a fixture).
  db.prepare(`INSERT INTO owner_meaning_promotion_events
    (id, venue_id, candidate_id, event_type, actor_type, event_payload_json, previous_status, next_status, target_path)
    VALUES (?,?,?,?,?,?,?,?,?)`).run(
    randomUUID(), VENUE_A, candA1.id, 'candidate_created', 'system', JSON.stringify({ to_status: 'draft_suggestion' }), null, 'draft_suggestion', 'owner_notes')
  assert('seeded 3 venue_A + 1 venue_B candidates', candCount() === 4)

  const candBaseline = candCount(), evtBaseline = evtCount()

  // ── list — newest first, venue-scoped ───────────────────────────────────────
  section('list — newest first + venue scope')
  const listA = listOwnerMeaningPromotionCandidates(db, VENUE_A, {})
  assert('returns object with candidates[] + pagination (not bare array)',
    listA && Array.isArray(listA.candidates) && !!listA.pagination)
  assert('venue_A list has exactly 3 candidates', listA.candidates.length === 3, `got ${listA.candidates.length}`)
  assert('newest first (candA3, candA2, candA1)',
    listA.candidates[0].id === candA3.id && listA.candidates[1].id === candA2.id && listA.candidates[2].id === candA1.id,
    listA.candidates.map(c => c.id).join(','))
  assert('venue_A list does NOT leak venue_B candidate', !listA.candidates.some(c => c.id === candB1.id))
  assert('list row omits venue_id', listA.candidates.every(c => !('venue_id' in c)))
  assert('default limit reflected', listA.pagination.limit === OWNER_MEANING_PROMOTION_LIST_DEFAULT_LIMIT)
  assert('counts present + medium tallied', listA.counts && listA.counts.needs_owner_review === 2 && listA.counts.owner_approved === 1)
  assert('counts omit reserved status', !('applied_to_dna_future' in listA.counts))

  // ── list — excerpts only; application/confidence shape ──────────────────────
  section('list — excerpts only + shape')
  const longRow = listA.candidates.find(c => c.id === candA3.id)
  assert('list source_preview uses an EXCERPT (truncated to max)',
    longRow.evidence.source_preview[0] && [...longRow.evidence.source_preview[0].owner_response_excerpt].length === OWNER_MEANING_PROMOTION_EXCERPT_MAX)
  assert('list excerpt marked is_excerpt:true', longRow.evidence.source_preview[0].is_excerpt === true)
  assert('list does NOT carry full owner_response_raw',
    !JSON.stringify(listA.candidates).includes(longText))
  assert('list confidence.score is null', listA.candidates.every(c => c.confidence.score === null))
  assert('list application.blocked true', listA.candidates.every(c => c.application.blocked === true))
  assert('source_capture_count honest for multi-evidence candidate',
    listA.candidates.find(c => c.id === candA2.id).evidence.source_capture_count === 2)

  // ── list — pagination ────────────────────────────────────────────────────────
  section('list — pagination')
  const page1 = listOwnerMeaningPromotionCandidates(db, VENUE_A, { limit: 2, offset: 0 })
  assert('limit=2 returns 2 newest', page1.candidates.length === 2 && page1.candidates[0].id === candA3.id)
  assert('limit=2 has_more true', page1.pagination.has_more === true)
  const page2 = listOwnerMeaningPromotionCandidates(db, VENUE_A, { limit: 2, offset: 2 })
  assert('offset=2 returns remaining 1', page2.candidates.length === 1 && page2.candidates[0].id === candA1.id)
  assert('offset=2 has_more false', page2.pagination.has_more === false)
  assert('limit=9999 clamped to max', listOwnerMeaningPromotionCandidates(db, VENUE_A, { limit: 9999 }).pagination.limit === OWNER_MEANING_PROMOTION_LIST_MAX_LIMIT)
  assert('limit="abc" → default', listOwnerMeaningPromotionCandidates(db, VENUE_A, { limit: 'abc' }).pagination.limit === OWNER_MEANING_PROMOTION_LIST_DEFAULT_LIMIT)
  assert('offset=-5 → 0', listOwnerMeaningPromotionCandidates(db, VENUE_A, { offset: -5 }).pagination.offset === 0)

  // ── list — filters ───────────────────────────────────────────────────────────
  section('list — filters')
  assert('status filter (owner_approved) returns 1',
    listOwnerMeaningPromotionCandidates(db, VENUE_A, { status: 'owner_approved' }).candidates.length === 1)
  assert('target_path filter (service_style) returns 1',
    listOwnerMeaningPromotionCandidates(db, VENUE_A, { targetPath: 'service_style' }).candidates.length === 1)
  assert('confidence_label filter (medium) returns 1',
    listOwnerMeaningPromotionCandidates(db, VENUE_A, { confidenceLabel: 'medium' }).candidates.length === 1)
  assert('invalid status filter throws BAD_REQUEST',
    throws(() => listOwnerMeaningPromotionCandidates(db, VENUE_A, { status: 'nope' })))
  assert('reserved status filter throws BAD_REQUEST',
    throws(() => listOwnerMeaningPromotionCandidates(db, VENUE_A, { status: OWNER_MEANING_PROMOTION_RESERVED_STATUS })))
  assert('invalid confidence_label filter throws', throws(() => listOwnerMeaningPromotionCandidates(db, VENUE_A, { confidenceLabel: 'high' })))
  assert('invalid target_path filter throws', throws(() => listOwnerMeaningPromotionCandidates(db, VENUE_A, { targetPath: 'venue_dna_json' })))
  assert('includeSourcePreview:false yields empty preview',
    listOwnerMeaningPromotionCandidates(db, VENUE_A, { includeSourcePreview: false }).candidates.every(c => c.evidence.source_preview.length === 0))

  // ── detail ────────────────────────────────────────────────────────────────────
  section('detail + source captures + events')
  const detail = getOwnerMeaningPromotionCandidateById(db, VENUE_A, candA1.id)
  assert('detail returns the candidate', detail && detail.id === candA1.id)
  assert('detail omits venue_id', !('venue_id' in detail))
  assert('detail confidence.score null', detail.confidence.score === null)
  assert('detail application.blocked true', detail.application.blocked === true)
  assert('detail current/proposed/patch parsed', 'current_value_snapshot_json' in detail && 'proposed_value_json' in detail && 'proposed_dna_patch_json' in detail)
  assert('detail schema_version is the string value', detail.schema_version === 'owner_meaning_promotion_v1')
  const srcCaps = resolveSourceCapturesForPromotionCandidate(db, VENUE_A, detail)
  assert('source captures resolved (1)', srcCaps.length === 1 && srcCaps[0].id === capA1.id)
  assert('detail PRESERVES source owner_response_raw byte-for-byte',
    srcCaps[0].owner_response_raw === '   We host guests, not customers. 日本語   ')
  const events = listOwnerMeaningPromotionEvents(db, VENUE_A, candA1.id)
  assert('events trail present (1 candidate_created)', events.length === 1 && events[0].event_type === 'candidate_created')
  assert('cross-venue detail → null', getOwnerMeaningPromotionCandidateById(db, VENUE_B, candA1.id) === null)
  assert('unknown detail → null', getOwnerMeaningPromotionCandidateById(db, VENUE_A, randomUUID()) === null)

  // Cross-venue source capture reference resolves as { missing:true } (never foreign data).
  const candCross = seedPromotionCandidateForTest({
    id: randomUUID(), venueId: VENUE_A, sourceCaptureIds: [capB1.id], sourceCaptureFingerprints: [capB1.candidate_fingerprint],
    createdAt: '2026-06-27 09:00:00',
  })
  const crossResolved = resolveSourceCapturesForPromotionCandidate(db, VENUE_A, getOwnerMeaningPromotionCandidateById(db, VENUE_A, candCross.id))
  assert('cross-venue source capture ref → { missing:true } (no foreign leak)',
    crossResolved.length === 1 && crossResolved[0].missing === true && !crossResolved[0].owner_response_raw)

  // ── read-only ─────────────────────────────────────────────────────────────────
  section('read methods do not mutate')
  // (candCross added one row above; re-baseline, then prove reads change nothing.)
  const candNow = candCount(), evtNow = evtCount()
  listOwnerMeaningPromotionCandidates(db, VENUE_A, {})
  getOwnerMeaningPromotionCandidateById(db, VENUE_A, candA1.id)
  listOwnerMeaningPromotionEvents(db, VENUE_A, candA1.id)
  resolveSourceCapturesForPromotionCandidate(db, VENUE_A, detail)
  assert('candidate row count unchanged by reads', candCount() === candNow)
  assert('event row count unchanged by reads', evtCount() === evtNow)
  assert('(sanity) seeds were the only writes since baseline', candNow >= candBaseline && evtNow === evtBaseline)

  // ── capture POST cannot create a promotion candidate ─────────────────────────
  section('capture writer cannot create a promotion candidate')
  const beforeCap = candCount()
  seedCapture(VENUE_A, 'A brand-new owner answer — must NOT create a promotion candidate.')
  assert('createOwnerMeaningCapture wrote NO promotion candidate', candCount() === beforeCap)

  console.log('\n──────────────────────────────────────────')
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) { console.log('\x1b[31m[FAIL]\x1b[0m'); process.exit(1) }
  console.log('\x1b[32m[PASS] All tests passed.\x1b[0m')
  try { db.close() } catch { /* in-memory */ }
  process.exit(0)
}
