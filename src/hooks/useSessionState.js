import { useState, useEffect, useCallback } from 'react'
import { clearSession } from '../services/authService'
import { clearAuthToken } from '../services/api/client'
import { loadUsers } from '../services/userService'
import { STORAGE } from '../config/systemConfig'

export function useSessionState() {
  const [lang, setLang] = useState('en')
  // Token lives in memory only — no restoration from localStorage on page load
  const [currentUser, setCurrentUser] = useState(null)
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
    clearAuthToken()
    clearSession()
    setCurrentUser(null)
  }, [])

  return { lang, setLang, currentUser, setCurrentUser, role, users, setUsers, logout }
}
