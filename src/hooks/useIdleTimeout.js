import { useEffect, useRef, useCallback } from 'react'

const TRACKED_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']

// Detects user inactivity and fires a warning callback followed by a logout callback.
// Uses refs for timers to avoid stale closures without triggering re-renders.
// Callback refs are kept current via effects so the latest callbacks always fire.
//
// Parameters:
//   enabled    — only active when the user is logged in
//   timeoutMs  — total inactivity before logout (30 min = 30 * 60 * 1000)
//   warningMs  — inactivity before warning (25 min = 25 * 60 * 1000)
//   onWarning  — called at warningMs — show the "you will be logged out" banner
//   onTimeout  — called at timeoutMs — trigger logout
export function useIdleTimeout({ enabled, timeoutMs, warningMs, onWarning, onTimeout }) {
  const onWarningRef = useRef(onWarning)
  const onTimeoutRef = useRef(onTimeout)
  const warningTimerRef = useRef(null)
  const logoutTimerRef = useRef(null)
  const lastScheduleRef = useRef(0)

  // Keep callback refs current without causing the main effect to re-run
  useEffect(() => { onWarningRef.current = onWarning }, [onWarning])
  useEffect(() => { onTimeoutRef.current = onTimeout }, [onTimeout])

  const schedule = useCallback(() => {
    // Throttle: only reset timers once per second regardless of how many events fire
    const now = Date.now()
    if (now - lastScheduleRef.current < 1000) return
    lastScheduleRef.current = now

    clearTimeout(warningTimerRef.current)
    clearTimeout(logoutTimerRef.current)

    warningTimerRef.current = setTimeout(() => onWarningRef.current?.(), warningMs)
    logoutTimerRef.current  = setTimeout(() => onTimeoutRef.current?.(), timeoutMs)
  }, [warningMs, timeoutMs])

  useEffect(() => {
    if (!enabled) {
      clearTimeout(warningTimerRef.current)
      clearTimeout(logoutTimerRef.current)
      return
    }

    schedule()
    TRACKED_EVENTS.forEach(e => window.addEventListener(e, schedule, { passive: true }))

    return () => {
      clearTimeout(warningTimerRef.current)
      clearTimeout(logoutTimerRef.current)
      TRACKED_EVENTS.forEach(e => window.removeEventListener(e, schedule))
    }
  }, [enabled, schedule])
}
