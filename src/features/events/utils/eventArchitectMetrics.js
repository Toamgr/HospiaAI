/**
 * Deterministic Event Architect metrics.
 * All computations derive from the passed tables/eventBrief data only.
 * Returns null for individual fields when required inputs are absent.
 */

export function computeGuestCapacity(tables, eventBrief) {
  if (!Array.isArray(tables)) {
    return { totalCapacity: null, seated: null, invited: null, unresolved: null }
  }
  const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity ?? 0), 0)
  const seated = tables.reduce((sum, t) => sum + (t.guests ?? 0), 0)
  const invited = eventBrief?.totalGuests ?? null
  const unresolved = invited !== null ? Math.max(0, invited - seated) : null
  return { totalCapacity, seated, invited, unresolved }
}

export function computeAccessibilityScore(tables, eventBrief) {
  if (!Array.isArray(tables) || !eventBrief) return null
  const accessibleTables = tables.filter(t => t.accessiblePriority).length
  const wheelchairSpaces = tables.reduce((sum, t) => sum + (t.wheelchair ?? 0), 0)
  const required = eventBrief?.accessibility?.wheelchairs ?? 0
  const stepFree = eventBrief?.accessibility?.stepFree ?? false
  const quietZone = eventBrief?.accessibility?.quietFamilyZone ?? false

  let score = 0
  if (accessibleTables >= 2) score += 40
  else if (accessibleTables === 1) score += 20
  if (required > 0 && wheelchairSpaces >= required) score += 30
  else if (wheelchairSpaces > 0) score += 15
  if (stepFree) score += 20
  if (quietZone) score += 10
  return Math.min(100, score)
}

export function computeGuestFlowScore(tables, eventBrief) {
  if (!Array.isArray(tables)) return null
  const zones = new Set(tables.map(t => t.zone)).size
  const waiters = new Set(tables.map(t => t.waiter).filter(Boolean)).size
  const seated = tables.reduce((sum, t) => sum + (t.guests ?? 0), 0)
  const invited = eventBrief?.totalGuests ?? seated

  let score = 0
  if (zones >= 3) score += 35
  else if (zones === 2) score += 20
  if (waiters >= 4) score += 30
  else if (waiters >= 2) score += 15
  const ratio = invited > 0 ? seated / invited : 1
  if (ratio >= 0.95) score += 35
  else if (ratio >= 0.80) score += 20
  else if (ratio >= 0.60) score += 10
  return Math.min(100, score)
}

export function computeBarCoverage(tables, eventBrief) {
  if (!Array.isArray(tables)) return null
  const zoneSet = new Set(tables.map(t => t.zone))
  const hallCovered = zoneSet.has('hall') ? 1 : 0
  const gardenCovered = zoneSet.has('garden') ? 1 : 0
  const poolCovered = zoneSet.has('pool') ? 1 : 0
  const coveredZones = hallCovered + gardenCovered + poolCovered

  let score = Math.round((coveredZones / 3) * 70)
  if (eventBrief?.barType === 'Open Bar') score += 20
  if ((eventBrief?.specialRequests ?? '').toLowerCase().includes('bar')) score += 10
  return Math.min(100, score)
}

export function computeStaffLoad(staffCounts) {
  if (!staffCounts || typeof staffCounts.total !== 'number') return null
  if (staffCounts.total <= 8) return 'Light'
  if (staffCounts.total <= 18) return 'Normal'
  return 'Heavy'
}

export function computeBottleneckRisk(tables, eventBrief) {
  if (!Array.isArray(tables) || !eventBrief) return null
  const total = tables.length
  const hallTables = tables.filter(t => t.zone === 'hall').length
  const guests = eventBrief.totalGuests ?? 0

  let risk = 0
  if (total > 0 && hallTables / total > 0.5) risk += 25
  if (guests > 150) risk += 20
  if (guests > 200) risk += 15
  const acc = eventBrief.accessibility ?? {}
  if ((acc.wheelchairs ?? 0) > 0 && !acc.stepFree) risk += 30
  if ((eventBrief.specialRequests ?? '').toLowerCase().includes('late-night')) risk += 10
  return Math.min(100, risk)
}

export function computeSetupComplexity(tables, eventBrief) {
  if (!Array.isArray(tables) || !eventBrief) return null
  const zones = new Set(tables.map(t => t.zone)).size
  const dietary = Array.isArray(eventBrief.dietary) ? eventBrief.dietary.length : 0
  const is24hr = (eventBrief.format ?? '').includes('24-hour')

  let complexity = 30
  complexity += zones * 10
  complexity += dietary * 8
  if (is24hr) complexity += 15
  if (eventBrief.barType === 'Open Bar') complexity += 10
  if ((eventBrief.accessibility?.wheelchairs ?? 0) > 0) complexity += 5
  return Math.min(100, complexity)
}
