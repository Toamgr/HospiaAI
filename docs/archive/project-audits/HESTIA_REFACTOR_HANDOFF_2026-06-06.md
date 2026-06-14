# HESTIA Refactor — Handoff Note

**Date:** 2026-06-06
**Repository:** `https://github.com/Toamgr/HospiaAI.git`

---

## 1. Current origin/main head

```
55cf9b5  feat: academyProgress backend read-side sync for current user — Phase 5 Step 8
```

Local and remote are fully synced. Working tree clean.

---

## 2. What was completed — Phase 0 through Phase 5

| Phase | Summary |
|---|---|
| **Phase 0** | Architecture audit — full codebase map, refactoring plan, and execution guide added to `docs/architecture/` |
| **Phase 1** | Security — `VITE_GEMINI_API_KEY` removed from Vite bundle; moved to server-only `process.env.GEMINI_API_KEY` |
| **Phase 2** | Dead code archived — 11 legacy owner components + academy video prototype moved to `docs/archive/` |
| **Phase 3** | Session persistence — JWT in localStorage, `GET /api/auth/me` for silent restore, `useIdleTimeout`, `IdleWarningBanner`, 30-minute idle logout, 7-day session expiry |
| **Phase 4** | Real URL routing — React Router v7, 54 page routes in `src/config/routes.js`, URL-first navigation, SPA catch-all in production server |
| **Phase 5 Step 1** | Notifications backend-backed — `POST /api/notifications`, role ownership check, server-side `created_at`, localStorage merge fallback |
| **Phase 5 Step 2** | actionItems backend-preferred — mount fetch + backend-wins merge in `useOperationsState` |
| **Phase 5 Step 3** | reportArchive + businessMemory backend-preferred — mount fetches in `useReportsState`, `addBusinessMemoryEvent` fires to backend |
| **Phase 5 Step 4** | serviceIncidents backend-preferred — mount fetch with field aliasing (`issueType`, `guestTable`, `employeeName`) |
| **Phase 5 Step 5** | futureEvents write-side — `saveEventPlan` fire-and-forget POST, server accepts client ID + `INSERT OR IGNORE`, `eventPlans` removed from legacy `useBackendSync` |
| **Phase 5 Step 6** | futureEvents approval persisted — `PATCH /api/event-plans/:id` (owner/admin), `status`/`approved_by`/`approved_at` columns, `approveEventEnquiry` fire-and-forget PATCH |
| **events_manager patch** | 25 EventCRM + EventOrchestrator backend routes opened to `events_manager` role; owner-only approval PATCH remains restricted |
| **Phase 5 Step 7** | futureEvents read-side merge — mount fetch + `mapBackendEventPlan` + approval safety rule (locally approved plans never downgraded by a non-approved backend version) |
| **Phase 5 Step 8** | academyProgress read-side sync for current user — maps `course_external_id:module_external_id` → local key format; other users' data untouched |

---

## 3. What was verified after restart

| Check | Result |
|---|---|
| `GET /api/auth/me` with valid token | ✅ Returns `{"ok":true,"user":{...}}` |
| `events_manager GET /api/events` | ✅ Returns event data |
| `events_manager GET /api/event-plans` | ✅ Returns `{"eventPlans":[]}` |
| `events_manager PATCH /api/event-plans/:id` | ✅ Returns `403 Forbidden` (owner/admin only — correct) |
| `npm run build` | ✅ Built with no errors |
| `git status` | ✅ Clean, up to date with origin/main |

---

## 4. Protected modules — confirmed untouched across all 15 commits

`EndOfDayReports.jsx` · `PreShiftBriefing.jsx` · `WineAtlas.jsx` · `ClassicCocktailsMagazine.jsx` · `CocktailLabStudio.jsx` · `CocktailMenuBuilder.jsx` (event version) · `BottlePrices.jsx` · `InstructorTalkingHead.jsx` · `EventBrain.jsx` · `EventCRM.jsx` · `useEventState.js` · `LessonPlayer.jsx` · `Courses.jsx` · `LearningProgress.jsx` · `StaffProgression.jsx`

Zero diff on every one of these across the entire Phase 0–5 refactor.

---

## 5. Remaining deferred work

**Blocked — requires dedicated architecture step first:**
- `hospia.approvedCocktails` read-side sync — blocked by: integer autoincrement backend IDs vs client string IDs; mixed cocktail populations in `GET /api/cocktails` (CI + lab + classic); backend records are less rich than local. Prerequisites: add `client_id` column to `cocktails` table, idempotent POST, lab-only GET filter.

**No backend infrastructure yet (can be added in future sessions):**
- `hospia.budgetRequests` — new table + GET/POST/PATCH needed
- `hospia.employeeRequests` — new table + multi-stage approval routes
- `hospia.assignedTasks` — new table (distinct from `/api/tasks` shift tasks)
- `hospia.ownerNotes` — new table or adapt `/api/notes` with tag filter
- `hospia.cocktailDrafts` / `hospia.archivedCocktails` / `hospia.cocktailPractice` — no backend routes; low urgency

**Architectural decision required before migrating:**
- `hospia.users` — two parallel user systems (`hospia_users` localStorage + `auth_users` DB) must be reconciled before any migration. Login and role resolution are at risk.
- `hospia.employeePerformance` — derived from incidents; decide whether to store as a separate document or compute as a view from the incidents table.

**Open gaps documented in code:**
- `learningProgress` page has no `PAGE_META` entry — navigable from legacy nav but unreachable via URL routing (documented in `src/config/routes.js:11`).
- `saveEventPlan`-generated actionItems (`event-task-action-${id}`) are local-only — preserved by Phase 5 Step 2 merge logic. Separate product decision required.
- `approveEventEnquiry` PATCH has no retry — offline approvals are preserved in local state but not retried to backend. The pending sync queue exists in the codebase but only covers shift_report, task, and action types.

---

## 6. Environment-only tasks

**Required — no code change needed:**

1. **Rotate the Gemini API key.** The key that was in `.env` during this session was visible in the local environment. If not already rotated, rotate it now in the Google Cloud Console. Update `.env` on your local machine and on any deployment server. The server reads it as `process.env.GEMINI_API_KEY`. The key is not in any tracked file or git history.

2. **Keep the server restarted on code changes to server.js.** Node.js does not hot-reload. Any future server.js change requires `npm run start` or a manual `node server.js` restart to take effect.

3. **Production deployment** — when deploying, ensure `NODE_ENV=production` is set so the SPA catch-all at `server.js:6410` activates for deep links and page refreshes.

---

## 7. Recommended next session starting point

The most natural next step is one of:

**A) `hospia.ownerNotes` backend migration** — lowest effort of the remaining keys. Simple schema (id, from, body, created_at), one write operation, no approval workflow. Adapt `/api/notes` with a tag or add a dedicated `/api/owner-notes` route. One-file hook change.

**B) `hospia.assignedTasks` backend migration** — slightly more work but closes a visible operational gap. Simple two-state lifecycle (open → done). New route required (`/api/assigned-tasks`, distinct from `/api/tasks`).

**C) Cocktail Data Architecture step** — prerequisite for `approvedCocktails` read-side sync. Add `client_id` to `cocktails` table, make POST idempotent, add source filter to GET. This unblocks the only remaining blocked migration.

Before starting any of these, run `git pull` and confirm the server is running the latest `server.js`.

---

## Next-session rule

Do not continue with broad refactoring immediately. Start the next session with a fresh `git pull`, `npm run build`, server restart, and a short audit of the specific target module only. Every future migration should remain one small scoped step at a time, with a plan before implementation and a checkpoint after implementation.
