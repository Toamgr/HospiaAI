import React, { useState } from 'react'
import EventOverview from './tabs/EventOverview'
import EventGuests from './tabs/EventGuests'
import EventSeating from './tabs/EventSeating'
import EventTasks from './tabs/EventTasks'
import EventTimeline from './tabs/EventTimeline'
import EventMessaging from './tabs/EventMessaging'
import EventTeam from './tabs/EventTeam'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'guests', label: 'Guests' },
  { id: 'seating', label: 'Seating' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'team', label: 'Team' },
  { id: 'timeline', label: 'Timeline' }
]

const STATUS_COLORS = {
  draft: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  confirmed: 'text-emerald-400 bg-emerald-950/40 border-emerald-800',
  in_preparation: 'text-amber-400 bg-amber-950/40 border-amber-800',
  ready: 'text-sky-400 bg-sky-950/40 border-sky-800',
  live: 'text-green-400 bg-green-950/40 border-green-800',
  completed: 'text-zinc-500 bg-zinc-800 border-zinc-700',
  cancelled: 'text-red-400 bg-red-950/40 border-red-800'
}

const STATUS_LABELS = {
  draft: 'Draft', confirmed: 'Confirmed', in_preparation: 'In Preparation',
  ready: 'Ready', live: 'Live', completed: 'Completed', cancelled: 'Cancelled'
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

  const statusColor = STATUS_COLORS[event.status] || STATUS_COLORS.draft

  function formatDate(dateStr) {
    if (!dateStr) return ''
    try {
      return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch { return dateStr }
  }

  const tabBadges = {
    guests: guests.length || null,
    tasks: tasks.filter(t => t.status !== 'done').length || null,
    messages: messages.length || null
  }

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-zinc-500 hover:text-white text-sm mt-0.5 transition-colors shrink-0"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor}`}>
              {STATUS_LABELS[event.status] || event.status}
            </span>
            <span className="text-xs text-zinc-600">{formatDate(event.event_date)}</span>
          </div>
          <h1 className="text-xl font-light text-white truncate" style={{ color: event.theme_color || undefined }}>{event.name}</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{event.client_name}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!['cancelled', 'completed'].includes(event.status) && onStartCheckin && (
            <button
              type="button"
              onClick={onStartCheckin}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-zinc-300 transition-colors"
            >
              Check-in mode
            </button>
          )}
          {event.status !== 'cancelled' && event.status !== 'completed' && (
            confirmCancel ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Cancel event?</span>
                <button type="button" onClick={() => onCancelEvent(event.id)} className="text-xs text-red-400 hover:text-red-300">Yes</button>
                <button type="button" onClick={() => setConfirmCancel(false)} className="text-xs text-zinc-500 hover:text-zinc-300">No</button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmCancel(true)} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">
                Cancel event
              </button>
            )
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-zinc-800">
        {TABS.map(tab => {
          const badge = tabBadges[tab.id]
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap rounded-t transition-colors ${
                activeTab === tab.id
                  ? 'text-amber-400 border-b-2 border-amber-400 -mb-px'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
              {badge ? (
                <span className={`text-xs px-1.5 rounded-full ${activeTab === tab.id ? 'bg-amber-900/60 text-amber-300' : 'bg-zinc-800 text-zinc-400'}`}>
                  {badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Loading/error states */}
      {isLoadingDetail && (
        <div className="text-center py-10 text-zinc-500 text-sm">Loading…</div>
      )}
      {detailError && (
        <div className="text-center py-10">
          <p className="text-zinc-400">{detailError}</p>
          <button type="button" onClick={refreshDetail} className="text-xs text-amber-500 mt-2">Retry</button>
        </div>
      )}

      {/* Tab content */}
      {!isLoadingDetail && !detailError && (
        <>
          {activeTab === 'overview' && (
            <EventOverview
              event={event}
              guests={guests}
              tasks={tasks}
              onUpdateEvent={onUpdateEvent}
              onUpdateTask={onUpdateTask}
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
