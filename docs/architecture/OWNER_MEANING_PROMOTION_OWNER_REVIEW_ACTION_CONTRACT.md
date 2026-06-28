# HESTIA Owner Meaning Promotion — Owner Review Action Contract (Slice 4K)

> **Status:** Slice 4K — **docs-only owner-review-action contract.** No application code, no review
> runtime, no approve/reject/request-revision/mark-evidence-only/apply writer, no
> `POST`/`PATCH`/`PUT`/`DELETE` route, no UI button, no UI change, no `mergeVenueDna` call, no Venue
> DNA mutation, no DDL/migration change, no event-vocabulary change, no seed/demo data, no
> `owner_review_opened` emission on GET. This document defines the **future owner-review workflow** —
> how a generated promotion candidate becomes owner-decided — so that a later *code* slice (4L) writes
> review actions, not a design. If anything here reads as if a review writer, route, or button already
> exists, that is a documentation defect — report it, do not act on it.
>
> **Source of truth at authoring time:** `origin/main @ 088c838` — *feat: add owner meaning promotion
> candidate generation*. HEAD == origin/main, working tree clean. The capture → read → compose chain
> (4D–4E.2), the **read-only** promotion queue (service + two GET routes + UI, 4G/4H), and the
> **candidate-generation runtime writer** (4J: `ownerMeaningPromotionGenerationService.js` +
> `POST /api/owner-meaning-promotion-candidates/generate`) are complete and verified. The **review**
> layer — anything that records an owner *decision* on a candidate — is **not started.**
>
> **Binding parents (in precedence order — where this contract and a parent differ, the parent wins
> and this file is the bug):**
> 1. `docs/architecture/OWNER_MEANING_PROMOTION_REVIEW_DESIGN.md` (4F) — promotion/review **doctrine**;
>    the four-stage boundary (capture → proposal → approval → application); forbidden/allowed copy lists.
> 2. `docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md` — Venue Memory vs Venue DNA law (candidate
>    vs confirmed; provenance/confidence/role/venue rules; no auto-mutation).
> 3. `docs/architecture/VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md` — the standing decision to
>    DEFER any Venue DNA application until snapshot/history, per-signal provenance, reversible
>    confidence, an owner-confirmation workflow, a reviewed `mergeVenueDna` path, and an audit diff
>    ledger all exist. **This contract inherits that deferral in full.**
> 4. `docs/architecture/OWNER_MEANING_PROMOTION_DDL_CONTRACT.md` (4F.1) — exact **table shape, column
>    names, controlled vocabulary, status lifecycle.** Review writers UPDATE *these* columns and write
>    *these* event types; where this document's status/event language differs from 4F.1, **4F.1 wins**
>    and §11 reconciles the mapping.
> 5. `docs/architecture/OWNER_MEANING_PROMOTION_READ_API_CONTRACT.md` (4F.2) — the read shapes a
>    reviewed candidate must continue to render through, including `allowed_actions` and
>    `application.blocked`.
> 6. `docs/architecture/OWNER_MEANING_PROMOTION_CANDIDATE_GENERATION_CONTRACT.md` (4I) — the
>    generation contract whose §10/§11/§12 forward-declared the review actions this document makes
>    precise.
>
> **Slice-numbering note.** The lineage is 4F → 4F.1 → 4F.2 → 4G/4H (read) → 4I (generation contract)
> → 4J (generation runtime) → **4K (this review-action contract)**. The downstream roadmap (§14) is
> **4L → 4P**. The numbers are labels, not authority — the **binding parents above** govern.

---

## 1. Purpose

**Owner Review Actions** are the owner-facing decisions on generated promotion candidates. A
candidate (a row in `owner_meaning_promotion_candidates`, written by the 4J generator) is HESTIA's
*proposed reading* of the owner's captured words. A review action is the moment the **owner** judges
that proposal: confirms its meaning, rejects it, asks for a revision, or files it as evidence only.
They are the writer behind **stage 3 (approval)** of the 4F four-stage model. Today there is no such
writer; this contract defines what one may and may not do.

The central job of Owner Review Actions is to **separate two questions that must never be collapsed**:

* *"Did HESTIA understand me correctly?"* — answered by `approve_meaning`.
* *"Apply this to my Venue DNA."* — a **separate, later, gated** act (`apply_to_dna`), out of scope
  here, requiring its own contract and runtime (4N/4O).

**Owner Review Actions ARE:**

* **owner-facing decisions** on generated promotion candidates;
* a way to **separate "HESTIA understood me correctly" from "apply this to Venue DNA"**;
* **evidence-bound** — a decision is made against the candidate's cited capture evidence, never
  against invented facts;
* **append-only audited** — every decision writes an immutable `owner_meaning_promotion_events` row;
* **venue-scoped** — every read/write is the server-resolved `req.venueId` only;
* **owner-only by default** — enforced exactly like the capture write (`requireAuth('owner')` plus an
  explicit in-handler admin re-exclusion).

**Owner Review Actions are NOT:**

* automatic Venue DNA mutation;
* a `mergeVenueDna` call;
* AI/system self-approval (HESTIA can suggest; it can never approve its own reading);
* an admin override;
* a manager (or bar_manager/chef/employee) approval;
* generic "task completion";
* irreversible application — approving a *meaning* applies nothing.

> **The boundary this contract protects:** the owner's words stay **evidence** (referenced, never
> relabelled); a generated candidate stays a **proposed reading** (reviewable, rejectable); an owner
> decision records the owner's **judgement of that reading**; and **no review action reaches canonical
> Venue DNA.** HESTIA may propose; only the owner may decide; deciding the meaning is still not
> applying it; and application stays blocked until the §7 / binding-parent-#3 infrastructure exists.

---

## 2. Core principle — `approve_meaning` is not `apply_to_dna`

This is the load-bearing distinction of the entire review layer. State it as law:

* **`approve_meaning`** — the owner confirms the candidate **correctly captures their intent/meaning**.
  It records *"yes, HESTIA, that is what I meant."* It is **not** a DNA write, **not** an instruction
  to change anything operational, and **not** a promise that anything downstream will happen
  automatically. After `approve_meaning`, `application.blocked` is **still `true`** (§7).

* **`apply_to_dna`** — a **future, explicit, separately-contracted, controlled mutation** of Venue DNA
  via the single reviewed `mergeVenueDna` writer, gated on every §7 / binding-parent-#3 prerequisite.
  It is the **only** act that could ever cross into `venue_intelligence.venue_dna_json`. It is **out
  of scope for 4L** unless separately and explicitly approved (§5.G, §14).

The other three review actions:

* **`reject_candidate`** — the owner says the candidate is **wrong, irrelevant, unsafe, or not
  useful.** A terminal decision; the candidate never advances.
* **`request_revision`** — the owner wants HESTIA to **reinterpret or ask for clarification.** The
  current candidate is parked; a future regenerated candidate supersedes it (append-only; the evidence
  and the original candidate are never edited in place).
* **`mark_evidence_only`** — the owner says the candidate should **remain as memory/evidence, not be
  promoted toward DNA.** It stays visible and referenceable, but is explicitly off the DNA-promotion
  path.

> **Approving the meaning is the cheapest, safest, lowest-blast-radius decision.** It changes a status
> and writes an audit row. It does not touch DNA, does not unblock application, and does not imply
> consent to any future DNA write. A separate, deliberate `apply_to_dna` act — under a contract that
> does not yet exist — is the only thing that ever could.

---

## 3. Actor model

Owner identity is an **ownership** decision, not a technical one. The model mirrors the existing
owner-only capture/promotion gates exactly.

| Actor | View queue/candidate | `approve_meaning` / `reject_candidate` / `request_revision` / `mark_evidence_only` | `propose_dna_patch` / `apply_to_dna` |
|---|---|---|---|
| **owner** | ✅ | ✅ (owner-only) | ❌ (future, gated — §5.F/G) |
| **admin** | ❌ default (OPEN, blocked) | ❌ **explicitly blocked** (in-handler re-exclusion → 403) | ❌ |
| **manager** | ❌ | ❌ | ❌ |
| **bar_manager** | ❌ | ❌ | ❌ |
| **chef** | ❌ | ❌ | ❌ |
| **employee** | ❌ | ❌ | ❌ |
| **AI / system** | n/a (produces drafts; does not "decide") | ❌ **never** (cannot approve its own reading) | ❌ |

**Default doctrine:**

* **Owner-only review actions.** Every review writer is `requireAuth('owner')` **plus** an explicit
  in-handler re-exclusion of the platform-admin global bypass (`req.user.role === 'admin'` → 403),
  exactly as the capture write/read routes do.
* **Admin is explicitly blocked unless future doctrine changes.** Whether admin may even *read* the
  queue is OPEN (4F.2 §14); the safe default is **blocked**. Admin must never be the actor on a review
  decision in 4L.
* **Non-owner roles (manager, bar_manager, chef, employee) are blocked** — a different trust class
  (operational truth, not owner identity meaning); never widened into this surface.
* **AI/system cannot approve itself.** A generation event carries `actor_type: hestia_suggestion` /
  `system` with a null user id (4F.1 §4.1); an owner-decision event carries `actor_type: owner` with
  the owner's user id. The two are structurally distinguishable, and only the second class may carry
  a decision.
* **A client-supplied `venue_id` cannot widen access.** Venue scope is the server-resolved
  `req.venueId` only; a body/query `venue_id` is ignored and never broadens the actor's reach.

---

## 4. Candidate states (future state machine)

This is the **future** review state machine. **Not all states exist in the current runtime.** The
current DDL (4F.1 §5) ships a fixed `status` vocabulary; some states this section names are
*conceptual review states* that would require a **separate reviewed DDL slice** before they can be
stored (flagged **future-only / needs DDL** below and reconciled to real columns in §11). Declaring a
state here does **not** create it.

### 4.1 States

| Conceptual state | Backing 4F.1 `status` | Exists in runtime today? | Meaning |
|---|---|---|---|
| `queued` | `draft_suggestion` | ✅ (4J writes this) | Generated draft, not yet surfaced for decision. |
| `blocked` | expressed via `application.blocked` + `status_reason` (no distinct status) | ✅ (application always blocked) | Cannot advance to a clean apply posture. **Not a stored `status` value** — it is an application/posture flag, not a lifecycle status. |
| `review_ready` | `needs_owner_review` | ⚠️ status exists in DDL; **no writer surfaces it yet** (4J leaves candidates at `draft_suggestion`) | Surfaced to the owner; awaiting a decision. |
| `owner_meaning_approved` | `owner_approved` (current) | ⚠️ status exists in DDL; **no writer sets it yet** | Owner confirmed HESTIA's reading. **Meaning approved ≠ applied.** A first-class `owner_meaning_approved` status/event distinct from `owner_approved` is **future-only / needs DDL** (§11). |
| `rejected` | `owner_rejected` | ⚠️ status exists in DDL; no writer yet | Owner declined; terminal. |
| `revision_requested` | `revision_requested` | ⚠️ status exists in DDL; no writer yet | Owner asked for a reinterpretation; parked pending a superseding regeneration. |
| `evidence_only` | **future-only / needs DDL** (no 4F.1 status) | ❌ | Owner filed the candidate as memory/evidence, off the DNA-promotion path. |
| `superseded` | `superseded` | ⚠️ status exists in DDL; no writer yet | A newer candidate replaced this one. |
| `dna_patch_proposed` | **future-only / needs DDL** (no 4F.1 status) | ❌ | A bounded DNA patch was prepared from an approved meaning (4N). |
| `dna_applied` | reserved `applied_to_dna_future` (4F.1 §5, unreachable) | ❌ (reserved/blocked) | A real Venue DNA write occurred (4O, gated on §7). |

### 4.2 Legal transitions (future)

```
queued ─▶ review_ready ─▶ owner_meaning_approved ─▶ dna_patch_proposed ─▶ dna_applied
  │            │                  │                       (4N)              (4O, gated §7)
  │            ├─▶ rejected        ├─▶ evidence_only
  │            ├─▶ revision_requested ─▶ (new draft) supersedes ▶ superseded
  │            └─▶ evidence_only
  ├─▶ rejected
  ├─▶ revision_requested
  └─▶ evidence_only
```

* `queued → owner_meaning_approved` / `queued → rejected` / `queued → revision_requested` /
  `queued → evidence_only` — direct decisions are legal (a candidate may be decided whether or not a
  distinct surfacing step set `review_ready` first).
* `review_ready → owner_meaning_approved | rejected | revision_requested | evidence_only` — the
  standard decision fan-out.
* `owner_meaning_approved → dna_patch_proposed` — **future-only (4N)**; never automatic.
* `revision_requested → superseded` — when a regenerated candidate replaces the parked one.

### 4.3 Illegal transitions (must be rejected)

* `owner_meaning_approved` does **NOT** automatically become `dna_applied`. Approval of meaning never
  cascades into application. (Binding.)
* `rejected` cannot become `dna_applied` (or `dna_patch_proposed`) **without a new candidate or a
  revision.** A rejected reading is dead; only fresh evidence/regeneration revives the path.
* `revision_requested` cannot become `dna_applied` — it must first produce a new candidate that is
  itself approved.
* `evidence_only` cannot become `dna_applied` directly — it is off the DNA path by the owner's choice
  (whether it is fully terminal is OPEN, §15).
* `superseded` / `rejected` are terminal — no further transitions except via a new (superseding)
  candidate.
* **A `GET` cannot change any state** — reads are pure (4F.2 §12); no review action is ever a read
  side effect, and `owner_review_opened` is never emitted from a GET.
* Any transition into `dna_patch_proposed` / `dna_applied` is illegal until the §7 prerequisites exist
  and a separate contract (4N) enables them.

---

## 5. Review action definitions

For each future action: *purpose · actor · input payload · validation · candidate status requirements
· write behavior · event behavior · response shape · non-goals · risks.* **None is built in this
slice.** Each mirrors the established route posture: `requireAuth('owner')` + explicit in-handler
admin re-exclusion; `req.venueId` scoping; cross-venue id → safe 404; unauthenticated → 401.

### A. `approve_meaning`

* **Purpose.** Owner confirms the candidate correctly captures their intent/meaning. **Not** an
  application.
* **Actor.** Owner only (admin → 403; non-owner → 403).
* **Input payload.** `{ confirm: true, note? }`. **No free-form DNA, no patch, no `venue_id`, no
  `status`, no `applied_*` in the body.** A confirmation token is recommended (Phase 7B §10) for
  parity with future irreversible actions, though approving a meaning is itself reversible-by-supersession.
* **Validation.** Candidate must be reviewable (`queued`/`draft_suggestion` or
  `review_ready`/`needs_owner_review`). A terminal/stale candidate → 409. Cross-venue/unknown → 404.
* **Candidate status requirements.** `draft_suggestion` | `needs_owner_review`.
* **Write behavior.** UPDATE `status` → `owner_approved` (see §11 re: a distinct
  `owner_meaning_approved`), set `reviewed_by_user_id`, `reviewed_at`, `approved_at`,
  `owner_decision_note?`, `updated_at`. **No DNA write. No `mergeVenueDna`.**
* **Event behavior.** Append `owner_approved` (4F.1 vocabulary; a distinct `owner_meaning_approved`
  type is future-only / needs DDL, §11), audit-first, `actor_type: owner`.
* **Response shape.** `{ ok: true, candidate: <shaped, application.blocked: true>, note: "Approved. Not applied to your Venue DNA." }`.
* **Non-goals.** Not `apply_to_dna`; not `propose_dna_patch`; no DNA effect; does not unblock
  application.
* **Risks.** The owner (or a future UI) mistaking meaning-approval for application — mitigated by
  copy (§10), the unchanged `application.blocked: true`, and `allowed_actions.apply_to_dna: false`.

### B. `reject_candidate`

* **Purpose.** Owner declares the candidate wrong, irrelevant, unsafe, or not useful.
* **Actor.** Owner only.
* **Input payload.** `{ note? }` (whether a reason is required is OPEN, §15).
* **Validation.** Reviewable status required; terminal → 409; cross-venue → 404.
* **Candidate status requirements.** `draft_suggestion` | `needs_owner_review`.
* **Write behavior.** UPDATE `status` → `owner_rejected` (terminal), set `reviewed_by_user_id`,
  `reviewed_at`, `rejected_at`, `owner_decision_note?`, `updated_at`. No DNA effect.
* **Event behavior.** Append `owner_rejected`, audit-first, `actor_type: owner`.
* **Response shape.** `{ ok: true, candidate: <status owner_rejected> }`.
* **Non-goals.** No DNA effect; no regeneration (rejecting does not auto-create a new candidate).
* **Risks.** Losing the owner's stated reason if `note` is optional — see §15.

### C. `request_revision`

* **Purpose.** Owner wants HESTIA to reinterpret or ask for clarification.
* **Actor.** Owner only.
* **Input payload.** `{ note }` (what to revise; likely required).
* **Validation.** Reviewable status required; terminal → 409; cross-venue → 404.
* **Candidate status requirements.** `draft_suggestion` | `needs_owner_review`.
* **Write behavior.** UPDATE `status` → `revision_requested`, set review fields + `updated_at`. The
  candidate is **parked, never edited in place**; a future regeneration creates a **new** candidate
  that supersedes it (sets `superseded_by_candidate_id`, old row → `superseded`). Append-only.
* **Event behavior.** Append `owner_requested_revision` (4F.1: `owner_requested_revision`), audit-first;
  later `candidate_superseded` when the new draft lands.
* **Response shape.** `{ ok: true, candidate: <status revision_requested> }`.
* **Non-goals.** No in-place rewrite of evidence or of the original candidate; no DNA effect.
* **Risks.** Whether revision updates the existing candidate or creates a new one is OPEN (§15);
  recommended: **new candidate, supersession** (append-only, consistent with the capture layer).

### D. `mark_evidence_only`

* **Purpose.** Owner files the candidate as memory/evidence, explicitly off the DNA-promotion path.
* **Actor.** Owner only.
* **Input payload.** `{ note? }`.
* **Validation.** Reviewable status required; cross-venue → 404.
* **Candidate status requirements.** `draft_suggestion` | `needs_owner_review`.
* **Write behavior.** UPDATE `status` → `evidence_only` (**future-only / needs DDL** — no 4F.1 status
  value exists yet; until the DDL adds it, this action cannot be implemented, §11). Sets review fields
  + `updated_at`. No DNA effect.
* **Event behavior.** Append `owner_marked_evidence_only` (**future-only / needs DDL** — not in 4F.1
  §4.2 vocabulary, §8).
* **Response shape.** `{ ok: true, candidate: <status evidence_only> }`.
* **Non-goals.** Never advances toward DNA; whether it is terminal is OPEN (§15).
* **Risks.** Requires new status + event vocabulary — must wait on a reviewed DDL slice; do not
  shoehorn into an existing status.

### E. `reopen` / `supersede` (if needed)

* **Purpose.** Replace a parked/stale candidate with a fresh one, or (if ever allowed) reopen a
  decision. Supersession is the append-only mechanism; in-place reopen of a terminal decision is
  **discouraged** (OPEN, §15 — recommended supersede-only).
* **Actor.** System (regeneration) emits the supersession link; owner triggers regeneration. No owner
  "un-reject" in the default doctrine.
* **Write behavior.** A new candidate sets `superseded_by_candidate_id` on the old row; old row →
  `superseded`. Append-only; the old candidate and its evidence are never edited.
* **Event behavior.** `candidate_superseded` (4F.1 §4.2).
* **Non-goals.** No in-place mutation of a terminal candidate; no DNA effect.
* **Risks.** Reopen-in-place would break the append-only invariant — avoid.

### F. `propose_dna_patch` (future only)

* **Purpose.** Prepare a bounded single-field DNA patch for an `owner_meaning_approved` candidate.
* **Actor.** Owner only.
* **Status requirement.** `owner_meaning_approved` only.
* **Write behavior.** UPDATE candidate (patch shaped) + audit; **still no DNA write**;
  `application.blocked` remains `true`.
* **Event behavior.** `dna_patch_proposed` (**future-only / needs DDL**, 4N).
* **Non-goals.** **Not** a DNA write. Out of scope until the 4N contract exists.
* **Risks.** Must not be mistaken for application; `apply_to_dna` stays unavailable.

### G. `apply_to_dna` (future only — explicitly out of scope for 4L unless separately approved)

* **Purpose.** The **only** edge that could ever write `venue_intelligence.venue_dna_json`, via the
  single reviewed `mergeVenueDna` path.
* **Actor.** Owner only, with dual confirmation.
* **Status requirement.** `dna_patch_proposed` (future).
* **Write behavior.** **BLOCKED** until **all** §7 / binding-parent-#3 prerequisites exist and are
  independently reviewed. A premature attempt emits `application_blocked`, never a write.
* **Event behavior.** `dna_patch_applied` / `applied_to_dna_future` — **reserved/blocked** (4F.1 §5).
* **Non-goals.** Anything before the §7 prerequisites. **Out of scope for 4L unless separately and
  explicitly approved.** Defined by the future 4N/4O contracts, not here.
* **Risks.** The highest-blast-radius act in the entire system — it must remain unbuildable until its
  own contract and the snapshot/provenance/reversal/confirmation/audit-ledger infrastructure exist.

---

## 6. `allowed_actions` semantics

`allowed_actions` is the server-computed, read-only hint the future UI uses to know which controls are
available (4F.2 §4.3). **In the current runtime every action is `false`** — generation creates a row
the owner can *see*, not one they can *act on* yet.

**Future evolution (once the 4L runtime exists):**

| Action | Becomes `true` when… |
|---|---|
| `view` | candidate is owner-readable (always true for the owner in their venue). |
| `approve_meaning` | candidate is **reviewable** (`draft_suggestion` / `needs_owner_review`, not terminal/stale). |
| `reject_candidate` | candidate is reviewable. |
| `request_revision` | candidate is reviewable. |
| `mark_evidence_only` | candidate is reviewable. |
| `propose_dna_patch` | **`false`** until the controlled DNA-patch contract (4N) exists. |
| `apply_to_dna` | **`false`** until the controlled DNA-application contract (4O / §7) exists. |

**Rules (binding):**

* **`allowed_actions` must be computed server-side** from the candidate's status, venue scope, and
  the actor's role. The UI must **not** infer permission from candidate fields.
* **Disabled actions should explain why** (e.g. "already decided", "application not enabled yet"),
  surfaced as a reason the UI can render — never a silently greyed control.
* **Blocked candidates remain blocked** until their requirements are met; no action flips them to a
  DNA-writable posture.
* The current read contract (4F.2) keeps **all** actions `false`; the 4L runtime may flip the first
  five for a reviewable candidate, but `propose_dna_patch` and `apply_to_dna` stay `false` until their
  own contracts ship.

---

## 7. `application.blocked` semantics

`application.blocked` describes whether the proposed diff may reach Venue DNA (surfaced in the read as
`application.blocked` + `application.block_reason`, 4F.2 §3.2/§4.2).

**Current rule (binding):** `application.blocked` is **`true`** for every candidate, before and after
any review action defined here. **A review action never sets it `false`.**

**Future — `application.blocked` remains `true` when:**

* no owner meaning approval (`owner_meaning_approved` not reached);
* a contradiction is unresolved (§8 of 4I);
* missing evidence is severe;
* the target path is protected (a do-not-change / guardrail target, 4I §4);
* the DNA mutation contract is not enabled;
* `apply_to_dna` is unavailable (§7 prerequisites unmet);
* the candidate is `evidence_only`;
* the candidate is `rejected`;
* the candidate is `superseded`.

**`application.blocked` may become `false` only under a future controlled DNA promotion contract
(4N/4O)** that satisfies **all** of the following (inherited from Phase 7B / binding parent #3):

* a Venue DNA **snapshot / history** (a restore target);
* **per-signal provenance** in Venue DNA (or a distinct derived-signals layer);
* a **reversible / corrective confidence path** (today `mergeVenueDna` confidence is monotonic +
  floored — irreversible);
* an **owner-confirmation workflow** (dual confirmation);
* a **reviewed `mergeVenueDna` application path** (single writer, additive array reconstruction —
  never a partial array that clobbers owner signals);
* an **audit diff ledger** (before/after, applied delta, confidence before/after, owner confirmation).

Until then: `applied_at`, `applied_by_user_id`, `dna_application_ref` stay null, and a premature apply
attempt emits `application_blocked`, never a write.

---

## 8. Event / audit contract

> **No DDL change in this slice.** This section defines the **desired future** event vocabulary and is
> explicit about the current limitation. Expanding the event vocabulary is a **separate reviewed DDL
> slice**, not part of 4K or 4L unless that DDL slice ships first.

### 8.1 Desired future event types

| Event type | Emitted when | Status today |
|---|---|---|
| `owner_meaning_approved` | Owner confirms HESTIA's reading (distinct from `owner_approved`). | **future-only / needs DDL** — 4F.1 §4.2 currently has `owner_approved`, not a meaning-specific type. |
| `owner_rejected_candidate` | Owner declines the candidate. | maps to 4F.1 `owner_rejected` today; a distinct name is future-only. |
| `owner_requested_revision` | Owner asks for a reinterpretation. | exists in 4F.1 §4.2 (`owner_requested_revision`). |
| `owner_marked_evidence_only` | Owner files as evidence only. | **future-only / needs DDL** — not in 4F.1 §4.2. |
| `candidate_superseded` | A newer candidate replaced this one. | exists in 4F.1 §4.2. |
| `dna_patch_proposed` | A bounded DNA patch was proposed (4N). | **future-only / needs DDL.** |
| `dna_patch_applied` | A real Venue DNA write occurred (4O). | reserved as `applied_to_dna_future` (4F.1 §5), unreachable. |

### 8.2 Current 4J limitation (must be respected)

* The DDL audit vocabulary (4F.1 §4.2, enforced by a CHECK) does **not** contain distinct
  `candidate_generated` or `candidate_generation_skipped` event types. The 4J generator therefore
  stores `event_type: candidate_created` and carries the generation semantics in the event payload's
  `reason: 'candidate_generated'`
  (`ownerMeaningPromotionGenerationService.js`).
* A **skipped** generation writes **no event row** (the closed CHECK vocabulary is not widened, and
  there is no allowed "skipped" type to emit).
* **Any first-class skipped/generated/review event vocabulary change must be handled in a separate
  reviewed DDL slice** — never silently bolted onto 4L. The 4L review runtime should, where possible,
  reuse the **existing** 4F.1 event types (`owner_approved`, `owner_rejected`,
  `owner_requested_revision`, `candidate_superseded`) and carry any finer semantics in the event
  payload `reason`, exactly as 4J does — until a DDL slice formally adds the richer vocabulary.

### 8.3 Audit requirements (binding)

Every review decision writes one **append-only** `owner_meaning_promotion_events` row, **audit-first**
(4F.1 §7.5 — the event INSERT precedes the candidate UPDATE; node:sqlite has no `db.transaction()`, so
ordering is the consistency guarantee). Each row records:

* **actor id + role** (`actor_user_id`, `actor_role`) — owner-decision rows carry `actor_type: owner`;
* **venue scope** (`venue_id` = `req.venueId`);
* **candidate id** (`candidate_id`, a logical ref — no enforced FK);
* **capture id(s) / source refs** where relevant (`source_capture_ids_json`);
* **previous status** (`previous_status`) and **next status** (`next_status`);
* **reason** (in `event_payload_json`).

Invariants:

* **A client cannot supply `venue_id` authority** — it is server-resolved.
* **AI/system-generated events are distinguishable from owner actions** — generation events carry
  `actor_type: hestia_suggestion` / `system` (null user id); owner decisions carry `actor_type: owner`
  with the owner's user id.
* **Append-only** — events are never updated, never deleted; an orphan audit row after a failed
  candidate UPDATE is benign, an un-audited state change is a bug.

---

## 9. Future API contract outline (describe only — do NOT implement)

No endpoint below is built in this slice. Each mirrors the established route posture:
`requireAuth('owner')` + explicit in-handler admin re-exclusion (admin → 403); `req.venueId` scoping;
cross-venue id → safe 404; unauthenticated → 401; no client-supplied `venue_id`.

| Endpoint | Purpose | Actor | Payload | Validation | Writes | Events | Non-goals | Blocked behavior |
|---|---|---|---|---|---|---|---|---|
| `POST …/:candidateId/approve-meaning` | Owner confirms HESTIA's reading. | Owner (admin 403) | `{ confirm, note? }` | reviewable status; else 409; cross-venue 404 | UPDATE status → `owner_approved` + review fields + audit; **no DNA** | `owner_approved` (future `owner_meaning_approved`) | not `apply_to_dna`; no `mergeVenueDna` | `application.blocked` stays `true` |
| `POST …/:candidateId/reject` | Owner declines. | Owner (admin 403) | `{ note? }` | reviewable; terminal → 409 | UPDATE status → `owner_rejected` (terminal) + audit | `owner_rejected` | no DNA effect; no auto-regeneration | n/a (terminal) |
| `POST …/:candidateId/request-revision` | Owner asks for reinterpretation. | Owner (admin 403) | `{ note }` | reviewable; terminal → 409 | UPDATE status → `revision_requested` + audit; new draft supersedes later | `owner_requested_revision` (+ later `candidate_superseded`) | no in-place rewrite of evidence; no DNA | parked, not applied |
| `POST …/:candidateId/mark-evidence-only` | Owner files as evidence only. | Owner (admin 403) | `{ note? }` | reviewable; cross-venue 404 | UPDATE status → `evidence_only` (**needs DDL**) + audit | `owner_marked_evidence_only` (**needs DDL**) | never advances to DNA | off the DNA path; blocked |
| `POST …/:candidateId/propose-dna-patch` | Prepare a bounded patch (future, 4N). | Owner (admin 403) | `{ confirm }` | status `owner_meaning_approved` only | UPDATE candidate (patch shaped) + audit; **no DNA** | `dna_patch_proposed` (**needs DDL**) | **not** a DNA write | `application.blocked` stays `true` |
| `POST …/:candidateId/apply-to-dna` | **Reserved/blocked** (future, 4O). | Owner (admin 403) | `{ confirm, confirmation_token }` | **blocked** until §7 prerequisites | none until §7; then the single reviewed `mergeVenueDna` path | `application_blocked` until then; `dna_patch_applied` reserved | anything before §7 | emits `application_blocked`, never writes |

> Admin/manager/bar_manager/chef/employee remain blocked on every endpoint unless doctrine explicitly
> changes. The `apply-to-dna` endpoint must not exist as a live writer until the §7 prerequisites are
> met and separately reviewed (4O).

---

## 10. Review UI implications (describe only — do NOT implement)

A future **Owner Review** surface (a depth layer reachable from Owner AI Home / Owner Reports, never
the default landing — consistent with the Phase 1 role-based nav posture). **No UI is built in this
slice.**

**The UI should:**

* show the **source evidence** — the owner's verbatim captures, resolved live (never paraphrased);
* show the **proposed diff** — current value → proposed value, field-scoped;
* show **confidence / missing evidence / contradictions** as reasons, never as a bare number;
* show **why application is blocked** (`application.block_reason`);
* show **allowed actions from the server only** (`allowed_actions`), never inferred client-side;
* **distinguish `approve_meaning` from `apply_to_dna`** — visually and in copy;
* require a **deliberate owner action** (no accidental one-tap apply);
* **never hide** missing evidence or contradictions, including after approval;
* **never imply DNA changed** when only the meaning was approved.

**The UI must not:**

* display an **Apply to DNA** control until the controlled DNA promotion contract (4O) exists;
* treat **approval as application** (no "applied" / "confirmed" / "DNA updated" copy after
  `approve_meaning`);
* allow **admin/manager/bar_manager/chef/employee** actions;
* **silently mutate DNA**;
* use **scary or over-confident** copy ("HESTIA knows", "automatically learned", "truth", any
  confidence number/meter, any success-green "confirmed" state before approval).

**Allowed copy** (per 4F §9): `proposed update`, `owner review required`, `supported by owner
evidence`, `confidence`, `missing evidence`, `not applied yet`, `reject proposal`, `request revision`,
and for approval: **"Approved. This is not applied to your Venue DNA yet."**

---

## 11. Data model implications

**Can the current schema (4F.1) support the first review actions?** Partially — three of the four
core review actions reuse existing structure; one (`mark_evidence_only`) needs DDL.

### 11.1 Already supported by 4F.1 (no DDL needed for 4L)

* **`status` column** — supports `owner_approved`, `owner_rejected`, `revision_requested`,
  `superseded` (all in 4F.1 §5).
* **Review metadata columns** — `reviewed_by_user_id`, `reviewed_at`, `owner_decision_note`,
  `approved_at`, `rejected_at`, `superseded_by_candidate_id`, `updated_at` (4F.1 §3.1) — exactly the
  fields the approve/reject/request-revision writers set.
* **`application_json` shape** — `application.blocked` / `application.block_reason` already render
  blocked (4F.2); a review action leaves them `true`.
* **`allowed_actions_json` shape** — the read already forward-declares the action set (4F.2 §4.3); the
  4L writer computes them server-side instead of hard-coding `false`.
* **Event rows** — `owner_approved`, `owner_rejected`, `owner_requested_revision`,
  `candidate_superseded` are all in the 4F.1 §4.2 CHECK vocabulary, with `previous_status` /
  `next_status` / `event_payload_json` / `reason` columns present.

### 11.2 Requires a future, separately-reviewed DDL slice (do NOT add here)

* **A first-class `owner_meaning_approved` status/event distinct from `owner_approved`** — if product
  wants the meaning-approval to be storage-distinct from a future apply-approval. Until then, reuse
  `owner_approved` + payload `reason`.
* **`evidence_only` status + `owner_marked_evidence_only` event** — neither is in 4F.1 §5 / §4.2.
  `mark_evidence_only` **cannot be implemented** until a DDL slice adds them (status CHECK + event
  CHECK).
* **`dna_patch_proposed` status + event** and the **`dna_applied`** activation of the reserved
  `applied_to_dna_future` — future (4N/4O), gated on §7.
* **A unique DB index for `candidate_fingerprint`** — current idempotency is service-layer
  check-then-insert (4J); a unique index can be considered later if concurrency becomes relevant
  (single-threaded node:sqlite makes it non-urgent).
* **Review metadata columns** beyond those in §11.1 (e.g. a structured reject-reason enum) — only if a
  reason vocabulary is formalized (§15 OPEN).
* **`status` CHECK vocabulary expansion** — any new status value must be added to the CHECK in a
  reviewed DDL slice; the 4L runtime must not write a status the CHECK forbids.

> **Do not add any DDL in this slice.** Every item in §11.2 is a flag for a future reviewed DDL slice.

---

## 12. Safety rules (invariants)

* **No owner review action can mutate Venue DNA.**
* **No action can call `mergeVenueDna`** (or import anything DNA-writing).
* **Rejected candidates cannot be applied.**
* **`revision_requested` candidates cannot be applied.**
* **`approve_meaning` only approves interpretation, not application** — `application.blocked` stays
  `true`.
* **A future `apply_to_dna` must require a separate explicit owner action** under its own contract
  (4O) and the §7 prerequisites.
* **All writes are venue-scoped** to `req.venueId`; no client-supplied `venue_id` widens scope.
* **Admin remains blocked** (in-handler re-exclusion → 403) unless doctrine changes; non-owner roles
  blocked.
* **GET remains read-only** — no review action is a read side effect; no `owner_review_opened` from a
  GET.
* **Missing evidence and contradictions remain visible after approval** — approving a meaning does not
  erase or hide its caveats.
* **History is append-only** — events are never updated or deleted; corrections create new
  (superseding) rows.

---

## 13. Test requirements for the future runtime (4L)

These tests **ship in the same slice as the code they cover** (negative guardrails are never
deferred), mirroring the `test:owner-meaning-promotion-*` posture and registering as
`scripts/test-owner-meaning-promotion-review-*` npm scripts.

* **owner can approve meaning** — owner approve → 200; status → `owner_approved`; review fields set.
* **owner can reject** — owner reject → 200; status → `owner_rejected` (terminal).
* **owner can request revision** — owner request-revision → 200; status → `revision_requested`.
* **admin blocked** — admin approve/reject/request-revision → 403; zero rows touched.
* **manager / bar_manager / chef / employee blocked** — → 403.
* **unauthenticated blocked** — → 401.
* **client `venue_id` cannot widen access** — a body/query `venue_id` is ignored; the row stays in
  `req.venueId`.
* **cross-venue candidate cannot be reviewed** — foreign candidate id → safe 404, zero rows touched.
* **valid status transitions** — reviewable → decided transitions succeed.
* **illegal transitions rejected** — approve/reject on a terminal/`superseded`/`expired` candidate →
  409; no transition into `dna_applied` from `owner_meaning_approved`/`rejected`/`revision_requested`.
* **events append-only** — each decision inserts one event, audit-first; events never updated/deleted.
* **previous/next status recorded** — `previous_status` / `next_status` set on every decision event.
* **`allowed_actions` updated server-side** — a reviewable candidate reports the review actions
  available; a decided one does not; the UI never infers them.
* **`application.blocked` remains true after `approve_meaning`** — approval does not unblock
  application.
* **no Venue DNA mutation** — `venue_dna_json` byte-identical before/after any review action.
* **no `mergeVenueDna`** — source-level guard: the review service neither imports nor calls it.
* **no `apply_to_dna` endpoint in 4L** unless explicitly approved separately.
* **GET routes remain read-only** — the existing read routes still emit zero events (no
  `owner_review_opened`) after the review writers exist (4G/4H tests stay green).
* **UI render tests distinguish `approve_meaning` from Apply to DNA** — if/when the 4M UI is added,
  no "Apply to DNA" control renders, and approval copy never implies application.

---

## 14. Slice roadmap after this contract

1. **4L — Owner Review Action Runtime** — the `approve-meaning` / `reject` / `request-revision`
   writers + routes, **no DNA mutation**, reusing 4F.1 event vocabulary, with the §13 tests in the
   same commit. (`mark_evidence_only` deferred until its DDL exists, §11.2.)
2. **4L.1 — Push + Remote Verification** — owner-decision notifications and remote verification of the
   review flow.
3. **4M — Owner Review UI** — the review surface (queue, evidence drawer, proposed diff, decision
   controls), **still no Apply to DNA** unless the controlled DNA contract allows it.
4. **4N — Controlled Venue DNA Promotion Contract** — docs-only contract for `propose-dna-patch` /
   `apply-to-dna`, specifying the §7 prerequisites concretely and the new status/event DDL needed.
5. **4O — Controlled Venue DNA Promotion Runtime** — the gated application path, only after every §7 /
   binding-parent-#3 prerequisite exists and is independently reviewed.
6. **4P — DNA Promotion UI / owner confirmation** — the owner-facing dual-confirmation apply surface.

---

## 15. Open questions (do NOT resolve silently)

| # | Open question | Recommended default |
|---|---|---|
| 1 | Should an approved meaning update candidate status only, or also create a Venue Memory artifact? | **Status only** in 4L (lowest blast radius); a Venue Memory artifact is a separate, later step. |
| 2 | Should `reject` require a reason? | OPEN. Recommend **optional `note`** in 4L; formalize a reason enum only if reporting needs it (would need DDL, §11.2). |
| 3 | Should `request_revision` create a new candidate or update the existing one? | **New candidate, supersession** (append-only; the original is never edited in place). |
| 4 | Should `evidence_only` be a terminal state? | OPEN. Lean **terminal** (off the DNA path by owner choice); revisit if owners need to re-promote evidence later. Needs DDL either way (§11.2). |
| 5 | Should admin ever review in enterprise/team settings? | OPEN. Default **blocked**; any delegation is a separate, explicit, audited design. |
| 6 | Should `allowed_actions` be persisted or computed? | **Computed server-side** per request from status + role + venue; do not persist a permission snapshot. |
| 7 | How should event vocabulary be expanded safely? | Via a **separate reviewed DDL slice** that widens the CHECK; until then reuse 4F.1 types + payload `reason` (as 4J does). |
| 8 | Should `apply_to_memory` exist before `apply_to_dna`? | **Yes** — a lower-blast-radius memory write is a safer intermediate step than direct DNA promotion (4I §16). |
| 9 | Should a candidate require two-step confirmation before DNA patching? | **Yes** — dual confirmation is a §7 prerequisite for any future `apply_to_dna` (Phase 7B §10). |

---

## Final principle (restated)

> An Owner Review Action records the **owner's judgement** of a proposed reading and writes only the
> candidate's status and its append-only audit. The owner's words stay **evidence** (referenced, never
> relabelled). `approve_meaning` confirms *"HESTIA understood me"* — it is **not** *"apply this to my
> Venue DNA"*; `application.blocked` stays `true`, `allowed_actions.apply_to_dna` stays `false`, and no
> review writer imports or calls `mergeVenueDna`. Rejected and revision-requested candidates can never
> be applied; missing evidence and contradictions stay visible after approval; history is append-only;
> and Venue DNA application stays blocked until the snapshot, provenance, reversal, confirmation, and
> audit-ledger infrastructure — and its own separate contract — exist. HESTIA may propose; only the
> owner may decide; deciding the meaning is still not applying it.
