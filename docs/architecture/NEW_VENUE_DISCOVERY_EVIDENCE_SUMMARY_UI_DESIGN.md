# New Venue Discovery — Evidence Summary UI (EAE Slice 2) — DESIGN ONLY

> **Status: DESIGN DOCUMENT. NOT FOR IMPLEMENTATION.**
> This document changes no code, no schema, no tests, no routes, no UI, no localStorage.
> It scopes a single read-only owner-facing surface — a **memory mirror** over the existing
> `GET /api/discovery-evidence-summary` endpoint (EAE Slice 1, shipped at `6a406db`). The UI
> renders what that endpoint already returns and **nothing more**: no second fetch of raw
> rows, no client-side scoring, no grouping, no confirmation, no promotion, no DNA contact.
>
> Nothing in this document authorizes a writer, a new endpoint, a new table, a confirmed /
> approved / promoted state, a `confirmation_ref`, a `mergeVenueDna` call, a canonical Venue
> DNA write, a concept registry, 9D, an Intelligence-candidate grouping layer, or a read-time
> "truth" / "verified" score. Every line below describes a **read-only projection**.

- **Author context:** New Venue Discovery program, EAE Slice 2 (the owner-facing view of Slice 1).
- **Baseline commit:** `6a406db` — *feat: add read-only evidence summary endpoint*.
- **Implements (UI for):** [NEW_VENUE_DISCOVERY_EVIDENCE_ACCUMULATION_ENGINE_DESIGN.md](./NEW_VENUE_DISCOVERY_EVIDENCE_ACCUMULATION_ENGINE_DESIGN.md) §10 *Slice 2 — Owner-facing Evidence Review view*.
- **Binding doctrine:** [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md); the EAE design's §8 (Memory → Intelligence → DNA boundary), §9 (safely-derivable observations), §12 (UX doctrine / forbidden words), §13 (risks).
- **Governing workspace scope (reuse, do not contradict):** [NEW_VENUE_DISCOVERY_CONCEPT_DRAFT_WORKSPACE_SCOPE.md](./NEW_VENUE_DISCOVERY_CONCEPT_DRAFT_WORKSPACE_SCOPE.md) (Slice 2a — the host surface, Palette B, the non-removable framing pattern).

---

## 0. Hard doctrine (restated, non-negotiable, governs everything below)

Inherited verbatim from the whole discovery program and the EAE design; nothing here may weaken it:

- **The evidence summary is a memory mirror, not truth.** It shows *what was saved* and HESTIA's
  honest, coarse *observations about those saves* — never a verdict. "Evidence summary ≠ truth."
- **Captured as meant ≠ confirmed Venue DNA.** Every saved review is **Memory** (`record_space = 'concept_draft'`). This view surfaces Memory; it never surfaces, implies, or produces confirmed **Venue DNA**.
- **HESTIA must not self-confirm its own interpretation.** The AI ceiling is the *Interpreted Intelligence Candidate* (EAE §4 state 4). This view is **below** even that — it is a Memory-space read-only observation (states 1–3), not an Intelligence candidate surface. It renders no candidate, no recommendation to confirm, no decision control.
- **No new writer, no new endpoint, no new vocabulary.** The view consumes the one existing read-only route. It adds no `confirmed` / `approved` / `promoted` word and renders none.
- **`dna_earmarked` / `dna_earmarks` is inert owner attention, never confirmation.** It must be labelled as attention-only everywhere it appears (EAE §2, §4: lives in states 2–3, never states 5–6).
- **Confidence is evidence coverage, not certainty.** Shown as a band/word (`low | medium | high`), never as a percentage, never as a "truth score." The `confidence_floor` is a **floor** (the weakest band present) and must be labelled as such — never "overall confidence," never inflated by repetition.

If any line of the eventual build contradicts §0, the build is wrong — stop and re-scope.

---

## 1. Product purpose

### 1.1 What this slice delivers
Slice 1 shipped `GET /api/discovery-evidence-summary` — a read-only memory mirror that derives the
EAE §9 *safely-derivable* observations live from existing `discovery_candidate_reviews` rows
(venue-scoped, `record_space='concept_draft'`). It has **no UI**. An owner cannot see it.

Slice 2 gives the owner a **quiet, honest, read-only view** of that summary: a single place to see
"here is what HESTIA has saved across your concept drafts, and here are the plain observations about
those saves — none of it confirmed." It is a **memory mirror**, full stop.

### 1.2 What it is NOT
- Not an Intelligence layer (no candidate grouping — that is EAE Slice 3, separately designed).
- Not a confirmation surface (no 9D — EAE Slice 4, design-only, far future).
- Not a decision control (no confirm / approve / promote / "send to DNA" button anywhere).
- Not a second data source (it reads **only** the Slice 1 endpoint; it does not re-query rows,
  re-aggregate, re-score, or re-group on the client).
- Not a Venue DNA / Venue Intelligence surface, and must be visually and semantically distinct from one (EAE §13: dangerous adjacency).

### 1.3 Who uses it
- **Primary: the owner** (chat-first `ownerHome` persona). Same audience as the Concept Drafts Workspace.
- **Secondary: admin** — **read-only mirror at most** (the endpoint is `requireAuth('owner','admin')`). Admin never gains a write or confirm path here, because none exists in this view for anyone.
- **No other role.** Managers, F&B/events directors, chefs, employees do not see the evidence summary (it is owner concept-discovery material, gated by the endpoint's `owner`/`admin` roles).

---

## 2. Where the UI lives

### 2.1 Recommendation — a sibling read-only panel inside `OwnerAIHome`, adjacent to `ConceptDraftsPanel`
Mount a new **`EvidenceSummaryPanel`** in [OwnerAIHome.jsx](../../src/features/owner-intelligence/OwnerAIHome.jsx) directly beside the existing `ConceptDraftsPanel` (mounted at [OwnerAIHome.jsx:435](../../src/features/owner-intelligence/OwnerAIHome.jsx#L435)). Same Palette B (Editorial Light), same collapsible `<details>` posture, **collapsed by default** — never the product's centre of gravity.

| Option | Verdict | Reasoning |
|---|---|---|
| **A. New `EvidenceSummaryPanel` sibling of `ConceptDraftsPanel` in `OwnerAIHome`** | **RECOMMENDED** | Reuses the proven Slice 2a host, palette, framing pattern, and collapse-by-default restraint. Keeps discovery, drafts, and the evidence mirror in the one owner-home surface. Low nav weight; trivially distinct from any DNA surface. |
| **B. A new tab/section inside `ConceptDraftsPanel`** | **Rejected for v1** | Conflates "re-open one draft's saved reviews" (per-`concept_ref` readback) with "venue-wide observation summary" (cross-concept mirror). Different jobs; keep them as siblings, not nested. |
| **C. New top-level nav page** | **Deferred** | Heavier than the need; fragments the chat-first owner home. Revisit only if the mirror becomes first-class. |
| **D. Venue Intelligence / Venue DNA sub-tab** | **Rejected (doctrine)** | Dangerous adjacency: placing a *memory mirror* beside live *Venue Intelligence / DNA* invites the exact conflation the doctrine forbids (EAE §13). Never here. |

### 2.2 Registration
- **No `PageRenderer` / `navigationConfig` change** is needed for Option A — the panel renders inside `OwnerAIHome`, which is already a registered page. (A top-level page, Option C, is explicitly *not* this slice.)
- New file: `src/features/owner-intelligence/EvidenceSummaryPanel.jsx`. One import + one `<EvidenceSummaryPanel />` mount line in `OwnerAIHome.jsx`. Nothing else in the app graph changes.

---

## 3. Exact data contract (from the existing endpoint — do not extend)

**Source of truth:** `GET /api/discovery-evidence-summary` — [server.js:6612](../../server.js#L6612), backed by `summarizeDiscoveryEvidenceForVenue(db, req.venueId)` in [discoveryCandidateReviewService.js:620](../../src/services/venueIntelligence/discoveryCandidateReviewService.js#L620). Roles: `requireAuth('owner','admin')`. Read-only; venue-scoped; `record_space = 'concept_draft'` only.

**Fetch (reuse the existing client):** `apiGet('/api/discovery-evidence-summary')` from [src/services/api/client.js:45](../../src/services/api/client.js#L45). No new client method, no new headers (the venue header `X-HESTIA-Venue` and auth are already applied by `apiRequest`).

### 3.1 Response envelope
```jsonc
{
  "ok": true,
  "summary": { /* see §3.2 */ },
  "note": "Memory signals only — not confirmed Venue DNA."   // render verbatim; never suppress
}
```
On error the route returns HTTP 400 `{ "error": "<message>" }` — surfaced as the **error state** (§4.5).

### 3.2 `summary` shape (render every field exactly as typed; invent none)
```jsonc
{
  "scope": "concept_draft",                 // always this literal; render as a "concept draft" qualifier, never "live venue"
  "label": "Evidence Summary — Memory Signals Only",  // use as the panel title or alongside it
  "memory_only": true,                      // always true; drives the persistent Memory framing
  "totals": {
    "saved_reviews": 0,                     // count of saved fidelity-review rows
    "concept_refs": 0,                      // number of distinct concept threads
    "dna_earmarks": 0                       // INERT owner-attention count — label as attention only
  },
  "action_mix": {                           // the four known fidelity actions, zeroed when absent
    "captured": 0, "edited": 0, "held": 0, "rejected": 0
  },
  "destinations": [                         // venue-wide destination distribution, sorted by count desc
    { "destination": "Venue DNA", "count": 0, "dna_earmarked": false }
    // destination 'Unrouted' groups null/blank routes — render as "not routed", never fabricate a route
  ],
  "concepts": [                             // one entry per concept_ref, newest activity first
    {
      "concept_ref": "uuid",               // opaque token; NEVER derive meaning/label from the id itself
      "saved_review_count": 0,
      "latest_saved_at": "2026-06-25 12:00:00 | null",
      "action_mix": { "captured": 0, "edited": 0, "held": 0, "rejected": 0 },
      "destinations": [ { "destination": "…", "count": 0, "dna_earmarked": false } ],
      "dna_earmarked_count": 0,            // INERT owner attention per concept — label as attention only
      "confidence_floor": "low | medium | high"   // OPTIONAL — present only when a band exists; a FLOOR
    }
  ],
  "confidence_floor": "low | medium | high",       // OPTIONAL venue-wide floor; absent when no band present
  "limitations": [                          // render ALL of these, verbatim, non-removably
    "Memory signals only — not confirmed Venue DNA.",
    "This summary does not prove venue identity.",
    "Counts reflect saved reviews, not independent corroboration.",
    "Cross-concept semantic repetition is not inferred here."
  ]
}
```

### 3.3 Contract rules the UI must obey
- **Render only what the endpoint returns.** No client-side derivation, re-aggregation, re-scoring, percentage, ratio, or "X% to DNA" computed from these numbers. Counts are shown as counts.
- **`confidence_floor` is OPTIONAL and is a FLOOR.** When absent, render "not captured" / omit — never default to `low`, never invent a band. Label it "lowest coverage band present", never "overall confidence."
- **`dna_earmarks` / `dna_earmarked` / `dna_earmarked_count` are inert owner attention.** Every appearance must carry attention-only framing (e.g. "earmarked for attention — not Venue DNA"). Never a count toward confirmation.
- **`scope` is `'concept_draft'`.** Where the surface needs a qualifier, it reads "concept-draft" / "concept draft" — never "live venue", never "your venue's identity."
- **`concept_ref` is opaque.** Labels/wayfinding may use counts and `latest_saved_at`; they must **never** decode meaning from the UUID, and must never synthesize a venue name (§5).
- **`limitations` and `note` are non-removable.** They render on every populated and empty state.
- **No second fetch.** This view never calls `/api/discovery-concept-drafts`, `/api/discovery-reviews`, or any row-level route. One endpoint, one read.

---

## 4. Allowed read-only UI states (exactly four)

The panel is a pure function of one fetch. It has exactly these states; no other state may write, mutate, or branch into a decision flow.

### 4.1 Loading
- Trigger: fetch in flight (initial mount, or an explicit owner-initiated refresh).
- Render: a quiet "Reading your saved evidence…" line in Palette B. No skeleton implying data exists. No spinner that reads as "processing/confirming."
- Forbidden: any copy implying analysis, scoring, verification, or DNA work is underway.

### 4.2 Empty (zero saved reviews)
- Trigger: `ok: true` with `summary.totals.saved_reviews === 0` (the endpoint's honest base shape for a venue with no concept-draft reviews).
- Render: a calm explainer — "No saved evidence yet. When you review HESTIA's candidate signals in a discovery conversation and save your choices, a memory summary of those saves appears here." Plus the persistent **Memory / not-Venue-DNA framing** and the `note`/`limitations` lines.
- Forbidden: a "get started → confirm your DNA" CTA; any nudge toward a confirmation/promotion action; any fabricated sample data.

### 4.3 Populated
- Trigger: `ok: true` with `saved_reviews > 0`.
- Render (read-only, in this priority):
  1. **Persistent framing** (§5) — the non-removable Memory / not-confirmed-Venue-DNA line, always first.
  2. **Totals** — `saved_reviews`, `concept_refs`, and `dna_earmarks` (the last labelled *attention only — not Venue DNA*).
  3. **Action mix** — `captured / edited / held / rejected` as plain counts (reuse the Slice 2a action vocabulary: "Captured as meant", "Edited", "Held", "Rejected").
  4. **Destinations** — the distribution as counts; `Unrouted` shown as "not routed"; any `Venue DNA` destination labelled "earmark only — not Venue DNA."
  5. **Venue-wide confidence floor** — the band word with the "lowest coverage band present — coverage, not certainty, not confirmation" caption; omit when absent.
  6. **Per-concept rows** — for each `concepts[]` entry: `saved_review_count`, `latest_saved_at`, its `action_mix`, its `confidence_floor` (floor caption), and its `dna_earmarked_count` (attention-only caption). Sorted as the endpoint returns them (newest activity first) — no client re-sort that implies ranking/priority.
  7. **`limitations`** — all four lines, verbatim, at the foot.
- Forbidden: contradictions presented as resolved; any aggregate presented as a verdict; any "ready to confirm" affordance.

### 4.4 (Within populated) — per-concept "no band" / "no destination"
- A concept with no `confidence_floor` renders "not captured" (never `low`). A null/blank destination renders "not routed." No fabrication.

### 4.5 Error
- Trigger: fetch rejects (network) or HTTP 400 `{ error }`.
- Render: a calm, reassuring line — "HESTIA could not load your evidence summary right now. **Nothing was changed.**" (mirrors the Slice 2a error copy). Offer a single read-only **Retry** that re-issues the same GET. No partial/garbled data shown.
- Forbidden: surfacing raw error internals as if they were evidence; implying any write was attempted or rolled back (none was — it is a read).

---

## 5. Exact wording / guardrail copy (binding)

These strings are the truth boundary. They are **non-removable** and must appear as specified. They reuse the EAE §12 approved phrasing and the Slice 2a framing.

### 5.1 Always-present, non-removable framing (top of panel, every non-loading state)
> **Evidence summary — Memory signals only.** This is what HESTIA has saved across your concept
> drafts, with plain observations about those saves. It is **not** confirmed Venue DNA, it does not
> prove venue identity, and HESTIA cannot confirm it on its own.

### 5.2 The endpoint `note` (render verbatim, never suppress)
> Memory signals only — not confirmed Venue DNA.

### 5.3 The endpoint `limitations` (render all four, verbatim, at the foot)
> - Memory signals only — not confirmed Venue DNA.
> - This summary does not prove venue identity.
> - Counts reflect saved reviews, not independent corroboration.
> - Cross-concept semantic repetition is not inferred here.

### 5.4 Field-level captions (mandatory where the field appears)
- `dna_earmarks` / `dna_earmarked_count`: **"Earmarked for owner attention — not Venue DNA."**
- `confidence_floor` (venue or concept): **"Lowest coverage band present — coverage, not certainty, and not confirmation."**
- `destinations` containing `Venue DNA`: **"Earmark only — not Venue DNA."**
- `Unrouted` destination: **"Not routed."**

### 5.5 Empty-state line
> No saved evidence yet. When you review HESTIA's candidate signals in a discovery conversation and
> save your choices, a memory summary of those saves appears here. Nothing here is Venue DNA.

### 5.6 Error-state line
> HESTIA could not load your evidence summary right now. Nothing was changed. [Retry]

---

## 6. Labels — allowed vs forbidden

### 6.1 Allowed
- Plain **counts** straight from the endpoint (`saved_reviews`, `concept_refs`, action-mix counts, destination counts, `dna_earmarked_count`).
- The four **fidelity-action words** (`captured / edited / held / rejected`) with their Slice 2a human labels.
- The **coverage band words** (`low / medium / high coverage`) shown as a floor, never a percentage.
- **Dates** from `latest_saved_at`, formatted for humans.
- A neutral per-concept **wayfinding label** derived ONLY from endpoint data — e.g. "Concept draft · {N} saved reviews · last saved {date}". A short prefix of `concept_ref` is acceptable only as an opaque disambiguator (e.g. last 6 chars), explicitly presented as an id fragment, never as a name.

### 6.2 Forbidden
- ❌ "verified", "approved", "confirmed", "promoted", "DNA updated", "official", "final".
- ❌ "the venue is…" stated as fact; any phrasing that asserts identity.
- ❌ Any **percentage / score / readiness meter / "X% to DNA" / progress bar** toward confirmation.
- ❌ A **synthesized venue name** or any implication a concept is a real, named, or live venue.
- ❌ Any **decoding of meaning from the `concept_ref` UUID**.
- ❌ "corroborated" / "independent evidence" framing for counts (the endpoint does not assert independence — EAE §6/§9; `limitations` say so explicitly).
- ❌ "overall confidence" for `confidence_floor` (it is a floor, not an aggregate certainty).
- ❌ Any **celebratory** affordance (success green, checkmark-as-confirmed, confetti, "done").
- ❌ Any **control** that reads as a decision: confirm, approve, promote, "send to DNA", "make official."

---

## 7. Read / write boundaries

| Concern | Boundary |
|---|---|
| **Writes** | **None.** The panel issues exactly one HTTP method: `GET /api/discovery-evidence-summary`. No POST/PUT/PATCH/DELETE, ever, from this surface. |
| **Endpoints touched** | Exactly one (the Slice 1 summary route). No row-level routes, no concept-draft routes, no DNA routes. |
| **Roles** | Owner-facing; admin read-only mirror (inherited from the endpoint's `requireAuth('owner','admin')`). No role gains a write/confirm path here. |
| **Venue scope** | Inherited from the endpoint (`req.venueId`, `record_space='concept_draft'`). The client adds no venue logic and never sends a venue id in the body. |
| **State** | Local React state only (fetched summary, loading/error flags). No `localStorage`, no global store mutation, no persistence. |
| **DNA contact** | None. The component imports nothing DNA-related; it never references `mergeVenueDna`, `venue_dna_json`, `venue_intelligence`, `venue_briefs`, or `venue_dna_enrichment`. |

---

## 8. Explicitly OUT OF SCOPE (this slice does not do)

- **No 9D** — no confirmation tier, no `venue_dna_confirmations`, no confirm action, no corroboration engine, no second-party mode.
- **No confirmation flow** — no confirm / approve / accept-as-DNA control of any kind.
- **No promotion flow** — no candidate-to-DNA promotion, by any route or button.
- **No registry** — no `concept_drafts` table, no client registry, no new persistence.
- **No schema / migration** — no DDL, no column, no table.
- **No `mergeVenueDna`** — not called, not imported, not referenced.
- **No Venue DNA mutation** — no write to any canonical DNA store; opening/viewing the summary writes nothing.
- **No Intelligence candidate layer** — no grouping of evidence into candidates, no cross-concept "same attribute" linking, no contradiction edges (that is EAE Slice 3, separately designed; this slice is Memory-space mirror only).
- **No new endpoint** — consumes only the shipped Slice 1 route.
- **No client-side scoring / inference** — no readiness, truth score, independence claim, decay, or confidence *increase*; counts and the endpoint's floor are rendered as-is.
- **No fake / demo / sample data** — empty means empty; never seed illustrative evidence.
- **No AI call** — the panel calls no model; it renders deterministic endpoint output.
- **No nav/PageRenderer change** — it mounts inside `OwnerAIHome` (Option A).
- **No new vocabulary** — no `confirmed`/`approved`/`promoted` string enters the codebase via this slice.

---

## 9. QA / verification checklist (for the future implementation — defined, not run here)

When this is built, the following must hold. Several are **assert-by-absence** (the Slice 1 test idiom).

**No writes / no mutation**
- [ ] The component's only network call is `GET /api/discovery-evidence-summary`. Grep the file: no `apiPost`/`apiPut`/`apiPatch`/`apiDelete`, no `fetch(...{method:!GET})`.
- [ ] Exercising every state (loading/empty/populated/error, including Retry) creates **zero** `discovery_candidate_reviews` rows and **zero** `discovery_candidate_review_events` rows.
- [ ] No `localStorage` / `sessionStorage` write; no global store mutation.

**No DNA / no confirmation / no promotion**
- [ ] The file imports nothing DNA-related; greps for `mergeVenueDna`, `venue_dna_json`, `venue_intelligence`, `venue_briefs`, `venue_dna_enrichment` → no matches.
- [ ] No `confirm` / `approve` / `promote` / `confirmation_ref` token in the component (control names or copy).
- [ ] No control element (button/link/toggle) routes anywhere or triggers any decision; the only interactive elements are expand/collapse and Retry (a re-GET).

**No schema / no registry**
- [ ] No DDL, no migration, no new table/column anywhere in the diff.
- [ ] No `concept_drafts` registry, no client-side persistence layer added.

**Copy / truthfulness (copy-audit test)**
- [ ] The endpoint `note` and all four `limitations` render verbatim and are non-removable.
- [ ] The §5.1 persistent "Memory signals only / not confirmed Venue DNA" framing renders in every non-loading state.
- [ ] Forbidden words (§6.2) do not appear: `verified`, `approved`, `confirmed` (except inside the negative phrase "not confirmed Venue DNA"), `promoted`, `DNA updated`, `truth`, no `%`/score/readiness meter.
- [ ] `dna_earmarks` / `dna_earmarked*` always carries the attention-only caption; `confidence_floor` always carries the floor caption; `Venue DNA` destination always carries "earmark only — not Venue DNA."

**Behavioral correctness**
- [ ] Empty state shows when `saved_reviews === 0`; no fabricated rows.
- [ ] Populated state renders only endpoint-provided counts/bands/dates; no client-computed percentage or ratio.
- [ ] A missing `confidence_floor` renders "not captured" (never `low`); a null destination renders "not routed."
- [ ] Concepts render in endpoint order (no client re-rank implying priority).
- [ ] Error state shows the reassuring "Nothing was changed." line and a working read-only Retry; no partial data.

**Scope / regression**
- [ ] Owner and admin can load it; no other role reaches it (endpoint role gate unchanged).
- [ ] The Slice 1 service/route tests stay green, unchanged.
- [ ] `npm run build` and `npm run hestia:check` green.

---

## 10. Recommended implementation slice (after this design is approved)

**EAE Slice 2 build — `EvidenceSummaryPanel` (read-only memory mirror).**
A new `src/features/owner-intelligence/EvidenceSummaryPanel.jsx` (Palette B, collapsible, collapsed by
default) that issues one `apiGet('/api/discovery-evidence-summary')`, renders the four states of §4 with
the §5 mandatory copy and the §6 label rules, and is mounted as a sibling of `<ConceptDraftsPanel />` in
`OwnerAIHome` (one import + one mount line). **Zero new endpoints, zero new tables, zero writers, zero
DNA contact, zero new vocabulary.** Covered by the §9 checklist (no-writes / no-DNA / copy-audit / state
correctness).

---

*End of design / spec. No code, schema, tables, migrations, routes, services, prompts, UI, or
localStorage were changed in producing this document. No endpoint was added — this slice consumes the
existing read-only `GET /api/discovery-evidence-summary`. No Venue DNA was read for mutation or mutated;
`mergeVenueDna` was not called; no confirmation, promotion, registry, or Intelligence-candidate layer was
introduced. The evidence summary remains a memory mirror only: captured as meant, never confirmed Venue
DNA — and HESTIA never self-confirms its own interpretation.*
