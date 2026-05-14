export const NAV_GROUPS = {
  command: {
    roles: ['owner', 'admin'],
    pages: ['commandCenter']
  },
  operations: {
    roles: ['manager', 'bar_manager', 'admin'],
    pages: ['preShiftBriefing', 'actionBoard', 'managerEmployeeRequests', 'operationalNotes', 'endOfDay', 'budgetRequest']
  },
  employeeWorkflow: {
    roles: ['employee', 'admin'],
    pages: ['employeeHome', 'employeeRequests', 'employeeAchievements', 'serviceRecovery']
  },
  planning: {
    roles: ['manager', 'owner', 'admin'],
    pages: ['eventOrchestrator']
  },
  staffProgression: {
    roles: ['manager', 'bar_manager', 'admin'],
    pages: ['staffProgression']
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
    pages: ['executiveOverview', 'budgetApprovals', 'ownerOperationalRequests', 'weeklySummary', 'businessMRI', 'profitLeaks', 'ownerReport', 'businessMemory', 'strategicRecommendations']
  },
  system: {
    roles: ['owner', 'admin'],
    pages: ['userManagement', 'settings']
  }
}


export const PAGE_META = {
  commandCenter: { area: 'command', roles: ['owner', 'admin'], code: 'CC', section: 'Owner Command', description: 'Strategic business intelligence homepage' },
  preShiftBriefing: { area: 'operations', roles: ['manager', 'bar_manager', 'admin'], code: 'PB', section: 'Shift Start', description: 'Review all open signals before service begins' },
  actionBoard: { area: 'operations', roles: ['manager', 'bar_manager', 'admin'], code: 'AB', section: 'Shift Control', description: 'Daily manager operating room' },
  managerEmployeeRequests: { area: 'operations', roles: ['manager', 'bar_manager', 'admin'], code: 'ER', section: 'Shift Control', description: 'Review operational requests submitted by employees' },
  operationalNotes: { area: 'operations', roles: ['manager', 'bar_manager', 'admin'], code: 'ON', section: 'Shift Control', description: 'Pinned notes and manager memory' },
  endOfDay: { area: 'operations', roles: ['manager', 'bar_manager', 'admin'], code: 'ED', section: 'Shift Handoff', description: 'EmailJS report and shift archive' },
  budgetRequest: { area: 'operations', roles: ['manager', 'bar_manager', 'admin'], code: 'BR', section: 'Manager Requests', description: 'Submit budget approval requests' },
  employeeHome: { area: 'employeeWorkflow', roles: ['employee', 'admin'], code: 'EH', section: 'Employee OS', description: 'Premium employee home screen' },
  employeeRequests: { area: 'employeeWorkflow', roles: ['employee', 'admin'], code: 'RQ', section: 'Employee OS', description: 'Submit operational requests to managers' },
  employeeAchievements: { area: 'employeeWorkflow', roles: ['employee', 'admin'], code: 'XP', section: 'Employee OS', description: 'Progression foundation and achievements' },
  serviceRecovery: { area: 'employeeWorkflow', roles: ['employee', 'admin'], code: 'RI', section: 'Employee OS', description: 'Report an operational guest or service issue' },
  eventOrchestrator: { area: 'planning', roles: ['manager', 'owner', 'admin'], code: 'EV', section: 'Event CRM', description: 'Future events, calculators, and pipeline' },
  staffProgression: { area: 'staffProgression', roles: ['manager', 'bar_manager', 'admin'], code: 'SP', section: 'Coaching Analytics', description: 'Training, readiness, incident exposure, and coaching flags' },
  courses: { area: 'academy', roles: ['employee', 'manager', 'bar_manager', 'admin'], code: 'CR', section: 'Course Catalog', description: 'Structured learning paths' },
  lessonPlayer: { area: 'academy', roles: ['employee', 'manager', 'bar_manager', 'admin'], code: 'LP', section: 'Course Catalog', description: 'Lesson experience and service doctrine', hiddenInNav: true },
  knowledgeLibrary: { area: 'academy', roles: ['employee', 'manager', 'bar_manager', 'admin'], code: 'KL', section: 'Course Catalog', description: 'Grand Bar Atlas course module', hiddenInNav: true },
  wineKnowledge: { area: 'academy', roles: ['employee', 'manager', 'bar_manager', 'admin'], code: 'WK', section: 'Wine Academy', description: 'WSET-level wine knowledge foundation' },
  sopSheets: { area: 'academy', roles: ['employee', 'manager', 'bar_manager', 'admin'], code: 'SV', section: 'Service', description: 'Hospitality standards and service reference' },
  simulation: { area: 'academy', roles: ['manager', 'bar_manager', 'admin'], code: 'GS', section: 'Practice Lab', description: 'Guest scenarios and scoring' },
  approvedCocktails: { area: 'academy', roles: ['employee', 'manager', 'bar_manager', 'admin'], code: 'AC', section: 'Approved Bar Menu', description: 'Employee-approved cocktail training' },
  cocktailLab: { area: 'barManagement', roles: ['manager', 'bar_manager', 'admin'], code: 'CL', section: 'R&D Studio', description: 'AI cocktail creation — visual, editable, operational' },
  foodCostTables: { area: 'barManagement', roles: ['manager', 'bar_manager', 'admin'], code: 'FC', section: 'R&D Studio', description: 'Ingredient costing, pour cost, and pricing logic' },
  approvedCocktailsBar: { area: 'barManagement', roles: ['manager', 'bar_manager', 'admin'], code: 'AC', section: 'Menu', description: 'Approved cocktails published to the bar menu' },
  cocktailLibrary: { area: 'barManagement', roles: ['employee', 'manager', 'bar_manager', 'admin'], code: 'CB', section: 'Reference Library', description: 'Browse all cocktails — recipes, methods, glassware, and full specs' },
  inventoryOverview: { area: 'barManagement', roles: ['manager', 'bar_manager', 'admin'], code: 'IO', section: 'Archive', description: 'Ingredient usage derived from the active cocktail portfolio' },
  barReports: { area: 'barManagement', roles: ['manager', 'bar_manager', 'admin'], code: 'BR', section: 'Archive', description: 'Program performance, pipeline metrics, and recent approvals' },
  bottlePrices: { area: 'barManagement', roles: ['bar_manager', 'owner', 'admin'], code: 'BP', section: 'Pricing Intelligence', description: 'Restricted bottle pricing — authorized personnel only', requiresBottlePricesAccess: true },
  executiveOverview: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'EO', section: 'Executive View', description: 'Owner command summary' },
  budgetApprovals: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'BA', section: 'Approvals', description: 'Approve, reject, or request budget detail' },
  ownerOperationalRequests: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'ORQ', section: 'Approvals', description: 'Owner inbox for manager-approved operational requests' },
  weeklySummary: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'WS', section: 'Approvals', description: 'Weekly intelligence email panel' },
  ownerReport: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'OR', section: 'Executive View', description: 'Weekly owner report' },
  businessMRI: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'MR', section: 'Financial Intelligence', description: 'Service dimension diagnostic' },
  profitLeaks: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'PL', section: 'Financial Intelligence', description: 'Recoverable leakage map' },
  businessMemory: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'BM', section: 'Memory And Advisory', description: 'Persistent business events' },
  strategicRecommendations: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'ST', section: 'Memory And Advisory', description: 'AI strategic recommendations' },
  userManagement: { area: 'system', roles: ['owner', 'admin'], code: 'UM', section: 'Workspace', description: 'Create users, assign roles, and disable access' },
  settings: { area: 'system', roles: ['owner', 'admin'], code: 'SY', section: 'Workspace', description: 'Workspace preferences' }
}

