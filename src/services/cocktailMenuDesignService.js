// HESTIA Cocktail Menu Design Service v5.3
// Layer 1: Calls POST /api/ci/generate-menu-design — returns a design SPEC, not HTML.
// Layer 2: MenuRenderer.jsx converts the spec to DOM deterministically.
// preserveCocktails = true at all times.

import { apiPost } from './api/client'

function stripMarkdownFences(text = '') {
  return text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim()
}

function validateSpec(design, cocktailNames = []) {
  if (!design || typeof design !== 'object') {
    throw new Error('Menu design response is not a valid object.')
  }

  // Hard failure: banned currency strings anywhere in the spec
  const specStr = JSON.stringify(design)
  if (/\b(NIS|ILS|Shekels)\b/.test(specStr)) {
    throw new Error('Menu design validation failed: NIS/ILS/Shekels found in output.')
  }

  // Warn on thin anchor list
  if (!Array.isArray(design.designAnchors) || design.designAnchors.length < 3) {
    console.warn('[menu-design] Fewer than 3 design anchors. Identity may be weak.')
  }

  // Warn on missing cocktails in spec
  if (cocktailNames.length > 0 && Array.isArray(design.cocktails)) {
    const specNames = design.cocktails.map(c => c.name.toLowerCase())
    const missing   = cocktailNames.filter(n => !specNames.includes(n.toLowerCase()))
    if (missing.length > 0) {
      console.warn('[menu-design] Cocktails not found in spec:', missing)
    }
  }

  return design
}

/**
 * Generate a final design spec using HESTIA Cocktail Menu Skill v5.3.
 * The server fetches bar DNA and cocktails; applies HESTIA_COCKTAIL_MENU_SKILL
 * as the OpenAI system message; returns a pure JSON spec (no HTML).
 * MenuRenderer.jsx renders the spec deterministically in React.
 *
 * preserveCocktails is always true — the AI never invents or alters cocktails.
 */
export async function generateFinalCocktailMenuDesign({
  menuId,
  outputContext    = null,
  languageMode     = null,
  cocktailNames    = [],
  preserveCocktails = true,
}) {
  if (!menuId) throw new Error('menuId is required to generate a menu design.')

  const result = await apiPost('/api/ci/generate-menu-design', {
    menuId,
    outputContext,
    languageMode,
    preserveCocktails,
  })

  if (!result?.design) throw new Error('No design returned from the server.')

  let design = result.design
  if (typeof design === 'string') {
    try {
      design = JSON.parse(stripMarkdownFences(design))
    } catch {
      throw new Error('Menu design response could not be parsed as JSON.')
    }
  }

  return validateSpec(design, cocktailNames)
}
