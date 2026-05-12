// Verified supplier price ingestion infrastructure.
//
// Purpose: validate and apply real supplier prices to bar products.
// Produces data_status: 'verified_source_backed' and confidence_level: 'high'
// ONLY when all required provenance fields are present and the source type
// is an approved, auditable document.
//
// Nothing here touches barProductSeed.placeholders.js at runtime —
// callers are responsible for persisting the returned updatedProduct.

import { BAR_PRODUCT_SEED } from './barProductSeed.placeholders.js'

const _SEED_ID_MAP = {}
for (const p of BAR_PRODUCT_SEED) _SEED_ID_MAP[p.product_id] = p

// ─── Approved source types ────────────────────────────────────────────────────
// Only these values may produce data_status: 'verified_source_backed'.

export const APPROVED_SOURCE_TYPES = [
  'invoice',
  'supplier_quote',
  'supplier_catalog',
  'direct_supplier_confirmation',
]

const REJECTED_SOURCE_SUBSTRINGS = [
  'google', 'web search', 'memory', 'estimate', 'benchmark',
]

const MAX_REALISTIC_PRICE_NIS = 5000

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates a candidate verified price update.
 *
 * Returns:
 *   { valid: boolean, errors: string[], warnings: string[], normalized_update: object | {} }
 *
 * normalized_update is populated only when valid === true.
 * It sets data_status and confidence_level automatically — callers must not set them.
 */
export function validateVerifiedPriceUpdate(update) {
  const errors = []
  const warnings = []

  if (!update) {
    return { valid: false, errors: ['update object is required.'], warnings: [], normalized_update: {} }
  }

  // product_id
  if (!update.product_id) {
    errors.push('product_id is required.')
  }
  const product = update.product_id ? _SEED_ID_MAP[update.product_id] : null
  if (update.product_id && !product) {
    errors.push(`Product '${update.product_id}' not found in seed.`)
  }

  // actual_venue_price_nis
  if (update.actual_venue_price_nis == null) {
    errors.push('actual_venue_price_nis is required.')
  } else if (typeof update.actual_venue_price_nis !== 'number') {
    errors.push('actual_venue_price_nis must be a number.')
  } else if (update.actual_venue_price_nis <= 0) {
    errors.push('actual_venue_price_nis must be positive.')
  } else if (update.actual_venue_price_nis > MAX_REALISTIC_PRICE_NIS) {
    warnings.push(`actual_venue_price_nis (${update.actual_venue_price_nis}) is unusually high — verify.`)
  }

  // supplier_name
  if (!update.supplier_name || !update.supplier_name.trim()) {
    errors.push('supplier_name is required.')
  }

  // source_type
  if (!update.source_type) {
    errors.push('source_type is required.')
  } else if (REJECTED_SOURCE_SUBSTRINGS.some(r => update.source_type.toLowerCase().includes(r))) {
    errors.push(`source_type '${update.source_type}' is not an approved verified source.`)
  } else if (!APPROVED_SOURCE_TYPES.includes(update.source_type)) {
    errors.push(`source_type must be one of: ${APPROVED_SOURCE_TYPES.join(', ')}.`)
  }

  // source_reference (e.g. invoice number, quote doc ID)
  if (!update.source_reference || !update.source_reference.trim()) {
    errors.push('source_reference is required.')
  }

  // last_verified_at
  if (!update.last_verified_at) {
    errors.push('last_verified_at is required.')
  } else if (isNaN(Date.parse(update.last_verified_at))) {
    errors.push('last_verified_at must be a valid ISO date string.')
  }

  // vat_included
  if (update.vat_included == null || typeof update.vat_included !== 'boolean') {
    errors.push('vat_included must be a boolean (true or false).')
  }

  // verified_by
  if (!update.verified_by || !update.verified_by.trim()) {
    errors.push('verified_by is required.')
  }

  // bottle_size_ml consistency (warning only)
  if (product && update.bottle_size_ml != null && update.bottle_size_ml !== product.bottle_size_ml) {
    warnings.push(
      `bottle_size_ml (${update.bottle_size_ml}) does not match product seed (${product.bottle_size_ml}ml) — seed value will be used.`
    )
  }

  // Block caller from pre-setting verified status — adapter sets it
  if (update.confidence_level === 'high' && errors.length > 0) {
    errors.push('confidence_level: high cannot be set on an invalid update.')
  }
  if (update.data_status === 'verified_source_backed' && errors.length > 0) {
    errors.push('data_status: verified_source_backed cannot be set on an invalid update.')
  }

  const valid = errors.length === 0

  const normalized_update = valid
    ? {
        product_id: update.product_id,
        actual_venue_price_nis: update.actual_venue_price_nis,
        bottle_size_ml: product?.bottle_size_ml,
        supplier_name: update.supplier_name.trim(),
        source_type: update.source_type,
        source_reference: update.source_reference.trim(),
        last_verified_at: update.last_verified_at,
        vat_included: update.vat_included,
        verified_by: update.verified_by.trim(),
        invoice_number: update.invoice_number ?? null,
        invoice_date: update.invoice_date ?? null,
        store_name: update.store_name ?? null,
        supplier_contact: update.supplier_contact ?? null,
        notes: update.notes ?? null,
        // Set by this layer only — never by caller
        data_status: 'verified_source_backed',
        confidence_level: 'high',
      }
    : {}

  return { valid, errors, warnings, normalized_update }
}

// ─── Application ──────────────────────────────────────────────────────────────

/**
 * Merges a validated price update into a product object.
 *
 * Does NOT mutate the original product.
 * Returns { product, validation } — if validation.valid is false, product is
 * the original unchanged object.
 *
 * benchmark_price_nis is never overwritten — it stays as the market reference.
 */
export function applyVerifiedPriceUpdate(product, update) {
  const validation = validateVerifiedPriceUpdate(update)

  if (!validation.valid) {
    return { product, validation }
  }

  const n = validation.normalized_update

  const updatedProduct = {
    ...product,
    actual_venue_price_nis: n.actual_venue_price_nis,
    supplier_name: n.supplier_name,
    store_name: n.store_name,
    source_type: n.source_type,
    source_reference: n.source_reference,
    last_verified_at: n.last_verified_at,
    vat_included: n.vat_included,
    verified_by: n.verified_by,
    invoice_number: n.invoice_number,
    invoice_date: n.invoice_date,
    supplier_contact: n.supplier_contact,
    notes: n.notes,
    // Verified status — set only after full validation passes
    data_status: 'verified_source_backed',
    confidence_level: 'high',
    // benchmark_price_nis is intentionally preserved — never overwritten
  }

  return { product: updatedProduct, validation }
}
