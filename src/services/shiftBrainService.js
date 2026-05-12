function daysSince(dateStr) {
  if (!dateStr) return 0
  return Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000))
}

function getItemDate(item) {
  return item.created_at || item.date || item.shift_date || item.time || ''
}

function buildSummary(actionItems, serviceIncidents, eventPlans, today) {
  const openActions = actionItems.filter(a => !a.done && a.status !== 'Completed').length
  const urgentActions = actionItems.filter(a => !a.done && (a.priority === 'urgent' || a.priority === 'Critical')).length
  const unresolvedIncidents = serviceIncidents.filter(i => !i.resolved).length
  const criticalIncidents = serviceIncidents.filter(i => !i.resolved && (i.severity === 'high' || i.severity === 'critical')).length
  const eventsToday = eventPlans.filter(e => {
    const d = e.config?.eventDate || e.eventDate || ''
    return d.startsWith(today) && e.status !== 'cancelled'
  }).length

  const criticalCount = urgentActions + criticalIncidents
  const hasUrgentItems = criticalCount > 0

  let operationalStatus = 'clear'
  if (criticalCount >= 2 || (unresolvedIncidents >= 4 && urgentActions > 0)) {
    operationalStatus = 'critical'
  } else if (hasUrgentItems || unresolvedIncidents >= 2 || openActions >= 5) {
    operationalStatus = 'attention'
  }

  return { totalSignals: openActions + unresolvedIncidents, criticalCount, unresolvedIncidents, openActions, urgentActions, eventsToday, hasUrgentItems, operationalStatus }
}

function buildCriticalItems(actionItems, serviceIncidents) {
  const urgentActions = actionItems
    .filter(a => !a.done && a.status !== 'Completed' && (a.priority === 'urgent' || a.priority === 'Critical'))
    .map(a => ({ id: a.id, type: 'action', label: a.title, detail: `Owner: ${a.owner || 'Manager'} · Due: ${a.due || 'ASAP'}`, priority: a.priority, source: 'actionBoard' }))

  const highIncidents = serviceIncidents
    .filter(i => !i.resolved && (i.severity === 'high' || i.severity === 'critical'))
    .map(i => ({ id: i.id, type: 'incident', label: i.description || i.issueType || 'Service incident', detail: `${i.employeeName || 'Staff'} · ${i.guestTable ? `Table ${i.guestTable}` : 'No table'}`, priority: 'high', source: 'serviceRecovery' }))

  return [...urgentActions, ...highIncidents].slice(0, 8)
}

function buildCarryForwardItems(actionItems, serviceIncidents) {
  const oldActions = actionItems
    .filter(a => !a.done && a.status !== 'Completed' && daysSince(getItemDate(a)) >= 3)
    .map(a => ({ id: a.id, type: 'action', label: a.title, detail: `Owner: ${a.owner || 'Manager'}`, daysOpen: daysSince(getItemDate(a)), source: 'actionBoard' }))
    .sort((a, b) => b.daysOpen - a.daysOpen)
    .slice(0, 5)

  const oldIncidents = serviceIncidents
    .filter(i => !i.resolved && daysSince(getItemDate(i)) >= 2)
    .map(i => ({ id: i.id, type: 'incident', label: i.description || i.issueType || 'Unresolved incident', detail: i.employeeName || 'Staff', daysOpen: daysSince(getItemDate(i)), source: 'serviceRecovery' }))
    .sort((a, b) => b.daysOpen - a.daysOpen)
    .slice(0, 3)

  return [...oldActions, ...oldIncidents].sort((a, b) => b.daysOpen - a.daysOpen).slice(0, 6)
}

function detectRiskSignals(actionItems, serviceIncidents, eventPlans, today) {
  const signals = []

  const urgentCount = actionItems.filter(a => !a.done && (a.priority === 'urgent' || a.priority === 'Critical')).length
  if (urgentCount >= 2) {
    signals.push({ id: 'risk-urgent', signal: `${urgentCount} urgent actions unresolved simultaneously`, severity: 'high', source: 'actionBoard' })
  }

  const categoryMap = {}
  serviceIncidents.filter(i => !i.resolved).forEach(i => {
    const key = i.issueType || 'Service issue'
    categoryMap[key] = (categoryMap[key] || 0) + 1
  })
  Object.entries(categoryMap).filter(([, c]) => c >= 2).forEach(([cat, c]) => {
    signals.push({ id: `risk-pattern-${cat}`, signal: `${cat} recurring: ${c} unresolved cases`, severity: c >= 3 ? 'high' : 'medium', source: 'serviceRecovery' })
  })

  const todayEvents = eventPlans.filter(e => {
    const d = e.config?.eventDate || e.eventDate || ''
    return d.startsWith(today) && e.status !== 'cancelled'
  })
  if (todayEvents.length > 0 && !actionItems.some(a => a.page === 'eventOrchestrator' && !a.done)) {
    signals.push({ id: 'risk-event-no-prep', signal: 'Event today — no open prep actions found, confirm setup is complete', severity: 'medium', source: 'eventOrchestrator' })
  }

  const staleCount = actionItems.filter(a => !a.done && daysSince(getItemDate(a)) >= 7).length
  if (staleCount > 0) {
    signals.push({ id: 'risk-stale', signal: `${staleCount} action${staleCount !== 1 ? 's' : ''} unresolved for 7+ days`, severity: 'medium', source: 'actionBoard' })
  }

  return signals.slice(0, 5)
}

function buildEventPressure(eventPlans, today) {
  const sevenDaysOut = new Date()
  sevenDaysOut.setDate(sevenDaysOut.getDate() + 7)
  const sevenDaysOutStr = sevenDaysOut.toISOString().slice(0, 10)

  const todayEvents = eventPlans.filter(e => {
    const d = e.config?.eventDate || e.eventDate || ''
    return d.startsWith(today) && e.status !== 'cancelled'
  })
  const upcomingEvents = eventPlans.filter(e => {
    const d = e.config?.eventDate || e.eventDate || ''
    return d > today && d <= sevenDaysOutStr && e.status !== 'cancelled'
  }).slice(0, 3)

  const totalGuestsToday = todayEvents.reduce((s, e) => s + (e.config?.guestCount || 0), 0)

  return {
    today: todayEvents,
    upcoming: upcomingEvents,
    totalGuestsToday,
    hasHighPressure: todayEvents.length > 0 && totalGuestsToday >= 50,
    hasMultipleEvents: todayEvents.length > 1
  }
}

function detectServicePatterns(serviceIncidents) {
  const map = {}
  serviceIncidents.forEach(i => {
    const key = i.issueType || 'Service issue'
    if (!map[key]) map[key] = { count: 0, highCount: 0, latest: '' }
    map[key].count++
    if (i.severity === 'high' || i.severity === 'critical') map[key].highCount++
    const d = getItemDate(i)
    if (d > map[key].latest) map[key].latest = d
  })

  return Object.entries(map)
    .filter(([, v]) => v.count >= 2)
    .map(([category, v]) => ({ category, count: v.count, severity: v.highCount > 0 ? 'high' : 'medium', recent: v.latest.slice(0, 10) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
}

function buildRecommendedFocus(summary, eventPressure, servicePatterns, carryForwardItems) {
  const focus = []

  if (summary.operationalStatus === 'critical') {
    focus.push(`Resolve ${summary.urgentActions} urgent action${summary.urgentActions !== 1 ? 's' : ''} before doors open — assign owners now`)
  }

  if (eventPressure.hasHighPressure) {
    focus.push(`High-volume event tonight (${eventPressure.totalGuestsToday} guests) — confirm floor, kitchen, and bar alignment`)
  } else if (eventPressure.today.length > 0) {
    focus.push('Event on schedule tonight — review setup status and staff assignments before service')
  }

  if (servicePatterns.length > 0) {
    focus.push(`Recurring pattern: ${servicePatterns[0].category} — brief the team and confirm corrective steps are in place`)
  }

  if (summary.unresolvedIncidents >= 3) {
    focus.push(`${summary.unresolvedIncidents} open incidents — assign resolution owners during pre-shift`)
  }

  const oldestCarry = carryForwardItems.find(i => i.daysOpen >= 5)
  if (oldestCarry) {
    const label = oldestCarry.label.length > 55 ? oldestCarry.label.slice(0, 55) + '...' : oldestCarry.label
    focus.push(`"${label}" has been open ${oldestCarry.daysOpen} days — escalate or close today`)
  }

  if (focus.length === 0) {
    focus.push('Clean operational slate — use pre-shift to reinforce service standards and team culture')
  }

  return focus.slice(0, 5)
}

function buildManagerChecklist(summary, eventPressure) {
  const list = [
    { id: 'chk-brief', text: 'Deliver pre-shift briefing to full team', category: 'shift-open' },
    { id: 'chk-floor', text: 'Confirm floor plan and section assignments', category: 'shift-open' },
    { id: 'chk-pos', text: 'Verify POS and menu are current', category: 'shift-open' }
  ]

  if (summary.openActions > 0) {
    list.push({ id: 'chk-actions', text: `Review ${summary.openActions} open action${summary.openActions !== 1 ? 's' : ''} — confirm shift owner for each`, category: 'operations' })
  }
  if (eventPressure.today.length > 0) {
    list.push({ id: 'chk-event-setup', text: 'Confirm event setup: decor, AV, and catering timeline', category: 'event' })
    list.push({ id: 'chk-event-brief', text: 'Brief event roles and service flow with team', category: 'event' })
  }
  if (summary.unresolvedIncidents > 0) {
    list.push({ id: 'chk-incidents', text: `Follow up on ${summary.unresolvedIncidents} unresolved incident${summary.unresolvedIncidents !== 1 ? 's' : ''}`, category: 'service' })
  }

  list.push({ id: 'chk-close', text: 'Confirm closing manager and EOD report assignment', category: 'shift-close' })
  return list
}

export function buildShiftIntelligence({ actionItems = [], serviceIncidents = [], eventPlans = [], ownerNotes = [] } = {}) {
  const today = new Date().toISOString().slice(0, 10)
  const summary = buildSummary(actionItems, serviceIncidents, eventPlans, today)
  const criticalItems = buildCriticalItems(actionItems, serviceIncidents)
  const carryForwardItems = buildCarryForwardItems(actionItems, serviceIncidents)
  const riskSignals = detectRiskSignals(actionItems, serviceIncidents, eventPlans, today)
  const eventPressure = buildEventPressure(eventPlans, today)
  const servicePatterns = detectServicePatterns(serviceIncidents)
  const recommendedFocus = buildRecommendedFocus(summary, eventPressure, servicePatterns, carryForwardItems)
  const managerChecklist = buildManagerChecklist(summary, eventPressure)
  return { date: today, summary, criticalItems, carryForwardItems, riskSignals, eventPressure, servicePatterns, recommendedFocus, managerChecklist }
}

export function buildShiftBrainSnapshot({ reports = [], incidents = [], actions = [], tasks = [], memory = [] } = {}) {
  const unresolvedIncidents = incidents.filter(item => !item.resolved)
  const openActions = actions.filter(item => !item.done && item.status !== 'Completed')
  const repeatedCategories = incidents.reduce((acc, incident) => {
    const key = incident.issueType || incident.category || 'Service issue'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
  const topPattern = Object.entries(repeatedCategories).sort((a, b) => b[1] - a[1])[0]
  return {
    reportCount: reports.length,
    unresolvedIncidentCount: unresolvedIncidents.length,
    openActionCount: openActions.length,
    assignedTaskCount: tasks.filter(item => item.status !== 'done' && item.status !== 'Done').length,
    memoryCount: memory.length,
    topRecurringPattern: topPattern ? { label: topPattern[0], count: topPattern[1] } : null,
    needsAttention: Boolean(unresolvedIncidents.length || openActions.length)
  }
}

export function generateOwnerBrief(snapshot) {
  if (!snapshot.reportCount && !snapshot.memoryCount) {
    return 'No operational history has been submitted yet. HESTIA will begin building venue memory after shift reports, incidents, and action follow-ups are logged.'
  }
  const pattern = snapshot.topRecurringPattern
    ? `Recurring pattern: ${snapshot.topRecurringPattern.label} appeared ${snapshot.topRecurringPattern.count} times.`
    : 'No dominant recurring pattern yet.'
  return [
    `${snapshot.unresolvedIncidentCount} unresolved service incidents.`,
    `${snapshot.openActionCount} open manager actions.`,
    pattern
  ].join(' ')
}
