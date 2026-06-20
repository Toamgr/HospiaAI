# 06 — Implementation Specs & Roadmap Pack

**Scope:** Consolidates HESTIA's implementation-ready specs and roadmap: the master execution plan, the F&B Decision Ledger track, the 9C completeness model, the 9E Owner AI Home / Venue Intelligence chat status, the 9E-3A taxonomy spec, the recommended next subphases, coding guardrails, testing expectations, and commit-strategy patterns.

**Status of this material:** Doctrine + specs + completion notes from `docs/architecture/*` and `docs/plans/*`. The completion notes are **claims recorded in the plan** (verified there against build/test runs); treat them as the documented build state, and verify against current code before asserting in a session.

---

## 1. The Two Roadmaps (and how they relate)

- **`docs/HESTIA_CTO_ROADMAP.md` (2026-06-09)** — the *connection-layer* roadmap: Phase 1 (connect existing systems: daily→pre-shift briefing, Zohar→CI seeding, Zohar→Chef food menu, Shift Brain←event load, event load→Shift Organizer, EventTeam→live schedule, event cocktail menu→CI lifecycle) → Phase 2 (close the event loop, fix the Event Architect demo data, partial Owner Intelligence) → Phase 3 (persistence migrations, email, full owner activation) → Phase 4 (hardening: server.js split, JWT→httpOnly cookie, user-table reconciliation). Sequencing is mandatory; never activate an Owner page that reads localStorage-only data.
- **`docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md`** — the **current product source of truth**: HESTIA = AI Bar Intelligence platform; chat-is-home owner experience; Active Bar Programme, Prep Library, Recipe Book, Training Gantt, Academy Intelligence, Manual Tabit Upload, Venue Memory, Evidence Lifecycle. Supersedes the *product/roadmap direction* of the older docs.
- **`docs/plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md` (2026-06-18)** — the *intelligence-architecture* execution plan: the F&B Decision Ledger keystone and the consume→decide→record→feedback loop, phased 0–9.

These are **complementary**, not contradictory: connection-layer engineering, product direction, and intelligence architecture. The bar roadmap sets product priority; the master execution plan sets the intelligence build order; the CTO roadmap remains valid where its connections aren't superseded.

## 2. Current Execution Plan — Vision & Bidirectional Law

HESTIA is a **Venue Operating Intelligence system** for a single physical venue:
- **Venue Intelligence is the central brain** (founder belief, Venue DNA, emotional register, guest profile, service philosophy, positioning, atmosphere, constraints, staff capability, F&B identity, business model — plus the *memory of decisions*, the *uncertainty*, and *how the venue changes over time*).
- **Specialist intelligences are domain brains** that consume the shared understanding and enrich it back.
- **Memory is the connective tissue**; **conversation is the intelligence-gathering interface**; **decisions are first-class things that must be remembered**; **future POS/sales signals are validation, not current truth.**

**The bidirectional law:** Venue Intelligence → specialist decision → decision memory + outcome → **candidate** Venue Intelligence update (provenance-gated, never auto-confirmed).

## 3. The F&B Decision Ledger Track (master plan, Phases 0–9)

The keystone: HESTIA remembers conversations and stores sales, but historically never recorded *why a menu/drink was chosen*. The Decision Ledger fixes that — it makes F&B **explainable** and **self-improving**.

**Recorded build state (completion notes in the master plan):**
- **Phase 0** — canonical doctrine set written (docs-only).
- **Phase 1** — Decision Ledger spec (`FNB_DECISION_LEDGER_IMPLEMENTATION_SPEC.md`).
- **Phase 2** — `decisionLedgerService.js` (pure, DI-`db`) + `fb_decisions` table (write-only-first); 62 tests.
- **Phase 3** — live non-blocking writes on `POST /api/ci/generate` (`cocktail_menu_generated`), `/api/ci/cocktails` (`cocktail_selected`), `/api/ci/rejections` (`cocktail_rejected`, skips `just_experimenting`); each wrapped in try/catch so a ledger failure never blocks generation; 80 tests.
- **Phase 4** — read-only explanation service (`decisionExplanationService.js`) + `GET /api/ci/decisions[/:id/explanation]`; honest on gaps; 113 tests.
- **Phase 5** — decimal-taste convergence into CI/Omer (flag-gated, context-only; flag-off = byte-identical); `test:beverage` 120, `test:fb-ledger` 128.
- **Phase 6A/6B** — isolated `venue_intelligence_candidates` table + `fnbVenueFeedbackService.js`; live candidate write **only** on the rejection route, flag-gated; conservative derivation (generation/selection ⇒ no candidate; rejection ⇒ candidate only for explicit mapped reasons, never high confidence); **never touches Venue DNA**; 82 tests.
- **Phase 7A** — human review of candidates (owner/admin), **signal-only**, no promotion to DNA; 107 tests.
- **Phase 8F** — read-only **F&B Menu Intelligence Snapshot** (`GET /api/ci/menu-intelligence`): portfolio reasoning (spirit/category coverage, classics vs signatures, low/zero-proof, evidence-based risks), honest about missing data; 69 tests.
- **Deferred / not built:** **Phase 7B** (candidate→Venue DNA promotion, owner-gated, through `mergeVenueDna`, with mapping + thresholds + audit + reversibility); **Phase 8** POS-readiness fields; **Phase 9** repeat the pattern for Service/Academy/Event.

**The shared envelope** (define now, adopt incrementally, no graph DB yet) is in pack `03` §9 — adopt it first in the Decision Ledger, then reuse.

## 4. Owner Experience Track (Owner AI Home 9A–9G)

Distinct numbering from the master plan's Phase 9. The track:
- **9A spec** — AI-first Owner Home; **Build Mode** (focused Venue DNA discovery conversation) vs **Full Intelligence Mode** (mature command interface, unlocked only after a deterministic foundation threshold). `OperationalPulse` is preserved but demoted to a destination. Built on **Palette B — Editorial Light**. Forbidden: generic chat, tactical recommendations before the foundation, fabricated confidence, silent hardening of identity claims.
- **9B** — static shell for the Owner AI Home.
- **9C completeness model** — deterministic foundation readiness over the *current* 16-dim DNA shape; computed by code, never declared by the LLM; **no percentage on the main surface**; the evaluator (`venueDnaCompletenessEvaluator.js`) is built and heavily tested (390 assertions per the spec).
- **9E** — Venue Intelligence chat as the owner home; the chat produces Working DNA Drafts. (Commits `e60154b`, `bab0212`, `d1527b8` activated/fixed/home-ified this.)
- **9E-3A** — the **Venue DNA Taxonomy Implementation Spec** (35 dimensions, evidence model, draft + confirmation thresholds, next-best-question) — **docs-only spec** (see pack `02`).

## 5. The 9C Completeness Model (key rules)

The LLM may collect/phrase answers and describe progress in prose, but **must never** declare: DNA complete, Full Intelligence Mode unlocked, a confidence/completeness percentage, owner identity confirmed, or venue identity finalized. These are computed deterministically server-side or they do not exist. It distinguishes: "heard something" (raw turn) → "extracted a signal" (array item) → "enough evidence" (`answered`) → "owner confirmed" (`confirmed`) → `missing`/`partial`/`contradicted`/`unclear`. Two complementary layers: **9C** = foundation coverage/readiness over the current shape; **9E taxonomy** = richer discovery/checkmark/evidence/draft logic. Rule: **do not break 9C; the taxonomy is additive (a new constants module + read-only service), never a second writer; never silently expand `mergeVenueDna`.**

## 6. Recommended Next Phases (build order)

From the 9E-3 spec §14 + master plan §19:
- **9E-3B** — pure taxonomy constants + dimension definitions (`src/services/venueIntelligence/venueDnaTaxonomy.js`) + tests. *(low risk)*
- **9E-3C** — evidence extraction / mapping service (LLM proposes evidence, code classifies). *(medium)*
- **9E-3D** — draft-readiness + next-best-question engine (deterministic). *(medium)*
- **9E-3E** — chat prompt integration (inject statuses + next-best-question; 13-section draft) — `server.js` prompt only. *(medium)*
- **9E-3F** — OwnerAIHome backstage integration (statuses/readiness in the collapsed panel only) — `OwnerAIHome.jsx`. *(low)*
- **Later "9D"** — owner confirmation storage + confirmed-DNA tier (`venue_dna_confirmations` table, confirm action). *(higher)*
- **Then** (master plan): Phase 7B candidate→DNA promotion → POS-readiness fields → repeat the specialist pattern (Academy closest, `academyContextService` exists).

Each subphase ships only after `npm run build` and `npm run hestia:check` pass. No Build→Full unlock and no confirmed-DNA tier ships before confirmation storage exists and is tested.

## 7. Coding Guardrails (binding, from doctrine + CLAUDE.md)

- **Never touch** `mergeVenueDna` / `emptyVenueDna` to invent storage; it is the single sanctioned DNA writer.
- **`App.jsx` is composition-only** (zero `useState`/`useEffect`); hooks own state; features own UI; services own intelligence; `PageRenderer` takes grouped domain props.
- **All intelligence lives in services** (`shiftBrainService.js`, `decisionLedgerService.js`, the venueBridge services) — no AI calls or intelligence logic in hooks/components.
- **Every new route** is `requireAuth(...)`, venue-scoped via `req.venueId`, never cross-venue, never a default venue id.
- **Additive, flag-gated, reversible**: flag-off = byte-identical; idempotent `CREATE TABLE IF NOT EXISTS` / try-catch `ALTER`; no `db.transaction()` (node:sqlite) — manual care for multi-statement writes.
- **No fabrication**: no fake costs/KPIs/sales/margins/guest details; nullable POS fields, source-labeled; `barCalculationUtils` returns `null` on missing inputs.
- **No third cocktail engine**: CI/Omer is the canonical F&B Director; Cocktail Lab is a studio over the same brain; the Event Cocktail Menu Builder stays separate and untouched.
- **Never paste** the research corpus / full tables / chain-of-thought into prompts; one compact, measured block per specialist.
- **Don't rename** `hospia.*` keys, `X-HOSPIA-Role`, or `data/hospia.sqlite` without a coordinated migration.
- **Stop and ask** before: major out-of-task UI changes, deleting >5 files, changing auth/security, replacing routing, or cascading cross-module changes.

## 8. Testing Expectations

- `npm run build` — clean Vite production build.
- `npm run hestia:check` — build + audit checks; **no new FAIL rows.**
- Per-phase Node test scripts (e.g. `scripts/test-fb-decision-ledger.js`, `scripts/test-fnb-venue-feedback.js`, `scripts/test-menu-intelligence.js`, `scripts/test-venue-intelligence-chat-quality.js`) — exit 0/1, in-memory `DatabaseSync(':memory:')`, venue-scoped, assert **no fabricated fields**.
- `npm run test:beverage` must stay green; `node --check server.js` OK.
- **Static guards each phase:** protected files unchanged (Event Builder, Cocktail Lab, prompts, 25-field/ml contract, integer flavor model); no `mergeVenueDna` in candidate paths; no bare ledger writes in routes; cross-venue id → 404; flag-off byte-identical.
- **Manual smokes:** one owner conversation (DNA extracts, no fabrication); one CI generation (ledger row written, output unchanged); one "why?" check (answers from recorded basis, honest on gaps).

## 9. Commit-Strategy Patterns (observed)

- **Docs-only changes** committed separately with `docs:` prefix (e.g. `docs: add Venue DNA taxonomy research`, `docs: specify Venue DNA taxonomy implementation model`) — no app code touched.
- **Specs precede code:** a phase is written as a spec/plan (docs-only) and reviewed before any implementation; implementation phases are additive, flag-gated, reversible, and land with their tests.
- **Feature commits** use `feat:`; fixes `fix:`; tests `test:`. One phase = one reviewable, revertible unit. Each phase records a **completion note** in the master execution plan with verification numbers and static guards.
- Work on a branch off `main`; do not `git add .` for scoped doc work — stage only the intended paths.

## 10. Honest-Demo / Investor-Readiness Alignment

The implementation order is designed to be demoable as an honest maturity ladder (pack `05` §5): Owner AI Home → DNA Completeness → F&B Director Brief → Menu Snapshot → Decision Ledger → Candidate Signal Review. Never demo fabricated metrics or autonomous DB execution; show the structured shell and the data-state maturity ladder.

---

### Sources
`docs/plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md` · `docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md` · `docs/plans/2026-06-19_RESEARCH_TO_IMPLEMENTATION_SYNTHESIS_INVESTOR_READY_PLAN.md` · `docs/HESTIA_CTO_ROADMAP.md` · `docs/architecture/VENUE_DNA_COMPLETENESS_MODEL_PHASE_9C_SPEC.md` · `VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md` · `OWNER_AI_HOME_AND_VENUE_DNA_BUILD_MODE_PHASE_9A_SPEC.md` · `OWNER_AI_HOME_PHASE_9B_STATIC_SHELL.md` · doctrine set (`HESTIA_AI_NORTH_STAR_DOCTRINE.md`, `CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md`, `VENUE_MEMORY_AND_DNA_GUARDRAILS.md`, `SPECIALIST_INTELLIGENCE_PATTERN.md`, `FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md`, `DECISION_LEDGER_DOCTRINE.md`, `RESEARCH_ARCHIVE_USAGE_RULES.md`) · `FNB_DECISION_LEDGER_*` + `FNB_TO_VENUE_INTELLIGENCE_*` + `FNB_MENU_INTELLIGENCE_SNAPSHOT_FOUNDATION.md` · `docs/KNOWLEDGE_GOVERNANCE.md` · `CLAUDE.md`.
