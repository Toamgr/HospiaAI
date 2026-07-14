// HESTIA Beverage Interpretation Engine — trusted context construction.
//
// Converts approved human records into a closed source registry. The model may cite only source
// ids from this registry. The owner's submitted words remain visible even when an approved F&B
// adjustment becomes the effective working direction.
//
// Multi-tenant safety (remediation F-02): every source carries an explicit venue scope. Owner and
// F&B sources are stamped with the venue_id read from the trusted records — never from external
// input. External evidence must declare its own scope and, when venue-scoped, a venue_id that
// matches the brief's venue. Global expert priors are the only sources allowed without a venue_id,
// and only when explicitly marked scope:'global'. Nothing is auto-corrected or auto-attributed.

import { BRIEF_CONTENT_FIELDS } from './ownerBeverageBriefService.js'
import { BEVERAGE_INTERPRETATION_LIMITS as LIMITS, utf8ByteLength } from './beverageInterpretationLimits.js'

const MAX_SOURCE_TEXT = LIMITS.MAX_SOURCE_VALUE_LENGTH
const EVIDENCE_CLASSES = Object.freeze([
  'operational_evidence',
  'approved_identity',
  'expert_prior',
])

// Source scope vocabulary (F-02). 'venue' sources belong to exactly one venue and must match the
// brief. 'global' sources are venue-independent reference material and are restricted to
// expert_prior — a global source can never masquerade as venue evidence.
export const SOURCE_SCOPES = Object.freeze(['venue', 'global'])

function badRequest(message) {
  const error = new Error(`beverageInterpretationContext: ${message}`)
  error.code = 'BAD_REQUEST'
  return error
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function assertText(value, label, { nullable = false } = {}) {
  if (value === null || value === undefined) {
    if (nullable) return
    throw badRequest(`${label} is required.`)
  }
  if (typeof value !== 'string') throw badRequest(`${label} must be text.`)
  if ([...value].length > MAX_SOURCE_TEXT) throw badRequest(`${label} exceeds ${MAX_SOURCE_TEXT} characters.`)
}

// Safe serialization guard for provenance: rejects circular / non-serializable provenance with a
// controlled BAD_REQUEST instead of leaking an uncontrolled TypeError (remediation F-08), and
// bounds the serialized size (F-04). Returns a fresh deep copy on success.
function serializeProvenance(provenance, label) {
  if (!provenance || typeof provenance !== 'object' || Array.isArray(provenance)) {
    throw badRequest(`${label}.provenance must be an object.`)
  }
  let serialized
  try {
    serialized = JSON.stringify(provenance)
  } catch {
    throw badRequest(`${label}.provenance must be JSON-serializable (no circular references).`)
  }
  if (serialized === undefined) throw badRequest(`${label}.provenance must be JSON-serializable.`)
  if (utf8ByteLength(serialized) > LIMITS.MAX_PROVENANCE_SERIALIZED_LENGTH) {
    throw badRequest(`${label}.provenance exceeds ${LIMITS.MAX_PROVENANCE_SERIALIZED_LENGTH} bytes.`)
  }
  return JSON.parse(serialized)
}

// Normalize + venue-bind one external evidence item. `venueId` is the trusted brief venue.
function normalizeExternalEvidenceItem(item, index, venueId, seen) {
  const label = `evidence[${index}]`
  if (!item || typeof item !== 'object' || Array.isArray(item)) throw badRequest(`${label} must be an object.`)
  const { id, epistemic_class: epistemicClass, label: sourceLabel, value, provenance, scope, venue_id: evidenceVenueId } = item

  if (!isNonEmptyString(id)) throw badRequest(`${label}.id is required.`)
  if (utf8ByteLength(id) > LIMITS.MAX_SOURCE_ID_LENGTH) throw badRequest(`${label}.id exceeds ${LIMITS.MAX_SOURCE_ID_LENGTH} bytes.`)
  if (seen.has(id)) throw badRequest(`evidence contains duplicate id "${id}".`)
  seen.add(id)

  if (!EVIDENCE_CLASSES.includes(epistemicClass)) {
    throw badRequest(`${label}.epistemic_class must be one of ${EVIDENCE_CLASSES.join(', ')}.`)
  }

  // ── Venue binding (F-02). Scope is mandatory and never inferred. ──────────
  if (!SOURCE_SCOPES.includes(scope)) {
    throw badRequest(`${label}.scope must be one of ${SOURCE_SCOPES.join(', ')}.`)
  }
  if (scope === 'global') {
    // A venue-independent reference. Only expert priors may be global, and a global source may not
    // carry a venue_id — that would let a prior masquerade as venue evidence.
    if (epistemicClass !== 'expert_prior') {
      throw badRequest(`${label} scope:'global' is only allowed for expert_prior evidence.`)
    }
    if (evidenceVenueId !== undefined && evidenceVenueId !== null) {
      throw badRequest(`${label} scope:'global' must not declare a venue_id.`)
    }
  } else {
    // Venue-scoped: must declare a venue_id, and it must match this run's trusted venue. The error
    // deliberately does not echo the foreign venue_id.
    if (!isNonEmptyString(evidenceVenueId)) throw badRequest(`${label} scope:'venue' requires a non-empty venue_id.`)
    if (evidenceVenueId !== venueId) throw badRequest(`${label} belongs to a different venue and cannot be used for this interpretation.`)
  }

  assertText(sourceLabel, `${label}.label`)
  if (utf8ByteLength(sourceLabel) > LIMITS.MAX_SOURCE_LABEL_LENGTH) throw badRequest(`${label}.label exceeds ${LIMITS.MAX_SOURCE_LABEL_LENGTH} bytes.`)
  if (value === null || value === undefined) throw badRequest(`${label}.value is required.`)
  const valueText = typeof value === 'string' ? value : JSON.stringify(value)
  assertText(valueText, `${label}.value`)
  if (!isNonEmptyString(provenance?.kind) || !isNonEmptyString(provenance?.reference)) {
    throw badRequest(`${label}.provenance requires kind and reference.`)
  }
  const safeProvenance = serializeProvenance(provenance, label)

  return {
    id: `evidence:${id}`,
    kind: 'external_evidence',
    epistemic_class: epistemicClass,
    scope,
    venue_id: scope === 'venue' ? venueId : null,
    label: sourceLabel,
    value: valueText,
    provenance: safeProvenance,
  }
}

function normalizeExternalEvidence(evidence, venueId) {
  if (evidence === null || evidence === undefined) return []
  if (!Array.isArray(evidence)) throw badRequest('evidence must be an array.')
  const seen = new Set()
  return evidence.map((item, index) => normalizeExternalEvidenceItem(item, index, venueId, seen))
}

// Enforce registry count + total serialized size once the registry is fully assembled (F-04).
function assertRegistryWithinLimits(sourceRegistry) {
  if (sourceRegistry.length > LIMITS.MAX_SOURCE_COUNT) {
    throw badRequest(`source registry exceeds ${LIMITS.MAX_SOURCE_COUNT} sources.`)
  }
  const totalBytes = utf8ByteLength(JSON.stringify(sourceRegistry))
  if (totalBytes > LIMITS.MAX_TOTAL_SOURCE_REGISTRY_BYTES) {
    throw badRequest(`source registry exceeds ${LIMITS.MAX_TOTAL_SOURCE_REGISTRY_BYTES} bytes.`)
  }
}

/**
 * Build a source registry and effective working direction from a submitted owner brief and an
 * approved F&B review. No AI runs here and neither input record is mutated.
 */
export function buildBeverageInterpretationContext({ brief, review, evidence = [] } = {}) {
  if (!brief || typeof brief !== 'object' || Array.isArray(brief)) throw badRequest('brief is required.')
  if (!review || typeof review !== 'object' || Array.isArray(review)) throw badRequest('review is required.')
  if (!isNonEmptyString(brief.id)) throw badRequest('brief.id is required.')
  if (!isNonEmptyString(brief.venue_id)) throw badRequest('brief.venue_id is required.')
  if (brief.status !== 'submitted') throw badRequest('brief.status must be submitted.')
  if (!brief.fields || typeof brief.fields !== 'object' || Array.isArray(brief.fields)) {
    throw badRequest('brief.fields must be an object.')
  }
  if (!isNonEmptyString(review.id)) throw badRequest('review.id is required.')
  if (review.owner_beverage_brief_id !== brief.id) throw badRequest('review does not belong to the supplied brief.')
  if (review.venue_id !== brief.venue_id) throw badRequest('review and brief must belong to the same venue.')
  if (review.status !== 'approved') throw badRequest('review.status must be approved before interpretation.')

  // The trusted venue for this run comes from the brief record only — never from external input.
  const venueId = brief.venue_id

  const adjustments = review.field_adjustments && typeof review.field_adjustments === 'object' && !Array.isArray(review.field_adjustments)
    ? review.field_adjustments
    : {}

  for (const field of Object.keys(brief.fields)) {
    if (!BRIEF_CONTENT_FIELDS.includes(field)) throw badRequest(`brief.fields contains unknown field \"${field}\".`)
  }
  for (const field of Object.keys(adjustments)) {
    if (!BRIEF_CONTENT_FIELDS.includes(field)) throw badRequest(`review.field_adjustments contains unknown field \"${field}\".`)
  }

  const sourceRegistry = []
  const effectiveDirection = {}

  for (const field of BRIEF_CONTENT_FIELDS) {
    const ownerValue = brief.fields[field] ?? null
    if (ownerValue !== null && ownerValue !== undefined) {
      const ownerText = typeof ownerValue === 'string' ? ownerValue : String(ownerValue)
      assertText(ownerText, `brief.fields.${field}`)
      sourceRegistry.push({
        id: `owner-brief:${brief.id}:field:${field}`,
        kind: 'owner_brief_field',
        epistemic_class: 'owner_aspiration',
        scope: 'venue',
        venue_id: venueId,
        label: `Owner brief field: ${field}`,
        value: ownerText,
        provenance: {
          record_type: 'owner_beverage_brief',
          record_id: brief.id,
          field,
          submitted_at: brief.submitted_at ?? null,
        },
      })
    }

    const adjustment = adjustments[field]
    if (adjustment !== undefined) {
      if (!adjustment || typeof adjustment !== 'object' || Array.isArray(adjustment)) {
        throw badRequest(`review.field_adjustments.${field} must be an object.`)
      }
      if (adjustment.adjusted_value === null || adjustment.adjusted_value === undefined) {
        throw badRequest(`review.field_adjustments.${field}.adjusted_value is required.`)
      }
      const adjustedText = String(adjustment.adjusted_value)
      assertText(adjustedText, `review.field_adjustments.${field}.adjusted_value`)
      const sourceId = `fnb-review:${review.id}:adjustment:${field}`
      sourceRegistry.push({
        id: sourceId,
        kind: 'fnb_adjustment',
        epistemic_class: 'professional_review',
        scope: 'venue',
        venue_id: venueId,
        label: `Approved F&B adjustment: ${field}`,
        value: adjustedText,
        provenance: {
          record_type: 'fnb_brief_review',
          record_id: review.id,
          field,
          owner_value: adjustment.owner_value ?? ownerValue,
          note: adjustment.note ?? null,
          adjusted_at: adjustment.adjusted_at ?? null,
          decided_at: review.decided_at ?? null,
        },
      })
      effectiveDirection[field] = { value: adjustedText, source_id: sourceId, basis: 'approved_fnb_adjustment' }
    } else if (ownerValue !== null && ownerValue !== undefined) {
      effectiveDirection[field] = {
        value: typeof ownerValue === 'string' ? ownerValue : String(ownerValue),
        source_id: `owner-brief:${brief.id}:field:${field}`,
        basis: 'owner_submitted',
      }
    } else {
      effectiveDirection[field] = { value: null, source_id: null, basis: 'empty' }
    }
  }

  if (review.notes !== null && review.notes !== undefined && String(review.notes).trim().length > 0) {
    const notes = String(review.notes)
    assertText(notes, 'review.notes')
    sourceRegistry.push({
      id: `fnb-review:${review.id}:notes`,
      kind: 'fnb_review_notes',
      epistemic_class: 'professional_review',
      scope: 'venue',
      venue_id: venueId,
      label: 'Approved F&B review notes',
      value: notes,
      provenance: {
        record_type: 'fnb_brief_review',
        record_id: review.id,
        decided_at: review.decided_at ?? null,
      },
    })
  }

  const normalizedEvidence = normalizeExternalEvidence(evidence, venueId)
  const duplicateIds = new Set(sourceRegistry.map((source) => source.id))
  for (const source of normalizedEvidence) {
    if (duplicateIds.has(source.id)) throw badRequest(`source id collision for "${source.id}".`)
    duplicateIds.add(source.id)
    sourceRegistry.push(source)
  }

  if (sourceRegistry.length === 0) {
    throw badRequest('approved context contains no citable sources.')
  }

  assertRegistryWithinLimits(sourceRegistry)

  return {
    context_version: 'hestia-beverage-context.v1',
    venue_id: venueId,
    brief_id: brief.id,
    review_id: review.id,
    effective_direction: effectiveDirection,
    source_registry: sourceRegistry,
  }
}
