# New Venue Discovery — Interpreted Intelligence Candidates (EAE Slice 3) — DESIGN ONLY

> **Status: DESIGN DOCUMENT. NOT FOR IMPLEMENTATION.**
> This document changes no code, no schema, no tests, no routes, no UI, no localStorage.
> It defines, on paper, the **first true Intelligence layer** over New Venue Discovery: how
> HESTIA may turn accumulated *reviewed* concept-draft evidence into **read-only Interpreted
> Intelligence Candidates** — interpretations carrying confidence and uncertainty — **without
> ever confirming, promoting, approving, or mutating Venue DNA, and without HESTIA self-
> confirming its own interpretation.**
>
> Nothing here authorizes a writer, an endpoint, a table, a UI, a confirmed / approved /
> promoted / canonical state, a `confirmation_ref`, a `mergeVenueDna` call, a Venue DNA write,
> a concept registry, 9D, an owner-approval action, or any client-side score. Every concrete
> mechanism under *Future implementation plan* (§9) is explicitly **NOT FOR IMPLEMENTATION NOW**.

- **Author context:** New Venue Discovery program, EAE Slice 3 (the Intelligence layer above the Memory mirror).
- **Baseline commit:** `5930c7e` — *feat: add read-only evidence summary UI* (Slice 2 complete, merged to `origin/main`).
- **Implements (the design for):** [NEW_VENUE_DISCOVERY_EVIDENCE_ACCUMULATION_ENGINE_DESIGN.md](./NEW_VENUE_DISCOVERY_EVIDENCE_ACCUMULATION_ENGINE_DESIGN.md) §4 *state 4 (Interpreted Venue Intelligence Candidate — the AI ceiling)*, §5 (corroboration), §6 (independence), §7 (contradiction), §10 *Slice 3 — Intelligence candidate grouping*.
- **Binding doctrine:** [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md); the EAE §8 (Memory → Intelligence → DNA boundary), §9 (safely-derivable observations), §12 (UX doctrine / forbidden words).
- **Reads (read-only, not modified):** `discovery_candidate_reviews` rows; the Slice 1 summary `summarizeDiscoveryEvidenceForVenue` ([discoveryCandidateReviewService.js:620](../../src/services/venueIntelligence/discoveryCandidateReviewService.js#L620)); the Slice 2 read-only UI.

---

## 0. Hard doctrine (restated, non-negotiable, governs everything below)

Inherited verbatim from the whole discovery program and the EAE design; nothing here may weaken it:

- **An Interpreted Intelligence Candidate is the AI ceiling.** It is EAE state 4. AI may *propose* a candidate; AI may **never** advance it to a Human-Reviewed DNA Candidate (state 5) or Confirmed Venue DNA (state 6). The wall between "AI may create" and "human only" is the load-bearing wall of the product.
- **Captured as meant ≠ confirmed Venue DNA.** Candidates interpret **Memory**; they never produce **DNA**.
- **Evidence summary ≠ truth; a candidate ≠ truth.** A candidate is HESTIA's *honest, evidence-bound suspicion*, always phrased "evidence suggests… may be", never "is".
- **HESTIA must not self-confirm its own interpretation.** The system cannot be both proposer and confirmer. No candidate may be marked confirmed by any non-human, automatic, or admin path — and no such path exists in this design.
- **Confidence is evidence strength, not certainty.** A band/word (`low | medium | high`), never a percentage, score, or readiness meter. Corroboration **raises a floor**, never inflates a ceiling; repetition never upgrades a `low` snapshot into a `high` claim.
- **Every candidate is evidence-bound.** No candidate exists without citing the specific saved review rows it rests on. No synthetic claim without source records. Contradictions are preserved, never smoothed; missing evidence is explicit.

If any line of the eventual build contradicts §0, the build is wrong — stop and re-scope.

---

## 1. Purpose

### 1.1 What an Interpreted Intelligence Candidate is
An **Interpreted Intelligence Candidate** (hereafter *candidate*) is a **read-only interpretation**
that HESTIA derives from a venue's **reviewed** concept-draft evidence — the saved
`discovery_candidate_reviews` rows the owner has already triaged (`captured | edited | held |
rejected`). A candidate says, in effect:

> *"Across your saved reviews, this meaning appears to recur / conflict / be missing — evidence
> **suggests** attribute X **may** be part of this concept's identity. It is **not** confirmed, and
> it needs your eyes."*

It is the first time HESTIA offers an *interpretation* (Intelligence) rather than a *count*
(Memory). It is always provisional, always evidence-bound, always humble.

### 1.2 Why it exists
The program so far stops at Memory: saved reviews (Slice 1 persistence), a re-entry workspace
(Slice 2a), and a read-only Evidence Summary mirror (Slice 1 endpoint + Slice 2 UI). Those tell the
owner *what was saved* and *plain observations about the saves* — but they deliberately make **no
interpretation**. An owner cannot yet see "HESTIA thinks these three saved signals are really the
same positioning idea, and this fourth one contradicts it."

Candidates exist to provide that interpretation **safely** — so that, much later, a human
confirmation surface (9D, EAE Slice 4/5) has a disciplined, evidence-bound input to confirm *from*,
and can never confirm on thin air or on the system's own echo. Designing the candidate first means
confirmation, when it is ever built, can only ever present what is genuinely there.

### 1.3 How it differs from the adjacent layers

| Layer | What it answers | Example | This program's surface |
|---|---|---|---|
| **Raw Venue Memory** | *What was saved, verbatim?* | An immutable `candidate_snapshot_json` for one signal in one review row. | `discovery_candidate_reviews` (Slice 1 persistence). |
| **Evidence Summary** | *What are the plain, non-interpretive observations about the saves?* | "5 saved reviews across 2 concepts; action mix 3 captured / 1 held / 1 rejected; lowest band present = low." | `GET /api/discovery-evidence-summary` + Slice 2 UI. **No interpretation.** |
| **Interpreted Intelligence Candidate (THIS slice)** | *What does HESTIA think the evidence may mean — with its uncertainty?* | "Evidence suggests a *late-night, high-energy bar* positioning may recur (3 supporting, 1 contradicting). Needs owner clarification." | Design only here; AI ceiling = state 4. **Interpretation, never confirmation.** |
| **Venue Intelligence (broader)** | *What does HESTIA think may be true across the live venue's operations?* | The existing venue-intelligence bridge over live operational data. | Separate, existing system — **not** fed by this slice. |
| **Confirmed Venue DNA** | *What has the venue confirmed as identity?* | Canonical identity, owner-confirmed. | Owner-conversation → `mergeVenueDna` only — **never** reached by this slice. |

**The one-line distinction:** *Memory counts; the Summary observes; a Candidate interprets; only a
human confirms.* This slice lives entirely in the "interprets" tier and never crosses into "confirms."

---

## 2. Boundary model

The candidate layer is a **pure, read-only interpretation function** with a strictly fenced input and output.

```
            ┌────────────────────────── INPUT (read-only) ──────────────────────────┐
            │  Reviewed concept-draft evidence:                                       │
            │    • discovery_candidate_reviews rows (venue-scoped,                     │
            │      record_space = 'concept_draft'), and/or                            │
            │    • the Evidence Summary projection over those rows (Slice 1).         │
            └─────────────────────────────────────────────────────────────────────────┘
                                            │  (interpret — no write)
                                            ▼
            ┌────────────────────────── OUTPUT (allowed) ───────────────────────────┐
            │  Interpreted Intelligence Candidate (EAE state 4) ONLY:                 │
            │    a read-only, evidence-bound interpretation carrying a confidence     │
            │    band, uncertainty notes, supporting + conflicting evidence refs,     │
            │    explicit missing evidence, and a suggested owner question.           │
            └─────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
            ┌──────────────────────── FORBIDDEN OUTPUT (never) ─────────────────────┐
            │  ✗ confirmed truth / "the venue is X"                                    │
            │  ✗ canonical or confirmed Venue DNA / any DNA store write                │
            │  ✗ owner-approved DNA / an approval or promotion act                     │
            │  ✗ ANY mutation (no POST/PUT/PATCH/DELETE to DNA; no mergeVenueDna)      │
            │  ✗ a state that advances itself past the human gate (no self-confirm)    │
            └─────────────────────────────────────────────────────────────────────────┘
```

**Boundary invariants:**
- **Input is reviewed evidence only.** Unreviewed/raw model output never becomes a candidate; a
  candidate rests on what the *owner already triaged and saved*.
- **Output is a candidate only.** The function's product is interpretation. It may *recommend* "consider
  clarifying / confirming this later"; it may never *perform* a confirmation or a DNA write.
- **No state may be skipped.** Memory (states 1–3) → Intelligence candidate (state 4) is the only
  transition this slice models. State 4 → state 5 (human-reviewed) and → state 6 (confirmed DNA) are
  **out of scope** and are reachable only through a human act in a far-future, separately-designed slice.
- **`venue_id` stays the access boundary; `record_space='concept_draft'` stays the conflation guard.**
  A candidate is read within the venue's boundary and is itself flagged as concept-draft-derived
  interpretation — never live-venue truth.

---

## 3. Candidate shape (proposed data contract — DESIGN ONLY, no schema)

This is a **design shape**, not DDL and not a TypeScript type to ship. It describes the fields a
candidate *would* carry if/when Slice 3B is separately approved. **No table, no column, no migration is
authorized by this document.**

```jsonc
// DESIGN SHAPE ONLY — illustrative, NOT a schema, NOT to ship from this doc.
{
  "candidate_id": "temp-uuid",            // EPHEMERAL identifier for one derivation pass.
                                          //   NOT persisted in the first design intent (candidates are
                                          //   derived live, like the Evidence Summary). NOT a venue id,
                                          //   NOT a concept_ref, NOT a confirmation handle.
  "venue_id": "…",                        // ACCESS BOUNDARY ONLY (req.venueId). Never the subject/claim.
  "source_record_space": "concept_draft", // Always this literal. The candidate interprets concept-draft
                                          //   Memory; it is never derived from or about 'live_venue'.
  "candidate_type": "positioning_signal", // One of the narrow §4 set. Drives phrasing + owner question.
  "interpretation_title": "Possible late-night, high-energy bar positioning",
                                          //   Short, hedged, human-readable. NEVER an identity assertion,
                                          //   NEVER a fabricated venue name.
  "interpretation_summary": "Evidence across 2 concept drafts suggests a late-night, high-energy bar
                              positioning may recur. One saved review points the other way.",
                                          //   Always "evidence suggests … may …"; never "the venue is …".
  "supporting_evidence_refs": [           // REQUIRED, non-empty for any non-missing-data candidate.
    { "review_id": "…", "concept_ref": "…", "conversation_ref": "…",
      "review_action": "captured", "snapshot_signal": "…", "confidence_band": "medium",
      "created_at": "…" }
    // Each ref points at a REAL saved discovery_candidate_reviews row. No row → no ref → no claim.
  ],
  "conflicting_evidence_refs": [          // REQUIRED to be PRESENT (may be empty). Contradictions are
    { "review_id": "…", "concept_ref": "…", "snapshot_signal": "…", "review_action": "rejected" }
    //   first-class evidence — preserved here, NEVER smoothed away or majority-voted out.
  ],
  "missing_evidence": [                   // Explicit gaps, in plain words. e.g.:
    "No evidence about early-evening / daytime service.",
    "Independence is weak: supporting signals share one conversation_ref."
  ],
  "confidence_band": "low | medium | high", // A FLOOR-style band (see §5). Never a %, never certainty.
  "uncertainty_notes": [                  // Why this is NOT settled. e.g.:
    "Based on owner-origin evidence only — no second source corroborates.",
    "Same-thread repetition does not count as independent (EAE §6)."
  ],
  "suggested_owner_question": "Is a late-night, high-energy bar core to this concept, or is the quieter
                               early-evening signal closer to the truth?",
                                          //   Routes interpretation back to the HUMAN. The candidate asks;
                                          //   it never answers on the owner's behalf.
  "destination_hint": "Venue DNA (owner attention only — not a write)" | null,
                                          //   OPTIONAL, inert. Mirrors the dna_earmarked attention boolean.
                                          //   It is a hint for the owner, NEVER a target, NEVER a write.
  "created_from_summary_version": "derived-live@<iso-timestamp>",
                                          //   Provenance of the derivation pass (e.g. a content hash or
                                          //   timestamp of the evidence read), so a candidate is always
                                          //   traceable to the exact Memory state it interpreted.
  "status": "proposed"                    // §3.1 vocabulary ONLY. NEVER a confirmation value.
}
```

### 3.1 Status vocabulary (confirmation must be unexpressible)
A candidate's `status` may take **only** these values. The set deliberately contains **no** way to
express confirmation — "vocabulary, not vigilance" (the Slice 1 principle, preserved here):

| Allowed `status` | Meaning |
|---|---|
| `proposed` | HESTIA derived an evidence-bound interpretation; it awaits human eyes. The default. |
| `needs_owner_clarification` | The evidence is ambiguous or the owner must disambiguate before it could ever progress. |
| `insufficient_evidence` | Too little / too weakly-independent evidence to interpret beyond noting it (EAE §5.9: "saved once is never enough"). |
| `contradicted` | Conflicting evidence is present and unresolved; the candidate is explicitly split, not averaged. |

**Forbidden `status` values (must never be accepted, stored, returned, or rendered):**
`confirmed`, `approved`, `canonical`, `promoted`, `dna_ready` / `DNA-ready`, `verified`.

> `status` carries no confirmation rung by construction. There is **no** `confirmation_ref`, no
> `confirmed` enum, no promotion column — their absence makes the dangerous act impossible to express.

### 3.2 Persistence intent (design default: derive-live, no writer)
Mirroring the Evidence Summary (Slice 1), the **default design intent is to derive candidates LIVE,
read-only, with no candidate table and no writer.** A persisted "candidate cache" is **not** authorized
here; if a future slice ever proves one is needed, it requires its own guardrail doc proving the cache is
**non-canonical, non-DNA, owner-clearable, append-only-audited, and never a confirmation** (EAE §10
Slice 3 / §13). Default remains: **no writer.**

---

## 4. Candidate types (narrow first set — do not overbuild)

Slice 3 defines a **small, fixed** vocabulary of candidate types. Each maps to a phrasing template and a
default `suggested_owner_question`. New types require a separate, explicit design decision — the set is
intentionally not open-ended.

| `candidate_type` | What it interprets | Typical evidence basis |
|---|---|---|
| `service_style_signal` | A recurring service-style meaning (e.g. "high-touch", "fast casual"). | Saved signals whose snapshot/owner-edit text describes service posture. |
| `positioning_signal` | A recurring market/positioning meaning (e.g. "premium late-night"). | Positioning-themed saved signals across concept drafts. |
| `guest_experience_signal` | A recurring guest-experience / atmosphere meaning. | Experience/atmosphere-themed saved signals. |
| `menu_or_bar_identity_signal` | A recurring food/bar identity meaning (e.g. "cocktail-led"). | Menu/bar-themed saved signals (aligns with the bar product foundation vocabulary, read-only). |
| `operational_constraint_signal` | A recurring stated constraint (e.g. "small kitchen", "no spirits licence"). | Constraint-themed saved signals; often `held`/`evidence_type = owner_provided_fact`. |
| `founder_intent_signal` | A recurring founder-intent / vision meaning from discovery. | Founder-Brief-derived saved signals with `provenance = owner_conversation`/`owner_edit`. |
| `contradiction_signal` | An explicit conflict between competing saved meanings. | ≥2 saved reviews whose meanings cannot both be core identity (EAE §7). |
| `missing_data_signal` | An explicit, important gap the evidence does not cover. | Absence reasoning over the saved set (the only type that may have empty `supporting_evidence_refs`, because its subject *is* absence — but it must still cite what *is* present to justify the gap). |

**Scope discipline:** Slice 3 ships **none** of these (design only). When 3B is approved, it should start
with an even narrower subset (recommended: `positioning_signal`, `service_style_signal`,
`contradiction_signal`, `missing_data_signal`) and grow only on demonstrated need.

---

## 5. Confidence and uncertainty rules

### 5.1 What confidence MAY mean
A candidate's `confidence_band` may reflect, qualitatively:
- **Strength of recurring evidence** — the same meaning appearing across more (genuinely independent) saved reviews.
- **Consistency across reviewed records** — agreement among the supporting evidence, with disagreement explicitly subtracted.
- **Presence/absence of contradiction** — unresolved conflict lowers or splits the band, never silently averages.
- **Amount of missing context** — large explicit gaps cap the band low.

### 5.2 What confidence MUST NOT mean
- **Not truth.** A high band is "evidence is strong and consistent", not "this is true".
- **Not DNA confirmation, not readiness to mutate DNA, not owner approval, not business correctness.**
- A band is **never** a claim the venue *is* anything.

### 5.3 Hard rules on the band
- **No percentages, no numeric scores, no readiness meters, no progress bars.** A band is a word: `low | medium | high`. Absent band → "not captured" (never default to `low`).
- **Floor, not inflation (EAE §5.7).** The band is bounded by the **weakest necessary link** and by the existing rule that confidence may only be **lowered**, never raised, relative to the captured snapshot bands. Repetition never upgrades a `low` snapshot into a `high` claim.
- **Independence gates strength (EAE §6).** Multiple rows under the *same* `concept_ref` / `conversation_ref` are **not** independent corroboration; they are observations of one thread. Until a normalized cross-concept subject key and richer provenance exist, the candidate must **declare its independence as weak** in `uncertainty_notes` and lean on the owner to assert that two captures truly mean the same thing.
- **"Saved once is never enough" (EAE §5.9).** A single saved review is Captured Owner Meaning (state 2); it may populate a candidate as *one* unit but can never, alone, present as "repeated evidence". Such a candidate is `insufficient_evidence`.
- **Contradiction never averages (EAE §7).** Conflicting evidence makes the candidate `contradicted` and splits it side-by-side; it is never majority-voted or "most recent wins" into a clean band.

> Corroboration *math* (a scoring function) is **out of scope to implement**. This section defines the
> *shape* any future band derivation must obey, not the function.

---

## 6. Evidence references (every candidate stays evidence-bound)

Non-negotiable rules so a candidate can never drift into a free-floating claim:

1. **No candidate without evidence.** Every candidate (except a `missing_data_signal`, whose subject is
   absence) must carry a **non-empty `supporting_evidence_refs`** pointing at real saved
   `discovery_candidate_reviews` rows. A `missing_data_signal` must still cite the present rows that
   justify the asserted gap. **No source rows → no candidate.**
2. **Every ref points at a real row.** A ref carries `review_id` (+ `concept_ref`, `conversation_ref`,
   `review_action`, `snapshot_signal`, `confidence_band`, `created_at`) drawn straight from the saved row.
   No fabricated, inferred, or paraphrased-without-source refs.
3. **Contradictions are preserved, not smoothed.** Any conflicting saved meaning is carried in
   `conflicting_evidence_refs` and surfaced; it is never dropped to make the interpretation look clean
   (EAE §7: "do not hide disagreement").
4. **Missing data is explicit.** Gaps are stated in `missing_evidence` in plain language, including the
   *independence* gap when supporting rows share a concept/conversation.
5. **No synthetic claims.** The interpretation text may summarize and hedge, but every assertion must be
   traceable to cited rows. Nothing the model "knows" from outside the saved evidence may enter a candidate.
6. **Traceable to a Memory state.** `created_from_summary_version` records which evidence read produced
   the candidate, so an owner (or a future human-confirmation surface) can always re-derive and audit it.

---

## 7. Owner-facing language (allowed vs forbidden)

Language is part of the truth boundary (EAE §12). For any future API field or UI string in this layer:

**Allowed:**
- "Possible signal" / "Possible …"
- "Interpreted candidate"
- "Evidence suggests …" / "… may …"
- "Needs owner clarification"
- "Contradiction found — which reflects the venue?"
- "Missing evidence" / "Not enough evidence yet"
- "Not confirmed Venue DNA" (the standing negative disclaimer)
- "Owner attention only — not Venue DNA" (for any `destination_hint`)

**Forbidden (unless and until something passes the future *human* confirmation gate — which this layer
never reaches):**
- ❌ "HESTIA knows" / "HESTIA has determined" / "the venue is …" (stated as fact)
- ❌ "Confirmed DNA" / "Confirmed" (except inside the negative "not confirmed Venue DNA")
- ❌ "Approved" / "Owner-approved"
- ❌ "Canonical"
- ❌ "Ready to promote" / "Promote" / "DNA-ready"
- ❌ "Verified"
- ❌ "Truth" / "proven" / any certainty claim
- ❌ Any percentage, score, or readiness meter presented as confidence/certainty

**Rule:** a candidate **asks and suggests**; it never **asserts or decides**. Every surface that shows a
candidate must also show its uncertainty (confidence band as a word, contradictions, missing evidence) and
the standing "not confirmed Venue DNA" disclaimer.

---

## 8. Out of scope (this slice does NOT do)

Explicitly excluded from Slice 3 (this design):
- **No implementation** — no service, no derivation function, no code of any kind.
- **No schema / migration** — no table, no column, no DDL; the §3 shape is *design shape*, not schema.
- **No endpoint** — no `GET`/anything; consumers/derivation are future, separately-approved slices.
- **No UI** — no panel, no component, no nav/PageRenderer change.
- **No confirmation flow** — no confirm action, no 9D, no human-confirmation surface (EAE Slice 4/5).
- **No promotion flow** — no candidate-to-DNA promotion, by any route or control.
- **No registry** — no candidate table, no concept registry, no new persistence (default: derive-live).
- **No `mergeVenueDna`** — not called, not imported, not referenced anywhere.
- **No Venue DNA mutation** — no write to `venue_dna_json` / `venue_intelligence` / `venue_briefs` / `venue_dna_enrichment` or any DNA store.
- **No AI self-confirmation** — AI may propose a candidate (state 4) and never advance it.
- **No automatic owner approval** — nothing approves on the owner's behalf; approval is a far-future human act, separately designed.
- **No client-side scoring** — no percentage, score, readiness meter, or inference computed in any future UI.
- **No fake / demo / seeded data** — candidates exist only where real saved evidence exists; empty means empty.
- **No new vocabulary that implies confirmation** — the forbidden `status` and language sets (§3.1, §7) stay forbidden.

---

## 9. Future implementation plan (NOT FOR IMPLEMENTATION NOW)

Each slice below is a **design placeholder**. **None is authorized by this document.** They show a safe
sequence and fence each step's scope. Each future slice needs its own approval and (where it writes
anything) its own guardrail doc.

### Slice 3B — Read-only candidate derivation service **(NOT NOW)**
- **Scope:** a pure, read-only service that derives candidates live from reviewed
  `discovery_candidate_reviews` rows per the §3 shape and §5/§6 rules. Likely needs a small, explicit
  *grouping heuristic* (and the open *normalized-subject-key* question, EAE §3) designed first.
- **Reads:** evidence rows (venue-scoped, `record_space='concept_draft'`). **Writes:** nothing (derive-live).
- **Roles:** owner/admin read; AI may *propose* candidates; **no human gate crossed.**
- **Could break:** independence violations inflating candidates; AI overconfidence; drift toward a "score = truth" output.
- **Required tests:** independence rules enforced; one-concept echoes don't corroborate; floor-only confidence; contradictions never collapsed; every candidate evidence-bound; **no DNA contact, no `mergeVenueDna`, zero rows written.**

### Slice 3C — Read-only candidate endpoint **(NOT NOW)**
- **Scope:** a single read-only `GET` returning Slice 3B candidates for the venue.
- **Reads:** Slice 3B service only. **Writes:** nothing.
- **Roles:** owner/admin read; no writer; no admin write path.
- **Required tests:** venue isolation; `record_space` filter; zero rows created; no forbidden `status`/vocabulary; copy audit; no DNA-store contact.

### Slice 3D — Owner-facing read-only candidate UI **(NOT NOW)**
- **Scope:** a read-only panel (Palette B, collapsed by default, sibling of the Evidence Summary panel) rendering candidates with mandatory uncertainty + "not confirmed Venue DNA" framing.
- **Reads:** Slice 3C endpoint only. **Writes:** nothing.
- **Required tests:** only the candidate GET is called; no mutation; no confirm/promote control; allowed language only; contradictions and missing evidence visible; band shown as a word, never a %.

### Slice 4 — Owner clarification loop **(DESIGN-ONLY, NOT NOW)**
- **Scope:** *design* of how an owner answers a candidate's `suggested_owner_question` (state 4 → toward state 5). The owner's answer is **new owner Memory**, captured like a fidelity review — it does **not** confirm DNA.
- **Writes (design phase):** nothing. **Roles:** owner authors clarification; admin excluded from authorship.

### Later only — Human-approved promotion **(DESIGN-ONLY, FAR FUTURE)**
- **Scope:** *design only* of the human confirmation/promotion surface (EAE Slice 4/5 / 9D). The **only**
  path that may ever write canonical Venue DNA, strictly behind explicit owner confirmation, audit-first,
  admin permanently excluded. **Not designed here, not implemented here.** Must not be approached until
  Slices 3B–3D and the clarification loop and their guardrail docs exist.

---

## 10. QA & doctrine checklist (for the FUTURE implementation — defined, not run here)

When any Slice 3B+ is built, the following must hold (several are **assert-by-absence**, the Slice 1/2 idiom):

**No writes / no DNA / no confirmation**
- [ ] No write to any Venue DNA store (`venue_dna_json` / `venue_intelligence` / `venue_briefs` / `venue_dna_enrichment`).
- [ ] No `mergeVenueDna` import, call, or reference anywhere in the candidate code path.
- [ ] No confirmation vocabulary accepted/stored/returned: no `confirmed` / `approved` / `canonical` / `promoted` / `dna_ready` / `verified` `status`; no `confirmation_ref` column.
- [ ] No promotion vocabulary or control: no `/promote`, no `/confirm`, no approve/promote button.
- [ ] The derivation creates **zero** rows (default derive-live) and appends **zero** audit rows; if a cache is ever approved, it is non-canonical, owner-clearable, append-only-audited, and proven by its own guardrail doc.

**Evidence integrity**
- [ ] Every candidate is **evidence-bound**: non-empty `supporting_evidence_refs` (or, for `missing_data_signal`, cited present rows justifying the gap); every ref resolves to a real saved review row.
- [ ] **Contradictions preserved**: conflicting evidence carried in `conflicting_evidence_refs` and surfaced, never smoothed, averaged, or majority-voted.
- [ ] **Missing data visible**: gaps (including weak independence) stated explicitly in `missing_evidence` / `uncertainty_notes`.
- [ ] **No synthetic claims**: nothing in a candidate is asserted without a cited source row.
- [ ] **Independence enforced**: same-`concept_ref` / same-`conversation_ref` rows are not counted as independent corroboration.

**Confidence framing**
- [ ] Confidence is **evidence-strength only**, shown as a word band; **no percentages, no scores, no readiness meters**.
- [ ] Band is **floor-only**: never raised by repetition; bounded by the weakest necessary link; absent band → "not captured", never defaulted to `low`.
- [ ] "Saved once" never presents as repeated evidence (→ `insufficient_evidence`).

**Scope / language / data**
- [ ] No schema/migration unless a later slice is **explicitly approved** with its own guardrail doc.
- [ ] No endpoint/UI/registry/nav/PageRenderer change beyond the specific approved slice.
- [ ] Owner-facing language uses only the §7 allowed set; the forbidden set appears only in the negative; the "not confirmed Venue DNA" disclaimer is present and non-removable.
- [ ] **No fake/demo data**: candidates appear only where real saved evidence exists; empty means empty.
- [ ] Venue scoping: every read is `req.venueId`-scoped and `record_space='concept_draft'`-filtered; cross-venue isolation tested.
- [ ] Regression: Slice 1/2 service, route, and workspace tests stay green; `npm run build` + `npm run hestia:check` green.

---

## 11. References

Verified to exist in the repo at `5930c7e` and aligned-with by this design:
- [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) — governing Memory/Intelligence/DNA boundary.
- [NEW_VENUE_DISCOVERY_EVIDENCE_ACCUMULATION_ENGINE_DESIGN.md](./NEW_VENUE_DISCOVERY_EVIDENCE_ACCUMULATION_ENGINE_DESIGN.md) — the evidence lifecycle, AI ceiling (state 4), independence/contradiction/confidence rules this slice obeys.
- [NEW_VENUE_DISCOVERY_EVIDENCE_SUMMARY_UI_DESIGN.md](./NEW_VENUE_DISCOVERY_EVIDENCE_SUMMARY_UI_DESIGN.md) — the read-only Evidence Summary UI (Slice 2) this slice sits above.
- [NEW_VENUE_DISCOVERY_CONCEPT_DRAFT_WORKSPACE_SCOPE.md](./NEW_VENUE_DISCOVERY_CONCEPT_DRAFT_WORKSPACE_SCOPE.md) — the concept-draft workspace (Slice 2a) and triple-key doctrine.

Code surfaces referenced (read-only, not modified):
`src/services/venueIntelligence/discoveryCandidateReviewService.js` (evidence rows + Slice 1 summary),
`src/features/owner-intelligence/EvidenceSummaryPanel.jsx` (Slice 2 UI),
`server.js` (`GET /api/discovery-evidence-summary`).

> If a future edit cites a doc that does not exist, that must be flagged rather than invented.

---

## 12. Final recommendation

1. **Do not implement candidates yet.** This is the first Intelligence layer; its independence,
   contradiction, and normalized-subject questions (EAE §3/§6) deserve their own grounding before code.
2. **Next safe step is Slice 3B design refinement** — pin down the grouping heuristic and the
   normalized-subject-key question on paper, then a read-only, derive-live, write-nothing candidate
   service obeying §3/§5/§6 and the §10 checklist.
3. **Only far later, design owner confirmation / promotion** — never before candidates, the clarification
   loop, and their guardrail docs exist.

**One-line doctrine:** *HESTIA may interpret reviewed evidence into honest, evidence-bound candidates —
but the candidate is the ceiling: it asks, it suggests, it never confirms, and only a human ever opens the
wall to Venue DNA.*

---

*End of design / spec. No code, schema, tables, migrations, routes, services, prompts, UI, or localStorage
were changed in producing this document. No Venue DNA was read for mutation or mutated; `mergeVenueDna` was
not called; no confirmation, promotion, approval, registry, or candidate writer was introduced. The
Interpreted Intelligence Candidate is the AI ceiling — interpretation carrying confidence and uncertainty,
captured from Memory, never confirmed Venue DNA, and never self-confirmed by HESTIA.*
