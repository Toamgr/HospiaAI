---
name: hestia-beverage-intelligence-ui
description: >
  UI rules for HESTIA Beverage Intelligence, Cocktail Intelligence, Omer,
  Cocktail Lab, bar costing, menu generation, event beverage handoffs,
  supplier/pricing confidence, beverage operations, and bar manager/F&B director
  workflows. Enforces costing honesty, source clarity, venue context, and
  practical bar execution without fake costs, margins, suppliers, trends, or
  operational truth.
---

# HESTIA Beverage Intelligence UI

Omer and Beverage Intelligence help the venue make better beverage decisions.
They do not invent costs, margins, trends, suppliers, demand, or operational
truth.

Costing honesty is more important than looking confident.

Benchmarks are orientation, not verified venue truth.

Omer may interpret beverage context, but venue data and manager confirmation
control operational truth.

Kosher logic is conditional, not global.

## When To Use This Skill

Use this skill for UI work involving:

- Cocktail Intelligence, Cocktail Lab, Omer context, menu generation, or menu
  engineering.
- Bar costing, bottle prices, recipe/product decisions, verified price entry,
  supplier/pricing confidence, and bar operations.
- Event cocktail menus and beverage handoffs.
- Bar manager, F&B director, owner, or manager beverage workflows.

Use after `hestia-skills-orchestrator`,
`hestia-product-design-judgment`,
`hestia-hospitality-intelligence`, and
`hestia-venue-memory-provenance`. Use `hestia-ui-design` after cost/source
truth is clear.

## When Not To Use This Skill

Do not use this skill for:

- Event Manager control surfaces outside beverage handoffs.
- General operational pulse unless beverage exceptions affect operations.
- Academy lesson UI except beverage training context.
- Generic cocktail apps or decorative menu mockups.
- Secret, credential, API key, token, `.env`, or private config inspection.

## Repo Sources

Prefer current beverage sources when relevant:

- `src/features/cocktail-intelligence/`
- `src/features/bar/`
- `src/domain/hospitality/bar/`
- `src/domain/hospitality/bar/cocktailLabPricingAdapter.js`
- `src/features/bar/CocktailLabStudio.jsx`
- `src/features/bar/CocktailBuildExperience.jsx`
- `src/features/bar/VerifiedPriceEntryPanel.jsx`

Do not read or expose secrets.

## Beverage Intelligence UI Principles

- No fake costs, margins, bottle prices, supplier facts, demand trends, sales
  claims, event beverage pressure, or recipe facts.
- No benchmark-as-verified pricing.
- Cost confidence and source status must be visible wherever pricing appears.
- Venue-specific constraints, event boundaries, staff readiness, prep burden,
  and operational complexity must be visible when they affect the decision.
- Do not use luxury copy to hide uncertainty.

## Omer Rules

- Omer interprets beverage context; Omer does not create operational truth.
- Omer outputs should be editable, rejectable, source-aware, and venue-scoped.
- Omer should not act as a generic cocktail chatbot.
- Omer may suggest questions when evidence is missing.

## Cocktail Lab Rules

- Preserve costing honesty from Cocktail Lab.
- Do not suppress confidence level or cost status.
- Show verified, manager-entered, benchmark, assumption, unknown, and candidate
  states clearly.
- Do not infer method, glassware, technique, or build steps as fact when missing.
- Build guides must use available recipe data only.

## Cocktail Intelligence Rules

- Menu recommendations must show fit, source, confidence, staff readiness, prep
  burden, and operational complexity.
- Rejection memory and approval history should remain visible where relevant.
- Treat one sales datapoint as a signal, not a demand trend.
- Do not recommend over-sophisticated drinks for beginner staff without training
  or staffing context.

## Event Beverage Handoff Rules

- Event beverage handoffs preserve Event Manager control.
- Event cocktail menus must stay connected to event context, guest count, service
  style, timing, client needs, constraints, and venue standards.
- Beverage handoffs are drafts or recommendations until accepted.

## Costing And Pricing Rules

Pricing status must distinguish:

- Verified venue price.
- Manager-entered price.
- Supplier candidate.
- Benchmark.
- Unknown.
- Assumption.

Never display a benchmark, supplier candidate, or assumption as verified venue
truth.

## Menu Generation Rules

A cocktail/menu recommendation must separate fact, interpretation, confidence,
action, cost/pricing status, venue/event boundary, operational complexity, staff
readiness, and memory impact.

## Bar Operations Rules

- Show ingredient availability, prep burden, batching, service timing, equipment
  needs, training need, and approval state when relevant.
- Kosher constraints apply only when the venue, event, or menu is marked kosher.
- Surface beverage exceptions to Operational Intelligence only when they affect
  operations, owner attention, or cross-department action.

## Display Rules

| Item | UI rule |
| --- | --- |
| Cocktail recipes | Show known data and missing fields; do not invent facts. |
| Costs | Show source, confidence, and status. |
| Margins | Show only when cost and price inputs support them. |
| Bottle prices | Distinguish verified, manager-entered, benchmark, candidate, unknown. |
| Supplier status | Candidate is not active supplier truth. |
| Confidence | Pair confidence with source. |
| Ingredient availability | Show known stock/source or unknown state. |
| Menu fit | Explain venue/event fit and evidence. |
| Operational complexity | Show prep, build, batching, equipment, service load. |
| Staff readiness | Link to role/training evidence, not assumptions. |
| Kosher constraints | Apply only when marked. |
| Event beverage needs | Tie to Event Manager context and handoff status. |
| Rejection/approval memory | Preserve source and decision history. |

## Role Visibility Rules

| Role | Show | Guardrail |
| --- | --- | --- |
| owner | Beverage strategy, cost risk, margin risk, menu direction, sourced exceptions. | No fake financial certainty. |
| admin | Broad diagnostic access with venue boundary. | Do not bypass provenance. |
| bar_manager | Cocktail build, pricing inputs, prep, stock, staff readiness, approvals. | Keep unknowns visible. |
| fb_director | Cross-F&B fit, menu engineering, event/beverage coordination. | Do not hide operational complexity. |
| manager | Service-impacting beverage risks and actions. | Avoid deep costing noise unless needed. |
| events_manager | Event beverage needs, handoff drafts, approvals, constraints. | Event Manager controls event decisions. |
| employee | Approved recipes, build guides, service notes. | No margin, supplier, or strategic pricing data unless role-approved. |

## Relationship To Other Systems

| System | Relationship |
| --- | --- |
| Venue Intelligence | Supplies venue beverage identity and constraints only when sourced. |
| Operational Intelligence | Receives beverage exceptions that affect service or owner attention. |
| Event Manager | Controls event beverage decisions and handoffs. |
| Academy | Owns training where staff readiness gaps appear. |
| Shift Brain | May surface bar prep/service risks; beverage analysis remains beverage-owned. |

## Anti-Patterns To Block

- Beautiful but fake margin cards.
- Verified-looking prices without source.
- Recipe claims without known data.
- AI menu generation that ignores staff skill or prep burden.
- Event cocktail menus disconnected from event context.
- Replacing F&B/bar manager approval with AI approval.
- Treating one sales datapoint as a demand trend.
- Hiding operational complexity.
- Generic cocktail app UI.
- Over-sophisticated drinks for beginner staff.
- Assuming kosher constraints globally.
- Supplier hallucinations.
- Using luxury copy to hide uncertainty.

## Verification Checklist

- Cost/source/confidence labels are present where pricing appears.
- No benchmark is presented as verified.
- Staff readiness and operational complexity are considered.
- Event beverage handoffs preserve Event Manager control.
- Omer does not create unsourced venue truth.
- Kosher constraints are applied only when marked.
- Role visibility is appropriate.
- No fake costs, supplier facts, margins, or trends were introduced.
- Build/browser checks are required if UI changes are implemented later.

## Final Response Protocol

State which beverage rule was applied, which files changed, whether cost,
source, event handoff, staff readiness, or role visibility was affected, and
what verification was run or skipped.
