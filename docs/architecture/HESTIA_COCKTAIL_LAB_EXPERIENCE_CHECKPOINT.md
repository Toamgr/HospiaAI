# HESTIA Cocktail Lab — Trust + Build Experience Checkpoint

**Date:** 2026-05-13
**Status:** Complete — live in CocktailLabStudio.

---

## What Was Done

Two features were shipped in a single session:

1. **Costing Honesty Fixes** — `cocktailLabPricingAdapter.js` + `CocktailLabStudio.jsx`
2. **Interactive Cocktail Build Experience** — `CocktailBuildExperience.jsx` + `cocktailBuildExperienceUtils.js`

Plus a supporting prompt tuning in `geminiCocktailPrompts.js` and `geminiCocktailAgent.js`.

---

## 1. Costing Honesty Fixes

### Problem

`buildCostSheet()` previously returned:
- `confidence_level: 'medium'` — hardcoded regardless of actual row mix
- `cost_status: 'benchmark_estimate'` — hardcoded regardless of actual row mix
- A static amber warning banner regardless of data quality

`CocktailLabStudio.jsx` displayed Standard and Luxury prices in gold as authoritative figures, and the Pour Cost traffic light fired regardless of data confidence.

### Fix — `cocktailLabPricingAdapter.js`

Three helper functions added before the main export:

| Function | Purpose |
|---|---|
| `computeConfidenceLevel(rows)` | Returns `'high'` if all rows are `verified_source_backed`, `'low'` if any row is `cost_db_estimate` or `operational_assumption`, otherwise `'medium'` |
| `computeCostStatus(rows)` | Returns `'all_verified'`, `'mixed'`, `'benchmark_estimate'`, `'cost_db_estimate'`, or `'unavailable'` from actual row mix |
| `computeWarnings(cost_status, ...)` | Returns context-specific warning strings — no static message |

`buildCostSheet()` now returns:
- `confidence_level` — computed, not hardcoded
- `cost_status` — computed, not hardcoded
- `missing_data_warnings` — source-aware, conditional
- `verified_count`, `benchmark_count`, `assumption_count`, `unavailable_count`, `total_cost_rows` — row counts for UI use

### Fix — `CocktailLabStudio.jsx`

| Display element | Before | After |
|---|---|---|
| Per-row confidence | Not shown | Colored dot + label: `verified` / `est.` / `rough est.` |
| Pour Cost % traffic light | Always colored | Colored only when `confidence_level === 'high'`; otherwise neutral |
| Standard Price | Gold, no prefix | Amber + `~` prefix when not high confidence |
| Luxury Price | White, no prefix | Amber + `~` prefix when not high confidence |
| Labor row | No qualification | Appends `assumption — 50 NIS/hr × 2 min` below the value |
| Warning banner | Static amber | Source-aware `CostStatusBanner` component — green for all-verified, amber for benchmark, orange for rough assumptions |

### Data safety

- `verified_source_backed` is only set by `verifiedPriceIngestion.js` after 8-field provenance validation. Nothing else can produce `confidence_level: 'high'`.
- No costing values are manufactured. If a row cannot be priced, it is excluded from totals.

---

## 2. Interactive Cocktail Build Experience

### Files

| File | Location | Purpose |
|---|---|---|
| `cocktailBuildExperienceUtils.js` | `src/features/bar/` | Four pure utility functions — no side effects, no fake data |
| `CocktailBuildExperience.jsx` | `src/features/bar/` | Interactive step-by-step build component |

### Utility functions (`cocktailBuildExperienceUtils.js`)

| Function | Input | Output |
|---|---|---|
| `normalizeCocktailBuildData(cocktail)` | Raw cocktail object (or null) | Normalized `{ name, ingredients, method, glassware, garnish, description }` |
| `inferBuildCompleteness(cocktail)` | Raw cocktail object | `{ level: 'full' \| 'partial' \| 'none', hasIngredients, hasMethod, hasGlassware, ... }` |
| `buildStepSequence(cocktail)` | Raw cocktail object | Ordered array of step objects — only from available data |
| `getBuildWarnings(cocktail)` | Raw cocktail object | Array of warning strings about missing fields |

### Step sequence rules

- **Glassware prep step**: always included. Uses glassware name if known, generic "Prepare your glass" if not.
- **Ice step**: only included when method contains a known keyword (`shake`, `stir`, `build`, `blend`). Never inferred from an unknown method.
- **Ingredient steps**: one per ingredient with `amountMl > 0`. Shows `qty unavailable` when quantity is missing — never invents a quantity.
- **Method step**: only included when `method` field is present. For known keywords, uses a short fixed instruction. For unrecognized method text, shows the raw method string (truncated with expand/collapse in the UI if > 120 chars).
- **Pour step**: only included when method is known. Derived from method keyword — never inferred.
- **Garnish step**: only included when `garnish` field is present.

### Component behavior by data state

| Data state | Behavior |
|---|---|
| No ingredients | `NoRecipeView` — "No Verified Build Sequence Yet" |
| Partial recipe | Partial-recipe notice banner; missing steps are omitted, not fabricated |
| Full recipe | All steps shown; glass visual fills with ingredient colors as user steps through |
| Unknown method | No ice step, no technique-specific pour step; generic "Combine and serve" step only |
| Missing quantity | Step detail says "Quantity is not specified for this recipe"; chip shows "qty unavailable" |

### Glass visual

- SVG-based, 4 shapes: coupe (default), highball, rocks, martini — selected from `glassware` field.
- Colored fill layers correspond to actual ingredients added so far, proportional to `amountMl`.
- `VISUAL_DEFAULT_ML = 30` is used for proportional display only when quantity is unknown — never shown as text.
- Unique `clipPath` ID per component instance via `useRef(Math.random())` to prevent SVG ID collisions.

### Integration into CocktailLabStudio

- Imported in `CocktailLabStudio.jsx`, rendered inside `CocktailResultView` as a collapsible panel.
- **Defaults closed** — `const [showBuild, setShowBuild] = useState(false)`.
- Non-blocking: does not affect generation, approval, save, or submit flows.
- Does not modify any cocktail data.
- `useEffect(() => setStepIndex(0), [cocktail])` resets to step 1 when a new cocktail is generated.

### Dependencies

- No external APIs.
- No video assets.
- No fake recipe data, fake prices, or fake quantities.
- Imports only from `cocktailBuildExperienceUtils.js` (same folder) — no hooks, no cross-domain state.

---

## 3. Gemini Prompt Tuning

### Problem

`methodToken()` in `cocktailBuildExperienceUtils.js` recognises five keywords (`shake`, `stir`, `build`, `blend`, `throw`). When Gemini returned the `method` field as a long descriptive sentence without a keyword, `methodToken` returned `'described'` and the raw method text was shown as the method step detail — potentially a large text block.

### Fix

**`src/prompts/geminiCocktailPrompts.js`** — added to `BEVERAGE_DIRECTOR_SYSTEM_PROMPT`:
> The method field must begin with or include one of these preparation keywords when the cocktail has a recognized technique: shake, stir, build, blend, throw. Example: "Shake with ice for 12–15 seconds, fine strain into a chilled coupe." A short descriptive method is acceptable only if the drink genuinely does not fit any of these five techniques — do not invent an unsupported technique.

**`src/services/geminiCocktailAgent.js`** — added to compact revision rules in `buildCompactRevisionPrompt` (which does not include `BEVERAGE_DIRECTOR_SYSTEM_PROMPT`):
> The method field must begin with or include one of: shake, stir, build, blend, or throw — when the cocktail has a recognized preparation technique.

### What did not change

- Cocktail object shape — `method` was already an existing field.
- Fallback proposal builder — already produced `'Shake...'` and `'Build...'` method strings.
- `normalizeCocktailProposal` — no changes.
- No model config changes.

---

## 4. Guardrails

The following behaviors must be preserved by any future work in Cocktail Lab:

| Guardrail | Location |
|---|---|
| Do not display benchmark or assumption costs as verified | `CocktailLabStudio.jsx` — `CostStatusBanner`, confidence dots |
| Do not suppress `confidence_level` or `cost_status` from cost display | `cocktailLabPricingAdapter.js` → `CocktailLabStudio.jsx` |
| Do not infer method, glassware, or technique as fact when field is missing | `cocktailBuildExperienceUtils.js` — `buildStepSequence` |
| Do not add fake prices, fake products, or fake recipe steps | Both files — `ingredientDisplayColor` is display-only and labeled as such |
| Do not wire external video or API services to the Build Guide | `CocktailBuildExperience.jsx` — no external imports |
| Preserve source/confidence labeling on any new cost display surface | `cocktailLabPricingAdapter.js` row shape |

---

## 5. Known Remaining Gaps

### Prompt guidance is not enforcement

The method keyword instruction in `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` is a prompt instruction, not a code guarantee. Gemini may still return a verbose method that contains the keyword mid-sentence rather than at the start. This is handled gracefully: `methodToken` uses `\bshake\b` etc. and matches anywhere in the string, so mid-sentence keywords are detected. A keyword at the start is preferred but not required for correct function.

If strict enforcement is needed later, add a one-liner to `normalizeCocktailProposal` in `geminiCocktailAgent.js`:
```js
method: normalizeMethodKeyword(normalizeValue(parsed.method)),
```
where `normalizeMethodKeyword` extracts the first recognised keyword and prepends it if not already at the start. This is a service-layer change and is not currently required.

### Method text truncation threshold

The expand/collapse threshold in `StepGuidanceCard` is 120 characters. This is appropriate for current Gemini output patterns. If the average method description length changes (e.g., prompt tuning makes them consistently shorter), the threshold can be raised or the feature removed entirely.

---

## File Summary

| File | Change type | What changed |
|---|---|---|
| `src/domain/hospitality/bar/cocktailLabPricingAdapter.js` | Modified | `computeConfidenceLevel`, `computeCostStatus`, `computeWarnings` added; `buildCostSheet` returns computed values + row counts |
| `src/features/bar/CocktailLabStudio.jsx` | Modified | `CONF_STYLE`, `CostStatusBanner`, per-row confidence dots, conditional price display, labor label, `showBuild` state, Build Guide panel |
| `src/features/bar/cocktailBuildExperienceUtils.js` | Created | Four pure utility functions |
| `src/features/bar/CocktailBuildExperience.jsx` | Created | Interactive step-by-step build component |
| `src/prompts/geminiCocktailPrompts.js` | Modified | Method keyword instruction added to `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` |
| `src/services/geminiCocktailAgent.js` | Modified | Method keyword instruction added to compact revision rules |
| `CLAUDE.md` | Modified | Cocktail Lab section added |
| `docs/architecture/HESTIA_COCKTAIL_LAB_EXPERIENCE_CHECKPOINT.md` | Created | This document |
