import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
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
import EventArchitectTablePanel from './components/EventArchitectTablePanel'
import EventArchitectGuestPanel from './components/EventArchitectGuestPanel'
import { DEFAULT_TABLES, EVENT_BRIEF } from './data/eventBrainDemoData'
import { buildArchitectBriefFromEvent } from './utils/eventArchitectAdapter'
import { loadPlan, savePlan, clearPlan } from './utils/eventArchitectPlanPersistence'
import { computeSeatingIntelligence } from './utils/seatingIntelligence'
import { fetchGuests, updateGuest } from '../../services/api/eventsApi'

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
function PlanNotice({ isEventLinked, isEventNotFound, isEventsLoading, eventName, isPlanSaved }) {
  const showNotice = isEventLinked || isEventNotFound || isEventsLoading

  let text, color
  if (isEventLinked) {
    text = `Planning from event data · ${eventName}`
    color = '#C9A96E'
  } else if (isEventsLoading) {
    text = 'Loading event data…'
    color = '#5A5550'
  } else {
    text = 'Demo architect plan shown — event data unavailable.'
    color = '#8B7355'
  }

  const planLabel = isPlanSaved ? 'Plan saved' : 'Default plan · unsaved'
  const planColor = isPlanSaved ? '#4F6B4A' : '#5A5550'

  if (!showNotice && !isPlanSaved) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '5px 14px',
        marginBottom: 12,
        borderRadius: 6,
        background: isEventLinked ? 'rgba(201,169,110,0.06)' : 'rgba(90,84,80,0.1)',
        border: `1px solid ${isEventLinked ? 'rgba(201,169,110,0.18)' : '#1E1E1E'}`,
      }}
    >
      {showNotice ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
            {text}
          </span>
        </div>
      ) : (
        <span />
      )}
      <span style={{ fontSize: 9, color: planColor, fontWeight: 600, letterSpacing: '0.08em' }}>
        {planLabel}
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

// ── Reset confirmation modal ───────────────────────────────────────────────────
function ResetConfirmModal({ onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#0C0C0C',
          border: '1px solid #242424',
          borderRadius: 10,
          padding: '24px 28px',
          maxWidth: 340,
          width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#F5F0E8', marginBottom: 8 }}>
          Reset floor plan?
        </div>
        <div style={{ fontSize: 11, color: '#5A5550', lineHeight: 1.6, marginBottom: 22 }}>
          This restores the default table arrangement for this event and clears the saved plan.
          This action cannot be undone.
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '7px 16px', borderRadius: 5, fontSize: 10,
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', border: '1px solid #2A2A2A',
              background: 'transparent', color: '#5A5550',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '7px 16px', borderRadius: 5, fontSize: 10,
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer', border: '1px solid rgba(180,70,70,0.5)',
              background: 'rgba(180,70,70,0.10)', color: '#c05050',
            }}
          >
            Reset to Default
          </button>
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

  const savedPlan = useMemo(() => loadPlan(eventId), [eventId])

  const [isPlanSaved, setIsPlanSaved] = useState(Boolean(savedPlan))
  const [selectedId, setSelectedId] = useState(savedPlan?.selectedId ?? 7)
  const [hoverId, setHoverId] = useState(null)
  const [tables, setTables] = useState(() => savedPlan?.tables ?? DEFAULT_TABLES)
  const [activeMode, setActiveMode] = useState('architect')

  // Phase 11C state
  const [highlightType, setHighlightType] = useState(null)
  const [showVisionModal, setShowVisionModal] = useState(false)
  const [showPrintBrief, setShowPrintBrief] = useState(false)

  // Z3: undo (one step) + reset confirmation
  const undoRef = useRef(null) // { tables, selectedId }
  const [canUndo, setCanUndo] = useState(false)
  const [resetConfirmPending, setResetConfirmPending] = useState(false)

  // Z4: guest seating — fetched independently per eventId
  const [guests, setGuests] = useState([])

  useEffect(() => {
    if (!eventId) return
    let cancelled = false
    fetchGuests(eventId)
      .then(res => { if (!cancelled) setGuests(Array.isArray(res?.guests) ? res.guests : []) })
      .catch(() => { if (!cancelled) setGuests([]) })
    return () => { cancelled = true }
  }, [eventId])

  const seatingIntelligence = useMemo(
    () => computeSeatingIntelligence(guests, tables),
    [guests, tables]
  )

  const selectedTable = useMemo(
    () => tables.find(t => t.id === selectedId) ?? tables[0],
    [tables, selectedId]
  )

  // ── Helpers ──────────────────────────────────────────────────────────────────

  // Call before any mutation to snapshot current state into the undo ref.
  // Uses current tables/selectedId from closure (via useCallback deps).
  function pushUndo(currentTables, currentSelectedId) {
    undoRef.current = { tables: currentTables, selectedId: currentSelectedId }
    setCanUndo(true)
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSelect = useCallback(
    id => {
      setSelectedId(id)
      savePlan(eventId, { tables, selectedId: id, isDefault: false })
      setIsPlanSaved(true)
    },
    [tables, eventId]
  )

  const handleAutoArrange = useCallback(() => {
    pushUndo(tables, selectedId)
    setTables(DEFAULT_TABLES)
    setSelectedId(7)
    savePlan(eventId, { tables: DEFAULT_TABLES, selectedId: 7, isDefault: true })
    setIsPlanSaved(true)
  }, [tables, selectedId, eventId])

  // Reset is guarded by the confirmation modal — this only triggers the modal.
  const handleResetRequest = useCallback(() => {
    setResetConfirmPending(true)
  }, [])

  const handleResetConfirm = useCallback(() => {
    setTables(DEFAULT_TABLES)
    setSelectedId(7)
    setActiveMode('architect')
    setHighlightType(null)
    clearPlan(eventId)
    setIsPlanSaved(false)
    undoRef.current = null
    setCanUndo(false)
    setResetConfirmPending(false)
  }, [eventId])

  const handleResetCancel = useCallback(() => {
    setResetConfirmPending(false)
  }, [])

  // Table drag — called by EventBrainFloorPlan after drag ends
  const handleTableMoveEnd = useCallback((id, x, y) => {
    pushUndo(tables, selectedId)
    const updated = tables.map(t => t.id === id ? { ...t, x, y } : t)
    setTables(updated)
    savePlan(eventId, { tables: updated, selectedId, isDefault: false })
    setIsPlanSaved(true)
  }, [tables, selectedId, eventId])

  // Table panel — rename (label)
  const handleRename = useCallback((id, label) => {
    pushUndo(tables, selectedId)
    const updated = tables.map(t => t.id === id ? { ...t, label } : t)
    setTables(updated)
    savePlan(eventId, { tables: updated, selectedId, isDefault: false })
    setIsPlanSaved(true)
  }, [tables, selectedId, eventId])

  // Table panel — capacity
  const handleCapacityChange = useCallback((id, capacity) => {
    pushUndo(tables, selectedId)
    const updated = tables.map(t => t.id === id ? { ...t, capacity } : t)
    setTables(updated)
    savePlan(eventId, { tables: updated, selectedId, isDefault: false })
    setIsPlanSaved(true)
  }, [tables, selectedId, eventId])

  // Table panel — shape/type
  const handleTypeChange = useCallback((id, shape) => {
    pushUndo(tables, selectedId)
    const updated = tables.map(t => t.id === id ? { ...t, shape } : t)
    setTables(updated)
    savePlan(eventId, { tables: updated, selectedId, isDefault: false })
    setIsPlanSaved(true)
  }, [tables, selectedId, eventId])

  // Table panel — duplicate
  const handleDuplicate = useCallback((id) => {
    const source = tables.find(t => t.id === id)
    if (!source) return
    pushUndo(tables, selectedId)
    const newId = Math.max(0, ...tables.map(t => t.id)) + 1
    const newTable = {
      ...source,
      id: newId,
      x: Math.min(950, source.x + 50),
      y: Math.min(570, source.y + 50),
      label: source.label ? `${source.label} (copy)` : undefined,
    }
    const updated = [...tables, newTable]
    setTables(updated)
    setSelectedId(newId)
    savePlan(eventId, { tables: updated, selectedId: newId, isDefault: false })
    setIsPlanSaved(true)
  }, [tables, selectedId, eventId])

  // Table panel — delete
  const handleDelete = useCallback((id) => {
    pushUndo(tables, selectedId)
    const updated = tables.filter(t => t.id !== id)
    // Prefer keeping the current selection if it's not the deleted table
    const newSelected = selectedId !== id
      ? selectedId
      : (updated[0]?.id ?? null)
    setTables(updated)
    setSelectedId(newSelected)
    savePlan(eventId, { tables: updated, selectedId: newSelected, isDefault: false })
    setIsPlanSaved(true)
  }, [tables, selectedId, eventId])

  // Undo — restore the previous snapshot
  const handleUndo = useCallback(() => {
    if (!undoRef.current) return
    const { tables: prev, selectedId: prevSel } = undoRef.current
    setTables(prev)
    setSelectedId(prevSel)
    savePlan(eventId, { tables: prev, selectedId: prevSel, isDefault: false })
    setIsPlanSaved(true)
    undoRef.current = null
    setCanUndo(false)
  }, [eventId])

  // Z4: assign a guest to the currently selected table (optimistic update)
  const handleAssignGuest = useCallback(async (guestId) => {
    if (!eventId || selectedId == null) return
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, table_id: selectedId } : g))
    try { await updateGuest(eventId, guestId, { table_id: selectedId }) } catch {}
  }, [eventId, selectedId])

  // Z4: remove a guest's table assignment (optimistic update)
  const handleUnassignGuest = useCallback(async (guestId) => {
    if (!eventId) return
    setGuests(prev => prev.map(g => g.id === guestId ? { ...g, table_id: null } : g))
    try { await updateGuest(eventId, guestId, { table_id: null }) } catch {}
  }, [eventId])

  return (
    <div>
      {/* ── Premium Command Bar ── */}
      <CommandBar eventBrief={eventBrief} isEventLinked={isEventLinked} />

      {/* ── Plan notice (event-linked / demo / loading / save status) ── */}
      <PlanNotice
        isEventLinked={isEventLinked}
        isEventNotFound={isEventNotFound}
        isEventsLoading={isEventsLoading}
        eventName={eventBrief.title}
        isPlanSaved={isPlanSaved}
      />

      {/* ── Event Architect Toolbar — above grid so mode controls are always visible ── */}
      <div className="mb-4">
        <EventArchitectToolbar
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onReset={handleResetRequest}
          onOpenVision={() => setShowVisionModal(true)}
          onOpenBrief={() => setShowPrintBrief(true)}
          onUndo={handleUndo}
          canUndo={canUndo}
        />
      </div>

      {/* ── Main: Object Library + Floor Plan + Right Column ── */}
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
          onReset={handleResetRequest}
          onTableMoveEnd={handleTableMoveEnd}
          activeMode={activeMode}
          highlightType={highlightType}
        />

        {/* Right column: table properties → seating → Zohar intelligence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <EventArchitectTablePanel
            key={selectedTable?.id ?? 'none'}
            table={selectedTable}
            onRename={handleRename}
            onCapacityChange={handleCapacityChange}
            onTypeChange={handleTypeChange}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
          <EventArchitectGuestPanel
            key={`gp-${selectedTable?.id ?? 'none'}`}
            selectedTable={selectedTable}
            guests={guests}
            onAssignGuest={handleAssignGuest}
            onUnassignGuest={handleUnassignGuest}
            seatingIntelligence={seatingIntelligence}
          />
          <ZoharPanel
            selectedTable={selectedTable}
            tables={tables}
            eventBrief={eventBrief}
            seatingIntelligence={seatingIntelligence}
          />
        </div>
      </div>

      {/* ── Intelligence Metrics Strip ── */}
      <div className="mt-4">
        <EventArchitectMetricsStrip
          tables={tables}
          eventBrief={eventBrief}
          seatingIntelligence={seatingIntelligence}
        />
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

      {/* ── Z3: Reset confirmation modal ── */}
      {resetConfirmPending && (
        <ResetConfirmModal
          onConfirm={handleResetConfirm}
          onCancel={handleResetCancel}
        />
      )}
    </div>
  )
}
