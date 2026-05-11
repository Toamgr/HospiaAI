import { STORAGE } from '../config/systemConfig'
import { UNIVERSITY_MANIFEST } from '../data/academy/universityManifest'
import { readStoredValue, writeStoredValue } from '../lib/storage'

export function loadAcademyProgress() {
  return readStoredValue(STORAGE.academyProgress, {})
}

export function markLessonComplete(progress, username, academyId, lessonId) {
  const key = `${academyId}:${lessonId}`
  const nextProgress = {
    ...progress,
    [username]: {
      ...(progress[username] || {}),
      [key]: {
        completed: true,
        completed_at: new Date().toISOString()
      }
    }
  }
  writeStoredValue(STORAGE.academyProgress, nextProgress)
  return nextProgress
}

export function calculateAcademyCompletion(progress = {}, username = '') {
  const userProgress = progress[username] || {}
  const completed = Object.values(userProgress).filter(item => item?.completed || item === true).length
  const total = UNIVERSITY_MANIFEST.reduce((sum, academy) => sum + (academy.lessons?.length || 0), 0)
  return {
    completed,
    total,
    percentage: total ? Math.round((completed / total) * 100) : 0
  }
}
