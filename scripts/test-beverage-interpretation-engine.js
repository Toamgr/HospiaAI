import assert from 'node:assert/strict'
import {
  buildBeverageInterpretationContext,
} from '../src/services/beverage/beverageInterpretationContext.js'
import {
  executeBeverageInterpretation,
  prepareBeverageInterpretationRun,
} from '../src/services/beverage/beverageInterpretationEngine.js'
import {
  BEVERAGE_INTERPRETATION_SCHEMA_VERSION,
  validateBeverageInterpretationOutput,
} from '../src/services/beverage/beverageInterpretationContract.js'

const brief = {
  id: 'brief-001',
  venue_id: 'venue-001',
  owner_user_id: 'owner-001',
  status: 'submitted',
  submitted_at: '2026-07-10T10:00:00.000Z',
  fields: {
    venue_type: 'Neighborhood restaurant and cocktail bar',
    service_style: 'Warm, polished, and uncomplicated',
    intent_statement: 'Make the beverage program feel accessible without becoming generic.',
    guest_profile: null,
    flavor_direction: 'Bright, savory, and not excessively sweet',
    cocktail_count: 12,
    zero_proof_stance: 'At least one signature zero-proof option',
    constraints: 'Friday service must stay fast and consistent.',
    price_range: null,
    staff_capability_note: null,
    season_context: 'Late summer',
  },
  field_provenance: {},
}

const review = {
  id: 'review-001',
  venue_id: 'venue-001',
  owner_beverage_brief_id: 'brief-001',
  reviewer_user_id: 'fnb-001',
  status: 'approved',
  notes: 'Use the owner direction as the working brief. Keep operational load visible.',
  field_adjustments: {
    cocktail_count: {
      owner_value: 12,
      adjusted_value: '8-10 signatures for the first working proposal',
      note: 'Reduce initial operational complexity.',
      adjusted_at: '2026-07-10T11:00:00.000Z',
    },
  },
  decided_at: '2026-07-10T11:05:00.000Z',
}

const evidence = [
  {
    id: 'expert-prior-operational-simplicity-v1',
    epistemic_class: 'expert_prior',
    scope: 'global',
    label: 'Versioned beverage expert prior',
    value: 'A smaller first menu can reduce training and prep complexity, but venue evidence is still required to judge local impact.',
    provenance: { kind: 'code_version', reference: 'expert-prior-v1' },
  },
]

const input = { brief, review, evidence }
let passed = 0

async function test(name, fn) {
  try {
    await fn()
    passed += 1
    console.log(`✓ ${name}`)
  } catch (error) {
    console.error(`✗ ${name}`)
    throw error
  }
}

await test('builds effective direction without mutating owner brief', () => {
  const original = JSON.stringify(input)
  const context = buildBeverageInterpretationContext(input)
  assert.equal(context.effective_direction.cocktail_count.value, '8-10 signatures for the first working proposal')
  assert.equal(context.effective_direction.cocktail_count.basis, 'approved_fnb_adjustment')
  assert.ok(context.source_registry.some((source) => source.id === 'owner-brief:brief-001:field:cocktail_count'))
  assert.ok(context.source_registry.some((source) => source.id === 'fnb-review:review-001:adjustment:cocktail_count'))
  assert.equal(JSON.stringify(input), original)
})

await test('refuses interpretation before F&B approval', () => {
  assert.throws(
    () => buildBeverageInterpretationContext({ ...input, review: { ...review, status: 'in_review' } }),
    /must be approved/,
  )
})

await test('preparation is deterministic apart from run id', () => {
  const a = prepareBeverageInterpretationRun(input, { runIdFactory: () => 'run-a' })
  const b = prepareBeverageInterpretationRun(input, { runIdFactory: () => 'run-b' })
  assert.equal(a.context_sha256, b.context_sha256)
  assert.equal(a.prompt_sha256, b.prompt_sha256)
  assert.equal(a.source_registry_sha256, b.source_registry_sha256)
  assert.notEqual(a.run_id, b.run_id)
})

function validOutput(sourceRegistry) {
  const intent = sourceRegistry.find((source) => source.id.includes('field:intent_statement')).id
  const countAdjustment = sourceRegistry.find((source) => source.id.includes('adjustment:cocktail_count')).id
  const constraints = sourceRegistry.find((source) => source.id.includes('field:constraints')).id
  const prior = sourceRegistry.find((source) => source.epistemic_class === 'expert_prior').id
  return {
    schema_version: BEVERAGE_INTERPRETATION_SCHEMA_VERSION,
    claims: [
      {
        id: 'claim-owner-direction',
        type: 'fact',
        statement: 'The owner requested an accessible beverage program that does not feel generic.',
        source_ids: [intent],
        confidence: 'high',
        confidence_rationale: 'This is directly stated in the submitted owner brief.',
        assumptions: [],
        human_review_required: false,
      },
      {
        id: 'claim-operational-tension',
        type: 'derived_observation',
        statement: 'The approved working direction combines a reduced initial signature count with an explicit need for fast, consistent Friday service.',
        source_ids: [countAdjustment, constraints],
        confidence: 'high',
        confidence_rationale: 'This directly compares two approved working-direction sources.',
        assumptions: [],
        human_review_required: true,
      },
      {
        id: 'claim-smaller-first-proposal',
        type: 'recommendation',
        statement: 'Prepare the first proposal around 8-10 signatures and require human operational review before approval.',
        source_ids: [countAdjustment, constraints, prior],
        confidence: 'medium',
        confidence_rationale: 'The approved adjustment supports the range and the expert prior supports testing a smaller first menu, but local outcome evidence does not yet exist.',
        assumptions: ['The first proposal is a review artifact, not a live menu decision.'],
        human_review_required: true,
      },
    ],
    plan: {
      direction_claim_ids: ['claim-owner-direction', 'claim-operational-tension'],
      risk_claim_ids: ['claim-operational-tension'],
      action_claim_ids: ['claim-smaller-first-proposal'],
    },
    missing_information: [
      {
        id: 'gap-costing',
        question: 'What verified costing and target price data should constrain the proposal?',
        reason: 'Without verified cost and price evidence, the engine cannot make profitability claims.',
        source_ids: [],
        blocks_action: true,
      },
    ],
  }
}

await test('accepts a fully cited strict interpretation', () => {
  const context = buildBeverageInterpretationContext(input)
  assert.equal(validateBeverageInterpretationOutput(validOutput(context.source_registry), {
    sourceRegistry: context.source_registry,
  }).claims.length, 3)
})

await test('rejects unknown source ids', () => {
  const context = buildBeverageInterpretationContext(input)
  const output = validOutput(context.source_registry)
  output.claims[0].source_ids = ['invented-source']
  assert.throws(
    () => validateBeverageInterpretationOutput(output, { sourceRegistry: context.source_registry }),
    /unknown source id/,
  )
})

await test('rejects recommendation without human review', () => {
  const context = buildBeverageInterpretationContext(input)
  const output = validOutput(context.source_registry)
  output.claims[2].human_review_required = false
  assert.throws(
    () => validateBeverageInterpretationOutput(output, { sourceRegistry: context.source_registry }),
    /human_review_required=true/,
  )
})

await test('rejects expert-prior-only claim presented as venue fact', () => {
  const context = buildBeverageInterpretationContext(input)
  const output = validOutput(context.source_registry)
  const prior = context.source_registry.find((source) => source.epistemic_class === 'expert_prior').id
  output.claims[0].source_ids = [prior]
  assert.throws(
    () => validateBeverageInterpretationOutput(output, { sourceRegistry: context.source_registry }),
    /expert prior as a venue fact/,
  )
})

await test('executes through an injected offline model and returns audit hashes', async () => {
  const result = await executeBeverageInterpretation(input, {
    runIdFactory: () => 'run-test-001',
    now: () => new Date('2026-07-12T15:00:00.000Z'),
    complete: async ({ source_registry: sourceRegistry, json_mode: jsonMode }) => ({
      text: JSON.stringify(validOutput(sourceRegistry)),
      provider: 'offline-review-fixture',
      model: 'deterministic-fixture-v1',
      jsonMode,
    }),
  })
  assert.equal(result.run.run_id, 'run-test-001')
  assert.equal(result.audit.validation, 'strict_pass')
  assert.equal(result.audit.repaired, false)
  assert.equal(result.audit.provider, 'offline-review-fixture')
  assert.equal(result.audit.generated_at, '2026-07-12T15:00:00.000Z')
  assert.match(result.audit.raw_output_sha256, /^[a-f0-9]{64}$/)
  assert.equal(result.output.claims.length, 3)
})

await test('rejects markdown-wrapped JSON instead of silently repairing it', async () => {
  await assert.rejects(
    executeBeverageInterpretation(input, {
      complete: async ({ source_registry: sourceRegistry }) => `\`\`\`json\n${JSON.stringify(validOutput(sourceRegistry))}\n\`\`\``,
    }),
    /without markdown fences/,
  )
})

console.log(`\n${passed}/9 beverage interpretation engine checks passed.`)
