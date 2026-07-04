// Provider-adapter tests. Prove the cocktail-proposal transport targets the neutral
// route (NOT /api/gemini) and that provider-shape text extraction works. The API client
// is mocked so no network is touched.

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { apiPost } = vi.hoisted(() => ({ apiPost: vi.fn() }))
vi.mock('../../api/client.js', () => ({ apiPost }))

import {
  requestCocktailCompletion,
  extractProviderText,
  COCKTAIL_PROPOSAL_ROUTE,
  GEMINI_PROVIDER_ID,
} from './geminiProvider.js'

beforeEach(() => { apiPost.mockReset() })

describe('requestCocktailCompletion — neutral route', () => {
  it('posts to /api/ai/cocktail-proposal, never /api/gemini', async () => {
    apiPost.mockResolvedValue({ answer: '{"cocktailName":"X"}', provider: 'gemini' })
    await requestCocktailCompletion({ prompt: 'build me a drink' })

    expect(COCKTAIL_PROPOSAL_ROUTE).toBe('/api/ai/cocktail-proposal')
    const [route, body] = apiPost.mock.calls[0]
    expect(route).toBe('/api/ai/cocktail-proposal')
    expect(route).not.toBe('/api/gemini')
    expect(body).toEqual({ prompt: 'build me a drink' })
  })

  it('forwards json_mode when requested', async () => {
    apiPost.mockResolvedValue({ answer: '{}' })
    await requestCocktailCompletion({ prompt: 'p', jsonMode: true })
    expect(apiPost.mock.calls[0][1]).toEqual({ prompt: 'p', json_mode: true })
  })

  it('returns extracted text and the reported provider', async () => {
    apiPost.mockResolvedValue({ answer: 'hello world', provider: 'gemini' })
    const { text, provider } = await requestCocktailCompletion({ prompt: 'p' })
    expect(text).toBe('hello world')
    expect(provider).toBe('gemini')
  })

  it('falls back to the adapter provider id when the backend omits it', async () => {
    apiPost.mockResolvedValue({ answer: 'x' })
    const { provider } = await requestCocktailCompletion({ prompt: 'p' })
    expect(provider).toBe(GEMINI_PROVIDER_ID)
  })

  it('propagates auth errors unchanged (so callers can classify them)', async () => {
    const err = new Error('Forbidden.'); err.status = 403
    apiPost.mockRejectedValue(err)
    await expect(requestCocktailCompletion({ prompt: 'p' })).rejects.toMatchObject({ status: 403 })
  })
})

describe('extractProviderText', () => {
  it('returns a plain string as-is', () => {
    expect(extractProviderText('raw text')).toBe('raw text')
  })

  it('reads OpenAI/Gemini-style candidates', () => {
    const body = { candidates: [{ content: { parts: [{ text: 'part-a' }, { text: 'part-b' }] } }] }
    expect(extractProviderText(body)).toBe('part-a\npart-b')
  })

  it('reads an { output: { text } } wrapper', () => {
    expect(extractProviderText({ output: { text: 'wrapped' } })).toBe('wrapped')
  })

  it('returns empty string for an unrecognized shape', () => {
    expect(extractProviderText({ nothing: true })).toBe('')
  })
})
