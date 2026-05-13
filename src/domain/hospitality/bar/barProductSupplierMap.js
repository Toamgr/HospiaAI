// Israeli bar product supplier registry.
// Records supplier identity, product coverage, and ordering characteristics for the Israeli market.
// No runtime behavior — used for procurement intelligence and verified price attribution.

export const SUPPLIER_RELIABILITY = {
  high: { id: 'high', label: 'High Reliability', description: 'Consistent delivery, accurate invoicing, responsive' },
  medium: { id: 'medium', label: 'Medium Reliability', description: 'Generally reliable; occasional delays or substitutions' },
  low: { id: 'low', label: 'Low Reliability', description: 'Inconsistent — use only as backup supplier' },
  unknown: { id: 'unknown', label: 'Unknown', description: 'No track record yet with this venue' }
}

export const SUPPLIER_TYPES = {
  importer: 'Official brand importer or exclusive distributor',
  distributor: 'Multi-brand local distributor',
  producer: 'Direct from producer or local brand',
  specialty: 'Specialist supplier (syrups, bitters, non-alcoholic)',
  produce: 'Fresh produce — fruits, herbs, garnish'
}

export const ISRAEL_LIQUOR_SUPPLIERS = [
  {
    supplier_id: 'sup-001',
    name: 'Multinational',
    type: 'importer',
    coverage: ['whisky_scotch', 'whisky_bourbon', 'whisky_irish', 'whisky_japanese', 'gin', 'vodka', 'rum', 'cognac', 'armagnac', 'liqueur_herbal', 'liqueur_amaro', 'liqueur_coffee'],
    delivery_days: ['Sunday', 'Tuesday', 'Thursday'],
    lead_time_days: 2,
    minimum_order_nis: null,
    vat_on_invoices: true,
    reliability: 'high',
    notes: 'Primary importer for major international portfolio brands. Strong Scotch, bourbon, and gin coverage.'
  },
  {
    supplier_id: 'sup-002',
    name: 'Benozyo',
    type: 'distributor',
    coverage: ['tequila', 'mezcal', 'vodka', 'gin', 'rum', 'brandy', 'liqueur_fruit', 'liqueur_triple_sec', 'liqueur_elderflower'],
    delivery_days: ['Monday', 'Wednesday'],
    lead_time_days: 2,
    minimum_order_nis: null,
    vat_on_invoices: true,
    reliability: 'high',
    notes: 'Strong tequila and mezcal coverage. Reliable for premium agave category. Request invoice price before ordering ultra-premium lines.'
  },
  {
    supplier_id: 'sup-003',
    name: 'Tempo Beverages',
    type: 'importer',
    coverage: ['rum', 'vodka', 'gin', 'liqueur_herbal', 'liqueur_cream', 'vermouth_dry', 'vermouth_sweet', 'vermouth_blanc', 'aperitif_spirit'],
    delivery_days: ['Sunday', 'Wednesday'],
    lead_time_days: 3,
    minimum_order_nis: null,
    vat_on_invoices: true,
    reliability: 'high',
    notes: 'Official Bacardi and Martini importer. Best source for vermouth and Martini aperitifs.'
  },
  {
    supplier_id: 'sup-004',
    name: 'Carmel / Local Wine Importer',
    type: 'producer',
    coverage: ['aperitif_wine', 'vermouth_dry', 'vermouth_sweet'],
    delivery_days: ['Tuesday', 'Thursday'],
    lead_time_days: 3,
    minimum_order_nis: null,
    vat_on_invoices: true,
    reliability: 'medium',
    notes: 'Israeli wine-based aperitifs and locally produced fortified wine alternatives.'
  },
  {
    supplier_id: 'sup-005',
    name: 'Local Arak Distributor',
    type: 'distributor',
    coverage: ['arak', 'digestif', 'liqueur_herbal'],
    delivery_days: ['Monday', 'Thursday'],
    lead_time_days: 1,
    minimum_order_nis: null,
    vat_on_invoices: true,
    reliability: 'medium',
    notes: 'Primary source for arak. Prices fluctuate — always request current invoice price before ordering. Confirm which brands are in stock.'
  },
  {
    supplier_id: 'sup-006',
    name: 'Fresh Produce Supplier',
    type: 'produce',
    coverage: ['fresh_citrus', 'garnish'],
    delivery_days: ['Sunday', 'Tuesday', 'Thursday'],
    lead_time_days: 1,
    minimum_order_nis: null,
    vat_on_invoices: false,
    reliability: 'unknown',
    notes: 'Venue-specific. Record actual supplier name, contact, and weekly price per unit once confirmed. Track lemon and lime prices per fruit.'
  },
  {
    supplier_id: 'sup-007',
    name: 'Premium Syrup Supplier',
    type: 'specialty',
    coverage: ['simple_syrup', 'bitters'],
    delivery_days: null,
    lead_time_days: 5,
    minimum_order_nis: null,
    vat_on_invoices: true,
    reliability: 'unknown',
    notes: 'Monin, 1883, or Fever-Tree branded syrups. Consider in-house simple syrup production for cost control on base sweetener.'
  }
]

// All suppliers that cover a given category_id
export function suppliersForCategory(categoryId) {
  return ISRAEL_LIQUOR_SUPPLIERS.filter(s => s.coverage.includes(categoryId))
}

// Primary (highest reliability) supplier for a category
export function primarySupplierForCategory(categoryId) {
  const matches = suppliersForCategory(categoryId)
  const order = ['high', 'medium', 'low', 'unknown']
  return matches.sort((a, b) => order.indexOf(a.reliability) - order.indexOf(b.reliability))[0] || null
}

// Next available delivery day from a given ISO date string
export function nextDeliveryDay(supplierOrId, fromDateIso = new Date().toISOString()) {
  const supplier = typeof supplierOrId === 'string'
    ? ISRAEL_LIQUOR_SUPPLIERS.find(s => s.supplier_id === supplierOrId)
    : supplierOrId
  if (!supplier?.delivery_days?.length) return null
  const from = new Date(fromDateIso)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  for (let offset = 1; offset <= 7; offset++) {
    const candidate = new Date(from)
    candidate.setDate(from.getDate() + offset)
    if (supplier.delivery_days.includes(dayNames[candidate.getDay()])) {
      return candidate.toISOString().slice(0, 10)
    }
  }
  return null
}
