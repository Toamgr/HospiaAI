import { useState, useCallback, useEffect, useRef } from 'react'
import {
  fetchMenus, fetchVisualMenu, saveVisualDesign,
  generateCocktailImage, fetchMenuDesign
} from '../../services/api/cocktailIntelligenceApi'
import { fetchNarrative } from '../../services/api/cocktailIntelligenceApi'
import { generateFinalCocktailMenuDesign } from '../../services/cocktailMenuDesignService'
import { MenuRenderer } from './MenuRenderer'

function formatDesignDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return '' }
}

function dataUrlToBlobUrl(dataUrl) {
  if (!dataUrl?.startsWith('data:')) return dataUrl
  try {
    const [header, b64] = dataUrl.split(',')
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png'
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0))
    return URL.createObjectURL(new Blob([bytes], { type: mime }))
  } catch {
    return dataUrl
  }
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

function VisualCard({ cocktail, cardState, onGenerate }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError,  setImgError]  = useState(false)

  const { status, imageUrl } = cardState
  const price = cocktail.suggested_price_ils
  const tags  = Array.isArray(cocktail.tags) ? cocktail.tags.slice(0, 3) : []

  // Reset display state when a new image URL arrives (Regenerate)
  useEffect(() => {
    setImgLoaded(false)
    setImgError(false)
  }, [imageUrl])

  return (
    <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 overflow-hidden flex flex-col">
      {/* Image area — square */}
      <div className="aspect-square bg-[#0f0f0f] relative flex items-center justify-center overflow-hidden">
        {status === 'done' && imageUrl && !imgError && (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] text-[#6b705c] animate-pulse">Loading image…</span>
              </div>
            )}
            <img
              src={imageUrl}
              alt={cocktail.name}
              className={`w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        )}
        {status === 'loading' && (
          <div className="text-center px-3">
            <div className="text-xs text-[#c9a96e]/70 animate-pulse">Generating…</div>
          </div>
        )}
        {status === 'idle' && (
          <div className="text-center px-4">
            <div className="text-4xl mb-2 text-[#6b705c]/15">◫</div>
            <div className="text-[10px] text-[#6b705c]/50">No image yet</div>
          </div>
        )}
        {(status === 'error' || (status === 'done' && imgError)) && (
          <div className="text-center px-4">
            <div className="text-[10px] text-red-400/70">Generation failed</div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[14px] font-bold text-[#f5f5f0] leading-snug">{cocktail.name}</h3>
            {price != null && (
              <span className="shrink-0 text-[11px] font-bold text-[#c9a96e]">₪{price}</span>
            )}
          </div>
          {cocktail.base_spirit && (
            <span className="text-[11px] text-[#6b705c] capitalize">{cocktail.base_spirit}</span>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map(tag => (
              <span key={tag} className="rounded-full border border-[#6b705c]/20 px-2 py-0.5 text-[9px] text-[#6b705c] capitalize">
                {tag}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => onGenerate(cocktail.id)}
          disabled={status === 'loading'}
          className="mt-auto rounded-xl border border-[#c9a96e]/25 py-2 text-[11px] font-bold text-[#c9a96e]/70 transition hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/5 hover:text-[#c9a96e] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Generating…'
            : status === 'done'    ? 'Regenerate'
            : status === 'error'   ? 'Retry'
            : 'Generate Image'}
        </button>
      </div>
    </div>
  )
}

function FullMenuView({ menu, cocktails, designState, narratives, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0d0d0d] overflow-y-auto print:static print:overflow-visible">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-5 bg-[#0d0d0d]/95 border-b border-[#6b705c]/15 backdrop-blur-sm print:hidden">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#c9a96e]/60 mb-1">Full Menu Preview</div>
          <h1 className="text-xl font-black text-[#f5f5f0]">{menu.name}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e] transition-colors"
          >
            Print
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e] transition-colors"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block px-8 pt-10 pb-6 text-center border-b border-black/20">
        <h1 className="text-3xl font-black text-black">{menu.name}</h1>
        {menu.occasion && (
          <p className="text-sm text-black/60 mt-1 capitalize">{menu.occasion}</p>
        )}
      </div>

      {/* Cocktail list */}
      <div className="max-w-3xl mx-auto px-8 py-12 flex flex-col gap-6 print:py-6 print:gap-4">
        {cocktails.map(c => {
          const design    = designState[c.id]
          const narrative = narratives[c.id]
          const desc      = narrative?.menu_description || c.description || ''
          const price     = c.suggested_price_ils
          const tags      = Array.isArray(c.tags) ? c.tags.slice(0, 4) : []

          return (
            <div
              key={c.id}
              className="flex gap-0 rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 overflow-hidden print:border-black/10 print:bg-white print:rounded-xl"
            >
              {/* Image */}
              <div className="w-44 shrink-0 bg-[#0f0f0f] print:bg-gray-100">
                {design?.status === 'done' && design.imageUrl ? (
                  <img
                    src={design.imageUrl}
                    alt={c.name}
                    className="w-full h-full object-cover min-h-[160px]"
                  />
                ) : (
                  <div className="w-full min-h-[160px] flex items-center justify-center">
                    <span className="text-3xl text-[#6b705c]/15 print:text-gray-300">◫</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col gap-2.5 print:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-[#f5f5f0] print:text-black">{c.name}</h2>
                    {c.base_spirit && (
                      <span className="text-[11px] text-[#6b705c] print:text-gray-500 capitalize">{c.base_spirit}</span>
                    )}
                  </div>
                  {price != null && (
                    <span className="shrink-0 text-base font-bold text-[#c9a96e] print:text-black">₪{price}</span>
                  )}
                </div>

                {desc && (
                  <p className="text-sm text-[#e8dcc0]/75 print:text-gray-700 leading-relaxed">{desc}</p>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#c9a96e]/20 px-2.5 py-0.5 text-[10px] text-[#c9a96e]/70 print:border-black/20 print:text-gray-500 capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function VisualMenuBuilder({ ciMenus, onLoadMenu }) {
  const [activeMenu, setActiveMenu]             = useState(null)
  const [cocktails, setCocktails]               = useState([])
  const [designState, setDesignState]           = useState({})
  const [narratives, setNarratives]             = useState({})
  const [loadingMenu, setLoadingMenu]           = useState(false)
  const [menuError, setMenuError]               = useState(null)
  const [generatingAll, setGeneratingAll]       = useState(false)
  const [generateProgress, setGenerateProgress] = useState(null)
  const [fullMenuOpen, setFullMenuOpen]         = useState(false)
  const [freshMenus, setFreshMenus]             = useState(null)

  // ── Final Menu Design (HESTIA Cocktail Menu Skill v5.2) ───────────────────
  const [finalDesign, setFinalDesign]                 = useState(null)
  const [finalDesignLoading, setFinalDesignLoading]   = useState(false)
  const [finalDesignError, setFinalDesignError]       = useState(null)
  const [rationaleOpen, setRationaleOpen]             = useState(false)
  const menuPreviewRef                                = useRef(null)

  // ── Design options (Fix 3 + 4) ────────────────────────────────────────────
  const [outputContext, setOutputContext] = useState('digital')
  const [languageMode, setLanguageMode]  = useState('en')

  // Fetch fresh menu data on mount so counts are never stale from hook state
  useEffect(() => {
    let cancelled = false
    fetchMenus()
      .then(res => { if (!cancelled) setFreshMenus(res?.menus || []) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  // ── Phase 1: select a menu ─────────────────────────────────────────────────
  const handleSelectMenu = useCallback(async (menu) => {
    setLoadingMenu(true)
    setMenuError(null)
    setActiveMenu(menu)
    setCocktails([])
    setDesignState({})
    setNarratives({})
    setGenerateProgress(null)
    setFullMenuOpen(false)
    // Reset final design state on menu switch (Fix 2)
    setFinalDesign(null)
    setFinalDesignError(null)
    setRationaleOpen(false)

    try {
      const data = await onLoadMenu(menu.id)
      const list = data?.cocktails || []
      setCocktails(list)

      const [designsRes, narrativeResults, savedDesignRes] = await Promise.all([
        fetchVisualMenu(menu.id).catch(() => ({ designs: [] })),
        Promise.all(
          list.map(c =>
            fetchNarrative(c.id)
              .then(res => ({ id: c.id, narrative: res?.narrative || null }))
              .catch(() => ({ id: c.id, narrative: null }))
          )
        ),
        // Fix 2 — load previously saved menu design, if any
        fetchMenuDesign(menu.id).catch(() => ({ design: null })),
      ])

      const savedMap = {}
      for (const d of (designsRes.designs || [])) {
        savedMap[d.cocktail_id] = {
          status:   d.status === 'done' ? 'done' : 'idle',
          imageUrl: d.image_url ? dataUrlToBlobUrl(d.image_url) : null,
          prompt:   d.image_prompt || null
        }
      }
      const initDesigns = {}
      for (const c of list) {
        initDesigns[c.id] = savedMap[c.id] || { status: 'idle', imageUrl: null, prompt: null }
      }
      setDesignState(initDesigns)

      const narMap = {}
      for (const { id, narrative } of narrativeResults) {
        if (narrative) narMap[id] = narrative
      }
      setNarratives(narMap)

      // Restore saved menu design (Fix 2)
      if (savedDesignRes?.design?.menuHtml) {
        setFinalDesign(savedDesignRes.design)
      }
    } catch {
      setMenuError('Could not load this menu.')
    } finally {
      setLoadingMenu(false)
    }
  }, [onLoadMenu])

  function handleBack() {
    setActiveMenu(null)
    setCocktails([])
    setDesignState({})
    setNarratives({})
    setMenuError(null)
    setGenerateProgress(null)
    setGeneratingAll(false)
    setFullMenuOpen(false)
    setFinalDesign(null)
    setFinalDesignLoading(false)
    setFinalDesignError(null)
    setRationaleOpen(false)
    setOutputContext('digital')
    setLanguageMode('en')
  }

  // ── Build Final Menu ─────────────────────────────────────────────────────
  const handleBuildFinalMenu = useCallback(async () => {
    if (!activeMenu?.id) return
    setFinalDesignLoading(true)
    setFinalDesignError(null)
    setFinalDesign(null)
    setRationaleOpen(false)
    try {
      const design = await generateFinalCocktailMenuDesign({
        menuId:            activeMenu.id,
        outputContext,                        // Fix 3 — from state
        languageMode:      languageMode === 'en' ? null : languageMode,  // Fix 4
        cocktailNames:     cocktails.map(c => c.name),
        preserveCocktails: true,
      })
      setFinalDesign(design)
      setTimeout(() => menuPreviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setFinalDesignError(err?.message || 'Menu design generation failed. Please try again.')
    } finally {
      setFinalDesignLoading(false)
    }
  }, [activeMenu, cocktails, outputContext, languageMode])

  // ── Export / Print (Fix 5) ────────────────────────────────────────────────
  // TODO: replace with Puppeteer server-side render for production PDF
  const handleExportPrint = useCallback(() => {
    if (!finalDesign?.templateBase) return

    // Inject temporary @media print overrides that hide all app chrome.
    // Only the menu preview wrapper (data-hestia-menu-preview) will print.
    const styleId = 'hestia-menu-print-override'
    const existing = document.getElementById(styleId)
    if (existing) existing.remove()

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @media print {
        [data-hestia-no-print] { display: none !important; }
        [data-hestia-menu-preview] {
          display: block !important;
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: white;
          overflow: auto;
        }
        [data-hestia-menu-preview] iframe {
          width: 100% !important;
          height: 100vh !important;
          border: none !important;
        }
      }
    `
    document.head.appendChild(style)

    // Clean up after printing is done
    const cleanup = () => {
      style.remove()
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)

    window.print()
  }, [finalDesign])

  // ── Per-cocktail generation ────────────────────────────────────────────────
  const handleGenerateImage = useCallback(async (cocktailId) => {
    const cocktail = cocktails.find(c => c.id === cocktailId)
    if (!cocktail) return

    setDesignState(prev => ({
      ...prev,
      [cocktailId]: { status: 'loading', imageUrl: null, prompt: null }
    }))

    try {
      const result = await generateCocktailImage(cocktail)
      if (!result?.imageData) throw new Error('No image data returned')

      await saveVisualDesign(cocktailId, {
        menu_id:      activeMenu.id,
        image_prompt: result.prompt || null,
        image_url:    result.imageData,
        status:       'done'
      })
      setDesignState(prev => ({
        ...prev,
        [cocktailId]: { status: 'done', imageUrl: dataUrlToBlobUrl(result.imageData), prompt: result.prompt || null }
      }))
    } catch {
      setDesignState(prev => ({
        ...prev,
        [cocktailId]: { status: 'error', imageUrl: null, prompt: null }
      }))
    }
  }, [cocktails, activeMenu])

  // ── Generate All — sequential ──────────────────────────────────────────────
  const handleGenerateAll = useCallback(async () => {
    const pending = cocktails.filter(c => {
      const s = designState[c.id]?.status
      return s === 'idle' || s === 'error'
    })
    if (pending.length === 0) return

    setGeneratingAll(true)
    setGenerateProgress({ done: 0, total: pending.length })

    for (let i = 0; i < pending.length; i++) {
      const c = pending[i]

      setDesignState(prev => ({
        ...prev,
        [c.id]: { status: 'loading', imageUrl: null, prompt: null }
      }))

      try {
        const result = await generateCocktailImage(c)
        if (!result?.imageData) throw new Error('No image data returned')

        await saveVisualDesign(c.id, {
          menu_id:      activeMenu.id,
          image_prompt: result.prompt || null,
          image_url:    result.imageData,
          status:       'done'
        })
        setDesignState(prev => ({
          ...prev,
          [c.id]: { status: 'done', imageUrl: dataUrlToBlobUrl(result.imageData), prompt: result.prompt || null }
        }))
      } catch {
        setDesignState(prev => ({
          ...prev,
          [c.id]: { status: 'error', imageUrl: null, prompt: null }
        }))
      }

      setGenerateProgress({ done: i + 1, total: pending.length })
    }

    setGeneratingAll(false)
  }, [cocktails, designState, activeMenu])

  // ── Phase 1: menu selector ─────────────────────────────────────────────────
  const displayMenus = freshMenus ?? ciMenus

  if (!activeMenu) {
    return (
      <div>
        {!displayMenus?.length ? (
          <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-14 text-center">
            <p className="text-sm text-[#6b705c]">No saved menus yet.</p>
            <p className="text-xs text-[#6b705c]/50 mt-1.5">
              Generate and approve a menu first, then come back here to create visual cards.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayMenus.map(menu => (
              <MenuCard key={menu.id} menu={menu} onSelect={handleSelectMenu} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Phase 2: visual workspace ──────────────────────────────────────────────
  const doneCount    = cocktails.filter(c => designState[c.id]?.status === 'done').length
  const pendingCount = cocktails.filter(c => {
    const s = designState[c.id]?.status
    return s !== 'done'
  }).length
  const allDone    = cocktails.length > 0 && doneCount === cocktails.length
  const anyLoading = cocktails.some(c => designState[c.id]?.status === 'loading')

  return (
    <>
      {fullMenuOpen && (
        <FullMenuView
          menu={activeMenu}
          cocktails={cocktails}
          designState={designState}
          narratives={narratives}
          onClose={() => setFullMenuOpen(false)}
        />
      )}

      <div>
        {/* Breadcrumb + controls — hidden on print (Fix 5) */}
        <div data-hestia-no-print className="flex flex-wrap items-center gap-3 mb-8">
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

          <div className="ml-auto flex items-center gap-3 flex-wrap">
            {cocktails.length > 0 && (
              <span className="text-[10px] text-[#6b705c]">
                {doneCount}/{cocktails.length} generated
              </span>
            )}
            {allDone && (
              <button
                onClick={() => setFullMenuOpen(true)}
                className="rounded-xl border border-[#c9a96e]/40 bg-[#c9a96e]/8 px-4 py-2 text-xs font-bold text-[#c9a96e] transition hover:bg-[#c9a96e]/15"
              >
                View Full Menu
              </button>
            )}
            {pendingCount > 0 && (
              <button
                onClick={handleGenerateAll}
                disabled={generatingAll || anyLoading}
                className="rounded-xl border border-[#c9a96e]/30 px-4 py-2 text-xs font-bold text-[#c9a96e]/80 transition hover:border-[#c9a96e]/60 hover:bg-[#c9a96e]/5 hover:text-[#c9a96e] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {generatingAll && generateProgress
                  ? `Generating ${generateProgress.done + 1}/${generateProgress.total}…`
                  : `Generate All (${pendingCount})`
                }
              </button>
            )}

            {/* Fix 3 — Output context selector */}
            {cocktails.length > 0 && (
              <select
                value={outputContext}
                onChange={e => setOutputContext(e.target.value)}
                disabled={finalDesignLoading}
                className="rounded-lg border border-[#6b705c]/30 bg-[#1a1a1a] px-2.5 py-1.5 text-[11px] text-[#6b705c] outline-none focus:border-[#c9a96e] disabled:opacity-40"
                title="Output context"
              >
                <option value="digital">Digital</option>
                <option value="print">Print</option>
                <option value="low-light">Low-light</option>
                <option value="daylight">Daylight</option>
              </select>
            )}

            {/* Fix 4 — Language mode selector */}
            {cocktails.length > 0 && (
              <select
                value={languageMode}
                onChange={e => setLanguageMode(e.target.value)}
                disabled={finalDesignLoading}
                className="rounded-lg border border-[#6b705c]/30 bg-[#1a1a1a] px-2.5 py-1.5 text-[11px] text-[#6b705c] outline-none focus:border-[#c9a96e] disabled:opacity-40"
                title="Language"
              >
                <option value="en">English</option>
                <option value="he-en">Hebrew + EN</option>
              </select>
            )}

            {/* Primary CTA — HESTIA Menu Design */}
            {cocktails.length > 0 && (
              <button
                onClick={handleBuildFinalMenu}
                disabled={finalDesignLoading || loadingMenu}
                className="rounded-xl bg-[#c9a96e] px-5 py-2 text-xs font-black text-[#0d0c09] shadow-sm transition hover:bg-[#dfc497] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {finalDesignLoading ? 'Designing…' : 'Build Final Menu'}
              </button>
            )}
          </div>
        </div>

        {/* Error — menu load */}
        {menuError && (
          <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400 mb-6">
            {menuError}
          </div>
        )}

        {/* Loading — menu */}
        {loadingMenu && (
          <div className="py-20 text-center">
            <div className="text-sm text-[#6b705c] animate-pulse">Loading menu…</div>
          </div>
        )}

        {/* ── Final Menu Design — loading / error / result ──────────────────── */}

        {finalDesignLoading && (
          <div className="mb-8 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 px-6 py-10 text-center">
            <div className="relative mx-auto mb-5 h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-[#c9a96e]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#c9a96e] animate-spin" />
            </div>
            <p className="text-sm font-semibold text-[#f5f5f0]">HESTIA is designing your menu…</p>
            <p className="mt-1 text-xs text-[#6b705c]">Applying v5.2 — this may take 20–40 seconds</p>
          </div>
        )}

        {finalDesignError && !finalDesignLoading && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400 flex items-start gap-2">
            <span className="shrink-0">✕</span>
            <span>{finalDesignError}</span>
          </div>
        )}

        {finalDesign && !finalDesignLoading && (
          <div ref={menuPreviewRef} className="mb-10 space-y-4">
            {/* Design rationale — collapsible (Fix 5: hidden on print) */}
            <div data-hestia-no-print className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 overflow-hidden">
              <button
                onClick={() => setRationaleOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#ffffff]/3 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.35em] text-[#c9a96e]/70">Design Rationale</span>
                  <span className="rounded-full border border-[#c9a96e]/20 px-2 py-0.5 text-[9px] font-bold text-[#c9a96e]/80 uppercase tracking-wider">
                    {finalDesign.templateBase?.replace('_', ' ') ?? 'Custom'}
                  </span>
                  <span className="rounded-full border border-[#6b705c]/20 px-2 py-0.5 text-[9px] text-[#6b705c] italic">
                    "{finalDesign.identityWord ?? '—'}"
                  </span>
                  {/* Fix 2 — show saved date when loaded from DB */}
                  {finalDesign.generatedAt && (
                    <span className="text-[9px] text-[#6b705c]/50">
                      Saved {formatDesignDate(finalDesign.generatedAt)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#6b705c]">{rationaleOpen ? '▲' : '▼'}</span>
              </button>

              {rationaleOpen && (
                <div className="border-t border-[#6b705c]/10 px-5 py-5 space-y-4">
                  {/* Creative Territory */}
                  {finalDesign.creativeTerritory && (
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.35em] text-[#c9a96e]/60 mb-1">Creative Territory</div>
                      <p className="text-xs text-[#e8dcc0]/75 leading-relaxed italic">{finalDesign.creativeTerritory}</p>
                    </div>
                  )}

                  {/* Design Anchors */}
                  {Array.isArray(finalDesign.designAnchors) && finalDesign.designAnchors.length > 0 && (
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.35em] text-[#c9a96e]/60 mb-2">Design Anchors</div>
                      <ul className="space-y-1">
                        {finalDesign.designAnchors.map((anchor, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#e8dcc0]/70">
                            <span className="shrink-0 text-[#c9a96e]/50">—</span>
                            <span>{anchor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Color System */}
                  {finalDesign.colorSystem && typeof finalDesign.colorSystem === 'object' && (
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.35em] text-[#c9a96e]/60 mb-2">Color System</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(finalDesign.colorSystem).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-1.5 rounded-full border border-[#6b705c]/20 px-2.5 py-1">
                            <div
                              className="h-2.5 w-2.5 rounded-full border border-white/10 shrink-0"
                              style={{ background: /^#[0-9a-f]{3,8}$/i.test(String(val)) ? val : '#6b705c' }}
                            />
                            <span className="text-[9px] text-[#6b705c] capitalize">{key}</span>
                            <span className="text-[9px] text-[#e8dcc0]/50">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Typography — new spec shape: design.typography object */}
                  {finalDesign.typography && (
                    <div>
                      <div className="text-[9px] font-black uppercase tracking-[0.35em] text-[#c9a96e]/60 mb-1">Typography</div>
                      <p className="text-xs text-[#e8dcc0]/70 leading-relaxed">
                        {[
                          finalDesign.typography.headingFont && `Heading: ${finalDesign.typography.headingFont}`,
                          finalDesign.typography.headingCharacter,
                          finalDesign.typography.bodyFont && `Body: ${finalDesign.typography.bodyFont}`,
                          finalDesign.typography.bodyCharacter,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons — hidden on print (Fix 5) */}
            <div data-hestia-no-print className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleExportPrint}
                className="rounded-xl border border-[#c9a96e]/30 px-5 py-2 text-xs font-bold text-[#c9a96e] transition hover:bg-[#c9a96e]/10"
              >
                Export / Print
              </button>
              <button
                onClick={handleBuildFinalMenu}
                disabled={finalDesignLoading}
                className="rounded-xl border border-[#6b705c]/30 px-5 py-2 text-xs text-[#f5f5f0]/60 transition hover:border-[#c9a96e]/30 hover:text-[#c9a96e] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Regenerate
              </button>
              <span className="ml-auto text-[9px] text-[#6b705c]/50">Powered by HESTIA v5.2</span>
            </div>

            {/* Menu Preview — React template engine (no iframe) */}
            <div
              data-hestia-menu-preview
              className="rounded-2xl overflow-hidden border border-[#6b705c]/15 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            >
              <MenuRenderer spec={finalDesign} />
            </div>
          </div>
        )}

        {/* Empty */}
        {!loadingMenu && !menuError && cocktails.length === 0 && (
          <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-14 text-center">
            <p className="text-sm text-[#6b705c]">No cocktails saved to this menu.</p>
          </div>
        )}

        {/* Visual card grid */}
        {!loadingMenu && cocktails.length > 0 && (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {cocktails.map((c, i) => (
              <VisualCard
                key={c.id ?? i}
                cocktail={c}
                cardState={designState[c.id] || { status: 'idle', imageUrl: null, prompt: null }}
                onGenerate={handleGenerateImage}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
