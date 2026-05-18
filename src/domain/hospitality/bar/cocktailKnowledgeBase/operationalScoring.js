// Operational Feasibility Scoring — condensed from HESTIA research.
// Runtime-inert: injected when feasibility, service speed, or high-volume scaling context is detected.
// Use as AI guidance for evaluating whether a drink belongs in a working program — not a UI feature.

export const OPERATIONAL_FEASIBILITY_SCORING = `Operational Feasibility Scoring (OFS) — how to evaluate whether a drink belongs in a working program:

OFS = weighted assessment across 12 operational dimensions.
Score each factor 1–10 (1 = severe operational penalty, 10 = no concern). Apply weight to derive contribution.
OFS = Σ(score × weight) across all dimensions.

DIMENSION              | WEIGHT | WHAT TO ASSESS
Prep complexity        | 15%    | Number of components, infusion or batch prep requirements, active steps
Service speed          | 15%    | Time from order to glass under rush conditions (target: <30 seconds)
Ingredient availability| 8%     | Can required ingredients be reliably sourced in this market and season?
Shelf life             | 10%    | Do perishable components (fresh citrus, infusions, syrups) turn over fast enough to avoid waste?
Staff skill level      | 10%    | Can every trained team member execute this consistently, not just the senior bartender?
Equipment required     | 7%     | Special tools (blender, espresso machine, smoke gun, centrifuge) create dependency risk
Batchability           | 10%    | Can 80%+ of the build be pre-batched without quality loss?
Waste risk             | 5%     | Does this drink generate off-cuts, unused portions, or hard-to-use remnants?
Consistency risk       | 6%     | How much does output quality vary between staff members, shifts, or service conditions?
Garnish complexity     | 4%     | Is garnish pre-preppable? Does it degrade quickly? Can it be portioned ahead of time?
Rush-hour suitability  | 6%     | Does this drink hold up when five orders arrive simultaneously?
Training difficulty    | 4%     | How long does a new team member take to reach consistent execution?

SCORING GUIDANCE:
OFS ≥ 80 → Deploy with confidence. Low operational risk at any service volume.
OFS 60–79 → Deploy with prep protocols. Pre-batch what can be batched. Limit to off-peak initially.
OFS 40–59 → High risk in volume service. Consider redesigning for speed or reserving for slow-service windows only.
OFS < 40 → Do not deploy in a working bar program without significant redesign. Suitable for tasting menus or very low-volume premium settings only.

COMMON OFS KILLERS (high-penalty scenarios):
- Fresh muddling at 60+ covers (Mojito: −20 points at volume; muddling becomes the bottleneck)
- Espresso machine dependency at wedding or banquet service (−15 points if machine is single-point failure)
- Single-use specialty garnish (edible flowers, branded ice cubes): waste risk penalty +3
- Clarification techniques in rush service: preparation adds 20–30 minutes — OFS must reflect this
- Any garnish that cannot be pre-portioned before service starts

QUICK OFS REFERENCE (approximate scores in a trained bar setting):
Spritz (Aperol): ~95 — build in glass, no tech, fully batchable aperitivo component
Negroni (pre-batched): ~90 — stir and strain only; excellent rush-hour resilience
Margarita: ~85 — fast shake, minimal components; batch base possible
Old Fashioned (pre-batched spirit): ~85
Moscow Mule: ~88 — build in glass, no heat, partial batch
Daiquiri: ~80 — fast shake; ensure fresh citrus supply
Cosmopolitan: ~82 — fast shake; fully batchable
Whiskey Sour: ~75 — egg white requires dry shake; allergen consideration
Manhattan (pre-batched): ~88
French 75 (batched base): ~78 — Champagne adds cost and care
Gimlet: ~82
Paloma: ~83
Boulevardier (pre-batched): ~88
Paper Plane: ~78 — four components; equal-parts discipline required
Penicillin: ~65 — Islay float and house syrup add complexity; ginger prep required
Espresso Martini: ~68 — espresso machine dependency; foam quality variable
Piña Colada: ~62 — blender required; high volume is a bottleneck
Bloody Mary: ~65 — high component count; garnish complexity; house mix batch helps
Mojito: ~55 — muddling bottleneck; mint freshness degrades under pressure; avoid at volume without adapted method`
