# Beverage Context Regression Audit

> Audit date: 2026-06-17
> Scope: regression/breakage review after the Venue Beverage Context integration into the Cocktail Lab first-pass prompt path.
> Method: git diff review, static search, call-path tracing, and running the repo's own checks. No features added, no fixes implemented (nothing required one).

---

## 1. Executive Summary

**Nothing appears broken.** The integration is additive, narrowly scoped, and dormant by default.

- All venue-context code is confined to **3 files** (`featureFlags.js`, `beverageContextService.js`, `geminiCocktailAgent.js`). No unrelated or protected behavior changed.
- The **Event Cocktail Menu Builder was not touched** (absent from the diff; verified by source and tests).
- The existing **Cocktail Lab output contract (25 `EXPECTED_FIELDS`) is unchanged** — no field removed or renamed.
- With the flag **OFF (default)** the first-pass prompt is **byte-identical by construction** (the new interpolation renders `''`), and test-verified equal to baseline even when venue data is passed.
- The live caller (`CocktailLabStudio.jsx`) passes **no** venue params, so the feature is inert in production today.
- Kosher and zero-proof remain **conditional/default-off** (gate file `cocktailKnowledgeBase/index.js` unchanged).
- Checks run green: `npm run test:beverage` → **106/106**, `npm run build` → PASS, `npm run hestia:check` → Build PASS, no FAIL rows.

Risk level overall: **none/low** (one informational note about Node-ESM extension fix; no action required).

---

## 2. Files Reviewed

| File | Why |
|---|---|
| [src/services/geminiCocktailAgent.js](../../src/services/geminiCocktailAgent.js) | Integration point — `buildCocktailPrompt`, `generateGeminiCocktailProposal`, new helpers `buildVenueContextBlock`/`isDevLogging`. |
| [src/config/featureFlags.js](../../src/config/featureFlags.js) | Flag + resolver `isVenueBeverageContextEnabled`, `readEnvBoolean`. |
| [src/services/venueBridge/beverageContextService.js](../../src/services/venueBridge/beverageContextService.js) | `buildVenueBeverageContext` adapter + `formatVenueBeveragePromptBlock` formatter. |
| [src/prompts/geminiCocktailPrompts.js](../../src/prompts/geminiCocktailPrompts.js) | Confirm only the mojibake fix changed; `EXPECTED_FIELDS` contract intact. |
| [src/services/api/client.js](../../src/services/api/client.js) | The `systemConfig.js` import-extension change — confirm no runtime impact. |
| [src/services/cocktailService.js](../../src/services/cocktailService.js) | `requestCocktailProposal` — caller of `generateGeminiCocktailProposal`. |
| [src/features/bar/CocktailLabStudio.jsx](../../src/features/bar/CocktailLabStudio.jsx) | Live UI caller — confirm payload shape. |
| [src/services/eventCocktailMenuService.js](../../src/services/eventCocktailMenuService.js) | Confirm Event Builder untouched (count enforcement, replacement). |
| [src/domain/hospitality/bar/cocktailKnowledgeBase/index.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/index.js) | Confirm kosher/zero-proof gates unchanged. |
| [package.json](../../package.json) | Confirm only the `test:beverage` script was added. |

---

## 3. Changed Runtime Paths

**Changed (one path only):** Cocktail Lab **first-pass** prompt construction — `generateGeminiCocktailProposal(...)` (non-compact branch) → `buildCocktailPrompt(...)`. A compact venue block is interpolated **before** the knowledge/pricing context **only when** the flag is on AND venue data is present; otherwise it renders `''`.

**Untouched / verified inert:**
- `buildCompactRevisionPrompt(...)` (revision path) — not wired (confirmed in `generateGeminiCocktailProposal` line ~1172–1175, comment present).
- `consultGeminiCocktailDirection(...)` / `buildDirectorConsultationPrompt(...)` — signature and body unchanged (no venue params).
- Event Cocktail Menu Builder (`eventCocktailMenuService.js` and all `src/features/events/**`) — not in the diff.
- The existing integer flavor model (`cocktailFlavorProfileUtils.js`) and the event `flavor_map` — unchanged.
- The live caller `CocktailLabStudio.jsx:929` calls `requestCocktailProposal({ agentPrompt, form, approvedCocktails, cocktailDrafts, menuAnalysis, variation, previousProposal })` — **no venue params**, so the new code path is dormant in the running app.

---

## 4. Feature Flag Verification

Flag resolver in `featureFlags.js` → `isVenueBeverageContextEnabled()`:
- **Resolution order (verified by code + tests):** `globalThis.__HESTIA_FLAGS__.ENABLE_VENUE_BEVERAGE_CONTEXT` (runtime override) → `import.meta.env.VITE_ENABLE_VENUE_BEVERAGE_CONTEXT` (Vite) → `process.env.ENABLE_VENUE_BEVERAGE_CONTEXT` (Node) → static `FEATURE_FLAGS.venueBeverageContext` (default `false`). Each tier wrapped in `try/catch` so neither browser nor Node throws.
- **Default OFF:** `FEATURE_FLAGS.venueBeverageContext = false`; test `flag defaults OFF` passes.

Behavior matrix (all test-verified in `scripts/test-beverage-intelligence-foundation.js` §8):

| Flag | Venue data | Result |
|---|---|---|
| OFF | none | baseline prompt |
| OFF | venueDNA passed | **identical to baseline** (`offWithVenue === baseline`) — venue data ignored |
| ON | none | **identical to baseline** (`onNoVenue === baseline`) |
| ON | valid venueDNA | only the compact venue block injected; schema contract + manager prompt preserved; length grows by block only |

Byte-identical claim: when the flag is off, `buildVenueContextBlock` returns `''`, so the template interpolation `${venueContextBlock ? ... : ''}` yields `''`. The rest of the template content is unchanged from pre-integration; the only other edit was capturing the literal into `const prompt` and returning it. Therefore the off-state output is byte-identical by construction.

---

## 5. Cocktail Lab Regression Review

- **First-pass generation:** intact. Optional params are appended with `= null` defaults; existing callers (which pass none) are unaffected. Verified by tracing `CocktailLabStudio → requestCocktailProposal → generateGeminiCocktailProposal → buildCocktailPrompt`.
- **Compact revision path:** unchanged — `buildCompactRevisionPrompt` receives no venue params.
- **JSON repair / fallback:** unchanged — `ensureFullProposalPayload`, `repairIncompleteIngredientPayload`, `buildFallbackFullProposal`, and `createFallbackCocktailProposal` (in `cocktailService.js`) are not in the diff.
- **Pricing context:** unchanged — `hasPricingSignals` / `getPricingContextSummary` injection still present and **still injected after** the venue block (order preserved: venue → knowledge → pricing → previous → variation).
- **Knowledge injection:** unchanged — `buildKnowledgeContext` call and ordering preserved.
- **Kosher conditional:** unchanged — `index.js` gate (`isKosherActive`, `t.kosher`, `t.passover`) not modified; test confirms neutral prompt injects no kosher rules and the injected venue block adds none.
- **Zero-proof conditional:** unchanged — `t.zeroProof` gate in `index.js` intact.
- **ml recipe enforcement:** unchanged — `hasCompleteIngredientSet`, `validateResponseSchema`, and the `ingredientsMl` object contract are untouched.
- **method/glass/ice/garnish preservation:** unchanged — `normalizeCocktailProposal` / `mapGeminiResponseToProposal` not modified.

> Note: live AI generation (`/api/gemini`) was **not** executed in this audit (requires network/keys). The prompt-builder paths are verified deterministically; end-to-end generation against Gemini still warrants one manual smoke test before release (see §10).

---

## 6. Event Builder Regression Review

- **Source untouched:** `git diff --name-only` shows no `event` files. `eventCocktailMenuService.js` and `src/features/events/**` are unmodified.
- **Cocktail count enforcement:** present — `eventCocktailMenuService.js:435–436` (`parsed.cocktails.length !== expectedCount` → throws "… were requested. Retrying.").
- **Single cocktail replacement:** present — `replaceEventCocktail(...)` at `eventCocktailMenuService.js:493`.
- **Event-specific menu DNA:** `eventMenuDNA.js` unchanged.
- **No Venue Beverage Context references:** test §9 asserts the event service contains no `beverageContextService`, no `venue_beverage_context`, and no `ENABLE_VENUE_BEVERAGE_CONTEXT` — all pass.

---

## 7. Output Contract Safety

`EXPECTED_FIELDS` in `geminiCocktailPrompts.js` is unchanged (the file's only diff is the two `manager's` mojibake fixes). All 25 fields remain, including:

`directorConversationReply, requestAssessment, cocktailName, concept, menuRole, strategicRead, hardScores, strategicFit, menuConflictWarnings, ingredientsMl, method, glassware, ice, garnish, prepNotes, guestDescription, bartenderScript, balanceReasoning, operationalReasoning, costTier, practicalityScore, complexityScore, riskNotes, substitutions, whyThisDeservesMenuSpace`

The injected JSON schema literal inside `buildCocktailPrompt` (the strict-JSON keys the model must return) is unchanged — test verifies `"ingredientsMl"` and `"whyThisDeservesMenuSpace"` still appear in the flag-on prompt. **No field removed or renamed.** The decimal taste profile remains foundation-only and is **not** part of any output contract.

---

## 8. Prompt Size and Prompt Content Safety

- **Size impact (measured by dev logging during tests):** base first-pass prompt ~**15,971 chars**; with venue block injected ~**16,885–17,203 chars** → block ≈ **+914 to +1,232 chars (~6–8%)**. Test caps the block at **< 1,200 chars**.
- **No bloat:** the block contains only the agreed compact fields. Test asserts it does **not** contain full classic tables (`old fashioned|negroni` absent), and by construction it never injects ingredient-impact, micro-adjustment, or research tables.
- **No leakage:** the formatter emits no hidden chain-of-thought, no fake sales/tasting data, and no fabricated venue data — missing fields are surfaced honestly as "Unknown (do not invent)" and assumptions are capped to 2 lines. The block also instructs the model not to show the guest a technical taste explanation by default.
- **Ordering preserved:** venue → knowledge → pricing → previous-summary → variation. Only the venue block is new; everything else keeps its prior position.

---

## 9. Tests and Commands Run

| Command | Result |
|---|---|
| `npm run test:beverage` | **106 passed, 0 failed** (foundation + formatter + flag-gated injection + kosher-off + event-untouched guards) |
| `npm run build` | **PASS** — vite build completed, ~3.5–4.4s (only the pre-existing chunk-size + plugin-timing warnings) |
| `npm run hestia:check` | **Build PASSED**; no `FAIL`/`MISSING` rows (the only `FAIL` text is the legend line; remaining `WARN`s are pre-existing employee-area phase markers unrelated to this change) |
| Static search (`ENABLE_VENUE_BEVERAGE_CONTEXT`, `venueBeverageContext`, `buildVenueBeverageContext`, `formatVenueBeveragePromptBlock`, `buildVenueContextBlock`) | Confined to the 3 intended files only |
| Static search (`EventCocktailMenu`, `cocktail-menu`, `generateEventMenu`, `replaceEventCocktail`, `eventMenuDNA`) | No venue-context references; event files absent from diff |
| `git diff` review | 5 files, all expected; no unrelated changes |

> All results above were produced by actually running the commands in this audit session.

---

## 10. Risks Found

- **Blocker:** none.
- **High:** none.
- **Medium:** none.
- **Low:**
  - `src/services/api/client.js` import changed from `'../../config/systemConfig'` to `'../../config/systemConfig.js'`. This is an ESM-correctness fix (Vite tolerated the extensionless form; Node ESM did not, which blocked unit-testing the agent). The Vite build passes, confirming no browser-runtime impact — but a manual browser smoke test of an authenticated API call is the only way to be 100% certain at runtime. **Risk assessed low; build-verified.**
  - End-to-end Gemini generation was **not** exercised (no network/keys in audit). The prompt-builder logic is deterministically verified; one manual "generate a cocktail" smoke test in the running app is still recommended before release. **Uncertainty noted, not a known break.**
- **None / informational:**
  - `isDevLogging()` correctly returns `false` in a production build (`import.meta.env.DEV` false; `process` undefined in browser, guarded). Logging additionally only fires when a block is injected, which never happens in the current live path. No production log spam.

---

## 11. Required Fixes

**None.** No regression was found that requires a fix. No fixes were implemented during this audit.

---

## 12. Recommended Next Step

The regression audit is **green**. Proceed with the previously planned step: wire the Cocktail Lab call site (`CocktailLabStudio.jsx` → `requestCocktailProposal` → `generateGeminiCocktailProposal`) to pass the active venue's DNA/profile **only when the flag is on**, behind the same gate, and perform one manual end-to-end "generate a cocktail" smoke test in the running app (flag off and flag on) to confirm live behavior. Keep the Event Cocktail Menu Builder as second priority.

---

*End of regression audit. Inspections and command results above were performed in this session; no source files were modified to produce this report.*
