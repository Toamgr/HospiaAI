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
