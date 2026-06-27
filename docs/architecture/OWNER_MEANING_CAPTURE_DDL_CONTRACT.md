# HESTIA Owner Meaning Capture — Exact DDL Contract (Slice 4C.2)

> **Status:** Slice 4C.2 — **docs-only DDL contract.** No application code, no migration, no
> table, no boot-time schema, no `db.exec`, no endpoint, no write service, no service file, no
> UI input, no answer composer, no test. Nothing here persists `owner_response_raw` or
> `captured_owner_meaning`, mutates Venue DNA, imports/calls `mergeVenueDna`, adds a
> confirmation/promotion flow, adds `eligible_for_future_proposal`, or creates any
> `POST`/`PATCH`/`PUT`/`DELETE` route. This document is the **exact future DDL contract** that
> Slice 4D will implement from. It is **not** an implementation.
>
> **Binding parents (in precedence order):**
> 1. `docs/architecture/OWNER_MEANING_CAPTURE_DESIGN.md` (Slice 4A) — doctrine.
> 2. `docs/architecture/OWNER_MEANING_CAPTURE_SCHEMA_REVIEW.md` (Slice 4C) — schema review.
> 3. `docs/architecture/OWNER_MEANING_CAPTURE_IMPLEMENTATION_DECISIONS.md` (Slice 4C.1) — locked decisions.
>
> Where this contract and any parent differ, the parent wins and this file is the bug.
>
> **Source of truth at authoring time:** `origin/main @ 6e0c45a` — *docs: lock owner meaning
> capture implementation decisions*. HEAD == origin/main, working tree clean.
>
> **Precedent module (mirror its posture field-for-field):**
> `src/services/venueIntelligence/discoveryCandidateReviewService.js` and its boot wiring at
> `server.js:1204-1205`.

---

## 1. Purpose

This document is the **exact DDL contract** for the future Owner Meaning Capture persistence layer
(Slice 4D). Its job is to remove every schema decision from 4D so that 4D writes code, not design.

When 4D begins, it should be able to:

* declare two exported DDL constants whose column lists, types, nullability, and indexes are
  copied verbatim from §3 / §4 / §7 of this document;
* wire them at boot via `db.exec(...)` exactly like `server.js:1204-1205` wires
  `DISCOVERY_CANDIDATE_REVIEWS_DDL` / `DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL`;
* implement validation, provenance, fingerprinting, and supersession against the rules here;

…without inventing a single column name, type, status value, provenance value, record space,
index, or constraint.

**This is a contract, not code.** It creates no table, runs no `db.exec`, edits no `server.js`,
adds no migration, and ships no test. The first byte of `owner_response_raw` is written in 4D, not
here. If anything in this file looks like it persists data, that is a documentation defect — report
it, do not act on it.

The contract is deliberately **conservative**: where 4D has a choice between "more capable" and
"smaller and safer," this document picks smaller and safer, and says so. 4D may not widen the
surface beyond what this contract authorizes without a new, explicit decision slice.

---

## 2. Tables

Slice 4D defines **exactly two** future tables, and no others:

| Table | Role | Layer |
|---|---|---|
| `owner_meaning_captures` | One row per captured owner answer to one candidate's question. Holds **current state** + the immutable snapshot + the verbatim owner words. | **Venue Memory** |
| `owner_meaning_capture_events` | Append-only audit trail of state changes on a capture. Holds the **immutable history**. | **Venue Memory** |

**Both tables are Venue Memory layer tables.** They are:

* **NOT** Venue Intelligence — they carry no interpretation, no confidence judgment about the venue,
  no derived suspicion. They are the owner speaking, saved verbatim.
* **NOT** Venue DNA — they are not confirmed identity, are never read as identity, and have
  structurally nowhere for their contents to flow into DNA.

They are **siblings** of `discovery_candidate_reviews` / `discovery_candidate_review_events` — a
new, isolated record class in the same Memory layer, modeled on the same posture (isolated,
venue-scoped, owner-writable, immutable snapshot, server-set provenance, hard-coded `record_space`,
append-only audit with no enforced FK, confirmation unexpressible by vocabulary). They are **not**
children of the discovery tables and are wholly separate from any Venue DNA / Venue Intelligence
store.

This document does **not** create these tables. It specifies the shape 4D will create.

---

## 3. `owner_meaning_captures` — exact columns

One row per captured owner answer. SQLite-compatible types follow the precedent: everything is
`TEXT` except where an integer/boolean is genuinely needed (there are none here). Timestamps are
ISO/SQL `TEXT` (matching `discovery_candidate_reviews.created_at` defaults).

| # | Column | Type | Nullable | Source | Mutability |
|---|---|---|---|---|---|
| 1 | `id` | `TEXT PRIMARY KEY` | NOT NULL | Server (mint UUID; or accept a UUID-shaped client id only for idempotent retry continuity, validated like `upsertDiscoveryReview`) | **Immutable** |
| 2 | `venue_id` | `TEXT NOT NULL` | NOT NULL | Server from `req.venueId` | **Immutable** |
| 3 | `concept_ref` | `TEXT NOT NULL` | NOT NULL | Server-validated from request context (UUID-shaped) | **Immutable** |
| 4 | `candidate_fingerprint` | `TEXT NOT NULL` | NOT NULL | Server-computed (§9); never trusted from client | **Immutable** |
| 5 | `fingerprint_version` | `TEXT NOT NULL` | NOT NULL | Server constant (`owner_meaning_candidate_fingerprint_v1`) | **Immutable** |
| 6 | `candidate_snapshot_json` | `TEXT NOT NULL` | NOT NULL | Server (frozen candidate as shown, §10) | **Immutable** |
| 7 | `snapshot_taken_at` | `TEXT NOT NULL` | NOT NULL | Server timestamp | **Immutable** |
| 8 | `question_text` | `TEXT NOT NULL` | NOT NULL | Server (verbatim `suggested_owner_question` at ask time) | **Immutable** |
| 9 | `question_reason` | `TEXT NOT NULL` | NOT NULL | Server (verbatim candidate basis: missing-evidence / contradiction) | **Immutable** |
| 10 | `owner_response_raw` | `TEXT NOT NULL` | NOT NULL | **User** (owner free text) | **Immutable / verbatim** |
| 11 | `confidence_band` | `TEXT` | NULL | Server-derived; `null` or `low` only | Effectively write-once; nullable |
| 12 | `uncertainty_notes_json` | `TEXT` | NULL | Server (verbatim from candidate) | **Immutable** (recommend not mutating in 4D) |
| 13 | `provenance` | `TEXT NOT NULL` | NOT NULL | Server-hard-coded `owner_response` | **Immutable** |
| 14 | `record_space` | `TEXT NOT NULL` | NOT NULL | Server-hard-coded `concept_draft` | **Immutable** |
| 15 | `status` | `TEXT NOT NULL` | NOT NULL | Server-validated (§5 vocabulary) | Mutable (lifecycle only) |
| 16 | `superseded_by` | `TEXT` | NULL | Server | Mutable (set once when superseded) |
| 17 | `supersedes` | `TEXT` | NULL | Server | Set at creation; otherwise immutable |
| 18 | `created_by` | `TEXT NOT NULL` | NOT NULL | Server from `req.user` (full_name/id) | **Immutable** |
| 19 | `created_at` | `TEXT NOT NULL` | NOT NULL | Server (`DEFAULT CURRENT_TIMESTAMP`) | **Immutable** |
| 20 | `updated_at` | `TEXT NOT NULL` | NOT NULL | Server (`DEFAULT CURRENT_TIMESTAMP`) | Mutable (touch on lifecycle change) |

### Per-column contract

**1. `id` — `TEXT PRIMARY KEY`**
* **Purpose:** stable primary key for the capture record; the upsert/idempotency key.
* **Validation:** UUID-shaped (reuse the `UUID_RE` / `isUuidLike` precedent). Global PRIMARY KEY.
* **Mutability:** immutable.
* **Source:** server-minted; a client-supplied id is honored **only** if UUID-shaped and only for
  idempotent retry continuity (exactly as `upsertDiscoveryReview` honors `input.id`).
* **Forbidden:** a non-UUID id; a reused id belonging to another venue (→ 404, never foreign-write).

**2. `venue_id` — `TEXT NOT NULL`**
* **Purpose:** access boundary only — **never the subject** of the record. The subject is the
  concept thread.
* **Validation:** non-empty; must equal the server-resolved `req.venueId`.
* **Mutability:** immutable.
* **Source:** server from `req.venueId`. **Never read from the client body.**
* **Forbidden:** a client-supplied `venue_id` (it would open a cross-venue write hole).

**3. `concept_ref` — `TEXT NOT NULL`**
* **Purpose:** the concept thread the candidate belongs to; links to
  `discovery_candidate_reviews.concept_ref`.
* **Validation:** UUID-shaped; required.
* **Mutability:** immutable.
* **Source:** server-validated from request context.
* **Forbidden:** substituting `venue_id` for `concept_ref`; a missing/blank value.

**4. `candidate_fingerprint` — `TEXT NOT NULL`**
* **Purpose:** the **deterministic** handle for the candidate (§9) — the stable join key, since
  `candidate_id` is ephemeral.
* **Validation:** non-empty; produced by the documented algorithm under the stored
  `fingerprint_version`.
* **Mutability:** immutable.
* **Source:** server-computed from server-trusted evidence refs.
* **Forbidden:** the ephemeral `candidate_id`; any `randomUUID()` candidate id; any client-supplied
  or UI-generated id used as the fingerprint.

**5. `fingerprint_version` — `TEXT NOT NULL`**
* **Purpose:** declares which fingerprint algorithm produced row 4, so the algorithm can evolve
  without silently re-binding old records.
* **Validation:** non-empty; initial value exactly `owner_meaning_candidate_fingerprint_v1`.
* **Mutability:** immutable.
* **Source:** server constant.
* **Forbidden:** a blank version; mutating a stored version.

**6. `candidate_snapshot_json` — `TEXT NOT NULL`**
* **Purpose:** the candidate exactly as shown to the owner at answer time — the source of truth for
  what they responded to. The single most important protection in the layer (the candidate is
  ephemeral and may not re-derive).
* **Validation:** `NOT NULL`; well-formed JSON; contains the §10 snapshot fields.
* **Mutability:** immutable. Never rewritten on any later state change (mirror
  `discovery_candidate_reviews`).
* **Source:** server, captured from the live candidate at write time.
* **Forbidden:** null/empty; containing the owner answer; containing any DNA target / promotion hint
  (§10).

**7. `snapshot_taken_at` — `TEXT NOT NULL`**
* **Purpose:** when the snapshot was captured.
* **Validation:** ISO/SQL datetime.
* **Mutability:** immutable.
* **Source:** server timestamp.
* **Forbidden:** a client-supplied future/fabricated time used to reorder forensics.

**8. `question_text` — `TEXT NOT NULL`**
* **Purpose:** the question HESTIA asked, captured verbatim at ask time (from the candidate's
  `suggested_owner_question`).
* **Validation:** non-empty string.
* **Mutability:** immutable.
* **Source:** server, captured (not re-derived later).
* **Forbidden:** re-deriving/replacing it later (would claim the owner answered a question they were
  never shown).

**9. `question_reason` — `TEXT NOT NULL`**
* **Purpose:** why HESTIA asked — the candidate's missing-evidence / contradiction basis, verbatim
  (from candidate `missing_evidence` / `uncertainty_notes`).
* **Validation:** non-empty string. (See §6 note: if a candidate ever genuinely lacks a reason,
  the service must supply a server-derived non-empty basis rather than fabricate one or store
  blank; a truly absent reason is a 400, not a null row, because the column is `NOT NULL`.)
* **Mutability:** immutable.
* **Source:** server.
* **Forbidden:** fabricating a reason that was not the candidate's actual basis.

**10. `owner_response_raw` — `TEXT NOT NULL`**
* **Purpose:** **the owner's own words, verbatim.** The richest, most honest signal in the flow.
* **Validation:** non-empty after trim (≥ 1 non-whitespace char) and ≤ 8000 characters
  (§6 / §5 of 4C.1). Validation may **reject**; it must never **rewrite**. The check is a gate,
  not a transform.
* **Mutability:** **immutable, never normalized.** Stored **byte-for-byte** as submitted — no
  trim-into-storage, no case-fold, no paraphrase, no summarize, no translate, no truncation.
* **Source:** user (owner free text).
* **Forbidden:** any normalization of the **stored** value; in-place edits after creation (a
  correction is a new superseding row, §8).

**11. `confidence_band` — `TEXT` (nullable)**
* **Purpose:** HESTIA's reading of *its own question context*; a word band, floor-only.
* **Validation:** `null` **or** `low` only. **Never numeric.** Must never exceed the candidate's
  own band.
* **Mutability:** effectively write-once; nullable. **Recommendation: 4D does not write this column
  at all** (leave `null`) — see §5. If 4D writes it, only `low`.
* **Source:** server-derived (not a user trust input).
* **Forbidden:** any number, scale, meter, percentage, ring; `medium`/`high`; raising candidate
  confidence.

**12. `uncertainty_notes_json` — `TEXT` (nullable)**
* **Purpose:** honest uncertainty carried alongside, verbatim from the candidate.
* **Validation:** well-formed JSON array of strings, or `null`.
* **Mutability:** immutable. **Recommendation: do not mutate in 4D** (see §8).
* **Source:** server, from the candidate.
* **Forbidden:** dropping captured uncertainty so the record reads more certain than it is.

**13. `provenance` — `TEXT NOT NULL`**
* **Purpose:** the record's authority class.
* **Validation:** hard-coded enum — exactly `owner_response`.
* **Mutability:** immutable.
* **Source:** server-hard-coded. **Never trusted from the client.**
* **Forbidden:** any client-supplied provenance; any value other than `owner_response` (§5).

**14. `record_space` — `TEXT NOT NULL`**
* **Purpose:** Memory partition / conflation guard.
* **Validation:** hard-coded enum — exactly `concept_draft`. Reads filter on it.
* **Mutability:** immutable.
* **Source:** server-hard-coded. **Never read from the client.**
* **Forbidden:** `live_venue` (would let a draft be read as live-venue truth); any other value (§5).

**15. `status` — `TEXT NOT NULL`**
* **Purpose:** the **capture record's own** lifecycle — never a claim about venue truth.
* **Validation:** one of the §5 allowed set. Forbidden values rejected by absence.
* **Mutability:** mutable **only** across the allowed set; supersession preferred over edit (§8).
* **Source:** server-validated.
* **Forbidden:** every value in the §5 forbidden list (`confirmed`/`approved`/`promoted`/`true`/
  `final`/`captured_as_owner_meaning`/`eligible_for_future_proposal`).

**16. `superseded_by` — `TEXT` (nullable)**
* **Purpose:** logical link to the capture that replaced this one.
* **Validation:** UUID of a capture in the **same** `(venue_id, concept_ref)`, or `null`.
* **Mutability:** set once when this row is superseded; otherwise unset.
* **Source:** server.
* **Forbidden:** pointing across venue/concept; an enforced FK (kept logical, like the audit ref).

**17. `supersedes` — `TEXT` (nullable)**
* **Purpose:** logical link to the prior capture this one replaced.
* **Validation:** UUID of a prior capture in the same `(venue_id, concept_ref)`, or `null`.
* **Mutability:** set at creation when replacing; otherwise immutable.
* **Source:** server.
* **Forbidden:** same as `superseded_by`, inverse direction.

**18. `created_by` — `TEXT NOT NULL`**
* **Purpose:** the owner who answered (accountability of owner truth).
* **Validation:** non-empty.
* **Mutability:** immutable.
* **Source:** server from `req.user` (`full_name` || `id`). **Never the body.**
* **Forbidden:** a spoofable client-supplied author.

**19. `created_at` — `TEXT NOT NULL`**
* **Purpose:** server creation timestamp.
* **Validation:** datetime. `DEFAULT CURRENT_TIMESTAMP` (precedent style).
* **Mutability:** immutable.
* **Source:** server.
* **Forbidden:** client-supplied creation time.

**20. `updated_at` — `TEXT NOT NULL`**
* **Purpose:** server last-touch timestamp.
* **Validation:** datetime. `DEFAULT CURRENT_TIMESTAMP`; touched on lifecycle change.
* **Mutability:** mutable (forensic ordering only).
* **Source:** server.
* **Forbidden:** treating a change to `updated_at` as evidence of a content change (content never
  changes).

> **`captured_owner_meaning` is deliberately ABSENT** — HESTIA's interpretation of the owner's
> words. It is the single highest self-confirmation risk and must not exist in this schema (§5).

---

## 4. `owner_meaning_capture_events` — exact columns

Append-only audit trail. One row per recorded state change (audit-first ordering, §11). Mirrors
`discovery_candidate_review_events`.

| # | Column | Type | Nullable | Source | Notes |
|---|---|---|---|---|---|
| 1 | `id` | `TEXT PRIMARY KEY` | NOT NULL | Server (mint UUID) | Audit row PK |
| 2 | `venue_id` | `TEXT NOT NULL` | NOT NULL | Server from `req.venueId` | Access boundary |
| 3 | `capture_id` | `TEXT NOT NULL` | NOT NULL | Server | **Logical** ref to `owner_meaning_captures.id`; **NOT** an enforced FK |
| 4 | `event_type` | `TEXT NOT NULL` | NOT NULL | Server-validated | Allowed set below |
| 5 | `event_payload_json` | `TEXT NOT NULL` | NOT NULL | Server | Well-formed JSON describing the transition (e.g. `{ "from_status": …, "to_status": … }`) |
| 6 | `created_by` | `TEXT NOT NULL` | NOT NULL | Server from `req.user` | Actor |
| 7 | `created_at` | `TEXT NOT NULL` | NOT NULL | Server (`DEFAULT CURRENT_TIMESTAMP`) | Audit timestamp |

**Append-only.** Audit rows are never updated and never deleted. Written **before** the main row
(audit-first, §11). `capture_id` is a **logical** reference: because the audit row is written before
the capture row exists, an enforced FK would reject the load-bearing ordering — **do not add a
`FOREIGN KEY` clause and do not enable `PRAGMA foreign_keys` for these tables** (exact precedent at
`discoveryCandidateReviewService.js:64-68`).

### Allowed `event_type` values for the first implementation

| `event_type` | Emitted when |
|---|---|
| `owner_answer_captured` | A new capture row is created from an owner answer. **Always** emitted (the only mandatory event in 4D). |
| `owner_answer_superseded` | An existing capture is marked superseded because a later answer replaced it — **only if** 4D implements supersession. |
| `candidate_no_longer_present` | A capture is marked as referencing a candidate that no longer derives — **only if** 4D validates candidate drift at write time. |

**Recommendation — fewer is safer for 4D:** ship **only `owner_answer_captured`** as a guaranteed
event, and emit `owner_answer_superseded` **only** in the same commit that implements supersession,
and `candidate_no_longer_present` **only** if drift validation is actually built. Do **not** declare
an `event_type` the product cannot yet produce honestly. The column accepts the three values; the
service emits only the ones whose flows exist. This mirrors §3 of 4C.1 (smallest honest
vocabulary). The validated allow-list in code should still contain all three, so a future flow does
not need a schema change — only the *emission* is gated.

> The audit table intentionally has **no** confirmation/promotion `event_type`. There is no
> `owner_answer_confirmed`, `promoted`, or `approved` event — confirmation is unexpressible here
> too.

---

## 5. Controlled vocabulary

Exact, closed vocabularies for 4D. Anything outside these sets is rejected by absence (a validation
throw → 400), exactly as `normalizeDiscoveryReview` rejects non-member `review_action` values.

### Allowed `status` values (4D)

* `owner_answer_captured` — the normal terminal state of a fresh capture.
* `superseded_by_later_answer` — a later capture replaced this one (`superseded_by` points to it).
  Emit **only if** supersession is implemented in 4D.
* `candidate_no_longer_present` — the live candidate no longer derives; the record remains valid via
  its snapshot. Emit **only if** drift validation is implemented in 4D.

> Deliberately **omitted** from 4D (reserved in the design doc but **not emitted**): `unasked`,
> `question_displayed` (4D writes only on answer — §1 of 4C.1), and `needs_followup` (no concrete
> follow-up flow exists yet). Do not implement them in 4D.

### Allowed `provenance` values (4D)

* `owner_response` — **and nothing else.** Server-hard-coded; never client-supplied.

### Allowed `record_space` values (4D)

* `concept_draft` — **and nothing else.** Server-hard-coded; `live_venue` is never written here.

### Allowed `confidence_band` values (4D)

* `null` **or** `low` — **and nothing else.** Never numeric.
* **Recommendation:** 4D should **omit writing confidence entirely** (always `null`). The owner's
  words do not need a HESTIA-authored band to be preserved, and a band — even `low` — is HESTIA's
  reading of its own question, not the owner's. Leaving it `null` keeps the first write purely the
  owner's words plus provenance. If a later slice wants a floor-only band, it can add it without a
  schema change (the column already exists, nullable).

### Forbidden everywhere in 4D schema and vocabulary

These must be **impossible to express** — no column, status, provenance, event type, payload key, or
value may equal any of them. A static guardrail test should fail if any appears in the service
source outside a comment/doc reference:

* `confirmed`
* `approved`
* `promoted`
* `true` (as a status/confirmation value)
* `final`
* `captured_as_owner_meaning`
* `eligible_for_future_proposal`
* `proposed_dna_change`
* `dna_target`
* `destination_hint`
* any **numeric confidence** (number, scale, meter, percentage, ring)

The rule is **vocabulary, not vigilance**: confirmation is prevented because there is no value that
can mean it, not because code remembers to check.

---

## 6. Constraints

Recommended constraints, expressed in the repo's DDL style (`CREATE TABLE IF NOT EXISTS`, `TEXT`
columns, `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP`). The precedent table uses **no `CHECK`
constraints** — it enforces vocabulary in the service (`normalizeDiscoveryReview` throws). 4D may
follow either path; this section states both and recommends one.

### NOT NULL constraints (required)

The following columns are `NOT NULL` (matching §3 / §4):

* `owner_meaning_captures`: `id`, `venue_id`, `concept_ref`, `candidate_fingerprint`,
  `fingerprint_version`, `candidate_snapshot_json`, `snapshot_taken_at`, `question_text`,
  `question_reason`, `owner_response_raw`, `provenance`, `record_space`, `status`, `created_by`,
  `created_at`, `updated_at`.
* Nullable: `confidence_band`, `uncertainty_notes_json`, `superseded_by`, `supersedes`.
* `owner_meaning_capture_events`: all seven columns are `NOT NULL`.

### CHECK constraints (recommended, optional — compatible with `node:sqlite`)

`node:sqlite` supports column/table `CHECK` constraints. They are a cheap second wall behind the
service validation, for the **closed, finite** vocabularies only. **Recommendation: add these CHECK
constraints** — they are safe because the values are server-hard-coded enums, and they make a
forbidden value impossible at the storage layer too:

```
status        TEXT NOT NULL CHECK (status IN
                ('owner_answer_captured','superseded_by_later_answer','candidate_no_longer_present')),
provenance    TEXT NOT NULL CHECK (provenance = 'owner_response'),
record_space  TEXT NOT NULL CHECK (record_space = 'concept_draft'),
confidence_band TEXT CHECK (confidence_band IS NULL OR confidence_band = 'low'),
```

And for the audit table:

```
event_type    TEXT NOT NULL CHECK (event_type IN
                ('owner_answer_captured','owner_answer_superseded','candidate_no_longer_present')),
```

These CHECKs encode the §5 closed sets. They do **not** replace service-level validation — they
back it up. If 4D prefers strict precedent fidelity (the discovery tables use no CHECKs), it may
omit them, **but then the service-level vocabulary throw is mandatory and the guardrail test must
assert rejection by absence.** Either way, the forbidden values must be unstorable in practice.

### `owner_response_raw` — length bound

* **Max 8000 characters**, enforced in the **service** (reject over-limit with 400), **not** as a
  SQLite `CHECK`. Rationale below.
* **Min ≥ 1 non-whitespace char**, enforced in the **service** (reject blank/whitespace with 400).

### Non-empty / byte-preservation — must be service-level

SQLite `CHECK (length(trim(owner_response_raw)) > 0)` is **expressible**, but the byte-for-byte
preservation requirement makes a service-level gate clearer and safer:

* The stored value must be **byte-for-byte** the submitted text. Validation must `trim()` only to
  **decide acceptance**, never to **store** a trimmed value. A SQLite `CHECK` cannot express "trim
  for the test but store untrimmed" cleanly, and a naive `length()` CHECK counts UTF-16 code units,
  not the bytes/characters the 8000 bound intends.
* Therefore: **non-empty and length bounds are validated in the service** (throw → 400), and the
  **stored column carries the original bytes**. The DDL keeps `owner_response_raw TEXT NOT NULL`
  with no length/trim CHECK.

### Uniqueness policy (binding)

* **Do NOT enforce one row per `candidate_fingerprint`.** No `UNIQUE` constraint on
  `candidate_fingerprint` (alone or with `venue_id`/`concept_ref`).
* **Preserve append-only history.** Multiple captures may exist for one
  `(venue_id, candidate_fingerprint)` over time (§2 of 4C.1).
* **Use supersession instead.** "Exactly one active answer" is a **service-enforced** invariant
  (the latest non-superseded row), never a DB unique constraint — a unique constraint would destroy
  history, which is the opposite of the locked decision.
* The only `UNIQUE` in the schema is the implicit `PRIMARY KEY` on `id` (both tables).

---

## 7. Indexes

Recommended indexes, named to mirror the `idx_dcr_*` / `idx_dcre_*` precedent. Each exists to keep a
real read path cheap; none pre-optimizes a path that does not exist in 4D.

On `owner_meaning_captures`:

| Index | Columns | Why |
|---|---|---|
| `idx_owner_meaning_captures_venue_id` | `(venue_id)` | The access-boundary filter is on **every** read; the cheapest, most-used scope. |
| `idx_owner_meaning_captures_venue_concept_ref` | `(venue_id, concept_ref)` | Per-concept reads — "show captures for this concept thread" — the common query. |
| `idx_owner_meaning_captures_venue_candidate_fingerprint` | `(venue_id, candidate_fingerprint)` | "Find the capture(s) for this candidate" — the core join, and the lookup that drives supersession (find the prior active row for a fingerprint). |
| `idx_owner_meaning_captures_venue_status` | `(venue_id, status)` | "Find the active (non-superseded) capture(s)" — the supersession invariant and any active-only read. |
| `idx_owner_meaning_captures_created_at` | `(created_at)` | Time-ordered listing / forensics (newest-first), matching the discovery list's `ORDER BY created_at DESC`. |

On `owner_meaning_capture_events`:

| Index | Columns | Why |
|---|---|---|
| `idx_owner_meaning_capture_events_venue_id` | `(venue_id)` | Venue-scoped audit reads (the access boundary). |
| `idx_owner_meaning_capture_events_capture_id` | `(capture_id)` | The audit trail for one capture — the primary forensic read (mirrors `idx_dcre_review`). |
| `idx_owner_meaning_capture_events_created_at` | `(created_at)` | Time-ordered audit replay (newest- or oldest-first). |

> Naming note: the precedent uses short names (`idx_dcr_venue`). This contract specifies the
> **explicit longer names** the prompt requires; 4D should use exactly these names so tests and
> docs match. They are still plain `CREATE INDEX IF NOT EXISTS` statements inside the same DDL
> constant.

---

## 8. Immutability contract

### Immutable after creation (a write attempting to change these is a bug and must be impossible to express through the service API)

* `id`
* `venue_id`
* `concept_ref`
* `candidate_fingerprint`
* `fingerprint_version`
* `candidate_snapshot_json`
* `snapshot_taken_at`
* `question_text`
* `question_reason`
* `owner_response_raw`
* `provenance`
* `record_space`
* `created_by`
* `created_at`

On any "update," the **stored** immutable fields win; re-sent client values for immutable fields are
**ignored, not applied** (mirror `upsertDiscoveryReview`, where the stored snapshot wins on update).

### Mutable only for lifecycle

* `status` — only across the §5 allowed set.
* `superseded_by` — set once when this row is superseded.
* `supersedes` — set at creation when replacing a prior row.
* `updated_at` — touched on any lifecycle change.
* `uncertainty_notes_json` — **only if absolutely needed.** **Recommendation: do NOT mutate it in
  4D.** Treat it as immutable; it is captured from the candidate at write time and has no lifecycle
  reason to change. If a later slice needs to amend it, that is a new decision.
* `confidence_band` — may only move toward `low`/`null` (lower-only). **Recommendation: do NOT
  write or mutate it in 4D** (§5); leave it `null`.

### Corrections create a new capture

There is **no in-place edit of content.** If the owner wants to "change their answer," the service
**writes a new capture row** that sets `supersedes` = the prior row's `id`, and updates the prior
row to `superseded_by` = the new row's `id` and `status` = `superseded_by_later_answer`. The
original `owner_response_raw` remains byte-for-byte in the superseded row. The layer is **append-only
for content** and update-only for lifecycle state (§10 of 4C.1).

---

## 9. Fingerprint contract

### `fingerprint_version` initial value

```
owner_meaning_candidate_fingerprint_v1
```

Stored in the dedicated `fingerprint_version` column (row 5 of §3). Required (§7 of 4C.1). Every row
declares the algorithm that produced its `candidate_fingerprint`, so the algorithm can evolve in a
`…_v2` without re-binding existing rows.

### Conceptual normalized input order

The fingerprint is computed from these inputs, in this fixed canonical order, serialized
deterministically (stable key order, sorted id list), then hashed:

1. `record_space` (always `concept_draft`)
2. `concept_ref`
3. `candidate_type` (read from `candidate_snapshot_json` — `contradiction_signal` | `missing_data_signal`)
4. the **sorted** stable supporting review IDs / stable evidence refs (the real
   `discovery_candidate_reviews.id` values from the candidate's `supporting_evidence_refs` /
   `conflicting_evidence_refs` — sorted ascending so array order cannot vary the result)
5. the normalized issue axis / text **only where needed** to disambiguate two otherwise-colliding
   candidates (normalize whitespace/case for the **fingerprint input only** — never for the stored
   snapshot or owner words)
6. `fingerprint_version`

Computed **server-side** from server-trusted evidence refs; **never** accepted from the client as
authoritative.

### Explicitly forbidden as fingerprint inputs / keys

* `candidate_id` (the ephemeral, `randomUUID()`-per-derivation id — marked
  `EPHEMERAL — never persisted`; using it orphans the record on the next derivation)
* any `randomUUID()` candidate id used as a stored reference
* any UI-generated / client-generated id
* any input whose serialization depends on **array order instability** (all id lists must be sorted
  to a canonical order before hashing)

When the candidate no longer derives, the fingerprint may stop matching any live candidate. That is
expected and safe: the snapshot (§10) preserves the record regardless, and
`status = candidate_no_longer_present` records the vanished candidate.

---

## 10. Snapshot contract

`candidate_snapshot_json` is **mandatory (`NOT NULL`) and immutable**. It is the frozen candidate as
shown to the owner at answer time and is the source of truth when the live candidate has drifted or
disappeared.

### Required content (captured verbatim from the live candidate at answer time)

* `candidate_type` (`contradiction_signal` | `missing_data_signal`)
* `concept_ref`
* the candidate's **title/summary or issue text** (`interpretation_title` / `interpretation_summary`,
  or the issue text for the candidate)
* `suggested_owner_question` — the exact question shown to the owner
* the supporting **evidence refs / review IDs** (`supporting_evidence_refs`, and
  `conflicting_evidence_refs` for contradictions — the real review-id-bearing refs)
* `confidence_band` **as displayed if present** (the candidate's own word band, or null)
* `status` **as displayed if present** (the candidate's own status at snapshot time)
* the generated/read timestamp if present (e.g. the candidate's `created_from_summary_version` /
  derivation marker)
* (self-describing) `candidate_fingerprint` and `fingerprint_version`, so the snapshot can be
  re-verified against the stored fingerprint

### Must NOT contain

* the **owner answer** (it lives in `owner_response_raw`, kept **separate** — the snapshot is what
  HESTIA showed; the response is what the owner said; never merge them)
* any **HESTIA-authored captured meaning** / interpretation of the owner's words
  (`captured_owner_meaning`)
* any **DNA target** or destination earmark for DNA
* any **proposed DNA change**
* any **promotion eligibility** hint (`eligible_for_future_proposal` and the like)
* any confirmation vocabulary (§5) or **numeric** confidence
* the ephemeral `candidate_id` as anything **load-bearing** (it may appear as inert provenance
  trivia at most, never used as a key)

How it protects against drift: a later read of the capture does **not** re-derive the candidate; it
reads the frozen snapshot. The record stays valid and interpretable even when the live candidate has
changed or vanished. Without a mandatory snapshot, a vanished candidate would leave an
un-interpretable answer — defeating the entire point.

---

## 11. Route / service contract for 4D (conceptual only — do NOT implement)

4D exposes only the **minimal write** needed to persist the raw owner answer, and nothing more.

### The single write surface

* **One owner-only write route** that creates a capture from an owner answer. Mirror
  `PUT /api/discovery-reviews/:reviewId` (`server.js:6530`): `requireAuth('owner')` **plus** an
  explicit in-route re-exclusion of `admin` (because `requireAuth` has a global admin bypass), so an
  admin write creates **zero** audit and **zero** capture rows.
* **Admin may read later but not write in 4D.** Read routes (if any) follow the discovery read
  precedent (`requireAuth('owner', 'admin')`). Write is owner-only (§4 / §13 of 4C.1).
* **No other new write verb.** No second writer, no confirm route, no promote route, no DNA route.

### Snapshot source decision — **server-derived snapshot, with client-supplied verification inputs**

The contract must choose between (a) **client-submitted snapshot** (the client posts the full
candidate JSON it rendered) and (b) **server-derived snapshot** (the server re-derives the candidate
and freezes it). Analysis:

* **Client-submitted** matches the discovery precedent (`body.candidate_snapshot`) and guarantees
  the snapshot equals exactly what the user saw — but it lets the client author the snapshot's
  contents, which for *this* layer is more dangerous: the snapshot is the integrity anchor, and a
  forged snapshot could smuggle in forbidden fields or misrepresent the candidate.
* **Server-derived** re-derives the candidate live from the owner's saved reviews and freezes the
  server's own object, so the snapshot's structure and vocabulary are server-controlled and cannot
  carry client-authored forbidden fields — but the candidate may have **drifted** between display
  and answer, so the server-derived snapshot might differ from what the owner actually saw.

**Decision: server-derived snapshot is authoritative**, reconciled against client-supplied
**verification inputs**, not a client-supplied snapshot body:

* The client submits the **fingerprint inputs / candidate reference** it rendered (enough to let the
  server recompute `candidate_fingerprint`) plus the `owner_response_raw`.
* The server **re-derives** the candidate for that `concept_ref`/fingerprint, builds the snapshot
  **itself** (server-controlled fields only, §10), and stores that.
* If the candidate **no longer derives** (drift), the server does **not** fabricate one: it either
  rejects (400) or, if 4D implements drift handling, stores with
  `status = candidate_no_longer_present` using whatever frozen reference the client verification
  carried — **but it never accepts a client-authored snapshot body as the stored snapshot.**

This keeps the integrity anchor server-authored (safer for this high-risk layer) while still
honoring "what the owner saw" via the fingerprint match. It is a deliberate, documented divergence
from the discovery precedent's client-submitted snapshot, justified by the higher self-confirmation
risk here.

### Service obligations

* **Preserve `owner_response_raw` byte-for-byte** — validate (non-empty, ≤ 8000) only to accept or
  reject; store the original bytes untouched.
* **`candidate_snapshot_json` mandatory** on the single write (`NOT NULL`); immutable thereafter.
* **Audit-first ordering** — mint `capture_id`, INSERT the `owner_answer_captured` audit event
  **first**, then upsert the capture row (mirror `upsertDiscoveryReview`; `node:sqlite` has no
  `db.transaction()`, so consistency comes from ordering + idempotency on the stable id). An orphan
  audit event after a failed capture write is benign; an un-audited state change is not.
* **No DNA writes.** The service's only tables are `owner_meaning_captures` and
  `owner_meaning_capture_events`. It imports nothing DNA-related and never calls `mergeVenueDna`.
* **Server-set** `provenance` (`owner_response`), `record_space` (`concept_draft`), `created_by`,
  timestamps, and the computed `candidate_fingerprint` — never read from the client.
* **Cross-venue:** a capture id under another venue → **404** (no foreign write); an
  explicit-but-unauthorized venue header → **403** (from `resolveVenueId`); unauthenticated → 401
  (§6 of 4C.1).

---

## 12. 4D test contract

These tests **ship in the same commit as 4D** — not deferred to 4E/4F. They mirror the discovery
test posture (`test:discovery-review-route-behavior`, `test:discovery-review-route-audit`,
`test:discovery-review-persistence`) and should be registered as new `scripts/test-owner-meaning-*`
npm scripts.

### Route tests

* **401** — unauthenticated request to the write route.
* **403** — authenticated but unauthorized for the venue (unauthorized `X-HESTIA-Venue` header).
* **403/404** — role denied per repo precedent (admin write → **403**, re-excluded in-route as in
  `PUT /api/discovery-reviews`).
* **owner-only write** — owner succeeds.
* **admin cannot write** — admin → 403, and creates **zero** capture rows and **zero** audit rows.
* **manager / bar_manager cannot write** — → 403 (separate trust class; never widened, §5 of 4C.1).
* **400 blank answer** — empty/whitespace `owner_response_raw` rejected, no row written.
* **400 over-limit** — `owner_response_raw` > 8000 chars rejected, no row written, never truncated.
* **400 missing required inputs** — missing snapshot-verification inputs / question / fingerprint
  inputs rejected (per the server-derived-snapshot contract, §11).
* **201/200 success for owner** — a well-formed owner answer persists and returns the shaped row +
  a "Venue DNA was not changed" family note.
* **cross-venue capture id → 404, no leak** — a capture id from another venue is not readable or
  writable; existence is not leaked.

### Service tests

* **byte-for-byte round-trip** — `owner_response_raw` is read back exactly as submitted (including
  leading/trailing whitespace, casing, unicode).
* **no normalization/trim on the stored value** — a value with surrounding whitespace is stored
  untrimmed even though validation trimmed to decide acceptance.
* **`candidate_snapshot_json` mandatory** — a write without a derivable snapshot fails; the column
  is `NOT NULL`.
* **`candidate_snapshot_json` immutable** — a later lifecycle change never rewrites the snapshot.
* **deterministic fingerprint** — the same candidate inputs produce the same
  `candidate_fingerprint` across derivations; a different supporting-id set produces a different
  fingerprint; id array order does not change the result.
* **`fingerprint_version` stored** — equals `owner_meaning_candidate_fingerprint_v1`.
* **append-only behavior** — a "corrected" answer creates a new row; the prior row still exists.
* **supersession does not rewrite the old answer** — the superseded row keeps its original
  `owner_response_raw` byte-for-byte; only `status`/`superseded_by`/`updated_at` change.
* **audit event created** — `owner_answer_captured` is written, audit-first, before the capture row.
* **forbidden vocabulary rejected** — any forbidden `status`/`provenance`/`record_space`/
  `confidence_band` value (or numeric confidence) is rejected by absence.

### Source-level guardrail tests (assert against module source)

* **no `mergeVenueDna` import/reference** in the Owner Meaning Capture module.
* **no writes to Venue DNA stores** — the source contains no write to `venue_dna_json` /
  `venue_intelligence` / `venue_briefs` / `venue_dna_enrichment`.
* **no `captured_owner_meaning`** outside docs — the token does not appear as a column/field in the
  service or DDL.
* **no `eligible_for_future_proposal`** outside docs.
* **no `proposed_dna_change` / `dna_target`** fields anywhere in the schema or service.
* **no new write verb** — the diff adds **exactly one** `POST`/`PATCH`/`PUT`/`DELETE` route (the
  single approved 4D capture-creation route) and no other.

### UI tests

* **no answer composer until 4E** — no `<input>`/`<textarea>`/`<form>`/submit affordance is added in
  4D; 4B's read-only preview lock (`test:interpreted-candidates-ui`) stays green.
* **no confirm/approve/promote/add-to-DNA wording** — none of the forbidden UI strings appears
  (`Confirm this insight`, `Is this correct?`, `Approve`, `Promote`, `Add to Venue DNA`,
  `Confirmed`, `Final`, any checkmark/success-green truth state, any confidence number/meter).

---

## 13. Risks and final gate

### Remaining risks before 4D

1. **Server-derived snapshot vs. drift (§11).** Choosing server-derived snapshot means the snapshot
   is server-authored and safer, but the candidate can drift between display and answer. **Mitigation:**
   reconcile via the fingerprint; if the candidate no longer derives, reject (400) or store
   `candidate_no_longer_present` — never fabricate a snapshot. 4D must implement the drift branch or
   explicitly reject on drift; it must not silently store a mismatched snapshot.
2. **Fingerprint disambiguation (§9 step 5).** The "normalized issue axis / text only where needed"
   input is the one non-mechanical part of the fingerprint. If two genuinely different candidates
   under one `concept_ref` share the same supporting-id set, they could collide. **Mitigation:** 4D
   must lock the exact disambiguation rule (and its normalization) before the first row is written,
   and a test must prove two distinct candidates do not collide.
3. **`question_reason` NOT NULL vs. genuinely-absent reason (§3 col 9).** The column is `NOT NULL`,
   but a candidate's reason could theoretically be empty. **Mitigation:** the service supplies a
   server-derived non-empty basis (the candidate's `missing_evidence`/`uncertainty_notes` always
   exist for the two emitted candidate types) or returns 400; it never stores blank and never
   fabricates a false reason.
4. **CHECK constraints vs. precedent fidelity (§6).** Adding CHECKs diverges from the discovery
   tables (which use none). **Mitigation:** CHECKs are recommended but optional; whichever path 4D
   takes, the service-level vocabulary throw and the guardrail test are mandatory.
5. **Confidence band temptation (§5).** Leaving `confidence_band` in the schema invites a future
   slice to start writing it. **Mitigation:** 4D leaves it `null`; the recommendation to not write
   it is documented; a test asserts it is never numeric and never above `low`.

None of these risks reaches the `mergeVenueDna` path, creates a promotion bridge, or persists
HESTIA's interpretation. They are implementation-sequencing risks, not doctrine breaches.

### Verdict

> **DDL contract APPROVED for 4D implementation after review.**

The two-table shape, exact columns, types, nullability, vocabularies, constraints, indexes,
immutability contract, fingerprint contract, snapshot contract, route/service contract, and test
contract are precise enough for 4D to implement without inventing schema decisions — provided 4D, in
the same commit:

* implements the §11 server-derived-snapshot + drift handling (or explicit drift rejection),
* locks the §9 fingerprint disambiguation rule with a non-collision test,
* preserves `owner_response_raw` byte-for-byte and `candidate_snapshot_json` mandatory + immutable,
* ships the §12 negative guardrail tests (no `mergeVenueDna`, no DNA-store write, no second write
  verb, forbidden vocabulary rejected),
* keeps 4B's read-only preview lock green and adds no UI composer (that is 4E).

---

## Final principle (restated)

> HESTIA may preserve the owner's words about an uncertainty, but it may not convert those words —
> or HESTIA's interpretation of them — into Venue DNA without a separate, explicit, owner-approved
> future flow. This DDL contract preserves the words, stores them byte-for-byte, anchors them to an
> immutable server-authored snapshot, and makes the conversion structurally impossible.
