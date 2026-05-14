// Recipe-derived flavor profile. All scores computed from actual ingredient ml amounts + text signals.
// No AI inference. Label must be shown in UI: FLAVOR_PROFILE_LABEL.

export const FLAVOR_DIMS = ['Sweet', 'Sour', 'Bitter', 'Salty', 'Savory', 'Spicy', 'Smoky', 'Dry', 'Creamy']
export const FLAVOR_PROFILE_LABEL = 'Estimated from recipe structure'

const SWEET_PAT  = /syrup|cordial|liqueur|sweet(?!ness)|sugar|honey|agave|triple|cointreau|curacao|falernum|grenadine|orgeat|aperol/
const SOUR_PAT   = /lime|lemon|citrus|acid|verjus|grapefruit|yuzu|tamarind|shrub/
const BITTER_PAT = /amaro|campari|vermouth|angostura|bitter|peychaud|fernet|cynar|averna|campari/
const SPIRIT_PAT = /gin|vodka|rum|tequila|mezcal|whisky|whiskey|brandy|cognac|pisco|arak|bourbon|rye/
const CREAMY_PAT = /cream|egg white|coconut cream|oat milk|milk(?! punch)|foam|falernum/
const CARB_PAT   = /soda|tonic|sparkling|ginger beer|ginger ale|seltzer|club soda|prosecco|champagne/

function mlOf(ings, pattern) {
  return ings
    .filter(i => pattern.test((i.ingredient || '').toLowerCase()))
    .reduce((s, i) => s + (i.amountMl || 0), 0)
}

function safe(v) {
  return Math.max(1, Math.min(10, Math.round(v)))
}

export function computeFlavorProfile(cocktail) {
  const ings = cocktail.ingredientsMl || cocktail.ingredientObjects || []
  const totalMl = Math.max(1, ings.reduce((s, i) => s + (i.amountMl || 0), 0))

  const text = [
    cocktail.conceptStory, cocktail.guestDescription, cocktail.garnish,
    cocktail.method, cocktail.menuRole,
    ...ings.map(i => i.ingredient || ''),
  ].join(' ').toLowerCase()

  const sweetMl  = mlOf(ings, SWEET_PAT)
  const sourMl   = mlOf(ings, SOUR_PAT)
  const bitterMl = mlOf(ings, BITTER_PAT)
  const creamyMl = mlOf(ings, CREAMY_PAT)
  const spiritMl = mlOf(ings, SPIRIT_PAT)
  const carbMl   = mlOf(ings, CARB_PAT)

  // sweetness: ratio-based + text bonus
  const Sweet = safe(
    (sweetMl / totalMl) * 12 +
    (/dessert|sweet(?:ness)?|tropical|fruity|honey|peach|confection/.test(text) ? 2 : 0)
  )

  // sourness: higher multiplier because sour ingredients are used in smaller amounts
  const Sour = safe(
    (sourMl / totalMl) * 18 +
    (/tart|citrus|bright|sour(?:ness)?|acidic|acid-forward/.test(text) ? 2 : 0)
  )

  // bitter: presence-weighted (amaro/campari at 30ml is very bitter)
  const Bitter = safe(
    (bitterMl / totalMl) * 15 +
    (/negroni|bitter finish|bitter(?:ness)?/.test(text) ? 2 : 0) +
    (/dry|crisp/.test(text) ? 1 : 0)
  )

  const Salty = /saline|salt rim|soy(?! sauce mix)|miso|olive brine|pickle/.test(text) ? 5 : 1

  const Savory = /savory|umami|miso|soy|sesame|shiso|cured|ferment|mushroom/.test(text) ? 6
    : /herb|thyme|rosemary|basil|tarragon/.test(text) ? 4 : 1

  const Spicy = /ginger beer|ginger syrup|jalap|chili|habanero|pepper(?:corn)?|cardamom|spic/.test(text) ? 5
    : /ginger/.test(text) ? 4 : 1

  // smoky: mezcal is the dominant smoky spirit; whisky adds mild smoke
  const Smoky = safe(
    (/mezcal/.test(text) ? (spiritMl / totalMl) * 12 : 0) +
    (/smoke|peat|char|lapsang|campfire/.test(text) ? 3 : 0) +
    (/whisky|bourbon/.test(text) && !/mezcal/.test(text) ? 2 : 0)
  )

  // dry: inverse of sweetness, boosted by dry keywords and carbonation dilution
  const Dry = safe(
    5 - (sweetMl / totalMl) * 8 +
    (/dry vermouth|fino sherry|bone dry|brut|crisp|austere/.test(text) ? 2 : 0) +
    (carbMl > 60 ? 1 : 0)
  )

  // creamy: egg white / dairy creates texture
  const Creamy = safe(
    (creamyMl / totalMl) * 18 +
    (/silky|velvet|foam|frothy|egg white|smooth/.test(text) ? 3 : 0)
  )

  return { Sweet, Sour, Bitter, Salty, Savory, Spicy, Smoky, Dry, Creamy, _label: FLAVOR_PROFILE_LABEL }
}
