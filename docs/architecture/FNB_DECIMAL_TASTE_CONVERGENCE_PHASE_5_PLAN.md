# F&B Decimal Taste Convergence — Phase 5 Plan & Regression-Risk Review

> **Status: PLAN (docs-only). No code changed.** First phase that may touch live generation *context* (flag-gated).
> Created: 2026-06-18.
> Doctrine: [FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md](./FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md) (§2 convergence, §3 decimal taste), [HESTIA_AI_NORTH_STAR_DOCTRINE.md](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md). Foundation: [BEVERAGE_INTELLIGENCE_FOUNDATION_LAYER.md](./BEVERAGE_INTELLIGENCE_FOUNDATION_LAYER.md), [FNB_DECISION_LEDGER_FOUNDATION.md](./FNB_DECISION_LEDGER_FOUNDATION.md).

---

## 1. Executive Summary

Phase 5 brings the **decimal taste intelligence** (0.0–5.0 one-decimal target ranges) into the **canonical venue-aware F&B Director path (CI/Omer)** — where it belongs — instead of leaving it stranded in the isolated, dormant Cocktail Lab wiring. When the existing `ENABLE_VENUE_BEVERAGE_CONTEXT` flag is **on**, `POST /api/ci/generate` will append a **small, capped, decimal `target_taste_profile_range` block** to the venue context it already passes to the generator, and record that target on the `fb_decisions` row. When the flag is **off**, behavior is **byte-identical** to Phase 4.

It matters because it makes the venue-aware Director *reason with professional taste nuance* (4.0 acidity ≠ 4.6 acidity) derived from Venue DNA — the core F&B doctrine promise — **without** removing the integer flavor model, changing Cocktail Lab/Event Builder, requesting risky new AI output, or creating a third engine.

**Headline recommendation (see §5): inject the target taste *context* only; do NOT request decimal taste *output* from Gemini yet.** Output-shape changes are deferred to a later, separately-approved phase.

## 2. Current Decimal Taste Reality (verified)

- **Modules exist, dormant:** `src/domain/hospitality/bar/{tasteProfileSchema, classicTasteCalibration, cocktailFamilyRatios, ingredientTasteImpact, microAdjustmentPrediction, venueTasteProfileMap}.js`. Imported **only** by `src/services/venueBridge/beverageContextService.js` and the foundation test.
- **`beverageContextService.js`** (`buildVenueBeverageContext`, `formatVenueBeveragePromptBlock`) is imported **only** by `src/services/geminiCocktailAgent.js` (the **Cocktail Lab** path), flag-gated. Its live caller (`CocktailLabStudio`) passes **no** venue data, so even with the flag on it is effectively dormant.
- **CI/Omer path has zero taste profile:** `grep` of `omerContextService.js` and the `server.js` CI generation path for `taste_profile`/`target_taste`/`beverageContext` returns **nothing**. The venue-aware Director currently knows nothing about decimal taste.
- **CI/Omer flow today:** `POST /api/ci/generate` → `getCIDna` (Bar DNA) + `getCITasteDna` (rejection-pattern taste DNA) + `getOmerVenueContext` (`{active, confidence, text}` from briefs) → `buildGenerationPrompt(flow_type, params, dna, tasteDna, existingNames, omer.text)` → `askGemini(prompt, { jsonMode })` → `JSON.parse(raw)` → returns `result` (no field-level validation).
- **Output contracts:** CI/Omer `/api/ci/generate` does **not** validate result fields (just parses+returns). Cocktail Lab has the strict **25-field** contract (`EXPECTED_FIELDS`) — **out of scope** for Phase 5.
- **Flag:** `isVenueBeverageContextEnabled()` reads `ENABLE_VENUE_BEVERAGE_CONTEXT` / `FEATURE_FLAGS.venueBeverageContext` (default off).
- **Ledger:** `fb_decisions` already has `taste_profile_target_json` (and the unused `recipe_snapshot_json`); Phase 3 writes `taste_profile_target` as **null** today.

## 3. Target Behavior

- **Flag on:** a **compact decimal `target_taste_profile_range`** (only the dimensions the venue language actually implies, each `min–max` on 0.0–5.0) is available to the CI/Omer generator, plus optionally a one-line beverage-direction hint.
- **Flag off:** **behavior-identical** to Phase 4 — same prompt string, same response, same ledger row.
- **Integer model preserved:** `cocktailFlavorProfileUtils` and any integer flavor handling are untouched; the decimal range is *additional context*, not a replacement.
- **No forced decimal output:** Phase 5 does **not** require Gemini to return decimal taste fields (see §5).
- **Ledger enrichment:** when (and only when) a target range was actually produced, store it in `taste_profile_target_json`; never store fabricated decimals. `taste_profile_result_json` stays null until output is safely requested/validated in a later phase.

## 4. Prompt / Context Injection Plan

**Minimal, builder-preserving approach (recommended):**
- **Do NOT change `buildGenerationPrompt`’s signature or body.** It already takes the venue-context string as its last argument (`omer.text`).
- In the `/api/ci/generate` route, when the flag is on, compute a compact taste block and **append it to the venue-context string** before calling `buildGenerationPrompt`:
  ```
  let venueContextText = omer.text || '';
  if (isVenueBeverageContextEnabled()) {
    const tasteBlock = buildTasteTargetBlock(venueId);   // '' if no range
    if (tasteBlock) venueContextText += '\n\n' + tasteBlock;
  }
  buildGenerationPrompt(flow_type, params, dna, tasteDna, existingNames, venueContextText);
  ```
  When the flag is off (or no range resolves), `venueContextText === (omer.text || '')` → **byte-identical** prompt.

- **Which service builds the block:** reuse the existing `beverageContextService` adapter to resolve the range (no new resolution logic, no third engine). Source the venue language from data already available server-side — the **venue_intelligence Venue DNA** (`getVenueIntelligence(venueId).venueDNA`) and/or Bar DNA (`getCIDna`) — via `buildVenueBeverageContext({ venueDNA, venueProfile })`, then format **only the range** (and optional 1-line direction).
- **New slim formatter (recommended):** add `formatTasteTargetPromptBlock(range, opts)` to `beverageContextService.js`. It emits **only** the decimal target dimensions, e.g.:
  ```
  Venue taste target (0.0–5.0, only where known): acidity 2.0–3.8, bitterness 1.0–3.0, body 2.0–4.0
  Beverage direction: <one short line, optional>
  ```
  **Do NOT reuse `formatVenueBeveragePromptBlock`** in CI/Omer — it repeats venue_type/price/guest/service, which the Omer block already carries → duplication + bloat.
- **Size cap:** ≤ ~12 lines / ≤ ~600 chars; only named range dimensions + one optional direction line. **No** classic-calibration tables, ingredient tables, micro-adjustment tables, or research text. Measure and log size in dev/test (reuse the existing `[venue-beverage-context]`-style logging pattern).
- **Excluded from the block:** full Venue DNA, Bar DNA dump, costs, sales, assumptions prose, the foundation modules’ data tables.

## 5. Output Contract Risk

**Recommendation: inject target taste *context* now; DEFER requesting decimal taste *output*.**

- CI/Omer `/api/ci/generate` does not validate result fields, so adding a request for decimal output would not *crash* parsing — but it could **degrade generation quality**, change the result shape unpredictably, and produce **unvalidated** decimal numbers that risk reading as real taste data (a fabrication risk).
- The Cocktail Lab 25-field contract is **not touched** by Phase 5 (different engine).
- Therefore: **store decimal taste only when genuinely produced and validated.** In Phase 5, the only decimal stored is the **target range we computed deterministically** (`taste_profile_target_json`). `taste_profile_result_json` (the produced drink’s decimal profile) stays **null** until a later phase that (a) explicitly requests it in the prompt, (b) validates it against `tasteProfileSchema` (0.0–5.0, one decimal), and (c) handles parse failure gracefully.

**Explicit choice:** *only inject target taste context now; defer output changes.*

## 6. Decision Ledger Integration

The generate-route ledger write (Phase 3) is extended **only when flag on and a range resolved**:
- `taste_profile_target_json` ← the computed compact range (deterministic; never fabricated).
- `taste_profile_result_json` ← **remains null** (no decimal output requested yet).
- `explanation_basis` ← add `taste_target_dimensions: [...]` (which dims were targeted) so the Phase 4 "why?" can cite the taste direction.
- `confidence_json` ← unchanged in source (still Omer-derived); the taste target is deterministic, so no fabricated taste confidence is added.
- `missing_fields_json` ← when flag on but **no** range resolved, record `["no venue taste target resolved"]`; when flag off, unchanged (null). Never store fake decimals.

When flag off, the ledger input is unchanged → **byte-identical** ledger row vs Phase 4.

## 7. Tests Needed

Extend `scripts/test-beverage-intelligence-foundation.js` (formatter) and `scripts/test-fb-decision-ledger.js` (ledger/explanation), all pure/in-memory — no server boot, no AI:
- **`formatTasteTargetPromptBlock`**: emits only range dims + optional direction; returns `''` for an empty/all-null range; caps size; contains **no** full tables.
- **Valid dimensions**: every emitted value is within 0.0–5.0 with one decimal; missing dims absent (not `0`).
- **No fake zero defaults**: an absent dimension never appears as `0`.
- **Flag-off identity (unit-level)**: with the flag resolver returning false, the composed venue-context equals `omer.text` (assert via a small pure helper or by asserting the route concatenation guard).
- **Flag-on injection**: with flag on + a resolvable venue, the block is appended and is compact (size assertion).
- **Ledger**: `taste_profile_target_json` populated only when a range exists; `taste_profile_result_json` stays null; `missing_fields` records "no venue taste target resolved" when none; flag-off → identical ledger input.
- **Explanation service** still handles missing/again-null taste data honestly (no crash; reports "not recorded" for result).
- **Static guards**: `buildGenerationPrompt` signature/body unchanged; CI/Omer response shape unchanged; Cocktail Lab (`geminiCocktailAgent.js`) untouched; Event Builder untouched; no Venue DNA write; no AI added to the formatter.
- **Regression**: `test:beverage` (106) and `test:fb-ledger` (113) remain green; `build`; `hestia:check`.

## 8. Breakage Risks

| Risk | Likelihood | Impact | Prevention | Verification | Rollback |
|---|---|---|---|---|---|
| Prompt bloat | Med | Med | slim taste-only block; ≤~600 chars; no tables; size logged | size test + dev log | flag off / shrink block |
| JSON output contract break | Low | High | **no decimal output requested**; only context injected; CI parse unchanged | manual generate smoke; result-shape unchanged | flag off |
| Generation quality regression | Med | Med | small, relevant target range only; defer output asks; A/B via flag | manual flag-on/off compare | flag off |
| Flag-off not byte-identical | Low | High | route appends nothing when flag off; `buildGenerationPrompt` untouched | flag-off identity test + diff | revert route lines |
| Accidental Cocktail Lab change | Low | High | Phase 5 edits CI route + adds a new export to beverageContextService; Lab imports are unchanged | grep guard; Lab tests | revert export/route |
| Accidental Event Builder change | Low | Med | no event files touched | grep guard | revert |
| Fake taste values | Low | High | only deterministic range from venue language; result stays null; no `0` defaults | no-fake-default tests | fix builder |
| Decimal/integer model conflict | Low | Med | decimal is *additional context*; integer model untouched | integer-model present test | revert |
| Venue DNA mutation by accident | Low | High | read-only DNA access (`getVenueIntelligence`); no writes | static guard | revert |
| Ledger stores misleading taste data | Low | High | store only computed target; result null; `missing_fields` honest | ledger tests | clear field |
| Build / test failure | Low | Med | additive, server-only + pure module | build, both test suites | revert |

## 9. Files Likely To Change In Phase 5

**Likely modified**
- `server.js` — `/api/ci/generate`: flag-gated compose of `venueContextText` (= `omer.text` + slim taste block) and enrich the existing ledger write with `taste_profile_target` (+ `explanation_basis`/`missing_fields`). Load venue DNA via existing `getVenueIntelligence`. **No change to `buildGenerationPrompt`.**
- `src/services/venueBridge/beverageContextService.js` — add the slim `formatTasteTargetPromptBlock(range, opts)` export (additive; pure).
- `src/config/featureFlags.js` — **no change** (reuse `ENABLE_VENUE_BEVERAGE_CONTEXT`).

**Likely test files**
- `scripts/test-beverage-intelligence-foundation.js` (formatter tests) and/or `scripts/test-fb-decision-ledger.js` (ledger taste_target).

**Docs**
- `docs/architecture/FNB_DECISION_LEDGER_FOUNDATION.md` (+ this plan) and the master-plan completion note.

**Must NOT be touched**
- `src/services/geminiCocktailAgent.js`, `src/services/cocktailService.js`, `src/features/bar/*` (Cocktail Lab).
- `src/services/eventCocktailMenuService.js`, `src/features/events/*` (Event Builder).
- `src/prompts/*` (Cocktail Lab prompts); the Cocktail Lab 25-field contract.
- The integer flavor model (`cocktailFlavorProfileUtils.js`).
- Any Venue DNA writer (`mergeVenueDna`, `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment` writes); any UI; any POS code.

## 10. Acceptance Criteria ("green")

- **Flag off → behavior byte-identical** to Phase 4 (prompt + response + ledger row).
- **Flag on → compact, bounded** taste-target block injected into the CI/Omer venue context (size-capped, no tables); ledger records the computed `taste_profile_target` only, `result` null, honest `missing_fields` when none resolves.
- **Integer flavor model intact**; no decimal output requested from Gemini.
- No UI; no POS; no Venue DNA mutation; no Cocktail Lab change; no Event Builder change; no third engine.
- `test:beverage`, `test:fb-ledger`, `npm run build`, `npm run hestia:check`, `node --check server.js` all pass.

## 11. Stop-and-Alert Conditions

Stop and report before/while implementing if:
- the output contract would need to change in a risky way (i.e., requesting decimal output becomes necessary to deliver value);
- the injected block cannot be kept compact/bounded (prompt size grows materially);
- flag-off byte-identity cannot be guaranteed;
- any Cocktail Lab or Event Builder file must be touched;
- any Venue DNA mutation is required;
- any fake/placeholder taste values would be needed (e.g., `0` defaults);
- any existing route response shape must change;
- any existing test must be weakened.

## 12. Final Recommendation

**Proceed to Phase 5 implementation, scoped to context-injection only** (no decimal output request), via the builder-preserving approach: append a slim, flag-gated decimal `target_taste_profile_range` block to the venue-context string the CI/Omer route already passes to `buildGenerationPrompt`, and record the computed target on the ledger. This makes the venue-aware Director smarter, keeps flag-off byte-identical, preserves the integer model and all contracts, and creates **no** new engine.

Defer decimal *output* (the produced drink’s 0.0–5.0 profile) to a later, separately-approved phase that adds prompt fields + `tasteProfileSchema` validation + graceful parse-failure handling.

---

*End of Phase 5 plan. No code, prompts, routes, services, UI, or live behavior were changed in producing this document.*
