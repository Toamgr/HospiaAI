# HESTIA Beverage Intelligence — Foundation Layer

> Created: 2026-06-17
> Source of truth: [docs/audits/BEVERAGE_INTELLIGENCE_CURRENT_STATE_AUDIT.md](../audits/BEVERAGE_INTELLIGENCE_CURRENT_STATE_AUDIT.md)
> Status: **additive foundation only — not wired into live generation.** Nothing in Cocktail Lab or the Event Cocktail Menu Builder was changed.

This is the first safe step from *"Cocktail Intelligence exists"* to *"Venue DNA can guide Beverage Intelligence."* It adds structured, independently-testable knowledge modules and a Venue→Beverage adapter, without touching the working output contracts, the existing flavor models, or kosher behavior.

---

## 1. What was added

### Part A — Mojibake fix
- [src/prompts/geminiCocktailPrompts.js](../../src/prompts/geminiCocktailPrompts.js): fixed two corrupted apostrophes (`managerג€™s` → `manager's`) inside the live system prompt. No change to prompt meaning.

### Part B — Structured beverage knowledge modules
All new, pure, deterministic, no fabricated data. Placed in the existing bar domain layer (`src/domain/hospitality/bar/`).

| File | Purpose |
|---|---|
| [tasteProfileSchema.js](../../src/domain/hospitality/bar/tasteProfileSchema.js) | **Decimal taste profile system.** 10 dimensions (`acidity, sweetness, bitterness, salinity, umami, aroma_intensity, body, texture, finish_length, alcohol_heat`) on a **0.0–5.0 one-decimal** scale. Builders/validators: `createTasteProfile`, `validateTasteProfile`, `clampTasteScore`, `roundToOneDecimal`, `emptyTasteProfile`, `mergeTasteRanges`, `rangeMidpointProfile`. Missing dims are `null` (never a fake 0). |
| [classicTasteCalibration.js](../../src/domain/hospitality/bar/classicTasteCalibration.js) | **Classic taste calibration.** Decimal taste anchors for 19 core classics (Daiquiri, Margarita, Negroni, Old Fashioned, Martini, Paloma, Aperol Spritz, Espresso Martini, Whiskey Sour, Mojito, Gimlet, Manhattan, French 75, Penicillin, Mai Tai, Piña Colada, Paper Plane, Cosmopolitan, Boulevardier). Marked `human_reference_estimate` — orientation, not lab data. |
| [cocktailFamilyRatios.js](../../src/domain/hospitality/bar/cocktailFamilyRatios.js) | **Cocktail family ratio logic.** Structured templates (structure, reference ratio, reference ml, method, dilution, balance logic, taste tendency) for Sour, Collins, Highball, Old Fashioned, Negroni, Martini, Spritz, Flip/Creamy, Tropical/Tiki, Coffee/Espresso. |
| [ingredientTasteImpact.js](../../src/domain/hospitality/bar/ingredientTasteImpact.js) | **Ingredient taste impact cards.** 26 core ingredients with direction/magnitude effects on the decimal dimensions plus a key operational/balance risk each. |
| [microAdjustmentPrediction.js](../../src/domain/hospitality/bar/microAdjustmentPrediction.js) | **Micro-adjustment prediction.** Predicted decimal deltas for ±2.5 ml citrus, ±2.5 ml syrup, ±5 ml modifier, +1 dash bitters, +1–3 drops saline, more/less dilution, carbonation changes, acid swaps, sweetener swaps. `predictCombinedDelta` sums several. |
| [venueTasteProfileMap.js](../../src/domain/hospitality/bar/venueTasteProfileMap.js) | **Venue DNA → target taste range mapping.** 10 venue archetypes (classic luxury, warm Mediterranean, young nightlife, fine dining, event/wedding, beach bar, hotel bar, premium neighborhood bar, not pretentious, high-end but accessible) → target taste **ranges** + beverage direction + emotional register. `resolveVenueTasteTarget` matches venue language and merges overlapping archetypes. |

### Part C — Venue Beverage Context Adapter
- [src/services/venueBridge/beverageContextService.js](../../src/services/venueBridge/beverageContextService.js) — `buildVenueBeverageContext({ venueDNA, venueProfile })`. Follows the existing `*ContextService` convention in `venueBridge/`. Returns:
  ```
  { venue_beverage_context: {
      venue_type, owner_belief_summary, emotional_register, target_guest_summary,
      price_positioning, service_style, operational_constraints,
      target_taste_profile_range, recommended_beverage_direction, explanation_basis,
      _missing_fields[], _assumptions[] } }
  ```
  - Missing Venue DNA fields → field is `null`, listed in `_missing_fields`, with an explicit note in `_assumptions`. **Never fabricates venue data** and stays venue-agnostic when type is unknown.
  - `explanation_basis` records matched archetypes, matched keywords, the signals used, and a `data_basis` tag — the seed for answering *"why this drink / why this profile?"* on demand.

### Part D — Verification
- [scripts/test-beverage-intelligence-foundation.js](../../scripts/test-beverage-intelligence-foundation.js) — 80 deterministic assertions, no test framework, exits 0/1 (matches `test-hospitality-dna.js`). Added `npm run test:beverage`.

---

## 2. What was NOT wired yet (deliberate)

- **No change to generation.** `geminiCocktailAgent.js` and `eventCocktailMenuService.js` do not import any new module. Prompts are unchanged except the mojibake fix.
- **Existing flavor models untouched.** `cocktailFlavorProfileUtils.js` (9-dim integer) and the event `flavor_map` remain authoritative for current UI/cost paths. The decimal system runs in parallel.
- **No UI.** No component renders the decimal profile, venue context, or calibration yet.
- **No server route / DB column.** Pure client/shared modules only.
- **Kosher unchanged.** Still conditional/default-off; the foundation never emits kosher content by default (guarded by a regression test).
- **Not added to `src/domain/hospitality/bar/index.js`.** Consistent with several existing bar modules (`cocktailFlavorProfileUtils`, `cocktailAdjustmentUtils`, `cocktailLabPricingAdapter`) that are imported directly. Avoids re-export name-collision risk. Import the new modules by path.

---

## 3. How it strengthens existing Cocktail Lab

- Gives the system a **calibrated reference set** and a **structured ratio/ingredient/adjustment vocabulary** the code can reason over — the missing pieces flagged in audit §11.
- Provides the **Venue DNA → target taste range** bridge that audit §7 identified as the single largest gap, in a form that can later be injected as a *small* prompt block (not the whole corpus).
- The adapter's `explanation_basis` makes the future *"why this profile?"* answer traceable to venue signals, matching the product rule that owners don't need taste explanations by default but HESTIA must explain on demand.
- All additive: zero risk to current generation, costing, or persistence.

---

## 4. Next safe integration step

Recommended order (each independently shippable):

1. **Read-only prompt injection (behind a flag).** Add a `buildVenueBeverageContext(...)` call site that produces a **compact** summary block (venue type, register, price, 1-line direction, and only the *named* target-range dimensions) and inject it into `buildCocktailPrompt` for **bar/restaurant** cocktails first. Keep it short — never paste full tables. Measure prompt size before/after.
2. **Calibration few-shot.** When a manager references a classic or a clear family, inject 1–2 calibrated decimal anchors from `classicTasteCalibration` instead of prose — small and high-signal.
3. **Decimal profile as parallel output (optional field).** Add an optional `taste_profile` to the proposal contract (additive, non-required) and surface it read-only in `CocktailLabStudio` alongside the existing radar.
4. **Target-vs-actual check.** Once 3 exists, compare the generated profile against the venue `target_taste_profile_range` with a tolerance band and show a gentle "within/over/under" note — no auto-rejection.
5. **On-demand explanation.** Use `explanation_basis` to answer "why this drink / why this taste profile?" as a separate, cheaper call — keeping the main prompt lean.

Then, and only then, extend the same pattern to the Event Cocktail Menu Builder (events are explicitly second priority).

---

## 5. Read-only Cocktail Lab Venue Context Injection (implemented 2026-06-17)

The first integration step from §4 is now built — **flag-gated, read-only, bar/restaurant Cocktail Lab only.**

### What was wired
- **Feature flag** `venueBeverageContext` added to [src/config/featureFlags.js](../../src/config/featureFlags.js), plus `isVenueBeverageContextEnabled()` which also honors the env flag **`ENABLE_VENUE_BEVERAGE_CONTEXT=true`** (Vite `VITE_ENABLE_VENUE_BEVERAGE_CONTEXT`, Node `process.env`, or a `globalThis.__HESTIA_FLAGS__` runtime override for tests). **Default: OFF.**
- **Formatter** `formatVenueBeveragePromptBlock(context)` added to [beverageContextService.js](../../src/services/venueBridge/beverageContextService.js) — renders a short, stable block from the adapter output, or `''` when there is no real venue signal.
- **Integration point:** [src/services/geminiCocktailAgent.js](../../src/services/geminiCocktailAgent.js) → `buildCocktailPrompt(...)` (the **first-pass** build path). It now accepts optional `venueDNA` / `venueProfile` / `venueBeverageContext`, builds the block via `buildVenueContextBlock(...)`, and injects it **before** the knowledge/pricing context. `generateGeminiCocktailProposal(...)` threads these optional params through. `buildCocktailPrompt` is now exported for testing.
- **Dev/test-only prompt-size logging:** one concise `[venue-beverage-context]` line, gated by `isDevLogging()` (never logs in a production build) and only when the block is actually injected.

### Injected block — example (FAKE placeholder data, illustration only)
```
Venue beverage context (use to make better first-pass recipe choices; do NOT show the guest a technical taste-profile explanation by default):
- Venue type: cocktail bar                      [EXAMPLE DATA — not a real venue]
- Price positioning: premium                    [EXAMPLE DATA]
- Emotional register: warmth                     [EXAMPLE DATA]
- Target guest: regulars who feel at home        [EXAMPLE DATA]
- Service style: fast but personal               [EXAMPLE DATA]
- Operational constraints: small back bar        [EXAMPLE DATA]
- Recommended beverage direction: bright citrus and herbal aperitivo profiles... [EXAMPLE DATA]
- Target taste profile range (0.0–5.0, only where known): acidity 2.0–3.8, bitterness 1.0–3.0, body 2.0–4.0
- Basis: matched venue archetype(s) Warm Mediterranean, High-end but accessible (venue_dna_archetype_match)
- Unknown (do not invent): umami, salinity       [honest gaps, when present]
- Assumptions in effect: emotional_register inferred from matched archetype(s)...
```
Measured size: the block is ~0.9–1.2 KB; first-pass prompt grows from **~15,971 chars → ~16,885–17,203 chars** when injected (≈ +6–8%). No full classic/ingredient/micro tables are ever pasted.

### What remains flag-gated / not implemented
- **OFF by default.** With the flag off — or with the flag on but no venue data supplied — the prompt is **byte-for-byte identical** to before (verified by test).
- **No caller is passing venue data yet.** The params exist and are threaded; wiring the Cocktail Lab hook/component to pass real venue DNA is a separate, later step (no UI obligation here).
- **Compact revision path untouched** (`buildCompactRevisionPrompt`) — first-pass only, by design.
- **Event Cocktail Menu Builder untouched** (regression-guarded by test).
- **No UI**, no decimal `taste_profile` output field yet, no target-vs-actual validation yet, no on-demand explanation surface yet (the adapter's `explanation_basis` is preserved as the seed for it).

### How to disable
It is already disabled by default. To be explicit: leave `FEATURE_FLAGS.venueBeverageContext = false` and do not set `ENABLE_VENUE_BEVERAGE_CONTEXT`. To turn it on for evaluation: set `ENABLE_VENUE_BEVERAGE_CONTEXT=true` (or `VITE_ENABLE_VENUE_BEVERAGE_CONTEXT=true` for the frontend build) and have the call site pass `venueDNA`/`venueProfile`.

### Next step
Wire the Cocktail Lab call site (hook/component → `requestCocktailProposal` → `generateGeminiCocktailProposal`) to pass the active venue's DNA/profile **only when the flag is on**, behind the same gate. Then add an optional read-only decimal `taste_profile` output field and a gentle target-vs-range note. Events remain second priority.

---

## 6. Verification commands

```bash
npm run test:beverage     # 106 assertions — taste scale, calibration, venue mapping, adapter,
                          #   prompt formatter, flag-gated Cocktail Lab injection, kosher-off,
                          #   Event Builder untouched
npm run build             # vite production build — confirms no breakage
npm run hestia:check      # full safety check (runs build internally)
```

> Note: a transitive Node-ESM fix was made so the agent is unit-testable — [src/services/api/client.js](../../src/services/api/client.js) now imports `systemConfig.js` with its explicit extension (no runtime change in the Vite build).
