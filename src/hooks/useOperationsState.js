import { useState, useEffect, useCallback } from 'react'
import { STORAGE, EMAILJS } from '../config/systemConfig'
import { formatMoney } from '../utils/format'
import { loadEmailJS } from '../utils/emailjs'
import { generateExecutiveEventSummary } from '../prompts/eventPrompts'
import { ACTION_BOARD_ITEMS } from '../data/businessMemory'
import { INITIAL_FUTURE_EVENTS } from '../data/events'
import { INITIAL_BUDGET_REQUESTS, INITIAL_SERVICE_INCIDENTS, INITIAL_EMPLOYEE_TASKS, INITIAL_OWNER_NOTES } from '../data/operations'

function normalizeText(value) {
  return String(value || '').toLowerCase()
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

async function sendOwnerEnquiryApprovalEmail(eventPlan) {
  const emailjs = await loadEmailJS()
  const payload = {
    event_summary: generateExecutiveEventSummary(eventPlan),
    status: eventPlan.status || 'ENQUIRY_APPROVED',
    owner_name: 'Tal Millo',
    subject: 'HESTIA AI — New Event Enquiry Requires Owner Approval'
  }

  console.log('OWNER ENQUIRY EMAIL PAYLOAD', payload)

  return emailjs.send(
    EMAILJS.serviceId,
    EMAILJS.ownerEnquiryApprovalTemplateId,
    payload,
    EMAILJS.publicKey
  )
}

export function useOperationsState({ currentUser, pushNotification, addBusinessMemoryEvent }) {
  const [eventPlans, setEventPlans] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.futureEvents) || 'null')
      return Array.isArray(saved) ? saved : INITIAL_FUTURE_EVENTS
    } catch { return INITIAL_FUTURE_EVENTS }
  })
  const [actionItems, setActionItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.actionItems) || 'null')
      return Array.isArray(saved) ? saved : ACTION_BOARD_ITEMS
    } catch { return ACTION_BOARD_ITEMS }
  })
  const [budgetRequests, setBudgetRequests] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.budgetRequests) || 'null')
      return Array.isArray(saved) ? saved : INITIAL_BUDGET_REQUESTS
    } catch { return INITIAL_BUDGET_REQUESTS }
  })
  const [serviceIncidents, setServiceIncidents] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.serviceIncidents) || 'null')
      return Array.isArray(saved) ? saved : INITIAL_SERVICE_INCIDENTS
    } catch { return INITIAL_SERVICE_INCIDENTS }
  })
  const [employeePerformance, setEmployeePerformance] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.employeePerformance) || 'null')
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
    } catch { return {} }
  })
  const [employeeTasks, setEmployeeTasks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.employeeTasks) || 'null')
      return Array.isArray(saved) ? saved : INITIAL_EMPLOYEE_TASKS
    } catch { return INITIAL_EMPLOYEE_TASKS }
  })
  const [employeeRequests, setEmployeeRequests] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.employeeRequests) || 'null')
      return Array.isArray(saved) ? saved : []
    } catch { return [] }
  })
  const [ownerNotes, setOwnerNotes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE.ownerNotes) || 'null')
      return Array.isArray(saved) ? saved : INITIAL_OWNER_NOTES
    } catch { return INITIAL_OWNER_NOTES }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE.futureEvents, JSON.stringify(eventPlans))
  }, [eventPlans])

  useEffect(() => {
    localStorage.setItem(STORAGE.actionItems, JSON.stringify(actionItems))
  }, [actionItems])

  useEffect(() => {
    localStorage.setItem(STORAGE.budgetRequests, JSON.stringify(budgetRequests))
  }, [budgetRequests])

  useEffect(() => {
    localStorage.setItem(STORAGE.serviceIncidents, JSON.stringify(serviceIncidents))
  }, [serviceIncidents])

  useEffect(() => {
    localStorage.setItem(STORAGE.employeePerformance, JSON.stringify(employeePerformance))
  }, [employeePerformance])

  useEffect(() => {
    localStorage.setItem(STORAGE.employeeTasks, JSON.stringify(employeeTasks))
  }, [employeeTasks])

  useEffect(() => {
    localStorage.setItem(STORAGE.employeeRequests, JSON.stringify(employeeRequests))
  }, [employeeRequests])

  useEffect(() => {
    localStorage.setItem(STORAGE.ownerNotes, JSON.stringify(ownerNotes))
  }, [ownerNotes])

  const updateIncident = useCallback((incidentId, patch) => {
    setServiceIncidents(prev => prev.map(item => item.id === incidentId ? { ...item, ...patch } : item))
  }, [])

  const updateEmployeeTask = useCallback((taskId, status) => {
    setEmployeeTasks(prev => prev.map(task => (
      task.id === taskId
        ? { ...task, status, updated_at: new Date().toISOString(), updatedBy: currentUser?.username || 'Team' }
        : task
    )))
  }, [currentUser?.username])

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

  const sendOwnerNote = useCallback(body => {
    const note = { id: `owner-note-${Date.now()}`, from: currentUser?.username || 'Manager', body, created_at: new Date().toISOString() }
    setOwnerNotes(prev => [note, ...prev].slice(0, 40))
    pushNotification({ roles: ['owner', 'admin'], title: 'Manager note sent', body, type: 'owner-note', page: 'commandCenter' })
    return note
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

  const saveEventPlan = useCallback(async ({ name, config, calculations }) => {
    const isManagerEnquiry = currentUser?.role === 'manager' && config.eventStatus === 'Inquiry'
    const eventStatus = isManagerEnquiry ? 'ENQUIRY_PENDING_OWNER_APPROVAL' : config.eventStatus
    const persistedConfig = { ...config, eventStatus }
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

  return {
    eventPlans,
    setEventPlans,
    actionItems,
    setActionItems,
    budgetRequests,
    serviceIncidents,
    employeePerformance,
    employeeTasks,
    employeeRequests,
    ownerNotes,
    saveEventPlan,
    approveEventEnquiry,
    submitServiceIncident,
    updateIncident,
    updateEmployeeTask,
    submitBudgetRequest,
    respondBudgetRequest,
    submitEmployeeRequest,
    managerReviewEmployeeRequest,
    ownerReviewEmployeeRequest,
    sendOwnerNote
  }
}
