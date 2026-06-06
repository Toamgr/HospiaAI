import { useState, useEffect } from 'react'
import { apiGet } from '../../services/api/client'

function formatIngredients(ingredients) {
  if (!Array.isArray(ingredients) || ingredients.length === 0) return null
  return ingredients.map(ing => {
    if (typeof ing === 'string') return ing
    const parts = []
    if (ing.amount) parts.push(ing.amount)
    if (ing.unit) parts.push(ing.unit)
    if (ing.name) parts.push(ing.name)
    return parts.join(' ').trim() || String(ing)
  }).filter(Boolean).join('  ·  ')
}

function CocktailRow({ cocktail }) {
  const [open, setOpen] = useState(false)
  const ingredientLine = formatIngredients(cocktail.ingredients)
  const hasDetail = ingredientLine || cocktail.method || cocktail.glass_type || cocktail.garnish

  return (
    <div className="border-b border-[#6b705c]/8 last:border-0">
      <button
        type="button"
        onClick={() => hasDetail && setOpen(o => !o)}
        className={`flex w-full items-start justify-between gap-4 px-5 py-3.5 text-left ${hasDetail ? 'hover:bg-white/[0.012] transition-colors' : ''}`}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#f5f5f0]">{cocktail.name}</p>
          {cocktail.description && (
            <p className="text-xs text-[#e8dcc0]/60 mt-0.5 line-clamp-2">{cocktail.description}</p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-2 pt-0.5">
          {cocktail.category && (
            <span className="text-[10px] text-[#6b705c] capitalize">{cocktail.category}</span>
          )}
          {hasDetail && (
            <span className="text-[10px] text-[#6b705c]/40">{open ? '▲' : '▼'}</span>
          )}
        </div>
      </button>
      {open && hasDetail && (
        <div className="px-5 pb-4 grid gap-3 sm:grid-cols-2">
          {ingredientLine && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a96e]/60 mb-1">Ingredients</p>
              <p className="text-xs text-[#e8dcc0]/70 leading-relaxed">{ingredientLine}</p>
            </div>
          )}
          {cocktail.method && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a96e]/60 mb-1">Method</p>
              <p className="text-xs text-[#e8dcc0]/70">{cocktail.method}</p>
            </div>
          )}
          {cocktail.glass_type && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a96e]/60 mb-1">Glass</p>
              <p className="text-xs text-[#e8dcc0]/70">{cocktail.glass_type}</p>
            </div>
          )}
          {cocktail.garnish && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c9a96e]/60 mb-1">Garnish</p>
              <p className="text-xs text-[#e8dcc0]/70">{cocktail.garnish}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function EmployeeCocktailMenu() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet('/api/ci/menus/published')
      .then(d => setMenus(d.menus || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#6b705c] animate-pulse">Loading…</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#f5f5f0]">Cocktail Menu</h1>
        <p className="text-sm text-[#6b705c] mt-1">Published menus visible to staff</p>
      </div>

      {menus.length === 0 ? (
        <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/40 py-14 text-center">
          <p className="text-sm text-[#6b705c]">No cocktail menus have been published for staff yet.</p>
        </div>
      ) : (
        menus.map(menu => (
          <div key={menu.id} className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-[#6b705c]/10">
              <h2 className="text-base font-bold text-[#f5f5f0]">{menu.name}</h2>
              {menu.description && (
                <p className="text-xs text-[#e8dcc0]/50 italic mt-1">{menu.description}</p>
              )}
              {menu.season && (
                <p className="text-[10px] text-[#6b705c] mt-0.5 uppercase tracking-wide">{menu.season}</p>
              )}
            </div>
            {(menu.cocktails || []).length > 0 ? (
              menu.cocktails.map(cocktail => (
                <CocktailRow key={cocktail.name} cocktail={cocktail} />
              ))
            ) : (
              <div className="px-5 py-5">
                <p className="text-xs text-[#6b705c]">No cocktails in this menu yet.</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
