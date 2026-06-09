import React, { useState } from 'react'
import { Card, CardHead, FieldRow, GhostButton, CopyButton } from '../utils/zoharDisplayUtils'

// Compact cocktail brief card for the department briefs row.
// Shows 3 key fields always. Expands for full brief text + more detail.
// Actions: generate menu directly, or assign task to bar manager.

export default function ZoharCocktailBriefCard({
  brief,
  loadingMenu,
  cocktailMenuStatus,
  taskCreated,
  taskError,
  creatingTask,
  onGenerateMenu,
  onCreateTask,
}) {
  const [expanded, setExpanded] = useState(false)
  const cb = brief?.cocktailMenuBrief
  if (!cb) return null

  let statusNode
  if (loadingMenu) {
    statusNode = <span style={{ fontSize: 10, color: '#3A3A3A' }}>Checking…</span>
  } else if (cocktailMenuStatus === 'approved') {
    statusNode = <span style={{ fontSize: 10, color: '#6BAF80', fontWeight: 600 }}>✓ Approved</span>
  } else if (brief?.departmentActions?.barAction === 'cocktail-menu-task-exists') {
    statusNode = <span style={{ fontSize: 10, color: '#C9A96E' }}>⏳ In progress</span>
  } else if (taskCreated) {
    statusNode = <span style={{ fontSize: 10, color: '#6BAF80', fontWeight: 600 }}>✓ Task assigned</span>
  }

  return (
    <Card>
      <CardHead
        right={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {statusNode}
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3A3A3A', fontSize: 11, padding: 0 }}
            >
              {expanded ? '▲' : '▼'}
            </button>
          </div>
        }
      >
        Bar · Cocktail
      </CardHead>

      {/* Always-visible key fields */}
      <FieldRow label="Guests"  value={cb.guestCount ?? '—'} />
      <FieldRow label="Style"   value={cb.serviceStyle} />
      <FieldRow label="Kosher"  value={cb.kosherRequirement} />

      {/* Expanded: full brief text + more fields + actions */}
      {expanded && (
        <>
          <FieldRow label="Welcome"  value={cb.welcomeDrinkNeed} />
          <FieldRow label="Stations" value={cb.barStationsRecommendation} />
          <FieldRow label="Speed"    value={cb.speedRequirements} />
          <FieldRow label="Alcohol"  value={cb.alcoholIntensity} />
          <div style={{ padding: '10px 14px', background: '#0D0D0D', borderTop: '1px solid #1A1A1A' }}>
            <p style={{ fontSize: 11, lineHeight: 1.75, color: '#9A9590', margin: '0 0 8px', borderLeft: '2px solid rgba(201,169,110,0.22)', paddingLeft: 10 }}>
              {cb.outputRequestText}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <CopyButton text={cb.outputRequestText} label="Copy brief" />
            </div>
          </div>

          {/* Actions — only when menu not approved */}
          {cocktailMenuStatus !== 'approved' && brief?.departmentActions?.barAction !== 'cocktail-menu-task-exists' && !taskCreated && (
            <div style={{ padding: '10px 14px', borderTop: '1px solid #1A1A1A', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <GhostButton onClick={onGenerateMenu}>Generate Event Cocktail Menu →</GhostButton>
              <GhostButton onClick={onCreateTask} disabled={creatingTask}>
                {creatingTask ? 'Creating task…' : '+ Assign to Bar Manager'}
              </GhostButton>
              {taskError && <p style={{ fontSize: 10, color: '#C44A4A', margin: 0 }}>{taskError}</p>}
            </div>
          )}
        </>
      )}

      {/* Collapsed: show action if menu needs building */}
      {!expanded && cocktailMenuStatus !== 'approved' && !taskCreated && brief?.departmentActions?.barAction === 'no-cocktail-task' && (
        <div style={{ padding: '8px 14px', borderTop: '1px solid #1A1A1A' }}>
          <GhostButton onClick={onGenerateMenu}>Generate menu →</GhostButton>
        </div>
      )}
    </Card>
  )
}
