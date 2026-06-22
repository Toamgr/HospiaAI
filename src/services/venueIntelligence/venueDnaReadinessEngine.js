// Venue DNA Readiness Engine — Phase 9E-3D (pure, additive, NOT wired to runtime).
//
// A PURE, DETERMINISTIC, READ-ONLY function that accepts an existing 9C completeness
// RESULT (the output of buildVenueDnaCompleteness) and re-expresses it as a
// conservative, taxonomy-based READINESS / MISSING-DATA view. It tells you — across
// the full 35-dimension Venue DNA taxonomy — what has draft-level coverage, what is
// partial, what is missing, what cannot be tracked today, which confirmation-critical
// dimensions are still open, whether the deterministic Working-Draft threshold groups
// are met, and which missing/partial dimensions are worth asking about.
//
// Source of truth: docs/architecture/VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md
// Builds on:
//   • src/services/venueIntelligence/venueDnaTaxonomy.js          (35-dim taxonomy)
//   • src/services/venueIntelligence/venueDnaTaxonomyCrosswalk.js (9C → taxonomy map)
//   • a 9C completeness result passed in as input (NOT imported — supplied by caller)
//
// DOCTRINE (do not violate):
//   This engine may DESCRIBE readiness. It must NOT CREATE readiness.
//   • It never turns missing data into truth.
//   • It never marks any dimension `confirmed` (confirmation is a 9D owner event).
//   • It never upgrades trackedToday:'no' into answered — it stays not_tracked.
//   • It never upgrades trackedToday:'partial' beyond partial.
//   • Confidence/coverage here means EVIDENCE COVERAGE, never certainty or confirmed
//     truth. unlock_readiness stays false; confirmation_tier_available stays false.
//
// HARD GUARANTEES (enforced by scripts/test-venue-dna-readiness-engine.js):
//   • Pure: no DB, no network, no AI, no writes, no API keys.
//   • Imports ONLY the pure taxonomy + crosswalk constants. No server import, no
//     reference to the canonical Venue DNA writer, no live coupling.
//   • Does NOT mutate its input. Returns deep-copied, immutable-by-construction data.
//   • Embeds NO venue facts — only structural definitions and the caller's own result.

import {
  VENUE_DNA_TAXONOMY_VERSION,
  VENUE_DNA_DIMENSION_CATEGORIES,
  VENUE_DNA_DIMENSION_TIERS,
  listVenueDnaDimensions,
  listConfirmationCriticalDimensions,
  getWorkingDraftThresholdGroups,
} from './venueDnaTaxonomy.js'
import {
  VENUE_DNA_CROSSWALK_VERSION,
  mapCompletenessResultToTaxonomyView,
  getCompletenessKeysForTaxonomyKey,
} from './venueDnaTaxonomyCrosswalk.js'

// Stable identifier for this readiness-engine revision. Bump on any structural change.
export const VENUE_DNA_READINESS_VERSION = '9E-3D.1'

// The four conservative readiness buckets. `known` is COVERAGE, never confirmed truth.
export const VENUE_DNA_READINESS_BUCKETS = Object.freeze({
  known: 'Draft-level coverage exists (answered / awaiting confirmation). Coverage, NEVER confirmed truth.',
  partial: 'Some evidence, below the draft threshold.',
  missing: 'No evidence captured yet for this dimension.',
  not_tracked: 'No clean storage path today (trackedToday:no) — cannot be captured until storage exists.',
})

// One-line statement of what readiness means here — surfaced on the view itself.
const CONFIDENCE_DISCLAIMER =
  'Readiness here describes taxonomy COVERAGE of evidence — not certainty and not confirmed truth. ' +
  'No dimension is confirmed; confirmation is a 9D owner-governance event this engine never performs.'

const CATEGORY_KEYS = Object.freeze(Object.keys(VENUE_DNA_DIMENSION_CATEGORIES))
const TIER_KEYS = Object.freeze(Object.keys(VENUE_DNA_DIMENSION_TIERS))

// Foundation-first ordering for question prioritisation (never blocks, only orders).
const CATEGORY_RANK = Object.freeze({ foundation: 0, module_specific: 1, advanced: 2 })

// Crosswalk projected statuses that imply draft-level coverage (NOT confirmed truth).
const KNOWN_PROJECTED_STATUSES = new Set(['answered', 'needs_owner_confirmation'])
// Crosswalk projected statuses that imply some-but-not-enough evidence.
const PARTIAL_PROJECTED_STATUSES = new Set(['partial', 'needs_precision'])

// ── Internal helpers ─────────────────────────────────────────────────────────────

// Deep clone via JSON round-trip — all data here is plain JSON, so this is lossless
// and guarantees callers cannot mutate the engine's source or returned structures.
function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

/**
 * Conservative bucket for one dimension. trackedToday:'no' is ALWAYS not_tracked
 * (honesty — there is no clean storage to read), regardless of any projected status.
 * Otherwise derive from the crosswalk's projected status, which already clamps
 * partial-tracked storage to partial and never asserts `confirmed`.
 */
function bucketFor(trackedToday, projectedStatus) {
  if (trackedToday === 'no') return 'not_tracked'
  if (projectedStatus === 'not_tracked') return 'not_tracked'
  if (KNOWN_PROJECTED_STATUSES.has(projectedStatus)) return 'known'
  if (PARTIAL_PROJECTED_STATUSES.has(projectedStatus)) return 'partial'
  return 'missing'
}

// Build an empty per-group bucket tally with stable keys.
function emptyBucketGroups() {
  return { total: 0, known: [], partial: [], missing: [], not_tracked: [] }
}

// ── Public API (pure, deterministic, read-only) ──────────────────────────────────

/**
 * Build the conservative taxonomy-based readiness view from a 9C completeness result.
 * Pure and read-only — does not mutate `completenessResult` or `options`.
 *
 * Guarantees:
 *   • Always represents all 35 taxonomy dimensions, grouped by category and tier.
 *   • NEVER raises a status; trackedToday:'no' stays not_tracked; trackedToday:'partial'
 *     never exceeds partial; nothing is ever `confirmed`.
 *   • Forces unlock_readiness:false and confirmation_tier_available:false.
 *   • Question candidates come ONLY from missing/partial dimensions, and any surfaced
 *     question text is the caller's own 9C recommended_question — never invented here.
 *
 * @param {object} completenessResult  output of buildVenueDnaCompleteness (read-only)
 * @param {object} [options]           reserved for future use; unused today
 * @returns {object} a deterministic readiness / missing-data view
 */
export function buildVenueDnaReadinessView(completenessResult, options = {}) {
  void options // reserved; intentionally unused so the engine stays deterministic
  const safeResult = completenessResult && typeof completenessResult === 'object' ? completenessResult : {}

  // Conservative taxonomy projection of the 9C result. This already forces
  // unlock_readiness:false, never raises a status, and never asserts confirmed.
  const view = mapCompletenessResultToTaxonomyView(safeResult)

  // Index the crosswalk projection by taxonomy key (skip the live-only null entry).
  const projectionByKey = new Map()
  for (const d of view.dimensions) {
    if (d && typeof d.taxonomyKey === 'string') projectionByKey.set(d.taxonomyKey, d)
  }
  for (const d of view.taxonomy_only_dimensions) {
    if (d && typeof d.taxonomyKey === 'string' && !projectionByKey.has(d.taxonomyKey)) {
      projectionByKey.set(d.taxonomyKey, d)
    }
  }

  // The caller's own 9C recommended questions, read-only — never invented here.
  const questionByCompletenessKey = new Map()
  const srcDims = Array.isArray(safeResult.dimensions) ? safeResult.dimensions : []
  for (const d of srcDims) {
    if (
      d && typeof d.key === 'string' &&
      typeof d.recommended_question === 'string' && d.recommended_question.trim()
    ) {
      questionByCompletenessKey.set(d.key, d.recommended_question)
    }
  }

  const confirmationCriticalSet = new Set(listConfirmationCriticalDimensions())
  const taxonomy = listVenueDnaDimensions()

  // ── Per-dimension readiness records (all 35) ──────────────────────────────────
  const dimensions = taxonomy.map(dim => {
    const proj = projectionByKey.get(dim.key) || null
    const projectedStatus = proj ? proj.projectedStatus : 'not_evaluated_by_9c'
    const sourceStatus = proj && typeof proj.sourceStatus !== 'undefined' ? proj.sourceStatus : null
    const sourceCompletenessKeys = getCompletenessKeysForTaxonomyKey(dim.key) || []
    const bucket = bucketFor(dim.trackedToday, projectedStatus)
    return {
      taxonomyKey: dim.key,
      name: dim.name,
      category: dim.category,
      tier: dim.tier,
      trackedToday: dim.trackedToday,
      blocksDraft: dim.blocksDraft,
      blocksConfirmation: dim.blocksConfirmation,
      confirmationCritical: confirmationCriticalSet.has(dim.key),
      sourceCompletenessKeys,
      sourceStatus,
      projectedStatus,
      bucket,
      confirmed: false, // confirmation is 9D — NEVER asserted here
      evidenceNeeded: dim.evidence,            // structural taxonomy definition, not a venue fact
      whatMustNotBeInferred: dim.neverInfer,   // structural guard, not a venue fact
    }
  })

  const bucketByKey = new Map(dimensions.map(d => [d.taxonomyKey, d.bucket]))

  // ── Flat bucket lists ─────────────────────────────────────────────────────────
  const known = dimensions.filter(d => d.bucket === 'known').map(d => d.taxonomyKey)
  const partial = dimensions.filter(d => d.bucket === 'partial').map(d => d.taxonomyKey)
  const missing = dimensions.filter(d => d.bucket === 'missing').map(d => d.taxonomyKey)
  const notTracked = dimensions.filter(d => d.bucket === 'not_tracked').map(d => d.taxonomyKey)

  // ── Grouping by category and tier ─────────────────────────────────────────────
  const byCategory = {}
  for (const k of CATEGORY_KEYS) byCategory[k] = emptyBucketGroups()
  const byTier = {}
  for (const k of TIER_KEYS) byTier[k] = emptyBucketGroups()
  for (const d of dimensions) {
    const cg = byCategory[d.category]
    if (cg) { cg.total += 1; cg[d.bucket].push(d.taxonomyKey) }
    const tg = byTier[d.tier]
    if (tg) { tg.total += 1; tg[d.bucket].push(d.taxonomyKey) }
  }

  // ── Confirmation-critical gaps (anything confirmation-critical not yet `known`) ─
  const confirmationCriticalMissing = dimensions
    .filter(d => d.confirmationCritical && d.bucket !== 'known')
    .map(d => ({
      taxonomyKey: d.taxonomyKey,
      name: d.name,
      category: d.category,
      tier: d.tier,
      bucket: d.bucket,
      trackedToday: d.trackedToday,
      blocksConfirmation: d.blocksConfirmation,
    }))

  // ── Working-Draft OR-group evaluation (conservative: a group needs a `known` member) ─
  const workingDraftGroups = getWorkingDraftThresholdGroups().map(group => {
    const satisfiedBy = group.filter(k => bucketByKey.get(k) === 'known')
    const partialMembers = group.filter(k => bucketByKey.get(k) === 'partial')
    const satisfied = satisfiedBy.length > 0
    const status = satisfied ? 'satisfied' : (partialMembers.length > 0 ? 'partial_only' : 'unsatisfied')
    return { group: [...group], satisfied, satisfiedBy, partialMembers, status }
  })
  const workingDraftReady = workingDraftGroups.every(g => g.satisfied)
  const workingDraftGroupGaps = workingDraftGroups.filter(g => !g.satisfied)

  // ── Blockers for confirmation (human-readable; never asserts anything is ready) ─
  const blockersForConfirmation = confirmationCriticalMissing.map(
    d => `${d.name} is not yet covered for confirmation (${d.bucket}).`
  )

  // ── Missing-data prompts / question candidates (ONLY from missing/partial dims) ─
  const questionCandidates = dimensions
    .filter(d => d.bucket === 'missing' || d.bucket === 'partial')
    .map(d => {
      const sourceCompletenessKey = d.sourceCompletenessKeys.length ? d.sourceCompletenessKeys[0] : null
      const question = sourceCompletenessKey
        ? (questionByCompletenessKey.get(sourceCompletenessKey) || null)
        : null
      return {
        taxonomyKey: d.taxonomyKey,
        name: d.name,
        category: d.category,
        tier: d.tier,
        bucket: d.bucket,
        trackedToday: d.trackedToday,
        confirmationCritical: d.confirmationCritical,
        sourceCompletenessKey,
        question,                                  // caller's own 9C question, or null — never invented
        whatToLearn: d.evidenceNeeded,             // structural definition, not a venue fact
        whatMustNotBeInferred: d.whatMustNotBeInferred,
      }
    })
    .sort((a, b) => {
      // Confirmation-critical first, then foundation-first, then bigger gaps (missing
      // before partial). Ties keep canonical taxonomy order (stable sort).
      if (a.confirmationCritical !== b.confirmationCritical) return a.confirmationCritical ? -1 : 1
      const cr = (CATEGORY_RANK[a.category] ?? 9) - (CATEGORY_RANK[b.category] ?? 9)
      if (cr !== 0) return cr
      if (a.bucket !== b.bucket) return a.bucket === 'missing' ? -1 : 1
      return 0
    })

  // ── Overall summary ───────────────────────────────────────────────────────────
  const summary = {
    totalDimensions: dimensions.length,
    known: known.length,
    partial: partial.length,
    missing: missing.length,
    not_tracked: notTracked.length,
    confirmed: 0, // ALWAYS 0 — confirmation is a 9D owner-governance event
    confirmationCriticalTotal: confirmationCriticalSet.size,
    confirmationCriticalKnown: dimensions.filter(d => d.confirmationCritical && d.bucket === 'known').length,
    confirmationCriticalGaps: confirmationCriticalMissing.length,
    workingDraftGroupsTotal: workingDraftGroups.length,
    workingDraftGroupsSatisfied: workingDraftGroups.filter(g => g.satisfied).length,
    workingDraftReady,
    questionCandidateCount: questionCandidates.length,
    coveragePercent: dimensions.length ? Math.round((known.length / dimensions.length) * 100) : 0,
    coverageMeans: 'taxonomy dimensions with draft-level coverage ÷ total — coverage, not truth certainty',
  }

  return clone({
    source: {
      type: 'venue_dna_readiness',
      derived_from: 'venue_dna_completeness',
      ai_used: false,
      writes_performed: false,
      computed: true,
    },
    readinessVersion: VENUE_DNA_READINESS_VERSION,
    taxonomyVersion: VENUE_DNA_TAXONOMY_VERSION,
    crosswalkVersion: VENUE_DNA_CROSSWALK_VERSION,
    confidence_disclaimer: CONFIDENCE_DISCLAIMER,
    buckets: VENUE_DNA_READINESS_BUCKETS,
    // 9C passthrough (read-only; never recomputed or upgraded by this engine).
    foundation_status: typeof view.foundation_status === 'string' ? view.foundation_status : null,
    foundation_score: Number.isFinite(view.foundation_score) ? view.foundation_score : null,
    nine_c_blockers: Array.isArray(safeResult.blockers) ? safeResult.blockers.map(b => String(b ?? '')) : [],
    unlock_readiness: false,            // NEVER created here — Full Mode is not gated by this engine
    confirmation_tier_available: false, // 9D not built
    summary,
    dimensions,
    byCategory,
    byTier,
    known,
    partial,
    missing,
    not_tracked: notTracked,
    confirmationCriticalMissing,
    workingDraftGroups,
    workingDraftReady,
    workingDraftGroupGaps,
    blockersForConfirmation,
    questionCandidates,
    notes:
      'Conservative taxonomy-based readiness view derived from a 9C completeness result. ' +
      'It DESCRIBES readiness; it never CREATES readiness. Statuses are never raised, ' +
      'trackedToday:no stays not_tracked, trackedToday:partial never exceeds partial, ' +
      'nothing is marked confirmed, and unlock_readiness stays false.',
  })
}

/**
 * Compact, read-only summary of a readiness view. Re-asserts unlock_readiness:false
 * and confirmation_tier_available:false so a summary can never imply readiness.
 */
export function summarizeVenueDnaReadiness(view) {
  const safe = view && typeof view === 'object' ? view : {}
  const summary = safe.summary && typeof safe.summary === 'object' ? clone(safe.summary) : {}
  return clone({
    readinessVersion: typeof safe.readinessVersion === 'string' ? safe.readinessVersion : null,
    taxonomyVersion: typeof safe.taxonomyVersion === 'string' ? safe.taxonomyVersion : null,
    crosswalkVersion: typeof safe.crosswalkVersion === 'string' ? safe.crosswalkVersion : null,
    foundation_status: typeof safe.foundation_status === 'string' ? safe.foundation_status : null,
    foundation_score: Number.isFinite(safe.foundation_score) ? safe.foundation_score : null,
    summary,
    unlock_readiness: false,
    confirmation_tier_available: false,
    confidence_disclaimer: typeof safe.confidence_disclaimer === 'string' ? safe.confidence_disclaimer : CONFIDENCE_DISCLAIMER,
  })
}

/**
 * The missing-data set: every dimension with no usable coverage today — both `missing`
 * (no evidence yet) and `not_tracked` (no storage path). Each record keeps its bucket
 * so callers can distinguish the two. Deep-copied.
 */
export function listMissingVenueDnaDimensions(view) {
  const safe = view && typeof view === 'object' ? view : {}
  const dims = Array.isArray(safe.dimensions) ? safe.dimensions : []
  return clone(dims.filter(d => d && (d.bucket === 'missing' || d.bucket === 'not_tracked')))
}

/**
 * Confirmation-critical dimensions not yet covered (deep-copied). These are the gaps
 * that would block owner confirmation — surfaced, never resolved, by this engine.
 */
export function listConfirmationCriticalGaps(view) {
  const safe = view && typeof view === 'object' ? view : {}
  return clone(Array.isArray(safe.confirmationCriticalMissing) ? safe.confirmationCriticalMissing : [])
}

/**
 * Working-Draft OR-groups that are not yet satisfied (deep-copied). A group is
 * satisfied only when at least one member has draft-level (`known`) coverage.
 */
export function listWorkingDraftGroupGaps(view) {
  const safe = view && typeof view === 'object' ? view : {}
  return clone(Array.isArray(safe.workingDraftGroupGaps) ? safe.workingDraftGroupGaps : [])
}

/**
 * Missing-data question candidates (deep-copied). Generated only from missing/partial
 * dimensions; any question text is the caller's own 9C recommended_question, never
 * invented by this engine.
 */
export function suggestVenueDnaQuestionCandidates(view) {
  const safe = view && typeof view === 'object' ? view : {}
  return clone(Array.isArray(safe.questionCandidates) ? safe.questionCandidates : [])
}

export const VENUE_DNA_READINESS_BUCKET_KEYS = Object.freeze(Object.keys(VENUE_DNA_READINESS_BUCKETS))

export default buildVenueDnaReadinessView
