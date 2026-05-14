import React from 'react'
import { getVisibleAcademies, getUserLessonProgress, countUniversityLessons, countCompletedLessons, isLessonComplete } from '../../utils/academy'
import { Card, Label, Header, Metric, List } from '../../components/AppPrimitives'

export default function EmployeeAchievements({ currentUser, academyProgress = {}, approvedCocktails = [], cocktailPractice = {}, employeeTasks = [] }) {
  const employeeName = currentUser?.username || 'Employee'
  const practiced = Object.values(cocktailPractice[employeeName] || {}).filter(item => item?.practiced).length
  const academies = getVisibleAcademies(currentUser)
  const completedMap = getUserLessonProgress(academyProgress, currentUser)
  const totalLessons = countUniversityLessons(academies)
  const completedLessons = countCompletedLessons(completedMap)
  const courseAverage = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
  const completedPaths = academies.filter(academy => academy.lessons?.length && academy.lessons.every(lesson => isLessonComplete(completedMap, academy.id, lesson.id))).length
  const completedTasks = employeeTasks.filter(task => task.assignedTo === employeeName && task.status === 'done').length
  const readiness = Math.max(0, Math.min(100, Math.round((courseAverage * 0.58) + ((approvedCocktails.length ? practiced / approvedCocktails.length : 0) * 28) + completedTasks * 4)))
  const level = readiness >= 86 ? 'Reserve Ready' : readiness >= 70 ? 'Floor Fluent' : 'Foundation'

  return (
    <>
      <Header eyebrow="Achievements" title="Progression foundation" body="A lightweight structure for future XP, certifications, bartender levels, manager endorsements, streaks, and readiness scoring." />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Readiness" value={`${readiness}%`} sub="Foundation score" />
        <Metric label="Level" value={level} sub={employeeName} />
        <Metric label="Completed Paths" value={`${completedPaths}/${academies.length}`} sub={`${completedLessons}/${totalLessons} lessons`} />
        <Metric label="Cocktail Practice" value={`${practiced}/${approvedCocktails.length}`} sub="Approved recipes" />
      </div>
      <Card className="mt-6 border-[#c9a96e]/18">
        <Label>Next Layer Prepared</Label>
        <List items={['XP progression and readiness scoring can attach here.', 'Certifications and bartender levels can be unlocked from completed paths.', 'Manager endorsements can become a professional prestige signal.', 'Training streaks can support retention without turning the product into a game.']} />
      </Card>
    </>
  )
}
