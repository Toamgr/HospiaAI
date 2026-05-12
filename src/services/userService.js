import { USERS } from '../config/roleConfig.js'
import { STORAGE, API_BASE } from '../config/systemConfig.js'
import { readStoredArray, writeStoredValue } from '../lib/storage.js'

function syncUserToBackend(user) {
  try {
    fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-HOSPIA-Role': 'admin' },
      body: JSON.stringify(user)
    }).catch(() => {})
  } catch {
    // fire-and-forget — localStorage is source of truth
  }
}

export async function syncUsersFromBackend(role = 'admin') {
  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      headers: { 'X-HOSPIA-Role': role }
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.users) ? data.users : []
  } catch {
    return []
  }
}

export const USER_ROLES = ['employee', 'manager', 'bar_manager', 'owner', 'admin']

export function normalizeUser(user = {}) {
  return {
    id: user.id || `user-${String(user.username || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') || Date.now()}`,
    username: String(user.username || '').trim(),
    password: user.password || '',
    role: user.role || 'employee',
    venue: user.venue || user.team || 'Main Venue',
    team: user.team || user.venue || 'Main Venue',
    canManageCocktails: Boolean(user.canManageCocktails || user.role === 'admin' || user.role === 'bar_manager'),
    disabled: Boolean(user.disabled),
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString()
  }
}

export function getSeedUsers() {
  return USERS.map(normalizeUser)
}

export function loadUsers() {
  const saved = readStoredArray(STORAGE.users, [])
  if (!saved.length) {
    const seeded = getSeedUsers()
    writeStoredValue(STORAGE.users, seeded)
    return seeded
  }

  const seedUsers = getSeedUsers()
  const normalized = saved.map(normalizeUser).map(user => {
    const seed = seedUsers.find(item => item.username.toLowerCase() === user.username.toLowerCase())
    if (!seed) return user
    return {
      ...user,
      role: user.username.toLowerCase() === 'omer sadot' && user.role === 'manager' ? seed.role : user.role,
      canManageCocktails: Boolean(user.canManageCocktails || seed.canManageCocktails || user.role === 'admin' || user.role === 'bar_manager')
    }
  })
  const missingSeeds = seedUsers.filter(seed => !normalized.some(user => user.username.toLowerCase() === seed.username.toLowerCase()))
  return [...normalized, ...missingSeeds]
}

export function persistUsers(users) {
  return writeStoredValue(STORAGE.users, users.map(normalizeUser))
}

export function validateUserPayload(payload = {}, existingUsers = [], originalUsername = '') {
  const username = String(payload.username || '').trim()
  const password = String(payload.password || '').trim()
  const role = String(payload.role || '').trim()

  if (!username) return 'Username is required.'
  if (!password) return 'Password is required.'
  if (!USER_ROLES.includes(role)) return 'Choose a valid role.'
  if (existingUsers.some(user => user.username.toLowerCase() === username.toLowerCase() && user.username.toLowerCase() !== String(originalUsername || '').toLowerCase())) {
    return 'A user with this username already exists.'
  }
  return ''
}

export function createUser(users, payload) {
  const error = validateUserPayload(payload, users)
  if (error) throw new Error(error)
  const nextUser = normalizeUser({ ...payload, id: `user-${Date.now()}` })
  const nextUsers = [nextUser, ...users]
  persistUsers(nextUsers)
  syncUserToBackend(nextUser)
  return { user: nextUser, users: nextUsers }
}

export function updateUser(users, username, updates = {}) {
  const target = users.find(user => user.username === username)
  if (!target) throw new Error('User not found.')
  const error = validateUserPayload({ ...target, ...updates }, users, username)
  if (error) throw new Error(error)
  const updated = normalizeUser({ ...target, ...updates, updated_at: new Date().toISOString() })
  const nextUsers = users.map(user => user.username === username ? updated : user)
  persistUsers(nextUsers)
  syncUserToBackend(updated)
  return { user: updated, users: nextUsers }
}

export function disableUser(users, username) {
  return updateUser(users, username, { disabled: true })
}

export function authenticateUser(users, username, password) {
  const match = users.find(user => user.username.toLowerCase() === String(username || '').trim().toLowerCase() && user.password === password)
  if (!match) throw new Error('Invalid username or password.')
  if (match.disabled) throw new Error('This user has been disabled. Ask an owner or admin for access.')
  return {
    username: match.username,
    role: match.role,
    venue: match.venue,
    team: match.team,
    canManageCocktails: Boolean(match.canManageCocktails || match.role === 'admin' || match.role === 'bar_manager')
  }
}
