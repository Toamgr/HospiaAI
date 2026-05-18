import { useState, useEffect, useCallback } from 'react'
import {
  fetchEvents, createEvent, updateEvent, cancelEvent,
  fetchGuests, addGuest, importGuests, updateGuest, removeGuest, checkinGuest,
  fetchTables, addTable, updateTable, removeTable, assignSeats,
  fetchTasks, addTask, updateTask,
  fetchTimeline,
  fetchMessages, sendMessage
} from '../services/api/eventsApi'

export function useEventState({ currentUser, pushNotification }) {
  const [events, setEvents] = useState([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(false)
  const [eventsError, setEventsError] = useState(null)

  const [selectedEventId, setSelectedEventId] = useState(null)
  const [guests, setGuests] = useState([])
  const [tables, setTables] = useState([])
  const [tasks, setTasks] = useState([])
  const [timeline, setTimeline] = useState([])
  const [messages, setMessages] = useState([])
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState(null)

  const loadEvents = useCallback(async () => {
    setIsLoadingEvents(true)
    setEventsError(null)
    try {
      const data = await fetchEvents()
      setEvents(data.events || [])
    } catch (err) {
      setEventsError(err.message)
    } finally {
      setIsLoadingEvents(false)
    }
  }, [])

  useEffect(() => {
    if (currentUser) loadEvents()
  }, [currentUser, loadEvents])

  const loadEventDetail = useCallback(async (eventId) => {
    if (!eventId) return
    setIsLoadingDetail(true)
    setDetailError(null)
    try {
      const [g, tb, tk, tl, m] = await Promise.all([
        fetchGuests(eventId),
        fetchTables(eventId),
        fetchTasks(eventId),
        fetchTimeline(eventId),
        fetchMessages(eventId)
      ])
      setGuests(g.guests || [])
      setTables(tb.tables || [])
      setTasks(tk.tasks || [])
      setTimeline(tl.timeline || [])
      setMessages(m.messages || [])
    } catch (err) {
      setDetailError(err.message)
    } finally {
      setIsLoadingDetail(false)
    }
  }, [])

  useEffect(() => {
    if (selectedEventId) loadEventDetail(selectedEventId)
    else {
      setGuests([])
      setTables([])
      setTasks([])
      setTimeline([])
      setMessages([])
    }
  }, [selectedEventId, loadEventDetail])

  const selectedEvent = events.find(e => e.id === selectedEventId) || null

  const handleCreateEvent = useCallback(async (data) => {
    const result = await createEvent({
      ...data,
      created_by: currentUser?.full_name || currentUser?.username || ''
    })
    setEvents(prev => [result.event, ...prev])
    pushNotification?.({
      roles: ['owner', 'admin', 'manager'],
      title: 'New event created',
      body: `${result.event.name} — ${result.event.event_date}`,
      type: 'event',
      page: 'eventCRM'
    })
    return result.event
  }, [currentUser, pushNotification])

  const handleUpdateEvent = useCallback(async (id, patch) => {
    const result = await updateEvent(id, patch)
    setEvents(prev => prev.map(e => e.id === id ? result.event : e))
    return result.event
  }, [])

  const handleCancelEvent = useCallback(async (id) => {
    await cancelEvent(id)
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'cancelled' } : e))
    if (selectedEventId === id) setSelectedEventId(null)
  }, [selectedEventId])

  const handleSelectEvent = useCallback((id) => {
    setSelectedEventId(id)
  }, [])

  // Guests
  const handleAddGuest = useCallback(async (eventId, data) => {
    const result = await addGuest(eventId, data)
    setGuests(prev => [...prev, result.guest])
    return result.guest
  }, [])

  const handleImportGuests = useCallback(async (eventId, guestList) => {
    const result = await importGuests(eventId, guestList)
    await loadEventDetail(eventId)
    return result
  }, [loadEventDetail])

  const handleUpdateGuest = useCallback(async (eventId, guestId, patch) => {
    const result = await updateGuest(eventId, guestId, patch)
    setGuests(prev => prev.map(g => g.id === guestId ? result.guest : g))
    return result.guest
  }, [])

  const handleRemoveGuest = useCallback(async (eventId, guestId) => {
    await removeGuest(eventId, guestId)
    setGuests(prev => prev.filter(g => g.id !== guestId))
  }, [])

  const handleCheckinGuest = useCallback(async (eventId, guestId) => {
    const result = await checkinGuest(eventId, guestId)
    setGuests(prev => prev.map(g => g.id === guestId ? result.guest : g))
    return result.guest
  }, [])

  // Tables
  const handleAddTable = useCallback(async (eventId, data) => {
    const result = await addTable(eventId, data)
    setTables(prev => [...prev, result.table])
    return result.table
  }, [])

  const handleUpdateTable = useCallback(async (eventId, tableId, patch) => {
    const result = await updateTable(eventId, tableId, patch)
    setTables(prev => prev.map(t => t.id === tableId ? result.table : t))
    return result.table
  }, [])

  const handleRemoveTable = useCallback(async (eventId, tableId) => {
    await removeTable(eventId, tableId)
    setTables(prev => prev.filter(t => t.id !== tableId))
    setGuests(prev => prev.map(g => g.table_id === tableId ? { ...g, table_id: null } : g))
  }, [])

  const handleAssignSeats = useCallback(async (eventId, assignments) => {
    await assignSeats(eventId, assignments)
    await loadEventDetail(eventId)
  }, [loadEventDetail])

  // Tasks
  const handleAddTask = useCallback(async (eventId, data) => {
    const result = await addTask(eventId, data)
    setTasks(prev => [...prev, result.task])
    return result.task
  }, [])

  const handleUpdateTask = useCallback(async (eventId, taskId, patch) => {
    const result = await updateTask(eventId, taskId, patch)
    setTasks(prev => prev.map(t => t.id === taskId ? result.task : t))
    return result.task
  }, [])

  // Messaging
  const handleSendMessage = useCallback(async (eventId, data) => {
    const result = await sendMessage(eventId, data)
    setMessages(prev => [...prev, result.message])
    return result.message
  }, [])

  const refreshDetail = useCallback(() => {
    if (selectedEventId) loadEventDetail(selectedEventId)
  }, [selectedEventId, loadEventDetail])

  return {
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
    onSelectEvent: handleSelectEvent,
    onCreateEvent: handleCreateEvent,
    onUpdateEvent: handleUpdateEvent,
    onCancelEvent: handleCancelEvent,
    onAddGuest: handleAddGuest,
    onImportGuests: handleImportGuests,
    onUpdateGuest: handleUpdateGuest,
    onRemoveGuest: handleRemoveGuest,
    onCheckinGuest: handleCheckinGuest,
    onAddTable: handleAddTable,
    onUpdateTable: handleUpdateTable,
    onRemoveTable: handleRemoveTable,
    onAssignSeats: handleAssignSeats,
    onAddTask: handleAddTask,
    onUpdateTask: handleUpdateTask,
    onSendMessage: handleSendMessage,
    refreshDetail
  }
}
