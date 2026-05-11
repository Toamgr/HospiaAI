import { API_BASE, STORAGE } from '../../config/systemConfig'

function getRole() {
  try {
    const user = JSON.parse(localStorage.getItem(STORAGE.currentUser) || 'null')
    return user?.role || ''
  } catch {
    return ''
  }
}

async function apiRequest(method, path, body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'X-HOSPIA-Role': getRole()
  }
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
export const apiPatch = (path, body) => apiRequest('PATCH', path, body)
