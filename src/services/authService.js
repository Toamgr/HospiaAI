import { STORAGE } from '../config/systemConfig.js'
import { authenticateUser } from './userService.js'

export function buildSessionUser(users, username, password) {
  return authenticateUser(users, username, password)
}

export function persistSession(user) {
  localStorage.setItem(STORAGE.currentUser, JSON.stringify(user))
  return user
}

export function clearSession() {
  localStorage.removeItem(STORAGE.currentUser)
  localStorage.removeItem(STORAGE.role)
  localStorage.removeItem(STORAGE.area)
  localStorage.removeItem(STORAGE.page)
}
