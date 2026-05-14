// The six operational loops of HESTIA hospitality intelligence.
// These loops are the mental model through which HESTIA understands every hospitality operation.
// They apply across restaurants, bars, hotels, event venues, and any service-driven business.
// This is a schema and documentation layer only — no runtime behavior.

export const PROMISE_LOOP = {
  loopName: 'Promise Loop',
  purpose: 'Define and track everything that has been committed to the guest before they arrive.',
  description: `
    A guest relationship begins before the guest walks through the door.
    The Promise Loop captures every commitment made — a reservation, a table type,
    a room category, a menu, a celebration, an accessibility path, an event package.
    If the promise is not tracked, it cannot be kept.
    If it cannot be kept, the guest has already been failed before they arrive.
  `,
  keyQuestions: [
    'What did the guest expect when they booked?',
    'What special requests were made and acknowledged?',
    'What celebration or occasion is driving the visit?',
    'What accessibility requirements were declared?',
    'What package or experience was sold to an event client?',
    'Is there a VIP or recovery context from a prior visit?',
  ],
  relatedEntities: ['Reservation', 'WaitlistEntry', 'Stay', 'EventBooking', 'Guest', 'VIPGuest', 'AccessibilityRequirement', 'Package', 'Menu'],
  relatedEvents: ['reservation_created', 'reservation_changed', 'walkin_joined_waitlist', 'accessibility_requirement_added'],
  relatedMemories: ['GuestPreferences', 'GuestCelebrationStyle', 'GuestAllergiesAndDietaryRestrictions', 'GuestAccessibilityRequirements', 'VIPHandlingNotes', 'EventClientPreferences'],
  relevantAgents: ['GuestMemoryAgent', 'EventPlanningAgent', 'AccessibilityPlanningAgent'],
  exampleScenarios: [
    {
      scenario: 'Anniversary dinner reservation with a window table request and a nut allergy declared.',
      promiseItems: ['Window table', 'Anniversary occasion acknowledged', 'Nut-free dishes confirmed'],
      riskIfBroken: 'Guest arrives to an interior table; allergy not communicated to kitchen. Trust is shattered on an important occasion.',
    },
    {
      scenario: 'Corporate event booking with a kosher menu requirement for 80 guests.',
      promiseItems: ['Kosher-certified menu for all 80 guests', 'Kosher-compliant service setup', 'Supervisor attendance confirmed'],
      riskIfBroken: 'A guest observing kashrut cannot eat. The client will not return and will warn peers.',
    },
    {
      scenario: 'Hotel guest with a wheelchair requirement booked into an accessible room.',
      promiseItems: ['Accessible room confirmed', 'Roll-in shower verified', 'Accessible path from entrance to room confirmed'],
      riskIfBroken: 'Guest arrives to a room that cannot accommodate their wheelchair. This is both a dignity failure and a legal risk.',
    },
  ],
  failureModes: [
    'Reservation notes not surfaced to the server before seating',
    'Special requests captured but not communicated to the kitchen',
    'Accessibility requirements noted but not verified against assigned space',
    'VIP context not available to front-of-house at arrival',
    'Event package sold with components that cannot be delivered',
  ],
  futureAutomationPotential: [
    'AI-generated pre-shift briefing entries for every reservation with a promise flag',
    'Automatic accessibility path verification on table assignment',
    'VIP arrival brief generated from guest memory at check-in',
    'Event promise checklist auto-generated at booking confirmation',
  ],
}

export const READINESS_LOOP = {
  loopName: 'Readiness Loop',
  purpose: 'Verify that the venue and team are actually prepared to deliver every promise before service begins.',
  description: `
    Promises are made in advance. Readiness is verified in the hour before service opens.
    The Readiness Loop asks: are we actually able to deliver what we committed to?
    This covers staffing, mise en place, cleanliness, room status, accessibility paths,
    inventory, setup, and every checklist item that separates a great shift from a chaotic one.
    Readiness is not optimism — it is confirmed state.
  `,
  keyQuestions: [
    'Is every section staffed with a confirmed server?',
    'Have all pre-shift checklists been completed?',
    'Is the kitchen stocked and prepped for today\'s expected covers?',
    'Is every reserved table clean, set, and correctly configured?',
    'Are all declared accessibility requirements verified in the space?',
    'Has every on-shift staff member been briefed on today\'s priority guests and events?',
    'Is the hotel room clean, inspected, and ready for arriving guests?',
  ],
  relatedEntities: ['Shift', 'StaffMember', 'Section', 'Checklist', 'PrepBatch', 'InventoryItem', 'GuestRoom', 'HousekeepingTask', 'Table', 'AccessibilityRequirement'],
  relatedEvents: ['shift_started', 'checklist_completed', 'prep_batch_created', 'room_status_changed'],
  relatedMemories: ['VenueDemandPatterns', 'StaffStrengths', 'StaffChemistryPatterns'],
  relevantAgents: ['ShiftBrainAgent', 'HotelOperationsBrain', 'AccessibilityPlanningAgent', 'EventPlanningAgent'],
  exampleScenarios: [
    {
      scenario: 'Pre-service: server no-show for the main dining room section.',
      readinessGap: 'Section uncovered. Surrounding servers will be overloaded.',
      correctResponse: 'Immediately reassign sections and notify manager. Surface in Shift Brain.',
    },
    {
      scenario: 'Hotel: 14:00 check-in with 10 expected arrivals. Four rooms still in "dirty" status at 13:30.',
      readinessGap: 'Arrivals will be delayed. Guest satisfaction risk.',
      correctResponse: 'Prioritize those four rooms. Alert front desk to prepare early arrivals for a potential wait.',
    },
    {
      scenario: 'Bar: ice machine down 2h before service. Cube ice only. Signature cocktail requires large-format ice.',
      readinessGap: 'Signature cocktail cannot be served as specified.',
      correctResponse: 'Alert bar manager. Source alternative or 86 the item. Notify servers before service.',
    },
  ],
  failureModes: [
    'Checklist completed on paper but not acted on',
    'Prep items finished but stored in the wrong location',
    'Room marked clean by housekeeper but not yet inspected',
    'Staff briefing skipped due to time pressure',
    'Accessibility path not physically walked before guest arrival',
  ],
  futureAutomationPotential: [
    'Auto-surface uncompleted checklists in Shift Brain 30 minutes before service',
    'Hotel arrival readiness score calculated per arriving guest',
    'Prep completion tracker linked to recipe yield and expected covers',
    'Accessibility checklist auto-generated and assigned to host for walk-through',
  ],
}

export const EXECUTION_LOOP = {
  loopName: 'Execution Loop',
  purpose: 'Track and support what is actually happening during live service.',
  description: `
    Execution is where promises and readiness meet the guest.
    The Execution Loop covers arrival, seating, pacing, ticket times, handoffs,
    service requests, housekeeping, maintenance, comps, upsells, and everything
    that happens in real time during the service window.
    The Execution Loop must surface anomalies fast — not after the shift is over.
  `,
  keyQuestions: [
    'Are guests arriving and being seated without delay?',
    'Is the pacing across sections balanced?',
    'Are ticket times within standard for the kitchen and bar?',
    'Are any sections overloaded relative to others?',
    'Are service requests being acknowledged and fulfilled within SLA?',
    'Is the comp rate within policy? Are comps being approved?',
    'Is any room not yet ready for an imminent hotel arrival?',
  ],
  relatedEntities: ['VisitOrParty', 'Table', 'Section', 'Check', 'MenuItem', 'Station', 'HousekeepingTask', 'ServiceRecoveryAction', 'StaffMember'],
  relatedEvents: ['guest_arrived', 'table_assigned', 'order_opened', 'item_fired_to_kitchen', 'drink_prepared', 'upsell_offered', 'service_request_created', 'room_status_changed'],
  relatedMemories: ['GuestPreferences', 'VIPHandlingNotes'],
  relevantAgents: ['ShiftBrainAgent', 'KitchenFlowAgent', 'BarManagerAgent', 'HotelOperationsBrain'],
  exampleScenarios: [
    {
      scenario: 'Two tables in Section B have been seated for 12 minutes without an order being opened.',
      signal: 'Pacing anomaly — server may be overwhelmed or distracted.',
      correctResponse: 'Surface in Shift Brain. Manager does a floor check. Offer to send a runner.',
    },
    {
      scenario: 'Bar throughput drops 40% in the 7:30–8:30 window without a corresponding drop in seat count.',
      signal: 'Possible bottleneck at the bar station or a prep item depleted.',
      correctResponse: 'Alert bar manager. Check ice, garnish, and prep inventory at the station.',
    },
    {
      scenario: 'VIP guest arrives to a table that was not cleared from the previous party.',
      signal: 'Execution failure — table reset not completed.',
      correctResponse: 'Immediate recovery action. Manager apologizes personally. Note in Shift Brain.',
    },
  ],
  failureModes: [
    'Section imbalance not caught until multiple tables are frustrated',
    'Ticket time anomaly not surfaced until the kitchen is backed up',
    'Comp issued without manager approval',
    'Upsell opportunity missed because server was not briefed',
    'Service request acknowledged but not followed up within SLA',
  ],
  futureAutomationPotential: [
    'Real-time section load monitoring with pacing alerts',
    'Bar throughput dashboard with bottleneck detection',
    'Comp approval workflow with instant manager notification',
    'In-stay service request SLA timer with escalation',
  ],
}

export const RECOVERY_LOOP = {
  loopName: 'Recovery Loop',
  purpose: 'Detect failures fast, respond with the right action, and turn a broken moment into a relationship signal.',
  description: `
    No operation is perfect. The Recovery Loop is not a sign of failure — it is the system
    that determines whether a bad moment ends the relationship or deepens it.
    Great hospitality teams recover faster and better than their peers.
    Recovery must be fast, sincere, proportional, and documented.
    The recovery action must link to the guest record — otherwise, the memory is lost
    and the next visit starts from zero with a guest who already has a reason to leave.
  `,
  keyQuestions: [
    'What went wrong, and how severe was the impact on the guest?',
    'Is this guest a VIP or a guest with a prior recovery history?',
    'What recovery action is appropriate and within manager authority?',
    'Has the recovery been offered and accepted?',
    'Has the root cause been identified, not just the symptom?',
    'Has the recovery been linked to the guest profile for future visits?',
  ],
  relatedEntities: ['Incident', 'ServiceRecoveryAction', 'Guest', 'VIPGuest', 'Manager', 'Check', 'Memory'],
  relatedEvents: ['complaint_submitted', 'incident_created', 'recovery_action_taken'],
  relatedMemories: ['ServiceRecoveryHistory', 'VIPHandlingNotes', 'GuestPreferences'],
  relevantAgents: ['ServiceRecoveryAgent', 'GuestMemoryAgent', 'ShiftBrainAgent'],
  exampleScenarios: [
    {
      scenario: 'Guest receives a cocktail with an ingredient they are allergic to. They declared the allergy on reservation.',
      severity: 'Critical',
      correctResponse: 'Immediate removal of drink. Medical check. Manager to table immediately. Comp the experience. Incident logged. Root cause investigation on how allergy was not communicated to bar.',
    },
    {
      scenario: 'Regular guest waited 45 minutes for an entree. Kitchen was backed up. No proactive communication.',
      severity: 'High',
      correctResponse: 'Manager apologizes in person. Complimentary dessert or beverage. Note linked to guest profile: this guest values proactive communication on delays.',
    },
    {
      scenario: 'Hotel guest finds their room not ready at 3pm despite a standard check-in time of 2pm.',
      severity: 'Medium',
      correctResponse: 'Upgrade if available. Complimentary amenity or F&B credit. Personal apology from manager. Note in guest folio.',
    },
  ],
  failureModes: [
    'Recovery offered but not documented — lost on the next visit',
    'Root cause identified but coaching note never created',
    'Comp approved but not linked to the incident record',
    'VIP incident handled by a server without manager involvement',
    'Recovery too late — guest has already left the venue',
  ],
  futureAutomationPotential: [
    'Severity classification for incoming complaints',
    'Recovery action recommendation based on incident type and guest profile',
    'Automatic manager alert for VIP or critical severity incidents',
    'Root cause tagging prompt at incident closure',
  ],
}

export const MEMORY_LOOP = {
  loopName: 'Memory Loop',
  purpose: 'Distill operational events into structured, durable memories that compound over time.',
  description: `
    The Memory Loop is what separates HESTIA from every generic hospitality tool.
    Most systems record what happened. HESTIA should remember what matters.
    Memory is not a log dump. It is curated, attributed, confidence-scored, and linked.
    Guest preferences, VIP notes, staff patterns, supplier reliability, recurring issues —
    these compound into an operating intelligence that gets smarter with every shift.
    Memory without provenance is gossip. Memory without confidence scoring is noise.
    Memory without privacy controls is a liability.
  `,
  keyQuestions: [
    'What did we learn about this guest that will improve the next visit?',
    'What staff behavior pattern deserves recognition or correction?',
    'What supplier pattern is creating operational risk?',
    'What incident type is recurring and why?',
    'What event client preference should inform the next proposal?',
    'What operational lesson should become an SOP update?',
  ],
  relatedEntities: ['Memory', 'Guest', 'StaffMember', 'Supplier', 'Incident', 'EventClient', 'ShiftReport'],
  relatedEvents: ['shift_ended', 'event_ended', 'review_received', 'manager_note_created', 'recovery_action_taken'],
  relatedMemories: ['All memory types'],
  relevantAgents: ['GuestMemoryAgent', 'PostShiftIntelligenceAgent', 'HospitalityMemoryEngine'],
  exampleScenarios: [
    {
      scenario: 'A guest who dislikes loud music sits in the patio section three visits in a row.',
      memoryCandidate: 'This guest prefers quieter seating environments. Patio or corner table preferred.',
      confidenceLevel: 'Medium — behavioral, not declared. Flag for human review before storing.',
    },
    {
      scenario: 'A bartender consistently receives guest requests for extra ice across 4 shifts.',
      memoryCandidate: 'This is a consistency signal for this bartender\'s pour temperature or ratio, not a preference to memorize.',
      action: 'This belongs in the coaching loop, not the memory loop.',
    },
    {
      scenario: 'An event client has hosted three events. Each time they specify: "No speeches during dinner."',
      memoryCandidate: 'This client strongly prefers dinner service without formal program elements. Confirm on next proposal.',
      confidenceLevel: 'High — explicit and repeated.',
    },
  ],
  failureModes: [
    'Memory stored without source attribution — cannot be verified or revoked',
    'Low-confidence inference stored as confirmed fact',
    'Allergy data inferred from order behavior instead of explicit declaration',
    'Coaching pattern stored in guest memory by mistake',
    'Memory never surfaced at the moment it matters — captured but not recalled',
  ],
  futureAutomationPotential: [
    'Post-shift memory distillation from shift events and notes',
    'Confidence scoring engine for behavioral versus declared signals',
    'Memory recall surface at guest arrival, event confirmation, and server briefing',
    'Automatic memory revocation when contradicting evidence appears',
  ],
}

export const LEARNING_LOOP = {
  loopName: 'Learning Loop',
  purpose: 'Convert operational patterns and outcomes into lasting organizational improvements.',
  description: `
    The Learning Loop is the slowest loop but the most powerful.
    It asks: what did we learn, and what are we changing because of it?
    A shift with 3 incidents and 3 coaching notes is better than a shift with 3 incidents and no learning.
    The Learning Loop closes when an incident leads to a coaching note,
    which leads to a training module, which leads to an SOP update,
    which prevents the next incident.
    Without the Learning Loop, organizations repeat the same mistakes with different staff.
  `,
  keyQuestions: [
    'Which decisions worked this period and why?',
    'Which patterns of failure are repeating across shifts?',
    'Which SOPs need to be updated based on what we observed?',
    'Which staff members need coaching and what specifically?',
    'Which menu items or operational processes create recurring friction?',
    'Which supplier decisions created risk or saved cost?',
    'What would we do differently next time?',
  ],
  relatedEntities: ['Incident', 'CoachingNote', 'SOP', 'TrainingModule', 'ShiftReport', 'Recommendation', 'Memory'],
  relatedEvents: ['shift_ended', 'incident_created', 'staff_coaching_note_created', 'sop_updated'],
  relatedMemories: ['RecurringIncidentPatterns', 'OperationalLessonsLearned', 'ManagerDecisionOutcomes', 'StaffDevelopmentAreas'],
  relevantAgents: ['PostShiftIntelligenceAgent', 'StaffCoachingAgent', 'MenuEngineeringAgent', 'InventoryIntelligenceAgent'],
  exampleScenarios: [
    {
      scenario: 'The same allergy communication failure occurs on three separate shifts over 30 days.',
      learningAction: 'Root cause identified: verbal modifier system not reliable during peak service. SOP updated to require written ticket modifier for all allergy items. Training module updated and assigned to all servers.',
    },
    {
      scenario: 'A new cocktail menu launches. In weeks 1-2, pour cost on the signature drink exceeds target by 18%.',
      learningAction: 'Recipe yield was not calibrated to the actual garnish consumption rate. Recipe version updated. Par-level for the garnish adjusted. Cost target recalculated.',
    },
    {
      scenario: 'Post-event debrief reveals the same corporate client requested the same seating configuration change 3 events in a row.',
      learningAction: 'Client preference stored in memory. Next event proposal pre-configured to match. Relationship signal: this client values layout control.',
    },
  ],
  failureModes: [
    'Incident resolved but root cause never identified',
    'Coaching note created but follow-up date missed',
    'SOP updated but staff not notified or retrained',
    'Lesson learned identified but not formalized — lives in someone\'s head',
    'Pattern recognized but action deferred indefinitely',
  ],
  futureAutomationPotential: [
    'Pattern detection across incident records with clustering by type and root cause',
    'Automatic coaching note suggestion after second incident of same type by same staff member',
    'SOP update workflow triggered by confirmed recurring incident pattern',
    'Manager decision outcome tracking to build an organizational decision library',
  ],
}

// ─── Consolidated export ────────────────────────────────────────────────────────

export const hospitalityOperationalLoops = {
  promise: PROMISE_LOOP,
  readiness: READINESS_LOOP,
  execution: EXECUTION_LOOP,
  recovery: RECOVERY_LOOP,
  memory: MEMORY_LOOP,
  learning: LEARNING_LOOP,
}
