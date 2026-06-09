import React from 'react'
import { Card, CardHead, GhostButton } from '../utils/zoharDisplayUtils'

// Shows the 2-3 most important actions Zohar recommends right now.
// Sources: riskAssessment.nextBestAction, coordinationAssessment.coordinationActions,
//          missingInputs (first item). Deduplicates and caps at 3.

function ActionRow({ index, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 14px', borderBottom: '1px solid #141414' }}>
      <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 700, color: '#C9A96E', flexShrink: 0, minWidth: 14 }}>
        {index + 1}
      </span>
      <span style={{ fontSize: 11, color: '#E8DCC0', lineHeight: 1.55 }}>{text}</span>
    </div>
  )
}

export default function ZoharNextActions({ brief, riskAssessment, coordinationAssessment, canAccessArchitect, onOpenArchitect }) {
  const actions = []

  if (riskAssessment?.nextBestAction) actions.push(riskAssessment.nextBestAction)

  const coordActions = coordinationAssessment?.coordinationActions || []
  for (const a of coordActions) {
    if (actions.length >= 3) break
    if (!actions.some(x => x === a)) actions.push(a)
  }

  // Pad from missing inputs if still under 3
  const missing = brief?.missingInputs || []
  for (const m of missing) {
    if (actions.length >= 3) break
    const text = `Set up: ${m}`
    if (!actions.some(x => x === text)) actions.push(text)
  }

  if (!actions.length) return null

  return (
    <Card>
      <CardHead>Next actions</CardHead>
      <div style={{ paddingBottom: 4 }}>
        {actions.slice(0, 3).map((a, i) => <ActionRow key={i} index={i} text={a} />)}
      </div>
      {canAccessArchitect && onOpenArchitect && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid #1A1A1A' }}>
          <GhostButton onClick={onOpenArchitect}>Open Event Architect →</GhostButton>
        </div>
      )}
    </Card>
  )
}
