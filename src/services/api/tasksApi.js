import { apiGet, apiPost, apiPatch } from './client'

export async function fetchTasks({ status } = {}) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  const data = await apiGet(`/api/tasks${qs}`)
  return data.tasks || []
}

export async function createCarryForwardTask({ shift_id, content, priority = 'normal' }) {
  const data = await apiPost('/api/tasks', { shift_id, content, priority })
  return data.task
}

export async function resolveCarryForwardTask(taskId, resolvedShiftId) {
  const data = await apiPatch(`/api/tasks/${taskId}`, {
    status: 'resolved',
    resolved_shift_id: resolvedShiftId || ''
  })
  return data.task
}
