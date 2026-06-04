import { useState, useEffect } from 'react'
import { apiGet } from '../../services/api/client'

function formatSeniority(days) {
  if (days == null) return '—'
  const months = Math.floor(days / 30)
  const rem = days % 30
  if (months === 0) return `${days}d`
  return `${months}m ${rem}d`
}

export default function StaffTab() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [traineesOnly, setTraineesOnly] = useState(false)

  useEffect(() => {
    apiGet('/api/staff/employees')
      .then(d => setEmployees(d.employees || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const displayed = traineesOnly ? employees.filter(e => e.is_trainee) : employees

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#6b705c] animate-pulse">Loading…</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-[#f5f5f0]">Staff</h1>
          <p className="text-sm text-[#6b705c] mt-1">{employees.length} team members</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <span className="text-sm text-[#e8dcc0]/60">Trainees only</span>
          <div
            onClick={() => setTraineesOnly(v => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition cursor-pointer ${traineesOnly ? 'bg-emerald-500/70' : 'bg-[#6b705c]/30'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${traineesOnly ? 'translate-x-4' : 'translate-x-1'}`} />
          </div>
        </label>
      </div>

      <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1.5fr_80px_90px_100px_90px_100px] gap-3 px-5 py-3 border-b border-[#6b705c]/20">
          {['Name', 'Gender', 'Sub-role', 'Joined', 'Seniority', 'Status'].map(h => (
            <div key={h} className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c]">{h}</div>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-[#6b705c]">
            {traineesOnly ? 'No trainees currently.' : 'No employees found.'}
          </div>
        ) : (
          displayed.map((e, i) => (
            <div
              key={e.id}
              className={`grid grid-cols-[1.5fr_80px_90px_100px_90px_100px] gap-3 px-5 py-3.5 items-center ${
                i < displayed.length - 1 ? 'border-b border-[#6b705c]/10' : ''
              }`}
            >
              <p className="text-sm font-semibold text-[#f5f5f0] truncate">{e.display_name}</p>
              <p className="text-sm text-[#e8dcc0]/60">{e.gender === 'F' ? 'Female' : 'Male'}</p>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize w-fit ${
                e.sub_role === 'bartender'
                  ? 'border-blue-500/30 text-blue-400'
                  : 'border-[#c9a96e]/30 text-[#c9a96e]'
              }`}>
                {e.sub_role}
              </span>
              <p className="text-xs text-[#6b705c]">{e.joined_date}</p>
              <p className="text-xs text-[#e8dcc0]/60 tabular-nums">{formatSeniority(e.days_since_join)}</p>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold w-fit ${
                e.is_trainee
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-[#6b705c]/30 text-[#6b705c]'
              }`}>
                {e.is_trainee ? 'Trainee' : 'Regular'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
