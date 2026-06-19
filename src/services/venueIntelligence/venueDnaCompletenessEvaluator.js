// Venue DNA Completeness Evaluator — Phase 9C-2.
//
// A PURE, DETERMINISTIC, READ-ONLY function that accepts the existing Venue DNA
// object and returns a deterministic foundation-readiness model. It computes —
// per dimension and overall — what is answered, partial, missing, confirmation-
// needed, and what blocks Venue DNA foundation readiness.
//
// Source of truth: docs/architecture/VENUE_DNA_COMPLETENESS_MODEL_PHASE_9C_SPEC.md
// DNA shape reference: src/features/venue-intelligence/venueDnaModel.js
//
// HARD GUARANTEES (enforced by scripts/test-venue-dna-completeness.js):
//   • Pure: no DB, no network, no AI, no writes. Does not mutate its input.
//   • Imports nothing — self-contained. No model-provider SDKs, no network calls,
//     and no reference to the shared Venue DNA writer.
//   • The LLM can NEVER set a status: any status-like fields inside the Venue DNA
//     object are ignored. Statuses are computed from signal presence, confidence,
//     and (later) owner confirmation / contradiction state supplied via options.
//   • unlock_readiness is ALWAYS false in 9C — Full Intelligence Mode is not gated
//     here, and foundation_ready never auto-enables it.
//
// Confirmations and contradictions arrive only through `options` (Phase 9D wires
// the real stores). They default to empty, so today the evaluator reports honestly
// from existing DNA fields alone.

// ── Tunable deterministic thresholds (conservative; coverage, not certainty) ─────
const ANSWERED_CONFIDENCE_FLOOR = 55  // a confidence-backed dimension is "answered" at/above this
const ANSWERED_SIGNAL_FLOOR     = 2   // a signal-only dimension needs this many signals to be "answered"
const OPEN_CRITICAL_QUESTIONS_CAP = 3 // more open critical questions than this blocks readiness
const SCORE_CAP_WHEN_BLOCKED    = 60  // foundation_score ceiling while a hard blocker exists

// Deterministic per-status contribution to foundation coverage (NOT AI confidence).
const STATUS_POINTS = {
  confirmed:          1.0,
  needs_confirmation: 0.7,
  answered:           0.7,
  partial:            0.4,
  unclear:            0.2,
  missing:            0.0,
  contradicted:       0.0,
}

const ANSWERED_OR_BETTER = ['answered', 'needs_confirmation', 'confirmed']

// Priority order for the next-question recommendation — foundation-critical first.
const NEXT_QUESTION_PRIORITY = [
  'venue_identity',
  'owner_intent',
  'target_guests',
  'service_philosophy',
  'non_negotiables',
  'what_venue_is_not',
]

// ── Canonical dimension model (from the 9C-1 spec) ──────────────────────────────
// required_for_foundation: true (blocks) | false (never blocks) | 'conditional' (matters, does not block)
// tracked_today: 'yes' (clean mapped storage) | 'partial' (blended only) | 'no' (no storage)
// signalKeys / confidenceKeys reference the real venue_dna_json fields.
export const VENUE_DNA_COMPLETENESS_DIMENSIONS = [
  {
    key: 'venue_identity',
    label: 'Venue identity',
    required_for_foundation: true,
    signalKeys: ['businessTypeSignals', 'hospitalityStyle'],
    confidenceKeys: ['identity'],
    maps_to_existing_dna_fields: ['businessTypeSignals', 'hospitalityStyle', 'confidence.identity'],
    tracked_today: 'yes',
    owner_confirmation_required: true,
    evidence_required: true,
    should_appear_in_owner_home: true,
    recommended_question: "How would you describe the place to someone who's never been?",
    what_must_not_be_inferred: 'a category from a single ambiguous word',
  },
  {
    key: 'owner_intent',
    label: 'Founder / owner intent',
    required_for_foundation: true,
    signalKeys: ['emotionalDrivers', 'ownerPriorities'],
    confidenceKeys: [],
    maps_to_existing_dna_fields: ['emotionalDrivers', 'ownerPriorities'],
    tracked_today: 'partial', // no dedicated field — capped at partial from signals alone
    owner_confirmation_required: true,
    evidence_required: true,
    should_appear_in_owner_home: true,
    recommended_question: 'What made you open it?',
    what_must_not_be_inferred: 'motives not expressed',
  },
  {
    key: 'target_guests',
    label: 'Target guests',
    required_for_foundation: true,
    signalKeys: ['guestExperienceSignals'],
    confidenceKeys: ['guest'],
    maps_to_existing_dna_fields: ['guestExperienceSignals', 'confidence.guest'],
    tracked_today: 'yes',
    owner_confirmation_required: true,
    evidence_required: true,
    should_appear_in_owner_home: true,
    recommended_question: "Who's the guest you build the night around?",
    what_must_not_be_inferred: 'demographics not stated',
  },
  {
    key: 'service_philosophy',
    label: 'Service philosophy',
    required_for_foundation: true,
    signalKeys: ['serviceSignals'],
    confidenceKeys: [],
    maps_to_existing_dna_fields: ['serviceSignals'],
    tracked_today: 'yes',
    owner_confirmation_required: true,
    evidence_required: true,
    should_appear_in_owner_home: true,
    recommended_question: 'What does great service feel like here?',
    what_must_not_be_inferred: 'standards not described',
  },
  {
    key: 'emotional_atmosphere',
    label: 'Emotional atmosphere',
    required_for_foundation: 'conditional',
    signalKeys: ['emotionalDrivers'],
    confidenceKeys: [],
    maps_to_existing_dna_fields: ['emotionalDrivers'],
    tracked_today: 'yes',
    owner_confirmation_required: false,
    evidence_required: false,
    should_appear_in_owner_home: true,
    recommended_question: 'What should people feel when they walk in?',
    what_must_not_be_inferred: 'mood from decor guesses',
  },
  {
    key: 'hospitality_promise',
    label: 'Hospitality promise',
    required_for_foundation: 'conditional',
    signalKeys: [],
    confidenceKeys: [],
    maps_to_existing_dna_fields: [],
    tracked_today: 'no',
    owner_confirmation_required: false,
    evidence_required: true,
    should_appear_in_owner_home: true,
    recommended_question: 'What do you never want a guest to leave without?',
    what_must_not_be_inferred: 'a promise not made',
  },
  {
    key: 'non_negotiables',
    label: 'Non-negotiables',
    required_for_foundation: true,
    signalKeys: [],
    confidenceKeys: [],
    maps_to_existing_dna_fields: [], // leaks into ownerPriorities; not cleanly tracked today
    tracked_today: 'no',
    owner_confirmation_required: true,
    evidence_required: true,
    should_appear_in_owner_home: true,
    recommended_question: 'What would you never compromise on?',
    what_must_not_be_inferred: 'rules not stated',
  },
  {
    key: 'what_venue_is_not',
    label: 'What the venue is not',
    required_for_foundation: true,
    signalKeys: [],
    confidenceKeys: [],
    maps_to_existing_dna_fields: [],
    tracked_today: 'no',
    owner_confirmation_required: true,
    evidence_required: true,
    should_appear_in_owner_home: true,
    recommended_question: "What are you definitely not trying to be?",
    what_must_not_be_inferred: 'opposites by assumption',
  },
  {
    key: 'beverage_identity',
    label: 'Menu / beverage identity',
    required_for_foundation: 'conditional',
    signalKeys: ['beverageSignals'],
    confidenceKeys: [],
    maps_to_existing_dna_fields: ['beverageSignals'],
    tracked_today: 'yes',
    owner_confirmation_required: false,
    evidence_required: false,
    should_appear_in_owner_home: true,
    recommended_question: "What's the drink direction?",
    what_must_not_be_inferred: 'a program not described',
  },
  {
    key: 'food_identity',
    label: 'Food identity',
    required_for_foundation: 'conditional',
    signalKeys: ['foodSignals'],
    confidenceKeys: [],
    maps_to_existing_dna_fields: ['foodSignals'],
    tracked_today: 'yes',
    owner_confirmation_required: false,
    evidence_required: false,
    should_appear_in_owner_home: true,
    recommended_question: "What's the food about?",
    what_must_not_be_inferred: 'cuisine not stated',
  },
  {
    key: 'operational_constraints',
    label: 'Operational constraints',
    required_for_foundation: 'conditional',
    signalKeys: ['operationalPainPoints'],
    confidenceKeys: ['operations'],
    maps_to_existing_dna_fields: ['operationalPainPoints', 'confidence.operations'],
    tracked_today: 'yes',
    owner_confirmation_required: false,
    evidence_required: false,
    should_appear_in_owner_home: true,
    recommended_question: 'Where does the operation feel heavy?',
    what_must_not_be_inferred: 'problems not described',
  },
  {
    key: 'team_service_style',
    label: 'Team / service style',
    required_for_foundation: 'conditional',
    signalKeys: ['trainingSignals', 'serviceSignals'],
    confidenceKeys: ['training'],
    maps_to_existing_dna_fields: ['trainingSignals', 'serviceSignals', 'confidence.training'],
    tracked_today: 'yes',
    owner_confirmation_required: false,
    evidence_required: false,
    should_appear_in_owner_home: true,
    recommended_question: 'Tell me about the team.',
    what_must_not_be_inferred: 'performance judgments (no staff surveillance)',
  },
  {
    key: 'event_identity',
    label: 'Event identity',
    required_for_foundation: 'conditional',
    signalKeys: [],
    confidenceKeys: [],
    maps_to_existing_dna_fields: [],
    tracked_today: 'no',
    owner_confirmation_required: false,
    evidence_required: false,
    should_appear_in_owner_home: false,
    recommended_question: 'Do events matter to the business?',
    what_must_not_be_inferred: "an events program that wasn't described",
  },
  {
    key: 'brand_language',
    label: 'Brand language',
    required_for_foundation: 'conditional',
    signalKeys: [],
    confidenceKeys: [],
    maps_to_existing_dna_fields: [],
    tracked_today: 'no',
    owner_confirmation_required: false,
    evidence_required: false,
    should_appear_in_owner_home: false,
    recommended_question: 'How do you talk about the place?',
    what_must_not_be_inferred: 'a voice not demonstrated',
  },
  {
    key: 'growth_opportunities',
    label: 'Growth opportunities',
    required_for_foundation: false,
    signalKeys: ['growthOpportunities'],
    confidenceKeys: ['commercial'],
    maps_to_existing_dna_fields: ['growthOpportunities', 'confidence.commercial'],
    tracked_today: 'yes',
    owner_confirmation_required: false,
    evidence_required: false,
    should_appear_in_owner_home: true,
    recommended_question: "Where's the unrealised upside?",
    what_must_not_be_inferred: 'opportunities by assumption',
  },
  {
    key: 'risk_drift',
    label: 'Risk / drift indicators',
    required_for_foundation: false,
    signalKeys: [],
    confidenceKeys: [],
    maps_to_existing_dna_fields: [],
    tracked_today: 'no',
    owner_confirmation_required: false, // surfaced, not auto-applied
    evidence_required: true,
    should_appear_in_owner_home: false,
    recommended_question: '', // derived, never asked
    what_must_not_be_inferred: 'drift from thin evidence',
  },
]

// UI labels per status (calm, owner-facing — never harsh).
const UI_LABELS = {
  missing:            'Areas HESTIA will explore',
  partial:            'Forming',
  answered:           'Understood',
  needs_confirmation: 'Awaiting your confirmation',
  confirmed:          'Confirmed',
  unclear:            'Needs clarifying',
  contradicted:       "Conflicting — let's reconcile",
}

// ── Pure readers (never mutate, never assume shape) ─────────────────────────────
function arrayLen(value) {
  return Array.isArray(value) ? value.filter(v => String(v ?? '').trim()).length : 0
}

function sumSignals(signalKeys, venueDna) {
  let total = 0
  for (const key of signalKeys) total += arrayLen(venueDna?.[key])
  return total
}

// Returns the max confidence across the mapped dimensions, or null when a
// dimension has no confidence backing at all (signal-only dimension).
function maxConfidence(confidenceKeys, venueDna) {
  if (!confidenceKeys.length) return null
  const conf = venueDna?.confidence
  let max = 0
  for (const key of confidenceKeys) {
    const v = Number(conf?.[key])
    if (Number.isFinite(v) && v > max) max = Math.max(0, Math.min(100, v))
  }
  return max
}

// Deterministic raw status from stored DNA fields only — no options, no LLM text.
function rawSignalStatus(dim, venueDna) {
  const signalCount = sumSignals(dim.signalKeys, venueDna)
  const confidenceValue = maxConfidence(dim.confidenceKeys, venueDna)

  // No clean storage today → honestly missing. Never invent a value.
  if (dim.tracked_today === 'no') {
    return { status: 'missing', signalCount: 0, confidenceValue }
  }

  // Blended-only storage → can rise to partial, but never to "answered" from
  // signals alone, because the dedicated meaning cannot be verified.
  if (dim.tracked_today === 'partial') {
    return { status: signalCount > 0 ? 'partial' : 'missing', signalCount, confidenceValue }
  }

  // Cleanly tracked.
  const hasConfidence = dim.confidenceKeys.length > 0
  if (signalCount === 0 && (!hasConfidence || !confidenceValue)) {
    return { status: 'missing', signalCount, confidenceValue }
  }

  const answered = hasConfidence
    ? (Number(confidenceValue) >= ANSWERED_CONFIDENCE_FLOOR && signalCount >= 1)
    : (signalCount >= ANSWERED_SIGNAL_FLOOR)

  return { status: answered ? 'answered' : 'partial', signalCount, confidenceValue }
}

/**
 * Evaluate a single dimension deterministically.
 * Status precedence: contradicted > unclear > confirmed > (needs_confirmation | computed).
 * contradictions / confirmations / unclear arrive only via options (Phase 9D stores).
 */
export function evaluateVenueDnaDimension(dim, venueDna = {}, options = {}) {
  const confirmations = options.confirmations || {}
  const contradictions = options.contradictions || {}
  const unclear = options.unclear || {}

  const raw = rawSignalStatus(dim, venueDna)

  let status
  if (contradictions[dim.key]) {
    status = 'contradicted'
  } else if (unclear[dim.key]) {
    status = 'unclear'
  } else if (confirmations[dim.key]) {
    status = 'confirmed'
  } else if (raw.status === 'answered' && dim.owner_confirmation_required) {
    status = 'needs_confirmation'
  } else {
    status = raw.status
  }

  const isRequired = dim.required_for_foundation === true
  const evidence_available =
    raw.signalCount > 0 || Number(raw.confidenceValue || 0) > 0 || status === 'confirmed'

  // A required dimension blocks foundation readiness unless it is fully settled:
  // confirmed, or answered when no confirmation is required.
  const settled =
    status === 'confirmed' ||
    (status === 'answered' && !dim.owner_confirmation_required)
  const blocker = isRequired && !settled

  return {
    key: dim.key,
    label: dim.label,
    required_for_foundation: dim.required_for_foundation,
    status,
    ui_label: UI_LABELS[status] || status,
    maps_to_existing_dna_fields: dim.maps_to_existing_dna_fields,
    tracked_today: dim.tracked_today,
    owner_confirmation_required: dim.owner_confirmation_required,
    evidence_required: dim.evidence_required,
    should_appear_in_owner_home: dim.should_appear_in_owner_home,
    signal_count: raw.signalCount,
    confidence_value: raw.confidenceValue,
    evidence_available,
    blocker,
    recommended_question: dim.recommended_question,
    what_must_not_be_inferred: dim.what_must_not_be_inferred,
  }
}

/**
 * Deterministic next-question pick: first foundation-critical dimension that is
 * not yet settled, in fixed priority order. Returns a calm, predefined owner
 * question from the dimension definition — never AI-generated prose.
 */
export function getRecommendedNextQuestion(dimensions = []) {
  const byKey = new Map(dimensions.map(d => [d.key, d]))
  const unsettled = new Set(['missing', 'partial', 'unclear', 'contradicted'])
  for (const key of NEXT_QUESTION_PRIORITY) {
    const dim = byKey.get(key)
    if (dim && unsettled.has(dim.status) && dim.recommended_question) {
      return dim.recommended_question
    }
  }
  return null
}

/**
 * Build the full deterministic foundation-readiness model from a Venue DNA object.
 * Pure and read-only — does not mutate `venueDna` or `options`.
 *
 * @param {object} venueDna  the stored venue_dna_json shape (signal arrays, confidence, etc.)
 * @param {object} options   { confirmations, contradictions, unclear, openCriticalQuestions, now }
 * @returns {object} foundationReadiness
 */
export function buildVenueDnaCompleteness(venueDna = {}, options = {}) {
  const safeDna = venueDna && typeof venueDna === 'object' ? venueDna : {}
  const openCritical = Array.isArray(options.openCriticalQuestions)
    ? options.openCriticalQuestions.map(q => String(q ?? '').trim()).filter(Boolean)
    : []
  const openCriticalOk = openCritical.length <= OPEN_CRITICAL_QUESTIONS_CAP

  // Evaluate every dimension.
  const dimensions = VENUE_DNA_COMPLETENESS_DIMENSIONS.map(dim =>
    evaluateVenueDnaDimension(dim, safeDna, options)
  )

  const required = dimensions.filter(d => d.required_for_foundation === true)
  const requiredAnsweredOrBetter = required.filter(d => ANSWERED_OR_BETTER.includes(d.status))
  const requiredConfirmed = required.filter(d => d.status === 'confirmed')
  const requiredContradicted = required.filter(d => d.status === 'contradicted')
  const requiredNeedsConfirm = required.filter(d => d.status === 'needs_confirmation')
  const missingRequired = required.filter(d => !ANSWERED_OR_BETTER.includes(d.status))

  const needsConfirmationDimensions = dimensions.filter(d => d.status === 'needs_confirmation')
  const contradictedDimensions = dimensions.filter(d => d.status === 'contradicted')

  const totalSignals = dimensions.reduce((sum, d) => sum + d.signal_count, 0)

  // ── Foundation status (deterministic) ─────────────────────────────────────────
  let foundation_status
  if (totalSignals === 0 && requiredAnsweredOrBetter.length === 0) {
    foundation_status = 'not_started'
  } else if (
    requiredConfirmed.length === required.length &&
    requiredContradicted.length === 0 &&
    openCriticalOk
  ) {
    foundation_status = 'foundation_ready'
  } else if (
    requiredAnsweredOrBetter.length === required.length &&
    requiredContradicted.length === 0
  ) {
    foundation_status = 'needs_owner_confirmation'
  } else if (requiredAnsweredOrBetter.length >= Math.ceil(required.length / 2)) {
    foundation_status = 'building'
  } else {
    foundation_status = 'early_learning'
  }
  // NOTE: 'full_mode_ready_later' is intentionally UNREACHABLE in 9C-2. Full
  // Intelligence Mode gating is out of scope here; this evaluator never returns it.

  // ── Deterministic coverage score (NOT certainty / NOT AI confidence) ──────────
  let foundation_score = 0
  if (required.length > 0) {
    const points = required.reduce((sum, d) => sum + (STATUS_POINTS[d.status] ?? 0), 0)
    foundation_score = Math.round((points / required.length) * 100)
  }
  const hardBlockerExists = missingRequired.length > 0 || requiredContradicted.length > 0 || !openCriticalOk
  if (hardBlockerExists) foundation_score = Math.min(foundation_score, SCORE_CAP_WHEN_BLOCKED)

  // ── Blockers (human-readable, deterministic) ──────────────────────────────────
  const blockers = []
  for (const d of required) {
    if (d.status === 'missing' || d.status === 'partial' || d.status === 'unclear') {
      blockers.push(`${d.label} is not yet established (${d.status}).`)
    } else if (d.status === 'contradicted') {
      blockers.push(`${d.label} has conflicting signals and must be reconciled.`)
    } else if (d.status === 'needs_confirmation') {
      blockers.push(`${d.label} is understood but awaiting owner confirmation.`)
    }
  }
  if (!openCriticalOk) {
    blockers.push(`Too many open critical questions (${openCritical.length}); foundation cannot be confirmed yet.`)
  }

  return {
    source: {
      type: 'venue_dna_completeness',
      ai_used: false,
      writes_performed: false,
      computed: true,
    },
    foundation_status,
    foundation_score,
    unlock_readiness: false, // ALWAYS false in 9C — Full Mode is not gated here.
    dimensions,
    required_dimensions: required.map(d => d.key),
    required_dimensions_answered: requiredAnsweredOrBetter.map(d => d.key),
    required_dimensions_confirmed: requiredConfirmed.map(d => d.key),
    missing_required_dimensions: missingRequired.map(d => d.key),
    needs_confirmation_dimensions: needsConfirmationDimensions.map(d => d.key),
    contradicted_dimensions: contradictedDimensions.map(d => d.key),
    open_critical_questions: openCritical,
    blockers,
    recommended_next_question: getRecommendedNextQuestion(dimensions),
    not_enough_data: foundation_status === 'not_started' || foundation_status === 'early_learning',
    forbidden_inferences_avoided: dimensions
      .filter(d => d.status === 'missing' || d.status === 'partial' || d.status === 'unclear')
      .map(d => ({ key: d.key, what_must_not_be_inferred: d.what_must_not_be_inferred })),
  }
}

export default buildVenueDnaCompleteness
