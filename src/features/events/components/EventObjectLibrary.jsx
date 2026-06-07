import React from 'react'

const LIBRARY_SECTIONS = [
  {
    key: 'seating',
    label: 'Seating',
    items: [
      { key: 'round-8',          label: 'Round Table 8',          shape: 'round',   highlightFilter: t => t.shape === 'round' && t.capacity <= 8 },
      { key: 'round-10',         label: 'Round Table 10',         shape: 'round',   highlightFilter: t => t.shape === 'round' && t.capacity >= 10 },
      { key: 'long-table',       label: 'Long Royal Table',       shape: 'long',    highlightFilter: t => t.shape === 'long' },
      { key: 'family-table',     label: 'Family Table',           shape: 'long',    highlightFilter: t => !!t.label },
      { key: 'vip-table',        label: 'VIP Table',              shape: 'round',   highlightFilter: t => t.zone === 'vip' },
      { key: 'cocktail-standing',label: 'Cocktail Standing Table',shape: 'circle',  highlightFilter: null },
    ]
  },
  {
    key: 'chairs',
    label: 'Chairs',
    items: [
      { key: 'banquet-chair',    label: 'Classic Banquet Chair',  shape: 'chair',   highlightFilter: null },
      { key: 'wooden-chair',     label: 'Wooden Chair',           shape: 'chair',   highlightFilter: null },
      { key: 'ghost-chair',      label: 'Ghost Chair',            shape: 'chair',   highlightFilter: null },
      { key: 'sofa-lounge',      label: 'Sofa Lounge Chair',      shape: 'sofa',    highlightFilter: null },
      { key: 'baby-chair',       label: 'Baby Chair',             shape: 'circle',  highlightFilter: t => (t.babyChairs ?? 0) > 0 },
      { key: 'wheelchair',       label: 'Wheelchair Space',       shape: 'wc',      highlightFilter: null, overlayMode: 'accessibility' },
    ]
  },
  {
    key: 'stations',
    label: 'Hospitality Stations',
    items: [
      { key: 'main-bar',         label: 'Main Cocktail Bar',      shape: 'bar',     highlightFilter: null },
      { key: 'welcome-station',  label: 'Welcome Drink Station',  shape: 'station', highlightFilter: null },
      { key: 'wine-station',     label: 'Wine Station',           shape: 'station', highlightFilter: null },
      { key: 'coffee-cart',      label: 'Coffee Cart',            shape: 'circle',  highlightFilter: null },
      { key: 'dessert-station',  label: 'Dessert Station',        shape: 'station', highlightFilter: null },
      { key: 'water-station',    label: 'Water Station',          shape: 'station', highlightFilter: null },
      { key: 'hostess-desk',     label: 'Hostess / Reception Desk', shape: 'desk', highlightFilter: null },
    ]
  },
  {
    key: 'operations',
    label: 'Operations',
    items: [
      { key: 'service-path',       label: 'Service Path',         shape: 'path',    highlightFilter: null, overlayMode: 'service-flow' },
      { key: 'guest-flow',         label: 'Guest Flow',           shape: 'path',    highlightFilter: null, overlayMode: 'guest-flow' },
      { key: 'accessibility-route',label: 'Accessibility Route',  shape: 'access',  highlightFilter: null, overlayMode: 'accessibility' },
      { key: 'emergency-exit',     label: 'Emergency Exit',       shape: 'exit',    highlightFilter: null },
      { key: 'back-of-house',      label: 'Back-of-House',        shape: 'boh',     highlightFilter: null },
    ]
  }
]

// Expose the highlight filter and overlay mode by key for floor plan consumption
export const OBJECT_HIGHLIGHT_MAP = {}
for (const section of LIBRARY_SECTIONS) {
  for (const item of section.items) {
    OBJECT_HIGHLIGHT_MAP[item.key] = {
      highlightFilter: item.highlightFilter ?? null,
      overlayMode: item.overlayMode ?? null,
    }
  }
}

function ObjectIcon({ shape, active }) {
  const stroke = active ? '#C9A96E' : '#5A5550'
  const accessStroke = active ? '#4F6B4A' : '#5A5550'

  switch (shape) {
    case 'round':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="7" cy="7" r="5" stroke={stroke} strokeWidth="1.2" />
          <circle cx="7" cy="3"  r="1.2" fill={stroke} />
          <circle cx="11" cy="7" r="1.2" fill={stroke} />
          <circle cx="7" cy="11" r="1.2" fill={stroke} />
          <circle cx="3" cy="7"  r="1.2" fill={stroke} />
        </svg>
      )
    case 'long':
      return (
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="3" width="14" height="4" rx="1" stroke={stroke} strokeWidth="1.2" />
          <rect x="2" y="1" width="2" height="2" rx="0.5" stroke={stroke} strokeWidth="0.8" />
          <rect x="7" y="1" width="2" height="2" rx="0.5" stroke={stroke} strokeWidth="0.8" />
          <rect x="12" y="1" width="2" height="2" rx="0.5" stroke={stroke} strokeWidth="0.8" />
        </svg>
      )
    case 'circle':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="6" cy="6" r="4" stroke={stroke} strokeWidth="1.2" />
        </svg>
      )
    case 'chair':
      return (
        <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1.5" y="1" width="7" height="5" rx="1" stroke={stroke} strokeWidth="1.2" />
          <rect x="1.5" y="7.5" width="7" height="4" rx="0.5" stroke={stroke} strokeWidth="1.2" />
        </svg>
      )
    case 'sofa':
      return (
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="4.5" width="14" height="4.5" rx="1.5" stroke={stroke} strokeWidth="1.2" />
          <rect x="1" y="1" width="3.5" height="5" rx="1" stroke={stroke} strokeWidth="1.2" />
          <rect x="11.5" y="1" width="3.5" height="5" rx="1" stroke={stroke} strokeWidth="1.2" />
        </svg>
      )
    case 'wc':
      return (
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="6" cy="2" r="1.5" stroke={accessStroke} strokeWidth="1.2" />
          <path d="M4 4.5 C3 6 3 8 3 9.5" stroke={accessStroke} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8 4.5 C9 6 9 8 9 9.5" stroke={accessStroke} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M4 4.5 L8 4.5" stroke={accessStroke} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="9" cy="12" r="2" stroke={accessStroke} strokeWidth="1.2" />
        </svg>
      )
    case 'bar':
      return (
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="3.5" width="14" height="5.5" rx="1" stroke={stroke} strokeWidth="1.2" />
          <line x1="1" y1="6.5" x2="15" y2="6.5" stroke={stroke} strokeWidth="0.7" />
          <rect x="4" y="1" width="2.5" height="3" rx="0.5" stroke={stroke} strokeWidth="0.8" />
          <rect x="9.5" y="1" width="2.5" height="3" rx="0.5" stroke={stroke} strokeWidth="0.8" />
        </svg>
      )
    case 'station':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <rect x="2" y="2" width="8" height="8" rx="1" stroke={stroke} strokeWidth="1.2" />
          <line x1="6" y1="2" x2="6" y2="10" stroke={stroke} strokeWidth="0.7" />
          <line x1="2" y1="6" x2="10" y2="6" stroke={stroke} strokeWidth="0.7" />
        </svg>
      )
    case 'desk':
      return (
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="2" width="14" height="6" rx="1" stroke={stroke} strokeWidth="1.2" />
          <line x1="5" y1="2" x2="5" y2="8" stroke={stroke} strokeWidth="0.7" />
        </svg>
      )
    case 'path':
      return (
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2 8 Q 8 2 14 8" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
          <path d="M12 6 L 14 8 L 12 10" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0 -2)" />
        </svg>
      )
    case 'access':
      return (
        <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2 13 L 2 7 L 6 3 L 10 7 L 10 13" stroke={accessStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="6" cy="1.5" r="1.5" stroke={accessStroke} strokeWidth="1.2" />
        </svg>
      )
    case 'exit':
      return (
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="1" width="9" height="8" rx="1" stroke={stroke} strokeWidth="1.2" />
          <path d="M10 5 L 15 5" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M13 3 L 15 5 L 13 7" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'boh':
      return (
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="1" width="12" height="10" rx="1" stroke={stroke} strokeWidth="1.2" strokeDasharray="3 2" />
        </svg>
      )
    default:
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="6" cy="6" r="4" stroke={stroke} strokeWidth="1.2" />
        </svg>
      )
  }
}

export default function EventObjectLibrary({ activeType, onTypeChange }) {
  return (
    <div
      className="hidden xl:flex"
      style={{
        flexDirection: 'column',
        background: '#0A0A0A',
        border: '1px solid #1A1A1A',
        borderRadius: 8,
        minWidth: 164,
        maxWidth: 164,
        flexShrink: 0,
        alignSelf: 'flex-start',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 12px 8px',
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#3A3A3A',
          borderBottom: '1px solid #141414',
        }}
      >
        Object Library
      </div>

      {/* Sections */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {LIBRARY_SECTIONS.map((section, sIdx) => (
          <div key={section.key}>
            <div
              style={{
                padding: '8px 12px 3px',
                fontSize: 7.5,
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#2A2A2A',
              }}
            >
              {section.label}
            </div>

            {section.items.map(item => {
              const isActive = activeType === item.key
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onTypeChange(isActive ? null : item.key)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '4px 12px',
                    background: isActive ? 'rgba(201,169,110,0.07)' : 'transparent',
                    border: 'none',
                    borderLeft: `2px solid ${isActive ? '#C9A96E' : 'transparent'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 120ms ease',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'rgba(201,169,110,0.03)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <ObjectIcon shape={item.shape} active={isActive} />
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#C9A96E' : '#5A5550',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              )
            })}

            {sIdx < LIBRARY_SECTIONS.length - 1 && (
              <div style={{ height: 1, background: '#141414', margin: '4px 0 2px' }} />
            )}
          </div>
        ))}

        {/* Bottom hint */}
        <div
          style={{
            padding: '8px 12px 10px',
            fontSize: 8,
            color: '#2A2A2A',
            lineHeight: 1.5,
            borderTop: '1px solid #141414',
            marginTop: 4,
          }}
        >
          Select to highlight on floor plan
        </div>
      </div>
    </div>
  )
}
