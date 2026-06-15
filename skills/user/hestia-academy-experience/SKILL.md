---
name: hestia-academy-experience
description: >
  UI/UX rules for HESTIA Academy, training, capability development, instructor
  experience, lesson surfaces, venue-derived recommendations, service/bar/wine/
  food learning, Wine Atlas, staff development, and operational training loops.
  Use with hestia-academy-design-curriculum. Enforces Academy as professional
  formation, not a generic LMS, and prevents completion from being treated as
  proven capability.
---

# HESTIA Academy Experience

Academy is professional formation, not a generic LMS.

Completion is exposure, not capability.

Training recommendations must be grounded in venue standards, operational
evidence, or manager confirmation.

Do not invent lessons or staff weaknesses.

## When To Use This Skill

Use this skill for UI/UX work involving:

- HESTIA Academy, Service School, Wine Atlas, training, lessons, instructors, or
  staff development.
- Venue-derived training recommendations.
- Capability gaps, assessments, manager verification, role progression, or
  operational training loops.
- Academy links from Venue Intelligence, Operational Intelligence, Beverage
  Intelligence, Event Manager, or Shift Brain.

Use after `hestia-skills-orchestrator`,
`hestia-product-design-judgment`,
`hestia-hospitality-intelligence`, and
`hestia-venue-memory-provenance`. Pair with
`hestia-academy-design-curriculum`.

## When Not To Use This Skill

Do not use this skill for:

- Writing full curriculum structure without `hestia-academy-design-curriculum`.
- Generic course marketplace, LMS, gamification, or corporate training design.
- Operational incident/action UI outside training impact.
- Beverage, event, or venue intelligence UI unless training is the outcome.
- Secret, credential, API key, token, `.env`, or private config inspection.

## Repo Sources

Prefer current Academy sources when relevant:

- `skills/user/hestia-academy-design-curriculum/SKILL.md`
- `src/features/academy/`
- `src/features/academy/LessonPlayer.jsx`
- `src/features/academy/RecommendedForVenue.jsx`
- `src/features/wine-atlas/`
- `src/hooks/useStaffAcademyState.js`

Do not read or expose secrets.

## Relationship To Curriculum Skill

`hestia-academy-design-curriculum` governs lesson doctrine, curriculum fields,
drills, assessments, instructor scripts, and 5x5 learning structure.

This skill governs the product experience: how courses, lessons, progress,
recommendations, capability evidence, and role views appear in the app.

Use both for Academy work that changes curriculum and UI.

## Academy UI Principles

- Academy should feel like a professional hospitality school inside the
  workplace, not a course grid.
- Training must connect to venue standards, operational gaps, manager
  observations, incidents, service goals, and intelligence signals.
- Completion means exposure. Capability requires assessment, manager observation,
  or operational evidence.
- Recommendations must be role-aware and venue-aware.
- Staff development should be respectful, specific, and actionable.
- Do not shame staff or turn weak evidence into permanent judgment.

## Display Rules

| Item | UI rule |
| --- | --- |
| Courses | Show role relevance, venue relevance, and formation purpose. |
| Lessons | Show real service behavior, drill, standard, and practical outcome. |
| Instructors | Present as professional guides, not mascots or generic avatars. |
| Lesson progress | Label as exposure/completion unless assessed. |
| Reading/video/voice modes | Support learning clarity; do not imply video equals quality. |
| Recommendations | Show source: venue standard, incident, manager note, capability signal, or intelligence input. |
| Venue-derived training needs | Link to source and confidence. |
| Capability gaps | Require evidence or manager confirmation; avoid character judgment. |
| Assessments | Test judgment, timing, standards, recovery, or service behavior. |
| Manager verification | Show who verified, when, and what was observed. |
| Staff development paths | Role-specific, respectful, and reviewable. |
| Wine Atlas/editorial learning | Preserve editorial depth while keeping the learning task clear. |

## Training Recommendation Provenance

Training recommendations must cite at least one of:

- Venue standard or Venue DNA signal.
- Operational gap or incident.
- Manager observation.
- Service goal.
- Beverage, Event, Owner, Venue, or Operational Intelligence signal.
- Existing lesson inventory.

If the relevant lesson does not exist, mark the need as a training gap. Do not
invent a lesson.

## Role Visibility Rules

| Role | Show | Guardrail |
| --- | --- | --- |
| employee | Assigned learning, accessible lessons, practical drills, own progress. | Do not show broad staff comparisons or sensitive notes. |
| manager | Team training needs, coaching prompts, verification tasks, capability evidence. | Do not overstate mastery from completion. |
| bar_manager | Beverage/bar capability, build guides, approved cocktails, bar training needs. | Keep costing/strategy out unless role-approved. |
| fb_director | Cross-F&B training priorities and venue standards. | Do not invent capability gaps. |
| chef | Food/kitchen training needs and standards. | Show only relevant staff/team context. |
| events_manager | Event/service training implications and event readiness gaps. | Event control remains in Event Manager. |
| owner | Strategic capability patterns, training investment needs, unresolved gaps. | Avoid staff shaming and unnecessary individual detail. |
| admin | Broad oversight with venue boundaries. | Do not bypass role safety. |

## Relationship To Other Systems

| System | Relationship |
| --- | --- |
| Venue Intelligence | Supplies venue standards and identity signals for training relevance. |
| Operational Intelligence | Surfaces capability gaps from incidents, reports, carry-forward, or risks. |
| Beverage Intelligence | Supplies beverage training needs; Academy owns formation. |
| Event Manager | Supplies event-derived training needs; Event Manager controls event records. |
| Shift Brain | May surface shift-level capability gaps; Academy turns them into formation paths. |

## Anti-Patterns To Block

- Generic LMS grid.
- Meaningless badges.
- Progress bars that imply mastery.
- Invented capability gaps.
- Generic corporate training copy.
- Staff shaming.
- Training recommendations without source.
- Academy disconnected from venue standards.
- Academy disconnected from incidents or operational loops.
- One-size-fits-all training paths.
- Treating video presence as learning quality.
- Decorative editorial design without learning clarity.

## Verification Checklist

- Progress is not described as mastery unless assessed.
- Recommendations are sourced.
- Venue standards are respected.
- Existing lesson inventory is not misrepresented.
- Staff weaknesses are not invented.
- Role visibility is appropriate.
- Academy remains formation-centered.
- Mobile lesson flow remains usable.
- Build/browser checks are required if UI changes are implemented later.

## Final Response Protocol

State which Academy rule was applied, which files changed, whether curriculum,
progress, recommendations, role visibility, or capability evidence was affected,
and what verification was run or skipped.
