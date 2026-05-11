import { generateGeminiCocktailProposal } from './geminiCocktailAgent.js'

function includesAny(text, terms) {
  const source = String(text || '').toLowerCase()
  return terms.some(term => source.includes(term))
}

function inferBaseSpirit(prompt = '', form = {}) {
  const text = `${prompt} ${form.baseSpirit || ''}`.toLowerCase()
  if (includesAny(text, ['mezcal'])) return 'Mezcal'
  if (includesAny(text, ['tequila', 'agave'])) return 'Blanco tequila'
  if (includesAny(text, ['rum', 'tropical'])) return 'Aged rum'
  if (includesAny(text, ['whisky', 'whiskey', 'bourbon', 'rye'])) return 'Rye whisky'
  if (includesAny(text, ['brandy', 'cognac'])) return 'Cognac VSOP'
  if (includesAny(text, ['vodka'])) return 'Premium vodka'
  if (includesAny(text, ['low abv', 'spritz', 'aperitif', 'sherry', 'vermouth'])) return 'Fino sherry'
  return form.baseSpirit || 'London dry gin'
}

function inferStyle(prompt = '', variation = '') {
  const text = `${prompt} ${variation}`.toLowerCase()
  if (includesAny(text, ['bitter', 'amaro', 'aperitivo'])) return 'bitter aperitif'
  if (includesAny(text, ['refreshing', 'highball', 'long', 'summer', 'sunset'])) return 'refreshing highball'
  if (includesAny(text, ['premium', 'luxury', 'signature', 'award'])) return 'premium signature'
  if (includesAny(text, ['margin', 'cost', 'lower cost'])) return 'margin-disciplined signature'
  if (includesAny(text, ['event', 'wedding', 'batch'])) return 'batchable event serve'
  return 'balanced signature'
}

function estimateCostTier(baseSpirit, prompt = '') {
  const text = `${baseSpirit} ${prompt}`.toLowerCase()
  if (includesAny(text, ['mezcal', 'cognac', 'chartreuse', 'premium', 'luxury'])) return 'High'
  if (includesAny(text, ['vodka', 'gin', 'rum', 'sherry', 'batch', 'margin'])) return 'Medium'
  return 'Medium'
}

export function validateCocktailBrief(agentPrompt = '') {
  if (!String(agentPrompt || '').trim()) return 'Write a cocktail or menu brief before generating.'
  if (String(agentPrompt || '').trim().length < 10) return 'The brief is too short. Add a flavor direction, guest context, or service use.'
  return ''
}

function hasCompleteProposal(proposal) {
  if (!proposal || typeof proposal !== 'object') return false
  const ingredients = proposal.ingredientsMl || proposal.ingredientObjects || proposal.ingredients || []
  const hasCompleteIngredients = Array.isArray(ingredients) && ingredients.length >= 3 && ingredients.every(item => {
    if (typeof item === 'string') return /\d+\s*ml/i.test(item) && /[a-zA-Z]{3,}/.test(item.replace(/\d+\s*ml/gi, ''))
    if (!item || typeof item !== 'object') return false
    const amount = Number(item.amountMl ?? item.amount_ml ?? item.ml ?? item.amount)
    const ingredient = String(item.ingredient || item.ingredientName || item.name || item.label || '').trim()
    return Number.isFinite(amount) && amount > 0 && ingredient.length > 2
  })
  return Boolean(
    proposal.name &&
    hasCompleteIngredients &&
    proposal.method &&
    proposal.glassware &&
    proposal.garnish
  )
}

export function createFallbackCocktailProposal({ agentPrompt = '', form = {}, approvedCocktails = [], variation = '', previousProposal = null }) {
  const baseSpirit = inferBaseSpirit(agentPrompt, form)
  const style = inferStyle(agentPrompt, variation)
  const lowPrep = includesAny(`${agentPrompt} ${variation}`, ['low prep', 'lower prep', 'simple', 'fast', 'rush'])
  const bitter = includesAny(`${agentPrompt} ${variation}`, ['bitter', 'aperitif', 'amaro'])
  const refreshing = includesAny(`${agentPrompt} ${variation}`, ['fresh', 'refreshing', 'highball', 'summer'])
  const premium = includesAny(`${agentPrompt} ${variation}`, ['premium', 'luxury', 'award', 'signature'])
  const citrusAvoided = includesAny(agentPrompt, ['no citrus', 'remove citrus'])
  const acid = citrusAvoided ? { amountMl: 15, ingredient: 'verjus acid blend', role: 'acid structure without fresh citrus' } : { amountMl: 20, ingredient: 'fresh lemon and verjus blend', role: 'controlled acidity' }
  const modifier = bitter ? { amountMl: 15, ingredient: 'white vermouth and gentian aperitif', role: 'bitter aromatic bridge' }
    : refreshing ? { amountMl: 20, ingredient: 'clarified green apple cordial', role: 'fresh fruit lift' }
      : premium ? { amountMl: 12, ingredient: 'fino sherry', role: 'saline premium length' }
        : { amountMl: 15, ingredient: 'blanc vermouth', role: 'soft aromatic modifier' }
  const sweetener = lowPrep ? { amountMl: 10, ingredient: '2:1 house syrup', role: 'fast balance control' } : { amountMl: 10, ingredient: 'honey-herb syrup', role: 'texture and aromatic sweetness' }
  const garnish = form.garnish || (refreshing ? 'Expressed grapefruit peel and mint tip' : premium ? 'Expressed lemon coin and single herb leaf' : 'Clean citrus twist')
  const nameSeed = baseSpirit.split(' ')[0].replace(/[^A-Za-z]/g, '') || 'House'
  const name = previousProposal?.name && variation ? `${previousProposal.name} Reserve` : `${nameSeed} Meridian`
  const menuCount = approvedCocktails.length
  const ingredientsFormula = [
    { amountMl: 45, ingredient: baseSpirit, role: 'base spirit' },
    modifier,
    acid,
    sweetener,
    { amountMl: 2, ingredient: 'saline solution', role: 'length and flavor lift' }
  ]
  const ingredientLines = ingredientsFormula.map(item => `${item.amountMl} ml - ${item.ingredient}${item.role ? ` - ${item.role}` : ''}`)
  const hardScores = {
    flavorOriginality: 7.2,
    menuDifferentiation: 7,
    operationalPracticality: lowPrep ? 8.8 : 7.6,
    premiumPerception: premium ? 8.4 : 7.2,
    marginIntelligence: estimateCostTier(baseSpirit, agentPrompt) === 'High' ? 6.4 : 7.8,
    approvalReadiness: 7.2
  }

  return {
    id: `cocktail-fallback-${Date.now()}`,
    name,
    fallbackGenerated: true,
    status: 'generated',
    generated_at: new Date().toISOString(),
    baseSpirit,
    style,
    executivePositioning: `A ${style} built as a complete fallback proposal while the AI service is unavailable.`,
    conceptStory: `${name} translates the manager brief into a service-ready cocktail with clear structure, controlled prep, and enough premium tension to deserve a tasting round.`,
    concept: `${style} for ${form.serviceContext || 'bar menu'} service.`,
    directorAssessment: `Fallback mode used. The brief was interpreted conservatively to protect execution, margin, and training clarity. Approved menu currently contains ${menuCount} cocktails, so this route avoids becoming a generic sour unless citrus was explicitly useful.`,
    requestAssessment: `Assumption: ${agentPrompt}`,
    strategicCaution: 'Review this fallback recipe with a bartender before final approval. It is intentionally operational and complete, but it has not been generated by Gemini.',
    whyThisWorks: 'It gives the team a real tasting candidate instead of blocking the workflow when AI quota or connectivity fails.',
    whyThisDeservesMenuSpace: 'It is complete enough to cost, taste, train, revise, or reject.',
    whyFitsMenu: menuCount ? 'It can be compared against the existing approved menu before approval.' : 'It creates an initial approved-menu candidate.',
    ingredientsMl: ingredientsFormula,
    ingredientObjects: ingredientsFormula,
    ingredients: ingredientLines,
    method: refreshing ? 'Shake briefly with hard ice, fine strain over fresh ice, and top with chilled soda if a longer serve is desired.' : 'Shake hard with cubed ice, fine strain into the prepared glass, and garnish immediately.',
    glassware: form.glassware || (refreshing ? 'Chilled Collins glass' : 'Chilled coupe'),
    ice: refreshing ? 'Fresh Collins spear or hard cubed ice' : 'Served up; hard cubed ice for shaking',
    garnish,
    prepNotes: lowPrep ? 'Use existing house syrup and batch the non-citrus components before service.' : 'Prepare honey-herb syrup and acid blend before service; date-label any batch.',
    serviceNote: 'Bartenders should describe the drink by menu role first, then flavor: structured, aromatic, and balanced for the intended guest.',
    bartenderServiceNote: 'Build to spec, taste the first batch, and avoid over-garnishing. The fallback is meant to be fast to test.',
    guestDescription: `A polished ${style} with ${baseSpirit.toLowerCase()}, aromatic lift, controlled sweetness, and a clean finish.`,
    serviceScript: `If you want something ${refreshing ? 'bright and lifted' : 'elegant and structured'}, I would guide you toward ${name}.`,
    tasteBalanceExplanation: 'Base spirit carries identity, modifier adds direction, acid gives lift, sweetener rounds texture, and saline extends finish.',
    operationalReasoning: 'Complete formula, named ingredients, clear method, and simple garnish protect service repeatability.',
    costMarginNote: `Estimated cost tier: ${estimateCostTier(baseSpirit, agentPrompt)}. Target a premium price only if garnish and story are executed cleanly.`,
    estimatedCostTier: estimateCostTier(baseSpirit, agentPrompt),
    riskNotes: ['Fallback/demo output: taste before publishing.', lowPrep ? 'Low prep route may need more aromatic theatre.' : 'Prep must be date-labelled for consistency.'],
    substitutions: ['Swap blanc vermouth for dry vermouth for a drier profile.', 'Use verjus instead of fresh citrus when citrus removal is required.'],
    menuRole: style,
    idealGuestType: premium ? 'Premium explorer' : 'Confident mainstream guest',
    idealTimeOfDay: refreshing ? 'Aperitif or sunset service' : 'Dinner service',
    idealSeason: form.seasonality || 'All-season with garnish adjustment',
    salesStrategy: 'Position by guest mood and menu role, not ingredient list.',
    upsellPotential: premium ? 'High if served with confident story and restrained garnish.' : 'Moderate with strong staff language.',
    scoring: {
      flavorOriginality: 72,
      menuDifferentiation: 70,
      operationalPracticality: lowPrep ? 88 : 76,
      premiumPerception: premium ? 84 : 72,
      marginIntelligence: estimateCostTier(baseSpirit, agentPrompt) === 'High' ? 64 : 78,
      approvalReadiness: 72,
      guestAppeal: 78,
      menuFit: 74,
      marginStrength: estimateCostTier(baseSpirit, agentPrompt) === 'High' ? 62 : 80,
      signaturePotential: premium ? 82 : 72
    },
    hardScores,
    strategicRead: {
      earnsMenuSpace: 'It keeps the R&D workflow moving with a full, testable recipe while marking itself clearly as fallback output.',
      menuWeaknessSolved: 'Prevents AI outage from blocking menu development and preserves governance workflow.',
      guestOrderingPsychology: 'Simple positioning makes it easier for staff to sell without sounding technical.',
      profitPerception: 'Perceived value comes from name, serve discipline, aroma, and confidence rather than expensive ingredients.',
      operationalRiskScore: lowPrep ? 25 : 38,
      signaturePotentialScore: premium ? 82 : 72
    },
    practicalityScore: lowPrep ? 88 : 76,
    complexityScore: lowPrep ? 3 : 5,
    confidenceLabel: 'Fallback Demo',
    directorConversationReply: 'Gemini was unavailable, so HOSPIA generated a complete fallback tasting candidate. It is marked clearly and remains suitable for draft, review, approval, or rejection.'
  }
}

export async function requestCocktailProposal(payload) {
  const validationError = validateCocktailBrief(payload?.agentPrompt)
  if (validationError) throw new Error(validationError)

  try {
    const proposal = await generateGeminiCocktailProposal(payload)
    if (!hasCompleteProposal(proposal)) {
      throw new Error('Gemini returned an incomplete cocktail proposal.')
    }
    return { proposal, source: 'gemini' }
  } catch (error) {
    const proposal = createFallbackCocktailProposal(payload)
    return {
      proposal,
      source: 'fallback',
      error
    }
  }
}
