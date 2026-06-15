---
name: hestia-skills-orchestrator
description: >
  Operating gate for HESTIA work. Use before any HESTIA product, UI, UX,
  architecture, implementation, prototype, intelligence, role/access, skills,
  or verification task. Chooses the required HESTIA skill sequence and prevents
  generic redesign, disconnected modules, chatbot-first UX, fake intelligence,
  direct prototype productionization, and decorative luxury.
---

# HESTIA Skills Orchestrator

HESTIA is under-connected, not under-built.

This skill decides which HESTIA skills and tools should be used before work
begins. It is a gate, not a design system and not a product strategy document.

## Invocation And Tools

Invoke automatically for HESTIA product, UI, architecture, implementation, and
QA tasks. Use only the tools needed for the task: file read/search, requested
patches, safe build/test commands, and browser or Playwright-style verification.

## When To Use This Skill

Use this skill before any HESTIA task involving:

- Product, UX, UI, copy, routes, modules, features, or architecture.
- Owner Intelligence, Owner Entry, Owner Threshold, operational intelligence.
- Event Manager, Zohar, event calendar, event detail, or department handoffs.
- Beverage, Cocktail Intelligence, Cocktail Lab, CI, Omer, or bar product work.
- Academy, training, Wine Atlas, Service School, or curriculum experience.
- Venue Intelligence, Venue DNA, Venue Memory, operational memory, or reports.
- Guest-facing flows, RSVP, hospitality journeys, or guest portals.
- Presentations, investor decks, design prototypes, 3D, cinematic UI, or QA.
- Any request that mentions redesign, luxury, dashboard, chatbot, prototype, AI,
  skill pipeline, or visual direction inside HESTIA.

## When Not To Use This Skill

Do not use this skill for:

- Non-HESTIA projects.
- Pure terminal/status questions that do not affect HESTIA decisions.
- Secret, credential, token, API key, `.env`, or private config inspection.
- Generic web design work outside this repository.
- Tasks where the user explicitly asks only to read one file and answer a
  narrow factual question.

If a user asks for read-only work, do not edit files. If a user asks to create
or edit a skill, docs, or code, stay inside the requested scope.

## Lightweight Mode

For small factual or status tasks, do not run the full routing protocol. Read
only the directly relevant file or run the requested safe status command, answer
briefly, and do not invoke design, prototype, image, 3D, or presentation tools.

## Source Order

Before strategic, product, UI, architecture, or implementation work, read only
the sources needed for the task, starting with:

1. `memory/project_hestia_master_memory.md`
2. `docs/architecture/HESTIA_PROJECT_INTELLIGENCE_AUDIT.md`
3. `docs/design/HESTIA_SKILLS_PIPELINE_RESEARCH.md`
4. The selected domain skill files from `skills/user/`

Never read, print, summarize, or expose secrets, `.env` values, tokens,
credentials, API keys, or private config values.

## Orchestration Protocol

1. Classify the task type.
2. Read the minimum required source files.
3. Check whether an existing HESTIA system should be connected before anything
   new is built.
4. Apply `hestia-product-design-judgment` before visual or implementation work.
5. Apply the domain skill before `hestia-ui-design`.
6. Apply `hestia-ui-design` before external Taste Skills or visual references.
7. If intelligence is shown, require provenance, confidence, role access, and
   venue boundaries.
8. If a prototype is involved, keep it prototype-only unless the user explicitly
   asks for a production plan or implementation.
9. If implementation happens, keep changes inside existing architecture:
   hooks own state, features own UI, services own intelligence logic, and
   `App.jsx` remains orchestration only.
10. Verify after implementation with the smallest useful build, test, browser,
    role, mobile, accessibility, and source/provenance checks.

## Routing Table

| Task type | Required skill sequence |
| --- | --- |
| Owner / Operational Intelligence | `hestia-product-design-judgment` -> `hestia-operational-intelligence-ui` -> `hestia-venue-memory-provenance` -> `hestia-ui-design` -> verification. |
| Owner Threshold / Entry | `hestia-product-design-judgment` -> manual `hestia-owner-threshold` -> `hestia-venue-memory-provenance` -> `hestia-ui-design` -> verification. Keep `prototypes/owner-threshold.html` prototype-only. |
| Event Manager / Zohar | `hestia-product-design-judgment` -> `hestia-hospitality-intelligence` -> `hestia-event-manager-ui` -> `hestia-venue-memory-provenance` -> `hestia-ui-design` -> verification. |
| Beverage / Cocktail Intelligence / Omer | `hestia-product-design-judgment` -> `hestia-hospitality-intelligence` -> `hestia-beverage-intelligence-ui` -> `hestia-venue-memory-provenance` -> `hestia-ui-design` -> verification. |
| Academy / Training | `hestia-product-design-judgment` -> `hestia-hospitality-intelligence` -> `hestia-academy-design-curriculum` -> `hestia-academy-experience` -> `hestia-ui-design` -> verification. |
| Venue Intelligence / Venue DNA / Memory | `hestia-product-design-judgment` -> `hestia-hospitality-intelligence` -> `hestia-venue-memory-provenance` -> `hestia-venue-intelligence-ui` -> `hestia-ui-design` -> verification. |
| Guest-facing hospitality flows | `hestia-product-design-judgment` -> `hestia-hospitality-intelligence` -> `hestia-ui-design` -> optional manual `hestia-story-carousel` -> verification. |
| Presentations / investor decks | `hestia-product-design-judgment` -> relevant domain skill -> manual presentation/document skill. Verify claims against project state. |
| 3D / cinematic surfaces | `hestia-product-design-judgment` -> `hestia-ui-design` -> manual `hestia-3d-experience` only if the 3D layer has operational purpose. Verify performance and reduced motion. |
| QA / visual testing | Relevant product/domain/UI skills -> browser or Playwright-style verification -> build/test checks -> report residual risk. |

## Blocks

Block or challenge any path that starts with:

- Generic SaaS dashboards.
- KPI walls or decorative metrics.
- Fake operational intelligence.
- Invented venue signals, fake staff scores, fake costs, or fake urgency.
- Direct production use of prototypes.
- Unnecessary new personas.
- Generic chatbot UX.
- Decorative luxury that does not help a real workflow.
- Visual redesign before product and domain review.
- New modules when existing HESTIA systems should be connected.
- Image generation, 3D, presentation tools, external Taste Skills, or artifact
  builders by default.

If the user explicitly requests one of these paths, state the risk briefly and
use the safest constrained version.

## Manual-Only Tools And Skills

These may be used only when explicitly requested or when the orchestrated plan
requires them for a bounded non-production purpose:

- `.agents/skills/high-end-visual-design/SKILL.md`
- `.agents/skills/imagegen-frontend-web/SKILL.md`
- Image generation tools.
- Canva tools.
- Presentation/PPTX tools.
- 3D, cinematic, or Three.js workflows.
- Generic `frontend-design` or `web-artifacts-builder` style skills.
- MCP/API builder skills.
- Any new external Taste Skill.

HESTIA production UI must pass through HESTIA product, domain, and UI skills
before any external visual inspiration is used.

## Verification Checklist

After implementation, verify the parts that changed:

- Build or test command run when relevant.
- Browser or Playwright-style check for changed UI.
- Desktop and mobile layout check for major UI changes.
- Role and permission exposure check.
- Venue boundary check for multi-venue or memory work.
- Provenance and confidence labels for intelligence claims.
- No fake/demo data presented as operational truth.
- No invented costs, supplier facts, guest facts, or venue signals.
- Accessibility and reduced-motion check for motion-heavy surfaces.
- No secrets, `.env`, tokens, credentials, or private config exposed.

If verification is skipped or blocked, say exactly why.

## Final Response Protocol

Keep final responses short and operational:

- State what changed or what was decided.
- Name the files touched.
- Name the skill route used when relevant.
- State verification performed or why it was not run.
- State important assumptions or residual risks.

Do not end with generic enthusiasm. Do not describe HESTIA as a dashboard,
chatbot, booking site, academy-only product, cocktail app, or generic SaaS.
