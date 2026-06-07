/**
 * EventCalendar — Internal HESTIA event calendar.
 * Month view. Event chips colored by type. Role-differentiated detail panel.
 *
 * Full access (events_manager, admin): operational brief, cocktail menu status,
 *   service context, links to EventDetail and EventArchitect.
 * Business view (owner, manager): event identity, date, guest count, status only.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { fetchCocktailMenu } from '../../services/api/eventsApi'
import { buildZoharBrief } from './utils/zoharBriefOrchestrator'

// ── Constants ─────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const EVENT_TYPE_LABELS = {
  wedding: 'Wedding', corporate: 'Corporate', private: 'Private',
  bar_event: 'Bar Event', other: 'Event',
}

const STATUS_LABEL = {
  draft:          'Draft',
  confirmed:      'Confirmed',
  in_preparation: 'In Preparation',
  ready:          'Ready',
  live:           'Live',
  completed:      'Completed',
  cancelled:      'Cancelled',
}

const STATUS_COLOR = {
  confirmed:      '#6BAF80',
  ready:          '#6BAF80',
  live:           '#4ade80',
  in_preparation: '#C9A96E',
  draft:          '#5A5550',
  completed:      '#3A3A3A',
  cancelled:      '#C44A4A',
}

// Event chip colors by type
const TYPE_CHIP = {
  wedding:   { bg: 'rgba(244,114,182,0.13)', border: 'rgba(244,114,182,0.32)', text: '#f472b6' },
  corporate: { bg: 'rgba(96,165,250,0.13)',  border: 'rgba(96,165,250,0.32)',  text: '#60a5fa' },
  private:   { bg: 'rgba(74,222,128,0.13)',  border: 'rgba(74,222,128,0.32)',  text: '#4ade80' },
  bar_event: { bg: 'rgba(201,169,110,0.13)', border: 'rgba(201,169,110,0.32)', text: '#C9A96E' },
  other:     { bg: 'rgba(113,113,122,0.13)', border: 'rgba(113,113,122,0.32)', text: '#71717a' },
}

const FULL_ACCESS_ROLES = ['events_manager', 'admin']

// ── Calendar math helpers ─────────────────────────────────────────────────────

function getCalendarGrid(year, month) {
  const firstDow    = new Date(year, month, 1).getDay()       // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells       = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function isoKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// ── Shared UI primitives ──────────────────────────────────────────────────────

function NavBtn({ children, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:   hov ? 'rgba(201,169,110,0.09)' : 'transparent',
        border:       '1px solid rgba(201,169,110,0.18)',
        borderRadius: 5,
        color:        '#C9A96E',
        cursor:       'pointer',
        fontSize:     16,
        fontWeight:   700,
        lineHeight:   1,
        padding:      '4px 10px',
        transition:   'background 120ms ease',
      }}
    >
      {children}
    </button>
  )
}

function GhostLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background:      'rgba(201,169,110,0.07)',
        border:          '1px solid rgba(201,169,110,0.22)',
        borderRadius:    5,
        color:           '#C9A96E',
        cursor:          'pointer',
        fontSize:        9,
        fontWeight:      700,
        letterSpacing:   '0.10em',
        padding:         '5px 11px',
        textTransform:   'uppercase',
        transition:      'all 150ms ease',
      }}
    >
      {children}
    </button>
  )
}

function PanelRow({ label, value, valueColor }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0', borderBottom: '1px solid #141414', gap: 12 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#5A5550', flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 10.5, color: valueColor || '#9A9590', textAlign: 'right', lineHeight: 1.5 }}>
        {value}
      </span>
    </div>
  )
}

// ── EventPanel — role-differentiated ─────────────────────────────────────────

function EventPanel({ event, menuStatus, isFullAccess, canNavigateToDetail, onClose, onOpenDetail, onOpenArchitect }) {
  const typeChip    = TYPE_CHIP[event.event_type] || TYPE_CHIP.other
  const typeLabel   = EVENT_TYPE_LABELS[event.event_type] || 'Event'
  const statusLabel = STATUS_LABEL[event.status] || event.status
  const statusColor = STATUS_COLOR[event.status] || '#5A5550'

  // Brief computed from event-level data only (no guest/table detail available here)
  const brief = useMemo(
    () => isFullAccess
      ? buildZoharBrief({ event, guests: [], tables: [], tasks: [], timeline: [] })
      : null,
    [event, isFullAccess]
  )

  // Format date / time
  const displayDate = event.event_date
    ? new Date(event.event_date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  const displayTime = event.start_time
    ? event.end_time
      ? `${event.start_time} – ${event.end_time}`
      : `From ${event.start_time}`
    : null

  const menuStatusLabel =
    menuStatus === 'approved' ? '✓ Approved'
    : menuStatus === 'draft'  ? 'Draft'
    : menuStatus === null     ? 'Not started'
    : '—'
  const menuStatusColor =
    menuStatus === 'approved' ? '#6BAF80'
    : menuStatus === 'draft'  ? '#C9A96E'
    : '#5A5550'

  return (
    <div
      style={{
        background:   '#111111',
        border:       '1px solid #1E1E1E',
        borderRadius: 8,
        marginTop:    14,
        overflow:     'hidden',
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding:        '10px 14px',
          borderBottom:   '1px solid #1A1A1A',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span
            style={{
              background:   typeChip.bg,
              border:       `1px solid ${typeChip.border}`,
              borderRadius: 3,
              color:        typeChip.text,
              fontSize:     8,
              fontWeight:   700,
              letterSpacing:'0.12em',
              padding:      '2px 7px',
              textTransform:'uppercase',
              whiteSpace:   'nowrap',
              flexShrink:   0,
            }}
          >
            {typeLabel}
          </span>
          <span
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize:   16,
              fontWeight: 700,
              color:      '#F5F0E8',
              overflow:   'hidden',
              textOverflow:'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {event.name}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border:     'none',
            color:      '#3A3A3A',
            cursor:     'pointer',
            fontSize:   14,
            flexShrink: 0,
            padding:    '0 2px',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '10px 14px' }}>
        {/* Common fields for all roles */}
        <PanelRow label="Status"      value={statusLabel}    valueColor={statusColor} />
        <PanelRow label="Date"        value={displayDate}    />
        <PanelRow label="Time"        value={displayTime}    />
        <PanelRow label="Location"    value={event.location} />
        <PanelRow label="Client"      value={event.client_name} />
        <PanelRow label="Guests"      value={event.expected_guests != null ? `${event.expected_guests} expected` : null} />

        {/* Business view (owner / manager): status + revenue only */}
        {!isFullAccess && (
          <>
            <PanelRow
              label="Revenue"
              value={
                event.revenue != null         ? `₪${event.revenue}`
                : event.expected_revenue != null ? `₪${event.expected_revenue}`
                : 'Revenue not set'
              }
              valueColor={
                (event.revenue != null || event.expected_revenue != null) ? '#9A9590' : '#3A3A3A'
              }
            />
          </>
        )}

        {/* Full operational view (events_manager / admin) */}
        {isFullAccess && brief && (
          <>
            <div style={{ margin: '10px 0 4px' }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3A3A3A', marginBottom: 6 }}>
                Operational Brief
              </div>
              <PanelRow label="Service style"  value={brief.masterBrief?.serviceStyle} />
              <PanelRow label="Cocktail menu"  value={menuStatusLabel} valueColor={menuStatusColor} />
              {brief.cocktailMenuBrief?.welcomeDrinkNeed && (
                <PanelRow
                  label="Welcome drink"
                  value={brief.cocktailMenuBrief.welcomeDrinkNeed.split('.')[0]}
                />
              )}
              {brief.daysUntil !== null && (
                <PanelRow
                  label="Days until"
                  value={
                    brief.daysUntil < 0  ? `${Math.abs(brief.daysUntil)}d ago`
                    : brief.daysUntil === 0 ? 'Today'
                    : `${brief.daysUntil} days`
                  }
                  valueColor={
                    brief.daysUntil <= 0  ? '#3A3A3A'
                    : brief.daysUntil <= 7 ? '#D4943A'
                    : '#9A9590'
                  }
                />
              )}
              {brief.masterBrief?.kosherFlag && (
                <PanelRow label="Kosher" value="Required" valueColor="#D4943A" />
              )}
            </div>
          </>
        )}

        {/* Action links — gated by actual page access, not just calendar role */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {canNavigateToDetail && (
            <GhostLink onClick={onOpenDetail}>Open Event Detail →</GhostLink>
          )}
          {isFullAccess && (
            <GhostLink onClick={onOpenArchitect}>Open Event Architect →</GhostLink>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EventCalendar({ currentUser, goToPage, events, isLoading, onSelectEvent }) {
  const today      = new Date()
  const todayKey   = isoKey(today.getFullYear(), today.getMonth(), today.getDate())

  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [panelId, setPanelId]           = useState(null)
  const [menuCache, setMenuCache]       = useState({})  // { [eventId]: status | null }

  const isFullAccess = FULL_ACCESS_ROLES.includes(currentUser?.role)
  // Events_manager, owner, admin have eventsArea access (eventCRM). Manager does not.
  const canNavigateToDetail = ['events_manager', 'owner', 'admin'].includes(currentUser?.role)

  const grid = useMemo(() => getCalendarGrid(year, month), [year, month])

  // Index events by date for fast day-cell lookup
  const eventsByDate = useMemo(() => {
    const map = {}
    for (const ev of (events || [])) {
      if (!ev.event_date) continue
      if (!map[ev.event_date]) map[ev.event_date] = []
      map[ev.event_date].push(ev)
    }
    return map
  }, [events])

  const panelEvent = useMemo(
    () => (events || []).find(e => e.id === panelId) || null,
    [events, panelId]
  )

  // Fetch cocktail menu status once per selected event (cached)
  useEffect(() => {
    if (!panelId || menuCache[panelId] !== undefined) return
    fetchCocktailMenu(panelId)
      .then(data  => setMenuCache(prev => ({ ...prev, [panelId]: data.menu?.status ?? null })))
      .catch(()   => setMenuCache(prev => ({ ...prev, [panelId]: null })))
  }, [panelId])

  // Close panel when navigating months (avoids stale panel context)
  useEffect(() => { setPanelId(null) }, [year, month])

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  function goToToday() {
    setYear(today.getFullYear())
    setMonth(today.getMonth())
  }

  // Navigate to EventCRM and auto-open the detail view
  function openEventDetail(eventId) {
    if (onSelectEvent) onSelectEvent(eventId)
    goToPage('eventCRM')
  }

  function openArchitect(eventId) {
    try { sessionStorage.setItem('hestia.architect.linkId', String(eventId)) } catch {}
    goToPage('eventBrain')
  }

  const eventsThisMonth = (events || []).filter(e => {
    if (!e.event_date) return false
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}-`
    return e.event_date.startsWith(prefix)
  })

  return (
    <div style={{ padding: '20px 24px', maxWidth: 940, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize:   22,
              fontWeight: 700,
              color:      '#F5F0E8',
              lineHeight: 1.1,
            }}
          >
            Event Calendar
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A96E', marginTop: 3, opacity: 0.7 }}>
            {eventsThisMonth.length} event{eventsThisMonth.length !== 1 ? 's' : ''} this month
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NavBtn onClick={goToToday}>Today</NavBtn>
          <NavBtn onClick={prevMonth}>‹</NavBtn>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize:   12,
              fontWeight: 600,
              color:      '#9A9590',
              minWidth:   130,
              textAlign:  'center',
            }}
          >
            {MONTH_NAMES[month]} {year}
          </span>
          <NavBtn onClick={nextMonth}>›</NavBtn>
        </div>
      </div>

      {/* ── Day name headers ── */}
      <div
        style={{
          display:               'grid',
          gridTemplateColumns:   'repeat(7, 1fr)',
          borderBottom:          '1px solid #1E1E1E',
          marginBottom:          0,
        }}
      >
        {DAY_NAMES.map(d => (
          <div
            key={d}
            style={{
              fontSize:      8,
              fontWeight:    700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color:         '#3A3A3A',
              padding:       '6px 8px 5px',
              textAlign:     'center',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#3A3A3A', fontSize: 11 }}>
          Loading events…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {grid.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  style={{
                    minHeight:   72,
                    borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid #141414',
                    borderBottom:'1px solid #141414',
                    background:  '#080808',
                  }}
                />
              )
            }

            const key        = isoKey(year, month, day)
            const dayEvents  = eventsByDate[key] || []
            const isToday    = key === todayKey
            const maxVisible = 2
            const overflow   = dayEvents.length - maxVisible

            return (
              <div
                key={key}
                style={{
                  minHeight:   72,
                  padding:     '5px 5px 4px',
                  borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid #141414',
                  borderBottom:'1px solid #141414',
                  background:  isToday ? 'rgba(201,169,110,0.04)' : 'transparent',
                  position:    'relative',
                }}
              >
                {/* Day number */}
                <div
                  style={{
                    fontSize:    10,
                    fontWeight:  isToday ? 700 : 400,
                    color:       isToday ? '#C9A96E' : '#3A3A3A',
                    marginBottom:3,
                    display:     'inline-flex',
                    alignItems:  'center',
                    justifyContent:'center',
                    width:       isToday ? 20 : 'auto',
                    height:      isToday ? 20 : 'auto',
                    borderRadius:isToday ? '50%' : 0,
                    background:  isToday ? 'rgba(201,169,110,0.14)' : 'transparent',
                  }}
                >
                  {day}
                </div>

                {/* Event chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dayEvents.slice(0, maxVisible).map(ev => {
                    const chip = TYPE_CHIP[ev.event_type] || TYPE_CHIP.other
                    const isSelected = ev.id === panelId
                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setPanelId(ev.id === panelId ? null : ev.id)}
                        style={{
                          background:   isSelected ? chip.border : chip.bg,
                          border:       `1px solid ${chip.border}`,
                          borderRadius: 3,
                          color:        chip.text,
                          cursor:       'pointer',
                          fontSize:     8,
                          fontWeight:   600,
                          letterSpacing:'0.02em',
                          overflow:     'hidden',
                          padding:      '1px 4px',
                          textAlign:    'left',
                          textOverflow: 'ellipsis',
                          whiteSpace:   'nowrap',
                          width:        '100%',
                        }}
                        title={ev.name}
                      >
                        {ev.name}
                      </button>
                    )
                  })}
                  {overflow > 0 && (
                    <span style={{ fontSize: 8, color: '#3A3A3A', paddingLeft: 2 }}>
                      +{overflow} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Empty state for current month ── */}
      {!isLoading && eventsThisMonth.length === 0 && (
        <div
          style={{
            textAlign:  'center',
            padding:    '32px 0 16px',
            color:      '#3A3A3A',
            fontSize:   11,
            fontStyle:  'italic',
          }}
        >
          No events scheduled for this period.
        </div>
      )}

      {/* ── Type legend ── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 14 }}>
        {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => {
          const chip = TYPE_CHIP[type]
          return (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: chip.bg, border: `1px solid ${chip.border}` }} />
              <span style={{ fontSize: 8, color: '#3A3A3A', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
            </div>
          )
        })}
      </div>

      {/* ── Event detail panel ── */}
      {panelEvent && (
        <EventPanel
          event={panelEvent}
          menuStatus={menuCache[panelEvent.id]}
          isFullAccess={isFullAccess}
          canNavigateToDetail={canNavigateToDetail}
          onClose={() => setPanelId(null)}
          onOpenDetail={() => openEventDetail(panelEvent.id)}
          onOpenArchitect={() => openArchitect(panelEvent.id)}
        />
      )}

    </div>
  )
}
