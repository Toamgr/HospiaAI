// Venue DNA Taxonomy ↔ 9C Completeness Crosswalk — Phase 9E-3C-0 (foundation only).
//
// A PURE, READ-ONLY mapping module. It declares the deterministic conceptual
// crosswalk between:
//   1. the 16 SHIPPED 9C completeness dimensions
//      (src/services/venueIntelligence/venueDnaCompletenessEvaluator.js), and
//   2. the 35-dimension Venue DNA taxonomy
//      (src/services/venueIntelligence/venueDnaTaxonomy.js).
//
// It lets future code reason about conceptual overlap between the two layers
// WITHOUT importing the taxonomy into the live 9C runtime yet. This module is NOT
// wired into any route, hook, component, or service. It changes no live behavior.
//
// Source of truth: docs/architecture/VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md §13
//                  (Relationship to Existing 9C Completeness Model).
//
// DOCTRINE (do not violate):
//   • The crosswalk is a structural map, NOT truth. It never upgrades a dimension's
//     status. A taxonomy dimension with trackedToday 'no' or 'partial' is reported
//     honestly; the crosswalk can only ever LOWER a projected status for honesty,
//     never raise it.
//   • Confirmation is a 9D governance event. This module never asserts `confirmed`
//     and never changes `unlock_readiness` (always false).
//   • 9C-only dimensions (event_identity) and taxonomy-only dimensions are listed
//     explicitly. Nothing is silently dropped or silently invented.
//
// HARD GUARANTEES (enforced by scripts/test-venue-dna-taxonomy-crosswalk.js):
//   • Pure: no DB, no network, no AI, no writes, no API keys.
//   • Imports ONLY the pure taxonomy constants. No server import, no reference to
//     the canonical Venue DNA writer, no live evaluator coupling at module load.
//   • Getters return deep copies, so callers can never mutate the canonical data.
//   • Embeds NO venue facts — only structural definitions.

import {
  listVenueDnaDimensionIds,
  getVenueDnaDimension,
  validateVenueDnaDimensionId,
} from './venueDnaTaxonomy.js'

// Stable identifier for this crosswalk revision. Bump on any structural change.
export const VENUE_DNA_CROSSWALK_VERSION = '9E-3C-0.1'

// ── Mapping types ────────────────────────────────────────────────────────────────
export const CROSSWALK_MAPPING_TYPES = Object.freeze({
  exact: 'Same key string on both sides — identical concept.',
  renamed: 'Same concept, different key (1:1 rename).',
  overlapping: 'Related concepts that intersect but are not identical (1:1).',
  split: 'One 9C dimension corresponds to several taxonomy dimensions (1:many).',
  live_only: 'A shipped 9C dimension with no taxonomy equivalent (no invented target).',
  taxonomy_only: 'A taxonomy dimension with no shipped 9C counterpart.',
})

const MAPPING_TYPE_KEYS = Object.freeze(Object.keys(CROSSWALK_MAPPING_TYPES))

// ── The 16 shipped 9C completeness keys → taxonomy keys ───────────────────────────
// `completenessKey` values are the ACTUAL keys from VENUE_DNA_COMPLETENESS_DIMENSIONS
// in the live evaluator (their exact set/order is asserted by the test, so any drift
// in the evaluator breaks the test loudly instead of silently mismatching).
const COMPLETENESS_TO_TAXONOMY = [
  { completenessKey: 'venue_identity',         taxonomyKeys: ['venue_identity'],                                   mappingType: 'exact',       note: 'Identical key and concept.' },
  { completenessKey: 'owner_intent',           taxonomyKeys: ['owner_intent'],                                     mappingType: 'exact',       note: 'Identical key and concept.' },
  { completenessKey: 'service_philosophy',     taxonomyKeys: ['service_philosophy'],                               mappingType: 'exact',       note: 'Identical key and concept.' },
  { completenessKey: 'non_negotiables',        taxonomyKeys: ['non_negotiables'],                                  mappingType: 'exact',       note: 'Identical key and concept.' },
  { completenessKey: 'beverage_identity',      taxonomyKeys: ['beverage_identity'],                                mappingType: 'exact',       note: 'Identical key and concept.' },
  { completenessKey: 'brand_language',         taxonomyKeys: ['brand_language'],                                   mappingType: 'exact',       note: 'Identical key and concept.' },
  { completenessKey: 'target_guests',          taxonomyKeys: ['target_guest_segments'],                            mappingType: 'renamed',     note: 'Same concept; taxonomy uses the fuller key name.' },
  { completenessKey: 'what_venue_is_not',      taxonomyKeys: ['what_venue_must_never_become'],                     mappingType: 'renamed',     note: 'Same concept; taxonomy uses the fuller key name.' },
  { completenessKey: 'emotional_atmosphere',   taxonomyKeys: ['emotional_promise'],                                mappingType: 'overlapping', note: 'Atmosphere (9C) and the named emotional promise (taxonomy) intersect but are not identical.' },
  { completenessKey: 'hospitality_promise',    taxonomyKeys: ['hospitality_philosophy'],                           mappingType: 'overlapping', note: 'A promise to guests vs the stated belief system of hosting — related, not identical.' },
  { completenessKey: 'food_identity',          taxonomyKeys: ['fnb_identity'],                                     mappingType: 'overlapping', note: '9C tracks food separately; the taxonomy combines food + beverage into one F&B identity.' },
  { completenessKey: 'operational_constraints', taxonomyKeys: ['operational_pain_points', 'operational_constraints'], mappingType: 'split',      note: 'The single 9C dimension spans both recurring pain (foundation) and structural limits (module-specific) in the taxonomy.' },
  { completenessKey: 'team_service_style',     taxonomyKeys: ['staff_behavior_standards', 'training_philosophy'],  mappingType: 'split',       note: 'Team/service style (9C) covers both behaviour standards and training approach in the taxonomy.' },
  { completenessKey: 'growth_opportunities',   taxonomyKeys: ['growth_ambition'],                                  mappingType: 'overlapping', note: 'External opportunity (9C) vs owner-stated ambition/upside (taxonomy) — related, not identical.' },
  { completenessKey: 'risk_drift',             taxonomyKeys: ['identity_drift_risks'],                             mappingType: 'overlapping', note: 'Both are the derived drift surface; surfaced for review, never auto-applied.' },
  { completenessKey: 'event_identity',         taxonomyKeys: [],                                                   mappingType: 'live_only',    note: 'No taxonomy equivalent. Not mapped — no invented target.' },
]

// ── 9C status → conservative taxonomy-view status ─────────────────────────────────
// `confirmed` is deliberately NOT a reachable target: confirmation is a 9D
// governance event and this crosswalk must never assert it.
const NINE_C_STATUS_TO_TAXONOMY = Object.freeze({
  missing: 'not_asked',
  partial: 'partial',
  unclear: 'needs_precision',
  answered: 'answered',
  needs_confirmation: 'needs_owner_confirmation',
  confirmed: 'needs_owner_confirmation', // downgraded on purpose — never assert confirmed here
  contradicted: 'contradicted',
})

// Statuses that imply confident coverage; not permitted when storage is partial.
const CONFIDENT_STATUSES = Object.freeze(['answered', 'needs_owner_confirmation'])

// ── Internal helpers ─────────────────────────────────────────────────────────────
function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

const LIVE_KEYS = Object.freeze(COMPLETENESS_TO_TAXONOMY.map(m => m.completenessKey))
const MAPPING_BY_LIVE_KEY = new Map(COMPLETENESS_TO_TAXONOMY.map(m => [m.completenessKey, m]))

// Every taxonomy key referenced by at least one 9C mapping (the "covered" set).
const MAPPED_TAXONOMY_KEYS = Object.freeze(
  [...new Set(COMPLETENESS_TO_TAXONOMY.flatMap(m => m.taxonomyKeys))]
)
const MAPPED_TAXONOMY_KEY_SET = new Set(MAPPED_TAXONOMY_KEYS)

// Reverse index: taxonomy key → [9C keys that map onto it].
const COMPLETENESS_KEYS_BY_TAXONOMY = (() => {
  const out = new Map()
  for (const m of COMPLETENESS_TO_TAXONOMY) {
    for (const t of m.taxonomyKeys) {
      if (!out.has(t)) out.set(t, [])
      out.get(t).push(m.completenessKey)
    }
  }
  return out
})()

// Taxonomy-only = every taxonomy dimension not covered by any 9C mapping.
// Derived from the live taxonomy constants so the set cannot silently drift.
const TAXONOMY_ONLY_KEYS = Object.freeze(
  listVenueDnaDimensionIds().filter(id => !MAPPED_TAXONOMY_KEY_SET.has(id))
)

// 9C-only = mappings with no taxonomy target.
const COMPLETENESS_ONLY_KEYS = Object.freeze(
  COMPLETENESS_TO_TAXONOMY.filter(m => m.taxonomyKeys.length === 0).map(m => m.completenessKey)
)

// Honest storage detail for a taxonomy key (trackedToday: 'yes' | 'partial' | 'no').
function trackedTodayFor(taxonomyKey) {
  const dim = getVenueDnaDimension(taxonomyKey)
  return dim ? dim.trackedToday : null
}

function taxonomyKeyDetails(taxonomyKeys) {
  return taxonomyKeys.map(key => {
    const dim = getVenueDnaDimension(key)
    return {
      key,
      category: dim ? dim.category : null,
      tier: dim ? dim.tier : null,
      trackedToday: dim ? dim.trackedToday : null,
    }
  })
}

// Conservative status projection. Can only LOWER a status for honesty, never raise.
function projectStatus(nineCStatus, trackedToday) {
  let status = NINE_C_STATUS_TO_TAXONOMY[nineCStatus] || 'not_asked'
  let storageClamped = nineCStatus === 'confirmed' // confirmed was downgraded above

  if (trackedToday === 'no') {
    // No clean storage to project from — report honestly, never as understood.
    return { projectedStatus: 'not_tracked', storageClamped: true }
  }
  if (trackedToday === 'partial') {
    // Blended-only storage can never read as confidently covered.
    if (CONFIDENT_STATUSES.includes(status)) {
      status = 'partial'
      storageClamped = true
    }
  }
  return { projectedStatus: status, storageClamped }
}

// ── Public API (pure, deterministic, read-only) ──────────────────────────────────

/**
 * Full crosswalk snapshot (deep-copied): mapping table, type definitions, the
 * live/taxonomy-only/9C-only sets, per-taxonomy storage honesty, and counts.
 */
export function getVenueDnaTaxonomyCrosswalk() {
  return clone({
    version: VENUE_DNA_CROSSWALK_VERSION,
    mappingTypes: CROSSWALK_MAPPING_TYPES,
    liveCompletenessKeys: LIVE_KEYS,
    mappings: COMPLETENESS_TO_TAXONOMY.map(m => ({
      completenessKey: m.completenessKey,
      taxonomyKeys: m.taxonomyKeys,
      mappingType: m.mappingType,
      note: m.note,
      taxonomyKeyDetails: taxonomyKeyDetails(m.taxonomyKeys),
    })),
    completenessOnly: COMPLETENESS_ONLY_KEYS.map(key => ({
      completenessKey: key,
      mappingType: 'live_only',
      note: MAPPING_BY_LIVE_KEY.get(key)?.note || '',
    })),
    taxonomyOnly: TAXONOMY_ONLY_KEYS.map(key => {
      const dim = getVenueDnaDimension(key)
      return {
        taxonomyKey: key,
        mappingType: 'taxonomy_only',
        category: dim ? dim.category : null,
        tier: dim ? dim.tier : null,
        trackedToday: dim ? dim.trackedToday : null,
      }
    }),
    counts: {
      liveCompletenessKeys: LIVE_KEYS.length,
      mappedTaxonomyKeys: MAPPED_TAXONOMY_KEYS.length,
      taxonomyOnly: TAXONOMY_ONLY_KEYS.length,
      completenessOnly: COMPLETENESS_ONLY_KEYS.length,
    },
  })
}

/**
 * The 16 shipped 9C completeness keys (canonical order).
 */
export function listLiveCompletenessKeys() {
  return [...LIVE_KEYS]
}

/**
 * Taxonomy keys a given 9C key maps to (deep-copied). Returns [] for a live-only
 * key (e.g. event_identity) and null for an unknown key.
 */
export function getTaxonomyKeysForCompletenessKey(key) {
  const m = MAPPING_BY_LIVE_KEY.get(key)
  return m ? [...m.taxonomyKeys] : null
}

/**
 * 9C completeness keys that map onto a given taxonomy key (deep-copied). Returns []
 * for a taxonomy-only key and null for an unknown taxonomy key.
 */
export function getCompletenessKeysForTaxonomyKey(taxonomyKey) {
  if (!validateVenueDnaDimensionId(taxonomyKey)) return null
  const hits = COMPLETENESS_KEYS_BY_TAXONOMY.get(taxonomyKey)
  return hits ? [...hits] : []
}

/**
 * Full mapping record for one 9C key (deep-copied), including mapping type, the
 * taxonomy targets, and each target's honest storage status. Null for unknown keys.
 */
export function describeCompletenessTaxonomyMapping(key) {
  const m = MAPPING_BY_LIVE_KEY.get(key)
  if (!m) return null
  return clone({
    completenessKey: m.completenessKey,
    taxonomyKeys: m.taxonomyKeys,
    mappingType: m.mappingType,
    note: m.note,
    taxonomyKeyDetails: taxonomyKeyDetails(m.taxonomyKeys),
  })
}

/**
 * Taxonomy dimensions with no shipped 9C counterpart (deep-copied). Derived from
 * the live taxonomy constants, so it cannot silently drift.
 */
export function listTaxonomyOnlyDimensions() {
  return TAXONOMY_ONLY_KEYS.map(key => {
    const dim = getVenueDnaDimension(key)
    return {
      taxonomyKey: key,
      category: dim ? dim.category : null,
      tier: dim ? dim.tier : null,
      trackedToday: dim ? dim.trackedToday : null,
    }
  })
}

/**
 * Shipped 9C dimensions with no taxonomy equivalent (deep-copied) — currently only
 * event_identity. No invented taxonomy target.
 */
export function listCompletenessOnlyDimensions() {
  return COMPLETENESS_ONLY_KEYS.map(key => ({
    completenessKey: key,
    note: MAPPING_BY_LIVE_KEY.get(key)?.note || '',
  }))
}

/**
 * True when `key` is one of the 16 shipped 9C completeness keys.
 */
export function validateCompletenessKey(key) {
  return MAPPING_BY_LIVE_KEY.has(key)
}

/**
 * Re-express an existing 9C completeness RESULT (the output of
 * buildVenueDnaCompleteness) in taxonomy terms — purely and conservatively.
 *
 * Guarantees:
 *   • Does NOT mutate the input result.
 *   • NEVER raises a status. trackedToday 'no' projects to 'not_tracked';
 *     trackedToday 'partial' caps confident statuses at 'partial'.
 *   • NEVER asserts `confirmed` (a 9C `confirmed` is downgraded to
 *     needs_owner_confirmation). `confirmed` is always false on every entry.
 *   • Always forces `unlock_readiness: false` (Full Mode is not gated here).
 *   • Taxonomy-only and 9C-only dimensions are listed explicitly, never dropped.
 *
 * @param {object} result  a venue_dna_completeness result (read-only)
 * @returns {object} a taxonomy-view projection
 */
export function mapCompletenessResultToTaxonomyView(result) {
  const safe = result && typeof result === 'object' ? result : {}
  const sourceDims = Array.isArray(safe.dimensions) ? safe.dimensions : []

  // Index source statuses by 9C key WITHOUT mutating the input.
  const statusByKey = new Map()
  for (const d of sourceDims) {
    if (d && typeof d === 'object' && typeof d.key === 'string') {
      statusByKey.set(d.key, typeof d.status === 'string' ? d.status : 'missing')
    }
  }

  const dimensions = []
  for (const m of COMPLETENESS_TO_TAXONOMY) {
    const nineCStatus = statusByKey.has(m.completenessKey)
      ? statusByKey.get(m.completenessKey)
      : null

    if (m.taxonomyKeys.length === 0) {
      // live-only (event_identity): keep it, don't invent a taxonomy target.
      dimensions.push({
        taxonomyKey: null,
        sourceCompletenessKey: m.completenessKey,
        mappingType: m.mappingType,
        trackedToday: null,
        sourceStatus: nineCStatus,
        projectedStatus: nineCStatus ? 'live_only_no_taxonomy_target' : 'not_evaluated_by_9c',
        storageClamped: false,
        confirmed: false,
      })
      continue
    }

    for (const taxonomyKey of m.taxonomyKeys) {
      const trackedToday = trackedTodayFor(taxonomyKey)
      const projection = nineCStatus === null
        ? { projectedStatus: 'not_evaluated_by_9c', storageClamped: false }
        : projectStatus(nineCStatus, trackedToday)

      dimensions.push({
        taxonomyKey,
        sourceCompletenessKey: m.completenessKey,
        mappingType: m.mappingType,
        trackedToday,
        sourceStatus: nineCStatus,
        projectedStatus: projection.projectedStatus,
        storageClamped: projection.storageClamped,
        confirmed: false, // confirmation is 9D — never asserted here
      })
    }
  }

  const taxonomyOnly = TAXONOMY_ONLY_KEYS.map(taxonomyKey => ({
    taxonomyKey,
    sourceCompletenessKey: null,
    mappingType: 'taxonomy_only',
    trackedToday: trackedTodayFor(taxonomyKey),
    sourceStatus: null,
    projectedStatus: 'not_evaluated_by_9c',
    storageClamped: false,
    confirmed: false,
  }))

  return clone({
    source: {
      type: 'venue_dna_taxonomy_view',
      derived_from: 'venue_dna_completeness',
      ai_used: false,
      writes_performed: false,
      computed: true,
    },
    crosswalk_version: VENUE_DNA_CROSSWALK_VERSION,
    // Passthrough of the 9C verdict, read-only. The taxonomy view never recomputes
    // or upgrades these — it only re-expresses dimension overlap.
    foundation_status: typeof safe.foundation_status === 'string' ? safe.foundation_status : null,
    foundation_score: Number.isFinite(safe.foundation_score) ? safe.foundation_score : null,
    unlock_readiness: false,        // forced — Full Mode is never gated here
    confirmation_tier_available: false, // 9D not built
    dimensions,
    taxonomy_only_dimensions: taxonomyOnly,
    notes: 'Conservative taxonomy projection of a 9C completeness result. Statuses are never raised; untracked dimensions read as not_tracked; confirmation is never asserted.',
  })
}

export const VENUE_DNA_CROSSWALK_MAPPING_TYPE_KEYS = MAPPING_TYPE_KEYS

export default getVenueDnaTaxonomyCrosswalk
