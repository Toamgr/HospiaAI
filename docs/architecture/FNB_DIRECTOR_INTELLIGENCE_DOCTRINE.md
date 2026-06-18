# F&B Director Intelligence Doctrine

> **Status: CANONICAL.** Read before ANY F&B / beverage / cocktail / menu intelligence work.
> Created: 2026-06-18 (Phase 0).
> Parents: [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), [Specialist Intelligence Pattern](./SPECIALIST_INTELLIGENCE_PATTERN.md), [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [Decision Ledger Doctrine](./DECISION_LEDGER_DOCTRINE.md).
> Companions: [Current-State Audit](../audits/BEVERAGE_INTELLIGENCE_CURRENT_STATE_AUDIT.md), [Foundation Layer](./BEVERAGE_INTELLIGENCE_FOUNDATION_LAYER.md), [North Star & F&B Recommendation](./HESTIA_AI_NORTH_STAR_AND_FNB_INTELLIGENCE_RECOMMENDATION.md), [HESTIA_COCKTAIL_LAB_COSTING_MODEL.md](./HESTIA_COCKTAIL_LAB_COSTING_MODEL.md).
> Source material (research only): "F&B contribution margin / OFS / costing honesty" — used as input, not authority.

---

## 1. What F&B Intelligence is

**F&B Intelligence is a professional Beverage/F&B Director brain, not a cocktail generator.** It generates full, **venue-specific** bar/restaurant cocktail menus and beverage decisions grounded in the venue's DNA, guests, price position, service style, staff capability, equipment reality, and operational constraints — and it **remembers why** each decision was made.

It is the **first specialist wedge**: the place where the full HESTIA loop (consume → decide → record → explain → feedback) is proven before scaling to other specialists.

## 2. Convergence — the central F&B rule

The codebase currently has multiple F&B paths. This doctrine fixes the target:

- **The CI/Omer venue-aware path is the canonical F&B Director.** (`/api/ci/generate` → `buildGenerationPrompt(... getOmerVenueContext)`, `buildDirectorSystemInstruction`, backed by Bar DNA `cocktail_intelligence_dna`, Taste DNA `cocktail_taste_dna`, sales `cocktail_sales`.) New F&B intelligence converges **here**.
- **Cocktail Lab becomes a studio over the same F&B brain** — not a separate intelligence silo. (`CocktailLabStudio` → `geminiCocktailAgent` keeps its editing UX, ml enforcement, and 25-field proposal contract, but reads the same venue-aware context.) Convergence is about **shared context + memory**, not a rewrite.
- **The Event Cocktail Menu Builder remains second priority and is NOT rewritten now.** (`eventCocktailMenuService`, `eventMenuDNA`.) Do not migrate it to Venue DNA in this program's early phases.
- **Do NOT build a third cocktail engine.** All generation continues through the existing server (CI/Omer) and client (Lab) prompt builders; we add shared context + decision memory, not a new generator.

## 3. Decimal taste intelligence belongs in the venue-aware path

The decimal taste foundation (`src/domain/hospitality/bar/`: `tasteProfileSchema`, `classicTasteCalibration`, `cocktailFamilyRatios`, `ingredientTasteImpact`, `microAdjustmentPrediction`, `venueTasteProfileMap`, and the adapter `beverageContextService`) was first wired, flag-gated, into the **isolated** Cocktail Lab. The target is to move/extend it into the **venue-aware F&B Director path**:

- a compact **target taste profile range** (0.0–5.0, one-decimal) flows from Venue DNA into the Omer brief / generation;
- a per-cocktail **decimal taste profile** is produced and stored on the Decision Ledger;
- the existing **integer flavor model is preserved in parallel** — not removed.

This is professional taste nuance (4.0 acidity ≠ 4.6 acidity), not poetic description, and not a replacement of existing models.

## 4. Output contract (what a venue-aware F&B decision should produce)

Full, service-ready output **when the data supports it**:

- full **ml recipes**, glassware, ice, method, garnish, service notes;
- **prep instructions**: syrups, infusions, cordials, batching, storage, shelf life, labeling, staff execution notes;
- **cost / contribution-margin / pour-cost context — only when verified or clearly labeled** (benchmark vs verified vs assumption; see the costing model doc);
- **operational feasibility** (OFS-style realism: prep complexity, service speed, staff skill, equipment);
- an **explanation basis** recorded for on-demand "why?".

Never fabricate costs, KPIs, economics, or sales. Costing honesty is mandatory: estimates are labeled as estimates.

## 5. Human tasting is light validation, not experimentation

HESTIA must arrive **already prepared** with professional knowledge and aim for strong first/second-pass quality. Human tasting is **approval, light correction, and confidence calibration** — not a burden of hundreds of experiments. Tasting feedback becomes evidence for memory, not a re-training treadmill.

## 6. Memory and feedback (F&B obeys the Specialist Pattern)

- Every F&B generation/approval/edit/rejection **records a Decision Ledger entry** (see [Decision Ledger Doctrine](./DECISION_LEDGER_DOCTRINE.md)).
- F&B emits **feedback candidates** to Venue/Taste DNA (taste direction, guest-risk tolerance, discovered constraints) — **candidates only**, never auto-confirmed.
- **Future POS/sales data validates** F&B decisions (did the menu fit? did DNA-fit drinks sell? did high-margin drinks underperform?). Validation **proposes** confidence changes; it never becomes truth automatically and never invents numbers.

## 7. "Why?" on demand, not by default

Owners do not get a technical taste explanation by default. But on request — "why this drink? why this taste profile? why this family? why this sweetness/acidity/body? why does this fit my venue?" — HESTIA answers from **Venue Memory, Venue DNA, beverage knowledge, recipe logic, operational constraints, and the recorded decision basis**, with confidence labels. Never from canned prompt text.

## 8. Prohibitions

- No third cocktail engine.
- No removal of the integer flavor model or the 25-field proposal contract.
- No Event Builder rewrite now.
- No fake costs/economics/KPIs/sales.
- No automatic Venue/Taste DNA confirmation.
- No kosher logic unless the venue/event/menu is explicitly marked kosher (conditional, default-off).
- No research corpus or full taste/ingredient tables pasted into prompts (compact context only).

---

*Canonical for F&B. If a proposal duplicates an engine, bypasses the ledger, fabricates economics, or auto-mutates DNA, it violates this doctrine.*
