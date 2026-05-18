import { API_BASE } from '../../config/systemConfig'

let _authToken = null

export function setAuthToken(token) { _authToken = token }
export function clearAuthToken() { _authToken = null }

async function apiRequest(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  if (_authToken) headers['Authorization'] = `Bearer ${_authToken}`

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
