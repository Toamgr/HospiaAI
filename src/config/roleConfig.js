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

export const MODULE_ACCESS_RULES = {
  employee: ['employeeWorkflow', 'academy', 'employeeShifts', 'cocktailsMagazineArea'],
  manager: ['dailyOps', 'cocktailIntelligence', 'cocktailsMagazineArea'],
  bar_manager: ['barManagement', 'cocktailIntelligence', 'shiftOrganizer', 'staffArea', 'cocktailsMagazineArea'],
  fb_director: ['barManagement', 'cocktailIntelligence', 'staffArea', 'cocktailsMagazineArea'],
  events_manager: ['eventsCalendarArea', 'eventsArea'],
  chef: ['chefArea', 'cocktailsMagazineArea'],
  owner: ['command', 'planning', 'ownerIntelligence', 'system', 'cocktailIntelligence', 'staffArea', 'chefApproval', 'cocktailsMagazineArea'],
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

export function canAccessPage(userOrRole, page) {
  const meta = PAGE_META[page]
  const role = getRole(userOrRole)
  if (!meta || !role) return false
  if (meta.requiresCocktailManager) return userCanManageCocktails(userOrRole)
  if (meta.requiresBottlePricesAccess) return canAccessBottlePrices(userOrRole)
  if (role === 'admin') return true
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

export function firstAllowedPage(userOrRole, area = firstAllowedArea(userOrRole)) {
  return allowedPagesForArea(userOrRole, area)[0] || 'courses'
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
