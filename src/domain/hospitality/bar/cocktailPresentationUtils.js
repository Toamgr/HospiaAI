// Rule-based glassware recommendation. Derived from cocktail volume, method, spirit family, and serve style.
// Returns { glassware, reason, source }. Never returns null — always has a recommendation.

const GLASS_TALL    = 'Highball'
const GLASS_COUPE   = 'Coupe'
const GLASS_ROCKS   = 'Rocks Glass'
const GLASS_NICK    = 'Nick & Nora'
const GLASS_WINE    = 'Wine Glass'

const CARB_PAT   = /soda|tonic|sparkling|ginger beer|ginger ale|seltzer|club soda|prosecco|champagne|cava|beer|fizz/
const FOAM_PAT   = /egg white|cream(?! de)(?! sherry)|coconut cream|oat milk|foam|frothy|falernum/
const WHISKY_PAT = /whisky|whiskey|bourbon|rye/
const MEZCAL_PAT = /mezcal/
const TEQUILA_PAT = /tequila/
const GIN_PAT    = /\bgin\b/
const RUM_PAT    = /\brum\b/
const CITRUS_PAT = /lime|lemon|citrus|grapefruit/

export function recommendGlassware(cocktail) {
  const ings = cocktail.ingredientsMl || cocktail.ingredientObjects || []
  const totalMl = ings.reduce((s, i) => s + (i.amountMl || 0), 0)

  const method  = (cocktail.method  || '').toLowerCase()
  const menuRole = (cocktail.menuRole || '').toLowerCase()
  const text = [
    cocktail.conceptStory, cocktail.guestDescription, cocktail.garnish,
    method, menuRole,
    ...ings.map(i => i.ingredient || ''),
  ].join(' ').toLowerCase()

  const hasCarbonation = CARB_PAT.test(text)
  const hasFoam        = FOAM_PAT.test(text)
  const hasWhisky      = WHISKY_PAT.test(text)
  const hasMezcal      = MEZCAL_PAT.test(text)
  const hasTequila     = TEQUILA_PAT.test(text)
  const hasGin         = GIN_PAT.test(text)
  const hasRum         = RUM_PAT.test(text)
  const hasCitrus      = CITRUS_PAT.test(text)

  const isShaken  = /shak|shake/.test(method)
  const isStirred = /stirr|stir/.test(method)
  const isBuilt   = /built|build/.test(method)
  const isBlended = /blend/.test(method)
  const isThrown  = /throw|thrown/.test(method)

  // 1. Carbonated + volume → tall glass (carbonation needs space + ice)
  if (hasCarbonation && totalMl > 60) {
    return { glassware: GLASS_TALL, reason: 'carbonated serve needs tall format for gas and ice volume', source: 'rule:carbonated+volume' }
  }

  // 2. Blended → wine glass (closest to hurricane/goblet in our visual set)
  if (isBlended) {
    return { glassware: GLASS_WINE, reason: 'blended serve benefits from large bowl format', source: 'rule:blended' }
  }

  // 3. Whisky-based, short, built or stirred → rocks (classic presentation)
  if (hasWhisky && totalMl <= 100 && (isBuilt || isStirred || (!isShaken && !hasCarbonation))) {
    return { glassware: GLASS_ROCKS, reason: 'whisky-based spirit-forward serve traditionally over large ice in rocks glass', source: 'rule:whisky+short' }
  }

  // 4. Mezcal spirit-forward (stirred or explicit spirit-forward role) → rocks
  if (hasMezcal && (isStirred || isBuilt || menuRole.includes('spirit'))) {
    return { glassware: GLASS_ROCKS, reason: 'mezcal spirit-forward serve on large ice to open aromatics', source: 'rule:mezcal+spiritforward' }
  }

  // 5. Large volume without foam → tall (highball)
  if (totalMl > 130 && !hasFoam) {
    return { glassware: GLASS_TALL, reason: 'large volume requires tall format', source: 'rule:large_volume' }
  }

  // 6. Shaken + egg white/foam → coupe (showcase texture at rim)
  if (isShaken && hasFoam) {
    return { glassware: GLASS_COUPE, reason: 'shaken foam cocktail served in coupe to display texture', source: 'rule:shaken+foam' }
  }

  // 7. Shaken or thrown, small volume → Nick & Nora (elegant, controlled pour)
  if ((isShaken || isThrown) && totalMl < 80) {
    return { glassware: GLASS_NICK, reason: 'small shaken serve suited to Nick & Nora format', source: 'rule:shaken+small' }
  }

  // 8. Stirred, small volume → Nick & Nora (classic stirred presentation)
  if ((isStirred || isThrown) && totalMl < 90) {
    return { glassware: GLASS_NICK, reason: 'stirred low-volume cocktail classically in Nick & Nora', source: 'rule:stirred+small' }
  }

  // 9. Shaken + medium volume → coupe
  if (isShaken && totalMl >= 80 && totalMl <= 130) {
    return { glassware: GLASS_COUPE, reason: 'medium-volume shaken serve in coupe', source: 'rule:shaken+medium' }
  }

  // 10. Citrus sour (gin/tequila/rum + lime or lemon, no carbonation) → coupe
  if ((hasTequila || hasRum || hasGin) && hasCitrus && !hasCarbonation) {
    return { glassware: GLASS_COUPE, reason: 'citrus sour category traditionally served in coupe', source: 'rule:citrus_sour' }
  }

  // Fallback by method
  if (isShaken)            return { glassware: GLASS_COUPE,  reason: 'shaken cocktail default', source: 'rule:default_shaken' }
  if (totalMl <= 90)       return { glassware: GLASS_ROCKS,  reason: 'short drink default', source: 'rule:default_short' }
  return { glassware: GLASS_TALL, reason: 'larger volume default', source: 'rule:default_large' }
}

// Maps a glassware string to a format family for comparison (loose match).
function glassFamily(glassware = '') {
  const g = glassware.toLowerCase()
  if (/highball|collins|tall/.test(g)) return 'tall'
  if (/coupe/.test(g))                 return 'coupe'
  if (/rocks|old.?fashion|lowball/.test(g)) return 'rocks'
  if (/nick|nora|martini/.test(g))     return 'upright'
  if (/wine|goblet|hurricane/.test(g)) return 'wide'
  return 'unknown'
}

// Validates Gemini's glassware suggestion against the rule-based recommendation.
// Returns the validated glassware and reason. Overrides if families diverge.
export function validateGlassware(suggestedGlassware, cocktail) {
  const rec = recommendGlassware(cocktail)
  const suggestedFam  = glassFamily(suggestedGlassware)
  const recommendedFam = glassFamily(rec.glassware)

  if (suggestedFam === 'unknown' || suggestedFam === recommendedFam) {
    return { accepted: true, glassware: suggestedGlassware, reason: rec.reason, source: rec.source }
  }
  return { accepted: false, glassware: rec.glassware, reason: rec.reason, source: rec.source, overrode: suggestedGlassware }
}
