/**
 * calendarIntelligence — Deterministic event health and next-action engine.
 *
 * Pure utility. No AI. No React. No side effects.
 *
 * Works with full Zohar intelligence inputs (when available) or event-level
 * data only (the calendar context, where guest/task detail is not loaded).
 * All inputs except `event` are optional — the engine degrades gracefully.
 *
 * Produces: eventHealth (status, color, score), nextAction (string),
 * and calendarSummary (operational snapshot for the panel).
 */

// ── Days-until helper ─────────────────────────────────────────────────────────

function daysUntilDate(dateStr) {
  if (!dateStr) return null
  try {
    return Math.ceil((new Date(dateStr + 'T12:00:00') - new Date()) / 86400000)
  } catch { return null }
}

// ── Calendar readiness score ──────────────────────────────────────────────────
// Used when a full Zohar readinessScore is not available.
// Scores event-level signals: logistics, cocktail readiness, architect plan.

function computeCalendarReadiness(event, cocktailMenuStatus, architectStatus) {
  let score = 0
  if (event.expected_guests)                                           score += 15
  if (event.start_time)                                                score += 15
  if (event.location)                                                  score += 10
  if (event.client_name)                                               score += 5
  if (event.event_date)                                                score += 5
  if (['confirmed', 'in_preparation', 'ready', 'live'].includes(event.status)) score += 10
  if (cocktailMenuStatus === 'approved')                               score += 25
  else if (cocktailMenuStatus === 'draft')                             score += 12
  if (architectStatus === 'planned')                                   score += 10
  return Math.min(100, score)
}

// ── Basic risk level (event-level only, no Zohar risk engine) ─────────────────

function computeBasicRiskLevel(event, days) {
  if (days !== null && days <= 3 && !event.start_time)      return 'Critical'
  if (days !== null && days <= 7 && !event.expected_guests) return 'High'
  if (!event.start_time || !event.expected_guests)          return 'Medium'
  return 'Low'
}

// ── Health thresholds ─────────────────────────────────────────────────────────

const HEALTH_COLORS = {
  Ready:           '#6BAF80',
  'Needs Attention':'#C9A96E',
  Critical:        '#C44A4A',
}

function determineHealth({ score, hasCriticalRisk, riskLevel, days, cocktailMenuStatus }) {
  const critical = (
    score < 50 ||
    riskLevel === 'Critical' ||
    hasCriticalRisk ||
    (days !== null && days <= 7  && score < 65) ||
    (days !== null && days <= 3  && cocktailMenuStatus !== 'approved')
  )

  if (critical) return 'Critical'

  const ready = (
    score >= 80 &&
    !hasCriticalRisk &&
    riskLevel !== 'Critical' &&
    riskLevel !== 'High' &&
    (cocktailMenuStatus === 'approved' || (days !== null && days > 30))
  )

  return ready ? 'Ready' : 'Needs Attention'
}

// ── Next action — priority ordered ────────────────────────────────────────────

function pickNextAction({
  event, days,
  riskAssessment,
  coordinationAssessment,
  timelineIntelligence,
  cocktailMenuStatus,
  seatingIntelligence,
}) {
  // 1. Critical risk recommendation
  const criticalRisk = riskAssessment?.risks?.find(r => r.severity === 'critical')
  if (criticalRisk?.recommendation) return criticalRisk.recommendation

  // 2. Coordination primary bottleneck
  const bottleneck = coordinationAssessment?.primaryBottleneck
  if (bottleneck && bottleneck !== 'None') {
    return `Address bottleneck: ${bottleneck}`
  }

  // 3. Timeline risk description
  if (timelineIntelligence?.timelineRisks?.length > 0) {
    const tr = timelineIntelligence.timelineRisks[0]
    if (tr?.recommendation) return tr.recommendation
  }

  // 4. Critical missing event-level data
  if (!event.start_time && days !== null && days <= 30) {
    return 'Set event start time'
  }
  if (!event.expected_guests) {
    return 'Finalize expected guest count'
  }

  // 5. Cocktail menu (only if within 30 days)
  if (cocktailMenuStatus !== 'approved' && days !== null && days <= 30) {
    return cocktailMenuStatus === 'draft'
      ? 'Review and approve cocktail menu'
      : 'Generate and approve cocktail menu'
  }

  // 6. Seating (only if within 14 days)
  if (seatingIntelligence && seatingIntelligence.seatingCompletion < 80 && days !== null && days <= 14) {
    const n = seatingIntelligence.unassignedCount
    return `Assign remaining ${n} guest${n !== 1 ? 's' : ''} to tables`
  }

  // 7. Risk engine's next best action
  if (riskAssessment?.nextBestAction) return riskAssessment.nextBestAction

  return 'No immediate action required'
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Build calendar intelligence for a single event.
 *
 * @param {{
 *   event,
 *   readinessScore?,
 *   riskAssessment?,
 *   coordinationAssessment?,
 *   timelineIntelligence?,
 *   cocktailMenuStatus?,
 *   productionStatus?,
 *   seatingIntelligence?,
 *   architectStatus?
 * }} input
 * @returns {{ eventHealth, nextAction, calendarSummary } | null}
 */
export function buildCalendarIntelligence({
  event,
  readinessScore       = null,
  riskAssessment       = null,
  coordinationAssessment = null,
  timelineIntelligence = null,
  cocktailMenuStatus   = null,
  productionStatus     = null,
  seatingIntelligence  = null,
  architectStatus      = null,
}) {
  if (!event) return null

  const days = daysUntilDate(event.event_date)

  // Readiness: use full Zohar score when provided, else event-level estimate
  const score = readinessScore != null
    ? Math.round(readinessScore)
    : computeCalendarReadiness(event, cocktailMenuStatus, architectStatus)

  const hasCriticalRisk = riskAssessment?.risks?.some(r => r.severity === 'critical') ?? false
  const riskLevel       = riskAssessment?.overallRiskLevel
    ?? computeBasicRiskLevel(event, days)

  const healthStatus = determineHealth({ score, hasCriticalRisk, riskLevel, days, cocktailMenuStatus })
  const eventHealth  = { status: healthStatus, color: HEALTH_COLORS[healthStatus], score }

  const nextAction = pickNextAction({
    event, days,
    riskAssessment,
    coordinationAssessment,
    timelineIntelligence,
    cocktailMenuStatus,
    seatingIntelligence,
  })

  const calendarSummary = {
    readinessScore:  score,
    riskLevel,
    daysUntil:       days,
    cocktailStatus:  cocktailMenuStatus ?? 'not_started',
    productionStatus:productionStatus   ?? 'not_started',
    seatingStatus:   seatingIntelligence
      ? `${seatingIntelligence.seatingCompletion}%`
      : 'Unknown',
    architectStatus: architectStatus ?? 'not_started',
  }

  return { eventHealth, nextAction, calendarSummary }
}
