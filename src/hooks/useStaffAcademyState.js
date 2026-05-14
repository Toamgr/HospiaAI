import { useState, useEffect, useCallback } from 'react'
import { STORAGE } from '../config/systemConfig'
import { UNIVERSITY_MANIFEST } from '../data/academy/universityManifest'
import { getLessonKey, getVisibleAcademies } from '../utils/academy'

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
  }, [currentUser?.username])

  return {
    academyProgress,
    selectedAcademyId,
    selectedLessonId,
    openUniversityLesson,
    completeUniversityLesson
  }
}
