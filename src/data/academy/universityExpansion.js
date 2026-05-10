function academyLesson({
  id,
  title,
  duration = '30 min',
  objective,
  doctrine,
  technical_depth,
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
      standards: professional_standard ? [professional_standard] : [],
      taxonomy,
      terminology,
      operational_consequences,
      common_failures,
      amateur_vs_pro: { amateur, pro },
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

const coffeeLessonDefaults = {
  doctrine: 'Coffee is a hospitality quality signal. The final cup can confirm or damage the guest perception created by the meal.',
  recovery_logic: 'If coffee quality fails, remake quickly, acknowledge the issue without technical excuses, and protect the guest final impression.',
  manager_notes: 'Audit coffee standards during opening, pre-rush, and closing. Coffee inconsistency usually comes from workflow drift, not lack of effort.'
}

const culinaryLessonDefaults = {
  doctrine: 'Front-of-house culinary intelligence turns staff from order takers into trusted menu guides.',
  recovery_logic: 'When food knowledge or execution fails, clarify the exact issue, protect allergy safety first, and communicate with the kitchen in precise language.',
  manager_notes: 'Use tastings, chef notes, and pre-shift questions to keep menu knowledge alive after rollout week.'
}

const ethicsLessonDefaults = {
  doctrine: 'Luxury hospitality protects guest dignity, safety, privacy, and trust before convenience.',
  recovery_logic: 'Ethical recovery should be calm, private, documented, and dignity-preserving.',
  manager_notes: 'Ethical standards must be coached before pressure moments, not improvised after an incident.'
}

const trainerLessonDefaults = {
  doctrine: 'Training is culture transfer. A trainer is responsible for behavior change, not information delivery.',
  recovery_logic: 'When a trainee fails, diagnose whether the issue is knowledge, skill, confidence, station design, or unclear expectation.',
  manager_notes: 'Trainer quality should be calibrated through observation, not seniority alone.'
}

export const ADDITIONAL_UNIVERSITY_ACADEMIES = [
  {
    id: 'coffee-program',
    title: 'Coffee Program',
    dean: 'Specialty Coffee Director and Hospitality Barista Trainer',
    color: '#8a5a3b',
    category: 'Coffee Service, Extraction, And Profitability',
    description: 'Elite hospitality coffee education across origin, espresso science, milk texture, service ritual, workflow, sensory training, and commercial discipline.',
    badge: 'Coffee Craft',
    roles: ['employee', 'manager', 'admin'],
    totalLessons: 10,
    modules: [
      {
        id: 'coffee-foundations',
        title: 'Foundations, Extraction, And Sensory Control',
        lessons: [
          academyLesson({
            ...coffeeLessonDefaults,
            id: 'coffee-001',
            title: 'Origin, Processing, Freshness, And Guest Value',
            objective: 'Explain why origin, processing method, freshness, and storage change coffee quality in hospitality service.',
            technical_depth: 'Coffee flavor is shaped by variety, altitude, climate, processing method, roast level, grind, water, and time from roast. Washed coffees often present clearer acidity; natural coffees can show fruit intensity; honey process can sit between clarity and sweetness. Freshness matters because aromatic compounds decline after roasting and ground coffee oxidizes rapidly.',
            taxonomy: [
              { type: 'Washed process', usage: 'Clean acidity, transparent origin character, useful for precise tasting language.' },
              { type: 'Natural process', usage: 'Fruit intensity and body, but higher defect risk if poorly handled.' },
              { type: 'Honey process', usage: 'Round sweetness and texture, useful for approachable premium service.' }
            ],
            terminology: ['arabica', 'robusta', 'altitude', 'processing', 'degassing', 'oxidation', 'freshness window'],
            common_failures: ['Using stale pre-ground coffee', 'Describing origin without flavor meaning', 'Leaving beans exposed to heat and air', 'Treating coffee as an afterthought after dessert'],
            amateur: 'Serves coffee as a generic closing item.',
            pro: 'Uses coffee origin, freshness, and cup style to reinforce the restaurant quality standard.',
            professional_standard: 'Beans are stored airtight, away from heat and light, and ground only as needed for service.',
            real_service_context: 'A guest who loved dinner can still leave disappointed if espresso tastes stale or burnt.',
            practical_execution: ['Check roast date', 'Protect beans from air', 'Use origin notes in guest language', 'Taste espresso before service'],
            guest_application: 'Staff can explain coffee in simple sensory terms: bright, chocolate-led, floral, nutty, or full-bodied.',
            drill: 'Taste one washed and one natural coffee side by side. Write one guest-safe sentence for each.',
            assessment_questions: ['Why does ground coffee stale faster?', 'What does processing affect?', 'How should staff describe coffee without sounding technical?']
          }),
          academyLesson({
            ...coffeeLessonDefaults,
            id: 'coffee-002',
            title: 'Arabica, Robusta, Altitude, And Roast Levels',
            objective: 'Recognize how species, altitude, and roast level affect body, bitterness, aroma, and perceived quality.',
            technical_depth: 'Arabica usually carries higher aromatic complexity and acidity. Robusta has more caffeine, heavier bitterness, and crema contribution. Higher altitude slows cherry development and can increase density, acidity, and complexity. Roast level changes perceived sweetness, acidity, bitterness, and origin clarity: light roast preserves origin but requires precision; dark roast increases roast flavor and bitterness.',
            taxonomy: [
              { type: 'Arabica', usage: 'Complex aroma, acidity, sweetness, premium positioning.' },
              { type: 'Robusta', usage: 'Crema, caffeine, bitterness, blend structure when used carefully.' },
              { type: 'Light roast', usage: 'Origin clarity and acidity; less forgiving in espresso.' },
              { type: 'Medium roast', usage: 'Hospitality balance between sweetness, body, and guest accessibility.' },
              { type: 'Dark roast', usage: 'Lower acidity, more bitterness, stronger roast identity.' }
            ],
            terminology: ['density', 'caffeine', 'crema', 'roast development', 'origin clarity', 'solubility'],
            common_failures: ['Assuming dark roast means stronger quality', 'Ignoring roast date', 'Using light roast espresso without dialing skill', 'Confusing crema with flavor quality'],
            amateur: 'Calls every coffee strong or smooth.',
            pro: 'Connects roast choice to guest preference and service context.',
            professional_standard: 'Staff should know the house coffee species/blend, roast level, and guest-facing flavor profile.',
            real_service_context: 'Breakfast service may need a different coffee profile from fine dining dessert service.',
            practical_execution: ['Identify house roast level', 'Taste espresso and milk beverage', 'Practice two guest descriptions', 'Match roast style to guest preference'],
            guest_application: 'A guest asking for low bitterness can be guided toward milk, filter, or a sweeter roast profile.',
            drill: 'Compare medium and dark roast espresso. Mark acidity, bitterness, body, and finish.',
            assessment_questions: ['What does altitude often influence?', 'Why can robusta appear in blends?', 'What is the risk of over-roasting?']
          }),
          academyLesson({
            ...coffeeLessonDefaults,
            id: 'coffee-003',
            title: 'Grind Science, Water, And Extraction Basics',
            objective: 'Control extraction variables through grind size, dose, yield, water, contact time, and service consistency.',
            technical_depth: 'Extraction is the movement of soluble compounds from coffee into water. Grind size changes surface area and flow resistance. Fine grind increases extraction and slows flow; coarse grind decreases extraction and speeds flow. Water mineral content affects flavor clarity and machine health. The operator must control dose, yield, time, temperature, distribution, and cleanliness before blaming the coffee.',
            taxonomy: [
              { type: 'Under-extraction', usage: 'Sour, sharp, thin, fast flow, low sweetness.' },
              { type: 'Over-extraction', usage: 'Bitter, dry, hollow, harsh finish.' },
              { type: 'Balanced extraction', usage: 'Sweetness, clarity, body, integrated acidity.' }
            ],
            terminology: ['dose', 'yield', 'brew ratio', 'contact time', 'TDS', 'extraction yield', 'channeling'],
            common_failures: ['Changing many variables at once', 'Ignoring water quality', 'Not purging grinder retention', 'Serving espresso without tasting calibration'],
            amateur: 'Adjusts randomly until the shot looks acceptable.',
            pro: 'Changes one variable at a time and documents the recipe.',
            professional_standard: 'Espresso recipe includes dose, yield, and target time. It is checked whenever volume or flavor drifts.',
            real_service_context: 'A rushed breakfast station can drift into sour or bitter coffee within 30 minutes if grind is not monitored.',
            practical_execution: ['Weigh dose', 'Weigh yield', 'Time shot', 'Taste result', 'Adjust one variable only'],
            guest_application: 'Consistent extraction makes every table receive the same quality signal.',
            drill: 'Pull three shots with different grind settings while keeping dose and yield fixed. Taste and document differences.',
            assessment_questions: ['What does finer grind usually do?', 'Why change one variable at a time?', 'What are signs of under-extraction?']
          }),
          academyLesson({
            ...coffeeLessonDefaults,
            id: 'coffee-004',
            title: 'Espresso Science, Puck Prep, And Shot Diagnosis',
            objective: 'Prepare, diagnose, and correct espresso using dose, distribution, tamping, pressure, ratio, and sensory evidence.',
            technical_depth: 'Espresso requires resistance from an even coffee bed. Poor distribution creates channeling, where water finds weak paths and extracts unevenly. Correct puck prep includes dry basket, consistent dose, level distribution, firm even tamp, clean rim, immediate brewing, and sensory verification. Shot time alone is not quality; taste confirms whether the recipe is working.',
            taxonomy: [
              { type: 'Channeling', usage: 'Uneven flow causing sour and bitter notes in the same shot.' },
              { type: 'Brew ratio', usage: 'Dose to beverage weight; common hospitality range is near 1:2 for espresso.' },
              { type: 'Puck integrity', usage: 'Even distribution and tamp reduce extraction failure.' }
            ],
            terminology: ['portafilter', 'basket', 'puck', 'distribution', 'tamp', 'brew pressure', 'pre-infusion'],
            common_failures: ['Wet basket', 'Uneven tamp', 'Dirty group head', 'Waiting too long before brewing', 'Judging by crema only'],
            amateur: 'Pulls shots by eye and keeps serving.',
            pro: 'Uses weight, time, taste, and visual flow to diagnose the espresso.',
            professional_standard: 'Every espresso station should have scales, timers, clean towels, and a written opening recipe.',
            real_service_context: 'A bitter espresso after a premium meal creates a final negative memory.',
            practical_execution: ['Dry basket', 'Dose by weight', 'Distribute evenly', 'Tamp level', 'Brew immediately', 'Taste test'],
            guest_application: 'Better espresso improves standalone coffee, cappuccino, affogato, and dessert attachment.',
            drill: 'Intentionally tamp unevenly once, then correctly once. Compare flow and taste.',
            assessment_questions: ['What causes channeling?', 'Why does taste matter more than crema?', 'What is brew ratio?']
          }),
          academyLesson({
            ...coffeeLessonDefaults,
            id: 'coffee-005',
            title: 'Milk Chemistry, Microfoam, And Luxury Beverage Texture',
            objective: 'Create consistent milk texture, temperature, and beverage standards across cappuccino, flat white, latte, and alternatives.',
            technical_depth: 'Milk steaming is heat management and air integration. Proteins stabilize foam, fats carry texture, and sugars influence sweetness. Microfoam should be glossy, fine, and integrated, not dry or bubbly. Overheating damages sweetness and creates cooked flavors. Alternative milks require different aeration and temperature control because protein and fat structures vary.',
            taxonomy: [
              { type: 'Cappuccino', usage: 'Stronger foam presence, balanced espresso and milk, no dry cap in premium service.' },
              { type: 'Flat white', usage: 'Smaller, silkier, espresso-forward, fine microfoam.' },
              { type: 'Latte', usage: 'Larger milk-forward beverage with gentle texture.' },
              { type: 'Alternative milk', usage: 'Requires brand-specific handling and lower tolerance for overheating.' }
            ],
            terminology: ['microfoam', 'stretching', 'texturing', 'incorporation', 'milk sweetness', 'scalding'],
            common_failures: ['Boiling milk', 'Large bubbles', 'Separating foam and liquid', 'Ignoring alternative milk behavior', 'Serving inconsistent cup sizes'],
            amateur: 'Makes foam volume without texture.',
            pro: 'Builds glossy integrated milk that tastes sweet and pours cleanly.',
            professional_standard: 'Milk beverages should be served at a comfortable hot temperature with glossy texture and no visible large bubbles.',
            real_service_context: 'Milk texture is often the first visible signal of coffee professionalism.',
            practical_execution: ['Purge wand', 'Stretch briefly', 'Texture with whirlpool', 'Stop before scalding', 'Wipe and purge wand'],
            guest_application: 'Texture makes coffee feel luxurious without increasing ingredient cost.',
            drill: 'Steam dairy and oat milk. Compare sweetness, texture, and pour control.',
            assessment_questions: ['Why does overheating milk hurt flavor?', 'What is microfoam?', 'How does flat white differ from latte?']
          })
        ]
      },
      {
        id: 'coffee-service-ops',
        title: 'Hospitality Coffee Service, Operations, And Profit',
        lessons: [
          academyLesson({
            ...coffeeLessonDefaults,
            id: 'coffee-006',
            title: 'Hospitality Coffee Service And Dessert Timing',
            objective: 'Deliver coffee with correct pacing, tray handling, guest language, and dessert attachment strategy.',
            technical_depth: 'Coffee service is a closing ritual. Timing must match dessert, conversation rhythm, table clearing, and payment intention. Coffee should not arrive before dessert unless requested, and it should not be delayed until the dessert is half finished. Tray handling, eye contact, saucer position, spoon placement, sugar options, and milk delivery all communicate discipline.',
            taxonomy: [
              { type: 'Dessert pairing', usage: 'Coffee offered with specific dessert language, not generic upselling.' },
              { type: 'Closing ritual', usage: 'Protects final memory and return intention.' },
              { type: 'Recovery coffee', usage: 'Can soften delay or service friction when used sincerely.' }
            ],
            terminology: ['dessert attachment', 'closing ritual', 'tray discipline', 'final impression', 'coffee recovery'],
            common_failures: ['Coffee arrives too early', 'No spoon or sugar check', 'Cold cup', 'No dessert suggestion', 'Staff treats coffee as low value'],
            amateur: 'Asks, "Coffee?" after clearing plates.',
            pro: 'Recommends a specific coffee and dessert combination at the right emotional moment.',
            professional_standard: 'Coffee service should be paced with dessert and checked within two minutes of delivery.',
            real_service_context: 'The last beverage often determines whether the evening feels complete.',
            practical_execution: ['Clear main plates', 'Offer specific dessert and coffee pairing', 'Confirm milk/sugar needs', 'Serve with quiet precision', 'Check back quickly'],
            guest_application: 'Guests feel hosted through the final chapter of the meal.',
            drill: 'Write three coffee offers: business lunch, romantic dinner, and hotel breakfast.',
            assessment_questions: ['Why is coffee a closing ritual?', 'When should coffee arrive with dessert?', 'What details belong on the tray?']
          }),
          academyLesson({
            ...coffeeLessonDefaults,
            id: 'coffee-007',
            title: 'Coffee Bar Workflow, Calibration, And Cleaning Doctrine',
            objective: 'Run a coffee station that stays fast, clean, calibrated, and service-ready under volume.',
            technical_depth: 'Coffee operations fail through small station habits: dirty steam wand, wet baskets, grinder retention, milk workflow, clogged knock box, uncalibrated grind, and unclear opening/closing standards. A premium coffee station has zones for grinding, brewing, milk, plating, cleaning, and dispatch. Calibration should happen before service and whenever shot behavior changes.',
            taxonomy: [
              { type: 'Opening calibration', usage: 'Recipe check, machine readiness, grinder setup, milk stock, cup temperature.' },
              { type: 'Rush workflow', usage: 'Batch tasks by drink type, protect cleanliness, avoid cross-contamination.' },
              { type: 'Closing doctrine', usage: 'Backflush, clean grinder area, purge milk residue, reset station.' }
            ],
            terminology: ['backflush', 'purge', 'grinder retention', 'calibration', 'workflow zone', 'station reset'],
            common_failures: ['No opening recipe', 'Dirty steam wand', 'No spare milk ready', 'Knock box overflow', 'Closing shortcuts'],
            amateur: 'Cleans only when the station looks visibly dirty.',
            pro: 'Resets continuously so the station never becomes the bottleneck.',
            professional_standard: 'Coffee station has written opening and closing checks plus mid-service calibration triggers.',
            real_service_context: 'Breakfast rush exposes coffee station design more than individual talent.',
            practical_execution: ['Open with recipe test', 'Set milk and cup par', 'Wipe and purge after every use', 'Backflush at close', 'Log drift'],
            guest_application: 'Clean station discipline makes coffee faster and more consistent.',
            drill: 'Map your coffee station into grind, brew, milk, dispatch, and clean zones. Remove one unnecessary movement.',
            assessment_questions: ['What causes grinder retention?', 'When should calibration happen?', 'Why is cleaning a quality issue?']
          }),
          academyLesson({
            ...coffeeLessonDefaults,
            id: 'coffee-008',
            title: 'Specialty Brewing: V60, Chemex, Batch, Cold Brew, And Nitro',
            objective: 'Understand specialty brew methods and select the right service format for guest expectation and operational reality.',
            technical_depth: 'Manual and batch brewing are not automatically premium. V60 offers clarity and ritual but requires skill and time. Chemex can deliver clean body for shared service. Batch brew is excellent when recipe-controlled and fresh. Cold brew is extraction over time with lower perceived acidity. Nitro adds texture and theatre but needs equipment discipline.',
            taxonomy: [
              { type: 'V60', usage: 'Individual clarity and ritual; slow for volume.' },
              { type: 'Chemex', usage: 'Elegant shared service, clean cup, strong visual cue.' },
              { type: 'Batch brew', usage: 'High consistency when recipe and holding time are controlled.' },
              { type: 'Cold brew', usage: 'Smooth chilled service, prep-dependent, shelf-life controlled.' },
              { type: 'Nitro', usage: 'Texture and visual impact, operationally equipment-dependent.' }
            ],
            terminology: ['bloom', 'bypass', 'drawdown', 'immersion', 'percolation', 'holding time', 'nitro texture'],
            common_failures: ['Manual brew during rush with no capacity', 'Old batch brew held too long', 'Cold brew without date labels', 'Overpromising specialty ritual'],
            amateur: 'Adds brew methods because they sound premium.',
            pro: 'Chooses brew methods that match volume, staffing, and guest value.',
            professional_standard: 'Every brew method has a recipe, service time expectation, and holding standard.',
            real_service_context: 'A hotel breakfast may need excellent batch brew more than slow manual theatre.',
            practical_execution: ['Choose method by service context', 'Use written recipe', 'Control freshness', 'Communicate wait time', 'Taste before service'],
            guest_application: 'Staff can recommend the right coffee format instead of defaulting to espresso.',
            drill: 'Create a brew method menu note with expected service time and flavor description.',
            assessment_questions: ['When is batch brew premium?', 'What is drawdown?', 'Why can V60 be risky in rush service?']
          }),
          academyLesson({
            ...coffeeLessonDefaults,
            id: 'coffee-009',
            title: 'Sensory Training, Defect Recognition, And Coffee Language',
            objective: 'Assess coffee through acidity, sweetness, bitterness, body, aroma, finish, and defect recognition.',
            technical_depth: 'Coffee sensory training should use calibrated language. Acidity is brightness and salivation, not sourness by default. Sweetness can appear as caramel, fruit, chocolate, or honey. Bitterness must be balanced, not harsh. Defects include burnt roast, moldy storage, rancid oils, sour fermentation, woody age, and dirty equipment taint.',
            taxonomy: [
              { type: 'Acidity', usage: 'Brightness and lift; can be citrus, apple, berry, or wine-like.' },
              { type: 'Body', usage: 'Weight and texture; light, medium, full, syrupy.' },
              { type: 'Defect', usage: 'Negative sensory marker from bean, roast, water, equipment, or storage.' }
            ],
            terminology: ['acidity', 'sweetness', 'body', 'finish', 'defect', 'taint', 'cupping', 'flavor wheel'],
            common_failures: ['Calling acidity sour without context', 'Missing dirty-machine flavor', 'Using vague language', 'Not tasting coffee during service'],
            amateur: 'Says coffee is good or bad.',
            pro: 'Describes structure and identifies likely cause of flaws.',
            professional_standard: 'Coffee staff should taste daily and know three approved guest descriptors for the house coffee.',
            real_service_context: 'Guests may not know the technical flaw, but they feel the lack of quality.',
            practical_execution: ['Smell dry grounds', 'Taste black coffee', 'Mark acidity/body/finish', 'Check for defects', 'Translate into guest language'],
            guest_application: 'Better language increases trust and supports premium coffee pricing.',
            drill: 'Taste a clean coffee beside one intentionally over-extracted. Identify bitterness, body, and finish.',
            assessment_questions: ['What is a defect?', 'How should staff describe acidity?', 'Why taste coffee daily?']
          }),
          academyLesson({
            ...coffeeLessonDefaults,
            id: 'coffee-010',
            title: 'Coffee Profitability, Upselling, And Waste Prevention',
            objective: 'Use coffee as a margin, dessert attachment, and guest-retention lever without cheap pressure.',
            technical_depth: 'Coffee is a high-perception, manageable-cost category when controlled. Profitability depends on dose discipline, milk waste, dessert attachment, premium format positioning, labor workflow, and equipment maintenance. The best coffee upsell is specific: a macchiato with chocolate dessert, filter coffee with breakfast, or iced coffee for afternoon lounge service.',
            taxonomy: [
              { type: 'Attachment sale', usage: 'Coffee paired to dessert or breakfast add-on.' },
              { type: 'Waste source', usage: 'Milk purge, mis-pulled shots, stale batch, over-prep cold brew.' },
              { type: 'Premium positioning', usage: 'Origin, ritual, texture, glassware, and service language.' }
            ],
            terminology: ['dose cost', 'milk waste', 'attachment rate', 'premium positioning', 'gross margin', 'throughput'],
            common_failures: ['No dessert pairing script', 'Overfilling milk pitchers', 'Discarding unlabeled cold brew', 'Poor workflow creating labor drag'],
            amateur: 'Views coffee as a small add-on.',
            pro: 'Uses coffee to strengthen profit and final guest memory.',
            professional_standard: 'Managers should track coffee waste, dessert attachment, and consistency failures weekly.',
            real_service_context: 'A 10 percent increase in dessert plus coffee attachment can materially improve dinner profitability.',
            practical_execution: ['Use specific pairing language', 'Control milk pour levels', 'Label prep', 'Track waste', 'Coach staff on coffee confidence'],
            guest_application: 'The guest receives a better ending while the venue protects margin.',
            drill: 'Write a coffee-and-dessert script for three different guest types.',
            assessment_questions: ['Where does coffee waste occur?', 'What is attachment selling?', 'Why does coffee affect return intention?']
          })
        ]
      }
    ]
  },
  {
    id: 'culinary-intelligence',
    title: 'Culinary Intelligence',
    dean: 'Executive Chef Liaison and FOH Food Educator',
    color: '#7d5a2f',
    category: 'Food Knowledge, Allergen Safety, And Menu Fluency',
    description: 'Front-of-house culinary education covering ingredient literacy, cooking methods, allergens, pairing logic, kitchen communication, and menu confidence.',
    badge: 'Food Intelligence',
    roles: ['employee', 'manager', 'admin'],
    totalLessons: 10,
    modules: [
      {
        id: 'culinary-menu-fluency',
        title: 'Menu Fluency, Ingredients, And Guest Explanation',
        lessons: [
          academyLesson({
            ...culinaryLessonDefaults,
            id: 'culinary-001',
            title: 'Ingredient Literacy And Sourcing Narrative',
            objective: 'Explain ingredients with origin, seasonality, value, and guest relevance instead of memorized descriptions.',
            technical_depth: 'Ingredient literacy means understanding what the ingredient is, where it comes from, why the chef chose it, how it tastes, and what value it creates for the guest. Sourcing narrative should be concise and truthful. Staff should avoid romantic claims they cannot verify and focus on flavor, season, producer quality, and preparation.',
            taxonomy: [
              { type: 'Origin', usage: 'Where the ingredient comes from and why that matters.' },
              { type: 'Seasonality', usage: 'Peak quality, limited availability, and menu timing.' },
              { type: 'Preparation value', usage: 'Why the kitchen method improves texture, aroma, or depth.' }
            ],
            terminology: ['terroir', 'seasonality', 'producer', 'heirloom', 'dry-aged', 'line-caught', 'foraged'],
            common_failures: ['Inventing sourcing claims', 'Using chef jargon with guests', 'Not knowing core allergens', 'Unable to explain premium price'],
            amateur: 'Repeats menu words without meaning.',
            pro: 'Explains why an ingredient matters in one confident sentence.',
            professional_standard: 'Staff should know one sourcing or preparation value point for every premium dish.',
            real_service_context: 'A guest asking why a dish is expensive is asking for value, not a lecture.',
            practical_execution: ['Identify hero ingredient', 'Learn source or season', 'Define flavor role', 'Practice one guest-safe sentence'],
            guest_application: 'Better explanations increase trust and willingness to order unfamiliar dishes.',
            drill: 'Choose three menu items and write one precise value sentence for each.',
            assessment_questions: ['What makes sourcing narrative credible?', 'Why avoid unverified claims?', 'How does ingredient literacy support sales?']
          }),
          academyLesson({
            ...culinaryLessonDefaults,
            id: 'culinary-002',
            title: 'Cooking Methods, Doneness, And Texture Language',
            objective: 'Describe cooking methods and doneness accurately so guests know what experience to expect.',
            technical_depth: 'Cooking methods change texture, moisture, browning, aroma, and perceived richness. Searing develops Maillard flavors; braising converts collagen and creates tenderness; poaching protects delicate texture; roasting concentrates flavor; grilling adds char and smoke. Doneness language must be precise and venue-specific, especially for meat, fish, eggs, and vegetables.',
            taxonomy: [
              { type: 'Sear', usage: 'High heat browning, crust, aroma, short cook.' },
              { type: 'Braise', usage: 'Low moist heat for connective tissue and deep sauce.' },
              { type: 'Roast', usage: 'Dry heat concentration and caramelization.' },
              { type: 'Poach', usage: 'Gentle liquid cooking for delicate proteins.' },
              { type: 'Grill', usage: 'Char, smoke, and high heat marks.' }
            ],
            terminology: ['Maillard reaction', 'caramelization', 'confit', 'sous vide', 'braise', 'resting', 'carryover'],
            common_failures: ['Confusing braised with roasted', 'Promising impossible doneness', 'Not warning about raw or rare preparations', 'Using vague texture words'],
            amateur: 'Says a dish is cooked well.',
            pro: 'Explains method, texture, and expected richness clearly.',
            professional_standard: 'All staff should know cooking method and doneness standard for every protein dish.',
            real_service_context: 'A guest who dislikes rare fish needs guidance before ordering, not recovery after delivery.',
            practical_execution: ['Identify method', 'Name expected texture', 'Clarify doneness', 'Mention sauce or garnish role'],
            guest_application: 'Clear expectation prevents returns and increases confidence.',
            drill: 'Explain seared, braised, and poached dishes to three guest archetypes.',
            assessment_questions: ['What does searing add?', 'Why does braising tenderize?', 'What is carryover cooking?']
          }),
          academyLesson({
            ...culinaryLessonDefaults,
            id: 'culinary-003',
            title: 'Allergens, Dietary Restrictions, And Seriousness Protocol',
            objective: 'Handle allergies and dietary restrictions with accuracy, calm language, and zero improvisation.',
            technical_depth: 'Allergen handling is a safety system. Staff must distinguish allergy, intolerance, preference, religious restriction, and diet choice. The server should document the restriction, confirm severity, communicate to kitchen using approved terms, avoid guessing, and never promise safety without kitchen confirmation. Cross-contact risk must be treated seriously.',
            taxonomy: [
              { type: 'Allergy', usage: 'Immune response risk; requires strict protocol.' },
              { type: 'Intolerance', usage: 'Digestive or sensitivity issue; still requires care.' },
              { type: 'Preference', usage: 'Guest choice; respect without medical claim.' },
              { type: 'Religious restriction', usage: 'Requires ingredient and preparation awareness.' }
            ],
            terminology: ['cross-contact', 'allergen matrix', 'intolerance', 'trace risk', 'may contain', 'severity'],
            common_failures: ['Guessing ingredients', 'Saying "should be fine"', 'Not documenting allergy', 'Treating allergies as inconvenience', 'Forgetting garnish allergens'],
            amateur: 'Reassures without verifying.',
            pro: 'Confirms, documents, checks, and communicates clearly.',
            professional_standard: 'No allergy answer is given without kitchen verification unless documented in an approved allergen matrix.',
            real_service_context: 'A sesame garnish, nut oil, fish sauce, or dairy foam can create serious risk.',
            practical_execution: ['Ask severity', 'Document exactly', 'Check matrix/kitchen', 'Confirm approved options', 'Serve with confidence'],
            guest_application: 'Guests feel safe when staff are precise, not casual.',
            drill: 'Handle a guest with severe nut allergy ordering a dish with unknown sauce components.',
            assessment_questions: ['What is cross-contact?', 'Why avoid "should be fine"?', 'Who confirms allergy safety?']
          }),
          academyLesson({
            ...culinaryLessonDefaults,
            id: 'culinary-004',
            title: 'Flavor Structure: Fat, Acid, Salt, Heat, Texture, And Umami',
            objective: 'Read dish balance and explain why flavors work together.',
            technical_depth: 'Dish balance comes from structural elements. Fat carries richness and aroma; acid cuts richness and creates lift; salt amplifies flavor; heat adds energy; texture creates contrast; umami provides depth and savoriness. Staff who understand structure can recommend wine, cocktails, sides, and modifications more intelligently.',
            taxonomy: [
              { type: 'Fat', usage: 'Richness, coating texture, aroma carrier.' },
              { type: 'Acid', usage: 'Brightness, freshness, balance against fat.' },
              { type: 'Umami', usage: 'Depth from mushrooms, aged cheese, tomato, soy, meat, fermentation.' },
              { type: 'Texture', usage: 'Crunch, cream, chew, crispness, tenderness.' }
            ],
            terminology: ['umami', 'balance', 'contrast', 'richness', 'brightness', 'finish', 'texture contrast'],
            common_failures: ['Describing only ingredients', 'Missing richness level', 'Poor pairing with acid or tannin', 'Not warning about spice heat'],
            amateur: 'Says a dish is tasty.',
            pro: 'Explains the dish structure and what it pairs with.',
            professional_standard: 'Staff should identify the dominant structural element in each signature dish.',
            real_service_context: 'A rich dish often needs high-acid wine, bitter aperitif, or crisp side recommendation.',
            practical_execution: ['Identify richness', 'Identify acid or freshness', 'Name texture contrast', 'Suggest pairing or side'],
            guest_application: 'Guests get better recommendations because staff understand why the dish works.',
            drill: 'Pick one dish and label fat, acid, salt, texture, and umami components.',
            assessment_questions: ['What does acid do in rich dishes?', 'Why does texture matter?', 'What are common umami sources?']
          }),
          academyLesson({
            ...culinaryLessonDefaults,
            id: 'culinary-005',
            title: 'Menu Fluency And Confident Recommendation',
            objective: 'Guide guests through menu choices using preference questions, dish structure, and service context.',
            technical_depth: 'Menu fluency is the ability to match guest desire with the right dish. The server should ask preference questions about appetite, richness, dietary limits, spice tolerance, and mood. Strong recommendation language is specific and confident: "If you want something lighter, I would steer you here." This avoids both pressure and indecision.',
            taxonomy: [
              { type: 'Preference question', usage: 'Light or rich, classic or adventurous, seafood or meat, quick or leisurely.' },
              { type: 'Confident recommendation', usage: 'One clear suggestion with reason.' },
              { type: 'Disqualification', usage: 'Politely steering away from a poor fit.' }
            ],
            terminology: ['menu fluency', 'preference mapping', 'disqualification', 'recommendation ladder', 'guest intent'],
            common_failures: ['Listing everything', 'Recommending personal favorite only', 'No reason attached', 'Failing to ask dietary needs'],
            amateur: 'Everything is good.',
            pro: 'Narrows the choice and gives the guest confidence.',
            professional_standard: 'A server should be able to recommend three dishes for three different guest moods.',
            real_service_context: 'A business lunch guest and a celebration table need different menu guidance.',
            practical_execution: ['Ask two preference questions', 'Name one best fit', 'Explain why', 'Check comfort with richness or spice'],
            guest_application: 'Guests feel guided rather than sold to.',
            drill: 'Create recommendations for light, indulgent, adventurous, and safe guest profiles.',
            assessment_questions: ['Why avoid saying everything is good?', 'What is preference mapping?', 'How do you steer away politely?']
          })
        ]
      },
      {
        id: 'culinary-operations',
        title: 'Kitchen Communication, Pairing, Waste, And Recovery',
        lessons: [
          academyLesson({
            ...culinaryLessonDefaults,
            id: 'culinary-006',
            title: 'FOH And BOH Communication Under Pressure',
            objective: 'Communicate with the kitchen clearly, respectfully, and quickly during live service.',
            technical_depth: 'Kitchen communication must be precise and low-drama. The floor should bring facts: table, seat, dish, issue, timing, allergy status, and desired resolution. Blame language slows service and damages trust. A strong FOH/BOH protocol separates guest emotion from kitchen information so the team can act.',
            taxonomy: [
              { type: 'Clarification', usage: 'Question before order is fired.' },
              { type: 'Correction', usage: 'Mistake detected before delivery.' },
              { type: 'Recovery', usage: 'Guest has received incorrect or failed dish.' },
              { type: 'Escalation', usage: 'Manager or chef decision required.' }
            ],
            terminology: ['fire', 'hold', 'all day', 'runner', 'pass', 'redo', 'comp', 'expo'],
            common_failures: ['Blaming the kitchen to guests', 'Bringing vague complaints', 'Interrupting the pass at the wrong time', 'No table/seat detail'],
            amateur: 'Runs to the kitchen emotionally.',
            pro: 'Delivers exact operational information and gets a decision.',
            professional_standard: 'Food issues are communicated with table, dish, issue, urgency, and requested action.',
            real_service_context: 'During rush, unclear communication creates second failures.',
            practical_execution: ['Gather facts', 'Use table and seat number', 'State issue', 'Ask for action', 'Return to guest with time estimate'],
            guest_application: 'Guests experience faster and calmer recovery.',
            drill: 'Translate three emotional guest complaints into kitchen-ready language.',
            assessment_questions: ['What information does BOH need?', 'Why avoid blame language?', 'When should a manager intervene?']
          }),
          academyLesson({
            ...culinaryLessonDefaults,
            id: 'culinary-007',
            title: 'Food Pairing Logic For Wine, Cocktails, And Coffee',
            objective: 'Use structure-based pairing logic to recommend beverages with confidence.',
            technical_depth: 'Pairing should start with structure before flavor. Acid cuts fat, sweetness calms spice, tannin binds with protein, bitterness can sharpen richness, carbonation refreshes the palate, and coffee bitterness can either complement chocolate or clash with delicate citrus desserts. Staff should avoid memorized pairings without reason.',
            taxonomy: [
              { type: 'Acid with fat', usage: 'High-acid wine or cocktail brightens rich dishes.' },
              { type: 'Sweet with spice', usage: 'Residual sugar or fruit calms heat.' },
              { type: 'Tannin with protein', usage: 'Red wine structure works with meat richness.' },
              { type: 'Carbonation', usage: 'Refreshes fried, salty, or creamy textures.' }
            ],
            terminology: ['contrast', 'complement', 'tannin binding', 'palate reset', 'weight matching', 'residual sugar'],
            common_failures: ['Pairing by color only', 'Ignoring sauce', 'Forgetting spice heat', 'Recommending heavy beverage with delicate dish'],
            amateur: 'Pairs red with meat and white with fish only.',
            pro: 'Pairs by weight, structure, sauce, and guest preference.',
            professional_standard: 'Every premium dish should have one wine, one cocktail, and one non-alcoholic pairing option.',
            real_service_context: 'Pairing confidence increases beverage attachment and guest trust.',
            practical_execution: ['Assess dish weight', 'Identify sauce and dominant structure', 'Ask guest preference', 'Recommend with reason'],
            guest_application: 'Guests discover better combinations without feeling pressured.',
            drill: 'Build pairings for spicy fish, rich beef, mushroom pasta, and chocolate dessert.',
            assessment_questions: ['Why does acid help rich food?', 'What does tannin bind with?', 'Why consider sauce first?']
          }),
          academyLesson({
            ...culinaryLessonDefaults,
            id: 'culinary-008',
            title: 'Waste Intelligence, Prep Awareness, And Menu Profit',
            objective: 'Recognize how FOH behavior affects kitchen waste, prep load, and profitability.',
            technical_depth: 'Waste is not only a kitchen problem. FOH creates waste through inaccurate orders, missed allergy details, poor upselling timing, late modifications, duplicate fires, and failure to communicate guest feedback. Menu profit depends on correct order flow, portion expectation, prep forecasting, and responsible handling of specials.',
            taxonomy: [
              { type: 'Order waste', usage: 'Incorrect dish, wrong modifier, missed allergy.' },
              { type: 'Prep waste', usage: 'Over-prep from poor forecasting or no communication.' },
              { type: 'Plate waste', usage: 'Guest dislikes, portion mismatch, poor explanation.' },
              { type: 'Specials risk', usage: 'Perishable premium items need confident selling.' }
            ],
            terminology: ['yield', 'trim', 'FIFO', 'spoilage', 'forecasting', 'portion control', 'plate waste'],
            common_failures: ['No feedback loop to kitchen', 'Poor specials knowledge', 'Late modifiers', 'Duplicate orders', 'Ignoring plate waste patterns'],
            amateur: 'Thinks waste happens behind the kitchen door.',
            pro: 'Understands FOH choices affect COGS and quality.',
            professional_standard: 'Managers should review waste patterns with both FOH and BOH weekly.',
            real_service_context: 'A poorly explained unfamiliar dish may be returned even if perfectly cooked.',
            practical_execution: ['Confirm modifiers', 'Know specials quantity', 'Report plate waste', 'Sell perishables responsibly', 'Track repeated issues'],
            guest_application: 'Better explanations reduce disappointed orders and food waste.',
            drill: 'Identify three ways servers can reduce waste this week.',
            assessment_questions: ['How can FOH cause waste?', 'What is FIFO?', 'Why report plate waste?']
          }),
          academyLesson({
            ...culinaryLessonDefaults,
            id: 'culinary-009',
            title: 'Special Requests, Substitutions, And Kitchen Feasibility',
            objective: 'Handle modifications with hospitality while protecting kitchen flow and product integrity.',
            technical_depth: 'Not every request is operationally equal. Simple omissions, allergen substitutions, religious restrictions, preference changes, and full dish redesigns require different handling. Staff should protect the guest while also protecting kitchen feasibility and dish quality. Premium language makes boundaries feel professional, not defensive.',
            taxonomy: [
              { type: 'Simple omission', usage: 'Remove garnish or component when feasible.' },
              { type: 'Allergen substitution', usage: 'Safety-first, kitchen-confirmed alternative.' },
              { type: 'Preference modification', usage: 'Possible if it does not damage dish or service speed.' },
              { type: 'Dish redesign', usage: 'Manager/chef approval may be required.' }
            ],
            terminology: ['modifier', 'substitution', 'cross-contact', 'dish integrity', 'feasibility', 'service impact'],
            common_failures: ['Promising before checking', 'Saying no too bluntly', 'Not explaining alternatives', 'Kitchen surprise modifiers during rush'],
            amateur: 'Either says yes to everything or no to everything.',
            pro: 'Finds the best possible option within operational reality.',
            professional_standard: 'All complex substitutions are confirmed before being promised.',
            real_service_context: 'A guest requesting vegan, gluten-free, and nut-free needs careful feasibility checking.',
            practical_execution: ['Clarify reason', 'Check severity', 'Confirm with kitchen', 'Offer best alternative', 'Document clearly'],
            guest_application: 'Guests feel respected even when the original request is not possible.',
            drill: 'Rewrite three "we cannot do that" responses into premium alternatives.',
            assessment_questions: ['Why check before promising?', 'What is dish integrity?', 'How do you make a boundary hospitable?']
          }),
          academyLesson({
            ...culinaryLessonDefaults,
            id: 'culinary-010',
            title: 'Culinary Recovery And Food Quality Feedback',
            objective: 'Recover food quality failures without blame and convert feedback into operational learning.',
            technical_depth: 'Food recovery requires acknowledging the guest, identifying the exact defect, separating preference from execution failure, and giving the kitchen actionable information. Quality feedback should specify temperature, doneness, seasoning, texture, timing, missing component, or expectation mismatch. Recovery is complete only after follow-up.',
            taxonomy: [
              { type: 'Execution failure', usage: 'Wrong temperature, doneness, missing component, over/under seasoning.' },
              { type: 'Expectation mismatch', usage: 'Guest did not understand style, spice, richness, or texture.' },
              { type: 'Preference issue', usage: 'Dish is correct but not guest preference.' },
              { type: 'Safety issue', usage: 'Allergy, foreign object, contamination concern.' }
            ],
            terminology: ['redo', 'fire time', 'quality defect', 'preference mismatch', 'follow-up', 'service recovery'],
            common_failures: ['Arguing taste', 'Not following up', 'Comping before fixing', 'No kitchen detail', 'Blaming the guest or chef'],
            amateur: 'Apologizes and disappears.',
            pro: 'Owns the issue, fixes it, follows up, and logs the learning.',
            professional_standard: 'Every returned dish should be logged with category and resolution.',
            real_service_context: 'A cold dish and a disliked dish require different recovery actions.',
            practical_execution: ['Listen fully', 'Clarify defect', 'Own the experience', 'Set action and timing', 'Follow up', 'Log pattern'],
            guest_application: 'Guests forgive mistakes when recovery is specific and calm.',
            drill: 'Recover a steak cooked wrong, a dish too spicy, and a delayed dessert.',
            assessment_questions: ['Why distinguish defect from preference?', 'When should manager step in?', 'What makes food feedback useful?']
          })
        ]
      }
    ]
  },
  {
    id: 'ethics-privacy',
    title: 'Hospitality Ethics & Privacy',
    dean: 'Guest Trust, Safety, and Responsible Service Lead',
    color: '#4a4658',
    category: 'Trust, Privacy, Safety, And Responsible Care',
    description: 'Ethical hospitality doctrine for responsible alcohol service, allergy seriousness, guest privacy, dignity-preserving recovery, and confidential service.',
    badge: 'Trust Doctrine',
    roles: ['employee', 'manager', 'owner', 'admin'],
    totalLessons: 10,
    modules: [
      {
        id: 'ethics-guest-duty',
        title: 'Guest Dignity, Safety, And Responsible Care',
        lessons: [
          academyLesson({
            ...ethicsLessonDefaults,
            id: 'ethics-001',
            title: 'Guest Dignity And The Quiet Guardian Standard',
            objective: 'Protect guest dignity through privacy, restraint, discretion, and calm professional conduct.',
            technical_depth: 'Luxury service is not only what staff do for guests; it is what staff protect guests from. Dignity means guests are not embarrassed, exposed, discussed, rushed, or corrected publicly. The quiet guardian standard asks staff to notice vulnerability and solve discreetly: spilled wine, payment issues, intoxication, emotional distress, celebrity visibility, or family conflict.',
            taxonomy: [
              { type: 'Visible dignity', usage: 'Tone, posture, privacy, and public correction avoidance.' },
              { type: 'Invisible protection', usage: 'Preventing embarrassment before the guest notices.' },
              { type: 'Confidential conduct', usage: 'No gossip, photos, or guest speculation.' }
            ],
            terminology: ['guest dignity', 'discretion', 'confidentiality', 'quiet guardian', 'public embarrassment', 'duty of care'],
            common_failures: ['Discussing guests in public areas', 'Correcting loudly', 'Sharing celebrity presence', 'Making payment issues visible'],
            amateur: 'Solves the task without considering embarrassment.',
            pro: 'Solves the task while protecting the guest image.',
            professional_standard: 'Sensitive guest matters are handled privately, quietly, and only with staff who need to know.',
            real_service_context: 'A declined card, stain, or intoxication moment can be handled with dignity or become a lasting humiliation.',
            practical_execution: ['Lower voice', 'Move private when needed', 'Use neutral language', 'Limit audience', 'Document if required'],
            guest_application: 'Guests trust venues that protect their dignity when things go wrong.',
            drill: 'Resolve a declined-card situation without anyone at the table noticing.',
            assessment_questions: ['What is invisible protection?', 'Why avoid public correction?', 'Who should know sensitive guest details?']
          }),
          academyLesson({
            ...ethicsLessonDefaults,
            id: 'ethics-002',
            title: 'Responsible Alcohol Service And Intoxication Signals',
            objective: 'Identify intoxication risk and respond with dignity, legality, and guest safety.',
            technical_depth: 'Responsible alcohol service requires observing pace, coordination, speech, mood change, decision quality, and group dynamics. Staff should slow service before refusal becomes necessary, offer water and food, involve a manager early, and arrange safe transport when appropriate. The goal is not punishment; it is duty of care.',
            taxonomy: [
              { type: 'Early risk', usage: 'Fast drinking, loudness, repeated ordering, reduced attention.' },
              { type: 'Visible intoxication', usage: 'Slurred speech, poor coordination, emotional volatility.' },
              { type: 'Intervention', usage: 'Slow, redirect, stop service, protect transport.' }
            ],
            terminology: ['RSA', 'duty of care', 'cut-off', 'pacing', 'safe transport', 'de-escalation'],
            common_failures: ['Waiting too long', 'Refusing publicly', 'Continuing service because guest is high-spend', 'Not alerting manager'],
            amateur: 'Either ignores the risk or confronts harshly.',
            pro: 'Intervenes early, privately, and with care.',
            professional_standard: 'Managers are notified before alcohol refusal whenever practical.',
            real_service_context: 'A high-value table can still create legal, safety, and brand risk.',
            practical_execution: ['Watch pace', 'Offer food/water', 'Inform manager', 'Use private language', 'Arrange transport'],
            guest_application: 'Responsible service protects the guest, the team, and the venue.',
            drill: 'Practice a private cut-off conversation with a cooperative guest and a resistant guest.',
            assessment_questions: ['Name three intoxication signals.', 'Why intervene early?', 'How do you preserve dignity?']
          }),
          academyLesson({
            ...ethicsLessonDefaults,
            id: 'ethics-003',
            title: 'Allergy Seriousness As Ethical Duty',
            objective: 'Treat allergies as a safety obligation, not a preference or inconvenience.',
            technical_depth: 'Allergy seriousness is an ethical issue because casual language can create physical harm. Staff must never guess, minimize, or improvise. The correct behavior is verification, documentation, kitchen confirmation, and clear communication back to the guest. Allergy confidence means precision, not reassurance.',
            taxonomy: [
              { type: 'Medical risk', usage: 'Potential serious reaction, strict process required.' },
              { type: 'Cross-contact', usage: 'Risk from shared surfaces, fryer, garnish, utensils, or prep.' },
              { type: 'Verified answer', usage: 'Only after approved source or kitchen confirmation.' }
            ],
            terminology: ['anaphylaxis', 'cross-contact', 'allergen matrix', 'trace', 'severity', 'verified answer'],
            common_failures: ['Saying "no problem"', 'Assuming garnish is safe', 'No written note', 'Treating allergy as dietary preference'],
            amateur: 'Wants to make the guest feel easy quickly.',
            pro: 'Makes the guest feel safe through process.',
            professional_standard: 'All severe allergies require manager or kitchen confirmation before order finalization.',
            real_service_context: 'A sauce thickened with butter, flour, nuts, or sesame can be invisible to the guest.',
            practical_execution: ['Ask severity', 'Document allergy', 'Verify with kitchen', 'Confirm safe options', 'Mark order clearly'],
            guest_application: 'Guests trust disciplined caution more than casual reassurance.',
            drill: 'Handle a guest with severe sesame allergy during rush service.',
            assessment_questions: ['Why is allergy handling ethical?', 'What is cross-contact?', 'What language should be avoided?']
          }),
          academyLesson({
            ...ethicsLessonDefaults,
            id: 'ethics-004',
            title: 'VIP Privacy, Guest Memory, And Confidential Notes',
            objective: 'Use guest memory to personalize service without violating privacy or creating discomfort.',
            technical_depth: 'Preference memory is powerful but sensitive. Staff should record service-relevant preferences: seating, allergies, pacing, wine style, celebration, and prior recovery. They should not record gossip, appearance judgments, private conversations, or speculative personal details. VIP recognition should be discreet, not theatrical.',
            taxonomy: [
              { type: 'Service preference', usage: 'Useful, respectful, and operationally relevant.' },
              { type: 'Sensitive information', usage: 'Requires strict limitation and professional handling.' },
              { type: 'Discreet recognition', usage: 'Personalized without announcing status.' }
            ],
            terminology: ['guest profile', 'preference memory', 'confidential note', 'VIP recognition', 'need-to-know'],
            common_failures: ['Over-familiar greeting', 'Recording gossip', 'Discussing VIPs in staff areas', 'Using guest data for jokes'],
            amateur: 'Uses memory to impress visibly.',
            pro: 'Uses memory to make service feel effortless.',
            professional_standard: 'Guest notes must be factual, service-relevant, and respectful.',
            real_service_context: 'A returning guest may appreciate their preferred table remembered, but not a public announcement.',
            practical_execution: ['Record relevant facts', 'Avoid speculation', 'Share only with team members who need it', 'Use recognition discreetly'],
            guest_application: 'Guests feel known without feeling watched.',
            drill: 'Rewrite five inappropriate guest notes into acceptable service notes.',
            assessment_questions: ['What belongs in guest notes?', 'What is need-to-know?', 'Why can recognition become intrusive?']
          }),
          academyLesson({
            ...ethicsLessonDefaults,
            id: 'ethics-005',
            title: 'Dignity-Preserving De-Escalation',
            objective: 'Respond to anger, embarrassment, or conflict without escalating status threat.',
            technical_depth: 'Conflict often escalates when guests feel unheard, corrected, or publicly exposed. De-escalation starts with voice control, body position, listening without interruption, naming the issue calmly, and offering a specific next step. Staff should not match intensity. Private space and manager support are tools, not signs of weakness.',
            taxonomy: [
              { type: 'Status threat', usage: 'Guest feels embarrassed, dismissed, or powerless.' },
              { type: 'Active listening', usage: 'Letting the guest finish before solving.' },
              { type: 'Specific next step', usage: 'Clear action and timing to restore control.' }
            ],
            terminology: ['de-escalation', 'status threat', 'active listening', 'private recovery', 'calm authority'],
            common_failures: ['Interrupting', 'Correcting facts first', 'Saying calm down', 'Standing over seated guest', 'No next step'],
            amateur: 'Tries to win the argument.',
            pro: 'Protects the relationship and controls the next action.',
            professional_standard: 'Escalated complaints should be moved from public theatre to private recovery when possible.',
            real_service_context: 'A guest angry about delay may really be reacting to embarrassment in front of companions.',
            practical_execution: ['Lower voice', 'Listen fully', 'Acknowledge impact', 'Offer action', 'Follow up'],
            guest_application: 'Guests feel respected even in disagreement.',
            drill: 'De-escalate a guest who says, "You ruined our anniversary."',
            assessment_questions: ['What is status threat?', 'Why avoid "calm down"?', 'What makes a next step credible?']
          })
        ]
      },
      {
        id: 'ethics-systems',
        title: 'Privacy, Boundaries, Inclusion, And Documentation',
        lessons: [
          academyLesson({
            ...ethicsLessonDefaults,
            id: 'ethics-006',
            title: 'Professional Boundaries And Staff Conduct',
            objective: 'Maintain warmth without inappropriate familiarity, bias, gossip, or personal boundary violations.',
            technical_depth: 'Hospitality warmth must remain professional. Staff should not flirt, pressure, share personal issues, comment on bodies, consume guest attention, or use guest access for personal advantage. Boundaries protect staff and guests. The higher the luxury level, the more restraint matters.',
            taxonomy: [
              { type: 'Professional warmth', usage: 'Kind, attentive, and restrained.' },
              { type: 'Boundary risk', usage: 'Flirting, oversharing, gossip, favoritism, or pressure.' },
              { type: 'Manager intervention', usage: 'Early correction before conduct becomes incident.' }
            ],
            terminology: ['professional boundary', 'bias', 'favoritism', 'restraint', 'conduct standard'],
            common_failures: ['Over-familiar jokes', 'Commenting on appearance', 'Ignoring staff gossip', 'Personal phone use around guests'],
            amateur: 'Confuses friendliness with intimacy.',
            pro: 'Creates warmth while preserving professionalism.',
            professional_standard: 'Staff conduct should never make guests or colleagues feel observed, judged, or targeted.',
            real_service_context: 'A regular guest relationship can become inappropriate if boundaries are not maintained.',
            practical_execution: ['Use neutral warmth', 'Avoid personal comments', 'Escalate uncomfortable behavior', 'Document repeated concerns'],
            guest_application: 'Guests experience safety and respect across every interaction.',
            drill: 'Convert five overly familiar phrases into professional alternatives.',
            assessment_questions: ['What is professional warmth?', 'Why are boundaries protective?', 'When should conduct be escalated?']
          }),
          academyLesson({
            ...ethicsLessonDefaults,
            id: 'ethics-007',
            title: 'Data Privacy And Preference Memory Ethics',
            objective: 'Store and use guest information responsibly inside a hospitality operating system.',
            technical_depth: 'Digital hospitality memory can improve service, but it must be accurate, limited, and respectful. Teams should record what helps service and avoid sensitive speculation. Access should follow role need, and notes should be updated or removed when outdated. Data privacy is part of trust.',
            taxonomy: [
              { type: 'Operational memory', usage: 'Preference, allergy, service recovery, seating, pacing.' },
              { type: 'Sensitive data', usage: 'Payment, identity, private life, health details.' },
              { type: 'Retention discipline', usage: 'Keep useful data current and remove harmful noise.' }
            ],
            terminology: ['data minimization', 'consent', 'retention', 'access control', 'service memory', 'privacy risk'],
            common_failures: ['Writing subjective notes', 'Too many staff seeing sensitive details', 'Keeping outdated information', 'Using memory in creepy ways'],
            amateur: 'Records everything.',
            pro: 'Records only what improves service and protects trust.',
            professional_standard: 'Guest notes should be factual, service-relevant, and accessible only to appropriate roles.',
            real_service_context: 'A note saying "prefers quiet table" is useful; a note about private conversation is not.',
            practical_execution: ['Write factual notes', 'Avoid speculation', 'Limit sensitive detail', 'Review stale records'],
            guest_application: 'Personalization feels elegant when it is subtle and relevant.',
            drill: 'Audit a sample guest profile and remove inappropriate notes.',
            assessment_questions: ['What is data minimization?', 'What makes a note inappropriate?', 'Why can personalization feel intrusive?']
          }),
          academyLesson({
            ...ethicsLessonDefaults,
            id: 'ethics-008',
            title: 'Inclusive Service And Cultural Sensitivity',
            objective: 'Serve diverse guests with respect, curiosity, and consistency without assumptions.',
            technical_depth: 'Inclusive service means avoiding assumptions about gender, family structure, wealth, language, dietary practice, culture, disability, or spending intent. Staff should ask neutral questions, use respectful forms of address, and adapt without making the guest explain themselves repeatedly.',
            taxonomy: [
              { type: 'Neutral language', usage: 'Avoid assumptions about relationships, gender, or payment.' },
              { type: 'Access awareness', usage: 'Physical, sensory, language, and mobility needs.' },
              { type: 'Cultural respect', usage: 'Diet, alcohol, greetings, privacy, and pacing differences.' }
            ],
            terminology: ['inclusive service', 'assumption risk', 'accessibility', 'cultural sensitivity', 'neutral phrasing'],
            common_failures: ['Assuming host pays', 'Gendered language errors', 'Judging spend by appearance', 'Making dietary practices awkward'],
            amateur: 'Serves from assumptions.',
            pro: 'Serves from observation and respectful questions.',
            professional_standard: 'Every guest receives the same professional baseline regardless of appearance, spend, or familiarity.',
            real_service_context: 'A guest avoiding alcohol, pork, gluten, or loud seating should not be made to feel difficult.',
            practical_execution: ['Use neutral address', 'Ask preference privately', 'Offer alternatives naturally', 'Respect pace and privacy'],
            guest_application: 'Guests feel belonging without needing to request basic respect.',
            drill: 'Rewrite common assumption-based phrases into neutral hospitality language.',
            assessment_questions: ['What is assumption risk?', 'Why use neutral language?', 'How can inclusion affect loyalty?']
          }),
          academyLesson({
            ...ethicsLessonDefaults,
            id: 'ethics-009',
            title: 'Incident Documentation And Ethical Escalation',
            objective: 'Document issues accurately and escalate the right concerns without drama or concealment.',
            technical_depth: 'Documentation protects guests, staff, and the business. Ethical logs should separate fact from opinion, include time, place, people involved, action taken, manager notified, and follow-up needed. Staff should escalate safety, discrimination, harassment, serious allergy, intoxication, payment, and privacy issues early.',
            taxonomy: [
              { type: 'Fact', usage: 'Observed event, exact words when relevant, time, action.' },
              { type: 'Opinion', usage: 'Avoid unless clearly marked as manager assessment.' },
              { type: 'Escalation trigger', usage: 'Safety, legal, privacy, repeated behavior, unresolved risk.' }
            ],
            terminology: ['incident log', 'escalation trigger', 'fact pattern', 'follow-up', 'risk note', 'manager sign-off'],
            common_failures: ['Emotional writing', 'No time stamp', 'No action recorded', 'Hiding mistakes', 'No follow-up owner'],
            amateur: 'Writes a complaint story.',
            pro: 'Creates a factual record that helps the operation improve.',
            professional_standard: 'Critical incidents are documented the same day with action and owner.',
            real_service_context: 'A repeated harassment issue becomes dangerous if each shift treats it as isolated.',
            practical_execution: ['Record facts', 'Name action taken', 'Notify manager', 'Assign follow-up', 'Review patterns'],
            guest_application: 'Professional documentation prevents repeated failures.',
            drill: 'Rewrite an emotional incident note into a factual manager log.',
            assessment_questions: ['What is an escalation trigger?', 'Why separate fact from opinion?', 'What belongs in an incident log?']
          }),
          academyLesson({
            ...ethicsLessonDefaults,
            id: 'ethics-010',
            title: 'Ethical Service Recovery And Compensation Discipline',
            objective: 'Use recovery and compensation fairly, consistently, and without training guests or staff into bad patterns.',
            technical_depth: 'Compensation is a tool, not the first recovery move. Ethical recovery acknowledges impact, fixes what can be fixed, and uses compensation proportionate to failure. Inconsistent compensation creates unfairness, guest expectation problems, and margin leakage. Staff should understand when to apologize, remake, replace, comp, discount, or escalate.',
            taxonomy: [
              { type: 'Trust repair', usage: 'Acknowledge and fix before money.' },
              { type: 'Proportionate compensation', usage: 'Match the value to the service failure.' },
              { type: 'Pattern protection', usage: 'Track repeated comping and abuse risk.' }
            ],
            terminology: ['service recovery', 'compensation', 'proportionality', 'abuse risk', 'margin leakage', 'manager approval'],
            common_failures: ['Comping before listening', 'Overcompensating small issues', 'No manager pattern review', 'Different treatment by guest status'],
            amateur: 'Uses money to end discomfort.',
            pro: 'Repairs trust first and applies fair compensation only when appropriate.',
            professional_standard: 'Compensation should be logged with reason, value, and recovery attempt.',
            real_service_context: 'A delayed dish may need communication and a gesture; a severe allergy failure requires escalation.',
            practical_execution: ['Acknowledge', 'Fix', 'Follow up', 'Assess proportion', 'Log compensation'],
            guest_application: 'Guests experience fairness and care, not panic discounting.',
            drill: 'Choose recovery actions for delay, wrong dish, rude tone, and severe allergy risk.',
            assessment_questions: ['Why is compensation not first?', 'What is proportionality?', 'Why log comps?']
          })
        ]
      }
    ]
  },
  {
    id: 'train-the-trainer',
    title: 'Train-the-Trainer',
    dean: 'Hospitality Education Architect and Culture Coach',
    color: '#5a6544',
    category: 'Coaching, Certification, And Culture Transfer',
    description: 'Manager and trainer education for selecting, onboarding, coaching, assessing, and certifying hospitality talent without turning training into paperwork.',
    badge: 'Trainer System',
    roles: ['manager', 'admin'],
    totalLessons: 10,
    modules: [
      {
        id: 'trainer-culture-transfer',
        title: 'Selection, Orientation, Shadowing, And Microlearning',
        lessons: [
          academyLesson({
            ...trainerLessonDefaults,
            id: 'trainer-001',
            title: 'Quality Selection And Culture Fit',
            objective: 'Identify candidates and internal trainers who can carry hospitality standards, not only perform tasks.',
            technical_depth: 'Luxury hospitality training begins before the first lesson. Selection should evaluate warmth, attention, resilience, humility, teamwork, curiosity, and emotional control. Technical skills can be trained faster than service temperament. A trainer must model behavior under pressure because staff copy what leaders tolerate.',
            taxonomy: [
              { type: 'Service temperament', usage: 'Warmth, composure, empathy, and attention.' },
              { type: 'Trainability', usage: 'Curiosity, humility, practice response, feedback acceptance.' },
              { type: 'Culture carrier', usage: 'Person who models standards when managers are absent.' }
            ],
            terminology: ['culture fit', 'trainability', 'service temperament', 'selection signal', 'culture carrier'],
            common_failures: ['Choosing trainers by seniority only', 'Ignoring attitude if skill is high', 'Hiring for availability only', 'No behavior-based questions'],
            amateur: 'Selects the fastest worker as trainer.',
            pro: 'Selects people who can transfer standards under pressure.',
            professional_standard: 'Trainers should be assessed on behavior, coaching ability, and consistency, not tenure alone.',
            real_service_context: 'A technically strong but cynical trainer spreads cynicism faster than skill.',
            practical_execution: ['Define selection signals', 'Observe pressure behavior', 'Ask behavior questions', 'Review feedback response'],
            guest_application: 'Better selection creates more consistent service for guests.',
            drill: 'Build five interview questions that reveal hospitality temperament.',
            assessment_questions: ['Why is seniority not enough?', 'What is trainability?', 'What does a culture carrier do?']
          }),
          academyLesson({
            ...trainerLessonDefaults,
            id: 'trainer-002',
            title: 'First-Class Orientation And Institutional Identity',
            objective: 'Design orientation that makes employees understand standards, identity, and operating purpose.',
            technical_depth: 'Orientation should not be a document dump. It should establish why the venue exists, what guests should feel, how standards are protected, what language the team uses, and what behaviors are non-negotiable. The first day teaches employees what the organization truly values.',
            taxonomy: [
              { type: 'Identity', usage: 'Who we are and what kind of hospitality we deliver.' },
              { type: 'Standards', usage: 'Observable behaviors expected on the floor.' },
              { type: 'Operating rhythm', usage: 'Briefings, feedback, reporting, recovery, and learning.' }
            ],
            terminology: ['orientation', 'service identity', 'non-negotiable', 'operating rhythm', 'standard language'],
            common_failures: ['Policy overload', 'No service philosophy', 'No demonstration', 'No emotional connection', 'No first-week plan'],
            amateur: 'Explains rules and schedules.',
            pro: 'Creates identity, expectations, and pride from day one.',
            professional_standard: 'Orientation must include philosophy, standards, tools, shadowing plan, and first certification path.',
            real_service_context: 'New hires decide quickly whether the operation is serious or improvised.',
            practical_execution: ['Open with purpose', 'Show standards', 'Explain tools', 'Assign mentor', 'Set first-week milestones'],
            guest_application: 'Guests feel consistency because staff share a common service language.',
            drill: 'Design a 45-minute first-day orientation for a new server.',
            assessment_questions: ['Why avoid document dumping?', 'What should orientation establish?', 'What is an operating rhythm?']
          }),
          academyLesson({
            ...trainerLessonDefaults,
            id: 'trainer-003',
            title: 'Shadowing, Mentorship, And Culture Champions',
            objective: 'Build shadowing systems that turn live service into structured learning.',
            technical_depth: 'Shadowing fails when trainees simply follow someone around. A strong shadowing system has pre-brief, observation focus, demonstration, guided practice, immediate feedback, and post-shift review. Culture champions should model language, posture, table reading, station reset, and recovery behavior.',
            taxonomy: [
              { type: 'Observe', usage: 'Trainee watches one specific behavior.' },
              { type: 'Explain', usage: 'Trainer names why the behavior matters.' },
              { type: 'Practice', usage: 'Trainee performs under supervision.' },
              { type: 'Review', usage: 'Trainer gives focused feedback.' }
            ],
            terminology: ['shadowing', 'mentor', 'culture champion', 'guided practice', 'observation focus'],
            common_failures: ['No objective', 'Trainer too busy to explain', 'Trainee passive all shift', 'Feedback saved until too late'],
            amateur: 'Lets the trainee watch.',
            pro: 'Turns the shift into planned practice.',
            professional_standard: 'Every shadowing shift should have two observable goals and one post-shift feedback note.',
            real_service_context: 'A new hire can shadow five shifts and still not learn if nobody defines what to observe.',
            practical_execution: ['Set goal', 'Demonstrate', 'Let trainee practice', 'Correct quickly', 'Debrief'],
            guest_application: 'Trainees learn without damaging live guest experience.',
            drill: 'Create a shadowing plan for greeting, table maintenance, and complaint recovery.',
            assessment_questions: ['Why does passive shadowing fail?', 'What is observation focus?', 'What belongs in debrief?']
          }),
          academyLesson({
            ...trainerLessonDefaults,
            id: 'trainer-004',
            title: 'Microlearning And Mobile Training Design',
            objective: 'Break complex standards into short, repeatable lessons that staff can apply before shift.',
            technical_depth: 'Microlearning works when it teaches one behavior, gives one example, and ends with one action. It should not become tiny paperwork. Mobile lessons should support pre-shift memory, station refreshers, service language, cocktail specs, allergy steps, and recovery scripts. Repetition builds readiness.',
            taxonomy: [
              { type: 'Behavior unit', usage: 'One action or decision staff can perform.' },
              { type: 'Refresh lesson', usage: 'Short review before shift.' },
              { type: 'Performance drill', usage: 'Practice action tied to live behavior.' }
            ],
            terminology: ['microlearning', 'behavior unit', 'retrieval practice', 'spaced repetition', 'mobile refresher'],
            common_failures: ['Too much text', 'No practice', 'No manager follow-up', 'Content not tied to shift behavior'],
            amateur: 'Cuts a manual into smaller manual pages.',
            pro: 'Creates short lessons that change one service behavior.',
            professional_standard: 'A micro-lesson should be readable in under five minutes and tied to a visible action.',
            real_service_context: 'Staff can review delay language 10 minutes before a high-pressure service.',
            practical_execution: ['Choose one behavior', 'Write short standard', 'Add example', 'Add drill', 'Check in service'],
            guest_application: 'Guests benefit from staff who remember the standard at the moment of service.',
            drill: 'Convert the complaint recovery SOP into a three-minute micro-lesson.',
            assessment_questions: ['What is a behavior unit?', 'Why include practice?', 'How long should microlearning be?']
          }),
          academyLesson({
            ...trainerLessonDefaults,
            id: 'trainer-005',
            title: 'Roleplay, Simulation, And Safe Practice Pressure',
            objective: 'Run roleplays that feel realistic, useful, and psychologically safe.',
            technical_depth: 'Roleplay should not embarrass staff. It should isolate a specific behavior, use realistic language, increase pressure gradually, and end with immediate coaching. Good simulations prepare staff for complaint recovery, VIP language, delay updates, allergies, intoxication, upselling, and difficult arrivals.',
            taxonomy: [
              { type: 'Foundation roleplay', usage: 'Simple script and low pressure.' },
              { type: 'Pressure roleplay', usage: 'Emotion, time, and ambiguity added.' },
              { type: 'Live transfer', usage: 'Manager watches behavior during shift.' }
            ],
            terminology: ['roleplay', 'simulation', 'psychological safety', 'scenario design', 'live transfer'],
            common_failures: ['Mocking mistakes', 'No objective', 'Unrealistic guest lines', 'No debrief', 'Too much pressure too early'],
            amateur: 'Uses roleplay to test and embarrass.',
            pro: 'Uses roleplay to build readiness before real guests are affected.',
            professional_standard: 'Every simulation has objective, scenario, performance marker, feedback, and next practice.',
            real_service_context: 'Complaint recovery should be practiced before the first major complaint.',
            practical_execution: ['Set objective', 'Run scenario', 'Pause if needed', 'Coach one behavior', 'Repeat'],
            guest_application: 'Practiced staff stay calm when guest emotion rises.',
            drill: 'Run a delay complaint roleplay at three pressure levels.',
            assessment_questions: ['Why does safety matter in roleplay?', 'What is live transfer?', 'How should feedback be delivered?']
          })
        ]
      },
      {
        id: 'trainer-assessment',
        title: 'Correction, Readiness, Assessment, And Certification',
        lessons: [
          academyLesson({
            ...trainerLessonDefaults,
            id: 'trainer-006',
            title: 'Pre-Shift Lineups As Teaching Systems',
            objective: 'Use briefings to teach, test, and emotionally calibrate staff before service.',
            technical_depth: 'A lineup is not an announcement board. It should communicate operational facts, one service standard, one knowledge check, one risk, and one behavioral focus. The best lineups are short, specific, and repeated enough to shape culture. Managers should test knowledge without humiliating staff.',
            taxonomy: [
              { type: 'Operational facts', usage: 'Covers, VIPs, events, shortages, 86 items.' },
              { type: 'Knowledge check', usage: 'Ingredient, wine, cocktail, allergy, or SOP question.' },
              { type: 'Behavior focus', usage: 'One standard to observe tonight.' }
            ],
            terminology: ['lineup', 'pre-shift', 'knowledge check', 'behavior focus', 'service calibration'],
            common_failures: ['Too long', 'No focus', 'Manager monologue', 'No knowledge check', 'No follow-up in service'],
            amateur: 'Reads announcements.',
            pro: 'Uses lineup to calibrate behavior before doors open.',
            professional_standard: 'Lineups should be under 10 minutes and include one measurable service focus.',
            real_service_context: 'A Friday rush needs standards repeated before pressure starts.',
            practical_execution: ['State tonight facts', 'Ask one question', 'Name risk', 'Set standard', 'Observe during shift'],
            guest_application: 'Guests experience a team that begins service aligned.',
            drill: 'Write a seven-minute lineup for a sold-out Friday with two VIP tables.',
            assessment_questions: ['What belongs in lineup?', 'Why include knowledge checks?', 'How long should it run?']
          }),
          academyLesson({
            ...trainerLessonDefaults,
            id: 'trainer-007',
            title: 'Correction Without Humiliation',
            objective: 'Correct staff quickly and respectfully so standards improve without fear culture.',
            technical_depth: 'Correction should be specific, timely, behavior-focused, and private when sensitive. Public humiliation creates fear and concealment. Overly soft correction creates drift. A trainer should name the observed behavior, explain impact, demonstrate standard, and ask for immediate repeat or next-shift application.',
            taxonomy: [
              { type: 'In-the-moment cue', usage: 'Small correction during live service.' },
              { type: 'Private correction', usage: 'Sensitive or repeated issue.' },
              { type: 'Coaching plan', usage: 'Pattern issue needing follow-up.' }
            ],
            terminology: ['behavior-focused feedback', 'standard drift', 'private correction', 'coaching cue', 'repeat practice'],
            common_failures: ['Correcting personality', 'Waiting too long', 'Public embarrassment', 'No demonstration', 'No follow-up'],
            amateur: 'Avoids correction or makes it personal.',
            pro: 'Corrects behavior clearly while preserving dignity.',
            professional_standard: 'Feedback should describe behavior, impact, standard, and next action.',
            real_service_context: 'A server repeatedly saying "no problem" needs language correction before it becomes culture.',
            practical_execution: ['Name behavior', 'State impact', 'Show standard', 'Ask for repeat', 'Follow up'],
            guest_application: 'Staff improve without emotional residue reaching the floor.',
            drill: 'Correct three errors: poor greeting, messy table, weak delay update.',
            assessment_questions: ['Why avoid personality feedback?', 'When should correction be private?', 'What are the four parts of correction?']
          }),
          academyLesson({
            ...trainerLessonDefaults,
            id: 'trainer-008',
            title: 'Readiness Scoring And Practical Certification',
            objective: 'Assess readiness using observable behaviors, drills, quizzes, and manager observation.',
            technical_depth: 'Readiness is not course completion. It combines knowledge, skill, judgment, consistency, and pressure behavior. Certification should include written knowledge, practical execution, roleplay, live observation, and manager sign-off. Scoring should be transparent so staff know what growth requires.',
            taxonomy: [
              { type: 'Knowledge', usage: 'Facts, specs, standards, policy.' },
              { type: 'Skill', usage: 'Physical or verbal execution.' },
              { type: 'Judgment', usage: 'Choosing correct action under ambiguity.' },
              { type: 'Consistency', usage: 'Repeating standard across shifts.' }
            ],
            terminology: ['readiness score', 'certification', 'observation checklist', 'manager sign-off', 'practical exam'],
            common_failures: ['Certifying by attendance', 'No live observation', 'Unclear scoring', 'No retest path', 'Ignoring pressure behavior'],
            amateur: 'Marks training complete when lesson is watched.',
            pro: 'Certifies when behavior is reliable in service.',
            professional_standard: 'Critical roles require practical certification, not only lesson completion.',
            real_service_context: 'A bartender can know a cocktail spec and still fail under volume if execution is not observed.',
            practical_execution: ['Define criteria', 'Test knowledge', 'Run drill', 'Observe live', 'Sign off or assign practice'],
            guest_application: 'Guests receive service from staff who are truly ready, not just onboarded.',
            drill: 'Create a readiness rubric for cocktail service or complaint recovery.',
            assessment_questions: ['Why is completion not readiness?', 'What is practical certification?', 'What should be observed live?']
          }),
          academyLesson({
            ...trainerLessonDefaults,
            id: 'trainer-009',
            title: 'Coaching Logs, Progression, And Manager Endorsements',
            objective: 'Use coaching records to create momentum, accountability, and fair development.',
            technical_depth: 'Coaching logs should capture observed behavior, agreed action, practice assigned, follow-up date, and manager endorsement. The tone should be developmental, not punitive. Progression systems work when staff can see growth: completed paths, service readiness, cocktail practice, guest language, and leadership signals.',
            taxonomy: [
              { type: 'Observation', usage: 'What happened in service.' },
              { type: 'Coaching action', usage: 'What to practice or change.' },
              { type: 'Endorsement', usage: 'Manager confirms behavior has improved.' }
            ],
            terminology: ['coaching log', 'endorsement', 'progression path', 'practice assignment', 'growth signal'],
            common_failures: ['Only logging negatives', 'No follow-up date', 'Vague notes', 'No employee visibility', 'Punitive tone'],
            amateur: 'Writes notes only when someone fails.',
            pro: 'Uses logs to build growth, fairness, and institutional memory.',
            professional_standard: 'Every coaching note should have a next action and review point.',
            real_service_context: 'Repeated weak recovery language becomes visible as a pattern, not a surprise.',
            practical_execution: ['Write factual note', 'Agree action', 'Assign practice', 'Set review', 'Endorse improvement'],
            guest_application: 'Staff development becomes more consistent and less dependent on memory.',
            drill: 'Write one positive endorsement and one corrective coaching note.',
            assessment_questions: ['Why log positives?', 'What belongs in a coaching note?', 'How does endorsement help progression?']
          }),
          academyLesson({
            ...trainerLessonDefaults,
            id: 'trainer-010',
            title: 'Trainer Calibration And Institutional Consistency',
            objective: 'Keep multiple trainers aligned so standards do not change by personality or shift.',
            technical_depth: 'Trainer calibration prevents standard drift. Trainers should review rubrics, compare scoring, observe each other, align language, and resolve disagreement about standards. The goal is that a trainee receives the same expectation whether trained by morning, evening, bar, floor, or event leaders.',
            taxonomy: [
              { type: 'Rubric calibration', usage: 'Agree what good, acceptable, and not ready look like.' },
              { type: 'Language calibration', usage: 'Use shared correction and guest language.' },
              { type: 'Observation calibration', usage: 'Multiple trainers compare live scoring.' }
            ],
            terminology: ['calibration', 'standard drift', 'rubric', 'inter-rater consistency', 'trainer alignment'],
            common_failures: ['Different trainers teach different shortcuts', 'No rubric', 'Personal preference becomes standard', 'No trainer feedback'],
            amateur: 'Assumes trainers agree because they are experienced.',
            pro: 'Measures trainer alignment and corrects drift.',
            professional_standard: 'Trainer calibration should happen monthly and before major menu or service changes.',
            real_service_context: 'A new bartender should not learn two different Martini standards from two trainers.',
            practical_execution: ['Review rubric', 'Score sample performance', 'Compare differences', 'Align language', 'Document standard'],
            guest_application: 'Consistency improves because training stops depending on who is scheduled.',
            drill: 'Have two trainers score the same service roleplay and reconcile differences.',
            assessment_questions: ['What is standard drift?', 'Why calibrate trainers?', 'What is inter-rater consistency?']
          })
        ]
      }
    ]
  }
]
