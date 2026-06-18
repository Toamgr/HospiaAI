# HESTIA Beverage Intelligence Current-State Audit

> Audit date: 2026-06-17
> Scope: Cocktail Lab, Cocktail Bible, Event Cocktail Menu Builder, the bar knowledge base, costing, and all F&B/bar AI logic.
> Status: read-only audit. No code changed. No features rewritten.

---

## 1. Executive Summary

HESTIA already has a **substantial, working beverage intelligence layer** — meaningfully more than a "generic cocktail generator." Two independent AI generation engines exist:

1. **Cocktail Lab** (`src/services/geminiCocktailAgent.js`) — a single-cocktail "Beverage Director" engine with consultation mode, menu-engineering analysis, a hardened JSON contract, ingredient-level repair/fallback, deterministic micro-adjustment, recipe-derived flavor mapping, and source-honest costing.
2. **Event Cocktail Menu Builder** (`src/services/eventCocktailMenuService.js`) — a multi-cocktail event menu engine with enforced cocktail count, single-cocktail replacement, event-type "menu DNA," and separately-computed costing.

Both share one knowledge base (`src/domain/hospitality/bar/cocktailKnowledgeBase/`) of 11 condensed, world-class bar modules that are **conditionally** injected into prompts by keyword detection, plus a 50-cocktail read-only classic library and a 20-cocktail prose "classics database."

**How close is it to the target ("professional F&B Director brain driven by Venue Intelligence")?**

- **Recipe output quality:** ~70%. Full ml specs, method, glass, ice, garnish, prep notes, and service script are already enforced. Missing: structured sub-recipes (syrup/infusion/cordial/batch builds), shelf life, and storage as **first-class fields**.
- **Taste intelligence:** ~25%. A flavor profile exists but is a 9-dimension **integer 1–10** value *estimated from recipe text*, not the target **10-dimension decimal 0.0–5.0** vector, and there is no classic-cocktail taste calibration or target-profile prediction.
- **Venue awareness:** ~10%. Venue DNA exists as a subsystem (`venueDnaModel.js`) but is **not wired into cocktail generation at all**. The bar uses an unrelated, manually-entered "Bar DNA," and events use hard-coded per-type "menu DNA."
- **Explanation on demand:** ~40%. Rich strategic/why fields are generated *eagerly* every time; there is no separate "why this drink / why this taste profile" query that draws from Venue Memory.

The foundation is strong and should be **extended, not replaced.** The biggest gaps are (a) Venue DNA → target taste profile mapping, (b) the decimal taste system + classic calibration, and (c) structured prep/sub-recipe output.

---

## 2. Files and Modules Inspected

### Generation engines & prompts
- [src/services/geminiCocktailAgent.js](../../src/services/geminiCocktailAgent.js) — Cocktail Lab engine. Prompt builders (`buildCocktailPrompt`, `buildCompactRevisionPrompt`, `buildDirectorConsultationPrompt`), menu-engineering analysis (`analyzeMenuEngineering`), request critique (`critiqueManagerRequest`), ingredient normalization/repair (`normalizeIngredientObject`, `repairIncompleteIngredientPayload`), full-proposal fallback (`buildFallbackFullProposal`), schema validation, and the two exported entry points `consultGeminiCocktailDirection` and `generateGeminiCocktailProposal`.
- [src/prompts/geminiCocktailPrompts.js](../../src/prompts/geminiCocktailPrompts.js) — `SYSTEM_PROMPT`, `BEVERAGE_DIRECTOR_SYSTEM_PROMPT`, `FEW_SHOT_EXAMPLES`, `BEVERAGE_DIRECTOR_FEW_SHOT_EXAMPLES`, `EXPECTED_FIELDS`.
- [src/services/eventCocktailMenuService.js](../../src/services/eventCocktailMenuService.js) — Event menu engine: `generateEventMenu`, `replaceEventCocktail`, cost enrichment (`computeEventCocktailCost`, `enrichCocktailsWithCost`), event-DNA prompt block (`buildDNABlock`), replacement validation, fallbacks.
- [src/prompts/eventPrompts.js](../../src/prompts/eventPrompts.js) — event prompt helpers (broader event domain, not solely cocktails).
- [src/services/cocktailMenuDesignService.js](../../src/services/cocktailMenuDesignService.js) — calls `POST /api/ci/generate-menu-design`; returns a **visual design spec** (not a recipe). `preserveCocktails` always true.
- [src/services/prompts/hestiaCocktailMenuSkill.js](../../src/services/prompts/hestiaCocktailMenuSkill.js) — `HESTIA_COCKTAIL_MENU_SKILL` v5.2 art-director system prompt for menu *layout/design*. An identical copy is embedded in `server.js` (line ~67).

### Knowledge base (`src/domain/hospitality/bar/cocktailKnowledgeBase/`)
- [index.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/index.js) — `buildKnowledgeContext(prompt, form)`: keyword topic detection → conditional section injection.
- [flavorScience.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/flavorScience.js) — `COCKTAIL_ARCHITECTURE` (ratio templates), `TASTE_BALANCE`, `FLAVOR_PAIRING`, `ADVANCED_TECHNIQUES`.
- [menuEngineering.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/menuEngineering.js) — BCG matrix, pricing/COGS formulas, menu size, ingredient efficiency, venue architecture matrix.
- [menuPsychology.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/menuPsychology.js) — guest decision science, description language, psychological pricing, bartender-as-interface.
- [trendIntelligence.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/trendIntelligence.js) — dominant trends, classic revival cycle.
- [barOperations.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/barOperations.js) — recipe standardization, prep/shelf-life, waste/cost control, **batching for events**, training stages.
- [venuePhilosophy.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/venuePhilosophy.js) — Bar Leone model, two philosophies, ten laws.
- [kosherIntelligence.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/kosherIntelligence.js) — `KOSHER_COCKTAIL_RULES`, `PASSOVER_KOSHER_RULES` (conditional-only).
- [zeroProofIntelligence.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/zeroProofIntelligence.js) — design principles, toolkit, responsible service.
- [classicsDatabase.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/classicsDatabase.js) — 20 commercially-important classics as prose profiles + strength/difficulty scores.
- [operationalScoring.js](../../src/domain/hospitality/bar/cocktailKnowledgeBase/operationalScoring.js) — `OPERATIONAL_FEASIBILITY_SCORING` (12-dimension weighted OFS guidance).

### Domain data & utilities (`src/domain/hospitality/bar/`)
- [classicCocktailLibrary.js](../../src/domain/hospitality/bar/classicCocktailLibrary.js) — 50 read-only classics (ingredients in ml, method, glass, garnish, story, tags). **No taste vectors.**
- [cocktailFlavorProfileUtils.js](../../src/domain/hospitality/bar/cocktailFlavorProfileUtils.js) — `computeFlavorProfile()` → 9 integer dims (Sweet, Sour, Bitter, Salty, Savory, Spicy, Smoky, Dry, Creamy), text/ratio derived.
- [cocktailAdjustmentUtils.js](../../src/domain/hospitality/bar/cocktailAdjustmentUtils.js) — `applyMicroAdjustment()`: deterministic ml deltas for sweetness/sourness/ABV/carbonation sliders.
- [cocktailLabPricingAdapter.js](../../src/domain/hospitality/bar/cocktailLabPricingAdapter.js) — `buildCostSheet()`, `getPricingContextSummary()`, source-tier resolution (verified → benchmark → assumption), confidence/cost-status, labor + waste.
- [cocktailSchema.js](../../src/domain/hospitality/bar/cocktailSchema.js) — `createCocktailRecord`, `createCocktailIngredient` DB-shape templates.
- Supporting: `cocktailPricingEngine.js`, `cocktailPresentationUtils.js`, `barProductSeed.placeholders.js`, `barProductSchema.js`, `barProductCategories.js`, `barSubstitutionMatrix.js`, `verifiedPriceStorage.js`, `verifiedPriceIngestion.js`, `barConfidenceLevels.js`, `barMissingDataMap.js`, `barOperationalRules.js`, `venueBarBehaviorModels.js`.

### Frontend (display/UX)
- [src/features/bar/CocktailLabStudio.jsx](../../src/features/bar/CocktailLabStudio.jsx) — Cocktail Lab studio UI: recipe spec sheet, flavor radar, live-adjust sliders, cost panel, collapsible Build Guide.
- [src/features/bar/CocktailBuildExperience.jsx](../../src/features/bar/CocktailBuildExperience.jsx) — step-by-step build guide from existing recipe data.
- [src/features/bar/CocktailLibrary.jsx](../../src/features/bar/CocktailLibrary.jsx) — **"Cocktail Bible"** UI: venue cocktails + the 50 classics, recipes/methods/glassware/specs.
- [src/features/cocktail-intelligence/](../../src/features/cocktail-intelligence/) — `MenuGenerator.jsx`, `VisualMenuBuilder.jsx`, `MenuRenderer.jsx`, `CocktailIntelligenceDashboard.jsx`, `BeverageDirector.jsx`, `BarDNACard.jsx`, `MenuAudit.jsx`, `MenuMargin.jsx`, `SalesTracker.jsx`, `RejectionMemory.jsx`, `NarrativeIntelligence.jsx`, `CocktailExports.jsx`, `DailyClose.jsx`.
- [src/features/events/tabs/EventCocktailMenu.jsx](../../src/features/events/tabs/EventCocktailMenu.jsx), [src/features/events/components/CocktailMenuBuilder.jsx](../../src/features/events/components/CocktailMenuBuilder.jsx), [src/features/events/components/EventBriefMenuGenerator.jsx](../../src/features/events/components/EventBriefMenuGenerator.jsx), [src/features/events/utils/eventMenuDNA.js](../../src/features/events/utils/eventMenuDNA.js), `zoharDesignBriefEngine.js`, `zohar/components/ZoharCocktailBriefCard.jsx`.
- [src/features/employee/EmployeeCocktailMenu.jsx](../../src/features/employee/EmployeeCocktailMenu.jsx), [src/features/bar/ApprovedCocktailsTraining.jsx](../../src/features/bar/ApprovedCocktailsTraining.jsx), magazine views (`ClassicCocktailsMagazine.jsx`, `MagazineCocktailDetail.jsx`).

### State / persistence
- [src/hooks/useCocktailPipeline.js](../../src/hooks/useCocktailPipeline.js) — drafts/approved/archived/practice in **localStorage**; `approveCocktail` mirrors to `POST /api/cocktails`.
- [src/hooks/useCocktailIntelligenceState.js](../../src/hooks/useCocktailIntelligenceState.js), [src/services/api/cocktailIntelligenceApi.js](../../src/services/api/cocktailIntelligenceApi.js), [src/services/api/eventsApi.js](../../src/services/api/eventsApi.js).
- [server.js](../../server.js) — `POST /api/gemini` generic proxy (`askGemini`); `event_cocktail_menus`, `cocktail_menus`, `visual_menu_designs`, `cocktails`, `ingredients` tables; event cocktail-menu CRUD + approve routes (lines ~3655–3705).

### Venue context (currently disconnected from beverage)
- [src/features/venue-intelligence/venueDnaModel.js](../../src/features/venue-intelligence/venueDnaModel.js) — `emptyVenueDna()`, `SIGNAL_GROUPS` (includes `beverageSignals`, `foodSignals`), confidence dims. **Not imported by any cocktail module.**

---

## 3. Current Cocktail Intelligence Capabilities

**Cocktail Lab (single cocktail) — `generateGeminiCocktailProposal`:**
- Generates a complete cocktail from a free-text manager prompt + optional structured form.
- **Pre-generation consultation** (`consultGeminiCocktailDirection`) returns `build` vs `consult` with strategic options.
- **Menu engineering analysis** on the approved set: base-spirit/style/garnish counts, citrus-led count, high-complexity count, detected gaps and over-represented categories (`analyzeMenuEngineering`).
- **Request critique** flags vague/overused/conflicting briefs before building (`critiqueManagerRequest`).
- **Compact revision mode** for follow-up edits ("sexier", "cheaper but premium") that preserves the prior proposal.
- **Hardened output contract**: 25 expected fields including `ingredientsMl` (objects with `amountMl`/`ingredient`/`role`), `method`, `glassware`, `ice`, `garnish`, `prepNotes`, `bartenderScript`, `hardScores`, `strategicRead`, `riskNotes`, `substitutions`.
- **Self-repair**: incomplete ingredient payloads are repaired (`repairIncompleteIngredientPayload`) and a full deterministic fallback proposal is synthesized if the model returns junk (`buildFallbackFullProposal`).
- **Recipe-derived flavor radar** (`computeFlavorProfile`) and **deterministic live micro-adjustment** sliders (`applyMicroAdjustment`).
- **Source-honest costing** with confidence levels and warnings (`buildCostSheet`).
- **Approve → library**: persisted locally and mirrored to `POST /api/cocktails`.

**Event Cocktail Menu Builder — `generateEventMenu` / `replaceEventCocktail`:**
- Generates a full menu with **exactly the requested cocktail count** (validated, retried).
- Per-event-type **menu DNA** (naming style, voice, sections, welcome-drink priority).
- **Single-cocktail replacement** with instruction-obeying validation (e.g., forces a requested base spirit).
- High-volume batching guidance, conditional kosher + low-ABV/zero-proof rules.
- Costing computed **separately** from verified data (never trusts AI cost numbers); graceful fallback menu on failure.
- Persists to `event_cocktail_menus` with draft/approved status; `events_manager` can approve.

**Visual menu design — `generateFinalCocktailMenuDesign`:**
- Produces an award-grade menu **layout spec** (creative territory, palette, typography, flavor charts) from "Bar DNA"; never invents or alters cocktails.

---

## 4. Current Knowledge Sources

| Source | Type | Notes |
|---|---|---|
| `cocktailKnowledgeBase/*` (11 modules) | Condensed research prose, injected into prompts | Conditional via `buildKnowledgeContext` keyword detection — only relevant sections injected to control prompt size. |
| `flavorScience.js` | Ratio templates + taste-balance + pairing + technique | Contains **cocktail family ratios** (Sour 2:1:¾, Negroni 1:1:1, Collins, Highball, Old Fashioned) — but as *prose for the model*, not as structured data the code can reason over. |
| `classicsDatabase.js` | 20 classics, prose profile + strength/difficulty | Profiles are descriptive ("tart citrus, agave sweetness"), **not numeric taste vectors**. |
| `classicCocktailLibrary.js` | 50 classics, structured recipe data | ml ingredients, method, glass, garnish, story, tags. **No taste profile, no calibration vector.** |
| `operationalScoring.js` | OFS 12-dimension weighted model | Guidance string only; not computed in code. |
| `kosher` / `zeroProof` | Conditional rule blocks | Injected only when flagged. |
| Few-shot examples | In `geminiCocktailPrompts.js` | 13 behavioral examples (incl. umami/savory, low-ABV, event batching). |
| Bottle pricing | `barProductSeed.placeholders.js` + verified overrides | Benchmark estimates + venue-verified prices; never invented. |
| Hardcoded heuristics | `analyzeMenuEngineering`, `deriveFlavorCategories`, `critiqueManagerRequest` | Deterministic JS, used to enrich prompts and the UI. |

---

## 5. Current Data Models and Output Shapes

### Cocktail Lab proposal (after `mapGeminiResponseToProposal`)
```
{
  id, name, directorConversationReply, conceptStory, whyFitsMenu, strategicSuggestion,
  requestAssessment: { strength, critique, recommendedDirection },
  menuRole,
  strategicRead: { earnsMenuSpace, menuWeaknessSolved, guestOrderingPsychology,
                   profitPerception, operationalRiskScore, signaturePotentialScore },
  hardScores: { flavorOriginality, menuDifferentiation, operationalPracticality,
                premiumPerception, marginIntelligence, approvalReadiness },   // 0–10 ints
  ingredientObjects / ingredientsMl: [ { amountMl, ingredient, role } ],      // ml enforced
  ingredients: [ "45 ml — Aged rum — base spirit", ... ],                      // display strings
  method, glassware, ice, garnish, prepNotes, serviceNote, guestDescription,
  tasteBalanceExplanation, costMarginNote,
  practicalityScore, complexityScore, riskNotes[], substitutions[],
  reasoning: { menuGap, conflictDetected, flavorLogic, executionPracticality, guestPositioning },
  targetPrice, targetCogs, created_at
}
```

### Event cocktail (per item)
```
{
  number, section, name, tagline, base_spirit,
  ingredients: [ { name, amount_ml, unit } ],         // ml enforced (different key than Lab)
  method, garnish, glassware,
  flavor_map: { sweet, sour, bitter, salty, smoky, spicy, creamy, savory },  // 8 dims, small ints
  flavor_notes, allergen_notes, liquid_color_hex,
  batch_notes, service_speed, operational_difficulty, why_fits_event, zero_proof_alternative,
  _cost: { cost_status, confidence_level, suggested, luxury, total_cost_nis, missing_data_warnings }
}
```

### Recipe-derived flavor profile (`computeFlavorProfile`)
```
{ Sweet, Sour, Bitter, Salty, Savory, Spicy, Smoky, Dry, Creamy, _label }   // each 1–10 integer
```

### Cost sheet (`buildCostSheet`)
```
{ rows[{ ingredient, ml, cpm, total, match_type, product_id, product_name, confidence, data_status }],
  totalCost, suggested, luxury, pourCost, labor_cost_nis, total_production_cost_nis,
  confidence_level, cost_status, missing_data_warnings, verified_count, benchmark_count, assumption_count }
```

**Observations on shape consistency:**
- Ingredient shape differs between engines: Lab uses `{ amountMl, ingredient, role }`; events use `{ name, amount_ml, unit }`. `eventCocktailMenuService` has a `mapIngredientsToCostFormat` bridge to reconcile them for costing.
- **Two different taste/flavor representations** (9-dim 1–10 recipe-derived vs. 8-dim small-int AI-emitted `flavor_map`), plus a *third* dimension list inside the visual menu skill's flavor chart.
- **No `taste_profile`, no decimal 0.0–5.0 vector, no `target_taste_profile`, no structured sub-recipes, no `shelf_life`/`storage`/`batch_yield` fields** anywhere.
- Confidence/explanation fields exist for *strategy* (`requestAssessment`, `strategicRead`, `reasoning`) and *cost* (`confidence_level`), but **not for taste**.

---

## 6. Current AI Prompt Architecture

- **Transport:** all generation goes through a single generic proxy `POST /api/gemini` (`askGemini` in `server.js`). The server adds no cocktail logic except the embedded menu-design skill and JSON-mode toggle. **All cocktail intelligence is client-side prompt construction.**
- **Cocktail Lab prompts** (`buildCocktailPrompt`): manager prompt (declared source of truth) + structured form + computed menu-engineering analysis + request critique + approved/draft summaries + conditional knowledge context + conditional pricing context + previous-proposal summary + `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` + few-shots + a strict JSON schema literal.
- **Consultation prompt** (`buildDirectorConsultationPrompt`) and **compact revision prompt** (`buildCompactRevisionPrompt`) are separate, leaner builders.
- **Event prompts** (`buildEventMenuPrompt`, `buildReplacementPrompt`): system prompt + event facts + menu DNA block + knowledge/pricing context + count enforcement + per-cocktail JSON template.
- **Knowledge injection is conditional** (`buildKnowledgeContext` → `detectTopics`): keyword matching decides which modules load, keeping prompts focused. Kosher/Passover only inject when explicitly flagged.
- **Output discipline:** strict-JSON parsing with markdown-fence stripping; event service adds substring extraction + trailing-comma/unquoted-key repair.
- **Structured vs generic:** prompts are **highly structured and opinionated**, not generic. Heavy persona text and 13 few-shots create real prompt weight (a bloat risk — see §13).
- **Venue DNA in prompts:** **absent.** The only "DNA" referenced is the manually-entered Bar DNA (visual menu skill) and hard-coded event menu DNA. Venue Intelligence's `venueDNA` is never read by any prompt builder.
- **Encoding defect:** `geminiCocktailPrompts.js` contains mojibake (`managerג€™s`, `ג€™`) from a bad apostrophe import — cosmetic but it ships into the live system prompt.

---

## 7. Venue Context Integration

**Current state: effectively none for taste/recipe generation.**

- Venue Intelligence maintains a rich `venueDNA` (`venueDnaModel.js`) with `beverageSignals`, `foodSignals`, `ownerPriorities`, `emotionalDrivers`, confidence scores, etc. A `grep` for `venueDNA`/`venueDna` returns only the venue-intelligence subsystem and its services — **no cocktail module imports it.**
- **Cocktail Lab** has its own "Bar DNA" (`BarDNACard.jsx` + visual menu skill fields: name, concept, vibe_keywords, hero_spirits, city, materials) used **only for visual menu design**, not for recipe/taste generation.
- **Event menus** use `eventMenuDNA.js`, which is **hard-coded per event type** (wedding/corporate/private/bar_event/other) and only lightly adjusted (kosher reminder, welcome-drink threshold). It does **not** read venue identity, owner priorities, or beverage signals.
- The app is venue-scoped at the data layer (`X-HESTIA-Venue`, `req.venueId`), but that scoping does **not** flow venue *identity/DNA* into beverage prompts.

**Implication for the target:** the central requirement — "Venue Intelligence captures Venue DNA and passes it into F&B Intelligence, which maps it to a target taste profile and generates the menu" — is **not yet implemented**. This is the single largest gap.

---

## 8. Recipe Quality and Structure

| Element | Cocktail Lab | Event Menu | Notes |
|---|---|---|---|
| Full ml specs | ✅ enforced (`{amountMl, ingredient, role}`, ≥3 complete) | ✅ enforced (`{name, amount_ml, unit}`) | `hasCompleteIngredientSet` gate + repair in Lab. |
| Method | ✅ (technique keyword required) | ✅ | Lab requires shake/stir/build/blend/throw where applicable. |
| Glassware | ✅ | ✅ | |
| Ice | ✅ | ❌ (not a field) | Event items omit ice spec. |
| Garnish | ✅ | ✅ | |
| Prep elements (general) | ✅ `prepNotes` (free text) | ✅ `batch_notes` (free text) | Prose, not structured. |
| Syrup / infusion / cordial **sub-recipes** | ⚠️ only if model mentions them in prose | ⚠️ same | **No dedicated structured sub-recipe objects** (ingredients, yield, method per component). |
| Shelf life | ❌ no field | ❌ no field | Knowledge base discusses it; output doesn't capture it. |
| Storage | ❌ no field | ❌ no field | Same. |
| Staff notes / service script | ✅ `bartenderScript` / `serviceNote` | ⚠️ `why_fits_event` only | Lab is stronger here. |
| Build guide | ✅ `CocktailBuildExperience.jsx` (derives steps from recipe) | ❌ | Lab-only, non-blocking panel. |

**Bottom line:** drinks come out **close to service-ready for the main build**, but the **production/prep layer the target demands** (batching ratios, syrup/cordial/infusion sub-recipes with yields, shelf life, storage) is only ever incidental prose, never structured data. This is the second-largest output gap.

---

## 9. Costing and Operational Intelligence

**Costing (`cocktailLabPricingAdapter.js`) is mature and honest:**
- Resolution priority: explicit `product_id` (verified override → seed benchmark) → exact brand/name → category median → COST_DB fallback.
- Emits `confidence_level` (high/medium/low/unknown) and `cost_status` (all_verified/mixed/benchmark_estimate/cost_db_estimate/unavailable) plus human-readable `missing_data_warnings`.
- Includes labor (`LABOR_COST_NIS = 1.67`) and a 5% waste buffer; `suggested`/`luxury` prices derived from 22%/16% cost targets; `pourCost` retains the traditional ingredient-% meaning.
- **AI-emitted cost numbers are never trusted** — events explicitly tell the model not to return costs and compute them from verified data (`computeEventCocktailCost`).

**Operational intelligence:**
- `OPERATIONAL_FEASIBILITY_SCORING` is a strong 12-dimension model — but it is **prose guidance injected into prompts**, not a computed score on the output. The proposal carries `practicalityScore`/`complexityScore` and `operational_difficulty`, but these are **model-emitted**, not derived from the OFS model.
- `analyzeMenuEngineering` provides real deterministic operational/menu signals (over-representation, gaps, citrus saturation, garnish repetition) — a genuine strength.
- Batchability/service-speed are addressed in prompts and event flow, but again as guidance + model fields rather than deterministic computation.

**Verdict:** costing is the most "trustworthy" subsystem. Operational realism is *prompted* well but not *computed*, so it inherits model variance.

---

## 10. Kosher, Zero-Proof, and Responsible Constraints

- **Kosher:** correctly **conditional**. `isKosherActive(form)` gates `KOSHER_COCKTAIL_RULES`; Passover gated separately; events inject kosher rules only when `restrictions.includes('Kosher')`; event menu DNA appends a kosher naming reminder only when flagged. This matches the product rule "kosher only when marked." ✅
- **Zero-proof / low-ABV:** conditional. Knowledge modules inject on zero-proof keywords; events inject a low-ABV/zero-proof instruction only when `Low ABV`/`Alcohol-Free Option` is selected; the prompt explicitly forbids the word "mocktail." ✅
- **Responsible service:** `RESPONSIBLE_SERVICE` module exists and injects with zero-proof context.
- **Risk note:** kosher correctness depends on a free-text form value matching `isKosherActive`'s allow-list (`'kosher'`, `'required'`, `'yes'`, `'true'`). A different phrasing (e.g., "Glatt", "Mehadrin") would silently **not** trigger kosher rules. Worth hardening, but the default-off behavior is correct.

---

## 11. Gap Analysis Against Target Beverage Intelligence

| Target capability | Status | Evidence / gap |
|---|---|---|
| **Decimal taste profile (10 dims, 0.0–5.0)** | ❌ Missing | Current profile is 9 dims, integer 1–10, recipe-text-estimated (`cocktailFlavorProfileUtils.js`). No `acidity/sweetness/.../alcohol_heat` decimal vector. Event `flavor_map` is 8 small-int dims. |
| **Classic cocktail taste calibration** | ❌ Missing | `classicCocktailLibrary.js` (50) and `classicsDatabase.js` (20) have recipes and prose, but **no numeric taste vectors** to anchor/calibrate the model. |
| **Cocktail family ratio logic** | ⚠️ Partial (prose only) | Ratios live in `flavorScience.js` as prompt prose. No structured ratio model the code can apply or validate against. |
| **Ingredient taste impact cards** | ❌ Missing | No per-ingredient taste-contribution data. `deriveFlavorCategories` uses regex keyword presence, not magnitude per ingredient. |
| **Micro-adjustment prediction** | ⚠️ Partial (reactive, not predictive) | `applyMicroAdjustment` changes ml by fixed deltas and recomputes the profile *after* — it does not **predict** the taste delta or solve toward a target. |
| **Venue DNA → target taste profile mapping** | ❌ Missing | No link between `venueDNA` and any taste target; generation is prompt-driven from manager text only. |
| **First-pass recipe quality rules** | ⚠️ Partial | Strong completeness gates (`hasCompleteProposalShape`) and technique enforcement, but quality = "all fields present + plausible," not "validated against taste targets / ratio sanity." |
| **Full recipe + prep output contract** | ⚠️ Partial | Main build is complete; sub-recipes, yields, shelf life, storage are not structured fields (see §8). |
| **On-demand explanation logic** | ⚠️ Partial | Rich "why" fields are generated **eagerly every time** (bloat + can't trace to venue memory). No separate "why this drink / why this taste profile?" query drawing from Venue Memory/DNA. |
| **Menu taste balance** | ⚠️ Partial | `analyzeMenuEngineering` covers spirit/style/garnish/citrus balance well, but **not taste-vector balance** across a menu (no "menu is over-sour / lacks bitter-aromatic" via numeric profiles). |
| **One-tasting validation protocol** | ❌ Missing | No light human approval/correction loop tied to taste calibration. `RejectionMemory.jsx` captures rejections but not structured taste corrections. |

---

## 12. Recommended Next Steps (incremental, no rewrite)

Ordered for safety and compounding value. Each step is additive and preserves the working Cocktail Lab and Event Builder.

1. **Add a decimal taste-profile data model (additive field, no behavior change).**
   Introduce a canonical `taste_profile` (10 decimal dims 0.0–5.0) as a new optional field in the bar domain layer (e.g., a `tasteProfileSchema.js` next to `cocktailSchema.js`). Do not remove `computeFlavorProfile`; treat the new vector as a parallel, richer representation. Render it only where ready.

2. **Calibrate the classics.** Add a numeric `taste_profile` to the 50 entries in `classicCocktailLibrary.js` (and/or the 20 in `classicsDatabase.js`) as static, human-reviewed reference data. This is the anchor set for both prompting (few-shot calibration) and future validation — and it requires no AI.

3. **Structure cocktail family ratios.** Promote the prose ratios in `flavorScience.js` into a small structured `cocktailFamilyRatios.js` the code can reference for sanity checks and for building target recipes deterministically.

4. **Wire Venue DNA into F&B prompts (read-only first).** Add a single `buildVenueDnaContext(venueDNA)` helper that summarizes `beverageSignals`/`ownerPriorities`/`emotionalDrivers`/`hospitalityStyle` into a compact prompt block, and inject it in `buildCocktailPrompt` and `buildEventMenuPrompt` behind a flag. Start with influence-via-prompt before attempting deterministic target-profile mapping.

5. **Target taste profile mapping (phase 2).** Once 1–4 exist, derive a `target_taste_profile` from Venue DNA + request, pass it into the prompt, and (later) validate the generated recipe's computed profile against it with a tolerance band.

6. **Add structured prep/sub-recipe fields to the output contract.** Extend `EXPECTED_FIELDS` and `normalizeCocktailProposal` with optional `subRecipes[]` (name, ingredients[ml], method, yield, shelf_life, storage) and `batch` info. Keep them optional so existing flows don't break; surface in `CocktailBuildExperience.jsx`.

7. **On-demand explanation endpoint.** Split the eager "why" generation into a separate, cheaper "explain this drink / taste profile" call that can cite Venue Memory/DNA — reducing the main prompt's size (§13) and matching "owners don't need taste explanations by default."

8. **Menu-level taste balance.** Once cocktails carry numeric taste vectors, extend `analyzeMenuEngineering` to report taste-vector balance/gaps across the approved set and event menus.

9. **One-tasting validation loop.** Add a lightweight "approve / nudge" capture (reuse `RejectionMemory` infrastructure) that records small taste corrections per venue, feeding step 5's calibration rather than a 500-test learning burden.

10. **Unify the two engines gradually.** Extract shared JSON parsing/repair and a single ingredient shape into a common module so Lab and Event Builder stop drifting (see §13 duplication risk). Do this *after* the data model work so you unify on the new shape, not the old one.

---

## 13. Implementation Risk Notes

**Protected / do-not-break areas:**
- The Cocktail Lab output contract (`EXPECTED_FIELDS`, `normalizeCocktailProposal`, `hasCompleteProposalShape`, `validateResponseSchema`) — the UI (`CocktailLabStudio.jsx`), `computeFlavorProfile`, `applyMicroAdjustment`, and `buildCostSheet` all depend on the current field names. **Add fields; don't rename.**
- The two distinct ingredient shapes are load-bearing. Costing for events relies on `mapIngredientsToCostFormat`; the Lab UI relies on `{amountMl, ingredient, role}`. Changing either silently breaks costing or the spec sheet.
- `localStorage` keys (`hospia.*` via `STORAGE`) hold drafts/approved/archived cocktails. Per project rules, renaming without migration **clears user data**. Don't touch.
- Kosher conditionality (`isKosherActive`, event `restrictions.includes('Kosher')`) — any refactor must keep kosher **default-off**. This is a product-critical correctness rule.
- Costing must never accept AI-generated prices (the event flow explicitly strips them). Preserve this when unifying engines.

**Likely breaking points / regressions to watch:**
- Adding required fields to the JSON schema would make the model fail validation more often and trigger fallbacks. New fields must be **optional**.
- Prompt bloat is already real: `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` + `SYSTEM_PROMPT` + two few-shot blocks + menu analysis + knowledge context + schema literal is a large prompt. Injecting Venue DNA and target profiles **on top** risks token pressure, latency, and rate limits (the code already has rate-limit messaging). Offset by moving eager "why" text to an on-demand call (step 7).
- Duplicate logic between Lab and Event Builder (JSON parsing, fence stripping, error formatting, flavor representations) means a fix in one is easily missed in the other.
- The mojibake in `geminiCocktailPrompts.js` should be fixed carefully (it's inside a live system prompt) — verify the file's encoding before editing.
- Recipe-derived `computeFlavorProfile` is regex/keyword based; if it becomes the basis for validation it will mislabel novel ingredients. Prefer the calibrated/decimal model for any gating.

---

## 14. Verification Checklist

Run from the repo root (`HOSPIA_LOCAL_APP`).

**Static / search confirmations used in this audit (reproducible):**
```bash
# Confirm Venue DNA is NOT used by cocktail generation (should list only venue-intelligence files)
rg -l "venueDNA|venueDna|venue_dna" src

# Confirm the two ingredient shapes
rg -n "amountMl|amount_ml" src/services/geminiCocktailAgent.js src/services/eventCocktailMenuService.js

# Confirm taste profile is integer 1–10 (no decimal 0–5 vector)
rg -n "safe\(|FLAVOR_DIMS|FLAVOR_PROFILE_LABEL" src/domain/hospitality/bar/cocktailFlavorProfileUtils.js

# Confirm kosher is conditional
rg -n "isKosherActive|KOSHER_COCKTAIL_RULES|includes\('Kosher'\)" src

# Confirm classics have no taste vectors (expect tags/story, no numeric taste_profile)
rg -n "taste_profile|tasteProfile" src/domain/hospitality/bar/classicCocktailLibrary.js   # expect: no matches
```

**Build / runtime sanity (must pass before and after any change):**
```bash
npm install
npm run build          # vite production build — confirm no breakage in cocktail modules
npm run lint           # if configured
node scripts/hestia-check.js   # repo health check script present in scripts/
```

**Manual smoke tests (no automated cocktail tests exist today):**
1. Cocktail Lab: generate a cocktail from a vague prompt → confirm a complete proposal (ml ingredients, method, glass, ice, garnish, prep, scores) and that the flavor radar + cost panel render.
2. Cocktail Lab: use the Adjust sliders → confirm ml changes apply deterministically and the flavor map updates without a regeneration call.
3. Event Builder: generate a menu with N cocktails → confirm exactly N items and that `_cost` is computed (not AI-supplied).
4. Event Builder: replace one cocktail with "make it gin, more bitter" → confirm base spirit obeys and validation message path works.
5. Costing honesty: generate with an unmapped ingredient → confirm `cost_status`/`confidence_level` downgrade and a warning appears.
6. Kosher: generate **without** the kosher flag → confirm no kosher constraints leak into the recipe; then with the flag → confirm kosher rules apply.

**Regression guards to add (recommended, not yet present):**
- A unit test asserting `EXPECTED_FIELDS` ⊆ keys produced by `normalizeCocktailProposal`.
- A test asserting `buildCostSheet` never returns a positive cost with `confidence_level: 'unknown'` unless rows are empty.
- A test asserting `buildKnowledgeContext` returns `''` for a neutral prompt and injects kosher **only** when flagged.

---

---

## 15. Implementation Note — Foundation Layer (2026-06-17)

The first safe, additive foundation for Venue-aware Beverage Intelligence has been built on top of this audit. It does **not** rewrite Cocktail Lab or the Event Cocktail Menu Builder, does not change any output contract, does not remove the existing flavor models, and keeps kosher conditional/default-off.

Added:
- **Decimal taste profile system** (10 dims, 0.0–5.0 one-decimal) — `src/domain/hospitality/bar/tasteProfileSchema.js`
- **Classic taste calibration** (19 classics) — `classicTasteCalibration.js`
- **Cocktail family ratio logic** (10 families) — `cocktailFamilyRatios.js`
- **Ingredient taste impact cards** (26 ingredients) — `ingredientTasteImpact.js`
- **Micro-adjustment prediction** — `microAdjustmentPrediction.js`
- **Venue DNA → target taste range mapping** (10 archetypes) — `venueTasteProfileMap.js`
- **Venue Beverage Context Adapter** — `src/services/venueBridge/beverageContextService.js`
- **Tests** — `scripts/test-beverage-intelligence-foundation.js` (`npm run test:beverage`, 80 assertions, all passing)

None of it is wired into live generation yet. Full write-up, rationale, and the next safe integration step are in [docs/architecture/BEVERAGE_INTELLIGENCE_FOUNDATION_LAYER.md](../architecture/BEVERAGE_INTELLIGENCE_FOUNDATION_LAYER.md).

---

*End of audit. The only source file modified in producing the original report's recommendations was the mojibake fix in `geminiCocktailPrompts.js`; all other foundation work is in new, additive files.*
