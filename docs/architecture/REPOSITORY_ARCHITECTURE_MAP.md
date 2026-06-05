# HESTIA — Repository Architecture Map

**Date:** 2026-06-05  
**Status:** Accurate as of this audit. Must be updated when architecture changes.

> **Note (updated 2026-06-05):** Product owner has confirmed the following requirements that are NOT yet met by the current codebase. These drive the refactoring plan:
> - Backend DB must be the single source of truth. localStorage is currently the primary store for most business data — this is wrong.
> - Session token must be persisted. Current refresh forces re-login — this is wrong.
> - Every page must have a real URL. Current app has no URL routing — this is wrong.
> - Owner must be able to access the system remotely. Current app is localhost-only — this is wrong.

---

## 1. High-Level Overview

### What kind of app this is

HESTIA is a hospitality operations platform for premium venues (restaurants, bars, hotels). It serves multiple roles: manager, owner, employee, bar manager, F&B director, events manager, chef, and admin. Features include shift management, cocktail R&D, event CRM, AI-assisted cocktail generation, staff academy, bar intelligence, and owner reporting.

### Main frontend/backend structure

- **Frontend:** React 18 SPA, built with Vite, styled with Tailwind CSS
- **Backend:** Express.js (Node.js) server, single file (`server.js`)
- **Database:** SQLite via Node.js built-in `node:sqlite` (`data/hospia.sqlite`)
- **AI:** Gemini API (primary AI), OpenAI API (secondary), Replicate (image generation)
- **Email:** Nodemailer (backend) + EmailJS (frontend for legacy paths)
- **Run mode:** `concurrently` runs Vite dev server + Express server together

### Main entry points

| Entry | File | Purpose |
|-------|------|---------|
| Frontend HTML | `index.html` | Vite SPA entry |
| React root | `src/main.jsx` | Mounts `<App />` or `<GuestPortal />` based on URL |
| Main app component | `src/App.jsx` | All hooks + shell + PageRenderer |
| Backend server | `server.js` | Express + DB + all routes (6,298 lines) |

### Main runtime flow

1. User opens the app in a browser (always at `/`, except `/event/:token/guest`)
2. `main.jsx` checks `window.location.pathname` — if it matches `/event/:token/guest`, renders `GuestPortal`; otherwise renders `App`
3. `App.jsx` loads all 14 hooks
4. If `currentUser` is null → renders `LoginScreen`
5. User logs in → `login()` calls `/api/auth/login`, gets JWT token, stores in memory
6. After login, `navigate()` is called with the first allowed area/page for the user's role
7. `PageRenderer` (inside `App.jsx`) renders the active page component based on the `page` string

### Main data flow

- **State → backend:** Most writes flow through custom hooks → API clients → Express routes → SQLite
- **Backend → state:** On load, `useBackendSync` fetches reports, business memory, events, actions, users, and incidents from the server
- **Primary persistence for most features:** localStorage (operational data synced to DB opportunistically)
- **AI requests:** Frontend calls `/api/gemini` or `/api/ci/*` → server proxies to Gemini API

---

## 2. Folder-by-Folder Map

### Root level

| File/Folder | Purpose |
|------------|---------|
| `server.js` | Entire backend (6,298 lines). Monolith. |
| `index.html` | Vite HTML entry. Loads `src/main.jsx`. |
| `package.json` | NPM config — no separate client/server packages |
| `.env` / `.env.example` | Environment variables (AI keys, email creds, port) |
| `.gitignore` | Correctly ignores `.env`, `node_modules`, `dist`, `data/*.sqlite` |
| `data/` | SQLite database files. `.gitignore`d. |
| `dist/` | Vite production build output. Not committed. |
| `hospia.db` | **Stray file.** Server uses `data/hospia.sqlite`. This file is not used. |
| `response.json`, `response2.json` | **Debug output files.** Not committed but present locally. |
| `debug_director.mjs` | **Debug script.** Not used in production. |
| `seed_noir.mjs` | One-off seeding script. Not wired to any runtime. |
| `director.debug.log` | Local debug log file. |
| `PROMPT1.md` | This audit prompt. Not architecture documentation. |

### `src/`

The entire frontend lives here.

#### `src/App.jsx` (460 lines)
Composition and orchestration. Wires all 14 hooks, owns `login()` and `archiveEndOfDayReport()`, renders the shell (TopNav + SidePanel), and calls `PageRenderer`. Per CLAUDE.md rules: no `useState`, no `useEffect` should be added here. `PageRenderer` is a local function inside this file that maps page string keys to JSX.

#### `src/main.jsx`
React bootstrap. The only real URL-based routing in the entire app: checks `window.location.pathname` to see if it matches `/event/:token/guest`. Everything else renders `<App />`.

#### `src/hooks/` (14 hooks)
All application state lives here. Each hook owns its domain state, localStorage persistence effects, and domain handlers. Hooks accept cross-domain callbacks as injected parameters — they do not import other hooks.

| Hook | Domain |
|------|--------|
| `useSessionState` | Auth, users, lang |
| `useNavigationState` | Area/page navigation, sidebar collapse |
| `useNotificationState` | In-app notifications |
| `useReportsState` | Shift reports, business memory |
| `useOperationsState` | Action items, incidents, event plans, budget requests, employee requests |
| `useCocktailPipeline` | Cocktail drafts, approval, archive |
| `useStaffAcademyState` | Academy progress, lesson selection |
| `useShiftBrainState` | Shift intelligence (calls `shiftBrainService.js`) |
| `useShiftState` | Active shift, handovers, carry-forward tasks |
| `useBackendSync` | On-mount backend data fetch |
| `useOwnerPulseState` | Owner intelligence pulse and insights |
| `useEventState` | Event CRM state |
| `useCocktailIntelligenceState` | Cocktail Intelligence module state |
| `useUserManagement` | User CRUD actions |

#### `src/features/` (feature UI components)
Each subdirectory owns a product domain. Components receive props from PageRenderer — they do not import hooks.

| Subdirectory | Contents |
|-------------|---------|
| `academy/` | Courses, LessonPlayer, WineKnowledge, SOPSheets, KnowledgeLibrary, Simulation, LearningProgress, plus `instructor/` and `services/` subdirs |
| `auth/` | `LoginScreen.jsx` only |
| `bar/` | Cocktail Lab Studio, Food Cost, Library, Inventory, Bar Reports, Bottle Prices, Build Experience |
| `chef/` | Chef Dashboard, Food Menu |
| `cocktail-intelligence/` | Cocktail Intelligence Dashboard and its sub-components |
| `employee/` | Employee Home, Requests, Achievements, Service Recovery |
| `events/` | Event CRM, EventBrain, List/Detail, Creation Wizard, Guest Portal, plus `components/`, `tabs/`, `data/`, `utils/` |
| `magazine/` | Classic Cocktails Magazine — display/editorial feature |
| `operations/` | Action Board, Manager Action Center, End-of-Day, Budget, Event Orchestrator |
| `owner/` | Owner features — **also contains `_archived/`, `legacy/`, and `wip/` subdirs (dead code)** |
| `settings/` | Settings page |
| `shell/` | TopNav, SidePanel, NotificationPanel, shellUtils |
| `shift-brain/` | Pre-shift Briefing, Operational Notes |
| `shifts/` | Shift Organizer, My Shifts, Constraints Form |
| `staff/` | Staff Tab, Progression, Readiness |
| `system/` | Admin Settings, User Management, Missing Page, Settings |
| `wine-atlas/` | Full-screen Wine Atlas experience |

**Misplaced:** `src/features/system/Settings.jsx` appears to duplicate or overlap with `src/features/settings/SettingsPage.jsx`. Both are in PageRenderer under different page keys (`settings` vs no `settings` key for the system one).

**Dead folders inside `owner/`:**
- `_archived/` — 10 old component copies. Preserved per Claude.md but not wired.
- `legacy/` — 5 older component copies. Not wired to runtime.
- `wip/` — 5 work-in-progress copies + WipPageTemplate. Not wired to runtime.

#### `src/services/`
Backend communication, AI agents, business services.

| File/Folder | Purpose |
|------------|---------|
| `api/client.js` | Fetch wrapper. All API requests go through this. Handles JWT token injection. |
| `api/actionsApi.js` | Actions API client |
| `api/cocktailIntelligenceApi.js` | CI module API client |
| `api/eventsApi.js` | Events API client |
| `api/reportsApi.js` | Reports API client |
| `api/sessionApi.js` | Login/logout API |
| `api/shiftsApi.js` | Shifts API |
| `api/tasksApi.js` | Tasks API |
| `api/verifiedPricesApi.js` | Verified prices API |
| `geminiCocktailAgent.js` | **1,164 lines.** The AI cocktail generation engine. Builds prompts, calls backend proxy, normalizes responses, handles fallbacks. |
| `authService.js` | Session persistence helpers (localStorage) |
| `academyService.js` | Academy data helpers |
| `cocktailMenuDesignService.js` | Cocktail menu design logic |
| `cocktailService.js` | Cocktail data helpers |
| `email/emailjsClient.js` | EmailJS integration |
| `eventCocktailMenuService.js` | Event cocktail menu service |
| `notificationService.js` | Notification helpers |
| `ownerInsightService.js` | Owner insight helpers |
| `pendingSyncQueue.js` | Offline queue for failed API writes |
| `reportService.js` | Report helpers |
| `shiftBrainService.js` | **Deterministic shift intelligence engine** |
| `taskService.js` | Task helpers |
| `userService.js` | User helpers (client-side auth and CRUD) |
| `venueService.js` | Venue helpers |
| `prompts/hestiaCocktailMenuSkill.js` | Frontend-side AI prompt definition for menu design |

#### `src/config/`
| File | Purpose |
|------|---------|
| `systemConfig.js` | STORAGE keys, EMAILJS config, API_BASE — **this is the canonical config** |
| `navigationConfig.js` | NAV_GROUPS, PAGE_META — all page routing metadata |
| `roleConfig.js` | Role access rules, permission checks |
| `featureFlags.js` | Feature toggles (all currently `false` except CI features enabled by default) |
| `accessCodes.js` | Appears to be an older file for code-based auth |
| `emailjs.js` | Another EmailJS config (appears separate from `config/emailjs.js`) |
| `textConfig.js` | i18n text strings |

#### `src/data/`
Static/reference data and compatibility shims.

| File | Status |
|------|--------|
| `systemConfig.js` | Compatibility re-export shim → points to `src/config/` |
| `universityManifest.js` | Re-export shim → `src/data/academy/universityManifest.js` |
| `academy/universityManifest.js` | **Real manifest** — the authoritative file |
| `academy/*.js` | Doctrine files (service, hospitality, behavioral science, etc.) |
| `cocktails.js` | Reference cocktail list. Marked "MIGRATED TO SQLITE — keep as fallback only." |
| `cocktailLab.js` | Cocktail lab reference data |
| `courses.js` | Reference courses data |
| `events.js` | Reference events data |
| `operations.js` | Reference operations data |
| `staff.js` | Reference staff data |
| `businessMemory.js` | Business memory reference |

#### `src/content/`
| File | Purpose |
|------|---------|
| `cocktails.js` | Magazine cocktails with image imports. Different from `src/data/cocktails.js`. Used for the classic cocktail magazine. |

#### `src/domain/`
Pure domain vocabulary. No runtime behavior.
- `hospitality/` — Hospitality ontology (entities, relationships, events, memory, loops, agents, data model)
- `hospitality/bar/` — Bar product schemas, pricing engine, cocktail knowledge base, supplier map, confidence levels

#### `src/prototypes/`
| File | Status |
|------|--------|
| `academyVideoInstructor/` | **Prototype not wired to production.** 11 files including components, CSS, data, and README. Safe to archive. |

#### `src/components/`
| File | Purpose |
|------|---------|
| `AppPrimitives.jsx` | Shared UI primitives |
| `ui/index.jsx` | UI component exports |
| `ui/README.md` | UI component docs |

#### `src/lib/`
| File | Purpose |
|------|---------|
| `storage.js` | localStorage abstraction |

#### `src/utils/`
| File | Purpose |
|------|---------|
| `format.js` | Formatting utilities (`cx`, date, etc.) |
| `academy.js` | Academy utilities |
| `emailjs.js` | EmailJS utility |
| `requestStatus.jsx` | Request status utilities |

#### `src/prompts/`
| File | Purpose |
|------|---------|
| `eventPrompts.js` | AI prompt builders for event features |
| `geminiCocktailPrompts.js` | Gemini cocktail prompt constants (few-shot examples, system prompt) |

#### `src/i18n/`
English and Hebrew text strings. i18n infrastructure is present but usage is partial.

---

## 3. Page and Routing Architecture

### How navigation works

Navigation is **internal state only** — there is no URL routing library (no React Router, no TanStack Router). The URL in the browser **never changes** from `/` regardless of which page the user is on.

Navigation state is managed by `useNavigationState`:
- **`area`** — the top-level section (e.g., `operations`, `barManagement`, `academy`)
- **`page`** — the specific page key within the area (e.g., `actionBoard`, `cocktailLab`, `courses`)
- Both are persisted to `localStorage` via `hospia.area` and `hospia.page` keys
- `goToPage(pageKey, context)` — the primary navigation function
- `goToArea(areaKey)` — navigates to the first allowed page within an area

### What happens on browser refresh

1. `currentUser` is `null` (JWT token is in-memory only, not persisted)
2. LoginScreen is shown — user must re-authenticate
3. After login, `area` and `page` are restored from localStorage → user lands on their previous page
4. **Net effect:** refresh = forced re-login, but navigation position is preserved

The behavior is not ideal. The app behaves like a single-page "kiosk" where refresh is a soft reset.

### All pages and their areas

There are **57 page keys** defined in `PAGE_META`. Key groupings:

| Area | Pages |
|------|-------|
| `command` | operationalPulse, budgetApprovals, ownerOperationalRequests, weeklySummary, ownerReport, businessMemory, userManagement, settings |
| `operations` | preShiftBriefing, actionBoard, managerActionCenter*, managerEmployeeRequests, operationalNotes, endOfShiftReview*, budgetRequest, eventBrain* |
| `dailyOps` | endOfDay, ciDashboard |
| `employeeWorkflow` | employeeHome, employeeRequests, employeeAchievements, serviceRecovery |
| `employeeShifts` | myShifts, constraintsForm, foodMenuView |
| `academy` | courses, lessonPlayer*, knowledgeLibrary*, wineKnowledge, sopSheets*, simulation, approvedCocktails |
| `barManagement` | cocktailLab, foodCostTables, approvedCocktailsBar, cocktailLibrary, inventoryOverview, barReports, bottlePrices |
| `cocktailIntelligence` | ciDashboard |
| `eventsArea` | eventCRM, eventOrchestrator |
| `staffArea` | staffTab, staffProgression |
| `shiftOrganizer` | shiftOrganizerPage |
| `chefArea` | chefDashboard |
| `cocktailsMagazineArea` | cocktailsMagazine |
| `ownerIntelligence` | executiveOverview*, businessMRI*, profitLeaks*, strategicRecommendations* |

*Hidden in nav (`hiddenInNav: true`) or behind feature flags

### Real URL routes

Only two URLs are handled as real browser URLs:

| URL Pattern | Handled in | Component |
|------------|-----------|-----------|
| `/` (and anything else) | `main.jsx` | `<App />` |
| `/event/:token/guest` | `main.jsx` (pathname check) | `<GuestPortal />` |
| `/event/:token/guest` | `server.js` line 3394 | Serves the SPA HTML for this path |

### What breaks or resets on refresh

- **Session:** User must log in again (JWT is in-memory)
- **Page context:** `pageContext` (used for drill-down state like "open cocktail lab for this event") is lost
- **WineAtlas:** Full-screen WineAtlas state is lost
- **Notification panel state:** Lost
- **AI generation state:** Any in-progress AI output is lost
- **What survives:** Area/page position, all localStorage-persisted operational data

### Where routing should be improved

The main gap is that the URL never reflects the current page. This means:
- Users cannot share links to specific pages
- Browser back/forward buttons do not work within the app
- Refresh requires re-login
- Deep-link navigation (e.g., "go to event #123 seating tab") requires storing both the page AND the context object, which is currently lost on refresh

---

## 4. Component Architecture

### Large components doing too much

| Component | Lines | Issues |
|-----------|-------|--------|
| `src/App.jsx` | 460 | Acceptable per CLAUDE.md. All logic is orchestration only. |
| `src/services/geminiCocktailAgent.js` | 1,164 | Very large. Mixes prompt building, AI calling, response normalization, fallback generation, and menu analysis. |
| `server.js` | 6,298 | Extreme monolith. Every API route, DB schema, AI proxy, auth, and email logic in one file. |
| `src/features/events/EventCRM.jsx` | Likely large | Events module is complex — multiple tabs, CRM, seating, messages |
| `src/features/cocktail-intelligence/CocktailIntelligenceDashboard.jsx` | Likely large | CI Dashboard aggregates many sub-panels |

### Components that mix UI + business logic

- Some feature components in `src/features/operations/` contain business rules inline (formatting logic, status calculations)
- `src/features/events/EventBrain.jsx` — AI-powered simulation component; likely mixes API calls with rendering
- `src/features/cocktail-intelligence/MenuGenerator.jsx` — likely calls AI and renders result in one component
- `src/features/academy/services/` — service files are correctly separated

### Good patterns to preserve

- Hook architecture (`src/hooks/`) is clean and well-separated
- `src/services/api/` — thin API clients are well-organized
- `src/domain/hospitality/` — pure ontology layer with no runtime side effects
- `src/services/shiftBrainService.js` — deterministic intelligence kept separate from UI
- `PageRenderer` pattern — centralized page routing map is easy to understand

### Duplicated components / patterns

- `src/features/system/Settings.jsx` and `src/features/settings/SettingsPage.jsx` — two settings components, both accessible via different mechanisms
- `src/features/owner/_archived/`, `legacy/`, and `wip/` — contain duplicate versions of all owner components
- `src/prototypes/academyVideoInstructor/` contains prototype versions of instructor components that are also in `src/features/academy/instructor/`

---

## 5. Services and Business Logic

### Service files

| File | Purpose | Status |
|------|---------|--------|
| `src/services/shiftBrainService.js` | Deterministic shift intelligence | Active |
| `src/services/geminiCocktailAgent.js` | AI cocktail generation | Active — very large |
| `src/services/cocktailMenuDesignService.js` | Cocktail menu design | Active |
| `src/services/eventCocktailMenuService.js` | Event cocktail menu | Active |
| `src/services/ownerInsightService.js` | Owner insight generation | Active |
| `src/services/reportService.js` | Report helpers | Active |
| `src/services/authService.js` | Session persistence | Active |
| `src/services/userService.js` | Client-side user auth | Active |
| `src/services/academyService.js` | Academy data | Active |
| `src/services/cocktailService.js` | Cocktail data | Active |
| `src/services/taskService.js` | Task data | Active |
| `src/services/venueService.js` | Venue data | Active |
| `src/services/notificationService.js` | Notifications | Active |
| `src/services/pendingSyncQueue.js` | Offline write queue | Active |
| `src/services/email/emailjsClient.js` | Email sending | Active |
| `src/services/prompts/hestiaCocktailMenuSkill.js` | AI menu skill prompt | Active |

### Where business logic currently lives

- **Good:** Deterministic intelligence in `shiftBrainService.js`
- **Good:** Prompt building in `geminiCocktailAgent.js` (though the file is too large)
- **Mixed:** Some formatting and status logic lives inside feature components
- **Mixed:** Some event logic is inline in `EventBrain.jsx` and event tab components
- **Needs extraction:** The `geminiCocktailAgent.js` mixes at least 5 concerns: menu analysis, prompt building, AI calling, response normalization, and fallback generation

### AI-related logic

| Location | What it does |
|----------|-------------|
| `src/services/geminiCocktailAgent.js` | Cocktail generation prompts, normalization, fallbacks |
| `src/prompts/geminiCocktailPrompts.js` | Few-shot examples and system prompts |
| `src/prompts/eventPrompts.js` | Event AI prompt builders |
| `src/services/prompts/hestiaCocktailMenuSkill.js` | Menu design skill prompt |
| `server.js` `askGemini()` | Gemini API proxy function |
| `server.js` `HESTIA_COCKTAIL_MENU_SKILL` | Full menu design system prompt (duplicate of frontend prompt) |
| `server.js` `/api/gemini` | AI proxy endpoint |
| `server.js` `/api/ci/generate` | CI cocktail generation endpoint |
| `server.js` `/api/owner/insights` | Owner AI insight endpoint |

**Issue:** The `HESTIA_COCKTAIL_MENU_SKILL` prompt is defined both in `server.js` and in `src/services/prompts/hestiaCocktailMenuSkill.js`. These are duplicates and must stay in sync manually.

---

## 6. State and Persistence

### State types

| State | Location | Persisted how |
|-------|----------|--------------|
| `currentUser` | `useSessionState` → React state | NOT persisted. Lost on refresh. |
| JWT token | `src/services/api/client.js` module variable | NOT persisted. Lost on refresh. |
| `area`, `page` | `useNavigationState` → localStorage | Survives refresh |
| `collapsed` (sidebar) | `useNavigationState` → localStorage | Survives refresh |
| `users` list | `useSessionState` → localStorage (`hospia.users`) | Survives refresh |
| `reportArchive` | `useReportsState` → localStorage | Survives refresh |
| `businessMemory` | `useReportsState` → localStorage | Survives refresh |
| `actionItems` | `useOperationsState` → localStorage | Survives refresh |
| `budgetRequests` | `useOperationsState` → localStorage | Survives refresh |
| `serviceIncidents` | `useOperationsState` → localStorage | Survives refresh |
| `employeeRequests` | `useOperationsState` → localStorage | Survives refresh |
| `cocktailDrafts` | `useCocktailPipeline` → localStorage | Survives refresh |
| `approvedCocktails` | `useCocktailPipeline` → localStorage | Survives refresh |
| `academyProgress` | `useStaffAcademyState` → localStorage | Survives refresh |
| `shiftNotes` | `useShiftBrainState` → React state | Lost on refresh |
| `activeShift` | `useShiftState` → SQLite via API | Fetched from backend |
| Event CRM data | `useEventState` → SQLite via API | Fetched from backend |
| CI module data | `useCocktailIntelligenceState` → SQLite via API | Fetched from backend |

### What state must survive refresh

- Authentication session (currently does not — requires re-login)
- Current page location (currently survives via localStorage)
- All operational data (reports, actions, incidents, cocktails) — currently survives via localStorage

### What state should not survive refresh

- Notification panel open/closed state
- AI generation in-progress state
- Transient modal state

### Fragile or duplicated persistence logic

- `useBackendSync` syncs on mount, pulling server data into localStorage-backed state. If server data conflicts with localStorage, the merge behavior is not always explicit.
- `pendingSyncQueue` handles failed writes to the backend, but the queue is localStorage-backed and could theoretically conflict with backend state after an extended offline period.
- The `users` list is stored in localStorage via `useSessionState` but also fetched from the backend. These can become inconsistent.
- `hospia.users` in localStorage stores users with hashed passwords or plain-text data — this should not be in localStorage.

---

## 7. Backend/API Architecture

### Server entry point

`server.js` — single file, 6,298 lines. Runs on Node.js with ESM modules. Uses the native `node:sqlite` module (Node 22+ required).

### Database

- **Engine:** SQLite via `node:sqlite` (built into Node.js 22+)
- **File:** `data/hospia.sqlite`
- **Schema:** Defined inline in `server.js` via `db.exec()` with `CREATE TABLE IF NOT EXISTS`
- **Tables:** 30+ tables including venues, users, shifts, actions, incidents, events, event_guests, event_tables, cocktails, cocktail_pricing, courses, staff_progress, notifications, auth_users, sessions, verified_price_overrides, and 9 cocktail intelligence tables

### API routes

All routes are prefixed `/api/`. Major route groups:

| Group | Routes |
|-------|--------|
| Auth | `POST /api/auth/login`, `POST /api/auth/logout` |
| AI proxy | `POST /api/gemini` |
| Shift reports | `GET/POST /api/shift-reports` |
| Actions | `GET/POST/PATCH /api/actions/:id` |
| Incidents | `GET/POST/PATCH /api/incidents/:id` |
| Business memory | `GET/POST /api/business-memory` |
| Notes | `GET/POST/PATCH /api/notes/:id` |
| Shifts | `GET/POST /api/shifts`, plus briefing/close/handover sub-routes |
| Tasks | `GET/POST/PATCH /api/tasks/:id` |
| Users | `GET/POST/PATCH /api/users/:id` |
| Admin users | `GET/POST/PUT/PATCH/DELETE /api/admin/users/:id` |
| Cocktails | Full CRUD `/api/cocktails/:id` |
| Ingredients | `GET/POST/PUT /api/ingredients/:id` |
| Courses/progress | `GET/POST /api/courses`, `GET/POST /api/staff-progress/:user_id` |
| Owner | `GET /api/owner/pulse`, `/api/owner/trends`, `POST /api/owner/insights` |
| Events (full) | `GET/POST/PATCH/DELETE /api/events/:id` + guests, tables, tasks, timeline, messages, cocktail-menu sub-routes |
| Guest portal | `GET /api/guest-portal/:token`, `POST /api/guest-portal/:token/rsvp` |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/:id/read` |
| Verified prices | `GET/POST/DELETE /api/verified-price-overrides/:product_id` |
| CI module | 20+ routes under `/api/ci/` |
| Bar | `GET /api/bar/profit-alerts` |
| Health | `GET /api/health` |

### Auth pattern

`requireAuth(...allowedRoles)` middleware validates JWT bearer token from `sessions` table in SQLite. Sessions expire after 24 hours. The middleware is correctly applied to almost all routes.

**Issues:**
- `requireAuth()` called with no args allows any authenticated role to access certain routes (`/api/cocktails`, `/api/cocktails/:id`, `/api/courses`, etc.)
- No rate limiting on any route, including AI proxy endpoints

### Security patterns

- CORS is locked to localhost origins only (correct for local dev)
- JWT token is validated server-side against the DB (not stateless)
- Password hashing uses bcrypt
- AI keys are server-side only (with one exception noted in §8)

### Routes that are unclear or risky

- `GET /api/cocktails` with `requireAuth()` (no role) — any logged-in user can read all cocktails
- `POST /api/ci/generate` — no rate limiting; could exhaust Gemini quota
- `GET /api/health` — no auth (intentional, but exposes server info)

---

## 8. Security and Environment Review

### Secrets and credentials found

The `.env` file contains real, live credentials. The file is correctly `.gitignore`d and should not be committed.

**Critical issue — `VITE_GEMINI_API_KEY`:**
The `.env` file contains a variable named `VITE_GEMINI_API_KEY`. Vite embeds ALL `VITE_*` prefixed variables from `.env` into the compiled frontend JavaScript bundle. This means the Gemini API key is accessible to any browser user who loads the app and inspects the bundle or network requests.

The server's `askGemini()` function reads this variable at `process.env.VITE_GEMINI_API_KEY` — this works server-side. However, `geminiCocktailAgent.js` also reads `import.meta.env?.VITE_GEMINI_API_KEY` client-side (as a configuration check gate), which confirms the key is bundled into the frontend.

**Recommendation:** Rename `VITE_GEMINI_API_KEY` to `GEMINI_API_KEY` in `.env`. Update `server.js` `askGemini()` to read only `process.env.GEMINI_API_KEY`. Update `geminiCocktailAgent.js` to remove the client-side key check — the client should simply call the backend and let the backend validate the key is configured. **Rotate the Gemini key after fixing.**

**Other credentials:**
- `OPENAI_API_KEY` — server-only (`process.env.OPENAI_API_KEY`). Safe if `.env` stays out of git.
- `GEMINI_API_KEY` — server-only. Safe.
- `REPLICATE_API_TOKEN` — server-only. Safe.
- `EMAIL_USER` / `EMAIL_PASS` — server-only. Safe.

**EmailJS credentials in `src/config/systemConfig.js`:**
The `EMAILJS` object includes `publicKey`, `serviceId`, and `templateId`. These are bundled into the frontend. The EmailJS `publicKey` is designed to be public (it's a browser-facing SDK). However, a malicious actor could use these values to send emails from your EmailJS service. Consider whether this exposure is acceptable or whether EmailJS sending should be routed through the backend instead.

### Other security notes

- No rate limiting on AI proxy endpoints — a user could exhaust Gemini quota through repeated requests
- `hospia.db` in the root directory is a stray SQLite file. It is not used by the server and should be deleted
- `response.json` and `response2.json` in the root may contain API response data. These should not be committed

---

## 9. Build / Dev / Deployment

### Scripts

```
npm run dev      → vite --host 0.0.0.0 (Vite dev server on 5173)
npm run build    → vite build (outputs to dist/)
npm run server   → node server.js (Express on port 3001, default)
npm run start    → concurrently runs server + dev
```

### Runtime assumptions

- Node.js 22+ required (uses `node:sqlite`, a built-in module only available in Node 22+)
- Vite dev server and Express server both run in development (`concurrently`)
- In production, the Vite `dist/` output would need to be served separately (the Express server does NOT currently serve the `dist/` folder — there is no `app.use(express.static('dist'))` in `server.js`)
- The app is currently a local-development-only tool with no production deployment setup

### Risky areas in build/dev setup

- No `dist/` static serving in `server.js` — production build cannot be served without additional configuration
- `package.json` has no separate `server` package — the same `package.json` controls both frontend and backend
- `openai` package is in `dependencies` even though OpenAI appears to be legacy/unused in current AI flows (Gemini is primary)

---

## 10. Architecture Strengths

- **Hook architecture** is clean and well-enforced. State ownership is clear.
- **`src/services/api/`** — thin, typed API clients are good separation.
- **`src/domain/hospitality/`** — pure ontology layer is a good design foundation.
- **`shiftBrainService.js`** — deterministic intelligence correctly separated from UI.
- **Feature flags** — present and centralized, easy to toggle.
- **`PAGE_META` and `NAV_GROUPS`** — single source of truth for navigation and access control.
- **Role-based access** — `requireAuth(...allowedRoles)` is consistently applied on the backend.
- **`PageRenderer` pattern** — centralized, readable mapping of page keys to components.
- **`.gitignore`** correctly excludes `.env`, `node_modules`, `dist`, `data/*.sqlite`.
- **SQLite schema** uses `CREATE TABLE IF NOT EXISTS` — server startup is idempotent.

---

## 11. Architecture Risks

1. **`server.js` monolith** — At 6,298 lines, this file is unmaintainable. Any modification requires understanding the entire file context. A bug in one section can silently affect another. Testing is impossible without running the full server.

2. **No real URL routing** — The app cannot be bookmarked, shared as links, or navigated with browser back/forward. This will become a user experience and operational gap as features grow.

3. **Session not persisted** — Every refresh requires re-login. This is a significant UX friction, especially on mobile.

4. **localStorage as primary data store** — Most operational data (reports, actions, incidents, cocktails) lives in localStorage. This data is per-browser and per-device. If a user switches browsers or clears storage, data is lost. There is no guarantee that localStorage and the SQLite DB are in sync.

5. **`VITE_GEMINI_API_KEY` exposure** — Live Gemini key is bundled into the frontend (see §8). High priority fix.

6. **No rate limiting** — AI endpoints have no rate limiting or token budgets. A single user could exhaust API quota.

7. **`geminiCocktailAgent.js` is 1,164 lines** — This file will become increasingly difficult to maintain. It mixes prompt building, API calling, response normalization, and fallback generation.

8. **Duplicate AI prompt** — `HESTIA_COCKTAIL_MENU_SKILL` exists in both `server.js` and `src/services/prompts/hestiaCocktailMenuSkill.js`. They will drift out of sync.

9. **No production deployment path** — Express server does not serve the built frontend. There is no Docker setup, no process manager (PM2, etc.), and no production environment configuration.

10. **Dead code accumulation** — `_archived/`, `legacy/`, and `wip/` folders in `src/features/owner/` contain 20+ unused component files. `src/prototypes/` contains a full prototype not wired to production.
