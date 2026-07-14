// Regression tests — Beverage Interpretation output contract (validator).
// Covers remediation F-03 (human review on every non-fact claim; honest scope of validation) and
// F-09 (source id length aligned between registration and citation), plus the existing invariants.

import { describe, it, expect } from 'vitest'
import { buildBeverageInterpretationContext } from './beverageInterpretationContext.js'
import {
  BEVERAGE_INTERPRETATION_SCHEMA_VERSION,
  validateBeverageInterpretationOutput,
} from './beverageInterpretationContract.js'
import { BEVERAGE_INTERPRETATION_LIMITS as LIMITS } from './beverageInterpretationLimits.js'

function baseContext() {
  return buildBeverageInterpretationContext({
    brief: {
      id: 'brief-A', venue_id: 'venue-A', owner_user_id: 'o', status: 'submitted',
      submitted_at: '2026-07-10T10:00:00.000Z',
      fields: {
        venue_type: 'Bar', service_style: 'Warm', intent_statement: 'Accessible not generic',
        guest_profile: null, flavor_direction: 'Bright', cocktail_count: 12,
        zero_proof_stance: 'One zero-proof', constraints: 'Friday must be fast',
        price_range: null, staff_capability_note: null, season_context: 'Summer',
      },
    },
    review: {
      id: 'review-A', venue_id: 'venue-A', owner_beverage_brief_id: 'brief-A', reviewer_user_id: 'f',
      status: 'approved', notes: 'ok',
      field_adjustments: { cocktail_count: { owner_value: 12, adjusted_value: '8-10' } },
      decided_at: '2026-07-10T11:05:00.000Z',
    },
    evidence: [{ id: 'p1', epistemic_class: 'expert_prior', scope: 'global', label: 'l', value: 'v', provenance: { kind: 'code_version', reference: 'v1' } }],
  })
}

function claim(over = {}) {
  return {
    id: 'claim-1', type: 'fact', statement: 'The owner requested an accessible program.',
    source_ids: [], confidence: 'high', confidence_rationale: 'Stated directly.',
    assumptions: [], human_review_required: false, ...over,
  }
}
function wrap(claims, plan) {
  return {
    schema_version: BEVERAGE_INTERPRETATION_SCHEMA_VERSION,
    claims,
    plan: plan ?? { direction_claim_ids: [], risk_claim_ids: [], action_claim_ids: [] },
    missing_information: [],
  }
}

describe('F-03 — human review required for every non-fact claim', () => {
  it('rejects a derived_observation with human_review_required=false', () => {
    const ctx = baseContext()
    const intent = ctx.source_registry.find((s) => s.id.includes('field:intent_statement')).id
    const out = wrap(
      [claim({ type: 'derived_observation', source_ids: [intent], human_review_required: false })],
      { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] },
    )
    expect(() => validateBeverageInterpretationOutput(out, { sourceRegistry: ctx.source_registry }))
      .toThrow(/human_review_required=true for derived_observation/)
  })
  it('rejects a hypothesis with human_review_required=false', () => {
    const ctx = baseContext()
    const intent = ctx.source_registry.find((s) => s.id.includes('field:intent_statement')).id
    const out = wrap(
      [claim({ type: 'hypothesis', source_ids: [intent], human_review_required: false })],
      { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] },
    )
    expect(() => validateBeverageInterpretationOutput(out, { sourceRegistry: ctx.source_registry }))
      .toThrow(/human_review_required=true for hypothesis/)
  })
  it('rejects a recommendation with human_review_required=false', () => {
    const ctx = baseContext()
    const intent = ctx.source_registry.find((s) => s.id.includes('field:intent_statement')).id
    const out = wrap(
      [claim({ type: 'recommendation', source_ids: [intent], human_review_required: false })],
      { direction_claim_ids: [], risk_claim_ids: [], action_claim_ids: ['claim-1'] },
    )
    expect(() => validateBeverageInterpretationOutput(out, { sourceRegistry: ctx.source_registry }))
      .toThrow(/human_review_required=true for recommendation/)
  })
  it('a causal claim mislabeled as derived_observation can no longer pass without human review', () => {
    const ctx = baseContext()
    const intent = ctx.source_registry.find((s) => s.id.includes('field:intent_statement')).id
    const out = wrap(
      [claim({ type: 'derived_observation', statement: 'Cutting the menu will raise Friday revenue because guests order faster.', source_ids: [intent], human_review_required: false })],
      { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] },
    )
    expect(() => validateBeverageInterpretationOutput(out, { sourceRegistry: ctx.source_registry })).toThrow(/human_review_required/)
  })
  it('accepts a fact with human_review_required=false (deterministic fact is the only exception)', () => {
    const ctx = baseContext()
    const intent = ctx.source_registry.find((s) => s.id.includes('field:intent_statement')).id
    const out = wrap([claim({ type: 'fact', source_ids: [intent], human_review_required: false })], { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] })
    expect(validateBeverageInterpretationOutput(out, { sourceRegistry: ctx.source_registry }).claims.length).toBe(1)
  })
})

describe('F-03 — the validator is honest about what it does NOT prove', () => {
  it('a valid but semantically unrelated citation still validates (documented limitation)', () => {
    const ctx = baseContext()
    const constraints = ctx.source_registry.find((s) => s.id.includes('field:constraints')).id
    const out = wrap([claim({ type: 'fact', statement: 'Guests love espresso martinis.', source_ids: [constraints], human_review_required: false })], { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] })
    // This is intentionally accepted: reference-existence validation cannot prove semantic support.
    expect(validateBeverageInterpretationOutput(out, { sourceRegistry: ctx.source_registry }).claims[0].statement).toContain('espresso')
  })
  it('rejects an expert-prior-only fact (class-level guard still holds)', () => {
    const ctx = baseContext()
    const out = wrap([claim({ type: 'fact', source_ids: ['evidence:p1'], human_review_required: false })], { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] })
    expect(() => validateBeverageInterpretationOutput(out, { sourceRegistry: ctx.source_registry })).toThrow(/expert prior as a venue fact/)
  })
})

describe('F-09 — a registrable source id is always citable', () => {
  it('an id at exactly MAX_SOURCE_ID_LENGTH registers and can be cited', () => {
    // brief id bounded so the generated id stays short; use evidence to exercise the id-length path.
    const longId = 'z'.repeat(LIMITS.MAX_SOURCE_ID_LENGTH - 'evidence:'.length)
    const ctx = buildBeverageInterpretationContext({
      brief: {
        id: 'brief-A', venue_id: 'venue-A', owner_user_id: 'o', status: 'submitted', submitted_at: '2026-07-10T10:00:00.000Z',
        fields: { venue_type: 'Bar', service_style: null, intent_statement: 'x', guest_profile: null, flavor_direction: null, cocktail_count: null, zero_proof_stance: null, constraints: null, price_range: null, staff_capability_note: null, season_context: null },
      },
      review: { id: 'review-A', venue_id: 'venue-A', owner_beverage_brief_id: 'brief-A', reviewer_user_id: 'f', status: 'approved', notes: null, field_adjustments: {}, decided_at: '2026-07-10T11:00:00.000Z' },
      evidence: [{ id: longId, epistemic_class: 'expert_prior', scope: 'global', label: 'l', value: 'v', provenance: { kind: 'code_version', reference: 'v1' } }],
    })
    const citable = ctx.source_registry.find((s) => s.id === `evidence:${longId}`)
    expect(citable).toBeDefined()
    const out = wrap([claim({ type: 'hypothesis', source_ids: [citable.id], human_review_required: true })], { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] })
    // Must not throw "exceeds N characters" for a source that was allowed into the registry.
    expect(validateBeverageInterpretationOutput(out, { sourceRegistry: ctx.source_registry }).claims.length).toBe(1)
  })
})

describe('contract invariants (unchanged)', () => {
  it('rejects unknown source ids', () => {
    const ctx = baseContext()
    const out = wrap([claim({ source_ids: ['made-up'] })], { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] })
    expect(() => validateBeverageInterpretationOutput(out, { sourceRegistry: ctx.source_registry })).toThrow(/unknown source id/)
  })
  it('rejects unknown top-level and claim keys', () => {
    const ctx = baseContext()
    const intent = ctx.source_registry.find((s) => s.id.includes('field:intent_statement')).id
    const good = wrap([claim({ source_ids: [intent] })], { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] })
    const topBad = { ...good, extra: 1 }
    expect(() => validateBeverageInterpretationOutput(topBad, { sourceRegistry: ctx.source_registry })).toThrow(/unknown key/)
    const claimBad = wrap([{ ...claim({ source_ids: [intent] }), extra: 1 }], { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] })
    expect(() => validateBeverageInterpretationOutput(claimBad, { sourceRegistry: ctx.source_registry })).toThrow(/unknown key/)
  })
  it('rejects duplicate claim ids and invalid plan references', () => {
    const ctx = baseContext()
    const intent = ctx.source_registry.find((s) => s.id.includes('field:intent_statement')).id
    const dup = wrap([claim({ source_ids: [intent] }), claim({ source_ids: [intent] })], { direction_claim_ids: ['claim-1'], risk_claim_ids: [], action_claim_ids: [] })
    expect(() => validateBeverageInterpretationOutput(dup, { sourceRegistry: ctx.source_registry })).toThrow(/duplicate id/)
    const ghost = wrap([claim({ source_ids: [intent] })], { direction_claim_ids: ['claim-ghost'], risk_claim_ids: [], action_claim_ids: [] })
    expect(() => validateBeverageInterpretationOutput(ghost, { sourceRegistry: ctx.source_registry })).toThrow(/unknown claim id/)
  })
})
