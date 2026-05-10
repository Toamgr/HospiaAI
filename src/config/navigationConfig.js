export const NAV_GROUPS = {
  command: {
    roles: ['owner', 'admin'],
    pages: ['commandCenter']
  },
  operations: {
    roles: ['manager', 'admin'],
    pages: ['actionBoard', 'managerEmployeeRequests', 'operationalNotes', 'endOfDay', 'budgetRequest']
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
    roles: ['manager', 'admin'],
    pages: ['staffProgression']
  },
  academy: {
    roles: ['employee', 'manager', 'admin'],
    pages: ['courses', 'lessonPlayer', 'knowledgeLibrary', 'wineKnowledge', 'sopSheets', 'simulation', 'approvedCocktails']
  },
  barManagement: {
    roles: ['manager', 'admin'],
    pages: ['cocktailLab']
  },
  ownerIntelligence: {
    roles: ['owner', 'admin'],
    pages: ['executiveOverview', 'budgetApprovals', 'ownerOperationalRequests', 'weeklySummary', 'businessMRI', 'profitLeaks', 'ownerReport', 'businessMemory', 'strategicRecommendations']
  },
  system: {
    roles: ['owner', 'admin'],
    pages: ['settings']
  }
}


export const PAGE_META = {
  commandCenter: { area: 'command', roles: ['owner', 'admin'], code: 'CC', section: 'Owner Command', description: 'Strategic business intelligence homepage' },
  actionBoard: { area: 'operations', roles: ['manager', 'admin'], code: 'AB', section: 'Shift Control', description: 'Daily manager operating room' },
  managerEmployeeRequests: { area: 'operations', roles: ['manager', 'admin'], code: 'ER', section: 'Shift Control', description: 'Review operational requests submitted by employees' },
  operationalNotes: { area: 'operations', roles: ['manager', 'admin'], code: 'ON', section: 'Shift Control', description: 'Pinned notes and manager memory' },
  endOfDay: { area: 'operations', roles: ['manager', 'admin'], code: 'ED', section: 'Shift Handoff', description: 'EmailJS report and shift archive' },
  budgetRequest: { area: 'operations', roles: ['manager', 'admin'], code: 'BR', section: 'Manager Requests', description: 'Submit budget approval requests' },
  employeeHome: { area: 'employeeWorkflow', roles: ['employee', 'admin'], code: 'EH', section: 'Employee OS', description: 'Premium employee home screen' },
  employeeRequests: { area: 'employeeWorkflow', roles: ['employee', 'admin'], code: 'RQ', section: 'Employee OS', description: 'Submit operational requests to managers' },
  employeeAchievements: { area: 'employeeWorkflow', roles: ['employee', 'admin'], code: 'XP', section: 'Employee OS', description: 'Progression foundation and achievements' },
  serviceRecovery: { area: 'employeeWorkflow', roles: ['employee', 'admin'], code: 'RI', section: 'Employee OS', description: 'Report an operational guest or service issue' },
  eventOrchestrator: { area: 'planning', roles: ['manager', 'owner', 'admin'], code: 'EV', section: 'Event CRM', description: 'Future events, calculators, and pipeline' },
  staffProgression: { area: 'staffProgression', roles: ['manager', 'admin'], code: 'SP', section: 'Coaching Analytics', description: 'Training, readiness, incident exposure, and coaching flags' },
  courses: { area: 'academy', roles: ['employee', 'manager', 'admin'], code: 'CR', section: 'Course Catalog', description: 'Structured learning paths' },
  lessonPlayer: { area: 'academy', roles: ['employee', 'manager', 'admin'], code: 'LP', section: 'Course Catalog', description: 'Lesson experience and service doctrine' },
  knowledgeLibrary: { area: 'academy', roles: ['employee', 'manager', 'admin'], code: 'KL', section: 'Course Catalog', description: 'Grand Bar Atlas course module', hiddenInNav: true },
  wineKnowledge: { area: 'academy', roles: ['employee', 'manager', 'admin'], code: 'WK', section: 'Wine Academy', description: 'WSET-level wine knowledge foundation' },
  sopSheets: { area: 'academy', roles: ['employee', 'manager', 'admin'], code: 'SV', section: 'Service', description: 'Hospitality standards and service reference' },
  simulation: { area: 'academy', roles: ['manager', 'admin'], code: 'GS', section: 'Practice Lab', description: 'Guest scenarios and scoring' },
  approvedCocktails: { area: 'academy', roles: ['employee', 'manager', 'admin'], code: 'AC', section: 'Approved Bar Menu', description: 'Employee-approved cocktail training' },
  cocktailLab: { area: 'barManagement', roles: ['manager', 'admin'], code: 'CL', section: 'Cocktail Pipeline', description: 'Create and submit cocktails for approval', requiresCocktailManager: true },
  executiveOverview: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'EO', section: 'Executive View', description: 'Owner command summary' },
  budgetApprovals: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'BA', section: 'Approvals', description: 'Approve, reject, or request budget detail' },
  ownerOperationalRequests: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'ORQ', section: 'Approvals', description: 'Owner inbox for manager-approved operational requests' },
  weeklySummary: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'WS', section: 'Approvals', description: 'Weekly intelligence email panel' },
  ownerReport: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'OR', section: 'Executive View', description: 'Weekly owner report' },
  businessMRI: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'MR', section: 'Financial Intelligence', description: 'Service dimension diagnostic' },
  profitLeaks: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'PL', section: 'Financial Intelligence', description: 'Recoverable leakage map' },
  businessMemory: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'BM', section: 'Memory And Advisory', description: 'Persistent business events' },
  strategicRecommendations: { area: 'ownerIntelligence', roles: ['owner', 'admin'], code: 'ST', section: 'Memory And Advisory', description: 'AI strategic recommendations' },
  settings: { area: 'system', roles: ['owner', 'admin'], code: 'SY', section: 'Workspace', description: 'Workspace preferences' }
}

