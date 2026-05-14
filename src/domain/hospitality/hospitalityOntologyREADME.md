# HESTIA Hospitality Ontology

**Location:** `src/domain/hospitality/`
**Status:** Foundation layer complete — not wired into UI
**Last updated:** 2026-05-12

---

## What this layer is

This is the hospitality domain intelligence foundation for HESTIA.

It defines the mental model through which HESTIA understands any hospitality operation:
restaurants, cocktail bars, hotels, event venues, hospitality groups, and service-driven businesses.

It is a schema and documentation layer. It defines concepts, relationships, decision logic,
memory candidates, event types, AI agent architectures, database candidates, and operational loops.

It is not a feature. It is the foundation that future features will be built on.

---

## What this layer is not

- It is not an operational database. It contains no records, no seeded data, no fake metrics.
- It is not a UI feature. Nothing here appears in the product today.
- It is not an AI agent implementation. Agents are defined as candidates, not executed.
- It is not a migration script. Database migrations come later, informed by this layer.
- It is not a finished product. It is the first architecture step.

---

## Why HESTIA needs a hospitality ontology

Most hospitality software thinks in objects: tables, checks, reservations, rooms.

HESTIA should think in operations: what was promised, is the team ready, what is happening now,
what went wrong, what should we remember, what did we learn?

Without a shared domain vocabulary, every new feature invents its own language.
A "guest" in the reservation feature is not the same object as a "guest" in the recovery feature.
An "incident" in the shift notes feature is not connected to the "coaching note" in the staff feature.

The ontology creates a single, explicit, hospitality-native model that all features
can reference, that all AI agents can reason over, and that future database schemas can be derived from.

This is how HESTIA becomes a system of understanding — not just a system of record.

---

## The six operational loops

HESTIA understands hospitality through six continuous loops.
Every hospitality operation can be described as a moment within one or more of these loops.

### 1. Promise Loop
**What was committed to the guest?**

Everything begins before the guest arrives.
Reservations, room bookings, event packages, accessibility commitments, celebrations, VIP notes.
If the promise is not tracked, it cannot be kept.

Key entities: Reservation, Stay, EventBooking, AccessibilityRequirement, Package
Key events: reservation_created, accessibility_requirement_added
Key memory: GuestPreferences, VIPHandlingNotes, EventClientPreferences

### 2. Readiness Loop
**Is the venue actually prepared to deliver the promise?**

Promises are made in advance. Readiness is confirmed in the hour before service opens.
Staffing, mise en place, inventory, room status, checklists, accessibility paths.
Readiness is not optimism. It is confirmed state.

Key entities: Shift, Checklist, PrepBatch, HousekeepingTask, GuestRoom, StaffMember
Key events: shift_started, checklist_completed, room_status_changed
Key agents: ShiftBrainAgent

### 3. Execution Loop
**What is happening right now?**

Arrival, seating, pacing, ticket times, section balance, service requests, comps, upsells.
The Execution Loop must surface anomalies fast — not after the shift ends.

Key entities: VisitOrParty, Table, Section, Check, Station
Key events: guest_arrived, table_assigned, item_fired_to_kitchen, service_request_created
Key agents: ShiftBrainAgent, KitchenFlowAgent, BarManagerAgent

### 4. Recovery Loop
**What happens when something goes wrong?**

No operation is perfect. The Recovery Loop determines whether a bad moment ends the relationship
or deepens it. Recovery must be fast, sincere, proportional, and documented.
The recovery action must link to the guest record — otherwise the memory is lost.

Key entities: Incident, ServiceRecoveryAction, Manager, VIPGuest
Key events: complaint_submitted, incident_created, recovery_action_taken
Key agents: ServiceRecoveryAgent, GuestMemoryAgent

### 5. Memory Loop
**What should the system remember for the future?**

Memory is not a log dump. It is curated, attributed, confidence-scored, linked, and privacy-aware.
Guest preferences, VIP notes, staff patterns, supplier reliability, recurring issues.
These compound into an operating intelligence that gets smarter with every shift.

Key entities: Memory, Guest, StaffMember, EventClient
Key agents: GuestMemoryAgent, HospitalityMemoryEngine

### 6. Learning Loop
**What did the organization learn?**

The Learning Loop is the slowest but most powerful.
An incident leads to a coaching note, which leads to training, which leads to an SOP update,
which prevents the next incident. Without this loop, organizations repeat the same failures.

Key entities: CoachingNote, SOP, TrainingModule, ShiftReport
Key events: staff_coaching_note_created, sop_updated
Key agents: PostShiftIntelligenceAgent, StaffCoachingAgent

---

## Four implementation categories

This layer separates hospitality concepts into four distinct implementation types.

### Structured database
Normalized records in a relational or document database.
Guest profiles, reservations, shifts, incidents, checks, inventory.
See `hospitalityDataModelMap.js` for full candidate list with field definitions.

### Long-term memory
Summarized, attributed, confidence-scored, and privacy-aware records that persist beyond a single visit or shift.
Guest preferences, VIP notes, staff patterns, supplier reliability, operational lessons.
Memory is not a dump of all events. It is what the system should remember and why.
See `hospitalityMemoryMap.js` for all memory types with sensitivity tiers and retention policies.

### Event log
An immutable record of operational events in time order.
Shift starts, reservations, arrivals, incidents, recoveries, SOP updates.
Event logs are the raw material for intelligence — agents and reports read them.
See `hospitalityEventTypes.js` for all 30+ event types with payload definitions.

### AI agent logic
Future AI agents that reason over entities, events, and memories to generate recommendations.
Agents are recommendation-first. No autonomous actions without human approval.
See `hospitalityAgentMap.js` for all 14 agent candidates with phase and risk assessments.

---

## How future modules use this foundation

### Bar Management
- Entities: SpiritSKU, RecipeVersion, InventoryItem, WasteLog, StockCount
- Decisions: inventory, menu (pour cost, margin)
- Agents: BarManagerAgent, InventoryIntelligenceAgent, MenuEngineeringAgent
- Loops: Readiness, Execution, Memory, Learning

### Kitchen Operations
- Entities: PrepBatch, MiseEnPlaceTask, MenuItem, RecipeVersion, Station
- Decisions: staffing, inventory
- Agents: KitchenFlowAgent
- Loops: Readiness, Execution, Learning

### Shift Brain
- Entities: Shift, Section, Incident, Note, ShiftReport
- Decisions: staffing, serviceRecovery, staffCoaching
- Agents: ShiftBrainAgent, PostShiftIntelligenceAgent
- Loops: Execution, Recovery, Learning

### Guest Memory
- Entities: Guest, Memory, VIPGuest, AccessibilityRequirement
- Decisions: serviceRecovery
- Agents: GuestMemoryAgent, HospitalityMemoryEngine
- Loops: Promise, Memory

### Inventory
- Entities: InventoryItem, StockCount, WasteLog, Supplier, PurchaseOrder
- Decisions: inventory
- Agents: InventoryIntelligenceAgent, SupplierIntelligenceAgent
- Loops: Readiness, Learning

### Events
- Entities: EventBooking, EventClient, SeatingPlan, Package
- Decisions: eventPlanning, hotelReadiness
- Agents: EventPlanningAgent, AccessibilityPlanningAgent
- Loops: Promise, Readiness, Memory

### Accessibility Planning
- Entities: AccessibilityRequirement, GuestRoom, Table, ServiceArea
- Decisions: hotelReadiness, eventPlanning, staffing
- Agents: AccessibilityPlanningAgent
- Loops: Promise, Readiness

### Staff Coaching
- Entities: StaffMember, CoachingNote, TrainingModule, SOP
- Decisions: staffCoaching
- Agents: StaffCoachingAgent
- Loops: Learning

### Service Recovery
- Entities: Incident, ServiceRecoveryAction, Manager
- Decisions: serviceRecovery
- Agents: ServiceRecoveryAgent
- Loops: Recovery, Memory

### Hotel Operations
- Entities: GuestRoom, Stay, HousekeepingTask, MaintenanceTicket
- Decisions: hotelReadiness
- Agents: HotelOperationsBrain
- Loops: Promise, Readiness, Execution

---

## What should not be built yet

- Full database migrations and schema deployments
- Real-time event streaming infrastructure
- Live AI agent implementations with active API calls
- Guest memory UI with edit capabilities
- Full inventory management with barcode scanning
- POS or PMS integration connectors
- Hotel PMS status feeds

These are Phase 2 and Phase 3 capabilities. This layer is the specification they will be built from.

---

## Future implementation phases

### Phase 1 — Foundation (current)
This layer. Domain vocabulary, entity definitions, relationship maps, decision logic,
event taxonomy, memory schema, agent candidates, operational loops.

### Phase 2 — Core Database and Events
Design and implement the database schema from `hospitalityDataModelMap.js`.
Implement event logging from `hospitalityEventTypes.js`.
Begin Guest Memory Agent (basic preferences, allergy flags, VIP notes).
Extend Shift Brain Agent with event-sourced signals.

### Phase 3 — Intelligence Layer
Implement InventoryIntelligenceAgent with real stock count data.
Implement ServiceRecoveryAgent with guest memory integration.
Implement StaffCoachingAgent with incident-to-coaching pipeline.
Implement PostShiftIntelligenceAgent for memory distillation.

### Phase 4 — Memory Compounding
Implement HospitalityMemoryEngine for cross-session memory management.
Build confidence scoring and provenance tracking.
Build role-gated memory access with privacy controls.
Begin event client and supplier memory compounding.

### Phase 5 — Full Intelligence Platform
MenuEngineeringAgent, KitchenFlowAgent, HotelOperationsBrain.
Cross-venue learning and pattern transfer.
Hospitality-native reporting with operational loop framing.

---

## Files in this layer

| File | Purpose |
|------|---------|
| `hospitalityEntities.js` | 60+ canonical entity definitions across 8 categories |
| `hospitalityRelationships.js` | Primary chains and hidden correlations between entities |
| `hospitalityDecisionMap.js` | Which entities influence which operational decisions |
| `hospitalityMemoryMap.js` | Long-term memory types with sensitivity and retention policies |
| `hospitalityEventTypes.js` | 30+ operational event types with payload schemas |
| `hospitalityAgentMap.js` | 14 AI agent candidates with phase, inputs, and risk levels |
| `hospitalityDataModelMap.js` | Structured database candidates with field and relationship definitions |
| `hospitalityOperationalLoops.js` | The six operational loops with scenarios and failure modes |
| `index.js` | Barrel export for the full domain layer |
| `hospitalityOntologyREADME.md` | This file |

---

## Important constraints

**Do not rename technical identifiers** such as `hospia.*` localStorage keys or `X-HOSPIA-Role` headers
without a coordinated migration. These are intentionally preserved for compatibility.
Only the product brand-facing name is HESTIA.

**Memory requires human review** for sensitive data types (allergies, accessibility, coaching notes, recovery history).
Never auto-store inferences about health-relevant or legally sensitive information without explicit human confirmation.

**Agents are recommendation-first.** No agent in this layer has the authority to take autonomous action.
Every output requires human approval before it affects the guest experience, staff records, or operational state.
