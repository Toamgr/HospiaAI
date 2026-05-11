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
    return 'No operational history has been submitted yet. HOSPIA will begin building venue memory after shift reports, incidents, and action follow-ups are logged.'
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
