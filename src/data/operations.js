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

export const INITIAL_BUDGET_REQUESTS = []

export const INITIAL_SERVICE_INCIDENTS = []

export const INITIAL_EMPLOYEE_TASKS = []

export const INITIAL_NOTIFICATIONS = []

export const INITIAL_OWNER_NOTES = []

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
