import React from 'react'
import { Card, CardHead, ScoreBar, scoreTextColor, scoreColor } from '../utils/zoharDisplayUtils'

// Shows readiness score + the 3 most critical status indicators.
// Kept compact: score bar + max 3 signal rows.

function SignalRow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 14px', borderBottom: '1px solid #141414' }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#5A5550' }}>{label}</span>
      <span style={{ fontSize: 10.5, color: accent || '#9A9590', fontWeight: accent ? 600 : 400 }}>{value}</span>
    </div>
  )
}

export default function ZoharReadinessSummary({ brief, riskAssessment }) {
  if (!brief) return null

  const { readinessScore, readinessLabel, eventName, eventTypeLabel } = brief
  const numColor = scoreTextColor(readinessScore)
  const barColor = scoreColor(readinessScore)

  const riskLevel  = riskAssessment?.overallRiskLevel ?? null
  const riskColor  = riskLevel === 'Critical' ? '#c05050' : riskLevel === 'High' ? '#D4943A' : riskLevel === 'Medium' ? '#C9A96E' : '#6BAF80'

  const missingCount = brief.missingInputs?.length ?? 0
  const pendingTasks = (brief.operationsBrief?.taskSummary || '').match(/(\d+)\s+task/)
  const pendingNum   = pendingTasks ? Number(pendingTasks[1]) : null

  return (
    <Card>
      <CardHead>{eventName} — {eventTypeLabel}</CardHead>

      {/* Score */}
      <div style={{ padding: '12px 14px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 26, fontWeight: 700, color: numColor, lineHeight: 1 }}>
              {readinessScore}
            </span>
            <span style={{ fontSize: 9, color: '#5A5550', letterSpacing: '0.10em', textTransform: 'uppercase', marginLeft: 6 }}>/ 100</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: numColor }}>{readinessLabel}</span>
        </div>
        <ScoreBar score={readinessScore} color={barColor} />
      </div>

      {/* Up to 3 key status signals */}
      {riskLevel && (
        <SignalRow label="Risk level" value={riskLevel} accent={riskColor} />
      )}
      {missingCount > 0 && (
        <SignalRow label="Missing inputs" value={`${missingCount} item${missingCount !== 1 ? 's' : ''}`} accent="#D4943A" />
      )}
      {pendingNum !== null && pendingNum > 0 && (
        <SignalRow label="Pending tasks" value={pendingNum} accent={pendingNum > 3 ? '#C9A96E' : '#9A9590'} />
      )}
    </Card>
  )
}
