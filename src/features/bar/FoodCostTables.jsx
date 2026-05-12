import { useState, useMemo } from 'react'
import { buildCostSheet } from '../../domain/hospitality/bar/cocktailLabPricingAdapter.js'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function CostSheetCard({ cocktail, expanded, onToggle }) {
  const cost = useMemo(() => buildCostSheet(cocktail), [cocktail])
  const status = cocktail.status === 'approved' ? 'Approved' : cocktail.status === 'awaitingApproval' ? 'Pending Review' : 'Draft'
  const statusColor = cocktail.status === 'approved' ? 'text-emerald-300 border-emerald-800/30 bg-emerald-950/20' : cocktail.status === 'awaitingApproval' ? 'text-amber-300 border-amber-800/30 bg-amber-950/20' : 'text-[#c9a96e] border-[#c9a96e]/25 bg-[#c9a96e]/08'

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#12110e,#090907)]">
      <button className="flex w-full items-center justify-between gap-4 p-6 text-left" onClick={onToggle}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] ${statusColor}`}>{status}</span>
            <span className="text-[9px] text-[#e8dcc0]/35">{formatDate(cocktail.created_at || cocktail.approved_at)}</span>
          </div>
          <h3 className="mt-2 font-serif text-2xl font-black text-[#f5f5f0]">{cocktail.name}</h3>
          <p className="mt-1 text-xs text-[#e8dcc0]/50">{cocktail.menuRole || cocktail.style || '—'}</p>
        </div>
        <div className="shrink-0 grid grid-cols-3 gap-4 text-right">
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">Cost</div>
            <div className="mt-1 font-mono text-lg font-black text-[#f5f5f0]">₪{cost.totalCost.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">Pour %</div>
            <div className={`mt-1 font-mono text-lg font-black ${cost.pourCost <= 22 ? 'text-emerald-400' : cost.pourCost <= 28 ? 'text-amber-300' : 'text-red-400'}`}>{cost.pourCost}%</div>
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">Price</div>
            <div className="mt-1 font-mono text-lg font-black text-[#c9a96e]">₪{cost.suggested.toFixed(0)}</div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#c9a96e]/10 px-6 pb-6">
          <div className="mb-3 mt-4 grid grid-cols-[1fr_40px_60px_60px] gap-2 text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/30">
            <span>Ingredient</span><span className="text-right">ml</span><span className="text-right">₪/ml</span><span className="text-right">Total</span>
          </div>
          <div className="space-y-0 divide-y divide-[#c9a96e]/06">
            {cost.rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_40px_60px_60px] items-center gap-2 py-2.5 text-xs">
                <span className="font-medium text-[#e8dcc0]">{r.ingredient}</span>
                <span className="text-right font-mono text-[#e8dcc0]/45">{r.ml}ml</span>
                <span className="text-right font-mono text-[#e8dcc0]/45">₪{r.cpm.toFixed(2)}</span>
                <span className="text-right font-bold text-[#c9a96e]">₪{r.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[1fr_40px_60px_60px] items-center gap-2 py-2.5 text-xs border-t border-[#c9a96e]/10 mt-1">
            <span className="font-medium text-[#e8dcc0]/50">Bartender Labor</span>
            <span className="text-right font-mono text-[#e8dcc0]/30">2 min</span>
            <span className="text-right font-mono text-[#e8dcc0]/30">—</span>
            <span className="text-right font-bold text-[#e8dcc0]/50">₪{cost.labor_cost_nis.toFixed(2)}</span>
          </div>
          <div className="mt-4 grid gap-3 border-t border-[#c9a96e]/10 pt-4 md:grid-cols-4">
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">Total Ingredient Cost</div>
              <div className="mt-1.5 text-xl font-black text-[#f5f5f0]">₪{cost.totalCost.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">Target Pour Cost</div>
              <div className={`mt-1.5 text-xl font-black ${cost.pourCost <= 22 ? 'text-emerald-400' : cost.pourCost <= 28 ? 'text-amber-300' : 'text-red-400'}`}>{cost.pourCost}%</div>
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">Standard Menu Price</div>
              <div className="mt-1.5 text-xl font-black text-[#c9a96e]">₪{cost.suggested.toFixed(0)}</div>
            </div>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">Luxury Price Point</div>
              <div className="mt-1.5 text-xl font-black text-[#e8dcc0]">₪{cost.luxury.toFixed(0)}</div>
            </div>
          </div>
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-800/25 bg-amber-950/15 px-3 py-2">
            <span className="text-amber-400 text-[10px] mt-0.5">⚠</span>
            <span className="text-[10px] text-amber-300/65 leading-relaxed">Benchmark estimates — confirm against supplier invoices before finalizing menu pricing.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FoodCostTables({ cocktailDrafts = [], approvedCocktails = [] }) {
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')

  const allCocktails = useMemo(() => {
    const seen = new Set()
    return [...approvedCocktails, ...cocktailDrafts].filter(c => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return (c.ingredientsMl || c.ingredientObjects || []).length > 0
    })
  }, [approvedCocktails, cocktailDrafts])

  const filtered = useMemo(() => {
    if (filter === 'approved') return allCocktails.filter(c => c.status === 'approved')
    if (filter === 'draft') return allCocktails.filter(c => c.status === 'draft')
    return allCocktails
  }, [allCocktails, filter])

  const totalApproved = approvedCocktails.length

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.38em] text-[#c9a96e]">Bar Management</div>
          <h1 className="mt-3 font-serif text-6xl font-black leading-none tracking-tight text-[#f5f5f0] sm:text-7xl">Food Cost Tables</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#e8dcc0]/70">Every cocktail auto-generates a costing sheet. One recipe, one sheet. Edit in the Cocktail Lab.</p>
        </div>
        <div className="rounded-[1.5rem] border border-[#c9a96e]/20 bg-black/20 px-6 py-4 text-right">
          <div className="font-serif text-3xl font-black text-[#c9a96e]">{totalApproved}</div>
          <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/45">Approved Recipes</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2">
        {[['all', 'All'], ['approved', 'Approved'], ['draft', 'Drafts']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`rounded-full border px-5 py-2 text-[10px] font-black uppercase tracking-[0.16em] transition ${filter === val ? 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/20 bg-transparent text-[#e8dcc0]/50 hover:text-[#e8dcc0]'}`}>
            {label}
          </button>
        ))}
        <div className="ml-auto text-xs font-bold text-[#e8dcc0]/30">{filtered.length} recipe{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Cost Sheets */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="font-serif text-[6rem] font-black leading-none text-[#c9a96e]/[0.06]">₪</div>
          <div className="-mt-8 text-sm text-[#e8dcc0]/30">Generate cocktails in the Cocktail Lab to auto-create costing sheets.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(cocktail => (
            <CostSheetCard
              key={cocktail.id}
              cocktail={cocktail}
              expanded={expanded === cocktail.id}
              onToggle={() => setExpanded(prev => prev === cocktail.id ? null : cocktail.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
