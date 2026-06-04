// CI MODULE ADDITION — modal to name a menu before approving cocktails
import { useState } from 'react'

const OCCASIONS = [
  { value: 'regular',       label: 'Regular Menu' },
  { value: 'seasonal',      label: 'Seasonal Menu' },
  { value: 'event',         label: 'Event Menu' },
  { value: 'wedding',       label: 'Wedding' },
  { value: 'private_event', label: 'Private Event' },
  { value: 'opening',       label: 'Opening Menu' }
]

const INPUT = 'w-full rounded-xl border border-[#6b705c]/30 bg-[#0d0c09] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20 placeholder:text-[#6b705c]'
const LABEL = 'mb-2 block text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70'

export function MenuNameModal({ cocktailCount, onConfirm, onCancel }) {
  const [name, setName]             = useState('')
  const [occasion, setOccasion]     = useState('regular')
  const [description, setDescription] = useState('')
  const [saving, setSaving]         = useState(false)

  const canSave = name.trim().length > 0

  async function handleSave() {
    if (!canSave || saving) return
    setSaving(true)
    await onConfirm({ name: name.trim(), occasion, description: description.trim() || null })
    setSaving(false)
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0c09]/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.5rem] border border-[#c9a96e]/20 bg-[#151410] shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 space-y-5">

        {/* Header */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-1">
            {cocktailCount} cocktail{cocktailCount !== 1 ? 's' : ''} ready
          </div>
          <h2 className="text-xl font-bold text-[#f5f5f0]">Name your menu</h2>
          <p className="text-sm text-[#e8dcc0]/60 mt-0.5">
            Give this collection an identity before saving.
          </p>
        </div>

        {/* Menu name */}
        <div>
          <label className={LABEL}>Menu name <span className="text-red-400">*</span></label>
          <input
            autoFocus
            className={INPUT}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Summer Menu 2026, Wedding Menu — Cohen Family, Friday Night Menu"
            maxLength={80}
          />
        </div>

        {/* Occasion */}
        <div>
          <label className={LABEL}>Occasion</label>
          <select
            className={INPUT}
            value={occasion}
            onChange={e => setOccasion(e.target.value)}
          >
            {OCCASIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className={LABEL}>
            Description
            <span className="ml-2 text-[#6b705c] normal-case font-normal tracking-normal">optional · {description.length}/120</span>
          </label>
          <textarea
            className={INPUT + ' resize-none'}
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value.slice(0, 120))}
            placeholder="What makes this menu special?"
            maxLength={120}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 rounded-xl bg-[#c9a96e] py-3 text-sm font-bold text-[#0d0c09] transition hover:bg-[#dfc497] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Menu'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl border border-[#6b705c]/30 px-5 py-3 text-sm text-[#f5f5f0]/60 transition hover:border-[#6b705c]/50 hover:text-[#f5f5f0]/80 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
