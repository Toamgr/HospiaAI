// Venue DNA — the evolving understanding HESTIA builds of a venue through conversation.
// This module defines the canonical client-side shape and the display metadata used by
// the Venue Understanding panel. It holds no fabricated data — only structure.

export function emptyVenueDna() {
  return {
    hospitalityStyle: [],
    businessTypeSignals: [],
    guestExperienceSignals: [],
    beverageSignals: [],
    foodSignals: [],
    serviceSignals: [],
    trainingSignals: [],
    operationalPainPoints: [],
    ownerPriorities: [],
    emotionalDrivers: [],
    growthOpportunities: [],
    confidence: { identity: 0, operations: 0, guest: 0, training: 0, commercial: 0 },
    summary: '',
    openQuestions: []
  }
}

// The signal groups shown in the Venue Understanding panel, in display order.
// `key` maps to a venueDNA array; `label` is the editorial section heading.
export const SIGNAL_GROUPS = [
  { key: 'hospitalityStyle',       label: 'Hospitality style' },
  { key: 'businessTypeSignals',    label: 'Business type' },
  { key: 'ownerPriorities',        label: 'Owner priorities' },
  { key: 'emotionalDrivers',       label: 'Emotional drivers' },
  { key: 'guestExperienceSignals', label: 'Guest experience' },
  { key: 'serviceSignals',         label: 'Service' },
  { key: 'beverageSignals',        label: 'Beverage' },
  { key: 'foodSignals',            label: 'Food' },
  { key: 'trainingSignals',        label: 'Training & people' },
  { key: 'operationalPainPoints',  label: 'Pressure points' },
  { key: 'growthOpportunities',    label: 'Opportunities' }
]

export const CONFIDENCE_DIMENSIONS = [
  { key: 'identity',   label: 'Identity' },
  { key: 'operations', label: 'Operations' },
  { key: 'guest',      label: 'Guest' },
  { key: 'training',   label: 'Training' },
  { key: 'commercial', label: 'Commercial' }
]

// The four-layer conversation model — used for the stage indicator.
export const STAGES = [
  { key: 'story',      label: 'Story',      blurb: 'The soul of the place' },
  { key: 'identity',   label: 'Identity',   blurb: 'Who the venue is' },
  { key: 'operations', label: 'Operations', blurb: 'Where it feels heavy' },
  { key: 'discovery',  label: 'Discovery',  blurb: 'What intelligence it needs' }
]

// True once HESTIA has detected at least one real signal — gates the panel's
// empty state from its populated state.
export function hasAnySignal(venueDNA) {
  if (!venueDNA) return false
  return SIGNAL_GROUPS.some(g => Array.isArray(venueDNA[g.key]) && venueDNA[g.key].length > 0)
}
