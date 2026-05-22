// Lightweight localStorage-backed queue for failed daily-loop backend writes.
// Uses deterministic payload IDs so retries never create duplicates.

const QUEUE_KEY = 'hestia.pendingSync'

export function loadPendingQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') } catch { return [] }
}

function saveQueue(queue) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(0, 50))) } catch {}
}

// Add item to queue. Skips if an item with the same type + payload.id already exists.
export function enqueue(type, payload) {
  const queue = loadPendingQueue()
  if (payload?.id && queue.some(i => i.type === type && i.payload?.id === payload.id)) return
  saveQueue([...queue, { type, payload, queued_at: new Date().toISOString() }])
}

// Remove a successfully synced item from the queue.
export function dequeue(type, payloadId) {
  saveQueue(loadPendingQueue().filter(i => !(i.type === type && i.payload?.id === payloadId)))
}

export function pendingCount() {
  return loadPendingQueue().length
}
