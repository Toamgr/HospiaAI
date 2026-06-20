# 02 — Venue DNA & Owner Discovery Pack

**Scope:** Consolidates HESTIA's Venue DNA, Owner Discovery, Founder Intelligence, Venue Memory, Venue Intelligence, and draft-readiness / checkmark research into one self-contained reference.

**Status of this material:** A mix of (a) **canonical doctrine/specs** (`docs/architecture/*`), (b) **research** (`docs/research/*`, carrying the archive note), and (c) **synthesis** by Claude Code, marked **(synthesis)**. The implemented surface is narrow (see pack `01`); most of the taxonomy below is **spec, not built**.

---

## 1. What Venue DNA Is

**Venue DNA is HESTIA's core operational blueprint** — the living object that connects a founder's vision to daily guest experience. It is *not* brand styling. Brand guidelines govern logos, palettes, and external voice; Venue DNA governs how a team runs a busy Friday night.

The Venue DNA Taxonomy research frames Venue DNA as the integration of eight pillars:
**Identity · Emotional Promise · Physical World · Guest Fit · Operational Behavior · Service Philosophy · Commercial Logic · Founder Belief.**

It is fed by three inputs: **Founder Belief** (purpose, values, non-negotiables) + **Operational Data** (metrics, scale, constraints) + **Physical Spaces** (acoustics, flow, sensory) → unified into the **HESTIA Venue DNA** blueprint.

Venue DNA ≠ Brand. Distinct identity layers (from the research) integrate through Venue DNA: Founder Belief, Brand Identity, Venue Concept, Guest Experience, Service Culture, Operating Standards, Physical Environment, Commercial Reality — each with its own operational output and system dependencies.

## 2. The Chain: Venue Memory → Venue Intelligence → Venue DNA

**(synthesis, grounded in the memory + venue-intelligence research)**

- **Venue Memory** is the antidote to "hospitality amnesia" — the seven vectors of knowledge loss: ambient/micro-operational decay, inter-shift dissipation, vaporization of tacit employee knowledge, erasure of management-transition context, isolation of founder intelligence, siloing of veteran expertise, and unconnected pattern failures. Transactional systems record *what* happened financially but not *how/why* it succeeded or failed.
- **Venue Intelligence** turns captured memory into understanding: it models the venue as a "unified hospitality organism" (sensory/spatial domain + behavioral/human domain), reasoning beyond lagging financial indicators (RevPAR/ADR/turnover) toward emotional utility.
- **Venue DNA** is the confirmed, structured distillation of that understanding — the constraint set every specialist (F&B, Service, Academy, Owner) consumes.

The bidirectional law (from the master execution plan / North Star): *Venue Intelligence → specialist decision → decision memory + outcome → **candidate** Venue Intelligence update (provenance-gated, never auto-confirmed).*

## 3. The 35-Dimension Venue DNA Taxonomy

Source: `2026-06-20_HESTIA_VENUE_DNA_TAXONOMY_AND_OWNER_DISCOVERY_COMPLETION_MODEL.md`, formalized in `VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md`. Each dimension has: key · description · evidence · answered/partial criteria · `never_infer` · whether it blocks the draft / blocks confirmation · dependent modules.

**Foundation-critical (minimum for a Working DNA Draft):**
`venue_identity`, `owner_intent`, `business_purpose`, `target_guest_segments`, `emotional_promise`, `hospitality_philosophy`, `service_philosophy`, `fnb_identity`, `beverage_identity`, `operational_pain_points`, `non_negotiables`, `what_venue_must_never_become`, `staff_behavior_standards`, `training_philosophy`.

**Confirmation-critical (must be owner-confirmed before owner-confirmed DNA):**
`venue_identity`, `owner_intent`, `target_guest_segments`, `emotional_promise`, `service_philosophy`, `non_negotiables`, `what_venue_must_never_become`, `staff_behavior_standards`, plus any major positioning claim (`business_purpose`, `marketing_positioning` when stated as identity).

**Module-specific (useful, do not block the draft):**
`demographic_reality`, `psychographic_guest_profile`, `guest_occasion`, `menu_philosophy`, `physical_environment`, `location_context`, `sensory_world`, `music_energy_rhythm`, `social_shareability_strategy`, `marketing_positioning`, `brand_language`, `competitive_set`, `local_culture_fit`, `guest_memory_strategy`, `repeat_guest_strategy`, `rituals_signature_moments`, `operational_constraints`, `commercial_model`, `growth_ambition`.

**Advanced / later:** `identity_drift_risks` (derived; surfaced never auto-applied), `owner_confirmation_status` (governance, stored outside `venue_dna_json`).

> **Storage honesty:** several dimensions have **no clean storage** in today's `venue_dna_json` (11 signal arrays + 5 confidence dims). Those are marked `tracked_today: no|partial` and reported honestly as `missing`/`partial`. The engine **never** silently extends `mergeVenueDna` to invent storage.

## 4. Dimension Status Model (9 deterministic statuses)

**The LLM never assigns a status.** The engine computes it from `(evidence presence, evidence type, count, confirmation record, contradiction record)`:

`not_asked → mentioned → partial → answered → needs_owner_confirmation → confirmed`, with side-branches `needs_precision`, `contradicted`, `not_relevant`.

Hard rules:
- LLM text alone may **never** create `confirmed` — that requires a stored confirmation record ("9D").
- `partial`/`mentioned`/`needs_precision` never count as `answered` for the draft threshold.
- `contradicted` on a foundation dimension blocks the draft until reconciled.
- Until precision/conflict stores exist, `needs_precision`/`contradicted` collapse honestly into `partial`/absent.

## 5. Evidence Model

Every captured signal is an **evidence record** (the provenance layer the current bare-string arrays lack):

```js
{ dimension_key, evidence_type, value, source, source_message_id, timestamp,
  confidence,               // engine-calibrated COVERAGE, not certainty
  requires_confirmation, usable_in_working_draft, usable_in_confirmed_dna }
```

Evidence types: `owner_provided_fact`, `owner_provided_belief`, `operational_signal`, `inferred_signal` (clearly marked), `contradiction`, `confirmation` (9D), `missing`.

**Fact vs signal vs inference vs assumption vs confirmed truth:**

| tier | usable in draft | usable in confirmed DNA |
|---|---|---|
| fact (owner stated explicitly) | yes (as fact) | only after confirmation |
| signal (captured working understanding) | yes (as signal) | only after confirmation |
| inference (reasonable, **labelled**) | yes (clearly marked) | never without confirmation |
| assumption (unsupported guess) | **never — forbidden** | never |
| confirmed truth (owner confirmed, 9D) | n/a | yes |

The draft may use facts/signals/labelled inferences; it must **never** manufacture an assumption (no invented venue name, KPI, or demographic).

## 6. Working DNA Draft Rules (the deterministic threshold)

A Working Venue DNA Draft can be produced when evidence at `answered`-or-`partial-with-fact` exists across **all** of these OR-groups:
1. `venue_identity`
2. `target_guest_segments` OR `demographic_reality`
3. `emotional_promise` OR atmosphere (`music_energy_rhythm`/`sensory_world`)
4. `hospitality_philosophy` OR `service_philosophy`
5. `fnb_identity` OR `beverage_identity`
6. `operational_pain_points` OR `training_philosophy`
7. one of: `non_negotiables` OR `what_venue_must_never_become` OR `staff_behavior_standards`

Rules: the draft does **not** require confirmation; if the owner explicitly asks, produce it even if a group or two is thin (fill unknowns with `not yet clear`); it is **always** labelled `Working Venue DNA Draft — not yet confirmed`; a `contradicted` foundation dimension blocks it until reconciled.

**Draft sections (13):** Venue Identity · Owner Intent · Guest Profile · Atmosphere & Energy Rhythm · F&B/Beverage Identity · Service Philosophy · Guest Memory Standard · Staff/Training Reality · Marketing/Social Identity · Physical/Location Context · Non-Negotiables Captured · Still Missing Before Confirmation · Next Confirmation Questions.

## 7. Owner-Confirmed DNA Rules

Owner-confirmed DNA (a future, separately-gated tier — "9D") requires **all** of: explicit owner confirmation per confirmation-critical dimension; all `contradicted` dimensions resolved; confirmed `non_negotiables`, `what_venue_must_never_become`, `emotional_promise`, `staff_behavior_standards`, `owner_intent`; no critical missing foundation gaps.

**Auto-confirmation is forbidden** by every path (LLM text, draft acceptance, time, score). Confirmation is a stored governance event outside `venue_dna_json` (planned `venue_dna_confirmations` table). **Full Intelligence Mode stays locked** regardless.

## 8. The Internal Checkmark Model (Checkmark Engine)

**Product principle: the owner sees a conversation; HESTIA internally tracks a checklist.** The checklist (dimension statuses, evidence, draft readiness, next-best-question, confirmation gaps) is **backstage intelligence** — never the main UI, never a dashboard/score/checklist to tick.

For every owner message the engine runs: (1) extract evidence (LLM proposes evidence records, never statuses), (2) map evidence → dimensions (one sentence may satisfy several), (3) update statuses deterministically, (4) detect contradictions (flag, never overwrite), (5) update draft readiness, (6) choose the next best question, (7) decide whether to produce a draft.

## 9. Next-Best-Question Model

Deterministic priority — pick the single highest-priority unmet item:
1. unresolved contradictions (reconcile first)
2. missing foundation-critical dimensions
3. missing `owner_intent`
4. missing `what_venue_must_never_become`
5. missing `emotional_promise`
6. missing service `non_negotiables` / `staff_behavior_standards`
7. unclear `target_guest_segments`
8. unclear physical/sensory environment
9. module-specific follow-up (lowest)

Rules: ask **one** question max; never ask about an answered/confirmed/not_relevant dimension; if the owner asked for the draft, produce it first then optionally ask one; if the owner is impatient or asks status, answer directly first and state precisely what is missing; never ask a broad generic question when a precise missing dimension exists.

## 10. Owner Conversation Behavior

HESTIA must: answer direct questions first; avoid endless interviewing (stop at the §6 threshold); produce the draft when threshold met or asked; ask only one sharp question after a draft; detect multi-dimension answers and not re-ask; distinguish software/meta questions ("do you understand your mission?") from venue signals (answer them, don't record them as DNA); never claim confirmed/completed/final DNA; never claim Full Intelligence Mode ready/active.

**OwnerAIHome integration:** Visible = chat + replies, one premium input, suggested prompt chips (incl. "Show me the current Venue DNA draft"), a subtle "signals are not confirmed Venue DNA" note. Hidden/collapsed (backstage) = dimension statuses, draft readiness, next-best-question, confirmation gaps. Not visible by default = score dashboard, large checklist, confidence percentages.

## 11. Founder / Owner Intelligence

From `FOUNDER INTELLIGENCE RESEARCH.md` (10 great hospitality founders): the intelligence that never reaches a dashboard is remarkably consistent — a **non-negotiable emotional standard** ("how we make people feel"), a **people-first sequence** (team → guest → community → suppliers → investors, per Danny Meyer's Enlightened Hospitality), and an **instinct for what NOT to do**. Founders track leading/emotional signals (repeat-guest warmth, employee energy, "the one thing wrong," advance-booking pace), not the metrics systems capture.

Proposed model: a **Founder Digital Twin** capturing *stable DNA* (vision, values, non-negotiables, definition of service) once, plus *evolving layers* (priorities, fears, ambitions). When HESTIA recommends, it reasons "as the founder would," citing which founder-DNA piece the recommendation serves or protects.
> Guardrail: "Founder Digital Twin" is **research/internal model language**, not necessarily product-facing UI language, and is subject to all HESTIA human-control/provenance/confidence guardrails.

## 12. Worked Example — Cocktail Bar Scenario (synthesis from the taxonomy examples)

A 60-seat corner cocktail bar. Owner says: *"A cozy, high-craft corner cocktail bar with 60 seats… for local professionals who want elevated drinks close to home… ambient jazz early, mellow techno late… we never say 'no' directly."*

Mapping (one message → multiple dimensions):
- `venue_identity` → **answered** (format + capacity + focus: cocktail bar, 60 seats, high-craft).
- `target_guest_segments` → **partial/answered** (local professionals; one segment — may need more personas).
- `business_purpose` → **answered** (elevated drinks close to home for an underserved local crowd).
- `music_energy_rhythm` → **answered** (jazz→techno schedule).
- `non_negotiables` → **answered** (never say "no" directly; offer an alternative).
- `emotional_promise` → **partial** (cozy implies it; the named register isn't explicit) → next-best-question candidate.

Draft readiness: groups 1, 2, 3, 7 satisfied; still need a service-philosophy/hospitality belief (group 4) and an F&B/beverage direction beyond "cocktail bar" (group 5). Next best question (per §9): the highest-priority missing foundation item — e.g. service philosophy / staff behavior standards — asked as **one** precise question, not a generic "tell me about your service."

**Never infer:** a venue name from the owner's name; demographics not stated; a margin/KPI; a service standard the owner didn't describe.

## 13. Anti-Fabrication Rules (binding for any Venue DNA work)

- `mergeVenueDna` is the **only** sanctioned DNA writer. Do not add a second writer; do not silently extend it for new dimensions.
- Conversation creates **candidates, not automatic truth.** The `venue_intelligence_candidates` system is signal-only and never mutates DNA.
- The foundation/completeness verdict is **computed by code, never declared by the LLM**; no percentages on the main surface; no "complete/confirmed/finalized" claims from text.
- Never invent venue facts, names, KPIs, demographics, costs, or guest details. Mark unknowns `not yet clear`.
- Confirmation is a stored governance event; auto-confirmation is forbidden. Full Intelligence Mode stays locked until foundation + confirmation storage exist and are tested.
- Drift detection (`identity_drift_risks`) stays research-only as an *automated* mechanism until a conflict store exists; the *principle* (make change conscious) is doctrine, the auto-detection is not built.

---

### Sources
`docs/research/venue-dna/2026-06-20_HESTIA_VENUE_DNA_TAXONOMY_AND_OWNER_DISCOVERY_COMPLETION_MODEL.md` · `docs/architecture/VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md` · `docs/architecture/VENUE_DNA_COMPLETENESS_MODEL_PHASE_9C_SPEC.md` · `docs/architecture/OWNER_AI_HOME_AND_VENUE_DNA_BUILD_MODE_PHASE_9A_SPEC.md` · `docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md` · `docs/research/category-discovery/FOUNDER INTELLIGENCE RESEARCH.md` · `docs/research/category-discovery/2026-06-14_FOUNDER_MEMORY_AND_VENUE_DNA_DISCOVERY.md` · `docs/research/category-venue-intelligence/THE VENUE INTELLIGENCE RESEARCH.md` · `docs/research/operational-memory/ORGANIZATIONAL MEMORY _ VENUE MEMORY RESEARCH.md` (+ companion + supplement) · `docs/research/decision-systems/HESTIA UNCERTAINTY REDUCTION ENGINE RESEARCH.md`.
