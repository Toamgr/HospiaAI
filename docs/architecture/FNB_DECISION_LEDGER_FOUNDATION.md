# F&B Decision Ledger — Foundation (Phase 2)

> **Status: IMPLEMENTED (Phase 2 of the [Master Execution Plan](../plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md)). Write-only-first foundation — not wired to any live route.**
> Created: 2026-06-18.
> Spec: [FNB_DECISION_LEDGER_IMPLEMENTATION_SPEC.md](./FNB_DECISION_LEDGER_IMPLEMENTATION_SPEC.md). Doctrine: [DECISION_LEDGER_DOCTRINE.md](./DECISION_LEDGER_DOCTRINE.md), [FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md](./FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md), [SPECIALIST_INTELLIGENCE_PATTERN.md](./SPECIALIST_INTELLIGENCE_PATTERN.md), [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md).

---

## 1. What was implemented

- A pure, dependency-injected service: [src/services/venueBridge/decisionLedgerService.js](../../src/services/venueBridge/decisionLedgerService.js).
- An additive, venue-scoped, idempotent table `fb_decisions`, created at server boot via the service's exported `FB_DECISIONS_DDL` ([server.js](../../server.js), in the table-init block — import + `db.exec(FB_DECISIONS_DDL)` only).
- In-memory deterministic tests: [scripts/test-fb-decision-ledger.js](../../scripts/test-fb-decision-ledger.js) (`npm run test:fb-ledger`, 62 assertions, all passing).
- This document.

## 2. Why it exists

HESTIA remembered conversations (`venue_intelligence`) and stored outcomes (`cocktail_sales`), but not **decisions** — *why* an F&B choice was made, on what evidence, with what assumptions. The ledger is the durable decision memory that makes F&B intelligence explainable and self-improving. It is the keystone for "why?" answers, feedback candidates, and POS validation.

## 3. Schema summary (`fb_decisions`)

TEXT `id` (randomUUID), `venue_id` (required, every query scoped to it), `decision_type`, `source_engine`, optional scalar links (`source_request_id`, `related_menu_id`, `related_cocktail_id`, `related_event_id`, `decision_title`, `decision_summary`, `venue_dna_hash`), and compact JSON columns (`subject_ref_json`, `decision_payload_json`, `venue_dna_snapshot_json`, `taste_profile_target_json`, `recipe_snapshot_json`, `menu_snapshot_json`, `operational_constraints_json`, `assumptions_json`, `missing_fields_json`, `evidence_json`, `provenance_json`, `confidence_json`, `explanation_basis_json`, `future_validation_targets_json`), plus lifecycle/review (`status` default `recorded`, `human_review_status` default `unreviewed`, `approved_by`, `approved_at`) and `created_at`/`updated_at` (DB defaults). Indexes on `venue_id`, `(venue_id, decision_type)`, `(venue_id, created_at)`.

**No fake defaults:** absent optional fields are stored as `NULL` (never `{}`/`[]`). Append-only in spirit — only the review fields (`human_review_status`, `approved_by`, `approved_at`, `status`, `updated_at`) may change after creation.

## 4. Service API summary (dependency-injected `db`)

- `FB_DECISIONS_DDL`, `DECISION_TYPES`, `DECISION_STATUSES`, `HUMAN_REVIEW_STATUSES`, `SOURCE_ENGINES`, `PROVENANCE_TYPES`, `EVIDENCE_TYPES` (frozen constants).
- `createFbDecision(db, venueId, input)` → `{ ok, id }` (validates type/source/status; serializes JSON; preserves nulls).
- `getFbDecisionById(db, venueId, decisionId)` → shaped row | `null` (venue-scoped).
- `listFbDecisionsForVenue(db, venueId, { limit, offset, since })` → array, newest-first (`created_at DESC, rowid DESC`).
- `listFbDecisionsByType(db, venueId, decisionType)` → array (validates type).
- `markFbDecisionReviewed(db, venueId, decisionId, { human_review_status, approved_by })` → `{ ok }` (the only post-create mutation).
- `buildFbDecisionRecord(venueId, input)` (pure normalizer/validator) and `buildFbDecisionFromCiGeneration(input)` (pure Phase-3 mapping helper — **no live usage**).

Active Phase 2 decision types: `cocktail_menu_generated`, `cocktail_selected`, `cocktail_rejected`. The remaining types are reserved constants for later phases.

> **Phase 3 update (2026-06-18): live non-blocking writes are now wired** into the three CI routes. See §10. The "NOT wired yet" items in §5 below that are superseded are annotated inline.

## 5. What is intentionally NOT wired yet

- ~~No live route writes a ledger row.~~ **Superseded by Phase 3** — `/api/ci/generate`, `/api/ci/cocktails`, `/api/ci/rejections` now record non-blocking ledger rows (see §10).
- **No read-into-prompt / explanation surface.** (Phase 4.)
- **No Venue/Taste DNA feedback.** (Phase 6, candidate-only + human review.)
- **No POS integration.** The `future_validation_targets_json` field + a future `cocktail_sales.decision_id` link are prepared shapes only. (Phase 8.)
- **No UI.**

## 6. Why write-only-first

Creating the table + service without wiring live writes means generation behavior **cannot change**, the feature is **fully reversible**, and real decision history can accumulate before anything depends on it. It is the lowest-risk way to lay the keystone.

## 7. What this unlocks

- **Phase 3 — live decision logging:** call `createFbDecision(db, req.venueId, …)` from the three CI write points, each wrapped so a ledger failure never blocks generation.
- **Phase 4 — on-demand "why?":** a read endpoint answers from `explanation_basis_json` + `venue_dna_snapshot_json` + `taste_profile_target_json` + `evidence_json` + `confidence_json` — honestly, never canned.
- **Future POS validation:** join `fb_decisions` ↔ `cocktail_sales` (via a future `decision_id`) so real sales confirm/contradict decisions and *propose* (never auto-confirm) Venue DNA confidence candidates.

## 8. Guardrails honored

- **No Venue DNA mutation** — the service has no DNA write path (no `mergeVenueDna`, no writes to `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment`); verified by test.
- **No fake evidence / confidence / POS truth** — absent fields stay null; nothing is fabricated.
- **No generation behavior change** — server.js change is table-init only; no handler edits; CI/Omer, Cocktail Lab, and Event Builder untouched.
- **No third cocktail engine** — this is decision *memory*, not generation.
- **Venue-scoped + role-ready** — every read/write filters on `venue_id`; Phase 3 write points reuse `requireAuth(...CI_ROLES)`.
- **node:sqlite-safe** — `CREATE TABLE IF NOT EXISTS` + idempotent; no `db.transaction()`; no `ALTER` of existing tables.

## 9. Rollback

Remove the `import { FB_DECISIONS_DDL } …` line and the `db.exec(FB_DECISIONS_DDL);` line in `server.js`; delete `decisionLedgerService.js`, `scripts/test-fb-decision-ledger.js`, the `test:fb-ledger` script, and this doc. The empty `fb_decisions` table is harmless if left, or `DROP TABLE fb_decisions` manually (nothing references it). For Phase 3 specifically, see §10 rollback (remove the three `safeRecordFbDecision(...)` blocks + helpers; the foundation can remain).

---

## 10. Phase 3 — Live non-blocking writes (2026-06-18)

**Live decision logging is now wired into the venue-aware CI/F&B path.** Plan: [FNB_DECISION_LEDGER_PHASE_3_WIRING_PLAN.md](./FNB_DECISION_LEDGER_PHASE_3_WIRING_PLAN.md).

**Routes covered** (all `requireAuth(...CI_ROLES)`, venue-scoped via `req.venueId`):
- `POST /api/ci/generate` → `cocktail_menu_generated`
- `POST /api/ci/cocktails` → `cocktail_selected` (`related_cocktail_id` = new id)
- `POST /api/ci/rejections` → `cocktail_rejected` (**skipped for `just_experimenting`** — no row, matching the existing no-memory behavior)

**Failure behavior:** every write goes through the new pure wrapper `safeRecordFbDecision(db, venueId, input, onError)`, which **never throws** — it catches all errors (validation, db, even an `onError` that throws), logs via `debugLog({ event: 'fb_ledger_write_failed', ... })`, and returns `{ ok:false, error }`. Each call is placed **after** the route's existing success logic and **before** the unchanged response, so generation/save/rejection behavior and response shapes are byte-identical whether the ledger succeeds, fails, or is absent. (server.js diff is purely additive — 0 removed lines.)

**What is captured** (compact, real data only — via `fbCompactValue` / `fbCompactBarDna` / `fbSummarizeCiResult`):
- generate: `flow_type` + compact params, Bar-DNA dims used, a small result summary (count/names/sections), Omer active/confidence, evidence (`venue_dna`/`taste_dna`/`omer_brief`), provenance, explanation basis.
- cocktails: recipe summary, `related_cocktail_id`/`menu_id`, estimated costs **labelled `costing_basis: 'estimate'`**, provenance (`human_save`).
- rejections: cocktail name, reasons, compact profile, evidence (`rejection_history`), provenance (`human_reject`).

**What is intentionally NOT captured:** full AI result, full Venue DNA, verified/real costs, sales/POS truth, `venue_dna_hash` (the routes hold Bar DNA + Omer text, not the venue_intelligence DNA), and `menu_id`/`cocktail_id` when not available — all left null. No fabrication.

**Still not built:** no explanation/"why?" service (Phase 4); no Venue/Taste **DNA mutation** or feedback candidates (Phase 6); no POS validation (Phase 8); no UI; no third engine.

**Phase 3 rollback:** delete the three `safeRecordFbDecision(...)` blocks and the `fb*` helper functions in `server.js`, and drop `safeRecordFbDecision` from the import — the write-only foundation (table + service + tests) remains intact.

---

## 11. Phase 4 — Read-only "why?" explanation (2026-06-18)

**On-demand decision explanation is now available — deterministic, read-only, role-gated.** Plan: [FNB_DECISION_LEDGER_PHASE_4_EXPLANATION_PLAN.md](./FNB_DECISION_LEDGER_PHASE_4_EXPLANATION_PLAN.md).

**New endpoints** (both `requireAuth(...CI_ROLES)` = owner/manager/bar_manager/admin/fb_director; venue-scoped via `req.venueId`; **read-only — zero writes**):
- `GET /api/ci/decisions/:decisionId/explanation` — explains one decision. Fetches via `getFbDecisionById(db, req.venueId, …)`; a missing or cross-venue id → **404** (no leaked metadata).
- `GET /api/ci/decisions` — compact list (`id, decision_type, source_engine, decision_title, decision_summary, related_cocktail_id, related_menu_id, status, human_review_status, created_at, has_explanation_basis, has_confidence`). **No large JSON snapshots.** Optional `?decision_type=` and `?limit=` filters.

**New pure service:** [src/services/venueBridge/decisionExplanationService.js](../../src/services/venueBridge/decisionExplanationService.js) — `buildFbDecisionExplanation`, `summarizeDecisionBasis`, `summarizeEvidence`, `summarizeConfidence`, `summarizeMissingInformation`. No db, no AI, no mutation, no Event/Lab imports. Receives an already-venue-scoped row; the route owns the read.

**Deterministic behavior:** explanations are assembled **only** from recorded ledger fields. No AI, no prompts, no generated prose beyond the deterministic composer.

**What can be explained now:**
- `cocktail_menu_generated`: flow type, generated summary (count/names), Bar DNA dims used, Omer active/confidence, evidence — with confidence level when recorded.
- `cocktail_selected`: honestly framed as a human save action + saved recipe; cost figures flagged as **estimates**.
- `cocktail_rejected`: honestly from recorded reasons/profile.

**What cannot be explained yet (stated as `explanation_limits`, never fabricated):** taste-profile rationale (Phase 5), specific venue_intelligence DNA-dimension reasoning, per-ingredient rationale, commercial/sales outcomes (POS not integrated).

**Honest behavior:** missing evidence → warning + empty list; missing/low confidence → `confidence.level: 'none'|'low'` + warning; fields Phase 3 never records (`assumptions`, `future_validation_targets`, etc.) → reported in `missing_information` as "not recorded", never inferred; no row / cross-venue → 404 (and the service's own safety net returns `can_explain:false` for null input).

**Not included:** no AI, no Venue/Taste DNA mutation, no POS, no UI, no generation changes, no third engine.

**Phase 4 rollback:** remove the two `app.get('/api/ci/decisions...')` routes and drop `getFbDecisionById`/`listFbDecisionsForVenue`/`buildFbDecisionExplanation` from the imports; delete `decisionExplanationService.js` and its tests. Phases 2–3 remain intact.

---

## 12. Phase 5 — Decimal taste convergence into CI/Omer (flag-gated, 2026-06-18)

**The venue-aware CI/Omer Director can now receive a compact decimal taste target — flag-gated, context-only.** Plan: [FNB_DECIMAL_TASTE_CONVERGENCE_PHASE_5_PLAN.md](./FNB_DECIMAL_TASTE_CONVERGENCE_PHASE_5_PLAN.md).

**What was added:**
- A slim formatter `formatTasteTargetPromptBlock(range, opts)` and a resolver `resolveCiTasteTarget({venueDNA, venueProfile})` in [beverageContextService.js](../../src/services/venueBridge/beverageContextService.js) (reuse the existing adapter + `venueTasteProfileMap` — no new engine). The block emits **only** the decimal `target_taste_profile_range` (0.0–5.0, one decimal) + an optional one-line direction, capped ~600 chars; it does **not** repeat the Omer venue-identity block.
- In `POST /api/ci/generate`: when `ENABLE_VENUE_BEVERAGE_CONTEXT` is **on** and a real range resolves, the slim block is **appended to the venue-context string** (`omer.text`) before it is passed to `buildGenerationPrompt`. **`buildGenerationPrompt` is unchanged.**

**Flag off → byte-identical:** `venueContextText = omer.text || ''`; the append is inside `if (isVenueBeverageContextEnabled())`. With the flag off, the prompt and the ledger row are identical to Phase 4.

**Output contract unchanged:** no decimal taste **output** is requested from Gemini; `JSON.parse(raw)` and the response shape (`{ ok, flow_type, result, venue_context_active }`) are untouched. The block explicitly tells the model **not** to return a taste profile.

**Ledger:** the `cocktail_menu_generated` row stores `taste_profile_target_json` **only when a deterministic range was resolved**; `taste_profile_result_json` is **never** written (no decimal result); `explanation_basis` gains `taste_target_dimensions` when present; `missing_fields` records `['no venue taste target resolved']` only when flag-on but nothing resolved. Saved/rejected ledger rows are unchanged.

**Honest + safe:** missing dimensions are omitted (never fake-zeroed); no range → no block and no fabricated target; read-only DNA access (`getVenueIntelligence`) with **no** Venue DNA mutation.

**Not changed:** integer flavor model, Cocktail Lab, Event Builder, prompts files, UI, POS. No third engine.

**Phase 5 rollback:** in `server.js`, remove the flag-gated `venueContextText` taste-block composition (revert to passing `omer.text || ''`) and the three ledger taste fields; drop the Phase 5 imports; remove `formatTasteTargetPromptBlock`/`resolveCiTasteTarget` from `beverageContextService.js`. Phases 2–4 remain intact.
