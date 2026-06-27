// Rendered DOM regression for OwnerMeaningComposer (Owner Meaning Capture — Slice 4E.2).
//
// Complements the static guard test (scripts/test-owner-meaning-capture-composer-ui.js): this one
// actually renders the component with React Testing Library + jsdom and exercises real behavior —
// the owner-only render gate, question/empty states, textarea a11y wiring, the minimal POST
// payload, success/error + focus return, recent captures, inspect-detail, and forbidden-copy
// regression. The API client is mocked so no network/server is touched; nothing here mutates state.

import { render, screen, within, fireEvent, waitFor, act } from '@testing-library/react'
import OwnerMeaningComposer from './OwnerMeaningComposer'

// Hoisted mocks for the API client the component imports ('../../services/api/client').
const { apiGet, apiPost } = vi.hoisted(() => ({ apiGet: vi.fn(), apiPost: vi.fn() }))
vi.mock('../../services/api/client', () => ({ apiGet, apiPost }))

const QUESTION = 'Does this saved meaning belong to the venue identity, or need more evidence?'
const CONCEPT = '11111111-2222-3333-4444-555555555555'

function makeCandidate(overrides = {}) {
  return {
    candidate_id: 'ephemeral-id',
    concept_ref: CONCEPT,
    candidate_type: 'missing_data_signal',
    suggested_owner_question: QUESTION,
    interpretation_title: 'Possible signal',
    ...overrides,
  }
}

function makeCapture(overrides = {}) {
  return {
    id: 'cap-1',
    created_at: '2026-06-27 18:30:00',
    owner_response_raw: 'We host guests, not customers.',
    question_text: QUESTION,
    candidate_fingerprint: 'abcdef0123456789',
    event_count: 1,
    ...overrides,
  }
}

// Default routing for apiGet by path. Each test can override via setApi(...).
function setApi({ candidates = [], captures = [], detail = null } = {}) {
  apiGet.mockImplementation((path) => {
    if (path === '/api/discovery-interpreted-candidates') return Promise.resolve({ candidates })
    if (path.startsWith('/api/owner-meaning-captures/')) return Promise.resolve(detail)
    if (path.startsWith('/api/owner-meaning-captures')) return Promise.resolve({ captures })
    return Promise.resolve({})
  })
  apiPost.mockResolvedValue({ ok: true, capture: makeCapture() })
}

beforeEach(() => {
  apiGet.mockReset()
  apiPost.mockReset()
  setApi()
})

const owner = { role: 'owner', full_name: 'Tal Millo' }

// ── 1. Render visibility / role gate ──────────────────────────────────────────
describe('role gate', () => {
  it('renders the composer for the owner', async () => {
    setApi({ candidates: [makeCandidate()] })
    render(<OwnerMeaningComposer currentUser={owner} />)
    expect(await screen.findByText('Answer HESTIA · save owner evidence')).toBeInTheDocument()
  })

  it.each([
    ['admin', { role: 'admin' }],
    ['manager', { role: 'manager' }],
    ['bar_manager', { role: 'bar_manager' }],
    ['missing role', {}],
    ['no user', undefined],
  ])('renders nothing for %s', (_label, user) => {
    const { container } = render(<OwnerMeaningComposer currentUser={user} />)
    expect(container).toBeEmptyDOMElement()
    expect(apiGet).not.toHaveBeenCalled()
  })
})

// ── 2. Question loading and empty state ───────────────────────────────────────
describe('question + empty state', () => {
  it('shows the suggested question when one is ready', async () => {
    setApi({ candidates: [makeCandidate()] })
    render(<OwnerMeaningComposer currentUser={owner} />)
    expect(await screen.findByText(/HESTIA asks:/)).toBeInTheDocument()
    expect(screen.getByText(new RegExp(QUESTION.slice(0, 24)))).toBeInTheDocument()
  })

  it('shows an honest empty state and no fabricated question when none is ready', async () => {
    setApi({ candidates: [] })
    render(<OwnerMeaningComposer currentUser={owner} />)
    expect(await screen.findByText(/No owner meaning question is ready yet\./)).toBeInTheDocument()
    expect(screen.queryByText(/HESTIA asks:/)).not.toBeInTheDocument()
  })
})

// ── 3. Textarea accessibility ─────────────────────────────────────────────────
describe('textarea accessibility', () => {
  it('is reachable by its accessible label and describes the question + counter', async () => {
    setApi({ candidates: [makeCandidate()] })
    render(<OwnerMeaningComposer currentUser={owner} />)
    const ta = await screen.findByLabelText(/your answer to hestia/i)
    expect(ta).toBeInTheDocument()
    const described = (ta.getAttribute('aria-describedby') || '').split(/\s+/)
    expect(described).toContain('owner-meaning-question')
    expect(described).toContain('owner-meaning-counter')
    // The describedby targets exist in the DOM.
    expect(document.getElementById('owner-meaning-question')).toBeInTheDocument()
    expect(document.getElementById('owner-meaning-counter')).toBeInTheDocument()
  })

  it('renders the character counter and flags + blocks an over-limit answer', async () => {
    setApi({ candidates: [makeCandidate()] })
    render(<OwnerMeaningComposer currentUser={owner} />)
    const ta = await screen.findByLabelText(/your answer to hestia/i)
    expect(screen.getByText(/0 \/ 8000 characters/)).toBeInTheDocument()
    fireEvent.change(ta, { target: { value: 'x'.repeat(8001) } })
    expect(ta).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText(/Too long/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save as owner evidence' })).toBeDisabled()
  })
})

// ── 4. Submit behavior + minimal payload ──────────────────────────────────────
describe('submit + payload', () => {
  it('blocks empty/whitespace, enables on a real answer, and POSTs a minimal raw payload', async () => {
    setApi({ candidates: [makeCandidate()] })
    render(<OwnerMeaningComposer currentUser={owner} />)
    const ta = await screen.findByLabelText(/your answer to hestia/i)
    const save = screen.getByRole('button', { name: 'Save as owner evidence' })

    expect(save).toBeDisabled()                                   // empty
    fireEvent.change(ta, { target: { value: '   \n  ' } })
    expect(save).toBeDisabled()                                   // whitespace only

    const raw = 'We host guests, not customers.\n  Two spaces kept.  '
    fireEvent.change(ta, { target: { value: raw } })
    expect(save).toBeEnabled()

    await act(async () => { fireEvent.click(save) })

    expect(apiPost).toHaveBeenCalledTimes(1)
    const [path, body] = apiPost.mock.calls[0]
    expect(path).toBe('/api/owner-meaning-captures')
    // Exactly the two minimal keys — nothing else.
    expect(Object.keys(body).sort()).toEqual(['concept_ref', 'owner_response_raw'])
    expect(body.concept_ref).toBe(CONCEPT)
    expect(body.owner_response_raw).toBe(raw)                     // verbatim, spacing/newlines kept
    // No forbidden / derived fields in the payload.
    for (const k of ['venue_id', 'venueId', 'captured_owner_meaning', 'confirmed_meaning', 'interpretation', 'dna_target']) {
      expect(body).not.toHaveProperty(k)
    }
  })
})

// ── 5. Success / error behavior ───────────────────────────────────────────────
describe('success + error', () => {
  it('on success: announces, clears the composer, refreshes captures, returns focus', async () => {
    setApi({ candidates: [makeCandidate()], captures: [] })
    render(<OwnerMeaningComposer currentUser={owner} />)
    const ta = await screen.findByLabelText(/your answer to hestia/i)
    fireEvent.change(ta, { target: { value: 'We host guests.' } })

    const getCallsBefore = apiGet.mock.calls.filter(([p]) => p.startsWith('/api/owner-meaning-captures?')).length
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save as owner evidence' })) })

    // Success message lives in a polite status live region.
    const success = await screen.findByText(/Saved as owner evidence\./)
    expect(success).toBeInTheDocument()
    const liveRegion = success.closest('[role="status"]')
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')
    // Composer cleared only after success.
    expect(ta).toHaveValue('')
    // Recent captures refreshed (an extra list GET fired after the POST).
    const getCallsAfter = apiGet.mock.calls.filter(([p]) => p.startsWith('/api/owner-meaning-captures?')).length
    expect(getCallsAfter).toBeGreaterThan(getCallsBefore)
    // Predictable focus return to the textarea (requestAnimationFrame).
    await waitFor(() => expect(ta).toHaveFocus())
  })

  it('on failure: shows a safe error, keeps the text, shows no success', async () => {
    setApi({ candidates: [makeCandidate()] })
    apiPost.mockRejectedValueOnce(new Error('boom'))
    render(<OwnerMeaningComposer currentUser={owner} />)
    const ta = await screen.findByLabelText(/your answer to hestia/i)
    fireEvent.change(ta, { target: { value: 'Keep my words on error.' } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save as owner evidence' })) })

    expect(await screen.findByText(/could not save your answer/i)).toBeInTheDocument()
    expect(screen.getByText(/Nothing was changed/)).toBeInTheDocument()
    expect(ta).toHaveValue('Keep my words on error.')                // text preserved for retry
    expect(screen.queryByText(/Saved as owner evidence\./)).not.toBeInTheDocument()
  })
})

// ── 6. Recent captures ────────────────────────────────────────────────────────
describe('recent captures', () => {
  it('renders raw owner evidence framed as audit, not truth', async () => {
    setApi({ candidates: [], captures: [makeCapture({ owner_response_raw: 'A quiet, candlelit room.' })] })
    render(<OwnerMeaningComposer currentUser={owner} />)
    expect(await screen.findByText('A quiet, candlelit room.')).toBeInTheDocument()
    expect(screen.getByText(/Saved for audit/)).toBeInTheDocument()
    expect(screen.getByText(/not yet confirmed as Venue DNA/)).toBeInTheDocument()
    expect(screen.getByText(/raw owner response/)).toBeInTheDocument()
  })
})

// ── 7. Inspect detail ─────────────────────────────────────────────────────────
describe('inspect detail', () => {
  it('fetches a single capture and opens a labelled detail region framed as historical context', async () => {
    setApi({
      candidates: [],
      captures: [makeCapture()],
      detail: {
        ok: true,
        capture: makeCapture({ owner_response_raw: 'Full verbatim answer here.', question_reason: 'A kept meaning lacks corroboration.' }),
        candidate_snapshot: { interpretation_title: 'Possible signal shown', interpretation_summary: 'What was on screen.' },
        events: [{ id: 'ev-1', event_type: 'owner_answer_captured', created_at: '2026-06-27 18:30:00' }],
      },
    })
    render(<OwnerMeaningComposer currentUser={owner} />)
    const inspect = await screen.findByRole('button', { name: /inspect saved evidence details/i })
    expect(inspect).toHaveAttribute('aria-expanded', 'false')

    await act(async () => { fireEvent.click(inspect) })

    // The single-capture GET was called for this id.
    expect(apiGet).toHaveBeenCalledWith('/api/owner-meaning-captures/cap-1')
    const toggled = await screen.findByRole('button', { name: /hide saved evidence details/i })
    expect(toggled).toHaveAttribute('aria-expanded', 'true')

    const regionId = toggled.getAttribute('aria-controls')
    const region = document.getElementById(regionId)
    expect(region).toBeInTheDocument()
    const r = within(region)
    expect(r.getByText('Full verbatim answer here.')).toBeInTheDocument()
    expect(r.getByText(/Why HESTIA asked:/)).toBeInTheDocument()
    expect(r.getByText('What HESTIA showed at the time')).toBeInTheDocument()   // snapshot framed as context
    expect(r.getByText(/Not confirmed Venue DNA/)).toBeInTheDocument()
    expect(r.getByText(/owner_answer_captured/)).toBeInTheDocument()            // event trail
  })
})

// ── 8. Boundary text / affordance regression ──────────────────────────────────
describe('boundary regression', () => {
  it('exposes no promote/approve/apply-to-DNA/confirm affordance and no forbidden copy', async () => {
    setApi({ candidates: [makeCandidate()], captures: [makeCapture()] })
    const { container } = render(<OwnerMeaningComposer currentUser={owner} />)
    await screen.findByText(/HESTIA asks:/)

    // No decision/promotion button exists, by accessible name.
    expect(screen.queryByRole('button', { name: /apply to dna|update venue dna|add to venue dna|promote|approve|confirm/i })).toBeNull()
    // The only primary write affordance is the evidence save.
    expect(screen.getByRole('button', { name: 'Save as owner evidence' })).toBeInTheDocument()

    // Exact forbidden phrases never appear in the rendered text. (Note: "not confirmed as Venue
    // DNA" is allowed and intentionally NOT in this list — we test precise phrases, not the word
    // "confirmed".)
    const text = container.textContent || ''
    for (const phrase of ['Apply to DNA', 'Update Venue DNA', 'Add to Venue DNA', 'confirmed meaning', 'captured_owner_meaning', 'HESTIA learned this', 'final truth', 'Venue DNA updated']) {
      expect(text).not.toContain(phrase)
    }
  })
})

// ── 9. No write API beyond the single owner-meaning POST ───────────────────────
describe('write surface', () => {
  it('only ever POSTs to /api/owner-meaning-captures', async () => {
    setApi({ candidates: [makeCandidate()] })
    render(<OwnerMeaningComposer currentUser={owner} />)
    const ta = await screen.findByLabelText(/your answer to hestia/i)
    fireEvent.change(ta, { target: { value: 'one' } })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save as owner evidence' })) })
    for (const [path] of apiPost.mock.calls) {
      expect(path).toBe('/api/owner-meaning-captures')
    }
  })
})
