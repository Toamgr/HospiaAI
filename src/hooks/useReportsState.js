import { useState, useEffect, useCallback } from 'react'
import { STORAGE } from '../config/systemConfig'
import { BUSINESS_MEMORY } from '../data/businessMemory'

function getInitialReportArchive() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE.reportArchive) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function getInitialBusinessMemory() {
  try {
    const saved = JSON.parse(localStorage.getItem('hospia.businessMemory') || 'null')
    return Array.isArray(saved) ? saved : BUSINESS_MEMORY
  } catch {
    return BUSINESS_MEMORY
  }
}

export function useReportsState() {
  const [reportArchive, setReportArchive] = useState(getInitialReportArchive)
  const [businessMemory, setBusinessMemory] = useState(getInitialBusinessMemory)

  useEffect(() => {
    localStorage.setItem(STORAGE.reportArchive, JSON.stringify(reportArchive))
  }, [reportArchive])

  useEffect(() => {
    localStorage.setItem('hospia.businessMemory', JSON.stringify(businessMemory))
  }, [businessMemory])

  const addBusinessMemoryEvent = useCallback(event => {
    const memoryEvent = {
      id: event.id || `memory-${Date.now()}`,
      date: event.date || new Date().toISOString().slice(0, 10),
      type: event.type || 'note',
      title: event.title,
      detail: event.detail
    }
    setBusinessMemory(prev => [memoryEvent, ...prev].slice(0, 100))
    return memoryEvent
  }, [])

  return { reportArchive, setReportArchive, businessMemory, setBusinessMemory, addBusinessMemoryEvent }
}
