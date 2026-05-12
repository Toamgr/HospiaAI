// Shared pricing adapter — connects Cocktail Lab ingredient format to the bar product seed.
//
// Matching priority:
//   1. Exact seed brand / product-name match  (benchmark_estimate, medium confidence)
//   2. Category average from seed             (benchmark_estimate, medium confidence)
//   3. Original COST_DB fallback              (operational_assumption, low confidence)
//
// Backward-compatible: returns the same shape as the old buildCostSheet() plus new fields:
//   labor_cost_nis, total_production_cost_nis, confidence_level, cost_status,
//   missing_data_warnings
//
// suggested & luxury are now derived from total_production_cost_nis (ingredient + labor + waste).
// pourCost remains ingredient cost as % of menu price (traditional bar metric).

import { BAR_PRODUCT_SEED } from './barProductSeed.placeholders.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const LABOR_COST_NIS = 1.67          // 50 NIS/hr × 2 min — operational_assumption
const WASTE_BUFFER_PCT = 0.05        // 5% waste on top of ingredient cost
const TARGET_STANDARD = 0.22        // 22% cost target — upscale restaurant model
const TARGET_LUXURY = 0.16          // 16% cost target — luxury / fine dining

// ─── Seed name lookup ─────────────────────────────────────────────────────────
// Indexed by normalised brand and product name. Only entries with a benchmark price.

function normalise(str) {
  return str.toLowerCase().replace(/[''`]/g, '').trim()
}

const SEED_NAME_LOOKUP = []
for (const p of BAR_PRODUCT_SEED) {
  if (!p.benchmark_price_nis || !p.bottle_size_ml) continue
  const cpm = p.benchmark_price_nis / p.bottle_size_ml
  const brandKey = normalise(p.brand)
  SEED_NAME_LOOKUP.push({ key: brandKey, cpm, product_id: p.product_id })
  const nameKey = normalise(p.product_name)
  if (nameKey !== brandKey) {
    SEED_NAME_LOOKUP.push({ key: nameKey, cpm, product_id: p.product_id })
  }
}

// ─── Category CPM medians ─────────────────────────────────────────────────────
// Use median (not mean) so ultra-premium outliers don't inflate generic category pricing.

function median(arr) {
  if (!arr.length) return null
  const s = [...arr].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2
}

const categoryRawCpms = {}
for (const p of BAR_PRODUCT_SEED) {
  if (!p.benchmark_price_nis || !p.bottle_size_ml) continue
  ;(categoryRawCpms[p.category_id] = categoryRawCpms[p.category_id] || []).push(
    p.benchmark_price_nis / p.bottle_size_ml
  )
}
const CATEGORY_MEDIAN_CPM = {}
for (const [catId, cpms] of Object.entries(categoryRawCpms)) {
  CATEGORY_MEDIAN_CPM[catId] = median(cpms)
}

// ─── Pattern → category mapping ───────────────────────────────────────────────
// Used when no exact product name match is found.

const CATEGORY_PATTERNS = [
  [/\bgin\b/i,                                                            ['gin']],
  [/\bvodka\b/i,                                                          ['vodka']],
  [/\btequila\b/i,                                                        ['tequila']],
  [/\bmezcal\b/i,                                                         ['mezcal']],
  [/\bwhisky\b|\bwhiskey\b|\bscotch\b|\bbourbon\b|\birish whiskey\b/i,    ['whisky_scotch', 'whisky_bourbon', 'whisky_irish', 'whisky_japanese']],
  [/\barak\b/i,                                                           ['arak']],
  [/\bvermouth\b/i,                                                       ['vermouth_dry', 'vermouth_sweet', 'vermouth_blanc']],
  [/\baperolf?\b|\bcampari\b/i,                                           ['aperitif_spirit']],
  [/\bliqueur\b|\bamaro\b|\bchartreuse\b|\btriple.?sec\b/i,               ['liqueur_herbal', 'liqueur_amaro', 'liqueur_coffee', 'liqueur_fruit', 'liqueur_triple_sec', 'liqueur_elderflower']],
]

// ─── COST_DB fallback ─────────────────────────────────────────────────────────
// Exact original values — used only when no seed match found.

const COST_DB_FALLBACK = [
  [/gin|vodka|rum|tequila|mezcal|whisky|whiskey|brandy|cognac|pisco|arak/, 0.19],
  [/premium|aged|xo|vsop|luxury|single malt|grand/,                       0.35],
  [/vermouth|sherry|aperol|campari|dry vermouth|blanc vermouth/,           0.09],
  [/liqueur|triple|cointreau|chartreuse|amaro|coffee liqueur/,             0.22],
  [/juice|lime|lemon|grapefruit|orange juice|pineapple juice/,             0.04],
  [/syrup|cordial|honey|agave|demerara/,                                   0.03],
  [/soda|tonic|water|carbonated/,                                          0.01],
  [/saline|salt solution/,                                                 0.003],
  [/egg|cream/,                                                            0.025],
  [/yuzu|truffle|caviar/,                                                  0.55],
  [/bitters?/,                                                             0.008],
]

function fallbackCpm(ingredient) {
  const n = ingredient.toLowerCase()
  for (const [pat, cost] of COST_DB_FALLBACK) if (pat.test(n)) return cost
  return 0.15
}

// ─── Core resolver ────────────────────────────────────────────────────────────

function resolveIngredient(ingredientName) {
  const n = normalise(ingredientName)

  // Priority 1: seed brand / product name — require key ≥ 5 chars to prevent
  // short tokens ("gin", "rum") from matching multi-word brand names like "Gin Mare".
  for (const entry of SEED_NAME_LOOKUP) {
    if (entry.key.length < 5) continue
    if (n === entry.key || n.startsWith(entry.key + ' ') || n.includes(' ' + entry.key)) {
      return { cpm: entry.cpm, match_type: 'product', product_id: entry.product_id, confidence: 'medium', data_status: 'benchmark_estimate' }
    }
  }

  // Priority 2: category median from seed
  for (const [pattern, catIds] of CATEGORY_PATTERNS) {
    if (pattern.test(n)) {
      const cpms = catIds.map(id => CATEGORY_MEDIAN_CPM[id]).filter(v => v != null)
      if (cpms.length > 0) {
        const avgCpm = cpms.reduce((s, v) => s + v, 0) / cpms.length
        return { cpm: avgCpm, match_type: 'category', confidence: 'medium', data_status: 'benchmark_estimate' }
      }
    }
  }

  // Priority 3: original COST_DB values
  return { cpm: fallbackCpm(ingredientName), match_type: 'cost_db_estimate', confidence: 'low', data_status: 'operational_assumption' }
}

// ─── Main export ──────────────────────────────────────────────────────────────
// Accepts either:
//   buildCostSheet(ingredientsMlArray, targetPrice)      ← CocktailLabStudio call-site
//   buildCostSheet(cocktailObject)                       ← FoodCostTables call-site

export function buildCostSheet(ingredientsOrCocktail, targetPrice = null) {
  const ingredientsMl = Array.isArray(ingredientsOrCocktail)
    ? ingredientsOrCocktail
    : (ingredientsOrCocktail?.ingredientsMl || ingredientsOrCocktail?.ingredientObjects || [])

  const rows = ingredientsMl.filter(i => i.amountMl > 0).map(i => {
    const resolved = resolveIngredient(i.ingredient || '')
    return {
      ingredient: i.ingredient,
      ml: i.amountMl,
      cpm: resolved.cpm,
      total: Math.round(i.amountMl * resolved.cpm * 100) / 100,
      match_type: resolved.match_type,
      confidence: resolved.confidence
    }
  })

  const totalCost = Math.round(rows.reduce((s, r) => s + r.total, 0) * 100) / 100
  const wasteBuffer = Math.round(totalCost * WASTE_BUFFER_PCT * 100) / 100
  const total_production_cost_nis = Math.round((totalCost + LABOR_COST_NIS + wasteBuffer) * 100) / 100

  // suggested / luxury now based on total production cost (includes labor + waste buffer).
  // pourCost retains the traditional bar-industry meaning: ingredient cost as % of menu price.
  const suggested = Math.round((total_production_cost_nis / TARGET_STANDARD) * 10) / 10
  const luxury = Math.round((total_production_cost_nis / TARGET_LUXURY) * 10) / 10
  const pourCost = targetPrice
    ? Math.round((totalCost / targetPrice) * 100)
    : (suggested > 0 ? Math.round((totalCost / suggested) * 100) : 0)

  const hasCostDbRows = rows.some(r => r.match_type === 'cost_db_estimate')
  const cost_status = rows.length === 0 ? 'no_ingredients' : 'benchmark_estimate'
  const missing_data_warnings = [
    'Pricing uses benchmark estimates — supplier validation required.',
    ...(hasCostDbRows ? ['Some ingredients matched by category estimate only.'] : [])
  ]

  return {
    // Backward-compatible fields (same keys, same types as old buildCostSheet)
    rows,
    totalCost,
    suggested,
    luxury,
    pourCost,
    // New fields
    labor_cost_nis: LABOR_COST_NIS,
    total_production_cost_nis,
    confidence_level: 'medium',
    cost_status,
    missing_data_warnings
  }
}
