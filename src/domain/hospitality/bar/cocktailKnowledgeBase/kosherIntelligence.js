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
