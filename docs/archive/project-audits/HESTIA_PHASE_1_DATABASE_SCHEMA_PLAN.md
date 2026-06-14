# HESTIA Phase 1 Database Schema Plan

**Date:** 2026-05-12
**Status:** Planning only — no tables created, no migrations run, no routes added
**Author:** Architecture session (Claude Code)
**Source documents:**
- `src/domain/hospitality/hospitalityDataModelMap.js`
- `src/domain/hospitality/hospitalityEntities.js`
- `src/domain/hospitality/hospitalityEventTypes.js`
- `src/domain/hospitality/hospitalityMemoryMap.js`
- `src/domain/hospitality/hospitalityOperationalLoops.js`
- `CLAUDE.md`
- `docs/architecture/HESTIA_PHASE_2_CHECKPOINT.md`

---

## 1. Purpose

This document is a **schema planning layer only**.

It translates the HESTIA Hospitality Ontology Foundation (`src/domain/hospitality/`) into a concrete, safe, phased plan for building a real backend database.

**What this document is:**
- A technical specification for future database work
- An audit of what already exists in `server.js`
- A mapping between ontology candidates and SQLite table designs
- A risk register for the migration path
- A recommended implementation sequence

**What this document is not:**
- A migration script
- A set of API routes
- A UI design
- Permission to modify `server.js`, hooks, or components
- A plan to add fake data

No code should be written as a result of reading this document without a separate explicit implementation task.

---

## 2. Design Principles

Every decision in this schema plan must respect these principles:

### Real-data-ready
Tables must be designed to hold real operational records from day one.
No schema decisions should assume fake or seed data will always be present.
The application must function correctly when every table is empty.

### No fake seed data
The current `seedDatabase()` function in `server.js` inserts fake operational records into `business_memory` and `actions`. This is a known violation of the real-data-ready standard.
Future tables must not seed fake records. The seed function should be limited to structural bootstrapping only (creating the default venue record and demo access code users).

### Local-first compatible
All new tables must be compatible with the existing localStorage-first architecture.
The pattern is: localStorage is the authoritative source during a session; backend is synced on login.
New tables must support the same merge-on-login pattern used by `useBackendSync.js`.

### Future backend compatible
The SQLite database is a local backend for now. The schema should be designed so it could be migrated to PostgreSQL, Supabase, or PlanetScale later without field renames.
Use `TEXT PRIMARY KEY` with prefixed IDs (matching the existing `id()` helper: `prefix-timestamp-random`).
Use ISO 8601 strings for all timestamps (`TEXT NOT NULL`), not epoch integers.

### Event-first where relevant
Tables that record operational events (incidents, checklist completions, shift boundaries) should be append-only by design — they do not update; they accrete.
Structured event fields (not just free-text blobs) allow future agent reasoning and pattern detection.

### Memory-aware but not memory-dumping
The existing `business_memory` table is an unstructured catch-all. It is not the memory system defined in the ontology.
Future memory tables must follow `hospitalityMemoryMap.js`: summarized, attributed, confidence-scored, revocable, linked to source events, and privacy-aware.

### Privacy-aware
Tables containing guest allergies, accessibility requirements, recovery history, or staff performance notes must be flagged with a sensitivity tier.
These fields must be designed with role-gated access in mind from the start — not retrofitted.

### Hospitality-native
Table names, field names, and relationships should reflect hospitality domain language.
Avoid generic SaaS column names like `metadata`, `extra_data`, or `payload_json` as primary fields.
Structured columns are always preferred over JSON blobs for queryable operational data.

### Multi-concept extensibility
The schema must support restaurants, bars, hotels, and events without requiring a schema change for each.
The `venue_type` field on the `venues` table is the first anchor for this. Entity tables should be venue-scoped.

---

## 3. P0 Schema Candidates

These are the first tables to implement — the minimum foundation for a real operational database.
All are `venue_id`-scoped. All use prefixed TEXT primary keys. All timestamps are ISO 8601 TEXT.

---

### 3.1 `venues`

**Already exists.** See audit in Section 7.

**tableName:** `venues`
**Purpose:** Master anchor for all operational data. Every other table references this.
**Why P0:** Without this, nothing else can be correctly scoped to a venue.

**Core fields (existing):**
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | e.g. `venue-main` |
| `name` | TEXT NOT NULL | Display name |
| `venue_type` | TEXT NOT NULL | e.g. `restaurant`, `bar`, `hotel`, `events` |
| `created_at` | TEXT NOT NULL | ISO 8601 |

**Fields to add in Phase B:**
| Column | Type | Notes |
|--------|------|-------|
| `timezone` | TEXT | e.g. `Asia/Jerusalem` — critical for shift boundary logic |
| `currency` | TEXT | e.g. `ILS`, `USD` |
| `locale` | TEXT | e.g. `he-IL`, `en-US` |
| `operating_hours_json` | TEXT | JSON blob: `{ mon: "17:00-23:00", ... }` |

**Relationships:** Parent of everything — all tables have `venue_id` FK.
**Indexes to consider:** None beyond PK for now.
**Privacy/sensitivity:** Low — venue metadata only.
**Existing HESTIA module:** All modules (venue is the root anchor).
**What not to implement yet:** Multi-venue support, brand/property hierarchy, concept-level scoping.

---

### 3.2 `staff_profiles`

**Does not exist yet.** `hospia_users` partially overlaps but is structurally different.

**tableName:** `staff_profiles`
**Purpose:** Complete operational record of a staff member — role, skills, certifications, hire date, status.
**Why P0:** All shifts, incidents, section assignments, and coaching notes require a staff member reference. The current `hospia_users` table stores authentication credentials, not operational profiles.

**Core fields:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | e.g. `staff-{timestamp}-{rand}` |
| `venue_id` | TEXT NOT NULL | FK → venues |
| `display_name` | TEXT NOT NULL | Name shown in UI and reports |
| `role` | TEXT NOT NULL | `owner`, `manager`, `bar_manager`, `employee` |
| `status` | TEXT NOT NULL DEFAULT `active` | `active`, `inactive`, `on_leave` |
| `hire_date` | TEXT | ISO 8601 date string |
| `created_at` | TEXT NOT NULL | |
| `updated_at` | TEXT NOT NULL | |

**Optional fields (Phase B+):**
| Column | Type | Notes |
|--------|------|-------|
| `skills_json` | TEXT | JSON array of skill IDs |
| `certifications_json` | TEXT | JSON array: `[{ name, expiry }]` |
| `languages_spoken` | TEXT | JSON array |
| `linked_user_id` | TEXT | FK → hospia_users.id (when auth is unified) |

**Relationships:**
- `N:1` → `venues`
- `1:N` → `shifts` (as assigned staff)
- `1:N` → `section_assignments`
- `1:N` → `incidents` (as `reported_by`)
- `1:N` → `coaching_notes` (as subject)

**Indexes to consider:** `(venue_id, status)`, `(venue_id, role)`
**Privacy/sensitivity:** Medium — performance and certification data are sensitive.
**Existing HESTIA module:** StaffProgression, StaffReadiness, UserManagement, PreShiftBriefing
**What not to implement yet:** Skill assessment records, certification expiry alerts, staff chemistry tracking.

**Important note on dual user tables:** The existing `hospia_users` table stores authentication credentials (username, password, role, can_manage_cocktails). `staff_profiles` is the operational identity layer. These should eventually be unified, but that requires a coordinated migration. In Phase B, create `staff_profiles` as a separate table. Map `linked_user_id` to connect them when ready.

---

### 3.3 `shifts`

**Does not exist yet.** Shift data currently lives only in `shift_reports` (post-shift EOD summaries).

**tableName:** `shifts`
**Purpose:** Operational container for all activity in a defined service window. All incidents, notes, checklist tasks, and section assignments belong to a shift.
**Why P0:** Without a shift record, no operational data can be grouped by service window. The current architecture stores shift-scoped data as freeform text inside `shift_reports`. This prevents pattern detection across shifts.

**Core fields:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | e.g. `shift-{timestamp}-{rand}` |
| `venue_id` | TEXT NOT NULL | FK → venues |
| `shift_date` | TEXT NOT NULL | ISO 8601 date: `2026-05-12` |
| `shift_type` | TEXT NOT NULL | `lunch`, `dinner`, `brunch`, `full_day`, `event` |
| `manager_id` | TEXT | FK → staff_profiles |
| `started_at` | TEXT | ISO 8601 datetime when shift officially opened |
| `ended_at` | TEXT | ISO 8601 datetime when shift officially closed |
| `status` | TEXT NOT NULL DEFAULT `planned` | `planned`, `active`, `completed` |
| `forecasted_covers` | INTEGER | Expected cover count at shift start |
| `actual_covers` | INTEGER | Filled in at shift end |
| `created_at` | TEXT NOT NULL | |
| `updated_at` | TEXT NOT NULL | |

**Optional fields (Phase B+):**
| Column | Type | Notes |
|--------|------|-------|
| `notes` | TEXT | Manager freeform shift notes |
| `ai_summary` | TEXT | Post-shift AI-generated narrative (Phase 3) |

**Relationships:**
- `N:1` → `venues`
- `N:1` → `staff_profiles` (manager)
- `1:N` → `section_assignments`
- `1:N` → `incidents`
- `1:N` → `checklist_tasks`
- `1:1` → `shift_reports` (existing table, via `shift_date` join initially)

**Indexes to consider:** `(venue_id, shift_date)`, `(venue_id, status)`
**Privacy/sensitivity:** Low.
**Existing HESTIA module:** PreShiftBriefing, OperationalNotes, EndOfDayReports, Shift Brain
**What not to implement yet:** Shift scheduling/calendar, shift templates, automated shift creation.

---

### 3.4 `section_assignments`

**Does not exist yet.**

**tableName:** `section_assignments`
**Purpose:** Records which staff member covers which section or area during a shift.
**Why P0:** Section assignments are required to attribute incidents and service signals to the right server, and to detect load imbalances. Without them, Shift Brain cannot reason about section-level patterns.

**Core fields:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | |
| `venue_id` | TEXT NOT NULL | FK → venues |
| `shift_id` | TEXT NOT NULL | FK → shifts |
| `staff_id` | TEXT NOT NULL | FK → staff_profiles |
| `section_name` | TEXT NOT NULL | Human-readable name: `Section A`, `Bar Top`, `Patio` |
| `assigned_at` | TEXT NOT NULL | ISO 8601 datetime |
| `created_at` | TEXT NOT NULL | |

**Optional fields:**
| Column | Type | Notes |
|--------|------|-------|
| `table_ids_json` | TEXT | JSON array of table IDs in this section |
| `notes` | TEXT | E.g. "covering for Dana P." |

**Relationships:**
- `N:1` → `shifts`
- `N:1` → `staff_profiles`
- `N:1` → `venues`

**Indexes to consider:** `(shift_id, staff_id)`, `(shift_id)`
**Privacy/sensitivity:** Low.
**Existing HESTIA module:** PreShiftBriefing (section display), StaffReadiness
**What not to implement yet:** Table-level layout mapping, section capacity scoring, automated load-balance recommendations.

---

### 3.5 `reservations`

**Does not exist yet.**

**tableName:** `reservations`
**Purpose:** Pre-committed guest promise — everything a guest was told they would receive when they booked.
**Why P0:** Reservations are the entry point of the Promise Loop. Pre-shift briefing, VIP identification, accessibility planning, and section assignment all depend on reservation data.

**Core fields:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | |
| `venue_id` | TEXT NOT NULL | FK → venues |
| `guest_name` | TEXT NOT NULL | Name at time of booking |
| `party_size` | INTEGER NOT NULL | |
| `reserved_at` | TEXT NOT NULL | ISO 8601 datetime of the booking itself |
| `shift_date` | TEXT NOT NULL | ISO 8601 date of the visit |
| `reserved_time` | TEXT NOT NULL | `19:30` — time of expected arrival |
| `status` | TEXT NOT NULL DEFAULT `confirmed` | `confirmed`, `cancelled`, `no_show`, `arrived`, `seated` |
| `source` | TEXT | `phone`, `online`, `walk_in`, `event` |
| `created_at` | TEXT NOT NULL | |
| `updated_at` | TEXT NOT NULL | |

**Optional fields:**
| Column | Type | Notes |
|--------|------|-------|
| `guest_id` | TEXT | FK → guest_profiles (Phase 2 — guest identity table does not exist yet) |
| `special_requests` | TEXT | Freeform: "window table, anniversary" |
| `celebration_type` | TEXT | `birthday`, `anniversary`, `milestone`, `none` |
| `accessibility_requirements` | TEXT | Freeform text for now; structured in Phase 2 |
| `table_preference` | TEXT | |
| `contact_info` | TEXT | Phone or email — **HIGH SENSITIVITY, see privacy note** |
| `notes` | TEXT | Internal notes added after creation |

**Relationships:**
- `N:1` → `venues`
- `1:0..1` → `visits` (via `reservation_id`)

**Indexes to consider:** `(venue_id, shift_date)`, `(venue_id, status, shift_date)`
**Privacy/sensitivity:** **Medium–High.** Contact info (phone, email) is personal data. Accessibility requirements may carry health sensitivity. Do not log contact info to console. Apply field-level access controls before exposing via API.
**Existing HESTIA module:** PreShiftBriefing (upcoming reservations), EventOrchestrator (for event bookings)
**What not to implement yet:** Online booking widget, PMS integration, reservation change history log, automated waitlist management, guest identity linking.

---

### 3.6 `visits`

**Does not exist yet.**

**tableName:** `visits`
**Purpose:** The live or completed record of a guest party on a specific occasion. Links the reservation (promise) to the service experience (execution) and eventually to the check (revenue).
**Why P0:** The visit record is the operational unit that ties guest identity, service delivery, and revenue together. Without it, Shift Brain cannot count real covers, and incidents cannot be guest-attributed.

**Core fields:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | |
| `venue_id` | TEXT NOT NULL | FK → venues |
| `shift_id` | TEXT | FK → shifts (nullable for walk-ins before shift system exists) |
| `reservation_id` | TEXT | FK → reservations (nullable for walk-ins) |
| `party_size` | INTEGER NOT NULL | |
| `arrived_at` | TEXT | ISO 8601 datetime |
| `seated_at` | TEXT | ISO 8601 datetime |
| `departed_at` | TEXT | ISO 8601 datetime |
| `section_name` | TEXT | Section assigned for this visit |
| `server_id` | TEXT | FK → staff_profiles |
| `status` | TEXT NOT NULL DEFAULT `arrived` | `arrived`, `seated`, `departed` |
| `occasion` | TEXT | `birthday`, `anniversary`, `business`, `casual` |
| `created_at` | TEXT NOT NULL | |

**Optional fields:**
| Column | Type | Notes |
|--------|------|-------|
| `guest_id` | TEXT | FK → guest_profiles (Phase 2) |
| `notes` | TEXT | Server or host notes |

**Relationships:**
- `N:1` → `venues`
- `N:1` → `shifts`
- `N:1` → `reservations` (optional)
- `N:1` → `staff_profiles` (server)
- `1:1` → `order_check_folios`
- `1:N` → `incidents` (via `visit_id`)

**Indexes to consider:** `(venue_id, shift_id)`, `(shift_id, status)`
**Privacy/sensitivity:** Low — operational record, no guest PII unless guest_id is linked.
**Existing HESTIA module:** PreShiftBriefing (arrivals), Shift Brain (cover count signal)
**What not to implement yet:** Turn time analytics, table utilization scoring, guest journey reconstruction.

---

### 3.7 `incidents`

**Already exists** — see audit in Section 7. Needs extension.

**tableName:** `incidents`
**Purpose:** The formal record of any unexpected event that degraded the guest or operational experience.
**Why P0:** Incidents are the primary input for the Recovery Loop and the Learning Loop. They are already partially implemented.

**Existing fields (current schema):**
`id`, `venue_id`, `type`, `description`, `table_number`, `resolved`, `resolution`, `compensation`, `reported_by`, `shift_date`, `created_at`

**Fields to add in Phase B:**
| Column | Type | Notes |
|--------|------|-------|
| `shift_id` | TEXT | FK → shifts (more precise than shift_date text) |
| `visit_id` | TEXT | FK → visits (guest attribution) |
| `severity` | TEXT | `low`, `medium`, `high`, `critical` — currently missing |
| `staff_id` | TEXT | FK → staff_profiles (who reported, separately from free text) |
| `resolved_by_id` | TEXT | FK → staff_profiles (who resolved) |
| `resolved_at` | TEXT | ISO 8601 datetime of resolution |
| `root_cause` | TEXT | Categorized cause: `communication`, `kitchen`, `staff_skill`, `system`, `other` |
| `updated_at` | TEXT NOT NULL | Currently missing |

**Existing problem:** `reported_by` is a freeform text string, not a FK to staff_profiles. This prevents per-staff incident attribution that Shift Brain needs.

**Relationships:**
- `N:1` → `venues`
- `N:1` → `shifts`
- `N:1` → `visits` (optional)
- `N:1` → `staff_profiles` (reporter)
- `1:N` → `service_recovery_actions`

**Indexes to consider:** `(venue_id, shift_date)`, `(venue_id, resolved, created_at)`, `(venue_id, type)`
**Privacy/sensitivity:** Medium. Descriptions may name staff or guests. Role-gate read access to `manager` and above.
**Existing HESTIA module:** OperationalNotes, ServiceRecovery, Shift Brain, PreShiftBriefing
**What not to implement yet:** Incident clustering AI, pattern detection across months, full root cause ontology enforcement.

---

### 3.8 `service_recovery_actions`

**Does not exist yet.** Currently embedded as freeform text inside `incidents.compensation` and `incidents.resolution`.

**tableName:** `service_recovery_actions`
**Purpose:** A documented, structured action taken to recover a guest experience after a failure.
**Why P0:** Recovery actions must be linked to the incident and eventually to the guest record. The current freeform text approach prevents tracking cost, effectiveness, or guest response.

**Core fields:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | |
| `venue_id` | TEXT NOT NULL | FK → venues |
| `incident_id` | TEXT NOT NULL | FK → incidents |
| `action_type` | TEXT NOT NULL | `comp_item`, `comp_check`, `apology`, `upgrade`, `discount`, `management_visit`, `other` |
| `description` | TEXT NOT NULL | What specifically was done |
| `taken_by_id` | TEXT | FK → staff_profiles |
| `approved_by_id` | TEXT | FK → staff_profiles (manager who approved) |
| `cost` | REAL | Monetary value of the recovery action |
| `guest_response` | TEXT | `accepted`, `declined`, `satisfied`, `still_unhappy` |
| `timestamp` | TEXT NOT NULL | ISO 8601 datetime of the action |
| `created_at` | TEXT NOT NULL | |

**Relationships:**
- `N:1` → `incidents`
- `N:1` → `staff_profiles` (taken_by)
- `N:1` → `staff_profiles` (approved_by)
- `N:1` → `venues`

**Indexes to consider:** `(incident_id)`, `(venue_id, timestamp)`
**Privacy/sensitivity:** Medium. Cost and guest response are operationally sensitive. High-comp actions should be manager-visible only.
**Existing HESTIA module:** ServiceRecovery (employee flow), OperationalNotes
**What not to implement yet:** Automated comp approval workflow, guest memory linking, recovery effectiveness scoring.

---

### 3.9 `checklist_tasks`

**Does not exist yet.** Currently exists only as localStorage state under `hospia.actionItems` (but action items and checklist tasks are two different concepts — this distinction matters).

**tableName:** `checklist_tasks`
**Purpose:** Trackable pre-shift, mid-shift, or post-shift operational task with completion status.
**Why P0:** Checklist completion is a leading readiness signal. The existing `actions` table conflates strategic action items (things to do over days/weeks) with operational checklists (things to complete before service). These must be separated.

**Core fields:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | |
| `venue_id` | TEXT NOT NULL | FK → venues |
| `shift_id` | TEXT | FK → shifts |
| `category` | TEXT NOT NULL | `pre_shift`, `mid_shift`, `post_shift`, `event`, `maintenance` |
| `title` | TEXT NOT NULL | The task description |
| `assigned_to_id` | TEXT | FK → staff_profiles |
| `status` | TEXT NOT NULL DEFAULT `pending` | `pending`, `completed`, `skipped` |
| `completed_at` | TEXT | ISO 8601 datetime |
| `notes` | TEXT | Any notes from the person who completed it |
| `created_at` | TEXT NOT NULL | |

**Relationships:**
- `N:1` → `venues`
- `N:1` → `shifts`
- `N:1` → `staff_profiles`

**Indexes to consider:** `(shift_id, status)`, `(venue_id, category, status)`
**Privacy/sensitivity:** Low.
**Existing HESTIA module:** PreShiftBriefing (checklist display), Shift Brain (readiness signals)
**What not to implement yet:** Template-based checklist generation, auto-assignment by role, completion rate analytics.

---

### 3.10 `menu_items`

**Does not exist yet.** Currently static data in `src/data/courses.js` and embedded in the cocktail pipeline.

**tableName:** `menu_items`
**Purpose:** The canonical record of every item on the active menu — food, beverage, cocktail — with price, category, allergen data, and recipe linkage.
**Why P0:** Menu items are the unit of revenue analysis, allergen tracking, and recipe-to-inventory cost calculation. Without a structured menu item table, comp analysis, sales mix, and pour cost are impossible.

**Core fields:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | |
| `venue_id` | TEXT NOT NULL | FK → venues |
| `name` | TEXT NOT NULL | |
| `category` | TEXT NOT NULL | `food`, `cocktail`, `spirit`, `wine`, `beer`, `non_alcoholic`, `dessert` |
| `menu_section` | TEXT | `starters`, `mains`, `bar`, `desserts` |
| `price` | REAL NOT NULL | Selling price in venue currency |
| `is_active` | INTEGER NOT NULL DEFAULT 1 | 0 = removed from menu |
| `allergens_json` | TEXT | JSON array: `["nuts", "gluten", "dairy"]` |
| `description` | TEXT | Guest-facing description |
| `created_at` | TEXT NOT NULL | |
| `updated_at` | TEXT NOT NULL | |

**Optional fields (Phase B+):**
| Column | Type | Notes |
|--------|------|-------|
| `cost_of_goods` | REAL | For margin calculation — fill as recipe costing develops |
| `recipe_version_id` | TEXT | FK → recipe_versions (Phase 2 table) |
| `is_kosher` | INTEGER DEFAULT 0 | For kosher-compliant venue contexts |
| `is_accessible_alternative` | INTEGER DEFAULT 0 | Flags allergen-friendly substitutes |

**Relationships:**
- `N:1` → `venues`
- `1:N` → `order_check_folio_lines` (Phase B)

**Indexes to consider:** `(venue_id, is_active)`, `(venue_id, category)`
**Privacy/sensitivity:** Low.
**Existing HESTIA module:** CocktailLibrary (approved cocktails), FoodCostTables, BarReports
**What not to implement yet:** Recipe version tracking, ingredient-to-item cost mapping, POS integration, automated menu sync.

**Note on existing cocktail pipeline:** `src/hooks/useCocktailPipeline.js` manages cocktail drafts and approved cocktails in localStorage. Approved cocktails from the cocktail pipeline are the first natural source of rows for `menu_items`. The migration path is: Phase D service layer reads `menu_items` table alongside localStorage, then dually writes, then transitions fully to DB in Phase E.

---

### 3.11 `order_check_folios`

**Does not exist yet.**

**tableName:** `order_check_folios`
**Purpose:** The financial record of a guest visit — items ordered, total, comps applied, payment method. The revenue side of every visit.
**Why P0:** Without check data, revenue, comp, and sales mix analysis are impossible. This is the table that makes Shift Brain's revenue signals real instead of estimated.

**Core fields:**
| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PRIMARY KEY | |
| `venue_id` | TEXT NOT NULL | FK → venues |
| `visit_id` | TEXT | FK → visits (nullable for bar walk-in tabs without a visit record) |
| `shift_id` | TEXT | FK → shifts |
| `server_id` | TEXT | FK → staff_profiles |
| `status` | TEXT NOT NULL DEFAULT `open` | `open`, `closed`, `voided` |
| `opened_at` | TEXT NOT NULL | |
| `closed_at` | TEXT | |
| `subtotal` | REAL | Before comps and tax |
| `comp_amount` | REAL DEFAULT 0 | |
| `comp_reason` | TEXT | |
| `comp_approved_by_id` | TEXT | FK → staff_profiles |
| `tax` | REAL | |
| `gratuity` | REAL | |
| `total` | REAL | Final paid amount |
| `payment_method` | TEXT | `cash`, `card`, `room_charge`, `comp` |
| `created_at` | TEXT NOT NULL | |

**Optional fields (Phase B+):**
| Column | Type | Notes |
|--------|------|-------|
| `items_json` | TEXT | JSON array of line items — `[{ menu_item_id, name, qty, price }]` — until a proper line items table exists |

**Relationships:**
- `N:1` → `visits`
- `N:1` → `shifts`
- `N:1` → `staff_profiles` (server)
- `N:1` → `venues`

**Indexes to consider:** `(venue_id, shift_id)`, `(shift_id, status)`, `(server_id, shift_id)`
**Privacy/sensitivity:** Low–Medium. Comp approval chain may be sensitive. Payment method is low sensitivity.
**Existing HESTIA module:** EndOfDayReports (revenue summary), Shift Brain (revenue signal), OwnerReport (business performance)
**What not to implement yet:** Per-line-item table, POS reconciliation, split-check logic, automatic comp alerts.

---

## 4. Relationship Model

The first safe relationship graph for Phase B implementation:

```
venues
  └── staff_profiles          (venue_id)
  └── shifts                  (venue_id)
        └── section_assignments   (shift_id, staff_id → staff_profiles)
        └── checklist_tasks       (shift_id, assigned_to_id → staff_profiles)
        └── incidents             (shift_id, staff_id → staff_profiles)
              └── service_recovery_actions  (incident_id)
        └── visits                (shift_id, reservation_id → reservations)
              └── order_check_folios   (visit_id, shift_id)
  └── reservations            (venue_id)
  └── menu_items              (venue_id)
```

### Relationship notes

**Venue → Shifts:** Every shift belongs to exactly one venue. Shift queries must always be venue-scoped.

**Shift → SectionAssignments:** A section assignment only has meaning within a shift. If the shift is deleted, assignments are orphaned. Use `ON DELETE CASCADE` for section_assignments when FK enforcement is enabled (it is: `PRAGMA foreign_keys = ON`).

**Shift → Incidents:** The shift anchor is the primary temporal grouping for incidents. `shift_date` (existing) is a text approximation; `shift_id` FK is the real anchor. Both should coexist during Phase E dual-write.

**Incident → ServiceRecoveryActions:** A recovery action must belong to an incident. One incident may have multiple recovery attempts. This is `1:N`.

**Reservation → Visit:** A reservation may or may not produce a visit (no-shows). A visit may or may not have a reservation (walk-ins). The link is optional in both directions, captured by `visits.reservation_id`.

**Visit → OrderCheckFolio:** A visit has at most one primary check, but bar tabs may be opened without a visit record. The `visit_id` FK on `order_check_folios` is nullable.

**StaffProfile → SectionAssignments:** A staff member may appear in multiple shifts. Section assignment connects the staff identity to the specific shift context.

**StaffProfile → Incidents:** Both as reporter (`staff_id`) and resolver (`resolved_by_id`). These are separate FKs to the same table.

**ChecklistTask → Shift:** Checklist tasks are shift-scoped. They are not venue-level standing items — they are instantiated per shift (or per shift type template in Phase 2).

**MenuItem → OrderCheckFolio:** Currently deferred — the link will be via `items_json` until a proper `order_check_folio_lines` table is built. This avoids premature schema complexity in Phase B.

---

## 5. Event-Log Alignment

The following event types from `hospitalityEventTypes.js` should eventually be emitted when the corresponding tables are written. **Do not implement event logging yet.** This section maps the future event log layer to the schema.

| Event Type | Triggering Table Write | Payload Key Fields |
|---|---|---|
| `shift_started` | `shifts` INSERT + `status = active` | `shiftId`, `venueId`, `managerId`, `startTime` |
| `shift_ended` | `shifts` UPDATE `status = completed`, `ended_at` | `shiftId`, `actualCovers`, `endTime` |
| `reservation_created` | `reservations` INSERT | `reservationId`, `guestName`, `partySize`, `shiftDate`, `source` |
| `guest_arrived` | `visits` INSERT `status = arrived` | `visitId`, `reservationId`, `arrivedAt` |
| `table_assigned` | `visits` UPDATE `status = seated`, `section_name`, `seated_at` | `visitId`, `sectionName`, `serverId`, `seatedAt` |
| `incident_created` | `incidents` INSERT | `incidentId`, `shiftId`, `type`, `severity`, `reportedById` |
| `recovery_action_taken` | `service_recovery_actions` INSERT | `recoveryId`, `incidentId`, `actionType`, `takenById`, `cost` |
| `checklist_completed` | `checklist_tasks` UPDATE `status = completed` | `taskId`, `shiftId`, `completedById`, `completedAt` |
| `order_opened` | `order_check_folios` INSERT | `checkId`, `visitId`, `shiftId`, `serverId`, `openedAt` |

**Future implementation approach:** An `event_log` table (append-only, never updated) will be inserted alongside the main table write inside a SQLite transaction. The event payload is a JSON blob referencing the main record ID.

---

## 6. Memory Alignment

The following memory types from `hospitalityMemoryMap.js` will eventually be fed by these tables. **Do not implement memory extraction yet.** This section defines the future extraction path.

| Memory Type | Source Tables | Extraction Signal |
|---|---|---|
| `RecurringIncidentPatterns` | `incidents` | 3+ incidents of the same `type` within 90 days at the same venue |
| `ServiceRecoveryHistory` | `service_recovery_actions` + `incidents` | Recovery linked to a guest (via `visit_id → guest_id`) |
| `StaffStrengths` / `StaffDevelopmentAreas` | `incidents` + future `coaching_notes` | Incidents attributed to `staff_id` across multiple shifts |
| `GuestPreferences` | `reservations` + `visits` | Repeated special requests / section preferences across visits |
| `MenuWinnersAndLosers` | `order_check_folios` + `menu_items` | Sales mix by item from `items_json` or line items table |
| `ManagerDecisionOutcomes` | `service_recovery_actions` + `incidents` | Recovery action type vs. `guest_response` outcome |
| `VenueDemandPatterns` | `shifts` + `visits` | Cover counts by `shift_type`, `shift_date`, day-of-week |

**Memory extraction principle:** No memory record is generated automatically. The `PostShiftIntelligenceAgent` (Phase 3) reads source tables and proposes memory candidates for human review. The `HospitalityMemoryEngine` (Future phase) manages lifecycle. The current `business_memory` table is the interim unstructured memory store and should not be equated to the ontology's memory system.

---

## 7. Existing Codebase Alignment (Audit)

This section documents what already exists. **No changes are made here — audit only.**

### 7.1 Existing SQLite tables (`data/hospia.sqlite`)

| Table | Status | Notes |
|---|---|---|
| `venues` | ✅ Exists | Minimal schema — `id`, `name`, `venue_type`, `created_at`. Missing `timezone`, `currency`, `locale`. |
| `users` | ✅ Exists | Login-only users with `access_code`. 3 demo records seeded. Not a full staff profile. |
| `shift_reports` | ✅ Exists | Post-shift EOD report blobs. Freeform text columns. NOT the same as a structured `shifts` table. |
| `business_memory` | ✅ Exists | Unstructured catch-all event log. Not the memory system from the ontology. Contains **3 fake seed records**. |
| `actions` | ✅ Exists | Strategic action items (manager to-do list). Contains **4 fake seed records**. Not the same as `checklist_tasks`. |
| `event_plans` | ✅ Exists | Event plan blobs with financial projections. Config stored as JSON. |
| `incidents` | ✅ Exists | Service incidents. Missing `severity`, `shift_id` FK, `staff_id` FK, `root_cause`, `resolved_at`, `updated_at`. |
| `notes` | ✅ Exists | Operational notes with tag and pin support. Reasonably structured. |
| `hospia_users` | ✅ Exists | Authentication + user profile table. Overlaps with future `staff_profiles`. Contains credential data (passwords in plain text — **security risk, separate concern**). |

### 7.2 Existing API routes (`server.js`)

| Route | Method | Status |
|---|---|---|
| `/api/gemini` | POST | ✅ AI proxy — keep as-is |
| `/api/session/login` | POST | ✅ Access-code auth — keep as-is |
| `/api/shift-reports` | GET, POST | ✅ EOD reports — keep as-is |
| `/api/business-memory` | GET, POST | ✅ Unstructured memory — keep as-is, do not rename |
| `/api/actions` | GET, POST, PATCH `:id` | ✅ Action items — keep as-is |
| `/api/incidents` | GET, POST | ✅ Incidents — extend fields, do not replace |
| `/api/notes` | GET, POST, PATCH `:id` | ✅ Notes — keep as-is |
| `/api/event-plans` | GET, POST | ✅ Event plans — keep as-is |
| `/api/coach` | POST | ✅ Gemini coaching — keep as-is |
| `/api/simulate` | POST | ✅ Gemini simulation — keep as-is |
| `/api/analyze` | POST | ✅ Gemini analysis — keep as-is |
| `/api/users` | GET, POST, PATCH `:id` | ✅ User management — keep as-is |
| `/api/health` | GET | ✅ Health check — keep as-is |

### 7.3 localStorage-backed state

All keys use the `hospia.*` prefix (STORAGE config in `src/config/systemConfig.js`):

| Key | What it stores | Backend-synced? |
|---|---|---|
| `hospia.users` | Staff user profiles | Yes (via `/api/users`) |
| `hospia.currentUser` | Active session user | No |
| `hospia.role` | Active session role | No |
| `hospia.lang` | UI language preference | No |
| `hospia.area`, `hospia.page` | Navigation state | No |
| `hospia.sideCollapsed` | Sidebar UI state | No |
| `hospia.endOfDayArchive` | EOD shift reports | Yes (via `/api/shift-reports`) |
| `hospia.actionItems` | Action items / tasks | Yes (via `/api/actions`) |
| `hospia.futureEvents` | Event plans | Yes (via `/api/event-plans`) |
| `hospia.serviceIncidents` | Service incidents | Yes (via `/api/incidents` — **partial sync**) |
| `hospia.budgetRequests` | Budget requests | No — localStorage only |
| `hospia.employeePerformance` | Staff performance | No — localStorage only |
| `hospia.employeeTasks` | Employee task assignments | No — localStorage only |
| `hospia.employeeRequests` | Employee shift requests | No — localStorage only |
| `hospia.notifications` | In-session notifications | No — volatile |
| `hospia.cocktailDrafts` | Cocktail drafts | No — localStorage only |
| `hospia.approvedCocktails` | Approved cocktails | No — localStorage only |
| `hospia.archivedCocktails` | Archived cocktails | No — localStorage only |
| `hospia.cocktailPractice` | Practice records | No — localStorage only |
| `hospia.ownerNotes` | Owner operational notes | No — localStorage only |
| `hospia.academyProgress` | Staff learning progress | No — localStorage only |
| `hospia.selectedAcademy`, `hospia.selectedLesson` | Academy UI state | No |
| `hospia.businessMemory` | Business memory events | Yes (via `/api/business-memory`) — **hardcoded key, not in STORAGE config** |

### 7.4 What should NOT be replaced yet

- `hospia.*` localStorage keys — must stay unchanged until a coordinated migration with data preservation
- `X-HOSPIA-Role` HTTP header — must stay until frontend and backend rename simultaneously
- All existing API routes — new routes add; do not rename or remove
- `business_memory` table — unstructured but actively used; keep alongside the future structured memory system
- `actions` table — different concept from `checklist_tasks`; keep both
- `hospia_users` table — keep alongside future `staff_profiles`; unify later

### 7.5 Known issues to address in Phase B (not now)

1. **Fake seed data in `business_memory` and `actions`:** The `seedDatabase()` function inserts 3 fake memory records and 4 fake action items. These violate the real-data-ready standard. In Phase B, refactor `seedDatabase()` to only insert the venue record and demo access users — not operational records.

2. **Plain-text passwords in `hospia_users`:** Passwords are stored unhashed. This is a security risk. Phase B should add password hashing (bcrypt) before any user creation is exposed beyond the local dev environment.

3. **`business_memory` fake seed records include real-sounding names** ("Noa", "Dana") — these are synthetic and must not be treated as real staff data.

4. **`incidents.reported_by` is freeform text** — cannot be joined to staff records. Phase B should add `staff_id` FK as a new nullable column alongside the existing field.

5. **`hospia.businessMemory` key is hardcoded** in `useReportsState.js` and not in the `STORAGE` config — add to config in the storage key migration pass.

---

## 8. Recommended Implementation Phases

### Phase A — Schema design (current)
This document. No code changes.
Define all P0 table schemas, relationships, indexes, and privacy notes.
Document the existing state and migration risks.
**Output:** This planning document.

### Phase B — Create P0 SQLite tables
Add the 8 new tables to `server.js` inside `db.exec()`:
`staff_profiles`, `shifts`, `section_assignments`, `reservations`, `visits`, `service_recovery_actions`, `checklist_tasks`, `menu_items`, `order_check_folios`

Also:
- Extend `incidents` table with missing columns (as `ALTER TABLE ADD COLUMN` — SQLite supports adding nullable columns safely)
- Remove fake seed records from `seedDatabase()` — keep only venue + demo user bootstrapping
- Add password hashing to `hospia_users`

**Constraint:** Do not remove or rename any existing column. Add only.

### Phase C — Add backend CRUD routes
For each new table, add:
- `GET /api/{table}` — list (venue-scoped, role-gated)
- `POST /api/{table}` — create
- `PATCH /api/{table}/:id` — update status/fields

Start with the two highest-value tables: `shifts` and `incidents` (extend existing).

### Phase D — Add service layer clients
Create `src/services/{domain}Service.js` files that call the new API routes.
Pattern: mirror `userService.js` — separate fetch logic from hook logic.
One service file per domain (not per table).

### Phase E — Dual-write / safe merge
For each table that has an existing localStorage equivalent:
1. Write to both localStorage AND the new backend table on every mutation
2. On login, merge backend data into localStorage (same pattern as `useBackendSync.js`)
3. Verify no data loss across a logout/login cycle
4. Only move to backend-primary after 2 clean merge cycles

Never delete localStorage data until Phase E is verified stable.

### Phase F — Event log layer
Add the `event_log` table (append-only).
Wire event emission inside `db` transactions alongside main table writes.
Start with: `shift_started`, `shift_ended`, `incident_created`, `recovery_action_taken`.

### Phase G — Memory extraction layer
Add the `memories` table (from `hospitalityMemoryMap.js` schema).
Build the `PostShiftIntelligenceAgent` to propose memory candidates from shift events.
All memory proposals require human review before storage.

### Phase H — AI reasoning layer
Wire agent candidates from `hospitalityAgentMap.js` to real data.
Start with `ShiftBrainAgent` (extend `shiftBrainService.js` with database signals).
Build incrementally — one agent, one data source at a time.

---

## 9. Risks and Guardrails

### Data loss risk
**Risk:** Renaming or dropping a localStorage key clears all user data in that slot.
**Guardrail:** Never rename `hospia.*` keys without a migration function that reads the old key, writes the new key, then deletes the old key — all on first load. Document this as a separate coordinated migration task.

### localStorage migration risk
**Risk:** Transitioning from localStorage-primary to database-primary for any data slice could result in diverged state.
**Guardrail:** Always dual-write (Phase E pattern) for at least one release cycle before removing localStorage writes.

### Fake data risk
**Risk:** Fake seed records in `business_memory` and `actions` create the illusion of operational history when there is none.
**Guardrail:** Remove fake records from `seedDatabase()` in Phase B. Ensure empty state is clean and self-explanatory in the UI.

### Auth/header trust risk
**Risk:** `X-HOSPIA-Role` is a client-provided HTTP header used for role-gating. Any client can spoof it.
**Guardrail:** This is a known MVP limitation. Before any production deployment, role must be derived from a server-side session or JWT — not from a client header. Do not add sensitive data behind this gate until the auth model is upgraded.

### Privacy/sensitivity risk
**Risk:** Guest allergies, accessibility requirements, and recovery history are sensitive data. Storing them in freeform text fields with no access controls is a compliance risk.
**Guardrail:** When implementing `reservations.accessibility_requirements` and `service_recovery_actions`, apply role-gated read access from day one. Design the field structure so that sensitivity tier is always explicit.

### Overbuilding risk
**Risk:** Building tables that are not yet needed by any feature creates dead schema that becomes maintenance burden.
**Guardrail:** Build only P0 tables in Phase B. P1 and P2 entities (`recipe_versions`, `inventory_items`, `suppliers`, `guest_profiles`) must wait until a specific feature requires them.

### Schema lock-in risk
**Risk:** SQLite `ALTER TABLE` only supports `ADD COLUMN`. Changing a column type or name requires a full table rebuild. Early schema choices are harder to reverse than in PostgreSQL.
**Guardrail:** Use nullable columns with sensible defaults for all optional fields. Never start with `NOT NULL` unless truly required. Add FK columns as nullable (`TEXT`) alongside existing freeform text fields during Phase B — do not replace.

### Dual-table user confusion risk
**Risk:** Having both `users` (access code table) and `hospia_users` (credential table) and future `staff_profiles` creates three overlapping user concepts.
**Guardrail:** Document the distinct purpose of each table. Unify in a dedicated auth migration pass — not as part of schema work for other tables.

---

## 10. Final Recommendation

### Recommended first implementation batch (Phase B)

The safest first batch after this planning document is:

**Step 1 — Extend `incidents` table only**
Add the missing columns to the existing incidents table using `ALTER TABLE ADD COLUMN`:
- `shift_id TEXT` (nullable — backfill later via `shift_date` lookup)
- `severity TEXT DEFAULT 'medium'`
- `root_cause TEXT`
- `resolved_at TEXT`
- `updated_at TEXT`

This is the lowest-risk schema change: existing data is preserved, existing routes still work, and the Shift Brain immediately gains a severity signal.

**Step 2 — Add `shifts` table**
The `shifts` table has no existing equivalent — it is net new with no migration risk. Adding it gives Shift Brain a real shift boundary and cover count anchor.

**Step 3 — Add `service_recovery_actions` table**
Completely net new. Decouples recovery data from freeform text in `incidents`. Immediately useful for the ServiceRecovery feature.

**Step 4 — Remove fake seed records**
Refactor `seedDatabase()` to remove the 3 fake `business_memory` records and 4 fake `actions` records. This is a correctness fix, not a feature.

**Do not start with** `reservations`, `visits`, `menu_items`, or `order_check_folios` in the first batch. These require UI changes and LocalStorage dual-write patterns that deserve their own focused implementation task.

### The safest next task after reading this document

Create a follow-up implementation task scoped to **Phase B, Step 1 only**:
> "Extend the `incidents` table in `server.js` with `severity`, `root_cause`, `resolved_at`, `updated_at`, and `shift_id` columns. Add the PATCH `/api/incidents/:id` route for updating `resolved`, `resolution`, and `severity`. Do not rename existing columns. Do not change the UI. Do not add fake data."

That is a safe, contained, high-value change that requires touching only `server.js` and produces immediate Shift Brain signal improvement.
