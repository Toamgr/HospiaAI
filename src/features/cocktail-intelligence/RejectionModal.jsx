// CI MODULE ADDITION — Rejection reason modal
import { useState } from 'react'

const REASONS = [
  { id: 'too_strong',         label: 'Too strong / too alcoholic' },
  { id: 'wrong_flavors',      label: "Flavors my guests don't like" },
  { id: 'taste_fail',         label: "I tried it — doesn't taste good" },
  { id: 'too_complex',        label: 'Too complex for my team' },
  { id: 'too_expensive',      label: 'Too expensive to produce' },
  { id: 'identity_mismatch',  label: "Doesn't fit our identity" },
  { id: 'just_experimenting', label: 'Just experimenting (no memory saved)' }
]

export function RejectionModal({ cocktail, onConfirm, onCancel }) {
  const [selected, setSelected] = useState(new Set())

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[1.5rem] border border-[#6b705c]/20 bg-[#1a1a1a] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.6)] mx-4">
        <div className="mb-1 text-[10px] font-black uppercase tracking-[0.4em] text-red-400/70">Reject Cocktail</div>
        <h3 className="mb-1 text-base font-bold text-[#f5f5f0]">{cocktail.name}</h3>
        <p className="mb-5 text-xs text-[#6b705c]">
          Why didn't this work? Your feedback trains the Beverage Director's memory.
        </p>

        <div className="space-y-2 mb-6">
          {REASONS.map(reason => (
            <button
              key={reason.id}
              type="button"
              onClick={() => toggle(reason.id)}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition
                ${selected.has(reason.id)
                  ? 'border-red-500/40 bg-red-950/30 text-red-300'
                  : 'border-[#6b705c]/20 bg-[#0d0c09]/40 text-[#f5f5f0]/70 hover:border-[#6b705c]/40'
                }`}
            >
              <span className={`h-4 w-4 shrink-0 rounded border flex items-center justify-center text-[10px]
                ${selected.has(reason.id) ? 'border-red-500 bg-red-500 text-white' : 'border-[#6b705c]/40'}`}>
                {selected.has(reason.id) ? '✓' : ''}
              </span>
              {reason.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[#6b705c]/30 py-2.5 text-sm text-[#f5f5f0]/70 transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm([...selected])}
            disabled={selected.size === 0}
            className="flex-1 rounded-xl border border-red-500/30 bg-red-950/40 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-900/40 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  )
}
