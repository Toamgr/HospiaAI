// Relationship chains between hospitality entities in HESTIA.
// Each relationship defines operational, data, risk, and profitability impact.
// This file is a schema definition only — no runtime behavior, no fake records.
// Use this as the basis for graph-model thinking, agent reasoning, and reporting design.

// ─── Primary operational chains ────────────────────────────────────────────────

export const PRIMARY_CHAINS = [
  {
    id: 'guest_to_ltv',
    name: 'Guest Journey to Lifetime Value',
    chain: ['Guest', 'Reservation', 'Arrival', 'TableAssignment', 'Server', 'ServiceQuality', 'Review', 'Reputation', 'RepeatProbability', 'LTV'],
    from: 'Guest',
    to: 'LTV',
    relationshipType: 'lifecycle',
    description: 'The full arc from a guest booking through service execution to repeat behavior and long-term value.',
    operationalImpact: 'Every moment from reservation to departure affects whether the guest returns and recommends the venue.',
    dataImpact: 'Guest profile, visit history, and recovery events all compound into a qualitative LTV signal.',
    riskImpact: 'A single unresolved incident can break the chain and end the relationship.',
    profitabilityImpact: 'Repeat guests cost less to acquire, tend to spend more, and drive referrals.',
    relevantAgents: ['GuestMemoryAgent', 'ServiceRecoveryAgent', 'ShiftBrainAgent'],
  },
  {
    id: 'cocktail_to_margin',
    name: 'Cocktail Recipe to Menu Margin',
    chain: ['Cocktail', 'RecipeVersion', 'Ingredient', 'InventoryItem', 'Supplier', 'InvoiceLine', 'CostTrend', 'Margin', 'MenuDecision'],
    from: 'MenuItem',
    to: 'MenuDecision',
    relationshipType: 'cost_chain',
    description: 'How a cocktail recipe connects upstream to ingredient cost and downstream to menu engineering decisions.',
    operationalImpact: 'Recipe changes, supplier swaps, and price fluctuations all flow through to margin without immediate visibility.',
    dataImpact: 'Invoice lines must be linked to recipe versions to calculate true pour cost and menu margin.',
    riskImpact: 'A supplier price change on a key ingredient can silently erode the margin on a signature drink.',
    profitabilityImpact: 'Direct. The gap between recipe cost and menu price is the cocktail contribution margin.',
    relevantAgents: ['BarManagerAgent', 'InventoryIntelligenceAgent', 'MenuEngineeringAgent'],
  },
  {
    id: 'incident_to_sop',
    name: 'Incident to SOP Improvement',
    chain: ['Incident', 'RootCause', 'CoachingNote', 'SOPUpdate', 'FutureRiskReduction'],
    from: 'Incident',
    to: 'SOP',
    relationshipType: 'learning_loop',
    description: 'How a service incident translates through root cause analysis into a lasting improvement in standards.',
    operationalImpact: 'Incidents that are only resolved, not analyzed, repeat. The chain must reach the SOP to compound learning.',
    dataImpact: 'Incident records must be linkable to coaching notes and SOP versions to close the loop.',
    riskImpact: 'Without this chain, the same failure mode recurs with different staff on different shifts.',
    profitabilityImpact: 'Indirect. Reducing repeat incidents lowers recovery costs, staff frustration, and guest churn.',
    relevantAgents: ['StaffCoachingAgent', 'PostShiftIntelligenceAgent', 'ShiftBrainAgent'],
  },
  {
    id: 'event_to_profitability',
    name: 'Event Booking to Operational Load',
    chain: ['EventBooking', 'GuestCount', 'SeatingPlan', 'AccessibilityRequirement', 'StaffingPlan', 'OperationalLoad', 'Profitability'],
    from: 'EventBooking',
    to: 'Profitability',
    relationshipType: 'event_chain',
    description: 'How an event booking flows through planning decisions into actual profitability.',
    operationalImpact: 'Understaffing an event damages the guest experience; overstaffing erodes the margin.',
    dataImpact: 'Accurate guest counts and accessibility requirements must inform staffing ratios.',
    riskImpact: 'Unaddressed accessibility requirements are both a legal risk and a reputation risk.',
    profitabilityImpact: 'Event profitability depends on the gap between package revenue and staffing + food cost.',
    relevantAgents: ['EventPlanningAgent', 'AccessibilityPlanningAgent', 'InventoryIntelligenceAgent'],
  },
  {
    id: 'stockcount_to_control',
    name: 'Stock Count Variance to Control',
    chain: ['StockCountVariance', 'Waste', 'Overpour', 'CountingError', 'TheftSuspicion', 'ManagerAction', 'ControlImprovement'],
    from: 'StockCount',
    to: 'ConstraintRule',
    relationshipType: 'control_loop',
    description: 'How variance between theoretical and physical stock triggers investigation and corrective action.',
    operationalImpact: 'Variance without investigation normalizes loss. Variance with investigation drives accountability.',
    dataImpact: 'Variance must be categorized — waste, overpour, count error, or unexplained — to be actionable.',
    riskImpact: 'Unexplained variance is the leading signal for theft or systemic procedural failure.',
    profitabilityImpact: 'Beverage cost percentage is directly impacted by pour accuracy and inventory control.',
    relevantAgents: ['InventoryIntelligenceAgent', 'BarManagerAgent'],
  },
  {
    id: 'stay_to_satisfaction',
    name: 'Hotel Stay to Guest Satisfaction',
    chain: ['Stay', 'RoomAssignment', 'HousekeepingTask', 'RoomStatus', 'ArrivalReadiness', 'GuestSatisfaction'],
    from: 'Stay',
    to: 'Memory',
    relationshipType: 'lodging_loop',
    description: 'How a hotel stay progresses from booking through housekeeping execution to the guest arrival experience.',
    operationalImpact: 'Room not ready at check-in is the most common first-impression failure in hotel operations.',
    dataImpact: 'Room status must be real-time and linked to housekeeping task completion and inspector sign-off.',
    riskImpact: 'Arrival delays compound if a clean-to-inspect lag is not surfaced to the front desk in advance.',
    profitabilityImpact: 'Satisfaction scores affect OTA rankings, direct booking rates, and repeat stays.',
    relevantAgents: ['HotelOperationsBrain', 'GuestMemoryAgent'],
  },
  {
    id: 'complaint_to_personalization',
    name: 'Complaint to Future Personalization',
    chain: ['Complaint', 'ServiceRecoveryAction', 'FollowUp', 'GuestMemory', 'FuturePersonalization'],
    from: 'Incident',
    to: 'Memory',
    relationshipType: 'recovery_to_memory',
    description: 'How a complaint, when handled well, becomes a memory asset that enables superior future personalization.',
    operationalImpact: 'If recovery is recorded and linked to the guest, the next visit can acknowledge the history and demonstrate genuine care.',
    dataImpact: 'Recovery actions must be linked to the guest profile, not just the incident ticket.',
    riskImpact: 'A guest who had a bad experience and sees no acknowledgment on return will not give a third chance.',
    profitabilityImpact: 'A well-recovered complaint can create a more loyal guest than one who never had a problem.',
    relevantAgents: ['GuestMemoryAgent', 'ServiceRecoveryAgent'],
  },
]

// ─── Hidden correlations ────────────────────────────────────────────────────────
// These are non-obvious patterns that surface operational risk or opportunity.
// Agents and reporting systems should look for these signals.

export const HIDDEN_CORRELATIONS = [
  {
    id: 'wait_time_without_demand',
    signal: 'Wait time increases without a corresponding increase in reservation or walk-in volume.',
    likelyCauses: ['Section imbalance', 'Host stand throughput problem', 'Slow table turn due to pacing', 'Under-bussed sections'],
    operationalImplication: 'Do not default to "it was busy" as the explanation. Surface the pattern for section review.',
    relevantAgents: ['ShiftBrainAgent'],
  },
  {
    id: 'signature_cocktail_burden',
    signal: 'A popular or signature cocktail creates hidden prep burden that slows overall bar throughput.',
    likelyCauses: ['Complex garnish or prep requirement', 'Rare ingredient requiring special handling', 'Batching not implemented'],
    operationalImplication: 'Popularity is not always pure profit — account for the operational tax on throughput.',
    relevantAgents: ['BarManagerAgent', 'MenuEngineeringAgent'],
  },
  {
    id: 'high_comps_by_bartender',
    signal: 'One bartender consistently comps more than peers across multiple shifts.',
    likelyCauses: ['Inconsistent drink quality requiring remake', 'Cultural generosity misaligned with policy', 'Guest relationship management', 'Slow ticket complaints'],
    operationalImplication: 'Comp rate without context is noise. Cross-reference with ticket times, guest feedback, and drink quality signals.',
    relevantAgents: ['BarManagerAgent', 'StaffCoachingAgent'],
  },
  {
    id: 'seasonal_menu_procurement_variance',
    signal: 'A new seasonal menu generates unexpected procurement variance in the first weeks.',
    likelyCauses: ['Yield estimates for new ingredients are incorrect', 'Prep batch sizes not calibrated to demand', 'Supplier reliability untested for new SKUs'],
    operationalImplication: 'Monitor new menu items for the first 2-3 weeks before treating cost targets as stable.',
    relevantAgents: ['InventoryIntelligenceAgent', 'MenuEngineeringAgent'],
  },
  {
    id: 'vip_not_just_high_spend',
    signal: 'VIP status based only on spend score misses influence and recovery sensitivity dimensions.',
    likelyCauses: ['Social media influence not tracked', 'Past recovery incidents not linked to guest profile', 'Referral source not attributed'],
    operationalImplication: 'A VIP guest may have a modest check size but drive significant bookings through influence or loyalty.',
    relevantAgents: ['GuestMemoryAgent'],
  },
  {
    id: 'clean_to_inspect_lag',
    signal: 'A lag between housekeeping completion and inspector sign-off is not surfaced until check-in.',
    likelyCauses: ['Inspector shortage on shift', 'No real-time status update system', 'Communication gap between housekeeping and front desk'],
    operationalImplication: 'Arrival readiness requires the full chain — clean AND inspected AND confirmed — not just clean.',
    relevantAgents: ['HotelOperationsBrain'],
  },
  {
    id: 'recurring_maintenance_on_same_asset',
    signal: 'The same piece of equipment generates repeated maintenance tickets within a short period.',
    likelyCauses: ['Preventive maintenance loop broken', 'Repair was symptomatic not root-cause', 'Equipment at end of useful life'],
    operationalImplication: 'Three tickets on the same asset within 60 days should trigger a replace-vs-repair evaluation.',
    relevantAgents: ['HotelOperationsBrain', 'ShiftBrainAgent'],
  },
  {
    id: 'staff_chemistry_impact',
    signal: 'Certain staff pairings on the same shift consistently produce better or worse service signals.',
    likelyCauses: ['Communication style mismatches', 'Complementary versus competing strengths', 'Experience level gap'],
    operationalImplication: 'Scheduling is not just coverage — it is chemistry. Strong pairs should be documented and repeated.',
    relevantAgents: ['StaffCoachingAgent', 'ShiftBrainAgent'],
  },
  {
    id: 'allergy_incident_clustering',
    signal: 'Multiple allergy-related incidents cluster around a specific menu item, station, or time of service.',
    likelyCauses: ['Cross-contamination in prep', 'Ingredient substitution not communicated', 'Ticket modifier not honored'],
    operationalImplication: 'Even one allergy incident warrants immediate SOP review. A cluster is a systemic failure.',
    relevantAgents: ['KitchenFlowAgent', 'ServiceRecoveryAgent'],
  },
  {
    id: 'high_review_volume_after_event',
    signal: 'Review volume spikes significantly in the 48h after a large event.',
    likelyCauses: ['Event guests posting while experience is fresh', 'Positive or negative herd behavior in review writing'],
    operationalImplication: 'Monitor review platforms in the 48h post-event window. Respond promptly. Negative reviews compound if unanswered.',
    relevantAgents: ['GuestMemoryAgent', 'PostShiftIntelligenceAgent'],
  },
]

// ─── Relationship types taxonomy ───────────────────────────────────────────────

export const RELATIONSHIP_TYPES = {
  lifecycle: 'A progression through states or stages of a guest or operational journey.',
  cost_chain: 'A series of entities that together determine the true cost of a product or service.',
  learning_loop: 'A chain where an operational event generates insight that improves future behavior.',
  event_chain: 'A sequence of entities activated by an event booking through to execution and financial outcome.',
  control_loop: 'A cycle where a variance triggers investigation and corrective action.',
  lodging_loop: 'A hospitality-specific chain for room-based guest experiences.',
  recovery_to_memory: 'A chain where a service failure, when handled well, becomes a relationship asset.',
}

export const hospitalityRelationships = {
  primaryChains: PRIMARY_CHAINS,
  hiddenCorrelations: HIDDEN_CORRELATIONS,
  relationshipTypes: RELATIONSHIP_TYPES,
}
