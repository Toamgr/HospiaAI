// Rendered-DOM regression for CocktailLabStudio's generation flow, covering the
// AI-authorization bug fix:
//  - A failed AI request (403) shows an honest error, creates NO draft, and does not
//    change the Drafts/Pending/Approved counters.
//  - No misleading "AI was unavailable — fallback draft generated" copy is shown.
//  - A manual draft is created ONLY when the user explicitly clicks "Create manual draft".
//
// The cocktailService and api client are mocked so no network/provider is touched.

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import CocktailLabStudio from './CocktailLabStudio.jsx'

// Mirror the real error-kind enum so the component's branching works under the mock.
// Everything referenced by the hoisted vi.mock factory must live inside vi.hoisted.
const { requestCocktailProposal, requestManualCocktailDraft, COCKTAIL_ERROR_KIND } = vi.hoisted(() => ({
  requestCocktailProposal: vi.fn(),
  requestManualCocktailDraft: vi.fn(),
  COCKTAIL_ERROR_KIND: { VALIDATION: 'validation', AUTHORIZATION: 'authorization', PROVIDER: 'provider' },
}))

vi.mock('../../services/cocktailService', () => ({
  requestCocktailProposal,
  requestManualCocktailDraft,
  COCKTAIL_ERROR_KIND,
}))
vi.mock('../../services/api/client', () => ({ apiPatch: vi.fn() }))

function statValue(label) {
  // Each stat renders the number and its label ("Drafts"/"Pending"/"Approved") in one tile.
  const labelEl = screen.getByText(label)
  return within(labelEl.parentElement).getByText(/^\d+$/).textContent
}

async function typeBriefAndGenerate() {
  fireEvent.change(screen.getByPlaceholderText(/Describe the cocktail idea/i), {
    target: { value: 'A savory tequila highball with preserved lime and saline' },
  })
  fireEvent.click(screen.getByRole('button', { name: /Generate Cocktail/i }))
}

beforeEach(() => {
  requestCocktailProposal.mockReset()
  requestManualCocktailDraft.mockReset()
})

describe('CocktailLabStudio — failed AI generation', () => {
  it('shows an honest error and creates no draft on a 403', async () => {
    const authErr = new Error('AI generation failed. No draft was created. Check API route, authorization, or provider configuration.')
    authErr.kind = COCKTAIL_ERROR_KIND.AUTHORIZATION
    authErr.status = 403
    requestCocktailProposal.mockRejectedValue(authErr)
    const onSaveDraft = vi.fn()

    render(<CocktailLabStudio cocktailDrafts={[]} approvedCocktails={[]} archivedCocktails={[]} onSaveDraft={onSaveDraft} />)

    // Counters start at zero.
    expect(statValue('Drafts')).toBe('0')
    expect(statValue('Pending')).toBe('0')
    expect(statValue('Approved')).toBe('0')

    await typeBriefAndGenerate()

    await waitFor(() => expect(screen.getByText(/No draft was created/i)).toBeInTheDocument())
    // No fabricated draft: onSaveDraft never called, counters unchanged.
    expect(onSaveDraft).not.toHaveBeenCalled()
    expect(statValue('Drafts')).toBe('0')
    expect(statValue('Pending')).toBe('0')
    expect(statValue('Approved')).toBe('0')
    // The old misleading copy must be gone.
    expect(screen.queryByText(/AI was unavailable/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/fallback draft generated/i)).not.toBeInTheDocument()
  })

  it('offers an explicit manual draft that is only created on click', async () => {
    const authErr = new Error('AI generation failed. No draft was created.')
    authErr.kind = COCKTAIL_ERROR_KIND.AUTHORIZATION
    authErr.status = 403
    requestCocktailProposal.mockRejectedValue(authErr)
    requestManualCocktailDraft.mockReturnValue({
      source: 'manual',
      manualDraft: true,
      proposal: { id: 'm1', name: 'Manual House Draft', fallbackGenerated: true, ingredients: [], ingredientsMl: [], riskNotes: [], substitutions: [] },
    })
    const onSaveDraft = vi.fn(p => p)

    render(<CocktailLabStudio cocktailDrafts={[]} approvedCocktails={[]} archivedCocktails={[]} onSaveDraft={onSaveDraft} />)
    await typeBriefAndGenerate()

    // The manual-draft opt-in appears but nothing is created yet.
    const manualBtn = await screen.findByRole('button', { name: /Create manual draft/i })
    expect(requestManualCocktailDraft).not.toHaveBeenCalled()
    expect(onSaveDraft).not.toHaveBeenCalled()

    fireEvent.click(manualBtn)

    await waitFor(() => expect(requestManualCocktailDraft).toHaveBeenCalledTimes(1))
    expect(onSaveDraft).toHaveBeenCalledTimes(1)
    expect(screen.getByText(/manual draft \(not AI-generated\)/i)).toBeInTheDocument()
  })

  it('shows a validation error without offering a manual draft', async () => {
    const valErr = new Error('The brief is too short.')
    valErr.kind = COCKTAIL_ERROR_KIND.VALIDATION
    requestCocktailProposal.mockRejectedValue(valErr)
    const onSaveDraft = vi.fn()

    render(<CocktailLabStudio cocktailDrafts={[]} approvedCocktails={[]} archivedCocktails={[]} onSaveDraft={onSaveDraft} />)
    await typeBriefAndGenerate()

    await waitFor(() => expect(screen.getByText(/too short/i)).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: /Create manual draft/i })).not.toBeInTheDocument()
    expect(onSaveDraft).not.toHaveBeenCalled()
  })
})

describe('CocktailLabStudio — successful AI generation', () => {
  it('saves the AI proposal as a draft on success', async () => {
    requestCocktailProposal.mockResolvedValue({
      source: 'gemini',
      proposal: { id: 'g1', name: 'Coastal Signal', ingredients: [], ingredientsMl: [], riskNotes: [], substitutions: [] },
    })
    const onSaveDraft = vi.fn(p => p)

    render(<CocktailLabStudio cocktailDrafts={[]} approvedCocktails={[]} archivedCocktails={[]} onSaveDraft={onSaveDraft} />)
    await typeBriefAndGenerate()

    await waitFor(() => expect(onSaveDraft).toHaveBeenCalledTimes(1))
    expect(screen.getByText(/Coastal Signal is ready/i)).toBeInTheDocument()
  })
})
