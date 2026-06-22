# HESTIA Architecture Audit

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
**Audit basis:** Full codebase inspection — server.js (6,503 lines), all hooks, all features, all routes, all data persistence patterns.
**Authority:** This document reflects what actually exists in the repository. It is not aspirational.

---

## Executive Summary

HESTIA is a partially operational hospitality management platform built on solid architectural infrastructure with uneven module completion. The backend is a genuine SQLite API with 51 tables and 120+ routes. Authentication is server-side JWT with bcrypt. The frontend follows a clean hook/feature/service architecture. The main tension is that modules are built but not fully connected. Event briefs exist but do not flow into departments. Managers start shifts without knowing tonight's event exists. Operational data is captured in some domains and lost in others.

**HESTIA is not under-built. It is under-connected.**

The audit identifies eight cross-module connections that would transform HESTIA from a collection of modules into an operational system, all using infrastructure that already exists.

---

## System Inventory

| Module | Status | Backend Persistence | Notes |
|---|---|---|---|
| Authentication (JWT, bcrypt, sessions) | Production Ready | Yes | 7-day token, idle timeout, silent restore |
| Event CRM | Production Ready | Yes | Full CRUD, auto-tasks on creation |
| Zohar Event Brief Engine | Production Ready | Yes (events) | Deterministic, 17 subtypes, 90 tests |
| Zohar Hospitality DNA | Production Ready | Yes (events) | Structured signals, RSVP, classification |
| Event Calendar | Production Ready | Yes | Calendar Intelligence, daily briefing, ICS |
| Event Architect (Floor Plan) | Functional but Incomplete | Partial | 8 sub-components still render demo data |
| Cocktail Intelligence (CI) | Production Ready | Yes (~120 routes) | Full bar program management system |
| Cocktail Lab (Studio) | Functional but Incomplete | No (localStorage) | Approval pipeline is device-local |
| Chef Module | Production Ready | Yes | Two-stage approval, AI generation |
| Shift Management (EOD, handover) | Production Ready | Yes | Full lifecycle, carry-forward tasks |
| Shift Brain V1 | Production Ready | Yes (incidents, actions) | Deterministic, event-blind |
| Shift Organizer | Functional but Incomplete | Yes | AI scheduling; no event context |
| Employee Module | Functional but Incomplete | Partial | Requests + assigned tasks are localStorage |
| Staff Progression | Functional but Incomplete | Partial | Academy progress is backend; cocktail practice is localStorage |
| Academy Platform | Production Ready (platform) | Yes | 130+ lessons; 2 videos live; no assessment engine |
| Wine Atlas | Production Ready | No (static) | Full editorial, self-contained |
| Notification System | Production Ready | Yes | Role-targeted, multi-role JSON field |
| User Management | Production Ready | Yes | Full CRUD, role assignment, enable/disable |
| Guest Portal | Production Ready | Yes | Token-based RSVP, unauthenticated |
| Owner Intelligence | Prototype | Partial | All pages feature-flagged off; 2 of 5 legacy pages have empty data |
| Event Orchestrator (Finance) | Functional but Incomplete | Yes (event_plans) | Pricing constants are demo defaults |
| WhatsApp Messaging | Prototype | Yes (logged) | Simulation mode; not delivered |
| Email (Nodemailer) | Functional but Incomplete | No | Wired in Chef module only |
| Budget Requests | Prototype | No (localStorage) | No backend table |
| Employee Requests | Prototype | No (localStorage) | No backend table |
| Assigned Tasks | Prototype | No (localStorage) | No backend table |

---

## Event Operations Audit

### What works
- Full event lifecycle from creation to completion
- 8-tab EventDetail: Overview, Zohar, Guests, Seating, Tasks, Messaging, Team, Timeline
- Auto-creation of 5 preparation tasks on event creation
- Guest import (CSV), RSVP tracking, check-in
- Seating assignment, table management, occupancy warnings
- Event cocktail menu: AI generation (Gemini) → save → approve
- Event timeline: every state change auto-logged
- Calendar: monthly view, health scoring, daily briefing, ICS export
- Guest portal: public token-based RSVP page

### Missing connections
- **Post-event workflow absent**: when an event reaches `completed`, nothing happens. No EOD trigger. No memory capture.
- **EventTeam tab is static**: hardcoded 6 role suggestions, "Coming soon" banner, no connection to Shift Organizer
- **Messaging is simulation**: stored in DB, never delivered
- **Food menu has no generation path from Zohar**: cocktail menu has it; food does not
- **Event tasks not connected to shift management**: the "Build cocktail menu" task can link to Cocktail Lab; no other task has operational routing

### Conclusion
The event workflow already exists and must not be rebuilt. The missing work is connecting completed events to downstream systems (EOD, memory) and adding the food brief generation path.

---

## Zohar Audit

### What works
- `buildZoharBrief()` produces a complete deterministic brief from real event data
- `buildHospitalityDNA()` returns 17 event subtypes with: hospitalityRead, guestExpectations, emotionalRisks, operationalPriorities, cocktailPriorities, foodPriorities, serviceRecoveryWatchpoints, accessibilityChecks, unknownsToConfirm, signalProvenance, rsvpBreakdown
- All signals carry: source, evidence, confidence, isDerived, classification (fact/observation/inference/unknown)
- Kosher detection uses only explicit event notes or guest dietary fields — never inferred from location
- Risk assessment, coordination assessment, and timeline intelligence engines all run from real data
- Zohar tab refactored into 11 modular child components
- 90 deterministic tests pass

### Missing connections
- **Cocktail brief is clipboard-only**: `cocktailMenuBrief.outputRequestText` is generated but the only action is to copy text or create a task. There is no path that seeds Cocktail Intelligence with event context.
- **Food brief has no action path**: `foodMenuBrief` is generated with the same depth as the cocktail brief but there is no "Generate Event Food Menu" button. The Chef module's generation endpoint exists and accepts the required inputs.
- **Zohar signals do not reach Shift Brain**: `useShiftBrainState` does not receive upcoming events. Shift Brain scores without any event awareness.

### Conclusion
Zohar produces real, structured, deterministic event briefs. The food brief exists and has no generation path. The cocktail brief exists and does not seed Cocktail Intelligence. These are the two highest-priority connections in the roadmap.

---

## Cocktail Intelligence Audit

### What works
- ~120 backend CI routes: DNA, menus, sales, narratives, scores, lifecycle, trends, emergency mode
- Visual menu builder with design generation (OpenAI GPT-4o)
- Cocktail image generation (DALL-E via OpenAI)
- Excel export
- Daily close workflow
- Director chat (AI beverage director conversation)
- Published menus visible to employees via `GET /api/ci/menus/published`
- `events_manager` role can read CI DNA, menus, cocktails, and taste-DNA

### Missing connections
- **Cocktail Lab approvals do not reach CI**: `useCocktailPipeline` stores approvals in `hospia.approvedCocktails` (localStorage). CI has its own cocktails table. Lab-approved cocktails and CI cocktails are two parallel bar menus with no bridge.
- **Approved event cocktail menus do not enter CI lifecycle**: `event_cocktail_menus` table is separate from `cocktail_lifecycle`. When an event menu is approved, the cocktails do not appear in CI.
- **Zohar does not seed CI**: the bar brief generated from event data has no path into CI context.

### Conclusion
CI is the deepest module by backend surface area and is production-ready for bar program management. Its primary gap is receiving input from the Event and Cocktail Lab systems that sit alongside it.

---

## Chef Module Audit

### What works
- AI food menu generation (`POST /api/chef/generate-menu` via Gemini)
- Two-stage approval: FB Director sets `fb_approved_at`, Owner sets `owner_approved_at`
- Auto-publish when both approve
- Visibility toggle per menu (`PATCH /api/chef/menus/:menuId/visible`)
- Email notification on approval (Nodemailer, wired here specifically)
- All staff can view published menus via `GET /api/chef/menus`

### Missing connections
- **No event context in menu generation**: `POST /api/chef/generate-menu` accepts a free-form prompt. It has no concept of event type, guest count, dietary map, or the Zohar food brief that contains all of these.
- **No `event_id` foreign key**: the `food_menus` table has no link to `events`. A food menu cannot be associated with a specific event.
- **Event food menu status is not visible in EventOverview**: the cocktail menu status is surfaced; the food menu is not.

### Conclusion
The Chef module is complete as a standalone food menu system. It needs one FK column, one API call wiring, and one status surface to become part of the event workflow.

---

## Shift Organizer / Shift Brain Audit

### What works — Shift Organizer
- AI-powered schedule generation (Gemini, `POST /api/employee-shifts/generate`)
- Publish to staff (`POST /api/employee-shifts/publish`)
- Employee availability constraints form
- `MyShifts` view for employees
- Shift notifications

### What works — Shift Brain
- Deterministic intelligence scoring from real operational data (actions, incidents, notes, EOD reports)
- Focus signal generation for pre-shift briefing
- Runs inside `useShiftBrainState` + `shiftBrainService.js`

### Missing connections
- **Shift Organizer is event-blind**: schedule generation prompt receives venue name, date, constraints, and employee list. It does not receive upcoming events, guest counts, or start times.
- **Shift Brain is event-blind**: `buildShiftIntelligence()` has no event input parameter. A 120-guest wedding is invisible to the shift intelligence engine.
- **No "Open Shift Organizer" action from event context**: no way to navigate from EventDetail to the Shift Organizer with event context pre-loaded.

### Conclusion
Both Shift systems are operationally complete in isolation. Adding event awareness to each is a low-effort, high-value connection.

---

## Daily Briefing / Pre-Shift Audit

### What works
- `buildDailyBriefing()` in `dailyBriefingEngine.js` produces a structured day briefing for the current day's events
- `DailyBriefing` component renders it inside `EventCalendar`
- Pre-shift briefing (`PreShiftBriefing.jsx`) is fully wired to operational data (actions, incidents, EOD reports, Shift Brain)

### Missing connection
- **The daily event briefing is visible only inside EventCalendar**: the most important operational screen — Pre-Shift Briefing — does not receive today's events. An 80-guest corporate event tonight is invisible to the manager starting their shift.
- `events.events` is already loaded in `App.jsx` via `useEventState`. Passing it to `PreShiftBriefing` requires one prop addition.

### Conclusion
This is the highest effort-to-value ratio item in the roadmap. The data exists. The component exists. One prop pass connects them. Every manager opening pre-shift briefing will immediately see tonight's events.

---

## End Of Day Review Audit

### What works
- Full EOD workflow: handover notes, incident summary, carry-forward task creation, email report
- `POST /api/shift-reports` persists to backend
- Pending sync queue retries failed writes
- `archiveEndOfDayReport` in `App.jsx` creates action items from urgent EOD items and writes to business memory

### Missing connection
- **EOD is disconnected from the event system**: EOD form is blank regardless of what event happened that night. The system knows the event name, guest count, cocktail menu status, tasks completed, timeline entries — none of this pre-fills the EOD.
- **Completed events generate no memory record**: `addBusinessMemoryEvent` is called from `archiveEndOfDayReport`, but only when EOD is manually submitted. Events completing silently produces no memory.
- **No "Close this event" action**: EventDetail has no action that triggers an EOD pre-fill.

### Conclusion
Without post-event EOD capture, HESTIA cannot accumulate venue intelligence over time. Shift Brain, Owner Intelligence, and any future weekly summary all depend on structured operational history.

---

## Event Architect Audit

### What works
- Full floor plan tool with drag-and-drop table placement
- Links correctly to real events via three fallback signals (pageContext, URL param, sessionStorage)
- `buildArchitectBriefFromEvent()` adapter transforms real event data into architect brief format
- Seating intelligence, risk, coordination, and timeline all run from real data
- Architect plan persistence (sessionStorage)
- Printable brief, vision modal, metrics strip, toolbar, object/table/guest panels

### Demo-data contamination — confirmed list of affected components
| Component | Demo Data Used | What Should Replace It |
|---|---|---|
| `ZoharPanel.jsx` (837 lines) | `EVENT_BRIEF`, `ZONE_LABELS`, `TABLE_NOTES`, `ZONE_NOTES` | `buildZoharBrief()` output via props |
| `PlanningSummary.jsx` | `EVENT_BRIEF` fields | `effectiveBrief` fields |
| `EventBriefCard.jsx` | `EVENT_BRIEF` | `effectiveBrief` fields |
| `BarProgramme.jsx` | `BAR_PROGRAMME.cocktails` and `.mocktails` | Cocktail menu from event or CI |
| `StaffNotifications.jsx` | `STAFF_NOTIFICATIONS` | Real event tasks or shift data |
| `SelectedTablePanel.jsx` | `ZONE_NOTES`, `TABLE_NOTES` | Real table/zone data |
| `EventArchitectPrintableBrief.jsx` | `BAR_PROGRAMME`, `STAFF_NOTIFICATIONS` | Real event data |
| `eventArchitectAdapter.js` | Imports `EVENT_BRIEF` as fallback | Use `null` or empty state when no event linked |

The `effectiveBrief` computed in `EventBrain.jsx` correctly resolves real vs. demo data. These components never receive it as props.

### Conclusion
The Architect correctly loads real events. The panel components ignore it. De-mocking is mechanical (substitute props for demo imports) but touches 8 files. Priority order: ZoharPanel, PlanningSummary, EventBriefCard, EventArchitectPrintableBrief.

---

## Owner Intelligence Audit

### What works
- `OperationalPulse` is the only active owner page and reads from backend (`/api/owner/pulse`, `/api/owner/trends`, `/api/owner/insights`)
- Five legacy implementations exist in `owner/legacy/`: CommandCenter, BudgetApprovals, OwnerOperationalRequests, OwnerReport, BusinessMemoryPage
- Five WIP stubs in `owner/wip/`: WeeklySummary, BusinessMRI, ProfitLeaks, StrategicRecommendations, ExecutiveOverview
- Backend routes exist: `/api/owner/pulse`, `/api/owner/trends`, `/api/owner/insights`

### Critical nuance — not all legacy pages have real data
| Legacy Page | Data Source | Has Real Data Today |
|---|---|---|
| `OwnerReport` | `reportArchive` (backend-synced), `eventPlans` (backend-synced) | **Yes** |
| `BusinessMemoryPage` | `businessMemory` (backend-synced) | **Yes** |
| `CommandCenter` | Multiple sources (events, actions, memory, budget requests, employee requests) | **Partial** — budget requests and employee requests are localStorage |
| `BudgetApprovals` | `budgetRequests` (localStorage only) | **No — empty list** |
| `OwnerOperationalRequests` | `employeeRequests` (localStorage only) | **No — empty list** |

All 10 feature flags in `featureFlags.js` are `false`. The import files in `owner/` proxy to `owner/wip/` (WipPageTemplate stubs) instead of `owner/legacy/` (real implementations) — the redirects are backwards.

### WIP stubs are honest placeholders
The 5 WIP stubs correctly describe what data they need before they can show anything. `WeeklySummary` requires 7+ consecutive days of closed shifts. `ProfitLeaks` requires verified sales data. These stubs are correct and should remain hidden.

### Conclusion
Enable `OwnerReport` and `BusinessMemoryPage` in Phase 2 (after Phase 1 creates operational records they can display). Enable `BudgetApprovals` and `OwnerOperationalRequests` only after their backend tables exist (Phase 3). Do not blindly set all 5 flags to true.

---

## Academy Audit

### Platform maturity
- `Courses.jsx` renders the full manifest
- `LessonPlayer.jsx` plays lessons with doctrine content
- Progress tracking is backend-synced (Phase 5 Step 8)
- Video infrastructure: `AcademyEmbeddedVideoPlayer`, `InstructorTalkingHead`, `academyInstructorVideoMap.js`
- Synthesia video production export utility available in browser dev console

### Content depth
- 6 academies: Bar, Wine, Service, Hostess, Manager, Event
- ~130 lessons across `universityManifest.js` and `universityExpansion.js`
- Each lesson has: doctrine, technical depth, amateur vs. pro contrast, operational consequences, common failures, recovery logic, real service context, practical execution, drill, assessment questions
- 2 Synthesia videos confirmed live: `service-001`, `bar-001`
- 14+ video slots have `status: 'needs_video'`

### Missing
- No assessment engine (questions exist in lesson data, no quiz runner)
- `LearningProgress.jsx` exists with no route and no `PAGE_META` — unreachable from UI
- No certificate or achievement-to-lesson link

### Conclusion
The academy platform is production-ready. Content production (videos) is early-stage. The assessment engine gap is known but not blocking.

---

## External Integrations Audit

| Integration | Status | Detail |
|---|---|---|
| Calendar export (ICS) | Production Ready | RFC 5545, client-side, Google/Outlook/Apple compatible |
| Calendar sync / subscribe | Does not exist | No OAuth, no CalDAV |
| Email (Nodemailer/Gmail) | Functional but Incomplete | Wired in Chef module only; requires `EMAIL_USER`/`EMAIL_PASS` env vars |
| EmailJS (client-side) | Config exists | Partially wired |
| WhatsApp | Simulation only | Messages logged to DB; not delivered |
| Excel export (CI) | Production Ready | `exceljs` dependency, `CocktailExports.jsx` |
| PDF export (Visual Menu) | Prototype | "TODO: Puppeteer server-side render" comment in code |
| OpenAI GPT-4o | Functional | Visual menu design + cocktail images; requires `OPENAI_API_KEY` |
| Google Gemini | Production Ready | Primary AI model (`gemini-2.0-flash-lite`); requires `GEMINI_API_KEY` |
| CSV guest import | Production Ready | `POST /api/events/:id/guests/import` wired |
| POS / sales | Does not exist | No POS connector |

---

## Technical Architecture Audit

### Database
- SQLite via Node.js native `DatabaseSync` — file at `data/hospia.sqlite`
- 51 tables, all defined in `server.js`
- Schema migrations via inline `ALTER TABLE ... ADD COLUMN` on every startup (idempotent try/catch pattern)
- Single venue hardcoded: `defaultVenueId() = "venue-main"` — multi-venue not supported

### Backend
- Express.js, single file: `server.js` at 6,503 lines
- No routing modules, no service layer
- Two AI providers: Gemini (primary, most routes) and OpenAI (visual menu design + image generation)
- Bearer token authentication via `requireAuth()` middleware
- Startup sequence: `migrateAuthUsersRoles()` → `seedDatabase()` → `migrateAcademyExternalIds()` → `migrateUserCredentials()` → `seedNewUsers()` → `seedCocktailIntelligence()`

### Frontend
- React (latest) with Vite
- React Router v7 with 54 page routes in `src/config/routes.js`
- 10 domain hooks: each owns its state, persistence effects, and domain handlers
- `App.jsx` is composition-only: zero `useState`, zero `useEffect`, one `useCallback`
- `PageRenderer` receives 7 grouped domain prop objects
- Tailwind CSS + custom design system (HESTIA premium dark aesthetic)

### LocalStorage vs Backend persistence

| Domain | Key | Backend? |
|---|---|---|
| Auth token | `hospia.token` | No — MVP localStorage (httpOnly cookie deferred) |
| Navigation state | `hospia.area`, `hospia.page` | No — intentional |
| Cocktail drafts | `hospia.cocktailDrafts` | No — migration blocked |
| Approved cocktails | `hospia.approvedCocktails` | No — migration blocked |
| Archived cocktails | `hospia.archivedCocktails` | No |
| Cocktail practice | `hospia.cocktailPractice` | No |
| Budget requests | `hospia.budgetRequests` | No — no table |
| Employee requests | `hospia.employeeRequests` | No — no table |
| Assigned tasks | `hospia.assignedTasks` | No — no table |
| Owner notes | `hospia.ownerNotes` | No — no table |
| Employee performance | `hospia.employeePerformance` | No |
| Shift reports | `hospia.endOfDayArchive` | Yes — backend-preferred |
| Action items | `hospia.actionItems` | Yes — backend-preferred |
| Service incidents | `hospia.serviceIncidents` | Yes — backend-preferred |
| Business memory | `hospia.businessMemory` | Yes — backend-preferred |
| Notifications | `hospia.notifications` | Yes — backend-preferred with localStorage merge fallback |
| Academy progress | `hospia.academyProgress` | Yes — backend-preferred |

### Two parallel user systems — known debt
`hospia_users` (legacy, seeded from old access codes) and `auth_users` (active, JWT login) coexist. Login reads only `auth_users`. `hospia_users` is seeded on every restart and never queried for auth. Reconciliation is Phase 4.

---

## Dead Code / Duplicate Systems / Demo-Data Risks

### Dead code / abandoned files
| File | Issue |
|---|---|
| `src/features/academy/LearningProgress.jsx` | No route, no PAGE_META, unreachable |
| `src/features/events/components/BarProgramme.jsx` | Renders only demo data |
| `src/features/events/components/PlanningSummary.jsx` | Renders only demo data |
| `src/features/events/components/EventBriefCard.jsx` | Renders only demo data |
| `src/features/events/components/StaffNotifications.jsx` | Renders only demo staff data |
| `src/features/events/components/InvestorValueCards.jsx` | "Investor facing" cards in production UI |
| `src/data/businessMemory.js` | All empty arrays |
| `src/data/staff.js` | `STAFF = []` |
| `src/data/systemConfig.js` | Duplicates `src/config/systemConfig.js` |

### Duplicate systems
| Duplication | Impact |
|---|---|
| Two Zohar implementations: `EventZohar.jsx` (tab, real data) + `ZoharPanel.jsx` (EventBrain, 837 lines, demo data) | Diverging logic; ZoharPanel must be replaced with Zohar brief components |
| Two user tables: `auth_users` + `hospia_users` | Explicit reconciliation debt |
| `src/data/systemConfig.js` vs `src/config/systemConfig.js` | Legacy duplicate |
| `managerActionCenter` merged into `actionBoard` but file preserved | Dead navigation entry |
| `endOfShiftReview` merged into `endOfDay` but file preserved | Same pattern |

### Demo-data contamination risk
`src/features/events/data/eventBrainDemoData.js` is imported by 8 production components. This data is fictional (Cohen-Levi Wedding, 186 guests, named waiters). When a real event is linked to the Architect, these panels still show fictional data. This is the most credibility-damaging technical gap in the product.

---

## Critical Risks

| Risk | Severity | Domain |
|---|---|---|
| Cocktail Lab approvals are device-local | High | Bar operations |
| Demo data in Event Architect panels | High | Product credibility |
| Budget/employee request approvals are device-local | High | Operations management |
| Post-event capture is completely absent | High | Operational memory |
| JWT stored in localStorage | Medium | Security (XSS vector) |
| server.js at 6,503 lines | Medium | Maintainability |
| Two parallel user tables | Medium | Data integrity |
| WhatsApp messaging is simulation with no indication to the receiver | Medium | Communication |

---

## Top Architectural Conclusions

1. **The event workflow already exists and must not be rebuilt.** It is complete from creation to check-in. The missing work is post-event capture and department connections.

2. **Zohar produces real deterministic event briefs.** It is the most valuable intelligence layer in HESTIA. Its outputs must flow into CI and Chef — today they stop at clipboard.

3. **Zohar food brief exists but has no generation path.** The food brief contains all the inputs the Chef module needs. One button and one API call would create a complete food automation path.

4. **Zohar cocktail brief exists but does not seed Cocktail Intelligence.** The most important cross-department connection in HESTIA is missing one button.

5. **Event Architect contains demo-data components that must be de-mocked.** 8 components render fictional venue data regardless of which real event is loaded. The adapter and resolution logic exist; the props are not passed.

6. **Some localStorage-only domains still exist and must be migrated.** The Cocktail Lab pipeline (5 localStorage keys) is the highest-risk gap. Budget requests, employee requests, assigned tasks, and owner notes also have no backend persistence.

7. **Owner Intelligence has some real legacy pages and some WIP/empty pages.** Do not blindly activate all 5 feature flags. `OwnerReport` and `BusinessMemoryPage` have real data. `BudgetApprovals` and `OwnerOperationalRequests` will show empty lists until their backend tables exist.

8. **Cocktail Lab backend migration is important but not Phase 1.** It is the most complex migration in the codebase (ID scheme conflict) and has zero demo visibility. Phase 3.

9. **HESTIA is connected but not unified enough yet.** The modules talk to each other in some places. The event F&B workflow, the pre-shift briefing, the shift organizer, and the operational memory chain are all incomplete connections, not missing features.

10. **The pre-shift briefing not knowing about tonight's events is the single highest-ROI fix in the codebase.** One prop pass connects `buildDailyBriefing()` output to the most-used screen in the system.

---

*Full roadmap implications documented in: `docs/HESTIA_CTO_ROADMAP.md`*
