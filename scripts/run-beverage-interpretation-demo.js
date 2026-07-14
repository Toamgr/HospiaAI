// Offline review harness. This does not call an external model or persist anything.
// It demonstrates the exact input -> prompt -> strict output -> audit path developers can inspect.

import {
  executeBeverageInterpretation,
} from '../src/services/beverage/beverageInterpretationEngine.js'
import { BEVERAGE_INTERPRETATION_SCHEMA_VERSION } from '../src/services/beverage/beverageInterpretationContract.js'

const input = {
  brief: {
    id: 'demo-brief',
    venue_id: 'demo-venue',
    owner_user_id: 'demo-owner',
    status: 'submitted',
    submitted_at: '2026-07-12T12:00:00.000Z',
    fields: {
      venue_type: 'Neighborhood restaurant and cocktail bar',
      service_style: 'Warm, polished, uncomplicated',
      intent_statement: 'Accessible without becoming generic',
      guest_profile: null,
      flavor_direction: 'Bright, savory, restrained sweetness',
      cocktail_count: 12,
      zero_proof_stance: 'One signature zero-proof option',
      constraints: 'Friday service must stay fast and consistent',
      price_range: null,
      staff_capability_note: null,
      season_context: 'Late summer',
    },
  },
  review: {
    id: 'demo-review',
    venue_id: 'demo-venue',
    owner_beverage_brief_id: 'demo-brief',
    reviewer_user_id: 'demo-fnb',
    status: 'approved',
    notes: 'Keep operational load visible in the proposal.',
    field_adjustments: {
      cocktail_count: {
        owner_value: 12,
        adjusted_value: '8-10 signatures in the first proposal',
        note: 'Start with a smaller reviewable scope.',
      },
    },
    decided_at: '2026-07-12T13:00:00.000Z',
  },
  evidence: [
    {
      id: 'expert-prior-small-menu-v1',
      epistemic_class: 'expert_prior',
      scope: 'global',
      label: 'Versioned expert prior',
      value: 'A smaller opening menu can reduce training and preparation complexity, but local impact requires venue evidence.',
      provenance: { kind: 'code_version', reference: 'expert-prior-small-menu-v1' },
    },
  ],
}

function offlineReviewModel({ source_registry: sources }) {
  const find = (fragment) => sources.find((source) => source.id.includes(fragment)).id
  const intent = find('field:intent_statement')
  const constraints = find('field:constraints')
  const adjustment = find('adjustment:cocktail_count')
  const prior = sources.find((source) => source.epistemic_class === 'expert_prior').id

  return {
    provider: 'offline-review-fixture',
    model: 'deterministic-fixture-v1',
    text: JSON.stringify({
      schema_version: BEVERAGE_INTERPRETATION_SCHEMA_VERSION,
      claims: [
        {
          id: 'claim-direction',
          type: 'fact',
          statement: 'The owner requested an accessible beverage direction that does not feel generic.',
          source_ids: [intent],
          confidence: 'high',
          confidence_rationale: 'Direct statement in the submitted owner brief.',
          assumptions: [],
          human_review_required: false,
        },
        {
          id: 'claim-operational-risk',
          type: 'hypothesis',
          statement: 'A larger initial menu may create tension with the stated need for fast and consistent Friday service.',
          source_ids: [constraints, adjustment, prior],
          confidence: 'medium',
          confidence_rationale: 'The sources establish the constraint and approved scope, while operational impact remains unmeasured locally.',
          assumptions: ['Menu size contributes materially to preparation and training load.'],
          human_review_required: true,
        },
        {
          id: 'claim-first-plan',
          type: 'recommendation',
          statement: 'Build an 8-10 signature working proposal and require F&B operational review before any menu approval.',
          source_ids: [adjustment, constraints, prior],
          confidence: 'medium',
          confidence_rationale: 'The approved adjustment supplies the range; the constraint and expert prior support a cautious first scope.',
          assumptions: ['This is a proposal artifact, not authorization to launch a menu.'],
          human_review_required: true,
        },
      ],
      plan: {
        direction_claim_ids: ['claim-direction', 'claim-operational-risk'],
        risk_claim_ids: ['claim-operational-risk'],
        action_claim_ids: ['claim-first-plan'],
      },
      missing_information: [
        {
          id: 'gap-cost-and-price',
          question: 'What verified ingredient costs and target prices apply?',
          reason: 'Profitability cannot be assessed without verified cost and price evidence.',
          source_ids: [],
          blocks_action: true,
        },
      ],
    }),
  }
}

const result = await executeBeverageInterpretation(input, {
  complete: async (request) => offlineReviewModel(request),
  runIdFactory: () => 'demo-run-001',
})

console.log(JSON.stringify(result, null, 2))
