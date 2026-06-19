// F&B Decision Explanation Service — Phase 4 (read-only, deterministic).
//
// Turns ONE already-venue-scoped fb_decisions row (fetched by the route via
// getFbDecisionById) into a structured, plain-language explanation answering
// "why was this F&B decision made?".
//
// Doctrine: docs/architecture/DECISION_LEDGER_DOCTRINE.md,
//           docs/architecture/FNB_DECISION_LEDGER_PHASE_4_EXPLANATION_PLAN.md
//
// HARD RULES (enforced by design):
//   - Pure + deterministic. No db import. No AI calls. No network. No mutation.
//   - No Event Builder / Cocktail Lab imports.
//   - Reads ONLY recorded ledger fields. Never invents reasoning.
//   - Fields Phase 3 does not populate are reported as "not recorded" — never inferred.
//   - The input row is assumed already venue-scoped by the caller; this module does
//     no venue filtering itself (and never sees other venues' data).

// The list of fields Phase 3 never populates today — reported honestly as limits.
const NEVER_RECORDED_BY_PHASE_3 = Object.freeze([
  { key: 'assumptions', label: 'assumptions' },
  { key: 'missing_fields', label: 'known missing information at decision time' },
  { key: 'future_validation_targets', label: 'future sales/POS validation targets' },
  { key: 'taste_profile_target', label: 'decimal taste-profile target' },
  { key: 'venue_dna_hash', label: 'Venue DNA snapshot hash' },
])

function isEmptyValue(v) {
  if (v === null || v === undefined) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v).length === 0
  return false
}

function asArray(v) {
  return Array.isArray(v) ? v : (v === null || v === undefined ? [] : [v])
}

// ── Evidence ─────────────────────────────────────────────────────────────────

/**
 * Normalize the recorded evidence into readable labels. Honest [] when none.
 * Each entry → "source" or "source:ref".
 */
export function summarizeEvidence(decision) {
  const ev = decision && decision.evidence
  if (isEmptyValue(ev)) return []
  return asArray(ev)
    .map(e => {
      if (!e || typeof e !== 'object') return typeof e === 'string' ? e : null
      const src = e.source || e.type || null
      if (!src) return null
      return e.ref ? `${src}:${e.ref}` : String(src)
    })
    .filter(Boolean)
}

// ── Confidence ───────────────────────────────────────────────────────────────

/**
 * Map recorded confidence to { level, detail }. level ∈ high|medium|low|none.
 * `none` when nothing is recorded (most selected/rejected rows). Never fabricates.
 */
export function summarizeConfidence(decision) {
  const c = decision && decision.confidence
  if (isEmptyValue(c)) {
    return { level: 'none', detail: 'No confidence was recorded for this decision.' }
  }
  // Phase 3 records confidence only for generation rows, as { omer: <0-100> }.
  const numbers = Object.values(c).filter(v => typeof v === 'number' && Number.isFinite(v))
  if (!numbers.length) {
    return { level: 'none', detail: 'No numeric confidence was recorded for this decision.' }
  }
  const score = Math.max(...numbers)
  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'
  return { level, detail: `Recorded confidence signals: ${JSON.stringify(c)}.` }
}

// ── Decision basis ───────────────────────────────────────────────────────────

/**
 * Build the structured "basis" from recorded fields only, plus an honest,
 * type-appropriate framing. Never invents strategic rationale.
 */
export function summarizeDecisionBasis(decision) {
  const d = decision || {}
  const provenance = isEmptyValue(d.provenance) ? null : d.provenance
  const drivers = {}

  if (d.decision_type === 'cocktail_menu_generated') {
    const flowType = d.decision_payload && d.decision_payload.flow_type
    if (flowType) drivers.flow_type = flowType
    if (!isEmptyValue(d.menu_snapshot)) drivers.generated = d.menu_snapshot
    if (!isEmptyValue(d.venue_dna_snapshot)) drivers.bar_dna_dimensions = d.venue_dna_snapshot
  } else if (d.decision_type === 'cocktail_selected') {
    if (!isEmptyValue(d.recipe_snapshot)) drivers.saved_recipe = d.recipe_snapshot
    if (!isEmptyValue(d.decision_payload)) drivers.costing = d.decision_payload
    if (d.related_cocktail_id != null) drivers.cocktail_id = d.related_cocktail_id
    if (d.related_menu_id != null) drivers.menu_id = d.related_menu_id
  } else if (d.decision_type === 'cocktail_rejected') {
    const reasons = d.decision_payload && d.decision_payload.reasons
    if (!isEmptyValue(reasons)) drivers.reasons = reasons
    if (!isEmptyValue(d.subject_ref)) drivers.subject = d.subject_ref
    if (!isEmptyValue(d.recipe_snapshot)) drivers.rejected_profile = d.recipe_snapshot
  }

  // Venue context is only meaningfully recorded for generation rows.
  const eb = isEmptyValue(d.explanation_basis) ? null : d.explanation_basis
  const venue_context = {
    omer_active: eb && typeof eb.omer_active === 'boolean' ? eb.omer_active : null,
    omer_confidence: eb && typeof eb.omer_confidence === 'number' ? eb.omer_confidence : null,
    bar_dna_dimensions: isEmptyValue(d.venue_dna_snapshot) ? null : d.venue_dna_snapshot,
  }

  return { provenance, drivers, venue_context }
}

// ── Missing information ──────────────────────────────────────────────────────

/**
 * Explicit list of what is NOT recorded for this row, so limits are visible.
 * Includes both row-level absences and the Phase-3-wide absences.
 */
export function summarizeMissingInformation(decision) {
  const d = decision || {}
  const missing = []

  // Per-row absences that vary by type
  if (isEmptyValue(d.evidence)) missing.push('no evidence sources recorded')
  if (isEmptyValue(d.confidence)) missing.push('no confidence recorded')
  if (isEmptyValue(d.explanation_basis)) missing.push('no recorded venue-context explanation basis')
  if (isEmptyValue(d.venue_dna_snapshot)) missing.push('no Bar DNA snapshot recorded')

  // Phase-3-wide absences (always true today) — honest, never inferred
  for (const f of NEVER_RECORDED_BY_PHASE_3) {
    if (isEmptyValue(d[f.key])) missing.push(`no ${f.label} recorded`)
  }
  // Deduplicate while preserving order
  return Array.from(new Set(missing))
}

// ── Warnings + limits ────────────────────────────────────────────────────────

function buildWarnings(decision, confidence) {
  const d = decision || {}
  const warnings = []
  // Costing estimates must never read as verified.
  const costing = d.decision_payload && d.decision_payload.costing_basis
  if (costing === 'estimate' || (Array.isArray(d.evidence) && d.evidence.some(e => e && e.ref === 'estimate'))) {
    warnings.push('Costing figures are estimates, not verified prices.')
  }
  if (confidence.level === 'none') warnings.push('No confidence was recorded for this decision.')
  else if (confidence.level === 'low') warnings.push('Recorded confidence is low; treat this basis as provisional.')
  if (isEmptyValue(d.evidence)) warnings.push('No evidence sources were recorded for this decision.')
  return warnings
}

function buildExplanationLimits(decision) {
  return [
    'Taste-profile rationale is not recorded for CI decisions yet (planned for a later phase).',
    'Specific Venue DNA dimension reasoning is not recorded; only a Bar DNA snapshot and Omer context (when present) are captured.',
    'Commercial/sales outcomes are not recorded; POS validation is not integrated.',
    'This explanation is assembled deterministically from recorded ledger fields only — no AI and no inferred reasoning.',
  ]
}

// ── Plain-language answer ────────────────────────────────────────────────────

function composeAnswer(decision, basis, evidence, confidence) {
  const d = decision || {}
  const title = d.decision_title || '(untitled decision)'
  const parts = []

  if (d.decision_type === 'cocktail_menu_generated') {
    const flow = (basis.drivers && basis.drivers.flow_type) || 'a menu'
    const count = basis.drivers && basis.drivers.generated && basis.drivers.generated.count
    parts.push(`HESTIA generated ${typeof count === 'number' ? `${count} item(s) for ` : ''}${flow} ("${title}").`)
    if (basis.venue_context.omer_active) {
      parts.push(`Venue intelligence context was active${typeof basis.venue_context.omer_confidence === 'number' ? ` (confidence ${basis.venue_context.omer_confidence})` : ''}.`)
    } else {
      parts.push('Venue intelligence context was not active at generation time, so the build leaned on the request and general bar knowledge.')
    }
    if (basis.venue_context.bar_dna_dimensions) parts.push('Bar DNA dimensions on record were available to the generator.')
  } else if (d.decision_type === 'cocktail_selected') {
    const name = basis.drivers && basis.drivers.saved_recipe && basis.drivers.saved_recipe.name
    parts.push(`This records that a team member saved/selected the cocktail${name ? ` "${name}"` : ''} into the venue's program.`)
    parts.push('It captures the saved recipe; it does not record a separate strategic rationale beyond the human save action.')
    if (basis.drivers && basis.drivers.costing) parts.push('Cost figures attached here are estimates, not verified prices.')
  } else if (d.decision_type === 'cocktail_rejected') {
    const reasons = basis.drivers && basis.drivers.reasons
    parts.push(`This records that a team member rejected this cocktail.`)
    if (!isEmptyValue(reasons)) parts.push(`Recorded reason(s): ${asArray(reasons).join(', ')}.`)
    else parts.push('No specific rejection reason was recorded.')
  } else {
    parts.push(`Recorded decision: "${title}".`)
  }

  parts.push(evidence.length ? `Evidence on record: ${evidence.join(', ')}.` : 'No evidence sources were recorded.')
  parts.push(confidence.level === 'none' ? 'No confidence was recorded.' : `Recorded confidence: ${confidence.level}.`)
  return parts.join(' ')
}

// ── Public entry point ───────────────────────────────────────────────────────

/**
 * Build the full explanation object from one ledger row.
 * If `decision` is null/empty, returns an honest { can_explain: false } shape
 * (the route maps a missing row to 404; this is the in-service safety net).
 */
export function buildFbDecisionExplanation(decision) {
  if (!decision || typeof decision !== 'object' || !decision.id) {
    return {
      ok: true,
      can_explain: false,
      decision_id: null,
      answer: 'No decision was found, so there is no recorded basis to explain.',
      explanation_limits: ['No ledger row was available.'],
      warnings: [],
      evidence: [],
      confidence: { level: 'none', detail: 'No decision available.' },
      assumptions: [],
      missing_information: ['no decision record available'],
      future_validation_targets: [],
    }
  }

  const basis = summarizeDecisionBasis(decision)
  const evidence = summarizeEvidence(decision)
  const confidence = summarizeConfidence(decision)
  const missing_information = summarizeMissingInformation(decision)
  const warnings = buildWarnings(decision, confidence)
  const explanation_limits = buildExplanationLimits(decision)
  const answer = composeAnswer(decision, basis, evidence, confidence)

  // assumptions / future_validation_targets are never recorded by Phase 3 → honest empties.
  const assumptions = isEmptyValue(decision.assumptions) ? [] : asArray(decision.assumptions)
  const future_validation_targets = isEmptyValue(decision.future_validation_targets)
    ? []
    : asArray(decision.future_validation_targets)

  // can_explain: true if there is any real basis (drivers, evidence, or venue context).
  const hasBasis = !isEmptyValue(basis.drivers) || evidence.length > 0
    || basis.venue_context.omer_active === true || !isEmptyValue(basis.provenance)

  return {
    ok: true,
    can_explain: hasBasis,
    decision_id: decision.id,
    decision_type: decision.decision_type || null,
    source_engine: decision.source_engine || null,
    title: decision.decision_title || null,
    summary: decision.decision_summary || null,
    answer,
    basis,
    evidence,
    confidence,
    assumptions,
    missing_information,
    future_validation_targets,
    warnings,
    explanation_limits,
  }
}
