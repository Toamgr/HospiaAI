// Menu engineering intelligence — condensed from HESTIA Cocktail Intelligence Master research.
// Runtime-inert: exported strings are injected into AI prompts only when relevant.

export const BCG_MATRIX = `Menu engineering quadrants (BCG matrix for bars):
STARS — high sales + high margin → feature prominently, protect the spec, promote aggressively
PLOWHORSES — high sales + low margin → reduce cost without killing quality, or raise price with added value
PUZZLES — low sales + high margin → improve discoverability: rename, reposition, train staff to recommend
DOGS — low sales + low margin → remove unless it serves a strategic purpose (brand identity, no-ABV anchor, food pairing)

Menu positioning rule: Stars and high-margin items → top-right position, top of category. Dogs → quietly removed or placed at the bottom. New launches → flanked by familiar options.`

export const PRICING_FORMULAS = `Bar financial framework:
Pour Cost % = (Ingredient cost per drink) ÷ (Selling price) × 100
Target pour cost: 18–24% (best bars aim ~20%; 80% gross profit margin on drinks)
Note: a cocktail at 25% pour cost with ₪12 selling price contributes ₪9. A beer at 20% pour cost with ₪6 price contributes ₪4.80. Higher pour cost cocktails often generate more cash margin.

Pricing formula: Selling price = Cost of ingredients ÷ Target pour cost (as decimal)
Example: ₪3 ingredient cost ÷ 0.20 = ₪15 selling price at 20% pour cost

Smart pricing considers: perceived value (unique ingredients/presentation/complexity), competitive pricing, venue positioning, psychological anchoring (most expensive item sets the frame)`

export const MENU_SIZE = `Optimal menu architecture:
- 10–16 cocktails, organized into 3–5 clear categories: Signature (house identity), Classics (trust builders), Light & Refreshing, Spirit-Forward, No/Low ABV
- Guests spend average 109 seconds deciding — every word must earn its place
- Too many options = decision paralysis (paradox of choice)
- Guests spend most time on top and bottom of each section`

export const INGREDIENT_EFFICIENCY = `Ingredient cross-utilization intelligence (critical for margin):
Every ingredient should appear in multiple recipes. Flag any orphan ingredient (used in only one drink — high waste risk).
Design menus so 8–10 core ingredients create 12–16 drinks.
Core ingredient spine example: gin, mezcal/tequila, whiskey, aperitivo (Aperol/Campari), elderflower liqueur, fresh citrus, house shrub, aromatic bitters, ginger beer, sparkling water.
Mise en place doctrine: every batch element (syrups, infusions, juices) needs a documented recipe, standard yield, shelf-life label, and reorder threshold.`

export const FULL_COGS_FORMULA = `Full drink costing chain — use this sequence, never skip steps:
1. Bottle cost per ml = Purchase price ÷ Bottle volume (ml)
   Example: ₪120 ÷ 700ml = ₪0.171/ml
2. Spirit cost per serve = Cost per ml × Volume used (ml)
   Example: ₪0.171 × 45ml = ₪7.70
3. Juice cost per ml = Price per liter ÷ 1000
   Example: fresh lime at ₪12/liter → ₪0.012/ml; 30ml pour = ₪0.36
4. Syrup cost per ml = Total batch ingredient cost ÷ Batch yield (ml)
   Example: ₪15 ingredients → 500ml yield = ₪0.030/ml
5. Base recipe cost = Sum of all ingredient costs per serve
6. Final COGS = Base recipe cost × (1 + waste factor)
   Waste factor benchmarks: spirits 5% (overpouring), fresh juice 10% (trim + spillage), syrups 8%
   Example: ₪9.50 base × 1.08 = ₪10.26 final COGS
7. Pour cost % = Final COGS ÷ Selling price × 100
8. Gross profit per serve = Selling price − Final COGS
9. Contribution margin = Gross profit per serve (the cash value — not the %)
   Why this matters: a ₪25 cocktail at 22% pour cost contributes ₪19.50 cash.
   A ₪15 beer at 18% pour cost contributes ₪12.30 cash.
   The cocktail wins in cash terms even at higher pour cost %. Always evaluate both metrics.`

export const INVENTORY_METRICS = `Inventory efficiency scoring:
Inventory Synergy Score = Reused ingredients count ÷ Total unique ingredients on the menu
Target: >0.70 (70%+ of ingredients appear in multiple drinks)
Below 0.50: high-waste, high-cost program. Every orphan ingredient is a scheduled write-off.
Use this score to justify removing Puzzle and Dog cocktails with non-shared ingredient dependencies.

Waste Efficiency Score = 10 − (perishability penalty + trim-loss penalty + single-use garnish penalty)
Perishability penalty: +3 for fresh-juice-heavy menus without sufficient daily turnover volume
Trim-loss penalty: +2 for garnish-heavy menus without mise en place pre-portioning discipline
Single-use garnish penalty: +1 per garnish that serves only one drink on the entire menu
Score < 6: menu redesign recommended to reduce waste exposure.`

export const MENU_ROLE_CLASSIFICATION = `Four strategic roles every cocktail menu must fill:
1. REFRESHMENT ANCHORS (entry-point volume drivers)
   High-volume, low-commitment, approachable. Margarita, Spritz, Mojito, Moscow Mule, Paloma.
   Must appear first or prominently. At least 30% of menu items should fill this role.
2. PRESTIGE ANCHORS (premium perception builders)
   Sophisticated, higher price point, sets the pricing frame for the whole menu.
   Negroni, Old Fashioned, Martini, Manhattan. Minimum 2 per menu; maximum 4 before intimidating.
3. INDULGENCE / PHOTO DRIVERS (experience and social reach cocktails)
   Visual impact, occasion-worthy, storytelling. Espresso Martini, Piña Colada, Cosmopolitan, French 75.
   1–3 per menu. Drive upsell and social sharing — these cocktails do marketing work.
4. BARTENDER TRUST ITEMS (staff recommendation and differentiators)
   Drinks where the bartender says "let me suggest something you'll love." Penicillin, Paper Plane, Boulevardier.
   2–3 per menu. Train guests to trust staff, enable premium recommendations, build loyalty.

Diagnosis: a menu of only Refreshment Anchors is a commodity program. A menu of only Prestige Anchors scares guests and kills volume. A balanced menu uses all four roles in proportion.`

export const VENUE_ARCHITECTURE_MATRIX = `Venue-type menu architecture targets:
SMALL RESTAURANT (30–60 covers):
8–10 cocktails, 2–3 categories. Service speed is critical. Focus: 5 Refreshment Anchors + 2 Prestige + 1 Seasonal + 2 NA minimum.

COCKTAIL BAR (50–120 covers):
12–16 cocktails, 4–5 categories. Full BCG coverage required. Bartender Trust section essential. 3–4 NA/low-ABV items. All four menu roles must be filled.

HOTEL BAR (wide guest demographic):
12–15 cocktails. High Classic density — guests expect recognized names. Must cover sweet, sour, spirit-forward, light-refreshing, and NA in roughly equal proportion. Add 2–3 signature twists on recognizable classics.

ROOFTOP / BEACH BAR:
8–12 cocktails. Emphasis on refreshing, spritz, and sour. Build time under 20 seconds per drink is critical. Frozen option is valued. 3 NA items minimum. Avoid complex garnish in outdoor conditions.

EVENT / WEDDING VENUE:
3–5 signature cocktails only. All must be pre-batchable. One fresh element added at service. Two NA/low-ABV items are mandatory. Mojito at high volume: high operational risk — avoid or adapt with pre-muddled method.

KOSHER RESTAURANT:
10–14 cocktails. No cream liqueurs. No unverified wine-based modifiers. Strong NA section (3–4 items). Separate Passover menu variant required for seasonal operation (grain spirits replaced, all wine certified).

LUXURY DESERT RESORT:
10–14 cocktails. High premiumization across the board. Hyper-local ingredient story mandatory — regional botanicals, local honey, seasonal produce. NA/low-ABV: 4–5 items (climate and wellness culture drive demand). Organize by occasion (sunset aperitivo, dinner pairing, fire-side sip) rather than spirit type.`
