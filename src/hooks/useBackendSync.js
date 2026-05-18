import { useEffect } from 'react'
import { apiGet } from '../services/api/client'
import { syncUsersFromBackend, persistUsers } from '../services/userService'

export function useBackendSync({ role, setReportArchive, setBusinessMemory, setEventPlans, setActionItems, setUsers, setServiceIncidents }) {
  useEffect(() => {
    let active = true
    if (!['manager', 'bar_manager', 'owner', 'admin'].includes(role)) return undefined

    const requests = [
      apiGet('/api/shift-reports'),
      apiGet('/api/event-plans'),
      apiGet('/api/business-memory')
    ]

    if (['manager', 'bar_manager', 'admin'].includes(role)) {
      requests.push(apiGet('/api/actions'))
      requests.push(apiGet('/api/incidents'))
    } else {
      requests.push(Promise.resolve(null))
      requests.push(Promise.resolve(null))
    }

    Promise.allSettled(requests)
      .then(([reportsResult, plansResult, memoryResult, actionsResult, incidentsResult]) => {
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
        if (actionsResult?.status === 'fulfilled' && Array.isArray(actionsResult.value?.actions)) {
          const backendActions = actionsResult.value.actions.map(a => ({
            ...a,
            status: a.done ? 'Completed' : (a.status || 'New'),
            priority: a.priority || 'Medium',
            comments: a.comments || []
          }))
          setActionItems(backendActions)
        }
        if (incidentsResult?.status === 'fulfilled' && Array.isArray(incidentsResult.value?.incidents) && incidentsResult.value.incidents.length) {
          const backendIncidents = incidentsResult.value.incidents.map(i => ({
            id: i.id,
            issueType: i.type || 'service',
            description: i.description || '',
            guestTable: i.table_number || '',
            resolved: Boolean(i.resolved),
            employeeName: i.reported_by || 'Unknown',
            severity: i.severity || 'medium',
            shift_id: i.shift_id || null,
            time: i.created_at ? new Date(i.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            created_at: i.created_at || new Date().toISOString()
          }))
          setServiceIncidents(prev => {
            const merged = [...backendIncidents]
            prev.forEach(local => { if (!merged.some(b => b.id === local.id)) merged.push(local) })
            return merged.slice(0, 120)
          })
        }
      })
      .catch(error => {
        console.warn('HESTIA backend archive APIs unavailable; using local data.', error)
      })

    // Sync users from backend — merge into localStorage, never overwrite local-only users
    if (['owner', 'admin'].includes(role)) {
      syncUsersFromBackend().then(backendUsers => {
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
