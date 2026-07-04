// Gemini (currently OpenAI-backed server-side) provider adapter for the AI
// orchestration layer. This is the ONLY place on the client that knows which backend
// AI route and which provider-specific response shape are in use. Task-level services
// (e.g. cocktailProposalAgent) depend on this neutral interface, never on a provider
// name or a raw endpoint. Swapping providers means adding a sibling adapter here — no
// task service or UI change required.
//
// Boundary: this adapter never sees or handles API keys — those live server-side.

import { apiPost } from '../../api/client.js'

// Internal provider identifier used only in response metadata / debug surfaces.
// Not shown in the product UI.
export const GEMINI_PROVIDER_ID = 'gemini'

// Neutral, task-named backend route. The legacy '/api/gemini' proxy still exists as a
// deprecated alias, but the cocktail-proposal task calls the provider-agnostic route.
export const COCKTAIL_PROPOSAL_ROUTE = '/api/ai/cocktail-proposal'

// Extracts plain completion text from a provider response body. Handles the shapes the
// backend may return (a plain string, an OpenAI/Gemini-style candidates/choices object,
// or an { output: { text } } wrapper). Moved out of the cocktail agent so the response
// shape stays a provider concern.
export function extractProviderText(responseBody) {
  if (!responseBody) return ''
  if (typeof responseBody === 'string') return responseBody

  if (Array.isArray(responseBody.candidates) && responseBody.candidates.length) {
    const candidate = responseBody.candidates[0]
    if (candidate?.content) {
      if (Array.isArray(candidate.content)) {
        return candidate.content.map(part => part?.text || '').join('\n')
      }
      return candidate.content?.parts?.map(part => part.text || '').join('\n') || ''
    }
    return candidate.output || candidate.message?.content || ''
  }

  if (typeof responseBody.output?.text === 'string') {
    return responseBody.output.text
  }

  return ''
}

// Requests a raw completion for the cocktail-proposal task from the provider-agnostic
// backend route and returns the extracted text plus the provider id the backend
// reported (falling back to this adapter's id). Errors (auth, provider/key, network)
// propagate unchanged so callers can classify them.
export async function requestCocktailCompletion({ prompt, jsonMode = false } = {}) {
  const body = jsonMode ? { prompt, json_mode: true } : { prompt }
  const data = await apiPost(COCKTAIL_PROPOSAL_ROUTE, body)
  return {
    text: extractProviderText(data?.answer ?? data),
    provider: (data && data.provider) || GEMINI_PROVIDER_ID,
  }
}
