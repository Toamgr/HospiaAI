---
name: hestia-story-carousel
description: >
  Manual-only UI rules for short, guided, slide-like HESTIA flows: owner
  onboarding, venue learning steps, guest journey explanation, event package
  flows, amenity tours, training explanations, and operational review
  narratives. Use only when a short sequence is clearer than a direct screen.
  Prevents marketing carousels, forced feature tours, fake claims, long
  sequences, poor accessibility, and replacing real workflows with slides.
---

# HESTIA Story Carousel

Manual-only skill. Do not auto-invoke for normal HESTIA UI work.

A story carousel is not a marketing carousel.
It is not a slideshow gimmick.
It is a guided hospitality explanation that reduces complexity and helps the
user decide, understand, or act.

A story carousel must reduce complexity, not decorate it.

Do not use carousel structure when a direct operational screen is clearer.

Every step needs a job.

## When To Use This Skill

Use this skill only when a short sequence is genuinely better than one screen:

- Owner entry or owner onboarding.
- Venue learning steps.
- Guest-facing explanation or hospitality journey.
- Event package or experience explanation.
- Academy concept explanation.
- Operational review narrative.
- Non-production interaction exploration.

Use after `hestia-skills-orchestrator`,
`hestia-product-design-judgment`, and the relevant domain skill.

## When Not To Use This Skill

Do not use this skill for:

- Dense operational work.
- Event Manager control, Owner Intelligence, Venue Intelligence, or Shift Brain
  when a direct screen is clearer.
- Critical information that must be visible all at once.
- Generic feature tours.
- Marketing slides with no workflow value.
- Secret, credential, API key, token, `.env`, or private config inspection.

## Story Flow Principles

- Keep the sequence short.
- Every step must move the user toward understanding or action.
- Skip, back, next, and exit must be available.
- Mobile readability comes first.
- Keyboard access and reduced motion are required.
- Claims must be sourced, marked illustrative, or removed.
- Do not hide important operational information behind animation.

## Flow Rules

| Flow | Rule |
| --- | --- |
| Owner entry sequence | May orient the owner, but must use real session/venue state and avoid fake intelligence. |
| Venue learning sequence | Should guide discovery questions and show what each step clarifies. |
| Guest-facing flow | Should explain an experience, package, or journey without fake venue images or hidden commitments. |
| Event package flow | Must not replace Event Manager control or event detail review. |
| Academy explanation flow | Should clarify learning path or standard; do not imply mastery from viewing. |
| Operational review flow | Use only for narrative review, not live operational control. |

## Slide Content Rules

Each step needs:

- Title.
- Context.
- Evidence/source if claims are made.
- Action or decision.
- Clear skip/next/back behavior.
- Progress indicator.

Do not add a step that exists only for mood.

## Relationship To Other Systems

| System | Relationship |
| --- | --- |
| Owner Threshold | May support a manual-only entry concept, but must not fake venue intelligence. |
| Venue Intelligence | May guide discovery; Venue Intelligence remains the source of venue truth. |
| Guest Portal | May explain packages or journeys; guest actions remain direct and accessible. |
| Academy | May explain learning paths; Academy owns lesson and progress logic. |
| Event Manager | May explain packages; Event Manager controls event records and execution. |

## Anti-Patterns To Block

- Marketing carousel.
- Feature tour with no workflow value.
- Hiding critical operational data.
- Fake images.
- Fake guest or venue claims.
- Long sequences.
- Forced animation.
- No skip path.
- Poor mobile readability.
- Replacing Event Manager, Owner Intelligence, or Venue Intelligence with slides.

## Verification Checklist

- Each step has a purpose.
- Sequence length is justified.
- Skip/back/next are clear.
- Claims are sourced or marked as illustrative.
- Mobile readability is good.
- Reduced motion is respected.
- The carousel does not replace a better direct workflow.

## Final Response Protocol

State why a sequence was justified, which files changed, how many steps exist,
whether claims are sourced or illustrative, and what accessibility/reduced-motion
verification was run or skipped.
