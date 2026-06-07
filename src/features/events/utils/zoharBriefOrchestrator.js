/**
 * Zohar Brief Orchestrator — deterministic event brief generator.
 * Derives department briefs from real event data only.
 * No AI calls. No demo data imports. No invented fallbacks.
 * All fields are null-safe: returns null for missing inputs rather than inventing data.
 */

const SERVICE_STYLE = {
  wedding:   'Luxury Plated',
  corporate: 'Standing / Canapés',
  private:   'Seated Dinner',
  bar_event: 'Cocktail Reception',
  other:     'Standard Service',
}

const EVENT_TYPE_LABELS = {
  wedding:   'Wedding',
  corporate: 'Corporate Event',
  private:   'Private Party',
  bar_event: 'Bar Event',
  other:     'Special Event',
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function daysUntil(dateStr) {
  if (!dateStr) return null
  try {
    return Math.ceil((new Date(dateStr + 'T12:00:00') - new Date()) / 86400000)
  } catch { return null }
}

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch { return dateStr }
}

function buildDietarySummary(guests) {
  if (!Array.isArray(guests) || guests.length === 0) return null
  const counts = {}
  for (const g of guests) {
    const d = (g.dietary || '').trim()
    if (!d) continue
    counts[d] = (counts[d] || 0) + 1
  }
  const entries = Object.entries(counts)
  if (entries.length === 0) return null
  return entries.map(([k, v]) => `${k} × ${v}`).join(', ')
}

function detectKosher(event, guests) {
  if ((event.notes || '').toLowerCase().includes('kosher')) return true
  if (Array.isArray(guests)) {
    return guests.some(g => (g.dietary || '').toLowerCase().includes('kosher'))
  }
  return false
}

// ── Readiness ────────────────────────────────────────────────────────────────

function computeReadiness(event, guests, tables, tasks, timeline) {
  let score = 0
  const confirmedGuests = guests.filter(g => g.rsvp_status === 'confirmed')
  const expected = event.expected_guests || 0
  const pendingTasks = tasks.filter(t => t.status !== 'done')

  if (expected) score += 15
  if (guests.length > 0) score += 10
  if (expected > 0 && confirmedGuests.length >= expected * 0.5) score += 10
  if (tables.length > 0) score += 10

  const seatedConfirmed = guests.filter(g => g.table_id && g.rsvp_status === 'confirmed').length
  if (confirmedGuests.length > 0 && seatedConfirmed / confirmedGuests.length >= 0.8) score += 15

  if (tasks.length > 0) score += 5
  if (tasks.length > 0 && pendingTasks.length <= 2) score += 10
  if (event.start_time) score += 10
  if (timeline.length > 0) score += 10
  if (['confirmed', 'in_preparation', 'ready'].includes(event.status)) score += 5

  return Math.min(100, score)
}

function toReadinessLabel(score) {
  if (score >= 75) return 'Ready'
  if (score >= 40) return 'In Progress'
  return 'Not Ready'
}

// ── Missing inputs ────────────────────────────────────────────────────────────

function buildMissingInputs(event, guests, tables, tasks) {
  const missing = []
  const confirmedGuests = guests.filter(g => g.rsvp_status === 'confirmed')
  const pendingTasks = tasks.filter(t => t.status !== 'done')

  if (!event.expected_guests) missing.push('Set expected guest count')
  if (guests.length === 0) missing.push('Add or import guests')
  if (guests.length > 0 && tables.length === 0) missing.push('Create seating tables')

  if (tables.length > 0) {
    const unseatedConfirmed = confirmedGuests.filter(g => !g.table_id).length
    if (unseatedConfirmed > 0) {
      missing.push(`Assign ${unseatedConfirmed} confirmed guest${unseatedConfirmed > 1 ? 's' : ''} to tables`)
    }
  }

  if (!event.start_time) missing.push('Set event start time')
  if (tasks.length > 0 && pendingTasks.length > 3) missing.push(`${pendingTasks.length} tasks still pending`)

  return missing
}

// ── Cocktail brief ────────────────────────────────────────────────────────────

function buildCocktailBrief(event, guests) {
  const type = event.event_type || 'other'
  const guestCount = event.expected_guests || null
  const kosher = detectKosher(event, guests)
  const dietarySummary = buildDietarySummary(guests)
  const notes = event.notes || null
  const serviceStyle = SERVICE_STYLE[type] || SERVICE_STYLE.other
  const typeLabel = EVENT_TYPE_LABELS[type] || 'Event'

  const moodMap = {
    wedding:   'Festive, celebratory, photogenic, crowd-pleasing. Wide guest range from 20s to 70s. Welcome drink is essential.',
    corporate: 'Clean, elegant, professional. Networking-friendly — avoid messy garnishes or overly strong pours. Brand-safe presentation.',
    bar_event: 'Bar is the operational center. Cocktail identity is paramount. High service speed. Standing zones. Bartender visibility matters.',
    private:   "Intimate, tailored to the host's taste. Fewer guests — higher personalization. Welcome drink strongly recommended.",
    other:     'Mixed audience. Crowd-pleasing and approachable.',
  }

  const speedMap = {
    wedding:   'Standard plated service timing. Welcome drink must be ready before the first guests arrive.',
    corporate: 'Moderate speed — but no slow builds during networking periods.',
    bar_event: 'High speed — design for fast build times, batch pre-mixes if possible.',
    private:   'Standard service timing.',
    other:     'Standard service timing.',
  }

  const alcoholMap = {
    corporate: 'Moderate (2–3 units max)',
    bar_event: 'Full range',
    wedding:   'Standard hospitality range',
    private:   'Standard hospitality range',
    other:     'Standard hospitality range',
  }

  const welcomeMap = {
    wedding:   'Welcome drink required — must be ready before guest arrival.',
    bar_event: 'Welcome drink or first-pour station at entrance strongly recommended.',
    corporate: 'Opening drinks or canapé-paired cocktail recommended for arrival.',
    private:   'Welcome drink recommended.',
    other:     'Opening drink optional.',
  }

  const barStations = !guestCount
    ? 'Guest count not yet set — bar stations TBD.'
    : guestCount < 60
    ? 'One main bar. One welcome station at entrance.'
    : guestCount <= 120
    ? 'One main bar. One dedicated welcome drinks station. Consider secondary bar if venue layout allows.'
    : 'Main cocktail bar plus minimum one secondary welcome station. Arrival pressure peaks within the first 45 minutes — split load early.'

  const cocktailMood        = moodMap[type]    || moodMap.other
  const speedRequirements   = speedMap[type]   || speedMap.other
  const alcoholIntensity    = alcoholMap[type] || alcoholMap.other
  const welcomeDrinkNeed    = welcomeMap[type] || welcomeMap.other

  const lines = [
    `This is a ${typeLabel}${guestCount ? ` for ${guestCount} guests` : ''}.`,
    `Service style: ${serviceStyle}.`,
    cocktailMood,
    welcomeDrinkNeed,
    `Bar stations: ${barStations}`,
    `Service speed: ${speedRequirements}`,
    `Alcohol level: ${alcoholIntensity}.`,
    kosher ? 'KOSHER requirement detected — verify all spirits and mixers comply.' : '',
    dietarySummary ? `Dietary considerations: ${dietarySummary}.` : '',
    notes ? `Client notes: ${notes}` : '',
  ].filter(Boolean)

  return {
    eventType:                type,
    guestCount,
    serviceStyle,
    cocktailMood,
    menuDirection:            serviceStyle,
    welcomeDrinkNeed,
    barStationsRecommendation: barStations,
    speedRequirements,
    alcoholIntensity,
    kosherRequirement:        kosher,
    audienceNotes:            cocktailMood,
    operationalConstraints:   speedRequirements,
    outputRequestText:        lines.join(' '),
  }
}

// ── Food brief ────────────────────────────────────────────────────────────────

function buildFoodBrief(event, guests) {
  const type = event.event_type || 'other'
  const guestCount = event.expected_guests || null
  const confirmedCount = guests.filter(g => g.rsvp_status === 'confirmed').length
  const kosher = detectKosher(event, guests)
  const dietarySummary = buildDietarySummary(guests)
  const notes = event.notes || null
  const typeLabel = EVENT_TYPE_LABELS[type] || 'Event'

  const formatMap = {
    wedding:   'Luxury plated dinner service',
    corporate: 'Canapés or structured plated service',
    bar_event: 'Finger food — light, service-speed-friendly, nothing that competes with drink service',
    private:   'Seated dinner service',
    other:     'Standard plated or buffet service',
  }

  const moodMap = {
    wedding:   'Celebratory, abundant, polished. Plated luxury. VIP table warrants extra care.',
    corporate: 'Clean, professional presentation. No messy formats.',
    bar_event: 'Bar is primary — food is secondary and finger-friendly.',
    private:   "Host-driven personal taste. Ask events manager for client preferences.",
    other:     'Standard hospitality service.',
  }

  const notesLower = (notes || '').toLowerCase()
  const lateNight = notesLower.includes('late-night') || notesLower.includes('late night')

  const kitchenConstraints = lateNight
    ? 'Late-night food station required. Must operate independently of main dinner service — gap between plated dinner and late-night activation must be avoided.'
    : 'Standard service window. Confirm runner routes do not cross guest arrival or VIP zones.'

  const timingStr = event.start_time && event.end_time
    ? `${event.start_time} – ${event.end_time}`
    : event.start_time
    ? `From ${event.start_time} (end time TBD)`
    : 'Service window not yet set'

  const serviceFormat = formatMap[type] || formatMap.other
  const culinaryMood  = moodMap[type]   || moodMap.other

  const lines = [
    `${typeLabel} for ${guestCount || 'TBD'} guests${confirmedCount > 0 ? ` (${confirmedCount} confirmed)` : ''}.`,
    `Date: ${formatDate(event.event_date) || 'TBD'}.`,
    `Service window: ${timingStr}.`,
    `Format: ${serviceFormat}.`,
    culinaryMood,
    kosher ? 'KOSHER — all ingredients and preparation must comply.' : '',
    dietarySummary ? `Dietary mix: ${dietarySummary}.` : '',
    notes ? `Special notes: ${notes}` : '',
    `Kitchen constraints: ${kitchenConstraints}`,
  ].filter(Boolean)

  return {
    eventType:          type,
    guestCount,
    confirmedCount,
    serviceFormat,
    culinaryMood,
    dietaryNotes:       dietarySummary,
    kosherRequirement:  kosher,
    timing:             timingStr,
    kitchenConstraints,
    outputRequestText:  lines.join(' '),
  }
}

// ── Operations brief ─────────────────────────────────────────────────────────

function buildOperationsBrief(event, guests, tables, tasks, timeline) {
  const confirmedGuests  = guests.filter(g => g.rsvp_status === 'confirmed')
  const seatedConfirmed  = guests.filter(g => g.table_id && g.rsvp_status === 'confirmed').length
  const unseated         = confirmedGuests.length - seatedConfirmed
  const pendingTasks     = tasks.filter(t => t.status !== 'done')
  const doneTasks        = tasks.filter(t => t.status === 'done')
  const days             = daysUntil(event.event_date)
  const kosher           = detectKosher(event, guests)

  const seatingSummary = confirmedGuests.length > 0
    ? `${seatedConfirmed} of ${confirmedGuests.length} confirmed guests assigned to tables.${unseated > 0 ? ` ${unseated} unassigned.` : ' All confirmed guests seated.'}`
    : tables.length > 0
    ? `${tables.length} table${tables.length !== 1 ? 's' : ''} configured. No confirmed guests yet.`
    : 'No seating data yet.'

  const taskSummary = tasks.length > 0
    ? `${pendingTasks.length} task${pendingTasks.length !== 1 ? 's' : ''} pending. ${doneTasks.length} completed.`
    : 'No tasks created yet.'

  const timelineGap = timeline.length > 0
    ? `${timeline.length} activity event${timeline.length !== 1 ? 's' : ''} logged.`
    : 'No activity logged. Timeline is empty.'

  const guestCount = event.expected_guests || 0
  const guestFlowNote = guestCount >= 120
    ? `Large event (${guestCount} guests). Arrival pressure is high. Plan welcome drinks station separate from main bar.`
    : guestCount >= 60
    ? `Medium event (${guestCount} guests). Standard flow management applies.`
    : guestCount > 0
    ? `Compact event (${guestCount} guests). One main bar and welcome station should provide comfortable coverage.`
    : 'Guest count not set — flow planning cannot begin.'

  const criticalRisks = []
  if (unseated > 5) criticalRisks.push(`${unseated} confirmed guests without seating`)
  if (pendingTasks.length > 3 && days !== null && days < 7) {
    criticalRisks.push(`${pendingTasks.length} tasks pending within ${days} day${days !== 1 ? 's' : ''} of event`)
  }
  if (kosher) criticalRisks.push('Kosher requirement detected — confirm with kitchen and bar')
  if (!event.start_time) criticalRisks.push('No start time set — cannot brief staff on timing')

  return {
    guestFlowNote,
    arrivalPressure: guestCount >= 120 ? 'High' : guestCount >= 60 ? 'Moderate' : 'Low',
    seatingSummary,
    taskSummary,
    timelineGap,
    criticalRisks,
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function buildZoharBrief({ event, guests, tables, tasks, timeline }) {
  if (!event) return null

  const g  = Array.isArray(guests)   ? guests   : []
  const tb = Array.isArray(tables)   ? tables   : []
  const tk = Array.isArray(tasks)    ? tasks    : []
  const tl = Array.isArray(timeline) ? timeline : []

  const type = event.event_type || 'other'
  const confirmedGuests = g.filter(gst => gst.rsvp_status === 'confirmed')
  const readiness       = computeReadiness(event, g, tb, tk, tl)

  const cocktailTask = tk.find(t => (t.title || '').startsWith('Build cocktail menu'))
  const barAction = !cocktailTask
    ? 'no-cocktail-task'
    : cocktailTask.status === 'done'
    ? 'cocktail-menu-approved'
    : 'cocktail-menu-task-exists'

  return {
    eventId:         event.id,
    eventName:       event.name || 'Untitled Event',
    eventType:       type,
    eventTypeLabel:  EVENT_TYPE_LABELS[type] || 'Event',
    readinessScore:  readiness,
    readinessLabel:  toReadinessLabel(readiness),
    daysUntil:       daysUntil(event.event_date),
    missingInputs:   buildMissingInputs(event, g, tb, tk),
    masterBrief: {
      scale: !event.expected_guests ? 'unknown'
        : event.expected_guests < 60  ? 'intimate'
        : event.expected_guests < 120 ? 'medium'
        : event.expected_guests < 200 ? 'large'
        : 'very-large',
      confirmedGuests: confirmedGuests.length,
      totalGuests:     event.expected_guests || null,
      eventDate:       formatDate(event.event_date),
      startTime:       event.start_time  || null,
      endTime:         event.end_time    || null,
      location:        event.location    || null,
      serviceStyle:    SERVICE_STYLE[type] || SERVICE_STYLE.other,
      specialRequests: event.notes       || null,
      dietarySummary:  buildDietarySummary(g),
      kosherFlag:      detectKosher(event, g),
    },
    cocktailMenuBrief: buildCocktailBrief(event, g),
    foodMenuBrief:     buildFoodBrief(event, g),
    operationsBrief:   buildOperationsBrief(event, g, tb, tk, tl),
    departmentActions: {
      barAction,
      kitchenAction:       'brief-ready',
      eventManagerActions: buildMissingInputs(event, g, tb, tk),
    },
  }
}
