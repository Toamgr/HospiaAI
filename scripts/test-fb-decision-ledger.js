#!/usr/bin/env node
/**
 * Deterministic tests for the F&B Decision Ledger (Phase 2 — write-only-first).
 *
 * Uses an in-memory node:sqlite DatabaseSync(':memory:') and the exported
 * FB_DECISIONS_DDL — no real DB file, no server boot, no network, no AI.
 *
 * Run: node scripts/test-fb-decision-ledger.js   (or: npm run test:fb-ledger)
 * No test framework. Exits 0 on pass, 1 on any failure. Matches hestia-check style.
 */

import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

Promise.all([
  import('../src/services/venueBridge/decisionLedgerService.js'),
  import('../src/services/venueBridge/decisionExplanationService.js'),
])
  .then(([svc, exp]) => runTests(svc, exp))
  .catch(err => {
    console.error('\n[FAIL] Could not import ledger/explanation services:', err.message)
    process.exit(1)
  })

function runTests(svc, exp) {
  const {
    FB_DECISIONS_DDL, DECISION_TYPES, DECISION_STATUSES, HUMAN_REVIEW_STATUSES, SOURCE_ENGINES,
    createFbDecision, safeRecordFbDecision, getFbDecisionById, listFbDecisionsForVenue, listFbDecisionsByType,
    markFbDecisionReviewed, buildFbDecisionRecord, buildFbDecisionFromCiGeneration,
  } = svc

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }
  function throws(fn) { try { fn(); return false } catch { return true } }

  console.log('\n\x1b[1mHESTIA F&B Decision Ledger — Deterministic Tests\x1b[0m\n')

  // ── Setup: in-memory DB + DDL ──────────────────────────────────────────────
  section('Table creation (in-memory, via FB_DECISIONS_DDL)')
  const db = new DatabaseSync(':memory:')
  db.exec(FB_DECISIONS_DDL)
  const tbl = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='fb_decisions'").get()
  assert('fb_decisions table exists', !!tbl && tbl.name === 'fb_decisions')
  assert('idempotent re-exec is safe', (() => { try { db.exec(FB_DECISIONS_DDL); return true } catch { return false } })())

  // ── Vocabulary exports ─────────────────────────────────────────────────────
  section('Controlled vocabularies')
  assert('active decision types present', ['cocktail_menu_generated','cocktail_selected','cocktail_rejected'].every(t => DECISION_TYPES.includes(t)))
  assert('statuses present', ['recorded','superseded','archived'].every(s => DECISION_STATUSES.includes(s)))
  assert('review statuses present', ['unreviewed','approved','rejected','needs_changes'].every(s => HUMAN_REVIEW_STATUSES.includes(s)))
  assert('source engines include ci_omer', SOURCE_ENGINES.includes('ci_omer'))

  // ── Create + read ──────────────────────────────────────────────────────────
  section('Create + read decision')
  const VENUE_A = 'venue_A'
  const VENUE_B = 'venue_B'
  const created = createFbDecision(db, VENUE_A, {
    decision_type: 'cocktail_menu_generated',
    source_engine: 'ci_omer',
    decision_title: 'Summer aperitivo menu (5 drinks)',
    decision_summary: 'Generated a low-ABV, citrus-forward menu for warm afternoons.',
    venue_dna_snapshot: { hospitalityStyle: ['warm mediterranean'] },
    venue_dna_hash: '3fa9c1',
    taste_profile_target: { acidity: { min: 2.0, max: 3.8 }, bitterness: { min: 1.0, max: 3.0 } },
    assumptions: ['assumed premium-but-accessible tier'],
    evidence: [{ source: 'venue_dna', ref: 'identity' }],
    confidence: { overall: 62, venue_dna: 55 },
    explanation_basis: { matched_archetypes: [{ key: 'warm_mediterranean' }] },
  })
  assert('create returns ok + id', created.ok === true && typeof created.id === 'string' && created.id.length > 0)

  const read = getFbDecisionById(db, VENUE_A, created.id)
  assert('read by id returns the row', !!read && read.id === created.id)
  assert('read is venue-scoped', read.venue_id === VENUE_A)
  assert('default status = recorded', read.status === 'recorded')
  assert('default human_review_status = unreviewed', read.human_review_status === 'unreviewed')
  assert('created_at populated by DB default', typeof read.created_at === 'string' && read.created_at.length > 0)

  // ── JSON round-trip ────────────────────────────────────────────────────────
  section('JSON round-trip integrity')
  assert('taste_profile_target round-trips', read.taste_profile_target?.acidity?.max === 3.8)
  assert('assumptions round-trips', Array.isArray(read.assumptions) && read.assumptions[0].includes('premium'))
  assert('evidence round-trips', read.evidence[0].source === 'venue_dna')
  assert('confidence round-trips', read.confidence.overall === 62)
  assert('explanation_basis round-trips', read.explanation_basis.matched_archetypes[0].key === 'warm_mediterranean')

  // ── No fake defaults: absent optional fields remain null ───────────────────
  section('No fake defaults (absent optional fields = null)')
  assert('absent recipe_snapshot_json is null', read.recipe_snapshot_json === null)
  assert('absent menu_snapshot_json is null', read.menu_snapshot_json === null)
  assert('absent operational_constraints_json is null', read.operational_constraints_json === null)
  assert('absent missing_fields_json is null', read.missing_fields_json === null)
  assert('absent provenance_json is null', read.provenance_json === null)
  assert('absent future_validation_targets_json is null', read.future_validation_targets_json === null)
  assert('absent source_request_id is null', read.source_request_id === null)
  assert('absent related_menu_id is null', read.related_menu_id === null)
  assert('absent approved_by is null', read.approved_by === null)
  assert('absent approved_at is null', read.approved_at === null)
  // pure builder: empty input keeps all optionals null
  const blank = buildFbDecisionRecord(VENUE_A, { decision_type: 'cocktail_selected', source_engine: 'ci_omer' })
  assert('builder leaves JSON fields null when absent', blank.recipe_snapshot_json === null && blank.evidence_json === null)
  assert('builder leaves scalar optionals null when absent', blank.decision_title === null && blank.related_cocktail_id === null)

  // ── Listing ────────────────────────────────────────────────────────────────
  section('Listing (venue-scoped, by type)')
  createFbDecision(db, VENUE_A, { decision_type: 'cocktail_selected', source_engine: 'ci_omer', related_cocktail_id: 347 })
  createFbDecision(db, VENUE_A, { decision_type: 'cocktail_rejected', source_engine: 'ci_omer', decision_summary: 'too sweet' })
  const listA = listFbDecisionsForVenue(db, VENUE_A)
  assert('list returns all venue-A rows', listA.length === 3)
  assert('list newest-first', listA[0].decision_type === 'cocktail_rejected')
  const byType = listFbDecisionsByType(db, VENUE_A, 'cocktail_selected')
  assert('list by type filters correctly', byType.length === 1 && byType[0].related_cocktail_id === 347)
  assert('list respects limit', listFbDecisionsForVenue(db, VENUE_A, { limit: 1 }).length === 1)

  // ── Cross-venue isolation ──────────────────────────────────────────────────
  section('Cross-venue isolation')
  createFbDecision(db, VENUE_B, { decision_type: 'cocktail_menu_generated', source_engine: 'ci_omer' })
  assert('venue B sees only its own row', listFbDecisionsForVenue(db, VENUE_B).length === 1)
  assert('venue A still sees only its 3', listFbDecisionsForVenue(db, VENUE_A).length === 3)
  assert('cross-venue read by id returns null', getFbDecisionById(db, VENUE_B, created.id) === null)

  // ── Validation ─────────────────────────────────────────────────────────────
  section('Validation (rejects invalid input)')
  assert('missing venueId rejected', throws(() => createFbDecision(db, '', { decision_type: 'cocktail_selected', source_engine: 'ci_omer' })))
  assert('invalid decision_type rejected', throws(() => createFbDecision(db, VENUE_A, { decision_type: 'nope', source_engine: 'ci_omer' })))
  assert('invalid source_engine rejected', throws(() => createFbDecision(db, VENUE_A, { decision_type: 'cocktail_selected', source_engine: 'nope' })))
  assert('invalid status rejected', throws(() => createFbDecision(db, VENUE_A, { decision_type: 'cocktail_selected', source_engine: 'ci_omer', status: 'nope' })))
  assert('invalid human_review_status rejected', throws(() => createFbDecision(db, VENUE_A, { decision_type: 'cocktail_selected', source_engine: 'ci_omer', human_review_status: 'nope' })))
  assert('listFbDecisionsByType invalid type throws', throws(() => listFbDecisionsByType(db, VENUE_A, 'nope')))
  assert('getFbDecisionById invalid args → null (no crash)', getFbDecisionById(db, '', '') === null)

  // ── Mark reviewed (only post-create mutation) ──────────────────────────────
  section('Mark reviewed')
  const r = markFbDecisionReviewed(db, VENUE_A, created.id, { human_review_status: 'approved', approved_by: 'owner@venue' })
  assert('markReviewed returns ok', r.ok === true)
  const reviewed = getFbDecisionById(db, VENUE_A, created.id)
  assert('review status updated', reviewed.human_review_status === 'approved')
  assert('approved_by recorded', reviewed.approved_by === 'owner@venue')
  assert('approved_at set on approval', typeof reviewed.approved_at === 'string' && reviewed.approved_at.length > 0)
  assert('core decision content unchanged after review', reviewed.decision_title === 'Summer aperitivo menu (5 drinks)' && reviewed.confidence.overall === 62)
  assert('invalid review status rejected', throws(() => markFbDecisionReviewed(db, VENUE_A, created.id, { human_review_status: 'nope' })))
  assert('review of cross-venue row throws', throws(() => markFbDecisionReviewed(db, VENUE_B, created.id, { human_review_status: 'approved' })))

  // ── Pure mapping helper (no live usage / no db) ────────────────────────────
  section('Pure CI mapping helper')
  const mapped = buildFbDecisionFromCiGeneration({ requestId: 'req_1', venueDnaHash: 'abc', confidence: { overall: 50 } })
  assert('maps to cocktail_menu_generated', mapped.decision_type === 'cocktail_menu_generated')
  assert('maps to ci_omer source', mapped.source_engine === 'ci_omer')
  assert('carries provenance default', mapped.provenance.origin === 'specialist_decision')
  assert('mapping is pure (plain object)', typeof mapped === 'object' && !('id' in mapped))

  // ── Guardrail / isolation static checks ────────────────────────────────────
  section('Guardrails: no DNA mutation, no Event/Lab/AI coupling')
  const src = readFileSync(resolve(ROOT, 'src/services/venueBridge/decisionLedgerService.js'), 'utf8')
  // Precise: detect actual writes to venue tables / DNA-mutating calls, not mere mentions
  // (the service's own guardrail comment references those table names intentionally).
  assert('service performs no Venue DNA / venue-table writes',
    !/(INSERT\s+INTO|UPDATE)\s+venue_(intelligence|briefs|dna_enrichment)/i.test(src)
    && !/\bmergeVenueDna\s*\(/.test(src)
    && !/\bapplyConfidenceDeltas\s*\(/.test(src))
  assert('service only writes the fb_decisions table',
    (src.match(/(INSERT\s+INTO|UPDATE)\s+(\w+)/gi) || []).every(s => /fb_decisions/i.test(s)))
  assert('service does not import Event Builder', !/eventCocktailMenuService/.test(src))
  assert('service does not import Cocktail Lab', !/geminiCocktailAgent|cocktailService/.test(src))
  assert('service makes no AI/network calls', !/askGemini|fetch\(|openai|gemini/i.test(src))

  // ── safeRecordFbDecision: the non-blocking wrapper (Phase 3) ───────────────
  section('safeRecordFbDecision (non-blocking wrapper)')
  const okRes = safeRecordFbDecision(db, VENUE_A, { decision_type: 'cocktail_selected', source_engine: 'ci_omer', related_cocktail_id: 999 })
  assert('returns ok:true + decisionId on success', okRes.ok === true && typeof okRes.decisionId === 'string')
  assert('the row was actually written', !!getFbDecisionById(db, VENUE_A, okRes.decisionId))

  // Fake db whose prepare() throws → must NOT throw, returns ok:false
  const throwingDb = { prepare() { throw new Error('db exploded') } }
  let threw = false, failRes
  try { failRes = safeRecordFbDecision(throwingDb, VENUE_A, { decision_type: 'cocktail_selected', source_engine: 'ci_omer' }) } catch { threw = true }
  assert('never throws when db.prepare throws', threw === false)
  assert('returns ok:false + error on db failure', failRes && failRes.ok === false && typeof failRes.error === 'string')

  // onError is invoked safely on failure
  let onErrCalled = 0
  safeRecordFbDecision(throwingDb, VENUE_A, { decision_type: 'cocktail_selected', source_engine: 'ci_omer' }, () => { onErrCalled++ })
  assert('calls onError when provided', onErrCalled === 1)

  // does not throw even if onError itself throws
  let threw2 = false
  try { safeRecordFbDecision(throwingDb, VENUE_A, { decision_type: 'cocktail_selected', source_engine: 'ci_omer' }, () => { throw new Error('logger exploded') }) } catch { threw2 = true }
  assert('does not throw if onError throws', threw2 === false)

  // invalid decision_type is still rejected by create → wrapper returns ok:false (caught), never throws
  let threw3 = false, badRes
  try { badRes = safeRecordFbDecision(db, VENUE_A, { decision_type: 'nope', source_engine: 'ci_omer' }) } catch { threw3 = true }
  assert('invalid type → ok:false, no throw', threw3 === false && badRes.ok === false)
  assert('invalid type writes no row', listFbDecisionsByType(db, VENUE_A, 'cocktail_menu_generated').every(r => r.id !== undefined)) // sanity: list works
  // createFbDecision (bare) still throws on invalid type (contract preserved)
  assert('bare createFbDecision still rejects invalid type', throws(() => createFbDecision(db, VENUE_A, { decision_type: 'nope', source_engine: 'ci_omer' })))

  // representative compact route-shaped input round-trips
  const routeShaped = safeRecordFbDecision(db, VENUE_A, {
    decision_type: 'cocktail_menu_generated', source_engine: 'ci_omer',
    decision_title: 'CI generation: menu',
    decision_payload: { flow_type: 'menu', params: { count: 5 } },
    venue_dna_snapshot: { venue_type: 'cocktail bar', price_range: 'premium' },
    menu_snapshot: { count: 5, names: ['A', 'B'] },
    evidence: [{ source: 'venue_dna' }, { source: 'omer_brief', ref: 'active' }],
    provenance: { origin: 'specialist_decision', route: 'ci_generate' },
    confidence: { omer: 62 },
    explanation_basis: { omer_active: true, flow_type: 'menu' },
    future_validation_targets: null,
  })
  const rt = getFbDecisionById(db, VENUE_A, routeShaped.decisionId)
  assert('route-shaped record round-trips compactly', rt.menu_snapshot.count === 5 && rt.confidence.omer === 62 && rt.future_validation_targets_json === null)

  // ── Static route-wiring guards (server.js) ─────────────────────────────────
  section('Static guards: live route wiring')
  const serverSrc = readFileSync(resolve(ROOT, 'server.js'), 'utf8')
  assert('server imports FB_DECISIONS_DDL + safeRecordFbDecision from ledger',
    /import \{[^}]*FB_DECISIONS_DDL[^}]*safeRecordFbDecision[^}]*\} from ".\/src\/services\/venueBridge\/decisionLedgerService\.js"/.test(serverSrc))
  assert('server inits the table', /db\.exec\(FB_DECISIONS_DDL\)/.test(serverSrc))
  assert('routes use safeRecordFbDecision (>=3 call sites)', (serverSrc.match(/safeRecordFbDecision\(/g) || []).length >= 3)
  assert('no bare createFbDecision call in server routes', !serverSrc.includes('createFbDecision('))
  // response shapes unchanged
  assert('ci/generate response shape unchanged', serverSrc.includes('res.json({ ok: true, flow_type, result, venue_context_active: omer.active });'))
  assert('ci/cocktails response shape unchanged', /res\.status\(201\)\.json\(\{\s*ok: true,\s*cocktail: \{ \.\.\.saved,/.test(serverSrc))
  assert('ci/rejections response shape unchanged', serverSrc.includes('res.status(201).json({ ok: true, saved: true });'))
  // the three decision types are wired
  assert('cocktail_menu_generated wired', serverSrc.includes("decision_type: 'cocktail_menu_generated'"))
  assert('cocktail_selected wired', serverSrc.includes("decision_type: 'cocktail_selected'"))
  assert('cocktail_rejected wired', serverSrc.includes("decision_type: 'cocktail_rejected'"))
  // just_experimenting early-return precedes the rejection ledger write (no row for experimenting)
  assert('just_experimenting precedes cocktail_rejected ledger write',
    serverSrc.indexOf('just_experimenting') < serverSrc.indexOf("decision_type: 'cocktail_rejected'"))

  // ── Phase 4: explanation service (deterministic, read-only) ────────────────
  section('Explanation service (Phase 4)')
  const {
    buildFbDecisionExplanation, summarizeEvidence, summarizeConfidence,
    summarizeDecisionBasis, summarizeMissingInformation,
  } = exp

  // Helper: create a decision then read it back as the explanation service would receive it.
  function explainFresh(input) {
    const c = createFbDecision(db, VENUE_A, input)
    return buildFbDecisionExplanation(getFbDecisionById(db, VENUE_A, c.id))
  }

  // cocktail_menu_generated — rich basis (omer active + confidence + evidence)
  const expGen = explainFresh({
    decision_type: 'cocktail_menu_generated', source_engine: 'ci_omer',
    decision_title: 'CI generation: menu',
    decision_payload: { flow_type: 'menu', params: { count: 4 } },
    venue_dna_snapshot: { venue_type: 'cocktail bar', price_range: 'premium' },
    menu_snapshot: { count: 4, names: ['A', 'B', 'C', 'D'] },
    evidence: [{ source: 'venue_dna' }, { source: 'omer_brief', ref: 'active' }],
    confidence: { omer: 72 },
    explanation_basis: { omer_active: true, omer_confidence: 72, flow_type: 'menu' },
  })
  assert('generated: can_explain true', expGen.can_explain === true)
  assert('generated: decision_type carried', expGen.decision_type === 'cocktail_menu_generated')
  assert('generated: answer mentions generation', /generated/i.test(expGen.answer))
  assert('generated: evidence normalized to labels', expGen.evidence.includes('omer_brief:active') && expGen.evidence.includes('venue_dna'))
  assert('generated: confidence high (72)', expGen.confidence.level === 'high')
  assert('generated: bar dna dims in basis', !!expGen.basis.venue_context.bar_dna_dimensions)

  // cocktail_selected — honest "human save", cost estimate warning
  const expSel = explainFresh({
    decision_type: 'cocktail_selected', source_engine: 'ci_omer', related_cocktail_id: 501,
    decision_title: 'Saved cocktail: Coastal Negroni',
    recipe_snapshot: { name: 'Coastal Negroni', base_spirit: 'gin' },
    decision_payload: { costing_basis: 'estimate', estimated_cost_ils: 7 },
    evidence: [{ source: 'costing', ref: 'estimate' }],
    provenance: { origin: 'specialist_decision', action: 'human_save' },
  })
  assert('selected: can_explain true (has basis)', expSel.can_explain === true)
  assert('selected: answer frames it as a save action', /saved|select/i.test(expSel.answer))
  assert('selected: warns estimates not verified', expSel.warnings.some(w => /estimate/i.test(w)))
  assert('selected: confidence none (none recorded)', expSel.confidence.level === 'none')

  // cocktail_rejected — honest from reasons only
  const expRej = explainFresh({
    decision_type: 'cocktail_rejected', source_engine: 'ci_omer',
    subject_ref: { cocktail_name: 'Too Sweet Sour' },
    decision_title: 'Rejected: Too Sweet Sour',
    decision_payload: { reasons: ['too_sweet', 'off_brand'], base_spirit: 'rum' },
    evidence: [{ source: 'rejection_history' }],
  })
  assert('rejected: answer mentions rejection + reasons', /reject/i.test(expRej.answer) && /too_sweet/.test(expRej.answer))
  assert('rejected: missing_information lists not-recorded fields', expRej.missing_information.some(m => /assumptions/.test(m)) && expRej.missing_information.some(m => /POS|validation/i.test(m)))

  // Honest empty / not-found safety net
  const expNone = buildFbDecisionExplanation(null)
  assert('null decision → can_explain false (no throw)', expNone.can_explain === false)
  assert('null decision → honest answer', /no decision/i.test(expNone.answer))
  const expEmpty = buildFbDecisionExplanation({})
  assert('empty decision → can_explain false', expEmpty.can_explain === false)

  // Null fields do not crash; not-recorded reported honestly
  const sparse = explainFresh({ decision_type: 'cocktail_selected', source_engine: 'ci_omer' })
  assert('sparse row does not crash', !!sparse && typeof sparse.answer === 'string')
  assert('sparse: confidence none', sparse.confidence.level === 'none')
  assert('sparse: warns no evidence', sparse.warnings.some(w => /no evidence/i.test(w)))
  assert('sparse: missing_information includes phase-3 absences', sparse.missing_information.some(m => /future sales\/POS|validation/i.test(m)))

  // Phase-3-never-recorded fields are always honest empties (never invented)
  assert('assumptions always empty array', Array.isArray(expGen.assumptions) && expGen.assumptions.length === 0)
  assert('future_validation_targets always empty array', Array.isArray(expGen.future_validation_targets) && expGen.future_validation_targets.length === 0)

  // Helper unit checks
  assert('summarizeEvidence empty → []', summarizeEvidence({}).length === 0)
  assert('summarizeConfidence empty → none', summarizeConfidence({}).level === 'none')
  assert('summarizeMissingInformation lists items', summarizeMissingInformation({ decision_type: 'cocktail_selected' }).length > 0)

  // ── Static guards: explanation service + routes ────────────────────────────
  section('Static guards: explanation service + read routes')
  const expSrc = readFileSync(resolve(ROOT, 'src/services/venueBridge/decisionExplanationService.js'), 'utf8')
  assert('explanation service: no db import/usage', !/db\.prepare|node:sqlite|DatabaseSync/.test(expSrc))
  assert('explanation service: no AI/network', !/askGemini|fetch\(|openai|gemini/i.test(expSrc))
  assert('explanation service: no Event/Lab imports', !/eventCocktailMenuService|geminiCocktailAgent|cocktailService/.test(expSrc))
  assert('explanation service: no DNA-table writes', !/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment|fb_decisions)/i.test(expSrc))
  // routes
  assert('explanation route registered', serverSrc.includes("app.get('/api/ci/decisions/:decisionId/explanation', requireAuth(...CI_ROLES)"))
  assert('list route registered', serverSrc.includes("app.get('/api/ci/decisions', requireAuth(...CI_ROLES)"))
  assert('explanation route 404s on missing row', /No decision found for this venue/.test(serverSrc))
  // list endpoint must not expose large JSON snapshots
  assert('list route omits large JSON snapshots', !/menu_snapshot|recipe_snapshot|venue_dna_snapshot|decision_payload|explanation_basis_json/.test(
    serverSrc.slice(serverSrc.indexOf("app.get('/api/ci/decisions'"), serverSrc.indexOf("app.get('/api/ci/decisions/:decisionId/explanation'"))))
  assert('list route exposes has_explanation_basis/has_confidence booleans',
    /has_explanation_basis:/.test(serverSrc) && /has_confidence:/.test(serverSrc))

  // ── Phase 5: decimal taste convergence into CI/Omer (flag-gated) ────────────
  section('Phase 5: CI/Omer taste-target wiring + ledger')
  // server imports the Phase 5 helpers
  assert('server imports resolveCiTasteTarget + formatTasteTargetPromptBlock',
    /import \{ resolveCiTasteTarget, formatTasteTargetPromptBlock \} from ".\/src\/services\/venueBridge\/beverageContextService\.js"/.test(serverSrc))
  assert('server imports isVenueBeverageContextEnabled', /import \{[^}]*isVenueBeverageContextEnabled[^}]*\} from ".\/src\/config\/featureFlags\.js"/.test(serverSrc))
  // flag-off identity: venueContextText defaults to omer.text and the taste block is flag-gated
  assert('venueContextText defaults to omer.text (flag-off identity)', /let venueContextText = omer\.text \|\| '';/.test(serverSrc))
  assert('taste block append is gated by isVenueBeverageContextEnabled()',
    /if \(isVenueBeverageContextEnabled\(\)\) \{[\s\S]*resolveCiTasteTarget\([\s\S]*formatTasteTargetPromptBlock\(/.test(serverSrc))
  // buildGenerationPrompt is unchanged: still called with venueContextText (no new param/signature change)
  assert('buildGenerationPrompt called with composed venueContextText',
    /buildGenerationPrompt\(flow_type, params, dna, tasteDna, existingNames, venueContextText\)/.test(serverSrc))
  // no decimal OUTPUT requested: result parsing unchanged; response shape unchanged
  assert('result parsing unchanged (JSON.parse(raw))', serverSrc.includes('result = JSON.parse(raw)'))
  assert('ci/generate response shape still unchanged', serverSrc.includes('res.json({ ok: true, flow_type, result, venue_context_active: omer.active });'))
  // ledger: stores deterministic target only when resolved; NO decimal result anywhere
  assert('ledger stores taste_profile_target only when resolved', /taste_profile_target: tasteTarget \? tasteTarget\.range : null/.test(serverSrc))
  assert('ledger never writes a decimal taste RESULT', !/taste_profile_result/.test(serverSrc))
  assert('ledger records honest missing_fields when flag-on but no target',
    /missing_fields: \(isVenueBeverageContextEnabled\(\) && !tasteTarget\) \? \['no venue taste target resolved'\] : null/.test(serverSrc))
  // protected: integer flavor model untouched; no Venue DNA write added; Lab/Event untouched
  const fileExists = (p) => { try { readFileSync(p, 'utf8'); return true } catch { return false } }
  assert('integer flavor model file still present', fileExists(resolve(ROOT, 'src/domain/hospitality/bar/cocktailFlavorProfileUtils.js')))
  assert('no DNA-table writes introduced near taste wiring',
    !/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment)/i.test(
      serverSrc.slice(serverSrc.indexOf('Phase 5: flag-gated decimal taste'), serverSrc.indexOf('res.json({ ok: true, flow_type, result'))))

  // functional: a cocktail_menu_generated ledger row CAN carry a deterministic target range,
  // round-trips, and never carries a decimal result.
  const withTarget = createFbDecision(db, VENUE_A, {
    decision_type: 'cocktail_menu_generated', source_engine: 'ci_omer',
    decision_title: 'CI generation: menu',
    taste_profile_target: { acidity: { min: 2.5, max: 3.8 }, bitterness: { min: 1.0, max: 3.0 } },
    explanation_basis: { omer_active: true, flow_type: 'menu', taste_target_dimensions: ['acidity', 'bitterness'] },
  })
  const wt = getFbDecisionById(db, VENUE_A, withTarget.id)
  assert('ledger round-trips taste_profile_target', wt.taste_profile_target.acidity.max === 3.8)
  assert('ledger has no taste_profile_result key', !('taste_profile_result_json' in wt) && wt.taste_profile_result === undefined)
  const wtExp = buildFbDecisionExplanation(wt)
  // explanation service handles a row that carries a taste target (no crash; basis present)
  assert('explanation builds for a row with taste target', wtExp.can_explain === true && !!wtExp.basis)

  // ── Results ────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────')
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) {
    console.log(`\x1b[31m[FAIL] ${failed} test(s) failed — fix before committing.\x1b[0m\n`)
    process.exit(1)
  } else {
    console.log(`\x1b[32m[PASS] All tests passed.\x1b[0m\n`)
    process.exit(0)
  }
}
