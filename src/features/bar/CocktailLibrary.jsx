import { useState, useMemo } from 'react'
import { CLASSIC_COCKTAIL_LIBRARY } from '../../domain/hospitality/bar/classicCocktailLibrary.js'

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

function classicSpiritFamily(cocktail) {
  const s = (cocktail.baseSpirit || '').toLowerCase()
  if (/mezcal/.test(s)) return 'Mezcal'
  if (/tequila/.test(s)) return 'Tequila'
  if (/rum/.test(s)) return 'Rum'
  if (/whisky|whiskey|bourbon|rye|scotch/.test(s)) return 'Whisky'
  if (/brandy|cognac|pisco/.test(s)) return 'Brandy'
  if (/vodka/.test(s)) return 'Vodka'
  if (/gin/.test(s)) return 'Gin'
  if (/sherry|aperol|aperitivo/.test(s)) return 'Low ABV'
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

function ClassicCard({ cocktail }) {
  const [open, setOpen] = useState(false)
  const family = classicSpiritFamily(cocktail)

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#c9a96e]/10 bg-[linear-gradient(135deg,#0d0c0a,#070705)] transition hover:border-[#c9a96e]/20">
      <button className="w-full p-5 text-left" onClick={() => setOpen(v => !v)}>
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full border border-[#6b705c]/30 bg-[#6b705c]/08 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]/50">Classic</span>
              <span className="rounded-full border border-[#6b705c]/20 bg-black/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]/45">{family}</span>
              <span className="rounded-full border border-[#6b705c]/15 bg-black/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.10em] text-[#e8dcc0]/30">{cocktail.category}</span>
            </div>
            <h3 className="font-serif text-xl font-black text-[#f5f5f0]">{cocktail.name}</h3>
            <p className="mt-1 text-[11px] text-[#e8dcc0]/50">{cocktail.baseSpirit}</p>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#c9a96e]/06 px-5 pb-5">
          {cocktail.story && (
            <p className="mt-4 text-sm leading-7 text-[#e8dcc0]/65 italic">{cocktail.story}</p>
          )}
          {cocktail.ingredients?.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/30">Recipe</div>
              <div className="space-y-1.5">
                {cocktail.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="w-24 shrink-0 text-right font-mono font-bold text-[#c9a96e]/80">
                      {ing.amount != null ? `${ing.amount} ${ing.unit}` : ing.unit}
                    </span>
                    <span className="text-[#e8dcc0]">{ing.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 grid gap-3 grid-cols-2 text-xs">
            {cocktail.glassware && <div><div className="text-[9px] uppercase tracking-widest text-[#e8dcc0]/30 font-black">Glass</div><div className="mt-0.5 text-[#e8dcc0]">{cocktail.glassware}</div></div>}
            {cocktail.garnish && <div><div className="text-[9px] uppercase tracking-widest text-[#e8dcc0]/30 font-black">Garnish</div><div className="mt-0.5 text-[#e8dcc0]">{cocktail.garnish}</div></div>}
          </div>
          {cocktail.method && (
            <div className="mt-3 text-xs">
              <div className="text-[9px] uppercase tracking-widest text-[#e8dcc0]/30 font-black mb-1">Method</div>
              <div className="text-[#e8dcc0]/80 leading-6">{cocktail.method}</div>
            </div>
          )}
          {cocktail.notes && (
            <div className="mt-4 rounded-xl border border-[#6b705c]/12 bg-black/20 px-4 py-3">
              <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/25 mb-1">Bartender Notes</div>
              <p className="text-xs leading-6 text-[#e8dcc0]/55">{cocktail.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const SPIRIT_OPTIONS = ['All', 'Gin', 'Tequila', 'Mezcal', 'Rum', 'Whisky', 'Vodka', 'Brandy', 'Low ABV', 'Mixed']

export default function CocktailLibrary({ cocktailDrafts = [], approvedCocktails = [], archivedCocktails = [] }) {
  const [search, setSearch] = useState('')
  const [spiritFilter, setSpiritFilter] = useState('All')
  const [view, setView] = useState('venue')

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

  const classicsFiltered = useMemo(() => CLASSIC_COCKTAIL_LIBRARY.filter(c => {
    const matchSearch = !search || [c.name, c.category, c.baseSpirit, c.story, c.notes, ...(c.tags || [])].join(' ').toLowerCase().includes(search.toLowerCase())
    const matchSpirit = spiritFilter === 'All' || classicSpiritFamily(c) === spiritFilter
    return matchSearch && matchSpirit
  }), [search, spiritFilter])

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.38em] text-[#c9a96e]">Cocktail Reference</div>
        <h1 className="mt-3 font-serif text-6xl font-black leading-none tracking-tight text-[#f5f5f0] sm:text-7xl">Cocktail Bible</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[#e8dcc0]/70">Browse all cocktails — approved, in development, and archived. Recipes, methods, glassware, and full specs.</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-0 border-b border-[#6b705c]/15">
        {[
          { key: 'venue',   label: 'Venue Cocktails',       count: allCocktails.length },
          { key: 'classic', label: 'Classic Cocktail Bible', count: CLASSIC_COCKTAIL_LIBRARY.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setView(tab.key)}
            className={`px-5 pb-3 pt-1 text-[11px] font-black uppercase tracking-[0.18em] border-b-2 -mb-px transition ${view === tab.key ? 'border-[#c9a96e] text-[#c9a96e]' : 'border-transparent text-[#e8dcc0]/35 hover:text-[#e8dcc0]/55'}`}>
            {tab.label}
            <span className="ml-2 rounded-full bg-[#6b705c]/15 px-1.5 py-0.5 text-[8px]">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={view === 'classic' ? 'Search classics by name, spirit, category, or style…' : 'Search by name, style, or notes…'}
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
      {view === 'venue' ? (
        filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="font-serif text-[6rem] font-black leading-none text-[#c9a96e]/[0.05]">LIB</div>
            <p className="-mt-6 text-sm text-[#e8dcc0]/30">No cocktails found. Create your first in the Cocktail Lab.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => <LibraryCard key={c.id} cocktail={c} />)}
          </div>
        )
      ) : (
        classicsFiltered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="font-serif text-[6rem] font-black leading-none text-[#c9a96e]/[0.05]">50</div>
            <p className="-mt-6 text-sm text-[#e8dcc0]/30">No classics match your search or filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {classicsFiltered.map(c => <ClassicCard key={c.id} cocktail={c} />)}
          </div>
        )
      )}
    </div>
  )
}
