import React, { useState, useMemo } from 'react'
import { cx, formatMoney } from '../../utils/format'
import { Card, Button, Label, Header, List, MiniFact, Alert } from '../../components/AppPrimitives'

const SIGNAL_STATUS = {
  clear:     { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'Clear'     },
  attention: { dot: 'bg-yellow-400',  text: 'text-yellow-400',  label: 'Attention' },
  critical:  { dot: 'bg-red-400',     text: 'text-red-400',     label: 'Critical'  }
}

function WeeklySignalsSection({ shiftBrain }) {
  if (!shiftBrain) return null
  const { servicePatterns, carryForwardItems, riskSignals, summary, recommendedFocus } = shiftBrain
  const noSignals = servicePatterns.length === 0 && carryForwardItems.length === 0 && riskSignals.length === 0
  const sc = SIGNAL_STATUS[summary.operationalStatus] || SIGNAL_STATUS.clear

  return (
    <section className="rounded-[2.5rem] border border-[#6b705c]/25 bg-[#14130f] p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.26em] text-[#c9a96e]">Shift Brain — Weekly View</div>
          <h2 className="font-serif text-3xl font-black text-[#f5f5f0]">This Week's Operational Signals</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#6b705c]/25 bg-black/20 px-4 py-2">
          <span className={cx('h-2 w-2 rounded-full', sc.dot)} />
          <span className={cx('text-[10px] font-black uppercase tracking-wider', sc.text)}>{sc.label}</span>
        </div>
      </div>

      {noSignals ? (
        <div className="space-y-3">
          <p className="text-sm leading-7 text-[#e8dcc0]/60">No recurring patterns, persistent open items, or risk signals this week. The venue is operating cleanly.</p>
          {recommendedFocus.slice(0, 1).map((f, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-[#c9a96e]/15 bg-[#c9a96e]/5 px-4 py-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]" />
              <span className="text-sm text-[#e8dcc0]/80">{f}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {(servicePatterns.length > 0 || carryForwardItems.length > 0) && (
            <div className="grid gap-6 lg:grid-cols-2">
              {servicePatterns.length > 0 && (
                <div>
                  <div className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#e8dcc0]/50">Recurring Patterns</div>
                  <div className="space-y-2">
                    {servicePatterns.map(p => (
                      <div key={p.category} className="flex items-center justify-between gap-4 rounded-xl border border-[#6b705c]/20 px-4 py-2.5">
                        <span className="text-sm text-[#e8dcc0]">{p.category}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={cx('h-1.5 w-1.5 rounded-full', p.severity === 'high' ? 'bg-red-400' : 'bg-yellow-400')} />
                          <span className="text-xs font-black text-[#c9a96e]">{p.count}×</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {carryForwardItems.length > 0 && (
                <div>
                  <div className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#e8dcc0]/50">
                    Persistent Open Items — {carryForwardItems.length} open 3+ days
                  </div>
                  <div className="space-y-2">
                    {carryForwardItems.slice(0, 4).map(item => (
                      <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-[#6b705c]/20 px-4 py-2.5">
                        <span className="text-sm text-[#e8dcc0] line-clamp-1">{item.label}</span>
                        <span className="shrink-0 text-xs font-black text-[#e8dcc0]/50">{item.daysOpen}d</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {riskSignals.length > 0 && (
            <div>
              <div className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#e8dcc0]/50">Risk Signals</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {riskSignals.map(s => (
                  <div key={s.id} className="flex items-start gap-2.5 rounded-xl border border-[#6b705c]/20 px-4 py-3">
                    <span className={cx('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', s.severity === 'high' ? 'bg-red-400' : 'bg-yellow-400')} />
                    <span className="text-sm text-[#e8dcc0]">{s.signal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendedFocus.length > 0 && (
            <div className="border-t border-[#6b705c]/20 pt-5">
              <div className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#e8dcc0]/50">Operational Focus</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {recommendedFocus.slice(0, 2).map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl border border-[#c9a96e]/15 bg-[#c9a96e]/5 px-4 py-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]" />
                    <span className="text-sm text-[#e8dcc0]/85">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

export default function WeeklySummary({ t, reportArchive = [], serviceIncidents = [], budgetRequests = [], eventPlans = [], actionItems = [], currentUser, shiftBrain }) {
  const summary = useMemo(() => {
    const unresolved = serviceIncidents.filter(item => !item.resolved)
    const pendingBudgets = budgetRequests.filter(item => item.status === 'pending')
    const openActions = actionItems.filter(item => !item.done)
    const eventRevenue = eventPlans.reduce((sum, item) => sum + Number(item.projected_revenue || item.budget || 0), 0)
    const execution = actionItems.length ? Math.round(((actionItems.length - openActions.length) / actionItems.length) * 100) : 100
    const recentUrgent = reportArchive
      .filter(r => r.urgent_items?.trim())
      .slice(0, 3)
      .map(r => `${r.shift_date || 'Recent'} — ${r.urgent_items.trim().slice(0, 80)}`)
    return {
      incidentCount: serviceIncidents.length,
      unresolved: unresolved.length,
      execution,
      pendingBudgets: pendingBudgets.length,
      eventRevenue,
      recentUrgent
    }
  }, [actionItems, budgetRequests, eventPlans, reportArchive, serviceIncidents])

  const [aiBrief, setAiBrief] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  async function generateBrief() {
    setAiLoading(true)
    setAiError('')
    setAiBrief('')
    try {
      const { generateAIWeeklyBrief } = await import('../../services/ownerInsightService')
      const brief = await generateAIWeeklyBrief({
        reports: reportArchive,
        incidents: serviceIncidents,
        actions: actionItems,
        eventPlans,
        role: currentUser?.role || 'owner'
      })
      setAiBrief(brief)
    } catch (err) {
      setAiError(err.message || 'AI brief generation failed. Check that the backend is running and a Gemini API key is configured.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <>
      <Header eyebrow={t.pages.weeklySummary} title="Weekly Intelligence Summary" body="Auto-generated owner summary panel. Click Generate to produce an AI narrative from real operational data." />

      <WeeklySignalsSection shiftBrain={shiftBrain} />

      <Card className="border-[#c9a96e]/20 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_35%),#11100d]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Label>Data Snapshot</Label>
            <h2 className="font-serif text-4xl font-black text-[#f5f5f0]">This week: {summary.incidentCount} incidents, {summary.unresolved} unresolved, {summary.execution}% manager execution.</h2>
          </div>
          <Button variant="primary" onClick={generateBrief} disabled={aiLoading} className="shrink-0 mt-1">
            {aiLoading ? 'Generating...' : 'Generate AI Brief'}
          </Button>
        </div>

        {aiError && <Alert type="error" className="mb-6">{aiError}</Alert>}

        {aiBrief && (
          <div className="mb-8 rounded-2xl border border-[#c9a96e]/20 bg-[#c9a96e]/5 p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#c9a96e] mb-3">AI-Generated Owner Brief</div>
            <div className="text-sm leading-7 text-[#e8dcc0] whitespace-pre-line">{aiBrief}</div>
          </div>
        )}

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <MiniFact label="Budget Requests" value={summary.pendingBudgets} />
          <MiniFact label="Event Revenue Ahead" value={formatMoney(summary.eventRevenue)} />
          <MiniFact label="EOD Reports" value={reportArchive.length} />
        </div>
        <div className="mt-8">
          <Label>Recent EOD Urgent Items</Label>
          <List items={summary.recentUrgent.length ? summary.recentUrgent : ['No urgent items flagged in recent End Of Day reports.']} />
        </div>
      </Card>
    </>
  )
}
