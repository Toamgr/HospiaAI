import React, { useState, useMemo } from 'react'
import { buildRecommendations, buildTableRecommendation, TAGS } from '../utils/zoharRecommendations'
import { ZONE_LABELS, TABLE_NOTES, ZONE_NOTES, EVENT_BRIEF } from '../data/eventBrainDemoData'

// ── Z Mark ─────────────────────────────────────────────────────────────────────
function ZMark() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 6,
        background: 'rgba(201,169,110,0.08)',
        border: '1px solid rgba(201,169,110,0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M3.5 3.5H14.5L4.5 14.5H14.5"
          stroke="#C9A96E"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// ── Tag chip ────────────────────────────────────────────────────────────────────
function TagChip({ tag }) {
  const colorMap = {
    [TAGS.GUEST_FLOW]:    { bg: 'rgba(42,92,139,0.15)', text: '#6BA8D4', border: 'rgba(42,92,139,0.25)' },
    [TAGS.ACCESSIBILITY]: { bg: 'rgba(74,124,89,0.15)', text: '#6BAF80', border: 'rgba(74,124,89,0.25)' },
    [TAGS.BAR_OPERATIONS]: { bg: 'rgba(201,169,110,0.10)', text: '#C9A96E', border: 'rgba(201,169,110,0.20)' },
    [TAGS.VIP_EXPERIENCE]: { bg: 'rgba(201,169,110,0.08)', text: '#8B7355', border: 'rgba(201,169,110,0.15)' },
    [TAGS.RISK]:          { bg: 'rgba(193,127,42,0.12)', text: '#D4943A', border: 'rgba(193,127,42,0.22)' },
    [TAGS.SERVICE]:       { bg: 'rgba(90,84,80,0.15)', text: '#9A9590', border: 'rgba(90,84,80,0.25)' },
  }
  const c = colorMap[tag] ?? { bg: 'rgba(90,84,80,0.1)', text: '#9A9590', border: 'rgba(90,84,80,0.2)' }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 100,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {tag}
    </span>
  )
}

// ── Priority indicator ─────────────────────────────────────────────────────────
function PriorityDot({ priority }) {
  const colors = { high: '#C9A96E', medium: '#8B7355', low: '#3A3A3A' }
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: colors[priority] ?? colors.low,
        flexShrink: 0,
        marginTop: 1,
      }}
    />
  )
}

// ── Recommendation card ────────────────────────────────────────────────────────
function RecommendationCard({ rec }) {
  const borderColors = { high: 'rgba(201,169,110,0.35)', medium: 'rgba(139,115,85,0.20)', low: 'rgba(58,58,58,0.6)' }
  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #2A2A2A',
        borderLeft: `2px solid ${borderColors[rec.priority] ?? borderColors.low}`,
        borderRadius: 6,
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <PriorityDot priority={rec.priority} />
        <p
          style={{
            fontSize: 11,
            lineHeight: 1.6,
            color: '#9A9590',
            margin: 0,
            flex: 1,
          }}
        >
          {rec.text}
        </p>
      </div>
      <div>
        <TagChip tag={rec.tag} />
      </div>
    </div>
  )
}

// ── Filter tab ─────────────────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: TAGS.RISK, label: 'Risk' },
  { key: TAGS.GUEST_FLOW, label: 'Flow' },
  { key: TAGS.ACCESSIBILITY, label: 'Access.' },
  { key: TAGS.BAR_OPERATIONS, label: 'Bar' },
  { key: TAGS.VIP_EXPERIENCE, label: 'VIP' },
  { key: TAGS.SERVICE, label: 'Service' },
]

function FilterTabs({ active, onChange, counts }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 2,
        overflowX: 'auto',
        padding: '0 16px 8px',
        scrollbarWidth: 'none',
      }}
    >
      {FILTER_TABS.map(({ key, label }) => {
        const isActive = active === key
        const count = key === 'all' ? undefined : (counts[key] ?? 0)
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            style={{
              flexShrink: 0,
              padding: '3px 9px',
              borderRadius: 100,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              background: isActive ? 'rgba(201,169,110,0.12)' : 'transparent',
              color: isActive ? '#C9A96E' : '#5A5550',
              border: isActive ? '1px solid rgba(201,169,110,0.30)' : '1px solid transparent',
            }}
          >
            {label}{count !== undefined && count > 0 ? ` · ${count}` : ''}
          </button>
        )
      })}
    </div>
  )
}

// ── Compact event brief summary ────────────────────────────────────────────────
function BriefSummaryRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '4px 0',
        borderBottom: '1px solid #1A1A1A',
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5550' }}>
        {label}
      </span>
      <span style={{ fontSize: 10, fontWeight: 500, color: '#F5F0E8', textAlign: 'right', maxWidth: '55%' }}>
        {value}
      </span>
    </div>
  )
}

// ── Selected table context ─────────────────────────────────────────────────────
function TableContext({ selectedTable, tables, eventBrief }) {
  if (!selectedTable) return null
  const rec = buildTableRecommendation(selectedTable, tables, eventBrief)
  const zoneLabel = ZONE_LABELS[selectedTable.zone] ?? selectedTable.zone
  const fillPct = selectedTable.capacity > 0
    ? Math.round((selectedTable.guests / selectedTable.capacity) * 100)
    : 0

  return (
    <div
      style={{
        borderTop: '1px solid #1E1E1E',
        padding: '12px 16px',
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#5A5550',
          marginBottom: 8,
        }}
      >
        Selected — Table {selectedTable.id}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
        <span
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 15,
            fontWeight: 700,
            color: '#F5F0E8',
          }}
        >
          Table {selectedTable.id}{selectedTable.label ? ` — ${selectedTable.label}` : ''}
        </span>
        <span
          style={{
            flexShrink: 0,
            padding: '2px 8px',
            borderRadius: 100,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            background: 'rgba(201,169,110,0.08)',
            color: '#8B7355',
            border: '1px solid rgba(201,169,110,0.15)',
          }}
        >
          {zoneLabel}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 9, color: '#5A5550', textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700 }}>Guests</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700, color: '#F5F0E8' }}>
            {selectedTable.guests}/{selectedTable.capacity}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: '#5A5550', textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700 }}>Fill</div>
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700, color: fillPct >= 80 ? '#C9A96E' : '#9A9590' }}>
            {fillPct}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, color: '#5A5550', textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700 }}>Waiter</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#F5F0E8' }}>
            {selectedTable.waiter ?? '—'}
          </div>
        </div>
        {selectedTable.accessiblePriority && (
          <div>
            <div style={{ fontSize: 9, color: '#4A7C59', textTransform: 'uppercase', letterSpacing: '0.10em', fontWeight: 700 }}>Access</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6BAF80' }}>Priority</div>
          </div>
        )}
      </div>

      {rec && (
        <p
          style={{
            fontSize: 10,
            lineHeight: 1.65,
            color: '#9A9590',
            fontStyle: 'italic',
            margin: 0,
            padding: '8px',
            background: 'rgba(201,169,110,0.04)',
            borderRadius: 4,
            borderLeft: '2px solid rgba(201,169,110,0.22)',
          }}
        >
          {rec}
        </p>
      )}
    </div>
  )
}

// ── Main ZoharPanel ────────────────────────────────────────────────────────────
// ── Seating Intelligence Section ──────────────────────────────────────────────
function SeatingSection({ si }) {
  if (!si || si.totalGuests === 0) return null

  const completionColor = si.seatingCompletion >= 80
    ? '#4F6B4A'
    : si.seatingCompletion >= 50
    ? '#C9A96E'
    : '#c05050'

  return (
    <div style={{ padding: '10px 16px', borderBottom: '1px solid #1A1A1A', flexShrink: 0 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A5550', marginBottom: 8 }}>
        Seating Readiness
      </div>

      {/* Completion bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 9, color: '#5A5550' }}>Completion</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: completionColor }}>
            {si.seatingCompletion}%
          </span>
        </div>
        <div style={{ height: 3, background: '#1A1A1A', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${si.seatingCompletion}%`, background: completionColor, borderRadius: 2, transition: 'width 300ms ease' }} />
        </div>
      </div>

      {/* Counts */}
      <div style={{ display: 'flex', gap: 12, marginBottom: si.capacityWarnings.length + si.vipWarnings.length > 0 ? 8 : 0 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#4F6B4A', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1 }}>
            {si.seatedCount}
          </div>
          <div style={{ fontSize: 7.5, color: '#3A3A3A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Seated</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: si.unassignedCount > 0 ? '#C9A96E' : '#3A3A3A', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1 }}>
            {si.unassignedCount}
          </div>
          <div style={{ fontSize: 7.5, color: '#3A3A3A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Unassigned</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#5A5550', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1 }}>
            {si.totalGuests}
          </div>
          <div style={{ fontSize: 7.5, color: '#3A3A3A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Total</div>
        </div>
      </div>

      {/* Capacity warnings */}
      {si.capacityWarnings.length > 0 && (
        <div style={{ marginTop: 6 }}>
          {si.capacityWarnings.map(w => (
            <div key={w.tableId} style={{ fontSize: 9, color: '#c05050', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontWeight: 700 }}>⚠</span>
              <span>{w.tableLabel}: {w.assigned} assigned / {w.capacity} capacity</span>
            </div>
          ))}
        </div>
      )}

      {/* VIP warnings */}
      {si.vipWarnings.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {si.vipWarnings.map(w => (
            <div key={w.tableId} style={{ fontSize: 9, color: '#C9A96E', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontWeight: 700 }}>◆</span>
              <span>{w.tableLabel} — VIP table unassigned</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ZoharPanel({ selectedTable, tables, eventBrief, seatingIntelligence }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const allRecs = useMemo(
    () => buildRecommendations(tables, eventBrief),
    [tables, eventBrief]
  )

  const filteredRecs = useMemo(
    () => activeFilter === 'all' ? allRecs : allRecs.filter(r => r.tag === activeFilter),
    [allRecs, activeFilter]
  )

  const counts = useMemo(() => {
    const map = {}
    for (const r of allRecs) {
      map[r.tag] = (map[r.tag] ?? 0) + 1
    }
    return map
  }, [allRecs])

  const b = eventBrief ?? EVENT_BRIEF

  return (
    <div
      style={{
        background: '#0D0D0D',
        border: '1px solid #1E1E1E',
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid #1A1A1A',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <ZMark />
          <div>
            <div
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 17,
                fontWeight: 700,
                color: '#F5F0E8',
                lineHeight: 1.1,
              }}
            >
              Zohar
            </div>
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#C9A96E',
                opacity: 0.7,
              }}
            >
              Event Architect
            </div>
          </div>
        </div>
        <p
          style={{
            fontSize: 10,
            lineHeight: 1.6,
            color: '#5A5550',
            margin: 0,
          }}
        >
          Layout intelligence for guest flow, service paths, accessibility, bar operations, and premium event experience.
        </p>
      </div>

      {/* Event brief summary — compact */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid #1A1A1A',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#5A5550',
            marginBottom: 6,
          }}
        >
          Event Brief
        </div>
        <div
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#F5F0E8',
            marginBottom: 6,
          }}
        >
          {b.title}
        </div>
        <BriefSummaryRow label="Date" value={b.date} />
        <BriefSummaryRow label="Guests" value={`${b.totalGuests} invited`} />
        <BriefSummaryRow label="Service" value={b.serviceStyle} />
        <BriefSummaryRow label="Bar" value={b.barType} />
        <BriefSummaryRow label="Format" value={b.format} />
        {Array.isArray(b.dietary) && b.dietary.length > 0 && (
          <BriefSummaryRow label="Dietary" value={b.dietary.join(' · ')} />
        )}
      </div>

      {/* Seating Intelligence */}
      <SeatingSection si={seatingIntelligence} />

      {/* Recommendations */}
      <div
        style={{
          borderBottom: '1px solid #1A1A1A',
          flexShrink: 0,
          paddingTop: 10,
        }}
      >
        <div
          style={{
            padding: '0 16px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#5A5550',
            }}
          >
            Intelligence
          </div>
          <div
            style={{
              fontSize: 9,
              color: '#3A3A3A',
              fontWeight: 700,
              letterSpacing: '0.10em',
            }}
          >
            {allRecs.length} signal{allRecs.length !== 1 ? 's' : ''}
          </div>
        </div>

        <FilterTabs active={activeFilter} onChange={setActiveFilter} counts={counts} />
      </div>

      {/* Scrollable recommendations */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          minHeight: 200,
          maxHeight: 360,
          scrollbarWidth: 'thin',
          scrollbarColor: '#2A2A2A transparent',
        }}
      >
        {filteredRecs.length === 0 ? (
          <p
            style={{
              fontSize: 11,
              color: '#3A3A3A',
              fontStyle: 'italic',
              textAlign: 'center',
              margin: '24px 0',
            }}
          >
            No signals in this category.
          </p>
        ) : (
          filteredRecs.map(rec => <RecommendationCard key={rec.id} rec={rec} />)
        )}
      </div>

      {/* Selected table context */}
      <TableContext
        selectedTable={selectedTable}
        tables={tables}
        eventBrief={eventBrief}
      />
    </div>
  )
}
