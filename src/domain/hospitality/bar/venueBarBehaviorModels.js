// Venue type behavior models for bar operations.
// Defines target pour cost %, typical margin expectations, and operational patterns.
// All percentages are operational_assumption unless noted otherwise.

export const VENUE_BAR_BEHAVIOR_MODELS = {
  high_volume_bar: {
    id: 'high_volume_bar',
    label: 'High Volume Bar',
    target_pour_cost_pct: 0.28,
    typical_gross_margin_pct: 0.72,
    typical_cocktail_price_range_nis: [40, 70],
    volume_profile: 'high',
    upsell_potential: 'low',
    data_status: 'operational_assumption',
    notes: 'Speed and throughput over margin. Lower margins accepted because of volume. Wells heavily used.'
  },
  casual_restaurant: {
    id: 'casual_restaurant',
    label: 'Casual Restaurant',
    target_pour_cost_pct: 0.25,
    typical_gross_margin_pct: 0.75,
    typical_cocktail_price_range_nis: [45, 75],
    volume_profile: 'medium',
    upsell_potential: 'medium',
    data_status: 'operational_assumption',
    notes: 'Balanced margins. Cocktail program is secondary to food. Call spirits dominate.'
  },
  upscale_restaurant: {
    id: 'upscale_restaurant',
    label: 'Upscale Restaurant',
    target_pour_cost_pct: 0.22,
    typical_gross_margin_pct: 0.78,
    typical_cocktail_price_range_nis: [60, 100],
    volume_profile: 'medium',
    upsell_potential: 'high',
    data_status: 'operational_assumption',
    notes: 'HESTIA primary venue model. Premium spirits expected. Signature cocktail program adds brand value.'
  },
  fine_dining: {
    id: 'fine_dining',
    label: 'Fine Dining',
    target_pour_cost_pct: 0.20,
    typical_gross_margin_pct: 0.80,
    typical_cocktail_price_range_nis: [80, 140],
    volume_profile: 'low',
    upsell_potential: 'very_high',
    data_status: 'operational_assumption',
    notes: 'Prestige pricing accepted by guests. Ultra-premium spirits justify high pour cost. Every pour is a statement.'
  },
  hotel_bar: {
    id: 'hotel_bar',
    label: 'Hotel Bar',
    target_pour_cost_pct: 0.22,
    typical_gross_margin_pct: 0.78,
    typical_cocktail_price_range_nis: [65, 110],
    volume_profile: 'medium',
    upsell_potential: 'high',
    data_status: 'operational_assumption',
    notes: 'Captive audience accepts premium pricing. Consistency and reliability prioritized over creativity.'
  },
  rooftop_cocktail_bar: {
    id: 'rooftop_cocktail_bar',
    label: 'Rooftop / Cocktail Bar',
    target_pour_cost_pct: 0.20,
    typical_gross_margin_pct: 0.80,
    typical_cocktail_price_range_nis: [70, 120],
    volume_profile: 'medium',
    upsell_potential: 'very_high',
    data_status: 'operational_assumption',
    notes: 'Experience pricing. Location and ambiance justify premium. Signature cocktails are a marketing tool.'
  },
  event_catering: {
    id: 'event_catering',
    label: 'Event Catering',
    target_pour_cost_pct: 0.30,
    typical_gross_margin_pct: 0.70,
    typical_cocktail_price_range_nis: [35, 60],
    volume_profile: 'very_high',
    upsell_potential: 'low',
    data_status: 'operational_assumption',
    notes: 'Package pricing. Higher pour costs accepted due to pre-negotiated revenue. Speed is paramount.'
  },
  members_club: {
    id: 'members_club',
    label: 'Members Club',
    target_pour_cost_pct: 0.18,
    typical_gross_margin_pct: 0.82,
    typical_cocktail_price_range_nis: [90, 160],
    volume_profile: 'low',
    upsell_potential: 'very_high',
    data_status: 'operational_assumption',
    notes: 'Highest margin model. Members expect prestige and personalization. Ultra-premium is standard, not special.'
  }
}
