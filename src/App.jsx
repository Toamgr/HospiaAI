import React, { useCallback } from 'react'
import EmployeeNavRail from './features/employee/EmployeeNavRail'
import LoginScreen from './features/auth/LoginScreen'
import TopNav from './features/shell/TopNav'
import SidePanel from './features/shell/SidePanel'
import NotificationPanel from './features/shell/NotificationPanel'
import WineAtlas from './features/wine-atlas/WineAtlas'
import PageRenderer from './PageRenderer'
import { cx } from './utils/format'
import { clearSession, saveToken } from './services/authService'
import { loginWithCredentials } from './services/api/sessionApi'
import { setAuthToken, clearAuthToken, apiPost } from './services/api/client'
import { enqueue, dequeue } from './services/pendingSyncQueue'
import { useUserManagement } from './hooks/useUserManagement'
import { TEXT } from './config/textConfig'
import { useNotificationState } from './hooks/useNotificationState'
import { useSessionState } from './hooks/useSessionState'
import { useNavigationState } from './hooks/useNavigationState'
import { useReportsState } from './hooks/useReportsState'
import { useCocktailPipeline } from './hooks/useCocktailPipeline'
import { useStaffAcademyState } from './hooks/useStaffAcademyState'
import { useOperationsState } from './hooks/useOperationsState'
import { useShiftBrainState } from './hooks/useShiftBrainState'
import { useShiftState } from './hooks/useShiftState'
import { useBackendSync } from './hooks/useBackendSync'
import { useOwnerPulseState } from './hooks/useOwnerPulseState'
import { useEventState } from './hooks/useEventState'
import { useCocktailIntelligenceState } from './hooks/useCocktailIntelligenceState' // CI MODULE ADDITION
import { useVenueIntelligenceState } from './hooks/useVenueIntelligenceState'
import { useVenueState } from './hooks/useVenueState'


export default function App() {
  const { lang, setLang, currentUser, setCurrentUser, role, users, setUsers, logout, sessionRestoring, showIdleWarning, dismissIdleWarning } = useSessionState()
  // Phase 8 — venue (memory unit) context: which venues this operator can reach
  // and which one is active. Selected venue is sent as X-HESTIA-Venue on every call.
  const { venues, currentVenueId, switchVenue, createVenue } = useVenueState(currentUser)
  const t = TEXT.en

  const { area, page, collapsed, setCollapsed, navigate, goToArea, goToPage, pageContext, navigateAfterLogin } = useNavigationState({ currentUser })
  const {
    notifications,
    showNotifications,
    setShowNotifications,
    visibleNotifications,
    unreadCount,
    pushNotification,
    markNotificationsRead
  } = useNotificationState({ role, currentUser })

  const { reportArchive, setReportArchive, businessMemory, setBusinessMemory, addBusinessMemoryEvent } = useReportsState({ currentUser })

  const {
    activeShift,
    shiftStatus,
    lastHandover,
    carryForwardTasks,
    shiftError,
    openShift,
    saveBriefing,
    closeShift,
    saveHandover,
    addCarryForwardTask,
    resolveTask
  } = useShiftState({ currentUser })

  const {
    eventPlans, setEventPlans,
    actionItems, setActionItems,
    budgetRequests,
    serviceIncidents, setServiceIncidents,
    employeePerformance,
    employeeTasks,
    employeeRequests,
    ownerNotes,
    assignedTasks,
    saveEventPlan,
    approveEventEnquiry,
    submitServiceIncident,
    updateIncident,
    updateEmployeeTask,
    addAssignedTask,
    updateAssignedTask,
    submitBudgetRequest,
    respondBudgetRequest,
    submitEmployeeRequest,
    managerReviewEmployeeRequest,
    ownerReviewEmployeeRequest,
    sendOwnerNote
  } = useOperationsState({ currentUser, pushNotification, addBusinessMemoryEvent, activeShift })

  const {
    cocktailDrafts,
    approvedCocktails,
    archivedCocktails,
    cocktailPractice,
    saveCocktailDraft,
    submitCocktailForApproval,
    approveCocktail,
    archiveCocktail,
    markCocktailPracticed
  } = useCocktailPipeline({ currentUser, pushNotification, addBusinessMemoryEvent })

  const { academyProgress, selectedAcademyId, selectedLessonId, openUniversityLesson, completeUniversityLesson } = useStaffAcademyState({ currentUser, goToPage })

  const { shiftNotes, setShiftNotes, shiftBrain } = useShiftBrainState({ actionItems, serviceIncidents, eventPlans, ownerNotes })

  const { pulseData, isLoadingPulse, trends, insight, isLoadingInsight, insightError, insightCooldownSeconds, requestInsight } = useOwnerPulseState({ currentUser })

  const eventState = useEventState({ currentUser, pushNotification })
  const cocktailIntelligenceState = useCocktailIntelligenceState({ currentUser }) // CI MODULE ADDITION
  const venueIntelligenceState = useVenueIntelligenceState({ currentUser })

  useBackendSync({ role, setReportArchive, setBusinessMemory, setActionItems, setUsers, setServiceIncidents })

  const { handleCreateUser, handleUpdateUser, handleDisableUser } = useUserManagement({
    currentUser, users, setUsers, setCurrentUser, logout, pushNotification
  })

  async function login({ username, password }) {
    const { token, user: apiUser } = await loginWithCredentials(username, password)
    setAuthToken(token)
    saveToken(token)  // MVP: persist token so refresh restores the session
    const sessionUser = {
      id: apiUser.id,
      username: apiUser.full_name,
      full_name: apiUser.full_name,
      role: apiUser.role,
      sub_role: apiUser.sub_role || null,
      canManageCocktails: ['admin', 'bar_manager'].includes(apiUser.role)
    }
    setCurrentUser(sessionUser)
    navigateAfterLogin(sessionUser)
  }

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
      apiPost('/api/actions', urgentAction)
        .then(() => dequeue('action', urgentAction.id))
        .catch(err => {
          enqueue('action', { ...urgentAction, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          console.warn('HESTIA: /api/actions write failed — queued for retry', err?.message)
        })
    }

    return archived
  }, [currentUser?.username, pushNotification])

  // Briefly show a neutral loading screen while a stored token is being validated.
  // Prevents the login screen from flashing before session restore completes.
  if (sessionRestoring) {
    return (
      <div className="min-h-screen bg-[#0d0c09] flex items-center justify-center">
        <span className="text-[#c9a96e] text-xs tracking-[0.25em] uppercase opacity-60">
          Restoring session…
        </span>
      </div>
    )
  }

  if (!currentUser) {
    return <LoginScreen t={t} onLogin={login} />
  }

  // Wine Atlas: full-screen takeover — no HESTIA shell when active
  if (page === 'wineKnowledge') {
    const exitAtlas = () => goToPage('courses')
    return (
      <>
        <IdleWarningBanner show={showIdleWarning} onDismiss={dismissIdleWarning} />
        <WineAtlas onExit={exitAtlas} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0c09] text-[#f5f5f0]">
      <IdleWarningBanner show={showIdleWarning} onDismiss={dismissIdleWarning} />
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
        venues={venues}
        currentVenueId={currentVenueId}
        onSwitchVenue={switchVenue}
        onCreateVenue={createVenue}
      />

      <div className="min-h-[calc(100vh-5rem)] flex">
        {role === 'employee' ? (
          <EmployeeNavRail page={page} goToPage={goToPage} currentUser={currentUser} />
        ) : (
          <>
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
            {!collapsed && (
              <button
                type="button"
                className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                onClick={() => setCollapsed(true)}
                aria-label={t.ui.collapsePanel}
              />
            )}
          </>
        )}

        <main className={cx('min-w-0 flex-1', role === 'employee' ? 'px-3 py-4 sm:px-5 lg:px-6' : 'p-5 sm:p-7 lg:p-10 xl:p-14 2xl:p-20')}>
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
            page={page}
            goToPage={goToPage}
            pageContext={pageContext}
            session={{
              currentUser,
              lang,
              role,
              users,
              onCreateUser: handleCreateUser,
              onUpdateUser: handleUpdateUser,
              onDisableUser: handleDisableUser
            }}
            reports={{
              reportArchive,
              businessMemory,
              onReportArchived: archiveEndOfDayReport,
              onMemoryEvent: addBusinessMemoryEvent,
              pulseData,
              isLoadingPulse,
              trends,
              insight,
              isLoadingInsight,
              insightError,
              insightCooldownSeconds,
              onRequestInsight: requestInsight
            }}
            operations={{
              eventPlans,
              actionItems,
              setActionItems,
              budgetRequests,
              serviceIncidents,
              employeePerformance,
              employeeTasks,
              employeeRequests,
              ownerNotes,
              supplyRisks: [],
              activeShift,
              shiftStatus,
              lastHandover,
              carryForwardTasks,
              shiftError,
              onEventPlanSaved: saveEventPlan,
              onApproveEventEnquiry: approveEventEnquiry,
              onBudgetRequest: submitBudgetRequest,
              onBudgetResponse: respondBudgetRequest,
              onServiceIncident: submitServiceIncident,
              onUpdateIncident: updateIncident,
              onUpdateEmployeeTask: updateEmployeeTask,
              assignedTasks,
              onAddAssignedTask: addAssignedTask,
              onUpdateAssignedTask: updateAssignedTask,
              onSubmitEmployeeRequest: submitEmployeeRequest,
              onManagerReviewEmployeeRequest: managerReviewEmployeeRequest,
              onOwnerReviewEmployeeRequest: ownerReviewEmployeeRequest,
              onOwnerNote: sendOwnerNote,
              onOpenShift: openShift,
              onSaveBriefing: saveBriefing,
              onCloseShift: closeShift,
              onSaveHandover: saveHandover,
              onAddCarryForwardTask: addCarryForwardTask,
              onResolveTask: resolveTask
            }}
            cocktails={{
              cocktailDrafts,
              approvedCocktails,
              archivedCocktails,
              cocktailPractice,
              onSaveCocktailDraft: saveCocktailDraft,
              onSubmitCocktailApproval: submitCocktailForApproval,
              onApproveCocktail: approveCocktail,
              onRejectCocktailDraft: archiveCocktail,
              onMarkCocktailPracticed: markCocktailPracticed
            }}
            academy={{
              academyProgress,
              selectedAcademyId,
              selectedLessonId,
              onOpenUniversityLesson: openUniversityLesson,
              onCompleteUniversityLesson: completeUniversityLesson
            }}
            notifications={{
              visibleNotifications,
              shiftNotes,
              setShiftNotes,
              shiftBrain
            }}
            events={eventState}
            cocktailIntelligence={cocktailIntelligenceState} // CI MODULE ADDITION
            venueIntelligence={venueIntelligenceState}
          />
        </main>
      </div>
    </div>
  )
}

// Shown when the user has been inactive for 25 minutes (5 minutes before auto-logout).
// Dismissing it resets the idle timer because the click fires a 'mousedown' event.
function IdleWarningBanner({ show, onDismiss }) {
  if (!show) return null
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-4 bg-[#1a160e] border-b border-[#c9a96e]/30 px-4 py-2.5 text-sm">
      <span className="text-[#f5f5f0]/80">
        You have been inactive for 25 minutes.{' '}
        <span className="text-[#c9a96e]">You will be logged out in 5 minutes.</span>
      </span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded border border-[#c9a96e]/40 px-3 py-1 text-[#c9a96e] text-xs tracking-wide hover:bg-[#c9a96e]/10 transition-colors"
      >
        Stay logged in
      </button>
    </div>
  )
}

