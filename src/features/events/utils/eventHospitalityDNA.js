/**
 * Event Hospitality DNA — cross-cutting experience identity for an event.
 * Derives the hospitality character, service philosophy, guest experience archetype,
 * and care priorities from actual event data only.
 * Pure and deterministic. No AI calls. No invented defaults. All fields null-safe.
 */

// ── Experience archetypes ──────────────────────────────────────────────────────

const EXPERIENCE_ARCHETYPE = {
  wedding: {
    archetype:               'Celebration & Ceremony',
    philosophy:              'Every guest is a witness to a milestone. Service is invisible but precise — the event carries the emotion; hospitality holds the structure.',
    pace:                    'Ceremonial',
    firstImpressionProtocol: 'Welcome drink must be in hand before the first guest crosses the threshold.',
    guestCarePriority:       'VIP table attention, elderly accessibility, dietary compliance across a wide guest range, and children if present.',
    occasionTone:            'celebratory',
  },
  corporate: {
    archetype:               'Professional Gathering',
    philosophy:              'Hospitality serves the business objective — networking is the product. Service is confident, clean, and friction-free.',
    pace:                    'Networked',
    firstImpressionProtocol: 'Arrival drinks or canapés must be circulating before the first guests arrive. No dead time at the door.',
    guestCarePriority:       'Dietary compliance for workplace inclusion. No slow-build cocktails during peak networking. Moderate alcohol register.',
    occasionTone:            'professional',
  },
  bar_event: {
    archetype:               'Bar as the Experience',
    philosophy:              'The bar is the stage. Bartenders are performers. Every drink is the product — speed, identity, and showmanship are the service pillars.',
    pace:                    'High-Energy',
    firstImpressionProtocol: 'Bar fully operational and staffed before doors open. First drink moment sets the tone for the night.',
    guestCarePriority:       'Fast service throughput, standing guest comfort, intoxication awareness, and zero-proof options visible.',
    occasionTone:            'social',
  },
  private: {
    archetype:               'Intimate Gathering',
    philosophy:              'The host is the curator. Hospitality defers to personal taste — high personalization, low formality, warm presence.',
    pace:                    'Relaxed',
    firstImpressionProtocol: 'Welcome drink tailored to host preference. Know the host by name before the event begins.',
    guestCarePriority:       'Host preference above all. Dietary compliance for a known, close guest group. Unhurried service flow.',
    occasionTone:            'social',
  },
  other: {
    archetype:               'General Event',
    philosophy:              'Crowd-pleasing, approachable, and smooth. When in doubt, be warm and proactive.',
    pace:                    'Standard',
    firstImpressionProtocol: 'Drinks and welcome ready on arrival.',
    guestCarePriority:       'Dietary compliance and general flow management.',
    occasionTone:            'mixed',
  },
}

// ── Scale persona ──────────────────────────────────────────────────────────────

function deriveScalePersona(guestCount) {
  if (!guestCount) return {
    scale:            'unknown',
    persona:          'Guest count not set — staffing and flow planning cannot begin.',
    logisticalSignal: null,
  }
  if (guestCount < 30) return {
    scale:            'micro',
    persona:          'Micro-event. Every interaction is visible. Staff presence and personality matter as much as technique.',
    logisticalSignal: 'Single bar, single station. Over-staffing is counterproductive.',
  }
  if (guestCount < 60) return {
    scale:            'intimate',
    persona:          'Intimate scale. Staff can learn most guest names. Personalised service is achievable with a small, focused team.',
    logisticalSignal: 'One main bar. One welcome station. Standard runner capacity.',
  }
  if (guestCount < 120) return {
    scale:            'medium',
    persona:          'Medium event. Flow management begins to matter. Section load must be monitored actively.',
    logisticalSignal: 'Two service zones minimum. Welcome station separate from main bar. Stagger service waves.',
  }
  if (guestCount < 200) return {
    scale:            'large',
    persona:          'Large event. Arrival pressure is the primary hospitality risk. The first 45 minutes define the guest experience.',
    logisticalSignal: 'Multiple bar points. Dedicated arrival management. Pre-batch wherever the menu allows.',
  }
  return {
    scale:            'grand',
    persona:          'Grand-scale event. Logistics dominate service quality. System compliance and pre-shift briefing are the hospitality tools.',
    logisticalSignal: 'Command-level coordination required. Split bar operations. Dedicated arrival and departure management protocols.',
  }
}

// ── Guest profile signals ──────────────────────────────────────────────────────

function deriveGuestSignals(event, guests) {
  const flags = {
    hasVIP:           false,
    hasAccessibility: false,
    hasCelebration:   false,
    hasKosher:        false,
    hasDietary:       false,
    confirmedCount:   0,
    unconfirmedCount: 0,
  }

  if (!Array.isArray(guests) || guests.length === 0) {
    return { signals: ['No guest data — guest profile intelligence unavailable.'], flags }
  }

  const signals = []

  flags.confirmedCount   = guests.filter(g => g.rsvp_status === 'confirmed').length
  flags.unconfirmedCount = guests.filter(g => g.rsvp_status !== 'confirmed').length

  if (guests.some(g => g.vip)) {
    flags.hasVIP = true
    signals.push('VIP guests present — elevate attention and notify management on arrival.')
  }

  if (guests.some(g => g.accessibility_notes || g.wheelchair || g.accessibility)) {
    flags.hasAccessibility = true
    signals.push('Accessibility requirements noted — verify seating, path clearance, and staff briefing before guests arrive.')
  }

  const kosherInEvent = (event.notes || '').toLowerCase().includes('kosher')
  const kosherInGuests = guests.some(g => (g.dietary || '').toLowerCase().includes('kosher'))
  if (kosherInEvent || kosherInGuests) {
    flags.hasKosher = true
    signals.push('Kosher requirement — kitchen and bar compliance must be verified before service begins.')
  }

  const dietaryGuests = guests.filter(g => (g.dietary || '').trim())
  if (dietaryGuests.length > 0) {
    flags.hasDietary = true
    signals.push(
      `${dietaryGuests.length} guest${dietaryGuests.length > 1 ? 's' : ''} with dietary requirements — kitchen must confirm all are addressed.`
    )
  }

  const notesLower = (event.notes || '').toLowerCase()
  if (notesLower.includes('birthday') || notesLower.includes('anniversary') || notesLower.includes('celebration')) {
    flags.hasCelebration = true
    signals.push('Celebration occasion detected — prepare signature welcome touch (note, candle coordination, or greeting) as appropriate.')
  }

  if (flags.unconfirmedCount > 0) {
    signals.push(
      `${flags.unconfirmedCount} guest${flags.unconfirmedCount > 1 ? 's' : ''} not yet confirmed — RSVP gap affects final count accuracy.`
    )
  }

  return { signals, flags }
}

// ── Service pace profile ───────────────────────────────────────────────────────

function deriveServicePace(event, archetype) {
  let durationHours = null

  if (event.start_time && event.end_time) {
    try {
      const [sh, sm] = event.start_time.split(':').map(Number)
      const [eh, em] = event.end_time.split(':').map(Number)
      const diff = (eh * 60 + em) - (sh * 60 + sm)
      if (diff > 0) durationHours = Math.round((diff / 60) * 10) / 10
    } catch { /* skip */ }
  }

  const pressurePoints = []
  if (event.start_time) pressurePoints.push(`Arrival wave at ${event.start_time} — welcome drinks must precede guest flow.`)
  if (durationHours !== null && durationHours > 5) pressurePoints.push('Long-duration event — energy management and service pacing critical to avoid mid-event fatigue.')
  if (durationHours !== null && durationHours < 2) pressurePoints.push('Short event window — every service moment counts. No recovery time for errors.')
  if (!event.start_time) pressurePoints.push('Start time not set — service pace and arrival management cannot be planned.')

  return {
    paceLabel:     archetype.pace,
    durationHours,
    hasFullWindow: !!(event.start_time && event.end_time),
    pressurePoints,
  }
}

// ── Main export ────────────────────────────────────────────────────────────────

export function buildHospitalityDNA({ event, guests }) {
  if (!event) return null

  const g        = Array.isArray(guests) ? guests : []
  const type     = event.event_type || 'other'
  const archetype = EXPERIENCE_ARCHETYPE[type] || EXPERIENCE_ARCHETYPE.other

  const scalePersona               = deriveScalePersona(event.expected_guests || null)
  const { signals, flags }         = deriveGuestSignals(event, g)
  const servicePace                = deriveServicePace(event, archetype)

  return {
    experienceArchetype:     archetype.archetype,
    servicePhilosophy:       archetype.philosophy,
    occasionTone:            archetype.occasionTone,
    firstImpressionProtocol: archetype.firstImpressionProtocol,
    guestCarePriority:       archetype.guestCarePriority,
    scalePersona: {
      scale:            scalePersona.scale,
      persona:          scalePersona.persona,
      logisticalSignal: scalePersona.logisticalSignal,
    },
    servicePace: {
      paceLabel:      servicePace.paceLabel,
      durationHours:  servicePace.durationHours,
      hasFullWindow:  servicePace.hasFullWindow,
      pressurePoints: servicePace.pressurePoints,
    },
    guestProfile: {
      confirmedCount:   flags.confirmedCount,
      unconfirmedCount: flags.unconfirmedCount,
      hasVIP:           flags.hasVIP,
      hasAccessibility: flags.hasAccessibility,
      hasCelebration:   flags.hasCelebration,
      hasKosher:        flags.hasKosher,
      hasDietary:       flags.hasDietary,
      activeSignals:    signals,
    },
  }
}
