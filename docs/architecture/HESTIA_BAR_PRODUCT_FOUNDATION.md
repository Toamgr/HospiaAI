# HESTIA Bar Product Intelligence Foundation

**Date:** 2026-05-13  
**Status:** Foundation layer complete — not wired to runtime.  
**Location:** `src/domain/hospitality/bar/`

---

## Purpose

`src/domain/hospitality/bar/` is the canonical bar product domain layer for HESTIA. It defines the vocabulary, schemas, pricing intelligence rules, calculation utilities, and data model map that all future bar costing features must reference before inventing new concepts.

This layer has **no runtime behavior**. It does not affect the current product experience. It does not drive purchasing, costing, automation, or reporting in the live application. It is a specification and calculation reference layer.

---

## File Map

| File | What it provides |
|---|---|
| `barProductCategories.js` | `BAR_PRODUCT_CATEGORIES` — 36 product types across spirits, liqueurs, fortified wine, aperitifs, produce, syrups, mixers, bitters, garnish. Each entry has default pour ml, ABV range, and storage type. |
| `barProductSchema.js` | `createBarProduct()` — factory for a canonical product record. `createPriceOutputCard()` — computed pricing view for UI rendering. |
| `barCalculationUtils.js` | Pure costing functions: `costPerMl`, `costPerPourWithSpillage`, `cocktailTotalCost`, `pourCostPercent`, `grossMargin`, `suggestedMenuPrice`, `missingDataScore`, oxidation risk, shelf life status, carbonation waste, labor costing. |
| `barConfidenceLevels.js` | `CONFIDENCE_LEVELS`, `DATA_STATUS`, `SOURCE_QUALITY`, `CONFIDENCE_RULES` — the complete pricing confidence and data quality classification system. |
| `barMissingDataMap.js` | `BAR_MISSING_DATA_MAP` — 25 documented data gaps with priority, collection method, and owner. A planning reference, not a runtime flag system. |
| `barOperationalRules.js` | Operational rules for bar product handling, ordering logic, and service constraints. |
| `barSubstitutionMatrix.js` | Product substitution relationships — what can replace what in a cocktail build when a product is unavailable. |
| `barProductMenuEngineering.js` | Menu engineering quadrant classification (Stars, Plowhorses, Puzzles, Dogs). `classifyMenu()`, `classifyMenuPosition()`, `contributionMargin()`, `grossMarginRatio()`, `menuAverageSalesCount()`. |
| `barProductSupplierMap.js` | `MARKET_SUPPLIER_CANDIDATES` — 7 research-derived Israeli market supplier candidates. All are market-reference only. See supplier rules below. |
| `barProductDataModelMap.js` | `BAR_DATA_MODEL_MAP` — future DB schema candidates for `bar_products`, `bar_product_prices`, `bar_suppliers`, `cocktail_recipes`, `cocktail_ingredients`. Includes migration notes. |
| `cocktailSchema.js` | Cocktail recipe schema and validation. |
| `cocktailPricingEngine.js` | Cocktail-level pricing engine — ingredient aggregation, cost targets, margin scoring. |
| `cocktailLabPricingAdapter.js` | Adapter between the cocktail lab UI and the pricing engine. |
| `venueBarBehaviorModels.js` | Venue-level bar behavior models and operational parameters. |
| `barProductSeed.placeholders.js` | Placeholder seed records for development — not real operational data. |
| `cocktailSeed.placeholders.js` | Placeholder cocktail seed records — not real operational data. |
| `index.js` | Barrel export — re-exports all of the above. |

---

## Pricing Rules

### No fake prices

Do not add invented prices, made-up cost estimates, or placeholder numbers that look like real venue data. Benchmark prices in the seed data are market research estimates; they are labeled as such and are not used silently for menu pricing or owner reports.

### Two valid price sources

| Source | Field | When it may be used for costing |
|---|---|---|
| Venue-entered invoice price | `actual_venue_price_nis` | Always — when `data_status: 'verified_source_backed'` |
| Market benchmark estimate | `benchmark_price_nis` | For orientation and planning only — never silently for menu pricing |

If neither is available, costing functions return `null`. Do not manufacture a fallback cost.

### Calculation utilities are pure

All functions in `barCalculationUtils.js` and `cocktailPricingEngine.js` are stateless. They accept explicit inputs and return `null` when inputs are missing. They must not:
- read from global state
- import seed data
- invent default prices or pour sizes
- silently fall back to a hardcoded assumption

---

## Supplier Candidate Rules

`barProductSupplierMap.js` contains `MARKET_SUPPLIER_CANDIDATES` — 7 research-derived Israeli market candidates. These are **not** HESTIA venue suppliers.

Every candidate carries:

```js
relationship_status: 'market_reference_only'
data_status: 'needs_validation'
confidence_level: 'low'
source_quality: 'unknown'
source_url: null
source_name: null
last_checked_date: null
can_drive_automation: false
can_drive_costing: false
can_appear_in_owner_reports: false
requires_human_validation: true
```

All operational fields (`assumed_coverage`, `assumed_delivery_days`, `assumed_lead_time_days`) are prefixed `assumed_` to make clear they are unverified research assumptions, not confirmed operational facts.

These candidates **must not**:
- drive purchasing or ordering decisions
- feed into costing or pour cost calculations
- appear in owner reports, briefings, or supplier recommendations
- be treated as confirmed venue relationships

A candidate becomes an active supplier record only after a human has validated the relationship and recorded it with `source_url`, `source_name`, and `last_checked_date`.

---

## Menu Engineering Rules

`barProductMenuEngineering.js` classifies cocktails and bar products into four quadrants (Stars, Plowhorses, Puzzles, Dogs) based on popularity index and gross margin ratio.

This classification:
- requires real sales count data and confirmed menu prices — it cannot run on placeholder data
- is not wired to any UI, hook, or report in the current build
- should be activated only when a venue has sufficient transactional data to compute meaningful averages

Do not surface menu engineering quadrants in any UI before real sales data exists.

---

## Data Model Rules

`barProductDataModelMap.js` describes future database table candidates. Tables marked `status: 'live'` already exist in SQLite via `server.js`:
- `verified_price_overrides` — live
- `verified_price_audit_log` — live

All other tables are `status: 'schema_only'`. They must not be created in `server.js` until explicitly requested and properly sequenced. The migration sequence documented in `BAR_DATA_MODEL_MIGRATION_NOTES` must be followed to avoid breaking FK integrity.

---

## Not Wired to Runtime

This layer is not imported by any hook, feature component, or service in the current build. It is a pure domain specification layer.

To wire any part of this layer into the runtime:
1. Confirm the feature is explicitly requested
2. Import only the specific exports needed — do not import the barrel `index.js` into feature components
3. Follow the hook-owns-state / features-own-UI architecture (see `HESTIA_PHASE_2_CHECKPOINT.md`)
4. Do not add costing automation that runs on unvalidated price data

---

## Future Use Cases

When ready, this layer will support:

| Use case | Files involved |
|---|---|
| Cocktail recipe costing in Cocktail Lab | `barCalculationUtils.js`, `cocktailPricingEngine.js`, `barConfidenceLevels.js` |
| Ingredient cost validation warnings | `barProductSchema.js`, `barMissingDataMap.js`, `barConfidenceLevels.js` |
| Inventory par level planning | `barProductCategories.js`, `barProductSchema.js`, `barProductDataModelMap.js` |
| Supplier intelligence and ordering | `barProductSupplierMap.js` (after human validation), `barProductDataModelMap.js` |
| Menu engineering quadrant view | `barProductMenuEngineering.js` (requires real sales data) |
| DB migration for bar products | `barProductDataModelMap.js` — migration sequence and FK notes |
| AI costing agent | All files — agent must respect confidence and data_status rules |
