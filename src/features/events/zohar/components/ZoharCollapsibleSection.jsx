import React, { useState } from 'react'
import { Card, CardHead } from '../utils/zoharDisplayUtils'

export default function ZoharCollapsibleSection({ title, right, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card>
      <CardHead
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {right}
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3A3A3A', fontSize: 11, padding: 0, lineHeight: 1 }}
            >
              {open ? '▲' : '▼'}
            </button>
          </div>
        }
      >
        {title}
      </CardHead>
      {open && children}
    </Card>
  )
}
