import React, { useState, useEffect, useMemo } from 'react'
import { fetchCocktailMenu } from '../../../services/api/eventsApi'
import { buildZoharBrief } from '../utils/zoharBriefOrchestrator'
import { computeSeatingIntelligence } from '../utils/seatingIntelligence'

const ARCHITECT_ROLES = ['events_manager', 'manager', 'owner', 'admin']

// ── Z mark ────────────────────────────────────────────────────────────────────

function ZMark() {
  return (
    <div
      style={{
        width: 32, height: 32, borderRadius: 6,
        background: 'rgba(201,169,110,0.08)',
        border: '1px solid rgba(201,169,110,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}
    >
      <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
        <path d="M3.5 3.5H14.5L4.5 14.5H14.5" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function Card({ children, style }) {
  return (
    <div
      style={{
        background: '#141414', border: '1px solid #1E1E1E',
        borderRadius: 8, overflow: 'hidden', ...style,
      }}
    >
      {children}
    </div>
  )
}

function CardHead({ children, right }) {
  return (
    <div
      style={{
        padding: '9px 14px', borderBottom: '1px solid #1A1A1A',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <span
        style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: '#5A5550',
        }}
      >
        {children}
      </span>
      {right}
    </div>
  )
}

function FieldRow({ label, value }) {
  return (
    <div
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '5px 14px', borderBottom: '1px solid #141414', gap: 12,
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#5A5550', flexShrink: 0, paddingTop: 1 }}>
        {label}
      </span>
      <span style={{ fontSize: 10.5, color: '#9A9590', textAlign: 'right', lineHeight: 1.5 }}>
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '—')}
      </span>
    </div>
  )
}

function NoteRow({ label, value }) {
  return (
    <div style={{ padding: '7px 14px', borderBottom: '1px solid #141414' }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#5A5550', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: 11, color: '#9A9590', lineHeight: 1.6 }}>
        {value || '—'}
      </div>
    </div>
  )
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }
  return (
    <button
      type="button"
      onClick={handleCopy}
      style={{
        background: copied ? 'rgba(74,124,89,0.12)' : 'rgba(201,169,110,0.07)',
        border: `1px solid ${copied ? 'rgba(74,124,89,0.28)' : 'rgba(201,169,110,0.22)'}`,
        borderRadius: 5, color: copied ? '#6BAF80' : '#C9A96E',
        cursor: 'pointer', padding: '5px 11px',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
        transition: 'all 150ms ease',
      }}
    >
      {copied ? 'Copied ✓' : label}
    </button>
  )
}

// ── Ghost action button ───────────────────────────────────────────────────────

function GhostButton({ children, onClick, disabled, danger }) {
  const baseColor = danger ? '#C44A4A' : '#C9A96E'
  const baseBg    = danger ? 'rgba(196,74,74,0.07)' : 'rgba(201,169,110,0.07)'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? 'rgba(90,84,80,0.07)' : baseBg,
        border: `1px solid ${disabled ? '#2A2A2A' : (danger ? 'rgba(196,74,74,0.22)' : 'rgba(201,169,110,0.22)')}`,
        borderRadius: 5,
        color: disabled ? '#3A3A3A' : baseColor,
        cursor: disabled ? 'default' : 'pointer',
        padding: '5px 11px',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
        transition: 'all 150ms ease',
      }}
    >
      {children}
    </button>
  )
}

// ── Readiness bar ─────────────────────────────────────────────────────────────

function ReadinessBar({ score, label }) {
  const color = score >= 75 ? '#4A7C59' : score >= 40 ? '#C9A96E' : '#C17F2A'
  const numColor = score >= 75 ? '#6BAF80' : score >= 40 ? '#C9A96E' : '#D4943A'
  return (
    <div style={{ padding: '14px 14px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 26, fontWeight: 700, color: numColor, lineHeight: 1,
            }}
          >
            {score}
          </span>
          <span style={{ fontSize: 9, color: '#5A5550', letterSpacing: '0.10em', textTransform: 'uppercase', marginLeft: 6 }}>
            / 100
          </span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: numColor }}>{label}</span>
      </div>
      <div style={{ height: 3, borderRadius: 2, background: '#1E1E1E', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%', width: `${score}%`, background: color,
            borderRadius: 2, transition: 'width 600ms ease',
          }}
        />
      </div>
    </div>
  )
}

// ── Missing inputs ────────────────────────────────────────────────────────────

function MissingInputs({ items }) {
  if (!items.length) return null
  return (
    <Card>
      <CardHead>Missing inputs</CardHead>
      <div style={{ padding: '8px 0' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 14px' }}>
            <span
              style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#D4943A', flexShrink: 0, marginTop: 5,
              }}
            />
            <span style={{ fontSize: 11, color: '#9A9590', lineHeight: 1.55 }}>{item}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ── Collapsible brief section ─────────────────────────────────────────────────

function BriefSection({ title, briefText, rows, copyLabel, actions }) {
  const [open, setOpen] = useState(true)
  return (
    <Card>
      <CardHead
        right={
          <button
            type="button"
            onClick={() => setOpen(v => !v)}
            style={{
              background: 'transparent', border: 'none',
              cursor: 'pointer', color: '#3A3A3A', fontSize: 11, padding: 0, lineHeight: 1,
            }}
          >
            {open ? '▲' : '▼'}
          </button>
        }
      >
        {title}
      </CardHead>

      {open && (
        <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Brief text */}
          <p
            style={{
              fontSize: 11, lineHeight: 1.75, color: '#9A9590', margin: 0,
              padding: '10px 12px', background: '#0D0D0D', borderRadius: 6,
              borderLeft: '2px solid rgba(201,169,110,0.22)',
            }}
          >
            {briefText}
          </p>

          {/* Copy button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CopyButton text={briefText} label={copyLabel || 'Copy Brief'} />
          </div>

          {/* Structured field rows */}
          {Array.isArray(rows) && rows.length > 0 && (
            <div style={{ borderTop: '1px solid #1A1A1A', marginTop: 2 }}>
              {rows.filter(([, v]) => v !== null && v !== undefined).map(([lbl, val]) => (
                <FieldRow key={lbl} label={lbl} value={val} />
              ))}
            </div>
          )}

          {/* Slot for action buttons / status messages */}
          {actions}
        </div>
      )}
    </Card>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function EventZohar({
  event, guests, tables, tasks, timeline,
  currentUser, goToPage, onAddTask,
}) {
  const [cocktailMenuStatus, setCocktailMenuStatus] = useState(null)
  const [loadingMenu, setLoadingMenu]               = useState(true)
  const [creatingTask, setCreatingTask]             = useState(false)
  const [taskCreated, setTaskCreated]               = useState(false)
  const [taskError, setTaskError]                   = useState(null)

  useEffect(() => {
    setLoadingMenu(true)
    setCocktailMenuStatus(null)
    fetchCocktailMenu(event.id)
      .then(data => setCocktailMenuStatus(data.menu?.status ?? null))
      .catch(() => setCocktailMenuStatus(null))
      .finally(() => setLoadingMenu(false))
  }, [event.id])

  // Reset task-creation state when the event changes so a previous success
  // indicator from event A does not persist when the user switches to event B.
  useEffect(() => {
    setTaskCreated(false)
    setTaskError(null)
  }, [event.id])

  const brief = useMemo(
    () => buildZoharBrief({
      event,
      guests:   guests   ?? [],
      tables:   tables   ?? [],
      tasks:    tasks    ?? [],
      timeline: timeline ?? [],
    }),
    [event, guests, tables, tasks, timeline]
  )

  const seatingIntelligence = useMemo(
    () => computeSeatingIntelligence(guests ?? [], tables ?? []),
    [guests, tables]
  )

  if (!brief) {
    return (
      <div style={{ padding: 24, color: '#5A5550', fontSize: 11 }}>
        Unable to generate brief — event data unavailable.
      </div>
    )
  }

  const {
    eventName, eventTypeLabel, daysUntil,
    readinessScore, readinessLabel,
    missingInputs, cocktailMenuBrief, foodMenuBrief,
    operationsBrief, departmentActions,
  } = brief

  const canAccessArchitect = ARCHITECT_ROLES.includes(currentUser?.role)

  async function handleCreateCocktailTask() {
    setCreatingTask(true)
    setTaskError(null)
    try {
      await onAddTask(event.id, {
        title:       `Build cocktail menu for ${event.name}`,
        assigned_to: 'Bar Manager',
        priority:    'high',
        notes:       cocktailMenuBrief.outputRequestText,
      })
      setTaskCreated(true)
    } catch (err) {
      setTaskError(err?.message || 'Failed to create task. Please try again.')
    } finally {
      setCreatingTask(false)
    }
  }

  function openArchitect() {
    try { sessionStorage.setItem('hestia.architect.linkId', String(event.id)) } catch {}
    goToPage('eventBrain', { eventId: event.id })
  }

  // ── Structured fields for cocktail brief ──
  const cocktailRows = [
    ['Guest count',    cocktailMenuBrief.guestCount ?? null],
    ['Service style',  cocktailMenuBrief.serviceStyle],
    ['Cocktail mood',  cocktailMenuBrief.cocktailMood],
    ['Welcome drink',  cocktailMenuBrief.welcomeDrinkNeed],
    ['Bar stations',   cocktailMenuBrief.barStationsRecommendation],
    ['Service speed',  cocktailMenuBrief.speedRequirements],
    ['Alcohol level',  cocktailMenuBrief.alcoholIntensity],
    ['Kosher',         cocktailMenuBrief.kosherRequirement],
  ]

  // ── Structured fields for food brief ──
  const foodRows = [
    ['Guest count',     foodMenuBrief.guestCount ?? null],
    ['Confirmed',       foodMenuBrief.confirmedCount || null],
    ['Service format',  foodMenuBrief.serviceFormat],
    ['Culinary mood',   foodMenuBrief.culinaryMood],
    ['Dietary mix',     foodMenuBrief.dietaryNotes || 'Not specified'],
    ['Kosher',          foodMenuBrief.kosherRequirement],
    ['Service window',  foodMenuBrief.timing],
    ['Kitchen notes',   foodMenuBrief.kitchenConstraints],
  ]

  // ── Cocktail section action slot ──
  // loadingMenu: fetch still in flight — disable create-task to prevent duplication
  // if the menu is already approved but the fetch hasn't resolved yet.
  let cocktailAction
  if (loadingMenu) {
    cocktailAction = (
      <div style={{ paddingTop: 2, fontSize: 11, color: '#3A3A3A' }}>
        Checking menu status…
      </div>
    )
  } else if (cocktailMenuStatus === 'approved') {
    cocktailAction = (
      <div style={{ paddingTop: 2, fontSize: 11, color: '#6BAF80', fontWeight: 600 }}>
        ✓ Cocktail menu approved for this event
      </div>
    )
  } else if (departmentActions.barAction === 'cocktail-menu-task-exists') {
    cocktailAction = (
      <div style={{ paddingTop: 2, fontSize: 11, color: '#C9A96E' }}>
        ⏳ Cocktail menu task is in progress — see Tasks tab
      </div>
    )
  } else if (taskCreated) {
    cocktailAction = (
      <div style={{ paddingTop: 2, fontSize: 11, color: '#6BAF80', fontWeight: 600 }}>
        ✓ Task created and assigned to Bar Manager — visible in the Tasks tab
      </div>
    )
  } else {
    cocktailAction = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
        <GhostButton onClick={handleCreateCocktailTask} disabled={creatingTask}>
          {creatingTask ? 'Creating…' : '+ Create task for Bar Manager'}
        </GhostButton>
        {taskError && (
          <p style={{ fontSize: 10, color: '#C44A4A', margin: 0 }}>{taskError}</p>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0 4px' }}>
        <ZMark />
        <div>
          <div
            style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 18, fontWeight: 700, color: '#F5F0E8', lineHeight: 1.1,
            }}
          >
            Zohar
          </div>
          <div
            style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: '#C9A96E', opacity: 0.7,
            }}
          >
            Event Brief Orchestrator
          </div>
        </div>
        {daysUntil !== null && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 13, fontWeight: 700,
                color: daysUntil < 0 ? '#5A5550' : daysUntil <= 7 ? '#D4943A' : '#9A9590',
              }}
            >
              {daysUntil < 0
                ? `${Math.abs(daysUntil)}d ago`
                : daysUntil === 0 ? 'Today'
                : `${daysUntil}d`}
            </div>
            <div style={{ fontSize: 8, color: '#3A3A3A', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
              to event
            </div>
          </div>
        )}
      </div>

      {/* Readiness score card */}
      <Card>
        <CardHead>{eventName} — {eventTypeLabel}</CardHead>
        <ReadinessBar score={readinessScore} label={readinessLabel} />
      </Card>

      {/* Missing inputs */}
      <MissingInputs items={missingInputs} />

      {/* Cocktail / Bar brief */}
      <BriefSection
        title="Bar / Cocktail Brief"
        briefText={cocktailMenuBrief.outputRequestText}
        copyLabel="Copy Cocktail Brief"
        rows={cocktailRows}
        actions={cocktailAction}
      />

      {/* Kitchen / Food brief */}
      <BriefSection
        title="Kitchen / F&B Brief"
        briefText={foodMenuBrief.outputRequestText}
        copyLabel="Copy Food Brief"
        rows={foodRows}
      />

      {/* Operations brief */}
      <Card>
        <CardHead>Operations — Event Manager</CardHead>
        <div style={{ paddingBottom: 6 }}>
          <NoteRow label="Guest flow"       value={operationsBrief.guestFlowNote} />
          <FieldRow label="Arrival pressure" value={operationsBrief.arrivalPressure} />
          <NoteRow label="Seating"           value={operationsBrief.seatingSummary} />
          <FieldRow label="Tasks"            value={operationsBrief.taskSummary} />
          <FieldRow label="Timeline"         value={operationsBrief.timelineGap} />
        </div>

        {operationsBrief.criticalRisks.length > 0 && (
          <div style={{ padding: '10px 14px', borderTop: '1px solid #1A1A1A' }}>
            <div
              style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: '#D4943A', marginBottom: 6,
              }}
            >
              Critical risks
            </div>
            {operationsBrief.criticalRisks.map((risk, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0' }}>
                <span
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#D4943A', flexShrink: 0, marginTop: 5,
                  }}
                />
                <span style={{ fontSize: 11, color: '#9A9590', lineHeight: 1.55 }}>{risk}</span>
              </div>
            ))}
          </div>
        )}

        {canAccessArchitect && (
          <div style={{ padding: '10px 14px', borderTop: '1px solid #1A1A1A' }}>
            <GhostButton onClick={openArchitect}>Open Event Architect →</GhostButton>
          </div>
        )}
      </Card>

      {/* Seating Intelligence — only when guests exist */}
      {seatingIntelligence && seatingIntelligence.totalGuests > 0 && (
        <Card>
          <CardHead
            right={
              <span
                style={{
                  fontSize: 11, fontWeight: 700,
                  color: seatingIntelligence.seatingCompletion >= 80
                    ? '#6BAF80'
                    : seatingIntelligence.seatingCompletion >= 50
                    ? '#C9A96E'
                    : '#D4943A',
                }}
              >
                {seatingIntelligence.seatingCompletion}%
              </span>
            }
          >
            Seating Readiness
          </CardHead>
          <FieldRow label="Seated"     value={`${seatingIntelligence.seatedCount} guests`} />
          <FieldRow label="Unassigned" value={`${seatingIntelligence.unassignedCount} guests`} />
          <FieldRow label="Total"      value={`${seatingIntelligence.totalGuests} guests`} />
          {seatingIntelligence.capacityWarnings.map(w => (
            <NoteRow
              key={w.tableId}
              label="⚠ Over capacity"
              value={`${w.tableLabel}: ${w.assigned} assigned, ${w.capacity} seats`}
            />
          ))}
          {seatingIntelligence.vipWarnings.map(w => (
            <NoteRow
              key={w.tableId}
              label="◆ VIP unassigned"
              value={`${w.tableLabel} has no guests assigned`}
            />
          ))}
        </Card>
      )}

      {/* Footer */}
      <p
        style={{
          fontSize: 9.5, color: '#3A3A3A', fontStyle: 'italic',
          textAlign: 'center', margin: '2px 0 6px',
        }}
      >
        Briefs are generated from real event data. Copy and share with your team.
      </p>
    </div>
  )
}
