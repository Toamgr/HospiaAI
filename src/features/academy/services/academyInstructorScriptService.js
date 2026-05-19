export function buildInstructorScript(lesson, persona) {
  const sourceFieldsUsed = []
  const parts = []

  if (lesson.title) {
    parts.push(`Welcome. Today we cover ${lesson.title}.`)
    sourceFieldsUsed.push('title')
  }

  if (lesson.objective) {
    parts.push(`Our objective: ${lesson.objective}.`)
    sourceFieldsUsed.push('objective')
  }

  if (lesson.doctrine) {
    parts.push(`${lesson.doctrine}.`)
    sourceFieldsUsed.push('doctrine')
  }

  if (Array.isArray(lesson.terminology) && lesson.terminology.length > 0) {
    const terms = lesson.terminology.join(', ')
    parts.push(`Key concepts to know: ${terms}.`)
    sourceFieldsUsed.push('terminology')
  }

  if (lesson.real_service_context) {
    parts.push(`In real service: ${lesson.real_service_context}.`)
    sourceFieldsUsed.push('real_service_context')
  }

  if (Array.isArray(lesson.common_failures) && lesson.common_failures.length > 0) {
    const failures = lesson.common_failures.join('. ')
    parts.push(`Common mistakes to avoid: ${failures}.`)
    sourceFieldsUsed.push('common_failures')
  }

  if (Array.isArray(lesson.practical_execution) && lesson.practical_execution.length > 0) {
    const steps = lesson.practical_execution.join('. ')
    parts.push(`In practice: ${steps}.`)
    sourceFieldsUsed.push('practical_execution')
  }

  if (lesson.guest_application) {
    parts.push(`For the guest: ${lesson.guest_application}.`)
    sourceFieldsUsed.push('guest_application')
  }

  if (lesson.amateur_vs_pro?.pro) {
    parts.push(`The professional approach: ${lesson.amateur_vs_pro.pro}.`)
    sourceFieldsUsed.push('amateur_vs_pro')
  }

  if (lesson.professional_standard) {
    parts.push(`Remember: ${lesson.professional_standard}.`)
    sourceFieldsUsed.push('professional_standard')
  }

  const transcript = parts.join(' ')
  const sentences = transcript.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()).filter(Boolean) ?? []

  const keyTakeaways = [
    lesson.objective,
    lesson.professional_standard,
    lesson.doctrine,
    lesson.guest_application,
  ].filter(s => typeof s === 'string' && s.trim().length > 0).slice(0, 4)

  const reviewQuestions = Array.isArray(lesson.assessment_questions) ? lesson.assessment_questions : []
  if (reviewQuestions.length > 0) sourceFieldsUsed.push('assessment_questions')

  return {
    title: lesson.title || '',
    instructorName: persona.name,
    instructorTone: persona.tone,
    transcript,
    sentences,
    keyTakeaways,
    reviewQuestions,
    sourceFieldsUsed,
    prototypeOnly: false,
  }
}
