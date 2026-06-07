import React, { useEffect } from 'react'
import { buildRecommendations } from '../utils/zoharRecommendations'
import { BAR_PROGRAMME, STAFF_NOTIFICATIONS } from '../data/eventBrainDemoData'
import { computeGuestCapacity, computeAccessibilityScore } from '../utils/eventArchitectMetrics'
import { calculateStaff, formatCurrency, calculateBudget } from '../utils/eventBrainCalculations'

// Inject print-only CSS while this component is mounted
function usePrintStyles() {
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'hestia-print-brief-styles'
    style.textContent = `
      @media print {
        body > * { visibility: hidden !important; }
        #hestia-print-brief-root,
        #hestia-print-brief-root * { visibility: visible !important; }
        #hestia-print-brief-root {
          display: block !important;
          position: fixed !important;
          inset: 0 !important;
          z-index: 99999 !important;
          background: #ffffff !important;
          padding: 32px 48px !important;
          font-family: Georgia, "Times New Roman", serif !important;
          font-size: 11pt !important;
          line-height: 1.6 !important;
          overflow: visible !important;
        }
        #hestia-print-brief-root,
        #hestia-print-brief-root * {
          color: #1a1612 !important;
          background: transparent !important;
          border-color: #cccccc !important;
        }
        #hestia-print-brief-root div[style*="background: #141414"],
        #hestia-print-brief-root div[style*="#141414"] {
          border: 1px solid #cccccc !important;
        }
        .hestia-brief-modal-chrome { display: none !important; }
      }
    `
    document.head.appendChild(style)
    return () => {
      const el = document.getElementById('hestia-print-brief-styles')
      if (el) el.remove()
    }
  }, [])
}

function BriefRow({ label, value, alert }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <div
        style={{
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#3A3A3A',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: alert ? '#C17F2A' : '#F5F0E8',
          lineHeight: 1.3,
        }}
      >
        {value ?? '—'}
      </div>
    </div>
  )
}

function SectionHead({ children }) {
  return (
    <div
      style={{
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: '#5A5550',
        marginBottom: 10,
        paddingBottom: 4,
        borderBottom: '1px solid #2A2A2A',
      }}
    >
      {children}
    </div>
  )
}

function Section({ children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {children}
    </div>
  )
}

export default function EventArchitectPrintableBrief({ tables, eventBrief, onClose }) {
  usePrintStyles()

  const b = eventBrief
  const recs = buildRecommendations(tables, b)
  const highRecs = recs.filter(r => r.priority === 'high')
  const capacity = computeGuestCapacity(tables, b)
  const accessScore = computeAccessibilityScore(tables, b)
  const staff = calculateStaff(b.totalGuests, b.barType, b.format, b.accessibility)
  const budget = calculateBudget(b.totalGuests, b.budgetPerPerson ?? 0)
  const unresolved = capacity.unresolved ?? 0

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

      {/* Modal chrome (hidden during print) */}
      <div
        className="hestia-brief-modal-chrome"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(660px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 64px)',
          overflowY: 'auto',
          background: '#1A1A1A',
          border: '1px solid #3A3A3A',
          borderRadius: 10,
          zIndex: 901,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal header bar */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid #2A2A2A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexShrink: 0,
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
                marginBottom: 4,
              }}
            >
              Export Brief
            </div>
            <div
              style={{
                fontFamily: '"Playfair Display", "Georgia", serif',
                fontSize: 18,
                fontWeight: 700,
                color: '#F5F0E8',
                lineHeight: 1.2,
              }}
            >
              Event Architect Brief
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16, alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                background: '#C9A96E',
                color: '#0D0D0D',
                border: 'none',
                borderRadius: 4,
                padding: '8px 18px',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#D4B87A' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C9A96E' }}
            >
              Print Brief
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #2A2A2A',
                borderRadius: 4,
                color: '#5A5550',
                cursor: 'pointer',
                padding: '8px 12px',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                transition: 'border-color 150ms ease',
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Brief body (scrollable in modal) */}
        <div style={{ padding: '20px 24px 24px', overflowY: 'auto', flex: 1 }}>
          <BriefContent
            b={b}
            highRecs={highRecs}
            capacity={capacity}
            accessScore={accessScore}
            staff={staff}
            budget={budget}
            unresolved={unresolved}
          />
        </div>
      </div>

      {/* Print-only root — invisible in modal, full-page during print */}
      <div id="hestia-print-brief-root" style={{ display: 'none' }}>
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #c9a96e' }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#888',
              marginBottom: 4,
            }}
          >
            HESTIA Event Architect Studio
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Event Architect Brief</div>
        </div>
        <BriefContent
          b={b}
          highRecs={highRecs}
          capacity={capacity}
          accessScore={accessScore}
          staff={staff}
          budget={budget}
          unresolved={unresolved}
          printMode
        />
      </div>
    </>
  )
}

function BriefContent({ b, highRecs, capacity, accessScore, staff, budget, unresolved, printMode }) {
  const rowStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px 16px',
    marginBottom: 0,
  }

  return (
    <div style={{ color: printMode ? '#1a1612' : 'inherit' }}>
      {/* Event header */}
      <Section>
        <div
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: printMode ? 16 : 17,
            fontWeight: 700,
            color: printMode ? '#1a1612' : '#F5F0E8',
            marginBottom: 12,
          }}
        >
          {b.title}
        </div>
        <div style={rowStyle}>
          <BriefRow label="Date" value={b.date} />
          <BriefRow label="Venue" value="Kahi Event Resort" />
          <BriefRow label="Total Guests" value={`${b.totalGuests} invited`} />
          <BriefRow label="Service Style" value={b.serviceStyle} />
          <BriefRow label="Bar Programme" value={b.barType} />
          <BriefRow label="Event Format" value={b.format} />
        </div>
        {Array.isArray(b.dietary) && b.dietary.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <BriefRow label="Dietary" value={b.dietary.join(' · ')} />
          </div>
        )}
      </Section>

      {/* Accessibility */}
      <Section>
        <SectionHead>Accessibility</SectionHead>
        <div style={rowStyle}>
          <BriefRow label="Wheelchair Spaces" value={b.accessibility?.wheelchairs ?? 0} />
          <BriefRow label="Baby Chairs" value={b.accessibility?.babyChairs ?? 0} />
          <BriefRow label="Elderly Guests" value={b.accessibility?.elderly ?? 0} />
          <BriefRow label="Step-Free Route" value={b.accessibility?.stepFree ? 'Required' : 'Not specified'} />
          <BriefRow label="Quiet Family Zone" value={b.accessibility?.quietFamilyZone ? 'Active' : 'No'} />
        </div>
      </Section>

      {/* Capacity summary */}
      <Section>
        <SectionHead>Guest Capacity</SectionHead>
        <div style={rowStyle}>
          <BriefRow label="Seated" value={capacity.seated ?? '—'} />
          <BriefRow label="Invited" value={capacity.invited ?? '—'} />
          <BriefRow label="Unresolved" value={unresolved} alert={unresolved > 0} />
          <BriefRow label="Accessibility Score" value={accessScore !== null ? `${accessScore} / 100` : '—'} />
          <BriefRow label="Staff Recommended" value={staff ? `${staff.total} total` : '—'} />
          <BriefRow
            label="Estimated Budget"
            value={b.budgetPerPerson ? formatCurrency(budget.total, b.currency ?? '') : '—'}
          />
        </div>
      </Section>

      {/* Key Zohar signals — high priority only */}
      {highRecs.length > 0 && (
        <Section>
          <SectionHead>Zohar Intelligence — High Priority Signals</SectionHead>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {highRecs.map(rec => (
              <div
                key={rec.id}
                style={{
                  padding: '8px 10px',
                  background: '#141414',
                  borderRadius: 4,
                  borderLeft: '2px solid rgba(201,169,110,0.40)',
                }}
              >
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#8B7355',
                    marginBottom: 4,
                  }}
                >
                  {rec.tag}
                </div>
                <p style={{ fontSize: 10, lineHeight: 1.65, color: '#9A9590', margin: 0 }}>
                  {rec.text}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Bar programme */}
      <Section>
        <SectionHead>Bar Programme</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#5A5550',
                marginBottom: 6,
              }}
            >
              Cocktails
            </div>
            {BAR_PROGRAMME.cocktails.map(c => (
              <div key={c} style={{ fontSize: 10, color: '#9A9590', padding: '2px 0' }}>
                {c}
              </div>
            ))}
          </div>
          <div>
            <div
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#5A5550',
                marginBottom: 6,
              }}
            >
              Mocktails
            </div>
            {BAR_PROGRAMME.mocktails.map(m => (
              <div key={m} style={{ fontSize: 10, color: '#9A9590', padding: '2px 0' }}>
                {m}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Staff assignments */}
      <Section>
        <SectionHead>Staff Assignments</SectionHead>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 16px' }}>
          {STAFF_NOTIFICATIONS.map(s => (
            <BriefRow
              key={s.name}
              label={s.name}
              value={`${s.role} — ${s.assignment}`}
            />
          ))}
        </div>
      </Section>

      {/* Demo disclaimer */}
      <div
        style={{
          padding: '10px 12px',
          background: 'rgba(90,84,80,0.10)',
          borderRadius: 4,
          border: '1px solid #2A2A2A',
        }}
      >
        <p
          style={{
            fontSize: 9,
            color: '#5A5550',
            margin: 0,
            fontStyle: 'italic',
            lineHeight: 1.65,
          }}
        >
          Demo-only Event Architect brief. No real messages were sent. All data is illustrative
          simulation content for the HESTIA Event Architect Studio. Names, financial figures, and
          event details are fictional.
        </p>
      </div>
    </div>
  )
}
