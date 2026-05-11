import React, { useEffect, useMemo, useState, useCallback } from 'react'
import PreShiftBriefing from './features/shift-brain/PreShiftBriefing'
import OperationalNotesFeature from './features/shift-brain/OperationalNotes'
import { buildSessionUser, clearSession, persistSession } from './services/authService'
import { createUser, disableUser, loadUsers, updateUser, USER_ROLES } from './services/userService'
import { requestCocktailProposal } from './services/cocktailService'
import { generateExecutiveEventSummary } from './prompts/eventPrompts'
import { STORAGE, EMAILJS, API_BASE } from './config/systemConfig'
import { NAV_GROUPS, PAGE_META } from './config/navigationConfig'
import { TEXT } from './config/textConfig'
import { allowedPagesForArea, canAccessPage, firstAllowedArea, firstAllowedPage, getRole, isAllowed, isAllowedPage } from './config/roleConfig'
import { SOP_SHEETS, SIMULATION_SCENARIOS } from './data/courses'
import { STAFF } from './data/staff'
import { ACTION_BOARD_ITEMS, PROFIT_LEAKS, BUSINESS_MEMORY } from './data/businessMemory'
import { cocktailLibrary, COCKTAIL_FILTERS, ATLAS_MASTERCLASSES, ATLAS_TECHNIQUES, ATLAS_TRAINING_CARDS, ATLAS_PROFIT_INSIGHTS } from './data/cocktails'
import { COCKTAIL_LAB_INITIAL_FORM, COCKTAIL_LAB_PROMPT_ONLY_FORM, SERVICE_CONTEXTS, COMPLEXITY_LEVELS, KOSHER_OPTIONS, MIXOLOGY_INTELLIGENCE, COCKTAIL_VARIATIONS, COCKTAIL_COMMAND_CHIPS, COCKTAIL_STRATEGIC_ITERATIONS, COCKTAIL_CONTEXT_ACTIONS } from './data/cocktailLab'
import { EVENT_TIERS, EVENT_LABOR_HOURLY_RATE, EVENT_COGS_PERCENT, INITIAL_FUTURE_EVENTS } from './data/events'
import { UNIVERSITY_MANIFEST } from './data/academy/universityManifest'
import { INITIAL_SHIFT_PROFILE, INITIAL_SUPPLY_RISKS, INITIAL_BUDGET_REQUESTS, INITIAL_SERVICE_INCIDENTS, INITIAL_EMPLOYEE_TASKS, INITIAL_NOTIFICATIONS, INITIAL_OWNER_NOTES, REQUEST_CATEGORIES, REQUEST_URGENCY, WINE_ACADEMY_SECTIONS } from './data/operations'
import {
  AlertTriangle,
  BadgePercent,
  Beer,
  Calculator,
  CalendarDays,
  ChefHat,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  GlassWater,
  Sparkles,
  Thermometer,
  Timer,
  Users,
  Utensils,
  Wine
} from 'lucide-react'

function cx(...classes) {
  return classes.filter(Boolean).join(' ')
}

function getInitialLang() {
  return 'en'
}

function getInitialUser() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE.currentUser) || 'null')
    const validRoles = ['employee', 'manager', 'bar_manager', 'owner', 'admin']
    const savedUsers = loadUsers()
    const canonical = savedUsers.find(user => user.username.toLowerCase() === saved?.username?.toLowerCase())
    if (canonical && validRoles.includes(canonical.role) && !canonical.disabled) {
      return {
        username: canonical.username,
        role: canonical.role,
        venue: canonical.venue,
        team: canonical.team,
        canManageCocktails: Boolean(canonical.canManageCocktails || canonical.role === 'admin' || canonical.role === 'bar_manager')
      }
    }
    if (saved?.username && validRoles.includes(saved.role)) {
      return {
        username: saved.username,
        role: saved.role,
        venue: saved.venue || 'Main Venue',
        team: saved.team || saved.venue || 'Main Venue',
        canManageCocktails: Boolean(saved.role === 'admin' || saved.role === 'bar_manager' || saved.canManageCocktails)
      }
    }
  } catch {
    return null
  }
  return null
}

function getInitialReportArchive() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE.reportArchive) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function getStoredArray(key, fallback = []) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null')
    return Array.isArray(saved) ? saved : fallback
  } catch {
    return fallback
  }
}

function getStoredValue(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null')
    return saved ?? fallback
  } catch {
    return fallback
  }
}

function normalizeText(value) {
  return String(value || '').toLowerCase()
}

function countBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item)
    if (!key) return acc
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}

function dominantSpirit(cocktail) {
  const text = normalizeText([
    cocktail.baseSpirit,
    cocktail.name,
    cocktail.profile,
    cocktail.guestDescription,
    cocktail.conceptStory,
    ...(cocktail.ingredients || [])
  ].join(' '))
  const spirits = ['gin', 'vodka', 'rum', 'tequila', 'mezcal', 'whisky', 'whiskey', 'bourbon', 'rye', 'brandy', 'pisco']
  const match = spirits.find(spirit => text.includes(spirit))
  if (!match) return cocktail.context === 'mocktail' ? 'zero proof' : 'unknown'
  if (['whiskey', 'bourbon', 'rye'].includes(match)) return 'whisky'
  return match
}

function cocktailStyleCategory(cocktail) {
  const text = normalizeText([
    cocktail.context,
    cocktail.profile,
    cocktail.guestDescription,
    cocktail.conceptStory,
    cocktail.method,
    ...(cocktail.ingredients || [])
  ].join(' '))
  if (text.includes('low abv') || text.includes('spritz') || text.includes('vermouth')) return 'low abv'
  if (text.includes('smok')) return 'smoked'
  if (text.includes('floral') || text.includes('violet') || text.includes('rose')) return 'floral'
  if (text.includes('bitter') || text.includes('amaro') || text.includes('campari')) return 'bitter'
  if (text.includes('herb') || text.includes('basil') || text.includes('mint') || text.includes('rosemary')) return 'herbal'
  if (text.includes('citrus') || text.includes('sour') || text.includes('lime') || text.includes('lemon')) return 'sour/citrus'
  if (text.includes('stir') || text.includes('spirit-forward')) return 'stirred spirit-forward'
  return cocktail.context || 'signature'
}

function garnishFamily(cocktail) {
  const text = normalizeText(cocktail.garnish)
  if (!text) return 'none'
  if (/(lemon|lime|orange|grapefruit|citrus|peel|twist)/.test(text)) return 'citrus'
  if (/(mint|basil|rosemary|sage|thyme|herb)/.test(text)) return 'herbal'
  if (/(berry|cherry|peach|apple|pineapple|fruit)/.test(text)) return 'fruit'
  if (/(flower|rose|violet|lavender|floral)/.test(text)) return 'floral'
  if (/(salt|rim|spice|pepper|cinnamon)/.test(text)) return 'spice/salt'
  return 'bespoke garnish'
}

function analyzeCurrentMenuBalance(approvedCocktails = []) {
  const baseSpiritCounts = countBy(approvedCocktails, dominantSpirit)
  const styleCounts = countBy(approvedCocktails, cocktailStyleCategory)
  const garnishCounts = countBy(approvedCocktails, garnishFamily)
  const citrusLed = approvedCocktails.filter(item => cocktailStyleCategory(item) === 'sour/citrus').length
  const premiumHighCost = approvedCocktails.filter(item => Number(item.targetCogs || 0) >= 28 || Number(item.targetPrice || 0) >= 78 || normalizeText(item.context).includes('premium')).length
  const warnings = []

  Object.entries(baseSpiritCounts).forEach(([spirit, count]) => {
    if (spirit !== 'unknown' && count >= 2) warnings.push(`Warning: there are already ${count} approved ${spirit}-forward signatures. Consider diversifying the base spirit.`)
  })
  if (citrusLed >= 3) warnings.push(`Warning: there are already ${citrusLed} citrus-led or sour-profile drinks. Consider a stirred, bitter, smoked, or lower-acid build.`)
  if (premiumHighCost >= 2) warnings.push(`Warning: ${premiumHighCost} approved cocktails already sit in premium/high-cost territory. Protect margin with simpler garnish or lower-cost modifiers.`)
  Object.entries(garnishCounts).forEach(([family, count]) => {
    if (family !== 'none' && count >= 3) warnings.push(`Warning: ${count} approved cocktails already use ${family} garnish language. Vary the final visual cue.`)
  })
  Object.entries(styleCounts).forEach(([style, count]) => {
    if (count >= 3) warnings.push(`Warning: the menu has ${count} ${style} drinks. A new cocktail should create contrast, not echo the same signature style.`)
  })

  const requiredSpirits = ['gin', 'vodka', 'rum', 'tequila', 'mezcal', 'whisky', 'brandy']
  const missingSpiritCategories = requiredSpirits.filter(spirit => !baseSpiritCounts[spirit])
  const gapProfiles = ['bitter', 'smoked', 'herbal', 'low abv', 'floral', 'stirred spirit-forward'].filter(style => !styleCounts[style])
  const menuGapNotes = [
    ...missingSpiritCategories.slice(0, 4).map(spirit => `Current menu lacks a clear ${spirit}-forward option.`),
    ...gapProfiles.slice(0, 4).map(style => `Current menu lacks a ${style} profile.`)
  ]

  return {
    total: approvedCocktails.length,
    baseSpiritCounts,
    styleCounts,
    garnishCounts,
    citrusLed,
    premiumHighCost,
    missingSpiritCategories,
    gapProfiles,
    warnings,
    menuGapNotes
  }
}

function shouldGenerateEventTasks(status) {
  return ['approved', 'operational planning'].includes(normalizeText(status))
}

function generateEmployeeTasksForEvent(eventPlan) {
  if (!shouldGenerateEventTasks(eventPlan.status)) return []
  const guests = Math.max(1, Number(eventPlan.guests || eventPlan.config?.guests || 1))
  const eventType = eventPlan.eventType || eventPlan.config?.eventType || 'Business Event'
  const eventName = eventPlan.name || `${eventType} Event`
  const dueDate = eventPlan.eventDate || eventPlan.config?.eventDate || new Date().toISOString().slice(0, 10)
  const welcomeCocktails = Math.ceil(guests * 1.05)
  const glassware = Math.ceil(guests * 1.35)
  const base = [
    { title: `Prepare ${welcomeCocktails} welcome cocktails for ${eventName}`, department: 'Bar', assignedRole: 'Bar Team', priority: guests >= 180 ? 'urgent' : 'high' },
    { title: `Prep garnish trays for ${eventName} welcome service`, department: 'Bar', assignedRole: 'Bartender', priority: 'high' },
    { title: `Polish and stage ${glassware} premium glasses for ${eventName}`, department: 'Floor', assignedRole: 'Server', priority: 'high' },
    { title: `Confirm supplier and ice readiness for ${eventName}`, department: 'Operations', assignedRole: 'Shift Lead', priority: guests >= 150 ? 'urgent' : 'high' }
  ]
  const typeTasks = {
    'Business Event': [
      { title: `Prepare AV-adjacent water and coffee reset for ${eventName}`, department: 'Floor', assignedRole: 'Server', priority: 'normal' },
      { title: `Confirm VIP speaker table setup for ${eventName}`, department: 'Floor', assignedRole: 'Captain', priority: 'high' }
    ],
    Birthday: [
      { title: `Prepare birthday dessert moment and candle protocol for ${eventName}`, department: 'Kitchen', assignedRole: 'Pastry / Runner', priority: 'high' },
      { title: `Stage celebration tray and photo-friendly service path for ${eventName}`, department: 'Floor', assignedRole: 'Server', priority: 'normal' }
    ],
    Wedding: [
      { title: `Prepare VIP family table setup for ${eventName}`, department: 'Floor', assignedRole: 'Captain', priority: 'urgent' },
      { title: `Confirm kosher wine, vegan safety net, and allergy labels for ${eventName}`, department: 'Kitchen', assignedRole: 'Shift Lead', priority: 'urgent' }
    ],
    'Boutique Hotel Retreat': [
      { title: `Prepare retreat amenity station for ${eventName}`, department: 'Rooms / F&B', assignedRole: 'Server', priority: 'high' },
      { title: `Stage low-ABV afternoon refreshment service for ${eventName}`, department: 'Bar', assignedRole: 'Bar Team', priority: 'normal' }
    ]
  }

  return [...base, ...(typeTasks[eventType] || [])].map((task, index) => ({
    id: `event-task-${eventPlan.id}-${index}`,
    ...task,
    dueDate,
    linkedEventName: eventName,
    eventId: eventPlan.id,
    status: 'pending',
    created_at: new Date().toISOString()
  }))
}

function localize(value, lang) {
  if (typeof value === 'string') return value
  return value?.[lang] || value?.en || ''
}

function getVisibleAcademies(userOrRole) {
  const role = getRole(userOrRole)
  return UNIVERSITY_MANIFEST.filter(academy => {
    if (role === 'admin') return true
    return academy.roles?.includes(role)
  })
}

function getLessonKey(academyId, lessonId) {
  return `${academyId}:${lessonId}`
}

function getUserLessonProgress(academyProgress = {}, currentUser) {
  if (!currentUser?.username) return {}
  return academyProgress[currentUser.username] || {}
}

function isLessonComplete(completedLessons = {}, academyId, lessonId) {
  const value = completedLessons[getLessonKey(academyId, lessonId)]
  return Boolean(value?.completed || value === true)
}

function isLessonUnlocked(academy, lessonIndex, completedLessons = {}) {
  if (lessonIndex === 0) return true
  const previousLesson = academy.lessons?.[lessonIndex - 1]
  return Boolean(previousLesson && isLessonComplete(completedLessons, academy.id, previousLesson.id))
}

function countCompletedLessons(completedLessons = {}) {
  return Object.values(completedLessons).filter(value => value?.completed || value === true).length
}

function countUniversityLessons(academies = UNIVERSITY_MANIFEST) {
  return academies.reduce((sum, academy) => sum + (academy.lessons?.length || 0), 0)
}

function lessonHasExpandedContent(lesson) {
  return [
    'objective',
    'doctrine',
    'technical_depth',
    'standards',
    'terminology',
    'taxonomy',
    'operational_consequences',
    'amateur_vs_pro',
    'common_failures',
    'recovery_logic',
    'professional_standard',
    'real_service_context',
    'practical_execution',
    'guest_application',
    'manager_notes',
    'drill',
    'assessment_questions'
  ].some(field => {
    const value = lesson?.[field]
    return Array.isArray(value) ? value.length : Boolean(value)
  })
}

function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) {
      window.emailjs.init(EMAILJS.publicKey)
      resolve(window.emailjs)
      return
    }

    const existing = document.querySelector(`script[src="${EMAILJS.scriptUrl}"]`)
    if (existing) {
      existing.addEventListener('load', () => {
        window.emailjs.init(EMAILJS.publicKey)
        resolve(window.emailjs)
      })
      existing.addEventListener('error', () => reject(new Error('EmailJS failed to load')))
      return
    }

    const script = document.createElement('script')
    script.src = EMAILJS.scriptUrl
    script.async = true
    script.onload = () => {
      window.emailjs.init(EMAILJS.publicKey)
      resolve(window.emailjs)
    }
    script.onerror = () => reject(new Error('EmailJS failed to load'))
    document.body.appendChild(script)
  })
}

async function sendOwnerEnquiryApprovalEmail(eventPlan) {
  const emailjs = await loadEmailJS()
  const payload = {
    event_summary: generateExecutiveEventSummary(eventPlan),
    status: eventPlan.status || 'ENQUIRY_APPROVED',
    owner_name: 'Tal Millo',
    subject: 'HOSPIA AI \u2014 New Event Enquiry Requires Owner Approval'
  }

  console.log("OWNER ENQUIRY EMAIL PAYLOAD", payload)

  return emailjs.send(
    EMAILJS.serviceId,
    EMAILJS.ownerEnquiryApprovalTemplateId,
    payload,
    EMAILJS.publicKey
  )
}

async function apiRequest(path, { method = 'GET', role, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(role ? { 'X-HOSPIA-Role': role } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.error || `API request failed: ${response.status}`)
  }
  return data
}

export default function App() {
  const [lang, setLang] = useState('en')
  const t = TEXT.en

  const [currentUser, setCurrentUser] = useState(getInitialUser)
  const role = currentUser?.role || ''
  const [users, setUsers] = useState(loadUsers)
  const [area, setAreaState] = useState(() => localStorage.getItem(STORAGE.area) || firstAllowedArea(getInitialUser() || 'employee'))
  const [page, setPageState] = useState(() => localStorage.getItem(STORAGE.page) || firstAllowedPage(getInitialUser() || 'employee'))
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE.collapsed)
    if (saved !== null) return saved === 'true'
    return window.innerWidth < 1024
  })
  const [showNotifications, setShowNotifications] = useState(false)
  const [reportArchive, setReportArchive] = useState(getInitialReportArchive)
  const [eventPlans, setEventPlans] = useState(() => getStoredArray(STORAGE.futureEvents, INITIAL_FUTURE_EVENTS))
  const [businessMemory, setBusinessMemory] = useState(() => getStoredArray('hospia.businessMemory', BUSINESS_MEMORY))
  const [actionItems, setActionItems] = useState(() => getStoredArray(STORAGE.actionItems, ACTION_BOARD_ITEMS))
  const [budgetRequests, setBudgetRequests] = useState(() => getStoredArray(STORAGE.budgetRequests, INITIAL_BUDGET_REQUESTS))
  const [serviceIncidents, setServiceIncidents] = useState(() => getStoredArray(STORAGE.serviceIncidents, INITIAL_SERVICE_INCIDENTS))
  const [employeePerformance, setEmployeePerformance] = useState(() => getStoredValue(STORAGE.employeePerformance, {}))
  const [employeeTasks, setEmployeeTasks] = useState(() => getStoredArray(STORAGE.employeeTasks, INITIAL_EMPLOYEE_TASKS))
  const [employeeRequests, setEmployeeRequests] = useState(() => getStoredArray(STORAGE.employeeRequests, []))
  const [notifications, setNotifications] = useState(() => getStoredArray(STORAGE.notifications, INITIAL_NOTIFICATIONS))
  const [cocktailDrafts, setCocktailDrafts] = useState(() => getStoredArray(STORAGE.cocktailDrafts, []))
  const [approvedCocktails, setApprovedCocktails] = useState(() => getStoredArray(STORAGE.approvedCocktails, []))
  const [archivedCocktails, setArchivedCocktails] = useState(() => getStoredArray(STORAGE.archivedCocktails, []))
  const [cocktailPractice, setCocktailPractice] = useState(() => getStoredValue(STORAGE.cocktailPractice, {}))
  const [academyProgress, setAcademyProgress] = useState(() => getStoredValue(STORAGE.academyProgress, {}))
  const [selectedAcademyId, setSelectedAcademyId] = useState(() => localStorage.getItem(STORAGE.selectedAcademy) || UNIVERSITY_MANIFEST[0]?.id || '')
  const [selectedLessonId, setSelectedLessonId] = useState(() => localStorage.getItem(STORAGE.selectedLesson) || UNIVERSITY_MANIFEST[0]?.lessons?.[0]?.id || '')
  const [ownerNotes, setOwnerNotes] = useState(() => getStoredArray(STORAGE.ownerNotes, INITIAL_OWNER_NOTES))

  useEffect(() => {
    localStorage.setItem(STORAGE.lang, 'en')
    document.documentElement.lang = 'en'
    document.documentElement.dir = 'ltr'
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE.users, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem(STORAGE.collapsed, String(collapsed))
  }, [collapsed])

  useEffect(() => {
    const pairs = [
      [STORAGE.reportArchive, reportArchive],
      [STORAGE.futureEvents, eventPlans],
      ['hospia.businessMemory', businessMemory],
      [STORAGE.actionItems, actionItems],
      [STORAGE.budgetRequests, budgetRequests],
      [STORAGE.serviceIncidents, serviceIncidents],
      [STORAGE.employeePerformance, employeePerformance],
      [STORAGE.employeeTasks, employeeTasks],
      [STORAGE.employeeRequests, employeeRequests],
      [STORAGE.notifications, notifications],
      [STORAGE.cocktailDrafts, cocktailDrafts],
      [STORAGE.approvedCocktails, approvedCocktails],
      [STORAGE.archivedCocktails, archivedCocktails],
      [STORAGE.cocktailPractice, cocktailPractice],
      [STORAGE.academyProgress, academyProgress],
      [STORAGE.ownerNotes, ownerNotes]
    ]

    pairs.forEach(([key, value]) => localStorage.setItem(key, JSON.stringify(value)))
  }, [academyProgress, actionItems, approvedCocktails, archivedCocktails, budgetRequests, businessMemory, cocktailDrafts, cocktailPractice, employeePerformance, employeeRequests, employeeTasks, eventPlans, notifications, ownerNotes, reportArchive, serviceIncidents])

  useEffect(() => {
    let active = true
    if (!['manager', 'bar_manager', 'owner', 'admin'].includes(role)) return undefined

    const syncRole = ['manager', 'bar_manager', 'admin'].includes(role) ? role : 'manager'

    const requests = [
      apiRequest('/api/shift-reports', { role }),
      apiRequest('/api/event-plans', { role }),
      apiRequest('/api/business-memory', { role })
    ]

    if (['manager', 'bar_manager', 'admin'].includes(role)) {
      requests.push(apiRequest('/api/actions', { role: syncRole }))
    } else {
      requests.push(Promise.resolve(null))
    }

    Promise.allSettled(requests)
      .then(([reportsResult, plansResult, memoryResult, actionsResult]) => {
        if (!active) return
        if (reportsResult.status === 'fulfilled' && Array.isArray(reportsResult.value.reports)) {
          setReportArchive(reportsResult.value.reports)
        }
        if (plansResult.status === 'fulfilled' && Array.isArray(plansResult.value.eventPlans) && plansResult.value.eventPlans.length) {
          setEventPlans(prev => [...plansResult.value.eventPlans, ...prev].slice(0, 80))
        }
        if (memoryResult.status === 'fulfilled' && Array.isArray(memoryResult.value.memory)) {
          setBusinessMemory(memoryResult.value.memory)
        }
        if (actionsResult?.status === 'fulfilled' && Array.isArray(actionsResult.value?.actions) && actionsResult.value.actions.length) {
          const backendActions = actionsResult.value.actions.map(a => ({
            ...a,
            status: a.done ? 'Completed' : (a.status || 'New'),
            priority: a.priority || 'Medium',
            comments: a.comments || []
          }))
          setActionItems(prev => {
            const merged = [...backendActions]
            prev.forEach(local => {
              if (!merged.some(b => b.id === local.id)) merged.push(local)
            })
            return merged
          })
        }
      })
      .catch(error => {
        console.warn('HOSPIA backend archive APIs unavailable; using local data.', error)
      })

    return () => {
      active = false
    }
  }, [role])

  useEffect(() => {
    if (!currentUser) return

    if (!isAllowed(currentUser, area, page)) {
      const nextArea = firstAllowedArea(currentUser)
      const nextPage = firstAllowedPage(currentUser, nextArea)
      setAreaState(nextArea)
      setPageState(nextPage)
      localStorage.setItem(STORAGE.area, nextArea)
      localStorage.setItem(STORAGE.page, nextPage)
    }
  }, [currentUser, area, page])

  const visibleNotifications = useMemo(() => (
    notifications.filter(item => role === 'admin' || item.roles?.includes(role))
  ), [notifications, role])

  const unreadCount = visibleNotifications.filter(item => !item.readBy?.includes(currentUser?.username)).length

  const pushNotification = useCallback(notification => {
    const next = {
      id: notification.id || `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      roles: notification.roles || ['admin'],
      title: notification.title,
      body: notification.body,
      type: notification.type || 'system',
      page: notification.page,
      readBy: [],
      created_at: new Date().toISOString()
    }
    setNotifications(prev => [next, ...prev].slice(0, 120))
    return next
  }, [])

  const markNotificationsRead = useCallback(() => {
    if (!currentUser) return
    setNotifications(prev => prev.map(item => (
      item.roles?.includes(role) || role === 'admin'
        ? { ...item, readBy: Array.from(new Set([...(item.readBy || []), currentUser.username])) }
        : item
    )))
  }, [currentUser, role])

  const handleCreateUser = useCallback(payload => {
    if (!['owner', 'admin'].includes(currentUser?.role)) throw new Error('Only an owner or admin can create users.')
    const result = createUser(users, payload)
    setUsers(result.users)
    pushNotification({
      roles: ['owner', 'admin'],
      title: 'User created',
      body: `${result.user.username} was added as ${result.user.role}.`,
      type: 'user',
      page: 'userManagement'
    })
    return result.user
  }, [currentUser?.role, pushNotification, users])

  const handleUpdateUser = useCallback((username, updates) => {
    if (!['owner', 'admin'].includes(currentUser?.role)) throw new Error('Only an owner or admin can edit users.')
    const result = updateUser(users, username, updates)
    setUsers(result.users)
    if (currentUser?.username === username) {
      const refreshed = {
        username: result.user.username,
        role: result.user.role,
        venue: result.user.venue,
        team: result.user.team,
        canManageCocktails: Boolean(result.user.canManageCocktails || result.user.role === 'admin' || result.user.role === 'bar_manager')
      }
      setCurrentUser(refreshed)
      persistSession(refreshed)
    }
    return result.user
  }, [currentUser, users])

  const handleDisableUser = useCallback(username => {
    if (!['owner', 'admin'].includes(currentUser?.role)) throw new Error('Only an owner or admin can disable users.')
    const result = disableUser(users, username)
    setUsers(result.users)
    if (currentUser?.username === username) logout()
    return result.user
  }, [currentUser?.role, currentUser?.username, users])

  async function login({ username, password }) {
    const user = buildSessionUser(users, username, password)
    const nextArea = firstAllowedArea(user)
    const nextPage = firstAllowedPage(user, nextArea)

    setCurrentUser(user)
    setAreaState(nextArea)
    setPageState(nextPage)

    persistSession(user)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
  }

  function logout() {
    clearSession()
    setCurrentUser(null)
  }

  function goToArea(nextArea) {
    if (!currentUser || !allowedPagesForArea(currentUser, nextArea).length) return
    const nextPage = firstAllowedPage(currentUser, nextArea)
    setAreaState(nextArea)
    setPageState(nextPage)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
  }

  function goToPage(nextPage) {
    if (!currentUser || !isAllowedPage(currentUser, nextPage)) return
    const nextArea = PAGE_META[nextPage].area
    setAreaState(nextArea)
    setPageState(nextPage)
    localStorage.setItem(STORAGE.area, nextArea)
    localStorage.setItem(STORAGE.page, nextPage)
  }

  const openUniversityLesson = useCallback((academyId, lessonId) => {
    if (!currentUser) return
    const visibleAcademies = getVisibleAcademies(currentUser)
    const academy = visibleAcademies.find(item => item.id === academyId)
    const lesson = academy?.lessons?.find(item => item.id === lessonId)
    if (!academy || !lesson) return

    setSelectedAcademyId(academyId)
    setSelectedLessonId(lessonId)
    localStorage.setItem(STORAGE.selectedAcademy, academyId)
    localStorage.setItem(STORAGE.selectedLesson, lessonId)
    goToPage('lessonPlayer')
  }, [currentUser, goToPage])

  const completeUniversityLesson = useCallback((academyId, lessonId) => {
    if (!currentUser?.username) return
    const key = getLessonKey(academyId, lessonId)
    setAcademyProgress(prev => ({
      ...prev,
      [currentUser.username]: {
        ...(prev[currentUser.username] || {}),
        [key]: {
          completed: true,
          completed_at: new Date().toISOString()
        }
      }
    }))
  }, [currentUser?.username])

  const addBusinessMemoryEvent = useCallback(event => {
    const memoryEvent = {
      id: event.id || `memory-${Date.now()}`,
      date: event.date || new Date().toISOString().slice(0, 10),
      type: event.type || 'note',
      title: event.title,
      detail: event.detail
    }
    setBusinessMemory(prev => [memoryEvent, ...prev].slice(0, 100))
    return memoryEvent
  }, [])

  const archiveEndOfDayReport = useCallback(async report => {
    const archived = {
      ...report,
      id: report.id || `eod-local-${Date.now()}`,
      submitted_at: new Date().toISOString()
    }

    setReportArchive(prev => [archived, ...prev].slice(0, 50))

    if (archived.urgent_items?.trim()) {
      const urgentAction = {
        id: `eod-action-${archived.id}`,
        priority: 'urgent',
        title: `Resolve EOD urgent item: ${archived.urgent_items.trim().slice(0, 96)}`,
        owner: archived.manager_name || currentUser?.username || 'Closing Manager',
        due: 'Next shift',
        signal: `Created from End Of Day report on ${archived.shift_date || new Date().toISOString().slice(0, 10)}`,
        page: 'endOfDay',
        done: false
      }
      setActionItems(prev => [urgentAction, ...prev.filter(item => item.id !== urgentAction.id)].slice(0, 80))
      pushNotification({ roles: ['manager', 'admin'], title: 'Urgent EOD action created', body: urgentAction.title, type: 'action', page: 'actionBoard' })
    }

    return archived
  }, [currentUser?.username, pushNotification])

  const submitServiceIncident = useCallback(incident => {
    const now = new Date()
    const saved = {
      ...incident,
      id: `incident-${Date.now()}`,
      employeeName: currentUser?.username || incident.employeeName || 'Employee',
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: now.toISOString()
    }

    setServiceIncidents(prev => [saved, ...prev].slice(0, 120))
    setEmployeePerformance(prev => {
      const existing = prev[saved.employeeName] || { incidentCount: 0, categories: {}, unresolved: 0 }
      return {
        ...prev,
        [saved.employeeName]: {
          incidentCount: existing.incidentCount + 1,
          categories: { ...existing.categories, [saved.issueType]: (existing.categories[saved.issueType] || 0) + 1 },
          unresolved: existing.unresolved + (saved.resolved ? 0 : 1)
        }
      }
    })
    addBusinessMemoryEvent({
      type: saved.resolved ? 'note' : 'alert',
      title: `Service incident reported by ${saved.employeeName}`,
      detail: `${saved.issueType} at ${saved.guestTable}. ${saved.description}`
    })
    setActionItems(prev => saved.resolved ? prev : [{
      id: `incident-action-${saved.id}`,
      priority: saved.severity === 'high' ? 'urgent' : 'high',
      title: `Resolve service incident: ${saved.issueType} - ${saved.guestTable}`,
      owner: 'Manager',
      due: 'Live service',
      signal: `${saved.employeeName}: ${saved.description}`,
      page: 'actionBoard',
      done: false
    }, ...prev].slice(0, 80))
    pushNotification({ roles: ['manager', 'admin'], title: 'New service incident', body: `${saved.employeeName} reported ${saved.issueType} at ${saved.guestTable}.`, type: 'incident', page: 'actionBoard' })
    return saved
  }, [addBusinessMemoryEvent, currentUser?.role, currentUser?.username, pushNotification])

  const updateIncident = useCallback((incidentId, patch) => {
    setServiceIncidents(prev => prev.map(item => item.id === incidentId ? { ...item, ...patch } : item))
  }, [])

  const submitEmployeeRequest = useCallback(request => {
    const saved = {
      ...request,
      id: `employee-request-${Date.now()}`,
      submittedBy: currentUser?.username || request.submittedBy || 'Employee',
      estimatedCost: Number(request.estimatedCost) || 0,
      status: 'pending_manager_review',
      created_at: new Date().toISOString()
    }
    setEmployeeRequests(prev => [saved, ...prev].slice(0, 120))
    pushNotification({
      roles: ['manager', 'admin'],
      title: 'Employee request pending review',
      body: `${saved.submittedBy}: ${saved.title}`,
      type: 'employee-request',
      page: 'managerEmployeeRequests'
    })
    return saved
  }, [currentUser?.username, pushNotification])

  const managerReviewEmployeeRequest = useCallback((requestId, decision, managerNote = '') => {
    let updated
    const status = decision === 'approve' ? 'pending_owner_review' : 'rejected_by_manager'
    setEmployeeRequests(prev => prev.map(item => {
      if (item.id !== requestId) return item
      updated = {
        ...item,
        status,
        managerDecision: decision === 'approve' ? 'approved_by_manager' : 'rejected_by_manager',
        managerNote,
        managerReviewedBy: currentUser?.username || 'Manager',
        managerReviewedAt: new Date().toISOString()
      }
      return updated
    }))
    if (updated) {
      if (decision === 'approve') {
        pushNotification({
          roles: ['owner', 'admin'],
          title: 'Operational request needs owner review',
          body: `${updated.title} was approved by manager and forwarded.`,
          type: 'employee-request',
          page: 'ownerOperationalRequests'
        })
      }
      pushNotification({
        roles: ['employee', 'admin'],
        title: decision === 'approve' ? 'Request approved by manager' : 'Request rejected by manager',
        body: `${updated.title}: ${managerNote || status}`,
        type: 'employee-request',
        page: 'employeeRequests'
      })
    }
    return updated
  }, [currentUser?.username, pushNotification])

  const ownerReviewEmployeeRequest = useCallback((requestId, decision, ownerNote = '') => {
    let updated
    const status = decision === 'approve' ? 'approved_by_owner' : 'rejected_by_owner'
    setEmployeeRequests(prev => prev.map(item => {
      if (item.id !== requestId) return item
      updated = {
        ...item,
        status,
        ownerNote,
        ownerReviewedBy: currentUser?.username || 'Owner',
        ownerReviewedAt: new Date().toISOString()
      }
      return updated
    }))
    if (updated) {
      pushNotification({
        roles: ['manager', 'admin'],
        title: decision === 'approve' ? 'Owner approved operational request' : 'Owner rejected operational request',
        body: `${updated.title}: ${ownerNote || status}`,
        type: 'employee-request',
        page: 'managerEmployeeRequests'
      })
      pushNotification({
        roles: ['employee', 'admin'],
        title: decision === 'approve' ? 'Operational request approved' : 'Operational request rejected',
        body: `${updated.title}: ${ownerNote || status}`,
        type: 'employee-request',
        page: 'employeeRequests'
      })
    }
    return updated
  }, [currentUser?.username, pushNotification])

  const submitBudgetRequest = useCallback(request => {
    const saved = {
      ...request,
      id: `budget-${Date.now()}`,
      managerName: currentUser?.username || 'Manager',
      amount: Number(request.amount) || 0,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    setBudgetRequests(prev => [saved, ...prev].slice(0, 80))
    pushNotification({ roles: ['owner', 'admin'], title: 'New budget request', body: `${saved.managerName} requested ${formatMoney(saved.amount)} for ${saved.department}.`, type: 'budget', page: 'budgetApprovals' })
    return saved
  }, [currentUser?.username, pushNotification])

  const respondBudgetRequest = useCallback((requestId, status, responseNote = '') => {
    let updated
    setBudgetRequests(prev => prev.map(item => {
      if (item.id !== requestId) return item
      updated = { ...item, status, responseNote, responded_at: new Date().toISOString(), respondedBy: currentUser?.username || 'Owner' }
      return updated
    }))
    if (updated) {
      pushNotification({ roles: ['manager', 'admin'], title: `Budget ${status}`, body: `${updated.title}: ${responseNote || status}`, type: 'budget', page: 'actionBoard' })
    }
  }, [currentUser?.username, pushNotification])

  const saveEventPlan = useCallback(async ({ name, config, calculations }) => {
    const isManagerEnquiry = currentUser?.role === 'manager' && config.eventStatus === 'Inquiry'
    const eventStatus = isManagerEnquiry ? 'ENQUIRY_PENDING_OWNER_APPROVAL' : config.eventStatus
    const persistedConfig = {
      ...config,
      eventStatus
    }
    const eventPlan = {
      id: `event-${Date.now()}`,
      name,
      eventType: persistedConfig.eventType,
      eventDate: persistedConfig.eventDate,
      contactPerson: persistedConfig.contactPerson,
      phone: persistedConfig.phone,
      budget: Number(config.eventBudget) || calculations.revenue || 0,
      summary: persistedConfig.eventSummary,
      guests: calculations.guests,
      fnbBreakdown: persistedConfig.fnbBreakdown,
      specialRequests: persistedConfig.specialRequests,
      staffingNotes: persistedConfig.staffingNotes,
      status: eventStatus,
      config: persistedConfig,
      calculations,
      projected_revenue: calculations.revenue || Number(config.eventBudget) || 0,
      projected_profit: calculations.grossProfit || 0,
      projected_margin: calculations.margin || 0,
      created_at: new Date().toISOString()
    }
    setEventPlans(prev => [eventPlan, ...prev.filter(item => item.id !== eventPlan.id)].slice(0, 80))
    const generatedTasks = generateEmployeeTasksForEvent(eventPlan)
    if (generatedTasks.length) {
      setEmployeeTasks(prev => [...generatedTasks, ...prev.filter(item => item.eventId !== eventPlan.id)].slice(0, 160))
      setActionItems(prev => [{
        id: `event-task-action-${eventPlan.id}`,
        priority: generatedTasks.some(task => task.priority === 'urgent') ? 'urgent' : 'high',
        title: `Monitor ${generatedTasks.length} employee event tasks for ${eventPlan.name}`,
        owner: currentUser?.username || 'Manager',
        due: eventPlan.eventDate || 'Event date',
        signal: `Auto-generated because ${eventPlan.name} moved to ${eventPlan.status}.`,
        page: 'actionBoard',
        done: false
      }, ...prev.filter(item => item.id !== `event-task-action-${eventPlan.id}`)].slice(0, 80))
      pushNotification({ roles: ['employee', 'admin'], title: 'Tasks assigned', body: `${generatedTasks.length} assigned tasks were created for ${eventPlan.name}.`, type: 'event-task', page: 'employeeHome' })
      pushNotification({ roles: ['manager', 'admin'], title: 'Event task package created', body: `${generatedTasks.length} employee tasks are open for ${eventPlan.name}.`, type: 'event-task', page: 'actionBoard' })
    }
    addBusinessMemoryEvent({
      type: 'event',
      title: `Future event saved: ${eventPlan.name}`,
      detail: `${eventPlan.eventDate || 'Date pending'} - ${eventPlan.guests} guests - ${formatMoney(eventPlan.projected_revenue)} projected revenue.${generatedTasks.length ? ` ${generatedTasks.length} employee tasks generated.` : ''}`
    })
    if (eventStatus === 'ENQUIRY_PENDING_OWNER_APPROVAL') {
      pushNotification({
        roles: ['owner', 'admin'],
        title: 'New Event Enquiry Pending Approval',
        body: `${eventPlan.name} on ${eventPlan.eventDate || 'date pending'} for ${eventPlan.guests} guests requires owner approval.`,
        type: 'event-approval',
        page: 'commandCenter'
      })
    } else {
      pushNotification({ roles: ['owner', 'admin'], title: 'New future event saved', body: `${eventPlan.name} added to the event revenue pipeline.`, type: 'event', page: 'commandCenter' })
    }
    return eventPlan
  }, [addBusinessMemoryEvent, currentUser?.role, currentUser?.username, pushNotification])

  const approveEventEnquiry = useCallback(async eventId => {
    const target = eventPlans.find(item => item.id === eventId)
    if (!target || !['owner', 'admin'].includes(currentUser?.role)) {
      return { ok: false, emailSent: false, message: 'Event enquiry approval is restricted to owner and admin.' }
    }

    const approved = {
      ...target,
      status: 'ENQUIRY_APPROVED',
      config: {
        ...(target.config || {}),
        eventStatus: 'ENQUIRY_APPROVED'
      },
      approvedBy: currentUser?.username || 'Owner',
      approved_at: new Date().toISOString()
    }

    setEventPlans(prev => prev.map(item => item.id === eventId ? approved : item))
    addBusinessMemoryEvent({
      type: 'event',
      title: `Event enquiry approved: ${approved.name}`,
      detail: `${approved.name} moved to ENQUIRY_APPROVED by ${approved.approvedBy}. Estimated revenue: ${formatMoney(approved.projected_revenue || approved.budget || 0)}.`
    })
    pushNotification({
      roles: ['manager', 'admin'],
      title: 'Event enquiry approved',
      body: `${approved.name} was approved by ${approved.approvedBy}.`,
      type: 'event-approval',
      page: 'eventOrchestrator'
    })

    try {
      await sendOwnerEnquiryApprovalEmail(approved)
      return { ok: true, emailSent: true, event: approved, message: `${approved.name} approved and owner email briefing sent.` }
    } catch (error) {
      console.warn('Event approval email failed:', error)
      return { ok: true, emailSent: false, event: approved, message: 'Event approved, but owner email could not be sent.' }
    }
  }, [addBusinessMemoryEvent, currentUser?.role, currentUser?.username, eventPlans, pushNotification])

  const saveCocktailDraft = useCallback(cocktail => {
    if (!cocktail || typeof cocktail !== 'object') {
      throw new Error('No complete cocktail proposal was generated to save.')
    }
    const draft = {
      ...cocktail,
      id: cocktail.id || `cocktail-draft-${Date.now()}`,
      status: 'draft',
      createdBy: currentUser?.username || 'Bar Manager',
      created_at: cocktail.created_at || new Date().toISOString()
    }
    setCocktailDrafts(prev => [draft, ...prev.filter(item => item.id !== draft.id)].slice(0, 50))
    return draft
  }, [currentUser?.username])

  const submitCocktailForApproval = useCallback(cocktail => {
    const awaiting = {
      ...cocktail,
      id: cocktail.id || `cocktail-awaiting-${Date.now()}`,
      status: 'awaitingApproval',
      createdBy: cocktail.createdBy || currentUser?.username || 'Bar Manager',
      submitted_at: new Date().toISOString()
    }
    setCocktailDrafts(prev => [awaiting, ...prev.filter(item => item.id !== awaiting.id)].slice(0, 50))
    pushNotification({ roles: ['admin'], title: 'Cocktail awaiting approval', body: `${awaiting.name} is ready for approval review.`, type: 'cocktail', page: 'cocktailLab' })
    return awaiting
  }, [currentUser?.username, pushNotification])

  const approveCocktail = useCallback(cocktail => {
    const approved = {
      ...cocktail,
      id: cocktail.id || `cocktail-approved-${Date.now()}`,
      status: 'approved',
      approved_at: new Date().toISOString()
    }
    setApprovedCocktails(prev => [approved, ...prev.filter(item => item.id !== approved.id)].slice(0, 80))
    setCocktailDrafts(prev => prev.filter(item => item.id !== approved.id))
    addBusinessMemoryEvent({
      type: 'note',
      title: `Cocktail approved: ${approved.name}`,
      detail: `${approved.name} is now visible inside employee Approved Cocktails Library.`
    })
    pushNotification({ roles: ['employee', 'manager', 'admin'], title: 'New approved cocktail', body: `${approved.name} is now available for bar menu training.`, type: 'cocktail', page: 'approvedCocktails' })
    return approved
  }, [addBusinessMemoryEvent, pushNotification])

  const archiveCocktail = useCallback(cocktailInput => {
    if (cocktailInput && typeof cocktailInput === 'object') {
      setCocktailDrafts(prev => prev.filter(item => item.id !== cocktailInput.id))
      setApprovedCocktails(prev => prev.filter(item => item.id !== cocktailInput.id))
      setArchivedCocktails(prev => [{
        ...cocktailInput,
        id: cocktailInput.id || `cocktail-archived-${Date.now()}`,
        status: 'archived',
        archived_at: new Date().toISOString()
      }, ...prev].slice(0, 80))
      return
    }

    const cocktailId = cocktailInput
    setApprovedCocktails(prev => prev.filter(item => item.id !== cocktailId))
    setCocktailDrafts(prev => {
      const target = prev.find(item => item.id === cocktailId)
      if (target) setArchivedCocktails(old => [{ ...target, status: 'archived', archived_at: new Date().toISOString() }, ...old].slice(0, 80))
      return prev.filter(item => item.id !== cocktailId)
    })
  }, [])

  const markCocktailPracticed = useCallback((cocktailId, employeeName = currentUser?.username) => {
    if (!cocktailId || !employeeName) return
    setCocktailPractice(prev => ({
      ...prev,
      [employeeName]: {
        ...(prev[employeeName] || {}),
        [cocktailId]: {
          practiced: true,
          practiced_at: new Date().toISOString()
        }
      }
    }))
  }, [currentUser?.username])

  const updateEmployeeTask = useCallback((taskId, status) => {
    setEmployeeTasks(prev => prev.map(task => (
      task.id === taskId
        ? { ...task, status, updated_at: new Date().toISOString(), updatedBy: currentUser?.username || 'Team' }
        : task
    )))
  }, [currentUser?.username])

  const sendOwnerNote = useCallback(body => {
    const note = { id: `owner-note-${Date.now()}`, from: currentUser?.username || 'Manager', body, created_at: new Date().toISOString() }
    setOwnerNotes(prev => [note, ...prev].slice(0, 40))
    pushNotification({ roles: ['owner', 'admin'], title: 'Manager note sent', body, type: 'owner-note', page: 'commandCenter' })
    return note
  }, [currentUser?.username, pushNotification])

  if (!currentUser) {
    return <LoginScreen t={t} onLogin={login} />
  }

  return (
    <div className="min-h-screen bg-[#0d0c09] text-[#f5f5f0]">
      <TopNav
        t={t}
        currentUser={currentUser}
        role={role}
        area={area}
        page={page}
        goToArea={goToArea}
        goToPage={goToPage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        notifications={visibleNotifications}
        unreadCount={unreadCount}
        onToggleNotifications={() => setShowNotifications(prev => !prev)}
        logout={logout}
      />

      <div className={cx('min-h-[calc(100vh-5rem)]', role === 'employee' ? 'block' : 'flex')}>
        {role !== 'employee' && (
          <SidePanel
            t={t}
            currentUser={currentUser}
            role={role}
            area={area}
            page={page}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
            goToPage={goToPage}
            lang={lang}
            setLang={setLang}
            logout={logout}
          />
        )}

        {role !== 'employee' && !collapsed && (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setCollapsed(true)}
            aria-label={t.ui.collapsePanel}
          />
        )}

        <main className={cx('min-w-0 flex-1', role === 'employee' ? 'px-3 py-4 sm:px-5 lg:px-7 xl:px-8' : 'p-8 sm:p-12 lg:p-20 xl:p-32 2xl:p-40')}>
          {showNotifications && (
            <NotificationPanel
              notifications={visibleNotifications}
              currentUser={currentUser}
              onClose={() => setShowNotifications(false)}
              onMarkRead={markNotificationsRead}
              goToPage={goToPage}
            />
          )}
          <PageRenderer
            t={t}
            lang={lang}
            currentUser={currentUser}
            role={role}
            page={page}
            goToPage={goToPage}
            users={users}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDisableUser={handleDisableUser}
            reportArchive={reportArchive}
            onReportArchived={archiveEndOfDayReport}
            eventPlans={eventPlans}
            businessMemory={businessMemory}
            onEventPlanSaved={saveEventPlan}
            onApproveEventEnquiry={approveEventEnquiry}
            actionItems={actionItems}
            setActionItems={setActionItems}
            budgetRequests={budgetRequests}
            onBudgetRequest={submitBudgetRequest}
            onBudgetResponse={respondBudgetRequest}
            serviceIncidents={serviceIncidents}
            onServiceIncident={submitServiceIncident}
            onUpdateIncident={updateIncident}
            employeePerformance={employeePerformance}
            employeeTasks={employeeTasks}
            employeeRequests={employeeRequests}
            onUpdateEmployeeTask={updateEmployeeTask}
            onSubmitEmployeeRequest={submitEmployeeRequest}
            onManagerReviewEmployeeRequest={managerReviewEmployeeRequest}
            onOwnerReviewEmployeeRequest={ownerReviewEmployeeRequest}
            supplyRisks={INITIAL_SUPPLY_RISKS}
            shiftProfile={INITIAL_SHIFT_PROFILE}
            ownerNotes={ownerNotes}
            onOwnerNote={sendOwnerNote}
            onMemoryEvent={addBusinessMemoryEvent}
            cocktailDrafts={cocktailDrafts}
            approvedCocktails={approvedCocktails}
            archivedCocktails={archivedCocktails}
            cocktailPractice={cocktailPractice}
            academyProgress={academyProgress}
            selectedAcademyId={selectedAcademyId}
            selectedLessonId={selectedLessonId}
            onOpenUniversityLesson={openUniversityLesson}
            onCompleteUniversityLesson={completeUniversityLesson}
            onSaveCocktailDraft={saveCocktailDraft}
            onSubmitCocktailApproval={submitCocktailForApproval}
            onApproveCocktail={approveCocktail}
            onRejectCocktailDraft={archiveCocktail}
            onMarkCocktailPracticed={markCocktailPracticed}
            notifications={visibleNotifications}
          />
        </main>
      </div>
    </div>
  )
}

function LoginScreen({ t, onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!username.trim() || !password) {
      setError('Enter username and password.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onLogin({ username, password })
    } catch (loginError) {
      setError(loginError.message || t.app.invalid)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen bg-[#0d0c09] text-[#f5f5f0] lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative flex items-end overflow-hidden border-b border-[#6b705c]/30 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.2),transparent_34%),linear-gradient(135deg,#181611,#0d0c09)] p-8 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-12">
        <div className="max-w-3xl">
          <div className="mb-6 text-sm font-black uppercase tracking-[0.28em] text-[#c9a96e]">
            {t.app.secureAccess}
          </div>
          <h1 className="font-serif text-5xl font-black tracking-tight text-[#f5f5f0] sm:text-7xl">
            {t.app.name} <span className="text-[#c9a96e]">{t.app.suffix}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#e8dcc0]">{t.app.accessBody}</p>

          <div className="mt-10 grid gap-3 text-sm text-[#e8dcc0] sm:grid-cols-2">
            <div className="rounded-2xl border border-[#6b705c]/30 bg-black/20 p-4">Owner intelligence, budget approvals, and weekly summaries.</div>
            <div className="rounded-2xl border border-[#6b705c]/30 bg-black/20 p-4">Manager control tower, events, staff progression, and bar governance.</div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-[1.75rem] border border-[#6b705c]/30 bg-[#14130f] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c9a96e]">
                {t.app.secureAccess}
              </div>
              <h2 className="mt-3 font-serif text-3xl font-black tracking-tight text-[#f5f5f0]">
                {t.app.accessTitle}
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <input
              value={username}
              onChange={event => setUsername(event.target.value)}
              placeholder="Username"
              autoComplete="username"
              className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 py-3 text-sm text-[#f5f5f0] outline-none transition placeholder:text-[#e8dcc0]/50 focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
            />
            <input
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 py-3 text-sm text-[#f5f5f0] outline-none transition placeholder:text-[#e8dcc0]/50 focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
            />
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <Button type="submit" className="mt-4 w-full" disabled={submitting}>{submitting ? 'Entering...' : t.app.enter}</Button>
        </form>
      </section>
    </main>
  )
}

function getAreaLabel(t, area) {
  return t.areas?.[area] || TEXT.en.areas[area] || area
}

function getAreaDescription(t, area) {
  return t.areaDescriptions?.[area] || TEXT.en.areaDescriptions[area] || ''
}

function getPageLabel(t, page) {
  return t.pages?.[page] || TEXT.en.pages[page] || page
}

function groupPagesBySection(pages) {
  return pages.reduce((groups, pageKey) => {
    const section = PAGE_META[pageKey]?.section || 'Core'
    const existing = groups.find(group => group.section === section)
    if (existing) {
      existing.pages.push(pageKey)
      return groups
    }
    return [...groups, { section, pages: [pageKey] }]
  }, [])
}

function TopNav({ t, currentUser, role, area, page, goToArea, goToPage, collapsed, setCollapsed, unreadCount = 0, onToggleNotifications, logout }) {
  const areas = Object.entries(NAV_GROUPS)
    .filter(([key]) => allowedPagesForArea(currentUser, key).length)
    .map(([key]) => key)
  const employeePages = [
    ['employeeHome', 'Home'],
    ['courses', 'Courses'],
    ['lessonPlayer', 'Lessons'],
    ['sopSheets', 'Service'],
    ['approvedCocktails', 'Cocktails'],
    ['wineKnowledge', 'Wine'],
    ['employeeRequests', 'Requests'],
    ['serviceRecovery', 'Report']
  ].filter(([key]) => canAccessPage(currentUser, key))

  if (role === 'employee') {
    return (
      <header className="sticky top-0 z-40 border-b border-[#6b705c]/10 bg-[#080806]/92 backdrop-blur-xl">
        <div className="flex min-h-14 flex-wrap items-center gap-2.5 px-4 py-1.5 sm:px-6 lg:px-9">
          <button type="button" onClick={() => goToPage?.('employeeHome')} className="shrink-0 text-left">
            <div className="font-serif text-lg font-black tracking-[0.06em] text-[#c9a96e]">
              {t.app.name} <span className="text-[#f5f5f0]">{t.app.suffix}</span>
            </div>
            <div className="hidden text-[7px] font-black uppercase tracking-[0.26em] text-[#e8dcc0]/42 sm:block">
              Employee Hospitality OS
            </div>
          </button>

          <nav className="order-3 flex w-full gap-1.5 overflow-x-auto pt-1 sm:order-none sm:w-auto sm:flex-1 sm:justify-center sm:pt-0" aria-label="Employee navigation">
            {employeePages.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => goToPage?.(key)}
                className={cx(
                  'min-h-8 shrink-0 rounded-full border px-3.5 text-[9px] font-black uppercase tracking-[0.13em] transition-all duration-300',
                  page === key
                    ? 'border-[#c9a96e]/24 bg-[#c9a96e]/8 text-[#c9a96e] shadow-[0_8px_26px_rgba(201,169,110,0.06)]'
                    : 'border-[#6b705c]/12 bg-white/[0.015] text-[#e8dcc0]/62 hover:border-[#c9a96e]/22 hover:text-[#f5f5f0]'
                )}
              >
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={onToggleNotifications}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#6b705c]/14 bg-white/[0.022] text-[#e8dcc0]/62 transition hover:border-[#c9a96e]/32 hover:text-[#c9a96e]"
            aria-label="Open notifications"
          >
            <span className="text-xs leading-none">!</span>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c9a96e] px-1 text-[9px] font-black text-[#11100d]">{unreadCount}</span>
            )}
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden rounded-full border border-[#c9a96e]/12 bg-[#c9a96e]/[0.04] px-3.5 py-1.5 text-[8px] font-black uppercase tracking-[0.15em] text-[#e8dcc0]/68 sm:block">
              {currentUser.username.toUpperCase()} - EMPLOYEE
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.13em] text-[#e8dcc0]/50 transition hover:bg-white/[0.032] hover:text-[#c9a96e]"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#6b705c]/20 bg-[#0d0c09]/90 backdrop-blur-xl">
      <div className="flex min-h-20 items-center gap-8 px-8 sm:px-12 lg:px-16">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] text-[#e8dcc0] transition hover:border-[#c9a96e] hover:text-[#c9a96e]"
          aria-label={collapsed ? t.ui.openPanel : t.ui.collapsePanel}
        >
          <span className="block w-4">
            <span className="mb-1 block h-0.5 rounded bg-current" />
            <span className="mb-1 block h-0.5 rounded bg-current" />
            <span className="block h-0.5 rounded bg-current" />
          </span>
        </button>

        <div className="min-w-fit">
          <div className="font-serif text-2xl font-black tracking-[0.06em] text-[#c9a96e]">
            {t.app.name} <span className="text-[#f5f5f0]">{t.app.suffix}</span>
          </div>
          <div className="hidden text-[9px] font-black uppercase tracking-[0.3em] text-[#e8dcc0] opacity-60 sm:block">
            {t.app.tagline}
          </div>
        </div>

        <nav className="flex flex-1 gap-4 overflow-x-auto px-4" aria-label="Primary navigation">
          {areas.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => goToArea(item)}
              className={cx(
                'min-h-12 shrink-0 rounded-2xl border px-6 py-2 text-left transition-all duration-300',
                area === item
                  ? 'border-[#c9a96e]/30 bg-[#c9a96e]/5 text-[#c9a96e] shadow-lg shadow-[#c9a96e]/5'
                  : 'border-transparent text-[#e8dcc0] hover:bg-[#6b705c]/10 hover:text-[#f5f5f0]'
              )}
            >
              <span className="block text-xs font-black uppercase tracking-widest">{getAreaLabel(t, item)}</span>
              <span className="hidden text-[10px] leading-4 text-[#e8dcc0] opacity-50 xl:block">
                {getAreaDescription(t, item)}
              </span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={onToggleNotifications}
          className="relative hidden h-11 w-11 items-center justify-center rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e] lg:inline-flex"
          aria-label="Open notifications"
        >
          <span className="text-lg leading-none">!</span>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a96e] px-1 text-[10px] font-black text-[#11100d]">{unreadCount}</span>
          )}
        </button>

        <div className="hidden rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#c9a96e] lg:block">
          {currentUser.username} - {t.app[role] || role}
        </div>
      </div>
    </header>
  )
}

function SidePanel({ t, currentUser, role, area, page, collapsed, setCollapsed, goToPage, lang, setLang, logout }) {
  const pages = NAV_GROUPS[area]?.pages.filter(item => canAccessPage(currentUser, item) && !PAGE_META[item].hiddenInNav) || []
  const pageGroups = groupPagesBySection(pages)

  return (
    <aside className={cx(
      'fixed inset-y-20 z-30 border-r border-[#6b705c]/10 bg-[#0d0c09] transition-all duration-500 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)]',
      collapsed ? 'w-0 -translate-x-full overflow-hidden lg:w-[72px] lg:translate-x-0' : cx(role === 'employee' ? 'w-[224px]' : 'w-[248px]', 'translate-x-0')
    )}>
      {!collapsed ? (
        <div className="flex h-full flex-col">
          <div className="border-b border-[#6b705c]/10 p-5">
            <div className="text-[8px] font-black uppercase tracking-[0.34em] text-[#e8dcc0] opacity-50">
              {t.ui.selectSection}
            </div>
            <h2 className="mt-3 font-serif text-2xl font-black leading-tight text-[#f5f5f0]">{getAreaLabel(t, area)}</h2>
            <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-[#e8dcc0] opacity-65">{getAreaDescription(t, area)}</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4" aria-label="Secondary navigation">
            <div className="space-y-5">
              {pageGroups.map(group => (
                <section key={group.section}>
                  <div className="mb-2 px-2 text-[8px] font-black uppercase tracking-[0.24em] text-[#e8dcc0] opacity-35">{group.section}</div>
                  <div className="space-y-2">
                    {group.pages.map(item => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => goToPage(item)}
                        className={cx(
                          'w-full rounded-2xl border px-4 py-3 text-left transition-all duration-300',
                          page === item
                            ? 'border-[#c9a96e]/20 bg-[#c9a96e]/5 text-[#c9a96e]'
                            : 'border-transparent text-[#e8dcc0] hover:bg-white/[0.03] hover:text-[#f5f5f0]'
                        )}
                      >
                        <span className="block text-[11px] font-black leading-4 uppercase tracking-[0.12em]">{getPageLabel(t, item)}</span>
                        <span className="mt-1 block line-clamp-2 text-[9px] leading-4 text-[#e8dcc0] opacity-55">{PAGE_META[item].description}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </nav>

          <div className="border-t border-[#6b705c]/10 p-4">
            <div className={cx(
              'rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] p-3',
              role === 'employee' && 'bg-black/16'
            )}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{currentUser.username}</div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]/65">{t.app[role] || role}</div>
                </div>
                {role === 'employee' && (
                  <button type="button" onClick={logout} className="shrink-0 rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]/55 transition hover:bg-white/[0.03] hover:text-[#c9a96e]">
                    Log Out
                  </button>
                )}
              </div>
            </div>
            {role !== 'employee' && <Button variant="secondary" onClick={logout} className="mt-4 w-full">{t.app.logout}</Button>}
          </div>
        </div>
      ) : (
        <div className="hidden h-full flex-col items-center gap-2 p-2 lg:flex">
          {pages.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => goToPage(item)}
              title={getPageLabel(t, item)}
              className={cx(
                'flex h-10 w-10 items-center justify-center rounded-xl border text-[9px] font-black transition-all duration-300',
                page === item
                  ? 'border-[#c9a96e]/30 bg-[#c9a96e]/5 text-[#c9a96e]'
                  : 'border-[#6b705c]/20 text-[#e8dcc0] hover:bg-white/5 hover:text-[#f5f5f0]'
              )}
            >
              {PAGE_META[item].code}
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}

function NotificationPanel({ notifications = [], currentUser, onClose, onMarkRead, goToPage }) {
  const sorted = [...notifications].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  function openNotification(item) {
    if (item.page) goToPage(item.page)
    onMarkRead()
    onClose()
  }

  return (
    <div className="fixed right-6 top-24 z-50 w-[min(420px,calc(100vw-2rem))] rounded-[1.75rem] border border-[#c9a96e]/20 bg-[#11100d] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.55)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Notification Center</div>
          <h2 className="mt-1 font-serif text-2xl font-black text-[#f5f5f0]">Role-filtered operating signals</h2>
        </div>
        <button type="button" onClick={onClose} className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0] hover:border-[#c9a96e] hover:text-[#c9a96e]">Close</button>
      </div>
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        {sorted.length ? sorted.slice(0, 12).map(item => {
          const unread = !item.readBy?.includes(currentUser?.username)
          return (
            <button key={item.id} type="button" onClick={() => openNotification(item)} className={cx('w-full rounded-2xl border p-4 text-left transition hover:border-[#c9a96e]/40', unread ? 'border-[#c9a96e]/25 bg-[#c9a96e]/10' : 'border-[#6b705c]/20 bg-[#1a1a1a]')}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{item.type}</span>
                <span className="text-[10px] text-[#e8dcc0]/60">{item.created_at?.slice(0, 10)}</span>
              </div>
              <div className="text-sm font-black text-[#f5f5f0]">{item.title}</div>
              <p className="mt-1 text-xs leading-5 text-[#e8dcc0]">{item.body}</p>
            </button>
          )
        }) : (
          <p className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] p-4 text-sm text-[#e8dcc0]">No notifications for this role.</p>
        )}
      </div>
      <Button className="mt-4 w-full" variant="secondary" onClick={onMarkRead}>Mark Visible As Read</Button>
    </div>
  )
}

function PageRenderer({
  t,
  lang,
  currentUser,
  role,
  page,
  goToPage,
  users,
  onCreateUser,
  onUpdateUser,
  onDisableUser,
  reportArchive,
  onReportArchived,
  eventPlans,
  businessMemory,
  onEventPlanSaved,
  onApproveEventEnquiry,
  actionItems,
  setActionItems,
  budgetRequests,
  onBudgetRequest,
  onBudgetResponse,
  serviceIncidents,
  onServiceIncident,
  onUpdateIncident,
  employeePerformance,
  employeeTasks,
  employeeRequests,
  onUpdateEmployeeTask,
  onSubmitEmployeeRequest,
  onManagerReviewEmployeeRequest,
  onOwnerReviewEmployeeRequest,
  supplyRisks,
  shiftProfile,
  ownerNotes,
  onOwnerNote,
  onMemoryEvent,
  cocktailDrafts,
  approvedCocktails,
  archivedCocktails,
  cocktailPractice,
  academyProgress,
  selectedAcademyId,
  selectedLessonId,
  onOpenUniversityLesson,
  onCompleteUniversityLesson,
  onSaveCocktailDraft,
  onSubmitCocktailApproval,
  onApproveCocktail,
  onRejectCocktailDraft,
  onMarkCocktailPracticed,
  notifications
}) {
  const pages = {
    commandCenter: <CommandCenter t={t} currentUser={currentUser} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} businessMemory={businessMemory} budgetRequests={budgetRequests} employeeRequests={employeeRequests} serviceIncidents={serviceIncidents} actionItems={actionItems} notifications={notifications} onApproveEventEnquiry={onApproveEventEnquiry} />,
    preShiftBriefing: <PreShiftBriefing t={t} currentUser={currentUser} actionItems={actionItems} serviceIncidents={serviceIncidents} eventPlans={eventPlans} notes={[]} />,
    actionBoard: <ActionBoard t={t} currentUser={currentUser} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} actionItems={actionItems} setActionItems={setActionItems} serviceIncidents={serviceIncidents} onUpdateIncident={onUpdateIncident} employeePerformance={employeePerformance} employeeTasks={employeeTasks} onUpdateEmployeeTask={onUpdateEmployeeTask} supplyRisks={supplyRisks} shiftProfile={shiftProfile} budgetRequests={budgetRequests} ownerNotes={ownerNotes} onOwnerNote={onOwnerNote} />,
    managerEmployeeRequests: <ManagerEmployeeRequests t={t} employeeRequests={employeeRequests} onReview={onManagerReviewEmployeeRequest} />,
    eventOrchestrator: <EventOrchestrator t={t} eventPlans={eventPlans} onEventPlanSaved={onEventPlanSaved} />,
    staffProgression: <StaffProgression t={t} users={users} academyProgress={academyProgress} serviceIncidents={serviceIncidents} employeePerformance={employeePerformance} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} />,
    staffReadiness: <StaffReadiness t={t} goToPage={goToPage} />,
    employeeHome: <EmployeeHome t={t} currentUser={currentUser} goToPage={goToPage} academyProgress={academyProgress} employeeTasks={employeeTasks} employeeRequests={employeeRequests} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} />,
    employeeRequests: <EmployeeRequests t={t} currentUser={currentUser} employeeRequests={employeeRequests} onSubmit={onSubmitEmployeeRequest} />,
    employeeAchievements: <EmployeeAchievements currentUser={currentUser} academyProgress={academyProgress} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} employeeTasks={employeeTasks} />,
    serviceRecovery: <ServiceRecovery t={t} currentUser={currentUser} goToPage={goToPage} onServiceIncident={onServiceIncident} employeeTasks={employeeTasks} onUpdateEmployeeTask={onUpdateEmployeeTask} />,
    endOfDay: <EndOfDayReports t={t} reportArchive={reportArchive} onReportArchived={onReportArchived} />,
    budgetRequest: <BudgetRequestPage t={t} onSubmit={onBudgetRequest} budgetRequests={budgetRequests} currentUser={currentUser} />,
    operationalNotes: <OperationalNotesFeature t={t} currentUser={currentUser} />,
    simulation: <Simulation t={t} goToPage={goToPage} />,
    courses: <Courses t={t} lang={lang} currentUser={currentUser} academyProgress={academyProgress} onOpenLesson={onOpenUniversityLesson} />,
    lessonPlayer: <LessonPlayer t={t} lang={lang} currentUser={currentUser} goToPage={goToPage} academyProgress={academyProgress} selectedAcademyId={selectedAcademyId} selectedLessonId={selectedLessonId} onOpenLesson={onOpenUniversityLesson} onCompleteLesson={onCompleteUniversityLesson} />,
    sopSheets: <SOPSheets t={t} goToPage={goToPage} />,
    knowledgeLibrary: <KnowledgeLibrary t={t} lang={lang} goToPage={goToPage} />,
    wineKnowledge: <WineKnowledge />,
    cocktailLab: <CocktailLab t={t} cocktailDrafts={cocktailDrafts} approvedCocktails={approvedCocktails} archivedCocktails={archivedCocktails} onSaveDraft={onSaveCocktailDraft} onSubmitApproval={onSubmitCocktailApproval} onApprove={onApproveCocktail} onReject={onRejectCocktailDraft} />,
    approvedCocktails: <ApprovedCocktailsTraining t={t} currentUser={currentUser} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} onMarkPracticed={onMarkCocktailPracticed} />,
    learningProgress: <LearningProgress t={t} currentUser={currentUser} academyProgress={academyProgress} />,
    executiveOverview: <ExecutiveOverview t={t} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} />,
    budgetApprovals: <BudgetApprovals t={t} budgetRequests={budgetRequests} onRespond={onBudgetResponse} />,
    ownerOperationalRequests: <OwnerOperationalRequests t={t} employeeRequests={employeeRequests} onReview={onOwnerReviewEmployeeRequest} />,
    weeklySummary: <WeeklySummary t={t} currentUser={currentUser} reportArchive={reportArchive} serviceIncidents={serviceIncidents} budgetRequests={budgetRequests} eventPlans={eventPlans} actionItems={actionItems} />,
    businessMRI: <BusinessMRI t={t} />,
    profitLeaks: <ProfitLeaks t={t} goToPage={goToPage} />,
    ownerReport: <OwnerReport t={t} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} />,
    businessMemory: <BusinessMemoryPage t={t} reportArchive={reportArchive} businessMemory={businessMemory} />,
    strategicRecommendations: <StrategicRecommendations t={t} />,
    userManagement: <UserManagement currentUser={currentUser} users={users} onCreateUser={onCreateUser} onUpdateUser={onUpdateUser} onDisableUser={onDisableUser} />,
    settings: <Settings t={t} />
  }

  return pages[page] || <MissingPage t={t} page={page} />
}

function CommandCenter({ t, currentUser, goToPage, reportArchive = [], eventPlans = [], businessMemory = [], budgetRequests = [], employeeRequests = [], serviceIncidents = [], actionItems = [], notifications = [], onApproveEventEnquiry }) {
  const pendingBudgets = budgetRequests.filter(item => item.status === 'pending')
  const pendingOperationalRequests = employeeRequests.filter(item => item.status === 'pending_owner_review')
  const pendingEventEnquiries = eventPlans.filter(item => item.status === 'ENQUIRY_PENDING_OWNER_APPROVAL' || item.config?.eventStatus === 'ENQUIRY_PENDING_OWNER_APPROVAL')
  const unresolvedIncidents = serviceIncidents.filter(item => !item.resolved)
  const openActions = actionItems.filter(item => !item.done)
  const pipelineRevenue = eventPlans.reduce((sum, event) => sum + Number(event.projected_revenue || event.budget || 0), 0)
  const executionRate = actionItems.length ? Math.round(((actionItems.length - openActions.length) / actionItems.length) * 100) : 100

  return (
    <>
      <Header
        eyebrow={t.areas.command}
        title="Your venue requires attention in three areas before tonight."
        body="Owner-only operating intelligence: financial exposure, manager execution, event revenue, budget approvals, and critical business memory."
      />

      <div className="space-y-10">
        <OwnerEventEnquiryApprovalPanel
          currentUser={currentUser}
          pendingEventEnquiries={pendingEventEnquiries}
          onApproveEventEnquiry={onApproveEventEnquiry}
        />

        <Card className="bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_40%),linear-gradient(135deg,#191812,#0d0c09)] p-12 lg:p-20">
          <div className="grid gap-16 xl:grid-cols-[1fr_420px] xl:items-center">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e]">Executive Warning Tone</div>
              <h2 className="mt-6 max-w-4xl font-serif text-5xl font-black leading-[1.05] tracking-tight text-[#f5f5f0] sm:text-7xl">
                Tonight's exposure is operational, not cosmetic.
              </h2>
              <p className="mt-10 max-w-2xl text-xl leading-relaxed text-[#e8dcc0] opacity-80 italic">Budget approvals, unresolved incidents, and event readiness are now connected to the same owner command layer.</p>
              <div className="mt-12 flex flex-col gap-5 sm:flex-row">
                <Button onClick={() => goToPage('budgetApprovals')}>Review Budget Approvals</Button>
                <Button variant="secondary" onClick={() => goToPage('weeklySummary')}>Open Weekly Summary</Button>
              </div>
            </div>
            <Metric label="Financial Exposure" value={formatMoney(pendingBudgets.reduce((sum, item) => sum + Number(item.amount || 0), 0) + unresolvedIncidents.length * 650)} sub="Budgets + unresolved incidents" large />
          </div>
        </Card>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <Metric label="Manager Execution Rate" value={`${executionRate}%`} sub={`${openActions.length} open actions`} />
          <Metric label="Risk Prevented This Week" value="NIS 12.9k" sub="Modeled recovery" />
          <Metric label="Event Pipeline" value={formatMoney(pipelineRevenue)} sub={`${eventPlans.length} saved events`} />
          <Metric label="Event Enquiries" value={String(pendingEventEnquiries.length)} sub="Pending owner approval" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <OwnerIntelligenceCard title="Pending Budget Approvals" count={pendingBudgets.length} action="Open approvals" onClick={() => goToPage('budgetApprovals')} items={pendingBudgets.map(item => `${item.department}: ${formatMoney(item.amount)} - ${item.reason}`)} />
          <OwnerIntelligenceCard title="Approved Operational Requests" count={pendingOperationalRequests.length} action="Open request inbox" onClick={() => goToPage('ownerOperationalRequests')} items={pendingOperationalRequests.slice(0, 4).map(item => `${item.category}: ${item.title} - ${item.urgency}`)} />
          <OwnerIntelligenceCard title="Upcoming Events Revenue Pipeline" count={eventPlans.length} action="Open event CRM" onClick={() => goToPage('eventOrchestrator')} items={eventPlans.slice(0, 4).map(event => `${event.eventDate || 'Date pending'} - ${event.name} - ${formatMoney(event.projected_revenue || event.budget || 0)}`)} />
          <OwnerIntelligenceCard title="Service Incident Trend Overview" count={unresolvedIncidents.length} items={serviceIncidents.slice(0, 4).map(item => `${item.severity} - ${item.issueType} - ${item.employeeName} - ${item.resolved ? 'resolved' : 'unresolved'}`)} />
          <OwnerIntelligenceCard title="Weekly Profit Leak Detection" count={PROFIT_LEAKS.filter(item => item.risk !== 'low').length} action="Open profit leaks" onClick={() => goToPage('profitLeaks')} items={PROFIT_LEAKS.slice(0, 4).map(item => `${item.category}: ${formatMoney(item.monthly)}/mo`)} />
          <OwnerIntelligenceCard title="Business Memory Critical Notes" count={businessMemory.length} action="Open memory" onClick={() => goToPage('businessMemory')} items={businessMemory.slice(0, 4).map(item => `${item.type}: ${item.title}`)} />
          <OwnerIntelligenceCard title="Manager Performance Snapshot" count={executionRate} items={[`${executionRate}% action execution`, `${reportArchive.length} EOD reports archived`, `${openActions.filter(item => item.priority === 'urgent').length} urgent tasks open`]} />
        </div>
      </div>
    </>
  )
}

function OwnerEventEnquiryApprovalPanel({ currentUser, pendingEventEnquiries = [], onApproveEventEnquiry }) {
  const [approvalStatus, setApprovalStatus] = useState(null)
  const [approvingId, setApprovingId] = useState('')
  const canApprove = ['owner', 'admin'].includes(currentUser?.role)

  if (!canApprove || (!pendingEventEnquiries.length && !approvalStatus)) return null

  async function approve(eventId) {
    setApprovingId(eventId)
    setApprovalStatus(null)
    const result = await onApproveEventEnquiry?.(eventId)
    setApprovingId('')
    if (!result?.ok) {
      setApprovalStatus({ type: 'error', message: result?.message || 'Could not approve event enquiry.' })
      return
    }
    setApprovalStatus({
      type: result.emailSent ? 'success' : 'error',
      message: result.message || (result.emailSent ? 'Event enquiry approved.' : 'Event approved, but owner email could not be sent.')
    })
  }

  return (
    <section className="overflow-hidden rounded-[2.5rem] border border-[#c9a96e]/30 bg-[radial-gradient(circle_at_88%_0%,rgba(201,169,110,0.18),transparent_34%),linear-gradient(135deg,#17140e,#090907)] p-6 shadow-[0_32px_110px_rgba(0,0,0,0.42)] sm:p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.26em] text-[#c9a96e]">Owner Approval Note</div>
          <h2 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">New Event Enquiry Pending Approval</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#e8dcc0]">Manager-created enquiries stay out of operational planning until ownership approves the commercial opportunity.</p>
        </div>
        <span className="rounded-full border border-[#c9a96e]/25 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{pendingEventEnquiries.length} pending</span>
      </div>

      {approvalStatus && <Alert type={approvalStatus.type}>{approvalStatus.message}</Alert>}

      {pendingEventEnquiries.length ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {pendingEventEnquiries.map(event => {
            const config = event.config || {}
            const calculations = event.calculations || {}
            return (
              <article key={event.id} className="rounded-[2rem] border border-[#6b705c]/25 bg-black/24 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{event.eventDate || config.eventDate || 'Date pending'}</div>
                    <h3 className="mt-1 break-words font-serif text-3xl font-black leading-8 text-[#f5f5f0]">{event.name}</h3>
                  </div>
                  <span className="rounded-full border border-amber-700/40 bg-amber-950/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-200">Pending Approval</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SmallReportFact label="Contact" value={event.contactPerson || config.contactPerson || 'Not provided'} />
                  <SmallReportFact label="Guests" value={event.guests || calculations.guests || config.guests || 0} />
                  <SmallReportFact label="Budget / Revenue" value={formatMoney(event.projected_revenue || event.budget || calculations.revenue || 0)} />
                  <SmallReportFact label="Event Time" value={calculations.eventTime || `${config.startTime || ''} - ${config.endTime || ''}`} />
                </div>
                <p className="mt-4 line-clamp-4 rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a] p-4 text-sm leading-7 text-[#e8dcc0]">{event.summary || config.eventSummary || 'No generated summary available.'}</p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#e8dcc0]">{event.eventType || config.eventType || 'Event'} / {EVENT_TIERS[config.tier]?.label || config.tier || 'Service tier pending'}</span>
                  <Button onClick={() => approve(event.id)} disabled={approvingId === event.id}>
                    {approvingId === event.id ? 'Approving...' : 'Approve Enquiry'}
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl border border-[#6b705c]/25 bg-black/20 p-4 text-sm leading-7 text-[#e8dcc0]">No pending event enquiries remain in the owner approval queue.</p>
      )}
    </section>
  )
}

function OwnerIntelligenceCard({ title, count, items = [], action, onClick }) {
  return (
    <Card className="border-[#c9a96e]/15">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <Label>{title}</Label>
          <div className="font-serif text-4xl font-black text-[#c9a96e]">{count}</div>
        </div>
        {action && <Button variant="secondary" onClick={onClick}>{action}</Button>}
      </div>
      <List items={items.length ? items : ['No current items.']} />
    </Card>
  )
}

function ActionBoard({ t, currentUser, goToPage, reportArchive = [], eventPlans = [], actionItems = ACTION_BOARD_ITEMS, setActionItems, serviceIncidents = [], onUpdateIncident, employeePerformance = {}, employeeTasks = [], onUpdateEmployeeTask, supplyRisks = [], shiftProfile = INITIAL_SHIFT_PROFILE, budgetRequests = [], ownerNotes = [], onOwnerNote }) {
  const items = actionItems
  const open = items.filter(item => !item.done)
  const completed = items.filter(item => item.done)
  const urgent = open.filter(item => item.priority === 'urgent').length
  const [newTask, setNewTask] = useState('')
  const [ownerNoteDraft, setOwnerNoteDraft] = useState('')
  const latestEvent = eventPlans[0]
  const activeEmployees = STAFF.filter(item => item.status !== 'At Risk')
  const weakEmployees = STAFF.filter(item => item.status === 'Needs Coaching' || item.status === 'At Risk')
  const incompleteAcademy = STAFF.filter(item => item.progress < 80)
  const vipCapable = STAFF.filter(item => item.simulation >= 85).length
  const openEmployeeTasks = employeeTasks.filter(task => task.status !== 'done')
  const eventTaskCompletion = employeeTasks.length ? Math.round(((employeeTasks.length - openEmployeeTasks.length) / employeeTasks.length) * 100) : 100
  const priorityClass = {
    urgent: 'border-red-800/50 bg-red-950/25 text-red-200',
    high: 'border-amber-800/50 bg-amber-950/25 text-amber-200',
    normal: 'border-[#6b705c]/30 bg-[#6b705c]/10 text-[#e8dcc0]'
  }

  function toggle(id) {
    setActionItems?.(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item))
  }

  function addTask() {
    if (!newTask.trim()) return
    const task = { id: `manager-task-${Date.now()}`, priority: 'high', title: newTask.trim(), owner: currentUser?.username || 'Manager', due: 'Today', signal: 'Manager-created control tower task', page: 'actionBoard', done: false }
    setActionItems?.(prev => [task, ...prev].slice(0, 80))
    setNewTask('')
  }

  function sendNote() {
    if (!ownerNoteDraft.trim()) return
    onOwnerNote?.(ownerNoteDraft.trim())
    setOwnerNoteDraft('')
  }

  return (
    <>
      <Header eyebrow={t.pages.actionBoard} title="Shift Operations Control Tower" body="A live manager operating room for today's floor status, staff risk, incidents, shortages, event prep, approvals, and owner communication." />

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric label="Shift Type" value={shiftProfile.shiftType} sub={new Date().toLocaleDateString()} />
        <Metric label="Expected Covers" value={String(shiftProfile.expectedCovers)} sub={`${shiftProfile.vipReservations} VIP reservations`} />
        <Metric label="Event Today" value={shiftProfile.eventToday ? 'Yes' : 'No'} sub={latestEvent?.name || 'No event attached'} />
        <Metric label="Pressure Level" value={shiftProfile.pressureLevel} sub="Floor load estimate" />
        <Metric label="Open Actions" value={String(open.length)} sub={`${urgent} urgent`} />
      </div>

      <div className="space-y-8">
        <Card className="border-[#c9a96e]/20">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <Label>Open Employee Event Tasks</Label>
              <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{openEmployeeTasks.length} open tasks</h2>
              <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">Completion across event-generated employee execution work: {eventTaskCompletion}%.</p>
            </div>
            <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-xs font-black text-[#c9a96e]">{employeeTasks.length} total</span>
          </div>
          {employeeTasks.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {employeeTasks.slice(0, 6).map(task => (
                <article key={task.id} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-black text-[#f5f5f0]">{task.title}</span>
                    <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase', task.status === 'done' ? 'border-emerald-800/50 text-emerald-200' : task.status === 'inProgress' ? 'border-amber-800/50 text-amber-200' : 'border-[#6b705c]/50 text-[#e8dcc0]')}>{task.status}</span>
                  </div>
                  <p className="text-xs leading-6 text-[#e8dcc0]">{task.department} - {task.assignedRole} - Due {task.dueDate} - {task.linkedEventName}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" disabled={task.status === 'inProgress'} onClick={() => onUpdateEmployeeTask?.(task.id, 'inProgress')}>In Progress</Button>
                    <Button disabled={task.status === 'done'} onClick={() => onUpdateEmployeeTask?.(task.id, 'done')}>Done</Button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm leading-7 text-[#e8dcc0]">No approved or operational-planning event has generated employee tasks yet.</p>
          )}
        </Card>

        <Card>
          <Label>Staff On Duty Snapshot</Label>
          <div className="grid gap-4 md:grid-cols-5">
            <MiniFact label="Active Employees" value={activeEmployees.length} />
            <MiniFact label="Absent Employees" value="1" />
            <MiniFact label="Weak / New" value={weakEmployees.length} />
            <MiniFact label="Incomplete Academy" value={incompleteAcademy.length} />
            <MiniFact label="VIP Capable" value={vipCapable} />
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div><Label>Priority Action Board</Label><h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Urgent unresolved work</h2></div>
            <div className="flex min-w-[280px] flex-1 gap-3 md:max-w-xl">
              <input value={newTask} onChange={event => setNewTask(event.target.value)} placeholder="Add shortage, prep, owner request, event task..." className="min-h-11 flex-1 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
              <Button onClick={addTask}>Add</Button>
            </div>
          </div>
          <div className="space-y-3">
            {items.map(item => (
              <article key={item.id} className={cx('rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 transition hover:border-[#c9a96e]/40', item.done && 'opacity-55')}>
              <div className="flex items-start gap-4">
                <button type="button" onClick={() => toggle(item.id)} className={cx('mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition', item.done ? 'border-[#c9a96e] bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 hover:border-[#c9a96e]')}>
                  {item.done ? 'OK' : ''}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em]', priorityClass[item.priority])}>{item.priority}</span>
                    <span className="rounded-full border border-[#6b705c]/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]">{item.due}</span>
                  </div>
                  <h2 className="text-sm font-black leading-6 text-[#f5f5f0]">{item.title}</h2>
                  <p className="mt-2 text-xs leading-6 text-[#e8dcc0]">{item.signal}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-[#e8dcc0]">Owner: {item.owner}</span>
                    <Button variant="ghost" onClick={() => goToPage(item.page)}>Open Module</Button>
                  </div>
                </div>
              </div>
              </article>
            ))}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <Label>Live Service Incident Feed</Label>
            <div className="space-y-3">
              {serviceIncidents.slice(0, 8).map(incident => (
                <article key={incident.id} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-black text-[#f5f5f0]">{incident.employeeName} - {incident.issueType}</span>
                    <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase', incident.resolved ? 'border-emerald-800/50 text-emerald-200' : 'border-red-800/50 text-red-200')}>{incident.resolved ? 'resolved' : 'unresolved'}</span>
                  </div>
                  <p className="text-xs leading-6 text-[#e8dcc0]">{incident.time} - {incident.guestTable} - {incident.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" disabled={incident.resolved} onClick={() => onUpdateIncident?.(incident.id, { resolved: true })}>Resolve</Button>
                    <Button variant="ghost" onClick={() => onUpdateIncident?.(incident.id, { escalated: true })}>Escalate</Button>
                    <Button variant="ghost" onClick={() => onUpdateIncident?.(incident.id, { coachingNote: 'Manager coaching note added.' })}>Add Coaching Note</Button>
                  </div>
                </article>
              ))}
            </div>
          </Card>
          <div className="space-y-6">
            <Card><Label>Shortage & Supply Risk</Label><List items={supplyRisks.map(item => `${item.level.toUpperCase()}: ${item.item} - ${item.detail}`)} /></Card>
            <Card><Label>Upcoming Event Prep</Label><List items={eventPlans.slice(0, 3).map(event => `${event.eventDate || 'Date pending'} - ${event.name} - ${event.status || 'Inquiry'}`)} /></Card>
          </div>
        </div>

        <Card>
          <Label>Quick Manager Actions</Label>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => goToPage('budgetRequest')}>Submit Budget Request</Button>
            <Button variant="secondary" onClick={() => goToPage('eventOrchestrator')}>Open Event Planner</Button>
            <Button variant="secondary" onClick={() => goToPage('endOfDay')}>Open End Of Day</Button>
            <Button variant="secondary" onClick={() => goToPage('staffProgression')}>Open Staff Coaching</Button>
          </div>
        </Card>

        <Card className="border-[#c9a96e]/20">
          <Label>Owner Communication Strip</Label>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-3">{ownerNotes.slice(0, 4).map(note => <div key={note.id} className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm text-[#e8dcc0]">{note.from}: {note.body}</div>)}</div>
            <div>
              <textarea value={ownerNoteDraft} onChange={event => setOwnerNoteDraft(event.target.value)} placeholder="Send owner note..." rows={4} className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
              <Button className="mt-3" onClick={sendNote}>Send Owner Note</Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

function ShiftBriefingWidget({ openActions, latestReport, latestEvent, goToPage }) {
  const urgentActions = openActions.filter(item => item.priority === 'urgent')
  const briefingItems = [
    urgentActions[0]?.title || 'Confirm floor readiness before doors open.',
    latestReport?.urgent_items || latestReport?.shift_summary || 'No archived End Of Day handoff yet. Closing reports should feed tomorrow briefing.',
    latestEvent ? `Event plan active: ${latestEvent.name} with projected profit ${formatMoney(latestEvent.projected_profit || latestEvent.calculations?.grossProfit || 0)}.` : 'No saved event plan in the current briefing stack.'
  ]

  return (
    <section className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_35%),#1a1a1a]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Live Shift Briefing
            </div>
            <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Before service, align the room on the few things that matter.</h2>
          </div>
          <span className="rounded-full border border-red-800/50 bg-red-950/25 px-3 py-1 text-xs font-black text-red-200">{urgentActions.length} urgent</span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {briefingItems.map((item, index) => (
            <div key={item} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
              <div className="mb-2 font-serif text-3xl font-black text-[#6b705c]">0{index + 1}</div>
              <p className="text-sm leading-7 text-[#e8dcc0]">{item}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-[#c9a96e]/15">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">
          <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          Pre-Shift Micro Training
        </div>
        <p className="mb-4 text-sm leading-7 text-[#e8dcc0]">The correct training unit for today is not a full course. It is the smallest drill that reduces tonight's highest risk.</p>
        <div className="space-y-3">
          <button type="button" onClick={() => goToPage('serviceRecovery')} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-left text-sm font-bold text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]">Run 5-minute recovery language calibration</button>
          <button type="button" onClick={() => goToPage('simulation')} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-left text-sm font-bold text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]">Score one pressure scenario before lineup</button>
          <button type="button" onClick={() => goToPage('sopSheets')} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-left text-sm font-bold text-[#e8dcc0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]">Review delay SOP with exact guest language</button>
        </div>
      </Card>
    </section>
  )
}

function EventOrchestrator({ t, eventPlans = [], onEventPlanSaved }) {
  const [config, setConfig] = useState({
    eventDate: new Date().toISOString().slice(0, 10),
    startTime: '14:30',
    endTime: '17:10',
    contactPerson: '',
    phone: '',
    eventBudget: 148000,
    eventType: 'Wedding',
    specialRequests: 'VIP table, dietary safety net, kosher wine review.',
    staffingNotes: 'Assign senior captain and dedicated bar lead.',
    eventStatus: 'Inquiry',
    guests: 180,
    tier: 'premium',
    pricePerGuest: EVENT_TIERS.premium.defaultPrice
  })
  const [saveStatus, setSaveStatus] = useState(null)
  const [lastSavedEvent, setLastSavedEvent] = useState(null)

  const tier = EVENT_TIERS[config.tier]
  const calculations = useMemo(() => {
    const guests = Math.max(1, Number(config.guests) || 1)
    const duration = calculateEventDurationHours(config.startTime, config.endTime)
    const price = Math.max(0, Number(config.pricePerGuest) || 0)
    const cogsPercent = EVENT_COGS_PERCENT
    const hourlyRate = EVENT_LABOR_HOURLY_RATE

    const cocktails = Math.ceil(guests * tier.cocktailRate)
    const wineBottles = Math.ceil(guests / 3.5)
    const wineGlasses = wineBottles * 4
    const spiritBottles = Math.ceil((guests * duration * 0.35) / 16)
    const beerUnits = Math.ceil(guests * 1.2)
    const glasswareUnits = Math.ceil(guests * 3)
    const proteinKg = guests * 0.2
    const starchKg = guests * 0.18
    const vegetableKg = guests * 0.16
    const sauceKg = guests * 0.06
    const foodMassKg = guests * 0.75
    const dietaryBufferGuests = Math.ceil(guests * 0.05)
    const dietaryBufferKg = dietaryBufferGuests * 0.75
    const revenue = guests * price
    const cogs = revenue * (cogsPercent / 100)
    const waiters = Math.ceil(guests / 15)
    const bartenders = Math.ceil(guests / 50)
    const laborHours = (waiters + bartenders) * duration
    const laborCost = laborHours * hourlyRate
    const grossProfit = revenue - cogs - laborCost
    const margin = revenue ? (grossProfit / revenue) * 100 : 0

    return {
      guests,
      duration,
      eventTime: `${config.startTime} - ${config.endTime}`,
      price,
      cogsPercent,
      hourlyRate,
      cocktails,
      wineBottles,
      wineGlasses,
      spiritBottles,
      beerUnits,
      glasswareUnits,
      proteinKg,
      starchKg,
      vegetableKg,
      sauceKg,
      foodMassKg,
      dietaryBufferGuests,
      dietaryBufferKg,
      revenue,
      cogs,
      waiters,
      bartenders,
      laborHours,
      laborCost,
      grossProfit,
      margin
    }
  }, [config, tier])

  function updateConfig(field, value) {
    setConfig(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'tier') {
        next.pricePerGuest = EVENT_TIERS[value].defaultPrice
      }
      return next
    })
  }

  async function saveEventPlan() {
    setSaveStatus({ type: 'loading', message: 'Saving event plan...' })
    const generatedFnbBreakdown = generateEventFnbBreakdown(config, calculations, tier)
    const summarySourceEvent = {
      id: 'Pending save',
      name: `${config.contactPerson || tier.label} event - ${calculations.guests} guests`,
      eventType: config.eventType,
      eventDate: config.eventDate,
      contactPerson: config.contactPerson,
      phone: config.phone,
      budget: Number(config.eventBudget) || calculations.revenue || 0,
      guests: calculations.guests,
      fnbBreakdown: generatedFnbBreakdown,
      specialRequests: config.specialRequests,
      staffingNotes: config.staffingNotes,
      status: config.eventStatus,
      config,
      calculations,
      projected_revenue: calculations.revenue || Number(config.eventBudget) || 0,
      projected_profit: calculations.grossProfit || 0,
      projected_margin: calculations.margin || 0
    }
    const generatedSummary = generateExecutiveEventSummary(summarySourceEvent)
    const persistedConfig = {
      ...config,
      eventSummary: generatedSummary,
      fnbBreakdown: generatedFnbBreakdown,
      cogsPercent: EVENT_COGS_PERCENT,
      hourlyRate: EVENT_LABOR_HOURLY_RATE
    }

    try {
      const savedPlan = await onEventPlanSaved?.({
        name: `${config.contactPerson || tier.label} event - ${calculations.guests} guests`,
        config: persistedConfig,
        calculations
      })
      setLastSavedEvent(savedPlan || { config: persistedConfig, calculations })
      setSaveStatus({ type: 'success', message: `${savedPlan?.name || 'Event plan'} saved. Executive outputs generated below.` })
    } catch (error) {
      console.warn('Event plan save failed:', error)
      setSaveStatus({ type: 'error', message: 'Could not save event plan. Backend may be offline.' })
    }
  }

  return (
    <>
      <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#c9a96e]/20 bg-[radial-gradient(circle_at_78%_10%,rgba(201,169,110,0.16),transparent_35%),linear-gradient(135deg,#1b1914,#0f0f0e_72%)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.38)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.24em] text-[#c9a96e]">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Event CRM
            </div>
            <h1 className="font-serif text-4xl font-black tracking-tight text-[#f5f5f0] sm:text-6xl">Plan first. Save once. Generate the event intelligence file.</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[#e8dcc0]">Managers enter the commercial and operational facts first. HOSPIA generates the executive summary and F&B intelligence only after the event is saved into memory.</p>
          </div>
          <div className="grid min-w-[280px] gap-3 rounded-2xl border border-[#6b705c]/30 bg-[#c9a96e]/10 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Silent Calculation Preview</div>
            <div className="font-serif text-5xl font-black text-[#c9a96e]">{formatMoney(calculations.grossProfit)}</div>
            <div className={cx('text-sm font-black', calculations.margin >= 45 ? 'text-emerald-300' : calculations.margin >= 32 ? 'text-[#c9a96e]' : 'text-red-300')}>{calculations.margin.toFixed(1)}% projected margin</div>
            <Button onClick={saveEventPlan} disabled={saveStatus?.type === 'loading'}>{saveStatus?.type === 'loading' ? 'Saving...' : 'Save Event'}</Button>
            {saveStatus && saveStatus.type !== 'loading' && <div className={cx('text-xs font-bold leading-5', saveStatus.type === 'success' ? 'text-emerald-300' : 'text-red-300')}>{saveStatus.message}</div>}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.72fr)]">
        <EventConfiguration config={config} calculations={calculations} updateConfig={updateConfig} />
        <div className="space-y-6">
          <EventExecutiveResults savedEvent={lastSavedEvent} fallbackCalculations={calculations} tier={tier} />
          <SavedEventReports eventPlans={eventPlans} />
        </div>
      </div>
    </>
  )
}

function calculateEventDurationHours(startTime, endTime) {
  const start = parseClockMinutes(startTime)
  const end = parseClockMinutes(endTime)
  if (start === null || end === null) return 1
  const minutes = end > start ? end - start : end + 1440 - start
  return Math.max(0.25, Math.round((minutes / 60) * 100) / 100)
}

function parseClockMinutes(value) {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null
  return hours * 60 + minutes
}

function generateEventFnbBreakdown(config, calculations, tier) {
  return [
    `Bar supply: ${calculations.cocktails} welcome/signature cocktails, ${calculations.wineBottles} wine bottles, ${calculations.spiritBottles} spirit bottles, ${calculations.beerUnits} beer units, ${calculations.glasswareUnits} glassware turns.`,
    `Food plan: ${calculations.proteinKg.toFixed(1)} kg protein, ${calculations.starchKg.toFixed(1)} kg starch, ${calculations.vegetableKg.toFixed(1)} kg vegetables, ${calculations.sauceKg.toFixed(1)} kg sauce, plus ${calculations.dietaryBufferGuests} dietary buffer guests.`,
    `Financial assumptions: ${EVENT_COGS_PERCENT}% culinary COGS and ${formatMoney(EVENT_LABOR_HOURLY_RATE)} hourly labor are applied automatically. ${tier.label} service tier remains stored for future intelligence.`
  ].join('\n')
}

function EventConfiguration({ config, calculations, updateConfig }) {
  return (
    <section className="rounded-[2.5rem] border border-[#c9a96e]/20 bg-[radial-gradient(circle_at_88%_0%,rgba(201,169,110,0.10),transparent_32%),linear-gradient(135deg,#15140f,#090907)] p-6 shadow-[0_32px_110px_rgba(0,0,0,0.42)] sm:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Event Input File</div>
          <h2 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Planning facts.</h2>
        </div>
        <span className="rounded-full border border-[#c9a96e]/20 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{calculations.duration.toFixed(2)} hours calculated</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <NumberInput label="Event Date" value={config.eventDate} type="date" onChange={value => updateConfig('eventDate', value)} />
        <NumberInput label="From Time" value={config.startTime} type="time" onChange={value => updateConfig('startTime', value)} />
        <NumberInput label="To Time" value={config.endTime} type="time" onChange={value => updateConfig('endTime', value)} />
        <NumberInput label="Contact Person" value={config.contactPerson} type="text" onChange={value => updateConfig('contactPerson', value)} />
        <NumberInput label="Phone Number" value={config.phone} type="text" onChange={value => updateConfig('phone', value)} />
        <NumberInput label="Event Budget" value={config.eventBudget} min="0" onChange={value => updateConfig('eventBudget', value)} />
        <SelectField label="Event Type" value={config.eventType} onChange={value => updateConfig('eventType', value)} options={['Business Event', 'Birthday', 'Wedding', 'Boutique Hotel Retreat']} />
        <SelectField label="Event Status" value={config.eventStatus} onChange={value => updateConfig('eventStatus', value)} options={['Inquiry', 'Approved', 'Operational Planning', 'Deposit Paid', 'Confirmed', 'Completed']} />
        <SelectField label="Service Tier" value={config.tier} onChange={value => updateConfig('tier', value)} options={Object.entries(EVENT_TIERS).map(([key, item]) => ({ value: key, label: item.label }))} />
        <NumberInput label="Guest Count" value={config.guests} min="1" onChange={value => updateConfig('guests', value)} />
        <NumberInput label="Price Per Guest (NIS)" value={config.pricePerGuest} min="0" onChange={value => updateConfig('pricePerGuest', value)} />
        <div className="rounded-2xl border border-[#6b705c]/25 bg-black/20 p-4">
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]">Internal Assumptions</div>
          <div className="text-sm font-bold leading-7 text-[#f5f5f0]">{EVENT_COGS_PERCENT}% COGS / {formatMoney(EVENT_LABOR_HOURLY_RATE)} labor hour</div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextArea id="event-special-crm" label="Special Requests" rows={3} value={config.specialRequests} onChange={value => updateConfig('specialRequests', value)} />
        <TextArea id="event-staffing-crm" label="Staffing Notes" rows={3} value={config.staffingNotes} onChange={value => updateConfig('staffingNotes', value)} />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <EventMiniStat label="Waiters" value={calculations.waiters} />
        <EventMiniStat label="Bartenders" value={calculations.bartenders} />
        <EventMiniStat label="Labor Hours" value={calculations.laborHours.toFixed(1)} />
      </div>
    </section>
  )
}

function EventExecutiveResults({ savedEvent, fallbackCalculations, tier }) {
  const calculations = savedEvent?.calculations || fallbackCalculations
  const config = savedEvent?.config

  if (!savedEvent) {
    return (
      <section className="rounded-[2.5rem] border border-dashed border-[#6b705c]/30 bg-[linear-gradient(135deg,#11100d,#090907)] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
        <div className="mb-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Generated Outputs Locked</div>
        <h2 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Save the event to generate the executive event file.</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#e8dcc0]">Event Summary, F&B intelligence, bar supply, menu planning, and financial readouts appear here only after the manager persists the event.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <EventMiniStat label="Revenue Preview" value={formatMoney(calculations.revenue)} />
          <EventMiniStat label="Margin Preview" value={`${calculations.margin.toFixed(1)}%`} />
          <EventMiniStat label="Duration" value={`${calculations.duration.toFixed(2)}h`} />
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <Card className="border-[#c9a96e]/20">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><Sparkles className="h-4 w-4" aria-hidden="true" /> Event Summary</div>
            <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Generated executive event brief.</h2>
          </div>
          <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-xs font-black text-[#c9a96e]">{config?.eventStatus || 'Saved'}</span>
        </div>
        <p className="text-sm leading-8 text-[#e8dcc0]">{config?.eventSummary}</p>
      </Card>

      <Card className="border-[#c9a96e]/20">
        <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Full F&B Breakdown</div>
        <div className="space-y-3">
          {String(config?.fnbBreakdown || '').split('\n').filter(Boolean).map(line => (
            <div key={line} className="rounded-2xl border border-[#6b705c]/25 bg-[#1a1a1a] p-4 text-sm leading-7 text-[#e8dcc0]">{line}</div>
          ))}
        </div>
      </Card>

      <BarSupplyCube calculations={calculations} tier={EVENT_TIERS[config?.tier] || tier} />
      <MenuDietaryCube calculations={calculations} />
      <ROIEngine calculations={calculations} />
    </section>
  )
}

function SavedEventReports({ eventPlans = [] }) {
  return (
    <section className="rounded-[2.5rem] border border-[#c9a96e]/20 bg-[linear-gradient(135deg,#15140f,#090907)] p-6 shadow-[0_32px_110px_rgba(0,0,0,0.4)] sm:p-7">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><ClipboardCheck className="h-4 w-4" aria-hidden="true" /> Saved Event Reports</div>
          <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Compact event intelligence snapshots.</h2>
        </div>
        <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0]">{eventPlans.length} saved</span>
      </div>

      {eventPlans.length ? (
        <div className="grid gap-4">
          {eventPlans.slice(0, 6).map(plan => {
            const calculations = plan.calculations || {}
            const config = plan.config || {}
            const margin = Number(plan.projected_margin ?? calculations.margin ?? 0)
            return (
              <article key={plan.id} className="overflow-hidden rounded-[2rem] border border-[#6b705c]/25 bg-[#10100e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{plan.eventDate || config.eventDate || plan.created_at?.slice(0, 10) || 'Saved plan'}</div>
                    <h3 className="mt-1 break-words font-serif text-2xl font-black leading-7 text-[#f5f5f0]">{plan.name}</h3>
                    <p className="mt-1 text-xs font-bold text-[#e8dcc0]">{config.eventType || plan.eventType || 'Event'} / {config.eventTime || calculations.eventTime || `${config.startTime || ''} - ${config.endTime || ''}`}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a96e]">{config.tier ? EVENT_TIERS[config.tier]?.label || config.tier : 'event'}</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <EventReportMetric label="Guests" value={calculations.guests || config.guests || plan.guests || 0} />
                  <EventReportMetric label="Revenue" value={formatMoney(plan.projected_revenue ?? calculations.revenue ?? 0)} />
                  <EventReportMetric label="Profit" value={formatMoney(plan.projected_profit ?? calculations.grossProfit ?? 0)} accent />
                  <EventReportMetric label="Margin" value={`${margin.toFixed(1)}%`} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <SmallReportFact label="Cocktails" value={calculations.cocktails || 0} />
                  <SmallReportFact label="Wine" value={`${calculations.wineBottles || 0} btls`} />
                  <SmallReportFact label="Labor" value={`${Number(calculations.laborHours || 0).toFixed(1)}h`} />
                  <SmallReportFact label="Status" value={plan.status || config.eventStatus || 'Saved'} />
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-5 text-sm leading-7 text-[#e8dcc0]">
          No saved event reports yet. Click <span className="font-black text-[#c9a96e]">Save Event</span> after configuring the event.
        </div>
      )}
    </section>
  )
}

function BarSupplyCube({ calculations, tier }) {
  return (
    <CollapsibleEventCube
      icon={Wine}
      label="Bar Supply"
      title="Beverage and bar supply components."
      summary={`${calculations.cocktails} cocktails / ${calculations.wineBottles} wine bottles / ${calculations.glasswareUnits} glassware turns`}
      defaultOpen={false}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <EventMetric icon={GlassWater} label="Cocktails" value={calculations.cocktails} sub={`${tier.cocktailRate} drinks / guest`} />
        <EventMetric icon={Wine} label="Wine Bottles" value={calculations.wineBottles} sub={`${calculations.wineGlasses} glasses planned`} />
        <EventMetric icon={Sparkles} label="Spirit Bottles" value={calculations.spiritBottles} sub="750 ml / 16 pours" />
        <EventMetric icon={Beer} label="Beer Units" value={calculations.beerUnits} sub="1.2 units / guest" />
        <EventMetric icon={ClipboardCheck} label="Glassware" value={calculations.glasswareUnits} sub="3:1 high-end turnover" />
      </div>
      <ProTip icon={GlassWater}>Use large format ice for signature cocktails to reduce dilution, preserve texture, and lower silent over-pouring cost.</ProTip>
    </CollapsibleEventCube>
  )
}

function MenuDietaryCube({ calculations }) {
  return (
    <CollapsibleEventCube
      icon={ChefHat}
      label="Menu & Dietary"
      title="Food composition and dietary handling."
      summary={`${calculations.proteinKg.toFixed(1)} kg protein / ${calculations.dietaryBufferGuests} dietary buffer guests`}
      defaultOpen={false}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EventMetric icon={Utensils} label="Protein" value={`${calculations.proteinKg.toFixed(1)} kg`} sub="200g per guest" />
        <EventMetric icon={ChefHat} label="Starch" value={`${calculations.starchKg.toFixed(1)} kg`} sub="180g per guest" />
        <EventMetric icon={Users} label="Vegetables" value={`${calculations.vegetableKg.toFixed(1)} kg`} sub="160g per guest" />
        <EventMetric icon={ClipboardCheck} label="Sauce" value={`${calculations.sauceKg.toFixed(1)} kg`} sub="60g per guest" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <EventMetric icon={Users} label="Dietary Buffer" value={calculations.dietaryBufferGuests} sub="5% vegan / GF safety net" />
        <EventMetric icon={ClipboardCheck} label="Buffer Food Mass" value={`${calculations.dietaryBufferKg.toFixed(1)} kg`} sub="Social choice protection" />
      </div>
      <ProTip icon={ChefHat}>For luxury events, dietary meals should be plated with equal visual prestige. A safety net is operational insurance, not an afterthought.</ProTip>
    </CollapsibleEventCube>
  )
}

function CollapsibleEventCube({ icon: Icon, label, title, summary, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="overflow-hidden rounded-[2.25rem] border border-[#6b705c]/20 bg-[linear-gradient(135deg,#15140f,#0a0a08)] shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
      <button type="button" onClick={() => setOpen(prev => !prev)} className="flex w-full flex-col gap-4 p-6 text-left transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 text-[#c9a96e]"><Icon className="h-5 w-5" aria-hidden="true" /></div>
          <div className="min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#c9a96e]">{label}</div>
            <h3 className="mt-1 font-serif text-2xl font-black text-[#f5f5f0]">{title}</h3>
            <p className="mt-1 break-words text-xs font-bold leading-5 text-[#e8dcc0]">{summary}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-[#c9a96e]/20 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{open ? 'Close' : 'Open'}</span>
      </button>
      {open && <div className="border-t border-[#6b705c]/20 p-6">{children}</div>}
    </section>
  )
}

function ROIEngine({ calculations }) {
  const cogsStatus = calculations.margin < 30 ? 'critical' : calculations.margin < 42 ? 'watch' : 'healthy'
  const cogsClass = cogsStatus === 'critical' ? 'border-red-800/60 bg-red-950/25 text-red-200' : cogsStatus === 'watch' ? 'border-amber-800/60 bg-amber-950/25 text-amber-200' : 'border-emerald-800/60 bg-emerald-950/25 text-emerald-200'

  return (
    <Card>
      <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]"><CircleDollarSign className="h-4 w-4" aria-hidden="true" /> Financial ROI Engine</div>
      <div className="space-y-3">
        <FinanceRow label="Revenue" value={formatMoney(calculations.revenue)} />
        <FinanceRow label={`COGS (${calculations.cogsPercent}% fixed)`} value={formatMoney(calculations.cogs)} />
        <FinanceRow label={`Labor (${calculations.waiters} waiters, ${calculations.bartenders} bartenders at ${formatMoney(EVENT_LABOR_HOURLY_RATE)}/h)`} value={formatMoney(calculations.laborCost)} />
        <div className="my-4 border-t border-[#6b705c]/30" />
        <FinanceRow label="Gross Profit" value={formatMoney(calculations.grossProfit)} strong />
        <FinanceRow label="Gross Margin" value={`${calculations.margin.toFixed(1)}%`} strong />
      </div>
      <div className={cx('mt-5 rounded-2xl border p-4 text-sm leading-7', cogsClass)}>
        <div className="mb-1 flex items-center gap-2 font-black"><AlertTriangle className="h-4 w-4" aria-hidden="true" /> Profit Discipline</div>
        {cogsStatus === 'critical' ? 'Margin is below the safe event target. Reprice, simplify package complexity, or reduce labor pressure before confirmation.' : cogsStatus === 'watch' ? 'Margin is acceptable but not premium. Watch bar volume, premium garnish, staffing creep, and open-bar leakage.' : 'Margin is healthy under the fixed 27% COGS and 60 NIS labor-hour model.'}
      </div>
    </Card>
  )
}

function EventMetric({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 text-[#c9a96e]"><Icon className="h-5 w-5" aria-hidden="true" /></div>
      <div className="break-words font-serif text-3xl font-black text-[#f5f5f0]">{value}</div>
      <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
      <p className="mt-2 text-xs leading-5 text-[#e8dcc0]">{sub}</p>
    </div>
  )
}

function EventMiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#6b705c]/25 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
      <div className="mt-1 break-words font-serif text-2xl font-black text-[#f5f5f0]">{value}</div>
    </div>
  )
}

function EventReportMetric({ label, value, accent = false }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#6b705c]/25 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
      <div className={cx('mt-2 break-words font-serif text-2xl font-black leading-7 sm:text-3xl', accent ? 'text-[#c9a96e]' : 'text-[#f5f5f0]')}>{value}</div>
    </div>
  )
}

function SmallReportFact({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#6b705c]/25 bg-[#1a1a1a] p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
      <div className="mt-1 break-words text-xs font-black leading-5 text-[#f5f5f0]">{value}</div>
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">{label}</label>
      <select id={id} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20">
        {options.map(option => {
          const normalized = typeof option === 'string' ? { value: option, label: option } : option
          return <option key={normalized.value} value={normalized.value}>{normalized.label}</option>
        })}
      </select>
    </div>
  )
}

function NumberInput({ label, value, onChange, min, max, step = '1', type = 'number' }) {
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">{label}</label>
      <input id={id} type={type} value={value} min={min} max={max} step={step} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20" />
    </div>
  )
}

function MiniFact({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#6b705c]/30 pb-3 last:border-0 last:pb-0">
      <span className="text-xs font-bold text-[#e8dcc0]">{label}</span>
      <span className="font-serif text-2xl font-black text-[#f5f5f0]">{value}</span>
    </div>
  )
}

function FinanceRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={cx('text-sm', strong ? 'font-black text-[#f5f5f0]' : 'text-[#e8dcc0]')}>{label}</span>
      <span className={cx('text-sm font-black', strong ? 'text-[#c9a96e]' : 'text-[#e8dcc0]')}>{value}</span>
    </div>
  )
}

function ProTip({ icon: Icon, children }) {
  return (
    <div className="mt-5 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-4 text-sm leading-7 text-[#e8dcc0]">
      <div className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#c9a96e]"><Icon className="h-4 w-4" aria-hidden="true" /> Pro Tip</div>
      {children}
    </div>
  )
}

function formatMoney(value) {
  return `NIS ${Math.round(value).toLocaleString()}`
}

function Courses({ t, currentUser, academyProgress = {}, onOpenLesson }) {
  const academies = useMemo(() => getVisibleAcademies(currentUser), [currentUser])
  const completedLessons = getUserLessonProgress(academyProgress, currentUser)

  return (
    <>
      <Header eyebrow={t.areas.academy} title="HOSPIA University" body="Structured hospitality academies for service, bar, wine, events, hosting, and management. Lessons unlock in order so learning builds like a professional curriculum." />
      <Card className="mb-6 border-[#c9a96e]/20 bg-[#0f0f0e]">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px] md:items-center">
          <div>
            <Label>University Flow</Label>
            <p className="max-w-3xl text-sm leading-7 text-[#e8dcc0]">
              Choose an academy, complete the first lesson, and unlock the next. Employees see operational academies; managers and admins also see Manager Academy.
            </p>
          </div>
          <div className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
            <div className="font-serif text-3xl font-black text-[#c9a96e]">{countCompletedLessons(completedLessons)} / {countUniversityLessons(academies)}</div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">Completed Lessons</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {academies.map(academy => {
          const total = academy.lessons?.length || 0
          const completeCount = academy.lessons?.filter(lesson => isLessonComplete(completedLessons, academy.id, lesson.id)).length || 0
          const progress = total ? Math.round((completeCount / total) * 100) : 0
          const nextLesson = academy.lessons?.find((lesson, index) => (
            isLessonUnlocked(academy, index, completedLessons) && !isLessonComplete(completedLessons, academy.id, lesson.id)
          )) || academy.lessons?.[Math.max(0, total - 1)]

          return (
            <Card key={academy.id} className="flex min-h-80 flex-col justify-between border-[#6b705c]/30 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.09),transparent_34%),#14130f] transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a96e]/45 hover:shadow-[0_28px_90px_rgba(0,0,0,0.42)]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c9a96e]">{academy.category}</div>
                  {academy.badge && (
                    <span className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a96e]">
                      {academy.badge}
                    </span>
                  )}
                </div>
                <h2 className="mt-5 font-serif text-3xl font-black leading-tight text-[#f5f5f0]">{academy.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[#e8dcc0]">{academy.description}</p>
                <div className="mt-5 rounded-2xl border border-[#6b705c]/25 bg-[#10100e] p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/70">Next lesson</div>
                  <div className="mt-1 text-sm font-black text-[#f5f5f0]">{nextLesson?.title || 'Academy content pending'}</div>
                </div>
              </div>
              <div className="mt-8">
                <Progress value={progress} label={academy.title} />
                <div className="mt-5 flex items-center justify-between gap-4">
                  <span className="text-xs font-black text-[#e8dcc0]">{completeCount} / {total} lessons</span>
                  <Button disabled={!nextLesson} onClick={() => onOpenLesson?.(academy.id, nextLesson.id)}>
                    {progress === 100 ? 'Review Academy' : 'Open Academy'}
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}

function LessonPlayer({ t, currentUser, goToPage, academyProgress = {}, selectedAcademyId, selectedLessonId, onOpenLesson, onCompleteLesson }) {
  const [started, setStarted] = useState(false)
  const visibleAcademies = useMemo(() => getVisibleAcademies(currentUser), [currentUser])
  const completedLessons = getUserLessonProgress(academyProgress, currentUser)
  const academy = visibleAcademies.find(item => item.id === selectedAcademyId) || visibleAcademies[0]
  const foundLessonIndex = academy?.lessons?.findIndex(item => item.id === selectedLessonId) ?? 0
  const lessonIndex = foundLessonIndex >= 0 ? foundLessonIndex : 0
  const lesson = academy?.lessons?.[lessonIndex] || academy?.lessons?.[0]
  const unlocked = academy && lesson ? isLessonUnlocked(academy, lessonIndex, completedLessons) : false
  const complete = academy && lesson ? isLessonComplete(completedLessons, academy.id, lesson.id) : false
  const hasContent = lessonHasExpandedContent(lesson)
  const nextLesson = academy?.lessons?.[lessonIndex + 1]
  const nextUnlocked = nextLesson && isLessonComplete(completedLessons, academy.id, lesson.id)

  if (!academy || !lesson) {
    return (
      <>
        <Header eyebrow={t.pages.lessonPlayer} title="Lesson unavailable" body="No academy lessons are available for this role yet." />
        <Button onClick={() => goToPage('courses')}>Back To Courses</Button>
      </>
    )
  }

  return (
    <>
      <Header eyebrow={academy.title} title={lesson.title} body={academy.description} />
      <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit border-[#c9a96e]/15">
          <Label>Lesson Path</Label>
          <div className="space-y-3">
            {academy.lessons.map((item, index) => {
              const itemUnlocked = isLessonUnlocked(academy, index, completedLessons)
              const itemComplete = isLessonComplete(completedLessons, academy.id, item.id)
              const active = item.id === lesson.id
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={!itemUnlocked}
                  onClick={() => onOpenLesson?.(academy.id, item.id)}
                  className={cx(
                    'w-full rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45',
                    active ? 'border-[#c9a96e]/45 bg-[#c9a96e]/10' : 'border-[#6b705c]/25 bg-[#10100e] hover:border-[#c9a96e]/35'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]/70">Lesson {index + 1}</span>
                    <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em]', itemComplete ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : itemUnlocked ? 'border-[#c9a96e]/25 text-[#c9a96e]' : 'border-[#6b705c]/30 text-[#e8dcc0]/60')}>
                      {itemComplete ? 'Complete' : itemUnlocked ? 'Open' : 'Locked'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm font-black leading-5 text-[#f5f5f0]">{item.title}</div>
                </button>
              )
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.11),transparent_34%),#14130f]">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e]">{academy.category}</div>
                <h2 className="mt-3 font-serif text-4xl font-black text-[#f5f5f0]">{lesson.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">{lesson.duration || 'Self-paced lesson'}</p>
              </div>
              <button type="button" onClick={() => setStarted(value => !value)} className="min-h-12 rounded-full bg-[#c9a96e] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#11100d] transition hover:scale-[1.02]" aria-pressed={started}>
                {started ? 'Pause Lesson' : 'Start Lesson'}
              </button>
            </div>
          </Card>

          {!unlocked ? (
            <Card className="border-amber-500/25 bg-amber-950/10">
              <Label>Locked Lesson</Label>
              <p className="text-sm leading-7 text-[#e8dcc0]">Complete the previous lesson to unlock this module.</p>
            </Card>
          ) : hasContent ? (
            <div className="grid gap-5 lg:grid-cols-2">
              <LessonContentBlock title="Objective" value={lesson.objective} featured />
              <LessonContentBlock title="Doctrine" value={lesson.doctrine} featured />
              <LessonContentBlock title="Technical Depth" value={lesson.technical_depth} />
              <LessonContentBlock title="Standards" value={lesson.standards} />
              <LessonContentBlock title="Terminology" value={lesson.terminology} />
              <LessonContentBlock title="Taxonomy" value={lesson.taxonomy} />
              <LessonContentBlock title="Operational Consequences" value={lesson.operational_consequences} />
              <LessonContentBlock title="Amateur Vs Pro" value={lesson.amateur_vs_pro} featured />
              <LessonContentBlock title="Common Failures" value={lesson.common_failures} />
              <LessonContentBlock title="Recovery Logic" value={lesson.recovery_logic} />
              <LessonContentBlock title="Professional Standard" value={lesson.professional_standard} featured />
              <LessonContentBlock title="Real Service Context" value={lesson.real_service_context} />
              <LessonContentBlock title="Practical Execution" value={lesson.practical_execution} />
              <LessonContentBlock title="Guest Application" value={lesson.guest_application} featured />
              <LessonContentBlock title="Manager Notes" value={lesson.manager_notes} />
              <LessonContentBlock title="Drill" value={lesson.drill} featured />
              <LessonContentBlock title="Assessment Questions" value={lesson.assessment_questions} />
            </div>
          ) : (
            <Card>
              <Label>Lesson Content</Label>
              <p className="text-sm leading-7 text-[#e8dcc0]">Lesson content pending academy expansion</p>
            </Card>
          )}

          <Card className="border-l-4 border-l-[#c9a96e] bg-gradient-to-r from-[#c9a96e]/5 to-transparent">
            <h2 className="font-serif text-2xl font-black text-[#f5f5f0]">HOSPIA Doctrine</h2>
            <p className="mt-3 font-serif text-lg italic leading-8 text-[#f5f5f0]">"{t.copy.doctrine}"</p>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button disabled={!unlocked || complete} onClick={() => onCompleteLesson?.(academy.id, lesson.id)}>
              {complete ? 'Lesson Complete' : 'Mark Lesson Complete'}
            </Button>
            <Button variant="secondary" disabled={!nextUnlocked} onClick={() => nextLesson && onOpenLesson?.(academy.id, nextLesson.id)}>
              Next Lesson
            </Button>
            <Button variant="ghost" onClick={() => goToPage('courses')}>Back To Courses</Button>
          </div>
        </div>
      </div>
    </>
  )
}

function LessonContentBlock({ title, value, featured = false }) {
  if (!value || (Array.isArray(value) && !value.length)) return null

  return (
    <Card className={cx('h-full', featured && 'border-[#c9a96e]/25 bg-[#19170f]')}>
      <Label>{title}</Label>
      {Array.isArray(value) ? (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={typeof item === 'object' ? `${item.type || item.title || 'item'}-${index}` : item} className="rounded-xl border border-[#6b705c]/25 bg-[#10100e] p-3 text-sm leading-6 text-[#e8dcc0]">
              {typeof item === 'object' ? (
                <>
                  <span className="font-black text-[#f5f5f0]">{item.type || item.title || item.label || `Point ${index + 1}`}: </span>
                  {item.usage || item.detail || item.value || Object.entries(item).filter(([key]) => !['type', 'title', 'label'].includes(key)).map(([key, nested]) => `${key}: ${nested}`).join(' - ')}
                </>
              ) : item}
            </div>
          ))}
        </div>
      ) : typeof value === 'object' ? (
        <div className="space-y-2">
          {Object.entries(value).map(([key, item]) => (
            <div key={key} className="rounded-xl border border-[#6b705c]/25 bg-[#10100e] p-3 text-sm leading-6 text-[#e8dcc0]">
              <span className="font-black text-[#f5f5f0]">{key}: </span>{String(item)}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm leading-7 text-[#e8dcc0]">{value}</p>
      )}
    </Card>
  )
}

function LegacyLessonPlayer({ t, currentUser, goToPage }) {
  const [started, setStarted] = useState(false)
  const canPractice = canAccessPage(currentUser, 'simulation')

  return (
    <>
      <Header eyebrow={t.pages.lessonPlayer} title={t.pages.lessonPlayer} body={t.copy.academyTitle} />
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8">
          <Card className="border-[#c9a96e]/20">
            <div className="flex min-h-96 items-center justify-center rounded-2xl border border-[#6b705c]/30 bg-[#1b1a15]">
              <button type="button" onClick={() => setStarted(value => !value)} className="flex h-24 w-24 items-center justify-center rounded-full bg-[#c9a96e] text-lg font-black uppercase tracking-[0.16em] text-[#1a1a1a] transition hover:scale-105" aria-pressed={started}>
                {started ? 'Pause' : 'Play'}
                <span className="hidden">
                ג–¶
                </span>
              </button>
            </div>
          </Card>
          <Card className="border-l-4 border-l-[#c9a96e] bg-gradient-to-r from-[#c9a96e]/5 to-transparent">
            <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">HOSPIA Doctrine</h2>
            <p className="mt-4 font-serif text-xl italic leading-10 text-[#f5f5f0]">
              ג€{t.copy.doctrine}ג€
            </p>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <Label>Key Takeaways</Label>
            <List items={[
              'Acknowledge the guest before solving the technical problem.',
              'Use exact, calm language during delay moments.',
              'Protect trust before offering compensation.'
            ]} />
          </Card>

          <Card>
            <Label>Suggested Language</Label>
            <div className="rounded-2xl border-l-4 border-[#c9a96e] bg-[#1b1a15] p-5 font-serif text-lg italic leading-8 text-[#f5f5f0]">
              ג€I completely understand, and I will take care of this immediately.ג€
            </div>
          </Card>

          <div className="flex flex-wrap gap-4">
            <Button onClick={() => goToPage('knowledgeLibrary')}>{t.ui.askCoach}</Button>
            <Button variant="secondary" onClick={() => goToPage(canPractice ? 'simulation' : 'sopSheets')}>{canPractice ? t.ui.practice : 'Review Service'}</Button>
            <Button variant="secondary" onClick={() => goToPage(canPractice ? 'simulation' : 'serviceRecovery')}>{canPractice ? t.ui.quickQuiz : 'Report An Issue'}</Button>
          </div>
        </div>
      </div>
    </>
  )
}

function EndOfDayReports({ t, reportArchive = [], onReportArchived }) {
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState(null)
  const [formData, setFormData] = useState({
    shift_date: new Date().toISOString().slice(0, 10),
    manager_name: '',
    shift_summary: '',
    complaints: '',
    service_recovery: '',
    staff_issues: '',
    sales_notes: '',
    urgent_items: ''
  })

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  async function sendEndOfDayReport(event) {
    event.preventDefault()
    setStatus(null)
    setSending(true)

    try {
      const emailjs = await loadEmailJS()

      await emailjs.send(
        EMAILJS.serviceId,
        EMAILJS.templateId,
        {
          shift_date: formData.shift_date,
          manager_name: formData.manager_name,
          shift_summary: formData.shift_summary,
          complaints: formData.complaints,
          service_recovery: formData.service_recovery,
          staff_issues: formData.staff_issues,
          sales_notes: formData.sales_notes,
          urgent_items: formData.urgent_items
        },
        EMAILJS.publicKey
      )

      await onReportArchived?.({ ...formData })
      setStatus({ type: 'success', message: t.ui.reportSent })
      setFormData({
        shift_date: new Date().toISOString().slice(0, 10),
        manager_name: '',
        shift_summary: '',
        complaints: '',
        service_recovery: '',
        staff_issues: '',
        sales_notes: '',
        urgent_items: ''
      })
    } catch (error) {
      console.error('EmailJS failed:', error)
      setStatus({ type: 'error', message: t.ui.reportError })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Header eyebrow={t.pages.endOfDay} title={t.pages.endOfDay} body={t.copy.endOfDayBody} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card>
          <form onSubmit={sendEndOfDayReport} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="shift_date" label={t.fields.shiftDate} type="date" value={formData.shift_date} onChange={value => updateField('shift_date', value)} />
              <Field id="manager_name" label={t.fields.managerName} value={formData.manager_name} onChange={value => updateField('manager_name', value)} />
            </div>
            <TextArea id="shift_summary" label={t.fields.shiftSummary} value={formData.shift_summary} onChange={value => updateField('shift_summary', value)} />
            <TextArea id="complaints" label={t.fields.complaints} value={formData.complaints} onChange={value => updateField('complaints', value)} />
            <TextArea id="service_recovery" label={t.fields.serviceRecovery} value={formData.service_recovery} onChange={value => updateField('service_recovery', value)} />
            <TextArea id="staff_issues" label={t.fields.staffIssues} value={formData.staff_issues} onChange={value => updateField('staff_issues', value)} />
            <TextArea id="sales_notes" label={t.fields.salesNotes} value={formData.sales_notes} onChange={value => updateField('sales_notes', value)} />
            <TextArea id="urgent_items" label={t.fields.urgentItems} value={formData.urgent_items} onChange={value => updateField('urgent_items', value)} />

            {status && <Alert type={status.type}>{status.message}</Alert>}

            <Button type="submit" disabled={sending}>
              {sending ? t.ui.submitting : t.ui.submitForm}
            </Button>
          </form>
        </Card>
        <div className="space-y-4">
          <Card className="border-[#c9a96e]/20 bg-[#1a1a1a]">
            <Label>Report Archive</Label>
            <div className="font-serif text-5xl font-black text-[#c9a96e]">{reportArchive.length}</div>
            <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">Successful EmailJS submissions are preserved locally as shift memory. This is the future database-backed archive.</p>
          </Card>
          <Card>
            <Label>Latest Reports</Label>
            {reportArchive.length ? (
              <div className="space-y-3">
                {reportArchive.slice(0, 5).map(report => (
                  <article key={report.id} className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-[#e8dcc0]">{report.shift_date}</span>
                      <span className="text-xs text-[#e8dcc0]">{report.manager_name || 'Manager'}</span>
                    </div>
                    <p className="line-clamp-3 text-xs leading-6 text-[#e8dcc0]">{report.urgent_items || report.shift_summary || 'Report submitted without urgent items.'}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-7 text-[#e8dcc0]">No submitted reports archived yet.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

function StaffReadiness({ t }) {
  const [serviceContext, setServiceContext] = useState('standard')
  const avgProgress = Math.round(STAFF.reduce((sum, item) => sum + item.progress, 0) / STAFF.length)
  const avgSimulation = Math.round(STAFF.reduce((sum, item) => sum + item.simulation, 0) / STAFF.length)
  const coachingCount = STAFF.filter(item => item.status === 'Needs Coaching' || item.status === 'At Risk').length

  const serviceRequirements = {
    standard: { label: 'Standard Shift', minSim: 70, weight: 'Balanced' },
    highVolume: { label: 'High Volume / Peak', minSim: 80, weight: 'Efficiency' },
    vipEvent: { label: 'VIP / Fine Dining', minSim: 85, weight: 'Recovery & Language' }
  }

  const deploymentMetrics = useMemo(() => {
    const req = serviceRequirements[serviceContext]
    const readyStaff = STAFF.filter(s => s.simulation >= req.minSim).length
    const teamScore = Math.round((readyStaff / STAFF.length) * 100)
    return { readyStaff, teamScore, req }
  }, [serviceContext])

  const statusClass = {
    Certified: 'border-emerald-800/50 bg-emerald-950/25 text-emerald-200',
    Active: 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]',
    'Needs Coaching': 'border-amber-800/50 bg-amber-950/25 text-amber-200',
    'At Risk': 'border-red-800/50 bg-red-950/25 text-red-200'
  }

  return (
    <>
      <Header eyebrow={t.pages.staffReadiness} title="Team Deployment Optimizer" body="Move beyond tracking progress. Optimize your floor plan based on actual simulation scores and tonight's service requirements." />
      
      <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_350px]">
        <Card className="border-[#c9a96e]/20 bg-[#1a1a1a]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Label>Tonight's Service Context</Label>
              <div className="flex gap-2">
                {Object.entries(serviceRequirements).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setServiceContext(key)}
                    className={cx(
                      'rounded-xl border px-4 py-2 text-xs font-black uppercase tracking-widest transition',
                      serviceContext === key ? 'border-[#c9a96e] bg-[#c9a96e] text-[#0d0c09]' : 'border-[#6b705c]/30 text-[#e8dcc0] hover:border-[#c9a96e]/50'
                    )}
                  >
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#6b705c]/30 p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0] mb-2">Team Readiness Score</div>
              <div className={cx('font-serif text-5xl font-black', deploymentMetrics.teamScore > 80 ? 'text-emerald-400' : 'text-[#c9a96e]')}>
                {deploymentMetrics.teamScore}%
              </div>
              <p className="mt-2 text-xs text-[#e8dcc0]">Based on {deploymentMetrics.req.minSim}% simulation threshold</p>
            </div>
            <div className="rounded-2xl border border-[#6b705c]/30 p-5">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0] mb-2">Deployment Strategy</div>
              <div className="text-lg font-bold text-[#f5f5f0]">{deploymentMetrics.readyStaff} of {STAFF.length} staff cleared</div>
              <p className="mt-2 text-xs text-[#e8dcc0]">Critical focus: {deploymentMetrics.req.weight}</p>
            </div>
          </div>
        </Card>
        <Card className="border-[#c9a96e]/20">
          <Label>AI Allocation Guidance</Label>
          <p className="text-sm leading-7 text-[#e8dcc0]">
            {deploymentMetrics.teamScore < 70 
              ? "Warning: Team technical depth is insufficient for this service level. Assign Noa B. to the primary VIP zone and mandate a 10-minute briefing for Dana and Oren."
              : "Team is healthy for standard operations. Leverage Yoav S. as shift lead for secondary zones."}
          </p>
        </Card>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Avg Training" value={`${avgProgress}%`} sub="Across active staff" />
        <Metric label="Avg Simulation" value={`${avgSimulation}%`} sub="Target: 85%" />
        <Metric label="Certified" value={String(STAFF.filter(item => item.status === 'Certified').length)} sub={`${STAFF.length} staff tracked`} />
        <Metric label="Coaching Required" value={String(coachingCount)} sub="Manager attention" />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#e8dcc0]">
                <th className="border-b border-[#6b705c]/30 p-3">Staff Member</th>
                <th className="border-b border-[#6b705c]/30 p-3">Academy</th>
                <th className="border-b border-[#6b705c]/30 p-3">Simulation</th>
                <th className="border-b border-[#6b705c]/30 p-3">Strongest Area</th>
                <th className="border-b border-[#6b705c]/30 p-3">Needs Work</th>
                <th className="border-b border-[#6b705c]/30 p-3">Status</th>
                <th className="border-b border-[#6b705c]/30 p-3">Next Action</th>
              </tr>
            </thead>
            <tbody>
              {STAFF.map(item => (
                <tr key={item.name} className="text-sm transition hover:bg-[#6b705c]/10">
                  <td className="border-b border-[#6b705c]/30 p-3">
                    <div className="font-black text-[#f5f5f0]">{item.name}</div>
                    <div className="text-xs text-[#e8dcc0]">{item.role}</div>
                  </td>
                  <td className="border-b border-[#6b705c]/30 p-3">
                    <div className="flex items-center gap-3">
                      <div className="min-w-[90px] flex-1"><Progress value={item.progress} label={item.name} /></div>
                      <span className="w-9 text-xs font-black text-[#e8dcc0]">{item.progress}%</span>
                    </div>
                  </td>
                  <td className="border-b border-[#6b705c]/30 p-3">
                    <span className={cx('font-black', item.simulation >= 80 ? 'text-emerald-400' : item.simulation >= 65 ? 'text-[#c9a96e]' : 'text-red-400')}>{item.simulation}%</span>
                  </td>
                  <td className="border-b border-[#6b705c]/30 p-3 text-xs text-[#e8dcc0]">{item.strong}</td>
                  <td className="border-b border-[#6b705c]/30 p-3 text-xs text-[#e8dcc0]">{item.weak}</td>
                  <td className="border-b border-[#6b705c]/30 p-3"><span className={cx('rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]', statusClass[item.status])}>{item.status}</span></td>
                  <td className="border-b border-[#6b705c]/30 p-3 text-xs leading-5 text-[#e8dcc0]">{item.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="mt-5 border-amber-900/40 bg-amber-950/10">
        <Label>Highest Leverage Coaching Move</Label>
        <p className="text-sm leading-7 text-[#e8dcc0]">Do not wait for a guest complaint to discover readiness risk. Dana and Oren should complete one recovery simulation before the weekend, then be paired with Noa for live language calibration.</p>
      </Card>
    </>
  )
}

function EmployeeHome({ t, currentUser, goToPage, academyProgress = {}, employeeTasks = [], employeeRequests = [], approvedCocktails = [], cocktailPractice = {} }) {
  const employeeName = currentUser?.username || 'Employee'
  const pendingTasks = employeeTasks.filter(task => task.status !== 'done')
  const practiced = Object.values(cocktailPractice[employeeName] || {}).filter(item => item?.practiced).length
  const practiceRate = approvedCocktails.length ? Math.round((practiced / approvedCocktails.length) * 100) : 0
  const visibleAcademies = getVisibleAcademies(currentUser)
  const completedLessons = getUserLessonProgress(academyProgress, currentUser)
  const totalLessons = countUniversityLessons(visibleAcademies)
  const completedLessonCount = countCompletedLessons(completedLessons)
  const courseAverage = totalLessons ? Math.round((completedLessonCount / totalLessons) * 100) : 0
  const myRequests = employeeRequests.filter(request => request.submittedBy === employeeName)
  const todayLabel = new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  const nextAcademy = visibleAcademies.find(academy => academy.lessons?.some((lesson, index) => (
    isLessonUnlocked(academy, index, completedLessons) && !isLessonComplete(completedLessons, academy.id, lesson.id)
  ))) || visibleAcademies[0]
  const nextLesson = nextAcademy?.lessons?.find((lesson, index) => (
    isLessonUnlocked(nextAcademy, index, completedLessons) && !isLessonComplete(completedLessons, nextAcademy.id, lesson.id)
  )) || nextAcademy?.lessons?.[0]
  const cocktailFocus = approvedCocktails[0]?.name || 'Reserve list pending'
  const experienceSections = [
    {
      title: 'Today Operations',
      value: pendingTasks.length ? `${pendingTasks.length} open` : 'Clear',
      body: pendingTasks[0]?.title || 'No urgent assigned work. Stay ready for live service signals.',
      page: pendingTasks.length ? 'serviceRecovery' : 'courses'
    },
    {
      title: 'Continue Learning',
      value: `${courseAverage}%`,
      body: `${nextLesson?.title || 'Academy lesson'} is the next active progression path.`,
      page: 'lessonPlayer'
    },
    {
      title: 'Service Culture',
      value: 'Rituals',
      body: 'Guest language, sequence standards, floor conduct, and emotional hospitality.',
      page: 'sopSheets'
    },
    {
      title: 'Approved Cocktail Library',
      value: String(approvedCocktails.length),
      body: `${cocktailFocus}. Study approved flagship creations before service.`,
      page: 'approvedCocktails'
    },
    {
      title: 'Report An Issue',
      value: 'Fast',
      body: 'Protect service quality early with a safe operational report.',
      page: 'serviceRecovery'
    }
  ]
  const modules = [
    {
      id: 'courses',
      label: 'Continue Learning',
      page: 'lessonPlayer',
      size: 'primary',
      layout: 'xl:col-start-1 xl:row-start-1'
    },
    {
      id: 'sopSheets',
      label: 'Service',
      page: 'sopSheets',
      size: 'hero',
      layout: 'xl:col-start-2 xl:row-start-1'
    },
    {
      id: 'approvedCocktails',
      label: 'Approved Cocktail Library',
      page: 'approvedCocktails',
      size: 'secondary',
      layout: 'xl:col-start-3 xl:row-start-1',
      titleClass: 'text-[1.2rem] sm:text-[1.4rem]'
    },
    {
      id: 'employeeRequests',
      label: 'Employee Requests',
      page: 'employeeRequests',
      size: 'secondary',
      layout: 'xl:col-start-1 xl:row-start-2'
    },
    {
      id: 'serviceRecovery',
      label: 'Report An Issue',
      page: 'serviceRecovery',
      size: 'primary',
      layout: 'xl:col-start-2 xl:row-start-2'
    },
    {
      id: 'employeeAchievements',
      label: 'Achievements',
      page: 'employeeAchievements',
      size: 'secondary',
      layout: 'xl:col-start-3 xl:row-start-2'
    }
  ]

  return (
    <section className="relative min-h-[calc(100vh-4.75rem)] overflow-hidden rounded-[2rem] border border-[#6b705c]/14 bg-[radial-gradient(circle_at_18%_12%,rgba(201,169,110,0.14),transparent_31%),radial-gradient(circle_at_82%_24%,rgba(232,220,192,0.07),transparent_28%),linear-gradient(135deg,#12110e,#070706_72%)] px-4 py-4 shadow-[0_28px_100px_rgba(0,0,0,0.36)] sm:px-6 lg:px-7">
      <div className="pointer-events-none absolute left-1/2 top-[55%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c9a96e]/[0.045]" />
      <div className="pointer-events-none absolute left-1/2 top-[55%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6b705c]/[0.06]" />
      <div className="relative mx-auto max-w-[1180px]">
        <header className="mx-auto max-w-3xl text-center">
          <div className="mb-2 text-[8px] font-black uppercase tracking-[0.34em] text-[#c9a96e]">Employee Hospitality OS</div>
          <h1 className="font-serif text-[clamp(2.15rem,4.2vw,4.6rem)] font-black leading-[0.98] tracking-tight text-[#f5f5f0]">Own the shift.</h1>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-[#e8dcc0]/76 sm:text-sm">Training, service culture, bar knowledge, and issue reporting shaped into one calm operating surface.</p>
        </header>

        <div className="mx-auto mt-4 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          <EmployeeHomeSignal label="Today" value={todayLabel} />
          <EmployeeHomeSignal label="Assigned Work" value={`${pendingTasks.length} open`} />
          <EmployeeHomeSignal label="Cocktail Practice" value={`${practiceRate}%`} />
          <EmployeeHomeSignal label="Requests" value={String(myRequests.length)} />
        </div>

        <div className="mx-auto mt-3 grid max-w-6xl gap-2.5 md:grid-cols-2 xl:grid-cols-5">
          {experienceSections.map(section => (
            <EmployeeOperatingMoment key={section.title} section={section} onOpen={() => goToPage(section.page)} />
          ))}
        </div>

        <div className="mx-auto mt-5 grid max-w-[960px] grid-cols-1 place-items-center gap-3 pb-2 sm:grid-cols-2 sm:gap-4 xl:mt-6 xl:grid-cols-3 xl:grid-rows-[150px_150px] xl:items-center xl:gap-4">
          {modules.map(module => (
            <EmployeeBubbleModule key={module.id} module={module} onOpen={() => goToPage(module.page)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function EmployeeHomeSignal({ label, value }) {
  return (
    <div className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-[#6b705c]/14 bg-white/[0.022] px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      <span className="text-[8px] font-black uppercase tracking-[0.15em] text-[#e8dcc0]/48">{label}</span>
      <span className="font-serif text-sm font-black text-[#c9a96e] sm:text-base">{value}</span>
    </div>
  )
}

function EmployeeProgressionTrack({ items }) {
  return (
    <div className="mx-auto mt-2.5 flex max-w-5xl flex-wrap items-center justify-center gap-1.5">
      {items.map(item => (
        <div key={item.label} className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a96e]/10 bg-[#c9a96e]/[0.026] px-2.5 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <span className="text-[7px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]/38">{item.label}</span>
          <span className="max-w-[8rem] truncate text-[9px] font-black uppercase tracking-[0.07em] text-[#f5f5f0]/82">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function EmployeeOperatingMoment({ section, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group min-h-[88px] rounded-[1.25rem] border border-[#6b705c]/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(0,0,0,0.15))] p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.022)] transition-all duration-500 hover:-translate-y-0.5 hover:border-[#c9a96e]/24 hover:bg-[#c9a96e]/[0.035] hover:shadow-[0_16px_52px_rgba(0,0,0,0.24)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-base font-black leading-tight text-[#f5f5f0] transition group-hover:text-[#c9a96e]">{section.title}</h3>
        <span className="shrink-0 rounded-full border border-[#c9a96e]/14 bg-black/18 px-2 py-0.5 text-[9px] font-black text-[#c9a96e]">{section.value}</span>
      </div>
      <p className="mt-2 line-clamp-2 max-h-9 overflow-hidden text-[11px] leading-[1.1rem] text-[#e8dcc0]/64">{section.body}</p>
    </button>
  )
}

function EmployeeBubbleModule({ module, onOpen }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const sizeClass = {
    secondary: 'h-[140px] w-full max-w-[250px] sm:h-[150px] sm:max-w-[270px] xl:h-full xl:max-w-none',
    primary: 'h-[152px] w-full max-w-[280px] sm:h-[164px] sm:max-w-[300px] xl:h-full xl:max-w-none',
    hero: 'h-[172px] w-full max-w-[315px] sm:h-[184px] sm:max-w-[350px] xl:h-full xl:max-w-none'
  }[module.size] || 'h-[150px] w-full max-w-[270px]'
  const titleClass = {
    secondary: 'text-xl sm:text-2xl',
    primary: 'text-2xl sm:text-3xl',
    hero: 'text-3xl sm:text-4xl'
  }[module.size] || 'text-2xl'
  const resolvedTitleClass = module.titleClass || titleClass

  function move(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 5
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -5
    setTilt({ x, y })
  }

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseMove={move}
      onMouseLeave={() => {
        setHovered(false)
        setTilt({ x: 0, y: 0 })
      }}
      onClick={onOpen}
      className={cx(
        'group relative flex shrink-0 items-center justify-center overflow-hidden rounded-[999px] border border-[#c9a96e]/13 bg-[radial-gradient(circle_at_32%_10%,rgba(255,255,255,0.07),transparent_27%),linear-gradient(145deg,rgba(201,169,110,0.105),rgba(18,17,13,0.82)_48%,rgba(0,0,0,0.52))] px-5 py-4 text-center shadow-[0_22px_70px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.045)] outline-none transition-[border-color,box-shadow,filter] duration-500 hover:border-[#c9a96e]/34 hover:shadow-[0_28px_86px_rgba(0,0,0,0.42),0_0_30px_rgba(201,169,110,0.08)] focus-visible:ring-2 focus-visible:ring-[#c9a96e]/40',
        sizeClass,
        module.layout
      )}
      style={{ transform: `perspective(900px) translateY(${hovered ? -4 : 0}px) scale(${hovered ? 1.012 : 1}) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_78%,rgba(201,169,110,0.15),transparent_29%)] opacity-60 transition duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-[10px] rounded-[999px] border border-white/[0.032]" />
      <div className="pointer-events-none absolute left-1/2 top-7 h-2 w-2 -translate-x-1/2 rounded-full bg-[#c9a96e]/55 shadow-[0_0_24px_rgba(201,169,110,0.28)]" />

      <div className="relative z-10 flex h-full w-full max-w-[80%] min-w-0 flex-col items-center justify-center">
        <h2 className={cx('mx-auto max-w-[15rem] break-words font-serif font-black leading-[0.98] tracking-tight text-[#f5f5f0] transition duration-500 [text-wrap:balance] group-hover:text-[#c9a96e]', resolvedTitleClass)}>
          {module.label}
        </h2>
      </div>
    </button>
  )
}

function formatRequestStatus(status = '') {
  return status.replaceAll('_', ' ').replace(/\b\w/g, char => char.toUpperCase())
}

function RequestStatusChip({ status }) {
  const style = {
    pending_manager_review: 'border-amber-800/45 bg-amber-950/20 text-amber-200',
    rejected_by_manager: 'border-red-800/45 bg-red-950/20 text-red-200',
    approved_by_manager: 'border-[#c9a96e]/35 bg-[#c9a96e]/10 text-[#c9a96e]',
    pending_owner_review: 'border-[#c9a96e]/35 bg-[#c9a96e]/10 text-[#c9a96e]',
    approved_by_owner: 'border-emerald-800/45 bg-emerald-950/20 text-emerald-200',
    rejected_by_owner: 'border-red-800/45 bg-red-950/20 text-red-200'
  }

  return (
    <span className={cx('rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]', style[status] || 'border-[#6b705c]/30 bg-black/20 text-[#e8dcc0]')}>
      {formatRequestStatus(status)}
    </span>
  )
}

function EmployeeRequests({ currentUser, employeeRequests = [], onSubmit }) {
  const employeeName = currentUser?.username || 'Employee'
  const [form, setForm] = useState({
    title: '',
    category: 'Bar Supply',
    description: '',
    urgency: 'Medium',
    estimatedCost: ''
  })
  const [status, setStatus] = useState(null)
  const myRequests = useMemo(
    () => employeeRequests.filter(request => request.submittedBy === employeeName),
    [employeeName, employeeRequests]
  )

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.description.trim()) {
      setStatus({ type: 'error', message: 'Add a request title and a clear description before submitting.' })
      return
    }
    const saved = onSubmit?.(form)
    setStatus({ type: 'success', message: `${saved.title} sent to manager review.` })
    setForm({ title: '', category: 'Bar Supply', description: '', urgency: 'Medium', estimatedCost: '' })
  }

  return (
    <>
      <Header eyebrow="Employee Requests" title="Ask for what service needs." body="Submit supply, maintenance, stock, prep, or operational requests. Managers review first; only approved requests move to owner/admin." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="border-[#c9a96e]/18">
          <form onSubmit={submit} className="space-y-5">
            <Field id="employee-request-title" label="Request Title" value={form.title} onChange={value => update('title', value)} />
            <div className="grid gap-5 md:grid-cols-3">
              <LabSelect label="Category" value={form.category} options={REQUEST_CATEGORIES} onChange={value => update('category', value)} />
              <LabSelect label="Urgency" value={form.urgency} options={REQUEST_URGENCY} onChange={value => update('urgency', value)} />
              <Field id="employee-request-cost" label="Estimated Cost If Known" type="number" value={form.estimatedCost} onChange={value => update('estimatedCost', value)} />
            </div>
            <TextArea id="employee-request-description" label="Description" value={form.description} onChange={value => update('description', value)} rows={4} />
            {status && <Alert type={status.type}>{status.message}</Alert>}
            <Button type="submit">Submit To Manager</Button>
          </form>
        </Card>

        <Card>
          <Label>Your Request Pipeline</Label>
          <div className="space-y-3">
            {myRequests.length ? myRequests.slice(0, 8).map(request => (
              <article key={request.id} className="rounded-2xl border border-[#6b705c]/20 bg-black/18 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-black text-[#f5f5f0]">{request.title}</div>
                  <RequestStatusChip status={request.status} />
                </div>
                <p className="text-xs leading-5 text-[#e8dcc0]/70">{request.category} - {request.urgency} - {new Date(request.created_at).toLocaleString()}</p>
              </article>
            )) : (
              <p className="text-sm leading-7 text-[#e8dcc0]">No requests submitted yet. Use this for stock, prep, maintenance, paper, glassware, or bar supply needs.</p>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}

function ManagerEmployeeRequests({ employeeRequests = [], onReview }) {
  const [notes, setNotes] = useState({})
  const pending = employeeRequests.filter(request => request.status === 'pending_manager_review')
  const reviewed = employeeRequests.filter(request => request.status !== 'pending_manager_review')

  return (
    <>
      <Header eyebrow="Employee Requests" title="Manager Request Review" body="Review employee operational requests before anything reaches owner/admin. Approve only what should move into the owner inbox." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Pending Manager Review" value={String(pending.length)} sub="Need decision" />
        <Metric label="Forwarded To Owner" value={String(employeeRequests.filter(item => item.status === 'pending_owner_review').length)} sub="Manager approved" />
        <Metric label="Rejected By Manager" value={String(employeeRequests.filter(item => item.status === 'rejected_by_manager').length)} sub="Stopped before owner" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {[...pending, ...reviewed].map(request => (
          <Card key={request.id} className={cx('border-l-4', request.status === 'pending_manager_review' ? 'border-l-amber-700' : request.status === 'rejected_by_manager' ? 'border-l-red-700' : 'border-l-[#c9a96e]')}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <Label>{request.category}</Label>
                <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{request.title}</h2>
              </div>
              <RequestStatusChip status={request.status} />
            </div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{request.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniFact label="Submitted By" value={request.submittedBy} />
              <MiniFact label="Urgency" value={request.urgency} />
              <MiniFact label="Estimated Cost" value={request.estimatedCost ? formatMoney(request.estimatedCost) : 'Unknown'} />
            </div>
            {request.status === 'pending_manager_review' && (
              <>
                <textarea value={notes[request.id] || ''} onChange={event => setNotes(prev => ({ ...prev, [request.id]: event.target.value }))} placeholder="Manager note..." rows={3} className="mt-4 w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-3 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={() => onReview?.(request.id, 'approve', notes[request.id] || 'Approved for owner review.')}>Approve And Forward</Button>
                  <Button variant="secondary" onClick={() => onReview?.(request.id, 'reject', notes[request.id] || 'Not approved for owner escalation.')}>Reject</Button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
      {!employeeRequests.length && (
        <Card>
          <p className="text-sm leading-7 text-[#e8dcc0]">No employee operational requests yet.</p>
        </Card>
      )}
    </>
  )
}

function OwnerOperationalRequests({ employeeRequests = [], onReview }) {
  const [notes, setNotes] = useState({})
  const ownerQueue = employeeRequests.filter(request => ['pending_owner_review', 'approved_by_owner', 'rejected_by_owner'].includes(request.status))
  const pending = ownerQueue.filter(request => request.status === 'pending_owner_review')

  return (
    <>
      <Header eyebrow="Approved Operational Requests" title="Owner Operational Request Inbox" body="Only manager-approved employee requests appear here. Rejected manager requests never reach owner review." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Pending Owner Review" value={String(pending.length)} sub="Forwarded by manager" />
        <Metric label="Approved By Owner" value={String(ownerQueue.filter(item => item.status === 'approved_by_owner').length)} sub="Cleared requests" />
        <Metric label="Rejected By Owner" value={String(ownerQueue.filter(item => item.status === 'rejected_by_owner').length)} sub="Declined requests" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {ownerQueue.map(request => (
          <Card key={request.id} className={cx('border-l-4', request.status === 'pending_owner_review' ? 'border-l-[#c9a96e]' : request.status === 'approved_by_owner' ? 'border-l-emerald-700' : 'border-l-red-700')}>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <Label>{request.category}</Label>
                <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{request.title}</h2>
              </div>
              <RequestStatusChip status={request.status} />
            </div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{request.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <MiniFact label="Employee" value={request.submittedBy} />
              <MiniFact label="Manager" value={request.managerReviewedBy || 'Pending'} />
              <MiniFact label="Urgency" value={request.urgency} />
              <MiniFact label="Cost" value={request.estimatedCost ? formatMoney(request.estimatedCost) : 'Unknown'} />
            </div>
            {request.managerNote && <p className="mt-4 rounded-2xl border border-[#6b705c]/20 bg-black/18 p-4 text-xs leading-6 text-[#e8dcc0]">Manager note: {request.managerNote}</p>}
            {request.status === 'pending_owner_review' && (
              <>
                <textarea value={notes[request.id] || ''} onChange={event => setNotes(prev => ({ ...prev, [request.id]: event.target.value }))} placeholder="Owner note..." rows={3} className="mt-4 w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-3 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button onClick={() => onReview?.(request.id, 'approve', notes[request.id] || 'Approved by owner.')}>Approve</Button>
                  <Button variant="secondary" onClick={() => onReview?.(request.id, 'reject', notes[request.id] || 'Rejected by owner.')}>Reject</Button>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
      {!ownerQueue.length && (
        <Card>
          <p className="text-sm leading-7 text-[#e8dcc0]">No manager-approved operational requests are waiting for owner review.</p>
        </Card>
      )}
    </>
  )
}

function EmployeeAchievements({ currentUser, academyProgress = {}, approvedCocktails = [], cocktailPractice = {}, employeeTasks = [] }) {
  const employeeName = currentUser?.username || 'Employee'
  const practiced = Object.values(cocktailPractice[employeeName] || {}).filter(item => item?.practiced).length
  const academies = getVisibleAcademies(currentUser)
  const completedMap = getUserLessonProgress(academyProgress, currentUser)
  const totalLessons = countUniversityLessons(academies)
  const completedLessons = countCompletedLessons(completedMap)
  const courseAverage = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
  const completedPaths = academies.filter(academy => academy.lessons?.length && academy.lessons.every(lesson => isLessonComplete(completedMap, academy.id, lesson.id))).length
  const completedTasks = employeeTasks.filter(task => task.assignedTo === employeeName && task.status === 'done').length
  const readiness = Math.max(0, Math.min(100, Math.round((courseAverage * 0.58) + ((approvedCocktails.length ? practiced / approvedCocktails.length : 0) * 28) + completedTasks * 4)))
  const level = readiness >= 86 ? 'Reserve Ready' : readiness >= 70 ? 'Floor Fluent' : 'Foundation'

  return (
    <>
      <Header eyebrow="Achievements" title="Progression foundation" body="A lightweight structure for future XP, certifications, bartender levels, manager endorsements, streaks, and readiness scoring." />
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Readiness" value={`${readiness}%`} sub="Foundation score" />
        <Metric label="Level" value={level} sub={employeeName} />
        <Metric label="Completed Paths" value={`${completedPaths}/${academies.length}`} sub={`${completedLessons}/${totalLessons} lessons`} />
        <Metric label="Cocktail Practice" value={`${practiced}/${approvedCocktails.length}`} sub="Approved recipes" />
      </div>
      <Card className="mt-6 border-[#c9a96e]/18">
        <Label>Next Layer Prepared</Label>
        <List items={['XP progression and readiness scoring can attach here.', 'Certifications and bartender levels can be unlocked from completed paths.', 'Manager endorsements can become a professional prestige signal.', 'Training streaks can support retention without turning the product into a game.']} />
      </Card>
    </>
  )
}

function WineKnowledge() {
  const futureMap = [
    'Grape varieties',
    'Climate and terroir',
    'Old world vs new world',
    'Winemaking and maturation',
    'Wine styles',
    'Tasting method',
    'Acidity, tannin, body, alcohol, sweetness',
    'Food pairing',
    'Service temperature and glassware',
    'Storage and faults',
    'Sparkling and fortified wine',
    'Major wine regions',
    'Sales language and recommendation scripts'
  ]

  return (
    <>
      <Header eyebrow="Wine Academy" title="Wine Knowledge Foundation" body="A structured foundation for a future WSET Level 3 depth wine academy, designed for hospitality staff who need confident guest-facing language." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Knowledge Depth" value="WSET 3" sub="Future target" />
        <Metric label="Service Lens" value="Guest" sub="Hospitality language" />
        <Metric label="Build Mode" value="Foundation" sub="Sample sections only" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 md:grid-cols-2">
          {WINE_ACADEMY_SECTIONS.map(section => (
            <Card key={section.title} className="border-[#c9a96e]/16">
              <Label>{section.focus}</Label>
              <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">{section.sample}</p>
              <div className="mt-5 space-y-2">
                {section.topics.map(topic => (
                  <div key={topic} className="rounded-xl border border-[#6b705c]/20 bg-black/18 px-3 py-2 text-xs leading-5 text-[#e8dcc0]">{topic}</div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <Card>
          <Label>Future Architecture</Label>
          <List items={futureMap} />
        </Card>
      </div>
    </>
  )
}

function ServiceRecovery({ t, currentUser, onServiceIncident, employeeTasks = [], onUpdateEmployeeTask }) {
  const [form, setForm] = useState({
    issueType: 'Delay',
    guestTable: '',
    description: '',
    compensation: '',
    severity: 'medium',
    resolved: false
  })
  const [status, setStatus] = useState(null)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.guestTable.trim() || !form.description.trim()) {
      setStatus({ type: 'error', message: 'Add guest/table and a clear description before submitting.' })
      return
    }
    const saved = onServiceIncident?.(form)
    setStatus({ type: 'success', message: `Incident submitted to manager feed and Business Memory${saved?.resolved ? '.' : ' as unresolved.'}` })
    setForm({ issueType: 'Delay', guestTable: '', description: '', compensation: '', severity: 'medium', resolved: false })
  }

  return (
    <>
      <Header eyebrow={t.pages.serviceRecovery} title="Report An Issue" body="A simple operational channel for guest, table, service, or supply issues. Submit early so the shift can recover quickly." />
      <PendingEmployeeTasksCard currentUser={currentUser} employeeTasks={employeeTasks} onUpdateEmployeeTask={onUpdateEmployeeTask} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="border-[#c9a96e]/20">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <LabSelect label="Issue Type" value={form.issueType} options={['Delay', 'Food Quality', 'Beverage', 'Allergy', 'Language / Tone', 'Billing', 'Other']} onChange={value => update('issueType', value)} />
              <LabSelect label="Severity" value={form.severity} options={['low', 'medium', 'high']} onChange={value => update('severity', value)} />
              <Field id="employee-guest-table" label="Guest / Table" value={form.guestTable} onChange={value => update('guestTable', value)} />
              <Field id="employee-compensation" label="Compensation Offered" value={form.compensation} onChange={value => update('compensation', value)} />
            </div>
            <TextArea id="employee-incident-description" label="Description" value={form.description} onChange={value => update('description', value)} rows={5} />
            <label className="flex items-center gap-3 rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm font-bold text-[#e8dcc0]">
              <input type="checkbox" checked={form.resolved} onChange={event => update('resolved', event.target.checked)} className="accent-[#c9a96e]" />
              Resolved before escalation
            </label>
            {status && <Alert type={status.type}>{status.message}</Alert>}
            <Button type="submit">Submit Issue</Button>
          </form>
        </Card>
        <Card>
          <Label>Report Flow</Label>
          <List items={[
            'Report early. The manager feed is for protection and clarity.',
            'Include table, issue type, and what was already done.',
            'Unresolved issues create live manager actions automatically.',
            `Logged in employee: ${currentUser?.username || 'Employee'}`
          ]} />
        </Card>
      </div>
    </>
  )
}

function PendingEmployeeTasksCard({ currentUser, employeeTasks = [], onUpdateEmployeeTask }) {
  const pendingTasks = employeeTasks.filter(task => task.status !== 'done')
  const completed = employeeTasks.length - pendingTasks.length
  const completion = employeeTasks.length ? Math.round((completed / employeeTasks.length) * 100) : 100

  return (
    <Card className="mb-8 border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.1),transparent_36%),#14130f]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Label>Pending Assigned Tasks</Label>
          <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">Assigned work for today.</h2>
          <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">{currentUser?.username || 'Employee'} sees assigned shift tasks here as soon as management publishes operational planning.</p>
        </div>
        <div className="text-right">
          <div className="font-serif text-4xl font-black text-[#c9a96e]">{completion}%</div>
          <div className="text-xs font-bold text-[#e8dcc0]">{pendingTasks.length} pending</div>
        </div>
      </div>
      {employeeTasks.length ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {employeeTasks.slice(0, 6).map(task => (
            <article key={task.id} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-black text-[#f5f5f0]">{task.title}</span>
                <span className={cx('rounded-full border px-2 py-0.5 text-[10px] font-black uppercase', task.status === 'done' ? 'border-emerald-800/50 text-emerald-200' : task.status === 'inProgress' ? 'border-amber-800/50 text-amber-200' : 'border-[#6b705c]/50 text-[#e8dcc0]')}>{task.status}</span>
              </div>
              <p className="text-xs leading-6 text-[#e8dcc0]">{task.department} - {task.assignedRole} - Due {task.dueDate} - {task.linkedEventName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" disabled={task.status === 'inProgress'} onClick={() => onUpdateEmployeeTask?.(task.id, 'inProgress')}>In Progress</Button>
                <Button disabled={task.status === 'done'} onClick={() => onUpdateEmployeeTask?.(task.id, 'done')}>Done</Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm leading-7 text-[#e8dcc0]">No pending assigned event tasks yet. Approved or operational-planning events will appear here automatically.</p>
      )}
    </Card>
  )
}

function Simulation({ t }) {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [response, setResponse] = useState('')
  const [result, setResult] = useState(null)
  const scenario = SIMULATION_SCENARIOS[scenarioIndex]

  function selectScenario(index) {
    setScenarioIndex(index)
    setResponse('')
    setResult(null)
  }

  function scoreResponse() {
    const text = response.trim()
    if (!text) return

    const hasEmpathy = /sorry|understand|apologize|apologise|right/i.test(text)
    const hasOwnership = /i will|i am|on us|responsibility|personally|take care/i.test(text)
    const hasSpecificAction = /minutes|bring|replace|fix|check|right now|immediately|follow up/i.test(text)
    const hasHospitality = /you|your|tonight|experience|guest|comfortable/i.test(text)
    const lengthBonus = Math.min(18, Math.floor(text.length / 18))

    const empathy = Math.min(100, 42 + (hasEmpathy ? 28 : 0) + lengthBonus)
    const professionalism = Math.min(100, 45 + (hasOwnership ? 25 : 0) + lengthBonus)
    const solution = Math.min(100, 40 + (hasSpecificAction ? 32 : 0) + lengthBonus)
    const hosting = Math.min(100, 42 + (hasHospitality ? 25 : 0) + lengthBonus)
    const revenue = Math.min(100, 38 + (hasSpecificAction ? 22 : 0) + (hasOwnership ? 12 : 0) + Math.floor(lengthBonus / 2))
    const overall = Math.round((empathy + professionalism + solution + hosting + revenue) / 5)

    setResult({ empathy, professionalism, solution, hosting, revenue, overall })
  }

  return (
    <>
      <Header eyebrow={t.pages.simulation} title="Guest Simulation Arena" body="Practice real guest moments and receive a structured score across empathy, ownership, solution quality, hosting presence, and revenue protection." />
      <div className="mb-6 flex gap-3 overflow-x-auto pb-1">
        {SIMULATION_SCENARIOS.map((item, index) => (
          <button key={item.id} type="button" onClick={() => selectScenario(index)} className={cx('min-w-[190px] rounded-2xl border p-4 text-left transition', scenarioIndex === index ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 bg-[#1a1a1a] text-[#e8dcc0] hover:border-[#c9a96e]/40 hover:text-[#c9a96e]')}>
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{item.difficulty}</div>
            <div className="mt-1 text-sm font-black">{item.title}</div>
          </button>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          <Card>
            <Label>Scenario</Label>
            <p className="mb-4 text-sm italic leading-7 text-[#e8dcc0]">{scenario.context}</p>
            <div className="rounded-2xl border-l-4 border-[#6b705c]/50 bg-[#1a1a1a] p-5">
              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">Guest says</div>
              <p className="font-serif text-2xl italic leading-10 text-[#f5f5f0]">"{scenario.guest}"</p>
            </div>
          </Card>
          <Card>
            <Label>Your Response</Label>
            <TextArea id="simulation-response" label="" value={response} onChange={setResponse} />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={scoreResponse} disabled={!response.trim()}>Score Response</Button>
              <Button variant="secondary" onClick={() => selectScenario(scenarioIndex)}>Reset</Button>
            </div>
          </Card>
          {result && (
            <Card className="border-[#c9a96e]/20 bg-[#1a1a1a]">
              <Label>Ideal HOSPIA Response</Label>
              <p className="font-serif text-xl italic leading-9 text-[#f5f5f0]">"{scenario.ideal}"</p>
            </Card>
          )}
        </div>
        <Card>
          <div className="mb-5 flex items-center justify-between gap-4">
            <Label>Score Dimensions</Label>
            {result && <div className={cx('font-serif text-5xl font-black', result.overall >= 80 ? 'text-emerald-400' : result.overall >= 65 ? 'text-[#c9a96e]' : 'text-red-400')}>{result.overall}%</div>}
          </div>
          {result ? (
            <>
              <ProgressBlock label="Empathy" value={result.empathy} />
              <ProgressBlock label="Professionalism" value={result.professionalism} />
              <ProgressBlock label="Solution Quality" value={result.solution} />
              <ProgressBlock label="Hosting Presence" value={result.hosting} />
              <ProgressBlock label="Revenue Protection" value={result.revenue} />
            </>
          ) : (
            <List items={['Empathy: acknowledges emotion before explaining.', 'Ownership: speaks as a host with authority.', 'Solution quality: gives a specific next move.', 'Revenue protection: preserves trust and return intent.']} />
          )}
        </Card>
      </div>
    </>
  )
}

function KnowledgeLibrary({ t, lang, goToPage }) {
  const [activeTab, setActiveTab] = useState('classics')
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedCocktail, setSelectedCocktail] = useState(null)

  const atlasTabs = [
    { id: 'classics', label: 'Classics', subtitle: 'Cocktail canon' },
    { id: 'masterclass', label: 'Spirits', subtitle: 'Base-spirit fluency' },
    { id: 'techniques', label: 'Techniques', subtitle: 'Execution standards' },
    { id: 'training', label: 'Training Cards', subtitle: 'Pre-shift drills' },
    { id: 'profit', label: 'Costing & Profit', subtitle: 'Margin discipline' }
  ]

  const flavorTags = useMemo(() => {
    const tags = new Set(cocktailLibrary.flatMap(cocktail => cocktail.tags))
    return ['All', ...Array.from(tags).sort()]
  }, [])

  const filteredCocktails = useMemo(() => {
    const q = query.toLowerCase().trim()
    return cocktailLibrary.filter(cocktail => {
      const matchesFilter = activeFilter === 'All' || cocktail.tags.includes(activeFilter)
      const searchable = [
        cocktail.name,
        cocktail.family,
        cocktail.origin,
        cocktail.era,
        cocktail.story,
        cocktail.method,
        cocktail.glassware,
        cocktail.ice,
        cocktail.garnish,
        cocktail.serviceNote,
        ...cocktail.ingredients,
        ...cocktail.tags
      ].join(' ').toLowerCase()

      return matchesFilter && (!q || searchable.includes(q))
    })
  }, [activeFilter, query])

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-[#c9a96e]/25 bg-[radial-gradient(circle_at_80%_10%,rgba(201,169,110,0.16),transparent_34%),linear-gradient(135deg,#171612,#0f0f0e_72%)] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.38)] sm:p-8 lg:p-10">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#c9a96e]">The Grand Bar Atlas</span>
              <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0]">Academy / World of Bar</span>
            </div>
            <h1 className="max-w-5xl font-serif text-4xl font-black tracking-tight text-[#f5f5f0] sm:text-5xl lg:text-6xl">
              A structured bar masterclass for luxury hospitality teams.
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-[#e8dcc0]">
              Learn cocktails, spirits, technique, guest language, and bar economics in a course flow. Open cocktail dossiers only when you need detail.
            </p>
            <Button className="mt-6" variant="secondary" onClick={() => goToPage?.('courses')}>Back to Courses</Button>
          </div>
          <div className="grid gap-3">
            <AtlasStat value={cocktailLibrary.length} label="classic cocktails" />
            <AtlasStat value={ATLAS_MASTERCLASSES.length} label="spirit modules" />
            <AtlasStat value={ATLAS_TECHNIQUES.length} label="technique drills" />
          </div>
        </div>
      </section>

      <Card className="border-[#c9a96e]/15 bg-[#0f0f0e]">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
          <label className="sr-only" htmlFor="bar-atlas-search">Search The Grand Bar Atlas</label>
          <input
            id="bar-atlas-search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search cocktails, spirits, techniques, scripts, costing..."
            className="min-h-12 w-full rounded-2xl border border-[#6b705c]/30 bg-[#11100d] px-5 text-sm text-[#f5f5f0] outline-none transition placeholder:text-[#e8dcc0]/55 focus:border-[#c9a96e] focus:ring-4 focus:ring-[#c9a96e]/10"
          />
          <div className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-4 py-2 text-center text-xs font-black text-[#c9a96e]">
            {activeTab === 'classics' ? `${filteredCocktails.length} cocktails` : 'Course module'}
          </div>
        </div>

        <nav className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5" aria-label="Grand Bar Atlas course modules">
          {atlasTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => { setActiveTab(tab.id); setQuery('') }}
              className={cx(
                'rounded-2xl border p-4 text-left transition',
                activeTab === tab.id
                  ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]'
                  : 'border-[#6b705c]/30 text-[#e8dcc0] hover:border-[#c9a96e]/30 hover:text-[#f5f5f0]'
              )}
            >
              <span className="block text-xs font-black uppercase tracking-[0.14em]">{tab.label}</span>
              <span className="mt-1 block text-xs leading-5 text-[#e8dcc0] opacity-65">{tab.subtitle}</span>
            </button>
          ))}
        </nav>

        {activeTab === 'classics' && (
          <div className="mt-5 flex flex-wrap gap-2">
            {flavorTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveFilter(tag)}
                className={cx(
                  'min-h-10 rounded-full border px-3 text-xs font-bold transition',
                  activeFilter === tag
                    ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]'
                    : 'border-[#6b705c]/30 text-[#e8dcc0] hover:border-[#c9a96e]/35 hover:text-[#f5f5f0]'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </Card>

      {activeTab === 'classics' && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.24em] text-[#c9a96e]">Cocktail Canon</div>
              <h2 className="mt-2 font-serif text-4xl font-black text-[#f5f5f0]">Classics taught as operating standards.</h2>
            </div>
          </div>
          {filteredCocktails.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCocktails.map(cocktail => (
                <BarAtlasCocktailCard key={cocktail.name} cocktail={cocktail} onOpen={() => setSelectedCocktail(cocktail)} />
              ))}
            </div>
          ) : (
            <AtlasEmptyState onClear={() => { setQuery(''); setActiveFilter('All') }} />
          )}
        </section>
      )}

      {activeTab === 'masterclass' && (
        <AtlasModuleGrid title="Spirits as guest preference, not bottle trivia.">
          {ATLAS_MASTERCLASSES.map(module => <AtlasModuleCard key={module.id} eyebrow={module.level} title={module.title} body={module.desc} />)}
        </AtlasModuleGrid>
      )}

      {activeTab === 'techniques' && (
        <AtlasModuleGrid title="Technique standards that change taste, speed, and consistency.">
          {ATLAS_TECHNIQUES.map(module => <AtlasModuleCard key={module.title} eyebrow={module.category} title={module.title} body={module.detail} />)}
        </AtlasModuleGrid>
      )}

      {activeTab === 'training' && (
        <AtlasModuleGrid title="Micro-training cards for pre-shift lineup.">
          {ATLAS_TRAINING_CARDS.map(card => <AtlasModuleCard key={card.title} eyebrow={card.objective} title={card.title} body={card.action} />)}
        </AtlasModuleGrid>
      )}

      {activeTab === 'profit' && (
        <AtlasModuleGrid title="Bar economics that protect premium service margins.">
          {ATLAS_PROFIT_INSIGHTS.map(item => <AtlasModuleCard key={item.title} eyebrow={item.impact} title={item.title} body={item.solution} />)}
        </AtlasModuleGrid>
      )}

      {selectedCocktail && (
        <BarAtlasCocktailModal cocktail={selectedCocktail} onClose={() => setSelectedCocktail(null)} />
      )}
    </div>
  )
}

function AtlasStat({ value, label }) {
  return (
    <div className="rounded-2xl border border-[#6b705c]/30 bg-black/20 p-4">
      <div className="font-serif text-3xl font-black text-[#c9a96e]">{value}</div>
      <div className="mt-1 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{label}</div>
    </div>
  )
}

function AtlasModuleGrid({ title, children }) {
  return (
    <section>
      <h2 className="mb-5 max-w-4xl font-serif text-4xl font-black text-[#f5f5f0]">{title}</h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  )
}

function AtlasModuleCard({ eyebrow, title, body }) {
  return (
    <Card className="border-[#6b705c]/30 bg-[#0f0f0e]">
      <div className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{eyebrow}</div>
      <h3 className="font-serif text-2xl font-black text-[#f5f5f0]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">{body}</p>
    </Card>
  )
}

function BarAtlasCocktailCard({ cocktail, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex min-h-[320px] flex-col justify-between rounded-[1.75rem] border border-[#6b705c]/30 bg-gradient-to-br from-[#1a1a1a] to-[#11100d] p-6 text-left shadow-[0_20px_70px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:border-[#c9a96e]/45"
    >
      <div>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{cocktail.family}</div>
            <div className="mt-1 text-xs font-bold text-[#e8dcc0] opacity-70">{cocktail.era}</div>
          </div>
          <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0]">{cocktail.origin.split(',')[0]}</span>
        </div>
        <h3 className="font-serif text-3xl font-black leading-none text-[#f5f5f0] transition group-hover:text-[#c9a96e]">{cocktail.name}</h3>
        <p className="mt-4 line-clamp-4 text-sm leading-7 text-[#e8dcc0]">{cocktail.story}</p>
      </div>
      <div className="mt-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {cocktail.tags.slice(0, 4).map(tag => <Tag key={tag}>{tag}</Tag>)}
        </div>
        <div className="border-t border-[#6b705c]/30 pt-4 text-sm font-black text-[#c9a96e]">Open dossier</div>
      </div>
    </button>
  )
}

function BarAtlasCocktailModal({ cocktail, onClose }) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close cocktail dossier" />
      <article className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-[#c9a96e]/25 bg-[#0f0f0e] shadow-[0_30px_120px_rgba(0,0,0,0.58)]">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-[#6b705c]/30 bg-[#0f0f0e]/95 px-5 py-4 backdrop-blur">
          <div className="text-[11px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Cocktail Dossier</div>
          <button type="button" onClick={onClose} className="rounded-full border border-[#6b705c]/30 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0] transition hover:border-[#c9a96e] hover:text-[#c9a96e]">Close</button>
        </div>
        <div className="p-5 sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c9a96e]">{cocktail.family} / {cocktail.era}</div>
              <h2 className="mt-2 font-serif text-4xl font-black leading-none text-[#f5f5f0] sm:text-6xl">{cocktail.name}</h2>
            </div>
            <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-xs font-black text-[#e8dcc0]">{cocktail.origin}</span>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-5">
              <AtlasDossierBlock label="Origin Story">
                <p className="font-serif text-xl leading-9 text-[#f5f5f0]">{cocktail.story}</p>
              </AtlasDossierBlock>
              <AtlasDossierBlock label="Service Note">
                <p className="text-sm leading-7 text-[#e8dcc0]">{cocktail.serviceNote}</p>
              </AtlasDossierBlock>
              <AtlasDossierBlock label="Guest Recommendation Script">
                <p className="font-serif text-lg italic leading-8 text-[#f5f5f0]">"If you enjoy a {cocktail.tags[0].toLowerCase()} profile, I would guide you toward the {cocktail.name}. It is classic, structured, and gives you a clear sense of {cocktail.family.toLowerCase()}."</p>
              </AtlasDossierBlock>
              <AtlasDossierBlock label="Bartender Mistake To Avoid" danger>
                <p className="text-sm leading-7 text-red-100">{getAtlasMistake(cocktail)}</p>
              </AtlasDossierBlock>
            </section>

            <section className="space-y-5">
              <AtlasDossierBlock label="Ingredients">
                <div className="space-y-2">
                  {cocktail.ingredients.map(ingredient => (
                    <div key={ingredient} className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 py-3 text-sm font-bold text-[#f5f5f0]">{ingredient}</div>
                  ))}
                </div>
              </AtlasDossierBlock>
              <div className="grid gap-3 sm:grid-cols-2">
                <ArticleSpec label="Method" value={cocktail.method} />
                <ArticleSpec label="Glassware" value={cocktail.glassware} />
                <ArticleSpec label="Ice" value={cocktail.ice} />
                <ArticleSpec label="Garnish" value={cocktail.garnish} />
              </div>
              <AtlasDossierBlock label="Flavor Profile">
                <div className="flex flex-wrap gap-2">{cocktail.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</div>
              </AtlasDossierBlock>
            </section>
          </div>
        </div>
      </article>
    </div>
  )
}

function AtlasDossierBlock({ label, children, danger = false }) {
  return (
    <section className={cx('rounded-2xl border p-4', danger ? 'border-red-900/45 bg-red-950/20' : 'border-[#6b705c]/30 bg-[#1a1a1a]')}>
      <Label>{label}</Label>
      {children}
    </section>
  )
}

function AtlasEmptyState({ onClear }) {
  return (
    <Card className="border-[#c9a96e]/20 bg-[#0f0f0e]">
      <Label>No Results</Label>
      <p className="text-sm leading-7 text-[#e8dcc0]">No Bar Atlas entries match this search. Clear the query or choose a broader flavor tag.</p>
      <Button className="mt-4" variant="secondary" onClick={onClear}>Clear search</Button>
    </Card>
  )
}

function getAtlasMistake(cocktail) {
  const text = [cocktail.name, cocktail.family, cocktail.method, cocktail.serviceNote, ...cocktail.ingredients, ...cocktail.tags].join(' ').toLowerCase()
  if (text.includes('egg white') || text.includes('sour')) return 'Do not skip the up/on-the-rocks question or egg white confirmation. Texture must be intentional and consent-based.'
  if (text.includes('sparkling') || text.includes('soda') || text.includes('prosecco')) return 'Do not kill carbonation with aggressive stirring or warm glassware. Sparkling drinks must arrive alive.'
  if (text.includes('stir') || text.includes('spirit-forward')) return 'Do not under-dilute or over-dilute. A spirit-forward cocktail should arrive cold, integrated, and still structured.'
  if (text.includes('mint')) return 'Do not shred the mint. Bruised herbs should smell fresh, not bitter or grassy.'
  return 'Do not describe the drink generically. Connect origin, flavor, and service format so the guest feels guided.'
}

function LegacyKnowledgeLibrary({ t, lang }) {
  const [activeTab, setActiveTab] = useState('classics')
  const [query, setQuery] = useState('')
  const [selectedCocktail, setSelectedCocktail] = useState(null)

  const atlasTabs = [
    { id: 'classics', label: { en: 'Classics', he: '׳§׳׳׳¡׳™׳§׳•׳×' }, icon: Wine },
    { id: 'masterclass', label: { en: 'Spirits', he: '׳×׳–׳§׳™׳§׳™׳' }, icon: GlassWater },
    { id: 'techniques', label: { en: 'Techniques', he: '׳˜׳›׳ ׳™׳§׳•׳×' }, icon: Sparkles },
    { id: 'training', label: { en: 'Training', he: '׳”׳“׳¨׳›׳”' }, icon: ClipboardCheck },
    { id: 'profit', label: { en: 'Profit', he: '׳¨׳•׳•׳—' }, icon: CircleDollarSign }
  ]

  const filteredCocktails = useMemo(() => {
    const q = query.toLowerCase().trim()
    return cocktailLibrary.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.family.toLowerCase().includes(q) || 
      c.tags.some(t => t.toLowerCase().includes(q))
    )
  }, [query])

  return (
    <div className="space-y-12">
      {/* FLAGSHIP HERO */}
      <section className="relative overflow-hidden rounded-[3rem] border border-[#c9a96e]/30 bg-[radial-gradient(circle_at_80%_20%,rgba(201,169,110,0.2),transparent_40%),linear-gradient(135deg,#1c1b17,#0a0a08)] p-8 sm:p-12 lg:p-20 shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
        <div className="absolute right-0 top-0 hidden lg:block opacity-5 pointer-events-none select-none">
          <Wine size={600} strokeWidth={0.5} color="#c9a96e" />
        </div>
        <div className="relative max-w-5xl">
          <div className="mb-6 flex items-center gap-4 text-xs font-black uppercase tracking-[0.4em] text-[#c9a96e]">
            <div className="h-px w-12 bg-[#c9a96e]" />
            The Grand Bar Atlas
          </div>
          <h1 className="font-serif text-6xl font-black tracking-tight text-[#f5f5f0] sm:text-8xl lg:text-9xl leading-[0.95]">
            Luxury Bar <span className="text-[#c9a96e]">Intelligence</span>
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-10 text-[#e8dcc0] font-light italic">
            "Mixology is the science. Hospitality is the alchemy. The Atlas is your roadmap to Michelin-grade service execution."
          </p>
          <div className="mt-12 flex flex-wrap gap-8 border-t border-[#6b705c]/20 pt-12">
            <EditorialStat value={cocktailLibrary.length} label="Cocktail Canon" />
            <EditorialStat value={ATLAS_MASTERCLASSES.length} label="Spirit Modules" />
            <EditorialStat value={ATLAS_TECHNIQUES.length} label="Technique Drills" />
          </div>
        </div>
      </section>

      {/* PREMIUM CATEGORY NAVIGATION */}
      <nav className="sticky top-20 z-30 flex flex-wrap gap-2 rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a]/90 p-2 backdrop-blur-xl">
        {atlasTabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setQuery(''); }}
              className={cx(
                'flex flex-1 min-w-[140px] items-center justify-center gap-3 rounded-xl py-4 text-xs font-black uppercase tracking-widest transition-all duration-300',
                activeTab === tab.id ? 'bg-[#c9a96e] text-[#0d0c09] shadow-lg scale-[1.02]' : 'text-[#e8dcc0] hover:bg-[#c9a96e]/10 hover:text-[#f5f5f0]'
              )}
            >
              <Icon size={16} />
              {localize(tab.label, lang)}
            </button>
          )
        })}
      </nav>

      {/* CONTENT SWITCHER */}
      <div className="min-h-[60vh]">
        {activeTab === 'classics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="font-serif text-5xl font-black text-[#f5f5f0]">World Cocktail Canon</h2>
              <div className="relative w-full max-w-md">
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search the canon..."
                  className="w-full rounded-2xl border border-[#6b705c]/40 bg-[#11100d] px-6 py-4 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e] focus:ring-4 focus:ring-[#c9a96e]/10 transition-all"
                />
              </div>
            </div>
            {filteredCocktails.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCocktails.map(c => <CocktailCard key={c.name} cocktail={c} onOpen={() => setSelectedCocktail(c)} />)}
              </div>
            ) : (
              <div className="py-20 text-center rounded-[3rem] border border-dashed border-[#6b705c]/30">
                <p className="text-xl text-[#e8dcc0] font-serif italic">No masterpieces match your search criteria.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'masterclass' && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {ATLAS_MASTERCLASSES.map(m => (
              <Card key={m.id} className="group hover:border-[#c9a96e]/60 transition-all">
                <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#c9a96e]">{m.level}</div>
                <h3 className="font-serif text-3xl font-black text-[#f5f5f0] mb-3 group-hover:text-[#c9a96e] transition-colors">{m.title}</h3>
                <p className="text-sm leading-7 text-[#e8dcc0]">{m.desc}</p>
                <Button variant="ghost" disabled className="mt-6 w-full border border-[#6b705c]/30">Open Module</Button>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'techniques' && (
          <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {ATLAS_TECHNIQUES.map(t => (
              <Card key={t.title} className="flex gap-6 items-start">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#c9a96e]/10 text-[#c9a96e] border border-[#c9a96e]/20">
                  <Sparkles size={28} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-1">{t.category}</div>
                  <h3 className="font-serif text-3xl font-black text-[#f5f5f0] mb-2">{t.title}</h3>
                  <p className="text-sm leading-7 text-[#e8dcc0]">{t.detail}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'training' && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {ATLAS_TRAINING_CARDS.map(card => (
              <Card key={card.title} className="bg-gradient-to-r from-[#1c1b17] to-[#11100d] border-l-4 border-l-[#c9a96e]">
                <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-center">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">Protocol: {card.objective}</div>
                    <h3 className="font-serif text-3xl font-black text-[#f5f5f0]">{card.title}</h3>
                  </div>
                  <p className="text-xl font-serif italic text-[#e8dcc0] border-l border-[#6b705c]/30 pl-8">{card.action}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'profit' && (
          <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {ATLAS_PROFIT_INSIGHTS.map(item => (
              <Card key={item.title} className="border-[#c9a96e]/20 hover:border-[#c9a96e]/50">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-serif text-2xl font-black text-[#f5f5f0]">{item.title}</h3>
                  <div className="text-right">
                    <div className="text-xs font-black text-[#c9a96e] uppercase tracking-tighter">Est. Leakage</div>
                    <div className="text-2xl font-serif font-black text-[#f5f5f0]">{item.impact}</div>
                  </div>
                </div>
                <div className="rounded-xl bg-[#c9a96e]/5 border border-[#c9a96e]/10 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-1">Standard Solution</div>
                  <p className="text-sm font-bold text-[#e8dcc0]">{item.solution}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedCocktail && (
        <CocktailArticleModal cocktail={selectedCocktail} onClose={() => setSelectedCocktail(null)} />
      )}
    </div>
  )
}

function EditorialStat({ value, label }) {
  return (
    <div className="flex flex-col">
      <div className="font-serif text-5xl font-black text-[#c9a96e] leading-none mb-2">{value}</div>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e8dcc0]">{label}</div>
    </div>
  )
}

function CocktailCard({ cocktail, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="group relative flex h-[480px] flex-col justify-end overflow-hidden rounded-[2.5rem] border border-[#6b705c]/30 bg-[#11100d] p-8 text-left transition-all duration-500 hover:-translate-y-2 hover:border-[#c9a96e]/50 hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)]"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c09] via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.1),transparent_50%)]" />
      
      <div className="relative z-10 translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]">{cocktail.family}</span>
          <span className="text-[10px] font-bold text-[#e8dcc0]">{cocktail.origin.split(',')[0]}</span>
        </div>
        <h3 className="font-serif text-4xl font-black text-[#f5f5f0] mb-4 group-hover:text-[#c9a96e] transition-colors">{cocktail.name}</h3>
        <p className="line-clamp-2 text-sm leading-7 text-[#e8dcc0] mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{cocktail.story}</p>
        <div className="flex flex-wrap gap-2">
          {cocktail.tags.slice(0, 3).map(tag => <Tag key={tag}>{tag}</Tag>)}
        </div>
      </div>
    </button>
  )
}

function CocktailArticleModal({ cocktail, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl animate-in fade-in duration-300">
      <button className="absolute right-8 top-8 text-[#e8dcc0] hover:text-[#f5f5f0] transition-colors" onClick={onClose}><span className="text-sm font-black uppercase tracking-widest">Close Atlas</span></button>
      <article className="h-full max-h-[90vh] w-full max-w-7xl overflow-y-auto rounded-[3rem] border border-[#c9a96e]/30 bg-[#0d0c09] shadow-2xl">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-0">
          {/* LEFT COLUMN: Editorial Story */}
          <div className="p-8 sm:p-16 lg:border-r border-[#6b705c]/20">
            <div className="mb-8 flex items-center gap-4 text-xs font-black uppercase tracking-widest text-[#c9a96e]">
              <div className="h-px w-8 bg-[#c9a96e]" />
              {cocktail.family} ג€¢ {cocktail.era}
            </div>
            <h2 className="font-serif text-7xl sm:text-9xl font-black text-[#f5f5f0] leading-[0.85] tracking-tighter mb-12">{cocktail.name}</h2>
            
            <div className="space-y-12">
              <div>
                <Label>The Origin & Narrative</Label>
                <p className="font-serif text-3xl leading-relaxed text-[#f5f5f0] font-light">{cocktail.story}</p>
              </div>

              <div className="grid grid-cols-2 gap-8 py-8 border-y border-[#6b705c]/20">
                <div><Label>Service Note</Label><p className="text-sm leading-7 text-[#e8dcc0]">{cocktail.serviceNote}</p></div>
                <div><Label>Bartender Mistake</Label><p className="text-sm leading-7 text-red-300 font-bold">Never over-dilute or use wet ice. The architecture of {cocktail.name} depends on thermal precision.</p></div>
              </div>

              <div className="rounded-3xl bg-[#c9a96e]/10 p-8 border border-[#c9a96e]/20">
                <Label>Guest Recommendation Script</Label>
                <p className="font-serif text-2xl italic text-[#f5f5f0] leading-relaxed">
                  "If you appreciate a {cocktail.tags[0].toLowerCase()} profile with historical weight, the {cocktail.name} is exceptional. Would you prefer yours served precisely to the classic spec, or with a slight adjustment to the {cocktail.tags[1].toLowerCase()} notes?"
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Execution Specs */}
          <div className="bg-[#11100d] p-8 sm:p-16 space-y-12">
            <div>
              <Label>Precise Formulation</Label>
              <div className="space-y-3">
                {cocktail.ingredients.map(ing => (
                  <div key={ing} className="flex items-center justify-between border-b border-[#6b705c]/20 pb-4 text-xl font-serif text-[#f5f5f0]">
                    <span>{ing}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <ArticleSpec label="Vessel" value={cocktail.glassware} />
              <ArticleSpec label="Methodology" value={cocktail.method} />
              <ArticleSpec label="Ice Ritual" value={cocktail.ice} />
              <ArticleSpec label="Final Touch" value={cocktail.garnish} />
            </div>

            <div className="pt-8 border-t border-[#6b705c]/20">
              <Label>Sensory Indicators</Label>
              <div className="flex flex-wrap gap-2">
                {cocktail.tags.map(t => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

function Tag({ children }) {
  return (
    <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#c9a96e]">
      {children}
    </span>
  )
}

function ArticleSpec({ label, value }) {
  return (
    <div className="group rounded-2xl border border-[#6b705c]/20 bg-[#0d0c09] p-6 transition-colors hover:border-[#c9a96e]/40">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e] mb-2">{label}</div>
      <div className="text-lg font-bold text-[#f5f5f0]">{value}</div>
    </div>
  )
}

function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .slice(0, 3)
    .join(' ')
}

function promptIncludes(text, terms) {
  return terms.some(term => text.includes(term))
}

function parseFlavorIntent(input, form = COCKTAIL_LAB_INITIAL_FORM, variation = '') {
  const text = normalizeText(`${input} ${variation}`)
  const formText = normalizeText(`${form.baseSpirit} ${form.secondarySpirit} ${form.flavorProfile} ${form.notes} ${form.seasonality} ${form.serviceContext}`)
  const promptSpiritMatch = detectKeywords(text, MIXOLOGY_INTELLIGENCE.spirits)[0]
  const formSpiritMatch = detectKeywords(normalizeText(form.baseSpirit), MIXOLOGY_INTELLIGENCE.spirits)[0]
  const requestedSpirit = promptSpiritMatch?.key || formSpiritMatch?.key || dominantSpirit({ baseSpirit: form.baseSpirit, ingredients: [form.baseSpirit] })
  const styleKeywords = {
    'sour/citrus': ['sour', 'citrus', 'daiquiri', 'margarita', 'lime', 'lemon', 'acid'],
    highball: ['highball', 'long', 'soda', 'tall', 'sparkling', 'refreshing'],
    stirred: ['stirred', 'martini', 'manhattan', 'negroni', 'spirit forward', 'spirit-forward'],
    bitter: ['bitter', 'amaro', 'aperitivo', 'campari', 'negroni'],
    smoked: ['smoky', 'smoked', 'smoke', 'mezcal'],
    herbal: ['herbal', 'green', 'basil', 'mint', 'rosemary', 'sage', 'shiso'],
    floral: ['floral', 'flower', 'rose', 'violet', 'elderflower'],
    tropical: ['tropical', 'pineapple', 'coconut', 'passion fruit', 'rum'],
    creamy: ['creamy', 'cream', 'silky', 'foam', 'egg white'],
    'low abv': ['low abv', 'low-abv', 'session', 'spritz', 'vermouth', 'sherry']
  }
  const desiredStyles = Object.entries(styleKeywords)
    .filter(([, terms]) => promptIncludes(`${text} ${formText}`, terms))
    .map(([style]) => style)

  const flavorNotes = {
    fruit: detectKeywords(`${text} ${formText}`, MIXOLOGY_INTELLIGENCE.fruits).map(item => item.name),
    herbal: detectKeywords(`${text} ${formText}`, MIXOLOGY_INTELLIGENCE.herbs).map(item => item.name),
    spice: detectKeywords(`${text} ${formText}`, MIXOLOGY_INTELLIGENCE.spices).map(item => item.name),
    smoky: promptIncludes(`${text} ${formText}`, ['smoky', 'smoked', 'smoke']) ? ['smoky'] : [],
    floral: promptIncludes(`${text} ${formText}`, ['floral', 'rose', 'violet', 'flower', 'elderflower']) ? ['floral'] : [],
    tropical: promptIncludes(`${text} ${formText}`, ['tropical', 'pineapple', 'coconut', 'passion fruit']) ? ['tropical'] : [],
    creamy: promptIncludes(`${text} ${formText}`, ['creamy', 'silky', 'foam', 'egg white', 'cream']) ? ['creamy'] : [],
    refreshing: promptIncludes(`${text} ${formText}`, ['fresh', 'refreshing', 'bright', 'crisp', 'clean']) ? ['refreshing'] : [],
    spiritForward: promptIncludes(`${text} ${formText}`, ['spirit forward', 'spirit-forward', 'boozy', 'stirred']) ? ['spirit-forward'] : []
  }
  const flavorTags = uniqueValues([
    ...Object.entries(flavorNotes).filter(([, values]) => values.length).map(([key]) => key),
    ...desiredStyles,
    ...normalizeText(form.flavorProfile).split(/[,/\s]+/).filter(word => ['fresh', 'herbal', 'spice', 'fruit', 'smoky', 'floral', 'tropical', 'creamy', 'refreshing', 'premium'].includes(word))
  ])
  const seasonality = promptIncludes(text, ['winter']) ? 'winter'
    : promptIncludes(text, ['spring']) ? 'spring'
      : promptIncludes(text, ['autumn', 'fall']) ? 'autumn'
        : promptIncludes(text, ['summer']) ? 'summer'
          : normalizeText(form.seasonality || 'current season')
  const occasion = promptIncludes(text, ['wedding', 'banquet', 'event']) ? 'event'
    : promptIncludes(text, ['vip', 'michelin', 'fine dining', 'luxury']) ? 'premium'
      : promptIncludes(text, ['crowd', 'approachable', 'easy']) ? 'crowd pleaser'
        : normalizeText(form.serviceContext || 'signature')
  const guestType = promptIncludes(text, ['beginner', 'approachable', 'crowd']) ? 'approachable guest'
    : promptIncludes(text, ['adventurous', 'surprising', 'bartender choice']) ? 'adventurous guest'
      : promptIncludes(text, ['vip', 'regular', 'connoisseur']) ? 'experienced guest'
        : 'premium hospitality guest'

  return {
    rawInput: input,
    variation,
    baseSpirit: requestedSpirit === 'unknown' ? 'gin' : requestedSpirit,
    secondaryNotes: form.secondarySpirit || '',
    desiredStyle: desiredStyles[0] || normalizeText(form.serviceContext) || 'signature',
    desiredStyles,
    sweetness: inferScale(text, form.sweetness, ['sweet', 'dessert', 'honey', 'vanilla', 'ripe'], ['dry', 'lean', 'not sweet', 'low sugar']),
    acidity: inferScale(text, form.acidity, ['acid', 'sour', 'citrus', 'bright', 'lime', 'lemon', 'fresh'], ['soft acid', 'low acid', 'round']),
    bitterness: inferScale(text, form.bitterness, ['bitter', 'amaro', 'aperitivo', 'campari', 'dry'], ['not bitter', 'soft', 'gentle']),
    texture: promptIncludes(text, ['creamy', 'silky', 'foam']) ? 'silky' : promptIncludes(text, ['sparkling', 'soda', 'highball']) ? 'sparkling' : promptIncludes(text, ['stirred', 'spirit']) ? 'dense' : 'crisp',
    seasonality,
    occasion,
    guestType,
    flavorNotes,
    flavorTags,
    complexityTarget: promptIncludes(text, ['low prep', 'simple', 'fast', 'lower prep']) ? 'Low' : promptIncludes(text, ['complex', 'clarified', 'fat wash', 'advanced']) ? 'Advanced' : form.complexity,
    serviceContext: normalizeText(form.serviceContext || occasion),
    garnishVision: form.garnish,
    glasswarePreference: form.glassware,
    kosherRequirement: form.kosherRequirement,
    targetPrice: Number(form.targetPrice) || 64,
    targetCogs: Number(form.targetCogs) || 24,
    batchability: form.batchability,
    shelfLife: form.shelfLife
  }
}

function analyzeApprovedMenu(approvedCocktails = []) {
  const baseSpiritCounts = countBy(approvedCocktails, dominantSpirit)
  const styleCounts = countBy(approvedCocktails, cocktailStyleCategory)
  const garnishCounts = countBy(approvedCocktails, garnishFamily)
  const flavorTagCounts = countBy(approvedCocktails.flatMap(item => {
    const text = normalizeText([item.profile, item.guestDescription, item.conceptStory, item.garnish, ...(item.ingredients || [])].join(' '))
    return ['fruit', 'herbal', 'spice', 'smoky', 'floral', 'tropical', 'creamy', 'refreshing', 'spirit-forward', 'bitter']
      .filter(tag => text.includes(tag) || (tag === 'refreshing' && /(fresh|bright|soda|citrus)/.test(text)))
  }), item => item)
  const citrusLed = approvedCocktails.filter(item => cocktailStyleCategory(item) === 'sour/citrus').length
  const premiumHighCost = approvedCocktails.filter(item => Number(item.targetCogs || 0) >= 28 || Number(item.targetPrice || 0) >= 78 || normalizeText(item.context).includes('premium')).length
  const overrepresented = [
    ...Object.entries(baseSpiritCounts).filter(([, count]) => count >= 2).map(([key, count]) => `${key} (${count})`),
    ...Object.entries(styleCounts).filter(([, count]) => count >= 3).map(([key, count]) => `${key} (${count})`)
  ]
  const requiredSpirits = ['gin', 'vodka', 'rum', 'tequila', 'mezcal', 'whisky', 'brandy', 'low abv']
  const missingSpiritCategories = requiredSpirits.filter(spirit => !baseSpiritCounts[spirit])
  const gapProfiles = ['bitter', 'smoked', 'herbal', 'low abv', 'floral', 'stirred spirit-forward'].filter(style => !styleCounts[style] && !flavorTagCounts[style])
  const warnings = [
    ...Object.entries(baseSpiritCounts).filter(([, count]) => count >= 2).map(([spirit, count]) => `Your approved menu already has ${count} ${spirit}-forward cocktails.`),
    ...(citrusLed >= 3 ? [`Your approved menu already has ${citrusLed} citrus-forward signatures.`] : []),
    ...(premiumHighCost >= 2 ? [`${premiumHighCost} approved drinks are already premium/high-cost builds.`] : []),
    ...Object.entries(garnishCounts).filter(([family, count]) => family !== 'none' && count >= 3).map(([family, count]) => `${count} drinks already use ${family} garnish patterns.`)
  ]
  const menuGapNotes = [
    ...missingSpiritCategories.slice(0, 4).map(spirit => `Current menu lacks a clear ${spirit}-forward option.`),
    ...gapProfiles.slice(0, 4).map(style => `Current menu lacks a ${style} profile.`)
  ]

  return {
    total: approvedCocktails.length,
    baseSpiritCounts,
    styleCounts,
    garnishCounts,
    flavorTagCounts,
    citrusLed,
    premiumHighCost,
    missingSpiritCategories,
    gapProfiles,
    overrepresented,
    warnings,
    menuGapNotes
  }
}

function scoreMatrixItem(item, intent, direction, salt = '') {
  const tags = item.tags || item.styles || []
  const context = uniqueValues([
    intent.baseSpirit,
    intent.desiredStyle,
    intent.serviceContext,
    intent.occasion,
    intent.seasonality,
    intent.texture,
    direction.targetStyle,
    ...intent.flavorTags,
    ...(direction.gapProfiles || [])
  ])
  const tagScore = tags.reduce((sum, tag) => sum + (context.includes(tag) ? 8 : 0), 0)
  const textScore = context.reduce((sum, term) => sum + (normalizeText(item.name || item.label).includes(term) ? 4 : 0), 0)
  const costPenalty = direction.costMode === 'lower cost' ? (item.cost || 1) * 3 : 0
  const surpriseBoost = direction.surprise ? (tags.includes('surprising') || tags.includes('premium') ? 8 : 0) : 0
  const tieBreak = Math.abs(stableHash(`${salt}-${item.name || item.label}-${intent.rawInput}`)) % 7
  return tagScore + textScore + surpriseBoost + tieBreak - costPenalty
}

function chooseMatrixItem(items, intent, direction, salt) {
  return [...items].sort((a, b) => scoreMatrixItem(b, intent, direction, salt) - scoreMatrixItem(a, intent, direction, salt))[0]
}

function detectMenuConflict(intent, menuAnalysis) {
  const messages = []
  if (menuAnalysis.baseSpiritCounts[intent.baseSpirit] >= 2) messages.push(`there are already ${menuAnalysis.baseSpiritCounts[intent.baseSpirit]} approved ${intent.baseSpirit}-forward cocktails`)
  if (intent.desiredStyles.includes('sour/citrus') && menuAnalysis.citrusLed >= 3) messages.push(`there are already ${menuAnalysis.citrusLed} citrus-forward signatures`)
  if (intent.targetCogs >= 28 && menuAnalysis.premiumHighCost >= 2) messages.push(`${menuAnalysis.premiumHighCost} approved cocktails are already premium/high-cost builds`)
  return messages
}

function generateStrategicDirection(intent, menuAnalysis) {
  const conflicts = detectMenuConflict(intent, menuAnalysis)
  const requestedSpiritOverloaded = menuAnalysis.baseSpiritCounts[intent.baseSpirit] >= 2
  const missingStyle = menuAnalysis.gapProfiles[0]
  let targetStyle = intent.desiredStyles[0] || intent.desiredStyle

  if (requestedSpiritOverloaded && targetStyle === 'sour/citrus') targetStyle = missingStyle || 'highball'
  if (menuAnalysis.citrusLed >= 3 && targetStyle === 'sour/citrus') targetStyle = missingStyle || 'stirred'
  if (intent.variation === 'More refreshing') targetStyle = 'highball'
  if (intent.variation === 'More bitter') targetStyle = 'bitter'
  if (intent.variation === 'More premium') targetStyle = 'premium'
  if (intent.variation === 'Lower prep complexity') targetStyle = 'highball'
  if (intent.variation === 'More surprising') targetStyle = missingStyle || 'smoked'
  if (intent.variation === 'Better margin') targetStyle = missingStyle || 'highball'

  return {
    targetStyle,
    suggestedSpirit: intent.baseSpirit,
    shouldKeepRequestedSpirit: !requestedSpiritOverloaded || Boolean(intent.rawInput),
    gapFilled: missingStyle || menuAnalysis.menuGapNotes[0] || 'brand signature contrast',
    conflictMessages: conflicts,
    warningText: conflicts.length
      ? `Your approved menu already has ${conflicts.join(' and ')}. This recipe can still use ${intent.baseSpirit}, but it must move into a clearly differentiated ${targetStyle} profile to avoid repetition.`
      : '',
    costMode: intent.variation === 'Lower cost' || intent.variation === 'Better margin' ? 'lower cost' : intent.targetCogs >= 28 ? 'premium' : 'balanced',
    complexityMode: intent.variation === 'Lower prep complexity' ? 'low' : intent.complexityTarget,
    surprise: intent.variation === 'More surprising',
    reasoning: [
      menuAnalysis.menuGapNotes[0] || 'No urgent gap found; sharpen the menu through clearer positioning.',
      conflicts.length ? `Conflict detected: ${conflicts.join('; ')}.` : 'No direct conflict detected with approved menu concentration.',
      `Flavor logic: ${uniqueValues([intent.baseSpirit, targetStyle, ...intent.flavorTags]).join(', ')}.`,
      `Execution target: ${intent.complexityTarget} complexity for ${intent.occasion} service.`,
      `Guest positioning: built for ${intent.guestType}.`
    ]
  }
}

function methodForStyle(style, intent) {
  if (style === 'stirred' || style === 'spirit-forward' || style === 'bitter') return 'Stir with hard cold ice until glossy and properly diluted, then strain cleanly.'
  if (style === 'highball' || style === 'low abv') return 'Build over cold spear or quality cubed ice, add carbonated element last, and lift once with a bar spoon.'
  if (intent.texture === 'silky' || style === 'creamy') return 'Dry shake if using foam, then shake hard with cubed ice and fine strain.'
  return 'Shake hard with cold cubed ice, fine strain, and verify acid-sugar tension before service.'
}

function assembleCocktailRecipe(intent, strategicDirection) {
  const spirit = MIXOLOGY_INTELLIGENCE.spirits.find(item => item.key === strategicDirection.suggestedSpirit) || MIXOLOGY_INTELLIGENCE.spirits[0]
  const modifier = chooseMatrixItem(MIXOLOGY_INTELLIGENCE.modifiers, intent, strategicDirection, 'modifier')
  const acid = chooseMatrixItem(MIXOLOGY_INTELLIGENCE.acids, intent, strategicDirection, 'acid')
  const sweetener = chooseMatrixItem(MIXOLOGY_INTELLIGENCE.sweeteners, intent, strategicDirection, 'sweetener')
  const bitters = chooseMatrixItem(MIXOLOGY_INTELLIGENCE.bitters, intent, strategicDirection, 'bitters')
  const herb = chooseMatrixItem(MIXOLOGY_INTELLIGENCE.herbs, intent, strategicDirection, 'herb')
  const spice = chooseMatrixItem(MIXOLOGY_INTELLIGENCE.spices, intent, strategicDirection, 'spice')
  const fruit = chooseMatrixItem(MIXOLOGY_INTELLIGENCE.fruits, intent, strategicDirection, 'fruit')
  const texture = chooseMatrixItem(MIXOLOGY_INTELLIGENCE.textureBuilders, intent, strategicDirection, 'texture')
  const glassware = intent.glasswarePreference && !normalizeText(intent.glasswarePreference).includes('glass')
    ? chooseMatrixItem(MIXOLOGY_INTELLIGENCE.glassware, intent, strategicDirection, 'glass')
    : (MIXOLOGY_INTELLIGENCE.glassware.find(item => item.name === intent.glasswarePreference) || chooseMatrixItem(MIXOLOGY_INTELLIGENCE.glassware, intent, strategicDirection, 'glass'))
  const garnish = intent.garnishVision && intent.garnishVision.length > 8
    ? intent.garnishVision
    : chooseMatrixItem(MIXOLOGY_INTELLIGENCE.garnish, intent, strategicDirection, 'garnish').name
  const style = strategicDirection.targetStyle
  const isLowAbv = style === 'low abv' || intent.serviceContext === 'low abv'
  const isHighball = style === 'highball' || intent.variation === 'More refreshing'
  const isStirred = style === 'stirred' || style === 'spirit-forward' || style === 'bitter'
  const baseMl = isLowAbv ? 25 : isStirred ? 50 : isHighball ? 40 : 45
  const modifierMl = isStirred ? 25 : isLowAbv ? 35 : 15
  const acidMl = isStirred ? 0 : intent.acidity >= 7 ? 25 : intent.acidity >= 4 ? 20 : 12
  const sweetMl = isStirred ? (intent.sweetness >= 6 ? 7.5 : 0) : intent.sweetness >= 7 ? 18 : intent.sweetness >= 4 ? 12 : 7.5
  const ingredients = [
    `${baseMl} ml ${spirit.label}`,
    `${modifierMl} ml ${modifier.name}`,
    ...(acidMl ? [`${acidMl} ml ${acid.name}`] : []),
    ...(sweetMl ? [`${sweetMl} ml ${sweetener.name}`] : []),
    `${intent.bitterness >= 6 || style === 'bitter' ? 3 : 1} dash${intent.bitterness >= 6 || style === 'bitter' ? 'es' : ''} ${bitters.name}`,
    ...(isHighball || isLowAbv ? [`Top with ${texture.name}`] : intent.texture === 'silky' ? [`10 ml ${texture.name}`] : []),
    `Aromatic cue: ${herb.name}${intent.flavorTags.includes('spice') || style === 'smoked' ? ` and ${spice.name}` : ''}`,
    `Flavor anchor: ${fruit.name}`
  ]
  const complexityScore = Math.min(10, 3 + (isStirred ? 1 : 2) + (intent.texture === 'silky' ? 2 : 0) + (strategicDirection.surprise ? 2 : 0) + (modifier.cost > 3 ? 1 : 0))
  const practicalityScore = Math.max(1, 10 - complexityScore + (isHighball || isLowAbv ? 2 : 0) - (intent.variation === 'More premium' ? 1 : 0))
  const estimatedCost = spirit.cost + modifier.cost + acid.cost + sweetener.cost + bitters.cost + (texture.cost || 0)
  const estimatedCostTier = strategicDirection.costMode === 'lower cost' || estimatedCost <= 8 ? 'Efficient margin build' : estimatedCost >= 14 ? 'Premium / high-cost watch' : 'Balanced cost tier'
  const nameAdjectives = ['Verdant', 'Nocturne', 'Atelier', 'Golden', 'Coastal', 'Velvet', 'Electric', 'Orchard', 'Mineral', 'Estate']
  const nameNouns = ['Signal', 'Ritual', 'Measure', 'Highball', 'Reserve', 'Garden', 'Hour', 'Proof', 'Bloom', 'Current']
  const nameSeed = `${intent.rawInput}-${style}-${spirit.key}-${modifier.name}-${intent.variation}`
  const name = `${nameAdjectives[Math.abs(stableHash(nameSeed)) % nameAdjectives.length]} ${nameNouns[Math.abs(stableHash(`${nameSeed}-noun`)) % nameNouns.length]}`
  const servicePracticalityWarning = practicalityScore >= 8
    ? 'Strong service practicality. Batch non-carbonated elements, stage garnish, and build quickly during pressure.'
    : practicalityScore >= 5
      ? 'Moderate service load. Assign this to trained bar staff and keep mise en place tight.'
      : 'High service burden. Do not launch on a busy event night without a station recipe card and prep owner.'
  const riskNotes = [
    ...(strategicDirection.conflictMessages.length ? [`Menu conflict: ${strategicDirection.conflictMessages.join('; ')}. The build must stay differentiated through ${style} execution.`] : []),
    ...(intent.kosherRequirement !== 'No special requirement' && /(vermouth|campari|aperol|liqueur|sherry|chartreuse)/i.test(ingredients.join(' ')) ? ['Kosher risk: verify all fortified wines, aperitifs, and liqueurs against supplier certification.'] : []),
    ...(estimatedCostTier.includes('Premium') ? ['Cost risk: premium modifier or garnish may require price protection or a limited menu placement.'] : []),
    ...(complexityScore >= 8 ? ['Prep risk: complexity is high; write an exact batch and garnish SOP before approval.'] : []),
    ...(intent.acidity >= 8 && intent.sweetness <= 3 ? ['Balance risk: high acid with low sweetness may read sharp; taste with final dilution.'] : [])
  ]

  return {
    name,
    conceptStory: `${name} is a ${style} ${spirit.key}-led serve shaped for ${intent.occasion} service. It uses ${modifier.name}, ${fruit.name}, and ${herb.name} to create a deliberate lane rather than another generic house sour.`,
    whyFitsMenu: `It fits the menu because it addresses: ${strategicDirection.gapFilled}. ${strategicDirection.warningText || 'It does not trigger a major concentration conflict.'}`,
    ingredients,
    method: methodForStyle(style, intent),
    glassware: glassware.name,
    ice: isHighball || isLowAbv ? 'Cold spear or fresh hard cubed ice' : isStirred ? 'Hard cubed ice for stirring; served up or on one clear cube' : 'Cubed ice for shaking; served up unless adapted to rocks',
    garnish,
    prepNotes: `${intent.batchability}. Shelf-life standard: ${intent.shelfLife}. Pre-batch spirit, modifier, sweetener and bitters; add fresh acid, carbonation, and delicate herbs during service.`,
    serviceNote: `Bartenders should position this as ${style}, not just a ${spirit.key} drink. Mention ${fruit.name}, ${herb.name}, and the texture before discussing ingredients.`,
    guestDescription: `${titleCase(style)} ${spirit.key} cocktail with ${fruit.name}, ${herb.name}, ${modifier.name}, and a ${intent.texture} finish.`,
    serviceScript: `If you want something ${intent.flavorTags.includes('refreshing') ? 'fresh and lifted' : 'distinctive and balanced'}, I would recommend the ${name}. It keeps the ${spirit.key} character but moves it toward ${style} with ${fruit.name} and ${herb.name}.`,
    tasteBalanceExplanation: `The drink is designed around sweetness ${intent.sweetness}/10, acidity ${intent.acidity}/10, bitterness ${intent.bitterness}/10. ${modifier.name} supplies the bridge, ${acid.name} controls lift, ${sweetener.name} shapes texture, and ${bitters.name} creates finish.`,
    servicePracticalityWarning,
    practicalityScore,
    complexityScore,
    estimatedCostTier,
    strategicSuggestion: `Why this cocktail was strategically suggested: ${strategicDirection.reasoning.join(' ')}`,
    reasoning: {
      menuGap: strategicDirection.gapFilled,
      conflictDetected: strategicDirection.conflictMessages.length ? strategicDirection.conflictMessages.join('; ') : 'No direct conflict detected.',
      flavorLogic: `${spirit.label} was paired with ${modifier.name}, ${fruit.name}, ${herb.name}, and ${bitters.name} because their matrix tags overlap with ${uniqueValues([style, ...intent.flavorTags]).join(', ')}.`,
      executionPracticality: servicePracticalityWarning,
      guestPositioning: `Best for ${intent.guestType}; sell it as ${style} with a ${intent.texture} texture.`
    },
    costMarginNote: `${estimatedCostTier}. Target menu price ${formatMoney(intent.targetPrice)} with ${intent.targetCogs}% target COGS; protect margin by controlling ${modifier.name} and garnish usage.`,
    substitutions: [
      `If ${modifier.name} is unavailable, use a modifier with the same dominant tag: ${modifier.tags[0]}.`,
      `If ${fruit.name} is out of season, substitute another ${fruit.tags[0]} ingredient and re-check sweetness.`,
      strategicDirection.costMode === 'lower cost' ? 'For lower cost, replace premium modifier with vermouth/sherry and simplify garnish.' : 'For higher luxury, add tableside aromatic expression without changing the core recipe.'
    ],
    riskNotes: riskNotes.length ? riskNotes : ['No critical risk detected. Validate by tasting at final dilution and temperature.'],
    kosherNotes: intent.kosherRequirement,
    allergenNotes: /(egg white|coconut|cream|almond|orgeat)/i.test(ingredients.join(' ')) ? 'Potential allergen present. Confirm with guest before service.' : 'No obvious major allergen from current build. Validate purchased products.',
    context: intent.serviceContext,
    profile: uniqueValues([style, ...intent.flavorTags]).join(', '),
    targetPrice: intent.targetPrice,
    targetCogs: intent.targetCogs,
    complexity: intent.complexityTarget,
    agentPrompt: intent.rawInput,
    created_at: new Date().toISOString()
  }
}

function generateCocktailFromPrompt(prompt, form = COCKTAIL_LAB_INITIAL_FORM, menuAnalysis = analyzeApprovedMenu([]), variation = '') {
  const intent = parseFlavorIntent(prompt, form, variation)
  const strategicDirection = generateStrategicDirection(intent, menuAnalysis)
  return assembleCocktailRecipe(intent, strategicDirection)
}

function buildCocktailProposal(form) {
  return generateCocktailFromPrompt('', form, analyzeApprovedMenu([]))
}

function CocktailLab({ t, cocktailDrafts = [], approvedCocktails = [], archivedCocktails = [], onSaveDraft, onSubmitApproval, onApprove, onReject }) {
  const [form, setForm] = useState(COCKTAIL_LAB_INITIAL_FORM)
  const [proposal, setProposal] = useState(null)
  const [status, setStatus] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [agentPrompt, setAgentPrompt] = useState('Create a kosher-friendly seasonal gin cocktail for a premium dinner menu: bright citrus, herbal lift, elegant garnish, fast enough for service.')
  const [menuWarning, setMenuWarning] = useState(null)
  const [lastVariation, setLastVariation] = useState('')
  const [advancedConstraintsOpen, setAdvancedConstraintsOpen] = useState(false)
  const [directorContext, setDirectorContext] = useState([])
  const [directorNotice, setDirectorNotice] = useState('')
  const [proposalCandidates, setProposalCandidates] = useState([])
  const [activeCandidateId, setActiveCandidateId] = useState(null)
  const menuAnalysis = useMemo(() => analyzeApprovedMenu(approvedCocktails), [approvedCocktails])
  const constraintForm = advancedConstraintsOpen ? form : COCKTAIL_LAB_PROMPT_ONLY_FORM

  const activeMetrics = useMemo(() => ({
    drafts: cocktailDrafts.filter(item => item.status === 'draft').length,
    awaiting: cocktailDrafts.filter(item => item.status === 'awaitingApproval').length,
    approved: approvedCocktails.length,
    archived: archivedCocktails.length
  }), [approvedCocktails.length, archivedCocktails.length, cocktailDrafts])

  const updateField = useCallback((field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const upsertCandidate = useCallback((candidate, route = 'Generated route') => {
    if (!candidate) return
    const nextCandidate = {
      ...candidate,
      candidateRoute: route || candidate.candidateRoute || 'Generated route',
      candidateUpdatedAt: new Date().toISOString()
    }

    setProposalCandidates(prev => {
      const exists = prev.some(item => item.id === nextCandidate.id)
      const next = exists
        ? prev.map(item => item.id === nextCandidate.id ? { ...item, ...nextCandidate } : item)
        : [...prev, nextCandidate].slice(-6)
      return next
    })
    setActiveCandidateId(nextCandidate.id)
  }, [])

  const selectCandidate = useCallback(candidate => {
    setProposal(candidate)
    setActiveCandidateId(candidate.id)
    setDirectorNotice(`${candidate.name} is now loaded as the active route. Compare it against the bench, then iterate or select a champion.`)
  }, [])

  const generateProposal = useCallback(async (generateAnyway = false, variation = '') => {
    const activeVariation = typeof variation === 'string' ? variation : ''
    const intentForWarning = parseFlavorIntent(agentPrompt, constraintForm, activeVariation)
    const conflictWarnings = detectMenuConflict(intentForWarning, menuAnalysis)
    setLastVariation(activeVariation)

    if (generateAnyway !== true && approvedCocktails.length && conflictWarnings.length) {
      setMenuWarning({ ...menuAnalysis, warnings: conflictWarnings })
      setDirectorNotice('')
    } else {
      setMenuWarning(null)
    }

    setIsGenerating(true)
    setStatus({ type: 'info', message: conflictWarnings.length ? 'Menu conflict detected. Building a complete proposal with the critique inside the director assessment.' : 'Building complete beverage proposal...' })

    try {
      const result = await requestCocktailProposal({
        agentPrompt,
        form: constraintForm,
        approvedCocktails,
        cocktailDrafts,
        menuAnalysis,
        variation: activeVariation,
        previousProposal: proposal
      })
      const nextProposal = result.proposal

      const workingProposal = onSaveDraft ? onSaveDraft(nextProposal) : nextProposal
      setProposal(workingProposal)
      upsertCandidate(workingProposal, nextProposal.fallbackGenerated ? 'Fallback draft' : (activeVariation || (proposal ? 'Revision draft' : 'Generated draft')))
      setMenuWarning(null)
      const finalDirectorReply = workingProposal.directorConversationReply || `${workingProposal.name} is ready for review. ${workingProposal.strategicSuggestion || 'Review and edit before approval.'}`
      setDirectorContext(prev => [
        ...prev,
        { role: 'manager', text: `${agentPrompt.trim() || 'Generate from structured form constraints.'}${activeVariation ? ` Variation request: ${activeVariation}.` : ''}` },
        { role: 'agent', text: finalDirectorReply }
      ].slice(-6))
      setDirectorNotice(finalDirectorReply)
      setStatus({
        type: 'success',
        message: result.source === 'fallback'
          ? 'Gemini was unavailable. HOSPIA generated and saved a marked fallback draft so the workflow can continue.'
          : 'Beverage proposal generated and saved as a working draft. Review the executive board and choose the next action.'
      })
    } catch (error) {
      const message = error?.message || 'HOSPIA could not complete the beverage proposal. Please try a shorter directive or retry in a moment.'
      setDirectorNotice('')
      setStatus({ type: 'error', message })
    } finally {
      setIsGenerating(false)
    }
  }, [agentPrompt, approvedCocktails, cocktailDrafts, constraintForm, menuAnalysis, onSaveDraft, proposal, upsertCandidate])

  const saveDraft = useCallback(() => {
    if (!proposal) {
      setStatus({ type: 'error', message: 'Generate a cocktail proposal before saving a draft.' })
      return
    }
    const draft = onSaveDraft?.(proposal)
    setProposal(draft)
    upsertCandidate(draft, proposal.candidateRoute || 'Draft candidate')
    setStatus({ type: 'success', message: `${draft.name} saved as a manager draft.` })
  }, [onSaveDraft, proposal, upsertCandidate])

  const approveProposal = useCallback(() => {
    if (!proposal) {
      setStatus({ type: 'error', message: 'Generate a cocktail proposal before approving.' })
      return
    }
    const approved = onApprove?.(proposal)
    setProposal(approved)
    upsertCandidate(approved, 'Approved champion')
    setStatus({ type: 'success', message: `${approved.name} approved and published to employee Bar Menu Training.` })
  }, [onApprove, proposal, upsertCandidate])

  const submitForApproval = useCallback(() => {
    if (!proposal) {
      setStatus({ type: 'error', message: 'Generate a cocktail proposal before submitting for approval.' })
      return
    }
    const awaiting = onSubmitApproval?.(proposal)
    setProposal(awaiting)
    upsertCandidate(awaiting, 'Awaiting approval')
    setStatus({ type: 'success', message: `${awaiting.name} moved to Awaiting Approval and notification feed.` })
  }, [onSubmitApproval, proposal, upsertCandidate])

  const archiveProposal = useCallback(() => {
    if (!proposal) {
      setStatus({ type: 'error', message: 'Generate a proposal before archiving.' })
      return
    }
    onReject?.(proposal)
    setProposalCandidates(prev => prev.map(item => item.id === proposal.id ? { ...item, status: 'archived', candidateRoute: 'Archived route' } : item))
    setActiveCandidateId(null)
    setProposal(null)
    setDirectorNotice('')
    setStatus({ type: 'success', message: `${proposal.name} archived from the active Cocktail Lab board.` })
  }, [onReject, proposal])

  const requestRevision = useCallback(() => {
    if (!proposal) return
    setAgentPrompt(`Revise ${proposal.name}: `)
    setDirectorNotice('Revision mode is ready. Write one decisive change request, for example: lower prep complexity, improve margin, remove citrus, or make it more premium for an event.')
    setStatus({ type: 'info', message: 'Request a revision in the command panel. The previous proposal remains available as internal context.' })
  }, [proposal])

  const editProposal = useCallback((field, value) => {
    setProposal(prev => prev ? { ...prev, [field]: value } : prev)
  }, [])

  const regenerateVariation = useCallback((variation) => {
    generateProposal(true, variation)
  }, [generateProposal])

  const loadDraftCandidate = useCallback(draft => {
    setProposal(draft)
    upsertCandidate(draft, 'Loaded draft')
    setDirectorNotice(`${draft.name} loaded from the draft queue as a working candidate.`)
  }, [upsertCandidate])

  return (
    <>
      <section className="relative mx-auto mb-10 max-w-[1560px] overflow-hidden rounded-[2.75rem] border border-[#c9a96e]/10 bg-[radial-gradient(circle_at_78%_18%,rgba(201,169,110,0.12),transparent_30%),linear-gradient(135deg,rgba(17,16,13,0.92),rgba(13,12,9,0.98))] p-7 shadow-[0_40px_140px_rgba(0,0,0,0.48)] sm:p-9">
        <div className="pointer-events-none absolute -right-12 top-4 hidden font-serif text-[9rem] font-black leading-none tracking-tight text-[#c9a96e]/[0.035] 2xl:block">LAB</div>
        <div className="relative mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.42em] text-[#c9a96e]">{t.pages.cocktailLab || 'Cocktail Lab / Flavor Agent'}</div>
            <h1 className="max-w-6xl font-serif text-6xl font-black leading-[0.9] tracking-tight text-[#f5f5f0] sm:text-8xl">Beverage Director Command Console</h1>
            <p className="mt-6 max-w-4xl text-lg leading-9 text-[#e8dcc0]">A proprietary AI product surface for creating, governing, and publishing premium cocktail proposals into staff training.</p>
          </div>
          <div className="rounded-[1.35rem] border border-[#c9a96e]/25 bg-black/25 px-5 py-4 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="text-[9px] font-black uppercase tracking-[0.24em] text-[#e8dcc0]/55">Proprietary Engine</div>
            <div className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[#c9a96e]">HOSPIA Flavor Brain V2</div>
          </div>
        </div>
        <div className="relative">
          <CocktailPipelineStrip activeMetrics={activeMetrics} approvedCocktails={approvedCocktails} menuAnalysis={menuAnalysis} isGenerating={isGenerating} />
        </div>
      </section>

      <div className="mx-auto max-w-[1560px] space-y-10">
        <section className="relative overflow-hidden rounded-[3rem] border border-[#c9a96e]/20 bg-[radial-gradient(circle_at_90%_2%,rgba(201,169,110,0.2),transparent_31%),linear-gradient(135deg,#171611,#090907)] p-6 shadow-[0_44px_150px_rgba(0,0,0,0.55)] sm:p-8">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/45 to-transparent" />
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Manager Directive Input</div>
                  <h2 className="max-w-4xl font-serif text-5xl font-black leading-[0.95] text-[#f5f5f0] sm:text-6xl">Brief the proprietary beverage engine.</h2>
                  <p className="mt-5 max-w-3xl text-sm leading-7 text-[#e8dcc0]/85">State the commercial job, guest psychology, flavor direction, service pressure, and margin ambition. The engine qualifies the brief, scans menu saturation, and returns a decision-ready proposal.</p>
                </div>
                <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">
                  {advancedConstraintsOpen ? 'Prompt + Constraints' : 'Prompt Only'}
                </span>
              </div>
              <textarea
                id="flavor-agent-prompt"
                value={agentPrompt}
                onChange={event => setAgentPrompt(event.target.value)}
                rows={9}
                placeholder="Example: Build a premium summer mezcal highball for a wedding reception. Dry, bright, lightly bitter, kosher-friendly, batchable, fast garnish, strong margin discipline."
                className="min-h-72 w-full resize-y rounded-[2rem] border border-[#c9a96e]/25 bg-[linear-gradient(135deg,#0f0f0e,#11100d)] p-7 font-serif text-2xl leading-10 text-[#f5f5f0] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_24px_90px_rgba(0,0,0,0.35)] transition placeholder:text-[#e8dcc0]/35 focus:border-[#c9a96e]/60 focus:ring-2 focus:ring-[#c9a96e]/20"
              />
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => generateProposal()}
                  disabled={isGenerating}
                  className="inline-flex min-h-16 items-center justify-center rounded-[1.35rem] bg-[#c9a96e] px-9 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#11100d] shadow-[0_22px_70px_rgba(201,169,110,0.28)] transition hover:-translate-y-0.5 hover:bg-[#dfc497] hover:shadow-[0_30px_90px_rgba(201,169,110,0.34)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGenerating ? 'Engine Building...' : 'Generate Beverage Proposal'}
                </button>
                <Button variant="secondary" onClick={() => setAgentPrompt('Create a batchable mezcal and grapefruit highball for a luxury wedding reception: dry, bright, lightly bitter, kosher-friendly, fast garnish, strong margin discipline.')}>Use Event Brief</Button>
                <Button variant="ghost" onClick={() => {
                  setAgentPrompt('')
                  setDirectorContext([])
                  setDirectorNotice('')
                  setMenuWarning(null)
                  setStatus(null)
                }}>Clear Brief</Button>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {COCKTAIL_COMMAND_CHIPS.map(chip => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setAgentPrompt(prev => prev ? `${prev}\n${chip.prompt}` : chip.prompt)}
                    className="group rounded-[1.35rem] border border-[#6b705c]/20 bg-black/20 p-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:-translate-y-0.5 hover:border-[#c9a96e]/40 hover:bg-[#c9a96e]/5"
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{chip.label}</div>
                    <div className="mt-2 text-xs font-bold leading-5 text-[#e8dcc0] group-hover:text-[#f5f5f0]">{chip.signal}</div>
                  </button>
                ))}
              </div>
            </div>

            <aside className="rounded-[2rem] border border-[#6b705c]/20 bg-[linear-gradient(180deg,rgba(201,169,110,0.08),rgba(0,0,0,0.18))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="mb-4 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Engine Presence</div>
              <div className="space-y-3">
                <EngineSignal label="Engine Readiness" value={isGenerating ? 'Processing' : 'Ready'} tone={isGenerating ? 'warning' : 'good'} />
                <EngineSignal label="Intelligence Mode" value={proposal ? 'Compact Revision' : 'Full Flavor Brain'} tone="gold" />
                <EngineSignal label="Menu Scan" value={`${menuAnalysis.total} approved`} tone="gold" />
                <EngineSignal label="Quota Discipline" value={proposal ? 'Compact payload' : 'Full prompt'} tone="good" />
              </div>
              <div className="mt-6 rounded-[1.5rem] border border-[#c9a96e]/20 bg-black/25 p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">Generation Protocol</div>
                <p className="mt-2 text-xs leading-6 text-[#e8dcc0]">Qualify brief, scan saturation, protect margin, produce an approval-ready beverage dossier.</p>
              </div>
            </aside>
          </div>

          {proposal && directorNotice && (
            <div className="mt-5 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-5">
              <Label>Beverage Director Note</Label>
              <p className="max-w-5xl text-sm leading-7 text-[#f5f5f0]">{shortConsultantText(directorNotice, 460)}</p>
            </div>
          )}

          {menuWarning && (
            <MenuIntelligencePanel
              menuAnalysis={menuAnalysis}
              warning={menuWarning}
              onGenerateAnyway={() => generateProposal(true, lastVariation)}
              onAdjustDirection={() => {
                setAgentPrompt(prev => `${prev}\nAdjust direction: ${menuAnalysis.menuGapNotes[0] || 'Create more menu contrast.'}`)
                setMenuWarning(null)
                setStatus({ type: 'success', message: 'Direction adjusted with the leading menu gap. Generate again when ready.' })
              }}
            />
          )}

          <div className="mt-6 rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a]">
            <button
              type="button"
              onClick={() => setAdvancedConstraintsOpen(prev => !prev)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
              aria-expanded={advancedConstraintsOpen}
            >
              <div>
                <Label>Advanced Constraints</Label>
                <h3 className="font-serif text-2xl font-black text-[#f5f5f0]">{advancedConstraintsOpen ? 'Hide optional build constraints.' : 'Closed by default for chat-first creation.'}</h3>
                <p className="mt-1 text-sm leading-6 text-[#e8dcc0]">When closed, Gemini ignores the structured defaults and works from the manager prompt only. When open, these are optional constraints; the prompt still wins conflicts.</p>
              </div>
              <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-xs font-black text-[#c9a96e]">
                {advancedConstraintsOpen ? 'Open' : 'Closed'}
              </span>
            </button>

            {advancedConstraintsOpen && (
              <div className="border-t border-[#6b705c]/30 p-5">
                <MenuIntelligencePanel
                  menuAnalysis={menuAnalysis}
                  warning={null}
                  onGenerateAnyway={() => generateProposal(true, lastVariation)}
                  onAdjustDirection={() => {
                    setAgentPrompt(prev => `${prev}\nAdjust direction: ${menuAnalysis.menuGapNotes[0] || 'Create more menu contrast.'}`)
                    setMenuWarning(null)
                    setStatus({ type: 'success', message: 'Direction adjusted with the leading menu gap. Generate again when ready.' })
                  }}
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <LabInput label="Base Spirit" value={form.baseSpirit} onChange={value => updateField('baseSpirit', value)} />
                  <LabInput label="Secondary Spirit / Liqueur" value={form.secondarySpirit} onChange={value => updateField('secondarySpirit', value)} />
                  <LabInput label="Flavor Profile" value={form.flavorProfile} onChange={value => updateField('flavorProfile', value)} />
                  <LabInput label="Fresh / Herbal / Spice / Fruit Notes" value={form.notes} onChange={value => updateField('notes', value)} />
                  <LabInput label="Seasonality" value={form.seasonality} onChange={value => updateField('seasonality', value)} />
                  <LabSelect label="Kosher Requirement" value={form.kosherRequirement} options={KOSHER_OPTIONS} onChange={value => updateField('kosherRequirement', value)} />
                  <LabSelect label="Preparation Complexity" value={form.complexity} options={COMPLEXITY_LEVELS} onChange={value => updateField('complexity', value)} />
                  <LabSelect label="Service Context" value={form.serviceContext} options={SERVICE_CONTEXTS} onChange={value => updateField('serviceContext', value)} />
                  <LabInput label="Batchability" value={form.batchability} onChange={value => updateField('batchability', value)} />
                  <LabInput label="Shelf-Life Consideration" value={form.shelfLife} onChange={value => updateField('shelfLife', value)} />
                  <LabInput label="Glassware" value={form.glassware} onChange={value => updateField('glassware', value)} />
                  <LabInput label="Garnish" value={form.garnish} onChange={value => updateField('garnish', value)} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <LabInput label="Target Price" type="number" value={form.targetPrice} onChange={value => updateField('targetPrice', value)} />
                    <LabInput label="Target COGS %" type="number" value={form.targetCogs} onChange={value => updateField('targetCogs', value)} />
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <RangeField label="Sweetness" value={form.sweetness} onChange={value => updateField('sweetness', value)} />
                  <RangeField label="Acidity" value={form.acidity} onChange={value => updateField('acidity', value)} />
                  <RangeField label="Bitterness" value={form.bitterness} onChange={value => updateField('bitterness', value)} />
                </div>
              </div>
            )}
          </div>

          {status && <Alert type={status.type}>{status.message}</Alert>}
        </section>

        <CandidateComparisonStrip candidates={proposalCandidates} activeCandidateId={activeCandidateId || proposal?.id} onSelect={selectCandidate} />
        <CocktailProposalCard proposal={proposal} onEdit={editProposal} onSaveDraft={saveDraft} onSubmitApproval={submitForApproval} onApprove={approveProposal} onArchive={archiveProposal} onRequestRevision={requestRevision} onRegenerateVariation={regenerateVariation} />
        <DraftCocktailQueue drafts={cocktailDrafts} onLoad={loadDraftCandidate} onApprove={onApprove} onReject={onReject} />
      </div>
    </>
  )
}

function CocktailPipelineStrip({ activeMetrics, approvedCocktails, menuAnalysis, isGenerating }) {
  const signals = [
    ['Drafts', activeMetrics.drafts, 'unpublished concepts'],
    ['Awaiting', activeMetrics.awaiting, 'approval governance'],
    ['Approved', activeMetrics.approved, 'employee visible'],
    ['Archived', activeMetrics.archived, 'retired history'],
    ['Menu Gaps', menuAnalysis.menuGapNotes?.length || 0, 'strategic openings']
  ]

  return (
    <div className="grid gap-2 md:grid-cols-5">
      {signals.map(([label, value, sub]) => (
        <div key={label} className="rounded-[1.35rem] border border-[#6b705c]/15 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/55">{label}</div>
            <span className={cx('h-2 w-2 rounded-full', isGenerating ? 'bg-amber-300' : 'bg-emerald-300')} />
          </div>
          <div className="mt-2 font-serif text-4xl font-black leading-none text-[#f5f5f0]">{value}</div>
          <p className="mt-2 text-[10px] leading-4 text-[#e8dcc0]/55">{sub}</p>
        </div>
      ))}
      <div className="hidden" aria-hidden="true">{approvedCocktails.length}</div>
    </div>
  )
}

function EngineSignal({ label, value, tone = 'gold' }) {
  const toneClass = {
    good: 'border-emerald-800/40 bg-emerald-950/20 text-emerald-200',
    warning: 'border-amber-800/40 bg-amber-950/20 text-amber-200',
    gold: 'border-[#c9a96e]/25 bg-[#c9a96e]/10 text-[#c9a96e]'
  }[tone] || 'border-[#c9a96e]/25 bg-[#c9a96e]/10 text-[#c9a96e]'

  return (
    <div className={cx('rounded-[1.35rem] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]', toneClass)}>
      <div className="text-[9px] font-black uppercase tracking-[0.18em] opacity-70">{label}</div>
      <div className="mt-2 text-sm font-black uppercase tracking-[0.08em]">{value}</div>
    </div>
  )
}

function CocktailLabEmptyState() {
  const previewScores = [
    ['Originality', 8],
    ['Premium Perception', 9],
    ['Practicality', 7],
    ['Menu Fit', 8],
    ['Margin', 8]
  ]

  return (
    <section className="overflow-hidden rounded-[2.75rem] border border-[#6b705c]/20 bg-[radial-gradient(circle_at_12%_10%,rgba(201,169,110,0.12),transparent_32%),linear-gradient(135deg,#11100d,#090907)] p-7 shadow-[0_36px_130px_rgba(0,0,0,0.44)] sm:p-9">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Proposal Board Preview</div>
          <h2 className="font-serif text-5xl font-black leading-none text-[#f5f5f0] sm:text-6xl">The board is armed before the first build.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#e8dcc0]">Once generated, HOSPIA converts the manager directive into an executive beverage dossier: score snapshot, approval rail, recipe architecture, service notes, costing logic, and training-ready language.</p>
        </div>
        <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#c9a96e]">Awaiting Directive</span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-5">
            {previewScores.map(([label, value]) => (
              <GhostScoreCard key={label} label={label} value={value} />
            ))}
          </div>
          <div className="rounded-[2rem] border border-[#6b705c]/20 bg-[#15140f] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">Executive Dossier Silhouette</div>
                <h3 className="mt-1 font-serif text-3xl font-black text-[#f5f5f0]">Decision output will appear here.</h3>
              </div>
              <div className="hidden h-12 w-28 rounded-full border border-[#c9a96e]/15 bg-[#c9a96e]/5 sm:block" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <GhostDossierRow title="Recipe Architecture" body="Ingredients, build method, glassware, ice, garnish." />
              <GhostDossierRow title="Director Assessment" body="Why it earns menu space and what to watch." />
              <GhostDossierRow title="Costing Logic" body="Margin perception and substitution strategy." />
              <GhostDossierRow title="Training Notes" body="Bartender script and employee-facing service cues." />
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-[#c9a96e]/18 bg-[linear-gradient(180deg,rgba(201,169,110,0.12),rgba(0,0,0,0.14))] p-6">
          <Label>What The Engine Will Generate</Label>
          <div className="space-y-3">
            {[
              'A concise luxury concept story with menu positioning.',
              'Hard scores for originality, margin, practicality, and premium perception.',
              'Expandable operational intelligence instead of a wall of text.',
              'Approval-ready recipe, service, and staff training content.'
            ].map(item => (
              <div key={item} className="rounded-2xl border border-[#6b705c]/25 bg-[#0f0f0e] p-4 text-sm leading-6 text-[#e8dcc0]">
                {item}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

function GhostScoreCard({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-[#6b705c]/20 bg-black/20 p-4 opacity-75">
      <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]/60">{label}</div>
      <div className="mt-2 font-serif text-3xl font-black text-[#c9a96e]/80">{value}/10</div>
      <div className="mt-3 h-1.5 rounded-full bg-[#6b705c]/25">
        <div className="h-full rounded-full bg-[#c9a96e]/50" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  )
}

function GhostDossierRow({ title, body }) {
  return (
    <div className="rounded-[1.5rem] border border-[#6b705c]/20 bg-[#0f0f0e] p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]/80">{title}</div>
      <p className="mt-2 text-xs leading-6 text-[#e8dcc0]/65">{body}</p>
      <div className="mt-4 h-1.5 w-2/3 rounded-full bg-[#6b705c]/25" />
    </div>
  )
}

function candidateLetter(index) {
  return String.fromCharCode(65 + index)
}

function cocktailCandidateScore(candidate = {}) {
  const scores = candidate.hardScores || {}
  const values = [
    scores.flavorOriginality,
    scores.menuDifferentiation,
    scores.operationalPracticality,
    scores.premiumPerception,
    scores.marginIntelligence,
    scores.approvalReadiness
  ].map(value => Number(value)).filter(Number.isFinite)

  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function candidateWorkshopStatus(candidate, championId) {
  if (candidate.id === championId) return 'Current strongest route'
  const scores = candidate.hardScores || {}
  if (Number(scores.operationalPracticality || 0) >= 8) return 'Menu-safe fallback'
  if (Number(scores.premiumPerception || 0) >= 8) return 'Premium winner potential'
  if (Number(scores.menuDifferentiation || 0) >= 8) return 'Differentiation route'
  return 'Workshop candidate'
}

function CandidateComparisonStrip({ candidates = [], activeCandidateId, onSelect }) {
  if (!candidates.length) return null

  const champion = candidates.reduce((best, item) => (
    cocktailCandidateScore(item) > cocktailCandidateScore(best) ? item : best
  ), candidates[0])

  return (
    <section className="relative overflow-hidden rounded-[2.75rem] border border-[#c9a96e]/18 bg-[radial-gradient(circle_at_14%_12%,rgba(201,169,110,0.13),transparent_30%),linear-gradient(135deg,#14130f,#090907)] p-6 shadow-[0_34px_120px_rgba(0,0,0,0.44)]">
      <div className="pointer-events-none absolute -right-10 -top-8 font-serif text-8xl font-black text-[#c9a96e]/[0.035]">BENCH</div>
      <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Proposal Bench</div>
          <h2 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Select the champion route.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#e8dcc0]">Every generated or revised option stays in this session so the manager can compare Candidate A, B, C, then choose the approval favorite.</p>
        </div>
        <span className="rounded-full border border-[#c9a96e]/20 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">
          {candidates.length} active candidates
        </span>
      </div>
      <div className="relative grid gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        {candidates.map((candidate, index) => {
          const active = candidate.id === activeCandidateId
          const championStatus = candidateWorkshopStatus(candidate, champion.id)
          const score = cocktailCandidateScore(candidate)
          return (
            <button
              key={candidate.id}
              type="button"
              onClick={() => onSelect(candidate)}
              className={cx(
                'group rounded-[1.75rem] border p-5 text-left transition-all duration-300',
                active ? 'border-[#c9a96e]/45 bg-[#c9a96e]/10 shadow-[0_24px_70px_rgba(201,169,110,0.15)]' : 'border-[#6b705c]/20 bg-[#11100d]/90 hover:-translate-y-1 hover:border-[#c9a96e]/35 hover:bg-[#c9a96e]/5'
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full border border-[#c9a96e]/20 bg-black/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">Candidate {candidateLetter(index)}</span>
                <span className="font-serif text-3xl font-black text-[#f5f5f0]">{score}</span>
              </div>
              <h3 className="line-clamp-1 font-serif text-2xl font-black text-[#f5f5f0] transition group-hover:text-[#c9a96e]">{candidate.name}</h3>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#e8dcc0]">{candidate.guestDescription || candidate.conceptStory}</p>
              <div className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a96e]">{championStatus}</div>
              <div className="mt-2 text-[10px] leading-4 text-[#e8dcc0]/60">{candidate.candidateRoute || candidate.menuRole || 'Generated route'}</div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function MenuIntelligencePanel({ menuAnalysis, warning, onGenerateAnyway, onAdjustDirection }) {
  const activeWarnings = warning?.warnings || menuAnalysis.warnings

  return (
    <div className={cx(
      'relative mb-8 overflow-hidden rounded-[2.5rem] border p-6 shadow-[0_28px_110px_rgba(0,0,0,0.4)]',
      warning
        ? 'border-amber-700/45 bg-[radial-gradient(circle_at_92%_0%,rgba(245,158,11,0.18),transparent_34%),linear-gradient(135deg,#17120b,#090907)]'
        : 'border-[#6b705c]/20 bg-[radial-gradient(circle_at_92%_0%,rgba(201,169,110,0.12),transparent_32%),linear-gradient(135deg,#12110e,#090907)]'
    )}>
      <div className="pointer-events-none absolute -right-6 -top-7 font-serif text-7xl font-black text-[#c9a96e]/[0.035]">SCAN</div>
      <div className="relative mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Menu Balance Scan</div>
          <h3 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Pre-flight intelligence.</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#e8dcc0]">HOSPIA checks saturation, repetition, and missing menu roles before the director commits to a route.</p>
        </div>
        <span className="rounded-full border border-[#c9a96e]/25 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{menuAnalysis.total} approved cocktails</span>
      </div>
      <div className="relative grid gap-3 md:grid-cols-3">
        <CocktailFact label="Base Spirit Spread" value={Object.entries(menuAnalysis.baseSpiritCounts).map(([key, value]) => `${key}: ${value}`).join(' / ') || 'No approved cocktails yet'} />
        <CocktailFact label="Style Spread" value={Object.entries(menuAnalysis.styleCounts).map(([key, value]) => `${key}: ${value}`).join(' / ') || 'No style data yet'} />
        <CocktailFact label="Garnish Families" value={Object.entries(menuAnalysis.garnishCounts).map(([key, value]) => `${key}: ${value}`).join(' / ') || 'No garnish data yet'} />
      </div>
      <div className="relative mt-4 grid gap-3 lg:grid-cols-2">
        <RiskList title="Menu Warnings" items={activeWarnings.length ? activeWarnings : ['No major repetition risk detected.']} />
        <RiskList title="Menu Gaps" items={menuAnalysis.menuGapNotes.length ? menuAnalysis.menuGapNotes : ['Menu already has broad coverage. Use the next drink to sharpen brand identity.']} />
      </div>
      {warning && (
        <div className="relative mt-5 flex flex-wrap gap-3 border-t border-amber-700/20 pt-5">
          <Button onClick={onGenerateAnyway}>Generate Anyway</Button>
          <Button variant="secondary" onClick={onAdjustDirection}>Adjust Direction</Button>
        </div>
      )}
    </div>
  )
}

function scoreToHundred(value, fallback = 68) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  if (numeric <= 10) return Math.max(0, Math.min(100, Math.round(numeric * 10)))
  return Math.max(0, Math.min(100, Math.round(numeric)))
}

function weightedRecommendationScore(scores) {
  const weights = {
    originality: 0.16,
    menuFit: 0.2,
    guestAppeal: 0.18,
    operationalPracticality: 0.16,
    marginStrength: 0.14,
    signaturePotential: 0.16
  }

  return Math.round(
    scores.originality * weights.originality +
    scores.menuFit * weights.menuFit +
    scores.guestAppeal * weights.guestAppeal +
    scores.operationalPracticality * weights.operationalPracticality +
    scores.marginStrength * weights.marginStrength +
    scores.signaturePotential * weights.signaturePotential
  )
}

function getExecutiveBeverageScores(proposal = {}) {
  const hard = proposal.hardScores || {}
  const read = proposal.strategicRead || {}
  const originality = scoreToHundred(hard.flavorOriginality, 70)
  const menuFit = scoreToHundred(hard.menuDifferentiation || hard.approvalReadiness, 72)
  const premium = scoreToHundred(hard.premiumPerception, 72)
  const readiness = scoreToHundred(hard.approvalReadiness, 68)
  const guestAppeal = Math.round((premium * 0.55) + (readiness * 0.25) + (scoreToHundred(read.signaturePotentialScore, 70) * 0.2))
  const operationalPracticality = scoreToHundred(hard.operationalPracticality || proposal.practicalityScore, 70)
  const marginStrength = scoreToHundred(hard.marginIntelligence, 68)
  const signaturePotential = scoreToHundred(read.signaturePotentialScore || hard.premiumPerception || hard.flavorOriginality, 72)
  const executiveScores = {
    originality,
    menuFit,
    guestAppeal,
    operationalPracticality,
    marginStrength,
    signaturePotential
  }

  return {
    ...executiveScores,
    overall: weightedRecommendationScore(executiveScores)
  }
}

function recommendationBand(score) {
  if (score >= 86) return 'Approve for tasting'
  if (score >= 76) return 'Strong development route'
  if (score >= 66) return 'Needs controlled tasting'
  return 'Revise before approval'
}

function recommendationTone(score) {
  if (score >= 86) return 'text-emerald-200'
  if (score >= 76) return 'text-[#c9a96e]'
  if (score >= 66) return 'text-amber-200'
  return 'text-red-200'
}

function inferCocktailText(proposal = {}) {
  return normalizeText([
    proposal.name,
    proposal.menuRole,
    proposal.context,
    proposal.profile,
    proposal.conceptStory,
    proposal.guestDescription,
    proposal.serviceNote,
    proposal.method,
    proposal.glassware,
    proposal.garnish,
    proposal.prepNotes,
    proposal.agentPrompt,
    ...(proposal.ingredients || []),
    ...(proposal.riskNotes || [])
  ].join(' '))
}

function getWhyThisWorksIntelligence(proposal = {}) {
  const read = proposal.strategicRead || {}
  const text = inferCocktailText(proposal)
  const flavorStrategy = proposal.tasteBalanceExplanation ||
    `The build creates structure through ${proposal.ingredients?.slice(0, 3).join(', ') || 'a controlled base, modifier, and balancing system'}, then finishes with ${proposal.garnish || 'a deliberate garnish cue'}.`
  const emotionalPositioning = text.includes('smok') ? 'Smoky tension gives the drink adult intrigue without needing excessive theater.'
    : text.includes('floral') ? 'Floral aroma gives the drink luxury lift and a softer ordering psychology.'
      : text.includes('tropical') ? 'Tropical cues create instant guest desire while the spec keeps it out of resort-drink territory.'
        : text.includes('umami') || text.includes('savory') ? 'Savory texture gives the guest a reason to pause, ask, and remember the drink.'
          : 'The emotional position is confident, polished, and easy for staff to sell without over-explaining.'
  const premiumTrigger = text.includes('cognac') || text.includes('chartreuse') || text.includes('sherry') || text.includes('vermouth')
    ? 'Premium perception is created through adult modifiers and restrained structure rather than sugar or garnish overload.'
    : 'Premium perception comes from clarity, temperature, glassware, and a concise story the guest can repeat.'

  return [
    ['Guest Psychology', read.guestOrderingPsychology || proposal.reasoning?.guestPositioning || 'The guest receives a clear promise: distinctive enough to feel special, but familiar enough to order confidently.'],
    ['Flavor Strategy', flavorStrategy],
    ['Why It Stands Out', proposal.whyThisDeservesMenuSpace || read.earnsMenuSpace || 'It has a defined menu job and avoids becoming another interchangeable signature drink.'],
    ['Menu Placement Logic', read.menuWeaknessSolved || proposal.whyFitsMenu || proposal.menuRole || 'Place it where the list needs contrast, not where it creates redundancy.'],
    ['Emotional Positioning', emotionalPositioning],
    ['Premium Perception Triggers', read.profitPerception || premiumTrigger],
    ['Operational Viability', proposal.operationalReasoning || proposal.servicePracticalityWarning || 'The build is credible for real service because it limits fragile live steps and gives bartenders a repeatable path.']
  ]
}

function estimateCocktailCosting(proposal = {}) {
  const targetPrice = Number(proposal.targetPrice) || 68
  const targetCogs = Number(proposal.targetCogs) || 24
  const totalCost = targetPrice * (targetCogs / 100)
  const text = inferCocktailText(proposal)
  const complexity = Number(proposal.complexityScore || 5)
  const laborShare = complexity >= 8 ? 0.24 : complexity >= 6 ? 0.2 : 0.16
  const garnishShare = text.includes('dehydrated') || text.includes('flower') || text.includes('smoke') ? 0.1 : 0.07
  const citrusShare = text.includes('lemon') || text.includes('lime') || text.includes('citrus') || text.includes('grapefruit') ? 0.09 : 0.04
  const syrupShare = text.includes('cordial') || text.includes('syrup') || text.includes('prep') ? 0.13 : 0.09
  const spiritShare = Math.max(0.36, 1 - laborShare - garnishShare - citrusShare - syrupShare)
  const margin = targetPrice ? ((targetPrice - totalCost) / targetPrice) * 100 : 0

  return {
    spiritCost: totalCost * spiritShare,
    citrus: totalCost * citrusShare,
    syrupPrep: totalCost * syrupShare,
    garnish: totalCost * garnishShare,
    labor: totalCost * laborShare,
    totalCost,
    targetPrice,
    theoreticalMargin: margin,
    cogs: targetCogs
  }
}

function getServiceRealityCheck(proposal = {}) {
  const text = inferCocktailText(proposal)
  const complexity = Number(proposal.complexityScore || 5)
  const practicality = Number(proposal.practicalityScore || 7)
  const batchable = /batch|pre-batch|prebatch|event|volume|soda last|carbonated element/.test(text)
  const stable = /24 hour|shelf|batch|cordial|vermouth|sherry|spirit/.test(text) && !/egg white|cream|fresh herb live/.test(text)

  return [
    ['Prep Complexity', complexity >= 8 ? 'High R&D prep. Needs recipe card, station owner, and pre-shift mise en place.' : complexity >= 5 ? 'Moderate prep. Manageable with batching and garnish staging.' : 'Low prep. Strong for pressure service.'],
    ['Bartender Skill Requirement', complexity >= 8 ? 'Senior bartender only until the spec is stabilized.' : practicality >= 8 ? 'Trainable for the full bar team after tasting calibration.' : 'Requires a confident bartender during peak service.'],
    ['Batch Compatibility', batchable ? 'Batch-compatible. Keep citrus, carbonation, and fragile herbs live.' : 'Partially batchable. Pre-batch stable liquid only and preserve live texture.'],
    ['Service Speed Impact', practicality >= 8 ? 'Fast enough for busy service if mise en place is respected.' : practicality >= 6 ? 'Moderate speed impact; protect it during peak waves.' : 'Slow under pressure unless simplified.'],
    ['Rush Hour Failure Risk', complexity >= 8 ? 'High risk: garnish, dilution, or modifier control can drift during volume.' : practicality >= 8 ? 'Low risk: repeatable build with limited failure points.' : 'Medium risk: needs strong station discipline.'],
    ['Shelf Stability', stable ? 'Strong stability for pre-batched components. Fresh elements still require daily control.' : 'Short shelf stability. Taste fresh components daily before service.'],
    ['Consistency Risk', proposal.riskNotes?.[0] || 'Primary consistency risk is final dilution, temperature, and staff explanation quality.']
  ]
}

function getMenuPositioning(proposal = {}) {
  const text = inferCocktailText(proposal)
  const read = proposal.strategicRead || {}
  const role = proposal.menuRole || proposal.context || 'Signature cocktail'
  const guestType = text.includes('low abv') || text.includes('spritz') ? 'Social aperitif guest and early-evening table'
    : text.includes('spirit') || text.includes('stirred') ? 'Experienced cocktail guest looking for structure'
      : text.includes('tropical') || text.includes('refreshing') ? 'High-conversion guest seeking freshness and energy'
        : text.includes('umami') || text.includes('savory') ? 'Curious premium guest who wants something memorable'
          : 'Premium mainstream guest ready for a signature recommendation'
  const timeOfDay = text.includes('coffee') || text.includes('espresso') ? 'Late evening'
    : text.includes('low abv') || text.includes('spritz') || text.includes('aperitif') ? 'Aperitif window / early evening'
      : text.includes('spirit-forward') || text.includes('stirred') ? 'Post-dinner and bar-seat service'
        : 'Golden hour through dinner service'
  const season = text.includes('winter') || text.includes('cinnamon') ? 'Autumn / winter'
    : text.includes('summer') || text.includes('tropical') || text.includes('refreshing') ? 'Spring / summer'
      : text.includes('floral') ? 'Spring'
        : 'All-season with garnish calibration'
  const upsell = text.includes('premium') || text.includes('cognac') || text.includes('mezcal') || text.includes('chartreuse')
    ? 'Strong upsell potential as a top-shelf signature or limited R&D pour.'
    : 'Moderate upsell potential; strongest when sold through story, aroma, and glassware.'

  return [
    ['Menu Role', role],
    ['Ideal Guest Type', read.guestOrderingPsychology || guestType],
    ['Ideal Time Of Day', timeOfDay],
    ['Ideal Season', season],
    ['Sales Strategy', proposal.serviceNote || proposal.serviceScript || 'Lead with the menu role first, then mention one flavor anchor and one textural promise.'],
    ['Upsell Potential', upsell]
  ]
}

function ExecutiveBeverageScoreBoard({ proposal }) {
  const scores = getExecutiveBeverageScores(proposal)
  const scoreRows = [
    ['Originality', scores.originality],
    ['Menu Fit', scores.menuFit],
    ['Guest Appeal', scores.guestAppeal],
    ['Operational Practicality', scores.operationalPracticality],
    ['Margin Strength', scores.marginStrength],
    ['Signature Potential', scores.signaturePotential]
  ]

  return (
    <section className="relative overflow-hidden rounded-[2.75rem] border border-[#c9a96e]/22 bg-[radial-gradient(circle_at_86%_0%,rgba(201,169,110,0.16),transparent_30%),linear-gradient(135deg,#14130f,#090907)] p-6 shadow-[0_34px_120px_rgba(0,0,0,0.42)]">
      <div className="pointer-events-none absolute -right-8 top-0 font-serif text-8xl font-black text-[#c9a96e]/[0.035]">SCORE</div>
      <div className="relative grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="rounded-[2rem] border border-[#c9a96e]/20 bg-black/28 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
          <div className="text-[10px] font-black uppercase tracking-[0.26em] text-[#c9a96e]">Weighted Recommendation</div>
          <div className={cx('mt-5 font-serif text-8xl font-black leading-none', recommendationTone(scores.overall))}>{scores.overall}</div>
          <div className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-[#f5f5f0]">{recommendationBand(scores.overall)}</div>
          <p className="mt-4 text-xs leading-6 text-[#e8dcc0]">Weighted across creativity, menu fit, guest appeal, operational reality, margin strength, and signature potential.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {scoreRows.map(([label, value]) => (
            <ExecutiveScoreTile key={label} label={label} value={value} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ExecutiveScoreTile({ label, value }) {
  const tone = value >= 86 ? 'bg-emerald-400' : value >= 76 ? 'bg-[#c9a96e]' : value >= 66 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="rounded-[1.75rem] border border-[#6b705c]/20 bg-black/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/70">{label}</div>
        <div className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">{value}</div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#6b705c]/25">
        <div className={cx('h-full rounded-full', tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function WhyThisWorksSection({ proposal }) {
  const intelligence = getWhyThisWorksIntelligence(proposal)
  return (
    <section className="relative overflow-hidden rounded-[2.75rem] border border-[#c9a96e]/20 bg-[radial-gradient(circle_at_12%_0%,rgba(201,169,110,0.13),transparent_34%),linear-gradient(135deg,#12110e,#090907)] p-6 shadow-[0_30px_110px_rgba(0,0,0,0.4)]">
      <div className="pointer-events-none absolute -right-6 top-3 font-serif text-7xl font-black text-[#c9a96e]/[0.035]">WHY</div>
      <div className="relative mb-6 max-w-4xl">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Why This Works</div>
        <h3 className="font-serif text-5xl font-black leading-none text-[#f5f5f0]">Executive beverage thesis.</h3>
        <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">A beverage director view of whether this drink has a real commercial, emotional, and operational reason to exist.</p>
      </div>
      <div className="relative grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {intelligence.map(([label, value], index) => (
          <article key={label} className={cx(
            'rounded-[1.75rem] border bg-black/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]',
            index === 0 ? 'border-[#c9a96e]/24 md:col-span-2 xl:col-span-1' : 'border-[#6b705c]/20'
          )}>
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{label}</div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{shortConsultantText(value, 240)}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function CostingStructureBoard({ proposal }) {
  const costing = estimateCocktailCosting(proposal)
  const rows = [
    ['Spirit Cost', costing.spiritCost, 'Base liquid and primary alcoholic architecture'],
    ['Citrus', costing.citrus, 'Fresh acid, juice, or acid-adjusted element'],
    ['Syrup / Prep', costing.syrupPrep, 'Cordials, syrups, batch prep, bitters, modifiers'],
    ['Garnish', costing.garnish, 'Visual and aromatic finish'],
    ['Labor Assumption', costing.labor, 'Prep and live execution pressure']
  ]

  return (
    <section className="rounded-[2.5rem] border border-[#6b705c]/20 bg-[linear-gradient(135deg,#12110e,#090907)] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.36)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Costing Structure</div>
          <h3 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Financial clarity.</h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/70">Theoretical Margin</div>
          <div className="font-serif text-4xl font-black leading-none text-[#c9a96e]">{Math.round(costing.theoreticalMargin)}%</div>
        </div>
      </div>
      <div className="space-y-3">
        {rows.map(([label, value, note]) => (
          <div key={label} className="grid gap-3 rounded-[1.35rem] border border-[#6b705c]/18 bg-black/22 p-4 sm:grid-cols-[150px_1fr_90px] sm:items-center">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{label}</div>
            <div className="text-xs leading-5 text-[#e8dcc0]/75">{note}</div>
            <div className="font-serif text-2xl font-black text-[#f5f5f0] sm:text-right">{formatMoney(value)}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <CocktailMetric label="Total Cost" value={formatMoney(costing.totalCost)} />
        <CocktailMetric label="Target Sale Price" value={formatMoney(costing.targetPrice)} />
        <CocktailMetric label="Target COGS" value={`${costing.cogs}%`} />
      </div>
    </section>
  )
}

function ServiceRealityCheck({ proposal }) {
  return (
    <section className="rounded-[2.5rem] border border-[#6b705c]/20 bg-[linear-gradient(135deg,#12110e,#090907)] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.36)]">
      <div className="mb-5">
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Service Reality Check</div>
        <h3 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Can the bar actually execute it?</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {getServiceRealityCheck(proposal).map(([label, value]) => (
          <DossierMicroCard key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  )
}

function MenuPositioningBoard({ proposal }) {
  return (
    <section className="rounded-[2.5rem] border border-[#c9a96e]/18 bg-[radial-gradient(circle_at_88%_0%,rgba(201,169,110,0.12),transparent_33%),linear-gradient(135deg,#12110e,#090907)] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.36)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Menu Positioning</div>
          <h3 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Where it lives, who buys it, how it sells.</h3>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {getMenuPositioning(proposal).map(([label, value]) => (
          <DossierMicroCard key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  )
}

function DossierMicroCard({ label, value }) {
  return (
    <article className="rounded-[1.5rem] border border-[#6b705c]/20 bg-black/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{label}</div>
      <p className="text-sm leading-7 text-[#e8dcc0]">{shortConsultantText(value, 210)}</p>
    </article>
  )
}

function CocktailMetric({ label, value }) {
  return (
    <div className="rounded-[1.35rem] border border-[#c9a96e]/16 bg-[#c9a96e]/[0.055] p-4">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/70">{label}</div>
      <div className="mt-2 font-serif text-3xl font-black leading-none text-[#c9a96e]">{value}</div>
    </div>
  )
}

function CocktailProposalCard({ proposal, onEdit, onSaveDraft, onSubmitApproval, onApprove, onArchive, onRequestRevision, onRegenerateVariation }) {
  const [openSections, setOpenSections] = useState({
    recipe: true,
    costing: false,
    method: false,
    service: false,
    risk: false,
    director: false,
    training: false
  })

  if (!proposal) {
    return <CocktailLabEmptyState />
  }

  const read = proposal.strategicRead || {}
  const statusLabel = proposal.status ? titleCase(String(proposal.status).replace(/([A-Z])/g, ' $1')) : 'Generated Proposal'
  const timestamp = formatCocktailTimestamp(proposal.created_at || proposal.approved_at || proposal.submitted_at)
  const toggleSection = section => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))

  return (
    <section className="space-y-7">
      <div className="relative overflow-hidden rounded-[3rem] border border-[#c9a96e]/20 bg-[radial-gradient(circle_at_82%_2%,rgba(201,169,110,0.18),transparent_32%),linear-gradient(135deg,#171610,#090907)] shadow-[0_44px_150px_rgba(0,0,0,0.55)]">
        <div className="pointer-events-none absolute bottom-6 right-8 hidden font-serif text-8xl font-black text-[#c9a96e]/[0.035] xl:block">DOSSIER</div>
        <div className="relative grid gap-8 p-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-10">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap gap-3">
              <span className="rounded-full border border-[#c9a96e]/24 bg-[#c9a96e]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{statusLabel}</span>
              <span className="rounded-full border border-[#6b705c]/20 bg-black/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">{timestamp}</span>
            </div>
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Proprietary Beverage Dossier</div>
            <input
              value={proposal.name}
              onChange={event => onEdit('name', event.target.value)}
              className="w-full border-0 bg-transparent p-0 font-serif text-6xl font-black leading-[0.88] tracking-tight text-[#f5f5f0] outline-none transition focus:text-[#c9a96e] sm:text-8xl"
            />
            <p className="mt-7 max-w-4xl border-l border-[#c9a96e]/30 pl-5 text-xl leading-9 text-[#e8dcc0]">{shortConsultantText(proposal.conceptStory || proposal.guestDescription || executivePositioning(proposal), 220)}</p>
          </div>

          <div className="rounded-[2rem] border border-[#6b705c]/20 bg-black/25 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#c9a96e]">Decision Rail</div>
            <div className="grid gap-2">
              <Button onClick={onApprove} className="w-full">Approve</Button>
              <Button variant="secondary" onClick={onSaveDraft} className="w-full">Save Draft</Button>
              <Button variant="secondary" onClick={onSubmitApproval} className="w-full">Submit Review</Button>
              <Button variant="secondary" onClick={() => onRegenerateVariation?.('More surprising')} className="w-full">Regenerate</Button>
              <Button variant="ghost" onClick={onRequestRevision} className="w-full">Request Revision</Button>
              <Button variant="ghost" onClick={onArchive} className="w-full">Archive</Button>
            </div>
          </div>
        </div>
      </div>

      <ExecutiveBeverageScoreBoard proposal={proposal} />

      <WhyThisWorksSection proposal={proposal} />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <CostingStructureBoard proposal={proposal} />
        <ServiceRealityCheck proposal={proposal} />
      </div>

      <MenuPositioningBoard proposal={proposal} />

      <StrategicIterationPanel onIterate={onRegenerateVariation} />
      <ContextualProposalActions onIterate={onRegenerateVariation} />

      <div className="rounded-[2.75rem] border border-[#6b705c]/20 bg-[linear-gradient(135deg,#10100e,#090907)] p-5 shadow-[0_30px_110px_rgba(0,0,0,0.42)] sm:p-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 px-1">
          <div>
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Proposal Intelligence Board</div>
            <h3 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Expandable intelligence file.</h3>
          </div>
          <span className="text-xs font-bold text-[#e8dcc0]">Open only what the decision requires.</span>
        </div>

        <div className="space-y-3">
          <ProposalAccordionSection
            title="Recipe Architecture"
            subtitle="Liquid structure and build identity"
            open={openSections.recipe}
            onToggle={() => toggleSection('recipe')}
          >
            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[1.5rem] border border-[#c9a96e]/18 bg-[linear-gradient(135deg,#171610,#0f0f0e)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <Label>Ingredients</Label>
                <IngredientList ingredients={proposal.ingredients} />
              </div>
              <div className="grid gap-3">
                <CocktailFact label="Menu Role" value={proposal.menuRole} />
                <CocktailFact label="Glassware / Ice" value={`${proposal.glassware || 'Not specified'} / ${proposal.ice || 'Not specified'}`} />
                <CocktailFact label="Garnish" value={proposal.garnish} />
              </div>
            </div>
          </ProposalAccordionSection>

          <ProposalAccordionSection
            title="Ingredient Costing Logic"
            subtitle="Margin, cost tier, substitutions"
            open={openSections.costing}
            onToggle={() => toggleSection('costing')}
          >
            <div className="grid gap-3 md:grid-cols-3">
              <CocktailFact label="Cost / Margin Note" value={proposal.costMarginNote} />
              <CocktailFact label="Target Price" value={proposal.targetPrice ? formatMoney(proposal.targetPrice) : 'Not set'} />
              <CocktailFact label="Target COGS" value={proposal.targetCogs ? `${proposal.targetCogs}%` : 'Not set'} />
            </div>
            <div className="mt-3">
              <RiskList title="Possible Substitutions" items={proposal.substitutions} />
            </div>
          </ProposalAccordionSection>

          <ProposalAccordionSection
            title="Preparation Method"
            subtitle="Execution pathway and station behavior"
            open={openSections.method}
            onToggle={() => toggleSection('method')}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <CocktailFact label="Method" value={proposal.method} />
              <CocktailFact label="Prep Notes" value={proposal.prepNotes} />
            </div>
          </ProposalAccordionSection>

          <ProposalAccordionSection
            title="Service Notes"
            subtitle="Guest language and bar-floor handoff"
            open={openSections.service}
            onToggle={() => toggleSection('service')}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <CocktailFact label="Guest Description" value={proposal.guestDescription} />
              <CocktailFact label="Bartender Service Script" value={proposal.serviceNote} />
            </div>
          </ProposalAccordionSection>

          <ProposalAccordionSection
            title="Risk Warnings"
            subtitle="Operational, menu, and guest-fit concerns"
            open={openSections.risk}
            onToggle={() => toggleSection('risk')}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <RiskList title="Menu Conflict Warnings" items={proposal.menuConflictWarnings} />
              <RiskList title="Risk Notes" items={proposal.riskNotes} />
            </div>
          </ProposalAccordionSection>

          <ProposalAccordionSection
            title="Director Assessment"
            subtitle="Why this earns menu space"
            open={openSections.director}
            onToggle={() => toggleSection('director')}
          >
            <BeverageDirectorStrategicRead proposal={proposal} />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <CocktailFact label="Director Critique" value={proposal.requestAssessment?.critique} />
              <CocktailFact label="Taste Balance Explanation" value={proposal.tasteBalanceExplanation} />
              <CocktailFact label="Operational Reasoning" value={proposal.operationalReasoning} />
              <CocktailFact label="Why This Deserves Menu Space" value={proposal.whyThisDeservesMenuSpace} />
            </div>
            <div className="mt-4">
              <CocktailHardScorePanel scores={proposal.hardScores} />
            </div>
          </ProposalAccordionSection>

          <ProposalAccordionSection
            title="Training Notes"
            subtitle="Employee-facing service readiness"
            open={openSections.training}
            onToggle={() => toggleSection('training')}
          >
            <div className="grid gap-3 md:grid-cols-2">
              <CocktailFact label="Employee Training Cue" value={proposal.serviceNote || proposal.bartenderScript} />
              <CocktailFact label="Guest Positioning" value={proposal.reasoning?.guestPositioning || read.guestOrderingPsychology} />
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#171610,#0f0f0e)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <Label>Variation Regeneration</Label>
              <div className="flex flex-wrap gap-2">
                {COCKTAIL_VARIATIONS.map(variation => (
                  <Button key={variation} variant="secondary" onClick={() => onRegenerateVariation?.(variation)}>
                    {variation}
                  </Button>
                ))}
              </div>
            </div>
          </ProposalAccordionSection>
        </div>
      </div>
    </section>
  )
}

function executivePositioning(proposal) {
  const read = proposal.strategicRead || {}
  return shortConsultantText(
    read.profitPerception ||
    read.guestOrderingPsychology ||
    proposal.whyThisDeservesMenuSpace ||
    proposal.strategicSuggestion ||
    'A premium signature candidate designed to create a clear menu role, protect execution, and command guest curiosity.',
    170
  )
}

function shortConsultantText(value, max = 210) {
  const text = String(value || 'No director note supplied yet.').replace(/\s+/g, ' ').trim()
  if (text.length <= max) return text
  const clipped = text.slice(0, max)
  const lastStop = Math.max(clipped.lastIndexOf('.'), clipped.lastIndexOf(';'), clipped.lastIndexOf(','))
  return `${clipped.slice(0, lastStop > 80 ? lastStop : max).trim()}...`
}

function formatCocktailTimestamp(value) {
  if (!value) return 'Generated now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Generated now'
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function ProposalSnapshotCard({ label, value }) {
  const score = scoreToHundred(value, 68)
  const tone = score >= 86 ? 'text-emerald-300' : score >= 76 ? 'text-[#c9a96e]' : 'text-amber-200'

  return (
    <section className="rounded-[1.75rem] border border-[#6b705c]/20 bg-[linear-gradient(180deg,#13120f,#0f0f0e)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/60">{label}</div>
      <div className={cx('mt-3 font-serif text-5xl font-black leading-none', tone)}>{score}</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#6b705c]/30">
        <div className="h-full rounded-full bg-[#c9a96e]" style={{ width: `${score}%` }} />
      </div>
    </section>
  )
}

function StrategicIterationPanel({ onIterate }) {
  return (
    <section className="rounded-[2.5rem] border border-[#c9a96e]/18 bg-[radial-gradient(circle_at_88%_0%,rgba(201,169,110,0.15),transparent_34%),linear-gradient(135deg,#12110e,#090907)] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.36)]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Strategic Progression Loop</div>
          <h3 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Develop the winning file.</h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-[#e8dcc0]">Each action generates a new candidate using the current proposal as memory. Compare the bench, keep the strongest route, then approve the champion.</p>
        </div>
        <span className="rounded-full border border-[#c9a96e]/20 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">Champion selection mode</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {COCKTAIL_STRATEGIC_ITERATIONS.map(action => (
          <button
            key={action.label}
            type="button"
            onClick={() => onIterate?.(action.prompt)}
            className="group rounded-[1.75rem] border border-[#6b705c]/20 bg-black/20 p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition hover:-translate-y-1 hover:border-[#c9a96e]/40 hover:bg-[#c9a96e]/5"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{action.signal}</div>
            <div className="mt-2 font-serif text-2xl font-black leading-7 text-[#f5f5f0]">{action.label}</div>
          </button>
        ))}
      </div>
    </section>
  )
}

function ContextualProposalActions({ onIterate }) {
  return (
    <section className="rounded-[2.25rem] border border-[#6b705c]/18 bg-[#0f0f0e] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Live Concept Controls</div>
          <h3 className="font-serif text-2xl font-black text-[#f5f5f0]">Pressure-test this route.</h3>
        </div>
        <span className="text-xs font-bold text-[#e8dcc0]/70">Contextual revisions create new candidates.</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {COCKTAIL_CONTEXT_ACTIONS.map(([label, prompt]) => (
          <button
            key={label}
            type="button"
            onClick={() => onIterate?.(prompt)}
            className="rounded-full border border-[#6b705c]/20 bg-black/20 px-4 py-2 text-xs font-bold text-[#e8dcc0] transition hover:border-[#c9a96e]/45 hover:bg-[#c9a96e]/5 hover:text-[#c9a96e]"
          >
            {label}
          </button>
        ))}
      </div>
    </section>
  )
}

function ProposalAccordionSection({ title, subtitle, open, onToggle, children }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-[#6b705c]/18 bg-[#15140f] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-white/[0.02]"
        aria-expanded={open}
      >
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c9a96e]">{title}</div>
          <p className="mt-1 text-sm leading-6 text-[#e8dcc0]">{subtitle}</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#c9a96e]/20 bg-black/20 px-3 py-1 text-xs font-black text-[#c9a96e]">
          {open ? 'Hide' : 'View'}
        </span>
      </button>
      {open && (
        <div className="max-h-[520px] overflow-y-auto border-t border-[#6b705c]/30 p-5">
          {children}
        </div>
      )}
    </section>
  )
}

function formatCocktailIngredientLine(item) {
  if (item && typeof item === 'object') {
    const amount = item.amountMl ?? item.amount_ml ?? item.ml ?? item.amount
    const ingredient = item.ingredient || item.ingredientName || item.name || item.label
    const role = item.role || item.purpose || item.description || item.note
    if (!ingredient) {
      console.warn('Cocktail ingredient render mismatch', { item, reason: 'missing ingredient name' })
    }
    return [
      amount ? `${amount} ml` : '',
      ingredient || 'Ingredient missing',
      role || ''
    ].filter(Boolean).join(' - ')
  }

  const value = String(item || '').trim()
  if (/^\d+(?:\.\d+)?\s*ml$/i.test(value)) {
    console.warn('Cocktail ingredient render mismatch', { item, reason: 'amount-only ingredient line' })
  }
  return value
}

function IngredientList({ ingredients = [] }) {
  return (
    <div className="space-y-2">
      {ingredients.length ? ingredients.map((item, index) => {
        const line = formatCocktailIngredientLine(item)
        return (
          <div key={`${line.slice(0, 36)}-${index}`} className="flex items-start gap-3 border-b border-[#6b705c]/20 pb-2 last:border-0 last:pb-0">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]" />
            <span className="font-mono text-xs leading-6 text-[#f5f5f0]">{line}</span>
          </div>
        )
      }) : <p>No ingredients supplied.</p>}
    </div>
  )
}

function BeverageDirectorStrategicRead({ proposal }) {
  const read = proposal.strategicRead || {}
  const items = [
    ['Why this earns menu space', read.earnsMenuSpace || proposal.whyThisDeservesMenuSpace],
    ['Current menu weakness solved', read.menuWeaknessSolved || proposal.whyFitsMenu],
    ['Guest ordering psychology', read.guestOrderingPsychology],
    ['Profit perception', read.profitPerception || proposal.costMarginNote]
  ].filter(([, value]) => value)

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-[#c9a96e]/22 bg-[radial-gradient(circle_at_92%_4%,rgba(201,169,110,0.16),transparent_34%),linear-gradient(135deg,#171610,#0a0a08)] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.34)]">
      <div className="pointer-events-none absolute -right-5 top-2 font-serif text-6xl font-black text-[#c9a96e]/[0.035]">READ</div>
      <div className="relative mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.26em] text-[#c9a96e]">Beverage Director Strategic Read</div>
          <h3 className="font-serif text-4xl font-black leading-none text-[#f5f5f0]">Does this deserve the menu?</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right">
          <DirectorMiniScore label="Risk" value={read.operationalRiskScore} />
          <DirectorMiniScore label="Signature" value={read.signaturePotentialScore} />
        </div>
      </div>
      <div className="relative grid gap-3 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-[1.35rem] border border-[#6b705c]/20 bg-black/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
            <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{label}</div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function CocktailHardScorePanel({ scores = {} }) {
  const scoreRows = [
    ['Flavor Originality', scores.flavorOriginality],
    ['Menu Differentiation', scores.menuDifferentiation],
    ['Operational Practicality', scores.operationalPracticality],
    ['Premium Perception', scores.premiumPerception],
    ['Margin Intelligence', scores.marginIntelligence],
    ['Approval Readiness', scores.approvalReadiness]
  ]

  return (
    <div className="rounded-[2rem] border border-[#6b705c]/20 bg-[linear-gradient(135deg,#12110e,#090907)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Hard Scoring System</div>
          <h3 className="font-serif text-3xl font-black leading-none text-[#f5f5f0]">Approval readiness index.</h3>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {scoreRows.map(([label, rawValue]) => {
          const value = scoreToHundred(rawValue, 68)
          return (
            <div key={label} className="rounded-[1.35rem] border border-[#6b705c]/20 bg-black/22 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]/75">{label}</span>
                <span className="font-serif text-3xl font-black leading-none text-[#c9a96e]">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#6b705c]/30">
                <div className="h-full rounded-full bg-[#c9a96e]" style={{ width: `${value}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DirectorMiniScore({ label, value }) {
  const score = scoreToHundred(value, 68)
  return (
    <div className="rounded-[1rem] border border-[#c9a96e]/18 bg-black/28 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="text-[9px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]/70">{label}</div>
      <div className="font-serif text-3xl font-black leading-none text-[#c9a96e]">{score}</div>
    </div>
  )
}

function DraftCocktailQueue({ drafts = [], onLoad, onApprove, onReject }) {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-[#6b705c]/20 bg-[radial-gradient(circle_at_90%_0%,rgba(201,169,110,0.11),transparent_34%),linear-gradient(135deg,#12110e,#090907)] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.4)]">
      <div className="pointer-events-none absolute -right-5 -top-4 font-serif text-6xl font-black text-[#c9a96e]/[0.035]">QUEUE</div>
      <div className="relative mb-5 flex items-end justify-between gap-3">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e]">Draft Queue</div>
          <h3 className="font-serif text-3xl font-black leading-none text-[#f5f5f0]">Tasting files in motion.</h3>
        </div>
        <span className="rounded-full border border-[#c9a96e]/20 bg-black/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{drafts.length} drafts</span>
      </div>
      {drafts.length ? (
        <div className="relative space-y-3">
          {drafts.slice(0, 5).map(draft => (
            <article key={draft.id} className="rounded-[1.6rem] border border-[#6b705c]/20 bg-black/24 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
              <h3 className="font-serif text-2xl font-black leading-none text-[#f5f5f0]">{draft.name}</h3>
              <p className="mt-3 line-clamp-2 text-xs leading-6 text-[#e8dcc0]">{draft.guestDescription}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => onLoad(draft)}>Load</Button>
                <Button onClick={() => onApprove?.(draft)}>Approve</Button>
                <Button variant="ghost" onClick={() => onReject?.(draft.id)}>Reject</Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="relative rounded-[1.6rem] border border-dashed border-[#6b705c]/25 bg-black/16 p-5">
          <p className="text-sm leading-7 text-[#e8dcc0]">No drafts yet. Save a generated cocktail before approval if it needs more tasting.</p>
        </div>
      )}
    </section>
  )
}

function ApprovedCocktailsTraining({ t, currentUser, approvedCocktails = [], cocktailPractice = {}, onMarkPracticed }) {
  const [query, setQuery] = useState('')
  const employeeName = currentUser?.username || 'Employee'
  const employeePractice = useMemo(() => cocktailPractice[employeeName] || {}, [cocktailPractice, employeeName])
  const filteredCocktails = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return approvedCocktails
    return approvedCocktails.filter(item => [
      item.name,
      item.guestDescription,
      item.method,
      item.glassware,
      item.garnish,
      item.kosherNotes,
      item.allergenNotes,
      ...(item.ingredientsMl || item.ingredientObjects || item.ingredients || []).map(formatCocktailIngredientLine)
    ].join(' ').toLowerCase().includes(needle))
  }, [approvedCocktails, query])

  const practiced = useMemo(
    () => approvedCocktails.filter(item => employeePractice[item.id]?.practiced).length,
    [approvedCocktails, employeePractice]
  )

  return (
    <>
      <Header
        eyebrow={t.pages.approvedCocktails || 'Approved Cocktails / Bar Menu Training'}
        title="Approved Cocktails / Bar Menu Training"
        body="A staff-facing training board for manager-approved cocktails, exact service scripts, and practice status."
      />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Metric label="Approved Cocktails" value={String(approvedCocktails.length)} sub="Published by manager" />
        <Metric label="Practiced By You" value={String(practiced)} sub={employeeName} />
        <Metric label="Training Coverage" value={`${approvedCocktails.length ? Math.round((practiced / approvedCocktails.length) * 100) : 0}%`} sub="Current menu readiness" />
      </div>

      <Card className="mb-6 border-[#c9a96e]/20">
        <Label>Search Approved Bar Menu</Label>
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search by cocktail, ingredient, garnish, kosher note, or method..."
          className="min-h-12 w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 text-sm text-[#f5f5f0] outline-none transition placeholder:text-[#e8dcc0]/60 focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
        />
      </Card>

      {filteredCocktails.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredCocktails.map(cocktail => (
            <ApprovedCocktailCard
              key={cocktail.id}
              cocktail={cocktail}
              practiced={Boolean(employeePractice[cocktail.id]?.practiced)}
              onMarkPracticed={() => onMarkPracticed?.(cocktail.id, employeeName)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <Label>No Approved Cocktails Yet</Label>
          <p className="text-sm leading-7 text-[#e8dcc0]">When a manager approves a Cocktail Lab proposal, it will appear here for employee training.</p>
        </Card>
      )}
    </>
  )
}

function ApprovedCocktailCard({ cocktail, practiced, onMarkPracticed }) {
  return (
    <article className="rounded-2xl border border-[#6b705c]/30 bg-gradient-to-br from-[#1a1a1a] to-[#11100d] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{cocktail.context || 'bar menu'}</div>
          <h2 className="mt-2 font-serif text-3xl font-black text-[#f5f5f0]">{cocktail.name}</h2>
        </div>
        <span className={cx('rounded-full border px-3 py-1 text-xs font-black', practiced ? 'border-emerald-800/50 bg-emerald-950/25 text-emerald-200' : 'border-amber-800/50 bg-amber-950/25 text-amber-200')}>
          {practiced ? 'Practiced' : 'Needs Practice'}
        </span>
      </div>
      <p className="mb-5 text-sm leading-7 text-[#e8dcc0]">{cocktail.guestDescription}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <CocktailFact label="Ingredients" value={(cocktail.ingredientsMl || cocktail.ingredientObjects || cocktail.ingredients || []).map(formatCocktailIngredientLine).join(' / ')} />
        <CocktailFact label="Method" value={cocktail.method} />
        <CocktailFact label="Glassware / Ice" value={`${cocktail.glassware} - ${cocktail.ice}`} />
        <CocktailFact label="Garnish" value={cocktail.garnish} />
        <CocktailFact label="Kosher Notes" value={cocktail.kosherNotes} />
        <CocktailFact label="Allergens" value={cocktail.allergenNotes} />
      </div>
      <div className="mt-5 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/10 p-4">
        <div className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">Service Script</div>
        <p className="font-serif text-lg italic leading-8 text-[#f5f5f0]">"{cocktail.serviceScript}"</p>
      </div>
      <div className="mt-5">
        <Button disabled={practiced} onClick={onMarkPracticed}>
          {practiced ? 'Practiced' : 'Mark As Practiced'}
        </Button>
      </div>
    </article>
  )
}

function LabInput({ label, value, onChange, type = 'text' }) {
  const id = `lab-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{label}</label>
      <input id={id} type={type} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20" />
    </div>
  )
}

function LabSelect({ label, value, options, onChange }) {
  const id = `lab-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{label}</label>
      <select id={id} value={value} onChange={event => onChange(event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20">
        {options.map(option => <option key={option} value={option}>{titleCase(option) || option}</option>)}
      </select>
    </div>
  )
}

function RangeField({ label, value, onChange }) {
  const id = `lab-${label.toLowerCase()}`
  return (
    <div className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[11px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{label}</label>
        <span className="font-serif text-2xl font-black text-[#c9a96e]">{value}/10</span>
      </div>
      <input id={id} type="range" min="0" max="10" value={value} onChange={event => onChange(Number(event.target.value))} className="w-full accent-[#c9a96e]" />
    </div>
  )
}

function CocktailFact({ label, value }) {
  return (
    <div className="rounded-[1.35rem] border border-[#6b705c]/20 bg-black/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/70">{label}</div>
      <p className="text-sm leading-7 text-[#f5f5f0]">{value || 'Not specified'}</p>
    </div>
  )
}

function RiskList({ title, items = [] }) {
  const normalizedItems = (Array.isArray(items) ? items : [items]).filter(Boolean)
  return (
    <div className="rounded-[1.5rem] border border-[#6b705c]/20 bg-black/22 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]">{title}</div>
        <span className="h-px flex-1 bg-[#6b705c]/20" />
      </div>
      <ul className="space-y-3 text-xs leading-6 text-[#e8dcc0]">
        {(normalizedItems.length ? normalizedItems : ['No flagged items.']).map((item, index) => {
          const value = typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item || '')
          return (
            <li key={`${value.slice(0, 40)}-${index}`} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]/80" />
              <span>{value}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function StaffProgression({ t, users = [], academyProgress = {}, serviceIncidents = [], employeePerformance = {}, approvedCocktails = [], cocktailPractice = {} }) {
  const staffAcademies = UNIVERSITY_MANIFEST.filter(academy => academy.roles?.includes('employee'))
  const totalUniversityLessons = countUniversityLessons(staffAcademies)
  const avgSimulation = Math.round(STAFF.reduce((sum, item) => sum + item.simulation, 0) / STAFF.length)
  const approvedCocktailCount = approvedCocktails.length
  const exposureRows = useMemo(() => {
    const employeeNames = Array.from(new Set([
      ...users.filter(user => user.role === 'employee').map(user => user.username),
      ...STAFF.map(staff => staff.name)
    ]))

    return employeeNames.map(name => {
      const staff = STAFF.find(item => item.name === name) || {
        name,
        role: 'Employee',
        progress: 0,
        simulation: 0,
        status: 'Active'
      }
      const performance = employeePerformance[name] || { incidentCount: 0, unresolved: 0, categories: {} }
      const practiceRecord = cocktailPractice[name] || {}
      const practicedCocktails = approvedCocktails.filter(cocktail => practiceRecord[cocktail.id]?.practiced).length
      const practicePercent = approvedCocktailCount ? Math.round((practicedCocktails / approvedCocktailCount) * 100) : 0
      const academyCompleted = countCompletedLessons(academyProgress[name] || {})
      const academyPercent = totalUniversityLessons ? Math.round((academyCompleted / totalUniversityLessons) * 100) : 0
      return { ...staff, progress: academyPercent, academyCompleted, performance, practicedCocktails, practicePercent }
    })
  }, [academyProgress, approvedCocktailCount, approvedCocktails, cocktailPractice, employeePerformance, totalUniversityLessons, users])
  const avgProgress = exposureRows.length ? Math.round(exposureRows.reduce((sum, item) => sum + item.progress, 0) / exposureRows.length) : 0
  const totalPracticeSlots = exposureRows.length * approvedCocktailCount
  const completedPracticeSlots = exposureRows.reduce((sum, row) => sum + row.practicedCocktails, 0)
  const overallPracticePercent = totalPracticeSlots ? Math.round((completedPracticeSlots / totalPracticeSlots) * 100) : 0

  return (
    <>
      <Header eyebrow={t.pages.staffProgression} title="Staff Progression" body="Manager coaching intelligence: readiness, practice completion, service incident exposure, and professional development flags." />
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Metric label="Average Academy" value={`${avgProgress}%`} sub="Training progress" />
        <Metric label="Average Simulation" value={`${avgSimulation}%`} sub="Practice score" />
        <Metric label="Open Incidents" value={String(serviceIncidents.filter(item => !item.resolved).length)} sub="Coaching exposure" />
        <Metric label="Approved Cocktail Practice" value={`${overallPracticePercent}%`} sub={`${approvedCocktailCount} approved cocktails`} />
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#e8dcc0]">
                <th className="border-b border-[#6b705c]/30 p-3">Employee</th>
                <th className="border-b border-[#6b705c]/30 p-3">Academy</th>
                <th className="border-b border-[#6b705c]/30 p-3">Simulation</th>
                <th className="border-b border-[#6b705c]/30 p-3">Practice Completion</th>
                <th className="border-b border-[#6b705c]/30 p-3">Incident Exposure</th>
                <th className="border-b border-[#6b705c]/30 p-3">Coaching Flag</th>
              </tr>
            </thead>
            <tbody>
              {exposureRows.map(row => (
                <tr key={row.name} className="text-sm">
                  <td className="border-b border-[#6b705c]/30 p-3"><div className="font-black text-[#f5f5f0]">{row.name}</div><div className="text-xs text-[#e8dcc0]">{row.role}</div></td>
                  <td className="border-b border-[#6b705c]/30 p-3">{row.academyCompleted} / {totalUniversityLessons} lessons ({row.progress}%)</td>
                  <td className="border-b border-[#6b705c]/30 p-3">{row.simulation}%</td>
                  <td className="border-b border-[#6b705c]/30 p-3">{row.practicedCocktails} / {approvedCocktailCount} cocktails ({row.practicePercent}%)</td>
                  <td className="border-b border-[#6b705c]/30 p-3">{row.performance.incidentCount} reports / {row.performance.unresolved} unresolved</td>
                  <td className="border-b border-[#6b705c]/30 p-3 text-xs text-[#e8dcc0]">{row.performance.unresolved > 1 ? 'Manager coaching recommended' : row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

function BudgetRequestPage({ t, onSubmit, budgetRequests = [], currentUser }) {
  const [form, setForm] = useState({ title: '', department: 'Bar', reason: '', amount: '', urgency: 'Medium', roi: '', notes: '' })
  const [status, setStatus] = useState(null)
  const myRequests = budgetRequests.filter(item => item.managerName === currentUser?.username)

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.reason.trim() || !Number(form.amount)) {
      setStatus({ type: 'error', message: 'Title, reason, and amount are required.' })
      return
    }
    const saved = onSubmit?.(form)
    setStatus({ type: 'success', message: `${saved.title} submitted to owner approval queue.` })
    setForm({ title: '', department: 'Bar', reason: '', amount: '', urgency: 'Medium', roi: '', notes: '' })
  }

  return (
    <>
      <Header eyebrow={t.pages.budgetRequest} title="Submit Budget Request" body="Manager request workflow connected to owner approvals, notifications, and response status." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <form onSubmit={submit} className="space-y-5">
            <Field id="budget-title" label="Request Title" value={form.title} onChange={value => update('title', value)} />
            <div className="grid gap-5 md:grid-cols-3">
              <LabSelect label="Department" value={form.department} options={['Bar', 'Kitchen', 'Floor', 'Events', 'Training', 'Maintenance']} onChange={value => update('department', value)} />
              <Field id="budget-amount" label="Amount Requested" type="number" value={form.amount} onChange={value => update('amount', value)} />
              <LabSelect label="Urgency" value={form.urgency} options={['Low', 'Medium', 'High', 'Critical']} onChange={value => update('urgency', value)} />
            </div>
            <TextArea id="budget-reason" label="Reason" value={form.reason} onChange={value => update('reason', value)} />
            <TextArea id="budget-roi" label="Expected ROI" value={form.roi} onChange={value => update('roi', value)} rows={3} />
            <TextArea id="budget-notes" label="Notes" value={form.notes} onChange={value => update('notes', value)} rows={3} />
            {status && <Alert type={status.type}>{status.message}</Alert>}
            <Button type="submit">Submit For Owner Approval</Button>
          </form>
        </Card>
        <Card>
          <Label>Your Budget Responses</Label>
          <List items={myRequests.length ? myRequests.map(item => `${item.status.toUpperCase()}: ${item.title} - ${formatMoney(item.amount)}${item.responseNote ? ` - ${item.responseNote}` : ''}`) : ['No submitted requests yet.']} />
        </Card>
      </div>
    </>
  )
}

function BudgetApprovals({ t, budgetRequests = [], onRespond }) {
  const [responseNotes, setResponseNotes] = useState({})
  const pending = budgetRequests.filter(item => item.status === 'pending')

  return (
    <>
      <Header eyebrow={t.pages.budgetApprovals} title="Approve Budget" body="Owner approval board for manager requests with response status flowing back to manager operations." />
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Metric label="Pending Requests" value={String(pending.length)} sub="Need owner decision" />
        <Metric label="Pending Amount" value={formatMoney(pending.reduce((sum, item) => sum + Number(item.amount || 0), 0))} sub="Capital exposure" />
        <Metric label="Total Requests" value={String(budgetRequests.length)} sub="Local approval database" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {budgetRequests.map(request => (
          <Card key={request.id} className={cx('border-l-4', request.status === 'approved' ? 'border-l-emerald-700' : request.status === 'rejected' ? 'border-l-red-700' : 'border-l-[#c9a96e]')}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div><Label>{request.department}</Label><h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{request.title}</h2></div>
              <div className="text-right"><div className="font-serif text-3xl font-black text-[#c9a96e]">{formatMoney(request.amount)}</div><div className="text-xs text-[#e8dcc0]">{request.urgency}</div></div>
            </div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{request.reason}</p>
            <p className="mt-3 text-xs leading-6 text-[#e8dcc0]">ROI: {request.roi || 'Not specified'}</p>
            <p className="mt-2 text-xs leading-6 text-[#e8dcc0]">Manager: {request.managerName}</p>
            <textarea value={responseNotes[request.id] || ''} onChange={event => setResponseNotes(prev => ({ ...prev, [request.id]: event.target.value }))} placeholder="Owner response note..." rows={3} className="mt-4 w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-3 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button disabled={request.status !== 'pending'} onClick={() => onRespond?.(request.id, 'approved', responseNotes[request.id])}>Approve</Button>
              <Button variant="secondary" disabled={request.status !== 'pending'} onClick={() => onRespond?.(request.id, 'rejected', responseNotes[request.id])}>Reject</Button>
              <Button variant="ghost" disabled={request.status !== 'pending'} onClick={() => onRespond?.(request.id, 'needs more info', responseNotes[request.id] || 'Please provide more detail.')}>Need More Info</Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

function WeeklySummary({ t, reportArchive = [], serviceIncidents = [], budgetRequests = [], eventPlans = [], actionItems = [], currentUser }) {
  const summary = useMemo(() => {
    const unresolved = serviceIncidents.filter(item => !item.resolved)
    const pendingBudgets = budgetRequests.filter(item => item.status === 'pending')
    const openActions = actionItems.filter(item => !item.done)
    const eventRevenue = eventPlans.reduce((sum, item) => sum + Number(item.projected_revenue || item.budget || 0), 0)
    const execution = actionItems.length ? Math.round(((actionItems.length - openActions.length) / actionItems.length) * 100) : 100
    return {
      incidentCount: serviceIncidents.length,
      unresolved: unresolved.length,
      execution,
      pendingBudgets: pendingBudgets.length,
      eventRevenue,
      topLeaks: PROFIT_LEAKS.slice(0, 3).map(item => `${item.category}: ${formatMoney(item.monthly)}/mo`)
    }
  }, [actionItems, budgetRequests, eventPlans, serviceIncidents])

  const [aiBrief, setAiBrief] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  async function generateBrief() {
    setAiLoading(true)
    setAiError('')
    setAiBrief('')
    try {
      const { generateAIWeeklyBrief } = await import('./services/ownerInsightService')
      const brief = await generateAIWeeklyBrief({
        reports: reportArchive,
        incidents: serviceIncidents,
        actions: actionItems,
        eventPlans,
        role: currentUser?.role || 'owner'
      })
      setAiBrief(brief)
    } catch (err) {
      setAiError(err.message || 'AI brief generation failed. Check that the backend is running and a Gemini API key is configured.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <>
      <Header eyebrow={t.pages.weeklySummary} title="Weekly Intelligence Summary" body="Auto-generated owner summary panel. Click Generate to produce an AI narrative from real operational data." />
      <Card className="border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_35%),#11100d]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Label>Data Snapshot</Label>
            <h2 className="font-serif text-4xl font-black text-[#f5f5f0]">This week: {summary.incidentCount} incidents, {summary.unresolved} unresolved, {summary.execution}% manager execution.</h2>
          </div>
          <Button variant="primary" onClick={generateBrief} disabled={aiLoading} className="shrink-0 mt-1">
            {aiLoading ? 'Generating...' : 'Generate AI Brief'}
          </Button>
        </div>

        {aiError && <Alert type="error" className="mb-6">{aiError}</Alert>}

        {aiBrief && (
          <div className="mb-8 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e] mb-3">AI-Generated Owner Brief</div>
            <div className="text-sm leading-7 text-[#e8dcc0] whitespace-pre-line">{aiBrief}</div>
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <MiniFact label="Budget Requests" value={summary.pendingBudgets} />
          <MiniFact label="Event Revenue Ahead" value={formatMoney(summary.eventRevenue)} />
          <MiniFact label="EOD Reports" value={reportArchive.length} />
        </div>
        <div className="mt-8">
          <Label>Top Profit Leaks</Label>
          <List items={summary.topLeaks} />
        </div>
      </Card>
    </>
  )
}

function OperationalNotes({ t }) {
  const [notes, setNotes] = useState([
    { id: 1, date: '2026-05-03', author: 'Manager', text: 'Dinner service delay pressure expected between 19:30 and 20:15. Brief floor team before doors.', pinned: true },
    { id: 2, date: '2026-05-02', author: 'Manager', text: 'Bar team improved second-drink recommendations after pre-shift role play.', pinned: false },
    { id: 3, date: '2026-04-30', author: 'Manager', text: 'Dana needs one-on-one recovery coaching before next weekend shift.', pinned: false }
  ])
  const [draft, setDraft] = useState('')

  function addNote() {
    if (!draft.trim()) return
    setNotes(prev => [{ id: Date.now(), date: new Date().toISOString().slice(0, 10), author: 'Manager', text: draft.trim(), pinned: false }, ...prev])
    setDraft('')
  }

  return (
    <>
      <Header eyebrow={t.pages.operationalNotes} title="Operational Notes And Shift Memory" body="Capture manager observations that should not disappear after service. Pinned notes become the next-shift briefing layer." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {notes.map(note => (
            <article key={note.id} className={cx('rounded-2xl border bg-[#14130f] p-5', note.pinned ? 'border-[#c9a96e]/35' : 'border-[#6b705c]/30')}>
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {note.pinned && <span className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#c9a96e]">Pinned</span>}
                  <span className="text-xs text-[#e8dcc0]">{note.date} - {note.author}</span>
                </div>
                <button type="button" onClick={() => setNotes(prev => prev.map(item => item.id === note.id ? { ...item, pinned: !item.pinned } : item))} className="text-xs font-bold text-[#e8dcc0] transition hover:text-[#c9a96e]">{note.pinned ? 'Unpin' : 'Pin'}</button>
              </div>
              <p className="text-sm leading-7 text-[#e8dcc0]">{note.text}</p>
            </article>
          ))}
        </div>
        <Card className="h-fit">
          <Label>Add Operational Note</Label>
          <TextArea id="new-operational-note" label="" value={draft} onChange={setDraft} rows={5} />
          <Button className="mt-3 w-full" onClick={addNote}>Add Note</Button>
          <p className="mt-4 text-xs leading-6 text-[#e8dcc0]">Use this for patterns, staff concerns, VIP context, recovery follow-up, or anything ownership should remember later.</p>
        </Card>
      </div>
    </>
  )
}

function SOPSheets({ t }) {
  const [activeId, setActiveId] = useState(SOP_SHEETS[0].id)
  const active = SOP_SHEETS.find(item => item.id === activeId) || SOP_SHEETS[0]

  return (
    <>
      <Header eyebrow={t.pages.sopSheets} title="Service Standard Operating Procedures" body="Fast, precise SOP sheets for the moments that create or destroy guest trust." />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          {SOP_SHEETS.map(sheet => (
            <button key={sheet.id} type="button" onClick={() => setActiveId(sheet.id)} className={cx('w-full rounded-2xl border p-4 text-left transition', activeId === sheet.id ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/30 bg-[#1a1a1a] text-[#e8dcc0] hover:border-[#c9a96e]/40 hover:text-[#c9a96e]')}>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{sheet.code}</div>
              <div className="mt-1 text-sm font-black leading-5">{sheet.title}</div>
              <div className="mt-1 text-xs text-[#e8dcc0]">{sheet.category}</div>
            </button>
          ))}
        </div>
        <div className="space-y-5">
          <Card className="border-[#c9a96e]/20">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">{active.code} - {active.category}</div>
                <h2 className="mt-2 font-serif text-4xl font-black text-[#f5f5f0]">{active.title}</h2>
              </div>
              <span className="rounded-full border border-[#6b705c]/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]">{active.standard}</span>
            </div>
            <div className="space-y-3">
              {active.steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                  <span className="w-8 shrink-0 font-serif text-2xl font-black text-[#c9a96e]">{index + 1}</span>
                  <p className="text-sm leading-7 text-[#e8dcc0]">{step}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="border-[#c9a96e]/15 bg-[#1a1a1a]">
            <Label>Manager Note</Label>
            <p className="text-sm leading-7 text-[#e8dcc0]">{active.managerNote}</p>
          </Card>
        </div>
      </div>
    </>
  )
}

function LearningProgress({ t, currentUser, academyProgress = {} }) {
  const academies = getVisibleAcademies(currentUser)
  const completedMap = getUserLessonProgress(academyProgress, currentUser)
  const totalLessons = countUniversityLessons(academies)
  const completedLessons = countCompletedLessons(completedMap)
  const average = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <>
      <Header eyebrow={t.pages.learningProgress} title="Learning Progress And Certification Path" body="A focused employee view of what has been completed, what is next, and which service standard should be practiced before the next shift." />
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Overall Progress" value={`${average}%`} sub="Across academy" />
        <Metric label="Lessons Complete" value={String(completedLessons)} sub={`of ${totalLessons}`} />
        <Metric label="Active Academies" value={String(academies.length)} sub="Visible for role" />
        <Metric label="Next Certification" value={academies[0]?.title || 'Academy'} sub="Recommended" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {academies.map(academy => {
          const total = academy.lessons?.length || 0
          const completeCount = academy.lessons?.filter(lesson => isLessonComplete(completedMap, academy.id, lesson.id)).length || 0
          const progress = total ? Math.round((completeCount / total) * 100) : 0
          return (
            <Card key={academy.id}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{academy.category}</div>
                <h2 className="mt-1 font-serif text-2xl font-black text-[#f5f5f0]">{academy.title}</h2>
              </div>
              <span className="font-serif text-3xl font-black text-[#c9a96e]">{progress}%</span>
            </div>
            <Progress value={progress} label={academy.title} />
            <p className="mt-3 text-xs leading-6 text-[#e8dcc0]">{completeCount} / {total} lessons complete - {academy.description}</p>
          </Card>
          )
        })}
      </div>
    </>
  )
}

function ExecutiveOverview({ t, reportArchive = [], eventPlans = [] }) {
  const latestReport = reportArchive[0]
  const latestEvent = eventPlans[0]

  return (
    <>
      <Header eyebrow={t.areas.ownerIntelligence} title="Executive Overview" body="Owner-grade business intelligence: profit exposure, readiness risk, and the highest leverage decisions for this week." />
      <Card className="mb-6 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.18),transparent_35%),linear-gradient(135deg,#191812,#11100d)] p-7">
        <div className="max-w-4xl">
          <div className="text-xs font-black uppercase tracking-[0.22em] text-[#c9a96e]">Weekly Command Summary</div>
          <h2 className="mt-3 font-serif text-4xl font-black tracking-tight text-[#f5f5f0]">HOSPIA identified NIS 27.1k in monthly leakage and NIS 12.9k recoverable within 30 days.</h2>
          <p className="mt-4 text-sm leading-8 text-[#e8dcc0]">The strongest drivers are compensation before recovery, missed beverage upsells, and unmanaged kitchen delays. The next move is not more data - it is manager execution.</p>
        </div>
      </Card>
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Metric label="Monthly Leakage" value="NIS 27.1k" sub="Identified" />
        <Metric label="Recoverable Now" value="NIS 12.9k" sub="30-day target" />
        <Metric label="Hospitality Score" value="87" sub="+4 this week" />
        <Metric label="EOD Archive" value={String(reportArchive.length)} sub={latestReport ? `Latest: ${latestReport.shift_date}` : 'No reports yet'} />
        <Metric label="Saved Events" value={String(eventPlans.length)} sub={latestEvent ? formatMoney(latestEvent.projected_profit || 0) : 'No event plans yet'} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><Label>Top Owner Priorities</Label><List items={['Enforce recovery-first compensation policy.', 'Mandate beverage recommendation training for floor and bar.', 'Resolve Dana P. readiness risk before weekend.', 'Review Friday delay pattern with manager and kitchen lead.']} /></Card>
        <Card><Label>{latestReport ? 'Latest End Of Day Signal' : t.copy.aiRecommendations}</Label><List items={latestReport ? [
          latestReport.shift_summary || 'No shift summary entered.',
          latestReport.complaints ? `Complaints: ${latestReport.complaints}` : 'No complaint detail entered.',
          latestReport.urgent_items ? `Urgent: ${latestReport.urgent_items}` : 'No urgent owner items entered.'
        ] : ['Treat service recovery as financial governance, not soft skills.', 'Use End Of Day consistency to build a defensible business memory layer.', 'Convert Knowledge Library usage into staff readiness signals in production.']} /></Card>
      </div>
    </>
  )
}

function BusinessMRI({ t }) {
  const dimensions = [
    ['First Impression', 84, 'good'],
    ['Delay Communication', 61, 'warning'],
    ['Complaint Recovery', 67, 'warning'],
    ['Natural Upselling', 52, 'critical'],
    ['Farewell And Return Intent', 91, 'good'],
    ['Staff Readiness', 74, 'warning'],
    ['Beverage Service', 83, 'good']
  ]
  const score = Math.round(dimensions.reduce((sum, item) => sum + item[1], 0) / dimensions.length)
  const colors = { good: 'bg-emerald-500 text-emerald-300', warning: 'bg-amber-500 text-amber-300', critical: 'bg-red-500 text-red-300' }

  return (
    <>
      <Header eyebrow={t.pages.businessMRI} title="Business MRI" body="A diagnostic scan of the service dimensions that influence revenue, guest trust, and management focus." />
      <Card className="mb-6 border-[#c9a96e]/20 bg-[#1a1a1a]">
        <div className="flex flex-wrap items-center gap-6">
          <div><div className="font-serif text-7xl font-black text-[#c9a96e]">{score}</div><div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">Overall MRI Score</div></div>
          <p className="max-w-2xl font-serif text-2xl leading-10 text-[#f5f5f0]">Two weak points are currently dragging operational value: Natural Upselling and Delay Communication.</p>
        </div>
      </Card>
      <Card>
        <Label>Dimension Scan</Label>
        <div className="space-y-4">
          {dimensions.map(([label, value, status]) => (
            <div key={label} className="grid gap-3 sm:grid-cols-[220px_1fr_60px] sm:items-center">
              <div className="text-sm font-bold text-[#e8dcc0]">{label}</div>
              <div className="h-2 overflow-hidden rounded-full bg-[#6b705c]/30"><div className={cx('h-full rounded-full', colors[status].split(' ')[0])} style={{ width: `${value}%` }} /></div>
              <div className={cx('text-sm font-black sm:text-right', colors[status].split(' ')[1])}>{value}%</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

function ProfitLeaks({ t }) {
  const [leakFixRate, setLeakFixRate] = useState(30) // Slider for "How much can we fix?"
  const total = PROFIT_LEAKS.reduce((sum, leak) => sum + leak.monthly, 0)
  const projectedRecovery = Math.round(total * (leakFixRate / 100))
  
  const riskClass = { high: 'border-red-800/50 bg-red-950/25 text-red-200', medium: 'border-amber-800/50 bg-amber-950/25 text-amber-200', low: 'border-[#6b705c]/50 bg-[#6b705c]/25 text-[#e8dcc0]' }

  return (
    <>
      <Header eyebrow={t.pages.profitLeaks} title="Profit Leak Intelligence" body="Revenue leaving the building through preventable execution failures. Use the calculator below to model your recovery ROI." />
      
      <section className="mb-12">
        <Card className="bg-gradient-to-br from-[#1c1b17] to-[#0a0a08] border-[#c9a96e]/30">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px] items-center">
            <div>
              <Label>Leak Recovery Modeling</Label>
              <h2 className="font-serif text-4xl font-black text-[#f5f5f0] mb-6">
                If we improve execution by <span className="text-[#c9a96e]">{leakFixRate}%</span>...
              </h2>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={leakFixRate} 
                onChange={(e) => setLeakFixRate(e.target.value)}
                className="w-full h-2 bg-[#6b705c]/30 rounded-lg appearance-none cursor-pointer accent-[#c9a96e]"
              />
              <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]">
                <span>Incremental Fix</span>
                <span>Full Transformation</span>
              </div>
            </div>
            <div className="text-center p-6 rounded-3xl bg-[#c9a96e]/10 border border-[#c9a96e]/20">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">Est. Monthly Recovery</div>
              <div className="font-serif text-5xl font-black text-[#f5f5f0]">NIS {projectedRecovery.toLocaleString()}</div>
              <div className="mt-2 text-xs text-[#e8dcc0]">NIS {(projectedRecovery * 12).toLocaleString()} / year</div>
            </div>
          </div>
        </Card>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Total Monthly Leakage" value={`NIS ${total.toLocaleString()}`} sub="Detected exposure" />
        <Metric label="Recoverable In 30 Days" value="NIS 12.9k" sub="Targeted execution" />
        <Metric label="High Risk Leaks" value={String(PROFIT_LEAKS.filter(leak => leak.risk === 'high').length)} sub="Immediate action" />
      </div>
      <div className="space-y-4">
        {PROFIT_LEAKS.map(leak => (
          <Card key={leak.category} className={cx('border-l-4', leak.risk === 'high' ? 'border-l-red-700' : leak.risk === 'medium' ? 'border-l-amber-700' : 'border-l-[#6b705c]')}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
              <span className={cx('rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]', riskClass[leak.risk])}>{leak.risk} risk - {leak.trend}</span>
              <div className="text-right"><div className="font-serif text-3xl font-black text-[#c9a96e]">NIS {leak.monthly.toLocaleString()}/mo</div><div className="text-xs text-[#e8dcc0]">NIS {leak.weekly.toLocaleString()}/week</div></div>
            </div>
            <h2 className="font-serif text-2xl font-black text-[#f5f5f0]">{leak.category}</h2>
            <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">{leak.note}</p>
          </Card>
        ))}
      </div>
    </>
  )
}

function OwnerReport({ t, reportArchive = [], eventPlans = [] }) {
  const latestReport = reportArchive[0]
  const latestEvent = eventPlans[0]
  const totalEventProfit = eventPlans.reduce((sum, plan) => sum + Number(plan.projected_profit || plan.calculations?.grossProfit || 0), 0)
  const reportSignals = reportArchive.filter(report => report.urgent_items || report.complaints).length

  return (
    <>
      <Header eyebrow={t.pages.ownerReport} title="Owner Weekly Report" body="A boardroom-ready summary created from End Of Day reports, readiness data, profit leak signals, and business memory." />
      <Card className="mb-6 border-[#c9a96e]/20 bg-[#1a1a1a]">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-[#c9a96e]">Executive Summary</div>
        <h2 className="mt-3 font-serif text-4xl font-black text-[#f5f5f0]">Hospitality Score: 87/100. Recoverable value this month: NIS 12.9k.</h2>
        <p className="mt-3 text-sm leading-7 text-[#e8dcc0]">Performance improved in farewell and first impression. Drag remains in upselling and delay communication.</p>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><Label>Owner Actions Required</Label><List items={['Approve recovery-first compensation policy.', 'Review Dana P. readiness plan.', 'Confirm beverage upsell training mandate.', 'Review Friday delay pattern with management.']} /></Card>
        <Card><Label>Commercial Signals</Label><List items={['NIS 27.1k monthly leakage detected.', 'NIS 42.6k protected revenue tracked.', '7-shift reporting streak reached.', 'Two staff members create elevated weekend risk.']} /></Card>
      </div>
      <OwnerValueLedger totalEventProfit={totalEventProfit} reportSignals={reportSignals} eventPlans={eventPlans} reportArchive={reportArchive} />
      <Card className="mt-4 border-[#c9a96e]/20">
        <Label>Latest Submitted End Of Day Report</Label>
        {latestReport ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ReportFact label="Shift Date" value={latestReport.shift_date} />
            <ReportFact label="Manager" value={latestReport.manager_name || 'Manager'} />
            <ReportFact label="Shift Summary" value={latestReport.shift_summary || 'No summary entered'} />
            <ReportFact label="Urgent Items" value={latestReport.urgent_items || 'No urgent items entered'} />
          </div>
        ) : (
          <p className="text-sm leading-7 text-[#e8dcc0]">No successful End Of Day submissions have been archived in this browser yet.</p>
        )}
      </Card>
      <Card className="mt-4 border-[#c9a96e]/20">
        <Label>Latest Saved Event Orchestrator Report</Label>
        {latestEvent ? (
          <div className="grid gap-4 md:grid-cols-2">
            <ReportFact label="Event Plan" value={latestEvent.name} />
            <ReportFact label="Projected Revenue" value={formatMoney(latestEvent.projected_revenue || latestEvent.calculations?.revenue || 0)} />
            <ReportFact label="Projected Profit" value={formatMoney(latestEvent.projected_profit || latestEvent.calculations?.grossProfit || 0)} />
            <ReportFact label="Projected Margin" value={`${Number(latestEvent.projected_margin || latestEvent.calculations?.margin || 0).toFixed(1)}%`} />
          </div>
        ) : (
          <p className="text-sm leading-7 text-[#e8dcc0]">No saved Event Orchestrator plans yet.</p>
        )}
      </Card>
    </>
  )
}

function OwnerValueLedger({ totalEventProfit, reportSignals, eventPlans, reportArchive }) {
  const ledger = [
    { label: 'Projected event profit pipeline', value: formatMoney(totalEventProfit), detail: `${eventPlans.length} saved Event Orchestrator plans` },
    { label: 'Operational risk signals captured', value: String(reportSignals), detail: `${reportArchive.length} End Of Day reports archived` },
    { label: 'Recoverable service leakage', value: 'NIS 12.9k', detail: 'Current modeled monthly opportunity' },
    { label: 'Training risk under management', value: '2 staff', detail: 'At Risk / Needs Coaching status' }
  ]

  return (
    <Card className="mt-4 border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.1),transparent_36%),#14130f]">
      <div className="mb-5 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">
        <CircleDollarSign className="h-4 w-4" aria-hidden="true" />
        Owner Value Ledger
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ledger.map(item => (
          <div key={item.label} className="rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
            <div className="font-serif text-3xl font-black text-[#c9a96e]">{item.value}</div>
            <div className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#e8dcc0]">{item.label}</div>
            <p className="mt-2 text-xs leading-5 text-[#e8dcc0]">{item.detail}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ReportFact({ label, value }) {
  return (
    <div className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]">{label}</div>
      <p className="text-sm leading-7 text-[#f5f5f0]">{value}</p>
    </div>
  )
}

function BusinessMemoryPage({ t, reportArchive = [], businessMemory = BUSINESS_MEMORY }) {
  const hasBackendReportMemory = businessMemory.some(event => event.type === 'report' || event.title?.startsWith('End Of Day'))
  const reportEvents = hasBackendReportMemory ? [] : reportArchive.slice(0, 8).map(report => ({
    date: report.shift_date || report.submitted_at?.slice(0, 10) || 'Recent',
    type: 'report',
    title: `End Of Day submitted by ${report.manager_name || 'Manager'}`,
    detail: report.urgent_items || report.shift_summary || 'Shift report submitted successfully through EmailJS.'
  }))
  const normalizedMemory = businessMemory.map(event => ({
    date: event.date || event.event_date || event.created_at?.slice(0, 10) || 'Recent',
    type: event.type || 'note',
    title: event.title,
    detail: event.detail
  }))
  const memoryEvents = [...reportEvents, ...normalizedMemory]
  const style = {
    alert: 'border-red-900/40',
    win: 'border-emerald-900/40',
    note: 'border-[#6b705c]/30',
    report: 'border-[#c9a96e]/25',
    event: 'border-[#c9a96e]/30 bg-[#1a1a1a]'
  }

  return (
    <>
      <Header eyebrow={t.pages.businessMemory} title="Business Memory" body="A persistent record of operational events, wins, risks, and patterns. This is the layer that makes HOSPIA more valuable every shift." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Metric label="Memory Events" value={String(memoryEvents.length)} sub={`${reportArchive.length} archived reports`} />
        <Metric label="Recurring Pattern" value="Friday" sub="Delay pressure" />
        <Metric label="Open Human Risk" value="Dana P." sub="At Risk status" />
      </div>
      <div className="relative space-y-4 ps-6">
        <div className="absolute bottom-0 start-2 top-0 w-px bg-[#6b705c]/30" />
        {memoryEvents.map(event => (
          <article key={`${event.date}-${event.title}`} className="relative">
            <div className={cx('absolute -start-5 top-6 h-3 w-3 rounded-full border-2 border-[#0d0c09]', event.type === 'alert' ? 'bg-red-500' : event.type === 'win' ? 'bg-emerald-500' : 'bg-[#c9a96e]')} />
            <Card className={style[event.type] || style.note}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">{event.type}</span>
                <span className="text-xs text-[#e8dcc0]">{event.date}</span>
              </div>
              <h2 className="font-serif text-xl font-black text-[#f5f5f0]">{event.title}</h2>
              <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">{event.detail}</p>
            </Card>
          </article>
        ))}
      </div>
    </>
  )
}

function StrategicRecommendations({ t }) {
  const recs = [
    ['7 days', 'Issue recovery-first script mandate', 'NIS 8.4k monthly comp exposure', 'Require a documented recovery attempt before any compensation.'],
    ['14 days', 'Run beverage upsell training for floor and bar', 'NIS 6.2k monthly recoverable', 'Use Knowledge Library and Natural Upselling course as the training path.'],
    ['This week', 'Resolve Dana P. At Risk status', 'Training investment protection', 'Create a coaching plan or role adjustment before norms decay.'],
    ['30 days', 'Adjust Friday kitchen and floor briefing', 'NIS 4.8k delay leak prevention', 'Move briefing earlier and monitor delay incidents over two weekends.']
  ]

  return (
    <>
      <Header eyebrow={t.pages.strategicRecommendations} title="Strategic Recommendations" body="Prioritized decisions that connect service execution to owner-level value." />
      <div className="space-y-4">
        {recs.map(([horizon, title, impact, detail], index) => (
          <Card key={title} className={cx('border-l-4', index === 0 ? 'border-l-red-700' : index === 1 ? 'border-l-amber-700' : 'border-l-[#c9a96e]')}>
            <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="font-serif text-5xl font-black leading-none text-[#6b705c]">0{index + 1}</span>
                <div>
                  <span className="rounded-full border border-[#6b705c]/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]">{horizon}</span>
                  <h2 className="mt-2 font-serif text-2xl font-black text-[#f5f5f0]">{title}</h2>
                </div>
              </div>
              <div className="text-right text-sm font-black text-[#c9a96e]">{impact}</div>
            </div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{detail}</p>
          </Card>
        ))}
      </div>
    </>
  )
}

function MissingPage({ page }) {
  return (
    <>
      <Header eyebrow="System" title="Page unavailable" body="This route is not available for the current product configuration." />
      <Card className="border-amber-900/40 bg-amber-950/10">
        <Label>Route Guard</Label>
        <p className="text-sm leading-7 text-[#e8dcc0]">The requested page key is <span className="font-mono text-[#c9a96e]">{page}</span>. If this appears during normal navigation, a page was added before its production component was implemented.</p>
      </Card>
    </>
  )
}

function UserManagement({ currentUser, users = [], onCreateUser, onUpdateUser, onDisableUser }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'employee',
    venue: 'Main Venue',
    team: 'Front of House',
    canManageCocktails: false
  })
  const [editingUser, setEditingUser] = useState(null)
  const [status, setStatus] = useState(null)
  const canManage = ['owner', 'admin'].includes(currentUser?.role)

  const updateField = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'role' && value === 'bar_manager' ? { canManageCocktails: true } : {})
    }))
  }

  const resetForm = () => {
    setEditingUser(null)
    setForm({
      username: '',
      password: '',
      role: 'employee',
      venue: 'Main Venue',
      team: 'Front of House',
      canManageCocktails: false
    })
  }

  function submit(event) {
    event.preventDefault()
    if (!canManage) {
      setStatus({ type: 'error', message: 'Only owners and admins can manage users.' })
      return
    }

    try {
      const payload = {
        ...form,
        canManageCocktails: Boolean(form.canManageCocktails || form.role === 'bar_manager' || form.role === 'admin')
      }
      const saved = editingUser
        ? onUpdateUser?.(editingUser.username, payload)
        : onCreateUser?.(payload)
      setStatus({ type: 'success', message: `${saved.username} ${editingUser ? 'updated' : 'created'} successfully.` })
      resetForm()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not save user.' })
    }
  }

  function startEdit(user) {
    setEditingUser(user)
    setForm({
      username: user.username,
      password: user.password || '',
      role: user.role || 'employee',
      venue: user.venue || 'Main Venue',
      team: user.team || user.venue || 'Front of House',
      canManageCocktails: Boolean(user.canManageCocktails || user.role === 'bar_manager' || user.role === 'admin')
    })
    setStatus(null)
  }

  function disable(username) {
    try {
      const disabled = onDisableUser?.(username)
      setStatus({ type: 'success', message: `${disabled.username} disabled. They can no longer log in.` })
      if (editingUser?.username === username) resetForm()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not disable user.' })
    }
  }

  return (
    <>
      <Header
        eyebrow="Workspace Access"
        title="User Management"
        body="Create team members, assign roles, connect them to a venue or team, and control access without changing code."
      />
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <Card className="h-fit border-[#c9a96e]/20">
          <Label>{editingUser ? 'Edit User' : 'Create User'}</Label>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Username</label>
              <input value={form.username} onChange={event => updateField('username', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Password</label>
              <input value={form.password} onChange={event => updateField('password', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Role</label>
                <select value={form.role} onChange={event => updateField('role', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]">
                  {USER_ROLES.map(roleName => <option key={roleName} value={roleName}>{roleName.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Team</label>
                <input value={form.team} onChange={event => updateField('team', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">Venue</label>
              <input value={form.venue} onChange={event => updateField('venue', event.target.value)} className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]" />
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-[#6b705c]/30 bg-[#10100e] p-3 text-sm text-[#e8dcc0]">
              <input type="checkbox" checked={form.canManageCocktails} onChange={event => updateField('canManageCocktails', event.target.checked)} />
              Can manage Cocktail Lab / menu requests
            </label>
            {status && <Alert type={status.type}>{status.message}</Alert>}
            <div className="flex flex-wrap gap-3">
              <Button type="submit">{editingUser ? 'Save User' : 'Create User'}</Button>
              {editingUser && <Button variant="secondary" onClick={resetForm}>Cancel Edit</Button>}
            </div>
          </form>
        </Card>

        <Card>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Label>Workspace Users</Label>
              <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">{users.length} team profiles</h2>
            </div>
            <span className="rounded-full border border-[#c9a96e]/25 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">Owner/Admin governed</span>
          </div>
          <div className="space-y-3">
            {users.map(user => (
              <article key={user.username} className={cx('rounded-2xl border p-4', user.disabled ? 'border-red-900/35 bg-red-950/10' : 'border-[#6b705c]/25 bg-[#10100e]')}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-2xl font-black text-[#f5f5f0]">{user.username}</h3>
                    <p className="mt-1 text-xs leading-5 text-[#e8dcc0]">{String(user.role || '').replace('_', ' ')} - {user.venue || 'Main Venue'} - {user.team || 'Team'}</p>
                    {user.canManageCocktails && <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">Cocktail Lab permission</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => startEdit(user)}>Edit</Button>
                    <Button variant="ghost" disabled={user.disabled || user.username === currentUser?.username} onClick={() => disable(user.username)}>
                      {user.disabled ? 'Disabled' : 'Disable'}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

function Settings({ t }) {
  const [saved, setSaved] = useState(false)

  return (
    <>
      <Header eyebrow={t.pages.settings} title={t.pages.settings} body={t.copy.settingsBody} />
      <Card>
        <Label>{t.app.language}</Label>
        <p className="mb-4 text-sm leading-7 text-[#e8dcc0]">
          Use the language switcher in the side panel to change interface language.
        </p>
        <Button onClick={() => {
          setSaved(true)
          window.setTimeout(() => setSaved(false), 1800)
        }}>
          {t.ui.save}
        </Button>
        {saved && <p className="mt-3 text-sm font-bold text-emerald-300">Preferences are already stored locally.</p>}
      </Card>
    </>
  )
}

function Card({ children, className = '' }) {
  return (
    <section className={cx('rounded-[2.5rem] border border-[#6b705c]/10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a08] p-10 lg:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.4)] transition-all duration-700 hover:shadow-[0_60px_150px_rgba(0,0,0,0.6)]', className)}>
      {children}
    </section>
  )
}

function Button({ children, onClick, variant = 'primary', className = '', disabled, type = 'button' }) {
  const styles = {
    primary: 'bg-[#c9a96e] text-[#0d0c09] hover:bg-[#dfc497] shadow-xl shadow-[#c9a96e]/10',
    secondary: 'border border-[#6b705c]/30 bg-transparent text-[#f5f5f0] hover:border-[#c9a96e]/40 hover:text-[#c9a96e]',
    ghost: 'text-[#e8dcc0] hover:bg-[#6b705c]/20 hover:text-[#f5f5f0]'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'inline-flex min-h-14 items-center justify-center rounded-2xl px-10 py-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 disabled:cursor-not-allowed disabled:opacity-50',
        styles[variant],
        className
      )}
    >
      {children}
    </button>
  )
}

function Label({ children }) {
  return (
    <div className="mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">
      {children}
    </div>
  )
}

function Header({ eyebrow, title, body }) {
  return (
    <header className="mb-24 lg:mb-32">
      <div className="mb-6 text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e]">{eyebrow}</div>
      <h1 className="max-w-5xl font-serif text-6xl font-black leading-[1] tracking-tighter text-[#f5f5f0] sm:text-8xl lg:text-9xl">{title}</h1>
      <p className="mt-12 max-w-3xl text-xl font-light leading-relaxed text-[#e8dcc0] opacity-80 italic">{body}</p>
    </header>
  )
}

function Field({ id, label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
      />
    </div>
  )
}

function TextArea({ id, label, value, onChange, rows = 5 }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full resize-y rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4 text-sm leading-7 text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
      />
    </div>
  )
}

function Progress({ value, label }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}>
      <div className="h-2 overflow-hidden rounded-full bg-[#6b705c]/30">
        <div className="h-full rounded-full bg-[#c9a96e]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  )
}

function ProgressBlock({ label, value }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-black text-[#c9a96e]">{value}%</span>
      </div>
      <Progress value={value} label={label} />
    </div>
  )
}

function Metric({ label, value, sub, large = false }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full border border-[#c9a96e]/5" />
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e] opacity-60">{label}</div>
      <div className={cx('mt-6 font-serif font-black tracking-tighter text-[#f5f5f0]', large ? 'text-8xl' : 'text-6xl')}>{value}</div>
      <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-[#e8dcc0] opacity-40">{sub}</p>
    </Card>
  )
}

function List({ items }) {
  return (
    <div className="grid gap-6">
      {items.map(item => (
        <div key={item} className="rounded-3xl border border-[#6b705c]/10 bg-white/[0.02] p-8 text-sm leading-relaxed text-[#e8dcc0]">
          {item}
        </div>
      ))}
    </div>
  )
}

function Alert({ type, children }) {
  const styles = {
    success: 'border-emerald-400/30 bg-emerald-950/20 text-emerald-200',
    info: 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#f5f5f0]',
    warning: 'border-amber-400/30 bg-amber-950/20 text-amber-100',
    error: 'border-red-400/30 bg-red-950/20 text-red-100'
  }

  return (
    <div className={cx(
      'mt-4 rounded-xl border p-4 text-sm font-bold',
      styles[type] || styles.error
    )}>
      {children}
    </div>
  )
}

function LanguageSwitcher({ t, lang, setLang }) {
  return (
    <div className="flex shrink-0 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-1">
      {[
        ['en', t.app.english],
        ['he', t.app.hebrew]
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => setLang(key)}
          className={cx(
            'rounded-lg px-3 py-1.5 text-xs font-black transition',
            lang === key ? 'bg-[#c9a96e] text-[#11100d]' : 'text-[#e8dcc0] hover:text-[#f5f5f0]'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

