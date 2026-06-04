import { useState, useEffect } from 'react'
import { fetchDailyCloseActiveMenu, fetchDailyCloseCocktails, submitDailyClose } from '../../services/api/cocktailIntelligenceApi'

function isoToday() {
  return new Date().toISOString().slice(0, 10)
}

function GpColor({ gp }) {
  const cls = gp >= 70 ? 'text-[#4ade80]' : gp >= 55 ? 'text-[#fbbf24]' : gp > 0 ? 'text-[#f87171]' : 'text-[#6b705c]'
  return <span className={`text-sm font-semibold tabular-nums ${cls}`}>{gp > 0 ? `${gp}%` : '—'}</span>
}

export function DailyClose({ venueId = 'venue-main' }) {
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState(null)
  const [activeMenu, setActiveMenu]         = useState(null)
  const [allMenus, setAllMenus]             = useState([])
  const [selectedMenu, setSelectedMenu]     = useState(null)
  const [showMenuPicker, setShowMenuPicker] = useState(false)
  const [cocktails, setCocktails]           = useState([])
  const [cocktailsLoading, setCocktailsLoading] = useState(false)
  const [entries, setEntries]               = useState({})
  const [saleDate, setSaleDate]             = useState(isoToday())
  const [submitting, setSubmitting]         = useState(false)
  const [submitted, setSubmitted]           = useState(false)
  const [savedCount, setSavedCount]         = useState(0)

  useEffect(() => { loadInitial() }, [])

  async function loadInitial() {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchDailyCloseActiveMenu(venueId)
      setActiveMenu(data.active || null)
      setAllMenus(data.allMenus || [])
      if (data.active) {
        setSelectedMenu(data.active)
        await loadCocktails(data.active.id)
      } else {
        setShowMenuPicker(true)
      }
    } catch {
      setError('Could not load menu data.')
    } finally {
      setLoading(false)
    }
  }

  async function loadCocktails(menuId) {
    setCocktailsLoading(true)
    try {
      const data = await fetchDailyCloseCocktails(menuId)
      setCocktails(data.cocktails || [])
      setEntries({})
    } catch {
      setError('Could not load cocktails.')
    } finally {
      setCocktailsLoading(false)
    }
  }

  async function handleSelectMenu(menu) {
    setSelectedMenu(menu)
    setShowMenuPicker(false)
    await loadCocktails(menu.id)
  }

  function setUnits(cocktailId, value) {
    const n = Math.max(0, parseInt(value, 10) || 0)
    setEntries(prev => ({ ...prev, [cocktailId]: n }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      const entryList = cocktails
        .filter(c => Number(entries[c.id] || 0) > 0)
        .map(c => ({
          cocktailId:   c.id,
          cocktailName: c.name,
          unitsSold:    Number(entries[c.id]),
          salePrice:    Number(c.suggested_price_ils) || 0,
          costPerUnit:  Number(c.estimated_cost_ils)  || 0,
        }))
      const data = await submitDailyClose({ venueId, menuId: selectedMenu?.id, saleDate, entries: entryList })
      setSavedCount(data.saved ?? entryList.length)
      setSubmitted(true)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleNewClose() {
    setSubmitted(false)
    setSavedCount(0)
    setEntries({})
    setSaleDate(isoToday())
  }

  const totalUnits   = cocktails.reduce((s, c) => s + Number(entries[c.id] || 0), 0)
  const totalRevenue = cocktails.reduce((s, c) => {
    const units = Number(entries[c.id] || 0)
    return s + units * (Number(c.suggested_price_ils) || 0)
  }, 0)

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="text-sm text-[#6b705c] animate-pulse">Loading…</div>
      </div>
    )
  }

  // ── Success state ──────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 px-8 py-14 text-center max-w-xs mx-auto">
        <div className="text-4xl font-black text-emerald-400 tabular-nums mb-1">{savedCount}</div>
        <div className="text-sm font-semibold text-[#f5f5f0] mb-0.5">
          cocktail{savedCount !== 1 ? 's' : ''} saved
        </div>
        <div className="text-xs text-[#6b705c] mb-7">{saleDate}</div>
        <button
          onClick={handleNewClose}
          className="rounded-xl border border-[#c9a96e]/30 px-6 py-2.5 text-sm font-bold text-[#c9a96e] transition hover:bg-[#c9a96e]/10 hover:border-[#c9a96e]/50"
        >
          New close
        </button>
      </div>
    )
  }

  // ── Main view ──────────────────────────────────────────────────────────────

  return (
    <div>

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f0]">Daily close</h2>
          {selectedMenu && !showMenuPicker && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#e8dcc0]/60">{selectedMenu.name}</span>
              <button
                onClick={() => setShowMenuPicker(v => !v)}
                className="text-[10px] text-[#c9a96e]/70 hover:text-[#c9a96e] transition underline underline-offset-2"
              >
                change menu
              </button>
            </div>
          )}
          {!selectedMenu && (
            <div className="text-xs text-[#6b705c] mt-1">Select a menu to begin</div>
          )}
        </div>
        <input
          type="date"
          value={saleDate}
          onChange={e => setSaleDate(e.target.value)}
          className="rounded-xl border border-[#6b705c]/25 bg-[#0d0c09]/60 px-4 py-2 text-sm text-[#f5f5f0] focus:border-[#c9a96e]/50 focus:outline-none transition"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400 mb-5">
          {error}
        </div>
      )}

      {/* Menu picker */}
      {showMenuPicker && (
        <div className="mb-6 rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/60 p-5">
          <div className="text-[9px] font-black uppercase tracking-[0.25em] text-[#6b705c] mb-3">Select menu</div>
          {allMenus.length === 0 ? (
            <p className="text-sm text-[#6b705c]">
              No menus found. Generate a menu in Menu Generator first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allMenus.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMenu(m)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                    selectedMenu?.id === m.id
                      ? 'border-[#c9a96e]/50 bg-[#c9a96e]/10 text-[#c9a96e]'
                      : 'border-[#6b705c]/25 text-[#e8dcc0]/70 hover:border-[#c9a96e]/30 hover:text-[#c9a96e]'
                  }`}
                >
                  {m.name}
                  {m.status === 'active' && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-black text-emerald-400">
                      active
                    </span>
                  )}
                  <span className="font-normal text-[#6b705c]">{m.cocktail_count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cocktails loading */}
      {cocktailsLoading && (
        <div className="py-12 text-center">
          <div className="text-sm text-[#6b705c] animate-pulse">Loading cocktails…</div>
        </div>
      )}

      {/* Cocktail entry table */}
      {!cocktailsLoading && selectedMenu && cocktails.length > 0 && (
        <>
          <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 overflow-hidden mb-4">

            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_120px] gap-4 px-5 py-3 border-b border-[#6b705c]/15">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c]">Cocktail</div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Price ₪</div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">GP%</div>
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#6b705c] text-right">Units sold</div>
            </div>

            {/* Table rows */}
            {cocktails.map((c, i) => {
              const units = Number(entries[c.id] || 0)
              const gp    = Number(c.estimated_gp_percent) || 0
              return (
                <div
                  key={c.id}
                  className={`grid grid-cols-[1fr_auto_auto_120px] gap-4 px-5 py-3.5 items-center transition ${
                    i < cocktails.length - 1 ? 'border-b border-[#6b705c]/10' : ''
                  } ${units > 0 ? 'bg-[#c9a96e]/[0.04]' : ''}`}
                >
                  <div>
                    <div className="text-sm font-semibold text-[#f5f5f0] truncate">{c.name}</div>
                    {c.category && (
                      <div className="text-[10px] text-[#6b705c] mt-0.5">{c.category}</div>
                    )}
                  </div>
                  <div className="text-sm text-[#e8dcc0] tabular-nums text-right">
                    {Number(c.suggested_price_ils) > 0 ? `₪${c.suggested_price_ils}` : '—'}
                  </div>
                  <div className="text-right">
                    <GpColor gp={gp} />
                  </div>
                  <div className="flex justify-end">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={entries[c.id] || ''}
                      onChange={e => setUnits(c.id, e.target.value)}
                      placeholder="0"
                      className="w-24 rounded-xl border border-[#6b705c]/25 bg-[#0d0c09]/60 px-3 py-2 text-sm text-[#f5f5f0] text-right tabular-nums focus:border-[#c9a96e]/50 focus:outline-none transition placeholder-[#6b705c]"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary bar + submit */}
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/40 px-5 py-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b705c]">Total units</span>
              <span className="text-2xl font-black text-[#f5f5f0] tabular-nums">{totalUnits}</span>
            </div>
            <div className="h-4 w-px bg-[#6b705c]/20" />
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6b705c]">Est. revenue</span>
              <span className="text-2xl font-black text-[#c9a96e] tabular-nums">
                ₪{Math.round(totalRevenue).toLocaleString()}
              </span>
            </div>
            <div className="ml-auto">
              <button
                onClick={handleSubmit}
                disabled={totalUnits === 0 || submitting}
                className="rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-6 py-2.5 text-sm font-bold text-[#c9a96e] transition hover:bg-[#c9a96e]/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'Saving…'
                  : `Save close — ${totalUnits} unit${totalUnits !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty cocktails state */}
      {!cocktailsLoading && selectedMenu && cocktails.length === 0 && (
        <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/40 px-6 py-12 text-center">
          <p className="text-sm text-[#6b705c]">No cocktails in {selectedMenu.name}.</p>
          <p className="text-xs text-[#6b705c]/60 mt-1">Add cocktails via Menu Generator.</p>
        </div>
      )}

    </div>
  )
}
