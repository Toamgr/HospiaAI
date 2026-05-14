import React, { useState, useMemo } from 'react'
import { cx } from '../../utils/format'
import { Card, Button, Label, Header, List } from '../../components/AppPrimitives'
import { canAccessPage } from '../../config/roleConfig'
import { getVisibleAcademies, getUserLessonProgress, isLessonComplete, isLessonUnlocked, lessonHasExpandedContent } from '../../utils/academy'

function LessonContentBlock({ title, value, featured = false }) {
  if (!value || (Array.isArray(value) && !value.length)) return null

  return (
    <Card className={cx('h-full', featured && 'border-[#c9a96e]/25 bg-[#19170f]')}>
      <Label>{title}</Label>
      {Array.isArray(value) ? (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={typeof item === 'object' ? `${item.type || item.title || 'item'}-${index}` : item} className="rounded-xl border border-[#6b705c]/25 bg-[#10100e] p-3 text-sm leading-6 text-[#e8dcc0]">
              {typeof item === 'object' ? (
                <>
                  <span className="font-black text-[#f5f5f0]">{item.type || item.title || item.label || `Point ${index + 1}`}: </span>
                  {item.usage || item.detail || item.value || Object.entries(item).filter(([key]) => !['type', 'title', 'label'].includes(key)).map(([key, nested]) => `${key}: ${nested}`).join(' - ')}
                </>
              ) : item}
            </div>
          ))}
        </div>
      ) : typeof value === 'object' ? (
        <div className="space-y-2">
          {Object.entries(value).map(([key, item]) => (
            <div key={key} className="rounded-xl border border-[#6b705c]/25 bg-[#10100e] p-3 text-sm leading-6 text-[#e8dcc0]">
              <span className="font-black text-[#f5f5f0]">{key}: </span>{String(item)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-7 text-[#e8dcc0]">{value}</p>
      )}
    </Card>
  )
}

function LegacyLessonPlayer({ t, currentUser, goToPage }) {
  const [started, setStarted] = useState(false)
  const canPractice = canAccessPage(currentUser, 'simulation')

  return (
    <>
      <Header eyebrow={t.pages.lessonPlayer} title={t.pages.lessonPlayer} body={t.copy.academyTitle} />
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <Card className="border-[#c9a96e]/20">
            <div className="flex min-h-96 items-center justify-center rounded-2xl border border-[#6b705c]/30 bg-[#1b1a15]">
              <button type="button" onClick={() => setStarted(value => !value)} className="flex h-24 w-24 items-center justify-center rounded-full bg-[#c9a96e] text-lg font-black uppercase tracking-[0.16em] text-[#1a1a1a] transition hover:scale-105" aria-pressed={started}>
                {started ? 'Pause' : 'Play'}
                <span className="hidden">
                ▶
                </span>
              </button>
            </div>
          </Card>
          <Card className="border-l-4 border-l-[#c9a96e] bg-gradient-to-r from-[#c9a96e]/5 to-transparent">
            <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">HESTIA Doctrine</h2>
            <p className="mt-4 font-serif text-xl italic leading-10 text-[#f5f5f0]">
              "{t.copy.doctrine}"
            </p>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <Label>Key Takeaways</Label>
            <List items={[
              'Acknowledge the guest before solving the technical problem.',
              'Use exact, calm language during delay moments.',
              'Protect trust before offering compensation.'
            ]} />
          </Card>

          <Card>
            <Label>Suggested Language</Label>
            <div className="rounded-2xl border-l-4 border-[#c9a96e] bg-[#1b1a15] p-5 font-serif text-lg italic leading-8 text-[#f5f5f0]">
              "I completely understand, and I will take care of this immediately."
            </div>
          </Card>

          <div className="flex flex-wrap gap-4">
            <Button onClick={() => goToPage('knowledgeLibrary')}>{t.ui.askCoach}</Button>
            <Button variant="secondary" onClick={() => goToPage(canPractice ? 'simulation' : 'sopSheets')}>{canPractice ? t.ui.practice : 'Review Service'}</Button>
            <Button variant="secondary" onClick={() => goToPage(canPractice ? 'simulation' : 'serviceRecovery')}>{canPractice ? t.ui.quickQuiz : 'Report An Issue'}</Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function LessonPlayer({ t, currentUser, goToPage, academyProgress = {}, selectedAcademyId, selectedLessonId, onOpenLesson, onCompleteLesson }) {
  const [started, setStarted] = useState(false)
  const visibleAcademies = useMemo(() => getVisibleAcademies(currentUser), [currentUser])
  const completedLessons = getUserLessonProgress(academyProgress, currentUser)
  const academy = visibleAcademies.find(item => item.id === selectedAcademyId) || visibleAcademies[0]
  const foundLessonIndex = academy?.lessons?.findIndex(item => item.id === selectedLessonId) ?? 0
  const lessonIndex = foundLessonIndex >= 0 ? foundLessonIndex : 0
  const lesson = academy?.lessons?.[lessonIndex] || academy?.lessons?.[0]
  const unlocked = academy && lesson ? isLessonUnlocked(academy, lessonIndex, completedLessons) : false
  const complete = academy && lesson ? isLessonComplete(completedLessons, academy.id, lesson.id) : false
  const hasContent = lessonHasExpandedContent(lesson)
  const nextLesson = academy?.lessons?.[lessonIndex + 1]
  const nextUnlocked = nextLesson && isLessonComplete(completedLessons, academy.id, lesson.id)

  if (!academy || !lesson) {
    return (
      <>
        <Header eyebrow={t.pages.lessonPlayer} title="Lesson unavailable" body="No academy lessons are available for this role yet." />
        <Button onClick={() => goToPage('courses')}>Back To Courses</Button>
      </>
    )
  }

  return (
    <>
      <Header eyebrow={academy.title} title={lesson.title} body={academy.description} />
      <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit border-[#c9a96e]/15">
          <Label>Lesson Path</Label>
          <div className="space-y-3">
            {academy.lessons.map((item, index) => {
              const itemUnlocked = isLessonUnlocked(academy, index, completedLessons)
              const itemComplete = isLessonComplete(completedLessons, academy.id, item.id)
              const active = item.id === lesson.id
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!itemUnlocked}
                  onClick={() => onOpenLesson?.(academy.id, item.id)}
                  className={cx(
                    'w-full rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45',
                    active ? 'border-[#c9a96e]/45 bg-[#c9a96e]/10' : 'border-[#6b705c]/25 bg-[#10100e] hover:border-[#c9a96e]/35'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]/70">Lesson {index + 1}</span>
                    <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em]', itemComplete ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : itemUnlocked ? 'border-[#c9a96e]/25 text-[#c9a96e]' : 'border-[#6b705c]/30 text-[#e8dcc0]/60')}>
                      {itemComplete ? 'Complete' : itemUnlocked ? 'Open' : 'Locked'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-black leading-5 text-[#f5f5f0]">{item.title}</div>
                </button>
              )
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.11),transparent_34%),#14130f]">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e]">{academy.category}</div>
                <h2 className="mt-3 font-serif text-4xl font-black text-[#f5f5f0]">{lesson.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">{lesson.duration || 'Self-paced lesson'}</p>
              </div>
              <button type="button" onClick={() => setStarted(value => !value)} className="min-h-12 rounded-full bg-[#c9a96e] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#11100d] transition hover:scale-[1.02]" aria-pressed={started}>
                {started ? 'Pause Lesson' : 'Start Lesson'}
              </button>
            </div>
          </Card>

          {!unlocked ? (
            <Card className="border-amber-500/25 bg-amber-950/10">
              <Label>Locked Lesson</Label>
              <p className="text-sm leading-7 text-[#e8dcc0]">Complete the previous lesson to unlock this module.</p>
            </Card>
          ) : hasContent ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <LessonContentBlock title="Objective" value={lesson.objective} featured />
              <LessonContentBlock title="Doctrine" value={lesson.doctrine} featured />
              <LessonContentBlock title="Technical Depth" value={lesson.technical_depth} />
              <LessonContentBlock title="Standards" value={lesson.standards} />
              <LessonContentBlock title="Terminology" value={lesson.terminology} />
              <LessonContentBlock title="Taxonomy" value={lesson.taxonomy} />
              <LessonContentBlock title="Operational Consequences" value={lesson.operational_consequences} />
              <LessonContentBlock title="Amateur Vs Pro" value={lesson.amateur_vs_pro} featured />
              <LessonContentBlock title="Common Failures" value={lesson.common_failures} />
              <LessonContentBlock title="Recovery Logic" value={lesson.recovery_logic} />
              <LessonContentBlock title="Professional Standard" value={lesson.professional_standard} featured />
              <LessonContentBlock title="Real Service Context" value={lesson.real_service_context} />
              <LessonContentBlock title="Practical Execution" value={lesson.practical_execution} />
              <LessonContentBlock title="Guest Application" value={lesson.guest_application} featured />
              <LessonContentBlock title="Manager Notes" value={lesson.manager_notes} />
              <LessonContentBlock title="Drill" value={lesson.drill} featured />
              <LessonContentBlock title="Assessment Questions" value={lesson.assessment_questions} />
            </div>
          ) : (
            <Card>
              <Label>Lesson Content</Label>
              <p className="text-sm leading-7 text-[#e8dcc0]">Lesson content pending academy expansion</p>
            </Card>
          )}

          <Card className="border-l-4 border-l-[#c9a96e] bg-gradient-to-r from-[#c9a96e]/5 to-transparent">
            <h2 className="font-serif text-2xl font-black text-[#f5f5f0]">HESTIA Doctrine</h2>
            <p className="mt-3 font-serif text-lg italic leading-8 text-[#f5f5f0]">"{t.copy.doctrine}"</p>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button disabled={!unlocked || complete} onClick={() => onCompleteLesson?.(academy.id, lesson.id)}>
              {complete ? 'Lesson Complete' : 'Mark Lesson Complete'}
            </Button>
            <Button variant="secondary" disabled={!nextUnlocked} onClick={() => nextLesson && onOpenLesson?.(academy.id, nextLesson.id)}>
              Next Lesson
            </Button>
            <Button variant="secondary" onClick={() => goToPage('knowledgeLibrary')}>Ask Expert</Button>
            <Button variant="ghost" onClick={() => goToPage('courses')}>Back To Courses</Button>
          </div>
        </div>
      </div>
    </>
  )
}
