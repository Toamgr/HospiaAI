import React from 'react'

const ROLE_SUGGESTIONS = [
  { role: 'Event Manager', responsibility: 'Overall coordination and client contact' },
  { role: 'Head Bartender', responsibility: 'Bar programme and cocktail service' },
  { role: 'Floor Captain', responsibility: 'Table service and guest experience' },
  { role: 'Sommelier', responsibility: 'Wine selection and pairing' },
  { role: 'Runner', responsibility: 'Food and drink delivery' },
  { role: 'Door Host', responsibility: 'Guest arrival and check-in' },
]

export default function EventTeam({ event, guests }) {
  const guestCount = event.expected_guests || 0
  const suggestedStaff = Math.max(3, Math.ceil(guestCount / 20))

  return (
    <div className="space-y-5">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Staffing estimate</p>
        <p className="text-2xl font-light text-white">{suggestedStaff}<span className="text-sm text-zinc-500 ml-1">suggested</span></p>
        <p className="text-xs text-zinc-500">Based on {guestCount} expected guests (1 staff per 20 guests, minimum 3).</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Suggested roles</p>
        </div>
        {ROLE_SUGGESTIONS.map(({ role, responsibility }) => (
          <div key={role} className="flex items-start px-5 py-3 border-b border-zinc-800 last:border-0">
            <div className="flex-1">
              <p className="text-sm text-zinc-200 font-medium">{role}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{responsibility}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-4">
        <p className="text-xs text-zinc-400 mb-1">Coming soon</p>
        <p className="text-sm text-zinc-300">Staff assignment with schedule integration is planned for Phase 3. For now, coordinate staffing through the shift management tools.</p>
      </div>
    </div>
  )
}
