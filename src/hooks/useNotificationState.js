import { useState, useEffect, useMemo, useCallback } from 'react'
import { STORAGE } from '../config/systemConfig'
import { INITIAL_NOTIFICATIONS } from '../data/operations'

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

  useEffect(() => {
    localStorage.setItem(STORAGE.notifications, JSON.stringify(notifications))
  }, [notifications])

  const visibleNotifications = useMemo(() => (
    notifications.filter(item => role === 'admin' || item.roles?.includes(role))
  ), [notifications, role])

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
    setNotifications(prev => [next, ...prev].slice(0, 120))
    return next
  }, [])

  const markNotificationsRead = useCallback(() => {
    if (!currentUser) return
    setNotifications(prev => prev.map(item => (
      item.roles?.includes(role) || role === 'admin'
        ? { ...item, readBy: Array.from(new Set([...(item.readBy || []), currentUser.username])) }
        : item
    )))
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
