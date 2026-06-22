# HESTIA CTO Roadmap

> ⚠️ **PARTIALLY SUPERSEDED** — verified 2026-06-22.
> This document remains useful for historical context and original sequencing, but some hard facts are stale.
> For current repo reality, prefer:
>
> - `docs/audits/HESTIA_FULL_APP_DEEP_QA_AUDIT.md`
> - `docs/gems/hestia-research-brain/01_HESTIA_CURRENT_STATE.md`
> - `docs/architecture/HESTIA_PHASE_8_MULTI_VENUE.md` where multi-venue status matters
>
> Known stale areas may include: server.js line count, DB table count, AI provider reality (OpenAI is primary, not Gemini), and single-venue vs multi-venue framing (multi-venue shipped Phase 8).
> Do not treat this document as the sole source of truth for current implementation state.

**Last updated:** 2026-06-09
**Basis:** Full repository audit + roadmap validation — June 2026
**Authority:** This is the current official development roadmap for HESTIA.

---

## Roadmap Principles

**1. Connect before building.**
Every Phase 1 and Phase 2 item connects two systems that already exist. No new modules. No new AI systems. No new product surfaces. If a connection can be made using existing APIs, existing components, and existing data, it must be made before any new module is considered.

**2. Hospitality value, not technical completeness.**
Items are sequenced by how much operational value they produce for a real hospitality team — not by how technically interesting or architecturally clean they are. Technical hardening comes last.

**3. Demo value matters.**
The system should be demonstrable as a unified operating system as quickly as possible. If a change creates a visible, understandable improvement in a live demo, it ranks higher.

**4. Do not build what already exists.**
Before any agent proposes building a new feature, it must read `docs/HESTIA_ARCHITECTURE_AUDIT.md` and confirm that the feature does not already exist in the repository.

**5. Phases are sequential.**
Phase 2 cannot begin until Phase 1 is complete and stable. Phase 3 cannot begin until Phase 2 is complete. This sequencing exists because later phases depend on data and workflows created by earlier phases.

---

## What the Original Roadmap Got Wrong

The first version of this roadmap had five errors that would have misallocated development effort:

| Original Claim | Why It Was Wrong | Correction |
|---|---|---|
| "Enable Owner Intelligence" is the #1 opportunity | Two of five legacy pages show empty lists (no backend table for their data). Not a hospitality connection. | Enable only OwnerReport + BusinessMemoryPage in Phase 2, after they have real data to show. Full activation in Phase 3. |
| Cocktail Lab migration belongs in Phase 1 | Zero demo visibility. Highest complexity in roadmap (ID scheme conflict). No new hospitality workflow created. | Phase 3. |
| LearningProgress route fix belongs in Phase 1 | No hospitality value, no operational value, no demo value. Two-line technical fix. | Phase 4 cleanup. |
| Email wiring belongs in Phase 1 | Infrastructure, not a hospitality module connection. Does not create a visible workflow. | Phase 3. |
| "Zohar → CI seeding" ranked #10 | This is the most important cross-department connection in the codebase. One button. Maximum hospitality value. | Phase 1. Top three. |

---

## Revised Opportunity Rankings

*H = Hospitality value, O = Operational value, D = Demo value (1–5). E = Effort (1=low, 3=high). ROI = (H+O+D)/E.*

| # | Opportunity | H | O | D | E | ROI | Phase |
|---|---|---|---|---|---|---|---|
| 1 | Daily briefing → Pre-shift briefing | 5 | 5 | 5 | 1 | 15.0 | 1 |
| 2 | Zohar → food menu generation (Chef) | 5 | 5 | 5 | 1 | 15.0 | 1 |
| 3 | Zohar → CI Dashboard seeding | 5 | 5 | 5 | 1 | 15.0 | 1 |
| 4 | Shift Brain ← event load | 4 | 5 | 3 | 1 | 12.0 | 1 |
| 5 | Event load → Shift Organizer | 4 | 5 | 3 | 1 | 12.0 | 1 |
| 6 | Event cocktail menu → CI lifecycle | 3 | 4 | 2 | 1 | 9.0 | 1 |
| 7 | Chef event_id FK + status in EventOverview | 3 | 4 | 3 | 1 | 10.0 | 1 |
| 8 | EventTeam → live schedule data | 3 | 4 | 3 | 1 | 10.0 | 1 |
| 9 | Post-event EOD trigger + memory write | 4 | 5 | 3 | 2 | 6.0 | 2 |
| 10 | Event Architect de-mock (top 4 components) | 3 | 3 | 5 | 2 | 5.5 | 2 |
| 11 | Owner Intelligence (OwnerReport + BusinessMemoryPage) | 2 | 3 | 3 | 1 | 8.0 | 2 |
| 12 | Cocktail Lab → backend persistence | 3 | 4 | 1 | 3 | 2.7 | 3 |
| 13 | Budget requests backend | 1 | 3 | 1 | 2 | 2.5 | 3 |
| 14 | Employee requests backend | 1 | 3 | 1 | 2 | 2.5 | 3 |
| 15 | Assigned tasks backend | 1 | 2 | 1 | 2 | 2.0 | 3 |
| 16 | Owner Intelligence (BudgetApprovals + OwnerOperationalRequests) | 2 | 3 | 2 | 1 | 7.0 | 3 (after tables) |
| 17 | Email wiring (key operational events) | 2 | 3 | 1 | 1 | 6.0 | 3 |
| 18 | Owner notes backend | 1 | 2 | 1 | 1 | 4.0 | 3 |
| 19 | ZoharPanel cleanup + replacement | 1 | 2 | 2 | 2 | 2.5 | 2 (part of Architect work) |
| 20 | server.js module split | 0 | 1 | 0 | 3 | 0.3 | 4 |

---

## Phase 1 — Operational Connection Layer

**Theme:** Connect existing systems to each other. Zero new infrastructure. Zero new modules. Pure glue.

**Target effort:** 2 sessions.

**Why this phase is first:** Every item in Phase 1 uses only existing APIs, existing components, and existing data. There is no risk of introducing regressions in systems that do not already touch these code paths. The hospitality value per line of code written is the highest of any phase in the roadmap.

---

### 1.1 Daily Briefing → Pre-Shift Briefing

**What it connects:** `buildDailyBriefing()` (used in EventCalendar) → `PreShiftBriefing`

**How:** Pass `events.events` (already loaded in `App.jsx` via `useEventState`) into `PreShiftBriefing`. Render the existing `DailyBriefing` component inside the briefing page when today's events exist. If no events: section is hidden.

**Why first:** Pre-shift briefing is the most-used screen in the system. Every manager opens it before service. Today it has no event context. After this change, every manager automatically sees tonight's events before starting service.

**Demo moment:** Manager opens Pre-Shift Briefing → new section: "Tonight: Smith Corporate Event · 60 guests · 19:00 · Cocktail menu approved."

---

### 1.2 Shift Brain ← Event Load

**What it connects:** `events.events` → `useShiftBrainState` → `shiftBrainService.js`

**How:** Pass `events.events` into `useShiftBrainState`. In `shiftBrainService.js`, add one `upcomingEventLoad` signal: when an event is within 72 hours with status `confirmed` or later, emit a signal with guest count, event type, and open task count.

**Why here:** Shift Brain provides the intelligence score for Pre-Shift Briefing. 1.1 adds event context to the briefing. 1.2 makes the Shift Brain intelligence reflect that context.

---

### 1.3 Zohar → Cocktail Intelligence Seeding

**What it connects:** Zohar bar brief → `POST /api/ci/dna` → CI Dashboard

**How:** Add a "Seed to Cocktail Intelligence" action button in `ZoharCocktailBriefCard` (expanded state). On click: call `POST /api/ci/dna` with event context from `hospitalityDNA` (subtype, guestExpectations, cocktailPriorities, emotionalRisks, rsvpBreakdown), then `goToPage('ciDashboard')`. The `events_manager` role already has read access to CI routes. No new routes needed.

**The workflow it creates:**
1. Events manager opens EventDetail → Zohar tab
2. Zohar generates bar brief from real event data
3. Events manager clicks "Seed to Cocktail Intelligence" → lands on CI Dashboard with event context
4. Bar manager generates event-specific cocktail menu
5. Menu published → employees see it in Daily Work

**Why top three:** This is the most important cross-department connection in HESTIA. The effort is one button and one API call. The value is a complete cross-department event F&B workflow.

**Demo moment:** Continuous walkthrough — event brief → one button → CI Dashboard → event-specific menu generated → published → visible in employee Daily Work.

---

### 1.4 Zohar → Food Menu Generation (Chef Module)

**What it connects:** Zohar food brief → `POST /api/chef/generate-menu` → Chef approval workflow

**How:**
- `ALTER TABLE food_menus ADD COLUMN event_id TEXT` (idempotent)
- Add "Generate Event Food Menu" button in `ZoharFoodBriefCard` (expanded state) → calls `POST /api/chef/generate-menu` with `foodMenuBrief` fields (guest count, format, culinary mood, dietary notes, kosher, timing) plus `event_id`
- Chef's existing approval workflow runs unchanged
- Surface approved food menu status in `EventOverview` alongside the existing cocktail menu status

**Why here:** The food brief exists with the same depth as the cocktail brief. The Chef module has full generation, approval, and publishing infrastructure. One button and one API call creates a complete parallel food automation path.

**Demo moment:** Zohar → generate food menu → Chef approval → "Menu approved and visible to staff."

---

### 1.5 Event Cocktail Menu → CI Lifecycle

**What it connects:** `PATCH /api/events/:id/cocktail-menu/approve` → `cocktail_lifecycle` table

**How:** In the approve handler, when an event cocktail menu is approved, insert each cocktail into `cocktail_lifecycle` with `source: 'event'`, `status: 'active'`, `event_id`. This creates the data bridge between the event cocktail system and CI bar intelligence.

**Why here:** 3 lines in an existing handler. Zero UI changes. This is the first data bridge between the event and CI systems.

---

### 1.6 Event Load → Shift Organizer

**What it connects:** `GET /api/events` → `ShiftOrganizer.jsx` → Gemini prompt for `POST /api/employee-shifts/generate`

**How:**
- In `ShiftOrganizer.jsx`: fetch events for the selected week → display as context strip above the generation form
- In `POST /api/employee-shifts/generate`: accept optional `events` array → append event context to the Gemini schedule prompt

**Why here:** The Shift Organizer already calls Gemini with a prompt. Event data is one API call away. The difference between a schedule that knows about a 100-guest event and one that doesn't is the entire point of intelligent scheduling.

---

### 1.7 EventTeam → Live Schedule Data

**What it connects:** `GET /api/employee-shifts/schedule` → `EventTeam.jsx`

**How:** Fetch the published schedule filtered to the event date. Replace static hardcoded role suggestions with actual matched staff names and roles when a schedule exists. Static suggestions remain as fallback when no schedule is published for that date.

**Why here:** One API call. The EventTeam tab currently shows the same fake role list for every event. When a schedule exists, it now shows real staff.

---

### 1.8 Chef Event Menu Status in EventOverview

**What it connects:** `GET /api/chef/menus?event_id=:id` → `EventOverview.jsx`

**How:** After the existing cocktail menu status block in EventOverview, add an equivalent food menu status block reading the linked food menu (if any was generated in step 1.4). Shows: pending approval / approved / published status.

**Why here:** Completes the visual symmetry with the cocktail menu status that already exists in EventOverview.

---

### Phase 1 — Explicitly Excluded

The following items must NOT be included in Phase 1:
- Owner Intelligence activation (any page)
- Cocktail Lab backend migration
- Event Architect de-mock
- server.js module split
- JWT / httpOnly cookie changes
- auth_users / hospia_users reconciliation
- LearningProgress route cleanup
- Email wiring
- Budget request tables
- Employee request tables

These items are excluded because they are either higher complexity, have lower hospitality value per effort, or depend on Phase 2 data to be useful.

---

### Phase 1 — Definition of Done

Phase 1 is complete when:
- [ ] Manager opens Pre-Shift Briefing and sees tonight's events listed with guest count and status
- [ ] Shift Brain intelligence includes an event-load signal when an event is within 72 hours
- [ ] Events manager can click "Seed to Cocktail Intelligence" from Zohar and land on CI Dashboard with event context
- [ ] Events manager can generate a food menu from Zohar's food brief in one click
- [ ] Chef module receives the food menu request with event context (guest count, dietary notes, kosher, format)
- [ ] Approved event cocktail menus appear in `cocktail_lifecycle` with `source: 'event'`
- [ ] ShiftOrganizer shows upcoming events for the selected week as context
- [ ] Schedule generation prompt includes event context when events exist for that week
- [ ] EventTeam shows matched staff from the published schedule when one exists
- [ ] EventOverview shows food menu status alongside cocktail menu status
- [ ] `npm run build` passes
- [ ] `npm run hestia:check` passes with no new FAILs

---

## Phase 2 — Close the Loop and Fix the Flagship

**Theme:** Complete the event lifecycle. Make the flagship feature credible.

**Target effort:** 3 sessions.

**Why this phase is second:** Phase 1 creates operational connections. Phase 2 closes the event lifecycle (post-event capture) and fixes the most credibility-damaging gap in the product (demo data in the Event Architect). It also activates the owner pages that will have real data to display after Phase 1 creates operational records.

---

### 2.1 Event Architect De-Mock (Top 4 Visible Components)

Priority order:
1. `ZoharPanel.jsx` — 837-line parallel Zohar implementation rendering demo event. Replace with `buildZoharBrief()` output passed as props from `EventBrain.jsx`.
2. `PlanningSummary.jsx` — Replace `EVENT_BRIEF` with `effectiveBrief` fields.
3. `EventBriefCard.jsx` — Same pattern.
4. `EventArchitectPrintableBrief.jsx` — Replace `BAR_PROGRAMME` and `STAFF_NOTIFICATIONS` with real event data.

Remaining four components (`BarProgramme`, `StaffNotifications`, `SelectedTablePanel`, `eventArchitectAdapter.js`) follow in the same session.

`effectiveBrief` is already computed in `EventBrain.jsx`. These components need to receive it as props instead of importing demo data directly.

**Why here and not Phase 1:** Touches 4–8 files mechanically. Higher breakage risk than Phase 1's additive changes. Should run after Phase 1 is stable.

---

### 2.2 Post-Event EOD Trigger

**What it creates:**
- Add a "Close this event" action to EventDetail header (visible when `status === 'completed'` or `status === 'live'`)
- This action navigates to `EndOfDay` with `eventContext` prop: event name, guest count, task completion rate, cocktail menu status, food menu status, timeline entry count
- `archiveEndOfDayReport` in `App.jsx`: when `eventContext` is present, call `addBusinessMemoryEvent` with a structured event record (the first real event memory entry)
- Add `event_id TEXT` column to `shift_reports`

**Why here:** This closes the event lifecycle. Without it, HESTIA forgets every event the moment it completes. After this, every completed event creates a business memory record — which feeds Owner Intelligence, Shift Brain historical context, and future analytics.

---

### 2.3 Owner Intelligence — Partial Activation (2 pages only)

Enable `OwnerReport` and `BusinessMemoryPage` only:
- Set `ownerReport: true` and `ownerBusinessMemory: true` in `featureFlags.js`
- Fix the import redirects in `owner/OwnerReport.jsx` and `owner/BusinessMemoryPage.jsx` to point to `owner/legacy/` instead of `owner/wip/`
- Add both pages to `NAV_GROUPS.command.pages`

**Do not activate** `BudgetApprovals`, `OwnerOperationalRequests`, or `CommandCenter` in Phase 2. Their data sources (budget requests, employee requests) are still localStorage-only and will show empty lists.

After Phase 2B creates post-event memory records, `BusinessMemoryPage` will have real records to display.

---

### Phase 2 — Definition of Done

Phase 2 is complete when:
- [ ] Event Architect shows real event data in all primary panels (no panel shows "Cohen-Levi Wedding" when a real event is linked)
- [ ] ZoharPanel in the Architect uses `buildZoharBrief()` output, not `EVENT_BRIEF` demo data
- [ ] EventDetail has a "Close this event" action that pre-fills the EOD form with event context
- [ ] Completing an event creates a business memory record via `archiveEndOfDayReport`
- [ ] `OwnerReport` and `BusinessMemoryPage` are visible in the Owner nav and display real data
- [ ] `npm run build` passes
- [ ] `npm run hestia:check` passes with no new FAILs

---

## Phase 3 — Data Persistence and Complete Operations

**Theme:** Migrate localStorage-only domains to the backend. Activate remaining owner features. Wire email.

**Target effort:** 3–4 sessions.

**Why this phase is third:** Phase 3 items have medium complexity and zero demo visibility. They are important for production deployment and operational reliability but should not block the hospitality connection work in Phases 1 and 2.

---

### 3.1 Cocktail Lab → Backend Persistence

**Migration approach (follows the `event_plans` pattern from Phase 5 Step 5):**
1. `ALTER TABLE cocktails ADD COLUMN client_id TEXT` (idempotent)
2. `POST /api/cocktails` accepts `client_id`, uses `INSERT OR IGNORE` on `client_id`
3. `useCocktailPipeline`: fire-and-forget `POST /api/cocktails` on approve; include `client_id` in payload
4. `GET /api/cocktails?source=lab` filter separates Lab cocktails from CI cocktails
5. Read-side merge on mount: fetch backend Lab cocktails, merge with localStorage (backend wins on matching `client_id`)

**Risk:** This is the most complex migration in the roadmap. The `client_id` column resolves the integer vs. string ID conflict that has blocked this migration. Test thoroughly: approve a cocktail in Lab → confirm it appears in backend → confirm CI cocktails are not affected.

---

### 3.2 Backend Tables — Budget Requests, Employee Requests, Assigned Tasks

Three new tables following the existing operations pattern:
- `budget_requests` → `GET`/`POST`/`PATCH /api/budget-requests`
- `employee_requests` → `GET`/`POST`/`PATCH /api/employee-requests`
- `assigned_tasks` → `GET`/`POST`/`PATCH /api/assigned-tasks`

Update `useOperationsState` for each domain: fire-and-forget write, backend-preferred merge on mount (same pattern as `actionItems`, `serviceIncidents`, `futureEvents`).

---

### 3.3 Full Owner Intelligence Activation

After Phase 3.2 creates backend tables for budget requests and employee requests:
- Enable `BudgetApprovals` (`ownerBudgetApprovals: true`) — now has real data
- Enable `OwnerOperationalRequests` (`ownerOperationalRequests: true`) — now has real data
- Evaluate `CommandCenter` activation — reads from multiple sources, most of which are now backend-persisted

---

### 3.4 Email Wiring

Call `sendEmail()` (already defined in `server.js`) from:
- EOD report archive: when `event.client_email` is set, send a post-event summary to the client
- Event creation: notification to manager email when a new event is created
- Cocktail menu approval: already partially wired in Chef module; extend to event cocktail menu approval
- Food menu approval: already wired in Chef module; no change needed

---

### 3.5 Owner Notes Backend

Add `owner_notes` as a filtered variant of `GET/POST /api/notes` with a `tag: 'owner'` filter, or as a minimal separate table. Update `useOperationsState` to write/read from backend.

---

### Phase 3 — Definition of Done

Phase 3 is complete when:
- [ ] Cocktail Lab approvals survive browser clear and are visible cross-device
- [ ] Budget requests appear in `BudgetApprovals` owner page with real data
- [ ] Employee requests appear in `OwnerOperationalRequests` with real data
- [ ] Assigned tasks (manager → employee) persist cross-device
- [ ] All Owner Intelligence legacy pages that have data are active in the nav
- [ ] Key operational events (event creation, menu approval, EOD archive) send email when email is configured
- [ ] `npm run build` passes
- [ ] `npm run hestia:check` passes with no new FAILs

---

## Phase 4 — Technical Hardening

**Theme:** Production readiness. No user-visible changes.

**Target effort:** 4–6 sessions.

**Why this phase is last:** These changes are correct and necessary but carry the highest regression risk. The product should be functionally complete before restructuring its technical foundation. Every Phase 4 item requires full regression testing of the system it touches.

---

### 4.1 server.js Module Split

Extract into Express Router modules by domain:
- `routes/auth.js`
- `routes/events.js`
- `routes/cocktailIntelligence.js` (largest section, ~2,200 lines)
- `routes/chef.js`
- `routes/shifts.js`
- `routes/operations.js`
- `routes/academy.js`

`server.js` becomes a thin composition file (~200 lines). No route changes. No behavioral changes.

**Risk:** High volume of changes. Import path errors are common during module extraction. Run full API test after each module is extracted, not after all modules at once.

---

### 4.2 JWT → httpOnly Cookie Hardening

Replace `hospia.token` localStorage storage with `Set-Cookie: HttpOnly; Secure; SameSite=Strict` on login response. Update `GET /api/auth/me` to read from cookie. Remove `setAuthToken`, `saveToken`, `initAuthToken` from frontend. Update `useIdleTimeout` simultaneously — idle timeout must still work with cookie-based auth.

**Risk:** Any auth flow not updated simultaneously will break. Update login, logout, session restore, idle timeout, and all API request headers in one coordinated change.

---

### 4.3 auth_users / hospia_users Reconciliation

`hospia_users` is never queried for authentication. It is seeded on every startup and then diverges from `auth_users`. Remove `hospia_users` as an active operational table. Preserve the seed migration path. Consolidate all user management through `auth_users`.

**Risk:** Verify that no production code path reads from `hospia_users` before removing.

---

### 4.4 Remaining Cleanup

- `LearningProgress.jsx`: add `PAGE_META` entry and route in `routes.js`
- `src/data/systemConfig.js`: remove or clearly deprecate (duplicate of `src/config/systemConfig.js`)
- `src/data/businessMemory.js`, `src/data/staff.js`: remove empty array files
- `managerActionCenter`, `endOfShiftReview`: confirm hidden-in-nav status is correct; do not remove files yet in case they are re-activated
- `ZoharPanel.jsx`: if Phase 2 replaces its function, reduce to a thin wrapper or remove

---

### Phase 4 — Definition of Done

Phase 4 is complete when:
- [ ] `server.js` is under 300 lines; all routes are in domain modules
- [ ] Auth token is stored in httpOnly cookie; localStorage token storage is removed
- [ ] `hospia_users` table is no longer an active operational table
- [ ] `LearningProgress` is navigable via URL
- [ ] Empty data files removed
- [ ] `npm run build` passes
- [ ] `npm run hestia:check` passes with no new FAILs

---

## Explicit "Do Not Do Yet" Section

The following items are known and real but must not be started until the phase preceding them is complete:

| Item | Why Not Yet |
|---|---|
| Owner Intelligence BudgetApprovals activation | Backend table does not exist yet — shows empty list |
| Weekly Summary / Profit Leaks / Business MRI | Require 4+ weeks of live operational data from a running system |
| WhatsApp real delivery | Requires Twilio or equivalent integration decision |
| POS integration | No POS connector exists; requires external procurement |
| Certificate / assessment engine for Academy | No quiz runner; no completion gate |
| Multi-venue support | ✅ DONE / superseded — Phase 8 multi-venue shipped on 2026-06-14 (`X-HESTIA-Venue` header, `req.venueId`, `venue_members`). See `docs/architecture/HESTIA_PHASE_8_MULTI_VENUE.md`. |
| Puppeteer PDF export | Separate server-side rendering infrastructure required |
| Full server.js split | Phase 4 only — do not start during hospitality connection work |
| JWT hardening | Phase 4 only — do not start during hospitality connection work |

---

## Sequencing Rules

1. **Do not start Phase 2 until all Phase 1 items pass their Definition of Done.**
2. **Do not start Phase 3 until all Phase 2 items pass their Definition of Done.**
3. **Do not start Phase 4 until Phase 3 is stable and `npm run build` is confirmed passing.**
4. **Within each phase, items listed earlier take precedence over items listed later when effort is limited.**
5. **Never activate an Owner Intelligence page that reads from a localStorage-only data source.** Empty approval lists mislead operators.
6. **Never add a new connection that duplicates an existing one.** Read the audit before proposing any connection.
7. **Phase 4 items must be done one at a time with full regression testing between each.**

---

## Risks

| Risk | Mitigation |
|---|---|
| Cocktail Lab migration breaks ID scheme | Follow `event_plans` pattern exactly. Test with `client_id` column first before enabling read-side merge. |
| Event Architect de-mock breaks floor plan | Test with linked event + unlinked event (demo fallback must still work) |
| Phase 4 server.js split introduces import path errors | Extract one module at a time; run full API validation after each |
| JWT cookie change breaks session restore | Update `useIdleTimeout`, login, logout, and session restore simultaneously |
| Owner Intelligence activation with empty data | Only activate pages whose data sources are backend-persisted before the flag flip |
| Phase 1 prop pass breaks PreShiftBriefing layout | Section must be conditional — hide entirely if no events today |

---

*For current state of the system, read: `docs/HESTIA_MASTER_STATE.md`*
*For detailed module-by-module audit, read: `docs/HESTIA_ARCHITECTURE_AUDIT.md`*
