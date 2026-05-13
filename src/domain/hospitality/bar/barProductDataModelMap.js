// Future database schema candidates for the bar product domain.
// Describes tables, fields, relationships, and indexing strategy for a relational DB migration.
// This layer has no runtime behavior. It is a design reference for schema migrations only.
// Tables marked status:'live' already exist in SQLite via server.js — do not re-create.

export const BAR_DATA_MODEL_MAP = {
  bar_products: {
    description: 'Master product catalog — one row per unique bar product SKU',
    primary_key: 'product_id',
    status: 'schema_only',
    fields: {
      product_id: { type: 'TEXT', required: true, description: 'Stable slug, e.g. vod-001. Freeze before adding FK tables.' },
      brand: { type: 'TEXT', required: true },
      product_name: { type: 'TEXT', required: true },
      category_id: { type: 'TEXT', required: true, references: 'bar_categories.category_id' },
      subcategory: { type: 'TEXT' },
      bottle_size_ml: { type: 'REAL', required: true },
      abv_percent: { type: 'REAL' },
      tier: { type: 'TEXT', allowed: ['well', 'call', 'premium', 'super_premium', 'ultra_premium'] },
      fast_moving: { type: 'INTEGER', description: '0 | 1 boolean' },
      storage_requirement: { type: 'TEXT', default: 'ambient' },
      common_usage: { type: 'TEXT' },
      active: { type: 'INTEGER', default: 1 }
    },
    indexes: ['category_id', 'tier', 'fast_moving']
  },

  bar_product_prices: {
    description: 'Pricing records per product per venue — one active row per product+venue pair',
    primary_key: ['product_id', 'venue_id'],
    status: 'schema_only',
    fields: {
      product_id: { type: 'TEXT', required: true, references: 'bar_products.product_id' },
      venue_id: { type: 'TEXT', required: true },
      benchmark_price_nis: { type: 'REAL' },
      actual_venue_price_nis: { type: 'REAL' },
      price_source: { type: 'TEXT', references: 'SOURCE_QUALITY enum in barConfidenceLevels.js' },
      source_url: { type: 'TEXT' },
      supplier_name: { type: 'TEXT' },
      store_name: { type: 'TEXT' },
      data_status: { type: 'TEXT', references: 'DATA_STATUS enum in barConfidenceLevels.js' },
      confidence_level: { type: 'TEXT', references: 'CONFIDENCE_LEVELS enum in barConfidenceLevels.js' },
      lowest_known_price_nis: { type: 'REAL' },
      highest_known_price_nis: { type: 'REAL' },
      vat_included: { type: 'INTEGER', description: '0 | 1 | NULL if unknown' },
      last_verified_at: { type: 'TEXT', description: 'ISO datetime' },
      notes: { type: 'TEXT' }
    },
    indexes: ['venue_id', 'data_status', 'confidence_level']
  },

  verified_price_overrides: {
    description: 'Venue-confirmed price overrides — supersede benchmark_price_nis for costing',
    primary_key: ['product_id', 'venue_id'],
    status: 'live',
    fields: {
      product_id: { type: 'TEXT' },
      venue_id: { type: 'TEXT' },
      normalized_update_json: { type: 'TEXT', description: 'JSON blob of verified fields' },
      updated_at: { type: 'TEXT' },
      updated_by: { type: 'TEXT' }
    }
  },

  verified_price_audit_log: {
    description: 'Append-only log of every save and clear action on verified_price_overrides',
    primary_key: 'id',
    status: 'live',
    fields: {
      id: { type: 'TEXT' },
      product_id: { type: 'TEXT', references: 'bar_products.product_id' },
      venue_id: { type: 'TEXT' },
      action: { type: 'TEXT', allowed: ['save', 'clear'] },
      old_price_nis: { type: 'REAL' },
      new_price_nis: { type: 'REAL' },
      supplier_name: { type: 'TEXT' },
      source_type: { type: 'TEXT' },
      saved_by: { type: 'TEXT' },
      saved_at: { type: 'TEXT', description: 'ISO datetime' }
    },
    indexes: ['product_id', 'saved_at']
  },

  bar_suppliers: {
    description: 'Supplier registry — Israeli distributor and importer records',
    primary_key: 'supplier_id',
    status: 'schema_only',
    fields: {
      supplier_id: { type: 'TEXT', required: true },
      name: { type: 'TEXT', required: true },
      type: { type: 'TEXT', allowed: ['importer', 'distributor', 'producer', 'specialty', 'produce'] },
      lead_time_days: { type: 'INTEGER' },
      vat_on_invoices: { type: 'INTEGER', description: '0 | 1' },
      reliability: { type: 'TEXT', references: 'SUPPLIER_RELIABILITY enum in barProductSupplierMap.js' },
      notes: { type: 'TEXT' }
    },
    indexes: ['type', 'reliability']
  },

  cocktail_recipes: {
    description: 'Approved cocktail recipes with pricing and lifecycle status',
    primary_key: 'recipe_id',
    status: 'schema_only',
    fields: {
      recipe_id: { type: 'TEXT', required: true },
      name: { type: 'TEXT', required: true },
      menu_price_nis: { type: 'REAL' },
      category: { type: 'TEXT' },
      status: { type: 'TEXT', allowed: ['approved', 'draft', 'retired'] },
      created_by: { type: 'TEXT' },
      approved_at: { type: 'TEXT' }
    },
    indexes: ['status']
  },

  cocktail_ingredients: {
    description: 'Many-to-many join: one row per recipe × product pair, with pour volume',
    primary_key: ['recipe_id', 'product_id'],
    status: 'schema_only',
    fields: {
      recipe_id: { type: 'TEXT', required: true, references: 'cocktail_recipes.recipe_id' },
      product_id: { type: 'TEXT', required: true, references: 'bar_products.product_id' },
      pour_ml: { type: 'REAL', required: true },
      apply_spillage: { type: 'INTEGER', default: 1 },
      ingredient_role: { type: 'TEXT', allowed: ['base', 'modifier', 'citrus', 'sweetener', 'topper', 'garnish', 'bitters'] }
    },
    indexes: ['recipe_id', 'product_id']
  }
}

export const BAR_DATA_MODEL_RELATIONSHIPS = [
  'bar_products.category_id → bar_categories.category_id (M:1)',
  'bar_product_prices.product_id → bar_products.product_id (M:1)',
  'verified_price_overrides.product_id → bar_products.product_id (M:1)',
  'verified_price_audit_log.product_id → bar_products.product_id (M:1)',
  'cocktail_ingredients.recipe_id → cocktail_recipes.recipe_id (M:1)',
  'cocktail_ingredients.product_id → bar_products.product_id (M:1)'
]

export const BAR_DATA_MODEL_MIGRATION_NOTES = [
  'verified_price_overrides and verified_price_audit_log are live in SQLite (server.js) — do not re-create.',
  'bar_products and cocktail_recipes exist in seed form only — not yet persisted to a DB table.',
  'Before creating bar_products table: freeze the product_id slug scheme (vod-001, gin-005 etc). All audit records reference it.',
  'When adding bar_suppliers table: backfill supplier_name on verified_price_audit_log rows where action=save.',
  'cocktail_ingredients join table requires stable product_id slugs — migrate bar_products table first.',
  'bar_product_prices table supersedes the benchmark CSV once enough venues have confirmed invoice prices.'
]
