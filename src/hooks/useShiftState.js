import { useState, useEffect, useCallback } from 'react'
import {
  fetchCurrentShift,
  openShift as apiOpenShift,
  saveBriefing as apiSaveBriefing,
  closeShift as apiCloseShift,
  saveHandover as apiSaveHandover,
  fetchLastHandover
} from '../services/api/shiftsApi'
import {
  fetchTasks,
  createCarryForwardTask,
  resolveCarryForwardTask
} from '../services/api/tasksApi'

const MANAGER_ROLES = ['manager', 'bar_manager', 'admin']

export function useShiftState({ currentUser } = {}) {
  const [activeShift,        setActiveShift]        = useState(null)
  const [shiftStatus,        setShiftStatus]        = useState('idle')
  const [lastHandover,       setLastHandover]       = useState(null)
  const [carryForwardTasks,  setCarryForwardTasks]  = useState([])
  const [shiftError,         setShiftError]         = useState(null)

  useEffect(() => {
    if (!currentUser || !MANAGER_ROLES.includes(currentUser.role)) return
    let active = true

    fetchCurrentShift()
      .then(shift => {
        if (!active) return
        if (shift) { setActiveShift(shift); setShiftStatus('open') }
      })
      .catch(() => {})

    fetchLastHandover()
      .then(data => { if (active) setLastHandover(data) })
      .catch(() => {})

    fetchTasks({ status: 'open' })
      .then(tasks => { if (active) setCarryForwardTasks(tasks) })
      .catch(() => {})

    return () => { active = false }
  }, [currentUser?.id])

  const openShift = useCallback(async () => {
    setShiftError(null)
    try {
      const shift = await apiOpenShift({
        manager_name: currentUser?.username || currentUser?.name || 'Manager',
        manager_id:   currentUser?.id || 'unknown'
      })
      setActiveShift(shift)
      setShiftStatus('open')
      return shift
    } catch (err) {
      const msg = err.message || 'Could not open shift.'
      setShiftError(msg)
      throw new Error(msg)
    }
  }, [currentUser?.id, currentUser?.name, currentUser?.username])

  const saveBriefing = useCallback(async (briefingText) => {
    if (!activeShift) return
    try {
      const shift = await apiSaveBriefing(activeShift.id, briefingText)
      setActiveShift(shift)
      return shift
    } catch {
      // briefing save is best-effort — don't block the shift start
    }
  }, [activeShift])

  const closeShift = useCallback(async ({ summary, cover_count } = {}) => {
    if (!activeShift) return
    setShiftError(null)
    try {
      const shift = await apiCloseShift(activeShift.id, { summary: summary || '', cover_count: cover_count ?? null })
      setActiveShift(shift)
      setShiftStatus('handover_pending')
      return shift
    } catch (err) {
      const msg = err.message || 'Could not close shift.'
      setShiftError(msg)
      throw new Error(msg)
    }
  }, [activeShift])

  const saveHandover = useCallback(async (message) => {
    if (!activeShift) return
    setShiftError(null)
    try {
      await apiSaveHandover(activeShift.id, message || '')
      setActiveShift(null)
      setShiftStatus('idle')
    } catch (err) {
      const msg = err.message || 'Could not save handover.'
      setShiftError(msg)
      throw new Error(msg)
    }
  }, [activeShift])

  const addCarryForwardTask = useCallback(async (content, priority = 'normal') => {
    if (!activeShift || !content?.trim()) return
    try {
      const task = await createCarryForwardTask({ shift_id: activeShift.id, content: content.trim(), priority })
      setCarryForwardTasks(prev => [task, ...prev])
      return task
    } catch {
      // non-critical — task will be missing from DB but visible in next sync
    }
  }, [activeShift])

  const resolveTask = useCallback(async (taskId) => {
    try {
      const task = await resolveCarryForwardTask(taskId, activeShift?.id)
      setCarryForwardTasks(prev => prev.map(t => t.id === taskId ? task : t))
    } catch {
      // optimistic: remove from open list anyway
      setCarryForwardTasks(prev => prev.filter(t => t.id !== taskId))
    }
  }, [activeShift?.id])

  return {
    activeShift,
    shiftStatus,
    lastHandover,
    carryForwardTasks,
    shiftError,
    openShift,
    saveBriefing,
    closeShift,
    saveHandover,
    addCarryForwardTask,
    resolveTask
  }
}
