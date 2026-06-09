/**
 * Event Hospitality DNA — structured intelligence layer for HESTIA events.
 *
 * Derives the hospitality character, service philosophy, guest experience archetype,
 * care priorities, emotional risks, and operational guidance from actual event data.
 *
 * Pure and deterministic. No AI calls. No invented defaults. All fields null-safe.
 * Backward-compatible: all original output fields are preserved unchanged.
 *
 * Classification vocabulary:
 *   fact        — confirmed from real event or guest data fields
 *   observation — detected/inferred from real text (name, notes, host_message, location)
 *   inference   — derived from event-type hospitality knowledge, not raw data
 *   unknown     — required information that is missing or unconfirmable
 */

// ── Signal builder ─────────────────────────────────────────────────────────────
// All structured recommendations carry provenance so consumers can display
// confidence levels and distinguish what the system knows vs. infers.

function signal(recommendation, { source, evidence, confidence = 'medium', isDerived = false, classification = 'inference' } = {}) {
  return { recommendation, source, evidence, confidence, isDerived, classification }
}

// ── Subtype detection ─────────────────────────────────────────────────────────
// Uses real event metadata only. If a subtype is inferred from text it is
// marked isDerived=true. Never invents a subtype from guesses.

const LUXURY_RE      = /luxury|prestige|premium|five.?star|bespoke|exclusive|high.?end/i
const EXECUTIVE_RE   = /executive|board|c.?suite|leadership|directors|senior\s+management/i
const BRAND_RE       = /brand|launch|product\s+launch|reveal|unveil|activation/i
const CHARITY_RE     = /charity|gala|fund.?rais|auction|cause|non.?profit|donation/i
const VIP_RE         = /\bvip\b|celebrity|exclusive\s+list|private\s+list/i
const WINE_RE        = /wine|sommelier|tasting|vintage|cellar|winery|vineyard/i
const COCKTAIL_RE    = /cocktail\s+(event|reception|night|evening)|mixology\s+event/i
const DESERT_RE      = /desert|dunes|sand|wadi|outdoor.{0,20}(wild|nature|fire)|bonfire/i
const HOTEL_RE       = /hotel|ballroom|convention|banquet\s+hall|conference\s+room/i
const RESORT_RE      = /resort|beach\s+(club|party|dinner)|rooftop|pool\s+(party|event)|garden/i
const PRIVATE_DINNER_RE = /private\s+dinner|intimate\s+dinner|supper\s+club|tasting\s+menu|chef.?table/i

function detectSubtype(event) {
  const type = event.event_type || 'other'
  const text = [
    event.name         || '',
    event.notes        || '',
    event.host_message || '',
    event.location     || '',
  ].join(' ')

  const isLuxury       = LUXURY_RE.test(text)
  const isExecutive    = EXECUTIVE_RE.test(text)
  const isBrand        = BRAND_RE.test(text)
  const isCharity      = CHARITY_RE.test(text)
  const isVIP          = VIP_RE.test(text)
  const isWine         = WINE_RE.test(text)
  const isCocktail     = COCKTAIL_RE.test(text)
  const isDesert       = DESERT_RE.test(text)
  const isHotel        = HOTEL_RE.test(text)
  const isResort       = RESORT_RE.test(text)
  const isPrivDinner   = PRIVATE_DINNER_RE.test(text)

  if (type === 'wedding') {
    if (isLuxury) return { subtype: 'luxury_wedding', confidence: 'medium', isDerived: true, evidence: 'Luxury/premium language detected in event metadata' }
    return { subtype: 'wedding', confidence: 'high', isDerived: false, evidence: 'Event type field is wedding' }
  }

  if (type === 'corporate') {
    if (isCharity) return { subtype: 'charity_gala', confidence: 'medium', isDerived: true, evidence: 'Charity/gala language detected' }
    if (isExecutive) return { subtype: 'executive_event', confidence: 'medium', isDerived: true, evidence: 'Executive/board language detected' }
    if (isBrand && isLuxury) return { subtype: 'luxury_brand_launch', confidence: 'medium', isDerived: true, evidence: 'Luxury brand/launch language detected' }
    if (isBrand) return { subtype: 'brand_launch', confidence: 'medium', isDerived: true, evidence: 'Brand/launch language detected' }
    return { subtype: 'corporate', confidence: 'high', isDerived: false, evidence: 'Event type field is corporate' }
  }

  if (type === 'private') {
    if (isVIP) return { subtype: 'vip_event', confidence: 'medium', isDerived: true, evidence: 'VIP language detected' }
    if (isPrivDinner) return { subtype: 'private_dinner', confidence: 'medium', isDerived: true, evidence: 'Private dinner language detected' }
    if (isDesert) return { subtype: 'desert_event', confidence: 'medium', isDerived: true, evidence: 'Desert/outdoor environment language detected' }
    if (isResort) return { subtype: 'resort_event', confidence: 'medium', isDerived: true, evidence: 'Resort/outdoor setting language detected' }
    if (isHotel) return { subtype: 'hotel_event', confidence: 'medium', isDerived: true, evidence: 'Hotel/ballroom context detected' }
    return { subtype: 'private', confidence: 'high', isDerived: false, evidence: 'Event type field is private' }
  }

  if (type === 'bar_event') {
    if (isWine) return { subtype: 'wine_event', confidence: 'medium', isDerived: true, evidence: 'Wine/sommelier language detected' }
    if (isCocktail) return { subtype: 'cocktail_event', confidence: 'medium', isDerived: true, evidence: 'Cocktail event language detected' }
    return { subtype: 'bar_event', confidence: 'high', isDerived: false, evidence: 'Event type field is bar_event' }
  }

  // 'other' type — attempt text inference, mark confidence low
  if (isCharity) return { subtype: 'charity_gala',    confidence: 'low', isDerived: true, evidence: 'Charity/gala language in other-type event' }
  if (isVIP)     return { subtype: 'vip_event',        confidence: 'low', isDerived: true, evidence: 'VIP language in other-type event' }
  if (isWine)    return { subtype: 'wine_event',       confidence: 'low', isDerived: true, evidence: 'Wine/tasting language in other-type event' }
  if (isDesert)  return { subtype: 'desert_event',     confidence: 'low', isDerived: true, evidence: 'Desert/outdoor language in other-type event' }
  if (isHotel)   return { subtype: 'hotel_event',      confidence: 'low', isDerived: true, evidence: 'Hotel context detected in other-type event' }

  return { subtype: 'other', confidence: 'high', isDerived: false, evidence: 'No matching subtype detected' }
}

// ── DNA knowledge per subtype ─────────────────────────────────────────────────
// Source: HESTIA Hospitality Intelligence — Event Hospitality DNA.
// Each entry: hospitalityRead, guestExpectations, emotionalRisks,
//             operationalPriorities, cocktailPriorities, foodPriorities,
//             serviceRecoveryWatchpoints.

const SUBTYPE_DNA = {
  wedding: {
    archetype:               'Celebration & Ceremony',
    philosophy:              'Every guest is a witness to a milestone. Service is invisible but precise — the event carries the emotion; hospitality holds the structure.',
    pace:                    'Ceremonial',
    firstImpressionProtocol: 'Welcome drink in hand before the first guest crosses the threshold.',
    guestCarePriority:       'VIP table attention, elderly accessibility, dietary compliance across a wide guest range, children if present.',
    occasionTone:            'celebratory',
    hospitalityRead: {
      guestExpectation:   'Warmth, celebration, emotional flow, inclusion — every guest feels part of the milestone.',
      emotionalRisk:      'Bar queues, slow food before speeches, or visible dietary friction break the emotional arc.',
      operationalPriority:'Timeline discipline: ceremony-to-party handoffs, bar capacity, and welcome drink readiness.',
      toConfirm:          'VIP table positions, dietary map, speech timing, and couple preferences.',
    },
    guestExpectations: [
      'Warmth and emotional hospitality — guests feel part of the celebration.',
      'Generous, crowd-pleasing service that includes every generation.',
      'Smooth, choreographed service flow that protects the emotional arc.',
    ],
    emotionalRisks: [
      'Bar queue at arrival — degrades the first impression before the ceremony begins.',
      'Slow food service before speeches — creates tension and restless guests.',
      'Visible dietary friction — guest feeling like a burden undermines inclusion.',
    ],
    operationalPriorities: [
      'Welcome drink ready before the first guest arrives.',
      'Bar capacity matched to arrival peak — pre-batch where menu allows.',
      'Dietary map confirmed with kitchen before service begins.',
    ],
    cocktailPriorities: [
      'Welcome drink is non-negotiable — must be in hand immediately on arrival.',
      'Crowd-pleasing menu with broad appeal across age groups.',
      'Minimal complex builds — service speed is the hospitality act.',
    ],
    foodPriorities: [
      'Broad dietary coverage — wide guest range requires careful mapping.',
      'Speech timing dictates kitchen pacing — confirm sequence in pre-brief.',
      'Substance across a long service window: welcome, dinner, late-night.',
    ],
    serviceRecoveryWatchpoints: [
      'Bar queue exceeding 5 minutes — open secondary station immediately.',
      'Dietary requirement missed — own it privately, resolve before main course.',
      'Speech overrun — hold kitchen on cue; do not serve during toasts.',
    ],
  },

  luxury_wedding: {
    archetype:               'Seamless Luxury Wedding',
    philosophy:              'Perfection should feel effortless and private. Precision is the service; invisibility is the craft.',
    pace:                    'Choreographed',
    firstImpressionProtocol: 'Premium sparkling served at the arrival point. VIP route pre-designated and staff briefed.',
    guestCarePriority:       'Invisible service, VIP arrival choreography, dietary precision, and zero-visible-effort aesthetic.',
    occasionTone:            'celebratory',
    hospitalityRead: {
      guestExpectation:   'Seamless choreography, complete privacy, personalization, polish — luxury as grace, not excess.',
      emotionalRisk:      'Over-staffed visible fuss, obvious VIP favoritism, or any moment that breaks the "effortless" illusion.',
      operationalPriority:'Arrival choreography, VIP routes, and premium service readiness in every detail.',
      toConfirm:          'VIP guest list, confirmed dietary requirements, premium readiness (glassware, temperature, linen).',
    },
    guestExpectations: [
      'Seamless choreography — every moment feels prepared without visible effort.',
      'Complete privacy and discretion for the couple and VIP guests.',
      'Personalization at every touchpoint: names known, preferences honored.',
    ],
    emotionalRisks: [
      'Over-service or visible fuss — makes guests feel watched, not cared for.',
      'Obvious VIP favoritism in public view — uncomfortable for all guests.',
      'Any visible logistical moment: staff huddles, supply deliveries, kit visible.',
    ],
    operationalPriorities: [
      'Premium sparkling and signature serve ready before first arrivals.',
      'Separate VIP arrival route and briefed point-of-contact.',
      'Back-of-house operations fully invisible from all guest areas.',
    ],
    cocktailPriorities: [
      'Premium sparkling or champagne as arrival serve — no compromise.',
      'Elegant signature serves: minimal, precise, visually refined.',
      'Zero-proof options with the same quality care as full-ABV options.',
    ],
    foodPriorities: [
      'Refined balance — luxury in restraint and ingredient quality, not abundance.',
      'Late-night care: a distinct offering that sustains without feeling heavy.',
      'Allergy and dietary discretion — resolved quietly, never announced.',
    ],
    serviceRecoveryWatchpoints: [
      'Any visible mistake — own it immediately and privately, before the guest notices.',
      'Transport or coat delay — pre-assign a logistics owner for departure.',
      'Premium supply low — escalate silently; never make a guest ask twice.',
    ],
  },

  corporate: {
    archetype:               'Professional Gathering',
    philosophy:              'Hospitality serves the business objective — networking is the product. Service is confident, clean, and friction-free.',
    pace:                    'Networked',
    firstImpressionProtocol: 'Arrival drinks or canapés circulating before the first guests arrive. No dead time at the door.',
    guestCarePriority:       'Dietary compliance for workplace inclusion. No slow-build cocktails during networking. Moderate alcohol register.',
    occasionTone:            'professional',
    hospitalityRead: {
      guestExpectation:   'Efficiency, clarity, punctuality, and networking support — organizers feel in control, attendees feel oriented.',
      emotionalRisk:      'Slow registration, poor signage, or alcohol mismatch signal poor organisation and undermine trust.',
      operationalPriority:'Agenda awareness — service resets must align to program breaks, not interrupt them.',
      toConfirm:          'Program schedule, dietary labels, AV/coffee setup, and networking zone layout.',
    },
    guestExpectations: [
      'Professional efficiency and agenda-awareness — service supports the objective.',
      'Clear dietary labeling and moderate alcohol availability.',
      'Strong coffee, still and sparkling water, and fast clean service.',
    ],
    emotionalRisks: [
      'Slow registration or unclear arrival flow — first impression of disorganization.',
      'Service interrupting a speaker or meeting moment — breaks trust in the organizer.',
      'Poor dietary labeling — exclusion or guessing undermines inclusion.',
    ],
    operationalPriorities: [
      'Arrival drinks or canapés circulating before the first guests arrive.',
      'Service resets timed to program breaks — never interrupt speakers.',
      'Coffee and water always available — refreshed proactively, not on request.',
    ],
    cocktailPriorities: [
      'Zero-proof and low-ABV parity — a significant proportion may not drink.',
      'Avoid complex slow-build cocktails during networking peak.',
      'Fast, clean presentation — no messy garnishes or dramatic serves.',
    ],
    foodPriorities: [
      'Clean, dietary-labeled, easy to eat while standing and talking.',
      'No food that interrupts conversation or creates mess.',
      'Timed to program breaks — kitchen must know the agenda.',
    ],
    serviceRecoveryWatchpoints: [
      'AV or setup failure — have a point of contact with authority to act.',
      'Dietary need surfaced on the day — handle privately, resolve within 5 minutes.',
      'Coffee running out during a break — highest-pressure recovery moment.',
    ],
  },

  executive_event: {
    archetype:               'Executive Gathering',
    philosophy:              'Discretion, precision, and respect for time. Hospitality should be invisible and completely reliable.',
    pace:                    'Disciplined',
    firstImpressionProtocol: 'Everything confirmed before the first arrival. No visible last-minute adjustments.',
    guestCarePriority:       'Privacy, time discipline, dietary precision for a small confirmed group, and confidentiality.',
    occasionTone:            'professional',
    hospitalityRead: {
      guestExpectation:   'Discretion, precision, and time respect — the meeting is the point; hospitality removes every friction.',
      emotionalRisk:      'Overexplaining, interrupting sensitive moments, or making VIP handling visible.',
      operationalPriority:'Privacy routes, host cue awareness, and transport/logistics confirmed in advance.',
      toConfirm:          'Confirmed guest preferences, seating hierarchy, dietary requirements, and room-to-event continuity.',
    },
    guestExpectations: [
      'Complete discretion — no visible staff discussion, no overheard logistics.',
      'Precise timing — service moves to the host\'s cues, not a set schedule.',
      'Curated wine and non-alcoholic options, not a full bar.',
    ],
    emotionalRisks: [
      'Overexplaining a dish or service — breaks confidentiality atmosphere.',
      'Interrupting a sensitive conversation — irreversible trust damage.',
      'Visible VIP handling theater — contradicts the discretion standard.',
    ],
    operationalPriorities: [
      'Staff briefed on confidentiality: no notes, no phone, no overheard conversation.',
      'Host cue protocol established — service only on visible signal.',
      'Transport and coat logistics confirmed before the event starts.',
    ],
    cocktailPriorities: [
      'Curated premium selection — fewer choices, higher quality.',
      'Excellent non-alcoholic option: premium sparkling water, a thoughtful NA serve.',
      'No bar theater or visible showmanship.',
    ],
    foodPriorities: [
      'Conversation-friendly pacing — no interruptions during sensitive moments.',
      'Refined and dietary-precise — small confirmed group, all needs known.',
      'Clean, elegant plating — hospitality in restraint.',
    ],
    serviceRecoveryWatchpoints: [
      'Any service interruption during a sensitive moment — silent withdrawal and recovery.',
      'Dietary miss — handle privately before the guest notices.',
      'Transport late — escalate immediately; this group does not tolerate waiting.',
    ],
  },

  brand_launch: {
    archetype:               'Brand Experience',
    philosophy:              'Energy, identity, and social flow. The brand is the host. Every service moment reinforces the launch narrative.',
    pace:                    'High-Energy',
    firstImpressionProtocol: 'Arrival serve branded and ready. Entrance moment must be photographically clear.',
    guestCarePriority:       'Press and VIP handling, media-aware routing, and fast throughput at the bar.',
    occasionTone:            'social',
    hospitalityRead: {
      guestExpectation:   'Energy, brand identity, social flow, and shareable moments — the brand must feel alive.',
      emotionalRisk:      'Slow beautiful drinks, staff unaware of the brand narrative, or staining food.',
      operationalPriority:'Bar throughput, entrance impact, reveal timing, and press/VIP routing.',
      toConfirm:          'Press list, reveal timing, VIP routing, branded serve, and media-sensitive zones.',
    },
    guestExpectations: [
      'Brand energy — every detail reinforces the product identity.',
      'Shareable moments: photogenic, socially readable, instinctively understood.',
      'Fast, social service — no queue kills momentum.',
    ],
    emotionalRisks: [
      'Slow service during peak social moment — crowd energy drops.',
      'Staff who cannot speak to the brand narrative — undermines authenticity.',
      'Food that stains, spills, or distracts from the visual environment.',
    ],
    operationalPriorities: [
      'Bar throughput is the operational priority — fast, batched, photogenic.',
      'Entrance impact: branded arrival moment ready before first guest.',
      'Reveal timing protected: all service holds during key moment.',
    ],
    cocktailPriorities: [
      'Brand-aligned welcome serve — photogenic, fast, and identity-coherent.',
      'Batch the signature serves for speed during peak arrival.',
      'Avoid complex builds that create visible queue during networking.',
    ],
    foodPriorities: [
      'Stylish, easy to hold and eat while moving.',
      'Nothing that stains or creates awkward social moments.',
      'Timed to keep guests energized without redirecting attention.',
    ],
    serviceRecoveryWatchpoints: [
      'Queue forming before reveal — open secondary bar point immediately.',
      'Staff unaware of reveal timing — brief again before start.',
      'Media/press requesting access to non-designated areas — have a routing owner.',
    ],
  },

  luxury_brand_launch: {
    archetype:               'Luxury Brand Experience',
    philosophy:              'Exclusivity made gracious. Sensory quality and controlled density. The brand speaks through restraint.',
    pace:                    'Choreographed',
    firstImpressionProtocol: 'Champagne or refined aperitif ready at a staffed reception. Guest list intelligence in place before arrival.',
    guestCarePriority:       'Guest list precision, privacy routes, controlled arrival, VIP recognition without theater.',
    occasionTone:            'social',
    hospitalityRead: {
      guestExpectation:   'Exclusivity, discretion, sensory quality, and social status — precision feels natural.',
      emotionalRisk:      'Over-branding, too many activations, or poor coat/transport planning breaks the luxury illusion.',
      operationalPriority:'Controlled density, arrival theater, and premium readiness at every station.',
      toConfirm:          'Guest list (VIP tier), arrival sequence, coat and transport logistics, and venue density plan.',
    },
    guestExpectations: [
      'Exclusivity that feels gracious, not aggressive.',
      'Complete brand coherence — atmosphere, service, and product are one.',
      'Discretion and precision — guests feel recognized, not exposed.',
    ],
    emotionalRisks: [
      'Crowding — density destroys luxury perception faster than anything.',
      'Too many brand activations — overwhelming, not immersive.',
      'Poor coat or transport logistics — worst last impression.',
    ],
    operationalPriorities: [
      'Guest list intelligence at the door — no surprises, no visible confusion.',
      'Density control: manage arrival waves, prevent crowding.',
      'Premium readiness in every detail: temperature, glassware, linen, lighting.',
    ],
    cocktailPriorities: [
      'Champagne or refined aperitif arrival serve.',
      'Elegant signature with minimal, precise, brand-coherent design.',
      'Zero-proof with equal quality care.',
    ],
    foodPriorities: [
      'Refined bites: restraint and ingredient quality over abundance.',
      'Nothing that interrupts conversation or creates mess.',
      'Late service if long: an elegant, simple offer that sustains.',
    ],
    serviceRecoveryWatchpoints: [
      'Crowding at entrance — hold arrivals if needed, brief the door team.',
      'VIP not recognized on arrival — highest-risk recovery moment.',
      'Brand stock running low — escalate silently, never visible.',
    ],
  },

  private_dinner: {
    archetype:               'Intimate Private Dinner',
    philosophy:              'The host is the curator. Hospitality is personal, unhurried, and host-protective. Every guest feels personally received.',
    pace:                    'Relaxed',
    firstImpressionProtocol: 'Welcome drink tailored to host preference. Know the host by name and preferred table before service begins.',
    guestCarePriority:       'Host preference, known dietary needs for a small group, conversation pace respected.',
    occasionTone:            'social',
    hospitalityRead: {
      guestExpectation:   'Intimacy, personal attention, and conversation — the host looks generous and guests feel individually received.',
      emotionalRisk:      'Interrupting conversation, theatrical explanations, or poor pacing between courses.',
      operationalPriority:'Seating, host preferences, pacing cues, and wine matched to the menu.',
      toConfirm:          'Host wine preferences, all dietary requirements, pacing preference, and farewell logistics.',
    },
    guestExpectations: [
      'Personal attention — everyone is known, not processed.',
      'Unhurried flow — conversation is the product, not the service.',
      'Host-protective: nothing embarrasses or pressures the host.',
    ],
    emotionalRisks: [
      'Interrupting mid-conversation to explain dishes — breaks the intimacy.',
      'Pacing too fast or too slow — either pressures or deflates the room.',
      'Guest dietary need handled clumsily in view of the table.',
    ],
    operationalPriorities: [
      'Pacing cues from the host, not the kitchen — service follows conversation.',
      'Wine matched to menu and confirmed for the group.',
      'Dietary needs resolved privately before service begins.',
    ],
    cocktailPriorities: [
      'Thoughtful aperitif matched to host preference.',
      'Wine service matched to menu and pacing.',
      'No theatrical drinks — quiet craft, precise pour.',
    ],
    foodPriorities: [
      'Coherent menu — courses that build and pace naturally.',
      'Portion restraint: long evening, conversation-friendly quantity.',
      'Dietary safe: small known group, all needs confirmed in advance.',
    ],
    serviceRecoveryWatchpoints: [
      'Course timing off — read the room, not the clock.',
      'Wine running low — replenish silently, before the glass is empty.',
      'Guest dietary need surfaced — resolve privately and immediately.',
    ],
  },

  wine_event: {
    archetype:               'Wine Discovery',
    philosophy:              'Confidence-building. Guests should leave feeling more capable, not more intimidated. Expertise made generous.',
    pace:                    'Focused',
    firstImpressionProtocol: 'Clean, temperature-controlled glasses ready. First pour structured and explained simply.',
    guestCarePriority:       'Vocabulary calibrated to the audience, no snobbery, portion discipline, food pairing support.',
    occasionTone:            'social',
    hospitalityRead: {
      guestExpectation:   'Confidence, discovery, and credible education — guests build knowledge without feeling judged.',
      emotionalRisk:      'Too much jargon, large pours, overpowering pairings, or snobbery.',
      operationalPriority:'Structure, temperature discipline, pour size, and vocabulary level.',
      toConfirm:          'Guest wine experience level, dietary needs, whether pairings or standalone tasting, glassware count.',
    },
    guestExpectations: [
      'Discovery and education — building confidence, not showing off expertise.',
      'Calibrated vocabulary: accessible to beginners, respectful to experienced guests.',
      'Sensory enjoyment before intellectual analysis.',
    ],
    emotionalRisks: [
      'Jargon overload — guests feel tested, not welcomed.',
      'Large pours — volume undermines precision and creates intoxication risk.',
      'Snobbery or visible hierarchy — permanently damages the room.',
    ],
    operationalPriorities: [
      'Structured progression: lighter to fuller, or white to red if standard.',
      'Temperature control throughout — this is the most visible quality signal.',
      'Portion discipline: tasting pours, palate protection.',
    ],
    cocktailPriorities: [
      'Palate-protecting welcome: sparkling water, light canapé.',
      'No cocktails during the tasting — pure focus on wine.',
      'Post-tasting serve if long event: optional aperitif or digestif.',
    ],
    foodPriorities: [
      'Pairing support — food that enhances wine, not competes with it.',
      'Palate protection between pours: bread, neutral bites.',
      'Portion restraint — food is secondary; do not overwhelm.',
    ],
    serviceRecoveryWatchpoints: [
      'Guest appearing intoxicated early — slow service, add water, notify a colleague.',
      'Temperature off for a key wine — replace bottle, explain simply without drama.',
      'Dietary need incompatible with pairing — offer a neutral alternative quietly.',
    ],
  },

  cocktail_event: {
    archetype:               'Bar as the Experience',
    philosophy:              'Craft, energy, discovery, and social flow. The bar is the stage. Every drink is the product — speed and identity are the service pillars.',
    pace:                    'High-Energy',
    firstImpressionProtocol: 'Bar fully operational and staffed before doors open. First drink moment sets the tone for the night.',
    guestCarePriority:       'Fast service throughput, standing comfort, intoxication awareness, zero-proof options visible.',
    occasionTone:            'social',
    hospitalityRead: {
      guestExpectation:   'Craft, energy, discovery, speed, and social flow — the bar makes craft feel effortless.',
      emotionalRisk:      'Too many complex drinks, no batching, or weak food support create queue frustration and unsafe pacing.',
      operationalPriority:'Throughput, mise en place, ice, glassware, garnish prep, and barbacking.',
      toConfirm:          'Bar setup timing, ice delivery, batching plan, glassware count, zero-proof menu.',
    },
    guestExpectations: [
      'Craft at speed — quality and energy without waiting.',
      'Discovery: drinks that surprise and delight without exhausting.',
      'Social momentum: bar as gathering point, not queue point.',
    ],
    emotionalRisks: [
      'Queue longer than 5 minutes — kills the energy bar events run on.',
      'No food or water parity — intoxication risk and guest discomfort.',
      'Complex builds without operational capacity — craft looks amateur under pressure.',
    ],
    operationalPriorities: [
      'Bar fully ready and staffed before doors open.',
      'Batching plan confirmed — high-volume serves batched in advance.',
      'Water and food available throughout — responsible service is non-negotiable.',
    ],
    cocktailPriorities: [
      'Strong welcome serve — immediate hospitality on arrival.',
      'Balanced menu: 1-2 complex showcase drinks, rest are fast and reliable.',
      'Zero-proof option designed with the same care as full-ABV serves.',
    ],
    foodPriorities: [
      'Salty, textural, and fat-containing — supports safe alcohol pacing.',
      'Easy to eat standing — no interruption to drinking or conversation.',
      'Timed to alcohol pace: food appears as the crowd builds.',
    ],
    serviceRecoveryWatchpoints: [
      'Queue forming — simplify menu or open secondary station.',
      'Guest showing signs of intoxication — switch to water service, notify duty manager.',
      'Garnish or ingredient running low — brief bar team on substitution protocol.',
    ],
  },

  desert_event: {
    archetype:               'Elemental Experience',
    philosophy:              'Awe, adventure, and safety. Logistics must disappear so guests can inhabit the environment. Place is the host.',
    pace:                    'Considered',
    firstImpressionProtocol: 'Hydration and orientation on arrival. Transport briefing complete. Lighting and terrain clear.',
    guestCarePriority:       'Safety, hydration, warmth or cooling, terrain awareness, and first aid proximity.',
    occasionTone:            'social',
    hospitalityRead: {
      guestExpectation:   'Awe, adventure, comfort, and a sense of place — wilderness made safe and beautiful.',
      emotionalRisk:      'Underestimating wind, heat, cold, dust, lighting, power, or restroom logistics.',
      operationalPriority:'Weather contingency, transport, hydration, first aid, and redundancy for all critical systems.',
      toConfirm:          'Weather forecast, generator capacity, transport plan, first aid kit location, and restroom solution.',
    },
    guestExpectations: [
      'Cinematic experience — the environment is spectacular and the logistics disappear.',
      'Physical safety and comfort — temperature, terrain, and facilities managed.',
      'Sense of place: local, elemental, memorable.',
    ],
    emotionalRisks: [
      'Any safety incident — irreversible reputational damage.',
      'Poor hydration management in heat — medical risk and guest distress.',
      'Logistics visible: generators, cables, equipment — breaks the environment.',
    ],
    operationalPriorities: [
      'Weather contingency plan: wind, cold, sand, heat — all accounted for.',
      'Hydration proactive: water circulating before guests ask.',
      'Transport confirmed: arrival and departure logistics, no guest stranded.',
    ],
    cocktailPriorities: [
      'Hydration first — water, electrolyte, or soft options visible from arrival.',
      'Heat-aware cocktails: refreshing, low-ABV, slow-paced.',
      'Alcohol controlled: outdoor + heat + night = higher intoxication risk.',
    ],
    foodPriorities: [
      'Climate-stable: nothing that requires refrigeration or wilts in heat.',
      'Elegant and practical — beautiful but operationally resilient.',
      'Warm food if cold evening: portable warmth for late-night desert chill.',
    ],
    serviceRecoveryWatchpoints: [
      'Power failure — generator backup and lighting plan confirmed.',
      'Guest with heat stress — first aid kit accessible, escalate immediately.',
      'Transport delay — communicate proactively, manage expectations early.',
    ],
  },

  hotel_event: {
    archetype:               'Hotel Integrated Event',
    philosophy:              'Professional coordination with room-to-event continuity. The hotel is one intelligent host from check-in to departure.',
    pace:                    'Structured',
    firstImpressionProtocol: 'Concierge and front desk briefed on the event. Wayfinding from lobby clear before first arrivals.',
    guestCarePriority:       'Department brief alignment, signage, concierge continuity, dietary precision in banquet format.',
    occasionTone:            'professional',
    hospitalityRead: {
      guestExpectation:   'Professional coordination and room-to-event continuity — the hotel feels like one intelligent host.',
      emotionalRisk:      'Siloed departments, generic banquet execution, or missed VIP continuity.',
      operationalPriority:'Department briefs shared, signage clear, banquet timing confirmed with kitchen.',
      toConfirm:          'Concierge handoff, AV brief, banquet service sequence, room-block continuity, VIP arrivals.',
    },
    guestExpectations: [
      'Seamless coordination across hotel departments.',
      'Professional, consistent service — not generic banquet execution.',
      'Premium options where appropriate alongside standard banquet reliability.',
    ],
    emotionalRisks: [
      'Department silos: front desk unaware of event, kitchen briefed separately.',
      'Generic banquet feel despite a premium event context.',
      'VIP continuity missed: checked in but not recognized at the event.',
    ],
    operationalPriorities: [
      'All departments briefed: front desk, concierge, banquet, kitchen, AV.',
      'Signage from lobby to event space — wayfinding before first arrivals.',
      'Banquet service sequence confirmed with kitchen and F&B director.',
    ],
    cocktailPriorities: [
      'Hotel-standard consistency with premium upgrades where indicated.',
      'Banquet bar efficiency: speed and volume, not theatrical craft.',
      'VIP table receives premium service separate from banquet standard.',
    ],
    foodPriorities: [
      'Banquet reliability with restaurant-quality care where possible.',
      'Dietary precision — banquet scale requires advance confirmation.',
      'Timed to program: kitchen must know speaker and program sequence.',
    ],
    serviceRecoveryWatchpoints: [
      'Department communication failure — appoint a single cross-dept liaison.',
      'AV issue — hotel AV contact pre-briefed and on standby.',
      'VIP room not ready — concierge escalation path confirmed in advance.',
    ],
  },

  resort_event: {
    archetype:               'Resort Experience',
    philosophy:              'Ease, escapism, and locality. Logistics disappear; place becomes hospitality. Unhurried, beautiful, outdoor-aware.',
    pace:                    'Relaxed',
    firstImpressionProtocol: 'Refreshing arrival drink. Outdoor orientation clear. Shade and seating visible.',
    guestCarePriority:       'Climate comfort, hydration, weather contingency, movement flow, and local storytelling.',
    occasionTone:            'social',
    hospitalityRead: {
      guestExpectation:   'Ease, escapism, locality, and comfort — remove effort and let the place become hospitality.',
      emotionalRisk:      'Heavy menus in heat, slow hydration, or weak weather contingency.',
      operationalPriority:'Weather, shade, hydration, outdoor movement, and local storytelling.',
      toConfirm:          'Weather forecast, shade and seating plan, outdoor power, hydration station placement.',
    },
    guestExpectations: [
      'Ease and escapism — effort removed, environment immersive.',
      'Local ingredients and sense of place.',
      'Unhurried flow: outdoor, relaxed, naturally beautiful.',
    ],
    emotionalRisks: [
      'Heat without hydration management — guest discomfort rapidly escalates.',
      'Heavy food in hot outdoor conditions — defeats the escapism.',
      'Logistics visible: staff confusion, setup in view of guests.',
    ],
    operationalPriorities: [
      'Hydration proactive: water and refreshments circulating before request.',
      'Weather contingency plan: shade, cooling, or warm options for evening.',
      'Movement flow designed: guests move naturally, no bottlenecks.',
    ],
    cocktailPriorities: [
      'Refreshing, seasonal, local-ingredient driven.',
      'Heat-aware: lighter ABV, larger format hydration support.',
      'Welcome serve immediately on arrival — ease before everything.',
    ],
    foodPriorities: [
      'Seasonal, fresh, climate-stable.',
      'Light and movement-friendly — outdoor setting rewards uncomplicated.',
      'Local storytelling: ingredients that connect to place.',
    ],
    serviceRecoveryWatchpoints: [
      'Weather change — shade, heating, or cover plan activated immediately.',
      'Hydration depletion — most critical outdoor recovery point.',
      'Guests feeling lost — visible, friendly wayfinding and staff routing.',
    ],
  },

  charity_gala: {
    archetype:               'Charitable Ceremony',
    philosophy:              'Elegance in service of generosity. Donor recognition, ceremony respect, and program awareness define the service contract.',
    pace:                    'Formal',
    firstImpressionProtocol: 'Reception polish: premium sparkling, donor-recognized arrival. Program timing confirmed with event organizers.',
    guestCarePriority:       'Donor and VIP care, speech hold discipline, pledge or auction support, dietary precision for a formal setting.',
    occasionTone:            'celebratory',
    hospitalityRead: {
      guestExpectation:   'Elegance, generosity, recognition, and ceremony — giving feels honored.',
      emotionalRisk:      'Service disrupting speeches, clumsy donor recognition, or slow auction/pledge support.',
      operationalPriority:'Speech holds, donor seating, program-aligned timing, and pledge support.',
      toConfirm:          'Seating list with donor tiers, auction/pledge logistics, speech schedule, dietary map.',
    },
    guestExpectations: [
      'Elegance matched to the occasion — this is formal hospitality.',
      'Recognition for donors: seating, access, and attention that signals status.',
      'Ceremony respected: service holds during speeches, pledges, and tributes.',
    ],
    emotionalRisks: [
      'Service disrupting a speech — visible and irreversible in a formal setting.',
      'Donor not recognized or seated incorrectly — dignity breach.',
      'Slow or clumsy pledge/auction support — undermines the fundraising moment.',
    ],
    operationalPriorities: [
      'Service holds enforced: kitchen and floor briefed on all speech windows.',
      'Donor seating confirmed: VIP tiers assigned and staff briefed.',
      'Pledge/auction support: materials, staff, and technology tested before guests arrive.',
    ],
    cocktailPriorities: [
      'Reception polish: premium sparkling and circulating canapés.',
      'Dinner wine service elegant and attentive.',
      'No experimental cocktails — elegance and ceremony set the tone.',
    ],
    foodPriorities: [
      'Elegant, banquet-practical — courses timed around the program.',
      'Speech holds non-negotiable: kitchen fully briefed on schedule.',
      'Dietary precision in a formal setting: all requirements confirmed and seated.',
    ],
    serviceRecoveryWatchpoints: [
      'Service interrupting a speech — hold all movement immediately.',
      'Donor seating error — resolve before the guest notices, not after.',
      'Auction/pledge technology failure — manual backup plan ready.',
    ],
  },

  vip_event: {
    archetype:               'VIP Experience',
    philosophy:              'Recognition, privacy, speed, and discretion. The guest feels known without being exposed. Preference handling is the service.',
    pace:                    'Precise',
    firstImpressionProtocol: 'Guest name and confirmed preferences known before arrival. No visible consultation at the door.',
    guestCarePriority:       'Confirmed preferences, privacy routes, escalation owner, confidentiality.',
    occasionTone:            'social',
    hospitalityRead: {
      guestExpectation:   'Recognition, privacy, speed, and discretion — the guest feels known without being exposed.',
      emotionalRisk:      'Over-recognition theater, staff gossip, unconfirmed assumptions, or slow approval.',
      operationalPriority:'Confirmed preferences, privacy routes, escalation owner, and authorized action protocol.',
      toConfirm:          'Confirmed preferences (dietary, drink, seating), privacy routes, authorized escalation contact.',
    },
    guestExpectations: [
      'Being recognized without visible effort — knowledge is invisible.',
      'Privacy and discretion — nothing about their visit is visible or overheard.',
      'Speed and precision: no waiting, no asking, no explaining.',
    ],
    emotionalRisks: [
      'Over-recognition in public view — makes VIP feel exposed, not honored.',
      'Staff gossip or visible excitement — breaks confidentiality immediately.',
      'Unconfirmed assumption acted on — worse than not knowing.',
    ],
    operationalPriorities: [
      'All preferences confirmed before the event — no guessing under pressure.',
      'Privacy route pre-designated and staff briefed.',
      'Single escalation owner with authority to act immediately.',
    ],
    cocktailPriorities: [
      'Confirmed beverage preference — exactly what they asked for, no substitution.',
      'Premium readiness: no visible compromise on quality.',
      'Quiet, attentive refill — glass never empty, never forced.',
    ],
    foodPriorities: [
      'Dietary precision: all restrictions confirmed, zero ambiguity.',
      'Flexible recovery options prepared in advance.',
      'Host-protective: no course presented that may cause discomfort.',
    ],
    serviceRecoveryWatchpoints: [
      'Preference missed — correct immediately and privately, before the next course.',
      'Privacy compromised — brief the whole team on the breach, not just the individual.',
      'Guest requesting something not offered — escalate to a decision-maker immediately.',
    ],
  },

  bar_event: {
    archetype:               'Bar as the Experience',
    philosophy:              'The bar is the stage. Bartenders are performers. Speed, identity, and showmanship are the service pillars.',
    pace:                    'High-Energy',
    firstImpressionProtocol: 'Bar fully operational and staffed before doors open. First drink moment sets the tone for the night.',
    guestCarePriority:       'Fast service throughput, standing guest comfort, intoxication awareness, and zero-proof options visible.',
    occasionTone:            'social',
    hospitalityRead: {
      guestExpectation:   'Craft, energy, identity, and social flow — the bar makes everything feel effortless.',
      emotionalRisk:      'Queue during peak, no food/water parity, or a bar that cannot execute its own menu.',
      operationalPriority:'Bar throughput, mise en place, and responsible service structure.',
      toConfirm:          'Bar setup timing, batching plan, ice and glassware count, zero-proof menu.',
    },
    guestExpectations: [
      'Craft at speed — quality without waiting.',
      'Discovery: a menu that surprises without exhausting.',
      'Social energy: bar as gathering space, not queue.',
    ],
    emotionalRisks: [
      'Queue exceeding 5 minutes — kills bar event momentum.',
      'No food or water support — intoxication risk and guest discomfort.',
      'Complex builds without batching capacity — craft looks amateur under pressure.',
    ],
    operationalPriorities: [
      'Bar fully ready and staffed before doors open.',
      'Batching plan confirmed for high-volume serves.',
      'Water and food available throughout — responsible service non-negotiable.',
    ],
    cocktailPriorities: [
      'Strong welcome serve — immediate hospitality.',
      'Balanced menu: showcase drinks and fast reliable options.',
      'Zero-proof with equal care.',
    ],
    foodPriorities: [
      'Salty, textural, fat-containing — supports safe alcohol pacing.',
      'Easy to eat standing.',
      'Timed to crowd build.',
    ],
    serviceRecoveryWatchpoints: [
      'Queue forming — simplify or open secondary station.',
      'Intoxication signs — switch to water service, notify duty manager.',
      'Garnish/ingredient low — substitution protocol briefed in advance.',
    ],
  },

  private: {
    archetype:               'Intimate Gathering',
    philosophy:              'The host is the curator. Hospitality defers to personal taste — high personalization, low formality, warm presence.',
    pace:                    'Relaxed',
    firstImpressionProtocol: 'Welcome drink tailored to host preference. Know the host by name before the event begins.',
    guestCarePriority:       'Host preference above all. Dietary compliance for a known, close guest group. Unhurried service flow.',
    occasionTone:            'social',
    hospitalityRead: {
      guestExpectation:   'Personalization, warmth, and ease — the host looks generous and guests feel individually received.',
      emotionalRisk:      'Interrupting conversation, theatrical service, or misreading the host\'s pace.',
      operationalPriority:'Host preference, pacing cues, and dietary map for a known group.',
      toConfirm:          'Host preferences, dietary requirements, pacing preference, and welcome drink choice.',
    },
    guestExpectations: [
      'Personal attention — everyone is known, not processed.',
      'Unhurried service — conversation is the product.',
      'Host-protective: nothing embarrasses or pressures.',
    ],
    emotionalRisks: [
      'Theatrical or over-explained service — breaks intimacy.',
      'Service pace misread — too fast pressures, too slow deflates.',
      'Dietary need mishandled in front of others.',
    ],
    operationalPriorities: [
      'Host preference confirmed and briefed.',
      'Pacing follows host cues, not kitchen schedule.',
      'Dietary needs resolved privately before service.',
    ],
    cocktailPriorities: [
      'Host-preference welcome drink.',
      'Quiet craft: personal and precise, no theater.',
      'Wine matched to the evening and the group.',
    ],
    foodPriorities: [
      'Coherent, host-driven menu.',
      'Dietary safe: small known group.',
      'Conversation-friendly pacing throughout.',
    ],
    serviceRecoveryWatchpoints: [
      'Pacing off — read the room, not the clock.',
      'Wine low — replenish silently.',
      'Dietary surfaced — resolve privately and immediately.',
    ],
  },

  other: {
    archetype:               'General Event',
    philosophy:              'Crowd-pleasing, approachable, and smooth. When in doubt, be warm and proactive.',
    pace:                    'Standard',
    firstImpressionProtocol: 'Drinks and welcome ready on arrival.',
    guestCarePriority:       'Dietary compliance and general flow management.',
    occasionTone:            'mixed',
    hospitalityRead: {
      guestExpectation:   'Warmth, approachability, and smooth service flow.',
      emotionalRisk:      'Missing dietary needs or unclear arrival experience.',
      operationalPriority:'Dietary map and arrival welcome readiness.',
      toConfirm:          'Dietary requirements, guest count, and start time.',
    },
    guestExpectations: [
      'Warm, approachable service.',
      'Dietary compliance and clear arrival experience.',
    ],
    emotionalRisks: [
      'Missed dietary requirement — most common failure point.',
      'Unclear arrival — guests feel disoriented.',
    ],
    operationalPriorities: [
      'Welcome readiness before first arrivals.',
      'Dietary map confirmed with kitchen.',
    ],
    cocktailPriorities: [
      'Crowd-pleasing welcome serve.',
      'Zero-proof option available and clearly presented.',
    ],
    foodPriorities: [
      'Dietary-safe and clearly labeled.',
      'Approachable and crowd-pleasing.',
    ],
    serviceRecoveryWatchpoints: [
      'Dietary miss — resolve privately and immediately.',
      'Arrival confusion — direct proactively.',
    ],
  },
}

// ── Scale persona ──────────────────────────────────────────────────────────────

function deriveScalePersona(guestCount) {
  if (!guestCount) return {
    scale: 'unknown', persona: 'Guest count not set — staffing and flow planning cannot begin.', logisticalSignal: null,
  }
  if (guestCount < 30)  return { scale: 'micro',    persona: 'Micro-event. Every interaction is visible. Staff personality matters as much as technique.', logisticalSignal: 'Single bar, single station. Over-staffing is counterproductive.' }
  if (guestCount < 60)  return { scale: 'intimate', persona: 'Intimate scale. Personalised service is achievable with a small, focused team.', logisticalSignal: 'One main bar. One welcome station. Standard runner capacity.' }
  if (guestCount < 120) return { scale: 'medium',   persona: 'Medium event. Flow management matters. Section load must be monitored.', logisticalSignal: 'Two service zones minimum. Welcome station separate from main bar.' }
  if (guestCount < 200) return { scale: 'large',    persona: 'Large event. Arrival pressure is the primary risk. The first 45 minutes define the experience.', logisticalSignal: 'Multiple bar points. Dedicated arrival management. Pre-batch wherever possible.' }
  return { scale: 'grand', persona: 'Grand-scale event. Logistics dominate service quality. System compliance and pre-shift briefing are the hospitality tools.', logisticalSignal: 'Command-level coordination. Split bar operations. Dedicated arrival and departure protocols.' }
}

// ── Guest profile signals ──────────────────────────────────────────────────────

function deriveGuestSignals(event, guests) {
  const flags = {
    hasVIP: false, hasAccessibility: false, hasCelebration: false,
    hasKosher: false, hasDietary: false,
    confirmedCount: 0, pendingCount: 0, declinedCount: 0, unknownCount: 0,
    totalGuests: 0, expectedVsConfirmedGap: null,
  }
  const structured = []

  // ── Event-text signals — run regardless of guest data presence ────────────
  // Kosher from event notes/host message only (never inferred from location).
  const kosherInEvent = /kosher/i.test(event.notes || '') || /kosher/i.test(event.host_message || '')
  if (kosherInEvent) {
    flags.hasKosher = true
    structured.push(signal(
      'Kosher requirement detected — kitchen and bar compliance must be verified before service begins.',
      { source: 'event_text', evidence: 'Kosher keyword in event notes or host message', confidence: 'high', isDerived: false, classification: 'fact' }
    ))
  }

  const celebRE = /birthday|anniversary|celebration|engagement|retirement|promotion/i
  if (celebRE.test(event.notes || '') || celebRE.test(event.name || '')) {
    flags.hasCelebration = true
    structured.push(signal(
      'Celebration occasion detected — prepare a signature welcome touch as appropriate.',
      { source: 'event_text', evidence: 'Celebration keyword in event name or notes', confidence: 'medium', isDerived: true, classification: 'observation' }
    ))
  }

  // ── Early return if no guest data ─────────────────────────────────────────
  if (!Array.isArray(guests) || guests.length === 0) {
    if (!structured.length) {
      structured.push(signal('No guest data — guest profile intelligence unavailable.', { source: 'system', evidence: 'guests array is empty or missing', confidence: 'high', classification: 'unknown' }))
    }
    return { signals: structured.map(s => s.recommendation), flags, structured }
  }

  // ── Guest-data signals ────────────────────────────────────────────────────
  flags.totalGuests    = guests.length
  flags.confirmedCount = guests.filter(g => g.rsvp_status === 'confirmed').length
  flags.pendingCount   = guests.filter(g => g.rsvp_status === 'pending' || g.rsvp_status === 'invited').length
  flags.declinedCount  = guests.filter(g => g.rsvp_status === 'declined' || g.rsvp_status === 'no').length
  flags.unknownCount   = guests.filter(g => !g.rsvp_status || g.rsvp_status === 'unknown').length

  const expected = event.expected_guests || null
  if (expected && expected > flags.confirmedCount) {
    flags.expectedVsConfirmedGap = expected - flags.confirmedCount
    structured.push(signal(
      `${flags.expectedVsConfirmedGap} guests expected but not yet confirmed — final count uncertain.`,
      { source: 'guest_data', evidence: `Expected: ${expected}, Confirmed: ${flags.confirmedCount}`, confidence: 'high', isDerived: false, classification: 'observation' }
    ))
  }

  // VIP — only from explicit guest field, never assumed from event type
  const vipGuests = guests.filter(g => g.vip || g.is_vip)
  if (vipGuests.length > 0) {
    flags.hasVIP = true
    structured.push(signal(
      `${vipGuests.length} VIP guest${vipGuests.length > 1 ? 's' : ''} confirmed — elevate attention and notify management on arrival.`,
      { source: 'guest_data', evidence: `VIP field set on ${vipGuests.length} guest record(s)`, confidence: 'high', isDerived: false, classification: 'fact' }
    ))
  }

  // Accessibility — only from explicit guest fields, never assumed
  const accessGuests = guests.filter(g => g.accessibility_notes || g.wheelchair || g.accessibility)
  if (accessGuests.length > 0) {
    flags.hasAccessibility = true
    structured.push(signal(
      `${accessGuests.length} guest${accessGuests.length > 1 ? 's' : ''} with accessibility requirements — verify seating, path clearance, and staff brief.`,
      { source: 'guest_data', evidence: 'accessibility_notes or wheelchair field set on guest record(s)', confidence: 'high', isDerived: false, classification: 'fact' }
    ))
  }

  // Kosher from guest dietary — separate from event-text kosher already handled above
  const kosherGuests = guests.filter(g => /kosher/i.test(g.dietary || ''))
  if (kosherGuests.length > 0) {
    flags.hasKosher = true
    structured.push(signal(
      'Kosher requirement confirmed by guest dietary records — kitchen and bar compliance must be verified.',
      { source: 'guest_data', evidence: `Kosher dietary field set on ${kosherGuests.length} guest record(s)`, confidence: 'high', isDerived: false, classification: 'fact' }
    ))
  }

  // Dietary requirements (excluding kosher — already handled)
  const dietaryGuests = guests.filter(g => {
    const d = (g.dietary || '').trim().toLowerCase()
    return d && !d.includes('kosher')
  })
  if (dietaryGuests.length > 0) {
    flags.hasDietary = true
    structured.push(signal(
      `${dietaryGuests.length} guest${dietaryGuests.length > 1 ? 's' : ''} with dietary requirements — kitchen must confirm all are addressed.`,
      { source: 'guest_data', evidence: `dietary field set on ${dietaryGuests.length} non-kosher guest record(s)`, confidence: 'high', isDerived: false, classification: 'fact' }
    ))
  }

  // Pending RSVP gap
  if (flags.pendingCount > 0) {
    structured.push(signal(
      `${flags.pendingCount} guest${flags.pendingCount > 1 ? 's' : ''} have not yet responded — follow up before final count is locked.`,
      { source: 'guest_data', evidence: `RSVP status: pending/invited on ${flags.pendingCount} record(s)`, confidence: 'high', isDerived: false, classification: 'observation' }
    ))
  }

  return { signals: structured.map(s => s.recommendation), flags, structured }
}

// ── Service pace profile ───────────────────────────────────────────────────────

function deriveServicePace(event, dna) {
  let durationHours = null
  if (event.start_time && event.end_time) {
    try {
      const [sh, sm] = event.start_time.split(':').map(Number)
      const [eh, em] = event.end_time.split(':').map(Number)
      const diff = (eh * 60 + em) - (sh * 60 + sm)
      if (diff > 0) durationHours = Math.round((diff / 60) * 10) / 10
    } catch { /* skip */ }
  }

  const pressurePoints = []
  if (event.start_time) pressurePoints.push(`Arrival wave at ${event.start_time} — welcome drinks must precede guest flow.`)
  if (durationHours !== null && durationHours > 5) pressurePoints.push('Long-duration event — energy management and service pacing critical to avoid mid-event fatigue.')
  if (durationHours !== null && durationHours < 2) pressurePoints.push('Short event window — every service moment counts. No recovery time for errors.')
  if (!event.start_time) pressurePoints.push('Start time not set — service pace and arrival management cannot be planned.')

  return {
    paceLabel: dna.pace,
    durationHours,
    hasFullWindow: !!(event.start_time && event.end_time),
    pressurePoints,
  }
}

// ── Architecture risks from real data ─────────────────────────────────────────

function deriveArchitectureRisks(event, guests, guestFlags) {
  const risks = []
  if (!event.start_time) {
    risks.push({ risk: 'No start time — cannot brief staff on timing or plan service waves.', category: 'timing', severity: 'high', source: 'event_data', classification: 'unknown' })
  }
  if (!event.expected_guests) {
    risks.push({ risk: 'No expected guest count — staffing, bar stations, and seating cannot be planned.', category: 'planning', severity: 'high', source: 'event_data', classification: 'unknown' })
  }
  if (guestFlags.expectedVsConfirmedGap !== null && guestFlags.expectedVsConfirmedGap > 20) {
    risks.push({ risk: `${guestFlags.expectedVsConfirmedGap} guests unconfirmed — final count uncertainty is high.`, category: 'guest_count', severity: 'medium', source: 'guest_data', classification: 'observation' })
  }
  if (!event.event_date) {
    risks.push({ risk: 'No event date set — all time-sensitive preparation is blocked.', category: 'timing', severity: 'high', source: 'event_data', classification: 'unknown' })
  }
  return risks
}

// ── Accessibility checks from real data ───────────────────────────────────────

function deriveAccessibilityChecks(guests, event) {
  const checks = []
  const accessGuests = Array.isArray(guests) ? guests.filter(g => g.accessibility_notes || g.wheelchair || g.accessibility) : []
  if (accessGuests.length > 0) {
    checks.push({ check: `${accessGuests.length} guest(s) with accessibility notes — verify arrival path, seating, and restroom access.`, source: 'guest_data', evidence: 'accessibility_notes or wheelchair field set', confidence: 'high', classification: 'fact' })
  }
  // Location-based inference only if outdoor or venue field contains relevant keywords
  if (DESERT_RE.test(event.location || '') || RESORT_RE.test(event.location || '')) {
    checks.push({ check: 'Outdoor venue detected — confirm terrain, path clearance, and emergency access for mobility needs.', source: 'event_text', evidence: 'Location field contains outdoor context', confidence: 'medium', classification: 'observation' })
  }
  return checks
}

// ── Unknowns to confirm ────────────────────────────────────────────────────────

function deriveUnknowns(event, guests) {
  const unknowns = []
  if (!event.start_time) unknowns.push({ field: 'Start time', why: 'Service waves, staff brief, and arrival management cannot be planned without it.', classification: 'unknown' })
  if (!event.expected_guests) unknowns.push({ field: 'Expected guest count', why: 'Bar capacity, staffing levels, and seating plan require a number.', classification: 'unknown' })
  if (!event.event_date) unknowns.push({ field: 'Event date', why: 'All preparation timelines depend on this.', classification: 'unknown' })
  if (!event.end_time) unknowns.push({ field: 'End time', why: 'Cannot calculate duration, service pacing, or departure logistics.', classification: 'unknown' })
  if (!event.location) unknowns.push({ field: 'Location / venue', why: 'Wayfinding, accessibility, outdoor contingency, and transport depend on this.', classification: 'unknown' })
  const dietaryGuestsWithoutDetail = Array.isArray(guests) ? guests.filter(g => g.dietary === 'yes' || g.dietary === 'true') : []
  if (dietaryGuestsWithoutDetail.length > 0) {
    unknowns.push({ field: 'Dietary details', why: `${dietaryGuestsWithoutDetail.length} guest(s) flagged dietary but with no detail — kitchen cannot plan.`, classification: 'unknown' })
  }
  return unknowns
}

// ── Downstream guidance ────────────────────────────────────────────────────────

function deriveDownstreamGuidance(dna, guestFlags, subtypeResult) {
  const subtype = subtypeResult.subtype
  const bar     = [...(dna.cocktailPriorities || [])]
  const kitchen = [...(dna.foodPriorities    || [])]
  const em      = []

  if (guestFlags.hasKosher) {
    bar.unshift('KOSHER requirement confirmed — verify all spirits, mixers, and garnishes comply before service.')
    kitchen.unshift('KOSHER requirement confirmed — all ingredients and preparation must comply.')
  }
  if (guestFlags.hasAccessibility) {
    em.push('Accessibility needs confirmed — verify seating, path clearance, and staff brief.')
  }
  if (guestFlags.hasVIP) {
    em.push('VIP guests confirmed — escalation owner and privacy route pre-designated.')
  }
  em.push(`Confirm start time, expected count, and dietary map with all departments before T-24h.`)

  return { bar, kitchen, eventManager: em }
}

// ── Signal provenance ──────────────────────────────────────────────────────────

function buildSignalProvenance(subtypeResult, guestSignals, architectureRisks, accessibilityChecks) {
  const provenance = []
  provenance.push({
    field:          'Event subtype',
    source:         subtypeResult.isDerived ? 'event_text' : 'event_type',
    evidence:       subtypeResult.evidence,
    confidence:     subtypeResult.confidence,
    isDerived:      subtypeResult.isDerived,
    classification: subtypeResult.isDerived ? 'observation' : 'fact',
  })
  for (const s of guestSignals.structured) {
    provenance.push({ field: 'Guest signal', source: s.source, evidence: s.evidence, confidence: s.confidence, isDerived: s.isDerived || false, classification: s.classification })
  }
  for (const r of architectureRisks) {
    provenance.push({ field: `Architecture risk: ${r.category}`, source: r.source, evidence: r.risk, confidence: 'high', isDerived: false, classification: r.classification })
  }
  return provenance
}

// ── Main export ────────────────────────────────────────────────────────────────

export function buildHospitalityDNA({ event, guests }) {
  if (!event) return null

  const g           = Array.isArray(guests) ? guests : []
  const subtypeResult = detectSubtype(event)
  const subtype       = subtypeResult.subtype
  const dna           = SUBTYPE_DNA[subtype] || SUBTYPE_DNA.other

  const scalePersona       = deriveScalePersona(event.expected_guests || null)
  const guestSignals       = deriveGuestSignals(event, g)
  const servicePace        = deriveServicePace(event, dna)
  const architectureRisks  = deriveArchitectureRisks(event, g, guestSignals.flags)
  const accessibilityChecks = deriveAccessibilityChecks(g, event)
  const unknownsToConfirm  = deriveUnknowns(event, g)
  const downstreamGuidance = deriveDownstreamGuidance(dna, guestSignals.flags, subtypeResult)
  const signalProvenance   = buildSignalProvenance(subtypeResult, guestSignals, architectureRisks, accessibilityChecks)

  // ── Operational priorities from data + event type ──────────────────────────
  const operationalPriorities = (dna.operationalPriorities || []).map(p =>
    signal(p, { source: 'event_type', evidence: `Derived from ${subtype} hospitality DNA`, confidence: 'medium', isDerived: true, classification: 'inference' })
  )

  // ── Zohar questions — from unknowns ────────────────────────────────────────
  const zoharQuestions = unknownsToConfirm.map(u => `What is the ${u.field.toLowerCase()}? — ${u.why}`)

  return {
    // ── Original fields (backward-compatible) ─────────────────────────────
    experienceArchetype:     dna.archetype,
    servicePhilosophy:       dna.philosophy,
    occasionTone:            dna.occasionTone,
    firstImpressionProtocol: dna.firstImpressionProtocol,
    guestCarePriority:       dna.guestCarePriority,
    scalePersona: {
      scale:            scalePersona.scale,
      persona:          scalePersona.persona,
      logisticalSignal: scalePersona.logisticalSignal,
    },
    servicePace: {
      paceLabel:     servicePace.paceLabel,
      durationHours: servicePace.durationHours,
      hasFullWindow:  servicePace.hasFullWindow,
      pressurePoints: servicePace.pressurePoints,
    },
    guestProfile: {
      confirmedCount:   guestSignals.flags.confirmedCount,
      unconfirmedCount: guestSignals.flags.unknownCount + guestSignals.flags.pendingCount,
      hasVIP:           guestSignals.flags.hasVIP,
      hasAccessibility: guestSignals.flags.hasAccessibility,
      hasCelebration:   guestSignals.flags.hasCelebration,
      hasKosher:        guestSignals.flags.hasKosher,
      hasDietary:       guestSignals.flags.hasDietary,
      activeSignals:    guestSignals.signals,
    },

    // ── New structured fields ──────────────────────────────────────────────
    normalizedEventType: event.event_type || 'other',
    eventSubtype:        subtype,
    subtypeConfidence:   subtypeResult.confidence,
    subtypeEvidence:     subtypeResult.evidence,
    subtypeIsDerived:    subtypeResult.isDerived,

    hospitalityRead:  dna.hospitalityRead,

    guestExpectations: (dna.guestExpectations || []).map(e =>
      signal(e, { source: 'event_type', evidence: `Derived from ${subtype} hospitality DNA`, confidence: 'medium', isDerived: true, classification: 'inference' })
    ),
    emotionalRisks: (dna.emotionalRisks || []).map(r =>
      signal(r, { source: 'event_type', evidence: `Derived from ${subtype} hospitality DNA`, confidence: 'medium', isDerived: true, classification: 'inference' })
    ),
    operationalPriorities,
    zoharQuestions,
    unknownsToConfirm,
    cocktailPriorities: (dna.cocktailPriorities || []).map(p =>
      signal(p, { source: 'event_type', evidence: `Derived from ${subtype} hospitality DNA`, confidence: 'medium', isDerived: true, classification: 'inference' })
    ),
    foodPriorities: (dna.foodPriorities || []).map(p =>
      signal(p, { source: 'event_type', evidence: `Derived from ${subtype} hospitality DNA`, confidence: 'medium', isDerived: true, classification: 'inference' })
    ),
    eventArchitectureRisks:     architectureRisks,
    accessibilityChecks,
    serviceRecoveryWatchpoints: (dna.serviceRecoveryWatchpoints || []).map(w =>
      ({ watchpoint: w, trigger: null, source: 'event_type', classification: 'inference' })
    ),
    downstreamGuidance,
    signalProvenance,

    // RSVP breakdown (structured)
    rsvpBreakdown: {
      confirmed: guestSignals.flags.confirmedCount,
      pending:   guestSignals.flags.pendingCount,
      declined:  guestSignals.flags.declinedCount,
      unknown:   guestSignals.flags.unknownCount,
      total:     guestSignals.flags.totalGuests,
      expectedVsConfirmedGap: guestSignals.flags.expectedVsConfirmedGap,
    },
  }
}
