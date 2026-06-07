/**
 * Pure seating intelligence computation.
 * Derives seating readiness from a guests array and a tables array.
 * No side effects. No API calls. No demo data. Returns null when inputs are absent.
 *
 * Seating link: guest.table_id (number|null) matches table.id (number).
 */

/**
 * @param {Array} guests - array of guest objects with { id, name, table_id, rsvp_status, ... }
 * @param {Array} tables - array of architect table objects with { id, capacity, zone, shape, label, ... }
 * @returns {object|null}
 */
export function computeSeatingIntelligence(guests, tables) {
  if (!Array.isArray(guests) || !Array.isArray(tables)) return null

  const seatedGuests    = guests.filter(g => g.table_id != null)
  const unassignedGuests = guests.filter(g => g.table_id == null)
  const totalGuests     = guests.length
  const seatingCompletion = totalGuests > 0
    ? Math.round((seatedGuests.length / totalGuests) * 100)
    : 0

  // Count assignments per tableId (string key for safety)
  const assignmentCount = {}
  for (const g of seatedGuests) {
    const tid = String(g.table_id)
    assignmentCount[tid] = (assignmentCount[tid] ?? 0) + 1
  }

  // Capacity warnings — tables where assigned count exceeds capacity
  const capacityWarnings = tables
    .filter(t => {
      const assigned = assignmentCount[String(t.id)] ?? 0
      return assigned > (t.capacity ?? 0)
    })
    .map(t => ({
      tableId:    t.id,
      tableLabel: t.label || `Table ${t.id}`,
      assigned:   assignmentCount[String(t.id)] ?? 0,
      capacity:   t.capacity ?? 0,
    }))

  // VIP warnings — VIP tables with zero assignments
  const vipTables = tables.filter(t => t.zone === 'vip' || t.shape === 'vip')
  const vipWarnings = vipTables
    .filter(t => (assignmentCount[String(t.id)] ?? 0) === 0)
    .map(t => ({
      tableId:    t.id,
      tableLabel: t.label || `Table ${t.id}`,
    }))

  // Overall readiness impact
  let readinessImpact = 'none'
  if (totalGuests > 0 && seatingCompletion < 50)   readinessImpact = 'critical'
  else if (totalGuests > 0 && seatingCompletion < 80) readinessImpact = 'warning'
  else if (capacityWarnings.length > 0)             readinessImpact = 'warning'
  else if (vipWarnings.length > 0)                  readinessImpact = 'caution'

  return {
    totalGuests,
    seatedCount:      seatedGuests.length,
    unassignedCount:  unassignedGuests.length,
    seatingCompletion,
    capacityWarnings,
    vipWarnings,
    readinessImpact,
    assignmentCount,   // { tableId(string): count } — for floor plan overlay
    seatedGuests,      // full guest objects for panel rendering
    unassignedGuests,  // full guest objects for panel rendering
  }
}

/**
 * Return all guests assigned to a specific tableId.
 * Safe when guests is null/undefined.
 */
export function getGuestsAtTable(guests, tableId) {
  if (!Array.isArray(guests) || tableId == null) return []
  return guests.filter(g => String(g.table_id) === String(tableId))
}
