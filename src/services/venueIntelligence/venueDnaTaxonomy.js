// Venue DNA Taxonomy — Phase 9E-3B (foundation constants only).
//
// A PURE, READ-ONLY constants module. It defines the canonical internal taxonomy
// of Venue DNA dimensions, their evidence model, status model, confidence
// semantics, and the deterministic Working-Draft threshold groups. It is the
// shared vocabulary future Venue Intelligence features (evidence extraction in
// 9E-3C, draft/next-best-question engine in 9E-3D) read from.
//
// Source of truth: docs/architecture/VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md
// Aligns with:     src/services/venueIntelligence/venueDnaCompletenessEvaluator.js (9C)
//                  src/features/venue-intelligence/venueDnaModel.js (canonical DNA shape)
//
// DOCTRINE (do not violate):
//   Venue Memory       = raw evidence.
//   Venue Intelligence = interpretation.
//   Venue DNA          = crystallized identity.
//   This taxonomy is NOT itself truth. It is a structure for future
//   evidence-bound interpretation.
//
// HARD GUARANTEES (enforced by scripts/test-venue-dna-taxonomy.js):
//   • Pure: no DB, no network, no AI, no writes, no API keys.
//   • Imports nothing — self-contained. No model-provider SDKs, no server import,
//     and no reference to the shared Venue DNA writer.
//   • This module is NOT wired into DNA mutation. It changes no live DNA behavior.
//   • Getters return deep copies, so callers can never mutate the canonical data.
//   • Embeds NO venue facts — only structural definitions.

// ── Allowed enums ────────────────────────────────────────────────────────────────

// Stable identifier for this taxonomy revision. Bump on any structural change.
export const VENUE_DNA_TAXONOMY_VERSION = '9E-3B.1'

// Dimension grouping by role (spec §3.1 / §3.3 / §3.4).
export const VENUE_DNA_DIMENSION_CATEGORIES = Object.freeze({
  foundation: 'Foundation-critical — the minimum that makes a Working DNA Draft meaningful.',
  module_specific: 'Module-specific — useful to downstream modules; never blocks the draft.',
  advanced: 'Advanced / later — useful, never blocking; surfaced, never auto-applied.',
})

// Interpretation tier — how a dimension relates to the three-layer doctrine.
export const VENUE_DNA_DIMENSION_TIERS = Object.freeze({
  stable_dna: 'Crystallized identity — slow-changing, owner-confirmable Venue DNA.',
  evolving_signal: 'Interpretation that evolves with evidence; working understanding, not fixed identity.',
  operational_signal: 'Derived from operational reality; describes constraints/context, not identity.',
  proposal_only: 'Surfaced for human review only; never auto-applied to Venue DNA.',
})

// Deterministic dimension status model (spec §4). The LLM never assigns these —
// an engine computes them from evidence. Listed in transition order.
export const VENUE_DNA_DIMENSION_STATUSES = Object.freeze({
  not_asked: 'HESTIA has not yet explored this dimension.',
  mentioned: 'Referenced in passing; not enough to be partial.',
  partial: 'Some evidence, below the answered threshold.',
  answered: 'Enough owner-provided evidence to treat as understood (for a draft).',
  needs_precision: 'Answered-ish but ambiguous on a specific flagged detail.',
  needs_owner_confirmation: 'Answered + confirmation-critical, no confirmation record yet.',
  confirmed: 'Answered + a valid owner confirmation record exists (9D only).',
  contradicted: 'A recorded conflict between turns; held as uncertainty.',
  not_relevant: 'Owner explicitly marked the dimension irrelevant to this venue.',
})

// Evidence record types (spec §5). Provenance the bare-string arrays lack today.
export const VENUE_DNA_EVIDENCE_TYPES = Object.freeze({
  owner_provided_fact: 'A concrete fact the owner stated explicitly.',
  owner_provided_belief: 'A value or intent the owner stated.',
  operational_signal: 'Derived from real operational data (never invented).',
  inferred_signal: 'A reasonable inference, clearly marked as inference — never a fact.',
  contradiction: 'A recorded conflict against prior evidence.',
  confirmation: 'An owner confirmation event (9D).',
  missing: 'The engine note that a dimension has no evidence yet.',
})

// Evidence tiers and where each may be used (spec §5). `assumption` is forbidden.
export const VENUE_DNA_EVIDENCE_TIERS = Object.freeze({
  fact: { definition: 'Owner stated it explicitly.', usableInDraft: true, usableInConfirmedDna: 'after_confirmation' },
  signal: { definition: 'Captured working understanding.', usableInDraft: true, usableInConfirmedDna: 'after_confirmation' },
  inference: { definition: 'Reasonable, labelled inference.', usableInDraft: true, usableInConfirmedDna: false },
  assumption: { definition: 'Unsupported guess.', usableInDraft: false, usableInConfirmedDna: false },
  confirmed_truth: { definition: 'Owner explicitly confirmed (9D).', usableInDraft: 'n/a', usableInConfirmedDna: true },
})

// Confidence semantics (spec §5). Confidence is COVERAGE, never certainty, and
// never owner confirmation. Bands are read-only orientation, not gates.
export const VENUE_DNA_CONFIDENCE_SEMANTICS = Object.freeze({
  scale: '0-100',
  means: 'engine-calibrated evidence coverage',
  does_not_mean: 'certainty, owner confirmation, or confirmed truth',
  bands: Object.freeze([
    Object.freeze({ id: 'none', min: 0, max: 0, label: 'No evidence yet' }),
    Object.freeze({ id: 'low', min: 1, max: 39, label: 'Thin — mentioned or fragmentary' }),
    Object.freeze({ id: 'forming', min: 40, max: 54, label: 'Forming — partial coverage' }),
    Object.freeze({ id: 'working', min: 55, max: 79, label: 'Working — answered for a draft, not confirmed' }),
    Object.freeze({ id: 'strong', min: 80, max: 100, label: 'Strong coverage — still not confirmed truth' }),
  ]),
})

const CATEGORY_KEYS = Object.freeze(Object.keys(VENUE_DNA_DIMENSION_CATEGORIES))
const TIER_KEYS = Object.freeze(Object.keys(VENUE_DNA_DIMENSION_TIERS))
const STATUS_KEYS = Object.freeze(Object.keys(VENUE_DNA_DIMENSION_STATUSES))

// ── Canonical dimension set (spec §3) ────────────────────────────────────────────
// Per-dimension contract:
//   key, name, category, tier, description, evidence, answeredWhen, partialWhen,
//   neverInfer, blocksDraft, blocksConfirmation, trackedToday, modules.
// trackedToday is honest about today's venue_dna_json storage (spec §3 storage
// honesty): 'yes' | 'partial' | 'no'. Module-specific/advanced dims are not cleanly
// stored today and are reported 'no' — the taxonomy never invents storage.
const DIMENSIONS = [
  // ── §3.1 Foundation-critical ────────────────────────────────────────────────
  {
    key: 'venue_identity', name: 'Venue identity', category: 'foundation', tier: 'stable_dna',
    description: 'Category, format, scale, layout.',
    evidence: 'Owner statements of format, capacity, and primary focus.',
    answeredWhen: 'format + capacity + primary focus stated', partialWhen: 'format only, no scale',
    neverInfer: 'a category from one ambiguous word',
    blocksDraft: true, blocksConfirmation: true, trackedToday: 'yes',
    modules: ['Core Engine', 'Guest Intel'],
  },
  {
    key: 'owner_intent', name: 'Founder / owner intent', category: 'foundation', tier: 'stable_dna',
    description: 'Founder motivation / vision.',
    evidence: 'Owner statements of personal motivation and brand goal.',
    answeredWhen: 'personal + brand goal stated', partialWhen: 'financial goal only',
    neverInfer: 'motives not expressed',
    blocksDraft: true, blocksConfirmation: true, trackedToday: 'partial',
    modules: ['Brand', 'Academy'],
  },
  {
    key: 'business_purpose', name: 'Business purpose', category: 'foundation', tier: 'stable_dna',
    description: 'Market thesis / problem solved.',
    evidence: 'A clear value proposition and the audience gap it addresses.',
    answeredWhen: 'clear value prop + audience gap', partialWhen: 'vague "great drinks" mission',
    neverInfer: 'a thesis not stated',
    blocksDraft: true, blocksConfirmation: 'conditional', trackedToday: 'partial',
    modules: ['Brand', 'Marketing'],
  },
  {
    key: 'target_guest_segments', name: 'Target guest segments', category: 'foundation', tier: 'stable_dna',
    description: 'Primary personas.',
    evidence: 'Distinct guest personas with described patterns.',
    answeredWhen: 'multiple distinct personas with patterns', partialWhen: 'one broad segment ("locals")',
    neverInfer: 'demographics not stated',
    blocksDraft: true, blocksConfirmation: true, trackedToday: 'yes',
    modules: ['Guest Intel', 'Marketing'],
  },
  {
    key: 'emotional_promise', name: 'Emotional promise', category: 'foundation', tier: 'stable_dna',
    description: 'What guests must feel.',
    evidence: 'A named emotional register or promise.',
    answeredWhen: 'a named emotional register/promise', partialWhen: 'mood implied not named',
    neverInfer: 'mood from decor guesses',
    blocksDraft: true, blocksConfirmation: true, trackedToday: 'partial',
    modules: ['Brand', 'Service'],
  },
  {
    key: 'hospitality_philosophy', name: 'Hospitality philosophy', category: 'foundation', tier: 'stable_dna',
    description: 'The belief system of hosting.',
    evidence: 'An explicit hosting belief.',
    answeredWhen: 'an explicit hosting belief', partialWhen: 'a service mention without belief',
    neverInfer: 'a philosophy not stated',
    blocksDraft: true, blocksConfirmation: false, trackedToday: 'partial',
    modules: ['Service', 'Academy'],
  },
  {
    key: 'service_philosophy', name: 'Service philosophy', category: 'foundation', tier: 'stable_dna',
    description: 'How service should feel / behave.',
    evidence: 'A stated service stance.',
    answeredWhen: 'a stated service stance', partialWhen: 'a service mention without stance',
    neverInfer: 'standards not described',
    blocksDraft: true, blocksConfirmation: true, trackedToday: 'yes',
    modules: ['Service', 'Academy'],
  },
  {
    key: 'fnb_identity', name: 'F&B identity', category: 'foundation', tier: 'evolving_signal',
    description: 'Food + beverage identity (combined).',
    evidence: 'A stated food-and-beverage direction.',
    answeredWhen: 'a stated F&B direction', partialWhen: 'a mention without direction',
    neverInfer: 'a program not described',
    blocksDraft: true, blocksConfirmation: false, trackedToday: 'yes',
    modules: ['F&B Program'],
  },
  {
    key: 'beverage_identity', name: 'Beverage identity', category: 'foundation', tier: 'evolving_signal',
    description: 'Drink direction specifically.',
    evidence: 'A stated beverage direction.',
    answeredWhen: 'a stated beverage direction', partialWhen: 'a beverage mention without direction',
    neverInfer: 'a program not described',
    blocksDraft: true, blocksConfirmation: false, trackedToday: 'yes',
    modules: ['F&B Program'],
  },
  {
    key: 'operational_pain_points', name: 'Operational pain points', category: 'foundation', tier: 'operational_signal',
    description: 'Recurring operational pain.',
    evidence: 'A named, recurring operational pain.',
    answeredWhen: 'a named recurring pain', partialWhen: 'a vague pressure',
    neverInfer: 'problems not described',
    blocksDraft: true, blocksConfirmation: false, trackedToday: 'yes',
    modules: ['Core Engine'],
  },
  {
    key: 'non_negotiables', name: 'Non-negotiables', category: 'foundation', tier: 'stable_dna',
    description: 'Hard rules that never bend.',
    evidence: 'An explicit non-negotiable rule.',
    answeredWhen: 'an explicit non-negotiable', partialWhen: 'a priority that reads like one',
    neverInfer: 'rules not stated',
    blocksDraft: true, blocksConfirmation: true, trackedToday: 'no',
    modules: ['All modules'],
  },
  {
    key: 'what_venue_must_never_become', name: 'What the venue must never become', category: 'foundation', tier: 'stable_dna',
    description: 'Explicit identity boundaries.',
    evidence: 'An explicit identity boundary.',
    answeredWhen: 'an explicit boundary', partialWhen: 'a boundary implied elsewhere',
    neverInfer: 'opposites by assumption',
    blocksDraft: true, blocksConfirmation: true, trackedToday: 'no',
    modules: ['Brand', 'Drift'],
  },
  {
    key: 'staff_behavior_standards', name: 'Staff behavior standards', category: 'foundation', tier: 'stable_dna',
    description: 'Required / forbidden staff behaviours.',
    evidence: 'Explicit do / don\'t behaviour standards.',
    answeredWhen: 'explicit do/don\'t standards', partialWhen: 'a behaviour mention without standard',
    neverInfer: 'performance judgments (no surveillance)',
    blocksDraft: true, blocksConfirmation: true, trackedToday: 'no',
    modules: ['Academy', 'Service'],
  },
  {
    key: 'training_philosophy', name: 'Training philosophy', category: 'foundation', tier: 'evolving_signal',
    description: 'How the team is taught the venue.',
    evidence: 'A stated training approach.',
    answeredWhen: 'a stated training approach', partialWhen: 'training mentioned without approach',
    neverInfer: 'a method not described',
    blocksDraft: true, blocksConfirmation: false, trackedToday: 'partial',
    modules: ['Academy'],
  },

  // ── §3.3 Module-specific (never blocks the draft) ───────────────────────────
  {
    key: 'demographic_reality', name: 'Demographic reality', category: 'module_specific', tier: 'operational_signal',
    description: 'Actual neighborhood age / income / profession.',
    evidence: 'Stated or sourced neighborhood demographics.',
    answeredWhen: 'concrete demographic profile stated', partialWhen: 'a single broad descriptor',
    neverInfer: 'demographics not stated or sourced',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Marketing', 'Guest Intel'],
  },
  {
    key: 'psychographic_guest_profile', name: 'Psychographic guest profile', category: 'module_specific', tier: 'evolving_signal',
    description: 'Values, aesthetics, social behaviour.',
    evidence: 'Owner descriptions of guest values and behaviour.',
    answeredWhen: 'values + aesthetic + behaviour described', partialWhen: 'one dimension only',
    neverInfer: 'psychology not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Guest Intel', 'Brand'],
  },
  {
    key: 'guest_occasion', name: 'Guest occasion', category: 'module_specific', tier: 'evolving_signal',
    description: 'Use cases by daypart / day.',
    evidence: 'Stated occasions across dayparts.',
    answeredWhen: 'occasions mapped across dayparts', partialWhen: 'a single occasion',
    neverInfer: 'occasions not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Guest Intel', 'F&B'],
  },
  {
    key: 'menu_philosophy', name: 'Menu philosophy', category: 'module_specific', tier: 'evolving_signal',
    description: 'The logic behind the menu.',
    evidence: 'A stated menu logic or rationale.',
    answeredWhen: 'an explicit menu logic', partialWhen: 'menu items without logic',
    neverInfer: 'a rationale not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['F&B Program'],
  },
  {
    key: 'physical_environment', name: 'Physical environment', category: 'module_specific', tier: 'operational_signal',
    description: 'Space, layout, capacity zones.',
    evidence: 'Stated space, layout, and zone details.',
    answeredWhen: 'layout + capacity zones described', partialWhen: 'a single space detail',
    neverInfer: 'a layout not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Core Engine', 'Ops'],
  },
  {
    key: 'location_context', name: 'Location context', category: 'module_specific', tier: 'operational_signal',
    description: 'Neighborhood / street / catchment.',
    evidence: 'Stated location and catchment context.',
    answeredWhen: 'neighborhood + catchment described', partialWhen: 'a street name only',
    neverInfer: 'a catchment not stated',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Marketing', 'Guest Intel'],
  },
  {
    key: 'sensory_world', name: 'Sensory world', category: 'module_specific', tier: 'evolving_signal',
    description: 'Light, scent, materials, texture.',
    evidence: 'Stated sensory and material choices.',
    answeredWhen: 'multiple sensory dimensions described', partialWhen: 'one sensory note',
    neverInfer: 'a sensory world not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Brand', 'Ops'],
  },
  {
    key: 'music_energy_rhythm', name: 'Music & energy rhythm', category: 'module_specific', tier: 'evolving_signal',
    description: 'Music + energy across the night.',
    evidence: 'Stated music direction and energy arc.',
    answeredWhen: 'energy arc + music direction described', partialWhen: 'a genre mention only',
    neverInfer: 'an energy arc not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Guest Intel', 'Ops'],
  },
  {
    key: 'social_shareability_strategy', name: 'Social shareability strategy', category: 'module_specific', tier: 'evolving_signal',
    description: 'Instagrammability / shareable moments.',
    evidence: 'Stated shareable moments or intent.',
    answeredWhen: 'specific shareable moments described', partialWhen: 'a vague "instagrammable" claim',
    neverInfer: 'shareability not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Marketing'],
  },
  {
    key: 'marketing_positioning', name: 'Marketing positioning', category: 'module_specific', tier: 'stable_dna',
    description: 'How the venue is positioned vs market.',
    evidence: 'A stated market position.',
    answeredWhen: 'an explicit market position', partialWhen: 'a positioning hint',
    neverInfer: 'a position not stated',
    blocksDraft: false, blocksConfirmation: 'conditional', trackedToday: 'no',
    modules: ['Marketing', 'Brand'],
  },
  {
    key: 'brand_language', name: 'Brand language', category: 'module_specific', tier: 'stable_dna',
    description: 'Voice / tone of the venue.',
    evidence: 'Demonstrated voice and tone.',
    answeredWhen: 'a consistent voice demonstrated', partialWhen: 'a single tone cue',
    neverInfer: 'a voice not demonstrated',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Marketing', 'Brand'],
  },
  {
    key: 'competitive_set', name: 'Competitive set', category: 'module_specific', tier: 'evolving_signal',
    description: 'Who it competes with / against.',
    evidence: 'Named competitors or comparison set.',
    answeredWhen: 'a comparison set named', partialWhen: 'a single competitor',
    neverInfer: 'competitors not named',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Marketing', 'Brand'],
  },
  {
    key: 'local_culture_fit', name: 'Local culture fit', category: 'module_specific', tier: 'evolving_signal',
    description: 'Community / cultural alignment.',
    evidence: 'Stated community or cultural alignment.',
    answeredWhen: 'cultural alignment described', partialWhen: 'a passing cultural note',
    neverInfer: 'cultural fit not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Marketing', 'Guest Intel'],
  },
  {
    key: 'guest_memory_strategy', name: 'Guest memory strategy', category: 'module_specific', tier: 'evolving_signal',
    description: 'How guests are remembered.',
    evidence: 'A stated approach to remembering guests.',
    answeredWhen: 'an explicit memory approach', partialWhen: 'an ad-hoc mention',
    neverInfer: 'a strategy not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Guest Intel', 'Service'],
  },
  {
    key: 'repeat_guest_strategy', name: 'Repeat guest strategy', category: 'module_specific', tier: 'evolving_signal',
    description: 'How regulars are grown / kept.',
    evidence: 'A stated approach to growing regulars.',
    answeredWhen: 'an explicit retention approach', partialWhen: 'a vague "we have regulars"',
    neverInfer: 'a strategy not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Guest Intel', 'Marketing'],
  },
  {
    key: 'rituals_signature_moments', name: 'Rituals & signature moments', category: 'module_specific', tier: 'evolving_signal',
    description: 'Signature, repeatable moments.',
    evidence: 'Described signature moments or rituals.',
    answeredWhen: 'a repeatable signature moment described', partialWhen: 'a one-off mention',
    neverInfer: 'rituals not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Brand', 'Service'],
  },
  {
    key: 'operational_constraints', name: 'Operational constraints', category: 'module_specific', tier: 'operational_signal',
    description: 'Structural limits (space, staffing, hours).',
    evidence: 'Stated structural limits.',
    answeredWhen: 'concrete structural limits described', partialWhen: 'a single constraint',
    neverInfer: 'constraints not described',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Core Engine', 'Ops'],
  },
  {
    key: 'commercial_model', name: 'Commercial model', category: 'module_specific', tier: 'operational_signal',
    description: 'How the money is actually made.',
    evidence: 'A stated revenue / commercial model.',
    answeredWhen: 'an explicit commercial model', partialWhen: 'a partial revenue note',
    neverInfer: 'a model not stated',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Commercial'],
  },
  {
    key: 'growth_ambition', name: 'Growth ambition', category: 'module_specific', tier: 'evolving_signal',
    description: 'Where the upside / ambition is.',
    evidence: 'A stated ambition or upside.',
    answeredWhen: 'an explicit growth ambition', partialWhen: 'a vague aspiration',
    neverInfer: 'ambition not stated',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Commercial', 'Strategy'],
  },

  // ── §3.4 Advanced / later (surfaced, never auto-applied) ────────────────────
  {
    key: 'identity_drift_risks', name: 'Identity drift risks', category: 'advanced', tier: 'proposal_only',
    description: 'Signals the venue is drifting from intent.',
    evidence: 'Derived contradiction / drift signals (never auto-applied).',
    answeredWhen: 'a drift signal is surfaced for review', partialWhen: 'a weak drift hint',
    neverInfer: 'drift from thin evidence',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Drift'],
  },
  {
    key: 'owner_confirmation_status', name: 'Owner confirmation status', category: 'advanced', tier: 'proposal_only',
    description: 'Per-dimension confirmation governance (9D — stored outside venue_dna_json).',
    evidence: 'Owner confirmation records (9D governance store).',
    answeredWhen: 'a confirmation record exists (9D)', partialWhen: 'n/a',
    neverInfer: 'confirmation from LLM text alone',
    blocksDraft: false, blocksConfirmation: false, trackedToday: 'no',
    modules: ['Governance'],
  },
]

// ── Derived structures (spec §3.2 / §6) ──────────────────────────────────────────

// Confirmation-critical dimensions (spec §3.2). Conditional positioning claims are
// included because they become confirmation-critical "when stated as identity".
const CONFIRMATION_CRITICAL_KEYS = DIMENSIONS
  .filter(d => d.blocksConfirmation === true || d.blocksConfirmation === 'conditional')
  .map(d => d.key)

// Working DNA Draft threshold — OR-groups (spec §6). A draft is producible when
// evidence (answered, or partial-with-fact) exists across every group. This is the
// data the 9E-3D readiness engine consumes; this module does not evaluate it.
const WORKING_DRAFT_OR_GROUPS = [
  ['venue_identity'],
  ['target_guest_segments', 'demographic_reality'],
  ['emotional_promise', 'music_energy_rhythm', 'sensory_world'],
  ['hospitality_philosophy', 'service_philosophy'],
  ['fnb_identity', 'beverage_identity'],
  ['operational_pain_points', 'training_philosophy'],
  ['non_negotiables', 'what_venue_must_never_become', 'staff_behavior_standards'],
]

// ── Internal helpers ─────────────────────────────────────────────────────────────

// Deep clone via JSON round-trip — all taxonomy data is plain JSON (strings,
// arrays, booleans), so this is lossless and guarantees callers cannot mutate the
// canonical source.
function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

const DIMENSIONS_BY_KEY = new Map(DIMENSIONS.map(d => [d.key, d]))

// ── Public API (pure, deterministic, read-only) ──────────────────────────────────

/**
 * Return the full taxonomy as a single read-only snapshot (deep-copied).
 */
export function getVenueDnaTaxonomy() {
  return clone({
    version: VENUE_DNA_TAXONOMY_VERSION,
    categories: VENUE_DNA_DIMENSION_CATEGORIES,
    tiers: VENUE_DNA_DIMENSION_TIERS,
    statuses: VENUE_DNA_DIMENSION_STATUSES,
    evidenceTypes: VENUE_DNA_EVIDENCE_TYPES,
    evidenceTiers: VENUE_DNA_EVIDENCE_TIERS,
    confidenceSemantics: VENUE_DNA_CONFIDENCE_SEMANTICS,
    confirmationCriticalKeys: CONFIRMATION_CRITICAL_KEYS,
    workingDraftOrGroups: WORKING_DRAFT_OR_GROUPS,
    dimensions: DIMENSIONS,
  })
}

/**
 * Return a single dimension definition by key (deep-copied), or null if unknown.
 */
export function getVenueDnaDimension(id) {
  const dim = DIMENSIONS_BY_KEY.get(id)
  return dim ? clone(dim) : null
}

/**
 * Return all dimension definitions in canonical order (deep-copied).
 */
export function listVenueDnaDimensions() {
  return DIMENSIONS.map(clone)
}

/**
 * Return the list of dimension keys in canonical order.
 */
export function listVenueDnaDimensionIds() {
  return DIMENSIONS.map(d => d.key)
}

/**
 * True when `id` is a known dimension key.
 */
export function validateVenueDnaDimensionId(id) {
  return DIMENSIONS_BY_KEY.has(id)
}

/**
 * Group dimensions by category. Returns { foundation, module_specific, advanced }
 * with deep-copied dimension arrays.
 */
export function groupVenueDnaDimensionsByCategory() {
  const out = {}
  for (const key of CATEGORY_KEYS) out[key] = []
  for (const dim of DIMENSIONS) out[dim.category].push(clone(dim))
  return out
}

/**
 * Group dimensions by interpretation tier (stable_dna / evolving_signal /
 * operational_signal / proposal_only) with deep-copied dimension arrays.
 */
export function groupVenueDnaDimensionsByTier() {
  const out = {}
  for (const key of TIER_KEYS) out[key] = []
  for (const dim of DIMENSIONS) out[dim.tier].push(clone(dim))
  return out
}

/**
 * Return the confirmation-critical dimension keys (spec §3.2).
 */
export function listConfirmationCriticalDimensions() {
  return [...CONFIRMATION_CRITICAL_KEYS]
}

/**
 * Return the Working-DNA-Draft OR-groups (spec §6), deep-copied.
 */
export function getWorkingDraftThresholdGroups() {
  return clone(WORKING_DRAFT_OR_GROUPS)
}

/**
 * Describe the confidence model. Confidence is COVERAGE, never certainty.
 * Returns a deep copy of the semantics, optionally resolving a numeric value to
 * its band (returns the band id, or null for out-of-range / non-numeric input).
 */
export function describeVenueDnaConfidence(value) {
  const semantics = clone(VENUE_DNA_CONFIDENCE_SEMANTICS)
  const n = Number(value)
  let band = null
  if (Number.isFinite(n)) {
    const match = VENUE_DNA_CONFIDENCE_SEMANTICS.bands.find(b => n >= b.min && n <= b.max)
    band = match ? match.id : null
  }
  return { ...semantics, band }
}

/**
 * Return the dimension status model (spec §4) as a deep copy.
 */
export function listVenueDnaDimensionStatuses() {
  return clone(VENUE_DNA_DIMENSION_STATUSES)
}

/**
 * Return the evidence-type model (spec §5) as a deep copy.
 */
export function listVenueDnaEvidenceTypes() {
  return clone(VENUE_DNA_EVIDENCE_TYPES)
}

export const VENUE_DNA_TAXONOMY_STATUS_KEYS = STATUS_KEYS

export default getVenueDnaTaxonomy
