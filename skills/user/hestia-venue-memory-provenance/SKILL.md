---
name: hestia-venue-memory-provenance
description: >
  Memory, provenance, confidence, venue-boundary, and intelligence-claim rules
  for HESTIA. Use when working on Venue Intelligence, Venue DNA, Venue Memory,
  Operational Memory, Owner Intelligence, Owner Threshold, Zohar, Omer, Academy,
  Beverage/Cocktail Intelligence, reports, recommendations, or any AI-generated
  claim about a venue, guest, team, event, pricing, supplier, or operational
  pattern. Enforces that HESTIA never presents invented, assumed, demo, or
  inferred content as operational truth.
---

# HESTIA Venue Memory Provenance

HESTIA must never present invented, assumed, demo, or inferred content as
operational truth.

Venue is the memory unit. User is the operator, not the memory unit.

## When To Use This Skill

Use this skill for any HESTIA work involving:

- Venue Intelligence, Venue DNA, Venue Memory, operational memory, or reports.
- Owner Intelligence, Owner Threshold, owner entry, or executive summaries.
- Zohar, Event Intelligence, event briefs, or department handoffs.
- Omer, Cocktail Intelligence, CI, Beverage, bar product, pricing, suppliers.
- Academy recommendations, training signals, staff development, or capability.
- Guest preferences, recovery history, VIP notes, accessibility, or privacy.
- Any AI-generated recommendation or interpretation based on venue data.

Pair this skill with `hestia-skills-orchestrator` and
`hestia-product-design-judgment`. Use `hestia-ui-design` only after the memory
and provenance model is honest.

## When Not To Use This Skill

Do not use this skill for:

- Generic visual styling with no intelligence, memory, or recommendation.
- Static copy that makes no claim about venue reality.
- Pure factual file/status questions.
- Secret, credential, API key, token, `.env`, or private config inspection.

For small factual/status tasks, answer from the directly relevant file and do
not run the full protocol.

## Repo Sources

Prefer these current sources when relevant:

- `memory/project_hestia_master_memory.md`
- `docs/architecture/HESTIA_PROJECT_INTELLIGENCE_AUDIT.md`
- `docs/design/HESTIA_SKILLS_PIPELINE_RESEARCH.md`
- `docs/research/researches for Venue Intelligence/HESTIA Intelligence Doctrine v1.md`
- `docs/research/researches for Venue Intelligence/THE VENUE INTELLIGENCE RESEARCH.md`
- `src/features/venue-intelligence/venueDnaModel.js`
- `src/features/venue-intelligence/VenueIntelligence.jsx`
- `src/features/venue-intelligence/VenueBridgeInspector.jsx`
- `src/services/venueBridge/venueBridgeService.js`
- `src/services/api/venueBridgeApi.js`
- `src/domain/hospitality/hospitalityMemoryMap.js`

Do not read, print, summarize, or expose secrets or private config values.

## Memory Categories

Use these labels when reasoning about memory:

| Category | Meaning |
| --- | --- |
| Raw input | Unprocessed user, event, shift, guest, POS/PMS, report, or system input. |
| Operational observation | A recorded thing that happened in service or operations. |
| Confirmed fact | Explicitly confirmed by user, source system, owner/admin, or repeated evidence. |
| Inference | Interpretation derived from evidence. Must carry confidence. |
| Recommendation | Suggested action derived from facts and interpretation. |
| Memory candidate | Possible memory not yet confirmed or sufficiently supported. |
| Venue DNA candidate | Possible identity or operating pattern that may become Venue DNA. |
| Confirmed Venue DNA | Evidence-backed venue identity, standard, pattern, or non-negotiable. |
| Contradiction / identity drift signal | Evidence that behavior conflicts with stated identity or prior DNA. |
| Unknown / insufficient evidence | Missing, weak, stale, or conflicting evidence. Say so. |

## Source And Provenance Rules

- Every intelligence claim needs a source, or it must be marked unknown,
  inferred, candidate, or insufficient signal.
- Separate source type from interpretation: user-stated, system-recorded,
  manager-confirmed, owner-confirmed, deterministic calculation, repeated
  pattern, or AI inference.
- Do not turn a single observation into a pattern.
- Do not turn a memory candidate into a fact.
- Do not hide missing evidence behind confident wording.
- Demo, fixture, prototype, or hardcoded content must stay labeled as demo or
  prototype content and must not drive operational recommendations.
- Recommendations must separate fact, interpretation, and action.

## Confidence Rules

- Use explicit confidence when reporting interpretation, pattern detection, or
  prediction.
- Low confidence: one signal, stale signal, weak source, or unclear context.
- Medium confidence: multiple aligned signals but not enough for durable memory.
- High confidence: confirmed by owner/admin/source system or repeated evidence
  across the relevant time/context.
- If evidence conflicts, mark contradiction or identity drift instead of forcing
  a clean summary.
- If evidence is missing, say unknown or insufficient evidence.

## Venue Boundary Rules

- Venue is the memory unit. Do not attach venue memory to a user account.
- Never mix Venue DNA, briefs, reports, guest records, staff notes, or memory
  candidates across venues.
- Multi-venue views must make venue context explicit.
- Specialist briefs must derive from the active venue's Venue DNA and source
  memory only.
- Do not use another venue's standards, costs, guests, staff, or patterns as
  evidence unless explicitly labeled as external benchmark or comparison.

## Role And Access Rules

- Owner/admin may see strategic Venue DNA, owner briefs, and sensitive patterns.
- Managers may see operational patterns needed for service, coaching, events,
  and recovery.
- Staff should see only role-relevant, action-ready information.
- Guest recovery, accessibility, VIP handling, allergies, and staff performance
  are sensitive and must be minimized.
- Staff weaknesses must never become permanent character judgments.
- Guest and team data must be role-safe, necessary, and no more detailed than
  the workflow requires.

## Venue DNA Rules

- Venue DNA is earned through evidence, not written as branding copy.
- Venue DNA can begin as a candidate, but confirmation requires sufficient
  evidence or owner/admin confirmation.
- High-impact Venue DNA changes require owner/admin review.
- Do not infer founder intent, non-negotiables, guest promise, price position,
  service standard, or identity drift without evidence.
- Contradictions are useful. Mark them as drift signals or open questions.
- If the Venue DNA is weak, ask better questions or mark insufficient signal.

## AI Recommendation Rules

Each AI-generated recommendation must include:

- Fact: what is known and from where.
- Interpretation: what HESTIA thinks it means.
- Confidence: how strong the evidence is.
- Action: what the role should do next.
- Boundary: which venue, role, event, shift, guest, team, or product it applies
  to.

Never invent guest behavior, staff weakness, event urgency, sales trend, pricing
fact, supplier fact, venue signal, or operational observation.

## Use Case Rules

| Use case | Rule |
| --- | --- |
| Owner Threshold / Owner Entry | Show real venue signals only. Do not use prototype observations, fake faculties, or invented urgency. |
| Owner Intelligence | Report trends from real data, mark unknowns, and separate strategic interpretation from facts. |
| Zohar / Event Intelligence | Event recommendations must cite event details, guest/client needs, venue memory, or explicit gaps. |
| Omer / Beverage | No fake costs, margins, supplier facts, recipe facts, or demand trends. Benchmarks are orientation only and must be labeled. |
| Academy / Training | Training recommendations need observed capability gaps, manager confirmation, or clear venue standards. Progress is not mastery unless assessed. |
| Beverage / Cocktail Intelligence | Confidence and source labels must stay visible for costing, product, recipe, event-menu, and supplier claims. |
| Venue Bridge | Specialist briefs must be deterministic, source-derived, role-scoped, and marked `insufficient_signal` when thin. |

## Verification Checklist

Before finishing memory or intelligence work, check:

- No secrets, `.env`, tokens, credentials, or private config exposed.
- Every claim has a source or is labeled unknown, inferred, candidate, or
  insufficient signal.
- Facts, interpretations, and actions are separated.
- Confidence is explicit for inferred claims.
- Memory candidates are not presented as confirmed memory.
- Venue DNA candidates are not presented as confirmed Venue DNA.
- High-impact Venue DNA changes require owner/admin confirmation.
- Venue boundaries are preserved.
- Role access is appropriate.
- Sensitive guest/team data is minimized.
- No fake operational observations, costs, suppliers, trends, urgency, or venue
  signals were introduced.
- Prototype/demo content is not treated as production truth.

## Final Response Protocol

In final responses, state:

- What memory/provenance rule was applied.
- Which file was created or changed.
- Whether assumptions or missing evidence remain.
- What verification was performed or why it was not run.

Keep the answer direct. Do not present speculation as certainty.
