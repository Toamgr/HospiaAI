#!/usr/bin/env node
/**
 * Deterministic tests for Owner Meaning Capture — Raw Owner Answer Persistence (Slice 4D).
 *
 * In-memory node:sqlite DatabaseSync(':memory:') + the exported DDL constants — no real DB,
 * no server boot, no network, no AI. Exits 0 on pass, 1 on failure.
 *
 * Covers (per OWNER_MEANING_CAPTURE_DDL_CONTRACT.md §12 + the 4D prompt):
 *   • owner_response_raw round-trips BYTE-FOR-BYTE (incl. leading/trailing whitespace, unicode);
 *   • validation trims only to DECIDE acceptance — it never mutates the stored value;
 *   • blank/whitespace rejected; > 8000 chars rejected (never truncated); exactly 8000 accepted;
 *   • candidate_snapshot mandatory; stored immutably; never contains the owner answer or any
 *     routing earmark / ephemeral candidate id / forbidden field;
 *   • deterministic fingerprint (same inputs ⇒ same hash; id array order irrelevant; different
 *     supporting ids ⇒ different hash); fingerprint_version stored;
 *   • status='owner_answer_captured', provenance='owner_response', record_space='concept_draft';
 *   • confidence_band left null (never numeric); CHECK constraints reject forbidden values;
 *   • audit event created (audit-first: an orphan audit survives a capture-write failure);
 *   • append-only (a second answer is a new row; the first remains byte-for-byte);
 *   • required-input rejections (missing question_text / question_reason / concept_ref / refs);
 *   • venue scoping (cross-venue read → null).
 *
 * Run: node scripts/test-owner-meaning-capture-persistence.js
 */

import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'

import('../src/services/venueIntelligence/ownerMeaningCaptureService.js')
  .then(runTests)
  .catch(err => { console.error('\n[FAIL] Could not import ownerMeaningCaptureService.js:', err.message); process.exit(1) })

function runTests(svc) {
  const {
    OWNER_MEANING_CAPTURES_DDL, OWNER_MEANING_CAPTURE_EVENTS_DDL,
    OWNER_MEANING_FINGERPRINT_VERSION, OWNER_MEANING_STATUSES, OWNER_MEANING_PROVENANCE,
    OWNER_MEANING_RECORD_SPACE, OWNER_MEANING_EVENT_TYPES, OWNER_MEANING_CONFIDENCE_BANDS,
    OWNER_RESPONSE_RAW_MAX,
    deriveOwnerMeaningCandidateFingerprint, createOwnerMeaningCapture,
    getOwnerMeaningCaptureById, listOwnerMeaningCaptureEvents,
  } = svc

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }
  function throws(fn) { try { fn(); return false } catch { return true } }

  console.log('\n\x1b[1mHESTIA Owner Meaning Capture Persistence — Deterministic Tests\x1b[0m\n')

  const VENUE_A = 'venue_A', VENUE_B = 'venue_B'
  const CONCEPT = randomUUID()
  const REVIEW_1 = randomUUID(), REVIEW_2 = randomUUID()

  // A live re-derived candidate (the shape deriveInterpretedCandidatesForVenue returns). It
  // deliberately carries an EPHEMERAL candidate_id and a routing earmark so we can prove neither
  // leaks into the stored snapshot.
  function candidate(overrides = {}) {
    return {
      candidate_id: randomUUID(),     // EPHEMERAL — must never be load-bearing in the snapshot
      venue_id: VENUE_A,
      source_record_space: 'concept_draft',
      concept_ref: CONCEPT,
      destination_hint: null,         // routing earmark — must never leak into the snapshot
      created_from_summary_version: 'derived-live@2026-06-27T00:00:00.000Z',
      candidate_type: 'missing_data_signal',
      status: 'insufficient_evidence',
      interpretation_title: 'Possible signal — evidence not yet sufficient to interpret',
      interpretation_summary: 'This concept has saved meaning the owner kept.',
      supporting_evidence_refs: [
        { review_id: REVIEW_1, concept_ref: CONCEPT, review_action: 'captured', confidence_band: null },
        { review_id: REVIEW_2, concept_ref: CONCEPT, review_action: 'edited', confidence_band: null },
      ],
      conflicting_evidence_refs: [],
      missing_evidence: ['No second, independent concept corroborates this meaning yet.'],
      uncertainty_notes: ['Evidence-bound suspicion only — this is not a claim that the venue is anything.'],
      confidence_band: null,
      suggested_owner_question: "Does this concept's saved meaning belong to the venue's identity, or does it need more evidence?",
      ...overrides,
    }
  }

  // ── Tables + constants ──────────────────────────────────────────────────────
  section('Tables + constants')
  const db = new DatabaseSync(':memory:')
  db.exec(OWNER_MEANING_CAPTURES_DDL)
  db.exec(OWNER_MEANING_CAPTURE_EVENTS_DDL)
  assert('owner_meaning_captures table exists',
    !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='owner_meaning_captures'").get())
  assert('owner_meaning_capture_events table exists',
    !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='owner_meaning_capture_events'").get())
  assert('idempotent re-exec is safe',
    (() => { try { db.exec(OWNER_MEANING_CAPTURES_DDL); db.exec(OWNER_MEANING_CAPTURE_EVENTS_DDL); return true } catch { return false } })())
  assert('fingerprint_version is owner_meaning_candidate_fingerprint_v1',
    OWNER_MEANING_FINGERPRINT_VERSION === 'owner_meaning_candidate_fingerprint_v1')
  assert('statuses allow-list = captured/superseded/no-longer-present (exactly three)',
    OWNER_MEANING_STATUSES.length === 3 &&
    ['owner_answer_captured', 'superseded_by_later_answer', 'candidate_no_longer_present'].every(s => OWNER_MEANING_STATUSES.includes(s)))
  assert("NO confirmation/promotion status in the vocabulary",
    !['confirmed', 'approved', 'promoted', 'final', 'true', 'captured_as_owner_meaning', 'eligible_for_future_proposal'].some(s => OWNER_MEANING_STATUSES.includes(s)))
  assert('provenance allow-list = owner_response only',
    OWNER_MEANING_PROVENANCE.length === 1 && OWNER_MEANING_PROVENANCE[0] === 'owner_response')
  assert("record_space is 'concept_draft'", OWNER_MEANING_RECORD_SPACE === 'concept_draft')
  assert('event types allow-list (three) with no confirmation event',
    OWNER_MEANING_EVENT_TYPES.length === 3 && !OWNER_MEANING_EVENT_TYPES.some(e => /confirm|approv|promot/i.test(e)))
  assert('confidence_band allow-list = null | low (never numeric)',
    OWNER_MEANING_CONFIDENCE_BANDS.length === 2 && OWNER_MEANING_CONFIDENCE_BANDS.includes(null) && OWNER_MEANING_CONFIDENCE_BANDS.includes('low'))
  assert('owner_response_raw max is 8000', OWNER_RESPONSE_RAW_MAX === 8000)

  // ── Create + server-set fields ──────────────────────────────────────────────
  section('Create + server-set fields')
  const row = createOwnerMeaningCapture(db, {
    venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 'We are a candlelit, spirit-forward room.',
    candidate: candidate(), createdBy: 'Tal Millo',
  })
  assert('create returns a shaped row with a uuid id', !!row && /^[0-9a-f-]{36}$/i.test(row.id))
  assert('venue_id stored (access boundary)', row.venue_id === VENUE_A)
  assert('concept_ref stored', row.concept_ref === CONCEPT)
  assert("status server-set 'owner_answer_captured'", row.status === 'owner_answer_captured')
  assert("provenance server-set 'owner_response'", row.provenance === 'owner_response')
  assert("record_space server-hard-coded 'concept_draft'", row.record_space === 'concept_draft')
  assert('fingerprint_version stored', row.fingerprint_version === OWNER_MEANING_FINGERPRINT_VERSION)
  assert('candidate_fingerprint is a sha256 hex', /^[0-9a-f]{64}$/.test(row.candidate_fingerprint))
  assert('confidence_band left null in 4D', row.confidence_band === null)
  assert('created_by stored from server (req.user)', row.created_by === 'Tal Millo')
  assert('question_text captured verbatim', row.question_text === candidate().suggested_owner_question)
  assert('question_reason captured (non-empty basis)', typeof row.question_reason === 'string' && row.question_reason.length > 0)

  // ── owner_response_raw byte-for-byte ────────────────────────────────────────
  section('owner_response_raw byte-for-byte (never normalized)')
  const RAW = '   We host guests; we do NOT call them customers. \n  Crème de cassis. 日本語  '
  const rowRaw = createOwnerMeaningCapture(db, {
    venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: RAW, candidate: candidate(), createdBy: 'Tal Millo',
  })
  const readBack = getOwnerMeaningCaptureById(db, VENUE_A, rowRaw.id)
  assert('owner_response_raw round-trips EXACTLY (incl. surrounding whitespace/unicode/casing)',
    readBack.owner_response_raw === RAW, JSON.stringify(readBack.owner_response_raw))
  assert('stored value is NOT trimmed even though validation trimmed to accept',
    readBack.owner_response_raw.startsWith('   ') && readBack.owner_response_raw.endsWith('  '))

  // ── Validation (reject, never rewrite) ──────────────────────────────────────
  section('owner_response_raw validation (reject, never rewrite)')
  assert('blank answer rejected', throws(() => createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: '   \n\t  ', candidate: candidate() })))
  assert('empty-string answer rejected', throws(() => createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: '', candidate: candidate() })))
  assert('non-string answer rejected', throws(() => createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 42, candidate: candidate() })))
  const at8000 = 'x'.repeat(8000)
  const over = 'x'.repeat(8001)
  const rowMax = createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: at8000, candidate: candidate() })
  assert('exactly 8000 chars accepted and stored untruncated', rowMax.owner_response_raw.length === 8000)
  assert('> 8000 chars rejected', throws(() => createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: over, candidate: candidate() })))
  assert('no row was written for the over-limit attempt (never truncated)',
    db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_captures WHERE length(owner_response_raw) > 8000').get().n === 0)

  // ── Snapshot mandatory + immutable + clean ──────────────────────────────────
  section('Snapshot mandatory, server-authored, clean')
  assert('missing candidate (snapshot) rejected', throws(() => createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 'x', candidate: null })))
  const snap = readBack.candidate_snapshot
  assert('snapshot is well-formed JSON object', snap && typeof snap === 'object')
  for (const f of ['candidate_type', 'concept_ref', 'interpretation_title', 'interpretation_summary', 'suggested_owner_question', 'supporting_evidence_refs', 'conflicting_evidence_refs', 'missing_evidence', 'uncertainty_notes', 'confidence_band', 'candidate_fingerprint', 'fingerprint_version']) {
    assert(`snapshot carries field: ${f}`, f in snap)
  }
  assert('snapshot supporting refs preserve the real review ids',
    snap.supporting_evidence_refs.map(r => r.review_id).sort().join(',') === [REVIEW_1, REVIEW_2].sort().join(','))
  assert('snapshot does NOT contain the owner answer (kept separate in owner_response_raw)',
    !JSON.stringify(snap).includes('We host guests'))
  assert('snapshot does NOT carry a routing earmark (destination_hint excluded)',
    !('destination_hint' in snap))
  assert('snapshot does NOT carry the ephemeral candidate_id as a load-bearing field',
    !('candidate_id' in snap))
  assert('snapshot carries no forbidden promotion/meaning field',
    !['captured_owner_meaning', 'eligible_for_future_proposal', 'proposed_dna_change', 'dna_target'].some(k => JSON.stringify(snap).includes(k)))
  // A candidate that smuggles a numeric confidence → snapshot collapses it to null (never numeric).
  const rowNum = createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 'x', candidate: candidate({ confidence_band: 0.9 }) })
  assert('numeric candidate confidence is dropped to null in the snapshot',
    getOwnerMeaningCaptureById(db, VENUE_A, rowNum.id).candidate_snapshot.confidence_band === null)

  // ── Required candidate-derived inputs ───────────────────────────────────────
  section('Required candidate-derived inputs rejected when absent')
  assert('missing question_text (no suggested_owner_question) rejected',
    throws(() => createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 'x', candidate: candidate({ suggested_owner_question: '' }) })))
  assert('missing question_reason (no missing_evidence + no uncertainty_notes) rejected',
    throws(() => createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 'x', candidate: candidate({ missing_evidence: [], uncertainty_notes: [] }) })))
  assert('missing concept_ref rejected',
    throws(() => createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: null, ownerResponseRaw: 'x', candidate: candidate() })))
  assert('candidate concept_ref mismatch rejected',
    throws(() => createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 'x', candidate: candidate({ concept_ref: randomUUID() }) })))
  assert('no stable supporting refs rejected (cannot fingerprint)',
    throws(() => createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 'x', candidate: candidate({ supporting_evidence_refs: [], conflicting_evidence_refs: [] }) })))

  // ── Deterministic fingerprint ───────────────────────────────────────────────
  section('Deterministic fingerprint (server-computed)')
  const fpInput = { record_space: 'concept_draft', concept_ref: CONCEPT, candidate_type: 'missing_data_signal', supporting_review_ids: [REVIEW_1, REVIEW_2], fingerprint_version: OWNER_MEANING_FINGERPRINT_VERSION }
  const fp1 = deriveOwnerMeaningCandidateFingerprint(fpInput)
  const fp2 = deriveOwnerMeaningCandidateFingerprint({ ...fpInput, supporting_review_ids: [REVIEW_2, REVIEW_1] })
  assert('same inputs ⇒ same fingerprint', fp1 === fp2)
  assert('id array ORDER does not change the fingerprint', fp1 === fp2)
  const fpDiffIds = deriveOwnerMeaningCandidateFingerprint({ ...fpInput, supporting_review_ids: [REVIEW_1, randomUUID()] })
  assert('different supporting id set ⇒ different fingerprint', fpDiffIds !== fp1)
  const fpDiffType = deriveOwnerMeaningCandidateFingerprint({ ...fpInput, candidate_type: 'contradiction_signal' })
  assert('different candidate_type ⇒ different fingerprint', fpDiffType !== fp1)
  const fpDiffConcept = deriveOwnerMeaningCandidateFingerprint({ ...fpInput, concept_ref: randomUUID() })
  assert('different concept_ref ⇒ different fingerprint', fpDiffConcept !== fp1)
  assert('fingerprint requires candidate_type', throws(() => deriveOwnerMeaningCandidateFingerprint({ ...fpInput, candidate_type: '' })))
  assert('fingerprint requires concept_ref', throws(() => deriveOwnerMeaningCandidateFingerprint({ ...fpInput, concept_ref: '' })))
  assert('fingerprint requires at least one supporting id', throws(() => deriveOwnerMeaningCandidateFingerprint({ ...fpInput, supporting_review_ids: [] })))
  assert('two captures of the SAME candidate share the same stored fingerprint',
    row.candidate_fingerprint === rowRaw.candidate_fingerprint)

  // ── Audit-first ─────────────────────────────────────────────────────────────
  section('Audit-first ordering')
  const events = listOwnerMeaningCaptureEvents(db, VENUE_A, row.id)
  assert('one audit event written for the create', events.length === 1)
  assert("audit event_type is 'owner_answer_captured'", events[0].event_type === 'owner_answer_captured')
  assert('audit payload records to_status + fingerprint',
    events[0].event_payload && events[0].event_payload.to_status === 'owner_answer_captured' && !!events[0].event_payload.candidate_fingerprint)
  // Simulate a capture-write failure AFTER the audit insert lands → orphan audit, no capture row.
  const failingDb = {
    prepare(sql) {
      if (/INSERT\s+INTO\s+owner_meaning_captures\b/i.test(sql)) {
        return { run() { throw new Error('simulated capture-insert failure') } }
      }
      return db.prepare(sql)
    },
  }
  const auditBefore = db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_capture_events').get().n
  const capBefore = db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_captures').get().n
  assert('capture-write failure surfaces (throws)',
    throws(() => createOwnerMeaningCapture(failingDb, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 'x', candidate: candidate(), createdBy: 'Tal Millo' })))
  assert('orphan audit event WAS written (no un-audited state change)',
    db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_capture_events').get().n - auditBefore === 1)
  assert('NO capture row landed for the failed write',
    db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_captures').get().n - capBefore === 0)

  // ── Append-only ─────────────────────────────────────────────────────────────
  section('Append-only (a corrected answer is a NEW row)')
  const first = createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 'first answer', candidate: candidate() })
  const second = createOwnerMeaningCapture(db, { venueId: VENUE_A, conceptRef: CONCEPT, ownerResponseRaw: 'second, different answer', candidate: candidate() })
  assert('a second answer creates a NEW row (distinct id)', first.id !== second.id)
  assert('the first answer still exists byte-for-byte', getOwnerMeaningCaptureById(db, VENUE_A, first.id).owner_response_raw === 'first answer')

  // ── CHECK constraints (storage-layer wall) ──────────────────────────────────
  section('CHECK constraints reject forbidden values at the storage layer')
  function rawInsert(col, value) {
    // Attempt a direct INSERT with one server-controlled enum replaced by a forbidden value.
    const base = {
      id: randomUUID(), venue_id: VENUE_A, concept_ref: CONCEPT, candidate_fingerprint: 'fp',
      fingerprint_version: OWNER_MEANING_FINGERPRINT_VERSION, candidate_snapshot_json: '{}',
      snapshot_taken_at: '2026-06-27', question_text: 'q', question_reason: 'r',
      owner_response_raw: 'a', confidence_band: null, uncertainty_notes_json: null,
      provenance: 'owner_response', record_space: 'concept_draft', status: 'owner_answer_captured',
      superseded_by: null, supersedes: null, created_by: 'x', created_at: 'now', updated_at: 'now',
    }
    base[col] = value
    return throws(() => db.prepare(`
      INSERT INTO owner_meaning_captures
        (id, venue_id, concept_ref, candidate_fingerprint, fingerprint_version, candidate_snapshot_json,
         snapshot_taken_at, question_text, question_reason, owner_response_raw, confidence_band,
         uncertainty_notes_json, provenance, record_space, status, superseded_by, supersedes,
         created_by, created_at, updated_at)
      VALUES (@id,@venue_id,@concept_ref,@candidate_fingerprint,@fingerprint_version,@candidate_snapshot_json,
         @snapshot_taken_at,@question_text,@question_reason,@owner_response_raw,@confidence_band,
         @uncertainty_notes_json,@provenance,@record_space,@status,@superseded_by,@supersedes,
         @created_by,@created_at,@updated_at)
    `).run(base))
  }
  assert("CHECK rejects provenance other than 'owner_response'", rawInsert('provenance', 'admin'))
  assert("CHECK rejects record_space 'live_venue'", rawInsert('record_space', 'live_venue'))
  assert("CHECK rejects a forbidden status ('confirmed')", rawInsert('status', 'confirmed'))
  assert("CHECK rejects confidence_band 'high'", rawInsert('confidence_band', 'high'))
  assert('CHECK rejects a numeric confidence_band', rawInsert('confidence_band', '0.9'))

  // ── Venue scoping ────────────────────────────────────────────────────────────
  section('Venue scoping (access boundary only)')
  assert('cross-venue read by id → null', getOwnerMeaningCaptureById(db, VENUE_B, row.id) === null)
  assert('venue B sees none of venue A captures',
    db.prepare('SELECT COUNT(*) AS n FROM owner_meaning_captures WHERE venue_id = ?').get(VENUE_B).n === 0)

  // ── Results ──────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────')
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) { console.log(`\x1b[31m[FAIL] ${failed} test(s) failed — fix before committing.\x1b[0m\n`); process.exit(1) }
  console.log(`\x1b[32m[PASS] All tests passed.\x1b[0m\n`); process.exit(0)
}
