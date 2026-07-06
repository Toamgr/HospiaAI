// Static guard: the Cocktail Lab AI generation path must not reference the deprecated
// /api/gemini route. Transport goes exclusively through the provider-agnostic adapter,
// which targets /api/ai/cocktail-proposal. (The Events cocktail menu builder was migrated
// off /api/gemini too — see eventCocktailMenuService.js — so it is covered here as well.)

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8')

const COCKTAIL_PATH_FILES = [
  'src/features/bar/CocktailLabStudio.jsx',
  'src/services/cocktailService.js',
  'src/services/ai/cocktailProposalAgent.js',
  'src/services/ai/providers/geminiProvider.js',
  'src/services/geminiCocktailAgent.js',
  'src/services/eventCocktailMenuService.js',
]

describe('Cocktail Lab AI path — neutral route only', () => {
  it.each(COCKTAIL_PATH_FILES)('%s does not call /api/gemini', (rel) => {
    const src = read(rel)
    // Ignore comment references to the deprecated alias; assert no actual route usage.
    const withoutComments = src.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(withoutComments).not.toContain('/api/gemini')
  })

  it('the provider adapter targets the neutral /api/ai/cocktail-proposal route', () => {
    const src = read('src/services/ai/providers/geminiProvider.js')
    expect(src).toContain('/api/ai/cocktail-proposal')
  })

  it('eventCocktailMenuService.js targets the neutral /api/ai/cocktail-proposal route', () => {
    const src = read('src/services/eventCocktailMenuService.js')
    expect(src).toContain('/api/ai/cocktail-proposal')
  })
})
