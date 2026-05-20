// Builds a guided narration script from real lesson fields and a persona record.
// This is deterministic: same lesson + same persona always produces the same script.
// No LLM calls. No invented content.
// Every source-derived segment points to the lesson field it came from.

// Deterministic pick from a pool using the seed string.
function pickFromPool(pool, seed) {
  if (!pool || !pool.length) return ''
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return pool[Math.abs(hash) % pool.length]
}

// Handles taxonomy as {type, usage}[] — the actual shape in all Bar lessons.
// Falls back gracefully if items are plain strings.
function formatTaxonomy(taxonomy) {
  if (!Array.isArray(taxonomy) || !taxonomy.length) return ''
  return taxonomy
    .map(item => {
      if (item && typeof item === 'object' && item.type) {
        return item.usage ? `${item.type}: ${item.usage}` : item.type
      }
      return typeof item === 'string' ? item : ''
    })
    .filter(Boolean)
    .join('. ')
}

function hasValue(v) {
  if (v === null || v === undefined) return false
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'object') return Object.keys(v).length > 0
  return String(v).trim().length > 0
}

// Splits text into sentence strings. Conservative — splits on ". ", "? ", "! ".
function splitSentences(text) {
  if (!text || typeof text !== 'string') return []
  const matches = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || []
  return matches.map(s => s.trim()).filter(Boolean)
}

export function buildInstructorScript(lesson, persona) {
  const segments = []
  let sourceDerivedCount = 0
  const lessonSeed = lesson.id || lesson.title || 'default'

  // ── Greeting ────────────────────────────────────────────────────────────────
  const greetingBase = pickFromPool(persona.greeting_phrases, lessonSeed) || 'Welcome.'
  const greetingText = lesson.title
    ? `${greetingBase} Today, ${lesson.title}.`
    : greetingBase
  segments.push({ type: 'greeting', sourceField: null, text: greetingText })

  // ── Objective (source-derived) ───────────────────────────────────────────────
  if (hasValue(lesson.objective)) {
    segments.push({ type: 'source-derived', sourceField: 'objective', text: String(lesson.objective) })
    sourceDerivedCount++
  }

  // ── Terminology (source-derived with transition) ──────────────────────────────
  if (Array.isArray(lesson.terminology) && lesson.terminology.length > 0) {
    const transition = persona.transitions?.to_terminology || 'A few words before we begin.'
    segments.push({ type: 'transition', sourceField: null, text: transition })
    const termsText = lesson.terminology.join(', ') + '.'
    segments.push({ type: 'source-derived', sourceField: 'terminology', text: termsText })
    sourceDerivedCount++
  }

  // ── Technical depth (source-derived with transition) ─────────────────────────
  if (hasValue(lesson.technical_depth)) {
    const transition = persona.transitions?.to_depth || 'Here is what is underneath.'
    segments.push({ type: 'transition', sourceField: null, text: transition })
    segments.push({ type: 'source-derived', sourceField: 'technical_depth', text: String(lesson.technical_depth) })
    sourceDerivedCount++
  }

  // ── Taxonomy (source-derived with transition) — handles {type, usage}[] ───────
  if (Array.isArray(lesson.taxonomy) && lesson.taxonomy.length > 0) {
    const formattedTaxonomy = formatTaxonomy(lesson.taxonomy)
    if (formattedTaxonomy) {
      const transition = persona.transitions?.to_taxonomy || 'These are the categories to know.'
      segments.push({ type: 'transition', sourceField: null, text: transition })
      segments.push({ type: 'source-derived', sourceField: 'taxonomy', text: formattedTaxonomy })
      sourceDerivedCount++
    }
  }

  // ── Common failures (source-derived with transition) ─────────────────────────
  if (Array.isArray(lesson.common_failures) && lesson.common_failures.length > 0) {
    const transition = persona.transitions?.to_failures || 'Here is where most pours go wrong.'
    segments.push({ type: 'transition', sourceField: null, text: transition })
    const failuresText = lesson.common_failures.join('. ') + '.'
    segments.push({ type: 'source-derived', sourceField: 'common_failures', text: failuresText })
    sourceDerivedCount++
  }

  // ── Practical execution (source-derived with transition) ─────────────────────
  if (Array.isArray(lesson.practical_execution) && lesson.practical_execution.length > 0) {
    const transition = persona.transitions?.to_practice || 'Now, the part that matters.'
    segments.push({ type: 'transition', sourceField: null, text: transition })
    const stepsText = lesson.practical_execution.join('. ') + '.'
    segments.push({ type: 'source-derived', sourceField: 'practical_execution', text: stepsText })
    sourceDerivedCount++
  }

  // ── Guest application (source-derived with transition) ───────────────────────
  if (hasValue(lesson.guest_application)) {
    const transition = persona.transitions?.to_guest || "And from the guest's side—"
    segments.push({ type: 'transition', sourceField: null, text: transition })
    segments.push({ type: 'source-derived', sourceField: 'guest_application', text: String(lesson.guest_application) })
    sourceDerivedCount++
  }

  // ── Drill (source-derived with transition) ────────────────────────────────────
  if (hasValue(lesson.drill)) {
    const transition = persona.transitions?.to_drill || 'Tonight, practice it once. Just once.'
    segments.push({ type: 'transition', sourceField: null, text: transition })
    segments.push({ type: 'source-derived', sourceField: 'drill', text: String(lesson.drill) })
    sourceDerivedCount++
  }

  // ── Closing ──────────────────────────────────────────────────────────────────
  const closingText = pickFromPool(persona.closing_phrases, lessonSeed + '_close') ||
    'That is what we have today.'
  segments.push({ type: 'closing', sourceField: null, text: closingText })

  // ── Editorial threshold check ─────────────────────────────────────────────────
  const editorialNeeded = sourceDerivedCount < 3

  if (editorialNeeded) {
    const apoSegments = [
      { type: 'greeting', sourceField: null, text: greetingText },
      {
        type: 'source-derived',
        sourceField: null,
        text: 'This lesson is still being prepared. Step back in when more content is ready.',
      },
      { type: 'closing', sourceField: null, text: closingText },
    ]
    const apoText = apoSegments.map(s => s.text).join(' ')
    return {
      title: lesson.title || '',
      instructorId: persona.id || '',
      instructorName: persona.name || 'Instructor',
      academyLabel: persona.academyLabel || 'HESTIA Academy',
      instructorTone: persona.tone || '',
      instructorTitle: persona.display_title || '',
      voiceProfile: persona.voice_profile || null,
      portraitSrc: persona.portrait_src || null,
      segments: apoSegments,
      sentences: splitSentences(apoText),
      keyTakeaways: [],
      reviewQuestions: [],
      sourceFieldsUsed: [],
      editorialNeeded: true,
      transcript: apoText,
      prototypeOnly: false,
    }
  }

  // ── Assemble transcript text ──────────────────────────────────────────────────
  const transcript = segments.map(s => s.text).filter(Boolean).join(' ')
  const sentences = splitSentences(transcript)
  const sourceFieldsUsed = [...new Set(
    segments.filter(s => s.sourceField).map(s => s.sourceField)
  )]

  // ── Key takeaways — sourced only from structured fields (max 5) ──────────────
  const keyTakeaways = [
    hasValue(lesson.objective) ? String(lesson.objective) : null,
    ...(Array.isArray(lesson.practical_execution) ? lesson.practical_execution.slice(0, 3) : []),
    hasValue(lesson.guest_application) ? String(lesson.guest_application) : null,
    hasValue(lesson.drill) ? String(lesson.drill) : null,
  ].filter(s => typeof s === 'string' && s.trim().length > 0).slice(0, 5)

  // ── Review questions — sourced only from assessment_questions ─────────────────
  const reviewQuestions = Array.isArray(lesson.assessment_questions)
    ? lesson.assessment_questions.slice(0, 4)
    : []

  return {
    title: lesson.title || '',
    instructorId: persona.id || '',
    instructorName: persona.name || 'Instructor',
    academyLabel: persona.academyLabel || 'HESTIA Academy',
    instructorTone: persona.tone || '',
    instructorTitle: persona.display_title || '',
    voiceProfile: persona.voice_profile || null,
    portraitSrc: persona.portrait_src || null,
    segments,
    sentences,
    keyTakeaways,
    reviewQuestions,
    sourceFieldsUsed,
    editorialNeeded: false,
    transcript,
    prototypeOnly: false,
  }
}
