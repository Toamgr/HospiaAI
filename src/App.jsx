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
import EndOfDayReports from './features/operations/EndOfDayReports'
import EndOfShiftReview from './features/operations/EndOfShiftReview'
import BudgetRequestPage from './features/operations/BudgetRequestPage'
import Courses from './features/academy/Courses'
import LessonPlayer from './features/academy/LessonPlayer'
import Simulation from './features/academy/Simulation'
import SOPSheets from './features/academy/SOPSheets'
import LearningProgress from './features/academy/LearningProgress'
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
import EmployeeHome from './features/employee/EmployeeHome'
import EmployeeRequests from './features/employee/EmployeeRequests'
import ManagerEmployeeRequests from './features/employee/ManagerEmployeeRequests'
import EmployeeAchievements from './features/employee/EmployeeAchievements'
import ServiceRecovery from './features/employee/ServiceRecovery'
import StaffProgression from './features/staff/StaffProgression'
import StaffReadiness from './features/staff/StaffReadiness'
import WineKnowledge from './features/academy/WineKnowledge'
import KnowledgeLibrary from './features/academy/KnowledgeLibrary'
import UserManagement from './features/system/UserManagement'
import Settings from './features/system/Settings'
import MissingPage from './features/system/MissingPage'
import LoginScreen from './features/auth/LoginScreen'
import TopNav from './features/shell/TopNav'
import SidePanel from './features/shell/SidePanel'
import NotificationPanel from './features/shell/NotificationPanel'
import { cx } from './utils/format'
import { buildSessionUser, persistSession } from './services/authService'
import { useUserManagement } from './hooks/useUserManagement'
import { TEXT } from './config/textConfig'
import { firstAllowedArea, firstAllowedPage } from './config/roleConfig'
import { INITIAL_SHIFT_PROFILE, INITIAL_SUPPLY_RISKS } from './data/operations'
import { useNotificationState } from './hooks/useNotificationState'
import { useSessionState } from './hooks/useSessionState'
import { useNavigationState } from './hooks/useNavigationState'
import { useReportsState } from './hooks/useReportsState'
import { useCocktailPipeline } from './hooks/useCocktailPipeline'
import { useStaffAcademyState } from './hooks/useStaffAcademyState'
import { useOperationsState } from './hooks/useOperationsState'
import { useShiftBrainState } from './hooks/useShiftBrainState'
import { useBackendSync } from './hooks/useBackendSync'


export default function App() {
  const { lang, setLang, currentUser, setCurrentUser, role, users, setUsers, logout } = useSessionState()
  const t = TEXT.en

  const { area, page, collapsed, setCollapsed, navigate, goToArea, goToPage } = useNavigationState({ currentUser })
  const {
    notifications,
    showNotifications,
    setShowNotifications,
    visibleNotifications,
    unreadCount,
    pushNotification,
    markNotificationsRead
  } = useNotificationState({ role, currentUser })

  const { reportArchive, setReportArchive, businessMemory, setBusinessMemory, addBusinessMemoryEvent } = useReportsState()

  const {
    eventPlans, setEventPlans,
    actionItems, setActionItems,
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
  } = useOperationsState({ currentUser, pushNotification, addBusinessMemoryEvent })

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

  useBackendSync({ role, setReportArchive, setBusinessMemory, setEventPlans, setActionItems, setUsers })

  const { handleCreateUser, handleUpdateUser, handleDisableUser } = useUserManagement({
    currentUser, users, setUsers, setCurrentUser, logout, pushNotification
  })

  async function login({ username, password }) {
    const user = buildSessionUser(users, username, password)
    const nextArea = firstAllowedArea(user)
    const nextPage = firstAllowedPage(user, nextArea)
    setCurrentUser(user)
    navigate(nextArea, nextPage)
    persistSession(user)
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
    }

    return archived
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

        <main className={cx('min-w-0 flex-1', role === 'employee' ? 'px-3 py-4 sm:px-5 lg:px-7 xl:px-8' : 'p-5 sm:p-7 lg:p-10 xl:p-14 2xl:p-20')}>
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
              onMemoryEvent: addBusinessMemoryEvent
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
              supplyRisks: INITIAL_SUPPLY_RISKS,
              shiftProfile: INITIAL_SHIFT_PROFILE,
              onEventPlanSaved: saveEventPlan,
              onApproveEventEnquiry: approveEventEnquiry,
              onBudgetRequest: submitBudgetRequest,
              onBudgetResponse: respondBudgetRequest,
              onServiceIncident: submitServiceIncident,
              onUpdateIncident: updateIncident,
              onUpdateEmployeeTask: updateEmployeeTask,
              onSubmitEmployeeRequest: submitEmployeeRequest,
              onManagerReviewEmployeeRequest: managerReviewEmployeeRequest,
              onOwnerReviewEmployeeRequest: ownerReviewEmployeeRequest,
              onOwnerNote: sendOwnerNote
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
          />
        </main>
      </div>
    </div>
  )
}

function PageRenderer({ t, page, goToPage, session, reports, operations, cocktails, academy, notifications }) {
  const { currentUser, lang, role, users, onCreateUser, onUpdateUser, onDisableUser } = session
  const { reportArchive, businessMemory, onReportArchived, onMemoryEvent } = reports
  const {
    eventPlans, actionItems, setActionItems, budgetRequests, serviceIncidents,
    employeePerformance, employeeTasks, employeeRequests, ownerNotes, supplyRisks, shiftProfile,
    onEventPlanSaved, onApproveEventEnquiry, onBudgetRequest, onBudgetResponse,
    onServiceIncident, onUpdateIncident, onUpdateEmployeeTask, onSubmitEmployeeRequest,
    onManagerReviewEmployeeRequest, onOwnerReviewEmployeeRequest, onOwnerNote
  } = operations
  const {
    cocktailDrafts, approvedCocktails, archivedCocktails, cocktailPractice,
    onSaveCocktailDraft, onSubmitCocktailApproval, onApproveCocktail,
    onRejectCocktailDraft, onMarkCocktailPracticed
  } = cocktails
  const { academyProgress, selectedAcademyId, selectedLessonId, onOpenUniversityLesson, onCompleteUniversityLesson } = academy
  const { visibleNotifications, shiftNotes, setShiftNotes, shiftBrain } = notifications

  const pages = {
    commandCenter: <CommandCenter t={t} currentUser={currentUser} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} businessMemory={businessMemory} budgetRequests={budgetRequests} employeeRequests={employeeRequests} serviceIncidents={serviceIncidents} actionItems={actionItems} notifications={visibleNotifications} onApproveEventEnquiry={onApproveEventEnquiry} shiftBrain={shiftBrain} />,
    preShiftBriefing: <PreShiftBriefing t={t} currentUser={currentUser} actionItems={actionItems} serviceIncidents={serviceIncidents} eventPlans={eventPlans} notes={shiftNotes} reportArchive={reportArchive} shiftBrain={shiftBrain} />,
    actionBoard: <ActionBoard t={t} currentUser={currentUser} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} actionItems={actionItems} setActionItems={setActionItems} serviceIncidents={serviceIncidents} onUpdateIncident={onUpdateIncident} employeePerformance={employeePerformance} employeeTasks={employeeTasks} onUpdateEmployeeTask={onUpdateEmployeeTask} supplyRisks={supplyRisks} shiftProfile={shiftProfile} budgetRequests={budgetRequests} ownerNotes={ownerNotes} onOwnerNote={onOwnerNote} />,
    managerActionCenter: <ManagerActionCenter actionItems={actionItems} setActionItems={setActionItems} serviceIncidents={serviceIncidents} onUpdateIncident={onUpdateIncident} shiftNotes={shiftNotes} reportArchive={reportArchive} shiftBrain={shiftBrain} currentUser={currentUser} />,
    managerEmployeeRequests: <ManagerEmployeeRequests t={t} employeeRequests={employeeRequests} onReview={onManagerReviewEmployeeRequest} />,
    eventOrchestrator: <EventOrchestrator t={t} eventPlans={eventPlans} onEventPlanSaved={onEventPlanSaved} />,
    staffProgression: <StaffProgression t={t} users={users} academyProgress={academyProgress} serviceIncidents={serviceIncidents} employeePerformance={employeePerformance} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} />,
    staffReadiness: <StaffReadiness t={t} goToPage={goToPage} />,
    employeeHome: <EmployeeHome t={t} currentUser={currentUser} goToPage={goToPage} academyProgress={academyProgress} employeeTasks={employeeTasks} employeeRequests={employeeRequests} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} />,
    employeeRequests: <EmployeeRequests t={t} currentUser={currentUser} employeeRequests={employeeRequests} onSubmit={onSubmitEmployeeRequest} />,
    employeeAchievements: <EmployeeAchievements currentUser={currentUser} academyProgress={academyProgress} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} employeeTasks={employeeTasks} />,
    serviceRecovery: <ServiceRecovery t={t} currentUser={currentUser} goToPage={goToPage} onServiceIncident={onServiceIncident} employeeTasks={employeeTasks} onUpdateEmployeeTask={onUpdateEmployeeTask} />,
    endOfShiftReview: <EndOfShiftReview actionItems={actionItems} serviceIncidents={serviceIncidents} shiftNotes={shiftNotes} reportArchive={reportArchive} currentUser={currentUser} onArchiveReport={onReportArchived} />,
    endOfDay: <EndOfDayReports t={t} reportArchive={reportArchive} onReportArchived={onReportArchived} />,
    budgetRequest: <BudgetRequestPage t={t} onSubmit={onBudgetRequest} budgetRequests={budgetRequests} currentUser={currentUser} />,
    operationalNotes: <OperationalNotesFeature t={t} currentUser={currentUser} onNotesChange={setShiftNotes} shiftBrain={shiftBrain} />,
    simulation: <Simulation t={t} goToPage={goToPage} />,
    courses: <Courses t={t} lang={lang} currentUser={currentUser} academyProgress={academyProgress} onOpenLesson={onOpenUniversityLesson} />,
    lessonPlayer: <LessonPlayer t={t} lang={lang} currentUser={currentUser} goToPage={goToPage} academyProgress={academyProgress} selectedAcademyId={selectedAcademyId} selectedLessonId={selectedLessonId} onOpenLesson={onOpenUniversityLesson} onCompleteLesson={onCompleteUniversityLesson} />,
    sopSheets: <SOPSheets t={t} goToPage={goToPage} />,
    knowledgeLibrary: <KnowledgeLibrary t={t} lang={lang} goToPage={goToPage} />,
    wineKnowledge: <WineKnowledge />,
    cocktailLab: <CocktailLabStudio cocktailDrafts={cocktailDrafts} approvedCocktails={approvedCocktails} archivedCocktails={archivedCocktails} onSaveDraft={onSaveCocktailDraft} onSubmitApproval={onSubmitCocktailApproval} onApprove={onApproveCocktail} onReject={onRejectCocktailDraft} />,
    foodCostTables: <FoodCostTables cocktailDrafts={cocktailDrafts} approvedCocktails={approvedCocktails} />,
    approvedCocktailsBar: <ApprovedCocktailsTraining t={t} currentUser={currentUser} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} onMarkPracticed={onMarkCocktailPracticed} />,
    cocktailLibrary: <CocktailLibrary cocktailDrafts={cocktailDrafts} approvedCocktails={approvedCocktails} archivedCocktails={archivedCocktails} />,
    inventoryOverview: <InventoryOverview approvedCocktails={approvedCocktails} cocktailDrafts={cocktailDrafts} />,
    barReports: <BarReports approvedCocktails={approvedCocktails} cocktailDrafts={cocktailDrafts} archivedCocktails={archivedCocktails} />,
    bottlePrices: <BottlePrices currentUser={currentUser} />,
    approvedCocktails: <ApprovedCocktailsTraining t={t} currentUser={currentUser} approvedCocktails={approvedCocktails} cocktailPractice={cocktailPractice} onMarkPracticed={onMarkCocktailPracticed} />,
    learningProgress: <LearningProgress t={t} currentUser={currentUser} academyProgress={academyProgress} />,
    executiveOverview: <ExecutiveOverview t={t} goToPage={goToPage} reportArchive={reportArchive} eventPlans={eventPlans} />,
    operationalPulse: <OperationalPulse actionItems={actionItems} serviceIncidents={serviceIncidents} shiftNotes={shiftNotes} reportArchive={reportArchive} />,
    budgetApprovals: <BudgetApprovals t={t} budgetRequests={budgetRequests} onRespond={onBudgetResponse} />,
    ownerOperationalRequests: <OwnerOperationalRequests t={t} employeeRequests={employeeRequests} onReview={onOwnerReviewEmployeeRequest} />,
    weeklySummary: <WeeklySummary t={t} currentUser={currentUser} reportArchive={reportArchive} serviceIncidents={serviceIncidents} budgetRequests={budgetRequests} eventPlans={eventPlans} actionItems={actionItems} shiftBrain={shiftBrain} />,
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

