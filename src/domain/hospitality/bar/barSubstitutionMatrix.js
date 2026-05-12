// Category-level substitution groups.
// When a specific product is unavailable (86'd), these groups identify
// which other products can fill the same functional role in a cocktail.
// Substitutions are flagged with their impact on flavor and cost.

export const SUBSTITUTION_GROUPS = [
  {
    group_id: 'sub-001',
    role: 'london_dry_gin',
    primary_category: 'gin',
    description: 'Classic London Dry gin — neutral juniper-forward base',
    products: ['gin-009', 'gin-010', 'gin-002', 'gin-004'],
    acceptable_substitutes: ['gin-001', 'gin-011', 'gin-013'],
    flavor_impact: 'minimal',
    cost_impact: 'low'
  },
  {
    group_id: 'sub-002',
    role: 'premium_gin',
    primary_category: 'gin',
    description: 'Contemporary premium gin with botanical character',
    products: ['gin-001', 'gin-003', 'gin-006', 'gin-008'],
    acceptable_substitutes: ['gin-002', 'gin-004'],
    flavor_impact: 'moderate',
    cost_impact: 'medium'
  },
  {
    group_id: 'sub-003',
    role: 'blanco_tequila',
    primary_category: 'tequila',
    description: 'Silver/blanco tequila for Margaritas and cocktails',
    products: ['teq-008', 'teq-009', 'teq-007', 'teq-016'],
    acceptable_substitutes: ['teq-001', 'teq-004', 'teq-014'],
    flavor_impact: 'low',
    cost_impact: 'medium'
  },
  {
    group_id: 'sub-004',
    role: 'premium_blanco_tequila',
    primary_category: 'tequila',
    description: 'Premium 100% agave blanco for quality Margaritas',
    products: ['teq-001', 'teq-004', 'teq-014', 'teq-016'],
    acceptable_substitutes: ['teq-007', 'teq-010'],
    flavor_impact: 'moderate',
    cost_impact: 'medium'
  },
  {
    group_id: 'sub-005',
    role: 'mezcal',
    primary_category: 'mezcal',
    description: 'Smoky agave spirit — not interchangeable with tequila without guest awareness',
    products: ['teq-011', 'teq-012', 'teq-013', 'teq-015'],
    acceptable_substitutes: [],
    flavor_impact: 'high',
    cost_impact: 'high',
    notes: 'Mezcal cannot silently substitute tequila. Guest must be informed of the smoky character.'
  },
  {
    group_id: 'sub-006',
    role: 'well_vodka',
    primary_category: 'vodka',
    description: 'Standard house vodka for well cocktails',
    products: ['vod-007', 'vod-006', 'vod-008'],
    acceptable_substitutes: ['vod-003', 'vod-005', 'vod-010'],
    flavor_impact: 'minimal',
    cost_impact: 'low'
  },
  {
    group_id: 'sub-007',
    role: 'premium_vodka',
    primary_category: 'vodka',
    description: 'Premium vodka for Martinis and neat service',
    products: ['vod-001', 'vod-002', 'vod-009'],
    acceptable_substitutes: ['vod-004', 'vod-012'],
    flavor_impact: 'moderate',
    cost_impact: 'low'
  },
  {
    group_id: 'sub-008',
    role: 'sweet_vermouth',
    primary_category: 'vermouth_sweet',
    description: 'Sweet/Rosso vermouth — Negroni, Manhattan, Boulevardier',
    products: ['liq-002'],
    acceptable_substitutes: ['liq-003'],
    flavor_impact: 'high',
    cost_impact: 'medium',
    notes: 'Only Martini Rosso is currently seeded. Any red vermouth substitution changes cocktail character significantly.'
  },
  {
    group_id: 'sub-009',
    role: 'dry_vermouth',
    primary_category: 'vermouth_dry',
    description: 'Dry vermouth for Martinis and spritzes',
    products: ['liq-001'],
    acceptable_substitutes: [],
    flavor_impact: 'high',
    cost_impact: 'low',
    notes: 'No dry vermouth substitute seeded. Offer a different serve if unavailable.'
  },
  {
    group_id: 'sub-010',
    role: 'triple_sec',
    primary_category: 'liqueur_triple_sec',
    description: 'Orange liqueur for Margaritas, Cosmopolitans',
    products: ['liq-006'],
    acceptable_substitutes: ['liq-005'],
    flavor_impact: 'moderate',
    cost_impact: 'high',
    notes: 'Cointreau (liq-005) is a premium substitute — costs ~2× more per pour.'
  },
  {
    group_id: 'sub-011',
    role: 'bourbon',
    primary_category: 'whisky_bourbon',
    description: 'Bourbon for Old Fashioneds, Manhattans, whiskey cocktails',
    products: ['whi-008', 'whi-007'],
    acceptable_substitutes: ['whi-009', 'whi-010', 'whi-011'],
    flavor_impact: 'low',
    cost_impact: 'medium'
  },
  {
    group_id: 'sub-012',
    role: 'scotch',
    primary_category: 'whisky_scotch',
    description: 'Blended Scotch for Highballs and calls',
    products: ['whi-001', 'whi-006'],
    acceptable_substitutes: ['whi-002'],
    flavor_impact: 'low',
    cost_impact: 'medium'
  }
]
