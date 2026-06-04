import { useState, useCallback } from 'react'
import { buildCostSheet } from '../../domain/hospitality/bar/cocktailLabPricingAdapter'

// Convert DB ingredient format { name, amount, unit } → buildCostSheet format { ingredient, amountMl }
function toIngredientsMl(ingredients) {
  return (ingredients || []).map(ing => {
    const amt = parseFloat(ing.amount) || 0
    const unit = (ing.unit || '').toLowerCase().trim()
    let amountMl = 0
    if      (unit === 'ml')                       amountMl = amt
    else if (unit === 'oz')                       amountMl = amt * 29.574
    else if (unit === 'cl')                       amountMl = amt * 10
    else if (unit === 'tsp')                      amountMl = amt * 5
    else if (unit === 'tbsp')                     amountMl = amt * 15
    else if (unit === 'dash' || unit === 'dashes') amountMl = amt * 0.5
    else if (unit === 'drop' || unit === 'drops') amountMl = amt * 0.05
    // leaves, sprigs, slices → amountMl stays 0, filtered by buildCostSheet
    return { ingredient: ing.name || '', amountMl }
  })
}

function computeMargin(cocktail) {
  const sheet = buildCostSheet(toIngredientsMl(cocktail.ingredients))
  const cost  = Math.round(sheet.total_production_cost_nis * 10) / 10
  const price = Math.round(sheet.suggested * 10) / 10
  const gpIls = Math.round((price - cost) * 10) / 10
  const gpPct = price > 0 ? Math.round((gpIls / price) * 100) : 0
  return { cost, price, gpIls, gpPct, isEst: sheet.confidence_level !== 'high' }
}

function gpPalette(gpPct) {
  if (gpPct >= 75) return { hero: '#4ade80', soft: 'rgba(74,222,128,0.09)', border: 'rgba(74,222,128,0.22)', label: 'rgba(74,222,128,0.65)' }
  if (gpPct >= 65) return { hero: '#fbbf24', soft: 'rgba(251,191,36,0.09)',  border: 'rgba(251,191,36,0.22)',  label: 'rgba(251,191,36,0.65)' }
  return             { hero: '#f87171', soft: 'rgba(248,113,113,0.09)', border: 'rgba(248,113,113,0.22)', label: 'rgba(248,113,113,0.65)' }
}

function fmt(n) {
  return Number.isFinite(n) ? n.toFixed(1) : '—'
}

function MarginCard({ cocktail }) {
  const { cost, price, gpIls, gpPct, isEst } = computeMargin(cocktail)
  const pal = gpPalette(gpPct)

  return (
    <div
      className="rounded-2xl flex flex-col gap-5 p-6"
      style={{ background: pal.soft, border: `1px solid ${pal.border}` }}
    >
      {/* Name row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-bold text-[#f5f5f0] leading-snug">{cocktail.name}</h3>
          {cocktail.base_spirit && (
            <span className="text-[11px] text-[#6b705c] capitalize">{cocktail.base_spirit}</span>
          )}
        </div>
        {isEst && (
          <span className="shrink-0 mt-0.5 rounded-full border border-[#6b705c]/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#6b705c]">
            Est.
          </span>
        )}
      </div>

      {/* Hero: GP in ILS */}
      <div>
        <div
          className="text-5xl font-black leading-none tabular-nums"
          style={{ color: pal.hero }}
        >
          ₪{fmt(gpIls)}
        </div>
        <div
          className="mt-1.5 text-sm font-semibold"
          style={{ color: pal.label }}
        >
          {gpPct}% gross profit
        </div>
      </div>

      {/* Cost | Price */}
      <div
        className="flex gap-0 pt-4"
        style={{ borderTop: `1px solid ${pal.border}` }}
      >
        <div className="flex-1">
          <div className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6b705c] mb-1">Cost</div>
          <div className="text-xl font-bold text-[#e8dcc0] tabular-nums">₪{fmt(cost)}</div>
        </div>
        <div style={{ width: 1, background: pal.border, alignSelf: 'stretch' }} className="mx-4" />
        <div className="flex-1">
          <div className="text-[9px] font-black uppercase tracking-[0.15em] text-[#6b705c] mb-1">Price</div>
          <div className="text-xl font-bold text-[#e8dcc0] tabular-nums">₪{fmt(price)}</div>
        </div>
      </div>
    </div>
  )
}

function MenuCard({ menu, onSelect }) {
  return (
    <button
      onClick={() => onSelect(menu)}
      className="group text-left w-full rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/60 p-7 transition-all hover:border-[#c9a96e]/40 hover:bg-[#1a1a1a]"
    >
      <h3 className="text-2xl font-bold text-[#f5f5f0] mb-3 leading-tight group-hover:text-[#e8dcc0] transition-colors">
        {menu.name}
      </h3>
      <div className="flex items-center flex-wrap gap-2 mb-4">
        {menu.occasion && (
          <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/8 px-3 py-1 text-xs font-semibold text-[#c9a96e] capitalize">
            {menu.occasion}
          </span>
        )}
        {menu.season && (
          <span className="rounded-full border border-[#6b705c]/20 px-3 py-1 text-xs text-[#6b705c] capitalize">
            {menu.season}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[#6b705c]">
        <span className="text-2xl font-black text-[#e8dcc0]/70">{menu.cocktail_count}</span>
        <span className="text-sm">cocktail{menu.cocktail_count !== 1 ? 's' : ''}</span>
      </div>
      {menu.description && (
        <p className="mt-3 text-[13px] text-[#e8dcc0]/40 leading-relaxed line-clamp-2">
          {menu.description}
        </p>
      )}
      {menu.preview_names?.length > 0 && (
        <p className="mt-3 text-[11px] text-[#6b705c]/60 truncate">
          {menu.preview_names.join(' · ')}
          {menu.cocktail_count > menu.preview_names.length ? ` +${menu.cocktail_count - menu.preview_names.length} more` : ''}
        </p>
      )}
    </button>
  )
}

export function MenuMargin({ ciMenus, onLoadMenu }) {
  const [activeMenu, setActiveMenu] = useState(null)
  const [cocktails, setCocktails]   = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  const handleSelect = useCallback(async (menu) => {
    setLoading(true)
    setError(null)
    setActiveMenu(menu)
    setCocktails([])
    try {
      const data = await onLoadMenu(menu.id)
      setCocktails(data?.cocktails || [])
    } catch {
      setError('Could not load cocktails for this menu.')
    } finally {
      setLoading(false)
    }
  }, [onLoadMenu])

  function handleBack() {
    setActiveMenu(null)
    setCocktails([])
    setError(null)
  }

  // ── Phase 1: menu selector ────────────────────────────────────────────────
  if (!activeMenu) {
    return (
      <div>
        {!ciMenus?.length ? (
          <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-14 text-center">
            <p className="text-sm text-[#6b705c]">No saved menus yet.</p>
            <p className="text-xs text-[#6b705c]/50 mt-1.5">
              Generate and approve a menu first, then come back here to see the margins.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ciMenus.map(menu => (
              <MenuCard key={menu.id} menu={menu} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Phase 2: margin view ──────────────────────────────────────────────────
  return (
    <div>
      {/* Breadcrumb + meta */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          onClick={handleBack}
          className="text-xs text-[#6b705c] hover:text-[#c9a96e] transition-colors"
        >
          ← All menus
        </button>
        <span className="text-[#6b705c]/25">|</span>
        <span className="text-sm font-bold text-[#f5f5f0]">{activeMenu.name}</span>
        {activeMenu.occasion && (
          <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-2.5 py-0.5 text-[10px] font-semibold text-[#c9a96e] capitalize">
            {activeMenu.occasion}
          </span>
        )}
        <span className="ml-auto text-[10px] text-[#6b705c]/35 italic">
          Costs from Israeli wholesale benchmarks — confirm before pricing decisions
        </span>
      </div>

      {loading && (
        <div className="py-20 text-center">
          <div className="text-sm text-[#6b705c] animate-pulse">Calculating margins…</div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && cocktails.length === 0 && (
        <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-14 text-center">
          <p className="text-sm text-[#6b705c]">No cocktails saved to this menu.</p>
        </div>
      )}

      {!loading && cocktails.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cocktails.map((c, i) => (
            <MarginCard key={c.id ?? i} cocktail={c} />
          ))}
        </div>
      )}
    </div>
  )
}
