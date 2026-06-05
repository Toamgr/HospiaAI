import { API_BASE } from '../../config/systemConfig'
import { apiGet } from './client'

export async function loginWithCredentials(username, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Login failed.')
  return data
}

// Validates the stored session token server-side and returns the current user.
// Used for silent session restore on app load.
export async function getMe() {
  return apiGet('/api/auth/me')
}
