// Schema templates — used for seeding, validation, and future DB mapping.
// These are plain objects, not classes. Fill required fields; optional fields default to null.

export function createBarProduct({
  product_id,
  brand,
  product_name,
  category_id,
  subcategory = null,
  bottle_size_ml,
  abv_percent = null,
  tier = null,               // 'well' | 'call' | 'premium' | 'super_premium' | 'ultra_premium'
  fast_moving = null,        // boolean
  storage_requirement = 'ambient',
  common_usage = null,       // free-text note on usage context
  benchmark_price_nis,       // wholesale benchmark — the main pricing field from CSV
  actual_venue_price_nis = null, // if venue has a confirmed invoice price, overrides benchmark
  price_source = null,       // SOURCE_QUALITY key
  source_url = null,
  supplier_name = null,
  store_name = null,
  data_status = 'benchmark_estimate',
  confidence_level = 'medium',
  lowest_known_price_nis = null,
  highest_known_price_nis = null,
  vat_included = null,       // boolean | null if unknown
  last_verified_at = null,
  notes = null
} = {}) {
  return {
    product_id,
    brand,
    product_name,
    category_id,
    subcategory,
    bottle_size_ml,
    abv_percent,
    tier,
    fast_moving,
    storage_requirement,
    common_usage,
    benchmark_price_nis,
    actual_venue_price_nis,
    price_source,
    source_url,
    supplier_name,
    store_name,
    data_status,
    confidence_level,
    lowest_known_price_nis,
    highest_known_price_nis,
    vat_included,
    last_verified_at,
    notes
  }
}

// The computed pricing view — what BottlePrices UI renders per product
export function createPriceOutputCard(product) {
  const priceForCosting = product.actual_venue_price_nis ?? product.benchmark_price_nis
  const hasPrice = priceForCosting != null
  const cpm = hasPrice ? priceForCosting / product.bottle_size_ml : null

  const missingDataWarnings = []
  if (!hasPrice) missingDataWarnings.push('Supplier data missing — needs validation.')
  if (!product.supplier_name && !product.store_name) missingDataWarnings.push('No supplier or store data available.')
  if (product.data_status === 'benchmark_estimate') missingDataWarnings.push('Wholesale price is a benchmark estimate — not source-backed.')
  if (product.vat_included === null) missingDataWarnings.push('VAT status not confirmed.')
  if (!product.last_verified_at) missingDataWarnings.push('Price not verified against current market.')

  return {
    product_id: product.product_id,
    brand: product.brand,
    product_name: product.product_name,
    category_id: product.category_id,
    bottle_size_ml: product.bottle_size_ml,
    abv_percent: product.abv_percent,
    benchmark_price_nis: product.benchmark_price_nis,
    actual_venue_price_nis: product.actual_venue_price_nis,
    price_used_for_costing_nis: priceForCosting,
    cost_per_ml_nis: cpm,
    cost_per_30ml_nis: cpm != null ? +(cpm * 30 * 1.05).toFixed(2) : null,
    cost_per_45ml_nis: cpm != null ? +(cpm * 45 * 1.05).toFixed(2) : null,
    cost_per_60ml_nis: cpm != null ? +(cpm * 60 * 1.05).toFixed(2) : null,
    lowest_known_price_nis: product.lowest_known_price_nis,
    highest_known_price_nis: product.highest_known_price_nis,
    supplier_name: product.supplier_name,
    store_name: product.store_name,
    source_url: product.source_url,
    confidence_level: product.confidence_level,
    data_status: product.data_status,
    best_ordering_recommendation: product.supplier_name
      ? `Order from: ${product.supplier_name}`
      : 'Needs supplier validation',
    missing_data_warnings: missingDataWarnings
  }
}
