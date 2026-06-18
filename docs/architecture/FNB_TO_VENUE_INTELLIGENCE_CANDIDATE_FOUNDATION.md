# F&B → Venue Intelligence Candidate Foundation (Phase 6A)

> **Status: IMPLEMENTED (Phase 6A). Isolated candidate foundation — NOT wired to live routes; NEVER touches Venue DNA.**
> Created: 2026-06-18.
> Plan: [FNB_TO_VENUE_INTELLIGENCE_FEEDBACK_PHASE_6_PLAN.md](./FNB_TO_VENUE_INTELLIGENCE_FEEDBACK_PHASE_6_PLAN.md). Doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [DECISION_LEDGER_DOCTRINE.md](./DECISION_LEDGER_DOCTRINE.md), [SPECIALIST_INTELLIGENCE_PATTERN.md](./SPECIALIST_INTELLIGENCE_PATTERN.md), [FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md](./FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md).

---

## 1. What Phase 6A implemented

- An **isolated** table `venue_intelligence_candidates`, created idempotently at boot via the service's exported DDL ([server.js](../../server.js)) — `db.exec(VENUE_INTELLIGENCE_CANDIDATES_DDL)`, table-init only.
- A pure, deterministic service [src/services/venueBridge/fnbVenueFeedbackService.js](../../src/services/venueBridge/fnbVenueFeedbackService.js) — derivation + DI-`db` storage. No AI, no Venue DNA mutation, no Event/Lab imports, no promotion path.
- Tests [scripts/test-fnb-venue-feedback.js](../../scripts/test-fnb-venue-feedback.js) (`npm run test:fnb-feedback`, **60 assertions**, all passing).
- This document.

## 2. Why candidates are isolated / why they are NOT Venue DNA

Canonical Venue DNA (`venue_intelligence.venue_dna_json`) is mutated **only** by the owner conversation (`mergeVenueDna`, monotonic + floored). Phase 6A creates a **separate** candidate store with **zero** write path into `venue_intelligence` / `venue_briefs` / `venue_dna_enrichment`. A candidate is a *reviewable learning signal* — a proposal awaiting human review — **never** confirmed truth and **never** Venue DNA. There is **no** promotion-to-DNA function in this service (verified by test).

## 3. Candidate schema summary (`venue_intelligence_candidates`)

`id` TEXT PK (randomUUID), `venue_id` (NOT NULL, every query scoped), `source_domain` (`'fnb'`), `source_decision_id` (FK-by-convention → `fb_decisions.id`, nullable), `candidate_type`, `candidate_summary`, compact JSON columns (`candidate_payload_json`, `evidence_json`, `provenance_json`, `confidence_json`), `status` (default `'candidate'`), `human_review_status` (default `'unreviewed'`), `reviewed_by`, `reviewed_at`, `created_at`/`updated_at` (DB defaults). Indexes: `venue_id`, `(venue_id, candidate_type)`, `(venue_id, human_review_status)`, `(venue_id, source_decision_id)`. **No fake defaults** — absent optional fields are `NULL`. No FKs/triggers; no alteration of existing tables.

## 4. Service API summary (dependency-injected `db`)

- Constants: `VENUE_INTELLIGENCE_CANDIDATES_DDL`, `CANDIDATE_TYPES`, `CANDIDATE_STATUSES`, `HUMAN_REVIEW_STATUSES`, `CONFIDENCE_LEVELS` (`['low','medium']` — never `high`), `SOURCE_DOMAIN`.
- `deriveFnbVenueCandidatesFromDecision(decision)` → `Candidate[]` (pure; usually `[]`).
- `scoreFnbCandidateEvidence(candidate)` → `{ level:'low'|'medium', basis }` (never `high`).
- `normalizeFnbCandidate(candidate, venueId)` → validated/normalized row (throws on invalid; preserves nulls; downgrades any `high` confidence to `low`).
- `createVenueIntelligenceCandidate(db, venueId, candidate)` → `{ ok, id, deduped }` (dedupes by `(venue_id, candidate_type, source_decision_id)`).
- `getVenueIntelligenceCandidateById(db, venueId, candidateId)` → shaped row | null.
- `listVenueIntelligenceCandidatesForVenue(db, venueId, filters)` → array (filters: `candidate_type`, `human_review_status`, `status`, `limit`; validated).
- **No promotion/confirm function exists.**

## 5. Conservative derivation rules

Phase 6A derives **only** `taste_direction_signal` and `operational_constraint_signal`, and **only** from explicit `cocktail_rejected` reasons. Confidence is `low` for a single event (`medium` only on corroboration; **never `high`**). One candidate per type per decision.

- **Why generated menus produce no candidate:** generation is HESTIA acting on *existing* understanding; post-Phase-5 its taste target was *derived from* Venue DNA — deriving a venue signal back from it is **circular** and adds no new evidence. → `cocktail_menu_generated` ⇒ `[]`.
- **Why selected cocktails produce no candidate in Phase 6A:** a single human save is acceptance, which is **too weak** to assert a venue signal. → `cocktail_selected` ⇒ `[]`.
- **Why explicit rejections can produce limited candidates:** an explicit, recorded rejection reason (`too_sweet`, `too_complex`, …) is a genuine, human, explicit signal → a single low-confidence candidate of the mapped type. A rejection **without** an explicit mapped reason ⇒ `[]` (no inference).
- **Never derived:** `guest_preference_signal` (a staff rejection is not guest behavior), `pricing_sensitivity_signal` (estimates are not financial truth; no POS), `venue_identity_signal` (no broad identity from one decision), and other reserved types.

## 6. What is intentionally NOT implemented (Phase 6A)

- **No live writes** — no CI route calls `createVenueIntelligenceCandidate`; the table is created but only exercised by direct service tests. (Phase 6B would wire non-blocking writes after the rejection ledger write.)
- **No approval workflow / promotion** — accepting a candidate is out of scope; there is no candidate→Venue DNA path anywhere.
- **No Venue DNA mutation**, no `mergeVenueDna`, no writes to `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment`.
- **No UI, no POS, no AI, no prompts, no generation changes, no third engine.**
- Cocktail Lab and Event Builder untouched.

## 7. Rollback

Remove `import { VENUE_INTELLIGENCE_CANDIDATES_DDL } …` and `db.exec(VENUE_INTELLIGENCE_CANDIDATES_DDL);` from `server.js`; delete `fnbVenueFeedbackService.js`, `scripts/test-fnb-venue-feedback.js`, the `test:fnb-feedback` script, and this doc. The empty `venue_intelligence_candidates` table is harmless if left, or `DROP TABLE venue_intelligence_candidates` (nothing references it). All earlier phases remain intact. For Phase 6B specifically, see §9 rollback.

---

## 8. Phase 6B — Live non-blocking candidate writes (rejection route only, flag-gated, 2026-06-18)

**Candidate writes are now wired — but only for real cocktail rejections, behind a feature flag, non-blocking.**

- **Flag:** `ENABLE_FNB_VENUE_FEEDBACK_CANDIDATES` (env) / `FEATURE_FLAGS.fnbVenueFeedbackCandidates` (static) — **default OFF** — resolved by `isFnbVenueFeedbackCandidatesEnabled()` ([featureFlags.js](../../src/config/featureFlags.js)). Flag off → nothing derives or writes; the rejection route is unchanged.
- **Wrapper:** `safeRecordVenueIntelligenceCandidates(db, venueId, decision, onError)` in [fnbVenueFeedbackService.js](../../src/services/venueBridge/fnbVenueFeedbackService.js) — wraps derive + create-each; **never throws**; returns `{ ok, created, skipped, candidateIds }` (or `{ ok:false, error, ... }`). Candidates require a `source_decision_id` (for dedupe) — without one, nothing is written (skipped).
- **Single write point:** `POST /api/ci/rejections` only, **after** the rejection save and the `safeRecordFbDecision` ledger write, gated by `isFnbVenueFeedbackCandidatesEnabled() && ledger.ok && ledger.decisionId`. The ledger's `decisionId` is the candidate's `source_decision_id`. The `just_experimenting` early-return precedes this, so experimenting rejections write **no** candidate. The `res.status(201).json({ ok: true, saved: true })` response is **unchanged**.
- **NOT wired:** `/api/ci/generate` (generated menus) and `/api/ci/cocktails` (selected cocktails) write **no** candidates — verified by test.
- **Still candidate-only:** no Venue DNA mutation, no `mergeVenueDna`, no writes to `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment`, no approval/promotion, no UI, no POS, no AI, no prompt/generation changes.
- **Failure is non-blocking:** a derivation/db/onError failure is caught inside the wrapper and logged via `debugLog({ event:'fnb_venue_candidate_write_failed', ... })`; the rejection response is never affected.

## 9. Phase 6B rollback

Remove the `safeRecordVenueIntelligenceCandidates(...)` block from `POST /api/ci/rejections` (revert to the bare `safeRecordFbDecision(...)` call), drop `isFnbVenueFeedbackCandidatesEnabled`/`safeRecordVenueIntelligenceCandidates` from the imports, and remove the `fnbVenueFeedbackCandidates` flag + helper from `featureFlags.js`. Phase 6A (table + service) and all earlier phases remain intact.

---

## 10. Phase 7A — Human review/approval (signal-only, 2026-06-18)

**Candidates can now be listed, read, and reviewed — but review is signal-only and NEVER touches Venue DNA.** Plan: [VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md](./VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md).

**Endpoints** (venue-scoped via `req.venueId`):
- `GET /api/venue-intelligence/candidates` — **read: `CI_ROLES`** — compact list (filters: `candidate_type`, `human_review_status`, `limit`); no large JSON snapshots.
- `GET /api/venue-intelligence/candidates/:candidateId` — **read: `CI_ROLES`** — full candidate; **404** if not found / cross-venue.
- `PATCH /api/venue-intelligence/candidates/:candidateId/review` — **owner/admin only** — sets `human_review_status` (+ `reviewed_by`, `reviewed_at`, optional `review_note`); **404** cross-venue; **400** invalid status.

**Service:** `markVenueIntelligenceCandidateReviewed(db, venueId, candidateId, reviewInput)` (pure, DI-`db`, venue-scoped). Updates **only** review fields on `venue_intelligence_candidates`; returns the updated row or `null` (not found / cross-venue). Review action statuses: `REVIEW_ACTION_STATUSES = ['reviewed','accepted','rejected','needs_changes']` (cannot set back to `unreviewed`). `HUMAN_REVIEW_STATUSES` gained `reviewed`.

**Schema:** added `review_note TEXT` (in the DDL for fresh DBs + an idempotent `ALTER TABLE … ADD COLUMN review_note TEXT` in `server.js` for existing DBs). No other schema change.

**`accepted` means "accepted as a useful signal" only.** It does **not** promote to Venue DNA, does **not** change the candidate's `status` (stays `candidate`), and does **not** touch `candidate_type`/payload/evidence/provenance/confidence.

**Guardrails honored:** no Venue DNA mutation, **no `mergeVenueDna`**, no writes to `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment`, **no promotion endpoint**, **no `promoted_to_dna` status**, no UI, no AI, no prompts, no POS, no generation changes, no Event Builder/Cocktail Lab changes. Transitions are reversible; review is fully auditable (`reviewed_by`/`reviewed_at`/`review_note`).

## 11. Phase 7A rollback

Remove the three `/api/venue-intelligence/candidates*` routes and the idempotent `review_note` ALTER from `server.js`; drop `listVenueIntelligenceCandidatesForVenue`/`getVenueIntelligenceCandidateById`/`markVenueIntelligenceCandidateReviewed` from the imports; remove `markVenueIntelligenceCandidateReviewed` + `REVIEW_ACTION_STATUSES` + the `reviewed` status + `review_note` from the service/DDL. Phases ≤6B remain intact. (Candidate→Venue DNA promotion is a separate, later, owner-gated phase — not implemented.)
