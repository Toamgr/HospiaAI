// Ingredient Taste Impact Cards — how core bar ingredients move the decimal
// taste dimensions, plus their key operational/balance risks.
//
// `effects` uses the canonical 0.0–5.0 dimension keys with a small controlled
// vocabulary describing DIRECTION + MAGNITUDE of the push a typical pour adds:
//   '+++' strong increase | '++' moderate | '+' slight
//   '--'  notable decrease | '-' slight decrease
// These are qualitative impact directions, NOT absolute scores — they describe
// how adding the ingredient tends to shift a drink, for reasoning and prediction.
//
// Pure data + lookup. No AI. No fabricated venue data.

import { TASTE_DIMENSION_KEYS } from './tasteProfileSchema.js'

export const IMPACT_LEGEND = Object.freeze({
  '+++': 'strong increase', '++': 'moderate increase', '+': 'slight increase',
  '--': 'notable decrease', '-': 'slight decrease',
})

export const INGREDIENT_TASTE_IMPACT = Object.freeze({
  // ── Acids ──
  lemon:        { type: 'acid',      effects: { acidity: '+++', aroma_intensity: '+', sweetness: '-' }, risk: 'Oxidizes within hours — use fresh; over-pour flattens spirit and reads harsh.' },
  lime:         { type: 'acid',      effects: { acidity: '+++', aroma_intensity: '+', sweetness: '-' }, risk: 'Most perishable citrus; bitter pith if over-squeezed. Fresh only.' },
  grapefruit:   { type: 'acid',      effects: { acidity: '++', bitterness: '+', aroma_intensity: '+' }, risk: 'Lower acid than lemon/lime; carries pith bitterness — balance sweetness.' },

  // ── Sweeteners ──
  simple_syrup: { type: 'sweetener', effects: { sweetness: '++', body: '+', texture: '+' }, risk: 'Neutral but easy to overdo; masks acid balance. Standardize as 1:1 or 2:1.' },
  demerara:     { type: 'sweetener', effects: { sweetness: '++', body: '++', aroma_intensity: '+', finish_length: '+' }, risk: 'Adds molasses depth/color — can muddy delicate drinks.' },
  honey:        { type: 'sweetener', effects: { sweetness: '++', body: '++', aroma_intensity: '+', texture: '+' }, risk: 'Seizes cold; cut 1:1 with water. Strong varietal aroma can dominate.' },
  agave:        { type: 'sweetener', effects: { sweetness: '++', body: '+', aroma_intensity: '+' }, risk: 'Bonds with agave spirits; cut with water. Sweeter than sugar by volume.' },

  // ── Bitters / aperitivi ──
  campari:      { type: 'bitter',    effects: { bitterness: '+++', sweetness: '+', aroma_intensity: '++', finish_length: '++', body: '+' }, risk: 'Dominant; small changes swing balance. Polarizing for guests new to bitter.' },
  aperol:       { type: 'bitter',    effects: { bitterness: '++', sweetness: '++', aroma_intensity: '+' }, risk: 'Lower-ABV, sweeter and softer than Campari — not a 1:1 substitute.' },
  vermouth:     { type: 'fortified', effects: { bitterness: '+', sweetness: '+', aroma_intensity: '++', body: '+', umami: '+' }, risk: 'Oxidizes once open — refrigerate, date, discard stale. Sweet vs dry differ sharply.' },
  bitters:      { type: 'bitter',    effects: { bitterness: '+', aroma_intensity: '++', finish_length: '+' }, risk: 'A dash is potent aroma; more than 2–3 dashes can over-spice. High alcohol carrier.' },

  // ── Base spirits ──
  gin:          { type: 'spirit',    effects: { aroma_intensity: '++', alcohol_heat: '++', body: '+' }, risk: 'Botanical profile varies by brand; juniper can clash with some florals.' },
  vodka:        { type: 'spirit',    effects: { alcohol_heat: '++', body: '+' }, risk: 'Neutral — contributes heat/body but little flavor; drink leans on modifiers.' },
  tequila:      { type: 'spirit',    effects: { aroma_intensity: '++', alcohol_heat: '++', body: '+', umami: '+' }, risk: 'Blanco vs reposado/añejo differ in oak/body; vegetal agave can read sharp.' },
  mezcal:       { type: 'spirit',    effects: { aroma_intensity: '+++', alcohol_heat: '++', body: '+' }, risk: 'Smoke dominates fast — a small split-base often beats a full pour.' },
  rum:          { type: 'spirit',    effects: { sweetness: '+', body: '++', aroma_intensity: '++', alcohol_heat: '++' }, risk: 'Huge style range (light vs aged vs blackstrap) changes body/sweetness — specify.' },
  bourbon:      { type: 'spirit',    effects: { sweetness: '+', body: '++', aroma_intensity: '++', alcohol_heat: '++', finish_length: '+' }, risk: 'Corn sweetness + oak; high proof adds heat. Vanilla notes can read sweet.' },
  rye:          { type: 'spirit',    effects: { aroma_intensity: '++', body: '++', alcohol_heat: '++', finish_length: '+' }, risk: 'Spicier and drier than bourbon; not interchangeable in delicate builds.' },

  // ── Aromatics / herbs ──
  mint:         { type: 'aromatic',  effects: { aroma_intensity: '++', texture: '+' }, risk: 'Bruising turns it bitter (chlorophyll). Press gently; wilts ahead of service.' },
  rosemary:     { type: 'aromatic',  effects: { aroma_intensity: '++' }, risk: 'Resinous and assertive — easy to overpower; better as expressed garnish/sprig.' },
  basil:        { type: 'aromatic',  effects: { aroma_intensity: '++' }, risk: 'Oxidizes/blackens fast; gentle handling and last-minute use only.' },

  // ── Flavor / body ──
  coffee:       { type: 'flavor',    effects: { bitterness: '++', aroma_intensity: '+++', body: '+', umami: '+' }, risk: 'Must be fresh espresso for aroma/foam; stale or cold-brew kills the head.' },
  coconut:      { type: 'flavor',    effects: { sweetness: '++', body: '+++', texture: '+++' }, risk: 'Cream of coconut is very sweet and heavy; can read cloying without acid.' },
  passion_fruit:{ type: 'flavor',    effects: { acidity: '++', sweetness: '++', aroma_intensity: '++' }, risk: 'Bright but pulpy; purée vs juice changes sugar/acid — adjust sweetener.' },
  pineapple:    { type: 'flavor',    effects: { acidity: '+', sweetness: '++', aroma_intensity: '+', texture: '++' }, risk: 'Fresh juice froths and varies in sweetness by ripeness; enzymes break egg foams.' },

  // ── Savoury / balance ──
  saline:       { type: 'balance',   effects: { salinity: '+++', sweetness: '+', aroma_intensity: '+' }, risk: 'Drops only (3–5). Amplifies sweet and suppresses bitter; too much ruins a drink.' },
})

export const INGREDIENT_TASTE_IMPACT_KEYS = Object.freeze(Object.keys(INGREDIENT_TASTE_IMPACT))

function normalizeIngredient(name = '') {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

/**
 * Return the impact card for an ingredient by name. Tries exact, then a loose
 * token contains-match (e.g. "fresh lime juice" → lime, "London dry gin" → gin).
 * Returns null on miss (honest unknown — caller should not assume effects).
 */
export function getIngredientImpact(name) {
  if (!name) return null
  const key = normalizeIngredient(name)
  if (INGREDIENT_TASTE_IMPACT[key]) return INGREDIENT_TASTE_IMPACT[key]
  const hit = INGREDIENT_TASTE_IMPACT_KEYS.find(k => key.includes(k))
  return hit ? INGREDIENT_TASTE_IMPACT[hit] : null
}

export { TASTE_DIMENSION_KEYS }
