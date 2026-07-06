// Contract tests for the Event Cocktail Menu generation service.
//
// These lock the behavior fixed alongside the Cocktail Lab AI-authorization bug (see
// cocktailService.test.js): a failed AI request must THROW a classified error and must
// NEVER fabricate a fallback menu/cocktail. There is no manual-draft opt-in for event
// menus, so failure must surface as an honest error with no output — never as a
// placeholder menu marked `_fallback: true`.
//
// apiPost (the only network/provider-touching call in this service) is mocked so no
// network, provider, or route is touched.

import { describe, it, expect, vi, beforeEach } from 'vitest'

const { apiPost } = vi.hoisted(() => ({ apiPost: vi.fn() }))
vi.mock('./api/client', () => ({ apiPost }))

import {
  generateEventMenu,
  replaceEventCocktail,
  EVENT_MENU_ERROR_KIND,
} from './eventCocktailMenuService.js'

const EVENT = { id: 'evt-1', name: 'Test Wedding', event_type: 'wedding', expected_guests: 40 }
const FORM = { cocktailCount: 2, flavors: ['Citrus'], restrictions: [], vibe: '', notes: '' }

function goodMenuResponse(count = 2) {
  return {
    answer: JSON.stringify({
      menu_name: 'Test Menu',
      cocktails: Array.from({ length: count }, (_, i) => ({
        number: i + 1,
        name: `Cocktail ${i + 1}`,
        base_spirit: 'Gin',
        ingredients: [{ name: 'Gin', amount_ml: 45, unit: 'ml' }],
      })),
    }),
  }
}

function goodReplacementResponse() {
  return {
    answer: JSON.stringify({
      name: 'Replacement Cocktail',
      base_spirit: 'Gin',
      ingredients: [{ name: 'Gin', amount_ml: 45, unit: 'ml' }],
    }),
  }
}

beforeEach(() => {
  apiPost.mockReset()
})

describe('generateEventMenu — success', () => {
  it('returns a real AI-generated menu when generation succeeds', async () => {
    apiPost.mockResolvedValue(goodMenuResponse(2))
    const result = await generateEventMenu({ event: EVENT, form: FORM })
    expect(result.menu.menu_name).toBe('Test Menu')
    expect(result.menu.cocktails).toHaveLength(2)
    expect(apiPost).toHaveBeenCalledWith('/api/ai/cocktail-proposal', expect.any(Object))
  })
})

describe('generateEventMenu — failures never fabricate a menu', () => {
  it('throws an AUTHORIZATION error on a 403 without ever resolving a menu', async () => {
    const err = new Error('Forbidden.'); err.status = 403
    apiPost.mockRejectedValue(err)

    const p = generateEventMenu({ event: EVENT, form: FORM })
    await expect(p).rejects.toMatchObject({ kind: EVENT_MENU_ERROR_KIND.AUTHORIZATION, status: 403 })
    await expect(p).rejects.toThrow(/No menu was created/i)
  })

  it('throws a PROVIDER error on a 500 provider/model failure after exhausting retries', async () => {
    const err = new Error('AI generation is unavailable — the server API key is missing or invalid.')
    err.status = 500
    apiPost.mockRejectedValue(err)

    const p = generateEventMenu({ event: EVENT, form: FORM })
    await expect(p).rejects.toMatchObject({ kind: EVENT_MENU_ERROR_KIND.PROVIDER })
    // A non-network-keyword 500 retries once before the final throw (2 attempts total).
    expect(apiPost).toHaveBeenCalledTimes(2)
  })

  it('never returns a menu object on failure — only throws', async () => {
    const err = new Error('Forbidden.'); err.status = 403
    apiPost.mockRejectedValue(err)
    let caught = null
    let result = null
    try { result = await generateEventMenu({ event: EVENT, form: FORM }) } catch (e) { caught = e }
    expect(caught).toBeTruthy()
    expect(result).toBeNull()
  })

  it('does not mark any thrown error as _fallback content', async () => {
    const err = new Error('Rate limited.'); err.status = 429
    apiPost.mockRejectedValue(err)
    let caught = null
    try { await generateEventMenu({ event: EVENT, form: FORM }) } catch (e) { caught = e }
    expect(caught.menu).toBeUndefined()
    expect(caught._fallback).toBeUndefined()
  })

  it('does not say "Retrying" in the final error when the cocktail count is wrong twice', async () => {
    // Message text alone (no "rate limit"/"quota"/"request failed") and no status —
    // this only stops retrying because attempt 2 is the last attempt.
    apiPost.mockResolvedValue(goodMenuResponse(1)) // FORM asks for 2, AI always returns 1

    const p = generateEventMenu({ event: EVENT, form: FORM })
    await expect(p).rejects.toThrow(/wrong number of cocktails|but 2 were requested/i)
    let caught = null
    try { await p } catch (e) { caught = e }
    expect(caught.message).not.toMatch(/retrying/i)
    expect(caught.menu).toBeUndefined()
    expect(apiPost).toHaveBeenCalledTimes(2)
  })

  it('classifies a status-429 failure as provider/rate-limit even when the message has no rate-limit keywords', async () => {
    const err = new Error('Upstream error.'); err.status = 429 // no "rate limit"/"quota"/"request failed" text
    apiPost.mockRejectedValue(err)

    const p = generateEventMenu({ event: EVENT, form: FORM })
    await expect(p).rejects.toMatchObject({ kind: EVENT_MENU_ERROR_KIND.PROVIDER, status: 429 })
    await expect(p).rejects.toThrow(/rate-limited|unavailable/i)
    // A 429 must not be retried, even on the first attempt.
    expect(apiPost).toHaveBeenCalledTimes(1)
  })

  it('does not retry a 403 that has no authorization-related message text', async () => {
    const err = new Error('Something went wrong.'); err.status = 403
    apiPost.mockRejectedValue(err)

    const p = generateEventMenu({ event: EVENT, form: FORM })
    await expect(p).rejects.toMatchObject({ kind: EVENT_MENU_ERROR_KIND.AUTHORIZATION, status: 403 })
    expect(apiPost).toHaveBeenCalledTimes(1)
  })
})

describe('replaceEventCocktail — success', () => {
  it('returns a real AI-generated replacement when generation succeeds', async () => {
    apiPost.mockResolvedValue(goodReplacementResponse())
    const menu = { cocktails: [{ name: 'Old Cocktail', base_spirit: 'Vodka', ingredients: [] }] }
    const result = await replaceEventCocktail({
      event: EVENT, menu, index: 0, replaceInstruction: 'make it more herbal', form: FORM,
    })
    expect(result.cocktail.name).toBe('Replacement Cocktail')
    expect(result.cocktail._fallback).toBeUndefined()
  })
})

describe('replaceEventCocktail — failures never fabricate a replacement', () => {
  it('throws an AUTHORIZATION error on a 401 without ever resolving a fake cocktail', async () => {
    const err = new Error('Authorization required.'); err.status = 401
    apiPost.mockRejectedValue(err)
    const menu = { cocktails: [{ name: 'Old Cocktail', base_spirit: 'Vodka', ingredients: [] }] }

    const p = replaceEventCocktail({ event: EVENT, menu, index: 0, replaceInstruction: 'more herbal', form: FORM })
    await expect(p).rejects.toMatchObject({ kind: EVENT_MENU_ERROR_KIND.AUTHORIZATION, status: 401 })
  })

  it('throws a PROVIDER error on a provider failure and never returns a placeholder cocktail', async () => {
    const err = new Error('Gemini request failed.'); err.status = 500
    apiPost.mockRejectedValue(err)
    const menu = { cocktails: [{ name: 'Old Cocktail', base_spirit: 'Vodka', ingredients: [] }] }

    let caught = null
    let result = null
    try {
      result = await replaceEventCocktail({ event: EVENT, menu, index: 0, replaceInstruction: 'more herbal', form: FORM })
    } catch (e) { caught = e }
    expect(caught).toMatchObject({ kind: EVENT_MENU_ERROR_KIND.PROVIDER })
    expect(result).toBeNull()
  })

  it('does not retry a status-429 replacement failure even without rate-limit message text', async () => {
    const err = new Error('Upstream error.'); err.status = 429
    apiPost.mockRejectedValue(err)
    const menu = { cocktails: [{ name: 'Old Cocktail', base_spirit: 'Vodka', ingredients: [] }] }

    const p = replaceEventCocktail({ event: EVENT, menu, index: 0, replaceInstruction: 'more herbal', form: FORM })
    await expect(p).rejects.toMatchObject({ kind: EVENT_MENU_ERROR_KIND.PROVIDER, status: 429 })
    expect(apiPost).toHaveBeenCalledTimes(1)
  })
})
