import React from 'react'
import { Card, Header, Metric, Progress } from '../../components/AppPrimitives'
import { getVisibleAcademies, getUserLessonProgress, isLessonComplete, countUniversityLessons, countCompletedLessons } from '../../utils/academy'

export default function LearningProgress({ t, currentUser, academyProgress = {} }) {
  const academies = getVisibleAcademies(currentUser)
  const completedMap = getUserLessonProgress(academyProgress, currentUser)
  const totalLessons = countUniversityLessons(academies)
  const completedLessons = countCompletedLessons(completedMap)
  const average = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <>
      <Header eyebrow={t.pages.learningProgress} title="Learning Progress And Certification Path" body="A focused employee view of what has been completed, what is next, and which service standard should be practiced before the next shift." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Overall Progress" value={`${average}%`} sub="Across academy" />
        <Metric label="Lessons Complete" value={String(completedLessons)} sub={`of ${totalLessons}`} />
        <Metric label="Active Academies" value={String(academies.length)} sub="Visible for role" />
        <Metric label="Next Certification" value={academies[0]?.title || 'Academy'} sub="Recommended" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {academies.map(academy => {
          const total = academy.lessons?.length || 0
          const completeCount = academy.lessons?.filter(lesson => isLessonComplete(completedMap, academy.id, lesson.id)).length || 0
          const progress = total ? Math.round((completeCount / total) * 100) : 0
          return (
            <Card key={academy.id}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{academy.category}</div>
                <h2 className="mt-1 font-serif text-2xl font-black text-[#f5f5f0]">{academy.title}</h2>
              </div>
              <span className="font-serif text-3xl font-black text-[#c9a96e]">{progress}%</span>
            </div>
            <Progress value={progress} label={academy.title} />
            <p className="mt-3 text-xs leading-6 text-[#e8dcc0]">{completeCount} / {total} lessons complete - {academy.description}</p>
          </Card>
          )
        })}
      </div>
    </>
  )
}
