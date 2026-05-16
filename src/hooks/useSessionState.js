import { useState, useEffect, useCallback } from 'react'
import { clearSession } from '../services/authService'
import { loadUsers } from '../services/userService'
import { STORAGE } from '../config/systemConfig'

export function getInitialUser() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE.currentUser) || 'null')
    const validRoles = ['employee', 'manager', 'bar_manager', 'owner', 'admin']
    const savedUsers = loadUsers()
    const canonical = savedUsers.find(user => user.username.toLowerCase() === saved?.username?.toLowerCase())
    if (canonical && validRoles.includes(canonical.role) && !canonical.disabled) {
      return {
        id: canonical.id,
        username: canonical.username,
        role: canonical.role,
        venue: canonical.venue,
        team: canonical.team,
        canManageCocktails: Boolean(canonical.canManageCocktails || canonical.role === 'admin' || canonical.role === 'bar_manager')
      }
    }
    if (saved?.username && validRoles.includes(saved.role)) {
      return {
        id: saved.id || null,
        username: saved.username,
        role: saved.role,
        venue: saved.venue || 'Main Venue',
        team: saved.team || saved.venue || 'Main Venue',
        canManageCocktails: Boolean(saved.role === 'admin' || saved.role === 'bar_manager' || saved.canManageCocktails)
      }
    }
  } catch {
    return null
  }
  return null
}

export function useSessionState() {
  const [lang, setLang] = useState('en')
  const [currentUser, setCurrentUser] = useState(getInitialUser)
  const role = currentUser?.role || ''
  const [users, setUsers] = useState(loadUsers)

  useEffect(() => {
    localStorage.setItem(STORAGE.lang, 'en')
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE.users, JSON.stringify(users))
  }, [users])

  const logout = useCallback(() => {
    clearSession()
    setCurrentUser(null)
  }, [])

  return { lang, setLang, currentUser, setCurrentUser, role, users, setUsers, logout }
}
