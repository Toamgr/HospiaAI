// F&B Director Brief Service — Phase 8G (read-only, deterministic composition).
//
// Composes EXISTING safe, read-only intelligence sources into one compact
// operational brief for an F&B / Beverage Director:
//   - F&B Menu Intelligence Snapshot   (current menu portfolio view)
//   - F&B Decision Ledger              (generated / selected / rejected decisions)
//   - Venue Intelligence Candidates    (reviewable learning signals)
//
// Doctrine: docs/architecture/FNB_DIRECTOR_BRIEF_FOUNDATION.md,
//           docs/architecture/FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md,
//           docs/architecture/DECISION_LEDGER_DOCTRINE.md,
//           docs/architecture/SPECIALIST_INTELLIGENCE_PATTERN.md
//
// HARD RULES (enforced by design + verified by scripts/test-fnb-director-brief.js):
//   - Pure read + deterministic compose. NEVER writes to any table.
//   - Dependency-injected db: every function receives `db` explicitly. This module
//     never imports the live database.
//   - No AI. No prompts. No network. No model calls. No generation.
//   - No Venue DNA mutation: no DNA writer import, no writes to venue_intelligence /
//     venue_briefs / venue_dna_enrichment / venue_intelligence_candidates / fb_decisions.
//   - No promotion path: a candidate is a reviewable signal only — never confirmed
//     venue identity, never escalated.
//   - No Cocktail Lab / Event Builder / prompt imports.
//   - Honest about uncertainty: absent data is reported as missing, never fabricated.
//     No POS/sales, guest, inventory, verified-margin, or Venue DNA inference.
//   - Degrades gracefully: a single failing source becomes a warning + an empty
//     contribution and lowers confidence; only a fully unusable db throws.
//   - Every read is venue-scoped (db + venueId threaded through each source).
//
// Imports ONLY the read/list functions of the existing services (never their
// write/mutation entry points).

import { buildMenuIntelligenceSnapshot } from './menuIntelligenceService.js'
import { listFbDecisionsForVenue } from './decisionLedgerService.js'
import { listVenueIntelligenceCandidatesForVenue } from './fnbVenueFeedbackService.js'

// ── tuning constants (deterministic) ────────────────────────────────────────────

// How many recent decisions/candidates to fetch for counting + pattern detection.
// The underlying services clamp to 200; we count over this window honestly.
const COUNT_WINDOW = 200
// Default number of items surfaced in recent_decisions / notable_signals.
const DEFAULT_DISPLAY_LIMIT = 10
const MAX_DISPLAY_LIMIT = 50
// A rejection reason must recur at least this many times to be called a "pattern".
const PATTERN_MIN_COUNT = 2
// A decision sample smaller than this is treated as too small for confidence.
const MIN_DECISION_SAMPLE = 3
// The full decision sample required (with strong sub-signals) to ever reach 'high'.
const HIGH_DECISION_SAMPLE = 10

const CANDIDATE_REVIEW_STATUSES = Object.freeze(['unreviewed', 'reviewed', 'accepted', 'rejected', 'needs_changes'])

// Data classes HESTIA does NOT have here — always reported, never inferred.
const FORBIDDEN_INFERENCES = Object.freeze([
  'no POS/sales inference',
  'no guest preference inference',
  'no inventory inference',
  'no verified margin inference',
  'no Venue DNA conclusion',
])

// ── pure helpers ────────────────────────────────────────────────────────────────

function isNonEmptyString(v) { return typeof v === 'string' && v.trim().length > 0 }

function clampDisplayLimit(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return DEFAULT_DISPLAY_LIMIT
  return Math.max(1, Math.min(MAX_DISPLAY_LIMIT, Math.floor(n)))
}

// Extract explicit, lowercased rejection reasons from one decision row.
// Only an explicit decision_payload.reasons array yields reasons — never inferred.
function rejectionReasonsOf(decision) {
  const reasons = decision && decision.decision_payload && decision.decision_payload.reasons
  if (!Array.isArray(reasons)) return []
  return reasons.map(r => String(r || '').trim().toLowerCase()).filter(Boolean)
}

// ── decision activity ────────────────────────────────────────────────────────────

/**
 * Summarize the decision ledger window into deterministic counts, a compact recent
 * list, and rejection PATTERNS. A rejection reason is only a pattern when it recurs
 * (>= PATTERN_MIN_COUNT); a single rejection is anecdotal, never a pattern. Pure.
 */
export function summarizeDecisionActivity(decisions, displayLimit, windowMeta) {
  const list = Array.isArray(decisions) ? decisions : []
  let generated_count = 0, selected_count = 0, rejected_count = 0
  const reasonTally = {}

  for (const d of list) {
    if (d.decision_type === 'cocktail_menu_generated') generated_count++
    else if (d.decision_type === 'cocktail_selected') selected_count++
    else if (d.decision_type === 'cocktail_rejected') {
      rejected_count++
      for (const reason of rejectionReasonsOf(d)) reasonTally[reason] = (reasonTally[reason] || 0) + 1
    }
  }

  // Patterns: reasons recurring across >= PATTERN_MIN_COUNT rejected decisions.
  const rejection_patterns = Object.entries(reasonTally)
    .filter(([, count]) => count >= PATTERN_MIN_COUNT)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({
      reason,
      count,
      evidence: `Reason "${reason}" recorded on ${count} rejected decisions in the window.`,
    }))

  // Anecdotal (single-instance) rejection reasons — reported honestly, NOT as patterns.
  const anecdotal_rejection_reasons = Object.entries(reasonTally)
    .filter(([, count]) => count < PATTERN_MIN_COUNT)
    .map(([reason]) => reason)
    .sort()

  const recent_decisions = list.slice(0, displayLimit).map(d => ({
    id: d.id,
    decision_type: d.decision_type,
    decision_title: d.decision_title || null,
    human_review_status: d.human_review_status || null,
    created_at: d.created_at || null,
  }))

  return {
    window: {
      since: (windowMeta && windowMeta.since) || null,
      limit_applied: (windowMeta && windowMeta.limit_applied) || null,
      counted: list.length,
    },
    generated_count,
    selected_count,
    rejected_count,
    recent_decisions,
    rejection_patterns,
    anecdotal_rejection_reasons,
  }
}

// ── candidate signals ──────────────────────────────────────────────────────────

/**
 * Group candidate learning signals by human review status and surface a compact
 * notable list. A candidate (including an accepted one) is a REVIEWABLE SIGNAL only,
 * never confirmed venue identity. Pure.
 */
export function groupCandidateSignals(candidates, displayLimit) {
  const list = Array.isArray(candidates) ? candidates : []
  const counts_by_review_status = { unreviewed: 0, reviewed: 0, accepted: 0, rejected: 0, needs_changes: 0 }
  for (const c of list) {
    const s = c && c.human_review_status
    if (CANDIDATE_REVIEW_STATUSES.includes(s)) counts_by_review_status[s]++
  }

  const notable_signals = list.slice(0, displayLimit).map(c => ({
    id: c.id,
    candidate_type: c.candidate_type || null,
    candidate_summary: c.candidate_summary || null,
    human_review_status: c.human_review_status || null,
    confidence_level: (c.confidence && c.confidence.level) || null,
  }))

  return {
    counts_by_review_status,
    notable_signals,
    review_backlog: counts_by_review_status.unreviewed,
    total: list.length,
    // Honesty label: accepted signals are reviewed-as-useful, NOT confirmed identity.
    note: 'Candidate signals are reviewable learning signals only — accepted means reviewed-as-useful, never confirmed venue identity.',
  }
}

// ── confidence ─────────────────────────────────────────────────────────────────

/**
 * Deterministic overall confidence. Forced LOW when: a source failed, there is no
 * active menu, the decision sample is tiny, or there are no candidate signals.
 * 'high' is rare (rich menu + healthy decision sample). Pure.
 */
export function buildBriefConfidence(ctx) {
  const { anySourceFailed, menuItems, decisionSample, candidateTotal, menuSnapshotConfidence, missing_data } = ctx

  if (anySourceFailed) {
    return { overall: 'low', reason: 'One or more intelligence sources failed to load; treat this brief as partial.', missing_data }
  }
  if (menuItems <= 0) {
    return { overall: 'low', reason: 'No active menu for this venue — there is no beverage portfolio to reason about yet.', missing_data }
  }
  if (decisionSample < MIN_DECISION_SAMPLE) {
    return { overall: 'low', reason: `Decision sample is tiny (${decisionSample}); patterns cannot be trusted yet.`, missing_data }
  }
  if (candidateTotal <= 0) {
    return { overall: 'low', reason: 'No candidate learning signals recorded yet; feedback evidence is thin.', missing_data }
  }
  if (menuSnapshotConfidence === 'high' && decisionSample >= HIGH_DECISION_SAMPLE) {
    return { overall: 'high', reason: 'Structured menu data plus a healthy decision history and recorded signals support strong reasoning.', missing_data }
  }
  return { overall: 'medium', reason: 'Menu, decision history, and candidate signals are present but partial.', missing_data }
}

// ── recommendations (deterministic, gap-driven) ──────────────────────────────────

// Next tests are derived ONLY from real recorded gaps + evidence. They never invent
// guest behavior, sales outcomes, or commercial KPIs.
function buildRecommendedNextTests(snapshot, decisionActivity) {
  const tests = []
  const missing = (snapshot && snapshot._missing_fields) || []
  const has = (needle) => missing.some(m => typeof m === 'string' && m.toLowerCase().includes(needle))

  if (has('taste_profile')) tests.push('Capture per-cocktail taste profiles, then re-check menu balance against the venue target range.')
  if (has('base_spirit')) tests.push('Record a base spirit for items missing one to validate spirit-coverage balance.')
  if (has('suggested_price_ils') || has('estimated_cost_ils') || has('estimated_gp_percent')) {
    tests.push('Enter cost/price estimates so margin orientation can be reviewed (verified POS truth still required for decisions).')
  }
  if (snapshot && snapshot.coverage && snapshot.coverage.zero_proof && snapshot.coverage.zero_proof.count === 0) {
    tests.push('Confirm whether a zero-proof / mocktail option should be present and explicitly marked.')
  }
  for (const p of (decisionActivity.rejection_patterns || [])) {
    tests.push(`Re-test the "${p.reason}" direction on the next generation — it was rejected on ${p.count} occasions.`)
  }
  return tests
}

// not_enough_data: an honest aggregate of what is unavailable. The four commercial
// data classes are always listed unless explicit data exists (it does not here).
function buildNotEnoughData(snapshot, decisionActivity, candidateSignals) {
  const out = [
    'POS / sales data is not available — no popularity, sell-through, or revenue inference is made.',
    'Guest preference data is not available — no guest-taste inference is made.',
    'Inventory / bottle availability is not available — no stock inference is made.',
    'Verified margins are not available — any pricing on menu items is a stored estimate, not verified truth.',
  ]
  if (snapshot && Array.isArray(snapshot._missing_fields)) {
    for (const f of snapshot._missing_fields) out.push(`Menu data gap: ${f}.`)
  }
  if (decisionActivity.window.counted === 0) out.push('No F&B decisions have been recorded yet.')
  if (candidateSignals.total === 0) out.push('No candidate learning signals have been recorded yet.')
  return out
}

// ── main entry ─────────────────────────────────────────────────────────────────

/**
 * Build the read-only F&B Director Brief for one venue. Deterministic. Reads only;
 * writes nothing. Composes the menu snapshot, decision ledger, and candidate signals.
 *
 * @param {object} db        node:sqlite-like handle (prepare().all()/get()).
 * @param {string} venueId   venue scope (required).
 * @param {object} [options] { now?:ISO, limit?:number (display), since?:ISO }
 */
export function buildFnbDirectorBrief(db, venueId, options = {}) {
  const generated_at = isNonEmptyString(options.now) ? options.now : new Date().toISOString()
  const displayLimit = clampDisplayLimit(options.limit)
  const since = isNonEmptyString(options.since) ? options.since : null
  const warnings = []
  const sources_used = []

  const source = {
    type: 'fnb_director_brief',
    ai_used: false,
    writes_performed: false,
    sources_used,
  }

  if (!isNonEmptyString(venueId)) {
    return emptyBrief(null, generated_at, source, ['No venue id supplied — cannot scope an F&B Director Brief.'])
  }

  // ── source 1: menu intelligence snapshot ──────────────────────────────────────
  let snapshot = null
  let menuFailed = false
  try {
    snapshot = buildMenuIntelligenceSnapshot(db, venueId, { now: generated_at })
    sources_used.push('menu_intelligence_snapshot')
  } catch (err) {
    menuFailed = true
    warnings.push(`menu_intelligence_snapshot failed: ${err && err.message ? err.message : String(err)}`)
  }

  // ── source 2: decision ledger ─────────────────────────────────────────────────
  let decisions = []
  let decisionsFailed = false
  try {
    decisions = listFbDecisionsForVenue(db, venueId, { limit: COUNT_WINDOW, since }) || []
    sources_used.push('fb_decisions')
  } catch (err) {
    decisionsFailed = true
    warnings.push(`fb_decisions failed: ${err && err.message ? err.message : String(err)}`)
  }

  // ── source 3: venue intelligence candidates ──────────────────────────────────
  let candidates = []
  let candidatesFailed = false
  try {
    candidates = listVenueIntelligenceCandidatesForVenue(db, venueId, { limit: COUNT_WINDOW }) || []
    sources_used.push('venue_intelligence_candidates')
  } catch (err) {
    candidatesFailed = true
    warnings.push(`venue_intelligence_candidates failed: ${err && err.message ? err.message : String(err)}`)
  }

  const anySourceFailed = menuFailed || decisionsFailed || candidatesFailed

  // ── compose ───────────────────────────────────────────────────────────────────
  const decision_activity = summarizeDecisionActivity(decisions, displayLimit, {
    since,
    limit_applied: COUNT_WINDOW,
  })
  const candidate_signals = groupCandidateSignals(candidates, displayLimit)

  const menuItems = snapshot && snapshot.menu ? snapshot.menu.total_items : 0
  const decisionSample = decision_activity.window.counted
  const candidateTotal = candidate_signals.total
  const menuSnapshotConfidence = snapshot && snapshot.confidence ? snapshot.confidence.overall : 'low'

  // missing_data aggregate for the confidence block
  const missing_data = []
  if (menuFailed) missing_data.push('menu_intelligence_snapshot')
  if (decisionsFailed) missing_data.push('fb_decisions')
  if (candidatesFailed) missing_data.push('venue_intelligence_candidates')
  if (snapshot && snapshot.confidence && Array.isArray(snapshot.confidence.missing_data)) {
    for (const m of snapshot.confidence.missing_data) if (!missing_data.includes(m)) missing_data.push(m)
  }
  if (decisionSample === 0) missing_data.push('fb_decision_history')
  if (candidateTotal === 0) missing_data.push('candidate_signals')

  const confidence = buildBriefConfidence({
    anySourceFailed, menuItems, decisionSample, candidateTotal, menuSnapshotConfidence, missing_data,
  })

  // menu snapshot summary (compact projection of the snapshot)
  const menu_snapshot_summary = snapshot ? {
    total_items: menuItems,
    confidence: menuSnapshotConfidence,
    key_risks: (snapshot.risks || []).slice(0, 5).map(r => ({ type: r.type, severity: r.severity, evidence: r.evidence })),
    coverage_notes: buildCoverageNotes(snapshot),
    missing_data: Array.isArray(snapshot._missing_fields) ? snapshot._missing_fields.slice(0, 10) : [],
  } : {
    total_items: 0,
    confidence: 'low',
    key_risks: [],
    coverage_notes: [],
    missing_data: ['menu_intelligence_snapshot_unavailable'],
  }

  // operational warnings: evidence-bearing risks from the snapshot, compacted
  const operational_warnings = snapshot
    ? (snapshot.risks || []).map(r => ({ type: r.type, severity: r.severity, evidence: r.evidence, confidence: r.confidence }))
    : []

  // recommended human review: merge snapshot review items + candidate backlog/needs_changes
  const recommended_human_review = []
  if (snapshot && Array.isArray(snapshot.recommended_human_review)) {
    for (const r of snapshot.recommended_human_review) recommended_human_review.push(r)
  }
  if (candidate_signals.review_backlog > 0) {
    recommended_human_review.push(`Review ${candidate_signals.review_backlog} unreviewed candidate learning signal(s).`)
  }
  if (candidate_signals.counts_by_review_status.needs_changes > 0) {
    recommended_human_review.push(`Revisit ${candidate_signals.counts_by_review_status.needs_changes} candidate signal(s) marked needs_changes.`)
  }

  const recommended_next_tests = buildRecommendedNextTests(snapshot || {}, decision_activity)
  const not_enough_data = buildNotEnoughData(snapshot || {}, decision_activity, candidate_signals)

  const executive_summary = buildExecutiveSummary({
    confidence, menuItems, decision_activity, candidate_signals, operational_warnings, anySourceFailed,
  })

  return {
    venue_id: venueId,
    generated_at,
    source,
    confidence,
    executive_summary,
    menu_snapshot_summary,
    decision_activity,
    candidate_signals,
    operational_warnings,
    recommended_human_review,
    recommended_next_tests,
    not_enough_data,
    forbidden_inferences_avoided: [...FORBIDDEN_INFERENCES],
    warnings,
  }
}

// Compact, factual coverage notes from the snapshot (no inference).
function buildCoverageNotes(snapshot) {
  const notes = []
  const cov = snapshot && snapshot.coverage
  if (!cov) return notes
  if (cov.base_spirits && cov.base_spirits.overrepresented) {
    const o = cov.base_spirits.overrepresented
    notes.push(`Base spirit "${o.spirit}" dominates (${o.count}/${o.known_total}).`)
  }
  if (cov.classics_vs_signatures && cov.classics_vs_signatures.available) {
    const c = cov.classics_vs_signatures
    notes.push(`Classics ${c.classics} vs signatures ${c.signatures}.`)
  }
  if (cov.zero_proof && cov.zero_proof.count === 0) {
    notes.push('No explicit zero-proof / mocktail marker present.')
  }
  return notes
}

// Executive summary built ONLY from real counts/risks — no narrative invention.
function buildExecutiveSummary({ confidence, menuItems, decision_activity, candidate_signals, operational_warnings, anySourceFailed }) {
  const key_points = []

  if (menuItems > 0) key_points.push(`Active menu has ${menuItems} item(s).`)
  else key_points.push('No active menu is configured for this venue.')

  const da = decision_activity
  if (da.window.counted > 0) {
    key_points.push(`Recorded F&B decisions in window: ${da.generated_count} generated, ${da.selected_count} selected, ${da.rejected_count} rejected.`)
  } else {
    key_points.push('No F&B decisions recorded yet.')
  }

  if (da.rejection_patterns.length > 0) {
    key_points.push(`Emerging rejection pattern(s): ${da.rejection_patterns.map(p => `${p.reason} (${p.count})`).join(', ')}.`)
  }

  if (candidate_signals.total > 0) {
    key_points.push(`${candidate_signals.total} candidate signal(s); ${candidate_signals.review_backlog} awaiting review.`)
  }

  const highRisks = operational_warnings.filter(w => w.severity === 'high').length
  if (highRisks > 0) key_points.push(`${highRisks} high-severity operational risk(s) flagged.`)

  let status
  if (anySourceFailed) status = 'Partial brief — one or more sources failed to load.'
  else if (menuItems === 0) status = 'No active beverage program to brief on yet.'
  else if (confidence.overall === 'high') status = 'Beverage program has structured data and an active decision history.'
  else if (confidence.overall === 'medium') status = 'Beverage program is taking shape; data is partial.'
  else status = 'Early-stage beverage program; evidence is thin.'

  return { status, key_points }
}

// Safe empty brief — used when no venue id is supplied. Never an error.
function emptyBrief(venueId, generated_at, source, notEnough) {
  return {
    venue_id: venueId,
    generated_at,
    source,
    confidence: { overall: 'low', reason: 'No venue scope supplied — nothing to brief on.', missing_data: ['venue_id'] },
    executive_summary: { status: 'No venue scope supplied.', key_points: [] },
    menu_snapshot_summary: { total_items: 0, confidence: 'low', key_risks: [], coverage_notes: [], missing_data: [] },
    decision_activity: {
      window: { since: null, limit_applied: null, counted: 0 },
      generated_count: 0, selected_count: 0, rejected_count: 0,
      recent_decisions: [], rejection_patterns: [], anecdotal_rejection_reasons: [],
    },
    candidate_signals: {
      counts_by_review_status: { unreviewed: 0, reviewed: 0, accepted: 0, rejected: 0, needs_changes: 0 },
      notable_signals: [], review_backlog: 0, total: 0,
      note: 'Candidate signals are reviewable learning signals only — accepted means reviewed-as-useful, never confirmed venue identity.',
    },
    operational_warnings: [],
    recommended_human_review: [],
    recommended_next_tests: [],
    not_enough_data: notEnough || [],
    forbidden_inferences_avoided: [...FORBIDDEN_INFERENCES],
    warnings: [],
  }
}
