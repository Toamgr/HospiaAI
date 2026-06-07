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
      text: `Action required: ${unresolved} guests remain unseated against the current floor plan. Confirm final guest count, resolve table assignments, and reissue the crew brief before event day.`,
    })
  } else if (unresolved > 0 && unresolved < 5) {
    recs.push({
      id: 'unresolved-guests-minor',
      tag: TAGS.RISK,
      priority: PRIORITY.MEDIUM,
      text: `${unresolved} guest${unresolved > 1 ? 's are' : ' is'} not yet assigned to a table. Resolve and confirm before the floor plan is approved.`,
    })
  }

  // Welcome drink entrance placement — always relevant at large events
  if (invited >= 80) {
    recs.push({
      id: 'welcome-drinks-placement',
      tag: TAGS.GUEST_FLOW,
      priority: PRIORITY.HIGH,
      text: `Recommended action: move the welcome drinks station 5–6 meters inside the main entrance rather than placing it at the door. This prevents a first-arrival bottleneck and creates a deliberate entry moment for ${invited} arriving guests.`,
    })
  }

  // Accessible tables — service path
  if (accessibleTables.length >= 1) {
    const tableIds = accessibleTables.map(t => `Table ${t.id}`).join(' and ')
    recs.push({
      id: 'accessible-path-clearance',
      tag: TAGS.ACCESSIBILITY,
      priority: PRIORITY.HIGH,
      text: `Action required: ${tableIds} ${accessibleTables.length > 1 ? 'carry' : 'carries'} accessibility priority. Keep this route clear — mobile furniture, trolleys, and bar equipment must not block the service path around ${accessibleTables.length > 1 ? 'these tables' : 'this table'} at any point during the event.`,
    })
  }

  // Elderly guests — route monitoring
  if ((acc.elderly ?? 0) >= 5) {
    recs.push({
      id: 'elderly-route-monitoring',
      tag: TAGS.ACCESSIBILITY,
      priority: PRIORITY.MEDIUM,
      text: `Recommended action: assign the Access Host to monitor the step-free route during peak arrival. ${acc.elderly} elderly guests are expected — confirm no service equipment blocks sightlines to accessible seating before doors open.`,
    })
  }

  // Service corridor — hall tables
  if (hallTables.length >= 4) {
    recs.push({
      id: 'hall-service-corridor',
      tag: TAGS.SERVICE,
      priority: PRIORITY.MEDIUM,
      text: `Action: establish single-direction runner flow in the main hall service corridor before plating begins. ${hallTables.length} tables share this route from the chef kitchen — cross-traffic during simultaneous plating is a dropped-plate risk. Assign a service captain to monitor this pressure point.`,
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
      text: `The pool deck is the venue's premium destination moment. Assign ${waiterRef} exclusively to pool seating during main service — no shared routes, no delayed plating, no uncovered plates poolside.`,
    })
  }

  // Open bar + large guest count
  if (isOpenBar && invited >= 120) {
    recs.push({
      id: 'open-bar-arrival-pressure',
      tag: TAGS.BAR_OPERATIONS,
      priority: PRIORITY.MEDIUM,
      text: `Recommended action: activate the garden bar as a guest destination from arrival — not only after the ceremony. With an open bar and ${invited} guests, the main bar will face peak pressure within the first 45 minutes. Splitting load early prevents a visible queue at the primary bar.`,
    })
  }

  // Garden ceremony concentration
  if (zoneSet.has('garden')) {
    recs.push({
      id: 'ceremony-concentration',
      tag: TAGS.GUEST_FLOW,
      priority: PRIORITY.MEDIUM,
      text: `The garden ceremony briefly concentrates all guests in one zone. Brief service staff to hold positions at their stations during the ceremony and keep the return flow unobstructed — do not break table service until guests have fully reseated.`,
    })
  }

  // 24-hour resort — late-night changeover
  if (is24hr) {
    recs.push({
      id: 'late-night-changeover',
      tag: TAGS.SERVICE,
      priority: PRIORITY.LOW,
      text: `Confirm the late-night station changeover time with the kitchen team. The 24-hour resort format requires this station to operate independently of the main dinner service — a gap between plated dinner and late-night food activation must be avoided.`,
    })
  }

  // Kosher service — strict routing
  if (dietary.includes('Kosher')) {
    recs.push({
      id: 'kosher-service-routing',
      tag: TAGS.SERVICE,
      priority: PRIORITY.HIGH,
      text: `Action required: brief all kitchen runners individually on Kosher routing before service begins. Confirm that kitchen-to-table paths strictly separate dairy and meat runs — equipment, trays, and surfaces must not be shared.`,
    })
  }

  // VIP + quiet family zone — ambient and traffic
  if (vipTables.length >= 3) {
    recs.push({
      id: 'vip-quiet-zone',
      tag: TAGS.VIP_EXPERIENCE,
      priority: PRIORITY.LOW,
      text: `The VIP and family zone covers ${vipTables.length} tables. Reduce ambient music levels in this area and ensure the late-night station exit path does not route guest traffic through the quiet family section.`,
    })
  }

  // Bar location — special requests mention premium bar
  if (specialRequests.toLowerCase().includes('late-night bar') || specialRequests.toLowerCase().includes('premium')) {
    recs.push({
      id: 'premium-bar-signal',
      tag: TAGS.BAR_OPERATIONS,
      priority: PRIORITY.LOW,
      text: `The event brief calls for a premium late-night bar experience. Confirm the main cocktail bar faces the primary guest sightline, and ensure the garden bar programme is fully restocked before the late-night transition begins.`,
    })
  }

  // ── Event-type-aware recommendations ──────────────────────────────────────
  const eventType = eventBrief.eventType ?? null

  // Small events — compact bar coverage note (only when not already covered by invited >= 80 rec)
  if (invited > 0 && invited < 80) {
    recs.push({
      id: 'small-event-bar-note',
      tag: TAGS.BAR_OPERATIONS,
      priority: PRIORITY.LOW,
      text: `For a compact event of ${invited} guests, one main bar and a welcome station at the entrance should provide comfortable coverage. Keep the arrival approach uncluttered and the service path clear.`,
    })
  }

  // Large event (180+) — separate arrival drinks explicitly
  if (invited >= 180) {
    recs.push({
      id: 'large-event-arrival-separation',
      tag: TAGS.BAR_OPERATIONS,
      priority: PRIORITY.HIGH,
      text: `With ${invited} guests, consider separating arrival drinks from the main cocktail bar entirely. First-arrival pressure concentrates in the first 30–45 minutes — a dedicated welcome station removes this load from the primary bar.`,
    })
  }

  // Corporate
  if (eventType === 'corporate') {
    recs.push({
      id: 'corporate-registration-flow',
      tag: TAGS.GUEST_FLOW,
      priority: PRIORITY.HIGH,
      text: `Corporate event: prioritize registration flow and ensure clear sightlines to any presentation screen or stage. Brief service staff on corporate pacing — reduce interruptions and hold unsolicited pours during presentations.`,
    })
  }

  // Wedding / private — VIP and ceremony brief
  if (eventType === 'wedding' || eventType === 'private') {
    recs.push({
      id: 'wedding-vip-placement',
      tag: TAGS.VIP_EXPERIENCE,
      priority: PRIORITY.MEDIUM,
      text: `Keep family and VIP tables away from high-noise zones — bar service areas, runner corridors, and late-night stations. Give assigned waiters a personal brief on dietary and accessibility requirements before doors open.`,
    })
    if (!zoneSet.has('garden')) {
      recs.push({
        id: 'ceremony-service-hold',
        tag: TAGS.SERVICE,
        priority: PRIORITY.MEDIUM,
        text: `Brief all service staff to hold positions at their tables during the ceremony. Return runners to the kitchen, keep ceremony space unobstructed, and resume service only once guests have fully reseated.`,
      })
    }
  }

  // Bar event — bar is the operational center
  if (eventType === 'bar_event') {
    recs.push({
      id: 'bar-event-coverage-priority',
      tag: TAGS.BAR_OPERATIONS,
      priority: PRIORITY.HIGH,
      text: `Bar coverage is the operational center of this event. Ensure the bar has maximum visibility from the main entrance, bartenders have unobstructed service reach, and resupply routes do not cross guest-facing areas.`,
    })
  }

  return recs
}

export function buildTableRecommendation(selectedTable, tables, eventBrief) {
  if (!selectedTable) return null

  const { zone, accessiblePriority, wheelchair, babyChairs, label, shape, guests, capacity } = selectedTable

  if (accessiblePriority) {
    return `Accessibility priority table. Maintain clear step-free access at all times — review before doors open and again after bar resupply and runner circulation begins.`
  }

  if ((wheelchair ?? 0) > 0) {
    return `${wheelchair} wheelchair space${wheelchair > 1 ? 's' : ''} allocated. Verify a minimum 1.5m turning radius is maintained and confirm no chair placement blocks the accessible restroom route before guest arrival.`
  }

  if ((babyChairs ?? 0) > 0) {
    return `${babyChairs} baby chair${babyChairs > 1 ? 's' : ''} requested. Confirm seat assembly before guest arrival and assign a waiter briefed on infant safety positioning at this table.`
  }

  if (zone === 'pool') {
    return `Pool deck — the venue's highest-value guest position. Assign a dedicated waiter to this table and maintain premium service cadence throughout: no delayed plating, no uncovered plates waiting, and proactive refreshment rounds.`
  }

  if (zone === 'garden') {
    return `Garden seating with a direct chuppah sightline. Confirm chairs are aligned to the ceremony axis. Keep runner movements clear of the guest sightline during the ceremony.`
  }

  if (zone === 'vip') {
    return `VIP and family zone. Assign the most experienced available waiter and brief them personally on dietary and accessibility requirements for this group before service begins.`
  }

  if (shape === 'long') {
    return `Long table — synchronized plating required. All seats must receive their plates within a 3-minute window. Brief the assigned runners before service to prevent hot/cold discrepancies along the table.`
  }

  const fillRate = capacity > 0 ? (guests ?? 0) / capacity : null
  if (fillRate !== null && fillRate < 0.70) {
    return `This table is at ${Math.round(fillRate * 100)}% capacity. Confirm whether remaining seats are held for late arrivals or if the table configuration should be adjusted before the floor plan is finalized.`
  }

  if (label) {
    return `Table labelled "${label}" — brief the assigned waiter on any personalised requirements for this group prior to doors opening.`
  }

  return `Zone: ${zone}. Assigned waiter: ${selectedTable.waiter ?? '—'}. ${guests ?? 0} of ${capacity} seats confirmed.`
}
