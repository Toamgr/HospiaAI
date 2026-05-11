import { apiGet, apiPost } from './client'

export async function fetchEventPlans() {
  const data = await apiGet('/api/event-plans')
  return data.eventPlans || []
}

export async function saveEventPlan(plan) {
  const data = await apiPost('/api/event-plans', plan)
  return data.eventPlan
}
