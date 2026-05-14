import { useState, useMemo } from 'react'
import { validateVerifiedPriceUpdate, APPROVED_SOURCE_TYPES } from '../../domain/hospitality/bar/verifiedPriceIngestion.js'
import { saveVerifiedPriceOverride } from '../../domain/hospitality/bar/verifiedPriceStorage.js'
import { getProductById } from '../../domain/hospitality/bar/cocktailLabPricingAdapter.js'
import { saveVerifiedPriceOverrideToServer } from '../../services/api/verifiedPricesApi.js'

const SOURCE_LABELS = {
  invoice: 'Invoice',
  supplier_quote: 'Supplier Quote',
  supplier_catalog: 'Supplier Catalog',
  direct_supplier_confirmation: 'Direct Supplier Confirmation',
}

// ─── VerifiedPriceEntryPanel ──────────────────────────────────────────────────
//
// Manual verified price entry for linked cost-sheet ingredients.
//
// Save path:
//   1. validateVerifiedPriceUpdate() — full 8-field provenance validation
//   2. saveVerifiedPriceOverride()   — localStorage; cost sheet updates on next render
//   3. saveVerifiedPriceOverrideToServer() — backend (best-effort; bar_manager/owner/admin only)
//
// If backend save fails, the price is still stored locally and the cost sheet
// confidence updates immediately. Status is labeled honestly in both cases.

export default function VerifiedPriceEntryPanel({ linkedIngredients, onSaved }) {
  const [selectedProductId, setSelectedProductId] = useState(linkedIngredients[0]?.product_id || '')
  const [priceNis, setPriceNis] = useState('')
  const [supplierName, setSupplierName] = useState('')
  const [sourceType, setSourceType] = useState('invoice')
  const [sourceReference, setSourceReference] = useState('')
  const [vatIncluded, setVatIncluded] = useState(true)
  const [verifiedBy, setVerifiedBy] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null) // null | 'success' | 'success_local' | 'error'
  const [validationErrors, setValidationErrors] = useState([])
  const [warnings, setWarnings] = useState([])

  const selectedProduct = useMemo(() => getProductById(selectedProductId), [selectedProductId])
  const selectedLink = linkedIngredients.find(li => li.product_id === selectedProductId)

  async function handleSave() {
    setValidationErrors([])
    setWarnings([])
    setStatus(null)
    setSaving(true)

    const update = {
      product_id: selectedProductId,
      actual_venue_price_nis: priceNis !== '' ? parseFloat(priceNis) : undefined,
      supplier_name: supplierName,
      source_type: sourceType,
      source_reference: sourceReference,
      last_verified_at: new Date().toISOString(),
      vat_included: vatIncluded,
      verified_by: verifiedBy,
      notes: notes.trim() || null,
    }

    const { valid, errors, warnings: valWarnings, normalized_update } = validateVerifiedPriceUpdate(update)

    if (!valid) {
      setValidationErrors(errors)
      setWarnings(valWarnings)
      setStatus('error')
      setSaving(false)
      return
    }

    if (valWarnings.length > 0) setWarnings(valWarnings)

    // Step 1: Always save locally for immediate cost sheet update.
    const savedLocally = saveVerifiedPriceOverride(selectedProductId, normalized_update)
    if (!savedLocally) {
      setValidationErrors(['Failed to save — localStorage may be full or unavailable on this device.'])
      setStatus('error')
      setSaving(false)
      return
    }

    // Step 2: Attempt backend save (best-effort; gated on role + allowlist server-side).
    let savedToServer = false
    try {
      await saveVerifiedPriceOverrideToServer(selectedProductId, normalized_update, verifiedBy)
      savedToServer = true
    } catch {
      // Backend unavailable or user not on allowlist — local save is sufficient.
    }

    setStatus(savedToServer ? 'success' : 'success_local')
    setPriceNis('')
    setSourceReference('')
    setNotes('')
    setSaving(false)
    onSaved?.()
  }

  if (linkedIngredients.length === 0) return null

  return (
    <div className="mt-5 border-t border-[#c9a96e]/10 pt-5">
      <div className="mb-2 text-[9px] font-black uppercase tracking-widest text-[#c9a96e]/70">Enter Verified Price</div>
      <p className="mb-4 text-[10px] leading-relaxed text-[#e8dcc0]/40">
        Verified prices should come from real invoices, supplier quotes, or manager-approved price checks.
        Enter the price as it appears on the document.
      </p>

      {/* Ingredient selector */}
      {linkedIngredients.length > 1 && (
        <div className="mb-3">
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">
            Ingredient to Price
          </label>
          <select
            value={selectedProductId}
            onChange={e => { setSelectedProductId(e.target.value); setStatus(null); setValidationErrors([]) }}
            className="w-full rounded-xl border border-[#6b705c]/30 bg-black/25 px-3 py-2 text-xs text-[#e8dcc0] outline-none focus:border-[#c9a96e]/30"
          >
            {linkedIngredients.map(li => (
              <option key={li.product_id} value={li.product_id}>
                {li.ingredient} — {li.product_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedLink && linkedIngredients.length === 1 && (
        <div className="mb-2 text-[10px] font-medium text-[#e8dcc0]/50">
          {selectedLink.ingredient} — {selectedLink.product_name}
        </div>
      )}

      {selectedProduct && (
        <div className="mb-4 rounded-xl border border-[#6b705c]/20 bg-black/20 px-3 py-2 text-[9px] text-[#e8dcc0]/35">
          {selectedProduct.brand} {selectedProduct.product_name} · {selectedProduct.bottle_size_ml}ml bottle
          {selectedProduct.benchmark_price_nis && (
            <span className="ml-2 text-amber-400/50">benchmark: ₪{selectedProduct.benchmark_price_nis}</span>
          )}
        </div>
      )}

      {/* Form grid */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">
            Total Price Paid (₪)
          </label>
          <input
            type="number" min="0" step="0.01" value={priceNis}
            onChange={e => setPriceNis(e.target.value)}
            placeholder="e.g. 180"
            className="w-full rounded-xl border border-[#6b705c]/30 bg-black/25 px-3 py-2 text-xs text-[#e8dcc0] outline-none focus:border-[#c9a96e]/30 placeholder:text-[#e8dcc0]/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">
            Supplier / Store Name
          </label>
          <input
            type="text" value={supplierName}
            onChange={e => setSupplierName(e.target.value)}
            placeholder="e.g. RAM Import, Local Distributor"
            className="w-full rounded-xl border border-[#6b705c]/30 bg-black/25 px-3 py-2 text-xs text-[#e8dcc0] outline-none focus:border-[#c9a96e]/30 placeholder:text-[#e8dcc0]/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">
            Source Type
          </label>
          <select
            value={sourceType}
            onChange={e => setSourceType(e.target.value)}
            className="w-full rounded-xl border border-[#6b705c]/30 bg-black/25 px-3 py-2 text-xs text-[#e8dcc0] outline-none focus:border-[#c9a96e]/30"
          >
            {APPROVED_SOURCE_TYPES.map(st => (
              <option key={st} value={st}>{SOURCE_LABELS[st] || st}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">
            Reference (Invoice # or Quote ID)
          </label>
          <input
            type="text" value={sourceReference}
            onChange={e => setSourceReference(e.target.value)}
            placeholder="e.g. INV-2024-0012"
            className="w-full rounded-xl border border-[#6b705c]/30 bg-black/25 px-3 py-2 text-xs text-[#e8dcc0] outline-none focus:border-[#c9a96e]/30 placeholder:text-[#e8dcc0]/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">
            Verified By
          </label>
          <input
            type="text" value={verifiedBy}
            onChange={e => setVerifiedBy(e.target.value)}
            placeholder="Your name or manager ID"
            className="w-full rounded-xl border border-[#6b705c]/30 bg-black/25 px-3 py-2 text-xs text-[#e8dcc0] outline-none focus:border-[#c9a96e]/30 placeholder:text-[#e8dcc0]/20"
          />
        </div>

        <div className="flex items-end gap-3 pb-0.5">
          <label className="text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">
            VAT Included
          </label>
          <button
            type="button"
            onClick={() => setVatIncluded(v => !v)}
            className={`rounded-full border px-3 py-1.5 text-[9px] font-black tracking-wide transition ${
              vatIncluded
                ? 'border-emerald-800/30 bg-emerald-950/20 text-emerald-400'
                : 'border-[#6b705c]/30 text-[#e8dcc0]/45 hover:border-[#c9a96e]/20'
            }`}
          >
            {vatIncluded ? 'Yes — VAT included' : 'No — VAT excluded'}
          </button>
        </div>
      </div>

      <div className="mt-2.5">
        <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-[#e8dcc0]/35">
          Notes (Optional)
        </label>
        <input
          type="text" value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Optional notes about this price entry"
          className="w-full rounded-xl border border-[#6b705c]/30 bg-black/25 px-3 py-2 text-xs text-[#e8dcc0] outline-none focus:border-[#c9a96e]/30 placeholder:text-[#e8dcc0]/20"
        />
      </div>

      {/* Non-blocking warnings */}
      {warnings.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-800/25 bg-amber-950/15 px-3 py-2 space-y-0.5">
          {warnings.map((w, i) => (
            <div key={i} className="text-[10px] text-amber-300/70">{w}</div>
          ))}
        </div>
      )}

      {/* Validation errors */}
      {status === 'error' && validationErrors.length > 0 && (
        <div className="mt-3 rounded-xl border border-red-800/30 bg-red-950/20 px-3 py-2 space-y-0.5">
          {validationErrors.map((e, i) => (
            <div key={i} className="text-[10px] text-red-300">{e}</div>
          ))}
        </div>
      )}

      {/* Success — saved to server */}
      {status === 'success' && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-800/25 bg-emerald-950/15 px-3 py-2">
          <span className="mt-0.5 text-[10px] text-emerald-400">✓</span>
          <span className="text-[10px] leading-relaxed text-emerald-300/70">
            Verified price saved — synced to server and local cache. Cost sheet will reflect this on next generation.
          </span>
        </div>
      )}

      {/* Success — local only (backend unavailable or not authorized) */}
      {status === 'success_local' && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-800/25 bg-amber-950/15 px-3 py-2">
          <span className="mt-0.5 text-[10px] text-amber-400">⚠</span>
          <span className="text-[10px] leading-relaxed text-amber-300/65">
            Saved locally on this device — server sync unavailable. Cost sheet updates immediately, but this price will not appear on other devices or after a browser clear.
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-4 rounded-[1.2rem] border border-emerald-800/30 bg-emerald-950/20 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-400 transition hover:bg-emerald-950/35 hover:border-emerald-700/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Verified Price'}
      </button>
    </div>
  )
}
