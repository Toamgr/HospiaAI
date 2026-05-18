import { useState, useEffect, useCallback, useRef } from 'react'
import { apiGet, apiPost } from '../services/api/client'

export function useOwnerPulseState({ currentUser }) {
  const isOwnerOrAdmin = ['owner', 'admin'].includes(currentUser?.role)

  const [pulseData, setPulseData] = useState(null)
  const [trends, setTrends] = useState([])
  const [insight, setInsight] = useState(null)
  const [isLoadingInsight, setIsLoadingInsight] = useState(false)
  const [insightError, setInsightError] = useState(null)
  const [insightCooldownSeconds, setInsightCooldownSeconds] = useState(0)
  const cooldownTimerRef = useRef(null)

  useEffect(() => {
    if (!isOwnerOrAdmin) return
    apiGet('/api/owner/pulse').then(data => {
      setPulseData(data)
      if (data.last_insight) setInsight(data.last_insight)
    }).catch(() => {})
    apiGet('/api/owner/trends').then(data => {
      setTrends(data.trends || [])
    }).catch(() => {})
  }, [isOwnerOrAdmin])

  const startCooldown = useCallback((seconds) => {
    setInsightCooldownSeconds(seconds)
    clearInterval(cooldownTimerRef.current)
    cooldownTimerRef.current = setInterval(() => {
      setInsightCooldownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const requestInsight = useCallback(async () => {
    if (isLoadingInsight || insightCooldownSeconds > 0) return
    setIsLoadingInsight(true)
    setInsightError(null)
    try {
      const data = await apiPost('/api/owner/insights', {})
      setInsight({ content: data.content, saved_at: data.saved_at })
      startCooldown(60)
    } catch (err) {
      const msg = err.message || 'Insight generation failed.'
      setInsightError(msg)
      const match = msg.match(/(\d+)/)
      if (match) startCooldown(parseInt(match[1], 10))
    } finally {
      setIsLoadingInsight(false)
    }
  }, [isLoadingInsight, insightCooldownSeconds, startCooldown])

  useEffect(() => () => clearInterval(cooldownTimerRef.current), [])

  return {
    pulseData,
    trends,
    insight,
    isLoadingInsight,
    insightError,
    insightCooldownSeconds,
    requestInsight
  }
}
