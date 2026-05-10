import { ADDITIONAL_UNIVERSITY_ACADEMIES } from './universityExpansion.js'

function lesson({
  id,
  title,
  duration,
  objective,
  doctrine,
  technical_depth,
  standards = [],
  taxonomy = [],
  terminology = [],
  operational_consequences = [],
  common_failures = [],
  amateur,
  pro,
  recovery_logic,
  professional_standard,
  real_service_context,
  practical_execution = [],
  guest_application,
  manager_notes,
  drill,
  assessment_questions = []
}) {
  return {
    id,
    title,
    duration,
    objective,
    content: {
      doctrine,
      technical_depth,
      standards,
      taxonomy,
      terminology,
      amateur_vs_pro: { amateur, pro },
      operational_consequences,
      common_failures,
      recovery_logic,
      professional_standard,
      real_service_context,
      practical_execution,
      guest_application,
      manager_notes,
      drill,
      assessment_questions
    }
  }
}

function flattenAcademy(academy) {
  return {
    ...academy,
    lessons: academy.modules.flatMap(module => module.lessons.map(item => ({
      ...item,
      moduleId: module.id,
      moduleTitle: module.title,
      ...(item.content || {})
    })))
  }
}

const RAW_UNIVERSITY_MANIFEST = [
  {
    id: 'bar-academy',
    title: 'Bar Academy',
    dean: 'Beverage Director and Mixology Consultant',
    color: '#c9a96e',
    category: 'Cocktails And Bar Craft',
    description: 'Professional bar education across technique, spirits, cocktail balance, menu engineering, costing, waste control, and responsible service.',
    badge: 'Bar Craft',
    roles: ['employee', 'manager', 'admin'],
    totalLessons: 10,
    modules: [
      {
        id: 'bar-technique',
        title: 'Technique, Ice, Balance, And Speed',
        lessons: [
          lesson({
            id: 'bar-001',
            title: 'Ice Systems, Dilution, And Thermal Control',
            duration: '45 min',
            objective: 'Use ice format as a controlled ingredient that changes temperature, texture, dilution, speed, and perceived quality.',
            technical_depth: 'Ice behavior is controlled by thermal mass, surface area, starting temperature, and wetness. Cube ice is the workhorse for shaking and building. Large cubes and clear ice slow dilution and increase perceived luxury in rocks drinks. Cracked ice accelerates chill while retaining craft texture. Crushed and pebble ice create fast dilution for swizzles, juleps, tiki, Mojitos, and Caipirinhas. Collins spears protect carbonation and presentation in tall drinks. Dirty ice and wet bin ice create uncontrolled dilution and off aromas. Shaking ice is not serving ice because it is fractured, wet, and already warmed by the drink.',
            taxonomy: [
              { type: 'Cube ice', usage: 'General shaking, stirring, building, and highball service when hard and dry.' },
              { type: 'Large clear cube', usage: 'Old Fashioned, Negroni, spirit-forward rocks drinks, premium visual signal.' },
              { type: 'Cracked ice', usage: 'Juleps, swizzles, and stirred drinks needing faster chill without crushed-ice collapse.' },
              { type: 'Crushed or pebble ice', usage: 'Tropical, mint, cobbler, and long drinks where fast chill and dilution are desired.' },
              { type: 'Collins spear', usage: 'Carbonated tall drinks; lowers nucleation and preserves bubbles longer.' },
              { type: 'Dirty or wet ice', usage: 'Never used in premium service; it creates immediate dilution and hygiene risk.' }
            ],
            terminology: ['thermal mass', 'surface area', 'wet ice', 'dry ice', 'secondary dilution', 'tempered ice', 'nucleation'],
            common_failures: ['Serving on shaking ice', 'Using wet bin ice for rocks drinks', 'Crushed ice in carbonated highballs', 'Large cubes that do not fit glassware', 'Ignoring drainage during a rush'],
            amateur: 'Treats ice as a cold filler and uses whatever is closest.',
            pro: 'Assigns exact ice format to every spec and controls dilution from tin to glass.',
            professional_standard: 'Every cocktail specification states shake ice, stir ice, and final serving ice. Premium bars maintain at least three service ice formats.',
            real_service_context: 'During a Friday rush, poor ice discipline turns a perfect spec into a watery drink before it reaches the guest.',
            practical_execution: ['Drain ice wells regularly', 'Discard shaking ice', 'Serve spirit-forward drinks on fresh large-format ice', 'Use crushed ice only when the recipe expects fast dilution'],
            guest_application: 'Guests read clear large ice as care, price justification, and bar confidence.',
            manager_notes: 'Audit ice condition every 30 minutes. Clumped, glossy, or standing-water ice is a quality failure.',
            drill: 'Build the same Old Fashioned on wet cube ice and on a dry large cube. Taste after 2, 5, and 8 minutes.',
            assessment_questions: ['Why is shaking ice not serving ice?', 'Which ice format best protects a carbonated highball?', 'What service risk does wet ice create?']
          }),
          lesson({
            id: 'bar-002',
            title: 'Shaking Mechanics, Aeration, And Emulsification',
            duration: '35 min',
            objective: 'Shake citrus, dairy, egg white, and texture-driven cocktails with correct chill, dilution, and aeration.',
            technical_depth: 'Shaking is a kinetic process. It chills rapidly, dilutes through fracture and contact, and forces air into the drink. Citrus cocktails need aeration because acidity feels sharp without texture. Egg white, aquafaba, cream, pineapple, and citrus require enough energy to integrate foam or body. A dry shake builds protein structure before ice is added; a reverse dry shake can improve foam stability. Spirit-forward cocktails are not shaken because aeration clouds texture and damages clarity.',
            taxonomy: [
              { type: 'Hard shake', usage: 'Daiquiri, Margarita, Sidecar, Whiskey Sour, Clover Club.' },
              { type: 'Dry shake', usage: 'Egg white or aquafaba sours before ice.' },
              { type: 'Reverse dry shake', usage: 'Foam-focused sours when a tighter head is desired.' },
              { type: 'Whip shake', usage: 'Tiki or crushed-ice drinks needing light integration before dump service.' }
            ],
            terminology: ['aeration', 'emulsification', 'dry shake', 'reverse dry shake', 'double strain', 'foam stability', 'dilution curve'],
            common_failures: ['Weak short shake', 'Shaking Martinis or Negronis', 'No double strain for citrus pulp', 'Foam collapse in egg white drinks', 'Warm tins from overloaded rounds'],
            amateur: 'Moves the tin quickly but with little ice travel or rhythm.',
            pro: 'Creates full tin travel, controlled rhythm, and a cold tin on both sides before straining.',
            professional_standard: 'All shaken citrus drinks receive a hard shake and are fine-strained when texture requires polish.',
            real_service_context: 'A guest who orders a sour expects brightness and silk. A weak shake makes the drink taste cheap even if ingredients are premium.',
            practical_execution: ['Use hard cold ice', 'Shake 10 to 14 seconds for most sours', 'Double strain when pulp or chips reduce polish', 'Confirm egg white alternatives when required'],
            guest_application: 'The guest experiences shaking quality through foam, brightness, and first-sip texture.',
            manager_notes: 'Listen to the shake. A hollow rattle usually means poor tin fill or weak force.',
            drill: 'Shake one Daiquiri for 6 seconds and one for 12 seconds. Compare temperature, foam, and perceived acidity.',
            assessment_questions: ['Why does a citrus cocktail need aeration?', 'When should a bartender dry shake?', 'Which drink family should usually be stirred instead?']
          }),
          lesson({
            id: 'bar-003',
            title: 'Stirring, Clarity, And Spirit-Forward Texture',
            duration: '32 min',
            objective: 'Stir spirit-forward cocktails to precise temperature, dilution, clarity, and texture.',
            technical_depth: 'Stirring chills and dilutes without aeration. It protects the silky texture of drinks built from spirits, vermouth, fortified wine, liqueurs, and bitters. Correct stirring uses cold dry ice, a chilled mixing glass, and smooth spoon contact against the glass wall. Under-stirred drinks taste hot, harsh, and short. Over-stirred drinks lose architecture and aroma. The bartender must understand that dilution unlocks aroma and integrates sugar, bitterness, and alcohol.',
            taxonomy: [
              { type: 'Martini structure', usage: 'Gin or vodka, dry vermouth, optional bitters, served very cold and clear.' },
              { type: 'Manhattan structure', usage: 'Whiskey, sweet vermouth, bitters, stirred for integration and polish.' },
              { type: 'Negroni structure', usage: 'Equal bitter, vermouth, and spirit needing dilution for bitterness control.' },
              { type: 'Sazerac structure', usage: 'Rinse, stir, aromatic service without final ice.' }
            ],
            terminology: ['mixing glass', 'bar spoon', 'julep strainer', 'wash line', 'chilling curve', 'viscosity', 'clarity'],
            common_failures: ['Under-diluted Martini', 'Loud clanking stir', 'Room-temperature mixing glass', 'Wrong garnish expression', 'Serving cloudy spirit-forward drinks'],
            amateur: 'Counts a few fast rotations and strains before integration.',
            pro: 'Stirs with quiet control until the drink is cold, glossy, and texturally complete.',
            professional_standard: 'Martinins, Manhattans, Negronis, Boulevardiers, Rob Roys, and Sazeracs are stirred in a premium program unless a deliberate house style says otherwise.',
            real_service_context: 'A high-spend guest ordering a Martini is often testing bar discipline.',
            practical_execution: ['Chill glassware', 'Use enough ice to fill the mixing vessel', 'Stir smoothly for 25 to 45 rotations depending on ice', 'Taste when training, not during live service'],
            guest_application: 'A properly stirred cocktail feels expensive because it is cold, clear, and seamless.',
            manager_notes: 'Pre-batch vermouth and spirit ratios only when service volume requires it; never sacrifice final stir quality.',
            drill: 'Stir a Negroni for 20, 35, and 50 rotations. Record taste, temperature, and dilution.',
            assessment_questions: ['Why avoid aeration in a Manhattan?', 'What does under-stirring taste like?', 'Which variables change ideal rotation count?']
          }),
          lesson({
            id: 'bar-004',
            title: 'Carbonation, Highballs, And Spritz Architecture',
            duration: '34 min',
            objective: 'Protect carbonation and build premium long drinks that stay lively through service.',
            technical_depth: 'Carbonation is fragile. Bubbles escape through nucleation points, warm liquid, rough ice, aggressive stirring, dirty glassware, and excessive build time. Highballs succeed when spirit, temperature, glass, ice, and carbonated ingredient are aligned. The best carbonated drinks are built cold, minimally handled, and served fast. A flat highball feels cheap regardless of premium ingredients.',
            taxonomy: [
              { type: 'Highball', usage: 'Spirit plus carbonated mixer; clarity, temperature, and bubble retention matter most.' },
              { type: 'Spritz', usage: 'Bitter or aperitivo base, sparkling wine, soda, large wine glass, low-ABV social role.' },
              { type: 'Collins', usage: 'Shaken sour base topped with soda; must keep lift after citrus dilution.' },
              { type: 'Mule', usage: 'Ginger beer, lime, spirit; spice and carbonation carry the drink.' }
            ],
            terminology: ['nucleation', 'CO2 retention', 'top charge', 'long build', 'sparkling lift', 'effervescence'],
            common_failures: ['Over-stirring soda', 'Warm mixer', 'Rough chipped ice', 'Building too early', 'Flat sparkling wine'],
            amateur: 'Treats soda as filler and stirs until bubbles disappear.',
            pro: 'Builds cold, lifts gently, and protects bubbles from bottle to guest.',
            professional_standard: 'Carbonated drinks are built to order, with chilled components and minimal agitation.',
            real_service_context: 'Large event welcome drinks often fail because carbonation is prepared too far in advance.',
            practical_execution: ['Chill glass and mixer', 'Use a Collins spear when possible', 'Add carbonation last', 'Lift once with a bar spoon instead of stirring aggressively'],
            guest_application: 'Guests perceive lively bubbles as freshness, energy, and value.',
            manager_notes: 'For events, use still batching for the base and carbonate or top only at service.',
            drill: 'Build two Gin Tonics: one with warm tonic and rough ice, one with chilled tonic and a spear. Taste after 4 minutes.',
            assessment_questions: ['What creates nucleation?', 'Why should carbonation be added last?', 'How should a welcome spritz be prepared for 150 guests?']
          }),
          lesson({
            id: 'bar-005',
            title: 'Acid Systems, Syrups, Brix, And Cocktail Balance',
            duration: '42 min',
            objective: 'Build balanced drinks by understanding acid type, sugar concentration, perceived sweetness, and texture.',
            technical_depth: 'Cocktail balance is not a simple sweet-sour equation. Lemon, lime, grapefruit, verjus, vinegar, citric, malic, lactic, and phosphoric acids all create different shapes. Syrups vary by Brix, viscosity, flavor, and shelf life. Rich syrup is not interchangeable with simple syrup. Honey, agave, orgeat, grenadine, oleo saccharum, and fruit syrups bring body and flavor as well as sweetness. Balance depends on spirit weight, acid pressure, sugar concentration, dilution, aroma, and serving temperature.',
            taxonomy: [
              { type: 'Citrus acid', usage: 'Fresh brightness; short shelf life; requires daily prep.' },
              { type: 'Verjus or wine acid', usage: 'Gentler acidity for low-ABV or wine-adjacent drinks.' },
              { type: 'Rich syrup', usage: 'Higher Brix, more body, less water contribution.' },
              { type: 'Oleo saccharum', usage: 'Citrus oil sweetness; premium aroma and punch applications.' },
              { type: 'Orgeat', usage: 'Nut texture, sweetness, and tiki structure.' }
            ],
            terminology: ['Brix', 'titratable acidity', 'perceived sweetness', 'oleo saccharum', 'acid adjustment', 'shelf stability'],
            common_failures: ['Using bottled citrus', 'Swapping rich and simple syrup without adjustment', 'Making fruit syrups without dating', 'Ignoring acid in low-ABV drinks'],
            amateur: 'Follows ml amounts but cannot explain why the drink is sharp or flat.',
            pro: 'Adjusts acid, sugar, and dilution as a system while preserving the house spec.',
            professional_standard: 'All syrups are labeled with date, ratio, allergen where relevant, and discard standard.',
            real_service_context: 'A summer Margarita menu can become inconsistent if lime acidity changes and no one tastes the batch.',
            practical_execution: ['Taste citrus at prep', 'Record syrup ratios', 'Use rich syrup intentionally', 'Adjust batch acid before service, not during the rush'],
            guest_application: 'Balanced acidity makes a drink feel refreshing, not sour; sweetness should carry flavor, not hide errors.',
            manager_notes: 'Track syrup waste and citrus yield. Balance and profitability are linked.',
            drill: 'Make three Daiquiris with 15, 20, and 25 ml syrup. Identify where the rum disappears.',
            assessment_questions: ['Why is Brix important?', 'When is verjus better than lime?', 'What changes when simple syrup becomes rich syrup?']
          })
        ]
      },
      {
        id: 'bar-operations',
        title: 'Bar Operations, Spirits, Costing, And Guest Strategy',
        lessons: [
          lesson({
            id: 'bar-006',
            title: 'Spirit Categories And Modifier Logic',
            duration: '40 min',
            objective: 'Understand major spirit families and how modifiers change structure, aroma, and guest perception.',
            technical_depth: 'A bartender must understand spirit category before building or selling cocktails. Gin brings botanicals and dryness. Vodka brings neutrality and texture. Rum ranges from grassy to molasses-rich. Tequila brings agave, pepper, citrus affinity, and salinity. Mezcal adds smoke and earth. Whisky contributes grain, oak, spice, and weight. Brandy contributes fruit, oak, and luxury cues. Liqueurs, vermouths, sherries, amari, bitters, and fortified wines are not afterthoughts; they are architecture.',
            taxonomy: [
              { type: 'Base spirit', usage: 'Primary identity and alcohol structure.' },
              { type: 'Modifier', usage: 'Vermouth, sherry, amaro, liqueur, cordial, or bitters that direct the drink.' },
              { type: 'Bridge ingredient', usage: 'Connects flavors that otherwise feel separate, such as saline sherry between citrus and spirit.' },
              { type: 'Accent', usage: 'Small measured ingredient that changes aroma or finish.' }
            ],
            terminology: ['base spirit', 'modifier', 'bridge', 'accent', 'ABV', 'botanical load', 'oak influence', 'congener'],
            common_failures: ['Using premium spirits where their character is hidden', 'Too many liqueurs', 'Smoke without structure', 'No bridge between strong flavors'],
            amateur: 'Chooses spirits by popularity only.',
            pro: 'Chooses spirits by role, weight, flavor compatibility, and target guest.',
            professional_standard: 'Every cocktail spec must identify base, modifier, acid or bitter structure, sweetener, texture, and garnish role.',
            real_service_context: 'When a guest says they dislike whisky, a manager may still sell a brandy or rum drink by understanding shared weight without shared flavor.',
            practical_execution: ['Know one signature use for each major spirit', 'Taste modifiers alone', 'Use amari and sherries as structure tools', 'Avoid masking expensive base spirits'],
            guest_application: 'Spirit knowledge allows staff to recommend by preference instead of memorizing menu descriptions.',
            manager_notes: 'Train staff on category language weekly: agave, grain, cane, grape, botanical, bitter, fortified.',
            drill: 'Classify five house cocktails by base, modifier, bridge, and accent.',
            assessment_questions: ['What is a bridge ingredient?', 'Why is sherry useful in cocktails?', 'When should a premium spirit not be used?']
          }),
          lesson({
            id: 'bar-007',
            title: 'Batching, Shelf Life, And Consistency Control',
            duration: '38 min',
            objective: 'Batch cocktails safely and profitably without losing freshness, balance, or service identity.',
            technical_depth: 'Batching is a consistency system, not a shortcut. Stable components include spirits, liqueurs, vermouths when handled correctly, bitters, and many syrups. Unstable components include fresh citrus, dairy, herbs, carbonated ingredients, egg white, and many juices. Dilution may be pre-added for freezer Martinis or retained for final shaking. Shelf life depends on ABV, sugar, acid, oxygen, temperature, and sanitation. Every batch needs recipe, date, maker, yield, allergen, storage, and discard policy.',
            taxonomy: [
              { type: 'Spirit-only batch', usage: 'High stability for stirred drinks and high-volume service.' },
              { type: 'Citrus batch', usage: 'Short window; usually same-day service only.' },
              { type: 'Event batch', usage: 'Built for controlled volume, speed, and predictable garnish deployment.' },
              { type: 'Freezer batch', usage: 'Pre-diluted stirred drinks served extremely cold.' }
            ],
            terminology: ['batch yield', 'pre-dilution', 'cold chain', 'same-day citrus', 'oxidation', 'discard policy'],
            common_failures: ['Batching citrus too early', 'No label or maker', 'Forgetting water dilution', 'Batching carbonated drinks', 'No allergen note'],
            amateur: 'Batches everything to save time.',
            pro: 'Batches only components that protect speed and consistency without damaging freshness.',
            professional_standard: 'Every batch has label, date, recipe ratio, yield, storage rule, and discard time.',
            real_service_context: 'A 200-guest event can be won or lost by whether welcome cocktails are batched intelligently.',
            practical_execution: ['Separate stable and unstable components', 'Add carbonation at service', 'Taste batch before service', 'Record final yield against expected portions'],
            guest_application: 'Good batching makes large-volume service feel personal and consistent.',
            manager_notes: 'Batching should reduce labor pressure and variance, not hide weak technique.',
            drill: 'Create a 50-serve Margarita batch plan with citrus added same day and dilution accounted for.',
            assessment_questions: ['Which ingredients should not be batched early?', 'What must appear on a batch label?', 'Why pre-dilute a freezer Martini?']
          }),
          lesson({
            id: 'bar-008',
            title: 'Garnish Systems, Aroma, And Waste Control',
            duration: '30 min',
            objective: 'Use garnish as aroma, identification, and perceived value while controlling labor and waste.',
            technical_depth: 'Garnish is functional when it adds aroma, signals flavor, improves visual memory, or supports menu identity. Garnish is waste when it is decorative without sensory contribution, slow to execute, unstable, or expensive relative to perceived value. Citrus twists express oil. Mint must be aromatic and alive. Dehydrated citrus can look premium but often contributes little aroma. Herbs, salts, pickles, olives, edible flowers, spices, and skewers must be chosen by drink role, shelf life, and service speed.',
            taxonomy: [
              { type: 'Aromatic garnish', usage: 'Twists, mint, herbs, spices, expressed oils.' },
              { type: 'Flavor garnish', usage: 'Olive, onion, pickled fruit, salted rim, candied ginger.' },
              { type: 'Identity garnish', usage: 'Visual marker for menu recognition and staff speed.' },
              { type: 'Waste-risk garnish', usage: 'Fresh flowers, fragile herbs, complex skewers, high-prep fruit.' }
            ],
            terminology: ['expressed oil', 'aroma halo', 'rim discipline', 'garnish par', 'prep yield', 'holding quality'],
            common_failures: ['Dead mint', 'Over-rimmed salt', 'Garnishes that slow service', 'No par levels', 'Using dehydrated citrus as a false luxury cue'],
            amateur: 'Adds garnish because the drink looks empty.',
            pro: 'Adds garnish because it changes aroma, identity, or guest memory.',
            professional_standard: 'Every garnish must have a sensory or operational reason.',
            real_service_context: 'A beautiful garnish that takes 40 seconds destroys service speed on a full bar.',
            practical_execution: ['Set garnish par by forecast', 'Store herbs cold and upright', 'Express citrus oils over the drink, not the floor', 'Remove slow garnishes from peak specs'],
            guest_application: 'A guest remembers aroma before they remember exact ingredients.',
            manager_notes: 'Track garnish waste by item. Small garnish waste becomes large monthly leakage.',
            drill: 'Remove the garnish from three drinks and identify what sensory information disappears.',
            assessment_questions: ['What makes a garnish functional?', 'Why can dehydrated citrus be weak?', 'How should mint be held?']
          }),
          lesson({
            id: 'bar-009',
            title: 'Station Ergonomics, Speed Rail, And Rush-Hour Flow',
            duration: '36 min',
            objective: 'Build and maintain a station layout that increases speed, reduces movement, and protects consistency.',
            technical_depth: 'Bar speed is designed before service. The station should reduce reach distance, hand switching, bottle searching, garnish confusion, and tool loss. Speed rail should be organized by volume and sequence, not brand politics. Tools must have a fixed home. Citrus, syrups, bitters, napkins, straws, picks, garnish, glassware, and ice must match the night forecast. Ergonomics protects staff body mechanics and protects the guest from slow or inconsistent output.',
            taxonomy: [
              { type: 'Speed rail', usage: 'Highest velocity spirits and builds in consistent order.' },
              { type: 'Prep rail', usage: 'Citrus, syrups, juices, modifiers, and garnishes for current menu.' },
              { type: 'Tool zone', usage: 'Tins, strainers, spoons, jiggers, peelers, muddlers with fixed homes.' },
              { type: 'Glassware zone', usage: 'Shortest path from build to final presentation.' }
            ],
            terminology: ['mise en place', 'reach economy', 'station par', 'ticket velocity', 'handoff point', 'bottleneck'],
            common_failures: ['No fixed tool home', 'Overfilled station', 'Slow-moving bottles in speed rail', 'Glassware too far from finish zone', 'Shared garnish confusion'],
            amateur: 'Works harder during a rush because the station was not built for the menu.',
            pro: 'Designs station flow so repeated builds require fewer decisions and fewer steps.',
            professional_standard: 'A bartender should build the top five house cocktails without searching for any item.',
            real_service_context: 'When three tickets hit at once, station design becomes guest wait time.',
            practical_execution: ['Place highest-volume bottles closest', 'Par garnish by forecast', 'Reset tools after every round', 'Remove non-service clutter before doors open'],
            guest_application: 'Guests experience station ergonomics as speed, calm, and confidence.',
            manager_notes: 'Run a station audit before every peak shift. Do not accept beautiful chaos.',
            drill: 'Time a bartender building three menu cocktails before and after station reorganization.',
            assessment_questions: ['How should speed rail be organized?', 'What is reach economy?', 'Why does clutter reduce quality?']
          }),
          lesson({
            id: 'bar-010',
            title: 'Menu Engineering, Costing, Waste, And Responsible Service',
            duration: '50 min',
            objective: 'Evaluate a cocktail by margin, operational load, guest psychology, waste exposure, and alcohol responsibility.',
            technical_depth: 'A cocktail earns menu space only if it has a clear role, reliable execution, strong perceived value, acceptable COGS, manageable prep, and responsible ABV positioning. Menu engineering balances stars, workhorses, puzzles, and dogs. Costing includes spirit, modifiers, citrus, syrup, garnish, prep waste, batching loss, and labor pressure. Responsible alcohol service includes ABV awareness, pacing, water, food pairing, refusal language, and staff escalation.',
            taxonomy: [
              { type: 'Star', usage: 'High margin, high popularity; protect placement and consistency.' },
              { type: 'Workhorse', usage: 'Reliable seller with acceptable margin and operational ease.' },
              { type: 'Puzzle', usage: 'High margin but low sales; needs language, placement, or renaming.' },
              { type: 'Dog', usage: 'Low margin and low sales; remove or redesign.' }
            ],
            terminology: ['COGS', 'gross margin', 'menu mix', 'pour cost', 'prep yield', 'waste variance', 'ABV pacing', 'responsible refusal'],
            common_failures: ['Pricing only by competitor menu', 'Ignoring garnish labor', 'Keeping low-selling signatures for ego', 'Over-serving high-ABV drinks', 'No spill tracking'],
            amateur: 'Creates drinks based on taste alone.',
            pro: 'Creates drinks that sell, repeat, protect margin, and serve guests responsibly.',
            professional_standard: 'Every signature drink has target price, theoretical cost, expected prep load, sales language, and responsible service note.',
            real_service_context: 'A high-cost drink can be profitable if it has premium perception and controlled prep; a cheap drink can lose money through waste and slow execution.',
            practical_execution: ['Cost every ingredient', 'Track garnish waste', 'Review menu mix monthly', 'Train staff on ABV and refusal language', 'Remove drinks that do not earn space'],
            guest_application: 'Guests buy confidence, story, and fit; not just ingredients.',
            manager_notes: 'Never approve a cocktail without margin, execution, and responsible-service review.',
            drill: 'Classify the current cocktail menu into star, workhorse, puzzle, and dog.',
            assessment_questions: ['What makes a cocktail earn menu space?', 'What costs are often forgotten?', 'How does responsible service affect menu design?']
          })
        ]
      }
    ]
  },
  {
    id: 'wine-academy',
    title: 'Wine Academy',
    dean: 'Sommelier and WSET Educator',
    color: '#8b3a3a',
    category: 'Wine Knowledge',
    description: 'WSET-inspired wine education for tasting, structure, grape varieties, terroir, service, pairing, faults, regions, and sales language.',
    badge: 'Wine Foundation',
    roles: ['employee', 'manager', 'admin'],
    totalLessons: 10,
    modules: [
      {
        id: 'wine-structure',
        title: 'Tasting, Structure, Faults, And Service',
        lessons: [
          lesson({
            id: 'wine-001',
            title: 'Systematic Tasting: Appearance, Nose, Palate, Conclusion',
            duration: '50 min',
            objective: 'Assess wine using a structured tasting grid and translate it into useful guest language.',
            technical_depth: 'Professional tasting separates observation from opinion. Appearance indicates age, grape, extraction, oxidation, and condition. Nose identifies aroma intensity, primary fruit, secondary winemaking, tertiary development, and faults. Palate assesses sweetness, acidity, tannin, alcohol, body, flavor intensity, finish, and balance. Conclusion evaluates quality through balance, length, intensity, complexity, and typicity. Staff do not need poetic descriptions; they need accurate structure and guest-fit language.',
            taxonomy: [
              { type: 'Appearance', usage: 'Clarity, color, rim variation, viscosity, bubbles, deposit.' },
              { type: 'Nose', usage: 'Condition, intensity, fruit, floral, herbal, spice, oak, development.' },
              { type: 'Palate', usage: 'Sweetness, acid, tannin, alcohol, body, flavor, finish.' },
              { type: 'Conclusion', usage: 'Quality, style, readiness, pairing, guest fit.' }
            ],
            terminology: ['BLIC', 'primary aroma', 'secondary aroma', 'tertiary aroma', 'finish', 'typicity', 'balance'],
            common_failures: ['Describing only fruit', 'Calling all acidity sour', 'Ignoring faults', 'Recommending by price first'],
            amateur: 'Says the wine is smooth or nice without structure.',
            pro: 'Names structure and explains which guest or dish it serves.',
            professional_standard: 'Every wine recommendation should include style, structure, and reason.',
            real_service_context: 'A table asks for a dry white with fish. The correct answer depends on acidity, body, sauce, and guest preference.',
            practical_execution: ['Look before smelling', 'Smell before tasting', 'Assess structure before preference', 'Translate into one guest-friendly sentence'],
            guest_application: 'Guests trust concise wine language more than long technical speeches.',
            manager_notes: 'Run weekly blind structure drills: acid, body, tannin, alcohol, sweetness.',
            drill: 'Taste three whites blind and rank acid level by salivation recovery time.',
            assessment_questions: ['What does BLIC measure?', 'What is the difference between aroma and structure?', 'How do you translate acidity for a guest?']
          }),
          lesson({
            id: 'wine-002',
            title: 'Acidity, Tannin, Alcohol, Sweetness, And Body',
            duration: '45 min',
            objective: 'Use structural elements to recommend wine with confidence and pair it correctly.',
            technical_depth: 'Acidity creates freshness, salivation, and food compatibility. Tannin creates drying grip from skins, seeds, stems, and oak; it binds with protein and fat. Alcohol creates body, warmth, and weight. Sweetness balances spice, salt, and acidity. Body is the combined perception of alcohol, sugar, extract, oak, and texture. Structure is more useful than grape name when matching guest preference.',
            taxonomy: [
              { type: 'High acidity', usage: 'Seafood, fried foods, rich sauces, freshness seekers.' },
              { type: 'Firm tannin', usage: 'Red meat, aged cheese, guests wanting structure.' },
              { type: 'High alcohol', usage: 'Riper climates, fuller body, warmer finish.' },
              { type: 'Off-dry sweetness', usage: 'Spice, salty dishes, guests who dislike sharp wine.' },
              { type: 'Full body', usage: 'Rich dishes and guests wanting weight.' }
            ],
            terminology: ['malic acid', 'tartaric acid', 'phenolics', 'residual sugar', 'extract', 'body', 'astringency'],
            common_failures: ['Pairing high tannin with delicate fish', 'Ignoring sweetness in Riesling', 'Calling high alcohol premium automatically', 'Missing guest desire for body'],
            amateur: 'Recommends red with meat and white with fish only.',
            pro: 'Matches acid, tannin, body, and sauce intensity to the guest and dish.',
            professional_standard: 'Staff should identify the dominant structural need before naming a bottle.',
            real_service_context: 'A spicy dish often needs lower alcohol and some sweetness, not a bigger red.',
            practical_execution: ['Ask crisp or rich', 'Ask light or full-bodied', 'Use tannin with protein', 'Use acid to cut fat'],
            guest_application: 'Structure language helps guests feel guided rather than sold to.',
            manager_notes: 'Make staff taste tannin with and without protein to understand why pairing works.',
            drill: 'Pair one dish with three wines and explain which structural element succeeds.',
            assessment_questions: ['Why does tannin work with steak?', 'How does sugar affect spice?', 'What creates body?']
          }),
          lesson({
            id: 'wine-003',
            title: 'Oak, Winemaking Choices, And Maturation',
            duration: '42 min',
            objective: 'Explain how oak and winemaking affect aroma, texture, cost, and guest preference.',
            technical_depth: 'Winemaking changes wine style as much as grape variety. Oak can add vanilla, clove, toast, smoke, coconut, structure, oxygen exposure, and texture. New oak is stronger than old oak. Large vessels give less oak flavor than small barrels. Malolactic conversion softens acidity and creates buttery or creamy notes. Lees aging adds texture and bread-like complexity. Skin contact changes color, tannin, and grip. Maturation adds tertiary aromas such as dried fruit, leather, tobacco, mushroom, honey, petrol, and nuts.',
            taxonomy: [
              { type: 'New oak', usage: 'High flavor impact; vanilla, spice, toast; cost and luxury cue.' },
              { type: 'Old oak', usage: 'Texture and oxygen without strong oak flavor.' },
              { type: 'Lees aging', usage: 'Texture, creaminess, bread notes, Champagne and Chardonnay relevance.' },
              { type: 'Malolactic conversion', usage: 'Softens acid; butter and cream in Chardonnay.' },
              { type: 'Bottle age', usage: 'Tertiary complexity and reduced fruit freshness.' }
            ],
            terminology: ['malolactic conversion', 'lees', 'batonnage', 'barrique', 'oxidative', 'reductive', 'tertiary'],
            common_failures: ['Calling every oaked wine buttery', 'Assuming older is always better', 'Missing oxidative faults', 'Overselling oak to guests who want freshness'],
            amateur: 'Describes oak as expensive flavor.',
            pro: 'Explains oak and winemaking as texture, aroma, and style decisions.',
            professional_standard: 'Staff must ask whether the guest wants crisp/mineral or round/oaked before recommending Chardonnay.',
            real_service_context: 'A guest who dislikes Chardonnay may only dislike heavily oaked buttery Chardonnay.',
            practical_execution: ['Separate grape from winemaking style', 'Use oak language carefully', 'Match richer winemaking to richer dishes', 'Avoid aged bottles for guests seeking freshness'],
            guest_application: 'Good explanations reopen categories guests think they dislike.',
            manager_notes: 'Train with unoaked Chablis and oaked California Chardonnay side by side.',
            drill: 'Taste two Chardonnays and identify oak, lees, acid, and body differences.',
            assessment_questions: ['What does malolactic conversion do?', 'How does new oak differ from old oak?', 'What are tertiary aromas?']
          }),
          lesson({
            id: 'wine-004',
            title: 'Wine Faults, Storage, And Condition Assessment',
            duration: '40 min',
            objective: 'Identify faulty or poorly stored wine before it damages guest trust.',
            technical_depth: 'Wine service requires condition control. TCA creates musty cardboard aromas. Oxidation creates bruised apple, flat fruit, brown color, and tired palate. Volatile acidity can smell like vinegar or nail polish at high levels. Brettanomyces can smell like barnyard, medicinal, or leather; sometimes acceptable at low levels depending on style, but risky in service. Heat damage creates cooked fruit and pushed corks. Light strike affects delicate wines. Storage temperature, humidity, vibration, light, and closure condition protect quality.',
            taxonomy: [
              { type: 'TCA/cork taint', usage: 'Musty, wet cardboard, muted fruit; bottle should be replaced.' },
              { type: 'Oxidation', usage: 'Brown color, nutty bruised fruit, flat palate when unintended.' },
              { type: 'Volatile acidity', usage: 'Vinegar or nail polish; acceptable only in tiny style-dependent amounts.' },
              { type: 'Heat damage', usage: 'Cooked fruit, seepage, pushed cork, dull finish.' },
              { type: 'Light strike', usage: 'Skunky aroma in light-sensitive wines.' }
            ],
            terminology: ['TCA', 'oxidation', 'volatile acidity', 'Brettanomyces', 'reduction', 'ullage', 'light strike'],
            common_failures: ['Serving corked wine because staff fear replacing it', 'Storing wine upright too long', 'Overheating storage area', 'Not smelling the cork or wine condition'],
            amateur: 'Waits for the guest to complain.',
            pro: 'Checks condition calmly and replaces compromised bottles without drama.',
            professional_standard: 'A server must know the smell of TCA and the escalation process for faulty bottles.',
            real_service_context: 'A single corked premium bottle can turn a celebration into a trust failure.',
            practical_execution: ['Inspect closure and fill level', 'Smell first pour before serving broadly', 'Escalate calmly', 'Log faulty bottles for supplier credit'],
            guest_application: 'Professional handling of faults increases trust, not embarrassment.',
            manager_notes: 'Keep a fault reference kit or known examples for staff training.',
            drill: 'Smell fault samples or controlled examples and identify each fault by aroma.',
            assessment_questions: ['What does TCA smell like?', 'What are signs of heat damage?', 'How should staff respond to a suspected fault?']
          }),
          lesson({
            id: 'wine-005',
            title: 'Service Temperature, Glassware, Decanting, And Pour Discipline',
            duration: '38 min',
            objective: 'Serve wine at the correct temperature and in the correct format for aroma, texture, and guest confidence.',
            technical_depth: 'Wine temperature changes perception. Too warm red wine feels alcoholic and loose. Too cold white wine loses aroma and texture. Sparkling needs cold service to protect pressure and freshness. Glass shape affects aromatic concentration, oxygen exposure, and perceived texture. Decanting can separate sediment or open a young structured wine, but unnecessary decanting can damage delicate older bottles. Pour discipline protects pacing, value, and bottle yield.',
            taxonomy: [
              { type: 'Sparkling', usage: 'Cold service, narrow or tulip glass, protect bubbles.' },
              { type: 'Light white/rose', usage: 'Chilled but not frozen; protect freshness and aroma.' },
              { type: 'Full-bodied white', usage: 'Slightly warmer to show texture and oak.' },
              { type: 'Light red', usage: 'Slight chill; improves freshness and drinkability.' },
              { type: 'Structured red', usage: 'Cool cellar temperature, decant when needed.' }
            ],
            terminology: ['cellar temperature', 'sediment', 'double decant', 'standard pour', 'aromatic bowl', 'tulip glass'],
            common_failures: ['Serving reds too warm', 'Overfilling glasses', 'Decanting old wine aggressively', 'Using one glass for every style'],
            amateur: 'Serves by color only.',
            pro: 'Serves by style, age, structure, and guest occasion.',
            professional_standard: 'Wine service must protect aroma, temperature, portion control, and guest pacing.',
            real_service_context: 'A premium red at room temperature in a hot dining room can taste heavy and alcoholic.',
            practical_execution: ['Chill light reds when appropriate', 'Pour measured portions', 'Use correct glassware for premium bottles', 'Decant only with a reason'],
            guest_application: 'Correct service makes wine feel more expensive without changing the bottle.',
            manager_notes: 'Audit service temperature with a thermometer until staff internalize it.',
            drill: 'Serve the same red at 12C, 16C, and 22C and compare alcohol perception.',
            assessment_questions: ['Why can red wine be too warm?', 'When should wine be decanted?', 'How does glassware affect aroma?']
          })
        ]
      },
      {
        id: 'wine-world',
        title: 'Grapes, Regions, Pairing, And Sales Psychology',
        lessons: [
          lesson({
            id: 'wine-006',
            title: 'Climate, Terroir, And Old World Vs New World',
            duration: '46 min',
            objective: 'Explain how place changes wine style and use region language without confusing guests.',
            technical_depth: 'Climate affects ripeness, acid, alcohol, body, and flavor. Cool climates tend toward higher acidity, lower alcohol, lighter body, and citrus, green fruit, or herbal tones. Warm climates tend toward riper fruit, higher alcohol, fuller body, lower acidity, and softer structure. Terroir includes climate, soil, aspect, altitude, drainage, human tradition, and regulation. Old World wines often emphasize place, restraint, acidity, and savory complexity. New World wines often emphasize grape, fruit ripeness, clarity, and accessibility, though this is not absolute.',
            taxonomy: [
              { type: 'Cool climate', usage: 'Chablis, Loire, Champagne, Mosel, Alto Adige, coastal Pinot regions.' },
              { type: 'Warm climate', usage: 'Barossa, Napa, Mendoza, southern Italy, Priorat, many Mediterranean zones.' },
              { type: 'Old World', usage: 'Place-led, regulated, food-oriented, often higher acid.' },
              { type: 'New World', usage: 'Grape-led, expressive fruit, producer style, often easier guest recognition.' }
            ],
            terminology: ['terroir', 'diurnal range', 'aspect', 'altitude', 'appellation', 'maritime climate', 'continental climate'],
            common_failures: ['Stereotyping all Old World as dry or difficult', 'Ignoring producer style', 'Confusing grape and region', 'Using geography without guest benefit'],
            amateur: 'Lists countries.',
            pro: 'Explains what the region means in the glass.',
            professional_standard: 'Every regional explanation must connect to taste, food, or guest preference.',
            real_service_context: 'A guest asking for Sauvignon Blanc may prefer Loire restraint or New Zealand intensity; climate language solves it.',
            practical_execution: ['Ask crisp or tropical', 'Use climate to predict style', 'Avoid lecturing on geography', 'Translate region into flavor and structure'],
            guest_application: 'Region language helps guests discover without feeling tested.',
            manager_notes: 'Create one-sentence style cards for top-selling regions.',
            drill: 'Compare Sancerre and Marlborough Sauvignon Blanc. Explain each in one sentence.',
            assessment_questions: ['How does cool climate affect acidity?', 'What does terroir include?', 'How should Old World language be used with guests?']
          }),
          lesson({
            id: 'wine-007',
            title: 'Major Grape Varieties And Style Families',
            duration: '55 min',
            objective: 'Recognize core grape families and guide guests by style rather than memorized bottle names.',
            technical_depth: 'Grape varieties carry typical markers, but climate and winemaking modify them. Chardonnay can be lean and mineral or rich and oaked. Sauvignon Blanc can be grassy, citrusy, tropical, or mineral. Riesling spans bone dry to sweet with high acidity. Pinot Noir is lighter, red-fruited, and acid-driven. Cabernet Sauvignon is structured with black fruit and tannin. Syrah/Shiraz ranges from pepper and violet to ripe black fruit. Merlot, Grenache, Sangiovese, Nebbiolo, Tempranillo, Chenin Blanc, Pinot Gris, and Gewurztraminer each have guest-useful style cues.',
            taxonomy: [
              { type: 'Crisp whites', usage: 'Sauvignon Blanc, Albarino, Muscadet, Pinot Grigio.' },
              { type: 'Textured whites', usage: 'Chardonnay, Chenin Blanc, white Rioja, Marsanne blends.' },
              { type: 'Aromatic whites', usage: 'Riesling, Gewurztraminer, Viognier, Torrontes.' },
              { type: 'Light reds', usage: 'Pinot Noir, Gamay, Frappato, light Grenache.' },
              { type: 'Structured reds', usage: 'Cabernet, Nebbiolo, Syrah, Tempranillo, Sangiovese.' }
            ],
            terminology: ['varietal', 'blend', 'aromatic', 'phenolic', 'minerality', 'pyrazine', 'black fruit', 'red fruit'],
            common_failures: ['Assuming all Chardonnay is buttery', 'Selling Cabernet to every red-wine guest', 'Ignoring aromatic whites', 'Not knowing lighter red options'],
            amateur: 'Recommends the most famous grape.',
            pro: 'Finds the style family that matches the guest mood and dish.',
            professional_standard: 'Staff must know at least three guest-friendly descriptors for every by-the-glass grape.',
            real_service_context: 'A guest says they want red but not heavy. Pinot Noir, Gamay, or Frappato language matters.',
            practical_execution: ['Group wines by style family', 'Ask light or full', 'Ask crisp or textured', 'Offer one safe and one discovery option'],
            guest_application: 'Style-family selling increases confidence and discovery.',
            manager_notes: 'Train staff from the by-the-glass list first, then expand to bottles.',
            drill: 'Create a style map for the current wine list with five family columns.',
            assessment_questions: ['How can Chardonnay styles differ?', 'What red grapes fit a lighter preference?', 'Why sell by style family?']
          }),
          lesson({
            id: 'wine-008',
            title: 'Sparkling And Fortified Wine Foundations',
            duration: '44 min',
            objective: 'Explain sparkling and fortified wines as premium service categories, not afterthoughts.',
            technical_depth: 'Sparkling wine quality depends on base wine, method, lees aging, pressure, dosage, and region. Traditional method wines such as Champagne, Cava, Franciacorta, and many quality sparkling wines develop bread, brioche, and texture from bottle fermentation and lees. Tank method protects fruit and freshness as in Prosecco. Pet-nat is variable and casual. Fortified wines include Sherry, Port, Madeira, Marsala, and vermouth; they add alcohol through fortification and can be dry, sweet, oxidative, biologically aged, or aromatized.',
            taxonomy: [
              { type: 'Traditional method', usage: 'Champagne-style texture, lees, complexity, premium celebrations.' },
              { type: 'Tank method', usage: 'Fresh fruit, lighter price, high-volume aperitif service.' },
              { type: 'Sherry', usage: 'Fino, Manzanilla, Amontillado, Oloroso, PX; pairing and cocktail utility.' },
              { type: 'Port', usage: 'Dessert, cheese, fortified red styles.' },
              { type: 'Vermouth', usage: 'Aromatized wine; cocktail and aperitif service.' }
            ],
            terminology: ['lees aging', 'dosage', 'autolysis', 'flor', 'oxidative aging', 'fortification', 'solera'],
            common_failures: ['Serving sparkling too warm', 'Treating Prosecco like Champagne', 'Leaving vermouth unrefrigerated', 'Not selling Sherry with food'],
            amateur: 'Uses sparkling only for celebrations.',
            pro: 'Uses sparkling and fortified wine for aperitif, pairing, cocktails, and premium discovery.',
            professional_standard: 'Open fortified and aromatized wines must be dated and stored correctly.',
            real_service_context: 'A dry Sherry can solve pairings that standard white wine cannot.',
            practical_execution: ['Know dosage terms', 'Refrigerate vermouth after opening', 'Use sparkling as upsell language', 'Pair Sherry with salty and umami dishes'],
            guest_application: 'Guests respond to sparkling as occasion and fortified wine as expertise.',
            manager_notes: 'Fortified wine training can increase by-the-glass profit without heavy inventory.',
            drill: 'Taste Prosecco, Cava, and Champagne-style sparkling. Identify texture and aroma differences.',
            assessment_questions: ['What does dosage mean?', 'Why refrigerate vermouth?', 'How does traditional method create texture?']
          }),
          lesson({
            id: 'wine-009',
            title: 'Food Pairing: Structure Before Flavor',
            duration: '48 min',
            objective: 'Pair wine through weight, acid, tannin, sweetness, salt, spice, fat, and sauce intensity.',
            technical_depth: 'Pairing starts with structure. Weight must match weight. Acid cuts fat and refreshes salt. Tannin needs protein and can clash with chili, delicate fish, and bitterness. Sweetness softens spice and balances salt. Alcohol amplifies heat. Oak can fight delicate dishes. Sauce often matters more than protein. Flavor echoes can work, but structural alignment prevents failures.',
            taxonomy: [
              { type: 'Acid with fat', usage: 'Fried food, butter sauces, rich fish, creamy dishes.' },
              { type: 'Tannin with protein', usage: 'Steak, lamb, aged cheese, grilled meats.' },
              { type: 'Sweetness with spice', usage: 'Thai, chili, salty-spicy dishes.' },
              { type: 'Weight matching', usage: 'Light wine with delicate dishes, full wine with rich dishes.' },
              { type: 'Sauce-led pairing', usage: 'Pair to sauce when it dominates the dish.' }
            ],
            terminology: ['weight match', 'contrast pairing', 'complement pairing', 'umami', 'capsaicin', 'fat cut', 'sauce dominance'],
            common_failures: ['Pairing only by protein', 'High alcohol with spicy food', 'Big tannin with fish', 'Oaky white with delicate seafood'],
            amateur: 'Memorizes red meat, white fish.',
            pro: 'Reads the dominant structure and sauce before suggesting wine.',
            professional_standard: 'Every pairing recommendation must name the structural reason.',
            real_service_context: 'A chicken dish with mushroom cream may need a richer wine than a lean grilled steak salad.',
            practical_execution: ['Ask what the guest is eating', 'Identify sauce and preparation', 'Match intensity', 'Use acid or sweetness intentionally'],
            guest_application: 'A pairing sounds premium when the reason is simple and useful.',
            manager_notes: 'Pre-shift should include one dish and two pairing options: safe and premium.',
            drill: 'Pair five menu dishes by structure, not protein.',
            assessment_questions: ['Why can sauce matter more than protein?', 'What does sweetness do with spice?', 'When can tannin fail?']
          }),
          lesson({
            id: 'wine-010',
            title: 'Guest Recommendation Language And Wine Sales Psychology',
            duration: '36 min',
            objective: 'Recommend wine with confidence, restraint, and commercial intelligence.',
            technical_depth: 'Wine sales fail when staff make guests feel ignorant or pressured. Good language narrows choice, confirms preference, and provides a reason. The best recommendations balance safety and discovery. Staff should avoid asking only for budget first; instead ask style, dish, and mood, then offer two price-aware options. Premium selling works when value is framed through occasion, scarcity, pairing precision, or producer quality.',
            taxonomy: [
              { type: 'Safe recommendation', usage: 'Recognizable style, low risk, fast decision.' },
              { type: 'Discovery recommendation', usage: 'Adjacent style with a clear reason.' },
              { type: 'Premium recommendation', usage: 'Occasion-led, producer-led, or pairing-led upgrade.' },
              { type: 'By-the-glass bridge', usage: 'Taste or glass option before bottle commitment.' }
            ],
            terminology: ['preference ladder', 'two-option close', 'premium framing', 'discovery bridge', 'occasion cue', 'price anchoring'],
            common_failures: ['Overexplaining regions', 'Embarrassing guests about budget', 'Selling only the expensive bottle', 'No second option'],
            amateur: 'Asks what price they want and points at the list.',
            pro: 'Uses two or three questions to make choice feel easy and intelligent.',
            professional_standard: 'Every wine recommendation should be confident, brief, and anchored in guest benefit.',
            real_service_context: 'A nervous guest with a client dinner needs confidence more than education.',
            practical_execution: ['Ask style and food', 'Offer two options', 'Use one reason per option', 'Confirm before opening'],
            guest_application: 'Guests buy when they feel guided, respected, and safe.',
            manager_notes: 'Track conversion from recommendation to bottle sales and coach language, not pressure.',
            drill: 'Practice a 20-second wine recommendation for three guest types.',
            assessment_questions: ['Why offer two options?', 'How should premium value be framed?', 'What question should come before price?']
          })
        ]
      }
    ]
  },
  {
    id: 'service-academy',
    title: 'Service Academy',
    dean: 'Maitre d Hotel and Michelin Service Trainer',
    color: '#2a4a6e',
    category: 'Hospitality Culture',
    description: 'Michelin-level service training for greeting, pacing, guest reading, table maintenance, upselling, recovery, VIPs, and farewell rituals.',
    badge: 'Employee Core',
    roles: ['employee', 'manager', 'admin'],
    totalLessons: 10,
    modules: [
      {
        id: 'service-sequence',
        title: 'Sequence, Awareness, And Guest Reading',
        lessons: [
          lesson({
            id: 'service-001',
            title: 'First 30 Seconds And Kinetic Greeting Protocol',
            duration: '30 min',
            objective: 'Create immediate trust, recognition, and service authority at the first table contact.',
            technical_depth: 'The first contact sets the emotional contract. Approach angle, pace, posture, eye contact, and opening language tell the guest whether the floor is controlled. A 45-degree approach avoids confrontation and surprise. The server should identify the host or decision maker without ignoring other guests. Introduction by name creates accountability. The goal is not speed alone; it is calm ownership.',
            taxonomy: [
              { type: 'Arrival acknowledgement', usage: 'Immediate eye contact or verbal welcome before full service is available.' },
              { type: 'Table greeting', usage: 'Name, welcome, water or menu orientation, first cue read.' },
              { type: 'Host recognition', usage: 'Identify decision maker while including the table.' },
              { type: 'Pressure greeting', usage: 'Short, calm, specific language when the floor is busy.' }
            ],
            terminology: ['arrival window', 'open palm lead', 'host cue', 'service authority', 'approach angle', 'emotional contract'],
            common_failures: ['Approaching while looking down', 'Launching into specials too early', 'Ignoring one guest', 'Standing too close', 'No name introduction'],
            amateur: 'Greets when ready to take an order.',
            pro: 'Acknowledges immediately and creates a clear next step even under pressure.',
            professional_standard: 'Every guest is acknowledged within 10 seconds and personally greeted at the table within the service standard window.',
            real_service_context: 'A guest seated for five silent minutes will interpret later delays as neglect.',
            practical_execution: ['Approach calmly', 'Introduce yourself', 'Read table energy', 'Offer water or first orientation', 'Set the next step'],
            guest_application: 'Guests feel safer when they know who owns their experience.',
            manager_notes: 'Observe first contact during peak pressure. It predicts complaint tolerance.',
            drill: 'Roleplay three greetings: business lunch, date night, and large family table.',
            assessment_questions: ['Why does approach angle matter?', 'What should happen before order taking?', 'How do you greet during a rush?']
          }),
          lesson({
            id: 'service-002',
            title: 'Sequence Of Service And Table Lifecycle',
            duration: '42 min',
            objective: 'Run the table through a clean lifecycle from arrival to farewell without gaps.',
            technical_depth: 'Sequence of service is a control system. It aligns welcome, water, menus, drinks, order taking, pacing, check-backs, clearing, dessert, payment, and farewell. The table lifecycle must be visible to the server mentally at all times. Good sequence prevents guests from asking basic questions, reduces delays, improves sales opportunities, and creates calm. Sequence must adapt to table type: business guests value efficiency, celebrations need warmth, tourists need guidance.',
            taxonomy: [
              { type: 'Opening sequence', usage: 'Welcome, water, menu orientation, first drink cue.' },
              { type: 'Ordering sequence', usage: 'Preference discovery, allergies, pacing, upsell opportunity.' },
              { type: 'Maintenance sequence', usage: 'Check-back, clearing, refills, table reset.' },
              { type: 'Closing sequence', usage: 'Dessert, payment, farewell, return invitation.' }
            ],
            terminology: ['table lifecycle', 'check-back', 'silent maintenance', 'pacing cue', 'course fire', 'farewell ritual'],
            common_failures: ['Late water', 'No two-bite check-back', 'Clearing without permission', 'Payment ending coldly', 'No dessert framing'],
            amateur: 'Responds to table requests.',
            pro: 'Anticipates the next service moment before the guest asks.',
            professional_standard: 'The guest should never have to manage their own service sequence.',
            real_service_context: 'A table waiting for dessert menus after mains loses both trust and revenue.',
            practical_execution: ['Track table stage', 'Check back within two bites or two minutes', 'Refill before empty', 'Frame dessert specifically', 'Close warmly'],
            guest_application: 'A smooth sequence feels luxurious because it removes effort.',
            manager_notes: 'Use floor maps to audit table lifecycle gaps by server section.',
            drill: 'Write the exact sequence for a two-course dinner with cocktails and dessert.',
            assessment_questions: ['What is a table lifecycle?', 'When should check-back happen?', 'Why is farewell part of service?']
          }),
          lesson({
            id: 'service-003',
            title: 'Body Language, Spatial Awareness, And Silent Service',
            duration: '34 min',
            objective: 'Use nonverbal awareness to serve with presence and discretion.',
            technical_depth: 'Luxury service is often quiet. Staff must read posture, eye movement, glass position, cutlery placement, menu handling, and conversational tempo. Silent service means removing friction without interrupting the guest. Spatial awareness includes where to stand, how to pass, how to clear, and when not to approach. The server should never hover, rush, lean across, or turn their back to visible need.',
            taxonomy: [
              { type: 'Need cue', usage: 'Looking around, closed menu, empty glass, hand raised, body turned outward.' },
              { type: 'Do-not-interrupt cue', usage: 'Intense conversation, lowered voices, eye contact between guests.' },
              { type: 'Clearance cue', usage: 'Cutlery placed, napkin position, guest withdrawal from plate.' },
              { type: 'Urgency cue', usage: 'Repeated glances, payment folder visible, phone checking.' }
            ],
            terminology: ['peripheral monitoring', 'silent cue', 'service distance', 'hovering', 'guest tempo', 'spatial discipline'],
            common_failures: ['Interrupting emotional conversations', 'Clearing across guests', 'Hovering near VIP tables', 'Missing empty glasses', 'Blocking walkways'],
            amateur: 'Waits for guests to ask.',
            pro: 'Reads need before it becomes a request and acts without disrupting the table.',
            professional_standard: 'Service should be present enough to feel cared for and discreet enough to feel private.',
            real_service_context: 'A date-night table may value privacy more than frequent verbal check-ins.',
            practical_execution: ['Scan sections without staring', 'Approach during natural pauses', 'Use quiet hand signals with teammates', 'Clear from correct side when possible'],
            guest_application: 'Guests feel understood when service matches their tempo.',
            manager_notes: 'Coach staff who confuse energy with excellence. Calm presence is often stronger.',
            drill: 'Observe a table for two minutes and list five nonverbal cues before approaching.',
            assessment_questions: ['What is a need cue?', 'When should staff not interrupt?', 'How does silent service create luxury?']
          }),
          lesson({
            id: 'service-004',
            title: 'Table Maintenance, Pacing, And Course Control',
            duration: '38 min',
            objective: 'Maintain table quality and course rhythm without making the guest feel managed.',
            technical_depth: 'Table maintenance is the visible proof of operational attention. Crumbs, empty glassware, unused menus, messy side plates, and poor cutlery replacement lower perceived value. Pacing requires coordination with kitchen, bar, guest tempo, and occasion. A table should not feel rushed, abandoned, or over-controlled. Course control means knowing when to fire, when to hold, when to communicate delay, and when to involve a manager.',
            taxonomy: [
              { type: 'Visual reset', usage: 'Crumb, glass, plate, cutlery, napkin, and menu control.' },
              { type: 'Beverage pacing', usage: 'Second drink opportunity before empty or before mains.' },
              { type: 'Kitchen pacing', usage: 'Fire timing, hold requests, delay communication.' },
              { type: 'Guest pacing', usage: 'Adjust speed to business, leisure, celebration, or family context.' }
            ],
            terminology: ['course fire', 'hold', 'reset', 'crumbing', 'bev check', 'pace risk', 'table drag'],
            common_failures: ['Clearing too early', 'Leaving empty glassware', 'Not replacing cutlery', 'No delay update', 'Missing second-drink timing'],
            amateur: 'Cleans only when obvious.',
            pro: 'Maintains the table continuously without making maintenance the focus.',
            professional_standard: 'No table should carry visible service debris between courses in a premium environment.',
            real_service_context: 'A guest who orders premium wine expects table condition to match bottle value.',
            practical_execution: ['Clear in small passes', 'Replace cutlery before food lands', 'Check drinks before mains', 'Update delays before asked'],
            guest_application: 'Clean pacing creates the feeling that the venue is in control.',
            manager_notes: 'Audit second-drink timing because it connects service quality and revenue.',
            drill: 'Run a simulated three-course table and identify every reset point.',
            assessment_questions: ['What lowers perceived value on a table?', 'When should delay communication happen?', 'Why is beverage pacing part of service?']
          }),
          lesson({
            id: 'service-005',
            title: 'Guest Reading, Emotional Intelligence, And Anticipation',
            duration: '36 min',
            objective: 'Recognize guest type, mood, and need so service feels personal rather than scripted.',
            technical_depth: 'Guest reading is the difference between competent and memorable service. Staff must detect whether the guest wants speed, privacy, guidance, celebration, status recognition, reassurance, or control. Emotional intelligence means adapting tone and frequency without changing standards. Anticipation is practical: allergies before ordering, extra napkins with messy food, water with high-ABV cocktails, fast check for business guests, and privacy for intimate tables.',
            taxonomy: [
              { type: 'Efficiency guest', usage: 'Short language, fast pacing, minimal storytelling.' },
              { type: 'Discovery guest', usage: 'Guidance, explanations, pairings, menu exploration.' },
              { type: 'Celebration guest', usage: 'Warmth, recognition, small rituals, photo awareness.' },
              { type: 'Anxious guest', usage: 'Clarity, reassurance, allergy confidence, repeated confirmation.' }
            ],
            terminology: ['guest archetype', 'service tempo', 'reassurance language', 'anticipatory service', 'emotional cue'],
            common_failures: ['Same script for every table', 'Over-talking business guests', 'Ignoring anxious allergy cues', 'Missing celebration opportunities'],
            amateur: 'Treats all guests equally by doing the same thing.',
            pro: 'Keeps standards equal while adapting style to the guest.',
            professional_standard: 'Personalization must feel natural, not invasive.',
            real_service_context: 'A guest celebrating quietly may dislike public attention but appreciate discreet recognition.',
            practical_execution: ['Read table purpose', 'Ask fewer but better questions', 'Offer specific help', 'Adjust frequency of check-ins'],
            guest_application: 'Guests return when they feel recognized without having to explain themselves.',
            manager_notes: 'Train archetypes in pre-shift, then ask staff to identify tables by service need.',
            drill: 'Assign service style for four guest archetypes using the same menu.',
            assessment_questions: ['How is equal service different from identical service?', 'What does an anxious guest need?', 'How do you identify an efficiency guest?']
          })
        ]
      },
      {
        id: 'service-commercial',
        title: 'Sales, Recovery, VIPs, Language, And Farewell',
        lessons: [
          lesson({
            id: 'service-006',
            title: 'Food Knowledge And Confident Recommendation',
            duration: '40 min',
            objective: 'Use food knowledge to guide guests, protect allergens, and create trust.',
            technical_depth: 'Food knowledge includes ingredients, preparation, texture, allergens, modifications, portion style, spice level, dietary suitability, and pairing logic. Staff must know not only what is in a dish but why a guest should choose it. Confident recommendation requires personal language, sensory accuracy, and operational honesty. Staff should never guess allergens or preparation details. Menu knowledge protects safety and drives revenue.',
            taxonomy: [
              { type: 'Ingredient knowledge', usage: 'Core components, allergens, garnish, hidden ingredients.' },
              { type: 'Preparation knowledge', usage: 'Grilled, fried, raw, cured, braised, baked, smoked.' },
              { type: 'Sensory knowledge', usage: 'Texture, intensity, richness, acidity, spice, sweetness.' },
              { type: 'Pairing knowledge', usage: 'Wine, cocktail, side, sauce, dessert link.' }
            ],
            terminology: ['mise en place', 'allergen protocol', 'modification', 'portion style', 'texture cue', 'pairing bridge'],
            common_failures: ['Guessing allergens', 'Recommending personal favorites without context', 'Not knowing sauce ingredients', 'Ignoring portion size expectations'],
            amateur: 'Reads menu descriptions back to guests.',
            pro: 'Translates dishes into guest benefit, safety, and fit.',
            professional_standard: 'If staff cannot answer safely, they must confirm before committing.',
            real_service_context: 'An allergy guest judges the whole venue by the confidence of one answer.',
            practical_execution: ['Know top allergens', 'Use sensory descriptors', 'Offer pairing or side suggestion', 'Confirm modifications with kitchen'],
            guest_application: 'Food knowledge makes ordering feel guided and safe.',
            manager_notes: 'Daily pre-shift should include one dish deep dive.',
            drill: 'Describe three dishes in 20 seconds each for different guest types.',
            assessment_questions: ['What should staff do if unsure about allergens?', 'What is sensory food knowledge?', 'How does food knowledge increase revenue?']
          }),
          lesson({
            id: 'service-007',
            title: 'Upselling As Hospitality, Not Pressure',
            duration: '34 min',
            objective: 'Increase check value through helpful guidance rather than sales pressure.',
            technical_depth: 'Premium upselling is recommendation quality. It works when the suggestion improves the guest experience: better pairing, right portion, occasion upgrade, second drink timing, dessert framing, or shared side. Pressure damages trust. Effective upselling uses preference, context, and concrete sensory language. The best staff make guests feel expertly hosted, not sold to.',
            taxonomy: [
              { type: 'Pairing upsell', usage: 'Wine, cocktail, side, sauce, dessert with a clear reason.' },
              { type: 'Occasion upsell', usage: 'Celebration, date, business hosting, VIP context.' },
              { type: 'Quality upsell', usage: 'Premium ingredient or preparation that changes experience.' },
              { type: 'Timing upsell', usage: 'Second drink before mains, dessert before check request.' }
            ],
            terminology: ['recommendation bridge', 'occasion cue', 'second-drink timing', 'value framing', 'soft close'],
            common_failures: ['Suggesting the most expensive item first', 'Generic dessert question', 'No reason for upgrade', 'Continuing after refusal'],
            amateur: 'Pushes add-ons.',
            pro: 'Advises like a host and accepts decline gracefully.',
            professional_standard: 'Every upsell must improve experience or it should not be offered.',
            real_service_context: 'A table ordering steak should be offered a structured red or sauce pairing before the moment passes.',
            practical_execution: ['Ask preference', 'Offer one specific recommendation', 'Give a reason', 'Stop immediately after refusal'],
            guest_application: 'Guests appreciate recommendations that feel tailored and useful.',
            manager_notes: 'Measure recommendation attempts and guest response, not just sales totals.',
            drill: 'Rewrite five generic upsell lines into hospitality recommendations.',
            assessment_questions: ['When is upselling inappropriate?', 'What makes a recommendation premium?', 'Why is timing critical?']
          }),
          lesson({
            id: 'service-008',
            title: 'Complaint Recovery: Acknowledge, Own, Act, Follow Up',
            duration: '44 min',
            objective: 'Recover guest trust before compensation becomes the only solution.',
            technical_depth: 'Complaint recovery is emotional repair plus operational correction. The first response should acknowledge the guest experience without defense. Ownership means representing the venue even if the issue came from kitchen, bar, host, or supplier. Action must be specific and time-bound. Follow-up proves that recovery was real. Compensation may be appropriate, but it is not the first move. Poor recovery trains guests to escalate.',
            taxonomy: [
              { type: 'Minor friction', usage: 'Slow refill, missing item, small delay; fix quickly and warmly.' },
              { type: 'Service failure', usage: 'Long wait, wrong dish, cold food; manager awareness required.' },
              { type: 'Trust failure', usage: 'Allergy risk, rude service, repeated issue; manager must lead.' },
              { type: 'Escalation risk', usage: 'Angry guest, public complaint, VIP, review threat.' }
            ],
            terminology: ['acknowledgement', 'ownership', 'time-bound action', 'follow-up', 'service recovery', 'compensation ladder'],
            common_failures: ['Blaming another department', 'Over-apologizing without action', 'Comping too early', 'No follow-up', 'Not logging the incident'],
            amateur: 'Explains why it happened.',
            pro: 'Owns the guest feeling and gives the next action immediately.',
            professional_standard: 'Every serious recovery receives manager visibility and a logged memory note.',
            real_service_context: 'A late main course can be recovered if the guest is updated before they ask.',
            practical_execution: ['Listen fully', 'Acknowledge emotion', 'State action', 'Give timing', 'Return when promised', 'Log the issue'],
            guest_application: 'Guests forgive errors faster than silence or defensiveness.',
            manager_notes: 'Coach recovery language weekly. It protects reputation and profit.',
            drill: 'Roleplay a 35-minute kitchen delay and recover without offering compensation first.',
            assessment_questions: ['Why is compensation not the first move?', 'What does ownership sound like?', 'When must a manager lead recovery?']
          }),
          lesson({
            id: 'service-009',
            title: 'VIP Service And Difficult Guest Management',
            duration: '38 min',
            objective: 'Serve high-sensitivity guests and difficult moments with calm, discretion, and documentation.',
            technical_depth: 'VIP service requires preparation, preference memory, discretion, and calm execution. Difficult guests require boundaries, empathy, witness awareness, and escalation. Staff must distinguish high standards from abusive behavior. VIPs should not receive chaotic over-service; they should receive seamless recognition. Difficult guest handling should protect the team while preserving venue dignity.',
            taxonomy: [
              { type: 'Known VIP', usage: 'Preference notes, discreet greeting, manager awareness.' },
              { type: 'Occasion VIP', usage: 'Birthday, anniversary, proposal, business host.' },
              { type: 'High-pressure guest', usage: 'Impatient, anxious, demanding; needs clarity and boundaries.' },
              { type: 'Abusive guest', usage: 'Escalate to manager; protect staff safety and dignity.' }
            ],
            terminology: ['preference memory', 'discreet recognition', 'boundary language', 'escalation threshold', 'host profile'],
            common_failures: ['Over-announcing VIP status', 'Ignoring staff discomfort', 'No preference notes', 'Arguing with difficult guests'],
            amateur: 'Gives VIPs more attention randomly.',
            pro: 'Gives VIPs smoother service and difficult guests calmer boundaries.',
            professional_standard: 'VIP treatment must be discreet, prepared, and consistent with venue standards.',
            real_service_context: 'A business host may value discretion more than visible special treatment.',
            practical_execution: ['Read notes before approach', 'Confirm manager ownership', 'Use calm boundary language', 'Document repeated issues'],
            guest_application: 'Guests feel important when service remembers them without making them perform status.',
            manager_notes: 'Build a preference memory system and a staff protection escalation rule.',
            drill: 'Write scripts for VIP welcome, impatient guest, and abusive guest escalation.',
            assessment_questions: ['What is discreet recognition?', 'When should staff escalate?', 'How can VIP service become intrusive?']
          }),
          lesson({
            id: 'service-010',
            title: 'Farewell Rituals And Return Intention',
            duration: '28 min',
            objective: 'Close the experience in a way that strengthens memory, loyalty, and return behavior.',
            technical_depth: 'The farewell is the final emotional edit of the visit. Payment is not the end of service. The last moments should feel unhurried, specific, and warm. Return intention increases when the guest is thanked personally, the occasion is acknowledged, and an appropriate invitation is offered. A rushed or cold payment can erase earlier excellence.',
            taxonomy: [
              { type: 'Payment close', usage: 'Efficient, accurate, discreet.' },
              { type: 'Specific thanks', usage: 'Names, occasion, dish or wine reference.' },
              { type: 'Return invitation', usage: 'Specific, genuine, not scripted.' },
              { type: 'Exit awareness', usage: 'Host and floor maintain goodbye standard.' }
            ],
            terminology: ['return intention', 'final impression', 'payment ritual', 'specific gratitude', 'farewell cue'],
            common_failures: ['Dropping check and disappearing', 'No goodbye', 'Rushing payment', 'Generic thanks', 'Ignoring departing guests at host stand'],
            amateur: 'Ends service when payment is processed.',
            pro: 'Ends service when the guest leaves feeling remembered.',
            professional_standard: 'Every table receives a specific thank-you and a clean farewell.',
            real_service_context: 'A guest deciding whether to return often remembers the final 30 seconds more than the first dish.',
            practical_execution: ['Return payment with eye contact', 'Thank specifically', 'Invite return naturally', 'Coordinate host farewell'],
            guest_application: 'A strong farewell turns satisfaction into loyalty.',
            manager_notes: 'Observe exits. Farewell inconsistency is a hidden loyalty leak.',
            drill: 'Create three farewell lines for business, celebration, and regular guest contexts.',
            assessment_questions: ['Why is payment not the end?', 'What makes a thank-you specific?', 'How does farewell affect loyalty?']
          })
        ]
      }
    ]
  },
  {
    id: 'hostess-academy',
    title: 'Hostess Academy',
    dean: 'Guest Flow and Reservations Director',
    color: '#6b705c',
    category: 'Guest Flow',
    description: 'Front-door education for first impression, reservations, seating strategy, waitlists, VIP recognition, phone etiquette, and service handoff.',
    badge: 'Front Door',
    roles: ['employee', 'manager', 'admin'],
    totalLessons: 10,
    modules: [
      {
        id: 'host-flow',
        title: 'Arrival, Reservations, And Room Flow',
        lessons: [
          lesson({
            id: 'host-001',
            title: 'First Impression And Front-Door Authority',
            duration: '28 min',
            objective: 'Create calm and confidence before the guest enters the dining room.',
            technical_depth: 'The host stand is the emotional gateway of the venue. Guests read confidence through posture, eye contact, greeting speed, and clarity. A host must acknowledge arrivals immediately, control crowd pressure, avoid defensive language, and translate waiting into a managed experience. The host is not a traffic controller only; the host is the first brand ambassador and the room-flow operator.',
            taxonomy: [
              { type: 'Immediate acknowledgement', usage: 'Eye contact or verbal welcome within 10 seconds.' },
              { type: 'Reservation confirmation', usage: 'Warm, efficient, never interrogative.' },
              { type: 'Walk-in framing', usage: 'Clear wait quote and next step.' },
              { type: 'Pressure control', usage: 'Keep tone calm even when the door is crowded.' }
            ],
            terminology: ['arrival pressure', 'host stand control', 'wait quote', 'room flow', 'first brand touch', 'arrival queue'],
            common_failures: ['Looking down at screen', 'Ignoring guests while typing', 'Over-promising tables', 'Sounding stressed', 'No next step'],
            amateur: 'Processes arrivals in order only.',
            pro: 'Controls the emotional temperature of the entrance.',
            professional_standard: 'Every arrival is acknowledged quickly and receives a clear next step.',
            real_service_context: 'A crowded entrance can make a premium venue feel disorganized before service begins.',
            practical_execution: ['Look up first', 'Welcome before asking name', 'Quote wait honestly', 'Offer bar or waiting option', 'Update before asked'],
            guest_application: 'Guests tolerate waiting when they feel seen and managed.',
            manager_notes: 'Audit host language on busy nights. The door sets the room mood.',
            drill: 'Practice greeting five arrivals while handling a ringing phone and a delayed table.',
            assessment_questions: ['Why is the host stand emotional?', 'What should happen before typing?', 'How do you make waiting feel managed?']
          }),
          lesson({
            id: 'host-002',
            title: 'Reservation Flow, Notes, And Preference Memory',
            duration: '36 min',
            objective: 'Use reservation information to improve seating, service, and guest recognition.',
            technical_depth: 'Reservation systems are guest intelligence tools. Notes should capture allergies, preferences, VIP status, celebration, seating preference, previous issues, and host identity. Bad notes are vague, emotional, or punitive. Good notes are factual, useful, and respectful. Reservation flow includes confirmation, table assignment, timing, no-show logic, and handoff to service team.',
            taxonomy: [
              { type: 'Operational note', usage: 'Timing, table preference, mobility, stroller, accessibility.' },
              { type: 'Guest preference', usage: 'Wine style, seating, allergies, favorite server, disliked area.' },
              { type: 'VIP note', usage: 'Discreet recognition and manager awareness.' },
              { type: 'Recovery note', usage: 'Previous issue and required care on return.' }
            ],
            terminology: ['guest profile', 'reservation pacing', 'preference memory', 'table assignment', 'handoff note', 'no-show policy'],
            common_failures: ['No useful notes', 'Judgmental notes', 'Missing allergies', 'Not reading notes before arrival', 'No server handoff'],
            amateur: 'Uses the reservation system as a booking list.',
            pro: 'Uses it as a guest memory and room-planning system.',
            professional_standard: 'Every useful guest preference should be recorded factually and actionably.',
            real_service_context: 'Remembering a regular guest preference can create loyalty without giving anything away.',
            practical_execution: ['Read notes before shift', 'Update factual preferences', 'Flag allergies clearly', 'Handoff key notes to server'],
            guest_application: 'Guests feel known when the venue remembers without asking again.',
            manager_notes: 'Review notes weekly and remove vague or unprofessional language.',
            drill: 'Rewrite five poor guest notes into professional operational notes.',
            assessment_questions: ['What makes a note useful?', 'What should never be written in guest notes?', 'How does preference memory create value?']
          }),
          lesson({
            id: 'host-003',
            title: 'Seating Strategy And Table Pacing',
            duration: '40 min',
            objective: 'Seat the room in a way that protects kitchen, bar, server load, and guest experience.',
            technical_depth: 'Seating is a production decision. Poor seating creates kitchen spikes, server overload, bar pressure, and uneven guest experience. A host must balance reservations, walk-ins, table turns, server sections, VIPs, event blocks, and kitchen capacity. Table pacing is not about filling empty seats instantly; it is about controlling service quality.',
            taxonomy: [
              { type: 'Server load', usage: 'Avoid seating multiple tables in one section at once.' },
              { type: 'Kitchen pacing', usage: 'Avoid sudden order spikes from multiple large tables.' },
              { type: 'Table turn', usage: 'Manage expected duration against incoming reservations.' },
              { type: 'VIP placement', usage: 'Privacy, visibility, best server, manager awareness.' }
            ],
            terminology: ['section rotation', 'double seating', 'table turn', 'cover pacing', 'reservation wave', 'walk-in hold'],
            common_failures: ['Double-seating one server', 'Filling the room too fast', 'Ignoring kitchen pressure', 'Poor VIP table assignment', 'No manager communication'],
            amateur: 'Seats the next available table.',
            pro: 'Seats the next right table for the room system.',
            professional_standard: 'Host decisions must protect the whole operation, not only the door.',
            real_service_context: 'A host can create a 25-minute kitchen delay by seating three large tables simultaneously.',
            practical_execution: ['Check section load', 'Check kitchen pressure', 'Hold walk-ins when needed', 'Communicate large-party seating', 'Track table turn risk'],
            guest_application: 'Guests experience good seating strategy as smoother service after they sit.',
            manager_notes: 'Host training should include floor map pressure scenarios.',
            drill: 'Plan seating for a 7:30 reservation wave with two walk-ins and one VIP.',
            assessment_questions: ['Why is seating a production decision?', 'What is double seating?', 'When should a host slow the door?']
          }),
          lesson({
            id: 'host-004',
            title: 'Waitlist Psychology And Delay Communication',
            duration: '34 min',
            objective: 'Make waiting feel controlled, honest, and cared for.',
            technical_depth: 'Waiting becomes frustration when guests lack information, agency, or acknowledgement. A wait quote should be realistic, not optimistic. Updates must happen before guests ask. A host should offer options: bar, lobby, SMS, later time, or alternative seating. Delay language must not blame previous guests, kitchen, or management. The goal is controlled expectation.',
            taxonomy: [
              { type: 'Quoted wait', usage: 'Specific range with confidence level.' },
              { type: 'Update point', usage: 'Before the quote expires or when information changes.' },
              { type: 'Alternative option', usage: 'Bar seat, later slot, patio, counter, cancellation call.' },
              { type: 'Recovery wait', usage: 'When quote fails, host owns and escalates.' }
            ],
            terminology: ['expectation control', 'wait quote', 'update cadence', 'guest agency', 'delay recovery'],
            common_failures: ['Underquoting wait time', 'No updates', 'Blaming lingering guests', 'No alternatives', 'Crowded host stand'],
            amateur: 'Says it should be soon.',
            pro: 'Gives a realistic range and updates before trust breaks.',
            professional_standard: 'No waiting guest should need to ask for the next update.',
            real_service_context: 'A 20-minute wait can feel acceptable; a silent 12-minute wait can feel disrespectful.',
            practical_execution: ['Quote honestly', 'Offer options', 'Update early', 'Escalate missed quotes', 'Keep tone calm'],
            guest_application: 'Guests tolerate delay when they feel informed and respected.',
            manager_notes: 'Track wait quote accuracy by shift.',
            drill: 'Handle a guest whose 20-minute quote becomes 35 minutes.',
            assessment_questions: ['Why do guests resent silence?', 'What makes a good wait quote?', 'What alternatives can a host offer?']
          }),
          lesson({
            id: 'host-005',
            title: 'Walk-Ins, Difficult Arrivals, And Boundary Language',
            duration: '32 min',
            objective: 'Handle pressure at the door without losing hospitality or control.',
            technical_depth: 'Walk-ins are revenue opportunities but must not damage existing reservations. Difficult arrivals include late guests, incomplete parties, guests demanding unavailable tables, over-capacity moments, and intoxicated arrivals. Boundary language must be calm, specific, and non-punitive. The host should avoid arguments and escalate when safety, dignity, or policy is involved.',
            taxonomy: [
              { type: 'Late reservation', usage: 'Grace period, table hold policy, manager escalation.' },
              { type: 'Incomplete party', usage: 'Seat policy, bar wait, communication with server.' },
              { type: 'Unavailable request', usage: 'Offer best alternative without over-apologizing.' },
              { type: 'Unsafe arrival', usage: 'Manager involvement and responsible service policy.' }
            ],
            terminology: ['boundary language', 'grace period', 'policy framing', 'walk-in conversion', 'escalation point'],
            common_failures: ['Arguing at the door', 'Breaking reservation promises', 'Over-apologizing', 'No manager escalation', 'Letting loud guests control the room'],
            amateur: 'Either says yes too easily or becomes cold.',
            pro: 'Holds standards warmly and gives alternatives.',
            professional_standard: 'Policy should be communicated as care for all guests, not punishment.',
            real_service_context: 'One unmanaged door conflict can disturb the whole dining room.',
            practical_execution: ['State what is possible', 'Offer alternatives', 'Keep voice low', 'Escalate early', 'Document repeated issues'],
            guest_application: 'Clear boundaries can still feel hospitable when delivered with respect.',
            manager_notes: 'Hosts need approved language for common conflict scenarios.',
            drill: 'Practice declining a demanded table while offering two alternatives.',
            assessment_questions: ['What is boundary language?', 'When should a manager join?', 'How can a no still feel hospitable?']
          })
        ]
      },
      {
        id: 'host-communication',
        title: 'Communication, VIPs, Handoffs, And Phone Standards',
        lessons: [
          lesson({
            id: 'host-006',
            title: 'Phone Etiquette And Reservation Conversion',
            duration: '30 min',
            objective: 'Turn phone contact into a confident booking or useful guest outcome.',
            technical_depth: 'Phone hospitality relies on tone, pace, clarity, and control because the guest cannot see body language. The host should answer with venue identity, name, and willingness to help. The call should confirm date, time, party size, contact, special notes, and policy where needed. A fully booked answer should still create value through waitlist, alternative time, or future booking.',
            taxonomy: [
              { type: 'Booking call', usage: 'Gather correct reservation details quickly.' },
              { type: 'Availability call', usage: 'Offer best options, not only yes/no.' },
              { type: 'Special request call', usage: 'Capture useful notes and confirm limits.' },
              { type: 'Complaint or confusion call', usage: 'Stay calm and escalate when needed.' }
            ],
            terminology: ['phone smile', 'call control', 'reservation conversion', 'waitlist capture', 'callback promise'],
            common_failures: ['Rushed tone', 'No name capture', 'No alternative time offered', 'Unclear policy', 'Forgetting special request notes'],
            amateur: 'Answers questions only.',
            pro: 'Guides the caller toward the best available outcome.',
            professional_standard: 'Every call should end with clarity: booking, waitlist, callback, or alternative.',
            real_service_context: 'A fully booked call can still become a future reservation if handled well.',
            practical_execution: ['Answer warmly', 'Control pace', 'Confirm details back', 'Add notes', 'Close with clear next step'],
            guest_application: 'The phone call is often the guest first impression of the venue.',
            manager_notes: 'Mystery-call the venue monthly and coach tone.',
            drill: 'Handle a fully booked Saturday call and convert to an alternative booking.',
            assessment_questions: ['What must be confirmed on a booking call?', 'How can fully booked still create value?', 'Why does tone matter more by phone?']
          }),
          lesson({
            id: 'host-007',
            title: 'VIP Recognition And Discreet Preference Handling',
            duration: '35 min',
            objective: 'Recognize important guests without making service feel performative or exposed.',
            technical_depth: 'VIP recognition is preparation plus discretion. The host must know who is arriving, why they matter, preferences, sensitivities, and who on the team owns the experience. Recognition should be calm and natural. Over-announcing status can embarrass guests or create uneven room energy. Preference handling should be factual and privacy-aware.',
            taxonomy: [
              { type: 'Owner VIP', usage: 'Manager and owner visibility; best table and service lead.' },
              { type: 'Regular', usage: 'Preference memory and familiar but respectful welcome.' },
              { type: 'Occasion VIP', usage: 'Birthday, anniversary, proposal, client hosting.' },
              { type: 'Sensitive VIP', usage: 'Privacy, no photos, discreet arrival, controlled seating.' }
            ],
            terminology: ['VIP flag', 'preference note', 'discreet recognition', 'privacy cue', 'service owner'],
            common_failures: ['Announcing VIP status loudly', 'No preference handoff', 'Wrong table placement', 'Over-service', 'No manager awareness'],
            amateur: 'Makes VIP service louder.',
            pro: 'Makes VIP service smoother.',
            professional_standard: 'VIP notes must create better service without compromising privacy.',
            real_service_context: 'A celebrity guest may want the least visible table, not the most dramatic one.',
            practical_execution: ['Review VIP list pre-shift', 'Brief server discreetly', 'Confirm table placement', 'Use restrained welcome language'],
            guest_application: 'Guests feel valued when the venue remembers correctly and quietly.',
            manager_notes: 'Centralize VIP notes and review them before doors open.',
            drill: 'Prepare a VIP handoff note for a guest with privacy concerns and a wine preference.',
            assessment_questions: ['What is discreet recognition?', 'Why can over-service be harmful?', 'What belongs in a VIP note?']
          }),
          lesson({
            id: 'host-008',
            title: 'Handoff To Service Team',
            duration: '26 min',
            objective: 'Transfer guest context from host to server without losing information.',
            technical_depth: 'The host-server handoff prevents repeated questions, missed allergies, ignored occasions, and service gaps. A good handoff is short, factual, and actionable. It includes guest name when appropriate, occasion, pace need, allergy, VIP flag, seating issue, delay context, and any emotional state from the door. Handoffs can be verbal, POS note, seating chart marker, or manager signal.',
            taxonomy: [
              { type: 'Allergy handoff', usage: 'Must be explicit and confirmed.' },
              { type: 'Delay handoff', usage: 'Server starts with context and care.' },
              { type: 'Occasion handoff', usage: 'Server can recognize naturally.' },
              { type: 'Preference handoff', usage: 'Wine, seating, pace, previous issue.' }
            ],
            terminology: ['handoff note', 'service context', 'allergy confirmation', 'pace cue', 'floor signal'],
            common_failures: ['No server warning after a wait', 'Allergy buried in notes', 'Occasion ignored', 'Host seats and disappears'],
            amateur: 'Escorts guests to the table only.',
            pro: 'Transfers context so service starts intelligently.',
            professional_standard: 'Any important arrival context must reach the server before first table contact.',
            real_service_context: 'A guest delayed at the door should not need to re-explain frustration to the server.',
            practical_execution: ['Use one-sentence handoff', 'Confirm allergy verbally', 'Mark VIP or occasion', 'Tell server about wait issues'],
            guest_application: 'A smooth handoff makes the whole venue feel coordinated.',
            manager_notes: 'Audit handoff failures by checking whether servers know key notes.',
            drill: 'Create handoff language for allergy, birthday, and delayed seating scenarios.',
            assessment_questions: ['What must be handed off verbally?', 'Why does delay context matter?', 'What is an actionable note?']
          }),
          lesson({
            id: 'host-009',
            title: 'Guest Preference Notes And Ethical Memory',
            duration: '28 min',
            objective: 'Capture useful guest memory while protecting dignity, privacy, and professionalism.',
            technical_depth: 'Guest memory should improve hospitality, not create surveillance. Notes must be factual, service-useful, respectful, and relevant. Preferences include seating, pace, dietary needs, drink style, favorite server, language, accessibility, and celebration history. Avoid appearance judgments, insults, private speculation, or emotional labels. Ethical memory builds loyalty because the guest feels known, not watched.',
            taxonomy: [
              { type: 'Useful preference', usage: 'Window table, sparkling water, no dairy, fast lunch.' },
              { type: 'Risk note', usage: 'Severe allergy, previous recovery issue, accessibility need.' },
              { type: 'Occasion memory', usage: 'Anniversary date, birthday, regular celebration.' },
              { type: 'Unprofessional note', usage: 'Any insulting, irrelevant, or speculative detail.' }
            ],
            terminology: ['ethical memory', 'preference note', 'privacy standard', 'service relevance', 'guest dignity'],
            common_failures: ['Writing insulting notes', 'Keeping outdated notes', 'No allergy clarity', 'Over-personalizing', 'Sharing private details broadly'],
            amateur: 'Writes whatever helps staff remember the guest emotionally.',
            pro: 'Writes only respectful facts that improve service.',
            professional_standard: 'Guest notes should pass the test: would we be comfortable if the guest read this?',
            real_service_context: 'A regular guest appreciates remembered preferences but not visible gossip.',
            practical_execution: ['Write facts', 'Use neutral tone', 'Date sensitive notes', 'Remove stale details', 'Share only with staff who need it'],
            guest_application: 'Ethical memory creates loyalty through respect.',
            manager_notes: 'Review guest notes regularly for professionalism.',
            drill: 'Sort ten sample notes into useful, risky, and unacceptable.',
            assessment_questions: ['What is ethical memory?', 'What notes are unacceptable?', 'How should allergy notes be written?']
          }),
          lesson({
            id: 'host-010',
            title: 'Host Metrics: Covers, Turns, No-Shows, And Guest Flow',
            duration: '32 min',
            objective: 'Understand the operational metrics that make the front door a revenue control point.',
            technical_depth: 'The host role directly affects revenue and service quality. Covers, turns, average dining time, no-show rate, cancellation timing, waitlist conversion, walk-in capture, table utilization, and reservation pacing are front-door metrics. A host who understands metrics can make better decisions under pressure and explain tradeoffs to managers.',
            taxonomy: [
              { type: 'Covers', usage: 'Number of guests served; core demand indicator.' },
              { type: 'Turns', usage: 'How many times a table is used during service.' },
              { type: 'No-show rate', usage: 'Reservation reliability and policy pressure.' },
              { type: 'Waitlist conversion', usage: 'Lost demand that can become revenue.' },
              { type: 'Dining time', usage: 'Predicts table availability and pacing.' }
            ],
            terminology: ['cover count', 'table turn', 'utilization', 'no-show', 'waitlist conversion', 'reservation pacing'],
            common_failures: ['Not tracking no-shows', 'Poor waitlist follow-up', 'Wrong dining time assumptions', 'No manager update on pacing'],
            amateur: 'Seats guests without understanding revenue flow.',
            pro: 'Uses guest flow data to protect both revenue and experience.',
            professional_standard: 'Hosts should know the target cover count and pressure windows for each shift.',
            real_service_context: 'A wrong table-time estimate can cascade into reservation delays and guest recovery costs.',
            practical_execution: ['Track late and no-show guests', 'Update waitlist quickly', 'Communicate turn risk', 'Know cover target'],
            guest_application: 'Better flow means fewer delays and calmer arrivals.',
            manager_notes: 'Include host metrics in manager debrief, not only sales.',
            drill: 'Calculate how two missed table turns affect covers and revenue.',
            assessment_questions: ['What is waitlist conversion?', 'Why do dining times matter?', 'How do no-shows affect revenue?']
          })
        ]
      }
    ]
  },
  {
    id: 'manager-academy',
    title: 'Manager Academy',
    dean: 'Operations and P&L Consultant',
    color: '#2a3a2a',
    category: 'Leadership And Control',
    description: 'Manager education for shift leadership, coaching, labor control, recovery leadership, logs, approvals, communication, and P&L awareness.',
    badge: 'Manager Only',
    roles: ['manager', 'admin'],
    totalLessons: 10,
    modules: [
      {
        id: 'manager-command',
        title: 'Shift Command, Recovery, And Communication',
        lessons: [
          lesson({
            id: 'manager-001',
            title: 'Pre-Shift Briefing: The 10-Minute Control Ritual',
            duration: '35 min',
            objective: 'Run briefings that align staff technically, emotionally, and commercially before service.',
            technical_depth: 'A pre-shift briefing is not a speech. It is an operational calibration. It should cover forecast, cover count, VIPs, 86 list, feature items, beverage focus, event pressure, staffing gaps, service standard, and one measurable behavior. The manager must be specific, brief, and prepared. A strong briefing prevents repeated questions and creates accountability.',
            taxonomy: [
              { type: 'Technical alignment', usage: 'Menu changes, 86s, features, specs, allergens.' },
              { type: 'Operational alignment', usage: 'Sections, covers, event pressure, timing risk.' },
              { type: 'Commercial focus', usage: 'Upsell target, cocktail focus, wine by glass, margin item.' },
              { type: 'Behavioral standard', usage: 'One service behavior to monitor that shift.' }
            ],
            terminology: ['line-up', '86 list', 'cover count', 'VIP profile', 'service focus', 'knowledge check'],
            common_failures: ['Too long', 'No specific goal', 'No knowledge check', 'Skipping busy nights', 'No VIP briefing'],
            amateur: 'Reads announcements and chores.',
            pro: 'Creates shift clarity and one shared standard.',
            professional_standard: 'Briefings should be under 10 minutes and include at least one staff knowledge check.',
            real_service_context: 'The busiest nights need the shortest and sharpest briefings.',
            practical_execution: ['Prepare before staff arrive', 'State tonight pressure points', 'Assign ownership', 'Test one knowledge point', 'End with standard'],
            guest_application: 'Guests feel briefing quality through confident staff and fewer errors.',
            manager_notes: 'Record the one monitored behavior and review it in the handoff.',
            drill: 'Write a 7-minute briefing for a Friday with VIPs, one 86, and a cocktail feature.',
            assessment_questions: ['Why is briefing not a meeting?', 'What must be included?', 'How do knowledge checks change behavior?']
          }),
          lesson({
            id: 'manager-002',
            title: 'Floor Awareness And Pressure Mapping',
            duration: '38 min',
            objective: 'Read the room as a live operating system and intervene before failures surface.',
            technical_depth: 'Floor awareness combines table status, staff capacity, kitchen timing, bar ticket load, guest mood, and unresolved tasks. Managers must not get trapped doing one task while losing the room. Pressure mapping identifies which section, station, or process is likely to fail next. Intervention should be early, specific, and calm.',
            taxonomy: [
              { type: 'Guest pressure', usage: 'Looking around, long wait, empty drinks, emotional escalation.' },
              { type: 'Staff pressure', usage: 'Server behind, bartender overwhelmed, runner missing.' },
              { type: 'Kitchen pressure', usage: 'Long tickets, fire timing, missing items.' },
              { type: 'System pressure', usage: 'POS issue, inventory shortage, event overlap.' }
            ],
            terminology: ['pressure map', 'floor scan', 'ticket drag', 'section load', 'intervention point', 'manager orbit'],
            common_failures: ['Standing at host stand too long', 'Helping one station while losing the floor', 'No ticket awareness', 'Late intervention'],
            amateur: 'Responds when staff ask for help.',
            pro: 'Finds pressure before staff have to ask.',
            professional_standard: 'A manager should complete regular floor scans and know the highest-risk section at all times.',
            real_service_context: 'A table can become a complaint while the manager is busy polishing glasses.',
            practical_execution: ['Scan floor, bar, kitchen, host', 'Identify top risk', 'Assign immediate support', 'Return to verify'],
            guest_application: 'Manager awareness prevents guests from feeling abandoned.',
            manager_notes: 'Train managers to move with purpose, not panic.',
            drill: 'Review a floor map and mark pressure points every 10 minutes for one service.',
            assessment_questions: ['What is pressure mapping?', 'What signals staff pressure?', 'Why is verification necessary?']
          }),
          lesson({
            id: 'manager-003',
            title: 'Service Recovery Leadership And Compensation Discipline',
            duration: '44 min',
            objective: 'Lead guest recovery while protecting trust, staff confidence, and profit discipline.',
            technical_depth: 'Managers own serious recovery. The sequence is listen, acknowledge, own, act, follow up, document, then decide compensation if needed. Compensation without recovery weakens authority and profit. The manager should identify root cause, decide immediate action, protect staff from public blame, and convert the incident into coaching or system improvement.',
            taxonomy: [
              { type: 'Operational error', usage: 'Wrong item, delay, missing order; fix process and communicate.' },
              { type: 'Experience error', usage: 'Rude tone, ignored table, poor pacing; repair emotion.' },
              { type: 'Safety error', usage: 'Allergen, glass break, intoxication; escalate immediately.' },
              { type: 'Reputation risk', usage: 'VIP, review threat, public conflict; manager leads.' }
            ],
            terminology: ['recovery ladder', 'comp discipline', 'root cause', 'guest trust', 'incident log', 'follow-up loop'],
            common_failures: ['Immediate comping', 'Blaming staff publicly', 'No follow-up', 'No incident memory', 'No coaching action'],
            amateur: 'Buys peace with discounts.',
            pro: 'Repairs trust first and uses compensation strategically.',
            professional_standard: 'Every major recovery becomes a logged learning event.',
            real_service_context: 'A guest who receives a comp but no care may still leave a negative review.',
            practical_execution: ['Approach calmly', 'Acknowledge', 'State action', 'Check back', 'Document cause', 'Coach privately'],
            guest_application: 'Guests want ownership and confidence more than excuses.',
            manager_notes: 'Track comp reasons weekly to identify preventable patterns.',
            drill: 'Resolve a delayed main course without offering immediate discount.',
            assessment_questions: ['When is compensation appropriate?', 'Why document recovery?', 'How should managers protect staff dignity?']
          }),
          lesson({
            id: 'manager-004',
            title: 'Operational Handoff, Manager Logs, And Business Memory',
            duration: '32 min',
            objective: 'Turn each shift into usable organizational memory instead of isolated activity.',
            technical_depth: 'A shift that is not documented disappears. Manager logs should capture incidents, staffing issues, VIP notes, maintenance risks, shortages, guest recovery, event notes, budget needs, and unresolved actions. Good handoff notes are specific, assigned, and time-bound. Business memory allows the venue to learn across shifts and prevents repeated failures.',
            taxonomy: [
              { type: 'Incident memory', usage: 'What happened, guest impact, resolution, follow-up.' },
              { type: 'Staff memory', usage: 'Coaching need, performance win, absence, readiness.' },
              { type: 'Operational memory', usage: 'Shortage, equipment issue, maintenance, prep risk.' },
              { type: 'Owner memory', usage: 'Financial exposure, VIP issue, approval need.' }
            ],
            terminology: ['handoff', 'business memory', 'action owner', 'open loop', 'shift log', 'carry-forward item'],
            common_failures: ['Vague notes', 'No owner assigned', 'No due time', 'Incidents not logged', 'Repeated issues with no pattern recognition'],
            amateur: 'Writes what happened.',
            pro: 'Writes what must happen next and who owns it.',
            professional_standard: 'Every unresolved issue must have owner, deadline, and next action.',
            real_service_context: 'A maintenance issue ignored for three shifts becomes a guest-facing failure.',
            practical_execution: ['Log during shift when possible', 'Separate facts from opinions', 'Assign owner', 'Review previous shift notes before briefing'],
            guest_application: 'Business memory prevents guests from suffering repeat failures.',
            manager_notes: 'Use end-of-day reports as a management tool, not paperwork.',
            drill: 'Rewrite a vague shift note into a clear operational handoff.',
            assessment_questions: ['What makes a handoff actionable?', 'Why does business memory matter?', 'What is an open loop?']
          }),
          lesson({
            id: 'manager-005',
            title: 'Communication Systems: Staff, Owner, Kitchen, Bar, And Events',
            duration: '36 min',
            objective: 'Use the right communication channel, timing, and language for each operational audience.',
            technical_depth: 'Managers communicate across different systems: staff execution, owner risk, kitchen timing, bar output, host flow, event clients, and suppliers. Each audience needs different detail. Staff need clarity and priorities. Owners need risk, value, and decision points. Kitchen needs timing and impact. Event clients need confidence and next steps. Poor communication creates duplication, missed approvals, and emotional noise.',
            taxonomy: [
              { type: 'Staff directive', usage: 'Short, action-oriented, owner and deadline clear.' },
              { type: 'Owner update', usage: 'Risk, financial exposure, decision request, summary.' },
              { type: 'Kitchen/bar coordination', usage: 'Timing, priority, fire, shortage, recovery.' },
              { type: 'Client communication', usage: 'Professional, calm, documented, expectation-based.' }
            ],
            terminology: ['communication loop', 'decision request', 'signal quality', 'escalation channel', 'closed-loop communication'],
            common_failures: ['Too much detail to staff', 'Too little detail to owner', 'No confirmation', 'Wrong channel', 'Emotional language in logs'],
            amateur: 'Sends messages when stressed.',
            pro: 'Designs communication so decisions and actions happen faster.',
            professional_standard: 'Critical communication must be closed-loop: sent, received, understood, acted.',
            real_service_context: 'A budget request without ROI language will stall owner approval.',
            practical_execution: ['Choose channel', 'State action or decision needed', 'Confirm receipt', 'Document important outcomes'],
            guest_application: 'Strong internal communication becomes smoother guest experience.',
            manager_notes: 'Coach managers to write owner notes as executive summaries.',
            drill: 'Convert the same issue into staff directive, owner note, and kitchen message.',
            assessment_questions: ['What is closed-loop communication?', 'How does owner communication differ from staff communication?', 'Why does channel matter?']
          })
        ]
      },
      {
        id: 'manager-profit',
        title: 'Labor, Coaching, P&L, Approvals, And Performance',
        lessons: [
          lesson({
            id: 'manager-006',
            title: 'Labor Control, Productivity, And Shift Yield',
            duration: '42 min',
            objective: 'Control labor with service quality, not blind cutting.',
            technical_depth: 'Labor control is matching staffing to demand, complexity, skill, and service promise. Cutting labor too early can create guest failures that cost more than the saved wage. Managers must understand covers per labor hour, sales per labor hour, event staffing needs, break planning, section load, and skill mix. Productivity is not simply fewer staff; it is the right team at the right moment.',
            taxonomy: [
              { type: 'Coverage labor', usage: 'Minimum staffing to open and serve safely.' },
              { type: 'Pressure labor', usage: 'Peak coverage for rush, events, and VIP load.' },
              { type: 'Skill labor', usage: 'Experienced staff where complexity is highest.' },
              { type: 'Prep labor', usage: 'Pre-service work that protects live execution.' }
            ],
            terminology: ['labor percentage', 'sales per labor hour', 'covers per labor hour', 'skill mix', 'break plan', 'cut plan'],
            common_failures: ['Cutting before rush clears', 'Ignoring skill mix', 'No break planning', 'Using labor percent without service risk', 'Overstaffing low-yield hours'],
            amateur: 'Cuts staff to hit a number.',
            pro: 'Controls labor while protecting the guest promise.',
            professional_standard: 'Labor decisions must consider forecast, live pressure, skill mix, and service risk.',
            real_service_context: 'Saving one server hour can cost multiple comps if service collapses.',
            practical_execution: ['Review forecast', 'Plan breaks before rush', 'Cut by section pressure', 'Protect key skill roles', 'Track sales per labor hour'],
            guest_application: 'Guests feel labor mistakes as delays, errors, and weak recovery.',
            manager_notes: 'Review labor decisions against incident patterns, not only payroll.',
            drill: 'Build a staffing plan for a rainy weekday and a sold-out Friday.',
            assessment_questions: ['What is skill mix?', 'Why can labor cuts increase cost?', 'Which metrics reveal productivity?']
          }),
          lesson({
            id: 'manager-007',
            title: 'Staff Coaching, Observation, And Performance Notes',
            duration: '40 min',
            objective: 'Coach staff through observable behavior rather than personality judgment.',
            technical_depth: 'Good coaching is specific, timely, and behavior-based. Managers should observe service moments, name the behavior, explain guest impact, agree on the next action, and follow up. Coaching should not be punitive by default. Performance notes should capture patterns, wins, risks, and training needs. The goal is capability growth and consistent standards.',
            taxonomy: [
              { type: 'Corrective coaching', usage: 'Specific behavior that needs change.' },
              { type: 'Development coaching', usage: 'Skill growth for future responsibility.' },
              { type: 'Recognition coaching', usage: 'Reinforce behavior that should repeat.' },
              { type: 'Pattern documentation', usage: 'Repeated behavior requiring manager memory.' }
            ],
            terminology: ['observable behavior', 'coaching note', 'feedback loop', 'standard gap', 'endorsement', 'readiness flag'],
            common_failures: ['Coaching personality', 'Waiting too long', 'No follow-up', 'Only negative notes', 'No specific standard'],
            amateur: 'Says be better next time.',
            pro: 'Names exactly what happened and what better looks like.',
            professional_standard: 'Every coaching note should include behavior, impact, standard, and next action.',
            real_service_context: 'A server repeatedly missing check-backs needs a pattern note and practice, not vague criticism.',
            practical_execution: ['Observe', 'Ask first', 'Name behavior', 'Connect to guest impact', 'Set one action', 'Follow up'],
            guest_application: 'Coached teams deliver consistency that guests notice without seeing the training.',
            manager_notes: 'Use coaching analytics to support staff, not shame them.',
            drill: 'Write three coaching notes from real service observations.',
            assessment_questions: ['What is observable behavior?', 'Why document wins?', 'How do you avoid punitive coaching?']
          }),
          lesson({
            id: 'manager-008',
            title: 'P&L Awareness For Floor Managers',
            duration: '48 min',
            objective: 'Understand how daily decisions affect revenue, cost, margin, and owner trust.',
            technical_depth: 'Managers influence P&L through labor, comps, waste, upselling, refunds, event execution, inventory control, table turns, and guest retention. P&L awareness does not mean turning managers into accountants; it means connecting service behavior to financial outcomes. A missed second drink, unmanaged delay, over-poured cocktail, wasted garnish, or poor table turn becomes measurable leakage.',
            taxonomy: [
              { type: 'Revenue driver', usage: 'Covers, average check, upsell, events, repeat guests.' },
              { type: 'Cost driver', usage: 'Labor, COGS, waste, comps, breakage.' },
              { type: 'Leakage', usage: 'Preventable loss through execution failure.' },
              { type: 'Owner signal', usage: 'Information owner needs for decisions.' }
            ],
            terminology: ['COGS', 'gross profit', 'average check', 'comp rate', 'waste variance', 'table turn', 'labor percentage'],
            common_failures: ['Treating comps as normal', 'No waste tracking', 'Ignoring missed upsell moments', 'No owner note for repeated risk'],
            amateur: 'Separates service from finance.',
            pro: 'Understands that service execution is financial performance.',
            professional_standard: 'Managers should be able to name the top three preventable leaks in their shift.',
            real_service_context: 'Unmanaged delay can reduce dessert, second drinks, tips, reviews, and return intent.',
            practical_execution: ['Track comp reasons', 'Monitor waste', 'Coach upsell language', 'Review table turns', 'Report repeated leakage'],
            guest_application: 'Better financial discipline funds better guest experience.',
            manager_notes: 'Teach P&L through examples from actual shifts.',
            drill: 'Estimate monthly value of missed second-drink opportunities from one weekend.',
            assessment_questions: ['How does service affect P&L?', 'What is leakage?', 'Why track comp reasons?']
          }),
          lesson({
            id: 'manager-009',
            title: 'Approval Workflows, Budget Requests, And Owner Governance',
            duration: '34 min',
            objective: 'Submit requests and decisions with enough context for fast owner approval.',
            technical_depth: 'Approval workflows fail when requests lack business logic. A manager request should explain problem, operational impact, amount, urgency, expected ROI, alternatives, and risk if not approved. Owner governance requires clean information, not emotional escalation. Requests should be categorized and tracked so decisions feed back to operations.',
            taxonomy: [
              { type: 'Budget request', usage: 'Capital or expense approval with ROI and urgency.' },
              { type: 'Operational request', usage: 'Supply, maintenance, staffing, or service need.' },
              { type: 'Event approval', usage: 'Revenue opportunity requiring owner decision.' },
              { type: 'More-info response', usage: 'Owner needs detail before decision.' }
            ],
            terminology: ['approval queue', 'expected ROI', 'urgency level', 'decision memo', 'owner governance', 'request status'],
            common_failures: ['No amount', 'No reason', 'No ROI', 'Request sent verbally only', 'No status follow-up'],
            amateur: 'Asks owner for permission without context.',
            pro: 'Frames a decision so the owner can approve or reject quickly.',
            professional_standard: 'Every approval request should answer: what, why, cost, urgency, ROI, and risk.',
            real_service_context: 'A broken printer request should include service impact and cost, not only frustration.',
            practical_execution: ['Define title', 'State problem', 'Estimate cost', 'Explain ROI or risk', 'Track status'],
            guest_application: 'Fast approvals prevent operational issues from becoming guest-facing.',
            manager_notes: 'Reject vague requests and coach better decision writing.',
            drill: 'Rewrite a vague supply request into an owner-ready approval memo.',
            assessment_questions: ['What must a budget request include?', 'Why does ROI matter?', 'How should owner responses flow back?']
          }),
          lesson({
            id: 'manager-010',
            title: 'Issue Escalation, Safety, And Responsible Authority',
            duration: '38 min',
            objective: 'Know when and how to escalate incidents involving safety, guest conflict, intoxication, staff risk, or owner exposure.',
            technical_depth: 'Escalation protects guests, staff, brand, and legal risk. Managers must recognize severity, document facts, use calm language, involve security or ownership when appropriate, and avoid public confrontation. Responsible authority means acting early without overreacting. Alcohol service, harassment, allergen risk, injury, theft, aggressive behavior, and media/review exposure all require specific escalation pathways.',
            taxonomy: [
              { type: 'Safety escalation', usage: 'Injury, allergy, aggression, intoxication, hazard.' },
              { type: 'Brand escalation', usage: 'VIP issue, public complaint, media, review threat.' },
              { type: 'Staff escalation', usage: 'Harassment, conflict, repeated underperformance, absence.' },
              { type: 'Owner escalation', usage: 'Financial exposure or reputation risk.' }
            ],
            terminology: ['severity level', 'incident report', 'responsible alcohol service', 'duty of care', 'escalation path', 'de-escalation'],
            common_failures: ['Waiting too long', 'Arguing publicly', 'No documentation', 'No staff protection', 'Owner informed too late'],
            amateur: 'Escalates only after losing control.',
            pro: 'Escalates at the first sign of material risk.',
            professional_standard: 'Safety and dignity override short-term revenue.',
            real_service_context: 'An intoxicated guest should be handled before they become a table conflict or legal risk.',
            practical_execution: ['Assess severity', 'Move conversation discreetly', 'Use calm authority', 'Document facts', 'Notify required parties'],
            guest_application: 'Guests trust venues that control risk calmly.',
            manager_notes: 'Create escalation scripts and train them before incidents occur.',
            drill: 'Simulate three escalation cases: intoxication, allergy concern, abusive guest.',
            assessment_questions: ['What requires immediate escalation?', 'What should be documented?', 'How does de-escalation protect staff?']
          })
        ]
      }
    ]
  },
  {
    id: 'event-academy',
    title: 'Event Academy',
    dean: 'Luxury Events Operations Director',
    color: '#7a4f2a',
    category: 'Event Operations',
    description: 'Premium event operations for BEOs, business events, birthdays, weddings, retreats, staffing, beverage scale, dietary control, and post-event review.',
    badge: 'Events',
    roles: ['employee', 'manager', 'admin'],
    totalLessons: 10,
    modules: [
      {
        id: 'event-planning',
        title: 'BEOs, Event Types, Setup, And Flow',
        lessons: [
          lesson({
            id: 'event-001',
            title: 'Reading The BEO And Event Intelligence Brief',
            duration: '42 min',
            objective: 'Read a banquet event order as an operational risk map, not just a document.',
            technical_depth: 'A BEO should tell staff who the client is, event purpose, timeline, guest count, room, setup, service style, menu, beverage plan, dietary restrictions, staffing, rentals, AV, billing, contact, and special notes. The manager must convert the BEO into work assignments and risk controls. Missing details should be clarified before event day.',
            taxonomy: [
              { type: 'Client profile', usage: 'Contact, purpose, VIPs, expectations, sensitivity.' },
              { type: 'Operational plan', usage: 'Timing, layout, staffing, setup, rentals, AV.' },
              { type: 'F&B plan', usage: 'Menu, beverage, dietary, service style, quantities.' },
              { type: 'Risk notes', usage: 'Weather, speeches, VIP, allergies, tight timeline, budget pressure.' }
            ],
            terminology: ['BEO', 'run sheet', 'service window', 'guarantee', 'dietary matrix', 'event captain'],
            common_failures: ['Staff not briefed on purpose', 'Missing dietary details', 'No timing owner', 'No client contact confirmed', 'Setup unclear'],
            amateur: 'Reads the BEO for times and guest count only.',
            pro: 'Finds risks, assignments, and decision gaps before service.',
            professional_standard: 'No event should begin with unresolved questions in the BEO.',
            real_service_context: 'A missing dietary note at a wedding can become a client trust failure.',
            practical_execution: ['Read full BEO', 'Highlight risks', 'Assign owners', 'Confirm gaps', 'Brief staff'],
            guest_application: 'Guests experience BEO quality as invisible coordination.',
            manager_notes: 'Require event captains to present the risk map before setup.',
            drill: 'Review a sample BEO and identify ten required operational actions.',
            assessment_questions: ['What is a guarantee?', 'What makes a BEO incomplete?', 'Why is event purpose important?']
          }),
          lesson({
            id: 'event-002',
            title: 'Business Events, Birthdays, Weddings, And Retreats',
            duration: '45 min',
            objective: 'Adapt service behavior to the event type and client psychology.',
            technical_depth: 'Different event types have different success criteria. Business events require timing, discretion, AV awareness, coffee/water consistency, and professional tone. Birthdays require warmth, pacing, photo moments, and celebratory cues. Weddings require emotional sensitivity, synchronized timing, family dynamics, and flawless transitions. Boutique retreats require wellness language, privacy, amenities, and relaxed luxury. Event staff must understand the purpose, not only the tasks.',
            taxonomy: [
              { type: 'Business event', usage: 'Efficiency, timing, discretion, AV, coffee and water discipline.' },
              { type: 'Birthday', usage: 'Warmth, celebration, cake timing, photos, flexible pacing.' },
              { type: 'Wedding', usage: 'Emotion, ceremony timing, VIP family, speeches, synchronized service.' },
              { type: 'Boutique retreat', usage: 'Privacy, wellness, amenities, calm service, premium details.' }
            ],
            terminology: ['event persona', 'client objective', 'VIP family', 'speech timing', 'retreat amenity', 'service tone'],
            common_failures: ['Same service style for all events', 'Missing speech timing', 'No cake coordination', 'Business event service too casual', 'Retreat service too intrusive'],
            amateur: 'Executes tasks.',
            pro: 'Executes the emotional promise of the event type.',
            professional_standard: 'Every staff member should know what success means for that specific event.',
            real_service_context: 'A birthday can tolerate flexible timing; a business keynote usually cannot.',
            practical_execution: ['Identify event type', 'Name success criteria', 'Adapt language', 'Protect key moments', 'Brief staff on tone'],
            guest_application: 'Guests feel an event is premium when service matches the occasion.',
            manager_notes: 'Add event persona to every pre-event briefing.',
            drill: 'Create different service priorities for a 60-person business event and a 60-person wedding.',
            assessment_questions: ['What differs between business and birthday service?', 'Why do retreats require privacy?', 'What is event persona?']
          }),
          lesson({
            id: 'event-003',
            title: 'Banquet Setup, Room Flow, And Premium Table Standards',
            duration: '40 min',
            objective: 'Set event spaces with functional flow, visual precision, and service efficiency.',
            technical_depth: 'Room setup controls both guest perception and staff movement. Tables, chairs, bar stations, buffet, service paths, AV, coat area, welcome point, and VIP tables must work together. Premium setup requires symmetry, sightlines, spacing, clean linen, glassware polish, accurate place settings, and no visible back-of-house clutter. Flow must prevent bottlenecks at entrance, bar, buffet, and exits.',
            taxonomy: [
              { type: 'Seated setup', usage: 'Precise place settings, service aisles, speech sightlines.' },
              { type: 'Reception setup', usage: 'Standing flow, tray pass paths, bar access, high-top placement.' },
              { type: 'Buffet setup', usage: 'Queue direction, plate start, cutlery end, dietary labels.' },
              { type: 'Retreat setup', usage: 'Comfort, privacy, amenity placement, relaxed luxury.' }
            ],
            terminology: ['floor plan', 'service aisle', 'sightline', 'traffic flow', 'buffet queue', 'place setting', 'reset point'],
            common_failures: ['Bar bottleneck', 'No service aisle', 'Crooked tables', 'Unlabeled dietary items', 'Visible clutter'],
            amateur: 'Sets the room to look full.',
            pro: 'Sets the room to look premium and operate smoothly.',
            professional_standard: 'Setup must be inspected from guest eye level and staff movement paths.',
            real_service_context: 'A beautiful room with a blocked service aisle becomes operationally weak.',
            practical_execution: ['Walk guest path', 'Walk staff path', 'Check symmetry', 'Check bottlenecks', 'Polish final surfaces'],
            guest_application: 'Setup communicates quality before food or beverage arrives.',
            manager_notes: 'Photograph final approved setup for repeat events.',
            drill: 'Review a floor plan and identify three flow risks.',
            assessment_questions: ['Why are service aisles important?', 'Where do bottlenecks form?', 'How should buffet flow be arranged?']
          }),
          lesson({
            id: 'event-004',
            title: 'Synchronized Service And Tray Passing',
            duration: '38 min',
            objective: 'Execute coordinated service moments with timing, posture, safety, and consistency.',
            technical_depth: 'Event service often depends on synchronization. Plated service should land by table, position, or wave without chaos. Tray passing requires posture, balance, guest approach, description accuracy, allergen awareness, and route planning. Synchronized service creates luxury because guests see coordination. Poor synchronization creates cold food, uneven guest experience, and staff collision.',
            taxonomy: [
              { type: 'Plated wave', usage: 'Team serves tables in controlled sequence.' },
              { type: 'Simultaneous drop', usage: 'VIP or formal dining where timing matters visually.' },
              { type: 'Tray pass', usage: 'Canapes, welcome drinks, reception items.' },
              { type: 'Clearance wave', usage: 'Coordinated clearing to protect pace and room appearance.' }
            ],
            terminology: ['service captain', 'wave service', 'silent count', 'tray route', 'canape language', 'allergen callout'],
            common_failures: ['No route planning', 'Cold food at last tables', 'Servers cannot describe canapes', 'Trays held too low', 'No allergen awareness'],
            amateur: 'Carries items to whoever is closest.',
            pro: 'Moves with route, language, and timing discipline.',
            professional_standard: 'Staff must know item names, allergens, and route before tray passing begins.',
            real_service_context: 'A guest with an allergy may ask a tray passer before any manager is nearby.',
            practical_execution: ['Brief item description', 'Assign route', 'Hold tray safely', 'Approach open body language', 'Clear used items quickly'],
            guest_application: 'Coordinated service feels expensive because it looks intentional.',
            manager_notes: 'Test tray pass language before doors open.',
            drill: 'Tray pass three canapes and describe each in under six seconds.',
            assessment_questions: ['What must tray pass staff know?', 'Why plan routes?', 'How does synchronized service signal luxury?']
          }),
          lesson({
            id: 'event-005',
            title: 'Buffet Flow, Dietary Restrictions, And Label Discipline',
            duration: '36 min',
            objective: 'Operate buffet and dietary service with safety, clarity, and premium presentation.',
            technical_depth: 'Buffets fail when flow, replenishment, labels, utensils, temperature, and dietary control are weak. Guests need clear direction and confidence. Dietary restrictions require separation, signage, staff knowledge, and sometimes dedicated service. Hot food must stay hot, cold food cold, and allergen cross-contact must be controlled. Buffet appearance must be refreshed before it looks depleted.',
            taxonomy: [
              { type: 'Flow design', usage: 'Plate start, dish order, cutlery, napkin, exit path.' },
              { type: 'Dietary label', usage: 'Vegan, vegetarian, gluten-free, nuts, dairy, shellfish where relevant.' },
              { type: 'Replenishment', usage: 'Small fresh refills before depletion.' },
              { type: 'Temperature control', usage: 'Food safety and perceived quality.' }
            ],
            terminology: ['cross-contact', 'chafing dish', 'cold holding', 'replenishment par', 'dietary label', 'buffet reset'],
            common_failures: ['No labels', 'Shared utensils across allergens', 'Empty platters', 'Messy buffet edges', 'Poor queue direction'],
            amateur: 'Sets buffet and waits.',
            pro: 'Manages buffet as live service.',
            professional_standard: 'Dietary and allergen information must be clear before guest service begins.',
            real_service_context: 'A vegan guest should not have to interrogate staff at a premium event.',
            practical_execution: ['Label clearly', 'Separate utensils', 'Refresh before empty', 'Watch queue flow', 'Assign dietary contact'],
            guest_application: 'Clear buffet service reduces anxiety and protects safety.',
            manager_notes: 'Buffet attendants must be trained, not assigned as passive watchers.',
            drill: 'Design buffet labels and utensil plan for a mixed dietary event.',
            assessment_questions: ['What is cross-contact?', 'How should buffet replenishment work?', 'Why are labels part of hospitality?']
          })
        ]
      },
      {
        id: 'event-beverage',
        title: 'Beverage Scale, Staffing, Client Communication, And Review',
        lessons: [
          lesson({
            id: 'event-006',
            title: 'Staffing Ratios, Role Assignment, And Event Captaincy',
            duration: '42 min',
            objective: 'Build staffing plans that match guest count, service style, complexity, and risk.',
            technical_depth: 'Event staffing depends on service style, guest count, beverage complexity, distance, setup, breakdown, dietary needs, VIPs, and timeline. Ratios are starting points, not rules. A cocktail reception needs different labor than a seated plated dinner. The event captain owns briefing, timing, client contact, staff allocation, issue escalation, and final review. Clear role assignment prevents staff from clustering or abandoning key zones.',
            taxonomy: [
              { type: 'Event captain', usage: 'Owns timeline, client contact, staff coordination, escalation.' },
              { type: 'Service staff', usage: 'Tray pass, plated service, clearing, guest care.' },
              { type: 'Bar staff', usage: 'Cocktails, wine, batching, glassware, responsible service.' },
              { type: 'Setup/breakdown staff', usage: 'Room build, reset, load-out, final inspection.' }
            ],
            terminology: ['staffing ratio', 'event captain', 'zone ownership', 'labor forecast', 'breakdown crew', 'service style'],
            common_failures: ['No captain assigned', 'Ratios copied blindly', 'No breakdown plan', 'Staff unclear on zones', 'Understaffed bar'],
            amateur: 'Schedules based on guest count only.',
            pro: 'Schedules based on complexity, style, risk, and timing.',
            professional_standard: 'Every event must have one clear captain and assigned role ownership.',
            real_service_context: 'A 100-person cocktail event can need more bar labor than a 140-person seated lunch.',
            practical_execution: ['Identify service style', 'Assign captain', 'Map zones', 'Staff peak moments', 'Plan breakdown'],
            guest_application: 'Guests experience good staffing as flow, speed, and calm.',
            manager_notes: 'Compare staffing plan to actual post-event labor and adjust templates.',
            drill: 'Build staffing plans for business event, wedding, birthday, and retreat with 120 guests.',
            assessment_questions: ['Why are ratios only starting points?', 'What does event captain own?', 'How does service style affect staffing?']
          }),
          lesson({
            id: 'event-007',
            title: 'Wine Service At Scale',
            duration: '36 min',
            objective: 'Serve wine to groups without losing temperature, pacing, or portion control.',
            technical_depth: 'Wine service at scale requires pre-chilled inventory, opening plan, pour sequence, glassware count, backup stock, table mapping, and portion control. Staff must understand when to pre-open, when to present, when to pour, and how to manage top-ups. Sparkling service needs cold chain and speed. Red wine service needs correct temperature and bottle pacing. Over-pouring creates shortage and cost loss.',
            taxonomy: [
              { type: 'Welcome sparkling', usage: 'Pre-chilled, staged, poured close to arrival.' },
              { type: 'Table wine', usage: 'Bottle allocation by table and course.' },
              { type: 'Top-up service', usage: 'Controlled, discreet, never automatic overfill.' },
              { type: 'Premium bottle service', usage: 'Presentation and captain control for VIP tables.' }
            ],
            terminology: ['bottle allocation', 'standard pour', 'top-up', 'cold chain', 'pre-open', 'service temperature'],
            common_failures: ['Warm sparkling', 'Over-pouring', 'No backup bottles', 'Not enough glassware', 'Bottles opened too early'],
            amateur: 'Pours wine until glasses look full.',
            pro: 'Controls pace, portion, temperature, and guest need.',
            professional_standard: 'Event wine service must protect both guest experience and bottle yield.',
            real_service_context: 'A wedding toast fails if sparkling is warm or poured too early.',
            practical_execution: ['Calculate bottle needs', 'Stage glassware', 'Assign pour routes', 'Control portion size', 'Monitor temperature'],
            guest_application: 'Smooth wine service makes the event feel polished and generous.',
            manager_notes: 'Audit wine yield after event to improve future planning.',
            drill: 'Calculate bottles for 150 guests with welcome sparkling and dinner wine.',
            assessment_questions: ['Why is portion control critical?', 'When should sparkling be poured?', 'What does cold chain mean?']
          }),
          lesson({
            id: 'event-008',
            title: 'Cocktail Service At Scale And Welcome Drink Systems',
            duration: '40 min',
            objective: 'Produce cocktails for event volume without sacrificing freshness, speed, or responsible service.',
            technical_depth: 'Event cocktails require batching strategy, garnish par, glassware, ice, station layout, ABV control, and service timing. Welcome drinks should be fast, stable, visually consistent, and easy to carry. Carbonated drinks should be topped at service. Citrus drinks may use same-day batches. High-ABV signatures require pacing and water availability. Mocktail options should not feel like inferior substitutes.',
            taxonomy: [
              { type: 'Welcome cocktail', usage: 'Fast arrival service, moderate ABV, strong visual identity.' },
              { type: 'Signature event cocktail', usage: 'Client identity and premium storytelling.' },
              { type: 'Batch base', usage: 'Stable pre-mix without carbonation or fragile garnish.' },
              { type: 'Mocktail equivalent', usage: 'Adult flavor profile without alcohol.' }
            ],
            terminology: ['batch base', 'service top', 'garnish par', 'ABV pacing', 'glassware turn', 'mocktail parity'],
            common_failures: ['Batching carbonation', 'Too complex garnish', 'No low-ABV option', 'Underestimating ice', 'No responsible service plan'],
            amateur: 'Scales a bar cocktail by multiplying the recipe.',
            pro: 'Redesigns for service reality while preserving identity.',
            professional_standard: 'Event cocktails must have batch plan, garnish plan, glassware plan, ice plan, and ABV note.',
            real_service_context: 'A 200-guest welcome drink needs assembly logic more than bartender showmanship.',
            practical_execution: ['Choose stable build', 'Batch base', 'Top fresh components at service', 'Par garnish', 'Monitor guest pace'],
            guest_application: 'A good welcome drink sets the event tone immediately.',
            manager_notes: 'Use Cocktail Lab approved recipes only after event scalability review.',
            drill: 'Create a 200-serve welcome drink production plan with batch, garnish, ice, and glassware.',
            assessment_questions: ['Why not multiply blindly?', 'What makes mocktail parity?', 'Which components should be added at service?']
          }),
          lesson({
            id: 'event-009',
            title: 'Client Communication, Changes, And Day-Of Control',
            duration: '34 min',
            objective: 'Communicate with clients in a way that protects confidence, scope, and operational control.',
            technical_depth: 'Event clients need clarity, not operational chaos. Changes should be documented, confirmed, and evaluated for cost, timing, labor, and guest impact. Day-of communication should go through the event captain where possible. Staff should not promise changes without approval. Professional language acknowledges the request, checks feasibility, confirms impact, and provides next step.',
            taxonomy: [
              { type: 'Pre-event change', usage: 'Document and approve before event day.' },
              { type: 'Day-of request', usage: 'Assess feasibility and cost before promising.' },
              { type: 'Client concern', usage: 'Acknowledge, solve, and follow up.' },
              { type: 'Scope change', usage: 'Requires manager approval and possible budget update.' }
            ],
            terminology: ['scope change', 'event captain', 'client contact', 'change log', 'feasibility check', 'approval trail'],
            common_failures: ['Staff promises changes', 'No written confirmation', 'Client receives conflicting answers', 'Cost impact ignored'],
            amateur: 'Says yes to keep the client happy.',
            pro: 'Protects the event by confirming what is possible and what changes.',
            professional_standard: 'All material changes must be documented and approved.',
            real_service_context: 'A last-minute bar extension affects labor, inventory, and licensing risk.',
            practical_execution: ['Listen', 'Confirm request', 'Check feasibility', 'State impact', 'Document decision'],
            guest_application: 'Clients trust teams that are calm and precise under changing conditions.',
            manager_notes: 'Empower event captains with approved response language.',
            drill: 'Handle a client asking to add 30 guests one hour before start.',
            assessment_questions: ['What is a scope change?', 'Who should handle day-of client requests?', 'Why document changes?']
          }),
          lesson({
            id: 'event-010',
            title: 'Breakdown, Recovery, And Post-Event Review',
            duration: '36 min',
            objective: 'Close events with clean breakdown, protected assets, client follow-up, and operational learning.',
            technical_depth: 'The event is not over when the guest leaves. Breakdown affects labor cost, asset protection, cleanliness, next-day readiness, and client memory. Post-event review should capture revenue, labor, waste, breakage, incidents, client feedback, staffing accuracy, and repeat opportunity. A strong review turns one event into better future performance.',
            taxonomy: [
              { type: 'Breakdown control', usage: 'Glassware, rentals, linen, equipment, waste, storage.' },
              { type: 'Asset protection', usage: 'Count, clean, return, report damaged or missing items.' },
              { type: 'Client close', usage: 'Thank-you, feedback, next opportunity.' },
              { type: 'Operational review', usage: 'What worked, what failed, what changes next time.' }
            ],
            terminology: ['load-out', 'rental count', 'breakage log', 'post-event review', 'client follow-up', 'repeat opportunity'],
            common_failures: ['No breakage count', 'Mess left for next shift', 'No client follow-up', 'No waste review', 'No learning captured'],
            amateur: 'Cleans up and leaves.',
            pro: 'Closes the event financially, operationally, and relationally.',
            professional_standard: 'Every event should produce a short post-event review within 24 hours.',
            real_service_context: 'Missed rental counts can erase event profit after the fact.',
            practical_execution: ['Assign breakdown zones', 'Count assets', 'Log waste and breakage', 'Send client follow-up', 'Review metrics'],
            guest_application: 'Post-event professionalism increases rebooking and referrals.',
            manager_notes: 'Use review notes to improve Event CRM templates.',
            drill: 'Write a post-event review for a wedding with one delay and strong beverage sales.',
            assessment_questions: ['Why is breakdown part of profit control?', 'What belongs in post-event review?', 'How does follow-up drive future revenue?']
          })
        ]
      }
    ]
  }
]

export const UNIVERSITY_MANIFEST = [...RAW_UNIVERSITY_MANIFEST, ...ADDITIONAL_UNIVERSITY_ACADEMIES].map(flattenAcademy)
