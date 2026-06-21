# HESTIA Full App Deep QA Audit

**Audit date:** 2026-06-21
**Mode:** Read-only QA + live runtime/AI behavior testing. No production code changed.
**Auditor role stack:** senior QA lead · software architect · product manager · hospitality operator · AI behavior evaluator · luxury UX critic · founder consultant.
**Report file:** `docs/audits/HESTIA_FULL_APP_DEEP_QA_AUDIT.md` (this file — the only file created).

**Evidence legend used throughout:**
`[REPO]` verified in source · `[RUNTIME]` verified live in the running app/API · `[TEST]` verified by a test/build command · `[DOCS]` verified in docs only · `[INFER]` reasoned, not directly proven · `[UNVERIFIED]` not checked · `[STALE]` doc/claim contradicted by current code · `[DANGER]` dangerous if treated as implementation truth.

---

## 0. Git / Repo State

| Item | Value |
|---|---|
| Branch | `main` |
| HEAD commit | `e77974fa5a7c2094c261a9aba054bbd34406c3f0` — "docs: correct AI provider and VITE Gemini risk claims" |
| Sync vs `origin/main` | In sync — 0 ahead / 0 behind `[RUNTIME]` |
| Working tree (before audit) | Clean except 2 untracked docs |
| Untracked (before) | `docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md`, `docs/plans/HESTIA_TOTAL_RESEARCH_AND_AGENT_ACTION_PLAN.md` |
| `docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md` | Exists, **untracked** — **left untouched by this audit** |
| `docs/plans/HESTIA_TOTAL_RESEARCH_AND_AGENT_ACTION_PLAN.md` | Exists, **untracked** — **left untouched by this audit** |
| Dev servers already running | Vite (HTTP 200, `<title>HESTIA</title>`) on **:5173** and **:5174**; Express API on **:3001** (health OK) `[RUNTIME]` |
| Browser automation | Playwright `1.60.0` + Chromium `1223` installed locally — **used** `[RUNTIME]` |

---

## 1. Executive Summary

HESTIA is, today, a **stable, professionally-built, partially-connected hospitality platform** — not a demo and not vaporware. Every safe build and test command passes. The app runs across all six roles with **zero crashes and near-zero console errors**, lands each role on the correct home, and enforces authentication on every API route but the two intentionally-public guest-portal endpoints. The Venue DNA write path is genuinely disciplined: a single sanctioned writer, monotonic confidence, no fabrication, no auto-confirmation, and a candidate system that never promotes to DNA. The intelligence test suites (hospitality DNA, completeness, F&B ledger, menu intelligence, zero-state) are green with **712 assertions passing**.

The weaknesses are **product-coherence and AI-output depth**, not stability:

1. **The flagship AI surface under-delivers on an explicit owner brief.** A controlled Venue Intelligence test (the Paradiso+SIPS concept prompt) returned **five clarifying questions and none of the four requested artifacts** (concept brief, service lines, cocktail-menu style, six original cocktails, operational risks). It also violated its own system-prompt "ask at most one question" rule. Safe but shallow. **Score: 2/5.**
2. **The "source of truth" docs are materially stale.** `server.js` is **7,857 lines** (docs say 6,503); the DB has **61 tables** (docs say 51); the architecture audit and CTO roadmap still describe HESTIA as single-venue (`defaultVenueId()`), but multi-venue (Phase 8) shipped 2026-06-14. An agent trusting these docs will plan the wrong work. `[STALE]`
3. **Demo-data contamination persists in 8 Event Architect components** — still importing `eventBrainDemoData` (Cohen-Levi Wedding, named waiters). Credibility risk if a real event is shown through the Architect.
4. **Venue Intelligence has no concept of "a new venue concept inside an existing session."** The Paradiso turn was merged into the existing `venue-main` flagship DNA. Single-venue-per-session is an implicit assumption with no guardrail.

None of these are P0. There are **no P0 findings**. The first fix should be the flagship AI deliverable behavior (P1), because the chat *is* the owner's home and it currently disappoints on the exact task it advertises.

---

## 2. Scope & Method

**Read (context, treated as claims not proof):** `CLAUDE.md`, `docs/HESTIA_MASTER_STATE.md`, `docs/HESTIA_ARCHITECTURE_AUDIT.md`, `docs/HESTIA_CTO_ROADMAP.md`, `docs/gems/hestia-research-brain/01_HESTIA_CURRENT_STATE.md`, `docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md`, memory index, package.json, server.js (targeted sections), API client, navigation/role config.

**Inspected statically:** repo layout, `server.js` route/auth/venue/DNA logic, AI provider wiring, demo-data importers, localStorage keys, naming, empty dirs, gitignore coverage.

**Ran (safe only):** `node --check server.js`, `npm run build`, `npm run hestia:check`, 5 deterministic test scripts. Build writes `dist/` (gitignored). No destructive/DB-reset/AI-cost test scripts were run except the single disclosed Paradiso AI call.

**Ran live:** Playwright across 6 roles against the running dev server (login via API token injected into `localStorage`); one real Venue Intelligence AI turn (Paradiso+SIPS).

**Not done:** mobile-device testing; CI cocktail-generation live call (avoided to not mutate CI data); reading `.env` values; production data. See §22.

---

## 3. Commands Run

| Command | Result | Mutates? |
|---|---|---|
| `git` status/branch/log/rev-list | clean, in sync `[RUNTIME]` | no |
| `node --check server.js` | **OK** (syntax valid) `[TEST]` | no |
| `npm run build` | **PASS** — ✓ built in 9.45s `[TEST]` | writes `dist/` (gitignored) |
| `npm run hestia:check` | **PASS** — 0 FAIL, 2 WARN `[TEST]` | reads only |
| `node scripts/test-hospitality-dna.js` | **90 passed / 0 failed** `[TEST]` | no |
| `node scripts/test-venue-dna-completeness.js` | **390 passed / 0 failed** `[TEST]` | no |
| `node scripts/test-fb-decision-ledger.js` | **128 passed / 0 failed** `[TEST]` | no |
| `node scripts/test-menu-intelligence.js` | **69 passed / 0 failed** `[TEST]` | no |
| `node scripts/test-first-run-venue-zero-state.js` | **35 passed / 0 failed** `[TEST]` | no |
| `node scripts/inspect-current-venue-dna-state.js` | read-only DNA diagnostic `[RUNTIME]` | no |
| Playwright 6-role runtime sweep | **0 crashes**; 2 roles 1×403 each `[RUNTIME]` | no (read-only nav) |
| Venue Intelligence Paradiso AI turn | HTTP 200, 13.5s `[RUNTIME]` | **yes — +1 turn merged into `venue-main` DNA** (disclosed) |

Helper scripts were written to gitignored `.local-artifacts/` (not tracked). `dist/` and `director.debug.log` were regenerated/appended (gitignored).

---

## 4. Build/Test Results

- **`node --check server.js`** → valid. `[TEST]`
- **`npm run build`** → success in 9.45s. ⚠ Single JS chunk **2,521 kB (688 kB gzip)**, no code-splitting — Vite warns "chunks larger than 500 kB". Perf/UX risk on slow connections (P3). The PowerShell "NativeCommandError" line is only stderr-wrapping of Vite warnings, **not** a failure. `[TEST]`
- **`npm run hestia:check`** → no FAILs. 2 WARNs: (a) `learningProgress` component has no PAGE_META/route (known dead UI); (b) `.env` present (values not read — expected). `[TEST]`
- **5 deterministic test suites** → **712 assertions, 0 failures** total. Intelligence/DNA layer is well-covered. `[TEST]`

Confidence: **high** — these are repeatable and were observed directly.

---

## 5. Static Code QA

### Build / runtime risk
- `server.js` syntax valid; **178 API routes** `[REPO]`. No syntax errors found.
- **No production imports from `prototypes/`** in `src` `[REPO]` — prototype isolation holds.
- **No user-facing "HOSPIA" leakage** in `src/*.jsx/.js` (all remaining `hospia.*` are intentional technical identifiers: localStorage keys, `X-HOSPIA-Role` CORS header, `data/hospia.sqlite`) `[REPO]`.
- AI provider naming is **misleading but functional**: `askGemini()` and `askGeminiChat()` both call **OpenAI `gpt-4o-mini`** (server.js:1588, 1602, 4182, 4194) `[REPO]`. Real Gemini *is* used, but only at server.js:7318 and 7683 (`generativelanguage.googleapis.com`, `MODEL`/`gemini-2.0-flash-lite`). Flagship chat + Venue Intelligence + cocktail/menu generation run on **OpenAI** (`gpt-4o-mini`, and `gpt-4o` for visual menu design at 6534). Function names are not an architecture source of truth. (Matches the gem reconciliation note.) `[REPO]`

### Structure risk
- **Empty/dead feature dirs** (local-only; git does not track empty dirs): `src/features/cocktail-lab`, `src/features/dashboard`, `src/features/docs`, `src/features/notifications`, `src/features/tasks`, `src/features/knowledge/data`, `src/prototypes`. `src/features/cocktail-lab` has **zero references** in code — the live Cocktail Lab lives in `src/features/bar/` (per CLAUDE.md). Stale empty shells. `[REPO]`
- **Demo-data contamination — confirmed live:** `eventBrainDemoData` / `EVENT_BRIEF` / `BAR_PROGRAMME` / `STAFF_NOTIFICATIONS` imported by **8 event components**: `ZoharPanel.jsx`, `PlanningSummary.jsx`, `EventBriefCard.jsx`, `BarProgramme.jsx`, `StaffNotifications.jsx`, `SelectedTablePanel.jsx`, `EventArchitectPrintableBrief.jsx`, plus the adapter `eventArchitectAdapter.js` and `EventBrain.jsx`. `[REPO]` Matches the architecture audit's "most credibility-damaging gap."
- `server.js` at **7,857 lines / 382 KB** — single-file backend, maintainability risk (Phase 4 split deferred, correctly). `[REPO]`

### Stale-doc risk `[STALE]` `[DANGER]`
| Doc claim | Reality | Evidence |
|---|---|---|
| server.js = 6,503 lines | **7,857 lines** | `wc -l` `[REPO]` |
| 51 DB tables | **61 tables** | `/api/health` `[RUNTIME]` |
| Single venue, `defaultVenueId()="venue-main"`, "multi-venue not supported" | **Multi-venue shipped (Phase 8, 2026-06-14)**; 181 `req.venueId` usages; venue header resolution + 403 on unauthorized venue | server.js:1309/1470, `[REPO]` |
| Gemini primary / OpenAI visual-only | **OpenAI primary for flagship flows** | server.js `[REPO]` |

`HESTIA_ARCHITECTURE_AUDIT.md` and `HESTIA_CTO_ROADMAP.md` are dated 2026-06-09 and predate Owner AI Home, Venue DNA taxonomy/completeness, and multi-venue. The gem pack `01_HESTIA_CURRENT_STATE.md` correctly flags this, but the three CLAUDE.md-mandated "source of truth" files do not self-warn.

---

## 6. Runtime / UI QA

Method: Playwright Chromium, 1440×900, token injected per role, `networkidle` + 2.5s settle, console/pageerror capture, screenshot. `[RUNTIME]`

| Role | User | Landing URL | Crash? | Console errors | Notes |
|---|---|---|---|---|---|
| owner | tal | `/owner/home` (OwnerAIHome) | none | **0** | Correct per Phase 1 nav posture. Nav: Owner Command, Venue Intelligence, Owner AI Home, Operational Pulse. |
| admin | toam | `/` (superuser root) | none | **0** | Full nav (all modules) — expected for admin superuser. |
| events_manager | zohar | `/events` | none | **0** | Correct landing. Nav scoped to Events + Calendar + Finance. |
| fb_director | omer | `/academy/courses` | none | **1× 403** | A surface fetches a route the role can't access (backend correctly denies). Noisy, not a leak. |
| manager | peleg | `/ops/briefing` (Pre-Shift Briefing) | none | **0** | Correct. Nav includes Pre-Shift, Shift Control, Requests, Notes, Budget. |
| employee | hadar | `/` (Employee Home) | none | **1× 403** | Same noisy-fetch pattern as fb_director. Two-world Home (Learn / Work) renders cleanly. |

**Verdict:** the app is runtime-stable. No white screens, no React error boundaries triggered, correct role-aware landings and nav scoping. The only runtime defect is a **background 403 fetch** for `fb_director` and `employee` — a component requesting data its role isn't permitted to read. It is *correct* security behavior surfaced as a console error; the bug is the client over-fetching. P3.

Screenshots saved to gitignored `.local-artifacts/qa-shots/`.

---

## 7. Button & Interaction Audit

Interactions were exercised via role landings and nav rendering; deep per-button click-through was **not** exhaustively performed (time-boxed; no destructive clicks). Table reflects what was verified live `[RUNTIME]` vs. read in code `[REPO]`.

| Button / action | Location | Expected | Actual | Works? | Sev | Notes |
|---|---|---|---|---|---|---|
| Login (token path) | Auth | Authenticate, route to role home | All 6 roles authenticated; correct landings | ✅ `[RUNTIME]` | — | Verified via `/api/auth/login` + silent restore |
| Role nav routing | TopNav | Role-scoped nav, gated pages | Correct per-role nav rendered | ✅ `[RUNTIME]` | — | NAV_GROUPS + PAGE_META gating effective |
| Venue Intelligence chat submit | Owner AI / Venue Intelligence | AI reply + DNA update | HTTP 200, reply + merged DNA persisted | ⚠️ `[RUNTIME]` | P1 | Works mechanically; **output under-delivers** (see §10) |
| Background data fetch (fb_director/employee home) | role landing | Load permitted data | 1× 403 to a forbidden route | ⚠️ `[RUNTIME]` | P3 | Client over-fetch; no data leak |
| Owner nav depth layers | Owner Command / Pulse / DNA | Reach depth pages | Nav entries present & routed | ✅ `[RUNTIME]` | — | OperationalPulse is a destination, not home (correct) |
| Seed to CI / Generate Food Menu (Zohar) | EventDetail → Zohar | Cross-dept seeding | **Not built** (Phase 1 connection pending) | ❌ `[DOCS]` | P2 | Per roadmap; clipboard-only today |
| `learningProgress` page | Academy | Reachable | No route / no PAGE_META | ❌ `[TEST]` | P3 | Dead UI; hestia:check WARN |

Deeper click-through (Save/Approve/Regenerate/Export/calendar-event-click/filters) was **not** fully exercised this pass — flagged in §22.

---

## 8. Folder / File Hygiene Audit

| Folder / file | Issue | Safe to delete? | Investigate? | Recommendation |
|---|---|---|---|---|
| `src/features/{cocktail-lab,dashboard,docs,notifications,tasks}` | Empty shells; `cocktail-lab` has 0 refs | Likely yes (empty) | Light | Remove empty dirs in a hygiene pass (Phase 4 cleanup); confirm none are eslint/glob anchors |
| `src/features/knowledge/data`, `src/prototypes` | Empty | Likely yes | Light | Same |
| 8 Event Architect components | Import `eventBrainDemoData` | **No** | Yes | De-mock (roadmap Phase 2.1) — do not delete; tech debt |
| `director.debug.log`, `server.*.log`, `vite.*.log` (root) | Generated logs, **gitignored** (`*.log`) | Local-only | No | Fine; not tracked. `director.debug.log` grows on each AI call |
| `dist/` | Build output, **gitignored** | Local-only | No | Fine |
| `Researches for Event Manager design engine/` (root, spaced name) | Near-empty, untracked, **not** in gitignore | Investigate | Yes | Decide: ignore, move under `docs/research/`, or remove |
| `.env` | Present; **duplicated key stanzas** (GEMINI_API_KEY/PORT/MODEL ×3) | **No** | Yes (operator) | Dedupe; last-wins is fragile. Values not read. (§13/§22) |
| `src/data/{businessMemory.js,staff.js,systemConfig.js}` | Empty arrays / duplicate of `config/systemConfig.js` (per arch audit) | No (verify first) | Yes | Phase 4 cleanup |

**No tracked logs, no tracked `dist`, no tracked secrets** — `.gitignore` covers `*.log`, `dist/`, `.env`, `.claude/`, `.agents/`, `.local-artifacts/`, `data/`. `[REPO]`

---

## 9. Product Coherence QA

Honest read of "one operating brain vs. a set of features":

| Connection | State | Evidence |
|---|---|---|
| Event Manager → Shift Intelligence | **Not connected** (Shift Brain event-blind) | `[DOCS]` arch audit; roadmap Phase 1.2 pending |
| Shift Intelligence → Owner AI | **Weak** (no post-event memory loop) | `[DOCS]` |
| F&B intelligence → Venue Intelligence | **Signal-only, deliberately** (candidates never promote to DNA) | `[REPO]` server.js:5946-5992 — *correct by design* |
| Academy ← real venue issues | **Not connected** | `[DOCS]` |
| Venue Memory accumulates evidence | **Yes, disciplined** (venue_intelligence + briefs + ledger) | `[REPO]/[RUNTIME]` |
| Venue Intelligence facts vs inferences | **Partially** — prompt enforces it; live output mixed assumptions in prose but flagged them ("אני מניח") | `[RUNTIME]` §10 |
| Venue DNA protection | **Strong** — single writer, no auto-confirm, candidates isolated | `[REPO]` §14 |
| Business Memory real use | **Partial** — backend-synced but thin until post-event capture exists | `[DOCS]` |
| Owner AI Home sees enough context | **Partial** — reads DNA/completeness; no operational/event feed yet | `[REPO]` |
| Users understand real vs missing | **Mostly** — completeness model + "not yet confirmed" labeling; but no percentage on main surface (intended) | `[REPO]` |

**Coherent:** Venue DNA/Memory core, role-aware nav, F&B→candidate isolation, the intelligence/test discipline.
**Disconnected:** event→shift→owner operational loop (the connect-before-build roadmap is still mostly unbuilt).
**Premature/fake-risk:** Event Architect demo panels; any owner page reading localStorage-only sources.
**Should stay hidden until data exists:** WeeklySummary / ProfitLeaks / BusinessMRI (correctly stubbed).

---

## 10. AI Behavior QA — Paradiso + SIPS Test

**Surface tested:** Venue Intelligence chat — `POST /api/venue-intelligence/message` (owner `tal`, venue `venue-main`), the only DNA-writing conversation path. Model: **OpenAI `gpt-4o-mini`** (JSON mode). `[RUNTIME]`

**Disclosure / data mutation:** This call **persisted**. Pre-state: stage `story`, 10 messages, full DNA. Post-state: **12 messages**, Paradiso signals **merged into the existing `venue-main` flagship DNA**. This is additive and reversible (owner can reset the session). **Recommendation:** if `venue-main` is meant to stay clean, the owner should reset that venue's Venue Intelligence session. I did **not** reset (destructive). Baseline recorded above so the delta is auditable.

**Request:** the exact Hebrew Paradiso+SIPS prompt (hidden-world feeling, world-class cocktail-lab precision, elegant non-gimmick audience) asking for: initial Venue DNA, concept brief, service lines, cocktail-menu style, **6 original cocktails**, operational risks, and explicit marking of known / assumed / missing / not-yet-confirmed.

**Outcome:** HTTP 200, **13.5s** latency. No crash.

**What it did well:**
- No fabrication; **did not copy** Paradiso/SIPS menus, recipes, or brand language; **did not invent a venue name**. `[RUNTIME]`
- Stayed hospitality-native, in Hebrew, calm-advisor tone.
- Separated understanding ("אני מבין ש…") from assumption ("אני מניח ש…").
- Produced honest open questions; raised DNA confidence to plausible values (identity 60, guest 60, operations 50, training 50, commercial 40) without claiming completion.
- Did **not** claim confirmed/final DNA or Full Intelligence Mode — labeling discipline held.

**What it did poorly (the core finding):**
- **Delivered none of the four concrete artifacts** the owner explicitly requested (no concept brief, no service lines, no cocktail-menu style, no 6 cocktails, no operational-risk list). It returned **five clarifying questions instead.**
- **Violated its own system-prompt rules:** "ask at most ONE focused question" and "if the owner explicitly asks for the draft/summary/DNA, produce it." The prompt even lists this exact failure mode ("DIRECT STATUS QUESTIONS — answer first, never dodge") and the model dodged.
- **Merged a brand-new venue *concept* into an existing venue's DNA** — Venue Intelligence has no notion that "design me a new place" differs from "learn my current place." Single-venue-per-session is an unguarded assumption.

**Rubric scores:**

| Dimension | Score (0–5) | Note |
|---|---|---|
| Overall | **2** | Nice but shallow; safe; failed the explicit deliverable |
| Concept originality | 1 | Nothing produced |
| Hospitality depth | 3 | Questions were operator-relevant |
| Beverage depth | 1 | No cocktails attempted |
| Operational practicality | 1 | No risks produced |
| Luxury / editorial tone | 3 | Voice on-brand |
| Missing-data honesty | 4 | Strong — flagged assumptions + open questions |
| Memory / DNA safety | 4 | No fake, no confirm, no copy; but concept-vs-venue conflation −1 |
| Next-best-question quality | 3 | Relevant but too many (5, not 1) |

**Likely layer at fault (for the team — do NOT fix in this audit):**
1. **Prompt/threshold logic** — the DRAFT THRESHOLD requires many dimensions before producing a draft, which conflicts with "produce when explicitly asked." When an owner pastes a rich single brief, the model should produce a first-pass draft *and* mark gaps, not interrogate.
2. **Model capability** — `gpt-4o-mini` under a long, rule-dense system prompt defaulted to interrogation and ignored the one-question rule. The flagship owner surface may warrant a stronger model (the visual menu designer already uses `gpt-4o`).
3. **No "new concept" branch** — needs a guardrail/flow separating "learn existing venue" from "design a new venue concept" so DNA isn't cross-contaminated.

---

## 11. AI Prompt / Provider / Context QA

**Strong `[REPO]`:**
- Venue Intelligence system instruction (server.js:5636-5754) is genuinely well-engineered: forbidden-completion language, three explicit tiers (signals → draft → owner-confirmed), "not yet confirmed" draft header, no invented numbers/names, venue grounding context injected, confidence calibration anchors.
- `mergeVenueDna` (5799): monotonic confidence, dedup, ≤8 cap, deterministic floors, no fabrication.
- JSON-mode responses with graceful fallbacks on empty/invalid AI output.
- Secrets read from env; `askVenueIntelligence` throws a user-safe error when key missing.

**Weak / risk `[REPO]/[INFER]`:**
- **Provider naming is misleading** (`askGemini` → OpenAI). Future maintainers will mis-reason about cost/limits/behavior.
- **Threshold vs. explicit-request tension** (proven live in §10) — model can dodge deliverables.
- **One-question discipline not enforced** mechanically; relies on model compliance.
- **gpt-4o-mini for the flagship owner conversation** — under-powered for rich concept work; will likely under-deliver with real owners too.
- **13.5s latency** for a single turn — acceptable but not snappy; no visible streaming.
- **Context growth:** `messages.slice(-80)` caps history — reasonable, but an 80-turn JSON-mode prompt is large and cost-accruing.

**Will it fail with real venues?** It will be *safe* (no fabrication, no DNA corruption) but may *underwhelm* — owners who paste a real brief and expect a draft will get questions instead. That is a product-trust risk, not a stability risk.

---

## 12. Auth / Role / Venue Scope QA

- **178 routes; only 2 without `requireAuth`** — both the intentionally-public token-based guest portal (`GET /api/guest-portal/:token`, `POST .../rsvp`, behind `portalCors`). `[REPO]` Strong coverage.
- **Venue scoping is real:** `req.venueId` used **181×**; `X-HESTIA-Venue` resolved in `requireAuth` against `venue_members`; unauthorized explicit venue → **403** (logged). `[REPO]`
- **Venue Intelligence routes are owner-only** (`requireAuth('owner')`); candidate *review* is owner/admin only; candidate *read* is CI roles. `[REPO]`
- **Role landings correct live** (owner→home, manager→briefing, events_manager→events, admin→root). `[RUNTIME]`
- **Minor leak-shaped noise:** `fb_director` and `employee` landings each trigger 1× 403 background fetch (client over-fetch; backend correctly denies — **no data exposed**). P3. `[RUNTIME]`
- **Legacy `X-HOSPIA-Role`** still allowed in CORS header alongside `X-HESTIA-*` (documented do-not-rename). `[REPO]`
- **Multi-venue seam (minor):** `seedCocktailIntelligence` seeds CI DNA only for `defaultVenueId()` (server.js:6909+). New venues won't get CI seed — `[INFER]` worth confirming for multi-venue installs.

---

## 13. Data Truth / Fake Data QA

| Area | Finding | Sev |
|---|---|---|
| Event Architect panels | **8 components render `eventBrainDemoData`** (fictional wedding/guests/waiters) regardless of linked real event | P1/P2 `[REPO]` |
| Costing | `barCalculationUtils` returns `null` on missing inputs (no invented costs) — verified by design + beverage tests | OK `[TEST]` |
| Venue DNA | No fabricated signals; floors lift only genuinely-present dimensions | OK `[REPO]` |
| KPIs / sales / staff scores | No POS/Tabit; owner WIP pages correctly stubbed/hidden | OK `[DOCS]` |
| AI output | Live test produced **no fabricated venue facts**; flagged assumptions | OK `[RUNTIME]` |
| `.env` | **Duplicated key stanzas** (config hygiene, not fake data) | P3 `[REPO]` |

No fake data is *presented as truth* at runtime today — the live risk is the Architect demo panels, which are gated behind a flow not on the default role landings.

---

## 14. Venue DNA / Memory Safety QA

**This is the strongest part of the system.** `[REPO]`
- **Single sanctioned writer:** `mergeVenueDna` defined once (5799); the only mutating call site is the owner-only message handler (5905).
- **No candidate→DNA promotion path** — candidate routes explicitly never call `mergeVenueDna` / never write `venue_intelligence` (5946-5992, comments + code).
- **No auto-confirmation:** prompt forbids "confirmed/final DNA"; confirmation tier (`venue_dna_confirmations`) does not exist yet, and completeness evaluator defaults confirmations to empty (5872-5876) — honest.
- **Monotonic confidence + deterministic floors** prevent regression and zero-readout of real signal, without asserting certainty.
- **Venue-scoped:** all reads/writes via `req.venueId`; reset is venue-scoped.
- **Gap (not a defect):** no guardrail distinguishing "learn this venue" from "design a new concept" → cross-contamination demonstrated in §10. P2.

---

## 15. Design / UX QA

- **Brand consistency:** every role shell renders "HESTIA AI — HOSPITALITY INTELLIGENCE OS"; calm, editorial, role-appropriate. `[RUNTIME]`
- **Owner home is chat-first** (Owner AI Home), Operational Pulse demoted to a destination — matches the Phase 1 nav doctrine. `[RUNTIME]`
- **Employee home** uses a clean two-world (Learn / Work) split — on-brand, not dashboard-bloated. `[RUNTIME]`
- **Risks:** (a) admin sees a very long flat nav (~22 groups) — acceptable for a superuser but visually heavy; (b) AI latency (13.5s) with no streaming may read as "stuck" on the owner surface; (c) 2.5 MB JS bundle hurts first paint on slow links. `[RUNTIME]`
- **Mobile/responsive:** not tested this pass (§22).

---

## 16. Findings by Severity

Columns: ID | Title | Sev | Area | Verified evidence | User impact | Risk | Recommended fix | Owner agent/skill | CC or Codex | Do not mix with

### P0 Findings
**None.** No crash, no security/auth/venue leak, no unsafe DNA mutation observed.

### P1 Findings
| ID | Title | Sev | Area | Verified evidence | User impact | Risk | Recommended fix | Owner | CC/Codex | Do not mix with |
|---|---|---|---|---|---|---|---|---|---|---|
| P1-1 | Flagship AI under-delivers on explicit owner brief | P1 | AI behavior | `[RUNTIME]` §10 — 5 questions, 0 of 4 artifacts; broke own 1-question rule | Owner asks for a concept/DNA draft, gets interrogated; trust erodes on the home surface | Product-trust failure on the marketed core | Adjust prompt threshold ("produce first-pass draft on explicit request"), enforce one-question, consider `gpt-4o` for this surface | Venue Intelligence / DNA Agent | Claude Code (prompt) | DNA storage schema, multi-venue work |
| P1-2 | Event Architect demo-data contamination (8 files) | P1 | Data truth | `[REPO]` §5/§13 | Real event shows fictional "Cohen-Levi Wedding"/named waiters | Credibility damage in a flagship demo | De-mock top 4 then remaining 4 (roadmap 2.1) — pass `effectiveBrief` as props | Event Manager / Zohar Agent | Claude Code | AI prompt work |

### P2 Findings
| ID | Title | Sev | Area | Verified evidence | User impact | Risk | Recommended fix | Owner | CC/Codex | Do not mix with |
|---|---|---|---|---|---|---|---|---|---|---|
| P2-1 | "Source of truth" docs stale (lines/tables/single-venue/provider) | P2 | Docs | `[STALE]` §5 | Agents plan wrong work (e.g., "add multi-venue") | Misallocated effort, duplicate builds | Refresh MASTER_STATE/ARCH_AUDIT/ROADMAP headers; add "superseded by Phase 8 + Owner AI Home" banners | Architecture / Repo Auditor Agent | Codex docs | Production code |
| P2-2 | Venue Intelligence has no "new concept vs existing venue" guard | P2 | Venue DNA | `[RUNTIME]` §10/§14 | New concept merges into existing venue DNA | Cross-contaminated DNA | Add a branch/flow: "design a new venue" → scratch/new-venue session | Venue Intelligence / DNA Agent | Claude Code | P1-1 (same surface; sequence after) |
| P2-3 | Event→Shift→Owner operational loop unbuilt | P2 | Coherence | `[DOCS]` §9 | Modules feel disconnected | "Set of features, not one brain" | Execute connect-before-build Phase 1 (Zohar→CI, Zohar→Chef, daily→pre-shift) | Product Architect Agent | Claude Code | — |
| P2-4 | Cross-dept "Seed to CI"/"Generate Food Menu" buttons absent | P2 | Events/F&B | `[DOCS]` §7 | No event→department flow | Flagship workflow incomplete | Roadmap 1.3/1.4 | Event Manager / F&B Agent | Claude Code | — |

### P3 Findings
| ID | Title | Sev | Area | Evidence | Fix | Owner | CC/Codex |
|---|---|---|---|---|---|---|---|
| P3-1 | fb_director & employee landings emit 1× 403 background fetch | P3 | Role UI | `[RUNTIME]` §6 | Guard the fetch by role before calling | Owner AI / Service Agent | Claude Code |
| P3-2 | 2.52 MB single JS bundle, no code-split | P3 | Build/perf | `[TEST]` §4 | Dynamic import / manualChunks | Architecture Auditor | Claude Code |
| P3-3 | `.env` duplicated key stanzas | P3 | Config | `[REPO]` §13 | Operator dedupe (values not read) | QA / Safety Agent | Operator |
| P3-4 | Empty feature dirs + `learningProgress` dead UI | P3 | Hygiene | `[REPO]/[TEST]` §8 | Phase 4 cleanup | Architecture Auditor | Claude Code |
| P3-5 | Misleading `askGemini`→OpenAI naming | P3 | AI code | `[REPO]` §5 | Rename in a provider-reconciliation pass | F&B / Beverage Agent | Claude Code |
| P3-6 | Root `Researches for Event Manager design engine/` stray dir | P3 | Hygiene | `[REPO]` §8 | Move under `docs/` or gitignore | Codex docs | Codex |

---

## 17. Agent / Skill Ownership Map

| Issue | Owner |
|---|---|
| P1-1 flagship AI deliverable behavior | **Venue Intelligence / DNA Agent** + Claude Code (prompt) |
| P1-2 Architect de-mock | **Event Manager / Zohar Agent** + Claude Code |
| P2-1 stale docs | **Architecture / Repo Auditor Agent** + Codex docs |
| P2-2 new-concept guard | **Venue Intelligence / DNA Agent** |
| P2-3 operational loop | **Product Architect Agent** (Core Operating Gate sequencing) |
| P2-4 cross-dept buttons | **Event Manager / Zohar** + **F&B / Beverage / Omer Agent** |
| P3 hygiene/perf/config | **Architecture / Repo Auditor Agent** + **QA / Safety Agent** |
| DNA safety regression watch | **Evidence & Memory Agent** + **QA / Safety Agent** |

---

## 18. What Is Already Strong

1. **Stability** — 0 crashes across 6 roles; all builds/tests green (712 assertions). `[TEST]/[RUNTIME]`
2. **Auth/venue discipline** — every route authed bar the public portal; 181 `req.venueId`; 403 on unauthorized venue. `[REPO]`
3. **Venue DNA safety** — single writer, no auto-confirm, candidates never promote, monotonic confidence, no fabrication. `[REPO]`
4. **AI guardrail prompt engineering** — three-tier labeling, forbidden-completion language, no invented numbers/names. `[REPO]`
5. **Intelligence test coverage** — DNA/completeness/ledger/menu/zero-state all green. `[TEST]`
6. **Provenance honesty** — `barCalculationUtils` returns null vs. inventing; owner WIP pages correctly hidden. `[TEST]/[DOCS]`

---

## 19. What Is Most Dangerous

1. **Stale "source of truth" docs** `[DANGER]` — they will steer agents to rebuild what exists (multi-venue) or mis-plan around wrong line/table counts. Highest *systemic* risk because it multiplies into wrong work.
2. **Flagship AI that dodges the owner's explicit ask** — the home surface disappoints on its headline capability; with real owners this reads as "the AI doesn't get it."
3. **Architect demo data** — one screenshot of "Cohen-Levi Wedding" in a real demo undermines the whole credibility story.
4. **Concept-vs-venue DNA contamination** — silent, and it touches the protected asset (Venue DNA).

---

## 20. What Is Most Worth Building Next

1. **Fix the flagship AI deliverable behavior** (P1-1) — highest trust ROI, lowest blast radius (prompt-level).
2. **Refresh the three source-of-truth docs** (P2-1) — cheap, prevents compounding wrong work.
3. **Execute the connect-before-build Phase 1** (P2-3/2-4) — turns features into one brain.
4. **De-mock the Architect** (P1-2) — credibility.

---

## 21. Exact Next Recommended Task

**One fix slice — P1-1: make Venue Intelligence honor an explicit owner brief.**

- **Objective:** when an owner explicitly asks for a draft/brief/cocktails/risks (or pastes a rich single brief), HESTIA produces a **first-pass Working Venue DNA Draft + the requested artifacts, clearly marked known/assumed/missing/not-confirmed**, and asks **at most one** follow-up — instead of returning multiple questions.
- **Why first:** it is the marketed core (the chat is the owner's home), it failed live, and the fix is prompt-level (lowest risk).
- **Files likely touched:** `server.js` `buildVenueIntelligenceSystemInstruction` (threshold + question-discipline wording, and an "explicit-request → produce now" branch). Optionally evaluate model choice for this route only.
- **Risks:** prompt changes can regress the disciplined labeling; must keep "not yet confirmed" + no-fabrication intact.
- **Tests:** `npm run hestia:check`; `node scripts/test-venue-intelligence-chat-quality.js`; `node scripts/test-venue-intelligence-message-route-audit.js`; re-run a Paradiso-style turn against a **throwaway venue** and confirm artifacts appear + labeling holds.
- **What not to touch:** `mergeVenueDna`, candidate isolation, auth/venue scope, DB migrations, role logic.
- **Claude Code or Codex:** **Claude Code** (prompt + targeted server logic).

**Paste-ready next prompt:**
```
You are working on HESTIA. Read first: CLAUDE.md, docs/HESTIA_MASTER_STATE.md,
docs/audits/HESTIA_FULL_APP_DEEP_QA_AUDIT.md (finding P1-1), and
server.js buildVenueIntelligenceSystemInstruction (≈5636-5754) + the
/api/venue-intelligence/message handler (≈5885-5928).

Guardrails: do NOT modify auth, venue scoping, role logic, DB migrations,
mergeVenueDna, or candidate isolation. Prompt/logic changes to the Venue
Intelligence system instruction only. No new packages. Do not commit/push.

Task: When the owner explicitly requests deliverables (DNA draft / concept brief /
service lines / cocktail menu style / N cocktails / operational risks) OR pastes a
single rich brief, HESTIA must PRODUCE a first-pass "Working Venue DNA Draft — not
yet confirmed" plus the requested artifacts in the reply, explicitly marking
known / assumed / missing / not-yet-confirmed, and ask AT MOST ONE follow-up.
Preserve: no fabricated numbers/names, no copying real venues, no "confirmed/final
DNA" language, monotonic confidence. Add a guard so "design a NEW venue concept"
does not merge into an existing venue's DNA.

Verify: npm run hestia:check; node scripts/test-venue-intelligence-chat-quality.js;
node scripts/test-venue-intelligence-message-route-audit.js. Then run one
Paradiso-style turn against a THROWAWAY venue (not venue-main) and paste the reply +
resulting DNA labeling. Report a before/after rubric score.
```

---

## 22. What Was Not Tested

- **No mobile/responsive device testing** — desktop 1440×900 only.
- **No CI cocktail-generation live AI call** — skipped to avoid mutating CI/decision-ledger data; beverage depth was assessed statically + inferred from the Venue Intelligence turn.
- **No exhaustive per-button click-through** — Save/Approve/Regenerate/Export/calendar-click/filters were read in code, not all clicked live.
- **No second AI surface tested live** (Owner AI Home backstage, Omer/CI chat, menu builder) — to keep AI calls minimal (1 total).
- **No `.env` values read** — only key *names* observed (no values printed). Duplicate-stanza finding is from names only.
- **No production DB / production data** — local dev DB only.
- **No external web verification** of Paradiso/SIPS — by design (inspiration-only constraint).
- **No `network throttling` / Lighthouse** — bundle-size finding is from build output only.

---

## 23. Working Tree After Audit

- **Created (this audit only):** `docs/audits/HESTIA_FULL_APP_DEEP_QA_AUDIT.md`
- **Production code:** **untouched** (`server.js`, `src/`, `package.json`, `package-lock.json`, auth, venue scoping, permissions, DB migrations, role logic, Venue DNA logic, Owner AI Home — all unchanged).
- **`docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md`:** **left untouched.**
- **`docs/plans/HESTIA_TOTAL_RESEARCH_AND_AGENT_ACTION_PLAN.md`:** **left untouched.**
- **Generated (gitignored, not committed):** `dist/` (rebuilt), `director.debug.log` (appended by the 1 AI call), `.local-artifacts/qa-runtime.mjs`, `.local-artifacts/qa-ai-paradiso.mjs`, `.local-artifacts/qa-shots/*.png`.
- **Runtime side effect (disclosed):** one Venue Intelligence turn persisted to **`venue-main`** (10→12 messages; Paradiso signals merged into flagship DNA). Reversible via owner session reset.
- **Staged:** none. **Committed:** none. **Pushed:** none.

*End of audit.*
