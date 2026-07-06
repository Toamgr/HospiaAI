// PageRenderer — page-key → feature-component map for the HESTIA shell.
//
// Phase 1 (nav re-skin): extracted verbatim from App.jsx as a pure move — no
// behavior change. App.jsx stays composition/orchestration only and renders
// <PageRenderer /> with the same grouped domain prop objects it built before.
// Adding new feature UI belongs here (or in src/features/), never in App.jsx.

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
import EventCalendar from './features/events/EventCalendar'
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
import OwnerAIHome from './features/owner-intelligence/OwnerAIHome'
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
import SettingsPage from './features/settings/SettingsPage'
import MissingPage from './features/system/MissingPage'
import { isEnabled } from './config/featureFlags'
import { CocktailIntelligenceDashboard } from './features/cocktail-intelligence/CocktailIntelligenceDashboard' // CI MODULE ADDITION
import VenueIntelligence from './features/venue-intelligence/VenueIntelligence'
import VenueBridgeInspector from './features/venue-intelligence/VenueBridgeInspector'
import CocktailsTab from './features/magazine/CocktailsTab' // COCKTAILS TAB
import OwnerBeverageBrief from './features/beverage/OwnerBeverageBrief' // Beverage Slice 1A
import BeverageBriefInbox from './features/beverage/BeverageBriefInbox' // Beverage Slice 1A

export default function PageRenderer({ t, page, goToPage, pageContext, session, reports, operations, cocktails, academy, notifications, events, cocktailIntelligence, venueIntelligence }) { // CI MODULE ADDITION: added cocktailIntelligence
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
    eventBrain: <EventBrain pageContext={pageContext} events={events.events} goToPage={goToPage} onSelectEvent={events.onSelectEvent} />,
    eventCRM: <EventCRM currentUser={currentUser} goToPage={goToPage} pageContext={pageContext} {...events} />,
    eventCalendar: <EventCalendar currentUser={currentUser} goToPage={goToPage} events={events.events} isLoading={events.isLoadingEvents} onSelectEvent={events.onSelectEvent} />,
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
    ownerHome: <OwnerAIHome currentUser={currentUser} venueIntelligence={venueIntelligence} />,
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
    venueLearning: <VenueIntelligence venueIntelligence={venueIntelligence} />,
    venueBridgeInspector: <VenueBridgeInspector />,
    cocktailsMagazine: <CocktailsTab approvedCocktails={approvedCocktails} goToPage={goToPage} role={role} />, // COCKTAILS TAB
    chefDashboard: <ChefDashboard currentUser={currentUser} />,
    staffTab: <StaffTab />,
    shiftOrganizerPage: <ShiftOrganizer currentUser={currentUser} />,
    myShifts: <MyShifts />,
    constraintsForm: <ConstraintsForm />,
    foodMenuView: <FoodMenuView />,
    beverageBrief: <OwnerBeverageBrief currentUser={currentUser} />, // Beverage Slice 1A
    beverageBriefInbox: <BeverageBriefInbox currentUser={currentUser} />, // Beverage Slice 1A
  }

  return pages[page] || <MissingPage t={t} page={page} />
}
