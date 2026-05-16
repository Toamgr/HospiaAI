import React, { useMemo } from 'react'
import { UNIVERSITY_MANIFEST } from '../../data/academy/universityManifest'
import { countUniversityLessons, countCompletedLessons } from '../../utils/academy'
import { Header, Card, Metric } from '../../components/AppPrimitives'

export default function StaffProgression({ t, users = [], academyProgress = {}, serviceIncidents = [], employeePerformance = {}, approvedCocktails = [], cocktailPractice = {} }) {
  const staffAcademies = UNIVERSITY_MANIFEST.filter(academy => academy.roles?.includes('employee'))
  const totalUniversityLessons = countUniversityLessons(staffAcademies)
  const approvedCocktailCount = approvedCocktails.length

  // Only real employee accounts — no seeded/demo data
  const realEmployees = useMemo(
    () => users.filter(u => u.role === 'employee' && u.disabled !== true),
    [users]
  )

  const exposureRows = useMemo(() => realEmployees.map(user => {
    const name = user.username
    const performance = employeePerformance[name] || { incidentCount: 0, unresolved: 0 }
    const practiceRecord = cocktailPractice[name] || {}
    const practicedCocktails = approvedCocktails.filter(c => practiceRecord[c.id]?.practiced).length
    const practicePercent = approvedCocktailCount
      ? Math.round((practicedCocktails / approvedCocktailCount) * 100)
      : 0
    const academyCompleted = countCompletedLessons(academyProgress[name] || {})
    const academyPercent = totalUniversityLessons
      ? Math.round((academyCompleted / totalUniversityLessons) * 100)
      : 0

    let coachingFlag = 'Active'
    if (performance.unresolved > 1) coachingFlag = 'Coaching recommended'
    else if (academyCompleted === 0 && totalUniversityLessons > 0) coachingFlag = 'No academy progress yet'
    else if (academyPercent < 30) coachingFlag = 'Low progress'

    return { name, academyCompleted, academyPercent, performance, practicedCocktails, practicePercent, coachingFlag }
  }), [academyProgress, approvedCocktailCount, approvedCocktails, cocktailPractice, employeePerformance, realEmployees, totalUniversityLessons])

  const avgProgress = exposureRows.length
    ? Math.round(exposureRows.reduce((s, r) => s + r.academyPercent, 0) / exposureRows.length)
    : 0
  const overallPracticePercent = exposureRows.length && approvedCocktailCount
    ? Math.round(exposureRows.reduce((s, r) => s + r.practicedCocktails, 0) / (exposureRows.length * approvedCocktailCount) * 100)
    : 0

  return (
    <>
      <Header
        eyebrow={t.pages.staffProgression}
        title="Staff Progression"
        body="Manager coaching intelligence: readiness, practice completion, service incident exposure, and professional development flags."
      />
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Metric label="Average Academy" value={`${avgProgress}%`} sub="Training progress" />
        <Metric label="Open Incidents" value={String(serviceIncidents.filter(i => !i.resolved).length)} sub="Coaching exposure" />
        <Metric label="Cocktail Practice" value={`${overallPracticePercent}%`} sub={`${approvedCocktailCount} approved cocktails`} />
      </div>

      {realEmployees.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/[0.05] mb-4">◎</div>
            <p className="text-sm font-bold text-[#e8dcc0]/55 mb-3">No staff coaching data yet.</p>
            <p className="mx-auto max-w-sm text-xs leading-6 text-[#e8dcc0]/30">
              HESTIA will surface coaching patterns once real employee accounts are created, academy progress is recorded, and incidents are logged.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] border-collapse">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-[#e8dcc0]">
                  <th className="border-b border-[#6b705c]/30 p-3">Employee</th>
                  <th className="border-b border-[#6b705c]/30 p-3">Academy</th>
                  <th className="border-b border-[#6b705c]/30 p-3">Practice Completion</th>
                  <th className="border-b border-[#6b705c]/30 p-3">Incident Exposure</th>
                  <th className="border-b border-[#6b705c]/30 p-3">Coaching Flag</th>
                </tr>
              </thead>
              <tbody>
                {exposureRows.map(row => (
                  <tr key={row.name} className="text-sm">
                    <td className="border-b border-[#6b705c]/30 p-3">
                      <div className="font-black text-[#f5f5f0]">{row.name}</div>
                      <div className="text-xs text-[#e8dcc0]/55">Employee</div>
                    </td>
                    <td className="border-b border-[#6b705c]/30 p-3">
                      {row.academyCompleted} / {totalUniversityLessons} lessons ({row.academyPercent}%)
                    </td>
                    <td className="border-b border-[#6b705c]/30 p-3">
                      {row.practicedCocktails} / {approvedCocktailCount} cocktails ({row.practicePercent}%)
                    </td>
                    <td className="border-b border-[#6b705c]/30 p-3">
                      {row.performance.incidentCount} reports / {row.performance.unresolved} unresolved
                    </td>
                    <td className="border-b border-[#6b705c]/30 p-3 text-xs text-[#e8dcc0]">
                      {row.coachingFlag}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}
