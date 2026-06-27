# HESTIA Owner Meaning Capture Design

> **Status:** Slice 4A — docs-only. No application code, no endpoint, no schema, no
> migration, no write path, no UI input, no test changes. This document is a binding
> design reference for future slices; nothing here is implemented yet.
>
> **Source of truth at authoring time:** `origin/main @ 6b4309e` —
> *test: fix owner home completeness UI assertions*. HEAD == origin/main, working tree clean.
>
> **Supersedes:** the earlier "Owner Clarification Loop" proposal, which was audited and
> revised. The name and the persistence shape changed as a result of that audit. See
> the §"Naming decision" and §5 below for what changed and why.

---

## Naming decision — "Owner Meaning Capture", not "Owner Clarification Loop"

This feature is named **Owner Meaning Capture**.

It is deliberately **not** named "Owner Clarification Loop" to avoid collision with the
**existing** *Owner Correction Loop* (`src/services/venueIntelligence/ownerCorrectionLoopFormat.js`),
which is an unrelated chat-bucket formatter for the 5-field "Candidate Venue DNA signals"
section. Two loops with near-identical names would be cross-wired in conversation, in code,
and in tests.

**Definition (read this carefully):**

> **Owner Meaning Capture** means *preserving the owner's own words* about the meaning of an
> uncertainty, contradiction, or missing-data signal. It does **not** mean persisting HESTIA's
> interpretation of those words.

The distinction is the entire point of this design. The owner's words are owner truth and may
be preserved verbatim. HESTIA's reading of those words is interpretation, is lower-trust, and
is **not** part of the first write. Conflating the two is exactly the "captured as meant →
treated as DNA" laundering this layer exists to prevent.

---

## Required doctrine (binding)

1. Owner Meaning Capture is **NOT** confirmation.
2. Owner Meaning Capture is **NOT** promotion.
3. Owner Meaning Capture does **NOT** update Venue DNA.
4. Owner Meaning Capture does **NOT** call `mergeVenueDna`.
5. Owner Meaning Capture does **NOT** persist a HESTIA-authored `captured_owner_meaning` in the
   first write slice.
6. The first future write slice may persist **only**:
   * raw owner answer, verbatim
   * question text
   * question reason
   * deterministic `candidate_fingerprint`
   * mandatory `candidate_snapshot_json`
   * provenance / audit metadata
   * a safe lifecycle status
7. HESTIA's interpretation of the owner's words, **if ever built**, must be a later **separate
   Intelligence-layer derivation** or a separately-approved slice — never part of the first write.

---

## 1. Purpose

Owner Meaning Capture exists so the owner can **help HESTIA understand an uncertainty without
confirming anything**.

Today the venue-discovery flow can surface honest uncertainty: a contradiction (the owner kept
*and* rejected meanings for one concept) or a missing-data signal (a kept meaning that cannot
yet be corroborated). HESTIA already *asks* about these — every interpreted candidate carries a
`suggested_owner_question`, rendered today as a read-only "HESTIA would ask:" preview.

What is missing is a safe way for the owner to **answer in their own words** and have those words
preserved. The value is real:

* The owner's free-text answer is the richest, most honest signal in the whole flow — it is the
  human meaning behind the evidence.
* Preserving it lets future questions be smarter (less repetitive, more specific) and gives a
  future, separate, human-gated promotion flow something true to work from.

But the answer is **Memory, not truth**. Capturing it must not confirm the candidate, must not
resolve the contradiction, and must not touch Venue DNA. The owner is helping HESTIA *understand*,
not *decide*. This document specifies how to preserve those words safely — and, just as
importantly, what must **not** be built around them.

---

## 2. Relationship to HESTIA doctrine

HESTIA separates three layers, and Owner Meaning Capture sits firmly in the first:

* **Venue Memory** — saved evidence, the owner's own words, immutable snapshots. *No certainty.*
* **Venue Intelligence** — interpretation carrying confidence and uncertainty. HESTIA's
  evidence-bound *suspicions*. The AI ceiling so far is the Interpreted Intelligence Candidate.
* **Venue DNA** — confirmed identity only. Human-confirmed. The one thing HESTIA must never
  self-author.

**Where Owner Meaning Capture belongs: Venue Memory.**
It preserves the owner's words. It is the owner speaking, saved verbatim. It carries no certainty
score about the venue and asserts nothing.

**What Owner Meaning Capture must never become:**

* It must never become **Venue DNA**. Owner words about a concept are not a confirmed identity
  attribute.
* It must never become a **promotion bridge** — a structure whose presence implies "this is now
  ready to confirm." Promotion eligibility is a separate, later, explicitly owner-approved flow
  with its own conflict check, proposed change, downstream-effect explanation, audit, and rollback.
* It must never become a place where **HESTIA's interpretation** of the owner's words is stored
  as if the owner said it. Interpretation, if ever built, lives in the Intelligence layer and is
  derived, not written here.

Core doctrine restated for this layer:

* Captured owner words ≠ confirmed DNA.
* Evidence Summary ≠ truth. Interpreted Candidates ≠ truth. Owner Meaning Capture ≠ truth.
* HESTIA must not self-confirm its own interpretation.

---

## 3. Current repo context (architecture description only)

The following is verified, current state — provided so future slices build on what exists rather
than reinventing it. This section describes; it prescribes nothing here.

* **Interpreted candidates are derived live and ephemeral.**
  `deriveInterpretedCandidatesForVenue(db, venueId)` in
  `src/services/venueIntelligence/discoveryCandidateReviewService.js` computes candidates on each
  request and **persists nothing**. There is no candidate row, no candidate table.

* **`candidate_id` is random and unstable.** Each derived candidate is assigned
  `candidate_id: randomUUID()` *per derivation*. It changes every call. It **must not** be used as
  a persistence reference for captured owner words — a stored record keyed on it would orphan on
  the next derivation. (This is why §6 defines a deterministic fingerprint instead.)

* **`suggested_owner_question` already exists as a read-only preview.**
  `InterpretedCandidatesPanel.jsx` already renders each candidate's `suggested_owner_question` as a
  display-only "HESTIA would ask:" block — no input, no submit, no answer affordance. Slice 4B
  formalizes and locks that existing preview; it does not build a new surface.

* **`discoveryCandidateReviewService.js` is the precedent pattern for later persistence design.**
  It already demonstrates the exact isolation posture a future Owner Meaning Capture writer should
  mirror: an isolated, venue-scoped, owner-writable Memory table; an immutable
  `candidate_snapshot_json`; server-set `provenance`; `record_space` hard-coded to `concept_draft`;
  an append-only audit event table with audit-first ordering and no enforced FK; confidence that
  may only be lowered; and **confirmation made impossible to express by vocabulary** (no
  `confirmed`/`approved`/`promoted` value anywhere). It imports nothing DNA-related and never calls
  `mergeVenueDna`.

* **The candidate review PATCH is a precedent for human write without DNA mutation.**
  `PATCH /api/venue-intelligence/candidates/:candidateId/review` (owner/admin only) records a human
  review and explicitly returns "Reviewed as a learning signal only — Venue DNA was not changed."
  It is the template for "an owner writes, and DNA is untouched."

---

## 4. Non-goals (Slice 4A)

Explicitly **out of scope** for this slice and for this document:

* **No code** in Slice 4A.
* **No endpoint.**
* **No schema / migration / DDL.**
* **No write path** of any kind.
* **No UI input** (no textarea, no submit, no form).
* **No DNA mutation.**
* **No confirmation vocabulary** anywhere.
* **No promotion eligibility** concept.
* **No `captured_owner_meaning` persistence** (HESTIA-authored interpretation is not stored).
* **No `mergeVenueDna` import or call.**

---

## 5. Future conceptual object (conceptual only — NOT implemented)

> ⚠️ **Conceptual only.** The shape below is a design reference for a *future* write slice (4C/4D).
> No table, column, or migration is created in 4A. Field names are illustrative.

A future Owner Meaning Capture record would be a **new sibling Venue Memory table**, isolated like
`discovery_candidate_reviews` — **not** attached to that table (it responds to *derived candidates*,
not to individual fidelity reviews) and **not** a Venue DNA store.

### Allowed conceptual fields

| Field | Notes |
|---|---|
| `id` | Primary key. |
| `venue_id` | **Access boundary only** — never the subject of the record. The subject is the concept thread. |
| `concept_ref` | The concept thread key the candidate belongs to. |
| `candidate_fingerprint` | **Deterministic** handle for the candidate (see §6). Never the ephemeral `candidate_id`. |
| `candidate_snapshot_json` | **NOT NULL / mandatory / immutable.** The candidate exactly as shown to the owner at answer time. The source of truth for what the owner was responding to. |
| `snapshot_taken_at` | When the snapshot was captured. |
| `question_text` | The question HESTIA asked, captured verbatim at ask time. |
| `question_reason` | Why HESTIA asked it (the candidate's missing-evidence / contradiction basis), verbatim. |
| `owner_response_raw` | **Immutable / verbatim.** The owner's own words. Never normalized, never re-written, never paraphrased. |
| `confidence_band` | **Nullable; word band, low-only if present; never numeric.** Describes only HESTIA's reading of its own question context, floor-only; it can never raise candidate confidence. Default null ("not captured"). |
| `uncertainty_notes_json` | Honest uncertainty carried alongside, verbatim. |
| `provenance` | **Server-set** to `owner_response`. Never trusted from the client. |
| `record_space` | **Server-hard-coded** to `concept_draft`. `live_venue` is never written here. |
| `status` | One of the safe lifecycle statuses in §7. |
| `superseded_by` / `supersedes` | Logical links when a later answer replaces an earlier one. |
| `created_by` | The owner/admin user who answered (server-set). |
| `created_at` | Server timestamp. |
| `updated_at` | Server timestamp. |

A paired **append-only audit event table** (audit-first ordering, no enforced FK) would mirror the
existing `discovery_candidate_review_events` pattern.

### Forbidden fields (must NOT exist, now)

* `captured_owner_meaning` — HESTIA's interpretation of the owner's words. **The single highest
  self-confirmation risk.** Not persisted in the first write.
* `may_inform` — doctrine encoded as a mutable field (see §8).
* `must_not_mutate` — doctrine encoded as a mutable field (see §8).
* `destination_hint` — no routing earmark belongs on captured owner words.
* `dna_target` — there must be structurally no DNA target.
* `proposed_dna_change` — that is promotion-flow material, separate and later.
* `eligible_for_future_proposal` — promotion-readiness leakage; not in this layer at all.
* Any `confirmed` / `approved` / `promoted` / `final` / `true` status value.
* Any **numeric** confidence (no number, scale, meter, percentage, or ring).

---

## 6. Candidate fingerprint rule

Because candidates are derived live and `candidate_id` is random per derivation, captured owner
words **cannot** reference the candidate by id. They reference it by a **deterministic
fingerprint**.

**`candidate_fingerprint` is a deterministic value** computed from stable inputs, such that the
same candidate produces the same fingerprint across derivations. Recommended inputs:

* `concept_ref`
* `candidate_type` (e.g. `contradiction_signal`, `missing_data_signal`)
* the **sorted** supporting review IDs (or other stable evidence refs)
* a normalized issue axis / text where needed to disambiguate

**Rules:**

* **Never use the ephemeral `candidate_id`** as a persistence reference.
* **Always store `candidate_snapshot_json`.** The snapshot is mandatory, not optional — the
  candidate may not re-derive at all by the time the owner answers (the owner may have changed the
  underlying reviews).
* **The snapshot is the source of truth for what the owner saw at answer time.** If the live
  candidate later drifts or disappears, the stored record remains valid and interpretable because
  the snapshot is preserved. The fingerprint links to the candidate *when it still exists*; the
  snapshot preserves it *regardless*.

---

## 7. Safe lifecycle statuses

**Allowed** (descriptive of the captured record's own lifecycle only):

* `unasked`
* `question_displayed`
* `owner_answer_captured`
* `needs_followup`
* `superseded_by_later_answer`
* `candidate_no_longer_present`

`candidate_no_longer_present` exists deliberately: a stored answer must stay valid even when the
live candidate no longer derives (the owner edited the underlying reviews). Supersession covers a
new *answer*; this status covers a vanished *candidate*.

**Forbidden** (confirmation/promotion vocabulary — unexpressible by construction):

* `confirmed`
* `approved`
* `promoted`
* `true`
* `final`
* `captured_as_owner_meaning`
* `eligible_for_future_proposal`

As in the existing discovery pattern, confirmation must be **impossible to express** — vocabulary,
not vigilance. There is no status, field, or handle that can mean "confirmed."

---

## 8. Structural guardrails

Non-mutation must be **structural, not stored as mutable fields.** A boolean like `must_not_mutate`
implies it could be set to `false` — it invites the exact bug it pretends to prevent. Non-mutation
must instead be an unavoidable property of the code's shape.

Required future guardrails:

* **No import of `mergeVenueDna`** in any Owner Meaning Capture module (asserted at source level).
* **No writes to Venue DNA tables/stores** — never `venue_dna_json`, `venue_intelligence`,
  `venue_briefs`, or `venue_dna_enrichment`.
* **No DNA target column** — there is structurally nowhere for captured words to flow into DNA.
* **No confirmation vocabulary** — see §7.
* **Raw answer preserved exactly** — `owner_response_raw` is verbatim and immutable.
* **Candidate snapshot preserved** — `candidate_snapshot_json` is mandatory and immutable.
* **Owner/admin only** for identity-meaning capture (mirrors the candidate review PATCH gate).
* **Venue-scoped through `req.venueId`** — the server-resolved venue is the access boundary;
  cross-venue access is rejected, never silently redirected.
* **Operational clarification is a separate trust class.** If a manager / bar_manager ever needs to
  clarify an *operational fact*, that is a different kind of record (operational truth, not owner
  identity meaning) and must **not** be written into Owner Meaning. Mixing trust classes pollutes
  Venue Memory.

---

## 9. UX copy (approved, exact)

These strings are the approved wording for the future UI slices. They are listed here so the copy
is decided before any input is built. (No input is built in 4A.)

**Section / CTA:**

> Help HESTIA understand this

**Standing line, shown before the owner answers:**

> Your answer is saved as your words in Venue Memory. It does not confirm anything or change your
> Venue DNA.

**Input label:**

> In your words —

**After the owner answers:**

> Saved as your words. Venue DNA was not updated, and nothing was confirmed.

**Forbidden UI wording (must never appear):**

* "Confirm this insight"
* "Is this correct?"
* "Approve"
* "Add to Venue DNA"
* "Confirmed"
* "Promoted"
* "Final"
* Any checkmark / success-green state implying truth
* Any confidence number or meter
* Any promote button

The phrasing intentionally says "your words," never "your meaning" — "meaning" implies HESTIA's
interpretation, which is not what is being saved.

---

## 10. Future slice plan (revised order)

* **Slice 4A** — *(this document)* docs-only Owner Meaning Capture design.
* **Slice 4B** — lock / formalize the **existing** read-only `suggested_owner_question` preview in
  `InterpretedCandidatesPanel`, and prove no-write. (Most of this already ships; 4B re-scopes it as
  "formalize + assert no network write," not a new surface.)
* **Slice 4C** — schema + DDL design review only (no migration applied).
* **Slice 4D** — first write endpoint/service for the **raw owner answer only**, shipped **with
  negative guardrail tests in the same slice**.
* **Slice 4E** — UI composer for saving the owner's words.
* **Slice 4F** — broader integration / UI tests, plus candidate drift and supersession coverage.

**Stated clearly:**

* **Do not defer negative DNA guardrail tests to 4F.**
* **4D must ship with no-DNA / no-`mergeVenueDna` tests** in the same commit, mirroring the existing
  posture where discovery persistence shipped alongside its no-DNA assertion.

---

## 11. Future test strategy

For the future write slices (not 4A). Listed now so coverage is designed before code.

**Route tests**

* owner/admin only — manager, bar_manager, and other roles → 403.
* unauthenticated → 401.
* venue-scoped: cross-venue write → 404; cross-venue read → null/not-found.
* malformed input → 400.

**Service tests**

* raw answer stored and read back **byte-for-byte**; immutable across updates.
* `candidate_snapshot_json` mandatory on first save; immutable thereafter.
* deterministic fingerprint — same candidate ⇒ same fingerprint.
* confidence band lower-only / nullable; never numeric; never raises candidate confidence.
* supersession sets `superseded_by` / `supersedes` correctly.
* candidate drift handled → `candidate_no_longer_present`.
* audit-first ordering preserved.

**UI tests**

* "Help HESTIA understand this" present.
* standing pre-answer line present; after-answer line present.
* **no** confirm / approve / promote control rendered for any role.
* no confidence number / meter.

**Source-level negative guardrail tests**

* `mergeVenueDna` **not imported and not called** (assert against module source).
* no writes to `venue_dna_json` / `venue_intelligence` / `venue_briefs` / `venue_dna_enrichment`.
* forbidden vocabulary (`confirmed`/`approved`/`promoted`/`final`/`true`/`captured_as_owner_meaning`/
  `eligible_for_future_proposal`) is **unexpressible** — rejected by absence/validation.

**Slice 4B specifically**

* assert **no POST / PATCH / PUT / DELETE** fires from the preview — it is read-only.

---

## 12. Final principle

> **HESTIA may preserve the owner's words about uncertainty, but it may not convert those words —
> or HESTIA's interpretation of them — into Venue DNA without a separate explicit owner-approved
> future flow.**
