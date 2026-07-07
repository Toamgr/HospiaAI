import { NAV_GROUPS, PAGE_META } from './navigationConfig.js'

export const ROLE_NAMES = {
  employee: 'Employee',
  manager: 'Manager',
  bar_manager: 'Bar Manager',
  fb_director: 'F&B Director',
  events_manager: 'Events Manager',
  chef: 'Chef',
  owner: 'Owner',
  admin: 'Admin'
}

// NOTE: This map is descriptive only — it is NOT the runtime access gate. Effective
// navigation access is derived from NAV_GROUPS[area].roles + PAGE_META[page].roles
// (see allowedPagesForArea / canAccessPage below). It is kept in sync with NAV_GROUPS
// for documentation. Phase 1 (nav re-skin) slimmed the owner to the roadmap surfaces:
// HESTIA AI + Owner Reports (command) and Venue DNA (venueIntelligence).
export const MODULE_ACCESS_RULES = {
  employee: ['employeeWorkflow', 'academy', 'employeeShifts', 'cocktailsMagazineArea'],
  manager: ['operations', 'dailyOps', 'cocktailIntelligence', 'cocktailsMagazineArea'],
  bar_manager: ['barManagement', 'cocktailIntelligence', 'shiftOrganizer', 'staffArea', 'cocktailsMagazineArea'],
  fb_director: ['barManagement', 'cocktailIntelligence', 'staffArea', 'cocktailsMagazineArea'],
  events_manager: ['eventsCalendarArea', 'eventsArea'],
  chef: ['chefArea', 'cocktailsMagazineArea'],
  owner: ['command', 'venueIntelligence'],
  admin: Object.keys(NAV_GROUPS)
}

export function getRole(userOrRole) {
  return typeof userOrRole === 'string' ? userOrRole : userOrRole?.role || ''
}

export function hasRoleAccess(userOrRole, roles = []) {
  const role = getRole(userOrRole)
  return role === 'admin' || roles.includes(role)
}

export function userCanManageCocktails(userOrRole) {
  const role = getRole(userOrRole)
  if (role === 'admin') return true
  if (typeof userOrRole === 'string') return false
  if (userOrRole?.canManageCocktails) return true
  return role === 'bar_manager'
}

export function canAccessBottlePrices(userOrRole) {
  const role = getRole(userOrRole)
  return ['admin', 'owner', 'bar_manager', 'fb_director'].includes(role)
}

// True when the user can reach any events surface. Used to avoid firing the global
// GET /api/events load for roles that have no events UI (e.g. fb_director, chef,
// employee) — that call would 403 and pollute the console. Derived from the events
// pages' own role gates so it stays in sync with navigation and the backend
// requireAuth('manager','bar_manager','owner','admin','events_manager') allow-list.
const EVENT_PAGES = ['eventCRM', 'eventOrchestrator', 'eventCalendar', 'eventBrain']
export function canAccessEvents(userOrRole) {
  return EVENT_PAGES.some(page => canAccessPage(userOrRole, page))
}

// Pages the platform-admin global bypass must NOT reach, even though admin otherwise passes
// every page gate. Keep this tiny and page-specific — it is a deny list, not a new access
// model. Currently: beverageBriefInbox (product decision — admin must never see or access the
// F&B Beverage Brief Inbox) and beverageBrief (product decision — the Owner Beverage Direction
// Brief is owner-only; admin must not see or access it either, matching the component's own
// owner-only render gate).
const ADMIN_DENIED_PAGES = new Set(['beverageBriefInbox', 'beverageBrief'])

export function canAccessPage(userOrRole, page) {
  const meta = PAGE_META[page]
  const role = getRole(userOrRole)
  if (!meta || !role) return false
  if (meta.requiresCocktailManager) return userCanManageCocktails(userOrRole)
  if (meta.requiresBottlePricesAccess) return canAccessBottlePrices(userOrRole)
  if (role === 'admin') return !ADMIN_DENIED_PAGES.has(page)
  if (!meta.roles.includes(role)) return false
  return true
}

export function allowedPagesForArea(userOrRole, area) {
  const group = NAV_GROUPS[area]
  if (!group || !hasRoleAccess(userOrRole, group.roles)) return []
  return group.pages.filter(page => canAccessPage(userOrRole, page))
}

export function firstAllowedArea(userOrRole) {
  return Object.entries(NAV_GROUPS).find(([area]) => allowedPagesForArea(userOrRole, area).length)?.[0] || 'academy'
}

// Per-role landing preference. Phase 1 (nav re-skin) makes ownerHome (HESTIA AI) the
// owner's landing via nav ordering. Admin is a superuser/operations role, not the
// owner product persona, so it keeps the operational dashboard (operationalPulse) as
// its landing rather than inheriting the owner's chat home as a side effect. The
// preference only applies when the preferred page is actually allowed in the resolved
// area (so it affects the command area only and never overrides explicit navigation).
const ROLE_LANDING_PREFERENCE = {
  admin: 'operationalPulse',
}

export function firstAllowedPage(userOrRole, area = firstAllowedArea(userOrRole)) {
  const pages = allowedPagesForArea(userOrRole, area)
  const preferred = ROLE_LANDING_PREFERENCE[getRole(userOrRole)]
  if (preferred && pages.includes(preferred)) return preferred
  return pages[0] || 'courses'
}

export function isAllowed(userOrRole, area, page) {
  return Boolean(
    getRole(userOrRole) &&
    NAV_GROUPS[area]?.pages.includes(page) &&
    canAccessPage(userOrRole, page)
  )
}

export function isAllowedPage(userOrRole, page) {
  const area = PAGE_META[page]?.area
  return Boolean(area && isAllowed(userOrRole, area, page))
}
