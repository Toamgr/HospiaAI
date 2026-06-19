// Cocktail Family Ratio Logic — structured templates for the core families.
//
// Promotes the prose ratios that previously lived only inside the AI prompt
// (flavorScience.js → COCKTAIL_ARCHITECTURE) into structured data the code can
// reference for sanity checks, target-recipe scaffolding, and small prompt hints.
//
// Pure data + small lookup helpers. No AI. No fabricated venue data.
// `taste_tendency` uses the canonical 0.0–5.0 dimension keys and expresses the
// FAMILY's characteristic lean — not a specific recipe's profile.

import { TASTE_DIMENSION_KEYS } from './tasteProfileSchema.js'

export const COCKTAIL_FAMILY_RATIOS = Object.freeze({
  sour: {
    name: 'Sour',
    structure: 'base spirit + citrus + sweetener (± egg white for texture)',
    reference_ratio: '2 : 0.75 : 0.75 (spirit : citrus : sweetener)',
    reference_ml: [
      { role: 'base spirit', ml: 60 },
      { role: 'fresh citrus', ml: 22 },
      { role: 'sweetener', ml: 22 },
    ],
    method: 'shake', dilution: 'high (hard shake, ~25% dilution)',
    balance_logic: 'Acid and sugar must counterweight each other; adjust sweetener to citrus ripeness. Egg white softens perceived acid and adds texture, not flavor.',
    taste_tendency: { acidity: 'high', sweetness: 'medium', body: 'medium', texture: 'medium-high', alcohol_heat: 'medium' },
    examples: ['Daiquiri', 'Whiskey Sour', 'Margarita', 'Gimlet'],
  },
  collins: {
    name: 'Collins',
    structure: 'base spirit + citrus + sweetener + soda (long serve)',
    reference_ratio: '2 : 0.75 : 0.75 + top soda',
    reference_ml: [
      { role: 'base spirit', ml: 45 },
      { role: 'fresh citrus', ml: 22 },
      { role: 'sweetener', ml: 15 },
      { role: 'soda', ml: 60 },
    ],
    method: 'build', dilution: 'medium (ice + soda lengthening)',
    balance_logic: 'A lengthened sour: soda dilutes acid/sugar and drops body. Keep the pre-soda base slightly punchier so the drink is not watery.',
    taste_tendency: { acidity: 'medium-high', sweetness: 'medium', body: 'low', texture: 'effervescent', alcohol_heat: 'low' },
    examples: ['Tom Collins', 'John Collins'],
  },
  highball: {
    name: 'Highball',
    structure: 'base spirit + carbonated/long mixer (± small acid)',
    reference_ratio: '1 : 3 (spirit : mixer)',
    reference_ml: [
      { role: 'base spirit', ml: 50 },
      { role: 'mixer', ml: 150 },
    ],
    method: 'build', dilution: 'medium-high (long serve over ice)',
    balance_logic: 'Carbonation and chill carry the drink; the mixer defines it. Fast and scalable. Protect carbonation — stir minimally.',
    taste_tendency: { acidity: 'low-medium', sweetness: 'low-medium', body: 'low', texture: 'effervescent', alcohol_heat: 'low' },
    examples: ['Gin & Tonic', 'Paloma', 'Mojito', 'Moscow Mule'],
  },
  old_fashioned: {
    name: 'Old Fashioned',
    structure: 'base spirit + sweetener + bitters (no citrus), stirred',
    reference_ratio: '60ml spirit : 5ml sweetener : 2 dashes bitters',
    reference_ml: [
      { role: 'base spirit', ml: 60 },
      { role: 'sweetener', ml: 5 },
      { role: 'bitters', ml: 1 },
    ],
    method: 'stir', dilution: 'low-medium (stirred over large ice)',
    balance_logic: 'Spirit is the point. Sweetener and bitters frame, never mask. Dilution and temperature do most of the smoothing.',
    taste_tendency: { acidity: 'very low', sweetness: 'low', bitterness: 'low-medium', body: 'high', finish_length: 'long', alcohol_heat: 'high' },
    examples: ['Old Fashioned', 'Sazerac (variant)'],
  },
  negroni: {
    name: 'Negroni',
    structure: 'spirit + bitter liqueur + sweet vermouth (equal parts), stirred',
    reference_ratio: '1 : 1 : 1',
    reference_ml: [
      { role: 'base spirit', ml: 30 },
      { role: 'bitter liqueur', ml: 30 },
      { role: 'sweet vermouth', ml: 30 },
    ],
    method: 'stir', dilution: 'medium (stirred)',
    balance_logic: 'Bitterness and sweetness held in equal tension. Shifting any third changes identity. Lower the bitter or raise vermouth to soften.',
    taste_tendency: { bitterness: 'high', sweetness: 'medium', body: 'high', finish_length: 'long', alcohol_heat: 'medium-high' },
    examples: ['Negroni', 'Boulevardier', 'White Negroni'],
  },
  martini: {
    name: 'Martini',
    structure: 'base spirit + dry vermouth (± bitters), stirred, served up',
    reference_ratio: '4 : 1 (spirit : vermouth), to taste',
    reference_ml: [
      { role: 'base spirit', ml: 60 },
      { role: 'dry vermouth', ml: 15 },
    ],
    method: 'stir', dilution: 'medium (cold, diluted, served up)',
    balance_logic: 'Precision and temperature define it. Vermouth ratio is preference. Aroma and ethanol presence are the experience — keep it very cold.',
    taste_tendency: { acidity: 'low', sweetness: 'very low', aroma_intensity: 'high', body: 'medium-high', alcohol_heat: 'high' },
    examples: ['Dry Martini', 'Vesper', 'Dirty Martini'],
  },
  spritz: {
    name: 'Spritz',
    structure: 'bitter/aperitivo + sparkling wine + soda (low-ABV)',
    reference_ratio: '3 : 2 : 1 (prosecco : aperitivo : soda)',
    reference_ml: [
      { role: 'sparkling wine', ml: 90 },
      { role: 'aperitivo', ml: 60 },
      { role: 'soda', ml: 30 },
    ],
    method: 'build', dilution: 'medium (over ice, effervescent)',
    balance_logic: 'Low-ABV aperitivo anchor; effervescence and cold are essential. Deteriorates as it warms — serve immediately.',
    taste_tendency: { bitterness: 'medium', sweetness: 'medium', body: 'low', texture: 'effervescent', alcohol_heat: 'low' },
    examples: ['Aperol Spritz', 'Hugo Spritz', 'French 75 (sparkling sour)'],
  },
  flip_creamy: {
    name: 'Flip / Creamy',
    structure: 'spirit/fortified + sweetener + whole egg or dairy/fat',
    reference_ratio: '60ml spirit : 15ml sweetener : 1 whole egg',
    reference_ml: [
      { role: 'base spirit / fortified', ml: 60 },
      { role: 'sweetener', ml: 15 },
      { role: 'egg / dairy', ml: 30 },
    ],
    method: 'shake', dilution: 'medium (dry shake then shake)',
    balance_logic: 'Texture and body are the headline. Sweetness supports richness; aromatics (nutmeg) cut perceived fattiness. Avoid cloying.',
    taste_tendency: { sweetness: 'medium-high', body: 'high', texture: 'high', acidity: 'low', alcohol_heat: 'low-medium' },
    examples: ['Brandy Flip', 'Porto Flip', 'Golden Cadillac (cream)'],
  },
  tropical_tiki: {
    name: 'Tropical / Tiki',
    structure: 'rum(s) + citrus + tropical sweetener/juice (± orgeat/falernum)',
    reference_ratio: '2 : 1 : 0.75 + accent modifiers',
    reference_ml: [
      { role: 'rum(s)', ml: 60 },
      { role: 'fresh citrus', ml: 22 },
      { role: 'tropical sweetener', ml: 15 },
      { role: 'juice / accent', ml: 30 },
    ],
    method: 'shake', dilution: 'high (often crushed ice)',
    balance_logic: 'Layered but must stay balanced — acid keeps tropical sweetness from going flabby. Orgeat/falernum add nutty/spiced aroma. Watch sugar load.',
    taste_tendency: { acidity: 'medium-high', sweetness: 'medium-high', aroma_intensity: 'high', body: 'medium', alcohol_heat: 'medium' },
    examples: ['Mai Tai', 'Jungle Bird', 'Piña Colada'],
  },
  coffee_espresso: {
    name: 'Coffee / Espresso',
    structure: 'spirit + fresh espresso + coffee liqueur + small sweetener',
    reference_ratio: '50ml spirit : 30ml espresso : 10ml liqueur : 5ml syrup',
    reference_ml: [
      { role: 'base spirit', ml: 50 },
      { role: 'fresh espresso', ml: 30 },
      { role: 'coffee liqueur', ml: 10 },
      { role: 'sweetener', ml: 5 },
    ],
    method: 'shake', dilution: 'medium (hard shake for foam)',
    balance_logic: 'Roast bitterness + aroma carry it; sweetness balances the bitter. Foam (from hard shake on hot-then-cooled espresso) is the signature texture.',
    taste_tendency: { bitterness: 'medium-high', sweetness: 'medium', aroma_intensity: 'high', body: 'medium-high', texture: 'foamy' },
    examples: ['Espresso Martini', 'White Russian (cream variant)'],
  },
})

export const COCKTAIL_FAMILY_KEYS = Object.freeze(Object.keys(COCKTAIL_FAMILY_RATIOS))

function normalizeFamily(name = '') {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

/** Look up a family template by key or loose name. Returns null on miss. */
export function getFamilyRatio(name) {
  if (!name) return null
  const key = normalizeFamily(name)
  if (COCKTAIL_FAMILY_RATIOS[key]) return COCKTAIL_FAMILY_RATIOS[key]
  // loose contains-match (e.g. "tiki", "creamy", "coffee")
  const hit = COCKTAIL_FAMILY_KEYS.find(k => k.includes(key) || key.includes(k))
  return hit ? COCKTAIL_FAMILY_RATIOS[hit] : null
}

// Re-export for callers that want the canonical dimension order alongside families.
export { TASTE_DIMENSION_KEYS }
