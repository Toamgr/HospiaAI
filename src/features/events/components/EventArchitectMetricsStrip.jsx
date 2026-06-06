import React, { useMemo } from 'react'
import {
  computeGuestCapacity,
  computeAccessibilityScore,
  computeGuestFlowScore,
  computeBarCoverage,
  computeStaffLoad,
  computeBottleneckRisk,
  computeSetupComplexity,
} from '../utils/eventArchitectMetrics'
import { calculateStaff, calculateBudget, formatCurrency } from '../utils/eventBrainCalculations'

function scoreBarColor(score) {
  if (score >= 75) return '#C9A96E'
  if (score >= 50) return '#8B7355'
  return '#C17F2A'
}

function riskBarColor(risk) {
  if (risk <= 25) return '#4A7C59'
  if (risk <= 55) return '#C17F2A'
  return '#8B3A3A'
}

function MetricCell({ label, value, sub, scoreBar, riskBar, alert }) {
  const barColor = riskBar !== undefined
    ? riskBarColor(riskBar ?? 0)
    : scoreBar !== undefined
      ? scoreBarColor(scoreBar ?? 0)
      : null

  const valueColor = alert
    ? '#C17F2A'
    : riskBar !== undefined && (riskBar ?? 0) > 55
      ? '#8B3A3A'
      : '#F5F0E8'

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-3">
      <div
        style={{
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#5A5550',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: '"JetBrains Mono", "Courier New", monospace',
          fontSize: '15px',
          fontWeight: 700,
          color: valueColor,
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
        }}
      >
        {value ?? '—'}
      </div>
      {sub && (
        <div
          style={{
            fontSize: '9px',
            color: '#5A5550',
            whiteSpace: 'nowrap',
          }}
        >
          {sub}
        </div>
      )}
      {barColor !== null && (scoreBar !== undefined || riskBar !== undefined) && (
        <div
          style={{
            marginTop: '4px',
            height: '2px',
            borderRadius: '1px',
            background: '#1E1E1E',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: '1px',
              background: barColor,
              width: `${Math.max(0, Math.min(100, scoreBar ?? riskBar ?? 0))}%`,
              transition: 'width 400ms ease',
            }}
          />
        </div>
      )}
    </div>
  )
}

function Divider() {
  return (
    <div
      style={{
        width: '1px',
        background: '#1E1E1E',
        alignSelf: 'stretch',
        margin: '8px 0',
        flexShrink: 0,
      }}
    />
  )
}

export default function EventArchitectMetricsStrip({ tables, eventBrief }) {
  const staffCounts = useMemo(
    () =>
      eventBrief
        ? calculateStaff(
            eventBrief.totalGuests ?? 0,
            eventBrief.barType,
            eventBrief.format,
            eventBrief.accessibility
          )
        : null,
    [eventBrief]
  )

  const capacity = useMemo(() => computeGuestCapacity(tables, eventBrief), [tables, eventBrief])
  const accessScore = useMemo(() => computeAccessibilityScore(tables, eventBrief), [tables, eventBrief])
  const flowScore = useMemo(() => computeGuestFlowScore(tables, eventBrief), [tables, eventBrief])
  const barScore = useMemo(() => computeBarCoverage(tables, eventBrief), [tables, eventBrief])
  const staffLoad = useMemo(() => computeStaffLoad(staffCounts), [staffCounts])
  const bottleneckRisk = useMemo(() => computeBottleneckRisk(tables, eventBrief), [tables, eventBrief])
  const setupComplexity = useMemo(() => computeSetupComplexity(tables, eventBrief), [tables, eventBrief])

  const budget = useMemo(
    () =>
      eventBrief
        ? calculateBudget(eventBrief.totalGuests ?? 0, eventBrief.budgetPerPerson ?? 0)
        : null,
    [eventBrief]
  )

  const unresolved = capacity.unresolved ?? 0

  return (
    <div
      style={{
        background: '#0D0D0D',
        borderTop: '1px solid #1E1E1E',
        borderBottom: '1px solid #1E1E1E',
      }}
    >
      {/* Strip label */}
      <div
        style={{
          padding: '6px 16px 2px',
          fontSize: '8px',
          fontWeight: 700,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#3A3A3A',
        }}
      >
        Event Intelligence — Architect View
      </div>

      {/* Metrics row */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          alignItems: 'stretch',
          borderTop: '1px solid #141414',
        }}
      >
        <MetricCell
          label="Guest Capacity"
          value={capacity.seated !== null ? String(capacity.seated) : '—'}
          sub={capacity.invited ? `of ${capacity.invited} invited` : undefined}
        />
        <Divider />
        <MetricCell
          label="Unresolved"
          value={capacity.unresolved !== null ? String(capacity.unresolved) : '—'}
          sub="guests unseated"
          alert={unresolved > 0}
        />
        <Divider />
        <MetricCell
          label="Accessibility"
          value={accessScore !== null ? String(accessScore) : '—'}
          sub="score / 100"
          scoreBar={accessScore ?? undefined}
        />
        <Divider />
        <MetricCell
          label="Guest Flow"
          value={flowScore !== null ? String(flowScore) : '—'}
          sub="score / 100"
          scoreBar={flowScore ?? undefined}
        />
        <Divider />
        <MetricCell
          label="Bar Coverage"
          value={barScore !== null ? String(barScore) : '—'}
          sub="score / 100"
          scoreBar={barScore ?? undefined}
        />
        <Divider />
        <MetricCell
          label="Staff Load"
          value={staffLoad ?? '—'}
          sub={staffCounts ? `${staffCounts.total} total` : undefined}
        />
        <Divider />
        <MetricCell
          label="Bottleneck Risk"
          value={bottleneckRisk !== null ? String(bottleneckRisk) : '—'}
          sub="risk / 100"
          riskBar={bottleneckRisk ?? undefined}
        />
        <Divider />
        <MetricCell
          label="Setup Complexity"
          value={setupComplexity !== null ? String(setupComplexity) : '—'}
          sub="score / 100"
          scoreBar={setupComplexity ?? undefined}
        />
        <Divider />
        <MetricCell
          label="Budget Impact"
          value={
            budget && eventBrief
              ? formatCurrency(budget.total, eventBrief.currency ?? '')
              : '—'
          }
          sub={
            eventBrief
              ? `${eventBrief.currency ?? ''}${eventBrief.budgetPerPerson ?? '—'} / pax`
              : undefined
          }
        />
      </div>
    </div>
  )
}
