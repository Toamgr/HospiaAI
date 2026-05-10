export const INITIAL_SHIFT_PROFILE = {
  shiftType: 'Dinner Service',
  expectedCovers: 184,
  vipReservations: 4,
  eventToday: true,
  pressureLevel: 'High'
}

export const INITIAL_SUPPLY_RISKS = [
  { item: 'Large clear ice', level: 'critical', detail: 'Only 42 units prepped; event requires 120.' },
  { item: 'Fresh lime juice', level: 'high', detail: 'Batch expires before late service. Re-juice by 18:00.' },
  { item: 'Premium tonic', level: 'medium', detail: 'Projected shortage if terrace opens.' }
]

export const INITIAL_BUDGET_REQUESTS = [
  { id: 'budget-seed-1', managerName: 'Omer Sadot', title: 'Emergency glassware replenishment', department: 'Bar', reason: 'High breakage during events and insufficient coupe reserve.', amount: 2800, urgency: 'High', roi: 'Prevents service delays and rental spend this weekend.', notes: 'Needed before Thursday wedding.', status: 'pending', created_at: '2026-05-04T16:30:00.000Z' }
]

export const INITIAL_SERVICE_INCIDENTS = [
  { id: 'incident-seed-1', employeeName: 'Peleg naim', issueType: 'Delay', guestTable: 'Table 12', description: 'Mains delayed 28 minutes; guest updated and bread service refreshed.', compensation: 'Dessert offered', severity: 'medium', resolved: true, time: '19:42', created_at: '2026-05-04T19:42:00.000Z' },
  { id: 'incident-seed-2', employeeName: 'Saar wax', issueType: 'Beverage', guestTable: 'Bar 4', description: 'Incorrect garnish on allergy-sensitive mocktail. Rebuilt immediately.', compensation: 'None', severity: 'high', resolved: false, time: '20:15', created_at: '2026-05-04T20:15:00.000Z' }
]

export const INITIAL_EMPLOYEE_TASKS = []

export const INITIAL_NOTIFICATIONS = [
  { id: 'note-seed-1', roles: ['owner', 'admin'], title: 'Budget approval pending', body: 'Emergency glassware replenishment requires owner review.', type: 'budget', page: 'budgetApprovals', readBy: [], created_at: '2026-05-04T16:31:00.000Z' },
  { id: 'note-seed-2', roles: ['manager', 'admin'], title: 'Unresolved service incident', body: 'Bar 4 beverage incident still needs manager resolution.', type: 'incident', page: 'actionBoard', readBy: [], created_at: '2026-05-04T20:16:00.000Z' }
]

export const INITIAL_OWNER_NOTES = [
  { id: 'owner-note-1', from: 'Tal millo', body: 'Review terrace staffing cost before approving additional weekend labor.', created_at: '2026-05-04T09:00:00.000Z' }
]

export const REQUEST_CATEGORIES = [
  'Bar Supply',
  'Stock Shortage',
  'Garnish Prep',
  'Glassware',
  'Maintenance',
  'Guest Facilities',
  'Printer / Office',
  'General Operations'
]

export const REQUEST_URGENCY = ['Low', 'Medium', 'High', 'Critical']

export const WINE_ACADEMY_SECTIONS = [
  {
    title: 'Tasting Method',
    focus: 'Structure before opinion',
    topics: ['Appearance, nose, palate, conclusion', 'Acidity, tannin, body, alcohol, sweetness', 'Quality level and readiness for service'],
    sample: 'A professional recommendation starts with structure: identify acidity and body first, then translate that into guest language.'
  },
  {
    title: 'Climate And Terroir',
    focus: 'Why wine tastes the way it does',
    topics: ['Cool climate vs warm climate', 'Altitude, latitude, soil, and exposure', 'Vintage pressure and service confidence'],
    sample: 'Cooler climates usually preserve acidity and restrained fruit. Warmer climates often produce riper fruit, fuller body, and higher alcohol.'
  },
  {
    title: 'Food Pairing',
    focus: 'Hospitality sales language',
    topics: ['Acid cuts richness', 'Tannin needs protein', 'Sweetness balances heat', 'Body should match food weight'],
    sample: 'With richer dishes, recommend a wine with enough acidity or tannin to reset the palate rather than simply matching intensity.'
  },
  {
    title: 'Service And Storage',
    focus: 'Protect the bottle after purchase',
    topics: ['Service temperature', 'Glassware selection', 'Storage position and light exposure', 'Fault detection before the guest does'],
    sample: 'Premium service begins before pouring: temperature, glass choice, and fault recognition protect trust and margin.'
  }
]
