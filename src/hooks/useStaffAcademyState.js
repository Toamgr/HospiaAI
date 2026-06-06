import { useState, useEffect, useCallback } from 'react'
import { STORAGE } from '../config/systemConfig'
import { UNIVERSITY_MANIFEST } from '../data/academy/universityManifest'
import { getLessonKey, getVisibleAcademies } from '../utils/academy'
import { apiGet, apiPost } from '../services/api/client'

export function useStaffAcademyState({ currentUser, goToPage }) {
  const [academyProgress, setAcademyProgress] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.academyProgress) || 'null')
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
    } catch { return {} }
  })
  const [selectedAcademyId, setSelectedAcademyId] = useState(
    () => localStorage.getItem(STORAGE.selectedAcademy) || UNIVERSITY_MANIFEST[0]?.id || ''
  )
  const [selectedLessonId, setSelectedLessonId] = useState(
    () => localStorage.getItem(STORAGE.selectedLesson) || UNIVERSITY_MANIFEST[0]?.lessons?.[0]?.id || ''
  )

  useEffect(() => {
    localStorage.setItem(STORAGE.academyProgress, JSON.stringify(academyProgress))
  }, [academyProgress])

  // Phase 5 Step 8: academyProgress prefers backend for the current user.
  // Fetches completed lessons from /api/staff-progress/:user_id on mount.
  // Maps each row's course_external_id and module_external_id back to the
  // local key format: `${academyId}:${lessonId}` (same as getLessonKey).
  // Backend wins for matching lesson keys; local-only completions are preserved.
  // Only the current user's sub-object is modified — all other users' local
  // progress objects are passed through untouched via the { ...prev } spread.
  useEffect(() => {
    if (!currentUser?.id || !currentUser?.username) return
    let mounted = true
    apiGet(`/api/staff-progress/${currentUser.id}`)
      .then(data => {
        if (!mounted || !Array.isArray(data?.progress) || !data.progress.length) return
        const backendProgress = {}
        for (const row of data.progress) {
          if (!row.course_external_id || !row.module_external_id) continue
          backendProgress[getLessonKey(row.course_external_id, row.module_external_id)] = {
            completed: true,
            completed_at: row.completed_at || new Date().toISOString()
          }
        }
        if (!Object.keys(backendProgress).length) return
        setAcademyProgress(prev => ({
          ...prev,
          [currentUser.username]: { ...(prev[currentUser.username] || {}), ...backendProgress }
        }))
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [currentUser?.id])

  const openUniversityLesson = useCallback((academyId, lessonId) => {
    if (!currentUser) return
    const visibleAcademies = getVisibleAcademies(currentUser)
    const academy = visibleAcademies.find(item => item.id === academyId)
    const lesson = academy?.lessons?.find(item => item.id === lessonId)
    if (!academy || !lesson) return

    setSelectedAcademyId(academyId)
    setSelectedLessonId(lessonId)
    localStorage.setItem(STORAGE.selectedAcademy, academyId)
    localStorage.setItem(STORAGE.selectedLesson, lessonId)
    goToPage('lessonPlayer')
  }, [currentUser, goToPage])

  const completeUniversityLesson = useCallback((academyId, lessonId) => {
    if (!currentUser?.username) return
    const key = getLessonKey(academyId, lessonId)
    setAcademyProgress(prev => ({
      ...prev,
      [currentUser.username]: {
        ...(prev[currentUser.username] || {}),
        [key]: {
          completed: true,
          completed_at: new Date().toISOString()
        }
      }
    }))
    if (currentUser?.id) {
      apiPost('/api/staff-progress', {
        user_id: currentUser.id,
        academy_id: academyId,
        lesson_id: lessonId
      }).catch(() => {})
    }
  }, [currentUser?.username, currentUser?.id])

  return {
    academyProgress,
    selectedAcademyId,
    selectedLessonId,
    openUniversityLesson,
    completeUniversityLesson
  }
}
