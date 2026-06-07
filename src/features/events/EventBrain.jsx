import React, { useState, useMemo, useCallback } from 'react'
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

const STORAGE_KEY = 'hospia.eventBrain.v1'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Silently ignore — storage may be full or unavailable
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

function resolveInitialTables(stored) {
  if (!stored?.tables) return DEFAULT_TABLES
  if (!Array.isArray(stored.tables) || stored.tables.length === 0) return DEFAULT_TABLES
  if (typeof stored.tables[0]?.id !== 'number') return DEFAULT_TABLES
  return stored.tables
}

// ── Premium Command Bar ────────────────────────────────────────────────────────
function CommandBar({ eventBrief }) {
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
            {eventBrief.totalGuests}
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
            background: 'rgba(90,84,80,0.15)',
            color: '#9A9590',
            border: '1px solid #2A2A2A',
          }}
        >
          Demo
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function EventBrain() {
  const stored = useMemo(() => loadState(), [])

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
      saveState({ selectedId: id, tables })
    },
    [tables]
  )

  const handleAutoArrange = useCallback(() => {
    setTables(DEFAULT_TABLES)
    setSelectedId(7)
    saveState({ selectedId: 7, tables: DEFAULT_TABLES })
  }, [])

  const handleReset = useCallback(() => {
    setTables(DEFAULT_TABLES)
    setSelectedId(7)
    setActiveMode('architect')
    setHighlightType(null)
    clearState()
  }, [])

  return (
    <div>
      {/* ── Premium Command Bar ── */}
      <CommandBar eventBrief={EVENT_BRIEF} />

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
          eventBrief={EVENT_BRIEF}
        />
      </div>

      {/* ── Intelligence Metrics Strip ── */}
      <div className="mt-4">
        <EventArchitectMetricsStrip tables={tables} eventBrief={EVENT_BRIEF} />
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
          eventBrief={EVENT_BRIEF}
          onClose={() => setShowPrintBrief(false)}
        />
      )}
    </div>
  )
}
