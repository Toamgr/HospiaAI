# New Venue Discovery — Fidelity Review Persistence Planning (Design)

> **Status: DESIGN PLAN — DOCS-ONLY. No code, schema, migration, persistence, routes, prompts, UI, or Venue DNA mutation in this document.** This is the design step that follows the shipped inline candidate review surface. It defines *how* the currently-ephemeral, local-only review choices could one day become durable **Venue Memory** records — without becoming confirmed **Venue DNA**, and without building any of it yet.
> Created: 2026-06-25.
> Governing doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) (three layers, cardinal rule, required-on-every-write fields, prohibitions), [VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md](./VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md) (evidence model, statuses, confirmation governance, 9D boundary).
> Governing design lineage: [NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md](./NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md) (fidelity vs identity, §10 status vocabulary, §12 + §15 Decision Gates), [NEW_VENUE_DISCOVERY_INLINE_REVIEW_IMPLEMENTATION_SCOPE.md](./NEW_VENUE_DISCOVERY_INLINE_REVIEW_IMPLEMENTATION_SCOPE.md) (ephemeral state §4, §6).
> Hard precedents (reuse, do not contradict): [VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md](./VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md) (the three blockers, single-writer rule, audit+snapshot precondition).
> Source code grounded in: `src/services/venueIntelligence/candidateSignalFormat.js` (the 5-field shape), `src/features/owner-intelligence/CandidateReviewPanel.jsx` (the real local action vocabulary), `src/services/venueBridge/fnbVenueFeedbackService.js` (the isolated-candidate table + DDL pattern).

---

## 1. Executive Summary

The inline candidate review surface (commits `2976465`, `f9d00c9`) is **deliberately ephemeral**: per-candidate review choices live in `CandidateReviewPanel`'s `useState`, keyed by message + candidate index, and a refresh discards them. The UI says so out loud ("Review choices are local in this first version and are not saved yet"). That was the correct first slice — it delivered fidelity triage at zero persistence risk.

This document designs the **next** thing only as a plan: a durable home for those choices. The single defining constraint is inherited verbatim from the whole discovery program and is non-negotiable:

> **Saving a fidelity review choice writes a Venue *Memory* record. It never writes, queues, earmarks-into, or merges Venue *DNA*. Confirmed Venue DNA remains reachable only through the existing single owner-conversation → `mergeVenueDna` writer, and confirmation remains a separate, later, 9D-gated act.**

Persisting fidelity choices is *low-risk by construction* — it is writing the owner's own triage of the owner's own paraphrased words into an isolated substrate table, exactly as Phase 7A persisted F&B candidate review without touching DNA. The risk is **entirely in scope creep**: a "save" that quietly becomes a "confirm," a provenance stamp that gets laundered, a second DNA writer sneaking in through a "Venue DNA"-routed earmark. The bulk of this plan is the disciplined boundary that prevents exactly that.

**Recommendation (Decision Gate §13): when this is built, persist fidelity review choices into a new, isolated `discovery_candidate_reviews` Venue Memory table (a sibling of `venue_intelligence_candidates`, never a column on `venue_intelligence`). Owner-writable. Append-only audit of every status change. Permanent `owner_conversation` / `owner_edit` provenance. No `confirmed` status reachable by any path. No `mergeVenueDna` call, ever. Build it as one isolated persistence slice; defer 9D, confirmation, corroboration, and promotion entirely.**

---

## 2. Where this sits (and what changes vs the inline slice)

### 2.1 The three layers (canonical — do not blur)
From [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) §1:

1. **Venue Memory** — the raw institutional record; the substrate. **A persisted fidelity review record lives here.**
2. **Venue Intelligence** — synthesized interpretation. The Owner Correction Loop output (the candidate signals being reviewed) lives here.
3. **Venue DNA** — confidence-calibrated crystallized identity; reached only with corroboration + confirmation. **Nothing in this plan touches it.**

A persisted review record is **Venue Memory about a Venue Intelligence artifact**. It records: "the owner saw this candidate signal, and triaged it this way, at this time, with this provenance." It is a *captured-evidence* record, not an *identity* record.

### 2.2 What is changing from the inline slice
| Concern | Inline slice (shipped) | This plan (design only) |
|---|---|---|
| Where review state lives | `useState` in `CandidateReviewPanel` | a durable Venue Memory table |
| Lifetime | discarded on refresh | persists across sessions |
| Honesty note | "not saved yet" | becomes "saved as captured, not confirmed" |
| Network | none | a small owner-only read + write route pair |
| DNA contact | none | **still none** |
| Confirmation | impossible | **still impossible (9D only)** |

Everything in the right column except the first four rows is identical to the left. The risk surface that opens is *persistence + a route*, not *DNA*.

### 2.3 Precedent: this is the Phase 7A pattern, re-applied
Phase 7A already persisted human review of candidate signals (`human_review_status`, `reviewed_by`, `reviewed_at`, `review_note` on `venue_intelligence_candidates`) **without** any DNA write, behind an owner/admin PATCH. This plan is the **discovery-source analogue** of that, with two differences that *tighten* it further:
- discovery candidates carry the **self-approval problem** (author = reviewer; §9), so the persisted record must make confirmation structurally unreachable, not merely deferred;
- discovery candidates may describe a **new concept**, not the operator's live venue (§8.3 of the review design), so persisted "Venue DNA" routing is an **earmark in a concept/draft space**, never a write into any live venue.

Do **not** overload `venue_intelligence_candidates` with discovery reviews — it is F&B-sourced, has a different shape, and a different audience. Use a new sibling table (§6).

---

## 3. The eight questions this plan must answer

The next-slice brief asks eight things. Each is answered in its own section; this is the map.

| # | Question | Section |
|---|---|---|
| 1 | What gets saved | §4 |
| 2 | Who can save it | §5 (role) + §11 (auth) |
| 3 | What provenance is required | §7 |
| 4 | How owner edits are stored | §4.3 + §7 |
| 5 | How confidence is represented | §8 |
| 6 | How candidate status changes are audited | §10 |
| 7 | What remains blocked until 9D | §12 |
| 8 | How to prevent self-approval from becoming identity confirmation | §9 |

---

## 4. What gets saved

### 4.1 Principle: save the *triage*, snapshot the *signal*
A persisted record captures the owner's **review decision** plus an **immutable snapshot of the candidate as reviewed**. We snapshot the candidate because the source — an assistant message in `vi.messages` — is not a stable, addressable record; the same message could be regenerated or the conversation cleared. The review must remain meaningful even if the originating turn is gone. (This mirrors the Phase 7B insight that an audit trail must store *what was true at decision time*, not a pointer that can drift.)

### 4.2 The record shape (design shape — NOT DDL)
The five deterministic candidate fields come straight from `candidateSignalFormat.js` (`signal · evidence · confidence · status · suggestedDestination`). The review record wraps them:

```
DiscoveryCandidateReview            // Venue Memory record — one per reviewed candidate
  id
  venue_id                          // §11 scoping; concept-space sentinel allowed (§8.3)
  conversation_ref                  // soft pointer to the source turn (message index / id), non-authoritative
  candidate_snapshot {              // immutable copy of the candidate AS REVIEWED
    signal, evidence,
    confidence_band,                // 'low' | 'medium' | 'high' — coverage, never raised (§8)
    dna_status_label,               // the candidate's own "Status" field, verbatim (display string)
    suggested_destination
  }
  review_action                     // 'captured' | 'edited' | 'held' | 'rejected'  (§4.4)
  chosen_destination                // owner's routed destination (may differ from suggested; §8.3 earmark rules)
  owner_edit {                      // present ONLY when review_action === 'edited'
    signal?, evidence?, confidence_band?   // confidence_band may only be LOWERED (§8.3)
  } | null
  provenance                        // 'owner_conversation' | 'owner_edit' — permanent, visible (§7)
  evidence_type                     // taxonomy evidence type of the underlying signal (§7.2)
  reviewed_by, reviewed_at
  created_at, updated_at
  --- reserved, NEVER set by this surface ---
  confirmation_ref                  // null; owned by 9D only (§12)
```

This is the **shape**, presented for design review exactly as Phase 7B §12 and the 9E-3 spec §5 presented shapes. It is **not** a migration and **not** DDL to ship in this document.

### 4.3 What an "edit" saves
When the owner revised the signal (the panel's "Revise" action → local `action === 'edited'`, provenance flips to `owner_edit`), the saved record keeps **both**: the original `candidate_snapshot` (HESTIA's paraphrase) **and** the `owner_edit` overlay (the owner's words). They are never merged into one field. This is load-bearing for §9: it keeps HESTIA's paraphrase and the owner's correction permanently distinguishable, so a later reader can never mistake the owner's edit for independent corroboration.

### 4.4 The action vocabulary maps 1:1 to what already shipped
`CandidateReviewPanel.jsx` already uses exactly four terminal actions plus re-route:

| Shipped local action | `ACTION_LABEL` | Persisted `review_action` |
|---|---|---|
| Mark as captured | `captured` → "Captured as meant" | `captured` |
| Revise (+ save) | `edited` → "Edited locally" | `edited` |
| Hold — too early | `held` → "Held" | `held` |
| Reject | `rejected` → "Rejected locally" | `rejected` |
| Re-route (destination select) | "Re-routed locally" | recorded as `chosen_destination` ≠ suggested |

No new action is introduced by persistence. There is deliberately **no** `confirmed`, no `approved`, no `promoted` action — same discipline as Phase 6A's "deliberately NO `promoted_to_dna` status."

### 4.5 What is NOT saved
- No `confirmed` / `approved` / `promoted` status — by any path.
- No raised confidence (the panel already forbids it; persistence must re-enforce server-side — §8.3).
- No write to `venue_dna_json`, `venue_briefs`, `venue_dna_enrichment`, or `venue_intelligence`.
- No fabricated evidence — the conservative default ("supporting detail not captured…") is stored **verbatim** if that is what existed; it is never upgraded into real evidence.
- No cross-venue data; no pricing/POS truth; no guest-preference truth (guardrails §8 prohibitions hold).

---

## 5. Who can save it (role posture)

Carried from the review design §11 and Phase 7B §10, unchanged:

| Role | See discovery reviews | Save fidelity review (this plan) | Confirm to DNA (9D, later) |
|---|---|---|---|
| owner | ✅ | ✅ | ✅ (owner-only, + corroboration + separation) |
| admin | ✅ (technical support) | ❌ for identity-critical; may serve as 9D second party later | ❌ alone for identity-critical |
| manager / bar_manager / fb_director | ❌ | ❌ | ❌ |
| events_manager / employee / chef | ❌ | ❌ | ❌ |

Discovery is the **owner's** concept surface (chat-first `ownerHome`). Persistence does not widen the audience. Saving a fidelity review is an **owner** action; admin is read/technical-support only and is reserved as a *potential second confirmer* for the future 9D tier — never a fidelity-saver here.

---

## 6. Where it is stored (isolation is the whole game)

### 6.1 A new, isolated sibling table
**Decision: a dedicated `discovery_candidate_reviews` table, isolated exactly like `venue_intelligence_candidates`.** Never a new column on `venue_intelligence` (that table *is* canonical DNA; touching it is the contamination Phase 7B forbids). Never an overload of the F&B candidate table.

The DDL pattern to follow is `fnbVenueFeedbackService.js`'s `VENUE_INTELLIGENCE_CANDIDATES_DDL`: a single exported DDL constant shared by server boot and the in-memory test; `TEXT PRIMARY KEY` ids (`randomUUID`); `venue_id NOT NULL`; compact JSON columns serialized on write / parsed on read; `venue_id`-scoped indexes; additive `ALTER TABLE … ADD COLUMN` guarded by `try/catch` for later fields (the same migration idiom already in `server.js`).

### 6.2 Storage-environment constraints (already known)
- The app is **venue-scoped**; venue context arrives via `X-HESTIA-Venue`, resolved in `requireAuth` to `req.venueId`. Every read/write here is `req.venueId`-scoped. **Never** use `defaultVenueId()` in a handler. (Project memory: Phase 8 multi-venue.)
- **`node:sqlite` has no `db.transaction()`.** The append-only audit (§10) and the review upsert must be written as ordered individual statements with their own consistency discipline — not wrapped in a helper that does not exist. Order: **write the audit row first, then upsert the review** (so the audit exists even if the second write fails — the Phase 7B "audit write FIRST" principle, applied to Memory not DNA).

### 6.3 The concept/draft space
Per the review design §14.1, discovery candidates live in a **draft/concept space** for the MVP — the owner is not forced to assign the concept to a real venue. Persistence honors this: a record may be scoped to a **concept-space identifier** rather than a live venue id, and a `chosen_destination` of "Venue DNA" is stored as an **earmark flag on the Memory record**, explicitly *not* a venue-DNA write. The earmark means "the owner wants this considered for a venue's DNA, later, under 9D" — it is a queue note in Memory, nothing more (§8.3 of the review design; §12 here).

---

## 7. What provenance is required

Guardrails §4 ("required on every write") is binding. Every persisted review record must carry:

### 7.1 The mandatory envelope
- **venue boundary** — `venue_id` (or concept-space id); never cross-venue.
- **provenance** — `owner_conversation` for a captured/held/rejected signal; `owner_edit` once the owner revised it. This stamp is **permanent and visible** and **survives any future routing or confirmation** (review design §9.4). It is the single most important anti-laundering field: a discovery-sourced record can never later masquerade as multi-source corroborated truth.
- **confidence** — the coverage band, stored as captured, never raised (§8).
- **evidence label** — the underlying evidence text, verbatim, including the conservative "not captured" default when that is the truth.
- **role access** — owner-primary, admin-read (§5).
- **human approval** — **N/A here by design.** Guardrails §4 reserves "human approval" for *high-impact (DNA / Founder Intent / strategy)* changes. A fidelity review is explicitly *not* high-impact: it changes Memory, not DNA. The record therefore carries `confirmation_ref = null` permanently, and the field exists only so 9D can later populate it on a *different* record type — never retroactively on a fidelity record.

### 7.2 Evidence type
Reuse the taxonomy evidence vocabulary (9E-3 §5; review design §6.1). For discovery records the realistic set is `owner_provided_fact`, `owner_provided_belief`, `inferred_signal` (capped at `low`), and `missing` (the conservative default → forces the candidate's status toward "too early"; not eligible to be treated as evidence). `assumption` is **forbidden** from ever being persisted (`usableInDraft: false`).

### 7.3 Provenance is required *before* anything can ever be confirmed
This pre-empts the Phase 7B "no provenance separation" blocker: by stamping provenance at *fidelity-save* time, a future 9D confirmation always has the provenance it needs to refuse a single-source echo. Building provenance now is the cheap, safe prerequisite that makes the *later* hard thing possible — and it ships with zero DNA risk.

---

## 8. How confidence is represented

### 8.1 Coverage, never certainty — stored as a coarse band
Reuse `VENUE_DNA_CONFIDENCE_SEMANTICS` verbatim (9E-3 §5; review design §7): **confidence is evidence COVERAGE, not certainty, not confirmation, not truth.** Persist the coarse band (`low | medium | high`) the loop emitted — the same value `CandidateReviewPanel` renders as a 3-dot meter with the tooltip "Confidence is evidence coverage from this conversation — not certainty, and not confirmation." **Never** persist or render a percentage that implies measurement we do not have.

### 8.2 Ceilings (carried from review design §6.3)
- `inferred_signal` → capped at `low`.
- `owner_provided_fact` / `owner_provided_belief` from one conversation → capped at `medium`.
- `high` is essentially unreachable from a single discovery pass; persistence must not invent it.

### 8.3 Confidence may only be lowered — enforced server-side
The panel already enforces "can only be lowered" client-side (`allowedConfidence`, the `saveEdit` guard). **The persistence layer must re-enforce this on write**, never trusting the client: a saved `owner_edit.confidence_band` whose rank exceeds the snapshot band is rejected (or floored to the snapshot). Raising confidence is a fabricated evidence claim; the only way to strengthen a signal is **more conversation / real evidence**, never a click and never an API payload. This is the persistence equivalent of "no UI affordance whose repetition raises confidence."

---

## 9. Self-approval prevention (the crux — unchanged and re-anchored to persistence)

The problem is structural and does not improve just because we now save things: **the owner authored the conversation, HESTIA paraphrased it, and the owner is the only reviewer.** Persisting the review must not turn that echo into durable identity truth. Five layered defenses, mapped to *persistence*:

1. **Separation of acts (primary defense).** The persisted record can only hold a **fidelity** action (`captured | edited | held | rejected`). There is **no column, enum value, or route** that writes `confirmed`. You cannot self-approve into DNA because the *stored vocabulary does not contain confirmation.* Confirmation is a different record type, on a different surface (9D), at a different time.

2. **Confirmation is not same-session, not one-click — and not in this table.** A future 9D confirmation of a discovery-sourced signal must require: (a) the signal already `captured` here; (b) **corroboration** — a second independent signal for that dimension; and (c) an explicit confirm act **separated in time/turn** from the originating conversation, with a typed acknowledgement. None of that lives in `discovery_candidate_reviews`; it lives in `venue_dna_confirmations` (9D), keyed *to* a fidelity record but stored *apart from* it.

3. **Author ≠ sole confirmer for identity-critical dimensions.** For the taxonomy's `CONFIRMATION_CRITICAL` set (venue identity, owner intent, target guest, emotional promise, service philosophy, non-negotiables, what-the-venue-must-never-become, staff behavior standards — 9E-3 §3.2), 9D confirmation must require corroboration over time **and/or** a second authorized party. Persisting a fidelity review never satisfies this and must never be counted toward it. (MVP floor per review design §14.2: corroboration over time is the *minimum* future requirement; a second party is reserved for mature/live-venue identity confirmation, not the first concept MVP.)

4. **Provenance is permanent and visible (§7).** `owner_conversation` / `owner_edit` is stamped at save time and is immutable. A discovery record can never be silently relabeled as corroborated truth.

5. **Corroboration is evidence; saving is not.** Saving the same review twice, or re-saving an edit, must **not** raise confidence or strengthen status. The audit (§10) records repeated saves as *events*, not as *evidence weight*. Re-clicking is never corroboration.

**Net:** persistence is safe against self-approval because the *only thing it can store is fidelity*, the confirmation vocabulary lives in a different (unbuilt) table, and the anti-fabrication guards (no raised confidence, permanent provenance, repeat-saves-aren't-evidence) are enforced server-side.

---

## 10. How candidate status changes are audited

### 10.1 Append-only audit, not in-place overwrite
Every status change (`captured` → `held`, `held` → `rejected`, an edit, a re-route, an undo) writes an **append-only audit event** — it never silently overwrites the prior state. This is the Phase 7B audit principle (who / what / when / before / after) applied to Memory. The review record holds the *current* state; the audit holds the *history*.

### 10.2 Audit event shape (design shape — NOT DDL)
```
DiscoveryCandidateReviewEvent       // append-only; one row per change
  id
  review_id                         // FK to the review record
  venue_id                          // scoped (§11)
  changed_by, changed_at
  from_action, to_action            // e.g. 'held' → 'rejected'  (null from_action on first save)
  from_destination, to_destination  // re-routes
  edit_delta                        // what the owner changed (signal/evidence/confidence-down), or null
  reason_note                       // optional free text
```

### 10.3 Reversibility is preserved
All transitions stay reversible (review design §5.1; the panel's "Undo"). An `undo` is itself an audited event (`to_action` back to `null`/prior), not a deletion of history. Nothing here is destructive; the audit is the safety net.

### 10.4 What the audit must never record
- No confidence *increase* event (forbidden — §8.3).
- No `confirmed`/`promoted` transition (no such target exists — §9.1).
- No DNA before/after snapshot — because **no DNA is touched.** (Contrast: the Phase 7B `venue_dna_promotion_audit` snapshots DNA precisely because promotion mutates it. This audit snapshots *Memory triage*, never DNA, because nothing here mutates DNA.)

---

## 11. Auth & API posture (plan only — do NOT implement)

Sketched for design review only; nothing is built here.

- **Read:** `GET /api/discovery-reviews` (or scoped under venue-intelligence), `requireAuth('owner')` (admin read per §5), `req.venueId`-scoped; returns the venue's / concept-space's persisted reviews + current state.
- **Write:** `PUT /api/discovery-reviews/:reviewId` (upsert a review's action/destination/edit) and/or `POST` to create — `requireAuth('owner')`, `req.venueId`-scoped, foreign id → 404 (cross-venue denied). Body carries only fidelity fields; the server derives nothing DNA-shaped.
- **Server-side invariants enforced on every write:** confidence never raised (§8.3); `review_action` ∈ {`captured`,`edited`,`held`,`rejected`}; provenance set server-side, never client-trusted; audit row written **before** the review upsert (§6.2); no path reaches `mergeVenueDna` or any canonical DNA store.
- **Explicitly NOT added:** any `/promote`, any `/confirm`, any route that takes a DNA payload, any route writing `venue_dna_json`.

---

## 12. What remains blocked until 9D

Hard line. None of the following may be built in the persistence slice; each is reserved for the separate, later 9D track:

- **The `confirmed` status / confirmed-DNA tier** and the `venue_dna_confirmations` table.
- **The confirm action** (the deliberate, time-separated, typed-acknowledgement owner act).
- **Corroboration-over-time evaluation** and any second-party confirmation mode.
- **Promotion** of any discovery record into canonical Venue DNA (still blocked by Phase 7B's three unsolved problems: monotonic confidence, no provenance-in-DNA, no DNA snapshot/rollback).
- **Any "Venue DNA" route that writes** — the persisted earmark stays a Memory note; it never becomes a DNA write, and never targets the operator's live venue (review design §8.3).
- **A second Venue DNA writer** — the owner-conversation → `mergeVenueDna` path stays the *only* writer.

The persistence slice's job is to make the *substrate* (provenance, evidence type, audit, reversibility) exist and be trustworthy, precisely so that 9D — when it is designed separately — has a clean, honest foundation to confirm *from*. Building the substrate is safe; building confirmation on top of it is not, yet.

---

## 13. Decision Gate

**When this is built: persist fidelity review choices into a new isolated `discovery_candidate_reviews` Venue Memory table + an append-only audit, owner-writable, fully provenance-stamped, with `confirmed` structurally unreachable and zero DNA contact. Defer 9D, confirmation, corroboration, promotion, and any DNA-writing earmark.**

Reasoning:
1. **Persistence at the fidelity level is low-risk** — it is the Phase 7A pattern (review persisted, DNA untouched), re-applied to a discovery source, in an isolated table.
2. **The self-approval problem is contained by vocabulary, not vigilance** — the stored enum has no `confirmed`, so the dangerous act is *impossible to express*, not merely *discouraged* (§9.1).
3. **Phase 7B's blockers still hold for anything DNA-touching** — so nothing in this slice touches DNA; the earmark is a Memory note (§12).
4. **Building provenance + audit now is the safe prerequisite for 9D later** (§7.3) — it removes future blockers without taking on future risk.

---

## 14. First Implementation Boundary (for whoever builds the next slice)

### Allowed in the persistence slice
- A new **isolated** `discovery_candidate_reviews` table + an append-only `discovery_candidate_review_events` audit table (DDL pattern: `fnbVenueFeedbackService.js`).
- Owner-only read + write routes, `req.venueId`-scoped, to persist/load the fidelity actions the inline panel already produces.
- Persisting `captured | edited | held | rejected` + `chosen_destination` + `owner_edit` overlay + permanent provenance + evidence type + coverage band.
- Server-side enforcement of: confidence-never-raised, provenance-set-server-side, audit-before-upsert.
- Updating the inline panel's honesty copy from "not saved yet" to an honest **"saved as captured, not confirmed"** once (and only once) writes land.

### Explicitly NOT allowed
- No `confirmed` status, by any path, in any table.
- No call to `mergeVenueDna`; no write to `venue_dna_json`, `venue_briefs`, `venue_dna_enrichment`, or `venue_intelligence`.
- No "Venue DNA"-routed earmark that writes DNA or targets a live venue's DNA.
- No second Venue DNA writer; no `/promote`; no `/confirm`.
- No raised confidence on any write; no fabricated evidence; no upgrade of the conservative "not captured" default.
- No change to `venueIntelligenceIntent.js` exploration gating or the `ownerCorrectionLoopFormat.js` / `candidateSignalFormat.js` output contract.
- No exposure to non-owner roles (admin read per §5 aside).

### Must remain design-only for now
- The 9D confirmation tier (`venue_dna_confirmations`, the confirm action, the `confirmed` store).
- Corroboration-over-time evaluation and any second-party confirmation.
- Promotion of any record into canonical DNA (Phase 7B preconditions unmet).

### Dangerous to build too early
- **A "save" that quietly confirms.** The stored vocabulary must physically exclude `confirmed`.
- **An earmark that silently merges** into the operator's live venue DNA — the exact contamination `venueIntelligenceIntent.js` exists to prevent.
- **A confidence value that goes up on write** — a fabricated evidence claim laundered through an API.
- **A `db.transaction()` assumption** — `node:sqlite` has none; order writes audit-first and reason about partial-failure explicitly.

---

## 15. What this document explicitly does NOT do

- No code, no table, no migration, no DDL shipped (the §4.2 / §10.2 shapes are *design shape*, not DDL).
- No routes, services, prompts, or UI implementation.
- No call to `mergeVenueDna`; no write to any canonical Venue DNA store; no mutation of any live venue's DNA.
- No `confirmed` status, no 9D flow, no corroboration engine, no promotion, no second writer.
- No change to existing runtime behavior of any kind; the inline panel and the loop output contract are untouched.

---

*End of design. No code, schema, migrations, prompts, routes, services, UI, or live behavior were changed in producing this document. No Venue DNA was read for mutation or mutated; the discovery loop's output contract and the inline review surface are unchanged.*
