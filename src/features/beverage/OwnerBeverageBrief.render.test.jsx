// Rendered DOM regression for OwnerBeverageBrief (Beverage Slice 1A — owner form).
//
// Exercises real behavior with React Testing Library + jsdom: the owner-only render gate, the
// empty-form honesty (no prefilled/sample content anywhere), save-draft and submit writes, the
// read-only submitted state, and the honest error state. The API client is mocked so no
// network/server is touched.

import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import OwnerBeverageBrief from './OwnerBeverageBrief'

const { apiGet, apiPost, apiPut, apiPatch, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(), apiPost: vi.fn(), apiPut: vi.fn(), apiPatch: vi.fn(), apiDelete: vi.fn(),
}))
vi.mock('../../services/api/client', () => ({ apiGet, apiPost, apiPut, apiPatch, apiDelete }))

const LIST_PATH = '/api/owner-beverage-briefs'

function makeBrief(overrides = {}) {
  return {
    id: 'brief-1111aaaa2222bbbb',
    venue_id: 'venue-1',
    owner_user_id: 'owner-1',
    status: 'draft',
    fields: {
      venue_type: null, service_style: null, intent_statement: null, guest_profile: null,
      flavor_direction: null, cocktail_count: null, zero_proof_stance: null, constraints: null,
      price_range: null, staff_capability_note: null, season_context: null,
    },
    field_provenance: {},
    created_at: '2026-07-06 10:00:00',
    updated_at: '2026-07-06 10:00:00',
    submitted_at: null,
    review: null,
    ...overrides,
  }
}

beforeEach(() => {
  apiGet.mockReset(); apiPost.mockReset(); apiPut.mockReset(); apiPatch.mockReset(); apiDelete.mockReset()
})

test('refuses to render the form for a non-owner role', () => {
  render(<OwnerBeverageBrief currentUser={{ id: 'u1', role: 'fb_director' }} />)
  expect(screen.getByText(/owner-only/i)).toBeInTheDocument()
  expect(apiGet).not.toHaveBeenCalled()
})

test('renders an honest empty form for an owner with no briefs — no sample content', async () => {
  apiGet.mockResolvedValueOnce({ ok: true, briefs: [] })
  render(<OwnerBeverageBrief currentUser={{ id: 'owner-1', role: 'owner' }} />)
  await waitFor(() => expect(screen.getByRole('heading', { name: /beverage direction brief/i })).toBeInTheDocument())
  // All eleven fields render and every one is EMPTY (no prefill, no sample data).
  const boxes = [...screen.getAllByRole('textbox'), ...screen.getAllByRole('spinbutton')]
  expect(boxes.length).toBe(11)
  for (const box of boxes) expect(box.value).toBe('')
  expect(screen.getByRole('button', { name: /submit to the f&b director/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument()
})

test('save draft posts the typed fields; blank fields go up as null', async () => {
  apiGet.mockResolvedValueOnce({ ok: true, briefs: [] })
  apiPost.mockResolvedValueOnce({ ok: true, brief: makeBrief() })
  render(<OwnerBeverageBrief currentUser={{ id: 'owner-1', role: 'owner' }} />)
  await waitFor(() => screen.getByRole('heading', { name: /beverage direction brief/i }))

  fireEvent.change(screen.getByLabelText(/intent/i), { target: { value: 'Quiet aperitivo energy.' } })
  fireEvent.click(screen.getByRole('button', { name: /save draft/i }))

  await waitFor(() => expect(apiPost).toHaveBeenCalledTimes(1))
  const [path, body] = apiPost.mock.calls[0]
  expect(path).toBe(LIST_PATH)
  expect(body.fields.intent_statement).toBe('Quiet aperitivo energy.')
  expect(body.fields.venue_type).toBeNull()
  // No PUT/PATCH/DELETE writes on a first save.
  expect(apiPut).not.toHaveBeenCalled()
  expect(apiPatch).not.toHaveBeenCalled()
  expect(apiDelete).not.toHaveBeenCalled()
})

test('a submitted brief renders read-only with no editable fields', async () => {
  apiGet.mockResolvedValueOnce({
    ok: true,
    briefs: [makeBrief({
      status: 'submitted',
      submitted_at: '2026-07-06 12:00:00',
      fields: { ...makeBrief().fields, intent_statement: 'Bitter-forward, low sugar.' },
    })],
  })
  render(<OwnerBeverageBrief currentUser={{ id: 'owner-1', role: 'owner' }} />)
  await waitFor(() => expect(screen.getByText(/read-only/i)).toBeInTheDocument())
  expect(screen.getByText('Bitter-forward, low sugar.')).toBeInTheDocument()
  // Empty fields are shown honestly as empty, not filled in.
  expect(screen.getAllByText(/left empty/i).length).toBeGreaterThan(0)
  // No inputs and no submit CTA in the read-only state.
  expect(screen.queryAllByRole('textbox')).toHaveLength(0)
  expect(screen.queryByRole('button', { name: /submit to the f&b director/i })).not.toBeInTheDocument()
})

test('a failed load shows an honest error — never a fake form or fake success', async () => {
  apiGet.mockRejectedValueOnce(new Error('Invalid or expired session.'))
  render(<OwnerBeverageBrief currentUser={{ id: 'owner-1', role: 'owner' }} />)
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Invalid or expired session.'))
  expect(screen.queryByRole('button', { name: /submit to the f&b director/i })).not.toBeInTheDocument()
})
