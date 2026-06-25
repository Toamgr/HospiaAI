#!/usr/bin/env node
/**
 * Deterministic tests for the Concept Drafts Workspace (Slice 2a) — derive-first, READ-ONLY.
 *
 * In-memory node:sqlite DatabaseSync(':memory:') + the exported DDL constants — no real DB,
 * no server boot, no network, no AI. Exits 0 on pass, 1 on failure.
 *
 * Covers:
 *   • listConceptDraftsForVenue groups by concept_ref and counts reviews;
 *   • filters by venue_id (cross-venue rows never appear);
 *   • filters record_space = 'concept_draft' (a manually-inserted 'live_venue' row is excluded);
 *   • labels are evidence-bound (derived from real counts), never a fabricated venue name;
 *   • subtitle comes from a real saved snapshot signal (or is null), never invented;
 *   • empty state returns [];
 *   • getConceptDraftDetail validates UUID (malformed → BAD_REQUEST), scopes by venue +
 *     record_space, returns null when absent, returns full snapshots when present;
 *   • the workspace functions are READ-ONLY — they write/mutate nothing (row counts unchanged);
 *   • the module imports nothing DNA-related and contains no confirm/promote vocabulary.
 *
 * Run: node scripts/test-concept-draft-workspace.js
 */

import { DatabaseSync } from 'node:sqlite'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const SERVICE_REL = 'src/services/venueIntelligence/discoveryCandidateReviewService.js'

import('../' + SERVICE_REL)
  .then(runTests)
  .catch(err => { console.error('\n[FAIL] Could not import discoveryCandidateReviewService.js:', err.message); process.exit(1) })

function runTests(svc) {
  const {
    DISCOVERY_CANDIDATE_REVIEWS_DDL, DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL,
    upsertDiscoveryReview, listConceptDraftsForVenue, getConceptDraftDetail,
  } = svc

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }

  const db = new DatabaseSync(':memory:')
  db.exec(DISCOVERY_CANDIDATE_REVIEWS_DDL)
  db.exec(DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL)

  const VENUE_A = 'venue_A'
  const VENUE_B = 'venue_B'
  const conceptA1 = randomUUID()
  const conceptA2 = randomUUID()
  const conceptB1 = randomUUID()

  const snap = (signal, dest = 'Venue Memory', band = 'low') => ({
    signal, evidence: 'because the owner said so', confidence_band: band,
    dna_status_label: 'candidate only', suggested_destination: dest,
  })

  // Seed venue A, concept 1: three reviews (captured, held, rejected).
  upsertDiscoveryReview(db, VENUE_A, conceptA1, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('focus on elegance'), conversation_ref: '0:0' })
  upsertDiscoveryReview(db, VENUE_A, conceptA1, { id: randomUUID(), review_action: 'held', candidate_snapshot: snap('weekend brunch idea'), conversation_ref: '0:1' })
  upsertDiscoveryReview(db, VENUE_A, conceptA1, { id: randomUUID(), review_action: 'rejected', candidate_snapshot: snap('loud music'), conversation_ref: '0:2' })
  // Venue A, concept 2: one review with a 'Venue DNA' route (inert earmark).
  upsertDiscoveryReview(db, VENUE_A, conceptA2, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('intimate lighting', 'Venue DNA'), conversation_ref: '1:0' })
  // Venue B, concept 1: one review (must never appear under venue A).
  upsertDiscoveryReview(db, VENUE_B, conceptB1, { id: randomUUID(), review_action: 'captured', candidate_snapshot: snap('venue B only'), conversation_ref: '0:0' })

  // A manually-inserted live_venue row under venue A — must be EXCLUDED from the workspace.
  db.prepare(`
    INSERT INTO discovery_candidate_reviews
      (id, venue_id, concept_ref, record_space, conversation_ref, candidate_snapshot_json,
       snapshot_taken_at, review_action, chosen_destination, dna_earmarked, owner_edit_json,
       provenance, evidence_type, reviewed_by, reviewed_at)
    VALUES (?, ?, ?, 'live_venue', ?, ?, datetime('now'), 'captured', NULL, 0, NULL,
            'owner_conversation', NULL, NULL, datetime('now'))
  `).run(randomUUID(), VENUE_A, randomUUID(), '9:9', JSON.stringify(snap('LIVE VENUE — must not appear')))

  const rowsBefore = db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_reviews').get().n
  const auditBefore = db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_review_events').get().n

  // ── Aggregation / grouping ──────────────────────────────────────────────────
  section('listConceptDraftsForVenue — grouping & scoping')
  const draftsA = listConceptDraftsForVenue(db, VENUE_A)
  assert('returns two concept drafts for venue A (concept-draft space only)', draftsA.length === 2, `got ${draftsA.length}`)

  const a1 = draftsA.find(d => d.concept_ref === conceptA1)
  const a2 = draftsA.find(d => d.concept_ref === conceptA2)
  assert('concept A1 groups its three reviews', a1 && a1.review_count === 3, a1 && `count=${a1.review_count}`)
  assert('concept A1 actions_summary counts each action', a1 && a1.actions_summary.captured === 1 && a1.actions_summary.held === 1 && a1.actions_summary.rejected === 1,
    a1 && JSON.stringify(a1.actions_summary))
  assert('concept A2 has one review', a2 && a2.review_count === 1, a2 && `count=${a2.review_count}`)
  assert('every draft carries record_space = concept_draft', draftsA.every(d => d.record_space === 'concept_draft'))
  assert('every draft carries venue_id = venue A (access boundary)', draftsA.every(d => d.venue_id === VENUE_A))

  // ── live_venue exclusion ────────────────────────────────────────────────────
  section('record_space conflation guard')
  assert('no live_venue row leaks into the workspace', !draftsA.some(d => /LIVE VENUE/.test(String(d.subtitle || ''))))
  assert('live_venue concept_ref is not listed', draftsA.every(d => d.concept_ref !== '9:9'))

  // ── cross-venue isolation ───────────────────────────────────────────────────
  section('venue scoping')
  assert('venue B concept does not appear under venue A', !draftsA.some(d => d.concept_ref === conceptB1))
  const draftsB = listConceptDraftsForVenue(db, VENUE_B)
  assert('venue B sees only its own concept', draftsB.length === 1 && draftsB[0].concept_ref === conceptB1)
  assert('venue A concepts do not appear under venue B', !draftsB.some(d => d.concept_ref === conceptA1 || d.concept_ref === conceptA2))

  // ── honest labels (no fabricated venue names) ───────────────────────────────
  section('label honesty')
  assert('label is an evidence-bound count, not a venue name', a1 && a1.label === 'Draft concept · 3 saved reviews', a1 && a1.label)
  assert('singular label for one review', a2 && a2.label === 'Draft concept · 1 saved review', a2 && a2.label)
  assert('subtitle comes from a real saved signal', a1 && a1.subtitle === 'Includes: focus on elegance', a1 && a1.subtitle)
  assert('no label fabricates a venue name (no "DNA"/"approved"/"Sauvage")',
    draftsA.every(d => !/(Venue DNA|approved|confirmed|Sauvage)/i.test(`${d.label} ${d.subtitle || ''}`)))

  // ── empty state ─────────────────────────────────────────────────────────────
  section('empty state')
  assert('unknown venue → empty list', listConceptDraftsForVenue(db, 'venue_unknown').length === 0)
  assert('missing venueId → empty list', listConceptDraftsForVenue(db, null).length === 0)

  // ── detail readback ─────────────────────────────────────────────────────────
  section('getConceptDraftDetail')
  const detail = getConceptDraftDetail(db, VENUE_A, conceptA1)
  assert('detail returns the concept summary + reviews', detail && detail.concept_ref === conceptA1 && Array.isArray(detail.reviews))
  assert('detail returns all three saved snapshots', detail && detail.reviews.length === 3, detail && `n=${detail.reviews.length}`)
  assert('detail review carries an immutable snapshot', detail && detail.reviews[0].candidate_snapshot && typeof detail.reviews[0].candidate_snapshot.signal === 'string')
  assert('cross-venue concept detail → null (no foreign read)', getConceptDraftDetail(db, VENUE_B, conceptA1) === null)
  assert('unknown concept detail → null', getConceptDraftDetail(db, VENUE_A, randomUUID()) === null)

  let threw = null
  try { getConceptDraftDetail(db, VENUE_A, 'not-a-uuid') } catch (e) { threw = e }
  assert('malformed concept_ref throws BAD_REQUEST (route → 400)', threw && threw.code === 'BAD_REQUEST', threw && threw.message)

  // ── read-only guarantee ─────────────────────────────────────────────────────
  section('read-only guarantee')
  const rowsAfter = db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_reviews').get().n
  const auditAfter = db.prepare('SELECT COUNT(*) AS n FROM discovery_candidate_review_events').get().n
  assert('workspace reads created ZERO new review rows', rowsAfter === rowsBefore, `${rowsBefore} → ${rowsAfter}`)
  assert('workspace reads created ZERO new audit rows', auditAfter === auditBefore, `${auditBefore} → ${auditAfter}`)

  // ── source-level isolation (no DNA / no confirmation vocabulary) ────────────
  // Scan CODE only — strip // and /* */ comments first, so the module's own honesty
  // documentation (which legitimately names these forbidden things) is not mistaken for use.
  section('source isolation')
  const rawSource = readFileSync(resolve(ROOT, SERVICE_REL), 'utf8')
  const code = rawSource
    .replace(/\/\*[\s\S]*?\*\//g, ' ')   // block comments
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1') // line comments (avoid eating "://" in urls)
  assert('service code never calls mergeVenueDna', !/mergeVenueDna/.test(code))
  assert('service code never writes a canonical DNA store',
    !/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment)\b/i.test(code))
  assert('service code has no venue_dna_json contact', !/venue_dna_json/.test(code))
  assert('no confirmed/approved/promoted vocabulary in the service code', !/['"](confirmed|approved|promoted)['"]/.test(code))

  try { db.close() } catch { /* in-memory */ }
  console.log(`\n  ${passed} passed, ${failed} failed  (assertions: ${passed + failed})\n`)
  process.exit(failed > 0 ? 1 : 0)
}
