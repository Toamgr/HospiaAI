/**
 * Daily Briefing Engine — deterministic event health briefing for the calendar view.
 *
 * Pure utility. No React. No side effects. No AI.
 *
 * Consumes intelligenceMap (output of buildCalendarIntelligence per event) — does NOT
 * re-run any intelligence engine. All health classification, risk detection, and
 * deadline logic reads directly from pre-computed calendarSummary and eventHealth.
 *
 * Input:  { events[], intelligenceMap }
 * Output: { criticalEvents, attentionEvents, readyEvents, upcomingDeadlines, todaySummary }
 *
 * Limitation: seating deadline requires seatingIntelligence, which is not loaded in the
 * calendar context. seatingStatus will be "Unknown" for all events here; the seating
 * deadline is therefore suppressed. It surfaces correctly in the full Zohar brief (EventDetail).
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function isActiveEvent(event) {
  return !['completed', 'cancelled'].includes(event?.status)
}

// ── dueLevel from days remaining ──────────────────────────────────────────────

function dueLevel(days, urgencyThreshold = 7) {
  if (days <= 3)                      return 'critical'
  if (days <= urgencyThreshold)       return 'warning'
  return 'normal'
}

// ── Deadline generation ───────────────────────────────────────────────────────

function buildDeadlines(activeEvents, intelligenceMap) {
  const deadlines = []

  for (const event of activeEvents) {
    const intel   = intelligenceMap[event.id]
    if (!intel) continue

    const summary = intel.calendarSummary
    const days    = summary?.daysUntil

    // Only include upcoming and today's events
    if (days == null || days < 0) continue

    // ── Cocktail menu not approved · within 14 days ──────────────────────────
    if (summary.cocktailStatus !== 'approved' && days <= 14) {
      const level = dueLevel(days, 7)
      deadlines.push({
        eventId:      event.id,
        eventName:    event.name,
        action:       summary.cocktailStatus === 'draft'
          ? 'Review and approve cocktail menu'
          : 'Generate and approve cocktail menu',
        dueLevel:     level,
        daysRemaining: days,
      })
    }

    // ── Start time missing · within 30 days ──────────────────────────────────
    if (!event.start_time && days <= 30) {
      const level = dueLevel(days, 14)
      deadlines.push({
        eventId:      event.id,
        eventName:    event.name,
        action:       'Set event start time',
        dueLevel:     level,
        daysRemaining: days,
      })
    }

    // ── Guest count not finalized · within 14 days ────────────────────────────
    if (!event.expected_guests && days <= 14) {
      const level = dueLevel(days, 7)
      deadlines.push({
        eventId:      event.id,
        eventName:    event.name,
        action:       'Finalize expected guest count',
        dueLevel:     level,
        daysRemaining: days,
      })
    }

    // ── Architect plan missing · within 14 days ───────────────────────────────
    if (summary.architectStatus !== 'planned' && days <= 14) {
      const level = dueLevel(days, 3)   // only critical when within 3d, else normal
      deadlines.push({
        eventId:      event.id,
        eventName:    event.name,
        action:       'Create floor plan in Event Architect',
        dueLevel:     level,
        daysRemaining: days,
      })
    }

    // ── Seating below 80% · within 7 days ────────────────────────────────────
    // Note: seatingStatus is "Unknown" in the calendar context (no guest detail loaded).
    // This deadline only fires when full seating data is available (e.g., from EventDetail).
    if (days <= 7) {
      const seatingPct = parseInt(summary.seatingStatus, 10)
      if (!isNaN(seatingPct) && seatingPct < 80) {
        const level = dueLevel(days, 7)
        deadlines.push({
          eventId:      event.id,
          eventName:    event.name,
          action:       'Complete guest seating assignments',
          dueLevel:     level,
          daysRemaining: days,
        })
      }
    }
  }

  // Sort: critical first, then warning, then normal; within each group nearest date first
  const LEVEL_RANK = { critical: 0, warning: 1, normal: 2 }
  deadlines.sort((a, b) => {
    const ld = (LEVEL_RANK[a.dueLevel] ?? 2) - (LEVEL_RANK[b.dueLevel] ?? 2)
    if (ld !== 0) return ld
    return a.daysRemaining - b.daysRemaining
  })

  return deadlines
}

// ── Health bucket classification ──────────────────────────────────────────────

function classifyEvent(event, intel) {
  if (!intel) return null

  const health  = intel.eventHealth
  const summary = intel.calendarSummary
  const days    = summary?.daysUntil
  const score   = health?.score

  const isCritical = (
    health?.status === 'Critical' ||
    (days !== null && days !== undefined && days <= 3) ||
    (score !== undefined && score < 50)
  )

  if (isCritical)                         return 'critical'
  if (health?.status === 'Needs Attention') return 'attention'
  if (health?.status === 'Ready')          return 'ready'
  return null
}

// ── Sorting helpers ───────────────────────────────────────────────────────────
// Both functions sort in-place (arr.sort) AND return arr, so they work whether
// the caller captures the return value or not.

function sortByScoreAscThenDate(arr, intelligenceMap) {
  return arr.sort((a, b) => {
    const sa = intelligenceMap[a.id]?.eventHealth?.score ?? 100
    const sb = intelligenceMap[b.id]?.eventHealth?.score ?? 100
    if (sa !== sb) return sa - sb                                // lowest score first
    const da = intelligenceMap[a.id]?.calendarSummary?.daysUntil ?? 999
    const db = intelligenceMap[b.id]?.calendarSummary?.daysUntil ?? 999
    return da - db                                               // nearest date first
  })
}

function sortByDateAsc(arr, intelligenceMap) {
  return arr.sort((a, b) => {
    const da = intelligenceMap[a.id]?.calendarSummary?.daysUntil ?? 999
    const db = intelligenceMap[b.id]?.calendarSummary?.daysUntil ?? 999
    return da - db
  })
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Build the daily briefing model from events and their pre-computed intelligence.
 *
 * @param {{ events: object[], intelligenceMap: object }} input
 * @returns {{
 *   criticalEvents:    object[],
 *   attentionEvents:   object[],
 *   readyEvents:       object[],
 *   upcomingDeadlines: object[],
 *   todaySummary:      object,
 * } | null}
 */
export function buildDailyBriefing({ events, intelligenceMap }) {
  if (!events || !intelligenceMap) return null

  const activeEvents = events.filter(isActiveEvent)

  // ── Health buckets ─────────────────────────────────────────────────────────
  const criticalEvents  = []
  const attentionEvents = []
  const readyEvents     = []

  for (const event of activeEvents) {
    const bucket = classifyEvent(event, intelligenceMap[event.id])
    if (bucket === 'critical')  criticalEvents.push(event)
    else if (bucket === 'attention') attentionEvents.push(event)
    else if (bucket === 'ready')     readyEvents.push(event)
  }

  // Sort: critical → lowest score first, then nearest date
  sortByScoreAscThenDate(criticalEvents, intelligenceMap)

  // Sort: attention + ready → nearest date first
  sortByDateAsc(attentionEvents, intelligenceMap)
  sortByDateAsc(readyEvents, intelligenceMap)

  // ── Upcoming deadlines ─────────────────────────────────────────────────────
  const upcomingDeadlines = buildDeadlines(activeEvents, intelligenceMap)

  // ── Today summary ──────────────────────────────────────────────────────────
  const upcomingActive = activeEvents.filter(e => {
    const days = intelligenceMap[e.id]?.calendarSummary?.daysUntil
    return days !== null && days !== undefined && days >= 0
  })

  const nextUpcomingEvent = sortByDateAsc(upcomingActive, intelligenceMap)[0] ?? null
  const highestRiskEvent  = criticalEvents[0] ?? attentionEvents[0] ?? null

  const todaySummary = {
    totalEvents:     activeEvents.length,
    criticalCount:   criticalEvents.length,
    attentionCount:  attentionEvents.length,
    readyCount:      readyEvents.length,
    nextUpcomingEvent: nextUpcomingEvent
      ? {
          id:        nextUpcomingEvent.id,
          name:      nextUpcomingEvent.name,
          eventType: nextUpcomingEvent.event_type,
          daysUntil: intelligenceMap[nextUpcomingEvent.id]?.calendarSummary?.daysUntil,
        }
      : null,
    highestRiskEvent: highestRiskEvent
      ? {
          id:        highestRiskEvent.id,
          name:      highestRiskEvent.name,
          eventType: highestRiskEvent.event_type,
          score:     intelligenceMap[highestRiskEvent.id]?.eventHealth?.score,
        }
      : null,
  }

  return {
    criticalEvents,
    attentionEvents,
    readyEvents,
    upcomingDeadlines,
    todaySummary,
  }
}
