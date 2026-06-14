# Claude Previous Audit / Starting Implementation Plan

This file contains a previous Claude Code audit and proposed implementation plan.

Use it as a starting point, not as an unquestionable final instruction.

Before implementing:
1. Re-read the current repository.
2. Re-read the research files.
3. Verify whether the file paths and assumptions are still correct.
4. Reuse the good parts of this plan.
5. Correct anything outdated, duplicated, or risky.
6. Do not create duplicate files.
7. Do not implement shallow modules just to match this plan.
# HESTIA Beverage Intelligence — Knowledge Base Implementation Plan

## Context

HESTIA already has a working, high-quality Cocktail Lab brain (`geminiCocktailAgent.js` + `geminiCocktailPrompts.js`). The BEVERAGE_DIRECTOR_SYSTEM_PROMPT is strong: it thinks in 9 layers, scores cocktails across 6 dimensions, challenges weak requests, and produces structured JSON. The existing `src/domain/hospitality/bar/` folder has 23 domain files covering menu engineering, costing, substitution, venue behavior, and 50 classic cocktails.

**The gap:** This domain knowledge is not connected to the AI. The AI brain has no access to the classic cocktail library, the venue behavior models, the flavor profiles, the menu engineering rules, or any structured professional research. The CocktailMenuBuilder.jsx (event menus) uses a completely different, much weaker prompt with no BEVERAGE_DIRECTOR intelligence at all.

**Goal:** Add a modular knowledge layer that the AI retrieves selectively — not a giant prompt blob — and upgrade CocktailMenuBuilder to use the same intelligence tier as the Cocktail Lab. Preserve all existing behavior.

---

## Audit Results

### 1. Cocktail Lab Brain

| File | Purpose |
|------|---------|
| `src/services/geminiCocktailAgent.js` (1,149 lines) | Main AI agent: `buildCocktailPrompt()`, `buildCompactRevisionPrompt()`, `buildDirectorConsultationPrompt()`, `generateGeminiCocktailProposal()` |
| `src/prompts/geminiCocktailPrompts.js` (167 lines) | `SYSTEM_PROMPT`, `BEVERAGE_DIRECTOR_SYSTEM_PROMPT`, `FEW_SHOT_EXAMPLES`, `BEVERAGE_DIRECTOR_FEW_SHOT_EXAMPLES`, `EXPECTED_FIELDS` (25 output keys) |
| `src/features/bar/CocktailLabStudio.jsx` | UI: triggers `requestCocktailProposal()` via `generate()` and `handleRegenerate()` |
| `src/hooks/useCocktailPipeline.js` | State: `approvedCocktails`, `cocktailDrafts`, pipeline management |
| `src/data/cocktailLab.js` | Form definitions + MIXOLOGY_INTELLIGENCE matrix |
| `src/services/cocktailService.js` (185 lines) | Entry point: `requestCocktailProposal()` with fallback |

**AI model:** Google Gemini via `/api/gemini` → `server.js::askGemini()` → `gemini-1.5-flash`

**Current prompt already includes:** manager prompt, form inputs (including `kosherRequirement`), menu engineering analysis, request critique, approved/draft cocktail lists, menu balance analysis, previous proposal (for revision), variation request, BEVERAGE_DIRECTOR_SYSTEM_PROMPT, few-shot examples, and a strict 25-field JSON schema.

### 2. Cocktail Menu Event

| File | Purpose |
|------|---------|
| `src/features/events/components/CocktailMenuBuilder.jsx` (786 lines) | Event cocktail menu UI + generation |

**Current event prompt (lines 461–498):** Basic generic prompt. Does NOT use BEVERAGE_DIRECTOR_SYSTEM_PROMPT. No batching logic, no service speed, no kosher-conditional, no costing intelligence, no operational scoring. Only captures: event name/type, guest count, cocktail count, flavors, restrictions (including 'Kosher' pill), vibe, notes.

### 3. Bottle Pricing (already fully built)

| File | Purpose |
|------|---------|
| `src/domain/hospitality/bar/cocktailPricingEngine.js` | `calculateCocktailPricing()` — full NIS costing |
| `src/domain/hospitality/bar/barCalculationUtils.js` | Pure calculation utilities |
| `src/domain/hospitality/bar/cocktailLabPricingAdapter.js` | `buildCostSheet()` — confidence levels + cost status |
| `src/domain/hospitality/bar/barProductSchema.js` | Product schema + `getPriceOutputCard()` |
| `src/domain/hospitality/bar/verifiedPriceIngestion.js` | Source-backed price validation |
| `src/domain/hospitality/bar/verifiedPriceStorage.js` | Price persistence |
| `src/features/bar/BottlePrices.jsx` | Bottle pricing UI (966 lines) |
| `src/services/api/verifiedPricesApi.js` | Backend API client |

**Critical rule from CLAUDE.md:** Do not add fake prices, invented costs, or placeholder costing defaults. Missing data returns `null`. Benchmark estimates for orientation only.

### 4. Existing Domain Knowledge (not wired to AI yet)

| File | Relevant Content |
|------|-----------------|
| `classicCocktailLibrary.js` | 50 classic cocktails: id, name, category, family, baseSpirit, story, ingredients, method, glassware, garnish, tags, notes |
| `barProductMenuEngineering.js` | Stars/Plowhorses/Puzzles/Dogs quadrant framework |
| `venueBarBehaviorModels.js` | Venue-specific behavior patterns |
| `barSubstitutionMatrix.js` | Ingredient substitution rules |
| `barOperationalRules.js` | Business/operational rules |
| `cocktailFlavorProfileUtils.js` | Taste profile logic |
| `cocktailAdjustmentUtils.js` | Recipe modification utilities |
| `barConfidenceLevels.js` | Data quality scoring |

---

## What Is Needed vs. What Exists

### Already exists — reference, do NOT recreate:
- Menu engineering quadrants → `barProductMenuEngineering.js`
- Ingredient substitution → `barSubstitutionMatrix.js`
- Venue behavior patterns → `venueBarBehaviorModels.js`
- Costing engine → `cocktailPricingEngine.js` + `barCalculationUtils.js`
- Classic cocktail data → `classicCocktailLibrary.js` (but lacks DNA analysis)
- Flavor profiles → `cocktailFlavorProfileUtils.js`

### Needs to be created (genuinely missing):
- Cocktail architecture templates (structural formulas per family)
- Extended Classic Cocktail DNA (commercial strength, riff logic, event fit, batchability)
- Full flavor taxonomy (pairing, seasonality, guest risk, operational burden)
- Trend database 2025–2026 (structured, with use/avoid conditions)
- Venue menu architecture (cocktails-per-type, ratio rules)
- Guest psychology + copywriting rules
- Zero-proof/low-ABV rules
- Staff training card rules
- Responsible service rules
- Event cocktail service rules (operational/batching/volume)
- Batching and prep rules
- Bottle pricing + costing rules (guidance for AI on how to use the existing engine)
- Kosher rules (conditional only)
- Desert/Middle Eastern flavor logic
- Menu balance rules
- World-class bar philosophy (AI context)
- **`knowledgeSelector.js`** — the retrieval layer

---

## Implementation Plan

### New Files to Create

**Location:** `src/domain/hospitality/bar/knowledge/`

All modules export structured JS objects/arrays + a `formatForPrompt()` function that returns a compact text block for AI injection.

| # | File | Key Content |
|---|------|-------------|
| 1 | `worldClassBarPhilosophy.js` | Philosophy principles, HESTIA manifesto, what makes a bar great |
| 2 | `cocktailArchitecture.js` | Base/modifier/acid/sweet/bitter/saline/aromatic/texture/dilution templates; 12 structural families (Sour, Collins, Old Fashioned, Martini, etc.) |
| 3 | `classicCocktailDNA.js` | Extended DNA for 30 key classics (not duplicating the library): commercial strength, why guests order it, menu role, overdone riffs, batchability, event fit, low-ABV adaptation, premiumization potential — imports IDs from `classicCocktailLibrary.js` |
| 4 | `flavorTaxonomy.js` | 20 flavor categories with: pairing logic, suitable spirits, seasonality, guest risk level, operational burden, bridge flavors, zero-proof use, weather/service context fit |
| 5 | `trendDatabase.js` | 23 named trends (2025–2026): definition, commercial significance, venue fit, guest segments, lifecycle, HESTIA recommendation logic, when to use/avoid |
| 6 | `menuEngineeringRules.js` | Extends `barProductMenuEngineering.js`: contribution margin logic, price anchoring, menu role taxonomy (10 roles), ingredient reuse rules, orphan ingredient detection guidance, menu size rules |
| 7 | `operationalScoringRules.js` | Scoring dimensions + weights: prep complexity, service speed, ingredient availability, shelf life, staff skill, batchability, waste risk, consistency, garnish complexity; weights by venue/service type |
| 8 | `venueMenuArchitecture.js` | 14 venue types: ideal cocktail count, signature:classic ratio, refreshing/spirit-forward/spritz/dessert/zero-proof targets, complexity, pricing logic, guest behavior, staff skill requirements |
| 9 | `guestPsychologyRules.js` | Decision psychology, ordering triggers, how to write approachable descriptions for adventurous drinks, zero-proof dignity rules, staff recommendation psychology |
| 10 | `cocktailCopywritingStyles.js` | 11 venue-tone copywriting styles with examples (casual, fine dining, hotel luxury, Mediterranean, desert luxury, event/wedding, nightlife, kosher — conditional, zero-proof premium, rooftop/beach, cocktail bar) |
| 11 | `zeroProofLowABVRules.js` | Zero-proof architecture (using tea, citrus, saline, herbs, carbonation, bitterness, spice, texture), premium presentation rules, when to include by menu type, pricing by craft not apology |
| 12 | `staffTrainingRules.js` | Training card structure: recommendation script, flavor explanation, who to recommend to, lighter/stronger alternatives, common prep mistakes, garnish standard, allergen/batch/speed notes |
| 13 | `responsibleServiceRules.js` | Redirect rules for "strongest/maximum alcohol" requests, intoxication awareness, low-ABV routing, pacing + food pairing suggestions, what NOT to do |
| 14 | `eventCocktailServiceRules.js` | Event-specific logic: batching priority, service style options (station/passed/punch), expected drinks per guest by event type, prep capacity rules, bottle quantity estimation logic, zero-proof parity, event timeline |
| 15 | `batchingAndPrepRules.js` | What batches well vs. not, shelf life by ingredient type, batch ratios, dilution management, flash batch vs. full batch, batch labeling, container sizing |
| 16 | `bottlePricingAndCostingRules.js` | AI guidance on using the existing engine: prefer cheapest suitable bottle logic, premium-vs-standard decision tree, costing confidence tiers, what to say when data is missing, NIS context |
| 17 | `kosherRules.js` | **Conditional only.** Spirit/liqueur certification considerations, wine-based products (vermouth/sherry/port/cognac) requiring attention, dairy/meat/parve, Passover flag, how to flag unknown certification vs. inventing it |
| 18 | `desertAndMiddleEasternFlavorLogic.js` | Desert flavor taxonomy: dates, black lime (loomi), za'atar, tamarind, pomegranate, arak, sumac, rose, cardamom, saffron, mastic; hot-climate drink logic, local identity, refreshing profiles |
| 19 | `ingredientSubstitutionRules.js` | Extends `barSubstitutionMatrix.js`: why to substitute (cost, availability, kosher, low-ABV), spirit-tier substitution table, modifier substitutions, zero-proof substitution paths |
| 20 | `menuBalanceRules.js` | Balance scoring dimensions: spirit diversity, style diversity, flavor diversity, guest type coverage, ABV range, price range, preparation method diversity, seasonal fit |
| 21 | `knowledgeSelector.js` | **The retrieval layer.** Exports `selectCocktailKnowledge({ venueType, eventType, kosherRequired, serviceStyle, requestType, flavorDirection, needsCosting, needsEventMenu })` → returns a compact formatted text string for prompt injection |

### Modified Existing Files (minimal, targeted)

#### File 1: `src/services/geminiCocktailAgent.js`

**Change:** Add knowledge context injection to `buildCocktailPrompt()`.

- Add new parameter `knowledgeContext = ''` to `buildCocktailPrompt()` signature
- Insert `${knowledgeContext ? `\nBeverage Intelligence Context:\n${knowledgeContext}\n` : ''}` just before `${BEVERAGE_DIRECTOR_SYSTEM_PROMPT}` in the prompt template (line ~755)
- In `generateGeminiCocktailProposal()` (lines 1116–1147), call `selectCocktailKnowledge()` using `form` data before calling `buildCocktailPrompt()`, pass as `knowledgeContext`
- Same pattern for `buildCompactRevisionPrompt()` (lines 877–927): inject relevant knowledge for revision context (costing, substitution, operational modules)
- **No changes to** BEVERAGE_DIRECTOR_SYSTEM_PROMPT, FEW_SHOT_EXAMPLES, JSON schema, scoring, or any existing prompt logic

**`selectCocktailKnowledge()` call in `generateGeminiCocktailProposal()`:**
```javascript
const knowledgeContext = selectCocktailKnowledge({
  venueType: form.serviceContext || null,
  kosherRequired: form.kosherRequirement === 'Kosher' || form.kosherRequirement === 'Required',
  requestType: variation ? 'revise' : 'generate',
  needsCosting: !!(form.targetCogs || form.targetPrice),
  flavorDirection: form.flavorProfile || null
})
```

#### File 2: `src/features/events/components/CocktailMenuBuilder.jsx`

**Change:** Replace the weak `handleGenerate()` prompt (lines 461–498) with an event-aware prompt that uses BEVERAGE_DIRECTOR intelligence.

- Import `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` from `geminiCocktailPrompts.js`
- Import `selectCocktailKnowledge` from the knowledge module
- Import `EVENT_OPERATIONAL_RULES` from `eventCocktailServiceRules.js`
- Before sending, call `selectCocktailKnowledge({ eventType, kosherRequired, needsEventMenu: true, serviceStyle, ... })`
- Replace the basic prompt string with a structured prompt that:
  - Uses `BEVERAGE_DIRECTOR_SYSTEM_PROMPT` as the AI identity
  - Injects relevant knowledge context
  - Passes all existing form inputs (count, flavors, restrictions, vibe, notes)
  - Activates kosher module only if `form.restrictions.includes('Kosher')`
  - Adds event operational context: guests, event type, batching priority, service speed
  - Keeps the same JSON response schema (preserves compatibility with `setMenu()`, `apiPost()`)
  - Adds new optional fields to the per-cocktail schema: `batch_notes`, `operational_difficulty`, `why_fits_event`
- **No changes to** menu save/approve/replace API calls, state management, or UI rendering

---

## Knowledge Module Format (all 20 modules use this pattern)

```javascript
// Example: flavorTaxonomy.js
export const FLAVOR_TAXONOMY = {
  citrus: {
    label: 'Citrus',
    ingredients: ['lemon', 'lime', 'grapefruit', 'yuzu', 'blood orange'],
    pairingLogic: 'bridges spirits across all families; universal acid backbone',
    suitableSpirits: ['gin', 'tequila', 'rum', 'vodka', 'whiskey'],
    seasonality: 'year-round, peak spring-summer',
    guestRisk: 'low',
    operationalBurden: 'medium (fresh juice prep)',
    goodUseCases: ['refreshing anchors', 'sours', 'highballs', 'events'],
    badUseCases: ['when 3+ citrus cocktails already exist on menu'],
    bridgeFlavors: ['herbs', 'tropical', 'floral'],
    zeroproofUse: 'excellent (cordial, oleo saccharum, juice)',
    hotWeather: 'excellent',
    dinnerFit: 'good'
  },
  // ...
}

export function formatForPrompt(categories = Object.keys(FLAVOR_TAXONOMY)) {
  return categories.map(k => {
    const f = FLAVOR_TAXONOMY[k]
    return `${f.label}: ${f.pairingLogic}. Risk: ${f.guestRisk}. Avoid if: ${f.badUseCases.join(', ')}.`
  }).join('\n')
}
```

---

## knowledgeSelector.js Logic

```javascript
// selectCocktailKnowledge({ venueType, eventType, kosherRequired, requestType,
//   flavorDirection, needsCosting, needsEventMenu, serviceStyle })
// → returns compact formatted string for prompt injection

export function selectCocktailKnowledge(context = {}) {
  const sections = []

  // Always include: bar philosophy (brief) + cocktail architecture
  sections.push(formatPhilosophy())
  sections.push(formatArchitecture(context.requestType))

  // Include flavor taxonomy relevant to the direction
  if (context.flavorDirection) {
    sections.push(formatRelevantFlavors(context.flavorDirection))
  }

  // Include event rules if event menu
  if (context.needsEventMenu || context.eventType) {
    sections.push(formatEventRules(context.eventType))
    sections.push(formatBatchingRules(context.serviceStyle))
  }

  // Include costing rules if costing is relevant
  if (context.needsCosting) {
    sections.push(formatCostingRules())
  }

  // Include venue architecture if venue type known
  if (context.venueType) {
    sections.push(formatVenueArchitecture(context.venueType))
  }

  // Include trend signals (brief, filtered)
  sections.push(formatRelevantTrends(context))

  // Include zero-proof rules for events and full menus
  if (context.needsEventMenu) {
    sections.push(formatZeroProofRules())
  }

  // KOSHER: only if explicitly required
  if (context.kosherRequired === true) {
    sections.push(formatKosherRules())
  }

  return sections.filter(Boolean).join('\n\n---\n\n')
}
```

---

## Cheapest Suitable Bottle Selection Logic

The `bottlePricingAndCostingRules.js` module encodes this as structured AI guidance:

```javascript
export const BOTTLE_SELECTION_LOGIC = {
  default: 'Select the lowest-cost verified or benchmark bottle that meets the cocktail quality tier.',
  tiers: {
    well:          { label: 'Well',           use: 'high-volume, batch, standard cocktails' },
    call:          { label: 'Call',           use: 'standard signature, casual dining, events' },
    premium:       { label: 'Premium',        use: 'cocktail bars, hotel bars, signature drinks' },
    super_premium: { label: 'Super Premium',  use: 'luxury positioning, brand-driven upsell only' },
    ultra_premium: { label: 'Ultra Premium',  use: 'tasting menu, bespoke luxury only' }
  },
  rule: 'Use the lowest tier that fits the cocktail positioning. Do not select premium bottles for standard serves.',
  override: 'Premium bottle allowed if brand strategy explicitly requires it — must explain margin impact.'
}
```

When the AI receives this rule, it applies tier matching rather than defaulting to any bottle.

---

## Kosher Activation Logic

The `kosherRules.js` module is only imported and formatted when `kosherRequired === true`. The selector's `formatKosherRules()` function returns:

```
KOSHER MODE ACTIVE — apply constraints:
- Spirits: require kosher-certified. Most vodka/gin/whiskey is inherently kosher; check liqueurs.
- Wine-based products (vermouth, sherry, port, wine, champagne, cognac/brandy): require kosher supervision — flag if unverified.
- Dairy/meat/parve: confirm menu policy before using cream, eggs, or butter-based ingredients.
- Passover mode: only if explicitly set (PASSOVER_REQUIRED flag).
- Do not invent certification status. If unknown, flag it: "Kosher status unverified — confirm with supplier."
```

When `kosherRequired !== true`: this block is never added. The AI never sees it, never mentions it, never filters for it.

---

## Event Prompt Upgrade — Output Contract

The upgraded `CocktailMenuBuilder` prompt will request these new optional per-cocktail fields (non-breaking additions to existing schema):

```json
{
  "batch_notes": "Can be pre-batched 6 hours ahead; stir in citrus on service",
  "operational_difficulty": "low",
  "why_fits_event": "Crowd-friendly tropical sour, fast build, consistent in volume"
}
```

These fields are added as optional — if the AI omits them, the UI handles gracefully. No change to existing `menu_name`, `cocktails[]` top-level shape or `number/name/tagline/ingredients/method/garnish/glassware/flavor_map/flavor_notes/allergen_notes/pour_cost_estimate/liquid_color_hex` fields.

---

## Files Changed Summary

### New files (22):
```
src/domain/hospitality/bar/knowledge/
  worldClassBarPhilosophy.js
  cocktailArchitecture.js
  classicCocktailDNA.js
  flavorTaxonomy.js
  trendDatabase.js
  menuEngineeringRules.js
  operationalScoringRules.js
  venueMenuArchitecture.js
  guestPsychologyRules.js
  cocktailCopywritingStyles.js
  zeroProofLowABVRules.js
  staffTrainingRules.js
  responsibleServiceRules.js
  eventCocktailServiceRules.js
  batchingAndPrepRules.js
  bottlePricingAndCostingRules.js
  kosherRules.js
  desertAndMiddleEasternFlavorLogic.js
  ingredientSubstitutionRules.js
  menuBalanceRules.js
  knowledgeSelector.js
  index.js
```

### Modified files (2):
```
src/services/geminiCocktailAgent.js     — inject knowledgeContext in buildCocktailPrompt()
src/features/events/CocktailMenuBuilder.jsx — upgrade event prompt with BEVERAGE_DIRECTOR + knowledge
```

### Untouched files:
```
src/prompts/geminiCocktailPrompts.js    — no changes
src/services/cocktailService.js         — no changes
src/hooks/useCocktailPipeline.js        — no changes
src/features/bar/CocktailLabStudio.jsx  — no changes
All domain/hospitality/bar/*.js         — no changes (referenced, not rewritten)
All other features, hooks, services     — no changes
```

---

## Verification Steps

1. **Build:** `npm run build` from `HOSPIA_LOCAL_APP/` must pass with no errors
2. **Cocktail Lab smoke test:** Open Cocktail Lab, generate a cocktail — existing prompt logic, scoring, and JSON output must be identical or improved
3. **Revision smoke test:** Request a revision on an existing proposal — `buildCompactRevisionPrompt` path must still work
4. **Event menu smoke test:** Open an event → CocktailMenuBuilder → generate a menu — must use the upgraded prompt, preserve saved JSON structure
5. **Kosher test:** Event with 'Kosher' restriction pill → kosher block appears in prompt. Event without 'Kosher' → kosher block absent from prompt
6. **Non-kosher test:** Normal cocktail generation with no kosher form input → no mention of kosher in AI output
7. **Knowledge selector unit check:** `selectCocktailKnowledge({ venueType: 'hotel_bar', kosherRequired: false })` returns a non-empty string. `selectCocktailKnowledge({ kosherRequired: true })` contains kosher block. `selectCocktailKnowledge({ kosherRequired: false })` does not contain kosher block.

---

## Architecture Compliance

Per CLAUDE.md:
- All new knowledge files live in `src/domain/hospitality/bar/knowledge/` — consistent with the existing domain layer
- No new state, no new hooks, no runtime-wired domain files unless explicitly called from services
- No fake prices, no invented bottle costs
- `knowledgeSelector.js` is a pure utility function — no side effects, no API calls
- `classicCocktailDNA.js` imports IDs from `classicCocktailLibrary.js` rather than duplicating data
- BEVERAGE_DIRECTOR_SYSTEM_PROMPT is imported from `geminiCocktailPrompts.js` — not duplicated