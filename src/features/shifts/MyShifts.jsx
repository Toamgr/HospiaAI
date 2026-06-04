import { useState, useEffect } from 'react'
import { apiGet } from '../../services/api/client'

const SERVICE_LABEL = { lunch: 'Lunch', dinner: 'Dinner' }
const DAY_LABELS = { sunday: 'Sunday', monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday' }

export default function MyShifts() {
  const [weeks, setWeeks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/api/employee-shifts/my-shifts')
      .then(d => setWeeks(d.shifts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#6b705c] animate-pulse">Loading…</div>
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#f5f5f0]">My Shifts</h1>
        <p className="text-sm text-[#6b705c] mt-1">Current and next week schedule</p>
      </div>

      {weeks.length === 0 ? (
        <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/40 py-14 text-center">
          <p className="text-sm text-[#6b705c]">No schedule data available.</p>
        </div>
      ) : (
        weeks.map(week => (
          <div key={week.week_start} className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#f5f5f0]">Week of {week.week_start}</p>
              {!week.published && (
                <span className="rounded-full border border-[#6b705c]/30 px-2 py-0.5 text-[10px] font-bold text-[#6b705c]">
                  Not published
                </span>
              )}
            </div>
            {!week.published ? (
              <p className="text-xs text-[#6b705c] italic">Shift schedule not yet published by the manager.</p>
            ) : week.shifts.length === 0 ? (
              <p className="text-xs text-[#6b705c] italic">No shifts assigned for this week.</p>
            ) : (
              <div className="space-y-2">
                {week.shifts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-[#6b705c]/15 bg-[#0d0c09]/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[#f5f5f0]">{DAY_LABELS[s.day] || s.day}</p>
                      <p className="text-xs text-[#6b705c]">{SERVICE_LABEL[s.service] || s.service}</p>
                    </div>
                    <span className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-3 py-1 text-xs font-bold text-[#c9a96e] capitalize">
                      {s.position || s.sub_role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
