// Task-level AI service for the "cocktail_proposal" task.
//
// This is the provider-agnostic orchestration seam the frontend should depend on for
// cocktail generation. It builds the task prompt, calls a provider through the neutral
// adapter, then normalizes / repairs / validates the result using the shared cocktail
// domain helpers. It returns the proposal plus internal metadata (provider, task,
// source, repaired) so callers can reason about provenance without ever branching on a
// hardcoded provider name or endpoint.
//
// Swapping AI providers = swapping the adapter import below. No change here or in the UI.

import { requestCocktailCompletion, GEMINI_PROVIDER_ID } from './providers/geminiProvider.js'
import {
  buildCocktailPrompt,
  buildCompactRevisionPrompt,
  parseStrictJson,
  ensureFullProposalPayload,
  normalizeCocktailProposal,
  validateResponseSchema,
  mapGeminiResponseToProposal,
  hasCompleteProposalShape,
} from '../geminiCocktailAgent.js'

export const COCKTAIL_PROPOSAL_TASK = 'cocktail_proposal'
export const AI_PROVIDER_SOURCE = 'ai_provider'

// Generates a cocktail proposal for a manager/director brief.
// Returns { proposal, metadata } where metadata = { provider, task, source, repaired }.
// Throws on transport/auth/provider/parse failures — the caller classifies them.
export async function generateCocktailProposal(payload) {
  const {
    agentPrompt, form, approvedCocktails, cocktailDrafts, menuAnalysis,
    variation = '', previousProposal = null,
    venueDNA = null, venueProfile = null, venueBeverageContext = null,
  } = payload || {}

  const isCompactRevision = Boolean(previousProposal && (variation || agentPrompt))
  const prompt = isCompactRevision
    ? buildCompactRevisionPrompt({ agentPrompt, form, menuAnalysis, variation, previousProposal })
    : buildCocktailPrompt({ agentPrompt, form, approvedCocktails, cocktailDrafts, menuAnalysis, variation, previousProposal, venueDNA, venueProfile, venueBeverageContext })

  const { text, provider } = await requestCocktailCompletion({ prompt })
  const parsed = parseStrictJson(text)

  // "repaired" = the provider's own JSON was not already a complete proposal, so the
  // domain layer had to fill/repair ingredients or shape before returning it.
  const repaired = !hasCompleteProposalShape(normalizeCocktailProposal(parsed))

  const proposalPayload = ensureFullProposalPayload(parsed, { agentPrompt, form, menuAnalysis })
  const normalized = normalizeCocktailProposal(proposalPayload)
  validateResponseSchema(normalized)
  const proposal = mapGeminiResponseToProposal(normalized, { agentPrompt, form, menuAnalysis })

  return {
    proposal,
    metadata: {
      provider: provider || GEMINI_PROVIDER_ID,
      task: COCKTAIL_PROPOSAL_TASK,
      source: AI_PROVIDER_SOURCE,
      repaired,
    },
  }
}
