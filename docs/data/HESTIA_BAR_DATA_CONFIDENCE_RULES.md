# HESTIA Bar Data Confidence Rules

## Confidence Hierarchy

```
verified_source_backed  →  confidence: high    →  costing: ✓  no warning
benchmark_estimate      →  confidence: medium  →  costing: ✓  with warning
operational_assumption  →  confidence: low     →  costing: ✗  blocked
needs_validation        →  confidence: low     →  costing: ✗  blocked
unavailable             →  confidence: unknown →  costing: ✗  blocked + "Supplier data missing"
```

## UI Behavior by Status

### verified_source_backed (high confidence)
- Show pour cost breakdown without warnings
- Show supplier name and last verified date
- Green confidence badge in UI

### benchmark_estimate (medium confidence)
- Show pour cost breakdown
- Show amber warning: "Wholesale price is a benchmark estimate — not source-backed."
- Show amber confidence badge

### operational_assumption / needs_validation (low confidence)
- Block costing output
- Show: "Supplier data missing — needs validation."
- Show orange confidence badge
- Ordering recommendation: "Needs supplier validation"

### unavailable (unknown confidence)
- Block all costing output
- Show: "Supplier data missing — needs validation."
- Red confidence badge

## Standard Missing Data Warnings

All benchmark_estimate products display these warnings in BottlePrices UI:

1. "Wholesale price is a benchmark estimate — not source-backed."
2. "No supplier or store data available." (when supplier_name and store_name are both null)
3. "Price not verified against current market." (when last_verified_at is null)
4. "VAT status not confirmed." (when vat_included is null)

## Source Quality Tiers

| Source | Weight | Example |
|--------|--------|---------|
| official_supplier | 1.00 | Direct importer quote on letterhead |
| importer | 0.95 | Importer price list |
| venue_invoice | 0.90 | Actual venue purchase invoice |
| retailer | 0.75 | Physical store shelf price |
| price_comparison | 0.60 | Website price |
| expert_assumption | 0.40 | Bar manager estimate |
| unknown | 0.00 | No source identified |

## Rules That Cannot Be Overridden

1. **Missing price → block costing.** If both `benchmark_price_nis` and `actual_venue_price_nis` are null, no costing output is produced. Show "Supplier data missing — needs validation."
2. **`requiresBottlePricesAccess` checks before admin bypass.** Even admin users cannot see BottlePrices if they are not in the allowed list. The identity gate is fail-closed.
3. **Benchmark estimates must surface warnings.** There is no UI mode that silently hides the benchmark disclaimer.
4. **VAT unknown must be flagged.** Never assume VAT-inclusive or exclusive without confirmation.
