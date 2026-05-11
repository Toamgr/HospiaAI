import { API_BASE } from '../config/systemConfig'
import { buildShiftBrainSnapshot, generateOwnerBrief } from './shiftBrainService'

export function buildWeeklyBusinessBrief(data = {}) {
  const snapshot = buildShiftBrainSnapshot(data)
  return {
    id: `owner-brief-${Date.now()}`,
    title: 'Weekly Business Brief',
    generated_at: new Date().toISOString(),
    snapshot,
    summary: generateOwnerBrief(snapshot),
    recommendedActions: [
      snapshot.unresolvedIncidentCount ? 'Resolve open guest experience incidents before the next peak shift.' : 'Keep incident logging consistent to build stronger venue memory.',
      snapshot.openActionCount ? 'Review overdue manager actions and assign clear owners.' : 'Create action items directly from shift reports when patterns appear.',
      snapshot.topRecurringPattern ? `Coach the team around repeated ${snapshot.topRecurringPattern.label.toLowerCase()} signals.` : 'Use shift reports to detect recurring service patterns.'
    ]
  }
}

export async function generateAIWeeklyBrief({ reports = [], incidents = [], actions = [], eventPlans = [], role = 'owner' } = {}) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const recentReports = reports.filter(r => (r.shift_date || r.created_at || '') >= sevenDaysAgo)
  const unresolved = incidents.filter(i => !i.resolved)
  const openActions = actions.filter(a => !a.done && a.status !== 'Completed')
  const totalEventRevenue = eventPlans.reduce((sum, e) => sum + Number(e.projected_revenue || 0), 0)

  const incidentTypes = incidents.reduce((acc, i) => {
    const k = i.issueType || i.category || i.type || 'Service issue'
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
  const topIncidentType = Object.entries(incidentTypes).sort((a, b) => b[1] - a[1])[0]

  const urgentItems = recentReports
    .map(r => r.urgent_items).filter(Boolean).slice(0, 5)
    .join('; ')

  const dataPrompt = [
    `Week ending: ${new Date().toISOString().slice(0, 10)}`,
    `Shift reports submitted (last 7 days): ${recentReports.length}`,
    `Total service incidents: ${incidents.length}. Unresolved: ${unresolved.length}.`,
    topIncidentType ? `Top recurring issue: ${topIncidentType[0]} (${topIncidentType[1]}x).` : '',
    `Open manager actions: ${openActions.length}.`,
    `Event pipeline revenue: NIS ${Math.round(totalEventRevenue).toLocaleString()}.`,
    urgentItems ? `Urgent items from shift reports: ${urgentItems}` : ''
  ].filter(Boolean).join('\n')

  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-HOSPIA-Role': role },
    body: JSON.stringify({ complaintSummary: dataPrompt })
  })

  if (!response.ok) {
    throw new Error('Failed to generate AI brief.')
  }

  const data = await response.json()
  return data.answer || ''
}
