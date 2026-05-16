import React, { useState, useMemo, useEffect } from 'react'
import { cx } from '../../utils/format'
import { Card, Button, Label, Header } from '../../components/AppPrimitives'
import { getVisibleAcademies, getUserLessonProgress, isLessonComplete, isLessonUnlocked, lessonHasExpandedContent } from '../../utils/academy'

// ─── Field value renderer ──────────────────────────────────────────────────────
function FieldBody({ value }) {
  if (!value) return null
  if (Array.isArray(value)) {
    if (!value.length) return null
    return (
      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="rounded-xl border border-[#6b705c]/25 bg-[#10100e] p-3 text-sm leading-6 text-[#e8dcc0]">
            {typeof item === 'object' ? (
              <>
                <span className="font-black text-[#f5f5f0]">
                  {item.type || item.title || item.label || `Point ${i + 1}`}:{' '}
                </span>
                {item.usage || item.detail || item.value || ''}
              </>
            ) : item}
          </div>
        ))}
      </div>
    )
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value)
    if (!entries.length) return null
    return (
      <div className="space-y-2">
        {entries.map(([key, val]) => (
          <div key={key} className="rounded-xl border border-[#6b705c]/25 bg-[#10100e] p-3 text-sm leading-6 text-[#e8dcc0]">
            <span className="font-black text-[#f5f5f0]">{key}: </span>{String(val)}
          </div>
        ))}
      </div>
    )
  }
  return <p className="text-sm leading-7 text-[#e8dcc0]">{value}</p>
}

function hasValue(v) {
  if (!v) return false
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v).length > 0
  return String(v).trim().length > 0
}

// ─── Step builder — assembles guided steps from real lesson content fields ─────
function buildSteps(lesson) {
  const steps = []

  if (hasValue(lesson.objective) || hasValue(lesson.doctrine)) {
    steps.push({
      type: 'intro',
      label: 'Introduction',
      heading: 'Lesson Overview',
      instructorNote: 'Begin here. This section establishes the purpose of this lesson — what you will be able to do after completing it, and why it matters in real service.',
      fields: [
        { title: 'Objective', value: lesson.objective },
        { title: 'Doctrine', value: lesson.doctrine },
      ].filter(f => hasValue(f.value)),
    })
  }

  if (hasValue(lesson.technical_depth) || hasValue(lesson.standards)) {
    steps.push({
      type: 'knowledge',
      label: 'Core Knowledge',
      heading: 'The Foundation',
      instructorNote: 'This is the knowledge layer. Surface understanding will not hold under real service pressure. Read carefully — accuracy here is what separates confident professionals from uncertain ones.',
      fields: [
        { title: 'Technical Depth', value: lesson.technical_depth },
        { title: 'Standards', value: lesson.standards },
      ].filter(f => hasValue(f.value)),
    })
  }

  if (hasValue(lesson.terminology) || hasValue(lesson.taxonomy)) {
    steps.push({
      type: 'vocabulary',
      label: 'Vocabulary',
      heading: 'Professional Language',
      instructorNote: 'Professionals communicate precisely. These terms define how skilled operators name and discuss their domain. Learn them and use them — with guests, with colleagues, and in your own thinking.',
      fields: [
        { title: 'Terminology', value: lesson.terminology },
        { title: 'Taxonomy', value: lesson.taxonomy },
      ].filter(f => hasValue(f.value)),
    })
  }

  if (hasValue(lesson.common_failures) || hasValue(lesson.operational_consequences) || hasValue(lesson.amateur_vs_pro)) {
    steps.push({
      type: 'failure',
      label: 'What Goes Wrong',
      heading: 'Common Failures',
      instructorNote: 'Study failure before it happens to you. The best operators recognise these patterns early and interrupt them. Knowing what goes wrong is not pessimism — it is preparation.',
      fields: [
        { title: 'Common Failures', value: lesson.common_failures },
        { title: 'Operational Consequences', value: lesson.operational_consequences },
        { title: 'Amateur vs Professional', value: lesson.amateur_vs_pro },
      ].filter(f => hasValue(f.value)),
    })
  }

  if (hasValue(lesson.practical_execution) || hasValue(lesson.guest_application) || hasValue(lesson.real_service_context)) {
    steps.push({
      type: 'application',
      label: 'Service Application',
      heading: 'In Real Service',
      instructorNote: 'This is where abstract knowledge becomes operational skill. Think through these scenarios with real guests, real tables, and real moments in mind — not theoretical ones.',
      fields: [
        { title: 'Practical Execution', value: lesson.practical_execution },
        { title: 'Guest Application', value: lesson.guest_application },
        { title: 'Real Service Context', value: lesson.real_service_context },
      ].filter(f => hasValue(f.value)),
    })
  }

  if (hasValue(lesson.recovery_logic) || hasValue(lesson.professional_standard)) {
    steps.push({
      type: 'standard',
      label: 'Recovery & Standards',
      heading: 'The Professional Standard',
      instructorNote: 'Standards are not rules — they are commitments. Recovery is not damage control — it is the highest expression of hospitality. This section defines what excellent looks like.',
      fields: [
        { title: 'Recovery Logic', value: lesson.recovery_logic },
        { title: 'Professional Standard', value: lesson.professional_standard },
      ].filter(f => hasValue(f.value)),
    })
  }

  if (hasValue(lesson.manager_notes)) {
    steps.push({
      type: 'manager',
      label: 'Manager Notes',
      heading: 'Coaching Guidance',
      instructorNote: 'This section is written for managers coaching this content. Use it during one-on-ones, post-incident debrief, or pre-shift briefings with staff who need targeted development.',
      fields: [{ title: 'Manager Notes', value: lesson.manager_notes }],
    })
  }

  if (hasValue(lesson.drill) || hasValue(lesson.assessment_questions)) {
    steps.push({
      type: 'drill',
      label: 'Practice Prompt',
      heading: 'Apply the Lesson',
      instructorNote: 'Apply what you have learned. These prompts simulate real service pressure. Answer them honestly — the point is not to score correctly, it is to surface gaps before a real guest does.',
      fields: [
        { title: 'Drill', value: lesson.drill },
        { title: 'Assessment Questions', value: lesson.assessment_questions },
      ].filter(f => hasValue(f.value)),
      isDrill: true,
    })
  }

  // Final recap — always appended as the closing step
  steps.push({
    type: 'recap',
    label: 'Recap',
    heading: 'Key Takeaways',
    instructorNote: 'You have reached the end of this lesson. Review these core principles before marking it complete. The goal is not just to finish — it is to carry something forward into the next shift.',
    fields: [],
    isRecap: true,
    recapPoints: [
      typeof lesson.objective === 'string' ? lesson.objective : null,
      typeof lesson.professional_standard === 'string' ? lesson.professional_standard : null,
      typeof lesson.doctrine === 'string' ? lesson.doctrine : null,
    ].filter(Boolean),
  })

  return steps
}

// ─── Step progress indicator ───────────────────────────────────────────────────
function StepDots({ total, current }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cx(
            'rounded-full transition-all duration-200',
            i === current
              ? 'h-2 w-6 bg-[#c9a96e]'
              : i < current
                ? 'h-2 w-2 bg-[#c9a96e]/45'
                : 'h-2 w-2 bg-[#6b705c]/30'
          )}
        />
      ))}
    </div>
  )
}

// ─── LessonPlayer ──────────────────────────────────────────────────────────────
export default function LessonPlayer({ t, currentUser, goToPage, academyProgress = {}, selectedAcademyId, selectedLessonId, onOpenLesson, onCompleteLesson }) {
  const [stepIndex, setStepIndex] = useState(0)

  const visibleAcademies = useMemo(() => getVisibleAcademies(currentUser), [currentUser])
  const completedLessons = getUserLessonProgress(academyProgress, currentUser)
  const academy = visibleAcademies.find(a => a.id === selectedAcademyId) || visibleAcademies[0]
  const foundLessonIndex = academy?.lessons?.findIndex(a => a.id === selectedLessonId) ?? 0
  const lessonIndex = foundLessonIndex >= 0 ? foundLessonIndex : 0
  const lesson = academy?.lessons?.[lessonIndex] || academy?.lessons?.[0]
  const unlocked = academy && lesson ? isLessonUnlocked(academy, lessonIndex, completedLessons) : false
  const complete = academy && lesson ? isLessonComplete(completedLessons, academy.id, lesson.id) : false
  const hasContent = lessonHasExpandedContent(lesson)
  const nextLesson = academy?.lessons?.[lessonIndex + 1]
  const nextUnlocked = nextLesson && isLessonComplete(completedLessons, academy.id, lesson?.id)

  // Reset to step 0 whenever the lesson changes
  useEffect(() => { setStepIndex(0) }, [selectedLessonId])

  const steps = useMemo(
    () => (hasContent && lesson ? buildSteps(lesson) : []),
    [lesson, hasContent]
  )
  const step = steps[stepIndex] ?? null
  const totalSteps = steps.length
  const isFirst = stepIndex === 0
  const isLast = stepIndex === totalSteps - 1

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
      <div className="grid gap-8 xl:grid-cols-[300px_minmax(0,1fr)]">

        {/* ── Lesson path sidebar ──────────────────────────────────────────── */}
        <div className="space-y-4">
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
                      <span className={cx(
                        'rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em]',
                        itemComplete ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                          : itemUnlocked ? 'border-[#c9a96e]/25 text-[#c9a96e]'
                          : 'border-[#6b705c]/30 text-[#e8dcc0]/60'
                      )}>
                        {itemComplete ? 'Complete' : itemUnlocked ? 'Open' : 'Locked'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-black leading-5 text-[#f5f5f0]">{item.title}</div>
                  </button>
                )
              })}
            </div>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => goToPage('courses')}>← Courses</Button>
            <Button variant="secondary" onClick={() => goToPage('knowledgeLibrary')}>Knowledge Library</Button>
          </div>
        </div>

        {/* ── Guided lesson player ─────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Lesson header */}
          <Card className="border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.11),transparent_34%),#14130f]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e]">{academy.category}</div>
                <h2 className="mt-2 font-serif text-3xl font-black text-[#f5f5f0]">{lesson.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#e8dcc0]/60">{lesson.duration || 'Self-paced lesson'}</p>
              </div>
              {complete && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-200">
                  Complete
                </span>
              )}
            </div>
          </Card>

          {!unlocked ? (
            <Card className="border-amber-500/25 bg-amber-950/10">
              <Label>Locked Lesson</Label>
              <p className="text-sm leading-7 text-[#e8dcc0]">Complete the previous lesson to unlock this module.</p>
            </Card>

          ) : !hasContent ? (
            <Card>
              <div className="py-8 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-4">Lesson Ready</div>
                <p className="text-sm leading-7 text-[#e8dcc0] mb-6">Review this lesson with your trainer or manager. Mark it complete when ready.</p>
                <Button disabled={complete} onClick={() => onCompleteLesson?.(academy.id, lesson.id)}>
                  {complete ? 'Lesson Complete' : 'Mark Lesson Complete'}
                </Button>
              </div>
            </Card>

          ) : step ? (
            <>
              {/* Step progress */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <StepDots total={totalSteps} current={stepIndex} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/40">
                    Step {stepIndex + 1} of {totalSteps}
                  </span>
                </div>
                <span className="rounded-full border border-[#6b705c]/25 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/45">
                  {step.label}
                </span>
              </div>

              {/* Step heading */}
              <h3 className="font-serif text-2xl font-black text-[#f5f5f0]">{step.heading}</h3>

              {/* Instructor Note */}
              <div className="rounded-2xl border border-[#c9a96e]/25 bg-[#c9a96e]/5 px-5 py-4">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#c9a96e]">
                  Instructor Note
                </div>
                <p className="text-sm leading-7 text-[#e8dcc0]">{step.instructorNote}</p>
              </div>

              {/* Step content */}
              {step.isRecap ? (
                <div className="space-y-4">
                  {step.recapPoints.length > 0 ? (
                    step.recapPoints.map((point, i) => (
                      <div key={i} className={cx(
                        'rounded-2xl border p-5',
                        i === 0 ? 'border-[#c9a96e]/30 bg-[#c9a96e]/5' : 'border-[#6b705c]/20 bg-[#14130f]'
                      )}>
                        <p className="text-sm leading-7 text-[#e8dcc0]">{point}</p>
                      </div>
                    ))
                  ) : (
                    <Card>
                      <p className="text-sm leading-7 text-[#e8dcc0]/55">Review your notes from this lesson before marking it complete.</p>
                    </Card>
                  )}
                  <div className="rounded-2xl border border-[#6b705c]/20 border-l-4 border-l-[#c9a96e] bg-gradient-to-r from-[#c9a96e]/5 to-transparent p-5">
                    <p className="font-serif text-lg italic leading-8 text-[#f5f5f0]">"{t.copy.doctrine}"</p>
                  </div>
                </div>
              ) : step.isDrill ? (
                <div className="space-y-4">
                  {step.fields.map(field => (
                    <div key={field.title} className="rounded-2xl border border-[#c9a96e]/20 bg-[#19170f] p-5">
                      <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#c9a96e]">
                        {field.title}
                      </div>
                      <FieldBody value={field.value} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {step.fields.map(field => (
                    <Card key={field.title}>
                      <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/50">
                        {field.title}
                      </div>
                      <FieldBody value={field.value} />
                    </Card>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <Button variant="secondary" disabled={isFirst} onClick={() => setStepIndex(i => i - 1)}>
                  ← Previous
                </Button>
                {isLast ? (
                  <div className="flex gap-3">
                    <Button disabled={complete} onClick={() => onCompleteLesson?.(academy.id, lesson.id)}>
                      {complete ? 'Lesson Complete' : 'Mark Complete'}
                    </Button>
                    {nextLesson && (
                      <Button variant="secondary" disabled={!nextUnlocked} onClick={() => nextLesson && onOpenLesson?.(academy.id, nextLesson.id)}>
                        Next Lesson →
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button onClick={() => setStepIndex(i => i + 1)}>
                    Next →
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  )
}
