# HESTIA Development Context

Core strategic documents:

- /docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md
- /docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md

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

`src/App.jsx` is **composition and orchestration only** — 352 lines, zero direct `useState`, zero `useEffect`. It wires hooks, owns two cross-domain orchestration functions (`login`, `archiveEndOfDayReport`), renders the shell, and calls `PageRenderer`.

Do not add state, persistence effects, or feature UI to App.jsx. Any new state belongs in a hook. Any new feature UI belongs in `src/features/`.

### Hooks own state

All application state lives in `src/hooks/`. There are 10 hooks. Each hook owns its state, persistence effects, and domain handlers. Hooks accept stable cross-domain callbacks as injected parameters — they do not import other hooks.

### Features own UI

All feature components live in `src/features/`. They receive props from PageRenderer. They do not import hooks or manage cross-domain state.

### PageRenderer contract

PageRenderer receives grouped domain prop objects: `session`, `reports`, `operations`, `cocktails`, `academy`, `notifications`. Do not revert this to a flat prop list.

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

### Technical identifiers — do not rename without a migration plan

These still use the old "HOSPIA" name and must be migrated together:

- `hospia.*` localStorage keys — renaming without migration clears user data
- `X-HOSPIA-Role` HTTP header — frontend and backend must rename simultaneously
- `HOSPIA_LOCAL_APP` package/folder name — safe to rename anytime, no runtime effect
- `HOSPIA_STRATEGY_FOUNDATION.md`, `HOSPIA_SYSTEM_ARCHITECTURE.md` — safe to rename if CLAUDE.md paths are updated