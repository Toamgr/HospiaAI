// Schema templates for cocktail records and their ingredients.
// These are for seeding, future DB mapping, and Cocktail Lab integration.

export function createCocktailRecord({
  cocktail_id,
  name,
  description = null,
  category = null,      // 'sour' | 'stirred' | 'highball' | 'built' | 'blended' | 'shot'
  glassware = null,
  garnish = null,
  method = null,        // 'shake' | 'stir' | 'build' | 'blend' | 'throw'
  serve_temp = null,    // 'chilled' | 'room' | 'hot'
  complexity_level = null, // 1–5
  status = 'draft',    // 'draft' | 'approved' | 'archived'
  approved_by = null,
  approved_at = null,
  menu_price_nis = null,
  target_cost_percentage = null,
  venue_type = null,
  tags = [],
  notes = null
} = {}) {
  return {
    cocktail_id,
    name,
    description,
    category,
    glassware,
    garnish,
    method,
    serve_temp,
    complexity_level,
    status,
    approved_by,
    approved_at,
    menu_price_nis,
    target_cost_percentage,
    venue_type,
    tags,
    notes
  }
}

export function createCocktailIngredient({
  cocktail_id,
  product_id = null,   // links to barProductSeed — null for fresh/house items
  ingredient_name,     // display name
  pour_ml,
  apply_spillage = true,
  ingredient_type = 'spirit', // 'spirit' | 'liqueur' | 'juice' | 'syrup' | 'mixer' | 'bitters' | 'garnish'
  cost_per_ml_override = null, // optional direct override
  notes = null
} = {}) {
  return {
    cocktail_id,
    product_id,
    ingredient_name,
    pour_ml,
    apply_spillage,
    ingredient_type,
    cost_per_ml_override,
    notes
  }
}
