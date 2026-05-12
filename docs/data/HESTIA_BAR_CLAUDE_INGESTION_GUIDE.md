# HESTIA Bar — Claude Ingestion Guide

## Purpose

This guide explains how to feed bar product data to Claude for ingestion into HESTIA's bar product seed.

## When to Use

Use this guide when:
- A supplier quote arrives and needs to be recorded
- A venue invoice is received with new pricing
- New products need to be added to the database
- Existing benchmark prices need upgrading to verified status

## Input Format Claude Accepts

### Supplier quote
```
Brand: Hendrick's Gin
Product: Hendrick's Gin
Category: Gin
Bottle size: 700ml
ABV: 41.4%
Wholesale price (ILS): 162
Supplier: Diplomat Spirits Israel
VAT included: Yes
Date: 2026-06-01
```

### Invoice line item
```
Product: Patrón Silver 700ml
Units: 6
Unit price: 218 NIS (ex-VAT)
Supplier: [supplier name]
Invoice date: 2026-06-01
```

### Bulk CSV format (same as original data sheet)
Use the same column format as DATA SHEET HESTIA.csv:
`Brand | Product | Category | Subcategory | Size | Wholesale (ILS) | Pour 30ml cost | Tier | Fast-Moving | Storage | Common Usage`

## What Claude Will Produce

Claude will:
1. Find the matching product in `barProductSeed.placeholders.js`
2. Update: `actual_venue_price_nis`, `supplier_name`, `data_status`, `confidence_level`, `last_verified_at`, `vat_included`
3. Set `data_status` to `verified_source_backed` if a named supplier is confirmed
4. Add any missing data warnings to be removed
5. Report which fields changed and which still need validation

## Rules Claude Must Follow During Ingestion

- Never invent a supplier name — only record what was explicitly provided
- Never set `confidence_level: 'high'` without a named source
- Always record `last_verified_at` as the date of the source document, not today's date
- If VAT status is ambiguous, leave `vat_included: null` and flag it
- If a product is not in the seed, create it using `createBarProduct()` schema
- If a price conflicts with the benchmark by more than 20%, log the discrepancy in notes

## Adding New Products

Use the `createBarProduct()` function with these minimum required fields:

```javascript
createBarProduct({
  product_id: 'category-NNN',  // e.g., 'gin-016'
  brand: 'Brand Name',
  product_name: 'Full Product Name',
  category_id: 'gin',          // use BAR_PRODUCT_CATEGORIES keys
  bottle_size_ml: 700,
  benchmark_price_nis: 155,
  data_status: 'benchmark_estimate',
  confidence_level: 'medium'
})
```

## Category IDs Reference

See `src/domain/hospitality/bar/barProductCategories.js` for all valid category_id values.
Key categories: `vodka`, `gin`, `tequila`, `mezcal`, `whisky_scotch`, `whisky_bourbon`, `rum`, `arak`, `vermouth_dry`, `vermouth_sweet`, `liqueur_fruit`, `liqueur_amaro`, `aperitif_spirit`, `digestif`
