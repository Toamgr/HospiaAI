import React from 'react'
import { ZMark } from '../utils/zoharDisplayUtils'

export default function ZoharBriefHeader({ eventName, eventTypeLabel, daysUntil }) {
  const daysColor = daysUntil === null ? '#5A5550'
    : daysUntil < 0   ? '#5A5550'
    : daysUntil <= 7  ? '#D4943A'
    : '#9A9590'

  const daysLabel = daysUntil === null ? null
    : daysUntil < 0   ? `${Math.abs(daysUntil)}d ago`
    : daysUntil === 0 ? 'Today'
    : `${daysUntil}d`

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0 4px' }}>
      <ZMark />
      <div>
        <div style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 18, fontWeight: 700, color: '#F5F0E8', lineHeight: 1.1 }}>
          Zohar
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C9A96E', opacity: 0.7 }}>
          Event Director Brief
        </div>
      </div>

      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
        <div style={{ fontSize: 11, color: '#5A5550' }}>
          {eventName && (
            <span style={{ color: '#9A9590', fontWeight: 500 }}>{eventName}</span>
          )}
          {eventTypeLabel && (
            <span style={{ color: '#3A3A3A', marginLeft: 6, fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
              {eventTypeLabel}
            </span>
          )}
        </div>
        {daysLabel && (
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 700, color: daysColor, marginTop: 1 }}>
            {daysLabel}
            <span style={{ fontSize: 8, color: '#3A3A3A', letterSpacing: '0.10em', textTransform: 'uppercase', marginLeft: 5 }}>to event</span>
          </div>
        )}
      </div>
    </div>
  )
}
