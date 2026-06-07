import React from 'react'

const VALUE_CARDS = [
  {
    key: 'guest',
    eyebrow: 'Guest Experience',
    body: 'Understand guest flow, arrival pressure, and accessibility routes before the event begins. Eliminate layout surprises that degrade the first impression.',
  },
  {
    key: 'flow',
    eyebrow: 'Operational Flow',
    body: 'Map service corridors, kitchen-to-table runner routes, and bar coverage zones. Brief your team with precision, not guesswork.',
  },
  {
    key: 'access',
    eyebrow: 'Accessibility Confidence',
    body: 'Identify step-free paths, wheelchair zones, and quiet family areas on the floor plan. Confirm compliance before guests arrive.',
  },
  {
    key: 'value',
    eyebrow: 'Investor / Pilot Value',
    body: 'Demonstrate a scalable intelligent planning model that high-end venues and hospitality groups can adopt across multiple events and properties.',
  },
]

export default function EventArchitectVisionModal({ onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(4px)',
          zIndex: 900,
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Why This Matters"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(600px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          background: '#1A1A1A',
          border: '1px solid #3A3A3A',
          borderRadius: 10,
          padding: 32,
          zIndex: 901,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: '#C9A96E',
                opacity: 0.7,
                marginBottom: 6,
              }}
            >
              HESTIA Event Architect Studio
            </div>
            <h2
              style={{
                fontFamily: '"Playfair Display", "Georgia", serif',
                fontSize: 22,
                fontWeight: 700,
                color: '#F5F0E8',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Why This Matters
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #2A2A2A',
              borderRadius: 4,
              color: '#5A5550',
              cursor: 'pointer',
              padding: '6px 12px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              flexShrink: 0,
              marginLeft: 16,
              transition: 'border-color 150ms ease, color 150ms ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#3A3A3A'
              e.currentTarget.style.color = '#9A9590'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2A2A2A'
              e.currentTarget.style.color = '#5A5550'
            }}
          >
            Close
          </button>
        </div>

        {/* Core paragraph */}
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.75,
            color: '#9A9590',
            margin: '0 0 24px',
            paddingBottom: 24,
            borderBottom: '1px solid #2A2A2A',
          }}
        >
          HESTIA Event Architect turns the event floor plan into an operating brain. It helps venues
          understand guest flow, accessibility, bar placement, service routes, family and VIP zones,
          setup complexity, and operational risk before the event begins.
        </p>

        {/* Value cards — 2×2 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            marginBottom: 24,
          }}
        >
          {VALUE_CARDS.map(card => (
            <div
              key={card.key}
              style={{
                background: '#141414',
                border: '1px solid #2A2A2A',
                borderRadius: 6,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: '#C9A96E',
                  opacity: 0.8,
                  marginBottom: 8,
                }}
              >
                {card.eyebrow}
              </div>
              <p
                style={{
                  fontSize: 11,
                  lineHeight: 1.65,
                  color: '#5A5550',
                  margin: 0,
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p
          style={{
            fontSize: 9.5,
            color: '#3A3A3A',
            fontStyle: 'italic',
            textAlign: 'center',
            margin: 0,
          }}
        >
          HESTIA Event Architect is a live simulation model — not a seating chart, but an operating brain.
        </p>
      </div>
    </>
  )
}
