# New Venue Discovery — Persistence Scoping & Constraint Resolution (Design)

> **Status: DESIGN PLAN — DOCS-ONLY. No code, schema, migration, persistence, routes, prompts, UI, or Venue DNA mutation in this document.** This is the *blocker-resolution* step that the Fidelity Review Persistence Plan deferred: it answers the five open questions that must be settled **before** any table, route, or migration is written. It produces decisions, not implementations.
> Created: 2026-06-25.
> Governing plan (this resolves its open risks): [NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_PERSISTENCE_PLAN.md](./NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_PERSISTENCE_PLAN.md) (§6.2 storage constraints, §6.3 concept space, §12 9D boundary).
> Governing doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) (three layers, cardinal rule), [NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md](./NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md) (§8.3 earmark-vs-write, §14.1 draft/concept space decision).
> Source code grounded in: `server.js` (`resolveVenueId`, `defaultVenueForUser`, `requireAuth` venue resolution — lines ~1275–1480), `src/services/venueIntelligence/venueIntelligenceIntent.js` (`mergeIntoCanonicalDna` exploration gate), `src/services/venueBridge/fnbVenueFeedbackService.js` (the isolated-candidate DDL/storage precedent), `src/services/venueIntelligence/candidateSignalFormat.js` (the 5-field candidate shape — no stable id).
> Project memory honored: Phase 8 multi-venue (`X-HESTIA-Venue` → `req.venueId`; never `defaultVenueId()` in a handler; `node:sqlite` has no `db.transaction()`).

---

## 1. Why this document exists

The persistence plan recommended an isolated `discovery_candidate_reviews` Venue Memory table and then listed five risks that are *"unresolved before any persistence build."* This document resolves all five **as design decisions** so that whoever builds the next slice inherits constraints, not open questions. It writes no code.

The five risks, and the section that closes each:

| # | Risk (verbatim from the handoff) | Resolved in |
|---|---|---|
| 1 | Concept-space scoping is under-specified (live `venue_id` vs draft/concept id vs another model) — must not violate `req.venueId` / no-`defaultVenueId` doctrine | §3 |
| 2 | Venue DNA earmark risk — "Suggested destination: Venue DNA" must stay a Memory note, not a write path | §4 |
| 3 | Partial-write consistency — `node:sqlite` has no `db.transaction()`; audit-vs-review ordering on failure | §5 |
| 4 | Snapshot vs source drift — persisted snapshots may outlive the conversation; acceptable but must be visible | §6 |
| 5 | 9D coupling reserved but unmodeled — `confirmation_ref` stays null until 9D exists | §7 |

---

## 2. The core tension (stated once, plainly)

Every request in HESTIA carries a resolved `req.venueId`. There is **no "no-venue" state inside a handler**: `requireAuth` calls `resolveVenueId`, and a missing `X-HESTIA-Venue` header **silently falls back to the operator's default venue** (`defaultVenueForUser` → first accessible venue → bootstrap). (`server.js` ~1310–1318, ~1464–1477.)

But the discovery loop deliberately runs in **exploration mode** — `venueIntelligenceIntent.js` sets `mergeIntoCanonicalDna === false` precisely because *"a discovery candidate describes a prospective / new venue concept, not necessarily the operator's current live venue"* (review design §2.2). The QA finding that created that guard was a new concept being silently merged into the existing venue's DNA.

So persistence sits on a contradiction:

- **The transport says** "this request belongs to venue X" (the operator's live venue id is on `req.venueId`, unavoidably).
- **The content says** "this is a concept that is *not* venue X."

Naively scoping `discovery_candidate_reviews.venue_id = req.venueId` would re-introduce the exact conflation the exploration guard exists to prevent — one layer down, in Memory instead of DNA. A future reader joining discovery rows on `venue_id` against the live venue's records could not tell a concept signal apart from an operating fact about venue X. **That is the under-specification.** §3 resolves it.

---

## 3. Resolution — Concept-space scoping (Risk #1)

### 3.1 Decision: dual-key + an explicit space flag

A persisted review row carries **three** identity fields with **three distinct meanings**. Conflating any two of them is the bug.

| Field | Value | Meaning | Doctrine role |
|---|---|---|---|
| `venue_id` | `req.venueId` (verbatim) | **Access-control boundary only** — *which operator account may read/write this row.* It is **not** a claim that the concept *is* that venue. | Satisfies Phase 8: every read/write is `req.venueId`-scoped; `defaultVenueId()` is **never** called in the handler. |
| `concept_ref` | a minted UUID (§3.3) | **Logical grouping** — the draft/concept thread this review belongs to. The "concept space." Not a venue. | This is the "draft/concept id" the review design §14.1 chose for the MVP. |
| `record_space` | `'concept_draft'` (the **only** value this surface writes) | **Epistemic class** — declares this row is a *concept draft*, never live-venue truth. | The structural guard against conflation. |

The reframe is the whole point: **`venue_id` is the operator boundary, not the subject of the record.** The *subject* is a concept (`concept_ref`), explicitly flagged as a draft (`record_space`). A row can share venue X's access boundary while being unambiguously *not about venue X's live identity*.

### 3.2 The conflation guard (binding invariant)

> **Any consumer that treats a row as describing the live venue MUST filter `record_space = 'live_venue'`. This surface NEVER writes `'live_venue'`. Therefore no discovery review can ever be read as live-venue truth, even though it shares the venue's access boundary.**

`record_space` exists as a column with a controlled vocabulary, but the discovery write path **hard-codes `'concept_draft'` server-side and never accepts the value from the client.** `'live_venue'` is reserved for a future, separate, explicitly-designated promotion path (9D-era) and is out of scope here. Reads default to `record_space = 'concept_draft'`.

### 3.3 Where `concept_ref` comes from (it must be minted — nothing to reuse)

Grounding finding: **there is no existing stable identifier for a discovery conversation, concept, or candidate.** The conversation lives in client `vi.messages`; candidates are parsed from assistant message text by index (`candidateSignalFormat.js`); the inline panel keys local review state by message-index + candidate-index. None of these is durable or addressable.

Decision:
- A `concept_ref` (UUID) is **minted once per discovery thread** and carried in client discovery state. It is sent with every fidelity-review save for that thread. The server treats it as an **opaque token scoped under `venue_id`** — it validates shape, never derives meaning from it.
- The per-candidate `conversation_ref` (message-index / candidate-index pointer) is kept as a **non-authoritative soft pointer** only (its drift is handled in §6). It is *not* an identity key.
- Minting belongs to the discovery thread's lifecycle, **not** to a venue record. A `concept_ref` is created when a discovery exploration begins, independent of whether the owner ever designates a real venue for it (review design §14.1: the owner is *not* required to assign the concept to a real venue).

### 3.4 What this explicitly does NOT introduce

- **No new venue row.** A concept does not create a `venues` record. `concept_ref` is not a venue id and must never be passed where a venue id is expected (it would 403 on `resolveVenueId`, which is the correct failure — concepts are not access boundaries).
- **No `defaultVenueId()` in any handler.** The boundary is always `req.venueId`.
- **No cross-venue concept sharing.** A `concept_ref` is only ever readable within the `venue_id` that owns it (admin's all-venue read aside, per the plan §5).

### 3.5 Read/write shape implied by §3 (design shape — NOT DDL)

```
discovery_candidate_review
  id                 // minted UUID, stable, the upsert key (§5)
  venue_id           // = req.venueId — ACCESS BOUNDARY ONLY (§3.1)
  concept_ref        // minted UUID — the draft/concept thread (§3.3)
  record_space       // 'concept_draft' ONLY from this surface (§3.2)
  conversation_ref   // soft, non-authoritative pointer (§6) — may dangle
  candidate_snapshot { signal, evidence, confidence_band, dna_status_label, suggested_destination }  // immutable (§6)
  snapshot_taken_at  // when the snapshot was captured (§6)
  review_action      // 'captured' | 'edited' | 'held' | 'rejected'  (no 'confirmed' — plan §9.1)
  chosen_destination // owner's routed destination; 'Venue DNA' here is an EARMARK STRING (§4)
  dna_earmarked      // boolean flag; inert Memory note, never a DNA write (§4)
  owner_edit { signal?, evidence?, confidence_band? } | null   // confidence may only be LOWERED
  provenance         // 'owner_conversation' | 'owner_edit' — permanent, server-set
  evidence_type      // taxonomy evidence type (plan §7.2)
  reviewed_by, reviewed_at, created_at, updated_at
  // confirmation_ref is DELIBERATELY ABSENT here — see §7
```

Read access: `WHERE venue_id = ? AND record_space = 'concept_draft'` (optionally `AND concept_ref = ?`). Write: `venue_id` set from `req.venueId`, `record_space` hard-coded, `concept_ref` validated-as-opaque.

---

## 4. Resolution — Venue DNA earmark (Risk #2)

**Decision: "Venue DNA" as a chosen destination is stored as an inert Memory annotation, never a write path. There is structurally no DNA target for it to reach.**

1. `chosen_destination = 'Venue DNA'` is stored **verbatim as a display string** (it is one of the seven `VALID_DESTINATION` values from `candidateSignalFormat.js`), accompanied by a `dna_earmarked = true` boolean. That is the entire effect — a note in a `concept_draft` Memory row that reads *"the owner wants this considered for a venue's DNA, later, under 9D."*
2. **Why it cannot leak into DNA:** the row's `record_space` is `'concept_draft'` and it carries a `concept_ref`, not a live `venue_id` *subject*. There is no designated live-venue DNA record for the earmark to point at — by construction (§3). The earmark is the routing equivalent of the fidelity-vs-confirmation split (review design §8.3): an *earmark*, never a *write*.
3. **Single-writer rule preserved:** the owner-conversation → `mergeVenueDna` path stays the **only** writer of canonical Venue DNA. This surface never calls `mergeVenueDna` and never writes `venue_dna_json` / `venue_briefs` / `venue_dna_enrichment` / `venue_intelligence`. Server-side, any write payload that attempts to address those stores is rejected, not silently coerced.
4. **No second writer, no `/promote`, no `/confirm`** — reaffirmed from the plan §12.

---

## 5. Resolution — Partial-write consistency without `db.transaction()` (Risk #3)

`node:sqlite` has no `db.transaction()` (project memory). The append-only audit (plan §10) and the review upsert are therefore two separate statements. The decision is about **ordering and failure tolerance**, and about one schema subtlety that makes the ordering legal.

### 5.1 Ordering: mint id → write audit → upsert review

1. **Mint `review.id` first** (UUID), before either write. The audit event references this id, so it must exist as a value before the audit row is written.
2. **Write the append-only audit event FIRST** (`from_action → to_action`, `changed_by`, `changed_at`).
3. **Then upsert the review row** (current state), keyed on the stable `review.id`.

### 5.2 Why audit-first is correct (failure analysis)

Two possible interleavings if the second statement fails:

- **Audit written, review upsert fails** → an audit event exists for a review row that is absent or still in its prior state. This is **benign and forensically visible**: current state is always read from the *review* table, so the read is consistent (shows the prior/absent state); the orphan audit event is a recorded *attempt that did not land*. No un-audited state change exists.
- **(Rejected) Review upsert written, audit fails** → state changed with **no history**. This violates the Phase 7B "every state change is audited" principle. Audit-first exists precisely to make this ordering impossible.

So audit-first trades a benign orphan-audit-on-failure for the guarantee that **no state change is ever un-audited.** Correct trade.

### 5.3 The FK subtlety that makes audit-first legal

Because the audit is written **before** the review row exists, `audit.review_id` **must be a soft (logical) reference, not a DB-enforced foreign key.** (`node:sqlite` does not enforce FKs unless `PRAGMA foreign_keys = ON`; this design relies on leaving it a logical reference.) An enforced FK would reject the audit-first row. The plan §10.2 loosely calls it "FK to the review record"; this resolution clarifies it is a **logical reference**, specifically so audit-first ordering needs no transaction.

### 5.4 Convergence rules (so a retry is always safe)

- **Idempotent upsert on stable `review.id`** — re-running the same save converges to the same row; a retry after a partial failure is safe.
- **Append-only, never destructive** — undo is a *new* audit event (`to_action` back to prior), never a delete (plan §10.3). Nothing here removes history, so there is no destructive partial-write to reason about.
- **Read-path tolerance** — current-state reconstruction reads the review table as source of truth and treats any audit event with no matching review row as a did-not-land trace (not as state). The audit remains a complete forensic record regardless.

---

## 6. Resolution — Snapshot vs source drift (Risk #4)

**Decision: the snapshot is authoritative and immutable; the conversation pointer is non-authoritative and may dangle; drift is acceptable and MUST be visible — never silently reconciled.**

1. `candidate_snapshot` is an **immutable copy of the candidate as reviewed** (plan §4.1). It is the authoritative content of the review. The source — an assistant message in `vi.messages` — is *not* a stable record (it can be regenerated or cleared; candidates have no id, per §3.3), so the snapshot, not the source, is the record of truth.
2. `conversation_ref` is a **soft pointer** (message-index / candidate-index). It may stop resolving. That is expected and tolerated.
3. `snapshot_taken_at` is stored so readback can state *"captured from this conversation on {date}."*
4. **Visibility requirement (binding):** the read/UI surface must label persisted reviews as snapshots-as-reviewed and must **never** silently re-fetch or re-sync from the (possibly changed) conversation. When `conversation_ref` no longer resolves, surface a visible, honest note — *"the source conversation is no longer available; this is the snapshot as you reviewed it on {date}"* — rather than hiding the dangling pointer or fabricating a re-link. This satisfies the handoff's "acceptable but must be visible."
5. **No drift-driven mutation:** drift never changes the snapshot, never lowers/raises confidence, never alters the review action. The snapshot is frozen at `snapshot_taken_at`.

---

## 7. Resolution — 9D coupling, reserved but unmodeled (Risk #5)

**Decision: do NOT add a settable `confirmation_ref` column to `discovery_candidate_reviews`. 9D, when it exists, owns a separate table that references reviews one-directionally. This table stays confirmation-free.**

1. **No `confirmation_ref` column here.** The persistence plan §7.1 noted the field "exists only so 9D can later populate it on a *different* record type — never retroactively on a fidelity record." This resolution takes the cleaner stance: **omit it entirely from the fidelity table.** Its presence-as-null is an attractive nuisance (a column someone will eventually try to set); its absence makes the dangerous act impossible to express, consistent with the plan's "vocabulary, not vigilance" principle (§9.1).
2. **9D owns the linkage, one-directionally.** When 9D is designed, it introduces its **own** `venue_dna_confirmations` table that references a `review.id` (9D → review). 9D never writes *into* `discovery_candidate_reviews`. The fidelity table never learns it was confirmed; confirmation lives entirely apart (plan §9.2).
3. **Until then:** there is no confirmation field, no `confirmed` status, no confirm action, no corroboration evaluation, no promotion, no second writer (plan §12). The substrate this slice builds (provenance, evidence type, audit, reversibility, honest snapshots) is exactly the clean foundation 9D will later confirm *from* — built with zero confirmation risk now.

---

## 8. Consolidated constraint set (for whoever builds the next slice)

Binding decisions, all design-only:

1. **Scope by three distinct fields:** `venue_id` (= `req.venueId`, access boundary only, never `defaultVenueId()`); `concept_ref` (minted UUID, draft/concept thread); `record_space` (`'concept_draft'` only — server-hard-coded). (§3)
2. **Conflation guard:** any live-venue consumer must filter `record_space = 'live_venue'`, which this surface never writes. (§3.2)
3. **Mint `concept_ref`** per discovery thread — nothing existing is reusable. `conversation_ref` is a soft pointer, not an identity key. (§3.3)
4. **`concept_ref` is never a venue id** — it creates no `venues` row and must never reach `resolveVenueId`. (§3.4)
5. **"Venue DNA" routing = `dna_earmarked` flag + display string** in a `concept_draft` row. No `mergeVenueDna`, no DNA store write, structurally no DNA target. (§4)
6. **Write order:** mint id → audit event FIRST → review upsert. Audit-first guarantees no un-audited state change. (§5)
7. **`audit.review_id` is a logical reference, not an enforced FK** — so audit-first needs no transaction. (§5.3)
8. **Idempotent upsert on stable id; append-only; read-path tolerates orphan audit.** (§5.4)
9. **Snapshot is authoritative and immutable; conversation pointer may dangle; drift must be visibly surfaced, never silently reconciled.** (§6)
10. **No `confirmation_ref` column; no `confirmed` status; 9D owns linkage one-directionally in a separate table.** (§7)

---

## 9. What this document explicitly does NOT do

- No code, no table, no migration, no DDL (the §3.5 shape is *design shape*, not DDL).
- No routes, services, prompts, or UI implementation.
- No call to `mergeVenueDna`; no write to any canonical Venue DNA store; no mutation of any live venue's DNA.
- No `confirmed` status, no 9D flow, no corroboration engine, no promotion, no second writer.
- No change to `venueIntelligenceIntent.js` exploration gating, the `ownerCorrectionLoopFormat.js` / `candidateSignalFormat.js` output contract, or the shipped inline review surface.
- No new `venues` row, no use of `defaultVenueId()` in any handler.

---

*End of design. No code, schema, migrations, prompts, routes, services, UI, or live behavior were changed in producing this document. No Venue DNA was read for mutation or mutated; the discovery loop's output contract and the inline review surface are unchanged. This document only resolves the open scoping and persistence constraints so a future, separate implementation slice can begin from settled decisions.*
