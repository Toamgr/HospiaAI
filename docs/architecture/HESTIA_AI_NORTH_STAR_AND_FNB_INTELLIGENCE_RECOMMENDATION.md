# HESTIA AI North Star & F&B Intelligence Recommendation

> Date: 2026-06-18
> Type: vision-aligned architecture & strategy review (no product code changed)
> Grounded in: actual inspection of `server.js`, `src/services/venueBridge/*`, `src/features/venue-intelligence/*`, `src/features/cocktail-intelligence/*`, `src/features/bar/*`, `src/domain/hospitality/bar/*`, the foundation modules, and the research archive in `docs/research/researches for Venue Intelligence/`.
> Companion docs: [Current-State Audit](../audits/BEVERAGE_INTELLIGENCE_CURRENT_STATE_AUDIT.md), [Foundation Layer](./BEVERAGE_INTELLIGENCE_FOUNDATION_LAYER.md), [Regression Audit](../audits/BEVERAGE_CONTEXT_REGRESSION_AUDIT.md), [Intelligence Doctrine V1](./HESTIA_INTELLIGENCE_DOCTRINE_V1.md).

---

## 1. Executive Summary

**HESTIA is genuinely moving in the right direction — more than the earlier beverage-only audits implied.** The codebase already contains the spine of a Venue Operating Intelligence system, not just a cocktail tool:

- A **conversational Venue Learning Engine** that extracts a living **Venue DNA** from natural owner conversation, with confidence calibration, monotonic confidence, deterministic floors, and explicit no-fabrication guardrails (`server.js` `/api/venue-intelligence/message`, `mergeVenueDna`, persisted in the `venue_intelligence` table).
- A **deterministic distribution layer** (`venueBridgeService.buildVenueBriefs`) that turns Venue DNA into five specialist briefs (fb / training / service / event / owner), plus a **unified context layer** (`intelligenceContextService.assembleUnifiedContext`) so specialists share one understanding.
- A **venue-aware server-side F&B path** ("Omer") that already injects venue context into cocktail generation (`/api/ci/generate` → `buildGenerationPrompt(... omer.text)`), backed by a **Bar DNA** table (`cocktail_intelligence_dna`), a **Taste DNA** table (`cocktail_taste_dna`), a **sales** table (`cocktail_sales`), rejection memory, and narratives.

So the bones of Venue Intelligence → Specialist Intelligence already exist and are bidirectional-capable.

**The problem is fragmentation, not absence.** There are **two parallel cocktail systems** that do not share intelligence, the genuinely new **decimal taste capability** I added is wired into the *wrong* (non-venue-aware) one, the **F&B → Venue feedback loop is data-present but intelligence-absent** (sales and rejections are stored but never update Venue DNA or a decision record), and there is **no decision/explanation ledger** so "why this menu?" cannot be answered from recorded reasoning.

The best next version is **convergence + the closed loop**, not more generation features.

---

## 2. Product Vision Restatement (in my words)

HESTIA is a **Venue Operating Intelligence system**: a single, evolving understanding of one physical hospitality venue — its founder's beliefs, its DNA, its emotional register, its guests, its service philosophy, its price position, its operational and staffing reality — that every specialist intelligence (F&B, Service, Academy, Events, Owner, Operations, and later POS/Sales and Guest Experience) both **reads from and writes back to**.

The conversation is not UI; it is an **intelligence-gathering and intelligence-updating event**. Venue DNA is not a one-time onboarding form; it is a **living interpretation** that sharpens over time and carries provenance, confidence, and uncertainty.

F&B Intelligence is the first specialist to mature: a professional **Beverage/F&B Director brain** that generates full, venue-specific bar/restaurant cocktail menus (real ml recipes, prep, batching, costing, service notes) — and, crucially, **records why** each decision was made so it can explain itself on demand and be validated later by real sales. Taste is reasoned with professional, decimal precision (0.0–5.0), not poetic description. Humans approve and lightly correct; they do not run hundreds of experiments.

The product wins when a venue **feels understood** and every specialist decision makes HESTIA understand it a little better.

---

## 3. Current-State Alignment

| Vision pillar | Status in code | Evidence |
|---|---|---|
| Conversational venue understanding | **Strong / real** | `/api/venue-intelligence/message`, `useVenueIntelligenceState`, `VenueIntelligence.jsx` |
| Living Venue DNA with confidence/uncertainty | **Strong / real** | `venue_intelligence.venue_dna_json`, `mergeVenueDna` (monotonic + floors), `venueDnaModel.emptyVenueDna` |
| Shared intelligence → specialists | **Strong / real** | `buildVenueBriefs`, `assembleUnifiedContext`, `/api/venue-bridge/context` |
| F&B consumes venue context | **Partial / real but split** | `/api/ci/generate` injects `getOmerVenueContext`; Cocktail Lab does **not** |
| Professional decimal taste reasoning | **Foundation only, disconnected** | `tasteProfileSchema`, `classicTasteCalibration`, etc. — wired into Cocktail Lab path, not CI/Omer |
| F&B feeds back into Venue Intelligence | **Missing as intelligence** | sales/rejections stored (`cocktail_sales`, `cocktail_taste_dna`) but never update Venue DNA |
| Decision/explanation memory | **Missing** | `business_memory` is event-log grade only |
| POS/sales readiness | **Primitive exists, unused for intelligence** | `cocktail_sales` table + `/api/ci/sales` |
| Conversational routing to specialists | **Partial** | venue conversation extracts multi-dimension DNA; no live "route this utterance to F&B/Service" yet |

**Aligned and load-bearing:** Venue Learning Engine, Venue DNA, venueBridge, unified context, Omer injection, CI Bar/Taste DNA, sales table.
**Disconnected from the spine:** the standalone Cocktail Lab (`src/features/bar/CocktailLabStudio.jsx` → `geminiCocktailAgent.js` → `/api/gemini`) and my decimal taste foundation.

---

## 4. Venue Intelligence Findings

**What it contains (real, persisted):**
- `venue_intelligence` table: `messages_json`, `venue_dna_json`, `stage`, `objective` per venue.
- Venue DNA shape (`venueDnaModel.emptyVenueDna`): `hospitalityStyle, businessTypeSignals, guestExperienceSignals, beverageSignals, foodSignals, serviceSignals, trainingSignals, operationalPainPoints, ownerPriorities, emotionalDrivers, growthOpportunities, confidence{identity,operations,guest,training,commercial}, summary, openQuestions`.
- `venue_dna_enrichment` table + operational signals (`getOperationalIntelligence`, `deriveDnaEnrichment`, `applyConfidenceDeltas`).
- Conversation engine (`buildVenueLearningSystemInstruction` ~`server.js:5430+`) with strong doctrine: capture dropped commercial/guest/owner signals, **never invent numbers**, confidence anchors, monotonic confidence, deterministic floors that never fabricate.

**Who consumes it today:** `buildVenueBriefs` → briefs; `selectOmerContext` (F&B), `selectAcademyContext` (Academy), `selectOwnerIntelligence` (Owner); `/api/venue-bridge/*` endpoints; the CI generation path via `getOmerVenueContext`.

**Who *should* consume it but doesn't yet:** the standalone Cocktail Lab; the decimal taste foundation; the Event Cocktail Menu Builder (uses hard-coded per-type `eventMenuDNA`, not Venue DNA); any future Service/Operations live decisioning.

**Honest gaps:** Venue DNA is owner-only and conversation-only — there is **no write-back path** from specialist decisions or operational evidence into Venue DNA confidence. The conversation extracts DNA well but does not yet **route** a single utterance to multiple specialist memories in real time (it updates one shared DNA object).

---

## 5. F&B Intelligence Findings

There are **two F&B engines**:

**A) Cocktail Intelligence ("CI" / Omer) — the venue-aware one (server-side):**
- `cocktail_intelligence_dna` (Bar DNA): venue_type, atmosphere, cuisine_style, audience, staff_skill, equipment, glassware, is_kosher, flavor_identity, price_range, service_pressure, hero_ingredient.
- `cocktail_taste_dna`: rejection/approval **pattern** learning (`rejected_flavors/spirits/complexity`, `approved_flavors/spirits`, `pattern_notes`) — derived from rejection reasons (count ≥ 2 → pattern).
- `/api/ci/generate`: `buildGenerationPrompt(flow_type, params, dna, tasteDna, existingNames, omer.text)` — **already venue-aware**, kosher conditional via Bar DNA.
- `cocktail_sales` (units, price, cost, revenue, GP, GP%), `cocktail_narratives`, rejections, menus, published menus.
- UI: `src/features/cocktail-intelligence/*` (MenuGenerator, VisualMenuBuilder, MenuRenderer, SalesTracker, RejectionMemory, MenuMargin, NarrativeIntelligence, BarDNACard).

**B) Cocktail Lab — the isolated one (client-driven):**
- `CocktailLabStudio.jsx` → `cocktailService.requestCocktailProposal` → `geminiCocktailAgent.generateGeminiCocktailProposal` → `/api/gemini` proxy.
- Strong as a *studio*: 25-field proposal contract, ml enforcement, repair/fallback, live-adjust sliders, integer flavor radar, source-honest costing, build guide.
- **Not venue-aware** (until my flag-gated foundation, which is default-off and not wired to a caller).

**What already supports the North Star:** the CI/Omer path (venue-aware generation, Bar+Taste DNA, sales, rejection learning) is closest to the vision.
**What is still generic / isolated:** the Cocktail Lab path and the decimal taste foundation.
**What is genuinely new and missing from BOTH engines:** professional **decimal taste vectors** (0.0–5.0), classic taste **calibration**, **family ratio** logic, **ingredient impact** cards, **micro-adjustment prediction**, and **Venue-DNA→target-taste-range** mapping. The CI `cocktail_taste_dna` is rejection-pattern learning, not a decimal taste model.

---

## 6. Intelligence Flow Map

**Target flow:**
```
Owner/Venue Discovery (conversation)
   → Venue Memory (session + venue + founder)
   → Venue Intelligence (Venue DNA + confidence + uncertainty)
   → Specialist briefs (venueBridge)
   → F&B Director (Omer)  ── consumes DNA + Taste DNA + decimal taste target
   → Cocktail Menu (full ml recipes + prep + costing)
   → Decision + Explanation recorded (DECISION LEDGER)  ← MISSING
   → Human validation (approve / light correct)
   → Future POS/Sales signals validate the decision  ← STORED, NOT LOOPED
   → Venue DNA confidence + Taste DNA updated with provenance  ← MISSING (write-back)
```

**What exists today (✅) vs missing (❌):**
- ✅ Discovery → Venue Memory → Venue DNA → briefs → Omer F&B context → CI generation.
- ✅ Sales + rejection data captured (`cocktail_sales`, `cocktail_taste_dna`).
- ⚠️ Taste DNA learns from rejections only (pattern counts), one-directional, not decimal, not fed back to Venue DNA.
- ❌ Decision/explanation ledger (why this drink/menu, which DNA dimensions, taste target, assumptions, approval, POS-validation targets).
- ❌ Write-back: F&B decisions and sales evidence do **not** update Venue DNA confidence/Memory.
- ❌ Decimal taste target carried through Omer brief into generation.
- ❌ Cocktail Lab integrated into this flow at all.

---

## 7. The Core Gap

**The single most important architectural gap: there is no F&B Decision Memory and no write-back loop, and the F&B engines are fragmented — so HESTIA cannot yet (a) explain *why* a menu fits the venue from recorded reasoning, nor (b) become more intelligent when a decision meets reality.**

Concretely: Venue DNA flows *out* to F&B (one direction), F&B produces menus, and sales/rejections are stored — but nothing records the *reasoning* behind a menu, and nothing flows *back* to sharpen Venue DNA. The decimal taste capability that would make the reasoning professional lives in the isolated Cocktail Lab, not in the venue-aware CI/Omer path. **Until the loop is closed and the engines converge, HESTIA risks being a clever generator with a great memory of conversations but no memory of decisions or their outcomes.**

---

## 8. Recommended Next Version

**Next version: "F&B Director Intelligence v1 — Venue-Aware, Decimal-Calibrated, Self-Explaining, Loop-Ready."**

Not an MVP, not a generator. A serious version that makes the F&B specialist a true citizen of Venue Operating Intelligence. It has four pillars:

1. **Converge on one venue-aware F&B path.** Treat the CI/Omer server path as the canonical F&B Director. Fold the **decimal taste foundation** into it: extend the Omer brief and `cocktail_taste_dna` to carry a decimal **target taste profile range** (from `venueTasteProfileMap` via `beverageContextService`) and per-cocktail decimal **taste profiles** (from `tasteProfileSchema` + `classicTasteCalibration` + `cocktailFamilyRatios` + `ingredientTasteImpact`). The standalone Cocktail Lab stays as the human "studio" surface but reads the same shared context (no second brain).

2. **F&B Decision & Explanation Ledger.** Every generated menu/drink records: venue DNA dimensions that influenced it, the target taste profile used, the cocktail family chosen and avoided styles, operational constraints applied, ingredient choices/avoidances, assumptions, confidence, and the **explanation basis** (the seed already exists in `beverageContextService` output). This is what answers "why this drink?" from real understanding, not canned text.

3. **Close the write-back loop (provenance-gated).** When a human approves/rejects/edits, and later when sales arrive, update **Taste DNA** (decimal, not just rejection counts) and propose **Venue DNA confidence deltas** — but only as **candidates** requiring the existing confidence/provenance discipline; never auto-confirm Venue DNA from weak evidence.

4. **POS-readiness on the existing `cocktail_sales` table.** Add the fields/links needed so that when real POS data arrives it can validate decisions — without building POS integration now.

This version is bar/restaurant first; events remain second priority and are untouched.

---

## 9. Recommended Implementation Sequence

Each step is shippable, testable, flag-gated where it touches live generation, and additive.

1. **Decision Ledger data model (additive, no generation change).** New `fb_decisions` table + a pure `decisionLedgerService` (record/read). Write a record whenever a CI menu/drink is generated and when it is approved/rejected/edited. Ship behind no flag (write-only; nothing reads it into prompts yet). *Test: deterministic service tests; rows created on generate/approve.*

2. **Decimal taste into the venue-aware path (read-only, flag-gated).** Add a `target_taste_profile_range` to the Omer F&B brief / `getOmerVenueContext` by calling `beverageContextService` from Venue DNA, and a compact decimal block to `buildGenerationPrompt` — reusing `formatVenueBeveragePromptBlock`. Reuse the existing `ENABLE_VENUE_BEVERAGE_CONTEXT` flag. *Test: flag off → byte-identical; flag on → compact decimal block; no bloat.*

3. **Per-cocktail decimal taste profile as optional output + stored on the decision record.** Compute/accept a decimal `taste_profile` for each generated cocktail (foundation modules), store it in the ledger and (read-only) surface in the studio next to the existing integer radar. **Do not remove the integer model.** *Test: profiles validate 0.0–5.0; integer radar unaffected.*

4. **Unify Taste DNA to decimal (extend, don't replace).** Add decimal aggregates to `cocktail_taste_dna` (approved/rejected decimal centroids) alongside the existing rejection-pattern JSON. Feed it into generation. *Test: existing rejection learning still works; decimal aggregates accumulate.*

5. **Write-back as candidates (provenance-gated).** From approvals + decision outcomes, emit **candidate** Venue DNA confidence deltas and Taste DNA updates routed through the existing enrichment/confidence machinery; never auto-confirm. *Test: weak evidence does not raise confirmed Venue DNA; candidates are labeled.*

6. **POS-readiness fields (no integration).** Extend `cocktail_sales` + the decision record with the hook fields in §13 and a `validation_status` linking sales back to a decision. *Test: migrations apply; nulls safe; no behavior change.*

7. **On-demand "why?" explanation endpoint.** A read endpoint that answers "why this drink / taste profile / family / sweetness level / menu fit" from the **decision ledger + Venue DNA + explanation basis + confidence labels** — not from prompt text. Owner-facing, on demand only (no technical explanation by default). *Test: returns recorded basis; returns honest "not recorded / low confidence" when unknown.*

8. **Converge the studio.** Point Cocktail Lab at the shared venue-aware context (so the human studio and the CI Director share one brain), keeping the studio's editing UX. *Test: studio output uses venue context when flag on; unchanged when off.*

---

## 10. What Not To Build Yet

- **No POS integration** — only prepare fields/hooks (§13).
- **No Event/wedding F&B rework** — events are second priority; do not migrate `eventMenuDNA` or touch the Event Cocktail Menu Builder.
- **No second new cocktail engine** — converge, do not add a third path.
- **No auto-confirmation of Venue DNA** from sales or single approvals — candidates only.
- **No Venue Intelligence Graph / Digital Venue Twin / multi-venue group intelligence** build-out yet — these research tracks inform architecture, not this version.
- **No dumping research corpus into prompts** — convert research to structured modules + doctrine.
- **No mandatory technical taste UI for owners** — decimal profiles stay behind "why?" and the studio, never default owner reading.
- **No removal of the integer flavor model** or the 25-field proposal contract.
- **No live multi-agent orchestration framework** — the shared-context pattern (`assembleUnifiedContext`) is enough; don't over-abstract.

---

## 11. F&B → Venue Intelligence Feedback Loop

F&B decisions should write back as **evidence**, never as confirmed truth:

- **On generation:** record the decision (what + why + DNA dimensions used + taste target + assumptions + confidence) in the ledger. This alone makes F&B "explain from understanding."
- **On human action (approve/reject/edit):** update decimal Taste DNA centroids and emit **candidate** Venue DNA signals (e.g., approving repeated low-ABV bitter builds → candidate "guest tolerates bitter aperitivo," candidate confidence delta on `commercial`/`guest`). Routed through the existing enrichment + monotonic-confidence + floor machinery.
- **On sales evidence (future POS):** compare actual performance to the decision's expectation; promote/demote Taste DNA confidence; emit candidate Venue DNA deltas (e.g., "owner's premium vision matches actual high-margin uptake" or "DNA-fit cocktail underperformed → lower confidence in that guest assumption").
- **Guardrails (from doctrine + `mergeVenueDna`):** provenance label on every write, confidence never jumps from weak evidence, conflicting evidence stored as uncertainty, high-impact changes need human confirmation, no fabricated KPIs.

The loop's north star: **every F&B decision and its real outcome makes the venue's DNA sharper and better-evidenced.**

---

## 12. Decision Memory / Ledger Proposal

Add an append-only **F&B Decision Ledger** (new `fb_decisions` table; venue-scoped; pure `decisionLedgerService`). Proposed record shape:

```
fb_decision {
  id, venue_id, created_at, created_by, role,
  decision_type,            // 'menu_generated' | 'cocktail_generated' | 'cocktail_replaced' | 'approved' | 'rejected' | 'edited'
  subject_ref,              // menu_id / cocktail_id / draft id
  venue_dna_hash,           // hashVenueDna() at decision time — ties decision to the DNA version
  dna_dimensions_used,      // which Venue DNA signals/confidence drove it
  target_taste_profile,     // decimal 0.0–5.0 range used
  resulting_taste_profile,  // decimal 0.0–5.0 of the chosen drink (if applicable)
  cocktail_family,          // chosen family + avoided styles
  operational_constraints,  // constraints applied (staff skill, equipment, prep capacity)
  ingredients_chosen,       // and ingredients_avoided
  assumptions,              // explicit assumptions (honest)
  explanation_basis,        // from beverageContextService — the "why" seed
  confidence,               // decision confidence + per-source confidence
  evidence_sources,         // ['venue_dna','taste_dna','classic_calibration','omer_brief', ...]
  human_action,             // null | approved | rejected | edited (+ correction notes)
  pos_validation_status,    // 'pending' | 'validated' | 'contradicted' | 'n/a'  (future)
  pos_validation_ref        // link to sales evidence (future)
}
```

This is the single structure that powers: on-demand "why?", the write-back loop, confidence calibration, and future POS validation. It records **decisions and reasoning**, which `business_memory` (event-log grade) does not.

---

## 13. Future POS Intelligence Preparation

Do not integrate POS. Prepare so future signals are meaningful:

- **Extend `cocktail_sales`** (already has units, price, cost, revenue, GP, GP%) with: `daypart`, `day_of_week`, `season`, `comps_voids`, `returns_complaints` (nullable), `attach_food` (nullable), `staff_difficulty` (nullable), `speed_seconds` (nullable), `guest_segment` (nullable), `source` ('manual' | 'pos' | 'import'), and `decision_id` (FK → `fb_decisions`).
- **On the decision record:** `pos_validation_status` + `pos_validation_ref` (see §12) so a sale can confirm/contradict the decision that created the cocktail.
- **Keep everything nullable and `source`-labeled** so manual entry and future POS imports coexist without fake data.

Future questions this enables (without building POS now): did the menu fit the venue? which DNA-fit cocktails didn't sell? which high-margin drinks underperformed? did the owner's vision match guest behavior? should Venue DNA confidence change given sales? — all answerable by joining `fb_decisions` ↔ `cocktail_sales`.

---

## 14. Risks

- **Generic cocktail generator drift (HIGH):** the biggest risk. Mitigation: lead with Venue DNA + Decision Ledger + decimal taste in the *venue-aware* path; do not invest further in the isolated Lab generator.
- **Prompt bloat (MEDIUM):** two context systems (Omer brief + decimal block) could balloon prompts. Mitigation: one compact venue block, reuse `formatVenueBeveragePromptBlock`, measure size, keep flag-gated.
- **Disconnected specialist silos (MEDIUM):** new F&B writes-back could bypass the shared context. Mitigation: route all reads through `assembleUnifiedContext` and all writes through the enrichment/confidence machinery.
- **Fake intelligence / fake sales / fake KPIs (HIGH if mishandled):** Mitigation: provenance labels, nullable POS fields, `source` tags, candidate-only Venue DNA writes, no auto-confirm.
- **Overfitting to one venue type (MEDIUM):** first customer unknown. Mitigation: keep `venueTasteProfileMap` archetype-merge approach; never hardcode a single venue type; honor "unknown → venue-agnostic."
- **Breaking current Cocktail Lab (LOW):** convergence touches a working surface. Mitigation: flag-gated, additive, byte-identical when off (already proven pattern).
- **Mixing Event logic too early (LOW/controlled):** keep events untouched this version.
- **Owners forced to read technical explanations (MEDIUM):** Mitigation: decimal/why stays on-demand and in the studio; never default owner reading.
- **Two engines never converge (MEDIUM):** if convergence is deferred, the decimal foundation stays orphaned. Mitigation: sequence step 2 early.

---

## 15. Concrete Next Action

**Build Step 1: the F&B Decision Ledger (write-only, additive, no generation change).**

- Add `fb_decisions` table (migration in `server.js` with the §12 shape).
- Add a pure `src/services/venueBridge/decisionLedgerService.js` (record/read; deterministic; no AI) following the existing `*ContextService` conventions.
- Write a ledger row from the existing `/api/ci/generate` path and on CI approve/reject (no prompt change, no read-into-prompt yet).
- Add `scripts/test-fb-decision-ledger.js` (Node, exit 0/1, matching the existing test style).

This is the keystone: it unlocks "why?", the write-back loop, and POS validation, while changing **zero** generation behavior. It is the smallest step that is genuinely part of the full system rather than a demo.

---

## 16. Verification Plan

- **Automated:**
  - `npm run test:beverage` (must stay green — 106/106 today).
  - New `node scripts/test-fb-decision-ledger.js` (ledger writes/reads; no fabricated fields; venue-scoped; nullable POS fields safe).
  - `npm run build` (vite production build clean).
  - `npm run hestia:check` (build + audit checks; no new FAIL rows).
- **Static guards:** confirm no Event Cocktail Menu Builder files change; confirm the 25-field proposal contract and integer flavor model are untouched; confirm kosher stays conditional/default-off; confirm no research corpus pasted into prompts.
- **Manual (uncertain until run):** one end-to-end CI generation with a populated Venue DNA — confirm a decision row is written with real DNA dimensions and explanation basis (not fabricated), and that generation output is unchanged in this step.
- **Loop integrity (later steps):** verify Venue DNA confidence only moves via candidate deltas through `mergeVenueDna`/enrichment, never auto-confirmed from a single approval or thin sales signal.

---

### Appendix — Doctrine/Documentation gaps to close (so future agents build correctly)

1. **F&B Intelligence Doctrine** (sibling to `HESTIA_INTELLIGENCE_DOCTRINE_V1.md`): the canonical statement that the CI/Omer path is the F&B Director, that the Cocktail Lab is a studio surface over the same brain, and that decimal taste + decision ledger + write-back are mandatory.
2. **Two-cocktail-systems reconciliation note** in `HESTIA_MASTER_STATE.md`: explicitly document CI vs Cocktail Lab and the convergence plan, so no future agent rebuilds a third engine.
3. **Decision Memory doctrine:** the `fb_decisions` shape, provenance/confidence rules, and the candidate-only Venue DNA write-back rule.
4. **POS-readiness doctrine:** nullable + `source`-labeled fields, no fake KPIs, sales validate decisions (join `fb_decisions` ↔ `cocktail_sales`).

These convert the research archive (`docs/research/researches for Venue Intelligence/*`) into **structured doctrine**, not prompt fuel.

---

*End of recommendation. Findings are grounded in code inspection cited above; no product code was changed in producing this report.*
