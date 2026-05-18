import React from 'react'

function TropicalTree({ x, y, size = 1 }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <circle r={14 * size} fill="rgba(79,107,74,0.22)" />
      <circle r={10 * size} cy={-4 * size} fill="rgba(79,107,74,0.38)" />
      <circle r={7 * size} cy={-8 * size} fill="rgba(79,107,74,0.52)" />
    </g>
  )
}

function TableNode({ table, selected, hovered, onSelect, onHover }) {
  const isActive = selected || hovered
  const TR = 28
  const tableFill = selected ? '#c9a96e' : hovered ? '#2a2818' : '#1e1c15'
  const tableStroke = selected ? '#8a6a3e' : 'rgba(201,169,110,0.38)'
  const strokeWidth = selected ? 1.5 : 1
  const textColor = selected ? '#080806' : '#f5f5f0'
  const subColor = selected ? 'rgba(8,8,6,0.6)' : 'rgba(201,169,110,0.62)'
  const liftY = isActive ? -2 : 0

  const chairs = []
  if (table.shape === 'round') {
    for (let i = 0; i < table.capacity; i++) {
      const angle = (i / table.capacity) * Math.PI * 2 - Math.PI / 2
      chairs.push({
        x: Math.cos(angle) * (TR + 11),
        y: Math.sin(angle) * (TR + 11),
        wheelchair: i === 0 && table.wheelchair > 0,
        baby: i === 2 && table.babyChairs > 0
      })
    }
  } else {
    const W = 88, H = 26
    const perSide = Math.ceil(table.capacity / 2)
    for (let i = 0; i < perSide; i++) {
      const cx = perSide > 1 ? -W / 2 + (W / (perSide - 1)) * i : 0
      chairs.push({ x: cx, y: -(H / 2 + 11), baby: i === 0 && table.babyChairs > 0 })
    }
    for (let i = 0; i < Math.floor(table.capacity / 2); i++) {
      const cx = perSide > 1 ? -W / 2 + (W / (perSide - 1)) * i : 0
      chairs.push({ x: cx, y: H / 2 + 11 })
    }
  }

  return (
    <g
      transform={`translate(${table.x} ${table.y + liftY})`}
      onClick={() => onSelect(table.id)}
      onMouseEnter={() => onHover(table.id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: 'pointer' }}
    >
      {selected && <circle r={44} fill="rgba(201,169,110,0.09)" />}

      {chairs.map((c, i) =>
        c.wheelchair ? (
          <rect
            key={i}
            x={c.x - 5}
            y={c.y - 6}
            width="10"
            height="12"
            rx="2"
            fill="rgba(79,107,74,0.45)"
            stroke="#4F6B4A"
            strokeWidth="1"
          />
        ) : c.baby ? (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="5"
            fill="rgba(201,169,110,0.28)"
            stroke="rgba(201,169,110,0.55)"
            strokeWidth="1"
          />
        ) : (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r="5"
            fill="rgba(42,40,32,0.9)"
            stroke="rgba(201,169,110,0.1)"
            strokeWidth="0.5"
          />
        )
      )}

      {table.shape === 'round' ? (
        <circle r={TR} fill={tableFill} stroke={tableStroke} strokeWidth={strokeWidth} />
      ) : (
        <rect
          x="-44"
          y="-13"
          width="88"
          height="26"
          rx="3"
          fill={tableFill}
          stroke={tableStroke}
          strokeWidth={strokeWidth}
        />
      )}

      <text y="-2" fontSize="11" fill={textColor} textAnchor="middle" fontWeight="600">
        {table.id}
      </text>
      <text y="9" fontSize="7" fill={subColor} textAnchor="middle">
        {table.guests}/{table.capacity} · {table.waiter[0]}
      </text>
      {table.label && (
        <text y="19" fontSize="6" fill={subColor} textAnchor="middle" fontStyle="italic">
          {table.label}
        </text>
      )}

      {table.accessiblePriority && (
        <g transform="translate(24, -22)">
          <circle r="7" fill="#4F6B4A" opacity="0.9" />
          <text fontSize="8" fill="white" textAnchor="middle" dy="3">♿</text>
        </g>
      )}

      {table.zone === 'vip' && !table.accessiblePriority && (
        <g transform="translate(24, -22)">
          <circle r="7" fill="rgba(201,169,110,0.8)" />
          <text fontSize="5" fill="#080806" textAnchor="middle" dy="2" fontWeight="bold">VIP</text>
        </g>
      )}
    </g>
  )
}

export default function EventBrainFloorPlan({
  tables,
  selectedId,
  hoverId,
  onSelect,
  onHover,
  onAutoArrange,
  onReset
}) {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#6b705c]/10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6b705c]/10 px-5 py-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e] opacity-70">
            Resort Floor Plan
          </div>
          <div className="text-[11px] font-medium text-[#e8dcc0] opacity-50">
            Kahi Event Venue · Cohen-Levi Wedding · 17 tables · Click to select
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAutoArrange}
            className="rounded-lg border border-[#6b705c]/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#e8dcc0] transition-colors hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
          >
            Auto Arrange
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-[#6b705c]/30 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#e8dcc0] transition-colors hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
          >
            Reset
          </button>
        </div>
      </div>

      {/* SVG */}
      <div className="px-3 pt-3">
        <svg
          viewBox="0 0 1000 620"
          className="block h-auto w-full"
          aria-label="Kahi Event Resort floor plan — 17 tables"
        >
          <defs>
            <pattern id="eb-hall" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="#16140f" />
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(201,169,110,0.045)" strokeWidth="0.5" />
            </pattern>
            <pattern id="eb-garden" patternUnits="userSpaceOnUse" width="24" height="24">
              <rect width="24" height="24" fill="#111a10" />
              <circle cx="12" cy="12" r="1" fill="rgba(79,107,74,0.1)" />
            </pattern>
            <pattern id="eb-deck" patternUnits="userSpaceOnUse" width="14" height="60">
              <rect width="14" height="60" fill="#1a1208" />
              <line x1="0" y1="0" x2="0" y2="60" stroke="rgba(181,138,90,0.1)" strokeWidth="1" />
            </pattern>
            <radialGradient id="eb-pool" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a3a5c" />
              <stop offset="100%" stopColor="#0a1f35" />
            </radialGradient>
            <radialGradient id="eb-chuppah-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(201,169,110,0.06)" />
              <stop offset="100%" stopColor="rgba(201,169,110,0)" />
            </radialGradient>
          </defs>

          {/* ── ZONE BACKGROUNDS ── */}
          <rect x="40" y="40" width="492" height="542" fill="url(#eb-hall)" rx="3" />
          <rect x="538" y="40" width="422" height="542" fill="url(#eb-garden)" rx="3" />

          {/* ── HALL ARCHITECTURE ── */}
          {/* Chef Kitchen */}
          <rect x="50" y="50" width="164" height="74" fill="#1c1810" rx="3" stroke="rgba(201,169,110,0.08)" strokeWidth="0.5" />
          <text x="132" y="76" fontSize="7.5" fill="rgba(201,169,110,0.42)" textAnchor="middle" letterSpacing="0.12em">CHEF KITCHEN</text>
          <text x="132" y="89" fontSize="6" fill="rgba(201,169,110,0.28)" textAnchor="middle" fontStyle="italic">Plating Kitchen</text>
          {/* Kitchen service door */}
          <rect x="178" y="116" width="16" height="4" fill="rgba(201,169,110,0.28)" rx="1" />

          {/* Main Bar */}
          <rect x="224" y="50" width="198" height="30" fill="#1a1508" rx="3" stroke="rgba(201,169,110,0.09)" strokeWidth="0.5" />
          <text x="323" y="69" fontSize="7.5" fill="rgba(201,169,110,0.52)" textAnchor="middle" letterSpacing="0.12em">MAIN BAR</text>

          {/* Prep / Plating */}
          <rect x="430" y="50" width="98" height="74" fill="#1a1810" rx="3" stroke="rgba(201,169,110,0.05)" strokeWidth="0.5" />
          <text x="479" y="91" fontSize="6.5" fill="rgba(201,169,110,0.28)" textAnchor="middle">Prep</text>

          {/* Service Corridor */}
          <rect x="50" y="128" width="480" height="11" fill="#0d0b08" rx="1" />
          <text x="290" y="136.5" fontSize="5.5" fill="rgba(201,169,110,0.2)" textAnchor="middle" letterSpacing="0.22em">SERVICE CORRIDOR</text>

          {/* VIP / Family Zone outline */}
          <rect x="96" y="362" width="398" height="118" fill="rgba(201,169,110,0.018)" rx="5" stroke="rgba(201,169,110,0.1)" strokeWidth="0.8" strokeDasharray="5 3" />
          <text x="295" y="376" fontSize="6.5" fill="rgba(201,169,110,0.3)" textAnchor="middle" letterSpacing="0.2em">VIP · FAMILY · ACCESSIBILITY PRIORITY</text>

          {/* Accessible Entrance */}
          <rect x="40" y="494" width="56" height="22" fill="#1a2810" rx="2" stroke="#4F6B4A" strokeWidth="0.8" />
          <text x="68" y="509" fontSize="6" fill="#4F6B4A" textAnchor="middle">♿ Entrance</text>

          {/* Accessible Restroom */}
          <rect x="40" y="522" width="56" height="22" fill="#1a2810" rx="2" stroke="#4F6B4A" strokeWidth="0.7" opacity="0.75" />
          <text x="68" y="537" fontSize="5.5" fill="#4F6B4A" textAnchor="middle">♿ Restroom</text>

          {/* Late-Night Food Station */}
          <rect x="420" y="534" width="100" height="44" fill="#1c1810" rx="3" stroke="rgba(201,169,110,0.07)" strokeWidth="0.5" />
          <text x="470" y="553" fontSize="6.5" fill="rgba(201,169,110,0.42)" textAnchor="middle">Late-Night</text>
          <text x="470" y="565" fontSize="5.5" fill="rgba(201,169,110,0.28)" textAnchor="middle">Food Station</text>

          {/* ── GARDEN ARCHITECTURE ── */}
          {/* Pool Deck (wooden) */}
          <rect x="552" y="248" width="398" height="250" fill="url(#eb-deck)" rx="3" opacity="0.65" />

          {/* Pool */}
          <rect x="648" y="314" width="256" height="138" rx="76" fill="url(#eb-pool)" />
          <ellipse cx="776" cy="383" rx="82" ry="36" fill="none" stroke="rgba(167,211,214,0.07)" strokeWidth="1" />
          <ellipse cx="776" cy="383" rx="52" ry="22" fill="none" stroke="rgba(167,211,214,0.12)" strokeWidth="1" />
          <text x="776" y="387" fontSize="7.5" fill="rgba(167,211,214,0.42)" textAnchor="middle" letterSpacing="0.1em">Pool</text>

          {/* Garden / Pool Bar */}
          <rect x="600" y="248" width="152" height="26" fill="#1a1508" rx="3" stroke="rgba(201,169,110,0.09)" strokeWidth="0.5" />
          <text x="676" y="265" fontSize="7" fill="rgba(201,169,110,0.48)" textAnchor="middle" letterSpacing="0.1em">GARDEN / POOL BAR</text>

          {/* Bride & Groom Suite */}
          <rect x="816" y="248" width="130" height="40" fill="#1c1a14" rx="3" stroke="rgba(201,169,110,0.11)" strokeWidth="0.5" />
          <text x="881" y="265" fontSize="7" fill="rgba(201,169,110,0.45)" textAnchor="middle">Bride & Groom</text>
          <text x="881" y="277" fontSize="6" fill="rgba(201,169,110,0.3)" textAnchor="middle">Suite</text>

          {/* Chuppah Ceremony Zone */}
          <circle cx="788" cy="110" r="62" fill="url(#eb-chuppah-glow)" stroke="rgba(201,169,110,0.17)" strokeWidth="1" strokeDasharray="5 3" />
          <circle cx="788" cy="110" r="46" fill="rgba(201,169,110,0.025)" />
          {/* Chuppah posts */}
          <rect x="758" y="62" width="4" height="52" fill="rgba(201,169,110,0.26)" rx="1" />
          <rect x="816" y="62" width="4" height="52" fill="rgba(201,169,110,0.26)" rx="1" />
          <line x1="758" y1="62" x2="820" y2="62" stroke="rgba(201,169,110,0.26)" strokeWidth="2.5" />
          <path d="M 758 62 Q 788 74 820 62" fill="none" stroke="rgba(201,169,110,0.16)" strokeWidth="1.5" />
          <text x="788" y="118" fontSize="7.5" fill="rgba(201,169,110,0.42)" textAnchor="middle" fontStyle="italic">Garden Chuppah</text>

          {/* Staff Staging */}
          <rect x="552" y="500" width="112" height="54" fill="#191712" rx="3" stroke="rgba(201,169,110,0.07)" strokeWidth="0.5" strokeDasharray="3 2" />
          <text x="608" y="524" fontSize="6.5" fill="rgba(201,169,110,0.36)" textAnchor="middle">Staff</text>
          <text x="608" y="537" fontSize="6.5" fill="rgba(201,169,110,0.36)" textAnchor="middle">Staging</text>

          {/* Guest Suites / Cabins */}
          <rect x="936" y="298" width="50" height="34" fill="#1c1a14" rx="2" stroke="rgba(201,169,110,0.07)" strokeWidth="0.5" />
          <rect x="936" y="342" width="50" height="34" fill="#1c1a14" rx="2" stroke="rgba(201,169,110,0.07)" strokeWidth="0.5" />
          <rect x="936" y="386" width="50" height="34" fill="#1c1a14" rx="2" stroke="rgba(201,169,110,0.07)" strokeWidth="0.5" />
          <text x="961" y="318" fontSize="5.5" fill="rgba(201,169,110,0.28)" textAnchor="middle">Suite</text>
          <text x="961" y="362" fontSize="5.5" fill="rgba(201,169,110,0.28)" textAnchor="middle">Suite</text>
          <text x="961" y="406" fontSize="5.5" fill="rgba(201,169,110,0.28)" textAnchor="middle">Suite</text>

          {/* ── PATHS ── */}
          {/* Service path: kitchen → corridor → garden */}
          <path d="M 187 124 L 187 114 L 534 114 L 534 158" stroke="rgba(201,169,110,0.16)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
          {/* Accessible path */}
          <path d="M 96 494 L 96 472 L 148 458" stroke="#4F6B4A" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.62" />

          {/* ── DECORATIVE ── */}
          {/* Fairy lights along garden top */}
          <path d="M 542 58 Q 665 76 788 56 Q 912 37 960 58" stroke="rgba(201,169,110,0.14)" strokeWidth="1" fill="none" />
          <circle cx="590" cy="66" r="1.5" fill="rgba(201,169,110,0.48)" />
          <circle cx="650" cy="72" r="1.5" fill="rgba(201,169,110,0.48)" />
          <circle cx="720" cy="63" r="1.5" fill="rgba(201,169,110,0.48)" />
          <circle cx="788" cy="56" r="1.5" fill="rgba(201,169,110,0.48)" />
          <circle cx="856" cy="51" r="1.5" fill="rgba(201,169,110,0.48)" />
          <circle cx="918" cy="56" r="1.5" fill="rgba(201,169,110,0.48)" />

          {/* Tropical trees (garden) */}
          <TropicalTree x={562} y={153} size={0.85} />
          <TropicalTree x={640} y={268} size={0.75} />
          <TropicalTree x={872} y={172} size={0.9} />
          <TropicalTree x={930} y={246} size={0.7} />

          {/* ── ZONE LABELS ── */}
          <text x="290" y="160" fontSize="8" fill="rgba(245,245,240,0.14)" textAnchor="middle" letterSpacing="0.22em">MAIN EVENT HALL</text>
          <text x="720" y="58" fontSize="8" fill="rgba(79,107,74,0.42)" textAnchor="middle" letterSpacing="0.22em">GARDEN TERRACE</text>
          <text x="720" y="258" fontSize="6.5" fill="rgba(201,169,110,0.26)" textAnchor="middle" letterSpacing="0.16em">POOL DECK</text>

          {/* ── TABLES ── */}
          {tables.map(table => (
            <TableNode
              key={table.id}
              table={table}
              selected={table.id === selectedId}
              hovered={table.id === hoverId}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))}

          {/* ── SCALE INDICATOR ── */}
          <line x1="858" y1="598" x2="912" y2="598" stroke="rgba(201,169,110,0.38)" strokeWidth="1" />
          <line x1="858" y1="594" x2="858" y2="602" stroke="rgba(201,169,110,0.38)" strokeWidth="1" />
          <line x1="912" y1="594" x2="912" y2="602" stroke="rgba(201,169,110,0.38)" strokeWidth="1" />
          <text x="885" y="610" fontSize="6.5" fill="rgba(201,169,110,0.38)" textAnchor="middle">10m</text>
          <text x="885" y="592" fontSize="5.5" fill="rgba(245,245,240,0.16)" textAnchor="middle" letterSpacing="0.1em">KAHI EVENT RESORT · 1:200</text>
        </svg>
      </div>

      {/* Accessibility Status Strip */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-[#6b705c]/10 px-5 py-3">
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#4F6B4A]">♿ 2 wheelchair spaces</span>
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e] opacity-80">· 3 baby chairs</span>
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#4F6B4A]">Accessible path clear</span>
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e] opacity-80">Service route open</span>
        <span className="ml-auto text-[9px] italic text-[#e8dcc0] opacity-28">Recommended operational plan</span>
      </div>
    </div>
  )
}
