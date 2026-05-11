import { apiGet, apiPatch, apiPost } from './client'

export async function fetchActions() {
  const data = await apiGet('/api/actions')
  return data.actions || []
}

export async function createAction(action) {
  const data = await apiPost('/api/actions', action)
  return data.action
}

export async function updateActionDone(actionId, done) {
  const data = await apiPatch(`/api/actions/${actionId}`, { done })
  return data.action
}
