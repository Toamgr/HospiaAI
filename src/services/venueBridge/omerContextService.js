// Omer Context Service — Venue Intelligence → F&B Director injection.
//
// Converts the specialist briefs produced by the Venue Intelligence Bridge into a
// compact, AI-safe context block that Omer (the HESTIA Beverage Director / F&B
// intelligence layer) and Cocktail Intelligence generation can consume as
// venue-specific strategic context.
//
// This module is PURE and DETERMINISTIC — it only restructures briefs that
// already exist. It never re-profiles the venue, invents data, or calls the AI.
// The single owner of "how a brief becomes Omer context" lives here, so the
// loading logic is not scattered across the codebase. Safe to import from
// server.js and the frontend (no Node/browser-only APIs).

export const OMER_CONTEXT_HEADER = 'HESTIA VENUE INTELLIGENCE CONTEXT FOR OMER'

function clean(items) {
  if (!Array.isArray(items)) return []
  return Array.from(new Set(items.map(s => String(s).trim()).filter(Boolean)))
}

function section(title, items, max = 8) {
  const list = clean(items).slice(0, max)
  if (!list.length) return null
  return `${title}:\n${list.map(i => `- ${i}`).join('\n')}`
}

/**
 * Build Omer's venue-intelligence context block from the bridge briefs.
 *
 * @param {object[]} briefs   - the array returned by the bridge ('fb','service','training','owner','event')
 * @param {object}   metadata - { venueName, venueType }
 * @returns {{ active: boolean, confidence: number, text: (string|null) }}
 *          active=false means there is no usable venue intelligence yet — callers
 *          must fall back to existing behavior and show no "active" indicator.
 */
export function buildOmerContextBlock(briefs = [], metadata = {}) {
  const byType = {}
  for (const b of Array.isArray(briefs) ? briefs : []) {
    if (b && b.type) byType[b.type] = b
  }
  const fb = byType.fb || null
  const service = byType.service || null
  const training = byType.training || null
  const owner = byType.owner || null

  // Owner signals include a non-strategic "operational memory event(s)" line —
  // keep it out of the prompt context.
  const ownerSignals = clean(owner?.signals).filter(s => !/operational memory event/i.test(s))

  const blocks = [
    metadata.venueType ? `Venue Identity:\n- Venue type on record: ${metadata.venueType}` : null,
    section('Guest & Service Signals', service?.signals),
    section('Beverage & F&B Direction', fb?.signals),
    section('Operational Constraints', fb?.priorities),
    section('Training & Execution Signals', [...clean(training?.signals), ...clean(training?.priorities)]),
    section('Owner Priorities', ownerSignals),
    section('Commercial Opportunities', [...clean(fb?.opportunities), ...clean(owner?.opportunities)]),
    section('Open Assumptions', fb?.openQuestions)
  ].filter(Boolean)

  // No usable signal anywhere → inactive. Caller keeps prior behavior.
  if (!blocks.length) {
    return { active: false, confidence: 0, text: null }
  }

  const confidence = Math.max(0, Math.min(100, Math.round(Number(fb?.confidence) || 0)))
  const lowConfidence = confidence > 0 && confidence < 40

  const transparency = confidence === 0
    ? 'Confidence (F&B understanding): not yet established — treat all of the above as provisional and avoid strong assumptions.'
    : `Confidence (F&B understanding): ${confidence}%${lowConfidence ? ' — low; treat weak areas as provisional and be transparent rather than assume.' : ''}`

  const text = [
    OMER_CONTEXT_HEADER,
    '',
    'Use this as venue-specific strategic context. Do not repeat it back to the user unless directly relevant.',
    '',
    blocks.join('\n\n'),
    '',
    'Instruction:',
    'Adapt all F&B, cocktail, menu engineering, pricing, training, service, and guest-experience recommendations to this venue context. Prefer builds that are operationally realistic for this team and guest profile. You already understand this venue — do not ask the operator to describe it again. If confidence is low, be transparent and avoid overconfident assumptions.',
    transparency
  ].join('\n')

  return { active: true, confidence, text }
}
