// CI MODULE ADDITION — Flow 1: Full Menu from Brief
import { useState, useEffect, useRef } from 'react'
import { RejectionModal } from './RejectionModal'
import { MenuNameModal } from './MenuNameModal' // CI MODULE ADDITION
import { saveVisualDesign, generateCocktailImage } from '../../services/api/cocktailIntelligenceApi'

// Normalize any AI-returned value to a safe renderable string.
// Gemini can return any field as an object instead of a string.
function toStr(item) {
  if (item == null) return ''
  if (typeof item === 'string') return item
  if (typeof item === 'object') {
    return item.message || item.warning || item.text || item.label || item.name || JSON.stringify(item)
  }
  return String(item)
}

const LABEL   = 'mb-2 block text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70'
const INPUT   = 'w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20 placeholder:text-[#6b705c]'
const SELECT  = INPUT
const TEXTAREA = INPUT + ' resize-none'

const LOADING_MESSAGES = [
  'Consulting your Beverage Director...',
  'Analyzing your Bar DNA...',
  'Balancing the menu...',
  'Checking Israeli market trends...',
  'Almost ready...'
]

const OCCASIONS = [
  { value: 'regular_menu', label: 'Regular Menu' },
  { value: 'seasonal',     label: 'Seasonal Update' },
  { value: 'event',        label: 'Event Menu' },
  { value: 'opening',      label: 'Opening Menu' },
  { value: 'rebrand',      label: 'Rebrand' }
]

const GUEST_PROFILES = [
  { value: 'romantic',      label: 'Romantic / Date Night' },
  { value: 'corporate',     label: 'Corporate Crowd' },
  { value: 'young_crowd',   label: 'Young & Social' },
  { value: 'mixed',         label: 'Mixed Audience' },
  { value: 'food_focused',  label: 'Food-Focused Guests' },
  { value: 'party',         label: 'Party Crowd' }
]

const BUDGET_TIERS = [
  { value: 'low',     label: 'Economy' },
  { value: 'mid',     label: 'Mid-Range' },
  { value: 'premium', label: 'Premium' }
]

const SPIRIT_KEYWORDS = [
  'vodka','gin','rum','tequila','whiskey','whisky','mezcal','arak',
  'campari','aperol','vermouth','brandy','cognac','bourbon','scotch',
  'liqueur','triple sec','kahlua','baileys','beer','wine','champagne',
  'prosecco','sake'
]

function isSpirit(ing) {
  if (!ing || typeof ing === 'string') return false
  if (ing.category) return /spirit|alcohol|liquor/i.test(ing.category)
  const name = String(ing.name || '').toLowerCase()
  return SPIRIT_KEYWORDS.some(k => name.includes(k))
}

function sortIngredients(ings) {
  return [...ings].sort((a, b) => {
    const aSpirit = isSpirit(a) ? 0 : 1
    const bSpirit = isSpirit(b) ? 0 : 1
    if (aSpirit !== bSpirit) return aSpirit - bSpirit
    const aAmt = parseFloat((a?.amount) || 0)
    const bAmt = parseFloat((b?.amount) || 0)
    return bAmt - aAmt
  })
}

function Field({ label, children }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {children}
    </div>
  )
}

function LoadingView({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-[#c9a96e]/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#c9a96e] animate-spin" />
        <div className="absolute inset-3 rounded-full bg-[#c9a96e]/10" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#f5f5f0]">{message}</p>
        <p className="mt-1 text-xs text-[#6b705c]">AI generation in progress</p>
      </div>
    </div>
  )
}

function ComplexityBar({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/60 mb-1">{label}</div>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <div key={n} className={`h-2 w-3 rounded-sm ${n <= (value || 0) ? 'bg-[#c9a96e]' : 'bg-[#6b705c]/20'}`} />
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/60">{label}</div>
      <div className="text-sm text-[#f5f5f0]/80 capitalize">{value ?? '—'}</div>
    </div>
  )
}

function CocktailCard({ cocktail, index, adjusted, adjustedIngredients, onAdjust, onReject, onRegenerate, regenerating }) {
  const [adjusting, setAdjusting]           = useState(false)
  const [editIngredients, setEditIngredients] = useState([])
  const [editNote, setEditNote]             = useState('')

  const gp = cocktail.estimated_gp_percent
  const gpColor = gp >= 70 ? 'text-emerald-400' : gp >= 55 ? 'text-amber-400' : gp ? 'text-red-400' : 'text-[#6b705c]'
  const displayIngredients = (adjusted && adjustedIngredients) ? adjustedIngredients : (cocktail.ingredients || [])

  function openAdjust() {
    const ings = displayIngredients.map(ing => {
      if (!ing || typeof ing === 'string') return { name: ing || '', amount: '', unit: '' }
      return { name: ing.name || '', amount: String(ing.amount || ''), unit: ing.unit || '' }
    })
    setEditIngredients(ings.length ? ings : [{ name: '', amount: '', unit: '' }])
    setEditNote('')
    setAdjusting(true)
  }

  function updateIngRow(ri, field, val) {
    setEditIngredients(prev => prev.map((r, i) => i === ri ? { ...r, [field]: val } : r))
  }

  function addIngRow() {
    setEditIngredients(prev => [...prev, { name: '', amount: '', unit: '' }])
  }

  function removeIngRow(ri) {
    setEditIngredients(prev => prev.filter((_, i) => i !== ri))
  }

  function saveAdjust() {
    const cleaned = editIngredients.filter(r => (r.name || '').trim())
    onAdjust(index, cleaned)
    setAdjusting(false)
  }

  return (
    <div className="rounded-2xl border border-[#6b705c]/10 bg-[#0d0c09]/60 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-[#6b705c]/10">
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-[#f5f5f0] truncate">{toStr(cocktail.name)}</h3>
              {adjusted && (
                <span className="shrink-0 rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#c9a96e]">
                  Adjusted
                </span>
              )}
            </div>
            {cocktail.tagline && (
              <p className="text-xs text-[#e8dcc0]/60 italic mt-0.5 leading-snug">{toStr(cocktail.tagline)}</p>
            )}
          </div>
          <span className="shrink-0 rounded-full border border-[#6b705c]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c9a96e]/80">
            {toStr(cocktail.base_spirit) || '—'}
          </span>
        </div>
        {(cocktail.flavor_profile || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(cocktail.flavor_profile || []).map((f, i) => (
              <span key={i} className="rounded-full bg-[#6b705c]/15 px-2 py-0.5 text-[10px] text-[#e8dcc0]/60">{toStr(f)}</span>
            ))}
          </div>
        )}
        {(cocktail.kosher_flags || []).length > 0 && (
          <div className="mt-2 flex items-start gap-1.5">
            <span className="text-amber-400 text-xs shrink-0">⚠</span>
            <span className="text-xs text-amber-400/80">{(cocktail.kosher_flags || []).map(toStr).join(' · ')}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 space-y-4">
        {/* Ingredients */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/60 mb-2">Ingredients</div>
          <div className="space-y-1">
            {sortIngredients(displayIngredients).map((ing, i) => {
              if (!ing || typeof ing === 'string') {
                return <div key={i} className="flex items-baseline gap-2 text-sm"><span className="text-[#f5f5f0]/80">{ing || '—'}</span></div>
              }
              return (
                <div key={i} className="flex items-baseline gap-2 text-sm">
                  <span className="w-16 shrink-0 text-right text-[#c9a96e]/70 font-mono text-xs">{toStr(ing.amount)} {toStr(ing.unit)}</span>
                  <span className="text-[#f5f5f0]/80">{toStr(ing.name)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Method / Glass / Garnish */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Method"  value={toStr(cocktail.method)  || null} />
          <Stat label="Glass"   value={toStr(cocktail.glass)   || null} />
          <Stat label="Garnish" value={toStr(cocktail.garnish) || null} />
        </div>

        {/* Economics */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Est. Cost"  value={cocktail.estimated_cost_ils  ? `₪${cocktail.estimated_cost_ils} est.` : null} />
          <Stat label="Price"      value={cocktail.suggested_price_ils  ? `₪${cocktail.suggested_price_ils}` : null} />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/60">GP %</div>
            <div className={`text-sm font-semibold ${gpColor}`}>{gp ? `${gp}%` : '—'}</div>
          </div>
        </div>

        {/* Complexity */}
        <div className="flex gap-4 flex-wrap">
          <ComplexityBar label="Prep complexity"  value={cocktail.prep_complexity} />
          <ComplexityBar label="Service speed"    value={cocktail.speed_of_service} />
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/60 mb-1">Score</div>
            <div className="text-sm font-bold text-[#6b705c]">—</div>
          </div>
        </div>

        {/* Director's reasoning */}
        {cocktail.why_this_venue && (
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/60 mb-1">Director's Reasoning</div>
            <p className="text-xs text-[#e8dcc0]/60 leading-relaxed">{toStr(cocktail.why_this_venue)}</p>
          </div>
        )}

        {/* Warnings */}
        {(cocktail.warnings || []).length > 0 && (
          <div className="space-y-0.5">
            {(cocktail.warnings || []).map((w, i) => (
              <div key={i} className="text-xs text-amber-400/70">⚠ {toStr(w)}</div>
            ))}
          </div>
        )}

        {/* Inline Adjust Panel */}
        {adjusting && (
          <div className="rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 p-4 space-y-3">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/70">Adjust Ingredients</div>
            <div className="space-y-2">
              {editIngredients.map((row, ri) => (
                <div key={ri} className="flex gap-2 items-center">
                  <input
                    className="w-16 shrink-0 rounded-lg border border-[#6b705c]/30 bg-[#0d0c09] px-2 py-1.5 text-xs text-[#c9a96e] font-mono outline-none focus:border-[#c9a96e]"
                    placeholder="amount"
                    value={row.amount}
                    onChange={e => updateIngRow(ri, 'amount', e.target.value)}
                  />
                  <input
                    className="w-14 shrink-0 rounded-lg border border-[#6b705c]/30 bg-[#0d0c09] px-2 py-1.5 text-xs text-[#6b705c] outline-none focus:border-[#c9a96e]"
                    placeholder="unit"
                    value={row.unit}
                    onChange={e => updateIngRow(ri, 'unit', e.target.value)}
                  />
                  <input
                    className="flex-1 rounded-lg border border-[#6b705c]/30 bg-[#0d0c09] px-2 py-1.5 text-xs text-[#f5f5f0] outline-none focus:border-[#c9a96e]"
                    placeholder="ingredient"
                    value={row.name}
                    onChange={e => updateIngRow(ri, 'name', e.target.value)}
                  />
                  <button
                    onClick={() => removeIngRow(ri)}
                    className="shrink-0 px-1 text-xs text-red-400/50 hover:text-red-400 transition"
                    title="Remove"
                  >✕</button>
                </div>
              ))}
            </div>
            <button
              onClick={addIngRow}
              className="text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] transition"
            >
              + Add ingredient
            </button>
            <textarea
              className="w-full rounded-xl border border-[#6b705c]/30 bg-[#0d0c09] px-3 py-2 text-xs text-[#f5f5f0] outline-none resize-none focus:border-[#c9a96e] placeholder:text-[#6b705c]"
              rows={2}
              value={editNote}
              onChange={e => setEditNote(e.target.value)}
              placeholder="What would you like to change? (optional note)"
            />
            <div className="flex gap-2">
              <button
                onClick={saveAdjust}
                className="flex-1 rounded-xl border border-[#c9a96e]/30 bg-[#c9a96e]/15 py-2 text-xs font-bold text-[#c9a96e] hover:bg-[#c9a96e]/25 transition"
              >
                Save Adjustments
              </button>
              <button
                onClick={() => setAdjusting(false)}
                className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/50 hover:text-[#f5f5f0]/70 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-2 flex-wrap border-t border-[#6b705c]/10 pt-4">
        <button
          onClick={() => onReject(cocktail, index)}
          className="flex-1 rounded-xl border border-red-500/30 bg-red-950/20 py-2 text-sm font-bold text-red-400 transition hover:border-red-400/60"
        >
          Reject
        </button>
        <button
          onClick={openAdjust}
          disabled={adjusting || regenerating}
          className="flex-1 rounded-xl border border-[#c9a96e]/30 bg-[#c9a96e]/5 py-2 text-sm font-bold text-[#c9a96e] transition hover:bg-[#c9a96e]/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Adjust
        </button>
        <button
          onClick={() => onRegenerate(cocktail, index)}
          disabled={regenerating || adjusting}
          className="rounded-xl border border-[#6b705c]/30 px-3 py-2 text-xs text-[#f5f5f0]/70 transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e] disabled:opacity-30 disabled:cursor-not-allowed"
          title="Regenerate this cocktail without changing the rest of the menu"
        >
          {regenerating ? '↻ ...' : '↻'}
        </button>
      </div>
    </div>
  )
}

export function MenuGenerator({ dna, onGenerate, onRegenerate, onApprove, onReject, onViewLibrary, onCreateMenu, onMenuSaved }) {
  const [view, setView] = useState('form')
  const [form, setForm] = useState({
    number_of_cocktails: 6,
    occasion:            'regular_menu',
    kosher_override:     dna?.kosher_aware || false,
    guest_profile:       'mixed',
    budget_tier:         'mid',
    special_requirements: ''
  })
  const [result, setResult]               = useState(null)
  const [lastParams, setLastParams]       = useState(null)
  const [errorMsg, setErrorMsg]           = useState('')
  const [loadingMsg, setLoadingMsg]       = useState(LOADING_MESSAGES[0])
  const [rejectedSet, setRejectedSet]     = useState(new Set())
  const [adjustedMap, setAdjustedMap]     = useState({})
  const [menuApproved, setMenuApproved]   = useState(false)
  const [approvingMenu, setApprovingMenu] = useState(false)
  const [showMenuModal, setShowMenuModal] = useState(false) // CI MODULE ADDITION
  const [savedMenuId, setSavedMenuId]     = useState(null)  // CI MODULE ADDITION
  const [menuSaveError, setMenuSaveError] = useState(null)  // CI MODULE ADDITION
  const [rejectTarget, setRejectTarget]   = useState(null)
  const [regenIndex, setRegenIndex]       = useState(null)
  const msgIndex = useRef(0)

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  // Rotate loading messages
  useEffect(() => {
    if (view !== 'loading') return
    msgIndex.current = 0
    const t = setInterval(() => {
      msgIndex.current = (msgIndex.current + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[msgIndex.current])
    }, 2200)
    return () => clearInterval(t)
  }, [view])

  async function handleSubmit(e) {
    e.preventDefault()
    setView('loading')
    setLoadingMsg(LOADING_MESSAGES[0])
    setRejectedSet(new Set())
    setAdjustedMap({})
    setMenuApproved(false)
    setMenuSaveError(null)
    setResult(null)
    const params = { ...form }
    setLastParams(params)
    try {
      const res = await onGenerate(params)
      if (!res?.cocktails || !Array.isArray(res.cocktails) || res.cocktails.length === 0) {
        throw new Error('The AI returned an unexpected response. Please try again.')
      }
      setResult(res)
      setView('result')
    } catch (err) {
      setErrorMsg(err?.message || 'Generation failed. Please try again.')
      setView('error')
    }
  }

  function handleAdjust(index, ingredients) {
    setAdjustedMap(prev => ({ ...prev, [index]: ingredients }))
  }

  // CI MODULE ADDITION — step 1: show naming modal instead of saving immediately
  function handleApproveFullMenu() {
    setMenuSaveError(null)
    setShowMenuModal(true)
  }

  // CI MODULE ADDITION — step 2: modal confirmed → create menu record → save cocktails
  async function handleConfirmMenu(menuData) {
    setShowMenuModal(false)
    setApprovingMenu(true)
    setMenuSaveError(null) // CI MODULE ADDITION
    try {
      // Create the named menu record first
      let menuId = null
      if (onCreateMenu) {
        const menuRes = await onCreateMenu(menuData)
        // CI MODULE ADDITION — surface actual server error instead of generic message
        if (!menuRes?.ok) {
          setMenuSaveError(menuRes?.error || 'Failed to create menu record. Please try again.')
          setApprovingMenu(false)
          return
        }
        menuId = menuRes.menuId || null
        setSavedMenuId(menuId)
      }

      // Save each non-rejected cocktail, linking to the menu
      const toApprove = (result.cocktails || [])
        .filter(Boolean)
        .map((c, i) => ({ c, i }))
        .filter(({ i }) => !rejectedSet.has(i))
      const approveResults = await Promise.all(toApprove.map(({ c, i }) =>
        onApprove({
          name:                 c.name,
          description:          c.tagline,
          base_spirit:          c.base_spirit,
          glass:                c.glass,
          garnish:              c.garnish,
          method:               c.method,
          ingredients:          adjustedMap[i] || c.ingredients,
          tags:                 c.flavor_profile || [],
          source:               'ci_generated',
          menu_id:              menuId,
          estimated_cost_ils:   c.estimated_cost_ils   || null,
          suggested_price_ils:  c.suggested_price_ils   || null,
          estimated_gp_percent: c.estimated_gp_percent  || null,
        })
      ))
      setMenuApproved(true)
      // Refresh shared ciMenus so all modules (MenuMargin, Narratives, Audit) see correct counts
      if (onMenuSaved) onMenuSaved()

      // Fire background image pre-generation — non-blocking, silent on error
      if (menuId) {
        const approved = toApprove
          .map(({ c }, idx) => ({ c, cocktailId: approveResults[idx]?.cocktailId }))
          .filter(({ cocktailId }) => cocktailId != null)
        ;(async () => {
          for (const { c, cocktailId } of approved) {
            try {
              const result = await generateCocktailImage(c)
              if (result?.imageData) {
                await saveVisualDesign(cocktailId, {
                  menu_id:      menuId,
                  image_prompt: result.prompt || null,
                  image_url:    result.imageData,
                  status:       'done',
                })
              }
            } catch { /* silent */ }
          }
        })()
      }
    } catch {
      // CI MODULE ADDITION — surface the error; do not fake success
      setMenuSaveError('Failed to save menu. Please try again.')
    } finally {
      setApprovingMenu(false)
    }
  }

  async function handleConfirmReject(reasons) {
    if (!rejectTarget) return
    const { cocktail, index } = rejectTarget
    if (!reasons.includes('just_experimenting')) {
      await onReject({
        cocktail_name:    cocktail.name,
        reasons,
        base_spirit:      cocktail.base_spirit,
        cocktail_profile: { flavor_profile: cocktail.flavor_profile },
        flow_type:        'full_menu'
      })
    }
    setRejectedSet(prev => new Set([...prev, index]))
    setRejectTarget(null)
  }

  async function handleRegenerate(cocktail, index) {
    if (!lastParams) return
    setRegenIndex(index)
    try {
      const existingNames = (result?.cocktails || [])
        .filter((_, i) => i !== index)
        .map(c => c.name)
      const newCocktail = await onRegenerate({
        ...lastParams,
        existing_names:      existingNames,
        cocktail_to_replace: cocktail.name
      })
      if (!newCocktail) throw new Error('No cocktail returned')
      setResult(prev => ({
        ...prev,
        cocktails: prev.cocktails.map((c, i) => i === index ? newCocktail : c)
      }))
      setAdjustedMap(prev => { const next = { ...prev }; delete next[index]; return next })
    } catch {
      // silently keep existing cocktail on failure
    } finally {
      setRegenIndex(null)
    }
  }

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <div className="rounded-[1.5rem] border border-[#6b705c]/10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <LoadingView message={loadingMsg} />
      </div>
    )
  }

  // ── ERROR ──────────────────────────────────────────────────────────────────
  if (view === 'error') {
    return (
      <div className="rounded-[1.5rem] border border-red-500/20 bg-[#1a1a1a] p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="text-3xl mb-3 text-red-400">✕</div>
        <p className="text-sm font-semibold text-red-300 mb-1">Generation failed</p>
        <p className="text-xs text-[#6b705c] mb-6 max-w-sm mx-auto">{errorMsg}</p>
        <button
          onClick={() => setView('form')}
          className="rounded-xl bg-[#c9a96e] px-6 py-2.5 text-sm font-bold text-[#0d0c09] hover:bg-[#dfc497]"
        >
          Try Again
        </button>
      </div>
    )
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (view === 'result' && result) {
    const visibleCocktails = (result.cocktails || [])
      .filter(Boolean)
      .map((c, i) => ({ c, i }))
      .filter(({ i }) => !rejectedSet.has(i))

    return (
      <div className="space-y-5">
        {/* Menu strategy */}
        {result.menu_strategy && (
          <div className="rounded-2xl border border-[#c9a96e]/15 bg-[#c9a96e]/5 p-5">
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-2">Menu Strategy</div>
            <p className="text-sm text-[#e8dcc0]/80 leading-relaxed">{toStr(result.menu_strategy)}</p>
          </div>
        )}

        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-[#6b705c]">
            {visibleCocktails.length} cocktail{visibleCocktails.length !== 1 ? 's' : ''} · {(result.cocktails || []).length - visibleCocktails.length} rejected
          </div>
          <button
            onClick={() => setView('form')}
            className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
          >
            ← New Brief
          </button>
        </div>

        {/* Cocktail grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {visibleCocktails.map(({ c, i }) => (
            <CocktailCard
              key={`${c.name || 'cocktail'}-${i}`}
              cocktail={c}
              index={i}
              adjusted={Boolean(adjustedMap[i])}
              adjustedIngredients={adjustedMap[i] || null}
              onAdjust={handleAdjust}
              onReject={(cc, ii) => setRejectTarget({ cocktail: cc, index: ii })}
              onRegenerate={handleRegenerate}
              regenerating={regenIndex === i}
            />
          ))}
        </div>

        {/* Menu warnings */}
        {(result.menu_warnings || []).length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400/70 mb-2">Menu Warnings</div>
            <ul className="space-y-1">
              {result.menu_warnings.map((w, i) => (
                <li key={i} className="text-xs text-amber-400/70">⚠ {toStr(w)}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Approve Full Menu */}
        <div className="rounded-2xl border border-[#6b705c]/10 bg-[#0d0c09]/60 p-5">
          {menuApproved ? (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 text-xl">✓</span>
                <span className="text-sm font-semibold text-emerald-400">Menu approved and saved to your library</span>
              </div>
              {onViewLibrary && (
                <button
                  onClick={onViewLibrary}
                  className="text-sm text-[#c9a96e] hover:text-[#dfc497] transition"
                >
                  View in Library →
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-[#6b705c] mb-3 text-center">
                {visibleCocktails.length} cocktail{visibleCocktails.length !== 1 ? 's' : ''} ready to approve
              </p>
              <button
                onClick={handleApproveFullMenu}
                disabled={approvingMenu || visibleCocktails.length === 0}
                className="w-full rounded-xl bg-emerald-700 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approvingMenu ? 'Saving...' : 'Approve Full Menu'}
              </button>
              {/* CI MODULE ADDITION — surface save errors */}
              {menuSaveError && (
                <p className="mt-2 text-center text-sm text-red-400">{menuSaveError}</p>
              )}
            </>
          )}
        </div>

        {/* Rejection Modal */}
        {rejectTarget && (
          <RejectionModal
            cocktail={rejectTarget.cocktail}
            onConfirm={handleConfirmReject}
            onCancel={() => setRejectTarget(null)}
          />
        )}

        {/* CI MODULE ADDITION — Menu naming modal, shown before save */}
        {showMenuModal && (
          <MenuNameModal
            cocktailCount={
              (result.cocktails || []).filter((_, i) => !rejectedSet.has(i)).length
            }
            onConfirm={handleConfirmMenu}
            onCancel={() => setShowMenuModal(false)}
          />
        )}
      </div>
    )
  }

  // ── FORM ──────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-[1.5rem] border border-[#6b705c]/10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="mb-5">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-1">Full Menu Brief</div>
        <h2 className="text-xl font-bold text-[#f5f5f0]">Generate Your Menu</h2>
        <p className="text-sm text-[#e8dcc0]/60 mt-0.5">
          Describe the brief and your AI Beverage Director will create a complete, venue-specific cocktail menu.
        </p>
      </div>

      {/* DNA context strip */}
      {dna && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#6b705c]/10 bg-[#0d0c09]/40 px-4 py-3 text-xs text-[#6b705c]">
          <span>DNA: <span className="text-[#c9a96e]">{dna.bar_name || dna.venue_name}</span></span>
          {(dna.hero_ingredients || dna.hero_ingredient) && (
            <span>Hero: {(dna.hero_ingredients || dna.hero_ingredient || '').split(',').slice(0, 3).map(s => s.trim()).join(', ')}</span>
          )}
          {dna.signature_style && <span>{dna.signature_style}</span>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <Field label="Number of cocktails">
            <input
              type="number"
              min={2}
              max={12}
              className={INPUT}
              value={form.number_of_cocktails}
              onChange={e => set('number_of_cocktails', Number(e.target.value))}
            />
            {form.number_of_cocktails > 8 && (
              <p className="mt-1.5 text-[11px] text-amber-400/80 leading-snug">
                Generating more than 8 cocktails may hit AI capacity limits. We recommend 4–6 for best results.
              </p>
            )}
          </Field>
          <Field label="Occasion">
            <select className={SELECT} value={form.occasion} onChange={e => set('occasion', e.target.value)}>
              {OCCASIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Field label="Guest profile">
            <select className={SELECT} value={form.guest_profile} onChange={e => set('guest_profile', e.target.value)}>
              {GUEST_PROFILES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </Field>
          <Field label="Budget tier">
            <select className={SELECT} value={form.budget_tier} onChange={e => set('budget_tier', e.target.value)}>
              {BUDGET_TIERS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={form.kosher_override}
            onClick={() => set('kosher_override', !form.kosher_override)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${form.kosher_override ? 'bg-[#c9a96e]' : 'bg-[#6b705c]/40'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${form.kosher_override ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="text-sm text-[#f5f5f0]">Kosher-aware menu</span>
          {dna?.kosher_aware && <span className="text-[10px] text-[#6b705c]">(from DNA)</span>}
        </div>

        <Field label="Special requirements (optional)">
          <textarea
            className={TEXTAREA}
            rows={3}
            value={form.special_requirements}
            onChange={e => set('special_requirements', e.target.value)}
            placeholder="e.g. At least 2 non-alcoholic options. No heavy citrus this season. Summer service — favor cold, refreshing profiles."
          />
        </Field>

        <div className="pt-1">
          <button
            type="submit"
            className="rounded-xl bg-[#c9a96e] px-8 py-3 text-sm font-bold text-[#0d0c09] transition hover:bg-[#dfc497]"
          >
            Generate Menu
          </button>
        </div>
      </form>
    </div>
  )
}
