import { useState, useMemo } from 'react'
import { canAccessBottlePrices } from '../../config/roleConfig.js'
import { BAR_PRODUCT_SEED } from '../../domain/hospitality/bar/barProductSeed.placeholders.js'
import { createPriceOutputCard } from '../../domain/hospitality/bar/barProductSchema.js'
import { BAR_PRODUCT_CATEGORIES } from '../../domain/hospitality/bar/barProductCategories.js'

const CONFIDENCE_COLORS = {
  high: 'text-emerald-400',
  medium: 'text-amber-300',
  low: 'text-orange-400',
  unknown: 'text-red-400'
}

const TIER_LABELS = {
  well: 'Well',
  call: 'Call',
  premium: 'Premium',
  super_premium: 'Super Premium',
  ultra_premium: 'Ultra Premium'
}

function PourCostRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#c9a96e]/08 last:border-0">
      <span className="text-[11px] text-[#e8dcc0]/50">{label}</span>
      <span className="font-mono text-[13px] font-black text-[#f5f5f0]">
        {value != null ? `₪${value.toFixed(2)}` : <span className="text-red-400/70">—</span>}
      </span>
    </div>
  )
}

function WarningBadge({ text }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-800/30 bg-amber-950/20 px-3 py-2">
      <span className="mt-0.5 text-amber-400 text-[10px]">⚠</span>
      <span className="text-[10px] text-amber-300/80 leading-relaxed">{text}</span>
    </div>
  )
}

function PriceCard({ card, onClose }) {
  const hasPrice = card.price_used_for_costing_nis != null

  return (
    <div className="rounded-[2rem] border border-[#c9a96e]/20 bg-[linear-gradient(135deg,#12110e,#090907)] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-[#c9a96e]/10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#c9a96e]">
              {TIER_LABELS[card.tier] ?? card.tier ?? '—'}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-[0.14em] ${CONFIDENCE_COLORS[card.confidence_level] ?? 'text-[#e8dcc0]/40'}`}>
              {card.confidence_level} confidence
            </span>
          </div>
          <h3 className="font-serif text-2xl font-black text-[#f5f5f0]">{card.brand}</h3>
          <p className="text-sm text-[#e8dcc0]/60 mt-0.5">{card.product_name}</p>
          <p className="text-[10px] text-[#e8dcc0]/35 mt-1">
            {card.bottle_size_ml}ml · {card.abv_percent != null ? `${card.abv_percent}% ABV` : 'ABV unknown'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/08 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/50 hover:text-[#e8dcc0] transition-colors"
        >
          Close
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Pricing source */}
        <div className="rounded-xl border border-[#c9a96e]/12 bg-[#c9a96e]/04 p-4">
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/35 mb-3">Pricing Source</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Benchmark price</div>
              <div className="font-mono text-lg font-black text-[#f5f5f0]">
                {card.benchmark_price_nis != null ? `₪${card.benchmark_price_nis}` : <span className="text-red-400/70 text-sm">Missing</span>}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Venue price (invoiced)</div>
              <div className="font-mono text-lg font-black text-[#e8dcc0]/40">
                {card.actual_venue_price_nis != null ? `₪${card.actual_venue_price_nis}` : '—'}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Supplier</div>
              <div className="text-sm text-[#e8dcc0]/50">{card.supplier_name ?? '—'}</div>
            </div>
            <div>
              <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Store</div>
              <div className="text-sm text-[#e8dcc0]/50">{card.store_name ?? '—'}</div>
            </div>
          </div>
          {card.best_ordering_recommendation && (
            <div className="mt-3 pt-3 border-t border-[#c9a96e]/10">
              <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Ordering recommendation</div>
              <div className="text-xs text-[#e8dcc0]/60">{card.best_ordering_recommendation}</div>
            </div>
          )}
        </div>

        {/* Pour cost breakdown */}
        <div className="rounded-xl border border-[#c9a96e]/12 bg-[#c9a96e]/04 p-4">
          <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/35 mb-3">
            Pour Cost (incl. 5% spillage)
          </div>
          {hasPrice ? (
            <>
              <PourCostRow label="Cost per ml" value={card.cost_per_ml_nis} />
              <PourCostRow label="30ml pour" value={card.cost_per_30ml_nis} />
              <PourCostRow label="45ml pour" value={card.cost_per_45ml_nis} />
              <PourCostRow label="60ml pour" value={card.cost_per_60ml_nis} />
            </>
          ) : (
            <div className="text-sm text-red-400/70 py-2">
              Supplier data missing — needs validation.
            </div>
          )}
        </div>

        {/* Price range */}
        {(card.lowest_known_price_nis != null || card.highest_known_price_nis != null) && (
          <div className="rounded-xl border border-[#c9a96e]/12 bg-[#c9a96e]/04 p-4">
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/35 mb-3">Observed Price Range</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Lowest known</div>
                <div className="font-mono text-base font-black text-emerald-400">
                  {card.lowest_known_price_nis != null ? `₪${card.lowest_known_price_nis}` : '—'}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Highest known</div>
                <div className="font-mono text-base font-black text-orange-400">
                  {card.highest_known_price_nis != null ? `₪${card.highest_known_price_nis}` : '—'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data warnings */}
        {card.missing_data_warnings.length > 0 && (
          <div className="space-y-2">
            <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#e8dcc0]/35">Data Warnings</div>
            {card.missing_data_warnings.map((w, i) => <WarningBadge key={i} text={w} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductRow({ product, isSelected, onSelect }) {
  const card = useMemo(() => createPriceOutputCard(product), [product])
  const hasPrice = card.price_used_for_costing_nis != null

  return (
    <button
      onClick={() => onSelect(isSelected ? null : product.product_id)}
      className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
        isSelected
          ? 'border-[#c9a96e]/40 bg-[#c9a96e]/08'
          : 'border-[#c9a96e]/10 bg-transparent hover:border-[#c9a96e]/25 hover:bg-[#c9a96e]/04'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-sm text-[#f5f5f0] truncate">{product.brand}</div>
          <div className="text-[11px] text-[#e8dcc0]/45 truncate">{product.product_name}</div>
        </div>
        <div className="shrink-0 text-right">
          {hasPrice ? (
            <>
              <div className="font-mono text-sm font-black text-[#c9a96e]">₪{card.benchmark_price_nis}</div>
              <div className="text-[10px] text-[#e8dcc0]/35">{product.bottle_size_ml}ml</div>
            </>
          ) : (
            <div className="text-[10px] text-red-400/60">No price data</div>
          )}
        </div>
      </div>
    </button>
  )
}

export default function BottlePrices({ currentUser }) {
  // Guard 1: component-level identity check (fail closed)
  if (!canAccessBottlePrices(currentUser)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="max-w-sm text-center space-y-3">
          <div className="text-4xl font-black text-red-500/40">—</div>
          <div className="font-serif text-xl font-black text-[#f5f5f0]">Access Restricted</div>
          <p className="text-sm text-[#e8dcc0]/45">
            Bottle pricing is restricted to authorized personnel only. Contact your system administrator.
          </p>
        </div>
      </div>
    )
  }

  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedProductId, setSelectedProductId] = useState(null)

  const categoriesWithProducts = useMemo(() => {
    const map = {}
    for (const product of BAR_PRODUCT_SEED) {
      if (!map[product.category_id]) map[product.category_id] = []
      map[product.category_id].push(product)
    }
    // Sort products within each category by brand name
    for (const cat in map) map[cat].sort((a, b) => a.brand.localeCompare(b.brand))
    return map
  }, [])

  const parentGroups = useMemo(() => {
    const groups = {}
    for (const catId of Object.keys(categoriesWithProducts)) {
      const catDef = BAR_PRODUCT_CATEGORIES[catId]
      if (!catDef) continue
      const parent = catDef.parent
      if (!groups[parent]) groups[parent] = []
      groups[parent].push(catId)
    }
    return groups
  }, [categoriesWithProducts])

  const filteredProducts = selectedCategory ? (categoriesWithProducts[selectedCategory] ?? []) : []

  const selectedProduct = selectedProductId
    ? BAR_PRODUCT_SEED.find(p => p.product_id === selectedProductId)
    : null

  const selectedCard = useMemo(
    () => (selectedProduct ? createPriceOutputCard(selectedProduct) : null),
    [selectedProduct]
  )

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.18em] text-[#c9a96e]/60">Pricing Intelligence</span>
          <span className="rounded-full border border-red-800/40 bg-red-950/30 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-red-400">Restricted</span>
        </div>
        <h1 className="font-serif text-3xl font-black text-[#f5f5f0]">Bottle Prices</h1>
        <p className="text-sm text-[#e8dcc0]/45">
          Benchmark pricing reference — {BAR_PRODUCT_SEED.length} products · All prices are estimates pending supplier validation
        </p>
      </div>

      {/* Global benchmark warning */}
      <div className="rounded-xl border border-amber-800/25 bg-amber-950/15 px-4 py-3 flex gap-3">
        <span className="text-amber-400 text-sm mt-0.5">⚠</span>
        <p className="text-[11px] text-amber-300/70 leading-relaxed">
          All prices are benchmark estimates derived from market research. No supplier quotes have been verified.
          Do not use for final menu pricing without confirming against a current invoice.
        </p>
      </div>

      {/* Category selection */}
      <div className="space-y-4">
        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/35">Category</div>
        {Object.entries(parentGroups).map(([parentId, catIds]) => {
          const parentDef = { label: parentId, ...({ labelText: parentId }) }
          const parentLabel = parentId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          return (
            <div key={parentId} className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]/25 pl-1">{parentLabel}</div>
              <div className="flex flex-wrap gap-2">
                {catIds.map(catId => {
                  const catDef = BAR_PRODUCT_CATEGORIES[catId]
                  const isActive = selectedCategory === catId
                  const count = categoriesWithProducts[catId]?.length ?? 0
                  return (
                    <button
                      key={catId}
                      onClick={() => {
                        setSelectedCategory(isActive ? null : catId)
                        setSelectedProductId(null)
                      }}
                      className={`rounded-full border px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] transition-all ${
                        isActive
                          ? 'border-[#c9a96e]/50 bg-[#c9a96e]/15 text-[#c9a96e]'
                          : 'border-[#c9a96e]/15 bg-transparent text-[#e8dcc0]/50 hover:border-[#c9a96e]/30 hover:text-[#e8dcc0]/80'
                      }`}
                    >
                      {catDef?.label ?? catId} <span className="opacity-50">({count})</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Product list */}
      {selectedCategory && (
        <div className="space-y-2">
          <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/35">
            {BAR_PRODUCT_CATEGORIES[selectedCategory]?.label ?? selectedCategory} — {filteredProducts.length} products
          </div>
          <div className="space-y-1.5">
            {filteredProducts.map(product => (
              <ProductRow
                key={product.product_id}
                product={product}
                isSelected={selectedProductId === product.product_id}
                onSelect={setSelectedProductId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Price output card */}
      {selectedCard && (
        <PriceCard
          card={{ ...selectedCard, tier: selectedProduct?.tier }}
          onClose={() => setSelectedProductId(null)}
        />
      )}

      {!selectedCategory && (
        <div className="pt-6 text-center">
          <p className="text-sm text-[#e8dcc0]/30">Select a category above to browse products</p>
        </div>
      )}
    </div>
  )
}
