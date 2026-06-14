import { API_BASE } from '../../config/systemConfig'

let _authToken = null

// Phase 8: the currently selected venue (the memory unit). Sent on every request
// as X-HESTIA-Venue so the backend resolves the correct venue context. The
// backend still validates access — the header is a hint, never a grant.
let _currentVenueId = null

export function setAuthToken(token) { _authToken = token }
export function clearAuthToken() { _authToken = null }

// Set / clear the active venue context for subsequent API calls.
export function setCurrentVenue(venueId) { _currentVenueId = venueId || null }
export function clearCurrentVenue() { _currentVenueId = null }
// Load a previously stored venue id at startup (mirrors initAuthToken).
export function initCurrentVenue(venueId) { if (venueId) _currentVenueId = venueId }

// Loads a previously stored token into the in-memory API client state.
// Called once at app startup before the silent session restore attempt.
// MVP: pairs with localStorage token storage — replace with cookie-based auth
// when the httpOnly-cookie hardening phase is implemented.
export function initAuthToken(token) {
  if (token) _authToken = token
}

async function apiRequest(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (_authToken) headers['Authorization'] = `Bearer ${_authToken}`
  if (_currentVenueId) headers['X-HESTIA-Venue'] = _currentVenueId

  const options = { method, headers }
  if (body !== null) options.body = JSON.stringify(body)

  const res = await fetch(`${API_BASE}${path}`, options)

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `API error ${res.status}`)
  }

  return res.json()
}

export const apiGet = (path) => apiRequest('GET', path)
export const apiPost = (path, body) => apiRequest('POST', path, body)
export const apiPut = (path, body) => apiRequest('PUT', path, body)
export const apiPatch = (path, body) => apiRequest('PATCH', path, body)
export const apiDelete = (path) => apiRequest('DELETE', path)
