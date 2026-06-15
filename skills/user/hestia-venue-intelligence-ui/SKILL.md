---
name: hestia-venue-intelligence-ui
description: >
  UI rules for the HESTIA Venue Intelligence and Venue DNA conversation
  experience. Use when designing, editing, reviewing, or implementing owner/admin
  venue-learning screens, Venue DNA panels, Venue Memory displays, open-question
  flows, confidence maps, identity drift surfaces, or specialist impacts for
  Omer, Zohar, Academy, and Owner Intelligence. Keeps the experience from
  becoming a generic chatbot, dashboard, form wizard, brand questionnaire,
  personality test, or fake all-knowing AI screen.
---

# HESTIA Venue Intelligence UI

The Owner/Admin defines the venue's identity.
HESTIA interprets, organizes, challenges, and remembers.
Venue DNA is earned through evidence, not written as branding copy.

## When To Use This Skill

Use this skill for UI work involving:

- `src/features/venue-intelligence/`
- Venue Intelligence conversation screens.
- Venue DNA, Venue Memory, confidence, open questions, or identity drift UI.
- Owner/Admin venue-learning experiences.
- Specialist impact displays for Omer, Zohar, Academy, or Owner Intelligence.
- Venue Bridge inspector or read-only specialist brief surfaces.

Use after `hestia-skills-orchestrator`,
`hestia-product-design-judgment`, and
`hestia-venue-memory-provenance`. Use `hestia-ui-design` for visual system
rules after the venue intelligence model is honest.

## When Not To Use This Skill

Do not use this skill for:

- Event Manager calendar, event detail, event execution, or lead management.
- Zohar event recommendations unless the task is specifically about venue
  context feeding Zohar.
- Beverage/Cocktail Intelligence UI unless it is displaying Venue DNA impact.
- Academy lesson UI unless it is displaying venue-derived training context.
- Generic owner dashboards, KPI pages, or static strategy copy.
- Pure backend/data-model work with no UI decision.
- Secret, credential, token, API key, `.env`, or private config inspection.

## Required Sources

Read only what the task needs. Prefer:

- `skills/user/hestia-venue-memory-provenance/SKILL.md`
- `skills/user/hestia-product-design-judgment/SKILL.md`
- `skills/user/hestia-ui-design/SKILL.md`
- `docs/research/researches for Venue Intelligence/HESTIA Intelligence Doctrine v1.md`
- `src/features/venue-intelligence/venueDnaModel.js`
- `src/features/venue-intelligence/VenueIntelligence.jsx`
- `src/features/venue-intelligence/VenueBridgeInspector.jsx`
- `src/services/venueBridge/venueBridgeService.js`

Do not read or expose secrets.

## UI Principles

- Treat the conversation as persistent discovery, not one-time onboarding.
- Show what HESTIA knows, what it thinks, what it is unsure about, and what it
  needs to ask next.
- Keep conversation paired with evidence panels; do not build a blank chatbot.
- Separate founder/owner intent from operational reality.
- Separate confirmed Venue DNA from Venue DNA candidates.
- Show contradictions and identity drift as useful open questions, not errors.
- Make uncertainty visible without making the user feel accused.
- Keep the venue, role, stage, and confidence visible where they affect meaning.
- Use hospitality-native language: venue, signal, memory, standard, promise,
  open question, confidence, brief, handoff.

## Display Rules

| Item | UI rule |
| --- | --- |
| Confirmed facts | Label as confirmed and show the source or confirmation path. |
| Inferences | Mark as inferred, show confidence, and avoid definitive language. |
| Confidence | Show by domain when possible: identity, operations, guest, training, commercial. |
| Open questions | Present as the next useful discovery path, not as missing form fields. |
| Contradictions | Frame as drift, tension, or unresolved identity questions. Do not hide them. |
| Venue DNA candidates | Show as candidates with evidence and a confirmation path. |
| Confirmed Venue DNA | Show only when evidence or owner/admin confirmation supports it. |
| Specialist impacts | Show how current Venue DNA informs Omer, Zohar, Academy, or Owner Intelligence, including status such as ready or insufficient signal. |

## Venue DNA Change Rules

- High-impact Venue DNA changes require owner/admin confirmation.
- Never present inferred identity as confirmed identity.
- Do not turn a beautiful summary into Venue DNA unless evidence supports it.
- Do not infer founder intent, brand promise, guest promise, price position,
  atmosphere, or non-negotiables from weak signals.
- If the model is thin, show insufficient signal and ask a better question.

## Anti-Patterns To Block

- Generic chatbot UI with no memory, evidence, or confidence surface.
- Generic dashboard or KPI wall.
- Form wizard, setup checklist, or profile-completion meter.
- Brand questionnaire or marketing-positioning worksheet.
- Mystical personality test language.
- "AI knows everything" summaries.
- Fake operational observations or invented venue signals.
- Confirmed-looking cards for unconfirmed candidates.
- New personas for venue learning.
- Event Manager controls inside the Venue Intelligence conversation.
- Decorative luxury that hides uncertainty or weak evidence.

## Relationship To Event Manager

Venue Intelligence defines venue identity, founder intent, values, standards,
atmosphere, guest promise, service philosophy, long-term memory, confidence, and
open questions.

Event Manager controls leads, event details, manual event briefs, event
execution, Zohar recommendations, department handoffs, and post-event event
memory.

They connect through Venue Memory and Venue DNA, but they are not the same
interface. Venue Intelligence may provide context to Event Manager. It must not
become the event calendar, event CRM, Zohar command center, or event execution
surface.

## Verification Checklist

Before finishing Venue Intelligence UI work, check:

- The UI does not behave like a generic chatbot, dashboard, or form wizard.
- Confirmed facts, inferences, candidates, and unknowns are visually distinct.
- Confidence is visible where interpretation appears.
- Open questions and contradictions are preserved.
- Owner/admin confirmation is required for high-impact Venue DNA changes.
- Specialist impacts do not invent readiness for Omer, Zohar, Academy, or Owner
  Intelligence.
- Venue boundaries and role access are respected.
- No fake venue signals, operational observations, guest behavior, staff
  weakness, pricing facts, supplier facts, or event urgency were introduced.
- Mobile layout remains usable for owner/admin review.
- Any implementation was verified with the smallest relevant build, browser, or
  visual check.

## Final Response Protocol

When reporting work, state:

- Which Venue Intelligence UI rule was applied.
- Which file was created or changed.
- Whether confirmed DNA, candidates, open questions, or specialist impacts were
  affected.
- What verification was performed or why it was not run.

Keep the answer direct. Do not describe the Venue Intelligence UI as a chatbot,
dashboard, form, questionnaire, or personality test.
