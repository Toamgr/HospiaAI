# F&B Decision Ledger Implementation Spec

> **Status: SPECIFICATION (Phase 1 of the [Master Execution Plan](../plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md)). No code, tables, services, prompts, UI, or live behavior were created.**
> Created: 2026-06-18.
> Governed by: [Decision Ledger Doctrine](./DECISION_LEDGER_DOCTRINE.md), [F&B Director Intelligence Doctrine](./FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md), [Specialist Intelligence Pattern](./SPECIALIST_INTELLIGENCE_PATTERN.md), [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md). Index: [README_HESTIA_AI_DOCTRINE_INDEX.md](./README_HESTIA_AI_DOCTRINE_INDEX.md).
> Companion: [North Star & F&B Recommendation](./HESTIA_AI_NORTH_STAR_AND_FNB_INTELLIGENCE_RECOMMENDATION.md).

---

## 1. Executive Summary

Phase 2 will build the **F&B Decision Ledger**: one venue-scoped, append-only table (`fb_decisions`) plus a small service that creates and reads decision records. It is the durable memory of *why* an F&B decision was made — the keystone that later unlocks on-demand "why?" explanations (Phase 4), provenance-gated Venue/Taste DNA feedback candidates (Phase 6), and future POS validation (Phase 8).

**Write-only-first**, because that removes essentially all risk: in Phase 2 nothing reads the ledger back into prompts or generation, so generation behavior cannot change; real decision history accumulates before anything depends on it; and the whole feature is reversible (drop the table, delete two files). Live write points are deliberately deferred to Phase 3.

This spec records exact codebase findings, the proposed schema, the controlled vocabularies, the service API, the future write/read points (not implemented), POS-readiness, migration safety for `node:sqlite`, the Phase 2 test plan, the exact file set, the breakage review, and acceptance criteria.

## 2. Doctrine Alignment

- **Decision Ledger Doctrine:** this spec is exactly that doctrine made concrete — stores rationale/evidence/confidence/assumptions/snapshots/constraints/approval/validation targets; is **not** confirmed Venue DNA; is **write-only first**; writes must **never block generation**; **no fake evidence**; lives as a service in `src/services/venueBridge/`.
- **F&B Director Intelligence Doctrine:** the ledger is the F&B specialist's decision memory. It records decisions from the **venue-aware CI/Omer path** and does **not** create a third engine, does **not** touch Cocktail Lab generation, and leaves the Event Builder alone.
- **Specialist Intelligence Pattern:** implements step 4 (record a decision memory) + step 5 (preserve explanation basis) + the seed of step 6 (feedback candidates) — while step 7 (never mutate Venue DNA directly) is enforced: the ledger only *records*; it never confirms DNA.
- **Venue Memory & DNA Guardrails:** every row is `venue_id`-scoped, carries provenance/confidence/evidence/status, and uses the shared memory envelope. Candidates are candidates; nothing here confirms Venue DNA.
- **North Star Doctrine:** advances the bidirectional law (decisions become memory that can later sharpen Venue Intelligence) without fragmentation, fake intelligence, or auto-mutation.

## 3. Current Codebase Findings

All findings verified by inspection of `server.js` and `src/services/`.

**DB driver & init**
- Driver: `node:sqlite` `DatabaseSync` — `import { DatabaseSync } from "node:sqlite";` (`server.js:6`), `const db = new DatabaseSync(DB_PATH);` (`server.js:39`).
- **No `db.transaction()`** exists on `DatabaseSync`. Atomic multi-statement writes use raw `BEGIN/COMMIT` (`server.js:2431` comment: "Atomic via BEGIN/COMMIT (node:sqlite DatabaseSync has no .transaction())").
- Table creation: a block of `db.exec("CREATE TABLE IF NOT EXISTS ...")` statements (≈`server.js:400–1130`). Additive column changes use idempotent `try { db.exec("ALTER TABLE ... ADD COLUMN ...") } catch { /* already exists */ }` (e.g. `server.js:1114, 1148–1151`).
- Helpers: `nowIso()` (`server.js:1240`), `randomUUID` from `node:crypto` (`server.js:7`).

**Persistence patterns (relevant tables)**
- `venue_intelligence` (`server.js:964`): `venue_id` UNIQUE, `venue_dna_json`, `messages_json`, `stage`, `objective`, `updated_at`. Read/created by `getVenueIntelligence(venueId)` (`server.js:5361`), written on `/api/venue-intelligence/message` via `mergeVenueDna` (monotonic confidence + floors, no fabrication).
- `cocktail_intelligence_dna` (Bar DNA, `server.js:806`): `id` INTEGER PK AUTOINCREMENT, `venue_id`, plus venue/atmosphere/audience/staff/equipment/glassware/`is_kosher`/`flavor_identity_json`/`price_range`/`service_pressure`/`hero_ingredient`, `created_at`/`updated_at` `DEFAULT (datetime('now'))`. Read by `getCIDna(venueId)` (`server.js:3975`); upserted at `POST /api/ci/dna` (`server.js:4527`).
- `cocktail_taste_dna` (`server.js:838`): `venue_id` UNIQUE, `rejected_flavors_json`, `rejected_spirits_json`, `rejected_complexity_json`, `approved_flavors_json`, `approved_spirits_json`, `pattern_notes_json`. Read by `getCITasteDna(venueId)` (`server.js:3997`); rebuilt by `rebuildTasteDna(venueId)` (≈`server.js:4480–4519`) from rejection reason counts (≥2 → pattern).
- `cocktail_sales` (`server.js:850`): `id` INTEGER PK, `venue_id`, `cocktail_id` FK, `cocktail_name`, `sale_date`, `period_type`, `units_sold`, `sale_price`, `cost_per_unit`, `revenue`, `gross_profit`, `gp_percent`, `created_at`. Routes `/api/ci/sales` GET/POST/PATCH/DELETE.
- `business_memory` (`server.js:405`): `id` **TEXT** PK (uses `randomUUID`), `venue_id`, `type`, `title`, `detail`, `event_date`, `created_at` — closest existing "memory" table; uses TEXT ids.
- `cocktails` (`server.js`): `id` INTEGER PK AUTOINCREMENT, `name`, `category`, `description`, `base_spirit`, `glass_type`, `garnish`, `method`, `tags_json`, `ingredients_text_json`, `source` (`'ci_generated'`), `created_by`, `created_at`, `menu_id`, `estimated_cost_ils`, `suggested_price_ils`, `estimated_gp_percent`, `is_active`.
- `cocktail_menus`: `id` INTEGER PK, `venue_id`, `name`, `status`, `visible_to_staff`, …

**CI / Omer generation flow**
- `POST /api/ci/generate` (`server.js:4589`, `requireAuth(...CI_ROLES)` where `CI_ROLES = ['owner','manager','bar_manager','admin','fb_director']`): builds `getCIDna` + `getCITasteDna` + `getOmerVenueContext` → `buildGenerationPrompt(flow_type, params, dna, tasteDna, existingNames, omer.text)` → `askGemini(..., { jsonMode })` → returns `{ ok, flow_type, result, venue_context_active }`. **It does not persist a cocktail** — the AI result is returned to the client, which then decides to save.
- `buildDirectorSystemInstruction(dna, menuCocktails, omer.text)` (`server.js:4136`), `buildGenerationPrompt(...)` (`server.js:4192`).

**Approval / rejection / edit flows (what actually exists)**
- **"Select/save"** = `POST /api/ci/cocktails` (`server.js:4672`): inserts into `cocktails` (`source='ci_generated'`) + auto-creates a `cocktail_lifecycle` row. This is the real "this cocktail was chosen" event.
- **"Reject"** = `POST /api/ci/rejections` (`server.js:4628`): inserts into `cocktail_rejections` then calls `rebuildTasteDna(req.venueId)`. (Reason `just_experimenting` is intentionally not saved.)
- **"Delete"** = `DELETE /api/ci/cocktails/:id` (`server.js:4707`): soft-delete `is_active=0`.
- **No dedicated CI "approve" endpoint.** "Approval" in CI is effectively save + menu grouping + `visible_to_staff` toggle (`PATCH /api/ci/menus/:id/visible`). (The Event flow has its own `/api/events/:id/cocktail-menu/approve` — **out of scope**.)
- **No server-side CI "recipe adjusted" endpoint.** Cocktail Lab micro-adjust (`cocktailAdjustmentUtils`) is client-side and not persisted → `recipe_adjusted` is a **reserved** decision type for later.

**Service & test patterns**
- `src/services/venueBridge/*` services are **pure and deterministic** — none import or touch `db` (verified). All SQL lives in `server.js`. server.js already imports from venueBridge (`venueBridgeService`, `intelligenceContextService`).
- Tests are standalone Node scripts using dynamic `import(...)`, exit 0/1, no framework (`scripts/test-hospitality-dna.js`, `scripts/test-beverage-intelligence-foundation.js`).
- `package.json` scripts: `dev`, `build`, `server`, `server:dev`, `start`, `start:prod`, `hestia:check`, `test:beverage`.

**Tenancy:** `requireAuth(...)` resolves `X-HESTIA-Venue` → `req.venueId`; every venue table read/write is venue-scoped; never default a venue id in handlers.

**Migration risks:** `node:sqlite` only — no `better-sqlite3`, no `.transaction()`, no migration framework. Schema is "create-if-not-exists at boot + idempotent ALTER". This is safe for a brand-new additive table.

## 4. Proposed Table: `fb_decisions`

A new, additive, venue-scoped, append-only table. **TEXT `id`** (via `randomUUID`) to match `business_memory` (the existing memory table) and to keep the ledger decoupled from autoincrement. All snapshot/optional fields are **nullable** and default to `NULL` when truly absent — **no fake defaults** (per doctrine). JSON fields hold compact JSON strings.

| Field | SQLite type | Req/Null | Default | Purpose | Example | Risk if poorly designed |
|---|---|---|---|---|---|---|
| `id` | TEXT | required (PK) | — | Stable decision id | `"a1b2…"` (randomUUID) | autoincrement coupling / id collisions |
| `venue_id` | TEXT | required | — | Tenant scope; **every** read filters on it | `"venue_42"` | cross-venue leakage |
| `decision_type` | TEXT | required | — | Controlled vocabulary (§5) | `"cocktail_menu_generated"` | naming drift → unqueryable history |
| `source_engine` | TEXT | required | — | Which engine produced it | `"ci_omer"` | drift (e.g. mixing "lab"/"omer"/"CI") |
| `source_request_id` | TEXT | nullable | NULL | Correlates to a generation request (generated at write time) | `"req_8f…"` | un-correlatable multi-row decisions |
| `related_menu_id` | INTEGER | nullable | NULL | FK→`cocktail_menus.id` | `12` | orphaned/incorrect links |
| `related_cocktail_id` | INTEGER | nullable | NULL | FK→`cocktails.id` | `347` | orphaned links |
| `related_event_id` | TEXT | nullable | NULL | FK→`events.id` (future event linkage) | `null` | premature event coupling |
| `subject_ref_json` | TEXT | nullable | NULL | Compact pointer(s) to the subject when no single FK fits | `{"draftId":"…"}` | bloat if overused |
| `decision_title` | TEXT | nullable | NULL | Short human label | `"Summer aperitivo menu (5 drinks)"` | none material |
| `decision_summary` | TEXT | nullable | NULL | One-paragraph plain summary | `"Generated a low-ABV…"` | verbosity bloat |
| `decision_payload_json` | TEXT | nullable | NULL | Compact structured decision content (domain-specific) | `{"flow_type":"menu","count":5}` | oversized payloads |
| `venue_dna_snapshot_json` | TEXT | nullable | NULL | Compact snapshot of DNA dims **used** (not the whole DNA) | `{"hospitalityStyle":["warm med"]}` | full-DNA bloat; stale snapshot misread |
| `venue_dna_hash` | TEXT | nullable | NULL | Hash of DNA at decision time (`hashVenueDna`) | `"3fa9c1"` | none material |
| `taste_profile_target_json` | TEXT | nullable | NULL | Decimal 0.0–5.0 target range used | `{"acidity":{"min":2,"max":3.8}}` | confusing with resulting profile |
| `recipe_snapshot_json` | TEXT | nullable | NULL | Compact per-cocktail recipe(s) snapshot | `[{"name":"…","ingredientsMl":[…]}]` | oversized; duplicating cocktails table |
| `menu_snapshot_json` | TEXT | nullable | NULL | Compact menu structure snapshot | `{"sections":[…]}` | oversized |
| `operational_constraints_json` | TEXT | nullable | NULL | Constraints applied | `["small back bar"]` | fabricated constraints |
| `assumptions_json` | TEXT | nullable | NULL (or `[]` when explicitly none) | Honest assumptions | `["assumed premium tier"]` | hidden assumptions if dropped |
| `missing_fields_json` | TEXT | nullable | NULL | Known unknowns at decision time | `["price_tier"]` | invented "knowns" |
| `evidence_json` | TEXT | nullable | NULL | Sources actually used | `[{"source":"venue_dna","ref":"…"}]` | fake evidence (forbidden) |
| `provenance_json` | TEXT | nullable | NULL | Provenance label(s) | `{"origin":"specialist_decision"}` | unattributable claims |
| `confidence_json` | TEXT | nullable | NULL | Overall + per-source confidence | `{"overall":62,"venue_dna":55}` | fake confidence |
| `explanation_basis_json` | TEXT | nullable | NULL | The "why?" seed (from `beverageContextService`) | `{"matched_archetypes":[…]}` | canned/empty → weak "why?" |
| `future_validation_targets_json` | TEXT | nullable | NULL | What future POS/sales should validate | `[{"metric":"units_sold","expect":"med+"}]` | premature POS coupling |
| `status` | TEXT | required | `'recorded'` | Lifecycle status (§6) | `"recorded"` | invalid states |
| `human_review_status` | TEXT | required | `'unreviewed'` | Human review state (§6) | `"unreviewed"` | implying review that didn't happen |
| `approved_by` | TEXT | nullable | NULL | Who reviewed/approved (if any) | `null` | implying approval falsely |
| `approved_at` | TEXT | nullable | NULL | When reviewed/approved | `null` | same |
| `created_at` | TEXT | required | `(datetime('now'))` | Creation time | `"2026-06-18 12:00:00"` | none |
| `updated_at` | TEXT | required | `(datetime('now'))` | Last update (review only; rows are otherwise append-only) | `"2026-06-18 12:00:00"` | mutability creep |

**Design notes**
- JSON fields stay **compact**: store *dimensions used* and *snapshots referenced*, not entire objects. Recipes/menus already live in `cocktails`/`cocktail_menus`; the snapshot is a small, point-in-time excerpt for explainability, not a duplicate store.
- **Append-only in spirit:** only `human_review_status`/`approved_by`/`approved_at`/`updated_at`/`status` may change after creation (review path). Core decision content is never edited.
- No `CHECK` constraints on `decision_type`/`status` (see §5/§6 rationale) — validation is in the service for migration safety and forward-compatibility.

## 5. Decision Type Contract

Controlled `decision_type` values. **Defined as a code constant** (`FB_DECISION_TYPES`) in the service, validated in `createFbDecision`. **No DB-level `CHECK`** — the CI tables in this repo do not use CHECK, `node:sqlite` makes evolving a CHECK painful, and code-level validation keeps the vocabulary extensible without a destructive migration.

| Value | Phase | Maps to (future write point) |
|---|---|---|
| `cocktail_menu_generated` | **Phase 2 active** | `POST /api/ci/generate` (menu flow) |
| `cocktail_selected` | **Phase 2 active** | `POST /api/ci/cocktails` |
| `cocktail_rejected` | **Phase 2 active** | `POST /api/ci/rejections` |
| `recipe_adjusted` | reserved (later) | no server endpoint today (Lab adjust is client-side) |
| `taste_direction_chosen` | reserved (later) | Phase 5 decimal-taste convergence |
| `menu_architecture_chosen` | reserved (later) | menu structure decisions |
| `operational_constraint_identified` | reserved (later) | feedback-candidate phase |
| `pricing_assumption_made` | reserved (later) | costing/margin decisions |
| `future_pos_validation_target_created` | reserved (later) | Phase 8 POS prep |

In Phase 2 the **service accepts all listed values** (so the vocabulary is stable) but only the three "active" ones are expected to be written when Phase 3 wires the live points. Unknown values are rejected by the service.

## 6. Status / Review Contract

All defined as service-level constants + validators (no DB CHECK), and documented here as the canonical vocabulary.

- **`status`** (lifecycle of the *record*): `recorded` (default) → `superseded` (a later decision replaced it) → `archived`. (Not "approved" — approval is a *review* concept, see below.)
- **`human_review_status`**: `unreviewed` (default) → `approved` → `rejected` → `needs_changes`. This is human review of the *decision*, distinct from `status`.
- **`confidence` labels** (in `confidence_json`): numeric 0–100 per source, optionally bucketed `low` (<40) / `medium` (40–69) / `high` (≥70) — mirrors the existing Omer/DNA confidence conventions.
- **`provenance` types** (in `provenance_json`): `owner_conversation | specialist_decision | sales_signal | ai_inference | operational_event`.
- **`evidence` types** (entries in `evidence_json`): `venue_dna | taste_dna | omer_brief | classic_calibration | costing | rejection_history | operational_signal` (+ `ref`/optional `excerpt`).
- **Status taxonomy of content** (per Venue Memory guardrails): items inside the record may be labeled `confirmed_fact | owner_preference | founder_belief | ai_inference | assumption | candidate | conflicting | missing`.

**A ledger entry is NOT confirmed Venue DNA.** `human_review_status = approved` means a human approved *the decision record* — it does **not** mutate Venue DNA. Any DNA change remains a separate, gated action in later phases.

## 7. Service API Plan

**Path: `src/services/venueBridge/decisionLedgerService.js` — confirmed correct** (a decision is a venue-intelligence artifact; venueBridge is its home, and `server.js` already imports from there).

**Convention decision (with rationale):** the existing venueBridge services are *pure (no db)*. A ledger inherently needs persistence. The recommended reconciliation keeps the service free of any imported db handle by using **dependency injection** — the caller passes the `db` (or any `DatabaseSync`, including `:memory:` in tests) — and the service **exports the DDL constant** so `server.js` (boot) and the test (`:memory:`) share one source of truth. The service imports **no** db, **no** AI, **no** Event Builder, **no** generation code.

Exports:
- `FB_DECISIONS_DDL` — the `CREATE TABLE IF NOT EXISTS fb_decisions (...)` string (single source of truth; server execs it at boot; tests exec it in `:memory:`).
- `FB_DECISION_TYPES`, `FB_DECISION_STATUSES`, `FB_REVIEW_STATUSES`, `FB_PROVENANCE_TYPES`, `FB_EVIDENCE_TYPES` — frozen constant arrays.
- the functions below.

| Function | Purpose | Inputs | Output | Validation | Side effects | Failure behavior | Security/tenant | Test cases |
|---|---|---|---|---|---|---|---|---|
| `createFbDecision(db, venueId, input)` | Insert one decision (append-only) | `db`, `venueId`, `input` (typed fields) | `{ ok, id }` or throws on validation | require `venueId`, valid `decision_type`, valid `source_engine`, valid `status`/`review` if provided; serialize JSON; **no fake defaults** | one INSERT | throws on validation error; **callers must wrap so a write failure never blocks generation** (Phase 3) | `venue_id` always from arg, never client-trusted blindly | create minimal; create full; invalid type rejected; null optionals stay null; JSON round-trip |
| `getFbDecisionById(db, venueId, decisionId)` | Read one (venue-scoped) | `db`, `venueId`, `decisionId` | row (parsed JSON) or `null` | both ids required | none | returns `null` if not found | filters `WHERE id=? AND venue_id=?` | found; not found; cross-venue returns null |
| `listFbDecisionsForVenue(db, venueId, filters)` | List for a venue | `db`, `venueId`, `{ limit, offset, since }` | array (newest first) | clamp `limit` (e.g. ≤200) | none | empty array if none | `WHERE venue_id=?` only | returns only this venue's rows; pagination |
| `listFbDecisionsByType(db, venueId, decisionType)` | Filter by type | `db`, `venueId`, `decisionType` | array | valid type | none | empty array | venue-scoped | type filter; invalid type → `[]` or throw (decide: throw) |
| `markFbDecisionReviewed(db, venueId, decisionId, reviewInput)` | Set review status (the only post-create mutation) | `db`, `venueId`, `decisionId`, `{ human_review_status, approved_by }` | `{ ok }` | valid review status; row must belong to venue | one UPDATE (`human_review_status`, `approved_by`, `approved_at`, `updated_at`) | throws if row missing/cross-venue | venue-scoped UPDATE | approve; reject; cross-venue no-op |
| `buildFbDecisionRecord(venueId, input)` *(pure helper)* | Validate + normalize input → row object (no db) | `venueId`, `input` | normalized row object | full validation; JSON serialization | **none** (pure) | throws on invalid | venue_id embedded | unit-tested directly without db |

**Critical constraints (all functions):** no AI calls; no Venue DNA mutation; no generation-output changes; no Event Builder import; venue-scoped on every query; deterministic and unit-testable.

## 8. Write Points — Future Phase 3 Only (do NOT implement now)

Planned, not built. Each must wrap the ledger call so failure is non-blocking.

| Write point | Route/function | When to write | Capture | Must NOT capture | Non-blocking | Preserve output |
|---|---|---|---|---|---|---|
| Menu/cocktail generated | `POST /api/ci/generate` (`server.js:4589`) after successful parse | on success only | `decision_type:'cocktail_menu_generated'`, `source_engine:'ci_omer'`, params, `venue_dna_snapshot`/`hash`, `taste_profile_target`, `omer venue_context_active`, `explanation_basis`, assumptions, evidence, confidence | full raw prompt, full DNA, fabricated costs/KPIs | `try { createFbDecision(...) } catch (e) { debugLog(...) }` — never alter the response | response body unchanged; ledger write is fire-and-forget after `res`-ready |
| Cocktail selected/saved | `POST /api/ci/cocktails` (`server.js:4672`) after insert | after `lastInsertRowid` | `decision_type:'cocktail_selected'`, `related_cocktail_id`, `related_menu_id`, recipe snapshot (compact) | invented economics | same try/catch | created cocktail response unchanged |
| Cocktail rejected | `POST /api/ci/rejections` (`server.js:4628`) after insert, before/after `rebuildTasteDna` | on save (skip `just_experimenting`) | `decision_type:'cocktail_rejected'`, reasons, profile, evidence | fake patterns | same try/catch | rejection response + `rebuildTasteDna` behavior unchanged |
| Recipe adjusted | *no server endpoint today* | — (reserved) | — | — | — | — |

**Phase 2 builds the table + service only. Phase 3 wires these. Do not implement write points in Phase 2.**

## 9. Read Contract — Future Explanation Service (do NOT implement now)

The Phase 4 explanation service will read (venue-scoped) from `fb_decisions`:
- **Required to answer "why?":** `explanation_basis_json`, `venue_dna_snapshot_json` (+ `venue_dna_hash`), `taste_profile_target_json`, `operational_constraints_json`, `assumptions_json`, `evidence_json`, `confidence_json`, `decision_summary`.
- **If `explanation_basis_json` is empty/null:** answer honestly ("the recorded basis for this decision is limited") — never fabricate a rationale, never fall back to canned prompt text.
- **If confidence is low:** state it plainly and label the answer provisional.
- **If evidence is missing:** say what is known and what is not; do not invent sources.
- **Owner-facing tone:** plain language, no decimal/technical taste dump by default; technical detail only on explicit request (per F&B Director Doctrine §7).

## 10. POS Validation Preparation

Defined now so future POS data can validate decisions — **no POS integration built**.

- **`future_validation_targets_json`** shape (per decision): `[{ "metric": "units_sold"|"gp_percent"|"reorder_rate"|"attach_food"|..., "expectation": "low"|"medium"|"high"|"<freeform>", "window": "first_30_days"|..., "status": "pending" }]`.
- **Future link:** Phase 8 adds a nullable `decision_id` (TEXT FK → `fb_decisions.id`) on `cocktail_sales`, plus the nullable `source`-labeled sales fields from the Master Plan §13. **Not in Phase 2.**
- **Everything remains nullable** until real data exists.
- **POS is validation, not truth:** when sales arrive they set a target's `status` to `validated`/`contradicted` and may *propose* a Venue/Taste DNA confidence candidate — never auto-confirm, never invent numbers.

## 11. Migration / DB Safety Plan

Because the repo uses `node:sqlite` `DatabaseSync` with no `db.transaction()` and no migration framework:

- **Add via `db.exec(FB_DECISIONS_DDL)`** in the existing table-creation block in `server.js`, using `CREATE TABLE IF NOT EXISTS` → **idempotent**; safe to run on every boot.
- **No `ALTER TABLE` needed** in Phase 2 (brand-new table). Future additive columns (e.g. Phase 8) use the existing `try { db.exec("ALTER TABLE fb_decisions ADD COLUMN …") } catch {}` idempotent pattern.
- **No destructive migrations** — never `DROP`/recreate at boot; never rename columns in place.
- **No multi-statement atomic dependency** — a single `CREATE TABLE` needs no transaction.
- **Rollback:** remove the `db.exec(FB_DECISIONS_DDL)` line + the service import; the empty table can be left in place harmlessly or dropped manually (`DROP TABLE fb_decisions`) since nothing else references it.
- **Verify server boot:** `npm run server` (or `hestia:check`'s build) must start cleanly; confirm the table exists via a one-off `SELECT name FROM sqlite_master WHERE type='table' AND name='fb_decisions'` in the test (against `:memory:`) and, optionally, a manual boot check.

## 12. Test Plan for Phase 2

**Script: `scripts/test-fb-decision-ledger.js`** (standalone Node, dynamic import, exit 0/1 — matches existing test style). It imports `decisionLedgerService.js`, creates an **in-memory** `new DatabaseSync(':memory:')`, runs `FB_DECISIONS_DDL`, and exercises the service. No server boot, no real DB file, no network, no AI.

Tests:
1. Table exists after `db.exec(FB_DECISIONS_DDL)` (`sqlite_master` check).
2. `createFbDecision` inserts and returns an id.
3. `getFbDecisionById` returns the row; JSON fields parsed.
4. `listFbDecisionsForVenue` returns venue rows newest-first.
5. `listFbDecisionsByType` filters correctly.
6. **JSON round-trip** integrity (write object → read equal object).
7. **Null optional fields remain null** (not `'{}'`/`'[]'` unless explicitly provided).
8. **No fake defaults** — unspecified snapshots/evidence/confidence are null.
9. **Cross-venue isolation** — venue A cannot read venue B's rows.
10. **Invalid `decision_type` rejected.**
11. **Invalid `status` / `human_review_status` rejected.**
12. `markFbDecisionReviewed` updates only review fields; core content unchanged.
13. **No Venue DNA mutation** — service has no DNA write path (assert by inspection/no such export).
14. **No generation path change** — static guard: `geminiCocktailAgent.js`, `eventCocktailMenuService.js` unchanged (grep guard).
15. **Event Builder untouched** — service source contains no `eventCocktailMenuService`/`event` import.
16. `npm run build` passes.
17. `npm run hestia:check` passes (build clean, no FAIL rows).
18. `npm run test:beverage` remains **106/106**.

**npm script recommendation:** add a **separate** `"test:fb-ledger": "node scripts/test-fb-decision-ledger.js"`. Keep it separate from `test:beverage` (different domain; uses `node:sqlite` in-memory rather than the beverage modules). Optionally, a later `"test:all"` can chain both.

## 13. Files To Be Created / Modified In Phase 2

**New files**
- `src/services/venueBridge/decisionLedgerService.js` — the pure-logic + DI-db service (DDL constant, constants, validators, `createFbDecision`, reads, `markFbDecisionReviewed`, `buildFbDecisionRecord`). *Why: the ledger's home per doctrine.*
- `scripts/test-fb-decision-ledger.js` — Phase 2 tests (in-memory DB). *Why: prove the table/service in isolation.*
- `docs/architecture/FNB_DECISION_LEDGER_FOUNDATION.md` — short "what was built / how to use / what is NOT wired yet" record (sibling to `BEVERAGE_INTELLIGENCE_FOUNDATION_LAYER.md`). *Why: durable record for future agents.*

**Modified files**
- `server.js` — **only** add the service import + `db.exec(FB_DECISIONS_DDL)` in the table-creation block. **No route/handler/generation changes in Phase 2.** *Why: the table must exist at boot.*
- `package.json` — add `test:fb-ledger` script. *Why: discoverable verification.*

**Must NOT be touched in Phase 2**
- `src/services/geminiCocktailAgent.js`, `src/services/cocktailService.js` (Cocktail Lab path).
- `/api/ci/generate`, `/api/ci/cocktails`, `/api/ci/rejections` handler bodies (write points are Phase 3).
- `src/services/eventCocktailMenuService.js`, `src/features/events/*` (Event Builder).
- Any prompt file, any UI component, any Venue DNA write path (`mergeVenueDna`, `venue_intelligence`).

## 14. Breakage Risk Review

| Risk | Likelihood | Impact | Prevention | Verification | Rollback |
|---|---|---|---|---|---|
| DB init failure | Low | High | `CREATE TABLE IF NOT EXISTS` only; idempotent; single statement | server boot + test `sqlite_master` check | remove `db.exec(FB_DECISIONS_DDL)` line |
| Migration collision | Low | Med | brand-new table name `fb_decisions`; verified absent | grep schema; boot | drop table |
| JSON serialization bug | Med | Med | central serialize/deserialize helpers; round-trip test | test #6 | n/a (service-local) |
| Cross-venue leakage | Med | High | every query `WHERE venue_id=?`; venue_id from server, not client | test #9 | tighten query |
| Role access mistake | Low | High | write points (Phase 3) reuse `requireAuth(...CI_ROLES)`; Phase 2 has no routes | route review in Phase 3 | n/a in Phase 2 |
| Accidental generation change | Low | High | Phase 2 doesn't touch handlers; static grep guard | tests #14/#15; regression audit | revert server import |
| Accidental Venue DNA mutation | Low | High | service has no DNA write; doctrine-enforced | test #13 | n/a |
| Event Builder coupling | Low | Med | no event imports in service | test #15 | remove import |
| Fake evidence / confidence | Med | High | no fake defaults; nulls when absent; validators | tests #7/#8 | fix builder |
| Fake POS truth | Low | High | POS fields nullable, unused in Phase 2 | review | n/a |
| Oversized snapshots | Med | Med | store dims-used + compact excerpts, not full objects; (optional) size cap | review payloads | trim builder |
| `source_engine` naming drift | Med | Med | constant `FB_SOURCE_ENGINES` (e.g. `ci_omer`,`cocktail_lab`); validated | test invalid source | normalize |
| ESM/import issues | Low | Med | explicit `.js` extensions; Node-safe (no `import.meta.env` needs) | `build`, test run | fix import |
| Test script instability | Low | Low | in-memory DB, deterministic, no network | run twice | fix test |
| Build / hestia:check failure | Low | High | additive only; no client bundle impact (server-only + script) | `build`, `hestia:check` | revert |

## 15. Phase 2 Acceptance Criteria ("green")

- `fb_decisions` table exists (created idempotently at boot via `FB_DECISIONS_DDL`).
- `decisionLedgerService.js` exists with the specified exports; **pure logic + DI db; no AI, no DNA writes, no Event imports**.
- `scripts/test-fb-decision-ledger.js` passes (all §12 cases, exit 0).
- `npm run build` passes; `npm run hestia:check` shows Build PASSED with no FAIL rows; `npm run test:beverage` remains 106/106.
- **Generation unchanged** (no write points wired; CI/Omer + Cocktail Lab + Event outputs byte-identical).
- **No Venue DNA mutation**, **no Event Builder changes**, **no UI**, **no prompt changes**, **no POS integration**.
- **All rows venue-scoped**; cross-venue isolation proven by test.
- The ledger is a **write-only foundation** (created + unit-tested; not yet written to by live routes unless a write point is explicitly included — recommendation: it is **not**; defer to Phase 3).

## 16. What We Will Receive After Phase 2

**Technical:** a durable, venue-scoped, append-only `fb_decisions` table and a tested, pure service to create/read/review decisions — fully isolated, reversible, and not wired into any live route.

**Product:** HESTIA gains the *capability* to remember F&B decisions. But:
- **No live decisions are written yet** (Phase 3 wires the CI write points).
- HESTIA **cannot yet answer "why?"** (Phase 4 explanation service).
- HESTIA **does not update Venue DNA** (Phase 6, candidate-only + human review).
- HESTIA **does not validate via POS** (Phase 8 prep + future data).

**Unlocks:** Phase 3 (live decision logging on the venue-aware path) and, through it, Phase 4 (explanations) and Phase 6 (feedback candidates).

## 17. Final Recommendation

**Proceed to Phase 2 as specified, with one explicit scope choice: Phase 2 creates the table + service + tests only — it does NOT wire live write points** (those are Phase 3). This is the safest, highest-leverage step: it changes zero generation behavior, is fully reversible, and is unit-testable in isolation via an in-memory database.

Two confirmations baked into this spec that refine (not contradict) the plan:
1. **Service design:** keep `decisionLedgerService.js` free of any imported db by using **dependency injection** (`db` passed in) and a shared exported `FB_DECISIONS_DDL` constant — reconciling the "ledger needs persistence" reality with the repo's "pure services" convention, while staying fully testable.
2. **Write points are real and few:** `/api/ci/generate`, `/api/ci/cocktails`, `/api/ci/rejections` (no CI "approve" or server-side "recipe adjust" exists today) — wired in Phase 3, non-blocking.

No reason to pause. The doctrine, the schema, the service shape, the migration path, and the tests are all defined and low-risk.

---

*End of specification. No code, tables, services, prompts, UI, or live behavior were created or modified. All findings are grounded in the cited files/routes/tables.*
