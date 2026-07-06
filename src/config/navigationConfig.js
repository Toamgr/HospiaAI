export const NAV_GROUPS = {
  command: {
    roles: ['owner', 'admin'],
    // Phase 1 (nav re-skin): ownerHome (HESTIA AI) is FIRST so it is the owner's
    // default landing (default = first allowed page). OperationalPulse remains a
    // reachable owner report/depth surface, no longer the home. See
    // docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md §3 and
    // docs/audits/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_CODEBASE_AUDIT_2026-06-21.md.
    pages: [
      'ownerHome',
      'operationalPulse',
      'beverageBrief',
      'settings'
    ]
  },
  // Phase 1: Manager workspace area. 'manager' added so the existing Pre-Shift
  // Briefing (PAGE_META already authorizes manager) is reachable via nav; owner
  // removed (owner operates through HESTIA AI, not operational tabs).
  operations: {
    roles: ['manager', 'admin'],
    pages: [
      'preShiftBriefing',
      'actionBoard',
      'managerEmployeeRequests',
      'operationalNotes',
      'budgetRequest',
      'eventBrain'
    ]
  },
  // Trimmed nav for manager — Daily Close + Sales Tracker
  dailyOps: {
    roles: ['manager', 'bar_manager', 'admin'],
    pages: ['endOfDay', 'ciDashboard']
  },
  employeeWorkflow: {
    roles: ['employee', 'admin'],
    pages: ['employeeHome', 'dailyWork', 'barWorld', 'employeeRequests', 'employeeAchievements', 'serviceRecovery']
  },
  // Employee shift pages
  employeeShifts: {
    roles: ['employee', 'admin'],
    pages: ['myShifts', 'constraintsForm', 'foodMenuView', 'employeeCocktailMenu']
  },
  planning: {
    roles: ['manager', 'owner', 'admin'],
    pages: []
  },
  staffProgression: {
    roles: ['manager', 'bar_manager', 'admin'],
    pages: []
  },
  academy: {
    roles: ['employee', 'fb_director', 'admin'],
    pages: ['courses', 'lessonPlayer', 'knowledgeLibrary', 'wineKnowledge', 'approvedCocktails', 'cocktailLibrary']
  },
  // Phase 1 (nav re-skin): 'owner' removed from the groups below so the owner's
  // primary nav slims to HESTIA AI + Owner Reports (command) and Venue DNA
  // (venueIntelligence). Modules are NOT deleted — they remain owned by their
  // real roles (bar_manager, fb_director, events_manager, chef, etc.) and stay
  // reachable for those roles. Re-add 'owner' to any group's roles to restore an
  // owner nav tab. See the 2026-06-21 roadmap + audit referenced above.
  barManagement: {
    roles: ['bar_manager', 'fb_director', 'admin'],
    // beverageBriefInbox is page-gated to fb_director/admin via PAGE_META.roles — bar_manager
    // shares this nav group but never sees or reaches the inbox.
    pages: ['beverageBriefInbox', 'cocktailLab', 'foodCostTables', 'approvedCocktailsBar', 'cocktailLibrary', 'inventoryOverview', 'barReports', 'bottlePrices']
  },
  ownerIntelligence: {
    roles: ['owner', 'admin'],
    pages: []
  },
  system: {
    roles: ['owner', 'admin'],
    pages: []
  },
  // CI MODULE ADDITION
  cocktailIntelligence: {
    roles: ['bar_manager', 'fb_director', 'admin'],
    pages: ['ciDashboard']
  },
  // Venue Intelligence — owner/admin only Venue Learning Engine + Bridge inspector
  venueIntelligence: {
    roles: ['owner', 'admin'],
    pages: ['venueLearning', 'venueBridgeInspector']
  },
  // Events module — events_manager, admin (full CRM + finance + calendar).
  // Phase 1: 'owner' removed from primary nav; events_manager flow unchanged.
  eventsArea: {
    roles: ['events_manager', 'admin'],
    pages: ['eventCRM', 'eventOrchestrator']
  },
  // Calendar-only view — manager sees business summary; events_manager/admin
  // also land here so the calendar appears in their Events nav section.
  eventsCalendarArea: {
    roles: ['events_manager', 'manager', 'admin'],
    pages: ['eventCalendar']
  },
  // Staff tab — fb_director, bar_manager, admin
  staffArea: {
    roles: ['fb_director', 'bar_manager', 'admin'],
    pages: ['staffTab', 'staffProgression']
  },
  // Shift organizer — bar_manager
  shiftOrganizer: {
    roles: ['bar_manager', 'admin'],
    pages: ['shiftOrganizerPage']
  },
  // Chef module
  chefArea: {
    roles: ['chef', 'admin'],
    pages: ['chefDashboard']
  },
  // Chef menu approval — fb_director (owner approval flow deferred to a later phase)
  chefApproval: {
    roles: ['fb_director', 'admin'],
    pages: ['chefDashboard']
  },

  // Cocktails Magazine + Business Menus — open to all staff
  cocktailsMagazineArea: {
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'chef', 'admin'],
    pages: ['cocktailsMagazine']
  }
}


export const PAGE_META = {
  // ── Owner Command ──────────────────────────────────────────────────────────
  commandCenter: {
    area: 'command',
    roles: ['owner', 'admin'],
    code: 'CC',
    section: 'Home',
    description: 'Owner operating intelligence homepage'
  },

  // ── Operations ─────────────────────────────────────────────────────────────
  preShiftBriefing: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'owner', 'admin'],
    code: 'PB',
    section: 'Shift Start',
    description: 'Review all open signals before service begins'
  },
  actionBoard: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'owner', 'admin'],
    code: 'SC',
    section: 'Shift Control',
    description: 'Consolidated shift intelligence — actions, incidents, tasks, and owner communication'
  },
  // managerActionCenter merged into actionBoard — hidden from nav, file preserved
  managerActionCenter: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'owner', 'admin'],
    code: 'MC',
    section: 'Shift Control',
    description: 'Consolidated open actions, incidents, notes, and carry-forward items',
    hiddenInNav: true
  },
  managerEmployeeRequests: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'owner', 'admin'],
    code: 'ER',
    section: 'Shift Control',
    description: 'Review operational requests submitted by employees'
  },
  operationalNotes: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'owner', 'admin'],
    code: 'ON',
    section: 'Shift Control',
    description: 'Pinned notes and manager memory'
  },
  // endOfShiftReview merged into endOfDay — hidden from nav, file preserved
  endOfShiftReview: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'owner', 'admin'],
    code: 'ES',
    section: 'Shift Closeout',
    description: 'Close out the shift — capture hand-offs, complaints, and carry-forward items',
    hiddenInNav: true
  },
  endOfDay: {
    area: 'dailyOps',
    roles: ['manager', 'bar_manager', 'owner', 'admin'],
    code: 'CL',
    section: 'Daily Close',
    description: 'Close out the shift — handoff notes, incident summary, email report, and archive'
  },
  budgetRequest: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'owner', 'admin'],
    code: 'BR',
    section: 'Requests',
    description: 'Submit budget approval requests'
  },
  eventBrain: {
    area: 'operations',
    roles: ['events_manager', 'manager', 'owner', 'admin'],
    code: 'EB',
    section: 'Events',
    description: 'HESTIA × Kahi — AI-powered resort event operations simulation',
    hiddenInNav: true
  },
  eventCRM: {
    area: 'eventsArea',
    roles: ['manager', 'owner', 'admin', 'events_manager'],
    code: 'EC',
    section: 'Events',
    description: 'Guest management, seating, check-in, and messaging'
  },

  // Moved from planning tab into operations
  eventOrchestrator: {
    area: 'eventsArea',
    roles: ['manager', 'owner', 'admin', 'events_manager'],
    code: 'EV',
    section: 'Event Finance',
    description: 'Event financial calculator and revenue pipeline'
  },

  eventCalendar: {
    area: 'eventsCalendarArea',
    roles: ['events_manager', 'manager', 'owner', 'admin'],
    code: 'CL',
    section: 'Events',
    description: 'Internal event calendar — monthly view with operational status',
  },
  // Moved from staffProgression tab into operations
  staffProgression: {
    area: 'staffArea',
    roles: ['manager', 'bar_manager', 'admin', 'fb_director'],
    code: 'SP',
    section: 'Staff',
    description: 'Training progress, incident exposure, and coaching flags'
  },
  staffReadiness: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'SR',
    section: 'Staff',
    description: 'Team readiness dashboard',
    hiddenInNav: true
  },

  // ── Employee Workflow ──────────────────────────────────────────────────────
  employeeHome: {
    area: 'employeeWorkflow',
    roles: ['employee', 'admin'],
    code: 'EH',
    section: 'Employee OS',
    description: 'Premium employee home screen'
  },
  dailyWork: {
    area: 'employeeWorkflow',
    roles: ['employee', 'admin'],
    code: 'DW',
    section: 'Daily Work',
    description: 'Shifts, menus, requests, and milestones'
  },
  barWorld: {
    area: 'employeeWorkflow',
    roles: ['employee', 'admin'],
    code: 'BW',
    section: 'Bar World',
    description: 'Bar course, classic cocktails magazine, technique, and service reference'
  },
  employeeRequests: {
    area: 'employeeWorkflow',
    roles: ['employee', 'admin'],
    code: 'RQ',
    section: 'Employee OS',
    description: 'Submit operational requests to managers'
  },
  employeeAchievements: {
    area: 'employeeWorkflow',
    roles: ['employee', 'admin'],
    code: 'XP',
    section: 'Employee OS',
    description: 'Progression foundation and achievements'
  },
  serviceRecovery: {
    area: 'employeeWorkflow',
    roles: ['employee', 'admin'],
    code: 'RI',
    section: 'Employee OS',
    description: 'Report an operational guest or service issue'
  },

  // ── Academy ────────────────────────────────────────────────────────────────
  courses: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'CR',
    section: 'Course Catalog',
    description: 'Structured learning paths'
  },
  lessonPlayer: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'LP',
    section: 'Course Catalog',
    description: 'Lesson experience and service doctrine',
    hiddenInNav: true
  },
  knowledgeLibrary: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'KL',
    section: 'Course Catalog',
    description: 'Grand Bar Atlas course module',
    hiddenInNav: true
  },
  wineKnowledge: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'WK',
    section: 'Wine Academy',
    description: 'WSET-level wine knowledge foundation'
  },
  sopSheets: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'SV',
    section: 'Service',
    description: 'Hospitality standards and service reference',
    hiddenInNav: true
  },
  simulation: {
    area: 'academy',
    roles: ['manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'GS',
    section: 'Practice Lab',
    description: 'Guest scenarios and scoring'
  },
  approvedCocktails: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'AC',
    section: 'Approved Bar Menu',
    description: 'Employee-approved cocktail training'
  },

  // ── Bar Management ─────────────────────────────────────────────────────────
  // Beverage Slice 1A — F&B Director's inbox for submitted owner beverage briefs.
  // fb_director + admin ONLY (bar_manager shares the nav group but is page-gated out).
  beverageBriefInbox: {
    area: 'barManagement',
    roles: ['fb_director', 'admin'],
    code: 'BI',
    section: 'Beverage Program',
    description: 'Review submitted owner beverage direction briefs'
  },
  cocktailLab: {
    area: 'barManagement',
    roles: ['manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'CL',
    section: 'R&D Studio',
    description: 'AI cocktail creation — visual, editable, operational'
  },
  foodCostTables: {
    area: 'barManagement',
    roles: ['manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'FC',
    section: 'R&D Studio',
    description: 'Ingredient costing, pour cost, and pricing logic'
  },
  approvedCocktailsBar: {
    area: 'barManagement',
    roles: ['manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'AM',
    section: 'Menu',
    description: 'Approved cocktails published to the bar menu'
  },
  cocktailLibrary: {
    area: 'barManagement',
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'CB',
    section: 'Reference Library',
    description: 'Browse all cocktails — recipes, methods, glassware, and full specs'
  },
  inventoryOverview: {
    area: 'barManagement',
    roles: ['manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'IO',
    section: 'Archive',
    description: 'Ingredient usage derived from the active cocktail portfolio'
  },
  barReports: {
    area: 'barManagement',
    roles: ['manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'RP',
    section: 'Archive',
    description: 'Program performance, pipeline metrics, and recent approvals'
  },
  bottlePrices: {
    area: 'barManagement',
    roles: ['bar_manager', 'owner', 'fb_director', 'admin'],
    code: 'BP',
    section: 'Pricing Intelligence',
    description: 'Restricted bottle pricing — authorized personnel only',
    requiresBottlePricesAccess: true
  },

  // ── Owner Command (consolidated — all owner functions live here) ──────────
  // executiveOverview hidden: contains hardcoded estimates not wired to real data
  executiveOverview: {
    area: 'ownerIntelligence',
    roles: ['owner', 'admin'],
    code: 'EO',
    section: 'Executive View',
    description: 'Owner command summary',
    hiddenInNav: true
  },
  operationalPulse: {
    area: 'command',
    roles: ['owner', 'admin'],
    code: 'OP',
    section: 'Intelligence',
    description: 'Live operational load, shift review archive, and carry-forward patterns'
  },
  // Phase 9B-1 — static read-only Owner AI Home shell. Listed AFTER operationalPulse
  // so OperationalPulse remains the owner default landing. Not wired to DNA writes.
  ownerHome: {
    area: 'command',
    roles: ['owner', 'admin'],
    code: 'AI',
    section: 'Intelligence',
    description: 'Calm AI-first owner home — read-only Venue DNA foundation (Build Mode shell)'
  },
  // Beverage Slice 1A — the owner writes beverage direction; write routes are owner-only
  // (admin is nav-visible but the backend refuses admin writes).
  beverageBrief: {
    area: 'command',
    roles: ['owner', 'admin'],
    code: 'BB',
    section: 'Beverage',
    description: 'State the beverage direction in your own words and submit it to the F&B Director'
  },
  budgetApprovals: {
    area: 'command',
    roles: ['owner', 'admin'],
    code: 'BA',
    section: 'Approvals',
    description: 'Approve, reject, or request budget detail'
  },
  ownerOperationalRequests: {
    area: 'command',
    roles: ['owner', 'admin'],
    code: 'OR',
    section: 'Approvals',
    description: 'Owner inbox for manager-approved operational requests'
  },
  weeklySummary: {
    area: 'command',
    roles: ['owner', 'admin'],
    code: 'WS',
    section: 'Reports',
    description: 'Weekly intelligence email panel'
  },
  ownerReport: {
    area: 'command',
    roles: ['owner', 'admin'],
    code: 'WR',
    section: 'Reports',
    description: 'Weekly owner report'
  },
  businessMemory: {
    area: 'command',
    roles: ['owner', 'admin'],
    code: 'BM',
    section: 'Memory',
    description: 'Persistent business events and operational patterns'
  },
  // Hidden until wired to real operational data — files preserved
  businessMRI: {
    area: 'ownerIntelligence',
    roles: ['owner', 'admin'],
    code: 'MR',
    section: 'Financial Intelligence',
    description: 'Service dimension diagnostic',
    hiddenInNav: true
  },
  profitLeaks: {
    area: 'ownerIntelligence',
    roles: ['owner', 'admin'],
    code: 'PL',
    section: 'Financial Intelligence',
    description: 'Recoverable leakage map',
    hiddenInNav: true
  },
  strategicRecommendations: {
    area: 'ownerIntelligence',
    roles: ['owner', 'admin'],
    code: 'ST',
    section: 'Memory',
    description: 'AI strategic recommendations',
    hiddenInNav: true
  },

  // ── Cocktail Intelligence (CI MODULE ADDITION) ────────────────────────────
  ciDashboard: {
    area: 'cocktailIntelligence',
    roles: ['owner', 'manager', 'bar_manager', 'fb_director', 'admin'],
    code: 'CI',
    section: 'Intelligence',
    description: 'AI beverage director — DNA, menus, and narratives'
  },

  // ── Venue Intelligence (Venue Learning Engine) ────────────────────────────
  venueLearning: {
    area: 'venueIntelligence',
    roles: ['owner', 'admin'],
    code: 'VL',
    section: 'Intelligence',
    description: 'Learn the venue through conversation and build its Venue DNA'
  },
  venueBridgeInspector: {
    area: 'venueIntelligence',
    roles: ['owner', 'admin'],
    code: 'VB',
    section: 'Intelligence',
    description: 'Inspect the specialist briefs derived from Venue DNA'
  },

  // ── System (merged into command area) ────────────────────────────────────
  userManagement: {
    area: 'command',
    roles: ['owner', 'admin'],
    code: 'UM',
    section: 'Workspace',
    description: 'Create users, assign roles, and disable access'
  },
  settings: {
    area: 'command',
    roles: ['admin'],
    code: 'ST',
    section: 'System',
    description: 'User management and system configuration'
  },

  // ── Chef Module ────────────────────────────────────────────────────────────
  chefDashboard: {
    area: 'chefArea',
    roles: ['chef', 'fb_director', 'owner', 'admin'],
    code: 'CH',
    section: 'Kitchen',
    description: 'AI food menu creation and approval workflow'
  },

  // ── Staff Tab ─────────────────────────────────────────────────────────────
  staffTab: {
    area: 'staffArea',
    roles: ['fb_director', 'bar_manager', 'owner', 'admin'],
    code: 'ST',
    section: 'Staff',
    description: 'All employees — seniority, trainee status, sub-roles'
  },

  // ── Cocktails Magazine ────────────────────────────────────────────────────
  cocktailsMagazine: {
    area: 'cocktailsMagazineArea',
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'chef', 'owner', 'admin'],
    code: 'CM',
    section: 'Cocktails',
    description: 'Classic cocktail magazine and active bar menus'
  },

  // ── Shift Organizer (bar_manager) ─────────────────────────────────────────
  shiftOrganizerPage: {
    area: 'shiftOrganizer',
    roles: ['bar_manager', 'manager', 'owner', 'admin'],
    code: 'SO',
    section: 'Shifts',
    description: 'AI-assisted weekly shift builder and publish'
  },

  // ── Employee Shift Pages ──────────────────────────────────────────────────
  myShifts: {
    area: 'employeeShifts',
    roles: ['employee', 'admin'],
    code: 'MS',
    section: 'My Shifts',
    description: 'View your published shifts for current and next week'
  },
  constraintsForm: {
    area: 'employeeShifts',
    roles: ['employee', 'admin'],
    code: 'CF',
    section: 'My Shifts',
    description: 'Submit your availability for the coming week'
  },
  foodMenuView: {
    area: 'employeeShifts',
    roles: ['employee', 'admin'],
    code: 'FM',
    section: 'Menus',
    description: 'View published food menus'
  },
  employeeCocktailMenu: {
    area: 'employeeShifts',
    roles: ['employee', 'admin'],
    code: 'CM',
    section: 'Menus',
    description: 'Published cocktail menus visible to staff'
  }
}
