// Kosher intelligence for cocktail programs — only injected when kosherRequirement is active.
// Runtime-inert: exported strings are injected into AI prompts only when relevant.
// Never inject this module unless form.kosherRequirement is explicitly set.

export const KOSHER_COCKTAIL_RULES = `Kosher cocktail program intelligence (active because kosher requirement is flagged):

SPIRITS — GENERALLY KOSHER:
Most distilled spirits (vodka, gin, whisky, rum, tequila, mezcal) are generally considered kosher without requiring a specific hechsher, as distillation removes non-kosher concerns. However: always recommend confirming with the rabbi/mashgiach for the specific venue's standard.

SPIRITS — CHECK REQUIRED:
- Any spirit aged in sherry or wine casks (many Scotch whiskies, some bourbons) — the wine cask origin may require kosher certification depending on the authority
- Any cream liqueur (Baileys and similar) — requires kosher dairy certification
- Any spirit containing added wine, must, or wine-derived flavoring

WINE-BASED PRODUCTS — CERTIFICATION ALWAYS REQUIRED:
- All wines, Champagne, Prosecco, Cava — must be yayin mevushal or kosher-certified
- Vermouth (sweet, dry, blanc) — wine base requires kosher certification
- Sherry (fino, manzanilla, amontillado) — wine base requires kosher certification
- Aperol, Campari — generally do not contain wine but confirm with current label (formulas change)
- Lillet Blanc, Cocchi Americano — wine base, certification required

BITTERS — CHECK REQUIRED:
Some aromatic bitters (especially those with wine, grape must, or fermented ingredients) may require certification. Angostura bitters are commonly used in kosher programs but confirm with supervising authority.

LIQUEURS — CHECK REQUIRED:
Any liqueur with wine or grape must in its formula. Many fruit liqueurs are fine; check label ingredients.

MIXERS:
Standard sodas, tonics, fresh citrus, simple syrups, and most juices are kosher without certification.

PRACTICAL RULE:
When building a kosher cocktail menu, default to certified spirits + fresh/simple ingredients and avoid wine-based modifiers unless certified options are available. Substitute dry vermouth with kosher-certified vermouth; substitute cream liqueurs with kosher dairy alternatives or remove entirely.`

export const PASSOVER_KOSHER_RULES = `Passover kosher cocktail program intelligence (only active when Passover compliance is explicitly requested):

PASSOVER IS A SEPARATE COMPLIANCE LAYER — do not assume year-round kosher certification equals Passover-safe.

GRAIN-BASED SPIRITS — FLAG FOR PASSOVER:
Standard whisky, bourbon, rye, grain-based vodka, and grain-neutral-base gin are NOT Passover-safe for Ashkenazi communities. Chametz (fermented grain products) is prohibited on Passover. Most standard distilled spirits are chametz even when otherwise kosher-certified.
Exception: Sephardic communities may hold different standards — always confirm with the supervising authority for the specific venue.

SAFE BASE SPIRITS FOR PASSOVER PROGRAMS:
- 100% agave tequila and mezcal (no grain; inherently Passover-compatible — confirm no additives or chametz flavorings)
- Potato vodka with Passover certification (e.g., Chopin Potato, certified brands)
- Grape-based spirits: cognac, Armagnac, pisco, grape brandy — require kosher Passover-certified grape source
- Pure cane rum (sugarcane base, no grain) — generally Passover-safe; confirm no chametz additives
- Fruit brandies from non-grape sources — typically acceptable; verify with supervising authority

WINE AND VERMOUTH — PASSOVER STANDARD:
Same rules as year-round kosher apply, but more strictly observed. Yayin mevushal (cooked/flash-pasteurized wine) is the recommended standard for venues where non-Jewish staff handle bottles during service. Passover-certified label required — year-round kosher wine is not sufficient.

PRACTICAL RULE FOR PASSOVER MENU DESIGN:
Build the cocktail program around tequila, mezcal, rum (cane), and potato vodka as base spirits. Avoid all standard whisky, bourbon, rye, and grain vodka programs entirely. Replace grain vodka with potato vodka. Verify all liqueurs for chametz content. Do not simply remove items from the year-round menu — rebuild from compliant bases.

CRITICAL: Do not invent or assume Passover status for any product. Always confirm with the venue's supervising rabbi or mashgiach. Passover certification is issued separately from year-round hechsher and must appear explicitly on the product label.`
