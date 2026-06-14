// Venue Intelligence API client — the Venue Learning Engine.
// Owner/Admin only. All calls route to /api/venue-intelligence on the Express backend.
// Uses the shared apiGet/apiPost from client.js (auth token injected automatically).

import { apiGet, apiPost } from './client'

// Current learning session for the venue: { state: { stage, objective, messages, venueDNA, updatedAt } }
export const fetchVenueIntelligence = () => apiGet('/api/venue-intelligence')

// Send the owner's message. Returns { reply, stage, objective, venueDNA, focusSuggestions }.
export const sendVenueIntelligenceMessage = (message) =>
  apiPost('/api/venue-intelligence/message', { message })

// Start a fresh learning session. Returns { state }.
export const resetVenueIntelligence = () => apiPost('/api/venue-intelligence/reset', {})
