import React, { useState, useMemo, useCallback } from 'react'
import EventBrainFloorPlan from './components/EventBrainFloorPlan'
import EventBriefCard from './components/EventBriefCard'
import SelectedTablePanel from './components/SelectedTablePanel'
import PlanningSummary from './components/PlanningSummary'
import { InvestorValueCard, PilotValueCard } from './components/InvestorValueCards'
import BarProgramme from './components/BarProgramme'
import StaffNotifications from './components/StaffNotifications'
import { DEFAULT_TABLES } from './data/eventBrainDemoData'

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
  // Basic shape validation — fall back if structure is wrong
  if (typeof stored.tables[0]?.id !== 'number') return DEFAULT_TABLES
  return stored.tables
}

export default function EventBrain() {
  const stored = useMemo(() => loadState(), [])

  const [selectedId, setSelectedId] = useState(stored?.selectedId ?? 7)
  const [hoverId, setHoverId] = useState(null)
  const [tables, setTables] = useState(() => resolveInitialTables(stored))

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
    clearState()
  }, [])

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e]">
          Investor Demo
        </div>
        <h1 className="font-serif text-3xl font-black leading-tight tracking-tighter text-[#f5f5f0] sm:text-4xl">
          HESTIA × Kahi Event Resort
        </h1>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-[#e8dcc0] opacity-80 italic">
          AI-powered resort event operations simulation
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#c9a96e]/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#c9a96e]">
            Strategic Collaboration Concept
          </span>
          <span className="rounded-full border border-[#6b705c]/30 bg-[#6b705c]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#e8dcc0]">
            Investor Demo
          </span>
          <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#c9a96e]">
            Pilot-Ready
          </span>
        </div>
      </div>

      {/* ── Main: Floor Plan + Right Panel ── */}
      <div className="grid gap-5 xl:grid-cols-[1fr_296px]">
        <EventBrainFloorPlan
          tables={tables}
          selectedId={selectedId}
          hoverId={hoverId}
          onSelect={handleSelect}
          onHover={setHoverId}
          onAutoArrange={handleAutoArrange}
          onReset={handleReset}
        />
        <div className="space-y-5">
          <EventBriefCard />
          <SelectedTablePanel table={selectedTable} />
        </div>
      </div>

      {/* ── Bottom Section ── */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <PlanningSummary />
        <BarProgramme />
        <StaffNotifications />
        <div className="space-y-5">
          <InvestorValueCard />
          <PilotValueCard />
        </div>
      </div>
    </div>
  )
}
