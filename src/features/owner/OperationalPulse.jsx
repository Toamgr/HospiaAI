import { useMemo } from 'react'
import { cx } from '../../utils/format'
import { Card, Header } from '../../components/AppPrimitives'
import {
  deriveOperationalActions, enrichActions,
  loadManagerActionStatuses, loadManagerActionCarryForward,
  loadEndOfShiftReviews,
  getOperationalPulseSummary,
  PRIORITY_STYLE, PRIORITY_LABEL, SOURCE_LABEL,
} from '../operations/operationalIntelligenceUtils'

// ─── Trust badge system ────────────────────────────────────────────────────────
const TRUST_CONFIG = {
  verified:         { label: 'Verified data',      dot: 'bg-emerald-400/70' },
  manager_reported: { label: 'Manager reported',   dot: 'bg-[#c9a96e]/70' },
  estimated:        { label: 'Estimated',          dot: 'bg-sky-400/70' },
  not_enough_data:  { label: 'Not enough data',    dot: 'bg-[#6b705c]/70' },
  demo_data:        { label: 'Demo data',          dot: 'bg-red-400/70' },
  ai_suggestion:    { label: 'AI suggestion',      dot: 'bg-violet-400/70' },
  deterministic:    { label: 'Deterministic rule', dot: 'bg-teal-400/70' },
}

function TrustBadge({ type }) {
  const cfg = TRUST_CONFIG[type]
  if (!cfg) return null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6b705c]/20 bg-[#6b705c]/8 px-2 py-0.5">
      <span className={cx('h-1.5 w-1.5 rounded-full shrink-0', cfg.dot)} />
      <span className="text-[9px] font-black uppercase tracking-[0.12em] text-[#e8dcc0]/45">{cfg.label}</span>
    </span>
  )
}

// ─── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ label, count, trust }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/70">
        {label}{count != null ? ` (${count})` : ''}
      </span>
      {trust && <TrustBadge type={trust} />}
    </div>
  )
}

// ─── Premium empty state ───────────────────────────────────────────────────────
function EmptyState({ headline, activates }) {
  return (
    <div className="rounded-2xl border border-[#6b705c]/12 bg-[#14130f] px-4 py-5">
      <p className="text-xs font-bold text-[#e8dcc0]/40 mb-2">{headline}</p>
      {activates && (
        <ul className="space-y-1.5 mt-2">
          {activates.map((a, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[10px] text-[#e8dcc0]/25 leading-4">
              <span className="mt-0.5 shrink-0 text-[#c9a96e]/30">·</span>
              {a}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ label, value, danger, accent }) {
  return (
    <div className={cx(
      'rounded-2xl border p-4',
      danger  ? 'border-red-800/35 bg-red-950/10'
      : accent ? 'border-[#c9a96e]/15 bg-[#c9a96e]/5'
               : 'border-[#6b705c]/15 bg-[#14130f]'
    )}>
      <div className={cx(
        'font-serif text-3xl font-black',
        danger  ? 'text-red-300'
        : accent ? 'text-[#c9a96e]'
                 : 'text-[#f5f5f0]'
      )}>{value}</div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/45">{label}</div>
    </div>
  )
}

// ─── Build natural-language owner brief ───────────────────────────────────────
function buildBriefText(pulse) {
  const parts = []
  if (pulse.urgentCount > 0)
    parts.push(`${pulse.urgentCount} urgent action${pulse.urgentCount !== 1 ? 's' : ''} unresolved`)
  if (pulse.incidentCount > 0)
    parts.push(`${pulse.incidentCount} open incident${pulse.incidentCount !== 1 ? 's' : ''}`)
  if (pulse.flaggedForOwnerCount > 0)
    parts.push(`${pulse.flaggedForOwnerCount} shift review${pulse.flaggedForOwnerCount !== 1 ? 's' : ''} flagged for your attention`)
  if (pulse.staleCount > 0)
    parts.push(`${pulse.staleCount} action${pulse.staleCount !== 1 ? 's' : ''} stale 3+ days`)
  if (parts.length === 0) {
    return pulse.openCount === 0
      ? 'No open actions, incidents, or flagged reviews. Operational load is clear.'
      : `${pulse.openCount} open action${pulse.openCount !== 1 ? 's' : ''} in progress — none flagged for owner attention.`
  }
  const [first, ...rest] = parts
  const joined = [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join('. ')
  return joined + '.'
}

// ─── OperationalPulse ─────────────────────────────────────────────────────────
export default function OperationalPulse({
  actionItems            = [],
  serviceIncidents       = [],
  shiftNotes             = [],
  reportArchive          = [],
  pulseData              = null,
  isLoadingPulse         = true,
  trends                 = [],
  insight                = null,
  isLoadingInsight       = false,
  insightError           = null,
  insightCooldownSeconds = 0,
  onRequestInsight       = null,
}) {
  // Prefer backend-synced reportArchive; fall back to localStorage only when prop is empty
  const reviews = useMemo(() => {
    if (Array.isArray(reportArchive) && reportArchive.length > 0) return reportArchive
    return loadEndOfShiftReviews()
  }, [reportArchive])

  const enriched = useMemo(() => {
    const statuses      = loadManagerActionStatuses()
    const carryForwards = loadManagerActionCarryForward()
    const derived       = deriveOperationalActions(actionItems, serviceIncidents, shiftNotes, reportArchive)
    return enrichActions(derived, statuses, carryForwards, serviceIncidents, actionItems)
  }, [actionItems, serviceIncidents, shiftNotes, reportArchive])

  const pulse = useMemo(() => getOperationalPulseSummary(enriched, reviews), [enriched, reviews])

  const dbShifts      = pulseData?.total_closed_shifts ?? 0
  const hasEnoughData = !isLoadingPulse && dbShifts >= 3

  // ── Loading gate — while pulse data is in flight ───────────────────────────
  if (isLoadingPulse) {
    return (
      <>
        <Header
          eyebrow="Operating Pulse"
          title="Owner Brief"
          body="HESTIA's view of your business — built from real manager activity, not estimates."
        />
        <Card>
          <div className="py-12 text-center">
            <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/[0.04] mb-4 select-none">◎</div>
            <p className="text-xs text-[#e8dcc0]/20 tracking-widest uppercase font-black">Loading operational data…</p>
          </div>
        </Card>
      </>
    )
  }

  // ── Not enough data gate ───────────────────────────────────────────────────
  if (!hasEnoughData) {
    return (
      <>
        <Header
          eyebrow="Operating Pulse"
          title="Owner Brief"
          body="HESTIA's view of your business — built from real manager activity, not estimates."
        />
        <Card>
          <div className="py-12 text-center">
            <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/[0.05] mb-4 select-none">◎</div>
            <p className="text-sm font-bold text-[#e8dcc0]/55 mb-2">Not enough data yet.</p>
            <p className="mx-auto max-w-sm text-xs leading-6 text-[#e8dcc0]/30 mb-4">
              Operating Pulse activates after 3 closed shifts.{dbShifts !== null ? ` ${dbShifts} of 3 completed.` : ''}
            </p>
            <div className="flex justify-center gap-2 flex-wrap">
              <TrustBadge type="not_enough_data" />
            </div>
          </div>
        </Card>
      </>
    )
  }

  const briefText          = buildBriefText(pulse)
  const hasRisk            = pulse.urgentItems.length > 0 || pulse.flaggedReviews.length > 0
  const riskCount          = pulse.urgentItems.length + pulse.flaggedReviews.length
  const hasDecisions       = pulse.flaggedForOwnerCount > 0 || pulse.staleCount > 0
  const decisionsCount     = pulse.flaggedForOwnerCount + pulse.staleCount
  const hasThemes          = pulse.themes.length > 0
  const hasTrends          = Array.isArray(trends) && trends.length > 0
  const recentCarryFwds    = pulse.recentReviews.filter(r => (r.carry_forward_count ?? 0) > 0).slice(0, 4)
  const hasWeeklySignals   = hasThemes || recentCarryFwds.length >= 2 || hasTrends

  return (
    <>
      <Header
        eyebrow="Operating Pulse"
        title="Owner Brief"
        body="HESTIA's view of your business — built from real manager activity, not estimates."
      />

      {/* ── 1. Owner Brief ──────────────────────────────────────────────────── */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <SectionHeader label="Owner Brief" trust="deterministic" />
        </div>

        <p className="text-base font-bold text-[#f5f5f0] leading-7 mb-5">{briefText}</p>

        {pulseData && (
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile label="Closed Shifts"        value={pulseData.total_closed_shifts}   accent />
            <StatTile label="Open Tasks"           value={pulseData.open_tasks}            danger={pulseData.open_tasks > 5} />
            <StatTile label="Unresolved Incidents" value={pulseData.unresolved_incidents}  danger={pulseData.unresolved_incidents > 0} />
            <StatTile label="Incidents (30 Days)"  value={pulseData.incidents_30d}         danger={pulseData.incidents_30d > 10} />
            <StatTile label="Approved Cocktails"   value={pulseData.approved_cocktails}    accent />
          </div>
        )}

        <p className="mt-3 text-[10px] text-[#e8dcc0]/25">
          Figures derived from closed shifts in the HESTIA database. No estimates or synthetic data.
        </p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">

          {/* ── 2. Today's Business Risk ──────────────────────────────────────── */}
          <Card>
            <SectionHeader
              label="Today's Business Risk"
              count={hasRisk ? riskCount : null}
              trust={hasRisk ? 'manager_reported' : 'not_enough_data'}
            />

            {!hasRisk ? (
              <EmptyState
                headline="No flags raised."
                activates={[
                  'Managers flagging a shift review for owner attention during End-of-Day closeout',
                  'Unresolved service incidents older than 24 hours',
                  'Action items marked Urgent not resolved before shift close',
                ]}
              />
            ) : (
              <div className="space-y-3">
                {pulse.urgentItems.map(a => (
                  <div key={a.id} className="rounded-xl border border-red-900/25 bg-red-950/8 px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={cx('shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]', PRIORITY_STYLE[a.priority])}>
                        {PRIORITY_LABEL[a.priority]}
                      </span>
                      <span className="text-[10px] text-[#e8dcc0]/35">{SOURCE_LABEL[a.source] || a.source}</span>
                    </div>
                    <p className="text-xs font-bold text-[#f5f5f0] leading-5">{a.title}</p>
                    {a.detail && <p className="mt-0.5 text-[10px] text-[#e8dcc0]/40 leading-4">{a.detail}</p>}
                    <div className="mt-2.5 space-y-0.5">
                      <p className="text-[10px] text-[#e8dcc0]/35 leading-4">
                        <span className="font-bold text-[#e8dcc0]/25">Why it matters  </span>
                        Unresolved urgent action — not closed before shift end.
                      </p>
                      <p className="text-[10px] text-[#e8dcc0]/35 leading-4">
                        <span className="font-bold text-[#e8dcc0]/25">What to do  </span>
                        Review with the shift manager. Confirm resolution or re-assign.
                      </p>
                      <p className="text-[10px] text-[#e8dcc0]/35 leading-4">
                        <span className="font-bold text-[#e8dcc0]/25">How HESTIA knows  </span>
                        Manager submitted this action via the Action Board. Status is still open.
                      </p>
                    </div>
                  </div>
                ))}

                {pulse.flaggedReviews.map(r => (
                  <div key={r.id} className="rounded-xl border border-amber-900/20 bg-amber-950/5 px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="rounded-full border border-amber-800/35 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-300/70">
                        Flagged review
                      </span>
                      <span className="text-[10px] text-[#e8dcc0]/40">{r.shift_date} · {r.manager_name}</span>
                    </div>
                    {r.urgent_items && (
                      <p className="text-xs text-[#e8dcc0]/70 mb-0.5 leading-5">
                        <span className="font-bold text-[#e8dcc0]/40">Urgent: </span>{r.urgent_items}
                      </p>
                    )}
                    {r.complaints && (
                      <p className="text-xs text-[#e8dcc0]/60 leading-5">
                        <span className="font-bold text-[#e8dcc0]/40">Complaints: </span>{r.complaints}
                      </p>
                    )}
                    <div className="mt-2.5 space-y-0.5">
                      <p className="text-[10px] text-[#e8dcc0]/35 leading-4">
                        <span className="font-bold text-[#e8dcc0]/25">What happened  </span>
                        Manager closed this shift and explicitly escalated it for owner review.
                      </p>
                      <p className="text-[10px] text-[#e8dcc0]/35 leading-4">
                        <span className="font-bold text-[#e8dcc0]/25">What to do  </span>
                        Read the full review. Decide whether follow-up action is needed.
                      </p>
                      <p className="text-[10px] text-[#e8dcc0]/35 leading-4">
                        <span className="font-bold text-[#e8dcc0]/25">How HESTIA knows  </span>
                        Manager toggled "Flag for owner" during End-of-Day closeout.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── 3. Decisions Needed ───────────────────────────────────────────── */}
          <Card>
            <SectionHeader
              label="Decisions Needed"
              count={hasDecisions ? decisionsCount : null}
              trust={hasDecisions ? 'manager_reported' : 'not_enough_data'}
            />

            {!hasDecisions ? (
              <EmptyState
                headline="Nothing requires your decision right now."
                activates={[
                  'End-of-shift reviews explicitly flagged for owner by the manager',
                  'Action items open for 3+ days without resolution',
                  'Budget requests awaiting owner response (activates when backend connected)',
                ]}
              />
            ) : (
              <div className="space-y-3">
                {pulse.flaggedForOwnerCount > 0 && (
                  <div className="rounded-xl border border-[#c9a96e]/15 bg-[#c9a96e]/4 px-3 py-3">
                    <p className="text-xs font-bold text-[#f5f5f0] mb-1">
                      {pulse.flaggedForOwnerCount} shift review{pulse.flaggedForOwnerCount !== 1 ? 's' : ''} flagged for owner
                    </p>
                    <p className="text-[10px] text-[#e8dcc0]/40 leading-5 mb-2">
                      Manager closed the shift and marked it for your review. Read the review in the archive and confirm you have seen it.
                    </p>
                    <TrustBadge type="manager_reported" />
                  </div>
                )}

                {pulse.staleCount > 0 && (
                  <div className="rounded-xl border border-amber-900/20 bg-amber-950/5 px-3 py-3">
                    <p className="text-xs font-bold text-[#f5f5f0] mb-1">
                      {pulse.staleCount} action{pulse.staleCount !== 1 ? 's' : ''} stale for 3+ days
                    </p>
                    <p className="text-[10px] text-[#e8dcc0]/40 leading-5 mb-2">
                      Items on the action board without resolution for 3 or more days. Decide: escalate, close, or re-assign to a specific manager.
                    </p>
                    <TrustBadge type="deterministic" />
                  </div>
                )}

                {pulse.carryForwardCount > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {pulse.carryForwardItems.map(a => (
                      <div key={a.id} className="flex items-start gap-2 rounded-xl border border-[#6b705c]/15 px-3 py-2">
                        <span className={cx('shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] mt-0.5', PRIORITY_STYLE[a.priority])}>
                          {PRIORITY_LABEL[a.priority]}
                        </span>
                        <span className="text-xs leading-5 text-[#e8dcc0]">{a.title}</span>
                        {a.daysOpen >= 3 && (
                          <span className="ml-auto shrink-0 text-[9px] font-bold text-amber-400/65 whitespace-nowrap">{a.daysOpen}d open</span>
                        )}
                      </div>
                    ))}
                    {pulse.carryForwardCount > pulse.carryForwardItems.length && (
                      <p className="text-[10px] text-[#e8dcc0]/25 pl-1">
                        +{pulse.carryForwardCount - pulse.carryForwardItems.length} more — see Shift Control
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* ── 4. What Changed Since Last Week ──────────────────────────────── */}
          <Card>
            <SectionHeader
              label="What Changed Since Last Week"
              trust={hasWeeklySignals ? 'deterministic' : 'not_enough_data'}
            />

            {!hasWeeklySignals ? (
              <EmptyState
                headline="Not enough shift history to detect patterns yet."
                activates={[
                  'Managers completing End-of-Day reviews consistently across multiple shifts',
                  'At least one full week of closed shift data',
                  'Carry-forward items tracked and resolved across consecutive shifts',
                ]}
              />
            ) : (
              <div className="space-y-5">

                {hasThemes && (
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/35 mb-2">
                      Recurring Themes
                    </div>
                    <div className="space-y-1.5">
                      {pulse.themes.map(({ theme, count }) => (
                        <div key={theme} className="flex items-center justify-between rounded-xl border border-[#6b705c]/15 px-3 py-2">
                          <span className="text-xs text-[#e8dcc0]">{theme}</span>
                          <span className="text-xs font-black text-[#c9a96e]">{count} action{count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-[#e8dcc0]/25">
                      Derived by keyword matching from open action text. No AI inference.
                    </p>
                  </div>
                )}

                {recentCarryFwds.length >= 2 && (
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/35 mb-2">
                      Carry-Forward Pattern
                    </div>
                    <div className="space-y-1">
                      {recentCarryFwds.map(r => (
                        <div key={r.id} className="flex items-center gap-2 text-[10px] text-[#e8dcc0]/50">
                          <span className="font-bold text-[#c9a96e]/60">{r.shift_date}</span>
                          <span>{r.carry_forward_count} carried forward</span>
                          {r.manager_name && <span className="text-[#e8dcc0]/30">· {r.manager_name}</span>}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] text-[#e8dcc0]/25">
                      Items not resolved by shift close, passed to the next shift. A persistent pattern signals an unresolved systemic issue.
                    </p>
                  </div>
                )}

                {hasTrends && (
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/35 mb-2">
                      Backend Trends
                    </div>
                    <div className="space-y-1">
                      {trends.slice(0, 5).map((tr, i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-[#6b705c]/12 px-3 py-2">
                          <span className="text-xs text-[#e8dcc0]/70">{tr.label ?? `Trend ${i + 1}`}</span>
                          <span className="text-xs font-black text-[#c9a96e]">{tr.value ?? '—'}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2"><TrustBadge type="verified" /></div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* ── 5. Trust · Source Explanation ────────────────────────────────── */}
          <Card>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/70 mb-3">
              Trust · Source Explanation
            </div>
            <p className="text-xs text-[#e8dcc0]/45 leading-6 mb-4">
              Every figure on this page has a declared source. HESTIA does not display estimates as facts or invent data when inputs are missing.
            </p>
            <div className="space-y-3">
              {[
                { type: 'verified',         desc: 'Count derived from the HESTIA database — closed shifts, task records, incident logs.' },
                { type: 'manager_reported', desc: 'Text or flag entered by a manager during shift close or action submission.' },
                { type: 'deterministic',    desc: 'Computed from real data by a fixed rule — e.g., stale = open more than 3 days, themes = keyword match.' },
                { type: 'ai_suggestion',    desc: 'Generated by Claude AI from live operational context. Not a verified fact — use as a prompt for reflection.' },
                { type: 'not_enough_data',  desc: 'HESTIA has seen less data than required to compute this. No estimate or placeholder is shown.' },
                { type: 'estimated',        desc: 'Approximate — based on patterns, not verified records. Shown only when clearly labelled.' },
                { type: 'demo_data',        desc: 'Synthetic data used in demonstrations. Not connected to your venue.' },
              ].map(({ type, desc }) => (
                <div key={type} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0"><TrustBadge type={type} /></div>
                  <p className="text-[10px] text-[#e8dcc0]/35 leading-4">{desc}</p>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* ── Right column — Shift Review Archive ──────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/60">
              Recent End-of-Shift Reviews
            </div>
            <TrustBadge type="manager_reported" />
          </div>

          {pulse.recentReviews.length === 0 ? (
            <EmptyState
              headline="No shift reviews submitted yet."
              activates={[
                'Managers completing End-of-Day closeout',
                'Shift summary and handoff notes entered before closing',
              ]}
            />
          ) : (
            pulse.recentReviews.map(r => (
              <div
                key={r.id}
                className={cx(
                  'rounded-2xl border p-4',
                  r.flaggedForOwner
                    ? 'border-red-800/30 bg-red-950/8'
                    : 'border-[#6b705c]/20 bg-[#14130f]'
                )}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-black text-[#c9a96e]">{r.shift_date}</span>
                  <span className="text-[10px] text-[#e8dcc0]/45">{r.manager_name}</span>
                  {r.flaggedForOwner && (
                    <span className="rounded-full border border-red-800/40 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-red-300/80">
                      Flagged
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-[10px] text-[#e8dcc0]/40 mb-2">
                  <span>Resolved: {r.resolved_count ?? '—'}</span>
                  <span>Still open: {r.open_count ?? '—'}</span>
                  <span>Carry-fwd: {r.carry_forward_count ?? '—'}</span>
                </div>

                {r.urgent_items && (
                  <p className="text-xs leading-5 text-[#e8dcc0]/65 mb-1 line-clamp-2">
                    <span className="font-bold text-[#e8dcc0]/50">Urgent: </span>{r.urgent_items}
                  </p>
                )}
                {r.highlights && (
                  <p className="text-xs leading-5 text-[#e8dcc0]/50 line-clamp-2">
                    <span className="font-bold text-[#e8dcc0]/35">Highlights: </span>{r.highlights}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── AI Operational Insight ────────────────────────────────────────────── */}
      {onRequestInsight && (
        <Card className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/60">
                AI Operational Insight
              </div>
              <TrustBadge type="ai_suggestion" />
            </div>
            <button
              type="button"
              disabled={isLoadingInsight || insightCooldownSeconds > 0}
              onClick={onRequestInsight}
              className={cx(
                'rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors',
                isLoadingInsight || insightCooldownSeconds > 0
                  ? 'border-[#6b705c]/20 text-[#e8dcc0]/25 cursor-not-allowed'
                  : 'border-[#c9a96e]/30 text-[#c9a96e] hover:border-[#c9a96e]/60'
              )}
            >
              {isLoadingInsight
                ? 'Generating…'
                : insightCooldownSeconds > 0
                  ? `Wait ${insightCooldownSeconds}s`
                  : 'Generate Insight'}
            </button>
          </div>

          {insightError && (
            <p className="mb-2 text-xs text-red-300/70">{insightError}</p>
          )}

          {insight ? (
            <div className="space-y-2">
              <p className="text-xs leading-6 text-[#e8dcc0]/75">{insight.content}</p>
              {insight.saved_at && (
                <p className="text-[10px] text-[#e8dcc0]/25">
                  Generated {new Date(insight.saved_at).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#e8dcc0]/30 leading-6">
              Generate an AI insight from live operational data. AI suggestions are not verified facts — use them as a prompt for reflection, not a directive.
            </p>
          )}
        </Card>
      )}
    </>
  )
}
