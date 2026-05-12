# HESTIA Bar Product Intelligence Foundation

## Purpose

This layer defines the canonical bar product domain vocabulary for HESTIA.

It is the single source of truth for:
- Bar product schemas and pricing data
- Calculation utilities (pour cost, costing, margin)
- Cocktail schemas and the pricing engine
- Operational rules governing bar service decisions
- Missing data registry and collection plan
- Substitution logic for 86'd products

## Usage Rules

1. **No runtime wiring** — this layer has no side effects. It exports pure functions, constants, and schema templates. Nothing here runs automatically.
2. **Feature components read this layer via imports** — `BottlePrices.jsx` and future costing UIs import from here.
3. **CocktailLabStudio.jsx is not yet wired** — the existing `COST_DB` in Cocktail Lab remains unchanged. The connection point is documented below.
4. **Do not invent supplier data** — if a product has no verified price, it surfaces as `benchmark_estimate`. Show the warning; do not fabricate a source.

## Files

| File | Purpose |
|------|---------|
| `barConfidenceLevels.js` | CONFIDENCE_LEVELS, DATA_STATUS, SOURCE_QUALITY constants and rules |
| `barProductCategories.js` | 30+ category objects with default pour ml and storage |
| `barProductSchema.js` | Product schema template + `createPriceOutputCard()` |
| `barCalculationUtils.js` | 18 pure costing functions (costPerMl, margins, oxidation, etc.) |
| `cocktailPricingEngine.js` | `calculateCocktailPricing()` — full cocktail costing with labor defaults |
| `barProductSeed.placeholders.js` | 89 products from CSV — all `benchmark_estimate` / `medium` confidence |
| `barOperationalRules.js` | 13 operational rules (shelf life, cost control, data quality) |
| `barMissingDataMap.js` | 25 data gap registry entries with collection methods |
| `barSubstitutionMatrix.js` | 12 substitution groups for 86'd products |
| `cocktailSchema.js` | Cocktail and ingredient schema templates |
| `cocktailSeed.placeholders.js` | 3 example cocktails demonstrating schema — clearly marked as placeholders |
| `venueBarBehaviorModels.js` | 8 venue type models with target pour cost % |
| `index.js` | Barrel export |

## Key Formulas

**Pour cost with spillage (confirmed from CSV):**
```
cost_per_30ml = (wholesale_price / bottle_size_ml) × 30 × 1.05
```
The 1.05 factor = 5% spillage built into every bar pour.

**Cocktail production cost:**
```
total = ingredient_cost + labor_cost + (ingredient_cost × waste_buffer_pct)
```
Default: labor = 1.67 NIS (50 NIS/hr × 2 min) — operational_assumption, needs venue validation.

**Suggested menu price:**
```
suggested_price = total_production_cost / target_cost_percentage
```
Default target: 22% (upscale restaurant model).

## Connecting Cocktail Lab (future step)

`CocktailLabStudio.jsx` currently uses an inline `COST_DB` (regex → NIS/ml) and `buildCostSheet()`. These produce relative estimates using hardcoded scores, not actual product prices.

The connection plan:
1. Map each `COST_DB` regex pattern to a `product_id` in `barProductSeed.placeholders.js`
2. Replace `buildCostSheet()` calls with `cocktailIngredientCost()` + `calculateCocktailPricing()`
3. Keep `COST_DB` as a fallback for ingredients not yet in the seed database

Do not make this change until explicitly approved — `CocktailLabStudio.jsx` is not touched in Phase 2.

## Data Confidence Model

```
verified_source_backed → confidence: high   → costing_eligible: true
benchmark_estimate      → confidence: medium → costing_eligible: true (with warning)
operational_assumption  → confidence: low    → costing_eligible: false
needs_validation        → confidence: low    → costing_eligible: false
unavailable             → confidence: unknown → costing_eligible: false
```

All 89 seed products are `benchmark_estimate` / `medium`. They can be used for directional costing but must display the standard warning in UI.
