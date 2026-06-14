// CI MODULE ADDITION — Cocktail Intelligence main dashboard
import { useState, useCallback } from 'react'
import { patchMenuVisible } from '../../services/api/cocktailIntelligenceApi'
import { BarDNACard } from './BarDNACard'
import { MenuGenerator } from './MenuGenerator'
import { MenuAudit } from './MenuAudit' // CI MODULE ADDITION — Flow 2
import { BeverageDirector } from './BeverageDirector'
import { MenuMargin } from './MenuMargin'
import { NarrativeIntelligence } from './NarrativeIntelligence'
import { VisualMenuBuilder } from './VisualMenuBuilder'
import { SalesTracker } from './SalesTracker'
import { DailyClose } from './DailyClose'
import { RejectionMemory } from './RejectionMemory'
import { CocktailExports } from './CocktailExports'
import { CIErrorBoundary } from './CIErrorBoundary'

function formatDate(str) {
  if (!str) return ''
  try {
    return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '' }
}

function formatIngredients(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return null
  return ingredients
    .map(ing => {
      if (typeof ing === 'string') return ing
      if (!ing) return ''
      const amount = ing.amount ? String(ing.amount).trim() : ''
      const unit   = ing.unit   ? String(ing.unit).trim()   : ''
      const name   = ing.name   ? String(ing.name).trim()   : ''
      return [(amount + unit).trim(), name].filter(Boolean).join(' ')
    })
    .filter(Boolean)
    .join(' · ')
}

function formatMethodLine(c) {
  const glass = c.glass_type || c.glass
  return [
    c.method,
    glass,
    c.garnish ? 'Garnish: ' + c.garnish : null
  ].filter(Boolean).join(' · ')
}

function LibraryCard({ cocktail }) {
  const tags   = Array.isArray(cocktail.tags) ? cocktail.tags.slice(0, 2) : []
  const status = (cocktail.lifecycle_status || 'active').toLowerCase()
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1)
  const statusStyle = status === 'archived'
    ? 'border-[#6b705c]/20 text-[#6b705c]'
    : status === 'seasonal'
    ? 'border-amber-500/20 text-amber-400'
    : 'border-emerald-500/20 text-emerald-400'
  const date = cocktail.created_at || cocktail.approved_at || cocktail.saved_at
  const gp   = cocktail.estimated_gp_percent
  const gpColor = gp >= 70 ? 'text-emerald-400' : gp >= 55 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="rounded-2xl border border-[#6b705c]/10 bg-[#1a1a1a]/60 p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#f5f5f0] truncate">{cocktail.name}</p>
          {date && <p className="text-[10px] text-[#6b705c] mt-0.5">{formatDate(date)}</p>}
        </div>
        <span className="shrink-0 rounded-full border border-[#6b705c]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#c9a96e]/70">
          {cocktail.base_spirit || '—'}
        </span>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((t, i) => (
            <span key={i} className="rounded-full bg-[#6b705c]/15 px-2 py-0.5 text-[10px] text-[#e8dcc0]/50">
              {typeof t === 'string' ? t : String(t)}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${statusStyle}`}>
          {statusLabel}
        </span>
        <div className="flex items-center gap-3 text-[10px]">
          {cocktail.estimated_cost_ils && (
            <span className="text-[#6b705c]">₪{cocktail.estimated_cost_ils} est.</span>
          )}
          {gp != null && (
            <span className={`font-semibold ${gpColor}`}>{gp}% GP</span>
          )}
        </div>
      </div>
    </div>
  )
}

function CocktailLibrary({ cocktails }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">Cocktail Library</span>
        <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-2 py-0.5 text-[9px] text-[#c9a96e]">
          {cocktails.length} saved
        </span>
      </div>
      {cocktails.length === 0 ? (
        <div className="rounded-2xl border border-[#6b705c]/10 bg-[#1a1a1a]/30 px-6 py-10 text-center">
          <p className="text-sm text-[#6b705c]">No cocktails saved yet.</p>
          <p className="text-xs text-[#6b705c]/60 mt-1">Generate and approve a menu to build your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {cocktails.map((c, i) => (
            <LibraryCard key={c.id || c.name || i} cocktail={c} />
          ))}
        </div>
      )}
    </div>
  )
}

const MODULES = [
  {
    id: 'menu_generator',
    title: 'Menu Generator',
    subtitle: 'Full menu, audits, and signature drinks',
    icon: '✦',
    live: true
  },
  {
    id: 'rejection_memory',
    title: 'Rejection Memory',
    subtitle: 'Log cocktails that never landed',
    icon: '⊘',
    live: true
  },
  {
    id: 'beverage_director',
    title: 'Beverage Director',
    subtitle: 'Strategic AI briefings for your program',
    icon: '◈',
    live: true
  },
  {
    id: 'menu_margin',
    title: 'Menu Margin',
    subtitle: 'Cost, price, and GP for every cocktail',
    icon: '◑',
    live: true
  },
  {
    id: 'lifecycle',
    title: 'Lifecycle Manager',
    subtitle: 'Track every cocktail from concept to archive',
    icon: '◎'
  },
  {
    id: 'narratives',
    title: 'Narrative Intelligence',
    subtitle: 'Generate storytelling for each cocktail',
    icon: '❝',
    live: true
  },
  {
    id: 'visual_menu',
    title: 'Visual Menu Builder',
    subtitle: 'AI-generated cocktail photography for every menu',
    icon: '◫',
    live: true
  },
  {
    id: 'scoring',
    title: 'Scoring System',
    subtitle: 'Rate and benchmark cocktail performance',
    icon: '◐'
  },
  {
    id: 'signature_engine',
    title: 'Signature Drink Engine',
    subtitle: 'Bespoke hero cocktails for your identity',
    icon: '✧'
  },
  {
    id: 'sales_tracker',
    title: 'Sales Tracker',
    subtitle: 'Revenue and volume by cocktail',
    icon: '⬡',
    live: true
  },
  {
    id: 'daily_close',
    title: 'Daily close',
    subtitle: 'Log cocktail units sold at end of shift',
    icon: '◷',
    live: true
  },
  {
    id: 'trends',
    title: 'Trends Engine',
    subtitle: 'Israeli and global market intelligence',
    icon: '⤴'
  },
  {
    id: 'exports',
    title: 'Exports',
    subtitle: 'Guest menus, spec sheets, costing, and reports',
    icon: '⬇',
    live: true
  }
]

function DNASummaryStrip({ dna, dnaLoading }) {
  if (dnaLoading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#6b705c]/10 bg-[#1a1a1a]/60 px-5 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#6b705c] animate-pulse" />
        <span className="text-xs text-[#6b705c]">Loading bar profile…</span>
      </div>
    )
  }
  if (!dna) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-5 py-3">
        <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]" />
        <span className="text-xs text-[#c9a96e]">Bar DNA not configured — complete setup below to unlock all modules</span>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#6b705c]/10 bg-[#1a1a1a]/60 px-5 py-3">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]" />
        <span className="text-xs font-bold text-[#c9a96e]">{dna.bar_name || dna.venue_name}</span>
      </div>
      {dna.signature_style && <span className="text-xs text-[#e8dcc0]/60">{dna.signature_style}</span>}
      {dna.price_tier && (
        <span className="rounded-full border border-[#6b705c]/20 px-2 py-0.5 text-[10px] text-[#6b705c]">{dna.price_tier}</span>
      )}
      {(dna.hero_ingredients || dna.hero_ingredient) && (
        <span className="text-xs text-[#e8dcc0]/50 hidden lg:inline">
          Hero: {(dna.hero_ingredients || dna.hero_ingredient || '').split(',').slice(0, 3).map(s => s.trim()).join(', ')}
        </span>
      )}
      {dna.kosher_aware && (
        <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[10px] text-amber-400">Kosher-aware</span>
      )}
    </div>
  )
}

// ── CI MODULE ADDITION — Menu-first library components ───────────────────────

const OCCASION_LABELS = {
  regular:       'Regular Menu',
  seasonal:      'Seasonal',
  event:         'Event',
  wedding:       'Wedding',
  private_event: 'Private Event',
  opening:       'Opening Menu',
  regular_menu:  'Regular Menu'
}

function MenuCard({ menu, onView, onToggleVisible }) {
  const occasion = OCCASION_LABELS[menu.occasion] || menu.occasion || 'Menu'
  const count    = menu.cocktail_count ?? 0
  const previews = Array.isArray(menu.preview_names) ? menu.preview_names : []
  const date     = menu.created_at || ''

  return (
    <div className="rounded-2xl border border-[#6b705c]/15 bg-gradient-to-br from-[#1a1a1a] to-[#0d0c09] p-5 flex flex-col gap-3 hover:border-[#c9a96e]/25 transition group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#c9a96e]/70">
          {occasion}
        </span>
        {date && (
          <span className="text-[10px] text-[#6b705c] shrink-0">{formatDate(date)}</span>
        )}
      </div>

      {/* Menu name */}
      <div>
        <h3 className="text-base font-bold text-[#f5f5f0] leading-snug group-hover:text-[#e8dcc0] transition">
          {menu.name}
        </h3>
        {menu.description && (
          <p className="mt-1 text-xs text-[#6b705c] leading-relaxed line-clamp-2">
            {menu.description}
          </p>
        )}
      </div>

      {/* Cocktail count + preview names */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6b705c]">
          {count} cocktail{count !== 1 ? 's' : ''}
        </p>
        {previews.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {previews.map((name, i) => (
              <span key={i} className="rounded-full bg-[#6b705c]/10 px-2 py-0.5 text-[10px] text-[#e8dcc0]/50">
                {name}
              </span>
            ))}
            {count > previews.length && (
              <span className="text-[10px] text-[#6b705c]">+{count - previews.length} more</span>
            )}
          </div>
        )}
      </div>

      {/* View button */}
      <button
        onClick={() => onView(menu)}
        className="mt-auto rounded-xl border border-[#c9a96e]/20 py-2 text-xs font-bold text-[#c9a96e]/70 transition hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/5 hover:text-[#c9a96e]"
      >
        View Menu →
      </button>
      {onToggleVisible && (
        <label className="flex items-center justify-between gap-2 mt-1 cursor-pointer" onClick={e => e.stopPropagation()}>
          <span className="text-[10px] text-[#6b705c]">Visible to staff</span>
          <div
            onClick={() => onToggleVisible(menu.id, !menu.visible_to_staff)}
            className={`relative inline-flex h-4 w-7 items-center rounded-full transition cursor-pointer ${menu.visible_to_staff ? 'bg-emerald-500/70' : 'bg-[#6b705c]/30'}`}
          >
            <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition ${menu.visible_to_staff ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
          </div>
        </label>
      )}
    </div>
  )
}

function MenuLibrary({ menus, onView, onToggleVisible }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">My Menus</span>
        <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-2 py-0.5 text-[9px] text-[#c9a96e]">
          {menus.length} saved
        </span>
      </div>
      {menus.length === 0 ? (
        <div className="rounded-2xl border border-[#6b705c]/10 bg-[#1a1a1a]/30 px-6 py-10 text-center">
          <p className="text-sm text-[#6b705c]">No menus yet.</p>
          <p className="text-xs text-[#6b705c]/60 mt-1">Generate and approve your first cocktail menu to build your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menus.map((m, i) => (
            <MenuCard key={m.id || i} menu={m} onView={onView} onToggleVisible={onToggleVisible} />
          ))}
        </div>
      )}
    </div>
  )
}

function MenuDetailView({ menu, cocktails, onBack, dna, onAuditMenu }) {
  const occasion      = OCCASION_LABELS[menu.occasion] || menu.occasion || ''
  const menuCocktails = cocktails.filter(c => c.menu_id === menu.id)
  const venueName     = dna?.bar_name || dna?.venue_name || ''

  const costs  = menuCocktails.map(c => Number(c.estimated_cost_ils)).filter(n => !isNaN(n) && n > 0)
  const avgCost = costs.length ? Math.round(costs.reduce((a, b) => a + b, 0) / costs.length) : null

  function buildAuditText() {
    if (menuCocktails.length === 0) return ''
    return menuCocktails.map(c => {
      const spirit = c.base_spirit || ''
      const ings = Array.isArray(c.ingredients)
        ? c.ingredients.map(ing => {
            if (typeof ing === 'string') return ing
            if (!ing) return ''
            const amount = ing.amount ? String(ing.amount).trim() : ''
            const unit   = ing.unit   ? String(ing.unit).trim()   : ''
            const name   = ing.name   ? String(ing.name).trim()   : ''
            return [(amount + unit).trim(), name].filter(Boolean).join(' ')
          }).filter(Boolean)
        : []
      const parts = [spirit, ...ings].filter(Boolean)
      return `${c.name} — ${parts.join(', ')}`
    }).join('\n')
  }

  return (
    <div className="mb-10 max-w-2xl">

      {/* ── Back link ──────────────────────────────────────────────────────── */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-1.5 text-xs text-[#6b705c] hover:text-[#c9a96e] transition"
      >
        ← Back to Library
      </button>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {occasion && (
            <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#c9a96e]/70">
              {occasion}
            </span>
          )}
          {menu.created_at && (
            <span className="text-[10px] text-[#6b705c]">{formatDate(menu.created_at)}</span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-[#f5f5f0] tracking-tight leading-tight mb-2">
          {menu.name}
        </h1>

        {menu.description && (
          <p className="text-sm text-[#e8dcc0]/55 italic leading-relaxed mb-3">
            {menu.description}
          </p>
        )}

        {venueName && (
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#6b705c]">
            {venueName}
          </p>
        )}
      </div>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <div className="border-t border-[#c9a96e]/25 mb-8" />

      {/* ── Cocktail entries ───────────────────────────────────────────────── */}
      {menuCocktails.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-[#6b705c]">Cocktails are being saved — refresh to see them here.</p>
        </div>
      ) : (
        <div>
          {menuCocktails.map((c, i) => {
            const tags        = Array.isArray(c.tags) ? c.tags.slice(0, 4) : []
            const ingredients = formatIngredients(c.ingredients)
            const methodLine  = formatMethodLine(c)
            const isLast      = i === menuCocktails.length - 1

            return (
              <div key={c.id || i}>
                <div className="py-5">

                  {/* Name ··· Spirit/Price row */}
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-[#f5f5f0] shrink-0 leading-snug pb-[2px]">
                      {c.name}
                    </span>
                    <div className="flex-1 border-b border-dotted border-[#6b705c]/30 mb-[4px]" />
                    <div className="flex items-baseline gap-3 shrink-0">
                      {c.base_spirit && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#c9a96e]/65">
                          {c.base_spirit}
                        </span>
                      )}
                      {c.estimated_cost_ils && (
                        <span className="text-xs text-[#6b705c]">₪{c.estimated_cost_ils}</span>
                      )}
                      {c.estimated_gp_percent != null && (
                        <span className="text-[10px] text-emerald-400/60">{c.estimated_gp_percent}% GP</span>
                      )}
                    </div>
                  </div>

                  {/* Tagline */}
                  {c.description && (
                    <p className="text-[13px] text-[#e8dcc0]/45 italic leading-snug mb-2.5">
                      {c.description}
                    </p>
                  )}

                  {/* Flavor tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tags.map((t, ti) => (
                        <span
                          key={ti}
                          className="rounded-full border border-[#6b705c]/15 px-2 py-0.5 text-[10px] text-[#e8dcc0]/35"
                        >
                          {typeof t === 'string' ? t : String(t)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Ingredients */}
                  {ingredients && (
                    <p className="text-[11px] text-[#6b705c] leading-relaxed mb-1">
                      {ingredients}
                    </p>
                  )}

                  {/* Method · Glass · Garnish */}
                  {methodLine && (
                    <p className="text-[11px] text-[#6b705c]/50 leading-relaxed">
                      {methodLine}
                    </p>
                  )}
                </div>

                {!isLast && <div className="border-t border-[#6b705c]/10" />}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="border-t border-[#c9a96e]/25 mt-8 pt-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-5">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#6b705c]">
            {menuCocktails.length} cocktail{menuCocktails.length !== 1 ? 's' : ''}
          </span>
          {avgCost && (
            <span className="text-[10px] text-[#6b705c]">Avg. est. cost ₪{avgCost}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl border border-[#6b705c]/25 px-4 py-2 text-xs text-[#f5f5f0]/55 transition hover:border-[#c9a96e]/35 hover:text-[#c9a96e]">
            Edit Menu Name
          </button>
          {onAuditMenu && menuCocktails.length > 0 && (
            <button
              onClick={() => onAuditMenu(buildAuditText())}
              className="rounded-xl border border-[#c9a96e]/30 px-4 py-2 text-xs text-[#c9a96e]/70 transition hover:border-[#c9a96e]/60 hover:bg-[#c9a96e]/5 hover:text-[#c9a96e]"
            >
              Audit This Menu
            </button>
          )}
          <button
            disabled
            title="Coming Soon"
            className="rounded-xl border border-[#6b705c]/15 px-4 py-2 text-xs text-[#6b705c]/35 cursor-not-allowed"
          >
            Export Menu
          </button>
        </div>
      </div>

    </div>
  )
}

function ModuleCard({ mod, onOpen }) {
  const isUrgent = mod.urgent
  const isLive   = mod.live
  return (
    <button
      onClick={() => isLive || isUrgent ? onOpen(mod.id) : undefined}
      className={`text-left flex flex-col gap-2 rounded-2xl border p-5 transition w-full
        ${isUrgent
          ? 'border-red-500/30 bg-red-950/20 hover:border-red-400/50 hover:bg-red-900/20 cursor-pointer'
          : isLive
          ? 'border-[#c9a96e]/20 bg-[#c9a96e]/5 hover:border-[#c9a96e]/40 cursor-pointer'
          : 'border-[#6b705c]/10 bg-[#0d0c09]/40 cursor-default'
        }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-lg ${isUrgent ? 'text-red-400' : isLive ? 'text-[#c9a96e]' : 'text-[#c9a96e]/40'}`}>{mod.icon}</span>
        {isLive ? (
          <span className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#c9a96e]">
            Live
          </span>
        ) : (
          <span className="rounded-full border border-[#6b705c]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#6b705c]">
            Module 2+
          </span>
        )}
      </div>
      <div>
        <div className={`text-sm font-semibold ${isUrgent ? 'text-red-300' : isLive ? 'text-[#f5f5f0]' : 'text-[#f5f5f0]/60'}`}>{mod.title}</div>
        <div className="mt-0.5 text-xs text-[#6b705c] leading-snug">{mod.subtitle}</div>
      </div>
    </button>
  )
}

export function CocktailIntelligenceDashboard({ cocktailIntelligence }) {
  const {
    dna, dnaLoading, dnaError, savingDna, ciCocktails,
    updateDna, generateMenu, regenerateSingle, approveMenuCocktail, saveMenuRejection,
    auditMenu,          // CI MODULE ADDITION — Flow 2
    ciMenus,            // CI MODULE ADDITION — named menus
    createMenuRecord,   // CI MODULE ADDITION
    refreshMenus,       // CI MODULE ADDITION
    sendDirectorMessage,
    loadMenuDetail
  } = cocktailIntelligence

  const [activeModule, setActiveModule] = useState(null)
  const [menuFlow, setMenuFlow]         = useState('flow1') // CI MODULE ADDITION — 'flow1' | 'flow2'
  const [selectedMenu, setSelectedMenu] = useState(null)   // CI MODULE ADDITION — menu detail view
  const [prefilledMenu, setPrefilledMenu] = useState(null) // CI MODULE ADDITION — audit prefill from detail view

  function handleAuditMenu(auditText) {
    setPrefilledMenu(auditText)
    setSelectedMenu(null)
    setActiveModule('menu_generator')
    setMenuFlow('flow2')
  }

  const handleToggleMenuVisible = useCallback(async (menuId, visible) => {
    try {
      await patchMenuVisible(menuId, visible)
      await refreshMenus()
    } catch { /* non-critical */ }
  }, [refreshMenus])

  return (
    <div className="min-h-screen bg-[#0d0c09] px-6 py-8 lg:px-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">HESTIA</span>
            <span className="text-[10px] text-[#6b705c]">×</span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">Cocktail Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-[#f5f5f0]">AI Beverage Director</h1>
          <p className="mt-0.5 text-sm text-[#e8dcc0]/60">
            Menus, narratives, lifecycle, and scoring — all shaped by your bar's DNA.
          </p>
        </div>
      </div>

      {/* Error */}
      {dnaError && (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-300">
          {dnaError}
        </div>
      )}

      {/* DNA Summary Strip — always visible */}
      <div className="mb-8">
        <DNASummaryStrip dna={dna} dnaLoading={dnaLoading} />
      </div>

      {/* ── Active Module ──────────────────────────────────────────────────── */}
      {/* CI MODULE ADDITION — Flow 1 / Flow 2 tab switcher */}
      {activeModule === 'menu_generator' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-0.5">Module 1</div>
              <h2 className="text-lg font-bold text-[#f5f5f0]">AI Beverage Director</h2>
            </div>
            <button
              onClick={() => setActiveModule(null)}
              className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Flow tab switcher */}
          <div className="flex gap-1 rounded-xl border border-[#6b705c]/20 p-1 bg-[#0d0c09]/60 mb-5 max-w-sm">
            <button
              onClick={() => setMenuFlow('flow1')}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition ${
                menuFlow === 'flow1'
                  ? 'bg-[#c9a96e] text-[#0d0c09]'
                  : 'text-[#6b705c] hover:text-[#f5f5f0]'
              }`}
            >
              Flow 1 — Full Menu
            </button>
            <button
              onClick={() => { setMenuFlow('flow2'); setPrefilledMenu(null) }}
              className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition ${
                menuFlow === 'flow2'
                  ? 'bg-[#c9a96e] text-[#0d0c09]'
                  : 'text-[#6b705c] hover:text-[#f5f5f0]'
              }`}
            >
              Flow 2 — Menu Audit
            </button>
          </div>

          {menuFlow === 'flow1' ? (
            <CIErrorBoundary>
              <MenuGenerator
                dna={dna}
                onGenerate={generateMenu}
                onRegenerate={regenerateSingle}
                onApprove={approveMenuCocktail}
                onReject={saveMenuRejection}
                onCreateMenu={createMenuRecord}
                onMenuSaved={refreshMenus}
                onViewLibrary={async () => {
                  await refreshMenus()
                  setActiveModule(null)
                }}
              />
            </CIErrorBoundary>
          ) : (
            <CIErrorBoundary>
              <MenuAudit
                dna={dna}
                onAudit={auditMenu}
                prefilledMenu={prefilledMenu}
                ciMenus={ciMenus}
                ciCocktails={ciCocktails}
              />
            </CIErrorBoundary>
          )}
        </div>
      )}

      {activeModule === 'beverage_director' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-0.5">Module 2</div>
              <h2 className="text-lg font-bold text-[#f5f5f0]">Beverage Director</h2>
              <p className="text-xs text-[#e8dcc0]/50 mt-0.5">Strategic AI briefings for your program</p>
            </div>
            <button
              onClick={() => setActiveModule(null)}
              className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
            >
              ← Back to Dashboard
            </button>
          </div>
          <CIErrorBoundary>
            <BeverageDirector
              dna={dna}
              onSendMessage={sendDirectorMessage}
              ciMenus={ciMenus}
              onLoadMenu={loadMenuDetail}
            />
          </CIErrorBoundary>
        </div>
      )}

      {activeModule === 'rejection_memory' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-0.5">Module 6</div>
              <h2 className="text-lg font-bold text-[#f5f5f0]">Rejection Memory</h2>
              <p className="text-xs text-[#e8dcc0]/50 mt-0.5">What the Beverage Director has learned to avoid</p>
            </div>
            <button
              onClick={() => setActiveModule(null)}
              className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
            >
              ← Back to Dashboard
            </button>
          </div>
          <CIErrorBoundary>
            <RejectionMemory />
          </CIErrorBoundary>
        </div>
      )}

      {activeModule === 'narratives' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-0.5">Module 4</div>
              <h2 className="text-lg font-bold text-[#f5f5f0]">Narrative Intelligence</h2>
              <p className="text-xs text-[#e8dcc0]/50 mt-0.5">Menu copy, server scripts, and story cards for every cocktail</p>
            </div>
            <button
              onClick={() => setActiveModule(null)}
              className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
            >
              ← Back to Dashboard
            </button>
          </div>
          <CIErrorBoundary>
            <NarrativeIntelligence ciMenus={ciMenus} onLoadMenu={loadMenuDetail} />
          </CIErrorBoundary>
        </div>
      )}

      {activeModule === 'visual_menu' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-0.5">Visual Menu</div>
              <h2 className="text-lg font-bold text-[#f5f5f0]">Visual Menu Builder</h2>
              <p className="text-xs text-[#e8dcc0]/50 mt-0.5">AI-generated cocktail photography for every menu</p>
            </div>
            <button
              onClick={() => setActiveModule(null)}
              className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
            >
              ← Back to Dashboard
            </button>
          </div>
          <CIErrorBoundary>
            <VisualMenuBuilder ciMenus={ciMenus} onLoadMenu={loadMenuDetail} />
          </CIErrorBoundary>
        </div>
      )}

      {activeModule === 'sales_tracker' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-0.5">Module 5</div>
              <h2 className="text-lg font-bold text-[#f5f5f0]">Sales Tracker</h2>
              <p className="text-xs text-[#e8dcc0]/50 mt-0.5">Revenue, volume, and menu engineering by cocktail</p>
            </div>
            <button
              onClick={() => setActiveModule(null)}
              className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
            >
              ← Back to Dashboard
            </button>
          </div>
          <CIErrorBoundary>
            <SalesTracker />
          </CIErrorBoundary>
        </div>
      )}

      {activeModule === 'daily_close' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-0.5">Module 8</div>
              <h2 className="text-lg font-bold text-[#f5f5f0]">Daily close</h2>
              <p className="text-xs text-[#e8dcc0]/50 mt-0.5">Log cocktail sales by menu at end of shift</p>
            </div>
            <button
              onClick={() => setActiveModule(null)}
              className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
            >
              ← Back to Dashboard
            </button>
          </div>
          <CIErrorBoundary>
            <DailyClose venueId="venue-main" />
          </CIErrorBoundary>
        </div>
      )}

      {activeModule === 'exports' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-0.5">Module 7</div>
              <h2 className="text-lg font-bold text-[#f5f5f0]">Exports</h2>
              <p className="text-xs text-[#e8dcc0]/50 mt-0.5">Spec sheets, guest menus, staff briefings, and sales reports</p>
            </div>
            <button
              onClick={() => setActiveModule(null)}
              className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
            >
              ← Back to Dashboard
            </button>
          </div>
          <CIErrorBoundary>
            <CocktailExports ciMenus={ciMenus} onLoadMenu={loadMenuDetail} />
          </CIErrorBoundary>
        </div>
      )}

      {activeModule === 'menu_margin' && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-0.5">Module 3</div>
              <h2 className="text-lg font-bold text-[#f5f5f0]">Menu Margin</h2>
              <p className="text-xs text-[#e8dcc0]/50 mt-0.5">Cost, price, and GP for every cocktail</p>
            </div>
            <button
              onClick={() => setActiveModule(null)}
              className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e]"
            >
              ← Back to Dashboard
            </button>
          </div>
          <CIErrorBoundary>
            <MenuMargin ciMenus={ciMenus} onLoadMenu={loadMenuDetail} />
          </CIErrorBoundary>
        </div>
      )}

      {/* ── Bar DNA Card (always visible unless a module or detail is active) ── */}
      {!activeModule && !selectedMenu && (
        <div className="mb-10">
          <BarDNACard dna={dna} saving={savingDna} onSave={updateDna} />
        </div>
      )}

      {/* ── Menu Detail View (CI MODULE ADDITION) ───────────────────────────── */}
      {!activeModule && selectedMenu && (
        <MenuDetailView
          menu={selectedMenu}
          cocktails={ciCocktails || []}
          onBack={() => setSelectedMenu(null)}
          dna={dna}
          onAuditMenu={handleAuditMenu}
        />
      )}

      {/* ── Menu Library — menu-first view (CI MODULE ADDITION) ─────────────── */}
      {!activeModule && !selectedMenu && (
        <MenuLibrary
          menus={ciMenus || []}
          onView={setSelectedMenu}
          onToggleVisible={handleToggleMenuVisible}
        />
      )}

      {/* ── Module Palette (hidden when menu detail is open) ─────────────────── */}
      {!selectedMenu && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">Intelligence Modules</span>
            <span className="rounded-full border border-[#6b705c]/20 px-2 py-0.5 text-[9px] text-[#6b705c]">13 total</span>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {MODULES.map(mod => (
              <ModuleCard
                key={mod.id}
                mod={mod}
                onOpen={setActiveModule}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
