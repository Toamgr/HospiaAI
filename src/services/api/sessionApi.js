import { apiPost } from './client'

export async function loginWithCode(code) {
  return apiPost('/api/session/login', { code })
}
