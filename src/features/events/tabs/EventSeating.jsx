import React, { useState, useRef } from 'react'

const CANVAS_HEIGHT = 560

// ── Venue SVG — Kahi Event Resort ─────────────────────────────────

function KahiVenueSVG() {
  return (
    <svg
      viewBox="0 0 800 560"
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0 }}
    >
      <defs>
        <radialGradient id="ks-hallGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C9A96E" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#C9A96E" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ks-chuppahGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F5C842" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#F5C842" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow effects */}
      <ellipse cx="388" cy="262" rx="220" ry="168" fill="url(#ks-hallGlow)" />
      <ellipse cx="682" cy="112" rx="115" ry="115" fill="url(#ks-chuppahGlow)" />

      {/* ── Main Event Hall ── */}
      <rect x="210" y="135" width="355" height="250" rx="6" fill="#F5ECD7" stroke="#C9A96E" strokeWidth="1.5" />
      <text x="388" y="252" textAnchor="middle" fill="#C9A96E" fontSize="9" letterSpacing="2.5" opacity="0.9">MAIN EVENT HALL</text>

      {/* ── Garden Chuppah (top right) ── */}
      <circle cx="682" cy="112" r="70" fill="none" stroke="#C9A96E" strokeWidth="0.8" strokeDasharray="5 4" opacity="0.7" />
      <circle cx="682" cy="112" r="57" fill="#FFFBF2" stroke="#C9A96E" strokeWidth="1.5" />
      <text x="682" y="108" textAnchor="middle" fill="#9B7E4E" fontSize="8" letterSpacing="1.5">GARDEN</text>
      <text x="682" y="121" textAnchor="middle" fill="#9B7E4E" fontSize="8" letterSpacing="1.5">CHUPPAH</text>
      <text x="655" y="76"  fill="#C9A96E" fontSize="10" opacity="0.8">✦</text>
      <text x="707" y="76"  fill="#C9A96E" fontSize="10" opacity="0.8">✦</text>
      <text x="640" y="122" fill="#C9A96E" fontSize="7"  opacity="0.5">✦</text>
      <text x="720" y="122" fill="#C9A96E" fontSize="7"  opacity="0.5">✦</text>
      <text x="682" y="88"  textAnchor="middle" fill="#C9A96E" fontSize="8" opacity="0.4">✦</text>

      {/* ── Wooden Deck (right) ── */}
      <rect x="578" y="195" width="112" height="215" rx="4" fill="#F0E2CA" stroke="#BFA87A" strokeWidth="1.2" />
      <line x1="578" y1="220" x2="690" y2="220" stroke="#BFA87A" strokeWidth="0.5" opacity="0.45" />
      <line x1="578" y1="245" x2="690" y2="245" stroke="#BFA87A" strokeWidth="0.5" opacity="0.45" />
      <line x1="578" y1="270" x2="690" y2="270" stroke="#BFA87A" strokeWidth="0.5" opacity="0.45" />
      <line x1="578" y1="295" x2="690" y2="295" stroke="#BFA87A" strokeWidth="0.5" opacity="0.45" />
      <line x1="578" y1="320" x2="690" y2="320" stroke="#BFA87A" strokeWidth="0.5" opacity="0.45" />
      <line x1="578" y1="345" x2="690" y2="345" stroke="#BFA87A" strokeWidth="0.5" opacity="0.45" />
      <line x1="578" y1="370" x2="690" y2="370" stroke="#BFA87A" strokeWidth="0.5" opacity="0.45" />
      <text x="634" y="308" textAnchor="middle" fill="#A08050" fontSize="8.5" letterSpacing="1">WOODEN DECK</text>

      {/* ── Main Bar (top left) ── */}
      <rect x="18" y="78" width="122" height="66" rx="4" fill="#F2EDE3" stroke="#D4C5AD" strokeWidth="1.2" />
      <text x="79" y="115" textAnchor="middle" fill="#8A7560" fontSize="9" letterSpacing="1.2">MAIN BAR</text>

      {/* ── Bride & Groom Suite (top right corner) ── */}
      <rect x="692" y="14" width="98" height="66" rx="4" fill="#FDF8F2" stroke="#D4B896" strokeWidth="1.2" />
      <text x="741" y="40" textAnchor="middle" fill="#9B7E4E" fontSize="8" letterSpacing="0.5">B&G SUITE</text>
      <text x="741" y="56" textAnchor="middle" fill="#C9A96E" fontSize="12">♦</text>

      {/* ── Pool / Water Feature (bottom left) ── */}
      <rect x="18" y="378" width="168" height="108" rx="18" fill="#DCF0F5" stroke="#9BC5CF" strokeWidth="1.2" />
      <ellipse cx="102" cy="432" rx="48" ry="17" fill="none" stroke="#9BC5CF" strokeWidth="0.7" opacity="0.6" />
      <ellipse cx="102" cy="432" rx="30" ry="10" fill="none" stroke="#9BC5CF" strokeWidth="0.5" opacity="0.5" />
      <text x="102" y="436" textAnchor="middle" fill="#5B9BAA" fontSize="9" letterSpacing="1.5">POOL</text>

      {/* ── Pool Bar (above pool) ── */}
      <rect x="18" y="303" width="92" height="57" rx="4" fill="#F2EDE3" stroke="#D4C5AD" strokeWidth="1.2" />
      <text x="64" y="335" textAnchor="middle" fill="#8A7560" fontSize="8.5" letterSpacing="0.8">POOL BAR</text>

      {/* ── Chef Kitchen (bottom right) ── */}
      <rect x="660" y="428" width="122" height="98" rx="4" fill="#F2EDE3" stroke="#D4C5AD" strokeWidth="1.2" />
      <text x="721" y="480" textAnchor="middle" fill="#8A7560" fontSize="8.5" letterSpacing="1.2">KITCHEN</text>

      {/* ── Staff Staging (bottom center) ── */}
      <rect x="282" y="448" width="178" height="54" rx="4" fill="#EDE8DF" stroke="#D4C5AD" strokeWidth="0.8" opacity="0.65" />
      <text x="371" y="479" textAnchor="middle" fill="#B0A090" fontSize="7.5" letterSpacing="2" opacity="0.9">STAFF STAGING</text>

      {/* ── Garden elements (scattered) ── */}
      <ellipse cx="162" cy="222" rx="13" ry="19" fill="#5C7A4E" opacity="0.18" />
      <ellipse cx="175" cy="215" rx="9"  ry="14" fill="#6B8A5C" opacity="0.15" />
      <ellipse cx="157" cy="207" rx="7"  ry="11" fill="#5C7A4E" opacity="0.13" />

      <ellipse cx="172" cy="128" rx="11" ry="17" fill="#5C7A4E" opacity="0.18" />
      <ellipse cx="186" cy="122" rx="8"  ry="13" fill="#6B8A5C" opacity="0.14" />

      <ellipse cx="568" cy="174" rx="11" ry="17" fill="#5C7A4E" opacity="0.18" />
      <ellipse cx="558" cy="166" rx="7"  ry="11" fill="#6B8A5C" opacity="0.14" />

      <ellipse cx="222" cy="442" rx="13" ry="11" fill="#5C7A4E" opacity="0.18" />
      <ellipse cx="244" cy="450" rx="9"  ry="8"  fill="#6B8A5C" opacity="0.14" />

      <ellipse cx="494" cy="458" rx="12" ry="9"  fill="#5C7A4E" opacity="0.18" />
      <ellipse cx="516" cy="450" rx="8"  ry="7"  fill="#6B8A5C" opacity="0.14" />

      <ellipse cx="24"  cy="38"  rx="15" ry="21" fill="#5C7A4E" opacity="0.18" />
      <ellipse cx="42"  cy="33"  rx="10" ry="15" fill="#6B8A5C" opacity="0.16" />

      <ellipse cx="612" cy="74"  rx="12" ry="17" fill="#5C7A4E" opacity="0.18" />
      <ellipse cx="626" cy="66"  rx="8"  ry="12" fill="#6B8A5C" opacity="0.14" />

      <ellipse cx="420" cy="128" rx="10" ry="6"  fill="#5C7A4E" opacity="0.15" />

      {/* ── Venue title ── */}
      <text x="400" y="20" textAnchor="middle" fill="#C9A96E" fontSize="9" letterSpacing="3" opacity="0.65">KAHI EVENT RESORT</text>
    </svg>
  )
}

// ── Table color scheme ─────────────────────────────────────────────

function tableColors(seated, capacity) {
  if (seated === 0)          return { bg: '#FFFFFF',  border: '#C9A96E', text: '#1a1a1a', sub: '#9B7E4E' }
  if (seated >= capacity)    return { bg: '#F0FDF4',  border: '#4ADE80', text: '#166534', sub: '#15803D' }
  return                            { bg: '#FFFBEB',  border: '#F59E0B', text: '#92400E', sub: '#B45309' }
}

// ── TableCircle ────────────────────────────────────────────────────

function TableCircle({ table, guests, selected, isDragging, liveX, liveY, onMouseDown, onClick }) {
  const seated = guests.filter(g => g.table_id === table.id).length
  const capacity = table.capacity || 10
  const { bg, border, text, sub } = tableColors(seated, capacity)
  const label = table.label || `T${table.table_number}`

  const posX = isDragging ? liveX : table.position_x
  const posY = isDragging ? liveY : table.position_y

  return (
    <button
      type="button"
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: `${posX}%`,
        top: `${posY}%`,
        transform: selected && !isDragging
          ? 'translate(-50%, -50%) scale(1.12)'
          : 'translate(-50%, -50%)',
        width: 64,
        height: 64,
        background: bg,
        border: `2px solid ${selected || isDragging ? '#C9A96E' : border}`,
        boxShadow: isDragging
          ? '0 8px 24px rgba(201,169,110,0.35), 0 0 0 3px rgba(201,169,110,0.2)'
          : selected
            ? '0 0 0 3px rgba(201,169,110,0.35), 0 6px 16px rgba(201,169,110,0.2)'
            : '0 2px 8px rgba(0,0,0,0.1)',
        transition: isDragging ? 'none' : 'all 0.15s ease',
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 20 : selected ? 10 : 5,
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, color: text, lineHeight: 1, userSelect: 'none' }}>{label}</span>
      <span style={{ fontSize: 9, color: sub, marginTop: 2, lineHeight: 1, userSelect: 'none' }}>{seated}/{capacity}</span>
    </button>
  )
}

// ── TableSidePanel (table selected) ───────────────────────────────

function TableSidePanel({ table, guests, unassignedGuests, onAssignGuest, onUnassignGuest, onRemoveTable, onClose }) {
  const [selectedGuestId, setSelectedGuestId] = useState('')
  const [assigning, setAssigning] = useState(false)

  const seated = guests.filter(g => g.table_id === table.id)
  const capacity = table.capacity || 10
  const isFull = seated.length >= capacity
  const fillPct = Math.min(100, (seated.length / capacity) * 100)

  async function handleAssign() {
    if (!selectedGuestId) return
    setAssigning(true)
    try {
      await onAssignGuest(table.id, selectedGuestId)
      setSelectedGuestId('')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div
      className="w-80 shrink-0 flex flex-col overflow-y-auto"
      style={{ background: '#FFFFFF', borderLeft: '1px solid #E8E0D0' }}
    >
      <div className="p-5 space-y-4 flex-1">
        {/* Heading */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>
              {table.label || `Table ${table.table_number}`}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#9B7E4E' }}>Capacity {capacity}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm transition-colors"
            style={{ color: '#C9B8A0' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#1a1a1a' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#C9B8A0' }}
          >✕</button>
        </div>

        {/* Fill bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs" style={{ color: '#9B7E4E' }}>
            <span>{seated.length} seated</span>
            <span>{capacity - seated.length} open</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F2EDE3' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${fillPct}%`,
                background: isFull ? '#4ADE80' : '#C9A96E',
              }}
            />
          </div>
        </div>

        {/* Seated guests */}
        <div className="space-y-0.5">
          <p className="text-xs font-medium mb-1.5" style={{ color: '#6B5E4E' }}>Seated guests</p>
          {seated.length === 0 ? (
            <p className="text-xs" style={{ color: '#B0A090' }}>No guests assigned yet.</p>
          ) : (
            seated.map(g => (
              <div
                key={g.id}
                className="flex items-center justify-between py-1.5"
                style={{ borderBottom: '1px solid #F5ECD7' }}
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium block truncate" style={{ color: '#1a1a1a' }}>{g.name}</span>
                  {g.dietary && (
                    <span className="text-xs" style={{ color: '#B0A090' }}>{g.dietary}</span>
                  )}
                </div>
                <RemoveButton onClick={() => onUnassignGuest(g.id)} />
              </div>
            ))
          )}
        </div>

        {/* Assign guest */}
        {!isFull && unassignedGuests.length > 0 && (
          <div className="space-y-2 pt-3" style={{ borderTop: '1px solid #F0E8D8' }}>
            <p className="text-xs font-medium" style={{ color: '#6B5E4E' }}>Assign a guest</p>
            <select
              value={selectedGuestId}
              onChange={e => setSelectedGuestId(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none"
              style={{
                background: '#FAF8F4',
                border: '1px solid #E0D4BA',
                color: '#1a1a1a',
              }}
            >
              <option value="">Select guest…</option>
              {unassignedGuests.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            <GoldButton
              onClick={handleAssign}
              disabled={!selectedGuestId || assigning}
            >
              {assigning ? 'Assigning…' : 'Assign to table'}
            </GoldButton>
          </div>
        )}

        {isFull && (
          <p className="text-xs pt-2" style={{ color: '#4ADE80', borderTop: '1px solid #F0E8D8' }}>
            Table is full
          </p>
        )}

        {unassignedGuests.length === 0 && !isFull && (
          <p className="text-xs pt-2" style={{ color: '#B0A090', borderTop: '1px solid #F0E8D8' }}>
            All guests are seated
          </p>
        )}
      </div>

      {/* Remove table */}
      <div className="px-5 pb-5 pt-2" style={{ borderTop: '1px solid #F0E8D8' }}>
        <button
          type="button"
          onClick={() => onRemoveTable(table.id)}
          className="text-xs transition-colors"
          style={{ color: '#C9B8A0' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#C9B8A0' }}
        >
          Remove table
        </button>
      </div>
    </div>
  )
}

// ── EmptyPanelState (no table selected) ───────────────────────────

function EmptyPanelState({ tables, guests, onAddTable }) {
  const totalSeated = guests.filter(g => g.table_id).length
  const unassigned = guests.filter(g => !g.table_id)
  const totalCapacity = tables.reduce((sum, t) => sum + (t.capacity || 10), 0)

  const stats = [
    { value: tables.length,   label: 'Tables'     },
    { value: totalSeated,     label: 'Seated'     },
    { value: unassigned.length, label: 'Unassigned' },
    { value: totalCapacity,   label: 'Capacity'   },
  ]

  return (
    <div
      className="w-80 shrink-0 flex flex-col overflow-y-auto"
      style={{ background: '#FFFFFF', borderLeft: '1px solid #E8E0D0' }}
    >
      <div className="p-5 space-y-5 flex-1">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl p-3"
              style={{ background: '#FAF8F4', border: '1px solid #F0E8D8' }}
            >
              <p className="text-xl font-light" style={{ color: '#1a1a1a' }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#9B7E4E' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Hint */}
        <p className="text-xs text-center py-3 leading-relaxed" style={{ color: '#B0A090' }}>
          Select a table on the floor plan<br />to manage seating
        </p>

        {/* Unassigned guests */}
        {unassigned.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium" style={{ color: '#6B5E4E' }}>
              Unassigned guests ({unassigned.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unassigned.map(g => (
                <span
                  key={g.id}
                  className="text-xs rounded-full px-2.5 py-1"
                  style={{ background: '#F5ECD7', color: '#6B5E4E', border: '1px solid #E0D4BA' }}
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add table CTA */}
      <div className="px-5 pb-5">
        <GoldButton onClick={onAddTable}>+ Add table</GoldButton>
      </div>
    </div>
  )
}

// ── Add table position formula ─────────────────────────────────────

function nextTablePosition(tables) {
  const n = tables.length
  const col = n % 5
  const row = Math.floor(n / 5)
  return {
    position_x: 22 + col * 11,
    position_y: 28 + row * 15,
  }
}

// ── AddTableModal ──────────────────────────────────────────────────

function AddTableModal({ tables, onAdd, onClose }) {
  const [label, setLabel] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const pos = nextTablePosition(tables)
      await onAdd({
        label: label.trim() || null,
        table_number: tables.length + 1,
        capacity: Number(capacity) || 10,
        shape: 'round',
        position_x: pos.position_x,
        position_y: pos.position_y,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(26,26,26,0.35)' }}
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
        style={{ background: '#FFFFFF', border: '1px solid #E8E0D0' }}
      >
        <div>
          <h3 className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>Add table</h3>
          <p className="text-xs mt-0.5" style={{ color: '#9B7E4E' }}>Placed in the main event hall</p>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium" style={{ color: '#6B5E4E' }}>
            Label <span style={{ color: '#B0A090', fontWeight: 400 }}>(optional)</span>
          </label>
          <input
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: '#FAF8F4', border: '1px solid #E0D4BA', color: '#1a1a1a' }}
            placeholder={`Table ${tables.length + 1} or VIP Table`}
            value={label}
            onChange={e => setLabel(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium" style={{ color: '#6B5E4E' }}>Capacity</label>
          <input
            type="number" min="1" max="50"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: '#FAF8F4', border: '1px solid #E0D4BA', color: '#1a1a1a' }}
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-1">
          <GoldButton type="submit" disabled={saving} className="flex-1">
            {saving ? 'Adding…' : 'Add table'}
          </GoldButton>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs transition-colors"
            style={{ background: '#FAF8F4', border: '1px solid #E8E0D0', color: '#6B5E4E' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Shared primitives ──────────────────────────────────────────────

function GoldButton({ children, onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`py-2.5 rounded-xl text-xs font-medium transition-colors w-full ${className}`}
      style={{
        background: disabled ? '#E8E0D0' : '#C9A96E',
        color: disabled ? '#B0A090' : '#FFFFFF',
        cursor: disabled ? 'default' : 'pointer',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#B8935A' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = '#C9A96E' }}
    >
      {children}
    </button>
  )
}

function RemoveButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs ml-3 shrink-0 transition-colors"
      style={{ color: '#C9A96E' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444' }}
      onMouseLeave={e => { e.currentTarget.style.color = '#C9A96E' }}
    >
      Remove
    </button>
  )
}

// ── EventSeating (default export) ─────────────────────────────────

export default function EventSeating({ event, guests, tables, onAddTable, onUpdateTable, onRemoveTable, onAssignSeats, onUpdateGuest }) {
  const [selectedTableId, setSelectedTableId] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Drag state — only what drives re-renders
  const [draggingId, setDraggingId] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })

  // Drag metadata ref — never stale in closures
  const dragRef = useRef({
    tableId: null,
    startX: 0, startY: 0,
    offsetX: 0, offsetY: 0,
    currentX: 0, currentY: 0,
    moved: false,
  })

  const canvasRef = useRef(null)

  const selectedTable = tables.find(t => t.id === selectedTableId) || null
  const unassigned = guests.filter(g => !g.table_id)

  function handleTableMouseDown(e, table) {
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseXPct = (e.clientX - rect.left) / rect.width * 100
    const mouseYPct = (e.clientY - rect.top) / rect.height * 100
    dragRef.current = {
      tableId: table.id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: table.position_x - mouseXPct,
      offsetY: table.position_y - mouseYPct,
      currentX: table.position_x,
      currentY: table.position_y,
      moved: false,
    }
    setDraggingId(table.id)
    setDragPos({ x: table.position_x, y: table.position_y })
  }

  function handleCanvasMouseMove(e) {
    if (!dragRef.current.tableId) return
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseXPct = (e.clientX - rect.left) / rect.width * 100
    const mouseYPct = (e.clientY - rect.top) / rect.height * 100
    const newX = Math.max(2, Math.min(98, mouseXPct + dragRef.current.offsetX))
    const newY = Math.max(2, Math.min(98, mouseYPct + dragRef.current.offsetY))
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (Math.sqrt(dx * dx + dy * dy) > 4) dragRef.current.moved = true
    dragRef.current.currentX = newX
    dragRef.current.currentY = newY
    setDragPos({ x: newX, y: newY })
  }

  function handleCanvasMouseUp() {
    const { tableId, moved, currentX, currentY } = dragRef.current
    if (!tableId) return
    if (moved) onUpdateTable(event.id, tableId, { position_x: currentX, position_y: currentY })
    dragRef.current = { tableId: null, startX: 0, startY: 0, offsetX: 0, offsetY: 0, currentX: 0, currentY: 0, moved: false }
    setDraggingId(null)
    // dragRef.current.moved intentionally NOT cleared here — onClick reads it to suppress selection
  }

  async function handleAssignGuest(tableId, guestId) {
    await onAssignSeats(event.id, [{ guest_id: guestId, table_id: tableId }])
  }

  async function handleUnassignGuest(guestId) {
    await onUpdateGuest(event.id, guestId, { table_id: null })
  }

  async function handleRemoveTable(tableId) {
    await onRemoveTable(event.id, tableId)
    if (selectedTableId === tableId) setSelectedTableId(null)
  }

  async function handleAddTable(data) {
    await onAddTable(event.id, data)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#FAF8F4', border: '1px solid #E8E0D0' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{ background: '#FFFFFF', borderBottom: '1px solid #E8E0D0' }}
      >
        <div>
          <h2
            className="text-sm font-semibold"
            style={{ color: '#1a1a1a', letterSpacing: '0.04em' }}
          >
            Event Operations Studio
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#9B7E4E' }}>
            Venue planning and seating management
          </p>
        </div>
        <p className="text-xs text-right hidden sm:block" style={{ color: '#B0A090' }}>
          Kahi Event Resort&nbsp;·&nbsp;
          <span style={{ color: '#6B5E4E' }}>{event.name}</span>
          &nbsp;·&nbsp;{guests.length} guests
        </p>
      </div>

      {/* Two-column body */}
      <div className="flex" style={{ height: CANVAS_HEIGHT }}>

        {/* Left: venue canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden"
          style={{
            background: '#FAF8F4',
            userSelect: 'none',
            cursor: draggingId ? 'grabbing' : undefined,
          }}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        >
          <KahiVenueSVG />

          {/* Table circles */}
          {tables.map(table => {
            const isDragging = draggingId === table.id
            return (
              <TableCircle
                key={table.id}
                table={table}
                guests={guests}
                selected={selectedTableId === table.id}
                isDragging={isDragging}
                liveX={isDragging ? dragPos.x : null}
                liveY={isDragging ? dragPos.y : null}
                onMouseDown={e => handleTableMouseDown(e, table)}
                onClick={() => {
                  if (dragRef.current.moved) { dragRef.current.moved = false; return }
                  setSelectedTableId(selectedTableId === table.id ? null : table.id)
                }}
              />
            )
          })}

          {/* Empty state overlay */}
          {tables.length === 0 && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ zIndex: 20 }}
            >
              <p className="text-sm" style={{ color: '#B0A090' }}>No tables yet</p>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-xs font-medium transition-colors"
                style={{ color: '#C9A96E' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#B8935A' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#C9A96E' }}
              >
                + Add first table
              </button>
            </div>
          )}

          {/* Legend */}
          <div
            className="absolute bottom-3 left-4 flex items-center gap-4"
            style={{ zIndex: 20 }}
          >
            {[
              { bg: '#FFFFFF', border: '#C9A96E', label: 'Empty'   },
              { bg: '#FFFBEB', border: '#F59E0B', label: 'Partial' },
              { bg: '#F0FDF4', border: '#4ADE80', label: 'Full'    },
            ].map(({ bg, border, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: '#9B7E4E' }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: bg,
                    border: `1.5px solid ${border}`,
                  }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: side panel */}
        {selectedTable ? (
          <TableSidePanel
            table={selectedTable}
            guests={guests}
            unassignedGuests={unassigned}
            onAssignGuest={handleAssignGuest}
            onUnassignGuest={handleUnassignGuest}
            onRemoveTable={handleRemoveTable}
            onClose={() => setSelectedTableId(null)}
          />
        ) : (
          <EmptyPanelState
            tables={tables}
            guests={guests}
            onAddTable={() => setShowAddModal(true)}
          />
        )}
      </div>

      {showAddModal && (
        <AddTableModal
          tables={tables}
          onAdd={handleAddTable}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
