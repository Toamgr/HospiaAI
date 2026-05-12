import {
  cocktailIngredientCost,
  bartenderLaborCost,
  cocktailProductionCost,
  suggestedMenuPrice,
  cocktailGrossMargin,
  cocktailProfitabilityScore,
  pourCostPercent
} from './barCalculationUtils.js'

// Default labor assumption — data_status: operational_assumption
const DEFAULT_LABOR = {
  hourly_rate_nis: 50,
  minutes_per_cocktail: 2,
  cost_nis: 1.67,
  data_status: 'operational_assumption',
  note: '50 NIS/hr × 2 min — needs venue-specific validation'
}

// Target cost percentages by venue type — data_status: operational_assumption
export const VENUE_TARGET_COST = {
  high_volume_bar: { target: 0.28, label: 'High Volume Bar' },
  casual_restaurant: { target: 0.25, label: 'Casual Restaurant' },
  upscale_restaurant: { target: 0.22, label: 'Upscale Restaurant' },
  fine_dining: { target: 0.20, label: 'Fine Dining' },
  hotel_bar: { target: 0.22, label: 'Hotel Bar' },
  rooftop_cocktail_bar: { target: 0.20, label: 'Rooftop / Cocktail Bar' },
  event_catering: { target: 0.30, label: 'Event Catering' },
  members_club: { target: 0.18, label: 'Members Club' }
}

const DEFAULT_VENUE_TYPE = 'upscale_restaurant'

/**
 * Calculates full cocktail costing for a given recipe.
 *
 * @param {Object} options
 * @param {Array}  options.ingredients  — [{ costPerMl, pourMl, applySpillage?, name? }]
 * @param {number} [options.laborCostNis]     — override default labor cost
 * @param {number} [options.wasteBufferPct]   — override 5% waste buffer
 * @param {string} [options.venueType]        — VENUE_TARGET_COST key
 * @param {number} [options.targetCostPct]    — override venue target entirely
 * @returns {Object} full pricing breakdown
 */
export function calculateCocktailPricing({
  ingredients = [],
  laborCostNis = DEFAULT_LABOR.cost_nis,
  wasteBufferPct = 0.05,
  venueType = DEFAULT_VENUE_TYPE,
  targetCostPct = null
} = {}) {
  const ingredientBreakdown = ingredients.map(ing => {
    const cost = cocktailIngredientCost(ing.costPerMl, ing.pourMl, ing.applySpillage ?? true)
    return { name: ing.name ?? 'Unnamed ingredient', pourMl: ing.pourMl, costPerMl: ing.costPerMl, cost }
  })

  const hasUnresolved = ingredientBreakdown.some(i => i.cost == null)
  const totalIngredientCost = hasUnresolved
    ? null
    : +ingredientBreakdown.reduce((sum, i) => sum + i.cost, 0).toFixed(2)

  const productionCost = cocktailProductionCost(totalIngredientCost, laborCostNis, wasteBufferPct)

  const resolvedTarget = targetCostPct ?? VENUE_TARGET_COST[venueType]?.target ?? 0.22
  const menuPrice = suggestedMenuPrice(productionCost, resolvedTarget)
  const grossMarginNis = cocktailGrossMargin(menuPrice, productionCost)
  const profitScore = cocktailProfitabilityScore(menuPrice, productionCost)
  const pourCostPct = pourCostPercent(productionCost, menuPrice)

  return {
    ingredient_breakdown: ingredientBreakdown,
    total_ingredient_cost_nis: totalIngredientCost,
    labor_cost_nis: laborCostNis,
    labor_source: laborCostNis === DEFAULT_LABOR.cost_nis ? DEFAULT_LABOR : null,
    waste_buffer_pct: wasteBufferPct,
    waste_buffer_nis: totalIngredientCost != null ? +(totalIngredientCost * wasteBufferPct).toFixed(2) : null,
    total_production_cost_nis: productionCost,
    venue_type: venueType,
    target_cost_percentage: resolvedTarget,
    suggested_menu_price_nis: menuPrice,
    gross_margin_nis: grossMarginNis,
    pour_cost_percent: pourCostPct,
    profitability_score: profitScore,
    has_unresolved_ingredients: hasUnresolved,
    data_warnings: [
      ...(hasUnresolved ? ['One or more ingredients have no price data — cost is incomplete.'] : []),
      ...(laborCostNis === DEFAULT_LABOR.cost_nis ? [DEFAULT_LABOR.note] : [])
    ]
  }
}
