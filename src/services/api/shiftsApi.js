import { apiGet, apiPost } from './client'

export async function fetchCurrentShift() {
  const data = await apiGet('/api/shifts/current')
  return data.shift || null
}

export async function openShift({ manager_name, manager_id }) {
  const data = await apiPost('/api/shifts', { manager_name, manager_id })
  return data.shift
}

export async function saveBriefing(shiftId, briefing) {
  const data = await apiPost(`/api/shifts/${shiftId}/briefing`, { briefing })
  return data.shift
}

export async function closeShift(shiftId, { summary, cover_count }) {
  const data = await apiPost(`/api/shifts/${shiftId}/close`, { summary, cover_count })
  return data.shift
}

export async function saveHandover(shiftId, message) {
  const data = await apiPost(`/api/shifts/${shiftId}/handover`, { message })
  return data.shift
}

export async function fetchLastHandover() {
  const data = await apiGet('/api/shifts/last-handover')
  return data
}
