---
name: hestia-operational-intelligence-ui
description: >
  UI rules for HESTIA Operational Intelligence surfaces. Use when designing,
  reviewing, or implementing owner/admin/manager operational views, Shift Brain,
  operational pulse, incidents, actions, carry-forward items, shift reports,
  unresolved risks, recommendations, memory candidates, and role-specific
  operational summaries. Enforces exception-based hospitality intelligence, not
  dashboards, KPI walls, chatbot-first owner assistants, vague executive
  summaries, fake AI business knowledge, or decorative operational surfaces.
---

# HESTIA Operational Intelligence UI

HESTIA Operational Intelligence is not a dashboard.
It is not a KPI wall.
It is not a chatbot.
It is not a pile of cards.
It is an exception-based hospitality operating layer.

Operational Intelligence should feel like a calm senior operator noticing what
matters, not like a dashboard shouting metrics.

## When To Use This Skill

Use this skill for UI work involving:

- Owner/admin operational summaries, pulse, reports, or recommendations.
- Manager action views, Action Board, incidents, End of Day, or shift reports.
- Shift Brain, pre-shift briefing, operational notes, carry-forward items.
- Operational recommendations, trends, exceptions, unresolved risks, or memory
  candidates.
- Any UI that answers what happened, why it matters, what changed, what is
  uncertain, what should happen next, who owns it, or what should become memory.

Use after `hestia-skills-orchestrator`,
`hestia-product-design-judgment`, and
`hestia-venue-memory-provenance`. Use `hestia-ui-design` after operational truth
and role visibility are clear.

## When Not To Use This Skill

Do not use this skill for:

- Venue identity discovery or Venue DNA conversation UI.
- Event Manager control surfaces, unless surfacing operational risks from events.
- Beverage-specific analysis, unless it affects operations or owner attention.
- Academy lesson/curriculum UI, unless showing an operational capability gap.
- Generic analytics, business intelligence, or decorative executive dashboards.
- Secret, credential, token, API key, `.env`, or private config inspection.

## Repo Sources

Prefer these current sources when relevant:

- `src/features/owner/`
- `src/features/operations/`
- `src/features/shift-brain/`
- `src/features/owner/OperationalPulse.jsx`
- `src/features/owner/WhatHestiaLearned.jsx`
- `src/features/operations/operationalIntelligenceUtils.js`
- `src/services/shiftBrainService.js`
- `src/hooks/useOwnerPulseState.js`
- `src/hooks/useOperationsState.js`
- `src/hooks/useShiftState.js`
- `src/hooks/useShiftBrainState.js`

Do not read or expose secrets.

## UI Principles

- Operational truth before visual polish.
- Exception-based intelligence before generic KPI display.
- Actionability before decoration.
- Source/provenance before confidence.
- Role-specific visibility before broad access.
- Venue-specific context before generic benchmarks.
- Human control before AI automation.
- Show what happened, why it matters, what changed, what is uncertain, what
  should happen next, who owns it, and what should become memory.
- Prefer clear operational language:
  "Three things require attention before tonight."
  "This issue carried forward from yesterday."
  "Insufficient signal - ask the manager before treating this as a pattern."

## Display Rules

| Item | UI rule |
| --- | --- |
| Incidents | Show status, severity, source, owner, age, and next action. Do not expose sensitive guest/team details beyond role need. |
| Actions | Show owner, source, due/age, priority, carry-forward state, and whether it is assigned or suggested. |
| Shift reports | Surface exceptions, unresolved items, urgent notes, and memory candidates. Do not turn a report into a KPI dump. |
| Carry-forward items | Show what carried, from when, why it matters, and who owns closure. |
| Recommendations | Separate fact, interpretation, confidence, action, role owner, venue boundary, and memory impact. |
| Trends | Require repeated evidence. One incident is not a trend. Show context and source. |
| Exceptions | Prioritize what needs attention now or before service, not every metric available. |
| Unresolved risks | Show evidence, age, severity, owner, and escalation path. |
| Owner/admin summaries | Summarize strategic exceptions and changes. Do not flood owners with manager-level noise. |
| Manager action views | Show service-ready tasks, incidents, briefings, and handoffs. Do not become owner strategy reports. |
| Memory candidates | Label as candidates, show source/evidence, and require confirmation where high impact. |

## AI Recommendation Rules

Every AI-generated operational recommendation must show or preserve:

- Fact: what is known and from which source.
- Interpretation: what HESTIA thinks it means.
- Confidence: how strong the evidence is.
- Action: what should happen next.
- Owner/role: who owns the next step.
- Venue boundary: which venue, shift, event, team, or department it applies to.
- Memory impact: what should be remembered, discarded, or reviewed later.

Never invent revenue, margin, guest sentiment, staff performance, risk, urgency,
staff weakness, event pressure, supplier issue, or operational observation. Do
not let AI execute high-impact actions without human approval.

## Role Visibility Rules

| Role | Show | Guardrail |
| --- | --- | --- |
| owner | Strategic exceptions, owner-level risks, trend changes, unresolved escalations, memory candidates, sourced commercial/operational summaries. | No manager noise, no unsourced KPIs, no sensitive staff/guest detail unless required. |
| admin | Broad operational oversight and diagnostic access, with venue boundaries visible. | Do not bypass provenance or role gates. |
| manager | Shift readiness, incidents, carry-forward, actions, briefings, service risks, team handoffs. | Do not turn manager views into owner reports. |
| bar_manager | Bar, beverage, stock, cocktail, prep, service, and bar-team exceptions. | Beverage analysis stays in Beverage Intelligence unless operational action is required. |
| fb_director | Cross-F&B operational risks, service patterns, menu/capability signals, department alignment. | Avoid staff gossip or unconfirmed capability judgments. |
| events_manager | Event-related operational risks, setup gaps, event handoffs, client-impacting exceptions. | Event Manager remains the control surface for event records and execution. |
| chef | Kitchen, food, prep, allergy, timing, and event-food risks relevant to action. | No owner strategy or unrelated staff data. |
| employee | Assigned tasks, briefings, handoffs, and service instructions needed for the shift. | No owner intelligence, staff weakness summaries, or sensitive guest history beyond need. |

## Anti-Patterns To Block

- Generic SaaS dashboard.
- KPI wall or business intelligence chart page.
- Chatbot-first owner assistant.
- Vague executive summary with no source or action.
- Fake "AI knows your business" page.
- Decorative luxury surface with weak operational value.
- "Revenue up 14%" without source, context, and business meaning.
- Staff performance score without evidence, review path, and role safety.
- Confidence badges without provenance.
- Generic cards that do not create action.
- Owner pages filled with empty modules.
- Treating one incident as a pattern.
- Treating unresolved notes as confirmed operational truth.
- Exposing staff weaknesses broadly.
- Bypassing human approval for high-impact actions.

## Relationship To Other Systems

| System | Relationship |
| --- | --- |
| Venue Intelligence | Defines who the venue is and what it is trying to become. Operational Intelligence shows what is happening now and whether reality matches that identity. |
| Event Manager | Controls event-specific records, briefs, execution, and handoffs. Operational Intelligence may surface event-related risks but must not replace Event Manager control. |
| Beverage Intelligence | Owns beverage-specific analysis. Operational Intelligence surfaces beverage exceptions only when they affect operations, owner attention, or cross-department action. |
| Academy | Owns training formation. Operational Intelligence may surface capability gaps, but progress is exposure unless assessed. |
| Shift Brain | Deterministic operational intelligence engine. Do not duplicate Shift Brain logic in UI components; render what the service/hook provides. |

## Verification Checklist

Before finishing Operational Intelligence UI work, check:

- The UI is exception-based, not a dashboard or KPI wall.
- Each recommendation separates fact, interpretation, confidence, action, role,
  venue boundary, and memory impact.
- Sources/provenance are visible before confidence.
- One incident is not presented as a pattern.
- Unresolved notes are not presented as confirmed truth.
- Role visibility is appropriate for owner, admin, manager, bar manager,
  F&B director, events manager, chef, and employee.
- Sensitive guest/team data is minimized.
- Owner views are not cluttered with manager noise.
- Manager views are not strategic owner reports.
- No fake revenue, margin, sentiment, staff performance, risk, urgency, or venue
  signal was introduced.
- High-impact operational action remains human-approved.
- Build, browser, role, mobile, and accessibility checks were run when UI changed.

## Final Response Protocol

When reporting work, state:

- Which Operational Intelligence UI rule was applied.
- Which file was created or changed.
- Whether incidents, actions, reports, recommendations, trends, risks, roles, or
  memory candidates were affected.
- What verification was performed or why it was not run.
- Any remaining assumptions or missing evidence.

Keep the answer direct. Do not describe Operational Intelligence as a dashboard,
KPI page, chatbot, executive wallpaper, or generic analytics screen.
