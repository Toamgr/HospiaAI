// Example cocktail records demonstrating the schema.
// These are structural placeholders only — clearly marked, not presented as real venue data.
// Ingredient product_ids reference barProductSeed.placeholders.js.

import { createCocktailRecord, createCocktailIngredient } from './cocktailSchema.js'

export const COCKTAIL_SEED_EXAMPLES = [
  createCocktailRecord({
    cocktail_id: 'ck-ex-001',
    name: 'Example Margarita',
    description: 'Schema placeholder demonstrating tequila + citrus structure',
    category: 'sour',
    glassware: 'coupe',
    garnish: 'salt rim + dehydrated lime wheel',
    method: 'shake',
    serve_temp: 'chilled',
    complexity_level: 2,
    status: 'draft',
    notes: 'Placeholder only — not a venue recipe. Replace with actual Cocktail Lab export.'
  }),

  createCocktailRecord({
    cocktail_id: 'ck-ex-002',
    name: 'Example Negroni',
    description: 'Schema placeholder demonstrating stirred spirit + vermouth structure',
    category: 'stirred',
    glassware: 'rocks',
    garnish: 'orange peel',
    method: 'stir',
    serve_temp: 'chilled',
    complexity_level: 1,
    status: 'draft',
    notes: 'Placeholder only — not a venue recipe.'
  }),

  createCocktailRecord({
    cocktail_id: 'ck-ex-003',
    name: 'Example Espresso Martini',
    description: 'Schema placeholder demonstrating vodka + liqueur + produce structure',
    category: 'stirred',
    glassware: 'martini',
    garnish: '3 coffee beans',
    method: 'shake',
    serve_temp: 'chilled',
    complexity_level: 3,
    status: 'draft',
    notes: 'Placeholder only. Espresso cost not yet tracked — add fresh coffee cost per shot.'
  })
]

export const COCKTAIL_INGREDIENT_SEED_EXAMPLES = [
  // Example Margarita ingredients
  createCocktailIngredient({ cocktail_id: 'ck-ex-001', product_id: 'teq-007', ingredient_name: 'Espolòn Blanco', pour_ml: 45, ingredient_type: 'spirit' }),
  createCocktailIngredient({ cocktail_id: 'ck-ex-001', product_id: 'liq-005', ingredient_name: 'Cointreau', pour_ml: 22, ingredient_type: 'liqueur' }),
  createCocktailIngredient({ cocktail_id: 'ck-ex-001', product_id: null, ingredient_name: 'Fresh lime juice', pour_ml: 22, ingredient_type: 'juice', cost_per_ml_override: null }),

  // Example Negroni ingredients
  createCocktailIngredient({ cocktail_id: 'ck-ex-002', product_id: 'gin-002', ingredient_name: 'Tanqueray London Dry', pour_ml: 30, ingredient_type: 'spirit' }),
  createCocktailIngredient({ cocktail_id: 'ck-ex-002', product_id: 'liq-003', ingredient_name: 'Campari', pour_ml: 30, ingredient_type: 'liqueur' }),
  createCocktailIngredient({ cocktail_id: 'ck-ex-002', product_id: 'liq-002', ingredient_name: 'Martini Rosso', pour_ml: 30, ingredient_type: 'liqueur' }),

  // Example Espresso Martini ingredients
  createCocktailIngredient({ cocktail_id: 'ck-ex-003', product_id: 'vod-001', ingredient_name: 'Grey Goose', pour_ml: 40, ingredient_type: 'spirit' }),
  createCocktailIngredient({ cocktail_id: 'ck-ex-003', product_id: 'liq-008', ingredient_name: 'Kahlúa', pour_ml: 20, ingredient_type: 'liqueur' }),
  createCocktailIngredient({ cocktail_id: 'ck-ex-003', product_id: null, ingredient_name: 'Fresh espresso', pour_ml: 30, ingredient_type: 'mixer', cost_per_ml_override: null })
]
