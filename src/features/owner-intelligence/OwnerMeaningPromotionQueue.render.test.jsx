// Rendered DOM regression for OwnerMeaningPromotionQueue (Owner Meaning Promotion — read-only queue,
// Slice 4H).
//
// Renders the component with React Testing Library + jsdom and exercises real behavior — the
// owner-only render gate, the list fetch from the GET list route, the detail fetch from the GET
// detail route, the blocked-application + all-unavailable-actions display, honest empty states, the
// error state, and the read-only boundary (no POST/PATCH/PUT/DELETE, no approve/reject/apply
// controls, no mergeVenueDna). The API client is mocked so no network/server is touched; nothing
// here mutates state.

import { render, screen, within, fireEvent, waitFor, act } from '@testing-library/react'
import OwnerMeaningPromotionQueue from './OwnerMeaningPromotionQueue'

// Hoisted mocks for the API client the component imports ('../../services/api/client'). It only ever
// imports apiGet — proving (by absence) there is no write path.
const { apiGet, apiPost, apiPut, apiPatch, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(), apiPost: vi.fn(), apiPut: vi.fn(), apiPatch: vi.fn(), apiDelete: vi.fn(),
}))
vi.mock('../../services/api/client', () => ({ apiGet, apiPost, apiPut, apiPatch, apiDelete }))

const LIST_PATH = '/api/owner-meaning-promotion-candidates'

function makeListRow(overrides = {}) {
  return {
    id: 'cand-aaaa1111bbbb2222',
    created_at: '2026-06-27 10:00:00',
    updated_at: '2026-06-27 10:00:00',
    status: 'needs_owner_review',
    status_reason: null,
    proposed_target_path: 'owner_notes',
    proposed_target_label: 'Owner notes',
    proposed_meaning_summary: 'Proposed reading of the owner’s words (NOT confirmed).',
    proposed_value_preview: 'A candlelit room.',
    proposal_rationale: 'Drawn from cited captures.',
    confidence: { label: 'low', score: null, factors: { evidence_count: 1 } },
    evidence: { source_capture_count: 1, source_capture_fingerprints: ['fp-1'], source_preview: [] },
    review: { reviewed_at: null, reviewed_by_user_id: null, owner_decision_note: null },
    application: { applied_at: null, dna_application_ref: null, blocked: true, block_reason: 'Venue DNA application is not enabled in this contract.' },
    ...overrides,
  }
}

function makeDetail(overrides = {}) {
  return {
    ok: true,
    candidate: {
      id: 'cand-aaaa1111bbbb2222',
      record_space: 'concept_draft',
      status: 'needs_owner_review',
      status_reason: null,
      created_at: '2026-06-27 10:00:00',
      updated_at: '2026-06-27 10:00:00',
      proposed_target_path: 'owner_notes',
      proposed_target_label: 'Owner notes',
      current_value_snapshot_json: null,
      proposed_value_json: 'A candlelit room.',
      proposed_meaning_summary: 'Proposed reading (NOT confirmed).',
      proposed_dna_patch_json: { target_path: 'owner_notes', op: 'set', value: 'A candlelit room.' },
      proposal_rationale: 'Drawn from cited captures.',
      confidence: {
        label: 'low',
        score: null,
        factors: { evidence_count: 1, consistency: 'consistent' },
        contradictions: [],
        missing_evidence: ['No weekend corroboration.'],
      },
      impact_note: 'Read by the owner identity specialists.',
      review: { reviewed_at: null, reviewed_by_user_id: null, owner_decision_note: null, approved_at: null, rejected_at: null },
      application: { applied_at: null, applied_by_user_id: null, dna_application_ref: null, blocked: true, block_reason: 'Venue DNA application is not enabled in this contract.' },
      superseded_by_candidate_id: null,
      candidate_fingerprint: 'fp-candidate-9999',
      schema_version: 'owner_meaning_promotion_v1',
    },
    source_captures: [
      {
        id: 'cap-1',
        created_at: '2026-06-26 18:30:00',
        owner_response_raw: 'We host guests, not customers.',
        question_text: 'Does this belong to the venue identity?',
        question_reason: 'A kept meaning lacks corroboration.',
        candidate_snapshot_json: { interpretation_title: 'Possible signal' },
        candidate_fingerprint: 'fp-cap-1-abcdef',
        event_count: 1,
      },
    ],
    events: [
      { id: 'ev-1', event_type: 'candidate_created', created_at: '2026-06-27 10:00:00', actor_type: 'system', actor_role: null, previous_status: null, next_status: 'draft_suggestion', target_path: 'owner_notes', event_payload_json: {} },
    ],
    allowed_actions: { approve: false, reject: false, request_revision: false, apply_to_dna: false },
    ...overrides,
  }
}

function setApi({ candidates = [], counts = null, detail = makeDetail() } = {}) {
  apiGet.mockImplementation((path) => {
    if (path === LIST_PATH) return Promise.resolve({ ok: true, candidates, ...(counts ? { counts } : {}), pagination: { limit: 25, offset: 0, count: candidates.length, has_more: false } })
    if (path.startsWith(`${LIST_PATH}/`)) return Promise.resolve(detail)
    return Promise.resolve({})
  })
}

beforeEach(() => {
  apiGet.mockReset(); apiPost.mockReset(); apiPut.mockReset(); apiPatch.mockReset(); apiDelete.mockReset()
  setApi()
})

const owner = { role: 'owner', full_name: 'Tal Millo' }

// ── 1. Role gate ──────────────────────────────────────────────────────────────
describe('role gate', () => {
  it('renders the queue for the owner', async () => {
    setApi({ candidates: [makeListRow()] })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    expect(await screen.findByText('Meaning Promotion Queue · read-only')).toBeInTheDocument()
  })

  it.each([
    ['admin', { role: 'admin' }],
    ['manager', { role: 'manager' }],
    ['bar_manager', { role: 'bar_manager' }],
    ['employee', { role: 'employee' }],
    ['missing role', {}],
    ['no user', undefined],
  ])('renders nothing for %s and never fetches', (_label, user) => {
    const { container } = render(<OwnerMeaningPromotionQueue currentUser={user} />)
    expect(container).toBeEmptyDOMElement()
    expect(apiGet).not.toHaveBeenCalled()
  })
})

// ── 2. List fetch + empty state ────────────────────────────────────────────────
describe('list + empty state', () => {
  it('fetches the queue from the GET list route', async () => {
    setApi({ candidates: [makeListRow()] })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    await screen.findByText('Owner notes')
    expect(apiGet).toHaveBeenCalledWith(LIST_PATH)
  })

  it('shows an honest empty state when there are no candidates (no implied generation)', async () => {
    setApi({ candidates: [] })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    expect(await screen.findByText(/No promotion candidates are queued yet\./)).toBeInTheDocument()
    expect(screen.getByText(/nothing changes Venue DNA/i)).toBeInTheDocument()
  })

  it('renders a candidate row with status, blocked, and actions-unavailable affordances', async () => {
    setApi({ candidates: [makeListRow()], counts: { needs_owner_review: 1, owner_approved: 0 } })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    expect(await screen.findByText('Owner notes')).toBeInTheDocument()
    expect(screen.getByText('Needs owner review')).toBeInTheDocument()
    expect(screen.getByText('application blocked')).toBeInTheDocument()
    expect(screen.getByText('actions unavailable')).toBeInTheDocument()
    expect(screen.getByText(/low confidence/)).toBeInTheDocument()
  })
})

// ── 3. Detail fetch + read-only display ────────────────────────────────────────
describe('detail', () => {
  async function openDetail() {
    setApi({ candidates: [makeListRow()] })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    const row = await screen.findByRole('button', { name: /inspect promotion candidate/i })
    await act(async () => { fireEvent.click(row) })
    return screen.findByRole('region', { name: /promotion candidate detail/i })
  }

  it('fetches the candidate detail from the GET detail route', async () => {
    const region = await openDetail()
    expect(apiGet).toHaveBeenCalledWith(`${LIST_PATH}/cand-aaaa1111bbbb2222`)
    expect(region).toBeInTheDocument()
  })

  it('renders the proposed diff marked as not applied, plus verbatim source evidence', async () => {
    const region = await openDetail()
    const r = within(region)
    expect(r.getByText(/Proposed change · not applied/)).toBeInTheDocument()
    expect(r.getByText(/Proposed value \(after — not applied\)/)).toBeInTheDocument()
    expect(r.getByText('We host guests, not customers.')).toBeInTheDocument()  // verbatim raw owner words
    expect(r.getByText(/candidate_created/)).toBeInTheDocument()               // audit timeline
  })

  it('renders application.blocked true and the read-only / DNA-unchanged copy', async () => {
    const region = await openDetail()
    const r = within(region)
    expect(r.getByText(/Application is blocked in this slice\./)).toBeInTheDocument()
    expect(r.getByText(/Venue DNA is unchanged\./)).toBeInTheDocument()
  })

  it('renders allowed_actions all as unavailable and no working action control', async () => {
    const region = await openDetail()
    const r = within(region)
    for (const label of ['Approve', 'Reject', 'Request revision', 'Apply to DNA']) {
      expect(r.getByText(new RegExp(`${label} — unavailable`))).toBeInTheDocument()
    }
    // No interactive control claims to approve/reject/request-revision/apply/promote/confirm.
    expect(screen.queryByRole('button', { name: /apply to dna|update venue dna|promote|approve|reject|request revision|confirm/i })).toBeNull()
  })

  it('shows honest empty states for contradictions and missing factors', async () => {
    setApi({
      candidates: [makeListRow()],
      detail: makeDetail({
        candidate: { ...makeDetail().candidate, confidence: { label: 'low', score: null, factors: {}, contradictions: [], missing_evidence: [] } },
      }),
    })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    const row = await screen.findByRole('button', { name: /inspect promotion candidate/i })
    await act(async () => { fireEvent.click(row) })
    const region = await screen.findByRole('region', { name: /promotion candidate detail/i })
    const r = within(region)
    expect(r.getByText('No contradictions recorded.')).toBeInTheDocument()
    expect(r.getByText('No confidence factors available yet.')).toBeInTheDocument()
  })

  it('returns to the list via the back control', async () => {
    const region = await openDetail()
    const back = within(region).getByRole('button', { name: /back to the promotion queue/i })
    await act(async () => { fireEvent.click(back) })
    await waitFor(() => expect(screen.queryByRole('region', { name: /promotion candidate detail/i })).toBeNull())
    expect(screen.getByText('Owner notes')).toBeInTheDocument()
  })
})

// ── 4. Error state ────────────────────────────────────────────────────────────
describe('error state', () => {
  it('shows a safe error and a retry when the list fetch fails', async () => {
    apiGet.mockRejectedValueOnce(new Error('boom'))
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    expect(await screen.findByText(/could not load the promotion queue/i)).toBeInTheDocument()
    expect(screen.getByText(/Nothing was changed/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry loading the queue/i })).toBeInTheDocument()
  })

  it('shows a safe error when the detail fetch fails', async () => {
    setApi({ candidates: [makeListRow()] })
    apiGet.mockImplementation((path) => {
      if (path === LIST_PATH) return Promise.resolve({ ok: true, candidates: [makeListRow()], pagination: {} })
      return Promise.reject(new Error('detail boom'))
    })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    const row = await screen.findByRole('button', { name: /inspect promotion candidate/i })
    await act(async () => { fireEvent.click(row) })
    expect(await screen.findByText(/could not open this promotion candidate/i)).toBeInTheDocument()
  })
})

// ── 5. Read-only boundary regression ───────────────────────────────────────────
describe('read-only boundary', () => {
  it('never issues a write call (no POST/PATCH/PUT/DELETE) across list + detail + back', async () => {
    setApi({ candidates: [makeListRow()] })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    const row = await screen.findByRole('button', { name: /inspect promotion candidate/i })
    await act(async () => { fireEvent.click(row) })
    await screen.findByRole('region', { name: /promotion candidate detail/i })
    const back = screen.getByRole('button', { name: /back to the promotion queue/i })
    await act(async () => { fireEvent.click(back) })

    expect(apiPost).not.toHaveBeenCalled()
    expect(apiPut).not.toHaveBeenCalled()
    expect(apiPatch).not.toHaveBeenCalled()
    expect(apiDelete).not.toHaveBeenCalled()
    // Every GET is to the two allowed read endpoints only.
    for (const [path] of apiGet.mock.calls) {
      expect(path === LIST_PATH || path.startsWith(`${LIST_PATH}/`)).toBe(true)
    }
  })

  it('exposes no forbidden mutation copy in the rendered text', async () => {
    setApi({ candidates: [makeListRow()] })
    const { container } = render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    const row = await screen.findByRole('button', { name: /inspect promotion candidate/i })
    await act(async () => { fireEvent.click(row) })
    await screen.findByRole('region', { name: /promotion candidate detail/i })
    const text = container.textContent || ''
    for (const phrase of ['Venue DNA updated', 'HESTIA learned this', 'Use this in DNA', 'Promote to DNA', 'confirmed meaning']) {
      expect(text).not.toContain(phrase)
    }
  })
})
