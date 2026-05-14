import React, { useMemo } from 'react'
import { Card, Button, Label, Header, Progress } from '../../components/AppPrimitives'
import { getVisibleAcademies, getUserLessonProgress, isLessonComplete, isLessonUnlocked, countCompletedLessons, countUniversityLessons } from '../../utils/academy'

export default function Courses({ t, currentUser, academyProgress = {}, onOpenLesson }) {
  const academies = useMemo(() => getVisibleAcademies(currentUser), [currentUser])
  const completedLessons = getUserLessonProgress(academyProgress, currentUser)

  return (
    <>
      <Header eyebrow={t.areas.academy} title="HESTIA University" body="Structured hospitality academies for service, bar, wine, events, hosting, and management. Lessons unlock in order so learning builds like a professional curriculum." />
      <Card className="mb-6 border-[#c9a96e]/20 bg-[#0f0f0e]">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
          <div>
            <Label>University Flow</Label>
            <p className="max-w-3xl text-sm leading-7 text-[#e8dcc0]">
              Choose an academy, complete the first lesson, and unlock the next. Employees see operational academies; managers and admins also see Manager Academy.
            </p>
          </div>
          <div className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
            <div className="font-serif text-3xl font-black text-[#c9a96e]">{countCompletedLessons(completedLessons)} / {countUniversityLessons(academies)}</div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">Completed Lessons</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {academies.map(academy => {
          const total = academy.lessons?.length || 0
          const completeCount = academy.lessons?.filter(lesson => isLessonComplete(completedLessons, academy.id, lesson.id)).length || 0
          const progress = total ? Math.round((completeCount / total) * 100) : 0
          const nextLesson = academy.lessons?.find((lesson, index) => (
            isLessonUnlocked(academy, index, completedLessons) && !isLessonComplete(completedLessons, academy.id, lesson.id)
          )) || academy.lessons?.[Math.max(0, total - 1)]

          return (
            <Card key={academy.id} className="flex min-h-80 flex-col justify-between border-[#6b705c]/30 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.09),transparent_34%),#14130f] transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a96e]/45 hover:shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c9a96e]">{academy.category}</div>
                  {academy.badge && (
                    <span className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a96e]">
                      {academy.badge}
                    </span>
                  )}
                </div>
                <h2 className="mt-5 font-serif text-3xl font-black leading-tight text-[#f5f5f0]">{academy.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#e8dcc0]">{academy.description}</p>
                <div className="mt-5 rounded-2xl border border-[#6b705c]/25 bg-[#10100e] p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/70">Next lesson</div>
                  <div className="mt-1 text-sm font-black text-[#f5f5f0]">{nextLesson?.title || 'Academy content pending'}</div>
                </div>
              </div>
              <div className="mt-8">
                <Progress value={progress} label={academy.title} />
                <div className="mt-5 flex items-center justify-between gap-4">
                  <span className="text-xs font-black text-[#e8dcc0]">{completeCount} / {total} lessons</span>
                  <Button disabled={!nextLesson} onClick={() => onOpenLesson?.(academy.id, nextLesson.id)}>
                    {progress === 100 ? 'Review Academy' : 'Open Academy'}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
