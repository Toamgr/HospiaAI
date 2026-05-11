import { readStoredArray, writeStoredValue } from '../lib/storage'

const VENUE_STORAGE_KEY = 'hospia.venues'

export const DEFAULT_VENUES = [
  {
    id: 'venue-main',
    name: 'Main Venue',
    type: 'Restaurant / Cocktail Bar',
    timezone: 'Asia/Jerusalem',
    active: true
  }
]

export function loadVenues() {
  const venues = readStoredArray(VENUE_STORAGE_KEY, [])
  if (venues.length) return venues
  writeStoredValue(VENUE_STORAGE_KEY, DEFAULT_VENUES)
  return DEFAULT_VENUES
}

export function saveVenue(venue) {
  const venues = loadVenues()
  const nextVenue = { id: venue.id || `venue-${Date.now()}`, active: true, ...venue }
  const nextVenues = [nextVenue, ...venues.filter(item => item.id !== nextVenue.id)]
  writeStoredValue(VENUE_STORAGE_KEY, nextVenues)
  return { venue: nextVenue, venues: nextVenues }
}
