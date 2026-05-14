import { useMemo } from 'react'

function spiritOf(cocktail) {
  const text = [...(cocktail.ingredientsMl || cocktail.ingredientObjects || []).map(i => i.ingredient || '')].join(' ').toLowerCase()
  if (/mezcal/.test(text)) return 'Mezcal'
  if (/tequila/.test(text)) return 'Tequila'
  if (/rum/.test(text)) return 'Rum'
  if (/whisky|whiskey|bourbon/.test(text)) return 'Whisky'
  if (/brandy|cognac/.test(text)) return 'Brandy'
  if (/vodka/.test(text)) return 'Vodka'
  if (/gin/.test(text)) return 'Gin'
  return 'Other'
}

export default function InventoryOverview({ approvedCocktails = [], cocktailDrafts = [] }) {
  const allCocktails = useMemo(() => {
    const seen = new Set()
    return [...approvedCocktails, ...cocktailDrafts].filter(c => { if (seen.has(c.id)) return false; seen.add(c.id); return true })
  }, [approvedCocktails, cocktailDrafts])

  const ingredientMap = useMemo(() => {
    const map = {}
    allCocktails.forEach(c => {
      const ings = c.ingredientsMl || c.ingredientObjects || []
      ings.forEach(ing => {
        const key = (ing.ingredient || '').trim()
        if (!key) return
        if (!map[key]) map[key] = { ingredient: key, totalMl: 0, usedIn: [] }
        map[key].totalMl += (ing.amountMl || 0)
        if (!map[key].usedIn.includes(c.name)) map[key].usedIn.push(c.name)
      })
    })
    return Object.values(map).sort((a, b) => b.usedIn.length - a.usedIn.length)
  }, [allCocktails])

  const spiritCounts = useMemo(() => {
    const counts = {}
    approvedCocktails.forEach(c => { const s = spiritOf(c); counts[s] = (counts[s] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [approvedCocktails])

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.38em] text-[#c9a96e]">Bar Management</div>
        <h1 className="mt-3 font-serif text-6xl font-black leading-none tracking-tight text-[#f5f5f0] sm:text-7xl">Inventory Overview</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#e8dcc0]/70">Ingredients derived from your active cocktail portfolio. Use this to inform purchasing decisions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        {/* Ingredient Usage Table */}
        <div className="rounded-[2.5rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#12110e,#090907)] p-6">
          <div className="mb-5">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Ingredient Usage</div>
            <p className="mt-1 text-xs text-[#e8dcc0]/45">Sorted by number of cocktails using each ingredient.</p>
          </div>
          {ingredientMap.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#e8dcc0]/30">No ingredients found. Build cocktails in the Lab first.</p>
          ) : (
            <div className="space-y-0 divide-y divide-[#c9a96e]/06">
              {ingredientMap.slice(0, 30).map(row => (
                <div key={row.ingredient} className="flex items-center gap-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#f5f5f0] truncate">{row.ingredient}</div>
                    <div className="mt-0.5 text-[10px] text-[#e8dcc0]/40 truncate">{row.usedIn.slice(0, 3).join(', ')}{row.usedIn.length > 3 ? ` +${row.usedIn.length - 3}` : ''}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-black text-[#c9a96e]">{row.usedIn.length}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/30">cocktails</div>
                  </div>
                  <div className="shrink-0 text-right w-16">
                    <div className="text-xs font-mono font-bold text-[#e8dcc0]/60">{row.totalMl}ml</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/30">total</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spirit Balance */}
        <div className="space-y-4">
          <div className="rounded-[2rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#12110e,#090907)] p-5">
            <div className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Spirit Balance</div>
            {spiritCounts.length === 0 ? (
              <p className="text-xs text-[#e8dcc0]/30">No approved cocktails yet.</p>
            ) : (
              <div className="space-y-3">
                {spiritCounts.map(([spirit, count]) => (
                  <div key={spirit}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-[#e8dcc0]">{spirit}</span>
                      <span className="font-mono text-[#c9a96e]">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#6b705c]/20 overflow-hidden">
                      <div className="h-full rounded-full bg-[#c9a96e]" style={{ width: `${Math.min(100, (count / Math.max(...spiritCounts.map(s => s[1]))) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#12110e,#090907)] p-5">
            <div className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Portfolio Size</div>
            <div className="grid grid-cols-2 gap-3">
              {[['Approved', approvedCocktails.length], ['Drafts', cocktailDrafts.filter(d => d.status === 'draft').length], ['Pending', cocktailDrafts.filter(d => d.status === 'awaitingApproval').length], ['Unique Ingredients', ingredientMap.length]].map(([l, v]) => (
                <div key={l} className="rounded-[1.2rem] border border-[#6b705c]/15 bg-black/20 p-3 text-center">
                  <div className="font-serif text-2xl font-black text-[#c9a96e]">{v}</div>
                  <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/40">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
