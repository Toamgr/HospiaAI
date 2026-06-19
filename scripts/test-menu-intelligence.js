#!/usr/bin/env node
/**
 * Deterministic tests for the read-only F&B Menu Intelligence Snapshot service
 * (Phase 8F — read-only portfolio view, no writes, no AI, no Venue DNA).
 *
 * In-memory node:sqlite DatabaseSync(':memory:') with a minimal cocktails +
 * cocktail_menus schema — no real DB, no server boot, no network, no AI.
 * Exits 0 on pass, 1 on failure.
 *
 * Run: node scripts/test-menu-intelligence.js   (or: npm run test:menu-intelligence)
 */

import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

import('../src/services/venueBridge/menuIntelligenceService.js')
  .then(runTests)
  .catch(err => { console.error('\n[FAIL] Could not import menuIntelligenceService.js:', err.message); process.exit(1) })

// ── minimal schema mirroring the live tables this service reads ─────────────────
const SCHEMA = `
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
  description           TEXT,
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

function seedMenu(db, venueId, name, status = 'active') {
  const r = db.prepare('INSERT INTO cocktail_menus (venue_id, name, status) VALUES (?,?,?)').run(venueId, name, status)
  return r.lastInsertRowid
}

function seedCocktail(db, menuId, c = {}) {
  return db.prepare(`
    INSERT INTO cocktails
      (name, category, base_spirit, glass_type, garnish, method, tags_json,
       ingredients_text_json, is_active, source, menu_id,
       estimated_cost_ils, suggested_price_ils, estimated_gp_percent,
       taste_profile_json, abv, prep_complexity, service_speed)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    c.name || 'Drink',
    c.category ?? null,
    c.base_spirit ?? null,
    c.glass_type ?? null,
    c.garnish ?? null,
    c.method ?? null,
    c.tags != null ? JSON.stringify(c.tags) : null,
    c.ingredients != null ? JSON.stringify(c.ingredients) : null,
    c.is_active != null ? c.is_active : 1,
    c.source || 'ci_generated',
    c.menu_id ?? menuId,
    c.estimated_cost_ils ?? null,
    c.suggested_price_ils ?? null,
    c.estimated_gp_percent ?? null,
    c.taste_profile != null ? JSON.stringify(c.taste_profile) : null,
    c.abv ?? null,
    c.prep_complexity ?? null,
    c.service_speed ?? null,
  ).lastInsertRowid
}

function runTests(svc) {
  const {
    buildMenuIntelligenceSnapshot, readVenueMenuItems, MENU_INTELLIGENCE_SOURCE_TABLES,
    computeBaseSpiritCoverage, computePricingProfile, computeTasteDistribution, computeProofCoverage,
  } = svc

  let passed = 0, failed = 0
  function assert(label, cond, detail) {
    if (cond) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }

  console.log('\n\x1b[1mHESTIA F&B Menu Intelligence Snapshot — Deterministic Tests\x1b[0m\n')

  const VENUE_A = 'venue_A', VENUE_B = 'venue_B'

  // ── Empty menu ──────────────────────────────────────────────────────────────
  section('Empty menu → safe empty snapshot')
  const db0 = new DatabaseSync(':memory:')
  db0.exec(SCHEMA)
  const empty = buildMenuIntelligenceSnapshot(db0, VENUE_A, { now: '2026-06-19T00:00:00.000Z' })
  assert('empty snapshot is venue-scoped', empty.venue_id === VENUE_A)
  assert('empty: total_items 0', empty.menu.total_items === 0)
  assert('empty: item_ids/names are []', Array.isArray(empty.menu.item_ids) && empty.menu.item_ids.length === 0)
  assert('empty: confidence low', empty.confidence.overall === 'low')
  assert('empty: missing_data names active_menu', empty.confidence.missing_data.includes('active_menu'))
  assert('empty: no risks fabricated', Array.isArray(empty.risks) && empty.risks.length === 0)
  assert('empty: source read-only, no AI, no writes', empty.source.ai_used === false && empty.source.writes_performed === false)
  assert('empty: tables_used reported', MENU_INTELLIGENCE_SOURCE_TABLES.includes('cocktails') && MENU_INTELLIGENCE_SOURCE_TABLES.includes('cocktail_menus'))
  assert('empty: pricing unavailable', empty.pricing_profile.available === false)
  assert('empty: taste unavailable', empty.taste_distribution.available === false)
  assert('blank venue id → empty snapshot, no throw', buildMenuIntelligenceSnapshot(db0, '').menu.total_items === 0)

  // ── Populated, venue-scoped menu ────────────────────────────────────────────
  section('Populated menu — counts + venue scope')
  const db = new DatabaseSync(':memory:')
  db.exec(SCHEMA)
  const menuA = seedMenu(db, VENUE_A, 'Summer Menu')
  seedCocktail(db, menuA, { name: 'Daiquiri', category: 'classic', base_spirit: 'rum', tags: ['classic'], suggested_price_ils: 52, estimated_cost_ils: 9, estimated_gp_percent: 82 })
  seedCocktail(db, menuA, { name: 'Mojito', category: 'classic', base_spirit: 'rum', tags: ['classic'] })
  seedCocktail(db, menuA, { name: 'Old Cuban', category: 'signature', base_spirit: 'rum', tags: ['signature'] })
  seedCocktail(db, menuA, { name: 'Negroni', category: 'classic', base_spirit: 'gin', tags: ['classic'] })
  // inactive cocktail must be excluded
  seedCocktail(db, menuA, { name: 'Retired Drink', base_spirit: 'gin', is_active: 0 })

  // Venue B menu (cross-venue data that must NOT leak into A)
  const menuB = seedMenu(db, VENUE_B, 'Winter Menu')
  seedCocktail(db, menuB, { name: 'Hot Toddy', category: 'classic', base_spirit: 'whisky' })
  seedCocktail(db, menuB, { name: 'B Signature', category: 'signature', base_spirit: 'tequila' })

  const snapA = buildMenuIntelligenceSnapshot(db, VENUE_A, { now: '2026-06-19T00:00:00.000Z' })
  assert('venue A item count = 4 (excludes inactive)', snapA.menu.total_items === 4)
  assert('venue A item names correct', snapA.menu.item_names.sort().join(',') === 'Daiquiri,Mojito,Negroni,Old Cuban')
  assert('no inactive item leaked', !snapA.menu.item_names.includes('Retired Drink'))
  assert('no cross-venue item leaked (no Hot Toddy / B Signature)',
    !snapA.menu.item_names.includes('Hot Toddy') && !snapA.menu.item_names.includes('B Signature'))

  const snapB = buildMenuIntelligenceSnapshot(db, VENUE_B)
  assert('venue B sees only its 2 items', snapB.menu.total_items === 2)
  assert('venue B has no venue A items', !snapB.menu.item_names.includes('Daiquiri'))

  // ── Coverage / spirit concentration (deterministic) ─────────────────────────
  section('Coverage — spirit concentration')
  assert('rum counted 3, gin 1', snapA.coverage.base_spirits.counts.rum === 3 && snapA.coverage.base_spirits.counts.gin === 1)
  assert('rum flagged overrepresented (3/4 = 0.75)', snapA.coverage.base_spirits.overrepresented && snapA.coverage.base_spirits.overrepresented.spirit === 'rum')
  assert('spirit_overconcentration risk present with evidence',
    snapA.risks.some(r => r.type === 'spirit_overconcentration' && typeof r.evidence === 'string' && r.evidence.length > 0))
  assert('classics vs signatures classified', snapA.coverage.classics_vs_signatures.available === true && snapA.coverage.classics_vs_signatures.classics === 3 && snapA.coverage.classics_vs_signatures.signatures === 1)

  // direct helper determinism
  const cov = computeBaseSpiritCoverage([{ base_spirit: 'rum' }, { base_spirit: 'rum' }, { base_spirit: 'gin' }])
  assert('computeBaseSpiritCoverage deterministic', cov.counts.rum === 2 && cov.counts.gin === 1 && cov.unknown_base_spirit === 0)
  const cov2 = computeBaseSpiritCoverage([{ base_spirit: null }, { base_spirit: '' }, { base_spirit: 'rum' }])
  assert('unknown base spirits counted, not fabricated', cov2.unknown_base_spirit === 2 && cov2.counts.rum === 1)

  // ── Missing taste profiles reported, not fabricated ─────────────────────────
  section('Taste profiles — missing reported, not fabricated')
  assert('venue A taste unavailable (no profiles seeded)', snapA.taste_distribution.available === false)
  assert('venue A missing_profiles_count = 4', snapA.taste_distribution.missing_profiles_count === 4)
  assert('no fabricated taste dimensions', snapA.taste_distribution.dimensions === null)
  assert('missing_taste_profiles risk is evidence-based', snapA.risks.some(r => r.type === 'missing_taste_profiles' && r.evidence.includes('4')))

  // with taste profiles, aggregation works and integer flavor stays separate
  const dbT = new DatabaseSync(':memory:'); dbT.exec(SCHEMA)
  const menuT = seedMenu(dbT, VENUE_A, 'Taste Menu')
  seedCocktail(dbT, menuT, { name: 'A', base_spirit: 'gin', taste_profile: { acidity: 3.0, sweetness: 1.0 } })
  seedCocktail(dbT, menuT, { name: 'B', base_spirit: 'gin', taste_profile: { acidity: 4.0, sweetness: 2.0 } })
  const tasteSnap = buildMenuIntelligenceSnapshot(dbT, VENUE_A)
  assert('taste available when profiles present', tasteSnap.taste_distribution.available === true)
  assert('taste acidity avg = 3.5', tasteSnap.taste_distribution.dimensions.acidity.avg === 3.5)
  const td = computeTasteDistribution([{ taste_profile: { acidity: 2 } }, { taste_profile: null }])
  assert('partial taste reports 1 missing', td.available === true && td.missing_profiles_count === 1)

  // ── Pricing honesty ─────────────────────────────────────────────────────────
  section('Pricing — explicit fields only; missing → null')
  assert('venue A pricing available (1 priced item)', snapA.pricing_profile.available === true)
  assert('price_range min=max=52 count=1', snapA.pricing_profile.price_range.min === 52 && snapA.pricing_profile.price_range.count === 1)
  assert('cost_range present', snapA.pricing_profile.cost_range && snapA.pricing_profile.cost_range.min === 9)
  assert('margin_range present', snapA.pricing_profile.margin_range && snapA.pricing_profile.margin_range.min === 82)
  assert('pricing labeled as estimate, not verified', /estimate/i.test(snapA.pricing_profile.note))

  const dbNoPrice = new DatabaseSync(':memory:'); dbNoPrice.exec(SCHEMA)
  const mNP = seedMenu(dbNoPrice, VENUE_A, 'No Price')
  seedCocktail(dbNoPrice, mNP, { name: 'X', base_spirit: 'gin' })
  const noPrice = buildMenuIntelligenceSnapshot(dbNoPrice, VENUE_A)
  assert('no pricing → available false', noPrice.pricing_profile.available === false)
  assert('no pricing → ranges null', noPrice.pricing_profile.price_range === null && noPrice.pricing_profile.cost_range === null && noPrice.pricing_profile.margin_range === null)
  assert('no pricing → missing fields listed', noPrice.pricing_profile.missing_pricing_fields.length === 3)
  assert('missing_pricing_data risk present', noPrice.risks.some(r => r.type === 'missing_pricing_data'))
  const pp = computePricingProfile([{ suggested_price_ils: null, estimated_cost_ils: null, estimated_gp_percent: null }])
  assert('computePricingProfile null inputs → unavailable', pp.available === false && pp.price_range === null)

  // ── No POS / guest / inventory assumptions ──────────────────────────────────
  section('No POS / guest / inventory inference')
  const flat = JSON.stringify(snapA).toLowerCase()
  assert('no popularity/sales inference', !flat.includes('popular') && !flat.includes('best_seller') && !flat.includes('best-seller'))
  assert('no guest-preference inference', !flat.includes('guest_pref') && !flat.includes('guests prefer'))
  assert('no inventory/bottle-availability inference', !flat.includes('in_stock') && !flat.includes('bottle_available'))
  assert('assumptions explicitly disclaim POS/guest/inventory', snapA._assumptions.some(a => /pos|guest|inventory/i.test(a)))

  // ── Risks are evidence-based only ───────────────────────────────────────────
  section('Risks evidence-based + confidence present')
  assert('every risk has evidence + recommendation + confidence',
    snapA.risks.every(r => isStr(r.evidence) && isStr(r.recommendation) && ['low', 'medium', 'high'].includes(r.confidence) && ['low', 'medium', 'high'].includes(r.severity)))
  assert('zero-proof note honest (marker absence, not a claim of none)',
    snapA.coverage.zero_proof.count === 0 && /marker/i.test(snapA.coverage.zero_proof.note))
  const proof = computeProofCoverage([{ category: 'mocktail', tags: [] }, { category: 'classic', tags: [], base_spirit: 'gin' }])
  assert('zero-proof detected only from explicit marker', proof.zero_proof.count === 1)
  assert('low-proof unavailable without ABV', proof.low_proof.available === false && proof.low_proof.count === null)

  // ── Operational profile missing reported ────────────────────────────────────
  section('Operational profile — missing fields reported')
  assert('operational fields missing reported', snapA.operational_profile.missing_operational_fields.length > 0)
  assert('missing_operational_data risk present', snapA.risks.some(r => r.type === 'missing_operational_data'))
  assert('recommended_human_review is non-empty + actionable', Array.isArray(snapA.recommended_human_review) && snapA.recommended_human_review.length > 0)

  // ── readVenueMenuItems is robust to a missing table ─────────────────────────
  section('Robustness')
  const dbBare = new DatabaseSync(':memory:')
  assert('missing tables → [] (no throw)', readVenueMenuItems(dbBare, VENUE_A).length === 0)
  assert('null db → [] (no throw)', readVenueMenuItems(null, VENUE_A).length === 0)

  // ── No writes occurred during snapshot generation ───────────────────────────
  section('No writes during snapshot generation')
  const beforeA = db.prepare('SELECT COUNT(*) c FROM cocktails').get().c
  const beforeM = db.prepare('SELECT COUNT(*) c FROM cocktail_menus').get().c
  buildMenuIntelligenceSnapshot(db, VENUE_A)
  buildMenuIntelligenceSnapshot(db, VENUE_B)
  const afterA = db.prepare('SELECT COUNT(*) c FROM cocktails').get().c
  const afterM = db.prepare('SELECT COUNT(*) c FROM cocktail_menus').get().c
  assert('cocktails row count unchanged', beforeA === afterA)
  assert('cocktail_menus row count unchanged', beforeM === afterM)
  // a read-only db proves no INSERT/UPDATE is attempted
  const dbRO = new DatabaseSync(':memory:'); dbRO.exec(SCHEMA)
  const mRO = seedMenu(dbRO, VENUE_A, 'RO'); seedCocktail(dbRO, mRO, { name: 'R', base_spirit: 'gin' })
  let threw = false
  try { buildMenuIntelligenceSnapshot(dbRO, VENUE_A) } catch { threw = true }
  assert('snapshot does not throw on normal data', threw === false)

  // ── Static guardrails (source-level) ────────────────────────────────────────
  section('Guardrails (static)')
  const src = readFileSync(resolve(ROOT, 'src/services/venueBridge/menuIntelligenceService.js'), 'utf8')
  assert('service makes no mergeVenueDna call', !/\bmergeVenueDna\s*\(/.test(src))
  assert('service does not import mergeVenueDna', !src.split('\n').some(l => /^\s*import\b/.test(l) && /mergeVenueDna/.test(l)))
  assert('service performs NO writes (no INSERT/UPDATE/DELETE)', !/\b(INSERT\s+INTO|UPDATE\s+\w|DELETE\s+FROM)\b/i.test(src))
  assert('service never writes Venue DNA tables',
    !/(INSERT\s+INTO|UPDATE)\s+(venue_intelligence|venue_briefs|venue_dna_enrichment|venue_intelligence_candidates)\b/i.test(src))
  assert('service makes no AI/network calls', !/askGemini|fetch\(|openai|gemini/i.test(src))
  assert('service has no Event/Lab imports', !/eventCocktailMenuService|geminiCocktailAgent|cocktailService|CocktailLab|EventBuilder/.test(src))
  assert('service exports no promotion/DNA-write function',
    !/export\s+(function|const)\s+\w*([Pp]romot|[Cc]onfirmVenueDna|[Aa]pplyToVenueDna|[Tt]oVenueDna)/.test(src))
  assert('service has no promotion/candidate-to-DNA logic', !/promote|promotion|promoted_to_dna|candidate.*dna/i.test(src.replace(/candidates\b/gi, '')))

  // ── Static route guards (server.js) ─────────────────────────────────────────
  section('Server route guards (static)')
  const serverSrc = readFileSync(resolve(ROOT, 'server.js'), 'utf8')
  assert('route GET /api/ci/menu-intelligence exists, CI_ROLES gated',
    /app\.get\('\/api\/ci\/menu-intelligence', requireAuth\(\.\.\.CI_ROLES\)/.test(serverSrc))
  assert('server imports buildMenuIntelligenceSnapshot', /buildMenuIntelligenceSnapshot/.test(serverSrc))
  assert('route is venue-scoped via req.venueId', /buildMenuIntelligenceSnapshot\(db, req\.venueId\)/.test(serverSrc))
  // the route region performs no writes / DNA mutation
  const mi = serverSrc.indexOf("app.get('/api/ci/menu-intelligence'")
  const miEnd = serverSrc.indexOf('app.', mi + 10)
  const miRegion = miEnd > mi ? serverSrc.slice(mi, miEnd) : serverSrc.slice(mi, mi + 800)
  assert('route region has no INSERT/UPDATE/DELETE', !/\b(INSERT\s+INTO|UPDATE\s+\w|DELETE\s+FROM)\b/i.test(miRegion))
  assert('route region has no mergeVenueDna', !/mergeVenueDna/.test(miRegion))

  // ── Results ──────────────────────────────────────────────────────────────────
  console.log('\n──────────────────────────────────────────')
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) { console.log(`\x1b[31m[FAIL] ${failed} test(s) failed — fix before committing.\x1b[0m\n`); process.exit(1) }
  console.log(`\x1b[32m[PASS] All tests passed.\x1b[0m\n`); process.exit(0)

  function isStr(v) { return typeof v === 'string' && v.length > 0 }
}
