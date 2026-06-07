import React, { useState } from 'react'
import { getGuestsAtTable } from '../utils/seatingIntelligence'

const RSVP_COLOR = {
  confirmed: '#4F6B4A',
  maybe:     '#C9A96E',
  pending:   '#5A5550',
  declined:  '#804040',
}

function PanelLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3A3A3A' }}>
        {children}
      </span>
      {right && <span style={{ fontSize: 8, color: '#3A3A3A', fontWeight: 600 }}>{right}</span>}
    </div>
  )
}

function GuestRow({ guest, isAssigned, onAssign, onUnassign }) {
  const dot = RSVP_COLOR[guest.rsvp_status] ?? '#5A5550'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0', minWidth: 0 }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: dot, flexShrink: 0, display: 'inline-block' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#E8DCC0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {guest.name}
        </div>
        {guest.dietary && (
          <div style={{ fontSize: 8, color: '#4A4540', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {guest.dietary}
          </div>
        )}
      </div>
      {isAssigned ? (
        <button
          type="button"
          onClick={() => onUnassign(guest.id)}
          title="Remove from table"
          style={{
            padding: '1px 6px', borderRadius: 3, fontSize: 11,
            cursor: 'pointer', border: '1px solid #242424',
            background: 'transparent', color: '#4A4540', flexShrink: 0, lineHeight: 1.2,
          }}
        >
          ×
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onAssign(guest.id)}
          title="Assign to selected table"
          style={{
            padding: '2px 7px', borderRadius: 3, fontSize: 8, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            cursor: 'pointer', flexShrink: 0,
            border: '1px solid rgba(201,169,110,0.22)',
            background: 'transparent', color: '#C9A96E',
          }}
        >
          +
        </button>
      )}
    </div>
  )
}

export default function EventArchitectGuestPanel({
  selectedTable,
  guests,
  onAssignGuest,
  onUnassignGuest,
  seatingIntelligence,
}) {
  const [showUnassigned, setShowUnassigned] = useState(false)

  const hasGuests  = Array.isArray(guests) && guests.length > 0
  const seated     = selectedTable ? getGuestsAtTable(guests, selectedTable.id) : []
  const unassigned = seatingIntelligence?.unassignedGuests ?? []
  const capacity   = selectedTable?.capacity ?? 0
  const overCap    = seated.length > capacity

  const completion = seatingIntelligence?.seatingCompletion ?? null

  return (
    <div style={{ background: '#0A0A0A', border: '1px solid #1A1A1A', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px', borderBottom: '1px solid #141414',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C9A96E', opacity: 0.7 }}>
          Seating
        </span>
        {completion !== null && (
          <span style={{
            fontSize: 8, fontWeight: 700,
            color: completion >= 80 ? '#4F6B4A' : completion >= 50 ? '#C9A96E' : '#804040',
          }}>
            {completion}% assigned
          </span>
        )}
      </div>

      <div style={{ padding: '8px 12px', maxHeight: 300, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#1E1E1E transparent' }}>

        {/* No table selected */}
        {!selectedTable && (
          <p style={{ fontSize: 10, color: '#3A3A3A', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
            Select a table on the floor plan to manage guest seating.
          </p>
        )}

        {/* Table selected but no guests exist for this event */}
        {selectedTable && !hasGuests && (
          <p style={{ fontSize: 10, color: '#3A3A3A', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>
            No guests in this event's guest list yet.
          </p>
        )}

        {/* Table selected + guests available */}
        {selectedTable && hasGuests && (
          <>
            {/* Table capacity row */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#5A5550', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
                {selectedTable.label || `Table ${selectedTable.id}`}
              </div>
              <div style={{ fontSize: 9, color: overCap ? '#c05050' : '#3A3A3A' }}>
                {seated.length} / {capacity} seats filled
                {overCap ? ' · Over capacity' : seated.length === capacity ? ' · Full' : ''}
              </div>
            </div>

            {/* Seated guests */}
            <PanelLabel right={seated.length > 0 ? String(seated.length) : null}>
              Seated here
            </PanelLabel>
            {seated.length === 0 ? (
              <div style={{ fontSize: 9, color: '#3A3A3A', fontStyle: 'italic', marginBottom: 8 }}>
                No guests assigned to this table.
              </div>
            ) : (
              <div style={{ marginBottom: 8 }}>
                {seated.map(g => (
                  <GuestRow
                    key={g.id}
                    guest={g}
                    isAssigned
                    onAssign={() => {}}
                    onUnassign={onUnassignGuest}
                  />
                ))}
              </div>
            )}

            {/* Unassigned guests */}
            {unassigned.length > 0 && (
              <div style={{ borderTop: '1px solid #141414', paddingTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowUnassigned(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0',
                    background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#3A3A3A' }}>
                    {showUnassigned ? '▾' : '▸'} Unassigned ({unassigned.length})
                  </span>
                </button>

                {showUnassigned && (
                  <div style={{ paddingTop: 4 }}>
                    {unassigned.slice(0, 40).map(g => (
                      <GuestRow
                        key={g.id}
                        guest={g}
                        isAssigned={false}
                        onAssign={onAssignGuest}
                        onUnassign={() => {}}
                      />
                    ))}
                    {unassigned.length > 40 && (
                      <div style={{ fontSize: 9, color: '#3A3A3A', fontStyle: 'italic', paddingTop: 4 }}>
                        +{unassigned.length - 40} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
