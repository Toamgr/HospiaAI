import React, { useState } from 'react'
import EventList from './EventList'
import EventCreationWizard from './EventCreationWizard'
import EventDetail from './EventDetail'
import EventCheckin from './EventCheckin'

const VIEW = { LIST: 'list', CREATE: 'create', DETAIL: 'detail', CHECKIN: 'checkin' }

export default function EventCRM({
  currentUser,
  goToPage,
  events,
  isLoadingEvents,
  eventsError,
  selectedEventId,
  selectedEvent,
  guests,
  tables,
  tasks,
  timeline,
  messages,
  isLoadingDetail,
  detailError,
  onSelectEvent,
  onCreateEvent,
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
  const [view, setView] = useState(VIEW.LIST)

  function handleSelectEvent(id) {
    onSelectEvent(id)
    setView(VIEW.DETAIL)
  }

  function handleBackToList() {
    onSelectEvent(null)
    setView(VIEW.LIST)
  }

  async function handleCreateEvent(data) {
    const event = await onCreateEvent(data)
    onSelectEvent(event.id)
    setView(VIEW.DETAIL)
  }

  if (eventsError) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-zinc-400">Failed to load events</p>
          <p className="text-zinc-600 text-sm mt-1">{eventsError}</p>
        </div>
      </div>
    )
  }

  if (view === VIEW.CREATE) {
    return (
      <EventCreationWizard
        onCreateEvent={handleCreateEvent}
        onCancel={() => setView(VIEW.LIST)}
      />
    )
  }

  if (view === VIEW.CHECKIN && selectedEvent) {
    return (
      <EventCheckin
        event={selectedEvent}
        guests={guests}
        onCheckinGuest={onCheckinGuest}
        onBack={() => setView(VIEW.DETAIL)}
      />
    )
  }

  if (view === VIEW.DETAIL && selectedEvent) {
    return (
      <EventDetail
        currentUser={currentUser}
        goToPage={goToPage}
        event={selectedEvent}
        guests={guests}
        tables={tables}
        tasks={tasks}
        timeline={timeline}
        messages={messages}
        isLoadingDetail={isLoadingDetail}
        detailError={detailError}
        onBack={handleBackToList}
        onStartCheckin={() => setView(VIEW.CHECKIN)}
        onUpdateEvent={onUpdateEvent}
        onCancelEvent={onCancelEvent}
        onAddGuest={onAddGuest}
        onImportGuests={onImportGuests}
        onUpdateGuest={onUpdateGuest}
        onRemoveGuest={onRemoveGuest}
        onCheckinGuest={onCheckinGuest}
        onAddTable={onAddTable}
        onUpdateTable={onUpdateTable}
        onRemoveTable={onRemoveTable}
        onAssignSeats={onAssignSeats}
        onAddTask={onAddTask}
        onUpdateTask={onUpdateTask}
        onSendMessage={onSendMessage}
        refreshDetail={refreshDetail}
      />
    )
  }

  return (
    <EventList
      events={events}
      isLoading={isLoadingEvents}
      onSelectEvent={handleSelectEvent}
      onCreateNew={() => setView(VIEW.CREATE)}
    />
  )
}
