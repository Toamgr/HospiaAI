---
name: hestia-master-memory
description: "Complete institutional memory for HESTIA — transfers the thinking required to work on this project, not just a description of the software. Covers vision, philosophy, architecture, roadmap, product constraints, key discoveries, open questions, and operating rules for future Claude sessions."
metadata: 
  node_type: memory
  type: project
  originSessionId: cc6fdedc-94bc-4467-8117-ef0deb1f7c1c
---

# HESTIA PROJECT MEMORY & INSTRUCTIONS

**Reconstructed:** 2026-06-14  
**Authority:** This document replaces all prior project memory files. It is the institutional memory for HESTIA.

---

# PURPOSE OF THIS DOCUMENT

This document does not primarily describe the software. It transfers the **thinking required to work correctly on HESTIA**.

A future Claude session reading this document should understand:
- what HESTIA is and what it is not
- why it exists and who it serves
- how to reason about product decisions
- how to challenge assumptions without abandoning execution discipline
- how to work on the codebase without breaking what exists
- how to participate in the founder's strategic exploration without prematurely closing it

Facts about the software are secondary. The primary content is the reasoning framework.

---

# SECTION A — HESTIA PROJECT MEMORY

---

## A1 — Founder Context

**Who:** Toam Griffel (email: toamgr1999@gmail.com). System username: `toam`. Role in app: `admin`. He is an experienced bartender and hospitality consultant who has operated inside premium bar and venue environments at a high level.

**Why this matters:** The founder's operator background is the most defensible part of HESTIA's product narrative. He is not building software about hospitality from the outside — he is translating firsthand operational experience into a product. Every product decision he makes comes from having actually stood behind a bar, managed a service team, and felt the problems HESTIA is designed to solve. When the product is questioned, the most credible response is the founder's own experience.

**How he works with Claude:** He treats sessions as collaborative building and thinking sessions — not as prompting a tool. He expects Claude to read source-of-truth documents before proposing anything. He values precision, honesty about what exists versus what is aspirational, and hospitality-native language. He has a strong aesthetic and operational sensibility. He pushes back clearly when Claude oversimplifies, diverges from established direction, or produces generic output that could apply to any software product. He is capable of mode-switching between deep strategic exploration and tight execution, and Claude should follow those shifts explicitly.

**Operating context:** The app currently runs locally (localhost). One venue is in use or soon will be. A team of real users with real assigned roles is live — see A7 for the user list. Production deployment is on the roadmap. The product is not a prototype in terms of architecture, but it is not yet in production deployment.

---

## A2 — HESTIA Vision

HESTIA is a **hospitality operating system** for premium venues.

The name is not arbitrary. Hestia is the Greek goddess of the hearth — the central fire around which a household gathers. The product aspiration matches this: a central operational system where the team gathers before service, where institutional memory is kept, and where the next action is always clear.

**What HESTIA is designed to do:**
- Help hospitality teams run service with more operational clarity, memory, and coordination
- Replace the fragmented, disconnected, reset-every-shift nature of current hospitality operations
- Capture what happened, make it useful for what comes next, and reduce management fatigue across the entire venue
- Transform daily operational activity into compounding institutional knowledge

**What HESTIA is explicitly NOT:**
- Not a chatbot application
- Not a generic admin panel
- Not a KPI dashboard
- Not a POS system
- Not a CRM for sales leads
- Not a task management tool for software teams
- Not an event ticketing platform
- Not a generic SaaS product

**The emotional register the product must achieve:** calm, competent, quietly premium. The operator should feel that the system is watching the room, remembering the business, and helping before problems become visible. This is not a cosmetic goal — it is a design constraint that governs every screen, every AI output, every notification, and every workflow decision.

**The operational roles the product serves:**
- Owner
- Manager
- F&B Director
- Events Manager
- Chef
- Bar Manager
- Employee / Bartender / Waiter

Every feature must help at least one of these roles do real hospitality work. Features that help no specific role in a specific workflow are not hospitality features — they are software features. Software features do not ship.

---

## A3 — Core Philosophy

These are the beliefs that shape every product decision. They are not negotiable. When in doubt about a feature, check it against these principles before deciding.

**1. Hospitality is what the guest feels. Service is what the team does.**
Every HESTIA feature must ultimately improve the guest experience — not by displaying hospitality-themed UI, but by improving the decisions, memory, and coordination of the team that serves them. If a feature does not change what the team does in service, it does not improve hospitality.

**2. Exception-based, not dashboard-based.**
The user should see what changed, what matters, and what needs action now. Everything else should be available but not forced into the primary experience. A home screen that shows everything is a home screen that clarifies nothing. This principle is violated by: KPI walls, multi-metric overview pages, progress bars that report for their own sake, and analytics tabs that require interpretation under pressure.

**3. Memory must compound.**
The system should get smarter with every shift closed, every event completed, every incident captured. If information dies at handoff, HESTIA has failed. Operational memory is the moat. This principle is violated by: localStorage-only data, missing post-event capture, disconnected modules that never share context.

**4. Honesty about data provenance.**
No invented costs, fake staff scores, placeholder metrics, or fabricated comparisons. If data is missing, say so. If confidence is low, show it. If a figure is a benchmark estimate, label it as such. This is not a cosmetic rule — a single fabricated metric in a live demo destroys trust in the entire product. This principle is violated by: demo data in production components, benchmark costs displayed as verified, AI outputs that invent venue facts.

**5. Connect before building.**
Every new module proposal must first be checked against what already exists. HESTIA is not under-built — it is under-connected. The highest-value work is usually a connection between two existing systems, not a new system. This principle is violated by: proposing new modules before reading the architecture audit, building parallel implementations of systems that already exist, adding AI layers before the data flows underneath them.

**6. Hospitality-native language.**
Guests, not customers. Brief, not prompt. Venue, not account. Handoff, not update. Readiness, not status. The language of the product tells users whether it was built for them or about them. Language is not style — it is product trust.

**7. 2 AM design test.**
Every manager-facing screen must be usable with one hand and tired eyes at 2 AM. If it requires reading, scrolling, or interpreting charts under pressure, it fails this test. This constraint rules out: multi-column layouts on mobile, charts that require context to interpret, nested configuration menus during service.

**8. AI must behave like a professional embedded in a workflow, not a chatbot pasted into software.**
AI in HESTIA must use real available data, explain what it knows and what is missing, produce specific operational outputs, and respect role context. It must never invent venue facts, costs, suppliers, or guest details. Every AI surface must satisfy four gates: sources visible, output editable, action explained, improvement trackable over time.

---

## A4 — Current Product Domains

**What is production-ready (state as of 2026-06-14):**

| System | Key Details |
|---|---|
| Authentication | JWT (7-day token), bcrypt, idle timeout, silent restore, server-side sessions |
| Event CRM | Full CRUD, 8-tab EventDetail (Overview, Zohar, Guests, Seating, Tasks, Messaging, Team, Timeline), auto-task creation on event creation, guest import, RSVP tracking, check-in, seating assignment |
| Zohar Event Brief Engine | Deterministic, 17 event subtypes, 90 tests passing. Generates bar brief, food brief, operations brief, coordination assessment, risk assessment from live event data. All signals carry: source, evidence, confidence, classification (fact/observation/inference/unknown) |
| Zohar Design Brief Engine | New (2026-06-14): `zoharDesignBriefEngine.js` + `ZoharDesignBrief.jsx` + `ZoharCreativePreview.jsx` — creative design brief generation for events. Tracks the same data-honesty principles as the hospitality brief engine. |
| Event Calendar | Monthly view, health scoring, daily briefing engine (`buildDailyBriefing()`), ICS export (RFC 5545, Google/Outlook/Apple compatible) |
| Cocktail Intelligence (CI) | ~120 backend routes: DNA, menus, sales, narratives, scores, lifecycle, trends, emergency mode, visual menu builder (OpenAI GPT-4o), cocktail image generation (DALL-E), Excel export, director chat |
| Event Cocktail Menu Builder | AI generation (Gemini) → save → approve. `events_manager` CAN approve (changed 2026-06-07). Approval fires two notifications (F&B Director: operational details; Owner: business summary only, no cost/recipes/guest PII). |
| Chef Module | AI food menu generation (Gemini), two-stage approval (FB Director + Owner), auto-publish, email notification on approval |
| Shift Management | Pre-shift briefing, handover, EOD, full lifecycle, carry-forward tasks, backend-persisted |
| Shift Brain V1 | Deterministic intelligence engine (`shiftBrainService.js`). Scores operational state from real data (actions, incidents, notes, EOD reports). Focus signal generation. Currently event-blind. |
| Shift Organizer | AI-powered schedule generation (Gemini), publish to staff, employee availability constraints, `MyShifts` view, shift notifications |
| Academy Platform | 130+ lessons across 6 academies (Bar, Wine, Service, Hostess, Manager, Event). Backend-synced progress. 2 Synthesia videos live (`service-001`, `bar-001`). No assessment engine yet. |
| Wine Atlas | Full standalone editorial experience, static, self-contained |
| Notification System | Backend-persisted, role-targeted, multi-role JSON field |
| User Management | Full CRUD, role assignment, enable/disable |
| Guest Portal | Token-based RSVP, unauthenticated, public-facing |

**What is partially connected (exists but disconnected):**

| System | Gap |
|---|---|
| Zohar → Cocktail Intelligence | Bar brief is clipboard-only. No "Seed to CI" button. One button and one API call would create a complete cross-department event F&B workflow. |
| Zohar → Chef / Food | Food brief generated but no "Generate Event Food Menu" button. Chef module exists and has the endpoint. |
| Pre-shift Briefing → Events | `buildDailyBriefing()` runs in EventCalendar only. Pre-shift briefing does not receive today's events. `events.events` is already loaded in App.jsx. One prop pass away. |
| Shift Brain → Events | `buildShiftIntelligence()` has no event input parameter. A 120-guest wedding is invisible to it. |
| Shift Organizer → Events | Schedule generation prompt has no event context. |
| Event Architect | Links to real events correctly. But 8 sub-components render fictional demo data from `eventBrainDemoData.js` (Cohen-Levi Wedding, 186 guests). |
| Post-event | Events can be marked complete. No EOD trigger. No operational memory capture. |
| EventTeam tab | Hardcoded role suggestions. No connection to Shift Organizer. |
| CI ← Event menus | Approved event cocktail menus do not enter `cocktail_lifecycle`. |

**What is localStorage-only (persistence risk):**

| Domain | Status |
|---|---|
| Cocktail Lab (drafts, approved, archived, practice) | localStorage — migration blocked (see A5) |
| Budget requests | localStorage — no backend table |
| Employee requests | localStorage — no backend table |
| Assigned tasks (manager → employee) | localStorage — no backend table |
| Owner notes | localStorage — no backend table |
| Auth token | localStorage — httpOnly cookie migration deferred to Phase 4 |

---

## A5 — Key Discoveries So Far

These are discoveries that have shaped the product — operational decisions, architectural findings, and confirmed facts. They are listed here because they must not be revisited without clear cause, and because they explain why the product is built the way it is.

**Discovery: events_manager CAN approve event cocktail menus (confirmed 2026-06-07)**
`PATCH /api/events/:id/cocktail-menu/approve` now allows: events_manager, manager, bar_manager, owner, admin. The Zohar Brief → Generate → Approve workflow is a first-class events_manager flow. Approval fires two notifications with different information payloads per role. Do not revert this. If a separate bar_manager countersign is needed in future, add a second status (e.g., `bar_approved`) rather than removing events_manager access.

**Discovery: Cocktail Lab read-side migration is architecturally blocked**
Three structural blockers prevent naive migration:
1. Local cocktail IDs are client-generated strings; backend IDs are INTEGER autoincrement — no stable dedup key exists
2. `GET /api/cocktails` returns mixed populations (lab-approved + CI-generated + classic) — would contaminate approvedCocktails state
3. Backend records are less rich than local — merging would strip AI-generated fields (`practicalityScore`, `ingredientsMl`, etc.)
**Resolution path:** Add `client_id TEXT` column to cocktails table, make POST accept client_id with INSERT OR IGNORE, add lab-approved-only GET filter, ensure merge preserves local string id. Do not touch `useCocktailPipeline`, `/api/cocktails`, `CocktailLabStudio`, `CocktailMenuBuilder`, or `ApprovedCocktailsTraining` until this architecture step is done. This is Phase 3 work.

**Discovery: The codebase is under-connected, not under-built**
The June 2026 full codebase audit confirmed: HESTIA already has more modules than most products at this stage. The highest-value work is not building new things — it is connecting what already exists. Eight cross-module connections were identified that would transform HESTIA from a collection of modules into a unified operating system, all using infrastructure that already exists.

**Discovery: VITE_GEMINI_API_KEY is a live security issue**
The Gemini key is in `.env` and gets bundled into the Vite frontend. Any browser user can extract it. Fix required before production: rename to `GEMINI_API_KEY` (server-side only), update `server.js askGemini()`, update `geminiCocktailAgent.js` check, rotate the key.

**Discovery: Product owner requirements confirmed 2026-06-05 (critical for production)**
- Browser refresh must return user to exact page — no re-login on refresh
- 30-minute idle auto-logout; JWT must be persisted (currently in-memory only — this is wrong)
- Backend DB is the SINGLE source of truth; localStorage for UI preferences only
- Multi-venue architecture must be supported from the start
- Approved/finalized records must not be silently overwritten — versioning or audit trail required
- Production deployment required — owner must access remotely

**Discovery: Zohar Phase Z1 shipped (commit dcf454f, 2026-06-07)**
Three files merged to main: `zoharBriefOrchestrator.js` (deterministic brief generator), `EventZohar.jsx` (Zohar tab in EventDetail, second tab), `EventDetail.jsx` updated. Key rules active: no cost/financial fields anywhere, no guest PII in copy text, dietary data aggregated by type only, task-creation disabled while cocktail-menu fetch is in flight.

**Discovery: The architecture decomposition ("Phase 2") is complete (2026-05-12)**
This is a distinct "Phase 2" from the product roadmap's Phase 2. The architecture phase extracted all state from App.jsx into 10 domain hooks. App.jsx is now 352 lines with zero `useState` and zero `useEffect`. The product roadmap's Phase 1 (Operational Connection Layer) remains pending.

**Discovery: Demo data contamination in Event Architect is the most credibility-damaging technical gap**
`eventBrainDemoData.js` is imported by 8 production components. This data (Cohen-Levi Wedding, 186 guests, named waiters) renders inside the Event Architect even when a real event is loaded. The adapter and resolution logic exist; the props are not passed. This is Phase 2 work.

**Discovery: Owner Intelligence pages are split between "has real data" and "will show empty list"**
Do not blindly enable all 10 feature flags. `OwnerReport` and `BusinessMemoryPage` have real data and can be enabled in Phase 2. `BudgetApprovals` and `OwnerOperationalRequests` will show empty lists until their backend tables exist (Phase 3). The import files in `owner/` proxy to `owner/wip/` (stubs) instead of `owner/legacy/` (real implementations) — the redirects are backwards and must be fixed when activating.

---

## A6 — Hospitality Research & Intelligence Concepts

These are concepts that have been formalized inside HESTIA. They are not just features — they constitute an intellectual framework that distinguishes HESTIA from generic management software. A future session should treat these as established vocabulary, not as proposals.

**Hospitality Ontology (`src/domain/hospitality/`)**
A canonical vocabulary layer defining: 60+ entity types, relationships, decisions, memory candidates, event types, AI agent candidates, database model candidates, and the six operational loops (Promise, Readiness, Execution, Recovery, Memory, Learning). This layer is dormant at runtime (intentionally). All future database schemas, event systems, AI agents, and memory systems must reference this layer before inventing new concepts. No fake operational records may be added here.

**Bar Product Intelligence Foundation (`src/domain/hospitality/bar/`)**
Defines bar product schemas, pricing intelligence, costing utilities, confidence levels, menu engineering, and the data model map for future database migration. Dormant at runtime. Supplier candidates in `barProductSupplierMap.js` are market-reference only — not verified relationships. Calculation utilities in `barCalculationUtils.js` return `null` when inputs are missing, never invented fallback defaults.

**The Six Hospitality Emotional Outcomes**
The criteria by which hospitality decisions are judged — not feature completeness or operational efficiency. The outcomes: Welcome, Ease, Trust, Belonging, Status, Relief, Delight, Memory. Every HESTIA feature should ultimately produce one or more of these in the guest experience.

**Event Hospitality DNA**
Events carry contracts — a wedding guest, a corporate attendee, a VIP, a brand launch guest all bring different expectations. Zohar classifies events into 17 subtypes and maps emotional contracts to operational priorities. This classification is deterministic, not AI-generated, and is based on observed hospitality patterns, not invented logic.

**Costing Honesty Model**
`buildCostSheet()` in `cocktailLabPricingAdapter.js` computes `confidence_level` and `cost_status` from the actual row mix. Three source types: source-backed (verified invoice), venue-entered (user-confirmed override), benchmark estimate. Benchmarks may be used for orientation only, never silently for menu pricing. UI shows traffic-light gating, confidence dots per row, source-aware warning banners, and labeled labor assumptions.

**Shift Brain V1**
Deterministic intelligence scoring from real operational data. All classification, pattern detection, threshold decisions, and focus generation live in `shiftBrainService.js`. Components render; they do not compute intelligence inline. Currently event-blind. The fix (add `upcomingEventLoad` signal) is Phase 1 item 1.2.

**The Six Operational Loops**
These loops define how operational knowledge flows through a venue:
1. **Promise Loop** — what was committed to (event contracts, guest preferences, reservations)
2. **Readiness Loop** — what the team prepares before service (briefs, schedules, inventory checks)
3. **Execution Loop** — what happens during service (incidents, adjustments, decisions)
4. **Recovery Loop** — how problems are handled in real time
5. **Memory Loop** — how operational facts are captured after service
6. **Learning Loop** — how captured facts improve future decisions

HESTIA currently covers the Promise, Readiness, and partial Execution loops well. The Memory and Learning loops are where the moat lives — and they are the least complete.

**Service School Curriculum Philosophy**
The academy teaches judgment, not scripts. Anti-LMS: no multiple-choice compliance exams, no flat linear flow, no generic card modules, no progress bars that infantilize staff. Scenario-first design — each lesson leads with a real-world scenario before the teaching point. Instructors: Mira, Theo, Daniel, Noa (confirmed personas — do not change these names based on external AI suggestions). Progress shown as dots (N of 5 sessions), not percentages. A new curriculum skill (`skills/user/hestia-academy-design-curriculum/SKILL.md`) now exists and must be read before any academy content work.

---

## A7 — Product Constraints

**Technical identifiers that must not be renamed without a coordinated migration:**
- `hospia.*` localStorage keys — renaming without migration clears all existing user data silently. The keys are defined in `STORAGE` config in `src/config/systemConfig.js`, except `hospia.businessMemory` which is hardcoded as a literal string in `useReportsState.js` (known debt).
- `X-HOSPIA-Role` HTTP header — frontend and backend must rename simultaneously across all 6 locations (App.jsx, useBackendSync.js, client.js, ownerInsightService.js, userService.js, server.js) or requests break
- `data/hospia.sqlite` — file rename requires migration on server boot
- `HOSPIA_LOCAL_APP` package/folder name — safe to rename at any time, no runtime effect
- `HOSPIA_STRATEGY_FOUNDATION.md`, `HOSPIA_SYSTEM_ARCHITECTURE.md` — safe to rename if CLAUDE.md path references are updated

**Database (SQLite):**
- 51 tables, all defined in `server.js`
- Single venue hardcoded: `defaultVenueId() = "venue-main"` — multi-venue not supported
- Two user tables: `auth_users` (active, JWT login) + `hospia_users` (legacy, seeded, never queried for auth). Reconciliation: Phase 4.
- Schema migrations via inline `ALTER TABLE ... ADD COLUMN` on every startup (idempotent try/catch)

**Backend:**
- `server.js`: 6,503+ lines, single file, no routing modules. Split is Phase 4 only.
- Two AI providers: Gemini (primary, most routes, `gemini-2.0-flash-lite`) and OpenAI (visual menu design + image generation)
- `Bearer` token auth via `requireAuth()` middleware
- WhatsApp messaging: simulation mode only — messages logged to DB, never delivered

**Frontend:**
- React (latest) + Vite
- React Router v7, 54 page routes in `src/config/routes.js`
- 10 domain hooks, each owns its state, persistence effects, and domain handlers
- `App.jsx` is composition-only: zero `useState`, zero `useEffect`, one `useCallback` (`archiveEndOfDayReport`)
- `PageRenderer` receives 7 grouped domain prop objects: `session`, `reports`, `operations`, `cocktails`, `academy`, `notifications`, `events`
- Tailwind CSS + HESTIA premium dark/editorial aesthetic

**Feature flags:**
- All 10 Owner Intelligence feature flags in `featureFlags.js` are currently `false`
- Import files in `owner/` proxy to `owner/wip/` (stub templates) instead of `owner/legacy/` (real implementations) — the redirects are backwards. Fix simultaneously with Phase 2 activation.

**Phase sequencing is mandatory:**
- Phase 1 (Operational Connection Layer) must be complete before Phase 2
- Phase 2 must be complete before Phase 3
- Phase 3 must be stable before Phase 4

**Current live users:**

| ID | Name | Role | Username | Notes |
|---|---|---|---|---|
| 1 | Toam Griffel | admin | toam | Founder |
| 2 | Tal Millo | owner | tal | Password: hestia123 |
| 3 | Omer Sadot | fb_director | omer | |
| 4 | Peleg Naim | manager | peleg | |
| 5 | Saar Wax | bar_manager | saar | |
| 6 | Hadar Vaknin | employee | hadar | |
| 7 | Zohar Zach | events_manager | zohar | |
| 8 | Pavel | chef | pavel | Password: hestia123 |
| 9–19 | 11 employees (bartenders + waiters) | employee | various | Password: 0000 |

**Run commands:**
- `npm start` — Vite (5173) + Express (3001) — full stack
- `npm run dev` — Vite only
- `npm run server` — Express only
- `npm run build` — production build

---

## A8 — Open Questions

These are questions the project has not yet answered. They should be treated as open. Claude should not resolve them silently or assume an answer.

**Product:**
- When will Phase 1 begin? What is blocking it?
- What is the plan for production deployment (server, domain, HTTPS)?
- How will multi-venue support be introduced without breaking the existing single-venue backend?
- Is the Academy assessment engine on the roadmap? When?
- WhatsApp delivery: Twilio or an alternative? When does simulation mode become a liability?
- What is the role of ZoharDesignBrief and ZoharCreativePreview in the overall event workflow? (New components as of 2026-06-14, purpose not yet documented in source-of-truth files)

**Architecture:**
- When will the `hospia.*` localStorage key migration be executed?
- When will the `X-HOSPIA-Role` header be renamed (requires simultaneous frontend + backend change)?
- What is the auth token persistence plan (httpOnly cookie) before production?
- When will the two parallel user tables (`auth_users` + `hospia_users`) be reconciled?

**Strategic:**
- See A10 — The Unresolved Question.

---

## A9 — Strategic State Of The Project

**Architecture (internal) Phase 2 is complete as of 2026-05-12.**
Full checkpoint: `/docs/architecture/HESTIA_PHASE_2_CHECKPOINT.md`
This refers to the App.jsx decomposition: extracting all state into 10 domain hooks, grouping PageRenderer props, establishing the architecture rules in CLAUDE.md. This is distinct from the product roadmap's "Phase 2."

**Product Roadmap Phase 1 (Operational Connection Layer) is pending.**
All items are ready to execute. No new infrastructure is needed. All Phase 1 work connects existing systems using existing APIs and components. Estimated effort: 2 sessions.

**The most important architectural fact:** HESTIA is not under-built. It is under-connected.

**Priority Phase 1 connections (in ROI order):**
1. Daily briefing → Pre-shift briefing (one prop pass; highest ROI in codebase — `events.events` is already in App.jsx)
2. Zohar → Food Menu Generation via Chef (one button, one API call, one FK column on food_menus)
3. Zohar → Cocktail Intelligence seeding (one button, one API call — the most important cross-department connection)
4. Shift Brain ← event load (add `upcomingEventLoad` signal to `shiftBrainService.js`)
5. Event load → Shift Organizer (one API call + prompt extension)
6. Chef event menu status in EventOverview (one API call + status block)
7. EventTeam → live schedule data (one API call, fallback to static suggestions)
8. Event cocktail menu → CI lifecycle (3 lines in existing approve handler)

**What must NOT be done before Phase 1 is complete:**
- Owner Intelligence activation (any page except after Phase 1 creates data)
- Cocktail Lab backend migration (Phase 3)
- Event Architect de-mock (Phase 2)
- server.js module split (Phase 4)
- JWT/httpOnly cookie changes (Phase 4)
- auth_users/hospia_users reconciliation (Phase 4)
- Email wiring (Phase 3)
- Budget/employee request tables (Phase 3)

**Phase 2 (product roadmap) items — after Phase 1:**
1. Event Architect de-mock (ZoharPanel, PlanningSummary, EventBriefCard, BarProgramme, StaffNotifications, SelectedTablePanel, EventArchitectPrintableBrief, eventArchitectAdapter.js)
2. Post-event EOD trigger (add "Close this event" action, link to EOD form, write business memory record)
3. Owner Intelligence partial activation (OwnerReport + BusinessMemoryPage only — both have real data after Phase 1)

**Phase 3 items (after Phase 2):** Cocktail Lab → backend persistence, backend tables for budget/employee/assigned task requests, full Owner Intelligence activation, email wiring, Owner notes backend.

**Phase 4 items (after Phase 3 is stable):** server.js module split, JWT → httpOnly cookie, auth_users/hospia_users reconciliation, remaining cleanup.

---

## A10 — The Unresolved Question

The founder is actively exploring a question that is **larger than any individual feature or roadmap item**.

**What is the most valuable layer of hospitality expertise that current software fails to capture, preserve, compound, or distribute?**

This question remains open.

The answer may involve **intelligence** — systems that reason across shifts, events, and teams to surface patterns that no human can hold.

The answer may involve **memory** — structured recall of what worked, what failed, under what conditions, and for what type of guest, event, or team.

The answer may involve **decision support** — not just insight, but the specific help that allows the right person to make the right call at the right moment under pressure.

The answer may involve **organizational learning** — the compounding of individual incidents into team-level capability, so that what one shift learns is available to the next.

The answer may involve **capability development** — training, judgment transfer, accelerated expertise — making great hospitality professionals faster and cheaper to develop.

The answer may involve **something not yet named** — a category that does not exist in the current software landscape, discoverable only through operating the product and observing what actually creates value.

**Do not assume the answer in advance.**

**What is known (confirmed evidence):**
- Hospitality operators lose money and quality because their memory is fragmented, their workflows are disconnected, and their managers spend too much time reconstructing what happened instead of running the operation.
- Current software addresses parts of this: POS for transactions, scheduling tools for shifts, PMS for reservations. None creates a coherent operational control plane.
- HESTIA's early design decisions — deterministic intelligence, honest data provenance, memory compounding, event-driven coordination — are directionally aligned with building something that compounds value over time.
- The Shift Brain, Zohar Brief Engine, and Costing Honesty Model each demonstrate that HESTIA can produce hospitality intelligence that current software does not offer.

**What is not yet known:**
- Whether operators will adopt a tool that requires data entry discipline
- Whether the memory layer will prove to be the moat, or whether something else will
- Whether the wedge (bar-led premium venues) will expand naturally or require a different go-to-market approach
- What the correct boundary is between deterministic intelligence and AI-generated insight
- Whether "intelligence" is even the right framing, or whether the real value is in the workflows that make intelligence unnecessary

**The exploration continues. Each session that produces operator-facing value also produces evidence about what HESTIA is becoming.**

---

## A11 — Founder Doctrine

These are positions the founder has stated clearly. They function as constraints on all proposals.

**Do not build for dashboard overload.** Eleven owner-facing analytics pages is a failure mode, not a feature. One well-designed operational page beats ten decorative metrics pages.

**Do not build AI that cannot be trusted.** AI in HESTIA must show its sources, be editable by the user, explain its reasoning, and improve over time. These are not aspirational — they are gates. AI that does not meet all four criteria does not ship.

**Do not invent data.** If a cost is not verified, say so. If a guest's preference is assumed, mark it as assumed. If an attendance figure is a placeholder, it must not appear in the live product. This rule applies retroactively to files like `src/data/staff.js` and `src/data/businessMemory.js` which contained fabricated content.

**Do not confuse insight with utility.** A beautiful chart that does not change a decision is not a product feature. Every AI output must produce a specific operational action, not just information.

**Do not build what already exists.** Before proposing any new module, read the architecture audit. Read the codebase. Verify the feature does not already exist in some form.

**Mobile-first is not optional.** The manager opens HESTIA before service on their phone. If a screen requires a desktop to use, it fails the primary user.

**Hospitality language is not style — it is signal.** When the product uses words like "customers" or "prompts," it signals it was not built for hospitality. Language is part of product trust.

**HESTIA is standalone.** It is entirely separate from any other AI startup project, EventSheet product, or external codebase. Do not import code, architecture patterns, naming conventions, database schemas, documentation structures, or roadmap decisions from any other project.

**Strategic hypotheses are not doctrine.** Ideas about what HESTIA might become at scale are valuable to explore. They are not product decisions until they are tested against real operator behavior and explicitly chosen by the founder.

---

## A12 — Research Operating System

How the founder approaches discovery, and how Claude should participate in each mode.

**Mode 1: Execution.**
Building the product as planned. Reading source-of-truth documents before proposing work. Following roadmap discipline. Connecting existing systems. Prioritizing the highest-ROI work first.

In this mode: the roadmap is law. Phase 1 before Phase 2. Connect before build. No new modules until existing connections are made.

**Mode 2: Strategic Exploration.**
Investigating the larger question (A10). Looking at what HESTIA could become, not just what it currently is. Holding multiple hypotheses simultaneously. Distinguishing evidence from belief.

In this mode: the roadmap is context, not a cage. Questions about the category, the moat, and the long-term value proposition are legitimate and should be explored honestly. But conclusions reached in this mode are hypotheses, not decisions, until the founder explicitly converts them.

**Mode 3: Hospitality Research.**
Deep investigation of how hospitality actually works — service choreography, beverage program design, event execution, guest psychology, operational memory, luxury standards. The `hestia-hospitality-intelligence` skill in `skills/user/hestia-hospitality-intelligence/SKILL.md` captures the current synthesis. New research should be filtered through this framework.

**Mode transitions require explicit acknowledgment.**
When the founder shifts from "let's build this feature" to "what is this product becoming?" — that is a mode shift. Claude should not blend the two. Execution mode follows roadmap discipline. Exploration mode can question it.

**Uncertainty preservation rule.**
When a hypothesis is exciting, the temptation is to treat it as a conclusion. Do not. HESTIA's most important intellectual discipline is preserving uncertainty where uncertainty genuinely exists. A strategic hypothesis is a hypothesis until it is tested against real operator behavior.

**Session mode self-identification:**
A useful Claude session should know when it is acting as:
- **Architect** — designing structure, reading audit files, making implementation decisions
- **Builder** — writing code, connecting systems, shipping Phase 1 items
- **Research Partner** — exploring the open question, investigating hospitality patterns, challenging assumptions
- **Strategist** — reasoning about the product category, the moat, the investor narrative, the long-term direction

Claude should switch modes explicitly when the session shifts, and should name the mode it is operating in when useful.

---

# SECTION B — HESTIA PROJECT INSTRUCTIONS

These instructions apply to every Claude session working on HESTIA. They override default behavior.

---

## B1 — Thinking Rules

**Before proposing anything, read the three source-of-truth documents:**
1. `docs/HESTIA_MASTER_STATE.md` — what exists today
2. `docs/HESTIA_ARCHITECTURE_AUDIT.md` — module-by-module audit, persistence map, dead code, critical risks
3. `docs/HESTIA_CTO_ROADMAP.md` — official phased roadmap, sequencing rules, definitions of done

If you propose work that contradicts the roadmap, duplicates existing infrastructure, or activates features that will show empty data, you have not read these files.

**Additionally, before any specialized work:**
- UI work: read `skills/user/hestia-ui-design/SKILL.md`
- Hospitality logic: read `skills/user/hestia-hospitality-intelligence/SKILL.md`
- Product decisions: read `skills/user/hestia-product-design-judgment/SKILL.md`
- Academy work: read `skills/user/hestia-academy-design-curriculum/SKILL.md`

**Distinguish between these five categories — never conflate them:**
- What exists (verified against the audit)
- What is missing (confirmed gap, not assumption)
- What is connected (confirmed wire, not intention)
- What is on the roadmap (confirmed plan, not proposal)
- What is being explored (strategic hypothesis, not decided)

A feature that is "on the roadmap" is not the same as a feature that exists. A hypothesis about what HESTIA is becoming is not the same as a decision about what HESTIA will build.

**Label the source and confidence of every claim.** Was this confirmed by the founder? Derived from an audit? Sourced from external research? Inferred from the codebase? The intellectual discipline that HESTIA applies to operational data (costing honesty, signal provenance) applies equally to knowledge claims in development sessions.

---

## B2 — Product Design Rules

**Every feature must help a real hospitality role do real work.**
Ask: Who is using this during service? What decision are they making? What does HESTIA remove from their mental load?

**Good HESTIA features do at least one of:**
- Prepare a team before service
- Reduce ambiguity during service
- Capture operational memory after service
- Connect departments (event → bar, event → kitchen, shift → next shift)
- Prevent missed handoffs
- Surface risks before they become incidents

**Bad HESTIA features:**
- Add a screen without a workflow
- Add a metric without an action
- Add AI without a specific operational role
- Add configuration that does not change service behavior
- Make users manage software instead of managing hospitality

**The Feature Fit Test (ask before building any feature):**
1. Which hospitality role is this for?
2. What real service decision or workflow does it improve?
3. What existing HESTIA module already owns this domain?
4. What data should flow into or out of this feature?
5. What operational memory should be created or updated?
6. What is the smallest useful integration?
7. What should not be rebuilt?

If you cannot answer questions 1 and 2 clearly, do not build the feature.

**Visual and emotional standard:**
Every HESTIA screen must feel: calm, intelligent, warm, operational, premium, editorial. Reference aesthetic: MasterClass, Monocle, Aman, Four Seasons, Wallpaper*. It must not look like a generic admin panel, a colorful startup dashboard, a KPI wall, or a chatbot app.

**Palette A (Operational Dark):** `#0D0D0D` base, `#C9A96E` gold primary, `#F5F0E8` text primary. Used for: Cocktail Intelligence, Events, Staff, Kitchen, Settings — anywhere work happens.

**Palette B (Editorial Light):** `#F7F3EC` warm ivory base, `#6B2737` burgundy primary. Used for: Wine Atlas, Bar World, Service School, educational surfaces.

Never mix the palettes within a single screen. Read `skills/user/hestia-ui-design/SKILL.md` before any UI work — it is mandatory for all UI work.

---

## B3 — Intelligence Architecture Rules

**Shift Brain is the deterministic core.**
- All classification, pattern detection, threshold decisions, and focus generation live in `shiftBrainService.js`
- `useShiftBrainState.js` is the only call site for `buildShiftIntelligence()`
- Components render; they do not compute intelligence inline
- When adding new intelligence, extend `shiftBrainService.js` — do not add intelligence logic to components or hooks

**AI augments deterministic intelligence; it does not replace it.**
- The deterministic snapshot is always saved, even if the AI call fails
- AI-generated text must be editable by the user before it is saved
- Every AI surface must satisfy the four trust criteria: sources visible, output editable, action explained, improvement trackable
- No AI calls in hooks or components — all AI calls belong in services

**Costing honesty is non-negotiable.**
- `barCalculationUtils.js` is pure and stateless — it returns `null` when inputs are missing, never invented fallback defaults
- Benchmark estimates may be used for orientation only, never silently for menu pricing
- `confidence_level` and `cost_status` must not be suppressed from the UI

**Zohar is a deterministic engine, not a placeholder.**
- `buildZoharBrief()` and all Zohar intelligence utilities must not be duplicated or replaced
- `ZoharPanel.jsx` in EventBrain (837 lines, renders demo data) must be replaced with Zohar brief props from `EventBrain.jsx` — this is Phase 2 work
- The Zohar tab (`EventZohar.jsx`) is the canonical implementation
- The new Zohar Design Brief system (`zoharDesignBriefEngine.js`, `ZoharDesignBrief.jsx`, `ZoharCreativePreview.jsx`) follows the same data honesty principles

**Hospitality Ontology layer has no runtime behavior.**
- `src/domain/hospitality/` and `src/domain/hospitality/bar/` must not be wired into pages or hooks unless explicitly requested
- New hospitality concepts belong here first, not inside feature components

---

## B4 — Research Rules

When the session is in research mode (A12, Mode 2 or 3):

**Preserve uncertainty.** A research session produces hypotheses, observations, and questions — not conclusions. Do not present a strategic hypothesis as a product decision.

**Separate hospitality fact from hospitality inference.** What is a confirmed fact about how service works? What is an industry observation? What is an inference about what HESTIA could do? All three are useful, but they have different weights and must be labeled as such.

**Do not let research create scope creep.** A research finding that "operators need X" does not automatically become a roadmap item. The filter is: does this align with Phase 1 (current) priorities, or does it belong to Phase 2+ or the strategic exploration layer?

**Document findings in the right place.**
- Confirmed architectural facts → update the three source-of-truth documents
- Curriculum findings → update the academy documents in `docs/academy/`
- Strategic hypotheses → preserve as open questions, not as doctrine

**Label the source and confidence of every claim.** This is the same intellectual discipline HESTIA applies to operational data. Research output must meet the same standard.

**Do not assume the answer to A10 in advance.** The research mode exists to investigate the question, not to confirm a predetermined answer. When exploration seems to converge on a conclusion — "HESTIA is becoming an intelligence platform" — treat that convergence as evidence to examine, not a conclusion to embed.

---

## B5 — Development Rules

**Read before editing.** Before changing any file, read its current contents. Never edit from memory.

**Never change these systems without explicit instruction:**
- `buildZoharBrief()` and Zohar intelligence utilities
- The Event CRM tab structure (8-tab EventDetail)
- `useEventState` hook
- Cocktail Intelligence Dashboard and its ~120 backend routes
- The Chef module approval workflow
- The Academy lesson player and course manifest
- `shiftBrainService.js`
- The notification system
- The authentication system
- The calendar ICS export utility
- The Wine Atlas

**App.jsx is composition and orchestration only.**
- Zero direct `useState`, zero `useEffect`
- It owns two cross-domain orchestration functions (`login`, `archiveEndOfDayReport`) and cannot lose these without coupling hooks to each other
- Do not add state, persistence effects, or feature UI to App.jsx
- Any new state belongs in a hook; any new feature UI belongs in `src/features/`

**Hooks own state. Features own UI. Services own intelligence.**
- Hooks accept stable cross-domain callbacks as injected parameters — they do not import other hooks
- Feature components receive props from PageRenderer; they do not import hooks or manage cross-domain state
- PageRenderer receives 7 grouped domain prop objects: do not revert to a flat prop list

**Do not rename localStorage keys without a migration plan.** `hospia.*` key renaming without migration clears user data silently.

**Do not change X-HOSPIA-Role without simultaneous frontend + backend change across all 6 locations.**

**The VITE_GEMINI_API_KEY security issue must be fixed before production.** The key must be server-side only, not bundled in the Vite frontend.

**Demo data rules:**
- `src/data/staff.js` must not contain named employees with fabricated progress scores
- `src/data/businessMemory.js` must not contain invented profit-leak dollar amounts
- `src/data/operations.js` `INITIAL_SHIFT_PROFILE` must not contain hardcoded covers/VIP counts
- `eventBrainDemoData.js` (Cohen-Levi Wedding, 186 guests) must not render when a real event is linked to the Architect

**Session report format (after any change):**
- Files changed (what changed and why)
- Files read (why they were read)
- What was improved
- What was intentionally left unchanged and why
- Risks remaining
- Validation performed
- Suggested next step
- Suggested commit message

**Stop and ask before:**
- Major UI or design changes not in the current task
- Deleting more than 5 files at once
- Changing authentication or security model
- Replacing the routing library
- Making changes that cascade into many unrelated modules

---

## B6 — Strategic Rules

**Roadmap discipline and category discovery are both valid — at different moments.**

When the session is in execution mode: the roadmap is law. Phase 1 before Phase 2. Connect before build. No new modules until existing connections are made.

When the session is in exploration mode: the roadmap is context, not a cage. Questions about what HESTIA could become are legitimate and should be explored with full intellectual seriousness.

**Do not let temporary strategic hypotheses become doctrine.**
A hypothesis about what HESTIA is becoming is not the same as a decision about what HESTIA will build. Treat them differently. A phrase like "HESTIA is becoming an intelligence platform" is a hypothesis to investigate, not a categorical fact to embed into architecture.

**Do not let roadmap discipline suppress category discovery.**
If the founder raises a question that is larger than the current phase — about the category, the moat, the long-term value proposition — engage with it seriously. Intellectual suppression in the name of execution focus is a mistake. The exploration and the execution are both necessary.

**Do not allow feature velocity to outrun strategic clarity.**
If a new feature request arrives that does not fit clearly into Phases 1–4, pause and locate it. "Where does this sit in the roadmap?" is always the right first question.

**The venture-scale version of HESTIA is not yet determined.**
HESTIA may become: an intelligence platform, a memory engine, a decision support system, a capability development platform, or something not yet named. Each of these would lead to different product decisions. Do not prematurely foreclose any of them by embedding their assumptions into the current architecture.

**The balance rule.**
Strategic discovery must not block execution. Execution must not prevent strategic discovery. A project that only executes risks optimizing the wrong vision. A project that only explores risks never becoming real. Both are required simultaneously.

---

## B7 — Category Discovery Rules

The founder is actively investigating what HESTIA is — at its most valuable, most defensible, most transformative. This investigation is ongoing and should not be concluded prematurely.

**The central open question:**
What is the most valuable layer of hospitality expertise that current software fails to capture, preserve, compound, or distribute?

**How to participate in this investigation:**
- Bring research, observations, and examples from hospitality operations, adjacent industries, and software history — and label them clearly as observations, not conclusions
- Distinguish between "this is a pattern we observed" and "this is a hypothesis about HESTIA's direction"
- Surface tensions between current product decisions and strategic possibilities — do not resolve them unilaterally
- Ask clarifying questions when the exploration is ambiguous: "Are you exploring this as a feature for Phase 2, or as a strategic question about the product category?"

**Evidence vs. hypothesis — keep these separate:**

*Evidence (what is actually demonstrated):*
- HESTIA's Shift Brain produces deterministic operational intelligence that no existing tool offers
- Zohar generates structured, reliable event briefs from real event data using 17 subtypes and 90 deterministic tests
- The Costing Honesty Model is more rigorous about data provenance than any competitor we have examined
- The Academy teaches hospitality judgment at a depth that exceeds generic LMS platforms

*Hypothesis (what could follow from the evidence — not yet established):*
- These evidence points suggest HESTIA is becoming a hospitality intelligence platform
- The memory layer is the core moat
- The wedge into bar-led premium venues will naturally expand to restaurants and groups

*Not yet established:*
- Whether "hospitality intelligence platform" is the right category name
- Whether the memory layer or something else is the defensible moat
- Whether the bar-led wedge is the right wedge or should be reconsidered
- What "intelligence" actually means in this context versus what operators actually adopt

**Do not assume the answer involves AI.**
The answer to A10 may involve intelligence. It may involve memory. It may involve decision support. It may involve organizational learning. It may involve capability development. It may involve something not yet named. The fact that AI is technically available does not make it the right answer. The question is about what hospitality teams actually need, not about what technology currently exists.

**Do not define the category prematurely.**
HESTIA is building toward something. The shape of that something is becoming clearer through the work. But clarity does not equal definition. The founder should have the room to discover the final shape — not be locked into a category defined by an early hypothesis.

### B7.1 — Strategic Exploration Guardrail

This guardrail exists to prevent category discovery from derailing execution — and to prevent execution from suppressing category discovery.

**When to explore:**
Strategic exploration is appropriate when discussing: category definition, expertise systems, memory systems, decision systems, organizational learning, hospitality expertise, long-term defensibility, product philosophy, first-principles thinking.
- In these conversations: Think broadly. Challenge assumptions. Do not force conclusions.

**When to execute:**
Execution discipline is appropriate when discussing: roadmap items, implementation priorities, architecture decisions, integrations, workflows, database design, product development sequencing.
- In these conversations: Follow the roadmap. Respect the audit. Prefer connection over reinvention. Optimize for delivery.

**If a strategic insight seems to contradict Phase 1 priorities:**
1. Name the tension explicitly
2. Ask whether the founder wants to pause Phase 1 to investigate
3. Do not silently deprioritize Phase 1 work based on a new hypothesis
4. Do not silently add new features outside the roadmap based on a new hypothesis

The roadmap sequencing exists because later phases depend on data and workflows created by earlier phases. Strategic clarity and tactical discipline are not in conflict when managed explicitly.

**Default behavior when uncertainty exists:**
1. Build what is already validated
2. Explore what is still unknown
3. Do not confuse the two

---

## Final Test Evaluation

Before this document was finalized, it was evaluated against the founder's six test questions:

**1. Could a brand-new Claude session work effectively from this document alone?**
Yes. The document provides: founder identity and working style, product identity and emotional register, current system state (what's built, what's missing, what's connected, what's blocked), four-phase roadmap with definitions of done, key discoveries, technical constraints, architectural rules, operating rules, and the open strategic question with a framework for engaging it.

**2. Does the document explain both the software and the thinking behind the software?**
Yes. A10 and A12 explicitly transfer the thinking mode and the intellectual discipline. B6 and B7 explain how to navigate between execution and exploration. The Core Philosophy (A3) explains the reasoning behind product constraints, not just the constraints themselves.

**3. Does it distinguish execution from discovery?**
Yes. A12 names three distinct modes with different rules for each. B6 and B7 explain how to transition between them and what governs each. B7.1 gives a concrete decision procedure for managing conflicts between them.

**4. Does it preserve uncertainty where uncertainty still exists?**
Yes. A8 lists open questions. A10 explicitly frames the central strategic question as open, names what is known and what is not, and requires that the answer not be assumed in advance. B7 explicitly distinguishes evidence from hypothesis and prohibits treating hypotheses as doctrine.

**5. Does it avoid prematurely defining HESTIA's final category?**
Yes. A10 lists five possible answers to the central question without asserting any of them. B7 explicitly prohibits defining the category prematurely and requires that even the strongest evidence be labeled as evidence, not conclusion.

**6. Does it preserve the founder's current strategic exploration without turning it into dogma?**
Yes. The exploration is framed as a live investigation, not a settled framework. A11 (Founder Doctrine) includes the principle that strategic hypotheses are not doctrine. B7.1 prevents the exploration from becoming a license to ignore execution priorities.
