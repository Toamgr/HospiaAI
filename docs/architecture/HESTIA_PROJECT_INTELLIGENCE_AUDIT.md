# HESTIA Project Intelligence Audit

Audit date: 2026-06-15  
Scope: read-only repository intelligence audit, with this report as the only created file.  
Sensitive files: `.env` and credential values were not read, printed, or summarized.

## 1. Executive Summary

HESTIA is currently a partially operational Hospitality Intelligence Operating System, not a generic SaaS dashboard and not a chatbot wrapper. The repository contains a real React/Vite frontend, a large Express/SQLite backend, role-based access, event CRM, deterministic event intelligence through Zohar, Cocktail Intelligence, Chef workflows, Shift Brain, Academy, Wine Atlas, notifications, user management, and a new multi-venue memory boundary.

The main product truth is consistent across `memory/project_hestia_master_memory.md`, `docs/HESTIA_MASTER_STATE.md`, `docs/HESTIA_ARCHITECTURE_AUDIT.md`, and `docs/HESTIA_CTO_ROADMAP.md`: HESTIA is under-connected, not under-built. The system already has many modules. The highest-value work is connecting event, shift, beverage, food, academy, owner, and memory systems into closed operational loops.

Current maturity is uneven. Event CRM, Zohar, Shift Brain, Academy platform, Wine Atlas, notification infrastructure, authentication, and user management are real. Owner Intelligence is partially present but mostly feature-flagged off. Event Architect and some owner/CI surfaces still risk demo/future/module language. Several operational workflows remain localStorage-backed. The backend is a monolith (`server.js`, about 7,490 lines, 170 Express route declarations), which makes change risk high.

## 2. Repository Map

| Area | Purpose | Notes |
|---|---|---|
| `memory/` | Institutional project memory | `memory/project_hestia_master_memory.md` is the highest authority. |
| `docs/` | Strategy, architecture, research, domains, roadmap, academy, design | Key files include `docs/HESTIA_MASTER_STATE.md`, `docs/HESTIA_ARCHITECTURE_AUDIT.md`, `docs/HESTIA_CTO_ROADMAP.md`, `docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md`, `docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md`, and `docs/architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md`. |
| `docs/research/researches for Venue Intelligence/` | Venue intelligence research | Includes the active `HESTIA Intelligence Doctrine v1.md` and venue/guest/founder memory research. |
| `src/` | Frontend application | React/Vite app with hooks, features, services, config, domain vocabulary, data, assets. |
| `src/features/` | UI/product modules | Events, owner, operations, bar, cocktail intelligence, academy, employee, chef, shifts, staff, venue intelligence, shell. |
| `src/hooks/` | State ownership layer | Hooks own domain state and handlers. `App.jsx` wires them. |
| `src/services/` | API clients and intelligence services | Includes `shiftBrainService.js`, `geminiCocktailAgent.js`, venue bridge services, API wrappers. |
| `src/domain/hospitality/` | Dormant canonical hospitality vocabulary | Ontology, events, memory, agents, data model maps, operational loops. |
| `src/domain/hospitality/bar/` | Dormant bar product intelligence foundation | Schemas, confidence levels, pricing/costing utilities, supplier candidates, cocktail knowledge base. |
| `server.js` | Entire backend | Express, SQLite, auth, venues, events, CI, venue intelligence, chef, shifts. High-risk monolith. |
| `data/` | SQLite runtime data | Local database area. Do not treat as source documentation. |
| `prototypes/` | Standalone prototypes | Currently includes `prototypes/owner-threshold.html`. |
| `skills/user/` | Custom HESTIA skills | UI design, product design judgment, hospitality intelligence, academy design/curriculum. |
| `.agents/skills/` | Installed external/custom design skills | Includes `high-end-visual-design` and `imagegen-frontend-web`. |
| `scripts/` | Utility/check scripts | `hestia-check.js`, `test-hospitality-dna.js`. |

## 3. Product Modules

| Module | Purpose | Key files/components | Current maturity | Risk |
|---|---|---|---|---|
| Owner Area | Owner-level operating pulse, reports, memory, approvals, strategic views | `src/features/owner/OperationalPulse.jsx`, `OwnerReport.jsx`, `BusinessMemoryPage.jsx`, `src/hooks/useOwnerPulseState.js`, `src/services/ownerInsightService.js` | Mixed. `OperationalPulse` is live and data-gated. Many pages are feature-flagged off in `src/config/featureFlags.js`. | Activating all owner pages would expose empty, legacy, or insufficiently wired views. |
| Admin / Manager Operations | Pre-shift, action board, EOD, employee requests, budget requests, notes | `src/features/operations/`, `src/features/shift-brain/`, `src/hooks/useOperationsState.js`, `useShiftState.js` | Functional, partly backend-persisted. | Some requests/tasks/notes still localStorage or partially connected. |
| Event Manager | Event CRM, creation, calendar, detail tabs, guests, seating, tasks, messaging, check-in | `src/features/events/EventCRM.jsx`, `EventDetail.jsx`, `EventCalendar.jsx`, `useEventState.js`, `eventsApi.js` | Strong. Full event CRUD and detail workflow exist. | Post-event memory loop absent; messaging simulation; EventTeam not connected to Shift Organizer. |
| Event Intelligence / Zohar | Deterministic event briefs, hospitality DNA, risk, timeline, coordination, creative brief | `src/features/events/tabs/EventZohar.jsx`, `utils/zoharBriefOrchestrator.js`, `eventHospitalityDNA.js`, `zoharDesignBriefEngine.js` | Strong deterministic foundation. | Briefs do not yet seed CI or Chef; event intelligence not fully carried into shifts/memory. |
| Event Architect | Floor plan / planning studio | `src/features/events/EventBrain.jsx`, `components/ZoharPanel.jsx`, `data/eventBrainDemoData.js`, `utils/eventArchitectAdapter.js` | Functional but risky. | Known demo-data contamination in production-facing components. |
| Beverage / Cocktail Intelligence | Bar DNA, menu generation, audits, margin, narratives, visual menu, sales, daily close, exports, director chat | `src/features/cocktail-intelligence/`, `src/hooks/useCocktailIntelligenceState.js`, `src/services/api/cocktailIntelligenceApi.js`, CI routes in `server.js` | Deep and broad. | Some UI still reads as modules/future features; chatbot drift risk in Beverage Director; event menus not fully entering CI lifecycle. |
| Cocktail Lab / Bar Management | Cocktail R&D, costing, build guide, inventory, bottle prices | `src/features/bar/CocktailLabStudio.jsx`, `CocktailBuildExperience.jsx`, `BottlePrices.jsx`, `domain/hospitality/bar/*` | Useful but partly localStorage-backed. | Costing honesty must be preserved; backend migration has known ID/data-shape blockers. |
| Academy / Training | Professional formation, courses, lesson player, venue recommendations, Wine Atlas | `src/features/academy/`, `src/data/academy/universityManifest.js`, `RecommendedForVenue.jsx`, `src/features/wine-atlas/` | Platform is real; content is rich. | Course-grid/progress language can drift toward LMS; completion is exposure, not capability. |
| Venue Intelligence / Venue DNA | Owner/admin conversation that builds Venue DNA and specialist briefs | `src/features/venue-intelligence/VenueIntelligence.jsx`, `venueDnaModel.js`, `useVenueIntelligenceState.js`, `services/venueBridge/*` | Real foundation, recently expanded. | Must not overstate confidence; Venue DNA changes need explicit owner/admin confirmation discipline. |
| Roles / Access / Settings | Role-aware navigation, page access, user management, venue selector | `src/config/roleConfig.js`, `navigationConfig.js`, `routes.js`, `UserManagement.jsx`, `VenueSelector.jsx` | Solid but complex. | Role leakage risk from duplicated role lists and admin bypass; auth users vs hospia users not unified. |
| Multi-Venue Foundation | Venue as memory unit; `X-HESTIA-Venue` transport | `docs/architecture/HESTIA_PHASE_8_MULTI_VENUE.md`, `useVenueState.js`, `api/client.js`, `server.js` | Complete foundation. | Membership UI not built; stale/incorrect venue assignment can cause access confusion. |

## 4. Intelligence Architecture

HESTIA currently represents intelligence through several layers rather than one general assistant:

- Deterministic engines: `src/services/shiftBrainService.js`, `src/features/events/utils/zoharBriefOrchestrator.js`, `zoharRiskEngine.js`, `zoharTimelineEngine.js`, `zoharCoordinationEngine.js`, `eventHospitalityDNA.js`, `dailyBriefingEngine.js`.
- Venue learning and Venue DNA: `src/features/venue-intelligence/VenueIntelligence.jsx`, `venueDnaModel.js`, and `/api/venue-intelligence` endpoints.
- Shared venue bridge selectors: `src/services/venueBridge/intelligenceContextService.js` routes one venue intelligence bundle into Omer, Academy, Owner Intelligence, and unified context.
- Omer: `src/services/venueBridge/omerContextService.js` prepares venue-specific F&B context for Omer/Cocktail Intelligence. It is deterministic and does not re-profile the venue.
- Zohar: event intelligence persona/layer for Event Manager workflows. Zohar is largely deterministic and event-data-grounded.
- Academy intelligence: `academyContextService.js` maps Venue Bridge briefs to existing academy recommendations. It avoids inventing lessons and gates cocktail training for non-bar venues.
- Owner intelligence: `OperationalPulse.jsx`, `/api/owner/pulse`, `/api/owner/trends`, `/api/owner/insights`, and `ownerInsightService.js` build owner-facing summaries from operational facts.
- Memory: live memory exists through business memory, shift reports, incidents, actions, venue learning, and bridge briefs, but it is not yet a fully unified append-only operational memory graph.

The strongest architectural principle is separation: intelligence logic belongs in services/utilities, state belongs in hooks, and feature components render. The biggest gap is closed-loop memory: recommendations and event outcomes do not consistently become structured memory candidates with provenance, confidence, sensitivity, owner, and future recall paths.

Named intelligences are useful but close to the upper limit. Current named/personified layers include HESTIA, Zohar, Omer, plus prototype faculties such as “the keeper,” “the floor,” “the academy,” and “the watch.” Future work should resist adding more personas unless they map to a real role-specific workflow.

## 5. UI / UX Architecture

Main entry points:

- `src/main.jsx` mounts `GuestPortal` directly for `/event/:token/guest`; otherwise it mounts `App` inside `BrowserRouter`.
- `src/App.jsx` wires hooks, shell components, and `PageRenderer`.
- `src/config/routes.js` maps page keys to URL paths.
- `src/config/navigationConfig.js` defines navigation groups and `PAGE_META`.
- `src/config/roleConfig.js` defines role access helpers.

Layout components:

- `src/features/shell/TopNav.jsx`
- `src/features/shell/SidePanel.jsx`
- `src/features/shell/NotificationPanel.jsx`
- `src/features/employee/EmployeeNavRail.jsx`
- `src/components/AppPrimitives.jsx`
- `src/components/ui/index.jsx`

Design system direction:

- `skills/user/hestia-ui-design/SKILL.md` defines two visual worlds: Operational Dark and Editorial Light.
- Operational screens use near-black, warm ivory text, gold accents, Fraunces/DM Sans/JetBrains Mono, hairlines, compact operational density.
- Editorial/training surfaces use warm ivory, burgundy, amber, Cormorant/Fraunces/Inter, folios, maps, magazine-like hierarchy.

Mature areas:

- Event Detail structure and tabs.
- Zohar deterministic intelligence components.
- Wine Atlas and magazine/editorial surfaces.
- Operational Pulse data gating and trust labels.
- Role/navigation config as a central access model.

Experimental or inconsistent areas:

- Owner Threshold prototype is standalone and not wired.
- Event Architect still has demo-data risk.
- Cocktail Intelligence dashboard uses module/future-feature patterns in places.
- Academy hub still looks partly like a course grid despite strong curriculum doctrine.
- Owner pages are split among live, legacy, WIP, and feature-flagged exports.

Fragile areas:

- `App.jsx` is composition-only, but still contains the local `PageRenderer` map. Adding feature UI or state there would violate architecture rules.
- `server.js` is large and route-dense.
- Large frontend files such as `CocktailLabStudio.jsx`, `EventCocktailMenu.jsx`, `CocktailIntelligenceDashboard.jsx`, `EventCalendar.jsx`, and `ActionBoard.jsx` require careful edits.

## 6. Owner Threshold Status

Prototype location: `prototypes/owner-threshold.html`.

Current behavior:

- Standalone HTML/CSS/JS prototype.
- Ember-dark editorial entry experience.
- Shows six “faculties” before the owner enters: Omer/beverage, the keeper/memory, the floor/service, Zohar/events, the academy/capability, the watch/operations.
- Recognition sequence: awake, sensing, discovered in firelight, received, then threshold.
- Offers “Existing Venue” and “New Venue.”
- Existing venue view shows example venue plates.
- New venue path transitions to a Venue Learning prompt: “Tell me about the place — what made you open it?”

Metaphor:

- HESTIA as the consciousness/hearth of a living hospitality business.
- The faculties are warm presences that quiet and defer as one awareness gathers.
- The goddess/mark is discovered in firelight, not drawn as sci-fi or neural imagery.

Risks:

- The file itself says: “THROWAWAY PROTOTYPE — redesign per approved audit. Not wired.”
- It contains hardcoded example venues and invented operational statements.
- It introduces multiple faculties/personas, which could overload the product language if productionized literally.
- It is visually ambitious but not tied to auth, venue membership, or real Venue Learning state.
- It could become over-designed symbolism without operational truth.

Recommendation:

- Keep it as a design/research prototype. Do not integrate it directly into production UI.
- Extract only the strongest principles: threshold, hearth, owner recognition, existing/new venue split, warm non-SaaS entry.
- Any production owner entry should be rebuilt with real auth/session/venue data and zero invented venue signals.

## 7. Event Manager Status

Event Manager is one of the strongest product areas. `useEventState.js` owns events, selected event detail, guests, tables, tasks, timeline, and messages. `EventCRM.jsx` manages list/create/detail/check-in views. `EventDetail.jsx` has nine visible tabs: Overview, Zohar, Cocktail Menu, Guests, Seating, Tasks, Messaging, Team, Timeline.

Important event UX:

- Event creation flows into detail.
- Calendar can select events and deep-link user context into Event CRM.
- Event Detail supports calendar export.
- Zohar and Cocktail Menu are marked as intelligence tabs.
- Public guest portal lives outside the main app shell through `src/main.jsx`.

What matters next:

- Do not rebuild Event CRM.
- Connect Zohar outputs to CI and Chef.
- Connect events to Pre-Shift Briefing, Shift Brain, Shift Organizer, EventTeam, EOD, and memory.
- Remove or isolate Event Architect demo data before treating it as production-grade.

## 8. Academy Status

Academy is real but still not fully aligned with its own doctrine. `src/data/academy/universityManifest.js` is large and content-rich. `Courses.jsx`, `LessonPlayer.jsx`, `RecommendedForVenue.jsx`, and the instructor services form a real platform. `WineAtlas` is a mature editorial experience. Academy context can be derived from Venue Bridge briefs through `academyContextService.js`.

Important principles:

- Academy completion means exposure, not proven capability.
- Venue recommendations must map to existing lessons; the service currently avoids inventing lessons.
- Bar and wine learning are intentionally separated from the generic employee course grid in `Courses.jsx`.

Risks:

- The visible course-grid/progress model still carries generic LMS gravity.
- Training is not fully connected to incidents, manager verification, Shift Brain, or operational memory.
- Assessment engine and verified capability loops remain unclear/incomplete.

## 9. Beverage Intelligence Status

Beverage/Cocktail Intelligence is one of the deepest systems. It includes Cocktail Intelligence dashboard components, AI menu generation, Bar DNA, menu audit, menu margin, narrative intelligence, visual menu builder, sales tracker, daily close, exports, rejection memory, and director chat. The backend has many `/api/ci/*` routes.

Cocktail Lab adds R&D, costing honesty, build guidance, and bar management surfaces. The dormant bar domain layer adds product schema, confidence levels, supplier references, pricing utilities, and menu engineering.

What is important:

- Preserve costing honesty. Never treat benchmark or assumption costs as verified.
- Avoid fake bottle prices, invented suppliers, or final margin claims without source-backed or venue-entered data.
- Event cocktail menus, Cocktail Lab approvals, and CI lifecycle are still not fully unified.
- CI UI should move away from “modules” and future-feature surfaces toward operational commands.

## 10. Roles and Permissions

Known roles from `src/config/roleConfig.js`:

- `employee`
- `manager`
- `bar_manager`
- `fb_director`
- `events_manager`
- `chef`
- `owner`
- `admin`

Access shape:

- Employees see employee workflow, employee shifts, academy, and cocktail magazine.
- Managers see daily ops and cocktail intelligence; event calendar is also available.
- Bar managers see bar management, cocktail intelligence, shift organizer, staff, and magazine.
- F&B Directors see bar management, cocktail intelligence, staff, chef approval, and academy.
- Events managers see event calendar and event area.
- Chefs see chef area and magazine.
- Owners see command, planning, owner intelligence, system, cocktail intelligence, venue intelligence, staff, chef approval, and magazine.
- Admin receives all nav groups through `Object.keys(NAV_GROUPS)`.

Important caveats:

- `PAGE_META` sometimes allows roles broader than `NAV_GROUPS`; actual exposure depends on both group access and page access.
- Server-side access is the real enforcement layer. Frontend navigation is not sufficient.
- Multi-venue access is enforced by backend `resolveVenueId(req)` in `requireAuth`.
- `admin` is documented as Platform Admin, not venue admin, but it bypasses most frontend and backend role gates.
- `auth_users` and `hospia_users` remain separate according to the Phase 8 doc; this is a future cleanup risk.

## 11. Existing Design and Skills Infrastructure

Existing design/docs/instructions:

- `AGENTS.md`
- `CLAUDE.md`
- `memory/project_hestia_master_memory.md`
- `docs/HESTIA_MASTER_STATE.md`
- `docs/HESTIA_ARCHITECTURE_AUDIT.md`
- `docs/HESTIA_CTO_ROADMAP.md`
- `docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md`
- `docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md`
- `docs/architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md`
- `docs/design/HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`
- `docs/academy/*`
- `docs/event-design/research/*`
- `docs/research/researches for Venue Intelligence/*`

Installed/custom skills:

- `skills/user/hestia-ui-design/SKILL.md`
- `skills/user/hestia-product-design-judgment/SKILL.md`
- `skills/user/hestia-hospitality-intelligence/SKILL.md`
- `skills/user/hestia-academy-design-curriculum/SKILL.md`
- `.agents/skills/high-end-visual-design/SKILL.md`
- `.agents/skills/imagegen-frontend-web/SKILL.md`

Skill lock:

- `skills-lock.json` tracks `high-end-visual-design` and `imagegen-frontend-web` from `Leonxlnx/taste-skill`.

Need for a custom HESTIA Skill Pack:

- Yes, but not because there are no skills. The project already has strong individual skills. The gap is orchestration: when to use which skill, in what sequence, and how to prevent skills from pushing the product toward visuals, personas, or new modules before operational truth is connected.
- A HESTIA Skill Pack should coordinate product judgment, hospitality intelligence, UI design, academy curriculum, event intelligence, beverage intelligence, and memory provenance into one pipeline.

## 12. Risks

- Generic SaaS drift: dashboards, cards, progress widgets, and module grids can dilute the hospitality OS identity.
- AI chatbot drift: Beverage Director and Venue Learning must stay embedded in workflows, not become generic chat surfaces.
- Over-designed visuals without operational truth: Owner Threshold is powerful but prototype-only; production must use real venue/session data.
- Too many personas: HESTIA, Zohar, Omer, and prototype faculties are already enough. New named agents should be rare.
- Hardcoded/fake data: Event Architect demo contamination, placeholder data files, local reference data, and prototype venue statements require separation from live operational views.
- Role leakage: frontend role access and backend route access must remain aligned; admin bypass and broad bridge-read roles should be reviewed before production.
- Performance risks: large frontend components and visual effects can hurt mobile service use; `server.js` monolith increases regression risk.
- Secrets/security risks: `.env` exists and was not inspected. Project memory documents a prior `VITE_GEMINI_API_KEY` exposure risk. Token storage is currently localStorage with a documented future httpOnly-cookie hardening phase.
- UI inconsistency: Operational dark, editorial light, magazine, academy, prototype, owner, and CI styles are not yet fully harmonized.
- Memory fragmentation: business memory, venue DNA, shift reports, incidents, event outcomes, academy progress, and recommendations are not yet one coherent memory substrate.

## 13. What Codex Should Understand Before Recommending Skills

Future Skills Pipeline Research must respect these principles:

- Read `memory/project_hestia_master_memory.md` first.
- Treat `docs/HESTIA_MASTER_STATE.md`, `docs/HESTIA_ARCHITECTURE_AUDIT.md`, and `docs/HESTIA_CTO_ROADMAP.md` as current operational truth.
- HESTIA is a Hospitality Intelligence Operating System, not a generic app category.
- Connect existing modules before recommending new modules.
- Do not recommend skills that produce generic dashboards, chatbot-first UX, fake intelligence, or decorative luxury.
- Every skill must protect data provenance: facts, observations, inferences, unknowns, confidence, and source.
- Venue is the memory unit. User is the operator. Do not blur venue memory boundaries.
- UI skills must obey `skills/user/hestia-ui-design/SKILL.md`, but visuals cannot outrun operational truth.
- Hospitality intelligence must improve guest/team behavior, not only produce attractive language.
- Academy work must treat completion as exposure, not capability.
- Beverage work must preserve costing honesty and source-backed pricing.
- Owner work must remain exception-based and avoid KPI wall drift.
- Event work must prioritize Zohar-to-department connections, pre-shift readiness, event staffing, post-event memory, and guest journey truth.
- Avoid adding new personas unless there is a role-specific workflow that truly needs one.

## 14. Recommended Next Audit

Recommended next prompt/task:

“HESTIA Skills Pipeline Research based on this audit and the attached PDF.”

## Appendix: Git and Technical Inspection

Safe git inspection:

```text
git status --short
?? .agents/
?? docs/architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md
?? "docs/research/researches for Venue Intelligence/"
?? prototypes/
?? skills-lock.json
```

```text
git log --oneline -10
89f34b7 fix: capture commercial and guest signals in venue DNA extraction
484f2a9 chore: ignore generated creative-images; track app favicon
83bc34c chore: dev proxy for creative-images and nodemon server workflow
b6caa8f feat: surface venue intelligence in Academy, Owner, and Omer
1c243ee docs: reorganize HESTIA knowledge and skills structure
44be0a1 feat: add Zohar event creative workflow
4f87f73 fix: improve venue intelligence quality routing
02a9e10 feat: Phase 8 multi-venue foundation + fix venue switch persistence
9c9b50d docs: establish HESTIA master memory authority
0ed6846 feat: event manager workflow package
```

Package scripts from `package.json`:

```text
dev: vite --host 0.0.0.0
build: vite build
server: node server.js
server:dev: nodemon --watch server.js server.js
start: concurrently "npm run server:dev" "npm run dev"
start:prod: concurrently "npm run server" "npm run dev"
hestia:check: node scripts/hestia-check.js
```

Large/high-risk files observed:

- `server.js`: about 7,490 lines, 170 Express route declarations.
- `src/content/cocktails.js`: about 257 KB.
- `src/data/academy/universityManifest.js`: about 154 KB.
- `src/features/events/utils/eventHospitalityDNA.js`: about 70 KB.
- `src/services/geminiCocktailAgent.js`: about 60 KB.
- `src/features/bar/CocktailLabStudio.jsx`: about 57 KB.
- `src/features/events/tabs/EventCocktailMenu.jsx`: about 56 KB.
- `src/features/cocktail-intelligence/CocktailIntelligenceDashboard.jsx`: about 38 KB.
- `src/features/operations/ActionBoard.jsx`: about 36 KB.
