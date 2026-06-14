import { useState, useRef, useEffect, useCallback } from 'react'

const QUICK_ACTIONS = [
  {
    label: '🕯️ Optimize a cocktail',
    message: "Look at the cocktails in the loaded menu. Which one has the weakest structure or worst execution? Give me the 🕯️ HESTIA Best Version for it now."
  },
  {
    label: 'Audit my menu',
    message: "I need a full professional audit of the cocktail menu you already have loaded. You have all the cocktails — go ahead and audit them now. Be direct and brutal."
  },
  {
    label: 'Financial analysis',
    message: "I want to run the financials on my cocktail program. Can you walk me through pour cost, GP, and where the biggest margin opportunities are?"
  },
  {
    label: 'Trend briefing',
    message: "Give me a trend briefing relevant to the Israeli bar market — what's gaining traction, what's fading, and what I should be testing right now."
  }
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 text-xs text-[#c9a96e]">
        ◈
      </div>
      <div className="rounded-2xl rounded-bl-sm border border-[#6b705c]/20 bg-[#1a1a1a] px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 text-xs text-[#c9a96e]">
          ◈
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'rounded-br-sm bg-[#c9a96e] text-[#0d0c09] font-medium'
            : 'rounded-bl-sm border border-[#6b705c]/20 bg-[#1a1a1a] text-[#e8dcc0]'
        }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

export function BeverageDirector({ dna, onSendMessage, ciMenus, onLoadMenu }) {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: `Good. I'm your HESTIA Beverage Director.\n\nI know your venue${dna?.bar_name || dna?.venue_name ? ` — ${dna.bar_name || dna.venue_name}` : ''}. I know the Israeli market. I'll be direct with you.\n\nWhat do you want to work on?`
    }
  ])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [apiHistory, setApiHistory]     = useState([])
  const [venueContextActive, setVenueContextActive] = useState(false)

  // Menu context state
  const [selectedMenu, setSelectedMenu]     = useState(null)
  const [menuCocktails, setMenuCocktails]   = useState([])
  const [menuLoading, setMenuLoading]       = useState(false)
  const [menuPickerOpen, setMenuPickerOpen] = useState(false)

  // Ref so send() always sees the latest menuCocktails without dep-array churn
  const menuCocktailsRef = useRef([])

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSelectMenu = useCallback(async (menu) => {
    setMenuLoading(true)
    setMenuPickerOpen(false)
    try {
      const data = await onLoadMenu(menu.id)
      const cocktails = data?.cocktails || []
      setSelectedMenu({ ...menu, cocktail_count: cocktails.length })
      setMenuCocktails(cocktails)
      menuCocktailsRef.current = cocktails
    } catch {
      // silently fall back — menu context just won't be injected
    } finally {
      setMenuLoading(false)
    }
  }, [onLoadMenu])

  function handleClearMenu() {
    setSelectedMenu(null)
    setMenuCocktails([])
    menuCocktailsRef.current = []
    setMenuPickerOpen(false)
  }

  const send = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg = { role: 'user', content: trimmed }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const res = await onSendMessage(trimmed, apiHistory, menuCocktailsRef.current)
      // Back-compatible: onSendMessage may return a string or { reply, venueContextActive }
      const reply = typeof res === 'string' ? res : (res?.reply || '')
      if (res && typeof res === 'object' && res.venueContextActive) setVenueContextActive(true)
      setMessages(prev => [...prev, { role: 'model', content: reply }])
      setApiHistory(prev => [...prev, { role: 'user', content: trimmed }, { role: 'model', content: reply }])
    } catch {
      setError('Something went wrong. Try again.')
      setMessages(prev => prev.slice(0, -1))
      setInput(trimmed)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [loading, onSendMessage, apiHistory])

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const hasMenus = Array.isArray(ciMenus) && ciMenus.length > 0

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px]">

      {/* DNA context strip */}
      {dna && (
        <div className="mb-2 flex flex-wrap items-center gap-3 rounded-xl border border-[#6b705c]/15 bg-[#0d0c09]/80 px-4 py-2.5 text-[11px] text-[#6b705c]">
          <span className="font-bold text-[#c9a96e]/70">CONTEXT</span>
          {(dna.bar_name || dna.venue_name) && <span>{dna.bar_name || dna.venue_name}</span>}
          {dna.venue_type && <span>· {dna.venue_type}</span>}
          {dna.signature_style && <span>· {dna.signature_style}</span>}
          {dna.price_tier && (
            <span className="rounded-full border border-[#6b705c]/20 px-2 py-0.5">{dna.price_tier}</span>
          )}
          {dna.is_kosher && dna.is_kosher !== 'no' && (
            <span className="rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-amber-400">
              Kosher-aware
            </span>
          )}
          {venueContextActive && (
            <span className="ml-auto rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/5 px-2 py-0.5 text-[10px] text-[#c9a96e]/80">
              Personalized by Venue DNA
            </span>
          )}
        </div>
      )}

      {/* Menu context strip — confirmation or picker trigger */}
      <div className="mb-3">
        {selectedMenu ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-emerald-950/20 px-4 py-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-[11px] text-emerald-300 font-medium flex-1 min-w-0 truncate">
              {selectedMenu.name}
              {selectedMenu.occasion ? ` · ${selectedMenu.occasion}` : ''}
              {' · '}
              <span className="font-bold">{selectedMenu.cocktail_count} cocktail{selectedMenu.cocktail_count !== 1 ? 's' : ''} loaded</span>
            </span>
            <button
              onClick={() => setMenuPickerOpen(v => !v)}
              className="shrink-0 text-[10px] text-emerald-400/60 hover:text-emerald-300 transition-colors"
            >
              Change
            </button>
            <button
              onClick={handleClearMenu}
              className="shrink-0 text-[10px] text-[#6b705c]/50 hover:text-[#6b705c] transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => hasMenus && setMenuPickerOpen(v => !v)}
              disabled={!hasMenus || menuLoading}
              className="flex items-center gap-2 rounded-xl border border-[#6b705c]/20 bg-[#0d0c09]/60 px-4 py-2 text-[11px] text-[#6b705c]/70 transition hover:border-[#6b705c]/40 hover:text-[#6b705c] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="h-1.5 w-1.5 rounded-full border border-[#6b705c]/40" />
              {menuLoading ? 'Loading…' : hasMenus ? 'Load a menu for context →' : 'No saved menus yet'}
            </button>
          </div>
        )}

        {/* Menu picker dropdown */}
        {menuPickerOpen && hasMenus && (
          <div className="mt-2 rounded-xl border border-[#6b705c]/20 bg-[#111] overflow-hidden">
            <div className="px-3 py-2 border-b border-[#6b705c]/10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6b705c]">Select a menu</span>
              <button
                onClick={() => setMenuPickerOpen(false)}
                className="text-[10px] text-[#6b705c]/50 hover:text-[#6b705c]"
              >
                ✕
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {ciMenus.map(menu => (
                <button
                  key={menu.id}
                  onClick={() => handleSelectMenu(menu)}
                  className="w-full text-left px-4 py-3 border-b border-[#6b705c]/10 last:border-0 transition hover:bg-[#1a1a1a] group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-[#f5f5f0] group-hover:text-[#e8dcc0] truncate">
                      {menu.name}
                    </span>
                    <span className="shrink-0 text-[10px] text-[#6b705c]">
                      {menu.cocktail_count} cocktail{menu.cocktail_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {menu.occasion && (
                    <span className="text-[10px] text-[#6b705c]/60 capitalize">{menu.occasion}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.label}
            onClick={() => send(action.message)}
            disabled={loading}
            className="rounded-full border border-[#6b705c]/25 bg-[#1a1a1a]/60 px-3 py-1.5 text-[11px] text-[#e8dcc0]/60 transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Message thread */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-[#6b705c]/15 bg-[#0d0c09]/40 p-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-950/20 px-4 py-2.5 text-xs text-red-400">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={loading}
          rows={2}
          placeholder="Ask anything about your cocktail program…"
          className="flex-1 resize-none rounded-xl border border-[#6b705c]/25 bg-[#1a1a1a] px-4 py-3 text-sm text-[#f5f5f0] placeholder-[#6b705c]/50 outline-none transition focus:border-[#c9a96e]/50 disabled:opacity-50"
        />
        <button
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
          className="self-end rounded-xl border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-5 py-3 text-sm font-bold text-[#c9a96e] transition hover:bg-[#c9a96e]/20 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? '…' : 'Send'}
        </button>
      </div>
      <p className="mt-2 text-center text-[10px] text-[#6b705c]/40">
        Shift+Enter for new line · Enter to send
      </p>
    </div>
  )
}
