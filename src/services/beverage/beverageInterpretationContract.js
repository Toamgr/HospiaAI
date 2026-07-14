// HESTIA Beverage Interpretation Engine — strict output contract.
//
// This module deliberately contains no provider, prompt, persistence, or UI logic. It is the
// reviewable boundary between an untrusted model completion and HESTIA's trusted application
// code. Model output is rejected rather than repaired when it violates the contract.
//
// WHAT THIS VALIDATOR PROVES (and what it does NOT — remediation F-03):
//   This is CITATION REFERENCE VALIDATION, not SEMANTIC EVIDENCE VERIFICATION. It can prove that
//   a cited source id EXISTS in the closed registry, that the claim shape is legal, that the
//   source epistemic class is permitted for the claim type, and that a human-review flag is
//   present wherever required. It CANNOT prove that the cited source actually SUPPORTS the
//   statement, that causal wording is correct, that a number matches its source file, or that the
//   model did not phrase a misleading claim. Do not describe a passing validation as proof that
//   the evidence supports the claim.

import { BEVERAGE_INTERPRETATION_LIMITS as LIMITS } from './beverageInterpretationLimits.js'

export const BEVERAGE_INTERPRETATION_SCHEMA_VERSION = 'hestia-beverage-interpretation.v1'

export const INTERPRETATION_CLAIM_TYPES = Object.freeze([
  'fact',
  'derived_observation',
  'hypothesis',
  'recommendation',
])

// Every claim type EXCEPT a deterministic `fact` requires explicit human review before any
// downstream use (remediation F-03). A `fact` is the only class allowed to carry
// human_review_required=false, and even then only under the fact-source-class rule below.
const CLAIM_TYPES_REQUIRING_HUMAN_REVIEW = Object.freeze(['derived_observation', 'hypothesis', 'recommendation'])

export const INTERPRETATION_CONFIDENCE_LEVELS = Object.freeze(['low', 'medium', 'high'])

const TOP_LEVEL_KEYS = Object.freeze(['schema_version', 'claims', 'plan', 'missing_information'])
const CLAIM_KEYS = Object.freeze([
  'id',
  'type',
  'statement',
  'source_ids',
  'confidence',
  'confidence_rationale',
  'assumptions',
  'human_review_required',
])
const PLAN_KEYS = Object.freeze(['direction_claim_ids', 'risk_claim_ids', 'action_claim_ids'])
const MISSING_INFORMATION_KEYS = Object.freeze([
  'id',
  'question',
  'reason',
  'source_ids',
  'blocks_action',
])

// All bounds come from the shared limits module (F-04). No magic numbers here.
const MAX_CLAIMS = LIMITS.MAX_CLAIM_COUNT
const MAX_MISSING_ITEMS = LIMITS.MAX_MISSING_ITEM_COUNT
const MAX_STATEMENT_LENGTH = LIMITS.MAX_CLAIM_STATEMENT_LENGTH
const MAX_RATIONALE_LENGTH = LIMITS.MAX_CLAIM_RATIONALE_LENGTH
const MAX_ASSUMPTIONS = LIMITS.MAX_ASSUMPTIONS_PER_CLAIM
const MAX_ASSUMPTION_LENGTH = LIMITS.MAX_ASSUMPTION_LENGTH
const MAX_SOURCE_ID_LENGTH = LIMITS.MAX_SOURCE_ID_LENGTH
const MAX_REFERENCES_PER_CLAIM = LIMITS.MAX_SOURCE_REFERENCES_PER_CLAIM
const MAX_PLAN_ITEMS = LIMITS.MAX_PLAN_ITEM_COUNT

function invalid(message) {
  const error = new Error(`beverageInterpretation: ${message}`)
  error.code = 'INVALID_INTERPRETATION_OUTPUT'
  return error
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw invalid(`${label} must be an object.`)
  }
}

function assertOnlyKeys(value, allowedKeys, label) {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) throw invalid(`${label} contains unknown key "${key}".`)
  }
  for (const key of allowedKeys) {
    if (!(key in value)) throw invalid(`${label} is missing required key "${key}".`)
  }
}

function assertString(value, label, { allowEmpty = false, maxLength = MAX_STATEMENT_LENGTH } = {}) {
  if (typeof value !== 'string') throw invalid(`${label} must be text.`)
  if (!allowEmpty && value.trim().length === 0) throw invalid(`${label} cannot be empty.`)
  if ([...value].length > maxLength) throw invalid(`${label} exceeds ${maxLength} characters.`)
}

function assertBoolean(value, label) {
  if (typeof value !== 'boolean') throw invalid(`${label} must be boolean.`)
}

function assertStringArray(value, label, { maxItems = 100, allowEmpty = true } = {}) {
  if (!Array.isArray(value)) throw invalid(`${label} must be an array.`)
  if (!allowEmpty && value.length === 0) throw invalid(`${label} cannot be empty.`)
  if (value.length > maxItems) throw invalid(`${label} exceeds ${maxItems} items.`)
  const seen = new Set()
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index]
    assertString(item, `${label}[${index}]`, { maxLength: MAX_SOURCE_ID_LENGTH })
    if (seen.has(item)) throw invalid(`${label} contains duplicate value "${item}".`)
    seen.add(item)
  }
}

function sourceMapFromRegistry(sourceRegistry) {
  if (!Array.isArray(sourceRegistry)) throw invalid('sourceRegistry must be an array.')
  const sourceMap = new Map()
  for (const source of sourceRegistry) {
    assertPlainObject(source, 'sourceRegistry item')
    assertString(source.id, 'sourceRegistry item.id', { maxLength: MAX_SOURCE_ID_LENGTH })
    if (sourceMap.has(source.id)) throw invalid(`sourceRegistry contains duplicate id "${source.id}".`)
    sourceMap.set(source.id, source)
  }
  return sourceMap
}

function validateClaim(claim, index, sourceMap) {
  const label = `claims[${index}]`
  assertPlainObject(claim, label)
  assertOnlyKeys(claim, CLAIM_KEYS, label)
  assertString(claim.id, `${label}.id`, { maxLength: 120 })
  if (!/^claim-[a-z0-9][a-z0-9-]*$/i.test(claim.id)) {
    throw invalid(`${label}.id must use the form "claim-...".`)
  }
  if (!INTERPRETATION_CLAIM_TYPES.includes(claim.type)) {
    throw invalid(`${label}.type must be one of ${INTERPRETATION_CLAIM_TYPES.join(', ')}.`)
  }
  assertString(claim.statement, `${label}.statement`, { maxLength: MAX_STATEMENT_LENGTH })
  assertStringArray(claim.source_ids, `${label}.source_ids`, { maxItems: MAX_REFERENCES_PER_CLAIM, allowEmpty: false })
  if (!INTERPRETATION_CONFIDENCE_LEVELS.includes(claim.confidence)) {
    throw invalid(`${label}.confidence must be one of ${INTERPRETATION_CONFIDENCE_LEVELS.join(', ')}.`)
  }
  assertString(claim.confidence_rationale, `${label}.confidence_rationale`, { maxLength: MAX_RATIONALE_LENGTH })
  assertStringArray(claim.assumptions, `${label}.assumptions`, { maxItems: MAX_ASSUMPTIONS })
  for (let assumptionIndex = 0; assumptionIndex < claim.assumptions.length; assumptionIndex += 1) {
    if ([...claim.assumptions[assumptionIndex]].length > MAX_ASSUMPTION_LENGTH) {
      throw invalid(`${label}.assumptions[${assumptionIndex}] exceeds ${MAX_ASSUMPTION_LENGTH} characters.`)
    }
  }
  assertBoolean(claim.human_review_required, `${label}.human_review_required`)

  for (const sourceId of claim.source_ids) {
    if (!sourceMap.has(sourceId)) throw invalid(`${label} cites unknown source id "${sourceId}".`)
  }

  // A `fact` may not rest solely on an expert prior — an expert prior is never a venue fact.
  // NOTE: this is a class-level guard only. It cannot detect an owner_aspiration or
  // professional_review source phrased as a fact about actual guest behavior (F-03, still OPEN).
  if (claim.type === 'fact') {
    const expertOnly = claim.source_ids.every((sourceId) => sourceMap.get(sourceId)?.epistemic_class === 'expert_prior')
    if (expertOnly) throw invalid(`${label} cannot present an expert prior as a venue fact.`)
  }

  // Every non-fact claim must be flagged for human review before any downstream use (F-03). This
  // is a structural gate on the OUTPUT flag; it does not and cannot verify that a human actually
  // performed a quality review.
  if (CLAIM_TYPES_REQUIRING_HUMAN_REVIEW.includes(claim.type) && !claim.human_review_required) {
    throw invalid(`${label} must set human_review_required=true for ${claim.type}.`)
  }
}

function validatePlan(plan, claimMap) {
  assertPlainObject(plan, 'plan')
  assertOnlyKeys(plan, PLAN_KEYS, 'plan')
  assertStringArray(plan.direction_claim_ids, 'plan.direction_claim_ids', { maxItems: MAX_PLAN_ITEMS })
  assertStringArray(plan.risk_claim_ids, 'plan.risk_claim_ids', { maxItems: MAX_PLAN_ITEMS })
  assertStringArray(plan.action_claim_ids, 'plan.action_claim_ids', { maxItems: MAX_PLAN_ITEMS })

  const allReferences = [
    ...plan.direction_claim_ids.map((id) => ['direction_claim_ids', id]),
    ...plan.risk_claim_ids.map((id) => ['risk_claim_ids', id]),
    ...plan.action_claim_ids.map((id) => ['action_claim_ids', id]),
  ]

  for (const [bucket, claimId] of allReferences) {
    const claim = claimMap.get(claimId)
    if (!claim) throw invalid(`plan.${bucket} references unknown claim id "${claimId}".`)
    if (bucket === 'action_claim_ids' && claim.type !== 'recommendation') {
      throw invalid(`plan.action_claim_ids may reference recommendation claims only; "${claimId}" is ${claim.type}.`)
    }
    if (bucket === 'risk_claim_ids' && !['derived_observation', 'hypothesis'].includes(claim.type)) {
      throw invalid(`plan.risk_claim_ids may reference derived_observation or hypothesis claims only; "${claimId}" is ${claim.type}.`)
    }
    if (bucket === 'direction_claim_ids' && claim.type === 'recommendation') {
      throw invalid(`plan.direction_claim_ids cannot reference recommendation claim "${claimId}".`)
    }
  }
}

function validateMissingInformation(items, sourceMap) {
  if (!Array.isArray(items)) throw invalid('missing_information must be an array.')
  if (items.length > MAX_MISSING_ITEMS) throw invalid(`missing_information exceeds ${MAX_MISSING_ITEMS} items.`)
  const seenIds = new Set()
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    const label = `missing_information[${index}]`
    assertPlainObject(item, label)
    assertOnlyKeys(item, MISSING_INFORMATION_KEYS, label)
    assertString(item.id, `${label}.id`, { maxLength: 120 })
    if (!/^gap-[a-z0-9][a-z0-9-]*$/i.test(item.id)) throw invalid(`${label}.id must use the form "gap-...".`)
    if (seenIds.has(item.id)) throw invalid(`${label}.id duplicates "${item.id}".`)
    seenIds.add(item.id)
    assertString(item.question, `${label}.question`, { maxLength: LIMITS.MAX_MISSING_QUESTION_LENGTH })
    assertString(item.reason, `${label}.reason`, { maxLength: LIMITS.MAX_MISSING_REASON_LENGTH })
    assertStringArray(item.source_ids, `${label}.source_ids`, { maxItems: MAX_REFERENCES_PER_CLAIM })
    for (const sourceId of item.source_ids) {
      if (!sourceMap.has(sourceId)) throw invalid(`${label} cites unknown source id "${sourceId}".`)
    }
    assertBoolean(item.blocks_action, `${label}.blocks_action`)
  }
}

/**
 * Validate an untrusted model response. Returns the same object on success; never repairs it.
 *
 * This performs citation REFERENCE validation only (see the module header and F-03). A successful
 * return does not certify that any cited source semantically supports its claim.
 */
export function validateBeverageInterpretationOutput(output, { sourceRegistry } = {}) {
  assertPlainObject(output, 'output')
  assertOnlyKeys(output, TOP_LEVEL_KEYS, 'output')
  if (output.schema_version !== BEVERAGE_INTERPRETATION_SCHEMA_VERSION) {
    throw invalid(`output.schema_version must equal "${BEVERAGE_INTERPRETATION_SCHEMA_VERSION}".`)
  }

  if (!Array.isArray(output.claims)) throw invalid('claims must be an array.')
  if (output.claims.length === 0) throw invalid('claims cannot be empty.')
  if (output.claims.length > MAX_CLAIMS) throw invalid(`claims exceeds ${MAX_CLAIMS} items.`)

  const sourceMap = sourceMapFromRegistry(sourceRegistry)
  const claimMap = new Map()
  for (let index = 0; index < output.claims.length; index += 1) {
    const claim = output.claims[index]
    validateClaim(claim, index, sourceMap)
    if (claimMap.has(claim.id)) throw invalid(`claims contains duplicate id "${claim.id}".`)
    claimMap.set(claim.id, claim)
  }

  validatePlan(output.plan, claimMap)
  validateMissingInformation(output.missing_information, sourceMap)
  return output
}
