# HESTIA / HOSPIA — Full Project Folder Audit

**Audit date:** 2026-05-18
**Auditor role:** Senior software architect, product auditor, technical due-diligence reviewer, startup CTO advisor
**Scope:** Read-only structural, architectural, product and cleanup audit of the entire `HOSPIA_LOCAL_APP/` folder
**Mode:** Inspection only — no files were modified, deleted, created, or refactored
**Companion to:** `docs/strategy/HESTIA_AUDIT_AND_NEXT_PHASE.md` (your prior strategic audit). This document focuses on **structure and code hygiene**, not on the strategic product roadmap.

---

## 1. Executive Summary

HESTIA is in a meaningfully better state than 90 % of pre-seed prototypes I have seen. The core architecture is real: a clean App.jsx that is composition-only, ten well-isolated hooks, a deterministic Shift Brain service, a costing layer that refuses to invent prices, a documented hospitality ontology, and a working Express + SQLite backend with role-aware endpoints, bcrypt auth, and an audit log for verified-price overrides. The team's stated architectural rules in `CLAUDE.md` are visible in the code, not just in the docs.

That is the good news. The bad news is that **the project's surface area is dragging behind its core**. There are seven empty feature folders, six empty source files, three dead compatibility shims in `src/data/`, ten `_archived/` owner files that are still the live components (imported through 2-line forwarders), two parallel UI primitive libraries where only one is used, two parallel cocktail-generation prompt pipelines (one knowledge-aware, one inline and naïve), a nested duplicate `docs/cocktail-intelligence/docs/cocktail-intelligence/` folder, and a `.env` file that contains real-looking API keys. None of these will break the app, but they all make the project look less serious than it actually is.

The single most urgent issue is **leaked credentials in `.env`** (Section 15, Risk #1). Everything else is structural cleanup that can be done safely in 1–2 focused passes.

---

## 2. Overall Verdict

This is a **real application built on top of a real architecture**, not a prototype dressed up. But it is currently carrying about 15 % cosmetic debt — empty scaffolding, dead shims, archived-but-live files — and 5 % more serious debt around AI prompt fragmentation and credential hygiene. With a one-week cleanup pass the codebase would credibly stand up to a technical due-diligence review by a serious pre-seed angel or CTO advisor.

**Investability grade today (structural only, before the cleanups in Section 16):** B / B+
**Investability grade after Section 16 cleanups land:** A−

---

## 3. What Is Strong

The list below is grounded in specific files I read, not in the README.

- **App.jsx is genuinely composition-only.** 400 lines, **zero `useState`, zero `useEffect`**, two cross-domain orchestration functions (`login`, `archiveEndOfDayReport`), one `PageRenderer` switch. The CLAUDE.md rule is being honoured. (Note: it has drifted from 352 → 400 lines since 2026-05-12 — still healthy, but watch the trend.)
- **Ten hooks each own one domain.** `useSessionState`, `useNavigationState`, `useOperationsState`, `useReportsState`, `useShiftState`, `useShiftBrainState`, `useCocktailPipeline`, `useStaffAcademyState`, `useNotificationState`, `useOwnerPulseState`, `useBackendSync`, `useUserManagement`, `useEventState`. Cross-domain callbacks are passed as parameters, not imported. This is the single most investor-credible part of the frontend.
- **Deterministic Shift Brain.** `src/services/shiftBrainService.js` is pure functions (no React, no state, no network), invoked from a single hook (`useShiftBrainState`), with rendering pushed to `src/features/shift-brain/`. Exactly the layered model the strategy docs describe.
- **Costing honesty is real, not a slogan.** `cocktailLabPricingAdapter.js`, `barCalculationUtils.js`, `verifiedPriceIngestion.js`, and `verifiedPriceStorage.js` together return `null` (not a fake number) when sources are missing, carry `confidence_level` and `cost_status` through to the UI, and audit-log verified price overrides server-side. This is a strong differentiator vs. typical hospitality demos that hallucinate margins.
- **Hospitality ontology layer.** `src/domain/hospitality/` has 8 substantive map files (entities, relationships, decisions, memory, event types, agent map, data model, operational loops) plus a README, all behaviourally inert. The CLAUDE.md rule that this layer must not be wired to runtime is **observed** — `grep` confirms zero importers outside the domain folder.
- **Bar Product Foundation.** `src/domain/hospitality/bar/` has 23 substantive files with a single barrel export, plus a costing engine, schema, substitution matrix, menu engineering quadrants, and a supplier map flagged as `market_reference_only`.
- **Real Express + SQLite backend.** `server.js` (37 KB) wires WAL-mode SQLite, bcrypt auth, role-aware middleware, session tokens, CORS allow-list, and a `verified_price_audit_log`. Not a mock.
- **Knowledge-aware cocktail brain.** `geminiCocktailAgent.js` calls `buildKnowledgeContext(prompt, form)` from `cocktailKnowledgeBase/`, which selectively injects only the relevant slices (flavor science, menu engineering, psychology, batching, kosher, etc.) instead of dumping one giant prompt. This is genuinely well-designed.
- **Confidence-gated UI surfaces.** `CocktailLabStudio.jsx` propagates `confidence_level` and `cost_status` into per-row dots, conditional price prefixes, traffic-light gating, and the labor-assumption disclosure. Pricing dishonesty is structurally prevented, not just discouraged in docs.

---

## 4. What Is Weak

- **AI prompt path is forked.** Two entirely different cocktail prompts exist: the strong director prompt + knowledge context (Cocktail Lab) and a hand-rolled inline prompt (Event Cocktail Menu Builder, lines 461–498 of `CocktailMenuBuilder.jsx`). Same product domain, two different brains.
- **Owner module is in a confusing limbo.** 10 of the 11 owner pages are now 2-line forwarders re-exporting from `_archived/`. They run, but a reader can't tell what "archived" means in a folder where 100 % of the archived files are still in production use.
- **Empty scaffolding is everywhere.** 7 empty feature folders, 6 empty source files, 3 dead compat shims in `src/data/`.
- **Documentation has a real nested-folder bug.** `docs/cocktail-intelligence/docs/cocktail-intelligence/research/` — the path repeats inside itself. Looks like an accidental copy.
- **`src/components` has two parallel UI primitive systems.** `AppPrimitives.jsx` (used by ~10+ features) and `components/ui/index.jsx` (used by **zero** files). The shadcn-flavoured one is dead.
- **`.env` contains real-looking Gemini API keys.** It's gitignored, but it is sitting in plaintext on disk in a folder you may share or zip.
- **App.jsx grew 14 %.** From 352 → 400 lines in six days. Not yet a crisis, but the composition-only rule has slid a little.
- **Several files are now too large for one screen.** `geminiCocktailAgent.js` (1,136 lines), `classicCocktailLibrary.js` (1,121), `hospitalityEntities.js` (1,011), `CocktailLabStudio.jsx` (1,047), `BottlePrices.jsx` (965), `CocktailMenuBuilder.jsx` (785), `ActionBoard.jsx` (739), `EventSeating.jsx` (748), `useOperationsState.js` (488). Some are unavoidable (data libraries), some are not (single React component files near or above 1k lines).

---

## 5. Folder Structure Audit

Inventory I confirmed by walking the tree:

| Top-level path                                | Verdict             | Notes                                                                                                                            |
| --------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `src/App.jsx`                                 | Healthy             | 400 lines, composition only, 0 state hooks                                                                                       |
| `src/main.jsx`                                | Healthy             | 14 lines, entry point                                                                                                            |
| `src/config/`                                 | Mostly healthy      | Two empty files (`accessCodes.js`, `emailjs.js`) — see Section 7                                                                 |
| `src/components/`                             | Forked              | `AppPrimitives.jsx` used; `components/ui/` unused                                                                                |
| `src/data/`                                   | Mixed               | `cocktailLab.js`, `cocktails.js`, `courses.js`, `events.js`, `operations.js`, `academy/` are live; `staff.js`, `businessMemory.js`, `systemConfig.js`, `universityManifest.js` are dead/stub |
| `src/data/academy/`                           | Live                | 14 doctrine files, plus 1,668-line `universityManifest.js`                                                                       |
| `src/domain/hospitality/`                     | Live, reference-only| 8 maps + 1 README, zero runtime importers (correct per rule)                                                                     |
| `src/domain/hospitality/bar/`                 | Live                | 23 files, 1 README, barrel `index.js`                                                                                            |
| `src/domain/hospitality/bar/cocktailKnowledgeBase/` | Live           | 8 modules, used by `geminiCocktailAgent.js` only                                                                                 |
| `src/features/`                               | Mixed               | See breakdown below                                                                                                              |
| `src/hooks/`                                  | Healthy             | 13 hooks, all named correctly, one README                                                                                        |
| `src/i18n/`                                   | Dead                | 3 empty files (`index.js`, `text.en.js`, `text.he.js`), never imported                                                           |
| `src/lib/`                                    | Healthy             | One small `storage.js` helper                                                                                                    |
| `src/prompts/`                                | Healthy but split   | `geminiCocktailPrompts.js`, `eventPrompts.js` — only the cocktail prompts are AI prompts; `eventPrompts.js` is plain text formatting |
| `src/services/`                               | Healthy             | 9 top-level service files + `api/` subfolder + `email/` subfolder (the latter empty)                                             |
| `src/services/api/`                           | Healthy             | Thin client + per-domain API wrappers                                                                                            |
| `src/utils/`                                  | Healthy             | 4 small utility files                                                                                                            |
| `docs/`                                       | Mixed               | Architecture and data subfolders solid; `cocktail-intelligence/` nested-duplicate accident                                       |
| `data/` (root)                                | Healthy             | SQLite + WAL/SHM, gitignored                                                                                                     |
| `server.js`                                   | Healthy             | One file, ~1,200 lines — typical Express monolith; tolerable but watch                                                           |
| Empty zero-byte logs at root                  | Cosmetic            | `server.err.log`, `server.out.log` — already gitignored                                                                          |
| `HESTIA_AUDIT_AND_NEXT_PHASE.docx` at root    | Awkward placement   | A 24 KB .docx companion sitting at repo root; should be inside `docs/strategy/` next to the .md                                  |

`src/features/` breakdown:

| Subfolder                  | Status          |
| -------------------------- | --------------- |
| `academy/`                 | Live, 7 files   |
| `auth/`                    | Live, 1 file    |
| `bar/`                     | Live, 10 files  |
| `cocktail-lab/`            | **Empty**       |
| `dashboard/`               | **Empty**       |
| `docs/`                    | **Empty**       |
| `employee/`                | Live, 5 files   |
| `events/`                  | Live, ~24 files |
| `knowledge/`               | **Empty** (only contains an empty `data/` subfolder) |
| `notifications/`           | **Empty**       |
| `operations/`              | Live, 7 files   |
| `owner/`                   | Confusing — 10 files are shims to `_archived/`; only `OperationalPulse.jsx` is original |
| `owner/_archived/`         | **Live runtime code despite the folder name** |
| `owner-intelligence/`      | **Empty**       |
| `settings/`                | Live, 1 file    |
| `shell/`                   | Live, 4 files   |
| `shift-brain/`             | Live, 2 files   |
| `staff/`                   | Live, 2 files   |
| `system/`                  | Live, 4 files   |
| `tasks/`                   | **Empty**       |

**Verdict on folder structure:** the spine is excellent (`App.jsx` → hooks → features + services + domain). The flesh has a lot of empty pockets and a few miscategorised limbs.

---

## 6. Duplicate / Messy Folder Findings

### Finding 6.1 — Nested duplicate path in docs

- **Path:** `docs/cocktail-intelligence/docs/cocktail-intelligence/{README.md, research/}`
- **Severity:** **High** (perception / discoverability — not runtime)
- **Type:** Duplicate / accidental
- **Why it matters:** This path literally repeats `docs/cocktail-intelligence` inside itself. To any new developer this looks like a mistake from a drag-and-drop or a misconfigured copy command, and it sits at the top of the most strategically important new knowledge folder.
- **Recommended action:** Move `docs/cocktail-intelligence/docs/cocktail-intelligence/README.md` → `docs/cocktail-intelligence/README.md`. Move `research/` → `docs/cocktail-intelligence/research/`. Delete the now-empty inner `docs/` folder.
- **Safe to change now?** Yes — no code imports from `docs/`.
- **Needs manual confirmation?** No.

### Finding 6.2 — `src/features/owner/_archived/` is the live code

- **Path:** `src/features/owner/_archived/*.jsx` and the 10 corresponding 2-line forwarders in `src/features/owner/*.jsx`
- **Severity:** **High** (confusing to readers; affects onboarding and DD review)
- **Type:** Misleading naming
- **Why it matters:** Every owner page (except `OperationalPulse.jsx`) is a 2-line shim like `export { default } from './_archived/BudgetApprovals'`. The real components are in a folder whose name literally says "archived". A reviewer will assume those files are dead and skip them. They are not — they are imported by `App.jsx`. Also, those 2-line shim files contain hundreds of trailing whitespace characters (so much that `grep` treats them as binary) — they were likely auto-generated.
- **Recommended action:** Either (a) move `_archived/*.jsx` back up to `src/features/owner/` and delete the shims, or (b) rename `_archived/` to `owner/` proper and move the *unused-feature-flagged* files into a genuinely separate `owner/disabled/` folder. Decide based on which pages you actually plan to keep.
- **Safe to change now?** Yes, if done carefully — the shims are the only importers, and `App.jsx` imports from the top-level paths.
- **Needs manual confirmation?** Yes — you need to decide which owner pages are kept-but-flagged and which are truly dead.

### Finding 6.3 — Two UI primitive systems

- **Path:** `src/components/AppPrimitives.jsx` (live) vs `src/components/ui/index.jsx` (unused) and `src/components/ui/README.md`
- **Severity:** Medium
- **Type:** Duplicate / dead code
- **Why it matters:** Both files export `Button`, `Card`, etc., but only `AppPrimitives.jsx` is imported anywhere. The shadcn-flavoured `components/ui/index.jsx` references Tailwind classes (`bg-hospia-gold`, `bg-hospia-slate`) that don't exist in your `tailwind.config.js`, so it would not even render correctly if someone wired it in by mistake.
- **Recommended action:** Delete `src/components/ui/` or move it to a `wip/` / `experiments/` folder until you decide whether to migrate to shadcn-style primitives.
- **Safe to change now?** Yes — zero importers.
- **Needs manual confirmation?** No.

### Finding 6.4 — Compat shim files in `src/data/`

- **Path:** `src/data/systemConfig.js` (5-line shim), `src/data/universityManifest.js` (1-line shim), `src/data/staff.js` (`export const STAFF = []`)
- **Severity:** Medium
- **Type:** Dead / shim
- **Why it matters:** All consumers now import directly from `src/config/systemConfig`, `src/data/academy/universityManifest`. The three shims have **zero importers** (confirmed via grep). `STAFF = []` is exported from nowhere-imported.
- **Recommended action:** Delete after a final grep pass.
- **Safe to change now?** Yes.
- **Needs manual confirmation?** Just rerun `grep` first.

### Finding 6.5 — Two `.docx` / `.md` audit twins

- **Paths:** `HESTIA_AUDIT_AND_NEXT_PHASE.docx` (root) + `docs/strategy/HESTIA_AUDIT_AND_NEXT_PHASE.md`
- **Severity:** Low
- **Type:** Cosmetic placement
- **Why it matters:** The `.md` references the `.docx` as a "companion document", but they live in different folders. Repo root should be reserved for top-level project files (`README.md`, `package.json`, configs).
- **Recommended action:** Move the `.docx` into `docs/strategy/` next to its `.md` twin.
- **Safe to change now?** Yes.
- **Needs manual confirmation?** No.

### Finding 6.6 — `src/services/email/` is an empty subfolder

- **Path:** `src/services/email/emailjsClient.js` (0 bytes)
- **Severity:** Low
- **Type:** Empty / placeholder
- **Why it matters:** `src/utils/emailjs.js` already implements the EmailJS loader. The empty `services/email/` was probably a planned future home and never got used.
- **Recommended action:** Delete the empty folder, or actually move `utils/emailjs.js` into `services/email/emailjsClient.js`. Don't keep both.
- **Safe to change now?** Yes.

---

## 7. Empty / Useless / Placeholder Findings

| Path                                            | Bytes / Lines | Recommendation |
| ----------------------------------------------- | ------------- | -------------- |
| `src/config/accessCodes.js`                     | 0 B           | **Delete** — superseded by `.env` `DEMO_CODE_*` values |
| `src/config/emailjs.js`                         | 0 B           | **Delete** — superseded by `EMAILJS` in `systemConfig.js` |
| `src/i18n/index.js`                             | 0 B           | **Delete or implement** — i18n strings live in `config/textConfig.js` today |
| `src/i18n/text.en.js`                           | 0 B           | **Delete or implement** |
| `src/i18n/text.he.js`                           | 0 B           | **Delete or implement** |
| `src/services/email/emailjsClient.js`           | 0 B           | **Delete** (see 6.6) |
| `src/data/staff.js`                             | `export const STAFF = []` (no importers) | **Delete** |
| `src/data/businessMemory.js`                    | 10 lines, only empty arrays | **Move to `_seeds/` or delete** — importers exist but consume empty arrays |
| `src/data/systemConfig.js`                      | 5-line re-export shim, 0 importers | **Delete** |
| `src/data/universityManifest.js`                | 1-line re-export shim, 0 importers | **Delete** |
| `src/features/cocktail-lab/`                    | Empty folder | **Delete** (Cocktail Lab lives in `features/bar/CocktailLabStudio.jsx`) |
| `src/features/dashboard/`                       | Empty folder | **Delete** (no dashboard concept in the routed pages) |
| `src/features/docs/`                            | Empty folder | **Delete** |
| `src/features/knowledge/data/`                  | Empty folder | **Delete** (academy knowledge lives in `features/academy/`) |
| `src/features/knowledge/`                       | Empty folder | **Delete** |
| `src/features/notifications/`                   | Empty folder | **Delete** (notifications live in `features/shell/NotificationPanel.jsx`) |
| `src/features/owner-intelligence/`              | Empty folder | **Delete** (owner intelligence lives in `features/owner/`) |
| `src/features/tasks/`                           | Empty folder | **Delete** (tasks live in `features/operations/ActionBoard.jsx`) |
| `server.err.log`, `server.out.log`              | 0 B (already gitignored) | **Delete** |
| `dist/`                                         | Build artefact | Keep (gitignored), no action |

Total cleanup volume: 6 empty source files + 7 empty folders + 4 dead shims + 1 placement issue. None affects runtime.

---

## 8. Architecture Consistency Audit

### 8.1 Consistency wins

- Hooks → services → features layering is followed everywhere outside `CocktailMenuBuilder.jsx`.
- Persistence: localStorage is centralised through `src/lib/storage.js` and `STORAGE` keys in `config/systemConfig.js`; backend sync goes through `services/api/` only.
- Feature flag usage is centralised in one place (`config/featureFlags.js`), and `App.jsx` uses `isEnabled(...)` consistently for the five flagged owner pages.
- The hospitality ontology is consistently reference-only — zero runtime imports outside the domain folder.
- Every confidence-aware costing surface flows through `cocktailLabPricingAdapter.buildCostSheet()`.

### 8.2 Inconsistencies

- **AI prompt path:** `services/geminiCocktailAgent.js` is a layered, knowledge-aware brain. `features/events/components/CocktailMenuBuilder.jsx` builds its own prompt inline at lines 461–498 and 559–620 with **no** knowledge context, **no** beverage-director system prompt, and **no** confidence/cost integration. This is the largest single inconsistency in the codebase.
- **`_archived/` vs `owner/` confusion:** described in 6.2.
- **Two UI primitive systems:** described in 6.3.
- **Two `systemConfig.js` files:** described in 6.4.
- **Some hooks are very large** (`useOperationsState.js` at 488 lines, `useEventState.js` at 7 KB), pushing the limits of the "one hook owns one domain" model. They're still single-responsibility, but they hint at a future split.
- **Owner page architecture vs CLAUDE.md spirit:** the strategy doc explicitly warns against "dashboard bloat". 11 owner pages + 5 of them feature-flagged off is a structural acknowledgement that the surface is too wide. The flags are right; the files should follow.

### 8.3 UI vs business logic separation

Strong. The only mixing is inside `CocktailMenuBuilder.jsx`, which both renders the UI **and** constructs the AI prompt **and** calls `fetch('/api/gemini')` directly. Every other AI / business call goes through a service.

---

## 9. AI / Prompt Architecture Audit

### 9.1 What is centralised today

- `src/prompts/geminiCocktailPrompts.js` — single source for `SYSTEM_PROMPT`, `BEVERAGE_DIRECTOR_SYSTEM_PROMPT`, `FEW_SHOT_EXAMPLES`, `BEVERAGE_DIRECTOR_FEW_SHOT_EXAMPLES`, `EXPECTED_FIELDS` (25 fields).
- `src/domain/hospitality/bar/cocktailKnowledgeBase/index.js` — `buildKnowledgeContext(prompt, form)` selectively injects 8 knowledge modules.
- `src/services/geminiCocktailAgent.js` — single entry point for cocktail generation, revision, and director consultation. Imports knowledge context, pricing context, and prompts; calls `/api/gemini`; has structured-JSON parsing with strict-fence stripping.
- `services/cocktailService.js::createFallbackCocktailProposal` — deterministic offline fallback if Gemini fails.
- `server.js::askGemini` — single backend wrapper that prepends the operator-level `SYSTEM` prompt.

### 9.2 What is duplicated or fragmented

- **Event cocktail prompt is parallel and inline.** `CocktailMenuBuilder.jsx` re-implements its own cocktail prompt and JSON schema (different from `EXPECTED_FIELDS`) and does not use `buildKnowledgeContext` or the director system prompt. This is **the** AI architecture risk: the event surface is the most investor-visible part of the product (weddings, corporate, 200-guest service) and it is running on a weaker prompt.
- **Three system prompts coexist.** `SYSTEM_PROMPT`, `BEVERAGE_DIRECTOR_SYSTEM_PROMPT`, and the inline event prompt. Plus the server's high-level `SYSTEM` block prepended to every Gemini call. That's four layers of "you are HESTIA" instructions, two of which are about cocktails. Worth consolidating.
- **Two raw-encoding artefacts** in `geminiCocktailPrompts.js` — `managerג€™s`, `ג€™` — are mojibake (UTF-8 / Windows-1252 mis-decoded). Cosmetic but visible in the prompt that Gemini receives.
- **`src/prompts/eventPrompts.js`** is not actually a prompt — it's a text formatter for `generateExecutiveEventSummary`. The filename is misleading; this should live in `src/utils/` or `src/services/`.

### 9.3 Risks

- **Giant prompt risk:** Mitigated. `buildKnowledgeContext` is selective by design.
- **Hallucinated cost risk:** Mitigated for Cocktail Lab via `cocktailLabPricingAdapter`. **Not mitigated** for the event prompt, which asks Gemini for `pour_cost_estimate` as a string like `"₪18-22"` — Gemini is free to invent it.
- **No tests on prompt outputs.** No vitest / jest scaffolding anywhere in the repo. JSON parsing fails fall to a generic error message — acceptable for MVP, not for scale.
- **Prompt is leaking implementation language** (the Hebrew mojibake) — a Gemini call that includes garbled glyphs is more likely to misinterpret instructions.

### 9.4 What should be modularised next

- Lift the event-menu prompt to use the same `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` + `buildKnowledgeContext(prompt, { eventBatching: true })`. The knowledge base already has a `BATCHING_FOR_EVENTS` module — it just isn't wired.
- Move event-menu generation into a new `services/eventCocktailMenuService.js` that mirrors `cocktailService.js`. Then `CocktailMenuBuilder.jsx` becomes UI-only.
- Add a thin "AI client" layer (`services/aiClient.js`) that owns the `/api/gemini` POST so no feature file calls fetch directly. Today only `CocktailMenuBuilder` violates this.

---

## 10. Cocktail Intelligence / Bar Domain Audit

### 10.1 Placement

- The new knowledge base is at `src/domain/hospitality/bar/cocktailKnowledgeBase/`. **This is the correct place.** It sits under `domain/hospitality/bar/` alongside the schemas, costing utilities, and supplier map, and is imported only from `geminiCocktailAgent.js`. It is conceptually a domain layer, behaviourally a knowledge-retrieval helper, and accurately scoped to the bar sub-domain.
- The folder name is appropriate, but I'd consider renaming to `beverageKnowledgeBase` if you expect to add wine, coffee, and tea modules later. Cocktail-specific is narrower than the eventual scope.

### 10.2 Depth / fragmentation

- 8 modules: `flavorScience`, `menuEngineering`, `menuPsychology`, `trendIntelligence`, `barOperations`, `venuePhilosophy`, `kosherIntelligence`, plus `index.js` orchestration. The split is sensible. Each module is small (2–5 KB) — none are stubs.
- It is **shallower** than the underlying research file (`HESTIA_Cocktail_Intelligence_Master.md` is 32 KB). That is fine on purpose — the research file is the source, the knowledge base is the distilled prompt-ready summary.
- It is **not duplicating** existing domain logic. `classicCocktailLibrary.js`, `barProductMenuEngineering.js`, `barSubstitutionMatrix.js`, `cocktailFlavorProfileUtils.js`, and `cocktailPricingEngine.js` remain the authoritative *data* layer; the knowledge base is the authoritative *narrative-for-AI* layer. The separation is good.

### 10.3 Connection

- **Connected to:** `geminiCocktailAgent.js` (lines 2, 693, 914 — called during initial generation and revision).
- **Not connected to:** the Event Cocktail Menu Builder. This is the gap to close.
- The previous Claude audit file (`CLAUDE_PREVIOUS_AUDIT_PLAN.md`) already flags this exact gap.

### 10.4 Quality concerns

- `classicCocktailLibrary.js` is 60 KB / 1,121 lines. At some point this should be split per cocktail family (sours, highballs, stirred-up, tiki, etc.) or moved to JSON, but it is not urgent.
- The knowledge base's keyword detection is heuristic (`containsAny(text, [...])`). It works, but it will quietly fail to inject relevant context when the manager uses unusual phrasing. Eventually this should be replaced with an embedding-based retrieval. Acceptable for MVP; flag for Phase 3+.
- `barProductSupplierMap.js` correctly carries `relationship_status: 'market_reference_only'`. This is the kind of self-discipline that DD reviewers notice.

### 10.5 What should be improved next

1. **Wire the event menu to the same brain.** Highest leverage single move.
2. **Add embeddings-based retrieval** (later) so manager prompts in Hebrew or with unusual jargon still surface the right knowledge slices.
3. **Split `classicCocktailLibrary.js`** by family for read performance and easier editing.
4. **Add a thin `wineKnowledgeBase/` and `coffeeKnowledgeBase/`** under `domain/hospitality/` once you start wiring those academies into AI flows.

---

## 11. Bottle Pricing / Costing Audit

### 11.1 Where pricing lives

- **Schema + factory:** `barProductSchema.js`
- **Seed reference catalog:** `barProductSeed.placeholders.js` (28 KB — explicitly flagged as placeholders)
- **Calculation utilities (pure):** `barCalculationUtils.js`
- **Costing engine:** `cocktailPricingEngine.js`
- **Pricing adapter used by UI:** `cocktailLabPricingAdapter.js` (computes confidence + cost status)
- **Validation:** `verifiedPriceIngestion.js`
- **Persistence (local):** `verifiedPriceStorage.js` (localStorage)
- **Persistence (server):** `services/api/verifiedPricesApi.js` + SQLite tables + audit log
- **UI:** `features/bar/BottlePrices.jsx` (965 lines), `features/bar/VerifiedPriceEntryPanel.jsx` (287 lines)

### 11.2 Verdict — pricing implemented in one clean place?

Yes, structurally. Every cost-displaying surface I traced goes through `buildCostSheet()`. The matching priority (verified override → seed brand match → category median → null fallback) is documented in the file header and implemented in code. Labor cost and waste buffer are constants flagged as `operational_assumption`. This is genuinely good engineering.

### 11.3 Duplication risk

- Low. `cocktailPricingEngine.js` and `cocktailLabPricingAdapter.js` have overlapping concerns but the adapter is the wrapper that adds confidence levels. They are not duplicates — they layer.
- `barCalculationUtils.js` and `cocktailPricingEngine.js` could in theory grow into duplication; flag for periodic review.

### 11.4 Fake-price risk

- **Inside Cocktail Lab:** ruled out by code (the adapter returns `null` and the UI gates on `cost_status`).
- **Inside Event Cocktail Menu Builder:** **not ruled out**. Gemini is asked for `pour_cost_estimate: "₪18-22"` as part of the inline prompt and the result is displayed without confidence gating. This is the one place where a hallucinated cost could surface in front of a user.
- **Inside seed file:** `barProductSeed.placeholders.js` benchmark prices are reference estimates by design — fine, because the adapter labels them `benchmark_estimate` and the UI shows that.

### 11.5 AI receiving the right pricing data?

`geminiCocktailAgent.js` line 3 imports `getPricingContextSummary` from the adapter, and the prompt is enriched with it. So yes for Cocktail Lab. **No** for Event Cocktail Menu Builder.

### 11.6 What should be improved

1. **Block Gemini from quoting cost in the event prompt** — either remove the `pour_cost_estimate` field from the event JSON schema, or feed pricing context from the adapter into the event prompt.
2. **Add a `data_freshness_days` field** to overrides so old "verified" prices visually age.
3. **Surface confidence dot in BottlePrices.jsx** the same way Cocktail Lab does (it already partly does; verify).

---

## 12. Event Module Audit

### 12.1 What's in `src/features/events/`

24 files, ~4,600 lines. The largest single file is `CocktailMenuBuilder.jsx` (785 lines) followed by `EventSeating.jsx` (748 lines) and `EventCreationWizard.jsx` (398 lines). `eventBrainDemoData.js` is explicitly labelled as DEMO ONLY in its first three lines — good hygiene.

### 12.2 Verdict on Cocktail Menu Event

**Generic, not yet intelligent.** It calls `/api/gemini` directly with an inline prompt that:

- Lacks the beverage-director persona
- Lacks the knowledge context (BCG quadrants, batching rules, kosher intelligence, etc.)
- Lacks pricing context, confidence, and cost-status
- Lacks recipe substitution and operational risk flagging
- Asks Gemini to return a `pour_cost_estimate` string with no source-of-truth

It works. It generates a 4–6 cocktail menu for the event. But it is the **least defensible** AI surface in the product. A reviewer will notice the gap the moment they compare it to Cocktail Lab.

### 12.3 What it lacks vs Cocktail Lab

| Capability                              | Cocktail Lab | Event Menu Builder |
| --------------------------------------- | ------------ | ------------------ |
| Beverage Director system prompt         | ✓            | ✗                  |
| Knowledge context injection (selective) | ✓            | ✗                  |
| Pricing context summary in prompt       | ✓            | ✗                  |
| Confidence + cost status in UI          | ✓            | ✗                  |
| Cost gating against benchmark           | ✓            | ✗                  |
| Few-shot examples                       | ✓            | ✗                  |
| Strict JSON schema enforced server-side | ✓            | partial            |
| Fallback proposal when AI fails         | ✓            | ✗                  |
| Revision prompt path                    | ✓            | partial            |

### 12.4 Safest next improvement

Create `src/services/eventCocktailMenuService.js` that wraps `generateGeminiCocktailProposal` (or a sibling function) with event-specific defaults (`eventBatching: true`, guest count, service tier from `EVENT_TIERS`, dietary restrictions). Replace the inline prompt block in `CocktailMenuBuilder.jsx` with a call to that service. Reuse the same `EXPECTED_FIELDS` schema but extend it with event-only fields (`batchablePercent`, `stationActions`, `garnishPrePortioned`). This single change closes the largest AI consistency gap in the product.

---

## 13. Documentation Audit

### 13.1 What's in `docs/`

| Folder            | Files | Purpose                                                                            |
| ----------------- | ----- | ---------------------------------------------------------------------------------- |
| `architecture/`   | 9     | System architecture, Phase 1 / Phase 2 checkpoints, Shift Brain V1, Bar Product Foundation, Cocktail Lab Costing & Experience, DB schema plan, ARCHITECTURE.md |
| `data/`           | 5     | Bar data confidence rules, Claude ingestion guide, gaps & collection plan, bar product DB foundation, verified supplier price ingestion |
| `roadmap/`        | 1     | ROADMAP.md                                                                          |
| `strategy/`       | 2     | HOSPIA_STRATEGY_FOUNDATION.md, HESTIA_AUDIT_AND_NEXT_PHASE.md                       |
| `cocktail-intelligence/` | 1 + nested | `CLAUDE_PREVIOUS_AUDIT_PLAN.md` + the duplicated-nested research folder      |

### 13.2 Quality

- Architecture docs are dated 2026-05-12 to 2026-05-16 — recent and aligned.
- The strategy audit is implementation-anchored — every recommendation cites a file path.
- The bar-data docs cleanly separate confidence rules, gaps, ingestion, and the DB foundation.
- `ROADMAP.md` exists but should be cross-checked against the strategy audit's "Next Phase" recommendations; today they live in two files.

### 13.3 Problems

- **Nested duplicate path (Finding 6.1).** Single biggest doc issue.
- **`docs/architecture/HESTIA_BAR_PRODUCT_DATA_MODEL.md` (5 KB)** and **`docs/data/HESTIA_BAR_PRODUCT_DATABASE_FOUNDATION.md` (2.7 KB)** describe overlapping subject matter — one is the SQL schema plan, the other is the code-level foundation. Worth either merging or cross-linking explicitly in the headers.
- **`HESTIA_AUDIT_AND_NEXT_PHASE.docx`** at repo root is awkward (Finding 6.5).
- No `docs/INDEX.md` or `docs/README.md` — a single index makes the difference between "investor reads 1 doc" and "investor reads 5 docs".

### 13.4 Cocktail Intelligence docs placement

- Conceptually correct to have a `cocktail-intelligence/` folder for the research source.
- Structurally broken because of the nesting accident.
- Once flattened, this folder should be the single source for: research PDFs, the research Markdown, and a short `README.md` explaining that the **distilled modules** live in `src/domain/hospitality/bar/cocktailKnowledgeBase/`.

### 13.5 Missing docs

- A short `docs/SECURITY.md` (or section in README) covering: `.env` handling, demo codes, role middleware, audit log.
- A `docs/CONTRIBUTING.md` covering the CLAUDE.md rules in human-readable form.
- A `docs/AI_ARCHITECTURE.md` summarising how prompts, knowledge context, pricing context, fallback, and the SQLite layer compose. Today this is implicit in code + `CLAUDE_PREVIOUS_AUDIT_PLAN.md`.

---

## 14. Product / Startup Readiness Audit

### 14.1 Valuable parts

- **Shift Brain V1.** Deterministic operational intelligence that produces a real, defensible "focus today" view. This is the product spine.
- **Costing honesty.** A bar app that refuses to invent margins is genuinely rare and demoably differentiated.
- **Cocktail Lab with director-grade prompt + knowledge injection.** This will impress any hospitality operator who has tried generic ChatGPT cocktail prompts.
- **Verified Price Entry + audit log.** Pre-seed venues love the idea that price overrides are tracked.
- **Hospitality ontology.** Investor-coded signal that you are not building "another CRM with AI".

### 14.2 Overbuilt parts

- **11 owner pages**, 5 feature-flagged off. The flagged-off ones (`BusinessMRI`, `ExecutiveOverview`, `WeeklySummary`, `ProfitLeaks`, `StrategicRecommendations`) should be **moved out of `features/owner/`** entirely until they have a use case. Today they bloat the file list and tempt every reader to ask "what does StrategicRecommendations mean?"
- **`hospitalityEntities.js` (1,011 lines)** and the rest of the 8 ontology maps. Powerful, but pre-seed they are aspirational. Not a problem unless an investor asks "what runs against this?" — answer today is "nothing yet, it's a reference layer."
- **HESTIA University surface (Academy, Lessons, SOPs, Wine, Knowledge Library).** A real product asset, but probably oversized vs. one live venue's needs today.

### 14.3 Underbuilt parts

- **Event AI menu generation.** As covered in Sections 9 and 12.
- **Authentication.** bcrypt + UUID tokens is fine for MVP, but there's no refresh token, no rate limiting on `/api/auth/login`, no password reset flow. Flag for Phase 3.
- **No tests.** No `__tests__`, no `vitest`, no `jest`. Acceptable now; risky as soon as a second developer joins.
- **No structured logging on the server.** `console.log` only. Acceptable for one-venue MVP; not for fundraising.

### 14.4 Confusing for new dev / investor

- The `_archived/` pattern (Finding 6.2).
- The 7 empty feature folders (Section 7).
- The two UI primitives (Finding 6.3).
- The nested cocktail-intelligence path (Finding 6.1).
- The mojibake `ג€™` in the prompt file.

Each of these is a 5-minute fix. Together they cost about 30 minutes of cleanup and remove 90 % of the "is this a serious project?" friction.

### 14.5 What to prioritise next

1. **Section 15 risks first** (especially the API key).
2. **Section 16 cleanup pass.**
3. **Event AI menu unification** (Sections 9.4, 12.4).
4. **Owner page reduction** (move the 5 flagged-off pages to a `wip/` folder; consider deleting `_archived/`'s misleading folder name).
5. **A `docs/INDEX.md`** as the single front door.

### 14.6 What to pause or simplify

- Don't add new academies until University is connected to AI.
- Don't add new owner pages until at least 3 of the current 11 are visibly delivering value.
- Don't add new ontology entities until at least one (e.g. `Cocktail`, `Shift`, `Incident`) actually drives a DB schema or a service.

---

## 15. Risk Register

| #  | Risk                                                                                       | Severity   | Likelihood | Impact                                                                              | Recommended action |
| -- | ------------------------------------------------------------------------------------------ | ---------- | ---------- | ----------------------------------------------------------------------------------- | ------------------ |
| 1  | **`.env` contains real-looking API keys** (`GEMINI_API_KEY`, `VITE_GEMINI_API_KEY`)        | **Critical** | Certain (file exists)   | If the file ever leaves the laptop (zip, cloud sync, screen share), keys are stolen | **Rotate both keys today.** Then keep `.env` gitignored (it is) and avoid screen-sharing the file. Confirm no past commits leaked it (`git log -p -- .env`). |
| 2  | `VITE_GEMINI_API_KEY` is exposed to the browser bundle by Vite's `VITE_` prefix             | High       | Certain    | Any built frontend exposes the key in the JS bundle if anything uses it client-side | Audit any `import.meta.env.VITE_GEMINI_API_KEY` usage in the frontend. If the key is only used server-side (looks like it), **rename to `GEMINI_API_KEY` and drop the `VITE_` prefix**. |
| 3  | Event Cocktail Menu Builder can hallucinate `pour_cost_estimate`                            | High       | Likely     | A real venue manager sees an invented NIS range and quotes it to a client            | Strip the field or feed it from the pricing adapter (Section 11.6 #1) |
| 4  | `_archived/` is the live owner code, archived in name only                                 | Medium     | Certain    | Future dev deletes `_archived/` thinking it's dead                                   | Rename or restructure (Finding 6.2) |
| 5  | Two parallel AI prompt paths drift further apart                                            | Medium     | Likely     | Event quality regresses behind Cocktail Lab                                          | Unify via `eventCocktailMenuService.js` (Section 12.4) |
| 6  | App.jsx growth rate (352 → 400 lines in 6 days)                                             | Medium     | Possible   | The "composition only" rule erodes over months                                       | Add a lint or CI check that fails if `App.jsx` exceeds, say, 500 lines or contains `useState` / `useEffect` |
| 7  | No automated tests anywhere                                                                | Medium     | Certain    | Refactors and AI changes ship blind                                                  | Add vitest + 5 smoke tests on costing utilities (already pure functions — easiest target) |
| 8  | Login route has no rate limit                                                              | Medium     | Possible   | Brute force against 4-digit demo codes is trivial                                    | Add `express-rate-limit` (already a one-package fix) |
| 9  | Mojibake in `geminiCocktailPrompts.js` (`ג€™`)                                              | Low        | Certain    | Prompt quality degraded; the AI may quote it back                                    | Re-save the file in UTF-8 |
| 10 | UI primitive forking risk                                                                  | Low        | Possible   | A new dev imports from `components/ui/` instead of `components/AppPrimitives.jsx`    | Delete `components/ui/` (Finding 6.3) |

---

## 16. Cleanup Recommendations

Grouped by safety class.

### 16.1 Zero-risk deletes (safe to do today)

- `src/config/accessCodes.js` — empty
- `src/config/emailjs.js` — empty
- `src/services/email/emailjsClient.js` — empty
- `src/services/email/` — empty after the above
- `src/i18n/index.js`, `src/i18n/text.en.js`, `src/i18n/text.he.js` — empty
- `src/i18n/` — empty after the above
- `src/data/staff.js` — `STAFF = []`, zero importers
- `src/data/systemConfig.js` — 5-line shim, zero importers
- `src/data/universityManifest.js` — 1-line shim, zero importers
- `src/features/cocktail-lab/` — empty
- `src/features/dashboard/` — empty
- `src/features/docs/` — empty
- `src/features/knowledge/` (and `knowledge/data/`) — empty
- `src/features/notifications/` — empty
- `src/features/owner-intelligence/` — empty
- `src/features/tasks/` — empty
- `server.err.log`, `server.out.log` — zero-byte, already gitignored
- `src/components/ui/` — unused parallel UI library

### 16.2 Move (zero behavioural change)

- `HESTIA_AUDIT_AND_NEXT_PHASE.docx` → `docs/strategy/HESTIA_AUDIT_AND_NEXT_PHASE.docx`
- `docs/cocktail-intelligence/docs/cocktail-intelligence/README.md` → `docs/cocktail-intelligence/README.md`
- `docs/cocktail-intelligence/docs/cocktail-intelligence/research/*` → `docs/cocktail-intelligence/research/*`
- Then delete the now-empty inner `docs/`.
- `src/prompts/eventPrompts.js` → `src/services/eventSummaryFormatter.js` (it's not a prompt)

### 16.3 Decide-then-act (small risk, needs you)

- `src/features/owner/_archived/*.jsx`: pick (a) restore-and-flatten, (b) keep-as-shimmed but rename `_archived` → `_legacy` or `_disabled`, or (c) delete the 5 feature-flagged-off pages outright and inline the 5 active ones.
- `src/data/businessMemory.js`: arrays are empty but importers exist. Either populate or migrate the importers to use empty defaults locally and delete this file.
- `docs/architecture/HESTIA_BAR_PRODUCT_DATA_MODEL.md` and `docs/data/HESTIA_BAR_PRODUCT_DATABASE_FOUNDATION.md`: merge or cross-link in headers.

### 16.4 Refactor (worth scheduling)

- Unify event cocktail prompt path (Sections 9.4, 12.4).
- Add `services/aiClient.js` so no feature calls `/api/gemini` directly.
- Split `classicCocktailLibrary.js` by family.
- Re-save `geminiCocktailPrompts.js` in UTF-8.

### 16.5 Hardening (Phase 3+)

- `express-rate-limit` on `/api/auth/login`.
- Vitest setup + first 5 smoke tests on `barCalculationUtils.js`.
- A lint rule preventing `useState`/`useEffect` in `App.jsx`.
- Drop `VITE_` prefix from `GEMINI_API_KEY` unless the frontend genuinely needs it.

---

## 17. What To Delete / Archive / Move / Keep

| Item                                              | Action  |
| ------------------------------------------------- | ------- |
| 6 empty source files (Section 16.1)               | Delete  |
| 7 empty feature folders                           | Delete  |
| 3 dead compat shims in `src/data/`                | Delete  |
| `src/components/ui/`                              | Delete  |
| `server.err.log`, `server.out.log`                | Delete  |
| Inner duplicate `docs/cocktail-intelligence/docs/cocktail-intelligence/` | Move contents up; delete inner shell |
| `HESTIA_AUDIT_AND_NEXT_PHASE.docx`                | Move to `docs/strategy/` |
| `src/prompts/eventPrompts.js`                     | Move to `src/services/eventSummaryFormatter.js` |
| `features/owner/_archived/`                       | Rename or restructure (decide) |
| `features/owner` feature-flagged-off pages        | Move to `features/owner/wip/` until activated |
| `data/businessMemory.js`                          | Keep if you plan to populate; else delete |
| Hospitality ontology                              | Keep — it is correctly inert and is a strategic asset |
| `classicCocktailLibrary.js`                       | Keep, schedule a split later |
| University manifest (1,668 lines)                 | Keep — it is the academy content source |
| Everything in `src/services/api/`, `src/hooks/`, `src/services/` (outside email/) | Keep — healthy |
| Cocktail Knowledge Base                           | Keep — wire it into the event prompt next |

---

## 18. Highest Priority Fixes

In strict execution order:

1. **Rotate Gemini API keys.** Today. Then audit any past git history for leaks.
2. **Decide on `VITE_GEMINI_API_KEY`.** If it's only used in `server.js`, rename to `GEMINI_API_KEY` and remove the `VITE_` prefix so it's never bundled to the browser.
3. **Run the Section 16.1 zero-risk deletion pass.** ~15 minutes. Removes ~17 visible scars.
4. **Flatten `docs/cocktail-intelligence/`.** ~5 minutes.
5. **Rename or unify `features/owner/_archived/`.** ~30 minutes once you've decided which 5 owner pages stay.
6. **Wire `CocktailMenuBuilder.jsx` to `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` + `buildKnowledgeContext({ eventBatching: true })`.** ~1 focused build session. Highest product-value cleanup.
7. **Strip `pour_cost_estimate` from event JSON schema** (or feed it from `cocktailLabPricingAdapter`).
8. **Add an App.jsx size guard** (a 5-line lint rule).
9. **Re-encode `geminiCocktailPrompts.js` as UTF-8** to remove the `ג€™` mojibake.
10. **Add `docs/INDEX.md`** so a reader has one front door.

Steps 1–4 are all together about 30 minutes of work and remove ~80 % of the "this looks unfinished" signal.

---

## 19. Safe Cleanup Plan

A four-pass plan that does not break the app at any step.

**Pass 1 — Credential rotation (30 min, no code change in repo)**
- Rotate both Gemini API keys in Google Cloud Console.
- Replace values in `.env`.
- Verify `git log -p -- .env` shows no historical commit of the file.

**Pass 2 — Empty file & folder sweep (15 min)**
- Delete every file/folder listed in Section 16.1.
- Run `npm run build` and `npm start`. Confirm no import errors.

**Pass 3 — Move pass (10 min)**
- Apply every move in Section 16.2.
- Update CLAUDE.md if any moved path is referenced there.
- Re-run `npm run build`.

**Pass 4 — Owner module decision + cosmetic fixes (1–2 hr)**
- Decide on `_archived/` strategy.
- Re-encode `geminiCocktailPrompts.js`.
- Add `docs/INDEX.md`.
- Add the App.jsx lint guard.

**Pass 5 — Phase 3 product work (separate sprint)**
- Event cocktail menu unification (Section 12.4).
- Vitest scaffolding + 5 smoke tests on costing.
- Rate limit on `/api/auth/login`.

At no point in passes 1–4 does any runtime path change. Pass 5 is a real refactor and should be its own PR.

---

## 20. Suggested Next Claude Code Tasks

Each task below is shaped so Claude Code can pick it up with no additional context.

1. **`cleanup/empty-scaffolding-pass`**
   *Goal:* Remove the 6 empty files, 7 empty folders, and 3 dead shims listed in Section 16.1.
   *Acceptance:* `npm run build` passes; `grep -r` shows zero imports of any removed path; `App.jsx` line count unchanged or smaller.

2. **`cleanup/flatten-cocktail-intelligence-docs`**
   *Goal:* Eliminate the nested `docs/cocktail-intelligence/docs/cocktail-intelligence/` path. Add a one-page `docs/cocktail-intelligence/README.md` that points to the distilled modules in `src/domain/hospitality/bar/cocktailKnowledgeBase/`.
   *Acceptance:* No path repeats itself; PDFs and master research file are reachable from `docs/cocktail-intelligence/research/`.

3. **`cleanup/owner-archived-decision`**
   *Goal:* Either rename `features/owner/_archived/` to a non-misleading name OR move contents back to `features/owner/` and delete the shim forwarders.
   *Acceptance:* Every file in `features/owner/*.jsx` is either real source or a deliberate stub (no surprise 2-line forwarders).

4. **`feature/event-menu-unification`**
   *Goal:* Create `src/services/eventCocktailMenuService.js`. Migrate `CocktailMenuBuilder.jsx` to call it. The new service must use `BEVERAGE_DIRECTOR_SYSTEM_PROMPT`, `buildKnowledgeContext({ ..., eventBatching: true })`, and the pricing adapter's `getPricingContextSummary`. Replace `pour_cost_estimate` Gemini-generated field with a value computed from the adapter.
   *Acceptance:* Event menu generation no longer constructs an inline prompt; UI confidence behaviour matches Cocktail Lab.

5. **`feature/ai-client-extraction`**
   *Goal:* Create `src/services/aiClient.js` owning the single `/api/gemini` POST. No feature file should call `fetch('/api/gemini')` directly.
   *Acceptance:* `grep -rn "/api/gemini" src/features` returns no results.

6. **`hardening/login-rate-limit`**
   *Goal:* Add `express-rate-limit` middleware to `/api/auth/login` at 5 attempts per 5 minutes per IP.
   *Acceptance:* Login lock-out is visible in dev tools after 6th attempt.

7. **`hardening/vitest-bootstrap`**
   *Goal:* Add vitest, create `__tests__/barCalculationUtils.test.js` with 5 pure-function tests, wire `npm test`.
   *Acceptance:* `npm test` passes locally.

8. **`hygiene/utf8-resave-prompts`**
   *Goal:* Re-save `src/prompts/geminiCocktailPrompts.js` as UTF-8 to remove `ג€™` mojibake.
   *Acceptance:* No mojibake glyphs remain; prompt diff is byte-clean.

9. **`hygiene/app-size-guard`**
   *Goal:* Add an ESLint rule or a one-line CI check that fails if `App.jsx` has more than 500 lines or contains `useState`/`useEffect`.
   *Acceptance:* CI red on a synthetic violation.

10. **`docs/index-and-security`**
    *Goal:* Add `docs/INDEX.md` listing every doc; add `docs/SECURITY.md` covering `.env`, demo codes, role middleware, audit log.
    *Acceptance:* A new reader can navigate the project from `README.md` → `docs/INDEX.md` → any doc in one hop.

---

## Closing Note

You have an architecture that an investor would respect. You have product instincts (costing honesty, hospitality language, the "hosted not processed" philosophy) that are genuinely distinctive. The structural debt is real but very contained — almost all of it is "delete the things that aren't being used" rather than "rewrite the things that are." Run the four-pass cleanup and the AI-unification pass, and the project will look as serious from the outside as it already is from the inside.
