// Owner AI Home — Phase 9E-1B: chat-first Venue Intelligence surface (chat ACTIVE).
//
// The owner talks to HESTIA. Conversation is powered by the EXISTING sanctioned
// engine via the useVenueIntelligenceState hook (passed in as `venueIntelligence`),
// which posts to the production POST /api/venue-intelligence/message route:
// owner-gated, venue-scoped, real AI, real persistence — the same engine that
// drives the Venue Learning page. This component never calls /message, /reset,
// mergeVenueDna, or any AI directly; it only reads GET /api/venue-intelligence/
// completeness for the collapsed Backstage section and delegates sending to the hook.
//
// CRITICAL PRODUCT TRUTH — the UI states it plainly:
//   • Conversation builds WORKING Venue DNA signals — not confirmed Venue DNA.
//   • Owner confirmation will be required before identity-level claims are confirmed.
//   • Full Intelligence Mode remains locked. No fake KPIs, no fake progress, and no
//     fabricated assistant replies (assistant turns come only from the backend).
//
// If the real hook is unavailable, the input stays inert rather than faking chat.

import { useEffect, useRef, useState, useCallback } from 'react'
import { apiGet } from '../../services/api/client'

// ── Palette B — Editorial Light tokens (from skills/user/hestia-ui-design) ──────
const C = {
  ground:    '#F7F3EC', // warm ivory page ground — never pure white
  card:      '#FFFFFF',
  inset:     '#F0EBE0',
  borderSub: '#E0D8CC',
  borderEmp: '#C8BFB0',
  burgundy:  '#6B2737',
  amber:     '#B8860B',
  text:      '#1A1612',
  text2:     '#5A524A',
  text3:     '#9A9088',
}

// HESTIA's opening invitation + an honest one-line state ribbon, both shaped by the
// deterministic completeness state. The opening is shown only on an empty thread; it
// is NOT a persisted/fabricated conversation turn, and never a score or percentage.
const STATE_COPY = {
  not_started: {
    ribbon: 'HESTIA is ready to learn this venue.',
    opening:
      "Before I can advise, I need to understand the venue. Tell me what this place is, who it’s for, and what kind of hospitality you want people to feel here.",
  },
  early_learning: {
    ribbon: 'This venue already has early Venue DNA signals — nothing is confirmed yet.',
    opening:
      "I have early signals about this venue. I can keep learning, but nothing here is confirmed Venue DNA until you confirm it. Tell me more about the place.",
  },
  building: {
    ribbon: 'HESTIA is building the venue foundation — these signals are not confirmed Venue DNA.',
    opening:
      "I have early signals about this venue. I can keep learning, but nothing here is confirmed Venue DNA until you confirm it. Tell me more about the place.",
  },
  needs_owner_confirmation: {
    ribbon: 'Owner confirmation is needed before this becomes Venue DNA.',
    opening:
      "I have enough signals to form an early picture, but I need your confirmation before treating any of it as Venue DNA. Let’s keep going.",
  },
  foundation_ready: {
    ribbon: 'The foundation is in place. Full Intelligence Mode stays locked until activation is built.',
    opening:
      "I understand the foundation of this venue. When activation is ready, ask me anything about it — and tell me the moment something changes.",
  },
}

// Owner-voiced prompts. Clicking one populates the input (the owner still presses
// Send) — never an auto-sent or fabricated turn.
const SUGGESTED_PROMPTS = [
  'What kind of guests are we built for?',
  'What should this venue never become?',
  'What feeling should guests leave with?',
  'What makes our hospitality different?',
]

const STATUS_LABEL = {
  not_started: 'Not started',
  early_learning: 'Early learning',
  building: 'Building',
  needs_owner_confirmation: 'Needs owner confirmation',
  foundation_ready: 'Foundation ready',
}

// Ceremonial intelligence presence — an engraved double-ring sigil on ivory.
function Orb({ size = 'h-24 w-24', mark = 'text-3xl' }) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`relative flex ${size} items-center justify-center rounded-full`}
        style={{
          background: 'radial-gradient(circle at 50% 36%, rgba(107,39,55,0.10), rgba(184,134,11,0.05) 68%, transparent)',
          border: `1px solid ${C.borderEmp}`,
          boxShadow: '0 6px 22px rgba(26,22,18,0.10), inset 0 1px 0 rgba(255,255,255,0.65)',
        }}
      >
        <div className="absolute inset-[5px] rounded-full" style={{ border: `1px solid ${C.amber}`, opacity: 0.32 }} aria-hidden="true" />
        <div className="absolute inset-[11px] rounded-full" style={{ border: `1px solid ${C.borderEmp}` }} aria-hidden="true" />
        <span className={`font-serif ${mark}`} style={{ color: C.burgundy }}>◈</span>
      </div>
    </div>
  )
}

function EngravedRule() {
  return (
    <div className="mx-auto mt-6 flex max-w-[18rem] items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${C.borderEmp})` }} />
      <span className="text-[10px]" style={{ color: C.amber }}>✦</span>
      <span className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${C.borderEmp})` }} />
    </div>
  )
}

function Sigil() {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
      style={{ border: `1px solid ${C.borderEmp}`, background: C.inset, color: C.burgundy }}>
      <span className="font-serif text-[13px]">◈</span>
    </div>
  )
}

function MessageBubble({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && <Sigil />}
      <div
        className="max-w-[78%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed"
        style={isUser
          ? { background: C.burgundy, color: '#F7F3EC', borderBottomRightRadius: 6 }
          : { background: C.card, color: C.text, border: `1px solid ${C.borderSub}`, borderBottomLeftRadius: 6 }}
      >
        {content}
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <Sigil />
      <div className="rounded-2xl px-4 py-3" style={{ background: C.card, border: `1px solid ${C.borderSub}`, borderBottomLeftRadius: 6 }}>
        <div className="flex h-4 items-center gap-1">
          {[0, 150, 300].map(d => (
            <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ background: C.amber, animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Eyebrow({ children }) {
  return (
    <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.amber }}>
      {children}
    </div>
  )
}

export default function OwnerAIHome({ currentUser, venueIntelligence } = {}) {
  // Real conversation state comes from the sanctioned Venue Intelligence hook.
  const vi = venueIntelligence || {}
  const messages = Array.isArray(vi.messages) ? vi.messages : []
  const sending = Boolean(vi.sending)
  const sendError = vi.sendError || null
  const convoLoading = Boolean(vi.loading)
  const sendMessage = vi.sendMessage
  const chatActive = typeof sendMessage === 'function' // wired in App.jsx via the hook

  // Completeness drives the opening message + the collapsed backstage ONLY.
  const [completeness, setCompleteness] = useState(null)
  const [cLoading, setCLoading] = useState(true)
  const [cError, setCError] = useState(null)

  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const lastCountRef = useRef(0)

  const loadCompleteness = useCallback((withSpinner) => {
    if (withSpinner) { setCLoading(true); setCError(null) }
    return apiGet('/api/venue-intelligence/completeness')
      .then(res => setCompleteness(res?.completeness || null))
      .catch(err => {
        if (import.meta?.env?.DEV) console.error('[OwnerAIHome] GET /api/venue-intelligence/completeness failed:', err)
        if (withSpinner) setCError('HESTIA could not read the Venue DNA foundation right now. Nothing was changed.')
      })
      .finally(() => { if (withSpinner) setCLoading(false) })
  }, [])

  // Initial backstage read.
  useEffect(() => {
    let cancelled = false
    setCLoading(true)
    setCError(null)
    apiGet('/api/venue-intelligence/completeness')
      .then(res => { if (!cancelled) setCompleteness(res?.completeness || null) })
      .catch(err => {
        if (import.meta?.env?.DEV) console.error('[OwnerAIHome] GET /api/venue-intelligence/completeness failed:', err)
        if (!cancelled) setCError('HESTIA could not read the Venue DNA foundation right now. Nothing was changed.')
      })
      .finally(() => { if (!cancelled) setCLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Keep the thread scrolled to the latest turn.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, sending])

  // After an assistant reply lands (message count grew while not sending), refresh
  // the backstage completeness so it reflects the newly captured working signals.
  useEffect(() => {
    if (convoLoading) { lastCountRef.current = messages.length; return }
    if (!sending && messages.length > lastCountRef.current && lastCountRef.current > 0) {
      loadCompleteness(false)
    }
    lastCountRef.current = messages.length
  }, [messages.length, sending, convoLoading, loadCompleteness])

  const status = completeness?.foundation_status || 'not_started'
  const copy = STATE_COPY[status] || STATE_COPY.not_started
  const nextQuestion = completeness?.recommended_next_question
  const score = completeness?.foundation_score
  const missingRequired = Array.isArray(completeness?.missing_required_dimensions)
    ? completeness.missing_required_dimensions
    : []
  const isEmpty = messages.length === 0

  const handleSend = useCallback((text) => {
    const trimmed = (text ?? input).trim()
    if (!trimmed || sending || !chatActive) return
    sendMessage(trimmed)
    setInput('')
    inputRef.current?.focus()
  }, [input, sending, chatActive, sendMessage])

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="min-h-[calc(100vh-9rem)] -m-5 rounded-3xl px-5 py-10 sm:-m-7 sm:px-8 lg:-m-10 lg:px-12 xl:-m-14 2xl:-m-20"
      style={{ background: C.ground, color: C.text }}
    >
      <div className="mx-auto max-w-2xl">

        {/* Minimal top area */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <Eyebrow>HESTIA · Venue Intelligence</Eyebrow>
          <div className="flex items-center gap-3">
            {currentUser?.full_name && (
              <span className="text-[11px]" style={{ color: C.text3 }}>{currentUser.full_name}</span>
            )}
            <span className="rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ border: `1px solid ${C.burgundy}`, color: C.burgundy, background: 'rgba(107,39,55,0.05)' }}>
              Build Mode
            </span>
          </div>
        </div>

        {isEmpty ? (
          /* ── Conversational home (empty thread) — ceremonial, centered ── */
          <div className="text-center">
            <Orb />
            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight sm:text-5xl" style={{ color: C.text }}>
              Talk to HESTIA about your venue
            </h1>
            {!cLoading && !cError && (
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed" style={{ color: C.text2 }}>
                {copy.ribbon}
              </p>
            )}
            <EngravedRule />

            {/* HESTIA's opening invitation (not a persisted turn) */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="flex items-start gap-2.5 text-left">
                <Sigil />
                <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{ background: C.card, color: C.text, border: `1px solid ${C.borderSub}`, borderTopLeftRadius: 6 }}>
                  {cLoading ? 'Reading Venue DNA foundation…' : copy.opening}
                  {!cLoading && nextQuestion && (
                    <span className="mt-2 block font-serif text-[13px] italic" style={{ color: C.text2 }}>
                      To begin: “{nextQuestion}”
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Active conversation thread (real backend turns only) ── */
          <div className="space-y-4">
            <div className="mb-2 flex items-center gap-2">
              <Orb size="h-10 w-10" mark="text-base" />
              <div>
                <div className="font-serif text-lg font-bold leading-tight" style={{ color: C.text }}>HESTIA</div>
                <div className="text-[11px]" style={{ color: C.text3 }}>
                  Learning your venue · this conversation builds working Venue DNA signals
                </div>
              </div>
            </div>
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role === 'user' ? 'user' : 'model'} content={m.content} />
            ))}
            {sending && <TypingBubble />}
          </div>
        )}

        {sendError && (
          <div className="mt-4 rounded-xl px-4 py-2.5 text-[12px]"
            style={{ border: `1px solid ${C.borderEmp}`, background: C.inset, color: C.burgundy }}>
            {sendError}
          </div>
        )}
        <div ref={bottomRef} />

        {/* ── Primary input ── */}
        <div className="mt-7">
          <div className="flex items-end gap-2 rounded-2xl p-2"
            style={{ background: C.card, border: `1px solid ${C.borderSub}`, boxShadow: '0 2px 10px rgba(26,22,18,0.07)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={!chatActive || sending || convoLoading}
              rows={2}
              placeholder={chatActive
                ? 'Describe the place, the guests, the service, or what must never change…'
                : 'Venue DNA Build Mode is not available right now. This input is intentionally inactive.'}
              className="flex-1 resize-none rounded-xl bg-transparent px-3 py-2 text-sm outline-none disabled:opacity-60"
              style={{ color: C.text }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!chatActive || sending || convoLoading || !input.trim()}
              className="self-end rounded-xl px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
              style={{ border: `1px solid ${C.burgundy}`, color: C.burgundy, background: 'rgba(107,39,55,0.06)' }}
            >
              {sending ? '…' : 'Send'}
            </button>
          </div>

          {/* Suggested owner prompts — populate the input; the owner still sends. */}
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {SUGGESTED_PROMPTS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => { setInput(p); inputRef.current?.focus() }}
                disabled={!chatActive || sending || convoLoading}
                className="rounded-full px-3 py-1.5 text-[11px] transition hover:border-current disabled:opacity-40"
                style={{ border: `1px solid ${C.borderSub}`, background: C.inset, color: C.text2 }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Guardrail note — the product truth, stated plainly. */}
          <p className="mt-3 text-center text-[11px] leading-relaxed" style={{ color: C.text3 }}>
            Conversation builds working Venue DNA signals. Signals are not confirmed Venue DNA — owner
            confirmation will be required before identity-level claims become confirmed. Full Intelligence
            Mode remains locked. Shift+Enter for a new line · Enter to send.
          </p>
        </div>

        {/* ── Backstage intelligence — collapsed by default, never the product ── */}
        <details className="mt-10">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2"
            style={{ border: `1px solid ${C.borderSub}`, background: C.card }}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: C.text3 }}>
              Backstage intelligence
            </span>
            <span className="text-[11px]" style={{ color: C.text3 }}>Venue foundation details</span>
          </summary>

          <div className="mt-3 rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.borderSub}` }}>
            <p className="mb-4 text-[11px] leading-relaxed" style={{ color: C.text3 }}>
              Used internally to guide the conversation. Signals are not confirmed Venue DNA.
            </p>
            {cLoading ? (
              <p className="text-[12px]" style={{ color: C.text3 }}>Reading Venue DNA foundation…</p>
            ) : cError ? (
              <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>{cError}</p>
            ) : !completeness ? (
              <p className="text-[12px] leading-relaxed" style={{ color: C.text2 }}>
                HESTIA has not built enough Venue DNA yet. The conversation above is how it begins.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: C.text3 }}>Foundation status</span>
                  <span className="text-[12px] font-semibold" style={{ color: C.text }}>{STATUS_LABEL[status] || status}</span>
                </div>

                {Number.isFinite(Number(score)) && (
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px]" style={{ color: C.text3 }}>Foundation coverage from existing Venue DNA signals</span>
                      <span className="text-[12px] font-semibold" style={{ color: C.text2 }}>{Math.max(0, Math.min(100, Number(score)))}%</span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed" style={{ color: C.text3 }}>
                      Deterministic Venue DNA completeness — not performance, not AI confidence. A new venue starts at 0.
                    </p>
                  </div>
                )}

                {nextQuestion && (
                  <div>
                    <div className="text-[11px]" style={{ color: C.text3 }}>HESTIA’s next question</div>
                    <p className="mt-1 font-serif text-[13px] italic" style={{ color: C.text }}>“{nextQuestion}”</p>
                  </div>
                )}

                {missingRequired.length > 0 && (
                  <div>
                    <div className="text-[11px]" style={{ color: C.text3 }}>Still to understand</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {missingRequired.map(k => (
                        <span key={k} className="rounded-full px-2.5 py-1 text-[11px]"
                          style={{ border: `1px dashed ${C.borderEmp}`, color: C.text3 }}>
                          {k.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="border-t pt-3 text-[11px] leading-relaxed" style={{ borderColor: C.borderSub, color: C.text3 }}>
                  Full Intelligence Mode remains locked until HESTIA understands and the owner confirms the venue foundation.
                </p>
              </div>
            )}
          </div>
        </details>

        {/* Footer guardrail */}
        <p className="mt-8 text-center text-[11px]" style={{ color: C.text3 }}>
          A working conversation. Nothing is confirmed as Venue DNA without your say-so.
        </p>
      </div>
    </div>
  )
}
