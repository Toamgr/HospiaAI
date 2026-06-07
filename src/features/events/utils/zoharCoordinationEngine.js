/**
 * Zohar Coordination Engine — deterministic department coordination assessment.
 *
 * Pure utility. No React. No side effects. No AI calls. No demo data.
 *
 * Builds on top of seatingIntelligence and zoharRiskEngine.
 * Does NOT recompute risks already identified by zoharRiskEngine.
 * Adds: department readiness percentages, cross-department warnings,
 * primary bottleneck, coordination actions, and Event Director Summary.
 *
 * Input:  { event, guests, tables, tasks, seatingIntelligence, riskAssessment, zoharBrief, cocktailMenuStatus }
 * Output: { readinessBreakdown, departmentStatus, bottlenecks, crossDepartmentWarnings,
 *           coordinationActions, primaryBottleneck, eventDirectorSummary }
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(dateStr) {
  if (!dateStr) return null
  try {
    return Math.ceil((new Date(dateStr + 'T12:00:00') - new Date()) / 86400000)
  } catch { return null }
}

// ── Department readiness (0–100) ──────────────────────────────────────────────

/**
 * Events Manager readiness:
 *   50 pts — seating completion (scaled)
 *   20 pts — expected guest count is set
 *   15 pts — event start time is set
 *   15 pts — no table capacity overflow
 */
function computeEventsManagerReadiness(event, seatingIntelligence) {
  let score = 0
  const si = seatingIntelligence

  // Seating (50 pts)
  if (si && si.totalGuests > 0) {
    score += Math.round(si.seatingCompletion * 0.5)
  } else {
    // No guests loaded yet — give neutral partial credit; seating is not yet applicable
    score += 25
  }

  if (event?.expected_guests) score += 20
  if (event?.start_time)      score += 15

  const hasOverflow = si && si.capacityWarnings.length > 0
  if (!hasOverflow) score += 15

  return Math.min(100, score)
}

/**
 * Bar readiness:
 *   100 — cocktail menu approved
 *    60 — task exists and in progress
 *    30 — brief available but no task
 *    10 — nothing
 */
function computeBarReadiness(cocktailMenuStatus, zoharBrief) {
  if (cocktailMenuStatus === 'approved') return 100

  const barAction   = zoharBrief?.departmentActions?.barAction
  const hasBrief    = Boolean(zoharBrief?.cocktailMenuBrief?.outputRequestText)

  if (barAction === 'cocktail-menu-task-exists') return 60
  if (hasBrief)                                  return 30
  return 10
}

/**
 * Kitchen readiness:
 *   35 pts — event start time set (service window)
 *   30 pts — expected guest count set
 *   25 pts — food brief available
 *   10 pts — no excessive dietary concentration (< 30% of expected guests)
 */
function computeKitchenReadiness(event, guests, zoharBrief) {
  let score = 0
  const g          = Array.isArray(guests) ? guests : []
  const guestCount = event?.expected_guests ?? 0

  if (event?.start_time)                                        score += 35
  if (guestCount > 0)                                           score += 30
  if (zoharBrief?.foodMenuBrief?.outputRequestText)             score += 25

  const dietaryGuests = g.filter(gt => gt.dietary && gt.dietary.trim()).length
  const dietaryRatio  = guestCount > 0 ? dietaryGuests / guestCount : 0
  if (dietaryGuests === 0 || dietaryRatio < 0.3)                score += 10

  return Math.min(100, score)
}

function statusFromReadiness(pct) {
  if (pct >= 85) return 'Ready'
  if (pct >= 40) return 'In Progress'
  return 'Blocked'
}

// ── Primary bottleneck ────────────────────────────────────────────────────────

const BOTTLENECK_PRIORITY = [
  'Seating', 'Bar Programme', 'Kitchen Preparation',
  'Timeline Readiness', 'Guest Data', 'None',
]

function detectPrimaryBottleneck(emPct, barPct, kitPct, event, tasks) {
  const tk           = Array.isArray(tasks) ? tasks : []
  const pendingTasks = tk.filter(t => t.status !== 'done')
  const days         = daysUntil(event?.event_date)

  const candidates = []

  // Seating — gap from 85% target
  if (emPct < 85) {
    candidates.push({ label: 'Seating', gap: 85 - emPct })
  }

  // Bar — gap from 85% target
  if (barPct < 85) {
    candidates.push({ label: 'Bar Programme', gap: 85 - barPct })
  }

  // Kitchen — gap from 85% target
  if (kitPct < 85) {
    candidates.push({ label: 'Kitchen Preparation', gap: 85 - kitPct })
  }

  // Timeline — only when tasks + proximity combine
  if (pendingTasks.length >= 3 && days !== null && days <= 14) {
    const gap = Math.min(60, pendingTasks.length * 4 + (days <= 7 ? 20 : 0))
    candidates.push({ label: 'Timeline Readiness', gap })
  }

  // Guest Data — missing core inputs
  if (!event?.expected_guests || !event?.start_time) {
    const gap = (!event?.expected_guests ? 30 : 0) + (!event?.start_time ? 20 : 0)
    candidates.push({ label: 'Guest Data', gap })
  }

  if (candidates.length === 0) return 'None'

  // Sort: highest gap wins; BOTTLENECK_PRIORITY breaks ties
  candidates.sort((a, b) => {
    if (b.gap !== a.gap) return b.gap - a.gap
    return BOTTLENECK_PRIORITY.indexOf(a.label) - BOTTLENECK_PRIORITY.indexOf(b.label)
  })

  return candidates[0].label
}

// ── Cross-department warnings ─────────────────────────────────────────────────

function buildCrossWarnings(emPct, barPct, kitPct, event, tables, seatingIntelligence, cocktailMenuStatus) {
  const warnings    = []
  const si          = seatingIntelligence
  const tb          = Array.isArray(tables) ? tables : []
  const guestCount  = event?.expected_guests ?? 0
  const seatingPct  = si?.seatingCompletion ?? 0

  // Kitchen on track but bar blocked
  if (kitPct >= 85 && barPct < 40) {
    warnings.push('Kitchen preparation is on track while beverage planning remains incomplete. Brief the bar team before finalising the service schedule.')
  }

  // Bar approved but seating unfinished
  if (barPct >= 85 && seatingPct < 80 && si && si.totalGuests > 0) {
    warnings.push('Cocktail programme is approved but guest seating remains unfinished. Complete seating before the final staff briefing.')
  }

  // VIP tables exist with no premium beverage confirmation
  const vipTables = tb.filter(t => t.zone === 'vip' || t.shape === 'vip')
  if (vipTables.length > 0 && cocktailMenuStatus !== 'approved') {
    warnings.push('VIP seating exists but no premium beverage programme is currently confirmed. Coordinate VIP service planning with the bar team.')
  }

  // Large event without welcome station confirmation
  if (guestCount >= 150 && cocktailMenuStatus !== 'approved') {
    warnings.push(`Guest count (${guestCount}) exceeds the welcome service threshold. A dedicated welcome drinks station has not been confirmed.`)
  }

  // Seating largely complete but kitchen not ready
  if (si && seatingPct >= 90 && kitPct < 60) {
    warnings.push('Guest seating is nearly complete but kitchen preparation requires attention before the event date.')
  }

  return warnings.slice(0, 4)
}

// ── Coordination actions (max 3) ──────────────────────────────────────────────

function buildCoordinationActions(primaryBottleneck, barPct, seatingIntelligence, event, cocktailMenuStatus) {
  const actions = []
  const si      = seatingIntelligence

  // Primary bottleneck action
  switch (primaryBottleneck) {
    case 'Seating':
      if (si && si.unassignedCount > 0) {
        actions.push(`Assign the remaining ${si.unassignedCount} guest${si.unassignedCount !== 1 ? 's' : ''} to tables.`)
      } else {
        actions.push('Complete floor plan configuration in Event Architect.')
      }
      break

    case 'Bar Programme':
      actions.push(
        barPct >= 60
          ? 'Approve the cocktail menu before the final staff briefing.'
          : 'Create and approve a cocktail menu task for the bar team.'
      )
      break

    case 'Kitchen Preparation':
      if (!event?.start_time) {
        actions.push('Set the event start time to enable kitchen service planning.')
      } else if (!event?.expected_guests) {
        actions.push('Set the expected guest count to enable kitchen planning.')
      } else {
        actions.push('Confirm kitchen preparation protocols with the head chef.')
      }
      break

    case 'Timeline Readiness':
      actions.push('Review and resolve all pending operational tasks before the event.')
      break

    case 'Guest Data':
      if (!event?.expected_guests) actions.push('Set the expected guest count in event details.')
      if (!event?.start_time)      actions.push('Confirm and set the event start time.')
      break

    default:
      break
  }

  // Fill remaining slots with secondary gaps
  if (actions.length < 3 && cocktailMenuStatus !== 'approved' && primaryBottleneck !== 'Bar Programme' && barPct < 85) {
    actions.push('Approve the cocktail menu before the final briefing.')
  }

  if (actions.length < 3 && si && si.unassignedCount > 0 && primaryBottleneck !== 'Seating') {
    actions.push(`Assign ${si.unassignedCount} remaining guest${si.unassignedCount !== 1 ? 's' : ''} to tables.`)
  }

  if (actions.length < 3 && !event?.start_time && primaryBottleneck !== 'Guest Data' && primaryBottleneck !== 'Kitchen Preparation') {
    actions.push('Confirm the event start time with the client.')
  }

  return actions.slice(0, 3)
}

// ── Event Director Summary ────────────────────────────────────────────────────

function buildEventDirectorSummary(primaryBottleneck, deptStatus, seatingIntelligence, event, barPct, kitPct) {
  if (primaryBottleneck === 'None') {
    return 'All departments are operationally aligned. Continue monitoring guest changes and final confirmations.'
  }

  const si         = seatingIntelligence
  const seatingPct = si?.seatingCompletion ?? 0

  // Build context sentences for other departments
  const otherParts = []
  if (primaryBottleneck !== 'Bar Programme') {
    if (deptStatus.bar === 'Ready')       otherParts.push('Beverage planning is confirmed.')
    else if (deptStatus.bar === 'Blocked') otherParts.push('Beverage planning remains incomplete.')
  }
  if (primaryBottleneck !== 'Kitchen Preparation') {
    if (deptStatus.kitchen === 'Ready')       otherParts.push('Kitchen preparation appears ready.')
    else if (deptStatus.kitchen === 'Blocked') otherParts.push('Kitchen preparation requires attention.')
  }
  const context = otherParts.join(' ')

  switch (primaryBottleneck) {
    case 'Seating':
      return [
        `Guest seating remains the primary operational blocker (${seatingPct}% complete).`,
        context,
        'Complete seating assignments before the final staff briefing.',
      ].filter(Boolean).join(' ')

    case 'Bar Programme':
      return [
        'Beverage planning is the primary operational gap.',
        context,
        'Approve the cocktail menu before the final staff briefing.',
      ].filter(Boolean).join(' ')

    case 'Kitchen Preparation': {
      const missing = !event?.start_time
        ? 'service timing'
        : !event?.expected_guests
        ? 'the guest count'
        : 'preparation protocols'
      return [
        `Kitchen preparation requires ${missing} to be confirmed.`,
        context,
        'Address kitchen readiness before finalising the event plan.',
      ].filter(Boolean).join(' ')
    }

    case 'Timeline Readiness':
      return [
        'Operational task completion is the current priority.',
        context,
        'Review and close all pending tasks before the event date.',
      ].filter(Boolean).join(' ')

    case 'Guest Data':
      return [
        'Key event data is incomplete, which limits planning across all departments.',
        context,
        'Set the guest count and start time to unblock cross-department coordination.',
      ].filter(Boolean).join(' ')

    default:
      return 'Event planning is in progress. Review department status and address any remaining gaps.'
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * @param {{ event, guests?, tables?, tasks?, seatingIntelligence?, riskAssessment?, zoharBrief?, cocktailMenuStatus? }} input
 * @returns {object|null}
 */
export function computeCoordination({
  event,
  guests             = [],
  tables             = [],
  tasks              = [],
  seatingIntelligence  = null,
  riskAssessment       = null,
  zoharBrief           = null,
  cocktailMenuStatus   = null,
}) {
  if (!event) return null

  const g  = Array.isArray(guests) ? guests : []
  const tb = Array.isArray(tables) ? tables : []
  const tk = Array.isArray(tasks)  ? tasks  : []

  // ── Readiness percentages ──────────────────────────────────────────────────
  const emPct  = computeEventsManagerReadiness(event, seatingIntelligence)
  const barPct = computeBarReadiness(cocktailMenuStatus, zoharBrief)
  const kitPct = computeKitchenReadiness(event, g, zoharBrief)
  const overall = Math.round(emPct * 0.4 + barPct * 0.3 + kitPct * 0.3)

  const readinessBreakdown = {
    eventsManager: emPct,
    bar:           barPct,
    kitchen:       kitPct,
    overall,
  }

  // ── Department status ──────────────────────────────────────────────────────
  const departmentStatus = {
    eventsManager: statusFromReadiness(emPct),
    bar:           statusFromReadiness(barPct),
    kitchen:       statusFromReadiness(kitPct),
  }

  // ── Primary bottleneck ─────────────────────────────────────────────────────
  const primaryBottleneck = detectPrimaryBottleneck(emPct, barPct, kitPct, event, tk)

  // ── Cross-department warnings ──────────────────────────────────────────────
  const crossDepartmentWarnings = buildCrossWarnings(
    emPct, barPct, kitPct, event, tb, seatingIntelligence, cocktailMenuStatus
  )

  // ── Coordination actions ───────────────────────────────────────────────────
  const coordinationActions = buildCoordinationActions(
    primaryBottleneck, barPct, seatingIntelligence, event, cocktailMenuStatus
  )

  // ── Event Director Summary ─────────────────────────────────────────────────
  const eventDirectorSummary = buildEventDirectorSummary(
    primaryBottleneck, departmentStatus, seatingIntelligence, event, barPct, kitPct
  )

  return {
    readinessBreakdown,
    departmentStatus,
    bottlenecks:            [primaryBottleneck].filter(b => b !== 'None'),
    crossDepartmentWarnings,
    coordinationActions,
    primaryBottleneck,
    eventDirectorSummary,
  }
}
