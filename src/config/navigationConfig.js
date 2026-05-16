export const NAV_GROUPS = {
  command: {
    roles: ['owner', 'admin'],
    // Single owner headquarters — all owner functions live here
    pages: [
      'commandCenter',
      'operationalPulse',
      'budgetApprovals',
      'ownerOperationalRequests',
      'weeklySummary',
      'ownerReport',
      'businessMemory',
      'userManagement'
    ]
  },
  operations: {
    roles: ['manager', 'bar_manager', 'admin'],
    pages: [
      'preShiftBriefing',
      'actionBoard',
      'managerEmployeeRequests',
      'operationalNotes',
      'endOfDay',
      'budgetRequest',
      'eventOrchestrator',
      'staffProgression'
    ]
  },
  employeeWorkflow: {
    roles: ['employee', 'admin'],
    pages: ['employeeHome', 'employeeRequests', 'employeeAchievements', 'serviceRecovery']
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
    roles: ['employee', 'manager', 'bar_manager', 'admin'],
    pages: ['courses', 'lessonPlayer', 'knowledgeLibrary', 'wineKnowledge', 'sopSheets', 'simulation', 'approvedCocktails', 'cocktailLibrary']
  },
  barManagement: {
    roles: ['manager', 'bar_manager', 'owner', 'admin'],
    pages: ['cocktailLab', 'foodCostTables', 'approvedCocktailsBar', 'cocktailLibrary', 'inventoryOverview', 'barReports', 'bottlePrices']
  },
  ownerIntelligence: {
    roles: ['owner', 'admin'],
    pages: [] // Merged into command area — tab no longer appears in nav
  },
  system: {
    roles: ['owner', 'admin'],
    pages: [] // userManagement moved to command area — tab no longer appears in nav
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
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'PB',
    section: 'Shift Start',
    description: 'Review all open signals before service begins'
  },
  actionBoard: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'SC',
    section: 'Shift Control',
    description: 'Consolidated shift intelligence — actions, incidents, tasks, and owner communication'
  },
  // managerActionCenter merged into actionBoard — hidden from nav, file preserved
  managerActionCenter: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'MC',
    section: 'Shift Control',
    description: 'Consolidated open actions, incidents, notes, and carry-forward items',
    hiddenInNav: true
  },
  managerEmployeeRequests: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'ER',
    section: 'Shift Control',
    description: 'Review operational requests submitted by employees'
  },
  operationalNotes: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'ON',
    section: 'Shift Control',
    description: 'Pinned notes and manager memory'
  },
  // endOfShiftReview merged into endOfDay — hidden from nav, file preserved
  endOfShiftReview: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'ES',
    section: 'Shift Closeout',
    description: 'Close out the shift — capture hand-offs, complaints, and carry-forward items',
    hiddenInNav: true
  },
  endOfDay: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'CL',
    section: 'Shift Closeout',
    description: 'Close out the shift — handoff notes, incident summary, email report, and archive'
  },
  budgetRequest: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'BR',
    section: 'Requests',
    description: 'Submit budget approval requests'
  },
  // Moved from planning tab into operations
  eventOrchestrator: {
    area: 'operations',
    roles: ['manager', 'owner', 'admin'],
    code: 'EV',
    section: 'Events',
    description: 'Future events, financial calculator, and pipeline'
  },
  // Moved from staffProgression tab into operations
  staffProgression: {
    area: 'operations',
    roles: ['manager', 'bar_manager', 'admin'],
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
    roles: ['employee', 'manager', 'bar_manager', 'admin'],
    code: 'CR',
    section: 'Course Catalog',
    description: 'Structured learning paths'
  },
  lessonPlayer: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'admin'],
    code: 'LP',
    section: 'Course Catalog',
    description: 'Lesson experience and service doctrine',
    hiddenInNav: true
  },
  knowledgeLibrary: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'admin'],
    code: 'KL',
    section: 'Course Catalog',
    description: 'Grand Bar Atlas course module',
    hiddenInNav: true
  },
  wineKnowledge: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'admin'],
    code: 'WK',
    section: 'Wine Academy',
    description: 'WSET-level wine knowledge foundation'
  },
  sopSheets: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'admin'],
    code: 'SV',
    section: 'Service',
    description: 'Hospitality standards and service reference'
  },
  simulation: {
    area: 'academy',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'GS',
    section: 'Practice Lab',
    description: 'Guest scenarios and scoring'
  },
  approvedCocktails: {
    area: 'academy',
    roles: ['employee', 'manager', 'bar_manager', 'admin'],
    code: 'AC',
    section: 'Approved Bar Menu',
    description: 'Employee-approved cocktail training'
  },

  // ── Bar Management ─────────────────────────────────────────────────────────
  cocktailLab: {
    area: 'barManagement',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'CL',
    section: 'R&D Studio',
    description: 'AI cocktail creation — visual, editable, operational'
  },
  foodCostTables: {
    area: 'barManagement',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'FC',
    section: 'R&D Studio',
    description: 'Ingredient costing, pour cost, and pricing logic'
  },
  approvedCocktailsBar: {
    area: 'barManagement',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'AM',
    section: 'Menu',
    description: 'Approved cocktails published to the bar menu'
  },
  cocktailLibrary: {
    area: 'barManagement',
    roles: ['employee', 'manager', 'bar_manager', 'admin'],
    code: 'CB',
    section: 'Reference Library',
    description: 'Browse all cocktails — recipes, methods, glassware, and full specs'
  },
  inventoryOverview: {
    area: 'barManagement',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'IO',
    section: 'Archive',
    description: 'Ingredient usage derived from the active cocktail portfolio'
  },
  barReports: {
    area: 'barManagement',
    roles: ['manager', 'bar_manager', 'admin'],
    code: 'RP',
    section: 'Archive',
    description: 'Program performance, pipeline metrics, and recent approvals'
  },
  bottlePrices: {
    area: 'barManagement',
    roles: ['bar_manager', 'owner', 'admin'],
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
    roles: ['owner', 'admin'],
    code: 'SY',
    section: 'Workspace',
    description: 'Workspace preferences',
    hiddenInNav: true
  }
}
