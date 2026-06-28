// Rendered DOM regression for OwnerMeaningPromotionQueue (Owner Meaning Promotion — review queue,
// Slice 4H read + Slice 4M owner review).
//
// Renders the component with React Testing Library + jsdom and exercises real behavior — the
// owner-only render gate, the list/detail reads, the blocked-application display, honest empty/error
// states, AND the new owner review decisions (approve-meaning / reject / request-revision) wired to the
// three existing owner-only review POST routes. It proves the hard boundary: the ONLY writes are those
// three review POSTs (no PUT/PATCH/DELETE, no other POST), there is no Apply-to-DNA / propose-DNA-patch
// / mark-evidence-only control or copy, the component never references mergeVenueDna, application stays
// blocked after a decision, and approve_meaning is textually distinct from any DNA application. The API
// client is mocked so no network/server is touched.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { render, screen, within, fireEvent, waitFor, act } from '@testing-library/react'
import OwnerMeaningPromotionQueue from './OwnerMeaningPromotionQueue'

// Hoisted mocks for the API client the component imports ('../../services/api/client'). It only ever
// imports apiGet + apiPost — proving (by absence) there is no PUT/PATCH/DELETE write path.
const { apiGet, apiPost, apiPut, apiPatch, apiDelete } = vi.hoisted(() => ({
  apiGet: vi.fn(), apiPost: vi.fn(), apiPut: vi.fn(), apiPatch: vi.fn(), apiDelete: vi.fn(),
}))
vi.mock('../../services/api/client', () => ({ apiGet, apiPost, apiPut, apiPatch, apiDelete }))

const LIST_PATH = '/api/owner-meaning-promotion-candidates'
const CAND_ID = 'cand-aaaa1111bbbb2222'
const DETAIL_PATH = `${LIST_PATH}/${CAND_ID}`

function makeListRow(overrides = {}) {
  return {
    id: CAND_ID,
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
  const base = {
    ok: true,
    candidate: {
      id: CAND_ID,
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
    // The read route keeps every action false; the UI derives reviewability from candidate.status.
    allowed_actions: { approve: false, reject: false, request_revision: false, apply_to_dna: false },
  }
  return { ...base, ...overrides, candidate: { ...base.candidate, ...(overrides.candidate || {}) } }
}

// A "decided" detail (post-approval): non-reviewable status + recorded review fields + the decision event.
function makeApprovedDetail(note = null) {
  return makeDetail({
    candidate: {
      status: 'owner_approved',
      review: { reviewed_at: '2026-06-27 11:00:00', reviewed_by_user_id: 'owner-1', owner_decision_note: note, approved_at: '2026-06-27 11:00:00', rejected_at: null },
    },
    events: [
      { id: 'ev-1', event_type: 'candidate_created', created_at: '2026-06-27 10:00:00', actor_type: 'system', previous_status: null, next_status: 'draft_suggestion' },
      { id: 'ev-2', event_type: 'owner_approved', created_at: '2026-06-27 11:00:00', actor_type: 'owner', previous_status: 'needs_owner_review', next_status: 'owner_approved' },
    ],
  })
}

// Configure the mocked client. `detailAfter` (if given) is returned from the SECOND detail GET — i.e.
// the post-decision refresh — so a successful action can flip the rendered status.
function setApi({ candidates = [], counts = null, detail = makeDetail(), detailAfter = null } = {}) {
  let detailCalls = 0
  apiGet.mockImplementation((path) => {
    if (path === LIST_PATH) {
      return Promise.resolve({ ok: true, candidates, ...(counts ? { counts } : {}), pagination: { limit: 25, offset: 0, count: candidates.length, has_more: false } })
    }
    if (path.startsWith(`${LIST_PATH}/`)) {
      detailCalls += 1
      return Promise.resolve(detailCalls > 1 && detailAfter ? detailAfter : detail)
    }
    return Promise.resolve({})
  })
  apiPost.mockResolvedValue({ ok: true, action: 'approve_meaning', candidate: {}, note: 'Recorded the owner review decision. Venue DNA was not changed, and nothing was applied to DNA.' })
}

beforeEach(() => {
  apiGet.mockReset(); apiPost.mockReset(); apiPut.mockReset(); apiPatch.mockReset(); apiDelete.mockReset()
  setApi()
})

const owner = { role: 'owner', full_name: 'Tal Millo' }

async function openDetail(opts = {}) {
  setApi({ candidates: [makeListRow()], ...opts })
  render(<OwnerMeaningPromotionQueue currentUser={owner} />)
  const row = await screen.findByRole('button', { name: /promotion candidate/i })
  await act(async () => { fireEvent.click(row) })
  return screen.findByRole('region', { name: /promotion candidate detail/i })
}

// ── 1. Role gate ──────────────────────────────────────────────────────────────
describe('role gate', () => {
  it('renders the queue for the owner', async () => {
    setApi({ candidates: [makeListRow()] })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    expect(await screen.findByText('Meaning Promotion Queue · owner review')).toBeInTheDocument()
  })

  it.each([
    ['admin', { role: 'admin' }],
    ['manager', { role: 'manager' }],
    ['bar_manager', { role: 'bar_manager' }],
    ['chef', { role: 'chef' }],
    ['employee', { role: 'employee' }],
    ['missing role', {}],
    ['no user', undefined],
  ])('renders nothing for %s and never fetches or writes', (_label, user) => {
    const { container } = render(<OwnerMeaningPromotionQueue currentUser={user} />)
    expect(container).toBeEmptyDOMElement()
    expect(apiGet).not.toHaveBeenCalled()
    expect(apiPost).not.toHaveBeenCalled()
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

  it('renders a reviewable candidate row with status, blocked, and review-available affordances', async () => {
    setApi({ candidates: [makeListRow()], counts: { needs_owner_review: 1, owner_approved: 0 } })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    expect(await screen.findByText('Owner notes')).toBeInTheDocument()
    expect(screen.getByText('Needs owner review')).toBeInTheDocument()
    expect(screen.getByText('application blocked')).toBeInTheDocument()
    expect(screen.getByText('review available')).toBeInTheDocument()
    expect(screen.getByText(/low confidence/)).toBeInTheDocument()
  })

  it('marks an already-decided candidate row as reviewed (not review available)', async () => {
    setApi({ candidates: [makeListRow({ status: 'owner_approved' })] })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    expect(await screen.findByText('reviewed')).toBeInTheDocument()
    expect(screen.queryByText('review available')).toBeNull()
  })
})

// ── 3. Detail read display ─────────────────────────────────────────────────────
describe('detail read display', () => {
  it('fetches the candidate detail from the GET detail route', async () => {
    const region = await openDetail()
    expect(apiGet).toHaveBeenCalledWith(DETAIL_PATH)
    expect(region).toBeInTheDocument()
  })

  it('renders the proposed diff marked as not applied, plus verbatim source evidence + audit timeline', async () => {
    const region = await openDetail()
    const r = within(region)
    expect(r.getByText(/Proposed change · not applied/)).toBeInTheDocument()
    expect(r.getByText(/Proposed value \(after — not applied\)/)).toBeInTheDocument()
    expect(r.getByText('We host guests, not customers.')).toBeInTheDocument()  // verbatim raw owner words
    expect(r.getByText(/candidate_created/)).toBeInTheDocument()               // audit timeline
  })

  it('renders application.blocked and the DNA-unchanged copy', async () => {
    const region = await openDetail()
    const r = within(region)
    expect(r.getByText(/Application is blocked in this slice\./)).toBeInTheDocument()
    expect(r.getByText(/Venue DNA is unchanged\./)).toBeInTheDocument()
  })

  it('keeps contradictions / missing-factor empty states honest', async () => {
    const region = await openDetail({
      detail: makeDetail({ candidate: { confidence: { label: 'low', score: null, factors: {}, contradictions: [], missing_evidence: [] } } }),
    })
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

// ── 4. Owner review — controls visibility + copy ────────────────────────────────
describe('owner review controls', () => {
  it('shows the three review controls for a reviewable candidate, as real buttons', async () => {
    const region = await openDetail()
    const r = within(region)
    expect(r.getByRole('button', { name: /^Approve meaning$/ })).toBeInTheDocument()
    expect(r.getByRole('button', { name: /^Reject candidate$/ })).toBeInTheDocument()
    expect(r.getByRole('button', { name: /^Request revision$/ })).toBeInTheDocument()
  })

  it('explains that approving meaning does not change Venue DNA and application stays blocked', async () => {
    const region = await openDetail()
    const r = within(region)
    expect(r.getByText(/Approving the meaning confirms HESTIA understood the owner intent\./)).toBeInTheDocument()
    expect(r.getByText(/does not apply anything to\s+Venue DNA/i)).toBeInTheDocument()
    expect(r.getByText(/application remains blocked/i)).toBeInTheDocument()
  })

  it('shows NO review controls for an already-decided candidate (server is authoritative)', async () => {
    const region = await openDetail({ detail: makeApprovedDetail('Yes, exactly right.') })
    const r = within(region)
    expect(r.queryByRole('button', { name: /^Approve meaning$/ })).toBeNull()
    expect(r.queryByRole('button', { name: /^Reject candidate$/ })).toBeNull()
    expect(r.queryByRole('button', { name: /^Request revision$/ })).toBeNull()
    expect(r.getByText(/This candidate has been decided/i)).toBeInTheDocument()
    expect(r.getByText(/Yes, exactly right\./)).toBeInTheDocument()  // recorded decision note
  })

  it('never renders an Apply-to-DNA / Promote / Update-Venue-DNA / Confirm-DNA control', async () => {
    const region = await openDetail()
    // The only decision buttons are the three review actions + their forms; nothing claims DNA application.
    expect(screen.queryByRole('button', { name: /apply to dna|update venue dna|promote to dna|confirm dna|propose.*patch|evidence only/i })).toBeNull()
    expect(within(region).queryByText(/Apply to DNA|Update Venue DNA|Promote to DNA|Confirm DNA|DNA updated|Changes applied|Published to DNA/i)).toBeNull()
  })
})

// ── 5. Owner review — actions call the three existing POST routes ────────────────
describe('owner review actions', () => {
  it('approve-meaning POSTs to /approve-meaning and refreshes the candidate + list', async () => {
    const region = await openDetail({ detailAfter: makeApprovedDetail() })
    const r = within(region)
    await act(async () => { fireEvent.click(r.getByRole('button', { name: /^Approve meaning$/ })) })   // open confirm
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Approve meaning$/ })) }) // confirm

    expect(apiPost).toHaveBeenCalledTimes(1)
    expect(apiPost).toHaveBeenCalledWith(`${DETAIL_PATH}/approve-meaning`, {})
    // Success feedback + refreshed (now-decided) state.
    expect(await screen.findByText(/Meaning approved\./)).toBeInTheDocument()
    expect(await screen.findByText('Owner approved')).toBeInTheDocument()
    // Refresh: a second detail GET + a list reload happened.
    expect(apiGet.mock.calls.filter(([p]) => p === DETAIL_PATH).length).toBeGreaterThanOrEqual(2)
    expect(apiGet.mock.calls.filter(([p]) => p === LIST_PATH).length).toBeGreaterThanOrEqual(2)
  })

  it('reject POSTs to /reject with the optional reason', async () => {
    const region = await openDetail({ detailAfter: makeDetail({ candidate: { status: 'owner_rejected' } }) })
    const r = within(region)
    await act(async () => { fireEvent.click(r.getByRole('button', { name: /^Reject candidate$/ })) })
    const reason = screen.getByLabelText(/Why is this candidate wrong/i)
    await act(async () => { fireEvent.change(reason, { target: { value: 'Not relevant to identity.' } }) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Reject candidate$/ })) })

    expect(apiPost).toHaveBeenCalledTimes(1)
    expect(apiPost).toHaveBeenCalledWith(`${DETAIL_PATH}/reject`, { reason: 'Not relevant to identity.' })
    expect(await screen.findByText(/Candidate rejected\./)).toBeInTheDocument()
  })

  it('request-revision POSTs to /request-revision with the revision text', async () => {
    const region = await openDetail({ detailAfter: makeDetail({ candidate: { status: 'revision_requested' } }) })
    const r = within(region)
    await act(async () => { fireEvent.click(r.getByRole('button', { name: /^Request revision$/ })) })
    const field = screen.getByLabelText(/What should HESTIA reinterpret/i)
    await act(async () => { fireEvent.change(field, { target: { value: 'Please reconsider the tone.' } }) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Request revision$/ })) })

    expect(apiPost).toHaveBeenCalledTimes(1)
    expect(apiPost).toHaveBeenCalledWith(`${DETAIL_PATH}/request-revision`, { reason: 'Please reconsider the tone.', revision_request: 'Please reconsider the tone.' })
    expect(await screen.findByText(/Revision requested\./)).toBeInTheDocument()
  })

  it('disables the request-revision confirm until revision text is entered', async () => {
    const region = await openDetail()
    const r = within(region)
    await act(async () => { fireEvent.click(r.getByRole('button', { name: /^Request revision$/ })) })
    expect(screen.getByRole('button', { name: /^Request revision$/ })).toBeDisabled()
    await act(async () => { fireEvent.change(screen.getByLabelText(/What should HESTIA reinterpret/i), { target: { value: 'x' } }) })
    expect(screen.getByRole('button', { name: /^Request revision$/ })).not.toBeDisabled()
  })

  it('application stays blocked after a successful approval', async () => {
    const region = await openDetail({ detailAfter: makeApprovedDetail() })
    const r = within(region)
    await act(async () => { fireEvent.click(r.getByRole('button', { name: /^Approve meaning$/ })) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Approve meaning$/ })) })
    expect(await screen.findByText('Owner approved')).toBeInTheDocument()
    expect(screen.getByText(/Application is blocked in this slice\./)).toBeInTheDocument()
  })
})

// ── 6. Owner review — conflict + forbidden + error handling ──────────────────────
describe('owner review error handling', () => {
  it('shows safe conflict copy on a 409 (already decided / not reviewable)', async () => {
    const region = await openDetail()
    apiPost.mockRejectedValueOnce(Object.assign(new Error('conflict'), { status: 409 }))
    const r = within(region)
    await act(async () => { fireEvent.click(r.getByRole('button', { name: /^Approve meaning$/ })) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Approve meaning$/ })) })
    expect(await screen.findByText(/already decided or is no longer reviewable/i)).toBeInTheDocument()
  })

  it('shows safe forbidden copy on a 403', async () => {
    const region = await openDetail()
    apiPost.mockRejectedValueOnce(Object.assign(new Error('forbidden'), { status: 403 }))
    const r = within(region)
    await act(async () => { fireEvent.click(r.getByRole('button', { name: /^Reject candidate$/ })) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Reject candidate$/ })) })
    expect(await screen.findByText(/owner-only\. Nothing was changed/i)).toBeInTheDocument()
  })

  it('shows a safe generic error on any other failure', async () => {
    const region = await openDetail()
    apiPost.mockRejectedValueOnce(new Error('boom'))
    const r = within(region)
    await act(async () => { fireEvent.click(r.getByRole('button', { name: /^Approve meaning$/ })) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Approve meaning$/ })) })
    expect(await screen.findByText(/could not record this review decision/i)).toBeInTheDocument()
  })
})

// ── 7. Read/error states (queue-level) ──────────────────────────────────────────
describe('queue error state', () => {
  it('shows a safe error and a retry when the list fetch fails', async () => {
    apiGet.mockRejectedValueOnce(new Error('boom'))
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    expect(await screen.findByText(/could not load the promotion queue/i)).toBeInTheDocument()
    expect(screen.getByText(/Nothing was changed/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry loading the queue/i })).toBeInTheDocument()
  })

  it('shows a safe error when the detail fetch fails', async () => {
    apiGet.mockImplementation((path) => {
      if (path === LIST_PATH) return Promise.resolve({ ok: true, candidates: [makeListRow()], pagination: {} })
      return Promise.reject(new Error('detail boom'))
    })
    render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    const row = await screen.findByRole('button', { name: /promotion candidate/i })
    await act(async () => { fireEvent.click(row) })
    expect(await screen.findByText(/could not open this promotion candidate/i)).toBeInTheDocument()
  })
})

// ── 8. Write-boundary regression ────────────────────────────────────────────────
describe('write boundary', () => {
  it('issues NO write call when only browsing (list + detail + back)', async () => {
    const region = await openDetail()
    const back = within(region).getByRole('button', { name: /back to the promotion queue/i })
    await act(async () => { fireEvent.click(back) })
    expect(apiPost).not.toHaveBeenCalled()
    expect(apiPut).not.toHaveBeenCalled()
    expect(apiPatch).not.toHaveBeenCalled()
    expect(apiDelete).not.toHaveBeenCalled()
  })

  it('the ONLY writes are the three review POST routes; never PUT/PATCH/DELETE', async () => {
    const region = await openDetail({ detailAfter: makeApprovedDetail() })
    const r = within(region)
    await act(async () => { fireEvent.click(r.getByRole('button', { name: /^Approve meaning$/ })) })
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Approve meaning$/ })) })

    expect(apiPut).not.toHaveBeenCalled()
    expect(apiPatch).not.toHaveBeenCalled()
    expect(apiDelete).not.toHaveBeenCalled()
    const allowedPost = new Set([`${DETAIL_PATH}/approve-meaning`, `${DETAIL_PATH}/reject`, `${DETAIL_PATH}/request-revision`])
    for (const [path] of apiPost.mock.calls) expect(allowedPost.has(path)).toBe(true)
    // Every GET is to the two allowed read endpoints only.
    for (const [path] of apiGet.mock.calls) {
      expect(path === LIST_PATH || path.startsWith(`${LIST_PATH}/`)).toBe(true)
    }
  })

  it('exposes no forbidden DNA-mutation copy in the rendered text', async () => {
    setApi({ candidates: [makeListRow()] })
    const { container } = render(<OwnerMeaningPromotionQueue currentUser={owner} />)
    const row = await screen.findByRole('button', { name: /promotion candidate/i })
    await act(async () => { fireEvent.click(row) })
    await screen.findByRole('region', { name: /promotion candidate detail/i })
    const text = container.textContent || ''
    for (const phrase of ['Apply to DNA', 'Update Venue DNA', 'Promote to DNA', 'Confirm DNA', 'DNA updated', 'Changes applied', 'Published to DNA', 'HESTIA learned this']) {
      expect(text).not.toContain(phrase)
    }
  })
})

// ── 9. Static source guards (file-level invariants) ─────────────────────────────
describe('static source guards', () => {
  const SRC = readFileSync(join(process.cwd(), 'src/features/owner-intelligence/OwnerMeaningPromotionQueue.jsx'), 'utf8')

  it('never references mergeVenueDna or any DNA-writing surface', () => {
    expect(SRC).not.toMatch(/mergeVenueDna/)
    expect(SRC).not.toMatch(/venue_dna_json|venue_intelligence_candidates|venue_dna_enrichment/)
  })

  it('uses none of the deferred apply/patch/evidence-only endpoints', () => {
    expect(SRC).not.toMatch(/apply-to-dna/)
    expect(SRC).not.toMatch(/propose-dna-patch/)
    expect(SRC).not.toMatch(/mark-evidence-only/)
  })

  it('references only the three existing review POST route slugs', () => {
    expect(SRC).toMatch(/approve-meaning/)
    expect(SRC).toMatch(/['"]reject['"]/)
    expect(SRC).toMatch(/request-revision/)
  })

  it('imports only apiGet + apiPost from the API client (no other verbs)', () => {
    const m = SRC.match(/import\s*\{([^}]*)\}\s*from\s*'\.\.\/\.\.\/services\/api\/client'/)
    expect(m).toBeTruthy()
    const named = m[1].split(',').map((s) => s.trim()).filter(Boolean).sort()
    expect(named).toEqual(['apiGet', 'apiPost'])
  })

  it('contains no forbidden DNA-application copy', () => {
    for (const phrase of ['Apply to DNA', 'Update Venue DNA', 'Promote to DNA', 'Confirm DNA', 'DNA updated', 'Changes applied', 'Published to DNA']) {
      expect(SRC).not.toContain(phrase)
    }
  })
})
