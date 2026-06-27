# HESTIA Owner Meaning Promotion — Exact DDL Contract (Slice 4F.1)

> **Status:** Slice 4F.1 — **docs-only DDL contract.** No application code, no migration, no table,
> no boot-time schema, no `db.exec`, no endpoint, no route, no write service, no service file, no
> queue UI, no answer composer change. Nothing here creates a promotion candidate, mutates Venue
> DNA, imports/calls `mergeVenueDna`, applies a proposed patch, or adds any
> `POST`/`PATCH`/`PUT`/`DELETE` route. This document is the **exact future DDL contract** that a
> later implementation slice (4G+) will build from. It is **not** an implementation.
>
> **Source of truth at authoring time:** `origin/main @ 360c134` — *docs: design owner meaning
> promotion review*. HEAD == origin/main, working tree clean. The capture → read → compose chain
> (4D–4E.2) is complete and verified; the promotion layer is **not** started.
>
> **Binding parents (in precedence order — where this contract and a parent differ, the parent
> wins and this file is the bug):**
> 1. `docs/architecture/OWNER_MEANING_PROMOTION_REVIEW_DESIGN.md` (4F) — the promotion/review
>    design this contract makes precise. Its four-stage boundary (capture → proposal → approval →
>    application) and its forbidden/open lists govern.
> 2. `docs/architecture/OWNER_MEANING_CAPTURE_DESIGN.md` (4A) — Owner Meaning Capture doctrine
>    (capture is evidence, not truth).
> 3. `docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md` — Venue Memory vs Venue DNA law.
> 4. `docs/architecture/VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md` — the `mergeVenueDna`
>    safety review and the standing decision to DEFER any Venue DNA application until snapshot/audit,
>    provenance, reversible confidence, and an owner-confirmation workflow exist. **This contract
>    inherits that deferral in full.**
> 5. `docs/architecture/OWNER_MEANING_CAPTURE_DDL_CONTRACT.md` (4C.2) — the **format and posture**
>    this contract mirrors field-for-field (isolated, venue-scoped, immutable snapshot, server-set
>    provenance, append-only audit with **no enforced FK**, audit-first ordering, confirmation
>    unexpressible by vocabulary).
>
> **Precedent module (mirror its posture):**
> `src/services/venueIntelligence/ownerMeaningCaptureService.js` and its boot wiring style
> (`db.exec(DDL)` of `OWNER_MEANING_CAPTURES_DDL` / `OWNER_MEANING_CAPTURE_EVENTS_DDL`). The
> promotion service, **when it is later built**, will declare two exported DDL constants and wire
> them the same way — but **not in this slice.**

---

## 1. Scope and non-goals

This document is the **exact DDL contract** for the future Owner Meaning Promotion candidate queue
(stages 2–3 of the 4F four-stage model: **proposal** and **approval**). Its job is to remove every
schema decision from the implementation slice so that slice writes code, not design.

**This is proposed future DDL only. Explicitly NOT in this slice:**

* **Not implemented yet** — no table exists after this commit.
* **No migration yet** — no `CREATE TABLE` runs anywhere.
* **No boot wiring yet** — nothing is added to the server's `db.exec(...)` startup.
* **No routes yet** — no endpoint reads or writes these tables.
* **No UI yet** — no review queue, no diff view, no approve button.
* **No service yet** — no promotion writer, no approval writer.
* **No DNA mutation yet** — nothing writes `venue_intelligence.venue_dna_json`.
* **No `mergeVenueDna` usage yet** — the function is referenced in prose as the binding precedent,
  never invoked.

**Core principle.** This DDL supports **read-only proposal-queue preparation**. It must make four
things structurally true:

* **Capture evidence is not truth** — the owner's words (`owner_meaning_captures`) are referenced,
  never relabelled as confirmed identity.
* **A promotion candidate is not truth** — a row in `owner_meaning_promotion_candidates` is a
  *proposed* reading, reviewable and rejectable, carrying confidence and uncertainty.
* **`owner_approved` is not `applied_to_dna_future`** — approval is the owner's authored decision;
  it does **not** by itself write Venue DNA.
* **`applied_to_dna_future` is explicitly blocked** until the §10 prerequisites exist.

### Table count — two, not three (optional third table intentionally DEFERRED)

This contract defines **exactly two** tables: `owner_meaning_promotion_candidates` and
`owner_meaning_promotion_events`. The optional `venue_dna_change_proposals` third table is
**intentionally NOT added.** Justification:

* The 4F design already folds the proposed change into the candidate row
  (`proposed_dna_patch_json` + `current_value_snapshot_json` + `proposed_value_json`). One logical
  proposal = one candidate row. A separate proposal table would split one proposal across two rows
  with **no benefit while application is blocked** (§10), and would invite premature "proposal vs
  candidate" divergence.
* "Keep the design narrow" (4F §12 recommendation) — start with one target path, two tables, no
  application. A third table is reserved for a future slice **only if** a real need emerges (e.g.
  many-to-many proposals across captures, or a distinct DNA-write ledger separate from the
  promotion audit). It is listed as OPEN (§13) and not pre-built here.

---

## 2. Relationship to existing tables

| Existing table | Relationship to the promotion layer |
|---|---|
| `owner_meaning_captures` (Venue Memory) | **Source evidence, read-only.** A promotion candidate **references** capture rows by id/fingerprint; it never writes them and never copies `owner_response_raw` as truth. The verbatim words resolve live from the capture rows at read time. |
| `owner_meaning_capture_events` (Venue Memory) | Not referenced directly. The promotion layer has its own audit table (`owner_meaning_promotion_events`), modeled on the same append-only/no-FK posture. |
| `venue_intelligence` / `venue_dna_json` (Venue DNA) | **The application target, NOT written in this contract.** A candidate stores a *proposed* patch and a *snapshot of the current value*; it never updates `venue_dna_json`. Application is blocked (§10). The only DNA writer remains `mergeVenueDna`, called once, never from here. |
| `venue_intelligence_candidates` (F&B candidate layer, Phase 7) | **Sibling-in-spirit, not reused.** That layer holds F&B-derived candidate signals deferred from promotion in Phase 7B. The owner-meaning promotion layer is a **separate record class** with a different source (owner words, not F&B rejections) and its own tables. They are not joined and not merged. |

**Evidence-reference rule (binding).** Promotion candidates **must reference captures as
evidence**, by id and by the capture-layer `candidate_fingerprint`. They **must not** duplicate
`owner_response_raw` as truth. The only permitted snapshot fields are:

* `current_value_snapshot_json` — a snapshot of the **current Venue DNA value** at proposal time
  (the "before" side of the diff). This is a **historical evidence snapshot only** — it records
  *what DNA looked like when the proposal was made*, never what it should become, and is never
  treated as the new value.

No field copies the owner's verbatim answer. If a future audit genuinely needs the owner words
frozen alongside a proposal, that is a separate, explicitly-justified decision; this contract keeps
the words in the capture rows and references them.

---

## 3. Table: `owner_meaning_promotion_candidates` (PROPOSED — do NOT implement)

One row per **proposed** Venue DNA change derived from owner evidence — the review subject. SQLite
types follow the capture precedent: everything is `TEXT` except a single nullable numeric
(`confidence_score`, REAL) that is **internal-only and never rendered** (§3 note + §13). Timestamps
are ISO/SQL `TEXT`.

> **Layer:** this is a **proposal record**, lower-trust than Memory and far below DNA. It is
> isolated and venue-scoped. It is **not** Venue DNA and has structurally nowhere to write into DNA.

### 3.1 Column contract

| # | Column | Type | Nullable | Default | Client may supply? | Source | Mutability |
|---|---|---|---|---|---|---|---|
| 1 | `id` | `TEXT PRIMARY KEY` | NOT NULL | — | No | Server (mint UUID) | Immutable |
| 2 | `venue_id` | `TEXT NOT NULL` | NOT NULL | — | **No (forbidden)** | Server from `req.venueId` | Immutable |
| 3 | `record_space` | `TEXT NOT NULL` | NOT NULL | `'concept_draft'` | No | Server-hard-coded | Immutable |
| 4 | `source_capture_ids_json` | `TEXT NOT NULL` | NOT NULL | — | No | Server (validated same-venue capture ids) | Immutable (unless superseded) |
| 5 | `source_capture_fingerprints_json` | `TEXT NOT NULL` | NOT NULL | — | No | Server (capture-layer fingerprints) | Immutable (unless superseded) |
| 6 | `proposed_target_path` | `TEXT NOT NULL` | NOT NULL | — | No | Server (from allow-list, §6.2) | Immutable |
| 7 | `proposed_target_label` | `TEXT NOT NULL` | NOT NULL | — | No | Server (human label for the path) | Immutable |
| 8 | `current_value_snapshot_json` | `TEXT NOT NULL` | NOT NULL | — | No | Server (current DNA value at proposal time) | **Immutable** |
| 9 | `proposed_value_json` | `TEXT NOT NULL` | NOT NULL | — | No | Server (the proposed "after" value, bounded) | Mutable only pre-review (§7) |
| 10 | `proposed_meaning_summary` | `TEXT` | NULL | — | No | HESTIA-derived (labelled **proposed**, never confirmed) | Mutable only pre-review |
| 11 | `proposed_dna_patch_json` | `TEXT NOT NULL` | NOT NULL | — | No | Server (bounded single-field delta) | Mutable only pre-review |
| 12 | `proposal_rationale` | `TEXT` | NULL | — | No | HESTIA-derived | Mutable only pre-review |
| 13 | `confidence_score` | `REAL` | NULL | `NULL` | No | Server-derived, **internal-only, never rendered** | Mutable only pre-review |
| 14 | `confidence_label` | `TEXT NOT NULL` | NOT NULL | `'low'` | No | Server-derived word band (§6.3) | Mutable only pre-review |
| 15 | `confidence_factors_json` | `TEXT NOT NULL` | NOT NULL | — | No | Server-derived reasons (§6.3) | Mutable only pre-review |
| 16 | `contradictions_json` | `TEXT` | NULL | — | No | Server-derived from captures | Mutable only pre-review |
| 17 | `missing_evidence_json` | `TEXT` | NULL | — | No | Server-derived | Mutable only pre-review |
| 18 | `impact_note` | `TEXT` | NULL | — | No | Server-derived (which specialists read the field) | Mutable only pre-review |
| 19 | `status` | `TEXT NOT NULL` | NOT NULL | `'draft_suggestion'` | **No for approval states** | Server-validated (§5) | Mutable across §5 set only |
| 20 | `status_reason` | `TEXT` | NULL | — | No | Server | Mutable with status |
| 21 | `created_by_actor_type` | `TEXT NOT NULL` | NOT NULL | — | No | Server (`hestia_suggestion` \| `system`) | Immutable |
| 22 | `created_by_user_id` | `TEXT` | NULL | — | No | Server (null for HESTIA/system drafts) | Immutable |
| 23 | `created_at` | `TEXT NOT NULL` | NOT NULL | `CURRENT_TIMESTAMP` | No | Server | Immutable |
| 24 | `updated_at` | `TEXT NOT NULL` | NOT NULL | `CURRENT_TIMESTAMP` | No | Server | Mutable (touch on change) |
| 25 | `reviewed_by_user_id` | `TEXT` | NULL | — | No | Server from `req.user` on owner decision | Set once on decision |
| 26 | `reviewed_at` | `TEXT` | NULL | — | No | Server | Set once on decision |
| 27 | `owner_decision_note` | `TEXT` | NULL | — | Yes (owner free text on decision) | User (owner) | Set on decision |
| 28 | `approved_at` | `TEXT` | NULL | — | No | Server (set when status → `owner_approved`) | Set once |
| 29 | `rejected_at` | `TEXT` | NULL | — | No | Server (set when status → `owner_rejected`) | Set once |
| 30 | `superseded_by_candidate_id` | `TEXT` | NULL | — | No | Server | Set once when superseded |
| 31 | `applied_at` | `TEXT` | NULL | — | **No (forbidden)** | Server (future application only) | **Reserved — null in 4G** |
| 32 | `applied_by_user_id` | `TEXT` | NULL | — | **No (forbidden)** | Server (future application only) | **Reserved — null in 4G** |
| 33 | `dna_application_ref` | `TEXT` | NULL | — | **No (forbidden)** | Server (future DNA-audit ref) | **Reserved — null in 4G** |
| 34 | `idempotency_key` | `TEXT NOT NULL` | NOT NULL | — | No | Server-derived (§9) | Immutable |
| 35 | `candidate_fingerprint` | `TEXT NOT NULL` | NOT NULL | — | No | Server-computed (§6.1) | **Immutable** |
| 36 | `schema_version` | `TEXT NOT NULL` | NOT NULL | `'owner_meaning_promotion_v1'` | No | Server constant | Immutable |

### 3.2 Per-column semantics (the load-bearing ones)

* **`id` (1)** — UUID-shaped primary key; the stable handle every event and supersession link
  points at. Server-minted; a client-supplied id is honored only as a UUID-shaped idempotent-retry
  continuation (never to address another venue's row → 404).
* **`venue_id` (2)** — **access boundary only, never the subject.** Server from `req.venueId`. A
  client-supplied `venue_id` is **forbidden** (it would open a cross-venue write hole).
* **`record_space` (3)** — server-hard-coded `'concept_draft'`; a proposal is a draft, never
  `live_venue`. Reads filter on it. Mirrors the capture layer.
* **`source_capture_ids_json` (4)** / **`source_capture_fingerprints_json` (5)** — JSON arrays of
  the **same-venue** `owner_meaning_captures.id` and their capture-layer `candidate_fingerprint`
  values that form the evidence basis. Validated to belong to the same venue+concept; a cross-venue
  capture reference is rejected (§8). **References, not copies** — `owner_response_raw` is never
  duplicated here. Immutable unless the candidate is superseded by a revision.
* **`proposed_target_path` (6)** — the **single** DNA target field this proposal touches, drawn from
  a server allow-list (§6.2). Never free-form. For 4G the recommended allow-list is one narrow path
  (e.g. `owner_notes`). **No arbitrary `venue_dna_json` path.**
* **`proposed_target_label` (7)** — the owner-facing label for that path.
* **`current_value_snapshot_json` (8)** — the **current** DNA value for `proposed_target_path` at
  proposal time. A **historical evidence snapshot only** (the "before" side of the diff). Immutable.
  If live DNA drifts after this is taken, the snapshot is how staleness is detected (§9).
* **`proposed_value_json` (9)** — the proposed "after" value (bounded to the one field).
* **`proposed_meaning_summary` (10)** — HESTIA's plain-language reading, **labelled proposed**.
  Never named `captured_owner_meaning`; never written back onto the capture; never "confirmed."
* **`proposed_dna_patch_json` (11)** — the bounded, server-derived single-field delta that would be
  applied **if** application were ever permitted. **Never a full `venue_dna_json` object.** The
  patch shape (JSON Patch vs merge-patch vs domain patch) is OPEN (§13); whichever is chosen, it is
  bounded to `proposed_target_path`.
* **`proposal_rationale` (12)** — why HESTIA drew this proposal from the cited captures.
* **`confidence_score` (13)** — **internal-only deterministic numeric, REAL, nullable, NEVER
  rendered to the owner.** Exists solely for stable server-side ordering / threshold gating. The
  4F design forbids *displaying* numeric confidence; an unrendered internal sort key does not
  violate that, but to stay maximally aligned, **the recommendation is to leave it `NULL` in 4G**
  and treat `confidence_label` + `confidence_factors_json` as authoritative. Scale (0.0–1.0 vs
  0–100) is OPEN (§13); if used, **0.0–1.0** (see §6.3 justification).
* **`confidence_label` (14)** — the **rendered** word band: `low` | `medium` only (never `high` from
  thin evidence; never a percent). Default `low`.
* **`confidence_factors_json` (15)** — the **reasons** (evidence_count, recency, consistency,
  source_type, contradictions, missing_fields). Confidence must explain itself (4F §6).
* **`contradictions_json` (16)** / **`missing_evidence_json` (17)** — honest uncertainty, surfaced,
  never hidden.
* **`impact_note` (18)** — which downstream specialists read `proposed_target_path`.
* **`status` (19)** — the **proposal's own lifecycle** (§5), never a claim about venue truth.
  Approval states (`owner_approved` etc.) are **never** client-settable; only the server sets them
  through the owner-decision routes.
* **`status_reason` (20)** — human/diagnostic note for the current status (e.g. why expired).
* **`created_by_actor_type` (21)** / **`created_by_user_id` (22)** — who drafted it. HESTIA/system
  drafts carry `hestia_suggestion`/`system` and a null user id; an owner never "creates" a
  proposal (the owner *decides* on one).
* **`reviewed_by_user_id` (25)** / **`reviewed_at` (26)** / **`owner_decision_note` (27)** — the
  owner decision record. `owner_decision_note` is the only owner-supplied free text.
* **`approved_at` (28)** / **`rejected_at` (29)** — decision timestamps, set once.
* **`superseded_by_candidate_id` (30)** — logical link to the revision that replaced this row
  (same venue+concept). Set once.
* **`applied_at` (31)** / **`applied_by_user_id` (32)** / **`dna_application_ref` (33)** —
  **RESERVED and BLOCKED.** These exist in the schema so a future application slice needs no
  migration, but they are **null in 4G** and may be written **only** by a future, separately
  reviewed application path after §10 prerequisites exist. Client-supplied values are forbidden.
* **`idempotency_key` (34)** — server-derived dedupe key (§9) so re-running proposal generation
  does not create duplicate active candidates.
* **`candidate_fingerprint` (35)** — deterministic identity of *this proposal* (§6.1). Immutable.
* **`schema_version` (36)** — declares the contract version that produced the row, so the shape can
  evolve without re-binding old rows.

### 3.3 Forbidden columns (must NOT exist)

* `captured_owner_meaning` — HESTIA's interpretation stored *as the owner's*. The highest
  self-confirmation risk; the proposed reading lives in `proposed_meaning_summary`, labelled
  proposed, and never overwrites the capture.
* any `confirmed_*` / `final_*` / `truth_*` column.
* a raw, full `venue_dna_json` object as a column value (the patch is a bounded single-field delta).
* a client-writable `venue_id`, `status` (for approval), `applied_at`, `applied_by_user_id`, or
  `dna_application_ref`.

---

## 4. Table: `owner_meaning_promotion_events` (PROPOSED — do NOT implement)

Append-only audit trail. One row per recorded state change on a candidate. Mirrors
`owner_meaning_capture_events` (audit-first ordering, **no enforced FK**, never updated, never
deleted).

### 4.1 Column contract

| # | Column | Type | Nullable | Default | Source | Mutability |
|---|---|---|---|---|---|---|
| 1 | `id` | `TEXT PRIMARY KEY` | NOT NULL | — | Server (mint UUID) | Immutable (append-only) |
| 2 | `venue_id` | `TEXT NOT NULL` | NOT NULL | — | Server from `req.venueId` | Immutable |
| 3 | `candidate_id` | `TEXT NOT NULL` | NOT NULL | — | Server | Immutable; **logical** ref (no enforced FK) |
| 4 | `event_type` | `TEXT NOT NULL` | NOT NULL | — | Server-validated (§4.2) | Immutable |
| 5 | `actor_type` | `TEXT NOT NULL` | NOT NULL | — | Server (`owner` \| `hestia_suggestion` \| `system`) | Immutable |
| 6 | `actor_user_id` | `TEXT` | NULL | — | Server from `req.user` (null for system) | Immutable |
| 7 | `actor_role` | `TEXT` | NULL | — | Server from `req.user.role` (`owner`; never `admin`/`manager` for a decision) | Immutable |
| 8 | `event_payload_json` | `TEXT NOT NULL` | NOT NULL | — | Server | Immutable |
| 9 | `previous_status` | `TEXT` | NULL | — | Server | Immutable |
| 10 | `next_status` | `TEXT` | NULL | — | Server | Immutable |
| 11 | `target_path` | `TEXT` | NULL | — | Server (the candidate's `proposed_target_path`) | Immutable |
| 12 | `source_capture_ids_json` | `TEXT` | NULL | — | Server | Immutable |
| 13 | `created_at` | `TEXT NOT NULL` | NOT NULL | `CURRENT_TIMESTAMP` | Server | Immutable |
| 14 | `idempotency_key` | `TEXT` | NULL | — | Server-derived | Immutable |
| 15 | `schema_version` | `TEXT NOT NULL` | NOT NULL | `'owner_meaning_promotion_v1'` | Server constant | Immutable |

* **`candidate_id` (3)** is a **logical** reference: because the audit row is written **before** the
  candidate row exists (audit-first, §7/§9), an enforced FK would reject the load-bearing ordering.
  **Do not add a `FOREIGN KEY` clause and do not enable `PRAGMA foreign_keys` for these tables**
  (exact capture-layer precedent).
* **`event_payload_json` (8)** describes the transition. For a future apply event it would also
  carry `{ target_path, before_hash, applied_delta, confidence_before, confidence_after,
  dna_application_ref }` — recorded only when application is ever permitted.

### 4.2 Allowed `event_type` values

| `event_type` | Emitted when | Active in first implementation? |
|---|---|---|
| `candidate_created` | A new candidate row is drafted from owner evidence. **Always** emitted. | ✅ |
| `candidate_refreshed` | A candidate's pre-review derived fields were re-derived (evidence/confidence refresh). | ✅ if refresh built |
| `owner_review_opened` | The owner opened/viewed the proposal for decision (surfaced for review). | ✅ if surfacing tracked |
| `owner_requested_revision` | The owner asked for a revised proposal. | ✅ |
| `owner_rejected` | The owner declined the proposal (terminal). | ✅ |
| `owner_approved` | The owner authored an accept decision. **Does NOT imply application.** | ✅ |
| `candidate_superseded` | A newer candidate replaced this one. | ✅ if supersession built |
| `candidate_expired` | The proposal aged out or its evidence drifted; no longer actionable. | ✅ if expiry built |
| `application_blocked` | An application attempt was refused because §10 prerequisites are unmet. | ✅ (records the refusal honestly) |
| `applied_to_dna_future` | **RESERVED, NOT ACTIVE.** Would record a real Venue DNA write — emitted **only** by a future, separately reviewed application slice after §10. | ❌ reserved |

> **No `event_type` implies mutation unless a future implementation explicitly performs it.**
> `applied_to_dna_future` is the only event that would ever correspond to a DNA write, and it is
> reserved/blocked. `application_blocked` exists precisely so a premature apply attempt is recorded
> as *refused*, never silently succeeding. There is no `confirmed` / `promoted_by_hestia` /
> `auto_applied` event — those acts are unexpressible.

---

## 5. Status lifecycle contract

`status` describes the candidate's own lifecycle. The whole point is that almost every state is
inert with respect to Venue DNA.

| Status | Who can set it | Owner action required? | Can it mutate DNA? | Terminal? | Allowed next statuses |
|---|---|---|---|---|---|
| `draft_suggestion` | Server (HESTIA/system draft) | No | No | No | `needs_owner_review`, `superseded`, `expired` |
| `needs_owner_review` | Server (on surfacing) | **Yes** | No | No | `owner_approved`, `owner_rejected`, `revision_requested`, `superseded`, `expired` |
| `owner_approved` | Server **on owner-only approve** | No (decision made) | **No — approval ≠ application** | No (a safe resting state in 4G) | `application_blocked`, `applied_to_dna_future` (future only), `superseded` |
| `owner_rejected` | Server on owner-only reject | No | No | **Yes** | — |
| `revision_requested` | Server on owner-only request-revision | No (until a new draft) | No | No | `superseded` (by the new draft) |
| `superseded` | Server | No | No | **Yes** | — |
| `expired` | Server (staleness/drift) | No | No | **Yes** | — |
| `application_blocked` | Server (apply attempt refused, §10) | No | No | No (returns to `owner_approved` context) | `owner_approved`, `applied_to_dna_future` (future only) |
| `applied_to_dna_future` | **RESERVED — future application slice only** | No | **Yes (future only, gated)** | **Yes** | — |

**Binding rules:**

* **`owner_approved` must NOT automatically mean `applied_to_dna_future`.** Approval sets
  `owner_approved` and stops. In 4G, `owner_approved` is the terminal-for-now state and **writes
  zero Venue DNA**.
* **`applied_to_dna_future` is reserved and blocked** until the §10 prerequisites exist. No code in
  the first implementation may transition into it. An attempt to apply produces
  `application_blocked`, not `applied_to_dna_future`.
* Owner-decision states (`owner_approved`, `owner_rejected`, `revision_requested`) can be set
  **only** through the owner-only routes (§8, §11) — never by a client-supplied `status`.
* A `revision_requested` proposal is never edited in place; a new `draft_suggestion` is created that
  supersedes it (append-only, mirroring the capture layer).

---

## 6. Identity, confidence, fingerprint

### 6.1 `candidate_fingerprint` (deterministic identity of the proposal)

Computed server-side, in fixed canonical order, then hashed (SHA-256), mirroring the capture-layer
fingerprint. Conceptual inputs:

1. `record_space` (always `concept_draft`)
2. `venue_id`
3. `proposed_target_path`
4. the **sorted** `source_capture_fingerprints_json` (sorted so array order can never vary the
   result)
5. a normalized form of `proposed_dna_patch_json` (normalize whitespace/key-order for the
   **fingerprint input only** — never for the stored patch)
6. `schema_version`

**Forbidden inputs:** any ephemeral candidate id, any `randomUUID()`, any client-supplied id, any
input whose serialization depends on array-order instability. The same evidence + same target +
same proposed patch ⇒ same fingerprint (the dedupe anchor, §9).

### 6.2 `proposed_target_path` allow-list

* Server-controlled closed allow-list. **Never free-form, never client-supplied.**
* **4G recommendation: exactly one narrow path** (e.g. `owner_notes` or `service_style`). No
  arbitrary `venue_dna_json` array patching (the array-replace clobber risk is a Phase 7B blocker).
* The exact first path is OPEN (§13); whichever is chosen, it is one low-risk field.

### 6.3 Confidence representation (doctrine-aligned)

* **`confidence_label`** (rendered): word band `low` | `medium` only. Never `high` from thin
  evidence; never a number, meter, percentage, or ring.
* **`confidence_factors_json`** (rendered as reasons): `{ band, evidence_count, recency,
  consistency, source_type, contradictions, missing_fields }`. Confidence must explain itself.
* **`confidence_score`** (REAL, nullable, **internal-only, never rendered**): a deterministic sort
  key. **Scale, if used: 0.0–1.0** — justification: a probability-like fraction makes threshold math
  (`>= 0.5`) and ordering clean, and it does **not** read as a user-facing percentage the way 0–100
  invites. **Recommendation: leave it `NULL` in 4G** and let the label + factors be authoritative,
  staying fully aligned with the parent "no numeric confidence surfaced" rule. Keeping the column
  (nullable) avoids a future migration if an internal sort key is later wanted.

---

## 7. Immutability and update rules

### 7.1 Immutable after creation (forever, unless the candidate is superseded by a revision)

`id`, `venue_id`, `record_space`, `source_capture_ids_json`, `source_capture_fingerprints_json`,
`proposed_target_path`, `proposed_target_label`, `current_value_snapshot_json`,
`created_by_actor_type`, `created_by_user_id`, `created_at`, `idempotency_key`,
`candidate_fingerprint`, `schema_version`.

> **Binding:** source evidence references, the original `current_value_snapshot_json`, and
> `candidate_fingerprint` are **immutable after creation**. A "different proposal" is a **new row**
> that supersedes the old, never an in-place rewrite of these. (Mirrors the capture layer's
> append-only-for-content rule.)

### 7.2 Mutable **only before owner review** (while `draft_suggestion` / `needs_owner_review`, pre-decision)

`proposed_value_json`, `proposed_meaning_summary`, `proposed_dna_patch_json`, `proposal_rationale`,
`confidence_score`, `confidence_label`, `confidence_factors_json`, `contradictions_json`,
`missing_evidence_json`, `impact_note`. These are HESTIA-derived and may be refreshed
(`candidate_refreshed` event) **until** the owner acts. After an owner decision they freeze.

### 7.3 Mutable **only by owner decision** (server-set through owner-only routes)

`status` (to `owner_approved` / `owner_rejected` / `revision_requested`), `status_reason`,
`reviewed_by_user_id`, `reviewed_at`, `owner_decision_note`, `approved_at`, `rejected_at`,
`updated_at`. `superseded_by_candidate_id` is server-set when a revision replaces the row.

### 7.4 Mutable **only by future application** (RESERVED — blocked in 4G)

`applied_at`, `applied_by_user_id`, `dna_application_ref`, and the transition to
`applied_to_dna_future`. None of these may be written by the first implementation.

### 7.5 What must create an event

Every status transition, every owner decision, every refresh of derived fields, every supersession,
every expiry, and every (refused) application attempt **must** write an `owner_meaning_promotion_events`
row, **audit-first** (before the candidate row is written/updated). An un-audited state change is a
bug; an orphan audit row after a failed candidate write is benign.

---

## 8. Venue scoping and security contract

* **Every read/write is scoped by the server-resolved `venue_id`** (`req.venueId`). The client
  never supplies a venue subject.
* **Client cannot supply `venue_id`** on any candidate or event. A body `venue_id` is ignored/rejected.
* **Cross-venue IDs return a safe 404.** A candidate id (or referenced capture id) under another
  venue → identical **404**, never a 200 with foreign data and never a 403 that confirms existence.
  Lists never return another venue's candidates.
* **Admin bypass is explicitly neutralized for approval.** `requireAuth`'s global admin bypass must
  be re-excluded **in-handler** on every owner-decision route, exactly as the capture write/read
  routes do (`req.user.role === 'admin' → 403`). An admin approve attempt writes **zero** rows.
* **Owner-only approval.** Approve / reject / request-revision are owner-only.
* **Managers / bar managers cannot approve** (or read, in the default policy) — a separate trust
  class, never widened into this surface.
* **Future read-access policy must be explicit.** Whether admin may *read* the queue is OPEN (§13);
  the safe default until decided is **blocked**, matching the current capture read routes.
* **Proposal creation by HESTIA/system is still venue-scoped and audited.** A draft is written under
  a specific `venue_id` and always emits `candidate_created`. There is no un-scoped, un-audited
  draft path.

---

## 9. Idempotency and concurrency

* **Avoiding duplicate candidates.** Proposal generation derives a deterministic `idempotency_key`
  (and `candidate_fingerprint`, §6.1) from `(venue_id, proposed_target_path, sorted source capture
  fingerprints, normalized proposed patch, schema_version)`. Re-running generation for unchanged
  evidence **finds the existing active candidate** instead of inserting a second — enforced at the
  service layer plus the §10 unique index. A genuinely different proposal (different evidence/target/
  patch) yields a different key and a new row.
* **Repeated approval clicks.** Approve is **idempotent on the candidate `id`**: a re-sent approve
  for an already-`owner_approved` candidate returns the same result without a second event and
  without any DNA effect. A confirmation token (recommended, Phase 7B §10) guards accidental
  double-submission.
* **Stale-proposal detection.** Approve/apply requires the candidate to be in `needs_owner_review`
  (for approve) / `owner_approved` (for any future apply). An approve against a `superseded` /
  `expired` / already-terminal candidate → **409** (stale).
* **Supersession.** A revision creates a new candidate that sets `supersedes`/
  `superseded_by_candidate_id`; the old row moves to `superseded` (append-only; the old row and its
  evidence are never edited).
* **DNA changed since proposal creation.** Because `current_value_snapshot_json` froze the "before"
  value at proposal time, the service can compare it against the **live** DNA value before any future
  application: if they differ, the proposal is **stale** → expire it (or require a fresh proposal),
  never apply a diff the owner reviewed against an outdated baseline. **This is why
  `current_value_snapshot_json` is required.**

---

## 10. DNA application blocker (binding)

> **This DDL contract does not permit application to Venue DNA.** `owner_approved` is an allowed
> state; an actual DNA write is **not** allowed in this slice or the first implementation slice.

Application (the `owner_approved → applied_to_dna_future` transition, the only edge that crosses
into `venue_intelligence.venue_dna_json`) is **BLOCKED** until **all** of the following exist and are
independently reviewed (inherited from Phase 7B):

* a **Venue DNA snapshot / history** (a restore target — none exists today);
* **per-signal provenance** in Venue DNA (or a distinct derived-signals layer), so a promoted signal
  is never indistinguishable from owner-stated founder intent;
* a **reversible / corrective confidence path** (today `mergeVenueDna` confidence is monotonic +
  floored — irreversible — and a second raw writer is forbidden);
* an **owner-confirmation workflow** (dual confirmation);
* a **reviewed `mergeVenueDna` application path** (single writer, called once, additive array
  reconstruction — never a partial array that clobbers owner signals);
* an **audit diff ledger** (before/after, applied delta, confidence before/after, owner confirmation).

Until then: `applied_at`, `applied_by_user_id`, `dna_application_ref` stay **null**, the
`applied_to_dna_future` status/event is **reserved and unreachable**, and a premature apply attempt
emits `application_blocked`. The single-writer invariant holds: the only DNA writer is
`mergeVenueDna`, never invoked from this layer in this contract.

---

## 11. Future API mapping (proposed — do NOT implement)

Each future endpoint mapped to its table effect. **No endpoint is built in this slice.** All mirror
the capture route posture: `requireAuth('owner')` + explicit in-handler admin re-exclusion;
`req.venueId` scoping; cross-venue id → 404; unauthenticated → 401.

| Endpoint | Reads/writes | Status transition | Audit event | Forbidden fields | Owner / Admin / Manager |
|---|---|---|---|---|---|
| `GET /api/owner-meaning-promotion-candidates` | reads `owner_meaning_promotion_candidates` (+ event_count) | none | none | client `venue_id`; widening venue scope | Owner ✅ · Admin ❌ (OPEN, default blocked) · Manager ❌ |
| `GET /api/owner-meaning-promotion-candidates/:id` | reads candidate + events; resolves source captures (verbatim) | none | none | client `venue_id` | Owner ✅ · Admin ❌ (OPEN) · Manager ❌ |
| `POST /api/owner-meaning-promotion-candidates/:id/reject` | writes candidate + event | `needs_owner_review → owner_rejected` | `owner_rejected` | client `status`/`venue_id`/`applied_*` | Owner ✅ · Admin ❌ (403) · Manager ❌ |
| `POST /api/owner-meaning-promotion-candidates/:id/request-revision` | writes candidate + event | `needs_owner_review → revision_requested` | `owner_requested_revision` | client `status`/`venue_id`/`applied_*` | Owner ✅ · Admin ❌ (403) · Manager ❌ |
| `POST /api/owner-meaning-promotion-candidates/:id/approve` | writes candidate + event; **no DNA write** | `needs_owner_review → owner_approved` (stops; **never** auto `applied_to_dna_future`) | `owner_approved` (+ `application_blocked` if an apply is attempted) | client `status`/`venue_id`/`applied_at`/`applied_by_user_id`/`dna_application_ref`; any free-form DNA patch | Owner ✅ (+confirm token) · Admin ❌ (403) · Manager ❌ |

> **Approve is the only endpoint that could *ever* later cause a DNA mutation — and only via the
> reviewed `mergeVenueDna` path after §10. In the first implementation it stops at `owner_approved`
> and writes nothing to Venue DNA.** There is no `/apply` endpoint in this contract.

---

## 12. Future test contract

These tests **ship in the same slice as the code they cover** (negative guardrails are never
deferred). They mirror the `test:owner-meaning-capture-*` posture and register as
`scripts/test-owner-meaning-promotion-*` npm scripts.

* **DDL creates both tables idempotently** — running the DDL twice is a no-op (`CREATE TABLE IF NOT
  EXISTS` / `CREATE INDEX IF NOT EXISTS`).
* **candidate insert requires `venue_id` server-side** — a body `venue_id` is ignored; the row's
  `venue_id` equals `req.venueId`.
* **candidate insert rejects invalid status** — any value outside §5 is rejected by absence (CHECK +
  service throw).
* **confidence range enforced** — if `confidence_score` is written it is within the chosen scale;
  `confidence_label` ∈ {`low`,`medium`}; no numeric is rendered.
* **owner approval transition writes an event** — `owner_approved` emits an `owner_approved` event,
  audit-first; `reviewed_by_user_id`/`reviewed_at`/`approved_at` set.
* **rejected candidate cannot be approved without a new revision** — approve on `owner_rejected` →
  409; only a new (superseding) candidate can be approved.
* **stale candidate cannot apply** — approve/apply on `superseded`/`expired`/terminal → 409; a
  candidate whose `current_value_snapshot_json` no longer matches live DNA is expired, not applied.
* **cross-venue candidate read returns safe 404** — a foreign candidate id → 404, no leak.
* **admin blocked from approval** — admin approve/reject/request-revision → 403; zero rows touched.
* **manager / bar_manager blocked from approval** — → 403.
* **capture POST cannot create a promotion candidate** — `POST /api/owner-meaning-captures` writes
  only capture tables; it never inserts into `owner_meaning_promotion_candidates`.
* **composer UI cannot create a promotion candidate** — the composer captures words only; no
  approve/promote/apply affordance (existing 4E composer tests stay green).
* **no `mergeVenueDna` call from candidate creation** — source-level guard: the promotion service
  does not import or call `mergeVenueDna` and writes no `venue_dna_json`.
* **`owner_approved` does not mutate Venue DNA** — after approval, `venue_dna_json` is unchanged;
  `applied_at`/`dna_application_ref` are null.
* **`applied_to_dna_future` is blocked/reserved** — no code transitions into it; an apply attempt
  emits `application_blocked`, never `applied_to_dna_future`.

---

## 13. Open decisions (do NOT resolve silently)

| # | Open question | Recommended default |
|---|---|---|
| 1 | `confidence_score` scale — 0.0–1.0 or 0–100? | **0.0–1.0** if stored (clean thresholds; not a user-facing %), **but leave NULL in 4G** — label + factors authoritative. |
| 2 | `proposed_dna_patch_json` shape — JSON Patch, merge patch, or domain patch? | OPEN. Lean **domain patch** (a bounded `{ target_path, op, value }` for the one allow-listed field) — simplest to validate and bound; no arbitrary paths. |
| 3 | First promoted field — `owner_notes`, `service_style`, or another? | OPEN. Recommend **one narrow, low-risk field** (`owner_notes` first), no arbitrary DNA patching. |
| 4 | Should admin ever get read-only access to the queue? | OPEN. Default **blocked**; revisit only with an explicit, audited policy. |
| 5 | Is owner approval reversible, or supersede-only? | OPEN. Recommend **supersede-only** (append-only history) over in-place reversal, consistent with the capture layer. |
| 6 | How are conflicting captures handled? | OPEN. Recommend a `contradictory` consistency value that **blocks** advancement to `needs_owner_review` (or forces the contradiction to the top and bars approval until resolved). |
| 7 | How many source captures are required for `medium` (vs `low`) confidence? | OPEN. Recommend ≥ 2 recent, consistent captures for `medium`; never `high` from owner-meaning evidence alone in 4G. |
| 8 | Should proposal generation be manual, scheduled, or triggered by capture volume? | OPEN. Recommend **manual / explicit** generation first (deterministic, owner-visible), not background scheduling, until the queue is proven. |
| 9 | Add the third table `venue_dna_change_proposals`? | OPEN. **Deferred** (§1) — not needed while application is blocked; add only if a real DNA-write ledger separate from the promotion audit emerges. |

### Recommendation for the first implementation slice (4G)

Start as narrow as the doctrine allows:

* **one narrow `proposed_target_path` only** — likely `owner_notes` or `service_style`;
* **no arbitrary DNA patching** — a bounded domain patch for that single field;
* **no `applied_to_dna` behavior** — build draft → review → approve, **stop at `owner_approved`**,
  write **zero** Venue DNA;
* prove, with the §12 tests, that approval mutates no DNA and the capture/read/compose boundaries
  are untouched.

---

## Final principle (restated)

> This contract preserves the boundary: captured owner words are evidence (referenced, never
> relabelled), a promotion candidate is a *proposed* reading (reviewable, rejectable), `owner_approved`
> is the owner's decision and **not** a DNA write, and `applied_to_dna_future` stays reserved and
> blocked until the snapshot/provenance/reversal/confirmation infrastructure exists. HESTIA may
> propose; only the owner may approve; and nothing reaches canonical Venue DNA in this contract.
