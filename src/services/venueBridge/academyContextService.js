// Academy Context Service — Venue Intelligence → capability development.
//
// Turns the Venue Intelligence Bridge briefs (primarily the Training Brief, with
// Service / F&B / Owner briefs as supporting signal) into venue-level capability
// indicators and a "Recommended For Your Venue" learning order built ENTIRELY from
// the existing academy manifest. It never invents lessons, scores employees, or
// fabricates data — it routes real venue signals to existing academies.
//
// Pure and deterministic. Safe to import from server.js and the frontend.

// Venue-level capability indicators, each mapped to an existing academy.
// `keywords` route real brief items (signals + pain points) to the capability.
export const CAPABILITY_DEFS = [
  { key: 'cocktailExecution',  label: 'Cocktail Execution',  academyId: 'bar-academy',       domain: 'fb',       keywords: ['cocktail', 'bar', 'spec', 'pour', 'recipe', 'execution', 'consisten', 'prep', 'batch', 'technique', 'drink', 'menu'] },
  { key: 'wineKnowledge',      label: 'Wine Knowledge',      academyId: 'wine-academy',      domain: 'fb',       keywords: ['wine', 'pairing', 'sommelier', 'grape', 'vintage', 'tasting', 'cellar'] },
  { key: 'upselling',          label: 'Upselling',           academyId: 'service-academy',   domain: 'service',  keywords: ['upsell', 'upselling', 'suggest', 'recommend', 'check average', 'add-on', 'premium pour', 'revenue per', 'spend'] },
  { key: 'guestExperience',    label: 'Guest Experience',    academyId: 'service-academy',   domain: 'service',  keywords: ['guest', 'experience', 'hospitality', 'welcome', 'warmth', 'attentive', 'care', 'feeling'] },
  { key: 'serviceConsistency', label: 'Service Consistency', academyId: 'service-academy',   domain: 'service',  keywords: ['service', 'consisten', 'standard', 'sequence', 'pace', 'floor', 'complaint', 'recovery', 'execut'] },
  { key: 'leadership',         label: 'Leadership',          academyId: 'manager-academy',   domain: 'owner',    keywords: ['leadership', 'manager', 'briefing', 'control', 'accountab', 'supervis', 'capacity'] },
  { key: 'trainingDiscipline', label: 'Training Discipline', academyId: 'train-the-trainer', domain: 'training', keywords: ['train', 'onboard', 'retention', 'knowledge', 'forget', 'teach', 'coach', 'turnover', 'hire', 'new staff'] }
]

function clean(items) {
  return Array.isArray(items) ? items.map(s => String(s).trim()).filter(Boolean) : []
}
function matches(item, keywords) {
  const lower = String(item).toLowerCase()
  return keywords.some(k => lower.includes(k))
}
function clampPct(n) {
  const v = Number(n)
  return Number.isFinite(v) ? Math.max(0, Math.min(100, Math.round(v))) : 0
}

/**
 * Build the academy capability context from bridge briefs + the academy manifest.
 *
 * @param {object}   input
 * @param {object[]} input.briefs     - bridge briefs (fb/training/service/owner/event)
 * @param {object[]} input.academies  - UNIVERSITY_MANIFEST (existing lessons)
 * @returns {{ active:boolean, capabilitySignals:object[], recommendations:object[] }}
 */
export function buildAcademyContext({ briefs = [], academies = [] } = {}) {
  const byType = {}
  for (const b of Array.isArray(briefs) ? briefs : []) if (b && b.type) byType[b.type] = b

  const confByDomain = {
    fb:       clampPct(byType.fb?.confidence),
    service:  clampPct(byType.service?.confidence),
    training: clampPct(byType.training?.confidence),
    owner:    clampPct(byType.owner?.confidence)
  }

  // Pain points (operational constraints) vs. descriptive signals — kept separate
  // so a capability with active pain reads as a gap, not merely "developing".
  const pains = [
    ...clean(byType.training?.priorities),
    ...clean(byType.service?.priorities),
    ...clean(byType.fb?.priorities),
    ...clean(byType.owner?.priorities)
  ]
  const signals = [
    ...clean(byType.training?.signals),
    ...clean(byType.service?.signals),
    ...clean(byType.fb?.signals)
  ]

  const academyById = {}
  for (const a of academies) academyById[a.id] = a

  const capabilitySignals = CAPABILITY_DEFS.map(def => {
    const matchedPains = pains.filter(p => matches(p, def.keywords))
    const matchedSignals = signals.filter(s => matches(s, def.keywords))
    const confidence = confByDomain[def.domain] || 0

    let status, note
    if (matchedPains.length) {
      status = 'gap'
      note = matchedPains[0]
    } else if (matchedSignals.length) {
      status = 'developing'
      note = matchedSignals[0]
    } else if (confidence >= 60) {
      status = 'solid'
      note = 'No concerns surfaced in the venue conversation.'
    } else {
      status = 'unknown'
      note = 'Not yet assessed — continue Venue Learning to surface this.'
    }

    // Severity drives the recommendation order. Gaps first, weighted by how many
    // signals point at them and how low current understanding is.
    const severity = status === 'gap'
      ? 100 + matchedPains.length * 10 + (100 - confidence) / 10
      : status === 'developing'
        ? 50 + matchedSignals.length * 5
        : status === 'solid' ? 10 : 0

    return { key: def.key, label: def.label, academyId: def.academyId, status, confidence, note, severity }
  })

  // Recommendations: only real gaps/developing areas, mapped to existing academies.
  const recommendations = capabilitySignals
    .filter(c => c.status === 'gap' || c.status === 'developing')
    .sort((a, b) => b.severity - a.severity)
    .slice(0, 4)
    .map((c, i) => {
      const academy = academyById[c.academyId]
      const firstLesson = academy?.lessons?.[0]
      return {
        priority: i + 1,
        area: c.label,
        status: c.status,
        academyId: c.academyId,
        academyTitle: academy?.title || c.label,
        lessonId: firstLesson?.id || null,
        lessonTitle: firstLesson?.title || null,
        reason: c.note
      }
    })

  // Active only when at least one real gap/developing signal exists — otherwise
  // the consumer falls back to the standard academy view with no venue panel.
  const active = recommendations.length > 0

  return {
    active,
    capabilitySignals: capabilitySignals.map(({ severity, ...rest }) => rest),
    recommendations
  }
}
