import React, { useMemo } from 'react'
import { UNIVERSITY_MANIFEST } from '../../data/academy/universityManifest'
import { countUniversityLessons, countCompletedLessons } from '../../utils/academy'
import { STAFF } from '../../data/staff'
import { Header, Card, Metric } from '../../components/AppPrimitives'

export default function StaffProgression({ t, users = [], academyProgress = {}, serviceIncidents = [], employeePerformance = {}, approvedCocktails = [], cocktailPractice = {} }) {
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
