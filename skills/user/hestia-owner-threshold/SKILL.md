---
name: hestia-owner-threshold
description: >
  Manual-only UI rules for HESTIA Owner Threshold, Owner Entry, and entry
  experience work. Use only for explicit Owner Threshold tasks, prototype
  review, or approved owner-entry exploration. Prevents direct production use
  of prototypes, fake operational observations, fake faculties, hardcoded venue
  statements, theatrical luxury, generic AI startup visuals, and entry screens
  that delay useful access.
---

# HESTIA Owner Threshold

Manual-only skill. Do not auto-invoke for ordinary owner pages.

Owner Threshold is not a loading screen.
It is not a landing page.
It is not a dashboard.
It is not a chatbot entry.
It is not decorative luxury.
It is a threshold into a living hospitality intelligence system.

Study the prototype for principles, not production code.

The threshold may feel alive, but it must not fake intelligence.

Real venue signals only.

Owner Entry must not become decorative theatre.

## When To Use This Skill

Use this skill only for explicit work on:

- Owner Threshold, Owner Entry, owner recognition, or entry experience.
- `prototypes/owner-threshold.html` review.
- Production planning for an owner/admin entry route.
- Non-production exploration of threshold interaction or narrative.

Use after `hestia-skills-orchestrator`,
`hestia-product-design-judgment`,
`hestia-venue-memory-provenance`, and `hestia-ui-design`.

## When Not To Use This Skill

Do not use this skill for:

- Normal Owner Intelligence pages.
- Operational Pulse, Event Manager, Venue Intelligence, or dashboards.
- Generic onboarding.
- 3D/cinematic work unless explicitly paired with `hestia-3d-experience`.
- Story sequences unless explicitly paired with `hestia-story-carousel`.
- Secret, credential, API key, token, `.env`, or private config inspection.

## Repo Sources

Prefer current sources when relevant:

- `prototypes/owner-threshold.html`
- `src/features/auth/` if present.
- `src/features/owner/`
- `src/features/venue-intelligence/`
- `src/hooks/useSessionState.js`
- `src/hooks/useVenueState.js`

Do not read or expose secrets.

## Owner Threshold Principles

- Production Owner Entry must use real auth, session, role, and venue state.
- Production Owner Entry must use real venue signals only.
- Unknown states are allowed and should be honest.
- Existing named intelligences may be referenced only where product reality
  supports them.
- Do not invent a cast of personas.
- Reduced motion and mobile fallback are required.
- Useful access matters more than cinematic arrival.

## Prototype Rules

- `prototypes/owner-threshold.html` is prototype only.
- It may be studied for tone, pacing, warmth, restraint, and anti-startup visual
  direction.
- It must not be copied directly into production.
- Its hardcoded faculties, thoughts, and venue signals must not be treated as
  operational truth.

## Productionization Rules

- Require explicit production approval before moving from prototype to app UI.
- Use existing auth/session/venue selection.
- Preserve venue boundaries and owner/admin role access.
- Show insufficient signal rather than fake confidence.
- Do not use 3D, particles, galaxy, neural network, or startup AI aesthetics by
  default.
- Use actual HESTIA logo, background, or brand assets when supplied.

## Display Rules

| Item | UI rule |
| --- | --- |
| Existing venue | Recognize from real session/venue state only. |
| New venue | Route toward venue learning without pretending prior memory exists. |
| Venue selection | Make active venue explicit and prevent cross-venue leakage. |
| Venue learning entry | Connect to Venue Intelligence, not generic onboarding. |
| Real operational signals | Show only sourced signals. |
| Unknown / insufficient signal | State honestly and invite learning. |
| Owner recognition | Use real owner/admin session context only. |
| Reduced-motion fallback | Required for motion-heavy concepts. |

## Relationship To Other Systems

| System | Relationship |
| --- | --- |
| Venue Intelligence | Owner Entry may open into venue learning when signals are thin. |
| Owner Intelligence | Entry may route to owner intelligence when real owner-level signals exist. |
| Operational Intelligence | Entry may surface urgent operational exceptions only when sourced. |
| Event Manager | Entry may surface event pressure only when sourced and role-appropriate. |

## Anti-Patterns To Block

- Direct production use of `prototypes/owner-threshold.html`.
- Fake faculties, operational thoughts, venue urgency, memory confidence, or
  venue signals.
- Particles, galaxy visuals, neural networks, or generic AI startup look.
- Theatrical curtain gimmicks unless explicitly requested as non-production
  exploration.
- Owner entry with no real venue/auth/session logic.
- 3D by default.
- Heavy motion without reduced-motion support.
- Beautiful entry that delays useful access.

## Verification Checklist

- Prototype remains prototype unless a production plan is explicitly approved.
- Any production concept uses real session/venue state.
- No fake signals or urgency are shown.
- Venue boundary is preserved.
- Owner/admin role access is respected.
- Reduced motion exists.
- Mobile fallback exists.
- Build/browser checks are required if UI changes are implemented later.

## Final Response Protocol

State whether the work was prototype review, production planning, or
implementation; which files changed; whether real session/venue signals were
used; and what verification was run or skipped.
