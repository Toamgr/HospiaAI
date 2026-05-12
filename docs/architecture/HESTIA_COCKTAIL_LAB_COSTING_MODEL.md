# HESTIA Cocktail Lab Costing Model

## Current State (as of 2026-05-12)

`CocktailLabStudio.jsx` and `FoodCostTables.jsx` both contain an inline `COST_DB` — a hardcoded regex-to-NIS/ml lookup table:

```javascript
const COST_DB = [
  [/gin|vodka|rum|tequila|mezcal|whisky|whiskey|brandy|cognac|pisco|arak/, 0.19],
  [/premium|aged|xo|vsop|luxury|single malt|grand/, 0.35],
  [/vermouth|sherry|aperol|campari|dry vermouth|blanc vermouth/, 0.09],
  [/liqueur|triple|cointreau|chartreuse|amaro|coffee liqueur/, 0.22],
  ...
]
```

These are relative cost scores (NIS/ml), not actual product prices. They produce approximate costing for the Cocktail Lab's pricing suggestions.

**This code is not changed in Phase 2.** CocktailLabStudio.jsx remains untouched.

## Planned Integration (Phase 3)

The bar domain layer provides the infrastructure to replace `COST_DB` with actual product-aware costing.

### Step 1: Map COST_DB patterns to product_ids

Create a mapping table that links each `COST_DB` regex to a representative product from `barProductSeed`:

```javascript
// e.g. if ingredient name matches /gin|vodka|.../ → use average cost_per_ml from
//      vodka category products (vod-006, vod-007, vod-008) as the well default
```

### Step 2: Build product-aware `buildCostSheet()`

Replace the regex lookup with:

```javascript
import { costPerMl } from '../../domain/hospitality/bar/barCalculationUtils.js'
import { BAR_PRODUCT_SEED } from '../../domain/hospitality/bar/barProductSeed.placeholders.js'

function resolveIngredientCostPerMl(ingredientName, productId = null) {
  if (productId) {
    const product = BAR_PRODUCT_SEED.find(p => p.product_id === productId)
    if (product?.benchmark_price_nis) return costPerMl(product.benchmark_price_nis, product.bottle_size_ml)
  }
  // Fall back to COST_DB for unmapped ingredients
  return COST_DB_FALLBACK(ingredientName)
}
```

### Step 3: Wire into cocktail draft schema

When a cocktail is built in the Lab, store `product_id` references alongside ingredient names. This enables:
- Automatic pour cost recalculation when supplier prices update
- Direct linkage to Bottle Prices data
- Consistent costing across the entire cocktail portfolio

### Step 4: Replace FoodCostTables

`FoodCostTables.jsx` has an identical copy of `COST_DB` — remove duplication by importing `barCalculationUtils` after Step 2 is complete.

## Why Not Change It Now

The `COST_DB` approach produces directionally correct estimates sufficient for the Cocktail Lab's current purpose. Changing it requires:
1. Migrating all existing draft cocktails to include `product_id` references
2. Deciding what to show when a product has no verified price
3. Handling the transition period where some ingredients are mapped and others aren't

This is a separate, deliberate migration — not a side effect of any other change.

## Pricing Target Constants

Current Cocktail Lab pricing uses:
- Standard price = total_cost / 0.22 (22% pour cost)
- Luxury price = total_cost / 0.16 (16% pour cost)

The `cocktailPricingEngine.js` in the bar domain supports per-venue-type targets. When the costing migration happens, the Lab should accept a venue type parameter and derive targets from `VENUE_TARGET_COST`.
