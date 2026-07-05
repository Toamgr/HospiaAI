// Contract tests for the Cocktail Lab generation service.
//
// These lock the behavior fixed in the AI-authorization bug: a failed AI request must
// THROW a classified error and must NEVER fabricate a fallback draft. The only path to
// a non-AI draft is the explicit requestManualCocktailDraft(). The provider-agnostic
// task service (generateCocktailProposal) is mocked so no network/provider is touched.

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { generateCocktailProposal } = vi.hoisted(() => ({
  generateCocktailProposal: vi.fn(),
}))
vi.mock('./ai/cocktailProposalAgent.js', () => ({ generateCocktailProposal }))

import {
  requestCocktailProposal,
  requestManualCocktailDraft,
  COCKTAIL_ERROR_KIND,
} from './cocktailService.js'

const GOOD_PROMPT = 'A savory tequila highball with preserved lime and saline'

function completeProposal() {
  return {
    name: 'Test Signature',
    method: 'Shake with hard ice and fine strain.',
    glassware: 'Coupe',
    garnish: 'Lemon twist',
    ingredientsMl: [
      { amountMl: 45, ingredient: 'Blanco tequila', role: 'base' },
      { amountMl: 20, ingredient: 'fino sherry', role: 'bridge' },
      { amountMl: 15, ingredient: 'preserved lime cordial', role: 'acid' },
    ],
  }
}

// The task service resolves to { proposal, metadata }.
function taskResult(proposal, metadata = {}) {
  return {
    proposal,
    metadata: { provider: 'gemini', task: 'cocktail_proposal', source: 'ai_provider', repaired: false, ...metadata },
  }
}

beforeEach(() => {
  generateCocktailProposal.mockReset()
})

describe('requestCocktailProposal — success', () => {
  it('returns a real AI proposal when generation succeeds', async () => {
    generateCocktailProposal.mockResolvedValue(taskResult(completeProposal()))
    const result = await requestCocktailProposal({ agentPrompt: GOOD_PROMPT })
    expect(result.source).toBe('gemini')
    expect(result.proposal.name).toBe('Test Signature')
  })

  it('passes through internal provider metadata (provider/task/source/repaired)', async () => {
    generateCocktailProposal.mockResolvedValue(taskResult(completeProposal(), { repaired: true }))
    const result = await requestCocktailProposal({ agentPrompt: GOOD_PROMPT })
    expect(result.metadata).toMatchObject({
      provider: 'gemini',
      task: 'cocktail_proposal',
      source: 'ai_provider',
      repaired: true,
    })
  })
})

describe('requestCocktailProposal — failures never fabricate a draft', () => {
  it('throws an AUTHORIZATION error (not a fallback) on a 403', async () => {
    const err = new Error('Forbidden.')
    err.status = 403
    generateCocktailProposal.mockRejectedValue(err)

    const p = requestCocktailProposal({ agentPrompt: GOOD_PROMPT })
    await expect(p).rejects.toMatchObject({ kind: COCKTAIL_ERROR_KIND.AUTHORIZATION, status: 403 })
    // The message must be an honest authorization/config error, NOT "AI unavailable".
    await expect(p).rejects.toThrow(/No draft was created/i)
    await expect(p).rejects.not.toThrow(/AI was unavailable/i)
  })

  it('throws an AUTHORIZATION error on a 401', async () => {
    const err = new Error('Authorization required.')
    err.status = 401
    generateCocktailProposal.mockRejectedValue(err)
    await expect(requestCocktailProposal({ agentPrompt: GOOD_PROMPT }))
      .rejects.toMatchObject({ kind: COCKTAIL_ERROR_KIND.AUTHORIZATION, status: 401 })
  })

  it('throws a PROVIDER error on a 500 provider/model failure', async () => {
    const err = new Error('Gemini request failed.')
    err.status = 500
    generateCocktailProposal.mockRejectedValue(err)
    await expect(requestCocktailProposal({ agentPrompt: GOOD_PROMPT }))
      .rejects.toMatchObject({ kind: COCKTAIL_ERROR_KIND.PROVIDER })
  })

  it('throws a PROVIDER error when the AI returns an incomplete proposal', async () => {
    generateCocktailProposal.mockResolvedValue(taskResult({ name: 'Half a drink' })) // no ingredients/method
    await expect(requestCocktailProposal({ agentPrompt: GOOD_PROMPT }))
      .rejects.toMatchObject({ kind: COCKTAIL_ERROR_KIND.PROVIDER })
  })

  it('never returns source:"fallback" — that contract is removed', async () => {
    const err = new Error('Forbidden.'); err.status = 403
    generateCocktailProposal.mockRejectedValue(err)
    let caught = null
    try { await requestCocktailProposal({ agentPrompt: GOOD_PROMPT }) } catch (e) { caught = e }
    expect(caught).toBeTruthy()
    // It threw — no object with a fabricated proposal was ever returned.
  })
})

describe('requestCocktailProposal — validation', () => {
  it('throws a VALIDATION error for an empty brief without calling the provider', async () => {
    await expect(requestCocktailProposal({ agentPrompt: '' }))
      .rejects.toMatchObject({ kind: COCKTAIL_ERROR_KIND.VALIDATION })
    expect(generateCocktailProposal).not.toHaveBeenCalled()
  })

  it('throws a VALIDATION error for a too-short brief', async () => {
    await expect(requestCocktailProposal({ agentPrompt: 'gin' }))
      .rejects.toMatchObject({ kind: COCKTAIL_ERROR_KIND.VALIDATION })
    expect(generateCocktailProposal).not.toHaveBeenCalled()
  })
})

describe('requestManualCocktailDraft — explicit opt-in only', () => {
  it('returns a clearly marked manual draft when the user explicitly requests one', () => {
    const result = requestManualCocktailDraft({ agentPrompt: GOOD_PROMPT })
    expect(result.source).toBe('manual')
    expect(result.manualDraft).toBe(true)
    expect(result.proposal.fallbackGenerated).toBe(true)
    // It does not touch the AI provider at all.
    expect(generateCocktailProposal).not.toHaveBeenCalled()
  })

  it('still validates the brief', () => {
    expect(() => requestManualCocktailDraft({ agentPrompt: '' }))
      .toThrow()
  })
})
