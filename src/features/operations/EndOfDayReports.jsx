import React, { useState, useMemo, useCallback } from 'react'
import { cx } from '../../utils/format'
import { loadEmailJS } from '../../utils/emailjs'
import { EMAILJS } from '../../config/systemConfig'
import { Card, Label, Header } from '../../components/AppPrimitives'
import {
  deriveOperationalActions, enrichActions,
  getCarryForwardActions, getUrgentActions,
  loadManagerActionStatuses, loadManagerActionCarryForward,
  saveEndOfShiftReview,
  PRIORITY_STYLE, PRIORITY_LABEL, SOURCE_LABEL,
} from './operationalIntelligenceUtils'

const TODAY = new Date().toISOString().slice(0, 10)

function SectionLabel({ children }) {
  return (
    <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-2">
      {children}
    </div>
  )
}

function ShiftTextArea({ value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#14130f] px-4 py-3 text-sm text-[#f5f5f0] placeholder:text-[#e8dcc0]/25 focus:border-[#c9a96e]/50 focus:outline-none resize-none"
    />
  )
}

export default function EndOfDayReports({
  t,
  currentUser,
  reportArchive    = [],
  onReportArchived,
  actionItems      = [],
  serviceIncidents = [],
  shiftNotes       = [],
  activeShift,
  onCloseShift,
  onSaveHandover,
}) {
  const [sending,          setSending]          = useState(false)
  const [submitted,        setSubmitted]        = useState(false)
  const [emailStatus,      setEmailStatus]      = useState(null)
  const [handoverDraft,    setHandoverDraft]    = useState('')
  const [handoverSaving,   setHandoverSaving]   = useState(false)
  const [handoverComplete, setHandoverComplete] = useState(false)
  const [handoverError,    setHandoverError]    = useState(null)

  // Form fields
  const [shiftDate,       setShiftDate]       = useState(TODAY)
  const [managerName,     setManagerName]     = useState(currentUser?.username || currentUser?.name || '')
  const [shiftSummary,    setShiftSummary]    = useState('')
  const [highlights,      setHighlights]      = useState('')
  const [urgentItems,     setUrgentItems]     = useState('')
  const [complaints,      setComplaints]      = useState('')
  const [serviceRecovery, setServiceRecovery] = useState('')
  const [staffIssues,     setStaffIssues]     = useState('')
  const [salesNotes,      setSalesNotes]      = useState('')
  const [generalNotes,    setGeneralNotes]    = useState('')
  const [flagForOwner,    setFlagForOwner]    = useState(false)

  // Operational intelligence
  const enriched = useMemo(() => {
    const statuses      = loadManagerActionStatuses()
    const carryForwards = loadManagerActionCarryForward()
    const derived       = deriveOperationalActions(actionItems, serviceIncidents, shiftNotes, reportArchive)
    return enrichActions(derived, statuses, carryForwards, serviceIncidents, actionItems)
  }, [actionItems, serviceIncidents, shiftNotes, reportArchive])

  const carryForwardItems = useMemo(() => getCarryForwardActions(enriched), [enriched])
  const urgentUnresolved  = useMemo(() => getUrgentActions(enriched),       [enriched])
  const openCount         = enriched.filter(a => a.status !== 'resolved').length
  const resolvedCount     = enriched.filter(a => a.status === 'resolved').length

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setSending(true)
    setEmailStatus(null)

    const review = {
      id:                  `eod-${Date.now()}`,
      shift_date:          shiftDate,
      manager_name:        managerName || currentUser?.username || 'Manager',
      manager_role:        currentUser?.role || '',
      shift_summary:       shiftSummary.trim(),
      highlights:          highlights.trim(),
      urgent_items:        urgentItems.trim(),
      complaints:          complaints.trim(),
      service_recovery:    serviceRecovery.trim(),
      staff_issues:        staffIssues.trim(),
      sales_notes:         salesNotes.trim(),
      general_notes:       generalNotes.trim(),
      flaggedForOwner:     flagForOwner,
      carry_forward_count: carryForwardItems.length,
      open_count:          openCount,
      resolved_count:      resolvedCount,
      submitted_at:        new Date().toISOString(),
    }

    // Persist to local archive regardless of email
    saveEndOfShiftReview(review)

    // EmailJS — best effort, non-blocking
    try {
      const emailjs = await loadEmailJS()
      await emailjs.send(
        EMAILJS.serviceId,
        EMAILJS.templateId,
        {
          shift_date:       review.shift_date,
          manager_name:     review.manager_name,
          shift_summary:    review.shift_summary,
          complaints:       review.complaints,
          service_recovery: review.service_recovery,
          staff_issues:     review.staff_issues,
          sales_notes:      review.sales_notes,
          urgent_items:     review.urgent_items,
        },
        EMAILJS.publicKey
      )
      setEmailStatus('sent')
    } catch {
      setEmailStatus('failed')
    }

    await onReportArchived?.(review)

    // Stage 4: close the active shift in SQLite
    if (activeShift && onCloseShift) {
      try {
        await onCloseShift({ summary: shiftSummary.trim(), cover_count: null })
      } catch {
        // non-blocking — local report still saved
      }
    }

    setSending(false)
    setSubmitted(true)
  }, [
    shiftDate, managerName, shiftSummary, highlights, urgentItems,
    complaints, serviceRecovery, staffIssues, salesNotes, generalNotes,
    flagForOwner, carryForwardItems.length, openCount, resolvedCount,
    currentUser, onReportArchived, activeShift, onCloseShift,
  ])

  async function submitHandover() {
    if (!onSaveHandover) return
    setHandoverSaving(true)
    setHandoverError(null)
    try {
      await onSaveHandover(handoverDraft.trim())
      setHandoverComplete(true)
    } catch (err) {
      setHandoverError(err.message || 'Could not save handover. Please try again.')
    }
    setHandoverSaving(false)
  }

  if (submitted) {
    if (handoverComplete) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/20 mb-6">✓</div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e] mb-3">Handover Complete</div>
          <h2 className="font-serif text-4xl font-black text-[#f5f5f0] mb-4">Shift handed over.</h2>
          <p className="text-[#e8dcc0]/60 text-sm max-w-md">
            The next manager will see your handover note when they open their shift.
          </p>
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center py-16 text-center">
          <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/20 mb-6">✓</div>
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e] mb-3">Shift Closed Out</div>
          <h2 className="font-serif text-4xl font-black text-[#f5f5f0] mb-4">Review saved to archive.</h2>
          <p className="text-[#e8dcc0]/60 text-sm max-w-md">
            {emailStatus === 'sent' && 'Email report sent. '}
            {emailStatus === 'failed' && 'Email send failed — report saved locally. '}
            {flagForOwner ? 'Flagged for owner review. ' : ''}
            {carryForwardItems.length > 0 && `${carryForwardItems.length} item${carryForwardItems.length !== 1 ? 's' : ''} carrying forward to next pre-shift.`}
          </p>
        </div>

        {/* Stage 5 — Handover */}
        {onSaveHandover && (
          <div className="mt-4 rounded-2xl border border-[#c9a96e]/20 bg-[#14130f] p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#c9a96e] mb-3">
              Shift Handover — Step 5 of 5
            </div>
            <h3 className="font-serif text-2xl font-black text-[#f5f5f0] mb-2">Write a note for the next manager</h3>
            <p className="text-sm text-[#e8dcc0]/60 mb-5">
              This message will be available in the next pre-shift briefing. Include anything the next manager must know.
            </p>

            <textarea
              value={handoverDraft}
              onChange={e => setHandoverDraft(e.target.value)}
              rows={5}
              placeholder="e.g. The walk-in cooler is running warm — check temp before service. Table 8 had a complaint, customer may return tomorrow. Ice machine was slow, order extra bags…"
              className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#1a1a1a] px-4 py-3 text-sm text-[#f5f5f0] placeholder:text-[#e8dcc0]/25 focus:border-[#c9a96e]/50 focus:outline-none resize-none mb-4"
            />

            {handoverError && (
              <p className="mb-3 text-xs text-red-300">{handoverError}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={submitHandover}
                disabled={handoverSaving}
                className="flex-1 rounded-2xl bg-[#c9a96e] py-3 text-sm font-black uppercase tracking-widest text-[#0d0c09] transition hover:bg-[#e8d0a0] disabled:opacity-50"
              >
                {handoverSaving ? 'Saving…' : 'Complete Handover'}
              </button>
              <button
                type="button"
                onClick={() => setHandoverComplete(true)}
                className="rounded-2xl border border-[#6b705c]/30 px-5 text-xs font-black uppercase tracking-widest text-[#e8dcc0]/50 hover:text-[#e8dcc0]/80 transition"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Header
        eyebrow="Shift Closeout"
        title="Shift Closeout"
        body="Close out this shift — handoff notes, carry-forward items, and archived email report."
      />

      {/* Operational snapshot */}
      <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-4">
        {[
          { label: 'Still Open',    value: openCount,               danger: openCount > 0,              accent: false },
          { label: 'Resolved',      value: resolvedCount,           accent: resolvedCount > 0,          danger: false },
          { label: 'Carry Forward', value: carryForwardItems.length, accent: carryForwardItems.length > 0, danger: false },
          { label: 'Urgent Open',   value: urgentUnresolved.length, danger: urgentUnresolved.length > 0, accent: false },
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
        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {urgentUnresolved.length > 0 && (
            <div className="rounded-2xl border border-red-800/30 bg-red-950/10 px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-red-300 mb-2">
                Urgent Unresolved — Handoff Required
              </div>
              <ul className="space-y-1">
                {urgentUnresolved.slice(0, 5).map(a => (
                  <li key={a.id} className="text-xs leading-5 text-red-300/70">
                    {SOURCE_LABEL[a.source] || a.source}: {a.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Basic info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <SectionLabel>Shift Date</SectionLabel>
              <input
                type="date"
                value={shiftDate}
                onChange={e => setShiftDate(e.target.value)}
                className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#14130f] px-4 py-3 text-sm text-[#f5f5f0] focus:border-[#c9a96e]/50 focus:outline-none"
              />
            </div>
            <div>
              <SectionLabel>Manager on Duty</SectionLabel>
              <input
                type="text"
                value={managerName}
                onChange={e => setManagerName(e.target.value)}
                placeholder="Manager name"
                className="w-full rounded-2xl border border-[#6b705c]/30 bg-[#14130f] px-4 py-3 text-sm text-[#f5f5f0] placeholder:text-[#e8dcc0]/25 focus:border-[#c9a96e]/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Shift narrative */}
          <div>
            <SectionLabel>Shift Summary</SectionLabel>
            <ShiftTextArea
              value={shiftSummary}
              onChange={setShiftSummary}
              rows={3}
              placeholder="Overall shift narrative — pace, volume, atmosphere, notable moments…"
            />
          </div>

          <div>
            <SectionLabel>Shift Highlights</SectionLabel>
            <ShiftTextArea
              value={highlights}
              onChange={setHighlights}
              rows={2}
              placeholder="What went well? Staff performance, guest feedback, wins…"
            />
          </div>

          {/* Issues */}
          <div>
            <SectionLabel>Urgent Items for Next Shift</SectionLabel>
            <ShiftTextArea
              value={urgentItems}
              onChange={setUrgentItems}
              rows={3}
              placeholder="Anything that cannot wait — equipment failures, unresolved guest issues, staffing gaps…"
            />
          </div>

          <div>
            <SectionLabel>Guest Complaints / Incidents</SectionLabel>
            <ShiftTextArea
              value={complaints}
              onChange={setComplaints}
              rows={3}
              placeholder="Guest complaints or service failures that require follow-up…"
            />
          </div>

          <div>
            <SectionLabel>Service Recovery Actions Taken</SectionLabel>
            <ShiftTextArea
              value={serviceRecovery}
              onChange={setServiceRecovery}
              rows={2}
              placeholder="Comps issued, manager interventions, resolution steps…"
            />
          </div>

          {/* Operations */}
          <div>
            <SectionLabel>Staff Issues</SectionLabel>
            <ShiftTextArea
              value={staffIssues}
              onChange={setStaffIssues}
              rows={2}
              placeholder="Performance flags, lateness, conflicts, coaching needed…"
            />
          </div>

          <div>
            <SectionLabel>Sales & Revenue Notes</SectionLabel>
            <ShiftTextArea
              value={salesNotes}
              onChange={setSalesNotes}
              rows={2}
              placeholder="Bar performance, upsell wins, covers, revenue notes…"
            />
          </div>

          <div>
            <SectionLabel>General Notes</SectionLabel>
            <ShiftTextArea
              value={generalNotes}
              onChange={setGeneralNotes}
              rows={3}
              placeholder="Anything else worth noting — stock, training, supplier, atmosphere…"
            />
          </div>

          {/* Flag for owner */}
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
            disabled={sending}
            className="w-full rounded-2xl bg-[#c9a96e] py-3 text-sm font-black uppercase tracking-widest text-[#0d0c09] transition hover:bg-[#e8d0a0] disabled:opacity-50"
          >
            {sending ? 'Saving…' : 'Submit Shift Closeout Report'}
          </button>
        </form>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Carry-forward preview */}
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
                No items flagged for carry-forward. Flag items in Shift Control before closing out.
              </p>
            </Card>
          )}

          {/* Shift context */}
          <div className="rounded-2xl border border-[#6b705c]/15 bg-[#14130f] px-4 py-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/40 mb-2">This Shift</div>
            <div className="space-y-1 text-[10px] text-[#e8dcc0]/35">
              <div>Manager: {currentUser?.username || currentUser?.name || '—'}</div>
              <div>Date: {TODAY}</div>
              <div>Actions resolved: {resolvedCount}</div>
              <div>Still open: {openCount}</div>
            </div>
          </div>

          {/* Archive count */}
          <Card className="border-[#c9a96e]/20 bg-[#1a1a1a]">
            <Label>Report Archive</Label>
            <div className="font-serif text-5xl font-black text-[#c9a96e]">{reportArchive.length}</div>
            <p className="mt-2 text-sm leading-7 text-[#e8dcc0]">
              Shift reviews saved locally as operational memory.
            </p>
          </Card>

          {/* Recent reports */}
          {reportArchive.length > 0 && (
            <Card>
              <Label>Recent Reports</Label>
              <div className="space-y-3 mt-2">
                {reportArchive.slice(0, 4).map(report => (
                  <article key={report.id} className="rounded-xl border border-[#6b705c]/30 bg-[#1a1a1a] p-4">
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="text-xs font-black text-[#e8dcc0]">{report.shift_date}</span>
                      <span className="text-xs text-[#e8dcc0]/50">{report.manager_name || 'Manager'}</span>
                    </div>
                    <p className="line-clamp-2 text-xs leading-5 text-[#e8dcc0]/55">
                      {report.urgent_items || report.shift_summary || report.general_notes || 'Report submitted.'}
                    </p>
                  </article>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
