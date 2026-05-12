# HESTIA Verified Supplier Price Ingestion

## What This Is

A formal process for promoting a product from `data_status: 'benchmark_estimate'` to
`data_status: 'verified_source_backed'` and `confidence_level: 'high'`.

Until this process runs for a product, HESTIA always uses `benchmark_price_nis` for
costing — even if `actual_venue_price_nis` is somehow present on the product object.
The price preference logic gates on `data_status === 'verified_source_backed'`.

---

## Why Benchmark Prices Are Never Overwritten

`benchmark_price_nis` is the market reference established at product creation.
It enables:
- Margin delta display (verified price vs. market benchmark)
- Reverting to market reference if a supplier relationship ends
- Historical comparison across products

`applyVerifiedPriceUpdate()` will never overwrite `benchmark_price_nis`.
It writes to `actual_venue_price_nis` instead.

---

## What Counts as a Verified Source

Only these `source_type` values are accepted:

| source_type                      | Description                                      |
|----------------------------------|--------------------------------------------------|
| `invoice`                        | Physical or digital supplier invoice             |
| `supplier_quote`                 | Formal written quote from supplier               |
| `supplier_catalog`               | Official printed or PDF catalog with prices      |
| `direct_supplier_confirmation`   | Written confirmation from supplier contact       |

These are explicitly rejected (validation will error):

- `google`, `web search`, `memory`, `estimate`, `benchmark`
- Any empty string or missing value

---

## Required Fields

Every verified price update must include all of the following:

| Field                    | Type      | Notes                                                     |
|--------------------------|-----------|-----------------------------------------------------------|
| `product_id`             | string    | Must exist in BAR_PRODUCT_SEED                            |
| `actual_venue_price_nis` | number    | Positive, in NIS; warn if > ₪5,000                        |
| `supplier_name`          | string    | Non-empty                                                 |
| `source_type`            | string    | Must be one of the four approved values above             |
| `source_reference`       | string    | Invoice number, quote ID, catalog page, etc.              |
| `last_verified_at`       | string    | ISO date string (e.g. `"2026-05-12"`)                     |
| `vat_included`           | boolean   | Explicit `true` or `false` — `null` is rejected           |
| `verified_by`            | string    | Name of the person who confirmed the price                |

Optional fields (stored if provided, `null` otherwise):

| Field               | Type   | Notes                              |
|---------------------|--------|------------------------------------|
| `invoice_number`    | string | Invoice doc number if source is invoice |
| `invoice_date`      | string | ISO date of the invoice            |
| `store_name`        | string | Physical store if purchased retail |
| `supplier_contact`  | string | Contact name at supplier           |
| `notes`             | string | Any free-text provenance note      |

---

## How to Apply an Update

```js
import { applyVerifiedPriceUpdate } from '../domain/hospitality/bar/verifiedPriceIngestion.js'

const { product: updatedProduct, validation } = applyVerifiedPriceUpdate(originalProduct, {
  product_id: 'gin-005',
  actual_venue_price_nis: 189,
  supplier_name: 'ACME Spirits Ltd',
  source_type: 'invoice',
  source_reference: 'INV-2026-0442',
  last_verified_at: '2026-05-12',
  vat_included: true,
  verified_by: 'Tal Millo',
  invoice_number: '0442',
  invoice_date: '2026-05-10',
  store_name: null,
  supplier_contact: 'Roni Cohen',
  notes: null,
})

if (!validation.valid) {
  console.error(validation.errors)
} else {
  // persist updatedProduct to your store
  if (validation.warnings.length) console.warn(validation.warnings)
}
```

The returned `updatedProduct` is a new object — the original is not mutated.

---

## Validation Only (Without Applying)

```js
import { validateVerifiedPriceUpdate } from '../domain/hospitality/bar/verifiedPriceIngestion.js'

const result = validateVerifiedPriceUpdate(candidateUpdate)
// result.valid          — boolean
// result.errors         — string[] (empty if valid)
// result.warnings       — string[] (non-blocking, present even if valid)
// result.normalized_update — populated only when valid === true
```

---

## Dummy Example — DO NOT USE

The following is a synthetic example for documentation purposes only.
None of these values represent real products, invoices, or suppliers.

```js
// DOCUMENTATION EXAMPLE ONLY — NOT REAL DATA
{
  product_id: 'gin-005',
  actual_venue_price_nis: 189,
  supplier_name: 'Example Spirits Supplier',
  source_type: 'invoice',
  source_reference: 'INV-EXAMPLE-0001',
  last_verified_at: '2026-05-12',
  vat_included: true,
  verified_by: 'Example User',
}
```

---

## Example Invalid Update and Why It Fails

```js
const invalid = {
  product_id: 'gin-005',
  actual_venue_price_nis: 189,
  supplier_name: 'Google Search',     // ← not a supplier name
  source_type: 'google',              // ← rejected source type
  source_reference: '',               // ← empty string — required
  last_verified_at: 'last week',      // ← not a valid ISO date
  vat_included: null,                 // ← must be boolean, not null
  verified_by: '',                    // ← empty string — required
}
const { valid, errors } = validateVerifiedPriceUpdate(invalid)
// valid: false
// errors: [
//   "source_type 'google' is not an approved verified source.",
//   "source_reference is required.",
//   "last_verified_at must be a valid ISO date string.",
//   "vat_included must be a boolean (true or false).",
//   "verified_by is required.",
// ]
```

---

## Effect on the Rest of the System

**Bottle Prices (`BottlePrices.jsx`):**
`createPriceOutputCard()` uses `actual_venue_price_nis` for costing only when
`data_status === 'verified_source_backed'`. Otherwise it falls back to `benchmark_price_nis`.
The card always shows both values in the UI so staff can see the delta.

**Cocktail Lab costing (Priority 0):**
When a recipe ingredient is linked to a product via `product_id`, the adapter's
Priority 0 resolver now applies the same gating logic — verified products cost at
their invoice price; unverified products cost at benchmark.
The returned `confidence` and `data_status` on each cost row reflect the product's
actual values, not hardcoded `'medium'` / `'benchmark_estimate'`.

**Seed file (`barProductSeed.placeholders.js`):**
The seed is never modified at runtime. Apply updates to an in-memory copy or
your persistence layer, then re-read. The seed remains the source of truth for
benchmarks and product metadata.

---

## Rules for Contributors

1. Never call `applyVerifiedPriceUpdate` with invented, estimated, or web-sourced prices.
2. Never set `data_status: 'verified_source_backed'` or `confidence_level: 'high'` directly on a product object — always go through `applyVerifiedPriceUpdate`.
3. Never overwrite `benchmark_price_nis`.
4. Never pass a `source_type` that is not in `APPROVED_SOURCE_TYPES`.
5. Treat `validation.warnings` seriously — an unusually high price or size mismatch is a signal to re-check the source document.
