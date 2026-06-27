# HESTIA Owner Meaning Promotion / Review — Design Spec (Slice 4F)

> **Status:** Slice 4F — **docs-only design/spec.** No application code, no backend route, no
> frontend UI, no database migration, no promotion queue, no approval writer, no `mergeVenueDna`
> call, no Venue DNA mutation, no new service, no new API, no new product behavior. This document
> designs the **future** promotion/review path so the next slice can implement from it without
> guessing. **Everything described as "proposed" is unbuilt.** If anything here reads as if a
> table, route, or write already exists, that is a documentation defect — report it, do not act
> on it.
>
> **Source of truth at authoring time:** `origin/main @ 124b0f9` — *test owner meaning capture
> composer rendered behavior*. HEAD == origin/main, working tree clean. The capture → read →
> compose chain (4D–4E.2) is complete and verified; promotion is **not** started.
>
> **Binding parents (in precedence order — where this spec and a parent differ, the parent wins
> and this file is the bug):**
> 1. `docs/architecture/OWNER_MEANING_CAPTURE_DESIGN.md` (4A) — Owner Meaning Capture doctrine.
> 2. `docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md` — Venue Memory vs Venue DNA law.
> 3. `docs/architecture/VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md` — the **`mergeVenueDna`
>    safety review** and the existing decision to DEFER promotion until snapshot/audit, provenance,
>    reversible confidence, and an owner-confirmation workflow exist. **This spec inherits that
>    decision in full.**
> 4. `docs/architecture/OWNER_MEANING_CAPTURE_DDL_CONTRACT.md` (4C.2) — the capture-layer DDL the
>    promotion layer reads *from* but never writes *to*.
>
> **Naming:** this is **Owner Meaning Promotion**. It is the separate, later, owner-gated act that
> turns captured owner evidence into a *proposed* Venue DNA change and routes it through owner
> review. It is **not** Owner Meaning Capture (which only preserves words), and **not** the F&B
> candidate promotion analyzed in Phase 7B (which was deferred for the same structural reasons).

---

## 0. What is true today vs. what this document proposes

This separation is load-bearing. Read it before anything else.

### Implemented today (verified at `124b0f9`)

* **Owner Meaning Capture saves raw owner evidence only.** `createOwnerMeaningCapture`
  (`src/services/venueIntelligence/ownerMeaningCaptureService.js`) writes `owner_meaning_captures`
  + `owner_meaning_capture_events` — the owner's verbatim words plus a server-authored candidate
  snapshot. It stores `owner_response_raw` byte-for-byte.
* **Owner-only write + owner-only read.** `POST /api/owner-meaning-captures`,
  `GET /api/owner-meaning-captures`, `GET /api/owner-meaning-captures/:captureId`
  (`server.js`) are `requireAuth('owner')` with an explicit in-handler re-exclusion of the
  platform-admin global bypass (admin → 403, zero rows read or written).
* **A composer UI exists** (`OwnerMeaningComposer.jsx`) that posts the owner's words. It does not
  confirm, promote, or apply anything.
* **The capture layer imports nothing DNA-related and never calls `mergeVenueDna`.** Confirmation
  is unexpressible by vocabulary (no `confirmed`/`approved`/`promoted`/`final` value anywhere).

### What capture explicitly does **not** do today (the gap this spec addresses)

* It does **not** confirm meaning.
* It does **not** mutate Venue DNA.
* It does **not** call `mergeVenueDna`.
* It does **not** persist `captured_owner_meaning` (HESTIA's interpretation as truth).
* It provides **no** approve / promote / apply-to-DNA affordance.

### What this document is

A design for the **future** path by which raw captured evidence may *later* become a **proposed**
Venue DNA change, and how that proposal may be **reviewed and approved safely**. Three labels are
used throughout and never blurred:

* **PROPOSED** — designed here, unbuilt. Implement in a future slice (4G+).
* **FORBIDDEN** — must never be built, in this slice or any future one, as written.
* **OPEN** — an unresolved product/architecture decision (see §12); do not pick silently.

### What this document is **not** (Slice 4F non-goals)

No backend route, no frontend UI, no DB migration, no promotion queue, no approval writer, no
`mergeVenueDna` call, no Venue DNA mutation, no new service, no new API, no behavior change. The
first byte of any promotion candidate is written in a future slice, not here.

---

## 1. Product principle — the four-stage boundary

HESTIA must never silently convert evidence into truth. Promotion is a chain of **four distinct
acts**, each with a different trust class, a different actor, and a different storage layer. The
entire safety of the design rests on never collapsing two of these into one.

| Stage | Act | Who | Layer | Implemented? |
|---|---|---|---|---|
| 1 | **Capture** — preserve the owner's verbatim words about an uncertainty | Owner | Venue Memory (`owner_meaning_captures`) | ✅ today (4D) |
| 2 | **Proposal** — turn captured evidence into a *narrowly scoped, reviewable* proposed DNA change | HESTIA (suggests) | **PROPOSED** new Memory/Intelligence table (`owner_meaning_promotion_candidates`) | ❌ proposed |
| 3 | **Approval** — the owner authors the decision to accept a proposed DNA change | **Owner only** | **PROPOSED** audit (`owner_meaning_promotion_events`) | ❌ proposed |
| 4 | **Application** — the approved change is written to canonical Venue DNA | Owner-authorized system action, via `mergeVenueDna` only | Venue DNA (`venue_intelligence.venue_dna_json`) | ❌ proposed, gated on Phase 7B preconditions |

**The principle, stated as law:**

* **Capture is evidence, not truth.** The owner's words are owner-authored Memory; they assert
  nothing about confirmed identity.
* **Proposal is HESTIA's reading of that evidence, not truth.** A proposal is a *suspicion shaped
  into a reviewable diff*. It carries confidence and uncertainty; it is never applied by its own
  existence.
* **Approval is the only owner-authored decision.** Only the owner can convert a proposal into an
  applicable change. HESTIA can suggest; HESTIA can never self-approve.
* **Application is mechanical and downstream of approval.** It writes nothing the owner did not
  approve, writes through the single disciplined `mergeVenueDna` writer, and only after the
  Phase 7B reversal/audit/provenance preconditions are met.

> **HESTIA must never silently convert evidence into truth.** Every transition from one stage to
> the next is explicit, owner-visible, and audited. There is no automatic edge from stage 1 to any
> later stage.

---

## 2. Roles and permissions (proposed)

Owner identity is an **ownership** decision, not a technical one. The role model mirrors the
existing owner-only capture gate (`server.js` re-excludes admin) and the Phase 7B authority model.

| Action | Owner | Admin | Manager / Bar Manager | Other roles | HESTIA |
|---|---|---|---|---|---|
| See a proposal exists (read queue) | ✅ | **OPEN** (§12) — default **blocked** | ❌ | ❌ | n/a (produces, does not "see") |
| Read a single proposal + diff | ✅ | **OPEN** — default **blocked** | ❌ | ❌ | n/a |
| **Approve** a proposal (→ may cause DNA write) | ✅ **only** | ❌ **never in 4G** | ❌ | ❌ | ❌ **never** |
| Reject a proposal | ✅ | ❌ default | ❌ | ❌ | ❌ |
| Request revision | ✅ | ❌ default | ❌ | ❌ | ❌ |
| **Suggest** a proposal (draft) | n/a | n/a | n/a | n/a | ✅ (suggest only) |

Rules:

* **Owner-only for promotion approval.** Approval is the security-critical act; it is the only one
  that may later cause a DNA mutation. It is owner-only, enforced exactly like the capture write:
  `requireAuth('owner')` **plus** an explicit in-handler re-exclusion of the admin global bypass.
* **Admin remains blocked** for approve/reject/request-revision **unless a future explicit,
  audited, documented policy changes it.** Whether admin may even *read* the proposal queue is
  **OPEN** (§12); the safe default until decided is **blocked**, matching the current capture read
  routes (admin → 403).
* **Managers / bar managers cannot approve, reject, or read** Venue DNA change proposals. They are
  a different trust class (operational truth, not owner identity meaning) and must never be widened
  into this surface. This mirrors the capture layer's "operational clarification is a separate
  trust class" rule.
* **HESTIA can suggest but cannot self-approve.** A HESTIA-authored proposal is always `draft` /
  `needs_owner_review`; it can never advance itself to `owner_approved`.
* **Any future delegation** (e.g. owner delegates approval to a co-owner or trusted manager) must
  be **explicit, separately designed, audited, and is out of scope here.** It is not assumed and
  not built.

---

## 3. Data model proposal (proposed — do NOT implement)

> ⚠️ **Conceptual only.** No table, column, or migration is created in 4F. These are the shapes a
> future slice would implement, modeled on the existing `owner_meaning_captures` /
> `discovery_candidate_reviews` posture (isolated, venue-scoped, immutable snapshot, server-set
> provenance, append-only audit with no enforced FK).

Two future entities, plus a reuse of the existing capture rows as immutable source evidence.

### 3.1 `owner_meaning_promotion_candidates` (PROPOSED)

**Purpose.** One row per *proposed* Venue DNA change derived from owner evidence. Holds the
narrowly-scoped proposed patch, references to its source captures, the diff context, confidence,
and the proposal's own lifecycle status. It is the **review subject**.

**Why it exists separately from `owner_meaning_captures`:** a capture is *what the owner said*
(immutable evidence, Memory). A promotion candidate is *HESTIA's proposed interpretation shaped
into a DNA change* (lower-trust, reviewable, rejectable). Storing the proposed interpretation on
the capture row would be exactly the `captured_owner_meaning` laundering the capture layer
forbids. They are different trust classes and must be different tables.

| Field | Type | Notes |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | Server-minted UUID. Venue-scoped (§10). |
| `venue_id` | `TEXT NOT NULL` | **Access boundary only**, never the subject. Server from `req.venueId`. |
| `concept_ref` | `TEXT NOT NULL` | The concept thread this proposal concerns. |
| `source_capture_ids_json` | `TEXT NOT NULL` | JSON array of `owner_meaning_captures.id` values that are the evidence basis. **References, never copies** — the verbatim words stay in the capture rows. |
| `candidate_fingerprint` | `TEXT NOT NULL` | The deterministic capture-layer fingerprint the evidence belongs to (reused, not re-invented). |
| `proposed_dna_field` | `TEXT NOT NULL` | The single DNA target field (e.g. one of the `venue_dna_json` signal arrays, or a narrow `owner_notes`/`service_style` field — see §12 recommendation). |
| `proposed_dna_patch_json` | `TEXT NOT NULL` | The **bounded, server-derived** proposed change — **never free-form DNA**, never a full DNA object. The smallest applicable delta. |
| `proposed_meaning_summary` | `TEXT` | HESTIA's plain-language reading of the evidence, **labelled as proposed interpretation, never confirmed meaning.** |
| `proposed_interpretation_json` | `TEXT` | Optional structured interpretation context (still proposed, not truth). |
| `current_dna_value_snapshot_json` | `TEXT NOT NULL` | The **current** DNA field value at proposal time — the "before" side of the diff. Immutable snapshot. |
| `confidence_json` | `TEXT NOT NULL` | Structured confidence (§6): evidence count, recency, consistency, source type, contradictions, missing fields. **Never a bare number/meter.** |
| `uncertainty_notes_json` | `TEXT` | Honest contradictions / missing-data notes, verbatim where drawn from captures. |
| `status` | `TEXT NOT NULL` | One of the §4 lifecycle statuses. Server-validated. |
| `superseded_by` / `supersedes` | `TEXT` | Logical links for revisions. |
| `created_by` | `TEXT NOT NULL` | The actor who created the draft — `hestia_suggestion` for an AI draft; never an owner-spoofable value. |
| `reviewed_by` | `TEXT` | The owner who approved/rejected/requested revision (set on owner action only). |
| `reviewed_at` | `TEXT` | Timestamp of the owner decision. |
| `applied_dna_audit_ref` | `TEXT` | Set **only** when stage 4 application succeeds; logical ref to the Venue DNA promotion audit row (§7 / Phase 7B §9). Null until applied. |
| `created_at` / `updated_at` | `TEXT NOT NULL` | Server timestamps. |

**Forbidden fields on this table (must NOT exist):**

* `captured_owner_meaning` — HESTIA's interpretation stored *as the owner's*. Highest
  self-confirmation risk; the proposed reading lives in `proposed_meaning_summary`, explicitly
  labelled proposed, and never overwrites the capture.
* any field named `confirmed_*`, `final_*`, `truth_*`.
* a raw, full `venue_dna_json` object as the patch (must be a bounded single-field delta).
* a client-supplied `venue_id` subject, a client-supplied confidence number, or a
  client-authored `applied_dna_audit_ref`.

### 3.2 `owner_meaning_promotion_events` (PROPOSED)

**Purpose.** Append-only audit trail of every state change on a promotion candidate. One row per
transition. Mirrors `owner_meaning_capture_events` / `discovery_candidate_review_events`
(audit-first ordering, **no enforced FK**, never updated, never deleted).

**Why separate:** it is the *immutable history* of the proposal; the candidate row holds *current
state*. Approvals must be auditable forever even if the candidate is later superseded.

| Field | Type | Notes |
|---|---|---|
| `id` | `TEXT PRIMARY KEY` | Server-minted. |
| `venue_id` | `TEXT NOT NULL` | Access boundary. |
| `promotion_candidate_id` | `TEXT NOT NULL` | **Logical** ref (not an enforced FK — audit-first ordering requires it stay logical). |
| `event_type` | `TEXT NOT NULL` | Allowed set in §4.4. |
| `actor_role` | `TEXT NOT NULL` | `owner` / `hestia_suggestion` (never `admin`/`manager` for an approval event). |
| `event_payload_json` | `TEXT NOT NULL` | `{ from_status, to_status, source_capture_ids, proposed_dna_field, … }`. For an apply event, also `{ dna_field, before_hash, applied_delta, confidence_before, confidence_after, dna_audit_ref }`. |
| `created_by` | `TEXT NOT NULL` | The actor (server from `req.user`). |
| `created_at` | `TEXT NOT NULL` | Server timestamp. |

### 3.3 Source evidence: `owner_meaning_captures` (EXISTING — read-only here)

The promotion layer **reads** capture rows as immutable source evidence and **never writes them**.
The verbatim `owner_response_raw` is never copied into a proposal — only referenced by id — so a
later read always resolves the owner's actual words from the source of truth, and a proposal can
never quietly paraphrase them.

> The naming choice is deliberate: the proposed reading is `proposed_meaning_summary` /
> `proposed_dna_patch` / `proposed_interpretation`, **never** "confirmed meaning" until owner
> approval, and even then the *capture* is never relabelled — only the *proposal* advances.

---

## 4. Status lifecycle (proposed)

The status describes the **proposal's own lifecycle** — never a claim about venue truth. The whole
point is that most states are read-only and inert: a proposal sitting in the queue changes nothing.

### 4.1 The states

| Status | Class | Meaning | Read-only? | Requires owner action? | Mutates DNA? |
|---|---|---|---|---|---|
| `draft_suggestion` | **Proposal (pre-review)** | HESTIA drafted a proposal; not yet surfaced for decision. | Yes | No | No |
| `needs_owner_review` | **Proposal (awaiting decision)** | Surfaced in the review queue; the owner has not decided. | Yes | **Yes** | No |
| `owner_approved` | **Approval** | The owner authored an accept decision. Eligible for application. | Yes (the decision is recorded) | No (decision made) | **No — approval ≠ application** |
| `owner_rejected` | **Terminal decision** | The owner declined. Never applies. | Yes | No | No |
| `revision_requested` | **Proposal (returned)** | The owner asked for a revised proposal; the current one is parked. | Yes | No (until a revision is drafted) | No |
| `superseded` | **Terminal (replaced)** | A newer proposal replaced this one (`superseded_by` set). | Yes | No | No |
| `expired` | **Terminal (stale)** | The proposal aged out or its source evidence/candidate drifted; no longer actionable. | Yes | No | No |
| `applied_to_dna` | **Application (terminal)** | The approved change was written to Venue DNA via `mergeVenueDna`; `applied_dna_audit_ref` is set. | Yes | No | **This status records the only state reached *after* a DNA write** |

### 4.2 Precise answers to the lifecycle questions

* **Which status is evidence?** *None of these.* Evidence is the capture rows (`owner_meaning_captures`,
  status `owner_answer_captured`). Promotion statuses begin at `draft_suggestion`, which is already
  a *proposal*, not evidence.
* **Which status is proposal?** `draft_suggestion`, `needs_owner_review`, `revision_requested`.
* **Which status is approval?** `owner_approved` (the owner's authored decision).
* **Which status actually mutates DNA?** **None of them is the mutation.** The DNA write is a
  separate stage-4 action that runs only from `owner_approved`; `applied_to_dna` is the status the
  candidate is set to *after* that write succeeds. No status value *is* a write; the write is an
  explicit action gated on `owner_approved` + the Phase 7B preconditions.
* **Which statuses are read-only?** All of them with respect to Venue DNA. A proposal in any status
  changes no venue truth. `owner_approved` records a decision but does not itself write DNA.
* **Which statuses require owner action?** Only `needs_owner_review` (the owner must approve,
  reject, or request revision). Every other status is a resting/terminal state.

### 4.3 Allowed transitions (proposed)

```
draft_suggestion ─▶ needs_owner_review ─▶ owner_approved ─▶ applied_to_dna   (apply succeeds)
                            │                    │
                            ├─▶ owner_rejected    └─▶ (apply blocked/fails: stays owner_approved, audited)
                            ├─▶ revision_requested ─▶ (new draft) ─▶ supersedes prior
                            ├─▶ superseded
                            └─▶ expired
```

* `owner_approved → applied_to_dna` is the **only** edge that crosses into DNA, and it is the
  stage-4 action, not a status flip alone.
* A `revision_requested` proposal is never edited in place; a new `draft_suggestion` is created
  that `supersedes` it (append-only, mirroring the capture layer's "corrections create a new row").
* `owner_rejected`, `superseded`, `expired`, `applied_to_dna` are **terminal** — no further
  transitions.

### 4.4 Allowed `event_type` values (audit)

`promotion_drafted`, `surfaced_for_review`, `owner_approved`, `owner_rejected`,
`revision_requested`, `superseded`, `expired`, `applied_to_dna`. **No** `confirmed` / `promoted_by_hestia`
/ `auto_applied` event exists — those acts are unexpressible.

---

## 5. Promotion semantics — the future safe flow (proposed)

```
A. HESTIA reads raw evidence (owner_meaning_captures, read-only) for a concept thread.
B. HESTIA proposes ONE narrowly-scoped DNA patch (proposed_dna_field + proposed_dna_patch_json),
   bounded to a single field, derived server-side, never a free-form DNA object.
        → writes owner_meaning_promotion_candidates row, status = draft_suggestion
        → audit: promotion_drafted (actor_role = hestia_suggestion)
C. The proposal is surfaced to the owner (status = needs_owner_review), showing:
        • the source owner words (resolved live from the referenced captures, verbatim)
        • historical HESTIA context (prior proposals/decisions on this concept)
        • the proposed DNA diff (current value → proposed value)
        • confidence + missing-data / contradiction notes
        → audit: surfaced_for_review
D. The owner decides: approve | reject | request revision.
        → audit: owner_approved | owner_rejected | revision_requested (actor_role = owner)
E. ONLY owner approval (status = owner_approved) makes the change eligible for the eventual DNA
   write. Approval alone does NOT write DNA.
F. Application (separate stage-4 action, gated on Phase 7B preconditions): the approved, bounded
   delta is applied via mergeVenueDna ONCE (no second raw writer), with a DNA snapshot + audit row.
        → status = applied_to_dna, applied_dna_audit_ref set
        → audit: applied_to_dna (with before/after + dna_audit_ref)
```

Every lettered step **creates an audit event**. There is no step that mutates anything without a
preceding, recorded owner decision. Steps A–C are read/propose only; D is the human decision; E is
a gate, not a write; F is the only write and is downstream of an explicit `owner_approved`.

---

## 6. Diff and confidence (proposed)

### 6.1 What the future review UI must show per proposal

* **Current Venue DNA field / value** — the "before" (`current_dna_value_snapshot_json`).
* **Proposed change** — the "after" (`proposed_dna_patch_json`), rendered as a field-level diff
  (added/removed/changed entries for an array field; old→new for a scalar field).
* **Supporting captures** — the owner's verbatim words, resolved live from
  `source_capture_ids_json`, each with its date and the question HESTIA originally asked.
* **Contradictions / missing evidence** — explicit, not hidden; if two captures disagree, both are
  shown.
* **Confidence** — the structured object below, rendered as reasons, never as a lone number.
* **Impact note** — plain language: which downstream specialists read this DNA field and what a
  change would influence.
* **Rollback / audit note** — that application is reversible/auditable **only** once the Phase 7B
  snapshot + corrective-confidence infrastructure exists; until then, application is itself gated.

### 6.2 Confidence is not decorative

Confidence **must explain itself**. `confidence_json` is a reasoned structure, never a bare meter:

```jsonc
{
  "band": "low",                       // word band only: low | medium (never "high" from thin evidence; never a percent)
  "evidence_count": 2,                 // how many captures support it
  "recency": "most_recent_2026-06-25", // how fresh the supporting captures are
  "consistency": "consistent" ,        // consistent | mixed | contradictory across captures
  "source_type": "owner_response",     // owner words (high trust) vs. weaker source
  "contradictions": ["capture X says …, capture Y says …"],
  "missing_fields": ["no corroborating evidence for service style on weekends"]
}
```

* **Evidence count, recency, consistency, source type, contradictions, and missing fields** are
  all surfaced. A proposal backed by one stale capture must *read* as weaker than one backed by
  three recent, consistent captures — the UI shows *why*, not just a dot.
* **No numeric confidence, meter, percentage, or ring** anywhere (consistent with the capture
  layer and Phase 7B). Word bands only, and a band may never be inflated above what the evidence
  supports.
* A **contradictory** consistency value should, by recommendation, **block** advancement to
  `needs_owner_review` or at minimum force the contradiction to the top of the diff (see §12 OPEN).

---

## 7. Venue DNA mutation guardrails (binding on any future slice)

These restate and extend the capture-layer guardrails and the Phase 7B decision. **Any future
promotion implementation that violates one of these is wrong, regardless of how it is requested.**

* **No silent mutation.** Every DNA write traces to an explicit, recorded `owner_approved` decision.
* **No mutation from a capture `POST`.** `POST /api/owner-meaning-captures` writes only Memory;
  it must remain so (asserted by existing tests; promotion must not weaken them).
* **No mutation from an audit `GET`.** The read routes are read-only; promotion adds no write to them.
* **No mutation from the composer UI.** The composer captures words; it never approves or applies.
* **No mutation from a HESTIA suggestion alone.** `draft_suggestion` / `needs_owner_review` never
  write DNA. HESTIA cannot self-approve.
* **No mutation without owner approval.** Stage 4 reads only from `owner_approved`.
* **No mutation without a diff.** A proposal with no `current_dna_value_snapshot_json` +
  `proposed_dna_patch_json` is not applicable.
* **No mutation without an audit event** (`applied_to_dna`, written audit-first, with before/after).
* **No mutation without venue scoping** — every read/write is `req.venueId`-scoped; a cross-venue
  proposal id → safe 404.
* **No mutation without satisfying the existing `mergeVenueDna` safety review.** Per Phase 7B,
  `mergeVenueDna` today is monotonic+floored (confidence cannot be lowered), has **no per-signal
  provenance**, and has **no DNA snapshot/history** → **no rollback target**, and its array merge
  is **replace-by-key** (clobber risk). Therefore application (stage 4) is **DEFERRED** until the
  Phase 7B preconditions exist: a Venue DNA snapshot/history + promotion-audit table, per-signal
  provenance (or a distinct derived-signals layer), a reversible/corrective confidence path (no
  second raw writer), and the owner-confirmation workflow. **The single-writer invariant holds: the
  only DNA writer is `mergeVenueDna`, called once, additively (never a partial array that clobbers
  owner signals), never a second raw `UPDATE venue_dna_json`.**

> Stages 1–3 (capture, propose, approve) are buildable now without touching DNA. Stage 4
> (application) must not ship until the Phase 7B preconditions are met. A future slice may build
> the review queue and approval **without** building application, leaving `owner_approved` as a
> safe terminal-for-now state.

---

## 8. API design proposal (proposed — do NOT implement)

> Mirror the existing owner-meaning route posture: `requireAuth('owner')` **plus** explicit
> in-handler admin re-exclusion; `req.venueId` scoping; cross-venue id → 404; unauthenticated → 401.

### `GET /api/owner-meaning-promotion-candidates`

* **Access:** owner-only (admin read is **OPEN** §12; default blocked). Manager/bar_manager → 403.
* **Request:** query `?status=&limit=&offset=&concept_ref=` (paginated, clamped like the capture
  list — limit clamped down to a max, never widened).
* **Response:** `{ ok, candidates: [shaped proposal + confidence + diff summary + event_count], pagination }`.
  Verbatim owner words are resolved by reference, not duplicated into storage.
* **Side effects:** none (read-only).
* **Audit:** none (read).
* **Forbidden fields:** no `venue_id` filter from the client as a subject; no way to widen venue scope.
* **Failure modes:** 401 unauth; 403 admin/manager; 400 malformed query.

### `GET /api/owner-meaning-promotion-candidates/:id`

* **Access:** owner-only (admin **OPEN**; default blocked).
* **Response:** `{ ok, candidate, diff: { field, before, after }, source_captures: [verbatim], events }`.
* **Side effects / audit:** none (read).
* **Venue scoping:** id from another venue → **404** (safe not-found, no leak).
* **Failure modes:** 401; 403; 404 cross-venue/missing.

### `POST /api/owner-meaning-promotion-candidates/:id/approve`

* **Access:** **owner only.** Admin → 403 (explicit re-exclusion). Manager/bar_manager → 403.
* **Request:** `{ confirm: true, confirmation_token, note? }` — **no free-form DNA in the body**;
  the server derives the bounded delta from the stored proposal. (Dual-confirmation token
  recommended given irreversibility — Phase 7B §10.)
* **Response:** `{ ok, candidate (status owner_approved), note: "Approved. Not applied yet." }`.
* **Side effects:** sets `status = owner_approved`, `reviewed_by`, `reviewed_at`. **Approval does
  NOT write DNA by itself.** Application is the separate, gated stage-4 action; until the Phase 7B
  preconditions exist, an approved proposal **stays** `owner_approved` (a safe resting state) and is
  not applied.
* **Audit:** `owner_approved` event (actor_role = owner), audit-first.
* **Forbidden fields:** a client-supplied DNA patch; a client-supplied `venue_id`; a client-set
  `applied_dna_audit_ref`.
* **Venue scoping:** cross-venue id → 404, zero rows touched.
* **Failure modes:** 401; 403 (not owner / bad token); 404 (cross-venue/missing); 409 (already
  approved/rejected/applied/superseded — stale proposal); 400 (proposal not in `needs_owner_review`).

> **This is the only endpoint that may *later* cause a DNA mutation, and only through the approved
> `mergeVenueDna` path after the Phase 7B implementation review.** In 4G it may legitimately stop at
> `owner_approved` and write nothing to DNA.

### `POST /api/owner-meaning-promotion-candidates/:id/reject`

* **Access:** owner only (admin/manager → 403).
* **Request:** `{ note? }`. **Response:** `{ ok, candidate (status owner_rejected) }`.
* **Side effects:** `status = owner_rejected` (terminal). **Never touches DNA.**
* **Audit:** `owner_rejected` event. **Venue scoping:** cross-venue → 404.
* **Failure modes:** 401; 403; 404; 409 (already terminal); 400 (not reviewable).

### `POST /api/owner-meaning-promotion-candidates/:id/request-revision`

* **Access:** owner only. **Request:** `{ note }` (what to revise).
* **Response:** `{ ok, candidate (status revision_requested) }`.
* **Side effects:** parks the proposal; a future HESTIA draft `supersedes` it. **No DNA write.**
* **Audit:** `revision_requested` event. **Venue scoping:** cross-venue → 404.
* **Failure modes:** 401; 403; 404; 409 (terminal); 400 (missing note / not reviewable).

---

## 9. UI design proposal (proposed)

A future **Owner Review** surface (likely a depth layer reachable from Owner AI Home / Owner
Reports, never the default landing). Components:

* **Review Queue** — list of `needs_owner_review` proposals, each showing the concept, the proposed
  field, a one-line diff summary, and a confidence reason (not a number). Owner-only.
* **Evidence Drawer** — expands to the owner's **verbatim** supporting captures (resolved live),
  each with date and the original HESTIA question. The owner's words are never paraphrased.
* **Proposed DNA Diff** — current value → proposed value, field-scoped, with added/removed/changed
  entries clearly marked.
* **Owner Decision Controls** — **Approve** (with confirmation), **Reject**, **Request revision**
  (with a required note). No control implies the change is already live.
* **Audit Trail** — the append-only event history for this proposal (who/what/when).
* **Empty state** — "No proposed updates need your review." (Honest; no fabricated queue.)
* **Conflict / contradiction state** — when captures disagree, the contradiction is shown
  prominently and the confidence reads `contradictory`; the owner decides with eyes open.
* **Low-confidence state** — thin/stale evidence is labelled as such, not dressed up.

### Copy — allowed (use these)

`proposed update`, `owner review required`, `supported by owner evidence`, `confidence`,
`missing evidence`, `not applied yet`, `apply after approval`, `reject proposal`,
`request revision`.

Suggested concrete strings (decided before any UI is built):

* Queue header: **"Proposed updates — your review required"**
* Standing line: **"These are proposed updates to your Venue DNA, supported by your own evidence.
  Nothing is applied until you approve it."**
* After approval (application deferred): **"Approved. This is not applied to your Venue DNA yet."**
* After application (stage 4, future): **"Applied to your Venue DNA. You approved this change on
  {date}."**

### Copy — forbidden (must never appear)

`HESTIA knows`, `automatically learned`, `truth`, `confirmed by HESTIA`, `DNA updated`
(before approval), `apply silently`, any checkmark/success-green state implying truth before
approval, any confidence number/meter, any "Promote" button that applies without the explicit
approve+confirm flow.

---

## 10. Security and integrity (binding)

* **Owner-only approval is security-critical.** Approval is the one act that can later rewrite
  venue identity. It is owner-only, enforced like the capture write: `requireAuth('owner')` **plus**
  explicit in-handler admin re-exclusion (the global admin bypass must be neutralized in-route, as
  in 4D / 4D.2). An admin approve attempt creates **zero** state change and **zero** DNA effect.
* **Admin bypass risk is explicitly neutralized.** Every promotion write route re-excludes admin
  exactly as `POST/GET /api/owner-meaning-captures` do today (`req.user.role === 'admin' → 403`).
  Whether admin may *read* is OPEN (§12); until decided, admin is blocked from reads too.
* **Cross-venue leakage returns a safe not-found.** A promotion or capture id under another venue
  → identical **404** (never a 200 with foreign data, never a 403 that confirms existence). Lists
  never return another venue's proposals. Scope is the server-resolved `req.venueId` only.
* **Proposal IDs and capture IDs are venue-scoped.** Every query is filtered by `venue_id`; an id
  is meaningless outside its venue. `source_capture_ids_json` is validated to reference captures in
  the **same** venue+concept; a cross-venue capture reference is rejected.
* **Audit events record actor, role, timestamp, action, source evidence, and target DNA field.**
  Each `owner_meaning_promotion_events` row carries `created_by`, `actor_role`, `created_at`,
  `event_type`, the `source_capture_ids`, and (for apply) the `proposed_dna_field` + before/after.
* **Idempotency of approval.** Approve is idempotent on the stable proposal `id`: a re-sent approve
  for an already-`owner_approved` proposal returns the same result without double-writing DNA or
  emitting a duplicate apply. A confirmation token (Phase 7B §10) guards against accidental
  double-submission.
* **Concurrent / stale proposals.** Approval requires the proposal to be in `needs_owner_review`;
  an approve against a `superseded` / `expired` / already-terminal proposal → **409** (stale). If
  the underlying captures drifted after drafting, the proposal expires rather than applying a
  diff the owner never reviewed.
* **Rollback and supersession.** A revision creates a new proposal that `supersedes` the old
  (append-only; the old proposal and its evidence are never edited). DNA application rollback is
  **not available** until the Phase 7B snapshot/correction infrastructure exists — which is itself
  a precondition for stage 4 ever running.

---

## 11. Test plan for the future implementation (proposed)

Mirror the existing `test:owner-meaning-capture-*` and `test:discovery-review-*` posture: route
behavior, route audit, service, UI static, and rendered-DOM scripts, each a `scripts/test-owner-meaning-promotion-*`
npm script. These ship **in the same slice** as the code they cover (negative guardrails are never
deferred).

**Service tests**

* Proposal drafting writes a row with status `draft_suggestion` and a `promotion_drafted` audit
  event, audit-first.
* `proposed_dna_patch_json` is a **bounded single-field delta**, never a full DNA object.
* Confidence object carries evidence_count / recency / consistency / source_type / contradictions /
  missing_fields; never numeric.
* Source captures are referenced, not copied; verbatim words resolve from the capture rows.

**Route behavior tests**

* **admin blocked** — admin approve/reject/request-revision → 403; zero state change.
* **manager / bar_manager blocked** — → 403.
* **owner-only approve** — owner succeeds; status → `owner_approved`.
* **no mutation before approve** — drafting and surfacing write no DNA; reading writes nothing.
* **approval does not itself write DNA in 4G** — `owner_approved` is a safe resting state; no
  `venue_dna_json` change; `mergeVenueDna` not called.
* **exact diff applied** *(only when stage 4 ships)* — the applied delta equals the approved
  `proposed_dna_patch_json` exactly; arrays additively reconstructed (no clobber).
* **cross-venue safe 404** — foreign proposal/capture id → 404, no leak.
* **stale proposal cannot apply** — approve/apply on `superseded`/`expired`/terminal → 409.
* **rejected proposal cannot apply** — `owner_rejected` is terminal; apply → 409/blocked.

**Route audit tests**

* every owner decision writes the matching `owner_meaning_promotion_events` row (actor, role,
  timestamp, action, source_capture_ids, target field), audit-first.
* an apply event (future) records before/after + `dna_audit_ref`.

**UI static + rendered-DOM tests**

* forbidden copy (§9) never rendered; allowed copy present.
* no confidence number/meter; no "applied" state before approval; no checkmark-as-truth.
* approve control requires confirmation; reject/request-revision present.

**Regression tests for the existing 4D–4E.2 boundaries (must stay green)**

* **capture `POST` still does not mutate DNA** — `test:owner-meaning-capture-route-behavior` /
  `-persistence` unchanged and passing.
* **capture read routes still read-only, owner-only, admin-excluded.**
* **composer still cannot promote** — `test:owner-meaning-capture-composer-ui` /
  `OwnerMeaningComposer.render.test.jsx` still prove the composer captures words only, with no
  approve/promote/apply affordance.
* **`mergeVenueDna` still not imported by the capture service** — source-level guard unchanged.

---

## 12. Risks and open decisions (do NOT resolve silently)

| # | Open decision | Safe default until decided |
|---|---|---|
| 1 | **Should admin ever *read* promotion candidates?** | **No** — admin blocked from reads too, matching current capture routes. Revisit only with an explicit, audited policy. |
| 2 | **Can the owner delegate approval?** | **No delegation.** Owner-only. Any delegation is a separate, explicit, audited design. |
| 3 | **Which DNA fields can be promoted first?** | Start with **one** narrow, low-risk field (see recommendation below). No arbitrary `venue_dna_json` patching. |
| 4 | **Should 4G start with one narrow DNA field only?** | **Yes — strongly recommended** (below). |
| 5 | **Should promotion (application) be reversible?** | It **must** be before stage 4 ships — Phase 7B requires a snapshot/correction path; until then, application is deferred and approval is the terminal state. |
| 6 | **How is confidence computed?** | Deterministically from capture evidence (count/recency/consistency/source/contradictions/missing) — never an LLM-asserted number. Exact formula is OPEN; word bands only. |
| 7 | **Should conflicting owner captures block promotion?** | **Recommended: yes** — `contradictory` consistency blocks advancement to `needs_owner_review` (or forces the contradiction to the top and bars approval until resolved). Final rule OPEN. |
| 8 | **Where does the final applied DNA diff appear in Owner AI Home?** | OPEN — likely a depth layer (Owner Reports / Venue DNA view), not the default landing. Must show "you approved this on {date}", never "HESTIA learned this." |

### Recommendation for 4G (the next implementation slice)

**Start narrow.** 4G should implement **stages 1–3 only** (draft → review → approve) for **one
explicit, low-risk DNA field** — e.g. a dedicated `owner_notes` / `service_style` field — rather
than arbitrary `venue_dna_json` patching. Concretely:

* Build the proposal table, the audit table, the owner-only review queue, and the approve / reject
  / request-revision routes.
* **Stop at `owner_approved`.** Do **not** build stage-4 application (`mergeVenueDna` write) until
  the Phase 7B preconditions (snapshot/history, provenance, reversible confidence, owner-confirmation
  workflow) are independently delivered and reviewed.
* Prove, with tests, that an approved proposal writes **zero** Venue DNA and the capture/read/compose
  boundaries are untouched.

This keeps the entire first promotion slice on the safe side of the `mergeVenueDna` line: HESTIA can
*propose*, the owner can *approve*, and **nothing reaches canonical Venue DNA** until the
infrastructure that makes a DNA write reversible and auditable exists.

---

## Final principle (restated)

> HESTIA may preserve the owner's words (capture), and may *propose* — narrowly, transparently,
> with reasoned confidence — how those words could change Venue DNA. But only the **owner's explicit
> approval** can convert a proposal into an applicable change, and only the single disciplined
> `mergeVenueDna` writer — once the Phase 7B reversal/audit/provenance preconditions exist — may
> ever apply it. Evidence never becomes truth silently, and HESTIA never approves its own
> interpretation.
