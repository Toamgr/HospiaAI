// Classic Cocktail Taste Calibration — decimal taste anchors for core classics.
//
// Purpose: give HESTIA a calibrated reference set so generated drinks can be
// reasoned about and (later) validated against well-understood baselines, and so
// a small calibration sample can be injected into prompts when relevant.
//
// Scores use the canonical 0.0–5.0 one-decimal scale (see tasteProfileSchema.js).
// Values are human-estimated reference points for a well-made standard build —
// NOT measured lab data, NOT venue-specific. They are deliberately conservative
// and internally consistent (e.g. spirit-forward stirred drinks read high body /
// alcohol_heat / finish, low acidity). Treat as orientation, not absolute truth.
//
// Read-only. No fabricated venue data. Calibration ≠ verified measurement.

import { TASTE_DIMENSION_KEYS, validateTasteProfile } from './tasteProfileSchema.js'

export const CALIBRATION_BASIS = 'human_reference_estimate' // not lab-measured
export const CALIBRATION_NOTE =
  'Reference taste estimates for a well-made standard build. Orientation only — ' +
  'a specific venue recipe will differ. Not a verified measurement.'

// Each entry: { name, family, taste_profile{10 dims}, key_drivers }
export const CLASSIC_TASTE_CALIBRATION = Object.freeze({
  daiquiri: {
    name: 'Daiquiri', family: 'Sour',
    taste_profile: { acidity: 4.0, sweetness: 2.3, bitterness: 0.4, salinity: 0.2, umami: 0.1, aroma_intensity: 2.2, body: 2.0, texture: 2.3, finish_length: 2.4, alcohol_heat: 2.6 },
    key_drivers: 'Lime acid forward, light rum, clean short finish.',
  },
  margarita: {
    name: 'Margarita', family: 'Sour',
    taste_profile: { acidity: 4.1, sweetness: 2.4, bitterness: 0.6, salinity: 1.6, umami: 0.2, aroma_intensity: 2.6, body: 2.2, texture: 2.3, finish_length: 2.6, alcohol_heat: 2.7 },
    key_drivers: 'Lime + triple sec, agave aroma, salt rim lifts salinity.',
  },
  negroni: {
    name: 'Negroni', family: 'Negroni / Equal-parts bitter',
    taste_profile: { acidity: 0.6, sweetness: 2.6, bitterness: 4.4, salinity: 0.2, umami: 0.4, aroma_intensity: 3.6, body: 3.6, texture: 2.6, finish_length: 4.2, alcohol_heat: 3.4 },
    key_drivers: 'Campari bitterness + sweet vermouth, long bitter finish.',
  },
  old_fashioned: {
    name: 'Old Fashioned', family: 'Old Fashioned',
    taste_profile: { acidity: 0.2, sweetness: 1.8, bitterness: 1.8, salinity: 0.1, umami: 0.3, aroma_intensity: 3.0, body: 3.8, texture: 2.4, finish_length: 4.2, alcohol_heat: 4.0 },
    key_drivers: 'Spirit-forward whisky, gentle sugar, aromatic bitters, oak depth.',
  },
  martini: {
    name: 'Dry Martini', family: 'Martini',
    taste_profile: { acidity: 0.4, sweetness: 0.6, bitterness: 1.4, salinity: 0.6, umami: 0.4, aroma_intensity: 3.4, body: 3.2, texture: 2.0, finish_length: 3.6, alcohol_heat: 4.2 },
    key_drivers: 'Cold, dry, botanical aroma, high ethanol presence, clean.',
  },
  paloma: {
    name: 'Paloma', family: 'Highball',
    taste_profile: { acidity: 3.2, sweetness: 2.2, bitterness: 1.2, salinity: 1.3, umami: 0.2, aroma_intensity: 2.4, body: 1.8, texture: 2.6, finish_length: 2.2, alcohol_heat: 1.8 },
    key_drivers: 'Grapefruit (acid + pith bitter), soda lift, salt, refreshing.',
  },
  aperol_spritz: {
    name: 'Aperol Spritz', family: 'Spritz',
    taste_profile: { acidity: 1.8, sweetness: 2.8, bitterness: 2.6, salinity: 0.3, umami: 0.1, aroma_intensity: 2.6, body: 1.6, texture: 3.0, finish_length: 2.0, alcohol_heat: 1.2 },
    key_drivers: 'Low-ABV, sweet-bitter orange, effervescent texture, short finish.',
  },
  espresso_martini: {
    name: 'Espresso Martini', family: 'Coffee / Espresso',
    taste_profile: { acidity: 1.6, sweetness: 2.8, bitterness: 2.8, salinity: 0.2, umami: 0.6, aroma_intensity: 3.8, body: 3.4, texture: 3.6, finish_length: 3.4, alcohol_heat: 2.6 },
    key_drivers: 'Coffee roast bitterness + aroma, sweet, foamy texture.',
  },
  whiskey_sour: {
    name: 'Whiskey Sour', family: 'Sour',
    taste_profile: { acidity: 3.6, sweetness: 2.6, bitterness: 1.0, salinity: 0.2, umami: 0.4, aroma_intensity: 2.6, body: 2.8, texture: 3.4, finish_length: 2.8, alcohol_heat: 2.8 },
    key_drivers: 'Lemon acid, bourbon body, egg-white silk texture when used.',
  },
  mojito: {
    name: 'Mojito', family: 'Highball',
    taste_profile: { acidity: 3.0, sweetness: 2.4, bitterness: 0.4, salinity: 0.2, umami: 0.1, aroma_intensity: 3.2, body: 1.6, texture: 2.8, finish_length: 2.0, alcohol_heat: 1.6 },
    key_drivers: 'Mint aroma, lime acid, soda lift, refreshing and light.',
  },
  gimlet: {
    name: 'Gimlet', family: 'Sour',
    taste_profile: { acidity: 3.4, sweetness: 2.2, bitterness: 0.6, salinity: 0.2, umami: 0.1, aroma_intensity: 2.8, body: 2.4, texture: 2.2, finish_length: 2.6, alcohol_heat: 3.0 },
    key_drivers: 'Gin botanicals + lime, crisp and clean.',
  },
  manhattan: {
    name: 'Manhattan', family: 'Old Fashioned / Stirred',
    taste_profile: { acidity: 0.4, sweetness: 2.4, bitterness: 1.8, salinity: 0.1, umami: 0.5, aroma_intensity: 3.2, body: 3.6, texture: 2.6, finish_length: 4.0, alcohol_heat: 3.6 },
    key_drivers: 'Rye + sweet vermouth + bitters, rich, long finish.',
  },
  french_75: {
    name: 'French 75', family: 'Spritz / Sparkling sour',
    taste_profile: { acidity: 3.2, sweetness: 2.0, bitterness: 0.6, salinity: 0.2, umami: 0.1, aroma_intensity: 2.8, body: 1.6, texture: 3.2, finish_length: 2.2, alcohol_heat: 2.2 },
    key_drivers: 'Lemon acid, gin, Champagne effervescence, celebratory.',
  },
  penicillin: {
    name: 'Penicillin', family: 'Sour',
    taste_profile: { acidity: 3.2, sweetness: 2.4, bitterness: 0.8, salinity: 0.2, umami: 0.3, aroma_intensity: 4.0, body: 2.8, texture: 2.8, finish_length: 3.6, alcohol_heat: 2.8 },
    key_drivers: 'Smoky Islay float aroma, ginger heat, honey-lemon balance.',
  },
  mai_tai: {
    name: 'Mai Tai', family: 'Tropical / Tiki',
    taste_profile: { acidity: 3.0, sweetness: 2.8, bitterness: 0.6, salinity: 0.2, umami: 0.2, aroma_intensity: 3.4, body: 2.6, texture: 2.6, finish_length: 2.8, alcohol_heat: 2.6 },
    key_drivers: 'Rum + lime + orgeat (nutty aroma) + orange liqueur.',
  },
  pina_colada: {
    name: 'Piña Colada', family: 'Tropical / Tiki',
    taste_profile: { acidity: 1.8, sweetness: 3.6, bitterness: 0.2, salinity: 0.2, umami: 0.2, aroma_intensity: 3.0, body: 3.8, texture: 4.0, finish_length: 2.6, alcohol_heat: 1.6 },
    key_drivers: 'Coconut cream body + texture, pineapple, sweet, indulgent.',
  },
  paper_plane: {
    name: 'Paper Plane', family: 'Sour / Equal-parts',
    taste_profile: { acidity: 3.0, sweetness: 2.4, bitterness: 2.8, salinity: 0.2, umami: 0.3, aroma_intensity: 3.0, body: 2.6, texture: 2.4, finish_length: 3.2, alcohol_heat: 2.6 },
    key_drivers: 'Equal parts bourbon/Aperol/Amaro Nonino/lemon — balanced bitter-sour.',
  },
  cosmopolitan: {
    name: 'Cosmopolitan', family: 'Sour / Modern',
    taste_profile: { acidity: 3.2, sweetness: 2.6, bitterness: 0.6, salinity: 0.2, umami: 0.1, aroma_intensity: 2.6, body: 2.0, texture: 2.2, finish_length: 2.2, alcohol_heat: 2.6 },
    key_drivers: 'Lime + cranberry tartness, citrus vodka, light and tart-sweet.',
  },
  boulevardier: {
    name: 'Boulevardier', family: 'Negroni / Equal-parts bitter',
    taste_profile: { acidity: 0.4, sweetness: 2.6, bitterness: 4.0, salinity: 0.1, umami: 0.4, aroma_intensity: 3.2, body: 3.8, texture: 2.6, finish_length: 4.2, alcohol_heat: 3.6 },
    key_drivers: 'Bourbon-based Negroni: bitter Campari + sweet vermouth, rich finish.',
  },
})

export const CLASSIC_TASTE_CALIBRATION_COUNT = Object.keys(CLASSIC_TASTE_CALIBRATION).length

// ── Lookups ──────────────────────────────────────────────────────────────────

function normalizeName(name = '') {
  return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

/**
 * Return the calibration entry for a classic by id or display name.
 * Returns null when not in the calibrated set (honest miss).
 */
export function getClassicTasteProfile(name) {
  if (!name) return null
  const key = normalizeName(name)
  if (CLASSIC_TASTE_CALIBRATION[key]) return CLASSIC_TASTE_CALIBRATION[key]
  // tolerate a few common aliases / accents
  const aliased = key
    .replace('pina', 'pina')
    .replace('whisky_sour', 'whiskey_sour')
  return CLASSIC_TASTE_CALIBRATION[aliased] || null
}

/**
 * Self-check: every calibration entry must validate against the schema.
 * Returns { ok, problems[] } — used by the foundation test.
 */
export function validateCalibrationSet() {
  const problems = []
  for (const [id, entry] of Object.entries(CLASSIC_TASTE_CALIBRATION)) {
    const { valid, errors } = validateTasteProfile(entry.taste_profile)
    if (!valid) problems.push({ id, errors })
    // every dimension must be present (calibration entries are fully specified)
    for (const dim of TASTE_DIMENSION_KEYS) {
      if (typeof entry.taste_profile[dim] !== 'number') {
        problems.push({ id, errors: [`missing dimension ${dim}`] })
      }
    }
  }
  return { ok: problems.length === 0, problems }
}
