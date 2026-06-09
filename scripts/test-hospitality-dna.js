#!/usr/bin/env node
/**
 * Deterministic tests for eventHospitalityDNA.js
 *
 * Tests subtype normalization, signal classification, RSVP handling,
 * kosher/dietary detection, VIP/accessibility, and backward compatibility.
 *
 * Run: node scripts/test-hospitality-dna.js
 * No test framework required. Exits 0 on pass, 1 on any failure.
 *
 * Consistent with hestia-check.js validation style.
 */

// ── ESM shim via dynamic import ────────────────────────────────────────────────
import('../src/features/events/utils/eventHospitalityDNA.js')
  .then(({ buildHospitalityDNA }) => runTests(buildHospitalityDNA))
  .catch(err => {
    console.error('\n[FAIL] Could not import eventHospitalityDNA.js:', err.message)
    process.exit(1)
  })

function runTests(buildHospitalityDNA) {
  let passed = 0
  let failed = 0

  function assert(label, condition, detail) {
    if (condition) {
      console.log(`  \x1b[32m✓\x1b[0m  ${label}`)
      passed++
    } else {
      console.log(`  \x1b[31m✗\x1b[0m  ${label}${detail ? ` — ${detail}` : ''}`)
      failed++
    }
  }

  function section(name) {
    console.log(`\n\x1b[36m── ${name}\x1b[0m`)
  }

  console.log('\n\x1b[1mHESTIA Hospitality DNA — Deterministic Tests\x1b[0m\n')

  // ── Helpers ────────────────────────────────────────────────────────────────
  function makeEvent(overrides = {}) {
    return { id: 'evt-test', name: 'Test Event', event_type: 'other', ...overrides }
  }

  // ── 1. Null safety ─────────────────────────────────────────────────────────
  section('Null safety')
  assert('returns null when event is null',     buildHospitalityDNA({ event: null, guests: [] }) === null)
  assert('returns null when event is undefined', buildHospitalityDNA({ event: undefined }) === null)

  // ── 2. Event type normalization ────────────────────────────────────────────
  section('Event type normalization')

  const wedding    = buildHospitalityDNA({ event: makeEvent({ event_type: 'wedding' }), guests: [] })
  assert('wedding → subtype=wedding',            wedding.eventSubtype === 'wedding')
  assert('wedding → high confidence',            wedding.subtypeConfidence === 'high')
  assert('wedding → not derived',                wedding.subtypeIsDerived === false)

  const luxWedding = buildHospitalityDNA({ event: makeEvent({ event_type: 'wedding', notes: 'A luxury celebration' }), guests: [] })
  assert('luxury notes → subtype=luxury_wedding', luxWedding.eventSubtype === 'luxury_wedding')
  assert('luxury_wedding → isDerived=true',       luxWedding.subtypeIsDerived === true)
  assert('luxury_wedding → medium confidence',    luxWedding.subtypeConfidence === 'medium')

  const corp       = buildHospitalityDNA({ event: makeEvent({ event_type: 'corporate' }), guests: [] })
  assert('corporate → subtype=corporate',        corp.eventSubtype === 'corporate')

  const exec       = buildHospitalityDNA({ event: makeEvent({ event_type: 'corporate', name: 'Board of Directors Meeting' }), guests: [] })
  assert('executive keywords → executive_event', exec.eventSubtype === 'executive_event')
  assert('executive_event → isDerived=true',     exec.subtypeIsDerived === true)

  // ── 3. Brand launch inference ──────────────────────────────────────────────
  section('Brand launch inference')

  const brandLaunch = buildHospitalityDNA({ event: makeEvent({ event_type: 'corporate', name: 'Product Launch Evening' }), guests: [] })
  assert('brand launch → brand_launch',           brandLaunch.eventSubtype === 'brand_launch')

  const luxBrand    = buildHospitalityDNA({ event: makeEvent({ event_type: 'corporate', name: 'Luxury Brand Launch' }), guests: [] })
  assert('luxury brand launch → luxury_brand_launch', luxBrand.eventSubtype === 'luxury_brand_launch')

  // ── 4. Wine event handling ─────────────────────────────────────────────────
  section('Wine event handling')

  const wineBar    = buildHospitalityDNA({ event: makeEvent({ event_type: 'bar_event', notes: 'Wine tasting evening' }), guests: [] })
  assert('wine tasting in bar_event → wine_event', wineBar.eventSubtype === 'wine_event')
  assert('wine_event has hospitalityRead',         !!wineBar.hospitalityRead?.guestExpectation)
  assert('wine_event cocktailPriorities present',  Array.isArray(wineBar.cocktailPriorities) && wineBar.cocktailPriorities.length > 0)

  // ── 5. Desert event handling ───────────────────────────────────────────────
  section('Desert event handling')

  const desert     = buildHospitalityDNA({ event: makeEvent({ event_type: 'private', name: 'Desert Dinner', location: 'The desert dunes' }), guests: [] })
  assert('desert location → desert_event',         desert.eventSubtype === 'desert_event')
  assert('desert_event has operationalPriorities', desert.operationalPriorities.length > 0)
  assert('desert_event isDerived=true',            desert.subtypeIsDerived === true)

  // ── 6. Kosher detection — only from real data ──────────────────────────────
  section('Kosher detection (no Israel assumption)')

  const noKosher   = buildHospitalityDNA({ event: makeEvent({ event_type: 'wedding' }), guests: [] })
  assert('no kosher flag without evidence',        noKosher.guestProfile.hasKosher === false)

  const kosherNote = buildHospitalityDNA({ event: makeEvent({ notes: 'This is a kosher event' }), guests: [] })
  assert('kosher from event notes',                kosherNote.guestProfile.hasKosher === true)
  const kosherSig  = kosherNote.signalProvenance.find(s => s.evidence?.toLowerCase().includes('kosher'))
  assert('kosher signal source is event_text',     kosherSig?.source === 'event_text')
  assert('kosher signal classification=fact',      kosherSig?.classification === 'fact')

  const kosherGuest = buildHospitalityDNA({
    event: makeEvent({ event_type: 'wedding' }),
    guests: [{ rsvp_status: 'confirmed', dietary: 'Kosher' }],
  })
  assert('kosher from guest dietary field',        kosherGuest.guestProfile.hasKosher === true)
  const guestSig   = kosherGuest.signalProvenance.find(s => s.evidence?.toLowerCase().includes('kosher'))
  assert('kosher guest signal source is guest_data', guestSig?.source === 'guest_data')

  // No Israel location assumption
  const israelEvent = buildHospitalityDNA({ event: makeEvent({ location: 'Tel Aviv, Israel' }), guests: [] })
  assert('Israel location does NOT imply kosher',  israelEvent.guestProfile.hasKosher === false)

  // ── 7. Dietary / accessibility guest signals ───────────────────────────────
  section('Dietary and accessibility guest signals')

  const dietary    = buildHospitalityDNA({
    event:  makeEvent({ event_type: 'corporate' }),
    guests: [
      { rsvp_status: 'confirmed', dietary: 'Vegan' },
      { rsvp_status: 'confirmed', dietary: 'Gluten-free' },
      { rsvp_status: 'confirmed' },
    ],
  })
  assert('dietary flag set from guest records',    dietary.guestProfile.hasDietary === true)
  const dietSig = dietary.signalProvenance.find(s => s.source === 'guest_data' && s.classification === 'fact')
  assert('dietary signal classification=fact',     !!dietSig)

  const access     = buildHospitalityDNA({
    event:  makeEvent(),
    guests: [{ rsvp_status: 'confirmed', accessibility_notes: 'Wheelchair user' }],
  })
  assert('accessibility flag from guest field',    access.guestProfile.hasAccessibility === true)
  assert('accessibilityChecks populated',          access.accessibilityChecks.length > 0)
  assert('accessibility check classification=fact',access.accessibilityChecks[0]?.classification === 'fact')

  // ── 8. VIP handling ────────────────────────────────────────────────────────
  section('VIP handling')

  const noVIP      = buildHospitalityDNA({ event: makeEvent({ event_type: 'corporate' }), guests: [] })
  assert('no VIP flag without guest data',          noVIP.guestProfile.hasVIP === false)

  const vipEvent   = buildHospitalityDNA({
    event:  makeEvent({ event_type: 'private' }),
    guests: [{ rsvp_status: 'confirmed', vip: true }],
  })
  assert('VIP flag set from guest.vip field',       vipEvent.guestProfile.hasVIP === true)
  const vipSig = vipEvent.signalProvenance.find(s => s.source === 'guest_data' && s.evidence?.includes('VIP'))
  assert('VIP signal classification=fact',          vipSig?.classification === 'fact')

  const vipTextOnly = buildHospitalityDNA({
    event:  makeEvent({ event_type: 'private', name: 'VIP Dinner' }),
    guests: [],
  })
  assert('VIP in event name → vip_event subtype',   vipTextOnly.eventSubtype === 'vip_event')
  assert('vip_event subtype is derived',             vipTextOnly.subtypeIsDerived === true)

  // ── 9. RSVP status breakdown ───────────────────────────────────────────────
  section('RSVP status breakdown')

  const rsvpEvent  = buildHospitalityDNA({
    event:  makeEvent({ event_type: 'wedding', expected_guests: 80 }),
    guests: [
      { rsvp_status: 'confirmed' }, { rsvp_status: 'confirmed' }, { rsvp_status: 'confirmed' },
      { rsvp_status: 'pending' },
      { rsvp_status: 'declined' },
      { rsvp_status: 'unknown' },
    ],
  })
  assert('rsvpBreakdown.confirmed = 3',             rsvpEvent.rsvpBreakdown.confirmed === 3)
  assert('rsvpBreakdown.pending = 1',               rsvpEvent.rsvpBreakdown.pending   === 1)
  assert('rsvpBreakdown.declined = 1',              rsvpEvent.rsvpBreakdown.declined  === 1)
  assert('rsvpBreakdown.unknown = 1',               rsvpEvent.rsvpBreakdown.unknown   === 1)
  assert('rsvpBreakdown.total = 6',                 rsvpEvent.rsvpBreakdown.total     === 6)
  assert('expectedVsConfirmedGap = 77',             rsvpEvent.rsvpBreakdown.expectedVsConfirmedGap === 77)

  // ── 10. No guests ──────────────────────────────────────────────────────────
  section('No guests')

  const noGuests   = buildHospitalityDNA({ event: makeEvent({ event_type: 'corporate' }), guests: [] })
  assert('hasVIP=false with no guests',             noGuests.guestProfile.hasVIP === false)
  assert('hasKosher=false with no guests',          noGuests.guestProfile.hasKosher === false)
  assert('rsvpBreakdown.total = 0',                 noGuests.rsvpBreakdown.total === 0)
  assert('guestProfile.activeSignals is array',     Array.isArray(noGuests.guestProfile.activeSignals))

  // ── 11. Unsupported event types ────────────────────────────────────────────
  section('Unsupported / other event types')

  const weirdType  = buildHospitalityDNA({ event: makeEvent({ event_type: 'unknown_future_type' }), guests: [] })
  assert('unknown event type falls back gracefully', weirdType !== null)
  assert('unknown type has experienceArchetype',     !!weirdType.experienceArchetype)
  assert('unknown type has hospitalityRead',         !!weirdType.hospitalityRead)

  const otherType  = buildHospitalityDNA({ event: makeEvent({ event_type: 'other' }), guests: [] })
  assert('other type has hospitalityRead',           !!otherType.hospitalityRead?.guestExpectation)

  // ── 12. Invalid / overnight timing ────────────────────────────────────────
  section('Invalid and overnight timing')

  const noTimes    = buildHospitalityDNA({ event: makeEvent(), guests: [] })
  assert('no timing → pressurePoints includes start-time warning', noTimes.servicePace.pressurePoints.some(p => p.includes('Start time not set')))
  assert('durationHours = null when times missing',  noTimes.servicePace.durationHours === null)

  const overnightE = buildHospitalityDNA({
    event: makeEvent({ start_time: '23:00', end_time: '03:00' }),
    guests: [],
  })
  // End before start — diff is negative; durationHours should be null (not negative)
  assert('overnight/invalid timing → durationHours null', overnightE.servicePace.durationHours === null)

  const longEvent  = buildHospitalityDNA({
    event: makeEvent({ start_time: '14:00', end_time: '22:00' }),
    guests: [],
  })
  assert('8h event → durationHours = 8',            longEvent.servicePace.durationHours === 8)
  assert('long event adds duration pressurePoint',   longEvent.servicePace.pressurePoints.some(p => p.includes('Long-duration')))

  // ── 13. Backward compatibility ─────────────────────────────────────────────
  section('Backward compatibility — original fields preserved')

  const base       = buildHospitalityDNA({ event: makeEvent({ event_type: 'wedding' }), guests: [] })
  assert('experienceArchetype present',              typeof base.experienceArchetype === 'string')
  assert('servicePhilosophy present',                typeof base.servicePhilosophy === 'string')
  assert('occasionTone present',                     typeof base.occasionTone === 'string')
  assert('firstImpressionProtocol present',          typeof base.firstImpressionProtocol === 'string')
  assert('guestCarePriority present',                typeof base.guestCarePriority === 'string')
  assert('scalePersona.scale present',               !!base.scalePersona?.scale)
  assert('servicePace.paceLabel present',            !!base.servicePace?.paceLabel)
  assert('guestProfile.activeSignals is array',      Array.isArray(base.guestProfile?.activeSignals))
  assert('guestProfile.confirmedCount is number',    typeof base.guestProfile?.confirmedCount === 'number')

  // ── 14. New structured fields present ─────────────────────────────────────
  section('New structured fields')

  assert('normalizedEventType present',              typeof base.normalizedEventType === 'string')
  assert('eventSubtype present',                     typeof base.eventSubtype === 'string')
  assert('subtypeConfidence present',                !!base.subtypeConfidence)
  assert('hospitalityRead.guestExpectation present', !!base.hospitalityRead?.guestExpectation)
  assert('hospitalityRead.emotionalRisk present',    !!base.hospitalityRead?.emotionalRisk)
  assert('hospitalityRead.operationalPriority present', !!base.hospitalityRead?.operationalPriority)
  assert('hospitalityRead.toConfirm present',        !!base.hospitalityRead?.toConfirm)
  assert('guestExpectations is array',               Array.isArray(base.guestExpectations))
  assert('emotionalRisks is array',                  Array.isArray(base.emotionalRisks))
  assert('operationalPriorities is array',           Array.isArray(base.operationalPriorities))
  assert('zoharQuestions is array',                  Array.isArray(base.zoharQuestions))
  assert('unknownsToConfirm is array',               Array.isArray(base.unknownsToConfirm))
  assert('cocktailPriorities is array',              Array.isArray(base.cocktailPriorities))
  assert('foodPriorities is array',                  Array.isArray(base.foodPriorities))
  assert('eventArchitectureRisks is array',          Array.isArray(base.eventArchitectureRisks))
  assert('accessibilityChecks is array',             Array.isArray(base.accessibilityChecks))
  assert('serviceRecoveryWatchpoints is array',      Array.isArray(base.serviceRecoveryWatchpoints))
  assert('downstreamGuidance.bar is array',          Array.isArray(base.downstreamGuidance?.bar))
  assert('downstreamGuidance.kitchen is array',      Array.isArray(base.downstreamGuidance?.kitchen))
  assert('signalProvenance is array',                Array.isArray(base.signalProvenance))
  assert('rsvpBreakdown present',                    !!base.rsvpBreakdown)

  // Signal objects have required provenance fields
  const sig = base.guestExpectations[0]
  if (sig) {
    assert('signal has recommendation',              typeof sig.recommendation === 'string')
    assert('signal has source',                      typeof sig.source === 'string')
    assert('signal has confidence',                  typeof sig.confidence === 'string')
    assert('signal has isDerived',                   typeof sig.isDerived === 'boolean')
    assert('signal has classification',              typeof sig.classification === 'string')
  }

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
