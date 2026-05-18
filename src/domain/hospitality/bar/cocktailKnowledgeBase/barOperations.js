// Bar operations intelligence — condensed from HESTIA Cocktail Intelligence Master research.
// Runtime-inert: exported strings are injected into AI prompts only when relevant.

export const RECIPE_STANDARDIZATION = `Cocktail Bible doctrine — every recipe must contain:
1. Drink name and category
2. Full spec — every ingredient, exact measurement (ml), exact product (brand matters)
3. Method — shake/stir/build/blend with specific instructions
4. Glassware — type, size, whether chilled
5. Ice — type, amount (affects dilution and temperature)
6. Garnish — exactly what, how cut/prepared, how placed
7. Batch prep — syrups, infusions, or pre-made elements needed
8. Shelf life note — for any prep element
9. Allergen flags — eggs, nuts, dairy, gluten
10. Pour cost calculation — ingredient cost per serve + target price
11. Flavor description — for staff training and guest recommendation
12. Story/origin note — the emotional context behind the drink

Why this matters: staff turnover is the single greatest threat to cocktail program consistency.`

export const PREP_SHELF_LIFE = `Batch prep categories and shelf life:
House syrups (demerara, honey, ginger, herb infusions) — 2–4 weeks refrigerated
Citrus juice (fresh lime, lemon, grapefruit) — 24–48 hours maximum
Infused spirits (botanical gins, chili tequila, smoked mezcal) — 1–4 weeks
Clarified juices (pineapple, apple, cucumber) — 3–5 days
Pre-batched cocktails (Negroni, Old Fashioned, Jungle Bird) — 2–4 weeks
Garnish prep (dehydrated citrus, pickled onions, herbs) — varies; date-labelled

Golden rule: every batch element has a date label, batch number, yield note, and disposal date.`

export const WASTE_COST_CONTROL = `Three biggest hidden profit killers in cocktail programs:
1. OVERPOURING — even 0.25oz overpour per drink at 50 cocktails/night = over 12oz of lost spirit per shift. Flag this in cost reporting.
2. UNDATED PREP — fresh juice poured after 48 hours, syrups used past shelf life. Affects quality and waste simultaneously.
3. ORPHAN INGREDIENTS — items purchased for one cocktail that expire before it sells. Cross-utilization planning is the solution.`

export const TRAINING_STAGES = `Four stages of bar staff cocktail training:
Stage 1 — Knowledge (1–2 days): every recipe in the Cocktail Bible, every ingredient's flavor profile, the story behind each drink. Staff taste every cocktail they will serve.
Stage 2 — Technical (2–3 days): proper measurement technique, shaking/stirring/building/straining, glassware identification, ice management, garnish execution.
Stage 3 — Guest Interaction (1–2 days): three-question drink interview, how to describe flavors in accessible language, upselling technique, handling indecision.
Stage 4 — Consistency Check (ongoing): weekly blind-tasting audits, monthly recipe review, peer feedback system, new menu launch briefings.`

export const BATCHING_FOR_EVENTS = `Event service batching intelligence:
For event/wedding/high-volume service:
- Pre-batch all non-citrus and non-carbonated components
- Add fresh citrus and carbonation at service (never batch citrus juice more than 2 hours ahead for 100+ covers)
- Target build time under 30 seconds per drink; anything requiring more than 3 actions at the station is a service risk at scale
- Design garnish to be pre-portioned, not cut-to-order
- Ideal event cocktail structure: base spirit + modifier + house syrup (all pre-batched) + one fresh element + one carbonated element
- Label every batch container with: name, batch date, yield, disposal time, allergen flags`
