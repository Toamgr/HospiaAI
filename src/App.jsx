import React, { useCallback } from 'react'
import PreShiftBriefing from './features/shift-brain/PreShiftBriefing'
import OperationalNotesFeature from './features/shift-brain/OperationalNotes'
import CocktailLabStudio from './features/bar/CocktailLabStudio'
import FoodCostTables from './features/bar/FoodCostTables'
import CocktailLibrary from './features/bar/CocktailLibrary'
import InventoryOverview from './features/bar/InventoryOverview'
import BarReports from './features/bar/BarReports'
import ApprovedCocktailsTraining from './features/bar/ApprovedCocktailsTraining'
import BottlePrices from './features/bar/BottlePrices'
import ActionBoard from './features/operations/ActionBoard'
import ManagerActionCenter from './features/operations/ManagerActionCenter'
import EventOrchestrator from './features/operations/EventOrchestrator'
import EventBrain from './features/events/EventBrain'
import EventCRM from './features/events/EventCRM'
import EndOfDayReports from './features/operations/EndOfDayReports'
import EndOfShiftReview from './features/operations/EndOfShiftReview'
import BudgetRequestPage from './features/operations/BudgetRequestPage'
import Courses from './features/academy/Courses'
import LessonPlayer from './features/academy/LessonPlayer'
import Simulation from './features/academy/Simulation'
import SOPSheets from './features/academy/SOPSheets'
import CommandCenter from './features/owner/CommandCenter'
import BudgetApprovals from './features/owner/BudgetApprovals'
import OwnerOperationalRequests from './features/owner/OwnerOperationalRequests'
import WeeklySummary from './features/owner/WeeklySummary'
import ExecutiveOverview from './features/owner/ExecutiveOverview'
import OperationalPulse from './features/owner/OperationalPulse'
import BusinessMRI from './features/owner/BusinessMRI'
import ProfitLeaks from './features/owner/ProfitLeaks'
import OwnerReport from './features/owner/OwnerReport'
import BusinessMemoryPage from './features/owner/BusinessMemoryPage'
import StrategicRecommendations from './features/owner/StrategicRecommendations'
import EmployeeNavRail from './features/employee/EmployeeNavRail'
import EmployeeHome from './features/employee/EmployeeHome'
import DailyWork from './features/employee/DailyWork'
import BarWorld from './features/employee/BarWorld'
import EmployeeCocktailMenu from './features/employee/EmployeeCocktailMenu'
import EmployeeRequests from './features/employee/EmployeeRequests'
import ManagerEmployeeRequests from './features/employee/ManagerEmployeeRequests'
import EmployeeAchievements from './features/employee/EmployeeAchievements'
import ServiceRecovery from './features/employee/ServiceRecovery'
import StaffProgression from './features/staff/StaffProgression'
import StaffReadiness from './features/staff/StaffReadiness'
import StaffTab from './features/staff/StaffTab'
import ChefDashboard from './features/chef/ChefDashboard'
import FoodMenuView from './features/chef/FoodMenuView'
import ConstraintsForm from './features/shifts/ConstraintsForm'
import ShiftOrganizer from './features/shifts/ShiftOrganizer'
import MyShifts from './features/shifts/MyShifts'
import WineKnowledge from './features/academy/WineKnowledge'
import KnowledgeLibrary from './features/academy/KnowledgeLibrary'
import UserManagement from './features/system/UserManagement'
import Settings from './features/system/Settings'
import SettingsPage from './features/settings/SettingsPage'
import MissingPage from './features/system/MissingPage'
import LoginScreen from './features/auth/LoginScreen'
import TopNav from './features/shell/TopNav'
import SidePanel from './features/shell/SidePanel'
import NotificationPanel from './features/shell/NotificationPanel'
import { cx } from './utils/format'
import { isEnabled } from './config/featureFlags'
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
import { CocktailIntelligenceDashboard } from './features/cocktail-intelligence/CocktailIntelligenceDashboard' // CI MODULE ADDITION
import CocktailsTab from './features/magazine/CocktailsTab' // COCKTAILS TAB
import WineAtlas from './features/wine-atlas/WineAtlas'


export default function App() {
  const { lang, setLang, currentUser, setCurrentUser, role, users, setUsers, logout, sessionRestoring, showIdleWarning, dismissIdleWarning } = useSessionState()
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
          />
        </main>
      </div>
    </div>
  )
}

function PageRenderer({ t, page, goToPage, pageContext, session, reports, operations, cocktails, academy, notifications, events, cocktailIntelligence }) { // CI MODULE ADDITION: added cocktailIntelligence
  const { currentUser, lang, role, users, onCreateUser, onUpdateUser, onDisableUser } = session
  const { reportArchive, businessMemory, onReportArchived, onMemoryEvent,
    pulseData, isLoadingPulse, trends, insight, isLoadingInsight, insightError, insightCooldownSeconds, onRequestInsight } = reports
  const {
    eventPlans, actionItems, setActionItems, budgetRequests, serviceIncidents,
    employeePerformance, employeeTasks, employeeRequests, ownerNotes, supplyRisks,
    activeShift, shiftStatus, lastHandover, carryForwardTasks, shiftError,
    onEventPlanSaved, onApproveEventEnquiry, onBudgetRequest, onBudgetResponse,
    onServiceIncident, onUpdateIncident, onUpdateEmployeeTask, onSubmitEmployeeRequest,
    onManagerReviewEmployeeRequest, onOwnerReviewEmployeeRequest, onOwnerNote,
    assignedTasks, onAddAssignedTask, onUpdateAssignedTask,
    onOpenShift, onSaveBriefing, onCloseShift, onSaveHandover,
    onAddCarryForwardTask, onResolveTask
  } = operations
  const {
    cocktailDrafts, approvedCocktails, archivedCocktails, cocktailPractice,
    onSaveCocktailDraft, onSubmitCocktailApproval, onApproveCocktail,
    onRejectCocktailDraft, onMarkCocktailPracticed
  } = cocktails
  const { academyProgress, selectedAcademyId, selectedLessonId, onOpenUniversityLesson, onCompleteUniversityLesson } = academy
  const { visibleNotifications, shiftNotes, setShiftNotes, shiftBrain } = notifications

  const pages = {
    ...(isEnabled('ownerCommandCenter') && { commandCenter: <CommandCenter t={t} currentUser={currentUser} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} businessMemory={businessMemory} budgetRequests={budgetRequests} employeeRequests={employeeRequests} serviceIncidents={serviceIncidents} actionItems={actionItems} notifications={visibleNotifications} onApproveEventEnquiry={onApproveEventEnquiry} shiftBrain={shiftBrain} /> }),
    preShiftBriefing: <PreShiftBriefing t={t} currentUser={currentUser} actionItems={actionItems} serviceIncidents={serviceIncidents} eventPlans={eventPlans} notes={shiftNotes} reportArchive={reportArchive} shiftBrain={shiftBrain} activeShift={activeShift} onOpenShift={onOpenShift} onSaveBriefing={onSaveBriefing} carryForwardTasks={carryForwardTasks} lastHandover={lastHandover} onResolveTask={onResolveTask} />,
    actionBoard: <ActionBoard t={t} currentUser={currentUser} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} actionItems={actionItems} setActionItems={setActionItems} serviceIncidents={serviceIncidents} onUpdateIncident={onUpdateIncident} employeePerformance={employeePerformance} employeeTasks={employeeTasks} onUpdateEmployeeTask={onUpdateEmployeeTask} supplyRisks={supplyRisks} budgetRequests={budgetRequests} ownerNotes={ownerNotes} onOwnerNote={onOwnerNote} shiftNotes={shiftNotes} shiftBrain={shiftBrain} users={users} assignedTasks={assignedTasks} onAddAssignedTask={onAddAssignedTask} onUpdateAssignedTask={onUpdateAssignedTask} />,
    managerActionCenter: <ManagerActionCenter actionItems={actionItems} setActionItems={setActionItems} serviceIncidents={serviceIncidents} onUpdateIncident={onUpdateIncident} shiftNotes={shiftNotes} reportArchive={reportArchive} shiftBrain={shiftBrain} currentUser={currentUser} />,
    managerEmployeeRequests: <ManagerEmployeeRequests t={t} employeeRequests={employeeRequests} onReview={onManagerReviewEmployeeRequest} />,
    eventOrchestrator: <EventOrchestrator t={t} eventPlans={eventPlans} onEventPlanSaved={onEventPlanSaved} />,
    eventBrain: <EventBrain pageContext={pageContext} events={events.events} />,
    eventCRM: <EventCRM currentUser={currentUser} goToPage={goToPage} {...events} />,
    staffProgression: <StaffProgression t={t} users={users} academyProgress={academyProgress} serviceIncidents={serviceIncidents} employeePerformance={employeePerformance} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} />,
    staffReadiness: <StaffReadiness t={t} goToPage={goToPage} />,
    employeeHome: <EmployeeHome t={t} currentUser={currentUser} goToPage={goToPage} academyProgress={academyProgress} employeeTasks={employeeTasks} employeeRequests={employeeRequests} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} assignedTasks={assignedTasks} onUpdateAssignedTask={onUpdateAssignedTask} />,
    dailyWork: <DailyWork currentUser={currentUser} goToPage={goToPage} employeeRequests={employeeRequests} assignedTasks={assignedTasks} />,
    barWorld: <BarWorld goToPage={goToPage} />,
    employeeCocktailMenu: <EmployeeCocktailMenu />,
    employeeRequests: <EmployeeRequests t={t} currentUser={currentUser} employeeRequests={employeeRequests} onSubmit={onSubmitEmployeeRequest} />,
    employeeAchievements: <EmployeeAchievements currentUser={currentUser} academyProgress={academyProgress} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} employeeTasks={employeeTasks} />,
    serviceRecovery: <ServiceRecovery t={t} currentUser={currentUser} goToPage={goToPage} onServiceIncident={onServiceIncident} employeeTasks={employeeTasks} onUpdateEmployeeTask={onUpdateEmployeeTask} />,
    endOfShiftReview: <EndOfShiftReview actionItems={actionItems} serviceIncidents={serviceIncidents} shiftNotes={shiftNotes} reportArchive={reportArchive} currentUser={currentUser} onArchiveReport={onReportArchived} />,
    endOfDay: <EndOfDayReports t={t} currentUser={currentUser} reportArchive={reportArchive} onReportArchived={onReportArchived} actionItems={actionItems} serviceIncidents={serviceIncidents} shiftNotes={shiftNotes} activeShift={activeShift} onCloseShift={onCloseShift} onSaveHandover={onSaveHandover} />,
    budgetRequest: <BudgetRequestPage t={t} onSubmit={onBudgetRequest} budgetRequests={budgetRequests} currentUser={currentUser} />,
    operationalNotes: <OperationalNotesFeature t={t} currentUser={currentUser} onNotesChange={setShiftNotes} shiftBrain={shiftBrain} />,
    simulation: <Simulation t={t} goToPage={goToPage} />,
    courses: <Courses t={t} lang={lang} currentUser={currentUser} academyProgress={academyProgress} onOpenLesson={onOpenUniversityLesson} />,
    lessonPlayer: <LessonPlayer t={t} lang={lang} currentUser={currentUser} goToPage={goToPage} academyProgress={academyProgress} selectedAcademyId={selectedAcademyId} selectedLessonId={selectedLessonId} onOpenLesson={onOpenUniversityLesson} onCompleteLesson={onCompleteUniversityLesson} />,
    sopSheets: <SOPSheets t={t} goToPage={goToPage} />,
    knowledgeLibrary: <KnowledgeLibrary t={t} lang={lang} goToPage={goToPage} />,
    wineKnowledge: <WineKnowledge />,
    cocktailLab: <CocktailLabStudio cocktailDrafts={cocktailDrafts} approvedCocktails={approvedCocktails} archivedCocktails={archivedCocktails} onSaveDraft={onSaveCocktailDraft} onSubmitApproval={onSubmitCocktailApproval} onApprove={onApproveCocktail} onReject={onRejectCocktailDraft} eventContext={pageContext} goToPage={goToPage} />,
    foodCostTables: <FoodCostTables cocktailDrafts={cocktailDrafts} approvedCocktails={approvedCocktails} />,
    approvedCocktailsBar: <ApprovedCocktailsTraining t={t} currentUser={currentUser} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} onMarkPracticed={onMarkCocktailPracticed} />,
    cocktailLibrary: <CocktailLibrary cocktailDrafts={cocktailDrafts} approvedCocktails={approvedCocktails} archivedCocktails={archivedCocktails} />,
    inventoryOverview: <InventoryOverview approvedCocktails={approvedCocktails} cocktailDrafts={cocktailDrafts} />,
    barReports: <BarReports approvedCocktails={approvedCocktails} cocktailDrafts={cocktailDrafts} archivedCocktails={archivedCocktails} />,
    bottlePrices: <BottlePrices currentUser={currentUser} />,
    approvedCocktails: <ApprovedCocktailsTraining t={t} currentUser={currentUser} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} onMarkPracticed={onMarkCocktailPracticed} />,
    ...(isEnabled('ownerExecutiveOverview') && { executiveOverview: <ExecutiveOverview t={t} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} /> }),
    operationalPulse: <OperationalPulse actionItems={actionItems} serviceIncidents={serviceIncidents} shiftNotes={shiftNotes} reportArchive={reportArchive} pulseData={pulseData} isLoadingPulse={isLoadingPulse} trends={trends} insight={insight} isLoadingInsight={isLoadingInsight} insightError={insightError} insightCooldownSeconds={insightCooldownSeconds} onRequestInsight={onRequestInsight} />,
    ...(isEnabled('ownerBudgetApprovals') && { budgetApprovals: <BudgetApprovals t={t} budgetRequests={budgetRequests} onRespond={onBudgetResponse} /> }),
    ...(isEnabled('ownerOperationalRequests') && { ownerOperationalRequests: <OwnerOperationalRequests t={t} employeeRequests={employeeRequests} onReview={onOwnerReviewEmployeeRequest} /> }),
    ...(isEnabled('ownerWeeklySummary') && { weeklySummary: <WeeklySummary t={t} currentUser={currentUser} reportArchive={reportArchive} serviceIncidents={serviceIncidents} budgetRequests={budgetRequests} eventPlans={eventPlans} actionItems={actionItems} shiftBrain={shiftBrain} /> }),
    ...(isEnabled('ownerBusinessMRI') && { businessMRI: <BusinessMRI t={t} /> }),
    ...(isEnabled('ownerProfitLeaks') && { profitLeaks: <ProfitLeaks t={t} goToPage={goToPage} /> }),
    ...(isEnabled('ownerReport') && { ownerReport: <OwnerReport t={t} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} /> }),
    ...(isEnabled('ownerBusinessMemory') && { businessMemory: <BusinessMemoryPage t={t} reportArchive={reportArchive} businessMemory={businessMemory} /> }),
    ...(isEnabled('ownerStrategicRecommendations') && { strategicRecommendations: <StrategicRecommendations t={t} /> }),
    userManagement: <UserManagement currentUser={currentUser} users={users} onCreateUser={onCreateUser} onUpdateUser={onUpdateUser} onDisableUser={onDisableUser} />,
    settings: <SettingsPage />,
    ciDashboard: <CocktailIntelligenceDashboard cocktailIntelligence={cocktailIntelligence} />, // CI MODULE ADDITION
    cocktailsMagazine: <CocktailsTab approvedCocktails={approvedCocktails} goToPage={goToPage} role={role} />, // COCKTAILS TAB
    chefDashboard: <ChefDashboard currentUser={currentUser} />,
    staffTab: <StaffTab />,
    shiftOrganizerPage: <ShiftOrganizer currentUser={currentUser} />,
    myShifts: <MyShifts />,
    constraintsForm: <ConstraintsForm />,
    foodMenuView: <FoodMenuView />,
  }

  return pages[page] || <MissingPage t={t} page={page} />
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

