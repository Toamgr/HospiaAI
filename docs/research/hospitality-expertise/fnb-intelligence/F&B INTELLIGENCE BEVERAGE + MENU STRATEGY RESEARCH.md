> Research archive note: This document is supporting research for HESTIA Venue Intelligence. It is not canonical product doctrine and should not be implemented directly without passing HESTIA's provenance, confidence, role-access, venue-boundary, and human-approval guardrails.
> Automation and AI-agent ideas in this document are research direction only. They are not current production behavior, require real evidence, and must not create fake operational truth or bypass human approval for high-impact decisions.

# HESTIA F&B Intelligence Framework — Research & Architecture Report

## TL;DR
- World-class F&B decisions are made at the intersection of nine forces — identity, guest demand, profitability, seasonality, staff ability, supplier reality, speed of service, consistency, and brand positioning — and the winning operators (Connaught Bar, Dante, Eleven Madison Park, USHG) treat the menu as a living strategic instrument, not a static list; HESTIA should model each force as a scored, versioned data object.
- AI should OWN deterministic math (costing, pour cost, margin, menu-engineering quadrants, variance, SKU overlap) and PROPOSE probabilistic inferences (why an item is failing, brand fit, trend relevance) clearly flagged as inference — but it must never make the final call on taste, recipe approval, brand soul, or item retirement; those pass through a human tasting/founder/chef/beverage-director gate.
- For the Israeli market specifically, HESTIA must encode structurally high beverage costs (alcohol excise ~107 NIS per liter of pure alcohol; food & beverage prices ~52% above the OECD average; 18% VAT), importer concentration, kashrut menu architecture (meat/dairy separation, no shellfish/pork, mevushal wine service), and a holiday/Shabbat seasonality engine that toggles demand weekly and around Pesach/Yom Kippur.

## Key Findings

**1. Success beyond taste is the management of contradiction.** Danny Meyer's "enlightened hospitality" (staff first, then guests, community, suppliers, investors) and Will Guidara's "unreasonable hospitality" both show that the product is necessary but not sufficient — the experience, consistency, and emotional read of the guest are what build loyalty. Meyer's own Union Square Cafe "never ranked higher than 15th in food, décor or service" in Zagat yet was consistently named a favorite. The lesson for HESTIA: F&B intelligence is not menu optimization; it is the orchestration of competing constraints.

**2. The reference venues each encode a transferable principle:**
- **Connaught Bar (London):** Identity is built on "classic pillars" (tradition, iconicity, elegant service) reinterpreted through modern technique. Agostino Perrone identified the best-selling classic serves (Martini, Bloody Mary) and elevated them rather than chasing novelty. The menu focus "changes annually" but classics (Bloody Mary, gin Martini) have stayed since opening in 2008. A 10-hour daily prep session underpins consistency. The Connaught Martini trolley is the signature ritual — "more than a cocktail; it's a personalised experience."
- **Dante (NYC):** A tight identity (Italian aperitivo, Negroni/Garibaldi/spritz) executed with "preternatural style." Dedicated menus for Negroni, spritz, and Martini variations; drinks built for speed (draft Negroni "served up in seconds") and Instagrammability (Negroni Bianco with baby's breath). Functionally a restaurant, but the cocktail list is the draw — a model for "restaurant bar" identity.
- **Eleven Madison Park:** Daniel Humm's four fundamentals — every dish must be "delicious… beautiful… creative and something you've never seen before… [with] intention." EMP shows menu philosophy as identity: the 2021 all-plant-based pivot, then the reintroduction of fish and meat effective **October 14, 2025** (announced August 2025) on a revised 8–9 course tasting menu priced at **$365**. Hummd both economics (filling private dining rooms, weak wine sales — "For wine aficionados, grand cru goes with meat") and inclusivity: "while we had built something meaningful, we had also unintentionally kept people out. This is the opposite of what we believe hospitality to be." Lesson: even the most identity-driven program must listen to guest feedback and economics, and change is the only constant.
- **USHG:** Multi-venue F&B managed through culture ("culture carriers"), not centralized menus; each restaurant keeps a distinct identity while sharing operating philosophy.
- **Four Seasons vs. Aman:** Four Seasons runs multiple outlets per property (variety, destination dining, guest-chef roster) while Aman curates one or two locally-grounded outlets per property tied to brand philosophy and place. Luxury hotel F&B differs from standalone bars in that it serves a captive multi-occasion guest (breakfast to nightcap) and must protect a brand standard across properties.
- **Soho House:** Multi-property identity via "House Regulars" (shared signature dishes) layered over locally-inspired, locally-sourced menus per city — a federated identity model directly applicable to HESTIA's "hospitality group" venue type.
- **World's 50 Best Bars:** What separates top programs is influence/innovation + flawless execution + immersive atmosphere + exceptional hospitality, not foot traffic. Recurring philosophies: Tayēr + Elementary (ingredient-led minimalism, constantly evolving list), Paradiso (multi-sensory R&D lab), Line Athens (circular economy/zero-waste), Bar Leone ("cocktails for the people," speed and simplicity), Jigger & Pony (annual conceptual "menuzines"). Consistency and hospitality are the through-lines.

**3. Menu engineering remains the analytic backbone.** Kasavana & Smith (Michigan State, 1982) classify items by contribution margin (profitability) and popularity into Stars, Plowhorses, Puzzles, and Dogs. Key operating rules: protect Stars (don't touch the recipe; feature them); re-engineer Plowhorses (small price bump, portion/cost work, high-margin pairing); fix visibility/placement for Puzzles; cut Dogs unless they serve a strategic purpose (dietary need, sales driver). Critical limitation: the model ignores labor cost and prep burden — HESTIA must add these dimensions. Analysis needs 30–90 days of POS data; 90 is better for seasonal items.

**4. Pricing/perception is psychology, not just math.** Eye-tracking shows a "Golden Triangle" (center, top-right, top-left) where high-margin items should sit. Anchoring/decoy items make mid-priced options feel reasonable; removing the currency symbol reduces "pain of paying." Parsa, H.G. & Njite, D. (2014), "Menu Psychology: Using Anchoring and Psychological Pricing," *International Journal of Contemporary Hospitality Management*, 26(7), 1056–1076 — a study of 271 restaurant menus found strategic price anchoring increased average check value by 6.8% without changing actual menu prices. But the best beverage operators warn against ego-driven lists: "Build it for the guest who walks in on a Tuesday… Make it navigable" (Innovative Beverage Strategies).

**5. Cost discipline has hard benchmarks.** Bar pour cost typically targets 18–24% overall (craft cocktail bars often 20–26%, high-volume lower); the modern view is that a "good" pour cost is within ~1.5% of the bar's *theoretical* pour cost, not a generic benchmark. Variance (theft, over-pour, spillage, breakage) must be tracked weekly, not quarterly. Theoretical vs. Actual vs. Variance (AvT) is the core control loop. Spirits are typically marked 4–5×, beer and wine 2–3×, but margin per item matters more than fixed multipliers.

**6. Zero-proof is now a baseline expectation and a high-margin opportunity.** NA cocktails can hit 60–80% margins; treat NA like an allergy protocol (Kato's bar director runs "all the same procedures… for a life-threatening shellfish or peanut allergy"). Best practice: 4+ hero styles (spritz/highball, shaken sour with foam, stirred/bitter, plus a wine/aperitif alternative); same glassware/garnish/spec standards; price just below comparable cocktails, never at soda prices; build for adult flavors (bitter/tart/savory); batch where possible. The consumer shift is real: per Gallup's 2025 Consumption Habits survey (telephone interviews July 7–21, 2025, n=1,002), the share of U.S. adults who say they drink alcohol fell to **54% — the lowest in Gallup's nearly 90-year trend** — and young adults aged 18–34 dropped from 59% in 2023 to **50% in 2025**, now below the 56% rate for those 35 and older. (Restaurants like Coltivare in Houston have promoted full year-round zero-proof lists and multi-cocktail Dry January menus; specific dollar-revenue claims for such programs should be verified before being used as planning benchmarks.)

**7. The Israeli market has unique structural constraints** that must be first-class objects in HESTIA (see Israel Addendum): high excise tax (~107 NIS/L pure alcohol, among the highest in the developed world), F&B prices 52% above the OECD average (June 2023 OECD data, reported by Channel 12 and Times of Israel July 2023; dairy/eggs and meat each ~64% above average), 18% VAT (raised from 17% on January 1, 2025), importer/distributor concentration, and a "kosher-style" dining trend reshaping Tel Aviv (no certificate, but kosher meat, meat/dairy separation, closed before Shabbat).

---

## Details — The 21 Intelligence Categories

For each: **Why it matters · Data to collect · Change frequency · AI can calculate · AI can infer (flag) · AI must NOT infer · Human approval · How AI uses it.**

### 1. Menu Identity
- **Why:** Identity is the organizing constraint for every other decision; without it, a menu becomes a list. Connaught built on "classic pillars" reinterpreted; Dante on Italian aperitivo. Identity determines what belongs and what is noise.
- **Data:** Bar DNA Card (style, target guest, seasonality, positioning), founder intent statement, 3–5 "untouchable" signature items, competitor set, brand adjectives.
- **Frequency:** Rarely (annual review); identity should be stable while expression evolves. EMP's pivots show identity-level change is a deliberate, founder-led event.
- **AI calculates:** Consistency scoring (does each item map to declared identity attributes?), drift detection over menu versions.
- **AI infers (flag):** Whether a proposed item "fits" the identity; gaps in the identity coverage.
- **AI must NOT infer:** The identity itself, or a pivot of identity (EMP-style). That is founder vision.
- **Human approval:** Founder/owner signs identity; any identity-level change.
- **Uses:** Brand-fit scoring gate for every menu recommendation downstream.

### 2. Cocktail Intelligence
- **Why:** The cocktail program is often the highest-margin, most identity-expressive part of a venue and the primary loyalty driver in bars.
- **Data:** Recipe spec (ingredients, pours, dilution, glassware, garnish), prep burden, batchability, cocktail_sales, DNA mapping, lifecycle stage, classic-vs-signature ratio.
- **Frequency:** Menu refresh quarterly/seasonally; classics persist (Connaught keeps Martini/Bloody Mary since 2008). Replace 15–25% at a time, not wholesale.
- **AI calculates:** Pour cost, GP%, margin per cocktail, menu-engineering quadrant, ingredient overlap, speed-of-service proxy (steps/build complexity).
- **AI infers (flag):** Why a cocktail underperforms (placement vs. taste vs. price), trend relevance, twist opportunities on classics.
- **AI must NOT infer:** Whether a new recipe tastes balanced/correct.
- **Human approval:** Beverage director tastes and approves every recipe and spec change.
- **Uses:** Feeds Menu Audit, Signature Drink Engine, Narrative Intelligence.

### 3. Wine Intelligence
- **Why:** Wine is brand equity and margin; a confusing list loses sales ("a confused guest doesn't ask for help. They retreat").
- **Data:** SKU list, by-the-glass vs. bottle, region/grape/style, cost, markup, vintage, supplier/allocation, sales velocity, kosher/mevushal status (Israel).
- **Frequency:** BTG rotates seasonally; bottle list reviewed quarterly; pricing adjusted with supplier changes.
- **AI calculates:** Margin per SKU/BTG, COGS targets (28% vs 32% scenarios), list navigability metrics (price-tier gaps, category balance), dead-stock identification.
- **AI infers (flag):** Which SKUs to cut for navigability, list architecture suggestions, pairing fit.
- **AI must NOT infer:** Quality/drinkability of a specific wine, allocation relationships.
- **Human approval:** Wine director/sommelier curates and tastes; founder approves premium/cellar investment.
- **Uses:** Supplier Intelligence, Pairing Intelligence, Pricing Intelligence.

### 4. Spirits Intelligence
- **Why:** Back-bar breadth drives perception and cost; SKU bloat ties up cash and shelf. The Bottle Optimizer lives here.
- **Data:** Full SKU inventory, cost per bottle/pour, velocity, well vs. call vs. premium tier, cocktail dependency map (which SKUs are load-bearing for recipes), supplier/exclusivity.
- **Frequency:** Reviewed quarterly; Israel — monitor importer price changes more frequently given concentration.
- **AI calculates:** SKU velocity ranking, redundancy/overlap (SKUs serving identical roles), pour cost per SKU, optimal par levels, "cut candidate" list that preserves all recipes.
- **AI infers (flag):** Which SKUs can be consolidated without quality loss, substitution candidates.
- **AI must NOT infer:** Whether a substitute spirit tastes equivalent in a given cocktail.
- **Human approval:** Beverage director confirms cuts after tasting substitutions.
- **Uses:** Bottle Optimizer (Flow 3), cost reduction, supplier negotiation.

### 5. Zero-Proof Intelligence
- **Why:** Baseline expectation, inclusivity, and 60–80% margins; the non-drinker can decide the whole party's venue.
- **Data:** NA recipe specs, cost (NA spirits can cost more than full-proof), sales, glassware/garnish parity, server scripts, allergy-style ticket tagging.
- **Frequency:** Seasonal rotation like cocktails; minimum 4 hero styles.
- **AI calculates:** Margin, cost parity vs. alcoholic counterparts, ingredient reuse from existing menu, attachment rate.
- **AI infers (flag):** Which existing cocktails to mirror as NA, pricing band, trend relevance.
- **AI must NOT infer:** Whether the NA drink achieves real structure/mouthfeel.
- **Human approval:** Beverage director tastes; confirms it meets "same standards" bar.
- **Uses:** Menu completeness scoring, event menus, hotel programs.

### 6. Food Intelligence
- **Why:** Kitchen feasibility, margin, and identity coherence; food and beverage must reinforce one brand.
- **Data:** Recipe/cost cards, prep burden, station load, allergen/dietary flags, kosher meat/dairy classification (Israel), sales mix, GP%.
- **Frequency:** Seasonal refresh (4×/year for produce-driven); casual dining minimum annual full revamp with seasonal supplements; specials as a low-risk test bed.
- **AI calculates:** Food cost %, contribution margin, menu-engineering quadrant, prep-burden score, station balance.
- **AI infers (flag):** Underperformers, portion/price re-engineering, seasonal swap candidates.
- **AI must NOT infer:** Taste, doneness, plating, culinary creativity (Humm's "intention").
- **Human approval:** Chef tastes and approves (Kitchen Intelligence approval flow already exists).
- **Uses:** Menu Audit, Pairing Intelligence, Prep & Labor.

### 7. Pairing Intelligence
- **Why:** Pairings raise average check (up to ~30% with pairing menus) and deepen experience.
- **Data:** Flavor profiles of food and beverage items, intensity/weight, acidity/tannin/sweetness, existing successful pairings, guest uptake.
- **Frequency:** Updated with each menu change.
- **AI calculates:** Structural compatibility scores (weight/acid/intensity matching), attach-rate analytics.
- **AI infers (flag):** Suggested pairings to test, NA pairing flights.
- **AI must NOT infer:** The final verdict that a pairing "works" on the palate.
- **Human approval:** Sommelier/beverage director/chef validate by tasting.
- **Uses:** Narrative Intelligence (server scripts), event menus, tasting menus.

### 8. Pricing Intelligence
- **Why:** Price sets perception and margin simultaneously; anchoring can lift check 6.8% with no real price change.
- **Data:** Current prices, competitor/comp-set pricing, cost basis, elasticity signals, menu placement, local market norms (Israel 52% above OECD).
- **Frequency:** Review monthly for cost-driven adjustments; rotate ~10% of items monthly so each is repriced ≥1×/year; major changes at seasonal refresh.
- **AI calculates:** Margin at any price, price-tier gaps, anchor/decoy structure, charm-pricing options, comp-set delta.
- **AI infers (flag):** Optimal price band, where anchoring/decoys help, items underpriced for their labor.
- **AI must NOT infer:** The brand-acceptable ceiling (a luxury venue may want a price to signal quality) — that is positioning judgment.
- **Human approval:** Founder/GM signs pricing, especially increases on signature/loyalty items.
- **Uses:** Margin Intelligence, Menu Audit, Brand Fit.

### 9. Cost Intelligence
- **Why:** "If you don't know what things cost, you'll never know if you're making a profit." Israel's import structure makes this acute.
- **Data:** Verified bottle/ingredient costs, yield loss, prep labor embedded in true cost (the "sauerkraut problem"), supplier price history, waste/variance.
- **Frequency:** Continuous; recost recipes on every verified supplier price change; weekly variance.
- **AI calculates:** True landed cost, yield-adjusted cost, theoretical cost, variance vs. actual, cost trend alerts.
- **AI infers (flag):** Likely cause of variance (over-pour vs. theft vs. waste), items most exposed to supplier inflation.
- **AI must NOT infer:** Confirmation of theft/staff misconduct (a serious accusation requiring human investigation).
- **Human approval:** Operator verifies bottle prices (Bottle Price Verification gate); investigates variance.
- **Uses:** Margin Calculator, Bottle Optimizer, every recommendation's cost basis.

### 10. Margin Intelligence
- **Why:** Contribution margin (not food-cost %) is what actually pays the bills; menu engineering is built on it.
- **Data:** CM per item, weighted sales-mix margin, category margins vs. target, GP%.
- **Frequency:** Weekly review; full menu-engineering pass at each refresh.
- **AI calculates:** CM, weighted average CM, quadrant placement, margin contribution by category, "margin leak" ranking.
- **AI infers (flag):** Which Plowhorses to re-engineer, which Puzzles to reposition, margin-mix optimization.
- **AI must NOT infer:** Whether a low-margin item should stay for intangible reasons (signature, loyalty, hospitality).
- **Human approval:** Beverage director/founder on retention of low-margin signatures.
- **Uses:** Menu Audit (Flow 2), Item Retirement Logic.

### 11. Prep & Labor Intelligence
- **Why:** Menu engineering's blind spot. A drink/dish can hit margin yet destroy service throughput and labor cost. Connaught's 10-hour daily prep is a deliberate cost choice.
- **Data:** Prep time per item, batchability, station/skill required, mise-en-place burden, service step count, peak-time load.
- **Frequency:** Recalculated each menu change; reviewed against staffing model.
- **AI calculates:** Prep-burden score, labor-cost allocation per item, batch-savings estimate, throughput impact.
- **AI infers (flag):** Items that bottleneck service, batching candidates, prep simplifications.
- **AI must NOT infer:** Whether batching harms quality of a specific drink.
- **Human approval:** Chef/bar lead confirms prep changes preserve quality.
- **Uses:** Service Complexity scoring, Staff Briefing, event feasibility.

### 12. Service Complexity
- **Why:** Speed of service and consistency are pillars of top bars (Bar Leone's whole identity is speed/simplicity). Complexity is the enemy of consistency at volume.
- **Data:** Build steps, specialized equipment/technique, tableside/theatrical elements, garnish complexity, glassware specials.
- **Frequency:** Scored per item at creation; reviewed against venue type and occasion.
- **AI calculates:** Complexity score, expected ticket time, consistency-risk index (steps × skill variance).
- **AI infers (flag):** Items too complex for current staff/volume, simplification paths.
- **AI must NOT infer:** Whether removing theater (e.g., Connaught Martini trolley) damages the experience — sometimes complexity IS the product.
- **Human approval:** Beverage director/GM on signature theatrical items.
- **Uses:** Event Beverage Strategy, Staff Capability matching, high-volume planning.

### 13. Supplier Intelligence
- **Why:** Supplier reality constrains the achievable menu; in Israel, importer concentration directly inflates cost and limits access.
- **Data:** Supplier list, exclusivity/allocation, lead times, reliability, price history, minimums, substitution options, three-tier/licensing constraints (US three-tier; Israel import licensing).
- **Frequency:** Continuous; price monitoring weekly in volatile/concentrated markets.
- **AI calculates:** Price variance by supplier, lead-time risk, single-source dependency map, reorder timing.
- **AI infers (flag):** Supplier risk (single-source items), negotiation leverage, substitution candidates.
- **AI must NOT infer:** Relationship/trust factors and allocation politics that govern access to scarce products.
- **Human approval:** Buyer/beverage director on supplier switches and contracts.
- **Uses:** Supplier Reality gate in the loop, Bottle Optimizer, cost forecasting.

### 14. Seasonality & Trends
- **Why:** Seasonality drives cost, availability, and demand; trends signal relevance. In Israel, the religious calendar and summer heat dominate demand patterns.
- **Data:** Seasonal ingredient calendar, weather, local event calendar, holiday calendar (Israel: Pesach, Rosh Hashanah, Yom Kippur, Sukkot, Shabbat weekly), tourism patterns, industry trend feeds.
- **Frequency:** Trends surfaced continuously; seasonal menu cadence 4×/year; Israel holiday toggles weekly/by-festival.
- **AI calculates:** Seasonal cost/availability windows, demand forecasting by date, holiday-impact flags (closure vs. surge).
- **AI infers (flag):** Trend relevance to THIS venue's identity, seasonal swap opportunities, demand spikes/dips.
- **AI must NOT infer:** That a trend should be adopted (relevance ≠ fit; many trends are anti-brand).
- **Human approval:** Founder/beverage director on trend adoption and campaign launches.
- **Uses:** Trends Engine, Seasonal/Regional Matrix, demand forecasting.

### 15. Guest Demand Signals
- **Why:** Repeat guests generate ~60% of restaurant revenue (Olo); demand signals tell you what to protect and what to add.
- **Data:** POS sales mix, item velocity trends, special-request frequency, reviews/feedback, server-reported questions, reservation/occasion data, returns/sendbacks.
- **Frequency:** Continuous; reviewed weekly.
- **AI calculates:** Velocity trends, declining/rising items, request-frequency aggregation, sentiment from review text.
- **AI infers (flag):** Weak signals — an item declining slowly, a rising special request, a dish generating questions (confusing menu), an item with low sales but high repeat-guest attachment.
- **AI must NOT infer:** That low sales = remove (see Item Retirement); guest intent behind a single complaint.
- **Human approval:** Operator interprets ambiguous signals before action.
- **Uses:** Menu Audit, Item Retirement Logic, the demand-analysis stage of the loop.

### 16. Staff Capability
- **Why:** "Whoever writes the cocktail list" must match who executes it; a biodynamic-nebbiolo wine list paired with a jello-shot bar program is incoherence. Staff ability caps menu ambition.
- **Data:** Skill matrix per staffer, training completion, tenure, technique competencies, turnover risk, shift coverage.
- **Frequency:** Updated per hire/training; reviewed before each menu launch.
- **AI calculates:** Capability coverage vs. menu requirements, training-gap identification, skill-to-complexity matching.
- **AI infers (flag):** Items the current team can't execute consistently, training needs per menu change.
- **AI must NOT infer:** Individual staff potential/attitude (Meyer's "51%" emotional-intelligence hire).
- **Human approval:** GM/bar lead on readiness to launch.
- **Uses:** Staff Briefing Generator (Flow 4), Service Complexity gating, launch readiness.

### 17. Event Beverage Strategy
- **Why:** Events have different economics (per-person packages vs. consumption), throughput needs, and forecasting. A major revenue line for hotels and groups.
- **Data:** Guest count, duration, occasion type, package vs. consumption model, drink-per-guest curves (~2 first hour, 1/hr after), bartender ratios (1 per 60–75), signature/batch plan, NA requirements, dietary/kosher needs.
- **Frequency:** Per event; package templates reviewed seasonally.
- **AI calculates:** Quantity forecasting, package pricing/margin, staffing ratios, batch quantities, cost per head, buffer recommendations.
- **AI infers (flag):** Consumption vs. package recommendation, menu simplification for throughput, upsell tiers.
- **AI must NOT infer:** Host's budget priorities and guest-profile nuances.
- **Human approval:** Events lead/beverage director finalizes package and staffing.
- **Uses:** Event Beverage Strategy module, hospitality-group scaling.

### 18. Hotel Bar Strategy
- **Why:** Hotel F&B serves a captive, multi-occasion, multi-daypart guest and must uphold a brand standard; differs structurally from standalone bars (Connaught: hotel pillars + creative freedom; Four Seasons multi-outlet vs. Aman curated).
- **Data:** Daypart demand (breakfast→nightcap), guest mix (in-house vs. local destination), occasion spread, brand-standard requirements, outlet portfolio, room-charge integration.
- **Frequency:** Menu seasonal; brand standards annual; daypart optimization continuous.
- **AI calculates:** Daypart sales analysis, outlet performance comparison, occasion coverage gaps.
- **AI infers (flag):** Daypart menu gaps, destination-bar opportunity vs. amenity positioning, local-vs-guest balance.
- **AI must NOT infer:** Brand-standard interpretation across properties (corporate governance).
- **Human approval:** Property GM and brand/F&B director.
- **Uses:** Hotel programs, multi-property (group) coherence, Soho House-style federated identity.

### 19. Menu Lifecycle
- **Why:** Items have lifecycles (launch → growth → maturity → decline); managing the cadence avoids both staleness and churn. Change 15–25% per cycle; full overhaul only on rebrand.
- **Data:** Item launch date, lifecycle stage, sales trajectory, cohort performance vs. prior versions, "untouchable" flags.
- **Frequency:** Reviewed each refresh; lifecycle stage updated continuously.
- **AI calculates:** Lifecycle-stage classification, trajectory modeling, refresh-size recommendation (% to rotate), version-over-version cohort comparison.
- **AI infers (flag):** Items entering decline, optimal timing for swaps, candidates for revival/twist.
- **AI must NOT infer:** Whether a declining classic should be retired (loyalty/identity override).
- **Human approval:** Beverage director/founder on lifecycle retirements and launches.
- **Uses:** Menu Audit, long-term menu memory, change recommendation.

### 20. Item Retirement Logic
- **Why:** The hardest decision. Dogs should go — UNLESS they serve a strategic purpose. Weak signals can justify keeping a low-seller.
- **Data:** Sales, margin, prep burden, dietary/allergy role, repeat-guest attachment, signature/loyalty status, ingredient uniqueness (does removal simplify purchasing?), brand-fit score.
- **Frequency:** Evaluated at each menu-engineering pass.
- **AI calculates:** Dog identification, prep/SKU simplification gain from removal, ingredient-uniqueness flag, repeat-guest attachment score.
- **AI infers (flag):** Reasons to KEEP a low-seller — it anchors the high end, fills a dietary gap (the kept Dog for allergies), is ordered by high-value regulars, drives other sales, or is core to identity. AND reasons an item is failing (placement/price vs. taste).
- **AI must NOT infer:** Final retirement decision; emotional/relationship value to founders.
- **Human approval:** Beverage director/chef/founder sign every retirement.
- **Uses:** Menu Audit output, the change-recommendation stage. *This is a CHALLENGE/FLAG function, never an autonomous cut.*

### 21. Brand Fit Logic
- **Why:** Every recommendation must pass through identity; a profitable, popular, trendy item that violates brand should still be challenged. This is the connective tissue of the whole framework.
- **Data:** Bar DNA Card attributes, identity statement, target guest, positioning tier, the proposed item's profile.
- **Frequency:** Applied to every recommendation in real time.
- **AI calculates:** Fit score (item attributes vs. declared identity vectors), drift detection across the menu.
- **AI infers (flag):** Whether a proposed/existing item fits; where the menu is drifting off-identity.
- **AI must NOT infer:** Redefinition of the brand; whether a deliberate brand-stretch is worth it (EMP-style).
- **Human approval:** Founder on any brand-stretch or off-identity addition.
- **Uses:** The mandatory gate on every Menu Audit, Signature Drink, and Trends recommendation.

---

## Menu Strategy by Venue Type and Occasion

**By venue type:** *Luxury hotel* — broad multi-outlet coverage, multi-daypart, brand-standard governance, destination-bar ambition (Four Seasons model); protect brand consistency over local experimentation. *Boutique hotel* — one or two curated, locally-grounded outlets tied to place (Aman model); identity over breadth. *Fine dining restaurant* — seasonal tasting-menu philosophy, intention-driven, change as identity (EMP); deepest pairing and wine investment. *Neighborhood restaurant* — protect 3–5 "untouchable" regular favorites; seasonal supplements; navigable, value-logical pricing. *Cocktail bar* — tight identity, signature ritual, classics + evolving list, speed/consistency at volume (Connaught/Dante/Bar Leone). *Restaurant bar* — cocktail list as the draw layered on a functioning kitchen (Dante); pairing coherence matters. *Event venue* — package/consumption economics, throughput, batching, signature simplicity. *Hospitality group* — federated identity: shared "House Regulars" over locally-tuned menus, culture-carrier governance (USHG/Soho House).

**By occasion:** Regular service optimizes for velocity and consistency; date night and private dining lean on experience, theater, and pairing; business dinner favors navigable wine and reliable execution; the hotel guest needs multi-daypart coverage and room-charge ease; weddings and corporate events shift to per-person/consumption packages, batched signatures, bartender ratios, and robust NA inclusivity; high-volume events demand simplified, batchable, fast-format menus; seasonal campaigns are founder/beverage-director-approved, identity-gated launches.

---

## Israel Market Addendum (Seasonal/Regional Matrix + Cost Intelligence inputs)

- **Excise tax:** Israel applies a uniform, alcohol-content-based excise of roughly **107 NIS per liter of pure alcohol** (post-2013 reform; among the highest in the developed world — vs. ~35 NIS-equivalent in the US, ~58 in Germany, ~70 in France, per Knesset study reportingd by Haaretz). The 2013 reform set a flat tax per 100% alcohol per liter (Times of Israeld ~105 NIS at announcement; the discrepancy reflects indexation) and raised alcohol taxes ~25%. Beer purchase tax roughly doubled (to ~4.25 NIS/L), and beer sales fell ~6.5–7%/year afterward. *HESTIA implication: spirit-forward cocktails carry a heavy fixed tax load; cheap spirits are disproportionately taxed while super-premium can be relatively better value — encode tax in true-cost math.*
- **Wine:** 12% customs duty on imported wine (domestic exempt); historically a ~45% purchase tax on alcoholic beverages; plus VAT. Distribution requires a license.
- **VAT:** Raised from 17% to **18% effective January 1, 2025** — recost all on-premise prices.
- **Price level:** OECD comparative consumer-price data released June 2023 (reported by Channel 12 and Times of Israel, July 2023): Israeli food & beverage prices **52% above the OECD average**, second only to South Korea; dairy/eggs and meat each ran ~64% above the OECD average. Attributed to importer/retailer concentration, tariffs, regulatory bottlenecks, VAT, and kosher restrictions. State Comptroller (Nov 2024): food prices ~51% above EU, ~37% above OECD (PPP-adjusted).
- **Importer concentration:** A handful of importer-distributors hold exclusive import + distribution rights (e.g., Tempo leads alcoholic drinks; Global Wine & Spirit / Falic family rapidly acquiring brand rights). This eliminates intra-brand competition and raises wholesale landed cost before markup. *HESTIA implication: Supplier Intelligence must monitor importer price moves closely; substitution options are narrower.*
- **Kashrut & menu architecture:** Kosher/kosher-style venues separate meat and dairy (typically choosing **dairy+fish, no meat** OR **meat, no dairy**), exclude shellfish/pork, and close for Shabbat/holidays. The "kosher-style" trend (no Rabbinate certificate but kosher meat, separation, closed before Shabbat) is reshaping Tel Aviv dining and reaches an "invisible," observant-but-not-Haredi audience. *Beverage-service constraint:* kosher venues with non-Jewish/non-observant staff must serve **mevushal** (flash-pasteurized) wine by the glass, or sell non-mevushal only as a sealed bottle opened by the guest. *HESTIA implication: kosher status must be a menu-architecture flag that constrains pairings, wine list, and staffing.*
- **Seasonality engine (toggles demand):**
  - **Yom Kippur (Sept/Oct):** near-total national shutdown — venues closed.
  - **Pesach/Passover (7 days; first & last are full chag):** chametz removed; kosher venues need separate Pesach certification and often close to kasher; Chol HaMoed (intermediate days) is a peak dine-out window. Pre-Pesach demand spikes (people eat out to avoid chametz at home).
  - **Rosh Hashanah & Sukkot (Sept/Oct):** festive, demand-driving; Sukkot coincides with good weather and a tourism peak.
  - **Shabbat (weekly):** kosher/kosher-style close Friday sundown–Saturday night; Tel Aviv secular nightlife peaks Thursday–Friday night. Winter Shabbat starts earlier (more lost trading hours).
  - **Summer (Jun–Aug):** Tel Aviv heat/humidity (August up to ~38–42°C, high humidity) pushes activity to evenings; beach/open-air bar culture peaks; peak tourism. April is the quietest tourism month.

---

## Recommendations (staged)

**Stage 1 — Foundation (build now, before Flows 2–4):**
1. Implement the **Brand Fit gate** (Category 21) and **Item Retirement Logic** (20) as CHALLENGE/FLAG-only services. No autonomous cuts. This protects against the single biggest AI failure mode in F&B: removing a loved, identity-defining, or loyalty item because its raw numbers look weak.
2. Extend the Margin Calculator with **Prep & Labor (11)** and **Service Complexity (12)** scores — closing menu engineering's documented labor blind spot.
3. Encode the **Israel Cost & VAT model** (excise ~107 NIS/L pure alcohol, 18% VAT, import duties) into true-cost math now; it changes every margin number.
- *Threshold to proceed to Stage 2:* costing engine reconciles theoretical vs. actual within ±1.5% on a pilot venue.

**Stage 2 — The next modules (Flows 2, 3, 4 + engines):**
4. **Menu Audit (Flow 2):** ship as the Kasavana-Smith matrix EXTENDED with labor, prep, complexity, repeat-guest attachment, and brand fit — output Stars/Plowhorses/Puzzles/Dogs PLUS a "keep-despite-low-sales" flag set.
5. **Bottle Optimizer (Flow 3):** SKU overlap + cocktail-dependency mapping; never auto-cut a load-bearing SKU; require beverage-director tasting sign-off on substitutions.
6. **Staff Briefing Generator (Flow 4):** driven by the Staff Capability matrix (16) + Narrative Intelligence; auto-generate training only for items within or just above current capability, flag gaps.
7. **Trends Engine:** surface signals but force every one through the Brand Fit gate; present as "relevant to your identity: yes/no/stretch," never "adopt this."
8. **Signature Drink Engine:** combine Spirits velocity + identity + simplicity/speed constraints; propose directions, require human creation and tasting.
9. **Seasonal/Regional Matrix:** implement the Israel holiday/Shabbat/weather toggle as a demand-forecasting layer and a menu-availability constraint (kosher/Pesach).

**Stage 3 — The full intelligence loop & memory:**
10. Wire the end-to-end **F&B Intelligence Loop** (below) with long-term menu memory so every decision is versioned and learnable.
- *Threshold to expand across venue types:* one venue runs a full intake→launch→post-launch cycle with measured margin/velocity improvement and zero brand-fit violations shipped.

**Decision-rights rule of thumb (encode globally):**
- **AI recommends** (with human accept/reject): pricing within brand band, placement, SKU consolidation, prep simplification, seasonal swaps, quantity forecasting, training generation.
- **AI only challenges/flags** (never decides): item retirement, low-margin signature retention, trend adoption, brand stretches, variance-cause that implies misconduct.
- **Requires human (taste/founder/chef/beverage-director):** every recipe/spec, every retirement, every brand-level change, every pairing verdict, every supplier switch, every event package finalization.

---

## The Ideal HESTIA F&B Intelligence Loop

A closed, versioned loop where each stage writes to long-term menu memory:

1. **Menu Intake** — ingest items, recipes, specs, identity (Bar DNA Card). AI structures and maps to identity vectors.
2. **Recipe & Costing Memory** — store yield-adjusted true cost per recipe; recost automatically on supplier price changes; remember every version.
3. **Bottle Price Verification** — human-in-the-loop gate confirming wholesale prices (critical in concentrated Israeli market); AI flags stale/outlier prices.
4. **Supplier Reality** — overlay availability, lead time, exclusivity, single-source risk; constrain what the menu can actually deliver.
5. **Staff Capability Review** — match menu requirements to the skill matrix; flag what the team can/can't execute consistently.
6. **Guest Demand Analysis** — POS velocity, requests, reviews, repeat-guest attachment; surface weak signals both ways (failing items AND keep-despite-low-sales).
7. **Sales & Margin Review** — extended menu-engineering matrix (CM + popularity + labor + complexity + brand fit).
8. **Service Complexity Scoring** — throughput and consistency risk per item, weighted by venue type and occasion.
9. **Brand Fit Scoring** — mandatory gate; every candidate change scored against identity; drift detection.
10. **Menu Change Recommendation** — AI proposes a ranked change set, each tagged: *recommend / challenge-flag / human-required*, with rationale and confidence, inferences clearly labeled.
11. **Tasting / Human Approval Gate** — beverage director/chef/founder taste and approve; nothing ships without it. Decision and reasoning are captured.
12. **Post-Launch Review** — measure actual vs. forecast (velocity, margin, variance, guest response) at 30/60/90 days; feed deltas back.
13. **Long-Term Menu Memory** — every item, version, cost, decision, approval, and outcome is retained, making the system progressively better at prediction and at protecting identity. This memory is HESTIA's compounding moat.

The loop's governing principle, drawn from how the best operators actually work: **AI compresses the analysis and expands the options; humans own the taste, the identity, and the final word.**

## Caveats
- Pour-cost and margin benchmarks (18–24%, multipliers) are industry generalizations; the modern standard is each venue's own theoretical cost ±~1.5%, so HESTIA should compute venue-specific targets, not apply fixed numbers.
- The Israeli excise figure (~107 NIS/L pure alcohol) derives from the 2013 reform and reputable reporting (Haaretz/Times of Israel 105–107 NIS at different times due to indexation); the exact 2026 indexed rate was not confirmed in a primary Israel Tax Authority document and should be verified before being hard-coded.
- The "52% above OECD" figure is June-2023 OECD data; a 2025 OECD survey reframes the broader cost picture as a ~35% cost-vs-income gap. Treat as directional and refresh annually.
- The consumer-sobriety shift is grounded in Gallup's July 2025 survey (54% of U.S. adults drink, an ~90-year low; 18–34 cohort at 50%); avoid the older "71% in the 1970s" framing and unverified "Gen Z drinks 20% less" claims, which that source does not support.
- Menu psychology effects (anchoring +6.8% per Parsa & Njite 2014, Golden Triangle) are robust but context-dependent; effects vary by venue type and should be A/B-validated, not assumed.
- Some reference-venue details (specific Tel Aviv bar closures, restaurant meal price points, the Coltivare NA-revenue figures) came from lower-authority travel/aggregator sources and are flagged as indicative, not citable facts.
- This framework is an architecture for a thinking system, not a menu generator; its value depends on disciplined human gates remaining in place as the venue scales.
