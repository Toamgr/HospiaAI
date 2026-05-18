// HESTIA Cocktail Knowledge Base
// Converts research modules into AI prompt context — only injects what is relevant.
// Each module is a compact distillation of world-class bar intelligence.

import { COCKTAIL_ARCHITECTURE, TASTE_BALANCE, FLAVOR_PAIRING, ADVANCED_TECHNIQUES } from './flavorScience.js'
import {
  BCG_MATRIX, PRICING_FORMULAS, MENU_SIZE, INGREDIENT_EFFICIENCY,
  FULL_COGS_FORMULA, INVENTORY_METRICS, MENU_ROLE_CLASSIFICATION, VENUE_ARCHITECTURE_MATRIX
} from './menuEngineering.js'
import { GUEST_DECISION_SCIENCE, DESCRIPTION_LANGUAGE, PSYCHOLOGICAL_PRICING, BARTENDER_AS_INTERFACE } from './menuPsychology.js'
import { DOMINANT_TRENDS, CLASSIC_REVIVAL_CYCLE } from './trendIntelligence.js'
import { RECIPE_STANDARDIZATION, PREP_SHELF_LIFE, WASTE_COST_CONTROL, BATCHING_FOR_EVENTS, TRAINING_STAGES } from './barOperations.js'
import { BAR_LEONE_MODEL, TWO_PHILOSOPHIES, TEN_LAWS } from './venuePhilosophy.js'
import { KOSHER_COCKTAIL_RULES, PASSOVER_KOSHER_RULES } from './kosherIntelligence.js'
import { CLASSICS_DATABASE } from './classicsDatabase.js'
import { ZERO_PROOF_DESIGN_PRINCIPLES, ZERO_PROOF_TOOLKIT, RESPONSIBLE_SERVICE } from './zeroProofIntelligence.js'
import { OPERATIONAL_FEASIBILITY_SCORING } from './operationalScoring.js'

function containsAny(text, terms) {
  const lower = text.toLowerCase()
  return terms.some(t => lower.includes(t))
}

function isKosherActive(form = {}) {
  const val = (form.kosherRequirement || '').trim().toLowerCase()
  return ['kosher', 'kosher required', 'required', 'yes', 'true'].includes(val)
}

function detectTopics(prompt = '', form = {}) {
  const text = `${prompt} ${form.flavorProfile || ''} ${form.serviceContext || ''} ${form.notes || ''}`.toLowerCase()
  return {
    flavorScience: containsAny(text, ['balance', 'flavor', 'sour', 'sweet', 'bitter', 'acid', 'umami', 'savory', 'smoky', 'bridge', 'texture', 'structure', 'technique', 'fat wash', 'clarif', 'sous vide', 'foam', 'carbonat', 'ferment']),
    flavorPairing: containsAny(text, ['pair', 'gin', 'mezcal', 'rum', 'tequila', 'whisky', 'whiskey', 'cognac', 'arak', 'combo', 'profile', 'contrast', 'harmony']),
    menuEngineering: containsAny(text, ['margin', 'cost', 'profit', 'pour cost', 'price', 'star', 'underperform', 'dog', 'puzzle', 'menu balance', 'ingredient efficiency', 'orphan']),
    menuPsychology: containsAny(text, ['description', 'guest', 'language', 'menu copy', 'story', 'sell', 'bartender', 'recommend', 'three question', 'upsell', 'how to describe']),
    trends: containsAny(text, ['trend', '2025', '2026', 'low abv', 'na ', 'non-alcoholic', 'zero proof', 'moderation', 'premiumiz', 'spritz', 'aperitivo', 'local', 'minimal', 'umami', 'savory', 'visual', 'tiktok', 'cosmopolitan', 'espresso martini', 'revival']),
    barOperations: containsAny(text, ['recipe', 'spec', 'bible', 'standardiz', 'shelf life', 'prep', 'batch', 'waste', 'training', 'staff', 'consistency']),
    eventBatching: containsAny(text, ['event', 'wedding', 'batch', 'volume', 'guests', 'reception', 'banquet', 'high volume', '100', '200', '300', 'fast service']),
    philosophy: containsAny(text, ['philosophy', 'soul', 'identity', 'leone', 'simplicity', 'experience', 'maximali', 'restraint', 'brand', 'who we are']),
    kosher: isKosherActive(form),
    pricingFormulas: containsAny(text, ['pour cost', 'cogs', 'target price', 'contribution margin', 'pricing formula', 'how to price', 'cost percentage']),
    advancedTech: containsAny(text, ['clarif', 'fat wash', 'sous vide', 'foam', 'carbonat', 'ferment', 'smoke', 'char', 'infus']),
    descriptionWriting: containsAny(text, ['write description', 'guest facing', 'menu copy', 'how to describe', 'sensory language']),
    classics: containsAny(text, ['margarita', 'negroni', 'old fashioned', 'espresso martini', 'mojito', 'daiquiri', 'manhattan', 'paloma', 'gimlet', 'french 75', 'penicillin', 'piña colada', 'pina colada', 'moscow mule', 'whiskey sour', 'boulevardier', 'paper plane', 'bloody mary', 'cosmopolitan', 'classic cocktail', 'classic recipe', 'riff on', 'variation of', 'modernize', 'update the recipe']),
    zeroProof: containsAny(text, ['zero proof', 'zero-proof', 'non-alcoholic', 'na drink', 'no abv', 'no-abv', 'alcohol-free', 'mocktail', 'sober', 'dry january', 'na menu', 'without alcohol']),
    operationalFeasibility: containsAny(text, ['feasibility', 'how hard', 'how difficult', 'can we make', 'rush hour', 'service speed', 'scale this', 'high volume prep', 'operational score', 'can the team', 'will this work']),
    passover: (form.kosherRequirement || '').toLowerCase().includes('passover') || text.includes('passover'),
    venueType: containsAny(text, ['small restaurant', 'cocktail bar', 'hotel bar', 'rooftop', 'beach bar', 'event venue', 'wedding venue', 'kosher restaurant', 'resort', 'desert resort']),
  }
}

/**
 * Builds a compact knowledge context string for injection into AI prompts.
 * Only includes modules relevant to the current manager prompt and form state.
 * Returns empty string if no relevant modules are detected.
 *
 * @param {string} prompt — manager's natural language prompt
 * @param {object} form — structured form inputs (kosherRequirement, serviceContext, etc.)
 * @returns {string} — formatted knowledge context block, or ''
 */
export function buildKnowledgeContext(prompt = '', form = {}) {
  const t = detectTopics(prompt, form)
  const sections = []

  if (t.flavorScience) {
    sections.push(COCKTAIL_ARCHITECTURE)
    sections.push(TASTE_BALANCE)
  }

  if (t.flavorPairing) {
    sections.push(FLAVOR_PAIRING)
  }

  if (t.advancedTech) {
    sections.push(ADVANCED_TECHNIQUES)
  }

  if (t.menuEngineering || t.pricingFormulas) {
    sections.push(BCG_MATRIX)
    sections.push(PRICING_FORMULAS)
    sections.push(FULL_COGS_FORMULA)
    sections.push(INGREDIENT_EFFICIENCY)
    sections.push(INVENTORY_METRICS)
  }

  if (t.menuEngineering) {
    sections.push(MENU_SIZE)
    sections.push(MENU_ROLE_CLASSIFICATION)
  }

  if (t.menuEngineering || t.venueType) {
    sections.push(VENUE_ARCHITECTURE_MATRIX)
  }

  if (t.menuPsychology || t.descriptionWriting) {
    sections.push(DESCRIPTION_LANGUAGE)
    sections.push(BARTENDER_AS_INTERFACE)
  }

  if (t.menuPsychology && t.pricingFormulas) {
    sections.push(PSYCHOLOGICAL_PRICING)
  }

  if (!t.menuPsychology && t.descriptionWriting) {
    sections.push(GUEST_DECISION_SCIENCE)
  }

  if (t.trends) {
    sections.push(DOMINANT_TRENDS)
    sections.push(CLASSIC_REVIVAL_CYCLE)
  }

  if (t.classics) {
    sections.push(CLASSICS_DATABASE)
  }

  if (t.zeroProof) {
    sections.push(ZERO_PROOF_DESIGN_PRINCIPLES)
    sections.push(ZERO_PROOF_TOOLKIT)
    sections.push(RESPONSIBLE_SERVICE)
  }

  if (t.operationalFeasibility) {
    sections.push(OPERATIONAL_FEASIBILITY_SCORING)
  }

  if (t.barOperations) {
    sections.push(RECIPE_STANDARDIZATION)
    sections.push(PREP_SHELF_LIFE)
    sections.push(WASTE_COST_CONTROL)
    sections.push(TRAINING_STAGES)
  }

  if (t.eventBatching) {
    sections.push(BATCHING_FOR_EVENTS)
  }

  if (t.philosophy) {
    sections.push(BAR_LEONE_MODEL)
    sections.push(TWO_PHILOSOPHIES)
    sections.push(TEN_LAWS)
  }

  // Kosher and Passover: only inject when explicitly flagged — never by default
  if (t.kosher) {
    sections.push(KOSHER_COCKTAIL_RULES)
  }

  if (t.passover) {
    sections.push(PASSOVER_KOSHER_RULES)
  }

  if (sections.length === 0) return ''

  return `Relevant knowledge context (world-class bar intelligence):\n${sections.join('\n\n')}`
}
