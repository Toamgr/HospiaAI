# HESTIA Development Context

---

## ⚠ MANDATORY: Read Before Proposing Any Work

**HESTIA is a standalone hospitality management platform. It is entirely separate from any other AI startup project, EventSheet product, or external codebase. Do not import code, architecture patterns, naming conventions, database schemas, documentation structures, or roadmap decisions from any other project.**

Before proposing any architecture change, roadmap change, new module, major feature, connection, or refactor, every agent MUST read these three files:

1. **`docs/HESTIA_MASTER_STATE.md`** — What HESTIA is today. What is built. What is connected. What is missing. What must not be rebuilt.
2. **`docs/HESTIA_ARCHITECTURE_AUDIT.md`** — Full module-by-module audit. Persistence map. Dead code. Demo-data risks. Critical conclusions.
3. **`docs/HESTIA_CTO_ROADMAP.md`** — Official phased development roadmap. What is in Phase 1. What is explicitly excluded. Sequencing rules.

**These three files are the source of truth for HESTIA.** They supersede any prior audit, checkpoint, handoff, or planning document for architecture and roadmap decisions.

If you propose work that contradicts the roadmap, duplicates existing infrastructure, or activates features that will show empty data, you have not read these files.

---

## MASTER MEMORY AUTHORITY

Before any strategic, architectural, product, or development work, read:

`memory/project_hestia_master_memory.md`

This file is the primary institutional memory and source of truth for HESTIA.

If conflicts exist between:
- Project Memory
- Session Memory
- Context Prompts
- Previous Chats

The master memory file takes precedence.

Do not rely on auto-generated project memory summaries when the master memory exists.

---

## Project Identity

HESTIA is a **hospitality operating system** for premium venues. It is not a SaaS dashboard, not a chatbot, not an admin panel, and not a generic task management system.

---

## Core Strategic Documents

- `docs/HESTIA_MASTER_STATE.md` — **Current source of truth** (read first)
- `docs/HESTIA_ARCHITECTURE_AUDIT.md` — **Architecture audit** (read before any architecture work)
- `docs/HESTIA_CTO_ROADMAP.md` — **Official roadmap** (read before any roadmap or feature work)
- `docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md` — Operational philosophy and product direction
- `docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md` — System architecture reference

These documents define:
- the operational philosophy,
- hospitality UX principles,
- event-driven architecture,
- memory systems,
- AI orchestration,
- Shift Brain,
- escalation systems,
- and long-term product direction.

All development decisions should align with these documents.

Prioritize:
- operational clarity,
- event architecture,
- memory compounding,
- role-aware workflows,
- mobile-first UX,
- and hospitality-native behavior.

Avoid:
- dashboard bloat,
- disconnected features,
- generic AI chat systems,
- and unnecessary complexity.

---

## Current Architecture Status

**Phase 2 complete as of 2026-05-12.**

Full checkpoint: `/docs/architecture/HESTIA_PHASE_2_CHECKPOINT.md`

### Brand

The product is named **HESTIA** in all user-facing copy, UI, docs, and AI prompts.

### App.jsx

`src/App.jsx` is **composition and orchestration only** — ~377 lines, zero direct `useState`, zero `useEffect`. It wires hooks, owns two cross-domain orchestration functions (`login`, `archiveEndOfDayReport`), renders the shell, and renders `PageRenderer` (imported from `src/PageRenderer.jsx`).

Do not add state, persistence effects, or feature UI to App.jsx. Any new state belongs in a hook. Any new feature UI belongs in `src/features/` (registered in `src/PageRenderer.jsx`).

### Hooks own state

All application state lives in `src/hooks/`. There are 10 hooks. Each hook owns its state, persistence effects, and domain handlers. Hooks accept stable cross-domain callbacks as injected parameters — they do not import other hooks.

### Features own UI

All feature components live in `src/features/`. They receive props from PageRenderer. They do not import hooks or manage cross-domain state.

### PageRenderer contract

`PageRenderer` lives in **`src/PageRenderer.jsx`** (extracted from App.jsx in the Phase 1 nav re-skin, 2026-06-21; the extraction was a pure move with no behavior change). It owns the page-key → feature-component map. New feature pages are registered here, not in App.jsx.

PageRenderer receives grouped domain prop objects: `session`, `reports`, `operations`, `cocktails`, `academy`, `notifications` (plus `events`, `cocktailIntelligence`, `venueIntelligence`). Do not revert this to a flat prop list.

### Phase 1 — Role-based navigation posture (2026-06-21)

The Phase 1 nav re-skin (commit `d1527b8`) made the owner experience chat-first, per `docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md` and `docs/audits/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_CODEBASE_AUDIT_2026-06-21.md`. Current confirmed behavior:

- **Owner default landing = `ownerHome` (HESTIA AI / `OwnerAIHome`).** Owner Reports (`operationalPulse`), Decision Center, and Venue DNA are depth layers, not the home.
- **Admin default landing = `operationalPulse`** (preserved via `ROLE_LANDING_PREFERENCE` in `roleConfig.js`; admin is a superuser/operations role, not the owner product persona).
- **Manager can reach the Pre-Shift Brief** (the `operations` nav group now includes `manager`).
- **Extra roles are preserved as secondary modules — not deleted, not folded into the 4-role MVP narrative.** `fb_director`, `events_manager`, and `chef` keep their flows (Events CRM, Chef menus, CI dashboard); they were only removed from the *owner's* primary nav, and remain owned by their real roles.

Effective navigation access is gated by `NAV_GROUPS[area].roles` + `PAGE_META[page].roles` in `src/config/navigationConfig.js`. `MODULE_ACCESS_RULES` in `roleConfig.js` is descriptive only (kept in sync for documentation; not the runtime gate).

### Shift Brain V1

**Complete as of 2026-05-12.** Full documentation: `/docs/architecture/HESTIA_SHIFT_BRAIN_V1.md`

- `src/services/shiftBrainService.js` is the deterministic intelligence engine. All classification, pattern detection, threshold decisions, and focus generation live here. Do not duplicate intelligence logic in components or hooks.
- `src/hooks/useShiftBrainState.js` is the only call site for `buildShiftIntelligence`. If new intelligence inputs are needed, extend the hook signature and the service function.
- `src/features/shift-brain/` components own rendering only. They do not compute intelligence inline.
- `App.jsx` passes operational data into `useShiftBrainState` and forwards `shiftBrain` through the `notifications` group. No feature logic about `shiftBrain` belongs in App.jsx.
- When adding new intelligence (AI or deterministic), extend `shiftBrainService.js`. Do not add AI calls to hooks or components.

### Hospitality Ontology Foundation

**Complete as of 2026-05-12.** Location: `src/domain/hospitality/`

This layer defines the canonical hospitality domain vocabulary for HESTIA:
entities, relationships, decisions, memory candidates, event types, AI agent candidates, database model candidates, and the six operational loops.

Rules:
- Future database schemas, event systems, AI agents, and memory systems must reference this layer before inventing new concepts.
- Do not add fake operational records, seeded data, or placeholder metrics to this layer.
- This layer has no runtime behavior and must not be wired into pages or hooks unless explicitly requested.
- New hospitality concepts (entities, event types, agent candidates) belong here first, not inside feature components or services.

Files: `hospitalityEntities.js`, `hospitalityRelationships.js`, `hospitalityDecisionMap.js`, `hospitalityMemoryMap.js`, `hospitalityEventTypes.js`, `hospitalityAgentMap.js`, `hospitalityDataModelMap.js`, `hospitalityOperationalLoops.js`, `index.js`

### Bar Product Intelligence Foundation

**Foundation layer — not wired to runtime.** Location: `src/domain/hospitality/bar/`

Full specification: `/docs/architecture/HESTIA_BAR_PRODUCT_FOUNDATION.md`

This sub-layer of the hospitality domain defines bar product schemas, pricing intelligence, costing utilities, confidence levels, menu engineering, supplier candidate references, and the data model map for future database migration.

Rules:
- Do not add fake prices, invented costs, or placeholder costing defaults to this layer.
- `barProductSupplierMap.js` contains market-reference candidates only — not venue suppliers, not verified relationships, not active procurement records. All candidates carry `relationship_status: 'market_reference_only'` and `requires_human_validation: true`.
- No costing calculation may use price data that is not source-backed (verified invoice) or venue-entered (user-confirmed override). Benchmark estimates may be used for orientation only, never silently for menu pricing.
- Calculation utilities in `barCalculationUtils.js` are pure and stateless. They must not invent fallback defaults or manufacture costs when inputs are missing — return `null` instead.
- This layer has no runtime behavior and must not be wired into pages, hooks, or services unless explicitly requested.
- New bar product concepts (product types, pricing models, supplier intelligence, menu engineering rules) belong here first, not inside feature components.

### Cocktail Lab — Costing Honesty + Interactive Build Guide

**Complete as of 2026-05-13.** Full checkpoint: `/docs/architecture/HESTIA_COCKTAIL_LAB_EXPERIENCE_CHECKPOINT.md`

The Cocktail Lab now has two live improvements:

1. **Costing honesty** — `buildCostSheet()` in `cocktailLabPricingAdapter.js` computes `confidence_level` and `cost_status` from the actual row mix. The UI in `CocktailLabStudio.jsx` reflects these values: per-row confidence dots, conditional Standard/Luxury price prefixes, traffic-light gating, a source-aware warning banner, and a labeled labor assumption.

2. **Interactive Build Guide** — `CocktailBuildExperience.jsx` + `cocktailBuildExperienceUtils.js` in `src/features/bar/`. Renders a step-by-step preparation sequence from available recipe data only. Integrated as a collapsible, non-blocking panel in `CocktailLabStudio` (defaults closed). No external APIs, no video, no fake data.

Rules for future work in Cocktail Lab:
- Do not display benchmark or assumption costs as verified.
- Do not suppress `confidence_level` or `cost_status` from the UI.
- Do not infer preparation method, glassware, or technique as fact when the recipe field is missing.
- Do not add fake prices, fake products, or fake recipe steps to either file.
- Do not wire external video or API services to the Build Guide.
- Preserve source/confidence labeling in any new cost display surfaces.

### Technical identifiers — do not rename without a migration plan

These still use the old "HOSPIA" name and must be migrated together:

- `hospia.*` localStorage keys — renaming without migration clears user data
- `X-HOSPIA-Role` HTTP header — frontend and backend must rename simultaneously
- `HOSPIA_LOCAL_APP` package/folder name — safe to rename anytime, no runtime effect
- `HOSPIA_STRATEGY_FOUNDATION.md`, `HOSPIA_SYSTEM_ARCHITECTURE.md` — safe to rename if CLAUDE.md paths are updated

## Design System
Before building any HESTIA UI screen, component, or layout, read:
skills/user/hestia-ui-design/SKILL.md

This skill defines the complete HESTIA visual system — palettes, typography, components, motion, and editorial patterns. It is mandatory for all UI work.
