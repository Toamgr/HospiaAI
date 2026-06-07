/**
 * eventCocktailProductionEngine — Deterministic event cocktail production planner.
 *
 * Pure utility. No AI. No React. No backend calls. No domain layer imports.
 * Converts an approved cocktail menu + event data into a full operational
 * production sheet, bottle estimates, prep lists, garnish counts, and
 * staffing guidance.
 *
 * All consumption assumptions are constants at the top of this file.
 */

// ── Configurable consumption assumptions ──────────────────────────────────────
// Adjust per venue policy; values are average expected drinks per guest.

export const DRINKS_PER_GUEST = {
  wedding:   3.0,
  corporate: 2.0,
  private:   2.5,
  bar_event: 3.5,
  other:     2.5,
}

const WELCOME_DRINK_RATIO  = 0.90   // fraction of guests who receive a welcome drink
const VOLUME_WASTE_FACTOR  = 0.10   // 10% operational waste on all poured volumes
const GARNISH_BUFFER       = 1.08   // 8% extra garnish for drops/damage

// Service-speed order weighting: faster builds attract proportionally more orders
const SPEED_ORDER_WEIGHT = { fast: 1.25, medium: 1.0, slow: 0.80 }

// Bottle sizes (ml) by spirit family — planning-grade defaults
const BOTTLE_SIZE_BY_FAMILY = {
  default:    700,   // most spirits and liqueurs
  vermouth:   750,
  wine:       750,
  sparkling:  750,
  bitters:    100,
  syrup:     1000,   // litre for house syrups (not a purchased bottle)
}

// ── Ingredient classification ─────────────────────────────────────────────────
// Signals that an ingredient is a purchased bottle (spirit / liqueur / wine)

const BOTTLE_SIGNALS = [
  'gin', 'vodka', 'rum', 'tequila', 'mezcal', 'whisky', 'whiskey', 'bourbon',
  'scotch', 'rye', 'brandy', 'cognac', 'pisco', 'arak', 'ouzo',
  'campari', 'aperol', 'cointreau', 'triple sec', 'curacao', 'curaçao',
  'amaretto', 'kahlua', 'baileys', 'frangelico', 'limoncello', 'midori',
  'elderflower liqueur', 'st-germain', 'st germain',
  'vermouth', 'sherry', 'port',
  'prosecco', 'champagne', 'cava', 'sparkling wine',
  'amaro', 'aperitivo', 'bitters', 'liqueur', 'schnapps',
  'chartreuse', 'benedictine', 'drambuie', 'sambuca', 'absinthe',
]

// Signals that an ingredient is a prep item (fresh juice, syrup, garnish, mixer)
const PREP_SIGNALS = [
  'juice', 'squeeze', 'fresh lime', 'fresh lemon', 'fresh orange', 'fresh grapefruit',
  'syrup', 'cordial', 'shrub', 'honey', 'agave', 'gomme', 'falernum', 'orgeat',
  'puree', 'clarified', 'infusion', 'reduction',
  'egg white', 'egg yolk', 'egg', 'cream', 'coconut cream', 'heavy cream',
  'soda water', 'tonic water', 'ginger beer', 'ginger ale', 'water', 'ice',
  'salt', 'sugar', 'simple', 'demerara',
  'espresso', 'cold brew', 'coffee',
  'mint', 'basil', 'rosemary', 'thyme', 'lavender', 'cucumber',
]

function isBottleIngredient(name) {
  const lower = (name || '').toLowerCase()
  if (PREP_SIGNALS.some(s => lower.includes(s))) return false
  return BOTTLE_SIGNALS.some(s => lower.includes(s))
}

function isPrepIngredient(name) {
  const lower = (name || '').toLowerCase()
  return PREP_SIGNALS.some(s => lower.includes(s))
}

function getBottleSizeMl(name) {
  const lower = (name || '').toLowerCase()
  if (/vermouth/.test(lower))                   return BOTTLE_SIZE_BY_FAMILY.vermouth
  if (/prosecco|champagne|cava|sparkling/.test(lower)) return BOTTLE_SIZE_BY_FAMILY.sparkling
  if (/\bwine\b/.test(lower))                   return BOTTLE_SIZE_BY_FAMILY.wine
  if (/bitters/.test(lower))                    return BOTTLE_SIZE_BY_FAMILY.bitters
  return BOTTLE_SIZE_BY_FAMILY.default
}

// ── Garnish patterns ──────────────────────────────────────────────────────────

const GARNISH_PATTERNS = [
  { re: /dehydrat/i,          label: 'Dehydrated citrus slice' },
  { re: /lime/i,              label: 'Lime wedge / wheel' },
  { re: /lemon twist|lemon/i, label: 'Lemon twist / wedge' },
  { re: /orange/i,            label: 'Orange peel / twist' },
  { re: /grapefruit/i,        label: 'Grapefruit twist' },
  { re: /mint/i,              label: 'Mint sprig' },
  { re: /cherry/i,            label: 'Cherry' },
  { re: /cucumber/i,          label: 'Cucumber slice' },
  { re: /olive/i,             label: 'Olive' },
  { re: /rosemary/i,          label: 'Rosemary sprig' },
  { re: /thyme/i,             label: 'Thyme sprig' },
  { re: /basil/i,             label: 'Basil leaf' },
  { re: /flower|edible/i,     label: 'Edible flower' },
  { re: /salt rim|sugar rim/i,label: 'Glass rim prep' },
  { re: /cinnamon/i,          label: 'Cinnamon stick' },
]

function detectGarnishType(garnishStr) {
  if (!garnishStr || garnishStr === 'null') return null
  for (const { re, label } of GARNISH_PATTERNS) {
    if (re.test(garnishStr)) return label
  }
  return garnishStr  // return as-is if no pattern matched
}

// ── Prep item detection ───────────────────────────────────────────────────────

const FRESH_JUICE_RE = /fresh|squeeze|press/i
const JUICE_RE       = /juice/i
const SYRUP_RE       = /syrup|cordial|honey mix|agave|falernum|orgeat|shrub|gomme/i
const BATCH_RE       = /batch|puree|clarif|infus|reduct/i

function categorizePrepIngredient(name) {
  const lower = (name || '').toLowerCase()
  if (FRESH_JUICE_RE.test(lower) || JUICE_RE.test(lower))   return 'fresh_juice'
  if (SYRUP_RE.test(lower))                                  return 'syrup'
  if (BATCH_RE.test(lower))                                  return 'specialty_batch'
  return 'other_prep'
}

const PREP_TIMING = {
  fresh_juice:      'Prepare day-of — maximum 4 hours before service',
  syrup:            'Can prepare 24–48 hours ahead and refrigerate',
  specialty_batch:  'Prepare day-of — check shelf life and label all batches',
  other_prep:       'Confirm timing with lead bartender',
}

// ── Welcome drink detection ───────────────────────────────────────────────────

function findWelcomeCocktail(cocktails) {
  // Prefer cocktail explicitly assigned to a welcome section
  const inWelcomeSection = cocktails.find(c => {
    const s = (c.section || '').toLowerCase()
    return s.includes('welcome') || s.includes('toast')
  })
  if (inWelcomeSection) return inWelcomeSection
  // Fall back to first cocktail (positional convention)
  return cocktails[0] || null
}

// ── Drink distribution ────────────────────────────────────────────────────────

// guestCount passed separately: welcome drink = 1 per guest (not per drink)
function computeDistribution({ cocktails, totalDrinks, guestCount, welcomeDrinkPriority }) {
  const welcomeCocktail = welcomeDrinkPriority ? findWelcomeCocktail(cocktails) : null
  const welcomeServes   = welcomeCocktail ? Math.round(guestCount * WELCOME_DRINK_RATIO) : 0
  const remainingDrinks = Math.max(0, totalDrinks - welcomeServes)
  const otherCocktails  = cocktails.filter(c => c !== welcomeCocktail)

  const totalWeight = otherCocktails.reduce(
    (s, c) => s + (SPEED_ORDER_WEIGHT[c.service_speed] || 1.0),
    0
  )

  const distribution = new Map()

  if (welcomeCocktail) {
    distribution.set(welcomeCocktail.name, welcomeServes)
  }

  for (const c of otherCocktails) {
    const weight = SPEED_ORDER_WEIGHT[c.service_speed] || 1.0
    const serves = totalWeight > 0
      ? Math.round((remainingDrinks * weight) / totalWeight)
      : Math.round(remainingDrinks / Math.max(otherCocktails.length, 1))
    distribution.set(c.name, serves)
  }

  return { distribution, welcomeCocktail }
}

// ── Production sheet rows ─────────────────────────────────────────────────────

function buildProductionRows(cocktails, distribution) {
  return cocktails.map(cocktail => {
    const expectedServes = distribution.get(cocktail.name) || 0
    const batchRecommended = Boolean(
      cocktail.batch_notes &&
      cocktail.batch_notes !== 'null' &&
      /pre.?batch|batch/i.test(cocktail.batch_notes)
    )
    const garnishNeeded = cocktail.garnish && cocktail.garnish !== 'null'
      ? cocktail.garnish
      : '—'
    const notes = batchRecommended
      ? (cocktail.batch_notes || 'Pre-batch recommended')
      : (cocktail.service_speed === 'slow' ? 'Complex build — brief staff before service' : '')

    return {
      cocktailName:   cocktail.name,
      section:        cocktail.section || null,
      expectedServes,
      batchRecommended,
      garnishNeeded,
      notes,
    }
  })
}

// ── Bottle estimate ───────────────────────────────────────────────────────────

function buildBottleEstimate(cocktails, distribution) {
  // Accumulate volume per ingredient (lowercase key for grouping)
  const volumeMap = new Map()   // key → { displayName, totalVolumeMl, bottleSizeMl }

  for (const cocktail of cocktails) {
    const serves = distribution.get(cocktail.name) || 0
    if (serves === 0) continue

    for (const ing of (cocktail.ingredients || [])) {
      if (!ing || !ing.name || !Number(ing.amount_ml)) continue
      if (!isBottleIngredient(ing.name)) continue

      const key          = ing.name.toLowerCase().trim()
      const bottleSizeMl = getBottleSizeMl(ing.name)
      const totalMl      = serves * Number(ing.amount_ml) * (1 + VOLUME_WASTE_FACTOR)

      if (volumeMap.has(key)) {
        volumeMap.get(key).totalVolumeMl += totalMl
      } else {
        volumeMap.set(key, {
          displayName:    ing.name,
          totalVolumeMl:  totalMl,
          bottleSizeMl,
        })
      }
    }
  }

  return Array.from(volumeMap.values())
    .map(({ displayName, totalVolumeMl, bottleSizeMl }) => ({
      ingredient:        displayName,
      estimatedVolumeMl: Math.round(totalVolumeMl),
      estimatedBottles:  Math.ceil(totalVolumeMl / bottleSizeMl),
      bottleSizeMl,
    }))
    .sort((a, b) => b.estimatedVolumeMl - a.estimatedVolumeMl)
}

// ── Prep list ─────────────────────────────────────────────────────────────────

function buildPrepList(cocktails, distribution) {
  // key → { displayName, category, totalVolumeMl, cocktails[] }
  const prepMap = new Map()

  for (const cocktail of cocktails) {
    const serves = distribution.get(cocktail.name) || 0
    if (serves === 0) continue

    for (const ing of (cocktail.ingredients || [])) {
      if (!ing || !ing.name || !Number(ing.amount_ml)) continue
      if (!isPrepIngredient(ing.name)) continue

      const key      = ing.name.toLowerCase().trim()
      const category = categorizePrepIngredient(ing.name)
      const volMl    = serves * Number(ing.amount_ml)

      if (prepMap.has(key)) {
        const entry = prepMap.get(key)
        entry.totalVolumeMl  += volMl
        if (!entry.cocktailNames.includes(cocktail.name)) {
          entry.cocktailNames.push(cocktail.name)
        }
      } else {
        prepMap.set(key, {
          displayName:   ing.name,
          category,
          totalVolumeMl: volMl,
          cocktailNames: [cocktail.name],
        })
      }
    }
  }

  return Array.from(prepMap.values())
    .map(({ displayName, category, totalVolumeMl, cocktailNames }) => ({
      item:          displayName,
      category,
      estimatedMl:   Math.round(totalVolumeMl),
      timing:        PREP_TIMING[category] || PREP_TIMING.other_prep,
      cocktails:     cocktailNames,
    }))
    .sort((a, b) => {
      // Order: fresh_juice first (most time-sensitive), then syrup, then others
      const ORDER = { fresh_juice: 0, syrup: 1, specialty_batch: 2, other_prep: 3 }
      return (ORDER[a.category] ?? 3) - (ORDER[b.category] ?? 3)
    })
}

// ── Garnish list ──────────────────────────────────────────────────────────────

function buildGarnishList(cocktails, distribution) {
  const garnishMap = new Map()   // label → { label, quantity, cocktailNames }

  for (const cocktail of cocktails) {
    if (!cocktail.garnish || cocktail.garnish === 'null') continue
    const serves = distribution.get(cocktail.name) || 0
    if (serves === 0) continue

    const label = detectGarnishType(cocktail.garnish)
    if (!label) continue

    const qty = Math.ceil(serves * GARNISH_BUFFER)

    if (garnishMap.has(label)) {
      const entry = garnishMap.get(label)
      entry.quantity += qty
      if (!entry.cocktailNames.includes(cocktail.name)) {
        entry.cocktailNames.push(cocktail.name)
      }
    } else {
      garnishMap.set(label, { label, quantity: qty, cocktailNames: [cocktail.name] })
    }
  }

  return Array.from(garnishMap.values())
    .sort((a, b) => b.quantity - a.quantity)
}

// ── Service plan ──────────────────────────────────────────────────────────────

const SERVICE_PLAN_BY_TYPE = {
  wedding: [
    'Welcome station required — set up and fully stocked before first guests arrive.',
    'Prepare for ceremony-to-reception transition surge (typically 15–20 minutes of peak demand).',
    'Pre-batch all batchable cocktails before service begins.',
    'Welcome drink must be continuously replenished during the first 30–45 minutes.',
  ],
  corporate: [
    'Fast service is the priority — avoid queue buildup at the bar during networking.',
    'Arrange for initial drinks to be circulated by floor staff on arrival.',
    'Limit complex builds during peak networking periods.',
    'Ensure all cocktails are ready to serve within 20 seconds at the bar.',
  ],
  private: [
    'Personalized interaction expected — guests may request variations.',
    'Flexible pacing — no hard service windows unless specified by host.',
    'Confirm any specific host preferences before service begins.',
  ],
  bar_event: [
    'Multiple order waves expected — plan for surge periods every 30–45 minutes.',
    'One dedicated bartender per station.',
    'Pre-batch all batchable components before doors open.',
    'Garnish station must be pre-prepared and self-replenishing throughout service.',
  ],
  other: [
    'Standard service flow applies.',
    'Confirm service timing with events manager before service begins.',
  ],
}

function buildServicePlan(eventType) {
  return SERVICE_PLAN_BY_TYPE[eventType] || SERVICE_PLAN_BY_TYPE.other
}

// ── Staffing notes ────────────────────────────────────────────────────────────

function buildStaffingNotes({ guestCount, cocktails, welcomeDrinkPriority, eventType }) {
  const notes = []

  if (guestCount >= 150) {
    notes.push('High-volume event — minimum 3 bartenders required.')
  } else if (guestCount >= 100) {
    notes.push('Event volume requires a minimum of 2 bartenders.')
  } else if (guestCount >= 60) {
    notes.push('Secondary bartender recommended for peak arrival and service periods.')
  }

  if (welcomeDrinkPriority) {
    notes.push('Dedicated welcome station required — one bartender assigned exclusively to welcome drinks during arrival.')
  }

  const hasComplexBuilds = cocktails.some(c => Number(c.operational_difficulty) >= 4)
  if (hasComplexBuilds) {
    notes.push('Menu includes complex builds — ensure lead bartender is fully briefed on all recipes before service.')
  }

  const hasBatchWork = cocktails.some(
    c => c.batch_notes && c.batch_notes !== 'null' && /pre.?batch|batch/i.test(c.batch_notes)
  )
  if (hasBatchWork) {
    notes.push('Pre-batching required — allocate 45–60 minutes before doors open for batch preparation and labelling.')
  }

  const hasHeavyGarnish = cocktails.some(c => {
    const g = (c.garnish || '').toLowerCase()
    return /mint|dehydrat|flower|smoke|rosemary|thyme/.test(g)
  })
  if (hasHeavyGarnish) {
    notes.push('Garnish preparation is time-intensive — allocate a dedicated garnish prep person or allow extra setup time.')
  }

  if (eventType === 'bar_event') {
    notes.push('Bar event format: ensure all staff are briefed on signature cocktail stories for guest engagement.')
  }

  return notes
}

// ── Welcome drink plan ────────────────────────────────────────────────────────

function buildWelcomeDrinkPlan({ welcomeDrinkPriority, welcomeCocktail, guestCount }) {
  if (!welcomeDrinkPriority || !welcomeCocktail) {
    return { required: false }
  }

  const estimatedServes   = Math.round(guestCount * WELCOME_DRINK_RATIO)
  const hasBatch          = welcomeCocktail.batch_notes && welcomeCocktail.batch_notes !== 'null'

  const productionNotes = [
    `Prepare full batch before guest arrival — target ${estimatedServes} serves ready at doors-open.`,
    hasBatch
      ? `Batch guidance: ${welcomeCocktail.batch_notes}`
      : 'Pre-portion all non-citrus components; add fresh elements at service.',
    'Keep topped up continuously during first 30–45 minutes of service.',
  ].join(' ')

  return {
    required:           true,
    recommendedCocktail: welcomeCocktail.name,
    section:            welcomeCocktail.section || null,
    estimatedServes,
    productionNotes,
  }
}

// ── Execution summary ─────────────────────────────────────────────────────────

function buildExecutionSummary({
  totalDrinks,
  productionRows,
  welcomeDrinkPlan,
  staffingNotes,
  prepList,
}) {
  const parts = []

  parts.push(`Estimated service volume: ${Math.round(totalDrinks)} cocktails.`)

  const batchableCount = productionRows.filter(r => r.batchRecommended).length
  if (batchableCount > 0) {
    parts.push(`Batch production recommended for ${batchableCount} menu item${batchableCount > 1 ? 's' : ''}.`)
  }

  if (welcomeDrinkPlan.required) {
    parts.push(`Welcome drinks (${welcomeDrinkPlan.estimatedServes} serves) must be prepared before guest arrival.`)
  }

  const needsAdditionalBartender = staffingNotes.some(n => /minimum|secondary bartender/.test(n))
  if (needsAdditionalBartender) {
    parts.push('Additional bartender support is recommended for this event volume.')
  }

  const freshJuiceItems = prepList.filter(p => p.category === 'fresh_juice')
  if (freshJuiceItems.length > 0) {
    parts.push(`Fresh juice prep required for ${freshJuiceItems.length} ingredient${freshJuiceItems.length > 1 ? 's' : ''} — prepare day-of.`)
  }

  return parts.join(' ')
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Build a complete production intelligence package for an approved event cocktail menu.
 *
 * @param {{ event, approvedMenu, guestCount, designContext, menuDNA }} input
 * @returns {{ productionSheet, bottleEstimate, prepList, garnishList, servicePlan, staffingNotes, welcomeDrinkPlan, executionSummary, totalDrinks, drinksPerGuest }}
 */
export function buildEventCocktailProduction({ event, approvedMenu, guestCount, designContext, menuDNA }) {
  const eventType         = event?.event_type || 'other'
  const count             = Number(guestCount) || 0
  const drinksPerGuest    = DRINKS_PER_GUEST[eventType] ?? DRINKS_PER_GUEST.other
  const totalDrinks       = count * drinksPerGuest
  const welcomeDrinkPri   = menuDNA?.welcomeDrinkPriority ?? false

  const cocktails = Array.isArray(approvedMenu?.cocktails) ? approvedMenu.cocktails : []

  if (cocktails.length === 0 || count === 0) {
    return {
      productionSheet:  [],
      bottleEstimate:   [],
      prepList:         [],
      garnishList:      [],
      servicePlan:      buildServicePlan(eventType),
      staffingNotes:    [],
      welcomeDrinkPlan: { required: false },
      executionSummary: count === 0
        ? 'Guest count is not set — production estimates cannot be generated.'
        : 'No cocktails found in the approved menu.',
      totalDrinks:    0,
      drinksPerGuest,
    }
  }

  // ── Distribute expected orders across cocktails ──
  const { distribution, welcomeCocktail } = computeDistribution({
    cocktails,
    totalDrinks,
    guestCount: count,
    welcomeDrinkPriority: welcomeDrinkPri,
  })

  // ── Build all output sections ──
  const productionRows  = buildProductionRows(cocktails, distribution)
  const bottleEstimate  = buildBottleEstimate(cocktails, distribution)
  const prepList        = buildPrepList(cocktails, distribution)
  const garnishList     = buildGarnishList(cocktails, distribution)
  const servicePlan     = buildServicePlan(eventType)

  const staffingNotes = buildStaffingNotes({
    guestCount:          count,
    cocktails,
    welcomeDrinkPriority: welcomeDrinkPri,
    eventType,
  })

  const welcomeDrinkPlan = buildWelcomeDrinkPlan({
    welcomeDrinkPriority: welcomeDrinkPri,
    welcomeCocktail,
    guestCount: count,
  })

  const executionSummary = buildExecutionSummary({
    totalDrinks,
    productionRows,
    welcomeDrinkPlan,
    staffingNotes,
    prepList,
  })

  return {
    productionSheet: productionRows,
    bottleEstimate,
    prepList,
    garnishList,
    servicePlan,
    staffingNotes,
    welcomeDrinkPlan,
    executionSummary,
    totalDrinks: Math.round(totalDrinks),
    drinksPerGuest,
  }
}
