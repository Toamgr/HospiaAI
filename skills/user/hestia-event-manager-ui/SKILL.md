---
name: hestia-event-manager-ui
description: >
  UI rules for HESTIA Event Manager, Event CRM, event calendar, event detail,
  lead intake, manual event-manager briefs, Zohar event intelligence,
  department handoffs, event execution, and post-event memory. Use when
  designing, reviewing, or implementing event surfaces. Enforces that Zohar
  reads and interprets the event while the human Event Manager owns decisions,
  approvals, execution, and handoffs.
---

# HESTIA Event Manager UI

Zohar reads the event. The Event Manager owns the event.

AI may recommend. The Event Manager controls.

Lead data is raw input until reviewed or confirmed.

The manual event-manager brief is a primary source, not a casual note.

## When To Use This Skill

Use this skill for UI work involving:

- Event Manager, Event CRM, lead intake, event calendar, or event detail.
- Event status, client needs, guest sensitivities, timeline, setup, seating,
  food, beverage, staffing, tasks, risks, and handoffs.
- Manual event-manager briefs.
- Zohar event intelligence, recommendations, gaps, risks, and department drafts.
- Post-event memory candidates.

Use after `hestia-skills-orchestrator`,
`hestia-product-design-judgment`,
`hestia-hospitality-intelligence`, and
`hestia-venue-memory-provenance`. Use `hestia-ui-design` after event control
and source truth are clear.

## When Not To Use This Skill

Do not use this skill for:

- Venue identity discovery or Venue DNA conversation UI.
- Generic owner operational summaries outside an event context.
- Beverage-specific analysis unless it is part of an event handoff.
- Academy lesson/curriculum UI.
- Generic CRM redesign, generic calendar redesign, or decorative event visuals.
- Secret, credential, API key, token, `.env`, or private config inspection.

## Repo Sources

Prefer current event sources when relevant:

- `src/features/events/`
- `src/features/events/EventCalendar.jsx`
- `src/features/events/EventDetail.jsx`
- `src/features/events/tabs/EventZohar.jsx`
- `src/features/events/zohar/`
- `src/features/events/utils/zoharBriefOrchestrator.js`
- `src/features/events/utils/zoharRiskEngine.js`
- `src/features/events/utils/zoharRecommendations.js`
- `src/hooks/useEventState.js`

Do not read or expose secrets.

## Event Manager UI Principles

- Event Manager is a control surface, not an AI chat page.
- Event Manager is not a generic CRM, not only a calendar, not an inspiration
  board, and not a Zohar show.
- Lead received -> Event Manager structures details -> Event Manager adds manual
  brief -> Zohar interprets through Venue DNA and event data -> Event Manager
  accepts, edits, rejects, or sends handoffs -> departments act -> post-event
  memory candidates are created.
- Human decisions must be visible: accepted, edited, rejected, sent, completed.
- Keep event execution clearer than event aesthetics.

## Lead Intake Rules

- Lead data is raw input until reviewed, structured, or confirmed by the Event
  Manager.
- Do not display lead guesses as confirmed client needs.
- Missing fields should become open questions, not fake event truth.
- Lead source, age, status, owner, and review state should be visible.

## Manual Brief Rules

- The manual event-manager brief is a primary source, not a casual note.
- Preserve the brief as a source for Zohar, department handoffs, and memory
  candidates.
- Do not hide the brief behind AI summaries.
- If AI summarizes the brief, keep the original available or clearly referenced.

## Zohar Rules

- Zohar may identify gaps, risks, contradictions, client sensitivities, service
  requirements, timeline issues, staffing needs, beverage/food implications, and
  setup concerns.
- Zohar must not overwrite event details, approve changes, or create operational
  truth without Event Manager confirmation.
- Zohar recommendations are drafts or recommendations unless accepted.
- Do not turn Zohar into an all-purpose event chatbot.

## Department Handoff Rules

- Handoffs generated from Zohar remain drafts until accepted, edited, or sent by
  the Event Manager.
- Each handoff needs status, owner, department, source, and next action.
- Department views should receive only the action-ready context they need.
- Do not send direct department handoffs without Event Manager acceptance.

## Event Lifecycle Rules

- Track event state across lead, draft, confirmed, preparation, ready, live,
  completed, cancelled, and post-event memory review where supported.
- Status labels must not imply readiness without source.
- Post-event memory candidates are candidates until reviewed or supported.
- Event execution owns today. Venue Memory owns what should persist.

## Display Rules

| Item | UI rule |
| --- | --- |
| Leads | Show raw/reviewed/confirmed state, source, owner, and missing fields. |
| Event details | Show confirmed fields separately from inferred or open fields. |
| Manual briefs | Treat as primary source; keep source visibility. |
| Event status | Show lifecycle state, readiness, owner, and next action. |
| Client needs | Require source: lead, brief, client message, manager note, or confirmation. |
| Guest sensitivities | Minimize sensitive detail and role-scope it. |
| Timeline | Separate confirmed schedule from suggested timing risks. |
| Seating/setup | Show confirmed layout, open questions, and operational dependencies. |
| Food | Route chef/kitchen implications as drafts or accepted handoffs. |
| Beverage | Route cocktail/bar implications with cost/source honesty. |
| Staffing | Do not invent staffing risk; show evidence and owner. |
| Tasks | Show owner, status, source, due time, and department. |
| Risks | Show fact, interpretation, confidence, and action. |
| Recommendations | Stay editable, rejectable, and source-visible. |
| Handoffs | Show draft/sent/accepted/completed state and owner. |
| Post-event memory candidates | Label as candidates and preserve event source. |

## Role Visibility Rules

| Role | Show | Guardrail |
| --- | --- | --- |
| events_manager | Full event control, Zohar drafts, handoffs, event detail, timeline, client needs. | Owns decisions and confirmations. |
| owner | Business-level event health, major risks, revenue/context where sourced, memory implications. | No unnecessary staff/client sensitive detail. |
| admin | Broad oversight and diagnostics with venue boundaries. | Do not bypass confirmation or provenance. |
| manager | Service readiness, staffing, floor, tasks, execution risks, handoffs. | Do not expose owner-only strategy. |
| chef | Food, kitchen, allergy, prep, timing, event food handoffs. | No unrelated client or staff details. |
| bar_manager | Beverage, cocktail, bar prep, stock, service timing, beverage handoffs. | No unsourced pricing or supplier claims. |
| fb_director | Cross-F&B risks, food/beverage alignment, department readiness. | Keep source and status clear. |
| employee | Assigned tasks and briefing context needed for execution. | No owner intelligence or sensitive client/team data. |

## Relationship To Other Systems

| System | Relationship |
| --- | --- |
| Venue Intelligence | Provides Venue DNA context when sourced. Event Manager does not define Venue DNA directly. |
| Operational Intelligence | May surface event-related operational risks, but does not control the event record. |
| Beverage Intelligence | Owns beverage analysis; Event Manager controls event beverage decisions and handoffs. |
| Academy | May receive post-event capability gaps, but training remains Academy-owned. |
| Chef | Receives food/kitchen handoffs; Chef workflows own kitchen execution. |
| Shift Brain | May surface event pressure and prep risks; Event Manager remains event control. |

## Anti-Patterns To Block

- Replacing Event Manager decisions with AI decisions.
- Turning Zohar into an all-purpose event chatbot.
- Generic CRM redesign or second calendar model.
- Fake event data, urgency, client sensitivity, staffing risk, guest behavior,
  budget pressure, or event preferences.
- Hiding manual brief importance.
- Direct department handoffs without Event Manager acceptance.
- Decorative event visuals that do not improve execution.
- Owner-level visibility leaking into staff views.
- Staff/team sensitive info shown too broadly.

## Verification Checklist

- Event Manager remains the control surface.
- Zohar recommendations are drafts/recommendations unless accepted.
- Lead data is not treated as confirmed until reviewed.
- Manual brief is preserved as a source.
- Venue DNA context is used only when sourced.
- Department handoffs have status and owner.
- Role visibility is appropriate.
- No fake event signals or fake urgency were introduced.
- Mobile event review remains usable.
- Build/browser/role checks are required if UI changes are implemented later.

## Final Response Protocol

State which event-control rule was applied, which files changed, whether Zohar,
manual brief, handoffs, role visibility, or memory candidates were affected, and
what verification was run or skipped. Keep the answer operational.
