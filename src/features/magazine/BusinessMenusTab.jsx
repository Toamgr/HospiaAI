import React, { useState, useMemo } from 'react'
import { cx } from '../../utils/format'

/*
 * BusinessMenusTab
 * Displays active cocktail menus from HESTIA's approvedCocktails pipeline.
 * Styled in HESTIA's native dark card aesthetic — NOT in the magazine design.
 */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center mb-6">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#c9a96e]">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-[#f5f5f0] mb-2">No active menus yet</h3>
      <p className="text-sm text-[#e8dcc0]/60 max-w-xs">
        Cocktails approved through the Cocktail Lab will appear here as your active bar menus.
      </p>
    </div>
  )
}

function CategoryBadge({ category }) {
  const colors = {
    'bar menu': 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]',
    'event': 'border-emerald-800/50 bg-emerald-950/25 text-emerald-300',
    'seasonal': 'border-blue-800/50 bg-blue-950/25 text-blue-300',
    'cocktail of the week': 'border-purple-800/50 bg-purple-950/25 text-purple-300',
  }
  const key = (category || 'bar menu').toLowerCase()
  const cls = colors[key] || colors['bar menu']
  return (
    <span className={cx('rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em]', cls)}>
      {category || 'Bar Menu'}
    </span>
  )
}

function CocktailCard({ cocktail }) {
  const [expanded, setExpanded] = useState(false)
  const ingredients = cocktail.ingredientsMl || cocktail.ingredientObjects || cocktail.ingredients || []

  return (
    <div className="rounded-2xl border border-[#6b705c]/25 bg-gradient-to-br from-[#1a1a1a] to-[#111009] p-5 transition-all duration-300 hover:border-[#c9a96e]/30">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e] mb-1">
            {cocktail.context || 'Bar Menu'}
          </div>
          <h3 className="font-serif text-xl font-black text-[#f5f5f0] truncate">{cocktail.name}</h3>
        </div>
        <CategoryBadge category={cocktail.context} />
      </div>

      {cocktail.guestDescription && (
        <p className="text-sm leading-6 text-[#e8dcc0]/75 mb-4">{cocktail.guestDescription}</p>
      )}

      <div className="flex items-center gap-4 text-xs text-[#e8dcc0]/50">
        {cocktail.price && (
          <span className="font-bold text-[#c9a96e]">₪{cocktail.price}</span>
        )}
        {cocktail.glassware && (
          <span>{cocktail.glassware}</span>
        )}
        {cocktail.method && (
          <span className="hidden sm:inline">{cocktail.method}</span>
        )}
      </div>

      {(cocktail.serviceScript || ingredients.length > 0) && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e]/70 hover:text-[#c9a96e] transition-colors"
        >
          {expanded ? '↑ Less detail' : '↓ Full recipe'}
        </button>
      )}

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-[#6b705c]/20 pt-4">
          {ingredients.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/50 mb-2">Ingredients</div>
              <div className="space-y-1">
                {ingredients.map((ing, i) => {
                  const name = typeof ing === 'string' ? ing : (ing.name || ing.ingredient || '')
                  const measure = typeof ing === 'object' ? (ing.measure || ing.amount || ing.ml || '') : ''
                  return (
                    <div key={i} className="flex gap-3 text-sm">
                      {measure && <span className="text-[#c9a96e] font-mono text-xs min-w-[4rem]">{measure}</span>}
                      <span className="text-[#f5f5f0]">{name}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {cocktail.garnish && (
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/50 mb-1">Garnish</div>
              <div className="text-sm text-[#f5f5f0]">{cocktail.garnish}</div>
            </div>
          )}
          {cocktail.serviceScript && (
            <div className="rounded-xl border border-[#c9a96e]/20 bg-[#c9a96e]/8 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#c9a96e] mb-2">Service Script</div>
              <p className="font-serif text-base italic leading-7 text-[#f5f5f0]">"{cocktail.serviceScript}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function BusinessMenusTab({ approvedCocktails = [] }) {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const categories = useMemo(() => {
    const cats = new Set(approvedCocktails.map(c => (c.context || 'bar menu').toLowerCase()))
    return ['all', ...Array.from(cats)]
  }, [approvedCocktails])

  const filtered = useMemo(() => {
    let result = approvedCocktails
    if (activeFilter !== 'all') {
      result = result.filter(c => (c.context || 'bar menu').toLowerCase() === activeFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.guestDescription?.toLowerCase().includes(q) ||
        c.context?.toLowerCase().includes(q)
      )
    }
    return result
  }, [approvedCocktails, activeFilter, search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#f5f5f0]">Active Bar Menus</h2>
          <p className="text-sm text-[#e8dcc0]/60 mt-0.5">
            {approvedCocktails.length} cocktail{approvedCocktails.length !== 1 ? 's' : ''} approved for service
          </p>
        </div>
        {approvedCocktails.length > 0 && (
          <input
            type="text"
            placeholder="Search cocktails…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2 text-sm text-[#f5f5f0] placeholder:text-[#6b705c] outline-none focus:border-[#c9a96e] focus:ring-1 focus:ring-[#c9a96e]/30"
          />
        )}
      </div>

      {/* Category filters */}
      {approvedCocktails.length > 0 && categories.length > 2 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cx(
                'rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] transition-colors',
                activeFilter === cat
                  ? 'border-[#c9a96e] bg-[#c9a96e]/15 text-[#c9a96e]'
                  : 'border-[#6b705c]/30 text-[#e8dcc0]/60 hover:text-[#e8dcc0]'
              )}
            >
              {cat === 'all' ? `All (${approvedCocktails.length})` : cat}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 && approvedCocktails.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#e8dcc0]/50 text-sm">
          No cocktails match "{search}"
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <CocktailCard key={c.id || c.name} cocktail={c} />
          ))}
        </div>
      )}
    </div>
  )
}
