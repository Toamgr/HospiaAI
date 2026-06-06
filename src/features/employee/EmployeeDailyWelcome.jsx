import { useState } from 'react'

// A HESTIA day starts at 05:00 local time.
// Before 05:00 we count it as the previous calendar day so the popup
// does not re-fire for an employee who started their shift before midnight.
function getHestiaDay() {
  const now = new Date()
  if (now.getHours() < 5) {
    const d = new Date(now)
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  }
  return now.toISOString().slice(0, 10)
}

function storageKey(userId) {
  return `hospia.employeeWelcome:${userId || 'guest'}:${getHestiaDay()}`
}

function hasSeenToday(userId) {
  try { return localStorage.getItem(storageKey(userId)) === '1' } catch { return false }
}

function markSeenToday(userId) {
  try { localStorage.setItem(storageKey(userId), '1') } catch { /* localStorage unavailable — fail silently */ }
}

const COPY = {
  morning: {
    heading: (name) => `Good morning, ${name}.`,
    body: "Enjoy your shift today. Check today's updates, move with care, and keep on hosting.",
  },
  afternoon: {
    heading: (name) => `Good afternoon, ${name}.`,
    body: "Enjoy your shift. Review today's updates, stay ready for service, and keep on hosting.",
  },
  evening: {
    heading: (name) => `Good evening, ${name}.`,
    body: 'Enjoy your shift. Check what changed today, stay present, and keep on hosting.',
  },
}

function timePeriod(hour) {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}

export default function EmployeeDailyWelcome({ currentUser }) {
  const role   = currentUser?.role
  const userId = currentUser?.id

  const [dismissed, setDismissed] = useState(() => {
    if (role !== 'employee') return true
    return hasSeenToday(userId)
  })

  if (dismissed) return null

  const hour   = new Date().getHours()
  const period = timePeriod(hour)
  const copy   = COPY[period]
  const name   = currentUser?.full_name || currentUser?.username || 'there'

  function handleDismiss() {
    markSeenToday(userId)
    setDismissed(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0c09]/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[1.5rem] border border-[#c9a96e]/20 bg-[#151410] shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-7 space-y-5">

        <div>
          <div className="mb-2.5 text-[8px] font-black uppercase tracking-[0.34em] text-[#c9a96e]/55">
            HESTIA
          </div>
          <h2 className="font-serif text-[1.6rem] font-black leading-tight text-[#f5f5f0]">
            {copy.heading(name)}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#e8dcc0]/60">
            {copy.body}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="w-full rounded-xl bg-[#c9a96e] py-3 text-sm font-bold text-[#0d0c09] transition hover:bg-[#dfc497] active:opacity-90"
        >
          Start my shift
        </button>

      </div>
    </div>
  )
}
