import React, { useState, useMemo, useCallback, useEffect } from 'react'
import EventBrainFloorPlan from './components/EventBrainFloorPlan'
import PlanningSummary from './components/PlanningSummary'
import BarProgramme from './components/BarProgramme'
import StaffNotifications from './components/StaffNotifications'
import { InvestorValueCard, PilotValueCard } from './components/InvestorValueCards'
import ZoharPanel from './components/ZoharPanel'
import EventArchitectMetricsStrip from './components/EventArchitectMetricsStrip'
import EventArchitectToolbar from './components/EventArchitectToolbar'
import EventObjectLibrary from './components/EventObjectLibrary'
import EventArchitectVisionModal from './components/EventArchitectVisionModal'
import EventArchitectPrintableBrief from './components/EventArchitectPrintableBrief'
import { DEFAULT_TABLES, EVENT_BRIEF } from './data/eventBrainDemoData'
import { buildArchitectBriefFromEvent } from './utils/eventArchitectAdapter'

const STORAGE_KEY_BASE = 'hospia.eventBrain.v1'

function getStorageKey(eventId) {
  return eventId ? `${STORAGE_KEY_BASE}:${eventId}` : STORAGE_KEY_BASE
}

function loadState(eventId) {
  try {
    const raw = localStorage.getItem(getStorageKey(eventId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

function saveState(state, eventId) {
  try {
    localStorage.setItem(getStorageKey(eventId), JSON.stringify(state))
  } catch {
    // Silently ignore — storage may be full or unavailable
  }
}

function clearState(eventId) {
  try {
    localStorage.removeItem(getStorageKey(eventId))
  } catch {}
}

function resolveInitialTables(stored) {
  if (!stored?.tables) return DEFAULT_TABLES
  if (!Array.isArray(stored.tables) || stored.tables.length === 0) return DEFAULT_TABLES
  if (typeof stored.tables[0]?.id !== 'number') return DEFAULT_TABLES
  return stored.tables
}

const SESSION_LINK_KEY = 'hestia.architect.linkId'

function resolveEventId(pageContext) {
  // Signal 1: pageContext (in-app navigation via goToPage — reliable when not deferred)
  if (pageContext?.eventId) return String(pageContext.eventId)
  // Signal 2: URL search param (direct URL access / bookmarked link)
  try {
    const param = new URLSearchParams(window.location.search).get('eventId')
    if (param) return param
  } catch {}
  // Signal 3: sessionStorage set synchronously before goToPage in EventDetail button.
  // Handles the React Router v7 startTransition edge case where pageContext can arrive
  // one render cycle after the new page has mounted.
  try {
    const linked = sessionStorage.getItem(SESSION_LINK_KEY)
    if (linked) return linked
  } catch {}
  return null
}

// ── Status notice bar ──────────────────────────────────────────────────────────
function PlanNotice({ isEventLinked, isEventNotFound, isEventsLoading, eventName }) {
  if (!isEventLinked && !isEventNotFound && !isEventsLoading) return null

  let text, color
  if (isEventLinked) {
    text = `Event-linked plan · visual template`
    color = '#C9A96E'
  } else if (isEventsLoading) {
    text = 'Loading event data…'
    color = '#5A5550'
  } else {
    text = 'Demo architect plan shown — event data unavailable.'
    color = '#8B7355'
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 14px',
        marginBottom: 12,
        borderRadius: 6,
        background: isEventLinked ? 'rgba(201,169,110,0.06)' : 'rgba(90,84,80,0.1)',
        border: `1px solid ${isEventLinked ? 'rgba(201,169,110,0.18)' : '#1E1E1E'}`,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 10, color, fontWeight: 600, letterSpacing: '0.06em' }}>
        {isEventLinked ? `Planning from event data · ${eventName}` : text}
      </span>
    </div>
  )
}

// ── Premium Command Bar ────────────────────────────────────────────────────────
function CommandBar({ eventBrief, isEventLinked }) {
  return (
    <div
      style={{
        background: '#0A0A0A',
        borderBottom: '1px solid #1A1A1A',
        padding: '8px 0 8px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        borderRadius: 8,
        paddingLeft: 16,
        paddingRight: 16,
      }}
    >
      {/* Left: product identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#C9A96E',
              opacity: 0.7,
              lineHeight: 1,
            }}
          >
            HESTIA
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#9A9590',
              lineHeight: 1.2,
            }}
          >
            Event Architect Studio
          </div>
        </div>
        <div
          style={{
            width: 1,
            height: 24,
            background: '#1E1E1E',
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#F5F0E8',
              fontFamily: '"Cormorant Garamond", serif',
            }}
          >
            {eventBrief.title}
          </div>
          <div style={{ fontSize: 9, color: '#5A5550' }}>{eventBrief.date}</div>
        </div>
      </div>

      {/* Right: status indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              fontWeight: 700,
              color: '#C9A96E',
              lineHeight: 1,
            }}
          >
            {eventBrief.totalGuests ?? '—'}
          </div>
          <div style={{ fontSize: 8, color: '#3A3A3A', letterSpacing: '0.10em', textTransform: 'uppercase' }}>guests</div>
        </div>
        <div
          style={{
            padding: '3px 10px',
            borderRadius: 100,
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: isEventLinked ? 'rgba(201,169,110,0.12)' : 'rgba(90,84,80,0.15)',
            color: isEventLinked ? '#C9A96E' : '#9A9590',
            border: isEventLinked ? '1px solid rgba(201,169,110,0.30)' : '1px solid #2A2A2A',
          }}
        >
          {isEventLinked ? 'Event-linked' : 'Demo'}
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EventBrain({ pageContext, events }) {
  // Capture eventId once on mount using a lazy initializer — reads all three signals
  // (pageContext, URL param, sessionStorage) before any effects clear sessionStorage.
  // Stable for the lifetime of this EventBrain mount; does not recompute on re-renders.
  const [eventId] = useState(() => resolveEventId(pageContext))

  // Find linked event from the events array
  const linkedEvent = useMemo(() => {
    if (!eventId || !Array.isArray(events)) return null
    return events.find(e => String(e.id) === eventId) ?? null
  }, [eventId, events])

  // Build architect brief — real event data or demo fallback
  const architectBrief = useMemo(
    () => (linkedEvent ? buildArchitectBriefFromEvent(linkedEvent) : null),
    [linkedEvent]
  )

  const isEventLinked = Boolean(architectBrief)
  const isEventNotFound = Boolean(eventId && Array.isArray(events) && events.length > 0 && !linkedEvent)
  const isEventsLoading = Boolean(eventId && Array.isArray(events) && events.length === 0 && !linkedEvent)

  // Effective brief: real data if available, demo fallback otherwise
  const eventBrief = architectBrief ?? EVENT_BRIEF

  // Clear the sessionStorage link signal after first mount so it is not re-used
  // on a subsequent unrelated navigation to /ops/event-brain.
  useEffect(() => {
    try { sessionStorage.removeItem(SESSION_LINK_KEY) } catch {}
  }, [])

  const stored = useMemo(() => loadState(eventId), [eventId])

  const [selectedId, setSelectedId] = useState(stored?.selectedId ?? 7)
  const [hoverId, setHoverId] = useState(null)
  const [tables, setTables] = useState(() => resolveInitialTables(stored))
  const [activeMode, setActiveMode] = useState('architect')

  // Phase 11C state
  const [highlightType, setHighlightType] = useState(null)
  const [showVisionModal, setShowVisionModal] = useState(false)
  const [showPrintBrief, setShowPrintBrief] = useState(false)

  const selectedTable = useMemo(
    () => tables.find(t => t.id === selectedId) ?? tables[0],
    [tables, selectedId]
  )

  const handleSelect = useCallback(
    id => {
      setSelectedId(id)
      saveState({ selectedId: id, tables }, eventId)
    },
    [tables, eventId]
  )

  const handleAutoArrange = useCallback(() => {
    setTables(DEFAULT_TABLES)
    setSelectedId(7)
    saveState({ selectedId: 7, tables: DEFAULT_TABLES }, eventId)
  }, [eventId])

  const handleReset = useCallback(() => {
    setTables(DEFAULT_TABLES)
    setSelectedId(7)
    setActiveMode('architect')
    setHighlightType(null)
    clearState(eventId)
  }, [eventId])

  return (
    <div>
      {/* ── Premium Command Bar ── */}
      <CommandBar eventBrief={eventBrief} isEventLinked={isEventLinked} />

      {/* ── Plan notice (event-linked / demo / loading) ── */}
      <PlanNotice
        isEventLinked={isEventLinked}
        isEventNotFound={isEventNotFound}
        isEventsLoading={isEventsLoading}
        eventName={eventBrief.title}
      />

      {/* ── Event Architect Toolbar — above grid so mode controls are always visible ── */}
      <div className="mb-4">
        <EventArchitectToolbar
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onReset={handleReset}
          onOpenVision={() => setShowVisionModal(true)}
          onOpenBrief={() => setShowPrintBrief(true)}
        />
      </div>

      {/* ── Main: Object Library + Floor Plan + Zohar Panel ── */}
      <div className="grid gap-5 xl:grid-cols-[auto_1fr_316px]">
        {/* Object Library — visible on xl+ only */}
        <EventObjectLibrary
          activeType={highlightType}
          onTypeChange={setHighlightType}
        />

        {/* Floor plan */}
        <EventBrainFloorPlan
          tables={tables}
          selectedId={selectedId}
          hoverId={hoverId}
          onSelect={handleSelect}
          onHover={setHoverId}
          onAutoArrange={handleAutoArrange}
          onReset={handleReset}
          activeMode={activeMode}
          highlightType={highlightType}
        />

        {/* Zohar intelligence panel */}
        <ZoharPanel
          selectedTable={selectedTable}
          tables={tables}
          eventBrief={eventBrief}
        />
      </div>

      {/* ── Intelligence Metrics Strip ── */}
      <div className="mt-4">
        <EventArchitectMetricsStrip tables={tables} eventBrief={eventBrief} />
      </div>

      {/* ── Bottom Section — preserved ── */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <PlanningSummary />
        <BarProgramme />
        <StaffNotifications />
        <div className="space-y-5">
          <InvestorValueCard />
          <PilotValueCard />
        </div>
      </div>

      {/* ── Phase 11C Modals ── */}
      {showVisionModal && (
        <EventArchitectVisionModal onClose={() => setShowVisionModal(false)} />
      )}
      {showPrintBrief && (
        <EventArchitectPrintableBrief
          tables={tables}
          eventBrief={eventBrief}
          onClose={() => setShowPrintBrief(false)}
        />
      )}
    </div>
  )
}
