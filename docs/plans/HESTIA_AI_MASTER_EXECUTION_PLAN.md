# HESTIA AI Master Execution Plan

> Date: 2026-06-18
> Type: master planning document — **no code, no tables, no prompts, no UI, no live wiring changed.**
> Grounded in direct inspection of `server.js`, `src/services/venueBridge/*`, `src/features/venue-intelligence/*`, `src/features/cocktail-intelligence/*`, `src/features/bar/*`, `src/domain/hospitality/bar/*`, `src/config/featureFlags.js`, `package.json`, and `docs/research/researches for Venue Intelligence/*`.
> Companions: [North Star & F&B Recommendation](../architecture/HESTIA_AI_NORTH_STAR_AND_FNB_INTELLIGENCE_RECOMMENDATION.md), [Current-State Audit](../audits/BEVERAGE_INTELLIGENCE_CURRENT_STATE_AUDIT.md), [Foundation Layer](../architecture/BEVERAGE_INTELLIGENCE_FOUNDATION_LAYER.md), [Regression Audit](../audits/BEVERAGE_CONTEXT_REGRESSION_AUDIT.md), [Intelligence Doctrine V1](../architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md).
>
> **Current product source of truth (2026-06-21):** [HESTIA AI Bar Intelligence Roadmap](HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md) — the updated product roadmap for AI Bar Intelligence MVP, HESTIA AI owner experience, role-based navigation, Active Bar Programme, Prep Library, Recipe Book, Training Gantt, Academy Intelligence, Manual Tabit Upload, Venue Memory, and Evidence Lifecycle guardrails. Supersedes the phasing in this document for product/roadmap direction.

---

## 1. Executive Summary

HESTIA already has the **spine** of a Venue Operating Intelligence system: a conversational Venue Learning Engine that builds a living Venue DNA with confidence/provenance discipline, a deterministic distribution layer (`venueBridge`) that hands every specialist one shared understanding, and a venue-aware F&B generation path (CI/Omer). The blocker is **fragmentation**, not absence — two cocktail engines, a decimal-taste foundation wired into the *isolated* one, no record of *decisions* (only of conversations), and a feedback loop that is data-present but intelligence-absent.

This plan describes how to execute the **next serious version of HESTIA AI** — converging the fragments into one venue-aware F&B Director that **remembers its decisions, explains them from real understanding, and learns from outcomes**, then scaling that exact pattern to the other specialist intelligences. It is sequenced so that **every phase is shippable and reversible**, the riskiest work (live generation, Venue DNA mutation, POS) is deferred behind explicit gates, and the highest-leverage, lowest-risk keystone (the F&B Decision Ledger) comes first.

This is **not an MVP**. It is the architecture that lets HESTIA become more intelligent every time a specialist makes a decision.

---

## 2. Product Vision Restatement

HESTIA is a **Venue Operating Intelligence system** for a single physical hospitality venue.

- **Venue Intelligence is the central brain.** It holds the venue as a living environment: founder belief, Venue DNA, emotional register, guest profile, service philosophy, price positioning, atmosphere, operational constraints, staff capability, F&B identity, business model — plus the *memory of decisions*, the *uncertainty*, and *how the venue changes over time*.
- **Specialist intelligences are domain brains** (F&B, Service, Academy, Events, Owner, Operations, future POS/Sales, Guest, Reputation, Decision). Each **consumes** the shared understanding and **enriches** it back.
- **Memory is the connective tissue.** Session memory, Venue Memory, Founder memory, Decision memory, Specialist memory, and Uncertainty memory are what make HESTIA feel like it *understands* rather than *responds*.
- **Conversation is the intelligence-gathering interface**, not a form. Each turn extracts multiple dimensions, distinguishes fact from assumption, and updates uncertainty.
- **Decisions are first-class things that must be remembered** — what was decided, why, on which DNA evidence, with which assumptions, and what should later validate it.
- **Future POS/sales signals are validation, not current truth.** They confirm or contradict past decisions and *propose* (never auto-apply) confidence changes to Venue DNA.

The bidirectional law: Venue Intelligence → specialist decision → decision memory + outcome → **candidate** Venue Intelligence update (provenance-gated, never auto-confirmed).

---

## 3. Current Architecture Map

### 3.1 Venue Intelligence (real, persisted)
- Routes (`server.js`): `GET /api/venue-intelligence`, `POST /api/venue-intelligence/message`, `POST /api/venue-intelligence/reset` (all `requireAuth('owner')`).
- Engine: `buildVenueLearningSystemInstruction(...)` (~`server.js:5430+`) + `askVenueIntelligence(...)` (OpenAI `gpt-4o-mini`, JSON mode), `mergeVenueDna(prior, incoming)` (monotonic confidence + deterministic floors + no-fabrication).
- Persistence: table **`venue_intelligence`** (`messages_json`, `venue_dna_json`, `stage`, `objective`). Plus **`venue_briefs`** (persisted briefs) and **`venue_dna_enrichment`** (signals + enrichment).
- Client: `useVenueIntelligenceState.js`, `VenueIntelligence.jsx`, `venueDnaModel.emptyVenueDna()`.

### 3.2 venueBridge (real)
- `src/services/venueBridge/venueBridgeService.js` → `buildVenueBriefs()` → 5 briefs (`fb, training, service, event, owner`), `insufficient_signal` honesty, `hashVenueDna()`.
- `src/services/venueBridge/intelligenceContextService.js` → `assembleUnifiedContext()`, `selectOmerContext()`, `selectAcademyContext()`, `selectOwnerIntelligence()`.
- Specialist context services: `omerContextService.js` (`buildOmerContextBlock`), `academyContextService.js`, `ownerIntelligenceService.js`, `operationalSignalsService.js`, `beverageContextService.js` (`buildVenueBeverageContext`, `formatVenueBeveragePromptBlock`).
- Routes: `/api/venue-bridge/briefs`, `/briefs/:type`, `/academy`, `/regenerate`, `/operations`, `/owner-intelligence`, `/context` (`BRIDGE_READ_ROLES`).

### 3.3 CI / Omer F&B path (real, venue-aware)
- `POST /api/ci/generate` (`CI_ROLES = owner, manager, bar_manager, admin, fb_director`): `buildGenerationPrompt(flow_type, params, dna, tasteDna, existingNames, omer.text)` → `askGemini(..., jsonMode)`. Injects `getOmerVenueContext(venueId)`.
- `buildDirectorSystemInstruction(dna, menuCocktails, omer.text)` (the F&B "Director" persona, server-side).
- DB: **`cocktail_intelligence_dna`** (Bar DNA), **`cocktail_taste_dna`** (rejection/approval *pattern* learning), **`cocktail_sales`** (units, price, cost, revenue, GP, GP%), **`cocktail_rejections`**, **`cocktail_narratives`**, **`cocktail_scores`**, **`cocktail_trends_db`**, **`cocktail_lifecycle`**, **`cocktail_emergency_log`**, **`cocktails`**, **`cocktail_menus`**, **`cocktail_ingredients`**, **`cocktail_pricing`**.
- Menu design: `POST /api/ci/generate-menu-design` (OpenAI `gpt-4o`, `HESTIA_COCKTAIL_MENU_SKILL` system prompt), tables `visual_menu_designs`, `ci_menu_full_designs`.
- UI: `src/features/cocktail-intelligence/*` (MenuGenerator, VisualMenuBuilder, MenuRenderer, SalesTracker, RejectionMemory, MenuMargin, NarrativeIntelligence, BarDNACard).

### 3.4 Cocktail Lab path (real, isolated, NOT venue-aware)
- `CocktailLabStudio.jsx` → `cocktailService.requestCocktailProposal` → `geminiCocktailAgent.generateGeminiCocktailProposal` → `buildCocktailPrompt` → `POST /api/gemini` (generic proxy).
- 25-field proposal contract (`EXPECTED_FIELDS`), ml enforcement, repair/fallback, integer flavor radar (`cocktailFlavorProfileUtils`), deterministic micro-adjust sliders (`cocktailAdjustmentUtils`), source-honest costing (`cocktailLabPricingAdapter`), build guide.
- My decimal-taste + venue injection live **here**, flag-gated (`ENABLE_VENUE_BEVERAGE_CONTEXT`), default-off, **not wired to a caller** → dormant.

### 3.5 Event Cocktail Menu Builder (real, separate — to be left untouched)
- `src/services/eventCocktailMenuService.js` (`generateEventMenu`, `replaceEventCocktail`), `eventMenuDNA.js` (hard-coded per-type DNA), routes under `/api/events/:id/cocktail-menu*`, table `event_cocktail_menus`.

### 3.6 Beverage foundation modules (real, additive, mostly dormant)
- `src/domain/hospitality/bar/`: `tasteProfileSchema.js`, `classicTasteCalibration.js`, `cocktailFamilyRatios.js`, `ingredientTasteImpact.js`, `microAdjustmentPrediction.js`, `venueTasteProfileMap.js` (+ pre-existing `classicCocktailLibrary`, `cocktailKnowledgeBase/*`, pricing adapter).

### 3.7 Operational memory / other tables
- `business_memory` (event-log grade), `actions`, `incidents`, `notes`, `shifts`, `carry_forward_tasks`, `shift_reports`, `staff_progress`, `owner_insights`, `employees`, `food_*`, `notifications`.

### 3.8 Doctrine / docs / flags
- Docs: `HESTIA_INTELLIGENCE_DOCTRINE_V1.md`, `HESTIA_MASTER_STATE.md`, `HESTIA_ARCHITECTURE_AUDIT.md`, `HESTIA_CTO_ROADMAP.md`, `KNOWLEDGE_GOVERNANCE.md`, plus the four beverage reports.
- Flags: `src/config/featureFlags.js` → `FEATURE_FLAGS.venueBeverageContext = false`, `isVenueBeverageContextEnabled()`, env `ENABLE_VENUE_BEVERAGE_CONTEXT`.
- Scripts (`package.json`): `dev`, `build`, `server`, `server:dev`, `start`, `start:prod`, `hestia:check`, `test:beverage`.
- Tenancy: `requireAuth(...)` resolves `X-HESTIA-Venue` → `req.venueId` (all venue data is venue-scoped; **never** use a default venue id in handlers). Runtime note: `node:sqlite` has **no** `db.transaction()` — multi-statement writes need manual care.

---

## 4. Current Intelligence Flow (what happens today)

1. **Owner conversation** → `/api/venue-intelligence/message` → `gpt-4o-mini` extracts full Venue DNA → `mergeVenueDna` (monotonic + floors) → persisted in `venue_intelligence`. **REAL.**
2. **Brief creation** → `buildVenueBriefs` (on demand / `/regenerate`) → persisted `venue_briefs`; `assembleUnifiedContext` for unified read. **REAL.**
3. **CI/Omer generation** → `/api/ci/generate` injects `getOmerVenueContext` (from briefs) + Bar DNA + rejection-pattern Taste DNA → Gemini. **REAL & venue-aware.**
4. **Cocktail Lab generation** → `/api/gemini` proxy, **no** venue context (decimal/venue injection dormant). **REAL but disconnected.**
5. **Event cocktail menu** → `eventCocktailMenuService` with hard-coded `eventMenuDNA`, **not** Venue DNA. **REAL but separate.**
6. **Sales / taste data** → `cocktail_sales` stored; `cocktail_taste_dna` updated from rejection reasons (count ≥ 2 → pattern). **REAL as storage; not looped.**
7. **Memory updates back to Venue DNA from decisions/outcomes** → **DOES NOT EXIST.** Venue DNA only changes via the owner conversation.

**Where flow is real:** conversation → Venue DNA → briefs → Omer → CI generation; sales/rejection storage.
**Where it is disconnected:** Cocktail Lab; decimal taste foundation; Event Builder; any write-back from decisions/sales to Venue DNA.
**Where it is documented only:** decision memory, explanation-from-understanding, POS validation, bidirectional loop.

---

## 5. Target Intelligence Flow

```
Conversation turn
  → meaning extraction (explicit + implied, multi-dimension)
  → memory candidate (session → venue → founder)
  → confidence + provenance labeling
  → Venue DNA update CANDIDATE  (human/confidence-gated; never auto-confirm)
  → specialist context (venueBridge / unified context)
  → specialist DECISION (e.g. F&B Director generates a menu)
  → DECISION LEDGER entry (what + why + DNA evidence + assumptions + taste target)
  → explanation basis recorded (answers "why?" on demand)
  → human review / approval / light correction
  → future POS/sales VALIDATION (confirms or contradicts the decision)
  → Venue Intelligence FEEDBACK CANDIDATE (provenance-gated confidence delta)
```

**F&B first** (the wedge): the loop is fully exercised on one specialist where the data already exists (Bar DNA, Taste DNA, sales). **Then the same shape scales**: every specialist writes the same decision-record + feedback-candidate structure through the same `venueBridge` + enrichment machinery, so no specialist becomes a silo and Venue Intelligence is the only place "truth" is confirmed.

---

## 6. Conversational Intelligence Plan

Today's engine already extracts multi-dimension DNA from one answer, sets confidence anchors, and forbids fabrication (`buildVenueLearningSystemInstruction`). The plan **strengthens, not replaces** it.

What HESTIA must do (and what is needed for it):
- **Understand explicit + implied meaning, multi-dimension per turn** — already partly present; formalize as a documented extraction contract (doctrine, not new prompt bloat).
- **Avoid redundant questions** — needs a "known vs unknown vs uncertain" view derived from current Venue DNA + `openQuestions`; the engine should be told what is already known so it never re-asks. (Read-only context, not new tables.)
- **Classify uncertainty** — extend the DNA/enrichment shape conceptually with per-signal provenance + confidence + status (`confirmed | candidate | assumption | conflicting | missing`). Today confidence is per-dimension only; the *candidate vs confirmed* distinction is the gap.
- **Preserve session memory** — `messages_json` already does this per venue session.
- **Produce Venue Memory candidates** — route to the Decision/Memory model (§12) rather than mutating DNA directly.
- **Route context to the right specialist** — `buildVenueBriefs` already routes by keyword; document this as the canonical router; future specialists subscribe to brief types.

Deliverables to enable it: a **Conversational Intelligence Doctrine** (§18) and a **shared memory/provenance shape** (§12). No live prompt change in early phases.

---

## 7. Venue Memory and Venue DNA Plan

Current behavior (verified): Venue DNA is a single evolving object; confidence is monotonic with deterministic floors; nothing is invented; only the owner conversation writes it.

Safe evolution:
- **Remember:** stable identity/positioning/guest/service/F&B signals; owner non-negotiables and beliefs (Founder memory); decisions and their outcomes (Decision memory).
- **Keep temporary:** single-mention inferences, AI guesses, weak signals → **candidates**, never promoted automatically.
- **Require human approval:** any *confirmed* Venue DNA change driven by specialist decisions or sales evidence (high-impact mutation).
- **Decay over time:** stale candidates and outdated assumptions should lose confidence if never reinforced (a decay rule, applied to candidates only, never to owner-confirmed facts).
- **Become stable DNA:** signals corroborated across multiple turns/sources + (optionally) human confirmation.
- **Avoid fake memory / automatic truth mutation:** keep the existing no-fabrication discipline; add the explicit **candidate vs confirmed** layer so write-back from specialists/sales lands as candidates only.

Recommendation: **do not change `venue_intelligence` write behavior in early phases.** Introduce the candidate/provenance concepts first in the shared model and the Decision Ledger; only later (Phase 6+, gated) allow specialists to emit Venue DNA *candidates* routed through the existing enrichment/confidence machinery.

---

## 8. Specialist Intelligence Architecture

One pattern for all specialists: **consume** via `assembleUnifiedContext`/briefs; **produce** a domain decision; **record** it in the Decision Ledger; **feed back** a provenance-gated candidate. Guardrails (provenance, confidence, role access, venue boundary, evidence labels, human approval for high-impact, no fabrication) apply uniformly.

| Specialist | Consumes from Venue Intelligence | Produces | Feeds back (candidate) | Remembers (decision) | Key guardrails |
|---|---|---|---|---|---|
| **F&B** (Omer) | DNA, fb/service briefs, Bar DNA, Taste DNA | cocktail menus, recipes, taste targets | discovered constraints, taste direction, guest-risk tolerance | menu/drink generation + approval + outcome | no fake costs/KPIs; decimal taste honest; kosher conditional |
| **Service** | service/guest briefs, DNA | service standards, recovery playbooks | observed service pain, pace reality | standard set / change | no staff surveillance; evidence-labeled |
| **Academy/Training** | training brief, capability signals (already wired via `academyContextService`) | learning order, lesson routing | capability gaps revealed | recommended path chosen | use existing manifest only; no invented lessons |
| **Event** | event brief, DNA | event menus/timelines | event patterns, constraints | event plan decisions | keep separate from bar F&B for now |
| **Owner** | full unified context (`selectOwnerIntelligence`) | strategic narrative | corrected priorities | strategic decisions | owner-only; no technical dump by default |
| **Operations** | ops signals/enrichment | operational recommendations | recurring pains, capacity limits | ops decisions | evidence-labeled; no fake metrics |
| **POS/Sales (future)** | decision ledger + sales | validation verdicts | confidence deltas to DNA | which decisions validated/contradicted | nullable, `source`-tagged; candidate-only |
| **Guest (future)** | guest signals, reputation | guest-experience guidance | guest-profile refinements | guest decisions | privacy; no fabricated segments |
| **Reputation (future)** | external signals (later) | positioning guidance | market-position candidates | positioning decisions | external provenance required |

---

## 9. F&B Intelligence Execution Plan (the wedge)

**Primary path decision: the CI/Omer server path becomes the canonical F&B Director.** It is already venue-aware (Bar DNA + Taste DNA + Omer context) and venue-scoped. The Cocktail Lab becomes a **studio surface over the same brain**, not a competing engine. The Event Builder stays out of scope.

Convergence moves (planned, sequenced in §14):
- **Decimal taste into the venue-aware path:** the foundation modules (`tasteProfileSchema`, `classicTasteCalibration`, `cocktailFamilyRatios`, `ingredientTasteImpact`, `venueTasteProfileMap`, `beverageContextService`) feed a **target taste profile range** into the Omer brief / `buildGenerationPrompt`, and a **per-cocktail decimal taste profile** as output — reusing `formatVenueBeveragePromptBlock` for compactness. Keep the integer flavor model intact in parallel.
- **`cocktail_taste_dna` upgraded (extend, not replace):** add decimal approved/rejected centroids alongside the existing rejection-pattern JSON, so taste learning becomes professional, not just "avoid what was rejected twice."
- **Cocktail Lab:** point it at the same shared venue context (flag-gated) so the human studio and the Director share one understanding; preserve its editing UX, ml enforcement, and 25-field contract. **Do not migrate it to a new engine.**
- **No third engine.** All generation continues to flow through the existing CI/Omer prompt builders (server) and the existing Lab proposal builder (client); convergence is about shared *context + memory*, not a rewrite.
- **On-demand "why?":** a read-only explanation service answers "why this drink / taste / family / sweetness / fit" from the **Decision Ledger + Venue DNA + explanation basis + confidence labels** — never canned prompt text, never shown to owners by default.
- **Future POS validation:** the Decision Ledger + `cocktail_sales` linkage (planned fields, §13) lets later sales confirm/contradict decisions — without building POS now.

---

## 10. F&B Decision Ledger Plan

**Why:** it is the keystone that makes F&B *explainable* and *self-improving*. Today HESTIA remembers conversations and stores sales, but never records *why a menu/drink was chosen*. Without this, "why does this fit my venue?" can only be answered from prompt text, and outcomes can never validate decisions.

**Stores:** decision type, subject ref, the Venue DNA version hash at decision time, DNA dimensions used, target taste profile, resulting decimal taste profile, cocktail family chosen + styles avoided, operational constraints applied, ingredients chosen/avoided, assumptions, explanation basis, confidence + per-source confidence, evidence sources, human action (approve/reject/edit), and (future) POS validation status/ref.

**Does NOT store:** fabricated reasoning, invented costs/KPIs, owner-facing prose, anything not actually used in the decision, or any confirmed Venue DNA mutation (it emits *candidates* only).

**Supports:** on-demand explanations; feedback candidates to Venue DNA; future POS validation (join ledger ↔ `cocktail_sales`).

**Write-only first:** in early phases nothing reads the ledger back into prompts — it only records. This removes risk: generation behavior is unchanged, and we accumulate real decision history before anything depends on it.

**If implemented poorly:** JSON snapshot bloat, cross-venue leakage (must be `venueId`-scoped), or coupling that breaks `/api/ci/generate`. Mitigations in §15.

**Where it lives:** a new pure `src/services/venueBridge/decisionLedgerService.js` (record/read; deterministic; no AI), with a venue-scoped table written from the existing CI endpoints. It belongs in `venueBridge` because a decision is a venue-intelligence artifact, not a cocktail artifact.

(No implementation in this document.)

---

## 11. Knowledge Integration Plan

Convert research → intelligence without prompt bloat:
- **Doctrine documents** (canonical): North Star, Conversational Intelligence, Venue Memory/DNA guardrails, Specialist pattern, F&B Director, Decision Ledger, Research-usage rules (§18). These govern how agents build — they are *not* injected into model prompts.
- **Structured knowledge modules** (code, `src/domain/...`): the beverage foundation is the template — small, pure, testable data + lookups, injected **only when relevant** and **compact** (the `buildKnowledgeContext` + `formatVenueBeveragePromptBlock` pattern).
- **Specialist knowledge packs:** per-domain modules (service, academy already partly exist) following the same shape.
- **Prompt context adapters:** `*ContextService` modules that turn shared understanding into a *small* block per specialist (Omer/beverage adapters are the template).
- **Retrieval / GraphRAG later:** only if/when the knowledge base outgrows compact injection. The research `Venue Intelligence Graph` is a *future* track, not now.
- **Never paste:** the research corpus, full classic/ingredient/micro tables, or chain-of-thought into prompts.
- **Embed in code:** reusable structured knowledge + deterministic logic.
- **Docs-only:** doctrine, rationale, research.
- **Retrieve dynamically:** later, large or venue-specific evidence.
- **Avoid bloat:** one compact block per specialist; measure prompt size (already done for the venue block); gate behind flags.

---

## 12. Data, Memory, and Provenance Model

Minimum shared shape HESTIA should grow toward (define now, adopt incrementally — **do not build tables in this plan**):

```
MemoryEntry / DecisionEntry (shared envelope)
  id, venue_id, created_at, created_by, role,
  kind,                  // 'memory_candidate' | 'decision' | 'feedback_candidate' | ...
  specialist,            // 'fb' | 'service' | 'academy' | 'event' | 'owner' | 'ops' | 'pos'
  subject_ref,           // what it is about
  content,               // structured payload (domain-specific)
  evidence: [ { source, ref, excerpt? } ],
  provenance,            // 'owner_conversation' | 'specialist_decision' | 'sales_signal' | 'ai_inference'
  confidence,            // 0-100, per-source where relevant
  status,                // 'confirmed' | 'candidate' | 'assumption' | 'conflicting' | 'missing' | 'decayed'
  assumptions: [...],
  missing_fields: [...],
  human_approval,        // null | approved_by/at | rejected
  validation_target,     // future: what should confirm/contradict this
  venue_boundary,        // always venue_id-scoped; never cross-venue
  role_access            // who may read it
```

This single envelope underlies Venue Memory candidates, the F&B Decision Ledger, and future specialist memories. **Do not** build a graph DB yet — SQLite tables with JSON payloads (the existing pattern) are sufficient; the envelope is the shape to converge on. Adopt it first in the Decision Ledger, then reuse.

---

## 13. Future POS / Sales Intelligence Preparation

Do not integrate POS. Prepare so future signals are meaningful:
- **Extend `cocktail_sales`** (already has units, price, cost, revenue, GP, GP%) with nullable, `source`-labeled fields: `daypart`, `day_of_week`, `season`, `comps_voids`, `returns_complaints`, `attach_food`, `staff_difficulty`, `speed_seconds`, `guest_segment`, `source` ('manual'|'pos'|'import'), and `decision_id` (FK → ledger).
- **On the decision record:** `pos_validation_status` ('pending'|'validated'|'contradicted'|'n/a') + `pos_validation_ref`.
- **What should update Venue Intelligence:** only **candidates** — e.g., "DNA-fit cocktail underperformed → lower confidence in that guest assumption," "premium vision matched high-margin uptake → corroborate commercial confidence." Routed through enrichment/confidence machinery, human-gated for high impact.
- **What must never be invented:** sales numbers, KPIs, margins, reorder rates, or any "operational truth." All nullable until real data arrives; `source` always labeled.

Enables later (by joining ledger ↔ sales): did the menu fit the venue? which DNA-fit cocktails didn't sell? which high-margin drinks underperformed? did owner vision match guest behavior? should DNA confidence change?

---

## 14. Phased Execution Plan

> Every phase: additive, venue-scoped, flag-gated where it touches live generation, byte-identical when flags off, with its own deterministic test and a clean rollback (revert the additive files / drop unused table). Generation contracts and the integer flavor model are never broken.

### Phase 0 — Doctrine & guardrail alignment (docs only)
- **Objective:** write the canonical doctrine (§18) so all later work is unambiguous.
- **Files:** new docs under `docs/architecture/` + `docs/plans/`; update `HESTIA_MASTER_STATE.md` to record the CI-vs-Lab convergence decision.
- **Build:** doctrine documents. **Not built:** any code.
- **Tests:** doc review; `npm run hestia:check` (unaffected). **Risks:** none material. **Rollback:** delete docs.
- **You receive:** an unambiguous doctrine base; future agents cannot rebuild a third engine by accident.

### Phase 1 — F&B Decision Ledger planning (design, no code)
- **Objective:** finalize ledger schema (§12 envelope, §10 fields), write-points, and read contract.
- **Files:** a design note in `docs/architecture/`. **Not built:** table/service.
- **Tests:** design review. **Risks:** none. **Rollback:** delete note.
- **You receive:** a precise, reviewed spec ready to implement.

### Phase 2 — F&B Decision Ledger implementation (write-only, additive)
- **Objective:** create the ledger table + pure `decisionLedgerService` (record/read); nothing reads it into prompts.
- **Files:** `server.js` (additive `CREATE TABLE`, careful: no `db.transaction()`), new `src/services/venueBridge/decisionLedgerService.js`, new `scripts/test-fb-decision-ledger.js`.
- **Built:** the ledger + service + tests. **Not built:** any prompt/read-into-generation, any UI.
- **Tests:** new ledger test (venue-scoped, no fabricated fields, nullable POS fields safe), `npm run build`, `npm run hestia:check`.
- **Risks:** migration failure (LOW), cross-venue leakage (MED if not scoped). **Rollback:** drop table + delete service; no generation depends on it.
- **You receive:** durable decision storage; the keystone is in place with zero behavior change.

### Phase 3 — Wire decision logging to the venue-aware F&B path
- **Objective:** write a ledger row on `/api/ci/generate` and on CI approve/reject/edit.
- **Files:** `server.js` CI handlers (add a ledger write after the existing logic), ledger test extended.
- **Built:** decision capture from real generation. **Not built:** reading ledger into prompts; Venue DNA changes.
- **Tests:** generate → row written with real DNA dimensions/explanation basis; output unchanged. `npm run build`, `hestia:check`, manual CI generation smoke.
- **Risks:** coupling could break `/api/ci/generate` (MED) — mitigate by wrapping the write in try/catch so a ledger failure never blocks generation. **Rollback:** remove the write call.
- **You receive:** HESTIA now *remembers F&B decisions*; explanation + feedback become possible.

### Phase 4 — On-demand explanation service (read-only)
- **Objective:** answer "why this drink / taste / family / fit" from ledger + DNA + explanation basis + confidence.
- **Files:** new read endpoint + pure service; new test. **Not built:** owner-facing UI; default explanations.
- **Tests:** returns recorded basis; returns honest "not recorded / low confidence" on gaps. `npm run build`, `hestia:check`.
- **Risks:** explanations too technical for owners (MED) — keep on-demand, role-gated, plain-language. **Rollback:** remove endpoint.
- **You receive:** HESTIA can *explain decisions from real understanding* on demand.

### Phase 5 — Decimal taste convergence into CI/Omer (flag-gated)
- **Objective:** carry a compact decimal target-taste-range into the venue-aware path and store per-cocktail decimal profiles on the ledger.
- **Files:** `omerContextService`/`getOmerVenueContext` (add target range via `beverageContextService`), `buildGenerationPrompt` (compact decimal block, reuse `formatVenueBeveragePromptBlock`), ledger fields; reuse `ENABLE_VENUE_BEVERAGE_CONTEXT`.
- **Built:** decimal taste in the *right* engine. **Not built:** removal of integer model; Cocktail Lab rewrite.
- **Tests:** flag off → byte-identical; flag on → compact decimal block, no bloat (size measured); profiles validate 0.0–5.0. `npm run test:beverage`, `build`, `hestia:check`, regression audit.
- **Risks:** prompt bloat (MED), double context systems (MED) — one compact block, measured. **Rollback:** flag off / revert additive lines.
- **You receive:** professional decimal taste reasoning in the venue-aware Director.

### Phase 6 — F&B → Venue Intelligence feedback **candidates** (gated)
- **Objective:** from approvals/edits/rejections, emit *candidate* Taste DNA updates (decimal centroids) and *candidate* Venue DNA confidence deltas — never auto-confirm.
- **Files:** `cocktail_taste_dna` extended (decimal centroids alongside rejection patterns), enrichment/confidence routing, ledger linkage; new tests.
- **Built:** candidate write-back. **Not built:** automatic Venue DNA confirmation.
- **Tests:** weak evidence never raises confirmed DNA; candidates labeled; existing rejection learning intact. `test:beverage`, `build`, `hestia:check`.
- **Risks:** accidental DNA mutation (HIGH if mishandled) — candidates-only through existing machinery, human-gated. **Rollback:** disable candidate emission.
- **You receive:** the loop starts closing — decisions begin to *propose* sharper Venue understanding.

### Phase 7 — Manual review / approval workflow
- **Objective:** let owner/admin review candidate DNA/taste changes and approve/reject.
- **Files:** review endpoints + minimal surfacing (read of candidates); approval writes confirmed changes through existing machinery.
- **Built:** human-in-the-loop confirmation. **Not built:** auto-apply.
- **Tests:** only approved candidates change confirmed DNA; provenance recorded. `build`, `hestia:check`.
- **Risks:** role/permission errors (MED) — strict `requireAuth`. **Rollback:** hide review surface; candidates remain unconfirmed.
- **You receive:** safe, auditable bidirectional learning.

### Phase 8 — Prepare POS validation fields (no integration)
- **Objective:** add nullable `source`-labeled fields to `cocktail_sales` + ledger validation status/ref (§13).
- **Files:** `server.js` additive migrations; tests for null-safety.
- **Built:** POS-readiness. **Not built:** POS integration; auto-validation.
- **Tests:** migrations apply; nulls safe; no behavior change. `build`, `hestia:check`.
- **Risks:** migration failure (LOW). **Rollback:** drop added columns.
- **You receive:** the schema is ready for real sales to validate decisions later.

### Phase 9 — Repeat the pattern for Service / Academy / Event Intelligence
- **Objective:** apply the consume→decide→record→feedback pattern to the next specialist (Academy is closest — `academyContextService` already exists).
- **Files:** per-specialist context adapter + ledger reuse + tests.
- **Built:** a second specialist in the loop. **Not built:** all specialists at once; multi-venue group intelligence.
- **Tests:** specialist decisions recorded; candidates gated. `build`, `hestia:check`.
- **Risks:** silo drift (MED) — all reads via unified context, all writes via the shared envelope. **Rollback:** disable the new specialist's ledger writes.
- **You receive:** proof the architecture scales beyond F&B — HESTIA as a true multi-specialist Venue OS.

---

## 15. What Could Break Across The Whole Process

| Risk | Likelihood | Impact | Prevention | Verification | Rollback |
|---|---|---|---|---|---|
| DB init/migration failure (`node:sqlite`, no `db.transaction()`) | Med | High | Additive `CREATE TABLE IF NOT EXISTS`; idempotent `ALTER` in try/catch; no multi-statement atomic assumptions | `npm run build`, server boot, `hestia:check` | Drop added table/columns |
| Duplicated intelligence engines (third cocktail engine) | Med | High | Doctrine forbids it; converge on CI/Omer; Lab = studio over same brain | Static review; doctrine check | N/A (prevent) |
| Prompt bloat | Med | Med | One compact block per specialist; measure size; flag-gated | size logging, `test:beverage` | Flag off |
| Broken generation contracts (25-field/ml) | Low | High | Never edit `EXPECTED_FIELDS`/contract; additive only | `test:beverage`, manual generate | Revert |
| Broken Cocktail Lab | Low | High | Flag-gated, byte-identical when off | regression audit | Flag off / revert |
| Broken CI/Omer | Med | High | Ledger writes wrapped in try/catch; never block generation | manual CI generate | Remove write call |
| Broken Event Builder | Low | Med | Out of scope; static guard it isn't imported | grep guard in tests | N/A |
| Accidental Venue DNA mutation | Med | High | Candidates-only; human-gated; through `mergeVenueDna` machinery | feedback tests | Disable candidate emission |
| Fake memory / confidence / sales | Med | High | No-fabrication doctrine; `source`/provenance labels; nullable POS | tests assert no fabricated fields | Remove offending writer |
| Role access violation / cross-venue leakage | Med | High | `requireAuth` + `req.venueId` on every read/write; never default venue | per-route tests | Tighten guard |
| JSON snapshot bloat | Med | Med | Store refs + compact payloads; cap arrays (existing pattern ≤8) | row-size checks | Trim payloads |
| Feature flag confusion | Low | Med | Reuse one flag; document resolution order | flag on/off tests | Default off |
| ESM/import breakage | Low | Med | Explicit `.js` extensions; Node-safe `import.meta.env` guards (already fixed) | `build`, `test:beverage` | Revert import |
| Build/test instability | Low | Med | Each phase shippable + tested | full check suite | Revert phase |
| Over-abstracted architecture | Med | Med | No graph DB yet; SQLite+JSON envelope; build only what a phase needs | design review | Simplify |
| Underpowered architecture | Med | Med | Define the target envelope now; converge incrementally | design review | Extend |
| Future agents misunderstanding doctrine | Med | High | Canonical doctrine docs (§18); update master state | doc presence check | Improve docs |
| Owner explanations too technical | Med | Med | On-demand, role-gated, plain language; no default | UX review | Hide surface |
| Specialist silos | Med | High | All reads via unified context; all writes via shared envelope | architecture review | Re-route |

---

## 16. What You Will Receive At The End Of Each Phase

- **Phase 0:** Canonical doctrine. *HESTIA can:* be built consistently by any agent. *Still cannot:* remember decisions. *Unlocks:* safe execution of all later phases.
- **Phase 1:** Reviewed ledger spec. *Can:* implement confidently. *Cannot:* store decisions yet. *Unlocks:* Phase 2.
- **Phase 2:** Durable, venue-scoped decision storage (write-only). *Can:* persist decisions. *Cannot:* explain or learn yet. *Unlocks:* explanation + feedback.
- **Phase 3:** Real F&B decisions captured on every generation. *Can:* remember *why* a menu was made. *Cannot:* answer "why?" to a user yet. *Unlocks:* explanation service.
- **Phase 4:** On-demand "why?" from real understanding. *Can:* justify decisions to owner/operator on request. *Cannot:* improve from outcomes yet. *Unlocks:* feedback loop.
- **Phase 5:** Decimal taste reasoning in the venue-aware Director. *Can:* reason with professional taste nuance per venue. *Cannot:* learn taste from approvals yet. *Unlocks:* taste learning.
- **Phase 6:** Candidate feedback to Venue/Taste DNA. *Can:* propose sharper venue understanding from decisions. *Cannot:* confirm changes automatically. *Unlocks:* human-approved learning.
- **Phase 7:** Reviewed, approved bidirectional learning. *Can:* safely evolve Venue DNA from F&B. *Cannot:* validate against real sales yet. *Unlocks:* POS validation.
- **Phase 8:** POS-ready schema. *Can:* accept real sales to validate decisions later. *Cannot:* validate until POS data exists. *Unlocks:* commercial truth loop.
- **Phase 9:** A second specialist in the loop. *Can:* operate as a multi-specialist Venue OS. *Cannot:* (yet) cover all specialists / multi-venue groups. *Unlocks:* full specialist rollout.

---

## 17. What Not To Build Yet

- Full POS integration.
- Automatic Venue DNA mutation from sales or single approvals (candidates + human approval only).
- A new/third cocktail engine.
- Event menu rewrite or migrating `eventMenuDNA` to Venue DNA.
- Owner-facing technical dashboards or default technical taste explanations.
- Large prompt injections / research corpus in prompts.
- Fake benchmarks, fake economics, fake KPIs.
- A full graph database (until compact injection + SQLite/JSON is demonstrably outgrown).
- Staff-surveillance behavior in any specialist.
- Cross-venue / multi-venue group intelligence without strict tenant isolation + permissions.

---

## 18. Doctrine and Documentation Needed

| Document | Purpose | Location | Canonical? |
|---|---|---|---|
| HESTIA AI North Star Doctrine | The single statement of what HESTIA is (Venue OS, bidirectional, memory-centric) | `docs/architecture/` | Canonical |
| Conversational Intelligence Doctrine | How HESTIA understands conversation, multi-dimension extraction, no redundant questions, uncertainty classification | `docs/architecture/` | Canonical |
| Venue Memory & Venue DNA Guardrails | Candidate vs confirmed, decay, human approval, no-fabrication, no auto-mutation | `docs/architecture/` | Canonical |
| Specialist Intelligence Pattern | The consume→decide→record→feedback contract every specialist follows | `docs/architecture/` | Canonical |
| F&B Director Intelligence Doctrine | CI/Omer is the F&B Director; Lab is a studio; decimal taste + ledger mandatory; events second | `docs/architecture/` | Canonical |
| Decision Ledger Doctrine | Ledger shape, write-points, provenance, candidate-only feedback, write-only-first | `docs/architecture/` | Canonical |
| Research Archive Usage Rules | Research → doctrine/modules only; never prompt fuel; guardrails before code | `docs/research/` or `KNOWLEDGE_GOVERNANCE.md` | Canonical |
| Two-Engines Reconciliation note | Record CI-vs-Lab decision so no third engine is built | `HESTIA_MASTER_STATE.md` | Canonical |

Supporting (not canonical): the existing four beverage reports and the research archive remain as supporting context.

---

## 19. Immediate Next Recommendation

**Proceed with Phase 0 (Doctrine) immediately, then Phase 1 (Decision Ledger planning).** Do not start code with Phase 2 until the doctrine and ledger spec are written and reviewed.

Justification: the single most important gap (§7 of the North Star report) is the **missing decision memory + write-back loop**, and the single most important *risk* is **fragmentation / a third engine**. Both are addressed by *deciding and documenting* before building. Phase 0 is zero-risk and prevents the most expensive mistakes; Phase 1 turns the ledger from an idea into a reviewable spec. The first code (Phase 2, write-only ledger) is then the **highest-leverage, lowest-risk** engineering action: it changes no generation behavior, is fully reversible, and unlocks explanation, feedback, and POS validation. Anything earlier that touches live generation or Venue DNA carries risk we do not need to take yet.

---

## 20. Verification Plan (for every future phase)

- **Automated:**
  - `npm run test:beverage` — must stay green (106/106 today); extend per phase.
  - New per-phase Node tests (e.g., `scripts/test-fb-decision-ledger.js`) — exit 0/1, venue-scoped, assert no fabricated fields.
  - `npm run build` — vite production build clean.
  - `npm run hestia:check` — build + audit checks; no new FAIL rows.
- **Static guards (each phase):** Event Cocktail Menu Builder files unchanged; `EXPECTED_FIELDS`/ml contract intact; integer flavor model intact; kosher conditional/default-off; no research corpus in prompts; all new routes `requireAuth` + `req.venueId` scoped.
- **Flag behavior:** flag-off → byte-identical prompt; flag-on → only the compact block added (size measured).
- **Manual:** one owner venue-conversation test (DNA still extracts, no fabrication); one CI generation smoke (ledger row written, output unchanged); one on-demand "why?" check (answers from recorded basis, honest on gaps).
- **Regression audit** after any wiring change (repeat the `BEVERAGE_CONTEXT_REGRESSION_AUDIT.md` method): diff review, call-path trace, cross-venue/role checks, generation-contract integrity.

---

*End of master execution plan. No product code, tables, prompts, UI, or live behavior were changed in producing this document. Findings are grounded in the code/tables/routes cited above.*

---

## Phase 0 — Completion Note (2026-06-18)

**Phase 0 (Doctrine & guardrail alignment) is complete. Docs-only — no product code, tables, prompts, UI, or live behavior changed.**

Canonical doctrine set created under `docs/architecture/`:
1. [HESTIA_AI_NORTH_STAR_DOCTRINE.md](../architecture/HESTIA_AI_NORTH_STAR_DOCTRINE.md)
2. [CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md](../architecture/CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md)
3. [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](../architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md)
4. [SPECIALIST_INTELLIGENCE_PATTERN.md](../architecture/SPECIALIST_INTELLIGENCE_PATTERN.md)
5. [FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md](../architecture/FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md)
6. [DECISION_LEDGER_DOCTRINE.md](../architecture/DECISION_LEDGER_DOCTRINE.md)
7. [RESEARCH_ARCHIVE_USAGE_RULES.md](../architecture/RESEARCH_ARCHIVE_USAGE_RULES.md)
8. [README_HESTIA_AI_DOCTRINE_INDEX.md](../architecture/README_HESTIA_AI_DOCTRINE_INDEX.md) (index / reading order)

Relationship to existing doctrine: the set **complements** the canonical [HESTIA_INTELLIGENCE_DOCTRINE_V1.md](../architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md) (unchanged) and the broader [KNOWLEDGE_GOVERNANCE.md](../KNOWLEDGE_GOVERNANCE.md); it does not overwrite or duplicate them. The archived research draft remained in `docs/research/researches for Venue Intelligence/_archive/` (used only as source material).

**Next step:** Phase 1 — F&B Decision Ledger planning (design note + reviewed schema/spec; still docs-only). Implementation (Phase 2, write-only ledger) does not begin until the Phase 1 spec is approved.

---

## Phase 1 — Completion Note (2026-06-18)

**Phase 1 (F&B Decision Ledger planning) is complete. Docs-only.** Deliverable: [FNB_DECISION_LEDGER_IMPLEMENTATION_SPEC.md](../architecture/FNB_DECISION_LEDGER_IMPLEMENTATION_SPEC.md) — full schema, controlled vocabularies, DI service API, future write/read points, POS-readiness, `node:sqlite` migration safety, test plan, file set, breakage review, acceptance criteria. Key decisions: DI-`db` pure service + shared `FB_DECISIONS_DDL` constant; code-level validation (no DB CHECK); TEXT `randomUUID` id; Phase 2 = table + service + tests only (no live write points). Recommendation: proceed to Phase 2.

---

## Phase 2 — Completion Note (2026-06-18)

**Phase 2 (F&B Decision Ledger — write-only-first foundation) is complete and green.** Infrastructure only; no live write points wired; no generation behavior changed.

Created:
- [src/services/venueBridge/decisionLedgerService.js](../../src/services/venueBridge/decisionLedgerService.js) — pure, DI-`db` service (DDL + constants + `createFbDecision`/`getFbDecisionById`/`listFbDecisionsForVenue`/`listFbDecisionsByType`/`markFbDecisionReviewed` + pure helpers). No AI, no DNA writes, no Event/Lab imports.
- [scripts/test-fb-decision-ledger.js](../../scripts/test-fb-decision-ledger.js) — in-memory `DatabaseSync(':memory:')` tests (**62 passed, 0 failed**).
- [docs/architecture/FNB_DECISION_LEDGER_FOUNDATION.md](../architecture/FNB_DECISION_LEDGER_FOUNDATION.md).

Modified (minimal): [server.js](../../server.js) — import `FB_DECISIONS_DDL` + `db.exec(FB_DECISIONS_DDL)` in the table-init block (idempotent; no handler/route/generation changes); [package.json](../../package.json) — added `test:fb-ledger`.

Verification: `test:fb-ledger` 62/62; `test:beverage` 106/106; `npm run build` PASS; `npm run hestia:check` Build PASSED (no FAIL rows). Static guards: CI/Omer + Cocktail Lab + Event Builder + prompts unchanged by Phase 2; `server.js` diff is import + table-init only; **no `createFbDecision` call in any live route**; no Venue DNA mutation path; venue-scoped throughout.

**Next step:** Phase 3 — wire the three non-blocking live write points (`/api/ci/generate`, `/api/ci/cocktails`, `/api/ci/rejections`) per the spec §8, each in a `try/catch` so a ledger failure never affects generation. Requires its own go-ahead.

---

## Phase 3 — Completion Note (2026-06-18)

**Phase 3 (live non-blocking ledger writes) is complete and green.** Plan: [FNB_DECISION_LEDGER_PHASE_3_WIRING_PLAN.md](../architecture/FNB_DECISION_LEDGER_PHASE_3_WIRING_PLAN.md). Foundation §10: [FNB_DECISION_LEDGER_FOUNDATION.md](../architecture/FNB_DECISION_LEDGER_FOUNDATION.md).

Wired (all venue-scoped via `req.venueId`, `requireAuth(...CI_ROLES)`):
- `POST /api/ci/generate` → `cocktail_menu_generated`
- `POST /api/ci/cocktails` → `cocktail_selected`
- `POST /api/ci/rejections` → `cocktail_rejected` (skipped for `just_experimenting`)

Design: a new pure wrapper `safeRecordFbDecision(db, venueId, input, onError)` (in [decisionLedgerService.js](../../src/services/venueBridge/decisionLedgerService.js)) that **never throws**; all three routes call only it, placed after existing success logic and before the unchanged response. Compact capture via `fbCompactValue`/`fbCompactBarDna`/`fbSummarizeCiResult` helpers in [server.js](../../server.js).

Modified: `server.js` (purely additive — 96 added lines, 0 removed: import + helpers + 3 ledger blocks; response shapes untouched); `decisionLedgerService.js` (added `safeRecordFbDecision`); `scripts/test-fb-decision-ledger.js` (now **80** assertions, incl. non-blocking wrapper + static route guards); docs.

Verification: `test:fb-ledger` 80/80; `test:beverage` 106/106; `npm run build` PASS; `npm run hestia:check` Build PASSED (no FAIL rows); `node --check server.js` OK. Static guards: Event Builder, Cocktail Lab, `cocktailService`, prompts untouched; **0 ledger coupling** in protected generation files; **no bare `createFbDecision` in routes**; response-shape lines unchanged; `just_experimenting` writes no row; no Venue DNA mutation; no POS; no UI; no third engine.

**Next step:** Phase 4 — on-demand "why?" explanation service (read-only, role-gated), reading recorded basis from `fb_decisions`. Requires its own go-ahead.

---

## Phase 4 — Completion Note (2026-06-18)

**Phase 4 (read-only "why?" explanation) is complete and green.** Deterministic, no AI. Plan: [FNB_DECISION_LEDGER_PHASE_4_EXPLANATION_PLAN.md](../architecture/FNB_DECISION_LEDGER_PHASE_4_EXPLANATION_PLAN.md). Foundation §11: [FNB_DECISION_LEDGER_FOUNDATION.md](../architecture/FNB_DECISION_LEDGER_FOUNDATION.md).

Added (all `requireAuth(...CI_ROLES)`, venue-scoped, **read-only**):
- `GET /api/ci/decisions/:decisionId/explanation` — explains one decision; missing/cross-venue → 404.
- `GET /api/ci/decisions` — compact list (no large JSON snapshots; `has_explanation_basis`/`has_confidence` booleans).
- New pure service [decisionExplanationService.js](../../src/services/venueBridge/decisionExplanationService.js) (no db, no AI, no mutation, no Event/Lab imports).

Modified: `server.js` (additive: 2 read routes + imports of `getFbDecisionById`/`listFbDecisionsForVenue`/`buildFbDecisionExplanation`); `scripts/test-fb-decision-ledger.js` (now **113** assertions, incl. explanation builds for all 3 decision types, honest missing/low-confidence/empty handling, and static guards); docs.

Verification: `test:fb-ledger` 113/113; `test:beverage` 106/106; `npm run build` PASS; `npm run hestia:check` Build PASSED; `node --check server.js` OK. Static guards: explanation service has no db/AI/Event/Lab/DNA-write; decisions routes are read-only (0 writes); list omits large snapshots; existing CI route shapes unchanged; Cocktail Lab, Event Builder, `cocktailService`, prompts, UI untouched; cross-venue id → 404.

**Next step:** Phase 5 — decimal taste convergence into the venue-aware CI/Omer path (flag-gated), per the master plan §14. Requires its own go-ahead.

---

## Phase 5 — Completion Note (2026-06-18)

**Phase 5 (decimal taste convergence into CI/Omer) is complete and green.** Flag-gated, context-only — no decimal output requested. Plan: [FNB_DECIMAL_TASTE_CONVERGENCE_PHASE_5_PLAN.md](../architecture/FNB_DECIMAL_TASTE_CONVERGENCE_PHASE_5_PLAN.md). Foundation §12: [FNB_DECISION_LEDGER_FOUNDATION.md](../architecture/FNB_DECISION_LEDGER_FOUNDATION.md).

What changed:
- [beverageContextService.js](../../src/services/venueBridge/beverageContextService.js) — added slim `formatTasteTargetPromptBlock(range, opts)` (≤~600 chars; decimal range + optional direction only; no venue-identity duplication, no tables) and `resolveCiTasteTarget({venueDNA, venueProfile})` (reuses the existing adapter; returns null when no range — never fabricates).
- [server.js](../../server.js) `POST /api/ci/generate` — flag-gated: when `ENABLE_VENUE_BEVERAGE_CONTEXT` is on and a real range resolves, append the slim block to `omer.text` before `buildGenerationPrompt` (**signature unchanged**); enrich the ledger write with `taste_profile_target` (only when resolved), `taste_target_dimensions` in `explanation_basis`, and honest `missing_fields`. **No decimal output requested; result parsing + response shape unchanged.**
- Tests: `test:beverage` extended to **120** (slim formatter + resolver); `test:fb-ledger` extended to **128** (server wiring guards: flag-off identity, `buildGenerationPrompt` unchanged, no `taste_profile_result`, ledger round-trip).

Verification: `test:beverage` 120/120; `test:fb-ledger` 128/128; `npm run build` PASS; `npm run hestia:check` Build PASSED; `node --check server.js` OK. Guards: **flag-off → byte-identical** (`venueContextText = omer.text || ''`, append inside the flag guard); integer flavor model, Cocktail Lab, Event Builder, prompt files, UI, POS untouched; no Venue DNA mutation; no third engine.

**Next step:** Phase 6 — F&B → Venue Intelligence feedback **candidates** (provenance-gated, human-reviewed, never auto-confirmed), per master plan §14. Requires its own go-ahead.

---

## Phase 6A — Completion Note (2026-06-18)

**Phase 6A (isolated Venue Intelligence candidate foundation) is complete and green.** Candidate-only; **no live writes**; **never touches Venue DNA**. Plan: [FNB_TO_VENUE_INTELLIGENCE_FEEDBACK_PHASE_6_PLAN.md](../architecture/FNB_TO_VENUE_INTELLIGENCE_FEEDBACK_PHASE_6_PLAN.md). Foundation: [FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md](../architecture/FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md).

Created:
- Isolated table `venue_intelligence_candidates` (idempotent boot init via the service DDL in [server.js](../../server.js) — table init only, **no route writes**).
- Pure service [fnbVenueFeedbackService.js](../../src/services/venueBridge/fnbVenueFeedbackService.js): `deriveFnbVenueCandidatesFromDecision`, `scoreFnbCandidateEvidence`, `normalizeFnbCandidate`, `createVenueIntelligenceCandidate`, `getVenueIntelligenceCandidateById`, `listVenueIntelligenceCandidatesForVenue` (+ DDL/constants). No AI, no DNA mutation, no Event/Lab imports, **no promotion-to-DNA**.
- Tests [scripts/test-fnb-venue-feedback.js](../../scripts/test-fnb-venue-feedback.js) — **60** assertions; added `test:fnb-feedback` script.

Conservative derivation: generation ⇒ no candidate (circular); selection ⇒ no candidate (too weak in 6A); rejection ⇒ candidate **only** for explicit mapped reasons (`taste_direction_signal` / `operational_constraint_signal`), confidence **never high**; guest/pricing/identity types never derived.

Verification: `test:fnb-feedback` 60/60; `test:fb-ledger` 128/128; `test:beverage` 120/120; `npm run build` PASS; `npm run hestia:check` Build PASSED; `node --check server.js` OK. Guards: service makes no `mergeVenueDna()` call and no `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment` writes (only `venue_intelligence_candidates`); **0** `createVenueIntelligenceCandidate(` calls in server (no live writes); cross-venue isolation + dedup proven; Cocktail Lab, Event Builder, prompts, UI, POS untouched.

**Next step:** Phase 6B — wire **non-blocking** candidate derivation+write after the `cocktail_rejected` ledger write (deduped, venue-scoped), still candidate-only with no Venue DNA mutation and no approval/promotion. Requires its own go-ahead.

---

## Phase 6B — Completion Note (2026-06-18)

**Phase 6B (live non-blocking candidate writes, rejection route only) is complete and green.** Flag-gated, candidate-only, no Venue DNA mutation. Foundation §8: [FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md](../architecture/FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md).

What changed:
- [featureFlags.js](../../src/config/featureFlags.js) — added `ENABLE_FNB_VENUE_FEEDBACK_CANDIDATES` flag (default off) + `isFnbVenueFeedbackCandidatesEnabled()`.
- [fnbVenueFeedbackService.js](../../src/services/venueBridge/fnbVenueFeedbackService.js) — added non-throwing `safeRecordVenueIntelligenceCandidates(db, venueId, decision, onError)` (derive + create-each, deduped; returns `{ok, created, skipped, candidateIds}`).
- [server.js](../../server.js) `POST /api/ci/rejections` — captures the ledger result and, **only** when `isFnbVenueFeedbackCandidatesEnabled() && ledger.ok && ledger.decisionId`, calls the safe wrapper with the rejection decision (`source_decision_id = ledger.decisionId`). After the `just_experimenting` early-return and the rejection save; response unchanged.
- Tests: `test:fnb-feedback` → **82** (wrapper non-blocking/dedup/no-write cases + static route guards).

Verification: `test:fnb-feedback` 82/82; `test:fb-ledger` 128/128; `test:beverage` 120/120; `npm run build` PASS; `npm run hestia:check` Build PASSED; `node --check server.js` OK. Guards: exactly **one** candidate-write site (in rejections), flag-gated, requires a real ledger decision id; **no** writes in `/api/ci/generate` or `/api/ci/cocktails`; `just_experimenting` precedes the write; rejection response shape unchanged; no `mergeVenueDna`/`venue_intelligence`/`venue_briefs`/`venue_dna_enrichment` writes; Cocktail Lab, Event Builder, prompts, UI, POS untouched; no third engine.

**Next step:** Phase 7 — human review/approval surface for candidates (owner/admin gated) and the candidate→Venue DNA promotion path (routed through `mergeVenueDna` discipline). High-sensitivity; requires its own go-ahead and guardrail review.

---

## Phase 7A — Completion Note (2026-06-18)

**Phase 7A (human review/approval — signal-only) is complete and green.** Candidates can be reviewed/approved/rejected as **signals only**; **no Venue DNA mutation, no promotion.** Plan: [VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md](../architecture/VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md). Foundation §10: [FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md](../architecture/FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md).

Added:
- 3 venue-scoped routes: `GET /api/venue-intelligence/candidates` + `/:id` (read = `CI_ROLES`), `PATCH /:id/review` (**owner/admin only**); cross-venue → 404, invalid status → 400.
- Service `markVenueIntelligenceCandidateReviewed(db, venueId, candidateId, reviewInput)` (pure, DI-`db`, updates only review fields) + `REVIEW_ACTION_STATUSES`; added `review_note` (DDL + idempotent `ALTER`) and the `reviewed` status.
- Tests: `test:fnb-feedback` → **107** (review updates/transitions/validation, cross-venue null, content-untouched, no `promoted_to_dna`, owner/admin route gating, no-DNA-write/no-`mergeVenueDna`/no-promotion static guards).

Verification: `test:fnb-feedback` 107/107; `test:fb-ledger` 128/128; `test:beverage` 120/120; `npm run build` PASS; `npm run hestia:check` Build PASSED; `node --check server.js` OK. Guards: review touches **only** `venue_intelligence_candidates`; **no `mergeVenueDna`**, no `venue_dna_json`/`venue_intelligence`/`venue_briefs`/`venue_dna_enrichment` writes; `accepted` = signal only (candidate `status` unchanged); Cocktail Lab, Event Builder, prompts, UI, POS untouched; no third engine.

**Next step (deferred, high-sensitivity):** Phase 7B — candidate→Venue DNA **promotion**, owner-gated, routed through `mergeVenueDna` discipline, with a defined candidate_type→DNA mapping, evidence thresholds, confidence cap, full audit, and reversibility (per Phase 7 plan §8). Requires its own go-ahead and a dedicated guardrail review.

## Phase 8F — Completion Note (2026-06-19)

**Phase 8F (F&B Menu Intelligence Snapshot — read-only portfolio view) is complete and green.** HESTIA can now reason about a venue's current cocktail menu as a **portfolio** (spirit/category coverage, classics-vs-signatures, low/zero-proof, taste/operational/pricing presence, evidence-based risks, and what a human should review next), honestly reporting missing data. Foundation: [FNB_MENU_INTELLIGENCE_SNAPSHOT_FOUNDATION.md](../architecture/FNB_MENU_INTELLIGENCE_SNAPSHOT_FOUNDATION.md).

Added:
- Service `src/services/venueBridge/menuIntelligenceService.js` — pure, DI-`db`, read-only. Venue-scoped via menu membership (`cocktails.menu_id → cocktail_menus.venue_id`; cocktails carry no `venue_id`). Reads only `cocktail_menus` + `cocktails`; writes nothing.
- Route `GET /api/ci/menu-intelligence` (`requireAuth(...CI_ROLES)`, venue-scoped via `req.venueId`, read-only). **No feature flag** — mirrors the always-on read-only `/api/ci/decisions` convention.
- Tests: `test:menu-intelligence` → **69** (empty-state safety, venue scoping + cross-venue isolation, inactive-item exclusion, deterministic spirit coverage, missing taste/operational/pricing reported not fabricated, no POS/guest/inventory inference, evidence-based risks, no-writes, and static no-AI/no-`mergeVenueDna`/no-DNA-write guards on service + route).

Verification: `test:menu-intelligence` 69/69; `test:fnb-feedback` 107/107; `test:fb-ledger` 128/128; `test:beverage` 120/120; `npm run build` PASS; `npm run hestia:check` Build PASSED; `node --check` OK on service, test, and `server.js`. Guards: snapshot performs **no** `INSERT`/`UPDATE`/`DELETE`; **no `mergeVenueDna`**, no `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment`/`venue_intelligence_candidates` writes; no AI/network; no candidate→DNA path; Cocktail Lab, Event Builder, prompts, and the 25-field contract untouched; no third engine.
