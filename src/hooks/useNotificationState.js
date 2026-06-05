import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { STORAGE } from '../config/systemConfig'
import { INITIAL_NOTIFICATIONS } from '../data/operations'
import { apiGet, apiPost, apiPatch } from '../services/api/client'

// Map a backend notifications row (single-role, read INTEGER) to the frontend
// notification shape (multi-role, readBy string[]). Preserves existing UX.
function mapBackendRow(row) {
  return {
    id: row.id,
    roles: row.roles_json ? JSON.parse(row.roles_json) : [row.target_role],
    title: row.title,
    body: row.body,
    type: row.type || 'info',
    page: row.page || null,
    readBy: row.read ? ['__backend_read__'] : [],
    created_at: row.created_at
  }
}

export function useNotificationState({ role, currentUser }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.notifications) || 'null')
      return Array.isArray(saved) ? saved : INITIAL_NOTIFICATIONS
    } catch {
      return INITIAL_NOTIFICATIONS
    }
  })
  const [showNotifications, setShowNotifications] = useState(false)

  // localStorage write-through — preserved as offline fallback during Phase 5 migration
  useEffect(() => {
    localStorage.setItem(STORAGE.notifications, JSON.stringify(notifications))
  }, [notifications])

  // On mount: fetch from backend and merge with localStorage.
  // Backend wins for matching IDs; local-only notifications are preserved.
  // If backend is unavailable, localStorage data is silently kept.
  useEffect(() => {
    if (!currentUser?.id) return
    let mounted = true
    apiGet('/api/notifications')
      .then(data => {
        if (!mounted) return
        const rows = data?.notifications
        if (!Array.isArray(rows) || !rows.length) return
        const backendMapped = rows.map(mapBackendRow)
        setNotifications(prev => {
          const backendIds = new Set(backendMapped.map(n => n.id))
          const localOnly = prev.filter(n => !backendIds.has(n.id))
          return [...backendMapped, ...localOnly].slice(0, 120)
        })
      })
      .catch(() => {
        // Backend unavailable — localStorage data already loaded, no action needed
      })
    return () => { mounted = false }
  }, [currentUser?.id])

  const visibleNotifications = useMemo(() => (
    notifications.filter(item => role === 'admin' || item.roles?.includes(role))
  ), [notifications, role])

  // Keep a stable ref of visibleNotifications for use in markNotificationsRead
  // without adding it as a useCallback dependency (avoids recreation on every notification change)
  const visibleRef = useRef(visibleNotifications)
  useEffect(() => { visibleRef.current = visibleNotifications }, [visibleNotifications])

  const unreadCount = visibleNotifications.filter(
    item => !item.readBy?.includes(currentUser?.username)
  ).length

  const pushNotification = useCallback(notification => {
    const next = {
      id: notification.id || `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      roles: notification.roles || ['admin'],
      title: notification.title,
      body: notification.body,
      type: notification.type || 'system',
      page: notification.page,
      readBy: [],
      created_at: new Date().toISOString()
    }
    // Update local state immediately — backend write is fire-and-forget
    setNotifications(prev => [next, ...prev].slice(0, 120))
    // Persist to backend so other devices/sessions can read this notification
    apiPost('/api/notifications', next).catch(() => {})
    return next
  }, [])

  const markNotificationsRead = useCallback(() => {
    if (!currentUser) return
    setNotifications(prev => prev.map(item => (
      item.roles?.includes(role) || role === 'admin'
        ? { ...item, readBy: Array.from(new Set([...(item.readBy || []), currentUser.username])) }
        : item
    )))
    // Fire-and-forget backend mark-read for all currently visible notifications
    visibleRef.current.forEach(item => {
      apiPatch(`/api/notifications/${item.id}/read`, {}).catch(() => {})
    })
  }, [currentUser, role])

  return {
    notifications,
    showNotifications,
    setShowNotifications,
    visibleNotifications,
    unreadCount,
    pushNotification,
    markNotificationsRead
  }
}
