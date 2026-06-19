#!/usr/bin/env node
/**
 * Deterministic tests for the Venue-aware Beverage Intelligence foundation layer.
 *
 * Covers:
 *   - Decimal taste profile scale (0.0–5.0, one decimal, NOT integer-only)
 *   - Classic taste calibration validity
 *   - Cocktail family ratio + ingredient impact + micro-adjustment lookups
 *   - Venue DNA → target taste range mapping
 *   - Venue beverage context adapter (incl. missing-field safety)
 *   - Kosher behavior remains default-off (regression guard on existing KB)
 *
 * Run: node scripts/test-beverage-intelligence-foundation.js
 * No test framework. Exits 0 on pass, 1 on any failure. Matches hestia-check style.
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

Promise.all([
  import('../src/domain/hospitality/bar/tasteProfileSchema.js'),
  import('../src/domain/hospitality/bar/classicTasteCalibration.js'),
  import('../src/domain/hospitality/bar/cocktailFamilyRatios.js'),
  import('../src/domain/hospitality/bar/ingredientTasteImpact.js'),
  import('../src/domain/hospitality/bar/microAdjustmentPrediction.js'),
  import('../src/domain/hospitality/bar/venueTasteProfileMap.js'),
  import('../src/services/venueBridge/beverageContextService.js'),
  import('../src/domain/hospitality/bar/cocktailKnowledgeBase/index.js'),
  import('../src/config/featureFlags.js'),
  import('../src/services/geminiCocktailAgent.js'),
])
  .then(mods => runTests(...mods))
  .catch(err => {
    console.error('\n[FAIL] Could not import foundation modules:', err.message)
    process.exit(1)
  })

function runTests(schema, calibration, families, ingredients, micro, venueMap, beverageCtx, knowledgeBase, flags, agent) {
  let passed = 0
  let failed = 0

  function assert(label, condition, detail) {
    if (condition) { console.log(`  \x1b[32m✓\x1b[0m  ${label}`); passed++ }
    else { console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
  }
  function section(name) { console.log(`\n\x1b[36m── ${name}\x1b[0m`) }

  console.log('\n\x1b[1mHESTIA Beverage Intelligence Foundation — Deterministic Tests\x1b[0m\n')

  // ── 1. Decimal taste profile scale ─────────────────────────────────────────
  section('Decimal taste profile (0.0–5.0, one decimal)')
  const { TASTE_SCALE, TASTE_DIMENSION_KEYS, clampTasteScore, roundToOneDecimal,
          createTasteProfile, validateTasteProfile, emptyTasteProfile, isValidTasteScore,
          mergeTasteRanges } = schema

  assert('scale min is 0.0', TASTE_SCALE.min === 0.0)
  assert('scale max is 5.0', TASTE_SCALE.max === 5.0)
  assert('scale precision is 1 decimal', TASTE_SCALE.precision === 1)
  assert('has 10 dimensions', TASTE_DIMENSION_KEYS.length === 10, `got ${TASTE_DIMENSION_KEYS.length}`)
  const expectedDims = ['acidity','sweetness','bitterness','salinity','umami','aroma_intensity','body','texture','finish_length','alcohol_heat']
  assert('dimension keys match contract', expectedDims.every(d => TASTE_DIMENSION_KEYS.includes(d)))

  // one-decimal precision (NOT integer enforcement)
  assert('clamp keeps one decimal 4.3', clampTasteScore(4.3) === 4.3, `got ${clampTasteScore(4.3)}`)
  assert('clamp keeps one decimal 2.1', clampTasteScore(2.1) === 2.1)
  assert('clamp keeps one decimal 0.8', clampTasteScore(0.8) === 0.8)
  assert('clamp does NOT round to integer (2.6→2.6)', clampTasteScore(2.6) === 2.6, `got ${clampTasteScore(2.6)}`)
  assert('round 4.27 → 4.3', roundToOneDecimal(4.27) === 4.3)
  assert('clamp above-max 7.4 → 5.0', clampTasteScore(7.4) === 5.0)
  assert('clamp below-min -2 → 0.0', clampTasteScore(-2) === 0.0)
  assert('non-numeric → null (no fake 0)', clampTasteScore('abc') === null)

  // empty profile is honest (null, not 0)
  const empty = emptyTasteProfile()
  assert('empty profile has all dims null', TASTE_DIMENSION_KEYS.every(k => empty[k] === null))

  // createTasteProfile keeps decimals, marks missing as null
  const tp = createTasteProfile({ acidity: 4.3, sweetness: 2.1, bitterness: 1.7, salinity: 0.8 })
  assert('createTasteProfile preserves 4.3', tp.acidity === 4.3)
  assert('createTasteProfile preserves 0.8', tp.salinity === 0.8)
  assert('createTasteProfile leaves unset dims null', tp.umami === null)
  assert('isValidTasteScore(4.3) true', isValidTasteScore(4.3) === true)
  assert('isValidTasteScore(6) false', isValidTasteScore(6) === false)
  assert('validateTasteProfile valid for decimals', validateTasteProfile(tp).valid === true)
  assert('validateTasteProfile rejects out-of-range', validateTasteProfile({ acidity: 9 }).valid === false)

  // explicitly assert no integer-only enforcement: a one-decimal value survives a round-trip
  const decimalRoundtrip = createTasteProfile({ body: 2.6, finish_length: 3.4 })
  assert('no integer-only enforcement (2.6 survives)', decimalRoundtrip.body === 2.6)
  assert('no integer-only enforcement (3.4 survives)', decimalRoundtrip.finish_length === 3.4)

  // merge ranges
  const merged = mergeTasteRanges([{ acidity: { min: 2.0, max: 4.0 } }, { acidity: { min: 2.5, max: 3.8 } }])
  assert('mergeTasteRanges intersects overlap', merged.acidity.min === 2.5 && merged.acidity.max === 3.8)
  assert('mergeTasteRanges null for absent dim', merged.umami === null)

  // ── 2. Classic taste calibration ───────────────────────────────────────────
  section('Classic taste calibration')
  const { CLASSIC_TASTE_CALIBRATION, getClassicTasteProfile, validateCalibrationSet,
          CLASSIC_TASTE_CALIBRATION_COUNT } = calibration

  assert('calibration has >= 19 classics', CLASSIC_TASTE_CALIBRATION_COUNT >= 19, `got ${CLASSIC_TASTE_CALIBRATION_COUNT}`)
  const requiredClassics = ['daiquiri','margarita','negroni','old_fashioned','martini','paloma','aperol_spritz',
    'espresso_martini','whiskey_sour','mojito','gimlet','manhattan','french_75','penicillin','mai_tai',
    'pina_colada','paper_plane','cosmopolitan','boulevardier']
  assert('all required classics present', requiredClassics.every(k => CLASSIC_TASTE_CALIBRATION[k]),
    requiredClassics.filter(k => !CLASSIC_TASTE_CALIBRATION[k]).join(','))
  const calCheck = validateCalibrationSet()
  assert('every calibration entry validates on 0–5 scale', calCheck.ok === true, JSON.stringify(calCheck.problems))
  assert('Negroni reads high bitterness (decimal)', CLASSIC_TASTE_CALIBRATION.negroni.taste_profile.bitterness >= 4.0)
  assert('Daiquiri reads high acidity', CLASSIC_TASTE_CALIBRATION.daiquiri.taste_profile.acidity >= 3.5)
  assert('calibration uses decimals (not all integers)',
    Object.values(CLASSIC_TASTE_CALIBRATION).some(c => Object.values(c.taste_profile).some(v => v % 1 !== 0)))
  assert('getClassicTasteProfile by display name', getClassicTasteProfile('Old Fashioned')?.name === 'Old Fashioned')
  assert('getClassicTasteProfile miss → null', getClassicTasteProfile('Nonexistent Drink') === null)

  // ── 3. Family ratios / ingredient cards / micro prediction ─────────────────
  section('Family ratios, ingredient cards, micro-adjustment')
  const { COCKTAIL_FAMILY_RATIOS, getFamilyRatio, COCKTAIL_FAMILY_KEYS } = families
  const requiredFamilies = ['sour','collins','highball','old_fashioned','negroni','martini','spritz','flip_creamy','tropical_tiki','coffee_espresso']
  assert('all 10 families present', requiredFamilies.every(f => COCKTAIL_FAMILY_RATIOS[f]),
    requiredFamilies.filter(f => !COCKTAIL_FAMILY_RATIOS[f]).join(','))
  assert('family count is 10', COCKTAIL_FAMILY_KEYS.length === 10)
  assert('getFamilyRatio loose match (tiki)', getFamilyRatio('tiki')?.name === 'Tropical / Tiki')
  assert('sour family has reference_ml', Array.isArray(getFamilyRatio('sour').reference_ml))

  const { INGREDIENT_TASTE_IMPACT, getIngredientImpact } = ingredients
  const requiredIngredients = ['lemon','lime','grapefruit','simple_syrup','demerara','honey','agave','campari','aperol',
    'vermouth','gin','vodka','tequila','mezcal','rum','bourbon','rye','mint','rosemary','basil','coffee','coconut',
    'passion_fruit','pineapple','saline','bitters']
  assert('all required ingredients present', requiredIngredients.every(i => INGREDIENT_TASTE_IMPACT[i]),
    requiredIngredients.filter(i => !INGREDIENT_TASTE_IMPACT[i]).join(','))
  assert('ingredient cards carry risk text', requiredIngredients.every(i => typeof INGREDIENT_TASTE_IMPACT[i].risk === 'string' && INGREDIENT_TASTE_IMPACT[i].risk.length > 0))
  assert('getIngredientImpact loose match ("fresh lime juice")', getIngredientImpact('fresh lime juice')?.type === 'acid')
  assert('getIngredientImpact loose match ("London dry gin")', getIngredientImpact('London dry gin')?.type === 'spirit')
  assert('lime pushes acidity up', INGREDIENT_TASTE_IMPACT.lime.effects.acidity?.startsWith('+'))
  assert('getIngredientImpact miss → null', getIngredientImpact('unobtanium') === null)

  const { MICRO_ADJUSTMENT_PREDICTIONS, predictAdjustment, predictCombinedDelta, MICRO_ADJUSTMENT_KEYS } = micro
  const requiredAdjustments = ['citrus_plus_2_5ml','citrus_minus_2_5ml','syrup_plus_2_5ml','syrup_minus_2_5ml',
    'modifier_plus_5ml','bitters_plus_1_dash','saline_plus_1_3_drops','more_dilution','less_dilution',
    'add_carbonation','acid_swap_softer','sweetener_swap_richer']
  assert('all required adjustments present', requiredAdjustments.every(a => MICRO_ADJUSTMENT_PREDICTIONS[a]),
    requiredAdjustments.filter(a => !MICRO_ADJUSTMENT_PREDICTIONS[a]).join(','))
  assert('+2.5ml citrus predicts acidity increase', predictAdjustment('citrus_plus_2_5ml').predicted_delta.acidity > 0)
  assert('more dilution predicts body decrease', predictAdjustment('more_dilution').predicted_delta.body < 0)
  const combined = predictCombinedDelta(['citrus_plus_2_5ml', 'syrup_plus_2_5ml'])
  assert('combined delta sums acidity', typeof combined.acidity === 'number')
  assert('predictAdjustment miss → null', predictAdjustment('nope') === null)
  assert('micro keys non-empty', MICRO_ADJUSTMENT_KEYS.length >= 12)

  // ── 4. Venue DNA → target taste range mapping ──────────────────────────────
  section('Venue DNA → target taste range mapping')
  const { resolveVenueTasteTarget, VENUE_TASTE_ARCHETYPES } = venueMap
  const requiredArchetypes = ['classic_luxury','warm_mediterranean','young_nightlife','fine_dining','event_wedding',
    'beach_bar','hotel_bar','premium_neighborhood_bar','not_pretentious','high_end_accessible']
  assert('all venue archetypes present', requiredArchetypes.every(a => VENUE_TASTE_ARCHETYPES[a]),
    requiredArchetypes.filter(a => !VENUE_TASTE_ARCHETYPES[a]).join(','))

  const luxury = resolveVenueTasteTarget('a classic luxury hotel bar, refined and timeless')
  assert('luxury text matches archetype(s)', luxury.matched.length >= 1)
  assert('luxury returns a target range object', luxury.target_taste_profile_range && typeof luxury.target_taste_profile_range === 'object')
  assert('luxury range body has min/max decimals', luxury.target_taste_profile_range.body && typeof luxury.target_taste_profile_range.body.min === 'number')
  assert('luxury provides beverage direction', luxury.beverage_directions.length >= 1)

  const med = resolveVenueTasteTarget(['warm Mediterranean', 'aperitivo', 'citrus'])
  assert('array input matches Mediterranean', med.matched.some(m => m.key === 'warm_mediterranean'))
  assert('Mediterranean leans into acidity range', med.target_taste_profile_range.acidity?.min >= 2.0)

  const noMatch = resolveVenueTasteTarget('')
  assert('empty venue language → no matches', noMatch.matched.length === 0)
  assert('empty venue language → null range (no fabrication)', noMatch.target_taste_profile_range.acidity === null)

  // ── 5. Venue beverage context adapter ──────────────────────────────────────
  section('Venue beverage context adapter')
  const { buildVenueBeverageContext } = beverageCtx

  const full = buildVenueBeverageContext({
    venueDNA: {
      hospitalityStyle: ['high-end but accessible'],
      businessTypeSignals: ['cocktail bar'],
      ownerPriorities: ['quality without pretension'],
      emotionalDrivers: ['warmth', 'craft pride'],
      guestExperienceSignals: ['regulars who want to feel at home'],
      beverageSignals: ['loves a good Negroni'],
      serviceSignals: ['fast but personal'],
      operationalPainPoints: ['small back bar, limited prep space'],
      confidence: { identity: 60, commercial: 40 },
      summary: 'A premium but approachable neighborhood cocktail bar.',
    },
    venueProfile: { venue_type: 'cocktail bar', price_tier: 'premium' },
  })
  const ctx = full.venue_beverage_context
  assert('returns venue_beverage_context object', ctx && typeof ctx === 'object')
  const requiredCtxFields = ['venue_type','owner_belief_summary','emotional_register','target_guest_summary',
    'price_positioning','service_style','operational_constraints','target_taste_profile_range',
    'recommended_beverage_direction','explanation_basis']
  assert('all contract fields present', requiredCtxFields.every(f => f in ctx),
    requiredCtxFields.filter(f => !(f in ctx)).join(','))
  assert('venue_type populated from profile', ctx.venue_type === 'cocktail bar')
  assert('price_positioning from profile', ctx.price_positioning === 'premium')
  assert('owner_belief_summary populated', typeof ctx.owner_belief_summary === 'string' && ctx.owner_belief_summary.length > 0)
  assert('operational_constraints is array', Array.isArray(ctx.operational_constraints) && ctx.operational_constraints.length > 0)
  assert('target range produced from DNA language', ctx.target_taste_profile_range && typeof ctx.target_taste_profile_range === 'object')
  assert('recommended_beverage_direction present', typeof ctx.recommended_beverage_direction === 'string')
  assert('explanation_basis carries matched archetypes', Array.isArray(ctx.explanation_basis.matched_archetypes))
  assert('explanation_basis records data_basis', typeof ctx.explanation_basis.data_basis === 'string')
  assert('full DNA → no missing fields', ctx._missing_fields.length === 0, ctx._missing_fields.join(','))

  // Missing-data safety
  const emptyCtx = buildVenueBeverageContext({}).venue_beverage_context
  assert('empty input still returns all fields', requiredCtxFields.every(f => f in emptyCtx))
  assert('empty input marks venue_type missing', emptyCtx._missing_fields.includes('venue_type'))
  assert('empty input records explicit assumptions', emptyCtx._assumptions.length > 0)
  assert('empty input does NOT fabricate venue_type', emptyCtx.venue_type === null)
  assert('empty input target range is all null', TASTE_DIMENSION_KEYS.every(k => emptyCtx.target_taste_profile_range[k] === null))
  assert('null args handled safely', !!buildVenueBeverageContext({ venueDNA: null, venueProfile: null }).venue_beverage_context)

  // Partial DNA (price inferred from language, type still unknown)
  const partial = buildVenueBeverageContext({
    venueDNA: { hospitalityStyle: ['luxury', 'fine dining'] },
  }).venue_beverage_context
  assert('partial DNA infers price positioning', partial.price_positioning === 'luxury')
  assert('partial DNA still flags venue_type missing', partial._missing_fields.includes('venue_type'))

  // ── 6. Kosher remains default-off (regression guard) ───────────────────────
  section('Kosher remains default-off (existing knowledge base)')
  const { buildKnowledgeContext } = knowledgeBase
  const neutral = buildKnowledgeContext('make a refreshing summer gin drink', {})
  assert('neutral prompt does NOT inject kosher rules', !/kosher/i.test(neutral))
  const kosherFlagged = buildKnowledgeContext('make a refreshing summer gin drink', { kosherRequirement: 'kosher' })
  assert('explicit kosher flag DOES inject kosher rules', /kosher/i.test(kosherFlagged))
  const beachContext = buildVenueBeverageContext({ venueDNA: { hospitalityStyle: ['beach bar'] } }).venue_beverage_context
  assert('venue adapter never emits kosher by default', !/kosher/i.test(JSON.stringify(beachContext)))

  // ── 7. Prompt block formatter (compact, honest) ────────────────────────────
  section('Venue beverage prompt block formatter')
  const { formatVenueBeveragePromptBlock } = beverageCtx

  assert('formatter returns "" for null', formatVenueBeveragePromptBlock(null) === '')
  assert('formatter returns "" for empty venue data', formatVenueBeveragePromptBlock(buildVenueBeverageContext({})) === '')

  const richBlock = formatVenueBeveragePromptBlock(full)
  assert('formatter produces a block for rich DNA', richBlock.length > 0)
  assert('block leads with venue beverage context header', /venue beverage context/i.test(richBlock))
  assert('block includes venue type', richBlock.includes('cocktail bar'))
  assert('block includes price positioning', /price positioning/i.test(richBlock))
  assert('block includes target taste range line', /target taste profile range/i.test(richBlock))
  assert('block instructs not to show guest a technical explanation', /do not show the guest/i.test(richBlock))
  assert('block stays compact (< 1200 chars)', richBlock.length < 1200, `len=${richBlock.length}`)
  assert('block does NOT paste full classic tables', !/old fashioned|negroni/i.test(richBlock))

  // Honest handling of missing fields
  const partialBlock = formatVenueBeveragePromptBlock(
    buildVenueBeverageContext({ venueDNA: { hospitalityStyle: ['luxury', 'fine dining'] } })
  )
  assert('partial block marks unknowns honestly', /unknown \(do not invent\)/i.test(partialBlock))
  assert('partial block surfaces assumptions', /assumptions in effect/i.test(partialBlock))

  // ── 7b. Slim taste-target block + resolver (Phase 5 — CI/Omer) ─────────────
  section('Slim taste-target block + CI/Omer resolver (Phase 5)')
  const { formatTasteTargetPromptBlock, resolveCiTasteTarget } = beverageCtx

  // resolver: real venue language → a range with present dimensions
  const tt = resolveCiTasteTarget({ venueDNA: { hospitalityStyle: ['warm Mediterranean', 'high-end but accessible'] } })
  assert('resolver returns a target with dimensions', !!tt && Array.isArray(tt.dimensions) && tt.dimensions.length > 0)
  assert('resolver: no-data → null (never fabricates)', resolveCiTasteTarget({}) === null)
  assert('resolver: null args → null', resolveCiTasteTarget({ venueDNA: null, venueProfile: null }) === null)

  const slim = formatTasteTargetPromptBlock(tt.range, { direction: tt.direction })
  assert('slim block is non-empty for a real range', slim.length > 0)
  assert('slim block is compact (<= 600 chars)', slim.length <= 600, `len=${slim.length}`)
  assert('slim block has the target taste range line', /Target taste range:/.test(slim))
  assert('slim block uses 0.0–5.0 framing', /0\.0–5\.0/.test(slim))
  assert('slim block tells model NOT to return a taste profile', /do NOT return a taste profile/i.test(slim))
  // does NOT duplicate the full Omer venue-identity block
  assert('slim block omits venue identity fields', !/venue type|price positioning|emotional register|target guest|service style/i.test(slim))
  assert('slim block has no research/classic tables', !/old fashioned|negroni|ingredient impact|micro/i.test(slim))
  // no fake zeros: the range line must not contain a bare "0" dimension value
  const rangeLine = (slim.split('Target taste range:')[1] || '').split('\n')[0]
  assert('slim block range line has no bare-zero values', !/\b0\b(?!\.)/.test(rangeLine))
  // empty / null inputs → '' (never fabricate)
  assert('formatTasteTargetPromptBlock(null) → ""', formatTasteTargetPromptBlock(null) === '')
  assert('formatTasteTargetPromptBlock({}) → ""', formatTasteTargetPromptBlock({}) === '')
  assert('formatTasteTargetPromptBlock(all-null range) → ""', formatTasteTargetPromptBlock({ acidity: null, sweetness: null }) === '')

  // ── 8. Cocktail Lab injection (flag-gated, read-only) ──────────────────────
  section('Cocktail Lab prompt injection (flag-gated)')
  const { buildCocktailPrompt } = agent
  const { isVenueBeverageContextEnabled } = flags

  const basePromptArgs = {
    agentPrompt: 'a refreshing low-abv aperitivo for warm afternoons',
    form: {}, approvedCocktails: [], cocktailDrafts: [], menuAnalysis: {},
  }
  const venueDNAFixture = {
    hospitalityStyle: ['high-end but accessible', 'warm Mediterranean'],
    businessTypeSignals: ['neighborhood cocktail bar'],
    ownerPriorities: ['quality without pretension'],
    emotionalDrivers: ['warmth'],
    guestExperienceSignals: ['regulars who feel at home'],
    serviceSignals: ['fast but personal'],
    operationalPainPoints: ['small back bar'],
  }

  // helpers to toggle the flag deterministically in-process
  function setFlag(on) { globalThis.__HESTIA_FLAGS__ = { ENABLE_VENUE_BEVERAGE_CONTEXT: on } }
  function clearFlag() { delete globalThis.__HESTIA_FLAGS__ }

  // baseline: no venue params, flag off
  clearFlag()
  const baseline = buildCocktailPrompt(basePromptArgs)
  assert('flag defaults OFF', isVenueBeverageContextEnabled() === false)

  // flag OFF + venueDNA supplied → identical to baseline (venue data ignored)
  const offWithVenue = buildCocktailPrompt({ ...basePromptArgs, venueDNA: venueDNAFixture })
  assert('flag OFF: venue data does not change the prompt', offWithVenue === baseline)
  assert('flag OFF: no venue block injected', !/venue beverage context/i.test(offWithVenue))

  // flag ON + venueDNA → compact block injected, rest of prompt preserved
  setFlag(true)
  assert('flag ON via global override', isVenueBeverageContextEnabled() === true)
  const onWithVenue = buildCocktailPrompt({ ...basePromptArgs, venueDNA: venueDNAFixture })
  assert('flag ON: venue block injected', /venue beverage context/i.test(onWithVenue))
  assert('flag ON: prompt grew by the block only', onWithVenue.length > baseline.length)
  assert('flag ON: original schema contract preserved', onWithVenue.includes('"ingredientsMl"') && onWithVenue.includes('"whyThisDeservesMenuSpace"'))
  assert('flag ON: manager prompt still present', onWithVenue.includes('Manager prompt:'))

  // flag ON but NO venue data → behaves exactly as before
  const onNoVenue = buildCocktailPrompt(basePromptArgs)
  assert('flag ON + no venue data: identical to baseline', onNoVenue === baseline)

  // kosher stays default-off through the injected path. Note: the baseline Cocktail
  // Lab prompt already contains a neutral "Kosher Requirement:" form line (pre-existing),
  // so we assert the *injected venue block itself* adds no kosher content, and that the
  // injection did not pull in the knowledge-base KOSHER_COCKTAIL_RULES.
  const beachBlock = formatVenueBeveragePromptBlock(
    buildVenueBeverageContext({ venueDNA: { hospitalityStyle: ['beach bar'] } })
  )
  assert('flag ON: injected venue block adds no kosher content', !/kosher/i.test(beachBlock))
  const onBeach = buildCocktailPrompt({ ...basePromptArgs, venueDNA: { hospitalityStyle: ['beach bar'] } })
  assert('flag ON: KB kosher rules not injected (no certification rule text)', !/kosher-certified|supervising authority|KOSHER COCKTAIL/i.test(onBeach))
  clearFlag()

  // ── 9. Event Cocktail Menu Builder untouched (regression guard) ────────────
  section('Event Cocktail Menu Builder untouched')
  const eventSrc = readFileSync(resolve(ROOT, 'src/services/eventCocktailMenuService.js'), 'utf8')
  assert('event service does not import beverageContextService', !eventSrc.includes('beverageContextService'))
  assert('event service has no venue_beverage_context', !eventSrc.includes('venue_beverage_context'))
  assert('event service does not read the venue flag', !eventSrc.includes('ENABLE_VENUE_BEVERAGE_CONTEXT'))

  // ── Results ────────────────────────────────────────────────────────────────
  console.log(`\n──────────────────────────────────────────`)
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`)
  if (failed > 0) {
    console.log(`\x1b[31m[FAIL] ${failed} test(s) failed — fix before committing.\x1b[0m\n`)
    process.exit(1)
  } else {
    console.log(`\x1b[32m[PASS] All tests passed.\x1b[0m\n`)
    process.exit(0)
  }
}
