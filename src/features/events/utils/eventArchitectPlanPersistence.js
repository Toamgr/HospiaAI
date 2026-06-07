/**
 * Per-event persistence for Event Architect floor plans.
 *
 * Key format:  hestia.eventArchitect.plan:<eventId>
 * Fallback key (no eventId):  hestia.eventArchitect.plan
 *
 * Each event gets its own isolated entry — Event A and Event B can never
 * share a floor plan through this module.
 *
 * Schema stored per key:
 *   { tables, selectedId, isDefault, lastUpdated, version }
 *
 * Rules:
 * - loadPlan returns null on missing entry OR corrupted data (defensive).
 * - savePlan silently ignores storage errors (full / unavailable).
 * - isDefault=true when the layout is the venue default (auto-arrange / first save).
 * - isDefault=false when the user has made a meaningful layout choice.
 */

const KEY_BASE = 'hestia.eventArchitect.plan'
const SCHEMA_VERSION = 1

function getKey(eventId) {
  return eventId ? `${KEY_BASE}:${eventId}` : KEY_BASE
}

/**
 * Load the saved plan for an event.
 * Returns null if no plan exists or if the stored data is corrupted.
 */
export function loadPlan(eventId) {
  try {
    const raw = localStorage.getItem(getKey(eventId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (!Array.isArray(parsed.tables) || parsed.tables.length === 0) return null
    if (typeof parsed.tables[0]?.id !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

/**
 * Save the current plan for an event.
 *
 * @param {string|null} eventId
 * @param {{ tables: Array, selectedId?: number|null, isDefault?: boolean }} plan
 */
export function savePlan(eventId, { tables, selectedId = null, isDefault = false }) {
  try {
    localStorage.setItem(
      getKey(eventId),
      JSON.stringify({
        tables,
        selectedId,
        isDefault,
        lastUpdated: new Date().toISOString(),
        version: SCHEMA_VERSION,
      })
    )
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/**
 * Clear the saved plan for an event (revert to first-time default state).
 */
export function clearPlan(eventId) {
  try {
    localStorage.removeItem(getKey(eventId))
  } catch {}
}

/**
 * Returns true if a saved plan exists for this eventId.
 * Does not validate the plan contents — use loadPlan for that.
 */
export function planExists(eventId) {
  try {
    return localStorage.getItem(getKey(eventId)) !== null
  } catch {
    return false
  }
}
