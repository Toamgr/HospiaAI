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

// ── Cocktail menu approval notifications ──────────────────────────────────────
// Two separate notifications: F&B Director gets operational detail,
// Owner gets business-level summary only — no recipes, costs, or guest PII.

export function notifyCocktailMenuApproved({ event, brief, approvedBy }) {
  const eventName   = event?.name || 'Event'
  const eventDate   = brief?.masterBrief?.eventDate || event?.event_date || 'Date TBD'
  const guestCount  = event?.expected_guests || 'TBD'
  const eventType   = brief?.eventTypeLabel || event?.event_type || 'Event'
  const clientName  = event?.client_name || null
  const approver    = approvedBy || 'Events Manager'

  // Revenue: use real field only — never invent a number
  const revenue = event?.revenue ?? event?.expected_revenue ?? null
  const revenueStr = revenue != null ? `Revenue: ₪${revenue}` : 'Revenue: not set'

  // Brief summary for F&B Director — first 220 chars of outputRequestText
  const briefText = brief?.cocktailMenuBrief?.outputRequestText || ''
  const briefSummary = briefText.length > 220 ? briefText.slice(0, 220) + '…' : briefText

  // F&B Director: full operational picture
  createNotification({
    roles: ['fb_director', 'admin'],
    title: `Cocktail menu approved — ${eventName}`,
    body:  [
      `${eventName} · ${eventType} · ${guestCount} guests · ${eventDate}.`,
      `Approved by: ${approver}.`,
      briefSummary ? `Brief: ${briefSummary}` : null,
      'Open the Events tab to view the approved menu.',
    ].filter(Boolean).join(' '),
    type: 'event',
    page: 'eventCRM',
  })

  // Owner: business summary only — no bar ops, no cost, no guest PII
  createNotification({
    roles: ['owner', 'admin'],
    title: `Event update — ${eventName}`,
    body:  [
      `${eventName}${clientName ? ` (${clientName})` : ''} · ${eventDate}.`,
      'Cocktail menu has been approved and is ready for service.',
      revenueStr + '.',
    ].join(' '),
    type: 'event',
    page: 'eventCRM',
  })
}
