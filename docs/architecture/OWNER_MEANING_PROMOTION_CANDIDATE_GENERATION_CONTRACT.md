# HESTIA Owner Meaning Promotion — Candidate Generation Contract (Slice 4I)

> **Status:** Slice 4I — **docs-only candidate-generation contract.** No application code, no proposal
> generation runtime, no candidate writer, no approve/reject/request-revision writer, no
> `POST`/`PATCH`/`PUT`/`DELETE` promotion route, no UI change, no `mergeVenueDna` call, no Venue DNA
> mutation, no `owner_review_opened` emission, no seed/demo data. This document defines the **future
> candidate-generation model** — how raw owner meaning captures become owner-reviewable promotion
> candidates — so that a later *code* slice (4J) writes a generator, not a design. If anything here
> reads as if a generator, writer, or route already exists, that is a documentation defect — report
> it, do not act on it.
>
> **Source of truth at authoring time:** `origin/main @ 8265536` — *feat: add owner meaning
> promotion queue UI*. HEAD == origin/main, working tree clean. The capture → read → compose chain
> (4D–4E.2) and the **read-only** promotion queue (service + two GET routes + UI, 4G/4H) are complete
> and verified. The **generation** layer — anything that *creates* a candidate row — is **not
> started.**
>
> **Binding parents (in precedence order — where this contract and a parent differ, the parent wins
> and this file is the bug):**
> 1. `docs/architecture/OWNER_MEANING_PROMOTION_REVIEW_DESIGN.md` (4F) — promotion/review **doctrine**;
>    the four-stage boundary (capture → proposal → approval → application); forbidden/allowed copy lists.
> 2. `docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md` — Venue Memory vs Venue DNA law (candidate
>    vs confirmed; provenance/confidence/role/venue rules; no auto-mutation).
> 3. `docs/architecture/VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md` — the standing decision to
>    DEFER any Venue DNA application until snapshot/history, per-signal provenance, reversible
>    confidence, owner-confirmation workflow, a reviewed `mergeVenueDna` path, and an audit diff
>    ledger all exist. **This contract inherits that deferral in full.**
> 4. `docs/architecture/OWNER_MEANING_PROMOTION_DDL_CONTRACT.md` (4F.1) — exact **table shape, column
>    names, controlled vocabulary, status lifecycle.** The generator writes *these* columns; where
>    this document's field language differs from 4F.1, **4F.1 wins for storage column names** (§5
>    reconciles the mapping).
> 5. `docs/architecture/OWNER_MEANING_PROMOTION_READ_API_CONTRACT.md` (4F.2) — the read shapes the
>    generated rows are rendered through. A generated candidate must read back cleanly through the
>    existing GET routes with `application.blocked: true` and `allowed_actions` all false.
> 6. `docs/architecture/OWNER_MEANING_CAPTURE_DESIGN.md` (4A) / `OWNER_MEANING_CAPTURE_DDL_CONTRACT.md`
>    (4C.2) — the capture layer the generator reads *from* and never writes.
>
> **Slice-numbering note.** The read lineage is numbered 4F → 4F.1 → 4F.2 → 4G.0 (plan) → 4G/4H
> (read service, routes, UI). This generation contract is commissioned as **Slice 4I**; its
> downstream roadmap (§15) is **4J → 4N**. The numbers are labels, not authority — the **binding
> parents above** govern.

---

## 1. Purpose

Candidate generation is the **controlled interpretation step** that turns raw owner meaning captures
(`owner_meaning_captures`, Venue Memory) into **promotion candidates** (`owner_meaning_promotion_candidates`,
a proposal record) that the owner can later review. It is the writer behind stage 2 (**proposal**) of
the 4F four-stage model. Today there is no such writer; this contract defines what one may and may
not do.

**Candidate generation IS:**

* a **controlled interpretation layer** from raw owner evidence into proposed, reviewable changes;
* a way to **prepare** owner-reviewable proposed diffs — never to enact them;
* **evidence-bound** — every proposed value traces to cited capture rows (and, read-only, to existing
  DNA/intelligence snapshots);
* **confidence-aware** — it scores its own certainty across multiple dimensions and surfaces the
  reasons;
* **uncertainty-honest** — it records contradictions and missing evidence rather than hiding them;
* **non-mutating** — it writes only the two promotion tables (candidate + append-only event), never
  Venue DNA.

**Candidate generation is NOT:**

* an automatic Venue DNA update;
* owner approval (generation drafts; only the owner decides);
* a review action of any kind;
* a `mergeVenueDna` call;
* final truth, or a claim that HESTIA "learned" anything;
* a generic LLM summary of the owner's words relabelled as their meaning;
* a fake "dashboard insight" or a manufactured metric.

> **The boundary this contract protects:** the owner's words are **evidence** (referenced, never
> relabelled); a generated candidate is a **proposed reading** (reviewable, rejectable); and nothing
> the generator writes reaches canonical Venue DNA. HESTIA may *propose*. Only the owner may
> *approve*. And approval is still not application (§9, §10, binding parent #3).

---

## 2. Source inputs

### 2.1 Allowed inputs (read-only unless noted)

| Input | Role in generation | Access mode |
|---|---|---|
| `owner_meaning_captures` (Venue Memory) | **Primary evidence.** The owner's verbatim `owner_response_raw`, `question_text`, `question_reason`, `candidate_snapshot_json`, `candidate_fingerprint`, `created_at`, scoped to `req.venueId`. | Read-only |
| `concept_ref` | The concept/topic the capture answered; drives target classification (§4). | Read-only (from capture context) |
| Capture source snapshot / fingerprint | `candidate_snapshot_json` + `candidate_fingerprint` from the capture; frozen proposal context, and an identity anchor for dedupe (§6.1 of 4F.1). | Read-only |
| Current Venue DNA snapshot | The **current value** at the candidate's `proposed_target_path`, captured into `current_value_snapshot_json` (the "before" side of the diff). | **Read-only** |
| Existing Venue Intelligence / interpreted candidates (`venue_intelligence_candidates`), **if present** | Corroboration / contradiction signal only (consistency with prior interpretation). | Read-only; **never merged**, never written |
| Existing evidence references (prior promotion candidates, prior captures), **if available** | Consistency-with-prior-owner-statements and supersession detection. | Read-only |

### 2.2 Forbidden inputs (must never enter generation)

* **Client-supplied `venue_id` as authority** — venue scope is the server-resolved `req.venueId`
  only; a body/query `venue_id` is ignored and never widens scope.
* **Invented venue facts** — any "fact" about the venue not present in cited evidence.
* **Fake POS / sales / revenue data** — no manufactured operational truth (binding parent #2 §5).
* **Hallucinated staff or guest behavior** — no invented service, training, or guest signals.
* **Unscoped cross-venue data** — captures, DNA, or intelligence from another venue.
* **Unapproved external assumptions** — research-archive material used directly, or any "industry
  default" presented as this venue's truth. Benchmark/orientation material may inform *questions*,
  never a `proposed_value`.

> **Evidence-bound rule (binding).** Every `proposed_value` must be derivable from cited
> `owner_meaning_captures` rows (and, for the "before" side only, from the current DNA snapshot). A
> candidate whose proposed value cannot be traced to owner evidence is invalid and must not be
> generated.

---

## 3. Candidate generation pipeline (future — describe only, do NOT implement)

The future generator runs these stages in order. **None is implemented in this slice.** Each stage
is deterministic-where-possible and must record why it produced (or skipped) a candidate.

1. **Capture selection** — choose the in-venue, in-concept capture row(s) to interpret (explicit
   owner-triggered selection recommended in 4J; see §16). Cross-venue captures are excluded at this
   stage.
2. **Normalization** — normalize the captured text **for analysis only** (whitespace, casing for
   matching). The stored `owner_response_raw` and any rendered excerpt remain byte-for-byte verbatim
   (4F.2 §8). Normalization never rewrites the evidence.
3. **Meaning extraction** — derive a *proposed* plain-language reading (`proposed_meaning_summary`,
   always labelled **proposed**). This is HESTIA's interpretation, never stored as
   `captured_owner_meaning` (a forbidden column, 4F.1 §3.3).
4. **Target classification** — map the meaning to **one** allow-listed `proposed_target_path` from
   the §4 taxonomy + 4F.1 §6.2 allow-list. Free-form paths are forbidden.
5. **Evidence binding** — record `source_capture_ids_json` + `source_capture_fingerprints_json`
   (references, not copies) that justify the proposal.
6. **Proposed diff construction** — build `current_value_snapshot_json` (before), `proposed_value_json`
   (after, bounded to the one field), and `proposed_dna_patch_json` (the bounded single-field delta).
   See §5.
7. **Confidence scoring** — compute the multi-dimensional confidence model (§6); set
   `confidence_label` (rendered) and `confidence_factors_json`; leave `confidence_score` null unless
   an internal sort key is genuinely needed (4F.1 §6.3).
8. **Contradiction check** — detect tension with current DNA, prior owner statements, or operational
   evidence; record `contradictions_json` (§8).
9. **Missing-evidence detection** — record what would be needed to raise confidence
   (`missing_evidence_json`, §7).
10. **Safety / blocking check** — set `status` and confirm `application.blocked` semantics (§9). A
    contradiction, low confidence, or protected path forces a blocked/low posture.
11. **Candidate record creation** — INSERT one `owner_meaning_promotion_candidates` row (idempotent on
    `idempotency_key` / `candidate_fingerprint`, 4F.1 §9). Re-running on unchanged evidence finds the
    existing active candidate; it does not duplicate.
12. **Event logging** — append an `owner_meaning_promotion_events` row, **audit-first** (4F.1 §7.5):
    `candidate_generated` on success, or `candidate_generation_skipped` / `candidate_blocked` /
    `contradiction_detected` / `missing_evidence_recorded` as applicable (§11).

> **For this slice:** the above is the *future* pipeline. Slice 4I writes none of it. It exists so
> that 4J implements stages, not invents them.

---

## 4. Candidate target taxonomy

Owner meaning may be promoted into one of the categories below. Each maps to a server allow-listed
`proposed_target_path` (4F.1 §6.2); **4J starts with exactly one narrow path** (recommended
`owner_notes` — see §16). The other categories are declared here so the taxonomy is stable as the
allow-list widens — declaring a category does **not** open its path.

For each: *when it applies*, *acceptable example*, *too-weak/unsafe example*, *can it ever later
affect Venue DNA directly?*

| Category | When it applies | Acceptable proposed meaning | Too-weak / unsafe proposal | Direct DNA later? |
|---|---|---|---|---|
| **Venue DNA (identity)** | Owner states core identity/positioning. | "Owner positions the venue as an intimate neighborhood wine bar, not a high-volume destination." (≥2 consistent captures) | A single offhand "we're cozy I guess" with no corroboration. | Eventually, **only** via the gated §10 path. |
| **Service DNA** | Owner describes service philosophy/standards. | "Owner wants unobtrusive, anticipatory service; no scripted greetings." | "Service should be good" (no actionable content). | Eventually, gated. |
| **Bar / Beverage DNA** | Owner states beverage direction/priorities. | "Owner wants the cocktail list to lead the menu identity." | "More cocktails maybe" with reports showing wine/beer dominance → **contradiction** (§8), not a clean proposal. | Eventually, gated. |
| **F&B Direction** | Owner states food/menu direction. | "Owner wants a tight seasonal menu, ≤ 12 mains." | A specific dish list invented by HESTIA, not stated by the owner. | Eventually, gated. |
| **Guest Experience** | Owner describes intended guest feeling/journey. | "Owner wants guests to feel they discovered a secret." | A measurable guest-satisfaction target with no evidence (manufactured KPI). | Eventually, gated. |
| **Training / Academy Standards** | Owner states training expectations. | "Owner expects every bartender to explain provenance of each spirit." | "Train staff better" (no standard). | Eventually, gated. |
| **Events Standards** | Owner states event positioning/standards. | "Owner wants events to skew adults-only premium." | An events claim that conflicts with a stated "family-friendly" identity → contradiction. | Eventually, gated. |
| **Brand Voice / Tone** | Owner states how the venue communicates. | "Owner wants warm, plainspoken copy; no luxury jargon." | A tone inferred only from HESTIA's own phrasing, not the owner's. | Eventually, gated. |
| **Operational Principles** | Owner states an operating rule. | "Owner wants speed of service prioritized at the bar during peak." | A rule that contradicts an existing service-DNA standard → contradiction. | Eventually, gated. |
| **Owner Preferences** | Owner states a personal preference (not venue law). | "Owner prefers to review menu changes personally." | Treating a preference as binding venue DNA without owner confirmation. | Eventually, gated; lower blast radius. |
| **Do-not-change / Guardrail Memory** | Owner states something must **not** change. | "Owner: never remove the house negroni." (a `restrict`/protected entry) | Auto-deprecating a protected entry on weak evidence. | **Protected** — such targets force blocked posture (§9) and never auto-apply. |

**Rules for the taxonomy:**

* Generation always classifies to **one** category/path per candidate (bounded single-field delta).
* A capture that plausibly touches multiple categories yields **separate candidates**, one per path —
  never a multi-field patch.
* Declaring a category here does **not** activate its allow-list path; path activation is a separate,
  explicit allow-list change (4F.1 §6.2 + §13).

---

## 5. Proposed diff contract

The "proposed diff" is the reviewable change object. It is **assembled from existing 4F.1 columns** —
this contract does **not** introduce a new storage column. The logical diff and its 4F.1 backing:

| Logical diff field | Backing 4F.1 column | Meaning |
|---|---|---|
| `target_path` | `proposed_target_path` (+ `proposed_target_label`) | The single allow-listed DNA field this proposal touches. |
| `current_value` / `current_state` | `current_value_snapshot_json` | The "before": current DNA value **at proposal time** (historical snapshot only; never the new value; null/`unknown` if DNA has no value yet). |
| `proposed_value` | `proposed_value_json` | The "after": the proposed value, **bounded to the one field**, derived from cited evidence. |
| `change_type` | encoded in `proposed_dna_patch_json` (`op`) + `status`/factors | One of: `add`, `refine`, `clarify`, `restrict`, `deprecate`, `contradiction_detected`. |
| `rationale` | `proposal_rationale` | Why HESTIA drew this from the cited captures. |
| `source_evidence_refs` | `source_capture_ids_json` + `source_capture_fingerprints_json` | References to the capture evidence (never copies of `owner_response_raw`). |
| `missing_evidence` | `missing_evidence_json` | What is missing to raise confidence (§7). |
| `contradictions` | `contradictions_json` | Detected tensions (§8). |
| `confidence` | `confidence_label` + `confidence_factors_json` (+ internal `confidence_score`, null) | Multi-dimensional confidence (§6). |
| `non_application_reason` | `application.block_reason` (read shape, 4F.2) + `status_reason` | Why this is not applied (always set; §9). |
| `owner_review_required` | derived (always `true` in 4I/4J) | Whether owner review is required before any further action. |

**`change_type` vocabulary:**

* `add` — introduce a value where DNA currently has none.
* `refine` — narrow/sharpen an existing value (e.g. "casual" → "casual neighborhood wine bar").
* `clarify` — make an existing value more explicit without changing its substance.
* `restrict` — add a guardrail / do-not-change constraint.
* `deprecate` — propose removing/retiring a value (high scrutiny; rarely from owner-meaning alone).
* `contradiction_detected` — the evidence conflicts with current DNA/prior statements; the candidate
  surfaces tension for owner clarification rather than asserting a clean replacement (§8).

**Binding rules for the proposed diff:**

* **Never applied automatically.** Constructing a diff writes only the candidate/event tables.
* **`current_value` must come from existing stored state or be null/unknown** — it is a snapshot of
  real DNA at proposal time, never invented, never the proposed value.
* **`proposed_value` must be derived from cited source evidence** (§2.2 evidence-bound rule).
* **If evidence is weak, the candidate must say so** — low `confidence_label` + populated
  `missing_evidence_json`; the diff is not silently upgraded.
* **Contradictions block application** — a `contradiction_detected` diff cannot advance to a clean
  approve-and-apply posture until resolved (§8, §9).
* **Missing evidence must be visible** — recorded in `missing_evidence_json`, surfaced in the read.
* **The candidate must never overwrite DNA silently** — there is no code path from generation to
  `venue_dna_json` (§13).

---

## 6. Confidence model

Confidence is **multi-dimensional**, not a single number. The generator computes the dimensions
below, derives a **band**, and records the reasons in `confidence_factors_json`. The numeric
`confidence_score` stays **null** unless an internal sort key is genuinely needed (4F.1 §6.3); it is
**never rendered** (4F.2 §10).

### 6.1 Dimensions

| Dimension | What it measures |
|---|---|
| **Source clarity** | How unambiguous the owner's words are for this target. |
| **Source authority** | Whether the speaker is the owner (highest) vs. relayed/second-hand. |
| **Evidence specificity** | How concrete/actionable the stated meaning is. |
| **Consistency with current Venue DNA** | Agreement vs. tension with existing DNA. |
| **Consistency with prior owner statements** | Agreement vs. tension with earlier captures. |
| **Operational relevance** | Whether the change is meaningful to real operations. |
| **Contradiction risk** | Likelihood the proposal conflicts with other truth (§8). |
| **Reversibility / blast radius** | How hard the change would be to undo; how many specialists it affects. |
| **Freshness** | Recency of the supporting captures. |

### 6.2 Bands

* **`blocked`** — must not advance to clean review/apply (e.g. unresolved contradiction, protected
  path, missing critical evidence). Surfaced as a question/tension, not a clean proposal.
* **`low`** — usable, but weak; often better framed as a follow-up question (§16).
* **`medium`** — reasonable support (recommended threshold: ≥ 2 recent, consistent captures, 4F.1 §13).
* **`high`** — **not produced from owner-meaning evidence alone in 4J** (4F.1 §6.3 / 4F.2 §5). Reserved
  for a future model with corroborating operational evidence; the API must not emit it now.

> The **rendered** band is `confidence_label`, constrained to `low` | `medium` in the current
> read contract (4F.2 §5). `blocked` is expressed via `status` + `application.blocked`, not as a
> rendered confidence word, to stay within the read vocabulary.

### 6.3 Rules

* **High confidence does not mean auto-apply.** No band ever bypasses owner review (§9, §10).
* **Low confidence can still be useful** — as a clarifying question rather than a strong proposal.
* **Contradiction risk can force `blocked`** regardless of other dimensions.
* **`confidence_score` may remain null** if it cannot be computed safely; the label + factors are
  authoritative.
* **Confidence must explain itself** — `confidence_factors_json` carries the reasons (evidence_count,
  recency, consistency, source_type, contradictions, missing_fields), never a bare number.

---

## 7. Missing-evidence model

Missing evidence is **recorded, not hidden** — in `missing_evidence_json`, surfaced through the read
(`confidence.missing_evidence`, 4F.2 §4.2/§10). It lowers confidence and may force a `low`/`blocked`
posture.

Canonical reasons (extensible vocabulary):

* `owner_intent_unclear` — the words don't pin down a single meaning.
* `no_supporting_operational_evidence` — no shift/report/POS corroboration.
* `conflicts_with_existing_dna` — see contradictions (§8).
* `needs_pos_or_shift_report_evidence` — requires operational data to confirm.
* `needs_staff_or_service_validation` — requires service-side confirmation.
* `needs_menu_or_fnb_context` — requires F&B context.
* `needs_event_context` — requires events context.
* `needs_academy_or_training_context` — requires training context.

Each entry is a short, honest label — never a manufactured "we'll figure it out." Missing evidence is
a first-class reason a candidate stays a *question* rather than a strong proposal.

---

## 8. Contradiction model

A contradiction is **tension to surface, not an error to suppress.** Recorded in `contradictions_json`
and reflected via `change_type: contradiction_detected` and a blocked/low posture.

Illustrative contradictions:

* Owner says the venue should be **casual**, existing DNA says **formal luxury**.
* Owner wants **cocktails to lead**, but reports show **wine/beer dominate**.
* Owner asks for **speed**, but training standards emphasize **elaborate tableside service**.
* Owner states **"family-friendly"**, but an event concept targets **adults-only premium nights**.

**Rules:**

* **A contradiction is not a failure** — it is exactly the kind of tension HESTIA exists to surface.
* **HESTIA must surface the tension and ask for clarification** — the candidate frames the conflict
  for owner decision; it does not pick a winner.
* **Contradiction candidates must not be applied to DNA without an explicit owner decision** — they
  force `application.blocked` and a `blocked`/`low` confidence posture (§6, §9), and emit a
  `contradiction_detected` event (§11).

---

## 9. Application blocking model

`application.blocked` describes whether the proposed diff may reach Venue DNA. It is surfaced in the
read as `application.blocked` + `application.block_reason` (4F.2 §3.2/§4.2).

**Current rule (binding):** `application.blocked` **must remain `true`** for every generated candidate
until a future, separately-reviewed owner-review/application workflow exists. Generation never
produces an applied candidate.

Future reasons a candidate is blocked (each a distinct, recorded `block_reason`):

* `no_review_writer_yet` — no owner-decision writer exists.
* `owner_review_required` — owner has not decided.
* `contradiction_unresolved` — an open contradiction (§8).
* `low_confidence` — confidence band too weak.
* `missing_evidence` — required evidence absent (§7).
* `high_blast_radius` — change affects many specialists / hard to reverse.
* `target_path_protected` — a do-not-change / guardrail target (§4).
* `dna_mutation_not_enabled` — the §10 prerequisites (binding parent #3) are unmet.
* `candidate_advisory_only` — the candidate is a question, not a proposal to enact.

`non_application_reason` (§5) is always populated; a candidate never silently lacks a reason it is not
applied.

---

## 10. `allowed_actions` model

`allowed_actions` is the forward-declared, read-only hint the future UI uses to know which controls
*will* exist (4F.2 §4.3). **In 4I and 4J every action remains `false`** — generation creates a row
the owner can *see*, not one they can *act on* yet.

Potential future actions (declared, not enabled):

* `view`
* `approve_meaning`
* `reject_candidate`
* `request_revision`
* `ask_followup`
* `convert_to_question`
* `mark_as_evidence_only`
* `apply_to_memory`
* `propose_dna_patch`
* `apply_to_dna`

**Binding rules:**

* **`approve_meaning` and `apply_to_dna` are separate concepts.** Approving the *meaning* records that
  the owner agrees with HESTIA's reading; it is **not** a DNA write.
* **`apply_to_dna` requires an additional contract and an explicit owner action** — gated by §10
  prerequisites (binding parent #3). It is the only action that could ever cross into `venue_dna_json`.
* **`apply_to_memory` should precede `apply_to_dna`** as a lower-blast-radius step (OPEN, §16).
* **The current runtime keeps all actions unavailable.** No generated candidate, and no future
  generator slice (4J), flips any action to `true`.

---

## 11. Events / audit contract

Generation and (future) review emit append-only `owner_meaning_promotion_events` rows (4F.1 §4),
**audit-first** (4F.1 §7.5). Each event records **actor, venue scope, candidate id, capture id(s),
and reason.**

| Event type | Emitted when | Active in 4J (generation)? |
|---|---|---|
| `candidate_generated` | A candidate row is successfully drafted from owner evidence. | ✅ |
| `candidate_generation_skipped` | Generation ran but produced no candidate (e.g. no actionable meaning). | ✅ |
| `candidate_blocked` | A candidate was created in a blocked posture (e.g. protected path). | ✅ if applicable |
| `contradiction_detected` | A contradiction was recorded on a candidate (§8). | ✅ if applicable |
| `missing_evidence_recorded` | Missing-evidence reasons were recorded (§7). | ✅ if applicable |
| `owner_review_opened` | The owner opened the proposal for decision. | ❌ — **never from a GET** (§13, 4F.2 §12); only a future explicit writer. |
| `owner_approved_meaning` | The owner accepted HESTIA's reading. | ❌ — future review slice (4L). |
| `owner_rejected_candidate` | The owner declined the candidate. | ❌ — future review slice. |
| `owner_requested_revision` | The owner asked for a revised proposal. | ❌ — future review slice. |
| `candidate_superseded` | A newer candidate replaced this one. | ✅ if supersession built |
| `dna_patch_proposed` | A bounded DNA patch was proposed for a candidate. | ❌ — future (4M). |
| `dna_patch_applied` | A real Venue DNA write occurred. | ❌ — **reserved/blocked** until §10 (4N). |

**Rules:**

* **GET must not write `owner_review_opened`** (or anything) in this or any read slice — review-open
  telemetry, if ever wanted, is a separate explicit `POST`, never a read side effect (4F.2 §12).
* **Event logging is append-only** — never updated, never deleted (4F.1 §4).
* **Audit must record** actor (type + user id + role), venue scope, candidate id, capture id(s), and
  reason for every recorded transition.
* **AI-generated events are distinguishable from owner actions** — generation events carry
  `actor_type` `hestia_suggestion` / `system` (null user id); owner-decision events carry
  `actor_type: owner` with the owner's user id (4F.1 §4.1).

---

## 12. Future API contract outline (proposed — do NOT implement)

No endpoint below is built in this slice. Each mirrors the established route posture:
`requireAuth('owner')` + explicit in-handler admin re-exclusion (admin → 403); `req.venueId` scoping;
cross-venue id → safe 404; unauthenticated → 401; no client-supplied `venue_id`.

| Endpoint | Purpose | Actor | Write behavior | Event behavior | Non-goals | Key safety checks |
|---|---|---|---|---|---|---|
| `POST /api/owner-meaning-promotion-candidates/generate` | Generate candidate(s) from selected capture(s). | Owner (admin blocked) | INSERT candidate(s) + audit; **no DNA write** | `candidate_generated` / `candidate_generation_skipped` / `candidate_blocked` | No approval; no application; no `mergeVenueDna` | Evidence-bound; venue-scoped captures only; idempotent on fingerprint; one allow-listed path per candidate |
| `POST /api/owner-meaning-promotion-candidates/:candidateId/approve-meaning` | Owner accepts HESTIA's reading (meaning only). | Owner (admin blocked) | UPDATE status + audit; **no DNA write** | `owner_approved_meaning` | **Not** `apply_to_dna`; no `mergeVenueDna` | Stale/terminal → 409; owner-only; meaning-approval ≠ application |
| `POST /api/owner-meaning-promotion-candidates/:candidateId/reject` | Owner declines the candidate. | Owner (admin blocked) | UPDATE status (terminal) + audit | `owner_rejected_candidate` | No DNA effect | Owner-only; idempotent |
| `POST /api/owner-meaning-promotion-candidates/:candidateId/request-revision` | Owner asks for a revised proposal. | Owner (admin blocked) | UPDATE status + audit; new draft supersedes | `owner_requested_revision` (+ later `candidate_superseded`) | No in-place rewrite of evidence | Owner-only; append-only supersession |
| `POST /api/owner-meaning-promotion-candidates/:candidateId/propose-dna-patch` | Prepare a bounded DNA patch for an approved meaning. | Owner (admin blocked) | UPDATE candidate (patch shaped) + audit; **still no DNA write** | `dna_patch_proposed` | **Not** a DNA write | Bounded single-field patch; still `application.blocked` |
| `POST /api/owner-meaning-promotion-candidates/:candidateId/apply-to-dna` | **Reserved/blocked.** The only edge that could write `venue_dna_json`. | Owner (admin blocked) | **Blocked** until §10 prerequisites exist; would call the single reviewed `mergeVenueDna` path | `dna_patch_applied` (reserved) / `application_blocked` until then | Anything before §10 prerequisites | Snapshot/provenance/reversal/confirmation/audit-ledger all required (binding parent #3) |

> Admin/manager remain blocked on every endpoint unless doctrine explicitly changes. The
> `apply-to-dna` endpoint must not exist as a live writer until the §10 prerequisites are met and
> separately reviewed.

---

## 13. Runtime writer boundaries for the future generation slice (4J)

The future candidate writer **may**:

* read owner captures (in-venue, in-concept);
* read current Venue Intelligence / Venue DNA snapshots (read-only, for the "before" value and
  consistency checks);
* create promotion candidate rows (`owner_meaning_promotion_candidates`);
* create `candidate_generated` / `candidate_generation_skipped` / `candidate_blocked` /
  `contradiction_detected` / `missing_evidence_recorded` events (append-only, audit-first).

The future candidate writer **must never**:

* mutate Venue DNA (`venue_intelligence.venue_dna_json`, `venue_briefs`, `venue_dna_enrichment`);
* import or call `mergeVenueDna`;
* mark a candidate approved, reviewed, or applied;
* auto-apply any proposed diff;
* write or rewrite `owner_meaning_captures` (evidence is read-only);
* accept a client-supplied `venue_id`;
* emit `owner_review_opened` from a read path;
* fabricate evidence, prices, KPIs, or operational truth.

> The single-writer invariant holds: the only Venue DNA writer is `mergeVenueDna`, and it is **never**
> invoked from the generation layer in this contract or the 4J slice.

---

## 14. Test requirements for the future implementation

These tests **ship in the same slice as the code they cover** (negative guardrails are never
deferred), mirroring the `test:owner-meaning-promotion-read-*` posture and registering as
`scripts/test-owner-meaning-promotion-generate-*` npm scripts.

* **owner-only generation** — owner can generate; result reads back via the existing GET routes.
* **admin blocked** — admin generate → 403 (re-excluded in-handler); zero rows written.
* **managers / bar_manager blocked** — → 403.
* **unauthenticated blocked** — → 401.
* **venue-scoped** — generation only reads/writes within `req.venueId`.
* **no client `venue_id` widening** — a body/query `venue_id` is ignored; the row's `venue_id` equals
  `req.venueId`.
* **candidate generated from real capture only** — generation requires a resolvable in-venue capture;
  no candidate is created without cited evidence.
* **no fake venue facts** — proposed values trace to cited evidence; a generator that invents a value
  fails the evidence-bound assertion.
* **weak evidence → low/blocked** — thin/ambiguous evidence yields `low` (or blocked) confidence, not
  `medium`/`high`.
* **contradictions recorded** — conflicting evidence populates `contradictions_json` and emits
  `contradiction_detected`; the candidate is not a clean apply-ready proposal.
* **missing evidence recorded** — gaps populate `missing_evidence_json`.
* **proposed_diff never applied** — after generation, `venue_dna_json` is unchanged; `applied_*` and
  `dna_application_ref` are null; `application.blocked: true`.
* **no `mergeVenueDna`** — source-level guard: the generation service neither imports nor calls
  `mergeVenueDna`.
* **no Venue DNA mutation** — `venue_dna_json` byte-identical before/after generation.
* **events append-only** — generation events are inserted, never updated/deleted; audit-first ordering
  preserved.
* **GET remains read-only** — the existing read routes still emit zero events (no `owner_review_opened`)
  after generation exists.
* **idempotency / dedupe** — re-running generation on unchanged evidence finds the existing active
  candidate (same `idempotency_key` / `candidate_fingerprint`); different evidence/target/patch →
  a new row.
* **audit: no SQL mutation in GET** — the read service performs SELECT only (existing 4G/4H tests stay
  green).
* **rendered UI still shows blocked/application state** — a generated candidate renders with
  `application.blocked: true` and `allowed_actions` all false (existing
  `OwnerMeaningPromotionQueue.render.test.jsx` stays green; extend with a seeded generated row).

---

## 15. Slice roadmap after this contract

1. **4J — Candidate Generation Runtime Writer** — the generator service + `generate` route, **no DNA
   mutation**, with the §14 tests in the same commit.
2. **4J.1 — Candidate Generation Route + Audit Tests** — harden route auth, venue scope, idempotency,
   and the source-level no-`mergeVenueDna` / no-DNA-mutation guards.
3. **4K — Owner Review Action Contract** — docs-only contract for `approve-meaning` / `reject` /
   `request-revision` (meaning approval ≠ application).
4. **4L — Owner Review Action Runtime** — the review writers, **still no DNA mutation**.
5. **4M — Controlled Venue DNA Promotion Contract** — docs-only contract for `propose-dna-patch` /
   `apply-to-dna`, specifying the §10 prerequisites concretely.
6. **4N — Controlled Venue DNA Promotion Runtime** — the gated application path, only after every
   §10 / binding-parent-#3 prerequisite exists and is independently reviewed.

---

## 16. Open questions (do NOT resolve silently)

| # | Open question | Recommended default |
|---|---|---|
| 1 | Should generation be manual owner-triggered, automatic after capture, or scheduled? | **Manual / owner-triggered** first (deterministic, owner-visible); revisit automation only once the queue is proven. |
| 2 | Should low-confidence candidates enter the queue or become follow-up questions? | Allow **both**, but prefer **convert-to-question** for very weak evidence; keep blocked/low candidates visible, not silently dropped. |
| 3 | Should promotion candidates target Venue DNA only, or broader Venue Memory / Intelligence? | Start **DNA-target-only** with one narrow path; consider `apply_to_memory` (lower blast radius) before `apply_to_dna` (§10). |
| 4 | Should approval be per field/path or whole candidate? | **Per candidate** (each candidate is already bounded to one path). |
| 5 | Should `apply_to_memory` come before `apply_to_dna`? | **Yes** — a lower-blast-radius memory write is a safer intermediate step than direct DNA promotion. |
| 6 | What is the rollback / versioning model for eventual DNA patching? | OPEN — requires the §10 snapshot/history + audit-diff-ledger (binding parent #3); no DNA write until it exists. |
| 7 | How does this interact with Interpreted Candidates and the existing Venue Learning Engine? | **Read-only corroboration/contradiction only** in 4J; no merge, no shared writer. Revisit a unified model in a later slice. |

---

## Final principle (restated)

> Candidate generation interprets the owner's words into a **proposed, reviewable** change and writes
> only the promotion candidate and its append-only audit. The owner's words stay **evidence**
> (referenced, never relabelled). The proposed diff stays **proposed** (`application.blocked: true`,
> `allowed_actions` all false). Confidence is honest and multi-dimensional, contradictions and
> missing evidence are surfaced rather than hidden, and nothing the generator writes reaches canonical
> Venue DNA. HESTIA may propose; only the owner may approve; approval is still not application; and
> application stays blocked until the snapshot, provenance, reversal, confirmation, and audit-ledger
> infrastructure exists.
