import { useState, useEffect } from 'react'
import { apiGet, apiPost } from '../../services/api/client'

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const DAY_LABELS = { sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday' }

function getNextMonday() {
  const today = new Date()
  const day = today.getDay()
  const diff = (8 - day) % 7 || 7
  const next = new Date(today)
  next.setDate(today.getDate() + diff)
  return next.toISOString().slice(0, 10)
}

function EmployeeChip({ slot }) {
  const color = slot.is_trainee
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
    : slot.sub_role === 'bartender'
    ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
    : 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]'
  return (
    <div className={`rounded-lg border px-2.5 py-1.5 ${color}`}>
      <p className="text-[11px] font-bold">{slot.display_name}</p>
      <p className="text-[9px] opacity-70">{slot.position || slot.sub_role}</p>
    </div>
  )
}

export default function ShiftOrganizer({ currentUser }) {
  const [weekStart, setWeekStart] = useState(getNextMonday())
  const [schedule, setSchedule] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)
  const [published, setPublished] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    apiGet('/api/employee-shifts/notifications')
      .then(d => setNotifications(d.notifications || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    apiGet(`/api/employee-shifts/schedule?week_start=${weekStart}`)
      .then(d => { if (d.schedule) setSchedule(d.schedule) })
      .catch(() => {})
  }, [weekStart])

  async function handleGenerate() {
    setGenerating(true)
    setError(null)
    setSchedule(null)
    try {
      const data = await apiPost('/api/employee-shifts/generate', { week_start: weekStart })
      setSchedule({ week_start: weekStart, ...data.schedule })
    } catch (err) {
      setError(err.message || 'Generation failed.')
    } finally { setGenerating(false) }
  }

  async function handlePublish() {
    if (!schedule) return
    setPublishing(true)
    try {
      await apiPost('/api/employee-shifts/publish', {
        week_start: schedule.week_start || weekStart,
        shifts: schedule.shifts,
        total_labor_cost: schedule.total_labor_cost,
        overtime_warnings: schedule.overtime_warnings,
      })
      setPublished(true)
      // mark constraint notifications as read
      await apiPost('/api/employee-shifts/notifications/read', {}).catch(() => {})
      setNotifications([])
    } catch (err) {
      setError(err.message || 'Publish failed.')
    } finally { setPublishing(false) }
  }

  const shifts = schedule?.shifts || {}

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#f5f5f0]">Shift Organizer</h1>
          <p className="text-sm text-[#6b705c] mt-1">AI-assisted weekly schedule builder</p>
        </div>
        {notifications.length > 0 && (
          <div className="rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-4 py-3 text-xs text-[#c9a96e]">
            {notifications.length} employee{notifications.length !== 1 ? 's' : ''} submitted constraints
          </div>
        )}
      </div>

      {/* Week picker + controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-xs font-semibold text-[#e8dcc0]/60 mb-1">Week starting (Monday)</label>
          <input type="date" value={weekStart} onChange={e => { setWeekStart(e.target.value); setSchedule(null); setPublished(false) }}
            className="rounded-xl border border-[#6b705c]/25 bg-[#0d0c09]/60 px-4 py-2.5 text-sm text-[#f5f5f0] focus:border-[#c9a96e]/50 focus:outline-none" />
        </div>
        <div className="mt-5">
          <button onClick={handleGenerate} disabled={generating}
            className="rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-6 py-2.5 text-sm font-bold text-[#c9a96e] hover:bg-[#c9a96e]/20 transition disabled:opacity-40">
            {generating ? 'Generating…' : 'Generate Shift'}
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">{error}</div>}

      {schedule && (
        <div className="space-y-5">
          {/* Summary */}
          {(schedule.total_labor_cost || schedule.overtime_warnings?.length > 0) && (
            <div className="flex items-center gap-6 rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 px-5 py-4">
              {schedule.total_labor_cost && (
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c]">Est. Labor Cost</div>
                  <div className="text-xl font-black text-[#c9a96e] tabular-nums">₪{Math.round(schedule.total_labor_cost).toLocaleString()}</div>
                </div>
              )}
              {schedule.overtime_warnings?.length > 0 && (
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] mb-1">Overtime Warnings</div>
                  {schedule.overtime_warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-400">{typeof w === 'string' ? w : JSON.stringify(w)}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Weekly grid */}
          <div className="space-y-4">
            {DAYS.map(day => {
              const dayShifts = shifts[day]
              if (!dayShifts) return null
              const lunch = Array.isArray(dayShifts.lunch) ? dayShifts.lunch : []
              const dinner = Array.isArray(dayShifts.dinner) ? dayShifts.dinner : []
              if (!lunch.length && !dinner.length) return null
              return (
                <div key={day} className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 p-4">
                  <p className="text-sm font-bold text-[#f5f5f0] mb-3">{DAY_LABELS[day]}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['lunch', 'dinner'].map(service => {
                      const slots = dayShifts[service] || []
                      return (
                        <div key={service}>
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] mb-2">{service}</p>
                          {slots.length === 0 ? (
                            <p className="text-xs text-[#6b705c]/50 italic">—</p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {slots.map((slot, i) => <EmployeeChip key={i} slot={slot} />)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {published ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 px-6 py-5 text-center">
              <p className="text-base font-bold text-emerald-400">✓ Schedule published</p>
              <p className="text-xs text-[#6b705c] mt-1">Employees have been notified</p>
            </div>
          ) : (
            <button onClick={handlePublish} disabled={publishing}
              className="w-full rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/10 py-3 text-sm font-bold text-[#c9a96e] hover:bg-[#c9a96e]/20 transition disabled:opacity-40">
              {publishing ? 'Publishing…' : 'Publish Schedule'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
