import { useState, useRef, useEffect, useCallback } from 'react'
import {
  SIGNAL_GROUPS, CONFIDENCE_DIMENSIONS, STAGES, hasAnySignal
} from './venueDnaModel'

// Story-layer openers — invitations, not a form. Shown only on an empty session.
const OPENING_PROMPTS = [
  'Tell me about the place — what made you open it?',
  'What are you most proud of here?',
  'What kind of hospitality do you want people to feel when they walk in?',
  "What's the part of the business that still gives you energy?"
]

function StageIndicator({ stage }) {
  const activeIndex = Math.max(0, STAGES.findIndex(s => s.key === stage))
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {STAGES.map((s, i) => {
        const active = i === activeIndex
        const passed = i < activeIndex
        return (
          <div
            key={s.key}
            className={[
              'flex items-center gap-2 rounded-full border px-3 py-1 transition-colors',
              active
                ? 'border-[#c9a96e]/40 bg-[#c9a96e]/10 text-[#c9a96e]'
                : passed
                  ? 'border-[#6b705c]/25 text-[#e8dcc0]/55'
                  : 'border-[#6b705c]/15 text-[#6b705c]/55'
            ].join(' ')}
          >
            <span className="h-1.5 w-1.5 rounded-full"
              style={{ background: active ? '#c9a96e' : passed ? '#6b705c' : 'transparent', border: passed || active ? 'none' : '1px solid #6b705c66' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.14em]">{s.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function ConfidenceDots({ value }) {
  const filled = Math.round(Math.max(0, Math.min(100, value || 0)) / 20) // 0..5
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3, 4].map(i => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: i < filled ? '#c9a96e' : 'transparent', border: i < filled ? 'none' : '1px solid #6b705c55' }}
        />
      ))}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <Sigil />
      <div className="rounded-2xl rounded-bl-sm border border-[#6b705c]/20 bg-[#1a1a1a] px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 150, 300].map(d => (
            <span key={d} className="h-1.5 w-1.5 rounded-full bg-[#c9a96e]/60 animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Sigil() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 text-xs text-[#c9a96e]">
      ◈
    </div>
  )
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && <Sigil />}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
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

// The editorial empty state — a considered invitation, not "No messages".
function EmptyState({ onPick, disabled }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <Sigil />
      <h3 className="mt-5 font-serif text-2xl font-black leading-tight text-[#f5f5f0]">
        Let's start with the place itself.
      </h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[#e8dcc0]/65">
        I'm HESTIA. Over time, these conversations teach me your venue — its character, its pressures,
        and where intelligence would actually help. No forms. Just tell me about it, the way you'd tell a colleague.
      </p>
      <div className="mt-6 flex max-w-lg flex-wrap justify-center gap-2">
        {OPENING_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => onPick(p)}
            disabled={disabled}
            className="rounded-full border border-[#6b705c]/25 bg-[#1a1a1a]/60 px-3.5 py-1.5 text-[11px] text-[#e8dcc0]/70 transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e] disabled:opacity-40"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}

function SignalSection({ label, items }) {
  if (!items?.length) return null
  return (
    <div>
      <div className="mb-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#6b705c]">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span key={i} className="rounded-full border border-[#6b705c]/20 bg-[#0d0c09]/60 px-2.5 py-1 text-[11px] text-[#e8dcc0]/80">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

// The Venue Understanding panel — "What HESTIA is learning".
function UnderstandingPanel({ venueDNA, stage, objective, focusSuggestions, onPickFocus, disabled }) {
  const populated = hasAnySignal(venueDNA)
  const stageMeta = STAGES.find(s => s.key === stage) || STAGES[0]

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto rounded-2xl border border-[#6b705c]/15 bg-[#0d0c09]/40 p-5">
      <div>
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c9a96e]/70">What HESTIA is learning</div>
        <div className="mt-1 text-[11px] text-[#6b705c]">Venue understanding · updates as we talk</div>
      </div>

      {/* Current focus */}
      <div className="rounded-xl border border-[#6b705c]/15 bg-[#1a1a1a]/50 p-3.5">
        <div className="text-[9px] font-black uppercase tracking-[0.16em] text-[#6b705c]">Current focus</div>
        <div className="mt-1.5 text-sm leading-snug text-[#f5f5f0]">
          {objective || `${stageMeta.label} — ${stageMeta.blurb}`}
        </div>
      </div>

      {!populated ? (
        <div className="rounded-xl border border-dashed border-[#6b705c]/20 p-4 text-[12px] leading-relaxed text-[#6b705c]">
          Nothing detected yet. As you talk about the venue, the signals HESTIA picks up — style, pressures,
          priorities — will appear here.
        </div>
      ) : (
        <>
          {/* Summary */}
          {venueDNA.summary && (
            <div>
              <div className="mb-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#6b705c]">Working understanding</div>
              <p className="text-[12.5px] leading-relaxed text-[#e8dcc0]/85">{venueDNA.summary}</p>
            </div>
          )}

          {/* Confidence */}
          <div>
            <div className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#6b705c]">Understanding depth</div>
            <div className="space-y-1.5">
              {CONFIDENCE_DIMENSIONS.map(dim => (
                <div key={dim.key} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#e8dcc0]/70">{dim.label}</span>
                  <ConfidenceDots value={venueDNA.confidence?.[dim.key]} />
                </div>
              ))}
            </div>
          </div>

          {/* Detected signals */}
          <div className="space-y-3">
            <p className="rounded-lg border border-[#6b705c]/10 bg-[#101010]/35 px-3 py-2 text-[11px] leading-relaxed text-[#e8dcc0]/55">
              Signals are candidates until confirmed or supported by evidence.
            </p>
            {SIGNAL_GROUPS.map(g => (
              <SignalSection key={g.key} label={g.label} items={venueDNA[g.key]} />
            ))}
          </div>

          {/* Open questions */}
          {venueDNA.openQuestions?.length > 0 && (
            <div>
              <div className="mb-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[#6b705c]">Open questions</div>
              <ul className="space-y-1.5">
                {venueDNA.openQuestions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-[12px] leading-relaxed text-[#e8dcc0]/70">
                    <span className="text-[#c9a96e]/60">—</span><span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Possible focus areas — gentle directional choices */}
      {focusSuggestions?.length > 0 && (
        <div className="mt-auto border-t border-[#6b705c]/15 pt-4">
          <div className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#6b705c]">Where to take this next</div>
          <div className="flex flex-col gap-1.5">
            {focusSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onPickFocus(s)}
                disabled={disabled}
                className="rounded-xl border border-[#6b705c]/20 bg-[#1a1a1a]/40 px-3 py-2 text-left text-[12px] text-[#e8dcc0]/75 transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e] disabled:opacity-40"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function VenueIntelligence({ venueIntelligence }) {
  const {
    canAccess, messages, venueDNA, stage, objective, focusSuggestions,
    loading, sending, loadError, sendError, sendMessage, resetSession
  } = venueIntelligence || {}

  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleSend = useCallback((text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || sending) return
    sendMessage(trimmed)
    setInput('')
    inputRef.current?.focus()
  }, [input, sending, sendMessage])

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Role guard — defensive; routing already gates this page to owner/admin.
  if (canAccess === false) {
    return (
      <div className="rounded-2xl border border-[#6b705c]/15 bg-[#0d0c09]/40 p-10 text-center">
        <h2 className="font-serif text-xl font-black text-[#f5f5f0]">Venue Intelligence is owner-led</h2>
        <p className="mt-2 text-sm text-[#e8dcc0]/60">This strategic session is available to owners and administrators.</p>
      </div>
    )
  }

  const isEmpty = !messages || messages.length === 0

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.26em] text-[#c9a96e]/70">Venue Intelligence</div>
          <h1 className="mt-2 font-serif text-3xl font-black leading-tight text-[#f5f5f0]">The Venue Learning Session</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#e8dcc0]/60">
            A working conversation that teaches HESTIA your venue — its character, its pressures, and where
            intelligence will earn its place. Together, it can create Venue DNA candidates, open questions, and memory signals.
          </p>
        </div>
        {!isEmpty && (
          <button
            onClick={resetSession}
            disabled={sending}
            className="shrink-0 rounded-full border border-[#6b705c]/25 px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#e8dcc0]/55 transition hover:border-[#c9a96e]/40 hover:text-[#c9a96e] disabled:opacity-40"
          >
            Start fresh
          </button>
        )}
      </div>

      {/* Stage indicator */}
      <div className="mb-5">
        <StageIndicator stage={stage} />
      </div>

      {loadError && (
        <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-950/15 px-4 py-3 text-xs text-amber-300/90">
          {loadError} The session will still work — your first message starts a new conversation.
        </div>
      )}

      {/* Working session: chat + understanding panel */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Chat column */}
        <div className="flex h-[calc(100vh-300px)] min-h-[520px] flex-col">
          <div className="flex-1 overflow-y-auto rounded-2xl border border-[#6b705c]/15 bg-[#0d0c09]/40 p-4">
            {loading ? (
              <div className="space-y-3 p-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-[#1a1a1a]/60" style={{ width: `${70 - i * 10}%` }} />
                ))}
              </div>
            ) : isEmpty ? (
              <EmptyState onPick={handleSend} disabled={sending} />
            ) : (
              <>
                {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
                {sending && <TypingIndicator />}
              </>
            )}
            {sendError && (
              <div className="mb-2 rounded-xl border border-red-500/25 bg-red-950/20 px-4 py-2.5 text-xs text-red-300/90">
                {sendError}
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
              disabled={sending || loading}
              rows={2}
              placeholder="Tell HESTIA about your venue…"
              className="flex-1 resize-none rounded-xl border border-[#6b705c]/25 bg-[#1a1a1a] px-4 py-3 text-sm text-[#f5f5f0] placeholder-[#6b705c]/50 outline-none transition focus:border-[#c9a96e]/50 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={sending || loading || !input.trim()}
              className="self-end rounded-xl border border-[#c9a96e]/30 bg-[#c9a96e]/10 px-5 py-3 text-sm font-bold text-[#c9a96e] transition hover:bg-[#c9a96e]/20 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? '…' : 'Send'}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-[#6b705c]/40">
            Shift+Enter for a new line · Enter to send
          </p>
        </div>

        {/* Understanding panel */}
        <div className="h-[calc(100vh-300px)] min-h-[520px]">
          <UnderstandingPanel
            venueDNA={venueDNA}
            stage={stage}
            objective={objective}
            focusSuggestions={focusSuggestions}
            onPickFocus={handleSend}
            disabled={sending}
          />
        </div>
      </div>
    </div>
  )
}
