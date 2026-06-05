import { STORAGE } from '../config/systemConfig.js'
import { authenticateUser } from './userService.js'

export function buildSessionUser(users, username, password) {
  return authenticateUser(users, username, password)
}

export function persistSession(user) {
  localStorage.setItem(STORAGE.currentUser, JSON.stringify(user))
  return user
}

// MVP: token stored in localStorage. Replace with httpOnly-cookie once the
// auth-hardening phase is implemented (see REFACTORING_MASTER_PLAN.md Phase 6).
export function saveToken(token) {
  localStorage.setItem(STORAGE.token, token)
}

export function loadToken() {
  return localStorage.getItem(STORAGE.token) || null
}

export function removeToken() {
  localStorage.removeItem(STORAGE.token)
}

export function clearSession() {
  // Clears auth/session identity only.
  // hospia.area and hospia.page are intentionally preserved — navigation memory
  // survives logout so the user lands on their last page after next login.
  // No business data keys are touched.
  removeToken()
  localStorage.removeItem(STORAGE.currentUser)
  localStorage.removeItem(STORAGE.role)
}
