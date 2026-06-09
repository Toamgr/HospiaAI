import React, { useState } from 'react'
import { Card, CardHead, FieldRow, CopyButton } from '../utils/zoharDisplayUtils'

// Compact food brief card. 3 key fields always visible; expand for full detail.

export default function ZoharFoodBriefCard({ brief }) {
  const [expanded, setExpanded] = useState(false)
  const fb = brief?.foodMenuBrief
  if (!fb) return null

  return (
    <Card>
      <CardHead
        right={
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3A3A3A', fontSize: 11, padding: 0 }}
          >
            {expanded ? '▲' : '▼'}
          </button>
        }
      >
        Kitchen · F&amp;B
      </CardHead>

      <FieldRow label="Guests"   value={fb.guestCount ?? '—'} />
      <FieldRow label="Format"   value={fb.serviceFormat} />
      <FieldRow label="Kosher"   value={fb.kosherRequirement} />

      {expanded && (
        <>
          <FieldRow label="Confirmed"  value={fb.confirmedCount || null} />
          <FieldRow label="Dietary"    value={fb.dietaryNotes || 'None recorded'} />
          <FieldRow label="Window"     value={fb.timing} />
          <div style={{ padding: '10px 14px', background: '#0D0D0D', borderTop: '1px solid #1A1A1A' }}>
            <p style={{ fontSize: 11, lineHeight: 1.75, color: '#9A9590', margin: '0 0 8px', borderLeft: '2px solid rgba(201,169,110,0.22)', paddingLeft: 10 }}>
              {fb.outputRequestText}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <CopyButton text={fb.outputRequestText} label="Copy brief" />
            </div>
          </div>
        </>
      )}
    </Card>
  )
}
