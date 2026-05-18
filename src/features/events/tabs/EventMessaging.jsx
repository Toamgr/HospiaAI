import React, { useState } from 'react'

const MESSAGE_TEMPLATES = [
  { label: 'RSVP reminder', body: 'Hi {{name}}, this is a reminder to confirm your attendance at {{event_name}} on {{date}}. Please reply YES or NO.' },
  { label: 'Event confirmation', body: 'Hi {{name}}, your attendance at {{event_name}} on {{date}} is confirmed! We look forward to seeing you.' },
  { label: 'Day-of reminder', body: 'Hi {{name}}, just a reminder that {{event_name}} is today! Doors open at {{start_time}}. See you soon.' },
  { label: 'Thank you', body: 'Hi {{name}}, thank you for joining us at {{event_name}}. It was a pleasure having you.' }
]

function fillTemplate(template, event) {
  return template
    .replace(/\{\{name\}\}/g, 'Guest')
    .replace(/\{\{event_name\}\}/g, event.name || '')
    .replace(/\{\{date\}\}/g, event.event_date || '')
    .replace(/\{\{start_time\}\}/g, event.start_time || '')
}

function MessageBubble({ message }) {
  function formatTime(iso) {
    if (!iso) return ''
    try { return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
    catch { return '' }
  }

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-zinc-800 last:border-0">
      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs text-zinc-400 shrink-0">W</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-zinc-400">{message.sent_to || 'All guests'}</span>
          <span className={`text-xs px-1.5 rounded ${message.status === 'sent' ? 'text-emerald-400 bg-emerald-950/40' : 'text-zinc-500'}`}>
            {message.status || 'pending'}
          </span>
          <span className="text-xs text-zinc-700">{formatTime(message.sent_at || message.created_at)}</span>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">{message.body}</p>
        {message.sent_by && <p className="text-xs text-zinc-600 mt-1">Sent by {message.sent_by}</p>}
      </div>
    </div>
  )
}

export default function EventMessaging({ event, messages, guests, onSendMessage, currentUser }) {
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [showTemplates, setShowTemplates] = useState(false)

  async function handleSend() {
    if (!body.trim()) return
    setSending(true)
    setError(null)
    try {
      await onSendMessage(event.id, {
        body,
        channel: 'whatsapp',
        sent_by: currentUser?.full_name || currentUser?.username || 'Manager'
      })
      setBody('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const confirmedWithPhone = guests.filter(g => g.rsvp_status === 'confirmed' && g.phone).length
  const totalWithPhone = guests.filter(g => g.phone).length

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div><span className="text-lg font-light text-white">{messages.length}</span><span className="text-xs text-zinc-500 ml-1">sent</span></div>
        <div><span className="text-lg font-light text-amber-400">{totalWithPhone}</span><span className="text-xs text-zinc-500 ml-1">guests with phone</span></div>
      </div>

      {/* Compose */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Send WhatsApp message</p>
          <button
            type="button"
            onClick={() => setShowTemplates(v => !v)}
            className="text-xs text-amber-500 hover:text-amber-400"
          >
            Templates
          </button>
        </div>

        {showTemplates && (
          <div className="grid grid-cols-2 gap-2">
            {MESSAGE_TEMPLATES.map(t => (
              <button
                key={t.label}
                type="button"
                onClick={() => { setBody(fillTemplate(t.body, event)); setShowTemplates(false) }}
                className="text-left px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:border-amber-500 transition-colors"
              >
                <p className="text-xs font-medium text-zinc-300">{t.label}</p>
              </button>
            ))}
          </div>
        )}

        <textarea
          rows={3}
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Type your message to guests…"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 resize-none"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-600">
            Will send to {totalWithPhone} guest{totalWithPhone !== 1 ? 's' : ''} with phone numbers
          </p>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !body.trim()}
            className="px-4 py-1.5 rounded-lg bg-green-700 hover:bg-green-600 disabled:bg-zinc-700 text-white text-xs font-medium transition-colors"
          >
            {sending ? 'Sending…' : 'Send via WhatsApp'}
          </button>
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <p className="text-xs text-zinc-700">WhatsApp integration is in simulation mode. Messages are logged but not delivered to real phones.</p>
      </div>

      {/* Message history */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm">No messages sent yet.</div>
        ) : (
          [...messages].reverse().map((m, i) => <MessageBubble key={m.id || i} message={m} />)
        )}
      </div>
    </div>
  )
}
