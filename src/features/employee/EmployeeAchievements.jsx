import { Card, Label, Header, Progress } from '../../components/AppPrimitives'
import { getVisibleAcademies, getUserLessonProgress, countUniversityLessons, countCompletedLessons, isLessonComplete } from '../../utils/academy'

const REWARD_TYPES = [
  { name: 'Free staff meal',       description: 'A complimentary meal during or after service.' },
  { name: 'Shift preference',      description: 'Priority in selecting your preferred shifts for the next schedule.' },
  { name: 'Training certificate',  description: 'Formal recognition of a completed training path or skill area.' },
  { name: 'Bar tasting session',   description: 'A guided tasting session with the bar team.' },
  { name: 'Dinner',                description: 'A full dinner service, as a guest of the house.' },
]

export default function EmployeeAchievements({ currentUser, academyProgress = {}, approvedCocktails = [], cocktailPractice = {}, employeeTasks = [] }) {
  const employeeName = currentUser?.username || 'Employee'
  const academies    = getVisibleAcademies(currentUser)
  const completedMap = getUserLessonProgress(academyProgress, currentUser)
  const totalLessons = countUniversityLessons(academies)
  const completedLessons = countCompletedLessons(completedMap)
  const completedPaths = academies.filter(a =>
    a.lessons?.length && a.lessons.every(l => isLessonComplete(completedMap, a.id, l.id))
  ).length
  const practiced = Object.values(cocktailPractice[employeeName] || {}).filter(i => i?.practiced).length

  // Real signals only — no derived readiness formula
  const signals = [
    totalLessons > 0 && {
      label: 'Training paths',
      value: completedPaths,
      total: academies.length,
      pct: academies.length ? Math.round((completedPaths / academies.length) * 100) : 0,
      detail: `${completedLessons} of ${totalLessons} lessons complete`,
    },
    approvedCocktails.length > 0 && {
      label: 'Cocktail practice',
      value: practiced,
      total: approvedCocktails.length,
      pct: Math.round((practiced / approvedCocktails.length) * 100),
      detail: `${practiced} of ${approvedCocktails.length} approved recipes`,
    },
  ].filter(Boolean)

  const hasProgressData = signals.length > 0

  return (
    <>
      <Header
        eyebrow="Milestones"
        title="Your progress"
        body="Track your training and practice. Rewards are assigned by your manager based on your progress."
      />

      {/* Progress signals */}
      <div className="space-y-3 mb-8">
        {!hasProgressData ? (
          <Card>
            <p className="text-sm leading-relaxed text-[#e8dcc0]/60">
              Milestones will appear here as you complete training, submit availability, and participate in service routines.
            </p>
          </Card>
        ) : (
          signals.map(s => (
            <Card key={s.label}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#e8dcc0]/60">{s.label}</span>
                <span className="text-sm font-black text-[#c9a96e]">
                  {s.value}<span className="text-[#6b705c] font-normal">/{s.total}</span>
                </span>
              </div>
              <Progress value={s.pct} label={s.label} />
              <p className="mt-2 text-[11px] text-[#6b705c]">{s.detail}</p>
            </Card>
          ))
        )}
      </div>

      {/* Reward catalog */}
      <Card className="border-[#c9a96e]/15">
        <Label>Available reward types</Label>
        <p className="mb-4 text-xs leading-relaxed text-[#e8dcc0]/55">
          The following rewards can be assigned by your manager. No reward is automatic — all require manager confirmation.
        </p>
        <div className="space-y-2">
          {REWARD_TYPES.map(r => (
            <div key={r.name} className="flex items-start gap-3 rounded-xl border border-[#6b705c]/12 bg-white/[0.016] px-4 py-3">
              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]/50" />
              <div>
                <p className="text-sm font-semibold text-[#f5f5f0]">{r.name}</p>
                <p className="text-xs text-[#e8dcc0]/50 mt-0.5">{r.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
