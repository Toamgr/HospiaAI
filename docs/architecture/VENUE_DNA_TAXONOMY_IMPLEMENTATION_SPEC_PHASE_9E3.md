# Venue DNA Taxonomy Implementation Spec — Phase 9E-3

> Status: **SPECIFICATION ONLY — NO IMPLEMENTATION.** No app code, `server.js`, `src/`, routes, prompts, components, pages, services, tests, `package.json`, `.env`, or database files were changed in producing this document. `mergeVenueDna` and `emptyVenueDna` are untouched. This spec converts research into product logic and a phased build path; it does not assert any of it is built.
>
> Source research: [docs/research/venue-dna/2026-06-20_HESTIA_VENUE_DNA_TAXONOMY_AND_OWNER_DISCOVERY_COMPLETION_MODEL.md](../research/venue-dna/2026-06-20_HESTIA_VENUE_DNA_TAXONOMY_AND_OWNER_DISCOVERY_COMPLETION_MODEL.md)
> Aligns with: [VENUE_DNA_COMPLETENESS_MODEL_PHASE_9C_SPEC.md](./VENUE_DNA_COMPLETENESS_MODEL_PHASE_9C_SPEC.md), [venueDnaCompletenessEvaluator.js](../../src/services/venueIntelligence/venueDnaCompletenessEvaluator.js), the Venue Intelligence message flow in `server.js`, and [scripts/test-venue-intelligence-chat-quality.js](../../scripts/test-venue-intelligence-chat-quality.js).
> Created: 2026-06-20. Track: Owner Experience. Subphase: 9E-3A (docs-only).

---

## 1. Purpose

This spec converts the Venue DNA Taxonomy research into concrete, buildable product logic for HESTIA's Venue Intelligence conversation. It defines the internal checklist HESTIA tracks, the evidence model behind it, the deterministic thresholds for producing a Working DNA Draft and (later) owner-confirmed DNA, and the next-best-question engine that replaces endless interviewing.

It exists to make four behaviours true and testable:

- HESTIA **does not** behave like an endless questionnaire.
- HESTIA **tracks which DNA dimensions are covered**, internally and deterministically.
- HESTIA **knows when enough exists** to produce a Working DNA Draft.
- HESTIA **knows what is still missing** before owner confirmation — and asks for it precisely.

It does not introduce a confirmed-DNA tier (that is a later 9D phase) and it does not unlock Full Intelligence Mode.

---

## 2. Product Principle

**The owner sees a conversation. HESTIA internally tracks a checklist.**

The checklist — dimension statuses, evidence, draft readiness, next-best-question, confirmation gaps — is **backstage intelligence**. It guides what HESTIA says next; it is never the main UI. The owner experiences a calm chat that produces a useful working draft on request. The structured machinery stays behind a collapsed "Backstage intelligence" panel and is never presented as a dashboard, a score, or a checklist to tick.

This is the same doctrine as Phase 9C: *conversation creates candidates, not automatic truth*; *the foundation verdict is computed by code, never declared by the LLM*.

---

## 3. Venue DNA Dimension Set

The canonical internal dimension set, grouped by role. Per-dimension contract fields:

- **key** — stable identifier (snake_case).
- **description** — what it captures.
- **evidence** — what counts as evidence for it.
- **answered** — what makes it `answered`.
- **partial** — what makes it `partial`.
- **never_infer** — what must never be assumed.
- **blocks_draft** — does absence block a Working DNA Draft?
- **blocks_confirmation** — does it block owner-confirmed DNA?
- **modules** — dependent HESTIA modules.

> **Storage honesty (inherited from 9C):** several dimensions have **no clean storage** in today's `venue_dna_json` (11 signal arrays + 5 confidence dims). Those are marked `tracked_today: no|partial`. Until a separately-gated field extension exists, the engine reports them honestly as `missing`/`partial` and **never** silently extends `mergeVenueDna` to invent storage.

### 3.1 Foundation-Critical (minimum for a Working DNA Draft)

These are the dimensions that, together, make a draft meaningful. Absence of the foundation set blocks the draft (see §6 threshold for the exact rule — the threshold uses OR-groups, not all-of).

| key | description | answered when | partial when | never_infer | tracked_today | modules |
|---|---|---|---|---|---|---|
| `venue_identity` | Category, format, scale, layout | format + capacity + primary focus stated | format only, no scale | a category from one ambiguous word | yes | Core Engine, Guest Intel |
| `owner_intent` | Founder motivation / vision | personal + brand goal stated | financial goal only | motives not expressed | partial | Brand, Academy |
| `business_purpose` | Market thesis / problem solved | clear value prop + audience gap | vague "great drinks" mission | a thesis not stated | partial | Brand, Marketing |
| `target_guest_segments` | Primary personas | multiple distinct personas w/ patterns | one broad segment ("locals") | demographics not stated | yes | Guest Intel, Marketing |
| `emotional_promise` | What guests must feel | a named emotional register/promise | mood implied not named | mood from decor guesses | partial | Brand, Service |
| `hospitality_philosophy` | The belief system of hosting | an explicit hosting belief | a service mention w/o belief | a philosophy not stated | partial | Service, Academy |
| `service_philosophy` | How service should feel/behave | a stated service stance | a service mention w/o stance | standards not described | yes | Service, Academy |
| `fnb_identity` | Food + beverage identity (combined) | a stated F&B direction | a mention w/o direction | a program not described | yes | F&B Program |
| `beverage_identity` | Drink direction specifically | a stated beverage direction | a beverage mention w/o direction | a program not described | yes | F&B Program |
| `operational_pain_points` | Recurring operational pain | a named recurring pain | a vague pressure | problems not described | yes | Core Engine |
| `non_negotiables` | Hard rules that never bend | an explicit non-negotiable | a priority that reads like one | rules not stated | no | All modules |
| `what_venue_must_never_become` | Explicit identity boundaries | an explicit boundary | a boundary implied elsewhere | opposites by assumption | no | Brand, Drift |
| `staff_behavior_standards` | Required/forbidden staff behaviours | explicit do/don't standards | a behaviour mention w/o standard | performance judgments (no surveillance) | no | Academy, Service |
| `training_philosophy` | How the team is taught the venue | a stated training approach | training mentioned w/o approach | a method not described | partial | Academy |

### 3.2 Confirmation-Critical (required before owner-confirmed DNA)

These must be **explicitly owner-confirmed** before any confirmed-DNA tier exists (9D). They may be `answered` for a draft, but never `confirmed` from LLM text alone.

`venue_identity`, `owner_intent`, `target_guest_segments`, `emotional_promise`, `service_philosophy`, `non_negotiables`, `what_venue_must_never_become`, `staff_behavior_standards`, plus any **major positioning claim** (`business_purpose`, `marketing_positioning` when stated as identity).

### 3.3 Module-Specific (useful for downstream modules; do not block the draft)

| key | description | modules |
|---|---|---|
| `demographic_reality` | Actual neighborhood age/income/profession | Marketing, Guest Intel |
| `psychographic_guest_profile` | Values, aesthetics, social behaviour | Guest Intel, Brand |
| `guest_occasion` | Use cases by daypart/day | Guest Intel, F&B |
| `menu_philosophy` | The logic behind the menu | F&B Program |
| `physical_environment` | Space, layout, capacity zones | Core Engine, Ops |
| `location_context` | Neighborhood / street / catchment | Marketing, Guest Intel |
| `sensory_world` | Light, scent, materials, texture | Brand, Ops |
| `music_energy_rhythm` | Music + energy across the night | Guest Intel, Ops |
| `social_shareability_strategy` | Instagrammability / shareable moments | Marketing |
| `marketing_positioning` | How the venue is positioned vs market | Marketing, Brand |
| `brand_language` | Voice / tone of the venue | Marketing, Brand |
| `competitive_set` | Who it competes with / against | Marketing, Brand |
| `local_culture_fit` | Community / cultural alignment | Marketing, Guest Intel |
| `guest_memory_strategy` | How guests are remembered | Guest Intel, Service |
| `repeat_guest_strategy` | How regulars are grown/kept | Guest Intel, Marketing |
| `rituals_signature_moments` | Signature, repeatable moments | Brand, Service |
| `operational_constraints` | Structural limits (space, staffing, hours) | Core Engine, Ops |
| `commercial_model` | How the money is actually made | Commercial |
| `growth_ambition` | Where the upside / ambition is | Commercial, Strategy |

### 3.4 Advanced / Later (useful, never blocking)

| key | description | notes |
|---|---|---|
| `identity_drift_risks` | Signals the venue is drifting from intent | derived; surfaced, never auto-applied |
| `owner_confirmation_status` | Per-dimension confirmation governance | **9D** — stored outside `venue_dna_json` |

> `identity_drift_risks` is the contradiction/drift surface. Per 9C it stays **research-only as an automated mechanism** until a conflict store exists; the *principle* (make change conscious) is doctrine, the *auto-detection* is not built here.

---

## 4. Dimension Status Model

Nine deterministic statuses. **The LLM never assigns a status** — the engine computes it from `(evidence presence, evidence type, count, confirmation record, contradiction record)`.

| status | meaning |
|---|---|
| `not_asked` | HESTIA has not yet explored this dimension. |
| `mentioned` | The owner referenced it in passing; not enough to be partial. |
| `partial` | Some evidence, below the answered threshold. |
| `answered` | Enough owner-provided evidence to treat as understood (for a draft). |
| `needs_precision` | Answered-ish but ambiguous on a specific detail the engine flags. |
| `needs_owner_confirmation` | Answered + confirmation-critical, no confirmation record yet. |
| `confirmed` | Answered + a valid owner confirmation record exists (**9D only**). |
| `contradicted` | A recorded conflict between turns; held as uncertainty. |
| `not_relevant` | Owner explicitly marked the dimension irrelevant to this venue. |

### Transitions

```text
not_asked → mentioned → partial → answered → needs_owner_confirmation → confirmed
                                   ↘ needs_precision ↗
any → contradicted   (on conflicting evidence; must be reconciled)
any → not_relevant   (only on explicit owner statement)
```

**Hard rules:**
- LLM text alone **may never** create `confirmed`. `confirmed` requires a stored confirmation record (9D).
- `partial` never counts as `answered`.
- `mentioned` and `needs_precision` never count as `answered` for the draft threshold.
- `contradicted` on a foundation dimension blocks the draft until reconciled.
- Until the precision/conflict stores exist, `needs_precision` and `contradicted` collapse honestly into `partial` / are simply absent (same first-cut discipline as 9C).

---

## 5. Evidence Model

Every signal HESTIA captures is an **evidence record** attached to one or more dimensions. This is the provenance layer the current bare-string arrays lack.

```js
{
  dimension_key,          // e.g. "service_philosophy"
  evidence_type,          // see below
  value,                  // short noun-phrase / quote fragment
  source,                 // "owner_message" | "operational_signal" | "derived"
  source_message_id,      // ties evidence to the turn it came from
  timestamp,
  confidence,             // 0–100 engine-calibrated coverage, NOT certainty
  requires_confirmation,  // true for confirmation-critical dimensions
  usable_in_working_draft,// true for facts/beliefs/operational signals
  usable_in_confirmed_dna // true ONLY after an owner confirmation record (9D)
}
```

### Evidence types

- `owner_provided_fact` — a concrete fact the owner stated ("60 seats").
- `owner_provided_belief` — a value/intent the owner stated ("guests are family").
- `operational_signal` — derived from real operational data (not invented).
- `inferred_signal` — a reasonable inference clearly marked as inference (never a fact).
- `contradiction` — a recorded conflict against prior evidence.
- `confirmation` — an owner confirmation event (**9D**).
- `missing` — the engine's note that a dimension has no evidence yet.

### Fact vs signal vs inference vs assumption vs confirmed truth

| tier | definition | usable in draft | usable in confirmed DNA |
|---|---|---|---|
| **fact** | Owner stated it explicitly | yes (as fact) | only after confirmation |
| **signal** | Captured working understanding | yes (as signal) | only after confirmation |
| **inference** | Reasonable, **labelled** inference | yes (clearly marked) | never without confirmation |
| **assumption** | Unsupported guess | **never** — forbidden | never |
| **confirmed truth** | Owner explicitly confirmed (9D) | n/a | yes |

The draft may use facts/signals/labelled inferences; it must **never** manufacture an assumption (no invented venue name, KPI, or demographic).

---

## 6. Working DNA Draft Threshold

Deterministic. A **Working Venue DNA Draft** can be produced when evidence at `answered`-or-`partial`-with-fact exists across **all** of these OR-groups:

1. `venue_identity`
2. `target_guest_segments` **OR** `demographic_reality`
3. `emotional_promise` **OR** `music_energy_rhythm`/atmosphere (`sensory_world`)
4. `hospitality_philosophy` **OR** `service_philosophy`
5. `fnb_identity` **OR** `beverage_identity`
6. `operational_pain_points` **OR** `training_philosophy`
7. at least one of: `non_negotiables` **OR** `what_venue_must_never_become` **OR** `staff_behavior_standards`

Rules:

- The Working Draft **does not require confirmation**.
- If the owner **explicitly asks** for the draft/summary/DNA, produce it even if one or two optional groups are thin — fill unknowns with `not yet clear`.
- The draft is **always** labelled: `Working Venue DNA Draft — not yet confirmed`.
- A `contradicted` foundation dimension blocks the draft until reconciled.

---

## 7. Owner-Confirmed DNA Threshold

Stricter. Owner-confirmed DNA (a future, separately-gated tier — **9D**) requires **all** of:

- explicit owner confirmation per confirmation-critical dimension (§3.2),
- all `contradicted` dimensions resolved,
- confirmed `non_negotiables`,
- confirmed `what_venue_must_never_become`,
- confirmed `emotional_promise`,
- confirmed `staff_behavior_standards`,
- confirmed `owner_intent`,
- no critical missing foundation gaps.

**Auto-confirmation is forbidden.** No path — LLM text, draft acceptance, time, or score — may set `confirmed`. Confirmation is a stored governance event outside `venue_dna_json` (per 9C: a dedicated `venue_dna_confirmations` table in 9D). Full Intelligence Mode remains locked regardless.

---

## 8. Checkmark Engine

For every owner message, the engine (deterministic core + bounded LLM extraction) runs:

1. **Extract evidence** from the message (LLM proposes evidence records; never statuses).
2. **Map evidence → dimensions** (one sentence may satisfy several — Conversational Doctrine §2).
3. **Update dimension status** deterministically from accumulated evidence.
4. **Detect contradictions** against prior evidence (flag, never silently overwrite).
5. **Update draft readiness** against the §6 threshold.
6. **Choose the next best question** (§9).
7. **Decide whether to produce a draft** (threshold met, or owner asked).

This is internal. The owner never sees a large checklist; they see the resulting reply (a question, a reflection, or the draft).

---

## 9. Next-Best-Question Engine

Deterministic priority order — pick the single highest-priority unmet item:

1. unresolved **contradictions** (reconcile first)
2. missing **foundation-critical** dimensions
3. missing **`owner_intent`**
4. missing **`what_venue_must_never_become`**
5. missing **`emotional_promise`**
6. missing **service `non_negotiables`** / `staff_behavior_standards`
7. unclear **`target_guest_segments`**
8. unclear **physical/sensory environment** (`physical_environment`, `sensory_world`)
9. module-specific follow-up (lowest priority)

Rules:

- Ask **one** question maximum.
- Never ask about an `answered`/`confirmed`/`not_relevant` dimension.
- If the owner asked for the draft, **produce the draft first**, then (optionally) ask the one question.
- If the owner is impatient or asks a status question, **answer directly first**, summarize what is captured, and state precisely what is still missing.
- Never ask a broad generic question ("what challenges do you face?") when a precise missing dimension exists.

---

## 10. Draft Generator Rules

The draft (delivered inside the existing `reply` field — no schema change) uses these sections:

1. Venue Identity
2. Owner Intent
3. Guest Profile
4. Atmosphere & Energy Rhythm
5. F&B / Beverage Identity
6. Service Philosophy
7. Guest Memory Standard
8. Staff / Training Reality
9. Marketing / Social Identity
10. Physical / Location Context
11. Non-Negotiables Captured
12. Still Missing Before Confirmation
13. Next Confirmation Questions

Rules:

- Use **only** owner-provided facts or clearly-marked signals.
- **Do not invent** a venue name (use "the venue"/"this cocktail bar" if unstated, never derive from a person's name).
- **Do not invent** KPIs, sales, or demographic details.
- Mark unknowns as `not yet clear`.
- End with **1–3 confirmation questions** (context-dependent), and label the whole block `Working Venue DNA Draft — not yet confirmed`.

> The current chat prompt (Phase 9E-2) already implements a 9-section draft. This spec **extends** it to the 13-section form above. The extension is a prompt change in a later subphase (9E-3E), not a writer/schema change.

---

## 11. Conversation Behavior Rules

HESTIA must:

- **answer direct questions first** (status/output questions get a direct first sentence);
- **avoid endless interviewing** — stop once the §6 threshold is met;
- **produce the draft** once the threshold is met or the owner asks;
- **ask only one sharp question** after a draft;
- **detect multi-dimension answers** (one message may close several dimensions) and not re-ask them;
- **avoid repeating** answered questions;
- **distinguish software/version/meta questions** ("do you understand your mission?", "how many more questions?") from venue-understanding changes — answer them, do not record them as venue signals;
- **never** claim confirmed/completed/final DNA, and never claim Full Intelligence Mode ready/active.

---

## 12. OwnerAIHome Integration

**Visible (main surface):**
- the chat conversation + real assistant replies,
- one premium input,
- suggested prompt chips (including "Show me the current Venue DNA draft"),
- a subtle "signals are not confirmed Venue DNA" guardrail note.

**Hidden / collapsed (Backstage intelligence):**
- dimension statuses,
- draft readiness,
- next-best-question,
- confirmation gaps.

**Not visible by default:**
- a score dashboard,
- a large checklist,
- the technical confidence model / percentages on the main surface.

This preserves the 9E-1B/9E-2 behaviour: chat-first surface, collapsed backstage, no percentage on the main surface, Full Mode locked.

---

## 13. Relationship to Existing 9C Completeness Model

Two complementary layers:

- **9C evaluator** = deterministic **foundation coverage / readiness** over the current `venue_dna_json` shape (16 dimensions → `not_started…foundation_ready`, `foundation_score`, `unlock_readiness=false`). It is pure, read-only, heavily tested (390 assertions).
- **9E taxonomy** = richer **discovery / checkmark / evidence / draft** logic (35 dimensions, evidence provenance, draft + confirmation thresholds, next-best-question).

Compatibility rules:

- **Do not break 9C.** The evaluator, its endpoint, and its tests stay intact.
- The taxonomy is **additive**: a new constants module + a new extraction/readiness service, read-only over existing DNA, never a second writer.
- **Possible future:** extend the 9C evaluator to *read* taxonomy checkmarks (e.g. map the 35-dim evidence onto the 16-dim readiness), keeping the current Venue DNA shape stable.
- **Never silently expand `mergeVenueDna`.** New persistence (evidence records, confirmation records) is a separately-gated, spec'd, migration-backed step — not folded into the existing writer.

---

## 14. Implementation Phases

| Phase | Scope | Likely files | Risk |
|---|---|---|---|
| **9E-3A** (this doc) | Implementation spec | this doc only | very low |
| **9E-3B** | Pure taxonomy constants + dimension definitions | new constants module (e.g. `src/services/venueIntelligence/venueDnaTaxonomy.js`) + tests | low |
| **9E-3C** | Evidence extraction / mapping service (pure mapping; LLM proposes, code classifies) | new service + tests | medium |
| **9E-3D** | Draft-readiness + next-best-question engine (deterministic) | new service + tests | medium |
| **9E-3E** | Chat prompt integration using deterministic context (inject statuses + next-best-question; 13-section draft) | `server.js` prompt only | medium |
| **9E-3F** | OwnerAIHome backstage integration (statuses/readiness in the collapsed panel only) | `OwnerAIHome.jsx` | low |
| **9D (later)** | Owner confirmation storage + confirmed-DNA tier (`venue_dna_confirmations` table, confirm action) | `server.js`, new table, `OwnerAIHome.jsx` | higher |

Each subphase ships only after `npm run build` and `npm run hestia:check` pass. No Build→Full unlock and no confirmed-DNA tier ships before confirmation storage exists and is tested.

---

## 15. Acceptance Criteria

Before the 9E-3 coding sequence is considered complete:

- HESTIA can **identify answered dimensions** from a conversation (evidence → status).
- HESTIA can **state what is missing** precisely (by dimension, not generically).
- HESTIA can **produce a Working DNA Draft** at the deterministic threshold (§6).
- HESTIA **asks one precise next question** (§9), never a generic chain.
- HESTIA **never claims confirmed/completed/final DNA**.
- HESTIA **never invents** facts, names, KPIs, or demographics.
- HESTIA **does not show a checklist as the main UI** — backstage only.
- **Full Intelligence Mode remains locked** (`unlock_readiness = false`) throughout.

---

## Files That Must Remain Untouched In 9E-3A

`server.js`, all of `src/`, `mergeVenueDna`, `emptyVenueDna`, `OwnerAIHome.jsx`, `OperationalPulse.jsx`, prompts / LLM system instructions, database files, `package.json`, `.env`, routes, services, tests, components, pages. The only artifact created in 9E-3A is this document.
