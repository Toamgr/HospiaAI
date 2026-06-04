import { useState, useCallback } from 'react'
import { fetchNarrative, generateNarrative } from '../../services/api/cocktailIntelligenceApi'

// ── Helpers ───────────────────────────────────────────────────────────────────

function initState(cocktails, fetchedMap) {
  const state = {}
  for (const c of cocktails) {
    const row = fetchedMap[c.id]
    if (row) {
      state[c.id] = { status: 'done', narrative: row }
    } else {
      state[c.id] = { status: 'idle', narrative: null }
    }
  }
  return state
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

function NarrativeLayer({ label, content, accent }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
    >
      <div
        className="text-[9px] font-black uppercase tracking-[0.2em] mb-2"
        style={{ color: accent.label }}
      >
        {label}
      </div>
      <p className="text-[13px] leading-relaxed text-[#e8dcc0]/85">
        {content}
      </p>
    </div>
  )
}

function CocktailNarrativeCard({ cocktail, cardState, onGenerate }) {
  const { status, narrative } = cardState

  return (
    <div className="rounded-2xl border border-[#6b705c]/15 bg-[#1a1a1a]/60 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-[#f5f5f0] leading-snug">{cocktail.name}</h3>
          {cocktail.base_spirit && (
            <span className="text-[11px] text-[#6b705c] capitalize">{cocktail.base_spirit}</span>
          )}
        </div>
        {status === 'done' && (
          <span className="shrink-0 mt-0.5 rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/8 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#c9a96e]">
            Generated
          </span>
        )}
        {status === 'idle' && (
          <span className="shrink-0 mt-0.5 rounded-full border border-[#6b705c]/25 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#6b705c]">
            No narrative
          </span>
        )}
        {status === 'loading' && (
          <span className="shrink-0 mt-0.5 rounded-full border border-[#c9a96e]/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#c9a96e]/60 animate-pulse">
            Generating…
          </span>
        )}
        {status === 'error' && (
          <span className="shrink-0 mt-0.5 rounded-full border border-red-500/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-red-400">
            Error
          </span>
        )}
      </div>

      {/* Narrative layers */}
      {status === 'done' && narrative && (
        <div className="flex flex-col gap-3">
          {/* Layer 1 — Menu Description */}
          <NarrativeLayer
            label="Menu Copy"
            content={narrative.menu_description}
            accent={{
              bg:     'rgba(201,169,110,0.06)',
              border: 'rgba(201,169,110,0.18)',
              label:  'rgba(201,169,110,0.7)'
            }}
          />
          {/* Layer 2 — Server Script */}
          <NarrativeLayer
            label="Server Script"
            content={narrative.server_script}
            accent={{
              bg:     'rgba(107,112,92,0.08)',
              border: 'rgba(107,112,92,0.22)',
              label:  'rgba(107,112,92,0.8)'
            }}
          />
          {/* Layer 3 — Story Card (always fully expanded) */}
          <NarrativeLayer
            label="Story Card"
            content={narrative.story_card}
            accent={{
              bg:     'rgba(232,220,192,0.04)',
              border: 'rgba(107,112,92,0.15)',
              label:  'rgba(232,220,192,0.4)'
            }}
          />
        </div>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div className="py-6 text-center">
          <div className="text-xs text-[#6b705c] animate-pulse">Writing narrative…</div>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-3 py-2 text-xs text-red-400">
          Generation failed.
        </div>
      )}

      {/* Action */}
      {(status === 'idle' || status === 'error') && (
        <button
          onClick={() => onGenerate(cocktail.id)}
          className="rounded-xl border border-[#c9a96e]/25 py-2 text-xs font-bold text-[#c9a96e]/70 transition hover:border-[#c9a96e]/50 hover:bg-[#c9a96e]/5 hover:text-[#c9a96e]"
        >
          {status === 'error' ? 'Retry' : 'Generate Narrative'}
        </button>
      )}

      {status === 'done' && (
        <button
          onClick={() => onGenerate(cocktail.id)}
          className="rounded-xl border border-[#6b705c]/15 py-2 text-[11px] text-[#6b705c]/50 transition hover:border-[#6b705c]/30 hover:text-[#6b705c]"
        >
          Regenerate
        </button>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function NarrativeIntelligence({ ciMenus, onLoadMenu }) {
  const [activeMenu, setActiveMenu]         = useState(null)
  const [cocktails, setCocktails]           = useState([])
  const [narrativeState, setNarrativeState] = useState({})
  const [loadingMenu, setLoadingMenu]       = useState(false)
  const [menuError, setMenuError]           = useState(null)
  const [generatingAll, setGeneratingAll]   = useState(false)
  const [generateProgress, setGenerateProgress] = useState(null) // { done, total }

  // ── Phase 1: select a menu ─────────────────────────────────────────────────
  const handleSelectMenu = useCallback(async (menu) => {
    setLoadingMenu(true)
    setMenuError(null)
    setActiveMenu(menu)
    setCocktails([])
    setNarrativeState({})
    setGenerateProgress(null)

    try {
      const data = await onLoadMenu(menu.id)
      const list = data?.cocktails || []
      setCocktails(list)

      // Fetch existing narratives for all cocktails in parallel
      const fetched = await Promise.all(
        list.map(c =>
          fetchNarrative(c.id)
            .then(res => ({ id: c.id, narrative: res?.narrative || null }))
            .catch(() => ({ id: c.id, narrative: null }))
        )
      )

      const fetchedMap = {}
      for (const { id, narrative } of fetched) {
        if (narrative) fetchedMap[id] = narrative
      }

      setNarrativeState(initState(list, fetchedMap))
    } catch {
      setMenuError('Could not load this menu.')
    } finally {
      setLoadingMenu(false)
    }
  }, [onLoadMenu])

  function handleBack() {
    setActiveMenu(null)
    setCocktails([])
    setNarrativeState({})
    setMenuError(null)
    setGenerateProgress(null)
    setGeneratingAll(false)
  }

  // ── Per-cocktail generation ────────────────────────────────────────────────
  const handleGenerate = useCallback(async (cocktailId) => {
    setNarrativeState(prev => ({
      ...prev,
      [cocktailId]: { status: 'loading', narrative: prev[cocktailId]?.narrative || null }
    }))
    try {
      const res = await generateNarrative(cocktailId)
      setNarrativeState(prev => ({
        ...prev,
        [cocktailId]: { status: 'done', narrative: res.narrative }
      }))
    } catch {
      setNarrativeState(prev => ({
        ...prev,
        [cocktailId]: { status: 'error', narrative: null }
      }))
    }
  }, [])

  // ── Generate All — sequential ──────────────────────────────────────────────
  const handleGenerateAll = useCallback(async () => {
    const pending = cocktails.filter(c => {
      const s = narrativeState[c.id]?.status
      return s === 'idle' || s === 'error'
    })
    if (pending.length === 0) return

    setGeneratingAll(true)
    setGenerateProgress({ done: 0, total: pending.length })

    for (let i = 0; i < pending.length; i++) {
      const c = pending[i]
      setNarrativeState(prev => ({
        ...prev,
        [c.id]: { status: 'loading', narrative: prev[c.id]?.narrative || null }
      }))
      try {
        const res = await generateNarrative(c.id)
        setNarrativeState(prev => ({
          ...prev,
          [c.id]: { status: 'done', narrative: res.narrative }
        }))
      } catch {
        setNarrativeState(prev => ({
          ...prev,
          [c.id]: { status: 'error', narrative: null }
        }))
      }
      setGenerateProgress({ done: i + 1, total: pending.length })
    }

    setGeneratingAll(false)
  }, [cocktails, narrativeState])

  // ── Phase 1: menu selector ─────────────────────────────────────────────────
  if (!activeMenu) {
    return (
      <div>
        {!ciMenus?.length ? (
          <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-14 text-center">
            <p className="text-sm text-[#6b705c]">No saved menus yet.</p>
            <p className="text-xs text-[#6b705c]/50 mt-1.5">
              Generate and approve a menu first, then come back here to write the narratives.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ciMenus.map(menu => (
              <MenuCard key={menu.id} menu={menu} onSelect={handleSelectMenu} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── Phase 2: narrative workspace ───────────────────────────────────────────
  const doneCount    = cocktails.filter(c => narrativeState[c.id]?.status === 'done').length
  const pendingCount = cocktails.filter(c => {
    const s = narrativeState[c.id]?.status
    return s === 'idle' || s === 'error'
  }).length
  const anyLoading   = cocktails.some(c => narrativeState[c.id]?.status === 'loading')

  return (
    <div>
      {/* Breadcrumb + controls */}
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

        <div className="ml-auto flex items-center gap-3">
          {cocktails.length > 0 && (
            <span className="text-[10px] text-[#6b705c]">
              {doneCount}/{cocktails.length} generated
            </span>
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
        </div>
      </div>

      {/* Menu load error */}
      {menuError && (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-3 text-sm text-red-400 mb-6">
          {menuError}
        </div>
      )}

      {/* Loading menu */}
      {loadingMenu && (
        <div className="py-20 text-center">
          <div className="text-sm text-[#6b705c] animate-pulse">Loading menu…</div>
        </div>
      )}

      {/* Empty menu */}
      {!loadingMenu && !menuError && cocktails.length === 0 && (
        <div className="rounded-2xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-6 py-14 text-center">
          <p className="text-sm text-[#6b705c]">No cocktails saved to this menu.</p>
        </div>
      )}

      {/* Cocktail grid */}
      {!loadingMenu && cocktails.length > 0 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {cocktails.map((c, i) => (
            <CocktailNarrativeCard
              key={c.id ?? i}
              cocktail={c}
              cardState={narrativeState[c.id] || { status: 'idle', narrative: null }}
              onGenerate={handleGenerate}
            />
          ))}
        </div>
      )}
    </div>
  )
}
