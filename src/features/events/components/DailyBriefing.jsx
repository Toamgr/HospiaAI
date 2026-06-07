/**
 * DailyBriefing — operational command briefing for the Event Calendar.
 *
 * Renders the output of buildDailyBriefing in role-differentiated sections.
 *
 * events_manager / admin : full briefing (all sections)
 * owner / manager        : Today Summary card only (no actions, no deadlines, no risk details)
 */

import React from 'react'
import { canExportCalendar, downloadEventCalendar } from '../utils/calendarExportUtils'

// ── Design tokens (shared with EventCalendar) ─────────────────────────────────

const EVENT_TYPE_LABELS = {
  wedding: 'Wedding', corporate: 'Corporate', private: 'Private',
  bar_event: 'Bar Event', other: 'Event',
}

const TYPE_CHIP = {
  wedding:   { text: '#f472b6' },
  corporate: { text: '#60a5fa' },
  private:   { text: '#4ade80' },
  bar_event: { text: '#C9A96E' },
  other:     { text: '#71717a' },
}

const DUE_COLOR = {
  critical: '#C44A4A',
  warning:  '#D4943A',
  normal:   '#C9A96E',
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize:      8,
      fontWeight:    700,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color:         '#5A5550',
      marginBottom:  7,
    }}>
      {children}
    </div>
  )
}

// ── Today Summary ─────────────────────────────────────────────────────────────

function StatPill({ label, value, color, muted }) {
  return (
    <div style={{
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      padding:       '7px 12px',
      background:    color && !muted ? `${color}0D` : '#0A0A0A',
      border:        `1px solid ${color && !muted ? `${color}22` : '#1A1A1A'}`,
      borderRadius:  6,
      minWidth:      56,
    }}>
      <span style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize:   18,
        fontWeight: 700,
        color:      color && !muted ? color : '#9A9590',
        lineHeight: 1,
      }}>
        {value}
      </span>
      <span style={{
        fontSize:      8,
        fontWeight:    700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color:         color && !muted ? `${color}99` : '#3A3A3A',
        marginTop:     3,
      }}>
        {label}
      </span>
    </div>
  )
}

function TodaySummary({ todaySummary, showDetails }) {
  const { totalEvents, criticalCount, attentionCount, readyCount, nextUpcomingEvent, highestRiskEvent } = todaySummary

  const hasNext    = Boolean(nextUpcomingEvent)
  const hasHighest = Boolean(highestRiskEvent)

  return (
    <div style={{
      background:   '#0C0C0C',
      border:       '1px solid #1A1A1A',
      borderRadius: 8,
      padding:      '12px 14px',
      marginBottom: 14,
    }}>
      <div style={{
        fontSize:      8,
        fontWeight:    700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color:         '#3A3A3A',
        marginBottom:  10,
      }}>
        Daily Briefing
      </div>

      {/* Stat row */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: (hasNext || hasHighest) ? 10 : 0 }}>
        <StatPill label="Events"   value={totalEvents}   />
        <StatPill label="Critical" value={criticalCount}  color={criticalCount  > 0 ? '#C44A4A' : null} muted={criticalCount  === 0} />
        <StatPill label="Attention" value={attentionCount} color={attentionCount > 0 ? '#C9A96E' : null} muted={attentionCount === 0} />
        <StatPill label="Ready"    value={readyCount}     color={readyCount     > 0 ? '#6BAF80' : null} muted={readyCount     === 0} />
      </div>

      {/* Next event + highest risk — visible to all roles */}
      {(hasNext || hasHighest) && (
        <div style={{
          display:    'flex',
          gap:        16,
          flexWrap:   'wrap',
          paddingTop: 10,
          borderTop:  '1px solid #141414',
        }}>
          {hasNext && (
            <div>
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#3A3A3A' }}>
                Next:{' '}
              </span>
              <span style={{ fontSize: 9, color: '#9A9590' }}>
                {nextUpcomingEvent.name}
              </span>
              {nextUpcomingEvent.daysUntil != null && (
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize:   9,
                  color:      nextUpcomingEvent.daysUntil <= 7 ? '#D4943A' : '#5A5550',
                  marginLeft: 4,
                }}>
                  · {nextUpcomingEvent.daysUntil === 0 ? 'Today' : `${nextUpcomingEvent.daysUntil}d`}
                </span>
              )}
            </div>
          )}
          {hasHighest && showDetails && (
            <div>
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#3A3A3A' }}>
                Highest Risk:{' '}
              </span>
              <span style={{ fontSize: 9, color: '#9A9590' }}>
                {highestRiskEvent.name}
              </span>
              {highestRiskEvent.score != null && (
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize:   9,
                  color:      '#C44A4A',
                  marginLeft: 4,
                }}>
                  · {highestRiskEvent.score}%
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Event brief card ──────────────────────────────────────────────────────────

function EventBriefCard({ event, intel, accentColor, showAction, onClick }) {
  const health     = intel?.eventHealth
  const summary    = intel?.calendarSummary
  const nextAction = intel?.nextAction
  const typeLabel  = EVENT_TYPE_LABELS[event.event_type] || 'Event'
  const typeColor  = (TYPE_CHIP[event.event_type] || TYPE_CHIP.other).text

  const daysText = summary?.daysUntil == null  ? null
    : summary.daysUntil <= 0  ? 'Today'
    : summary.daysUntil === 1 ? '1 day'
    : `${summary.daysUntil} days`

  const daysColor = summary?.daysUntil != null && summary.daysUntil <= 7
    ? '#D4943A' : '#5A5550'

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
      style={{
        background:   '#111111',
        border:       '1px solid #1E1E1E',
        borderLeft:   `3px solid ${accentColor || health?.color || '#3A3A3A'}`,
        borderRadius: 6,
        cursor:       'pointer',
        padding:      '10px 12px',
        transition:   'background 120ms ease',
        userSelect:   'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#161616' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#111111' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize:     11,
            fontWeight:   700,
            color:        '#F5F0E8',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {event.name}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 2, alignItems: 'center' }}>
            <span style={{ fontSize: 8, color: typeColor, fontWeight: 600 }}>{typeLabel}</span>
            {daysText && (
              <span style={{ fontSize: 8, color: daysColor, fontFamily: '"JetBrains Mono", monospace' }}>
                {daysText}
              </span>
            )}
          </div>
        </div>
        {health && (
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: accentColor || health.color, lineHeight: 1.2 }}>
              {health.status}
            </div>
            <div style={{ fontSize: 9, color: '#5A5550', fontFamily: '"JetBrains Mono", monospace' }}>
              {health.score}%
              <span style={{ fontSize: 7, color: '#3A3A3A', marginLeft: 2 }}>est.</span>
            </div>
          </div>
        )}
      </div>

      {showAction && nextAction && nextAction !== 'No immediate action required' && (
        <div style={{
          marginTop:  7,
          padding:    '4px 7px',
          background: 'rgba(201,169,110,0.05)',
          borderRadius: 3,
        }}>
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5A5550' }}>
            Action:{' '}
          </span>
          <span style={{ fontSize: 9, color: '#9A9590', lineHeight: 1.5 }}>
            {nextAction}
          </span>
        </div>
      )}

      {/* Add To Calendar */}
      <div style={{ marginTop: 7 }}>
        {canExportCalendar(event) ? (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); downloadEventCalendar(event) }}
            style={{
              background:    'transparent',
              border:        '1px solid rgba(201,169,110,0.20)',
              borderRadius:  4,
              color:         '#C9A96E',
              cursor:        'pointer',
              fontSize:      8,
              fontWeight:    700,
              letterSpacing: '0.10em',
              padding:       '3px 9px',
              textTransform: 'uppercase',
              transition:    'all 120ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            📅 Add To Calendar
          </button>
        ) : (
          <span style={{ fontSize: 8, color: '#3A3A3A', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Start time required for calendar
          </span>
        )}
      </div>
    </div>
  )
}

// ── Deadline card ─────────────────────────────────────────────────────────────

function DeadlineCard({ deadline }) {
  const color    = DUE_COLOR[deadline.dueLevel] || '#C9A96E'
  const daysText = deadline.daysRemaining === 0 ? 'Today'
    : deadline.daysRemaining === 1 ? '1 day'
    : `${deadline.daysRemaining}d`

  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          10,
      padding:      '8px 10px',
      background:   '#111111',
      border:       '1px solid #1A1A1A',
      borderLeft:   `3px solid ${color}`,
      borderRadius: 5,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize:     10,
          fontWeight:   700,
          color:        '#F5F0E8',
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}>
          {deadline.eventName}
        </div>
        <div style={{
          fontSize:     9,
          color:        '#7A7570',
          marginTop:    1,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}>
          {deadline.action}
        </div>
      </div>
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        <span style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize:   9,
          color:      color,
          fontWeight: 700,
        }}>
          {daysText}
        </span>
        <span style={{
          fontSize:      7,
          fontWeight:    700,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color:         color,
          background:    `${color}15`,
          border:        `1px solid ${color}30`,
          borderRadius:  3,
          padding:       '1px 5px',
        }}>
          {deadline.dueLevel}
        </span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DailyBriefing({ briefing, intelligenceMap, isFullAccess, onEventSelect }) {
  if (!briefing) return null

  const { criticalEvents, attentionEvents, readyEvents, upcomingDeadlines, todaySummary } = briefing

  const hasCritical  = criticalEvents.length  > 0
  const hasAttention = attentionEvents.length > 0
  const hasReady     = readyEvents.length     > 0
  const hasDeadlines = upcomingDeadlines.length > 0
  const allClear     = !hasCritical && !hasAttention && !hasDeadlines && todaySummary.totalEvents > 0

  return (
    <div style={{ marginBottom: 20 }}>

      {/* Today Summary — visible to all roles */}
      <TodaySummary
        todaySummary={todaySummary}
        showDetails={isFullAccess}
      />

      {/* Full access briefing sections only */}
      {isFullAccess && (
        <>
          {/* No events */}
          {todaySummary.totalEvents === 0 && (
            <div style={{
              padding:      '10px 14px',
              background:   '#0A0A0A',
              border:       '1px solid #1A1A1A',
              borderRadius: 6,
              fontSize:     10,
              color:        '#3A3A3A',
              fontStyle:    'italic',
              marginBottom: 14,
            }}>
              No active events scheduled.
            </div>
          )}

          {/* All clear */}
          {allClear && (
            <div style={{
              padding:      '10px 14px',
              background:   'rgba(107,175,128,0.07)',
              border:       '1px solid rgba(107,175,128,0.18)',
              borderRadius: 6,
              fontSize:     10,
              color:        '#6BAF80',
              fontWeight:   600,
              marginBottom: 14,
            }}>
              All events are on track — no critical issues or upcoming deadlines.
            </div>
          )}

          {/* Critical Events */}
          {hasCritical && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel>Critical Today</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {criticalEvents.slice(0, 5).map(ev => (
                  <EventBriefCard
                    key={ev.id}
                    event={ev}
                    intel={intelligenceMap[ev.id]}
                    accentColor="#C44A4A"
                    showAction={true}
                    onClick={() => onEventSelect?.(ev.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Deadlines */}
          {hasDeadlines && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel>Upcoming Deadlines</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {upcomingDeadlines.slice(0, 8).map((dl, i) => (
                  <DeadlineCard key={`${dl.eventId}-${i}`} deadline={dl} />
                ))}
              </div>
            </div>
          )}

          {/* Needs Attention */}
          {hasAttention && (
            <div style={{ marginBottom: 14 }}>
              <SectionLabel>Needs Attention</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {attentionEvents.slice(0, 5).map(ev => (
                  <EventBriefCard
                    key={ev.id}
                    event={ev}
                    intel={intelligenceMap[ev.id]}
                    accentColor="#C9A96E"
                    showAction={true}
                    onClick={() => onEventSelect?.(ev.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Ready Events */}
          {hasReady && (
            <div style={{ marginBottom: 0 }}>
              <SectionLabel>Ready Events</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {readyEvents.slice(0, 5).map(ev => (
                  <EventBriefCard
                    key={ev.id}
                    event={ev}
                    intel={intelligenceMap[ev.id]}
                    accentColor="#6BAF80"
                    showAction={false}
                    onClick={() => onEventSelect?.(ev.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
