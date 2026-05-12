import { useState, useMemo } from 'react'
import { canAccessBottlePrices } from '../../config/roleConfig.js'
import { BAR_PRODUCT_SEED } from '../../domain/hospitality/bar/barProductSeed.placeholders.js'
import { createPriceOutputCard } from '../../domain/hospitality/bar/barProductSchema.js'
import { BAR_PRODUCT_CATEGORIES } from '../../domain/hospitality/bar/barProductCategories.js'
import {
  APPROVED_SOURCE_TYPES,
  validateVerifiedPriceUpdate,
  applyVerifiedPriceUpdate,
} from '../../domain/hospitality/bar/verifiedPriceIngestion.js'

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

const SOURCE_TYPE_LABELS = {
  invoice: 'Invoice',
  supplier_quote: 'Supplier Quote',
  supplier_catalog: 'Supplier Catalog',
  direct_supplier_confirmation: 'Direct Supplier Confirmation',
}

const INPUT_CLS = 'w-full rounded-lg border border-[#c9a96e]/20 bg-[#0d0c09] px-3 py-2 text-sm text-[#f5f5f0] placeholder-[#e8dcc0]/20 focus:outline-none focus:border-[#c9a96e]/45 transition-colors'

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function FormField({ label, required, children }) {
  return (
    <div className="space-y-1">
      <label className={`block text-[10px] font-black uppercase tracking-[0.14em] ${required ? 'text-[#c9a96e]' : 'text-[#e8dcc0]/40'}`}>
        {label}{required ? ' *' : ''}
      </label>
      {children}
    </div>
  )
}

// ─── Verified Price Form ──────────────────────────────────────────────────────

function VerifiedPriceForm({ product, currentUser }) {
  const [open, setOpen] = useState(false)
  const [fields, setFields] = useState(() => ({
    actual_venue_price_nis: '',
    supplier_name: '',
    source_type: '',
    source_reference: '',
    last_verified_at: new Date().toISOString().slice(0, 10),
    vat_included: '',
    verified_by: currentUser?.username || '',
    invoice_number: '',
    invoice_date: '',
    store_name: '',
    supplier_contact: '',
    notes: '',
  }))
  const [verifiedProduct, setVerifiedProduct] = useState(null)

  const update = useMemo(() => ({
    product_id: product.product_id,
    actual_venue_price_nis: fields.actual_venue_price_nis !== '' ? Number(fields.actual_venue_price_nis) : null,
    supplier_name: fields.supplier_name,
    source_type: fields.source_type || null,
    source_reference: fields.source_reference,
    last_verified_at: fields.last_verified_at,
    vat_included: fields.vat_included === 'true' ? true : fields.vat_included === 'false' ? false : null,
    verified_by: fields.verified_by,
    invoice_number: fields.invoice_number || null,
    invoice_date: fields.invoice_date || null,
    store_name: fields.store_name || null,
    supplier_contact: fields.supplier_contact || null,
    notes: fields.notes || null,
  }), [fields, product.product_id])

  const validation = useMemo(() => validateVerifiedPriceUpdate(update), [update])

  function set(key, value) {
    setFields(f => ({ ...f, [key]: value }))
    setVerifiedProduct(null)
  }

  function handleSubmit() {
    const result = applyVerifiedPriceUpdate(product, update)
    if (result.validation.valid) setVerifiedProduct(result.product)
  }

  const verifiedCard = useMemo(
    () => (verifiedProduct ? createPriceOutputCard(verifiedProduct) : null),
    [verifiedProduct]
  )

  return (
    <div className="border-t border-[#c9a96e]/10 pt-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-[#c9a96e]/15 bg-[#c9a96e]/04 px-4 py-2.5 text-left transition hover:border-[#c9a96e]/30 hover:bg-[#c9a96e]/07"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c9a96e]">Add Verified Price</span>
        <span className="text-[#c9a96e]/50 text-[10px]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-5">

          {/* Required fields */}
          <div className="space-y-3">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/25">Required</div>

            <FormField label="Venue Price (₪)" required>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 189"
                value={fields.actual_venue_price_nis}
                onChange={e => set('actual_venue_price_nis', e.target.value)}
                className={INPUT_CLS}
              />
            </FormField>

            <FormField label="Supplier Name" required>
              <input
                type="text"
                placeholder="Supplier company name"
                value={fields.supplier_name}
                onChange={e => set('supplier_name', e.target.value)}
                className={INPUT_CLS}
              />
            </FormField>

            <FormField label="Source Type" required>
              <select
                value={fields.source_type}
                onChange={e => set('source_type', e.target.value)}
                className={INPUT_CLS}
              >
                <option value="">Select source type...</option>
                {APPROVED_SOURCE_TYPES.map(t => (
                  <option key={t} value={t}>{SOURCE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Source Reference" required>
              <input
                type="text"
                placeholder="Invoice number, quote ID, catalog page..."
                value={fields.source_reference}
                onChange={e => set('source_reference', e.target.value)}
                className={INPUT_CLS}
              />
            </FormField>

            <FormField label="Verified Date" required>
              <input
                type="date"
                value={fields.last_verified_at}
                onChange={e => set('last_verified_at', e.target.value)}
                className={INPUT_CLS}
              />
            </FormField>

            <FormField label="VAT Included" required>
              <select
                value={fields.vat_included}
                onChange={e => set('vat_included', e.target.value)}
                className={INPUT_CLS}
              >
                <option value="">Select...</option>
                <option value="true">Yes — price includes VAT</option>
                <option value="false">No — price excludes VAT</option>
              </select>
            </FormField>

            <FormField label="Verified By" required>
              <input
                type="text"
                placeholder="Your name"
                value={fields.verified_by}
                onChange={e => set('verified_by', e.target.value)}
                className={INPUT_CLS}
              />
            </FormField>
          </div>

          {/* Optional fields */}
          <div className="space-y-3">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-[#e8dcc0]/25">Optional</div>

            <FormField label="Invoice Number">
              <input
                type="text"
                placeholder="e.g. INV-2026-0442"
                value={fields.invoice_number}
                onChange={e => set('invoice_number', e.target.value)}
                className={INPUT_CLS}
              />
            </FormField>

            <FormField label="Invoice Date">
              <input
                type="date"
                value={fields.invoice_date}
                onChange={e => set('invoice_date', e.target.value)}
                className={INPUT_CLS}
              />
            </FormField>

            <FormField label="Store Name">
              <input
                type="text"
                placeholder="Physical store if purchased retail"
                value={fields.store_name}
                onChange={e => set('store_name', e.target.value)}
                className={INPUT_CLS}
              />
            </FormField>

            <FormField label="Supplier Contact">
              <input
                type="text"
                placeholder="Contact person at supplier"
                value={fields.supplier_contact}
                onChange={e => set('supplier_contact', e.target.value)}
                className={INPUT_CLS}
              />
            </FormField>

            <FormField label="Notes">
              <textarea
                rows={2}
                placeholder="Any additional provenance notes..."
                value={fields.notes}
                onChange={e => set('notes', e.target.value)}
                className={`${INPUT_CLS} resize-none`}
              />
            </FormField>
          </div>

          {/* Validation errors */}
          {validation.errors.length > 0 && (
            <div className="rounded-xl border border-red-800/30 bg-red-950/15 p-3 space-y-1.5">
              <div className="text-[9px] font-black uppercase tracking-[0.14em] text-red-400 mb-1">Validation Errors</div>
              {validation.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-red-400 text-[10px] shrink-0 mt-0.5">×</span>
                  <span className="text-[10px] text-red-300/80 leading-relaxed">{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Validation warnings */}
          {validation.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-800/25 bg-amber-950/10 p-3 space-y-1.5">
              <div className="text-[9px] font-black uppercase tracking-[0.14em] text-amber-400 mb-1">Warnings</div>
              {validation.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 text-[10px] shrink-0 mt-0.5">⚠</span>
                  <span className="text-[10px] text-amber-300/80 leading-relaxed">{w}</span>
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!validation.valid}
            className={`w-full rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] transition-all ${
              validation.valid
                ? 'border-[#c9a96e]/40 bg-[#c9a96e]/15 text-[#c9a96e] hover:bg-[#c9a96e]/22 cursor-pointer'
                : 'border-[#6b705c]/15 bg-transparent text-[#e8dcc0]/20 cursor-not-allowed'
            }`}
          >
            {validation.valid ? 'Preview Verified Price' : 'Complete Required Fields to Preview'}
          </button>

          {/* Verified preview */}
          {verifiedProduct && verifiedCard && (
            <div className="rounded-xl border border-emerald-800/30 bg-emerald-950/10 p-4 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-[0.16em] text-emerald-400">Verified Preview</span>
                <span className="rounded-full border border-emerald-800/30 bg-emerald-950/40 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide text-emerald-400">
                  Local Only — Not Saved
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Venue Price</div>
                  <div className="font-mono text-lg font-black text-emerald-400">
                    ₪{verifiedCard.price_used_for_costing_nis}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Benchmark (preserved)</div>
                  <div className="font-mono text-lg font-black text-[#e8dcc0]/40">
                    ₪{verifiedCard.benchmark_price_nis}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Confidence</div>
                  <div className="text-sm font-black text-emerald-400">High</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Status</div>
                  <div className="text-[11px] font-black text-emerald-400">Verified Source</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Source Type</div>
                  <div className="text-[11px] text-[#e8dcc0]/60">
                    {SOURCE_TYPE_LABELS[verifiedProduct.source_type] ?? verifiedProduct.source_type}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Supplier</div>
                  <div className="text-[11px] text-[#e8dcc0]/60 truncate">{verifiedProduct.supplier_name}</div>
                </div>
                <div>
                  <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">VAT</div>
                  <div className="text-[11px] text-[#e8dcc0]/60">
                    {verifiedProduct.vat_included ? 'Included' : 'Excluded'}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-[#e8dcc0]/35 mb-0.5">Last Verified</div>
                  <div className="text-[11px] text-[#e8dcc0]/60">{verifiedProduct.last_verified_at}</div>
                </div>
              </div>

              {/* Pour cost at verified price */}
              {verifiedCard.cost_per_ml_nis != null && (
                <div className="border-t border-emerald-800/20 pt-3 space-y-1">
                  <div className="text-[9px] font-black uppercase tracking-[0.14em] text-emerald-400/60 mb-2">
                    Pour Cost at Verified Price (incl. 5% spillage)
                  </div>
                  <PourCostRow label="Cost per ml" value={verifiedCard.cost_per_ml_nis} />
                  <PourCostRow label="30ml pour" value={verifiedCard.cost_per_30ml_nis} />
                  <PourCostRow label="45ml pour" value={verifiedCard.cost_per_45ml_nis} />
                  <PourCostRow label="60ml pour" value={verifiedCard.cost_per_60ml_nis} />
                </div>
              )}

              <div className="border-t border-emerald-800/20 pt-3">
                <p className="text-[10px] text-emerald-300/45 leading-relaxed">
                  Verified price validated locally. Persistence requires Supabase or approved storage.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Price card ───────────────────────────────────────────────────────────────

function PriceCard({ card, product, currentUser, onClose }) {
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
            <span className="text-[9px] text-[#e8dcc0]/30 uppercase tracking-wide">
              {card.data_status === 'verified_source_backed' ? 'Verified' : 'Benchmark Estimate'}
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

        {/* Verified price entry form */}
        <VerifiedPriceForm product={product} currentUser={currentUser} />
      </div>
    </div>
  )
}

// ─── Product row ──────────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

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

      {/* Price output card — keyed on product_id so VerifiedPriceForm state resets on product change */}
      {selectedCard && selectedProduct && (
        <PriceCard
          key={selectedProductId}
          card={{ ...selectedCard, tier: selectedProduct?.tier }}
          product={selectedProduct}
          currentUser={currentUser}
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
