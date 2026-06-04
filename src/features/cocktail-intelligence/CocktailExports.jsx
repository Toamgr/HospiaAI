import { useState, useCallback, useEffect } from 'react'
import { buildCostSheet, getProductById } from '../../domain/hospitality/bar/cocktailLabPricingAdapter'
import { fetchMenus, fetchNarrative, getExportUrl } from '../../services/api/cocktailIntelligenceApi'

// ── Costing helper (identical to MenuMargin) ──────────────────────────────────

function toIngredientsMl(ingredients) {
  return (ingredients || []).map(ing => {
    const amt  = parseFloat(ing.amount) || 0
    const unit = (ing.unit || '').toLowerCase().trim()
    let amountMl = 0
    if      (unit === 'ml')                        amountMl = amt
    else if (unit === 'oz')                        amountMl = amt * 29.574
    else if (unit === 'cl')                        amountMl = amt * 10
    else if (unit === 'tsp')                       amountMl = amt * 5
    else if (unit === 'tbsp')                      amountMl = amt * 15
    else if (unit === 'dash' || unit === 'dashes') amountMl = amt * 0.5
    else if (unit === 'drop' || unit === 'drops')  amountMl = amt * 0.05
    return { ingredient: ing.name || '', amountMl }
  })
}

// ── Excel generation (exceljs) ────────────────────────────────────────────────

async function downloadSpecSheet(menuName, cocktails) {
  const { default: ExcelJS } = await import('exceljs')
  const wb = new ExcelJS.Workbook()
  wb.creator = 'HESTIA'
  wb.created = new Date()

  // ── Style constants ──────────────────────────────────────────────────────
  const FILL_DARK  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A1A' } }
  const FILL_GREY  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8E8E8' } }
  const FILL_GREEN  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4ADE80' } }
  const FILL_RED    = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF87171' } }
  const FILL_YELLOW = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } }
  const FONT_WHITE = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 }
  const FONT_BOLD  = { bold: true }
  const ALIGN_MID  = { vertical: 'middle', horizontal: 'left' }
  const FMT_CURR   = '"₪"0.00'

  function sc(cell, opts = {}) {
    if (opts.fill)      cell.fill      = opts.fill
    if (opts.font)      cell.font      = opts.font
    if (opts.numFmt)    cell.numFmt    = opts.numFmt
    if (opts.alignment) cell.alignment = opts.alignment
  }

  // ── Sheet 1: Spec Sheet ──────────────────────────────────────────────────
  const ws = wb.addWorksheet('Spec Sheet')
  ws.columns = [
    { width: 30 }, // A — Ingredient
    { width: 15 }, // B — Bottle Size (ml)
    { width: 18 }, // C — Cost per 100ml (₪)
    { width: 15 }, // D — Amount (ml)
    { width: 12 }, // E — Cost (₪)
  ]

  const summaryData = []
  let r = 1

  for (const c of cocktails) {
    const sheet   = buildCostSheet(toIngredientsMl(c.ingredients))
    const ingRows = sheet.rows

    // Name row — merged A:E
    ws.mergeCells(r, 1, r, 5)
    const nameCell = ws.getCell(r, 1)
    nameCell.value = c.name || 'Unnamed'
    sc(nameCell, { fill: FILL_DARK, font: FONT_WHITE, alignment: ALIGN_MID })
    ws.getRow(r).height = 22
    r++

    // Header row
    const HEADERS = ['Ingredient', 'Bottle Size (ml)', 'Cost per 100ml (₪)', 'Amount (ml)', 'Cost (₪)']
    HEADERS.forEach((h, i) => {
      const cell = ws.getCell(r, i + 1)
      cell.value = h
      sc(cell, { fill: FILL_GREY, font: FONT_BOLD, alignment: ALIGN_MID })
    })
    r++

    // Ingredient rows
    for (const ing of ingRows) {
      const product    = ing.product_id ? getProductById(ing.product_id) : null
      const bottleSize = product?.bottle_size_ml ?? null

      ws.getCell(r, 1).value = ing.ingredient
      ws.getCell(r, 1).alignment = ALIGN_MID

      ws.getCell(r, 2).value = bottleSize !== null ? bottleSize : '—'

      const c3 = ws.getCell(r, 3)
      c3.value  = Math.round(ing.cpm * 100 * 100) / 100
      c3.numFmt = FMT_CURR

      ws.getCell(r, 4).value = Math.round(ing.ml)

      const c5 = ws.getCell(r, 5)
      c5.value  = Math.round(ing.total * 100) / 100
      c5.numFmt = FMT_CURR

      r++
    }

    // Total build cost row
    const totalLabelCell = ws.getCell(r, 1)
    totalLabelCell.value = 'Total build cost'
    totalLabelCell.font  = FONT_BOLD
    const totalValueCell = ws.getCell(r, 5)
    totalValueCell.value  = Math.round(sheet.totalCost * 100) / 100
    totalValueCell.numFmt = FMT_CURR
    totalValueCell.font   = FONT_BOLD
    r++

    // Empty separator row
    r++

    // Collect for summary sheet — prefer real DB price, fall back to buildCostSheet estimate
    summaryData.push({
      name:             c.name || 'Unnamed',
      buildCost:        sheet.total_production_cost_nis,
      menuPrice:        c.suggested_price_ils ?? sheet.suggested,
      priceIsEstimated: c.suggested_price_ils == null,
    })
  }

  // ── Sheet 2: Margin Summary ──────────────────────────────────────────────
  const ws2 = wb.addWorksheet('Margin Summary')
  ws2.columns = [
    { header: 'Cocktail Name',    width: 28 },
    { header: 'Build Cost (₪)',   width: 16 },
    { header: 'Menu Price (₪)',   width: 16 },
    { header: 'Price/Cost Ratio', width: 18 },
    { header: 'Margin',           width: 12 },
  ]

  // Style summary header row
  const summaryHeader = ws2.getRow(1)
  for (let col = 1; col <= 5; col++) {
    sc(summaryHeader.getCell(col), { fill: FILL_GREY, font: FONT_BOLD, alignment: ALIGN_MID })
  }
  summaryHeader.height = 18

  const NET_PRICE_CAP = 57.63  // ILS 68 gross ÷ 1.18 VAT — Israeli market hard ceiling

  for (const { name, buildCost, menuPrice: rawPrice, priceIsEstimated: rawIsEst } of summaryData) {
    const priceIsCapped    = rawPrice > NET_PRICE_CAP
    const menuPrice        = priceIsCapped ? NET_PRICE_CAP : rawPrice
    const priceIsEstimated = rawIsEst || priceIsCapped
    const ratio  = buildCost > 0 ? Math.round((menuPrice / buildCost) * 10) / 10 : 0
    const margin = menuPrice > 0
      ? Math.round(((menuPrice - buildCost) / menuPrice) * 100)
      : 0

    const row = ws2.addRow([
      name,
      Math.round(buildCost * 100) / 100,
      Math.round(menuPrice * 10) / 10,
      `${ratio}x`,
      `${margin}%`,
    ])

    sc(row.getCell(2), { numFmt: FMT_CURR })
    const priceCell = row.getCell(3)
    sc(priceCell, { numFmt: '"₪"0.0' })
    if (priceIsEstimated) priceCell.fill = FILL_YELLOW

    const marginCell = row.getCell(5)
    marginCell.fill = ratio >= 4 ? FILL_GREEN : FILL_RED
    marginCell.font = FONT_BOLD
  }

  // ── Download ─────────────────────────────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer()
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `${(menuName || 'Menu').replace(/[^a-z0-9]/gi, '_')}_Spec_Sheet.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ── Sub-components ────────────────────────────────────────────────────────────

function MenuCard({ menu, onSelect }) {
  const count    = menu.cocktail_count ?? 0
  const previews = Array.isArray(menu.preview_names) ? menu.preview_names : []

  return (
    <button
      onClick={() => onSelect(menu)}
      className="group text-left w-full rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/60 p-7 transition-all hover:border-[#c9a96e]/40 hover:bg-[#1a1a1a]"
    >
      <h3 className="text-2xl font-bold text-[#f5f5f0] mb-3 leading-tight group-hover:text-[#e8dcc0] transition-colors">
        {menu.name}
      </h3>
      <div className="flex items-center flex-wrap gap-2 mb-4">
        {menu.occasion && (
          <span className="rounded-full border border-[#c9a96e]/25 bg-[#c9a96e]/8 px-3 py-1 text-xs font-semibold text-[#c9a96e] capitalize">
            {menu.occasion}
          </span>
        )}
        {menu.season && (
          <span className="rounded-full border border-[#6b705c]/20 px-3 py-1 text-xs text-[#6b705c] capitalize">
            {menu.season}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 text-[#6b705c]">
        <span className="text-2xl font-black text-[#e8dcc0]/70">{count}</span>
        <span className="text-sm">cocktail{count !== 1 ? 's' : ''}</span>
      </div>
      {previews.length > 0 && (
        <p className="mt-3 text-[11px] text-[#6b705c]/60 truncate">
          {previews.join(' · ')}
          {count > previews.length ? ` +${count - previews.length} more` : ''}
        </p>
      )}
    </button>
  )
}

function ExportCard({ icon, title, description, buttonLabel, onAction, warning, disabled }) {
  return (
    <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <span className="text-2xl text-[#c9a96e]/70 shrink-0">{icon}</span>
        <div>
          <h3 className="text-[15px] font-bold text-[#f5f5f0] leading-snug">{title}</h3>
          <p className="text-xs text-[#6b705c] mt-1 leading-relaxed">{description}</p>
        </div>
      </div>

      {warning && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-950/20 px-4 py-2.5 flex items-start gap-2">
          <span className="text-amber-400 shrink-0 text-xs mt-0.5">⚠</span>
          <p className="text-[11px] text-amber-400/80 leading-relaxed">{warning}</p>
        </div>
      )}

      <button
        onClick={onAction}
        disabled={disabled}
        className="mt-auto rounded-xl border border-[#c9a96e]/30 px-4 py-2.5 text-xs font-bold text-[#c9a96e]/80 transition hover:border-[#c9a96e]/60 hover:bg-[#c9a96e]/5 hover:text-[#c9a96e] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {buttonLabel}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CocktailExports({ ciMenus, onLoadMenu }) {
  const [activeMenu, setActiveMenu]       = useState(null)
  const [cocktails, setCocktails]         = useState([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [hasNarratives, setHasNarratives] = useState(null)
  const [downloading, setDownloading]     = useState(false)
  const [freshMenus, setFreshMenus]       = useState(null)

  // Fetch fresh menu data on mount so counts are never stale from hook state
  useEffect(() => {
    let cancelled = false
    fetchMenus()
      .then(res => { if (!cancelled) setFreshMenus(res?.menus || []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleSelect = useCallback(async (menu) => {
    setLoading(true)
    setError(null)
    setActiveMenu(menu)
    setCocktails([])
    setHasNarratives(null)

    try {
      const data = await onLoadMenu(menu.id)
      const list = data?.cocktails || []
      setCocktails(list)

      if (list.length > 0) {
        try {
          const res = await fetchNarrative(list[0].id)
          setHasNarratives(Boolean(res?.narrative))
        } catch {
          setHasNarratives(false)
        }
      } else {
        setHasNarratives(false)
      }
    } catch {
      setError('Could not load this menu.')
    } finally {
      setLoading(false)
    }
  }, [onLoadMenu])

  function handleBack() {
    setActiveMenu(null)
    setCocktails([])
    setError(null)
    setHasNarratives(null)
  }

  function handlePrintExport(type) {
    const ids = cocktails.map(c => c.id).filter(Boolean)
    window.open(getExportUrl(type, ids), '_blank', 'noopener')
  }

  async function handleDownloadExcel() {
    if (cocktails.length === 0) return
    setDownloading(true)
    try {
      await downloadSpecSheet(activeMenu?.name, cocktails)
    } catch (err) {
      console.error('Excel export failed:', err)
    } finally {
      setDownloading(false)
    }
  }

  const narrativeWarning = hasNarratives === false
    ? 'No narratives found for this menu. Generate them in Narrative Intelligence first — otherwise this export will be missing descriptions.'
    : null

  // ── Phase 1: menu selector ─────────────────────────────────────────────────
  const displayMenus = freshMenus ?? ciMenus

  if (!activeMenu) {
    return (
      <div>
        {!displayMenus?.length ? (
          <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-14 text-center">
            <p className="text-sm text-[#6b705c]">No saved menus yet.</p>
            <p className="text-xs text-[#6b705c]/50 mt-1.5">
              Generate and approve a menu first, then come back here to export it.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayMenus.map(menu => (
              <MenuCard key={menu.id} menu={menu} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Phase 2: export options ────────────────────────────────────────────────
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          onClick={handleBack}
          className="text-xs text-[#6b705c] hover:text-[#c9a96e] transition-colors"
        >
          ← All menus
        </button>
        <span className="text-[#6b705c]/25">|</span>
        <span className="text-sm font-bold text-[#f5f5f0]">{activeMenu.name}</span>
        {activeMenu.occasion && (
          <span className="rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-2.5 py-0.5 text-[10px] font-semibold text-[#c9a96e] capitalize">
            {activeMenu.occasion}
          </span>
        )}
        {cocktails.length > 0 && (
          <span className="ml-auto text-[10px] text-[#6b705c]/50">
            {cocktails.length} cocktail{cocktails.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="py-20 text-center">
          <div className="text-sm text-[#6b705c] animate-pulse">Loading menu…</div>
        </div>
      )}

      {!loading && !error && cocktails.length === 0 && (
        <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-14 text-center">
          <p className="text-sm text-[#6b705c]">No cocktails saved to this menu.</p>
        </div>
      )}

      {!loading && cocktails.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ExportCard
            icon="⬛"
            title="Spec Sheet"
            description="Downloads a styled Excel file (.xlsx) with one block per cocktail: ingredients, bottle sizes, cost per 100ml, amounts, and build cost. Includes a Margin Summary sheet. Costs from Israeli wholesale benchmarks — confirm before pricing decisions."
            buttonLabel={downloading ? 'Building file…' : 'Download Spec Sheet (.xlsx)'}
            onAction={handleDownloadExcel}
            disabled={downloading}
          />

          <ExportCard
            icon="◻"
            title="Guest Menu"
            description="Opens a print-ready HTML page with cocktail names and narrative descriptions. Designed to be printed directly or saved as PDF."
            buttonLabel="Open Guest Menu (Print)"
            onAction={() => handlePrintExport('guest_menu')}
            warning={narrativeWarning}
          />

          <ExportCard
            icon="◈"
            title="Staff Briefing Cards"
            description="Opens a print-ready page with server scripts and story cards for staff training. One card per cocktail."
            buttonLabel="Open Staff Briefing (Print)"
            onAction={() => handlePrintExport('staff_briefing')}
            warning={narrativeWarning}
          />

          <ExportCard
            icon="⬡"
            title="Sales Report"
            description="Opens a print-ready revenue and volume summary across all logged sales. Not scoped to this menu — shows all cocktail sales on record."
            buttonLabel="Open Sales Report (Print)"
            onAction={() => handlePrintExport('sales_report')}
          />
        </div>
      )}
    </div>
  )
}
