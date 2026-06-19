# HESTIA Phase 9A — Owner AI Home & Venue DNA Build Mode Architecture Spec

> Track note: this "Phase 9A" belongs to the **Owner Experience track**, which is distinct from the numbered phases of the [HESTIA AI Master Execution Plan](../plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md) (whose Phase 9 concerns repeating the specialist pattern for Service/Academy/Event). To avoid collision, refer to this track as **Owner AI Home 9A–9G**. It does not renumber or supersede the Master Plan.
>
> Parents (canonical, must be honored): [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), [Conversational Intelligence Doctrine](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md), [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [Specialist Intelligence Pattern](./SPECIALIST_INTELLIGENCE_PATTERN.md), [Doctrine Index](./README_HESTIA_AI_DOCTRINE_INDEX.md).
> Design authority: [skills/user/hestia-ui-design/SKILL.md](../../skills/user/hestia-ui-design/SKILL.md).
> Created: 2026-06-19. Author track: Owner Experience.

---

## Status

`SPECIFICATION ONLY — NO IMPLEMENTATION`

No app code, `server.js`, `src/`, routes, prompts, components, pages, services, tests, database, or Venue DNA logic were changed in producing this document. This spec defines intended architecture and a phased path; it does not assert that any of it has been built.

---

## Executive Decision

The Owner landing experience should evolve into an **AI-first Owner Home** with two modes:

1. **Venue DNA Build Mode** — a focused conversation dedicated only to building, clarifying, structuring, and confirming Venue DNA.
2. **Full Intelligence Mode** — unlocked later, only after a **deterministic Venue DNA foundation threshold** is met, giving the owner a command interface to navigate, summarize, inspect, explain, and retrieve outputs across HESTIA.

`OperationalPulse` remains valuable and is **not deleted**. It is no longer treated as the long-term owner landing experience; it becomes a destination reachable from the AI Home or side navigation.

This is the architectural authority for the Owner AI Home and Venue DNA Build Mode. **No implementation is performed in this phase.**

---

## Product Rationale

HESTIA must not start the owner relationship with a dashboard. A dashboard answers "what are my numbers?" before HESTIA has earned the right to have an opinion about the venue. Per the [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), HESTIA is a *Venue Operating Intelligence system*, not a BI dashboard and not a generic chatbot — and conversation is an *intelligence-gathering interface*, not UI furniture.

The governing feeling for the owner:

> HESTIA understands my venue, asks the right questions, remembers what I say, and then helps me operate the venue.

The first-time owner journey must be: *enters → HESTIA starts Venue DNA discovery → asks focused questions → extracts structured DNA → avoids repeating itself → shows progress → owner confirms → Full Intelligence Mode unlocks later.*

The mature owner journey must be: *enters → HESTIA already knows the Venue DNA → owner asks anything → HESTIA routes, summarizes, explains, navigates.*

This sequencing is also the safest path: it lets HESTIA accumulate real, owner-confirmed understanding before it offers operational opinions, which directly serves the no-fabrication discipline.

---

## Current State Findings

Grounded in direct inspection of the code at HEAD `6d63bf7`.

- **Owner currently lands on `OperationalPulse`.** Resolution: `firstAllowedArea(owner)` → `command` group → `firstAllowedPage` → `operationalPulse` ([roleConfig.js](../../src/config/roleConfig.js), [navigationConfig.js](../../src/config/navigationConfig.js)). Route `/owner` → `operationalPulse` ([routes.js](../../src/config/routes.js)).
- **`OperationalPulse` is dashboard-like.** Stat-tile grid, multiple stacked Cards (Owner Brief, Today's Business Risk, Decisions Needed, What Changed Since Last Week, Trust/Source Explanation, Shift Review Archive, AI Operational Insight). Its **Trust-badge governance** (verified / manager_reported / deterministic / ai_suggestion / not_enough_data / estimated / demo_data) is excellent and worth preserving as a model for honest sourcing ([OperationalPulse.jsx](../../src/features/owner/OperationalPulse.jsx)).
- **A strong conversational DNA learning surface already exists.** [VenueIntelligence.jsx](../../src/features/venue-intelligence/VenueIntelligence.jsx) provides full chat (message bubbles, typing indicator, sigil, optimistic send + error rollback), an editorial empty state with opening prompts, a four-stage indicator (`story → identity → operations → discovery`), and a **"What HESTIA is learning"** Understanding panel: confidence dots per dimension, detected-signal chips, open questions, "where to take this next" focus suggestions. Backed by [useVenueIntelligenceState.js](../../src/hooks/useVenueIntelligenceState.js) (owner/admin gated) and [venueDnaModel.js](../../src/features/venue-intelligence/venueDnaModel.js).
- **VenueIntelligence is currently secondary, not home.** It lives under the `venueIntelligence` nav group (page key `venueLearning`), not as the owner default. **Routing gap:** `venueLearning` and `venueBridgeInspector` have `PAGE_META` entries but **no `PAGE_ROUTES` entry** in [routes.js](../../src/config/routes.js), so they currently resolve to `/`. Any later work must add proper routes.
- **The Venue DNA backend exists and is disciplined.** Table `venue_intelligence` (`stage`, `objective`, `messages_json`, `venue_dna_json`); endpoints `GET /api/venue-intelligence`, `POST /api/venue-intelligence/message`, `POST /api/venue-intelligence/reset` (all `requireAuth('owner')`, venue-scoped via `req.venueId`).
- **`/api/venue-intelligence/message` is the only DNA-writing conversation path.** It calls OpenAI `gpt-4o-mini` (JSON mode), then merges through `mergeVenueDna`.
- **`mergeVenueDna` is the single sanctioned DNA writer.** It enforces monotonic confidence, deterministic confidence floors, dedup/cap (≤8 per array), and no fabrication. The candidate system (`venue_intelligence_candidates`) is explicitly **signal-only** and never mutates DNA.
- **There is no explicit two-mode model.** No Build Mode / Full Mode concept exists anywhere in code.
- **There is no deterministic completion model.** Confidence per dimension exists, but nothing computes "Venue DNA foundation is sufficiently complete."
- **There is no required-dimensions model.** The conversation is open-ended (four stages); it does not track a canonical set of dimensions that must be answered.
- **There is no owner confirmation checkpoint for major DNA identity claims.** DNA is written automatically on every message turn; the owner is never asked "Did I get this right?" before identity claims harden.
- **The current app theme is dark/gold; the new reference is light/minimal.** [App.jsx](../../src/App.jsx) hardcodes `const t = TEXT.en` and renders `bg-[#0d0c09]` (dark). **Important:** the light/minimal direction is **not a net-new theme** — the [UI design skill](../../skills/user/hestia-ui-design/SKILL.md) already defines **Palette B — Editorial Light** (`#F7F3EC` ivory ground, `#6B2737` burgundy, Cormorant Garamond / Inter). The AI Home should be built on Palette B, with a deliberate decision recorded (the skill currently associates editorial palette with editorial worlds; applying it to an owner intelligence surface is an intentional choice for 9B to ratify).
- **Hebrew/i18n exists but is not fully activated.** `text.en.js` and `text.he.js` exist and `lang`/`setLang` flow to the shell, but `App.jsx` hardcodes `TEXT.en`. RTL is not wired. Hebrew is a latent capability today.

---

## Owner AI Home Vision

The Owner AI Home is a calm, intelligence-first entry point:

- calm white / light premium canvas (UI skill **Palette B — Editorial Light**)
- a centered intelligence presence (evolve the existing `◈` sigil into a calm orb)
- one primary conversational input
- subtle navigation, available but quiet
- no dashboard clutter, no KPI wall, no fake metrics, no generic admin dashboard
- not a chatbot app, not a BI dashboard — an intelligence-first entry point

The visual reference (calm "Intelligence On Demand" surface) is used **conceptually, not as a literal copy.** All implementation must run through the [UI design skill](../../skills/user/hestia-ui-design/SKILL.md) and use concrete reference screenshots as benchmarks.

---

## Mode A — Venue DNA Build Mode

**Purpose:** a focused owner discovery conversation that builds Venue DNA. This mode honors the [Conversational Intelligence Doctrine](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md) — conversation is uncertainty reduction, not form completion.

**Allowed:**
- ask one focused question at a time
- extract multiple structured dimensions from a single answer (multi-dimension extraction)
- identify and surface missing dimensions
- show progress toward the DNA foundation
- summarize what has been learned
- ask clarifying questions
- avoid repetition (reason from what is already known)
- ask the owner to confirm **major identity claims** before they harden

**Forbidden:**
- generic AI chat
- tactical F&B / event / staff recommendations before the DNA foundation is built
- fake conclusions or fabricated confidence
- **silent hardening of major identity claims** into confirmed DNA
- repeating scripted questions already answered
- outputs unrelated to Venue DNA
- a navigation-first experience before the foundation exists

**Built today (reusable):** the message endpoint, `mergeVenueDna`, the four-stage model, the Understanding panel. **Missing (future phases):** the required-dimension model, a deterministic progress/completeness signal, and an owner-confirmation checkpoint.

---

## Mode B — Full Intelligence Mode

**Purpose:** a mature owner command interface, available only after the DNA foundation is sufficiently complete. This mode follows the [Specialist Intelligence Pattern](./SPECIALIST_INTELLIGENCE_PATTERN.md): it **consumes** the shared understanding and routes to specialists; it never becomes a competing engine.

**Allowed:**
- answer questions about HESTIA areas
- navigate to product surfaces
- summarize the read-only **F&B Director Brief** (`GET /api/ci/fnb-director-brief`)
- show the **Menu Intelligence Snapshot** (`GET /api/ci/menu-intelligence`)
- surface **candidate review** (`GET /api/venue-intelligence/candidates`)
- summarize operations (`GET /api/venue-bridge/operations`, `/owner-intelligence`, `/context`)
- route to events, academy, staff, F&B, owner intelligence
- explain missing data honestly
- suggest safe next actions

**Forbidden:**
- bypassing role permissions
- silent Venue DNA writes
- candidate-to-DNA promotion
- fake KPIs
- fake guest / POS / inventory / margin data
- destructive actions without confirmation

**Built today (reusable read substrate):** `venue_briefs`, the unified context endpoint, the F&B Director Brief, the Menu Intelligence Snapshot, the candidate review routes, and the existing CI director chat pattern (`POST /api/ci/director/chat`). **Missing (future phases):** the owner-facing orchestration/routing layer (intent → safe read/navigation).

---

## Deterministic Build → Full Mode Threshold

The transition from Build Mode to Full Intelligence Mode must be **computed deterministically, server-side, and never declared by the LLM** (the model may *describe* progress in prose, but it may never assert "DNA is complete" or flip the mode).

Suggested model (defined as architecture requirements, **not** as final hardcoded thresholds):

- **required dimensions answered** — the required subset of the Venue DNA Discovery model below is present
- **required confidence dimensions meet a floor** — e.g., identity / guest / operations confidence at or above a defined floor
- **major owner identity claims confirmed** — the owner-confirmation checkpoints below have been satisfied
- **open critical questions below an acceptable count**
- **source / evidence present for required dimensions**

Until the threshold is met, the owner remains in Build Mode (Full Mode is unavailable or visibly locked). Once met, Full Mode unlocks and Build Mode remains available as "Refine Venue DNA." Final numeric thresholds are to be fixed in the Build Mode MVP phase (9C) with tests, not asserted here.

---

## Venue DNA Discovery Dimensions

A minimum structured dimension model layered over the existing free-form signals in [venueDnaModel.js](../../src/features/venue-intelligence/venueDnaModel.js). Per the [Conversational Intelligence Doctrine](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md), one owner sentence may satisfy several dimensions at once. Every dimension carries **confidence** and **source/evidence**, and the model tracks **missing dimensions** explicitly. Nothing here authorizes fabrication: an unanswered dimension stays "missing" and drives the next question — it is never invented.

For each dimension: *why it matters · example question · what counts as answered · what must not be inferred · can it update later · owner confirmation required.*

1. **Venue identity** (type + positioning) — *Why:* everything downstream depends on what the venue is. *Example:* "How would you describe the place to someone who's never been?" *Answered:* venue type + positioning evident. *Must not infer:* a category from a single ambiguous word. *Updatable:* rarely (stable layer). *Confirm:* **yes.**
2. **Founder / owner intent** — *Why:* the stable Founder Intent Model anchors identity drift. *Example:* "What made you open it?" *Answered:* a stated motivation/vision. *Must not infer:* motives not expressed. *Updatable:* rarely. *Confirm:* **yes.**
3. **Target guests** — *Why:* drives service, F&B, pricing. *Example:* "Who's the guest you build the night around?" *Answered:* guest type + occasion + expectation. *Must not infer:* demographics not stated. *Updatable:* yes. *Confirm:* **yes.**
4. **Service philosophy** — *Why:* defines how hospitality is delivered. *Example:* "What does great service feel like here?" *Answered:* a stated service stance. *Must not infer:* standards not described. *Updatable:* yes. *Confirm:* **yes.**
5. **Emotional atmosphere** — *Why:* the felt register of the room. *Example:* "What should people feel when they walk in?" *Answered:* an emotional register named. *Must not infer:* mood from decor guesses. *Updatable:* yes. *Confirm:* optional.
6. **Hospitality promise** — *Why:* the consistent promise to guests. *Example:* "What do you never want a guest to leave without?" *Answered:* a stated promise. *Must not infer:* a promise not made. *Updatable:* yes. *Confirm:* recommended.
7. **Non-negotiables** — *Why:* hard constraints / founder beliefs. *Example:* "What would you never compromise on?" *Answered:* explicit non-negotiable(s). *Must not infer:* rules not stated. *Updatable:* rarely. *Confirm:* **yes.**
8. **What the venue is not** — *Why:* boundaries prevent drift and generic output. *Example:* "What are you definitely *not* trying to be?" *Answered:* explicit boundary. *Must not infer:* opposites by assumption. *Updatable:* yes. *Confirm:* **yes.**
9. **Menu / beverage identity** — *Why:* feeds the F&B specialist. *Example:* "What's the drink direction?" *Answered:* a stated beverage direction. *Must not infer:* a program not described. *Updatable:* yes. *Confirm:* optional.
10. **Food identity** — *Why:* feeds F&B/kitchen. *Example:* "What's the food about?" *Answered:* a stated food direction. *Must not infer:* cuisine not stated. *Updatable:* yes. *Confirm:* optional.
11. **Operational constraints** — *Why:* grounds realistic recommendations. *Example:* "Where does the operation feel heavy?" *Answered:* a named constraint/pain. *Must not infer:* problems not described. *Updatable:* yes. *Confirm:* no.
12. **Team / service style** — *Why:* capability and training signal. *Example:* "Tell me about the team." *Answered:* a staffing/capability signal. *Must not infer:* performance judgments. *Updatable:* yes. *Confirm:* no.
13. **Event identity (if relevant)** — *Why:* events are a distinct revenue/identity surface. *Example:* "Do events matter to the business?" *Answered:* event relevance stated. *Must not infer:* an events program that wasn't described. *Updatable:* yes. *Confirm:* optional.
14. **Brand language** — *Why:* voice consistency in outputs. *Example:* "How do you talk about the place?" *Answered:* tone/voice cues. *Must not infer:* a voice not demonstrated. *Updatable:* yes. *Confirm:* optional.
15. **Growth opportunities** — *Why:* owner-stated upside. *Example:* "Where's the unrealised upside?" *Answered:* a stated opportunity. *Must not infer:* opportunities by assumption. *Updatable:* yes. *Confirm:* no.
16. **Risk / drift indicators** — *Why:* surface divergence between stated identity and operation (principle is doctrine; automated detection stays research-only). *Example:* derived, not asked. *Answered:* a corroborated contradiction held as uncertainty. *Must not infer:* drift from thin evidence. *Updatable:* yes. *Confirm:* surfaced, not auto-applied.
17. **Confidence per dimension** — calibrated 0–100, monotonic, honest (already modeled).
18. **Source / evidence per dimension** — provenance + evidence label per the [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) §4 (a conceptual extension of today's per-dimension-only confidence).
19. **Missing dimensions** — the known unknowns; they drive the next question and are never fabricated.

---

## Owner Confirmation Checkpoints

HESTIA must ask **"Did I get this right?"** before a major identity claim hardens into confirmed Venue DNA. This operationalizes the cardinal rule of the [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md): high-impact DNA is never auto-confirmed.

Confirmation is **required** for:
- venue identity
- owner intent
- non-negotiables
- target guests
- service philosophy
- major positioning claims
- "what the venue is not"

Confirmation is **not** required for every minor operational note (e.g., "Saturdays are busy") — those may remain candidates/signals without a checkpoint. The confirmation interaction must be lightweight (an inline confirm/refine card), never a modal "Are you sure?" dialog (forbidden by the UI skill).

---

## Repetition Avoidance Model

Per the [Conversational Intelligence Doctrine](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md) §2, HESTIA must not re-ask what it already knows. The system must track, per dimension, a status drawn from the doctrine's epistemic scale:

- **answered** (confirmed/owner-stated)
- **partially answered**
- **unclear**
- **contradicted** (conflicting — held as uncertainty, surfaced not overwritten)
- **confirmed** (passed an owner checkpoint)
- **missing**

Requirements:
- HESTIA must not ask a question merely because a script planned it.
- A single owner sentence may satisfy multiple dimensions; all are updated at once.
- Known facts must be fed to the model as "already known — do not re-ask" context (a read-only extension of the existing grounding context), not as new tables in this phase.

---

## UX Architecture

Defined as intent; **not implemented here.** All visuals must pass the [UI design skill](../../skills/user/hestia-ui-design/SKILL.md).

- **Route:** new `/owner/home` (or repoint `/owner` to the AI Home in a later, gated phase). Also add the missing `venueLearning` / `venueBridgeInspector` routes to [routes.js](../../src/config/routes.js).
- **Page name:** Owner AI Home (working key `ownerHome`; natural home is the currently-empty `src/features/owner-intelligence/`).
- **Layout:** UI skill **Layout Pattern C-adjacent** (calm full-canvas), not the dashboard grid (Pattern A). Centered presence, single input, quiet nav.
- **Orb / intelligence presence:** evolve the `◈` sigil into a calm centered mark with subtle idle/listening/thinking states (motion within UI-skill limits — fade-up, no bounce/particles).
- **Input behavior:** one primary centered input; Enter to send, Shift+Enter newline; reuse VenueIntelligence's optimistic-send + error-rollback.
- **Build-mode prompt text:** e.g., "Let's build your Venue DNA. Tell me about the place — what made you open it?"
- **Full-mode prompt text:** e.g., "Ask me anything about your venue — F&B, events, operations, your team."
- **Progress display:** slim, deterministic DNA-foundation indicator (reuse confidence-dots concept); never an LLM-claimed percentage; never a dramatic "filling" progress bar (forbidden by UI skill).
- **"What HESTIA knows":** a collapsed/secondary panel reusing the existing Understanding panel.
- **"What is missing":** derived from the required-dimension model + `openQuestions`.
- **Confidence display:** reuse `ConfidenceDots` + the OperationalPulse trust-badge vocabulary for honest sourcing.
- **Approval cards:** inline "Did I get this right?" confirm/refine cards for the required checkpoints.
- **Module launcher after unlock:** quiet links/launcher (not a KPI wall) appearing only once Full Mode unlocks.
- **Empty / loading / error states:** reuse the editorial empty state, skeleton loading (no spinners), and inline error rollback already present in VenueIntelligence.
- **Hebrew / English & RTL:** treat as an explicit, separately-scoped item (see below); do not bolt RTL on accidentally.

---

## Relationship to OperationalPulse

- `OperationalPulse` **remains available** and is **not deleted**.
- The Owner AI Home becomes the **intended long-term owner landing**.
- `OperationalPulse` may become a **destination** opened by the AI ("show me the operational pulse") or via side navigation.
- Do **not** move the default landing immediately. The repositioning is its own safe, gated phase (9F) after the AI Home is real, so the existing owner flow is never broken mid-stream.

---

## Backend Architecture Implications

Future needs (not built in 9A):

- a **DNA completeness evaluator** — deterministic, server-side, the basis for the Build→Full threshold (never LLM-declared)
- a **required-dimensions model** — canonical dimension set + per-dimension status
- **owner confirmation state** — which major identity claims have been confirmed
- **source / evidence tracking per dimension** — extending today's per-dimension-only confidence toward the [guardrails §4](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) envelope
- a **safer confirmation flow** before major identity claims harden into confirmed DNA
- a possible **read-only Owner Home state endpoint** (mode, progress, what's known, what's missing) assembled from existing reads
- **no new DNA writer.** `mergeVenueDna` remains the **only** sanctioned writer to `venue_dna_json`; everything else proposes candidates or reads.

All new endpoints must be `requireAuth`-gated and `req.venueId`-scoped, with no cross-venue leakage.

---

## Frontend Architecture Implications

Future needs (not built in 9A):

- an `OwnerAIHome` component / feature area (natural home: `src/features/owner-intelligence/`)
- **reuse** VenueIntelligence chat primitives (bubbles, typing, sigil, send/rollback)
- **reuse** the Understanding panel concepts (confidence dots, signal chips, open questions)
- a new minimal/light visual shell on **Palette B** (UI skill)
- role-safe owner default routing later (gated), via `roleConfig` / `navigationConfig` / `routes`
- preserve the existing shell (`TopNav`/`SidePanel`) until the implementation phase
- **do not break non-owner navigation** — employees, managers, F&B, events, chef, bar all keep their current entry points

---

## Visual Direction

- minimal, calm, white/light, premium
- centered AI presence
- low clutter, subtle motion, editorial typography
- no dashboard wall, no fake KPIs

Concretely, this maps to UI-skill **Palette B — Editorial Light** (`#F7F3EC` ground, `#FFFFFF` cards, `#6B2737` burgundy primary, `#B8860B` amber, Cormorant Garamond display / Inter body / JetBrains Mono data) with motion held to 150–300ms fade-up. Any implementation must follow [skills/user/hestia-ui-design/SKILL.md](../../skills/user/hestia-ui-design/SKILL.md) and use concrete reference screenshots as design benchmarks. The decision to apply the editorial palette to an owner *intelligence* surface (the skill associates Palette A with operational screens) is a deliberate choice to be ratified in 9B.

---

## Hebrew / RTL Scope

- Hebrew is important to this product.
- Current i18n status must be audited before UI implementation: `text.en.js` / `text.he.js` exist, but `App.jsx` hardcodes `TEXT.en`, so the app is effectively English-only at runtime and RTL is unwired.
- RTL must be **explicit**, not accidental (direction, mirroring, input alignment, typography).
- The language toggle should be subtle.
- Do not mix Hebrew/English awkwardly in the primary owner flow.
- Treat i18n activation (un-hardcoding `t`, wiring RTL) as a distinct, separately-scoped item (9G, or earlier if it blocks owner UX).

---

## Implementation Options

| Option | Value | Complexity | Risk | Depends on | Touches DNA logic? | Now? |
|---|---|---|---|---|---|---|
| **A — Docs-only spec** (this doc) | High (de-risks all later work) | Low | Very low | nothing | No | **Yes** |
| **B — Static Owner AI Home shell** | Medium | Low–Med | Low | A | No | After A |
| **C — Build Mode MVP** (required-dimension model + deterministic progress, on existing endpoint) | High | Medium | Medium | A, B | **Yes — extend carefully; `mergeVenueDna` stays sole writer** | After B |
| **D — Full Intelligence Mode** (read-only command/navigation layer) | High | High | High (routing, permissions, intent mapping) | A–C | No (read-only) | After C |
| **E — Immediate OperationalPulse replacement** | Medium | Medium | High (breaks owner default; fake-completion temptation) | A–D | Indirect | **No — premature** |

Fake-intelligence risk is highest in C and D and must be controlled by deterministic thresholds and no LLM-claimed completeness. Option A carries no runtime risk. E must not precede a safe C/D.

---

## Recommended Phase Sequence

- **Phase 9A — this spec** (docs only). *Current.*
- **Phase 9B — Static Owner AI Home shell.** Visual shell + input on Palette B; reuse VenueIntelligence primitives; **no DNA logic change**; behind a flag; OperationalPulse remains the default landing.
- **Phase 9C — Build Mode MVP.** Required-dimension model + deterministic completeness/progress (server-side); repetition-avoidance context; still routed through `mergeVenueDna` only.
- **Phase 9D — Owner confirmation checkpoints.** "Did I get this right?" before major identity claims harden; no DNA mutation without confirmation.
- **Phase 9E — Full Intelligence Mode (read-only command/navigation layer).** Intent → safe reads/navigation over existing briefs/snapshots/candidates; role- and venue-scoped.
- **Phase 9F — OperationalPulse repositioning.** Gated change of the owner default landing to the AI Home; OperationalPulse becomes a destination.
- **Phase 9G — Hebrew/RTL refinement** (if not handled earlier).

This order may be adjusted if implementation findings warrant, but the invariant holds: **no Build→Full unlock or DNA-flow change ships before the deterministic threshold and confirmation checkpoints exist and are tested.**

---

## Guardrails

Hard prohibitions for this track:

- no fake DNA completion
- no LLM-declared completion (mode transition is deterministic, server-side)
- no silent major identity hardening (owner confirmation required)
- no candidate-to-DNA promotion in this track
- no bypassing role permissions
- no fake KPIs / guest / POS / inventory / margin data
- no destructive actions without confirmation
- no third owner AI engine (consume the shared brain; never build a parallel one)
- no raw JSON dashboard
- no dashboard-first landing
- `mergeVenueDna` remains the only sanctioned Venue DNA writer
- venue-scoped always; never cross-venue
- additive, flag-gated, reversible; flag-off must be byte-identical for existing flows

---

## Test Requirements for Future Implementation

To be authored in the phase that introduces each behavior:

- owner lands on AI Home when the feature flag is enabled
- OperationalPulse remains accessible
- Build Mode shows only DNA-focused prompts (no tactical F&B/event/staff output)
- Full Mode is unavailable until the deterministic threshold is met
- answered dimensions are not re-asked
- one owner sentence can satisfy multiple dimensions
- the owner confirmation card appears for major identity claims
- no Venue DNA mutation occurs without confirmation (and only via `mergeVenueDna`)
- no route/role leakage; non-owner navigation unaffected; venue-scoped
- empty / loading / error states render correctly
- Hebrew / RTL rendering is correct where activated
- `npm run build` passes
- `npm run hestia:check` passes

---

## Files Likely to Change Later

Listed for planning only; **not modified in 9A**:

- [src/App.jsx](../../src/App.jsx)
- [src/config/navigationConfig.js](../../src/config/navigationConfig.js)
- [src/config/roleConfig.js](../../src/config/roleConfig.js)
- [src/config/routes.js](../../src/config/routes.js) (add owner-home + missing venue-intelligence routes)
- [src/features/venue-intelligence/VenueIntelligence.jsx](../../src/features/venue-intelligence/VenueIntelligence.jsx)
- [src/hooks/useVenueIntelligenceState.js](../../src/hooks/useVenueIntelligenceState.js)
- [src/features/venue-intelligence/venueDnaModel.js](../../src/features/venue-intelligence/venueDnaModel.js)
- possible new `src/features/owner-intelligence/OwnerAIHome.jsx` and supporting owner-home components
- i18n activation: [src/i18n/](../../src/i18n/) + shell language/RTL wiring
- [server.js](../../server.js) — only in later backend phases (completeness evaluator, confirmation state, read-only owner-home state endpoint), never a new DNA writer

## Files That Must Remain Untouched Now

All application code remains untouched in Phase 9A. Specifically: `server.js`, all of `src/`, routes, prompts, components, pages, services, tests, `package.json`, `.env`, database files, Venue DNA logic, and `mergeVenueDna`. The only artifact created in 9A is this document.

---

## Final Decision

Phase 9A creates the architectural authority for the Owner AI Home and Venue DNA Build Mode. It establishes the two-mode model, the deterministic Build→Full threshold, the Venue DNA discovery dimension model, the owner-confirmation checkpoints, the repetition-avoidance model, the Palette-B visual direction, the Hebrew/RTL scope, and the phased sequence — all within the canonical doctrine and with `mergeVenueDna` preserved as the sole Venue DNA writer. **No implementation is performed in this phase.**
