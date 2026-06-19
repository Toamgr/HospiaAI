// F&B Menu Intelligence Snapshot Service — Phase 8F (read-only portfolio view).
//
// Reasons about a venue's CURRENT cocktail/beverage menu as a PORTFOLIO rather
// than as isolated cocktails. Answers: what does the menu contain, which spirits
// are over/under-represented, is the menu operationally heavy, is pricing data
// present, what data is missing, and what should a human review next.
//
// Doctrine: docs/architecture/FNB_MENU_INTELLIGENCE_SNAPSHOT_FOUNDATION.md
//           docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md
//
// HARD RULES (enforced by design):
//   - Pure read + deterministic compute. NEVER writes to any table.
//   - Dependency-injected db: every function receives `db` explicitly. This module
//     never imports the live database.
//   - No AI. No prompts. No network. No model calls. No generation.
//   - No Venue DNA mutation: no mergeVenueDna, no writes to venue_intelligence /
//     venue_briefs / venue_dna_enrichment / venue_intelligence_candidates.
//   - No DNA write path; no signal is ever escalated into Venue DNA.
//   - No Cocktail Lab / Event Builder imports.
//   - Honest about uncertainty: absent data → null / 'unknown' / available:false,
//     recorded in `_missing_fields`. NEVER fabricates POS, guest, inventory,
//     pricing, margin, or Venue DNA truth. No fake `{}` / `0` to imply known data.
//   - Every read is venue-scoped. Cocktails carry no venue_id of their own; the
//     venue anchor is menu membership (cocktails.menu_id → cocktail_menus.venue_id).
//
// `db` is a node:sqlite DatabaseSync handle (or any object exposing the same
// prepare().all()/get() interface — e.g. an in-memory DB in tests).

import { TASTE_DIMENSION_KEYS } from '../../domain/hospitality/bar/tasteProfileSchema.js'

// Tables this snapshot reads from (read-only). Reported in source.tables_used.
export const MENU_INTELLIGENCE_SOURCE_TABLES = Object.freeze(['cocktail_menus', 'cocktails'])

// Explicit, existing fields that may flag a zero-proof / non-alcoholic item.
// We only treat an item as zero-proof when an EXISTING field (category/tags/
// base_spirit) explicitly says so — never from the cocktail name alone.
const ZERO_PROOF_MARKERS = Object.freeze(['zero_proof', 'zero-proof', 'non_alcoholic', 'non-alcoholic', 'mocktail', 'na', 'alcohol_free', 'alcohol-free'])

// Existing fields that may classify a drink as a classic vs a signature.
const CLASSIC_MARKERS = Object.freeze(['classic', 'classics', 'standard'])
const SIGNATURE_MARKERS = Object.freeze(['signature', 'signatures', 'house', 'original', 'bespoke'])

// ── pure helpers ──────────────────────────────────────────────────────────────

function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0 }

function normStr(v) {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t === '' ? null : t
}

function lc(v) { const s = normStr(v); return s ? s.toLowerCase() : null }

function num(v) {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function parseJsonArray(v) {
  if (Array.isArray(v)) return v
  if (!isNonEmptyString(v)) return []
  try { const p = JSON.parse(v); return Array.isArray(p) ? p : [] } catch { return [] }
}

function parseJsonObject(v) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v
  if (!isNonEmptyString(v)) return null
  try { const p = JSON.parse(v); return (p && typeof p === 'object' && !Array.isArray(p)) ? p : null } catch { return null }
}

function round(n, dp = 2) {
  if (n === null || n === undefined || !Number.isFinite(n)) return null
  const f = 10 ** dp
  return Math.round(n * f) / f
}

// min/max/count over a list of numeric values (nulls ignored). null when empty.
function rangeOf(values) {
  const nums = values.map(num).filter(v => v !== null)
  if (!nums.length) return null
  return { min: round(Math.min(...nums)), max: round(Math.max(...nums)), count: nums.length }
}

// Count occurrences of a normalized key; null/blank rolls into `__unknown__`.
function tally(values) {
  const out = {}
  let unknown = 0
  for (const v of values) {
    const k = lc(v)
    if (!k) { unknown++; continue }
    out[k] = (out[k] || 0) + 1
  }
  return { counts: out, unknown }
}

// ── data access (read-only, venue-scoped) ──────────────────────────────────────

/**
 * Read the venue's menu items: cocktails that belong to one of the venue's menus.
 * Venue scope is enforced through cocktail_menus.venue_id (cocktails have none).
 * Returns a normalized item[] (never throws on a missing table — returns []).
 *
 * options.menuStatus (default 'active') filters cocktail_menus.status.
 */
export function readVenueMenuItems(db, venueId, options = {}) {
  if (!db || typeof db.prepare !== 'function') return []
  if (!isNonEmptyString(venueId)) return []
  const menuStatus = isNonEmptyString(options.menuStatus) ? options.menuStatus : 'active'

  let rows = []
  try {
    rows = db.prepare(`
      SELECT c.*
      FROM cocktails c
      JOIN cocktail_menus m ON c.menu_id = m.id
      WHERE m.venue_id = ? AND m.status = ? AND c.is_active = 1
      ORDER BY c.id ASC
    `).all(venueId, menuStatus)
  } catch {
    // Missing table / column in a stripped-down environment → no items (honest empty).
    return []
  }
  return rows.map(normalizeItem)
}

// Normalize a raw cocktails row into the shape the snapshot logic consumes.
// Optional/absent columns (taste, abv, operational, pricing) become null — never
// fabricated. SELECT c.* means columns that do not exist are simply undefined here.
function normalizeItem(raw) {
  const r = raw || {}
  return {
    id: r.id ?? null,
    name: normStr(r.name),
    category: normStr(r.category),
    base_spirit: normStr(r.base_spirit),
    glass_type: normStr(r.glass_type),
    garnish: normStr(r.garnish),
    method: normStr(r.method),
    tags: parseJsonArray(r.tags_json ?? r.tags),
    ingredients: parseJsonArray(r.ingredients_text_json ?? r.ingredients),
    menu_id: r.menu_id ?? null,
    // pricing (explicit, existing estimate fields only — never benchmark/invented)
    estimated_cost_ils: num(r.estimated_cost_ils),
    suggested_price_ils: num(r.suggested_price_ils),
    estimated_gp_percent: num(r.estimated_gp_percent),
    // optional decimal taste model + integer flavor model (absent on base schema)
    taste_profile: parseJsonObject(r.taste_profile_json ?? r.taste_profile),
    flavor_profile: parseJsonObject(r.flavor_profile_json ?? r.flavor_profile),
    abv: num(r.abv ?? r.proof_abv),
    // optional operational fields (absent on base schema)
    prep_complexity: normStr(r.prep_complexity),
    service_speed: normStr(r.service_speed),
    staff_execution: normStr(r.staff_execution),
  }
}

// ── coverage ────────────────────────────────────────────────────────────────

export function computeBaseSpiritCoverage(items) {
  const { counts, unknown } = tally(items.map(i => i.base_spirit))
  const known_total = items.length - unknown
  let overrepresented = null
  if (known_total >= 3) {
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    if (top) {
      const share = round(top[1] / known_total)
      if (share >= 0.6) overrepresented = { spirit: top[0], count: top[1], known_total, share }
    }
  }
  return { counts, unknown_base_spirit: unknown, distinct_known: Object.keys(counts).length, overrepresented }
}

export function computeFamilyCoverage(items) {
  const { counts, unknown } = tally(items.map(i => i.category))
  return { counts, unknown_category: unknown, distinct_known: Object.keys(counts).length }
}

function markerHit(item, markers) {
  const haystack = [lc(item.category), ...item.tags.map(lc)].filter(Boolean)
  return haystack.some(h => markers.some(m => h === m || h.includes(m)))
}

export function computeClassicsVsSignatures(items) {
  let classics = 0, signatures = 0, unknown = 0
  for (const it of items) {
    const isClassic = markerHit(it, CLASSIC_MARKERS)
    const isSignature = markerHit(it, SIGNATURE_MARKERS)
    if (isClassic && !isSignature) classics++
    else if (isSignature && !isClassic) signatures++
    else unknown++
  }
  // When nothing is classifiable, say so rather than implying a 0/0 balance.
  const available = (classics + signatures) > 0
  return { available, classics, signatures, unknown }
}

export function computeProofCoverage(items) {
  // Zero-proof: only from an explicit existing field (category/tags/base_spirit).
  let zeroProof = 0
  for (const it of items) {
    const markerHaystack = [lc(it.category), lc(it.base_spirit), ...it.tags.map(lc)].filter(Boolean)
    if (markerHaystack.some(h => ZERO_PROOF_MARKERS.includes(h))) zeroProof++
  }
  // Low-proof: only when an explicit ABV field exists. No ABV column → unavailable.
  const withAbv = items.filter(i => num(i.abv) !== null)
  const lowProofAvailable = withAbv.length > 0
  const lowProof = lowProofAvailable ? withAbv.filter(i => num(i.abv) > 0 && num(i.abv) <= 15).length : null

  return {
    low_proof: {
      available: lowProofAvailable,
      count: lowProof,
      items_with_abv: withAbv.length,
      note: lowProofAvailable ? null : 'No ABV/proof field on menu items — low-proof coverage cannot be assessed.',
    },
    zero_proof: {
      available: true, // we can always say whether an EXPLICIT marker is present
      count: zeroProof,
      basis: 'explicit_category_tag_or_base_spirit_marker',
      note: zeroProof === 0 ? 'No item carries an explicit zero-proof/mocktail marker (a marker may simply be unrecorded).' : null,
    },
  }
}

// ── taste / operational / pricing ──────────────────────────────────────────────

export function computeTasteDistribution(items) {
  const withTaste = items.filter(i => i.taste_profile && typeof i.taste_profile === 'object')
  const withFlavor = items.filter(i => i.flavor_profile && typeof i.flavor_profile === 'object')
  if (!withTaste.length) {
    return {
      available: false,
      dimensions: null,
      missing_profiles_count: items.length,
      flavor_model_present: withFlavor.length,
      notes: ['No per-cocktail decimal taste profiles stored on menu items — taste balance cannot be assessed without fabrication.'],
    }
  }
  // Decimal taste model only. Integer flavor model is kept separate (not merged).
  const dimensions = {}
  for (const key of TASTE_DIMENSION_KEYS) {
    const vals = withTaste.map(i => num(i.taste_profile[key])).filter(v => v !== null)
    if (vals.length) {
      dimensions[key] = {
        avg: round(vals.reduce((a, b) => a + b, 0) / vals.length),
        min: round(Math.min(...vals)),
        max: round(Math.max(...vals)),
        count: vals.length,
      }
    }
  }
  return {
    available: true,
    dimensions: Object.keys(dimensions).length ? dimensions : null,
    missing_profiles_count: items.length - withTaste.length,
    flavor_model_present: withFlavor.length,
    notes: ['Decimal taste model aggregated; integer flavor model (if any) reported separately, never merged.'],
  }
}

export function computeOperationalProfile(items) {
  const prep = tally(items.map(i => i.prep_complexity))
  const speed = tally(items.map(i => i.service_speed))
  const skill = tally(items.map(i => i.staff_execution))
  const missing = []
  if (prep.unknown === items.length) missing.push('prep_complexity')
  if (speed.unknown === items.length) missing.push('service_speed')
  if (skill.unknown === items.length) missing.push('staff_execution')

  // Staff-skill risks only from explicit high-complexity / high-skill counts.
  const staff_skill_risks = []
  const highPrep = (prep.counts.high || 0) + (prep.counts.complex || 0) + (prep.counts.expert || 0)
  if (highPrep > 0) {
    staff_skill_risks.push({ field: 'prep_complexity', high_count: highPrep, note: `${highPrep} item(s) flagged high prep complexity.` })
  }

  return {
    prep_complexity_distribution: prep.unknown === items.length ? null : prep.counts,
    service_speed_distribution: speed.unknown === items.length ? null : speed.counts,
    staff_execution_distribution: skill.unknown === items.length ? null : skill.counts,
    staff_skill_risks,
    missing_operational_fields: missing,
  }
}

export function computePricingProfile(items) {
  const price_range = rangeOf(items.map(i => i.suggested_price_ils))
  const cost_range = rangeOf(items.map(i => i.estimated_cost_ils))
  const margin_range = rangeOf(items.map(i => i.estimated_gp_percent))
  const missing = []
  if (!price_range) missing.push('suggested_price_ils')
  if (!cost_range) missing.push('estimated_cost_ils')
  if (!margin_range) missing.push('estimated_gp_percent')
  const available = !!(price_range || cost_range || margin_range)
  return {
    available,
    basis: available ? 'menu_item_estimate_fields' : null,
    price_range,
    cost_range,
    margin_range,
    missing_pricing_fields: missing,
    note: available
      ? 'Pricing reflects stored ESTIMATE fields, not verified POS/invoice truth.'
      : 'No price/cost/margin fields populated on menu items — pricing unavailable.',
  }
}

// ── risks (evidence-based only) ────────────────────────────────────────────────

function buildRisks(ctx) {
  const { items, spirits, taste, operational, pricing, proof, families } = ctx
  const risks = []
  const total = items.length

  if (total === 0) return risks // empty handled separately by the empty snapshot

  if (spirits.overrepresented) {
    const o = spirits.overrepresented
    risks.push({
      type: 'spirit_overconcentration',
      severity: o.share >= 0.8 ? 'high' : 'medium',
      evidence: `Base spirit "${o.spirit}" accounts for ${o.count}/${o.known_total} items with a known base spirit (${Math.round(o.share * 100)}%).`,
      recommendation: 'Review base-spirit balance; consider broadening the spirit range for menu variety.',
      confidence: o.known_total >= 5 ? 'medium' : 'low',
    })
  }

  if (spirits.unknown_base_spirit > 0 && spirits.unknown_base_spirit / total >= 0.3) {
    risks.push({
      type: 'missing_base_spirit_data',
      severity: 'low',
      evidence: `${spirits.unknown_base_spirit}/${total} items have no recorded base spirit.`,
      recommendation: 'Record a base spirit per cocktail to enable reliable spirit-coverage analysis.',
      confidence: 'high',
    })
  }

  if (families.distinct_known <= 1 && total >= 4) {
    risks.push({
      type: 'low_category_diversity',
      severity: 'low',
      evidence: families.distinct_known === 0
        ? `No cocktail category recorded across ${total} items.`
        : `All categorized items share a single category across ${total} items.`,
      recommendation: 'Confirm whether the menu intentionally targets one style, or add category variety.',
      confidence: families.distinct_known === 0 ? 'low' : 'medium',
    })
  }

  if (!taste.available) {
    risks.push({
      type: 'missing_taste_profiles',
      severity: 'medium',
      evidence: `${taste.missing_profiles_count}/${total} items have no decimal taste profile.`,
      recommendation: 'Capture per-cocktail taste profiles to assess sweetness/sourness/strength balance and similarity.',
      confidence: 'high',
    })
  }

  if (operational.missing_operational_fields.length) {
    risks.push({
      type: 'missing_operational_data',
      severity: 'low',
      evidence: `Operational fields missing for the whole menu: ${operational.missing_operational_fields.join(', ')}.`,
      recommendation: 'Capture prep complexity and service speed per cocktail to surface service-speed and staffing risks.',
      confidence: 'high',
    })
  } else if (operational.staff_skill_risks.length) {
    for (const s of operational.staff_skill_risks) {
      risks.push({
        type: 'staff_skill_load',
        severity: 'medium',
        evidence: s.note,
        recommendation: 'Confirm the bar team can execute high-complexity items at service speed.',
        confidence: 'medium',
      })
    }
  }

  if (!pricing.available) {
    risks.push({
      type: 'missing_pricing_data',
      severity: 'low',
      evidence: 'No price/cost/margin fields populated on any menu item.',
      recommendation: 'Enter cost/price estimates to enable margin orientation (verified POS truth still required for decisions).',
      confidence: 'high',
    })
  }

  if (total >= 3 && proof.zero_proof.count === 0) {
    risks.push({
      type: 'no_zero_proof_marker',
      severity: 'low',
      evidence: 'No menu item carries an explicit zero-proof / mocktail marker (a zero-proof option may exist but be unrecorded).',
      recommendation: 'Confirm whether a zero-proof / non-alcoholic option should be present and marked.',
      confidence: 'low',
    })
  }

  return risks
}

// ── confidence + human review ──────────────────────────────────────────────────

function buildConfidence(items, taste, operational, pricing, spirits, families) {
  const total = items.length
  const missing_data = []
  if (total === 0) {
    return { overall: 'low', reason: 'No active menu items for this venue.', missing_data: ['active_menu'] }
  }
  if (spirits.unknown_base_spirit > 0) missing_data.push('base_spirit')
  if (families.unknown_category > 0) missing_data.push('category')
  if (!taste.available) missing_data.push('taste_profiles')
  if (operational.missing_operational_fields.length) missing_data.push('operational_fields')
  if (!pricing.available) missing_data.push('pricing')

  const baseKnownShare = (total - spirits.unknown_base_spirit) / total
  const categoryKnownShare = (total - families.unknown_category) / total
  const structured = baseKnownShare >= 0.5 || categoryKnownShare >= 0.5

  let overall, reason
  if (taste.available && operational.missing_operational_fields.length === 0 && pricing.available && structured) {
    overall = 'high'
    reason = 'Menu items carry structured coverage, taste, operational, and pricing data.'
  } else if (structured) {
    overall = 'medium'
    reason = 'Menu structure (spirit/category) is largely recorded; taste/operational/pricing data is partial.'
  } else {
    overall = 'low'
    reason = 'Menu items carry little structured data; portfolio reasoning is limited.'
  }
  return { overall, reason, missing_data }
}

function buildHumanReview(taste, operational, pricing, spirits, proof, families, total) {
  const review = []
  if (spirits.overrepresented) review.push(`Review base-spirit balance — "${spirits.overrepresented.spirit}" dominates the menu.`)
  if (spirits.unknown_base_spirit > 0) review.push(`Set a base spirit for ${spirits.unknown_base_spirit} item(s) missing one.`)
  if (families.distinct_known <= 1 && total >= 4) review.push('Confirm whether the menu intentionally targets a single cocktail style.')
  if (!taste.available) review.push('Add per-cocktail taste profiles to enable balance and similarity analysis.')
  if (operational.missing_operational_fields.length) review.push('Capture prep complexity and service speed per cocktail.')
  if (!pricing.available) review.push('Enter cost/price estimates to enable margin orientation.')
  if (total >= 3 && proof.zero_proof.count === 0) review.push('Confirm whether a zero-proof / mocktail option should be on the menu.')
  return review
}

// ── main entry ──────────────────────────────────────────────────────────────

/**
 * Build the read-only F&B Menu Intelligence Snapshot for one venue.
 * Deterministic. Reads only; writes nothing. Returns the snapshot object.
 *
 * @param {object} db        node:sqlite-like handle (prepare().all()/get()).
 * @param {string} venueId   venue scope (required).
 * @param {object} [options] { menuStatus='active', now=ISO string }
 */
export function buildMenuIntelligenceSnapshot(db, venueId, options = {}) {
  const generated_at = isNonEmptyString(options.now) ? options.now : new Date().toISOString()
  const source = {
    type: 'read_only_menu_snapshot',
    tables_used: [...MENU_INTELLIGENCE_SOURCE_TABLES],
    ai_used: false,
    writes_performed: false,
  }

  if (!isNonEmptyString(venueId)) {
    return emptySnapshot(null, generated_at, source, ['venue_id'], ['No venue id supplied — cannot scope a menu snapshot.'])
  }

  const items = readVenueMenuItems(db, venueId, options)

  if (!items.length) {
    return emptySnapshot(venueId, generated_at, source, ['active_menu'],
      ['No active menu items found for this venue — nothing to analyze (not an error).'])
  }

  const spirits = computeBaseSpiritCoverage(items)
  const families = computeFamilyCoverage(items)
  const classicsVsSignatures = computeClassicsVsSignatures(items)
  const proof = computeProofCoverage(items)
  const taste = computeTasteDistribution(items)
  const operational = computeOperationalProfile(items)
  const pricing = computePricingProfile(items)

  const risks = buildRisks({ items, spirits, taste, operational, pricing, proof, families })
  const confidence = buildConfidence(items, taste, operational, pricing, spirits, families)
  const recommended_human_review = buildHumanReview(taste, operational, pricing, spirits, proof, families, items.length)

  const _missing_fields = []
  if (spirits.unknown_base_spirit > 0) _missing_fields.push(`base_spirit (${spirits.unknown_base_spirit} items)`)
  if (families.unknown_category > 0) _missing_fields.push(`category (${families.unknown_category} items)`)
  if (!taste.available) _missing_fields.push('taste_profile (all items)')
  for (const f of operational.missing_operational_fields) _missing_fields.push(`${f} (all items)`)
  for (const f of pricing.missing_pricing_fields) _missing_fields.push(f)
  if (!proof.low_proof.available) _missing_fields.push('abv/proof (all items)')

  const _assumptions = [
    'Menu scope = cocktails attached to this venue\'s active cocktail menus (cocktails carry no venue_id of their own).',
    'No POS/sales, guest, or inventory data is read — sales rank, guest taste, and stock levels are NOT inferred.',
    'Pricing fields are stored estimates, never verified POS/invoice truth.',
  ]

  return {
    venue_id: venueId,
    generated_at,
    source,
    confidence,
    menu: {
      total_items: items.length,
      active_items: items.length, // all read items are is_active = 1 by query
      item_ids: items.map(i => i.id),
      item_names: items.map(i => i.name),
    },
    coverage: {
      base_spirits: spirits,
      cocktail_families: families,
      classics_vs_signatures: classicsVsSignatures,
      low_proof: proof.low_proof,
      zero_proof: proof.zero_proof,
    },
    taste_distribution: taste,
    operational_profile: operational,
    pricing_profile: pricing,
    risks,
    recommended_human_review,
    _missing_fields,
    _assumptions,
  }
}

// Safe empty snapshot — never an error, just an honest "nothing to analyze yet".
function emptySnapshot(venueId, generated_at, source, missing_data, assumptions) {
  return {
    venue_id: venueId,
    generated_at,
    source,
    confidence: { overall: 'low', reason: 'No active menu items for this venue.', missing_data },
    menu: { total_items: 0, active_items: 0, item_ids: [], item_names: [] },
    coverage: {
      base_spirits: { counts: {}, unknown_base_spirit: 0, distinct_known: 0, overrepresented: null },
      cocktail_families: { counts: {}, unknown_category: 0, distinct_known: 0 },
      classics_vs_signatures: { available: false, classics: 0, signatures: 0, unknown: 0 },
      low_proof: { available: false, count: null, items_with_abv: 0, note: 'No menu items.' },
      zero_proof: { available: true, count: 0, basis: 'explicit_category_tag_or_base_spirit_marker', note: 'No menu items.' },
    },
    taste_distribution: { available: false, dimensions: null, missing_profiles_count: 0, flavor_model_present: 0, notes: ['No menu items.'] },
    operational_profile: {
      prep_complexity_distribution: null, service_speed_distribution: null,
      staff_execution_distribution: null, staff_skill_risks: [],
      missing_operational_fields: ['prep_complexity', 'service_speed', 'staff_execution'],
    },
    pricing_profile: {
      available: false, basis: null, price_range: null, cost_range: null, margin_range: null,
      missing_pricing_fields: ['suggested_price_ils', 'estimated_cost_ils', 'estimated_gp_percent'],
      note: 'No menu items — pricing unavailable.',
    },
    risks: [],
    recommended_human_review: ['Create or activate a cocktail menu so HESTIA can analyze the beverage portfolio.'],
    _missing_fields: ['active_menu'],
    _assumptions: assumptions,
  }
}
