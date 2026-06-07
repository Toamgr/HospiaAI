/**
 * EventCalendar — Zohar's operational command center.
 *
 * Month view with Calendar Intelligence: Today's Priorities agenda,
 * per-event health badges, smart next-action guidance, type + health filters.
 *
 * Role visibility:
 *   events_manager / admin : full intelligence (agenda, health, next action, operational panel)
 *   owner / manager        : business view (health status, basic event fields, revenue)
 */

import React, { useState, useEffect, useMemo } from 'react'
import { fetchCocktailMenu } from '../../services/api/eventsApi'
import { buildZoharBrief } from './utils/zoharBriefOrchestrator'
import { buildCalendarIntelligence } from './utils/calendarIntelligence'
import { buildDailyBriefing } from './utils/dailyBriefingEngine'
import { loadPlan } from './utils/eventArchitectPlanPersistence'
import DailyBriefing from './components/DailyBriefing'

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

const TYPE_CHIP = {
  wedding:   { bg: 'rgba(244,114,182,0.13)', border: 'rgba(244,114,182,0.32)', text: '#f472b6' },
  corporate: { bg: 'rgba(96,165,250,0.13)',  border: 'rgba(96,165,250,0.32)',  text: '#60a5fa' },
  private:   { bg: 'rgba(74,222,128,0.13)',  border: 'rgba(74,222,128,0.32)',  text: '#4ade80' },
  bar_event: { bg: 'rgba(201,169,110,0.13)', border: 'rgba(201,169,110,0.32)', text: '#C9A96E' },
  other:     { bg: 'rgba(113,113,122,0.13)', border: 'rgba(113,113,122,0.32)', text: '#71717a' },
}

const FULL_ACCESS_ROLES    = ['events_manager', 'admin']
const CAN_OPEN_DETAIL_ROLES = ['events_manager', 'owner', 'admin']

// How many days ahead to batch-fetch cocktail status
const COCKTAIL_FETCH_HORIZON_DAYS = 90
// How many days ahead to include in Today's Priorities
const AGENDA_HORIZON_DAYS = 30

// ── Calendar math ─────────────────────────────────────────────────────────────

function getCalendarGrid(year, month) {
  const firstDow    = new Date(year, month, 1).getDay()
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

// ── Shared primitives ─────────────────────────────────────────────────────────

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
        background:    'rgba(201,169,110,0.07)',
        border:        '1px solid rgba(201,169,110,0.22)',
        borderRadius:  5,
        color:         '#C9A96E',
        cursor:        'pointer',
        fontSize:      9,
        fontWeight:    700,
        letterSpacing: '0.10em',
        padding:       '5px 11px',
        textTransform: 'uppercase',
        transition:    'all 150ms ease',
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

// ── AgendaCard — Today's Priorities (full access only) ───────────────────────

function AgendaCard({ event, intel, isSelected, onClick }) {
  const chip      = TYPE_CHIP[event.event_type] || TYPE_CHIP.other
  const typeLabel = EVENT_TYPE_LABELS[event.event_type] || 'Event'
  const health    = intel?.eventHealth
  const summary   = intel?.calendarSummary
  const nextAction= intel?.nextAction

  const daysText  = summary?.daysUntil == null ? null
    : summary.daysUntil <= 0  ? 'Today'
    : summary.daysUntil === 1 ? '1 day'
    : `${summary.daysUntil} days`
  const daysColor = summary?.daysUntil != null && summary.daysUntil <= 7
    ? '#D4943A' : '#5A5550'

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      style={{
        background:   isSelected ? '#1A1A1A' : '#111111',
        border:       `1px solid ${isSelected ? (health?.color || '#2A2A2A') : '#1E1E1E'}`,
        borderLeft:   `3px solid ${health?.color || '#3A3A3A'}`,
        borderRadius: 6,
        cursor:       'pointer',
        padding:      '10px 12px',
        transition:   'all 120ms ease',
        userSelect:   'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#F5F0E8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.name}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2, alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: chip.text, fontWeight: 600, letterSpacing: '0.06em' }}>
              {typeLabel}
            </span>
            {daysText && (
              <span style={{ fontSize: 8, color: daysColor, fontFamily: '"JetBrains Mono", monospace' }}>
                {daysText}
              </span>
            )}
          </div>
        </div>
        {health && (
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: health.color, lineHeight: 1.2 }}>
              {health.status}
            </div>
            <div style={{ fontSize: 9, color: '#5A5550', fontFamily: '"JetBrains Mono", monospace' }}>
              {health.score}%
            </div>
          </div>
        )}
      </div>

      {nextAction && nextAction !== 'No immediate action required' && (
        <div style={{ marginTop: 7, padding: '4px 7px', background: 'rgba(201,169,110,0.06)', borderRadius: 3 }}>
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5A5550' }}>
            Action:{' '}
          </span>
          <span style={{ fontSize: 9, color: '#9A9590', lineHeight: 1.5 }}>
            {nextAction}
          </span>
        </div>
      )}
    </div>
  )
}

// ── FilterBar ────────────────────────────────────────────────────────────────

function FilterPill({ label, active, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background:    active ? (color ? `${color}18` : 'rgba(201,169,110,0.14)') : 'transparent',
        border:        `1px solid ${active ? (color ? `${color}40` : 'rgba(201,169,110,0.4)') : '#1E1E1E'}`,
        borderRadius:  20,
        color:         active ? (color || '#C9A96E') : '#5A5550',
        cursor:        'pointer',
        fontSize:      8,
        fontWeight:    700,
        letterSpacing: '0.10em',
        padding:       '3px 10px',
        textTransform: 'uppercase',
        transition:    'all 120ms ease',
      }}
    >
      {label}
    </button>
  )
}

function FilterBar({ typeFilter, onTypeFilter, healthFilter, onHealthFilter, showHealthFilter }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, alignItems: 'center' }}>
      <FilterPill label="All"        active={typeFilter === 'all'}       onClick={() => onTypeFilter('all')} />
      <FilterPill label="Wedding"    active={typeFilter === 'wedding'}    onClick={() => onTypeFilter('wedding')} />
      <FilterPill label="Corporate"  active={typeFilter === 'corporate'}  onClick={() => onTypeFilter('corporate')} />
      <FilterPill label="Private"    active={typeFilter === 'private'}    onClick={() => onTypeFilter('private')} />
      <FilterPill label="Bar Event"  active={typeFilter === 'bar_event'}  onClick={() => onTypeFilter('bar_event')} />

      {showHealthFilter && (
        <>
          <div style={{ width: 1, height: 14, background: '#1E1E1E', margin: '0 3px' }} />
          <FilterPill label="Ready"          active={healthFilter === 'ready'}          color="#6BAF80" onClick={() => onHealthFilter(healthFilter === 'ready' ? 'all' : 'ready')} />
          <FilterPill label="Needs Attention" active={healthFilter === 'needs_attention'} color="#C9A96E" onClick={() => onHealthFilter(healthFilter === 'needs_attention' ? 'all' : 'needs_attention')} />
          <FilterPill label="Critical"       active={healthFilter === 'critical'}       color="#C44A4A" onClick={() => onHealthFilter(healthFilter === 'critical' ? 'all' : 'critical')} />
        </>
      )}
    </div>
  )
}

// ── EventPanel — role-differentiated detail panel ────────────────────────────

function EventPanel({ event, menuStatus, intel, isFullAccess, canNavigateToDetail, onClose, onOpenDetail, onOpenArchitect }) {
  const typeChip    = TYPE_CHIP[event.event_type] || TYPE_CHIP.other
  const typeLabel   = EVENT_TYPE_LABELS[event.event_type] || 'Event'
  const statusLabel = STATUS_LABEL[event.status] || event.status
  const statusColor = STATUS_COLOR[event.status] || '#5A5550'

  const brief = useMemo(
    () => isFullAccess
      ? buildZoharBrief({ event, guests: [], tables: [], tasks: [], timeline: [] })
      : null,
    [event, isFullAccess]
  )

  const displayDate = event.event_date
    ? new Date(event.event_date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  const displayTime = event.start_time
    ? event.end_time ? `${event.start_time} – ${event.end_time}` : `From ${event.start_time}`
    : null

  const menuStatusLabel = menuStatus === 'approved' ? '✓ Approved'
    : menuStatus === 'draft'  ? 'Draft'
    : menuStatus === null     ? 'Not started'
    : '—'
  const menuStatusColor = menuStatus === 'approved' ? '#6BAF80'
    : menuStatus === 'draft'  ? '#C9A96E'
    : '#5A5550'

  const health    = intel?.eventHealth
  const summary   = intel?.calendarSummary
  const nextAction= intel?.nextAction

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
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid #1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{
            background: typeChip.bg, border: `1px solid ${typeChip.border}`,
            borderRadius: 3, color: typeChip.text, fontSize: 8, fontWeight: 700,
            letterSpacing: '0.12em', padding: '2px 7px', textTransform: 'uppercase',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {typeLabel}
          </span>
          <span style={{
            fontFamily: '"Cormorant Garamond", serif', fontSize: 16, fontWeight: 700,
            color: '#F5F0E8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {event.name}
          </span>
        </div>
        <button type="button" onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#3A3A3A', cursor: 'pointer', fontSize: 14, flexShrink: 0, padding: '0 2px' }}>
          ✕
        </button>
      </div>

      <div style={{ padding: '10px 14px' }}>

        {/* Event Health — visible to all roles */}
        {health && (
          <div
            style={{
              marginBottom:   10,
              padding:        '8px 10px',
              background:     `${health.color}0D`,
              border:         `1px solid ${health.color}30`,
              borderRadius:   6,
            }}
          >
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3A3A3A', marginBottom: 5 }}>
              Event Health
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: health.color }}>
                {health.status}
              </span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 14, fontWeight: 700, color: health.color }}>
                {health.score}%
              </span>
            </div>
            {/* Context note — clarifies this is calendar-level, not full Zohar score */}
            <div style={{ fontSize: 8, color: '#3A3A3A', marginTop: 3, fontStyle: 'italic' }}>
              Calendar estimate · open Event Detail for full readiness
            </div>
            {/* Next action — full access only */}
            {isFullAccess && nextAction && nextAction !== 'No immediate action required' && (
              <div style={{ marginTop: 7, padding: '4px 6px', background: 'rgba(0,0,0,0.2)', borderRadius: 3, fontSize: 10.5, color: '#F5F0E8', fontWeight: 600, lineHeight: 1.45 }}>
                {nextAction}
              </div>
            )}
            {isFullAccess && (!nextAction || nextAction === 'No immediate action required') && (
              <div style={{ marginTop: 4, fontSize: 9, color: '#5A5550', fontStyle: 'italic' }}>
                No immediate action required
              </div>
            )}
          </div>
        )}

        {/* Common fields — all roles */}
        <PanelRow label="Status"   value={statusLabel}   valueColor={statusColor} />
        <PanelRow label="Date"     value={displayDate}   />
        <PanelRow label="Time"     value={displayTime}   />
        <PanelRow label="Location" value={event.location} />
        <PanelRow label="Client"   value={event.client_name} />
        <PanelRow label="Guests"   value={event.expected_guests != null ? `${event.expected_guests} expected` : null} />
        {summary?.daysUntil !== null && summary?.daysUntil !== undefined && (
          <PanelRow
            label="Days until"
            value={
              summary.daysUntil < 0  ? `${Math.abs(summary.daysUntil)}d ago`
              : summary.daysUntil === 0 ? 'Today'
              : `${summary.daysUntil} days`
            }
            valueColor={
              summary.daysUntil <= 0  ? '#3A3A3A'
              : summary.daysUntil <= 7 ? '#D4943A'
              : '#9A9590'
            }
          />
        )}

        {/* Business view only (owner / manager) */}
        {!isFullAccess && (
          <PanelRow
            label="Revenue"
            value={
              event.revenue != null          ? `₪${event.revenue}`
              : event.expected_revenue != null ? `₪${event.expected_revenue}`
              : 'Revenue not set'
            }
            valueColor={(event.revenue != null || event.expected_revenue != null) ? '#9A9590' : '#3A3A3A'}
          />
        )}

        {/* Full operational view (events_manager / admin) */}
        {isFullAccess && (
          <>
            <div style={{ margin: '10px 0 4px' }}>
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#3A3A3A', marginBottom: 5 }}>
                Operational
              </div>
              {brief && <PanelRow label="Service style" value={brief.masterBrief?.serviceStyle} />}
              <PanelRow label="Cocktail menu" value={menuStatusLabel} valueColor={menuStatusColor} />
              <PanelRow label="Risk level"    value={summary?.riskLevel} valueColor={
                summary?.riskLevel === 'Critical' ? '#C44A4A'
                : summary?.riskLevel === 'High'   ? '#D4943A'
                : summary?.riskLevel === 'Medium' ? '#C9A96E'
                : '#6BAF80'
              } />
              <PanelRow label="Architect plan" value={
                summary?.architectStatus === 'planned'  ? '✓ Plan saved'
                : summary?.architectStatus === 'default' ? 'Default layout'
                : 'Not started'
              } />
              {brief?.cocktailMenuBrief?.welcomeDrinkNeed && (
                <PanelRow label="Welcome drink" value={brief.cocktailMenuBrief.welcomeDrinkNeed.split('.')[0]} />
              )}
              {brief?.masterBrief?.kosherFlag && (
                <PanelRow label="Kosher" value="Required" valueColor="#D4943A" />
              )}
            </div>
          </>
        )}

        {/* Action links */}
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
  const today    = new Date()
  const todayKey = isoKey(today.getFullYear(), today.getMonth(), today.getDate())

  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [panelId, setPanelId]       = useState(null)
  const [menuCache, setMenuCache]   = useState({})   // { [eventId]: 'approved'|'draft'|null }
  const [typeFilter, setTypeFilter] = useState('all')
  const [healthFilter, setHealthFilter] = useState('all')

  const isFullAccess        = FULL_ACCESS_ROLES.includes(currentUser?.role)
  const canNavigateToDetail = CAN_OPEN_DETAIL_ROLES.includes(currentUser?.role)

  // ── Architect status per event (localStorage, synchronous) ──
  const architectStatusMap = useMemo(() => {
    const map = {}
    for (const ev of (events || [])) {
      try {
        const plan = loadPlan(ev.id)
        map[ev.id] = plan
          ? (plan.isDefault ? 'default' : 'planned')
          : null
      } catch {
        map[ev.id] = null
      }
    }
    return map
  }, [events])

  // ── Batch-fetch cocktail status for upcoming events ──
  // Only fetches events within COCKTAIL_FETCH_HORIZON_DAYS days; skips already-cached.
  useEffect(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + COCKTAIL_FETCH_HORIZON_DAYS)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    for (const ev of (events || [])) {
      if (!ev.event_date) continue
      if (menuCache[ev.id] !== undefined) continue
      const evDate = new Date(ev.event_date + 'T12:00:00')
      if (evDate < todayStart || evDate > cutoff) continue

      fetchCocktailMenu(ev.id)
        .then(data => setMenuCache(prev => ({ ...prev, [ev.id]: data.menu?.status ?? null })))
        .catch(() => setMenuCache(prev => ({ ...prev, [ev.id]: null })))
    }
  }, [events]) // intentionally does not depend on menuCache to avoid infinite loop

  // ── Also fetch for the panel event if not yet cached ──
  useEffect(() => {
    if (!panelId || menuCache[panelId] !== undefined) return
    fetchCocktailMenu(panelId)
      .then(data => setMenuCache(prev => ({ ...prev, [panelId]: data.menu?.status ?? null })))
      .catch(() => setMenuCache(prev => ({ ...prev, [panelId]: null })))
  }, [panelId])

  // ── Per-event calendar intelligence ──
  // riskAssessment is intentionally omitted here: calling computeRiskAssessment with
  // empty guest/table/task arrays would fire false "no guests loaded" risks on every
  // event, inflating risk levels and blocking legitimate Ready classifications.
  // calendarIntelligence.js uses its own event-level risk heuristic instead.
  const intelligenceMap = useMemo(() => {
    const map = {}
    for (const ev of (events || [])) {
      const cocktailStatus = menuCache[ev.id] !== undefined ? menuCache[ev.id] : null
      map[ev.id] = buildCalendarIntelligence({
        event:             ev,
        cocktailMenuStatus: cocktailStatus,
        architectStatus:    architectStatusMap[ev.id],
      })
    }
    return map
  }, [events, menuCache, architectStatusMap])

  // ── Daily briefing (consumes intelligenceMap — no re-computation) ──
  const briefing = useMemo(
    () => buildDailyBriefing({ events: events || [], intelligenceMap }),
    [events, intelligenceMap]
  )

  // ── Calendar grid ──
  const grid = useMemo(() => getCalendarGrid(year, month), [year, month])

  // ── Events indexed by date ──
  const eventsByDate = useMemo(() => {
    const map = {}
    for (const ev of (events || [])) {
      if (!ev.event_date) continue
      if (!map[ev.event_date]) map[ev.event_date] = []
      map[ev.event_date].push(ev)
    }
    return map
  }, [events])

  // ── Filtered events by date (type + health filters) ──
  const filteredEventsByDate = useMemo(() => {
    if (typeFilter === 'all' && healthFilter === 'all') return eventsByDate
    const filtered = {}
    for (const [date, dayEvs] of Object.entries(eventsByDate)) {
      const kept = dayEvs.filter(ev => {
        if (typeFilter !== 'all' && ev.event_type !== typeFilter) return false
        if (healthFilter !== 'all') {
          const health = intelligenceMap[ev.id]?.eventHealth?.status
          if (healthFilter === 'ready'           && health !== 'Ready')           return false
          if (healthFilter === 'needs_attention'  && health !== 'Needs Attention') return false
          if (healthFilter === 'critical'         && health !== 'Critical')        return false
        }
        return true
      })
      if (kept.length) filtered[date] = kept
    }
    return filtered
  }, [eventsByDate, typeFilter, healthFilter, intelligenceMap])

  // ── Today's Priorities: upcoming events sorted by urgency ──
  const upcomingPriorities = useMemo(() => {
    if (!isFullAccess) return []
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const cutoff     = new Date(todayStart)
    cutoff.setDate(cutoff.getDate() + AGENDA_HORIZON_DAYS)

    const STATUS_ORDER = { Critical: 0, 'Needs Attention': 1, Ready: 2 }

    return (events || [])
      .filter(ev => {
        if (!ev.event_date) return false
        const d = new Date(ev.event_date + 'T12:00:00')
        return d >= todayStart && d <= cutoff
      })
      .sort((a, b) => {
        const ia = intelligenceMap[a.id]
        const ib = intelligenceMap[b.id]
        const sa = STATUS_ORDER[ia?.eventHealth?.status] ?? 1
        const sb = STATUS_ORDER[ib?.eventHealth?.status] ?? 1
        if (sa !== sb) return sa - sb
        const da = ia?.calendarSummary?.daysUntil ?? 999
        const db = ib?.calendarSummary?.daysUntil ?? 999
        if (da !== db) return da - db
        return (ia?.eventHealth?.score ?? 0) - (ib?.eventHealth?.score ?? 0)
      })
  }, [events, intelligenceMap, isFullAccess])

  const panelEvent = useMemo(
    () => (events || []).find(e => e.id === panelId) || null,
    [events, panelId]
  )

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
    return e.event_date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`)
  })

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '20px 24px', maxWidth: 940, margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isFullAccess && upcomingPriorities.length > 0 ? 16 : 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 22, fontWeight: 700, color: '#F5F0E8', lineHeight: 1.1 }}>
            Event Calendar
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A96E', marginTop: 3, opacity: 0.7 }}>
            {eventsThisMonth.length} event{eventsThisMonth.length !== 1 ? 's' : ''} this month
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <NavBtn onClick={goToToday}>Today</NavBtn>
          <NavBtn onClick={prevMonth}>‹</NavBtn>
          <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, fontWeight: 600, color: '#9A9590', minWidth: 130, textAlign: 'center' }}>
            {MONTH_NAMES[month]} {year}
          </span>
          <NavBtn onClick={nextMonth}>›</NavBtn>
        </div>
      </div>

      {/* ── Daily Briefing ── */}
      <DailyBriefing
        briefing={briefing}
        intelligenceMap={intelligenceMap}
        isFullAccess={isFullAccess}
        onEventSelect={setPanelId}
      />

      {/* ── Today's Priorities (full access only) ── */}
      {isFullAccess && upcomingPriorities.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5A5550', marginBottom: 8 }}>
            Today's Priorities
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {upcomingPriorities.slice(0, 5).map(ev => (
              <AgendaCard
                key={ev.id}
                event={ev}
                intel={intelligenceMap[ev.id]}
                isSelected={ev.id === panelId}
                onClick={() => setPanelId(ev.id === panelId ? null : ev.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <FilterBar
        typeFilter={typeFilter}
        onTypeFilter={v => { setTypeFilter(v); setPanelId(null) }}
        healthFilter={healthFilter}
        onHealthFilter={v => { setHealthFilter(v); setPanelId(null) }}
        showHealthFilter={true}
      />

      {/* ── Day name headers ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #1E1E1E' }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3A3A3A', padding: '6px 8px 5px', textAlign: 'center' }}>
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
                <div key={`e-${idx}`} style={{ minHeight: 76, borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid #141414', borderBottom: '1px solid #141414', background: '#080808' }} />
              )
            }

            const key      = isoKey(year, month, day)
            const dayEvs   = filteredEventsByDate[key] || []
            const isToday  = key === todayKey
            const maxVis   = 2
            const overflow = dayEvs.length - maxVis

            return (
              <div
                key={key}
                style={{
                  minHeight:   76,
                  padding:     '5px 4px 4px',
                  borderRight: (idx + 1) % 7 === 0 ? 'none' : '1px solid #141414',
                  borderBottom:'1px solid #141414',
                  background:  isToday ? 'rgba(201,169,110,0.04)' : 'transparent',
                }}
              >
                {/* Day number */}
                <div style={{
                  fontSize:      10, fontWeight: isToday ? 700 : 400,
                  color:         isToday ? '#C9A96E' : '#3A3A3A',
                  marginBottom:  3,
                  display:       'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width:         isToday ? 20 : 'auto', height: isToday ? 20 : 'auto',
                  borderRadius:  isToday ? '50%' : 0,
                  background:    isToday ? 'rgba(201,169,110,0.14)' : 'transparent',
                }}>
                  {day}
                </div>

                {/* Event chips */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {dayEvs.slice(0, maxVis).map(ev => {
                    const chip       = TYPE_CHIP[ev.event_type] || TYPE_CHIP.other
                    const intel      = intelligenceMap[ev.id]
                    const health     = intel?.eventHealth
                    const healthColor= health?.color || chip.text
                    const isSelected = ev.id === panelId
                    const score      = health?.score

                    return (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setPanelId(ev.id === panelId ? null : ev.id)}
                        title={ev.name}
                        style={{
                          background:    isSelected ? chip.border : chip.bg,
                          border:        `1px solid ${isSelected ? healthColor : chip.border}`,
                          borderLeft:    `3px solid ${healthColor}`,
                          borderRadius:  3,
                          cursor:        'pointer',
                          overflow:      'hidden',
                          padding:       '2px 4px',
                          textAlign:     'left',
                          width:         '100%',
                        }}
                      >
                        <div style={{ fontSize: 8, fontWeight: 600, color: chip.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>
                          {ev.name}
                        </div>
                        {/* Intelligence row — compact, full access or all roles for health dot */}
                        {score != null && (
                          <div style={{ fontSize: 7, color: healthColor, marginTop: 1, display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span>{score}%</span>
                            {menuCache[ev.id] === 'approved' && (
                              <span style={{ color: '#6BAF80' }}>· Menu ✓</span>
                            )}
                            {intel?.calendarSummary?.daysUntil != null && intel.calendarSummary.daysUntil <= 7 && intel.calendarSummary.daysUntil >= 0 && (
                              <span style={{ color: '#D4943A' }}>· {intel.calendarSummary.daysUntil}d</span>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                  {overflow > 0 && (
                    <span style={{ fontSize: 8, color: '#3A3A3A', paddingLeft: 2 }}>+{overflow} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && Object.keys(filteredEventsByDate).filter(k => k.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-`)).length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 0 16px', color: '#3A3A3A', fontSize: 11, fontStyle: 'italic' }}>
          {typeFilter !== 'all' || healthFilter !== 'all'
            ? 'No events match the current filters.'
            : 'No events scheduled for this period.'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1, background: '#6BAF80' }} />
          <span style={{ fontSize: 8, color: '#3A3A3A', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Ready</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1, background: '#C9A96E' }} />
          <span style={{ fontSize: 8, color: '#3A3A3A', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Needs Attention</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 3, height: 14, borderRadius: 1, background: '#C44A4A' }} />
          <span style={{ fontSize: 8, color: '#3A3A3A', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Critical</span>
        </div>
      </div>

      {/* ── Event detail panel ── */}
      {panelEvent && (
        <EventPanel
          event={panelEvent}
          menuStatus={menuCache[panelEvent.id]}
          intel={intelligenceMap[panelEvent.id]}
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
