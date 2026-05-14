import { useState, useMemo } from 'react'
import { buildShiftIntelligence } from '../services/shiftBrainService'

export function useShiftBrainState({ actionItems = [], serviceIncidents = [], eventPlans = [], ownerNotes = [] } = {}) {
  const [shiftNotes, setShiftNotes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('hospia.operationalNotes') || 'null')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  const shiftBrain = useMemo(
    () => buildShiftIntelligence({ actionItems, serviceIncidents, eventPlans, ownerNotes }),
    [actionItems, serviceIncidents, eventPlans, ownerNotes]
  )

  return { shiftNotes, setShiftNotes, shiftBrain }
}
