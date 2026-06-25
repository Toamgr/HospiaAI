# New Venue Discovery — Candidate Venue DNA Review & Approval (Design)

> **Status: DESIGN PLAN — CONCEPTUALLY APPROVED, product decisions finalized (docs-only). No code, schema, persistence, routes, prompts, UI, or Venue DNA mutation.** This is the design step that follows the New Venue Discovery MVP loop (free conversation → synthesis → Founder Brief v0.1 → Owner Correction Loop → structured Candidate Venue DNA signals).
> Created: 2026-06-25. Product decisions finalized: 2026-06-25 (see §14–§15).
> Governing doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) (canonical three-layer model + cardinal rule), [VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md](./VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md) (taxonomy, statuses, evidence tiers, 9D confirmation governance).
> Precedents (reuse, do not contradict): [VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md](./VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md) (Review ≠ Approval ≠ Promotion), [VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md](./VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md) (why promotion is deferred).
> Source code grounded in: `src/services/venueIntelligence/ownerCorrectionLoopFormat.js`, `src/services/venueIntelligence/venueIntelligenceIntent.js`, `src/services/venueIntelligence/venueDnaTaxonomy.js`.

---

## 1. Executive Summary

The discovery loop now ends by emitting **Candidate Venue DNA signals** — a deterministic 5-field structure (`Signal · Evidence · Confidence · Status · Suggested destination`) produced by the Owner Correction Loop. Today these candidates are **ephemeral**: rendered in the reply, never persisted, never reviewed, never routed anywhere. This document designs the **Review & Approval surface** that turns those signals into something the owner can act on — **without** building any of it yet.

The defining property of these candidates, and the one that makes this design different from the Phase 7 F&B candidate review, is their **provenance**: they are the **owner's own discovery conversation, paraphrased back to them.** A Phase 7 candidate comes from a *different* actor's operational decision (a cocktail rejection), so the owner reviewing it is an independent check. A discovery candidate has no independent check — the author and the reviewer are the same person. **Approving your own paraphrased words is not corroboration; it is an echo.** The entire approval design must respect that.

The design therefore splits the single word "approve" into two acts that are never the same thing:

- **Fidelity approval** — "HESTIA captured what I meant, accurately." Legitimate from the author, because it checks *transcription*, not *truth*.
- **Identity confirmation** — "this is a stable part of the venue's identity." **Cannot** be reached from a single discovery conversation by the same person in the same sitting. It requires the 9D owner-confirmation governance event, corroboration, and time/turn separation.

**Recommendation (Decision Gate §12): build the Review surface as fidelity-level triage + routing only (accept-as-captured / edit / reject / route). Do NOT let any discovery candidate reach `confirmed` Venue DNA. Confirmation stays a separate, later, 9D-gated act with anti-self-approval rules baked in.**

---

## 2. Where this sits

### 2.1 The three layers (canonical — do not blur)
From [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md):

1. **Venue Memory** — raw institutional record (the conversation, captured signals, candidates). The substrate.
2. **Venue Intelligence** — synthesized interpretation (patterns, gaps, contradictions). *The Owner Correction Loop output lives here.*
3. **Venue DNA** — confidence-calibrated crystallized identity. Reached only with corroboration; **never from a single signal**.

A Candidate Venue DNA signal is a **Venue Intelligence artifact pointing at a Venue DNA dimension**. It is *not* Venue DNA. Naming it "Candidate Venue **DNA**" describes its *aspiration*, not its *status*.

### 2.2 Critical exploration boundary (already enforced in code)
`venueIntelligenceIntent.js` deliberately **withholds canonical-DNA merge** for concept exploration and its continuations (`mergeIntoCanonicalDna === false`). The discovery loop runs *inside* that protected mode. **Consequence for this design:** a discovery candidate describes a **prospective / new venue concept**, not necessarily the operator's current live venue. It must therefore **never** flow into the *current* venue's `venue_dna_json`. Routing "to Venue DNA" means *a venue's DNA that the owner has explicitly designated* — which, for a genuinely new concept, may not exist yet (see §8.3).

### 2.3 Relationship to existing phases
- **Phase 7 / 7A** designed review for **F&B-derived** candidates (`venue_intelligence_candidates`). We **reuse its three-concept spine** (Review / Approval / Promotion) and its role posture, but this is a **different candidate source** and a **different table-to-be**. Do not overload the F&B candidate table with discovery signals.
- **Phase 7B** proved **promotion to canonical DNA is unsafe today** (monotonic confidence, no provenance, no snapshot, array-replace clobber). That conclusion holds here and is *stronger*, because discovery candidates carry the self-approval problem on top of it.
- **9D** is the only sanctioned home for `confirmed` status (`venue_dna_confirmations` table, an explicit owner confirm action, stored *outside* `venue_dna_json`). This design **feeds** 9D; it does not implement or pre-empt it.

---

## 3. The core distinction: Fidelity vs Identity

Everything below hangs on keeping these two apart.

| | **Fidelity approval** | **Identity confirmation** |
|---|---|---|
| Question answered | "Did HESTIA capture what I said correctly?" | "Is this a stable, true part of the venue's identity?" |
| Legitimate from the author alone? | **Yes** — it's a transcription check | **No** — it's an echo without corroboration |
| Where it lands | Venue **Memory** (captured, owner-validated evidence) | Venue **DNA** (`confirmed`, 9D) |
| Status reached | `accepted_as_captured` | `confirmed` (9D only — out of scope here) |
| Reversible | Yes, freely | Yes, via 9D governance + snapshot |
| Built in this design? | **Yes** | **No — explicitly deferred to 9D** |

The discovery Review surface operates **entirely at the fidelity level**. It lets the owner clean up, correct, reject, and route what HESTIA heard. It **never** asserts that a routed signal is confirmed truth. The most a discovery candidate can become here is *"owner-validated captured evidence, routed to a destination, awaiting (separate) confirmation."*

---

## 4. What the owner sees

A single **Review panel** rendered from the Owner Correction Loop output. Non-blocking, calm, editorial (Palette A — operational dark; this is a work surface). It must pass the 2 AM test and read top-to-bottom on mobile.

### 4.1 Header / framing line (mandatory, non-negotiable)
One honest sentence that sets epistemic expectation, e.g.:

> *"These are signals HESTIA heard in your concept conversation — captured, not confirmed. Approving one means HESTIA understood you correctly, not that it's locked into the venue's identity."*

This line prevents the single most dangerous misread (approve = truth). It must always be present.

### 4.2 Per-candidate card
Each candidate renders its five deterministic fields, labeled and distinct:

- **Signal** — the candidate statement (the headline of the card).
- **Evidence** — the supporting detail from the conversation/Founder Brief. When the structure backstop filled the conservative default ("supporting detail not yet captured"), show that *verbatim* — never dress it up as if evidence exists.
- **Confidence** — `low | medium | high`, rendered as a coverage band, with a tooltip stating what confidence means (§7). Discovery candidates should rarely show `high` (§6.3).
- **Status** — `candidate only | needs owner confirmation | too early`.
- **Suggested destination** — one of the seven routes (§8), shown as a *suggestion the owner can change*, never as a done deal.

### 4.3 Grouping
Group cards by **Suggested destination**, foundation/identity destinations first (Venue DNA, then Venue Memory, then the specialist modules). Within a group, order by confidence descending. This mirrors the taxonomy's foundation-first ordering and keeps the owner's attention on identity-level signals first.

### 4.4 What is NOT shown
- No "X% complete" identity meter that implies the venue is "done."
- No claim that a signal is confirmed, true, or live.
- No fabricated evidence, no invented confidence numbers, no destinations the loop did not propose.
- No write/merge buttons that touch any canonical venue.

---

## 5. What can be approved / rejected / edited

### 5.1 Per-candidate actions (the whole interaction model)

| Action | Meaning | Resulting status | Touches canonical DNA? |
|---|---|---|---|
| **Accept as captured** | "Yes, this is what I meant." Fidelity approval. | `accepted_as_captured` | No |
| **Edit** | Owner rewrites Signal and/or Evidence and/or changes Confidence band downward and/or changes destination, then accepts. | `accepted_as_captured` (edited) | No |
| **Reject / Dismiss** | "Not right, not relevant, or not mine." | `rejected` | No |
| **Hold (too early)** | "Real but premature — revisit later." | `held` | No |
| **Re-route** | Change Suggested destination without judging truth. | unchanged | No |

All transitions are **reversible** (an `accepted_as_captured` card can be re-opened and rejected, etc.), exactly as Phase 7A made review status reversible. Nothing here is destructive.

### 5.2 Editing rules (honesty-preserving)
- The owner **may lower** a confidence band freely. The owner **may not raise** a band above what the deterministic loop assigned — raising confidence is an evidence claim, and the only evidence is one conversation. (If the owner believes it's stronger, the path is *more conversation / corroboration*, not a slider.)
- Editing the **Signal** text is allowed and encouraged — it is the owner clarifying their own words. The edit is owner-authored evidence and should be labeled as such (provenance: `owner_edit`), distinct from HESTIA's paraphrase.
- Editing must **never** silently change Status to anything confirmation-flavored. There is no edit that produces `confirmed`.

### 5.3 Bulk actions
Allow "accept all in this destination" / "reject all" as conveniences — but a bulk accept is still only fidelity-level, so the blast radius is bounded (nothing reaches DNA). No bulk action may set confirmation.

---

## 6. Evidence requirements

Anchored to the taxonomy evidence model (`venueDnaTaxonomy.js` §5) and the guardrails (§4 "evidence label required on every write").

### 6.1 Every candidate must carry honest evidence provenance
Reuse the taxonomy evidence types. For discovery candidates the realistic set is:
- `owner_provided_fact` — owner stated it explicitly in conversation.
- `owner_provided_belief` — owner stated a value/intent.
- `inferred_signal` — HESTIA's reasonable inference from the conversation, **labeled as inference, never as fact**.
- `missing` — the conservative default the backstop already emits when no supporting detail was captured.

`assumption` (unsupported guess) is **forbidden** from ever appearing as a candidate's evidence (taxonomy: `usableInDraft: false`). If the loop can only produce an assumption, it should produce nothing.

### 6.2 Single conversation ≠ corroboration
Per the cardinal rule (guardrails §2): **a single source never confirms DNA.** A discovery conversation is *one source*, regardless of how detailed. Therefore:
- A discovery candidate may be **accepted as captured** (fidelity) from one conversation.
- It may **never** be **confirmed as DNA** from one conversation — even an owner's. Confirmation requires corroboration *across turns/sessions/sources* plus the 9D act (§9).

### 6.3 Confidence ceilings by evidence type (for the loop and the surface)
- `inferred_signal` → confidence capped at `low` (it is HESTIA's inference, not the owner's statement).
- `owner_provided_belief` / `owner_provided_fact` from a single conversation → capped at `medium`. **`high` is reserved** for corroborated, multi-source signals and is essentially unreachable from one discovery pass — matching Phase 7's "never `high`" instinct.
- `missing` evidence → status forced to `too early`; not eligible for acceptance until evidence exists.

### 6.4 Hard evidence exclusions (carried from Phase 7B §5, still binding)
- **No pricing/economic truth** from conversation (requires verified sales/POS).
- **No guest-preference truth** from the owner's description of guests (requires guest evidence).
- **No operational-fact truth** (covers, capacity, demographics) asserted from aspiration — these are intent, not reality, and must be labeled as intent.

---

## 7. Confidence meaning

Reuse the taxonomy's confidence semantics **verbatim** (`venueDnaTaxonomy.js` `VENUE_DNA_CONFIDENCE_SEMANTICS`): **confidence is evidence COVERAGE, never certainty, never owner confirmation, never confirmed truth.**

- The 5-field loop emits a coarse band (`low | medium | high`); the surface shows it as a band with the disclaimer attached. (If/when this is wired to the readiness engine, the 0–100 model and bands `none/low/forming/working/strong` apply — but the discovery surface should stay coarse and honest, not pseudo-precise.)
- **What confidence does NOT do here:** it does not gate anything, it does not unlock Full Intelligence Mode, and it does not authorize confirmation. A `high`-coverage signal is still not confirmed truth.
- **Display rule:** never render confidence as a number that implies measurement we don't have. A dot/band with a plain-language label ("forming — partial coverage") beats "62%."

---

## 8. Venue Memory vs Venue DNA routing

The loop's `Suggested destination` field already enumerates seven routes: `Venue DNA · Venue Memory · Bar Intelligence · Service · Academy · Events · F&B`. The owner can accept or change the route. Here is what each route *means* and *does* (design intent — none of it is wired here).

### 8.1 Default routing posture
**Default every accepted discovery candidate to Venue Memory, not Venue DNA.** Venue Memory is the honest home for "owner-validated captured evidence." A candidate only *aspires* to DNA; it earns DNA through corroboration + confirmation (9D), not through this surface. Routing to Venue DNA from here is a **request for future confirmation**, never an application.

### 8.2 Route semantics

| Destination | What routing there means | What it must NOT do |
|---|---|---|
| **Venue Memory** | Store as owner-validated captured evidence (raw substrate). Safe, reversible, the default. | Must not be presented as identity/DNA. |
| **Venue DNA** | Flag the signal as **a candidate dimension awaiting 9D confirmation** for a designated venue. A *queue entry*, not a write. | Must not call `mergeVenueDna`; must not set `confirmed`; must not touch the *current* venue's DNA for a new-concept signal. |
| **Bar Intelligence** | Hand off as a brief input to the bar/cocktail specialist layer (matches the existing beverage-development handoff gate). | Must not become CI lifecycle truth or a published menu. |
| **Service** | Input to service standards / Shift Brain context. | Must not become a staff performance judgment. |
| **Academy** | Input to curriculum/training intent. | Must not auto-generate lessons. |
| **Events** | Input to the events/Zohar layer. | Must not create an event or brief automatically. |
| **F&B** | Input to the F&B program/decision layer. | Must not become a pricing or costing fact. |

### 8.3 The new-concept routing subtlety (important)
A discovery candidate frequently describes a **venue that does not exist as a record yet**. Routing such a candidate "to Venue DNA" is therefore **ambiguous** and must be resolved deliberately:

- It must **never** default into the operator's current live venue's DNA (that is exactly the contamination `venueIntelligenceIntent.js` was written to prevent).
- The honest options are: (a) hold the candidate in a **concept/draft space** in Venue Memory until the owner explicitly creates/designates a venue for it; or (b) attach it to an explicitly chosen venue. Until a venue is designated, "Venue DNA" routing means "**earmarked for a venue to be designated**," not "written."

This earmark-vs-write distinction is the routing equivalent of the fidelity-vs-confirmation distinction, and is just as load-bearing.

---

## 9. Self-approval prevention (the crux)

The problem, stated plainly: **the owner authored the conversation, HESTIA paraphrased it, and the owner is now the approver. There is no second party.** If "approve" could reach `confirmed` DNA, the system would let identity be confirmed by an echo — exactly the "single AI output / single signal → confirmed DNA" failure the cardinal rule forbids.

The design prevents this with five layered rules:

1. **Separation of acts (the primary defense).** The discovery Review surface can only reach **fidelity** status (`accepted_as_captured`). It physically has **no** path to `confirmed`. Confirmation is a *different action, on a different surface, at a different time* (9D). You cannot self-approve into DNA because the button does not exist here.

2. **Confirmation is not same-session, not one-click.** When 9D confirmation is later built, a discovery-sourced candidate must require: (a) the candidate already `accepted_as_captured`; (b) **corroboration** — a second, independent signal (another conversation/turn/source) for that dimension; and (c) an **explicit, deliberate confirm act separated from the originating conversation** (different session or an explicit time/turn gap), with a typed acknowledgement, mirroring Phase 7B's dual-confirmation posture.

3. **Author ≠ sole confirmer for confirmation-critical dimensions.** For the taxonomy's `CONFIRMATION_CRITICAL` dimensions (venue identity, owner intent, target guest, emotional promise, service philosophy, non-negotiables, what-the-venue-must-never-become, etc.), confirmation should require **either** corroborating evidence over time **or** a second authorized party (owner + admin, or two owners). A single person confirming their own paraphrase, once, never suffices for identity-critical DNA. (Non-critical signals can be confirmed by the owner alone *with* corroboration.)

4. **Provenance is permanent and visible.** Every candidate is stamped `provenance: owner_conversation` (and edits as `owner_edit`). This stamp **survives routing and any future confirmation**, so a discovery-sourced signal is never silently laundered into looking like multi-source corroborated truth. (This also pre-empts the Phase 7B "no provenance separation" blocker — provenance must exist *before* anything can be confirmed.)

5. **Corroboration is evidence, clicking is not.** The surface must make clear that the way to strengthen a signal is **more conversation / real evidence**, not re-clicking approve. There is no UI affordance whose repetition raises confidence or status.

**Net:** self-approval is structurally impossible to turn into confirmed DNA, because (a) this surface stops at fidelity, and (b) the later confirmation surface requires corroboration + separation + (for identity-critical) a second party. The owner remains fully in control of *what HESTIA understood* without being able to *confirm identity by echo*.

---

## 10. Status model (design vocabulary only — no schema)

A discovery candidate moves through fidelity-level statuses only. Confirmation statuses are **reserved** and owned by 9D, never set here.

```
captured            → loop emitted it; owner has not acted
accepted_as_captured→ owner fidelity-approved (optionally edited); routed
held                → "too early"; real but premature
rejected            → dismissed (reversible)
--- reserved, NOT set by this surface ---
needs_confirmation  → queued toward 9D (an earmark, not a confirmation)
confirmed           → 9D ONLY; requires corroboration + separation (+ 2nd party if identity-critical)
```

Every candidate also carries (design intent): `provenance` (`owner_conversation | owner_edit`), `evidence_type` (§6.1), `confidence_band`, `suggested_destination`, `chosen_destination`, `reviewed_by`, `reviewed_at`. This is the *shape* the future persistence step would need — **this document defines it; it does not build it.**

---

## 11. Role & authority

Carried from Phase 7 §5 and 7B §10, adapted:

| Role | See discovery candidates | Fidelity actions (accept/edit/reject/route) | Confirm to DNA (9D, later) |
|---|---|---|---|
| owner | ✅ | ✅ | ✅ (owner-only, + corroboration + separation) |
| admin | ✅ | ✅ | ❌ for identity-critical alone (technical role); may serve as the *second party* to an owner |
| manager / bar_manager / fb_director | ❌ (this is the owner's concept-discovery surface) | ❌ | ❌ |
| events_manager / employee / chef | ❌ | ❌ | ❌ |

Discovery is the **owner's** product surface (the chat-first `ownerHome`). Unlike F&B candidates (which CI roles created and can read), discovery candidates are founder-intent material — keep the audience tight: **owner primary, admin as technical support / potential second confirmer.**

---

## 12. Decision Gate

**Build the Review surface at fidelity level only. Do not let any discovery candidate reach `confirmed` Venue DNA through it.**

Reasoning:
1. **Self-approval** makes one-party confirmation of owner-authored signals epistemically void — prevented by stopping at fidelity (§9).
2. **Phase 7B's three blockers still hold** (monotonic confidence, no provenance, no snapshot) — promotion/confirmation is unsafe regardless of source.
3. **9D does not exist yet** — there is no sanctioned `confirmed` store. Routing "to Venue DNA" can only be an *earmark*.
4. **The fidelity surface is independently valuable** — the owner can correct, clean, and route what HESTIA heard, which is the real near-term need, at near-zero risk.

This delivers the useful capability (triage + routing of discovery signals into Venue Memory) while leaving the single disciplined DNA path (owner conversation → `mergeVenueDna`) untouched and the confirmation tier (9D) properly deferred.

---

## 13. What this design explicitly does NOT do

- No persistence, no DB tables, no migrations, no schema (status vocabulary in §10 is *design shape*, not DDL).
- No routes, no services, no prompt changes, no UI implementation.
- No call to `mergeVenueDna`; no write to `venue_dna_json`, `venue_briefs`, or `venue_dna_enrichment`.
- No mutation of the current venue's canonical Venue DNA, ever.
- No `confirmed` status, no 9D confirmation flow, no promotion.
- No change to `venueIntelligenceIntent.js` exploration gating or `ownerCorrectionLoopFormat.js` output contract.

---

## 14. Resolved product decisions (founder-approved 2026-06-25)

The three forks have been decided for the MVP:

1. **New-concept home (§8.3): DRAFT / CONCEPT SPACE.** Discovery candidates live in a draft/concept space for the MVP. The owner is **not** required to assign the concept to a real venue before reviewing. "Venue DNA"-routed candidates remain *earmarks* held in that concept space — never written into any live venue's DNA.
2. **Identity-critical confirmation (§9): FIDELITY NOW, CONFIRMATION DEFERRED TO 9D.** For the MVP, fidelity approval may come from the owner alone. Identity confirmation is deferred to 9D. The **minimum future floor for confirmation is corroboration over time.** A **second authorized party** is **reserved for later, mature/live-venue identity confirmation — it is NOT required for the first concept MVP.**
3. **Surface placement (§4): INLINE.** The Review panel renders inline, under the Owner Correction Loop reply, for the MVP. A dedicated review page is a later addition once persistence lands.

---

## 15. Decision Gate — First Implementation Boundary

A tight boundary for whoever builds the first slice. This supersedes nothing in §12 (the overall "fidelity-only" gate); it scopes the *first* implementation.

### Allowed in the first implementation
- An **inline** Review surface under the Owner Correction Loop reply.
- Rendering each candidate's five deterministic fields (Signal · Evidence · Confidence · Status · Suggested destination) with the mandatory "captured, not confirmed" framing line.
- **Fidelity-level actions only:** accept-as-captured, edit (Signal/Evidence, confidence *down* only), reject, hold (too early), re-route — all reversible.
- Defaulting accepted candidates to **Venue Memory**; "Venue DNA" routing as an **earmark held in the draft/concept space**.
- Permanent, visible `owner_conversation` / `owner_edit` provenance on every candidate.

### Explicitly NOT allowed
- No `confirmed` status, anywhere, by any path.
- No call to `mergeVenueDna`; no write to `venue_dna_json`, `venue_briefs`, or `venue_dna_enrichment`.
- No mutation of any **live venue's** canonical Venue DNA — including via "Venue DNA" routing.
- No raising of confidence by the owner; no UI affordance whose repetition strengthens a signal.
- No change to `venueIntelligenceIntent.js` exploration gating or `ownerCorrectionLoopFormat.js` output contract.
- No exposure of this surface to non-owner roles (admin technical-support read aside, per §11).

### Must remain design-only for now
- The 9D confirmation tier (`venue_dna_confirmations`, the confirm action, the `confirmed` store).
- Corroboration-over-time evaluation and any second-party confirmation mode.
- The persistence schema (the §10 status vocabulary is *shape*, not DDL — no tables yet).
- Promotion of any candidate into canonical Venue DNA (still blocked per Phase 7B).

### Dangerous to build too early
- **A second Venue DNA writer.** The single owner-conversation → `mergeVenueDna` path must stay the only writer. A "promote/confirm from review" button is the highest-risk thing that could be added prematurely.
- **Confirmation before provenance + snapshot + reversal exist.** Confirming a discovery signal without 9D's governance would launder a single-source echo into identity truth with no rollback — the exact Phase 7B failure mode, made worse by self-approval.
- **Earmarks that silently write.** A "Venue DNA" route that quietly merges into the operator's current live venue would re-introduce the contamination `venueIntelligenceIntent.js` exists to prevent.
- **A confidence slider that goes up.** Letting the owner raise confidence turns a clicking action into a fabricated evidence claim.

---

*End of design. No code, schema, prompts, routes, services, UI, or live behavior were changed in producing this document. No Venue DNA was read for mutation or mutated; the discovery loop's output contract is unchanged.*
