// ─── MARKET REFERENCE CANDIDATES — NOT OPERATIONAL SUPPLIER RECORDS ──────────
//
// This file contains research-derived market candidate data for Israeli bar
// product suppliers. These are NOT HESTIA venue suppliers. They are NOT active
// or verified operational records. No relationship with this venue has been
// confirmed. No values are source-backed unless source_url and source_name
// are explicitly populated.
//
// DO NOT:
//   - Use these candidates to drive purchasing or ordering decisions
//   - Feed these into costing, pour cost, or pricing calculations
//   - Surface these in owner reports, briefings, or supplier recommendations
//   - Treat assumed_delivery_days, assumed_lead_time_days, or assumed_coverage
//     as confirmed operational facts
//   - Infer venue relationships from category coverage lists
//
// Every candidate carries:
//   relationship_status: 'market_reference_only'
//   data_status: 'needs_validation'
//   confidence_level: 'low'
//   requires_human_validation: true
//
// All operational fields (coverage, delivery schedule, lead time, VAT) are
// prefixed assumed_ and represent unverified market research assumptions.
// They must be confirmed by direct supplier contact before any operational use.
// ─────────────────────────────────────────────────────────────────────────────

// Reliability level definitions — for use after human validation is complete
export const SUPPLIER_RELIABILITY_LEVELS = {
  high: { id: 'high', label: 'High Reliability', description: 'Consistent delivery, accurate invoicing, responsive — confirmed by venue track record' },
  medium: { id: 'medium', label: 'Medium Reliability', description: 'Generally reliable; occasional delays — confirmed by venue track record' },
  low: { id: 'low', label: 'Low Reliability', description: 'Inconsistent — confirmed by venue track record' },
  needs_validation: { id: 'needs_validation', label: 'Needs Validation', description: 'No venue track record. Reliability has not been assessed.' }
}

export const SUPPLIER_TYPES = {
  importer: 'Official brand importer or exclusive distributor',
  distributor: 'Multi-brand local distributor',
  producer: 'Direct from producer or local brand',
  specialty: 'Specialist supplier (syrups, bitters, non-alcoholic)',
  produce: 'Fresh produce — fruits, herbs, garnish'
}

// Classification defaults applied to every candidate — do not override without human validation
export const CANDIDATE_CLASSIFICATION_DEFAULTS = {
  relationship_status: 'market_reference_only',
  data_status: 'needs_validation',
  confidence_level: 'low',
  source_quality: 'unknown',
  source_url: null,
  source_name: null,
  last_checked_date: null,
  can_drive_automation: false,
  can_drive_costing: false,
  can_appear_in_owner_reports: false,
  requires_human_validation: true
}

export const MARKET_SUPPLIER_CANDIDATES = [
  {
    candidate_id: 'cand-001',
    name: 'Multinational',
    type: 'importer',
    // ── Classification ────────────────────────────────────────────────────────
    relationship_status: 'market_reference_only',
    data_status: 'needs_validation',
    confidence_level: 'low',
    source_quality: 'unknown',
    source_url: null,
    source_name: null,
    last_checked_date: null,
    can_drive_automation: false,
    can_drive_costing: false,
    can_appear_in_owner_reports: false,
    requires_human_validation: true,
    // ── Unverified assumptions (market research only) ─────────────────────────
    assumed_reliability: 'needs_validation',
    assumed_coverage: ['whisky_scotch', 'whisky_bourbon', 'whisky_irish', 'whisky_japanese', 'gin', 'vodka', 'rum', 'cognac', 'armagnac', 'liqueur_herbal', 'liqueur_amaro', 'liqueur_coffee'],
    assumed_delivery_days: null,
    assumed_lead_time_days: null,
    assumed_vat_on_invoices: null,
    notes: 'Market research reference only. General-purpose importer for major international spirits brands. Not a confirmed venue supplier. Contact, terms, and coverage must be validated before operational use.'
  },
  {
    candidate_id: 'cand-002',
    name: 'Benozyo',
    type: 'distributor',
    // ── Classification ────────────────────────────────────────────────────────
    relationship_status: 'market_reference_only',
    data_status: 'needs_validation',
    confidence_level: 'low',
    source_quality: 'unknown',
    source_url: null,
    source_name: null,
    last_checked_date: null,
    can_drive_automation: false,
    can_drive_costing: false,
    can_appear_in_owner_reports: false,
    requires_human_validation: true,
    // ── Unverified assumptions (market research only) ─────────────────────────
    assumed_reliability: 'needs_validation',
    assumed_coverage: ['tequila', 'mezcal', 'vodka', 'gin', 'rum', 'brandy', 'liqueur_fruit', 'liqueur_triple_sec', 'liqueur_elderflower'],
    assumed_delivery_days: null,
    assumed_lead_time_days: null,
    assumed_vat_on_invoices: null,
    notes: 'Market research reference only. Known as an Israeli distributor with agave category presence. Not a confirmed venue supplier. Coverage, pricing, and terms must be validated by direct contact.'
  },
  {
    candidate_id: 'cand-003',
    name: 'Tempo Beverages',
    type: 'importer',
    // ── Classification ────────────────────────────────────────────────────────
    relationship_status: 'market_reference_only',
    data_status: 'needs_validation',
    confidence_level: 'low',
    source_quality: 'unknown',
    source_url: null,
    source_name: null,
    last_checked_date: null,
    can_drive_automation: false,
    can_drive_costing: false,
    can_appear_in_owner_reports: false,
    requires_human_validation: true,
    // ── Unverified assumptions (market research only) ─────────────────────────
    assumed_reliability: 'needs_validation',
    assumed_coverage: ['rum', 'vodka', 'gin', 'liqueur_herbal', 'liqueur_cream', 'vermouth_dry', 'vermouth_sweet', 'vermouth_blanc', 'aperitif_spirit'],
    assumed_delivery_days: null,
    assumed_lead_time_days: null,
    assumed_vat_on_invoices: null,
    notes: 'Market research reference only. Known importer for Bacardi and Martini portfolio brands in Israel. Vermouth coverage is assumed — not venue-confirmed. Contact and terms must be validated.'
  },
  {
    candidate_id: 'cand-004',
    name: 'Carmel / Local Wine Importer',
    type: 'producer',
    // ── Classification ────────────────────────────────────────────────────────
    relationship_status: 'market_reference_only',
    data_status: 'needs_validation',
    confidence_level: 'low',
    source_quality: 'unknown',
    source_url: null,
    source_name: null,
    last_checked_date: null,
    can_drive_automation: false,
    can_drive_costing: false,
    can_appear_in_owner_reports: false,
    requires_human_validation: true,
    // ── Unverified assumptions (market research only) ─────────────────────────
    assumed_reliability: 'needs_validation',
    assumed_coverage: ['aperitif_wine', 'vermouth_dry', 'vermouth_sweet'],
    assumed_delivery_days: null,
    assumed_lead_time_days: null,
    assumed_vat_on_invoices: null,
    notes: 'Market research reference only. Represents Israeli wine-based aperitif and local fortified wine production. Specific products, pricing, and availability must be confirmed by direct contact.'
  },
  {
    candidate_id: 'cand-005',
    name: 'Local Arak Distributor',
    type: 'distributor',
    // ── Classification ────────────────────────────────────────────────────────
    relationship_status: 'market_reference_only',
    data_status: 'needs_validation',
    confidence_level: 'low',
    source_quality: 'unknown',
    source_url: null,
    source_name: null,
    last_checked_date: null,
    can_drive_automation: false,
    can_drive_costing: false,
    can_appear_in_owner_reports: false,
    requires_human_validation: true,
    // ── Unverified assumptions (market research only) ─────────────────────────
    assumed_reliability: 'needs_validation',
    assumed_coverage: ['arak', 'digestif', 'liqueur_herbal'],
    assumed_delivery_days: null,
    assumed_lead_time_days: null,
    assumed_vat_on_invoices: null,
    notes: 'Market research reference only. Placeholder for local arak distribution channel. Actual supplier name, contact, and pricing are unknown and must be confirmed. Arak prices in the Israeli market fluctuate significantly.'
  },
  {
    candidate_id: 'cand-006',
    name: 'Fresh Produce Supplier',
    type: 'produce',
    // ── Classification ────────────────────────────────────────────────────────
    relationship_status: 'market_reference_only',
    data_status: 'needs_validation',
    confidence_level: 'low',
    source_quality: 'unknown',
    source_url: null,
    source_name: null,
    last_checked_date: null,
    can_drive_automation: false,
    can_drive_costing: false,
    can_appear_in_owner_reports: false,
    requires_human_validation: true,
    // ── Unverified assumptions (market research only) ─────────────────────────
    assumed_reliability: 'needs_validation',
    assumed_coverage: ['fresh_citrus', 'garnish'],
    assumed_delivery_days: null,
    assumed_lead_time_days: null,
    assumed_vat_on_invoices: null,
    notes: 'Placeholder category candidate only. No specific supplier identified. Actual fresh produce supplier must be recorded by the venue once confirmed — including name, contact, weekly unit prices, and delivery schedule.'
  },
  {
    candidate_id: 'cand-007',
    name: 'Premium Syrup Supplier',
    type: 'specialty',
    // ── Classification ────────────────────────────────────────────────────────
    relationship_status: 'market_reference_only',
    data_status: 'needs_validation',
    confidence_level: 'low',
    source_quality: 'unknown',
    source_url: null,
    source_name: null,
    last_checked_date: null,
    can_drive_automation: false,
    can_drive_costing: false,
    can_appear_in_owner_reports: false,
    requires_human_validation: true,
    // ── Unverified assumptions (market research only) ─────────────────────────
    assumed_reliability: 'needs_validation',
    assumed_coverage: ['simple_syrup', 'bitters'],
    assumed_delivery_days: null,
    assumed_lead_time_days: null,
    assumed_vat_on_invoices: null,
    notes: 'Placeholder category candidate only. Represents branded syrup options (e.g. Monin, 1883) or in-house production. No specific supplier confirmed. Must be validated before any costing use.'
  }
]

// ─── Research utility functions ───────────────────────────────────────────────
// These functions filter market reference candidates only.
// Results are NOT supplier recommendations and must NOT drive purchasing or costing.

// Returns market reference candidates that list a category in their assumed_coverage.
// Result is research context only — not a validated supplier list for this venue.
export function candidatesForCategory(categoryId) {
  return MARKET_SUPPLIER_CANDIDATES.filter(c => (c.assumed_coverage || []).includes(categoryId))
}
