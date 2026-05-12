# HESTIA Shift Brain — V1 Documentation

**Status:** Complete  
**Date:** 2026-05-12  
**Scope:** Deterministic operational intelligence for shift management

---

## 1. Purpose

### What Shift Brain Does

Shift Brain is HESTIA's pre-shift and in-shift intelligence layer. Before every service begins, a manager carries mental context from the previous shift — open tasks, unresolved incidents, upcoming events, operational patterns. That context is currently held in a person's head and lost when the shift ends.

Shift Brain externalises that context into a structured, actionable briefing:

- Which items are critical and need to be resolved before service
- Which items have been dragging across shifts (carry-forward)
- Which service patterns are recurring and need to be addressed
- What a manager should focus on tonight, in priority order
- A ready-made checklist for the shift opening

### Why It Matters to HESTIA

HESTIA's product philosophy is operational memory compounding: every shift leaves a trace, every pattern is surfaced, and the venue gets smarter over time. Shift Brain is the first product expression of this — a system that reads the current operational state and turns raw data into hospitaliy-native guidance.

Without Shift Brain, the pre-shift briefing is a subjective ritual — managers brief what they happen to remember. With Shift Brain, every briefing is complete, data-driven, and consistent regardless of who is on shift.

### The Living Room Philosophy

HESTIA's founding principle is: *"Make guests feel like they are sitting in your living room."*

That level of hospitality is not improvised. It requires a team that arrives informed, aligned, and prepared. Shift Brain makes that possible by ensuring:

- Nothing falls through the cracks between shifts
- The manager starts service with full context, not partial memory
- Recurring service failures are named and actioned, not silently repeated
- The floor team receives a briefing that reflects reality, not recollection

Shift Brain is how HESTIA turns operational data into guest experience.

---

## 2. Current Implementation

### `src/services/shiftBrainService.js` — Deterministic Intelligence Engine

The service owns all intelligence logic. It is a collection of pure functions — no side effects, no async, no external dependencies. Given operational data, it returns a structured intelligence object.

Entry point: `buildShiftIntelligence({ actionItems, serviceIncidents, eventPlans, ownerNotes })`

Internal helpers (not exported):
- `buildSummary` — counts and classifies the operational state
- `buildCriticalItems` — surfaces urgent actions and high-severity unresolved incidents
- `buildCarryForwardItems` — identifies items open 3+ days, sorted by age
- `detectRiskSignals` — pattern detection: recurring incident types, stale actions, event-with-no-prep
- `buildEventPressure` — today's and upcoming events with guest volume analysis
- `detectServicePatterns` — incident type frequency across all incidents (not just unresolved)
- `buildRecommendedFocus` — derives 1–5 hospitality-native focus statements from the full picture
- `buildManagerChecklist` — builds a standard + dynamic shift-opening checklist

Legacy exports preserved for backward compatibility: `buildShiftBrainSnapshot`, `generateOwnerBrief` (used by `ownerInsightService.js`).

### `src/hooks/useShiftBrainState.js` — Hook Boundary

The hook is the composition boundary between the service and the component tree.

```js
useShiftBrainState({ actionItems, serviceIncidents, eventPlans, ownerNotes })
// returns: { shiftNotes, setShiftNotes, shiftBrain }
```

- Accepts injected operational data from `useOperationsState`
- Computes `shiftBrain` via `useMemo` — recomputes only when input arrays change
- Owns `shiftNotes` state (the OperationalNotes list, persisted to localStorage)
- Returns all three values for App.jsx to wire

No intelligence logic lives in the hook. No component logic lives in the hook. It is a boundary only.

### `src/features/shift-brain/PreShiftBriefing.jsx` — Manager Briefing UI

The pre-shift briefing surface. Two-column layout on wide screens.

**Left column — briefable items:**
- Open Action Board (up to 8 items with checkbox acknowledgement)
- Unresolved Incidents (last 7 days)
- Events Today
- Pinned Manager Notes
- Clean-slate empty state with immediate Start Shift button

**Right column — intelligence panel (rendered only when `shiftBrain` is provided):**
- Operational Status Banner (clear / attention / critical)
- Recommended Focus (bullet list, 1–5 items)
- Risk Signals (warning list with severity dots)
- Carry-Forward (aging items with days-open badges)
- Manager Checklist (independent local checkboxes, not counted toward briefing progress)
- Service Patterns (incident category frequencies)

Progress bar tracks acknowledgement of briefable items. Start Shift button activates at ≥50% acknowledged and posts a snapshot to `/api/business-memory`.

`shiftBrain` is always null-guarded — the component degrades to V0 behaviour if the prop is absent.

### `src/features/shift-brain/OperationalNotes.jsx` — Shift Memory / Notes UI

The live note-taking surface. Unchanged CRUD behaviour from V0.

**Shift Context card** (new in V1 — top of right sidebar):
- Operational status dot and label
- Open actions + unresolved incidents count
- First 2 recommended focus bullets from `shiftBrain`

Full notes CRUD remains: add, pin, archive, tag filter, localStorage persistence with backend sync. The Shift Context card is purely additive and null-guarded.

### App.jsx / PageRenderer Wiring

```
useOperationsState           → actionItems, serviceIncidents, eventPlans, ownerNotes
                                    ↓ (injected)
useShiftBrainState           → shiftBrain (useMemo), shiftNotes, setShiftNotes
                                    ↓ (in notifications group)
PageRenderer.notifications   → { visibleNotifications, shiftNotes, setShiftNotes, shiftBrain }
                                    ↓ (forwarded as props)
PreShiftBriefing             ← shiftBrain, notes (shiftNotes), actionItems, serviceIncidents, eventPlans
OperationalNotes             ← shiftBrain, onNotesChange (setShiftNotes)
```

App.jsx adds one extra key to the `notifications` group and passes one extra prop to each of the two feature components. No feature logic enters App.jsx.

---

## 3. Data Inputs

### `actionItems`

Shape: `{ id, priority ('urgent'|'high'|'normal'|'Critical'), title, owner, due, signal, page, done, status, created_at }`

Used for: critical items, carry-forward, risk signals (urgent count, stale age), recommended focus, manager checklist, summary counts.

### `serviceIncidents`

Shape: `{ id, issueType, severity ('high'|'medium'|'critical'), resolved, employeeName, guestTable, description, created_at }`

Used for: critical items, carry-forward, risk signals (pattern repetition), service patterns, summary counts.

### `eventPlans`

Shape: `{ id, name, config.eventDate, config.guestCount, projected_revenue, status }`

Used for: event pressure (today + upcoming 7 days), risk signals (event-with-no-prep), summary counts, manager checklist.

### `ownerNotes`

Shape: `{ id, from, body, created_at }`

Currently passed to `buildShiftIntelligence` but not yet consumed by any intelligence function. Reserved for future use (e.g., surfacing unacknowledged owner directives in the pre-shift briefing).

### `shiftNotes` (OperationalNotes list)

Shape: `{ id, content, tag, pinned, archived, created_by, created_at }`

Managed by `useShiftBrainState` directly. Pinned, non-archived notes are passed to `PreShiftBriefing` as the `notes` prop and appear as briefable items. Not consumed by `buildShiftIntelligence`.

### Current Limitations

- `ownerNotes` is wired but not yet consumed by intelligence functions
- All date comparisons use `item.created_at` as the primary fallback — items with no date field default to 0 days open
- Event matching uses `config.eventDate` first, then `eventDate` — events using other date field names will not appear in `eventPressure.today`
- `servicePatterns` counts all incidents (including resolved) — this is intentional for trend detection but means resolved patterns still surface
- Intelligence is computed at render time; there is no caching layer between hook unmounts

---

## 4. `shiftBrain` Object Shape

```js
{
  date: String,                    // ISO date, e.g. '2026-05-12'

  summary: {
    totalSignals: Number,          // openActions + unresolvedIncidents
    criticalCount: Number,         // urgentActions + criticalIncidents
    unresolvedIncidents: Number,
    openActions: Number,
    urgentActions: Number,
    eventsToday: Number,
    hasUrgentItems: Boolean,
    operationalStatus: 'clear' | 'attention' | 'critical'
  },

  criticalItems: [{
    id: String,
    type: 'action' | 'incident',
    label: String,
    detail: String,
    priority: String,
    source: 'actionBoard' | 'serviceRecovery'
  }],                              // max 8 items

  carryForwardItems: [{
    id: String,
    type: 'action' | 'incident',
    label: String,
    detail: String,
    daysOpen: Number,
    source: 'actionBoard' | 'serviceRecovery'
  }],                              // max 6 items, sorted by daysOpen desc

  riskSignals: [{
    id: String,
    signal: String,
    severity: 'high' | 'medium',
    source: String
  }],                              // max 5 signals

  eventPressure: {
    today: EventPlan[],
    upcoming: EventPlan[],         // next 7 days, max 3
    totalGuestsToday: Number,
    hasHighPressure: Boolean,      // today.length > 0 && totalGuestsToday >= 50
    hasMultipleEvents: Boolean
  },

  servicePatterns: [{
    category: String,
    count: Number,
    severity: 'high' | 'medium',
    recent: String                 // ISO date of most recent incident in category
  }],                              // only categories with count >= 2, max 4

  recommendedFocus: String[],      // 1–5 hospitality-native focus statements

  managerChecklist: [{
    id: String,
    text: String,
    category: 'shift-open' | 'operations' | 'event' | 'service' | 'shift-close'
  }]
}
```

### `operationalStatus` Decision Logic

| Condition | Status |
|---|---|
| `criticalCount >= 2` OR `unresolvedIncidents >= 4` AND `urgentActions > 0` | `critical` |
| `hasUrgentItems` OR `unresolvedIncidents >= 2` OR `openActions >= 5` | `attention` |
| None of the above | `clear` |

---

## 5. Design Rules

**Deterministic first.** All intelligence in `buildShiftIntelligence` is computed from data using conditionals and array operations. No randomness, no external calls, no AI. The output for the same inputs is always the same.

**No external AI calls in Shift Brain (yet).** The service is designed to be upgraded with AI summarization in the future — specifically `recommendedFocus` and `summary` are natural candidates. When that happens, the AI call goes into the service, not the hook or component.

**Service owns intelligence logic.** All classification, pattern detection, threshold decisions, and string generation live exclusively in `shiftBrainService.js`. Components never compute intelligence inline.

**Hook owns Shift Brain composition.** `useShiftBrainState` is the only place `buildShiftIntelligence` is called. It owns the `useMemo` boundary and the `shiftNotes` state. No other file calls `buildShiftIntelligence`.

**Components own rendering only.** `PreShiftBriefing` and `OperationalNotes` render `shiftBrain` data. They do not filter, classify, or derive intelligence from raw operational data (except for the legacy pre-briefing filters that predate V1 and remain unchanged).

**No feature logic in App.jsx.** App.jsx passes `{ actionItems, serviceIncidents, eventPlans, ownerNotes }` into `useShiftBrainState` and forwards `shiftBrain` through the `notifications` group. It does not read or act on `shiftBrain` in any other way.

**Null-safe everywhere.** Both `PreShiftBriefing` and `OperationalNotes` null-guard the `shiftBrain` prop. Removing the prop or passing `null` degrades gracefully to V0 behaviour.

---

## 6. Empty-State Behaviour

When all inputs are empty arrays (`buildShiftIntelligence({})`):

| Field | Value |
|---|---|
| `operationalStatus` | `'clear'` |
| `criticalItems` | `[]` |
| `carryForwardItems` | `[]` |
| `riskSignals` | `[]` |
| `servicePatterns` | `[]` |
| `recommendedFocus` | `['Clean operational slate — use pre-shift to reinforce service standards and team culture']` |
| `managerChecklist` | 4 items: brief team, confirm floor plan, verify POS, confirm closing manager |
| `eventPressure.today` | `[]` |

**PreShiftBriefing with empty state:**
- Status banner shows green dot + "Operationally Clear"
- Main column shows the clean-slate empty state ("◎ Clean slate.") with an immediate Start Shift button
- Intelligence sidebar shows Recommended Focus (1 bullet) and Manager Checklist (4 items)
- No other sidebar panels render

The empty state is a complete, usable briefing surface — not a broken or blank screen.

---

## 7. Known Technical Debt

1. **Ephemeral checklist state** — `checklistDone` in `PreShiftBriefing` is local `useState`. Navigating away and back resets all checklist ticks. Could be persisted to `sessionStorage` keyed by today's date so it survives in-session navigation.

2. **No owner view consumption** — `shiftBrain` is available in the `notifications` group and could power an operational pulse in `CommandCenter` and `WeeklySummary`. Currently unused by owner-facing pages.

3. **No AI summarization** — `recommendedFocus` and `summary` are deterministic string arrays. A Gemini call in `shiftBrainService.js` could produce richer, venue-aware phrasing. The hook and component are already structured to receive this upgrade without any prop changes.

4. **No backend shift memory** — The pre-shift briefing posts a snapshot to `/api/business-memory` but Shift Brain itself has no dedicated backend table. There is no way to compare tonight's operational status against last week's. A `shift_brain_snapshots` table would enable trend analysis.

5. **`ownerNotes` not consumed** — Passed to `buildShiftIntelligence` but not read by any intelligence function. Reserved for surfacing unacknowledged owner directives in the briefing.

6. **`servicePatterns` counts resolved incidents** — By design, to detect trends. But it means a pattern that was resolved weeks ago can still appear. A date window (e.g., last 30 days) on pattern detection would improve signal quality.

---

## 8. Recommended Next Product Step — Owner Brief Upgrade

The highest-value next step is wiring `shiftBrain` into the owner-facing view (`CommandCenter`).

`shiftBrain` is already available in the `notifications` group. No new hook work or data fetching is required. The upgrade is purely a component change.

**What to add to `CommandCenter`:**

```jsx
// Operational pulse card at the top of CommandCenter
// Use: shiftBrain.summary.operationalStatus, shiftBrain.summary.openActions,
//      shiftBrain.summary.unresolvedIncidents, shiftBrain.riskSignals,
//      shiftBrain.recommendedFocus
```

- An operational status banner (clear / attention / critical) at the top of the owner command view
- The top 2 recommended focus items surfaced as owner-visible priorities
- Risk signals visible to the owner without navigating to the shift brain area
- The owner sees the same operational picture the manager sees — without needing to open the pre-shift briefing

This gives the owner role real-time visibility into shift health from the landing page of the app, which is a meaningful product milestone toward the investor-grade vision.

**Props already available in PageRenderer:**
```js
// CommandCenter currently receives:
<CommandCenter t={t} currentUser={currentUser} goToPage={goToPage}
  reportArchive={reportArchive} eventPlans={eventPlans} businessMemory={businessMemory}
  budgetRequests={budgetRequests} employeeRequests={employeeRequests}
  serviceIncidents={serviceIncidents} actionItems={actionItems}
  notifications={visibleNotifications} onApproveEventEnquiry={onApproveEventEnquiry} />

// Add: shiftBrain={shiftBrain}
// shiftBrain is already destructured from notifications in PageRenderer
```

Single prop addition. No architecture changes.
