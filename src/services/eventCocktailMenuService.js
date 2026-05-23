import { BEVERAGE_DIRECTOR_SYSTEM_PROMPT } from '../prompts/geminiCocktailPrompts.js'
import { buildKnowledgeContext } from '../domain/hospitality/bar/cocktailKnowledgeBase/index.js'
import { getPricingContextSummary, buildCostSheet } from '../domain/hospitality/bar/cocktailLabPricingAdapter.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const EVENT_TYPE_LABELS = {
  wedding: 'Wedding', corporate: 'Corporate Event', private: 'Private Party',
  bar_event: 'Bar Event', other: 'Event',
}

const PRICING_SIGNAL_RE = /cost|price|budget|cheap|expensive|afford|margin|₪|\bnis\b/i

const FLAVOR_TO_SPIRIT_HINT = {
  Citrus: ['gin', 'vodka', 'tequila'],
  Floral: ['gin', 'elderflower'],
  Tropical: ['rum', 'tequila'],
  Herbal: ['gin', 'vermouth'],
  Spicy: ['tequila', 'mezcal'],
  Smoky: ['mezcal', 'whisky'],
  Sweet: ['rum', 'liqueur'],
  Bitter: ['campari', 'aperol'],
}

function inferEventPricingHints(flavors = []) {
  const hints = new Set()
  for (const f of flavors) for (const h of (FLAVOR_TO_SPIRIT_HINT[f] || [])) hints.add(h)
  return [...hints]
}

// ─── AI response helpers ──────────────────────────────────────────────────────
// These are local equivalents of the internal helpers in geminiCocktailAgent.js,
// which are not exported. Kept intentionally minimal for the event context.

function stripMarkdownFences(text = '') {
  return text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim()
}

function extractJsonSubstring(text) {
  const start = text.search(/[{[]/)
  if (start === -1) return null
  const opener = text[start]
  const closer = opener === '{' ? '}' : ']'
  let depth = 0, inString = false, escape = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === opener) depth++
    else if (ch === closer && --depth === 0) return text.slice(start, i + 1)
  }
  return null
}

function repairJson(text) {
  return text
    .replace(/,(\s*[}\]])/g, '$1')           // trailing commas
    .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":') // unquoted keys
}

function parseStrictJson(raw) {
  const cleaned = stripMarkdownFences(String(raw || ''))

  // 1. Try parsing the whole cleaned response (json_mode returns raw JSON)
  try { return JSON.parse(cleaned) } catch {}

  // 2. Extract the outermost JSON structure and try again
  const jsonStr = extractJsonSubstring(cleaned)
  if (!jsonStr) throw new Error('AI response was not valid JSON.')

  try { return JSON.parse(jsonStr) } catch {}

  // 3. Repair common LLM JSON issues (trailing commas, unquoted keys) and retry
  try { return JSON.parse(repairJson(jsonStr)) } catch {}

  throw new Error('AI response could not be parsed as JSON.')
}

function getResponseText(data) {
  if (!data) return ''
  if (typeof data.answer === 'string') return data.answer
  if (typeof data === 'string') return data
  if (Array.isArray(data.candidates) && data.candidates.length) {
    const c = data.candidates[0]
    if (Array.isArray(c.content)) return c.content.map(p => p?.text || '').join('\n')
    return c.content?.parts?.map(p => p.text || '').join('\n') || ''
  }
  return ''
}

function formatServiceError(data, fallbackMessage) {
  const raw = [data?.error, data?.message, data?.details, JSON.stringify(data || {})].join(' ').toLowerCase()
  if (/quota|rate|429|resource_exhausted|too many requests|limit exceeded/.test(raw)) {
    return 'HESTIA AI is temporarily rate-limited. Wait a moment and try again, or reduce the number of cocktails.'
  }
  return fallbackMessage
}

// ─── Cost helpers ─────────────────────────────────────────────────────────────
// Computes cost from the trusted pricing adapter — never from AI-generated values.
// Event cocktails use {name, amount_ml, unit} shape; buildCostSheet expects {ingredient, amountMl}.

const UNAVAILABLE_COST = {
  cost_status: 'unavailable',
  confidence_level: 'unknown',
  suggested: null,
  luxury: null,
  total_cost_nis: null,
  missing_data_warnings: [],
}

function mapIngredientsToCostFormat(ingredients = []) {
  return ingredients
    .filter(i => i && i.name && Number(i.amount_ml) > 0)
    .map(i => ({ ingredient: i.name, amountMl: Number(i.amount_ml) }))
}

export function computeEventCocktailCost(cocktail) {
  const mapped = mapIngredientsToCostFormat(cocktail.ingredients || [])
  if (!mapped.length) return UNAVAILABLE_COST
  const sheet = buildCostSheet(mapped)
  return {
    cost_status: sheet.cost_status,
    confidence_level: sheet.confidence_level,
    suggested: sheet.suggested,
    luxury: sheet.luxury,
    total_cost_nis: sheet.totalCost,
    missing_data_warnings: sheet.missing_data_warnings,
  }
}

export function enrichCocktailsWithCost(cocktails = []) {
  return cocktails.map(c => ({ ...c, _cost: computeEventCocktailCost(c) }))
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildEventMenuPrompt({ event, form, knowledgeContext, pricingContext }) {
  const eventType = EVENT_TYPE_LABELS[event.event_type] || event.event_type || 'Event'
  const guestCount = event.expected_guests
  const flavorStr = form.flavors.length ? form.flavors.join(', ') : 'No strong preference'
  const restrictionStr = form.restrictions.length ? form.restrictions.join(', ') : 'None'
  const isHighVolume = guestCount >= 50
  const isKosher = form.restrictions.includes('Kosher')
  const hasLowABV = form.restrictions.includes('Low ABV') || form.restrictions.includes('Alcohol-Free Option')

  const parts = [
    BEVERAGE_DIRECTOR_SYSTEM_PROMPT,
    '',
    'EVENT COCKTAIL MENU GENERATION',
    'Design a complete event cocktail menu. Think across: flavor balance and differentiation, batchability, service speed, guest diversity, perceived value, and zero-proof inclusion where needed. Do not produce generic or repetitive menus.',
    'Return strict JSON only — no markdown, no code blocks.',
    '',
    knowledgeContext || null,
    knowledgeContext ? '' : null,
    pricingContext || null,
    pricingContext ? '' : null,
    `Event: "${event.name}"`,
    `Event type: ${eventType}`,
    guestCount ? `Guest count: ${guestCount}` : null,
    `REQUIRED — Cocktails to generate: ${form.cocktailCount}. The "cocktails" array MUST contain exactly ${form.cocktailCount} item${form.cocktailCount !== 1 ? 's' : ''} — no fewer, no more.`,
    `Flavor profile: ${flavorStr}`,
    `Dietary restrictions / requirements: ${restrictionStr}`,
    `Event vibe: ${form.vibe || 'Not specified'}`,
    `Special notes: ${form.notes || 'None'}`,
    '',
    isHighVolume ? `HIGH-VOLUME SERVICE (${guestCount} guests): prioritize batchability, build time under 30 seconds per cocktail, pre-batch all non-citrus components, garnish must be pre-portionable. No fragile prep.` : null,
    isHighVolume ? '' : null,
    isKosher ? 'KOSHER REQUIRED: avoid wine-based vermouth/sherry unless kosher-certified, avoid cream liqueurs unless kosher-certified dairy, confirm bitters certification with supervising authority.' : null,
    isKosher ? '' : null,
    hasLowABV ? 'INCLUDE LOW-ABV / ZERO-PROOF: design at least one genuine low-ABV or zero-proof option with the same creativity as full-ABV cocktails. Use sherry, vermouth, fortified wine, or a split base. Do not use the word "mocktail".' : null,
    hasLowABV ? '' : null,
    'For liquid_color_hex use the dominant ingredient: Campari=#E8272A, Aperol=#FF6B35, Blue Curacao=#0096FF, Midori=#4CAF50, Espresso/Coffee=#2C1A0E, Rum=#C8860A, Whiskey/Bourbon=#B5651D, Gin/Vodka/Tequila=#F5F5DC, Red wine=#722F37, Rosé=#FFB7C5, White wine/Prosecco/Champagne=#F0E68C.',
    '',
    'Do not include cost estimates in the response — costing is computed separately by the venue system from verified ingredient data.',
    `Return ONLY valid JSON with exactly ${form.cocktailCount} cocktail${form.cocktailCount !== 1 ? 's' : ''} in the array:`,
    `{
  "menu_name": "creative name for this cocktail menu",
  "cocktails": [
    {
      "number": 1,
      "name": "cocktail name",
      "tagline": "one evocative sentence",
      "base_spirit": "main spirit",
      "ingredients": [{ "name": "ingredient name", "amount_ml": 45, "unit": "ml" }],
      "method": "shaken or stirred or built or blended",
      "garnish": "garnish description",
      "glassware": "e.g. Coupe, Rocks, Highball, Nick & Nora, Collins, Shot",
      "flavor_map": { "sweet": 5, "sour": 6, "bitter": 3, "salty": 1, "smoky": 0, "spicy": 0, "creamy": 1, "savory": 0 },
      "flavor_notes": "2-3 flavor descriptors",
      "allergen_notes": "any allergen info or null",
      "liquid_color_hex": "#F5A623",
      "batch_notes": "e.g. Pre-batch base + syrup, add citrus and shake per order — ~20 sec build",
      "service_speed": "fast",
      "operational_difficulty": 2,
      "why_fits_event": "brief note on why this suits the event format",
      "zero_proof_alternative": "suggested NA version or null"
    }
  ]
}`,
  ]

  return parts.filter(p => p !== null).join('\n')
}

// ─── Replacement validation helpers ──────────────────────────────────────────

const SPIRIT_KEYWORDS = [
  'gin', 'vodka', 'rum', 'tequila', 'mezcal', 'whiskey', 'whisky', 'bourbon',
  'rye', 'scotch', 'cognac', 'brandy', 'pisco', 'amaro', 'aperol', 'campari',
  'liqueur', 'vermouth',
]

function extractMentionedSpirit(instruction) {
  const lower = (instruction || '').toLowerCase()
  return SPIRIT_KEYWORDS.find(s => lower.includes(s)) || null
}

function validateReplacement(parsed, replaceInstruction) {
  const mentionedSpirit = extractMentionedSpirit(replaceInstruction)
  if (!mentionedSpirit) return null
  const baseSpirit = (parsed.base_spirit || '').toLowerCase()
  const ingNames = (parsed.ingredients || []).map(i => (i && i.name || '').toLowerCase()).join(' ')
  if (!baseSpirit.includes(mentionedSpirit) && !ingNames.includes(mentionedSpirit)) {
    return `Replacement must use "${mentionedSpirit}" as instructed (user said: "${replaceInstruction}") but the returned base_spirit is "${parsed.base_spirit}".`
  }
  return null
}

function buildReplacementPrompt({ event, cocktail, index, otherNames, replaceInstruction, flavorStr, knowledgeContext }) {
  const eventType = EVENT_TYPE_LABELS[event.event_type] || event.event_type || 'Event'
  const guestCount = event.expected_guests
  const isHighVolume = guestCount >= 50

  const originalIngredients = (cocktail.ingredients || [])
    .map(i => {
      if (!i) return ''
      const name = typeof i === 'object' ? (i.name || '') : String(i)
      const amt = typeof i === 'object' && i.amount_ml != null ? ` ${i.amount_ml}ml` : ''
      return name + amt
    })
    .filter(Boolean)
    .join(', ')

  const mentionedSpirit = extractMentionedSpirit(replaceInstruction)

  const parts = [
    BEVERAGE_DIRECTOR_SYSTEM_PROMPT,
    '',
    'SINGLE COCKTAIL REPLACEMENT MODE',
    'Replace one cocktail in an existing event cocktail menu. Design the replacement to be differentiated from existing menu cocktails, operationally practical, and suited to the event format.',
    '',
    `Event: "${event.name}" (${eventType}${guestCount ? `, ${guestCount} guests` : ''})`,
    `Cocktail being replaced: ${cocktail.name}${cocktail.base_spirit ? ` (base: ${cocktail.base_spirit})` : ''}`,
    originalIngredients ? `Original ingredients: ${originalIngredients}` : null,
    `Remaining menu: ${otherNames || 'none'}`,
    `Event flavor profile: ${flavorStr}`,
    '',
    '=== MANDATORY USER CHANGE REQUEST — OBEY THIS EXACTLY ===',
    `The user has specifically requested: "${replaceInstruction}"`,
    '=== RULES YOU MUST FOLLOW ===',
    mentionedSpirit
      ? `- BASE SPIRIT: The user specified "${mentionedSpirit}". The replacement MUST use "${mentionedSpirit}" as the base_spirit field and in its ingredients. Do not substitute a different spirit.`
      : null,
    '- If the user asks for "more complex", use more modifiers, bitters, layered flavor architecture, or advanced technique. The replacement must NOT be simpler than the original.',
    '- If the user asks for "simpler", use fewer ingredients and a clean, straightforward build.',
    '- If the user specifies a flavor direction (sweeter, more bitter, more citrus, smoky, herbal, spicy, lighter, etc.), the replacement must clearly reflect that direction.',
    '- Do NOT produce a generic replacement that ignores the user instruction.',
    '- The replacement must still suit the event format and feel differentiated from the remaining menu.',
    '',
    isHighVolume ? `HIGH-VOLUME: keep service speed under 30 seconds, minimal garnish complexity.` : null,
    isHighVolume ? '' : null,
    knowledgeContext || null,
    knowledgeContext ? '' : null,
    'Do not include cost estimates in the response — costing is computed separately by the venue system.',
    'Return ONLY a single cocktail JSON object, no markdown:',
    '',
    `{
  "number": ${index + 1},
  "name": "new cocktail name",
  "tagline": "one evocative sentence",
  "base_spirit": "main spirit",
  "ingredients": [{ "name": "ingredient name", "amount_ml": 45, "unit": "ml" }],
  "method": "shaken or stirred or built or blended",
  "garnish": "garnish description",
  "glassware": "e.g. Coupe, Rocks, Highball, Nick & Nora, Collins, Shot",
  "flavor_map": { "sweet": 5, "sour": 6, "bitter": 3, "salty": 1, "smoky": 0, "spicy": 0, "creamy": 1, "savory": 0 },
  "flavor_notes": "2-3 flavor descriptors",
  "allergen_notes": "any allergen info or null",
  "liquid_color_hex": "#F5A623",
  "batch_notes": null,
  "service_speed": "fast",
  "operational_difficulty": 2,
  "why_fits_event": null,
  "zero_proof_alternative": null
}`,
  ]

  return parts.filter(p => p !== null).join('\n')
}

// ─── Fallback generators ──────────────────────────────────────────────────────
// Used when Gemini is unavailable or returns invalid JSON.
// Fallbacks never include invented cost data.

const FALLBACK_SPIRIT_BY_FLAVOR = {
  Citrus: 'Blanco tequila', Floral: 'London dry gin', Tropical: 'Aged rum',
  Herbal: 'London dry gin', Spicy: 'Reposado tequila', Smoky: 'Espadin mezcal',
  Sweet: 'Aged rum', Bitter: 'Campari',
}

function buildFallbackEventMenu(form, event) {
  const spirit = form.flavors.length
    ? (FALLBACK_SPIRIT_BY_FLAVOR[form.flavors[0]] || 'London dry gin')
    : 'London dry gin'
  const eventLabel = EVENT_TYPE_LABELS[event.event_type] || 'Event'

  return {
    menu_name: `${eventLabel} Menu`,
    _fallback: true,
    _fallback_reason: 'HESTIA AI was unavailable. This is a placeholder draft — review, revise, and regenerate when the service recovers.',
    cocktails: [
      {
        number: 1,
        name: 'House Signature',
        tagline: 'A crowd-pleasing opener for the occasion.',
        base_spirit: spirit,
        ingredients: [
          { name: spirit, amount_ml: 45, unit: 'ml' },
          { name: 'Fresh lemon juice', amount_ml: 20, unit: 'ml' },
          { name: 'Simple syrup', amount_ml: 15, unit: 'ml' },
          { name: 'Egg white', amount_ml: 30, unit: 'ml' },
        ],
        method: 'Dry shake, then shake with ice. Fine strain into a chilled coupe.',
        garnish: 'Lemon twist',
        glassware: 'Coupe',
        flavor_map: { sweet: 5, sour: 6, bitter: 2, salty: 1, smoky: 0, spicy: 0, creamy: 3, savory: 0 },
        flavor_notes: 'Bright, citrus, smooth',
        allergen_notes: 'Contains egg white',
        liquid_color_hex: '#F5F5DC',
        batch_notes: 'Batch spirit and syrup ahead. Add citrus and egg white per order.',
        service_speed: 'fast',
        operational_difficulty: 2,
        why_fits_event: 'Approachable, batchable, and easy to explain to guests.',
        zero_proof_alternative: null,
        _fallback: true,
        _cost: UNAVAILABLE_COST,
      },
    ],
  }
}

function buildFallbackReplacement(index) {
  return {
    number: index + 1,
    name: 'Seasonal Reserve',
    tagline: 'A balanced crowd-pleaser for this position.',
    base_spirit: 'London dry gin',
    ingredients: [
      { name: 'London dry gin', amount_ml: 45, unit: 'ml' },
      { name: 'Elderflower cordial', amount_ml: 15, unit: 'ml' },
      { name: 'Fresh lemon juice', amount_ml: 20, unit: 'ml' },
      { name: 'Chilled soda water', amount_ml: 60, unit: 'ml' },
    ],
    method: 'Build over ice, stir gently, top with soda.',
    garnish: 'Lemon wheel and fresh mint',
    glassware: 'Highball',
    flavor_map: { sweet: 4, sour: 5, bitter: 2, salty: 0, smoky: 0, spicy: 0, creamy: 0, savory: 0 },
    flavor_notes: 'Floral, citrus, refreshing',
    allergen_notes: null,
    liquid_color_hex: '#F0F0E8',
    batch_notes: 'Pre-batch gin and elderflower. Add citrus and soda per order.',
    service_speed: 'fast',
    operational_difficulty: 1,
    why_fits_event: null,
    zero_proof_alternative: null,
    _fallback: true,
    _cost: UNAVAILABLE_COST,
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateMenuResponse(parsed, expectedCount) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI returned an unexpected format. Please try again.')
  }
  if (!Array.isArray(parsed.cocktails) || !parsed.cocktails.length) {
    throw new Error('AI returned no cocktails. Please try again.')
  }
  for (const c of parsed.cocktails) {
    if (!c.name) throw new Error('AI returned a cocktail with no name. Please try again.')
  }
  if (expectedCount != null && parsed.cocktails.length !== expectedCount) {
    throw new Error(`AI returned ${parsed.cocktails.length} cocktail${parsed.cocktails.length !== 1 ? 's' : ''} but ${expectedCount} were requested. Retrying.`)
  }
}

// ─── Exported service functions ───────────────────────────────────────────────

async function attemptMenuGeneration(prompt, expectedCount) {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, json_mode: true }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(formatServiceError(data, 'AI request failed. Please try again.'))
  const rawText = getResponseText(data)
  const parsed = parseStrictJson(rawText)
  validateMenuResponse(parsed, expectedCount)
  return parsed
}

export async function generateEventMenu({ event, form }) {
  const combinedText = [
    event.event_type || '', String(event.expected_guests || ''),
    ...form.flavors, ...form.restrictions,
    form.vibe || '', form.notes || '',
  ].join(' ')

  const knowledgeForm = {
    kosherRequirement: form.restrictions.includes('Kosher') ? 'kosher' : '',
    serviceContext: event.event_type,
  }
  const knowledgeContext = buildKnowledgeContext(combinedText, knowledgeForm)
  const pricingContext = PRICING_SIGNAL_RE.test(combinedText)
    ? getPricingContextSummary(inferEventPricingHints(form.flavors))
    : ''

  const prompt = buildEventMenuPrompt({ event, form, knowledgeContext, pricingContext })

  // Try up to 2 times before falling back to the placeholder menu.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const parsed = await attemptMenuGeneration(prompt, form.cocktailCount)
      return {
        menu: { ...parsed, cocktails: enrichCocktailsWithCost(parsed.cocktails) },
        isFallback: false,
        fallbackReason: null,
      }
    } catch (err) {
      const isLastAttempt = attempt === 2
      const isNetworkError = /request failed|rate.limit|quota/i.test(err.message || '')
      if (isLastAttempt || isNetworkError) {
        return {
          menu: buildFallbackEventMenu(form, event),
          isFallback: true,
          fallbackReason: err.message || 'AI generation failed.',
        }
      }
      // Wait briefly before retrying a parse failure
      await new Promise(r => setTimeout(r, 800))
    }
  }
}

export async function replaceEventCocktail({ event, menu, index, replaceInstruction, form }) {
  const cocktail = menu.cocktails[index]
  const otherNames = menu.cocktails.filter((_, i) => i !== index).map(c => c.name).join(', ')
  const flavorStr = form.flavors.length ? form.flavors.join(', ') : 'not specified'

  const replaceText = `event ${event.event_type || ''} ${replaceInstruction} ${flavorStr}`
  const knowledgeContext = buildKnowledgeContext(replaceText, { kosherRequirement: '' })

  const basePrompt = buildReplacementPrompt({
    event, cocktail, index, otherNames, replaceInstruction, flavorStr, knowledgeContext,
  })
  let currentPrompt = basePrompt

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPrompt, json_mode: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(formatServiceError(data, 'AI replacement request failed. Please try again.'))

      const rawText = getResponseText(data)
      const parsed = parseStrictJson(rawText)
      if (!parsed.name) throw new Error('AI returned an invalid replacement. Please try again.')

      const validationError = validateReplacement(parsed, replaceInstruction)
      if (validationError && attempt === 1) {
        currentPrompt = basePrompt + `\n\nCORRECTION REQUIRED: ${validationError} Fix this now — you MUST obey the user's change request.`
        throw new Error(validationError)
      }

      return {
        cocktail: { ...parsed, number: index + 1, _cost: computeEventCocktailCost(parsed) },
        isFallback: false,
        fallbackReason: null,
      }
    } catch (err) {
      const isLastAttempt = attempt === 2
      const isNetworkError = /request failed|rate.limit|quota/i.test(err.message || '')
      if (isLastAttempt || isNetworkError) {
        return {
          cocktail: buildFallbackReplacement(index),
          isFallback: true,
          fallbackReason: err.message || 'AI replacement failed.',
        }
      }
      await new Promise(r => setTimeout(r, 800))
    }
  }
}
