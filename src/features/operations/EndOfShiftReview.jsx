import { useState, useMemo } from 'react'
import { cx } from '../../utils/format'
import { Card, Header } from '../../components/AppPrimitives'
import {
  deriveOperationalActions, enrichActions,
  getCarryForwardActions, getUrgentActions,
  loadManagerActionStatuses, loadManagerActionCarryForward,
  saveEndOfShiftReview,
  PRIORITY_STYLE, PRIORITY_LABEL, SOURCE_LABEL,
} from './operationalIntelligenceUtils'

const TODAY = new Date().toISOString().slice(0, 10)

// ─── EndOfShiftReview ─────────────────────────────────────────────────────────
export default function EndOfShiftReview({
  actionItems      = [],
  serviceIncidents = [],
  shiftNotes       = [],
  reportArchive    = [],
  currentUser,
  onArchiveReport,
}) {
  const [urgentItems,    setUrgentItems]    = useState('')
  const [complaints,     setComplaints]     = useState('')
  const [highlights,     setHighlights]     = useState('')
  const [generalNotes,   setGeneralNotes]   = useState('')
  const [flagForOwner,   setFlagForOwner]   = useState(false)
  const [submitted,      setSubmitted]      = useState(false)

  // Derive enriched actions to pre-fill carry-forward context
  const enriched = useMemo(() => {
    const statuses      = loadManagerActionStatuses()
    const carryForwards = loadManagerActionCarryForward()
    const derived       = deriveOperationalActions(actionItems, serviceIncidents, shiftNotes, reportArchive)
    return enrichActions(derived, statuses, carryForwards, serviceIncidents, actionItems)
  }, [actionItems, serviceIncidents, shiftNotes, reportArchive])

  const carryForwardItems = useMemo(() => getCarryForwardActions(enriched), [enriched])
  const urgentUnresolved  = useMemo(() => getUrgentActions(enriched),       [enriched])

  const openCount   = enriched.filter(a => a.status !== 'resolved').length
  const resolvedCount = enriched.filter(a => a.status === 'resolved').length

  function handleSubmit(e) {
    e.preventDefault()
    const review = {
      id:             `eod-${Date.now()}`,
      shift_date:     TODAY,
      manager_name:   currentUser?.username || currentUser?.name || 'Manager',
      manager_role:   currentUser?.role || '',
      urgent_items:   urgentItems.trim(),
      complaints:     complaints.trim(),
      highlights:     highlights.trim(),
      general_notes:  generalNotes.trim(),
      flaggedForOwner: flagForOwner,
      carry_forward_count: carryForwardItems.length,
      open_count:     openCount,
      resolved_count: resolvedCount,
      submitted_at:   new Date().toISOString(),
    }
    saveEndOfShiftReview(review)
    onArchiveReport?.(review)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/20 mb-6">✓</div>
        <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e] mb-3">Review Saved</div>
        <h2 className="font-serif text-4xl font-black text-[#f5f5f0] mb-4">End-of-shift review complete.</h2>
        <p className="text-[#e8dcc0]/60 text-sm max-w-md">
          Saved to shift archive.{flagForOwner ? ' Flagged for owner review.' : ''}
          {carryForwardItems.length > 0 && ` ${carryForwardItems.length} item${carryForwardItems.length !== 1 ? 's' : ''} will appear in the next pre-shift briefing.`}
        </p>
      </div>
    )
  }

  return (
    <>
      <Header
        eyebrow="Shift Handoff"
        title="End-of-Shift Review"
        body="Close out this shift. Capture urgent hand-offs, guest complaints, and wins. Carry-forward items are pre-populated from Manager Action Center."
      />

      {/* Operational snapshot */}
      <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Still Open',    value: openCount,             danger: openCount > 0,           accent: false },
          { label: 'Resolved',      value: resolvedCount,         accent: resolvedCount > 0,       danger: false },
          { label: 'Carry Forward', value: carryForwardItems.length, accent: carryForwardItems.length > 0, danger: false },
          { label: 'Urgent Open',   value: urgentUnresolved.length, danger: urgentUnresolved.length > 0,  accent: false },
        ].map(({ label, value, danger, accent }) => (
          <div key={label} className={cx(
            'rounded-2xl border p-4',
            danger ? 'border-red-800/35 bg-red-950/10' : accent ? 'border-[#c9a96e]/15 bg-[#c9a96e]/5' : 'border-[#6b705c]/15 bg-[#14130f]'
          )}>
            <div className={cx(
              'font-serif text-3xl font-black',
              danger ? 'text-red-300' : accent ? 'text-[#c9a96e]' : 'text-[#f5f5f0]'
            )}>{value}</div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/45">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        {/* Review form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {urgentUnresolved.length > 0 && (
            <div className="rounded-2xl border border-red-800/30 bg-red-950/10 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-red-300 mb-2">Urgent Unresolved — Handoff Required</div>
              <ul className="space-y-1">
                {urgentUnresolved.slice(0, 5).map(a => (
                  <li key={a.id} className="text-xs leading-5 text-red-300/70">
                    {SOURCE_LABEL[a.source] || a.source}: {a.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">
              Urgent Items for Next Shift
            </label>
            <textarea
              value={urgentItems}
              onChange={e => setUrgentItems(e.target.value)}
              rows={3}
              placeholder="Anything that cannot wait — equipment failures, unresolved guest issues, staffing gaps…"
              className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#14130f] px-4 py-3 text-sm text-[#f5f5f0] placeholder:text-[#e8dcc0]/25 focus:border-[#c9a96e]/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">
              Guest Complaints or Incidents to Escalate
            </label>
            <textarea
              value={complaints}
              onChange={e => setComplaints(e.target.value)}
              rows={3}
              placeholder="Guest complaints or service failures that require follow-up…"
              className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#14130f] px-4 py-3 text-sm text-[#f5f5f0] placeholder:text-[#e8dcc0]/25 focus:border-[#c9a96e]/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">
              Shift Highlights
            </label>
            <textarea
              value={highlights}
              onChange={e => setHighlights(e.target.value)}
              rows={2}
              placeholder="What went well? Staff performance, guest feedback, wins…"
              className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#14130f] px-4 py-3 text-sm text-[#f5f5f0] placeholder:text-[#e8dcc0]/25 focus:border-[#c9a96e]/50 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">
              General Notes
            </label>
            <textarea
              value={generalNotes}
              onChange={e => setGeneralNotes(e.target.value)}
              rows={3}
              placeholder="Anything else worth noting — stock, training, supplier, atmosphere…"
              className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#14130f] px-4 py-3 text-sm text-[#f5f5f0] placeholder:text-[#e8dcc0]/25 focus:border-[#c9a96e]/50 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[#6b705c]/20 bg-[#14130f] px-4 py-3">
            <button
              type="button"
              onClick={() => setFlagForOwner(v => !v)}
              className={cx(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] font-black transition',
                flagForOwner
                  ? 'border-[#c9a96e] bg-[#c9a96e] text-[#0d0c09]'
                  : 'border-[#6b705c]/40 hover:border-[#c9a96e]'
              )}
            >
              {flagForOwner ? '✓' : ''}
            </button>
            <div>
              <div className="text-xs font-black text-[#f5f5f0]">Flag for owner review</div>
              <div className="text-[10px] text-[#e8dcc0]/40">This review will appear in the Operational Pulse owner view.</div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-[#c9a96e] py-3 text-sm font-black uppercase tracking-widest text-[#0d0c09] transition hover:bg-[#e8d0a0]"
          >
            Submit End-of-Shift Review
          </button>
        </form>

        {/* Carry-forward preview */}
        <div className="space-y-4">
          {carryForwardItems.length > 0 ? (
            <Card>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-3">
                Items Carrying Forward ({carryForwardItems.length})
              </div>
              <div className="space-y-2.5">
                {carryForwardItems.map(a => (
                  <div key={a.id} className="flex items-start gap-2">
                    <span className={cx('shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]', PRIORITY_STYLE[a.priority])}>
                      {PRIORITY_LABEL[a.priority]}
                    </span>
                    <span className="text-xs leading-5 text-[#e8dcc0]">{a.title}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-[#e8dcc0]/30">
                These will appear in tomorrow's Pre-Shift Briefing carry-forward panel.
              </p>
            </Card>
          ) : (
            <Card>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">Carry Forward</div>
              <p className="text-xs text-[#e8dcc0]/45">
                No items flagged for carry-forward. Flag items in Manager Action Center before closing out.
              </p>
            </Card>
          )}

          <div className="rounded-2xl border border-[#6b705c]/15 bg-[#14130f] px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/40 mb-1.5">Shift Summary</div>
            <div className="space-y-1 text-[10px] text-[#e8dcc0]/35">
              <div>Manager: {currentUser?.username || currentUser?.name || '—'}</div>
              <div>Date: {TODAY}</div>
              <div>Actions resolved this shift: {resolvedCount}</div>
              <div>Still open: {openCount}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
