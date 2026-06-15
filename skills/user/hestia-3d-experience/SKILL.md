---
name: hestia-3d-experience
description: >
  Manual-only UI rules for rare HESTIA 3D or cinematic interaction layers. Use
  only for explicit 3D/cinematic tasks where 3D reveals hospitality meaning,
  spatial context, event setup, venue atmosphere, or operational understanding
  better than 2D. Prevents decorative 3D, fake venue renders, 3D dashboards,
  heavy motion without fallback, and performance-heavy prototypes treated as
  production.
---

# HESTIA 3D Experience

Manual-only skill. Do not auto-invoke.

3D is not a default design language.

3D must reveal something hospitality-relevant that 2D cannot express as well.

3D is manual-only and never default.

If it is conceptual, label it as conceptual.

Reduced motion and static fallback are mandatory.

## When To Use This Skill

Use this skill only for explicit, bounded 3D/cinematic work such as:

- Non-production prototype.
- Event setup visualization.
- Venue/floorplan concept.
- Spatial seating planning.
- Owner Threshold concept exploration.
- Premium guest-facing explanation.
- Signature cinematic moment with real meaning.

Use after `hestia-skills-orchestrator`,
`hestia-product-design-judgment`, the relevant domain skill, and
`hestia-ui-design`.

## When Not To Use This Skill

Do not use this skill for:

- Normal dashboards or operational pulse.
- Dense event details.
- Shift briefing.
- Beverage costing.
- Academy lesson lists.
- Generic wow effects.
- Owner/manager operational screens by default.
- Secret, credential, API key, token, `.env`, or private config inspection.

## 3D Purpose Test

Before using 3D, answer:

- What hospitality meaning does it reveal?
- What workflow or decision does it improve?
- Why is 2D weaker here?
- Is the venue/event representation real or conceptual?
- Can the user complete the core workflow without the 3D layer?

If the answer is unclear, do not use 3D.

## Performance Rules

- Keep 3D rare and bounded.
- Do not block core workflow access behind a canvas.
- Document mobile and performance risk.
- Use stable asset loading and visible fallback states.
- Do not treat performance-heavy prototypes as production-ready.

## Accessibility And Reduced Motion Rules

- Reduced motion support is required.
- Static fallback is required.
- Keyboard and non-pointer access must remain possible for core actions.
- Motion must never be the only way to understand state.

## Real Vs Conceptual Representation Rules

- Do not fake the venue.
- Do not imply a conceptual scene is a real space.
- Label conceptual renders clearly.
- Do not use generic luxury hotel renders as venue truth.
- Do not misrepresent layout, capacity, accessibility, or event setup.

## Use Case Rules

| Use case | Rule |
| --- | --- |
| Event spatial visualization | Must support seating/setup understanding and preserve Event Manager control. |
| Owner Threshold exploration | Prototype-only unless production approval exists; no fake intelligence. |
| Guest-facing premium experience | Must explain a real offer, journey, or space; do not hide commitments. |
| Prototype-only work | Label as prototype and document production blockers. |

## Relationship To Other Systems

| System | Relationship |
| --- | --- |
| Event Manager | 3D may visualize spatial setup, but Event Manager owns event data and decisions. |
| Owner Threshold | 3D is exploration only unless explicitly approved. |
| Story Carousel | Story may be a lighter alternative to 3D for guided explanation. |
| Venue Intelligence | 3D must not fabricate Venue DNA or venue reality. |

## Anti-Patterns To Block

- 3D as decoration.
- Fake venue render presented as real.
- Heavy canvas on operational screens.
- Motion-heavy entry with no fallback.
- 3D dashboards.
- 3D charts for no reason.
- Replacing clear UI with cinematic UI.
- Performance-heavy prototypes treated as production.
- Generic luxury hotel render.
- Architectural fantasy that misrepresents the venue.

## Verification Checklist

- 3D has a stated product purpose.
- 2D alternative was considered.
- Reduced-motion fallback exists.
- Static fallback exists.
- Mobile/performance risk is documented.
- Conceptual renders are labeled.
- No fake venue reality is implied.
- The 3D layer does not block core workflow access.

## Final Response Protocol

State why 3D was justified, whether the result is prototype or production, which
files changed, whether conceptual/real status is labeled, and what reduced
motion, static fallback, mobile, and performance verification was run or skipped.
