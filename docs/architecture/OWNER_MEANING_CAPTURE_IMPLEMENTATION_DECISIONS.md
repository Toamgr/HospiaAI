# HESTIA Owner Meaning Capture — Implementation Decisions Lock (Slice 4C.1)

> **Status:** Slice 4C.1 — **docs-only decision lock.** No application code, no migration, no
> table, no boot-time schema, no endpoint, no write service, no UI input, no answer composer.
> Nothing here persists `owner_response_raw` or `captured_owner_meaning`, mutates Venue DNA,
> imports/calls `mergeVenueDna`, adds a confirmation/promotion flow, adds
> `eligible_for_future_proposal`, or creates any `POST`/`PATCH`/`PUT`/`DELETE` route.
>
> **Purpose:** resolve and **lock** the open implementation decisions from the 4C schema review so
> that Slice 4D can be coded without re-litigating design.
>
> **Binding parents:** `docs/architecture/OWNER_MEANING_CAPTURE_DESIGN.md` (4A) and
> `docs/architecture/OWNER_MEANING_CAPTURE_SCHEMA_REVIEW.md` (4C). Where this lock and those
> documents differ, the design doc wins and this file is the bug.
>
> **Source of truth at authoring time:** `origin/main @ ba03c49` — *docs: add owner meaning capture
> schema review*. HEAD == origin/main, working tree clean.

---

## 1. Write trigger — **LOCKED**

A `owner_meaning_capture` record is created **only when the owner submits an answer**.

* Do **not** create a record merely because a question was displayed.
* Do **not** track `question_displayed` in 4D unless a later product decision adds explicit display
  telemetry as its own thing.

**Reason:** a displayed question is not owner meaning. The first valuable memory object is the
owner's raw answer.

---

## 2. Active capture policy — **LOCKED**

Use **append-only history with supersession** — not destructive updates, not a hard single-row
overwrite.

* 4D may allow **multiple captures per `candidate_fingerprint`** over time.
* The latest active answer is determined by **status / supersession**, never by deleting or
  rewriting old owner words.

**Reason:** owner meaning can evolve. HESTIA must preserve history rather than overwrite identity
context.

---

## 3. Statuses for the first write slice — **LOCKED**

Smallest honest lifecycle vocabulary for 4D:

* `owner_answer_captured` — always.
* `superseded_by_later_answer` — **only if** supersession is implemented in 4D.
* `candidate_no_longer_present` — **only if** 4D validates candidate drift at write time.

Do **not** implement `unasked` or `question_displayed` in 4D.
Do **not** implement `needs_followup` unless a concrete follow-up flow exists.

**Reason:** do not model lifecycle states the product cannot yet produce honestly.

---

## 4. Auth — **LOCKED**

Identity-meaning **write is owner-only** for now.

* Admin may **read** if existing owner/admin read patterns require it.
* Admin must **not write** owner meaning in 4D.

**Reason:** admin operates the system; the owner defines founder intent / venue identity meaning. If
admin-write is ever needed, it is a separate, explicit policy decision. (Mirrors the owner-only
write on `PUT /api/discovery-reviews/:reviewId`, where `requireAuth`'s global admin bypass is
explicitly re-excluded inside the route.)

---

## 5. Manager / bar_manager — **LOCKED**

Managers and bar managers **must not write** Owner Meaning Capture records.

If operational clarification is ever needed, it is a **separate trust class** (e.g. "Operational
Clarification") and must **not** feed owner identity meaning.

**Reason:** operational facts and owner identity meaning are different evidence classes; mixing them
pollutes Venue Memory.

---

## 6. Cross-venue behavior — **LOCKED**

* **Unauthenticated → 401.**
* **Authenticated but unauthorized for the venue → 403** (follows `resolveVenueId` boundary; an
  explicit-but-unauthorized `X-HESTIA-Venue` header is rejected, never silently redirected).
* **Existing capture id from another venue → 404** (no existence leak; matches
  `getDiscoveryReviewById` / `upsertDiscoveryReview` foreign-id guard).
* **Missing / unknown capture id within an accessible venue → 404.**

**Reason:** do not leak cross-venue record existence.

---

## 7. Fingerprint version — **LOCKED**

`fingerprint_version` is **required** in the future schema/service.

* Recommended initial value: **`owner_meaning_candidate_fingerprint_v1`**.

**Reason:** the algorithm will likely evolve; versioning prevents future drift from corrupting old
records (an old record always declares which algorithm produced its fingerprint).

---

## 8. Fingerprint input — **LOCKED**

Initial conceptual fingerprint is derived from:

* `record_space`
* `concept_ref`
* `candidate_type`
* **sorted** stable supporting review IDs / stable evidence refs (the real
  `discovery_candidate_reviews.id` values)
* normalized issue axis / text **only where needed** to disambiguate (normalize for the fingerprint
  input only — never the stored snapshot or owner words)
* `fingerprint_version`

Explicitly **forbidden** as inputs/keys:

* ❌ ephemeral `candidate_id`
* ❌ `randomUUID()` candidate IDs
* ❌ UI-generated IDs

**Reason:** candidates are derived live and `candidate_id` is unstable (a fresh `randomUUID()` per
derivation, marked `EPHEMERAL — never persisted`). The fingerprint must be deterministic and
server-computed.

---

## 9. Raw answer length bound — **LOCKED**

4D enforces a generous bound, for **validation only**:

* **min:** ≥ 1 non-empty character after trim (validation gate only — reject blank/whitespace).
* **max:** 8000 characters (reject over-limit with 400; never silently truncate).

**Critical:** do **not** normalize, rewrite, summarize, translate, trim the stored value, or
otherwise mutate `owner_response_raw`. Validation may reject blank/oversized input, but **storage
preserves the submitted text byte-for-byte**.

**Reason:** owner words are source evidence. Validation prevents garbage; it must not rewrite
meaning.

---

## 10. Update vs. supersession — **LOCKED**

No in-place edits of `owner_response_raw` after creation. A correction creates a **new capture** that
`supersedes` the earlier one (earlier row gets `superseded_by` + status
`superseded_by_later_answer`).

**Reason:** raw owner words are evidence; evidence is not rewritten.

---

## 11. Question text / source — **LOCKED**

4D must persist the **exact `question_text` and `question_reason`** shown or used at answer time. If
question copy changes later, old captures must still show what the owner was actually answering.

**Reason:** the answer only makes sense in relation to the question asked.

---

## 12. Snapshot policy — **LOCKED**

`candidate_snapshot_json` is **mandatory (`NOT NULL`) and immutable**. If the candidate later stops
deriving, the snapshot remains the source of truth for what the owner answered.

**Reason:** live derivation can drift; Memory cannot depend on future derivation. (Mirrors the
immutable `candidate_snapshot_json` already enforced in `discovery_candidate_reviews`.)

---

## 13. Admin read — **LOCKED**

Owner/admin **read** access may follow existing discovery read patterns if implemented later. Admin
**write** remains **forbidden** in 4D.

**Reason:** reading operational memory can be admin-level; writing founder meaning is owner-level.

---

## 14. 4D readiness gate

Minimum requirements that must be true before 4D starts coding:

* ✅ **4C.1 committed and pushed** (this document).
* ☐ **Exact DDL shape agreed** (per §3 of the 4C schema review: `owner_meaning_captures` +
  `owner_meaning_capture_events`, isolated Venue Memory siblings).
* ☐ **Owner-only write agreed** (§4 — confirmed; admin re-excluded inside the route).
* ☐ **No `captured_owner_meaning` agreed** (no HESTIA interpretation in the first write).
* ☐ **`fingerprint_version` agreed** (§7 — `owner_meaning_candidate_fingerprint_v1`).
* ☐ **Raw-answer length bound agreed** (§9 — min 1 / max 8000, byte-for-byte storage).
* ☐ **No in-place edits agreed** (§10 — supersession only).
* ☐ **Negative guardrail tests planned in the SAME commit as 4D** (source-level: no `mergeVenueDna`
  import/call, no DNA-store write; route/service: owner-only, 401/403/404, byte-for-byte raw answer,
  mandatory+immutable snapshot, deterministic fingerprint, forbidden vocabulary rejected by absence).

The checked box is the only one 4C.1 can satisfy; the rest are the explicit gate 4D must clear.

---

## 15. Final decision summary

> **Slice 4D may persist owner words, but it may not persist HESTIA's interpretation of those words.**
