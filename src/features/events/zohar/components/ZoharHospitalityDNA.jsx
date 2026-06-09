import React from 'react'
import { Card, CardHead } from '../utils/zoharDisplayUtils'

// Compact 4-row DNA card: expectation, emotional risk, operational priority, what to confirm.
// Displays hospitalityRead from the hardened DNA layer.
// Does not repeat data shown elsewhere; exists to give Zohar a clear hospitality frame.

function DNARow({ label, value, accent }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '7px 14px', borderBottom: '1px solid #141414', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5A5550', flexShrink: 0, width: 80, paddingTop: 2 }}>
        {label}
      </span>
      <span style={{ fontSize: 11, color: accent || '#9A9590', lineHeight: 1.55, flex: 1 }}>
        {value || '—'}
      </span>
    </div>
  )
}

export default function ZoharHospitalityDNA({ hospitalityDNA }) {
  if (!hospitalityDNA) return null

  const { hospitalityRead, eventSubtype, subtypeConfidence, subtypeIsDerived } = hospitalityDNA
  if (!hospitalityRead) return null

  const subtypeLabel = eventSubtype !== 'other'
    ? eventSubtype.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null

  return (
    <Card>
      <CardHead
        right={
          subtypeLabel ? (
            <span style={{
              fontSize: 8, letterSpacing: '0.10em', textTransform: 'uppercase',
              color: subtypeIsDerived ? '#5A5550' : '#C9A96E',
              background: subtypeIsDerived ? 'rgba(90,85,80,0.12)' : 'rgba(201,169,110,0.07)',
              border: `1px solid ${subtypeIsDerived ? '#2A2A2A' : 'rgba(201,169,110,0.22)'}`,
              borderRadius: 100, padding: '2px 8px',
            }}>
              {subtypeLabel}{subtypeIsDerived ? ' ·inferred' : ''}
            </span>
          ) : null
        }
      >
        Hospitality Read
      </CardHead>

      <DNARow label="Guest expects"  value={hospitalityRead.guestExpectation} />
      <DNARow label="Emotional risk" value={hospitalityRead.emotionalRisk}    accent="#C9A96E" />
      <DNARow label="Priority"       value={hospitalityRead.operationalPriority} />
      <DNARow label="Confirm"        value={hospitalityRead.toConfirm}        accent="#D4943A" />
    </Card>
  )
}
