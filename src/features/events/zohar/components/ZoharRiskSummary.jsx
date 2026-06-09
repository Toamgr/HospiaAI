import React, { useState } from 'react'
import { Card, CardHead, ScoreBar, severityColor } from '../utils/zoharDisplayUtils'

const RISK_LEVEL_COLOR = { Critical: '#c05050', High: '#D4943A', Medium: '#C9A96E', Low: '#6BAF80' }

function RiskRow({ risk }) {
  const dotColor = severityColor(risk.severity)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 14px', borderBottom: '1px solid #141414' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, marginTop: 4, background: dotColor, display: 'inline-block' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: '#E8DCC0', lineHeight: 1.3 }}>{risk.title}</span>
          <span style={{ fontSize: 8, color: '#3A3A3A', textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>{risk.category}</span>
        </div>
        <div style={{ fontSize: 10, color: '#9A9590', lineHeight: 1.5, marginBottom: 2 }}>{risk.description}</div>
        <div style={{ fontSize: 9, color: '#5A5550', fontStyle: 'italic' }}>→ {risk.recommendation}</div>
      </div>
    </div>
  )
}

export default function ZoharRiskSummary({ riskAssessment }) {
  const [expanded, setExpanded] = useState(false)

  if (!riskAssessment || !riskAssessment.risks?.length) return null

  const levelColor     = RISK_LEVEL_COLOR[riskAssessment.overallRiskLevel] ?? '#5A5550'
  const visibleRisks   = expanded ? riskAssessment.risks : riskAssessment.risks.slice(0, 2)
  const hasMore        = riskAssessment.risks.length > 2

  return (
    <Card>
      <CardHead
        right={
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', padding: '2px 10px', borderRadius: 100, background: `${levelColor}18`, color: levelColor, border: `1px solid ${levelColor}40` }}>
            {riskAssessment.overallRiskLevel} · {riskAssessment.riskScore}/100
          </span>
        }
      >
        Risks
      </CardHead>

      <ScoreBar score={riskAssessment.riskScore} color={levelColor} />

      <div style={{ paddingBottom: 2 }}>
        {visibleRisks.map(r => <RiskRow key={r.id} risk={r} />)}
      </div>

      {hasMore && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid #1A1A1A' }}>
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5A5550', fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', padding: 0 }}
          >
            {expanded ? `▲ Show less` : `▼ ${riskAssessment.risks.length - 2} more risk${riskAssessment.risks.length - 2 !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {riskAssessment.nextBestAction && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid #1A1A1A' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C9A96E', marginBottom: 5 }}>
            Next best action
          </div>
          <div style={{ fontSize: 11, color: '#F5F0E8', lineHeight: 1.5 }}>{riskAssessment.nextBestAction}</div>
        </div>
      )}
    </Card>
  )
}
