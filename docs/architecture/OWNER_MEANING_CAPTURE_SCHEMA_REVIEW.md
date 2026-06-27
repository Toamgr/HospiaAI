# HESTIA Owner Meaning Capture — Schema + DDL Design Review (Slice 4C)

> **Status:** Slice 4C — **design / review only.** This document reviews and proposes a
> persistence shape for a *future* Owner Meaning Capture write slice (4D). It creates **no**
> migration, **no** table, **no** boot-time DDL, **no** endpoint, **no** service that writes,
> **no** UI input, **no** answer composer. Nothing here persists `owner_response_raw` or
> `captured_owner_meaning`, mutates Venue DNA, imports/calls `mergeVenueDna`, adds a
> promotion/confirmation flow, or adds `eligible_for_future_proposal`. No `POST`/`PATCH`/`PUT`/
> `DELETE` route is created. This is a paper review that prepares 4D and nothing more.
>
> **Binding parent doctrine:** `docs/architecture/OWNER_MEANING_CAPTURE_DESIGN.md` (Slice 4A).
> Where this review and that design appear to differ, the design doc wins and this file is the bug.

---

## A. Starting repo state

Verified at authoring time:

* **Branch:** `main`
* **Latest commit:** `c28585c` — *test: lock owner question preview as read-only*
* **HEAD == origin/main**, working tree clean before this document was written.
* **Slice 4A complete and pushed:** `ad3e620` — *docs: add owner meaning capture design*.
* **Slice 4B complete and pushed:** `c28585c` — the read-only suggested-question preview lock.

Recent history:

```
c28585c test: lock owner question preview as read-only
ad3e620 docs: add owner meaning capture design
6b4309e test: fix owner home completeness UI assertions
d615e5c feat: add read-only interpreted candidates UI
db00bc0 docs: design interpreted candidates UI
```

This document is the only working-tree change in Slice 4C.

---

## 1. Current architecture grounding

### 1.1 What exists today

* **Live, ephemeral candidate derivation.**
  `deriveInterpretedCandidatesForVenue(db, venueId)` in
  `src/services/venueIntelligence/discoveryCandidateReviewService.js` computes Interpreted
  Intelligence Candidates **live, on each request, and writes nothing**. There is no candidate
  row and no candidate table. Each candidate is built fresh from the venue's saved
  `discovery_candidate_reviews` rows (record_space `concept_draft`).

* **A read-only route over that derivation.**
  `GET /api/discovery-interpreted-candidates` (server.js ~6631) is `requireAuth('owner', 'admin')`,
  venue-scoped through `req.venueId`, and returns `{ ok, candidates, note, limitations }`. It is a
  pure read — there is **no** `POST`/`PATCH`/`PUT`/`DELETE` sibling.

* **A read-only UI preview of the owner question.**
  `InterpretedCandidatesPanel.jsx` renders each candidate's `suggested_owner_question` as a
  display-only block ("HESTIA would ask:", labelled "Read-only preview", "Your answer is not being
  collected here yet."). No input, no textarea, no form, no submit. **Slice 4B locked this** (see §1.5).

* **A precedent persistence pattern.**
  `discovery_candidate_reviews` + `discovery_candidate_review_events` (DDL inside
  `discoveryCandidateReviewService.js`, executed at server boot via `db.exec`) is the template a
  future Owner Meaning Capture writer should mirror: an isolated, venue-scoped, owner-writable
  Memory table; a mandatory immutable `candidate_snapshot_json`; server-set `provenance`;
  `record_space` hard-coded to `concept_draft`; an append-only audit table with audit-first
  ordering and **no enforced FK**; confidence that may only be lowered; and confirmation made
  **unexpressible by vocabulary** (no `confirmed`/`approved`/`promoted` value anywhere). It imports
  nothing DNA-related and never calls `mergeVenueDna`.

* **A precedent for human write without DNA mutation.**
  `PATCH /api/venue-intelligence/candidates/:candidateId/review` (owner/admin only) records a human
  review and returns *"Reviewed as a learning signal only — Venue DNA was not changed."* This is
  the "an owner writes, and DNA is untouched" template.

* **The forbidden write path.**
  `mergeVenueDna(prior, incoming)` (server.js ~5852) is the **only** Venue DNA merge path. It is
  called from exactly one place — `POST /api/venue-intelligence/message` (~6383) — which is
  `requireAuth('owner')`. Owner Meaning Capture must never import or reach this function.

### 1.2 What does not exist today

* No Owner Meaning Capture table, service, route, or migration.
* No persisted candidate (candidates never touch disk).
* No owner free-text answer anywhere — the question is preview-only.
* No `candidate_fingerprint` value is computed or stored anywhere yet.
* No `confidence_band`/`uncertainty_notes` capture for an owner answer.
* No promotion, confirmation, or `eligible_for_future_proposal` concept.

### 1.3 Why candidates are ephemeral

A candidate is a **derived interpretation of memory**, not a record. It is recomputed from the
underlying saved reviews on every call so that it always reflects the owner's *current* triage. If
the owner edits, holds, or rejects an underlying review, the candidate changes or disappears on the
next derivation — which is correct: HESTIA's suspicion should track the live evidence. Persisting
the candidate would freeze a suspicion that is supposed to stay fluid, and would create a second
source of truth that drifts from the reviews it claims to summarize.

### 1.4 Why `candidate_id` must not be persisted

Each derived candidate is stamped `candidate_id: randomUUID()` **per derivation** (see
`deriveConceptCandidate`, `baseCandidate.candidate_id`). It is a fresh random value every call and
is explicitly commented `EPHEMERAL — derived live, never persisted`. A stored Owner Meaning record
keyed on it would **orphan on the very next derivation**, because the next call mints a different
id for the same concept. The candidate must therefore be referenced by a **deterministic
fingerprint** (§6), never by `candidate_id`, and the candidate must be **snapshotted** (§7) so the
record survives even when the candidate no longer derives at all.

### 1.5 What Slice 4B locked

4B formalized the *existing* `suggested_owner_question` preview to the Owner Meaning Capture
doctrine and proved it stays read-only. `scripts/test-interpreted-candidates-ui.js` (§13) now
statically asserts, against the component source, that the panel:

* shows the question as a preview only ("HESTIA would ask:", "Read-only preview", "Suggested owner
  question", "Help HESTIA understand this", "Your answer is not being collected here yet.");
* exposes **no** answer-collection affordance (no `<input>`/`<textarea>`/`<form>`/`onSubmit`/
  `onSave`/`handleSave`/`handleSubmit`);
* renders **no** forbidden control/label (`Confirm this insight`, `Is this correct?`,
  `Add to Venue DNA`, `Approve`, `Promote`, `Save answer`, `Submit answer`);
* leaks **no** forbidden persistence token (`captured_owner_meaning`, `eligible_for_future_proposal`);
* issues exactly one read GET and **no** write verb (no `apiPost`/`apiPut`/`apiPatch`/`apiDelete`,
  no raw `fetch`).

4B is the no-write floor under everything 4C plans. 4C must not weaken it, and 4D must not break it.

---

## 2. Persistence ownership decision

**Recommendation: a NEW, isolated Venue Memory sibling table** — call it conceptually
`owner_meaning_captures` — paired with its own append-only audit table
(`owner_meaning_capture_events`). It is a sibling of `discovery_candidate_reviews`, **not** a child
of it, and is wholly separate from any Venue DNA / Venue Intelligence store.

Options considered and rejected:

| Option | Verdict | Why |
|---|---|---|
| **Its own new table** | ✅ **Recommended** | Owner words about a candidate are a distinct Memory record class with their own lifecycle, immutability, provenance, and audit needs. Isolation is the project's proven posture (every discovery surface is its own isolated table). Cleanest blast radius; easiest to assert "imports nothing DNA-related." |
| Attach to `discovery_candidate_reviews` | ❌ Reject | A fidelity review is the owner triaging **one saved meaning** (captured/edited/held/rejected). Owner Meaning Capture responds to a **derived candidate** (a contradiction/missing-data signal spanning several reviews). Different subject, different grain, different immutability profile. Bolting columns onto the reviews table would conflate two record classes and pollute the fidelity-review audit trail. The 4A design says this explicitly: "**not** attached to that table." |
| Attach to `venue_intelligence` | ❌ **Hard reject** | `venue_intelligence` is an Intelligence/DNA-adjacent store reachable by the `mergeVenueDna` path. Writing owner words there is exactly the "captured → treated as DNA" laundering this layer exists to prevent. Structurally forbidden. |
| Venue Memory **sibling** table | ✅ This *is* the recommendation | "New isolated table" and "Venue Memory sibling" are the same decision stated two ways. The record lives in the Memory layer, isolated, never in Intelligence/DNA. |
| A separate audit event table | ✅ **Yes, in addition** | Mirror `discovery_candidate_review_events`: append-only, audit-first, logical (non-FK) `capture_id` reference. The main table holds current state; the audit table holds the immutable trail. |

**One clear recommendation:** build `owner_meaning_captures` as a new isolated Venue Memory table
with a paired append-only `owner_meaning_capture_events` audit table, modeled field-for-field on the
posture of `discovery_candidate_reviews` / `discovery_candidate_review_events`. Do **not** extend an
existing table; do **not** place it anywhere reachable by the DNA path.

---

## 3. Proposed future table shape (conceptual only — NO code)

> ⚠️ Conceptual. No DDL is created in 4C. Field names are the design vocabulary for 4D to implement.

`owner_meaning_captures` — one row per captured owner answer to one candidate's question.

| Field | Purpose | Mutability | Set by | Validation | What breaks if wrong |
|---|---|---|---|---|---|
| `id` | Primary key for the capture record. | **Immutable.** | **Server** (mint UUID; or accept a client-owned stable id only for idempotent upsert continuity, validated UUID-shaped, exactly as `upsertDiscoveryReview` does). | UUID-shaped; global PRIMARY KEY. | A reused/guessable id under a different venue must 404, never foreign-write. A non-UUID id must be rejected. |
| `venue_id` | **Access boundary only** — never the subject of the record. | **Immutable.** | **Server** from `req.venueId` (never the client body). | Non-empty; must equal the resolved venue. | If client-controlled, this becomes a cross-venue write hole. The subject is the concept thread, not the venue. |
| `concept_ref` | The concept thread the candidate belongs to (links to the discovery reviews' `concept_ref`). | **Immutable.** | **Server-validated** from request context. | UUID-shaped; required. | Wrong/missing concept_ref orphans the capture from its evidence and breaks per-concept reads/indexes. |
| `candidate_fingerprint` | **Deterministic** handle for the candidate (see §6). The stable join key, since `candidate_id` is ephemeral. | **Immutable.** | **Server** (computed from the snapshot/derivation inputs; never trusted from client). | Non-empty; matches the documented algorithm + `fingerprint_version`. | A non-deterministic or client-supplied fingerprint silently mis-binds answers to the wrong candidate. |
| `candidate_snapshot_json` | **Mandatory, immutable.** The candidate exactly as shown to the owner at answer time — the source of truth for what they responded to. | **Immutable.** | **Server** (captures the live candidate at write time). | `NOT NULL`; well-formed JSON; contains the documented snapshot fields (§7). | If null/mutable, a future derivation drift leaves the answer uninterpretable — the whole protection collapses. |
| `snapshot_taken_at` | When the snapshot was captured. | **Immutable.** | **Server** timestamp. | ISO/SQL datetime. | Wrong time corrupts ordering/forensics and supersession reasoning. |
| `question_text` | The question HESTIA asked, verbatim at ask time. | **Immutable.** | **Server** (from the candidate's `suggested_owner_question`, captured, not re-derived). | Non-empty string. | If mutated, the record claims the owner answered a question they were never shown. |
| `question_reason` | Why HESTIA asked it (the candidate's missing-evidence / contradiction basis), verbatim. | **Immutable.** | **Server** (from candidate `missing_evidence` / `uncertainty_notes`). | String; nullable only if genuinely absent (never fabricated). | Losing the reason makes the answer un-auditable and invites later misreading of intent. |
| `owner_response_raw` | **The owner's own words, verbatim.** The richest, most honest signal. | **Immutable / never normalized.** | **User-provided** (the owner's free text). | Stored **byte-for-byte**; no trimming-into-meaning, no paraphrase, no case-fold, no truncation that alters content. Length-bounded only to a sane max (reject over-limit, never silently cut). | Any normalization rewrites owner truth into something the owner didn't say — the cardinal sin of this layer. |
| `confidence_band` | HESTIA's reading of *its own question context*, **word band, floor-only, nullable**. Never raises candidate confidence. | Effectively write-once; nullable. | **Server-derived** (not a user trust input). | One of `low` only if present, else `null` (default `null` = "not captured"). **Never numeric.** Must never exceed the candidate's own band. | A numeric or raised band launders an owner answer into a strength claim about the venue. |
| `uncertainty_notes_json` | Honest uncertainty carried alongside, verbatim. | **Immutable.** | **Server** (from candidate). | Well-formed JSON array of strings; nullable. | Dropping uncertainty makes the record read more certain than it is. |
| `provenance` | What kind of record this is. | **Immutable.** | **Server-set** to `owner_response`. **Never trusted from client.** | Hard-coded enum (`owner_response`). | A client-settable provenance lets a caller forge the record's authority class. |
| `record_space` | Memory partition. | **Immutable.** | **Server-hard-coded** to `concept_draft`. `live_venue` is never written here. | Hard-coded; reads filter on it. | A `live_venue` value would let a draft be read as live-venue truth — the conflation guard the discovery layer already enforces. |
| `status` | The **capture record's own** lifecycle (not the candidate's truth). | Mutable **only** across the §8 allowed set; supersession preferred over edit (§5). | **Server-validated** from the allowed vocabulary. | One of the §8 allowed values; forbidden values rejected by absence. | A forbidden value (`confirmed`/`promoted`/…) would make confirmation expressible — the exact breach. |
| `superseded_by` | Logical link to the capture that replaced this one. | Set once when superseded. | **Server.** | UUID of a capture in the same venue/concept, or null. | Wrong linkage corrupts the "latest answer" view and history. |
| `supersedes` | Logical link to the capture this one replaced. | Set at creation when replacing. | **Server.** | UUID of a prior capture in the same venue/concept, or null. | Same as above, inverse direction. |
| `created_by` | The owner/admin user who answered. | **Immutable.** | **Server** from `req.user` (full_name/id), never the body. | Non-empty. | A spoofable author destroys accountability of owner truth. |
| `created_at` | Server creation timestamp. | **Immutable.** | **Server.** | datetime. | Corrupts ordering, audit, supersession. |
| `updated_at` | Server last-touch timestamp. | Mutable (touch on status/supersession change). | **Server.** | datetime. | Minor; only forensic ordering. |

> **`captured_owner_meaning` is deliberately absent** (HESTIA's interpretation of the owner's
> words). It is the single highest self-confirmation risk and is **not** in this schema (§9).

A paired **append-only audit table** `owner_meaning_capture_events` mirrors
`discovery_candidate_review_events`: `id` (PK), `capture_id` (**logical** ref, not FK), `venue_id`,
`concept_ref`, `candidate_fingerprint`, `changed_by`, `changed_at` (default now), `from_status`,
`to_status`, `reason_note`. Append-only; never updated; written **before** the main row (audit-first).

---

## 4. Immutability rules

The following fields must be **immutable after creation** — a write that attempts to change them is
a bug and must be impossible to express through the service API:

* `id`
* `venue_id`
* `concept_ref`
* `candidate_fingerprint`
* `candidate_snapshot_json`
* `snapshot_taken_at`
* `question_text`
* `question_reason`
* `owner_response_raw`
* `provenance`
* `record_space`
* `created_by`
* `created_at`

**Update vs. supersession — recommendation: prefer supersession; allow only a narrow status update.**

The owner's words are a historical fact: *"at time T, asked Q, the owner said R."* That fact must
never be rewritten. Therefore:

* **`owner_response_raw` is never editable.** If the owner wants to "change their answer," the
  system **writes a new capture row** that `supersedes` the prior one and sets the prior row's
  `superseded_by` + `status = superseded_by_later_answer`. The original words remain, byte-for-byte,
  in the superseded row. This mirrors the existing posture where the immutable
  `candidate_snapshot_json` is never rewritten on update.
* **The only legitimate in-place mutation is `status`** (within the §8 allowed set) plus its paired
  `superseded_by` / `supersedes` / `updated_at` linkage — and even that is server-driven, not an
  owner-authored content edit.
* This makes the layer effectively **append-only for content** and update-only for lifecycle state.
  It is strictly safer than allowing content edits, and it matches the discovery precedent's
  audit-first, immutable-snapshot discipline.

Mirror the discovery service's enforcement: on any "update," the **stored** immutable fields win;
re-sent client values for immutable fields are ignored, not applied.

---

## 5. Candidate fingerprint design

Because candidates are derived live and `candidate_id` is random per derivation (§1.4),
`candidate_fingerprint` must be a **deterministic** value: the *same candidate* must produce the
*same fingerprint* across derivations, computed only from stable inputs.

**Recommended conceptual algorithm (no code):**

1. Gather the candidate's stable inputs:
   * `concept_ref`
   * `candidate_type` (`contradiction_signal` | `missing_data_signal`)
   * the **sorted** set of supporting (and, for contradictions, conflicting) **saved review IDs**
     — these are stable `discovery_candidate_reviews.id` values, the real evidence refs, not the
     ephemeral candidate id.
   * a **normalized issue axis / text** only where needed to disambiguate two candidates that would
     otherwise collide (normalize whitespace/case for the *fingerprint input only* — never for the
     stored snapshot or owner words).
2. Serialize those inputs in a **fixed, canonical order** (sorted keys, sorted id list).
3. Hash deterministically (e.g. a stable digest) to produce `candidate_fingerprint`.
4. Prefix or pair the result with a **`fingerprint_version`** (e.g. `v1:`) so the algorithm can
   evolve without silently re-binding old records. Store the version (see §14 — likely a dedicated
   column or an embedded prefix; decide in 4D).

**When the candidate no longer derives:** the fingerprint may stop matching any live candidate
(the owner edited the underlying reviews). That is expected and safe — the **snapshot** (§7)
preserves what the owner saw, and `status = candidate_no_longer_present` records the vanished
candidate. The fingerprint links *when the candidate still exists*; the snapshot preserves the
record *regardless*.

**Explicitly forbidden as persistence keys:**

* ❌ the ephemeral `candidate_id` (random per derivation — orphans instantly).
* ❌ any `randomUUID()` candidate id used as a stored reference.
* ❌ any UI-generated / client-generated id as the persistence key.

The fingerprint is **server-computed** from server-trusted evidence refs; it is never accepted from
the client as authoritative.

---

## 6. Snapshot strategy

**`candidate_snapshot_json` must be MANDATORY (`NOT NULL`) and immutable.** It is the single most
important protection in the layer, because the candidate is ephemeral and may not re-derive at all
by the time anyone reads the record back.

**It should contain** (captured verbatim from the live candidate at answer time):

* `candidate_type`, `status` (the candidate's own status at snapshot time)
* `concept_ref`
* `interpretation_title`, `interpretation_summary`
* `supporting_evidence_refs` and `conflicting_evidence_refs` (the real review-id-bearing refs)
* `missing_evidence`, `uncertainty_notes`
* `confidence_band` (the candidate's band, word-only or null)
* `suggested_owner_question` (the exact question shown)
* `candidate_fingerprint` and `fingerprint_version` (so the snapshot is self-describing)
* `derived_at` / a derivation marker (e.g. the `created_from_summary_version` string)

**It must NOT contain:**

* ❌ the ephemeral `candidate_id` as anything load-bearing (it may be recorded as inert provenance
  trivia at most, never used as a key).
* ❌ any DNA target, destination earmark for DNA, or promotion hint.
* ❌ any confirmation vocabulary or numeric confidence.
* ❌ the owner's answer (the answer lives in `owner_response_raw`, kept **separate** from the
  snapshot — the snapshot is what HESTIA showed; the response is what the owner said; never merge).

**How it protects against derivation drift:** once the owner answers, the underlying reviews can
change freely. A later read of the capture does **not** re-derive the candidate; it reads the frozen
snapshot. So the record stays valid and fully interpretable even when the live candidate has drifted
or disappeared. Without a mandatory snapshot, a vanished candidate would leave an un-interpretable
answer — defeating the entire point of capturing owner meaning.

---

## 7. Status vocabulary

**Allowed** (descriptive of the capture record's **own** lifecycle only):

| Status | Meaning |
|---|---|
| `unasked` | A record exists/awaits but the question has not been displayed (see §14 — may not be needed if records are answer-only). |
| `question_displayed` | The question was shown to the owner (see §14 — only meaningful once an ask actually writes). |
| `owner_answer_captured` | The owner's verbatim words were saved. The normal terminal state of a fresh capture. |
| `needs_followup` | The captured answer raised a further open question; a follow-up is warranted. |
| `superseded_by_later_answer` | A later capture replaced this one; `superseded_by` points to it. |
| `candidate_no_longer_present` | The live candidate no longer derives (owner edited the underlying reviews); the record remains valid via its snapshot. |

**Forbidden** (confirmation/promotion vocabulary — unexpressible by construction):

| Forbidden value | Why it is dangerous |
|---|---|
| `confirmed` | Asserts the owner *settled* the candidate as venue truth. Capture is **not** confirmation — it is Memory. This single word would let an answer be read as a confirmed DNA attribute. |
| `approved` | Implies a gate was passed and the candidate is sanctioned. There is no approval here; approval is a separate, later, explicitly owner-gated flow. |
| `promoted` | Implies the candidate was elevated into DNA/Intelligence. Promotion is a distinct future flow with its own conflict check, proposed change, downstream explanation, audit, and rollback — never a status flip. |
| `true` | Asserts the candidate is factually true. HESTIA never adjudicates venue truth; the owner helping HESTIA understand is not the owner declaring truth. |
| `final` | Implies no further evidence can change it — freezes a suspicion as settled, the opposite of evidence-bound humility. |
| `captured_as_owner_meaning` | Smuggles in HESTIA's *interpretation* ("meaning") as a saved state. The layer saves the owner's **words**, never HESTIA's meaning. This is the laundering path the whole design forbids. |
| `eligible_for_future_proposal` | Promotion-readiness leakage. The moment a record can mark itself "ready," the Memory layer has quietly become a promotion bridge. Eligibility belongs only to a separate, later, human-gated promotion flow — never as a status here. |

As with the discovery pattern: confirmation must be **impossible to express** — vocabulary, not
vigilance. There must be no status, field, or handle whose value can mean "confirmed."

---

## 8. Explicitly forbidden fields

These must **not** appear in the future 4D schema (confirmed here so 4D starts clean):

| Forbidden field | Why it must not exist |
|---|---|
| `captured_owner_meaning` | HESTIA's interpretation of the owner's words. The **single highest self-confirmation risk.** Interpretation, if ever built, is a separate later Intelligence-layer derivation — never part of the first write. |
| `may_inform` | Doctrine encoded as a mutable field. A flag that says "this may inform DNA" is a routing earmark toward DNA; doctrine must be structural, not a settable boolean. |
| `must_not_mutate` | Doctrine as a mutable boolean implies it could be set `false` — it invites the exact bug it pretends to prevent. Non-mutation must be a property of the code's shape, not a column. |
| `destination_hint` | No routing earmark belongs on captured owner words. (Even on candidates it is inert null; here it must not exist at all.) |
| `dna_target` | There must be structurally **nowhere** for captured words to flow into DNA. |
| `proposed_dna_change` | Promotion-flow material — separate and later, with its own audit and rollback. |
| `eligible_for_future_proposal` | Promotion-readiness leakage into the Memory layer (see §7). |
| **numeric confidence** | No number, scale, meter, percentage, or ring. Confidence is a word band, floor-only, or null. A number launders an owner answer into a measured strength claim about the venue. |

---

## 9. Structural no-DNA guardrails

Non-mutation of Venue DNA must be **structural — made impossible by the code's shape**, not asserted
by a stored flag. Required of the future 4D implementation:

* **No import of `mergeVenueDna`** in any Owner Meaning Capture module — asserted at source level
  (a static test reads the module source and fails if the token appears as an import/call).
* **No Venue DNA store writes** — never writes `venue_dna_json`, `venue_intelligence`,
  `venue_briefs`, or `venue_dna_enrichment`. The service's only tables are `owner_meaning_captures`
  and `owner_meaning_capture_events`.
* **No DNA target column** — there is structurally nowhere for captured words to flow into DNA
  (enforced by §8's forbidden-field list).
* **No promotion vocabulary** — no `confirmed`/`approved`/`promoted`/`final`/`true`/
  `captured_as_owner_meaning`/`eligible_for_future_proposal` value is accepted; they are rejected by
  absence (§7).
* **`record_space` hard-coded `concept_draft`**, never `live_venue`; reads filter on it so a capture
  can never be read as live-venue truth.
* **Source-level guardrail tests** — assert (against module source) that `mergeVenueDna` is neither
  imported nor called, and that none of the four DNA store identifiers appear.
* **Route/service negative tests** — assert that the write route mutates **only** the two Owner
  Meaning tables, creates no DNA row, and returns a note in the established "Venue DNA was not
  changed" family.

These mirror the exact posture already proven for `discoveryCandidateReviewService.js`.

---

## 10. Auth and venue scope

Following repo precedent (`PATCH /api/venue-intelligence/candidates/:candidateId/review` and the
`PUT /api/discovery-reviews/:reviewId` owner-only write):

* **Owner/admin only for identity-meaning capture.** Mirror the candidate-review gate:
  `requireAuth('owner', 'admin')`. Consider whether, like `PUT /api/discovery-reviews`, **admin
  should be re-excluded from the write** (the discovery write is **owner-only** because saving means
  *the owner* is asserting meaning, and a platform admin is never that author). **Recommendation:**
  capture-write should be **owner-only** (admin read-only), matching the discovery-review write,
  since these are the *owner's* words; resolve in §14 if admin write is ever wanted.
* **Venue-scoped through `req.venueId`.** The server resolves the venue via `resolveVenueId(req)`
  inside `requireAuth`; the route uses `req.venueId`. The client never supplies `venue_id` in the
  body.
* **`venue_id` is the access boundary, not the user-controlled subject.** The subject is the concept
  thread (`concept_ref` / `candidate_fingerprint`). `venue_id` only scopes *who may see/write* the
  record.
* **Cross-venue behavior matches repo precedent:** a foreign/cross-venue id resolves to **404**
  (never a foreign write/read), exactly as `upsertDiscoveryReview`'s foreign-id guard and
  `getDiscoveryReviewById` do; an explicit-but-unauthorized **venue header** is **403** (from
  `resolveVenueId`). Use 404 for "id not in this venue," 403 for "venue not yours."
* **Manager / bar_manager operational clarification is a SEPARATE trust class.** If a manager ever
  needs to clarify an *operational fact*, that is operational truth, **not** owner identity meaning,
  and must be a different record type — never written into `owner_meaning_captures`. Mixing trust
  classes pollutes Venue Memory. Do not widen this route's roles to include them.

---

## 11. Indexing and audit

**Recommended indexes on `owner_meaning_captures`** (mirroring `idx_dcr_*`):

* `venue_id` — the access-boundary filter on every read.
* `venue_id, concept_ref` — per-concept reads (the common query).
* `venue_id, candidate_fingerprint` — "find the capture(s) for this candidate" — the core join.
* `venue_id, record_space` — keep the `concept_draft` conflation filter cheap (optional but cheap).
* `created_at` — only if time-ordered listing proves hot; otherwise skip (don't pre-optimize).
* `status` — only if status-filtered queries prove hot; likely combine as `venue_id, status`.

**Audit table shape** (`owner_meaning_capture_events`), conceptually:

`id` (PK), `capture_id` (**logical** reference, not an enforced FK), `venue_id`, `concept_ref`,
`candidate_fingerprint`, `changed_by`, `changed_at` (default now), `from_status`, `to_status`,
`reason_note`. Indexes: `venue_id`, `capture_id`, `venue_id, concept_ref`.

* **Append-only, audit-first ordering.** Write the audit event **before** the main upsert, mirroring
  `upsertDiscoveryReview`: mint the `capture_id`, INSERT the audit event, *then* upsert the capture
  row. If the capture write fails, the orphan audit event is benign (a recorded attempt that did not
  land) — a state change must never be **un-audited**. `node:sqlite` has no `db.transaction()`;
  consistency comes from this ordering + idempotency on a stable id.
* **FK: avoid an enforced foreign key**, exactly as the discovery audit table does. The audit row is
  written before the capture row exists, so an enforced FK would reject the load-bearing audit-first
  ordering. Keep `capture_id` a **logical** reference and do **not** enable
  `PRAGMA foreign_keys` for these tables. (This matches the explicit note in
  `discoveryCandidateReviewService.js`.)

---

## 12. Future Slice 4D implementation readiness

4D should implement — and **only** implement — the first write of the **raw owner answer**:

* **DDL + service + one write route** for `owner_meaning_captures` (+ its audit table). The DDL is a
  single exported constant executed at boot via `db.exec`, exactly like
  `DISCOVERY_CANDIDATE_REVIEWS_DDL`.
* **Raw owner answer only.** Persist `owner_response_raw` **byte-for-byte**, plus the server-set
  metadata (`question_text`, `question_reason`, `candidate_fingerprint`, mandatory
  `candidate_snapshot_json`, `provenance='owner_response'`, `record_space='concept_draft'`,
  `created_by`, timestamps, safe `status`).
* **No interpretation.** No `captured_owner_meaning`, no HESTIA reading of the words.
* **Mandatory snapshot.** `candidate_snapshot_json` `NOT NULL`, immutable.
* **Deterministic fingerprint** with `fingerprint_version` (§5).
* **Owner/admin gate, owner-only write** (admin read-only), venue-scoped through `req.venueId`.
* **Negative guardrail tests SHIP IN THE SAME COMMIT as 4D** — not deferred:
  * source-level: `mergeVenueDna` not imported/called; no `venue_dna_json`/`venue_intelligence`/
    `venue_briefs`/`venue_dna_enrichment` write.
  * route/service: owner/admin only (others → 403; admin write → 403 if owner-only); unauth → 401;
    cross-venue id → 404; malformed input → 400; raw answer stored/read **byte-for-byte** and
    immutable; snapshot mandatory on first save and immutable thereafter; fingerprint deterministic;
    confidence band word-only/nullable/floor-only/never numeric; supersession links correct;
    candidate drift → `candidate_no_longer_present`; audit-first ordering preserved; forbidden status
    vocabulary rejected by absence.
* **No UI composer in 4D** — that is Slice 4E. 4D is endpoint/service/tests only. 4B's read-only
  preview lock must remain green.

---

## 13. Open questions (must be resolved before 4D)

1. **One active capture per `candidate_fingerprint`, or many?** Recommend: many historical rows,
   exactly one *active* (non-superseded) per `(venue_id, candidate_fingerprint)`, enforced in the
   service (not a unique constraint, to keep history). Confirm.
2. **Does asking/displaying a question create a record, or only answering?** Recommend: **only
   answering writes** (4D). If so, `unasked` / `question_displayed` may be premature — see Q3.
3. **Should `unasked` / `question_displayed` exist before a write/ask UI exists?** If 4D writes only
   on answer, these two statuses are unused in 4D and could be deferred to whenever an "ask" event
   is actually persisted. Recommend keeping them **reserved in the vocabulary doc** but **not
   emitting** them in 4D.
4. **Update vs. append-only supersession** — confirm the §4 recommendation (content immutable;
   "change of answer" = new superseding row; only `status`/links mutate).
5. **Exact cross-venue behavior for capture ids** — confirm **404** for foreign id, **403** for
   unauthorized venue header (matches `upsertDiscoveryReview` / `resolveVenueId`).
6. **Do we need `fingerprint_version`?** Recommend **yes** — store it (column or prefix) so the
   fingerprint algorithm can evolve without silently re-binding existing records.
7. **Should admin be allowed to write, or owner-only?** Recommend **owner-only write** (admin
   read-only), matching `PUT /api/discovery-reviews`. Confirm.
8. **Max length / encoding bound for `owner_response_raw`** — pick a sane max and **reject** over-limit
   (400), never silently truncate (truncation = rewriting owner words). Confirm the limit.

---

## 14. Final recommendation

**Verdict: APPROVE the schema direction, WITH the required changes below resolved before 4D.**

The direction is sound and matches the proven discovery-persistence posture: an isolated Venue
Memory sibling table, mandatory immutable snapshot, deterministic fingerprint instead of the
ephemeral `candidate_id`, server-set provenance/record_space, append-only audit-first events with no
enforced FK, confirmation unexpressible by vocabulary, and structural no-DNA guarantees. Nothing in
the proposed shape reaches the `mergeVenueDna` path or creates a promotion bridge.

**Must be resolved before 4D starts coding:**

* Confirm the §13 open questions — especially: answer-only writes (Q2/Q3), append-only supersession
  (Q4), owner-only write (Q7), `fingerprint_version` (Q6), and the raw-answer length bound (Q8).
* Lock the fingerprint input list + canonical serialization (§5) so it is genuinely deterministic
  before any row is written under it.
* Confirm the mandatory snapshot field list (§6) so the frozen record is self-sufficient.

**Must hold as hard constraints in 4D (non-negotiable):**

* No `captured_owner_meaning`, no interpretation in the first write.
* No `mergeVenueDna` import/call; no DNA-store write; no DNA target column.
* No confirmation/promotion vocabulary; no numeric confidence; no `eligible_for_future_proposal`.
* `owner_response_raw` byte-for-byte and immutable; `candidate_snapshot_json` mandatory and immutable.
* Owner-gated, venue-scoped; cross-venue → 404 / unauthorized venue → 403.
* Negative guardrail tests ship **in the same commit** as 4D.

With those resolved, 4D is clear to implement the raw-owner-answer write and nothing more.

---

## Final principle (restated)

> HESTIA may preserve the owner's words about an uncertainty, but it may not convert those words —
> or HESTIA's interpretation of them — into Venue DNA without a separate, explicit, owner-approved
> future flow. This schema preserves the words and makes the conversion structurally impossible.
