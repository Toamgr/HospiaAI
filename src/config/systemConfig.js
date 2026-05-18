export const STORAGE = {
  users: 'hospia.users',
  currentUser: 'hospia.currentUser',
  role: 'hospia.role',
  lang: 'hospia.lang',
  area: 'hospia.area',
  page: 'hospia.page',
  collapsed: 'hospia.sideCollapsed',
  reportArchive: 'hospia.endOfDayArchive',
  actionItems: 'hospia.actionItems',
  budgetRequests: 'hospia.budgetRequests',
  futureEvents: 'hospia.futureEvents',
  serviceIncidents: 'hospia.serviceIncidents',
  employeePerformance: 'hospia.employeePerformance',
  employeeTasks: 'hospia.employeeTasks',
  employeeRequests: 'hospia.employeeRequests',
  notifications: 'hospia.notifications',
  cocktailDrafts: 'hospia.cocktailDrafts',
  approvedCocktails: 'hospia.approvedCocktails',
  archivedCocktails: 'hospia.archivedCocktails',
  cocktailPractice: 'hospia.cocktailPractice',
  ownerNotes: 'hospia.ownerNotes',
  assignedTasks: 'hospia.assignedTasks',
  academyProgress: 'hospia.academyProgress',
  selectedAcademy: 'hospia.selectedAcademy',
  selectedLesson: 'hospia.selectedLesson'
}


export const EMAILJS = {
  serviceId: 'service_3aynt1u',
  templateId: 'template_edomb6l',
  ownerEnquiryApprovalTemplateId: 'template_owner_enquiry_approval',
  publicKey: '9_nvy4wxBfxekXdkC',
  scriptUrl: 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
}


const env = import.meta.env || {}

export const API_BASE = env.VITE_API_BASE || 'http://localhost:3001'

// TODO Phase 2 — remove this frontend code map; access validation must be server-side only.
// AUDIT FLAG — access codes removed from frontend config. Login is now validated server-side via /api/session/login.
export const ACCESS_CODES = {}

