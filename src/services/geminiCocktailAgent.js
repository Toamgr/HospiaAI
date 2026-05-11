import { FEW_SHOT_EXAMPLES, BEVERAGE_DIRECTOR_SYSTEM_PROMPT, BEVERAGE_DIRECTOR_FEW_SHOT_EXAMPLES, EXPECTED_FIELDS } from '../prompts/geminiCocktailPrompts.js'

function stripMarkdownFences(text = '') {
  return text
    .replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1')
    .replace(/(^``\s*|^`\s*|`$|``$)/g, '')
    .trim();
}

function normalizeValue(value) {
  if (value === undefined || value === null) return '';
  return typeof value === 'string' ? value.trim() : value;
}

function parseStrictJson(raw) {
  const cleaned = stripMarkdownFences(raw);

  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    throw new Error('AI response was not valid JSON. The assistant must return strict JSON only.');
  }

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error('AI response could not be parsed as JSON. Ensure Gemini returns strict JSON only.');
  }
}

function getResponseText(responseBody) {
  if (!responseBody) return '';
  if (typeof responseBody === 'string') return responseBody;

  if (Array.isArray(responseBody.candidates) && responseBody.candidates.length) {
    const candidate = responseBody.candidates[0];
    if (candidate?.content) {
      if (Array.isArray(candidate.content)) {
        return candidate.content.map(part => part?.text || '').join('\n');
      }
      return candidate.content?.parts?.map(part => part.text || '').join('\n') || '';
    }
    return candidate.output || candidate.message?.content || '';
  }

  if (typeof responseBody.output?.text === 'string') {
    return responseBody.output.text;
  }

  return '';
}

function formatObjectValue(item) {
  if (!item || typeof item !== 'object') return normalizeValue(item)

  const amount = item.amountMl || item.amount_ml || item.ml
  const ingredient = item.ingredient || item.name
  const description = item.description || item.note || item.notes || item.warning || item.reason
  const parts = []

  if (amount !== undefined && amount !== null && String(amount).trim()) {
    parts.push(`${String(amount).trim()} ml`)
  }
  if (ingredient) {
    parts.push(String(ingredient).trim())
  }
  if (description) {
    parts.push(String(description).trim())
  }

  if (parts.length) {
    return parts.join(' - ')
  }

  const values = Object.values(item).filter(value => value !== undefined && value !== null)
  return values.map(value => (typeof value === 'object' ? JSON.stringify(value) : String(value))).join(' | ')
}

function parseAmountIngredientLine(value) {
  const text = normalizeValue(value)
  const match = text.match(/^(\d+(?:\.\d+)?)\s*ml\b\s*(?:[-:\u2014]\s*)?(.*)$/i)
  if (!match) return null

  return {
    amountMl: Number(match[1]),
    ingredient: normalizeValue(match[2]),
    role: ''
  }
}

function normalizeIngredientObject(item, index = 0) {
  if (item === undefined || item === null) {
    console.warn('Cocktail ingredient normalization mismatch', { index, item, reason: 'empty ingredient entry' })
    return null
  }

  if (typeof item === 'string') {
    const parsed = parseAmountIngredientLine(item)
    if (!parsed) {
      console.warn('Cocktail ingredient normalization mismatch', { index, item, reason: 'ingredient string is not amountMl + ingredient name' })
      return { amountMl: '', ingredient: normalizeValue(item), role: '' }
    }
    if (!parsed.ingredient) {
      console.warn('Cocktail ingredient normalization mismatch', { index, item, reason: 'ingredient string contains amount only' })
    }
    return parsed
  }

  if (typeof item === 'number') {
    console.warn('Cocktail ingredient normalization mismatch', { index, item, reason: 'number-only ingredient amount' })
    return { amountMl: item, ingredient: '', role: '' }
  }

  if (typeof item === 'object') {
    const amount = item.amountMl ?? item.amount_ml ?? item.ml ?? item.amount
    const ingredient = normalizeValue(item.ingredient || item.ingredientName || item.ingredient_name || item.name || item.label)
    const role = normalizeValue(item.role || item.purpose || item.function || item.description || item.note)

    if (!ingredient || amount === undefined || amount === null || !String(amount).trim()) {
      console.warn('Cocktail ingredient normalization mismatch', {
        index,
        item,
        reason: !ingredient ? 'missing ingredient name' : 'missing ml amount'
      })
    }

    return {
      amountMl: amount === '' || amount === undefined || amount === null ? '' : Number(amount),
      ingredient,
      role
    }
  }

  console.warn('Cocktail ingredient normalization mismatch', { index, item, reason: 'unsupported ingredient field type' })
  return null
}

function normalizeIngredientObjects(value) {
  if (value === undefined || value === null) return []
  const source = Array.isArray(value) ? value : typeof value === 'string'
    ? value.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    : [value]

  return source.map((item, index) => normalizeIngredientObject(item, index)).filter(Boolean)
}

function isCompleteIngredient(item) {
  if (!item || typeof item !== 'object') return false
  const amount = Number(item.amountMl)
  const ingredient = normalizeValue(item.ingredient)
  return Number.isFinite(amount) && amount > 0 && ingredient.length > 2 && !/^ml$/i.test(ingredient)
}

function hasCompleteIngredientSet(ingredients = []) {
  return Array.isArray(ingredients) && ingredients.length >= 3 && ingredients.every(isCompleteIngredient)
}

function ingredientObjectToDisplay(item) {
  if (!item || typeof item !== 'object') return normalizeValue(item)
  const amount = Number(item.amountMl)
  const amountLabel = Number.isFinite(amount) ? `${amount} ml` : normalizeValue(item.amountMl)
  const role = normalizeValue(item.role)
  return `${amountLabel} \u2014 ${normalizeValue(item.ingredient)}${role ? ` \u2014 ${role}` : ''}`
}

function formatProposalList(value) {
  if (value === undefined || value === null) return []
  if (typeof value === 'string') {
    const lines = value.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    return lines.length ? lines : [value.trim()]
  }
  if (typeof value === 'number') return [String(value)]
  if (Array.isArray(value)) {
    return value.flatMap(item => formatProposalList(item))
  }
  if (typeof value === 'object') {
    const formatted = formatObjectValue(value)
    return formatted ? [formatted] : []
  }
  return []
}

function formatIngredients(value) {
  return normalizeIngredientObjects(value)
}

function normalizeAssessment(value) {
  if (!value || typeof value !== 'object') {
    return {
      strength: '',
      critique: normalizeValue(value),
      recommendedDirection: ''
    }
  }

  return {
    strength: normalizeValue(value.strength),
    critique: normalizeValue(value.critique),
    recommendedDirection: normalizeValue(value.recommendedDirection)
  }
}

function normalizeScore(value) {
  const score = Number(value)
  if (!Number.isFinite(score)) return 0
  return Math.max(0, Math.min(10, Math.round(score)))
}

function normalizeStrategicRead(value) {
  const read = value && typeof value === 'object' ? value : {}
  return {
    earnsMenuSpace: normalizeValue(read.earnsMenuSpace || read.whyThisEarnsMenuSpace || read.why_this_earns_menu_space || read.why),
    menuWeaknessSolved: normalizeValue(read.menuWeaknessSolved || read.currentMenuWeaknessSolved || read.menu_weakness_solved),
    guestOrderingPsychology: normalizeValue(read.guestOrderingPsychology || read.guest_psychology || read.guestOrderingLogic),
    profitPerception: normalizeValue(read.profitPerception || read.perceivedProfit || read.marginPerception),
    operationalRiskScore: normalizeScore(read.operationalRiskScore || read.operational_risk_score),
    signaturePotentialScore: normalizeScore(read.signaturePotentialScore || read.signature_potential_score)
  }
}

function normalizeHardScores(value) {
  const scores = value && typeof value === 'object' ? value : {}
  return {
    flavorOriginality: normalizeScore(scores.flavorOriginality || scores.flavor_originality),
    menuDifferentiation: normalizeScore(scores.menuDifferentiation || scores.menu_differentiation),
    operationalPracticality: normalizeScore(scores.operationalPracticality || scores.operational_practicality),
    premiumPerception: normalizeScore(scores.premiumPerception || scores.premium_perception),
    marginIntelligence: normalizeScore(scores.marginIntelligence || scores.margin_intelligence),
    approvalReadiness: normalizeScore(scores.approvalReadiness || scores.approval_readiness)
  }
}

function normalizeCategoryValues(value) {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.join(' / ')
  if (typeof value === 'object') return JSON.stringify(value)
  return ''
}

function normalizeBooleanOrString(value) {
  if (value === undefined || value === null) return ''
  return typeof value === 'boolean' ? String(value) : normalizeValue(value)
}

function normalizeText(value = '') {
  return String(value || '').trim().toLowerCase()
}

function countBy(items, keyFn) {
  return items.reduce((counts, item) => {
    const key = normalizeText(keyFn(item) || 'unknown')
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
}

function uniqueArray(values = []) {
  return Array.from(new Set(values.filter(Boolean)))
}

function garnishFamily(value = '') {
  const normalized = normalizeText(value)
  if (!normalized) return 'none'
  const firstWord = normalized.split(/\s+/)[0]
  if (['orange', 'lemon', 'lime', 'grapefruit', 'mint', 'cherry', 'cucumber', 'pineapple', 'ginger'].includes(firstWord)) {
    return firstWord
  }
  if (normalized.includes('twist')) return 'twist'
  if (normalized.includes('wheel')) return 'wheel'
  if (normalized.includes('bouquet')) return 'bouquet'
  return firstWord
}

function deriveFlavorCategories(cocktail = {}) {
  const text = normalizeText([cocktail.profile, cocktail.guestDescription, cocktail.concept, cocktail.conceptStory, cocktail.method, cocktail.garnish, ...(cocktail.ingredients || [])].join(' '))
  return {
    sweet: /sweet|syrup|liqueur|cream|coconut|fruit|honey|orgeat/.test(text),
    sour: /lemon|lime|citrus|tart|vinegar/.test(text),
    bitter: /bitter|amaro|campari|aperitivo|vermouth|angostura/.test(text),
    smoky: /smoky|smoke|mezcal|peat|char/.test(text),
    herbal: /herb|mint|basil|rosemary|sage|thyme|cilantro|shiso|tarragon/.test(text),
    floral: /floral|rose|violet|elderflower|lavender|jasmine/.test(text),
    tropical: /pineapple|coconut|passion|mango|banana|tropical|rum/.test(text),
    dessert: /dessert|sweet|cream|liqueur|chocolate|caramel|vanilla|nutty/.test(text),
    lowAbv: /low abv|low-abv|session|spritz|vermouth|sherry|aperitif/.test(text)
  }
}

function derivePrepCategories(cocktail = {}) {
  const text = normalizeText([cocktail.method, cocktail.ice, cocktail.ingredients, cocktail.garnish].join(' '))
  return {
    shaken: /shake|shaken|dry shake/.test(text),
    stirred: /stir|stirred/.test(text),
    built: /build|built|roll|layer/.test(text),
    batched: /batch|pre-batch|prebatch|large format|batchable/.test(text)
  }
}

function analyzeMenuEngineering(approvedCocktails = []) {
  const baseSpiritCounts = countBy(approvedCocktails, item => item.baseSpirit || item.spirit || item.family || item.profile || 'unknown')
  const styleCounts = countBy(approvedCocktails, item => item.style || item.family || item.profile || 'unknown')
  const garnishCounts = countBy(approvedCocktails, item => garnishFamily(item.garnish || item.garnishDescription || ''))
  const flavorCategories = approvedCocktails.reduce((counts, item) => {
    const categories = deriveFlavorCategories(item)
    Object.entries(categories).forEach(([category, present]) => {
      if (present) counts[category] = (counts[category] || 0) + 1
    })
    return counts
  }, {})
  const prepCounts = approvedCocktails.reduce((counts, item) => {
    const prep = derivePrepCategories(item)
    Object.entries(prep).forEach(([step, present]) => {
      if (present) counts[step] = (counts[step] || 0) + 1
    })
    return counts
  }, {})
  const highComplexityCount = approvedCocktails.filter(item => Number(item.complexityScore || item.complexity || 0) >= 7 || /(complex|advanced|elaborate|fussy|decorated)/i.test(normalizeText(item.prepNotes || item.method || ''))).length
  const citrusUsageCount = approvedCocktails.filter(item => normalizeText([item.ingredients, item.garnish, item.concept, item.guestDescription].join(' ')).match(/lime|lemon|grapefruit|orange|citrus/)).length
  const repeatedGarnishFamilies = Object.entries(garnishCounts).filter(([family]) => family !== 'none' && garnishCounts[family] >= 2).map(([family, count]) => `${family} (${count})`)
  const missingGaps = []
  if ((flavorCategories.lowAbv || 0) < 2) missingGaps.push('low-ABV / spritz-style drinks')
  if ((flavorCategories.bitter || 0) < 2) missingGaps.push('bitter aperitivo or aromatic style')
  if ((flavorCategories.herbal || 0) < 2) missingGaps.push('herbal green profiles')
  if ((flavorCategories.smoky || 0) < 1) missingGaps.push('smoky / mezcal punctuation')
  if ((flavorCategories.floral || 0) < 1) missingGaps.push('floral / aromatic contrast')
  if ((flavorCategories.tropical || 0) < 1) missingGaps.push('tropical / rum-led punch')
  if ((prepCounts.built || 0) < 2) missingGaps.push('highball / refreshing long serves')
  if ((flavorCategories.sour || 0) >= 3) missingGaps.push('alternatives to citrus sour structure')
  const overrepresented = [
    ...Object.entries(baseSpiritCounts).filter(([, count]) => count >= 2).map(([key, count]) => `${key} (${count})`),
    ...Object.entries(styleCounts).filter(([, count]) => count >= 3).map(([key, count]) => `${key} (${count})`),
    ...(citrusUsageCount >= 3 ? ['citrus-led builds'] : [])
  ]
  const warnings = [
    ...Object.entries(baseSpiritCounts).filter(([, count]) => count >= 2).map(([spirit, count]) => `Your approved menu already has ${count} ${spirit}-forward cocktails.`),
    ...(citrusUsageCount >= 3 ? [`Your approved menu already has ${citrusUsageCount} citrus-forward cocktails.`] : []),
    ...(highComplexityCount >= 2 ? [`${highComplexityCount} menu items are already high-complexity builds.`] : []),
    ...repeatedGarnishFamilies.map(family => `The menu repeats garnish family: ${family}.`)
  ]

  return {
    total: approvedCocktails.length,
    baseSpiritCounts,
    styleCounts,
    garnishCounts,
    flavorProfileCounts: flavorCategories,
    prepCounts,
    highComplexityCount,
    citrusUsageCount,
    repeatedGarnishFamilies,
    missingGaps,
    overrepresented,
    warnings,
    menuGapNotes: missingGaps
  }
}

function critiqueManagerRequest(managerPrompt, form, menuEngineering) {
  const promptText = normalizeText(managerPrompt)
  const requestedSpirit = normalizeText(form.baseSpirit || '')
  const requestedProfile = normalizeText(form.flavorProfile || '')
  const isVague = promptText.length < 30 || /something|crazy|surprising|interesting|new|impressive|cool|wine/.test(promptText)
  const spiritOverused = requestedSpirit && (menuEngineering.baseSpiritCounts[requestedSpirit] || 0) >= 2
  const profileCrowded = requestedProfile && (menuEngineering.flavorProfileCounts[requestedProfile] || 0) >= 2
  const prepConflict = /(event|high-volume|busy|banquet|wedding|reception|fast service)/.test(normalizeText(form.serviceContext || '')) && /(high|advanced|complex|fussy|elaborate|slow|detailed)/.test(promptText + normalizeText(form.complexity || ''))
  const needsRole = menuEngineering.missingGaps.length === 0

  let strength = 'acceptable'
  const critiques = []
  const direction = []

  if (isVague) {
    strength = 'weak'
    critiques.push('The brief is too vague and lacks a clear menu role.')
    direction.push('Define a stronger role such as a low-ABV aperitif, premium crowd-pleaser, or bitter highball.')
  }

  if (spiritOverused) {
    strength = 'weak'
    critiques.push(`The requested base spirit (${requestedSpirit}) is already overrepresented on this menu.`)
    direction.push('Avoid another same-spirit signature, or shift to a clearer contrast such as herbal mezcal, rum aperitivo, or bitter aperitif.')
  }

  if (profileCrowded) {
    strength = 'weak'
    critiques.push(`The requested flavor profile (${requestedProfile}) is already crowded on the menu.`)
    direction.push('Choose a more distinct profile or sharpen the drink around a gap such as bitter, smoky, or low-ABV.')
  }

  if (prepConflict) {
    if (strength !== 'weak') strength = 'acceptable'
    critiques.push('Service context and complexity are misaligned; this should be simplified for reliable execution.')
    direction.push('Focus on batchable components, fast garnish, and a straightforward build.')
  }

  if (needsRole) {
    critiques.push('The current menu already covers most broad roles; this request must earn a clear new place.')
    direction.push('Ensure the drink has a memorable purpose rather than being a generic addition.')
  }

  if (!requestedSpirit && !requestedProfile && !promptText) {
    strength = 'weak'
    critiques.push('The request has no actionable direction.')
    direction.push('Specify base spirit, desired texture, service context, or menu purpose.')
  }

  if (strength === 'acceptable' && critiques.length === 0) {
    strength = 'strong'
    critiques.push('The request is strategically viable, provided the final build creates clear menu contrast and service logic.')
    direction.push('Proceed with a differentiated drink that protects balance and margin.')
  }

  return {
    strength,
    critique: uniqueArray(critiques).join(' '),
    recommendedDirection: uniqueArray(direction).join(' ')
  }
}

function normalizeCocktailProposal(parsed) {
  const normalized = {
    directorConversationReply: normalizeValue(parsed.directorConversationReply || parsed.director_conversation_reply || parsed.consultantReply || parsed.reply),
    requestAssessment: normalizeAssessment(parsed.requestAssessment || parsed.request_assessment),
    cocktailName: normalizeValue(parsed.cocktailName || parsed.cocktail_name || parsed.name),
    concept: normalizeValue(parsed.concept || parsed.description || parsed.concept_story || parsed.conceptStory),
    menuRole: normalizeValue(parsed.menuRole || parsed.menu_role),
    strategicRead: normalizeStrategicRead(parsed.strategicRead || parsed.beverageDirectorStrategicRead || parsed.beverage_director_strategic_read),
    hardScores: normalizeHardScores(parsed.hardScores || parsed.hard_scores || parsed.scoring),
    strategicFit: normalizeValue(parsed.strategicFit || parsed.strategic_fit),
    menuConflictWarnings: formatProposalList(parsed.menuConflictWarnings || parsed.menu_conflict_warnings),
    ingredientsMl: formatIngredients(parsed.ingredientsMl || parsed.ingredients || parsed.ingredients_ml),
    method: normalizeValue(parsed.method),
    glassware: normalizeValue(parsed.glassware),
    ice: normalizeValue(parsed.ice),
    garnish: normalizeValue(parsed.garnish),
    prepNotes: normalizeValue(parsed.prepNotes || parsed.prep_notes),
    guestDescription: normalizeValue(parsed.guestDescription || parsed.guest_description),
    bartenderScript: normalizeValue(parsed.bartenderScript || parsed.bartender_script),
    balanceReasoning: normalizeValue(parsed.balanceReasoning || parsed.balance_reasoning),
    operationalReasoning: normalizeValue(parsed.operationalReasoning || parsed.operational_reasoning),
    costTier: normalizeValue(parsed.costTier || parsed.cost_tier),
    practicalityScore: Number(parsed.practicalityScore ?? parsed.practicality_score ?? 0),
    complexityScore: Number(parsed.complexityScore ?? parsed.complexity_score ?? 0),
    riskNotes: formatProposalList(parsed.riskNotes || parsed.risk_notes),
    substitutions: formatProposalList(parsed.substitutions),
    whyThisDeservesMenuSpace: normalizeValue(parsed.whyThisDeservesMenuSpace || parsed.why_this_deserves_menu_space)
  }

  EXPECTED_FIELDS.forEach(field => {
    if (!(field in normalized)) {
      normalized[field] = Array.isArray(parsed[field]) ? [] : ''
    }
  })

  return normalized
}

function hasMeaningfulValue(value) {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return Boolean(value.trim())
  if (typeof value === 'number') return Number.isFinite(value)
  if (Array.isArray(value)) return value.some(item => hasMeaningfulValue(item))
  if (typeof value === 'object') return Object.values(value).some(item => hasMeaningfulValue(item))
  return Boolean(value)
}

function hasCompleteProposalShape(normalized) {
  return Boolean(
    normalized.cocktailName &&
    normalized.concept &&
    normalized.ingredientsMl?.length >= 3 &&
    normalized.method &&
    normalized.glassware &&
    normalized.garnish &&
    normalized.prepNotes &&
    normalized.ice &&
    hasCompleteIngredientSet(normalized.ingredientsMl) &&
    (normalized.bartenderScript || normalized.guestDescription) &&
    hasMeaningfulValue(normalized.requestAssessment) &&
    hasMeaningfulValue(normalized.strategicRead) &&
    hasMeaningfulValue(normalized.hardScores)
  )
}

function inferFallbackSpirit(prompt, form) {
  const text = normalizeText(`${prompt} ${form.baseSpirit || ''}`)
  const options = [
    ['mezcal', ['mezcal', 'smoky', 'smoked']],
    ['tequila', ['tequila', 'agave', 'margarita']],
    ['rum', ['rum', 'tropical', 'pineapple', 'coconut']],
    ['whisky', ['whisky', 'whiskey', 'bourbon', 'rye', 'smoky']],
    ['brandy', ['brandy', 'cognac', 'luxury', 'winter']],
    ['vodka', ['vodka', 'clean', 'tourist', 'neutral']],
    ['arak', ['arak', 'israeli', 'levant', 'middle eastern', 'sesame', 'umami']],
    ['gin', ['gin', 'herbal', 'floral', 'fresh']]
  ]
  return options.find(([, terms]) => terms.some(term => text.includes(term)))?.[0] || 'gin'
}

function buildFallbackIngredientFormula({ agentPrompt, form }) {
  const prompt = normalizeText(agentPrompt)
  const spirit = inferFallbackSpirit(agentPrompt, form)
  const isUmami = /umami|savory|savoury|sesame|tahini|israeli|levant|middle eastern/.test(prompt)
  const wantsLowPrep = /low prep|simple|fast|batch|event|volume|200|wedding/.test(prompt)
  const wantsBitter = /bitter|amaro|aperitivo|negroni/.test(prompt)
  const wantsRefreshing = /fresh|refreshing|summer|bright|soda|highball|spritz/.test(prompt)
  const baseLabel = {
    arak: 'arak',
    gin: 'London dry gin',
    vodka: 'premium vodka',
    rum: 'aged rum',
    tequila: 'blanco tequila',
    mezcal: 'espadin mezcal',
    whisky: 'rye whisky',
    brandy: 'cognac VSOP'
  }[spirit] || 'London dry gin'
  const modifier = isUmami ? 'fino sherry' : wantsBitter ? 'Italian bitter aperitivo' : wantsRefreshing ? 'dry vermouth' : 'blanc vermouth'
  const acid = isUmami ? 'preserved lemon verjus' : wantsRefreshing ? 'fresh grapefruit acid blend' : 'fresh lemon juice'
  const sweetener = isUmami ? 'sesame-honey cordial' : wantsBitter ? 'demerara syrup' : 'white peach cordial'
  const texture = wantsRefreshing || wantsLowPrep ? 'chilled soda water' : 'saline solution'

  return {
    baseLabel,
    modifier,
    acid,
    sweetener,
    texture,
    formula: [
      { amountMl: 45, ingredient: baseLabel, role: 'base spirit' },
      { amountMl: 20, ingredient: modifier, role: 'structural modifier / bridge' },
      { amountMl: 15, ingredient: acid, role: 'acid and freshness control' },
      { amountMl: 10, ingredient: sweetener, role: 'sweetness and texture' },
      { amountMl: 2, ingredient: 'aromatic bitters', role: 'finish and bitterness' },
      { amountMl: wantsRefreshing || wantsLowPrep ? 75 : 2, ingredient: texture, role: wantsRefreshing || wantsLowPrep ? 'length and carbonation' : 'saline texture control' }
    ]
  }
}

function buildFallbackFullProposal({ agentPrompt, form, menuAnalysis, parsed }) {
  const normalizedParsed = normalizeCocktailProposal(parsed || {})
  const prompt = normalizeText(agentPrompt)
  const spirit = inferFallbackSpirit(agentPrompt, form)
  const isUmami = /umami|savory|savoury|sesame|tahini|israeli|levant|middle eastern/.test(prompt)
  const wantsLowPrep = /low prep|simple|fast|batch|event|volume|200|wedding/.test(prompt)
  const wantsBitter = /bitter|amaro|aperitivo|negroni/.test(prompt)
  const wantsRefreshing = /fresh|refreshing|summer|bright|soda|highball|spritz/.test(prompt)
  const style = wantsRefreshing || wantsLowPrep ? 'premium highball' : wantsBitter ? 'bitter aperitif signature' : isUmami ? 'savory coastal signature' : 'signature sour-adjacent build'
  const fallbackFormula = buildFallbackIngredientFormula({ agentPrompt, form })
  const { baseLabel, modifier, acid, sweetener, texture } = fallbackFormula
  const garnish = isUmami ? 'preserved citrus coin, sesame aroma, and soft herb' : wantsBitter ? 'orange twist and clipped rosemary' : 'expressed lemon peel and fresh herb'
  const namePrefix = isUmami ? 'Levant' : wantsBitter ? 'Aperitif' : wantsRefreshing ? 'Coastal' : 'Atelier'
  const nameSuffix = wantsLowPrep ? 'Service' : isUmami ? 'Measure' : wantsBitter ? 'Nocturne' : 'Signal'
  const assumption = isUmami
    ? 'Assumption: the request is interpreted through sesame, preserved citrus, saline texture, soft herbs, and a savory aperitif spine.'
    : `Assumption: the request is interpreted as a ${style} built around ${baseLabel}, menu contrast, and reliable service execution.`
  const conflictWarning = menuAnalysis?.warnings?.[0] || menuAnalysis?.menuGapNotes?.[0] || 'No blocking menu conflict supplied by the current menu scan.'

  return {
    directorConversationReply: normalizedParsed.directorConversationReply || `I am not pausing for clarification. ${assumption} The build below gives the manager a complete route to evaluate immediately.`,
    requestAssessment: {
      strength: normalizedParsed.requestAssessment?.strength || (prompt.length < 30 ? 'directionally weak but buildable' : 'buildable'),
      critique: normalizedParsed.requestAssessment?.critique || `${assumption} A sharper brief would improve precision, but this is strong enough to create a decision-ready candidate.`,
      recommendedDirection: normalizedParsed.requestAssessment?.recommendedDirection || `Move toward a ${style} that protects menu differentiation and operational repeatability.`
    },
    cocktailName: normalizedParsed.cocktailName || `${namePrefix} ${nameSuffix}`,
    concept: normalizedParsed.concept || `${namePrefix} ${nameSuffix} is a ${style} designed to turn a loose manager directive into a complete beverage route. It avoids a generic sour by using ${modifier}, ${acid}, and ${texture} to create a clear menu role.`,
    menuRole: normalizedParsed.menuRole || style,
    strategicRead: {
      earnsMenuSpace: normalizedParsed.strategicRead?.earnsMenuSpace || `It earns space by giving the menu a defined ${style} rather than another interchangeable signature.`,
      menuWeaknessSolved: normalizedParsed.strategicRead?.menuWeaknessSolved || conflictWarning,
      guestOrderingPsychology: normalizedParsed.strategicRead?.guestOrderingPsychology || 'The guest can understand it quickly: familiar base, distinctive savory/aromatic tension, and a premium but not confusing description.',
      profitPerception: normalizedParsed.strategicRead?.profitPerception || 'Perceived value comes from aromatic framing, controlled modifier use, and a garnish that reads intentional without heavy cost.',
      operationalRiskScore: normalizedParsed.strategicRead?.operationalRiskScore || (wantsLowPrep ? 3 : 5),
      signaturePotentialScore: normalizedParsed.strategicRead?.signaturePotentialScore || (isUmami ? 8 : 7)
    },
    hardScores: {
      flavorOriginality: normalizedParsed.hardScores?.flavorOriginality || (isUmami ? 8 : 7),
      menuDifferentiation: normalizedParsed.hardScores?.menuDifferentiation || 8,
      operationalPracticality: normalizedParsed.hardScores?.operationalPracticality || (wantsLowPrep ? 9 : 7),
      premiumPerception: normalizedParsed.hardScores?.premiumPerception || 8,
      marginIntelligence: normalizedParsed.hardScores?.marginIntelligence || 7,
      approvalReadiness: normalizedParsed.hardScores?.approvalReadiness || 7
    },
    strategicFit: normalizedParsed.strategicFit || `This is the strongest immediate route because it converts an incomplete brief into a differentiated ${style} while keeping execution realistic.`,
    menuConflictWarnings: normalizedParsed.menuConflictWarnings?.length ? normalizedParsed.menuConflictWarnings : [conflictWarning],
    ingredientsMl: hasCompleteIngredientSet(normalizedParsed.ingredientsMl) ? normalizedParsed.ingredientsMl : fallbackFormula.formula,
    method: normalizedParsed.method || (wantsRefreshing || wantsLowPrep ? 'Build the non-carbonated ingredients over cold hard ice, top with soda, and lift once with a bar spoon.' : 'Shake with cold hard ice, fine strain, and verify saline-acid balance before service.'),
    glassware: normalizedParsed.glassware || (wantsRefreshing || wantsLowPrep ? 'Highball' : 'Chilled coupe'),
    ice: normalizedParsed.ice || (wantsRefreshing || wantsLowPrep ? 'Cold spear or fresh hard cubed ice' : 'Cubed ice for shaking, served up'),
    garnish: normalizedParsed.garnish || garnish,
    prepNotes: normalizedParsed.prepNotes || 'Batch spirit, modifier, cordial, and bitters. Add acid and carbonated elements during service. Keep garnish pre-portioned and avoid last-minute fragile prep.',
    guestDescription: normalizedParsed.guestDescription || `A ${style} with ${baseLabel}, ${modifier}, ${acid}, and a precise aromatic finish.`,
    bartenderScript: normalizedParsed.bartenderScript || `Position this as a savory-premium signature, not a novelty drink. Mention the ${modifier}, the aromatic garnish, and the clean finish.`,
    balanceReasoning: normalizedParsed.balanceReasoning || `The drink uses ${acid} for lift, ${sweetener} for shape, ${modifier} for adult structure, and ${texture} to prevent the build from reading flat or overly sweet.`,
    operationalReasoning: normalizedParsed.operationalReasoning || 'The build is service-safe because the only live actions are chill, build or shake, finish, and garnish. No fragile theater is required.',
    costTier: normalizedParsed.costTier || 'Balanced cost tier with premium perception driven by aroma and story rather than expensive liquid volume.',
    practicalityScore: normalizedParsed.practicalityScore || (wantsLowPrep ? 9 : 7),
    complexityScore: normalizedParsed.complexityScore || (wantsLowPrep ? 3 : 5),
    riskNotes: normalizedParsed.riskNotes?.length ? normalizedParsed.riskNotes : [
      'Request was incomplete, so assumptions are embedded in the proposal rather than blocking generation.',
      isUmami ? 'Savory cocktails can polarize guests; keep the description elegant and avoid making it sound like food in a glass.' : 'Validate final sweetness and acidity after dilution.',
      'Confirm kosher status of fortified wines, bitters, and specialty modifiers before launch.'
    ],
    substitutions: normalizedParsed.substitutions?.length ? normalizedParsed.substitutions : [
      `Replace ${modifier} with another fortified or aperitif modifier if certification or supply is an issue.`,
      `Replace ${sweetener} with simple syrup plus a controlled aromatic ingredient for lower COGS.`,
      'For event service, convert to a highball format and remove fragile garnish steps.'
    ],
    whyThisDeservesMenuSpace: normalizedParsed.whyThisDeservesMenuSpace || `It deserves testing because it gives the team a complete, differentiated route from an imperfect brief instead of sending the manager back into a clarification loop.`
  }
}

function repairIncompleteIngredientPayload(parsed, context) {
  const normalized = normalizeCocktailProposal(parsed || {})
  if (hasCompleteIngredientSet(normalized.ingredientsMl)) return parsed

  console.warn('Cocktail ingredient repair invoked', {
    ingredientsMl: parsed?.ingredientsMl || parsed?.ingredients || parsed?.ingredients_ml,
    reason: 'ingredient formula missing amountMl, ingredient name, or role/purpose'
  })

  const fallbackFormula = buildFallbackIngredientFormula(context)
  return {
    ...(parsed || {}),
    ingredientsMl: fallbackFormula.formula,
    riskNotes: [
      ...formatProposalList(parsed?.riskNotes || parsed?.risk_notes),
      'Recipe ingredient contract was repaired locally because Gemini returned an incomplete formula.'
    ]
  }
}

function ensureFullProposalPayload(parsed, context) {
  const ingredientRepaired = repairIncompleteIngredientPayload(parsed, context)
  const normalized = normalizeCocktailProposal(ingredientRepaired || {})
  if (hasCompleteProposalShape(normalized)) return ingredientRepaired
  return buildFallbackFullProposal({ ...context, parsed: ingredientRepaired })
}

function validateResponseSchema(parsed) {
  const missing = EXPECTED_FIELDS.filter(field => parsed[field] === undefined)
  if (missing.length) {
    throw new Error(`Gemini response is missing required JSON fields: ${missing.join(', ')}`)
  }
  if (!hasCompleteIngredientSet(parsed.ingredientsMl)) {
    throw new Error('Recipe generation incomplete. Please regenerate.')
  }
}

function summarizeCocktails(items = []) {
  if (!items.length) return ['None'];
  return items.map((item, index) => {
    const spirit = normalizeValue(item.baseSpirit || item.spirit || item.profile || 'unknown');
    const profile = normalizeValue(item.profile || item.guestDescription || item.concept || 'no profile');
    const name = normalizeValue(item.name || item.cocktailName || `Cocktail ${index + 1}`);
    return `${index + 1}. ${name} | Base: ${spirit} | Profile: ${profile}`;
  });
}

function buildCocktailPrompt({ agentPrompt, form, approvedCocktails, cocktailDrafts, menuAnalysis, variation = '', previousProposal = null }) {
  const approvedList = summarizeCocktails(approvedCocktails);
  const draftList = summarizeCocktails(cocktailDrafts);
  const menuEngineering = analyzeMenuEngineering(approvedCocktails)
  const requestCritique = critiqueManagerRequest(agentPrompt, form, menuEngineering)
  const overrepresented = normalizeValue(menuAnalysis?.overrepresented?.join(', ') || menuAnalysis?.warnings?.join('; ') || menuEngineering.overrepresented?.join('; ') || 'None');
  const previousSummary = previousProposal ? `Previous proposal summary for follow-up editing:
- Name: ${normalizeValue(previousProposal.name)}
- Role: ${normalizeValue(previousProposal.menuRole)}
- Concept: ${normalizeValue(previousProposal.conceptStory)}
- Ingredients: ${(previousProposal.ingredients || []).join(' | ')}
- Method: ${normalizeValue(previousProposal.method)}
- Glassware / ice: ${normalizeValue(previousProposal.glassware)} / ${normalizeValue(previousProposal.ice)}
- Garnish: ${normalizeValue(previousProposal.garnish)}
- Guest description: ${normalizeValue(previousProposal.guestDescription)}
- Why it was chosen: ${normalizeValue(previousProposal.whyThisDeservesMenuSpace)}
- Execution logic: ${normalizeValue(previousProposal.operationalReasoning)}` : ''

  return `Manager prompt:
${agentPrompt.trim()}

Instruction hierarchy:
- The manager prompt is the source of truth.
- Structured form inputs are optional constraints only.
- If the manager prompt conflicts with any structured input, follow the manager prompt.
- If the structured inputs are blank, work entirely from the manager prompt and previous proposal context.

Structured form inputs:
- Base Spirit: ${normalizeValue(form.baseSpirit || 'Any')}
- Secondary Spirit / Liqueur: ${normalizeValue(form.secondarySpirit || 'None')}
- Flavor Profile: ${normalizeValue(form.flavorProfile || 'None')}
- Notes: ${normalizeValue(form.notes || 'None')}
- Seasonality: ${normalizeValue(form.seasonality || 'Any')}
- Service Context: ${normalizeValue(form.serviceContext || 'Signature')}
- Kosher Requirement: ${normalizeValue(form.kosherRequirement || 'No special requirement')}
- Preparation Complexity: ${normalizeValue(form.complexity || 'Balanced')}
- Batchability: ${normalizeValue(form.batchability || 'Standard')}
- Shelf-Life Consideration: ${normalizeValue(form.shelfLife || 'Standard')}
- Glassware preference: ${normalizeValue(form.glassware || 'Any')}
- Garnish vision: ${normalizeValue(form.garnish || 'Any')}
- Target Price: ${normalizeValue(form.targetPrice || 'N/A')}
- Target COGS: ${normalizeValue(form.targetCogs || 'N/A')}
- Sweetness: ${normalizeValue(form.sweetness || '0')}
- Acidity: ${normalizeValue(form.acidity || '0')}
- Bitterness: ${normalizeValue(form.bitterness || '0')}

Menu engineering analysis:
- Base spirit counts: ${JSON.stringify(menuEngineering.baseSpiritCounts)}
- Style counts: ${JSON.stringify(menuEngineering.styleCounts)}
- Flavor profile counts: ${JSON.stringify(menuEngineering.flavorProfileCounts)}
- Prep counts: ${JSON.stringify(menuEngineering.prepCounts)}
- High complexity count: ${menuEngineering.highComplexityCount}
- Repeated garnish families: ${menuEngineering.repeatedGarnishFamilies.join('; ') || 'None'}
- Citrus usage count: ${menuEngineering.citrusUsageCount}
- Missing menu gaps: ${menuEngineering.missingGaps.join('; ') || 'None'}
- Overrepresented categories: ${menuEngineering.overrepresented.join('; ') || 'None'}

Request critique:
- Strength: ${requestCritique.strength}
- Critique: ${requestCritique.critique}
- Recommended direction: ${requestCritique.recommendedDirection}

Current approved cocktails:
${approvedList.join('\n')}

Current cocktail drafts:
${draftList.join('\n')}

Menu balance analysis:
- Total approved cocktails: ${menuAnalysis?.total ?? 0}
- Base spirit counts: ${JSON.stringify(menuAnalysis?.baseSpiritCounts || {})}
- Style counts: ${JSON.stringify(menuAnalysis?.styleCounts || {})}
- Garnish counts: ${JSON.stringify(menuAnalysis?.garnishCounts || {})}
- Citrus-led cocktails: ${menuAnalysis?.citrusLed ?? 0}
- Premium/high-cost cocktails: ${menuAnalysis?.premiumHighCost ?? 0}
- Menu gaps: ${menuAnalysis?.menuGapNotes?.join('; ') || 'None'}
- Menu warnings: ${menuAnalysis?.warnings?.join('; ') || 'None'}
- Overrepresented warning: ${overrepresented}

${previousSummary ? `${previousSummary}\n\n` : ''}Variation request: ${variation || 'None'}

Director conversation mode:
- If this is a follow-up to a previous proposal, first respond in directorConversationReply with a short consultant critique of the previous version and exactly what you are changing.
- If the manager asks for "sexier", "more wow", "too basic", "too feminine", "cheaper but premium", or similar subjective changes, translate that into guest psychology, perceived value, margin, and service practicality.
- Do not merely regenerate. Make the revision feel like an intentional beverage director decision.
- Do not ask the manager a clarifying question instead of building. If the brief is incomplete, make a professional assumption and record it in requestAssessment.critique.
- The JSON must describe a real drink with a name, ingredients in ml, method, glassware, garnish, prep notes, service notes, scoring, director assessment, and strategic read.
- ingredientsMl must be an array of objects, never strings or numbers.
- Each ingredient object must use this exact shape: {"amountMl": 50, "ingredient": "Aged grape brandy", "role": "base spirit"}.
- Amount-only ingredients like {"amountMl": 50}, "50 ml", or 50 are invalid.
- The formula must be a complete cocktail recipe with real ingredient names, not only strategic analysis.

Required hard scoring:
- Score flavorOriginality, menuDifferentiation, operationalPracticality, premiumPerception, marginIntelligence, and approvalReadiness from 0 to 10.
- Scores must be reasoned by the actual proposal, menu context, and operating reality.
- Do not give all 9s or 10s unless the drink truly earns it.

${BEVERAGE_DIRECTOR_SYSTEM_PROMPT}

${FEW_SHOT_EXAMPLES}

${BEVERAGE_DIRECTOR_FEW_SHOT_EXAMPLES}

Return only strict JSON with the exact keys listed below. No markdown, no backticks, no commentary outside the JSON.
{
  "directorConversationReply": "",
  "requestAssessment": {"strength": "", "critique": "", "recommendedDirection": ""},
  "cocktailName": "",
  "concept": "",
  "menuRole": "",
  "strategicRead": {
    "earnsMenuSpace": "",
    "menuWeaknessSolved": "",
    "guestOrderingPsychology": "",
    "profitPerception": "",
    "operationalRiskScore": 0,
    "signaturePotentialScore": 0
  },
  "hardScores": {
    "flavorOriginality": 0,
    "menuDifferentiation": 0,
    "operationalPracticality": 0,
    "premiumPerception": 0,
    "marginIntelligence": 0,
    "approvalReadiness": 0
  },
  "strategicFit": "",
  "menuConflictWarnings": [],
  "ingredientsMl": [
    {"amountMl": 50, "ingredient": "Aged grape brandy", "role": "base spirit"},
    {"amountMl": 15, "ingredient": "Fino sherry", "role": "saline/nutty bridge"},
    {"amountMl": 10, "ingredient": "preserved lemon cordial", "role": "sweetness and acid structure"},
    {"amountMl": 5, "ingredient": "sesame honey syrup", "role": "texture and umami sweetness"},
    {"amountMl": 2, "ingredient": "aromatic bitters", "role": "finish and bitterness"}
  ],
  "method": "",
  "glassware": "",
  "ice": "",
  "garnish": "",
  "prepNotes": "",
  "guestDescription": "",
  "bartenderScript": "",
  "balanceReasoning": "",
  "operationalReasoning": "",
  "costTier": "",
  "practicalityScore": 0,
  "complexityScore": 0,
  "riskNotes": [],
  "substitutions": [],
  "whyThisDeservesMenuSpace": ""
}`;
}

function summarizePreviousProposal(previousProposal = {}) {
  if (!previousProposal) return 'No previous proposal.'
  return [
    `Name: ${normalizeValue(previousProposal.name)}`,
    `Menu role: ${normalizeValue(previousProposal.menuRole)}`,
    `Concept: ${normalizeValue(previousProposal.conceptStory)}`,
    `Ingredients: ${(previousProposal.ingredients || []).slice(0, 10).join(' | ')}`,
    `Method: ${normalizeValue(previousProposal.method)}`,
    `Glassware / ice: ${normalizeValue(previousProposal.glassware)} / ${normalizeValue(previousProposal.ice)}`,
    `Garnish: ${normalizeValue(previousProposal.garnish)}`,
    `Guest description: ${normalizeValue(previousProposal.guestDescription)}`,
    `Cost note: ${normalizeValue(previousProposal.costMarginNote)}`,
    `Risks: ${(previousProposal.riskNotes || []).slice(0, 4).join(' | ')}`
  ].join('\n')
}

function compactResponseSchema() {
  return `{
  "directorConversationReply": "",
  "requestAssessment": {"strength": "", "critique": "", "recommendedDirection": ""},
  "cocktailName": "",
  "concept": "",
  "menuRole": "",
  "strategicRead": {
    "earnsMenuSpace": "",
    "menuWeaknessSolved": "",
    "guestOrderingPsychology": "",
    "profitPerception": "",
    "operationalRiskScore": 0,
    "signaturePotentialScore": 0
  },
  "hardScores": {
    "flavorOriginality": 0,
    "menuDifferentiation": 0,
    "operationalPracticality": 0,
    "premiumPerception": 0,
    "marginIntelligence": 0,
    "approvalReadiness": 0
  },
  "strategicFit": "",
  "menuConflictWarnings": [],
  "ingredientsMl": [
    {"amountMl": 50, "ingredient": "Aged grape brandy", "role": "base spirit"},
    {"amountMl": 15, "ingredient": "Fino sherry", "role": "saline/nutty bridge"},
    {"amountMl": 10, "ingredient": "preserved lemon cordial", "role": "sweetness and acid structure"},
    {"amountMl": 5, "ingredient": "sesame honey syrup", "role": "texture and umami sweetness"},
    {"amountMl": 2, "ingredient": "aromatic bitters", "role": "finish and bitterness"}
  ],
  "method": "",
  "glassware": "",
  "ice": "",
  "garnish": "",
  "prepNotes": "",
  "guestDescription": "",
  "bartenderScript": "",
  "balanceReasoning": "",
  "operationalReasoning": "",
  "costTier": "",
  "practicalityScore": 0,
  "complexityScore": 0,
  "riskNotes": [],
  "substitutions": [],
  "whyThisDeservesMenuSpace": ""
}`
}

function buildCompactRevisionPrompt({ agentPrompt, form, menuAnalysis, variation = '', previousProposal = null }) {
  const changeRequest = normalizeValue(variation || agentPrompt || 'Improve the previous proposal.')
  const menuGaps = menuAnalysis?.menuGapNotes?.slice(0, 5).join('; ') || 'None supplied'
  const menuWarnings = menuAnalysis?.warnings?.slice(0, 5).join('; ') || 'None supplied'

  return `HOSPIA COMPACT REVISION MODE.

You are HOSPIA Flavor Brain V2, acting as an elite Beverage Director.
This is a follow-up revision, not a first build.
Use the previous proposal as the baseline and apply only the manager change request.
Keep the answer premium, decisive, operationally realistic, and much shorter than a full first-generation reasoning pass.

Manager change request:
${changeRequest}

Previous proposal summary:
${summarizePreviousProposal(previousProposal)}

Essential menu signals:
- Approved cocktail count: ${menuAnalysis?.total ?? 0}
- Base spirit counts: ${JSON.stringify(menuAnalysis?.baseSpiritCounts || {})}
- Style counts: ${JSON.stringify(menuAnalysis?.styleCounts || {})}
- Menu gaps: ${menuGaps}
- Menu warnings: ${menuWarnings}

Optional current constraints, only if useful:
- Base Spirit: ${normalizeValue(form.baseSpirit || 'Any')}
- Flavor Profile: ${normalizeValue(form.flavorProfile || 'Any')}
- Service Context: ${normalizeValue(form.serviceContext || 'Signature')}
- Kosher Requirement: ${normalizeValue(form.kosherRequirement || 'No special requirement')}
- Prep Complexity: ${normalizeValue(form.complexity || 'Balanced')}
- Target Price: ${normalizeValue(form.targetPrice || 'N/A')}
- Target COGS: ${normalizeValue(form.targetCogs || 'N/A')}

Revision rules:
- Do not restate the whole consulting manifesto.
- Do not ask clarifying questions.
- Do not return a consultation-only response.
- Keep all proposal fields complete.
- ingredientsMl must remain complete objects with amountMl, ingredient, and role.
- Never return amount-only ingredient entries.
- If the change request is vague, make a professional assumption and include the critique inside requestAssessment and riskNotes.
- If lowering cost or complexity, protect premium perception.
- If changing flavor direction, preserve the menu role unless the manager explicitly asks to change it.
- Measurements must be in ml.
- Return strict JSON only. No markdown.

Required JSON shape:
${compactResponseSchema()}`;
}

function formatGeminiServiceError(data, fallbackMessage) {
  const raw = [
    data?.error,
    data?.message,
    data?.details,
    JSON.stringify(data || {})
  ].join(' ').toLowerCase()

  if (/quota|rate|429|resource_exhausted|too many requests|limit exceeded/.test(raw)) {
    return 'HOSPIA Flavor Agent is temporarily rate-limited. The proposal engine is protecting Gemini quota. Wait a moment, shorten the directive, or use a compact revision instead of a full rebuild.'
  }

  return fallbackMessage
}

function mapGeminiResponseToProposal(parsed, { agentPrompt, form, menuAnalysis }) {
  return {
    id: `cocktail-draft-${Date.now()}`,
    name: normalizeValue(parsed.cocktailName) || 'Unnamed Cocktail',
    directorConversationReply: normalizeValue(parsed.directorConversationReply),
    conceptStory: normalizeValue(parsed.concept),
    whyFitsMenu: normalizeValue(parsed.strategicFit),
    strategicSuggestion: normalizeValue(parsed.strategicFit),
    requestAssessment: parsed.requestAssessment || { strength: '', critique: '', recommendedDirection: '' },
    menuRole: normalizeValue(parsed.menuRole),
    strategicRead: parsed.strategicRead || normalizeStrategicRead({}),
    hardScores: parsed.hardScores || normalizeHardScores({}),
    operationalReasoning: normalizeValue(parsed.operationalReasoning),
    whyThisDeservesMenuSpace: normalizeValue(parsed.whyThisDeservesMenuSpace),
    menuConflictWarnings: Array.isArray(parsed.menuConflictWarnings) ? parsed.menuConflictWarnings : [],
    ingredientObjects: Array.isArray(parsed.ingredientsMl) ? parsed.ingredientsMl : [],
    ingredientsMl: Array.isArray(parsed.ingredientsMl) ? parsed.ingredientsMl : [],
    ingredients: Array.isArray(parsed.ingredientsMl) ? parsed.ingredientsMl.map(ingredientObjectToDisplay) : [],
    method: normalizeValue(parsed.method),
    glassware: normalizeValue(parsed.glassware),
    ice: normalizeValue(parsed.ice),
    garnish: normalizeValue(parsed.garnish),
    prepNotes: normalizeValue(parsed.prepNotes),
    serviceNote: normalizeValue(parsed.bartenderScript),
    guestDescription: normalizeValue(parsed.guestDescription),
    tasteBalanceExplanation: normalizeValue(parsed.balanceReasoning),
    costMarginNote: normalizeValue(parsed.costTier),
    practicalityScore: Number(parsed.practicalityScore) || 0,
    complexityScore: Number(parsed.complexityScore) || 0,
    riskNotes: Array.isArray(parsed.riskNotes) ? parsed.riskNotes.map(item => String(item)) : [],
    substitutions: Array.isArray(parsed.substitutions) ? parsed.substitutions.map(item => String(item)) : [],
    reasoning: {
      menuGap: parsed.strategicRead?.menuWeaknessSolved || menuAnalysis?.menuGapNotes?.[0] || 'No explicit menu gap provided.',
      conflictDetected: Array.isArray(parsed.menuConflictWarnings) && parsed.menuConflictWarnings.length ? parsed.menuConflictWarnings.join('; ') : 'No conflict detected.',
      flavorLogic: normalizeValue(parsed.balanceReasoning) || `Designed from the manager prompt and beverage director constraints.`,
      executionPracticality: normalizeValue(parsed.operationalReasoning) || `Built to respect service context and menu balance.`,
      guestPositioning: parsed.strategicRead?.guestOrderingPsychology || `Guest-facing story is anchored on the requested profile and approved menu fit.`
    },
    targetPrice: Number(form.targetPrice) || null,
    targetCogs: Number(form.targetCogs) || null,
    agentPrompt: agentPrompt,
    created_at: new Date().toISOString()
  };
}

function buildDirectorConsultationPrompt({ agentPrompt, form, approvedCocktails, cocktailDrafts, menuAnalysis, conversationHistory = [], previousProposal = null }) {
  const approvedList = summarizeCocktails(approvedCocktails)
  const draftList = summarizeCocktails(cocktailDrafts)
  const menuEngineering = analyzeMenuEngineering(approvedCocktails)
  const requestCritique = critiqueManagerRequest(agentPrompt, form, menuEngineering)
  const conversation = conversationHistory.length
    ? conversationHistory.map(item => `${item.role === 'agent' ? 'Director' : 'Manager'}: ${normalizeValue(item.text)}`).join('\n')
    : 'No previous thread.'
  const previousSummary = previousProposal ? `Previous proposal:
- Name: ${normalizeValue(previousProposal.name)}
- Menu role: ${normalizeValue(previousProposal.menuRole)}
- Ingredients: ${(previousProposal.ingredients || []).join(' | ')}
- Guest description: ${normalizeValue(previousProposal.guestDescription)}
- Director logic: ${normalizeValue(previousProposal.operationalReasoning || previousProposal.whyThisDeservesMenuSpace)}` : 'No previous proposal.'

  return `You are running PRE-GENERATION CONSULTATION MODE for HOSPIA Cocktail Lab.

Your job is to decide whether a serious beverage director would build immediately or stop the meeting to sharpen the brief.

Current manager prompt:
${agentPrompt.trim()}

Conversation thread:
${conversation}

${previousSummary}

Optional structured constraints:
- Base Spirit: ${normalizeValue(form.baseSpirit || 'Any')}
- Secondary Spirit / Liqueur: ${normalizeValue(form.secondarySpirit || 'None')}
- Flavor Profile: ${normalizeValue(form.flavorProfile || 'None')}
- Notes: ${normalizeValue(form.notes || 'None')}
- Seasonality: ${normalizeValue(form.seasonality || 'Any')}
- Service Context: ${normalizeValue(form.serviceContext || 'Signature')}
- Kosher Requirement: ${normalizeValue(form.kosherRequirement || 'No special requirement')}
- Preparation Complexity: ${normalizeValue(form.complexity || 'Balanced')}
- Batchability: ${normalizeValue(form.batchability || 'Standard')}
- Shelf-Life Consideration: ${normalizeValue(form.shelfLife || 'Standard')}
- Glassware preference: ${normalizeValue(form.glassware || 'Any')}
- Garnish vision: ${normalizeValue(form.garnish || 'Any')}

Current approved menu:
${approvedList.join('\n')}

Current drafts:
${draftList.join('\n')}

Menu intelligence:
- Total approved cocktails: ${menuAnalysis?.total ?? 0}
- Base spirit counts: ${JSON.stringify(menuEngineering.baseSpiritCounts)}
- Style counts: ${JSON.stringify(menuEngineering.styleCounts)}
- Flavor profile counts: ${JSON.stringify(menuEngineering.flavorProfileCounts)}
- High complexity count: ${menuEngineering.highComplexityCount}
- Citrus usage count: ${menuEngineering.citrusUsageCount}
- Missing gaps: ${menuEngineering.missingGaps.join('; ') || 'None'}
- Warnings: ${(menuAnalysis?.warnings || menuEngineering.warnings || []).join('; ') || 'None'}

Request critique:
- Strength: ${requestCritique.strength}
- Critique: ${requestCritique.critique}
- Recommended direction: ${requestCritique.recommendedDirection}

Decision rules:
- Return action "consult" if the prompt is too broad, too vague, internally contradictory, operationally naive, strategically weak, or missing the choice a premium consultant would ask for.
- Return action "build" only when the request is specific enough to create an elite, menu-worthy, operationally plausible cocktail.
- If the manager is clearly answering your last consultation question, usually return "build" unless the answer remains too vague.
- If action is "consult", do not include a cocktail recipe. Ask 1-3 sharper options or guidance points.
- If action is "build", keep consultationReply short and decisive: explain why the direction is now build-ready.

Tone:
- Executive, confident, premium, direct.
- More "This direction is commercially stronger" than "Here is a proposal."
- Do not be rude. Do not be generic.

${BEVERAGE_DIRECTOR_SYSTEM_PROMPT}

Return strict JSON only:
{
  "action": "consult",
  "readinessScore": 0,
  "requestQuality": "weak",
  "consultationReply": "",
  "strategicOptions": [],
  "missingInformation": [],
  "recommendedNextPrompt": ""
}`;
}

function normalizeConsultationDecision(parsed) {
  const action = normalizeText(parsed.action) === 'build' ? 'build' : 'consult'
  return {
    action,
    readinessScore: normalizeScore(parsed.readinessScore || parsed.readiness_score),
    requestQuality: normalizeValue(parsed.requestQuality || parsed.request_quality || (action === 'build' ? 'build-ready' : 'needs sharpening')),
    consultationReply: normalizeValue(parsed.consultationReply || parsed.consultation_reply || parsed.reply),
    strategicOptions: formatProposalList(parsed.strategicOptions || parsed.strategic_options),
    missingInformation: formatProposalList(parsed.missingInformation || parsed.missing_information),
    recommendedNextPrompt: normalizeValue(parsed.recommendedNextPrompt || parsed.recommended_next_prompt)
  }
}

export async function consultGeminiCocktailDirection({ agentPrompt, form, approvedCocktails, cocktailDrafts, menuAnalysis, conversationHistory = [], previousProposal = null }) {
  const key = import.meta.env?.VITE_GEMINI_API_KEY
  if (!key || key === 'PASTE_KEY_HERE') {
    throw new Error('AI connection not configured.')
  }

  const prompt = buildDirectorConsultationPrompt({ agentPrompt, form, approvedCocktails, cocktailDrafts, menuAnalysis, conversationHistory, previousProposal })

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(formatGeminiServiceError(data, 'HOSPIA could not complete the Beverage Director consultation. Please shorten the brief and try again.'))
  }

  const rawText = getResponseText(data.answer || data)
  const parsed = parseStrictJson(rawText)
  return normalizeConsultationDecision(parsed)
}

export async function generateGeminiCocktailProposal({ agentPrompt, form, approvedCocktails, cocktailDrafts, menuAnalysis, variation = '', previousProposal = null }) {
  const key = import.meta.env?.VITE_GEMINI_API_KEY;
  if (!key || key === 'PASTE_KEY_HERE') {
    throw new Error('AI connection not configured.');
  }

  const isCompactRevision = Boolean(previousProposal && (variation || agentPrompt));
  const prompt = isCompactRevision
    ? buildCompactRevisionPrompt({ agentPrompt, form, menuAnalysis, variation, previousProposal })
    : buildCocktailPrompt({ agentPrompt, form, approvedCocktails, cocktailDrafts, menuAnalysis, variation, previousProposal });

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(formatGeminiServiceError(data, 'HOSPIA could not complete the beverage proposal. Please try a shorter directive or retry in a moment.'));
  }

  const rawText = getResponseText(data.answer || data);
  const parsed = parseStrictJson(rawText);
  const proposalPayload = ensureFullProposalPayload(parsed, { agentPrompt, form, menuAnalysis });
  const normalized = normalizeCocktailProposal(proposalPayload);
  validateResponseSchema(normalized);

  return mapGeminiResponseToProposal(normalized, { agentPrompt, form, menuAnalysis });
}

