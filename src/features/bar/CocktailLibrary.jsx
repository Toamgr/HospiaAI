import { useState, useMemo } from 'react'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

function spiritFamily(cocktail) {
  const text = [cocktail.name, cocktail.menuRole, cocktail.conceptStory, cocktail.guestDescription,
    ...(cocktail.ingredientsMl || cocktail.ingredientObjects || []).map(i => i.ingredient || '')
  ].join(' ').toLowerCase()
  if (/mezcal/.test(text)) return 'Mezcal'
  if (/tequila/.test(text)) return 'Tequila'
  if (/rum/.test(text)) return 'Rum'
  if (/whisky|whiskey|bourbon|rye/.test(text)) return 'Whisky'
  if (/brandy|cognac/.test(text)) return 'Brandy'
  if (/vodka/.test(text)) return 'Vodka'
  if (/gin/.test(text)) return 'Gin'
  if (/sherry|vermouth|aperitif|low abv/.test(text)) return 'Low ABV'
  return 'Mixed'
}

function LibraryCard({ cocktail }) {
  const [open, setOpen] = useState(false)
  const family = spiritFamily(cocktail)
  const ings = cocktail.ingredientsMl || cocktail.ingredientObjects || []
  const status = cocktail.status === 'approved' ? 'Approved' : cocktail.status === 'awaitingApproval' ? 'Pending' : 'Draft'
  const statusColor = cocktail.status === 'approved' ? 'text-emerald-300 border-emerald-800/30 bg-emerald-950/20' : 'text-[#c9a96e] border-[#c9a96e]/25 bg-[#c9a96e]/08'

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#c9a96e]/12 bg-[linear-gradient(135deg,#12110e,#090907)] transition hover:border-[#c9a96e]/22">
      <button className="w-full p-5 text-left" onClick={() => setOpen(v => !v)}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] ${statusColor}`}>{status}</span>
              <span className="rounded-full border border-[#6b705c]/20 bg-black/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]/45">{family}</span>
            </div>
            <h3 className="font-serif text-xl font-black text-[#f5f5f0]">{cocktail.name}</h3>
            <p className="mt-1 text-[11px] text-[#e8dcc0]/50">{cocktail.menuRole || cocktail.style || '—'}</p>
          </div>
          <span className="shrink-0 text-[11px] font-bold text-[#e8dcc0]/30">{formatDate(cocktail.created_at || cocktail.approved_at)}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#c9a96e]/08 px-5 pb-5">
          {cocktail.guestDescription && (
            <p className="mt-4 text-sm leading-7 text-[#e8dcc0]/70">{cocktail.guestDescription}</p>
          )}
          {ings.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/30">Recipe</div>
              <div className="space-y-1.5">
                {ings.filter(i => i.amountMl > 0).map((ing, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="w-12 shrink-0 text-right font-mono font-bold text-[#c9a96e]">{ing.amountMl} ml</span>
                    <span className="text-[#e8dcc0]">{ing.ingredient}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-4 text-xs">
            {cocktail.glassware && <div><div className="text-[9px] uppercase tracking-widest text-[#e8dcc0]/30 font-black">Glass</div><div className="mt-0.5 text-[#e8dcc0]">{cocktail.glassware}</div></div>}
            {cocktail.garnish && <div><div className="text-[9px] uppercase tracking-widest text-[#e8dcc0]/30 font-black">Garnish</div><div className="mt-0.5 text-[#e8dcc0]">{cocktail.garnish}</div></div>}
            {cocktail.method && <div><div className="text-[9px] uppercase tracking-widest text-[#e8dcc0]/30 font-black">Method</div><div className="mt-0.5 text-[#e8dcc0]">{cocktail.method?.split('.')[0]}</div></div>}
            {cocktail.ice && <div><div className="text-[9px] uppercase tracking-widest text-[#e8dcc0]/30 font-black">Ice</div><div className="mt-0.5 text-[#e8dcc0]">{cocktail.ice}</div></div>}
          </div>
        </div>
      )}
    </div>
  )
}

const SPIRIT_OPTIONS = ['All', 'Gin', 'Tequila', 'Mezcal', 'Rum', 'Whisky', 'Vodka', 'Brandy', 'Low ABV', 'Mixed']

export default function CocktailLibrary({ cocktailDrafts = [], approvedCocktails = [], archivedCocktails = [] }) {
  const [search, setSearch] = useState('')
  const [spiritFilter, setSpiritFilter] = useState('All')

  const allCocktails = useMemo(() => {
    const seen = new Set()
    return [...approvedCocktails, ...cocktailDrafts, ...archivedCocktails].filter(c => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  }, [approvedCocktails, cocktailDrafts, archivedCocktails])

  const filtered = useMemo(() => allCocktails.filter(c => {
    const matchSearch = !search || [c.name, c.menuRole, c.guestDescription, c.conceptStory].join(' ').toLowerCase().includes(search.toLowerCase())
    const matchSpirit = spiritFilter === 'All' || spiritFamily(c) === spiritFilter
    return matchSearch && matchSpirit
  }), [allCocktails, search, spiritFilter])

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.38em] text-[#c9a96e]">Cocktail Reference</div>
        <h1 className="mt-3 font-serif text-6xl font-black leading-none tracking-tight text-[#f5f5f0] sm:text-7xl">Cocktail Bible</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#e8dcc0]/70">Browse all cocktails — approved, in development, and archived. Recipes, methods, glassware, and full specs.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, style, or notes..."
          className="flex-1 min-w-48 rounded-[1.35rem] border border-[#6b705c]/20 bg-black/25 px-5 py-3 text-sm text-[#f5f5f0] outline-none placeholder:text-[#e8dcc0]/30 focus:border-[#c9a96e]/40 focus:ring-1 focus:ring-[#c9a96e]/15"
        />
        <div className="flex gap-2 overflow-x-auto">
          {SPIRIT_OPTIONS.map(opt => (
            <button key={opt} onClick={() => setSpiritFilter(opt)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] transition ${spiritFilter === opt ? 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]' : 'border-[#6b705c]/20 text-[#e8dcc0]/45 hover:text-[#e8dcc0]'}`}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="font-serif text-[6rem] font-black leading-none text-[#c9a96e]/[0.05]">LIB</div>
          <p className="-mt-6 text-sm text-[#e8dcc0]/30">No cocktails found. Create your first in the Cocktail Lab.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => <LibraryCard key={c.id} cocktail={c} />)}
        </div>
      )}
    </div>
  )
}
