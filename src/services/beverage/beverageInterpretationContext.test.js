// Regression tests — Beverage Interpretation context builder.
// Covers remediation findings F-02 (venue binding / scope), F-04 (input size limits), and F-08
// (controlled provenance errors). Each vulnerability-derived case fails against the pre-remediation
// builder and passes after it.

import { describe, it, expect } from 'vitest'
import {
  buildBeverageInterpretationContext,
  SOURCE_SCOPES,
} from './beverageInterpretationContext.js'
import { BEVERAGE_INTERPRETATION_LIMITS as LIMITS } from './beverageInterpretationLimits.js'

function makeBrief(over = {}) {
  return {
    id: 'brief-A', venue_id: 'venue-A', owner_user_id: 'owner-1', status: 'submitted',
    submitted_at: '2026-07-10T10:00:00.000Z',
    fields: {
      venue_type: 'Bar', service_style: 'Warm', intent_statement: 'Accessible not generic',
      guest_profile: null, flavor_direction: 'Bright', cocktail_count: 12,
      zero_proof_stance: 'One zero-proof', constraints: 'Friday must be fast',
      price_range: null, staff_capability_note: null, season_context: 'Summer',
    },
    ...over,
  }
}
function makeReview(over = {}) {
  return {
    id: 'review-A', venue_id: 'venue-A', owner_beverage_brief_id: 'brief-A',
    reviewer_user_id: 'fnb-1', status: 'approved', notes: 'Approved as working brief.',
    field_adjustments: {
      cocktail_count: { owner_value: 12, adjusted_value: '8-10', note: 'smaller', adjusted_at: '2026-07-10T11:00:00.000Z' },
    },
    decided_at: '2026-07-10T11:05:00.000Z',
    ...over,
  }
}
const globalPrior = (over = {}) => ({
  id: 'prior-1', epistemic_class: 'expert_prior', scope: 'global',
  label: 'prior', value: 'small menus can be simpler', provenance: { kind: 'code_version', reference: 'v1' }, ...over,
})
const venueEvidence = (over = {}) => ({
  id: 'sales-1', epistemic_class: 'operational_evidence', scope: 'venue', venue_id: 'venue-A',
  label: 'sales', value: '42 units', provenance: { kind: 'pos_import', reference: 'venue-A/2026-06' }, ...over,
})

describe('context builder — gating & non-mutation (unchanged behavior)', () => {
  it('builds a registry from an approved brief + review', () => {
    const ctx = buildBeverageInterpretationContext({ brief: makeBrief(), review: makeReview() })
    expect(ctx.source_registry.length).toBeGreaterThan(0)
    expect(ctx.venue_id).toBe('venue-A')
  })
  it('does not mutate the input records', () => {
    const input = { brief: makeBrief(), review: makeReview(), evidence: [globalPrior()] }
    const snapshot = JSON.stringify(input)
    buildBeverageInterpretationContext(input)
    expect(JSON.stringify(input)).toBe(snapshot)
  })
  it('every owner/F&B source is stamped scope:venue with the trusted brief venue', () => {
    const ctx = buildBeverageInterpretationContext({ brief: makeBrief(), review: makeReview() })
    for (const s of ctx.source_registry) {
      expect(s.scope).toBe('venue')
      expect(s.venue_id).toBe('venue-A')
    }
  })
})

describe('F-02 — venue binding for external evidence', () => {
  it('rejects venue-scoped evidence from a DIFFERENT venue', () => {
    expect(() => buildBeverageInterpretationContext({
      brief: makeBrief(), review: makeReview(),
      evidence: [venueEvidence({ venue_id: 'venue-B', provenance: { kind: 'pos_import', reference: 'venue-B/2026-06' } })],
    })).toThrow(/different venue/)
  })
  it('cross-venue rejection does not echo the foreign venue id', () => {
    let message = ''
    try {
      buildBeverageInterpretationContext({
        brief: makeBrief(), review: makeReview(),
        evidence: [venueEvidence({ venue_id: 'venue-SECRET-999' })],
      })
    } catch (e) { message = e.message }
    expect(message).not.toContain('venue-SECRET-999')
  })
  it('rejects venue-scoped evidence with no venue_id', () => {
    expect(() => buildBeverageInterpretationContext({
      brief: makeBrief(), review: makeReview(),
      evidence: [venueEvidence({ venue_id: undefined })],
    })).toThrow(/requires a non-empty venue_id/)
  })
  it('rejects venue-scoped evidence with an empty venue_id', () => {
    expect(() => buildBeverageInterpretationContext({
      brief: makeBrief(), review: makeReview(),
      evidence: [venueEvidence({ venue_id: '   ' })],
    })).toThrow(/requires a non-empty venue_id/)
  })
  it('rejects evidence with no scope at all', () => {
    expect(() => buildBeverageInterpretationContext({
      brief: makeBrief(), review: makeReview(),
      evidence: [{ id: 'x', epistemic_class: 'expert_prior', label: 'l', value: 'v', provenance: { kind: 'k', reference: 'r' } }],
    })).toThrow(/scope must be one of/)
  })
  it('accepts a global expert prior with no venue_id', () => {
    const ctx = buildBeverageInterpretationContext({ brief: makeBrief(), review: makeReview(), evidence: [globalPrior()] })
    const injected = ctx.source_registry.find((s) => s.id === 'evidence:prior-1')
    expect(injected.scope).toBe('global')
    expect(injected.venue_id).toBeNull()
  })
  it('rejects a global source that is NOT an expert prior (prior masquerading as venue evidence)', () => {
    expect(() => buildBeverageInterpretationContext({
      brief: makeBrief(), review: makeReview(),
      evidence: [globalPrior({ epistemic_class: 'operational_evidence' })],
    })).toThrow(/only allowed for expert_prior/)
  })
  it('rejects a global expert prior that also declares a venue_id', () => {
    expect(() => buildBeverageInterpretationContext({
      brief: makeBrief(), review: makeReview(),
      evidence: [globalPrior({ venue_id: 'venue-A' })],
    })).toThrow(/must not declare a venue_id/)
  })
  it('accepts venue evidence whose venue_id matches the brief', () => {
    const ctx = buildBeverageInterpretationContext({ brief: makeBrief(), review: makeReview(), evidence: [venueEvidence()] })
    const injected = ctx.source_registry.find((s) => s.id === 'evidence:sales-1')
    expect(injected.venue_id).toBe('venue-A')
    expect(injected.scope).toBe('venue')
  })
  it('exposes the scope vocabulary', () => {
    expect(SOURCE_SCOPES).toEqual(['venue', 'global'])
  })
})

describe('F-04 — input size limits (context stage)', () => {
  it('rejects more than MAX_SOURCE_COUNT sources', () => {
    const evidence = Array.from({ length: LIMITS.MAX_SOURCE_COUNT + 5 }, (_, i) => globalPrior({ id: `p-${i}` }))
    expect(() => buildBeverageInterpretationContext({ brief: makeBrief(), review: makeReview(), evidence }))
      .toThrow(/exceeds .* sources|exceeds .* bytes/)
  })
  it('rejects an oversized source id', () => {
    expect(() => buildBeverageInterpretationContext({
      brief: makeBrief(), review: makeReview(),
      evidence: [globalPrior({ id: 'z'.repeat(LIMITS.MAX_SOURCE_ID_LENGTH + 1) })],
    })).toThrow(/id exceeds/)
  })
  it('rejects oversized provenance', () => {
    const huge = { kind: 'k', reference: 'r', blob: 'x'.repeat(LIMITS.MAX_PROVENANCE_SERIALIZED_LENGTH + 10) }
    expect(() => buildBeverageInterpretationContext({
      brief: makeBrief(), review: makeReview(), evidence: [globalPrior({ provenance: huge })],
    })).toThrow(/provenance exceeds/)
  })
  it('rejects a total registry over the byte budget', () => {
    // Each source value is bounded, so approach the total-bytes cap with many mid-size sources.
    const big = 'y'.repeat(LIMITS.MAX_SOURCE_VALUE_LENGTH - 100)
    const evidence = Array.from({ length: 60 }, (_, i) => globalPrior({ id: `p-${i}`, value: big }))
    expect(() => buildBeverageInterpretationContext({ brief: makeBrief(), review: makeReview(), evidence }))
      .toThrow(/exceeds .* bytes|exceeds .* sources/)
  })
})

describe('F-08 — controlled provenance errors', () => {
  it('rejects circular provenance with a BAD_REQUEST, not an uncontrolled TypeError', () => {
    const prov = { kind: 'k', reference: 'r' }
    prov.self = prov
    let err
    try {
      buildBeverageInterpretationContext({ brief: makeBrief(), review: makeReview(), evidence: [globalPrior({ provenance: prov })] })
    } catch (e) { err = e }
    expect(err).toBeDefined()
    expect(err).not.toBeInstanceOf(TypeError)
    expect(err.code).toBe('BAD_REQUEST')
  })
})
