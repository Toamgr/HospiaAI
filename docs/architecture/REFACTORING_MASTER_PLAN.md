# HESTIA — Refactoring Master Plan

**Date:** 2026-06-05 (updated with product owner answers)  
**Based on:** `REPOSITORY_ARCHITECTURE_MAP.md`  
**Constraint:** Do not redesign the UI. Do not rewrite from scratch. Refactor incrementally. Keep all working features intact.

---

## Product Owner Requirements (confirmed 2026-06-05)

These answers define the direction of the entire refactoring effort.

| Requirement | Answer |
|-------------|--------|
| Refresh behavior | User must return to exact page — no re-login on refresh |
| Shareable page URLs | Yes — links to specific pages, events, reports must work |
| Session duration | Stay logged in until 30 min of idle (no interaction). Backend token stays valid longer. |
| Multi-device data | All devices show same data per role — backend is single source of truth |
| localStorage | Only for UI preferences (sidebar state, language) — not for business data |
| Multi-venue | Architecture must support multi-venue from the start |
| Audit trail | Required for: approved menus, schedules, bottle prices, event plans, operational records |
| Approved records | Must not be silently overwritten — versioning or audit log required |
| Employee mobile | Phone-friendly employee area — shifts, availability, academy, tasks |
| Owner remote access | Owner must access HESTIA from anywhere — production deployment required |

---

## 1. Refactoring Goals

1. **Real URL routing** — every page has a browser URL. Shareable links work.
2. **Refresh-safe sessions** — browser refresh returns user to their page without re-login
3. **30-minute idle timeout** — active sessions stay open; inactive sessions auto-logout
4. **Backend as single source of truth** — remove localStorage as primary data store for business data
5. **Multi-device data** — same data on all devices for the same user
6. **Production deployment path** — owner can access HESTIA remotely
7. **Audit trail for critical records** — track who changed what, when
8. **Cleaner folder structure** — dead code removed, prototypes archived
9. **Server.js split** — break the 6,298-line monolith into route modules
10. **Security fix** — remove `VITE_GEMINI_API_KEY` exposure (Phase 1)

---

## 2. Target Architecture

```
HOSPIA_LOCAL_APP/
├── server/                   ← NEW: split server.js into modules
│   ├── index.js              ← minimal entry (start, listen, middleware)
│   ├── db/
│   │   └── schema.js         ← all CREATE TABLE statements
│   ├── middleware/
│   │   ├── auth.js           ← requireAuth, session validation, idle check
│   │   └── cors.js           ← CORS configuration
│   ├── routes/
│   │   ├── auth.js           ← /api/auth/login, /api/auth/logout, /api/auth/refresh
│   │   ├── shifts.js
│   │   ├── actions.js
│   │   ├── incidents.js
│   │   ├── events.js
│   │   ├── cocktails.js
│   │   ├── academy.js
│   │   ├── users.js
│   │   ├── owner.js
│   │   ├── ci.js
│   │   ├── verifiedPrices.js
│   │   ├── notifications.js
│   │   └── aiProxy.js
│   └── ai/
│       └── gemini.js         ← askGemini() helper
│
├── src/
│   ├── App.jsx               ← unchanged
│   ├── main.jsx              ← add React Router root
│   ├── routes/
│   │   └── AppRoutes.jsx     ← NEW: URL route definitions
│   ├── hooks/                ← largely unchanged; session hook updated for persistence
│   ├── features/             ← unchanged; dead code removed from owner/
│   ├── services/             ← unchanged
│   ├── config/               ← unchanged
│   ├── domain/               ← unchanged
│   ├── data/                 ← clean up shims
│   ├── components/           ← unchanged
│   ├── lib/                  ← unchanged
│   ├── utils/                ← unchanged
│   ├── prompts/              ← unchanged
│   └── i18n/                 ← unchanged
│
├── docs/
├── .env                      ← fix VITE_GEMINI_API_KEY → GEMINI_API_KEY
├── .env.example              ← updated
└── package.json
```

---

## 3. Routing Plan

### Current state

Navigation is internal state only. The URL is always `/` regardless of page. Only `/event/:token/guest` is a real URL.

### Target state

Add **React Router v6** for real browser URLs. The existing `area`/`page` navigation system remains as the access control layer. React Router handles the URL; the navigation hooks handle who is allowed to see what.

### URL scheme

| URL | Page key | Notes |
|-----|----------|-------|
| `/login` | LoginScreen | Always accessible |
| `/` | Redirect to role home | |
| `/ops/briefing` | preShiftBriefing | |
| `/ops/actions` | actionBoard | |
| `/ops/requests` | managerEmployeeRequests | |
| `/ops/notes` | operationalNotes | |
| `/ops/budget` | budgetRequest | |
| `/ops/close` | endOfDay | |
| `/bar/lab` | cocktailLab | |
| `/bar/costs` | foodCostTables | |
| `/bar/library` | cocktailLibrary | |
| `/bar/menu` | approvedCocktailsBar | |
| `/bar/inventory` | inventoryOverview | |
| `/bar/reports` | barReports | |
| `/bar/prices` | bottlePrices | |
| `/academy/courses` | courses | |
| `/academy/lesson/:courseId/:lessonId` | lessonPlayer | IDs in URL |
| `/academy/wine` | wineKnowledge | |
| `/academy/simulation` | simulation | |
| `/academy/cocktails` | approvedCocktails | |
| `/events` | eventCRM | |
| `/events/:id` | eventCRM with eventId | Event in URL |
| `/events/:id/:tab` | eventCRM with tab | Tab in URL |
| `/events/finance` | eventOrchestrator | |
| `/intelligence` | ciDashboard | |
| `/employee` | employeeHome | |
| `/employee/requests` | employeeRequests | |
| `/employee/achievements` | employeeAchievements | |
| `/employee/recovery` | serviceRecovery | |
| `/shifts` | myShifts | |
| `/shifts/organizer` | shiftOrganizerPage | |
| `/shifts/constraints` | constraintsForm | |
| `/owner` | operationalPulse | |
| `/owner/approvals` | budgetApprovals | |
| `/owner/requests` | ownerOperationalRequests | |
| `/owner/reports` | ownerReport | |
| `/owner/memory` | businessMemory | |
| `/staff` | staffTab | |
| `/staff/progression` | staffProgression | |
| `/chef` | chefDashboard | |
| `/magazine` | cocktailsMagazine | |
| `/settings` | settings / userManagement | |
| `/event/:token/guest` | GuestPortal | Already working — preserve exactly |

### What belongs in URL vs localStorage vs backend

| Data | Where | Reason |
|------|-------|--------|
| Current page | URL path | Shareable, bookmarkable, refresh-safe |
| Selected event ID | URL param `/events/:id` | Shareable, refresh-safe |
| Selected lesson | URL params | Refresh-safe |
| Sidebar collapsed state | localStorage | UI preference only |
| Language preference | localStorage | UI preference only |
| All business/operational data | Backend DB | Multi-device, source of truth |
| JWT token | localStorage or httpOnly cookie | Needed for refresh-safe session |
| User session (currentUser) | Restored from token on load | Not stored independently |

---

## 4. Session Design (30-minute idle timeout)

### How it works

- On login: server creates a session token with a long expiry (e.g., 7 days)
- Token is stored in localStorage (or httpOnly cookie for better security — decide in implementation)
- On app load: if a valid token exists in storage, silently restore the session without requiring login
- On every user interaction: reset a client-side idle timer
- If idle timer reaches 30 minutes with no interaction: auto-logout (clear token, navigate to `/login`)
- The server session remains valid until it expires or is explicitly revoked — the idle timeout is enforced client-side

### Key change from current behavior

- **Current:** Token is in-memory only → every refresh forces re-login
- **Target:** Token is stored → refresh restores session automatically, user lands on their last page

### What counts as "interaction"
Mouse movement, key press, tap on mobile, form input, navigation click — any user-initiated event.

---

## 5. Data Architecture (Backend as Source of Truth)

### Current problem

Most operational data is localStorage-first. The backend is a secondary sync. This means:
- Data is different on different devices
- Data is lost if localStorage is cleared
- There is no guarantee of consistency

### Target data architecture

| Data type | Storage | Sync strategy |
|-----------|---------|--------------|
| Shift reports | SQLite only | Write to backend immediately |
| Action items | SQLite only | Write to backend immediately |
| Service incidents | SQLite only | Write to backend immediately |
| Cocktail drafts | SQLite only | Write to backend immediately |
| Approved cocktails | SQLite only | Write to backend immediately |
| Academy progress | SQLite only | Write to backend immediately |
| Events, guests, tasks | SQLite only | Already backend-first |
| Business memory | SQLite only | Write to backend immediately |
| Employee requests | SQLite only | Write to backend immediately |
| Budget requests | SQLite only | Write to backend immediately |
| Shift notes (operational notes) | SQLite only | Write to backend immediately |
| Owner notes | SQLite only | Write to backend immediately |
| Sidebar collapsed | localStorage only | UI preference |
| Language | localStorage only | UI preference |
| JWT token | localStorage | Session only |

### Migration strategy

Each hook (`useOperationsState`, `useCocktailPipeline`, `useReportsState`, etc.) must be updated:
- Remove `localStorage.setItem` calls for business data
- Replace initial state from `localStorage.getItem` with a backend API fetch
- Keep a local React state cache for performance (re-fetch on mount, write-through to backend)
- Remove the `useBackendSync` hook once all hooks are backend-first (it becomes redundant)

### Offline/bad internet handling

- Important forms must preserve draft input in component state (not lost on re-render)
- Show clear error when a write fails — do not silently discard
- Do not create duplicate records on retry
- The `pendingSyncQueue.js` pattern can remain as a write buffer for failed backend calls

---

## 6. Module Preservation Order

Based on product owner confirmation, refactoring touches modules in this order (safest first, most critical last):

### Touch first (low risk, need cleanup)
1. Dead code in `src/features/owner/_archived/`, `legacy/`, `wip/`
2. Stray files: `hospia.db`, `response.json`, debug scripts
3. Security fix: `VITE_GEMINI_API_KEY`

### Touch in middle phases (structural improvement)
4. Routing and session (App.jsx + useNavigationState + useSessionState)
5. Operations module (preShiftBriefing, actionBoard, endOfDay)
6. Employee module (employeeHome, myShifts, constraintsForm)
7. Owner module (operationalPulse, reports, memory)
8. Staff and chef modules
9. Server.js split

### Touch last (highest preservation priority)
These modules must be refactored ONLY in structure (import paths, routing integration). Their internal logic and UI must not change.

10. Daily Loop (shift open/close/handover) — non-interruptible workflow
11. Cocktail Lab and Event Cocktail Menu Builder
12. Bottle Pricing and Verified Prices
13. Academy Instructor
14. EventBrain
15. Wine Academy — DO NOT REDESIGN
16. Classic Cocktail Magazine — DO NOT REDESIGN

---

## 7. Audit Trail Plan

Certain operational changes must be logged. The existing `event_timeline` table is the model.

### Tables that need audit trail

| Table | Events to track |
|-------|----------------|
| `approved cocktails` / `event_cocktail_menus` | Approved, changed, revoked |
| `employee_weekly_schedules` | Created, published, modified after publication |
| `verified_price_overrides` | Already has `verified_price_audit_log` — ensure it's used |
| `event_plans` | Created, updated, finalized |
| `auth_users` | Role changes, password resets, account disable |
| `food_menus` | Status changes (draft → pending → published) |

### Implementation approach

Extend the existing `verified_price_audit_log` pattern. For each auditable table, add a route-level audit write inside the PATCH/POST handlers. The audit write captures: `actor` (from req.user), `action`, `entity_type`, `entity_id`, `old_value` (JSON), `new_value` (JSON), `created_at`.

This is Phase 5 work — do not implement in early phases.

---

## 8. Production Deployment Plan

The owner needs remote access. This requires:

1. **Express serves the built frontend:**
   ```js
   if (process.env.NODE_ENV === 'production') {
     app.use(express.static(path.join(__dirname, '../dist')))
     app.get('*', (req, res) => {
       if (req.path.startsWith('/api/')) return next()
       res.sendFile(path.join(__dirname, '../dist/index.html'))
     })
   }
   ```

2. **Environment variables for production:** A `.env.production` or deployment environment with production-safe values.

3. **Process manager:** PM2 or similar to keep the server running.

4. **Domain/hosting:** Not specified — to be decided by product owner. Options: VPS (DigitalOcean, Linode), cloud (Railway, Render, Fly.io).

This is Phase 7 work. The full deployment setup is outside the scope of the current refactoring but the code must be production-ready by end of Phase 7.

---

## 9. File Cleanup Plan

### Stray files to remove (Phase 1)

| File | Action |
|------|--------|
| `hospia.db` (root) | Delete — server uses `data/hospia.sqlite` |
| `response.json` | Delete — local debug output |
| `response2.json` | Delete — local debug output |
| `debug_director.mjs` | Delete — debug script |
| `director.debug.log` | Delete — log file |
| `tmphestia-atlas-whispers/` | Delete — stray temp directory |

### Dead source code to archive (Phase 2)

| File/Folder | Action |
|------------|--------|
| `src/features/owner/_archived/` | Rename to `_archive/`. Keep files. |
| `src/features/owner/legacy/` | Move into `_archive/` |
| `src/features/owner/wip/` | Move into `_archive/` |
| `src/prototypes/academyVideoInstructor/` | Move to `docs/archive/prototypes/` |
| `seed_noir.mjs` | Move to `docs/archive/scripts/` |

### Files too large to maintain (Phase 4)

| File | Action |
|------|--------|
| `server.js` (6,298 lines) | Split into `server/` modules |
| `src/services/geminiCocktailAgent.js` (1,164 lines) | Split into prompt builder + normalizer + agent |

---

## 10. Safety Plan

### Non-interruptible workflows — never break these mid-flow

- Shift closeout (endOfDay route + useShiftState)
- Pre-shift briefing (preShiftBriefing + useShiftState)
- Employee availability submission (constraintsForm + /api/employee-shifts/constraints)
- Manager shift approval and publish (shiftOrganizerPage + /api/employee-shifts/publish)
- Weekly schedule email distribution (email routes)
- Live event planning (EventCRM + all event routes)
- Approved event cocktail menus (event_cocktail_menus table + routes)
- Verified bottle pricing updates (verified_price_overrides + routes)

### High-preservation modules — test after every change

- Wine Academy (WineAtlas.jsx + all atlas pages + wine-atlas.css)
- Classic Cocktail Magazine (ClassicCocktailsMagazine + magazine.css + cocktail detail views)
- Cocktail Lab (CocktailLabStudio + geminiCocktailAgent + all CI module components)

### High-risk files (do not edit without explicit plan)

| File | Risk |
|------|------|
| `src/config/systemConfig.js` | localStorage key names — changing clears user data |
| `src/config/roleConfig.js` | Permission rules — errors lock users out |
| `server.js` auth section (lines 1218–1245) | Auth middleware — bugs break all protected routes |
| `src/hooks/useSessionState.js` | Login flow — bugs break the entire app |
| `data/hospia.sqlite` | Live database — never destructive schema changes |

### How to keep commits safe

- One route group = one commit during server split
- Verify `npm run start` after every commit
- Test login + affected feature before marking phase complete
- Do not stage unrelated files (`git status` before every `git add`)

---

## 11. Implementation Phases

---

### Phase 0 — Baseline Audit (Complete)

**Status:** Done. Documents created. Plan approved by product owner.

**Deliverables created:**
- `docs/architecture/REPOSITORY_ARCHITECTURE_MAP.md`
- `docs/architecture/REFACTORING_MASTER_PLAN.md` (this file)
- `docs/architecture/CLAUDE_REFACTORING_EXECUTION_GUIDE.md`
- `docs/architecture/MARKDOWN_DOCUMENTATION_AUDIT.md`

**Commit message:** `docs: add architecture map, refactoring plan, execution guide, and markdown audit`

---

### Phase 1 — Security Fix (Do First — Highest Priority)

**Goal:** Fix the Gemini API key exposure before any other code change.

**Files:**
- `.env`
- `.env.example`
- `server.js` (line 1352, `askGemini` function)
- `src/services/geminiCocktailAgent.js` (lines 1129, 1144)

**Tasks:**
1. Rename `VITE_GEMINI_API_KEY` to `GEMINI_API_KEY` in `.env` and `.env.example`
2. Update `server.js` `askGemini()`: change `process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY` → `process.env.GEMINI_API_KEY`
3. Update `geminiCocktailAgent.js`: remove client-side key check (`import.meta.env?.VITE_GEMINI_API_KEY`). Replace with a standard "AI not available" fallback if the API call fails.
4. **Rotate the Gemini API key** (get new key from Google AI Studio, update `.env`)
5. Delete stray root files: `hospia.db`, `response.json`, `response2.json`, `director.debug.log`, `tmphestia-atlas-whispers/`

**Validation:**
- `npm run start` succeeds
- Cocktail generation works (use the new key)
- `import.meta.env.VITE_GEMINI_API_KEY` is undefined in the browser console

**Risks:** Missing key rotation leaves the old exposed key live.

**Commit message:** `security: remove VITE_GEMINI_API_KEY frontend exposure, rotate key`

---

### Phase 2 — Dead Code and Folder Cleanup

**Goal:** Remove stray files, consolidate dead code, clarify folder ownership.

**Files:**
- `src/features/owner/_archived/` → rename to `_archive/`
- `src/features/owner/legacy/` → consolidate into `_archive/`
- `src/features/owner/wip/` → consolidate into `_archive/`
- `src/prototypes/` → move to `docs/archive/prototypes/`
- `seed_noir.mjs` → move to `docs/archive/scripts/`
- `debug_director.mjs` → delete

**Validation:**
- `npm run build` succeeds with no import errors
- All page navigation still works

**Commit message:** `refactor: archive dead owner components, prototype, and debug scripts`

---

### Phase 3 — Session Persistence and Idle Timeout

**Goal:** Users stay logged in across refreshes. Auto-logout after 30 minutes of idle.

**Files:**
- `src/hooks/useSessionState.js`
- `src/services/authService.js`
- `src/services/api/sessionApi.js`
- `server.js` (login route — extend session duration)

**Tasks:**
1. Store the JWT token in localStorage on login (`localStorage.setItem('hospia.token', token)`)
2. On app load: check for a stored token, attempt silent session restore (`GET /api/auth/me` or reuse the session validation logic)
3. If token is valid: restore currentUser, skip login screen
4. If token is invalid or missing: show login screen
5. Implement idle timer in a new `useIdleTimeout(30 * 60 * 1000)` hook:
   - Listen for `mousemove`, `keydown`, `touchstart`, `click`
   - Reset timer on every event
   - On expiry: call `logout()`, navigate to `/login`
6. Extend server session token validity to match expected usage (e.g., 7 days, but idle client-side enforces the 30-min rule)
7. On logout: clear localStorage token and navigate to `/login`

**Validation:**
- Log in, refresh browser → user remains on same page without re-login
- Leave app idle for 30 minutes → auto-logout
- Log out manually → token cleared, redirect to login
- Log in on two different browsers → both show the same page (assuming same role)

**Risks:** If session restore silently fails (expired token), the user must see the login screen cleanly, not a broken blank page.

**Commit message:** `feat: persist session token, add 30-minute idle auto-logout`

---

### Phase 4 — Real URL Routing

**Goal:** Every page has a browser URL. Shareable links work. Refresh returns to correct page.

**Files:**
- `package.json` (add `react-router-dom`)
- `src/main.jsx`
- `src/routes/AppRoutes.jsx` (new)
- `src/App.jsx` (integrate router)
- `src/hooks/useNavigationState.js` (sync with router)
- `server.js` (add `*` catch-all for SPA routing in production)

**Tasks:**
1. Install `react-router-dom`
2. Wrap `<App />` in `<BrowserRouter>` in `main.jsx`
3. Create `src/routes/AppRoutes.jsx` with all URL → page key mappings
4. Update `useNavigationState` to use React Router's `useNavigate` and `useLocation`
5. `goToPage()` calls React Router `navigate(url)` instead of `setPageState(key)`
6. Auth-aware redirect: unauthenticated users go to `/login?from=<intended-url>`, then redirect after login
7. Event ID, lesson/course ID in URL params (update relevant features to read from params)
8. Add catch-all route in `server.js` for production SPA serving
9. Preserve `/event/:token/guest` exactly

**Validation:**
- Navigate to `/bar/lab` and refresh → stays on Cocktail Lab, no re-login
- Navigate to `/events/abc123` → correct event
- Log out at `/bar/lab`, log back in → redirect to `/bar/lab`
- Browser back/forward works between pages
- Guest portal `/event/:token/guest` still works

**Risks:** This is the most complex phase. Integration with existing navigation hooks requires care. Test all roles and pages after completion.

**Commit message:** `feat: add React Router, URL-based navigation, shareable page links`

---

### Phase 5 — Backend as Source of Truth (localStorage Removal)

**Goal:** All business data reads from and writes to the backend. localStorage stores only UI preferences.

**Order:** Migrate one hook at a time. Each is a separate commit.

**Hooks to migrate (in order of risk, lowest first):**
1. `useNotificationState` — move notifications to backend-first
2. `useReportsState` — move reportArchive and businessMemory to backend-first
3. `useOperationsState` — move actionItems, incidents, budgetRequests, employeeRequests to backend-first
4. `useCocktailPipeline` — move cocktailDrafts, approvedCocktails, archivedCocktails to backend-first
5. `useStaffAcademyState` — move academyProgress to backend-first
6. `useShiftState` — verify already backend-first (it uses the API)
7. `useSessionState` — remove `hospia.users` from localStorage (load users from backend on demand)
8. `useBackendSync` — once all hooks are backend-first, this hook becomes redundant; remove it

**For each hook migration:**
- Replace `localStorage.getItem(STORAGE.key)` initial state with a `useState(null)` + `useEffect(() => fetch from API)`
- Replace `localStorage.setItem(STORAGE.key, ...)` write effects with API write calls
- Keep the localStorage key name for `area`, `page`, and `collapsed` (these are UI preferences — keep them)
- Handle loading/error states cleanly

**Validation for each hook:**
- Feature works end-to-end
- Log in on two different browsers → same data appears
- Refresh → data still present
- Backend DB shows the correct records

**Commit message (per hook):** `refactor(useOperationsState): backend as source of truth, remove localStorage`

---

### Phase 6 — Server Split (server.js → server/ modules)

**Goal:** Break the 6,298-line backend monolith into maintainable route files.

**Sequence (one commit per step):**

1. Create `server/` directory, `server/index.js` (minimal entry, listen only)
2. Extract `server/db/schema.js` (all CREATE TABLE statements)
3. Extract `server/middleware/auth.js` (requireAuth, requireVerifiedPriceAccess)
4. Extract `server/middleware/cors.js`
5. Extract `server/ai/gemini.js` (askGemini function)
6. Extract route files one by one:
   - `server/routes/auth.js`
   - `server/routes/shifts.js`
   - `server/routes/actions.js`
   - `server/routes/incidents.js`
   - `server/routes/events.js` (largest — most careful)
   - `server/routes/cocktails.js`
   - `server/routes/academy.js`
   - `server/routes/users.js`
   - `server/routes/owner.js`
   - `server/routes/ci.js`
   - `server/routes/verifiedPrices.js`
   - `server/routes/notifications.js`
   - `server/routes/aiProxy.js`
7. Update `package.json` `server` script to point to `server/index.js`
8. Add production static file serving to `server/index.js`

**Validation after each route group:** Start server, test the affected API routes from the frontend.

**Commit message (per group):** `refactor: extract [group] routes to server/routes/[group].js`

---

### Phase 7 — Service Extraction (geminiCocktailAgent.js Split)

**Goal:** Break the 1,164-line AI service into focused files.

**Files to create:**
- `src/services/ai/cocktailPromptBuilder.js`
- `src/services/ai/cocktailResponseNormalizer.js`
- `src/services/ai/menuAnalysisService.js`
- `src/services/ai/cocktailAgent.js` (public API only)
- `src/services/geminiCocktailAgent.js` → becomes a re-export shim

**Also:**
- Consolidate the duplicate `HESTIA_COCKTAIL_MENU_SKILL` prompt: keep in `server/ai/menuDesignSkill.js`, remove from frontend

**Validation:** Cocktail Lab generation works end-to-end, including revision and consultation modes.

**Commit message:** `refactor: split geminiCocktailAgent into focused AI service files`

---

### Phase 8 — Audit Trail Implementation

**Goal:** Track who changed what, when, for all critical business records.

**Tables to add audit writes:**
- Approved cocktail menus
- Published shift schedules
- Event plan status changes
- User role changes
- Food menu status changes

**Implementation:** Add a shared `auditLog(db, { actor, action, entityType, entityId, oldValue, newValue })` helper in `server/db/audit.js`. Call it from within route handlers after every write.

**Validation:** Make a change to an approved menu, verify the audit log records it.

**Commit message:** `feat: add audit trail for critical operational records`

---

### Phase 9 — Final Validation and Production Readiness

**Goal:** Verify the complete system. Ensure production deployment is possible.

**Tasks:**
1. Full smoke test of all roles: admin, owner, manager, bar_manager, fb_director, events_manager, chef, employee
2. Test all high-preservation modules: Wine Academy, Classic Cocktail Magazine, Cocktail Lab, Event Cocktail Menu Builder, Bottle Pricing
3. Verify non-interruptible workflows complete cleanly end-to-end
4. Confirm production static serving works (`npm run build` → `NODE_ENV=production npm run server`)
5. Confirm owner can access the app remotely (requires external hosting or tunneling test)
6. Update `REPOSITORY_ARCHITECTURE_MAP.md` to reflect the completed refactored state
7. Update `README.md` with production setup instructions

**Commit message:** `docs: update architecture map after refactoring complete, add production setup`

---

## 12. Definition of Done

The refactor is complete when:

- [ ] Browser refresh returns user to their exact page without re-login
- [ ] URL changes when navigating between pages
- [ ] Browser back/forward buttons work
- [ ] A link to `/events/:id` can be shared and opens the correct event
- [ ] Idle for 30 minutes → auto-logout
- [ ] The same data appears on two different devices for the same user
- [ ] `VITE_GEMINI_API_KEY` is not bundled into the frontend
- [ ] `server.js` has been split into route modules
- [ ] Dead code in `_archived/`, `legacy/`, `wip/`, `prototypes/` is archived
- [ ] All existing features work for all roles
- [ ] Wine Academy and Classic Cocktail Magazine are visually unchanged
- [ ] Audit trail records changes to approved menus, schedules, and prices
- [ ] Owner can access HESTIA remotely
- [ ] Architecture documentation is current
