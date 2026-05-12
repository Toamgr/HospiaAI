export const CONFIDENCE_LEVELS = {
  high: {
    id: 'high',
    label: 'High Confidence',
    description: 'Source-backed, recently verified, usable for costing decisions',
    costing_eligible: true,
    display_color: 'emerald'
  },
  medium: {
    id: 'medium',
    label: 'Medium Confidence',
    description: 'Benchmark estimate — directionally correct, not source-verified',
    costing_eligible: true,
    display_color: 'amber'
  },
  low: {
    id: 'low',
    label: 'Low Confidence',
    description: 'Expert assumption or outdated data — use with caution',
    costing_eligible: false,
    display_color: 'orange'
  },
  unknown: {
    id: 'unknown',
    label: 'Unknown',
    description: 'No data available. Cannot be used for costing.',
    costing_eligible: false,
    display_color: 'red'
  }
}

export const DATA_STATUS = {
  verified_source_backed: {
    id: 'verified_source_backed',
    label: 'Verified — Source Backed',
    description: 'Price confirmed from a named supplier, invoice, or official importer',
    requires_source: true,
    requires_url: false
  },
  benchmark_estimate: {
    id: 'benchmark_estimate',
    label: 'Benchmark Estimate',
    description: 'Price derived from market research, comparable venues, or retail observation',
    requires_source: false,
    requires_url: false
  },
  operational_assumption: {
    id: 'operational_assumption',
    label: 'Operational Assumption',
    description: 'Internal estimate based on operational knowledge — not market-derived',
    requires_source: false,
    requires_url: false
  },
  needs_validation: {
    id: 'needs_validation',
    label: 'Needs Validation',
    description: 'Data exists but has not been verified against a live source',
    requires_source: false,
    requires_url: false
  },
  unavailable: {
    id: 'unavailable',
    label: 'Unavailable',
    description: 'No data could be found for this field',
    requires_source: false,
    requires_url: false
  }
}

export const SOURCE_QUALITY = {
  official_supplier: { id: 'official_supplier', label: 'Official Supplier', weight: 1.0 },
  importer: { id: 'importer', label: 'Importer', weight: 0.95 },
  venue_invoice: { id: 'venue_invoice', label: 'Venue Invoice', weight: 0.9 },
  retailer: { id: 'retailer', label: 'Retailer', weight: 0.75 },
  price_comparison: { id: 'price_comparison', label: 'Price Comparison Site', weight: 0.6 },
  expert_assumption: { id: 'expert_assumption', label: 'Expert Assumption', weight: 0.4 },
  unknown: { id: 'unknown', label: 'Unknown', weight: 0 }
}

export const CONFIDENCE_RULES = [
  'A product with verified_source_backed status and source_quality >= retailer gets confidence_level: high',
  'A product with benchmark_estimate status gets confidence_level: medium by default',
  'A product with operational_assumption or needs_validation status gets confidence_level: low',
  'A product with unavailable status gets confidence_level: unknown',
  'Any product missing wholesale_price_nis gets a missing_data_warning regardless of other fields',
  'Any product with actual_venue_price_nis overrides benchmark_price_nis for costing calculations',
  'Pour cost calculations using low or unknown confidence data must surface a visible warning in UI'
]
