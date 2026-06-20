# 01 — HESTIA Current State

**Purpose:** A compact, manually-updatable current-state file for the `HESTIA Research Brain` Gem. Update this after each build phase.

**Last reconciled by this pack:** 2026-06-21.
**Authority order:** `docs/HESTIA_MASTER_STATE.md` + `memory/project_hestia_master_memory.md` (state & reasoning) → `docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md` (current product direction) → `docs/plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md` (intelligence build phases).

> Caution for the Gem: `HESTIA_MASTER_STATE.md` is dated 2026-06-09 and **predates** the Owner AI Home, Venue DNA taxonomy/completeness, and AI Bar Intelligence work. This pack reconciles the two. When in doubt, treat the newer roadmap/execution-plan items as the live frontier and the master state as the stable base.

---

## 1. What HESTIA Is

HESTIA is a **hospitality operating system** for premium venues — and, as of the 2026-06-21 roadmap, its **primary market entry point is "AI Bar Intelligence"**: a platform that learns a venue's DNA, creates tailored cocktail programmes, pricing, prep logic, and staff training briefs, and improves over time through real sales data (e.g. Tabit reports).

Product hierarchy (from the current roadmap):
- **HESTIA** — the platform/company.
- **AI Bar Intelligence** — the primary product category / market entry point.
- **Cocktail Intelligence** — the core engine inside AI Bar Intelligence.
- **Venue Intelligence OS** — the long-term strategic vision.
- **HESTIA AI** — the owner-facing intelligence/chat layer (the owner's home).
- **Venue DNA Brief** — the living business DNA brief built from owner characterization + evidence.
- **F&B Director reasoning** — internal strategic reasoning inside AI Bar Intelligence (not a separate user-facing module).

The name is deliberate: Hestia, goddess of the hearth — the central fire a team gathers around before service. Emotional register: **calm, competent, quietly premium.**

## 2. What HESTIA Is Not

Not a chatbot app · not a generic admin panel · not a KPI dashboard · not a POS · not a CRM for sales leads · not a task manager for software teams · not an event-ticketing platform · not a generic SaaS product. HESTIA is also **standalone** — entirely separate from any other AI startup, EventSheet product, or external codebase. Do not import patterns from elsewhere.

## 3. Current Product Doctrine (the rules that govern every decision)

From the master memory (8 principles) and the current roadmap:

1. Hospitality is what the guest feels; service is what the team does.
2. Exception-based, not dashboard-based — surface only what changed/matters/needs action.
3. Memory must compound — get smarter every shift/event/incident. Memory is the moat.
4. Honesty about data provenance — no invented costs, fake scores, placeholder metrics. **No evidence → no confident claim.**
5. Connect before building — HESTIA is under-connected, not under-built.
6. Hospitality-native language — guests not customers, brief not prompt, venue not account.
7. The 2 AM test — usable one-handed, tired eyes, on a phone, under pressure.
8. AI behaves like a professional embedded in a workflow, not a chatbot — four trust gates: **sources visible, output editable, action explained, improvement trackable.**

Roadmap-level rules that compound these: *the chat is the owner's home, reports are depth layers*; *completion is not capability*; *root cause is a hypothesis until validated*; *Venue DNA changes require owner/founder confirmation*; *HESTIA recommends, humans decide, HESTIA learns from outcomes*; *old menus are archived/hidden, not deleted*.

## 4. Latest Implementation State

**Production-ready base (stable):** server-side JWT auth (bcrypt, sessions, idle timeout); Event CRM (8-tab EventDetail, auto-tasks, RSVP, seating); Zohar event brief engine (deterministic, 17 subtypes, 90 tests, signals carry source/evidence/confidence/classification); Event Calendar + daily briefing + ICS export; Cocktail Intelligence (~120 routes: DNA, menus, sales, lifecycle, narratives, visual menu builder); Event Cocktail Menu Builder; Chef module (AI menu + two-stage approval); Shift Management (pre-shift/handover/EOD); Shift Brain V1 (deterministic); Shift Organizer (AI scheduling); Academy (130+ lessons, 6 academies); Wine Atlas; notifications (backend, role-targeted); user management; guest RSVP portal.

**Architecture:** `App.jsx` is composition-only (zero `useState`/`useEffect`); 10 domain hooks own state; features own UI; services own intelligence; `PageRenderer` takes grouped domain prop objects. `server.js` is a single large file (route split deferred to a later hardening phase). Two AI providers: Gemini (primary) + OpenAI (visual menu + images).

**Multi-venue (Phase 8, 2026-06-14):** venue-scoped. A venue is the memory unit; a user is the operator. Venue context per request via `X-HESTIA-Venue` → resolved in `requireAuth` to `req.venueId`. **Never use a default venue id in handlers.** Runtime note: `node:sqlite` has **no** `db.transaction()` — multi-statement writes need manual care.

**Intelligence frontier (F&B Decision Ledger track, Master Execution Plan):** Phases 0–8F complete and green per the plan's completion notes:
- Doctrine set written (North Star, Conversational Intelligence, Venue Memory/DNA Guardrails, Specialist Pattern, F&B Director, Decision Ledger, Research Usage Rules).
- F&B Decision Ledger: table + pure `decisionLedgerService` (write-only-first), then live non-blocking writes on `/api/ci/generate`, `/api/ci/cocktails`, `/api/ci/rejections`.
- Read-only "why?" explanation service (`GET /api/ci/decisions/:id/explanation`).
- Decimal taste convergence into CI/Omer (flag-gated, context-only).
- F&B → Venue Intelligence **candidates** (isolated `venue_intelligence_candidates` table; rejection-only live write, flag-gated; **never** mutates Venue DNA).
- Candidate human review (signal-only; no promotion to DNA).
- F&B Menu Intelligence Snapshot (read-only portfolio view, `GET /api/ci/menu-intelligence`).
- **Deferred / not built:** Phase 7B candidate→Venue DNA promotion; POS integration; automatic DNA mutation; a third cocktail engine.

## 5. Venue Intelligence / OwnerAIHome Status

- A real, disciplined Venue DNA backend exists: table `venue_intelligence` (`messages_json`, `venue_dna_json`, `stage`, `objective`); endpoints `GET/POST/POST` `/api/venue-intelligence[/message|/reset]` (`requireAuth('owner')`, venue-scoped). `/api/venue-intelligence/message` (OpenAI `gpt-4o-mini`, JSON mode) is the **only DNA-writing conversation path**, and it merges through **`mergeVenueDna`** — the single sanctioned DNA writer (monotonic confidence, deterministic floors, dedup/cap ≤8, no fabrication).
- A strong conversational DNA learning surface exists (`VenueIntelligence.jsx` + `useVenueIntelligenceState.js`): chat, four-stage indicator (`story → identity → operations → discovery`), and a "What HESTIA is learning" understanding panel (confidence dots, detected-signal chips, open questions).
- The owner home was made HESTIA AI (commit `d1527b8` "make HESTIA AI the owner home"). The **Owner AI Home** direction (9A spec) is: AI-first home, Build Mode vs Full Intelligence Mode, `OperationalPulse` demoted to a destination, Palette B (editorial light).
- The **9C completeness model** (deterministic foundation readiness over the current 16-dim DNA shape) is spec'd and its evaluator (`venueDnaCompletenessEvaluator.js`) is built and tested. The **9E-3 taxonomy** (35 dimensions, evidence model, draft + confirmation thresholds, next-best-question) is **spec'd only** (9E-3A docs-only); 9E-3B…9E-3F are the recommended next build steps.
- **Full Intelligence Mode remains locked** (`unlock_readiness = false`) until a deterministic foundation threshold and owner-confirmation storage exist.

## 6. Venue DNA Status

- **Stored shape today:** 11 signal arrays + 5 confidence dimensions + stage + summary + openQuestions (per venue, one row).
- **Target taxonomy:** 35 dimensions across identity / guest / emotion / service / F&B / operations / non-negotiables / marketing (see pack `02`).
- **Confirmation tier (owner-confirmed DNA) is NOT built.** Confirmation is a governance event that must be stored outside `venue_dna_json` (planned `venue_dna_confirmations` table in "9D"). Auto-confirmation is forbidden by every path (LLM text, draft acceptance, time, score).
- Working Venue DNA Draft can be produced deterministically; it is always labelled **"Working Venue DNA Draft — not yet confirmed."**

## 7. Known Guardrails (do not violate)

- **`mergeVenueDna` and `emptyVenueDna` are sacrosanct.** Never silently extend them to invent storage for new dimensions.
- The candidate system is **signal-only** and never mutates Venue DNA.
- The LLM never assigns a dimension status, never declares completeness, never emits a percentage on the main surface, never claims confirmed/finalized DNA, never claims Full Intelligence Mode active.
- No costing/menu pricing from unverified data; `barCalculationUtils` returns `null` on missing inputs (never invents).
- All venue reads/writes are venue-scoped via `req.venueId`; never cross-venue.
- Technical identifiers still named "HOSPIA" (`hospia.*` localStorage keys, `X-HOSPIA-Role` header, `data/hospia.sqlite`) must not be renamed without a coordinated migration.
- `VITE_GEMINI_API_KEY` is a known pre-production security issue (bundled into the frontend) — must be made server-side only before production.

## 8. What Has Been Pushed Recently (git, newest first)

```
d1527b8 feat: make HESTIA AI the owner home
6089a6e docs: add roadmap codebase audit
1d60873 docs: add AI bar intelligence roadmap
3a4035c docs: specify Venue DNA taxonomy implementation model
c584cac docs: add Venue DNA taxonomy research
bab0212 fix: make Venue Intelligence chat produce working DNA drafts
e60154b feat: activate Owner AI Home Venue Intelligence chat
5e8246d test: add Venue Intelligence message route audit
```

## 9. Local-Only / Persistence Risks

localStorage-only domains (backend migration deferred): Cocktail Lab drafts/approved/archived/practice (migration architecturally blocked — needs a `client_id` column step); budget requests; employee requests; assigned tasks (manager→employee); owner notes; auth token (httpOnly cookie migration deferred). WhatsApp is simulation-only (logs to DB, never delivered).

## 10. Next Recommended Build Phases

From the master execution plan + 9E-3 spec:
1. **9E-3B** — pure taxonomy constants + dimension definitions (new module + tests).
2. **9E-3C** — evidence extraction / mapping service (LLM proposes evidence, code classifies status).
3. **9E-3D** — draft-readiness + next-best-question engine (deterministic).
4. **9E-3E** — chat prompt integration (inject statuses + next-best-question; 13-section draft).
5. **9E-3F** — OwnerAIHome backstage integration (statuses/readiness in the collapsed panel only).
6. **Later "9D"** — owner confirmation storage + confirmed-DNA tier; **then** evaluate Full Intelligence Mode unlock.
7. **F&B track:** Phase 7B (candidate→DNA promotion, owner-gated, through `mergeVenueDna`), then POS-readiness fields, then repeat the specialist pattern (Academy is closest).
8. The 2026-06-09 connection-layer roadmap (Zohar→CI, Zohar→Chef, daily→pre-shift briefing, etc.) remains valid engineering work where not superseded by the bar-intelligence direction.

## 11. Things the Gem Must Never Assume

- Do **not** assume owner-confirmed Venue DNA exists, that Full Intelligence Mode is unlocked, or that any percentage/score is shown to owners.
- Do **not** assume POS/Tabit is integrated — sales validation is a *future* loop; all such fields are nullable and source-labeled.
- Do **not** assume the 9E-3 taxonomy is built — it is spec'd; only the 9C completeness evaluator is implemented.
- Do **not** assume research conclusions are product decisions — the research corpus is supporting material under guardrails (see pack `07`).
- Do **not** assume multi-venue group intelligence, digital twin, or knowledge-graph/GraphRAG are built — all are future tracks.
- Do **not** treat the open strategic question (what HESTIA ultimately becomes) as resolved — it is deliberately open (see pack `05` and the master memory A10).

---

### Sources
`docs/HESTIA_MASTER_STATE.md` · `docs/HESTIA_CTO_ROADMAP.md` · `memory/project_hestia_master_memory.md` · `docs/plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md` · `docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md` · `docs/architecture/OWNER_AI_HOME_AND_VENUE_DNA_BUILD_MODE_PHASE_9A_SPEC.md` · `docs/architecture/VENUE_DNA_COMPLETENESS_MODEL_PHASE_9C_SPEC.md` · `docs/architecture/VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md` · `docs/architecture/HESTIA_PHASE_8_MULTI_VENUE.md` · `CLAUDE.md`.
