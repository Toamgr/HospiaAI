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

// ─── StatTile ─────────────────────────────────────────────────────────────────
function StatTile({ label, value, danger, accent }) {
  return (
    <div className={cx(
      'rounded-2xl border p-4',
      danger ? 'border-red-800/35 bg-red-950/10' : accent ? 'border-[#c9a96e]/15 bg-[#c9a96e]/5' : 'border-[#6b705c]/15 bg-[#14130f]'
    )}>
      <div className={cx(
        'font-serif text-3xl font-black',
        danger ? 'text-red-300' : accent ? 'text-[#c9a96e]' : 'text-[#f5f5f0]'
      )}>{value}</div>
      <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#e8dcc0]/45">{label}</div>
    </div>
  )
}

// ─── OperationalPulse ─────────────────────────────────────────────────────────
export default function OperationalPulse({
  actionItems          = [],
  serviceIncidents     = [],
  shiftNotes           = [],
  reportArchive        = [],
  pulseData            = null,
  trends               = [],
  insight              = null,
  isLoadingInsight     = false,
  insightError         = null,
  insightCooldownSeconds = 0,
  onRequestInsight     = null,
}) {
  const reviews = useMemo(() => loadEndOfShiftReviews(), [])

  const enriched = useMemo(() => {
    const statuses      = loadManagerActionStatuses()
    const carryForwards = loadManagerActionCarryForward()
    const derived       = deriveOperationalActions(actionItems, serviceIncidents, shiftNotes, reportArchive)
    return enrichActions(derived, statuses, carryForwards, serviceIncidents, actionItems)
  }, [actionItems, serviceIncidents, shiftNotes, reportArchive])

  const pulse = useMemo(() => getOperationalPulseSummary(enriched, reviews), [enriched, reviews])

  const dbShifts = pulseData?.total_closed_shifts ?? null
  const hasEnoughData = dbShifts === null || dbShifts >= 3

  if (!hasEnoughData) {
    return (
      <>
        <Header
          eyebrow="Owner Intelligence"
          title="Operational Pulse"
          body="Real-time view of operational load, shift reviews, and carry-forward patterns. No fabricated metrics — all figures derive from live manager activity."
        />
        <Card>
          <div className="py-12 text-center">
            <div className="font-serif text-[5rem] font-black leading-none text-[#c9a96e]/[0.05] mb-4">◎</div>
            <p className="text-sm font-bold text-[#e8dcc0]/55 mb-2">Not enough data yet.</p>
            <p className="mx-auto max-w-sm text-xs leading-6 text-[#e8dcc0]/30">
              Operational Pulse activates after 3 closed shifts. {dbShifts !== null ? `${dbShifts} closed so far.` : ''}
            </p>
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <Header
        eyebrow="Owner Intelligence"
        title="Operational Pulse"
        body="Real-time operational load and shift review history. All figures are derived from manager activity — no fabricated metrics."
      />

      {/* DB-sourced stats row */}
      {pulseData && (
        <div className="mb-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          <StatTile label="Closed Shifts"       value={pulseData.total_closed_shifts}   accent />
          <StatTile label="Open Tasks (DB)"     value={pulseData.open_tasks}            danger={pulseData.open_tasks > 5} />
          <StatTile label="Unresolved Incidents" value={pulseData.unresolved_incidents} danger={pulseData.unresolved_incidents > 0} />
          <StatTile label="Incidents (30 Days)" value={pulseData.incidents_30d}         danger={pulseData.incidents_30d > 10} />
          <StatTile label="Approved Cocktails"  value={pulseData.approved_cocktails}    accent />
        </div>
      )}

      {/* Load overview */}
      <div className="mb-6 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Open Actions"    value={pulse.openCount}         accent={pulse.openCount > 0}         danger={false} />
        <StatTile label="Urgent"          value={pulse.urgentCount}       danger={pulse.urgentCount > 0}       accent={false} />
        <StatTile label="Carry Forward"   value={pulse.carryForwardCount} accent={pulse.carryForwardCount > 0} danger={false} />
        <StatTile label="Stale (3+ Days)" value={pulse.staleCount}        danger={pulse.staleCount > 0}        accent={false} />
        <StatTile label="Open Incidents"  value={pulse.incidentCount}     danger={pulse.incidentCount > 0}     accent={false} />
        <StatTile label="Reviews Flagged" value={pulse.flaggedForOwnerCount} danger={pulse.flaggedForOwnerCount > 0} accent={false} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">

          {/* Urgent open items */}
          {pulse.urgentItems.length > 0 && (
            <Card>
              <div className="text-[10px] font-black uppercase tracking-widest text-red-300 mb-3">
                Urgent Unresolved ({pulse.urgentCount})
              </div>
              <div className="space-y-2.5">
                {pulse.urgentItems.map(a => (
                  <div key={a.id} className="flex items-start gap-2 rounded-xl border border-red-900/25 bg-red-950/10 px-3 py-2.5">
                    <span className={cx('shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] mt-0.5', PRIORITY_STYLE[a.priority])}>
                      {PRIORITY_LABEL[a.priority]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#f5f5f0] leading-5">{a.title}</p>
                      {a.detail && <p className="text-[10px] text-[#e8dcc0]/40 leading-4 mt-0.5">{a.detail}</p>}
                    </div>
                    <span className="ml-auto shrink-0 text-[10px] text-[#e8dcc0]/35 whitespace-nowrap">
                      {SOURCE_LABEL[a.source] || a.source}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Carry-forward items */}
          {pulse.carryForwardItems.length > 0 && (
            <Card>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-3">
                Carry-Forward Items ({pulse.carryForwardCount})
              </div>
              <div className="space-y-2">
                {pulse.carryForwardItems.map(a => (
                  <div key={a.id} className="flex items-start gap-2">
                    <span className={cx('shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] mt-0.5', PRIORITY_STYLE[a.priority])}>
                      {PRIORITY_LABEL[a.priority]}
                    </span>
                    <span className="text-xs leading-5 text-[#e8dcc0]">{a.title}</span>
                    {a.daysOpen >= 3 && (
                      <span className="ml-auto shrink-0 text-[9px] font-bold text-amber-400/65 whitespace-nowrap">
                        {a.daysOpen}d open
                      </span>
                    )}
                  </div>
                ))}
                {pulse.carryForwardCount > pulse.carryForwardItems.length && (
                  <p className="text-[10px] text-[#e8dcc0]/30">
                    +{pulse.carryForwardCount - pulse.carryForwardItems.length} more — see Shift Control
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Operational themes */}
          {pulse.themes.length > 0 && (
            <Card>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e] mb-3">
                Operational Themes
              </div>
              <div className="space-y-2">
                {pulse.themes.map(({ theme, count }) => (
                  <div key={theme} className="flex items-center justify-between rounded-xl border border-[#6b705c]/15 px-3 py-2">
                    <span className="text-xs text-[#e8dcc0]">{theme}</span>
                    <span className="text-xs font-black text-[#c9a96e]">{count} action{count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-[#e8dcc0]/25">
                Derived by keyword matching from open action text. No AI inference.
              </p>
            </Card>
          )}

          {/* Flagged reviews */}
          {pulse.flaggedReviews.length > 0 && (
            <Card>
              <div className="text-[10px] font-black uppercase tracking-widest text-red-300 mb-3">
                Reviews Flagged for Owner ({pulse.flaggedForOwnerCount})
              </div>
              <div className="space-y-3">
                {pulse.flaggedReviews.map(r => (
                  <div key={r.id} className="rounded-xl border border-red-900/20 bg-red-950/8 px-3 py-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-black text-red-300/80">{r.shift_date}</span>
                      <span className="text-[10px] text-[#e8dcc0]/40">{r.manager_name}</span>
                    </div>
                    {r.urgent_items && (
                      <p className="text-xs leading-5 text-[#e8dcc0]/70 mb-1">
                        <span className="font-bold text-[#e8dcc0]/50">Urgent: </span>{r.urgent_items}
                      </p>
                    )}
                    {r.complaints && (
                      <p className="text-xs leading-5 text-[#e8dcc0]/70">
                        <span className="font-bold text-[#e8dcc0]/50">Complaints: </span>{r.complaints}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column — shift review archive */}
        <div className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/60 mb-1">
            Recent End-of-Shift Reviews
          </div>

          {pulse.recentReviews.length === 0 ? (
            <div className="rounded-2xl border border-[#6b705c]/15 bg-[#14130f] px-4 py-6 text-center">
              <p className="text-xs text-[#e8dcc0]/35">No shift reviews submitted yet.</p>
            </div>
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

          {/* No actions note */}
          {!pulse.hasData && (
            <div className="rounded-2xl border border-[#6b705c]/10 px-4 py-3">
              <p className="text-[10px] text-[#e8dcc0]/25">
                All figures reflect live manager activity. No synthetic data is displayed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI Insight */}
      {onRequestInsight && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#c9a96e]/60">
              AI Operational Insight
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
            <p className="text-xs text-[#e8dcc0]/30">
              Generate an AI insight from live operational data. One request per minute.
            </p>
          )}
        </Card>
      )}
    </>
  )
}
