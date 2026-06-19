#!/usr/bin/env node
/**
 * Deterministic tests for the read-only F&B Director Brief service
 * (Phase 8G — composes menu snapshot + decision ledger + candidate signals).
 *
 * In-memory node:sqlite DatabaseSync(':memory:') with the real DDLs for the tables
 * the composed sources read — no real DB, no server boot, no network, no AI.
 * Exits 0 on pass, 1 on failure.
 *
 * Run: node scripts/test-fnb-director-brief.js   (or: npm run test:fnb-director-brief)
 */

import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

Promise.all([
  import('../src/services/venueBridge/fnbDirectorBriefService.js'),
  import('../src/services/venueBridge/decisionLedgerService.js'),
  import('../src/services/venueBridge/fnbVenueFeedbackService.js'),
]).then(runTests).catch(err => {
  console.error('\n[FAIL] Could not import services:', err.message)
  process.exit(1)
})

// ── menu schema mirroring the live tables the snapshot reads ────────────────────
const MENU_SCHEMA = `
CREATE TABLE cocktail_menus (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  venue_id    TEXT NOT NULL,
  name        TEXT NOT NULL,
  status      TEXT DEFAULT 'active',
  created_at  TEXT DEFAULT (datetime('now'))
);
CREATE TABLE cocktails (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  name                  TEXT NOT NULL,
  category              TEXT,
  base_spirit           TEXT,
  glass_type            TEXT,
  garnish               TEXT,
  method                TEXT,
  tags_json             TEXT,
  ingredients_text_json TEXT,
  is_active             INTEGER DEFAULT 1,
  source                TEXT DEFAULT 'ci_generated',
  menu_id               INTEGER,
  estimated_cost_ils    REAL,
  suggested_price_ils   REAL,
  estimated_gp_percent  REAL,
  taste_profile_json    TEXT,
  abv                   REAL,
  prep_complexity       TEXT,
  service_speed         TEXT,
  created_at            TEXT DEFAULT (datetime('now'))
);
`

function runTests(mods) {
  const [briefSvc, ledgerSvc, feedbackSvc] = mods
  const { buildFnbDirectorBrief, summarizeDecisionActivity, groupCandidateSignals, buildBriefConfidence } = briefSvc
  const { FB_DECISIONS_DDL, createFbDecision } = ledgerSvc
  const { VENUE_INTELLIGENCE_CANDIDATES_DDL, createVenueIntelligenceCandidate } = feedbackSvc

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }

  console.log('\n\x1b[1mHESTIA F&B Director Brief — Deterministic Tests\x1b[0m\n')

  const VENUE_A = 'venue_A', VENUE_B = 'venue_B'
  const NOW = '2026-06-19T00:00:00.000Z'

  function freshDb() {
    const db = new DatabaseSync(':memory:')
    db.exec(MENU_SCHEMA)
    db.exec(FB_DECISIONS_DDL)
    db.exec(VENUE_INTELLIGENCE_CANDIDATES_DDL)
    return db
  }
  function seedMenu(db, venueId, name, status = 'active') {
    return db.prepare('INSERT INTO cocktail_menus (venue_id, name, status) VALUES (?,?,?)').run(venueId, name, status).lastInsertRowid
  }
  function seedCocktail(db, menuId, c = {}) {
    return db.prepare(`
      INSERT INTO cocktails (name, category, base_spirit, tags_json, is_active, menu_id, suggested_price_ils)
      VALUES (?,?,?,?,?,?,?)
    `).run(c.name || 'Drink', c.category ?? null, c.base_spirit ?? null,
      c.tags != null ? JSON.stringify(c.tags) : null, c.is_active != null ? c.is_active : 1,
      c.menu_id ?? menuId, c.suggested_price_ils ?? null).lastInsertRowid
  }
  function seedDecision(db, venueId, decision_type, extra = {}) {
    return createFbDecision(db, venueId, { decision_type, source_engine: 'ci_omer', ...extra }).id
  }
  function seedCandidate(db, venueId, c = {}) {
    return createVenueIntelligenceCandidate(db, venueId, {
      candidate_type: c.candidate_type || 'taste_direction_signal',
      human_review_status: c.human_review_status || 'unreviewed',
      source_decision_id: c.source_decision_id || null,
      candidate_summary: c.candidate_summary || 'signal',
      confidence: c.confidence || { level: 'low' },
      id: c.id,
    })
  }

  // ── 1. Empty state ─────────────────────────────────────────────────────────────
  section('Empty state → safe brief')
  const db0 = freshDb()
  const empty = buildFnbDirectorBrief(db0, VENUE_A, { now: NOW })
  assert('empty: venue-scoped', empty.venue_id === VENUE_A)
  assert('empty: generated_at = now', empty.generated_at === NOW)
  assert('empty: confidence low', empty.confidence.overall === 'low')
  assert('empty: no AI, no writes', empty.source.ai_used === false && empty.source.writes_performed === false)
  assert('empty: decision counts all 0', empty.decision_activity.generated_count === 0 && empty.decision_activity.selected_count === 0 && empty.decision_activity.rejected_count === 0)
  assert('empty: no recent decisions', empty.decision_activity.recent_decisions.length === 0)
  assert('empty: no candidate signals', empty.candidate_signals.total === 0)
  assert('empty: review_backlog 0', empty.candidate_signals.review_backlog === 0)
  assert('empty: not_enough_data populated', Array.isArray(empty.not_enough_data) && empty.not_enough_data.length > 0)
  assert('empty: forbidden inferences listed', empty.forbidden_inferences_avoided.length === 5)
  assert('blank venue id → safe empty brief (no throw)', buildFnbDirectorBrief(db0, '').confidence.overall === 'low')

  // ── 2 & 3. Venue scope + cross-venue isolation ───────────────────────────────
  section('Venue scope + cross-venue isolation')
  const db = freshDb()
  const menuA = seedMenu(db, VENUE_A, 'Summer')
  seedCocktail(db, menuA, { name: 'Daiquiri', base_spirit: 'rum', category: 'classic', tags: ['classic'], suggested_price_ils: 52 })
  seedCocktail(db, menuA, { name: 'Mojito', base_spirit: 'rum', category: 'classic', tags: ['classic'] })
  const dGenA = seedDecision(db, VENUE_A, 'cocktail_menu_generated', { decision_title: 'GenA' })
  const dSelA = seedDecision(db, VENUE_A, 'cocktail_selected', { decision_title: 'SelA' })
  seedCandidate(db, VENUE_A, { id: 'A-c1', source_decision_id: 'A-d1', human_review_status: 'unreviewed' })

  // Venue B data that must NOT leak into A
  const menuB = seedMenu(db, VENUE_B, 'Winter')
  seedCocktail(db, menuB, { name: 'Hot Toddy', base_spirit: 'whisky' })
  const dGenB = seedDecision(db, VENUE_B, 'cocktail_menu_generated', { decision_title: 'GenB' })
  seedCandidate(db, VENUE_B, { id: 'B-c1', source_decision_id: 'B-d1', human_review_status: 'accepted' })

  const briefA = buildFnbDirectorBrief(db, VENUE_A, { now: NOW })
  assert('A: brief venue-scoped', briefA.venue_id === VENUE_A)
  assert('A: only A decisions counted (2)', briefA.decision_activity.window.counted === 2)
  const aTitles = briefA.decision_activity.recent_decisions.map(d => d.decision_title)
  assert('A: recent decisions are A only', aTitles.includes('GenA') && aTitles.includes('SelA') && !aTitles.includes('GenB'))
  assert('A: no B decision id leaked', !briefA.decision_activity.recent_decisions.some(d => d.id === dGenB))
  assert('A: only A candidate counted', briefA.candidate_signals.total === 1)
  assert('A: no B candidate leaked', !briefA.candidate_signals.notable_signals.some(s => s.id === 'B-c1'))

  const briefB = buildFnbDirectorBrief(db, VENUE_B, { now: NOW })
  assert('B: only B decision counted (1)', briefB.decision_activity.window.counted === 1)
  assert('B: no A candidate leaked', !briefB.candidate_signals.notable_signals.some(s => s.id === 'A-c1'))

  // ── 4. Menu snapshot summary present when active menu exists ──────────────────
  section('Menu snapshot summary')
  assert('A: menu_snapshot_summary total_items = 2', briefA.menu_snapshot_summary.total_items === 2)
  assert('A: snapshot in sources_used', briefA.source.sources_used.includes('menu_intelligence_snapshot'))
  assert('A: key_risks is an array', Array.isArray(briefA.menu_snapshot_summary.key_risks))

  // ── 5 & 6. Deterministic, separate decision counts ───────────────────────────
  section('Decision counts (deterministic, separate)')
  const dbC = freshDb()
  seedMenu(dbC, VENUE_A, 'M')
  seedDecision(dbC, VENUE_A, 'cocktail_menu_generated')
  seedDecision(dbC, VENUE_A, 'cocktail_menu_generated')
  seedDecision(dbC, VENUE_A, 'cocktail_selected')
  seedDecision(dbC, VENUE_A, 'cocktail_rejected', { decision_payload: { reasons: ['too_sweet'] } })
  const briefC = buildFnbDirectorBrief(dbC, VENUE_A, { now: NOW })
  assert('generated_count = 2', briefC.decision_activity.generated_count === 2)
  assert('selected_count = 1', briefC.decision_activity.selected_count === 1)
  assert('rejected_count = 1', briefC.decision_activity.rejected_count === 1)
  assert('counted total = 4', briefC.decision_activity.window.counted === 4)
  // direct helper determinism
  const da = summarizeDecisionActivity(
    [{ decision_type: 'cocktail_rejected', decision_payload: { reasons: ['too_sour'] } },
     { decision_type: 'cocktail_selected' }], 10, { since: null, limit_applied: 200 })
  assert('summarizeDecisionActivity deterministic', da.rejected_count === 1 && da.selected_count === 1 && da.generated_count === 0)

  // ── 7 & 8. Rejection patterns require >= 2; single is anecdotal ───────────────
  section('Rejection patterns (>=2 corroborating); single = anecdotal')
  const dbR = freshDb()
  seedMenu(dbR, VENUE_A, 'M')
  seedDecision(dbR, VENUE_A, 'cocktail_rejected', { decision_payload: { reasons: ['too_sweet'] } })
  seedDecision(dbR, VENUE_A, 'cocktail_rejected', { decision_payload: { reasons: ['too_sweet'] } })
  seedDecision(dbR, VENUE_A, 'cocktail_rejected', { decision_payload: { reasons: ['too_bitter'] } })
  const briefR = buildFnbDirectorBrief(dbR, VENUE_A, { now: NOW })
  const patterns = briefR.decision_activity.rejection_patterns
  assert('too_sweet (x2) IS a pattern', patterns.some(p => p.reason === 'too_sweet' && p.count === 2))
  assert('pattern carries evidence', patterns.every(p => typeof p.evidence === 'string' && p.evidence.length > 0))
  assert('too_bitter (x1) is NOT a pattern', !patterns.some(p => p.reason === 'too_bitter'))
  assert('too_bitter (x1) is anecdotal', briefR.decision_activity.anecdotal_rejection_reasons.includes('too_bitter'))
  assert('next test references the emerging pattern', briefR.recommended_next_tests.some(t => t.includes('too_sweet')))

  // ── 9 & 10. Candidate grouping + accepted is a signal, not Venue DNA ──────────
  section('Candidate signals grouped; accepted = reviewed signal (not Venue DNA)')
  const dbK = freshDb()
  seedMenu(dbK, VENUE_A, 'M')
  seedCandidate(dbK, VENUE_A, { id: 'k1', source_decision_id: 's1', human_review_status: 'unreviewed' })
  seedCandidate(dbK, VENUE_A, { id: 'k2', source_decision_id: 's2', human_review_status: 'accepted' })
  seedCandidate(dbK, VENUE_A, { id: 'k3', source_decision_id: 's3', human_review_status: 'rejected' })
  seedCandidate(dbK, VENUE_A, { id: 'k4', source_decision_id: 's4', human_review_status: 'needs_changes' })
  seedCandidate(dbK, VENUE_A, { id: 'k5', source_decision_id: 's5', human_review_status: 'reviewed' })
  const briefK = buildFnbDirectorBrief(dbK, VENUE_A, { now: NOW })
  const cbs = briefK.candidate_signals.counts_by_review_status
  assert('grouped: unreviewed 1', cbs.unreviewed === 1)
  assert('grouped: accepted 1', cbs.accepted === 1)
  assert('grouped: rejected 1', cbs.rejected === 1)
  assert('grouped: needs_changes 1', cbs.needs_changes === 1)
  assert('grouped: reviewed 1', cbs.reviewed === 1)
  assert('review_backlog = unreviewed count', briefK.candidate_signals.review_backlog === 1)
  assert('candidate note labels signals as reviewable, never venue identity',
    /reviewable learning signals only/i.test(briefK.candidate_signals.note) && /never confirmed venue identity/i.test(briefK.candidate_signals.note))
  // accepted candidate must NOT be described as Venue DNA anywhere in the brief
  const flat = JSON.stringify(briefK).toLowerCase()
  assert('brief never claims a candidate is Venue DNA', !/confirmed venue dna|promoted to dna|is venue dna/.test(flat))
  // direct helper determinism
  const grp = groupCandidateSignals([{ human_review_status: 'accepted' }, { human_review_status: 'accepted' }], 10)
  assert('groupCandidateSignals deterministic', grp.counts_by_review_status.accepted === 2 && grp.total === 2)

  // ── 11. Missing commercial data reported honestly ────────────────────────────
  section('Missing POS/sales/guest/inventory/verified-margin honesty')
  const neJoin = briefA.not_enough_data.join(' | ').toLowerCase()
  assert('not_enough_data: POS/sales', neJoin.includes('pos') && neJoin.includes('sales'))
  assert('not_enough_data: guest', neJoin.includes('guest'))
  assert('not_enough_data: inventory', neJoin.includes('inventory'))
  assert('not_enough_data: verified margin', neJoin.includes('verified margin'))
  assert('forbidden_inferences_avoided includes Venue DNA', briefA.forbidden_inferences_avoided.some(s => /venue dna/i.test(s)))

  // ── confidence rules ─────────────────────────────────────────────────────────
  section('Confidence rules')
  assert('no candidates → low even with menu+decisions', briefA.confidence.overall === 'low')
  const lowNoMenu = buildBriefConfidence({ anySourceFailed: false, menuItems: 0, decisionSample: 50, candidateTotal: 50, menuSnapshotConfidence: 'high', missing_data: [] })
  assert('buildBriefConfidence: no menu → low', lowNoMenu.overall === 'low')
  const lowTiny = buildBriefConfidence({ anySourceFailed: false, menuItems: 5, decisionSample: 1, candidateTotal: 5, menuSnapshotConfidence: 'high', missing_data: [] })
  assert('buildBriefConfidence: tiny sample → low', lowTiny.overall === 'low')
  const lowFail = buildBriefConfidence({ anySourceFailed: true, menuItems: 5, decisionSample: 50, candidateTotal: 5, menuSnapshotConfidence: 'high', missing_data: [] })
  assert('buildBriefConfidence: source failed → low', lowFail.overall === 'low')
  const med = buildBriefConfidence({ anySourceFailed: false, menuItems: 5, decisionSample: 5, candidateTotal: 5, menuSnapshotConfidence: 'medium', missing_data: [] })
  assert('buildBriefConfidence: partial → medium', med.overall === 'medium')
  const high = buildBriefConfidence({ anySourceFailed: false, menuItems: 5, decisionSample: 10, candidateTotal: 5, menuSnapshotConfidence: 'high', missing_data: [] })
  assert('buildBriefConfidence: rich → high', high.overall === 'high')

  // ── 12. No writes during brief generation ────────────────────────────────────
  section('No writes during brief generation')
  const countRows = (d, t) => d.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c
  const beforeM = countRows(db, 'cocktails'), beforeD = countRows(db, 'fb_decisions'), beforeK = countRows(db, 'venue_intelligence_candidates')
  buildFnbDirectorBrief(db, VENUE_A, { now: NOW })
  buildFnbDirectorBrief(db, VENUE_B, { now: NOW })
  assert('cocktails row count unchanged', countRows(db, 'cocktails') === beforeM)
  assert('fb_decisions row count unchanged', countRows(db, 'fb_decisions') === beforeD)
  assert('candidates row count unchanged', countRows(db, 'venue_intelligence_candidates') === beforeK)

  // ── degrade gracefully when a source table is missing ────────────────────────
  section('Graceful degradation (missing source table)')
  const dbBare = new DatabaseSync(':memory:') // no tables at all
  let threw = false
  let bareBrief = null
  try { bareBrief = buildFnbDirectorBrief(dbBare, VENUE_A, { now: NOW }) } catch { threw = true }
  assert('missing tables → no throw', threw === false && bareBrief !== null)
  assert('missing tables → confidence low', bareBrief && bareBrief.confidence.overall === 'low')

  // ── 13–15. Static guardrails (service source) ────────────────────────────────
  section('Guardrails (static — service)')
  const src = readFileSync(resolve(ROOT, 'src/services/venueBridge/fnbDirectorBriefService.js'), 'utf8')
  assert('service performs NO writes (no INSERT/UPDATE/DELETE)', !/\b(INSERT\s+INTO|UPDATE\s+\w|DELETE\s+FROM)\b/i.test(src))
  assert('service makes no mergeVenueDna call', !/\bmergeVenueDna\b/.test(src))
  assert('service makes no AI/network calls', !/askGemini|fetch\(|openai|gemini/i.test(src))
  assert('service has no Event/Lab/prompt imports',
    !src.split('\n').some(l => /^\s*import\b/.test(l) && /(eventCocktailMenuService|geminiCocktailAgent|CocktailLab|EventBuilder|prompt)/i.test(l)))
  assert('service never writes Venue DNA / forbidden tables',
    !/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment|venue_intelligence_candidates|fb_decisions)\b/i.test(src))
  assert('service exports no promotion/DNA-write function',
    !/export\s+(function|const)\s+\w*([Pp]romot|[Cc]onfirmVenueDna|[Aa]pplyToVenueDna|[Tt]oVenueDna)/.test(src))
  assert('service only imports read/list source functions',
    /buildMenuIntelligenceSnapshot/.test(src) && /listFbDecisionsForVenue/.test(src) && /listVenueIntelligenceCandidatesForVenue/.test(src)
    && !/\bcreateFbDecision\b|\bsafeRecordFbDecision\b|\bcreateVenueIntelligenceCandidate\b|\bmarkVenueIntelligenceCandidateReviewed\b/.test(src))

  // ── 16. Static route guards (server.js) ──────────────────────────────────────
  section('Server route guards (static)')
  const serverSrc = readFileSync(resolve(ROOT, 'server.js'), 'utf8')
  assert('route GET /api/ci/fnb-director-brief exists, CI_ROLES gated',
    /app\.get\('\/api\/ci\/fnb-director-brief', requireAuth\(\.\.\.CI_ROLES\)/.test(serverSrc))
  assert('server imports buildFnbDirectorBrief', /import\s*\{\s*buildFnbDirectorBrief\s*\}/.test(serverSrc))
  assert('route is venue-scoped via req.venueId', /buildFnbDirectorBrief\(db, req\.venueId/.test(serverSrc))
  const mi = serverSrc.indexOf("app.get('/api/ci/fnb-director-brief'")
  const miEnd = serverSrc.indexOf('app.', mi + 10)
  const region = miEnd > mi ? serverSrc.slice(mi, miEnd) : serverSrc.slice(mi, mi + 800)
  assert('route region has no INSERT/UPDATE/DELETE', !/\b(INSERT\s+INTO|UPDATE\s+\w|DELETE\s+FROM)\b/i.test(region))
  assert('route region has no mergeVenueDna', !/mergeVenueDna/.test(region))
  assert('route returns { ok: true, brief }', /res\.json\(\{\s*ok:\s*true,\s*brief\s*\}\)/.test(region))

  // ── Results ──────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────')
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) { console.log(`\x1b[31m[FAIL] ${failed} test(s) failed — fix before committing.\x1b[0m\n`); process.exit(1) }
  console.log(`\x1b[32m[PASS] All tests passed.\x1b[0m\n`); process.exit(0)
}
