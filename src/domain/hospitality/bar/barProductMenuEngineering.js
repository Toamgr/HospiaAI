// Menu engineering framework for bar product portfolio management.
// Adapts the Kasavana & Smith matrix to a cocktail program context.
// No runtime behavior — classification runs against product+sales data at call site.

export const MENU_ENGINEERING_QUADRANTS = {
  star: {
    id: 'star',
    label: 'Star',
    description: 'High popularity, high margin — protect and promote',
    popularity: 'high',
    margin: 'high',
    action: 'Feature prominently. Train staff to upsell. Never discount.',
    display_color: 'emerald'
  },
  plowhorse: {
    id: 'plowhorse',
    label: 'Plowhorse',
    description: 'High popularity, low margin — reduce cost or reprice',
    popularity: 'high',
    margin: 'low',
    action: 'Find lower-cost ingredient alternatives. Consider a modest price increase.',
    display_color: 'amber'
  },
  puzzle: {
    id: 'puzzle',
    label: 'Puzzle',
    description: 'Low popularity, high margin — increase visibility',
    popularity: 'low',
    margin: 'high',
    action: 'Train bartenders to recommend. Reposition on menu. Consider a name change.',
    display_color: 'sky'
  },
  dog: {
    id: 'dog',
    label: 'Dog',
    description: 'Low popularity, low margin — review or remove',
    popularity: 'low',
    margin: 'low',
    action: 'Consider removal. If brand-required or seasonal, constrain production to minimize loss.',
    display_color: 'red'
  }
}

export const MENU_ENGINEERING_DEFAULTS = {
  popularity_threshold_percent: 70, // % of average item popularity below which = "low popularity"
  target_pour_cost_percent: 22,     // venue target — used as margin reference
  high_margin_ratio: 0.78,          // gross margin ≥ this = high margin
  low_margin_ratio: 0.72            // gross margin < this = low margin
}

// classifyMenuPosition → quadrant id
// popularityIndex: (item_sales / average_sales_across_items) × 100
// grossMarginRatio: (menuPrice - totalCost) / menuPrice
export function classifyMenuPosition({ popularityIndex, grossMarginRatio }, defaults = MENU_ENGINEERING_DEFAULTS) {
  if (popularityIndex == null || grossMarginRatio == null) return null
  const isHighPopularity = popularityIndex >= defaults.popularity_threshold_percent
  const isHighMargin = grossMarginRatio >= defaults.high_margin_ratio
  if (isHighPopularity && isHighMargin) return 'star'
  if (isHighPopularity && !isHighMargin) return 'plowhorse'
  if (!isHighPopularity && isHighMargin) return 'puzzle'
  return 'dog'
}

// popularityIndex: ratio of item sales to average across all items, expressed as percentage
export function calculatePopularityIndex(itemSalesCount, averageSalesCount) {
  if (!averageSalesCount) return 0
  return +((itemSalesCount / averageSalesCount) * 100).toFixed(1)
}

// Contribution margin: absolute NIS profit per serve
export function contributionMargin(menuPriceNis, totalIngredientCostNis) {
  if (menuPriceNis == null || totalIngredientCostNis == null) return null
  return +(menuPriceNis - totalIngredientCostNis).toFixed(2)
}

// Gross margin ratio: proportion of menu price that is profit
export function grossMarginRatio(menuPriceNis, totalIngredientCostNis) {
  if (!menuPriceNis || totalIngredientCostNis == null) return null
  return +((menuPriceNis - totalIngredientCostNis) / menuPriceNis).toFixed(4)
}

// Weighted average contribution margin across all menu items — used as menu-level margin benchmark
// items: [{ sales_count, contribution_margin_nis }]
export function menuAverageContributionMargin(items = []) {
  const totalSales = items.reduce((s, i) => s + (i.sales_count || 0), 0)
  if (!totalSales) return null
  const weighted = items.reduce((s, i) => s + ((i.sales_count || 0) * (i.contribution_margin_nis || 0)), 0)
  return +(weighted / totalSales).toFixed(2)
}

// Average sales count across items — used as the popularity denominator
// items: [{ sales_count }]
export function menuAverageSalesCount(items = []) {
  if (!items.length) return 0
  const total = items.reduce((s, i) => s + (i.sales_count || 0), 0)
  return +(total / items.length).toFixed(1)
}

// Classify an entire menu at once. Returns items with quadrant added.
// items: [{ id, sales_count, menu_price_nis, total_ingredient_cost_nis, ...rest }]
export function classifyMenu(items = [], defaults = MENU_ENGINEERING_DEFAULTS) {
  const avgSales = menuAverageSalesCount(items)
  return items.map(item => {
    const popIndex = calculatePopularityIndex(item.sales_count || 0, avgSales)
    const margin = grossMarginRatio(item.menu_price_nis, item.total_ingredient_cost_nis)
    const quadrant = classifyMenuPosition({ popularityIndex: popIndex, grossMarginRatio: margin }, defaults)
    return { ...item, popularity_index: popIndex, gross_margin_ratio: margin, menu_quadrant: quadrant }
  })
}
