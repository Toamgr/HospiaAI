// Owner Intelligence Service — "What HESTIA Learned".
//
// Phase 6 — turns the full venue intelligence picture (Venue DNA, bridge briefs,
// operational signals + enrichment, academy capability context) into a short,
// advisor-grade narrative for the owner. Reads like a senior operator's note, not
// an analytics dashboard.
//
// Honesty rules:
//   - No invented percentages, KPIs, or fabricated trends.
//   - Every learning traces to a real signal, note, tension, or capability gap.
//   - Present-state, grounded phrasing — never "increased/declined" without
//     evidence we actually hold.
//
// Pure and deterministic. Safe to import from server.js and the frontend.

const GAIN_HEADLINE = {
  operations: 'Operational grip is strengthening',
  training: 'Training engagement is building capability',
  commercial: 'Commercial momentum is on record',
  guest: 'Guest experience is improving',
  identity: 'Venue identity is clarifying'
}
const CONCERN_HEADLINE = {
  operations: 'Execution discipline needs attention',
  guest: 'Guest experience needs protection',
  training: 'Capability development is lagging',
  commercial: 'Commercial signal is thin'
}
const DIM_LABEL = {
  operations: 'Operations', guest: 'Guest', training: 'Training', commercial: 'Commercial', identity: 'Identity'
}

function dedupePush(list, learning) {
  if (!learning?.headline) return
  if (list.some(l => l.headline === learning.headline)) return
  list.push(learning)
}

/**
 * @param {object} input
 * @param {object}   input.venueDNA
 * @param {object[]} input.briefs           - bridge briefs
 * @param {object}   input.signals          - operational signals
 * @param {object}   input.enrichment       - DNA enrichment (notes, tensions, deltas)
 * @param {object}   input.academyContext   - { capabilitySignals, recommendations }
 * @returns {{ active:boolean, headline:string, learnings:object[] }}
 */
export function buildOwnerLearnings({ venueDNA = {}, briefs = [], signals = {}, enrichment = {}, academyContext = {} } = {}) {
  const byType = {}
  for (const b of Array.isArray(briefs) ? briefs : []) if (b && b.type) byType[b.type] = b

  const learnings = []
  const notes = Array.isArray(enrichment.notes) ? enrichment.notes : []
  const tensions = Array.isArray(enrichment.tensions) ? enrichment.tensions : []

  // 1. Gains — operations corroborating, training building, commercial momentum.
  for (const note of notes.filter(n => n.direction === 'up')) {
    dedupePush(learnings, {
      headline: GAIN_HEADLINE[note.dimension] || 'Progress on record',
      detail: note.text,
      source: DIM_LABEL[note.dimension] || 'Operations',
      tone: 'gain'
    })
  }

  // 2. Tensions — an owner priority that operations are not yet reflecting.
  for (const t of tensions) {
    dedupePush(learnings, {
      headline: "A stated priority isn't landing yet",
      detail: t.text,
      source: 'Owner × Operations',
      tone: 'watch'
    })
  }

  // 3. Concerns — operational evidence pulling a dimension down.
  for (const note of notes.filter(n => n.direction === 'down')) {
    dedupePush(learnings, {
      headline: CONCERN_HEADLINE[note.dimension] || 'A dimension needs attention',
      detail: note.text,
      source: DIM_LABEL[note.dimension] || 'Operations',
      tone: 'concern'
    })
  }

  // 4. Capability gaps — what the team should build next (from academy context).
  const gapSignals = (academyContext.capabilitySignals || []).filter(c => c.status === 'gap')
  for (const cap of gapSignals.slice(0, 2)) {
    dedupePush(learnings, {
      headline: `${cap.label} remains a gap`,
      detail: cap.note,
      source: 'Capability',
      tone: 'gap'
    })
  }

  // 5. Opportunities — real event pipeline and commercial openings.
  if (signals.events?.upcoming > 0) {
    dedupePush(learnings, {
      headline: 'Event beverage opportunities are open',
      detail: `${signals.events.upcoming} upcoming event(s) in the pipeline — a chance to plan beverage and staffing ahead.`,
      source: 'Events',
      tone: 'opportunity'
    })
  }
  const commercialOpps = [...(byType.fb?.opportunities || []), ...(byType.owner?.opportunities || [])]
  if (commercialOpps.length) {
    dedupePush(learnings, {
      headline: 'A commercial opportunity is in view',
      detail: commercialOpps[0],
      source: 'Commercial',
      tone: 'opportunity'
    })
  }

  const ordered = ['gain', 'watch', 'concern', 'gap', 'opportunity']
  learnings.sort((a, b) => ordered.indexOf(a.tone) - ordered.indexOf(b.tone))
  const top = learnings.slice(0, 6)

  const headline = byType.owner?.headline || venueDNA.summary || ''

  return { active: top.length > 0, headline, learnings: top }
}
