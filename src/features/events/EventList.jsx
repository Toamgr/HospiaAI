import React, { useState, useMemo } from 'react'
import '@fontsource/fraunces/600.css'
import '@fontsource/fraunces/700.css'
import '@fontsource/jetbrains-mono/400.css'

// ── Palette A — Operational Dark (HESTIA design system) ───────────────────────
const T = {
  bg:            '#0D0D0D',
  surface:       '#141414',
  surfaceRaised: '#1A1A1A',
  borderSubtle:  '#2A2A2A',
  borderEmphasis:'#3A3A3A',
  gold:          '#C9A96E',
  goldMuted:     '#8B7355',
  goldFaint:     'rgba(201,169,110,0.08)',
  txtPrimary:    '#F5F0E8',
  txtSecondary:  '#9A9590',
  txtTertiary:   '#5A5550',
}

// ── Status chip config ────────────────────────────────────────────────────────
const STATUS_CHIPS = {
  draft:          { label: 'Draft',     bg: 'rgba(90,84,80,0.18)',    color: '#9A9590', border: null },
  confirmed:      { label: 'Confirmed', bg: 'rgba(201,169,110,0.10)', color: '#C9A96E', border: null },
  in_preparation: { label: 'In Prep',   bg: 'transparent',            color: '#5A5550', border: '#3A3A3A' },
  ready:          { label: 'Ready',     bg: 'rgba(42,92,139,0.18)',   color: '#6BA0CF', border: null },
  live:           { label: 'Live',      bg: 'rgba(74,124,89,0.18)',   color: '#6BAF80', border: null },
  completed:      { label: 'Completed', bg: 'rgba(50,50,50,0.30)',    color: '#5A5550', border: null },
  cancelled:      { label: 'Cancelled', bg: 'rgba(139,58,58,0.18)',   color: '#C07070', border: null },
}

const EVENT_TYPE_LABELS = {
  wedding:   'Wedding',
  corporate: 'Corporate',
  private:   'Private',
  bar_event: 'Bar Event',
  other:     'Other',
}

// ── Date utilities ────────────────────────────────────────────────────────────

function getDaysUntil(dateStr) {
  if (!dateStr) return null
  const eventDate = new Date(dateStr + 'T12:00:00')
  const now = new Date()
  now.setHours(12, 0, 0, 0)
  return Math.ceil((eventDate - now) / 86400000)
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return dateStr }
}

function formatCountdown(days) {
  if (days === null) return null
  if (days === 0)   return 'Today'
  if (days === 1)   return 'Tomorrow'
  if (days === -1)  return 'Yesterday'
  if (days < 0)    return `${Math.abs(days)}d ago`
  return `${days}d`
}

// ── Section classifier ────────────────────────────────────────────────────────
//
// TODAY        — event_date is today, status not cancelled
// ATTENTION    — past date not yet archived, OR within 14 days with draft/in_preparation
// UPCOMING     — future active events not captured above
// ARCHIVE      — completed or cancelled

function classifyEvents(events, search) {
  const q = search.trim().toLowerCase()
  const pool = q
    ? events.filter(e =>
        e.name?.toLowerCase().includes(q) ||
        e.client_name?.toLowerCase().includes(q)
      )
    : events

  const today     = []
  const attention = []
  const upcoming  = []
  const archive   = []

  for (const e of pool) {
    const days       = getDaysUntil(e.event_date)
    const isArchived = ['completed', 'cancelled'].includes(e.status)

    if (isArchived) { archive.push(e); continue }
    if (days === 0) { today.push(e);   continue }

    if (days !== null && days < 0) { attention.push(e); continue }

    if (days !== null && days <= 14 && ['draft', 'in_preparation'].includes(e.status)) {
      attention.push(e); continue
    }

    upcoming.push(e)
  }

  const asc  = (a, b) => (getDaysUntil(a.event_date) ?? 999) - (getDaysUntil(b.event_date) ?? 999)
  const desc = (a, b) => (getDaysUntil(b.event_date) ?? 0)   - (getDaysUntil(a.event_date) ?? 0)

  today.sort(asc)
  attention.sort(asc)
  upcoming.sort(asc)
  archive.sort(desc)

  return { today, attention, upcoming, archive }
}

// ── Shimmer keyframes (injected once) ─────────────────────────────────────────
function ShimmerStyle() {
  return (
    <style>{`
      @keyframes hestia-shimmer {
        0%   { opacity: 0.45; }
        50%  { opacity: 0.90; }
        100% { opacity: 0.45; }
      }
    `}</style>
  )
}

const SHIMMER = { animation: 'hestia-shimmer 1.6s ease-in-out infinite' }

// ── StatusChip ────────────────────────────────────────────────────────────────

function StatusChip({ status }) {
  const cfg = STATUS_CHIPS[status] || STATUS_CHIPS.draft
  return (
    <span style={{
      display:       'inline-block',
      background:    cfg.bg,
      color:         cfg.color,
      border:        cfg.border ? `1px solid ${cfg.border}` : '1px solid transparent',
      borderRadius:  100,
      padding:       '2px 9px',
      fontSize:      '0.62rem',
      fontWeight:    500,
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      whiteSpace:    'nowrap',
      lineHeight:    1.6,
    }}>
      {cfg.label}
    </span>
  )
}

// ── EventCard ─────────────────────────────────────────────────────────────────

function EventCard({ event, onSelect, variant }) {
  const [hovered, setHovered] = useState(false)

  const days            = getDaysUntil(event.event_date)
  const countdown       = formatCountdown(days)
  const totalGuests     = event.expected_guests || 0
  const confirmedGuests = event.rsvp_confirmed  || 0
  const isArchive       = variant === 'archive'
  const isToday         = variant === 'today'
  const isAttention     = variant === 'attention'

  const countdownColor =
    isToday                                          ? T.gold :
    isAttention && days !== null && days < 0         ? '#C07070' :
    isAttention                                      ? '#D4943A' :
    T.goldMuted

  const borderColor = isToday
    ? (hovered ? T.gold : 'rgba(201,169,110,0.35)')
    : isAttention
    ? (hovered ? 'rgba(193,127,42,0.60)' : 'rgba(193,127,42,0.28)')
    : isArchive
    ? (hovered ? T.borderSubtle : '#1E1E1E')
    : (hovered ? T.gold : T.borderSubtle)

  const metaItems = [
    totalGuests > 0 ? `${totalGuests} guests` : null,
    confirmedGuests > 0 && !isArchive ? `${confirmedGuests} confirmed` : null,
    event.location || null,
  ].filter(Boolean)

  return (
    <button
      type="button"
      onClick={() => onSelect(event.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width:        '100%',
        textAlign:    'left',
        display:      'block',
        background:   isArchive ? T.bg : T.surface,
        border:       `1px solid ${borderColor}`,
        borderRadius: 8,
        padding:      isArchive ? '16px 24px' : '24px',
        cursor:       'pointer',
        transition:   'border-color 200ms ease, box-shadow 200ms ease, transform 150ms ease',
        transform:    hovered && !isArchive ? 'translateY(-1px)' : 'translateY(0)',
        boxShadow:    hovered && !isArchive ? '0 6px 28px rgba(0,0,0,0.45)' : 'none',
      }}
    >
      {/* Identity left | Date right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>

        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Eyebrow: status chip + event type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <StatusChip status={event.status} />
            {event.event_type && (
              <span style={{
                fontSize:      '0.65rem',
                fontWeight:    500,
                color:         isArchive ? '#3A3A3A' : T.txtTertiary,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
              </span>
            )}
          </div>

          {/* Event name — Fraunces, section header font */}
          <p style={{
            fontFamily:   '"Fraunces", serif',
            fontSize:     isArchive ? '0.9rem' : '1.05rem',
            fontWeight:   600,
            color:        isArchive ? '#5A5550' : (hovered ? T.gold : T.txtPrimary),
            margin:       0,
            lineHeight:   1.25,
            transition:   'color 200ms ease',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {event.name}
          </p>

          {/* Client name */}
          {event.client_name && (
            <p style={{
              fontSize:     '0.8rem',
              color:        isArchive ? '#3A3A3A' : T.txtSecondary,
              margin:       '4px 0 0',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}>
              {event.client_name}
            </p>
          )}
        </div>

        {/* Date block — JetBrains Mono for temporal data */}
        {!isArchive && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{
              fontFamily:    '"JetBrains Mono", monospace',
              fontSize:      '0.72rem',
              color:         T.txtSecondary,
              margin:        0,
              lineHeight:    1.4,
              letterSpacing: '0.02em',
            }}>
              {formatDate(event.event_date)}
            </p>
            {countdown && (
              <p style={{
                fontFamily:    '"JetBrains Mono", monospace',
                fontSize:      '0.72rem',
                fontWeight:    600,
                color:         countdownColor,
                margin:        '4px 0 0',
                letterSpacing: '0.04em',
              }}>
                {countdown}
                {isToday && (
                  <span
                    className="animate-pulse"
                    style={{
                      display:       'inline-block',
                      width:         5, height: 5,
                      borderRadius:  '50%',
                      background:    T.gold,
                      marginLeft:    6,
                      verticalAlign: 'middle',
                      position:      'relative',
                      top:           -1,
                    }}
                  />
                )}
              </p>
            )}
          </div>
        )}

        {/* Archive: date only, very muted */}
        {isArchive && event.event_date && (
          <p style={{
            fontFamily:    '"JetBrains Mono", monospace',
            fontSize:      '0.68rem',
            color:         '#3A3A3A',
            flexShrink:    0,
            margin:        0,
            lineHeight:    1,
            paddingTop:    2,
            letterSpacing: '0.02em',
          }}>
            {formatDate(event.event_date)}
          </p>
        )}
      </div>

      {/* Footer meta row */}
      {metaItems.length > 0 && (
        <div style={{
          display:    'flex',
          alignItems: 'center',
          marginTop:  16,
          paddingTop: 16,
          borderTop:  `1px solid ${isArchive ? '#1E1E1E' : T.borderSubtle}`,
        }}>
          {metaItems.map((item, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && (
                <span style={{ color: '#3A3A3A', fontSize: '0.72rem', margin: '0 8px' }}>·</span>
              )}
              <span style={{
                fontSize:      '0.72rem',
                color:         isArchive ? '#3A3A3A' : T.txtTertiary,
                letterSpacing: '0.02em',
              }}>
                {item}
              </span>
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

// ── Section config ────────────────────────────────────────────────────────────

const SECTION_CONFIG = {
  today: {
    eyebrow:     'Active Now',
    label:       'Today',
    labelSize:   '1.05rem',
    labelWeight: 700,
    color:       '#C9A96E',
    dotColor:    '#C9A96E',
    divider:     'rgba(201,169,110,0.22)',
    countBg:     'rgba(201,169,110,0.10)',
    countColor:  '#8B7355',
    showDot:     true,
    zoneStyle:   {
      borderLeft:  '3px solid rgba(201,169,110,0.28)',
      paddingLeft: 24,
    },
  },
  attention: {
    eyebrow:     'Review Required',
    label:       'Needs Attention',
    labelSize:   '1.05rem',
    labelWeight: 600,
    color:       '#D4943A',
    divider:     'rgba(193,127,42,0.25)',
    countBg:     'rgba(193,127,42,0.10)',
    countColor:  '#C17F2A',
    showDot:     false,
    zoneStyle:   {
      borderLeft:  '3px solid rgba(193,127,42,0.28)',
      paddingLeft: 24,
    },
  },
  upcoming: {
    eyebrow:     null,
    label:       'Upcoming',
    labelSize:   '0.92rem',
    labelWeight: 600,
    color:       '#9A9590',
    divider:     '#2A2A2A',
    countBg:     'rgba(90,84,80,0.18)',
    countColor:  '#5A5550',
    showDot:     false,
    zoneStyle:   null,
  },
  archive: {
    eyebrow:     null,
    label:       'Archive',
    labelSize:   '0.82rem',
    labelWeight: 500,
    color:       '#3A3A3A',
    divider:     '#1E1E1E',
    countBg:     'transparent',
    countColor:  '#3A3A3A',
    showDot:     false,
    zoneStyle:   null,
  },
}

// ── SectionHeader ─────────────────────────────────────────────────────────────

function SectionHeader({ section, count, onClick, isOpen }) {
  const [hovered, setHovered] = useState(false)
  const cfg = SECTION_CONFIG[section]

  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

      {/* Eyebrow — Today and Attention only */}
      {cfg.eyebrow && (
        <span style={{
          fontSize:      '0.58rem',
          fontWeight:    500,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         cfg.color,
          opacity:       0.6,
          lineHeight:    1,
        }}>
          {cfg.eyebrow}
        </span>
      )}

      {/* Name row: dot + Fraunces label + divider + count + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>

        {cfg.showDot && (
          <span
            className="animate-pulse"
            style={{
              display:      'inline-block',
              width:        6, height: 6,
              borderRadius: '50%',
              background:   cfg.dotColor,
              flexShrink:   0,
            }}
          />
        )}

        <span style={{
          fontFamily:    '"Fraunces", serif',
          fontSize:      cfg.labelSize,
          fontWeight:    cfg.labelWeight,
          color:         onClick && hovered ? T.txtSecondary : cfg.color,
          whiteSpace:    'nowrap',
          transition:    'color 150ms ease',
          letterSpacing: '-0.01em',
          lineHeight:    1,
        }}>
          {cfg.label}
        </span>

        <div style={{ flex: 1, height: 1, background: cfg.divider }} />

        {count > 0 && (
          <span style={{
            display:       'inline-block',
            background:    cfg.countBg,
            color:         cfg.countColor,
            borderRadius:  100,
            padding:       '1px 8px',
            fontSize:      '0.62rem',
            fontWeight:    500,
            letterSpacing: '0.08em',
            flexShrink:    0,
          }}>
            {count}
          </span>
        )}

        {onClick && (
          <span style={{
            fontSize:   '0.65rem',
            color:      hovered ? '#5A5550' : '#2A2A2A',
            flexShrink: 0,
            transition: 'color 150ms ease',
          }}>
            {isOpen ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width:      '100%',
          background: 'none',
          border:     'none',
          padding:    0,
          cursor:     'pointer',
          textAlign:  'left',
        }}
      >
        {inner}
      </button>
    )
  }

  return <div>{inner}</div>
}

// ── EmptyState — editorial, not generic ───────────────────────────────────────

function EmptyState({ message }) {
  return (
    <p style={{
      fontFamily: '"Fraunces", serif',
      fontStyle:  'italic',
      fontSize:   '0.875rem',
      color:      T.txtTertiary,
      margin:     0,
      lineHeight: 1.6,
      padding:    '8px 0',
    }}>
      {message}
    </p>
  )
}

// ── EventList ─────────────────────────────────────────────────────────────────

export default function EventList({ events, isLoading, onSelectEvent, onCreateNew }) {
  const [search, setSearch]             = useState('')
  const [archiveOpen, setArchiveOpen]   = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  const { today, attention, upcoming, archive } = useMemo(
    () => classifyEvents(events, search),
    [events, search]
  )

  // ── Skeleton loading ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ position: 'relative' }}>
        <ShimmerStyle />
        <div
          aria-hidden="true"
          style={{
            position:      'absolute',
            top:           0,
            left:          '50%',
            transform:     'translateX(-50%)',
            width:         '120%',
            height:        220,
            background:    'radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.045) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex:        0,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Header skeleton */}
          <header style={{ paddingTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ width: 140, height: 10, background: '#1E1E1E', borderRadius: 3, marginBottom: 12, ...SHIMMER }} />
                <div style={{ width: 100, height: 38, background: '#1E1E1E', borderRadius: 4, ...SHIMMER }} />
              </div>
              <div style={{ width: 120, height: 40, background: '#1E1E1E', borderRadius: 4, ...SHIMMER }} />
            </div>
            <div style={{ height: 1, background: '#1E1E1E', marginTop: 24 }} />
          </header>

          {/* Search skeleton */}
          <div style={{ height: 42, background: '#141414', border: '1px solid #2A2A2A', borderRadius: 6 }} />

          {/* Section skeletons */}
          {[0, 1].map(s => (
            <section key={s} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ width: 72, height: 9, background: '#1E1E1E', borderRadius: 2, ...SHIMMER }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 88, height: 16, background: '#1E1E1E', borderRadius: 3, ...SHIMMER }} />
                  <div style={{ flex: 1, height: 1, background: '#1E1E1E' }} />
                </div>
              </div>
              {[0, 1].map(c => (
                <div key={c} style={{
                  background: '#141414', border: '1px solid #2A2A2A', borderRadius: 8, padding: 24,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ width: 62, height: 18, background: '#1E1E1E', borderRadius: 100, ...SHIMMER }} />
                    <div style={{ width: 80, height: 13, background: '#1E1E1E', borderRadius: 3, ...SHIMMER }} />
                  </div>
                  <div style={{ width: '58%', height: 17, background: '#1E1E1E', borderRadius: 3, marginBottom: 8, ...SHIMMER }} />
                  <div style={{ width: '36%', height: 13, background: '#1E1E1E', borderRadius: 3, ...SHIMMER }} />
                </div>
              ))}
            </section>
          ))}

        </div>
      </div>
    )
  }

  const hasNoEvents  = events.length === 0
  const noSearchHits = !hasNoEvents && !!search &&
    today.length === 0 && attention.length === 0 &&
    upcoming.length === 0 && archive.length === 0

  return (
    <div style={{ position: 'relative' }}>
      <ShimmerStyle />

      {/* Atmospheric gold glow */}
      <div
        aria-hidden="true"
        style={{
          position:      'absolute',
          top:           0,
          left:          '50%',
          transform:     'translateX(-50%)',
          width:         '120%',
          height:        220,
          background:    'radial-gradient(ellipse at 50% 0%, rgba(201,169,110,0.055) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex:        0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* ── Page header ───────────────────────────────────────────── */}
        <header style={{ paddingTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>

            <div>
              {/* Eyebrow */}
              <p style={{
                fontSize:      '0.6rem',
                fontWeight:    500,
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color:         T.goldMuted,
                margin:        '0 0 8px',
                lineHeight:    1,
              }}>
                Operational Command
              </p>
              {/* Display title — Fraunces per Quick Reference "Playfair Display or Fraunces" */}
              <h1 style={{
                fontFamily:    '"Fraunces", serif',
                fontSize:      '2.25rem',
                fontWeight:    700,
                color:         T.txtPrimary,
                margin:        0,
                lineHeight:    0.95,
                letterSpacing: '-0.025em',
              }}>
                Events
              </h1>
            </div>

            {/* Primary CTA — gold fill, one per screen */}
            <button
              type="button"
              onClick={onCreateNew}
              style={{
                background:    T.gold,
                color:         '#0D0D0D',
                border:        'none',
                borderRadius:  4,
                padding:       '10px 20px',
                fontSize:      '0.75rem',
                fontWeight:    500,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                cursor:        'pointer',
                flexShrink:    0,
                transition:    'background 150ms ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#D4B87A' }}
              onMouseLeave={e => { e.currentTarget.style.background = T.gold }}
            >
              Plan an event
            </button>
          </div>

          {/* Thin gold rule */}
          <div style={{ height: 1, background: 'rgba(201,169,110,0.10)', marginTop: 24 }} />
        </header>

        {/* ── Search ──────────────────────────────────────────────── */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="Search events or clients…"
          style={{
            width:       '100%',
            background:  T.bg,
            border:      `1px solid ${searchFocused ? T.gold : T.borderSubtle}`,
            borderRadius: 6,
            padding:     '10px 14px',
            fontSize:    '0.875rem',
            color:       T.txtPrimary,
            outline:     'none',
            boxSizing:   'border-box',
            transition:  'border-color 150ms ease',
            boxShadow:   searchFocused ? '0 0 0 3px rgba(201,169,110,0.10)' : 'none',
          }}
        />

        {/* ── Zero-events state ───────────────────────────────────── */}
        {hasNoEvents && (
          <div style={{ padding: '56px 0 40px', textAlign: 'center' }}>
            <p style={{
              fontSize:      '0.6rem',
              fontWeight:    500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         T.txtTertiary,
              margin:        '0 0 16px',
              lineHeight:    1,
            }}>
              Hestia · Events
            </p>
            <p style={{
              fontFamily:  '"Fraunces", serif',
              fontSize:    '1.5rem',
              fontWeight:  600,
              color:       T.txtSecondary,
              margin:      '0 0 8px',
              lineHeight:  1.2,
            }}>
              Nothing in the books yet.
            </p>
            <p style={{
              fontSize:   '0.82rem',
              color:      T.txtTertiary,
              margin:     '0 0 32px',
              lineHeight: 1.6,
            }}>
              Begin planning when you're ready.
            </p>
            <button
              type="button"
              onClick={onCreateNew}
              style={{
                background:    T.gold,
                color:         '#0D0D0D',
                border:        'none',
                borderRadius:  4,
                padding:       '10px 24px',
                fontSize:      '0.75rem',
                fontWeight:    500,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                cursor:        'pointer',
              }}
            >
              Plan an event
            </button>
          </div>
        )}

        {/* ── Zero-search state ───────────────────────────────────── */}
        {noSearchHits && (
          <p style={{
            fontFamily: '"Fraunces", serif',
            fontStyle:  'italic',
            fontSize:   '0.875rem',
            color:      T.txtTertiary,
            margin:     '8px 0',
            lineHeight: 1.6,
          }}>
            Nothing matches — try a different name or client.
          </p>
        )}

        {/* ── TODAY — Priority zone, gold accent ──────────────────── */}
        {!hasNoEvents && (
          <section style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           16,
            ...SECTION_CONFIG.today.zoneStyle,
          }}>
            <SectionHeader section="today" count={today.length} />
            {today.length === 0
              ? <EmptyState message="The calendar is clear today." />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {today.map(e => (
                    <EventCard key={e.id} event={e} onSelect={onSelectEvent} variant="today" />
                  ))}
                </div>
              )
            }
          </section>
        )}

        {/* ── NEEDS ATTENTION — Priority zone, amber accent ───────── */}
        {!hasNoEvents && (
          <section style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           16,
            ...SECTION_CONFIG.attention.zoneStyle,
          }}>
            <SectionHeader section="attention" count={attention.length} />
            {attention.length === 0
              ? <EmptyState message="Every event is on track." />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {attention.map(e => (
                    <EventCard key={e.id} event={e} onSelect={onSelectEvent} variant="attention" />
                  ))}
                </div>
              )
            }
          </section>
        )}

        {/* ── UPCOMING — Standard operational surface ──────────────── */}
        {!hasNoEvents && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SectionHeader section="upcoming" count={upcoming.length} />
            {upcoming.length === 0
              ? <EmptyState message="No events on the horizon yet." />
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {upcoming.map(e => (
                    <EventCard key={e.id} event={e} onSelect={onSelectEvent} variant="default" />
                  ))}
                </div>
              )
            }
          </section>
        )}

        {/* ── ARCHIVE — Documentary, reduced visual weight ─────────── */}
        {!hasNoEvents && (
          <section style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           12,
            opacity:       0.75,
          }}>
            <SectionHeader
              section="archive"
              count={archive.length}
              onClick={() => setArchiveOpen(v => !v)}
              isOpen={archiveOpen}
            />
            {archiveOpen && (
              archive.length === 0
                ? <EmptyState message="No archived events." />
                : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {archive.map(e => (
                      <EventCard key={e.id} event={e} onSelect={onSelectEvent} variant="archive" />
                    ))}
                  </div>
                )
            )}
          </section>
        )}

      </div>
    </div>
  )
}
