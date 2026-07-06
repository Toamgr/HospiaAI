/**
 * EventBriefMenuGenerator — Zohar's event-scoped cocktail menu generator.
 *
 * Pre-populated from the saved event brief. Shows no cost or financial data.
 * Approval triggers internal notifications to Owner and F&B Director.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { apiPost, apiPatch } from '../../../services/api/client'
import { fetchCocktailMenu } from '../../../services/api/eventsApi'
import {
  generateEventMenu,
  replaceEventCocktail,
  enrichCocktailsWithCost,
} from '../../../services/eventCocktailMenuService'
import { notifyCocktailMenuApproved } from '../../../services/notificationService'
import { buildEventMenuDNA } from '../utils/eventMenuDNA'
import { buildEventCocktailProduction } from '../utils/eventCocktailProductionEngine'

// ── Form defaults from brief ──────────────────────────────────────────────────

const TYPE_VIBE = {
  wedding:   'festive, romantic, elegant, celebratory',
  corporate: 'clean, professional, elegant, networking-friendly',
  private:   'warm, intimate, personal, celebratory',
  bar_event: 'bold, craft-forward, high-energy, signature cocktails',
  other:     'welcoming, crowd-pleasing',
}

const TYPE_FLAVORS = {
  wedding:   ['Floral', 'Citrus'],
  corporate: ['Citrus', 'Herbal'],
  private:   ['Sweet', 'Floral'],
  bar_event: ['Bitter', 'Citrus', 'Herbal'],
  other:     ['Citrus'],
}

const FLAVOR_PILLS      = ['Citrus', 'Floral', 'Tropical', 'Herbal', 'Spicy', 'Smoky', 'Sweet', 'Bitter']
const RESTRICTION_PILLS = ['No Gluten', 'No Nuts', 'Low ABV', 'Alcohol-Free Option', 'Kosher']

const EMPTY_HEADLINE = {
  wedding:   'Every great wedding deserves its own cocktail programme.',
  corporate: 'Build a drinks programme tailored to your event brief.',
  private:   'Craft a cocktail menu that matches the evening.',
  bar_event: 'Design your bar programme for this event.',
  other:     'Generate a cocktail menu for this event.',
}

const EMPTY_BTN_LABEL = {
  wedding:   'Build the Wedding Programme',
  corporate: 'Build the Drinks Programme',
  private:   'Build the Cocktail Menu',
  bar_event: 'Build the Bar Programme',
  other:     'Build Event Menu',
}

function defaultCocktailCount(guestCount) {
  if (!guestCount) return 4
  if (guestCount < 40)  return 3
  if (guestCount < 120) return 4
  return 5
}

function initFormFromBrief(brief, event) {
  const cb          = brief?.cocktailMenuBrief || {}
  const guestCount  = event?.expected_guests || null
  const eventType   = event?.event_type || 'other'

  const restrictions = []
  if (cb.kosherRequirement) restrictions.push('Kosher')
  if ((cb.alcoholIntensity || '').toLowerCase().includes('moderate')) restrictions.push('Low ABV')

  // Prepend event notes, then welcome drink guidance if present
  const noteParts = [event?.notes, cb.welcomeDrinkNeed].filter(Boolean)
  const notes = noteParts.join('. ')

  return {
    cocktailCount: defaultCocktailCount(guestCount),
    flavors:       TYPE_FLAVORS[eventType] || TYPE_FLAVORS.other,
    restrictions,
    vibe:          TYPE_VIBE[eventType] || TYPE_VIBE.other,
    notes,
  }
}

// ── Pill selector ─────────────────────────────────────────────────────────────

function PillSelect({ options, selected, onChange }) {
  function toggle(pill) {
    onChange(selected.includes(pill) ? selected.filter(p => p !== pill) : [...selected, pill])
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(pill => (
        <button
          key={pill}
          type="button"
          onClick={() => toggle(pill)}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
            selected.includes(pill)
              ? 'bg-amber-600 border-amber-500 text-white'
              : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
          }`}
        >
          {pill}
        </button>
      ))}
    </div>
  )
}

// ── Section grouping helpers ──────────────────────────────────────────────────

function hasValidSections(menu, sectionHeaders) {
  if (!sectionHeaders || !sectionHeaders.length) return false
  return Array.isArray(menu?.cocktails) && menu.cocktails.some(c => c.section)
}

function groupCocktailsBySections(cocktails, sectionHeaders) {
  // Build ordered map from sectionHeaders, preserving order
  const ordered = []
  const grouped = {}

  for (const s of sectionHeaders) grouped[s] = []
  const noSection = []

  for (const cocktail of cocktails) {
    if (cocktail.section && grouped[cocktail.section] !== undefined) {
      grouped[cocktail.section].push(cocktail)
    } else {
      noSection.push(cocktail)
    }
  }

  for (const s of sectionHeaders) {
    if (grouped[s].length > 0) ordered.push({ section: s, cocktails: grouped[s] })
  }
  if (noSection.length > 0) ordered.push({ section: null, cocktails: noSection })
  // If nothing was grouped, return a single flat group
  if (ordered.length === 0) return [{ section: null, cocktails }]
  return ordered
}

// ── Design context + DNA header ───────────────────────────────────────────────

function DesignContextBadge({ designContext, menuDNA }) {
  if (!designContext) return null
  return (
    <div
      style={{
        padding: '10px 14px',
        background: 'rgba(201,169,110,0.05)',
        border: '1px solid rgba(201,169,110,0.18)',
        borderRadius: 7,
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 17, fontWeight: 700, color: '#F5F0E8', letterSpacing: '0.01em',
          }}
        >
          {designContext.menuTitle}
        </span>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A5550' }}>
          {designContext.layoutDirection}
        </span>
      </div>
      <div style={{ marginTop: 4, fontSize: 10, color: '#6A6560', lineHeight: 1.5 }}>
        {designContext.visualStyle} · {designContext.tone}
      </div>
      {menuDNA && (
        <div style={{ marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 9, color: '#4A4540', letterSpacing: '0.08em' }}>
            <span style={{ color: '#5A5550', textTransform: 'uppercase', fontWeight: 700, marginRight: 4 }}>Voice</span>
            {menuDNA.namingStyle} · {menuDNA.descriptionStyle}
          </span>
          <span style={{ fontSize: 9, color: '#4A4540', letterSpacing: '0.08em' }}>
            <span style={{ color: '#5A5550', textTransform: 'uppercase', fontWeight: 700, marginRight: 4 }}>Goal</span>
            {menuDNA.guestExperienceGoal}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Production Intelligence Panel ────────────────────────────────────────────

function SectionDivider({ label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 8px' }}>
      <div style={{ height: 1, flex: 1, background: '#1E1E1E' }} />
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#4A4540', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ height: 1, flex: 1, background: '#1E1E1E' }} />
    </div>
  )
}

function ProdRow({ label, value, muted }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0', borderBottom: '1px solid #141414', gap: 12 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#5A5550', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 10.5, color: muted ? '#5A5550' : '#9A9590', textAlign: 'right', lineHeight: 1.5 }}>{value}</span>
    </div>
  )
}

function ProductionPanel({ production, eventType }) {
  const [open, setOpen] = React.useState(true)

  if (!production) return null

  const {
    productionSheet, bottleEstimate, prepList, garnishList,
    servicePlan, staffingNotes, welcomeDrinkPlan, executionSummary,
    totalDrinks, drinksPerGuest,
  } = production

  return (
    <div
      style={{
        background: '#0D0D0D',
        border: '1px solid #1E1E1E',
        borderRadius: 8,
        overflow: 'hidden',
        marginTop: 4,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '9px 14px',
          borderBottom: '1px solid #1A1A1A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5A5550' }}>
          Production Intelligence
        </span>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3A3A3A', fontSize: 11, padding: 0 }}
        >
          {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Execution summary */}
          <p style={{ fontSize: 11, color: '#9A9590', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 10px' }}>
            {executionSummary}
          </p>

          <ProdRow label="Total drinks" value={`${totalDrinks.toLocaleString()} cocktails`} />
          <ProdRow label="Assumption" value={`${drinksPerGuest} drinks / guest (${eventType})`} muted />

          {/* Welcome drink plan */}
          {welcomeDrinkPlan.required && (
            <>
              <SectionDivider label="Welcome Drink Plan" />
              <ProdRow label="Cocktail"         value={welcomeDrinkPlan.recommendedCocktail} />
              <ProdRow label="Estimated serves" value={`${welcomeDrinkPlan.estimatedServes} serves`} />
              <div style={{ padding: '6px 0 2px', fontSize: 10.5, color: '#9A9590', lineHeight: 1.65 }}>
                {welcomeDrinkPlan.productionNotes}
              </div>
            </>
          )}

          {/* Production sheet */}
          {productionSheet.length > 0 && (
            <>
              <SectionDivider label="Production Sheet" />
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                  <thead>
                    <tr>
                      {['Cocktail', 'Est. Serves', 'Batch?', 'Garnish'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '3px 6px 5px 0', fontSize: 8, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3A3A3A', borderBottom: '1px solid #1E1E1E' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {productionSheet.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #141414' }}>
                        <td style={{ padding: '5px 6px 5px 0', color: '#E8DCC0', fontWeight: 500 }}>{row.cocktailName}</td>
                        <td style={{ padding: '5px 6px 5px 0', color: '#9A9590', fontFamily: '"JetBrains Mono", monospace' }}>{row.expectedServes}</td>
                        <td style={{ padding: '5px 6px 5px 0', color: row.batchRecommended ? '#6BAF80' : '#3A3A3A' }}>
                          {row.batchRecommended ? '✓ Yes' : '—'}
                        </td>
                        <td style={{ padding: '5px 0', color: '#9A9590', fontSize: 10 }}>{row.garnishNeeded}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Bottle estimate */}
          {bottleEstimate.length > 0 && (
            <>
              <SectionDivider label="Bottle Estimate" />
              {bottleEstimate.map((row, i) => (
                <ProdRow
                  key={i}
                  label={row.ingredient}
                  value={`${row.estimatedBottles} × ${row.bottleSizeMl}ml  ·  ${row.estimatedVolumeMl.toLocaleString()}ml total`}
                />
              ))}
              <p style={{ fontSize: 9, color: '#3A3A3A', fontStyle: 'italic', margin: '6px 0 2px' }}>
                Estimates include 10% operational waste. Planning figures only — verify against actual recipes.
              </p>
            </>
          )}

          {/* Prep list */}
          {prepList.length > 0 && (
            <>
              <SectionDivider label="Prep List" />
              {prepList.map((item, i) => (
                <div key={i} style={{ padding: '5px 0', borderBottom: '1px solid #141414' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 10.5, color: '#E8DCC0', fontWeight: 500 }}>{item.item}</span>
                    <span style={{ fontSize: 10, color: '#9A9590', fontFamily: '"JetBrains Mono", monospace', flexShrink: 0 }}>
                      ~{item.estimatedMl.toLocaleString()}ml
                    </span>
                  </div>
                  <div style={{ fontSize: 9, color: '#5A5550', marginTop: 2 }}>{item.timing}</div>
                  <div style={{ fontSize: 9, color: '#3A3A3A', marginTop: 1 }}>
                    Used in: {item.cocktails.join(', ')}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Garnish totals */}
          {garnishList.length > 0 && (
            <>
              <SectionDivider label="Garnish Totals" />
              {garnishList.map((g, i) => (
                <ProdRow
                  key={i}
                  label={g.label}
                  value={`~${g.quantity} units  ·  ${g.cocktailNames.join(', ')}`}
                />
              ))}
              <p style={{ fontSize: 9, color: '#3A3A3A', fontStyle: 'italic', margin: '6px 0 2px' }}>
                Includes 8% buffer for prep loss. Planning figures only — adjust to your prep yields.
              </p>
            </>
          )}

          {/* Staffing notes */}
          {staffingNotes.length > 0 && (
            <>
              <SectionDivider label="Staffing Notes" />
              {staffingNotes.map((note, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid #141414' }}>
                  <span style={{ color: '#C9A96E', flexShrink: 0, fontSize: 10 }}>·</span>
                  <span style={{ fontSize: 10.5, color: '#9A9590', lineHeight: 1.55 }}>{note}</span>
                </div>
              ))}
            </>
          )}

          {/* Service plan */}
          {servicePlan.length > 0 && (
            <>
              <SectionDivider label="Service Plan" />
              {servicePlan.map((note, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', borderBottom: '1px solid #141414' }}>
                  <span style={{ color: '#5A5550', flexShrink: 0, fontSize: 10 }}>·</span>
                  <span style={{ fontSize: 10.5, color: '#9A9590', lineHeight: 1.55 }}>{note}</span>
                </div>
              ))}
            </>
          )}

        </div>
      )}
    </div>
  )
}

// ── Cocktail card (no cost display) ──────────────────────────────────────────

function MenuCocktailCard({
  cocktail, index,
  isReplacing, replaceLoading, replaceInstruction, replaceError,
  onStartReplace, onCancelReplace, onInstructionChange, onSubmitReplace,
}) {
  if (replaceLoading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center justify-center min-h-36 gap-3">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <p className="text-sm text-zinc-300">Building replacement cocktail…</p>
        </div>
      </div>
    )
  }

  if (isReplacing) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-3">
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-500/70">
          Replace Cocktail #{index + 1}
        </p>
        <p className="text-xs text-zinc-600">Replacing: {cocktail.name}</p>
        {replaceError && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-2">
            {replaceError}
          </p>
        )}
        <input
          type="text"
          autoFocus
          placeholder="e.g. something more floral, a rum-based option, lighter…"
          value={replaceInstruction}
          onChange={e => onInstructionChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onSubmitReplace() } }}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSubmitReplace}
            disabled={!replaceInstruction.trim()}
            className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-xs font-medium transition-colors"
          >
            {replaceError ? 'Try again' : 'Generate replacement'}
          </button>
          <button
            type="button"
            onClick={onCancelReplace}
            className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-2">
      <div className="flex items-start justify-between">
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-amber-500/70">
          Cocktail #{index + 1}
        </p>
        <button
          type="button"
          onClick={onStartReplace}
          className="text-xs text-zinc-600 hover:text-amber-400 transition-colors"
        >
          Replace ↺
        </button>
      </div>

      <p className="text-xl font-light text-white">{cocktail.name}</p>
      {cocktail.tagline && (
        <p className="text-sm italic text-zinc-400">{cocktail.tagline}</p>
      )}

      <div className="border-t border-zinc-800 pt-2" />

      {cocktail.base_spirit && (
        <span className="inline-block bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full">
          {cocktail.base_spirit}
        </span>
      )}

      {Array.isArray(cocktail.ingredients) && cocktail.ingredients.length > 0 && (
        <ul className="space-y-0.5 mt-1">
          {cocktail.ingredients.map((ing, i) => {
            const isObj  = typeof ing === 'object' && ing !== null
            const label  = isObj
              ? `${ing.name}${ing.amount_ml != null ? ` — ${ing.amount_ml}${ing.unit || 'ml'}` : ''}`
              : ing
            return (
              <li key={i} className="text-sm text-zinc-300 flex gap-2">
                <span className="text-zinc-600">·</span>{label}
              </li>
            )
          })}
        </ul>
      )}

      {(cocktail.method || cocktail.garnish) && (
        <p className="text-xs text-zinc-500 mt-1">
          {[cocktail.method, cocktail.garnish && `Garnish: ${cocktail.garnish}`].filter(Boolean).join(' — ')}
        </p>
      )}

      {cocktail.glassware && (
        <span className="inline-block text-xs text-zinc-400 bg-zinc-800 rounded-full px-2 py-0.5">
          {cocktail.glassware}
        </span>
      )}

      {cocktail.flavor_notes && (
        <p className="text-xs text-amber-300/80 mt-1">{cocktail.flavor_notes}</p>
      )}

      {cocktail.allergen_notes && cocktail.allergen_notes !== 'null' && (
        <p className="text-xs text-red-300/70 mt-1">{cocktail.allergen_notes}</p>
      )}

      {cocktail.service_speed && (
        <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${
          cocktail.service_speed === 'fast' ? 'bg-emerald-900/40 text-emerald-400' :
          cocktail.service_speed === 'slow' ? 'bg-red-900/40 text-red-400' :
          'bg-zinc-800 text-zinc-400'
        }`}>
          {cocktail.service_speed === 'fast' ? '⚡ Fast service'
           : cocktail.service_speed === 'slow' ? '⏳ Slow service'
           : '⏱ Medium service'}
        </span>
      )}

      {cocktail.batch_notes && cocktail.batch_notes !== 'null' && (
        <p className="text-xs text-zinc-500 mt-1">{cocktail.batch_notes}</p>
      )}

      {cocktail.why_fits_event && cocktail.why_fits_event !== 'null' && (
        <p className="text-xs text-zinc-500 italic mt-1">{cocktail.why_fits_event}</p>
      )}

      {cocktail.zero_proof_alternative && cocktail.zero_proof_alternative !== 'null' && (
        <p className="text-xs text-zinc-400 mt-1">Zero-proof: {cocktail.zero_proof_alternative}</p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EventBriefMenuGenerator({
  event,
  brief,
  designContext,
  tasks,
  currentUser,
  onUpdateTask,
  onApproved,
  onClose,
  onMenuStatusChange,
}) {
  const [menu, setMenu]                   = useState(null)
  const [loadingMenu, setLoadingMenu]     = useState(true)
  const [form, setForm]                   = useState(() => initFormFromBrief(brief, event))
  const [showForm, setShowForm]           = useState(false)
  const [generating, setGenerating]       = useState(false)
  const [approving, setApproving]         = useState(false)
  const [approved, setApproved]           = useState(false)
  const [error, setError]                 = useState(null)
  const [replacingIndex, setReplacingIndex]   = useState(null)
  const [replaceInstruction, setReplaceInstruction] = useState('')
  const [replacingLoading, setReplacingLoading]     = useState(false)
  const [replaceError, setReplaceError]             = useState(null)

  const emptyHeadline = EMPTY_HEADLINE[event?.event_type] || EMPTY_HEADLINE.other
  const emptyBtnLabel = EMPTY_BTN_LABEL[event?.event_type] || EMPTY_BTN_LABEL.other

  const { menuDNA } = useMemo(
    () => buildEventMenuDNA({ event, brief, designContext }),
    [event, brief, designContext]
  )

  const production = useMemo(
    () => approved && menu
      ? buildEventCocktailProduction({
          event,
          approvedMenu:  menu,
          guestCount:    event?.expected_guests || 0,
          designContext,
          menuDNA,
        })
      : null,
    [approved, menu, event, designContext, menuDNA]
  )

  // Section headers: use live menu's sections first, fall back to DNA sections
  const sectionHeaders = menu?.menu_sections || menuDNA?.menuSections || null
  const showSections   = hasValidSections(menu, sectionHeaders)

  useEffect(() => {
    fetchCocktailMenu(event.id)
      .then(data => {
        if (data.menu) {
          setMenu({
            ...data.menu,
            cocktails: enrichCocktailsWithCost(data.menu.cocktails || []),
          })
          const isApproved = data.menu.status === 'approved'
          setApproved(isApproved)
          onMenuStatusChange?.({
            status:    isApproved ? 'approved' : 'draft',
            menuName:  data.menu.menu_name || null,
            cocktails: isApproved ? data.menu.cocktails || [] : null,
          })
        } else {
          onMenuStatusChange?.({ status: 'none', menuName: null })
        }
      })
      .catch(() => {
        onMenuStatusChange?.({ status: 'none', menuName: null })
      })
      .finally(() => setLoadingMenu(false))
  }, [event.id])

  function setField(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleGenerate(e) {
    e.preventDefault()
    setError(null)
    setGenerating(true)
    setShowForm(false)

    try {
      const { menu: generatedMenu } = await generateEventMenu({
        event,
        form,
        designContext,
        menuDNA,
      })

      const saved = await apiPost(`/api/events/${event.id}/cocktail-menu`, {
        menu_name: generatedMenu.menu_name,
        cocktails: generatedMenu.cocktails,
      })
      setMenu({
        ...saved.menu,
        cocktails: enrichCocktailsWithCost(saved.menu.cocktails || []),
      })
      onMenuStatusChange?.({ status: 'draft', menuName: saved.menu.menu_name || null })
    } catch (err) {
      setError(err.message || 'AI generation unavailable. No menu was created. Try again, or check back shortly.')
      setShowForm(true)
    } finally {
      setGenerating(false)
    }
  }

  async function handleApprove() {
    setApproving(true)
    setError(null)
    try {
      await apiPatch(`/api/events/${event.id}/cocktail-menu/approve`, {})

      // Approval confirmed — mark UI as approved immediately before task update
      setApproved(true)
      onMenuStatusChange?.({
        status:    'approved',
        menuName:  menu?.menu_name || null,
        cocktails: menu?.cocktails || [],
      })
      if (onApproved) onApproved()

      // Fire internal notifications to Owner and F&B Director
      notifyCocktailMenuApproved({
        event,
        brief,
        approvedBy: currentUser?.name || currentUser?.role || 'Events Manager',
      })

      // Best-effort task update: failure here must NOT revert the approved state
      const cocktailTask = tasks?.find(t => t.title?.startsWith('Build cocktail menu'))
      if (cocktailTask && onUpdateTask) {
        try {
          await onUpdateTask(event.id, cocktailTask.id, { status: 'done' })
        } catch {
          // Task update failed non-critically — menu is already approved on the server
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to approve menu.')
    } finally {
      setApproving(false)
    }
  }

  async function handleSubmitReplace(index) {
    setReplacingLoading(true)
    setReplaceError(null)

    try {
      const { cocktail: newCocktail } = await replaceEventCocktail({
        event, menu, index, replaceInstruction, form,
      })

      const updatedCocktails = menu.cocktails.map((c, i) => i === index ? newCocktail : c)
      const saved = await apiPost(`/api/events/${event.id}/cocktail-menu`, {
        menu_name: menu.menu_name,
        cocktails: updatedCocktails,
      })
      setMenu({
        ...saved.menu,
        cocktails: enrichCocktailsWithCost(saved.menu.cocktails || []),
      })
      setApproved(false)
      setReplacingIndex(null)
      setReplaceInstruction('')
    } catch (err) {
      setReplaceError(err.message || 'Failed to generate replacement. Try again.')
    } finally {
      setReplacingLoading(false)
    }
  }

  if (loadingMenu) return null

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Event Cocktail Menu</p>
          {approved && (
            <span className="text-xs text-amber-400 font-medium">✓ Approved</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {menu && !generating && !approved && (
            <button
              type="button"
              onClick={() => { setMenu(null); setApproved(false); setShowForm(true); setError(null); onMenuStatusChange?.({ status: 'none', menuName: null }) }}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Rebuild menu
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              ✕ Close
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Design context + DNA identity badge */}
        <DesignContextBadge designContext={designContext} menuDNA={menuDNA} />

        {/* Generating state */}
        {generating && (
          <div className="text-center py-8 space-y-3">
            <div className="flex items-center justify-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-sm text-zinc-300">
                HESTIA AI is building your cocktail menu for{' '}
                <span className="text-white font-medium">{designContext?.menuTitle || event.name}</span>…
              </p>
            </div>
            <p className="text-xs text-zinc-600">This usually takes 10–20 seconds</p>
          </div>
        )}

        {/* Error */}
        {error && !generating && (
          <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        {/* No menu — start prompt or form */}
        {!menu && !generating && (
          !showForm ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-zinc-300">{emptyHeadline}</p>
              <p className="text-xs text-zinc-600">Pre-filled from the event brief — adjust before generating if needed.</p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
              >
                {emptyBtnLabel}
              </button>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-5">
              <p className="text-xs text-zinc-600">
                Pre-filled from the event brief — adjust if needed before generating.
              </p>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">
                  Number of cocktails
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={form.cocktailCount}
                  onChange={e => setField('cocktailCount', Number(e.target.value))}
                  className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">
                  Flavor profile
                </label>
                <PillSelect
                  options={FLAVOR_PILLS}
                  selected={form.flavors}
                  onChange={v => setField('flavors', v)}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">
                  Dietary &amp; requirements
                </label>
                <PillSelect
                  options={RESTRICTION_PILLS}
                  selected={form.restrictions}
                  onChange={v => setField('restrictions', v)}
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">
                  Event vibe
                </label>
                <input
                  type="text"
                  value={form.vibe}
                  onChange={e => setField('vibe', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-2">
                  Notes <span className="text-zinc-600 normal-case">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
                >
                  Generate Menu
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null) }}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )
        )}

        {/* Menu cards */}
        {menu && !generating && (
          <>
            {menu.menu_name && (
              <div className="text-center pb-1">
                <p
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: 20, fontWeight: 700, color: '#F5F0E8',
                    letterSpacing: '0.02em',
                  }}
                >
                  {menu.menu_name}
                </p>
                {sectionHeaders && (
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1">
                    {sectionHeaders.join(' · ')}
                  </p>
                )}
              </div>
            )}

            {/* Sectioned layout (when AI assigned sections) or flat grid (backward compat) */}
            {showSections ? (
              <div className="space-y-6">
                {groupCocktailsBySections(menu.cocktails, sectionHeaders).map((group, gi) => (
                  <div key={gi} className="space-y-3">
                    {group.section && (
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-zinc-800" />
                        <span className="text-[9px] font-black uppercase tracking-[0.22em] text-amber-500/60 whitespace-nowrap">
                          {group.section}
                        </span>
                        <div className="h-px flex-1 bg-zinc-800" />
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {group.cocktails.map(cocktail => {
                        const i = menu.cocktails.indexOf(cocktail)
                        return (
                          <MenuCocktailCard
                            key={cocktail.number ?? i}
                            cocktail={cocktail}
                            index={i}
                            isReplacing={replacingIndex === i}
                            replaceLoading={replacingLoading && replacingIndex === i}
                            replaceInstruction={replacingIndex === i ? replaceInstruction : ''}
                            replaceError={replacingIndex === i ? replaceError : null}
                            onStartReplace={() => { setReplacingIndex(i); setReplaceInstruction(''); setReplaceError(null) }}
                            onCancelReplace={() => { setReplacingIndex(null); setReplaceInstruction(''); setReplaceError(null) }}
                            onInstructionChange={setReplaceInstruction}
                            onSubmitReplace={() => handleSubmitReplace(i)}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {menu.cocktails.map((cocktail, i) => (
                  <MenuCocktailCard
                    key={i}
                    cocktail={cocktail}
                    index={i}
                    isReplacing={replacingIndex === i}
                    replaceLoading={replacingLoading && replacingIndex === i}
                    replaceInstruction={replacingIndex === i ? replaceInstruction : ''}
                    replaceError={replacingIndex === i ? replaceError : null}
                    onStartReplace={() => { setReplacingIndex(i); setReplaceInstruction(''); setReplaceError(null) }}
                    onCancelReplace={() => { setReplacingIndex(null); setReplaceInstruction(''); setReplaceError(null) }}
                    onInstructionChange={setReplaceInstruction}
                    onSubmitReplace={() => handleSubmitReplace(i)}
                  />
                ))}
              </div>
            )}

            {approved ? (
              <>
                <p className="text-center text-sm text-emerald-400 font-medium py-2">
                  Menu approved and saved to this event ✓
                </p>
                <ProductionPanel production={production} eventType={event?.event_type || 'other'} />
              </>
            ) : (
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white text-sm font-medium transition-colors"
              >
                {approving ? 'Approving…' : 'Approve Menu for This Event'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
