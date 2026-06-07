/**
 * Zohar Timeline & Service Flow Engine — deterministic service-flow intelligence.
 *
 * Pure utility. No React. No side effects. No AI. No demo data.
 * Builds on seatingIntelligence, riskAssessment, coordinationAssessment.
 * Does NOT recompute risks, capacity warnings, or department status.
 *
 * Input:  { event, guests, tables, tasks, timeline, seatingIntelligence, coordinationAssessment, riskAssessment }
 * Output: { serviceFlow, pressurePoints, guestFlowWarnings, timelineRisks, staffingRecommendations,
 *           timelineReadiness, operationalMoments, serviceDirectorSummary }
 *
 * Service flow phases are always inferred from event type and timing fields.
 * The activity-log timeline array is used only to assess planning maturity, not as a schedule source.
 */

// ── Time helpers ──────────────────────────────────────────────────────────────

function addMinutes(timeStr, minutes) {
  if (!timeStr) return null
  try {
    const [h, m] = timeStr.split(':').map(Number)
    if (isNaN(h) || isNaN(m)) return null
    // Normalise: handles negative offsets (pre-event) and overnight wraparound
    const raw        = h * 60 + m + minutes
    const normalized = ((raw % 1440) + 1440) % 1440
    const hh         = Math.floor(normalized / 60)
    const mm         = normalized % 60
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
  } catch { return null }
}

function minutesBetween(startStr, endStr) {
  if (!startStr || !endStr) return null
  try {
    const [sh, sm] = startStr.split(':').map(Number)
    const [eh, em] = endStr.split(':').map(Number)
    const diff = (eh * 60 + em) - (sh * 60 + sm)
    return diff >= 0 ? diff : diff + 1440 // handle overnight
  } catch { return null }
}

// ── Inferred service flow by event type ──────────────────────────────────────

function inferServiceFlow(eventType, start, end) {
  const t = eventType || 'other'

  const phase = (label, offsetStart, offsetEnd) => ({
    phase:    label,
    start:    addMinutes(start, offsetStart),
    end:      addMinutes(start !== null ? start : end, offsetEnd),
    inferred: true,
  })

  const durationMin = minutesBetween(start, end) ?? 240

  switch (t) {
    case 'wedding':
      return [
        { phase: 'Guest Arrival',    start: addMinutes(start, -15), end: start,                   inferred: true },
        { phase: 'Welcome Drinks',   start,                          end: addMinutes(start, 60),   inferred: true },
        { phase: 'Main Service',     start: addMinutes(start, 75),  end: addMinutes(start, 210),   inferred: true },
        { phase: 'Late Night Bar',   start: addMinutes(end, -90),   end,                           inferred: true },
      ]
    case 'corporate':
      return [
        { phase: 'Registration',        start: addMinutes(start, -20), end: start,                inferred: true },
        { phase: 'Arrival Networking',  start,                          end: addMinutes(start, 45), inferred: true },
        { phase: 'Main Programme',      start: addMinutes(start, 45),  end: addMinutes(end, -30),  inferred: true },
        { phase: 'Closing Drinks',      start: addMinutes(end, -30),   end,                        inferred: true },
      ]
    case 'bar_event':
      return [
        { phase: 'Doors Open',   start,                        end: addMinutes(start, 30),  inferred: true },
        { phase: 'Peak Service', start: addMinutes(start, 30), end: addMinutes(end, -45),   inferred: true },
        { phase: 'Wind Down',    start: addMinutes(end, -45),  end,                         inferred: true },
      ]
    case 'private':
      return [
        { phase: 'Arrival',     start: addMinutes(start, -15), end: addMinutes(start, 30),  inferred: true },
        { phase: 'Welcome',     start,                          end: addMinutes(start, 45),  inferred: true },
        { phase: 'Main Dinner', start: addMinutes(start, 45),  end: addMinutes(start, 180), inferred: true },
        { phase: 'Late Night',  start: addMinutes(end, -60),   end,                         inferred: true },
      ]
    default:
      return [
        { phase: 'Arrival',    start,                        end: addMinutes(start, 30),  inferred: true },
        { phase: 'Main Event', start: addMinutes(start, 30), end: addMinutes(end, -30),   inferred: true },
        { phase: 'Close',      start: addMinutes(end, -30),  end,                         inferred: true },
      ]
  }
}

// ── Operational moments ───────────────────────────────────────────────────────

function deriveOperationalMoments(serviceFlow) {
  const find = (labels) => serviceFlow.find(p =>
    labels.some(l => p.phase.toLowerCase().includes(l.toLowerCase()))
  )

  const arrival  = find(['arrival', 'doors open', 'registration'])
  const welcome  = find(['welcome'])
  const main     = find(['main', 'programme', 'peak service'])
  const beverage = find(['bar', 'drinks', 'service', 'peak'])
  const kitchen  = find(['dinner', 'service', 'main'])

  const moment = (label, phase) => phase ? { label, start: phase.start, end: phase.end } : null

  return {
    arrivalWindow:      moment('Guest Arrival Window',    arrival),
    welcomeWindow:      moment('Welcome Service Window',  welcome),
    mainServiceWindow:  moment('Main Service Window',     main),
    peakBeverageWindow: moment('Peak Beverage Window',    beverage ?? welcome),
    peakKitchenWindow:  moment('Peak Kitchen Window',     kitchen),
  }
}

// ── Timeline readiness (0–100) ────────────────────────────────────────────────

function computeTimelineReadiness(event, timeline, seatingIntelligence, riskAssessment) {
  let score = 0

  if (event?.start_time)                                       score += 25
  if (event?.end_time)                                         score += 20
  if (Array.isArray(timeline) && timeline.length > 0)          score += 20

  const si = seatingIntelligence
  if (si && si.totalGuests > 0 && si.seatingCompletion >= 90)  score += 15
  else if (!si || si.totalGuests === 0)                         score += 10 // guests not yet loaded — neutral

  const hasCritical = riskAssessment?.risks?.some(r => r.severity === 'critical') ?? false
  if (!hasCritical)                                             score += 20

  return Math.min(100, score)
}

function readinessStatus(score) {
  if (score >= 70) return 'Ready'
  if (score >= 35) return 'In Progress'
  return 'Not Ready'
}

// ── Pressure points ───────────────────────────────────────────────────────────

function buildPressurePoints(event, guests, seatingIntelligence, coordinationAssessment) {
  const guestCount = event?.expected_guests ?? 0
  const type       = event?.event_type || 'other'
  const si         = seatingIntelligence
  const g          = Array.isArray(guests) ? guests : []
  const points     = []

  // Arrival pressure
  if (guestCount >= 100) {
    points.push({
      id:             'pressure-arrival',
      category:       'Arrival',
      severity:       guestCount >= 200 ? 'high' : 'medium',
      title:          `${guestCount} guests expected in arrival window`,
      description:    `A large arrival volume is expected within a short window. Beverage and welcome service will face simultaneous pressure.`,
      recommendation: guestCount >= 150
        ? 'Deploy a secondary welcome drinks station separate from the main bar.'
        : 'Ensure welcome drinks are pre-poured and ready before guest arrival.',
    })
  }

  // Bar peak pressure — arrival overlaps beverage demand
  const barHighPressure = ['wedding', 'bar_event'].includes(type) && guestCount >= 80
  const barMedPressure  = guestCount >= 60
  if (barHighPressure || barMedPressure) {
    points.push({
      id:             'pressure-bar',
      category:       'Bar',
      severity:       barHighPressure ? 'high' : 'medium',
      title:          'Peak beverage demand overlaps guest arrival',
      description:    `For a ${type.replace('_', ' ')} with ${guestCount || 'an unknown number of'} guests, beverage demand peaks in the first 30–45 minutes of arrival.`,
      recommendation: barHighPressure
        ? 'Allocate an additional bartender specifically for the arrival window.'
        : 'Pre-batch welcome drinks to reduce per-order preparation time.',
    })
  }

  // Kitchen pressure — meal release timing
  const kitchenPressure = guestCount >= 80 && ['wedding', 'corporate', 'private'].includes(type)
  if (kitchenPressure) {
    points.push({
      id:             'pressure-kitchen',
      category:       'Kitchen',
      severity:       guestCount >= 150 ? 'high' : 'medium',
      title:          'Meal release coincides with active beverage service',
      description:    `At ${guestCount || 'a large'} guests, kitchen plating and bar service peak periods overlap. Runner routes must be clear.`,
      recommendation: 'Coordinate kitchen release window with bar team. Stagger service start to prevent corridor conflicts.',
    })
  }

  // Seating pressure — incomplete seating before service
  if (si && si.totalGuests > 0 && si.seatingCompletion < 90) {
    const daysUntil = event?.event_date
      ? Math.ceil((new Date(event.event_date + 'T12:00:00') - new Date()) / 86400000)
      : null
    const isUrgent = daysUntil !== null && daysUntil <= 7
    points.push({
      id:             'pressure-seating',
      category:       'Seating',
      severity:       isUrgent ? 'high' : 'medium',
      title:          `Seating ${si.seatingCompletion}% complete before service`,
      description:    `${si.unassignedCount} guest${si.unassignedCount !== 1 ? 's' : ''} remain unassigned. Guest flow to tables will be disrupted if seating is unresolved before the event.`,
      recommendation: 'Complete seating assignments. Brief staff on table allocation before guest arrival.',
    })
  }

  return points
}

// ── Guest flow warnings ───────────────────────────────────────────────────────

function buildGuestFlowWarnings(event, guests, seatingIntelligence, coordinationAssessment) {
  const guestCount = event?.expected_guests ?? 0
  const si         = seatingIntelligence
  const warnings   = []

  if (!event?.start_time) {
    warnings.push('Arrival window cannot be calculated — no event start time is set.')
  }

  if (guestCount >= 150) {
    warnings.push(`Guest count (${guestCount}) exceeds the single welcome station threshold. Additional service points are required.`)
  }

  // Seating completion and capacity overflow are already shown as pressure points
  // in this same card and as seating risks in the Risk Assessment card.
  // Only include here what adds unique arrival/flow context.

  if (si && si.vipWarnings.length > 0) {
    warnings.push(`${si.vipWarnings.length} VIP table${si.vipWarnings.length !== 1 ? 's are' : ' is'} unassigned. VIP guests will not be directed correctly on arrival.`)
  }

  const barBlocked = coordinationAssessment?.departmentStatus?.bar === 'Blocked'
  if (barBlocked && guestCount >= 60) {
    warnings.push('Beverage service is not confirmed. Guests arriving at the welcome station may face delays.')
  }

  return warnings.slice(0, 5)
}

// ── Timeline risks ────────────────────────────────────────────────────────────

function buildTimelineRisks(event, timeline) {
  const tl     = Array.isArray(timeline) ? timeline : []
  const risks  = []

  if (!event?.start_time) {
    risks.push({
      id:          'timeline-no-start',
      severity:    'high',
      title:       'No event start time set',
      description: 'Service timeline cannot be validated without an event start time. Staff briefing and flow planning are blocked.',
    })
  }

  if (!event?.end_time) {
    risks.push({
      id:          'timeline-no-end',
      severity:    'medium',
      title:       'Event duration unknown',
      description: 'No end time is set. Operational flow calculations and kitchen/bar staffing windows are incomplete.',
    })
  }

  if (tl.length === 0) {
    risks.push({
      id:          'timeline-no-activity',
      severity:    'low',
      title:       'No timeline activity logged',
      description: 'The event timeline has no activity. Consider logging operational milestones as the event approaches.',
    })
  }

  return risks
}

// ── Staffing recommendations ──────────────────────────────────────────────────

function buildStaffingRecommendations(event, guests) {
  const guestCount = event?.expected_guests ?? 0
  const recs       = []

  if (guestCount === 0) {
    recs.push('Set the expected guest count to determine appropriate staffing levels.')
    return recs
  }

  if (guestCount <= 60) {
    recs.push('Standard staffing is appropriate for this event scale.')
  } else if (guestCount <= 120) {
    recs.push('Consider adding a secondary welcome drinks support role during guest arrival.')
    recs.push('One main bar and one welcome station should provide comfortable coverage.')
  } else if (guestCount <= 200) {
    recs.push('A dedicated welcome drinks station staffed separately from the main bar is recommended.')
    recs.push('Allocate an additional bartender to manage arrival pressure for the first 45 minutes.')
  } else {
    recs.push('Multiple arrival service points are required — plan at least two welcome stations.')
    recs.push('Coordinate main bar and welcome stations as independent service units.')
    recs.push('Consider a dedicated runner team for the arrival window.')
  }

  // Type-specific additions
  const type = event?.event_type || 'other'
  if (type === 'wedding' && guestCount >= 80) {
    recs.push('Wedding service: welcome drink must be ready before first guest arrival — pre-pour and stage in advance.')
  }
  if (type === 'corporate') {
    recs.push('Corporate event: avoid slow cocktail builds during networking periods — prepare batch or simple pours.')
  }
  if (type === 'bar_event') {
    recs.push('Bar event: bartender visibility from the entrance is a priority — position main bar in the direct sightline.')
  }

  return recs.slice(0, 4)
}

// ── Service Director Summary ──────────────────────────────────────────────────

function buildServiceDirectorSummary(event, seatingIntelligence, pressurePoints, timelineReadiness) {
  const guestCount  = event?.expected_guests ?? 0
  const si          = seatingIntelligence
  const hasStart    = Boolean(event?.start_time)
  const hasEnd      = Boolean(event?.end_time)
  const seatingOk   = !si || si.totalGuests === 0 || si.seatingCompletion >= 90
  const arrivalHigh = guestCount >= 150
  const barPressure = pressurePoints.some(p => p.category === 'Bar' && p.severity === 'high')
  const score       = timelineReadiness?.score ?? 0

  if (!hasStart && !hasEnd) {
    return 'Timeline readiness is incomplete — no service times are set. Final operational planning should not proceed until event timing is confirmed.'
  }

  if (!hasStart) {
    return 'Timeline readiness is incomplete due to a missing event start time. Staff briefing and guest flow planning are currently blocked.'
  }

  const parts = []

  if (arrivalHigh && barPressure) {
    parts.push('Guest arrival and beverage demand are expected to peak simultaneously.')
  } else if (arrivalHigh) {
    parts.push(`A large arrival volume (${guestCount} guests) is expected within a short window.`)
  } else if (barPressure) {
    parts.push('Peak beverage demand is expected during the arrival window.')
  }

  if (seatingOk) {
    parts.push('Seating readiness is strong.')
  } else if (si && si.seatingCompletion < 80) {
    parts.push(`Guest seating is ${si.seatingCompletion}% complete and requires attention before service.`)
  }

  if (guestCount >= 150) {
    parts.push('A secondary welcome station is recommended to distribute arrival pressure.')
  } else if (guestCount >= 80) {
    parts.push('Pre-poured welcome drinks will reduce arrival pressure at the bar.')
  }

  if (parts.length === 0) {
    if (score >= 70) {
      return 'Service flow planning is well-positioned. Monitor guest changes and confirm final staff briefing times.'
    }
    return 'Service flow planning is in progress. Confirm event timing and complete seating assignments before briefing staff.'
  }

  return parts.join(' ')
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {{ event, guests?, tables?, tasks?, timeline?, seatingIntelligence?, coordinationAssessment?, riskAssessment? }} input
 * @returns {object|null}
 */
export function computeTimelineIntelligence({
  event,
  guests               = [],
  tables               = [],
  tasks                = [],
  timeline             = [],
  seatingIntelligence  = null,
  coordinationAssessment = null,
  riskAssessment       = null,
}) {
  if (!event) return null

  const g  = Array.isArray(guests)   ? guests   : []
  const tl = Array.isArray(timeline) ? timeline : []

  const start = event.start_time ?? null
  const end   = event.end_time   ?? null
  const type  = event.event_type || 'other'

  // ── Service flow (always inferred) ────────────────────────────────────────
  const serviceFlow = inferServiceFlow(type, start, end)

  // ── Operational moments ───────────────────────────────────────────────────
  const operationalMoments = deriveOperationalMoments(serviceFlow)

  // ── Timeline readiness ────────────────────────────────────────────────────
  const readinessScore  = computeTimelineReadiness(event, tl, seatingIntelligence, riskAssessment)
  const timelineReadiness = {
    score:  readinessScore,
    status: readinessStatus(readinessScore),
  }

  // ── Pressure points ───────────────────────────────────────────────────────
  const pressurePoints = buildPressurePoints(event, g, seatingIntelligence, coordinationAssessment)

  // ── Guest flow warnings ───────────────────────────────────────────────────
  const guestFlowWarnings = buildGuestFlowWarnings(event, g, seatingIntelligence, coordinationAssessment)

  // ── Timeline risks ────────────────────────────────────────────────────────
  const timelineRisks = buildTimelineRisks(event, tl)

  // ── Staffing recommendations ──────────────────────────────────────────────
  const staffingRecommendations = buildStaffingRecommendations(event, g)

  // ── Service Director Summary ──────────────────────────────────────────────
  const serviceDirectorSummary = buildServiceDirectorSummary(
    event, seatingIntelligence, pressurePoints, timelineReadiness
  )

  return {
    serviceFlow,
    operationalMoments,
    pressurePoints,
    guestFlowWarnings,
    timelineRisks,
    staffingRecommendations,
    timelineReadiness,
    serviceDirectorSummary,
  }
}
