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

export const ACCESS_CODES = {
  EMP123: 'employee',
  MNG123: 'manager',
  OWN123: 'owner'
}

