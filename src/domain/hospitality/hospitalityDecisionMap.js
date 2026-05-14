// Decision map for hospitality operations in HESTIA.
// Defines which entities influence which operational decisions, and what data is needed before automation.
// This is a schema definition only — no runtime behavior, no fake operational records.

// ─── Staffing decisions ────────────────────────────────────────────────────────

export const STAFFING_DECISIONS = {
  decisionName: 'Staffing Plan',
  description: 'How many staff of which roles are needed for a given shift or event.',
  inputEntities: ['Shift', 'Forecast', 'EventBooking', 'ServiceArea', 'Reservation', 'Venue'],
  leadingIndicators: [
    'Reservation count and party sizes for the shift',
    'Forecast covers for the period',
    'Event bookings requiring dedicated staff',
    'Known VIP arrivals requiring elevated service',
    'Accessibility requirements that need specific skills',
  ],
  laggingIndicators: [
    'Table turn times from previous comparable shifts',
    'Guest-to-server ratios that correlated with complaint volume',
    'Revenue per labor hour by role',
    'Comp rate by server (indicator of service overload)',
  ],
  riskSignals: [
    'New staff scheduled without a paired senior for a high-volume shift',
    'Event booking with accessibility requirements but no accessibility-certified staff confirmed',
    'Forecast significantly higher than previous week with same staffing template',
    'Key role (manager, expo, host) uncovered',
  ],
  recommendedActions: [
    'Cross-reference reservation party sizes with section capacity before finalizing section assignments',
    'Ensure at least one accessibility-trained staff member per shift with accessible seating',
    'Flag events where confirmed head count exceeds staffing ratio thresholds',
    'Notify manager when any critical role is unstaffed within 24h of shift start',
  ],
  relevantAgents: ['ShiftBrainAgent', 'EventPlanningAgent', 'StaffCoachingAgent'],
  dataNeededBeforeAutomation: [
    'Confirmed staff-to-cover ratios by shift type',
    'Historical incident rate by staffing level',
    'Event complexity scoring model',
    'Accessibility certification records per staff member',
  ],
}

export const MENU_DECISIONS = {
  decisionName: 'Menu Engineering',
  description: 'Which items stay on the menu, which are updated, and how they are priced.',
  inputEntities: ['MenuItem', 'RecipeVersion', 'InventoryItem', 'Supplier', 'InvoiceLine', 'Check', 'WasteLog', 'KPISnapshot'],
  leadingIndicators: [
    'Ingredient cost trends from recent invoice lines',
    'New seasonal ingredient availability',
    'Guest feedback patterns by item category',
    'Sales mix by item (what is actually being ordered)',
    'Prep burden per item (time, skill, mise en place requirements)',
  ],
  laggingIndicators: [
    'Food cost percentage by menu section',
    'Revenue contribution by item over a period',
    'Return rate (guests who ordered item and returned)',
    'Complaint or comp rate associated with specific items',
  ],
  riskSignals: [
    'Core ingredient cost increases greater than 15% without a menu price review',
    'Item with high waste log frequency and low order volume',
    'Recipe version change without a margin recalculation',
    'Signature item with high order volume but below-threshold margin',
  ],
  recommendedActions: [
    'Flag items where current cost-of-goods exceeds target food cost threshold',
    'Suggest seasonal substitutions when ingredient costs spike',
    'Surface items that are popular but low-margin for a pricing review',
    'Alert when a new recipe version is deployed without a costed version attached',
  ],
  relevantAgents: ['MenuEngineeringAgent', 'InventoryIntelligenceAgent', 'BarManagerAgent'],
  dataNeededBeforeAutomation: [
    'Linked invoice lines to recipe ingredient costs',
    'Per-item order count from POS integration',
    'Waste log categorized by item and reason',
    'Historical margin by item and period',
  ],
}

export const INVENTORY_DECISIONS = {
  decisionName: 'Inventory Management',
  description: 'When to order, how much to order, and from which supplier.',
  inputEntities: ['InventoryItem', 'StockCount', 'WasteLog', 'PurchaseOrder', 'Supplier', 'Forecast', 'RecipeVersion'],
  leadingIndicators: [
    'Par level relative to current stock',
    'Days of supply remaining based on current usage rate',
    'Upcoming event bookings that will spike demand',
    'Supplier lead time for reorder',
    'Seasonal demand patterns',
  ],
  laggingIndicators: [
    'Variance between theoretical usage (recipes × covers) and physical count',
    'Waste log totals by category',
    'Supplier delivery reliability score',
    'Cost per unit trend over time',
  ],
  riskSignals: [
    'Stock at or below par level without a purchase order placed',
    'Variance consistently higher than 5% for a specific item without investigation',
    'Key ingredient single-sourced from a supplier with reliability issues',
    'Upcoming large event without confirmed inventory for the package menu',
  ],
  recommendedActions: [
    'Alert when stock drops below par threshold without an open purchase order',
    'Surface items with recurring negative variance for manager review',
    'Suggest backup supplier qualification for single-sourced critical items',
    'Pre-calculate event inventory requirements from event booking and package details',
  ],
  relevantAgents: ['InventoryIntelligenceAgent', 'SupplierIntelligenceAgent', 'EventPlanningAgent'],
  dataNeededBeforeAutomation: [
    'Accurate par levels set per item',
    'Usage rates derived from recipe usage × confirmed covers',
    'Supplier lead time records',
    'Event package to ingredient mapping',
  ],
}

export const SERVICE_RECOVERY_DECISIONS = {
  decisionName: 'Service Recovery',
  description: 'What action to take when a guest experience fails, and at what authority level.',
  inputEntities: ['Incident', 'Guest', 'VIPGuest', 'ServiceRecoveryAction', 'Manager', 'Memory', 'Check'],
  leadingIndicators: [
    'Incident type and severity',
    'Guest VIP or regular status',
    'Guest history with prior incidents or recoveries',
    'Complaint tone and escalation signals',
    'Time remaining in the guest visit',
  ],
  laggingIndicators: [
    'Recovery acceptance rate by action type',
    'Return rate after recovery by incident type',
    'Comp cost by incident category',
    'Staff-reported guest satisfaction after recovery',
  ],
  riskSignals: [
    'VIP guest incident without manager notification',
    'Same guest experiencing a second incident on the same visit',
    'Recovery cost exceeding manager comp authority without escalation',
    'Guest with prior unresolved incident returning without acknowledgment',
  ],
  recommendedActions: [
    'Immediate manager notification for VIP incidents',
    'Offer recovery within the visit when possible — post-visit recovery is weaker',
    'Link recovery actions to the guest profile for future personalization',
    'Record the root cause, not just the resolution, to close the learning loop',
  ],
  relevantAgents: ['ServiceRecoveryAgent', 'GuestMemoryAgent', 'ShiftBrainAgent'],
  dataNeededBeforeAutomation: [
    'Guest profile linked to visit and incident',
    'Manager comp authority thresholds by role',
    'Incident severity classification rules',
    'Recovery action outcome tracking (return or not)',
  ],
}

export const EVENT_PLANNING_DECISIONS = {
  decisionName: 'Event Planning',
  description: 'How to configure, staff, and resource an event from booking to execution.',
  inputEntities: ['EventBooking', 'EventClient', 'Package', 'SeatingPlan', 'AccessibilityRequirement', 'StaffMember', 'Inventory', 'PrivateRoom', 'Ballroom'],
  leadingIndicators: [
    'Confirmed guest count and dietary breakdown',
    'Accessibility requirements from client',
    'Package details and minimum revenue',
    'Setup complexity from floor plan',
    'Prior event history with the same client',
  ],
  laggingIndicators: [
    'Actual versus budgeted revenue per past event',
    'Complaint rate by event type',
    'Staff feedback on event execution quality',
    'Client re-booking rate after events',
  ],
  riskSignals: [
    'Event confirmed without confirmed accessibility path for a declared requirement',
    'Guest count change within 48h without staffing plan adjustment',
    'Package with food items not yet confirmed with kitchen or inventory',
    'Event client with prior complaint history not flagged for elevated attention',
  ],
  recommendedActions: [
    'Lock in accessibility walk-through at least 48h before event',
    'Build a staffing-to-guest-count ratio check into confirmation workflow',
    'Automatically generate an inventory pull list from package menu at confirmation',
    'Flag returning event clients with prior feedback for personalized pre-event contact',
  ],
  relevantAgents: ['EventPlanningAgent', 'AccessibilityPlanningAgent', 'InventoryIntelligenceAgent'],
  dataNeededBeforeAutomation: [
    'Package-to-ingredient mapping for auto-generated pull lists',
    'Staffing ratios by event type and size',
    'Accessibility requirement classification and compliance checklist',
    'Historical event profitability by event type',
  ],
}

export const HOTEL_READINESS_DECISIONS = {
  decisionName: 'Hotel Arrival Readiness',
  description: 'Ensuring the right room is clean, inspected, and personalized before guest arrival.',
  inputEntities: ['Stay', 'GuestRoom', 'HousekeepingTask', 'Guest', 'AccessibilityRequirement', 'MaintenanceTicket', 'Memory'],
  leadingIndicators: [
    'Confirmed arrival time and early check-in requests',
    'Room assignment with accessibility requirements',
    'Housekeeping task status by room',
    'Open maintenance tickets on assigned room or adjacent rooms',
    'Guest memory signals (VIP, celebratory, prior complaint)',
  ],
  laggingIndicators: [
    'Clean-to-inspect lag by housekeeper and inspector pair',
    'Delay rate by room type or floor',
    'Guest satisfaction score after check-in experience',
    'Complaint rate linked to arrival experience',
  ],
  riskSignals: [
    'Arrival time within 1h and room still in "cleaning" status without inspector assigned',
    'Maintenance ticket open on the assigned room',
    'VIP arrival without personalization instructions confirmed',
    'Accessible room assigned but accessibility check not confirmed',
  ],
  recommendedActions: [
    'Alert front desk when arrival is imminent and room is not in "clean and inspected" status',
    'Block room assignment if an open maintenance ticket exists',
    'Auto-generate a personalization brief for VIP arrivals from guest memory',
    'Require inspector sign-off as a separate step from housekeeper completion',
  ],
  relevantAgents: ['HotelOperationsBrain', 'GuestMemoryAgent', 'AccessibilityPlanningAgent'],
  dataNeededBeforeAutomation: [
    'Real-time room status feed from housekeeping workflow',
    'Arrival time confirmed and surfaced at least 2h before',
    'Guest memory accessible to front desk and housekeeping',
    'Maintenance ticket linkage to room assignment workflow',
  ],
}

export const STAFF_COACHING_DECISIONS = {
  decisionName: 'Staff Coaching',
  description: 'When and how to coach a staff member based on observed performance signals.',
  inputEntities: ['StaffMember', 'CoachingNote', 'Incident', 'SOP', 'ShiftReport', 'Manager', 'TrainingModule'],
  leadingIndicators: [
    'Incidents attributable to a specific staff member',
    'Comp rate above peer average without explanation',
    'Guest complaints mentioning a specific server',
    'Checklist completion rate below standard',
    'Training completion status for required modules',
  ],
  laggingIndicators: [
    'Repeat incidents by the same staff member',
    'SOP violation patterns over time',
    'Manager escalation frequency per staff member',
    'Improvement rate after previous coaching intervention',
  ],
  riskSignals: [
    'Staff member with two or more incidents of the same type without a documented coaching note',
    'New staff member on a high-volume shift without a confirmed support pairing',
    'Expired certification for a required role (e.g. alcohol service license)',
    'Staff member missing from required training with an upcoming compliance deadline',
  ],
  recommendedActions: [
    'Trigger a coaching note recommendation after a second incident of the same type',
    'Surface training module suggestions linked to the incident category',
    'Alert manager when a certification expiry is within 30 days',
    'Recognize staff members with consistent positive signals — coaching is not only corrective',
  ],
  relevantAgents: ['StaffCoachingAgent', 'ShiftBrainAgent', 'PostShiftIntelligenceAgent'],
  dataNeededBeforeAutomation: [
    'Incident-to-staff attribution (not always clear)',
    'Coaching note history and outcomes',
    'Training completion records',
    'Certification expiry tracking',
  ],
}

export const hospitalityDecisionMap = {
  staffing: STAFFING_DECISIONS,
  menu: MENU_DECISIONS,
  inventory: INVENTORY_DECISIONS,
  serviceRecovery: SERVICE_RECOVERY_DECISIONS,
  eventPlanning: EVENT_PLANNING_DECISIONS,
  hotelReadiness: HOTEL_READINESS_DECISIONS,
  staffCoaching: STAFF_COACHING_DECISIONS,
}
