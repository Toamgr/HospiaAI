# HESTIA Bar Product Database Foundation

## Overview

The bar product intelligence layer provides a structured, confidence-aware foundation for all bar cost calculations in HESTIA.

It is not a live database — it is a code-level data layer that informs UI, costing engines, and eventually a Supabase schema.

## Current Data State (as of 2026-05-12)

| Category | Products | Data Status | Confidence |
|----------|----------|-------------|------------|
| Liqueurs / Digestifs / Vermouth / Aperitifs | 15 | benchmark_estimate | medium |
| Arak | 10 | benchmark_estimate | medium |
| Whisky / Bourbon | 14 | benchmark_estimate | medium |
| Gin | 15 | benchmark_estimate | medium |
| Tequila / Mezcal | 20 | benchmark_estimate | medium |
| Vodka | 15 | benchmark_estimate | medium |
| **Total** | **89** | — | — |

## What "Benchmark Estimate" Means

All 89 products carry `data_status: 'benchmark_estimate'`. This means:

- Prices derived from market research, retail observation, and industry knowledge
- No supplier quote received
- No venue invoice confirmed
- Directionally correct, but not safe for final menu pricing decisions
- All pour cost calculations will show a benchmark warning in UI

The benchmark estimate is **costing-eligible** (UI will show calculations) but **always flagged**.

## Pour Cost Formula

Confirmed from the source data sheet:

```
cost_per_30ml = (wholesale_price_nis / bottle_size_ml) × 30 × 1.05
```

The `1.05` factor represents 5% spillage/waste built into every bar pour. This is an operational assumption consistent with Israeli bar industry norms.

## How to Upgrade Data Quality

To move a product from `benchmark_estimate` to `verified_source_backed`:

1. Obtain a supplier or importer quote
2. Record: `supplier_name`, `actual_venue_price_nis`, `price_source`, `last_verified_at`
3. Update `data_status` to `verified_source_backed`
4. Update `confidence_level` to `high`
5. Clear the benchmark warning flags

## Priority Products for Verification

1. **Fast-moving products** (`fast_moving: true`) — affect daily pour cost most
2. **Ultra-premium tier** — Don Julio 1942, Clase Azul, Crystal Head — highest per-pour cost variance
3. **Arak category** — local market prices fluctuate; retail data may be unreliable
4. **Tequila/Mezcal** — import duties changed in 2025; benchmark prices may be outdated

## Files

- `src/domain/hospitality/bar/barProductSeed.placeholders.js` — all 89 products
- `src/domain/hospitality/bar/barProductSchema.js` — schema templates and `createPriceOutputCard()`
- `src/domain/hospitality/bar/barCalculationUtils.js` — all costing functions
- `src/domain/hospitality/bar/barMissingDataMap.js` — 25 data gap entries with collection methods
