# F&B Decision Ledger — Phase 3 Wiring Plan & Risk Review

> **Status: PLAN (docs-only). No code changed.** Pre-implementation plan for the first phase that touches live CI/F&B routes.
> Created: 2026-06-18.
> Spec: [FNB_DECISION_LEDGER_IMPLEMENTATION_SPEC.md](./FNB_DECISION_LEDGER_IMPLEMENTATION_SPEC.md) (§8 Write Points). Foundation: [FNB_DECISION_LEDGER_FOUNDATION.md](./FNB_DECISION_LEDGER_FOUNDATION.md). Doctrine: [DECISION_LEDGER_DOCTRINE.md](./DECISION_LEDGER_DOCTRINE.md), [FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md](./FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md), [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md).

---

## 1. Executive Summary

Phase 3 wires **non-blocking** ledger writes into the three existing venue-aware CI/F&B routes — `POST /api/ci/generate`, `POST /api/ci/cocktails`, `POST /api/ci/rejections` — so that each successful F&B decision records *why* it happened in `fb_decisions`. This is the first phase that edits live routes.

It is safe **only because every write is non-blocking**: each `createFbDecision(...)` is wrapped in its own `try/catch`, placed **after** the route's existing logic succeeds and **before** (or alongside) the existing response, so a ledger failure logs and is swallowed — generation, save, and rejection behavior and response shapes are byte-identical whether the ledger succeeds, fails, or is absent. No prompts, no generation logic, no response shapes, no Venue DNA, no Cocktail Lab, no Event Builder, no UI, no POS change.

To centralize the guarantee, Phase 3 adds one **pure, dependency-injected** helper to the ledger service — `safeRecordFbDecision(db, venueId, input, onError)` — that wraps `createFbDecision` and **never throws**. All three routes call only this helper.

## 2. Current Route Inspection

### 2.1 `POST /api/ci/generate`
- **File / area:** `server.js:4595–4617` (async handler).
- **Auth:** `requireAuth(...CI_ROLES)` (`owner, manager, bar_manager, admin, fb_director`).
- **Current behavior:** reads `{ flow_type, ...params }`; loads `getCIDna(req.venueId)`, `getCITasteDna(req.venueId)`, `existingNames`, `getOmerVenueContext(req.venueId)`; builds prompt via `buildGenerationPrompt(...)`; calls `askGemini(prompt, { jsonMode: true })`; `JSON.parse(raw)`.
- **Response shape:** `{ ok: true, flow_type, result, venue_context_active }`. (400 if no `flow_type`; 500 on parse/other error.)
- **Persistence today:** **none** — the AI result is returned to the client; nothing is stored. (Saving happens separately via `/api/ci/cocktails`.)
- **Venue scoping:** `req.venueId` throughout.
- **Data available for a ledger row:** `flow_type`, `params`, `dna` (Bar DNA), `tasteDna`, `omer` (`.active`, `.confidence`, `.text`), `result` (parsed AI JSON), `req.user`.
- **Data NOT available:** a saved `menu_id`/`cocktail_id` (generation precedes save); verified costs; the `venue_intelligence` Venue DNA object (only the Omer brief text is in scope, not the raw DNA or its hash).

### 2.2 `POST /api/ci/cocktails`
- **File / area:** `server.js:4678–4711` (sync handler).
- **Auth:** `requireAuth(...CI_ROLES)`.
- **Current behavior:** requires `b.name`; `INSERT INTO cocktails (...)` with `source='ci_generated'`; captures `result.lastInsertRowid` as `newId`; `INSERT INTO cocktail_lifecycle (...)`; re-selects and returns the saved cocktail.
- **Response shape:** `{ ok: true, cocktail: { ...saved, tags, ingredients } }`. (400 if no `name`.)
- **Persistence today:** `cocktails` row + `cocktail_lifecycle` row.
- **Venue scoping:** `cocktail_lifecycle` uses `req.venueId`. (Observation: the `cocktails` table itself is not venue-scoped in this insert; out of scope for Phase 3 — the **ledger row will be venue-scoped via `req.venueId` regardless**.)
- **Data available:** `newId`, `b.name`, `base_spirit`, `glass`, `garnish`, `method`, `tags`, `ingredients`, `b.menu_id`, estimated cost/price/GP (labelled estimates), `req.user`.
- **Data NOT available:** verified costs; taste-target used at generation (unless the client passes it; do not assume).

### 2.3 `POST /api/ci/rejections`
- **File / area:** `server.js:4634–4655` (sync handler).
- **Auth:** `requireAuth(...CI_ROLES)`.
- **Current behavior:** requires `b.cocktail_name` + non-empty `b.reasons[]`; **early-returns `{ ok:true, saved:false }` for `just_experimenting` (no memory saved)**; otherwise `INSERT INTO cocktail_rejections (...)` then `rebuildTasteDna(req.venueId)`.
- **Response shape:** `{ ok: true, saved: true }` (or `{ ok:true, saved:false, reason }` for experimenting; 400 if missing fields).
- **Persistence today:** `cocktail_rejections` row + Taste DNA rebuild.
- **Venue scoping:** `req.venueId`.
- **Data available:** `cocktail_name`, `reasons`, `cocktail_profile`, `base_spirit`, `req.user`.
- **Data NOT available:** the original generation decision id (no link today); verified costs.

## 3. Proposed Ledger Writes

> Compactness rule for all: store **dimensions used + small excerpts**, never the full raw AI result or full DNA. Cap arrays (e.g. ≤ ~12 items) and truncate long strings. Absent fields stay **null** (no fabrication). `source_engine` is **`ci_omer`** for all three (the venue-aware path); `cocktail_lab` is **not** wired in Phase 3.

### 3.1 `cocktail_menu_generated` (in `/api/ci/generate`)
- **decision_type:** `cocktail_menu_generated` · **source_engine:** `ci_omer`
- **Required:** `decision_type`, `source_engine`.
- **decision_title / decision_summary:** short, e.g. `"CI generation: <flow_type>"` / one line.
- **decision_payload_json:** compact `{ flow_type, params: <whitelisted/compact params> }` (drop any oversized free-text).
- **venue_dna_snapshot_json:** compact Bar-DNA dims actually used (e.g. `venue_type`, `atmosphere`, `price_range`, `audience_type`, `staff_skill`, `is_kosher`) — **not** the full DNA.
- **menu_snapshot_json:** compact summary of `result` (e.g. `{ count, names: [...capped], sections: [...] }`) — **not** the full generated payload.
- **evidence_json:** `[{ source: 'venue_dna' }, { source: 'taste_dna' }, { source: 'omer_brief', ref: omer.active ? 'active' : 'inactive' }]`.
- **provenance_json:** `{ origin: 'specialist_decision' }`.
- **confidence_json:** `{ omer: omer.confidence ?? null }` (the only honest signal here).
- **explanation_basis_json:** `{ omer_active: omer.active, omer_confidence: omer.confidence, flow_type }` — the "why?" seed (**not** the full `omer.text`).
- **future_validation_targets_json:** **null** (no specific saved cocktail to validate yet — targets attach better at selection).
- **Must stay null:** `related_menu_id`, `related_cocktail_id`, `related_event_id`, `recipe_snapshot_json`, `taste_profile_target_json` (unless a real target is in scope), `venue_dna_hash` (the route holds Bar DNA + Omer text, not the venue_intelligence DNA — leave null rather than imply a DNA hash), `approved_*`.

### 3.2 `cocktail_selected` (in `/api/ci/cocktails`)
- **decision_type:** `cocktail_selected` · **source_engine:** `ci_omer`
- **related_cocktail_id:** `newId` · **related_menu_id:** `b.menu_id ?? null`.
- **decision_title / summary:** `"Saved cocktail: <name>"`.
- **recipe_snapshot_json:** compact `{ name, base_spirit, method, glass, garnish, ingredients: [...capped] }`.
- **decision_payload_json:** `{ estimated_cost_ils, suggested_price_ils, estimated_gp_percent }` **clearly labelled as estimates** (e.g. `{ costing_basis: 'estimate', ... }`) — never as verified.
- **provenance_json:** `{ origin: 'specialist_decision', action: 'human_save' }`.
- **evidence_json:** null or `[{ source: 'costing', ref: 'estimate' }]` only if estimates present.
- **future_validation_targets_json:** optional `[{ metric: 'units_sold', expectation: null, window: 'first_30_days', status: 'pending' }]` (a placeholder target the cocktail can later be validated against) — or **null** if we prefer to attach targets only when a target is meaningful. **Recommend null in Phase 3** (honest; targets get richer in Phase 8).
- **Must stay null:** `venue_dna_snapshot_json`/`hash` (not loaded here), `taste_profile_target_json`, `confidence_json`, `approved_*`.

### 3.3 `cocktail_rejected` (in `/api/ci/rejections`)
- **decision_type:** `cocktail_rejected` · **source_engine:** `ci_omer`
- **Skip entirely for `just_experimenting`** (consistent with "no memory saved").
- **subject_ref_json:** `{ cocktail_name: b.cocktail_name }`.
- **decision_summary:** `"Rejected: <name>"`.
- **decision_payload_json:** `{ reasons: [...], base_spirit: b.base_spirit ?? null }`.
- **recipe_snapshot_json:** compact `b.cocktail_profile` (capped) or null.
- **evidence_json:** `[{ source: 'rejection_history' }]`.
- **provenance_json:** `{ origin: 'specialist_decision', action: 'human_reject' }`.
- **Must stay null:** costs, confidence, DNA snapshot/hash, validation targets, approved_*.

## 4. Non-Blocking Failure Strategy

- **Helper (new, pure, DI):** add `safeRecordFbDecision(db, venueId, input, onError)` to `decisionLedgerService.js`. It calls `createFbDecision` inside `try/catch`; on error it invokes `onError(err)` and returns `{ ok: false }`; on success returns `{ ok: true, id }`. **It never throws.** No AI, no DNA, no Event imports — same purity rules as the rest of the service.
- **Where the call goes in each route:** immediately **after the existing success path** (after `JSON.parse(result)` in generate; after `newId` + lifecycle insert in cocktails; after the rejection insert + `rebuildTasteDna` in rejections) and **immediately before the existing `res.json(...)`** — wrapped so it is structurally impossible to affect the response. Because `safeRecordFbDecision` cannot throw, it cannot reach the route's outer `try/catch` and cannot cause a double-send.
- **What gets logged:** `onError` uses the existing server logging (`console.error` / `debugLog`) with a stable tag, e.g. `"[fb-ledger] write failed for <decision_type> venue=<id>: <message>"`. **No stack traces or payloads exposed to the client.**
- **What must not be exposed:** nothing about the ledger appears in any response body; clients never learn whether a ledger write happened. Response shapes are unchanged.
- **Why behavior is preserved:** the write is additive, post-success, side-effect-only, and non-throwing. If the ledger table, service, or insert fails, the route returns exactly what it returns today.

## 5. Tests Needed

> The repo has no HTTP integration harness; tests stay at the unit/structural level (matching existing style), plus a manual smoke. Extend `scripts/test-fb-decision-ledger.js` (or add `scripts/test-fb-ledger-wiring.js`).

- **`safeRecordFbDecision` never throws on a broken db:** pass a fake `db` whose `.prepare()` throws → returns `{ ok:false }`, calls `onError` once, does not throw. (Proves "generation/save/rejection cannot be blocked by a ledger error.")
- **`safeRecordFbDecision` writes on a working (in-memory) db:** returns `{ ok:true, id }`; row readable; venue-scoped.
- **Venue isolation:** rows written via the helper are scoped to the passed `venueId`.
- **Response shapes unchanged (static guards on `server.js`):** the three `res.json(...)` / `res.status(201).json(...)` lines are unchanged; each route contains a `safeRecordFbDecision(` call; **no bare `createFbDecision(` call** in routes (only via the safe wrapper).
- **`just_experimenting` writes no ledger row** (static: the rejection write point is placed after the experimenting early-return).
- **No Venue DNA mutation / no Event coupling / no prompt change (static greps):** `server.js` route diffs add only ledger calls; `geminiCocktailAgent.js`, `cocktailService.js`, `eventCocktailMenuService.js`, `src/prompts/*`, and the venue_intelligence/briefs/enrichment writers are untouched.
- **Regression:** `npm run test:fb-ledger`, `npm run test:beverage`, `npm run build`, `npm run hestia:check` all green.
- **Manual smoke (documented, run once):** boot server; call each route with a valid payload; confirm exactly one `fb_decisions` row per successful call, correct `decision_type`/`venue_id`, and unchanged response bodies; then simulate a ledger failure (e.g. temporarily rename the table in a scratch DB) and confirm routes still succeed.

## 6. Breakage Risks

| Risk | Likelihood | Impact | Prevention | Verification | Rollback |
|---|---|---|---|---|---|
| Route response shape changed | Low | High | ledger call is side-effect-only, before unchanged `res.json`; no response field added | static guard on `res.json` lines; manual smoke | revert the 3 call sites |
| Generation blocked by ledger error | Low | High | `safeRecordFbDecision` never throws; own try/catch; post-success placement | `safeRecordFbDecision` throw test; manual fail-injection | revert |
| Save / rejection blocked by ledger error | Low | High | same non-blocking helper; placed after existing inserts | same tests | revert |
| Fake evidence captured | Med | High | only record sources actually used; estimates labelled; absent → null | code review; null-default tests | fix payload builder |
| Oversized snapshots (full AI result/DNA) | Med | Med | compact-capture rule (names/dims/excerpts, capped arrays); never store raw `result`/full DNA | review payload sizes; row-size check | trim builders |
| Cross-venue leakage | Low | High | every write uses `req.venueId`; helper venue-scoped | isolation test | tighten |
| Accidental Venue DNA mutation | Low | High | ledger service has no DNA write path; routes call only the helper | guard test (no DNA writers) | revert |
| Accidental Event Builder coupling | Low | Med | no event imports added; only ledger service used | grep guard | revert |
| Duplicate rows (regenerate / retry) | Med | Low | each call = one decision (intended); optional `source_request_id` idempotency later | manual smoke | n/a (append-only) |
| `source_engine` drift | Low | Med | constant `'ci_omer'` for all three; validated by service | service validation; review | normalize |
| Build / test failure | Low | Med | additive server-only change; no client bundle impact | `build`, `hestia:check`, both test suites | revert |
| Double-send / headers-already-sent | Low | High | helper cannot throw → cannot reach outer catch after `res` | throw test; manual smoke | revert |

## 7. Files Likely To Change In Phase 3

**Likely modified**
- `server.js` — add 3 `safeRecordFbDecision(...)` calls (one per route) + import the helper. Each call: build compact input, place after existing success logic, before the existing response. No other route logic touched.
- `src/services/venueBridge/decisionLedgerService.js` — add the pure `safeRecordFbDecision(db, venueId, input, onError)` wrapper (additive; no new dependencies).

**Likely test files**
- `scripts/test-fb-decision-ledger.js` — extend with `safeRecordFbDecision` (throw-safety + success) tests and the `server.js` static guards. (Or a new `scripts/test-fb-ledger-wiring.js`; prefer extending to keep one command.)

**Must NOT be touched**
- `src/services/geminiCocktailAgent.js`, `src/services/cocktailService.js` (Cocktail Lab path), `src/prompts/*` (prompts/contracts).
- `src/services/eventCocktailMenuService.js`, `src/features/events/*` (Event Builder).
- Any Venue DNA writer (`mergeVenueDna`, `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment` writes).
- The `buildGenerationPrompt` / `buildDirectorSystemInstruction` / `askGemini` logic and all response objects.
- Any UI component; any POS code.

## 8. Acceptance Criteria ("green")

- All three live routes still work and return **byte-identical response shapes** (verified by static guard + manual smoke).
- A `fb_decisions` row is created **only after** the route's existing success logic; `just_experimenting` rejections create **no** row.
- A ledger failure (service/table/insert) **cannot block or alter** generation, save, or rejection (proven by the non-throwing helper test + fail-injection smoke).
- Every ledger row is venue-scoped via `req.venueId`; cross-venue isolation holds.
- **No prompts changed; no UI; no POS; no Venue DNA mutation; no Event Builder changes; no Cocktail Lab changes; no third engine.**
- `npm run test:fb-ledger`, `npm run test:beverage`, `npm run build`, `npm run hestia:check` all pass.

## 9. Final Recommendation

**Proceed to Phase 3 implementation as specified**, with the one design refinement baked in here: route the non-blocking guarantee through a single pure `safeRecordFbDecision(db, venueId, input, onError)` helper so it is centralized and unit-testable, and have all three routes call only that helper (never `createFbDecision` directly).

This keeps Phase 3 minimal (3 call sites + 1 pure helper + tests), strictly additive, and reversible. **Stop-and-alert remains in force:** if implementation reveals that wiring any write point would require changing route behavior, a response shape, prompts, generation logic, the Event Builder, Cocktail Lab, or any Venue DNA mutation, stop and report before writing code.

---

*End of Phase 3 wiring plan. No code, routes, prompts, UI, or live behavior were changed in producing this document.*
