// Hook that owns all Venue Intelligence (Venue Learning Engine) state.
// Owner/Admin only — the conversation that teaches HESTIA the venue and builds Venue DNA.
// Follows the HESTIA hook contract: owns its state, persistence effects, and handlers;
// does not import other hooks.
import { useState, useEffect, useCallback } from 'react'
import { emptyVenueDna } from '../features/venue-intelligence/venueDnaModel'
import {
  fetchVenueIntelligence,
  sendVenueIntelligenceMessage,
  resetVenueIntelligence
} from '../services/api/venueIntelligenceApi'

const LEARNING_ROLES = ['owner', 'admin']

export function useVenueIntelligenceState({ currentUser } = {}) {
  const [messages, setMessages]   = useState([])
  const [venueDNA, setVenueDNA]   = useState(emptyVenueDna())
  const [stage, setStage]         = useState('story')
  const [objective, setObjective] = useState('')
  const [focusSuggestions, setFocusSuggestions] = useState([])

  const [loading, setLoading]     = useState(true)   // initial session load
  const [sending, setSending]     = useState(false)  // a message is in flight
  const [loadError, setLoadError] = useState(null)
  const [sendError, setSendError] = useState(null)

  const canAccess = Boolean(currentUser?.id) && LEARNING_ROLES.includes(currentUser?.role)

  useEffect(() => {
    if (!canAccess) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    setLoadError(null)
    fetchVenueIntelligence()
      .then(res => {
        if (cancelled) return
        const state = res?.state || {}
        setMessages(Array.isArray(state.messages) ? state.messages : [])
        setVenueDNA({ ...emptyVenueDna(), ...(state.venueDNA || {}) })
        setStage(state.stage || 'story')
        setObjective(state.objective || '')
      })
      .catch(() => { if (!cancelled) setLoadError('Could not reach the venue learning session.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [currentUser?.id, canAccess])

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || '').trim()
    if (!trimmed || sending) return
    const userTurn = { role: 'user', content: trimmed, ts: new Date().toISOString() }
    setMessages(prev => [...prev, userTurn])
    setSending(true)
    setSendError(null)
    try {
      const res = await sendVenueIntelligenceMessage(trimmed)
      setMessages(prev => [...prev, { role: 'model', content: res.reply, ts: new Date().toISOString() }])
      if (res.venueDNA) setVenueDNA({ ...emptyVenueDna(), ...res.venueDNA })
      if (res.stage) setStage(res.stage)
      if (typeof res.objective === 'string') setObjective(res.objective)
      setFocusSuggestions(Array.isArray(res.focusSuggestions) ? res.focusSuggestions : [])
    } catch (err) {
      // Roll the optimistic user turn back so they can retry cleanly.
      setMessages(prev => prev.filter(m => m !== userTurn))
      setSendError(err?.message || 'The conversation could not continue. Please try again.')
    } finally {
      setSending(false)
    }
  }, [sending])

  const resetSession = useCallback(async () => {
    setSendError(null)
    try {
      const res = await resetVenueIntelligence()
      const state = res?.state || {}
      setMessages(Array.isArray(state.messages) ? state.messages : [])
      setVenueDNA({ ...emptyVenueDna(), ...(state.venueDNA || {}) })
      setStage(state.stage || 'story')
      setObjective(state.objective || '')
      setFocusSuggestions([])
      return { ok: true }
    } catch {
      setSendError('Could not start a fresh session.')
      return { ok: false }
    }
  }, [])

  return {
    canAccess,
    messages,
    venueDNA,
    stage,
    objective,
    focusSuggestions,
    loading,
    sending,
    loadError,
    sendError,
    sendMessage,
    resetSession
  }
}
