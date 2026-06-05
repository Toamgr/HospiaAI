import { useState, useEffect, useCallback } from 'react'
import { STORAGE } from '../config/systemConfig'
import { BUSINESS_MEMORY } from '../data/businessMemory'
import { apiGet, apiPost } from '../services/api/client'

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
    const saved = JSON.parse(localStorage.getItem(STORAGE.businessMemory) || 'null')
    return Array.isArray(saved) ? saved : BUSINESS_MEMORY
  } catch {
    return BUSINESS_MEMORY
  }
}

function mergeReportArchive(local, backend) {
  const byId = new Map(backend.map(r => [r.id, r]))
  const merged = local.map(r => byId.has(r.id) ? byId.get(r.id) : r)
  const localIds = new Set(local.map(r => r.id))
  backend.forEach(r => { if (!localIds.has(r.id)) merged.push(r) })
  return merged
}

function mergeBusinessMemory(local, backend) {
  const key = e => `${e.title}||${e.date}`
  const byKey = new Map(backend.map(e => [key(e), e]))
  const merged = local.map(e => byKey.has(key(e)) ? byKey.get(key(e)) : e)
  const localKeys = new Set(local.map(key))
  backend.forEach(e => { if (!localKeys.has(key(e))) merged.push(e) })
  return merged
}

export function useReportsState({ currentUser } = {}) {
  const [reportArchive, setReportArchive] = useState(getInitialReportArchive)
  const [businessMemory, setBusinessMemory] = useState(getInitialBusinessMemory)

  useEffect(() => {
    localStorage.setItem(STORAGE.reportArchive, JSON.stringify(reportArchive))
  }, [reportArchive])

  useEffect(() => {
    localStorage.setItem(STORAGE.businessMemory, JSON.stringify(businessMemory))
  }, [businessMemory])

  useEffect(() => {
    apiGet('/api/shift-reports')
      .then(data => {
        if (Array.isArray(data?.reports)) {
          setReportArchive(prev => mergeReportArchive(prev, data.reports))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    apiGet('/api/business-memory')
      .then(data => {
        if (Array.isArray(data?.memory)) {
          setBusinessMemory(prev => mergeBusinessMemory(prev, data.memory))
        }
      })
      .catch(() => {})
  }, [])

  const addBusinessMemoryEvent = useCallback(event => {
    const memoryEvent = {
      id: event.id || `memory-${Date.now()}`,
      date: event.date || new Date().toISOString().slice(0, 10),
      type: event.type || 'note',
      title: event.title,
      detail: event.detail
    }
    setBusinessMemory(prev => [memoryEvent, ...prev].slice(0, 100))
    apiPost('/api/business-memory', {
      id: memoryEvent.id,
      type: memoryEvent.type,
      title: memoryEvent.title,
      detail: memoryEvent.detail,
      event_date: memoryEvent.date
    }).catch(() => {})
    return memoryEvent
  }, [])

  return { reportArchive, setReportArchive, businessMemory, setBusinessMemory, addBusinessMemoryEvent }
}
