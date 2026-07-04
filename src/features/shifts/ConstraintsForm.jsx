import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '../../services/api/client'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_LABELS = { sunday: 'Sun', monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat' }
const OPTIONS = ['available', 'unavailable', 'partial']
const OPTION_STYLE = {
  available:   'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  unavailable: 'border-red-500/30 bg-red-500/10 text-red-400',
  partial:     'border-amber-500/30 bg-amber-500/10 text-amber-400',
}

function getNextMonday() {
  const today = new Date()
  const day = today.getDay()
  const diff = (8 - day) % 7 || 7
  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  return next.toISOString().slice(0, 10)
}

function isSubmissionOpen() {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  // Allow Sunday (0) through Thursday (4) before 23:00
  if (day === 5 || day === 6) return false
  if (day === 4 && hour >= 23) return false
  return true
}

export default function ConstraintsForm() {
  const weekStart = getNextMonday()
  const [constraints, setConstraints] = useState(() =>
    Object.fromEntries(DAYS.map(d => [d, 'available']))
  )
  const [existing, setExisting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  // Whether the signed-in user has a linked employee profile. When false, availability
  // cannot be saved (no employee_id), so we block submit and show a setup callout
  // instead of letting the user believe a submission succeeded.
  const [profileLinked, setProfileLinked] = useState(true)
  const open = isSubmissionOpen()
  const UNLINKED_MESSAGE = 'Employee profile is not linked to this user. Ask a manager to activate this employee profile.'

  useEffect(() => {
    apiGet(`/api/employee-shifts/constraints?week_start=${weekStart}`)
      .then(d => {
        if (d.profileLinked === false) setProfileLinked(false)
        const row = (d.constraints || [])[0]
        if (row) {
          setExisting(row)
          setConstraints(prev => ({ ...prev, ...row.constraints }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [weekStart])

  function setDay(day, val) {
    setConstraints(prev => ({ ...prev, [day]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!profileLinked) return
    setSubmitting(true)
    setError(null)
    try {
      await apiPost('/api/employee-shifts/constraints', { week_start: weekStart, constraints })
      setSubmitted(true)
    } catch (err) {
      // An unlinked employee profile is a setup problem, not a generic failure — flip to
      // the blocking callout and never show a misleading generic error.
      if (err.status === 400 && /not linked to this user/i.test(err.message || '')) {
        setProfileLinked(false)
        setError(null)
      } else {
        setError(err.message || 'Submission failed.')
      }
    } finally { setSubmitting(false) }
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#6b705c] animate-pulse">Loading…</div>
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto rounded-2xl border border-emerald-500/20 bg-emerald-950/10 px-8 py-14 text-center space-y-3">
        <div className="text-4xl font-black text-emerald-400">✓</div>
        <p className="text-base font-bold text-[#f5f5f0]">Availability submitted</p>
        <p className="text-sm text-[#6b705c]">Week of {weekStart}</p>
        <button onClick={() => setSubmitted(false)}
          className="mt-4 rounded-xl border border-[#c9a96e]/30 px-6 py-2 text-sm font-bold text-[#c9a96e] hover:bg-[#c9a96e]/10 transition">
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#f5f5f0]">My Availability</h1>
        <p className="text-sm text-[#6b705c] mt-1">Week of {weekStart}</p>
      </div>

      {!profileLinked && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-4 text-sm text-amber-300 space-y-1">
          <p className="font-bold">Availability can’t be submitted yet</p>
          <p className="text-amber-300/80">{UNLINKED_MESSAGE}</p>
        </div>
      )}

      {!open && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          Submission window closed. Open Sunday–Thursday before 23:00.
        </div>
      )}

      {existing && (
        <div className="rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-4 py-3 text-xs text-[#c9a96e]">
          Previously submitted — you can update below.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {DAYS.map(day => (
          <div key={day} className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 p-4">
            <p className="text-sm font-bold text-[#f5f5f0] mb-3">{DAY_LABELS[day]}</p>
            <div className="flex gap-2">
              {OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  disabled={!open || !profileLinked}
                  onClick={() => setDay(day, opt)}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold capitalize transition ${
                    constraints[day] === opt
                      ? OPTION_STYLE[opt]
                      : 'border-[#6b705c]/20 text-[#6b705c] hover:border-[#6b705c]/40'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        {error && <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">{error}</div>}

        <button type="submit" disabled={!open || submitting || !profileLinked}
          className="w-full rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/10 py-3 text-sm font-bold text-[#c9a96e] hover:bg-[#c9a96e]/20 transition disabled:opacity-40 disabled:cursor-not-allowed">
          {submitting ? 'Submitting…' : 'Submit Availability'}
        </button>
      </form>
    </div>
  )
}
