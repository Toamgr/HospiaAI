# HESTIA — AI Bar Intelligence Roadmap vs Codebase Audit

**Date:** 2026-06-21
**Type:** Analysis only. No product code, routes, schemas, navigation, or components were changed in producing this document.
**Audited against:** [HESTIA AI Bar Intelligence Roadmap (2026-06-21)](../plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md) — the current product source of truth.
**Companion:** [HESTIA AI Master Execution Plan](../plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md) (intelligence-spine sequencing; superseded for product/roadmap direction by the roadmap above).
**Grounded in direct inspection of:** `src/App.jsx`, `src/config/navigationConfig.js`, `src/config/roleConfig.js`, `src/config/featureFlags.js`, `src/features/owner-intelligence/OwnerAIHome.jsx`, `src/features/*`, `src/hooks/*`, `src/services/venueBridge/*`, and `server.js` route table.

> **Status gate:** Phase 1 implementation must NOT begin until the owner reviews this document and explicitly approves. This audit changes no app behavior.

---

## Confirmed Decisions (recorded 2026-06-21)

1. **Extra roles are kept as secondary modules.** The roadmap's 4-role model (Owner / Manager / Bar Manager / Bartender) is applied as a **navigation/UX layer**, not a destructive role purge. The existing roles `fb_director`, `events_manager`, and `chef` — and their working flows (Events CRM, Chef menus, CI dashboard) — remain intact and functional. This avoids the largest regression risk: breaking working flows to satisfy a cleaner org chart.
2. **First phase is Nav re-skin only.** The first implementation step is a navigation/role re-skin plus a `PageRenderer` extraction — config + one file move, zero schema, fully reversible. No backend, no new data models. Detailed in §12.

---

## 1. Executive Summary

HESTIA already contains **most of the intelligence spine** the roadmap depends on — a real, owner-gated, venue-scoped Venue Learning chat (`/api/venue-intelligence/message` → `mergeVenueDna`), a deterministic distribution layer (`venueBridge`), a venue-aware F&B engine (CI/Omer), a write-only Decision Ledger, a candidate/feedback pipeline, and an honest chat-first owner surface (`OwnerAIHome.jsx`) that is already doing exactly what the roadmap asks of "HESTIA AI."

The gap is **not the brain — it is the role-based product shell and the execution loop**. The roadmap describes a 4-role operating system organized around an **Active Bar Programme** that flows into **Prep Library, Recipe Book, Training Gantt**, fed by **Manual Tabit Upload** and **End-of-Day → Last Service Summary**. Today the app is an **8-role dashboard suite** where the owner lands on a *dashboard* (`OperationalPulse`), not the chat; the manager loop is half-wired; and Prep Library, Recipe Book, Training Gantt, Tabit Upload, Decision Center, and the Active Bar Programme object **do not exist at all**.

The single most important misalignment: **the owner's default landing page is a dashboard, and the owner role can reach almost every module in the app.** The roadmap's first rule ("the chat is the owner's home; owner sees only HESTIA AI / Owner Reports / Decision Center / Venue DNA") is violated by current navigation — even though the chat-first component to satisfy it already exists and is wired.

Honest recommendation (detailed in §10–§13): **do not build the big new modules first.** The highest-leverage, lowest-risk first phase is a **navigation/role re-skin** that makes the owner land on the existing `OwnerAIHome` chat and hides the dashboard sprawl — zero new data models, fully reversible. Build Decision Center and Owner Reports next as **read-only aggregations of data that already exists.** Defer Prep Library, Recipe Book, Training Gantt, and Tabit Upload until a shared data model (the Active Bar Programme object) is designed, because those are the items most likely to introduce fake data or schema churn if rushed.

---

## 2. Current Codebase Reality

**Roles in code (8):** `employee, manager, bar_manager, fb_director, events_manager, chef, owner, admin` (`src/config/roleConfig.js`).
**Roles in roadmap (4 + admin):** Owner, Manager, Bar Manager, Employee/Bartender. → `fb_director`, `events_manager`, `chef` have no place in the roadmap MVP framing (kept as secondary modules per Confirmed Decision 1).

**Navigation:** declarative, driven by `src/config/navigationConfig.js` (`NAV_GROUPS` + `PAGE_META`) and `MODULE_ACCESS_RULES` in `src/config/roleConfig.js`. This is a genuine strength — role-based nav is **already a config-only change**, no rewrite needed.

**Rendering:** `PageRenderer` is **inline inside `src/App.jsx`** (App.jsx is now **525 lines**, not the "352, composition-only" that `CLAUDE.md` claims — documentation has drifted).

**Owner default landing:** `firstAllowedPage(owner)` resolves through `NAV_GROUPS.command` → **`operationalPulse`** (a dashboard), not `ownerHome`. The chat-first surface exists but is **not** the default.

**The chat-first owner home already exists and is correct:** `src/features/owner-intelligence/OwnerAIHome.jsx` is wired to the real Venue Intelligence hook, is honest about "working signals vs confirmed DNA," fabricates nothing, and degrades gracefully. This is the roadmap's "HESTIA AI" — already built.

**Genuinely real and persisted:** Venue Intelligence chat + DNA, `venueBridge` briefs, CI/Omer generation, `cocktail_sales` (manual entry), Decision Ledger (`fb_decisions`), Venue Intelligence candidates, menu-intelligence snapshot, End-of-Day reports, shifts/handover, academy/courses, employee shift scheduling.

**Does not exist (grep-confirmed; no routes, no components):** Prep Library, Prep Planning Lite, Recipe Book (as a role-scoped object), Training Gantt, Tabit Upload, Decision Center, Active Bar Programme object/status model. The only `BarProgramme.jsx` in the tree is **event-specific** (`src/features/events/components/BarProgramme.jsx`) and unrelated.

---

## 3. Roadmap Alignment Table

| Roadmap Area | Current Code Status | Action | Risk | Notes |
|---|---|---|---|---|
| **HESTIA AI** (owner chat home) | **Exists & wired** — `OwnerAIHome.jsx` + `useVenueIntelligenceState` + `/api/venue-intelligence/message` | **Reuse** + make default landing | Low | Already honest, chat-first. Just isn't the default page. |
| **Owner Reports** (Bar Signals / Staff Perf / Last Service Summary) | **Partial, scattered** — `OperationalPulse`, `StaffProgression`, EOD archive, `menu-intelligence` | **Build (aggregate)** from existing data | Med | No consolidated surface; pieces exist as separate dashboards. |
| **Decision Center** | **Does not exist** as a page; substrate exists (`fb_decisions`, `venue_intelligence_candidates`, `/candidates/:id/review`) | **Build (thin)** over existing tables | Med | Approval substrate is real; only the owner-facing hub is missing. |
| **Venue DNA** (depth layer) | **Partial** — `VenueIntelligence.jsx` (learning) + `VenueBridgeInspector` + candidates route | **Reuse + reshape** into read/confirm depth view | Med | DNA versions/pivot history not surfaced; confirm-flow is candidate-review only. |
| **AI Bar Intelligence** (engine) | **Exists** — CI/Omer path (`/api/ci/generate`, `fnbDirectorBriefService`, `/api/ci/director/chat`) | **Reuse** | Med | Two engines (CI/Omer + Cocktail Lab) — convergence already mandated by master plan. |
| **Active Bar Programme** (object + status model) | **Does not exist** — closest is `cocktail_menus` + approve/publish | **Build (new model)** | **High** | Keystone object; status lifecycle (Draft→Approved→Training→Active→Archived) is absent. |
| **Prep Library** (Bar Manager) | **Does not exist** | **Build (new)** | **High** | New tables (prep recipes, batches, mark-prepared). Highest fake-data risk. |
| **Recipe Book** (Bartender) | **Partial** — `CocktailLibrary`, `EmployeeCocktailMenu`, `ApprovedCocktailsTraining` | **Reshape/merge** | Med | Reference data exists; not a role-scoped recipe-book with prep links. |
| **Training Gantt** | **Does not exist**; substrate: `staff_progress`, `assignedTasks`, `academyContextService` | **Build (new)** | **High** | Needs assignment+validation model; do not conflate completion with capability. |
| **Manager Workspace** | **Partial/broken nav** — `PreShiftBriefing`, `EndOfDayReports`, `ActionBoard` exist; manager can't reach pre-shift via nav | **Rewire + reuse** | Med | `operations` NAV_GROUP excludes manager though pages allow it (bug). |
| **Bar Manager Workspace** | **Wrong shape** — today: R&D studio (`cocktailLab`, cost tables, reports) | **Rebuild around execution** | **High** | Bar Brief, Prep, Training, Shift Tasks all missing. |
| **Employee / Bartender Workspace** | **Partial, fragmented** — `EmployeeHome`, `DailyWork`, `BarWorld`, `MyShifts`, academy | **Consolidate** into My Shift | Med | "My Shift" as unified hub doesn't exist; pieces do. |
| **Manual Tabit Upload** (Item/Employee/Voids) | **Does not exist** — only manual single-row `ci/sales` + daily-close | **Build (new)** | **High** | Parsing/evidence-binding; highest "invent missing fields" risk. |
| **End Of Day Report** | **Exists** — `EndOfDayReports.jsx` + `/api/shift-reports` + archive | **Reuse** | Low | Solid. Feeds carry-forward + actions already. |
| **Last Service Summary** | **Partial** — EOD archive exists; no AI-generated owner summary surfaced into HESTIA AI | **Build (thin)** | Med | Generate from EOD; surface in Owner Reports / chat. |
| **Venue Memory** | **Partial, real** — `business_memory`, `venue_intelligence`, candidates, ledger | **Reuse + formalize** | Med | Storage exists; "save everything / surface what matters" not yet a unified concept. |
| **Evidence Lifecycle (MVP)** | **Partial** — Decision Ledger + candidates + confidence/provenance discipline | **Reuse + extend** | Med | MVP subset already implemented per master plan Phases 2–8F. |

---

## 4. Role-Based Navigation Gap Analysis

**Owner** — current `MODULE_ACCESS_RULES.owner` = `command, planning, ownerIntelligence, system, cocktailIntelligence, venueIntelligence, staffArea, chefApproval, cocktailsMagazineArea`.
- Roadmap: **HESTIA AI, Owner Reports, Decision Center, Venue DNA** only.
- **Gap:** owner reaches ~9 module groups including CI dashboard, staff tab, chef approval, magazine. **Far too broad.** Lands on `OperationalPulse` (dashboard) instead of the chat. Owner Reports and Decision Center don't exist as destinations.

**Manager** — current = `dailyOps (endOfDay, ciDashboard), cocktailIntelligence, cocktailsMagazineArea`.
- Roadmap: **Pre-Shift Brief, Open From Last Shift, Voids/Cancellations, End Of Day**.
- **Gap:** Manager **cannot navigate to Pre-Shift Brief** — `PAGE_META.preShiftBriefing.roles` includes `manager`, but `NAV_GROUPS.operations.roles` is `['owner','admin']`, so the page is unreachable for managers (latent inconsistency). Open-From-Last-Shift and Voids/Cancellations don't exist as discrete surfaces. Manager currently gets a CI dashboard (a free-ish F&B surface the roadmap says managers should **not** have).

**Bar Manager** — current = `barManagement, cocktailIntelligence, shiftOrganizer, staffArea, cocktailsMagazineArea`.
- Roadmap: **Bar Brief, Prep Library, Training Gantt, Recipe Book, Shift Tasks**.
- **Gap:** Almost total. Today's bar manager is an **R&D/menu-design persona**; the roadmap's is an **execution/assignment persona**. None of the five roadmap surfaces exist.

**Employee/Bartender** — current = `employeeWorkflow, academy, employeeShifts, cocktailsMagazineArea`.
- Roadmap: **My Shift, Recipe Book, Academy**.
- **Gap:** Employee has *extra* surfaces (achievements, requests, service recovery, daily work, bar world). No unified **My Shift** (tasks + recipe book + academy + pre-shift notes). Recipe Book as a bartender object doesn't exist (only library/menu views).

**Roles with no roadmap home:** `fb_director`, `events_manager`, `chef`. Per Confirmed Decision 1, these are **kept as secondary modules** — preserved and functional, exposed outside the primary 4-role nav narrative.

---

## 5. Existing Components / Routes / Services Mapping

| Roadmap surface | Reusable existing assets |
|---|---|
| **HESTIA AI** | `OwnerAIHome.jsx`; `useVenueIntelligenceState`; routes `/api/venue-intelligence`, `/message`, `/completeness`, `/reset`; `/api/ci/director/chat` (server F&B chat) |
| **Owner Reports** | `OperationalPulse.jsx` (Bar Signals seed); `StaffProgression.jsx` (Staff Perf seed); `EndOfDayReports.jsx` + `/api/shift-reports` (Last Service Summary seed); `/api/ci/menu-intelligence`; `/api/owner/pulse`,`/trends`,`/insights` |
| **Decision Center** | `decisionLedgerService.js` + `/api/ci/decisions`; `fnbVenueFeedbackService.js` + `/api/venue-intelligence/candidates/:id/review`; `BudgetApprovals`, `OwnerOperationalRequests` (approval-UI patterns) |
| **Venue DNA** | `VenueIntelligence.jsx`, `VenueBridgeInspector.jsx`, `venueDnaModel.js`; `mergeVenueDna`; `venue_intelligence` / `venue_briefs` / `venue_dna_enrichment` tables |
| **AI Bar Intelligence** | `/api/ci/generate`, `buildGenerationPrompt`, `fnbDirectorBriefService.js`, `omerContextService.js`, `beverageContextService.js`; `CocktailIntelligenceDashboard` |
| **Active Bar Programme** | `cocktail_menus` + `cocktails` + `/api/ci/menus*` (publish/visible/archive) — partial substrate to extend, **not** a programme object yet |
| **Prep Library** | `src/domain/hospitality/bar/*` (schemas, costing) for *content*; no runtime/persistence — must build |
| **Recipe Book** | `CocktailLibrary.jsx`, `EmployeeCocktailMenu.jsx`, `ApprovedCocktailsTraining.jsx`, `CocktailBuildExperience.jsx` |
| **Training Gantt** | `staff_progress`, `assignedTasks` (useOperationsState), `academyContextService.js`, `StaffProgression.jsx` |
| **Manager Workspace** | `PreShiftBriefing.jsx`, `EndOfDayReports.jsx`, `ActionBoard.jsx`, `OperationalNotes.jsx`, `useShiftState`, `useShiftBrainState` |
| **Bar Manager Workspace** | `ShiftOrganizer.jsx`, `assignedTasks`; (Prep/Training/Bar-Brief to build) |
| **Employee Workspace** | `EmployeeHome.jsx`, `DailyWork.jsx`, `MyShifts.jsx`, `BarWorld.jsx`, academy suite |
| **Tabit Upload** | nothing direct; `/api/ci/sales`, `cocktail_sales`, `DailyClose.jsx` are the manual-entry cousins |
| **End Of Day / Last Service Summary** | `EndOfDayReports.jsx`, `/api/shift-reports`, `archiveEndOfDayReport` (App.jsx), `reportService.js` |
| **Venue Memory** | `business_memory`, `venue_intelligence`, `venue_intelligence_candidates`, `fb_decisions`, `useReportsState` |
| **Evidence Lifecycle** | `decisionLedgerService.js`, `fnbVenueFeedbackService.js`, candidate review route, provenance/confidence fields |

---

## 6. MVP Missing Pieces

1. **Owner default = chat** (config change; component already exists).
2. **Owner Reports** consolidated surface (Bar Signals + Staff Performance & Learning + Last Service Summary).
3. **Decision Center** owner hub (≤3 important decisions + "view all"), reading ledger/candidates/approvals.
4. **Venue DNA depth view** (current brief, readiness, missing fields, confirmed fields, versions/pivot history, candidate confirmation).
5. **Active Bar Programme object** + status lifecycle (Draft→Owner Approved→Ready for Training→Active→Archived/Hidden) with **archive-not-delete**.
6. **Prep Library** (Prep Planning Lite, Mark Prepared with batch/shelf-life/expiry, assign prep task) — Bar Manager only.
7. **Recipe Book** (bartender-scoped: cocktail recipes + linked prep + method/glass/ice/garnish + one-line guest explanation).
8. **Training Gantt** (HESTIA identifies → Bar Manager/Manager assigns → employee executes → status/validation tracked).
9. **Manual Tabit Upload** (Item Sales, Employee Sales, Discounts/Voids/Cancellations) with evidence-binding, no invented fields.
10. **Last Service Summary** generated from EOD and surfaced in Owner Reports / HESTIA AI.
11. **Manager surfaces:** Open From Last Shift, Voids/Cancellations (as discrete views) + fix Pre-Shift Brief reachability.
12. **Bar Manager surfaces:** Today's Bar Brief, Shift Execution Tasks.
13. **Unified Employee "My Shift"** hub.
14. **Engine convergence** (CI/Omer canonical; Cocktail Lab a studio over the same brain) — already mandated, not yet done.

---

## 7. TBA / Future Items That Must Not Be Built Now

Per roadmap §20 and guardrails — **do not implement**:
- Review Intelligence Agent / Google Reviews integration
- Prep **Gantt** Intelligence (forecasting) — build **Prep Planning Lite** only
- Live Service Intelligence (real-time shift management)
- WhatsApp notifications
- Full POS API integration (Tabit is **manual upload** only)
- Payments / Revenue Report (Tabit MVP excludes it)
- Autonomous Venue DNA updates / DNA mutation without owner confirmation
- Full financial P&L intelligence
- A third cocktail engine
- Graph DB / GraphRAG (SQLite+JSON envelope suffices)

Already-correct guardrails in code to preserve: `ENABLE_FNB_VENUE_FEEDBACK_CANDIDATES` default-off, candidate-only writes, owner/admin-gated candidate review, hidden `ExecutiveOverview/BusinessMRI/ProfitLeaks/StrategicRecommendations` (hardcoded-estimate surfaces).

---

## 8. Technical Risks

1. **Schema churn from premature objects.** Active Bar Programme, Prep, Training, Tabit each imply new tables. `node:sqlite` has **no `db.transaction()`** — multi-statement migrations need manual idempotent `CREATE/ALTER IF NOT EXISTS` in try/catch. Rushing four new models invites init failures and cross-venue leakage.
2. **Venue scoping.** Every new table must carry `venue_id` and route through `req.venueId`. Note the existing quirk: `cocktails` carry no `venue_id` (scoped via `menu_id → cocktail_menus.venue_id`). New objects must not repeat that indirection accidentally.
3. **Engine fragmentation.** Two cocktail engines still live. Building "Build Bar Programme" on the wrong one (Cocktail Lab, not venue-aware) would deepen the split.
4. **App.jsx / PageRenderer drift.** PageRenderer is inline (525 lines) despite `CLAUDE.md`'s "352, separate" contract. Adding 4 role workspaces inline will make App.jsx unmaintainable — extract first.
5. **Nav/role inconsistency already present** (`operations` group excludes manager though pages allow it). New role-based nav must be derived from one source of truth, not two diverging ones.
6. **Tabit parsing** — file formats vary; "do not invent missing fields" must be enforced at the parser, with explicit "missing report" states.
7. **Documentation/identifier drift** — per `CLAUDE.md`, `hospia.*` localStorage keys and `X-HOSPIA-Role` header may still exist and require simultaneous frontend/backend migration; folder is still `HOSPIA_LOCAL_APP`. Verify before touching.

---

## 9. Product Risks

1. **Owner over-exposure.** Today's owner sees CI dashboards, staff tabs, chef approval, magazine — the opposite of "chat-first, depth on demand." Re-skinning must **hide**, not delete, these.
2. **Role confusion from the Bar Manager pivot.** Moving the bar manager from "R&D studio" to "execution/prep/training" changes their whole mental model. If both shapes coexist, it's incoherent.
3. **Empty-state credibility.** Prep Library, Training Gantt, Owner Reports, Tabit insights will be **empty for new venues**. Without disciplined empty states ("NO PREP FOR TODAY", "no report → no claim"), the product looks broken or, worse, tempts fake seed data.
4. **Completion ≠ capability.** Training Gantt + Academy Intelligence must not present lesson completion as proven skill.
5. **"One report is a trend" temptation.** Tabit insights from a single upload must be labeled early-signal.
6. **`fb_director`/`events_manager`/`chef` orphan roles** create UX inconsistency against the 4-role story — mitigated by Confirmed Decision 1 (kept as secondary modules, off the primary nav narrative).

---

## 10. Claude Reflection — Risks, Rejections, and Recommended Changes

**Honest engineering and product judgment, not a checklist.**

**1. What's strong and worth preserving exactly.**
- **Chat-as-owner-home.** The right product bet, and the implementation (`OwnerAIHome`) is already honest and non-fabricating. Keep it verbatim; promote it to default.
- **Evidence discipline** — candidate vs confirmed, no-fabrication, owner-gated DNA, provenance/confidence. This is the product's actual moat and it's already in code. Preserve religiously.
- **Archive-not-delete**, **"no evidence → no confident claim"**, **manual-Tabit-only**. All correct and disciplined.
- **Role-based nav via config.** The architecture to do this cleanly already exists.

**2. What may not work well in practice.**
- **The 4-role collapse is cleaner on paper than in code.** The app has 8 roles with real users/permissions/routes. Pretending `fb_director`/`events_manager`/`chef` don't exist would break working flows. Resolved by Confirmed Decision 1 (keep as secondary modules).
- **"Build Bar Programme" as one action** producing menu + recipes + prep + pricing + training + prep-planning is a huge atomic deliverable. In practice it will either be shallow everywhere or take months. It needs decomposition.
- **Owner Reports "combines reporting layers"** — good intent, but the underlying data (Bar Signals from Tabit, Staff Performance) largely doesn't exist yet, so v1 will be mostly empty.

**3. Ideas I'd reject, postpone, or simplify.**
- **Postpone Prep Library, Training Gantt, Tabit Upload** until the Active Bar Programme data model is designed. They all hang off it; building them first creates orphan schemas.
- **Simplify "Build Bar Programme"** to "generate Guest Menu + Recipe Book content" first (reusing CI/Omer), with prep/training/pricing as later additive layers on the same programme object.
- **Reject any near-term rebuild of the Bar Manager workspace from scratch.** Reshape nav and add surfaces incrementally; don't delete the R&D studio until its replacement is real.

**4. Ideas that could hurt the existing codebase if implemented too aggressively.**
- A wholesale **navigation rewrite** that discards `MODULE_ACCESS_RULES`/`PAGE_META` instead of editing them.
- **Adding role workspaces inline in App.jsx/PageRenderer** — already over the documented size budget.
- **Forcing the 4-role model by deleting roles** — would break events/chef/CI flows real users depend on.

**5. Highest regression risk.**
- Touching **`/api/ci/generate`** or the **25-field Cocktail Lab contract** while wiring "Build Bar Programme."
- **New migrations** (no `db.transaction()`).
- **Re-pointing the owner landing** if done by changing `firstAllowedPage` logic globally rather than reordering the owner's own nav.

**6. Highest product-confusion risk.**
- Bar Manager persona shift (studio → execution).
- Two parallel "cocktail menu" concepts (CI menus, Cocktail Lab drafts, *and* a new Active Bar Programme) unless explicitly unified.

**7. Highest overengineering risk.**
- **Training Gantt** as a full assignment/validation engine before any training need is being generated.
- **Evidence Lifecycle** beyond the MVP subset (the roadmap itself warns against the full research model).
- A generic "Venue Memory" abstraction layer when SQLite+JSON already serves.

**8. Strategically right but technically premature.**
- Active Bar Programme **status lifecycle** (right keystone) — premature to wire UI before the object/persistence is designed.
- Academy **Intelligence** (learning↔performance) — right, but needs Tabit + training data first.

**9. Should wait for stronger data models.**
- Prep Library, Training Gantt, Tabit insights, Last Service Summary analytics, Bar Signals — all depend on the Active Bar Programme object and/or Tabit ingestion existing first.

**10. Reuse rather than rebuild.**
- `OwnerAIHome` (HESTIA AI), Venue Intelligence chat/DNA, CI/Omer engine, Decision Ledger, candidate review, EOD reports, shift state, academy, employee shifts, navigation config.

**11. Deprecate / hide / merge.**
- Hide from owner: `OperationalPulse` as *home* (keep as a report), CI dashboard, staff tab, chef approval, magazine.
- Keep hidden: `ExecutiveOverview`, `BusinessMRI`, `ProfitLeaks`, `StrategicRecommendations` (hardcoded estimates).
- Converge: Cocktail Lab → studio over CI/Omer (per master plan).
- Events/chef/`fb_director` — kept as secondary modules (Confirmed Decision 1), not folded or deleted.

**12. What I'd do differently.**
- Sequence by **data-model readiness**, not by roadmap chapter order. Ship **shell + read-only aggregation first** (no new tables), design the **Active Bar Programme object** as the next keystone, then layer Prep/Recipe/Training/Tabit onto it.
- **Extract PageRenderer** and introduce a per-role workspace shell before adding any workspace.
- Treat the **4-role model as a UI-layer narrative**, not a destructive role purge.

**13. Recommended sequence** — see §11.

**14. Smallest safe first phase** — see §12.

**15. Most important guardrails before any implementation.**
- Additive, venue-scoped, flag-gated, byte-identical-when-off; idempotent migrations in try/catch (no `db.transaction()`).
- No new table without `venue_id` + `req.venueId` enforcement + a deterministic test.
- Never break the 25-field contract or `/api/ci/generate`.
- No fake/seed data; explicit empty states; candidate-only DNA writes; owner-confirmed DNA only.
- Archive-not-delete for any menu/programme.
- One engine — no third cocktail engine.
- Extract/refactor App.jsx before adding workspaces.

---

## 11. Recommended Safe Implementation Phases

- **Phase A — Role-based navigation re-skin (config + shell only, no new data).** Reorder owner nav so **HESTIA AI is the default**; hide owner dashboard sprawl; fix manager Pre-Shift reachability; align nav groups to the 4-role narrative (keeping admin/events/chef behind a secondary tier per Confirmed Decision 1). Extract `PageRenderer` out of App.jsx. *Fully reversible; zero schema.*
- **Phase B — Owner depth layers as read-only aggregations.** **Owner Reports** (compose existing pulse + staff progression + EOD/Last Service Summary) and **Decision Center** (read `fb_decisions` + candidates + approvals). **Venue DNA** depth view over existing DNA/candidates. *No new write models.*
- **Phase C — Active Bar Programme object (design → write-only).** Define the programme entity + status lifecycle as an extension of `cocktail_menus`; archive-not-delete. Wire "Build Bar Programme" to the **canonical CI/Omer engine** producing Guest Menu + Recipe Book content first.
- **Phase D — Recipe Book (bartender) + Manager/Bar-Manager/Employee workspace surfaces** built on Phase C data (Bar Brief, Shift Tasks, My Shift, Open-From-Last-Shift, Voids).
- **Phase E — Prep Library (Prep Planning Lite only)** hung off the programme object.
- **Phase F — Manual Tabit Upload** (Item Sales, Employee Sales, Voids) → Venue Memory evidence; then **Last Service Summary** analytics and **Training Gantt** (needs ≥ Phases C–F data).
- **Engine convergence** runs in parallel as already specified by the master plan (CI canonical; Lab as studio).

Ordering principle: **shell → read-only depth → keystone object → execution surfaces → prep → evidence ingestion → intelligence on top.**

---

## 12. Phase 1 — Smallest Safe First Step

**Scope:** Navigation/role re-skin + PageRenderer extraction. **No backend, no schema, no new feature data.** (Confirmed Decision 2.)

1. **Make the owner land on HESTIA AI.** Reorder the owner's nav so `ownerHome` (`OwnerAIHome`) is the first allowed page (adjust the owner's `command` group ordering / `MODULE_ACCESS_RULES`, not global `firstAllowedPage` logic). `OperationalPulse` stays reachable as a report.
2. **Slim the owner nav** toward HESTIA AI / Owner Reports (placeholder → existing pulse) / Decision Center (placeholder) / Venue DNA (existing `venueLearning`). Hide CI dashboard, staff tab, chef approval, magazine **from the owner role only** — they remain reachable by their owning roles (Confirmed Decision 1).
3. **Fix the manager Pre-Shift inconsistency** so the existing `PreShiftBriefing` is reachable by managers.
4. **Extract `PageRenderer`** from App.jsx into its own module (pure move, no behavior change) to unblock later workspace additions and re-true the `CLAUDE.md` composition-only contract.
5. **Verify:** `npm run build`, `npm run hestia:check`, manual login per role; confirm no route/data change; confirm hidden modules still reachable by their owning roles.

**Why this first:** it delivers the roadmap's most-violated rule (chat-first owner) and the role-based-nav requirement **using only components that already exist**, with no data-model risk and trivial rollback (revert config + one file move). It also creates the structural seam (extracted PageRenderer, slimmed owner nav, placeholder destinations) that every later phase plugs into.

**Not touched in Phase 1:** any schema, any backend route, the 25-field contract, `/api/ci/generate`, the cocktail engines, or the Active Bar Programme model.

**Companion cleanups to fold into the same change (docs only, no behavior):**
- Update `CLAUDE.md`'s App.jsx description (currently "352 lines, composition-only, separate PageRenderer") to match reality once PageRenderer is extracted.
- Note (do not act on) the `hospia.*` / `X-HOSPIA-Role` identifier migration risk before any future auth/header work.

---

## 13. Final Recommendation

**The roadmap is directionally right and the brain is largely built; the missing 80% is the role-based product shell and the execution data model — not intelligence.** Resist building Prep Library, Training Gantt, Tabit Upload, or a monolithic "Build Bar Programme" first. Those are the items most likely to introduce fake data, schema churn, and role confusion.

**Start with the re-skin (Phase 1 / §12): make HESTIA AI the owner's home and enforce role-based navigation using existing components.** Then add Owner Reports and Decision Center as **read-only aggregations of data that already exists.** Only then design the **Active Bar Programme object** as the keystone, and layer Recipe Book → Prep Planning Lite → Tabit → Training Gantt onto it in evidence-readiness order.

**Status:** Phase 1 implementation is **not** to begin until the owner reviews this document and explicitly approves it.

---

*End of audit. Analysis only — no product code, routes, schemas, navigation, or components were changed in producing this document.*
