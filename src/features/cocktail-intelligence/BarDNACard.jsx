// CI MODULE ADDITION — Bar DNA Card: State A (DNA exists) + State B (onboarding form)
import { useState } from 'react'

const LABEL = 'mb-3 block text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70'
const INPUT  = 'w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20 placeholder:text-[#6b705c]'
const TEXTAREA = INPUT + ' resize-none'
const SELECT = INPUT

const STYLE_OPTIONS = [
  'Elevated craft',
  'Approachable & fun',
  'Classic & timeless',
  'Experimental & avant-garde',
  'Mediterranean terroir',
  'Seasonal farm-to-bar'
]

const SEASONAL_OPTIONS = ['Spring', 'Summer', 'Autumn', 'Winter', 'Year-round']

const BLANK = {
  bar_name: '',
  concept: '',
  target_guest: '',
  price_tier: '',
  signature_style: '',
  hero_ingredients: '',
  excluded_ingredients: '',
  spirit_focus: '',
  non_alcoholic_ratio: '',
  seasonal_approach: '',
  kosher_aware: false,
  local_sourcing_priority: '',
  menu_size_target: '',
  notes: ''
}

function Field({ label, children }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  )
}

function DNASummary({ dna, onEdit }) {
  const rows = [
    ['Bar', dna.bar_name],
    ['Concept', dna.concept],
    ['Guest profile', dna.target_guest],
    ['Price tier', dna.price_tier],
    ['Signature style', dna.signature_style],
    ['Hero ingredients', dna.hero_ingredients],
    ['Spirit focus', dna.spirit_focus],
    ['Seasonal approach', dna.seasonal_approach],
    ['Menu size target', dna.menu_size_target],
    ['Kosher aware', dna.kosher_aware ? 'Yes — verify with supplier' : 'No'],
    ['Local sourcing priority', dna.local_sourcing_priority]
  ].filter(([, v]) => v)

  return (
    <div className="rounded-[1.5rem] border border-[#6b705c]/10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-2 w-2 rounded-full bg-[#c9a96e]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">Bar DNA</span>
          </div>
          <h2 className="text-xl font-bold text-[#f5f5f0]">{dna.bar_name || 'Your Bar'}</h2>
          {dna.concept && (
            <p className="mt-1 text-sm text-[#e8dcc0]/70 leading-relaxed max-w-prose">{dna.concept}</p>
          )}
        </div>
        <button
          onClick={onEdit}
          className="shrink-0 rounded-xl border border-[#6b705c]/30 bg-transparent px-4 py-2 text-sm text-[#f5f5f0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
        >
          Edit DNA
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {rows.map(([key, val]) => (
          <div key={key} className="rounded-xl border border-[#6b705c]/10 bg-[#0d0c09]/60 px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/60 mb-1">{key}</div>
            <div className="text-sm text-[#f5f5f0] leading-snug">{val}</div>
          </div>
        ))}
      </div>

      {dna.excluded_ingredients && (
        <div className="mt-3 rounded-xl border border-[#6b705c]/10 bg-[#0d0c09]/60 px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/60 mb-1">Excluded ingredients</div>
          <div className="text-sm text-[#e8dcc0]/70">{dna.excluded_ingredients}</div>
        </div>
      )}

      {dna.notes && (
        <div className="mt-3 rounded-xl border border-[#6b705c]/10 bg-[#0d0c09]/60 px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/60 mb-1">Director notes</div>
          <div className="text-sm text-[#e8dcc0]/70 leading-relaxed">{dna.notes}</div>
        </div>
      )}
    </div>
  )
}

function DNAForm({ initial, onSave, saving, onCancel, isEdit }) {
  const [form, setForm] = useState({ ...BLANK, ...initial })

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await onSave(form)
  }

  return (
    <div className="rounded-[1.5rem] border border-[#6b705c]/10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {!isEdit && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#c9a96e]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">Bar DNA Setup</span>
          </div>
          <h2 className="text-xl font-bold text-[#f5f5f0] mb-1">Welcome to Cocktail Intelligence</h2>
          <p className="text-sm text-[#e8dcc0]/70 leading-relaxed max-w-prose">
            Let's set up your bar's DNA. This profile shapes every AI recommendation — menus, narratives, signature drinks, and more. Take two minutes now; it powers everything else.
          </p>
        </div>
      )}

      {isEdit && (
        <div className="mb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#c9a96e]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">Edit Bar DNA</span>
            </div>
            <h2 className="text-xl font-bold text-[#f5f5f0]">Update your bar profile</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[#6b705c]/30 bg-transparent px-4 py-2 text-sm text-[#f5f5f0] transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
          >
            Cancel
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Bar name *">
            <input
              className={INPUT}
              value={form.bar_name}
              onChange={e => set('bar_name', e.target.value)}
              placeholder="e.g. Beit Ramona"
              required
            />
          </Field>

          <Field label="Price tier">
            <select className={SELECT} value={form.price_tier} onChange={e => set('price_tier', e.target.value)}>
              <option value="">Select…</option>
              <option>Budget</option>
              <option>Mid-range</option>
              <option>Premium</option>
              <option>Luxury</option>
            </select>
          </Field>
        </div>

        <Field label="Bar concept & identity">
          <textarea
            className={TEXTAREA}
            rows={3}
            value={form.concept}
            onChange={e => set('concept', e.target.value)}
            placeholder="Describe the soul of your bar — its story, atmosphere, and what makes it distinct…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Target guest profile">
            <input
              className={INPUT}
              value={form.target_guest}
              onChange={e => set('target_guest', e.target.value)}
              placeholder="e.g. Design-conscious locals, 30–45"
            />
          </Field>

          <Field label="Signature style">
            <select className={SELECT} value={form.signature_style} onChange={e => set('signature_style', e.target.value)}>
              <option value="">Select…</option>
              {STYLE_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Hero ingredients — what defines your palate">
          <input
            className={INPUT}
            value={form.hero_ingredients}
            onChange={e => set('hero_ingredients', e.target.value)}
            placeholder="e.g. Arak, pomegranate, za'atar, local citrus, fig"
          />
        </Field>

        <Field label="Excluded ingredients — flavors, allergens, or guest triggers to avoid">
          <input
            className={INPUT}
            value={form.excluded_ingredients}
            onChange={e => set('excluded_ingredients', e.target.value)}
            placeholder="e.g. Blue curaçao, sour mix, overly sweet syrups"
          />
        </Field>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Spirit focus">
            <input
              className={INPUT}
              value={form.spirit_focus}
              onChange={e => set('spirit_focus', e.target.value)}
              placeholder="e.g. Whisky-led, agave, gin, brandy"
            />
          </Field>

          <Field label="Non-alcoholic ratio target">
            <input
              className={INPUT}
              value={form.non_alcoholic_ratio}
              onChange={e => set('non_alcoholic_ratio', e.target.value)}
              placeholder="e.g. 20% of menu, at least 3 options"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Seasonal approach">
            <select className={SELECT} value={form.seasonal_approach} onChange={e => set('seasonal_approach', e.target.value)}>
              <option value="">Select…</option>
              {SEASONAL_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>

          <Field label="Menu size target">
            <input
              className={INPUT}
              value={form.menu_size_target}
              onChange={e => set('menu_size_target', e.target.value)}
              placeholder="e.g. 12 cocktails, 4 seasonal rotations"
            />
          </Field>
        </div>

        <Field label="Local sourcing priority">
          <input
            className={INPUT}
            value={form.local_sourcing_priority}
            onChange={e => set('local_sourcing_priority', e.target.value)}
            placeholder="e.g. Israeli spirits first, Galilee producers where possible"
          />
        </Field>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.kosher_aware}
            onClick={() => set('kosher_aware', !form.kosher_aware)}
            className={`relative h-6 w-11 rounded-full transition-colors ${form.kosher_aware ? 'bg-[#c9a96e]' : 'bg-[#6b705c]/40'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.kosher_aware ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm text-[#f5f5f0]">
            Kosher-aware menu — AI will flag non-kosher ingredients.{' '}
            <span className="text-[#6b705c] text-xs">Always verify with your supplier.</span>
          </span>
        </div>

        <Field label="Director notes — anything the AI should always keep in mind">
          <textarea
            className={TEXTAREA}
            rows={3}
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="e.g. We avoid oversweet cocktails. Guest demographic is 70% female. Summer is peak season."
          />
        </Field>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving || !form.bar_name}
            className="rounded-xl bg-[#c9a96e] px-6 py-3 text-sm font-bold text-[#0d0c09] transition hover:bg-[#dfc497] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Bar DNA'}
          </button>
        </div>
      </form>
    </div>
  )
}

export function BarDNACard({ dna, saving, onSave }) {
  const [editing, setEditing] = useState(false)

  async function handleSave(formData) {
    const result = await onSave(formData)
    if (result?.ok) setEditing(false)
  }

  // State B — no DNA yet
  if (!dna && !editing) {
    return (
      <DNAForm
        initial={BLANK}
        onSave={handleSave}
        saving={saving}
        isEdit={false}
      />
    )
  }

  // Editing existing DNA
  if (editing) {
    return (
      <DNAForm
        initial={dna || BLANK}
        onSave={handleSave}
        saving={saving}
        onCancel={() => setEditing(false)}
        isEdit
      />
    )
  }

  // State A — DNA exists
  return <DNASummary dna={dna} onEdit={() => setEditing(true)} />
}
