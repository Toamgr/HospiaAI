import React from 'react'

const ACTION_ICONS = {
  event_created: '✦',
  status_changed: '→',
  guest_added: '＋',
  guest_checked_in: '✓',
  task_completed: '☑',
  message_sent: '✉',
  seating_assigned: '⊞',
  default: '·'
}

function formatDateTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    })
  } catch { return iso }
}

export default function EventTimeline({ timeline }) {
  if (!timeline.length) {
    return (
      <div className="text-center py-12 text-zinc-500 text-sm">
        No timeline events yet. Activity will appear here as the event progresses.
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {[...timeline].reverse().map((entry, i) => {
        const icon = ACTION_ICONS[entry.action_type] || ACTION_ICONS.default
        return (
          <div key={entry.id || i} className="flex items-start gap-3 px-1 py-2">
            <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-400 shrink-0 mt-0.5">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-300">{entry.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {entry.actor && <span className="text-xs text-zinc-600">{entry.actor}</span>}
                <span className="text-xs text-zinc-700">{formatDateTime(entry.created_at)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
