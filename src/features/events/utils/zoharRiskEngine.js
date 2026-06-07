/**
 * Zohar Risk Engine — deterministic operational risk assessment.
 *
 * Pure utility. No React. No side effects. No AI calls. No demo data.
 *
 * Input: { event, guests, tables, tasks, timeline, seatingIntelligence, cocktailMenuStatus, zoharBrief }
 * Output: { overallRiskLevel, riskScore, risks[], recommendations[], nextBestAction, departmentAlerts }
 *
 * Null-safe: any input may be missing. Risks that require absent data simply do not fire.
 * All inputs are optional — the engine degrades gracefully to the risks it can evaluate.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(dateStr) {
  if (!dateStr) return null
  try {
    return Math.ceil((new Date(dateStr + 'T12:00:00') - new Date()) / 86400000)
  } catch { return null }
}

// ── Risk score (0–100) ────────────────────────────────────────────────────────

function computeRiskScore({
  event, guests, tables, tasks,
  seatingIntelligence, cocktailMenuStatus, zoharBrief,
}) {
  let score = 0

  const g  = Array.isArray(guests) ? guests : []
  const tb = Array.isArray(tables) ? tables : []
  const tk = Array.isArray(tasks)  ? tasks  : []

  const pendingTasks = tk.filter(t => t.status !== 'done')
  const days         = daysUntil(event?.event_date)
  const si           = seatingIntelligence
  const barAction    = zoharBrief?.departmentActions?.barAction

  // Seating completion
  if (si && si.totalGuests > 0) {
    const pct = si.seatingCompletion
    if (pct < 50)       score += 40
    else if (pct < 80)  score += 25
    else if (pct < 100) score += 10
  }

  // Capacity overflow
  if (si && si.capacityWarnings.length > 0) {
    const totalOverflow = si.capacityWarnings.reduce(
      (sum, w) => sum + (w.assigned - w.capacity), 0
    )
    score += totalOverflow > 3 ? 30 : 20
  }

  // VIP issues
  if (si && si.vipWarnings.length > 0) score += 10

  // Task pressure
  if      (pendingTasks.length >= 5) score += 20
  else if (pendingTasks.length >= 3) score += 10

  // Event date proximity (only when pending tasks exist)
  if (days !== null && pendingTasks.length > 0) {
    if      (days <= 3) score += 25
    else if (days <= 7) score += 15
  }

  // Cocktail program
  if (cocktailMenuStatus === 'approved') {
    // 0 — approved
  } else if (barAction === 'cocktail-menu-task-exists') {
    score += 15
  } else {
    score += 10 // no task at all
  }

  // Kitchen preparation (no guest count = kitchen cannot plan)
  if (!event?.expected_guests) score += 10

  // Missing core inputs
  if (!event?.start_time)                              score += 15
  if (!event?.expected_guests)                         score += 15
  if (g.length > 0 && tb.length === 0)                 score += 15

  return Math.min(100, score)
}

function scoreToLevel(score) {
  if (score >= 70) return 'Critical'
  if (score >= 45) return 'High'
  if (score >= 20) return 'Medium'
  return 'Low'
}

// ── Risk object builders ──────────────────────────────────────────────────────

function buildSeatingRisks(guests, tables, seatingIntelligence) {
  const risks = []
  if (!seatingIntelligence) return risks

  const si = seatingIntelligence
  const g  = Array.isArray(guests) ? guests : []
  const tb = Array.isArray(tables) ? tables : []

  // No seating plan exists at all
  if (g.length > 0 && tb.length === 0) {
    risks.push({
      id:             'seating-no-plan',
      severity:       'high',
      category:       'Seating',
      title:          'No floor plan configured',
      description:    'Guests have been added but no seating tables have been configured in Event Architect.',
      recommendation: 'Open Event Architect and create a floor plan before the event.',
    })
    return risks // no point adding completion risks if there are no tables
  }

  // Seating incomplete
  if (si.totalGuests > 0 && si.seatingCompletion < 80) {
    risks.push({
      id:             'seating-incomplete',
      severity:       si.seatingCompletion < 50 ? 'high' : 'medium',
      category:       'Seating',
      title:          'Confirmed guests remain unassigned',
      description:    `${si.unassignedCount} guest${si.unassignedCount !== 1 ? 's' : ''} do not have table assignments (${si.seatingCompletion}% complete).`,
      recommendation: 'Complete seating assignments before the final staff briefing.',
    })
  }

  // Capacity overflow — one risk per overflowed table
  for (const w of si.capacityWarnings) {
    const overflow = w.assigned - w.capacity
    risks.push({
      id:             `capacity-overflow-${w.tableId}`,
      severity:       overflow > 3 ? 'high' : 'medium',
      category:       'Seating',
      title:          'Table capacity exceeded',
      description:    `${w.tableLabel} exceeds capacity by ${overflow} guest${overflow !== 1 ? 's' : ''} (${w.assigned} assigned / ${w.capacity} seats).`,
      recommendation: 'Split guests across additional tables or increase table capacity.',
    })
  }

  return risks
}

function buildVIPRisks(seatingIntelligence) {
  if (!seatingIntelligence) return []
  return seatingIntelligence.vipWarnings.map(w => ({
    id:             `vip-empty-${w.tableId}`,
    severity:       'medium',
    category:       'VIP',
    title:          'VIP table not prepared',
    description:    `${w.tableLabel} is designated VIP but contains no assigned guests.`,
    recommendation: 'Confirm the VIP guest list with the client and complete assignments.',
  }))
}

function buildTimelineRisks(event, tasks) {
  const tk           = Array.isArray(tasks) ? tasks : []
  const pendingTasks = tk.filter(t => t.status !== 'done')
  const days         = daysUntil(event?.event_date)
  const risks        = []

  if (pendingTasks.length >= 3) {
    const dayLabel = days !== null
      ? (days <= 0 ? ' — event is today or past' : ` with ${days} day${days !== 1 ? 's' : ''} until the event`)
      : ''
    risks.push({
      id:             'timeline-task-pressure',
      severity:       pendingTasks.length >= 5 ? 'high' : 'medium',
      category:       'Timeline',
      title:          `${pendingTasks.length} operational tasks pending`,
      description:    `${pendingTasks.length} task${pendingTasks.length !== 1 ? 's' : ''} remain incomplete${dayLabel}.`,
      recommendation: 'Review and close pending tasks before the event.',
    })
  }

  if (days !== null && days <= 7 && pendingTasks.length > 0) {
    const critical = days <= 3
    risks.push({
      id:             'timeline-imminent',
      severity:       critical ? 'critical' : 'high',
      category:       'Timeline',
      title:          critical ? 'Event in 3 days or less with open tasks' : `Event in ${days} day${days !== 1 ? 's' : ''} with open tasks`,
      description:    `${critical ? 'The event is in 3 days or less' : `The event is in ${days} day${days !== 1 ? 's' : ''}`} and ${pendingTasks.length} task${pendingTasks.length !== 1 ? 's' : ''} remain incomplete.`,
      recommendation: critical
        ? 'Escalate all incomplete tasks immediately.'
        : 'Prioritise task completion this week before the event.',
    })
  }

  return risks
}

function buildBarRisks(event, cocktailMenuStatus, zoharBrief) {
  if (cocktailMenuStatus === 'approved') return []

  const barAction   = zoharBrief?.departmentActions?.barAction
  const guestCount  = event?.expected_guests ?? 0
  const risks       = []

  if (barAction === 'cocktail-menu-task-exists') {
    risks.push({
      id:             'bar-cocktail-incomplete',
      severity:       'medium',
      category:       'Bar',
      title:          'Cocktail menu not yet approved',
      description:    'A cocktail menu task exists but has not been approved for this event.',
      recommendation: 'Review and approve the cocktail menu in the Bar tab.',
    })
  } else {
    risks.push({
      id:             'bar-no-cocktail-task',
      severity:       'low',
      category:       'Bar',
      title:          'No cocktail menu task created',
      description:    'No cocktail menu task has been created for this event.',
      recommendation: 'Create a cocktail menu task via the Zohar brief to brief the bar team.',
    })
  }

  if (guestCount >= 150) {
    risks.push({
      id:             'bar-welcome-station',
      severity:       'low',
      category:       'Bar',
      title:          'Welcome station recommended for large guest count',
      description:    `Event has ${guestCount} guests. Arrival pressure peaks in the first 45 minutes.`,
      recommendation: 'Plan a secondary welcome drinks station separate from the main bar.',
    })
  }

  return risks
}

function buildKitchenRisks(event, guests) {
  const g           = Array.isArray(guests) ? guests : []
  const guestCount  = event?.expected_guests ?? 0
  const risks       = []

  if (!event?.start_time) {
    risks.push({
      id:             'kitchen-no-timing',
      severity:       'medium',
      category:       'Kitchen',
      title:          'No service window defined',
      description:    'Event start time is not set — kitchen cannot plan service timing or runner routes.',
      recommendation: 'Set the event start time in event details.',
    })
  }

  const dietaryGuests = g.filter(gt => gt.dietary && gt.dietary.trim()).length
  if (dietaryGuests >= 5 || (dietaryGuests > 0 && guestCount >= 80)) {
    risks.push({
      id:             'kitchen-dietary',
      severity:       'low',
      category:       'Kitchen',
      title:          'Dietary requirements require kitchen preparation',
      description:    `${dietaryGuests} guest${dietaryGuests !== 1 ? 's' : ''} have dietary requirements. Separate plating preparation is needed.`,
      recommendation: 'Pass the dietary list to the chef and confirm preparation protocols.',
    })
  }

  return risks
}

function buildDataRisks(event, guests) {
  const g     = Array.isArray(guests) ? guests : []
  const risks = []

  if (!event?.expected_guests) {
    risks.push({
      id:             'data-no-guest-count',
      severity:       'medium',
      category:       'Data',
      title:          'Expected guest count not set',
      description:    'No expected guest count is set. Bar, kitchen, and staffing recommendations cannot be computed accurately.',
      recommendation: 'Set the expected guest count in event details.',
    })
  }

  if (!event?.start_time) {
    risks.push({
      id:             'data-no-start-time',
      severity:       'medium',
      category:       'Data',
      title:          'Event start time missing',
      description:    'No start time is set. Staff briefing, runner routes, and service timing cannot be confirmed.',
      recommendation: 'Confirm the event start time with the client and update event details.',
    })
  }

  return risks
}

// ── Category priority for nextBestAction tie-breaking ─────────────────────────

const CATEGORY_PRIORITY = {
  'Seating': 1,
  'VIP':     2,
  'Timeline':3,
  'Bar':     4,
  'Kitchen': 5,
  'Data':    6,
  'Staffing':7,
}

const SEVERITY_RANK = { critical: 4, high: 3, medium: 2, low: 1 }

function pickNextBestAction(risks) {
  if (!risks.length) return null
  const sorted = [...risks].sort((a, b) => {
    const sdiff = (SEVERITY_RANK[b.severity] ?? 0) - (SEVERITY_RANK[a.severity] ?? 0)
    if (sdiff !== 0) return sdiff
    return (CATEGORY_PRIORITY[a.category] ?? 99) - (CATEGORY_PRIORITY[b.category] ?? 99)
  })
  return sorted[0]?.recommendation ?? null
}

// ── Department alerts ─────────────────────────────────────────────────────────

function buildDepartmentAlerts(risks) {
  const eventsManager = []
  const bar           = []
  const kitchen       = []

  for (const r of risks) {
    if (r.category === 'Seating' || r.category === 'VIP' || r.category === 'Timeline' || r.category === 'Data') {
      eventsManager.push(r.title)
    }
    if (r.category === 'Bar') {
      bar.push(r.title)
    }
    if (r.category === 'Kitchen') {
      kitchen.push(r.title)
    }
  }

  return { eventsManager, bar, kitchen }
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {{ event, guests?, tables?, tasks?, timeline?, seatingIntelligence?, cocktailMenuStatus?, zoharBrief? }} input
 * @returns {{ overallRiskLevel, riskScore, risks, recommendations, nextBestAction, departmentAlerts } | null}
 */
export function computeRiskAssessment({
  event,
  guests            = [],
  tables            = [],
  tasks             = [],
  timeline          = [],
  seatingIntelligence = null,
  cocktailMenuStatus  = null,
  zoharBrief          = null,
}) {
  if (!event) return null

  const g  = Array.isArray(guests)   ? guests   : []
  const tb = Array.isArray(tables)   ? tables   : []
  const tk = Array.isArray(tasks)    ? tasks    : []

  const riskScore = computeRiskScore({
    event, guests: g, tables: tb, tasks: tk,
    seatingIntelligence, cocktailMenuStatus, zoharBrief,
  })

  const risks = [
    ...buildSeatingRisks(g, tb, seatingIntelligence),
    ...buildVIPRisks(seatingIntelligence),
    ...buildTimelineRisks(event, tk),
    ...buildBarRisks(event, cocktailMenuStatus, zoharBrief),
    ...buildKitchenRisks(event, g),
    ...buildDataRisks(event, g),
  ]

  const overallRiskLevel  = scoreToLevel(riskScore)
  const nextBestAction    = pickNextBestAction(risks)
  const departmentAlerts  = buildDepartmentAlerts(risks)
  const recommendations   = risks.map(r => r.recommendation)

  return {
    overallRiskLevel,
    riskScore,
    risks,
    recommendations,
    nextBestAction,
    departmentAlerts,
  }
}
