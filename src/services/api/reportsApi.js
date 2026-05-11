import { apiGet, apiPost } from './client'

export async function fetchShiftReports() {
  const data = await apiGet('/api/shift-reports')
  return data.reports || []
}

export async function submitShiftReport(report) {
  const data = await apiPost('/api/shift-reports', report)
  return data.report
}
