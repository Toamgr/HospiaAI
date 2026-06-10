import React, { useState, useMemo } from 'react'
import EventBriefMenuGenerator from '../components/EventBriefMenuGenerator'
import { buildZoharBrief } from '../utils/zoharBriefOrchestrator'
import { buildDesignContext } from '../utils/eventDesignContext'

const EVENT_TYPE_LABELS = {
  wedding:   'Wedding',
  corporate: 'Corporate Event',
  private:   'Private Party',
  bar_event: 'Bar Event',
  other:     'Event',
}

const PROGRAMME_LABELS = {
  wedding:   'Wedding Cocktail Programme',
  corporate: 'Event Drinks Programme',
  bar_event: 'Bar Programme',
  private:   'Evening Cocktail Menu',
  other:     'Event Cocktail Menu',
}

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    })
  } catch { return null }
}

export default function EventCocktailMenu({
  event,
  guests,
  tables,
  tasks,
  timeline,
  currentUser,
  onUpdateTask,
  refreshDetail,
  onMenuStatusChange,
}) {
  const [menuInfo, setMenuInfo] = useState({ status: null, menuName: null })

  function handleMenuStatusChange(info) {
    setMenuInfo(info)
    onMenuStatusChange?.(info)
  }

  const brief = useMemo(
    () => buildZoharBrief({
      event,
      guests:   guests   ?? [],
      tables:   tables   ?? [],
      tasks:    tasks    ?? [],
      timeline: timeline ?? [],
    }),
    [event, guests, tables, tasks, timeline]
  )

  const designContext = useMemo(
    () => buildDesignContext({ event, brief }),
    [event, brief]
  )

  const typeLabel   = EVENT_TYPE_LABELS[event.event_type] || event.event_type || null
  const dateLabel   = formatDate(event.event_date)
  const guestLabel  = event.expected_guests > 0 ? `${event.expected_guests} guests` : null
  const metaItems   = [typeLabel, dateLabel, guestLabel].filter(Boolean)

  return (
    <div className="space-y-4">

      {/* Event-branded header */}
      <div
        style={{
          padding: '18px 20px',
          background: '#0A0A0A',
          border: '1px solid rgba(201,169,110,0.18)',
          borderRadius: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient gold glow — top-right corner, non-interactive */}
        <div style={{
          position: 'absolute', top: 0, right: 0, pointerEvents: 'none',
          width: 140, height: 140,
          background: 'radial-gradient(circle at top right, rgba(201,169,110,0.06), transparent 70%)',
        }} />

        {/* Section label — event-type specific */}
        <p
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'rgba(201,169,110,0.55)',
            margin: '0 0 10px',
          }}
        >
          {PROGRAMME_LABELS[event.event_type] || PROGRAMME_LABELS.other}
        </p>

        {/* Thin gold rule */}
        <div style={{ height: 1, background: 'rgba(201,169,110,0.10)', marginBottom: 14 }} />

        {/* Event name */}
        <p
          style={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontSize: 22,
            fontWeight: 600,
            color: '#F5F0E8',
            letterSpacing: '0.01em',
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {event.name}
        </p>

        {/* Metadata — type · date · guests, omitting any missing fields */}
        {metaItems.length > 0 && (
          <p
            style={{
              fontSize: 11,
              color: '#5A5550',
              marginTop: 7,
              letterSpacing: '0.04em',
              lineHeight: 1.5,
            }}
          >
            {metaItems.join(' · ')}
          </p>
        )}
      </div>

      {/* Approval milestone banner */}
      {menuInfo.status === 'approved' && (
        <div
          style={{
            padding: '14px 20px',
            background: 'rgba(201,169,110,0.06)',
            border: '1px solid rgba(201,169,110,0.28)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div>
            <p style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'rgba(201,169,110,0.55)',
              margin: '0 0 5px',
            }}>
              Programme Approved
            </p>
            {menuInfo.menuName && (
              <p style={{
                fontFamily: '"Cormorant Garamond", Georgia, serif',
                fontSize: 18, fontWeight: 600, color: '#F5F0E8',
                letterSpacing: '0.01em', margin: 0, lineHeight: 1.2,
              }}>
                {menuInfo.menuName}
              </p>
            )}
          </div>
          <span style={{ fontSize: 20, color: 'rgba(201,169,110,0.6)', lineHeight: 1, flexShrink: 0 }}>✓</span>
        </div>
      )}

      {/* Full-featured menu generator — scoped to this event's id */}
      <EventBriefMenuGenerator
        event={event}
        brief={brief}
        designContext={designContext}
        tasks={tasks}
        currentUser={currentUser}
        onUpdateTask={onUpdateTask}
        onApproved={() => refreshDetail?.()}
        onMenuStatusChange={handleMenuStatusChange}
      />

    </div>
  )
}
