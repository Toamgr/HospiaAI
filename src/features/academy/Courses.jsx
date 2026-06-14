import React, { useMemo } from 'react'
import { Card, Button, Label, Header, Progress } from '../../components/AppPrimitives'
import { getVisibleAcademies, getUserLessonProgress, isLessonComplete, isLessonUnlocked, countCompletedLessons, countUniversityLessons } from '../../utils/academy'
import { resolveInstructorPersona } from './services/academyInstructorPersonaResolver'
import RecommendedForVenue from './RecommendedForVenue'

export default function Courses({ t, currentUser, academyProgress = {}, onOpenLesson }) {
  const academies = useMemo(() => {
    const all = getVisibleAcademies(currentUser)
    // Bar learning lives in Bar World; wine learning has its own nav item.
    // Remove both from the employee course grid to avoid duplication.
    if (currentUser?.role === 'employee') {
      return all.filter(a => a.id !== 'bar-academy' && a.id !== 'wine-academy')
    }
    return all
  }, [currentUser])
  const completedLessons = getUserLessonProgress(academyProgress, currentUser)

  return (
    <>
      <Header eyebrow={t.areas.academy} title="HESTIA Service School" body="A focused school for service, guest flow, coffee, culinary confidence, and hospitality judgment. Built for employees who need practical knowledge before, during, and after service." />
      <p className="mb-8 text-sm italic leading-relaxed text-[#e8dcc0]/40 tracking-[0.01em]">
        Guests are not customers. Guests are people we host.
      </p>
      <Card className="mb-6 border-[#c9a96e]/20 bg-[#0f0f0e]">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
          <div>
            <Label>Learning Flow</Label>
            <p className="max-w-3xl text-sm leading-7 text-[#e8dcc0]">
              Choose a path, complete the first lesson, and continue through a structured sequence. Each academy builds practical confidence for real service.
            </p>
          </div>
          <div className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
            <div className="font-serif text-3xl font-black text-[#c9a96e]">{countCompletedLessons(completedLessons)} / {countUniversityLessons(academies)}</div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">Completed Lessons</div>
          </div>
        </div>
      </Card>

      <RecommendedForVenue onOpenLesson={onOpenLesson} />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {academies.map(academy => {
          const total = academy.lessons?.length || 0
          const completeCount = academy.lessons?.filter(lesson => isLessonComplete(completedLessons, academy.id, lesson.id)).length || 0
          const progress = total ? Math.round((completeCount / total) * 100) : 0
          const nextLesson = academy.lessons?.find((lesson, index) => (
            isLessonUnlocked(academy, index, completedLessons) && !isLessonComplete(completedLessons, academy.id, lesson.id)
          )) || academy.lessons?.[Math.max(0, total - 1)]
          const nextPersona = nextLesson ? resolveInstructorPersona(nextLesson) : null
          const nextHasVoice = nextPersona && nextPersona.id !== 'default-mentor'

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
                  {nextHasVoice && (
                    <div className="mt-1.5 text-[11px] font-black tracking-[0.1em] uppercase text-[#c9a96e]/60">
                      Voice with {nextPersona.name}
                    </div>
                  )}
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
