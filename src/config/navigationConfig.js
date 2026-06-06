export const NAV_GROUPS = {
  command: {
    roles: ['owner', 'admin'],
    pages: [
      'operationalPulse',
      'settings'
    ]
  },
  operations: {
    roles: ['owner', 'admin'],
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
    roles: ['manager', 'bar_manager', 'owner', 'admin'],
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
  barManagement: {
    roles: ['bar_manager', 'owner', 'fb_director', 'admin'],
    pages: ['cocktailLab', 'foodCostTables', 'approvedCocktailsBar', 'cocktailLibrary', 'inventoryOverview', 'barReports', 'bottlePrices']
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
    roles: ['owner', 'bar_manager', 'fb_director', 'admin'],
    pages: ['ciDashboard']
  },
  // Events module — events_manager
  eventsArea: {
    roles: ['events_manager', 'owner', 'admin'],
    pages: ['eventCRM', 'eventOrchestrator']
  },
  // Staff tab — fb_director, bar_manager, owner, admin
  staffArea: {
    roles: ['fb_director', 'bar_manager', 'owner', 'admin'],
    pages: ['staffTab', 'staffProgression']
  },
  // Shift organizer — bar_manager
  shiftOrganizer: {
    roles: ['bar_manager', 'owner', 'admin'],
    pages: ['shiftOrganizerPage']
  },
  // Chef module
  chefArea: {
    roles: ['chef', 'admin'],
    pages: ['chefDashboard']
  },
  // Chef menu approval — fb_director + owner
  chefApproval: {
    roles: ['fb_director', 'owner', 'admin'],
    pages: ['chefDashboard']
  },

  // Cocktails Magazine + Business Menus — open to all staff
  cocktailsMagazineArea: {
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'events_manager', 'chef', 'owner', 'admin'],
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
    description: 'AI beverage director — DNA, menus, narratives, and 5PM emergency mode'
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
    roles: ['employee', 'manager', 'bar_manager', 'fb_director', 'events_manager', 'chef', 'owner', 'admin'],
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
