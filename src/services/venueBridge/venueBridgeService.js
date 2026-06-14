// Venue Intelligence Bridge — deterministic distribution layer.
//
// Transforms Venue DNA (produced by the Venue Learning Engine) into a set of
// specialist briefs that downstream HESTIA systems can consume. This module is
// PURE and DETERMINISTIC: it restructures and routes the understanding HESTIA
// already holds. It never invents facts, prices, KPIs, or prescriptive advice
// the conversation did not surface. When there is no signal for a team, the
// brief is honestly marked `insufficient_signal` rather than padded.
//
// No browser or Node-only APIs — safe to import from server.js and the frontend.

export const BRIEF_TYPES = ['fb', 'training', 'service', 'event', 'owner']

// Human framing for each specialist brief.
const BRIEF_META = {
  fb:       { title: 'Omer — F&B & Beverage Brief', team: 'F&B / Beverage Direction', audience: ['bar_manager', 'fb_director', 'owner', 'admin'] },
  training: { title: 'Training Brief',              team: 'People & Training',          audience: ['fb_director', 'bar_manager', 'manager', 'owner', 'admin'] },
  service:  { title: 'Service Brief',               team: 'Floor & Service',            audience: ['manager', 'fb_director', 'owner', 'admin'] },
  event:    { title: 'Event Brief',                 team: 'Events',                     audience: ['events_manager', 'manager', 'owner', 'admin'] },
  owner:    { title: 'Owner Strategic Brief',       team: 'Ownership',                  audience: ['owner', 'admin'] }
}

// Keyword routing — used to pull cross-cutting items (pain points, opportunities,
// open questions) into the briefs they actually concern.
const DOMAIN_KEYWORDS = {
  fb:       ['menu', 'beverage', 'cocktail', 'wine', 'drink', 'bar', 'food', 'kitchen', 'pour', 'cost', 'margin', 'price', 'pricing', 'spirit', 'pairing', 'dish', 'chef', 'recipe'],
  training: ['train', 'onboard', 'staff', 'team', 'skill', 'knowledge', 'retention', 'learn', 'teach', 'coach', 'turnover', 'hire', 'consisten', 'execut'],
  service:  ['service', 'guest', 'hospitality', 'experience', 'floor', 'wait', 'host', 'complaint', 'recovery', 'attentive', 'pace', 'standard', 'consisten'],
  event:    ['event', 'party', 'wedding', 'private', 'group', 'booking', 'function', 'celebration', 'corporate', 'reservation', 'banquet']
}

function arr(v) { return Array.isArray(v) ? v.filter(x => typeof x === 'string' && x.trim()) : [] }
function uniq(list) { return Array.from(new Set(list.map(s => s.trim()).filter(Boolean))) }
function matches(item, keywords) {
  const lower = String(item).toLowerCase()
  return keywords.some(k => lower.includes(k))
}
function clampPct(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(100, Math.round(v)))
}
function avg(nums) {
  const valid = nums.map(Number).filter(Number.isFinite)
  if (!valid.length) return 0
  return clampPct(valid.reduce((a, b) => a + b, 0) / valid.length)
}

// Small, stable, dependency-free string hash (djb2). Lets callers detect whether
// the source Venue DNA changed without storing the whole object twice.
export function hashVenueDna(venueDNA) {
  const str = JSON.stringify(venueDNA || {})
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
  return (h >>> 0).toString(16)
}

// Deterministic one-line synthesis of a brief — reads like a senior operator's
// note, not a count of items. Built only from the real top signal / priority /
// opportunity already routed to this brief; invents nothing.
const TEAM_LEAD = {
  fb:       'Beverage & F&B direction',
  training: 'People & training',
  service:  'Floor & service',
  event:    'Events',
  owner:    'Ownership'
}
function synthesizeHeadline(type, signals, priorities, opportunities) {
  const lead = TEAM_LEAD[type] || 'This area'
  const s = signals[0], p = priorities[0], o = opportunities[0]
  const parts = []
  if (s) {
    parts.push(`${lead} centers on ${s}`)
    if (p) parts.push(`the main risk to manage is ${p}`)
  } else if (p) {
    parts.push(`${lead} priority is ${p}`)
  }
  if (o && parts.length < 3) parts.push(`the clearest opening is ${o}`)
  if (!parts.length) parts.push(`${lead} signal is still forming`)
  const line = parts.join('; ')
  return line.charAt(0).toUpperCase() + line.slice(1) + '.'
}

function assembleBrief(type, { signals, priorities, opportunities, openQuestions, confidence, summary }) {
  const meta = BRIEF_META[type]
  const cleanSignals = uniq(signals)
  const cleanPriorities = uniq(priorities)
  const cleanOpportunities = uniq(opportunities)
  const cleanQuestions = uniq(openQuestions)

  const substance = cleanSignals.length + cleanPriorities.length + cleanOpportunities.length
  const status = substance > 0 ? 'ready' : 'insufficient_signal'

  let headline
  if (status === 'insufficient_signal') {
    headline = `Not enough signal yet — continue the venue conversation to brief ${meta.team}.`
  } else if (summary && type === 'owner') {
    headline = summary
  } else {
    headline = synthesizeHeadline(type, cleanSignals, cleanPriorities, cleanOpportunities)
  }

  return {
    type,
    title: meta.title,
    team: meta.team,
    audience: meta.audience,
    status,
    confidence: clampPct(confidence),
    headline,
    signals: cleanSignals.slice(0, 12),
    priorities: cleanPriorities.slice(0, 8),
    opportunities: cleanOpportunities.slice(0, 8),
    openQuestions: cleanQuestions.slice(0, 8)
  }
}

/**
 * Build the full set of specialist briefs from Venue DNA + context.
 *
 * @param {object} input
 * @param {object} input.venueDNA            - the evolving Venue DNA object
 * @param {object} [input.metadata]          - { venueName, venueType, stage, objective }
 * @param {object} [input.barDNA]            - existing Cocktail/Bar DNA row (optional)
 * @param {object} [input.operationalMemory] - { memoryEventCount, recentEvents } (optional)
 * @returns {{ generatedAt: string, sourceHash: string, sourceConfidence: object, briefs: object[] }}
 */
export function buildVenueBriefs(input = {}) {
  const dna = input.venueDNA || {}
  const conf = dna.confidence || {}
  const metadata = input.metadata || {}
  const barDNA = input.barDNA || null
  const opMemory = input.operationalMemory || {}

  const painPoints = arr(dna.operationalPainPoints)
  const growth = arr(dna.growthOpportunities)
  const questions = arr(dna.openQuestions)

  const route = (list, domain) => list.filter(item => matches(item, DOMAIN_KEYWORDS[domain]))

  // ── F&B / Beverage (Omer) ────────────────────────────────────────────────
  const fbSignals = [...arr(dna.beverageSignals), ...arr(dna.foodSignals)]
  if (barDNA?.hero_ingredient) fbSignals.push(`Hero ingredient on record: ${barDNA.hero_ingredient}`)
  if (barDNA?.signature_style) fbSignals.push(`Signature style on record: ${barDNA.signature_style}`)
  const fbBrief = assembleBrief('fb', {
    signals: fbSignals,
    priorities: route(painPoints, 'fb'),
    opportunities: route(growth, 'fb'),
    openQuestions: route(questions, 'fb'),
    confidence: avg([conf.commercial, conf.identity])
  })

  // ── Training & People ────────────────────────────────────────────────────
  const trainingBrief = assembleBrief('training', {
    signals: [...arr(dna.trainingSignals), ...arr(dna.serviceSignals).filter(s => matches(s, DOMAIN_KEYWORDS.training))],
    priorities: route(painPoints, 'training'),
    opportunities: route(growth, 'training'),
    openQuestions: route(questions, 'training'),
    confidence: clampPct(conf.training)
  })

  // ── Service & Floor ──────────────────────────────────────────────────────
  const serviceBrief = assembleBrief('service', {
    signals: [...arr(dna.serviceSignals), ...arr(dna.guestExperienceSignals), ...arr(dna.hospitalityStyle)],
    priorities: route(painPoints, 'service'),
    opportunities: route(growth, 'service'),
    openQuestions: route(questions, 'service'),
    confidence: avg([conf.guest, conf.operations])
  })

  // ── Events ───────────────────────────────────────────────────────────────
  const eventBrief = assembleBrief('event', {
    signals: [
      ...arr(dna.businessTypeSignals).filter(s => matches(s, DOMAIN_KEYWORDS.event)),
      ...arr(dna.guestExperienceSignals).filter(s => matches(s, DOMAIN_KEYWORDS.event))
    ],
    priorities: route(painPoints, 'event'),
    opportunities: route(growth, 'event'),
    openQuestions: route(questions, 'event'),
    confidence: avg([conf.identity, conf.commercial])
  })

  // ── Owner Strategic (catch-all) ──────────────────────────────────────────
  // Items that did not route to any specialist still surface to ownership.
  const allDomains = ['fb', 'training', 'service', 'event']
  const unrouted = (list) => list.filter(item => !allDomains.some(d => matches(item, DOMAIN_KEYWORDS[d])))
  const ownerSignals = [...arr(dna.ownerPriorities), ...arr(dna.emotionalDrivers), ...arr(dna.businessTypeSignals)]
  if (opMemory.memoryEventCount) ownerSignals.push(`${opMemory.memoryEventCount} operational memory event(s) on record`)
  const ownerBrief = assembleBrief('owner', {
    signals: ownerSignals,
    priorities: [...painPoints],
    opportunities: [...growth],
    openQuestions: [...unrouted(questions)],
    confidence: avg([conf.identity, conf.operations, conf.guest, conf.training, conf.commercial]),
    summary: dna.summary
  })

  return {
    generatedAt: new Date().toISOString(),
    sourceHash: hashVenueDna(dna),
    sourceConfidence: {
      identity: clampPct(conf.identity),
      operations: clampPct(conf.operations),
      guest: clampPct(conf.guest),
      training: clampPct(conf.training),
      commercial: clampPct(conf.commercial)
    },
    metadata: {
      venueName: metadata.venueName || null,
      venueType: metadata.venueType || null,
      stage: metadata.stage || null,
      objective: metadata.objective || null
    },
    briefs: [fbBrief, trainingBrief, serviceBrief, eventBrief, ownerBrief]
  }
}
