// Hospitality event taxonomy for HESTIA.
// Defines the full set of operational events that the system should recognize and log.
// This is a schema definition only — no event engine implementation, no runtime behavior.
// Use this to design the event log schema, train AI agents, and build reporting pipelines.

// ─── Sensitivity tiers ─────────────────────────────────────────────────────────
// low    — operational data, no personal sensitivity
// medium — involves named individuals but not medically or legally sensitive
// high   — involves medical data, protected characteristics, or disciplinary records

export const HOSPITALITY_EVENT_TYPES = [

  // ── Shift lifecycle ──────────────────────────────────────────────────────────

  {
    eventName: 'shift_started',
    description: 'A service shift has officially opened and operational mode is active.',
    trigger: 'Manager action or scheduled time trigger.',
    actorTypes: ['manager'],
    relatedEntities: ['Shift', 'Venue', 'StaffMember'],
    requiredPayloadFields: ['shiftId', 'venueId', 'startTime', 'managerId', 'staffOnFloor'],
    optionalPayloadFields: ['forecastedCovers', 'eventsToday', 'notes'],
    whyItMatters: 'Marks the start of the operational window; all subsequent events belong to a shift.',
    possibleAIUses: ['Initialize Shift Brain context', 'Pull relevant reservations and pre-shift briefing'],
    sensitivityTier: 'low',
  },
  {
    eventName: 'shift_ended',
    description: 'A service shift has closed and post-shift reporting is triggered.',
    trigger: 'Manager action or scheduled time trigger.',
    actorTypes: ['manager'],
    relatedEntities: ['Shift', 'ShiftReport', 'KPISnapshot'],
    requiredPayloadFields: ['shiftId', 'venueId', 'endTime', 'managerId'],
    optionalPayloadFields: ['totalCovers', 'totalRevenue', 'incidentCount', 'managerNotes'],
    whyItMatters: 'Triggers post-shift intelligence, report generation, and memory distillation.',
    possibleAIUses: ['Generate shift summary', 'Distill lessons into memory', 'Produce coaching recommendations'],
    sensitivityTier: 'low',
  },

  // ── Reservations and bookings ─────────────────────────────────────────────────

  {
    eventName: 'reservation_created',
    description: 'A new reservation has been made for a guest or party.',
    trigger: 'Guest action via online booking, phone, or walk-in.',
    actorTypes: ['guest', 'host', 'manager'],
    relatedEntities: ['Reservation', 'Guest', 'Table'],
    requiredPayloadFields: ['reservationId', 'guestId', 'partySize', 'dateTime', 'source'],
    optionalPayloadFields: ['specialRequests', 'celebrationFlag', 'accessibilityRequirements', 'tablePreference'],
    whyItMatters: 'Starts the guest promise. All pre-shift briefing depends on accurate reservation data.',
    possibleAIUses: ['Flag VIP arrivals', 'Identify accessibility requirements', 'Generate pre-shift briefing entries'],
    sensitivityTier: 'medium',
  },
  {
    eventName: 'reservation_changed',
    description: 'An existing reservation has been modified (party size, time, special requests).',
    trigger: 'Guest or host action.',
    actorTypes: ['guest', 'host', 'manager'],
    relatedEntities: ['Reservation', 'Guest'],
    requiredPayloadFields: ['reservationId', 'changedFields', 'changedAt', 'changedBy'],
    optionalPayloadFields: ['previousValues', 'reason'],
    whyItMatters: 'Downstream staffing and section plans may need to be adjusted based on party size or timing changes.',
    possibleAIUses: ['Re-evaluate section capacity', 'Re-trigger pre-shift briefing if change is same-day'],
    sensitivityTier: 'medium',
  },
  {
    eventName: 'walkin_joined_waitlist',
    description: 'A walk-in guest has been added to the waitlist.',
    trigger: 'Host action.',
    actorTypes: ['host'],
    relatedEntities: ['WaitlistEntry', 'Guest'],
    requiredPayloadFields: ['waitlistId', 'partySize', 'joinedAt', 'quoteTime'],
    optionalPayloadFields: ['guestName', 'contactMethod', 'accessibilityRequirements'],
    whyItMatters: 'Waitlist depth and quote accuracy are leading indicators of host stand performance.',
    possibleAIUses: ['Monitor waitlist depth against section availability', 'Adjust quote times based on turn patterns'],
    sensitivityTier: 'medium',
  },

  // ── Guest arrival and seating ─────────────────────────────────────────────────

  {
    eventName: 'guest_arrived',
    description: 'A reserved or walk-in guest has arrived and been acknowledged at the front.',
    trigger: 'Host action when guest is greeted.',
    actorTypes: ['host'],
    relatedEntities: ['Guest', 'Reservation', 'VisitOrParty'],
    requiredPayloadFields: ['visitId', 'guestId', 'arrivedAt'],
    optionalPayloadFields: ['reservationId', 'partySize', 'notes'],
    whyItMatters: 'Marks the start of the live guest experience. VIP protocols and accessibility setup should activate.',
    possibleAIUses: ['Trigger VIP alert', 'Surface guest memory to host and server', 'Start wait time clock for walkouts'],
    sensitivityTier: 'medium',
  },
  {
    eventName: 'table_assigned',
    description: 'A guest or party has been assigned to a specific table.',
    trigger: 'Host action.',
    actorTypes: ['host'],
    relatedEntities: ['VisitOrParty', 'Table', 'ServiceArea', 'StaffMember'],
    requiredPayloadFields: ['visitId', 'tableId', 'serverId', 'seatedAt'],
    optionalPayloadFields: ['accessibilityVerified', 'specialSetup'],
    whyItMatters: 'Triggers server assignment and starts the service clock. Section balance check should run.',
    possibleAIUses: ['Monitor section load balance', 'Flag accessibility mismatch', 'Brief server with guest memory'],
    sensitivityTier: 'low',
  },

  // ── Order and service ──────────────────────────────────────────────────────────

  {
    eventName: 'order_opened',
    description: 'A check has been opened for a table or party.',
    trigger: 'Server or POS action.',
    actorTypes: ['server', 'bartender'],
    relatedEntities: ['Check', 'VisitOrParty', 'StaffMember'],
    requiredPayloadFields: ['checkId', 'visitId', 'serverId', 'openedAt'],
    optionalPayloadFields: ['partySize', 'notes'],
    whyItMatters: 'Starts the revenue and timing track for the visit. Ticket time analysis begins here.',
    possibleAIUses: ['Start throughput clock', 'Anticipate kitchen load based on section orders'],
    sensitivityTier: 'low',
  },
  {
    eventName: 'item_fired_to_kitchen',
    description: 'An order item has been sent to the kitchen for preparation.',
    trigger: 'Server or POS action.',
    actorTypes: ['server'],
    relatedEntities: ['Check', 'MenuItem', 'Station'],
    requiredPayloadFields: ['checkId', 'menuItemId', 'firedAt'],
    optionalPayloadFields: ['modifiers', 'allergenFlags', 'courseNumber'],
    whyItMatters: 'Starts the ticket time clock. Allergy modifiers must be transmitted accurately.',
    possibleAIUses: ['Monitor ticket times', 'Flag allergy modifier transmission', 'Kitchen load balancing'],
    sensitivityTier: 'low',
  },
  {
    eventName: 'drink_prepared',
    description: 'A beverage has been prepared at the bar.',
    trigger: 'Bartender action.',
    actorTypes: ['bartender'],
    relatedEntities: ['Check', 'MenuItem', 'RecipeVersion'],
    requiredPayloadFields: ['checkId', 'menuItemId', 'preparedAt', 'bartenderId'],
    optionalPayloadFields: ['recipeVersionId', 'modifier', 'notes'],
    whyItMatters: 'Bar throughput and consistency tracking begins with drink-level events.',
    possibleAIUses: ['Throughput monitoring', 'Comp rate analysis', 'Recipe consistency check'],
    sensitivityTier: 'low',
  },

  // ── Prep and production ────────────────────────────────────────────────────────

  {
    eventName: 'prep_batch_created',
    description: 'A batch of a recipe or ingredient has been prepared for service.',
    trigger: 'Kitchen or bar staff action.',
    actorTypes: ['chef', 'bartender', 'prep_cook'],
    relatedEntities: ['PrepBatch', 'RecipeVersion', 'InventoryItem'],
    requiredPayloadFields: ['batchId', 'recipeVersionId', 'quantity', 'unit', 'preparedBy', 'shiftId'],
    optionalPayloadFields: ['expiresAt', 'storageLocation', 'notes'],
    whyItMatters: 'Prep tracking links production output to inventory usage and waste accounting.',
    possibleAIUses: ['Calibrate par levels', 'Predict end-of-shift surplus'],
    sensitivityTier: 'low',
  },

  // ── Inventory ─────────────────────────────────────────────────────────────────

  {
    eventName: 'stock_count_completed',
    description: 'A physical inventory count has been completed and recorded.',
    trigger: 'Manager or staff action.',
    actorTypes: ['manager', 'bar_manager'],
    relatedEntities: ['StockCount', 'InventoryItem', 'StorageLocation'],
    requiredPayloadFields: ['countId', 'venueId', 'conductedBy', 'timestamp', 'itemsCounted'],
    optionalPayloadFields: ['varianceNotes', 'reviewedBy'],
    whyItMatters: 'The foundation of beverage cost control. Variance between theory and count signals loss or error.',
    possibleAIUses: ['Variance analysis', 'Theft detection signals', 'Overpour detection', 'Reorder recommendations'],
    sensitivityTier: 'low',
  },
  {
    eventName: 'waste_logged',
    description: 'A waste or spoilage event has been recorded for an inventory item.',
    trigger: 'Staff action.',
    actorTypes: ['chef', 'bartender', 'manager'],
    relatedEntities: ['WasteLog', 'InventoryItem', 'Shift'],
    requiredPayloadFields: ['wasteId', 'inventoryItemId', 'quantity', 'reason', 'loggedBy', 'shiftId'],
    optionalPayloadFields: ['cost', 'notes'],
    whyItMatters: 'Waste logging separates known loss from unexplained variance. Critical for cost control.',
    possibleAIUses: ['Categorize waste reasons', 'Flag recurring waste patterns', 'Calculate shift waste cost'],
    sensitivityTier: 'low',
  },
  {
    eventName: 'supplier_delivery_delayed',
    description: 'A supplier delivery has not arrived as scheduled.',
    trigger: 'Manager or receiving staff action.',
    actorTypes: ['manager'],
    relatedEntities: ['Supplier', 'PurchaseOrder', 'InventoryItem'],
    requiredPayloadFields: ['purchaseOrderId', 'supplierId', 'expectedAt', 'reportedAt', 'reportedBy'],
    optionalPayloadFields: ['reason', 'impactedItems', 'alternativeAction'],
    whyItMatters: 'Delivery failures create downstream inventory risk. Tracking builds supplier reliability data.',
    possibleAIUses: ['Update supplier reliability score', 'Flag at-risk items', 'Suggest backup options'],
    sensitivityTier: 'low',
  },

  // ── Incidents and recovery ─────────────────────────────────────────────────────

  {
    eventName: 'complaint_submitted',
    description: 'A guest has verbally or formally submitted a complaint about their experience.',
    trigger: 'Server, host, or manager action.',
    actorTypes: ['server', 'host', 'manager'],
    relatedEntities: ['Guest', 'VisitOrParty', 'Incident'],
    requiredPayloadFields: ['incidentId', 'guestId', 'visitId', 'complaintDescription', 'reportedBy', 'timestamp'],
    optionalPayloadFields: ['severity', 'category', 'affectedItems'],
    whyItMatters: 'The entry point for the recovery loop. Every complaint must create an incident record.',
    possibleAIUses: ['Classify severity', 'Suggest recovery action', 'Alert manager for VIP complaints'],
    sensitivityTier: 'medium',
  },
  {
    eventName: 'incident_created',
    description: 'A service or operational incident has been formally logged.',
    trigger: 'Staff or manager action.',
    actorTypes: ['manager', 'server', 'host', 'bartender'],
    relatedEntities: ['Incident', 'Shift', 'Guest', 'StaffMember'],
    requiredPayloadFields: ['incidentId', 'shiftId', 'type', 'description', 'severity', 'reportedBy', 'timestamp'],
    optionalPayloadFields: ['affectedGuestId', 'affectedStaffId', 'linkedComplaintId'],
    whyItMatters: 'Creates the official record for recovery, coaching, and SOP improvement chains.',
    possibleAIUses: ['Classify incident type', 'Suggest root cause categories', 'Link to prior incidents by type'],
    sensitivityTier: 'medium',
  },
  {
    eventName: 'recovery_action_taken',
    description: 'A concrete action has been taken to recover a guest experience after a failure.',
    trigger: 'Manager or server action.',
    actorTypes: ['manager', 'server'],
    relatedEntities: ['ServiceRecoveryAction', 'Incident', 'Guest', 'Manager'],
    requiredPayloadFields: ['recoveryId', 'incidentId', 'actionType', 'takenBy', 'timestamp'],
    optionalPayloadFields: ['approvedBy', 'cost', 'guestResponse', 'notes'],
    whyItMatters: 'Closes the recovery loop. Must be linked to the guest record to enable future personalization.',
    possibleAIUses: ['Score recovery effectiveness', 'Link to guest memory', 'Calculate comp cost by incident type'],
    sensitivityTier: 'medium',
  },

  // ── Operations ─────────────────────────────────────────────────────────────────

  {
    eventName: 'checklist_completed',
    description: 'A pre-shift, mid-shift, or post-shift checklist has been fully completed.',
    trigger: 'Staff or manager action.',
    actorTypes: ['server', 'bartender', 'manager', 'host'],
    relatedEntities: ['Checklist', 'Shift', 'StaffMember'],
    requiredPayloadFields: ['checklistId', 'shiftId', 'completedBy', 'completedAt'],
    optionalPayloadFields: ['itemsSkipped', 'notes'],
    whyItMatters: 'Checklist completion is a leading indicator of shift readiness. Missing checklists correlate with incidents.',
    possibleAIUses: ['Surface incomplete checklists in pre-shift briefing', 'Flag habitual incompletion by station'],
    sensitivityTier: 'low',
  },
  {
    eventName: 'manager_note_created',
    description: 'A manager has created a formal operational note during or after a shift.',
    trigger: 'Manager action.',
    actorTypes: ['manager', 'owner'],
    relatedEntities: ['Note', 'Shift', 'Manager'],
    requiredPayloadFields: ['noteId', 'shiftId', 'authorId', 'content', 'timestamp'],
    optionalPayloadFields: ['category', 'visibility', 'linkedEntityType', 'linkedEntityId'],
    whyItMatters: 'The primary structured channel for manager-to-manager knowledge transfer across shifts.',
    possibleAIUses: ['Extract themes for post-shift intelligence', 'Surface in next shift briefing', 'Link to memory distillation'],
    sensitivityTier: 'medium',
  },
  {
    eventName: 'review_received',
    description: 'An online or in-house review has been received from a guest.',
    trigger: 'System ingestion or manual entry.',
    actorTypes: ['system', 'manager'],
    relatedEntities: ['Guest', 'VisitOrParty', 'Venue'],
    requiredPayloadFields: ['reviewId', 'source', 'rating', 'content', 'receivedAt'],
    optionalPayloadFields: ['guestId', 'linkedVisitId', 'responseSentAt'],
    whyItMatters: 'Review signals are lagging indicators of operational quality. Cluster analysis reveals patterns.',
    possibleAIUses: ['Sentiment analysis', 'Link to specific incident records', 'Surface in owner brief'],
    sensitivityTier: 'medium',
  },

  // ── Hotel and lodging ──────────────────────────────────────────────────────────

  {
    eventName: 'room_status_changed',
    description: 'A hotel room status has changed (dirty → cleaning → clean → inspected → occupied).',
    trigger: 'Housekeeping staff or manager action.',
    actorTypes: ['housekeeper', 'inspector', 'manager'],
    relatedEntities: ['GuestRoom', 'HousekeepingTask', 'Stay'],
    requiredPayloadFields: ['roomId', 'previousStatus', 'newStatus', 'changedBy', 'changedAt'],
    optionalPayloadFields: ['taskId', 'notes'],
    whyItMatters: 'Room status is the operational heartbeat of hotel operations. Delays here cascade to arrival experience.',
    possibleAIUses: ['Alert front desk when inspected', 'Predict arrival readiness risk', 'Identify clean-to-inspect lag'],
    sensitivityTier: 'low',
  },
  {
    eventName: 'maintenance_ticket_opened',
    description: 'A maintenance issue has been formally reported for a room, space, or asset.',
    trigger: 'Staff, guest, or manager action.',
    actorTypes: ['housekeeper', 'server', 'manager', 'guest'],
    relatedEntities: ['MaintenanceTicket', 'GuestRoom', 'Venue', 'Equipment'],
    requiredPayloadFields: ['ticketId', 'locationId', 'description', 'priority', 'reportedBy', 'openedAt'],
    optionalPayloadFields: ['assetId', 'photos', 'estimatedResolution'],
    whyItMatters: 'Open maintenance tickets can block room assignments and affect guest satisfaction.',
    possibleAIUses: ['Flag rooms with open tickets before check-in', 'Detect recurring issues by asset', 'Alert manager for high-priority tickets'],
    sensitivityTier: 'low',
  },
  {
    eventName: 'service_request_created',
    description: 'A guest has requested an in-stay or in-visit service (extra towels, room service, order modification).',
    trigger: 'Guest or staff action.',
    actorTypes: ['guest', 'server', 'front_desk'],
    relatedEntities: ['Stay', 'VisitOrParty', 'Guest'],
    requiredPayloadFields: ['requestId', 'requestType', 'guestId', 'requestedAt', 'assignedTo'],
    optionalPayloadFields: ['priority', 'completedAt', 'notes'],
    whyItMatters: 'Response time to service requests is a primary driver of in-stay satisfaction scores.',
    possibleAIUses: ['Monitor response time SLAs', 'Cluster by request type to find recurring gaps'],
    sensitivityTier: 'medium',
  },

  // ── Upsell ────────────────────────────────────────────────────────────────────

  {
    eventName: 'upsell_offered',
    description: 'A staff member has offered an upsell to a guest (premium spirit, dessert, room upgrade).',
    trigger: 'Server, bartender, or front desk action.',
    actorTypes: ['server', 'bartender', 'front_desk'],
    relatedEntities: ['Check', 'MenuItem', 'Stay', 'StaffMember'],
    requiredPayloadFields: ['visitId', 'offeredBy', 'itemOffered', 'accepted', 'timestamp'],
    optionalPayloadFields: ['guestResponse', 'revenue'],
    whyItMatters: 'Upsell conversion rate is a trainable skill metric and a revenue signal.',
    possibleAIUses: ['Track upsell conversion by staff', 'Identify high-converting contexts (table, time, item)'],
    sensitivityTier: 'low',
  },

  // ── Events ────────────────────────────────────────────────────────────────────

  {
    eventName: 'event_started',
    description: 'A booked event has officially begun.',
    trigger: 'Event planner or manager action.',
    actorTypes: ['manager', 'event_planner'],
    relatedEntities: ['EventBooking', 'Shift', 'SeatingPlan'],
    requiredPayloadFields: ['eventBookingId', 'shiftId', 'startedAt', 'startedBy'],
    optionalPayloadFields: ['guestCount', 'notes'],
    whyItMatters: 'Marks the transition from setup to live execution for the event operational loop.',
    possibleAIUses: ['Activate event-specific shift brain context', 'Monitor event pacing against timeline'],
    sensitivityTier: 'low',
  },
  {
    eventName: 'event_ended',
    description: 'A booked event has concluded.',
    trigger: 'Event planner or manager action.',
    actorTypes: ['manager', 'event_planner'],
    relatedEntities: ['EventBooking', 'ShiftReport', 'Invoice'],
    requiredPayloadFields: ['eventBookingId', 'endedAt', 'endedBy'],
    optionalPayloadFields: ['actualGuestCount', 'revenueGenerated', 'notesForMemory'],
    whyItMatters: 'Triggers post-event reporting, memory distillation for the client record, and invoice generation.',
    possibleAIUses: ['Generate event debrief', 'Update event client memory', 'Flag lessons learned'],
    sensitivityTier: 'low',
  },

  // ── Accessibility ─────────────────────────────────────────────────────────────

  {
    eventName: 'accessibility_requirement_added',
    description: 'An accessibility requirement has been recorded for a guest, client, or booking.',
    trigger: 'Host, manager, or system action.',
    actorTypes: ['host', 'manager', 'event_planner'],
    relatedEntities: ['AccessibilityRequirement', 'Guest', 'Reservation', 'EventBooking'],
    requiredPayloadFields: ['requirementId', 'subjectType', 'subjectId', 'requirementType', 'description', 'recordedBy'],
    optionalPayloadFields: ['mustBeVerified', 'linkedReservationId'],
    whyItMatters: 'Accessibility requirements must be captured at the earliest point and surfaced at every relevant stage.',
    possibleAIUses: ['Verify seating assignment meets requirement', 'Alert staff with role-gated briefing', 'Add to guest memory'],
    sensitivityTier: 'high',
  },

  // ── Staff and learning ────────────────────────────────────────────────────────

  {
    eventName: 'staff_coaching_note_created',
    description: 'A manager has created a coaching note for a staff member.',
    trigger: 'Manager action.',
    actorTypes: ['manager', 'owner'],
    relatedEntities: ['CoachingNote', 'StaffMember', 'Manager', 'Incident'],
    requiredPayloadFields: ['noteId', 'staffMemberId', 'managerId', 'content', 'type', 'timestamp'],
    optionalPayloadFields: ['linkedIncidentId', 'followUpDate', 'trainingModuleSuggested'],
    whyItMatters: 'Creates the formal record that links incident to development action. Required for learning loop closure.',
    possibleAIUses: ['Suggest linked training module', 'Flag if second note of same type in 30 days', 'Include in staff development summary'],
    sensitivityTier: 'high',
  },
  {
    eventName: 'sop_updated',
    description: 'A Standard Operating Procedure has been revised and a new version published.',
    trigger: 'Manager or owner action.',
    actorTypes: ['manager', 'owner'],
    relatedEntities: ['SOP', 'TrainingModule', 'StaffMember'],
    requiredPayloadFields: ['sopId', 'version', 'updatedBy', 'updatedAt', 'changeDescription'],
    optionalPayloadFields: ['linkedIncidentId', 'requiresTrainingCompletion', 'affectedRoles'],
    whyItMatters: 'SOP updates are the formal output of the learning loop. They must be communicated and trained.',
    possibleAIUses: ['Alert affected staff of new SOP', 'Suggest training module update', 'Track completion against SOP effective date'],
    sensitivityTier: 'low',
  },
]

// ─── Event category index ───────────────────────────────────────────────────────

export const EVENT_CATEGORIES = {
  shift: ['shift_started', 'shift_ended'],
  booking: ['reservation_created', 'reservation_changed', 'walkin_joined_waitlist'],
  guestFlow: ['guest_arrived', 'table_assigned'],
  orderAndService: ['order_opened', 'item_fired_to_kitchen', 'drink_prepared', 'upsell_offered', 'service_request_created'],
  production: ['prep_batch_created'],
  inventory: ['stock_count_completed', 'waste_logged', 'supplier_delivery_delayed'],
  incident: ['complaint_submitted', 'incident_created', 'recovery_action_taken'],
  operations: ['checklist_completed', 'manager_note_created', 'review_received'],
  lodging: ['room_status_changed', 'maintenance_ticket_opened'],
  events: ['event_started', 'event_ended'],
  accessibility: ['accessibility_requirement_added'],
  learning: ['staff_coaching_note_created', 'sop_updated'],
}

export const hospitalityEventTypes = {
  events: HOSPITALITY_EVENT_TYPES,
  categories: EVENT_CATEGORIES,
}
