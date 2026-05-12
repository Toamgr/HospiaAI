// Pure calculation utilities for bar product costing.
// All functions are stateless and accept explicit inputs — no imports from data files.
// Pour cost formula confirmed from CSV: wholesalePrice / bottleSizeMl × pourMl × 1.05
// The 1.05 factor accounts for 5% spillage/waste inherent in bar service.

const SPILLAGE_FACTOR = 1.05

// ─── Bottle-level utils ────────────────────────────────────────────────────

export function costPerMl(wholesalePriceNis, bottleSizeMl) {
  if (!wholesalePriceNis || !bottleSizeMl) return null
  return wholesalePriceNis / bottleSizeMl
}

export function costPerPour(wholesalePriceNis, bottleSizeMl, pourMl) {
  const cpm = costPerMl(wholesalePriceNis, bottleSizeMl)
  if (cpm == null || !pourMl) return null
  return +(cpm * pourMl).toFixed(4)
}

export function costPerPourWithSpillage(wholesalePriceNis, bottleSizeMl, pourMl) {
  const cpm = costPerMl(wholesalePriceNis, bottleSizeMl)
  if (cpm == null || !pourMl) return null
  return +(cpm * pourMl * SPILLAGE_FACTOR).toFixed(4)
}

// ─── Fresh produce costing ────────────────────────────────────────────────

// pricePerUnit: price per fruit/kg; yieldMl: usable juice yield in ml
export function produceUsableCost(pricePerUnit, yieldMl) {
  if (!pricePerUnit || !yieldMl) return null
  return +(pricePerUnit / yieldMl).toFixed(4) // NIS per ml of juice
}

// Assumes 1 lemon = ~30ml juice, 1 lime = ~20ml juice, 1 orange = ~80ml juice
export function produceJuiceCostPerMl(pricePerFruit, juiceYieldMl) {
  return produceUsableCost(pricePerFruit, juiceYieldMl)
}

// ─── Cocktail ingredient costing ─────────────────────────────────────────

// ingredientCostPerMl: can come from costPerMl() or produceJuiceCostPerMl()
export function cocktailIngredientCost(ingredientCostPerMl, pourMl, applySpillage = true) {
  if (ingredientCostPerMl == null || !pourMl) return null
  const multiplier = applySpillage ? SPILLAGE_FACTOR : 1
  return +(ingredientCostPerMl * pourMl * multiplier).toFixed(4)
}

// ingredients: array of { costPerMl, pourMl, applySpillage? }
export function cocktailTotalCost(ingredients = []) {
  let total = 0
  for (const ing of ingredients) {
    const cost = cocktailIngredientCost(ing.costPerMl, ing.pourMl, ing.applySpillage ?? true)
    if (cost == null) return null // fail if any ingredient is unresolved
    total += cost
  }
  return +total.toFixed(2)
}

// ─── Margin + pricing metrics ─────────────────────────────────────────────

export function pourCostPercent(ingredientCostNis, menuPriceNis) {
  if (!ingredientCostNis || !menuPriceNis) return null
  return +((ingredientCostNis / menuPriceNis) * 100).toFixed(1)
}

export function grossMargin(ingredientCostNis, menuPriceNis) {
  if (!ingredientCostNis || !menuPriceNis) return null
  return +(menuPriceNis - ingredientCostNis).toFixed(2)
}

// ─── Inventory risk signals ───────────────────────────────────────────────

// hoursOpen: hours the bottle has been open; abvPercent: spirit ABV
export function oxidationRisk(hoursOpen, abvPercent) {
  if (!hoursOpen || abvPercent == null) return 'unknown'
  if (abvPercent < 20) {
    if (hoursOpen > 4) return 'critical'
    if (hoursOpen > 2) return 'high'
    return 'medium'
  }
  if (abvPercent < 40) {
    if (hoursOpen > 24) return 'high'
    if (hoursOpen > 8) return 'medium'
    return 'low'
  }
  return 'low' // spirits ≥40% ABV are low oxidation risk
}

// batchedAtIso: ISO string when juice was batched; currentIso: ISO string of now
export function shelfLifeStatus(batchedAtIso, currentIso, maxHours = 8) {
  if (!batchedAtIso || !currentIso) return 'unknown'
  const elapsed = (new Date(currentIso) - new Date(batchedAtIso)) / 3_600_000
  if (elapsed >= maxHours) return 'expired'
  if (elapsed >= maxHours * 0.75) return 'expiring_soon'
  return 'ok'
}

// bottlesOpened: count of open carbonated bottles; poursMade: pours from those bottles
// standardPourMl: standard pour for this product; bottleSizeMl
export function carbonationWasteRisk(bottlesOpened, poursMade, standardPourMl, bottleSizeMl) {
  if (!bottlesOpened || !bottleSizeMl || !standardPourMl) return 'unknown'
  const expectedPours = (bottlesOpened * bottleSizeMl) / standardPourMl
  const usageRate = poursMade / expectedPours
  if (usageRate < 0.5) return 'high'
  if (usageRate < 0.75) return 'medium'
  return 'low'
}

// ─── Data quality scoring ─────────────────────────────────────────────────

// Returns a score 0–100 representing how complete a product record is.
export function missingDataScore(product) {
  const checks = [
    Boolean(product.benchmark_price_nis || product.actual_venue_price_nis),
    Boolean(product.supplier_name || product.store_name),
    Boolean(product.source_url),
    product.vat_included !== null,
    Boolean(product.last_verified_at),
    Boolean(product.abv_percent),
    Boolean(product.bottle_size_ml),
    product.confidence_level !== 'unknown',
    product.data_status !== 'unavailable',
    Boolean(product.common_usage)
  ]
  const passed = checks.filter(Boolean).length
  return Math.round((passed / checks.length) * 100)
}

// ─── Labor costing ───────────────────────────────────────────────────────

// Default: 50 NIS/hr × 2 min = 1.67 NIS per cocktail
export function bartenderLaborCost(hourlyRateNis = 50, minutesPerCocktail = 2) {
  return +((hourlyRateNis / 60) * minutesPerCocktail).toFixed(2)
}

// ─── Full cocktail production costing ────────────────────────────────────

// wasteBufferPercent: e.g. 0.05 = 5% waste buffer on top of ingredient cost
export function cocktailProductionCost(ingredientCostNis, laborCostNis = 1.67, wasteBufferPercent = 0.05) {
  if (ingredientCostNis == null) return null
  const waste = ingredientCostNis * wasteBufferPercent
  return +(ingredientCostNis + laborCostNis + waste).toFixed(2)
}

// targetCostPercentage: e.g. 0.22 = 22% cost target
export function suggestedMenuPrice(totalProductionCostNis, targetCostPercentage = 0.22) {
  if (!totalProductionCostNis || !targetCostPercentage) return null
  return +Math.ceil(totalProductionCostNis / targetCostPercentage).toFixed(0)
}

export function cocktailGrossMargin(menuPriceNis, totalProductionCostNis) {
  if (!menuPriceNis || !totalProductionCostNis) return null
  return +(menuPriceNis - totalProductionCostNis).toFixed(2)
}

export function cocktailProfitabilityScore(menuPriceNis, totalProductionCostNis) {
  if (!menuPriceNis || !totalProductionCostNis) return null
  const margin = (menuPriceNis - totalProductionCostNis) / menuPriceNis
  if (margin >= 0.78) return 'excellent'
  if (margin >= 0.72) return 'good'
  if (margin >= 0.65) return 'acceptable'
  return 'poor'
}
