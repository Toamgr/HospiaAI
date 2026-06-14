// Operational Intelligence Feed + DNA Enrichment Layer.
//
// Phase 5 — Venue DNA learns from operations, not only conversation. This module
// is the pure interpretation layer: the server reads raw counts from EXISTING
// systems (shift reviews, incidents, action center, operational memory, academy
// activity, event activity) and passes them here to be turned into normalized
// operational signals and an additive, transparent DNA enrichment.
//
// Principles:
//   - Additive, never destructive. The owner's conversational Venue DNA confidence
//     is never overwritten — enrichment is a separate, transparent layer applied
//     when briefs are generated.
//   - No fabrication. Every delta and note traces to a real operational count.
//   - Bounded. Operational evidence nudges confidence; it never asserts certainty.
//
// Pure and deterministic. Safe to import from server.js and the frontend.

const DIMENSIONS = ['identity', 'operations', 'guest', 'training', 'commercial']

function n(v) { const x = Number(v); return Number.isFinite(x) && x > 0 ? Math.round(x) : 0 }
function clampPct(v) { return Math.max(0, Math.min(100, Math.round(Number(v) || 0))) }

/**
 * Normalize raw operational counts into structured signals with derived flags.
 * @param {object} raw - counts read from existing tables
 */
export function buildOperationalSignals(raw = {}) {
  const shifts = { closed: n(raw.closedShifts) }
  const incidents = {
    total: n(raw.incidentsTotal),
    unresolved: n(raw.incidentsUnresolved),
    last30: n(raw.incidents30d)
  }
  const actions = {
    open: n(raw.actionsOpen),
    completed: n(raw.actionsCompleted),
    stale: n(raw.actionsStale)
  }
  const memory = { count: n(raw.memoryCount) }
  const academy = {
    completedModules: n(raw.academyCompletedModules),
    activeLearners: n(raw.academyActiveLearners)
  }
  const events = {
    total: n(raw.eventsTotal),
    upcoming: n(raw.eventsUpcoming),
    completed: n(raw.eventsCompleted)
  }
  const complaintsReports = n(raw.complaintsReports)

  const totalActions = actions.open + actions.completed
  const completionRate = totalActions ? actions.completed / totalActions : null

  const flags = {
    highOpenIncidents: incidents.unresolved >= 5,
    someOpenIncidents: incidents.unresolved > 0,
    lowActionCompletion: completionRate != null && totalActions >= 4 && completionRate < 0.5,
    repeatedComplaints: complaintsReports >= 3,
    academyActive: academy.completedModules > 0,
    lowAcademyActivity: academy.completedModules === 0,
    growingEvents: events.upcoming > 0,
    hasOperationalHistory: shifts.closed >= 3
  }

  return { shifts, incidents, actions: { ...actions, completionRate }, memory, academy, events, complaintsReports, flags }
}

function mentions(list, keywords) {
  const hay = (Array.isArray(list) ? list : []).join(' ').toLowerCase()
  return keywords.some(k => hay.includes(k))
}

/**
 * Derive an additive, transparent enrichment of Venue DNA confidence from
 * operational signals. Returns confidence deltas (signed), human-readable notes,
 * and tensions (owner priority vs operational reality mismatches).
 *
 * @param {object} venueDNA - the conversational Venue DNA
 * @param {object} signals  - output of buildOperationalSignals
 */
export function deriveDnaEnrichment(venueDNA = {}, signals = {}) {
  const deltas = { identity: 0, operations: 0, guest: 0, training: 0, commercial: 0 }
  const notes = []
  const tensions = []

  const ownerPriorities = venueDNA.ownerPriorities || []
  const f = signals.flags || {}

  // Operations — corroborated by real shift history and action follow-through.
  if (f.hasOperationalHistory) {
    deltas.operations += 10
    notes.push({ dimension: 'operations', direction: 'up', text: `${signals.shifts.closed} closed shifts on record corroborate operational understanding.` })
  }
  if (f.lowActionCompletion) {
    deltas.operations -= 8
    notes.push({ dimension: 'operations', direction: 'down', text: `Action completion is below half (${signals.actions.completed}/${signals.actions.open + signals.actions.completed}) — execution is a live concern.` })
  }

  // Guest — incidents are real evidence about guest experience.
  if (f.highOpenIncidents) {
    deltas.guest -= 10
    notes.push({ dimension: 'guest', direction: 'down', text: `${signals.incidents.unresolved} unresolved incidents weigh on guest-experience health.` })
  } else if (f.someOpenIncidents) {
    deltas.guest -= 4
    notes.push({ dimension: 'guest', direction: 'down', text: `${signals.incidents.unresolved} open incident(s) recorded.` })
  }
  if (f.repeatedComplaints) {
    deltas.guest -= 4
    notes.push({ dimension: 'guest', direction: 'down', text: `Complaints recurred across ${signals.complaintsReports} shift reviews.` })
  }

  // Training — academy activity is direct evidence of capability development.
  if (f.academyActive) {
    deltas.training += Math.min(15, signals.academy.completedModules)
    notes.push({ dimension: 'training', direction: 'up', text: `${signals.academy.completedModules} academy lessons completed by ${signals.academy.activeLearners} team member(s).` })
  }

  // Commercial — event pipeline and operational memory are real commercial signal.
  if (f.growingEvents) {
    deltas.commercial += 8
    notes.push({ dimension: 'commercial', direction: 'up', text: `${signals.events.upcoming} upcoming event(s) in the pipeline.` })
  }
  if (signals.memory?.count > 0) {
    deltas.commercial += 4
    notes.push({ dimension: 'commercial', direction: 'up', text: `${signals.memory.count} operational memory event(s) recorded.` })
  }

  // Tensions — owner priorities measured against operational reality.
  if (mentions(ownerPriorities, ['guest', 'service', 'experience', 'hospitality']) && (f.highOpenIncidents || f.repeatedComplaints)) {
    tensions.push({ text: 'Ownership prioritizes guest experience, yet unresolved incidents and complaints persist — the priority is not yet reflected on the floor.' })
  }
  if (mentions(ownerPriorities, ['train', 'consisten', 'team', 'staff', 'skill']) && f.lowAcademyActivity) {
    tensions.push({ text: 'Training and consistency matter to ownership, but no academy activity is recorded yet.' })
  }
  if (mentions(ownerPriorities, ['revenue', 'grow', 'margin', 'profit', 'sales']) && signals.events?.upcoming === 0 && signals.memory?.count === 0) {
    tensions.push({ text: 'Ownership wants growth, yet little commercial activity (events, memory) is on record to act on.' })
  }

  return { confidenceDeltas: deltas, notes, tensions }
}

/** Apply enrichment deltas to a confidence object, clamped — returns a new object. */
export function applyConfidenceDeltas(confidence = {}, deltas = {}) {
  const out = {}
  for (const dim of DIMENSIONS) {
    out[dim] = clampPct((Number(confidence[dim]) || 0) + (Number(deltas[dim]) || 0))
  }
  return out
}
