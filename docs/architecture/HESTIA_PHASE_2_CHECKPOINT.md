# HESTIA Phase 2 Architecture Checkpoint

**Date:** 2026-05-12  
**Status:** Phase 2 complete — App.jsx decomposition and hook extraction finished.

---

## App.jsx Before / After

| Metric | Before Phase 2 | After Phase 2 |
|---|---|---|
| Lines | ~1,115 | 352 |
| Direct `useState` calls | 14+ | 0 |
| Direct `useEffect` calls | 3+ | 0 |
| Inline `useCallback` | 5 | 1 (`archiveEndOfDayReport`) |
| Hook composition calls | 0 | 10 |

---

## Completed Extraction Phases

| Phase | Hook / Task | What moved |
|---|---|---|
| 2.1 | `useNotificationState` | notifications, pushNotification, markNotificationsRead |
| 2.2 | `useSessionState` | lang, currentUser, role, users, logout |
| 2.3 | `useNavigationState` | area, page, collapsed, navigate, goToArea, goToPage, access guard |
| 2.4 | `useReportsState` | reportArchive, businessMemory, addBusinessMemoryEvent |
| 2.5 | `useCocktailPipeline` | 4 cocktail state slices + 5 handlers |
| 2.6 | `useStaffAcademyState` | academyProgress, lesson selection, open/complete handlers |
| 2.7 | `useOperationsState` | 8 operations state slices + 11 handlers + 4 module helpers |
| 2.8 | `useShiftBrainState` | shiftNotes |
| —   | PageRenderer grouped props | Flat ~52-prop PageRenderer call → 7 domain objects |
| —   | `useBackendSync` | Backend sync useEffect + apiRequest function |
| —   | `useUserManagement` | handleCreateUser, handleUpdateUser, handleDisableUser |
| —   | HESTIA brand migration | All user-facing "HOSPIA" → "HESTIA" across UI, docs, AI prompts |

---

## Current App.jsx Responsibilities

App.jsx is now a **pure composition and orchestration layer**. It owns:

1. **Hook wiring** — calls all 10 hooks and assembles their outputs
2. **`login()`** — cross-domain orchestration: writes `setCurrentUser` (session) and calls `navigate` (navigation). Cannot move without coupling hooks to each other.
3. **`archiveEndOfDayReport`** — cross-domain orchestration: writes `setReportArchive` (reports) and `setActionItems` (operations) and fires `pushNotification`. Stays for the same reason.
4. **Shell layout JSX** — TopNav, SidePanel, NotificationPanel — App owns the shell frame
5. **PageRenderer call site** — routes the current page to its feature component
6. **LoginScreen guard** — redirects to login when no current user

**App.jsx imports nothing about state management primitives except `useCallback`.** It does not call `useState`, `useEffect`, or `useReducer` directly.

---

## Hook Map

All hooks live in `src/hooks/`.

| Hook | Parameters | Owns |
|---|---|---|
| `useSessionState` | none | lang, currentUser, role, users, logout; lang + users persistence |
| `useNavigationState` | `{ currentUser }` | area, page, collapsed, navigate, goToArea, goToPage; access-guard effect |
| `useNotificationState` | `{ role, currentUser }` | notifications, visibleNotifications, unreadCount, pushNotification |
| `useReportsState` | none | reportArchive, businessMemory, addBusinessMemoryEvent; both persistence effects |
| `useOperationsState` | `{ currentUser, pushNotification, addBusinessMemoryEvent }` | 8 state slices (eventPlans, actionItems, budgetRequests, serviceIncidents, employeePerformance, employeeTasks, employeeRequests, ownerNotes) + 11 handlers + 4 module-level helpers |
| `useCocktailPipeline` | `{ currentUser, pushNotification, addBusinessMemoryEvent }` | cocktailDrafts, approvedCocktails, archivedCocktails, cocktailPractice + 5 handlers |
| `useStaffAcademyState` | `{ currentUser, goToPage }` | academyProgress, selectedAcademyId, selectedLessonId, openUniversityLesson, completeUniversityLesson |
| `useShiftBrainState` | none | shiftNotes, setShiftNotes |
| `useBackendSync` | `{ role, setReportArchive, setBusinessMemory, setEventPlans, setActionItems, setUsers }` | One-time backend merge on role change — side-effect only, returns nothing |
| `useUserManagement` | `{ currentUser, users, setUsers, setCurrentUser, logout, pushNotification }` | handleCreateUser, handleUpdateUser, handleDisableUser |

### Hook dependency ordering (no circular paths)

```
useSessionState          ← no hook dependencies
useNavigationState       ← imports getInitialUser from useSessionState (init only)
useNotificationState     ← no hook dependencies
useReportsState          ← no hook dependencies
useOperationsState       ← injects: currentUser, pushNotification, addBusinessMemoryEvent
useCocktailPipeline      ← injects: currentUser, pushNotification, addBusinessMemoryEvent
useStaffAcademyState     ← injects: currentUser, goToPage
useShiftBrainState       ← no hook dependencies
useBackendSync           ← injects: role + 5 raw setters from other hooks
useUserManagement        ← injects: currentUser, users, setUsers, setCurrentUser, logout, pushNotification
```

---

## Feature Folder Map

All feature components live in `src/features/`.

| Folder | Components |
|---|---|
| `auth/` | LoginScreen |
| `shift-brain/` | PreShiftBriefing, OperationalNotes |
| `bar/` | CocktailLabStudio, FoodCostTables, CocktailLibrary, InventoryOverview, BarReports, ApprovedCocktailsTraining |
| `operations/` | ActionBoard, EventOrchestrator, EndOfDayReports, BudgetRequestPage |
| `owner/` | CommandCenter, BudgetApprovals, OwnerOperationalRequests, WeeklySummary, ExecutiveOverview, BusinessMRI, ProfitLeaks, OwnerReport, BusinessMemoryPage, StrategicRecommendations |
| `employee/` | EmployeeHome, EmployeeRequests, ManagerEmployeeRequests, EmployeeAchievements, ServiceRecovery |
| `staff/` | StaffProgression, StaffReadiness |
| `academy/` | Courses, LessonPlayer, Simulation, SOPSheets, WineKnowledge, KnowledgeLibrary, LearningProgress |
| `system/` | UserManagement, Settings, MissingPage |
| `shell/` | TopNav, SidePanel, NotificationPanel |

Feature components receive props through PageRenderer's grouped-prop destructuring. They do not import hooks or manage cross-domain state.

---

## Utility Map

`src/utils/`

| File | Purpose |
|---|---|
| `format.js` | `cx` (className joining), `formatMoney`, string/date helpers |
| `academy.js` | `getVisibleAcademies`, `getLessonKey`, `getUserLessonProgress`, `isLessonUnlocked`, `countCompletedLessons` |
| `emailjs.js` | EmailJS send helpers for EOD reports |

---

## Service Map

`src/services/`

| File | Purpose |
|---|---|
| `authService.js` | `buildSessionUser`, `persistSession`, `clearSession` |
| `userService.js` | `createUser`, `updateUser`, `disableUser`, `loadUsers`, `persistUsers`, `syncUsersFromBackend` |
| `cocktailService.js` | Local fallback cocktail generator (used when Gemini is unavailable) |
| `geminiCocktailAgent.js` | Gemini AI cocktail generation — proposal, revision, consultation modes |
| `shiftBrainService.js` | `generateOwnerBrief` — builds owner brief from operational snapshot |
| `ownerInsightService.js` | Owner weekly brief generation via Gemini |
| `reportService.js` | Report utilities |
| `taskService.js` | Task service utilities |
| `notificationService.js` | Notification service |
| `academyService.js` | Academy progress service |
| `venueService.js` | Venue service |

---

## PageRenderer Contract

PageRenderer receives 7 domain-grouped prop objects. The App → PageRenderer boundary is:

```jsx
<PageRenderer
  t={t}
  page={page}
  goToPage={goToPage}
  session={{ currentUser, lang, role, users, onCreateUser, onUpdateUser, onDisableUser }}
  reports={{ reportArchive, businessMemory, onReportArchived, onMemoryEvent }}
  operations={{ eventPlans, actionItems, setActionItems, budgetRequests, serviceIncidents,
    employeePerformance, employeeTasks, employeeRequests, ownerNotes, supplyRisks, shiftProfile,
    onEventPlanSaved, onApproveEventEnquiry, onBudgetRequest, onBudgetResponse,
    onServiceIncident, onUpdateIncident, onUpdateEmployeeTask, onSubmitEmployeeRequest,
    onManagerReviewEmployeeRequest, onOwnerReviewEmployeeRequest, onOwnerNote }}
  cocktails={{ cocktailDrafts, approvedCocktails, archivedCocktails, cocktailPractice,
    onSaveCocktailDraft, onSubmitCocktailApproval, onApproveCocktail,
    onRejectCocktailDraft, onMarkCocktailPracticed }}
  academy={{ academyProgress, selectedAcademyId, selectedLessonId,
    onOpenUniversityLesson, onCompleteUniversityLesson }}
  notifications={{ visibleNotifications, shiftNotes, setShiftNotes }}
/>
```

PageRenderer destructures these groups and continues passing flat props to individual feature components. Feature components have not been updated to accept grouped props yet.

---

## Technical Identifiers Intentionally Not Renamed

These use the old "HOSPIA" name and must be migrated together in a coordinated compatibility pass:

| Identifier | Location | Risk if renamed independently |
|---|---|---|
| `X-HOSPIA-Role` | HTTP header — 5 files: `App.jsx`, `useBackendSync.js`, `client.js`, `ownerInsightService.js`, `userService.js`, `server.js` | Frontend/backend must rename simultaneously or requests break |
| `hospia.*` localStorage keys | `STORAGE` config in `systemConfig.js` + `hospia.businessMemory` hardcoded in `useReportsState.js` | Renaming without migration clears all existing user data |
| `HOSPIA_LOCAL_APP` | Package name in `package.json`, `package-lock.json` | Safe to rename at any time — has no runtime effect |
| `HOSPIA_STRATEGY_FOUNDATION.md` | Filename in `docs/strategy/` | Safe to rename if CLAUDE.md path references are updated |
| `HOSPIA_SYSTEM_ARCHITECTURE.md` | Filename in `docs/architecture/` | Same |

---

## Known Technical Debt

1. **`hospia.businessMemory` hardcoded key** — `useReportsState.js` uses a literal `'hospia.businessMemory'` string that is not in the `STORAGE` config object. All other keys use `STORAGE.*`. Should be added to config in the storage key migration pass.

2. **`useOperationsState` is 295 lines** — the largest hook. Contains event management, budget requests, employee requests, performance, tasks, incidents, and owner notes. Could be split into domain-specific hooks (e.g., `useEventPlanning`, `useBudgetRequests`) if the file becomes a maintenance burden. Not urgent.

3. **Feature components still receive flat props from PageRenderer** — PageRenderer destructures its grouped props and passes individual flat props to each feature component. A second pass could update feature components to receive domain objects directly, but this requires touching ~40 feature components and is low-priority.

4. **`INITIAL_SHIFT_PROFILE` and `INITIAL_SUPPLY_RISKS` are static constants** — these are passed through `operations.supplyRisks` and `operations.shiftProfile` in PageRenderer but never change. They are placeholders for backend-driven data. Should be loaded from backend/localStorage when those endpoints exist.

5. **Backend sync has no TTL or deduplication** — `useBackendSync` fires on every role change and fetches all data fresh each time. No caching layer. Acceptable for MVP; will need attention at scale.

6. **`onMemoryEvent` is forwarded through PageRenderer but unused** — `addBusinessMemoryEvent` is passed into the `reports` group and destructured inside PageRenderer, but no current feature component calls it. It is available for future pages that need to write memory events.

---

## Post-Phase-2 Architecture: Hospitality Ontology Foundation

**Added 2026-05-12** — after Phase 2 completion and before database schema work.

`src/domain/hospitality/` is now the canonical hospitality domain foundation for HESTIA.

It defines 60+ entity types, 7 decision maps, 14 memory types, 30 event types, 14 AI agent candidates, 30 database candidates, and the six operational loops (Promise, Readiness, Execution, Recovery, Memory, Learning). See `src/domain/hospitality/hospitalityOntologyREADME.md` for the full specification.

This layer has no runtime behavior and does not affect the current product experience. It is the specification layer for all future database schemas, AI agents, event systems, and memory architecture.

---

## Recommended Next Development Priorities

### Immediate (feature-safe, no architecture changes needed)

1. **Feature development** — The codebase is structurally clean. New features can be added by adding a hook or extending an existing one, adding a feature component, and wiring it in PageRenderer. No App.jsx surgery required.

2. **HESTIA University content expansion** — academies are hooked, progress is tracked, the player works. Content can be added to `src/data/academy/` without touching architecture.

3. **Shift Brain intelligence** — `shiftBrainService.js` and `useShiftBrainState.js` are in place. The PreShiftBriefing and OperationalNotes components are wired. Richer shift summaries and briefing generation can be added here.

### Compatibility migration (coordinate before doing)

4. **`hospia.*` localStorage key migration** — rename `STORAGE.*` values from `hospia.*` to `hestia.*` with a one-time migration function on first load. Must be done atomically to avoid clearing user data.

5. **`X-HOSPIA-Role` header rename** — rename in all 6 locations simultaneously (frontend hooks + server middleware). Requires a coordinated deploy; cannot be done incrementally.

### Architecture evolution (later)

6. **Feature-level grouped props** — update individual feature components to accept domain objects (`session`, `operations`, etc.) instead of flat props. Low urgency; improves discoverability but is a large surface change.

7. **`useOperationsState` domain split** — if the 295-line hook becomes a merge conflict hotspot, split into `useEventPlanning`, `useBudgetRequests`, `useEmployeeWorkflow`. Not urgent.
