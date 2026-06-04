// CI MODULE ADDITION — Flow 2: Menu Audit
import { useState, useEffect, useRef } from 'react'

function toStr(item) {
  if (item == null) return ''
  if (typeof item === 'string') return item
  if (typeof item === 'object') {
    return item.message || item.warning || item.text || item.label || item.name || JSON.stringify(item)
  }
  return String(item)
}

const LOADING_MESSAGES = [
  'Reading your menu...',
  'Consulting your Beverage Director...',
  'Analyzing spirit balance...',
  'Checking venue identity fit...',
  'Preparing audit report...'
]

const DEMO_MENU = `Aperol Spritz — Aperol, Prosecco, soda
Mojito — rum, lime, mint, sugar, soda
Cosmopolitan — vodka, triple sec, cranberry, lime
Espresso Martini — vodka, Kahlua, espresso
Margarita — tequila, triple sec, lime
Sex on the Beach — vodka, peach schnapps, orange juice, cranberry`

// ── Color helpers ────────────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 86) return 'text-[#c9a96e]'
  if (score >= 71) return 'text-emerald-400'
  if (score >= 51) return 'text-amber-400'
  return 'text-red-400'
}

function scoreBorder(score) {
  if (score >= 86) return 'border-[#c9a96e]/40 bg-[#c9a96e]/10'
  if (score >= 71) return 'border-emerald-500/30 bg-emerald-950/20'
  if (score >= 51) return 'border-amber-500/30 bg-amber-950/20'
  return 'border-red-500/30 bg-red-950/20'
}

function scoreLabel(score) {
  if (score >= 86) return 'Outstanding'
  if (score >= 71) return 'Strong'
  if (score >= 51) return 'Needs Work'
  return 'Critical Issues'
}

// keep=green / modify=amber / replace=red / retire=grey
function verdictStyle(verdict) {
  switch ((verdict || '').toLowerCase()) {
    case 'keep':    return 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
    case 'modify':  return 'border-amber-500/30 bg-amber-950/20 text-amber-400'
    case 'replace': return 'border-red-500/30 bg-red-950/20 text-red-400'
    case 'retire':  return 'border-[#6b705c]/30 bg-[#6b705c]/10 text-[#6b705c]'
    default:        return 'border-[#6b705c]/20 bg-transparent text-[#6b705c]'
  }
}

// high=red / medium=amber / low=grey/blue
function severityColors(sev) {
  switch ((sev || '').toLowerCase()) {
    case 'high':   return 'text-red-400 border-red-500/20 bg-red-950/20'
    case 'medium': return 'text-amber-400 border-amber-500/20 bg-amber-950/20'
    default:       return 'text-blue-400 border-blue-500/20 bg-blue-950/20'
  }
}

// Impact: high=green / medium=amber / low=grey
function impactColor(impact) {
  switch ((impact || '').toLowerCase()) {
    case 'high':   return 'text-emerald-400'
    case 'medium': return 'text-amber-400'
    default:       return 'text-[#6b705c]'
  }
}

// Effort: easy=green / medium=amber / hard=red
function effortColor(effort) {
  switch ((effort || '').toLowerCase()) {
    case 'easy':   return 'text-emerald-400'
    case 'medium': return 'text-amber-400'
    case 'hard':   return 'text-red-400'
    default:       return 'text-[#6b705c]'
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function LoadingView({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-[#c9a96e]/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#c9a96e] animate-spin" />
        <div className="absolute inset-3 rounded-full bg-[#c9a96e]/10" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[#f5f5f0]">{message}</p>
        <p className="mt-1 text-xs text-[#6b705c]">AI audit in progress</p>
      </div>
    </div>
  )
}

function StructuredRow({ index, data, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-[1.5rem_1fr_7rem_1fr_5.5rem_1.5rem] gap-2 items-start">
      <span className="pt-2.5 text-[10px] text-[#6b705c] text-right">{index + 1}.</span>
      <input
        className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e] placeholder:text-[#6b705c]"
        placeholder="Cocktail name"
        value={data.name}
        onChange={e => onChange(index, 'name', e.target.value)}
      />
      <input
        className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e] placeholder:text-[#6b705c]"
        placeholder="Base spirit"
        value={data.spirit}
        onChange={e => onChange(index, 'spirit', e.target.value)}
      />
      <input
        className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e] placeholder:text-[#6b705c]"
        placeholder="Key ingredients"
        value={data.ingredients}
        onChange={e => onChange(index, 'ingredients', e.target.value)}
      />
      <input
        type="number"
        min="0"
        className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e] placeholder:text-[#6b705c]"
        placeholder="₪ price"
        value={data.price}
        onChange={e => onChange(index, 'price', e.target.value)}
      />
      <div className="pt-1 flex justify-center">
        {index > 0 && (
          <button
            onClick={() => onRemove(index)}
            className="text-sm text-red-400/40 hover:text-red-400 transition"
            title="Remove"
          >✕</button>
        )}
      </div>
    </div>
  )
}

function AuditResult({ result, venueName, onNewAudit }) {
  const score       = Number(result.overall_score) || 0
  const strengths   = Array.isArray(result.strengths) ? result.strengths : []
  const issues      = Array.isArray(result.critical_issues) ? result.critical_issues : []
  const perCocktail = Array.isArray(result.per_cocktail) ? result.per_cocktail : []
  const missing     = Array.isArray(result.missing_from_menu) ? result.missing_from_menu : []
  const quickWins   = Array.isArray(result.quick_wins) ? result.quick_wins : []

  const sortedIssues = [...issues].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return (order[toStr(a.severity).toLowerCase()] ?? 3) - (order[toStr(b.severity).toLowerCase()] ?? 3)
  })

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          {venueName && (
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">
              {venueName}
            </p>
          )}
          <p className="text-sm font-semibold text-[#f5f5f0]">Audit Report</p>
        </div>
        <button
          onClick={onNewAudit}
          className="rounded-xl border border-[#6b705c]/30 px-4 py-2 text-xs text-[#f5f5f0]/70 hover:border-[#c9a96e]/40 hover:text-[#c9a96e] transition"
        >
          ← New Audit
        </button>
      </div>

      {/* ── Section 1: Score + Verdict ── */}
      <div className={`rounded-2xl border p-8 flex flex-col items-center gap-2 ${scoreBorder(score)}`}>
        <div className={`text-6xl font-black tabular-nums leading-none ${scoreColor(score)}`}>{score}</div>
        <div className={`text-xs font-bold uppercase tracking-[0.3em] mt-1 ${scoreColor(score)}`}>
          {scoreLabel(score)}
        </div>
        {result.overall_verdict && (
          <p className="text-sm text-[#e8dcc0]/70 text-center max-w-lg mt-2 leading-relaxed">
            {toStr(result.overall_verdict)}
          </p>
        )}
      </div>

      {/* ── Section 2: Strengths ── */}
      {strengths.length > 0 && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400/70 mb-3">Strengths</div>
          <ul className="space-y-2">
            {strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#e8dcc0]/80">
                <span className="text-emerald-400 shrink-0 mt-0.5">✓</span>
                {toStr(s)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Section 3: Critical Issues, sorted high → medium → low ── */}
      {sortedIssues.length > 0 && (
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-3">
            Critical Issues
          </div>
          <div className="space-y-3">
            {sortedIssues.map((issue, i) => {
              const sev = toStr(issue.severity)
              const cls = severityColors(sev)
              const [textCls, borderCls, bgCls] = cls.split(' ')
              return (
                <div key={i} className={`rounded-2xl border p-4 ${borderCls} ${bgCls}`}>
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest mt-0.5 ${textCls} ${borderCls} ${bgCls}`}>
                      {sev || 'issue'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#f5f5f0] leading-snug">{toStr(issue.issue)}</p>
                      {Array.isArray(issue.affected_cocktails) && issue.affected_cocktails.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {issue.affected_cocktails.map((name, j) => (
                            <span key={j} className="rounded-full border border-[#6b705c]/20 px-2 py-0.5 text-[10px] text-[#6b705c]">
                              {toStr(name)}
                            </span>
                          ))}
                        </div>
                      )}
                      {issue.recommendation && (
                        <p className="text-xs text-[#e8dcc0]/60 mt-1.5 leading-relaxed">{toStr(issue.recommendation)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Section 4: Per Cocktail ── */}
      {perCocktail.length > 0 && (
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-3">Per Cocktail</div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {perCocktail.map((c, i) => {
              const cScore  = Number(c.score) || 0
              const verdict = toStr(c.verdict).toLowerCase()
              return (
                <div key={i} className="rounded-2xl border border-[#6b705c]/10 bg-[#1a1a1a]/60 p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#f5f5f0] leading-snug">{toStr(c.name)}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold tabular-nums ${scoreColor(cScore)}`}>{cScore}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${verdictStyle(verdict)}`}>
                        {verdict || 'review'}
                      </span>
                    </div>
                  </div>
                  {Array.isArray(c.issues) && c.issues.length > 0 && (
                    <ul className="space-y-0.5">
                      {c.issues.map((iss, j) => (
                        <li key={j} className="text-xs text-[#e8dcc0]/60 leading-snug">• {toStr(iss)}</li>
                      ))}
                    </ul>
                  )}
                  {c.suggestion && (
                    <p className="text-xs text-[#c9a96e]/70 italic leading-snug">{toStr(c.suggestion)}</p>
                  )}
                  {verdict === 'replace' && (
                    <button
                      disabled
                      title="Single Cocktail Development — Flow 3"
                      className="mt-1 w-full rounded-xl border border-[#6b705c]/20 py-2 text-xs text-[#6b705c]/50 cursor-not-allowed"
                    >
                      Find Replacement — Coming Soon
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Section 5: Missing from Menu ── */}
      {missing.length > 0 && (
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-3">
            What's Missing
          </div>
          <div className="flex flex-wrap gap-2">
            {missing.map((m, i) => (
              <span key={i} className="rounded-full border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-3 py-1 text-xs text-[#e8dcc0]/60">
                {toStr(m)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Section 6: Quick Wins ── */}
      {quickWins.length > 0 && (
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-3">Quick Wins</div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {quickWins.map((w, i) => {
              const impact = toStr(w.impact)
              const effort = toStr(w.effort)
              return (
                <div key={i} className="rounded-2xl border border-[#6b705c]/10 bg-[#1a1a1a]/60 p-4 flex flex-col gap-2">
                  <p className="text-sm text-[#f5f5f0] leading-snug">{toStr(w.action)}</p>
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
                    <span className={impactColor(impact)}>
                      Impact: {impact || '—'}
                    </span>
                    <span className={effortColor(effort)}>
                      Effort: {effort || '—'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Section 7: Menu Narrative ── */}
      {result.menu_narrative && (
        <div className="rounded-2xl border border-[#c9a96e]/15 bg-[#c9a96e]/5 p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e]/70 mb-3">Menu Narrative</div>
          <blockquote className="border-l-2 border-[#c9a96e]/30 pl-4 text-sm text-[#e8dcc0]/80 leading-relaxed italic">
            {toStr(result.menu_narrative)}
          </blockquote>
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function MenuAudit({ dna, onAudit, prefilledMenu, ciMenus, ciCocktails }) {
  const [inputTab, setInputTab]     = useState('quick')
  // Seed directly from prop so fresh-mount prefill is immediate (no effect timing gap)
  const [quickText, setQuickText]   = useState(prefilledMenu || '')
  const [rows, setRows]             = useState([
    { name: '', spirit: '', ingredients: '', price: '' }
  ])
  const [view, setView]             = useState('form')
  const [result, setResult]         = useState(null)
  const [errorMsg, setErrorMsg]     = useState('')
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])
  const msgIndex = useRef(0)

  const venueName = dna?.bar_name || dna?.venue_name || null

  // Handle prop updates after mount (e.g. user audits a second menu without unmounting)
  useEffect(() => {
    if (!prefilledMenu) return
    setQuickText(prefilledMenu)
    setInputTab('quick')
    setView('form')
  }, [prefilledMenu])

  function buildMenuAuditText(menuId) {
    if (!Array.isArray(ciCocktails)) return ''
    const id = Number(menuId)
    const mCocktails = ciCocktails.filter(c => c.menu_id === id || c.menu_id === menuId)
    if (mCocktails.length === 0) return ''
    return mCocktails.map(c => {
      const spirit = c.base_spirit || ''
      const ings = Array.isArray(c.ingredients)
        ? c.ingredients.map(ing => {
            if (typeof ing === 'string') return ing
            if (!ing) return ''
            const amount = ing.amount ? String(ing.amount).trim() : ''
            const unit   = ing.unit   ? String(ing.unit).trim()   : ''
            const name   = ing.name   ? String(ing.name).trim()   : ''
            return [(amount + unit).trim(), name].filter(Boolean).join(' ')
          }).filter(Boolean)
        : []
      const parts = [spirit, ...ings].filter(Boolean)
      return `${c.name} — ${parts.join(', ')}`
    }).join('\n')
  }

  useEffect(() => {
    if (view !== 'loading') return
    msgIndex.current = 0
    const t = setInterval(() => {
      msgIndex.current = (msgIndex.current + 1) % LOADING_MESSAGES.length
      setLoadingMsg(LOADING_MESSAGES[msgIndex.current])
    }, 2200)
    return () => clearInterval(t)
  }, [view])

  function loadDemo() {
    setQuickText(DEMO_MENU)
    setInputTab('quick')
  }

  function addRow() {
    if (rows.length >= 20) return
    setRows(prev => [...prev, { name: '', spirit: '', ingredients: '', price: '' }])
  }

  function updateRow(i, field, val) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))
  }

  function removeRow(i) {
    if (rows.length <= 1) return
    setRows(prev => prev.filter((_, idx) => idx !== i))
  }

  function buildMenuText() {
    if (inputTab === 'quick') return quickText.trim()
    return rows
      .filter(r => r.name.trim())
      .map(r => {
        const parts = [r.name.trim()]
        if (r.spirit.trim()) parts.push(r.spirit.trim())
        if (r.ingredients.trim()) parts.push(r.ingredients.trim())
        if (r.price.trim()) parts.push(`₪${r.price.trim()}`)
        return parts.join(' — ')
      })
      .join('\n')
  }

  async function handleSubmit() {
    const menu_text = buildMenuText()
    if (!menu_text) return
    setView('loading')
    setLoadingMsg(LOADING_MESSAGES[0])
    setResult(null)
    try {
      const res = await onAudit({ menu_text })
      if (!res || typeof res !== 'object') {
        throw new Error('Unexpected response from AI. Please try again.')
      }
      setResult(res)
      setView('result')
    } catch (err) {
      setErrorMsg(err?.message || 'Audit failed. Please try again.')
      setView('error')
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <div className="rounded-[1.5rem] border border-[#6b705c]/10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <LoadingView message={loadingMsg} />
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (view === 'error') {
    return (
      <div className="rounded-[1.5rem] border border-red-500/20 bg-[#1a1a1a] p-10 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="text-3xl mb-3 text-red-400">✕</div>
        <p className="text-sm font-semibold text-red-300 mb-1">Audit failed</p>
        <p className="text-xs text-[#6b705c] mb-6 max-w-sm mx-auto">{errorMsg}</p>
        <button
          onClick={() => setView('form')}
          className="rounded-xl bg-[#c9a96e] px-6 py-2.5 text-sm font-bold text-[#0d0c09] hover:bg-[#dfc497]"
        >
          Try Again
        </button>
      </div>
    )
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (view === 'result' && result) {
    return (
      <AuditResult
        result={result}
        venueName={venueName}
        onNewAudit={() => setView('form')}
      />
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  const canSubmit = buildMenuText().length > 0

  return (
    <div className="rounded-[1.5rem] border border-[#6b705c]/10 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a08] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      {/* Title */}
      <div className="mb-5">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70 mb-1">
          Menu Audit — Flow 2
        </div>
        <h2 className="text-xl font-bold text-[#f5f5f0]">Audit Your Current Menu</h2>
        <p className="text-sm text-[#e8dcc0]/60 mt-0.5">
          Enter your existing cocktails and get a full AI audit against your bar's DNA.
        </p>
      </div>

      {/* DNA context strip */}
      {dna && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#6b705c]/10 bg-[#0d0c09]/40 px-4 py-3 text-xs text-[#6b705c]">
          <span>DNA: <span className="text-[#c9a96e]">{venueName}</span></span>
          {dna.signature_style && <span>{dna.signature_style}</span>}
          {dna.staff_skill && <span>Staff: {dna.staff_skill}</span>}
          {dna.kosher_aware && (
            <span className="rounded-full border border-amber-500/20 px-2 py-0.5 text-amber-400">Kosher-aware</span>
          )}
        </div>
      )}

      {/* Input tabs */}
      <div className="flex gap-1 rounded-xl border border-[#6b705c]/20 p-1 bg-[#0d0c09]/60 mb-4">
        {[['quick', 'Quick Entry'], ['structured', 'Structured Entry']].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setInputTab(id)}
            className={`flex-1 rounded-lg px-4 py-2 text-xs font-bold transition ${
              inputTab === id
                ? 'bg-[#c9a96e] text-[#0d0c09]'
                : 'text-[#6b705c] hover:text-[#f5f5f0]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Demo loader — visible in both tabs */}
      <div className="mb-4">
        <button
          onClick={loadDemo}
          className="rounded-xl border border-[#6b705c]/30 px-4 py-1.5 text-xs text-[#6b705c] hover:border-[#c9a96e]/40 hover:text-[#c9a96e] transition"
        >
          Load Demo Menu
        </button>
      </div>

      {/* TAB A — Quick Entry */}
      {inputTab === 'quick' && (
        <div className="mb-5">
          {/* Saved menu selector */}
          {Array.isArray(ciMenus) && ciMenus.length > 0 && (
            <div className="mb-3">
              <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.4em] text-[#6b705c]">
                Or select a saved menu
              </label>
              <select
                defaultValue=""
                onChange={e => {
                  if (!e.target.value) return
                  const text = buildMenuAuditText(e.target.value)
                  if (text) setQuickText(text)
                }}
                className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2 text-sm text-[#f5f5f0] outline-none focus:border-[#c9a96e]"
              >
                <option value="">Select a saved menu…</option>
                {ciMenus.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.4em] text-[#c9a96e] opacity-70">
            Menu (one cocktail per line)
          </label>
          <textarea
            className="w-full rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] px-3 py-2.5 text-sm text-[#f5f5f0] outline-none transition focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20 placeholder:text-[#6b705c] resize-none"
            rows={10}
            value={quickText}
            onChange={e => setQuickText(e.target.value)}
            placeholder={`Paste your menu here. Example:\nAperol Spritz — Aperol, Prosecco, soda\nMojito — rum, lime, mint, sugar, soda\nEspresso Martini — vodka, espresso, Kahlua`}
          />
        </div>
      )}

      {/* TAB B — Structured Entry */}
      {inputTab === 'structured' && (
        <div className="mb-5 space-y-2">
          {/* Column headers */}
          <div className="grid grid-cols-[1.5rem_1fr_7rem_1fr_5.5rem_1.5rem] gap-2 px-0">
            {['', 'Cocktail name', 'Base spirit', 'Key ingredients', '₪ Price', ''].map((h, i) => (
              <div key={i} className="text-[9px] font-black uppercase tracking-widest text-[#6b705c]">{h}</div>
            ))}
          </div>
          {rows.map((row, i) => (
            <StructuredRow
              key={i}
              index={i}
              data={row}
              onChange={updateRow}
              onRemove={removeRow}
            />
          ))}
          {rows.length < 20 ? (
            <button
              onClick={addRow}
              className="text-xs text-[#c9a96e]/60 hover:text-[#c9a96e] transition pt-1"
            >
              + Add another cocktail ({rows.length}/20)
            </button>
          ) : (
            <p className="text-xs text-[#6b705c] pt-1">Maximum 20 cocktails reached.</p>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="rounded-xl bg-[#c9a96e] px-8 py-3 text-sm font-bold text-[#0d0c09] transition hover:bg-[#dfc497] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Run Audit
      </button>
    </div>
  )
}
