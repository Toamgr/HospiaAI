import { NAV_GROUPS, PAGE_META } from './navigationConfig'

export const ROLE_NAMES = {
  employee: 'Employee',
  manager: 'Manager',
  owner: 'Owner',
  admin: 'Admin'
}

export const MODULE_ACCESS_RULES = {
  employee: ['employeeWorkflow', 'academy'],
  manager: ['operations', 'planning', 'staffProgression', 'academy', 'barManagement'],
  owner: ['command', 'planning', 'ownerIntelligence', 'system'],
  admin: Object.keys(NAV_GROUPS)
}

export const USERS = [
  { username: 'Peleg naim', password: '0000', role: 'employee' },
  { username: 'Saar wax', password: '0000', role: 'employee' },
  { username: 'Omer Sadot', password: '0000', role: 'manager', canManageCocktails: true },
  { username: 'Zohar Zach', password: '0000', role: 'manager' },
  { username: 'Tal millo', password: '0357', role: 'owner' },
  { username: 'Toam Griffel', password: '0000', role: 'admin', canManageCocktails: true }
]

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
  const canonical = USERS.find(user => user.username.toLowerCase() === userOrRole?.username?.toLowerCase())
  return Boolean(canonical?.canManageCocktails)
}

export function canAccessPage(userOrRole, page) {
  const meta = PAGE_META[page]
  const role = getRole(userOrRole)
  if (!meta || !role) return false
  if (meta.requiresCocktailManager) return userCanManageCocktails(userOrRole)
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
