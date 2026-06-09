import React, { useState } from 'react'
import { Card, CardHead, FieldRow, GhostButton } from '../utils/zoharDisplayUtils'

// Compact operations card. Shows guest flow, seating, task status.
// Expand reveals timeline/service flow detail and staffing guidance.

const TL_SEVERITY_COLOR = { high: '#D4943A', medium: '#C9A96E', low: '#6BAF80' }

export default function ZoharOperationsBriefCard({
  brief,
  seatingIntelligence,
  coordinationAssessment,
  timelineIntelligence,
  canAccessArchitect,
  onOpenArchitect,
}) {
  const [expanded, setExpanded] = useState(false)
  const ob = brief?.operationsBrief
  if (!ob) return null

  const deptOverall     = coordinationAssessment?.readinessBreakdown?.overall ?? null
  const primaryBottle   = coordinationAssessment?.primaryBottleneck
  const overallColor    = deptOverall === null ? '#5A5550' : deptOverall >= 75 ? '#6BAF80' : deptOverall >= 45 ? '#C9A96E' : '#D4943A'

  const ti = timelineIntelligence

  return (
    <Card>
      <CardHead
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {deptOverall !== null && (
              <span style={{ fontSize: 10, fontWeight: 700, color: overallColor }}>{deptOverall}%</span>
            )}
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3A3A3A', fontSize: 11, padding: 0 }}
            >
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        }
      >
        Operations
      </CardHead>

      {/* Always-visible key rows */}
      <FieldRow label="Arrival"  value={ob.arrivalPressure} />
      <FieldRow label="Seating"  value={seatingIntelligence?.totalGuests > 0
        ? `${seatingIntelligence.seatedCount}/${seatingIntelligence.totalGuests} seated (${seatingIntelligence.seatingCompletion}%)`
        : ob.seatingSummary}
      />
      <FieldRow label="Tasks"    value={ob.taskSummary} />

      {primaryBottle && primaryBottle !== 'None' && (
        <FieldRow label="Bottleneck" value={primaryBottle} />
      )}

      {/* Expanded: coordination tiles + timeline pressures */}
      {expanded && (
        <>
          {/* Department readiness tiles */}
          {coordinationAssessment && (
            <div style={{ padding: '10px 14px', borderTop: '1px solid #1A1A1A', display: 'flex', gap: 8 }}>
              {[
                { key: 'eventsManager', label: 'Events' },
                { key: 'bar',           label: 'Bar' },
                { key: 'kitchen',       label: 'Kitchen' },
              ].map(d => {
                const pct = coordinationAssessment.readinessBreakdown?.[d.key] ?? 0
                const col = pct >= 75 ? '#6BAF80' : pct >= 45 ? '#C9A96E' : '#D4943A'
                return (
                  <div key={d.key} style={{ flex: 1, padding: '6px 8px', borderRadius: 5, border: `1px solid #1E1E1E`, background: '#0D0D0D', textAlign: 'center' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#5A5550', marginBottom: 3 }}>{d.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: col, fontFamily: '"JetBrains Mono", monospace' }}>{pct}%</div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Timeline pressure points */}
          {ti?.pressurePoints?.length > 0 && (
            <div style={{ borderTop: '1px solid #1A1A1A' }}>
              <div style={{ padding: '6px 14px 2px', fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5550' }}>
                Pressure points
              </div>
              {ti.pressurePoints.slice(0, 3).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 14px', borderBottom: '1px solid #141414' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, marginTop: 5, background: TL_SEVERITY_COLOR[p.severity] ?? '#5A5550', display: 'inline-block' }} />
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#E8DCC0' }}>{p.title}</div>
                    <div style={{ fontSize: 9.5, color: '#9A9590', lineHeight: 1.5 }}>{p.description}</div>
                    <div style={{ fontSize: 9, color: '#5A5550', fontStyle: 'italic' }}>→ {p.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Service Director Summary */}
          {ti?.serviceDirectorSummary && (
            <div style={{ padding: '8px 14px', borderTop: '1px solid #1A1A1A', fontSize: 11, color: '#9A9590', lineHeight: 1.65, fontStyle: 'italic' }}>
              {ti.serviceDirectorSummary}
            </div>
          )}
        </>
      )}

      {canAccessArchitect && onOpenArchitect && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid #1A1A1A' }}>
          <GhostButton onClick={onOpenArchitect}>Open Event Architect →</GhostButton>
        </div>
      )}
    </Card>
  )
}
