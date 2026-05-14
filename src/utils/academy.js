import { UNIVERSITY_MANIFEST } from '../data/academy/universityManifest'
import { getRole } from '../config/roleConfig'

export function getLessonKey(academyId, lessonId) {
  return `${academyId}:${lessonId}`
}

export function getVisibleAcademies(userOrRole) {
  const role = getRole(userOrRole)
  return UNIVERSITY_MANIFEST.filter(academy => {
    if (role === 'admin') return true
    return academy.roles?.includes(role)
  })
}

export function getUserLessonProgress(academyProgress = {}, currentUser) {
  if (!currentUser?.username) return {}
  return academyProgress[currentUser.username] || {}
}

export function isLessonComplete(completedLessons = {}, academyId, lessonId) {
  const value = completedLessons[getLessonKey(academyId, lessonId)]
  return Boolean(value?.completed || value === true)
}

export function isLessonUnlocked(academy, lessonIndex, completedLessons = {}) {
  if (lessonIndex === 0) return true
  const previousLesson = academy.lessons?.[lessonIndex - 1]
  return Boolean(previousLesson && isLessonComplete(completedLessons, academy.id, previousLesson.id))
}

export function countCompletedLessons(completedLessons = {}) {
  return Object.values(completedLessons).filter(value => value?.completed || value === true).length
}

export function countUniversityLessons(academies = UNIVERSITY_MANIFEST) {
  return academies.reduce((sum, academy) => sum + (academy.lessons?.length || 0), 0)
}

export function lessonHasExpandedContent(lesson) {
  return [
    'objective',
    'doctrine',
    'technical_depth',
    'standards',
    'terminology',
    'taxonomy',
    'operational_consequences',
    'amateur_vs_pro',
    'common_failures',
    'recovery_logic',
    'professional_standard',
    'real_service_context',
    'practical_execution',
    'guest_application',
    'manager_notes',
    'drill',
    'assessment_questions'
  ].some(field => {
    const value = lesson?.[field]
    return Array.isArray(value) ? value.length : Boolean(value)
  })
}
