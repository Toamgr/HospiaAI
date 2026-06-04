import { useState, useEffect, useCallback } from 'react'
import { fetchSales, createSaleEntry, deleteSaleEntry } from '../../services/api/cocktailIntelligenceApi'

// ── Classification ────────────────────────────────────────────────────────────

function classify(units, gpPct, medianUnits, medianGp) {
  const highUnits = units >= medianUnits
  const highGp    = gpPct >= medianGp
  if (highUnits && highGp)   return 'star'
  if (highUnits && !highGp)  return 'plowhorse'
  if (!highUnits && highGp)  return 'puzzle'
  return 'dog'
}

const BADGE = {
  star:      { label: 'Star',      bg: 'rgba(201,169,110,0.12)', border: 'rgba(201,169,110,0.40)', text: '#c9a96e' },
  plowhorse: { label: 'Plowhorse', bg: 'rgba(96,165,250,0.10)',  border: 'rgba(96,165,250,0.35)',  text: '#60a5fa' },
  puzzle:    { label: 'Puzzle',    bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.35)', text: '#a78bfa' },
  dog:       { label: 'Dog',       bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.35)', text: '#f87171' },
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

function dateRangeFor(filter) {
  const now = new Date()
  if (filter === 'week') {
    const start = new Date(now)
    start.setDate(now.getDate() - 6)
    return { start: start.toISOString().slice(0, 10), end: isoToday() }
  }
  if (filter === 'month') {
    const start = new Date(now)
    start.setDate(now.getDate() - 29)
    return { start: start.toISOString().slice(0, 10), end: isoToday() }
  }
  return {}
}

// ── Aggregation ───────────────────────────────────────────────────────────────

function aggregate(sales) {
  const byName = {}
  for (const s of sales) {
    if (!byName[s.cocktail_name]) {
      byName[s.cocktail_name] = { name: s.cocktail_name, units: 0, revenue: 0, gpSum: 0, gpCount: 0 }
    }
    const row = byName[s.cocktail_name]
    row.units   += s.units_sold || 0
    row.revenue += s.revenue   || 0
    if (s.gp_percent != null) { row.gpSum += s.gp_percent; row.gpCount++ }
  }

  return Object.values(byName).map(r => ({
    name:    r.name,
    units:   r.units,
    revenue: Math.round(r.revenue * 10) / 10,
    gpPct:   r.gpCount > 0 ? Math.round(r.gpSum / r.gpCount) : null,
  }))
}

function withClassification(rows) {
  if (rows.length === 0) return rows
  const sorted      = [...rows].sort((a, b) => a.units - b.units)
  const mid         = Math.floor(sorted.length / 2)
  const medianUnits = sorted[mid].units
  const gpRows      = rows.filter(r => r.gpPct != null).sort((a, b) => a.gpPct - b.gpPct)
  const medianGp    = gpRows.length > 0 ? gpRows[Math.floor(gpRows.length / 2)].gpPct : 50

  return rows.map(r => ({
    ...r,
    classification: classify(r.units, r.gpPct ?? 0, medianUnits, medianGp),
  }))
}

function computeSummary(rows, rawSales) {
  const totalRevenue = rawSales.reduce((s, r) => s + (r.revenue || 0), 0)
  const totalUnits   = rawSales.reduce((s, r) => s + (r.units_sold || 0), 0)
  const stars = rows.filter(r => r.classification === 'star')
  const dogs  = rows.filter(r => r.classification === 'dog')
  const best  = stars.length  > 0 ? stars.sort((a, b) => b.revenue - a.revenue)[0]  : rows.sort((a, b) => b.revenue - a.revenue)[0]
  const worst = dogs.length   > 0 ? dogs.sort((a, b) => a.revenue - b.revenue)[0]   : rows.sort((a, b) => a.revenue - b.revenue)[0]
  return {
    totalRevenue: Math.round(totalRevenue * 10) / 10,
    totalUnits,
    best:  best?.name  || '—',
    worst: worst?.name || '—',
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub, accent }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
    >
      <div className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: accent.label }}>
        {label}
      </div>
      <div className="text-3xl font-black tabular-nums" style={{ color: accent.hero }}>
        {value}
      </div>
      {sub && <div className="text-[11px]" style={{ color: accent.label }}>{sub}</div>}
    </div>
  )
}

function ClassBadge({ type }) {
  const b = BADGE[type]
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider"
      style={{ background: b.bg, border: `1px solid ${b.border}`, color: b.text }}
    >
      {b.label}
    </span>
  )
}

function FilterTab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
        active
          ? 'bg-[#c9a96e] text-[#0d0c09]'
          : 'text-[#6b705c] hover:text-[#f5f5f0]'
      }`}
    >
      {label}
    </button>
  )
}

// ── Log Entry Form ─────────────────────────────────────────────────────────────

function LogEntryForm({ onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    cocktail_name: '',
    sale_date:     isoToday(),
    units_sold:    '',
    sale_price:    '',
    cost_per_unit: '',
    period_type:   'day',
  })
  const [error, setError] = useState(null)

  function set(field, val) {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!form.cocktail_name.trim()) { setError('Cocktail name is required.'); return }
    if (!form.sale_date)            { setError('Date is required.'); return }
    if (!form.units_sold || Number(form.units_sold) < 1) { setError('Units sold must be at least 1.'); return }
    await onSubmit({
      cocktail_name: form.cocktail_name.trim(),
      sale_date:     form.sale_date,
      units_sold:    Number(form.units_sold),
      sale_price:    form.sale_price    ? Number(form.sale_price)    : undefined,
      cost_per_unit: form.cost_per_unit ? Number(form.cost_per_unit) : undefined,
      period_type:   form.period_type,
    })
  }

  const inputCls = "w-full rounded-xl border border-[#6b705c]/25 bg-[#0d0c09]/60 px-4 py-2.5 text-sm text-[#f5f5f0] placeholder-[#6b705c] focus:border-[#c9a96e]/50 focus:outline-none transition"
  const labelCls = "block text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/60 p-6 flex flex-col gap-5">
      <h3 className="text-sm font-bold text-[#f5f5f0]">Log Sales Entry</h3>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Cocktail Name</label>
          <input
            className={inputCls}
            placeholder="e.g. Arak Al HaMayim"
            value={form.cocktail_name}
            onChange={e => set('cocktail_name', e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>Date</label>
          <input
            type="date"
            className={inputCls}
            value={form.sale_date}
            onChange={e => set('sale_date', e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>Period</label>
          <select
            className={inputCls}
            value={form.period_type}
            onChange={e => set('period_type', e.target.value)}
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Units Sold</label>
          <input
            type="number"
            min="1"
            step="1"
            className={inputCls}
            placeholder="e.g. 24"
            value={form.units_sold}
            onChange={e => set('units_sold', e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>Sale Price per Unit (₪)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            className={inputCls}
            placeholder="e.g. 58"
            value={form.sale_price}
            onChange={e => set('sale_price', e.target.value)}
          />
        </div>

        <div>
          <label className={labelCls}>Cost per Unit (₪) — optional</label>
          <input
            type="number"
            min="0"
            step="0.5"
            className={inputCls}
            placeholder="e.g. 14"
            value={form.cost_per_unit}
            onChange={e => set('cost_per_unit', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/10 py-2.5 text-sm font-bold text-[#c9a96e] transition hover:bg-[#c9a96e]/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving…' : 'Log Entry'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-[#6b705c]/25 px-5 py-2.5 text-xs text-[#6b705c] transition hover:border-[#6b705c]/50 hover:text-[#f5f5f0]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function SalesTracker() {
  const [sales, setSales]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [filter, setFilter]         = useState('month') // 'week' | 'month' | 'all'
  const [showForm, setShowForm]     = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadSales = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = dateRangeFor(filter)
      const data   = await fetchSales(params)
      setSales(data?.sales || [])
    } catch {
      setError('Could not load sales data.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { loadSales() }, [loadSales])

  async function handleSubmit(entry) {
    setSubmitting(true)
    try {
      await createSaleEntry(entry)
      setShowForm(false)
      await loadSales()
    } catch {
      setError('Failed to save entry.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSaleEntry(id)
      await loadSales()
    } catch {
      setError('Failed to delete entry.')
    }
  }

  // Aggregate and classify
  const rows    = withClassification(aggregate(sales))
  const summary = rows.length > 0 ? computeSummary(rows, sales) : null
  const sorted  = [...rows].sort((a, b) => b.revenue - a.revenue)

  const FILTER_LABELS = { week: 'This Week', month: 'This Month', all: 'All Time' }

  return (
    <div>
      {/* ── Controls row ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* Date filter */}
        <div className="flex gap-1 rounded-xl border border-[#6b705c]/20 p-1 bg-[#0d0c09]/60">
          {Object.entries(FILTER_LABELS).map(([key, label]) => (
            <FilterTab
              key={key}
              label={label}
              active={filter === key}
              onClick={() => { setFilter(key); setShowForm(false) }}
            />
          ))}
        </div>

        <div className="ml-auto">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-xl border border-[#c9a96e]/30 px-5 py-2 text-xs font-bold text-[#c9a96e]/80 transition hover:border-[#c9a96e]/60 hover:bg-[#c9a96e]/5 hover:text-[#c9a96e]"
            >
              + Log Sales
            </button>
          )}
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* ── Log entry form ─────────────────────────────────────────────────── */}
      {showForm && (
        <div className="mb-8">
          <LogEntryForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            submitting={submitting}
          />
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="py-20 text-center">
          <div className="text-sm text-[#6b705c] animate-pulse">Loading sales data…</div>
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!loading && sales.length === 0 && !error && (
        <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-16 text-center">
          <p className="text-sm text-[#6b705c]">No sales logged for {FILTER_LABELS[filter].toLowerCase()}.</p>
          <p className="text-xs text-[#6b705c]/50 mt-1.5">
            Use "Log Sales" to record units sold per cocktail.
          </p>
        </div>
      )}

      {/* ── Dashboard ─────────────────────────────────────────────────────── */}
      {!loading && rows.length > 0 && (
        <>
          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
              <SummaryCard
                label="Total Revenue"
                value={`₪${summary.totalRevenue.toLocaleString('en-IL')}`}
                accent={{ bg: 'rgba(201,169,110,0.07)', border: 'rgba(201,169,110,0.18)', label: 'rgba(201,169,110,0.65)', hero: '#c9a96e' }}
              />
              <SummaryCard
                label="Units Sold"
                value={summary.totalUnits.toLocaleString()}
                accent={{ bg: 'rgba(107,112,92,0.08)', border: 'rgba(107,112,92,0.20)', label: 'rgba(107,112,92,0.8)', hero: '#e8dcc0' }}
              />
              <SummaryCard
                label="Best Performer"
                value={summary.best}
                sub="Highest revenue"
                accent={{ bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.18)', label: 'rgba(74,222,128,0.6)', hero: '#4ade80' }}
              />
              <SummaryCard
                label="Needs Attention"
                value={summary.worst}
                sub="Low units + low margin"
                accent={{ bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.18)', label: 'rgba(248,113,113,0.6)', hero: '#f87171' }}
              />
            </div>
          )}

          {/* Performance table */}
          <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-[#6b705c]/15">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c]">Cocktail</div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Units</div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Revenue</div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">GP%</div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Class</div>
            </div>

            {/* Table rows */}
            {sorted.map((row, i) => (
              <div
                key={row.name}
                className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-4 items-center ${
                  i < sorted.length - 1 ? 'border-b border-[#6b705c]/08' : ''
                }`}
              >
                <div className="text-sm font-semibold text-[#f5f5f0] truncate">{row.name}</div>
                <div className="text-sm font-bold text-[#e8dcc0] tabular-nums text-right">{row.units}</div>
                <div className="text-sm font-bold text-[#e8dcc0] tabular-nums text-right">
                  ₪{row.revenue.toLocaleString('en-IL')}
                </div>
                <div className={`text-sm font-bold tabular-nums text-right ${
                  row.gpPct == null ? 'text-[#6b705c]' :
                  row.gpPct >= 70 ? 'text-[#4ade80]' :
                  row.gpPct >= 55 ? 'text-[#fbbf24]' : 'text-[#f87171]'
                }`}>
                  {row.gpPct != null ? `${row.gpPct}%` : '—'}
                </div>
                <div className="text-right">
                  <ClassBadge type={row.classification} />
                </div>
              </div>
            ))}
          </div>

          {/* Classification legend */}
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(BADGE).map(([key, b]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: b.text }}
                />
                <span className="text-[10px] text-[#6b705c]">{b.label}</span>
              </div>
            ))}
            <span className="text-[10px] text-[#6b705c]/40 ml-2">
              — classified by median units and median GP%
            </span>
          </div>
        </>
      )}
    </div>
  )
}
