// Venue Beverage Context Service — Venue Intelligence → Beverage Intelligence.
//
// Additive adapter. Accepts existing Venue DNA (venueDnaModel.js shape) and/or a
// venue profile record and returns a compact Beverage Intelligence context object
// plus a target taste-profile range derived from venue language.
//
// Design rules (matches the rest of venueBridge):
//   - Pure and deterministic. Safe to import from server.js and the frontend.
//   - Never fabricates venue data. Missing inputs → field is null AND recorded in
//     `_missing_fields`, with an explicit assumption in `_assumptions`.
//   - Produces a target taste RANGE, never a finished recipe. Not wired into
//     live generation yet — independently testable.
//
// The system is venue-AGNOSTIC by default: when venue type is unknown it says so
// rather than guessing a cuisine/style.

import { resolveVenueTasteTarget } from '../../domain/hospitality/bar/venueTasteProfileMap.js'
import { TASTE_DIMENSION_KEYS } from '../../domain/hospitality/bar/tasteProfileSchema.js'

// ── small helpers ───────────────────────────────────────────────────────────────

function clean(items) {
  if (Array.isArray(items)) return items.map(s => String(s).trim()).filter(Boolean)
  if (typeof items === 'string' && items.trim()) return [items.trim()]
  return []
}

function firstNonEmpty(...vals) {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return null
}

function summarize(items, max = 3) {
  const arr = clean(items)
  return arr.length ? arr.slice(0, max).join('; ') : null
}

const PRICE_KEYWORDS = [
  ['luxury', /\b(luxury|luxurious|opulent|ultra[- ]?premium|haute|fine dining|michelin)\b/i],
  ['premium', /\b(premium|upscale|high[- ]?end|elevated|boutique|craft)\b/i],
  ['mid-range', /\b(mid[- ]?range|casual|neighborhood|everyday|approachable|value)\b/i],
  ['budget', /\b(budget|cheap|low[- ]?cost|dive)\b/i],
]

function detectPricePositioning(haystack) {
  for (const [tier, re] of PRICE_KEYWORDS) if (re.test(haystack)) return tier
  return null
}

// ── main export ───────────────────────────────────────────────────────────────

/**
 * Build the venue beverage context.
 *
 * @param {object}  input
 * @param {object}  input.venueDNA      - venueDnaModel.js shape (signal arrays). Optional.
 * @param {object}  input.venueProfile  - venue record { name, venue_type/type, price_tier, ... }. Optional.
 * @returns {{ venue_beverage_context: object }}
 */
export function buildVenueBeverageContext({ venueDNA = null, venueProfile = null } = {}) {
  const dna = venueDNA && typeof venueDNA === 'object' ? venueDNA : {}
  const profile = venueProfile && typeof venueProfile === 'object' ? venueProfile : {}

  const missing_fields = []
  const assumptions = []

  // Aggregate all venue language into one haystack for archetype matching.
  const languageParts = [
    ...clean(dna.hospitalityStyle),
    ...clean(dna.businessTypeSignals),
    ...clean(dna.guestExperienceSignals),
    ...clean(dna.beverageSignals),
    ...clean(dna.foodSignals),
    ...clean(dna.serviceSignals),
    ...clean(dna.ownerPriorities),
    ...clean(dna.emotionalDrivers),
    ...clean(dna.growthOpportunities),
    typeof dna.summary === 'string' ? dna.summary : '',
    firstNonEmpty(profile.venue_type, profile.type, profile.category) || '',
    firstNonEmpty(profile.price_tier, profile.priceTier) || '',
    firstNonEmpty(profile.name) || '',
    firstNonEmpty(profile.concept, profile.vibe) || '',
  ]
  const haystack = languageParts.join(' ').toLowerCase()

  const tasteResolution = resolveVenueTasteTarget(haystack)

  // ── venue_type ────────────────────────────────────────────────────────────
  let venue_type = firstNonEmpty(profile.venue_type, profile.type, profile.category)
  if (!venue_type) {
    const bizSignal = summarize(dna.businessTypeSignals, 1)
    if (bizSignal) {
      venue_type = bizSignal
    } else {
      venue_type = null
      missing_fields.push('venue_type')
      assumptions.push('venue_type unknown — staying venue-agnostic; no cuisine/style assumed.')
    }
  }

  // ── owner_belief_summary ──────────────────────────────────────────────────
  const owner_belief_summary = summarize(dna.ownerPriorities, 3)
    || (typeof dna.summary === 'string' && dna.summary.trim() ? dna.summary.trim() : null)
  if (!owner_belief_summary) {
    missing_fields.push('owner_belief_summary')
    assumptions.push('No owner priorities captured — beverage direction not yet anchored to owner belief.')
  }

  // ── emotional_register ────────────────────────────────────────────────────
  let emotional_register = summarize(dna.emotionalDrivers, 3)
  if (!emotional_register && tasteResolution.matched.length) {
    emotional_register = tasteResolution.matched.map(m => m.emotional_register).join('; ')
    assumptions.push('emotional_register inferred from matched venue archetype(s), not explicit owner words.')
  }
  if (!emotional_register) {
    emotional_register = null
    missing_fields.push('emotional_register')
    assumptions.push('No emotional drivers captured — register unknown.')
  }

  // ── target_guest_summary ──────────────────────────────────────────────────
  const target_guest_summary = summarize(dna.guestExperienceSignals, 3)
  if (!target_guest_summary) {
    missing_fields.push('target_guest_summary')
    assumptions.push('No guest-experience signals captured — target guest unknown.')
  }

  // ── price_positioning ─────────────────────────────────────────────────────
  let price_positioning = firstNonEmpty(profile.price_tier, profile.priceTier)
  if (!price_positioning) {
    price_positioning = detectPricePositioning(haystack)
    if (price_positioning) {
      assumptions.push(`price_positioning "${price_positioning}" inferred from venue language, not a set price tier.`)
    } else {
      price_positioning = null
      missing_fields.push('price_positioning')
      assumptions.push('No price tier set or implied — positioning unknown.')
    }
  }

  // ── service_style ─────────────────────────────────────────────────────────
  const service_style = summarize(dna.serviceSignals, 3)
  if (!service_style) {
    missing_fields.push('service_style')
    assumptions.push('No service signals captured — service style unknown.')
  }

  // ── operational_constraints ───────────────────────────────────────────────
  const operational_constraints = clean(dna.operationalPainPoints)
  if (!operational_constraints.length) {
    missing_fields.push('operational_constraints')
    assumptions.push('No operational pain points captured — assuming standard bar constraints until learned.')
  }

  // ── recommended_beverage_direction ────────────────────────────────────────
  let recommended_beverage_direction
  if (tasteResolution.beverage_directions.length) {
    recommended_beverage_direction = tasteResolution.beverage_directions.join(' ')
  } else {
    const bevSignal = summarize(dna.beverageSignals, 3)
    if (bevSignal) {
      recommended_beverage_direction = `Follow captured beverage signals: ${bevSignal}.`
      assumptions.push('Beverage direction taken from raw beverage signals — no venue archetype matched.')
    } else {
      recommended_beverage_direction = null
      missing_fields.push('recommended_beverage_direction')
      assumptions.push('No venue archetype matched and no beverage signals — direction undetermined; keep menu venue-agnostic and ask for venue DNA.')
    }
  }

  // ── explanation_basis (for on-demand "why this profile / why this drink") ──
  const explanation_basis = {
    matched_archetypes: tasteResolution.matched.map(m => ({ key: m.key, label: m.label })),
    matched_keywords: tasteResolution.matched_keywords,
    signals_used: {
      hospitalityStyle: clean(dna.hospitalityStyle),
      ownerPriorities: clean(dna.ownerPriorities),
      emotionalDrivers: clean(dna.emotionalDrivers),
      beverageSignals: clean(dna.beverageSignals),
      guestExperienceSignals: clean(dna.guestExperienceSignals),
    },
    confidence: dna.confidence && typeof dna.confidence === 'object' ? dna.confidence : null,
    data_basis: tasteResolution.matched.length
      ? 'venue_dna_archetype_match'
      : (haystack.trim() ? 'partial_venue_signals_only' : 'no_venue_data'),
  }

  return {
    venue_beverage_context: {
      venue_type,
      owner_belief_summary,
      emotional_register,
      target_guest_summary,
      price_positioning,
      service_style,
      operational_constraints,
      target_taste_profile_range: tasteResolution.target_taste_profile_range,
      recommended_beverage_direction,
      explanation_basis,
      _missing_fields: missing_fields,
      _assumptions: assumptions,
    },
  }
}

// ── Prompt formatting ───────────────────────────────────────────────────────────

/** Compact "min–max" for a single range cell, or null when absent. */
function fmtRange(cell) {
  if (!cell || typeof cell !== 'object' || cell.min == null || cell.max == null) return null
  return `${cell.min}–${cell.max}`
}

/**
 * Render a SHORT, stable prompt block from a venue beverage context. Accepts
 * either the wrapper ({ venue_beverage_context }) or the inner object.
 *
 * Returns '' when there is no real venue signal — so a flag-on call with empty
 * venue data injects nothing and behaves exactly as before. Only the agreed
 * compact fields are included; no full tables, no chain-of-thought, no fabricated
 * data. Missing fields / assumptions are summarized concisely (capped).
 */
export function formatVenueBeveragePromptBlock(context) {
  const c = context && context.venue_beverage_context ? context.venue_beverage_context : context
  if (!c || typeof c !== 'object') return ''

  const rangeDims = TASTE_DIMENSION_KEYS
    .map(k => { const r = fmtRange(c.target_taste_profile_range?.[k]); return r ? `${k} ${r}` : null })
    .filter(Boolean)

  const archetypes = Array.isArray(c.explanation_basis?.matched_archetypes)
    ? c.explanation_basis.matched_archetypes.map(a => a.label).filter(Boolean)
    : []

  // "Real signal" gate: at least one populated field, a target range, or a match.
  const hasSignal = Boolean(
    c.venue_type || c.emotional_register || c.price_positioning || c.service_style ||
    c.target_guest_summary || c.recommended_beverage_direction ||
    (Array.isArray(c.operational_constraints) && c.operational_constraints.length) ||
    rangeDims.length || archetypes.length
  )
  if (!hasSignal) return ''

  const constraints = Array.isArray(c.operational_constraints) && c.operational_constraints.length
    ? c.operational_constraints.slice(0, 3).join('; ')
    : null
  const missing = Array.isArray(c._missing_fields) && c._missing_fields.length
    ? c._missing_fields.slice(0, 6).join(', ')
    : null
  const assumptions = Array.isArray(c._assumptions) && c._assumptions.length
    ? c._assumptions.slice(0, 2).join(' ')
    : null

  const lines = [
    'Venue beverage context (use to make better first-pass recipe choices; do NOT show the guest a technical taste-profile explanation by default):',
    c.venue_type ? `- Venue type: ${c.venue_type}` : null,
    c.price_positioning ? `- Price positioning: ${c.price_positioning}` : null,
    c.emotional_register ? `- Emotional register: ${c.emotional_register}` : null,
    c.target_guest_summary ? `- Target guest: ${c.target_guest_summary}` : null,
    c.service_style ? `- Service style: ${c.service_style}` : null,
    constraints ? `- Operational constraints: ${constraints}` : null,
    c.recommended_beverage_direction ? `- Recommended beverage direction: ${c.recommended_beverage_direction}` : null,
    rangeDims.length ? `- Target taste profile range (0.0–5.0, only where known): ${rangeDims.join(', ')}` : null,
    archetypes.length ? `- Basis: matched venue archetype(s) ${archetypes.join(', ')} (${c.explanation_basis?.data_basis || 'venue_signals'})` : null,
    missing ? `- Unknown (do not invent): ${missing}` : null,
    assumptions ? `- Assumptions in effect: ${assumptions}` : null,
  ].filter(Boolean)

  return lines.join('\n')
}

// ── Slim taste-target block for the venue-aware CI/Omer path (Phase 5) ───────────
//
// Emits ONLY the decimal target_taste_profile_range (and an optional one-line
// beverage direction). It deliberately does NOT repeat venue identity / price /
// guest / service — the Omer context block already carries those, so reusing the
// full formatVenueBeveragePromptBlock here would duplicate and bloat the prompt.
//
// `range` is a per-dimension { min, max } object (0.0–5.0). Absent dimensions are
// omitted (never fake-zeroed). Returns '' when no dimension is present.
// Output is capped (~600 chars) to protect prompt size.

const TASTE_TARGET_BLOCK_MAX_CHARS = 600

export function formatTasteTargetPromptBlock(range, opts = {}) {
  if (!range || typeof range !== 'object') return ''
  const dims = TASTE_DIMENSION_KEYS
    .map(k => { const r = fmtRange(range[k]); return r ? `${k} ${r}` : null })
    .filter(Boolean)
  if (!dims.length) return ''

  const direction = typeof opts.direction === 'string' && opts.direction.trim()
    ? opts.direction.trim()
    : null

  const lines = [
    'Venue taste target (0.0–5.0, one-decimal; only where known — do NOT invent missing dimensions; do NOT return a taste profile in the output):',
    `- Target taste range: ${dims.join(', ')}`,
    direction ? `- Beverage direction: ${direction.length > 240 ? direction.slice(0, 240) + '…' : direction}` : null,
  ].filter(Boolean)

  let block = lines.join('\n')
  if (block.length > TASTE_TARGET_BLOCK_MAX_CHARS) {
    // Hard cap: keep the range line; drop the (optional) direction line if oversized.
    block = lines[0] + '\n' + lines[1]
    if (block.length > TASTE_TARGET_BLOCK_MAX_CHARS) block = block.slice(0, TASTE_TARGET_BLOCK_MAX_CHARS)
  }
  return block
}

/**
 * Resolve a compact target taste range for the CI/Omer path from real venue inputs.
 * Reuses buildVenueBeverageContext (no new resolution logic, no new engine).
 * Returns { range, dimensions, direction } when at least one dimension resolves,
 * else null (never fabricates a range). Read-only; mutates nothing.
 */
export function resolveCiTasteTarget({ venueDNA = null, venueProfile = null } = {}) {
  if (!venueDNA && !venueProfile) return null
  const ctx = buildVenueBeverageContext({ venueDNA, venueProfile }).venue_beverage_context
  const range = ctx.target_taste_profile_range || {}
  const dimensions = TASTE_DIMENSION_KEYS.filter(k => range[k] && range[k].min != null && range[k].max != null)
  if (!dimensions.length) return null
  return {
    range,
    dimensions,
    direction: typeof ctx.recommended_beverage_direction === 'string' ? ctx.recommended_beverage_direction : null,
  }
}
