/**
 * Zohar Event Architect — deterministic recommendation engine.
 * Recommendations are derived from actual table and event brief data.
 * No AI calls. No invented data. Content must be grounded in inputs.
 */

export const TAGS = {
  GUEST_FLOW: 'Guest Flow',
  ACCESSIBILITY: 'Accessibility',
  BAR_OPERATIONS: 'Bar Operations',
  VIP_EXPERIENCE: 'VIP Experience',
  RISK: 'Risk',
  SERVICE: 'Service',
}

export const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export function buildRecommendations(tables, eventBrief) {
  if (!Array.isArray(tables) || !eventBrief) return []

  const recs = []
  const seated = tables.reduce((sum, t) => sum + (t.guests ?? 0), 0)
  const invited = eventBrief.totalGuests ?? 0
  const unresolved = Math.max(0, invited - seated)
  const zoneSet = new Set(tables.map(t => t.zone))
  const hallTables = tables.filter(t => t.zone === 'hall')
  const vipTables = tables.filter(t => t.zone === 'vip')
  const poolTables = tables.filter(t => t.zone === 'pool')
  const accessibleTables = tables.filter(t => t.accessiblePriority)
  const acc = eventBrief.accessibility ?? {}
  const isOpenBar = eventBrief.barType === 'Open Bar'
  const is24hr = (eventBrief.format ?? '').includes('24-hour')
  const specialRequests = eventBrief.specialRequests ?? ''
  const dietary = eventBrief.dietary ?? []

  // Unresolved guests — high priority when >= 5
  if (unresolved >= 5) {
    recs.push({
      id: 'unresolved-guests',
      tag: TAGS.RISK,
      priority: PRIORITY.HIGH,
      text: `${unresolved} guests remain unseated against the current floor plan. Confirm final guest count and resolve table assignments before issuing the crew brief.`,
    })
  } else if (unresolved > 0 && unresolved < 5) {
    recs.push({
      id: 'unresolved-guests-minor',
      tag: TAGS.RISK,
      priority: PRIORITY.MEDIUM,
      text: `${unresolved} guest${unresolved > 1 ? 's are' : ' is'} not yet assigned to a table. Resolve before the floor plan is approved.`,
    })
  }

  // Welcome drink entrance placement — always relevant at large events
  if (invited >= 80) {
    recs.push({
      id: 'welcome-drinks-placement',
      tag: TAGS.GUEST_FLOW,
      priority: PRIORITY.HIGH,
      text: `Position the welcome drinks station 5–6 meters inside the main entrance rather than at the door. This prevents a first-arrival bottleneck and creates a deliberate entry moment for ${invited} arriving guests.`,
    })
  }

  // Accessible tables — service path
  if (accessibleTables.length >= 1) {
    const tableIds = accessibleTables.map(t => `Table ${t.id}`).join(' and ')
    recs.push({
      id: 'accessible-path-clearance',
      tag: TAGS.ACCESSIBILITY,
      priority: PRIORITY.HIGH,
      text: `${tableIds} ${accessibleTables.length > 1 ? 'carry' : 'carries'} accessibility priority. The service path around ${accessibleTables.length > 1 ? 'these tables' : 'this table'} must remain free of mobile furniture, trolleys, and bar equipment throughout the event.`,
    })
  }

  // Elderly guests — route monitoring
  if ((acc.elderly ?? 0) >= 5) {
    recs.push({
      id: 'elderly-route-monitoring',
      tag: TAGS.ACCESSIBILITY,
      priority: PRIORITY.MEDIUM,
      text: `${acc.elderly} elderly guests are expected. Assign the Access Host to monitor the step-free route during peak arrival and confirm no service equipment blocks sightlines to accessible seating.`,
    })
  }

  // Service corridor — hall tables
  if (hallTables.length >= 4) {
    recs.push({
      id: 'hall-service-corridor',
      tag: TAGS.SERVICE,
      priority: PRIORITY.MEDIUM,
      text: `${hallTables.length} tables share the main hall service corridor from the chef kitchen. Establish single-direction runner flow during plating moments to prevent cross-traffic and dropped plates.`,
    })
  }

  // Pool deck — luxury service standard
  if (poolTables.length >= 2) {
    const poolWaiters = [...new Set(poolTables.map(t => t.waiter).filter(Boolean))]
    const waiterRef = poolWaiters.length === 1 ? poolWaiters[0] : `${poolWaiters.length} dedicated staff`
    recs.push({
      id: 'pool-luxury-standard',
      tag: TAGS.VIP_EXPERIENCE,
      priority: PRIORITY.MEDIUM,
      text: `The pool deck creates the venue's premium destination moment. Assign ${waiterRef} exclusively to pool seating during main service to maintain a consistent luxury tone and prevent uncovered plates poolside.`,
    })
  }

  // Open bar + large guest count
  if (isOpenBar && invited >= 120) {
    recs.push({
      id: 'open-bar-arrival-pressure',
      tag: TAGS.BAR_OPERATIONS,
      priority: PRIORITY.MEDIUM,
      text: `With an open bar format and ${invited} guests, the main bar will face peak pressure in the first 45 minutes of service. Activate the garden bar as a destination from arrival — not only after the ceremony — to distribute load.`,
    })
  }

  // Garden ceremony concentration
  if (zoneSet.has('garden')) {
    recs.push({
      id: 'ceremony-concentration',
      tag: TAGS.GUEST_FLOW,
      priority: PRIORITY.MEDIUM,
      text: `The garden ceremony concentrates all guests in one zone temporarily. Brief service staff to hold positions at their stations during the ceremony and not break flow until guests have fully returned to their tables.`,
    })
  }

  // 24-hour resort — late-night changeover
  if (is24hr) {
    recs.push({
      id: 'late-night-changeover',
      tag: TAGS.SERVICE,
      priority: PRIORITY.LOW,
      text: `The 24-hour resort format requires the late-night station to operate independently of the main service team. Confirm the changeover timing so no service gap occurs between the plated dinner and late-night food activation.`,
    })
  }

  // Kosher service — strict routing
  if (dietary.includes('Kosher')) {
    recs.push({
      id: 'kosher-service-routing',
      tag: TAGS.SERVICE,
      priority: PRIORITY.HIGH,
      text: `Kosher service requires strict separation of equipment and service paths. Confirm kitchen-to-table routes do not mix dairy and meat runs, and brief all runners individually before service begins.`,
    })
  }

  // VIP + quiet family zone — ambient and traffic
  if (vipTables.length >= 3) {
    recs.push({
      id: 'vip-quiet-zone',
      tag: TAGS.VIP_EXPERIENCE,
      priority: PRIORITY.LOW,
      text: `The VIP and family zone covers ${vipTables.length} tables. Keep ambient music levels reduced in this area and ensure the late-night station exit path does not direct guest traffic through the quiet family section.`,
    })
  }

  // Bar location — special requests mention premium bar
  if (specialRequests.toLowerCase().includes('late-night bar') || specialRequests.toLowerCase().includes('premium')) {
    recs.push({
      id: 'premium-bar-signal',
      tag: TAGS.BAR_OPERATIONS,
      priority: PRIORITY.LOW,
      text: `The event brief calls for a premium late-night bar experience. Ensure the main cocktail bar faces the primary guest sightline and the garden bar program is fully restocked before the late-night transition.`,
    })
  }

  return recs
}

export function buildTableRecommendation(selectedTable, tables, eventBrief) {
  if (!selectedTable) return null

  const { zone, accessiblePriority, wheelchair, babyChairs, label, shape, guests, capacity } = selectedTable

  if (accessiblePriority) {
    return `This table carries accessibility priority. Confirm the step-free path from the accessible entrance remains clear at all times, including during bar resupply and runner circulation.`
  }

  if ((wheelchair ?? 0) > 0) {
    return `${wheelchair} wheelchair space${wheelchair > 1 ? 's' : ''} allocated — verify a minimum 1.5m turning radius is maintained and that no chair placement blocks the accessible restroom route.`
  }

  if ((babyChairs ?? 0) > 0) {
    return `${babyChairs} baby chair${babyChairs > 1 ? 's' : ''} requested — confirm seat assembly before guest arrival and assign a waiter briefed on infant safety positioning.`
  }

  if (zone === 'pool') {
    return `Pool deck seating is the venue's highest-value guest position. Maintain a premium service cadence — no delayed plating, no uncovered plates waiting, and regular refreshment runs throughout the reception.`
  }

  if (zone === 'garden') {
    return `Garden seating offers a direct chuppah sightline. Confirm chairs are aligned to the ceremony axis and that runner movements during the ceremony do not interrupt the guests' view.`
  }

  if (zone === 'vip') {
    return `VIP and family zone — assign the most experienced available waiter and brief them personally on all dietary and accessibility requirements for this group before service begins.`
  }

  if (shape === 'long') {
    return `Long tables require synchronized plating. All seats along this table must receive their plates within a 3-minute window to avoid hot and cold discrepancies across the table.`
  }

  const fillRate = capacity > 0 ? (guests ?? 0) / capacity : null
  if (fillRate !== null && fillRate < 0.70) {
    return `This table is at ${Math.round(fillRate * 100)}% capacity. Confirm whether remaining seats are held for late arrivals or if the table count should be reduced before the floor plan is finalized.`
  }

  if (label) {
    return `Labelled "${label}" — brief the assigned waiter on any personalised requirements for this group prior to doors opening.`
  }

  return `Zone: ${zone}. Assigned waiter: ${selectedTable.waiter ?? '—'}. ${guests ?? 0} of ${capacity} seats confirmed.`
}
