// Task-service tests for the cocktail_proposal task. The provider transport is mocked
// (returns raw completion text); the real cocktail domain helpers run, so this exercises
// the true parse/repair/normalize path and the metadata contract.

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { requestCocktailCompletion } = vi.hoisted(() => ({ requestCocktailCompletion: vi.fn() }))
vi.mock('./providers/geminiProvider.js', () => ({
  requestCocktailCompletion,
  GEMINI_PROVIDER_ID: 'gemini',
}))

import { generateCocktailProposal, COCKTAIL_PROPOSAL_TASK, AI_PROVIDER_SOURCE } from './cocktailProposalAgent.js'

const COMPLETE_JSON = JSON.stringify({
  cocktailName: 'Test Signature',
  concept: 'A savory highball concept with structure and lift.',
  menuRole: 'premium highball',
  requestAssessment: { strength: 'strong', critique: 'solid brief', recommendedDirection: 'proceed' },
  strategicRead: {
    earnsMenuSpace: 'fills the highball gap', menuWeaknessSolved: 'no long serves',
    guestOrderingPsychology: 'easy to sell', profitPerception: 'good',
    operationalRiskScore: 3, signaturePotentialScore: 8,
  },
  hardScores: {
    flavorOriginality: 8, menuDifferentiation: 8, operationalPracticality: 8,
    premiumPerception: 8, marginIntelligence: 7, approvalReadiness: 8,
  },
  ingredientsMl: [
    { amountMl: 45, ingredient: 'Blanco tequila', role: 'base' },
    { amountMl: 20, ingredient: 'fino sherry', role: 'bridge' },
    { amountMl: 15, ingredient: 'preserved lime cordial', role: 'acid' },
  ],
  method: 'Shake with hard ice and fine strain, then lengthen with soda.',
  glassware: 'Highball',
  ice: 'Cubed',
  garnish: 'Expressed lemon twist',
  prepNotes: 'Batch the cordial ahead of service.',
  guestDescription: 'A savory, structured highball.',
  bartenderScript: 'Sell it as savory-premium, not a novelty.',
})

const PAYLOAD = { agentPrompt: 'A savory tequila highball', form: {}, approvedCocktails: [], cocktailDrafts: [], menuAnalysis: null }

beforeEach(() => { requestCocktailCompletion.mockReset() })

describe('generateCocktailProposal — metadata contract', () => {
  it('returns provider/task/source metadata with repaired=false for a complete AI response', async () => {
    requestCocktailCompletion.mockResolvedValue({ text: COMPLETE_JSON, provider: 'gemini' })
    const { proposal, metadata } = await generateCocktailProposal(PAYLOAD)

    expect(proposal.name).toBe('Test Signature')
    expect(metadata).toEqual({
      provider: 'gemini',
      task: COCKTAIL_PROPOSAL_TASK,
      source: AI_PROVIDER_SOURCE,
      repaired: false,
    })
    expect(COCKTAIL_PROPOSAL_TASK).toBe('cocktail_proposal')
    expect(AI_PROVIDER_SOURCE).toBe('ai_provider')
  })

  it('marks repaired=true when the AI response was incomplete and had to be repaired', async () => {
    requestCocktailCompletion.mockResolvedValue({ text: JSON.stringify({ cocktailName: 'X', concept: 'y' }), provider: 'gemini' })
    const { metadata } = await generateCocktailProposal(PAYLOAD)
    expect(metadata.repaired).toBe(true)
    expect(metadata.task).toBe('cocktail_proposal')
    expect(metadata.source).toBe('ai_provider')
  })

  it('propagates provider errors (e.g. key failure surfaced as a rejected transport)', async () => {
    const err = new Error('AI generation is unavailable — the server API key is missing or invalid.')
    err.status = 500
    requestCocktailCompletion.mockRejectedValue(err)
    await expect(generateCocktailProposal(PAYLOAD)).rejects.toBe(err)
  })
})
