/**
 * Maps real HESTIA event data to Event Architect brief format.
 * Defensive: handles missing fields gracefully. Never invents fake data.
 * Falls back to demo EVENT_BRIEF values only where explicitly noted.
 */
import { EVENT_BRIEF } from '../data/eventBrainDemoData'

const TYPE_STYLE = {
  wedding:   { serviceStyle: 'Luxury Plated', barType: 'Open Bar',    format: 'Evening Celebration' },
  corporate: { serviceStyle: 'Standing / Canapés', barType: 'Hosted Bar', format: 'Corporate Function' },
  private:   { serviceStyle: 'Seated Dinner', barType: 'Hosted Bar',  format: 'Private Event' },
  bar_event: { serviceStyle: 'Cocktail Reception', barType: 'Open Bar', format: 'Bar Programme' },
  other:     { serviceStyle: 'Standard Service', barType: 'Hosted Bar', format: 'Special Event' },
}

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch { return dateStr }
}

/**
 * Build an architect brief from a real HESTIA event object.
 * Returns null if event is falsy.
 */
export function buildArchitectBriefFromEvent(event) {
  if (!event) return null

  const type = event.event_type || event.type || null
  const style = TYPE_STYLE[type] || TYPE_STYLE.other
  const guests = event.expected_guests || event.guest_count || null

  return {
    // Identity
    title: event.name || 'Untitled Event',
    eventId: event.id,
    eventType: type,
    clientName: event.client_name || null,
    isEventLinked: true,

    // Timing
    date: formatDate(event.event_date) || '—',

    // Guests — null signals missing data downstream
    totalGuests: guests,
    guestsFallback: guests === null,

    // Venue
    venueName: event.location || null,

    // Service style — derived from event type
    serviceStyle: style.serviceStyle,
    barType: style.barType,
    format: style.format,

    // Special requests / notes — direct from event
    specialRequests: event.notes || null,

    // Budget — not available in event data; use demo value as orientation fallback
    budgetPerPerson: EVENT_BRIEF.budgetPerPerson,
    budgetPerPersonFallback: true,
    currency: EVENT_BRIEF.currency,

    // Accessibility — conservative defaults; no invented data
    accessibility: {
      wheelchairs: 0,
      babyChairs: 0,
      elderly: 0,
      stepFree: true,
      quietFamilyZone: type === 'wedding' || type === 'private',
    },

    // Dietary — not available in event data without a dedicated field
    dietary: [],
  }
}

/**
 * Derive recommended planning spaces from event type and guest count.
 * Returns a list of space descriptors. Never invents guest counts.
 */
export function deriveArchitectSpacesFromEvent(event) {
  if (!event) return []

  const type = event.event_type || event.type || null
  const guests = event.expected_guests || event.guest_count || null
  const g = guests || 0
  const spaces = []

  // Arrival — always present
  spaces.push({
    id: 'arrival',
    name: 'Arrival / Reception',
    type: 'circulation',
    purpose: 'Guest arrival, welcome drinks, first impressions',
    recommendedCapacity: g > 0 ? Math.round(g * 0.3) : null,
    notes: 'Welcome drinks station should be 5–6 m inside the entrance, not at the door.',
  })

  // Corporate: registration before main hall
  if (type === 'corporate') {
    spaces.push({
      id: 'registration',
      name: 'Registration / Check-in',
      type: 'circulation',
      purpose: 'Arrival name-badge collection and registration flow',
      recommendedCapacity: null,
      notes: 'Prioritize registration flow — avoid a bottleneck at the entrance.',
    })
  }

  // Main hall — always present
  spaces.push({
    id: 'main-hall',
    name: 'Main Hall',
    type: 'seating',
    purpose: 'Primary seating area and full-service zone',
    recommendedCapacity: g > 0 ? Math.round(g * 0.55) : null,
    notes: null,
  })

  // Bar area — always present
  spaces.push({
    id: 'bar',
    name: 'Bar Area',
    type: 'service',
    purpose: g >= 120
      ? 'Main cocktail bar — secondary welcome station recommended for arrival pressure'
      : 'Main bar station',
    recommendedCapacity: null,
    notes: g >= 120
      ? 'Large guest count: a second welcome drinks point at arrival reduces main bar pressure.'
      : 'One bar station should cover this guest count comfortably.',
  })

  // Bar event: standing cocktail zone
  if (type === 'bar_event') {
    spaces.push({
      id: 'cocktail-zone',
      name: 'Standing Cocktail Zone',
      type: 'mixed',
      purpose: 'Primary standing and cocktail experience area',
      recommendedCapacity: g > 0 ? Math.round(g * 0.7) : null,
      notes: 'Bar coverage is the operational center of this event. Maximize bar visibility from the entrance.',
    })
  }

  // Dining zone — seated events with 80+ guests
  if (g >= 80 && type !== 'bar_event') {
    spaces.push({
      id: 'dining',
      name: 'Dining Zone',
      type: 'seating',
      purpose: 'Plated service area — runner access and kitchen sightlines required',
      recommendedCapacity: g > 0 ? Math.round(g * 0.4) : null,
      notes: null,
    })
  }

  // VIP / Family — wedding and private events
  if (type === 'wedding' || type === 'private') {
    spaces.push({
      id: 'vip-family',
      name: 'VIP / Family Zone',
      type: 'seating',
      purpose: 'Quiet family and VIP seating, step-free access',
      recommendedCapacity: g > 0 ? Math.round(g * 0.15) : null,
      notes: 'Assign the most experienced waiter. Keep ambient music lower in this zone.',
    })
  }

  // Corporate: networking / presentation
  if (type === 'corporate') {
    spaces.push({
      id: 'networking',
      name: 'Networking / Presentation Area',
      type: 'mixed',
      purpose: 'Standing networking, presentations, and breakout discussion',
      recommendedCapacity: g > 0 ? Math.round(g * 0.6) : null,
      notes: 'Confirm all sightlines to any screen or stage are clear from standing positions.',
    })
  }

  // Accessibility zone — medium+ events
  if (g >= 60) {
    spaces.push({
      id: 'accessibility',
      name: 'Accessibility Zone',
      type: 'circulation',
      purpose: 'Step-free routing and priority seating cluster',
      recommendedCapacity: null,
      notes: 'Keep clear at all times — no mobile furniture, bar equipment, or trolleys on this route.',
    })
  }

  // Back of house — always
  spaces.push({
    id: 'back-of-house',
    name: 'Back of House',
    type: 'service',
    purpose: 'Kitchen access, runner staging, staff circulation',
    recommendedCapacity: null,
    notes: 'Staff route must not cross guest arrival or VIP zones during service.',
  })

  return spaces
}

/**
 * High-level planning profile derived from event type and guest count.
 * Used by EventBrain to contextualize recommendations.
 */
export function deriveArchitectPlanningProfile(event) {
  if (!event) return null
  const guests = event.expected_guests || event.guest_count || null
  const type = event.event_type || event.type || null

  return {
    scale: !guests ? 'unknown'
      : guests < 60   ? 'intimate'
      : guests < 120  ? 'medium'
      : guests < 200  ? 'large'
      : 'very-large',
    barPressure: !guests ? 'unknown'
      : guests < 60   ? 'low'
      : guests < 120  ? 'moderate'
      : 'high',
    serviceComplexity: type === 'wedding'   ? 'high'
      : type === 'corporate' ? 'moderate'
      : type === 'bar_event' ? 'moderate'
      : 'standard',
    requiresVIPZone:      type === 'wedding' || type === 'private',
    requiresRegistration: type === 'corporate',
    barFocus:             type === 'bar_event',
  }
}

/**
 * Return the fallback tables unchanged — floor plan editor is a future phase.
 * The visual template stays the same; only the data around it becomes event-linked.
 */
export function deriveArchitectTablesFromEvent(event, fallbackTables) {
  return fallbackTables
}
