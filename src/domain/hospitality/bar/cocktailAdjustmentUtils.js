// Deterministic micro-adjustment engine. Modifies ingredient amounts in place — no Gemini call.
// Preserves: name, base spirit, concept, glassware, method, garnish, and recipe structure.
// Returns { applied: boolean, changeLog: string[], cocktail: updatedProposal }

const SWEET_PAT  = /syrup|cordial|liqueur|sweet(?!ness)|sugar|honey|agave|triple|cointreau|curacao|falernum|grenadine|orgeat/
const SOUR_PAT   = /lime|lemon|citrus|acid(?:ulated)?|verjus|grapefruit|yuzu|tamarind|shrub/
const SPIRIT_PAT = /gin|vodka|rum|tequila|mezcal|whisky|whiskey|brandy|cognac|pisco|arak|bourbon|rye/
const CARB_PAT   = /soda|tonic|sparkling|ginger beer|ginger ale|seltzer|club soda/

// ml delta per slider step
const DELTA = {
  sweetness:   5,
  sourness:    5,
  abv:         5,
  carbonation: 20,
}

// Returns the index of the ingredient with most ml matching the pattern.
// Ties broken by earliest index. Returns -1 if none found.
function findBestMatch(ings, pattern) {
  let bestIdx = -1
  let bestMl  = -1
  ings.forEach((ing, i) => {
    if (pattern.test((ing.ingredient || '').toLowerCase()) && (ing.amountMl || 0) > bestMl) {
      bestMl  = ing.amountMl || 0
      bestIdx = i
    }
  })
  return bestIdx
}

function adjustIngredient(ings, pattern, deltaMl, dimensionLabel, changeLog) {
  if (deltaMl === 0) return
  const idx = findBestMatch(ings, pattern)
  if (idx === -1) {
    changeLog.push(`No ${dimensionLabel} ingredient found — slider has no effect`)
    return
  }
  const ing    = ings[idx]
  const before = ing.amountMl || 0
  const after  = Math.max(0, before + deltaMl)
  if (after === before) return
  ing.amountMl = after
  const sign   = deltaMl > 0 ? `+${deltaMl}` : `${deltaMl}`
  changeLog.push(`${ing.ingredient}: ${before} ml → ${after} ml (${dimensionLabel} ${sign} ml)`)
}

export function applyMicroAdjustment(cocktail, sliders) {
  const { sweetness = 0, sourness = 0, abv = 0, carbonation = 0 } = sliders

  if (!sweetness && !sourness && !abv && !carbonation) {
    return { applied: false, changeLog: [], cocktail }
  }

  const ings     = (cocktail.ingredientsMl || cocktail.ingredientObjects || []).map(i => ({ ...i }))
  const changeLog = []

  adjustIngredient(ings, SWEET_PAT,  sweetness   * DELTA.sweetness,   'sweetness',   changeLog)
  adjustIngredient(ings, SOUR_PAT,   sourness    * DELTA.sourness,    'sourness',    changeLog)
  adjustIngredient(ings, SPIRIT_PAT, abv         * DELTA.abv,         'ABV',         changeLog)
  adjustIngredient(ings, CARB_PAT,   carbonation * DELTA.carbonation, 'carbonation', changeLog)

  if (changeLog.length === 0) {
    return { applied: false, changeLog: [], cocktail }
  }

  const updatedCocktail = {
    ...cocktail,
    ingredientsMl:    ings,
    ingredientObjects: ings,
    _adjusted:         true,
  }

  return { applied: true, changeLog, cocktail: updatedCocktail }
}
