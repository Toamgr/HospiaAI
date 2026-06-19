// Decimal Taste Profile System — HESTIA Beverage Intelligence foundation layer.
//
// Canonical 10-dimension taste vector scored on a 0.0–5.0 scale with ONE decimal
// of precision. This is the target taste representation for Venue-aware Beverage
// Intelligence. It is intentionally separate from — and does NOT replace — the
// existing recipe-derived integer flavor map (cocktailFlavorProfileUtils.js) or
// the event flavor_map. Nothing here is wired into live generation yet.
//
// Pure, deterministic, no fabricated data. Missing dimensions are `null`, never 0.

export const TASTE_PROFILE_LABEL = 'Decimal taste profile (0.0–5.0, one-decimal precision)'

export const TASTE_SCALE = Object.freeze({
  min: 0.0,
  max: 5.0,
  precision: 1, // one decimal place — NEVER integer-only
})

// The ten canonical dimensions, in canonical display order.
// `key` matches the agreed contract exactly (see audit §11).
export const TASTE_DIMENSIONS = Object.freeze([
  { key: 'acidity',         label: 'Acidity',         description: 'Tart/sour brightness from citrus, shrubs, verjus, wine acids.' },
  { key: 'sweetness',       label: 'Sweetness',       description: 'Perceived sugar from syrups, liqueurs, fruit, fortified wine.' },
  { key: 'bitterness',      label: 'Bitterness',      description: 'Amaro, Campari, vermouth, bitters, gentian, hop, pith.' },
  { key: 'salinity',        label: 'Salinity',        description: 'Saline, brine, sea-salt rim, miso — savoury balance enhancer.' },
  { key: 'umami',           label: 'Umami',           description: 'Savoury depth from miso, seaweed, mushroom, soy, dashi, tomato.' },
  { key: 'aroma_intensity', label: 'Aroma intensity', description: 'Strength of the nose — botanicals, smoke, florals, expressed oils.' },
  { key: 'body',            label: 'Body',            description: 'Weight/mass on the palate — spirit load, sugar, fat, viscosity.' },
  { key: 'texture',         label: 'Texture',         description: 'Mouthfeel — silky/foamy/effervescent/astringent/oily.' },
  { key: 'finish_length',   label: 'Finish length',   description: 'How long flavour persists after the sip.' },
  { key: 'alcohol_heat',    label: 'Alcohol heat',    description: 'Perceived ethanol warmth/burn after dilution.' },
])

export const TASTE_DIMENSION_KEYS = Object.freeze(TASTE_DIMENSIONS.map(d => d.key))

// ── Numeric helpers ────────────────────────────────────────────────────────────

/**
 * Round to one decimal place. Deliberately one-decimal (not integer) so the
 * system can represent precision like 4.3 / 2.1 / 0.8.
 */
export function roundToOneDecimal(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.round(n * 10) / 10
}

/**
 * Clamp a single taste score into [0.0, 5.0] at one-decimal precision.
 * Returns null for non-numeric input (honest "unknown", not a fake 0).
 */
export function clampTasteScore(value) {
  const n = roundToOneDecimal(value)
  if (n === null) return null
  return Math.min(TASTE_SCALE.max, Math.max(TASTE_SCALE.min, n))
}

/**
 * True when v is a number within [0.0, 5.0]. (null/unknown is NOT valid as a
 * score but is allowed as an "absent dimension" by isValidTasteProfile.)
 */
export function isValidTasteScore(value) {
  return typeof value === 'number'
    && Number.isFinite(value)
    && value >= TASTE_SCALE.min
    && value <= TASTE_SCALE.max
}

// ── Profile builders / validators ───────────────────────────────────────────────

/**
 * An empty profile: every dimension present as a key, value null (unknown).
 * Honest by default — no fabricated zeros.
 */
export function emptyTasteProfile() {
  const out = {}
  for (const key of TASTE_DIMENSION_KEYS) out[key] = null
  return out
}

/**
 * Build a normalized taste profile from a partial input.
 * - Only the ten canonical keys are kept.
 * - Provided values are clamped to [0,5] at one decimal.
 * - Missing/invalid dimensions become null (unknown), never 0.
 */
export function createTasteProfile(partial = {}) {
  const out = emptyTasteProfile()
  if (!partial || typeof partial !== 'object') return out
  for (const key of TASTE_DIMENSION_KEYS) {
    if (key in partial && partial[key] !== null && partial[key] !== undefined) {
      out[key] = clampTasteScore(partial[key])
    }
  }
  return out
}

/**
 * Validate a profile shape: every PRESENT (non-null) dimension must be a number
 * within [0,5]. null dimensions are permitted (they mean "unknown"). Unknown
 * extra keys are ignored. Returns { valid, errors[] }.
 */
export function validateTasteProfile(profile) {
  const errors = []
  if (!profile || typeof profile !== 'object') {
    return { valid: false, errors: ['profile is not an object'] }
  }
  for (const key of TASTE_DIMENSION_KEYS) {
    const v = profile[key]
    if (v === null || v === undefined) continue // unknown dimension is allowed
    if (!isValidTasteScore(v)) {
      errors.push(`${key}=${v} is outside the 0.0–5.0 scale or not a number`)
    }
  }
  return { valid: errors.length === 0, errors }
}

// ── Range helpers (used by Venue DNA → target profile mapping) ───────────────────

/**
 * A target range is { min, max } per dimension, each on the 0.0–5.0 scale.
 * Merge multiple ranges by intersecting where they overlap, otherwise widening
 * to the union so we never produce an empty/contradictory range. Returns a
 * per-dimension { min, max } object; dimensions absent from all inputs are null.
 */
export function mergeTasteRanges(ranges = []) {
  const valid = (Array.isArray(ranges) ? ranges : []).filter(r => r && typeof r === 'object')
  const out = {}
  for (const key of TASTE_DIMENSION_KEYS) {
    const present = valid.map(r => r[key]).filter(r => r && typeof r === 'object')
    if (!present.length) { out[key] = null; continue }
    let lo = Math.max(...present.map(r => clampTasteScore(r.min) ?? TASTE_SCALE.min))
    let hi = Math.min(...present.map(r => clampTasteScore(r.max) ?? TASTE_SCALE.max))
    if (lo > hi) {
      // Contradictory inputs — widen to the union rather than invent a point.
      lo = Math.min(...present.map(r => clampTasteScore(r.min) ?? TASTE_SCALE.min))
      hi = Math.max(...present.map(r => clampTasteScore(r.max) ?? TASTE_SCALE.max))
    }
    out[key] = { min: roundToOneDecimal(lo), max: roundToOneDecimal(hi) }
  }
  return out
}

/** Midpoint profile of a per-dimension range — useful as a single target vector. */
export function rangeMidpointProfile(range = {}) {
  const out = emptyTasteProfile()
  for (const key of TASTE_DIMENSION_KEYS) {
    const r = range[key]
    if (r && typeof r === 'object' && r.min != null && r.max != null) {
      out[key] = roundToOneDecimal((Number(r.min) + Number(r.max)) / 2)
    }
  }
  return out
}
