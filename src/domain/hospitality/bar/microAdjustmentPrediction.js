// Micro Adjustment Prediction — likely taste effect of small recipe tweaks.
//
// Complements the existing deterministic cocktailAdjustmentUtils.js (which CHANGES
// ml and recomputes the integer flavor map AFTER the fact). This module is the
// PREDICTION side: given a small adjustment, what decimal-dimension shift should
// we expect BEFORE applying it. It does not mutate recipes and is not wired into
// the live slider yet.
//
// `predicted_delta` uses canonical 0.0–5.0 dimension keys with approximate signed
// deltas (in scale points) for a typical single-serve build. These are guidance
// magnitudes, not guarantees — actual effect depends on the base recipe.
//
// Pure data + lookup. No AI. No fabricated venue data.

import { TASTE_DIMENSION_KEYS } from './tasteProfileSchema.js'

export const MICRO_ADJUSTMENT_PREDICTIONS = Object.freeze({
  citrus_plus_2_5ml:    { label: '+2.5 ml citrus',      predicted_delta: { acidity: +0.4, sweetness: -0.1, aroma_intensity: +0.1 }, note: 'Brightens; can tip into sharp if sweetener not also nudged.' },
  citrus_minus_2_5ml:   { label: '−2.5 ml citrus',      predicted_delta: { acidity: -0.4, sweetness: +0.1 }, note: 'Rounder, less refreshing; risk of flabby/flat if over-reduced.' },
  syrup_plus_2_5ml:     { label: '+2.5 ml syrup',       predicted_delta: { sweetness: +0.4, body: +0.1, texture: +0.1, acidity: -0.1 }, note: 'Softens acid and adds body; over-use reads cloying.' },
  syrup_minus_2_5ml:    { label: '−2.5 ml syrup',       predicted_delta: { sweetness: -0.4, body: -0.1, acidity: +0.1 }, note: 'Drier, crisper; can expose harsh acid or spirit edges.' },
  modifier_plus_5ml:    { label: '+5 ml modifier (liqueur/vermouth/amaro)', predicted_delta: { aroma_intensity: +0.3, body: +0.2, bitterness: +0.2, sweetness: +0.2, finish_length: +0.2 }, note: 'Adds complexity and length; direction depends on the modifier (sweet vs bitter).' },
  modifier_minus_5ml:   { label: '−5 ml modifier',      predicted_delta: { aroma_intensity: -0.3, body: -0.2, finish_length: -0.2 }, note: 'Cleaner, more spirit-forward; can read thin or simplistic.' },
  bitters_plus_1_dash:  { label: '+1 dash bitters',     predicted_delta: { aroma_intensity: +0.4, bitterness: +0.2, finish_length: +0.1 }, note: 'Lifts aroma and seasons the finish; 3+ dashes can over-spice.' },
  saline_plus_1_3_drops:{ label: '+1–3 drops saline',   predicted_delta: { salinity: +0.4, sweetness: +0.2, bitterness: -0.2, aroma_intensity: +0.1 }, note: 'Amplifies perceived sweetness, suppresses bitterness; tiny doses only.' },
  more_dilution:        { label: 'More dilution',       predicted_delta: { body: -0.3, alcohol_heat: -0.3, acidity: -0.2, sweetness: -0.2, texture: -0.1, finish_length: -0.1 }, note: 'Lengthens and softens everything; over-dilution makes a drink watery.' },
  less_dilution:        { label: 'Less dilution',       predicted_delta: { body: +0.3, alcohol_heat: +0.3, acidity: +0.1, finish_length: +0.1 }, note: 'More intense and hot; under-dilution leaves a drink harsh/unintegrated.' },
  add_carbonation:      { label: 'Add/raise carbonation', predicted_delta: { texture: +0.4, body: -0.2, aroma_intensity: +0.1, alcohol_heat: -0.1 }, note: 'Effervescence lifts aroma and lightens body; dilutes intensity.' },
  reduce_carbonation:   { label: 'Reduce carbonation',  predicted_delta: { texture: -0.4, body: +0.1 }, note: 'Flatter, denser; loses lift and refreshment.' },
  acid_swap_softer:     { label: 'Acid swap → softer (e.g. lime→lemon, or add verjus)', predicted_delta: { acidity: -0.2, aroma_intensity: +0.1, finish_length: +0.1 }, note: 'Changes character of brightness, not just amount; rebalance sweetener.' },
  acid_swap_sharper:    { label: 'Acid swap → sharper (e.g. lemon→lime, add citric blend)', predicted_delta: { acidity: +0.3, aroma_intensity: +0.1 }, note: 'More aggressive brightness; can fight delicate aromatics.' },
  sweetener_swap_richer:{ label: 'Sweetener swap → richer (sugar→demerara/honey)', predicted_delta: { body: +0.2, aroma_intensity: +0.2, finish_length: +0.2, sweetness: +0.1 }, note: 'Adds depth/color and mouthfeel; can muddy clean/bright drinks.' },
  sweetener_swap_cleaner:{ label: 'Sweetener swap → cleaner (honey/demerara→simple/agave)', predicted_delta: { body: -0.2, aroma_intensity: -0.1 }, note: 'More neutral and crisp; loses character in spirit-forward builds.' },
})

export const MICRO_ADJUSTMENT_KEYS = Object.freeze(Object.keys(MICRO_ADJUSTMENT_PREDICTIONS))

/** Look up a single adjustment prediction by key. Returns null on miss. */
export function predictAdjustment(key) {
  if (!key) return null
  return MICRO_ADJUSTMENT_PREDICTIONS[String(key)] || null
}

/**
 * Predict the combined decimal-delta from several adjustments. Sums per-dimension
 * deltas and returns a partial profile of net shifts (only touched dimensions).
 * Does NOT clamp to an absolute profile — it returns deltas to apply to a base.
 */
export function predictCombinedDelta(keys = []) {
  const out = {}
  for (const k of Array.isArray(keys) ? keys : []) {
    const pred = predictAdjustment(k)
    if (!pred) continue
    for (const [dim, d] of Object.entries(pred.predicted_delta)) {
      if (!TASTE_DIMENSION_KEYS.includes(dim)) continue
      out[dim] = Math.round(((out[dim] || 0) + d) * 10) / 10
    }
  }
  return out
}

export { TASTE_DIMENSION_KEYS }
