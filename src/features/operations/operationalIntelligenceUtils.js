// ─── Operational Intelligence Utilities ──────────────────────────────────────
//
// Shared source of truth for all operational memory features:
//   - Manager Action Center
//   - Pre-Shift Briefing (carry-forward section)
//   - End-of-Shift Review
//   - Owner/Admin Operational Pulse
//
// All functions are pure (no React). Components handle state and side effects.
//
// localStorage key naming:
//   hospia.*  — legacy keys, preserved to avoid data loss
//   hestia.*  — new keys introduced in Phase 7B-7D

// ─── Storage keys ────────────────────────────────────────────────────────────
export const STATUS_KEY     = 'hospia.managerActionStatuses'
export const CARRY_KEY      = 'hospia.managerActionCarryForward'
export const EOD_REVIEW_KEY = 'hestia.endOfShiftReviews'

// ─── Generic localStorage helpers ────────────────────────────────────────────
export function loadMap(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}
export function saveMap(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}
export function loadList(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
}
export function saveList(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) } catch {}
}

// ─── Named helpers ────────────────────────────────────────────────────────────
export const loadManagerActionStatuses    = () => loadMap(STATUS_KEY)
export const saveManagerActionStatuses    = s  => saveMap(STATUS_KEY, s)
export const loadManagerActionCarryForward = () => loadMap(CARRY_KEY)
export const saveManagerActionCarryForward = cf => saveMap(CARRY_KEY, cf)
export const loadEndOfShiftReviews        = () => loadList(EOD_REVIEW_KEY)
export function saveEndOfShiftReview(review) {
  const existing = loadEndOfShiftReviews()
  saveList(EOD_REVIEW_KEY, [review, ...existing].slice(0, 20))
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function daysSince(dateStr) {
  if (!dateStr) return 0
  const ts = new Date(dateStr).getTime()
  if (isNaN(ts)) return 0
  return Math.max(0, Math.floor((Date.now() - ts) / 86400000))
}

// ─── Priority classification — rule-based, transparent ───────────────────────
//
// urgent:    high/critical severity incidents · urgent action board items
//            · EOD urgent_items · sop-deviation notes
// important: any unresolved incident · follow-up/pinned notes
//            · EOD complaints · action board items open 3+ days (stale bump)
// normal:    general open actions

function incidentPriority(incident) {
  return (incident.severity === 'high' || incident.severity === 'critical') ? 'urgent' : 'important'
}
function notePriority(note) {
  if (note.tag === 'sop-deviation') return 'urgent'
  if (note.tag === 'follow-up' || note.pinned) return 'important'
  return 'normal'
}
function actionItemPriority(item, daysOpen) {
  const base = (item.priority === 'urgent' || item.priority === 'Critical') ? 'urgent'
    : (item.priority === 'high') ? 'important'
    : 'normal'
  if (base === 'normal' && daysOpen >= 3) return 'important'
  return base
}

// ─── Carry-forward default detection ─────────────────────────────────────────
// Conservative keyword list — only flags when text clearly signals continuation
const CARRY_KEYWORDS = ['next shift', 'handover', 'tomorrow', 'follow up', 'follow-up', 'carry forward', 'still open', 'unresolved']
function hasCarryKeyword(text) {
  const lower = (text || '').toLowerCase()
  return CARRY_KEYWORDS.some(kw => lower.includes(kw))
}

// ─── Core derivation ─────────────────────────────────────────────────────────
//
// Returns a flat list of derived operational actions from four real data sources.
// No fake data is introduced. If sources are empty, the list is empty.
// Each action carries the minimum fields needed to display and enrich.

export function deriveOperationalActions(
  actionItems   = [],
  serviceIncidents = [],
  shiftNotes    = [],
  reportArchive = []
) {
  const actions = []

  // Source 1: open action board items
  actionItems.filter(a => !a.done && a.status !== 'Completed').forEach(a => {
    const daysOpen = daysSince(a.created_at)
    actions.push({
      id:               `ab-${a.id}`,
      sourceId:         a.id,
      source:           'action_board',
      suggested:        false,
      title:            a.title,
      detail:           a.signal || '',
      priority:         actionItemPriority(a, daysOpen),
      owner:            a.owner || 'Manager',
      due:              a.due || null,
      daysOpen,
      created_at:       a.created_at || null,
      defaultCarryForward: hasCarryKeyword(a.title) || hasCarryKeyword(a.signal),
    })
  })

  // Source 2: unresolved service incidents
  serviceIncidents.filter(i => !i.resolved).forEach(i => {
    const daysOpen = daysSince(i.created_at)
    const priority = incidentPriority(i)
    actions.push({
      id:               `inc-${i.id}`,
      sourceId:         i.id,
      source:           'incident',
      suggested:        false,
      title:            [i.issueType, i.guestTable ? `— ${i.guestTable}` : ''].filter(Boolean).join(' ') || 'Service incident',
      detail:           [i.employeeName, i.description].filter(Boolean).join(': '),
      priority,
      owner:            'Manager',
      due:              'ASAP',
      daysOpen,
      created_at:       i.created_at || null,
      defaultCarryForward: priority === 'urgent' || daysOpen >= 1,
    })
  })

  // Source 3: shift notes tagged follow-up, sop-deviation, or pinned (suggested)
  shiftNotes
    .filter(n => !n.archived && (n.tag === 'follow-up' || n.tag === 'sop-deviation' || n.pinned))
    .forEach(n => {
      const daysOpen = daysSince(n.created_at)
      actions.push({
        id:               `note-${n.id}`,
        sourceId:         n.id,
        source:           'shift_note',
        suggested:        true,
        title:            n.content.length > 100 ? n.content.slice(0, 100) + '…' : n.content,
        detail:           `Tag: ${n.tag} · ${n.created_by || 'Manager'} · ${n.created_at?.slice(0, 10) || ''}`,
        priority:         notePriority(n),
        owner:            n.created_by || 'Manager',
        due:              null,
        daysOpen,
        created_at:       n.created_at || null,
        defaultCarryForward: Boolean(n.pinned) || hasCarryKeyword(n.content),
      })
    })

  // Source 4: EOD report urgent_items and complaints (suggested)
  reportArchive.slice(0, 5).forEach(r => {
    const daysOpen = daysSince(r.submitted_at || r.shift_date)
    if (r.urgent_items?.trim()) {
      actions.push({
        id:               `rpt-urg-${r.id}`,
        sourceId:         r.id,
        source:           'report',
        suggested:        true,
        title:            r.urgent_items.trim().slice(0, 120),
        detail:           `EOD report · ${r.shift_date || ''} · ${r.manager_name || 'Manager'}`,
        priority:         'urgent',
        owner:            r.manager_name || 'Manager',
        due:              'Next shift',
        daysOpen,
        created_at:       r.submitted_at || r.shift_date || null,
        defaultCarryForward: true,
      })
    }
    if (r.complaints?.trim()) {
      actions.push({
        id:               `rpt-cmp-${r.id}`,
        sourceId:         r.id,
        source:           'report',
        suggested:        true,
        title:            `Guest complaint follow-up: ${r.complaints.trim().slice(0, 80)}`,
        detail:           `EOD report · ${r.shift_date || ''} · ${r.manager_name || 'Manager'}`,
        priority:         'important',
        owner:            r.manager_name || 'Manager',
        due:              'Next shift',
        daysOpen,
        created_at:       r.submitted_at || r.shift_date || null,
        defaultCarryForward: false,
      })
    }
  })

  // Deduplicate by id
  const seen = new Set()
  return actions.filter(a => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })
}

// ─── Status and carry-forward enrichment ─────────────────────────────────────
//
// Merges persisted status overrides and carry-forward flags onto derived actions.
// Source-of-truth resolved state is reflected automatically (incident.resolved,
// actionItem.done), so this stays in sync even if statuses map is stale.

export function enrichActions(
  derivedActions   = [],
  statuses         = {},
  carryForwards    = {},
  serviceIncidents = [],
  actionItems      = []
) {
  return derivedActions.map(a => {
    let status = statuses[a.id]
    if (!status) {
      if (a.source === 'incident') {
        const inc = serviceIncidents.find(i => i.id === a.sourceId)
        if (inc?.resolved) status = 'resolved'
      }
      if (a.source === 'action_board') {
        const item = actionItems.find(i => i.id === a.sourceId)
        if (item?.done) status = 'resolved'
      }
    }
    const carryForward = a.id in carryForwards
      ? Boolean(carryForwards[a.id])
      : Boolean(a.defaultCarryForward)
    return { ...a, status: status || 'open', carryForward }
  })
}

// ─── Derived queries ──────────────────────────────────────────────────────────
export const PRIORITY_ORDER = { urgent: 0, important: 1, normal: 2 }

export const sortByPriorityThenAge = (a, b) => {
  const ra = a.status === 'resolved' ? 1 : 0
  const rb = b.status === 'resolved' ? 1 : 0
  if (ra !== rb) return ra - rb
  const pa = PRIORITY_ORDER[a.priority] ?? 2
  const pb = PRIORITY_ORDER[b.priority] ?? 2
  if (pa !== pb) return pa - pb
  return (b.daysOpen || 0) - (a.daysOpen || 0)
}

export const getOpenActions           = enriched => enriched.filter(a => a.status !== 'resolved')
export const getUrgentActions         = enriched => enriched.filter(a => a.priority === 'urgent' && a.status !== 'resolved')
export const getCarryForwardActions   = enriched => enriched.filter(a => a.carryForward && a.status !== 'resolved')
export const getStaleActions          = (enriched, minDays = 3) => enriched.filter(a => a.daysOpen >= minDays && a.status !== 'resolved')
export const getIncidentActions       = enriched => enriched.filter(a => a.source === 'incident' && a.status !== 'resolved')

// ─── Operational Pulse summary ────────────────────────────────────────────────
//
// Returns counts and conservative theme groupings based only on real text.
// No fake values, no fabricated scores, no invented metrics.

const THEME_KEYWORDS = {
  'Guest Recovery':      ['guest', 'complaint', 'recovery', 'dissatisfied', 'unhappy', 'comp', 'refund'],
  'Staffing':            ['staff', 'roster', 'cover', 'absence', 'absent', 'manning'],
  'Stock / Inventory':   ['stock', 'inventory', 'supply', 'shortage', 'out of', 'reorder', 'ice', 'lime', 'garnish'],
  'Equipment':           ['equipment', 'machine', 'broken', 'repair', 'maintenance', 'pos', 'printer'],
  'Service Standards':   ['service standard', 'sop', 'protocol', 'procedure', 'deviation'],
  'Training':            ['training', 'coaching', 'knowledge', 'academy', 'skill'],
  'Supplier':            ['supplier', 'vendor', 'delivery', 'invoice', 'distributor'],
  'Safety / Security':   ['safety', 'security', 'emergency', 'injury', 'hazard', 'harassment'],
}

export function getOperationalPulseSummary(enriched = [], reviews = []) {
  const open        = getOpenActions(enriched)
  const urgent      = getUrgentActions(enriched)
  const carryFwd    = getCarryForwardActions(enriched)
  const stale       = getStaleActions(enriched, 3)
  const incidents   = getIncidentActions(enriched)
  const flaggedRevs = reviews.filter(r => r.flaggedForOwner)

  // Only derive themes when real text exists in open actions
  const themes = []
  Object.entries(THEME_KEYWORDS).forEach(([theme, keywords]) => {
    const count = open.filter(a => {
      const text = `${a.title} ${a.detail}`.toLowerCase()
      return keywords.some(kw => text.includes(kw))
    }).length
    if (count > 0) themes.push({ theme, count })
  })
  themes.sort((a, b) => b.count - a.count)

  return {
    openCount:           open.length,
    urgentCount:         urgent.length,
    carryForwardCount:   carryFwd.length,
    staleCount:          stale.length,
    incidentCount:       incidents.length,
    flaggedForOwnerCount: flaggedRevs.length,
    recentReviews:       reviews.slice(0, 5),
    flaggedReviews:      flaggedRevs,
    carryForwardItems:   carryFwd.slice(0, 8),
    urgentItems:         urgent.slice(0, 5),
    themes:              themes.slice(0, 4),
    hasData:             enriched.length > 0 || reviews.length > 0,
  }
}

// ─── Display constants ────────────────────────────────────────────────────────
export const PRIORITY_STYLE = {
  urgent:    'border-red-800/50 bg-red-950/20 text-red-300',
  important: 'border-amber-800/40 bg-amber-950/15 text-amber-300',
  normal:    'border-[#6b705c]/30 text-[#e8dcc0]/60',
}
export const PRIORITY_LABEL = { urgent: 'Urgent', important: 'Important', normal: 'Normal' }

export const SOURCE_STYLE = {
  incident:     'border-red-900/40 text-red-400/80',
  shift_note:   'border-blue-900/35 text-blue-400/75',
  report:       'border-purple-900/35 text-purple-400/75',
  action_board: 'border-[#c9a96e]/25 text-[#c9a96e]/75',
}
export const SOURCE_LABEL = {
  incident:     'Incident',
  shift_note:   'Shift Note',
  report:       'EOD Report',
  action_board: 'Action Board',
}

export const STATUS_STYLE = {
  open:        'border-[#6b705c]/30 text-[#e8dcc0]/55',
  in_progress: 'border-amber-800/40 text-amber-300',
  resolved:    'border-emerald-800/40 text-emerald-300',
}
export const STATUS_LABEL = { open: 'Open', in_progress: 'In Progress', resolved: 'Resolved' }
