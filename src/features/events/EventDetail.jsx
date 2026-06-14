import React, { useState } from 'react'
import '@fontsource/fraunces/600.css'
import { canExportCalendar, downloadEventCalendar, CALENDAR_TOAST_MSG } from './utils/calendarExportUtils'
import EventOverview from './tabs/EventOverview'
import EventGuests from './tabs/EventGuests'
import EventSeating from './tabs/EventSeating'
import EventTasks from './tabs/EventTasks'
import EventTimeline from './tabs/EventTimeline'
import EventMessaging from './tabs/EventMessaging'
import EventTeam from './tabs/EventTeam'
import EventZohar from './tabs/EventZohar'
import EventCocktailMenu from './tabs/EventCocktailMenu'

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'zohar',        label: 'Zohar',        intelligence: true },
  { id: 'cocktailMenu', label: 'Cocktail Menu', intelligence: true },
  { id: 'guests',       label: 'Guests' },
  { id: 'seating',      label: 'Seating' },
  { id: 'tasks',        label: 'Tasks' },
  { id: 'messaging',    label: 'Messaging' },
  { id: 'team',         label: 'Team' },
  { id: 'timeline',     label: 'Timeline' },
]

const STATUS_CHIPS = {
  draft:          { label: 'Draft',          bg: 'rgba(90,84,80,0.18)',    color: '#9A9590', border: null },
  confirmed:      { label: 'Confirmed',      bg: 'rgba(201,169,110,0.10)', color: '#C9A96E', border: null },
  in_preparation: { label: 'In Preparation', bg: 'transparent',            color: '#5A5550', border: '#3A3A3A' },
  ready:          { label: 'Ready',          bg: 'rgba(42,92,139,0.18)',   color: '#6BA0CF', border: null },
  live:           { label: 'Live',           bg: 'rgba(74,124,89,0.18)',   color: '#6BAF80', border: null },
  completed:      { label: 'Completed',      bg: 'rgba(50,50,50,0.30)',    color: '#5A5550', border: null },
  cancelled:      { label: 'Cancelled',      bg: 'rgba(139,58,58,0.18)',   color: '#C07070', border: null },
}

const EVENT_TYPE_LABELS = {
  wedding: 'Wedding', corporate: 'Corporate', private: 'Private Party',
  bar_event: 'Bar Event', other: 'Other',
}

// Shared ghost-gold button style for header actions
const ghostGoldStyle = {
  background:  'rgba(201,169,110,0.06)',
  border:      '1px solid rgba(201,169,110,0.25)',
  color:       '#C9A96E',
  borderRadius: 6,
  padding:     '7px 14px',
  fontSize:    '0.70rem',
  fontWeight:  500,
  letterSpacing: '0.06em',
  cursor:      'pointer',
  transition:  'background 150ms ease',
  whiteSpace:  'nowrap',
}

function GhostGoldButton({ onClick, children, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...ghostGoldStyle, ...style }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.12)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.06)' }}
    >
      {children}
    </button>
  )
}

export default function EventDetail({
  currentUser,
  goToPage,
  event,
  guests,
  tables,
  tasks,
  timeline,
  messages,
  isLoadingDetail,
  detailError,
  onBack,
  onStartCheckin,
  onUpdateEvent,
  onCancelEvent,
  onAddGuest,
  onImportGuests,
  onUpdateGuest,
  onRemoveGuest,
  onCheckinGuest,
  onAddTable,
  onUpdateTable,
  onRemoveTable,
  onAssignSeats,
  onAddTask,
  onUpdateTask,
  onSendMessage,
  refreshDetail
}) {
  const [activeTab, setActiveTab] = useState('overview')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [calToast, setCalToast] = useState(false)
  const [cocktailMenuStatus, setCocktailMenuStatus] = useState(null)

  function handleCalendarDownload() {
    const downloaded = downloadEventCalendar(event)
    if (downloaded) {
      setCalToast(true)
      setTimeout(() => setCalToast(false), 3500)
    }
  }

  const chip = STATUS_CHIPS[event.status] || STATUS_CHIPS.draft

  function formatDate(dateStr) {
    if (!dateStr) return ''
    try {
      return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    } catch { return dateStr }
  }

  const tabBadges = {
    guests:   guests.length || null,
    tasks:    tasks.filter(t => t.status !== 'done').length || null,
    messages: messages.length || null,
  }

  return (
    <div className="space-y-5">

      {/* ── Premium event header ─────────────────────────────────────────── */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>

        {/* Atmospheric glow — top-left, non-interactive */}
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: -20, right: 0, height: 130,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 10% 0%, rgba(201,169,110,0.07), transparent 60%)',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 12 }}>

          {/* Back */}
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#5A5550', fontSize: 16, padding: '4px 0',
              marginTop: 6, flexShrink: 0, lineHeight: 1,
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F5F0E8' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#5A5550' }}
          >
            ←
          </button>

          {/* Event identity */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Eyebrow: status chip · event type · date */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              flexWrap: 'wrap', marginBottom: 10,
            }}>
              <span style={{
                display: 'inline-block',
                background: chip.bg,
                color: chip.color,
                border: `1px solid ${chip.border || 'transparent'}`,
                borderRadius: 100, padding: '2px 9px',
                fontSize: '0.60rem', fontWeight: 600,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                lineHeight: 1.6, whiteSpace: 'nowrap',
              }}>
                {chip.label}
              </span>
              {event.event_type && (
                <span style={{
                  fontSize: '0.60rem', fontWeight: 500,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: '#5A5550',
                }}>
                  {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
                </span>
              )}
              <span style={{ fontSize: '0.68rem', color: '#3A3A3A', letterSpacing: '0.02em' }}>
                {formatDate(event.event_date)}
                {event.start_time ? ` · ${event.start_time}` : ''}
              </span>
            </div>

            {/* Event name — Fraunces */}
            <h1 style={{
              fontFamily: '"Fraunces", serif',
              fontSize: '1.55rem', fontWeight: 600,
              color: event.theme_color || '#F5F0E8',
              margin: 0, lineHeight: 1.15, letterSpacing: '-0.015em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {event.name}
            </h1>

            {/* Client name */}
            {event.client_name && (
              <p style={{ fontSize: '0.82rem', color: '#9A9590', margin: '5px 0 0', lineHeight: 1 }}>
                {event.client_name}
              </p>
            )}

            {/* Creative vision — surface single_sentence in the header */}
            {event.single_sentence && (
              <p style={{
                fontSize: '0.72rem', color: 'rgba(201,169,110,0.50)',
                fontStyle: 'italic', margin: '8px 0 0', lineHeight: 1.5,
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                "{event.single_sentence}"
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end',
          }}>
            {['events_manager', 'manager', 'owner', 'admin'].includes(currentUser?.role) && (
              <GhostGoldButton
                onClick={() => {
                  try { sessionStorage.setItem('hestia.architect.linkId', String(event.id)) } catch {}
                  goToPage('eventBrain', { eventId: event.id })
                }}
              >
                Architect Plan
              </GhostGoldButton>
            )}

            {canExportCalendar(event) ? (
              <div style={{ position: 'relative' }}>
                <GhostGoldButton onClick={handleCalendarDownload}>
                  Add to Calendar
                </GhostGoldButton>
                {calToast && (
                  <div style={{
                    position: 'absolute', top: '110%', left: 0,
                    background: '#1A1A1A', border: '1px solid rgba(201,169,110,0.25)',
                    borderRadius: 5, color: '#C9A96E', fontSize: 9, fontWeight: 600,
                    padding: '5px 10px', whiteSpace: 'nowrap',
                    zIndex: 50, letterSpacing: '0.03em', boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  }}>
                    {CALENDAR_TOAST_MSG}
                  </div>
                )}
              </div>
            ) : (
              <span style={{ fontSize: '0.65rem', color: '#3A3A3A' }}>Start time required</span>
            )}

            {!['cancelled', 'completed'].includes(event.status) && onStartCheckin && (
              <button
                type="button"
                onClick={onStartCheckin}
                style={{
                  background: '#1A1A1A', border: '1px solid #2A2A2A',
                  color: '#9A9590', borderRadius: 6,
                  padding: '7px 14px', fontSize: '0.70rem', fontWeight: 500,
                  cursor: 'pointer', transition: 'background 150ms ease', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#242424' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1A1A1A' }}
              >
                Check-in
              </button>
            )}

            {event.status !== 'cancelled' && event.status !== 'completed' && (
              confirmCancel ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.68rem', color: '#9A9590' }}>Cancel event?</span>
                  <button type="button" onClick={() => onCancelEvent(event.id)}
                    style={{ fontSize: '0.68rem', color: '#C07070', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Yes
                  </button>
                  <button type="button" onClick={() => setConfirmCancel(false)}
                    style={{ fontSize: '0.68rem', color: '#5A5550', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    No
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmCancel(true)}
                  style={{
                    fontSize: '0.68rem', color: '#3A3A3A',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#C07070' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#3A3A3A' }}
                >
                  Cancel event
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Tab bar — HESTIA gold system ─────────────────────────────────── */}
      <div style={{
        display: 'flex', overflowX: 'auto',
        borderBottom: '1px solid #2A2A2A',
      }}>
        {TABS.map(tab => {
          const badge = tabBadges[tab.id]
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '8px 14px',
                background: 'none', border: 'none',
                borderBottom: `2px solid ${isActive ? '#C9A96E' : 'transparent'}`,
                marginBottom: -1,
                color: isActive ? '#C9A96E' : '#5A5550',
                fontSize: '0.72rem', fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.04em',
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'color 150ms ease',
                flexShrink: 0,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#9A9590' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#5A5550' }}
            >
              {tab.intelligence && (
                <span style={{
                  fontSize: 7, lineHeight: 1,
                  color: isActive ? 'rgba(201,169,110,0.70)' : '#3A3A3A',
                }}>
                  ✦
                </span>
              )}
              {tab.label}
              {badge ? (
                <span style={{
                  fontSize: '0.60rem', padding: '1px 5px', borderRadius: 100,
                  background: isActive ? 'rgba(201,169,110,0.15)' : 'rgba(90,84,80,0.20)',
                  color: isActive ? '#C9A96E' : '#5A5550',
                }}>
                  {badge}
                </span>
              ) : tab.id === 'cocktailMenu' && cocktailMenuStatus === 'approved' ? (
                <span style={{
                  fontSize: 8, fontWeight: 700, lineHeight: 1,
                  color: isActive ? '#C9A96E' : '#5A4A2A',
                }}>✓</span>
              ) : tab.id === 'cocktailMenu' && cocktailMenuStatus === 'draft' ? (
                <span style={{
                  display: 'inline-block', width: 4, height: 4,
                  borderRadius: '50%', flexShrink: 0,
                  background: isActive ? '#C9A96E' : '#4A3A20',
                }} />
              ) : null}
            </button>
          )
        })}
      </div>

      {/* ── Loading / error states ───────────────────────────────────────── */}
      {isLoadingDetail && (
        <div className="text-center py-10 text-zinc-500 text-sm">Loading…</div>
      )}
      {detailError && (
        <div className="text-center py-10">
          <p className="text-zinc-400">{detailError}</p>
          <button type="button" onClick={refreshDetail} className="text-xs text-amber-500 mt-2">Retry</button>
        </div>
      )}

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      {!isLoadingDetail && !detailError && (
        <>
          {activeTab === 'overview' && (
            <EventOverview
              event={event}
              guests={guests}
              tasks={tasks}
              onUpdateEvent={onUpdateEvent}
              onUpdateTask={onUpdateTask}
              currentUser={currentUser}
              refreshDetail={refreshDetail}
            />
          )}
          {activeTab === 'zohar' && (
            <EventZohar
              event={event}
              guests={guests}
              tables={tables}
              tasks={tasks}
              timeline={timeline}
              currentUser={currentUser}
              goToPage={goToPage}
              onAddTask={onAddTask}
              onUpdateTask={onUpdateTask}
              refreshDetail={refreshDetail}
            />
          )}
          {activeTab === 'guests' && (
            <EventGuests
              event={event}
              guests={guests}
              onAddGuest={onAddGuest}
              onImportGuests={onImportGuests}
              onUpdateGuest={onUpdateGuest}
              onRemoveGuest={onRemoveGuest}
              onCheckinGuest={onCheckinGuest}
            />
          )}
          {activeTab === 'seating' && (
            <EventSeating
              event={event}
              guests={guests}
              tables={tables}
              onAddTable={onAddTable}
              onUpdateTable={onUpdateTable}
              onRemoveTable={onRemoveTable}
              onAssignSeats={onAssignSeats}
              onUpdateGuest={onUpdateGuest}
            />
          )}
          {activeTab === 'tasks' && (
            <EventTasks
              event={event}
              tasks={tasks}
              onAddTask={onAddTask}
              onUpdateTask={onUpdateTask}
              goToPage={goToPage}
              onGoToOverview={() => setActiveTab('overview')}
            />
          )}
          {activeTab === 'cocktailMenu' && (
            <EventCocktailMenu
              event={event}
              guests={guests}
              tables={tables}
              tasks={tasks}
              timeline={timeline}
              currentUser={currentUser}
              onUpdateTask={onUpdateTask}
              refreshDetail={refreshDetail}
              onMenuStatusChange={({ status }) => setCocktailMenuStatus(status)}
            />
          )}
          {activeTab === 'messaging' && (
            <EventMessaging
              event={event}
              messages={messages}
              guests={guests}
              onSendMessage={onSendMessage}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'team' && (
            <EventTeam event={event} guests={guests} />
          )}
          {activeTab === 'timeline' && (
            <EventTimeline timeline={timeline} />
          )}
        </>
      )}
    </div>
  )
}
