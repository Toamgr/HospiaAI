# HESTIA Phase 9C — Deterministic Venue DNA Completeness Model Spec

> Track note: this "Phase 9C" belongs to the **Owner Experience track** (Owner AI Home 9A–9G), distinct from the numbered phases of the [HESTIA AI Master Execution Plan](../plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md). It does not renumber or supersede the Master Plan.
>
> Parents (canonical, must be honored): [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), [Conversational Intelligence Doctrine](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md), [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [Specialist Intelligence Pattern](./SPECIALIST_INTELLIGENCE_PATTERN.md).
> Direct parent: [Owner AI Home & Venue DNA Build Mode — Phase 9A Spec](./OWNER_AI_HOME_AND_VENUE_DNA_BUILD_MODE_PHASE_9A_SPEC.md). Sibling: [Owner AI Home — Phase 9B Static Shell](./OWNER_AI_HOME_PHASE_9B_STATIC_SHELL.md).
> Design authority: [skills/user/hestia-ui-design/SKILL.md](../../skills/user/hestia-ui-design/SKILL.md).
> Created: 2026-06-19. Author track: Owner Experience. Subphase: 9C-1 (docs-only).

---

## Status

`SPECIFICATION ONLY — NO IMPLEMENTATION`

No app code, `server.js`, `src/`, routes, prompts, components, pages, services, tests, `package.json`, `.env`, database files, or Venue DNA logic were changed in producing this document. `mergeVenueDna` and `emptyVenueDna` are untouched. This spec defines the intended deterministic completeness model and a phased path; it does not assert that any of it has been built. The only artifact created in Phase 9C-1 is this document.

---

## Executive Decision

HESTIA will use a **deterministic Venue DNA completeness model** to compute foundation readiness.

The model is computed by code from stored Venue DNA state (signal arrays, confidence dimensions, open questions) plus — in later phases — owner confirmation state. It answers, per dimension: *answered, partial, missing, needs_confirmation, confirmed, unclear, contradicted* — and rolls those up into a single deterministic **foundation readiness** verdict.

The LLM may help **collect and phrase** owner answers and **describe** progress in prose. The LLM must **never** declare:

- that Venue DNA is complete,
- that Full Intelligence Mode is unlocked,
- a confidence/completeness **percentage**,
- that owner identity is **confirmed**,
- that venue identity is **finalized**.

These are computed deterministically, server-side, or they do not exist.

---

## Why This Exists

The Owner AI Home (Phase 9B static shell) is visually on direction but lacks a real foundation model. Today it *approximates* "missing" as `confidence === 0` — a heuristic, not a status model. The owner needs **meaningful, honest, read-only progress**: what HESTIA already understands, what is partial, what is missing, and what needs the owner's confirmation.

Before real **Build Mode** (9E) or **Full Intelligence Mode** can be enabled, the system must be able to compute — in code, not vibes — what is answered, what is partial, what is missing, and what is confirmation-pending. Per the [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), HESTIA is Venue Operating Intelligence, not a BI dashboard; per the [Conversational Intelligence Doctrine](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md), conversation creates **candidates, not automatic truth**. The completeness model operationalizes both: it is the deterministic substrate that lets the owner experience progress without HESTIA ever faking certainty.

Venue DNA completeness is **not a vibe — it is a structured readiness model.** HESTIA may ask questions conversationally, but the decision that the DNA foundation is ready must be computed by code.

The model must distinguish:

- "HESTIA heard something" (raw turn),
- "HESTIA extracted a signal" (a captured array item),
- "HESTIA has enough evidence" (`answered`),
- "the owner confirmed it" (`confirmed`),
- "this dimension is still missing" (`missing`),
- "this dimension is partial" (`partial`),
- "this dimension is contradicted or unclear" (`contradicted` / `unclear`).

---

## Current Venue DNA Shape

Grounded in direct inspection of [venueDnaModel.js](../../src/features/venue-intelligence/venueDnaModel.js) and the `emptyVenueDna()` / `mergeVenueDna()` / `/api/venue-intelligence` block in `server.js` at HEAD `d77aec0`.

The stored `venue_dna_json` object (per venue, one row in `venue_intelligence`) contains:

- **11 signal arrays** (each deduped and capped at ≤8 items by `mergeVenueDna`)
- **5 confidence dimensions** (integers 0–100, monotonic, with deterministic floors)
- **stage** (`story | identity | operations | discovery`)
- **summary** (single LLM-authored string)
- **openQuestions** (LLM-authored array, capped ≤8)
- plus session-level `objective` (string) stored alongside on the row

### Signal groups (11 arrays)

| Array key | Display label |
|---|---|
| `hospitalityStyle` | Hospitality style |
| `businessTypeSignals` | Business type |
| `guestExperienceSignals` | Guest experience |
| `beverageSignals` | Beverage |
| `foodSignals` | Food |
| `serviceSignals` | Service |
| `trainingSignals` | Training & people |
| `operationalPainPoints` | Pressure points |
| `ownerPriorities` | Owner priorities |
| `emotionalDrivers` | Emotional drivers |
| `growthOpportunities` | Opportunities |

### Confidence dimensions (5)

- `identity`
- `operations`
- `guest`
- `training`
- `commercial`

Confidence is monotonic (`mergeVenueDna` keeps the higher of prior vs incoming, never regressing on a thin turn) and has **deterministic floors**: a populated signal array (or a pain/priority that clearly names a dimension) floors that dimension to 40, so genuine signal never reads as zero understanding. The floor never lowers a higher LLM score and never asserts certainty.

### What the current shape does NOT support

The current shape is a flat signal+confidence model. It does **not** support:

- **per-dimension owner confirmation** — DNA hardens automatically on every message turn; there is no checkpoint and no confirmation record;
- **per-dimension evidence / provenance** — signals are bare strings; the [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) §4 envelope (provenance, evidence label, source ref) is unmet here;
- **contradiction state** — no conflict store; contradictions cannot be held as uncertainty as the doctrine requires;
- **explicit answered / partial / missing statuses** — only `confidence > 0` exists, which is a coarse heuristic, not a status;
- **clean `non_negotiables` storage** — no dedicated field; non-negotiables leak into `ownerPriorities`;
- **clean `what_venue_is_not` storage** — no dedicated field at all;
- **a dedicated `owner_intent` field** — blended across `emotionalDrivers` + `ownerPriorities`;
- **a dedicated `hospitality_promise` field** — no field;
- **a dedicated `event_identity` field** — no field;
- **a dedicated `brand_language` field** — no field.

**Critical consequence:** the 9A 16-dimension discovery model does **not** map 1:1 onto the 11 arrays + 5 confidence dimensions. Several foundation-critical dimensions have no clean home. The 9C evaluator must therefore **compute honestly from existing fields and report unsupported dimensions as `missing`/`partial`** — never pretend they are known, and never silently extend `mergeVenueDna` to create the missing storage.

---

## Required Venue DNA Dimensions

The canonical dimension model layered (read-only) over the existing free-form signals. Per the [Conversational Intelligence Doctrine](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md) §2, one owner sentence may satisfy several dimensions at once. An unanswered dimension stays `missing` and drives the next question — it is never invented.

`required_for_foundation` values: **true** (a foundation blocker), **false** (never blocks), **conditional** (matters but does not block the minimum foundation).

`tracked_today`: **yes** (clean mapped storage), **partial** (inferable from blended arrays only), **no** (no storage — must be reported `missing`/`partial` until a future, separately-gated field extension).

---

### 1. `venue_identity` — Venue identity (type + positioning)

- **required_for_foundation:** true
- **maps_to_existing_dna_fields:** `businessTypeSignals`, `hospitalityStyle`, `confidence.identity`
- **tracked_today:** yes
- **owner_confirmation_required:** true
- **evidence_required:** true
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** venue type + positioning evident, `confidence.identity` at/above the answered floor
- **what_counts_as_partial:** a type hint present but positioning vague, or confidence below the answered floor
- **what_counts_as_missing:** no business-type/style signal and `confidence.identity === 0`
- **what_counts_as_unclear_or_contradicted:** conflicting type/positioning claims across turns
- **example_owner_question:** "How would you describe the place to someone who's never been?"
- **what_must_not_be_inferred:** a category from a single ambiguous word

### 2. `owner_intent` — Founder / owner intent

- **required_for_foundation:** true
- **maps_to_existing_dna_fields:** `emotionalDrivers`, `ownerPriorities` (blended — no dedicated field)
- **tracked_today:** partial
- **owner_confirmation_required:** true
- **evidence_required:** true
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** a stated motivation/vision clearly present in emotional drivers or priorities
- **what_counts_as_partial:** priorities present but no founding motivation/vision expressed
- **what_counts_as_missing:** neither motivation nor vision expressed
- **what_counts_as_unclear_or_contradicted:** stated intent conflicts with stated priorities
- **example_owner_question:** "What made you open it?"
- **what_must_not_be_inferred:** motives not expressed
- **STORAGE GAP:** partial today. Owner intent is not a dedicated field; it is inferred from blended arrays. Report honestly; do not fabricate a dedicated reading.

### 3. `target_guests` — Target guests

- **required_for_foundation:** true
- **maps_to_existing_dna_fields:** `guestExperienceSignals`, `confidence.guest`
- **tracked_today:** yes
- **owner_confirmation_required:** true
- **evidence_required:** true
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** guest type + occasion + expectation present, `confidence.guest` at/above floor
- **what_counts_as_partial:** a guest label only, no occasion/expectation
- **what_counts_as_missing:** no guest signal and `confidence.guest === 0`
- **what_counts_as_unclear_or_contradicted:** conflicting guest profiles across turns
- **example_owner_question:** "Who's the guest you build the night around?"
- **what_must_not_be_inferred:** demographics not stated

### 4. `service_philosophy` — Service philosophy

- **required_for_foundation:** true
- **maps_to_existing_dna_fields:** `serviceSignals`
- **tracked_today:** yes
- **owner_confirmation_required:** true
- **evidence_required:** true
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** a stated service stance
- **what_counts_as_partial:** a service mention without a stance
- **what_counts_as_missing:** no service signal
- **what_counts_as_unclear_or_contradicted:** conflicting service stances
- **example_owner_question:** "What does great service feel like here?"
- **what_must_not_be_inferred:** standards not described

### 5. `emotional_atmosphere` — Emotional atmosphere

- **required_for_foundation:** conditional
- **maps_to_existing_dna_fields:** `emotionalDrivers`
- **tracked_today:** yes
- **owner_confirmation_required:** false (optional)
- **evidence_required:** false
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** an emotional register named
- **what_counts_as_partial:** mood implied but not named
- **what_counts_as_missing:** no emotional signal
- **what_counts_as_unclear_or_contradicted:** conflicting registers
- **example_owner_question:** "What should people feel when they walk in?"
- **what_must_not_be_inferred:** mood from decor guesses

### 6. `hospitality_promise` — Hospitality promise

- **required_for_foundation:** conditional
- **maps_to_existing_dna_fields:** — (no field)
- **tracked_today:** no
- **owner_confirmation_required:** false (recommended)
- **evidence_required:** true
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** a stated promise (only when a dedicated field exists later)
- **what_counts_as_partial:** a promise-like statement folded into another array
- **what_counts_as_missing:** default today — no storage
- **what_counts_as_unclear_or_contradicted:** conflicting promises
- **example_owner_question:** "What do you never want a guest to leave without?"
- **what_must_not_be_inferred:** a promise not made
- **STORAGE GAP:** no clean storage today. Report `missing`/`partial` honestly.

### 7. `non_negotiables` — Non-negotiables

- **required_for_foundation:** true
- **maps_to_existing_dna_fields:** — (no field; leaks into `ownerPriorities`)
- **tracked_today:** no
- **owner_confirmation_required:** true
- **evidence_required:** true
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** explicit non-negotiable(s) (only when a dedicated field exists later)
- **what_counts_as_partial:** a priority that reads like a non-negotiable but is not labeled as one
- **what_counts_as_missing:** default today — no storage
- **what_counts_as_unclear_or_contradicted:** a non-negotiable contradicted by another stated value
- **example_owner_question:** "What would you never compromise on?"
- **what_must_not_be_inferred:** rules not stated
- **STORAGE GAP:** not cleanly tracked today. Foundation-critical but unstored — must be reported `missing`/`partial`, and this is a primary driver for a future, separately-gated field extension (not in 9C).

### 8. `what_venue_is_not` — What the venue is not

- **required_for_foundation:** true
- **maps_to_existing_dna_fields:** — (no field)
- **tracked_today:** no
- **owner_confirmation_required:** true
- **evidence_required:** true
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** an explicit boundary (only when a dedicated field exists later)
- **what_counts_as_partial:** a boundary implied within another array
- **what_counts_as_missing:** default today — no storage
- **what_counts_as_unclear_or_contradicted:** a boundary that contradicts a stated identity
- **example_owner_question:** "What are you definitely *not* trying to be?"
- **what_must_not_be_inferred:** opposites by assumption
- **STORAGE GAP:** not cleanly tracked today. Foundation-critical but unstored — report `missing`/`partial`.

### 9. `beverage_identity` — Menu / beverage identity

- **required_for_foundation:** conditional
- **maps_to_existing_dna_fields:** `beverageSignals`
- **tracked_today:** yes
- **owner_confirmation_required:** false (optional)
- **evidence_required:** false
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** a stated beverage direction
- **what_counts_as_partial:** a beverage mention without direction
- **what_counts_as_missing:** no beverage signal
- **what_counts_as_unclear_or_contradicted:** conflicting beverage directions
- **example_owner_question:** "What's the drink direction?"
- **what_must_not_be_inferred:** a program not described

### 10. `food_identity` — Food identity

- **required_for_foundation:** conditional
- **maps_to_existing_dna_fields:** `foodSignals`
- **tracked_today:** yes
- **owner_confirmation_required:** false (optional)
- **evidence_required:** false
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** a stated food direction
- **what_counts_as_partial:** a food mention without direction
- **what_counts_as_missing:** no food signal
- **what_counts_as_unclear_or_contradicted:** conflicting cuisine directions
- **example_owner_question:** "What's the food about?"
- **what_must_not_be_inferred:** cuisine not stated

### 11. `operational_constraints` — Operational constraints

- **required_for_foundation:** conditional
- **maps_to_existing_dna_fields:** `operationalPainPoints`, `confidence.operations`
- **tracked_today:** yes
- **owner_confirmation_required:** false
- **evidence_required:** false
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** a named constraint/pain, `confidence.operations` at/above floor
- **what_counts_as_partial:** a vague pressure named without specifics
- **what_counts_as_missing:** no constraint signal
- **what_counts_as_unclear_or_contradicted:** conflicting accounts of the same constraint
- **example_owner_question:** "Where does the operation feel heavy?"
- **what_must_not_be_inferred:** problems not described

### 12. `team_service_style` — Team / service style

- **required_for_foundation:** conditional
- **maps_to_existing_dna_fields:** `trainingSignals`, `serviceSignals`, `confidence.training`
- **tracked_today:** yes
- **owner_confirmation_required:** false
- **evidence_required:** false
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** a staffing/capability signal, `confidence.training` at/above floor
- **what_counts_as_partial:** a team mention without capability detail
- **what_counts_as_missing:** no team/training signal
- **what_counts_as_unclear_or_contradicted:** conflicting team capability accounts
- **example_owner_question:** "Tell me about the team."
- **what_must_not_be_inferred:** performance judgments (no staff surveillance)

### 13. `event_identity` — Event identity (if relevant)

- **required_for_foundation:** conditional
- **maps_to_existing_dna_fields:** — (no field)
- **tracked_today:** no
- **owner_confirmation_required:** false (optional)
- **evidence_required:** false
- **should_appear_in_owner_home:** conditional (only when relevant)
- **what_counts_as_answered:** event relevance stated (only when a dedicated field exists later)
- **what_counts_as_partial:** an event mention without relevance
- **what_counts_as_missing:** default today — no storage
- **what_counts_as_unclear_or_contradicted:** conflicting accounts of event importance
- **example_owner_question:** "Do events matter to the business?"
- **what_must_not_be_inferred:** an events program that wasn't described
- **STORAGE GAP:** not cleanly tracked today. Conditional, so it does not block foundation readiness.

### 14. `brand_language` — Brand language

- **required_for_foundation:** conditional
- **maps_to_existing_dna_fields:** — (no field)
- **tracked_today:** no
- **owner_confirmation_required:** false (optional)
- **evidence_required:** false
- **should_appear_in_owner_home:** false
- **what_counts_as_answered:** tone/voice cues captured (only when a dedicated field exists later)
- **what_counts_as_partial:** voice implied but not characterized
- **what_counts_as_missing:** default today — no storage
- **what_counts_as_unclear_or_contradicted:** conflicting voice cues
- **example_owner_question:** "How do you talk about the place?"
- **what_must_not_be_inferred:** a voice not demonstrated
- **STORAGE GAP:** not cleanly tracked today. Conditional, does not block readiness.

### 15. `growth_opportunities` — Growth opportunities

- **required_for_foundation:** false
- **maps_to_existing_dna_fields:** `growthOpportunities`, `confidence.commercial`
- **tracked_today:** yes
- **owner_confirmation_required:** false
- **evidence_required:** false
- **should_appear_in_owner_home:** true
- **what_counts_as_answered:** a stated opportunity
- **what_counts_as_partial:** a commercial hint without a stated opportunity
- **what_counts_as_missing:** no opportunity signal
- **what_counts_as_unclear_or_contradicted:** conflicting opportunity claims
- **example_owner_question:** "Where's the unrealised upside?"
- **what_must_not_be_inferred:** opportunities by assumption

### 16. `risk_drift` — Risk / drift indicators

- **required_for_foundation:** false (research-only mechanism)
- **maps_to_existing_dna_fields:** — (derived)
- **tracked_today:** no
- **owner_confirmation_required:** surfaced, not auto-applied
- **evidence_required:** true
- **should_appear_in_owner_home:** false (until evidence-backed)
- **what_counts_as_answered:** a corroborated contradiction held as uncertainty (only when a conflict store exists)
- **what_counts_as_partial:** a single weak drift hint
- **what_counts_as_missing:** default today — no storage
- **what_counts_as_unclear_or_contradicted:** this dimension *is* the contradiction surface
- **example_owner_question:** derived, not asked
- **what_must_not_be_inferred:** drift from thin evidence
- **NOTE:** the *principle* (surface drift, make change conscious) is doctrine; *automated detection as a mechanism* stays research-only. Does not block readiness.

---

### Storage-gap summary

| Dimension | tracked_today | required_for_foundation | Consequence |
|---|---|---|---|
| `venue_identity` | yes | true | trackable |
| `owner_intent` | **partial** | true | report honestly from blended arrays |
| `target_guests` | yes | true | trackable |
| `service_philosophy` | yes | true | trackable |
| `non_negotiables` | **no** | true | report `missing`/`partial`; future field extension candidate |
| `what_venue_is_not` | **no** | true | report `missing`/`partial`; future field extension candidate |
| `hospitality_promise` | **no** | conditional | report `missing`/`partial` |
| `event_identity` | **no** | conditional | report `missing`/`partial`; does not block readiness |
| `brand_language` | **no** | conditional | report `missing`/`partial`; does not block readiness |
| `risk_drift` | **no** | false | research-only; does not block readiness |

The headline reality: of the six foundation-critical dimensions, **`owner_intent` is only partial and `non_negotiables` / `what_venue_is_not` have no clean storage at all.** 9C must report these honestly rather than pretend they are known. Giving them dedicated, confirmation-gated storage is a deliberate, separately-gated extension — **never folded silently into `mergeVenueDna` in 9C.**

---

## Per-Dimension Status Model

Seven deterministic statuses. **The LLM must not assign these — the evaluator computes them** from stored state via pure functions over `(signal presence, signal count, confidence value, confirmation record, contradiction record)`.

### `missing`

- **meaning:** no usable signal for the dimension.
- **deterministic conditions:** no mapped signal present **and** mapped confidence (where applicable) `=== 0`. For unstored dimensions (`non_negotiables`, etc.), this is the default until storage exists.
- **UI label:** "Areas HESTIA will explore" (never a harsh "missing").
- **contributes to readiness:** no.
- **blocks Full Mode:** yes, if `required_for_foundation === true`.
- **triggers follow-up question:** yes.

### `partial`

- **meaning:** some signal present, but below the answered threshold.
- **deterministic conditions:** some mapped signal present **but** below answered floor (e.g. confidence in 1–44, or only one signal in a multi-signal dimension).
- **UI label:** "Forming".
- **contributes to readiness:** partially (counts toward `early_learning`/`building`, never toward `foundation_ready`).
- **blocks Full Mode:** yes, if required and below the partial floor.
- **triggers follow-up question:** yes.

### `answered`

- **meaning:** enough evidence to consider the dimension understood.
- **deterministic conditions:** mapped signal present **and** mapped confidence at/above the answered floor (anchored to 9A confidence calibration, e.g. ≥55 for required dimensions). Final numeric floors fixed in 9C-2 with tests.
- **UI label:** "Understood".
- **contributes to readiness:** yes — **unless** `owner_confirmation_required === true`, in which case it advances only to `needs_confirmation`.
- **blocks Full Mode:** no, unless confirmation is required and pending.
- **triggers follow-up question:** no.

### `needs_confirmation`

- **meaning:** answered, but the owner must confirm before it hardens.
- **deterministic conditions:** status would be `answered` **and** `owner_confirmation_required === true` **and** no confirmation record exists.
- **UI label:** "Awaiting your confirmation".
- **contributes to readiness:** counts as answered for progress, but **not** as confirmed.
- **blocks Full Mode:** yes, for required + confirmation dimensions.
- **triggers follow-up question:** yes — but as an inline confirm/refine card, not a re-asked question.

### `confirmed`

- **meaning:** answered and explicitly confirmed by the owner (9D).
- **deterministic conditions:** status would be `answered` **and** a valid owner confirmation record exists for the current value.
- **UI label:** "Confirmed".
- **contributes to readiness:** yes (fully).
- **blocks Full Mode:** no.
- **triggers follow-up question:** no.

### `unclear`

- **meaning:** signal present but ambiguous.
- **deterministic conditions:** detectable only via an explicit ambiguity flag. **No ambiguity store exists today** — in a first cut, `unclear` is conservatively folded into `partial` until a flag store exists.
- **UI label:** "Needs clarifying".
- **contributes to readiness:** partially.
- **blocks Full Mode:** yes, if required.
- **triggers follow-up question:** yes.

### `contradicted`

- **meaning:** a recorded conflict between signals/turns for the dimension, held as uncertainty (Conversational Doctrine §4, Guardrails §7).
- **deterministic conditions:** a contradiction record exists for the dimension. **No conflict store exists today** — `contradicted` is spec'd now and implemented only when a conflict store exists.
- **UI label:** "Conflicting — let's reconcile".
- **contributes to readiness:** no.
- **blocks Full Mode:** yes, if required.
- **triggers follow-up question:** yes.

> **First-cut scope:** 9C-2 implements `missing / partial / answered / needs_confirmation` from existing fields. `confirmed` lands with 9D (confirmation records). `unclear` and `contradicted` are spec'd here but implemented only when their stores exist; until then they collapse honestly into `partial` / are simply absent. No status may be set by LLM text.

---

## Foundation Readiness Model

A deterministic, server-computed object (never LLM-declared). Future shape:

```js
foundationReadiness = {
  foundation_status,              // enum below — deterministic
  foundation_score,              // 0–100 deterministic COVERAGE, not truth, not an LLM %
  required_dimensions,           // the foundation-critical dimension set
  required_dimensions_answered,  // status ∈ {answered, needs_confirmation, confirmed}
  required_dimensions_confirmed, // status === confirmed
  missing_required_dimensions,   // status ∈ {missing, partial}
  open_critical_questions,       // openQuestions tied to required dimensions
  blockers,                      // human-readable deterministic reasons readiness is not met
  contradicted_dimensions,       // populated only when a conflict store exists
  recommended_next_question,     // chosen deterministically from the highest-priority missing required dim
  unlock_readiness               // MUST stay false until 9D + Full Mode architecture exist
}
```

### Foundation statuses

| Status | Deterministic condition |
|---|---|
| `not_started` | No signals anywhere; all required dimensions `missing`. |
| `early_learning` | Some signals present, but fewer than half of required dimensions at `partial`+. |
| `building` | Most required dimensions `answered`/`partial`, but confirmations outstanding. |
| `needs_owner_confirmation` | All required dimensions `answered`, but ≥1 confirmation-required dimension is `needs_confirmation`. |
| `foundation_ready` | All required dimensions `confirmed` (or `answered` where confirmation is not required), no `contradicted` required dimension, `open_critical_questions` below cap. |
| `full_mode_ready_later` | `foundation_ready` **AND** the Full Intelligence Mode (9E) architecture exists and is tested. |

### Clarifications

- **`foundation_score` is deterministic coverage, not truth.** It expresses how much of the required model is answered/confirmed — never a certainty or quality percentage, and never an LLM-authored number.
- **`unlock_readiness` must remain `false`** until owner confirmation checkpoints (9D) and Full Intelligence Mode architecture (9E) exist and are tested.
- **`foundation_ready` does NOT automatically enable Full Intelligence Mode.** It is a computed verdict about the DNA foundation, not a feature switch. The transition to Full Mode is a separate, gated decision.

---

## Hard Readiness Invariants

These are non-negotiable and must be enforced by tests:

- No single weak signal can produce readiness.
- `partial` never counts as `answered`.
- Missing **`venue_identity`** blocks readiness.
- Missing **`owner_intent`** blocks readiness.
- Missing **`target_guests`** blocks readiness.
- Missing **`service_philosophy`** blocks readiness.
- Missing **`non_negotiables`** blocks readiness.
- Missing **`what_venue_is_not`** blocks readiness.
- A `contradicted` required dimension blocks readiness (once a conflict store exists).
- `open_critical_questions` above cap block readiness.
- LLM-authored `summary` text cannot set readiness.
- LLM-authored `openQuestions` cannot unlock Full Mode.
- **Full Mode cannot be unlocked in 9C** under any condition.

---

## Confirmation Checkpoints

9C computes *that* a dimension `needs_confirmation`; it does **not** implement the confirmation action. The "Did I get this right?" interaction is **Phase 9D**.

- **9C may compute `needs_confirmation`.**
- **9C does not implement confirmation actions.**
- **9D will implement confirmation checkpoints** (the inline confirm/refine card and the stored confirmation record).

Dimensions requiring confirmation before they harden (per 9A):

- `venue_identity`
- `owner_intent`
- `target_guests`
- `service_philosophy`
- `non_negotiables`
- `what_venue_is_not`
- major positioning claims

Minor operational notes (e.g. "Saturdays are busy") do **not** require a checkpoint.

**Confirmations must NOT be stored inside `venue_dna_json`.** Reasons:

- confirmation is **governance state**, not raw venue understanding;
- it needs **provenance** (who confirmed, when, against which value) per Guardrails §4;
- **`mergeVenueDna` may drop unknown keys** — it rebuilds from `{ ...emptyVenueDna(), ...prior }` and only handles known array/confidence/summary keys, so an unknown `confirmations` key would be lost on the next merge round-trip (**data-loss risk**);
- raw DNA should not be blurred with confirmation state.

**Recommendation for 9D:** a dedicated confirmation table (e.g. `venue_dna_confirmations`: `venue_id`, `dimension_key`, `confirmed_by`, `confirmed_at`, `confirmed_value` / value hash, `status`), `venue_id`-scoped, audit-friendly, with no collision against `mergeVenueDna`. **9C does not build it.** The 9C evaluator reads confirmation state through a thin accessor that returns "no confirmations" until 9D exists, so the evaluator is correct and stable on its own.

---

## Storage Strategy

- The 9C evaluator **reads existing DNA only**.
- The 9C evaluator **does not mutate DNA**.
- The 9C evaluator **does not extend `mergeVenueDna`**.
- The 9C evaluator **does not store computed readiness** — **readiness is derived, not persisted** (recomputed on read).
- Unsupported dimensions are **reported as `missing`/`partial` honestly**, never faked.

Explicitly rejected:

- storing computed readiness in `venue_dna_json`;
- letting the LLM write readiness;
- silently adding new DNA fields;
- silently adding confirmation fields.

---

## Backend Architecture Recommendation (future 9C-2)

A **pure, read-only backend evaluator service** (e.g. `src/server/venueDnaCompleteness.js` or a sibling server module; final location decided in 9C-2). It should:

- accept a `venueDNA` object;
- accept optional confirmation state later (stubbed to "none" until 9D);
- return the `foundationReadiness` object;
- perform **no writes**;
- call **no AI**;
- **ignore any LLM-authored status-like fields** in its input;
- **not import OpenAI / Gemini / `fetch`**;
- **not call `mergeVenueDna`**;
- be **heavily unit-tested** (pure function → trivially testable).

This conforms to the [Specialist Intelligence Pattern](./SPECIALIST_INTELLIGENCE_PATTERN.md): a reader over the shared brain, never a second writer.

---

## API Recommendation (future 9C-3)

Add a **new read-only endpoint**:

```
GET /api/venue-intelligence/completeness
```

`requireAuth('owner')` + `req.venueId`-scoped. Rationale:

- the existing `GET /api/venue-intelligence` response remains **byte-identical** (zero regression risk for `VenueIntelligence` and any other consumer);
- lower regression risk;
- a clean seam for future Full Mode gating;
- easier to test in isolation;
- read-only and venue-scoped.

Adding `completeness` to the existing GET response is **acceptable only if the team deliberately chooses that route later** — it is additive and low-risk, but it mutates a shared response shape that `VenueIntelligence` also reads.

---

## OwnerAIHome Display Recommendation (future 9C-4)

OwnerAIHome should consume the read-only completeness model and show:

- a **calm foundation status** (from `foundation_status`);
- **no dramatic progress bar**;
- **no fake percentage** (if a number is shown, it is the deterministic `foundation_score`, labeled as coverage);
- **3–5 strongest "What HESTIA knows so far"** (answered/confirmed dimensions);
- **"What HESTIA will explore next"** (from `missing_required_dimensions` + `open_critical_questions`);
- **confirmation-needed items shown gently** (a quiet chip; inert in 9C — the action is 9D);
- the **detail panel collapsed by default**;
- the **input still inert until 9E**;
- **OperationalPulse still the default landing** (the move is 9F).

### 9B-1R visual polish (fold into 9C-4)

1. Collapse the DNA panels behind "What HESTIA knows so far".
2. Verify/load Cormorant Garamond and Inter (Palette B fonts) — confirm the stack actually resolves, not a fallback.
3. Slightly strengthen / enlarge the orb.
4. Warm the guardrail/footer copy.
5. Replace the fragile negative-margin canvas bleed if needed.
6. Soften "missing" language into "Areas HESTIA will explore".

These are UI-only and gated to 9C-4 — not part of the evaluator.

---

## Implementation Sequence

| Phase | Scope | Files likely to change | Risk | Tests | Commit message |
|---|---|---|---|---|---|
| **9C-1** | This docs-only spec | `docs/architecture/VENUE_DNA_COMPLETENESS_MODEL_PHASE_9C_SPEC.md` | Very low | none (docs) | `docs: specify deterministic Venue DNA completeness model` |
| **9C-2** | Pure read-only evaluator service + unit tests; confirmation accessor stubbed | new evaluator module + test file | Medium (logic, threshold calibration) | tests 1–18 below | `feat: add read-only Venue DNA completeness evaluator (Phase 9C)` |
| **9C-3** | Read-only `GET /api/venue-intelligence/completeness` (additive) | `server.js` (one new route) | Low–medium | tests 19–20 | `feat: expose read-only Venue DNA completeness endpoint (Phase 9C)` |
| **9C-4** | OwnerAIHome consumes endpoint + 9B-1R visual polish | `OwnerAIHome.jsx` (+ small display util) | Low (read-only UI) | manual + existing | `feat: surface Venue DNA completeness in Owner AI Home (Phase 9C)` |
| **9D** | Owner confirmation checkpoints (`venue_dna_confirmations` table + confirm action; wire `confirmed`) | `server.js`, `OwnerAIHome.jsx`, new table | Higher | new | (separate phase) |
| **9E** | Real Build Mode conversation from OwnerAIHome | `OwnerAIHome.jsx`, hook, route reuse | High | new | (separate phase) |
| **9F** | Default landing switch — only after the page has real substance | `roleConfig`, `navigationConfig`, `routes.js` | Medium | new | (separate phase) |

Each subphase ships only after `npm run build` and `npm run hestia:check` pass. The 9A invariant holds: **no Build→Full unlock or DNA-flow change ships before the deterministic threshold and confirmation checkpoints exist and are tested.**

---

## Test Requirements for 9C-2 / 9C-3

Pure unit tests on the evaluator (no DB, no AI), plus a thin integration test on the route:

1. Empty DNA → `not_started`.
2. Thin signal → `early_learning`.
3. A `partial` dimension does not count as `answered`.
4. Required core dimensions answered → `building` or `needs_confirmation`.
5. Required answered but unconfirmed → `needs_owner_confirmation`.
6. Confirmed required dimensions → `foundation_ready` (once 9D exists; mocked confirmation accessor until then).
7. Missing `venue_identity` blocks readiness.
8. Missing `owner_intent` blocks readiness.
9. Missing `target_guests` blocks readiness.
10. Missing `service_philosophy` blocks readiness.
11. Missing `non_negotiables` blocks readiness.
12. Missing `what_venue_is_not` blocks readiness.
13. Optional dimensions do not block readiness.
14. Contradicted required dimension blocks readiness (once a conflict store exists; injected flag until then).
15. LLM text cannot mark completion (evaluator ignores status-like input fields).
16. No writes occur (evaluator is pure; DB untouched).
17. No AI calls occur (no `fetch`/OpenAI/Gemini in the evaluator).
18. `mergeVenueDna` untouched (behavior/parity check).
19. Existing `GET /api/venue-intelligence` remains compatible (response shape unchanged).
20. OwnerAIHome can consume the model read-only (no POST introduced).
21. `npm run build` passes.
22. `npm run hestia:check` passes.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| **Fake completion** (LLM claims done) | Status, score, and `unlock_readiness` computed only by the pure evaluator; evaluator ignores LLM status-like fields; tests 15, 22. |
| **Storage gaps** (`non_negotiables`, `what_venue_is_not`, `owner_intent`) | Report honestly as `missing`/`partial`; never silently extend `mergeVenueDna`; field extension separately gated. |
| **Threshold too lax → fake readiness** | Floors fixed in 9C-2 with tests; `partial` never counts as `answered`; required-dim gating; no single signal yields readiness. |
| **Response-shape regression** | New dedicated endpoint (9C-3) keeps existing GET byte-identical; test 19. |
| **Premature Full Mode unlock** | `unlock_readiness` hard-locked to `false` until 9D + 9E exist and are tested. |
| **Storing governance inside DNA** | Confirmations in a separate table (9D); readiness never persisted. |
| **`mergeVenueDna` dropping unknown keys** | Never store readiness/confirmations in `venue_dna_json`; evaluator and confirmation state live outside it. |
| **Contradiction state not yet available** | `contradicted`/`unclear` spec'd now, implemented only when their stores exist; collapse to `partial` honestly until then. |
| **Visual progress becoming gamified** | No dramatic progress bar, no fake percentage; calm status + honest coverage only (UI skill). |

---

## Files Likely to Change Later

Listed for planning only; **not modified in 9C-1**:

- a future evaluator module (e.g. `src/server/venueDnaCompleteness.js` — location decided in 9C-2)
- a future evaluator unit-test file
- `server.js` — one additive read-only route (9C-3)
- [src/features/owner-intelligence/OwnerAIHome.jsx](../../src/features/owner-intelligence/OwnerAIHome.jsx) (9C-4)
- possibly a shared dimension-mapping constant (prefer a new file over touching DNA shape)
- possibly follow-up docs
- a future `venue_dna_confirmations` table — **only in 9D**

---

## Files That Must Remain Untouched Now

- `server.js`
- all of `src/`
- `mergeVenueDna`
- `emptyVenueDna`
- `OwnerAIHome.jsx`
- `OperationalPulse.jsx`
- prompts / LLM system instructions
- database files
- `package.json`
- `.env`
- routes, services, tests, components, pages

---

## Final Decision

Phase 9C-1 creates **architecture authority only**. No implementation is performed. The deterministic completeness model must be implemented **read-only** in later phases (9C-2 evaluator → 9C-3 endpoint → 9C-4 OwnerAIHome consumption) **before** OwnerAIHome becomes the default landing or real Build Mode is activated. `mergeVenueDna` remains the only sanctioned Venue DNA writer; readiness is computed and never persisted; the LLM never declares completion, readiness, unlock, or confirmed identity.
