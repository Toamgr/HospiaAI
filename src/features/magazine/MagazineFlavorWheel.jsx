export function MagazineFlavorWheel({ points }) {
  const size = 320
  const cx = size / 2
  const cy = size / 2
  const radius = 120
  const n = points.length

  const coords = points.map((p, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2
    return {
      ...p,
      x: cx + Math.cos(angle) * radius * p.value,
      y: cy + Math.sin(angle) * radius * p.value,
      lx: cx + Math.cos(angle) * (radius + 28),
      ly: cy + Math.sin(angle) * (radius + 28),
    }
  })

  const polygon = coords.map((c) => `${c.x},${c.y}`).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', maxWidth: 320, display: 'block', margin: '0 auto' }}>
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={radius * r}
          fill="none"
          stroke="oklch(0.55 0.08 70 / 0.18)"
          strokeWidth={0.5}
        />
      ))}
      {coords.map((c, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * radius}
            y2={cy + Math.sin(angle) * radius}
            stroke="oklch(0.55 0.08 70 / 0.18)"
            strokeWidth={0.5}
          />
        )
      })}
      <polygon
        points={polygon}
        fill="oklch(0.74 0.13 65 / 0.22)"
        stroke="oklch(0.74 0.13 65)"
        strokeWidth={1.2}
      />
      {coords.map((c, i) => (
        <circle key={`p-${i}`} cx={c.x} cy={c.y} r={2.5} fill="oklch(0.74 0.13 65)" />
      ))}
      {coords.map((c, i) => (
        <text
          key={`t-${i}`}
          x={c.lx}
          y={c.ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="oklch(0.66 0.02 70)"
          style={{
            fontFamily: 'var(--mag-font-mono)',
            fontSize: 9,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          {c.axis}
        </text>
      ))}
    </svg>
  )
}
