// Venue API (Phase 8 — Multi-Venue Foundation).
//
// A venue is the memory unit. These calls drive the venue selector and let an
// owner / platform admin create a new venue. Access is enforced server-side;
// the frontend only ever sees the venues the current user may access.

import { apiGet, apiPost } from './client'

// Venues the current user can access + the venue resolved for this session:
// { venues: [{ id, name, venue_type, description, created_at }], currentVenueId }
export const fetchVenues = () => apiGet('/api/venues')

// Create a venue (owner / platform admin). Returns { venue }.
export const createVenue = ({ name, venueType, description }) =>
  apiPost('/api/venues', { name, venue_type: venueType, description: description || null })
