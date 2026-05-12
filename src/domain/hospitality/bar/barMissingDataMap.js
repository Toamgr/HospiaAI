// Registry of known data gaps across the bar product foundation.
// Each entry describes what is missing, why it matters, and how to collect it.
// This is a planning document — it does not drive runtime logic.

export const BAR_MISSING_DATA_MAP = [
  {
    gap_id: 'gap-001',
    category: 'pricing',
    description: 'No venue invoice prices for any product — all wholesale prices are benchmark estimates',
    affects_products: 'all',
    priority: 'critical',
    collection_method: 'Request invoices from distributor; cross-reference with venue purchase history',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-002',
    category: 'pricing',
    description: 'Supplier or store names missing for all products',
    affects_products: 'all',
    priority: 'critical',
    collection_method: 'Identify current suppliers; add to product records when first invoice received',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-003',
    category: 'pricing',
    description: 'VAT inclusion status unknown for all benchmark prices',
    affects_products: 'all',
    priority: 'high',
    collection_method: 'Confirm with supplier whether quoted prices include or exclude 17% Israeli VAT',
    collection_owner: 'Bar Manager / Admin'
  },
  {
    gap_id: 'gap-004',
    category: 'pricing',
    description: 'No source URLs for any price data',
    affects_products: 'all',
    priority: 'medium',
    collection_method: 'When verifying prices online, record URL and date accessed',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-005',
    category: 'pricing',
    description: 'Price range (lowest_known / highest_known) not populated for any product',
    affects_products: 'all',
    priority: 'medium',
    collection_method: 'Compare 3+ suppliers per product over 90 days; record low and high observed prices',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-006',
    category: 'inventory',
    description: 'No real-time inventory counts — current stock levels not tracked in HESTIA',
    affects_products: 'all',
    priority: 'high',
    collection_method: 'Implement weekly physical count form; enter results via Inventory Overview page',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-007',
    category: 'cocktail_recipes',
    description: 'Cocktail recipes not linked to product IDs — no cost-aware recipe engine yet',
    affects_products: 'all',
    priority: 'high',
    collection_method: 'Migrate approved cocktail recipes into cocktailSeed format with product_id references',
    collection_owner: 'Bar Manager / HESTIA Development'
  },
  {
    gap_id: 'gap-008',
    category: 'labor',
    description: 'Bartender labor rate is a default assumption (50 NIS/hr) — not validated against actual payroll',
    affects_products: 'cocktail_costing',
    priority: 'medium',
    collection_method: 'Confirm actual hourly rate with management; update DEFAULT_LABOR in cocktailPricingEngine.js',
    collection_owner: 'Owner / Admin'
  },
  {
    gap_id: 'gap-009',
    category: 'labor',
    description: 'Minutes-per-cocktail assumption (2 min) not verified against real prep times',
    affects_products: 'cocktail_costing',
    priority: 'low',
    collection_method: 'Time common cocktail builds during setup; average across 5 builds per drink',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-010',
    category: 'fresh_produce',
    description: 'No fresh produce pricing in the system (lemon, lime, orange, herbs, egg whites)',
    affects_products: 'fresh_juice_cocktails',
    priority: 'high',
    collection_method: 'Record weekly produce order price per unit; enter into produce cost table',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-011',
    category: 'fresh_produce',
    description: 'Juice yield per fruit not measured — using assumed defaults (lemon=30ml, lime=20ml)',
    affects_products: 'sour_cocktails',
    priority: 'medium',
    collection_method: 'Measure juice yield from 10 fruits each of lime and lemon; record average',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-012',
    category: 'syrups',
    description: 'Homemade syrup costs not tracked — no cost per ml for in-house syrups',
    affects_products: 'signature_cocktails',
    priority: 'medium',
    collection_method: 'Calculate ingredient cost per batch; divide by yield in ml to get cost per ml',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-013',
    category: 'garnish',
    description: 'Garnish cost per cocktail not tracked — omitted from all current costing calculations',
    affects_products: 'all',
    priority: 'low',
    collection_method: 'Estimate per-cocktail garnish cost (dehydrated citrus, fresh herbs, etc.) and add as fixed overhead',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-014',
    category: 'glassware',
    description: 'Glassware breakage cost not included in cocktail production cost',
    affects_products: 'all',
    priority: 'low',
    collection_method: 'Track monthly breakage cost; divide by cocktail count to get per-cocktail overhead',
    collection_owner: 'Manager'
  },
  {
    gap_id: 'gap-015',
    category: 'market_data',
    description: 'Arak pricing may be significantly different from benchmark — local market fluctuates',
    affects_products: 'arak category',
    priority: 'high',
    collection_method: 'Request quotes from local arak distributors (e.g., Hacarmel market suppliers)',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-016',
    category: 'market_data',
    description: 'Tequila and Mezcal import prices may not reflect current customs duties',
    affects_products: 'tequila, mezcal categories',
    priority: 'medium',
    collection_method: 'Confirm import costs with current importer; customs rates changed for spirits in 2025',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-017',
    category: 'market_data',
    description: 'Ultra-premium products (Don Julio 1942, Clase Azul) prices are highly volatile',
    affects_products: 'teq-006, teq-017',
    priority: 'high',
    collection_method: 'Verify directly with importer before any menu repricing; do not use benchmarks for prestige table service',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-018',
    category: 'ordering',
    description: 'Minimum order quantities (MOQs) not known for any supplier',
    affects_products: 'all',
    priority: 'medium',
    collection_method: 'Request MOQ and lead time from each supplier during next order cycle',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-019',
    category: 'ordering',
    description: 'Delivery lead times not tracked — no par level planning possible',
    affects_products: 'all',
    priority: 'medium',
    collection_method: 'Record lead time on first delivery from each new supplier',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-020',
    category: 'pricing',
    description: 'No historical price tracking — cannot identify trend or inflation signals',
    affects_products: 'all',
    priority: 'low',
    collection_method: 'Once venue invoice prices are recorded, timestamp each update to build price history',
    collection_owner: 'HESTIA Development'
  },
  {
    gap_id: 'gap-021',
    category: 'cocktail_recipes',
    description: 'No straw cost, napkin cost, or service overhead tracked per cocktail',
    affects_products: 'cocktail_costing',
    priority: 'low',
    collection_method: 'Estimate monthly supply cost; divide by cocktail count for per-unit overhead',
    collection_owner: 'Manager'
  },
  {
    gap_id: 'gap-022',
    category: 'market_data',
    description: 'Premium gin market (Monkey 47, Gin Mare, Drumshanbo) has high price variance by channel',
    affects_products: 'gin-005, gin-014, gin-015',
    priority: 'medium',
    collection_method: 'Compare duty-free, importer, and retailer pricing; use lowest confirmed channel',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-023',
    category: 'market_data',
    description: 'Super-premium Scotch (Lagavulin) price may differ significantly from benchmark due to allocation scarcity',
    affects_products: 'whi-005',
    priority: 'high',
    collection_method: 'Confirm current allocation price with distributor — do not rely on retail benchmarks',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-024',
    category: 'product',
    description: 'ABV not confirmed for several products — using standard category defaults',
    affects_products: 'multiple',
    priority: 'low',
    collection_method: 'Read label on next bottle received; update product record',
    collection_owner: 'Bar Manager'
  },
  {
    gap_id: 'gap-025',
    category: 'product',
    description: 'Bitters, syrups, and mixers not yet in the seed database',
    affects_products: 'cocktail_costing',
    priority: 'medium',
    collection_method: 'Add Angostura, Peychauds, and core syrups in next data collection cycle',
    collection_owner: 'Bar Manager / HESTIA Development'
  }
]
