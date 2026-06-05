import { useState, useEffect, useCallback } from 'react'
import { clearSession, loadToken, removeToken } from '../services/authService'
import { clearAuthToken, initAuthToken } from '../services/api/client'
import { getMe } from '../services/api/sessionApi'
import { loadUsers } from '../services/userService'
import { STORAGE } from '../config/systemConfig'
import { useIdleTimeout } from './useIdleTimeout'

const IDLE_WARNING_MS = 25 * 60 * 1000  // 25 minutes — show the warning banner
const IDLE_LOGOUT_MS  = 30 * 60 * 1000  // 30 minutes — force logout

export function useSessionState() {
  const [lang, setLang] = useState('en')
  const [currentUser, setCurrentUser] = useState(null)

  // true while validating a stored token — prevents the login screen from flashing
  const [sessionRestoring, setSessionRestoring] = useState(() => Boolean(loadToken()))

  // true when the user has been inactive for 25 minutes
  const [showIdleWarning, setShowIdleWarning] = useState(false)

  const role = currentUser?.role || ''
  const [users, setUsers] = useState(loadUsers)

  // Silent session restore on mount: load stored token → validate with server → restore user
  useEffect(() => {
    const token = loadToken()
    if (!token) {
      setSessionRestoring(false)
      return
    }
    initAuthToken(token)
    getMe()
      .then(({ user }) => {
        setCurrentUser({
          id: user.id,
          username: user.full_name,
          full_name: user.full_name,
          role: user.role,
          sub_role: user.sub_role || null,
          canManageCocktails: ['admin', 'bar_manager'].includes(user.role)
        })
      })
      .catch(() => {
        // Token expired or revoked — clear it silently and show the login screen
        removeToken()
        clearAuthToken()
      })
      .finally(() => setSessionRestoring(false))
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE.lang, 'en')
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE.users, JSON.stringify(users))
  }, [users])

  const logout = useCallback(() => {
    clearAuthToken()
    clearSession()
    setCurrentUser(null)
    setShowIdleWarning(false)
  }, [])

  // Dismiss the idle warning — the user interaction that triggered this
  // (mousedown/click) also resets the idle timer via the event listener
  const dismissIdleWarning = useCallback(() => {
    setShowIdleWarning(false)
  }, [])

  const handleIdleWarning = useCallback(() => setShowIdleWarning(true), [])

  useIdleTimeout({
    enabled: Boolean(currentUser),
    timeoutMs: IDLE_LOGOUT_MS,
    warningMs: IDLE_WARNING_MS,
    onWarning: handleIdleWarning,
    onTimeout: logout
  })

  return {
    lang, setLang,
    currentUser, setCurrentUser,
    role,
    users, setUsers,
    logout,
    sessionRestoring,
    showIdleWarning,
    dismissIdleWarning
  }
}
