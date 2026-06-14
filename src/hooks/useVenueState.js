import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchVenues, createVenue as apiCreateVenue } from '../services/api/venuesApi'
import { setCurrentVenue as setClientVenue, initCurrentVenue } from '../services/api/client'
import { STORAGE } from '../config/systemConfig'

// Phase 8 — Multi-Venue Foundation.
//
// Owns the venue (memory unit) context for the session: which venues the
// operator can access and which one is currently selected. The selected venue
// is sent to the backend as X-HESTIA-Venue (via the API client) and persisted
// in localStorage so it survives reloads. Backend validates access — switching
// to a venue you do not belong to is rejected server-side (403).
//
// Single-venue behavior is unchanged: when the user has one venue, the selector
// is hidden (see TopNav) and there is no friction.
export function useVenueState(currentUser) {
  const [venues, setVenues] = useState([])
  const [currentVenueId, setCurrentVenueId] = useState(
    () => localStorage.getItem(STORAGE.currentVenue) || null
  )
  const [venuesLoading, setVenuesLoading] = useState(false)

  // Make sure the API client carries any stored venue before the first request.
  useEffect(() => { initCurrentVenue(localStorage.getItem(STORAGE.currentVenue)) }, [])

  const applyVenue = useCallback((venueId) => {
    setCurrentVenueId(venueId)
    setClientVenue(venueId)
    if (venueId) localStorage.setItem(STORAGE.currentVenue, venueId)
    else localStorage.removeItem(STORAGE.currentVenue)
  }, [])

  const loadVenues = useCallback(async () => {
    setVenuesLoading(true)
    try {
      const { venues: list, currentVenueId: serverCurrent } = await fetchVenues()
      const safe = Array.isArray(list) ? list : []
      setVenues(safe)
      // Keep the stored selection if it is still a venue the user can access;
      // otherwise defer to the server's resolved venue, then the first venue.
      const stored = localStorage.getItem(STORAGE.currentVenue)
      const validStored = stored && safe.some(v => v.id === stored)
      applyVenue(validStored ? stored : (serverCurrent || safe[0]?.id || null))
    } catch {
      setVenues([])
    } finally {
      setVenuesLoading(false)
    }
  }, [applyVenue])

  // Tracks whether we have ever had an authenticated user, so we can tell a
  // genuine logout (had user → null) apart from the transient null that occurs
  // during silent session restore on a fresh page load.
  const hadUserRef = useRef(false)

  // Load on login / silent restore; clear only on a real logout.
  useEffect(() => {
    if (currentUser) {
      hadUserRef.current = true
      loadVenues()
    } else {
      setVenues([])
      // Only clear the venue context on an actual logout. During silent session
      // restore currentUser is briefly null while the stored token is validated;
      // clearing here would (a) null the API client's venue so X-HESTIA-Venue is
      // omitted on the first request burst, and (b) remove the stored selection so
      // a switched venue reverts to the default on every reload. initCurrentVenue
      // (mount effect above) has already primed the client from localStorage, so
      // leaving it untouched preserves the selection for loadVenues to revalidate.
      if (hadUserRef.current) { applyVenue(null); hadUserRef.current = false }
    }
  }, [currentUser, loadVenues, applyVenue])

  // Switching the venue switches the entire memory unit. We persist the choice
  // then reload: every venue-scoped hook (Venue DNA, briefs, Omer, Academy,
  // Owner Intelligence, operations, events, cocktails) refetches fresh against
  // the new venue, guaranteeing no prior-venue data lingers in the UI. The token
  // and venue id persist in localStorage, so the session restores seamlessly.
  const switchVenue = useCallback((venueId) => {
    if (!venueId || venueId === currentVenueId) return
    applyVenue(venueId)
    if (typeof window !== 'undefined') window.location.reload()
  }, [currentVenueId, applyVenue])

  const createVenue = useCallback(async ({ name, venueType, description }) => {
    const { venue } = await apiCreateVenue({ name, venueType, description })
    if (venue?.id) {
      applyVenue(venue.id)
      if (typeof window !== 'undefined') window.location.reload()
    }
    return venue
  }, [applyVenue])

  return { venues, currentVenueId, venuesLoading, switchVenue, createVenue, reloadVenues: loadVenues }
}
