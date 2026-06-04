# HESTIA / HOSPIA — CTO-Level Codebase Audit

**Audit date:** 2026-05-21
**Auditor stance:** CTO + senior full-stack architect + product strategist + hospitality-tech investor
**Scope:** Read-only audit of the entire `HOSPIA_LOCAL_APP/` workspace
**Predecessor:** `docs/archive/project-audits/HESTIA_FULL_PROJECT_AUDIT_2026-05-18.md`
**Mode:** Inspection only — no code changes
**Safety:** `.env` was never opened. Where credentials are mentioned, only file paths and risk categories are referenced.

---

## 1. Executive Summary

HESTIA is a real product on real foundations. It is not a vibe-coded prototype, not a Notion-and-Figma dream, and not a chat wrapper. The spine of the application — a composition-only `src/App.jsx` (400 lines, zero `useState`, zero `useEffect`), thirteen domain hooks, a deterministic Shift Brain intelligence service, a confidence-gated costing layer that refuses to invent prices, a hospitality ontology kept as inert reference, an 8-module cocktail knowledge base, and a 2,741-line Express + SQLite backend with bcrypt auth and an audit log — is the kind of architecture an investor's technical advisor will recognize on the first read.

**What this codebase currently is:** a one-venue operational platform for a bar-led hospitality business, with two strong pillars (Shift Brain + Cocktail Lab), one newly unified AI pillar (Event Cocktail Menu Service shipped between 2026-05-18 and today), and a wide surface of owner-facing pages that overpromise on data the venue is not yet feeding into the system.

**How serious it looks:** more serious than 90% of pre-seed hospitality-tech prototypes. The architecture documents in `docs/strategy/` and `docs/architecture/` are not aspirational — the code visibly enforces them (composition-only App, deterministic service layer, ontology-as-inert-reference, source-aware costing). What costs the project investor confidence today is not the core; it's the **scar tissue**: 13 empty files and folders still in source control, ten `_archived/` owner pages that are actually the live runtime, a duplicated nested documentation path, a UI primitives library nobody imports, two parallel "system prompts" the AI sees, mojibake glyphs sent to Gemini on every prompt, a stranded backend bug that writes `undefined` to the verified-price audit log, plaintext passwords sitting alongside their bcrypt hashes in SQLite, three publicly callable AI proxy endpoints, and a `defaultVenueId()` hard-coded in fourteen places that quietly makes the backend single-tenant.

**Real product, prototype, or messy experiment?** Real product, carrying ~15% cosmetic debt and ~5% genuine security/correctness debt. None of the debt is hard to remove; most of it would take one focused day of cleanup. The strategic risk is not the debt — it is letting the surface area continue to grow before the core daily-loop ships end-to-end.

**Strongest parts (in order):**

1. **Shift Brain V1** (`src/services/shiftBrainService.js` + `src/hooks/useShiftBrainState.js` + `src/features/shift-brain/`). Pure deterministic intelligence, single call site, no AI dependency. The defensible spine.
2. **Costing honesty** (`src/domain/hospitality/bar/cocktailLabPricingAdapter.js`, `barCalculationUtils.js`, `verifiedPriceIngestion.js`, `verifiedPriceStorage.js`). Returns `null` when sources are missing; propagates `confidence_level` and `cost_status` to the UI; audit-logs server-side overrides.
3. **Event Cocktail Menu Service** (`src/services/eventCocktailMenuService.js`, **new since 2026-05-18**). 453 lines. Uses `BEVERAGE_DIRECTOR_SYSTEM_PROMPT`, `buildKnowledgeContext`, three-tier JSON parsing, deterministic fallback, and explicitly instructs Gemini "Do not include cost estimates" — pricing is computed afterward via the adapter. The single biggest product/AI risk in the 2026-05-18 audit has been eliminated.
4. **Hospitality Ontology** (`src/domain/hospitality/`). Eight inert reference maps that frame the domain language. Zero runtime importers — exactly as `CLAUDE.md` requires. This is an investor-coded signal.
5. **Cocktail Knowledge Base** (`src/domain/hospitality/bar/cocktailKnowledgeBase/`). Eight modules of beverage-director knowledge with selective context injection. Used by both Lab and Event surfaces.
6. **Backend depth.** `server.js` is 2,741 lines and runs a real Express + SQLite app with 95+ routes, role-aware middleware, session tokens, bcrypt, CORS allow-list, and full Event-module CRUD. The prior audit underestimated this file by ~3×.

**Weakest parts (in order):**

1. **Authorization gaps on AI proxy endpoints.** `/api/gemini`, `/api/coach`, `/api/simulate` carry no `requireAuth`. Anyone reaching the server can drain the Gemini key.
2. **Multi-tenancy is a fiction.** Fourteen server queries hardcode `defaultVenueId() === "venue-main"`. `req.user` has no `venue_id`. The product is single-venue at the database level.
3. **Live correctness bugs.** `req.verifiedPriceUser` is referenced but never assigned (server.js:2085, 2115) — the audit log writes `undefined` to `saved_by`. `useOperationsState.js:67` references `currentUser?.username` outside its scope — will throw `ReferenceError` the moment the owner-enquiry approval email is wired.
4. **Plaintext passwords retained.** `auth_users.password` is never cleared after `password_hash` is generated (server.js:687–692). Real passwords sit beside their hashes.
5. **PII in source.** Five real Israeli employees (`Toam Griffel`, `Tal Millo`, `Omer Sadot`, etc.) and their deterministic access codes are committed in `server.js:535–543`.
6. **Owner module limbo.** Ten owner pages live in `src/features/owner/_archived/`, with 2-line forwarders in `src/features/owner/` re-exporting them. A reviewer cannot tell what "archived" means when 100% of the archived files are in production.
7. **Empty scaffolding everywhere.** Seven empty feature folders, six empty source files, three dead compat shims — zero deletions since 2026-05-18.
8. **`.env` security posture.** Real-looking Gemini keys in plaintext on disk (file inspection was avoided per safety rule — flagged from gitignore and prior-audit confirmation).

**Investability grade today (structural + security):** B−
**Investability grade after the one-week cleanup in Section 12, Phase 1:** A−
**Investability grade after Phase 3 (real daily loop end-to-end on backend):** A

---

## 2. Folder Structure Audit

Layout confirmed by `find` on 2026-05-21. Project root: `HOSPIA_LOCAL_APP/`.

### 2.1 Top-level

| Path | Responsibility | Verdict |
|---|---|---|
| `CLAUDE.md` | Project rules consumed by the assistant | Healthy, recently updated |
| `README.md` | Human-facing intro + demo users + run scripts | Healthy but contains live demo credentials |
| `package.json` | Dependencies, scripts | Healthy; missing `test` and `lint` scripts |
| `vite.config.js` | Frontend dev server + `/api` proxy | Healthy, minimal |
| `postcss.config.js`, `tailwind.config.js` | Styling | Healthy |
| `index.html` | One-line root mount | Healthy |
| `server.js` | Entire backend (2,741 lines) | Real but oversized; see §6 |
| `data/` | `hospia.sqlite` + WAL/SHM | Healthy, gitignored |
| `dist/` | Vite build output | Build artifact, gitignored |
| `node_modules/` | Dependencies | — |
| `docs/` | Strategy, architecture, data docs | Mostly healthy; one nested-duplicate accident |
| `src/` | All application code | See §2.2 |
| `server.err.log`, `server.out.log` | Empty 0-byte log files | Should be deleted |
| `.env`, `.env.example` | Configuration | `.env` carries real-looking keys (per prior audit) — rotate per §6.1 |

### 2.2 `src/` folder breakdown

| Path | What it holds | Status |
|---|---|---|
| `src/App.jsx` | Composition + page renderer | **Healthy.** 400 lines, 0 state hooks |
| `src/main.jsx` | Entry point | Healthy, 14 lines |
| `src/components/` | UI primitives | **Forked.** `AppPrimitives.jsx` is used; `components/ui/` (with `README.md`, `index.jsx`) is unused. Delete the `ui/` folder. |
| `src/config/` | Centralized configuration | **Mostly healthy.** Two empty files (`accessCodes.js`, `emailjs.js`) should be deleted; everything else is live |
| `src/data/` | Static seed data | **Mixed.** `academy/`, `cocktailLab.js`, `cocktails.js`, `courses.js`, `events.js`, `operations.js` are live; `staff.js`, `businessMemory.js`, `systemConfig.js` (5-line shim), `universityManifest.js` (1-line shim) are dead or stubs |
| `src/data/academy/` | 14 academy doctrines + manifests | Live, large (`universityManifest.js` is 1,668 lines, `universityExpansion.js` is 1,070) |
| `src/domain/hospitality/` | Ontology layer (8 maps + README) | **Live but inert by rule.** Correct per `CLAUDE.md`. Zero runtime importers verified by grep. |
| `src/domain/hospitality/bar/` | Schemas, costing utilities, knowledge base | **Live.** 23 files + barrel `index.js` + README. The strongest substrate in the codebase. |
| `src/domain/hospitality/bar/cocktailKnowledgeBase/` | Beverage-director knowledge modules | Live, 8 modules used by `geminiCocktailAgent.js` and the new event service |
| `src/features/` | All page-level UI | **Mixed**, see §2.3 |
| `src/hooks/` | Thirteen domain hooks + README | **Healthy** but `useOperationsState.js` is 488 lines and owns 8 slices — overdue for split |
| `src/i18n/` | Empty i18n scaffolding | **Dead.** Three 0-byte files; i18n actually lives in `config/textConfig.js`. Delete the folder. |
| `src/lib/` | Small shared helpers | Healthy, one `storage.js` |
| `src/prompts/` | AI prompts | **Healthy.** `geminiCocktailPrompts.js` is the source of truth; `eventPrompts.js` is misnamed (it's a text formatter — should live in `services/`) |
| `src/prototypes/academyVideoInstructor/` | Experimental video-instructor work | Properly isolated from runtime; safe to keep or move to `wip/` |
| `src/services/` | Service boundary | Healthy core. `api/` subfolder is clean. `email/` subfolder is empty and should be deleted. |
| `src/services/api/` | Per-domain HTTP wrappers | Healthy, ~7 files |
| `src/services/email/` | Empty stub folder | **Delete.** EmailJS already lives in `utils/emailjs.js` |
| `src/utils/` | Pure-function utilities | Healthy, 4 small files |

### 2.3 `src/features/` subfolder breakdown

| Subfolder | Status | Notes |
|---|---|---|
| `academy/` | Live, 7 files | Wired to academy hook + manifest |
| `auth/` | Live, 1 file | `LoginScreen.jsx` |
| `bar/` | Live, 10 files | Includes the heavy `CocktailLabStudio.jsx` (1,047 lines) and `BottlePrices.jsx` (965) |
| `cocktail-lab/` | **Empty** | Delete — Cocktail Lab lives in `features/bar/` |
| `dashboard/` | **Empty** | Delete |
| `docs/` | **Empty** | Delete |
| `employee/` | Live, 5 files | Real production state |
| `events/` | Live, ~24 files | Now uses `eventCocktailMenuService.js` (new since 2026-05-18) |
| `events/components/` | Live | Largest file: `CocktailMenuBuilder.jsx` (~785 lines, now unified to the service) |
| `knowledge/` (incl `data/`) | **Empty** | Delete |
| `notifications/` | **Empty** | Delete — notifications live in `features/shell/NotificationPanel.jsx` |
| `operations/` | Live, 7 files | Includes `ActionBoard.jsx` (739 lines) |
| `owner/` | **Confusing** | 10 of 11 files are 2-line shims forwarding to `_archived/` |
| `owner/_archived/` | **Live runtime code despite the folder name** | Rename or restructure (see §6.4) |
| `owner-intelligence/` | **Empty** | Delete |
| `settings/` | Live, 1 file | |
| `shell/` | Live, 4 files | TopNav, SidePanel, NotificationPanel, shellUtils |
| `shift-brain/` | Live, 2 files | Wired to the deterministic service |
| `staff/` | Live, 2 files | `StaffReadiness.jsx` is the gold standard for "not yet" stubs — it openly refuses to display fake data |
| `system/` | Live, 4 files | |
| `tasks/` | **Empty** | Delete — task logic lives in operations |

### 2.4 Folders the project should add

| Missing folder | Why it matters |
|---|---|
| `__tests__/` or `tests/` (with `vitest`) | Zero tests today; every refactor ships blind |
| `migrations/` (with `db-migrate`, `umzug`, or Knex migrations) | Schema lives in inline `db.exec(...)` + bare `try { ALTER TABLE } catch {}` |
| `.github/workflows/` (CI) | No CI runs anywhere |
| `src/services/aiClient.js` | All `/api/gemini` calls should go through one client (today only services call it — close, not closed) |
| `src/features/owner/wip/` | Holding pen for the 5 feature-flagged-off owner pages |
| `docs/INDEX.md`, `docs/SECURITY.md`, `docs/CONTRIBUTING.md` | One-hop navigation for new readers + investors |
| `data/seeds/` and `data/demo/` | Separate the live SQLite from documented demo data |

---

## 3. Empty / Placeholder / Weak Files

Verified by `find -empty` on 2026-05-21.

| File path | Bytes / Lines | Issue | Recommendation |
|---|---|---|---|
| `src/config/accessCodes.js` | 0 B | Empty; superseded by `.env` `DEMO_CODE_*` and the `auth_users` table | **Delete** |
| `src/config/emailjs.js` | 0 B | Empty; EmailJS config lives in `systemConfig.js` | **Delete** |
| `src/services/email/emailjsClient.js` | 0 B | Empty; real EmailJS loader is `utils/emailjs.js` | **Delete (and remove parent folder)** |
| `src/i18n/index.js` | 0 B | Empty; i18n lives in `config/textConfig.js` | **Delete** |
| `src/i18n/text.en.js` | 0 B | Empty | **Delete** |
| `src/i18n/text.he.js` | 0 B | Empty | **Delete (and remove parent folder)** |
| `server.err.log` | 0 B | Empty; already gitignored | **Delete** |
| `server.out.log` | 0 B | Empty; already gitignored | **Delete** |
| `src/data/staff.js` | `export const STAFF = []` (no importers) | Dead shim | **Delete after grep confirm** |
| `src/data/businessMemory.js` | 10 lines, only empty arrays | Importers consume empty defaults | **Either populate or move to `_seeds/` and delete the file** |
| `src/data/systemConfig.js` | 5-line re-export shim, 0 importers | Dead | **Delete** |
| `src/data/universityManifest.js` | 1-line re-export shim, 0 importers | Dead | **Delete** |
| `src/features/cocktail-lab/` | Empty folder | Misleading — Cocktail Lab lives in `features/bar/` | **Delete** |
| `src/features/dashboard/` | Empty folder | No dashboard concept | **Delete** |
| `src/features/docs/` | Empty folder | No use | **Delete** |
| `src/features/knowledge/` (incl `knowledge/data/`) | Empty folders | Academy knowledge lives in `features/academy/` | **Delete** |
| `src/features/notifications/` | Empty folder | NotificationPanel lives in `features/shell/` | **Delete** |
| `src/features/owner-intelligence/` | Empty folder | Owner intelligence lives in `features/owner/` | **Delete** |
| `src/features/tasks/` | Empty folder | Task UI lives in `features/operations/ActionBoard.jsx` | **Delete** |
| `src/components/ui/index.jsx` | Unused parallel UI library | Zero importers; references Tailwind tokens that don't exist | **Delete folder** |
| `src/prompts/eventPrompts.js` | Not actually a prompt (text formatter) | Misnamed and misplaced | **Rename + move to `src/services/eventSummaryFormatter.js`** |
| `HESTIA_AUDIT_AND_NEXT_PHASE.docx` (root) | Awkward placement | Should live in `docs/strategy/` next to its `.md` twin | **Move** |
| `src/features/owner/CommandCenter.jsx` (and 9 siblings) | 2-line forwarders re-exporting from `_archived/` | Confusing | **Decide-then-act, see §6.4** |
| `src/prompts/geminiCocktailPrompts.js` | Healthy file with mojibake glyphs (`managerג€™s`, `ג€™`) | UTF-8 / Windows-1252 mis-decoding sent on every prompt | **Re-save as UTF-8** |
| `package.json` `dependencies.openai` ^4.77.0 | No file imports it | Dead dependency from an earlier OpenAI prototype | **Remove from `dependencies`** |

Total cleanup volume: 6 empty source files + 7 empty feature folders + 4 dead shims + 2 misplacements + 1 mojibake + 1 dead npm dependency. **None affects runtime.** None has changed since the 2026-05-18 audit.

---

## 4. Unused / Redundant / Dead Code

| Path | Why it looks unused | Safe to remove? | Check first |
|---|---|---|---|
| `src/components/ui/` (folder, 2 files) | Zero `grep` matches for any export | Yes | Confirm no `@/components/ui` alias in `vite.config.js` (there is none) |
| `src/i18n/` (3 empty files + folder) | Never imported; i18n lives in `config/textConfig.js` | Yes | Confirm no future i18n PR is in flight |
| `src/services/email/` (empty file + folder) | EmailJS handled by `utils/emailjs.js` | Yes | None |
| `src/data/staff.js` | `STAFF = []`, no importers | Yes | `grep -r "from.*data/staff" src/` |
| `src/data/systemConfig.js` (shim) | 0 importers | Yes | `grep -r "from.*data/systemConfig" src/` |
| `src/data/universityManifest.js` (shim) | 0 importers | Yes | `grep -r "from.*data/universityManifest" src/` excluding `academy/` |
| Seven empty `features/*/` folders | No files | Yes | Confirm no IDE workspace recently expected them |
| `src/data/businessMemory.js` | All exports are empty arrays | **Maybe** — has importers consuming empty defaults | Migrate importers to inline defaults first |
| `package.json` `dependencies.openai` | Zero imports | Yes | `grep -r "from 'openai'" src/ server.js` |
| `src/prototypes/academyVideoInstructor/` | Isolated experimental code | **Decide** — currently safely sandboxed | Move to `wip/` or leave |
| 5 feature-flagged-off owner pages (`BusinessMRI`, `ExecutiveOverview`, `WeeklySummary`, `ProfitLeaks`, `StrategicRecommendations`) | Behind `isEnabled(...)` flags, never shown today | **Decide** | Determine whether each is "future feature" (move to `owner/wip/`) or "abandoned" (delete) |
| Hardcoded demo KPIs inside `_archived/ExecutiveOverview.jsx` (`NIS 27.1k leakage`, `Hospitality Score 87`) | Fabricated numbers reading as production data | **Rewrite or hide** — see §10 |
| `src/features/events/EventBrain.jsx` (134 lines) | Demo-only — imports `DEFAULT_TABLES` from `eventBrainDemoData`, uses its own localStorage key `hospia.eventBrain.v1`, not wired to `useEventState` | **Decide** — either fold into the real Event module or move to `prototypes/` |

The only inline TODO/FIXME in the entire `src/` tree:

```
src/config/systemConfig.js:43
// TODO Phase 2 — remove this frontend code map; access validation must be server-side only.
```

That's it. One TODO. The codebase doesn't have a "fix-me-later" culture — work either lands or stays untouched. That is a quality signal.

---

## 5. Half-Built Features

| Feature | What exists | What is missing | Connection gap | Priority |
|---|---|---|---|---|
| **End-of-Shift Review (the daily loop's closer)** | `src/features/operations/EndOfShiftReview.jsx`, `shiftBrainService.js`, `/api/shift-reports` backend | An end-to-end flow that consumes the deterministic `shiftBrain` snapshot, writes a structured summary to `shift_reports`, persists carry-forward to `carry_forward_tasks`, and the next pre-shift inherits it | Today some writes go to localStorage; carry-forward inheritance is partly there but not fully exercised on backend | **Critical** — this is the product spine |
| **Event Cocktail Menu Service** | `src/services/eventCocktailMenuService.js` (new, 453 lines), wired to `CocktailMenuBuilder.jsx`, fallback + JSON validation | Confidence dots and cost-status traffic-light gating in the UI to match Cocktail Lab parity; richer event-specific fields (`batchablePercent`, `stationActions`, `garnishPrePortioned`) | Service exists; UI polish lags | **High** |
| **Verified Price Audit Log** | `verified_price_audit_log` table, route, `verifiedPriceIngestion.js`, `VerifiedPriceEntryPanel.jsx` | `req.verifiedPriceUser` is never assigned in `server.js:2085, 2115` — writes `undefined` to `saved_by` on every override and delete | Live bug: audit log is structurally there, factually broken | **Critical** (it's a live correctness bug) |
| **Owner-enquiry approval email** | `useOperationsState.js::sendOwnerEnquiryApprovalEmail`, EmailJS plumbing | The function references `currentUser?.username` outside its scope (top-level function, not inside the hook) — will throw `ReferenceError` the moment it's invoked | Untested code path that will crash | **High** |
| **Owner page architecture** | 11 owner pages exist; 5 are flagged off | A decision: keep 1 (`OperationalPulse` as the owner home) + 2–3 real surfaces, move the rest to `wip/` or delete | `_archived/` confusion (see §6) | **High** |
| **Real authentication hygiene** | bcrypt + UUID tokens, `auth_users` table, role middleware | Password reset flow, refresh token, rate limit on `/api/auth/login`, login-attempt audit, plaintext password column cleanup | Plaintext passwords sit in SQLite next to hashes; no reset path | **High** |
| **Public AI endpoints** | `/api/gemini`, `/api/coach`, `/api/simulate` work | All three are `requireAuth`-free. Anyone reaching the server can drain the key | Authorization gap | **Critical** |
| **Multi-tenancy** | `venues` table exists; one venue (`venue-main`) seeded | `req.user.venue_id`; venue_id filters on `event_guests`, `event_tables`, `event_tasks` queries; `defaultVenueId()` removal | 14 hardcoded references; the product is single-venue at the DB layer | **High** (blocking for SaaS, not for one-venue MVP) |
| **HESTIA University ↔ AI** | Academy lessons, doctrines, instructor video prototype, manifest (1,668 lines) | AI-driven tutoring (instructor talking head exists as a prototype only); persistent academy progress wired to backend | Academy progress lives in localStorage today | **Medium** |
| **EventBrain (`src/features/events/EventBrain.jsx`)** | 134 lines, floor plan + tables + localStorage | Not wired to the real Event module (`useEventState`, `/api/events`) | Two parallel event surfaces today | **Medium** — fold or move to `prototypes/` |
| **Test scaffolding** | None | `vitest` + 5 smoke tests on `barCalculationUtils.js` (pure functions, lowest friction) | No `__tests__`, no `test` script in `package.json` | **High** |
| **CI** | None | GitHub Actions or similar running `npm run build` + `npm test` on PR | No `.github/workflows/` | **High** |
| **DB migrations** | Inline `db.exec(...)` + bare `try { ALTER TABLE } catch {}` × 6 | Versioned migrations, rollback, env parity | Schema cannot be safely diffed across environments | **High** for production deploy |
| **Refresh-token / session lifecycle** | Sessions expire in 24h, single-use UUIDs | `/api/auth/refresh`; user is logged out hard after 24h | UX hit | **Medium** |
| **Guest portal hardening** | UUID tokens, `event_guest_table_assignments`, RSVP route | Captcha, rate limit, restricted CORS | `Access-Control-Allow-Origin: *` + no throttle | **Medium** |
| **Owner "real" intelligence pages (`BusinessMRI`, `ExecutiveOverview`)** | Hardcoded demo KPIs in `_archived/` | Either real data sources or honest empty states | Fabricated numbers reading as production | **Critical** if shown to investors |

---

## 6. Missing Core Folders or Architecture

### 6.1 Security / Operational

- **`express-rate-limit` middleware** on `/api/auth/login`, `/api/gemini`, `/api/coach`, `/api/simulate`, `/api/guest-portal/:token/rsvp`. None today.
- **`requireAuth(...)` on AI proxy endpoints.** `/api/gemini` (server.js:771), `/api/coach` (1319), `/api/simulate` (1336) are publicly callable.
- **`req.user.venue_id` + venue-scoped queries.** `event_guests`/`event_tables`/`event_tasks` SELECTs (server.js:2356, 2425, 2436, 2447, 2469, 2511) filter by `event_id` only.
- **Audit fix:** `req.verifiedPriceUser` referenced at server.js:2085, 2115 but never assigned. Replace with `req.user.full_name`.
- **Plaintext password cleanup.** `migrateUserCredentials` (server.js:687–692) should `UPDATE auth_users SET password = NULL WHERE password_hash IS NOT NULL`.
- **Move PII out of source.** Hardcoded employee names + access codes (`server.js:535–543`) should come from `.env`, a seed file gitignored, or `data/seed_users.json`.
- **`.env` audit trail.** Run `git log -p -- .env` to confirm no historical commit ever contained it (per the prior audit's standing recommendation, and rotate keys today regardless).
- **Drop the `VITE_` prefix** on `GEMINI_API_KEY` if it isn't actually consumed by the browser bundle — `VITE_` exposes the key to the client at build time.
- **Production CORS allow-list.** Currently a localhost regex with `*` fallback when there's no Origin header (server.js:50–64). Acceptable for dev, not for prod.

### 6.2 Persistence / Schema

- **`migrations/` folder** (umzug or db-migrate). Replace the six bare `try { ALTER TABLE } catch {}` blocks (server.js:501–516) with versioned migrations.
- **`schema_versions` table** tracking applied migrations.
- **`data/seeds/`** with documented demo data, separated from the live `hospia.sqlite`.

### 6.3 Quality / Tooling

- **`__tests__/`** with `vitest` configured.
- **`npm test`** and **`npm run lint`** scripts in `package.json`.
- **`.github/workflows/ci.yml`** running build + tests + lint on PR.
- **An ESLint rule** preventing `useState` / `useEffect` in `src/App.jsx`.
- **Bundle-size budget** in `vite.config.js`.

### 6.4 Product / SaaS

- **Onboarding flow** for new venues (today the venue is hardcoded as `venue-main`).
- **Billing / subscriptions** — no `stripe`, no `paddle`, no entitlement gates.
- **Analytics / product instrumentation** — no `Segment`, no `Mixpanel`, no `Amplitude`, no `PostHog`. Today the team has zero visibility into how managers actually use Shift Brain.
- **Error tracking** — no `Sentry`, no `Bugsnag`. `server.err.log` is 0 bytes — nothing is writing to it.
- **Feature-flag persistence** — flags are build-time JS in `src/config/featureFlags.js`; cannot be toggled per org.
- **Audit log scope** — only `verified_price_audit_log` exists. Login, role change, event deletion, user disable, and recommendation feedback all need audit trails before serious customers will sign.
- **Investor demo data path** — a separate "demo venue" seed (not the real `venue-main`) so live-data demos don't pollute the production-shape database.
- **`docs/SECURITY.md`** covering `.env` handling, role middleware, audit log, demo codes, key rotation cadence.
- **`docs/INDEX.md`** as the single front door for a new reader.
- **`docs/CONTRIBUTING.md`** translating CLAUDE.md rules into human-readable form.

### 6.5 Deploy

- No `Dockerfile`, no `docker-compose.yml`.
- No `deploy/` folder, no `Procfile`, no `render.yaml`, no `fly.toml`.
- No production runtime story documented anywhere. The README's `npm run dev` + `npm start` describes the dev loop only.

---

## 7. AI Intelligence Audit

### 7.1 Where AI is used today

- **Cocktail Lab** — `src/services/geminiCocktailAgent.js` (1,136 lines). Single entry point for cocktail generation, revision, and director consultation. Uses `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` + `buildKnowledgeContext`. Strict JSON parsing with fallback (`createFallbackCocktailProposal` in `cocktailService.js`).
- **Event Cocktail Menu** — `src/services/eventCocktailMenuService.js` (453 lines, **new since 2026-05-18**). Mirrors the agent architecture; explicitly forbids AI-generated cost; deterministic fallback; three-tier JSON repair.
- **Owner Insights** — `/api/owner/insights` (server.js:1916) with a 60-second cooldown, owner/admin role-gated. Driven by `services/ownerInsightService.js`.
- **Coaching / Simulation** — `/api/coach` (1319), `/api/simulate` (1336), `/api/analyze` (1365). The first two are unauthenticated.
- **Knowledge Base** — `src/domain/hospitality/bar/cocktailKnowledgeBase/` — 8 modules, selectively injected via `buildKnowledgeContext(prompt, form)`. Used by both Cocktail Lab and the new Event service.
- **Server-side preamble** — `askGemini(prompt, opts)` in `server.js:718–769` prepends a high-level `SYSTEM` block in non-JSON mode; skips it in JSON mode to avoid conflict with `responseMimeType: "application/json"`.

### 7.2 Is the AI logic strong or fragile?

**Stronger than the prior audit credited, with one caveat.** The Event-menu unification has eliminated the largest fragility (inline `/api/gemini` calls in feature files; AI-invented `pour_cost_estimate`). `grep -rn "/api/gemini" src/features` returns nothing — feature code no longer calls the AI directly.

What remains:

- **Prompt mojibake.** `src/prompts/geminiCocktailPrompts.js` lines 10 and 34 contain `managerג€™s` / `ג€™` — Windows-1252-as-UTF-8 mis-decoded glyphs. Every prompt that uses `SYSTEM_PROMPT` or `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` ships this to Gemini.
- **Three coexisting system-prompt layers** — server-level `SYSTEM`, `SYSTEM_PROMPT` (Cocktail Lab), `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` (Lab director + Event menu). Less risky now that the event surface uses the director prompt, but still worth consolidating.
- **Heuristic knowledge retrieval.** `buildKnowledgeContext` uses keyword detection (`containsAny(...)`). Works for English, will quietly fail for Hebrew or unusual phrasing. Embeddings-based retrieval is a Phase 3+ upgrade.
- **No tests on prompt outputs.** JSON parse failures fall to a generic error. Acceptable now; not at customer scale.

### 7.3 Centralized prompts?

- **Cocktail prompts:** centralized in `src/prompts/geminiCocktailPrompts.js` (`SYSTEM_PROMPT`, `BEVERAGE_DIRECTOR_SYSTEM_PROMPT`, `FEW_SHOT_EXAMPLES`, `BEVERAGE_DIRECTOR_FEW_SHOT_EXAMPLES`, `EXPECTED_FIELDS`).
- **Knowledge modules:** centralized in `src/domain/hospitality/bar/cocktailKnowledgeBase/` with a barrel `index.js` exporting `buildKnowledgeContext`.
- **Pricing context:** centralized in `cocktailLabPricingAdapter.js` (`getPricingContextSummary`).
- **Server preamble:** one block at the top of `server.js`.
- **`src/prompts/eventPrompts.js`** is misnamed — it's a deterministic text formatter for `generateExecutiveEventSummary`. Should be renamed and moved to `src/services/eventSummaryFormatter.js`.

### 7.4 Guardrails

- **Costing honesty:** structurally enforced. Cocktail Lab via `cocktailLabPricingAdapter`; Event via "do not include cost estimates" + post-hoc `enrichCocktailsWithCost`.
- **JSON validation:** `validateMenuResponse(...)` checks shape + non-empty cocktails + each cocktail has a name. `parseStrictJson(...)` does three-tier parsing (raw → extracted → repaired).
- **Deterministic fallbacks:** `createFallbackCocktailProposal`, `buildFallbackEventMenu`, `buildFallbackReplacement`. Emit `_fallback: true` and `_cost: UNAVAILABLE_COST` — never invent numbers.
- **No write actions:** AI never mutates the database directly. Every change is mediated by a service call and a user click.
- **Confidence + cost status surfaced to UI:** per-row dots, traffic-light gating, source labels.

What's **missing**:
- Output content moderation (e.g., a manager could prompt "explain something offensive" through `/api/coach` and get whatever Gemini returns).
- Token / cost telemetry on AI calls (no per-user, per-org, per-feature accounting).
- Prompt-injection defenses (no allowlist of structural fields; user-provided text is concatenated directly into prompts).

### 7.5 Does the system have enough domain knowledge?

**For cocktails: yes.** The knowledge base is unusually deep — flavor science, menu engineering, menu psychology, trend intelligence, bar operations, venue philosophy, kosher intelligence, zero-proof intelligence, classics database (1,121 lines). This is the AI defensibility layer.

**For everything else: not yet.** Wine, coffee, service, hosting, culinary, events, owner intelligence — all defined in `src/data/academy/*.js` doctrines (textbook content) but **not** yet packaged as `buildKnowledgeContext`-style retrieval. The HESTIA University surface is currently a content library, not an AI brain.

### 7.6 What should improve to make AI feel like a true hospitality expert

1. **Re-encode `geminiCocktailPrompts.js` in UTF-8.** Trivial; removes Gemini noise.
2. **Build `wineKnowledgeBase/`, `coffeeKnowledgeBase/`, `serviceKnowledgeBase/`** under `domain/hospitality/` once you start wiring those academies into AI flows.
3. **Embeddings-based retrieval** to replace `containsAny`-style keyword matching.
4. **A thin `src/services/aiClient.js`** so token telemetry, cost accounting, and prompt-injection defenses live in one place.
5. **Output content moderation** on `/api/coach` and `/api/simulate`.
6. **AI feedback loops.** Store every recommendation, user response (accept/reject/edit), and outcome in `recommendation_memory` per the strategy docs. Today there's no `recommendation_*` table.

---

## 8. Product Value Audit

### 8.1 What already feels valuable

- **Shift Brain** — the only product I have seen in this space that ships a deterministic "what to do next" instead of a chart. Real differentiator.
- **Costing honesty** — bar software that refuses to invent margins is genuinely rare. Operators will notice on first try.
- **Cocktail Lab with director-grade prompt + selective knowledge injection** — this beats every "ChatGPT for cocktails" demo a venue manager has seen.
- **Verified Price Entry + audit log** — pre-seed venues love the idea that price overrides are tracked (even though the audit log is currently broken — see §6.1).
- **Hospitality ontology** — investor-coded signal that the team understands the domain, not just the UI.
- **Event Cocktail Menu Service (new)** — unification with the Lab brain closes the largest "demo only" risk in the product.
- **HESTIA University surface** — the breadth of doctrines (service, bar, wine, coffee, culinary, hostess, manager, event, ethics) signals serious hospitality DNA, even though most of it isn't AI-connected yet.

### 8.2 What feels generic

- The **owner area** at 11 pages currently signals "BI dashboard." The strategy doc explicitly warns against this.
- **`EventBrain.jsx`** — a parallel demo-only event surface that shouldn't ship alongside the real Event module.
- **Several owner pages** (`BusinessMRI`, `ExecutiveOverview` in `_archived/`) show **fabricated KPIs** (`NIS 27.1k leakage`, `Hospitality Score 87`) — the worst possible signal to an investor or a venue owner.
- **Authentication UX** — username + 4-digit code is acceptable for one venue but reads as "demo only" the moment it's shown.

### 8.3 What feels like a real competitive advantage

- The **memory compounding architecture** (described in `HOSPIA_SYSTEM_ARCHITECTURE.md` §2.3) — if it actually gets built, it is the moat. The bones are there (events table, business_memory table, recommendation history concept) but the loop isn't closed yet.
- The **costing-honest pricing math** + **verified-price audit log** — combined, these are a "we don't lie about money" stance that incumbents (Toast, Restaurant365, Mews) cannot retrofit easily.
- The **deterministic Shift Brain** — every other AI hospitality product ships an LLM chatbot. HESTIA ships a deterministic function that an operator can trust without prompt engineering.
- **Operator-language UX** — the words on screen (Pre-Shift Briefing, Carry-Forward, Service Recovery, Verified Price, Build Guide) are hospitality-native. This is a soft moat investors register subconsciously.

### 8.4 What feels like a demo only

- `_archived/ExecutiveOverview.jsx`, `_archived/BusinessMRI.jsx`, `EventBrain.jsx`.
- Demo `README.md` users with `0000` passwords (`Peleg naim`, `Saar wax`, etc.).
- The Academy progress that lives only in localStorage.
- The carry-forward inheritance that the prior audit flagged — still not fully exercised end-to-end on the backend.

### 8.5 What would make a venue actually pay

In order of likelihood to drive first revenue from a bar-led venue (1–10 locations):

1. **A reliably closed daily loop.** Pre-shift → live → close → carry-forward → next pre-shift, with the manager genuinely saving 30–60 minutes per day. This is the wedge from `HOSPIA_STRATEGY_FOUNDATION.md` §2 and the strongest predictor of conversion.
2. **Costing honesty + verified-price audit** as a defensible cost-control feature ("our software won't lie to you about your margins"). This is a sales line that no incumbent can credibly say.
3. **Event Cocktail Menu** for venues that do private events — the unified service is the most demo-ready AI surface in the product.
4. **End-of-shift summary inheritance** — the moment a manager realizes their unresolved Friday-night problem is sitting on Saturday's pre-shift screen, retention becomes structural.

### 8.6 Modules most likely to create revenue first

1. **Shift Brain + End-of-Shift Review** (subscription cornerstone).
2. **Cocktail Lab + Verified Price + Bar Reports** (a paid module per bar program).
3. **Event Cocktail Menu Service + Event CRM** (a per-event or per-month premium add-on for venues that do private events).
4. **HESTIA University** (per-employee training subscription, later — once the AI tutor is connected).
5. **Owner Operational Pulse** (free for now; ladder into per-location premium reporting later).

---

## 9. What Should Be Added

### 9.1 Must-have for MVP (single venue)

- Closed end-to-end shift loop on backend (`/api/shifts/:id` + `/api/shift-reports` + `carry_forward_tasks`), with `EndOfShiftReview.jsx` writing the deterministic Shift Brain snapshot.
- Fix `req.verifiedPriceUser` bug in `server.js:2085, 2115`.
- Fix `useOperationsState.js:67` `currentUser?.username` scope bug.
- Rotate Gemini API keys; drop `VITE_` prefix if not consumed in browser.
- Add `requireAuth` to `/api/gemini`, `/api/coach`, `/api/simulate`.
- Add `express-rate-limit` to `/api/auth/login` (5 attempts / 5 min / IP).
- Re-encode `geminiCocktailPrompts.js` as UTF-8.
- Clean up all 13 empty files/folders (Section 3).
- Delete `src/components/ui/`.
- Flatten the nested `docs/cocktail-intelligence/docs/cocktail-intelligence/` path.
- Either restructure or rename `src/features/owner/_archived/`.
- Hide or rewrite the fabricated-KPI owner pages.
- Move 5 feature-flagged-off owner pages to `src/features/owner/wip/`.
- Add `docs/INDEX.md`, `docs/SECURITY.md`.
- Add `vitest` + 5 smoke tests on `barCalculationUtils.js`.
- Add `package.json` `test` + `lint` scripts.

### 9.2 Must-have for investor demo

- A **clean demo venue seed** (separate from `venue-main`) with realistic but visibly synthetic data.
- A **demo script** in `docs/DEMO_SCRIPT.md` showing the closed daily loop end-to-end on the demo venue.
- A **one-screen Investor Overview** in `OperationalPulse.jsx` style — not a dashboard, a pulse.
- A **product walkthrough video** (5 min) embedded in `README.md`.
- **Mobile-responsive verification** of the Shift Brain flow on a real phone — the strategy doc says "2 AM operational design"; we need to prove it.
- **A single front-door doc** (`docs/INDEX.md`) so an investor can follow strategy → architecture → live demo → live code in four clicks.

### 9.3 Must-have for real paying customers

- **Multi-tenancy** — `req.user.venue_id`; venue-scoped queries everywhere; per-venue `featureFlags`.
- **Billing** — Stripe (or similar) with at least one paid SKU.
- **Account management** — create venue, invite users, role assignment, password reset, refresh tokens.
- **Production deploy story** — Dockerfile, environment-specific configs, log shipping, error tracking (Sentry).
- **Real audit logging** beyond `verified_price_audit_log` — login, role change, event deletion, user disable.
- **Backup + restore** for `hospia.sqlite` (or migrate to Postgres before customer #2).
- **GDPR / data deletion** flow for guest data (per `HOSPIA_SYSTEM_ARCHITECTURE.md` §7).
- **SLA / uptime monitoring** — a tiny status endpoint at minimum.
- **CI / CD** — green-build gate before deploy.
- **Tests** — at least one E2E test for the daily loop; unit tests for every pure utility.

### 9.4 Future premium features (V2/V3 from `HOSPIA_STRATEGY_FOUNDATION.md` §9)

- **Inventory intelligence** — counts, variance, anomaly detection, reorder suggestions (requires POS integration).
- **Labor forecasting** — sales/reservation/weather-driven.
- **Guest memory** — preferences, recovery history, VIP context.
- **Cross-location benchmarking** — drift detection, location ranking.
- **Coaching prompts** — repeated incidents → coaching action.
- **Predictive ordering** — supplier substitution logic.
- **Autonomous action routing** — only after the deterministic engine has proven reliability for a year.
- **Recommendation feedback loop** — accept / reject / outcome on every AI suggestion (`recommendation_memory` table).
- **Embeddings-based knowledge retrieval** to replace heuristic keyword detection.
- **Multi-language AI** (Hebrew first, given founder context).

---

## 10. What Should Be Removed or Simplified

### 10.1 Delete

- Six empty source files (§3).
- Seven empty feature folders (§3).
- Three dead compat shims in `src/data/` (§3).
- `src/components/ui/` (§4).
- `server.err.log`, `server.out.log` (§3).
- `package.json` `dependencies.openai` (dead dep, §4).

### 10.2 Hide or rewrite

- The two `_archived/` owner pages with fabricated KPIs (`BusinessMRI`, `ExecutiveOverview`). Either replace with honest empty states or hide until real data feeds them.
- `EventBrain.jsx` — move to `src/prototypes/` or fold into the real Event module.
- `OperationalPulse` `pulseData` and `trends` should be confirmed to come from real backend queries before being demoed to investors.

### 10.3 Move

- `HESTIA_AUDIT_AND_NEXT_PHASE.docx` → `docs/strategy/`.
- Nested `docs/cocktail-intelligence/docs/cocktail-intelligence/` → flatten to one level.
- `src/prompts/eventPrompts.js` → `src/services/eventSummaryFormatter.js`.
- 5 feature-flagged-off owner pages → `src/features/owner/wip/`.
- 10 `_archived/` owner pages → either back to `src/features/owner/` (and delete the shims) or to `src/features/owner/legacy/` with a `README.md` explaining the status. **Either is acceptable; the current naming is not.**

### 10.4 Simplify

- `src/hooks/useOperationsState.js` (488 lines, owns 8 slices) — split into `useEventPlansState`, `useIncidentsState`, `useEmployeeRequestsState`, `useAssignedTasksState`, `useBudgetRequestsState`.
- `src/features/bar/CocktailLabStudio.jsx` (1,047 lines) — extract `CocktailLabHeader`, `CocktailLabRowList`, `CocktailLabFooter`.
- `src/features/bar/BottlePrices.jsx` (965 lines) — extract `BottlePricesTable`, `BottlePricesVerifyPanel`, etc.
- `src/domain/hospitality/bar/classicCocktailLibrary.js` (1,121 lines) — split per family (sours / stirred / highballs / tiki / tropical / aperitif).
- `server.js` (2,741 lines) — extract per-domain route modules into `server/routes/{events,cocktails,shifts,owner,academy,auth}.js`. The single-file server has carried HESTIA this far but will not survive a third developer.

### 10.5 Confusing naming to fix

- `src/features/owner/_archived/` is not archived; rename or restructure.
- `src/prompts/eventPrompts.js` is not a prompt; rename.
- `src/data/cocktailLab.js`, `src/data/cocktails.js`, `src/data/operations.js` are static seeds, not state — consider moving to `src/data/seeds/`.
- `hospia.*` localStorage keys (e.g. `hospia.operationalNotes`, `hospia.eventBrain.v1`, `STORAGE.futureEvents`) — these are the technical-identifier debt `CLAUDE.md` warns about. A future HESTIA-brand cleanup needs a migration shim.
- The `X-HOSPIA-Role` header is still in the server's `Access-Control-Allow-Headers` allow-list.

---

## 11. What Would Make This Folder "Worth a Lot of Money"

Brutally strategic.

### 11.1 Architecture

- **Close the daily loop on backend.** The Shift Brain service produces the right output. The pre-shift, action board, and end-of-shift surfaces exist. The remaining work is wiring every write through `/api/...` rather than localStorage, and making the next pre-shift actually read carry-forward from `carry_forward_tasks`. The moment a manager experiences "yesterday's unresolved problem is on today's screen, automatically" — the product has retention.
- **Split server.js into route modules.** The 2,741-line monolith is a hire-blocker.
- **Add proper migrations.** Schema drift is the first thing a serious DD reviewer asks about.
- **Replace `defaultVenueId()` with `req.user.venue_id` everywhere.** This single change converts "one-venue app" into "SaaS-ready."

### 11.2 Product clarity

- **Cut the owner area to one page.** Promote `OperationalPulse` to the owner home; freeze the other ten behind flags. Strategy doc demands it.
- **Make the wedge visible in the UI.** The home screen for a manager should be Shift Brain, not "All Pages." For an owner, OperationalPulse. For a bar manager, the closed shift loop + Cocktail Lab.
- **Delete the fabricated-KPI surfaces.** A venue owner who sees `NIS 27.1k leakage` for a venue you've never measured will never trust the rest of the product.

### 11.3 Real customer pain

- **Make incident capture one tap.** The strategy doc says "one action, one reason, one context note." Today `ServiceRecovery.jsx` and `ManagerActionCenter.jsx` are close but not one-tap.
- **Ship the end-of-shift summary** that fits on one phone screen.
- **Show the manager 30–60 minutes of time saved.** Instrument it; surface it; turn it into the retention story.

### 11.4 Data intelligence

- **Build the recommendation feedback loop.** Every recommendation Shift Brain produces should be tagged with `recommendation_id`; every user accept/reject/edit/outcome should be persisted. This is the strongest moat lever in the strategy doc.
- **Add cross-shift drift detection** once 30 days of data exists.
- **Add a `recommendation_memory` table** and a service that queries it.

### 11.5 AI defensibility

- **Re-encode the prompts** (UTF-8). Trivial; raises perceived quality immediately.
- **Build `wineKnowledgeBase/`, `coffeeKnowledgeBase/`, `serviceKnowledgeBase/`.** Today only beverage/cocktail has been distilled into the AI brain.
- **Add embeddings retrieval.** Heuristic keyword matching is the right MVP choice; embeddings are the right Phase 3+ upgrade.
- **Add token telemetry + cost accounting.** Investors ask "what does each AI call cost you?" — you should know.

### 11.6 Hospitality domain depth

- **The hospitality ontology** in `src/domain/hospitality/` is already the strongest "we know hospitality" signal in the codebase. Wire one concept (e.g., `Cocktail`, `Shift`, `Incident`) all the way through to a real database schema and a service. Move at least one entity from "inert reference" to "this is the source of truth that drives a table."

### 11.7 Demo quality

- **One-screen demo path.** Open → login → see pre-shift brief → log an incident → close shift → see the carry-forward → see Cocktail Lab → see Event Cocktail Menu → done. 5 minutes. No back-button required.
- **One demo venue with clean realistic data.** Not the real `venue-main`.
- **A 90-second walkthrough video.**

### 11.8 Scalability

- **Multi-tenancy.** §6.4.
- **Postgres migration** before customer #3 (SQLite is fine for one venue; not for a SaaS).
- **Production deploy story** with Docker + log shipping + error tracking.

### 11.9 Security

- **Auth on AI proxy endpoints.** §6.1.
- **Rate limiting** on login, AI, RSVP.
- **Plaintext password cleanup.** §6.1.
- **PII out of source.** Hardcoded employee names must move.
- **API key hygiene.** Drop `VITE_` prefix; rotate keys; confirm git history.

### 11.10 Monetization

- **At least one paid SKU wired** (even if "paid manually" in V1) — Stripe checkout link, a `subscription` table, a `requireSubscription` middleware on premium routes. Investors need to see the door, not just the building.

### 11.11 Investor storytelling

- **`docs/INDEX.md`** as the single front door.
- **`docs/PITCH.md`** with the wedge, the moat, the daily loop, and one chart proving manager time saved.
- **`docs/AI_ARCHITECTURE.md`** explaining the layered brain (prompts → knowledge → pricing → fallback).
- **The README.md should open with the wedge statement, not the demo-user table.** The current README opens with credentials.

---

## 12. Priority Roadmap

### Phase 1 — Cleanup and stabilization (1 week)

**Goal:** Remove visible scar tissue and fix correctness bugs so the codebase reads as serious on first inspection.

**Tasks:**

- Rotate Gemini API keys; drop `VITE_` prefix unless browser uses it. (`.env`)
- Delete 13 empty files/folders. (§3)
- Delete `src/components/ui/`. (§3)
- Delete the three dead shims in `src/data/`. (§3)
- Delete `package.json` `dependencies.openai`. (§4)
- Re-encode `src/prompts/geminiCocktailPrompts.js` as UTF-8.
- Fix `req.verifiedPriceUser` in `server.js:2085, 2115`.
- Fix `useOperationsState.js:67` `currentUser?.username` scope bug.
- Move `HESTIA_AUDIT_AND_NEXT_PHASE.docx` to `docs/strategy/`.
- Flatten `docs/cocktail-intelligence/docs/cocktail-intelligence/`.
- Add `requireAuth` to `/api/gemini`, `/api/coach`, `/api/simulate`.
- Add `express-rate-limit` to `/api/auth/login` (5 / 5 min / IP).
- Clear `auth_users.password` plaintext column after hashing.
- Move hardcoded employee seed (server.js:535–543) out of source.
- Add `docs/INDEX.md`, `docs/SECURITY.md`.
- Add `package.json` `test` script + `vitest` + 5 smoke tests on `barCalculationUtils.js`.
- Add ESLint rule preventing `useState`/`useEffect` in `App.jsx`.

**Files / folders involved:** roots of `src/`, `docs/`, `server.js`, `package.json`, `.env`.

**Expected result:** ~30 minutes of visible scar tissue removed; three correctness bugs fixed; three publicly callable AI endpoints secured; first tests in place; first lint guard in place. Investability grade rises from B− to B+.

**Risk level:** Low. Almost all of this is delete + move + minor edits.

### Phase 2 — Architecture and folder structure upgrade (1–2 weeks)

**Goal:** Make the architecture as honest about its boundaries as the strategy docs promise.

**Tasks:**

- Decide on `src/features/owner/_archived/` strategy (restore-and-flatten, rename, or delete the flagged-off pages). (§6.4 of prior audit; §10.3 here)
- Move 5 feature-flagged-off owner pages to `src/features/owner/wip/`.
- Hide or rewrite `BusinessMRI` and `ExecutiveOverview` to remove fabricated KPIs.
- Move `EventBrain.jsx` to `src/prototypes/` or fold into real Event module.
- Split `server.js` into per-domain route modules under `server/routes/`.
- Split `src/hooks/useOperationsState.js` into 4–5 single-domain hooks.
- Extract `src/services/aiClient.js` — single owner of every `/api/gemini` call.
- Rename `src/prompts/eventPrompts.js` → `src/services/eventSummaryFormatter.js`.
- Add a `migrations/` folder using `umzug` or `db-migrate`; convert the six `try { ALTER } catch {}` blocks.
- Split `src/domain/hospitality/bar/classicCocktailLibrary.js` per family.
- Extract `CocktailLabStudio.jsx` and `BottlePrices.jsx` into subcomponents.
- Document the layered architecture in `docs/AI_ARCHITECTURE.md` and `docs/CONTRIBUTING.md`.

**Files / folders involved:** `server.js`, `src/hooks/`, `src/features/owner/`, `src/services/`, `migrations/`, `docs/`.

**Expected result:** server.js no longer a monolith; hooks no longer overweight; owner area no longer confusing; migrations no longer hand-rolled; AI calls funneled through one client; docs front-door exists. Investability grade B+ → A−.

**Risk level:** Medium. Server split is the riskiest single change — needs careful module-by-module migration and a smoke-test pass per route.

### Phase 3 — Core product intelligence (2–3 weeks)

**Goal:** Close the daily loop end-to-end on backend so HESTIA delivers the operational promise of the strategy docs.

**Tasks:**

- Wire every Action Board / Operational Notes / Incident write through the API instead of localStorage.
- Build the End-of-Shift Review surface that consumes the deterministic `shiftBrain` snapshot, writes to `/api/shift-reports`, persists to `carry_forward_tasks`.
- Make the next pre-shift briefing actually read `carry_forward_tasks` and present unresolved items first.
- Instrument "manager time saved" (start with naive: timestamp on open → close → next open; show delta).
- Build the `recommendation_*` table + service so every Shift Brain output is persisted with `recommendation_id` and feedback can be captured.
- Wire `req.user.venue_id` throughout `server.js`; replace `defaultVenueId()` with `req.user.venue_id`.
- Add Sentry (or similar) for error tracking; structured logging on the server.
- Add login audit log; user-disable audit log; role-change audit log.

**Files / folders involved:** `server.js` (now route modules), `src/services/shiftBrainService.js`, `src/hooks/useShiftBrainState.js`, `src/features/shift-brain/`, `src/features/operations/EndOfShiftReview.jsx`, `src/hooks/useShiftState.js`, all event-related route handlers.

**Expected result:** the closed daily loop, on real data, in one venue, end-to-end. The wedge is now demonstrable. Investability grade A− → A.

**Risk level:** Medium-high. This is the product, not the plumbing. Every change here is user-facing.

### Phase 4 — Investor-ready demo (1 week)

**Goal:** A clean, fast, mobile-tested demo path with a clean demo venue.

**Tasks:**

- Build a "demo venue" seed separate from `venue-main`.
- Build a 90-second walkthrough video.
- Add `docs/DEMO_SCRIPT.md` and `docs/PITCH.md`.
- Real-phone QA on the closed daily loop (Shift Brain → action → incident → close → next pre-shift).
- One-screen Investor Overview surface (extend `OperationalPulse`).
- A README.md rewrite that opens with the wedge statement, ends with credentials.

**Files / folders involved:** `data/seeds/`, `docs/`, `README.md`, `src/features/owner/OperationalPulse.jsx`.

**Expected result:** a demo a hospitality-tech angel can sit through and remember. Investability grade A.

**Risk level:** Low. Mostly content and narrative work.

### Phase 5 — Real SaaS readiness (4–6 weeks)

**Goal:** Get to customer #2 without rewriting anything.

**Tasks:**

- Postgres migration (from SQLite). Keep WAL-mode SQLite for local dev.
- Stripe (or Paddle) integration; one paid SKU; `subscription` table; `requireSubscription` middleware on premium routes.
- Multi-tenant onboarding flow (venue creation, user invitation, role assignment).
- Password reset + refresh tokens.
- Dockerfile + production deploy story (Render / Fly / Railway / AWS — choose one).
- CI on GitHub Actions (build + tests + lint on PR).
- Backups + restore for the database.
- Real audit logging (login, role change, user disable, event deletion).
- GDPR / data deletion flow for guest data.
- Status page + uptime monitoring.
- E2E tests on the closed daily loop.

**Files / folders involved:** entire `server/`, `migrations/`, `infra/` (new), `.github/workflows/`, billing module (new).

**Expected result:** a real SaaS that can sign customer #2 without a rebuild. Investability grade A → A+.

**Risk level:** High. This is the SaaS infrastructure lift. Plan as its own funded sprint.

---

## 13. Final CTO Recommendation

**What you should do first:**
Phase 1 — the one-week cleanup pass. Rotate keys, lock down the three unauthenticated AI endpoints, add `requireAuth` and `express-rate-limit`, fix the two live correctness bugs (`req.verifiedPriceUser` and `useOperationsState.js:67`), delete the 13 empty scaffolds, delete `src/components/ui/`, re-encode `geminiCocktailPrompts.js` in UTF-8, decide on `_archived/`. Phase 1 is mostly delete + minor edit work. It costs you one week and lifts the investability grade by half a notch.

**What you should avoid doing next:**
Adding new owner pages. Adding new academies. Adding new ontology entities. Adding new domain layers. Building a "dashboard home." Wiring more demos. Every one of those moves widens the surface area before the daily loop closes — exactly what the strategy doc tells you not to do. The product is currently 70% built and 90% surfaced. Drag the build percentage up before adding any more surface.

**What is the highest-leverage improvement:**
Close the daily loop on backend (Phase 3). The pre-shift brief, action board, incident capture, end-of-shift summary, and carry-forward are all most of the way built. The single highest-leverage thing in this codebase is making "yesterday's unresolved problem is on today's pre-shift screen, automatically, on a real backend" actually work for one venue. The moment that ships, HESTIA has a retention story no incumbent can match.

**What is the biggest current risk:**
Three risks tied for first place.

1. **Authorization gaps.** `/api/gemini`, `/api/coach`, `/api/simulate` are publicly callable. Anyone reaching the server can drain the Gemini key. This is a one-day fix and the single most embarrassing thing a DD reviewer would find.
2. **Fabricated KPIs in `_archived/` owner pages.** `NIS 27.1k leakage` is the number a venue owner will quote back to a friend when explaining why they don't trust the software. The pages are flagged off in nav but still in source. Either delete them or rewrite them with honest empty states.
3. **Live correctness bug in the audit log.** `req.verifiedPriceUser` is undefined; the verified-price audit log — which is one of the strongest "we don't lie about money" stories in the product — is silently writing `undefined` to `saved_by` on every override and delete. The story is structurally true, factually broken.

**What I would personally focus on if I wanted this company to become valuable:**

Tighten the wedge. Don't add anything new for six weeks. Use those six weeks to do Phases 1–3 in order, exactly as specified. At the end of week 6, HESTIA at one live venue has:

- a clean codebase that reads as serious on first inspection,
- a closed daily loop on a real backend,
- a deterministic Shift Brain that fills in the next pre-shift from yesterday's unresolved work,
- a Cocktail Lab + Event Cocktail Menu Service that ship hospitality-grade AI output with no invented numbers,
- a verified-price audit log that actually works,
- no fabricated KPIs anywhere,
- no public AI endpoints,
- one venue's worth of real operational data flowing through the memory layer,
- a 90-second walkthrough video,
- and a single front-door doc set.

At that point HESTIA is not a prototype. It is a one-venue product that is six steps from being a SaaS. The investment story stops being "we will build a moat" and becomes "the moat is already accumulating; here is one venue's data flowing through it for the last 60 days." That is the difference between B− and A.

Everything else — wine knowledge base, embeddings retrieval, inventory forecasting, guest memory, multi-site benchmarking, autonomous routing — is V2/V3 from the strategy doc. They are real and they matter. They are not what is between you and your first investor.

---

**Closing note.** HESTIA has the rarest combination in pre-seed hospitality tech: a founder with real industry depth, a strategy document that names its own failure modes, and a codebase that visibly enforces the rules from the strategy document. The structural debt is real but contained, and almost all of it is delete-not-rewrite. The most dangerous failure mode from here is not technical — it is the temptation to keep adding surface instead of finishing the spine. Close the loop. Cut the scar tissue. Rotate the keys. Then talk to investors.
