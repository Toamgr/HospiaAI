// Venue Intelligence Bridge — shared read service.
//
// This is the single entry point specialist HESTIA modules use to consume the
// briefs derived from Venue DNA. Modules import these functions; they do not
// talk to the venue_briefs table or the Venue Learning Engine directly.
//
// Routes to /api/venue-bridge/* on the Express backend.

import { apiGet, apiPost } from './client'

// All specialist briefs for the active venue: { briefs: [...] }
export const fetchVenueBriefs = () => apiGet('/api/venue-bridge/briefs')

// A single specialist brief by type: 'fb' | 'training' | 'service' | 'event' | 'owner'
export const fetchVenueBrief = (type) => apiGet(`/api/venue-bridge/briefs/${type}`)

// Force a regeneration from the current Venue DNA (owner/admin). Returns { briefs }.
export const regenerateVenueBriefs = () => apiPost('/api/venue-bridge/regenerate', {})

// Academy capability context: { active, capabilitySignals, recommendations }
export const fetchAcademyContext = () => apiGet('/api/venue-bridge/academy')

// Operational intelligence feed (owner/admin): { signals, enrichment }
export const fetchOperationalIntelligence = () => apiGet('/api/venue-bridge/operations')

// Owner Intelligence narrative (owner/admin): { active, headline, learnings }
export const fetchOwnerIntelligence = () => apiGet('/api/venue-bridge/owner-intelligence')

// Unified Intelligence Context (owner/admin) — the single shared venue understanding
// that every specialist consumes a slice of. The reusable read for future modules.
export const fetchUnifiedContext = () => apiGet('/api/venue-bridge/context')
