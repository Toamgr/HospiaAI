// Operational rules that govern bar product usage and service decisions.
// These are definitions only — no runtime enforcement logic here.

export const BAR_OPERATIONAL_RULES = [
  {
    rule_id: 'rule-001',
    name: 'Fresh citrus expiry',
    category: 'shelf_life',
    trigger: 'juice_batched_at',
    condition: 'hours_elapsed >= 8',
    action: 're_batch_required',
    severity: 'critical',
    rationale: 'Fresh lime and lemon juice oxidizes quickly. After 8 hours the acidity profile degrades noticeably in cocktails.'
  },
  {
    rule_id: 'rule-002',
    name: 'Open vermouth shelf life',
    category: 'shelf_life',
    trigger: 'bottle_opened_at',
    condition: 'category_id IN (vermouth_dry, vermouth_sweet, vermouth_blanc) AND hours_elapsed >= 48',
    action: 'quality_flag',
    severity: 'high',
    rationale: 'Vermouth is a fortified wine. Once opened it oxidizes within 24–72 hours without refrigeration.'
  },
  {
    rule_id: 'rule-003',
    name: 'Cream liqueur storage',
    category: 'storage',
    trigger: 'storage_requirement',
    condition: 'category_id = liqueur_cream AND storage_environment != refrigerated',
    action: 'storage_alert',
    severity: 'high',
    rationale: 'Cream liqueurs must be refrigerated after opening to prevent curdling and bacterial growth.'
  },
  {
    rule_id: 'rule-004',
    name: 'Carbonated mixer waste',
    category: 'waste',
    trigger: 'bottle_opened_at',
    condition: 'category_id = tonic_soda AND hours_elapsed >= 4 AND remaining_volume_pct > 0.5',
    action: 'waste_risk_flag',
    severity: 'medium',
    rationale: 'Open tonic/soda loses carbonation. Partial bottles used past 4 hours produce flat drinks and guest complaints.'
  },
  {
    rule_id: 'rule-005',
    name: 'Ultra-premium pour audit',
    category: 'cost_control',
    trigger: 'pour_recorded',
    condition: 'tier = ultra_premium',
    action: 'require_manager_acknowledgment',
    severity: 'high',
    rationale: 'Ultra-premium pours above 60ml should be acknowledged by a manager to prevent overpouring.'
  },
  {
    rule_id: 'rule-006',
    name: 'Comp before recovery',
    category: 'service_recovery',
    trigger: 'comp_issued',
    condition: 'resolution_attempt = none',
    action: 'flag_for_manager_review',
    severity: 'medium',
    rationale: 'Staff compensating without attempting structured recovery trains guests to expect financial resolution first.'
  },
  {
    rule_id: 'rule-007',
    name: 'Minimum pour cost threshold',
    category: 'pricing',
    trigger: 'menu_price_set',
    condition: 'pour_cost_percent > 30',
    action: 'pricing_review_flag',
    severity: 'medium',
    rationale: 'Cocktails priced above 30% pour cost are likely underpriced or using overly expensive ingredients.'
  },
  {
    rule_id: 'rule-008',
    name: 'Missing wholesale price block',
    category: 'data_quality',
    trigger: 'costing_calculation_requested',
    condition: 'benchmark_price_nis = null AND actual_venue_price_nis = null',
    action: 'block_costing_output',
    severity: 'critical',
    rationale: 'Cannot produce reliable costing without at least a benchmark price. Show "Supplier data missing — needs validation."'
  },
  {
    rule_id: 'rule-009',
    name: 'Benchmark estimate disclaimer',
    category: 'data_quality',
    trigger: 'price_displayed',
    condition: 'data_status = benchmark_estimate',
    action: 'show_benchmark_warning',
    severity: 'low',
    rationale: 'Benchmark estimates must always be flagged so decision-makers know the data is not source-backed.'
  },
  {
    rule_id: 'rule-010',
    name: 'VAT status unknown disclaimer',
    category: 'pricing',
    trigger: 'price_displayed',
    condition: 'vat_included = null',
    action: 'show_vat_warning',
    severity: 'low',
    rationale: 'Israeli VAT (17%) materially changes cocktail costing. If VAT status is unknown, flag it in all pricing outputs.'
  },
  {
    rule_id: 'rule-011',
    name: 'High-volume product reorder',
    category: 'inventory',
    trigger: 'stock_check',
    condition: 'fast_moving = true AND remaining_units <= 2',
    action: 'reorder_flag',
    severity: 'high',
    rationale: 'Fast-moving products dropping below 2 units are a service risk during peak hours.'
  },
  {
    rule_id: 'rule-012',
    name: 'Ice prep for events',
    category: 'prep',
    trigger: 'event_today = true',
    condition: 'ice_units_prepped < event_estimated_requirement',
    action: 'prep_alert',
    severity: 'critical',
    rationale: 'Ice shortages are the single most common bar bottleneck during events. Prep must be validated 2 hours before service.'
  },
  {
    rule_id: 'rule-013',
    name: 'Substitution available flag',
    category: 'operations',
    trigger: 'ingredient_unavailable',
    condition: 'substitution_matrix_has_match = true',
    action: 'suggest_substitution',
    severity: 'low',
    rationale: 'When an ingredient is unavailable, the substitution matrix can surface category-level alternatives to avoid 86\'ing cocktails.'
  }
]
