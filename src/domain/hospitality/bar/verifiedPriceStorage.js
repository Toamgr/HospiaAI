// localStorage helpers for verified supplier price overrides.
//
// Key format: hospia.verified_prices.<product_id>
// Value:      JSON-serialised normalized_update (output of validateVerifiedPriceUpdate).
//
// Only validated normalized_update objects are written — never raw form input,
// full product objects, or seed data.
//
// All helpers fail safely: localStorage unavailability or corrupt JSON is
// caught and treated as "no override exists". Nothing here crashes the app.
//
// Phase 4E hook point: getEffectiveProduct() is ready to be called from
// cocktailLabPricingAdapter Priority 0 once that phase is implemented.

import { BAR_PRODUCT_SEED } from './barProductSeed.placeholders.js'
import { applyVerifiedPriceUpdate } from './verifiedPriceIngestion.js'

const KEY_PREFIX = 'hospia.verified_prices.'

const _SEED_MAP = {}
for (const p of BAR_PRODUCT_SEED) _SEED_MAP[p.product_id] = p

// ─── Key helpers ─────────────────────────────────────────────────────────────

export function getVerifiedPriceStorageKey(productId) {
  return `${KEY_PREFIX}${productId}`
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

/** Returns the stored normalized_update for a product, or null if absent/invalid. */
export function loadVerifiedPriceOverride(productId) {
  try {
    const raw = localStorage.getItem(getVerifiedPriceStorageKey(productId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || !parsed.product_id) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Persists a validated normalized_update.
 * Returns true on success, false if localStorage is unavailable.
 * Never call with unvalidated input — only pass normalized_update from
 * validateVerifiedPriceUpdate().
 */
export function saveVerifiedPriceOverride(productId, normalizedUpdate) {
  try {
    localStorage.setItem(
      getVerifiedPriceStorageKey(productId),
      JSON.stringify(normalizedUpdate)
    )
    return true
  } catch {
    return false
  }
}

/** Removes a product's verified override. Returns true on success. */
export function clearVerifiedPriceOverride(productId) {
  try {
    localStorage.removeItem(getVerifiedPriceStorageKey(productId))
    return true
  } catch {
    return false
  }
}

// ─── Bulk loader ─────────────────────────────────────────────────────────────

/**
 * Reads all stored overrides for the given products array.
 * Applies each via applyVerifiedPriceUpdate — invalid or corrupt entries are
 * silently skipped (treated as no override).
 * Returns { [product_id]: updatedProduct } containing only valid overrides.
 */
export function loadAllVerifiedPriceOverrides(products) {
  const overrides = {}
  for (const product of products) {
    const normalizedUpdate = loadVerifiedPriceOverride(product.product_id)
    if (!normalizedUpdate) continue
    const { product: updatedProduct, validation } = applyVerifiedPriceUpdate(product, normalizedUpdate)
    if (validation.valid) overrides[product.product_id] = updatedProduct
  }
  return overrides
}

// ─── Single effective product resolver ───────────────────────────────────────

/**
 * Returns the effective product for a given product_id:
 * — override (from localStorage) if one exists and is valid
 * — seed product otherwise
 * Returns null if product_id is not in the seed.
 *
 * Phase 4E: wire this into cocktailLabPricingAdapter.js Priority 0 so that
 * Cocktail Lab costing reflects locally verified prices.
 */
export function getEffectiveProduct(productId) {
  const seedProduct = _SEED_MAP[productId]
  if (!seedProduct) return null
  const normalizedUpdate = loadVerifiedPriceOverride(productId)
  if (!normalizedUpdate) return seedProduct
  const { product: updatedProduct, validation } = applyVerifiedPriceUpdate(seedProduct, normalizedUpdate)
  return validation.valid ? updatedProduct : seedProduct
}
