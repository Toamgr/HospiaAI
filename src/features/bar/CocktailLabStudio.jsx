import { useState, useMemo, useCallback, useRef } from 'react'
import { requestCocktailProposal } from '../../services/cocktailService'
import { buildCostSheet, getProductsForIngredient, getIngredientFallbackCpm } from '../../domain/hospitality/bar/cocktailLabPricingAdapter.js'
import { getEffectiveProduct } from '../../domain/hospitality/bar/verifiedPriceStorage.js'

// ─── Flavor & Cost Logic ─────────────────────────────────────────────────────

const FLAVOR_DIMS = ['Sweet', 'Sour', 'Bitter', 'Salty', 'Savory', 'Spicy', 'Smoky', 'Dry', 'Creamy']

function inferFlavorProfile(cocktail, adjust = {}) {
  const text = [
    cocktail.conceptStory, cocktail.guestDescription, cocktail.garnish,
    cocktail.method, cocktail.menuRole,
    ...(cocktail.ingredientsMl || cocktail.ingredientObjects || []).map(i => i.ingredient || '')
  ].join(' ').toLowerCase()

  const ings = cocktail.ingredientsMl || cocktail.ingredientObjects || []
  const mlOf = (pattern) => ings.filter(i => pattern.test((i.ingredient || '').toLowerCase())).reduce((s, i) => s + (i.amountMl || 0), 0)

  const sweetMl = mlOf(/syrup|cordial|liqueur|sweet|sugar|honey|agave|triple|cointreau/)
  const sourMl = mlOf(/lime|lemon|citrus|acid|verjus|grapefruit|yuzu/)
  const spiritMl = mlOf(/gin|vodka|rum|tequila|mezcal|whisky|whiskey|brandy|cognac|pisco|arak/)

  const base = {
    Sweet: Math.min(10, Math.round(sweetMl / 4 + (/sweet|dessert|honey|peach|tropical/.test(text) ? 3 : 1))),
    Sour: Math.min(10, Math.round(sourMl / 4 + (/tart|citrus|bright|sour/.test(text) ? 3 : 1))),
    Bitter: /bitter|amaro|campari|aperol|vermouth|angostura|grapefruit bitters|negroni/.test(text) ? 6 : /dry|crisp/.test(text) ? 3 : 2,
    Salty: /saline|salt|soy|miso|olive/.test(text) ? 5 : 1,
    Savory: /savory|umami|miso|soy|sesame|shiso|cured|ferment/.test(text) ? 6 : 1,
    Spicy: /ginger|pepper|chili|jalap|spic|cardamom/.test(text) ? 5 : 1,
    Smoky: /mezcal|smoke|peat|char|lapsang/.test(text) ? 8 : /whisky|bourbon/.test(text) ? 3 : 1,
    Dry: /dry vermouth|fino sherry|bone dry|brut|crisp|austere/.test(text) ? 7 : sweetMl > 20 ? 2 : 4,
    Creamy: /cream|egg white|coconut|oat|silky|velvet|foam/.test(text) ? 7 : 1,
  }

  const adjustMult = (adjust.sweetness || 0) * 0.6
  return {
    Sweet: Math.max(1, Math.min(10, Math.round(base.Sweet + (adjust.sweetness || 0)))),
    Sour: Math.max(1, Math.min(10, Math.round(base.Sour + (adjust.sourness || 0)))),
    Bitter: Math.max(1, Math.min(10, Math.round(base.Bitter - adjustMult * 0.3))),
    Salty: Math.max(1, Math.min(10, base.Salty)),
    Savory: Math.max(1, Math.min(10, base.Savory)),
    Spicy: Math.max(1, Math.min(10, base.Spicy)),
    Smoky: Math.max(1, Math.min(10, base.Smoky)),
    Dry: Math.max(1, Math.min(10, Math.round(base.Dry - (adjust.sweetness || 0) * 0.4))),
    Creamy: Math.max(1, Math.min(10, base.Creamy)),
  }
}

function estimateABV(ingredientsMl = [], abvAdjust = 0) {
  const total = ingredientsMl.reduce((s, i) => s + (i.amountMl || 0), 0)
  if (!total) return 0
  const alcoholMl = ingredientsMl.reduce((s, i) => {
    const n = (i.ingredient || '').toLowerCase()
    let abv = 0
    if (/gin|vodka|rum|tequila|mezcal|whisky|whiskey|brandy|cognac|pisco|arak|spirit/.test(n)) abv = 40
    else if (/vermouth|sherry|sake|wine/.test(n)) abv = 17
    else if (/liqueur|aperol|campari|triple|cointreau|chartreuse|bitter(?! bitter)|amaro/.test(n)) abv = 25
    return s + ((i.amountMl || 0) * abv / 100)
  }, 0)
  const served = total * 1.25
  return Math.max(0, Math.round(((alcoholMl / served) * 100 + abvAdjust) * 10) / 10)
}

// ─── Cocktail Visual ──────────────────────────────────────────────────────────

function cocktailLiquidGradient(profile = {}, glassware = '') {
  const { Smoky = 1, Sweet = 5, Sour = 5, Bitter = 2, Creamy = 1, Savory = 1 } = profile
  if (Smoky > 5) return ['#2d1a0e', '#5c3018']
  if (Creamy > 5) return ['#f5e8d0', '#e8d4b0']
  if (Bitter > 6) return ['#8b2b00', '#c44a00']
  if (Sour > 7) return ['#c8e83a', '#a5c224']
  if (Sweet > 7 && Sour < 4) return ['#e8a04a', '#d4842a']
  if (Savory > 4) return ['#6b8c42', '#4a6b28']
  return ['#c9a96e', '#8b6b3a']
}

function glassShape(glassware = '') {
  const g = glassware.toLowerCase()
  if (/highball|collins/.test(g)) return 'highball'
  if (/coupe/.test(g)) return 'coupe'
  if (/rocks|old|lowball/.test(g)) return 'rocks'
  if (/nick|nora|martini/.test(g)) return 'martini'
  if (/wine/.test(g)) return 'wine'
  return 'coupe'
}

function CocktailVisual({ cocktail, profile }) {
  const [c1, c2] = cocktailLiquidGradient(profile, cocktail?.glassware)
  const shape = glassShape(cocktail?.glassware || '')
  const id = `liq-${shape}`

  const glasses = {
    highball: (
      <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <clipPath id={`clip-${shape}`}>
            <path d="M25 20 L95 20 L90 185 L30 185 Z" />
          </clipPath>
        </defs>
        <path d="M25 20 L95 20 L90 185 L30 185 Z" fill="rgba(201,169,110,0.08)" stroke="rgba(201,169,110,0.5)" strokeWidth="1.5"/>
        <rect x="26" y="80" width="68" height="104" fill={`url(#${id})`} clipPath={`url(#clip-${shape})`} opacity="0.85"/>
        <path d="M25 20 L95 20" stroke="rgba(201,169,110,0.9)" strokeWidth="2.5" strokeLinecap="round"/>
        <ellipse cx="60" cy="80" rx="34" ry="4" fill="rgba(255,255,255,0.12)"/>
        {[40,55,70,90,110,130,150].map(y => (
          <circle key={y} cx={Math.round(30 + ((y - 20) / 165) * 20)} cy={y} r="1.5" fill="rgba(255,255,255,0.18)" />
        ))}
      </svg>
    ),
    coupe: (
      <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <clipPath id={`clip-${shape}`}>
            <path d="M15 30 Q80 60 145 30 Q145 100 80 120 Q15 100 15 30 Z" />
          </clipPath>
        </defs>
        <path d="M15 30 Q80 60 145 30 Q145 100 80 120 Q15 100 15 30 Z" fill="rgba(201,169,110,0.08)" stroke="rgba(201,169,110,0.5)" strokeWidth="1.5"/>
        <path d="M15 30 Q80 60 145 30 Q145 100 80 120 Q15 100 15 30 Z" fill={`url(#${id})`} opacity="0.8" clipPath={`url(#clip-${shape})`}/>
        <path d="M15 30 Q80 60 145 30" stroke="rgba(201,169,110,0.9)" strokeWidth="2.5"/>
        <line x1="80" y1="120" x2="80" y2="175" stroke="rgba(201,169,110,0.4)" strokeWidth="2"/>
        <path d="M55 175 L105 175" stroke="rgba(201,169,110,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    rocks: (
      <svg viewBox="0 0 140 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <path d="M20 25 L120 25 L115 145 L25 145 Z" fill="rgba(201,169,110,0.08)" stroke="rgba(201,169,110,0.5)" strokeWidth="1.5"/>
        <path d="M21 75 L119 75 L115 145 L25 145 Z" fill={`url(#${id})`} opacity="0.85"/>
        <path d="M20 25 L120 25" stroke="rgba(201,169,110,0.9)" strokeWidth="2.5" strokeLinecap="round"/>
        <rect x="35" y="35" width="28" height="28" rx="4" fill="rgba(200,220,255,0.15)" stroke="rgba(200,220,255,0.3)" strokeWidth="1"/>
        <rect x="70" y="42" width="22" height="22" rx="3" fill="rgba(200,220,255,0.15)" stroke="rgba(200,220,255,0.3)" strokeWidth="1"/>
      </svg>
    ),
    martini: (
      <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
          <clipPath id={`clip-${shape}`}>
            <path d="M15 20 L145 20 L80 110 Z" />
          </clipPath>
        </defs>
        <path d="M15 20 L145 20 L80 110 Z" fill="rgba(201,169,110,0.08)" stroke="rgba(201,169,110,0.5)" strokeWidth="1.5"/>
        <path d="M15 20 L145 20 L80 110 Z" fill={`url(#${id})`} opacity="0.75" clipPath={`url(#clip-${shape})`}/>
        <path d="M15 20 L145 20" stroke="rgba(201,169,110,0.9)" strokeWidth="2.5"/>
        <line x1="80" y1="110" x2="80" y2="170" stroke="rgba(201,169,110,0.4)" strokeWidth="2"/>
        <path d="M50 170 L110 170" stroke="rgba(201,169,110,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
    wine: (
      <svg viewBox="0 0 140 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <ellipse cx="70" cy="70" rx="45" ry="55" fill="rgba(201,169,110,0.08)" stroke="rgba(201,169,110,0.5)" strokeWidth="1.5"/>
        <ellipse cx="70" cy="95" rx="43" ry="32" fill={`url(#${id})`} opacity="0.8"/>
        <ellipse cx="70" cy="15" rx="45" ry="8" fill="none" stroke="rgba(201,169,110,0.9)" strokeWidth="2"/>
        <line x1="70" y1="125" x2="70" y2="175" stroke="rgba(201,169,110,0.4)" strokeWidth="2"/>
        <path d="M45 175 L95 175" stroke="rgba(201,169,110,0.6)" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  }

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full blur-3xl opacity-20" style={{ background: `radial-gradient(circle, ${c1}, transparent)` }} />
      <div className="relative w-40 h-52 drop-shadow-2xl">
        {glasses[shape] || glasses.coupe}
      </div>
    </div>
  )
}

// ─── Flavor Radar Graph ───────────────────────────────────────────────────────

function FlavorRadar({ profile }) {
  const dims = FLAVOR_DIMS
  const n = dims.length
  const cx = 120, cy = 120, maxR = 90

  const angleOf = (i) => (Math.PI * 2 * i) / n - Math.PI / 2

  const point = (i, r) => ({
    x: cx + r * Math.cos(angleOf(i)),
    y: cy + r * Math.sin(angleOf(i)),
  })

  const gridLevels = [2, 4, 6, 8, 10]
  const scorePoints = dims.map((d, i) => {
    const v = Math.max(0, Math.min(10, profile[d] || 0))
    return point(i, (v / 10) * maxR)
  })

  const scorePath = scorePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'

  return (
    <div className="w-full flex justify-center">
      <svg viewBox="0 0 240 240" className="w-52 h-52">
        <defs>
          <radialGradient id="radar-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c9a96e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#c9a96e" stopOpacity="0.08" />
          </radialGradient>
        </defs>

        {gridLevels.map(level => {
          const pts = dims.map((_, i) => point(i, (level / 10) * maxR))
          const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z'
          return <path key={level} d={path} fill="none" stroke="rgba(201,169,110,0.1)" strokeWidth="0.8" />
        })}

        {dims.map((_, i) => {
          const end = point(i, maxR)
          return <line key={i} x1={cx} y1={cy} x2={end.x.toFixed(1)} y2={end.y.toFixed(1)} stroke="rgba(201,169,110,0.12)" strokeWidth="0.8" />
        })}

        <path d={scorePath} fill="url(#radar-fill)" stroke="#c9a96e" strokeWidth="1.5" strokeLinejoin="round" />

        {scorePoints.map((p, i) => (
          <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill="#c9a96e" />
        ))}

        {dims.map((dim, i) => {
          const labelR = maxR + 18
          const lp = point(i, labelR)
          const anchor = lp.x < cx - 5 ? 'end' : lp.x > cx + 5 ? 'start' : 'middle'
          return (
            <text key={dim} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor={anchor} dominantBaseline="middle"
              fontSize="8" fontWeight="700" letterSpacing="0.05em" fill="rgba(232,220,192,0.65)" fontFamily="sans-serif">
              {dim.toUpperCase()}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Training Chip Strip ──────────────────────────────────────────────────────

function trainingChips(cocktail, profile) {
  const chips = []
  const text = [cocktail.conceptStory, cocktail.guestDescription, cocktail.menuRole].join(' ').toLowerCase()

  if (profile.Sweet >= 6) chips.push({ label: 'Sweet', color: '#d4844a' })
  if (profile.Sour >= 6) chips.push({ label: 'Bright', color: '#a5c224' })
  if (profile.Sour >= 5) chips.push({ label: 'Refreshing', color: '#4caf7d' })
  if (profile.Bitter >= 5) chips.push({ label: 'Bitter Finish', color: '#8b4a9c' })
  if (profile.Smoky >= 5) chips.push({ label: 'Smoky', color: '#6b4a2a' })
  if (profile.Savory >= 4) chips.push({ label: 'Savory', color: '#4a8b6b' })
  if (profile.Creamy >= 5) chips.push({ label: 'Silky', color: '#c9a96e' })
  if (profile.Spicy >= 4) chips.push({ label: 'Spice Driven', color: '#c44a00' })
  if (profile.Dry >= 6) chips.push({ label: 'Dry', color: '#6b705c' })

  if (/tropical/.test(text)) chips.push({ label: 'Tropical', color: '#e8a04a' })
  if (/aromatic|herb/.test(text)) chips.push({ label: 'Aromatic', color: '#6b8c42' })
  if (/spirit forward|stirred/.test(text)) chips.push({ label: 'Spirit Forward', color: '#c9a96e' })
  if (/floral/.test(text)) chips.push({ label: 'Floral', color: '#c47a9c' })
  if (/low abv|spritz|aperitif/.test(text)) chips.push({ label: 'Low ABV', color: '#4a8b6b' })
  if (/event|batchable|batch/.test(text)) chips.push({ label: 'Event Ready', color: '#4a6b8b' })

  const seen = new Set()
  return chips.filter(c => { if (seen.has(c.label)) return false; seen.add(c.label); return true }).slice(0, 8)
}

// ─── Quick Idea Chips ────────────────────────────────────────────────────────

const QUICK_IDEAS = [
  'tropical savory tequila highball',
  'clarified gin cocktail with jasmine and mango',
  'low ABV spritz inspired by Bangkok street fruit',
  'milk punch inspired by Thai dessert culture',
  'mezcal and grapefruit highball for a wedding reception',
  'refreshing summer aperitif, low alcohol, bright and herbal',
  'premium stirred cocktail for a fine dining signature',
]

// ─── Sub Components ───────────────────────────────────────────────────────────

function SpecRow({ ingredient, ml, role }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-[#c9a96e]/08 py-3">
      <span className="w-14 shrink-0 text-right font-mono text-sm font-bold text-[#c9a96e]">
        {ml > 0 ? `${ml} ml` : '—'}
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-[#f5f5f0]">{ingredient}</span>
      {role && <span className="shrink-0 text-[10px] uppercase tracking-widest text-[#e8dcc0]/40">{role}</span>}
    </div>
  )
}

// ─── Product Picker ───────────────────────────────────────────────────────────
// Styled inline listbox — replaces the native <select> which ignores dark-theme CSS.

function ProductPicker({ suggestedProducts, onSelect, onCancel }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return suggestedProducts
    return suggestedProducts.filter(p =>
      p.brand.toLowerCase().includes(q) ||
      p.product_name.toLowerCase().includes(q) ||
      (p.category_id || '').toLowerCase().includes(q)
    )
  }, [query, suggestedProducts])

  return (
    <div className="mt-2 overflow-hidden rounded-xl border border-[#c9a96e]/20 bg-[#0d0c0a]">
      {/* Search bar */}
      <div className="flex items-center gap-2 border-b border-[#c9a96e]/10 px-3 py-2">
        <input
          autoFocus
          type="text"
          placeholder="Search products…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-[11px] text-[#e8dcc0] outline-none placeholder:text-[#e8dcc0]/25"
        />
        <button
          onClick={onCancel}
          className="shrink-0 text-[9px] text-[#e8dcc0]/30 transition-colors hover:text-[#e8dcc0]/60"
        >✕</button>
      </div>

      {/* Product list */}
      <div className="max-h-52 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-3 py-3 text-[10px] text-[#e8dcc0]/30">
            No matching products — fallback costing will be used.
          </div>
        ) : (
          filtered.map(p => {
            const isVerified = p.data_status === 'verified_source_backed'
            const effectivePrice = isVerified && p.actual_venue_price_nis != null
              ? p.actual_venue_price_nis
              : p.benchmark_price_nis
            const cpm = effectivePrice && p.bottle_size_ml
              ? (effectivePrice / p.bottle_size_ml).toFixed(3)
              : null
            return (
              <button
                key={p.product_id}
                onClick={() => onSelect(p.product_id)}
                className="w-full border-b border-[#c9a96e]/06 px-3 py-2 text-left transition-colors last:border-0 hover:bg-[#c9a96e]/08"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-[#e8dcc0]">{p.brand}</span>
                    {p.product_name !== p.brand && (
                      <span className="ml-1 text-[10px] text-[#e8dcc0]/50">{p.product_name}</span>
                    )}
                  </div>
                  {cpm && (
                    <span className={`shrink-0 font-mono text-[10px] ${isVerified ? 'text-emerald-400' : 'text-[#c9a96e]'}`}>₪{cpm}/ml</span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[9px] text-[#e8dcc0]/30">{p.bottle_size_ml}ml</span>
                  <span className="text-[9px] text-[#e8dcc0]/20">·</span>
                  <span className="text-[9px] text-[#e8dcc0]/30">{(p.category_id || '').replace(/_/g, ' ')}</span>
                  {isVerified
                    ? <span className="ml-auto rounded-full border border-emerald-800/25 bg-emerald-950/15 px-1.5 py-0.5 text-[8px] text-emerald-400">verified</span>
                    : <span className="ml-auto rounded-full border border-amber-800/25 bg-amber-950/15 px-1.5 py-0.5 text-[8px] text-amber-400/70">est.</span>
                  }
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Cost Row ─────────────────────────────────────────────────────────────────

function CostRow({ ingredient, ml, cpm, total, isExplicitlyLinked, linkedProductName, cpmDelta, isLinking, suggestedProducts, onLink, onUnlink, onSelectProduct, onCancelLink }) {
  return (
    <div className="border-b border-[#c9a96e]/08 py-2.5 text-xs">
      <div className="grid grid-cols-[1fr_40px_60px_60px] items-center gap-2">
        <div className="min-w-0">
          <span className="font-medium text-[#e8dcc0]">{ingredient}</span>
          {isExplicitlyLinked && (
            <span className="ml-1.5 inline-flex items-center rounded-full border border-emerald-800/30 bg-emerald-950/30 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-emerald-400">Linked</span>
          )}
        </div>
        <span className="text-right font-mono text-[#e8dcc0]/55">{ml}ml</span>
        <span className="text-right font-mono text-[#e8dcc0]/55">₪{cpm.toFixed(2)}/ml</span>
        <span className="text-right font-bold text-[#c9a96e]">₪{total.toFixed(2)}</span>
      </div>

      {isExplicitlyLinked && !isLinking && (
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {linkedProductName && (
            <span className="truncate max-w-[180px] text-[9px] text-[#e8dcc0]/30">{linkedProductName}</span>
          )}
          {cpmDelta != null && (
            <span className={`font-mono text-[9px] ${
              Math.abs(cpmDelta) < 0.001
                ? 'text-[#e8dcc0]/30'
                : cpmDelta > 0
                  ? 'text-orange-400/70'
                  : 'text-emerald-400/70'
            }`}>
              {Math.abs(cpmDelta) < 0.001
                ? 'Same as estimate'
                : `${cpmDelta > 0 ? '+' : ''}₪${cpmDelta.toFixed(3)}/ml vs estimate`}
            </span>
          )}
          <button
            onClick={onUnlink}
            className="ml-auto shrink-0 text-[9px] text-[#e8dcc0]/25 transition-colors hover:text-red-400/60"
          >Unlink</button>
        </div>
      )}

      {!isExplicitlyLinked && !isLinking && (
        <button
          onClick={onLink}
          className="mt-0.5 text-[9px] text-[#e8dcc0]/25 transition-colors hover:text-[#c9a96e]/60"
        >+ Link product</button>
      )}

      {isLinking && (
        <ProductPicker
          suggestedProducts={suggestedProducts}
          onSelect={onSelectProduct}
          onCancel={onCancelLink}
        />
      )}
    </div>
  )
}

function AdjustSlider({ label, value, onChange, min = -4, max = 4 }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-[11px] font-black uppercase tracking-widest text-[#e8dcc0]/60">{label}</span>
      <div className="flex flex-1 items-center gap-2">
        <button onClick={() => onChange(Math.max(min, value - 1))}
          className="h-7 w-7 rounded-full border border-[#c9a96e]/20 bg-black/30 text-sm font-bold text-[#c9a96e] transition hover:bg-[#c9a96e]/15">−</button>
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
          className="flex-1 accent-[#c9a96e] h-1.5" />
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="h-7 w-7 rounded-full border border-[#c9a96e]/20 bg-black/30 text-sm font-bold text-[#c9a96e] transition hover:bg-[#c9a96e]/15">+</button>
      </div>
      <span className="w-8 text-right text-[11px] font-mono font-bold text-[#c9a96e]">{value > 0 ? `+${value}` : value}</span>
    </div>
  )
}

function StatusBadge({ type, children }) {
  const styles = {
    info: 'border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]',
    success: 'border-emerald-800/30 bg-emerald-950/30 text-emerald-300',
    error: 'border-red-800/30 bg-red-950/30 text-red-300',
  }
  return (
    <div className={`rounded-2xl border px-5 py-3 text-sm font-medium leading-6 ${styles[type] || styles.info}`}>
      {children}
    </div>
  )
}

// ─── Generated Cocktail View ─────────────────────────────────────────────────

function CocktailResultView({ proposal, onApprove, onSaveDraft, onSubmitApproval, onArchive, onRegenerate }) {
  const [adjust, setAdjust] = useState({ sweetness: 0, sourness: 0, abv: 0, carbonation: 0 })
  const [editName, setEditName] = useState(proposal.name || '')
  const [showCost, setShowCost] = useState(true)
  const [approvedLocal, setApprovedLocal] = useState(false)

  // ingredientLinks: keyed by ingredient INDEX (not name) to prevent duplicate-name collisions.
  // Initialized from product_id fields already on saved ingredient rows (backward-compatible:
  // Phase 3 drafts stored product_id directly on ingredientsMl entries, which we read here).
  const [ingredientLinks, setIngredientLinks] = useState(() => {
    const links = {}
    ;(proposal.ingredientsMl || proposal.ingredientObjects || []).forEach((ing, i) => {
      if (ing.product_id) {
        links[i] = {
          product_id: ing.product_id,
          product_name: ing.product_name || null,
          product_category: ing.product_category || null,
          product_confidence_level: ing.product_confidence_level || 'medium',
          product_data_status: ing.product_data_status || 'benchmark_estimate',
        }
      }
    })
    return links
  })
  // linkingIdx: the ings[] index of the row currently showing the picker, or null.
  const [linkingIdx, setLinkingIdx] = useState(null)

  const ings = proposal.ingredientsMl || proposal.ingredientObjects || []

  // mergedIngs injects product_id and related fields from local link state (index-keyed) into
  // the ingredient array before costing so the adapter can use Priority 0 resolution.
  const mergedIngs = useMemo(
    () => ings.map((ing, i) => ingredientLinks[i] ? { ...ing, ...ingredientLinks[i] } : ing),
    [ings, ingredientLinks]
  )

  // nonZeroIndices: maps cost.rows[j] → original ings[] index. Needed because buildCostSheet
  // filters out 0-ml ingredients, so cost row j ≠ ings index j.
  const nonZeroIndices = useMemo(
    () => ings.reduce((acc, ing, i) => { if ((ing.amountMl || 0) > 0) acc.push(i); return acc }, []),
    [ings]
  )

  const profile = useMemo(() => inferFlavorProfile(proposal, adjust), [proposal, adjust])
  const abv = useMemo(() => estimateABV(ings, adjust.abv * 1.2), [ings, adjust.abv])
  const cost = useMemo(() => buildCostSheet(mergedIngs, proposal.targetPrice), [mergedIngs, proposal.targetPrice])
  const chips = useMemo(() => trainingChips(proposal, profile), [proposal, profile])

  // Merges current ingredient links back into the proposal before saving to localStorage.
  // Writes product_id and related fields directly onto each ingredientsMl entry by index.
  const proposalWithLinks = (overrides = {}) => ({
    ...proposal,
    name: editName,
    ...overrides,
    ingredientsMl: ings.map((ing, i) => ({ ...ing, ...(ingredientLinks[i] || {}) })),
  })

  const handleApprove = () => { setApprovedLocal(true); onApprove?.(proposalWithLinks()) }

  const statusLabel = proposal.status === 'approved' ? 'Approved' : proposal.status === 'awaitingApproval' ? 'Pending Review' : proposal.fallbackGenerated ? 'Fallback Draft' : 'Generated'

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">
          {statusLabel}
        </span>
        {proposal.fallbackGenerated && (
          <span className="rounded-full border border-amber-800/30 bg-amber-950/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-300">Fallback Mode</span>
        )}
      </div>

      {/* Visual + Profile */}
      <div className="grid gap-6 md:grid-cols-[200px_1fr]">
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-[#c9a96e]/12 bg-black/25 p-5">
          <CocktailVisual cocktail={proposal} profile={profile} />
          <div className="text-center">
            <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/45">Glassware</div>
            <div className="mt-1 text-xs font-bold text-[#e8dcc0]">{proposal.glassware || '—'}</div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[1fr_220px]">
          {/* Profile Text */}
          <div className="space-y-4">
            <input
              value={editName}
              onChange={e => setEditName(e.target.value)}
              className="w-full border-0 bg-transparent p-0 font-serif text-5xl font-black leading-none tracking-tight text-[#f5f5f0] outline-none transition focus:text-[#c9a96e] sm:text-6xl"
            />
            <div className="flex flex-wrap gap-3">
              <div className="rounded-[1.2rem] border border-[#6b705c]/20 bg-black/20 px-4 py-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/45">Style</div>
                <div className="mt-1 text-xs font-bold text-[#e8dcc0]">{proposal.menuRole || '—'}</div>
              </div>
              <div className="rounded-[1.2rem] border border-[#6b705c]/20 bg-black/20 px-4 py-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/45">ABV</div>
                <div className="mt-1 text-xs font-bold text-[#c9a96e]">{abv}%</div>
              </div>
              <div className="rounded-[1.2rem] border border-[#6b705c]/20 bg-black/20 px-4 py-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/45">Method</div>
                <div className="mt-1 text-xs font-bold text-[#e8dcc0]">{proposal.method?.split('.')[0] || '—'}</div>
              </div>
              <div className="rounded-[1.2rem] border border-[#6b705c]/20 bg-black/20 px-4 py-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/45">Garnish</div>
                <div className="mt-1 text-xs font-bold text-[#e8dcc0]">{proposal.garnish || '—'}</div>
              </div>
            </div>
            <p className="text-sm leading-7 text-[#e8dcc0]">{proposal.guestDescription || proposal.conceptStory}</p>
          </div>

          {/* Radar */}
          <div className="rounded-[2rem] border border-[#c9a96e]/12 bg-black/20 p-4">
            <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/45">Flavor Map</div>
            <FlavorRadar profile={profile} />
          </div>
        </div>
      </div>

      {/* Recipe Spec Sheet */}
      <div className="rounded-[2rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#12110e,#0a0908)] p-6">
        <div className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Recipe Spec Sheet</div>
        <div className="divide-y divide-[#c9a96e]/06">
          {ings.filter(i => i.amountMl > 0).map((ing, i) => (
            <SpecRow key={i} ingredient={ing.ingredient} ml={ing.amountMl} role={ing.role} />
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/40">Ice</div>
            <div className="mt-1 text-xs text-[#e8dcc0]">{proposal.ice || '—'}</div>
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/40">Prep Notes</div>
            <div className="mt-1 text-xs text-[#e8dcc0]">{proposal.prepNotes || '—'}</div>
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/40">Service</div>
            <div className="mt-1 text-xs text-[#e8dcc0]">{proposal.serviceNote || proposal.bartenderScript || '—'}</div>
          </div>
        </div>
      </div>

      {/* Live Adjust Panel */}
      <div className="rounded-[2rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#0f0e0b,#090907)] p-6">
        <div className="mb-5">
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Adjust Cocktail</div>
          <p className="mt-1 text-xs text-[#e8dcc0]/55">Tune the profile. The flavor map updates live. Save to regenerate.</p>
        </div>
        <div className="space-y-4">
          <AdjustSlider label="Sweetness" value={adjust.sweetness} onChange={v => setAdjust(a => ({ ...a, sweetness: v }))} />
          <AdjustSlider label="Sourness" value={adjust.sourness} onChange={v => setAdjust(a => ({ ...a, sourness: v }))} />
          <AdjustSlider label="ABV" value={adjust.abv} onChange={v => setAdjust(a => ({ ...a, abv: v }))} />
          <AdjustSlider label="Carbonation" value={adjust.carbonation} onChange={v => setAdjust(a => ({ ...a, carbonation: v }))} />
        </div>
        <button
          onClick={() => onRegenerate?.(`Adjust: sweetness ${adjust.sweetness > 0 ? '+' : ''}${adjust.sweetness}, sourness ${adjust.sourness > 0 ? '+' : ''}${adjust.sourness}, ABV ${adjust.abv > 0 ? '+' : ''}${adjust.abv}, carbonation ${adjust.carbonation > 0 ? '+' : ''}${adjust.carbonation}`)}
          className="mt-5 rounded-[1.2rem] border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-6 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e] transition hover:bg-[#c9a96e]/20"
        >
          Save Changes
        </button>
      </div>

      {/* Food Cost Table */}
      <div className="rounded-[2rem] border border-[#c9a96e]/15 bg-[linear-gradient(135deg,#0f0e0b,#090907)] p-6">
        <button className="flex w-full items-center justify-between gap-3" onClick={() => setShowCost(v => !v)}>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Food Cost</div>
            <p className="mt-1 text-xs text-[#e8dcc0]/55">Ingredient cost breakdown and pricing logic.</p>
          </div>
          <span className="rounded-full border border-[#c9a96e]/20 bg-black/20 px-3 py-1 text-[10px] font-black text-[#c9a96e]">{showCost ? 'Hide' : 'Show'}</span>
        </button>

        {showCost && (
          <div className="mt-5">
            <div className="grid grid-cols-[1fr_40px_60px_60px] gap-2 pb-2 text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">
              <span>Ingredient</span><span className="text-right">ml</span><span className="text-right">Cost/ml</span><span className="text-right">Total</span>
            </div>
            <div className="divide-y divide-[#c9a96e]/06">
              {cost.rows.map((r, j) => {
                const ingIdx = nonZeroIndices[j]
                const link = ingredientLinks[ingIdx]
                // cpmDelta: difference between linked CPM and what fallback would have used.
                // Computed only when explicitly linked so we don't call fallback on every render.
                const fallbackCpm = link ? getIngredientFallbackCpm(r.ingredient) : null
                const cpmDelta = link != null ? r.cpm - fallbackCpm : null
                return (
                  <CostRow
                    key={j}
                    {...r}
                    isExplicitlyLinked={!!link}
                    linkedProductName={link?.product_name}
                    cpmDelta={cpmDelta}
                    isLinking={linkingIdx === ingIdx}
                    suggestedProducts={getProductsForIngredient(r.ingredient).map(p => getEffectiveProduct(p.product_id) || p)}
                    onLink={() => setLinkingIdx(ingIdx)}
                    onUnlink={() => {
                      setIngredientLinks(prev => { const n = { ...prev }; delete n[ingIdx]; return n })
                      setLinkingIdx(null)
                    }}
                    onSelectProduct={pid => {
                      const product = getEffectiveProduct(pid)
                      if (product) {
                        setIngredientLinks(prev => ({
                          ...prev,
                          [ingIdx]: {
                            product_id: pid,
                            product_name: `${product.brand} ${product.product_name}`.trim(),
                            product_category: product.category_id,
                            product_confidence_level: product.confidence_level || 'medium',
                            product_data_status: product.data_status || 'benchmark_estimate',
                          },
                        }))
                      }
                      setLinkingIdx(null)
                    }}
                    onCancelLink={() => setLinkingIdx(null)}
                  />
                )
              })}
            </div>
            <div className="grid grid-cols-[1fr_40px_60px_60px] items-center gap-2 py-2.5 text-xs border-t border-[#c9a96e]/10 mt-1">
              <span className="font-medium text-[#e8dcc0]/50">Bartender Labor</span>
              <span className="text-right font-mono text-[#e8dcc0]/30">2 min</span>
              <span className="text-right font-mono text-[#e8dcc0]/30">—</span>
              <span className="text-right font-bold text-[#e8dcc0]/50">₪{cost.labor_cost_nis.toFixed(2)}</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4 border-t border-[#c9a96e]/15 pt-4">
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/40">Total Cost</div>
                <div className="mt-1 text-lg font-black text-[#f5f5f0]">₪{cost.totalCost.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/40">Pour Cost %</div>
                <div className={`mt-1 text-lg font-black ${cost.pourCost <= 22 ? 'text-emerald-400' : cost.pourCost <= 28 ? 'text-amber-300' : 'text-red-400'}`}>{cost.pourCost}%</div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/40">Standard Price</div>
                <div className="mt-1 text-lg font-black text-[#c9a96e]">₪{cost.suggested.toFixed(0)}</div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/40">Luxury Price</div>
                <div className="mt-1 text-lg font-black text-[#e8dcc0]">₪{cost.luxury.toFixed(0)}</div>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-800/25 bg-amber-950/15 px-3 py-2">
              <span className="text-amber-400 text-[10px] mt-0.5">⚠</span>
              <span className="text-[10px] text-amber-300/65 leading-relaxed">Benchmark estimates — confirm against supplier invoices before finalizing menu pricing.</span>
            </div>
          </div>
        )}
      </div>

      {/* Training Notes */}
      {chips.length > 0 && (
        <div>
          <div className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Training Notes</div>
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {chips.map(chip => (
              <div key={chip.label} className="shrink-0 rounded-[1.2rem] border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.14em]"
                style={{ borderColor: chip.color + '40', backgroundColor: chip.color + '15', color: chip.color }}>
                {chip.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 border-t border-[#c9a96e]/12 pt-5">
        <button onClick={handleApprove}
          className="rounded-[1.35rem] bg-[#c9a96e] px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#11100d] shadow-[0_16px_48px_rgba(201,169,110,0.25)] transition hover:-translate-y-0.5 hover:bg-[#dfc497]">
          Approve Cocktail
        </button>
        <button onClick={() => onSaveDraft?.(proposalWithLinks())}
          className="rounded-[1.35rem] border border-[#c9a96e]/30 bg-[#c9a96e]/08 px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#c9a96e] transition hover:bg-[#c9a96e]/15">
          Save Draft
        </button>
        <button onClick={() => onSubmitApproval?.(proposalWithLinks())}
          className="rounded-[1.35rem] border border-[#6b705c]/25 bg-black/20 px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0] transition hover:border-[#c9a96e]/30">
          Submit for Review
        </button>
        <button onClick={() => onArchive?.(proposal)}
          className="rounded-[1.35rem] border border-[#6b705c]/15 bg-transparent px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/40 transition hover:text-[#e8dcc0]/70">
          Archive
        </button>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyStudio() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="pointer-events-none select-none font-serif text-[7rem] font-black leading-none text-[#c9a96e]/[0.06]">LAB</div>
      <div className="-mt-8">
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#e8dcc0]/30">Awaiting Direction</div>
        <p className="mt-3 max-w-xs text-sm leading-7 text-[#e8dcc0]/40">Describe a cocktail idea above and generate your first proposal.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3 max-w-xl w-full">
        {['Visual flavor mapping', 'Live spec editing', 'Real food cost tables'].map(f => (
          <div key={f} className="rounded-[1.5rem] border border-[#c9a96e]/10 bg-[#c9a96e]/04 px-4 py-3 text-[11px] font-bold text-[#e8dcc0]/40">{f}</div>
        ))}
      </div>
    </div>
  )
}

// ─── Main CocktailLabStudio ───────────────────────────────────────────────────

export default function CocktailLabStudio({ cocktailDrafts = [], approvedCocktails = [], archivedCocktails = [], onSaveDraft, onSubmitApproval, onApprove, onReject }) {
  const [prompt, setPrompt] = useState('')
  const [proposal, setProposal] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState(null)
  const textareaRef = useRef(null)

  const stats = useMemo(() => ({
    drafts: cocktailDrafts.filter(d => d.status === 'draft').length,
    awaiting: cocktailDrafts.filter(d => d.status === 'awaitingApproval').length,
    approved: approvedCocktails.length,
  }), [cocktailDrafts, approvedCocktails])

  const generate = useCallback(async (overridePrompt) => {
    const p = (overridePrompt || prompt).trim()
    if (!p || p.length < 6) { setStatus({ type: 'error', message: 'Describe your cocktail idea before generating.' }); return }
    setGenerating(true)
    setStatus({ type: 'info', message: 'Building your cocktail...' })
    try {
      const result = await requestCocktailProposal({
        agentPrompt: p,
        form: {},
        approvedCocktails,
        cocktailDrafts,
        menuAnalysis: null,
        variation: '',
        previousProposal: proposal,
      })
      const saved = onSaveDraft ? onSaveDraft(result.proposal) : result.proposal
      setProposal(saved)
      setStatus(result.source === 'fallback'
        ? { type: 'info', message: 'AI was unavailable — fallback draft generated. Taste and revise before approving.' }
        : { type: 'success', message: `${saved.name} is ready. Review, adjust, and approve when satisfied.` })
    } catch (err) {
      setStatus({ type: 'error', message: err?.message || 'Generation failed. Please try again.' })
    } finally {
      setGenerating(false)
    }
  }, [prompt, approvedCocktails, cocktailDrafts, onSaveDraft, proposal])

  const handleRegenerate = useCallback((variation) => {
    if (variation) generate(variation)
  }, [generate])

  const handleApprove = useCallback((p) => {
    const approved = onApprove?.(p)
    setProposal(approved)
    setStatus({ type: 'success', message: `${approved?.name || p.name} approved and published to the bar menu.` })
  }, [onApprove])

  const handleSaveDraft = useCallback((p) => {
    const saved = onSaveDraft?.(p)
    setProposal(saved)
    setStatus({ type: 'success', message: `${saved?.name || p.name} saved as a draft.` })
  }, [onSaveDraft])

  const handleSubmitApproval = useCallback((p) => {
    const awaiting = onSubmitApproval?.(p)
    setProposal(awaiting)
    setStatus({ type: 'info', message: `${awaiting?.name || p.name} submitted for review.` })
  }, [onSubmitApproval])

  const handleArchive = useCallback((p) => {
    onReject?.(p)
    setProposal(null)
    setStatus({ type: 'info', message: 'Cocktail archived.' })
  }, [onReject])

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.38em] text-[#c9a96e]">Bar Management</div>
          <h1 className="mt-3 font-serif text-6xl font-black leading-none tracking-tight text-[#f5f5f0] sm:text-7xl">Cocktail Lab</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#e8dcc0]/70">Design, cost, and approve cocktails. Powered by AI, built for real operations.</p>
        </div>
        <div className="flex gap-3">
          {[['Drafts', stats.drafts], ['Pending', stats.awaiting], ['Approved', stats.approved]].map(([l, v]) => (
            <div key={l} className="rounded-[1.2rem] border border-[#6b705c]/20 bg-black/20 px-4 py-3 text-center">
              <div className="font-serif text-2xl font-black text-[#c9a96e]">{v}</div>
              <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/45">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[#c9a96e]/18 bg-[radial-gradient(circle_at_80%_10%,rgba(201,169,110,0.12),transparent_40%),linear-gradient(135deg,#13120f,#090907)] p-7 shadow-[0_36px_120px_rgba(0,0,0,0.5)] sm:p-8">
        <div className="pointer-events-none absolute right-8 top-6 hidden font-serif text-[6rem] font-black leading-none text-[#c9a96e]/[0.04] 2xl:block">IDEAS</div>
        <div className="relative">
          <div className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e]">Describe Your Cocktail Idea</div>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
            rows={4}
            placeholder="Describe the cocktail idea… e.g. tropical savory tequila highball, or clarified gin with jasmine and mango"
            className="w-full resize-none rounded-[1.5rem] border border-[#c9a96e]/20 bg-black/25 px-6 py-5 font-serif text-xl leading-9 text-[#f5f5f0] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition placeholder:text-[#e8dcc0]/25 focus:border-[#c9a96e]/50 focus:ring-1 focus:ring-[#c9a96e]/20"
          />

          {/* Quick ideas */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {QUICK_IDEAS.map(idea => (
              <button key={idea} onClick={() => { setPrompt(idea); textareaRef.current?.focus() }}
                className="shrink-0 rounded-full border border-[#6b705c]/20 bg-black/20 px-4 py-1.5 text-[10px] font-bold text-[#e8dcc0]/55 transition hover:border-[#c9a96e]/30 hover:text-[#c9a96e]">
                {idea}
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => generate()}
              disabled={generating}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.35rem] bg-[#c9a96e] px-9 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#11100d] shadow-[0_18px_60px_rgba(201,169,110,0.25)] transition hover:-translate-y-0.5 hover:bg-[#dfc497] hover:shadow-[0_24px_80px_rgba(201,169,110,0.32)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#11100d]/40 border-t-[#11100d]" />
                  Building...
                </>
              ) : 'Generate Cocktail'}
            </button>
            <button onClick={() => { setPrompt(''); setStatus(null) }}
              className="rounded-[1.35rem] border border-[#6b705c]/20 bg-transparent px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/50 transition hover:border-[#c9a96e]/20 hover:text-[#e8dcc0]/80">
              Clear
            </button>
          </div>

          {status && <div className="mt-4"><StatusBadge type={status.type}>{status.message}</StatusBadge></div>}
        </div>
      </div>

      {/* Result Area */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[#c9a96e]/12 bg-[linear-gradient(135deg,#111009,#090907)] p-7 shadow-[0_36px_120px_rgba(0,0,0,0.45)] sm:p-8">
        {proposal
          ? <CocktailResultView
              proposal={proposal}
              onApprove={handleApprove}
              onSaveDraft={handleSaveDraft}
              onSubmitApproval={handleSubmitApproval}
              onArchive={handleArchive}
              onRegenerate={handleRegenerate}
            />
          : <EmptyStudio />
        }
      </div>
    </div>
  )
}
