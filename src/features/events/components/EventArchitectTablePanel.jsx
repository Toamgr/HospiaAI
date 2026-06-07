import React, { useState } from 'react'

const SHAPE_TYPES = [
  { key: 'round',    label: 'Round' },
  { key: 'long',     label: 'Long' },
  { key: 'cocktail', label: 'Cocktail' },
  { key: 'vip',      label: 'VIP' },
]

function PanelLabel({ children }) {
  return (
    <div style={{
      fontSize: 7.5, fontWeight: 700, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: '#3A3A3A', marginBottom: 5,
    }}>
      {children}
    </div>
  )
}

export default function EventArchitectTablePanel({
  table,
  onRename,
  onCapacityChange,
  onTypeChange,
  onDuplicate,
  onDelete,
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  if (!table) return null

  const shape = table.shape ?? 'round'
  const capacity = table.capacity ?? 1

  return (
    <div style={{
      background: '#0A0A0A',
      border: '1px solid #1A1A1A',
      borderRadius: 8,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid #141414',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 8, fontWeight: 700, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: '#C9A96E', opacity: 0.7,
        }}>
          Table {table.id}
        </span>
        <span style={{ fontSize: 8, color: '#2A2A2A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Edit
        </span>
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Label */}
        <div>
          <PanelLabel>Label</PanelLabel>
          <input
            type="text"
            value={table.label ?? ''}
            onChange={e => onRename(table.id, e.target.value || undefined)}
            placeholder={`Table ${table.id}`}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: '#141414', border: '1px solid #242424',
              borderRadius: 4, padding: '5px 8px',
              fontSize: 11, color: '#C9A96E', outline: 'none',
              fontFamily: 'inherit',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.35)' }}
            onBlur={e => { e.target.style.borderColor = '#242424' }}
          />
        </div>

        {/* Type */}
        <div>
          <PanelLabel>Type</PanelLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            {SHAPE_TYPES.map(type => {
              const active = shape === type.key
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => onTypeChange(table.id, type.key)}
                  style={{
                    padding: '4px 6px', borderRadius: 4,
                    fontSize: 9, fontWeight: 700,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 100ms ease',
                    border: active ? '1px solid rgba(201,169,110,0.45)' : '1px solid #1E1E1E',
                    background: active ? 'rgba(201,169,110,0.10)' : '#141414',
                    color: active ? '#C9A96E' : '#4A4540',
                  }}
                >
                  {type.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Capacity */}
        <div>
          <PanelLabel>Capacity</PanelLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => onCapacityChange(table.id, Math.max(1, capacity - 1))}
              style={{
                width: 24, height: 24, borderRadius: 4,
                border: '1px solid #242424', background: '#141414',
                color: '#7A7570', fontSize: 16, lineHeight: 1,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              −
            </button>
            <span style={{
              fontSize: 16, fontWeight: 700, color: '#C9A96E',
              fontFamily: '"JetBrains Mono", monospace',
              minWidth: 32, textAlign: 'center',
            }}>
              {capacity}
            </span>
            <button
              type="button"
              onClick={() => onCapacityChange(table.id, Math.min(40, capacity + 1))}
              style={{
                width: 24, height: 24, borderRadius: 4,
                border: '1px solid #242424', background: '#141414',
                color: '#7A7570', fontSize: 16, lineHeight: 1,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        padding: '8px 12px 10px',
        borderTop: '1px solid #141414',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <button
          type="button"
          onClick={() => { onDuplicate(table.id); setDeleteConfirm(false) }}
          style={{
            padding: '5px 10px', borderRadius: 4,
            fontSize: 9, fontWeight: 700,
            letterSpacing: '0.10em', textTransform: 'uppercase',
            cursor: 'pointer', textAlign: 'left',
            border: '1px solid #242424', background: '#141414', color: '#7A7570',
            width: '100%',
          }}
        >
          Duplicate Table
        </button>

        {deleteConfirm ? (
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              type="button"
              onClick={() => { onDelete(table.id); setDeleteConfirm(false) }}
              style={{
                flex: 1, padding: '5px 8px', borderRadius: 4,
                fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', cursor: 'pointer',
                border: '1px solid rgba(180,70,70,0.5)',
                background: 'rgba(180,70,70,0.10)', color: '#c05050',
              }}
            >
              Confirm Delete
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirm(false)}
              style={{
                padding: '5px 10px', borderRadius: 4,
                fontSize: 9, fontWeight: 700,
                cursor: 'pointer',
                border: '1px solid #242424', background: '#141414', color: '#5A5550',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            style={{
              padding: '5px 10px', borderRadius: 4,
              fontSize: 9, fontWeight: 700,
              letterSpacing: '0.10em', textTransform: 'uppercase',
              cursor: 'pointer', textAlign: 'left',
              border: '1px solid rgba(180,70,70,0.18)',
              background: 'transparent', color: '#804040',
              width: '100%',
            }}
          >
            Delete Table
          </button>
        )}
      </div>
    </div>
  )
}
