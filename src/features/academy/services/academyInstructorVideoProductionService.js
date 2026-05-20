// HESTIA Academy — Instructor Video Production Service
//
// buildInstructorVideoProductionPackage(lesson, script, rawVideoEntry = null)
//   lesson        — raw lesson object from the data layer
//   script        — built by academyInstructorScriptService; same source as Voice mode
//   rawVideoEntry — raw entry from academyInstructorVideoMap, or null
//
// Production status logic:
//   null entry              → 'needs_video'
//   entry, no trusted URL   → 'in_production'  (or entry.status if more specific)
//   entry, trusted URL      → 'video_ready'
//
// scriptText is the exact narration used by Voice mode — not a second script.
// embedUrl/publicUrl are only set when the video is trusted and confirmed.

import { isTrustedInstructorEmbedUrl } from '../instructor/instructorEmbedProviders'

const VALID_STATUSES = ['needs_video', 'in_production', 'video_ready']

function estimateDuration(transcript, voiceRate) {
  const words = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0
  if (!words) return { ms: 0, label: '0s' }
  const wpm = 140 * (voiceRate || 0.88)
  const ms = Math.round((words / wpm) * 60000)
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.round((ms % 60000) / 1000)
  return { ms, label: minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s` }
}

// ── Main export ──────────────────────────────────────────────────────────────

export function buildInstructorVideoProductionPackage(lesson, script, rawVideoEntry = null) {
  const transcript = script?.transcript || ''
  const voiceRate = script?.voiceProfile?.rate ?? 0.88
  const { ms: estimatedDurationMs, label: estimatedDurationLabel } = estimateDuration(
    transcript,
    voiceRate
  )

  // Determine production status from the raw map entry
  let productionStatus = 'needs_video'
  let provider = null
  let embedUrl = null
  let publicUrl = null

  if (rawVideoEntry) {
    const hasTrustedUrl = isTrustedInstructorEmbedUrl(rawVideoEntry.embedUrl, rawVideoEntry.provider)
    if (hasTrustedUrl) {
      productionStatus = 'video_ready'
      provider = rawVideoEntry.provider
      embedUrl = rawVideoEntry.embedUrl
      publicUrl = rawVideoEntry.publicUrl || null
    } else {
      // Entry exists but video not yet ready — honour explicit status if valid
      productionStatus =
        rawVideoEntry.status && VALID_STATUSES.includes(rawVideoEntry.status)
          ? rawVideoEntry.status
          : 'in_production'
    }
  }

  return {
    lessonId: lesson.id || '',
    academy: script?.academyLabel || '',
    moduleId: lesson.moduleId || '',
    lessonTitle: lesson.title || '',
    instructorId: script?.instructorId || '',
    instructorName: script?.instructorName || '',
    instructorTitle: script?.instructorTitle || '',
    videoTitle: `HESTIA ${script?.academyLabel || 'Academy'} — ${lesson.title || ''}`,
    productionStatus,
    provider,
    embedUrl,
    publicUrl,
    estimatedDurationMs,
    estimatedDurationLabel,
    scriptText: transcript,
    scriptSegments: script?.segments || [],
    productionNotes: {
      tone: script?.instructorTone || '',
      pacing:
        voiceRate <= 0.90
          ? 'measured and deliberate — allow slight pauses between sentences'
          : 'calm and conversational',
      visualDirection:
        'Dark walnut / near-black background. Brass accent rim light. ' +
        'Refined editorial typography. Instructor portrait or abstract head/shoulders silhouette. ' +
        'No cartoon elements, no bouncing equalizer bars, no neon, no generic SaaS purple.',
      pronunciationNotes: null,
      forbiddenAdditions:
        'No XP indicators, no streak counters, no module/course-completion overlays, ' +
        'no cartoon faces, no emoji. Do not use the words: TTS, AI voice, robot voice, ' +
        'synthesized speech, XP, streak, module, course completion.',
    },
  }
}

// ── Validation ───────────────────────────────────────────────────────────────

export function validateVideoMapEntry(lessonId, entry, expectedLessonTitle = null) {
  const errors = []
  const warnings = []

  if (!lessonId || typeof lessonId !== 'string') {
    errors.push('lessonId is required')
  }

  if (!entry || typeof entry !== 'object') {
    errors.push('entry must be an object')
    return { valid: false, lessonId, errors, warnings }
  }

  if (!VALID_STATUSES.includes(entry.status)) {
    errors.push(
      `status must be one of: ${VALID_STATUSES.join(', ')} — got: ${JSON.stringify(entry.status)}`
    )
  }

  if (!entry.provider) {
    errors.push('provider is required')
  }

  if (!entry.title) {
    warnings.push('title is missing — recommended for production tracking')
  }

  if (entry.status === 'video_ready') {
    if (!entry.embedUrl) {
      errors.push('video_ready entries must have embedUrl')
    } else if (!isTrustedInstructorEmbedUrl(entry.embedUrl, entry.provider)) {
      errors.push(
        `embedUrl is not on the trusted allowlist for provider "${entry.provider}". ` +
          'Check instructorEmbedProviders.js.'
      )
    }
    if (!entry.publicUrl) {
      warnings.push('publicUrl is missing — recommended for video_ready entries')
    }
  }

  if (entry.status !== 'video_ready' && entry.embedUrl) {
    warnings.push(
      `entry has an embedUrl but status is "${entry.status}" — ` +
        'update status to video_ready when the video is confirmed'
    )
  }

  // Cross-reference lesson title if provided
  if (expectedLessonTitle && entry.title) {
    const entryLower = entry.title.toLowerCase()
    const lessonLower = expectedLessonTitle.toLowerCase()
    // Check at least one word from the lesson title appears in the entry title
    const lessonWords = lessonLower.split(/\s+/).filter((w) => w.length > 4)
    const matches = lessonWords.some((w) => entryLower.includes(w))
    if (!matches) {
      warnings.push(
        `entry title "${entry.title}" may not match lesson "${expectedLessonTitle}" — ` +
          'verify the correct video is mapped to this lesson'
      )
    }
  }

  return {
    valid: errors.length === 0,
    lessonId,
    status: entry.status,
    errors,
    warnings,
  }
}

// ── Development-only console helpers ────────────────────────────────────────
//
// window.__HESTIA_EXPORT_INSTRUCTOR_VIDEO_PACKAGE__('bar-001')
//   Prints the full production package for a lesson — scriptText, instructor,
//   productionNotes, estimated duration, current status.
//
// window.__HESTIA_VALIDATE_VIDEO_ENTRY__('service-001')
//   Validates the video map entry for a lesson. Reports errors and warnings.
//
// window.__HESTIA_LIST_VIDEO_PRODUCTION_QUEUE__()
//   Lists all lessons with their current production status — shows what
//   needs_video, what is in_production, and what is video_ready.

if (import.meta.env.DEV) {
  async function loadDeps() {
    const [
      { UNIVERSITY_MANIFEST },
      { resolveInstructorPersona },
      { buildInstructorScript },
      { default: videoMap },
    ] = await Promise.all([
      import('../../../data/academy/universityManifest'),
      import('./academyInstructorPersonaResolver'),
      import('./academyInstructorScriptService'),
      import('../data/academyInstructorVideoMap'),
    ])
    const allLessons = UNIVERSITY_MANIFEST.flatMap((a) => a.lessons || [])
    return { allLessons, videoMap, resolveInstructorPersona, buildInstructorScript }
  }

  window.__HESTIA_EXPORT_INSTRUCTOR_VIDEO_PACKAGE__ = async (lessonId) => {
    const { allLessons, videoMap, resolveInstructorPersona, buildInstructorScript } =
      await loadDeps()
    const lesson = allLessons.find((l) => l.id === lessonId)
    if (!lesson) {
      console.warn('[HESTIA] No lesson found for id:', lessonId)
      console.info('[HESTIA] Available lesson ids:', allLessons.map((l) => l.id))
      return null
    }
    const rawEntry = videoMap[lessonId] || null
    const persona = resolveInstructorPersona(lesson)
    const script = buildInstructorScript(lesson, persona)
    const pkg = buildInstructorVideoProductionPackage(lesson, script, rawEntry)
    console.group(`[HESTIA] Video Production Package — ${lessonId}`)
    console.log(JSON.stringify(pkg, null, 2))
    console.groupEnd()
    return pkg
  }

  window.__HESTIA_VALIDATE_VIDEO_ENTRY__ = async (lessonId) => {
    const { allLessons, videoMap } = await loadDeps()
    const entry = videoMap[lessonId]
    if (!entry) {
      console.info(`[HESTIA] No video map entry for "${lessonId}" — status: needs_video`)
      return { valid: true, lessonId, status: 'needs_video', errors: [], warnings: [] }
    }
    const lesson = allLessons.find((l) => l.id === lessonId)
    const result = validateVideoMapEntry(lessonId, entry, lesson?.title || null)
    if (result.valid) {
      console.log(`[HESTIA] ✓ ${lessonId} — ${result.status}`)
    } else {
      console.warn(`[HESTIA] ✗ ${lessonId} — ${result.status}`)
    }
    if (result.errors.length) console.error('[HESTIA] Errors:', result.errors)
    if (result.warnings.length) console.warn('[HESTIA] Warnings:', result.warnings)
    return result
  }

  window.__HESTIA_LIST_VIDEO_PRODUCTION_QUEUE__ = async () => {
    const { allLessons, videoMap } = await loadDeps()
    const queue = allLessons.map((lesson) => {
      const entry = videoMap[lesson.id] || null
      const hasTrusted =
        entry && isTrustedInstructorEmbedUrl(entry.embedUrl, entry.provider)
      const status = hasTrusted
        ? 'video_ready'
        : entry
          ? (VALID_STATUSES.includes(entry.status) ? entry.status : 'in_production')
          : 'needs_video'
      return { lessonId: lesson.id, lessonTitle: lesson.title || '', status }
    })

    const byStatus = {
      video_ready: queue.filter((r) => r.status === 'video_ready'),
      in_production: queue.filter((r) => r.status === 'in_production'),
      needs_video: queue.filter((r) => r.status === 'needs_video'),
    }

    console.group('[HESTIA] Instructor Video Production Queue')
    console.log(`video_ready:   ${byStatus.video_ready.length}`)
    console.log(`in_production: ${byStatus.in_production.length}`)
    console.log(`needs_video:   ${byStatus.needs_video.length}`)
    console.log('')
    console.table(queue)
    console.groupEnd()
    return queue
  }
}
