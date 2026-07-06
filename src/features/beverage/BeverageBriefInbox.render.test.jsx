// Rendered DOM regression for BeverageBriefInbox (Beverage Slice 1A — F&B Director inbox).
//
// Exercises real behavior with React Testing Library + jsdom: the role render gate, the honest
// empty state ("No beverage briefs waiting."), listing submitted briefs, opening a brief with
// the owner's values shown verbatim, opening a review, and recording a decision through the
// PATCH route. The API client is mocked so no network/server is touched.

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import BeverageBriefInbox from './BeverageBriefInbox'

const { apiGet, apiPost, apiPut, apiPatch, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(), apiPost: vi.fn(), apiPut: vi.fn(), apiPatch: vi.fn(), apiDelete: vi.fn(),
}))
vi.mock('../../services/api/client', () => ({ apiGet, apiPost, apiPut, apiPatch, apiDelete }))

const INBOX_PATH = '/api/fnb-beverage-brief-inbox'
const BRIEF_ID = 'brief-1111aaaa2222bbbb'

function makeBrief(overrides = {}) {
  return {
    id: BRIEF_ID,
    venue_id: 'venue-1',
    owner_user_id: 'owner-1',
    status: 'submitted',
    fields: {
      venue_type: 'Listening bar', service_style: null,
      intent_statement: 'Bitter-forward, low sugar.', guest_profile: null,
      flavor_direction: null, cocktail_count: 8, zero_proof_stance: null,
      constraints: null, price_range: '₪58–₪72', staff_capability_note: null, season_context: null,
    },
    field_provenance: {},
    created_at: '2026-07-06 10:00:00',
    submitted_at: '2026-07-06 12:00:00',
    review: null,
    ...overrides,
  }
}

beforeEach(() => {
  apiGet.mockReset(); apiPost.mockReset(); apiPut.mockReset(); apiPatch.mockReset(); apiDelete.mockReset()
})

test('refuses to render for a role without inbox access', () => {
  render(<BeverageBriefInbox currentUser={{ id: 'u1', role: 'bar_manager' }} />)
  expect(screen.getByText(/belongs to the f&b director/i)).toBeInTheDocument()
  expect(apiGet).not.toHaveBeenCalled()
})

test('refuses to render for admin — admin must not see or access the inbox', () => {
  render(<BeverageBriefInbox currentUser={{ id: 'admin-1', role: 'admin' }} />)
  expect(screen.getByText(/belongs to the f&b director/i)).toBeInTheDocument()
  expect(apiGet).not.toHaveBeenCalled()
})

test('shows the honest empty state when no briefs are waiting — no sample cards', async () => {
  apiGet.mockResolvedValueOnce({ ok: true, briefs: [] })
  render(<BeverageBriefInbox currentUser={{ id: 'fnb-1', role: 'fb_director' }} />)
  await waitFor(() => expect(screen.getByText('No beverage briefs waiting.')).toBeInTheDocument())
  expect(apiGet).toHaveBeenCalledWith(INBOX_PATH)
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})

test('lists a submitted brief and opens it with the owner values shown verbatim', async () => {
  apiGet.mockResolvedValueOnce({ ok: true, briefs: [makeBrief()] })
  render(<BeverageBriefInbox currentUser={{ id: 'fnb-1', role: 'fb_director' }} />)
  await waitFor(() => expect(screen.getByText('Bitter-forward, low sugar.')).toBeInTheDocument())

  apiGet.mockResolvedValueOnce({ ok: true, brief: makeBrief(), review: null, events: [] })
  fireEvent.click(screen.getByRole('button', { name: /open beverage brief/i }))

  await waitFor(() => expect(apiGet).toHaveBeenCalledWith(`${INBOX_PATH}/${BRIEF_ID}`))
  await waitFor(() => expect(screen.getByText('Listening bar')).toBeInTheDocument())
  // Empty owner fields are shown honestly, not invented.
  expect(screen.getAllByText(/the owner left this empty/i).length).toBeGreaterThan(0)
  // No review yet → the only write control offered is opening a review.
  expect(screen.getByRole('button', { name: /open review/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /^approve$/i })).not.toBeInTheDocument()
})

test('opens a review, then records a decision through the PATCH route', async () => {
  apiGet.mockResolvedValueOnce({ ok: true, briefs: [makeBrief()] })
  render(<BeverageBriefInbox currentUser={{ id: 'fnb-1', role: 'fb_director' }} />)
  await waitFor(() => screen.getByText('Bitter-forward, low sugar.'))

  apiGet.mockResolvedValueOnce({ ok: true, brief: makeBrief(), review: null, events: [] })
  fireEvent.click(screen.getByRole('button', { name: /open beverage brief/i }))
  await waitFor(() => screen.getByRole('button', { name: /open review/i }))

  const review = {
    id: 'review-9', venue_id: 'venue-1', owner_beverage_brief_id: BRIEF_ID,
    reviewer_user_id: 'fnb-1', status: 'in_review', notes: null, field_adjustments: {},
    created_at: '2026-07-06 13:00:00', decided_at: null,
  }
  apiPost.mockResolvedValueOnce({ ok: true, review })
  fireEvent.click(screen.getByRole('button', { name: /open review/i }))
  await waitFor(() => expect(apiPost).toHaveBeenCalledWith('/api/fnb-brief-reviews', { brief_id: BRIEF_ID }))

  // Decide: approve → PATCH with status 'approved'. The decided review renders as closed.
  apiPatch.mockResolvedValueOnce({ ok: true, review: { ...review, status: 'approved', decided_at: '2026-07-06 13:05:00' } })
  await waitFor(() => screen.getByRole('button', { name: /^approve$/i }))
  fireEvent.click(screen.getByRole('button', { name: /^approve$/i }))

  await waitFor(() => expect(apiPatch).toHaveBeenCalledTimes(1))
  const [path, body] = apiPatch.mock.calls[0]
  expect(path).toBe('/api/fnb-brief-reviews/review-9')
  expect(body.status).toBe('approved')
  await waitFor(() => expect(screen.getByText(/decided and closed/i)).toBeInTheDocument())
  // No other write verb is ever used from the inbox.
  expect(apiPut).not.toHaveBeenCalled()
  expect(apiDelete).not.toHaveBeenCalled()
})

test('a failed inbox load shows an honest error, never fake rows', async () => {
  apiGet.mockRejectedValueOnce(new Error('Venue access denied.'))
  render(<BeverageBriefInbox currentUser={{ id: 'fnb-1', role: 'fb_director' }} />)
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Venue access denied.'))
  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})
