import { STORAGE } from '../config/systemConfig'
import { readStoredArray, writeStoredValue } from '../lib/storage'
import { fetchShiftReports, submitShiftReport } from './api/reportsApi'

export function loadShiftReports() {
  return readStoredArray(STORAGE.reportArchive, [])
}

export async function syncReportsFromBackend() {
  try {
    const reports = await fetchShiftReports()
    if (reports.length) writeStoredValue(STORAGE.reportArchive, reports)
    return reports
  } catch {
    return loadShiftReports()
  }
}

export function saveShiftReport(report) {
  const reports = loadShiftReports()
  const nextReport = {
    id: report.id || `shift-report-${Date.now()}`,
    ...report,
    created_at: report.created_at || new Date().toISOString()
  }
  const nextReports = [nextReport, ...reports.filter(item => item.id !== nextReport.id)].slice(0, 120)
  writeStoredValue(STORAGE.reportArchive, nextReports)

  // fire-and-forget — localStorage is the source of truth for UI
  submitShiftReport(nextReport).catch(() => {})

  return { report: nextReport, reports: nextReports }
}

export function deriveActionsFromShiftReport(report) {
  const urgent = [report.urgent_items, report.operational_blockers, report.guest_complaints].filter(Boolean).join(' ')
  if (!urgent.trim()) return []
  return [{
    id: `action-from-report-${Date.now()}`,
    title: report.urgent_items || report.operational_blockers || 'Review shift report follow-up',
    description: urgent,
    sourceSignal: 'Daily Shift Report',
    assignedPerson: report.manager_name || report.managerOnDuty || 'Manager',
    department: 'Operations',
    dueDate: new Date().toISOString().slice(0, 10),
    priority: 'High',
    status: 'New',
    comments: [],
    done: false
  }]
}
