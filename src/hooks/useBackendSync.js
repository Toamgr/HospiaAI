import { useEffect } from 'react'
import { API_BASE } from '../config/systemConfig'
import { syncUsersFromBackend, persistUsers } from '../services/userService'

async function apiRequest(path, { method = 'GET', role, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(role ? { 'X-HOSPIA-Role': role } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || `API request failed: ${response.status}`)
  }
  return data
}

export function useBackendSync({ role, setReportArchive, setBusinessMemory, setEventPlans, setActionItems, setUsers }) {
  useEffect(() => {
    let active = true
    if (!['manager', 'bar_manager', 'owner', 'admin'].includes(role)) return undefined

    const syncRole = ['manager', 'bar_manager', 'admin'].includes(role) ? role : 'manager'

    const requests = [
      apiRequest('/api/shift-reports', { role }),
      apiRequest('/api/event-plans', { role }),
      apiRequest('/api/business-memory', { role })
    ]

    if (['manager', 'bar_manager', 'admin'].includes(role)) {
      requests.push(apiRequest('/api/actions', { role: syncRole }))
    } else {
      requests.push(Promise.resolve(null))
    }

    Promise.allSettled(requests)
      .then(([reportsResult, plansResult, memoryResult, actionsResult]) => {
        if (!active) return
        if (reportsResult.status === 'fulfilled' && Array.isArray(reportsResult.value.reports) && reportsResult.value.reports.length) {
          setReportArchive(prev => {
            const merged = [...reportsResult.value.reports]
            prev.forEach(local => { if (!merged.some(b => b.id === local.id)) merged.push(local) })
            return merged
          })
        }
        if (plansResult.status === 'fulfilled' && Array.isArray(plansResult.value.eventPlans) && plansResult.value.eventPlans.length) {
          setEventPlans(prev => {
            const merged = [...plansResult.value.eventPlans]
            prev.forEach(local => { if (!merged.some(b => b.id === local.id)) merged.push(local) })
            return merged.slice(0, 80)
          })
        }
        if (memoryResult.status === 'fulfilled' && Array.isArray(memoryResult.value.memory) && memoryResult.value.memory.length) {
          setBusinessMemory(prev => {
            const merged = [...memoryResult.value.memory]
            prev.forEach(local => { if (!merged.some(b => b.id === local.id)) merged.push(local) })
            return merged
          })
        }
        if (actionsResult?.status === 'fulfilled' && Array.isArray(actionsResult.value?.actions) && actionsResult.value.actions.length) {
          const backendActions = actionsResult.value.actions.map(a => ({
            ...a,
            status: a.done ? 'Completed' : (a.status || 'New'),
            priority: a.priority || 'Medium',
            comments: a.comments || []
          }))
          setActionItems(prev => {
            const merged = [...backendActions]
            prev.forEach(local => {
              if (!merged.some(b => b.id === local.id)) merged.push(local)
            })
            return merged
          })
        }
      })
      .catch(error => {
        console.warn('HESTIA backend archive APIs unavailable; using local data.', error)
      })

    // Sync users from backend — merge into localStorage, never overwrite local-only users
    if (['owner', 'admin'].includes(role)) {
      syncUsersFromBackend(role).then(backendUsers => {
        if (!active || !backendUsers.length) return
        setUsers(prev => {
          const merged = [...prev]
          backendUsers.forEach(bu => {
            const idx = merged.findIndex(u => u.username.toLowerCase() === bu.username.toLowerCase())
            if (idx === -1) {
              merged.push(bu)
            }
            // never overwrite local user data with backend — local is source of truth
          })
          persistUsers(merged)
          return merged
        })
      }).catch(() => {})
    }

    return () => {
      active = false
    }
  }, [role])
}
