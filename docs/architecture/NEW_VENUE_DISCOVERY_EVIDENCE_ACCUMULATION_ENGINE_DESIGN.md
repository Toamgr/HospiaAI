# New Venue Discovery — Evidence Accumulation Engine (DESIGN ONLY)

> **Status: DESIGN DOCUMENT. NOT FOR IMPLEMENTATION.**
> This document changes no code, no schema, no tests, no routes, no UI. It defines a
> paper model for how repeated, independent evidence accumulated across saved
> concept-draft fidelity reviews *could later* support Venue DNA confirmation —
> **without ever allowing HESTIA to self-confirm its own interpretation.**
>
> Nothing in this document authorizes a new table, a new writer, a confirmed/approved/
> promoted state, a `confirmation_ref`, a `mergeVenueDna` call, a canonical Venue DNA
> write, a concept registry, pre-save persistence, 9D confirmation, or read-time "truth"
> scores in the UI. Every concrete mechanism described under *Future implementation
> slices* is explicitly labelled **NOT FOR IMPLEMENTATION NOW**.

- **Author context:** New Venue Discovery program, post Concept Draft Workspace (Slice 2a).
- **Baseline commit:** `a385809` — *feat: add read-only concept draft workspace*.
- **Supersedes:** nothing. **Superseded by:** nothing yet.
- **Binding guardrails:** [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](VENUE_MEMORY_AND_DNA_GUARDRAILS.md).

---

## 1. Purpose

HESTIA's defining promise is a clean truth boundary: **Memory** (what was saved) →
**Intelligence** (what HESTIA thinks may be true) → **Venue DNA** (what the venue has
*confirmed* as identity). The single greatest threat to that promise is a system that
quietly turns "the owner said something once and HESTIA captured it" into "this is the
venue's confirmed identity." That collapse is how an intelligence OS degrades into either
a credulous note-taker or an overconfident oracle.

The New Venue Discovery slices built so far deliberately stop *before* that line:

- Owners can save fidelity-review choices ("HESTIA captured what I meant").
- Those saves are **Memory**, scoped to `record_space = 'concept_draft'`.
- The Concept Draft Workspace is a **read-only projection** over those saves.
- There is **no** confirmed/approved/promoted state, **no** `confirmation_ref`, **no**
  `mergeVenueDna` contact, **no** canonical Venue DNA write.

The question this raises — and which we must answer *on paper before writing any
mechanism* — is: **what would ever justify promoting captured meaning to confirmed Venue
DNA, and how do we guarantee that justification always passes through a human?**

We need an **Evidence Accumulation Engine (EAE)** design *before* a "9D Venue DNA
Confirmation" mechanism because:

1. **Confirmation needs an input model.** 9D (a future human-confirmation flow) is a
   *decision surface*. A decision surface with no disciplined evidence model behind it
   will either confirm on thin evidence (one chat) or invent its own corroboration
   (self-confirmation). Designing the evidence model first means 9D can only ever present
   what is genuinely there.
2. **"Repeated evidence" must be defined before it is counted.** If we build a counter
   before we define independence, contradiction, recency, and corroboration, the counter
   will lie — three echoes of one conversation will look like three witnesses.
3. **The boundary must be a state machine, not a vibe.** Writing the lifecycle down lets
   every future slice point at the exact state it operates on and prove it never skips a
   human gate.
4. **It protects against premature persistence.** By enumerating what is *already
   derivable read-only from existing rows*, we avoid adding tables/writers we may not
   need, and we keep the smallest next slice strictly read-only.

In short: **design the evidence lifecycle first so that confirmation can never be
automatic, never be self-generated, and never run ahead of its evidence.**

---

## 2. Current verified foundation

This section summarizes only what is **already built and test-verified** as of `a385809`.
It invents nothing.

| Element | Verified behavior |
|---|---|
| **Saved fidelity reviews are Memory** | `discovery_candidate_reviews` rows are saved owner meaning, not interpretation and not identity. Server hard-codes `record_space = 'concept_draft'`. |
| **Workspace is a read-only projection** | `listConceptDraftsForVenue` / `getConceptDraftDetail` only `SELECT`; they create zero review rows and zero audit rows (asserted by `test:concept-draft-workspace`). No POST/PUT/PATCH/DELETE exists on `/api/discovery-concept-drafts`. |
| **`concept_ref` is concept identity** | Required and UUID-validated. It is the draft/concept thread key. `venue_id` is never substituted for it. |
| **`venue_id` is the access boundary** | Resolved server-side from auth (`req.venueId`); every read/write is venue-scoped. It is never the subject of a record. |
| **`chosen_destination = 'Venue DNA'` is an inert earmark** | Setting it only flips a boolean (`dna_earmarked = 1`). It has structurally no DNA write target. |
| **`dna_earmarked` ≠ DNA confirmation** | It records an owner's *intent to consider* a signal for identity later. It is not a confirmation, not a promotion, not a write to any DNA store. |
| **Confirmation is unexpressible** | `REVIEW_ACTIONS = ['captured','edited','held','rejected']`. There is **no** `confirmed`/`approved`/`promoted` value and **no** `confirmation_ref` column. |
| **Write is owner-only; admin is read-only** | `PUT /api/discovery-reviews/:reviewId` is `requireAuth('owner')` plus an explicit in-handler admin re-exclusion → 403 with zero audit and zero review rows. Reads are owner/admin. |
| **Audit-first, append-only** | Every state change appends to `discovery_candidate_review_events` *before* the review upsert; a failed write leaves a benign orphan audit, never an un-audited change. |
| **No DNA contact** | The service imports nothing DNA-related and never calls `mergeVenueDna` or writes `venue_dna_json` / `venue_briefs` / `venue_intelligence` / `venue_dna_enrichment` (asserted by tests). |

**Existing stored fields per review (the raw material the EAE may read):**
`id`, `venue_id`, `concept_ref`, `record_space`, `conversation_ref`,
`candidate_snapshot_json` (immutable: `signal`, `evidence`, `confidence_band`,
`dna_status_label`, `suggested_destination`), `snapshot_taken_at`, `review_action`,
`chosen_destination`, `dna_earmarked`, `owner_edit_json`, `provenance`
(`owner_conversation` | `owner_edit`), `evidence_type`, `reviewed_by`, `reviewed_at`,
`created_at`, `updated_at`. Plus the append-only `discovery_candidate_review_events`
trail.

---

## 3. Evidence Unit definition

**An evidence unit is an existing saved `discovery_candidate_reviews` row.** Nothing more.
We do **not** invent a new table, a new entity, or a new writer to represent it. The EAE
is a *reading discipline* over rows that already exist.

### Fields useful today (already present, read-only)

- `concept_ref` — which concept/draft thread the evidence belongs to (identity grouping).
- `conversation_ref` — partial independence signal (which conversation produced it).
- `candidate_snapshot.signal` / `.evidence` — the captured meaning and its support text.
- `candidate_snapshot.confidence_band` — `low | medium | high` coverage band (not certainty).
- `review_action` — `captured | edited | held | rejected` (owner's fidelity verdict).
- `owner_edit_json` — the owner's own corrected words, kept separate from the snapshot.
- `provenance` — `owner_conversation | owner_edit` (how this meaning reached the record).
- `evidence_type` — `owner_provided_fact | owner_provided_belief | inferred_signal | missing`.
- `chosen_destination` / `dna_earmarked` — the inert earmark, useful as *owner attention*,
  never as confirmation.
- `created_at` / `reviewed_at` / `snapshot_taken_at` — timing, for recency/decay reasoning.

### What is missing today (would be needed *eventually*, not now)

- **A stable cross-concept subject key.** Two different `concept_ref`s about *the same real
  attribute* (e.g. "intimate room") cannot be linked today without interpretation. There is
  no normalized attribute/dimension key. *(Do not add one now.)*
- **A session / device / time-bucket independence key** beyond `conversation_ref`.
- **Multi-source provenance.** Today provenance is only `owner_conversation | owner_edit`.
  Future sources (shift report, POS upload, service note, event feedback) have no schema.
- **An explicit contradiction link** between competing evidence units.
- **A decay/recency policy field.** Timing exists; a *policy* does not.

> Because these are missing, any "repeated evidence" derivation today is necessarily
> **coarse and honest about its coarseness** (see §9). The EAE must never pretend it has
> independence or cross-concept identity that the data cannot support.

---

## 4. Evidence lifecycle (state model — paper only)

A linear-with-gates model. **Every transition from Intelligence toward DNA is gated by a
human.** AI may *propose*; AI may never *promote*.

| State | What it means | Who/what may create it | May AI create it? | Human confirm required to advance? | Must NEVER happen automatically |
|---|---|---|---|---|---|
| **1. Raw Memory** | Something happened and was recorded verbatim (a saved snapshot / future upload / report). | Owner action (today: saving a fidelity review). System records faithfully. | AI may *capture/transcribe*, not interpret. | n/a (it is just a record) | Being treated as meaning or truth. |
| **2. Captured Owner Meaning** | The owner confirmed "HESTIA captured what I meant" for a specific signal. *(This is exactly today's saved fidelity review.)* | Owner only (`review_action`, `owner_edit`). | No — capture-fidelity is the owner's verdict, not AI's. | n/a (it is captured meaning, still Memory) | AI marking its own paraphrase as "captured." |
| **3. Repeated Evidence** | The *same meaning* appears across **independent** evidence units (distinct concept_ref / conversation / date / future source). | Derivation over existing rows (read-only). | AI/derivation may *count and group candidates*. | No write; it is a read-only observation in Memory/Intelligence space. | Counting non-independent echoes as repetition (see §6). |
| **4. Interpreted Venue Intelligence Candidate** | HESTIA's interpretation: "repeated, consistent evidence *suggests* attribute X may be part of identity." Includes confidence floor + contradictions. | Intelligence layer (future), reading evidence units. | **Yes — AI may create candidates here. This is the AI ceiling.** | **Yes** — must be human-reviewed to advance. | Advancing to DNA candidate or DNA without a human. |
| **5. Human-Reviewed DNA Candidate** | A human (owner) has *looked at* the intelligence candidate and explicitly chosen to put it forward for confirmation. | Owner only, via a future confirmation surface (9D). | No — AI may present, not decide. | **Yes** — this *is* the human gate; and final confirmation is a further explicit act. | AI selecting candidates for the owner silently; admin performing this. |
| **6. Confirmed Venue DNA** | The venue's confirmed identity. Canonical. | Owner confirmation through the future guarded flow only. | **Never.** | This state *is* the confirmation. | Any automatic, AI-driven, or admin-bypass write. No `mergeVenueDna` without an owner confirmation event. |

**Hard rules across the lifecycle:**

- The boundary between **state 4 (AI may create)** and **state 5 (human only)** is the
  load-bearing wall of the entire product. AI lives *below* it forever.
- No state may be skipped. Evidence cannot jump from "Captured Owner Meaning" to "Confirmed
  Venue DNA."
- `dna_earmarked` lives entirely in states 2–3 as *owner attention*; it is **not** state 5
  and **not** state 6.
- States 1–3 are **Memory**. State 4 is **Intelligence**. States 5–6 are the **DNA gate
  and DNA**. (See the boundary table in §8.)

---

## 5. Corroboration rules (how repeated evidence could get stronger)

Corroboration *raises a floor*, it never *inflates a ceiling*. The aim is to describe when
HESTIA is *less wrong to suspect* an attribute is real — never to manufacture certainty.

A future Intelligence candidate's strength should be a function of:

1. **Distinct `concept_ref`.** The same meaning surfacing in *different concept threads* is
   stronger than repetition inside one thread.
2. **Distinct conversation/session/provenance (where available).** Different
   `conversation_ref`, and in future different source types, count as more independent.
3. **Different dates.** Evidence separated in time (different `created_at` days) resists the
   "one excited evening" artifact.
4. **Different source types (future).** Owner chat + shift report + POS upload + service
   note + event feedback agreeing is far stronger than five owner chats. *(No such sources
   exist today; this is forward-looking only.)*
5. **Consistency of meaning.** The signals must actually *mean the same thing*, not merely
   share a keyword. Until a normalized attribute key exists (§3), consistency is
   **owner-asserted or human-reviewed**, never AI-asserted as fact.
6. **Contradiction detection.** Competing evidence *lowers* or *splits* a candidate; it never
   silently averages away (see §7).
7. **Confidence floor, not inflation.** Corroboration may *raise the minimum* plausibility,
   but a candidate's displayed confidence is always bounded by the **weakest necessary
   link** and by the existing rule that **confidence may only be lowered, never raised**
   relative to the captured snapshot band. Repetition never upgrades a `low` snapshot into a
   `high` claim.
8. **Recency and decay.** Older evidence weighs less; a venue can change. Decay must be a
   *stated policy*, applied uniformly, never a silent fudge. No decay implementation now.
9. **"Saved once is never enough."** A single saved review — however confidently worded — is
   **Captured Owner Meaning (state 2)**, full stop. It can populate an Intelligence candidate
   as *one* unit, but one unit can never, by itself, reach the human-confirmation gate as
   "repeated evidence."

> Corroboration math is **out of scope to implement.** This section defines the *shape* a
> future scoring function must obey, not the function.

---

## 6. Independence rules

**Three saved rows from the same `concept_ref` are not three independent signals.** They are
three observations of one concept thread — often three edits or re-saves of *the same
meaning by the same person in the same sitting*. Treating them as corroboration would be the
counter lying.

**Counts as (more) independent:**

- Different `concept_ref` (different discovery thread).
- Different `conversation_ref`.
- Different `created_at` date (different day, ideally different session).
- Different `provenance` / source type (today only `owner_conversation` vs `owner_edit`,
  which is *weak* independence; in future, genuinely different sources).
- Different author (`reviewed_by`) where a venue has multiple legitimate owners — with care.

**Counts as NOT independent (do not corroborate):**

- Multiple `review_action` changes on the **same** review `id` (these are the *audit trail*
  of one decision, not new evidence).
- Multiple rows under the **same** `concept_ref` and **same** `conversation_ref`.
- An `owner_edit` of a snapshot vs the snapshot it edits (same meaning, refined).
- Re-saves / retries of the same candidate within one thread.
- Anything the system itself generated by echoing a prior capture back to the owner.

**Doctrine:** *independence is earned by separation in concept, conversation, time, and
source — not by row count.* Until the schema can express cross-concept subject identity and
richer provenance, the EAE must **declare its independence as weak** and lean on **human
review** to assert that two captures truly mean the same thing.

---

## 7. Contradiction handling

Contradictions are **first-class evidence**, not noise to be smoothed.

HESTIA must be able to represent:

- **Competing evidence.** Two captured meanings that cannot both be core identity (e.g.
  "late-night high-energy bar" vs "quiet early-evening dining room") are shown **side by
  side**, both with their provenance and dates.
- **Unresolved meaning.** When evidence conflicts, the candidate's state is *explicitly
  unresolved* — it does not advance toward the DNA gate.
- **Owner correction required.** A contradiction surfaces as *"HESTIA found conflicting
  signals — which reflects the venue?"*, routing to the owner, never auto-resolved.

**Must never happen:**

- **Do not collapse contradictions into DNA.** A contradiction can never be averaged,
  majority-voted, or "most recent wins" into a confirmed identity by the system.
- **Do not hide disagreement.** Suppressing the minority signal to present a clean answer is
  a truth violation. Both sides remain visible until a human resolves them.
- **Do not let recency silently win.** Newer evidence may *weigh* more (§5.8) but does not
  *erase* older contradicting evidence without human acknowledgement.

Resolution is always a **human act** recorded as such — and even then it produces, at most, a
*Human-Reviewed DNA Candidate* (state 5), never an automatic DNA write.

---

## 8. Memory → Intelligence → DNA boundary

| Layer | Question it answers | Examples in this program | Who may write it | Confirmation needed? |
|---|---|---|---|---|
| **Memory** | *What happened / what was saved?* | Saved fidelity reviews; immutable snapshots; (future) uploads, shift reports, service notes. States 1–3. | Owner action records meaning; system records faithfully. Append-only audit. | No — it is record, not claim. |
| **Intelligence** | *What does HESTIA think may be true?* | "Repeated, consistent evidence *suggests* X may be identity." Candidates, confidence floors, contradictions. State 4. | Intelligence layer / AI may **propose** candidates here (the AI ceiling). | Intelligence may **recommend**; it may not promote. |
| **DNA** | *What does the venue confirm as its identity?* | Confirmed venue identity, canonical. States 5–6. | **Owner only**, through the future guarded confirmation flow. | **Yes — explicit human confirmation, always.** |

**Explicit boundary rules:**

- **Intelligence may recommend.** It may say "this looks repeated and consistent — consider
  confirming." That is the strongest thing AI may ever do.
- **DNA requires human confirmation.** No path exists, now or in future, from Intelligence to
  DNA that does not pass through an explicit owner act.
- **HESTIA may never promote itself to DNA.** The system cannot be both the proposer and the
  confirmer. *(No self-confirmation loop — see §13.)*
- Today, the entire program lives in **Memory**. There is no Intelligence layer over these
  rows yet, and there is no DNA gate yet. This doc designs how Intelligence *could* sit on
  top of Memory without ever reaching across the DNA wall on its own.

---

## 9. Read-only derivations possible from existing rows TODAY

These are **already computable** from `discovery_candidate_reviews` /
`discovery_candidate_review_events` with **no new persistence, no new writer, no schema
change**. They are *observations*, presentable as Memory/Intelligence — **never** as
confirmed truth.

**Safely derivable today (read-only):**

- Count of saved reviews per `concept_ref`.
- Action mix per concept (`captured` / `edited` / `held` / `rejected` counts).
- Latest review timestamp; first/last activity per concept.
- Destinations chosen (`chosen_destination` distribution).
- `dna_earmarked` count (as *owner attention*, explicitly **not** confirmation).
- Minimum / current `confidence_band` present in a concept's snapshots (floor, not inflated).
- Unresolved or rejected signals (e.g. `held` / `rejected`, or earmarked-but-not-revisited).
- Repeated wording/themes **only where already structured** (e.g. exact/normalized
  `signal` string matches) — and even then presented as *"similar wording seen N times,"*
  not *"corroborated."*
- Provenance mix (`owner_conversation` vs `owner_edit`) as a *weak* independence hint.

**Cannot be safely derived today (must wait for design + possibly schema):**

- True **cross-concept** "same attribute" repetition (no normalized subject key — §3).
- Genuine **independence** beyond `conversation_ref` (no session/source model).
- **Multi-source corroboration** (only owner-origin data exists).
- **Contradiction linking** between specific competing units (no contradiction edges).
- Any **confidence *increase*** from repetition (forbidden by doctrine; floor-only).
- Any **decay-weighted** score (no decay policy).
- Anything resembling a **"truth," "verified," or "confirmed" score** in the UI.

> Rule for any near-term work: **derive, label honestly, write nothing.** A derivation is an
> observation about Memory, not a verdict.

---

## 10. Future implementation slices — **NOT FOR IMPLEMENTATION NOW**

Each slice below is a *design placeholder*. **None is authorized by this document.** They
exist to show a safe sequence and to fence each step's scope.

### Slice 1 — Read-only Evidence Summary endpoint **(NOT FOR IMPLEMENTATION NOW)**
- **Scope:** a single read-only endpoint returning the §9 *safely-derivable* observations per
  concept (or per venue), derived live from existing rows.
- **Reads:** `discovery_candidate_reviews` (venue-scoped, `record_space='concept_draft'`).
- **Writes:** **nothing.** No table, no audit, no DNA.
- **Roles:** owner/admin **read**; no writer; no admin write path at all.
- **Audit:** none required (read-only) — but must create zero rows (assert it).
- **Could break:** venue scoping if the query forgets `venue_id`; truth semantics if labels
  imply confirmation; performance on large concept sets.
- **Required tests:** zero-rows-created assertion; venue isolation; `record_space` filter;
  no `confirmed/approved/promoted` vocabulary; no `mergeVenueDna`/DNA-store contact; copy
  audit for forbidden words.

### Slice 2 — Owner-facing Evidence Review view **(NOT FOR IMPLEMENTATION NOW)**
- **Scope:** a read-only UI surface rendering Slice 1's summary with mandatory honesty copy.
- **Reads:** Slice 1 endpoint only.
- **Writes:** **nothing.**
- **Roles:** owner-facing; admin read-only mirror at most.
- **Audit:** none (read-only).
- **Could break:** misleading copy ("verified"/"confirmed"); palette/UX implying a decision
  control exists; surfacing contradictions as resolved.
- **Required tests:** copy contains the mandatory "not confirmed Venue DNA" framing; no
  confirm/promote control rendered; no write calls issued.

### Slice 3 — Intelligence candidate grouping **(NOT FOR IMPLEMENTATION NOW)**
- **Scope:** the first true **Intelligence** layer — grouping independent evidence units into
  candidates with confidence floors and contradiction flags (state 4). Likely needs a
  normalized subject key and contradiction model designed first.
- **Reads:** evidence units (+ any new read-only derivation store, to be designed separately).
- **Writes:** *possibly* a **candidate cache** — but only if a dedicated design doc proves it
  is non-canonical, non-DNA, owner-clearable, and never a confirmation. **Default: still no
  writer.**
- **Roles:** owner/admin read; AI may *propose* candidates; no human gate crossed.
- **Audit:** if any cache is written, append-only and clearly non-DNA.
- **Could break:** independence violations (§6) inflating candidates; AI overconfidence;
  accidental drift toward a "score = truth" UI.
- **Required tests:** independence rules enforced; one-concept echoes don't corroborate;
  confidence floor-only; contradictions never collapsed; no DNA contact.

### Slice 4 — 9D Confirmation **design** **(NOT FOR IMPLEMENTATION NOW)**
- **Scope:** *design only* of the human confirmation surface (state 5). No implementation.
- **Reads:** Intelligence candidates.
- **Writes:** nothing in the design phase.
- **Roles:** owner-only confirmation authorship; admin excluded from authorship.
- **Audit:** the eventual flow must be audit-first.
- **Could break:** designing an auto-advance; allowing admin to confirm; presenting AI
  candidates as pre-approved.
- **Required tests:** (for the eventual build) human-gate presence; admin-exclusion; audit-first.

### Slice 5 — Guarded DNA confirmation flow **(NOT FOR IMPLEMENTATION NOW)**
- **Scope:** the *only* path that may ever write canonical Venue DNA (state 6), strictly
  behind explicit owner confirmation from Slice 4.
- **Reads:** human-reviewed DNA candidates.
- **Writes:** canonical Venue DNA **only** via a single guarded writer, recording a
  confirmation event. This is the first and only place `mergeVenueDna`-class logic could ever
  be invoked — and only on an owner confirmation event.
- **Roles:** owner-only; admin permanently excluded from confirmation.
- **Audit:** mandatory, append-first, with the confirmation event and its evidence basis.
- **Could break:** *everything* if mis-scoped — this is the highest-risk slice and must not be
  approached until Slices 1–4 and their guardrail docs exist.
- **Required tests:** no DNA write without an owner confirmation event; admin can never write;
  venue isolation; full audit; no auto-promotion under any input.

---

## 11. Explicit non-goals

This document does **not** propose, authorize, or imply any of the following — now:

- **No 9D now.** (Design only, later — Slice 4.)
- **No `confirmed`/`approved`/`promoted` enum now.**
- **No `confirmation_ref` now.**
- **No `mergeVenueDna` now.**
- **No canonical Venue DNA write now.**
- **No concept registry now.**
- **No new writer now.**
- **No new table or schema change now.**
- **No pre-save / ephemeral-thread persistence now.**
- **No read-time "truth"/"verified"/"confirmed" score in the UI now.**

And one rule that holds **forever, not just "now":**

- **No automatic promotion ever.** No path from Intelligence to DNA may ever exist that does
  not pass through an explicit human confirmation act. HESTIA may never self-confirm.

---

## 12. UX doctrine

Language is part of the truth boundary. The product must *say* what is true about each
layer.

**Approved phrasing (by state):**

- **Memory:** *"Saved to Memory."* / *"Captured as meant — not confirmed Venue DNA."*
- **Repeated evidence (read-only observation):** *"Repeated evidence"* / *"Similar signal
  seen N times across N conversations."* (Only when independence is real per §6; otherwise
  *"seen N times in this concept thread."*)
- **Intelligence candidate:** *"HESTIA thinks this may be part of your identity."* /
  *"Needs owner confirmation."*
- **Contradiction:** *"Contradiction found — which reflects the venue?"*
- **Always-available disclaimer:** *"Not confirmed Venue DNA."*

**Forbidden phrasing (unless and until something is truly confirmed through the future human
confirmation flow):**

- ❌ *"verified"*
- ❌ *"approved"*
- ❌ *"confirmed"*
- ❌ *"DNA updated"*
- ❌ *"truth"* / *"the venue is…"* stated as fact
- ❌ any score presented as certainty (e.g. "87% true")

**Rule:** confidence is **evidence coverage, not certainty**, and it is shown as a band/word,
never as a precision percentage implying truth. The words "confirmed Venue DNA" may appear
**only** attached to something that has actually passed the future human confirmation gate —
everywhere else they appear only in the negative ("*not* confirmed Venue DNA").

---

## 13. Risks

| Risk | How it manifests | Mitigation in this design |
|---|---|---|
| **Auth** | A new endpoint forgets role gating. | Every future slice declares roles; reads owner/admin, writes (if ever) owner-only. |
| **Admin write bypass** | `requireAuth`'s global admin bypass lets admin write. | Existing pattern: explicit in-handler admin re-exclusion → 403, zero rows. Mandatory for any future writer. Admin is *permanently* excluded from confirmation. |
| **Venue scoping** | A query omits `venue_id`, leaking cross-venue evidence. | All derivations and reads are `venue_id`-scoped and `record_space='concept_draft'`-filtered; tested for isolation. |
| **DB truth** | A derivation is cached and drifts from source. | Default to **no cache**; Slice 1 derives live. Any future cache needs its own guardrail doc proving non-canonical, owner-clearable. |
| **Premature schema** | Adding subject-key/contradiction columns before the model is proven. | Explicit non-goal (§11). Cross-concept identity stays human-asserted until designed. |
| **Accidental DNA mutation** | A grouping/cache write strays into a DNA store. | EAE imports nothing DNA-related; only Slice 5 (far future, separate doc) may touch DNA, only behind owner confirmation. |
| **Misleading UX copy** | "Confirmed"/"verified" leaks into a read-only view. | §12 forbidden-word list; copy-audit tests required for any UI slice. |
| **Overconfident AI interpretation** | AI states a candidate as fact or inflates confidence. | AI ceiling at state 4 (propose only); confidence floor-only; "may be," never "is." |
| **Self-confirmation loop** | System echoes its own capture back and counts it as new evidence. | Independence rules (§6) explicitly exclude system echoes and same-thread re-saves; AI may never advance past the human gate. |
| **Document-manager drift** | HESTIA degrades into a notes/upload archive. | The EAE's purpose is *interpretation toward confirmable identity*, not storage. Memory exists to feed Intelligence and (human-gated) DNA — not to be the product. |

---

## 14. References

Verified to exist in the repo at `a385809` and aligned-with by this design:

- [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](VENUE_MEMORY_AND_DNA_GUARDRAILS.md) — governing Memory/DNA boundary.
- [NEW_VENUE_DISCOVERY_CONCEPT_DRAFT_WORKSPACE_SCOPE.md](NEW_VENUE_DISCOVERY_CONCEPT_DRAFT_WORKSPACE_SCOPE.md) — the read-only workspace scope (Slice 2a).
- [NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_IMPLEMENTATION_SCOPE.md](NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_IMPLEMENTATION_SCOPE.md) — fidelity-review persistence scope (Slice 1).
- [NEW_VENUE_DISCOVERY_PERSISTENCE_SCOPING_RESOLUTION.md](NEW_VENUE_DISCOVERY_PERSISTENCE_SCOPING_RESOLUTION.md) — `concept_ref` / `venue_id` / `record_space` resolution.
- [NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_PERSISTENCE_PLAN.md](NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_PERSISTENCE_PLAN.md) — persistence plan.
- [NEW_VENUE_DISCOVERY_INLINE_REVIEW_IMPLEMENTATION_SCOPE.md](NEW_VENUE_DISCOVERY_INLINE_REVIEW_IMPLEMENTATION_SCOPE.md) — inline review scope.
- [NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md](NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md) — candidate review design.
- [VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md](VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md) — prior promotion-guardrail precedent (the Phase 7A/7B pattern this design extends in spirit: human-reviewed candidates, no auto-promotion).

Code surfaces referenced (read-only, not modified):
`src/services/venueIntelligence/discoveryCandidateReviewService.js`,
`server.js` (discovery-review + concept-draft routes),
`src/features/owner-intelligence/ConceptDraftsPanel.jsx`,
`src/features/owner-intelligence/CandidateReviewPanel.jsx`.

> No referenced document was missing. If a future edit cites a doc that does not exist, that
> must be flagged rather than invented.

---

## 15. Final recommendation

1. **Do not implement 9D yet.** Confirmation is the highest-risk surface and must not be built
   before its evidence model and its own guardrail doc exist.
2. **Next safe implementation is a read-only Evidence Summary from existing rows only**
   (Slice 1): venue-scoped, `record_space='concept_draft'`, deriving only the §9
   *safely-derivable* observations, writing nothing, labelled with the §12 honesty copy, and
   covered by the §10 Slice-1 tests (zero rows created, venue isolation, no forbidden
   vocabulary, no DNA contact).
3. **Only after that, design Owner Confirmation / 9D** (Slice 4, design-only) — and only once
   independence, contradiction, and the normalized-subject question have their own design
   docs.

**One-line doctrine:** *Accumulate and interpret evidence in Memory and Intelligence as much
as is honest — but the wall to Venue DNA is opened only by a human, never by HESTIA.*
