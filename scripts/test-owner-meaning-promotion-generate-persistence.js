#!/usr/bin/env node
/**
 * Deterministic service/persistence tests for the Owner Meaning Promotion CANDIDATE GENERATION
 * runtime writer (Slice 4J): generateOwnerMeaningPromotionCandidate.
 *
 * In-memory node:sqlite DatabaseSync(':memory:') + the exported DDL constants — no real DB, no
 * server boot, no network, no AI. Source captures are seeded through the REAL capture writer
 * (createOwnerMeaningCapture) so generation runs against real, byte-for-byte owner_response_raw.
 * Exits 0 on pass, 1 on failure.
 *
 * Covers (per OWNER_MEANING_PROMOTION_CANDIDATE_GENERATION_CONTRACT.md §14 + DDL §12):
 *   • a capture → candidate row inserted into owner_meaning_promotion_candidates, referencing the capture;
 *   • proposed_value derived ONLY from owner_response_raw; current_value null; contradictions empty;
 *     missing_evidence recorded; confidence 'low'; confidence_score null; application blocked;
 *     allowed_actions/apply unreachable; status non-applied draft;
 *   • candidate_created (generation) event appended, append-only, audit-first, with venue/actor/capture;
 *   • idempotency: re-generating from the same capture returns the existing candidate (skipped), no dup;
 *   • too-weak answer is skipped (no candidate, no event);
 *   • missing/blank capture_id throws BAD_REQUEST; cross-venue / unknown capture throws NOT_FOUND;
 *   • client cannot widen venue scope (a capture is only reachable in its own venue);
 *   • Venue DNA is never touched (no such table is written; the writer imports nothing DNA-related).
 *
 * Run: node scripts/test-owner-meaning-promotion-generate-persistence.js
 */

import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'

Promise.all([
  import('../src/services/venueIntelligence/ownerMeaningPromotionGenerationService.js'),
  import('../src/services/venueIntelligence/ownerMeaningPromotionService.js'),
  import('../src/services/venueIntelligence/ownerMeaningCaptureService.js'),
])
  .then(([gen, promo, capture]) => runTests(gen, promo, capture))
  .catch(err => { console.error('\n[FAIL] Could not import services:', err.message); process.exit(1) })

function runTests(gen, promo, capture) {
  const {
    generateOwnerMeaningPromotionCandidate,
    OWNER_MEANING_PROMOTION_GENERATION_TARGET_PATH,
    OWNER_MEANING_PROMOTION_GENERATION_MIN_WORDS,
    deriveOwnerMeaningPromotionCandidateFingerprint,
  } = gen
  const {
    OWNER_MEANING_PROMOTION_CANDIDATES_DDL, OWNER_MEANING_PROMOTION_EVENTS_DDL,
    getOwnerMeaningPromotionCandidateById, listOwnerMeaningPromotionEvents,
    resolveSourceCapturesForPromotionCandidate,
  } = promo
  const { OWNER_MEANING_CAPTURES_DDL, OWNER_MEANING_CAPTURE_EVENTS_DDL, createOwnerMeaningCapture } = capture

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }
  function throwsCode(fn, code) { try { fn(); return false } catch (e) { return e && e.code === code } }

  console.log('\n\x1b[1mHESTIA Owner Meaning Promotion — Candidate Generation Persistence Tests\x1b[0m\n')

  const VENUE_A = 'venue_A', VENUE_B = 'venue_B'

  const db = new DatabaseSync(':memory:')
  db.exec(OWNER_MEANING_PROMOTION_CANDIDATES_DDL)
  db.exec(OWNER_MEANING_PROMOTION_EVENTS_DDL)
  db.exec(OWNER_MEANING_CAPTURES_DDL)
  db.exec(OWNER_MEANING_CAPTURE_EVENTS_DDL)

  const candCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_promotion_candidates').get().n
  const evtCount = () => db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_promotion_events').get().n

  // Seed a real source capture via the REAL capture writer.
  function seedCapture(venueId, response) {
    const concept = randomUUID()
    const cand = {
      candidate_id: randomUUID(), venue_id: venueId, source_record_space: 'concept_draft',
      concept_ref: concept, destination_hint: null,
      created_from_summary_version: 'derived-live@2026-06-28T00:00:00.000Z',
      candidate_type: 'missing_data_signal', status: 'insufficient_evidence',
      interpretation_title: 'Possible signal', interpretation_summary: 'Saved meaning kept.',
      supporting_evidence_refs: [{ review_id: randomUUID(), concept_ref: concept, review_action: 'captured', confidence_band: null }],
      conflicting_evidence_refs: [], missing_evidence: ['No corroboration yet.'], uncertainty_notes: ['Suspicion only.'],
      confidence_band: null, suggested_owner_question: 'Does this belong to the venue identity?',
    }
    return createOwnerMeaningCapture(db, { venueId, conceptRef: concept, ownerResponseRaw: response, candidate: cand, createdBy: 'Tal Millo' })
  }

  // ── happy path: capture → candidate ─────────────────────────────────────────
  section('capture → candidate (happy path)')
  const STRONG = '   We host guests, not customers — a candlelit, spirit-forward room. 日本語   '
  const capA1 = seedCapture(VENUE_A, STRONG)
  const before = { c: candCount(), e: evtCount() }
  const r1 = generateOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A, captureId: capA1.id })
  assert('generation reports created:true', r1.created === true && r1.skipped !== true)
  assert('one candidate row inserted', candCount() === before.c + 1)
  assert('one event row appended', evtCount() === before.e + 1)
  assert('returned candidate present', r1.candidate && typeof r1.candidate.id === 'string')

  const cand = r1.candidate
  assert('candidate references the source capture',
    (() => { const caps = resolveSourceCapturesForPromotionCandidate(db, VENUE_A, cand); return caps.length === 1 && caps[0].id === capA1.id })())
  assert('proposed_target_path is the narrow allow-listed owner_notes',
    cand.proposed_target_path === OWNER_MEANING_PROMOTION_GENERATION_TARGET_PATH && cand.proposed_target_path === 'owner_notes')
  assert('proposed_value derived from owner_response_raw (trimmed)',
    cand.proposed_value_json === STRONG.trim())
  assert('proposed value is NOT the raw (verbatim evidence stays in the capture)',
    cand.proposed_value_json !== STRONG)
  assert('proposed_dna_patch states NOT applied',
    cand.proposed_dna_patch_json && cand.proposed_dna_patch_json.applied === false && cand.proposed_dna_patch_json.application_status === 'not_applied')
  assert('current_value snapshot is null/unknown (no DNA read)', cand.current_value_snapshot_json === null)
  assert('confidence band is low (single capture, never medium/high)', cand.confidence.label === 'low')
  assert('confidence.score stays null', cand.confidence.score === null)
  assert('missing_evidence recorded', Array.isArray(cand.confidence.missing_evidence) && cand.confidence.missing_evidence.length >= 1)
  assert('contradictions empty/unknown', Array.isArray(cand.confidence.contradictions) && cand.confidence.contradictions.length === 0)
  assert('status is a safe non-applied draft', cand.status === 'draft_suggestion')
  assert('application.blocked true', cand.application.blocked === true)
  assert('reserved applied_* fields null', cand.application.applied_at === null && cand.application.dna_application_ref === null)
  assert('proposed_meaning_summary labelled (NOT confirmed)', /not confirmed/i.test(cand.proposed_meaning_summary || ''))

  // ── event audit ─────────────────────────────────────────────────────────────
  section('generation event (audit-first, append-only)')
  const events = listOwnerMeaningPromotionEvents(db, VENUE_A, cand.id)
  assert('candidate_created event appended', events.length === 1 && events[0].event_type === 'candidate_created')
  assert('event payload carries candidate_generated reason + capture ref',
    events[0].event_payload_json && events[0].event_payload_json.reason === 'candidate_generated' && events[0].event_payload_json.generated_from_capture_id === capA1.id)
  assert('event actor is hestia_suggestion (AI draft, distinguishable from owner action)',
    events[0].actor_type === 'hestia_suggestion')
  assert('event records target_path', events[0].target_path === 'owner_notes')
  // append-only: the raw event row carries venue scope + null user id.
  const rawEvt = db.prepare('SELECT * FROM owner_meaning_promotion_events WHERE candidate_id = ?').get(cand.id)
  assert('event is venue-scoped', rawEvt.venue_id === VENUE_A)
  assert('event actor_user_id is null (system/AI draft)', rawEvt.actor_user_id === null)

  // ── idempotency ──────────────────────────────────────────────────────────────
  section('idempotency / dedupe')
  const dupBefore = { c: candCount(), e: evtCount() }
  const r2 = generateOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A, captureId: capA1.id })
  assert('repeat generation reports skipped:true (duplicate)', r2.skipped === true && r2.reason === 'duplicate' && r2.created === false)
  assert('repeat generation returns the EXISTING candidate', r2.candidate && r2.candidate.id === cand.id)
  assert('no duplicate candidate row created', candCount() === dupBefore.c)
  assert('no extra event row created on dedupe', evtCount() === dupBefore.e)
  assert('deterministic fingerprint is stable for identical inputs',
    deriveOwnerMeaningPromotionCandidateFingerprint({ venueId: VENUE_A, targetPath: 'owner_notes', sourceCaptureFingerprints: ['x'], patch: { target_path: 'owner_notes', op: 'add', value: 'a  b' } }) ===
    deriveOwnerMeaningPromotionCandidateFingerprint({ venueId: VENUE_A, targetPath: 'owner_notes', sourceCaptureFingerprints: ['x'], patch: { target_path: 'owner_notes', op: 'add', value: 'a b' } }))

  // A genuinely different capture (different evidence) → a new, distinct candidate.
  const capA2 = seedCapture(VENUE_A, 'The bar should lead the menu identity, full stop.')
  const r3 = generateOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A, captureId: capA2.id })
  assert('different evidence → a NEW candidate', r3.created === true && r3.candidate.id !== cand.id)
  assert('candidate count grew by exactly one', candCount() === dupBefore.c + 1)

  // ── weak evidence is skipped ──────────────────────────────────────────────────
  section('too-weak evidence is skipped (not promoted as strong truth)')
  const capWeak = seedCapture(VENUE_A, 'no.') // 1 word, below MIN_WORDS
  const weakBefore = { c: candCount(), e: evtCount() }
  const rWeak = generateOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A, captureId: capWeak.id })
  assert(`thin answer (< ${OWNER_MEANING_PROMOTION_GENERATION_MIN_WORDS} words) is skipped`, rWeak.skipped === true && rWeak.reason === 'too_weak')
  assert('skipped weak generation returns no candidate', rWeak.candidate === null)
  assert('skipped weak generation writes NO candidate row', candCount() === weakBefore.c)
  assert('skipped weak generation writes NO event row', evtCount() === weakBefore.e)

  // ── input validation + venue scope ────────────────────────────────────────────
  section('input validation + venue scope')
  assert('missing capture_id → BAD_REQUEST', throwsCode(() => generateOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A }), 'BAD_REQUEST'))
  assert('blank capture_id → BAD_REQUEST', throwsCode(() => generateOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A, captureId: '   ' }), 'BAD_REQUEST'))
  assert('unknown capture_id → NOT_FOUND', throwsCode(() => generateOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A, captureId: randomUUID() }), 'NOT_FOUND'))

  const capB1 = seedCapture(VENUE_B, 'Venue B private capture — must never be promotable from A.')
  const crossBefore = { c: candCount(), e: evtCount() }
  assert('cross-venue capture cannot be used (A cannot generate from B) → NOT_FOUND',
    throwsCode(() => generateOwnerMeaningPromotionCandidate(db, { venueId: VENUE_A, captureId: capB1.id }), 'NOT_FOUND'))
  assert('cross-venue attempt wrote nothing', candCount() === crossBefore.c && evtCount() === crossBefore.e)
  // But venue_B itself can generate from its own capture.
  assert('venue_B can generate from its OWN capture', generateOwnerMeaningPromotionCandidate(db, { venueId: VENUE_B, captureId: capB1.id }).created === true)
  assert('venue_A list never gains the venue_B candidate',
    getOwnerMeaningPromotionCandidateById(db, VENUE_A, generateOwnerMeaningPromotionCandidate(db, { venueId: VENUE_B, captureId: capB1.id }).candidate.id) === null)

  // ── no Venue DNA mutation ──────────────────────────────────────────────────────
  section('no Venue DNA mutation')
  // The generation service imports nothing DNA-related; only the two promotion tables ever change.
  // Prove the only tables that exist after generation are the promotion + capture tables we created
  // (no venue_dna_json / venue_intelligence table was created or written by this writer).
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name)
  assert('no venue DNA table created by the generation writer',
    !tables.some(n => /venue_dna|venue_intelligence|venue_briefs|venue_dna_enrichment/.test(n)))

  console.log('\n──────────────────────────────────────────')
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) { console.log('\x1b[31m[FAIL]\x1b[0m'); process.exit(1) }
  console.log('\x1b[32m[PASS] All tests passed.\x1b[0m')
  try { db.close() } catch { /* in-memory */ }
  process.exit(0)
}
