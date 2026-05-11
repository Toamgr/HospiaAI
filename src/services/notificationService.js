import { STORAGE } from '../config/systemConfig'
import { readStoredArray, writeStoredValue } from '../lib/storage'

export function loadNotifications() {
  return readStoredArray(STORAGE.notifications, [])
}

export function createNotification(notification) {
  const notifications = loadNotifications()
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
  const nextNotifications = [next, ...notifications].slice(0, 120)
  writeStoredValue(STORAGE.notifications, nextNotifications)
  return { notification: next, notifications: nextNotifications }
}
