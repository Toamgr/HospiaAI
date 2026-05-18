# HESTIA — Strategic Audit and Next Build Phase

**Document type:** Implementation-oriented strategy audit
**Audience:** Founder (Toam Griffel) + Claude Code as build agent
**Investor target stage:** Pre-seed / angel — one live venue
**Date:** 2026-05-17
**Companion document:** `HESTIA_AUDIT_AND_NEXT_PHASE.docx` (executive version)
**Project root:** `HOSPIA_LOCAL_APP/`

---

## 0. How to read this document

This audit was written after reading the following project documents in full:

- `docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md`
- `docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md`
- `docs/architecture/HESTIA_PHASE_2_CHECKPOINT.md`
- `docs/architecture/HESTIA_SHIFT_BRAIN_V1.md`
- `docs/architecture/HESTIA_BAR_PRODUCT_FOUNDATION.md`
- `docs/architecture/HESTIA_COCKTAIL_LAB_EXPERIENCE_CHECKPOINT.md`
- `CLAUDE.md`

And after surveying the codebase: 10 hooks in `src/hooks/`, 53 feature components in `src/features/`, 13 services in `src/services/`, the deterministic `shiftBrainService.js`, the SQLite-backed Express backend in `server.js`, and the seed data files in `src/data/`.

Every recommendation in this document is anchored to a file path that exists or to a concept defined in one of the strategy documents above. Nothing here is invented. Where I am inferring an assumption I will mark it explicitly.

---

## 1. Executive Summary

HESTIA today is two products held together by a clean hook-based architecture: (a) a serious operational intelligence engine — Shift Brain, the deterministic costing layer, the hospitality ontology, the SQLite event-backed API — and (b) a wide surface of owner-facing pages and seeded sample content that is currently dragging the product toward the "dashboard wrapper" trap the strategy document explicitly warns against.

The strongest parts of HESTIA are not the screens. They are: `src/services/shiftBrainService.js` (pure deterministic intelligence with a clean service/hook/component boundary), `src/domain/hospitality/bar/cocktailLabPricingAdapter.js` and `src/domain/hospitality/bar/barCalculationUtils.js` (costing-honest math with confidence levels and source-of-truth rules), the hospitality ontology in `src/domain/hospitality/`, and `server.js` (real SQLite, real role-aware endpoints, real audit log for verified price overrides).

The weakest parts are: hardcoded staff names and progress scores in `src/data/staff.js`, fabricated monthly profit-leak dollar amounts in `src/data/businessMemory.js`, a hardcoded "184 expected covers / 4 VIPs" in `INITIAL_SHIFT_PROFILE`, and an owner area with eleven separate pages (`CommandCenter`, `WeeklySummary`, `ExecutiveOverview`, `BusinessMRI`, `ProfitLeaks`, `OwnerReport`, `BusinessMemoryPage`, `StrategicRecommendations`, `OperationalPulse`, `BudgetApprovals`, `OwnerOperationalRequests`) — far more owner UI than a pre-seed venue needs and exactly the dashboard-overload pattern the strategy document treats as a failure mode.

The next build phase has to do three things in this exact order:

1. **Purge or hide the fake-data surfaces.** A pre-seed investor walking through HESTIA on a real venue's data must never see "Noa B., Senior Server, 95% progress" rendered next to a number the venue did not supply. Until the seed staff and seed profit-leak numbers are removed from runtime, demo trust is at risk on the first click.
2. **Cut the owner surface to one page** that is `shiftBrain`-driven (`OperationalPulse` already exists for this — make it the owner home) and freeze the rest behind a feature flag.
3. **Turn the manager loop into one closed daily cycle** — pre-shift → live incident capture → end-of-shift summary → carry-forward → next pre-shift — backed by the SQLite event store (`server.js` already has `incidents`, `actions`, `business-memory`, `event-plans`, `shift-reports`). The Shift Brain service is ready. The remaining work is wiring writes through the API rather than localStorage and adding an end-of-shift summary surface that uses the deterministic snapshot.

If those three things land, HESTIA at one live venue becomes a demonstrable product. Everything else (predictive ordering, multi-site, guest memory, autonomous routing) is V2/V3 and should be visible on the roadmap but unbuilt.

---

## 2. Product Positioning

### What HESTIA is becoming, grounded in the code

HESTIA today is a **role-aware, mobile-first operational loop for a single bar-led venue**, with a deterministic intelligence service that turns a venue's daily exceptions (actions, incidents, events, owner notes) into a pre-shift briefing, a manager checklist, and an operational status banner. The Shift Brain service in `src/services/shiftBrainService.js` is the product's first true non-dashboard surface: it does not summarize what happened, it tells the operator what to do next, with sources and confidence.

Around Shift Brain, the codebase has begun to build the rest of the strategic vision:

- **Cocktail Lab + Build Guide** (`src/features/bar/CocktailLabStudio.jsx`, `src/features/bar/CocktailBuildExperience.jsx`, backed by `src/domain/hospitality/bar/cocktailLabPricingAdapter.js`) — costing-honest pricing with confidence dots, traffic-light gating, and a no-API interactive build sequence.
- **Bar Product Foundation** (`src/domain/hospitality/bar/`) — schemas, supplier candidate references, calculation utilities, and a DB-migration map. Dormant by design — specification only.
- **Hospitality Ontology** (`src/domain/hospitality/`) — entities, decisions, memory candidates, event types, agent candidates, operational loops. Dormant by design.
- **Real backend** (`server.js` + `data/hospia.sqlite`) — SQLite with tables for venues, users, shift_reports, business_memory, actions, incidents, notes, event_plans, verified_price_overrides, and an audit log for the verified-price flow.

### Product positioning statement

HESTIA is not a POS, not a CRM, not a BI dashboard, not a chatbot. It is the **operational control plane for a hospitality manager**: the place the next shift is briefed from, exceptions are captured in one tap, and unresolved items are forced to inherit forward. The wedge from `HOSPIA_STRATEGY_FOUNDATION.md` (independent cocktail bars and bar-program restaurants, 1–10 locations) is correct and matches Toam's own operating context as a high-level bartender and consultant. That alignment is the single most defensible thing about the founder narrative.

### Where positioning is currently leaking

- The owner area, at 11 pages, currently signals "BI dashboard." The strategy doc says explicitly: *do not build a home screen of everything*. We have built one.
- The `BusinessMRI`, `ExecutiveOverview`, `StrategicRecommendations`, and `ProfitLeaks` pages are positioned as analytics. Without a real data stream behind them, they read as vanity.
- The Cocktail Lab is excellent on its own terms, but in a manager-first product it should sit one level down from Shift Brain, not on the home screen.

The fix is a positioning decision, not a code rewrite: **Shift Brain is the home. The bar program is a tool. The owner gets a status page, not a dashboard.**

---

## 3. MVP Scope (pre-seed, one live venue)

The MVP is defined by what the manager and owner of one venue use in a single day, end-to-end. Anything outside that loop is V2.

### 3.1 The daily loop the MVP must close

```
[Pre-shift]  → manager opens HESTIA on phone
             → sees Shift Brain pre-shift briefing
             → acknowledges briefable items, taps Start Shift

[Live]       → staff/manager log incidents in one tap
             → manager adjusts actions
             → optional shift notes captured

[Close]      → manager opens End-of-Shift Review
             → confirms summary, marks open items as carry-forward
             → archive report posts to /api/shift-reports

[Carry-fwd]  → next pre-shift briefing inherits unresolved items
             → cycle continues
```

Every component in this loop already exists in code except a proper End-of-Shift Review that consumes the deterministic Shift Brain snapshot and writes back to `business_memory` and `shift_reports`. That is the single highest-leverage build.

### 3.2 MVP feature list — must ship

| Area | Surface | Backing | Status |
|---|---|---|---|
| Auth | `LoginScreen` with real password-backed user records | `server.js` users table + `/api/session/login` (currently uses `ACCESS_CODES` literal — see Risks) | Needs hardening |
| Pre-shift briefing | `PreShiftBriefing.jsx` | `shiftBrainService.js` + injected operational data | Ready; minor wiring |
| Live incident capture | `ServiceRecovery.jsx` (employee) + `ManagerActionCenter.jsx` | `/api/incidents` exists | Needs one-tap mobile flow |
| Action board | `ActionBoard.jsx` | `/api/actions` exists | Wire writes to API, not just localStorage |
| Operational notes | `OperationalNotes.jsx` | `/api/notes` exists | Wire writes to API |
| End-of-Shift Review | `EndOfShiftReview.jsx` already exists | Needs to consume `shiftBrain` snapshot + write to `/api/shift-reports` | Significant build (see Phase 3 below) |
| Owner home | `OperationalPulse.jsx` already exists | Receives `shiftBrain` already in `notifications` group | Promote to default owner landing |
| Cocktail Lab (costing) | `CocktailLabStudio.jsx` + `cocktailLabPricingAdapter.js` | Local, no API needed for MVP | Already production-quality |
| Verified Price Overrides | `VerifiedPriceEntryPanel.jsx` + `/api/verified-price-overrides` | Audit log exists | Keep — this is the one part of the costing flow with a real DB trail |
| User management | `UserManagement.jsx` + `/api/users` | Backend exists | Lock to owner role; remove demo access codes for live venue |

### 3.3 MVP feature list — must remove or hide from runtime

These are either fake-data surfaces or premature owner BI. They should be hidden behind a feature flag or deleted before showing the product on real venue data.

| Surface | File | Reason to remove from MVP |
|---|---|---|
| Hardcoded staff list | `src/data/staff.js` | Contains four fabricated employees with invented progress scores. CLAUDE.md's no-fake-data rule applies. Must come from `/api/users` or a venue-defined roster. |
| Profit leaks with invented dollar amounts | `src/data/businessMemory.js` `PROFIT_LEAKS` array | Six categories with specific monthly figures (`8400`, `6200`, `4800`, ...) that no real venue supplied. Surface either deletes or becomes empty-state-only until a real source exists. |
| `INITIAL_SHIFT_PROFILE` | `src/data/operations.js` | Hardcoded `expectedCovers: 184, vipReservations: 4, pressureLevel: 'High'`. The Phase 2 checkpoint already flagged this as placeholder. |
| `BusinessMRI` page | `src/features/owner/BusinessMRI.jsx` | Vanity dashboard surface. No real data feed. Hide. |
| `ExecutiveOverview` page | `src/features/owner/ExecutiveOverview.jsx` | Same. Hide. |
| `StrategicRecommendations` page | `src/features/owner/StrategicRecommendations.jsx` | Same. Hide unless backed by `shiftBrain.recommendedFocus`. |
| `ProfitLeaks` page | `src/features/owner/ProfitLeaks.jsx` | Renders the fabricated array above. Hide until a real margin source exists. |
| `WeeklySummary` page | `src/features/owner/WeeklySummary.jsx` | Acceptable later, but for MVP fold the one useful column into `OperationalPulse`. |

The argument for hiding rather than deleting: the components are well-written and align with V2/V3 vision. They should remain in the repo, gated by a feature flag (`config/featureFlags.js`), so that a real seed pilot can re-enable them when the underlying data exists.

### 3.4 Acceptance criteria for "MVP ready for one live venue"

The MVP is shippable when, with **zero seeded data**, a manager can:

1. Log in with a venue-issued credential (not `MNG123`).
2. See an empty-state Shift Brain that still produces a usable briefing (the empty-state path in `shiftBrainService.js` already does this — verified).
3. Capture an incident in one tap, see it in the pre-shift briefing of the next shift, and have it persist if they reload the browser.
4. Close a shift, generate a summary, mark items as carry-forward, and see those items in tomorrow's briefing — all via API, not localStorage.
5. The owner can open `OperationalPulse` and see the same operational status the manager sees, with the same risk signals and recommended focus.

These five behaviors are the V1 PMF foundation listed in `HOSPIA_STRATEGY_FOUNDATION.md` section 9.

---

## 4. Non-MVP — Future Vision (V2 and V3)

The strategy document's V2 and V3 specifications are correct and should be preserved in `ROADMAP.md`. I am not changing them here. What I am clarifying is **what stays behind the MVP wall** until a paying second venue exists.

### V2 — Retention and dependency (after one live venue retains for ~90 days)

- Predictive ordering surface (requires real POS + supplier integration).
- Staffing forecasts (requires real shift + sales history).
- Coaching prompts derived from repeated incidents (requires ≥30 days of incident data per staff member).
- Guest memory minimal viable surface (requires reservations integration or manual guest log).
- Service recovery playbooks tied to incident type.
- Cross-shift benchmarking within the same venue.
- Vendor issue tracking.
- Real POS integration (Toast or Square first).

### V3 — Category-defining (after two or more live venues retain)

- Operational memory graph (the entire `src/domain/hospitality/` ontology becomes runtime).
- Multi-site drift detection.
- Cross-location intelligence.
- Autonomous action routing with the trust model defined in `HOSPIA_SYSTEM_ARCHITECTURE.md` section 4.8.
- Premium guest-service context engine.
- Role-aware AI copilots (one per role, narrow scope).

### What never gets built

- Generic chatbot home screen.
- POS replacement.
- Marketplace integrations as a category.
- Configurable report builder.
- Plug-and-play multi-tenant enterprise mode before retention is proven.

---

## 5. Critical Risks

Five risks are visible in the current state of the codebase. They are ordered by severity for a pre-seed investor conversation.

### Risk 1 — Fake data on demo surfaces (HIGH)

`src/data/staff.js` renders four named employees with progress scores ("Noa B." 95%, "Dana P." 31% "At Risk"). `src/data/businessMemory.js` renders six profit-leak categories with specific monthly dollar amounts. `INITIAL_SHIFT_PROFILE` says the venue expects 184 covers tonight. None of these came from a real venue.

CLAUDE.md is explicit on this: *"Do not add fake operational records, seeded data, or placeholder metrics."* It is enforced for the hospitality ontology layer and the bar product foundation, but the rule has not been enforced on these older static data files.

If an angel investor opens the product on what they believe to be Toam's venue data and sees fabricated staff scores, the product credibility collapses faster than any single feature can rebuild it. This must be fixed in Phase 1 of the next build.

### Risk 2 — Owner dashboard sprawl (HIGH)

Eleven owner-facing components is more surface than a pre-seed product can defend. The strategy document explicitly identifies this as a failure mode: *"Avoid dashboard overload. Do not build a home screen of everything."*

The owner role at one venue needs exactly one thing: a single page that reflects current operational status, top risk signals, and the next 1–2 things to pay attention to — all sourced from `shiftBrain`. `OperationalPulse.jsx` already exists for this. The other ten owner pages should be hidden behind a feature flag for MVP.

### Risk 3 — Auth and demo access codes (MEDIUM-HIGH)

`server.js` hardcodes `ACCESS_CODES = { EMP123, MNG123, OWN123 }` and serves them through `/api/session/login`. The `X-HOSPIA-Role` header is trusted by all role-gated endpoints. This is acceptable for a developer demo but is a major trust risk if shown to a venue owner or investor without removal.

For a single live venue MVP, the user table (`server.js` lines defining `users` table) already supports per-user credentials. The migration is: remove `ACCESS_CODES`, route `/api/session/login` through the `users` table with a real password hash (bcrypt), and replace the role header with a session cookie or signed JWT. The frontend already abstracts the role header inside `useBackendSync.js` and `client.js` — five files need a coordinated edit per the Phase 2 checkpoint.

### Risk 4 — localStorage as system of record (MEDIUM)

The `hospia.*` localStorage keys still hold actionItems, businessMemory, reportArchive, eventPlans, cocktail drafts, academy progress, shift notes, and more. The backend exists but is treated as a sync target, not a system of record. Two failure modes:

- A demo on a fresh device shows an empty product even when the venue has been using it.
- Different roles on different devices see different states.

For one live venue this is tolerable, but the next investor question will be: *"Where does the data live?"* The honest answer today is "mostly in the browser." That needs to change before any retention or cross-device claim can be made.

### Risk 5 — Domain ontology is not yet a moat (LOW-MEDIUM)

`src/domain/hospitality/` and `src/domain/hospitality/bar/` are well-specified but not wired. CLAUDE.md correctly forbids premature wiring. The risk is not that the ontology is wrong — it is that the moat narrative depends on this layer becoming runtime, and there is currently no plan for when that happens. The next-phase document below schedules it for after MVP traction.

---

## 6. Feature Priorities

Priorities are organized by build phase. Phases are designed so each one is shippable independently. Detailed Claude Code prompts for each phase appear in section 10.

### Phase 1 — Demo Trust (2–4 days of focused work)

**Goal:** make the product safe to show real venue data on, by removing or gating every fake-data surface and tightening auth.

- Replace seeded `STAFF` array with API-backed staff (or empty-state rendering with explicit "Add staff" CTA).
- Remove seeded `PROFIT_LEAKS` from `BUSINESS_MEMORY` and hide `ProfitLeaks` page behind feature flag.
- Replace `INITIAL_SHIFT_PROFILE` with a load from `/api/business-memory` or render empty-state.
- Hide `BusinessMRI`, `ExecutiveOverview`, `StrategicRecommendations`, `ProfitLeaks` behind `config/featureFlags.js`.
- Remove `ACCESS_CODES` literal from `server.js`; add bcrypt password column and real login flow.
- Promote `OperationalPulse` to be the default owner landing page.

### Phase 2 — Manager Loop Closure (4–7 days)

**Goal:** make the daily shift loop end-to-end persistent through the API.

- Route action board writes through `/api/actions` (currently localStorage-first).
- Route incident writes through `/api/incidents`.
- Route operational note writes through `/api/notes`.
- Add `/api/shift-reports POST` payload that includes a Shift Brain snapshot.
- Build the full `EndOfShiftReview.jsx` flow: summary → carry-forward selection → archive → next-shift inheritance.
- Add a deterministic carry-forward function in `shiftBrainService.js` that derives next-shift inheritance from the closed shift_report.

### Phase 3 — Brand and Identifier Cleanup (1–2 days)

**Goal:** complete the HOSPIA → HESTIA migration where the Phase 2 checkpoint left off.

- Migrate `hospia.*` localStorage keys to `hestia.*` with a one-time migration function.
- Rename `X-HOSPIA-Role` to `X-HESTIA-Role` in all six files atomically.
- Rename `data/hospia.sqlite` to `data/hestia.sqlite` with file-rename migration on server boot.
- Rename `HOSPIA_LOCAL_APP/` and update package.json.
- Rename the two `HOSPIA_*.md` documents in `docs/` and update CLAUDE.md.

### Phase 4 — End-of-Shift Intelligence Upgrade (3–5 days)

**Goal:** elevate the end-of-shift summary from deterministic text to AI-assisted narrative without breaking the trust model.

- Add `summarizeShift` function to `shiftBrainService.js` that takes the deterministic snapshot and calls Gemini through the existing `/api/gemini` proxy.
- Show both: deterministic summary first, AI-generated narrative second, clearly labeled.
- Allow manager to edit before archiving.
- Store AI output with `model_version` and `confidence` per the architecture doc section 2.6.

### Phase 5 — Owner Weekly Brief (2–3 days)

**Goal:** give the owner one meaningful weekly artifact, derived from real archived shift reports.

- Extend `ownerInsightService.js` to consume the last 7 archived `shift_reports` and produce a weekly digest with: top recurring incident category, action board completion rate, unresolved items aging trend, top 2 manager-recommended focus areas from the week.
- Surface inside `OperationalPulse` (collapsible weekly card), not as a separate page.
- No fake comparisons. If 7 days of data are not available, the surface clearly says so.

### Phase 6+ — V2 vision (deferred until first venue retains)

Predictive ordering, guest memory, real POS integration, multi-site preparation. Specified in section 4 above. No code in Phase 6 until Phase 1–5 are live with one venue for at least 30 days.

---

## 7. Data Model Implications

### Current state

`server.js` defines a relational SQLite schema with the following tables (read from `server.js`):

- `venues`, `users` (relational canonical)
- `shift_reports` (functions as a partial event-log today)
- `business_memory` (functions as the memory layer)
- `actions`, `incidents`, `notes`, `event_plans` (operational)
- `verified_price_overrides` + `verified_price_audit_log` (the most architecturally correct surface in the project — it has a proper append-only audit trail and an explicit `user_confirmed_override` model)

This is a credible relational+memory foundation. What is missing is the **append-only event store** specified in `HOSPIA_SYSTEM_ARCHITECTURE.md` section 2.2. Today, when an incident is created, we know its current state, but we do not have an immutable record of *event_created → severity_set → assigned → escalated → resolved* with timestamps and actors.

### What the MVP data model needs

For one live venue, the existing tables are enough if we add three things:

1. **A real `events` append-only table** (Phase 6 candidate, not MVP-blocking) with columns: `event_id`, `event_type`, `actor_id`, `venue_id`, `timestamp`, `payload_json`, `correlation_id`, `severity`, `source_system`. Every UI write also writes one row here. This is the seed of the operational memory graph and is the V3 moat.
2. **An `audit_log` table for sensitive writes** beyond the verified-price flow — for incident resolutions, action completions, and user role changes.
3. **Indexed `created_at` on `actions`, `incidents`, `notes`** to make Shift Brain's daysOpen computation efficient when data scales beyond a few hundred rows.

### What the MVP data model does NOT need

- Multi-tenancy. One venue is one DB file. Do not introduce `tenant_id` until a second venue exists.
- Versioned tables. The architecture doc lists `recipe_versions`, `menu_item_versions`, etc. for V2+. Not now.
- A separate memory layer beyond `business_memory`. The current table is sufficient until cross-shift retrieval becomes a real product surface.

### Storage rule for next phase

> Any value that appears in the UI and is **not** derived from a user keystroke, an API response, or a deterministic function of those two **must come from the empty state**. No literal constants are allowed in `src/data/*` for runtime rendering paths.

This is a hard rule. It replaces the implicit one that allowed `STAFF` and `PROFIT_LEAKS` to ship.

---

## 8. UX Implications

The UX rules in `HOSPIA_SYSTEM_ARCHITECTURE.md` section 8 are correct. The codebase only partially follows them. Three corrections matter for the next phase.

### 8.1 Mobile-first is asserted but not enforced

The strategy doc requires one-tap incident capture, one-screen shift brief, minimal typing. The current `PreShiftBriefing` is a two-column layout designed for desktop. It needs a mobile single-column fallback before MVP — managers will use this on phones during service, not on laptops.

Per-file change: in `PreShiftBriefing.jsx`, restructure the wrapping layout to `flex flex-col md:flex-row`, and ensure the intelligence sidebar collapses to an accordion below 768px. Acceptance criteria below.

### 8.2 Exception-based, not dashboard-based

The current owner area is dashboard-based — every card is always shown. The strategy doc says: *"The user should see what changed, what matters, and what needs action now."*

For one live venue, `OperationalPulse` should render only the cards where `shiftBrain` has a non-empty signal. If risk signals are empty, do not show the empty card — show only the operational status. This is one component change.

### 8.3 The 2 AM design test

Toam, you are a bartender. The strategy doc says: *"At 2 AM, the app should not feel clever; it should feel reliable."* The current `CommandCenter` at 16KB has too many cards. Every owner-facing page that survives MVP must pass a 2 AM test: would a manager use this with one hand and tired eyes? Most of the owner pages, in their current form, would not.

### 8.4 Language

All HESTIA UI text is in English (per user preference). Where the codebase still uses transactional language ("customers", "checkout", "view report"), it should move toward hospitality language ("guests", "send to next shift", "tonight"). This is a polish pass, not blocking.

---

## 9. AI Intelligence Layer

### Today

AI in HESTIA is concentrated in two places:

- `src/services/geminiCocktailAgent.js` (1148 lines) — full cocktail proposal, revision, and consultation logic. Real Gemini calls through `/api/gemini`.
- `src/services/ownerInsightService.js` (60 lines) — owner brief generation through `/api/gemini`.

Everything else that feels intelligent is **deterministic**, including all of Shift Brain. This is the right starting point. The architecture doc explicitly says deterministic systems should not rely on AI for permission checks, severity thresholds, escalation timers, duplicate detection, etc.

### What the next phase should add — and where

The AI layer's job is *narrative generation and pattern explanation*, not decision-making. Three additions:

1. **AI-assisted shift summary** (Phase 4 above) — a `summarizeShift` function in `shiftBrainService.js` that takes the deterministic snapshot and asks Gemini to phrase it. Output must be editable by the manager before archive. Stored alongside the deterministic snapshot, not replacing it.
2. **AI-assisted incident classification** — when a one-tap incident is captured with only freeform text, Gemini classifies it into `issueType` and suggests a severity. Manager confirms or edits. Stored with `model_version` and `confidence` per the architecture doc.
3. **AI-assisted recommendation phrasing** in `shiftBrain.recommendedFocus`. Today this is a deterministic string array. Phase 4 wraps the deterministic logic with a Gemini call that produces hospitality-native phrasing using the venue's name and recent context. The deterministic strings remain as fallback.

### What the AI layer should NOT do

- Decide severity unilaterally — manager confirms.
- Mutate critical records (financial, staffing, guest) without explicit approval.
- Generate guest-facing copy without manager review.
- Replace the deterministic Shift Brain — it augments, it does not replace.

The architecture doc trust model section 4.8 is the rule: *"Users trust AI when it shows its source events, it is editable, it explains the action, and it improves over time."* Every AI surface added must satisfy all four criteria or it does not ship.

### Prompt management

`src/prompts/geminiCocktailPrompts.js` is a strong pattern — all prompts live in one place, separate from service logic. Phase 4 should add `shiftBrainPrompts.js` and `incidentClassificationPrompts.js` to the same directory rather than embedding prompts in services.

---

## 10. Exact Claude Code Implementation Prompts

Each phase below is a self-contained block that can be pasted into Claude Code. Every prompt includes: precise scope, files to touch, files to create, behavioral rules, and acceptance criteria. The prompts are written in the second person and assume Claude Code has read `CLAUDE.md`.

The prompts assume Phases run in order. Do not begin Phase 2 until Phase 1 is merged.

---

### Phase 1 — Demo Trust Hardening

```
You are working on the HESTIA codebase. Read CLAUDE.md before starting.

GOAL: remove every fake-data runtime surface and gate premature owner pages
behind a feature flag, so the product can be demonstrated on a real venue's
data without rendering fabricated content.

FILES TO MODIFY:

1. src/data/staff.js
   - Remove the STAFF array. Replace with: export const STAFF = []
   - The four named employees (Noa B., Yoav S., Oren L., Dana P.) and their
     fabricated progress/simulation/strong/weak fields must not exist in the
     bundle.

2. src/data/businessMemory.js
   - Remove the PROFIT_LEAKS array contents. Replace with:
     export const PROFIT_LEAKS = []
   - Keep ACTION_BOARD_ITEMS and BUSINESS_MEMORY as empty arrays — they are
     already empty, leave them.

3. src/data/operations.js
   - Replace INITIAL_SHIFT_PROFILE with:
     export const INITIAL_SHIFT_PROFILE = null
   - All consumers of INITIAL_SHIFT_PROFILE must null-guard. Search for usages
     and update PageRenderer's operations group accordingly.

4. CREATE src/config/featureFlags.js with:
   export const FEATURE_FLAGS = {
     ownerBusinessMRI: false,
     ownerExecutiveOverview: false,
     ownerStrategicRecommendations: false,
     ownerProfitLeaks: false,
     ownerWeeklySummary: false,   // collapsed into OperationalPulse for MVP
   }
   Export a helper isEnabled(flagName).

5. src/App.jsx (or PageRenderer)
   - Wrap the navigation registration for the five flagged owner pages so they
     are not added to roleConfig allowed pages when the flag is false.
   - The default owner landing page must become OperationalPulse, not
     CommandCenter, when ownerBusinessMRI is false.

6. src/features/staff/StaffProgression.jsx and StaffReadiness.jsx
   - Both components currently render STAFF directly. Change them to consume
     the users list from PageRenderer's session group, filtered to
     non-owner roles. If users is empty, render an empty-state with a CTA
     pointing to /system/user-management.

AUTH HARDENING (do this in the same phase):

7. server.js
   - Remove the ACCESS_CODES object literal.
   - Add a bcrypt-hashed password_hash column to the users table (migration
     in db.exec, IF NOT EXISTS guard).
   - Rewrite /api/session/login to look up by username, verify bcrypt, return
     a session token (signed JWT or a server-stored session id — pick one,
     document the choice in a comment).
   - Add /api/session/logout that invalidates the token.

8. src/hooks/useBackendSync.js, src/services/userService.js,
   src/services/ownerInsightService.js, src/services/api/client.js, App.jsx
   - Replace the trust-the-header X-HOSPIA-Role pattern with: include the
     session token in Authorization header, server derives role from the
     authenticated user record.

CONSTRAINTS:
- Do not delete BusinessMRI.jsx, ExecutiveOverview.jsx, StrategicRecommendations.jsx,
  or ProfitLeaks.jsx — keep them in the repo, just stop registering them.
- Do not invent password defaults. The first user is created via the existing
  /api/users POST endpoint by the owner role; document this in code comments.
- Run `npm run build` and ensure no console errors before completing.

ACCEPTANCE CRITERIA:
A. Loading the app with a clean localStorage and clean SQLite shows no
   hardcoded staff names, no hardcoded profit-leak dollar figures, and no
   hardcoded shift profile.
B. The owner role's default landing page is OperationalPulse.
C. The five flagged owner pages are unreachable through navigation.
D. /api/session/login with the literal "MNG123" returns 401.
E. /api/session/login with a real user's username + password returns 200 and
   a token. Subsequent requests with that token are role-gated correctly.
```

---

### Phase 2 — Manager Loop Closure (API-backed)

```
You are working on the HESTIA codebase. Phase 1 must be merged before
starting. Read CLAUDE.md and HESTIA_SHIFT_BRAIN_V1.md before starting.

GOAL: make the daily shift loop persistent through the API rather than
localStorage. The manager closes a shift; the next shift opens with the
correct carry-forward state from the server.

FILES TO MODIFY:

1. src/hooks/useOperationsState.js
   - Every setter that today writes only to localStorage must additionally
     POST to the corresponding API endpoint. Specifically:
     - addActionItem  → POST /api/actions
     - updateActionItem → PATCH /api/actions/:id (server endpoint TBD,
       add it in server.js as well)
     - addServiceIncident → POST /api/incidents
     - resolveServiceIncident → PATCH /api/incidents/:id
     - addOwnerNote → POST /api/notes
   - localStorage remains the optimistic cache. On API failure, the
     localStorage write succeeds and a retry queue (simple in-memory array)
     re-attempts on next role change.

2. src/hooks/useShiftBrainState.js
   - Add a setShiftNotes path that POSTs each note to /api/notes (server
     endpoint exists per phase 2 checkpoint).

3. src/hooks/useBackendSync.js
   - Add a one-time sync of /api/notes into shiftNotes state.
   - Add a one-time sync of /api/incidents into serviceIncidents state.

4. server.js
   - Add PATCH /api/actions/:id and PATCH /api/incidents/:id with role gates
     matching the POST endpoints. Both must write a row to a new
     events table (see below).
   - CREATE table events (
       event_id TEXT PRIMARY KEY,
       venue_id TEXT,
       actor_id TEXT,
       event_type TEXT NOT NULL,
       timestamp TEXT NOT NULL,
       payload_json TEXT,
       correlation_id TEXT,
       severity TEXT,
       source_system TEXT DEFAULT 'web'
     );
   - Every POST and PATCH to actions, incidents, notes, shift-reports must
     also insert one row into events.

END-OF-SHIFT REVIEW (new build):

5. src/features/operations/EndOfShiftReview.jsx already exists. Expand it to:
   - Consume shiftBrain (passed in from PageRenderer's notifications group).
   - Show a deterministic summary: open actions count, unresolved incidents
     count, events held today, top risk signals, recommended focus from
     the snapshot.
   - Show a carry-forward selection: each open action and unresolved incident
     gets a checkbox defaulting to "carry forward to next shift".
   - On submit:
     - POST /api/shift-reports with the snapshot + carry-forward selections.
     - For each item marked carry-forward, ensure it remains open (no state
       change), but tag it with carry_forward_count++ (new column on actions
       and incidents).
     - For each item un-checked, mark it resolved/completed.
   - Show a "Send to next shift" button that triggers the API call.

6. src/services/shiftBrainService.js
   - Add a new pure function:
     buildNextShiftInheritance({ closedShiftReport, openActions,
       openIncidents }) → { inheritedActions, inheritedIncidents,
       priorityCalloutsForNextBrief }
   - This is the deterministic carry-forward engine. It is called by the
     next pre-shift briefing's hook.

7. src/hooks/useShiftBrainState.js
   - When today's pre-shift briefing is rendered, call buildNextShiftInheritance
     using the most recent archived shift_report from reportArchive. Pass
     the priorityCalloutsForNextBrief into the shiftBrain snapshot under a
     new key: shiftBrain.carryForwardCallouts (string[]).

8. src/features/shift-brain/PreShiftBriefing.jsx
   - Render shiftBrain.carryForwardCallouts at the top of the briefable items
     list, with a "From last shift" header.

CONSTRAINTS:
- Do not write to localStorage as system of record for any field that has an
  API endpoint. localStorage is a cache, never a source of truth.
- Do not invent default carry-forward priorities — the priority is the
  priority of the original item.
- Failure mode: if the API is unreachable, show a clear "Offline — changes
  will sync when reconnected" banner. Do not silently fail.

ACCEPTANCE CRITERIA:
A. Closing a shift writes one shift_report row and one events row with
   event_type = 'shift_closed'.
B. Closing a shift with three unchecked carry-forwards correctly resolves
   those three items in the SQLite tables.
C. Opening the next pre-shift briefing on a different browser (after the
   API sync completes) shows the correct carry-forward callouts at the top.
D. Reloading the browser at any point during the loop does not lose state.
E. With offline conditions (server down), the UI surfaces a banner and the
   action/incident writes queue locally for retry.
```

---

### Phase 3 — HOSPIA → HESTIA Identifier Migration

```
You are working on the HESTIA codebase. Phase 1 and Phase 2 must be merged.

GOAL: complete the brand migration started in Phase 2 of the architecture
work. The technical identifiers hospia.*, X-HOSPIA-Role, hospia.sqlite,
and HOSPIA_LOCAL_APP package name must all be renamed atomically with a
data-preserving migration.

PRE-WORK:
Read HESTIA_PHASE_2_CHECKPOINT.md → "Technical Identifiers Intentionally
Not Renamed" section. Confirm the six files involved.

FILES TO MODIFY (in this order; do not commit until all are done):

1. src/config/systemConfig.js
   - Add a new STORAGE_V2 object with all keys prefixed hestia.* matching the
     existing hospia.* keys.
   - Add a one-time migration function migrateLocalStorageKeys() that runs
     on app boot:
     - For each hestia.* key, if a hospia.* equivalent exists in localStorage
       and the hestia.* key does not, copy and delete.
   - Call this function once at the top of main.jsx before <App /> mounts.
   - Update STORAGE export to use the new keys.

2. src/hooks/useReportsState.js
   - Replace the literal 'hospia.businessMemory' with STORAGE.businessMemory
     (which is now hestia.businessMemory).

3. server.js
   - Rename ACCEPTED HTTP header from X-HOSPIA-Role to X-HESTIA-Role (note:
     after Phase 1, the header is replaced by Authorization, but Phase 1 may
     have left a transitional header — remove the transitional header here).
   - On server boot, if data/hospia.sqlite exists and data/hestia.sqlite does
     not, rename the file. Log the rename.

4. src/services/api/client.js, src/services/userService.js,
   src/services/ownerInsightService.js, src/hooks/useBackendSync.js
   - Remove any remaining references to X-HOSPIA-Role.

5. package.json
   - Change name to hestia-local-app. This has no runtime effect.

6. Folder rename: HOSPIA_LOCAL_APP/ → HESTIA_LOCAL_APP/
   - Update CLAUDE.md path references.
   - Update vite.config.js if it references the folder name.

7. docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md → HESTIA_STRATEGY_FOUNDATION.md
   docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md → HESTIA_SYSTEM_ARCHITECTURE.md
   Update CLAUDE.md path references.

CONSTRAINTS:
- The localStorage migration must be idempotent — running it twice must not
  destroy data.
- The SQLite file rename must be a single atomic fs.renameSync; on failure,
  do not start the server.
- All six identifier categories must be renamed in a single PR. Do not ship
  partial.

ACCEPTANCE CRITERIA:
A. After migration, no file in the repo (excluding docs/strategy/
   HESTIA_AUDIT_AND_NEXT_PHASE.md historical references and node_modules)
   contains the string HOSPIA in code.
B. Existing user localStorage data is preserved across the migration.
C. The SQLite file at data/hestia.sqlite contains all the rows previously
   in data/hospia.sqlite.
D. The app boots cleanly and all role-gated endpoints work.
```

---

### Phase 4 — AI-Assisted Shift Intelligence

```
You are working on the HESTIA codebase. Phases 1–3 must be merged.
Read HESTIA_SHIFT_BRAIN_V1.md and HOSPIA_SYSTEM_ARCHITECTURE.md section 4.8
before starting.

GOAL: introduce AI augmentation to Shift Brain without compromising the
deterministic core. AI generates phrasing and classification; humans confirm
and edit; the deterministic snapshot is always preserved alongside the
AI output.

FILES TO CREATE:

1. src/prompts/shiftBrainPrompts.js
   - export buildShiftSummaryPrompt(snapshot, venueProfile)
   - export buildIncidentClassificationPrompt(rawText)
   - Each prompt must include the source events and ask the model to cite
     them by ID in its output.

FILES TO MODIFY:

2. src/services/shiftBrainService.js
   - Add async function summarizeShift(snapshot, venueProfile) that:
     - Calls /api/gemini with the prompt from shiftBrainPrompts.
     - Returns { aiSummary, model_version, confidence, source_event_ids }.
     - If the API fails, returns null. Never throws.
   - This is the ONLY place a Gemini call lives inside Shift Brain. Do not
     scatter AI calls into hooks or components.

3. src/services/shiftBrainService.js
   - Add async function classifyIncident(rawText) that returns
     { issueType, severity, confidence, rationale }. Same fallback behavior.

4. src/features/operations/EndOfShiftReview.jsx
   - On render, show the deterministic summary first.
   - Below it, show "AI-assisted summary (editable)" if summarizeShift
     returned a non-null result. The textarea is pre-filled with aiSummary
     and is editable.
   - Save action persists both:
     - shift_reports.deterministic_summary (deterministic snapshot JSON)
     - shift_reports.narrative_summary (the editable AI text, final state)
     - shift_reports.ai_metadata (model_version, confidence, source_event_ids)

5. src/features/employee/ServiceRecovery.jsx (one-tap incident capture)
   - Add a "Suggest classification" button. On tap, call classifyIncident.
   - Render the AI suggestion with confidence dot. Manager confirms or edits
     issueType and severity before save.

6. server.js
   - Extend shift_reports table with three new nullable columns:
     deterministic_summary TEXT, narrative_summary TEXT, ai_metadata TEXT.
   - On POST /api/shift-reports, accept and store all three.

CONSTRAINTS:
- The deterministic snapshot is always saved, even if the AI call fails.
- The AI text is never auto-saved without manager review.
- Every AI surface must satisfy the four trust criteria from
  HOSPIA_SYSTEM_ARCHITECTURE.md section 4.8: source events visible, output
  editable, action explained, improvement trackable.
- No prompt strings inside services — all prompts in src/prompts/.

ACCEPTANCE CRITERIA:
A. Closing a shift with the AI summary enabled writes both deterministic and
   narrative summaries to SQLite.
B. Closing a shift with the API offline still writes the deterministic
   summary and shows an empty narrative field. Loop does not break.
C. Capturing an incident with "Suggest classification" and the API offline
   falls back to manual entry. No silent failure.
D. The deterministic Shift Brain output is byte-identical to its pre-Phase-4
   output for the same inputs (deterministic guarantee is unchanged).
```

---

### Phase 5 — Owner Weekly Brief (real-data)

```
You are working on the HESTIA codebase. Phases 1–4 must be merged.

GOAL: give the owner one meaningful weekly digest, computed from at least
7 archived shift_reports. If 7 days of data are not available, the surface
clearly says so. No fabricated comparisons.

FILES TO MODIFY:

1. src/services/ownerInsightService.js
   - Add buildWeeklyDigest(shiftReports, businessMemory) that returns:
     {
       windowDays: Number,
       reportCount: Number,
       hasEnoughData: Boolean,   // true if reportCount >= 7
       topIncidentCategory: { category, count } | null,
       actionCompletionRate: Number | null,   // 0..1 or null
       agingTrend: 'improving' | 'stable' | 'worsening' | null,
       topRecommendedFoci: String[]   // max 2
     }
   - The function is pure and deterministic. No AI in this function.
   - Add an optional async narrateWeeklyDigest(digest) that calls Gemini
     for phrasing, following the same trust rules as Phase 4.

2. src/features/owner/OperationalPulse.jsx
   - Add a collapsible "This Week" card below the current operational status.
   - When digest.hasEnoughData is false, render:
     "Not enough data yet — weekly digest unlocks after 7 archived shifts."
   - When it is true, render the four signals with their actual values.
   - Render the AI narrative below, editable by the owner before optional
     export to PDF (do not build PDF export in this phase — defer).

CONSTRAINTS:
- Do not invent week-over-week comparisons unless 14 archived shifts exist.
- Do not show empty cards or "—" placeholders. Either the data is present
  and rendered, or the card says "not enough data yet" — never both.

ACCEPTANCE CRITERIA:
A. With fewer than 7 archived shift_reports, the weekly card shows the
   explicit empty-state message.
B. With exactly 7 archived reports, all four signals render with values
   computed from those reports.
C. With 14 or more reports, week-over-week aging trend is computed.
D. The owner can edit the AI narrative; the deterministic digest object is
   always preserved.
```

---

## 11. Acceptance Criteria — Cross-Phase Summary

A pre-seed investor demo on real venue data is **ready** when all of the following are true:

1. **No hardcoded operational content in the bundle.** Search for the strings "Noa B.", "Yoav S.", "expectedCovers: 184", "8400", "6200" anywhere under `src/` returns zero matches outside of comments.
2. **The owner home is `OperationalPulse`.** All five gated owner pages are unreachable through navigation in the MVP build.
3. **Login is real.** `MNG123` / `OWN123` / `EMP123` return 401 from `/api/session/login`. A venue-created user with a bcrypt-stored password returns 200 and a session token.
4. **The daily loop closes through the API.** A manager can capture an incident on phone A, close the shift, and see the carry-forward on phone B without any localStorage sharing.
5. **The Shift Brain output is byte-identical to its deterministic spec** for the same inputs after the AI augmentation in Phase 4. The trust model is preserved.
6. **The HOSPIA → HESTIA identifier migration is complete.** Every runtime identifier reads HESTIA. The user's existing localStorage data was preserved across the rename.
7. **The weekly digest only renders when 7 archived shifts exist** and never invents comparisons.

When those seven conditions hold, the founder narrative ("operational intelligence layer for premium bar-led venues, demonstrated live on Beit Ramona") becomes defensible end-to-end. Until then, the product is one click away from a credibility loss on fabricated data.

---

## 12. Things explicitly NOT recommended

Per the user brief, this section names the things this audit refuses to suggest, and why.

- **A real-time analytics dashboard for the owner.** The strategy document calls this a failure mode. We have one operational pulse page; that is enough until retention is proven.
- **A guest CRM.** Premature. Guest memory is V2 and only meaningful after reservations integration.
- **A POS integration in the next 90 days.** The product can prove value with manual incident capture. POS integration is a fundraising milestone, not a pre-seed requirement.
- **A multi-tenant model.** One venue is one DB until two venues exist.
- **An AI chat home screen.** Architecture doc explicitly forbids it.
- **Marketplace integrations as a category.**
- **A generic report builder.**
- **Predictive ordering or labor forecasting in MVP.** Both require data that does not yet exist for any venue.

---

## 13. Closing summary for the founder

תואם — the architecture under the surface is more honest than the surface itself. The Shift Brain service, the costing-honest pricing adapter, the verified-price audit trail, the hospitality ontology, and the clean hook composition are pre-seed-grade foundations. They are not yet visible to a visitor because the home page leads with eleven owner dashboards instead of one operational page, and because four files in `src/data/` still render fabricated content.

The next phase is not a feature push. It is a credibility pass: remove the seeded content, tighten auth, close the manager loop through the API, and make the owner home a single page that mirrors the manager's reality. With those four moves, the product on one live venue is investor-demonstrable.

After that, the V2 vision in the strategy document is allowed to begin — but not before.
