import React from 'react'
import { Card, CardHead } from '../utils/zoharDisplayUtils'

export default function ZoharMissingInputs({ items }) {
  if (!items?.length) return null
  return (
    <Card>
      <CardHead>Missing inputs</CardHead>
      <div style={{ padding: '6px 0' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 14px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#D4943A', flexShrink: 0, marginTop: 5 }} />
            <span style={{ fontSize: 11, color: '#9A9590', lineHeight: 1.55 }}>{item}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
