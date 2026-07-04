// Rendered-DOM regression for ConstraintsForm (Employee Availability), covering the
// "Employee record not found for this user." fix:
//  - an unlinked employee profile shows a blocking setup callout, disables Submit, and
//    never reports success;
//  - a linked employee can submit and sees the success state, with the request carrying
//    week_start + constraints;
//  - a submit that fails with the unlinked error flips to the setup callout (not a
//    generic failure) and does not show "submitted".
//
// The API client is mocked so no network/server is touched.

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ConstraintsForm from './ConstraintsForm.jsx'

const { apiGet, apiPost } = vi.hoisted(() => ({ apiGet: vi.fn(), apiPost: vi.fn() }))
vi.mock('../../services/api/client', () => ({ apiGet, apiPost }))

beforeEach(() => {
  apiGet.mockReset()
  apiPost.mockReset()
})

describe('ConstraintsForm — unlinked employee profile', () => {
  it('shows a setup callout, disables submit, and never claims success', async () => {
    apiGet.mockResolvedValue({ constraints: [], profileLinked: false })
    render(<ConstraintsForm />)

    await waitFor(() => expect(screen.getByText(/Availability can’t be submitted yet/i)).toBeInTheDocument())
    expect(screen.getByText(/not linked to this user/i)).toBeInTheDocument()

    const submit = screen.getByRole('button', { name: /Submit Availability/i })
    expect(submit).toBeDisabled()

    fireEvent.click(submit)
    expect(apiPost).not.toHaveBeenCalled()
    expect(screen.queryByText(/Availability submitted/i)).not.toBeInTheDocument()
  })
})

describe('ConstraintsForm — linked employee', () => {
  // Fake ONLY Date (leave timers real so waitFor/promises work) to a Monday 10:00 so the
  // submission window is deterministically open regardless of when the suite runs.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-07-06T10:00:00')) // Monday
  })
  afterEach(() => { vi.useRealTimers() })

  it('submits availability and shows success', async () => {
    apiGet.mockResolvedValue({ constraints: [], profileLinked: true })
    apiPost.mockResolvedValue({ ok: true })
    render(<ConstraintsForm />)

    const submit = await screen.findByRole('button', { name: /Submit Availability/i })
    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)
    await waitFor(() => expect(apiPost).toHaveBeenCalledTimes(1))
    const [route, body] = apiPost.mock.calls[0]
    expect(route).toBe('/api/employee-shifts/constraints')
    expect(body).toHaveProperty('week_start')
    expect(body).toHaveProperty('constraints')
    await waitFor(() => expect(screen.getByText(/Availability submitted/i)).toBeInTheDocument())
  })

  it('treats a 400 "not linked" submit error as a setup problem, not a generic failure', async () => {
    apiGet.mockResolvedValue({ constraints: [], profileLinked: true })
    const err = new Error('Employee profile is not linked to this user. Ask a manager to activate this employee profile.')
    err.status = 400
    apiPost.mockRejectedValue(err)
    render(<ConstraintsForm />)

    const submit = await screen.findByRole('button', { name: /Submit Availability/i })
    expect(submit).not.toBeDisabled()
    fireEvent.click(submit)

    await waitFor(() => expect(screen.getByText(/Availability can’t be submitted yet/i)).toBeInTheDocument())
    expect(screen.queryByText(/Availability submitted/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^Submission failed\.$/)).not.toBeInTheDocument()
  })
})
