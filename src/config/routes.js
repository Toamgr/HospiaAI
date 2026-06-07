// Bidirectional map between HESTIA page keys and browser URL paths.
// This is the single source of truth for routing.
//
// PAGE_META (navigationConfig.js) handles role access and nav-group membership.
// routes.js handles URL ↔ page key translation only.
//
// Future record-level deep links such as /events/:eventId, /shifts/:scheduleId,
// /academy/lesson/:lessonId, /bar/cocktail/:cocktailId are architected to be
// layered on top using React Router useParams — no restructuring required.
//
// Gap: learningProgress has no PAGE_META entry and therefore no route. Track in
// the architecture gap list for a future phase.

export const PAGE_ROUTES = {
  // ── Owner command ──────────────────────────────────────────────────────────
  operationalPulse:           '/owner',
  commandCenter:              '/owner/command',       // feature-flagged off
  executiveOverview:          '/owner/executive',     // hidden
  budgetApprovals:            '/owner/approvals',
  ownerOperationalRequests:   '/owner/requests',
  weeklySummary:              '/owner/weekly',
  ownerReport:                '/owner/reports',
  businessMemory:             '/owner/memory',
  businessMRI:                '/owner/mri',           // hidden
  profitLeaks:                '/owner/profit-leaks',  // hidden
  strategicRecommendations:   '/owner/strategy',      // hidden
  userManagement:             '/settings/users',
  settings:                   '/settings',

  // ── Operations ─────────────────────────────────────────────────────────────
  preShiftBriefing:           '/ops/briefing',
  actionBoard:                '/ops/actions',
  managerActionCenter:        '/ops/action-center',   // hidden
  managerEmployeeRequests:    '/ops/requests',
  operationalNotes:           '/ops/notes',
  budgetRequest:              '/ops/budget',
  endOfDay:                   '/ops/close',
  endOfShiftReview:           '/ops/shift-review',    // hidden
  eventBrain:                 '/ops/event-brain',     // hidden
  staffReadiness:             '/ops/staff-readiness', // hidden

  // ── Cocktail Intelligence ──────────────────────────────────────────────────
  ciDashboard:                '/intelligence',

  // ── Employee ───────────────────────────────────────────────────────────────
  employeeHome:               '/employee',
  dailyWork:                  '/employee/daily-work',
  barWorld:                   '/employee/bar-world',
  employeeRequests:           '/employee/requests',
  employeeAchievements:       '/employee/achievements',
  serviceRecovery:            '/employee/recovery',

  // ── Shifts ─────────────────────────────────────────────────────────────────
  myShifts:                   '/shifts',
  shiftOrganizerPage:         '/shifts/organizer',
  constraintsForm:            '/shifts/constraints',
  foodMenuView:               '/shifts/menu',
  employeeCocktailMenu:       '/employee/cocktail-menu',

  // ── Academy ────────────────────────────────────────────────────────────────
  courses:                    '/academy/courses',
  // Prepared for /academy/lesson/:lessonId — Phase 5+ wires the lessonId param.
  lessonPlayer:               '/academy/lesson',
  knowledgeLibrary:           '/academy/library',     // hidden
  wineKnowledge:              '/academy/wine',
  sopSheets:                  '/academy/sop',         // hidden
  simulation:                 '/academy/simulation',
  approvedCocktails:          '/academy/cocktails',

  // ── Bar management ─────────────────────────────────────────────────────────
  cocktailLab:                '/bar/lab',
  foodCostTables:             '/bar/costs',
  approvedCocktailsBar:       '/bar/menu',
  cocktailLibrary:            '/bar/library',
  inventoryOverview:          '/bar/inventory',
  barReports:                 '/bar/reports',
  bottlePrices:               '/bar/prices',

  // ── Events ─────────────────────────────────────────────────────────────────
  eventCRM:                   '/events',
  eventOrchestrator:          '/events/finance',
  eventCalendar:              '/events/calendar',

  // ── Staff ──────────────────────────────────────────────────────────────────
  staffTab:                   '/staff',
  staffProgression:           '/staff/progression',

  // ── Chef ───────────────────────────────────────────────────────────────────
  chefDashboard:              '/chef',

  // ── Magazine ───────────────────────────────────────────────────────────────
  cocktailsMagazine:          '/magazine',
}

// Reverse map: URL path → page key.
// Used to derive the page key from the browser URL on load and back/forward navigation.
export const ROUTE_PAGES = Object.fromEntries(
  Object.entries(PAGE_ROUTES).map(([pageKey, path]) => [path, pageKey])
)
