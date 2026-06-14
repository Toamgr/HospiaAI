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
//
// `requiresBeverageContext: true` means the capability only activates when the
// venue genuinely runs a cocktail/bar operation (beverage-led type OR explicit
// cocktail/bar/spirit signals). This prevents broad words like "consistency" or
// "menu" from routing a family restaurant or a buffet hotel into cocktail
// technique lessons it has no use for.
export const CAPABILITY_DEFS = [
  { key: 'cocktailExecution',  label: 'Cocktail Execution',  academyId: 'bar-academy',       domain: 'fb',       requiresBeverageContext: true, keywords: ['cocktail', 'bartender', 'bar', 'spirit', 'pour', 'batch', 'garnish', 'shake', 'stir', 'mixolog', 'consisten', 'execution', 'dilution', 'technique'] },
  { key: 'wineKnowledge',      label: 'Wine Knowledge',      academyId: 'wine-academy',      domain: 'fb',       keywords: ['wine', 'pairing', 'sommelier', 'grape', 'vintage', 'tasting', 'cellar', 'decant'] },
  { key: 'upselling',          label: 'Upselling',           academyId: 'service-academy',   domain: 'service',  keywords: ['upsell', 'upselling', 'suggest', 'recommend', 'check average', 'add-on', 'premium pour', 'revenue per', 'spend'] },
  { key: 'guestExperience',    label: 'Guest Experience',    academyId: 'service-academy',   domain: 'service',  keywords: ['guest', 'experience', 'hospitality', 'welcome', 'warmth', 'attentive', 'care', 'feeling'] },
  { key: 'serviceConsistency', label: 'Service Consistency', academyId: 'service-academy',   domain: 'service',  keywords: ['service', 'consisten', 'standard', 'sequence', 'pace', 'floor', 'complaint', 'recovery', 'execut'] },
  { key: 'leadership',         label: 'Leadership',          academyId: 'manager-academy',   domain: 'owner',    keywords: ['leadership', 'manager', 'briefing', 'control', 'accountab', 'supervis', 'capacity', 'coordination', 'outlet'] },
  { key: 'trainingDiscipline', label: 'Training Discipline', academyId: 'train-the-trainer', domain: 'training', keywords: ['train', 'onboard', 'retention', 'knowledge', 'forget', 'teach', 'coach', 'turnover', 'hire', 'new staff'] }
]

// Words that signal a genuine cocktail/bar operation. Note: deliberately narrow —
// "drinks", "beers", "house wine" do NOT qualify a venue as cocktail-led.
const COCKTAIL_SIGNAL_TERMS = ['cocktail', 'bartender', 'mixolog', 'spirit', 'speakeasy', 'craft']
// Venue types that are inherently beverage/cocktail-led.
const BEVERAGE_LED_TYPE = /\b(bar|cocktail|lounge|pub|tavern|night ?club|speakeasy|distiller|brewery|wine bar|taproom)\b/i

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

// Choose the single most relevant existing lesson for a capability gap by scoring
// each lesson title against the capability keywords + the actual gap phrase. Never
// invents a lesson; returns null when nothing scores, so the consumer recommends
// the academy/category without naming a poor-fit lesson.
function pickRelevantLesson(academy, def, note) {
  const lessons = Array.isArray(academy?.lessons) ? academy.lessons : []
  if (!lessons.length) return null
  const noteTokens = String(note || '').toLowerCase().split(/[^a-z]+/).filter(w => w.length > 3)
  const terms = Array.from(new Set([...def.keywords, ...noteTokens]))
  let best = null, bestScore = 0
  for (const lesson of lessons) {
    const title = String(lesson.title || '').toLowerCase()
    let score = 0
    for (const term of terms) if (term.length > 2 && title.includes(term)) score++
    if (score > bestScore) { bestScore = score; best = lesson }
  }
  return bestScore > 0 ? best : null
}

/**
 * Build the academy capability context from bridge briefs + the academy manifest.
 *
 * @param {object}   input
 * @param {object[]} input.briefs     - bridge briefs (fb/training/service/owner/event)
 * @param {object[]} input.academies  - UNIVERSITY_MANIFEST (existing lessons)
 * @returns {{ active:boolean, capabilitySignals:object[], recommendations:object[] }}
 */
export function buildAcademyContext({ briefs = [], academies = [], venueType = '' } = {}) {
  const byType = {}
  for (const b of Array.isArray(briefs) ? briefs : []) if (b && b.type) byType[b.type] = b

  const confByDomain = {
    fb:       clampPct(byType.fb?.confidence),
    service:  clampPct(byType.service?.confidence),
    training: clampPct(byType.training?.confidence),
    owner:    clampPct(byType.owner?.confidence)
  }

  // Does this venue genuinely run a cocktail/bar operation? Beverage-led venue
  // type OR explicit cocktail/bar/spirit signals in the briefs. Used to gate
  // capabilities flagged requiresBeverageContext so non-bar venues are never
  // routed into cocktail technique lessons.
  const bevHaystack = [
    venueType,
    ...clean(byType.fb?.signals),
    ...clean(byType.service?.signals),
    ...clean(byType.training?.signals)
  ].join(' ').toLowerCase()
  const hasCocktailContext = BEVERAGE_LED_TYPE.test(venueType || '') ||
    COCKTAIL_SIGNAL_TERMS.some(t => bevHaystack.includes(t))

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
    // Beverage-gated capabilities (cocktail execution) stay 'unknown' for venues
    // that do not actually run a cocktail/bar operation — no misrouted lessons.
    if (def.requiresBeverageContext && !hasCocktailContext) {
      return { key: def.key, label: def.label, academyId: def.academyId, status: 'unknown', confidence: confByDomain[def.domain] || 0, note: 'Not applicable — no cocktail/bar operation signal for this venue.', severity: 0 }
    }

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
      const def = CAPABILITY_DEFS.find(d => d.key === c.key)
      // Choose the lesson that actually fits the gap, not always the first one.
      const lesson = pickRelevantLesson(academy, def || { keywords: [] }, c.note)
      return {
        priority: i + 1,
        area: c.label,
        status: c.status,
        academyId: c.academyId,
        academyTitle: academy?.title || c.label,
        lessonId: lesson?.id || null,
        lessonTitle: lesson?.title || null,
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
