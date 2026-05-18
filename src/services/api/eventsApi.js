import { apiGet, apiPost, apiPatch, apiDelete } from './client'

// Events CRUD
export const fetchEvents = () => apiGet('/api/events')
export const createEvent = (data) => apiPost('/api/events', data)
export const fetchEvent = (id) => apiGet(`/api/events/${id}`)
export const updateEvent = (id, patch) => apiPatch(`/api/events/${id}`, patch)
export const cancelEvent = (id) => apiDelete(`/api/events/${id}`)

// Guests
export const fetchGuests = (eventId) => apiGet(`/api/events/${eventId}/guests`)
export const addGuest = (eventId, data) => apiPost(`/api/events/${eventId}/guests`, data)
export const importGuests = (eventId, guests) => apiPost(`/api/events/${eventId}/guests/import`, { guests })
export const updateGuest = (eventId, guestId, patch) => apiPatch(`/api/events/${eventId}/guests/${guestId}`, patch)
export const removeGuest = (eventId, guestId) => apiDelete(`/api/events/${eventId}/guests/${guestId}`)
export const checkinGuest = (eventId, guestId) => apiPost(`/api/events/${eventId}/guests/${guestId}/checkin`, {})

// Tables / Seating
export const fetchTables = (eventId) => apiGet(`/api/events/${eventId}/tables`)
export const addTable = (eventId, data) => apiPost(`/api/events/${eventId}/tables`, data)
export const updateTable = (eventId, tableId, patch) => apiPatch(`/api/events/${eventId}/tables/${tableId}`, patch)
export const removeTable = (eventId, tableId) => apiDelete(`/api/events/${eventId}/tables/${tableId}`)
export const assignSeats = (eventId, assignments) =>
  Promise.all(assignments.map(a => apiPost(`/api/events/${eventId}/tables/assign`, { guest_id: a.guest_id, table_id: a.table_id })))

// Tasks
export const fetchTasks = (eventId) => apiGet(`/api/events/${eventId}/tasks`)
export const addTask = (eventId, data) => apiPost(`/api/events/${eventId}/tasks`, data)
export const updateTask = (eventId, taskId, patch) => apiPatch(`/api/events/${eventId}/tasks/${taskId}`, patch)

// Timeline
export const fetchTimeline = (eventId) => apiGet(`/api/events/${eventId}/timeline`)

// Messaging
export const fetchMessages = (eventId) => apiGet(`/api/events/${eventId}/messages`)
export const sendMessage = (eventId, data) => apiPost(`/api/events/${eventId}/messages`, data)

// Cocktail menus
export const fetchCocktailMenu = (eventId) => apiGet(`/api/events/${eventId}/cocktail-menu`)
export const saveCocktailMenu = (eventId, data) => apiPost(`/api/events/${eventId}/cocktail-menu`, data)
export const approveCocktailMenu = (eventId) => apiPatch(`/api/events/${eventId}/cocktail-menu/approve`, {})
