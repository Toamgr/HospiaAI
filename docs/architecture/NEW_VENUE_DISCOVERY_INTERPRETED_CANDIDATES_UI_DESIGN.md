# New Venue Discovery — Interpreted Candidates UI (EAE Slice 3D) — DESIGN ONLY

> **Status: DESIGN DOCUMENT. NOT FOR IMPLEMENTATION.**
> This document changes no code, no schema, no tests, no routes, no UI, no localStorage.
> It scopes a single read-only owner-facing surface — a **cautious interpretation view** over the
> existing `GET /api/discovery-interpreted-candidates` endpoint (EAE Slice 3C, shipped at
> `563234a`). The UI renders what that endpoint already returns and **nothing more**: no second
> fetch, no client-side scoring, no grouping, no re-classification, no confirmation, no promotion,
> no DNA contact.
>
> Nothing in this document authorizes a writer, a new endpoint, a new table, a confirmed /
> approved / promoted / canonical state, a `confirmation_ref`, a `mergeVenueDna` call, a Venue DNA
> write, a concept registry, 9D, an owner-clarification write loop, a new candidate type, a themed
> classification, an AI call, or a read-time "truth" / "verified" / "readiness" score. Every line
> below describes a **read-only projection** of the AI ceiling (EAE state 4).

- **Author context:** New Venue Discovery program, EAE Slice 3D (the owner-facing view of the Slice 3B/3C Intelligence layer).
- **Baseline commit:** `563234a` — *feat: add read-only interpreted candidates endpoint* (Slice 3C complete, live on `origin/main`).
- **Implements (UI for):** [NEW_VENUE_DISCOVERY_INTERPRETED_INTELLIGENCE_CANDIDATES_DESIGN.md](./NEW_VENUE_DISCOVERY_INTERPRETED_INTELLIGENCE_CANDIDATES_DESIGN.md) §9 *Slice 3D — Owner-facing read-only candidate UI*.
- **Binding doctrine:** [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md); the EAE design's §8 (Memory → Intelligence → DNA boundary), §5 (confidence), §6 (independence), §7 (contradiction), §12 (UX doctrine / forbidden words).
- **Host-surface precedent (reuse, do not contradict):** [NEW_VENUE_DISCOVERY_EVIDENCE_SUMMARY_UI_DESIGN.md](./NEW_VENUE_DISCOVERY_EVIDENCE_SUMMARY_UI_DESIGN.md) (Slice 2 — the sibling read-only panel pattern, Palette B, collapse-by-default, non-removable framing).

---

## 0. Hard doctrine (restated, non-negotiable, governs everything below)

Inherited verbatim from the whole discovery program and the EAE design; nothing here may weaken it:

- **An Interpreted Intelligence Candidate is the AI ceiling (EAE state 4).** This view renders candidates HESTIA *proposed*; it never advances one to a Human-Reviewed DNA Candidate (state 5) or Confirmed Venue DNA (state 6). The wall between "AI may create" and "human only" is the load-bearing wall — this UI sits firmly on the AI side and offers **no** control that crosses it.
- **Captured as meant ≠ confirmed Venue DNA.** A candidate interprets **Memory**; it never surfaces, implies, or produces confirmed **Venue DNA**. This view must be visually and verbally impossible to confuse with a DNA / canonical-identity surface (EAE §13: dangerous adjacency).
- **A candidate ≠ truth.** Each candidate is HESTIA's honest, evidence-bound *suspicion*, always phrased "evidence suggests… may…", never "is". The UI renders it as a question/observation, never a verdict.
- **HESTIA must not self-confirm its own interpretation.** No candidate may be marked confirmed by any non-human, automatic, or admin path — and this UI exposes no such path for anyone.
- **Confidence is evidence strength, not certainty.** Shown as a word band only (`low` in current reality; `null` → "not captured"). Never a percentage, score, readiness meter, or progress bar. Repetition never inflates it.
- **Every candidate is evidence-bound; contradictions and missing data are preserved.** The UI must show the supporting refs, the conflicting refs, and the missing-evidence notes — never smoothing disagreement, never hiding a gap.

If any line of the eventual build contradicts §0, the build is wrong — stop and re-scope.

---

## 1. Product purpose

### 1.1 What this slice delivers
Slice 3B shipped `deriveInterpretedCandidatesForVenue(db, venueId)` — a pure, read-only, derive-live
service that turns saved concept-draft evidence into Interpreted Intelligence Candidates. Slice 3C
shipped `GET /api/discovery-interpreted-candidates` — the read-only window onto it. Neither has a UI;
an owner cannot see the interpretation layer at all.

Slice 3D gives the owner a **quiet, honest, read-only view** of those candidates: a single place to see
"here is what HESTIA *suspects* your saved evidence may mean — where it conflicts, where it is missing —
none of it confirmed, and HESTIA cannot confirm it on its own." It is the first surface that shows
*interpretation* rather than *counts*, and it must wear its humility visibly.

### 1.2 What it is NOT
- Not a confirmation surface (no 9D — EAE Slice 4/5, design-only, far future).
- Not a decision control (no confirm / approve / promote / "send to DNA" / edit affordance anywhere).
- Not an owner-clarification *write* loop (answering a `suggested_owner_question` is EAE Slice 4A/4B, separately designed; this slice only *displays* the question).
- Not a second data source (it reads **only** the Slice 3C endpoint; it does not re-query rows, re-aggregate, re-score, re-group, or re-classify on the client).
- Not a Venue DNA / Venue Intelligence surface, and must be semantically and visually distinct from one.
- Not an evidence *counter* — that is the Evidence Summary panel (Slice 2), which this panel sits beside but does not replace. (Memory **counts**; the Summary **observes**; a Candidate **interprets**; only a human **confirms**.)

### 1.3 Who uses it
- **Primary: the owner** (chat-first `ownerHome` persona). Same audience as the Evidence Summary and Concept Drafts panels.
- **Secondary: admin** — **read-only mirror at most** (the endpoint is `requireAuth('owner','admin')`). Admin never gains a write/confirm path here, because none exists for anyone.
- **No other role.** Managers, F&B/events directors, chefs, employees do not see interpreted candidates (gated by the endpoint's `owner`/`admin` roles).

---

## 2. Where the UI lives

### 2.1 Recommendation — a sibling read-only panel inside `OwnerAIHome`, directly after `EvidenceSummaryPanel`
Mount a new **`InterpretedCandidatesPanel`** in [OwnerAIHome.jsx](../../src/features/owner-intelligence/OwnerAIHome.jsx) directly **after** the existing `<EvidenceSummaryPanel />` (mounted at [OwnerAIHome.jsx:439](../../src/features/owner-intelligence/OwnerAIHome.jsx#L439), itself a sibling of `<ConceptDraftsPanel />` at [OwnerAIHome.jsx:436](../../src/features/owner-intelligence/OwnerAIHome.jsx#L436)). Same Palette B (Editorial Light), same collapsible `<details>` posture, **collapsed by default** — and ordered *below* the Evidence Summary, reinforcing the Memory → Summary → Interpretation reading order.

| Option | Verdict | Reasoning |
|---|---|---|
| **A. New `InterpretedCandidatesPanel` sibling of `EvidenceSummaryPanel` in `OwnerAIHome`** | **RECOMMENDED** | Reuses the proven Slice 2 host, palette, framing pattern, and collapse-by-default restraint. Keeps drafts → evidence → interpretation in one owner-home reading order. Low nav weight; trivially distinct from any DNA surface. |
| **B. A new tab/section inside `EvidenceSummaryPanel`** | **Rejected for v1** | Conflates "plain observations about saves" (Memory mirror) with "HESTIA's interpretation of them" (Intelligence). Different tiers of the doctrine; keep them as siblings, never nested, so the Memory/Intelligence boundary stays legible. |
| **C. New top-level nav page** | **Deferred** | Heavier than the need; fragments the chat-first owner home. Revisit only if interpretation becomes first-class. |
| **D. Venue Intelligence / Venue DNA sub-tab** | **Rejected (doctrine)** | Dangerous adjacency: placing an *interpretation candidate* beside live *Venue Intelligence / DNA* invites the exact conflation the doctrine forbids (EAE §13). Never here. |

### 2.2 Registration
- **No `PageRenderer` / `navigationConfig` change** is needed for Option A — the panel renders inside `OwnerAIHome`, which is already a registered page. A top-level page (Option C) is explicitly *not* this slice. (Strong justification would be required to change nav; none exists.)
- New file: `src/features/owner-intelligence/InterpretedCandidatesPanel.jsx`. One import + one `<InterpretedCandidatesPanel />` mount line in `OwnerAIHome.jsx`. Nothing else in the app graph changes.

---

## 3. Exact data contract (from the existing endpoint — do not extend)

**Source of truth:** `GET /api/discovery-interpreted-candidates` — [server.js:6633](../../server.js#L6633), backed by `deriveInterpretedCandidatesForVenue(db, req.venueId)` in [discoveryCandidateReviewService.js](../../src/services/venueIntelligence/discoveryCandidateReviewService.js). Roles: `requireAuth('owner','admin')`. Read-only; venue-scoped; `record_space = 'concept_draft'` only.

**Fetch (reuse the existing client):** `apiGet('/api/discovery-interpreted-candidates')` from [src/services/api/client.js](../../src/services/api/client.js) — the same `apiGet` the Evidence Summary panel uses ([EvidenceSummaryPanel.jsx:18](../../src/features/owner-intelligence/EvidenceSummaryPanel.jsx#L18)). No new client method, no new headers (venue + auth already applied by `apiRequest`).

### 3.1 Response envelope
```jsonc
{
  "ok": true,
  "candidates": [ /* see §3.2 — may be empty */ ],
  "note": "Interpreted candidates are evidence-bound signals only. They are not confirmed Venue DNA. HESTIA cannot self-confirm its own interpretation; contradictions and missing data are preserved, never resolved here.",
  "limitations": [ /* see §3.3 — render all, verbatim, non-removably */ ]
}
```
On error the route returns HTTP 400 `{ "error": "<message>" }` — surfaced as the **error state** (§4.5).

### 3.2 `candidates[]` shape (render every field exactly as typed; invent none)
```jsonc
{
  "candidate_id": "uuid",                  // EPHEMERAL per-pass id — NOT a stable handle, NOT a concept,
                                           //   NOT a confirmation ref. Use only as a React key; never displayed as meaning.
  "venue_id": "…",                         // ACCESS BOUNDARY only — never rendered as the subject/claim.
  "source_record_space": "concept_draft",  // always this literal; reinforces "concept-draft", never "live venue".
  "concept_ref": "uuid",                   // opaque thread token; NEVER decode meaning from the id; NEVER a venue name.
  "candidate_type": "contradiction_signal | missing_data_signal",  // current reality: ONLY these two.
  "interpretation_title": "…",             // short, hedged; render verbatim. Never an identity assertion.
  "interpretation_summary": "…",           // "evidence suggests … may …"; render verbatim.
  "supporting_evidence_refs": [            // non-empty for every candidate; each points at a REAL saved review row.
    { "review_id": "…", "concept_ref": "…", "conversation_ref": "… | null",
      "review_action": "captured | edited | held | rejected",
      "snapshot_signal": "… | null", "confidence_band": "low | medium | high | null",
      "created_at": "… | null" }
  ],
  "conflicting_evidence_refs": [ /* same ref shape; PRESENT always, may be empty; render when non-empty */ ],
  "missing_evidence": [ "…", "…" ],        // explicit gaps in plain words; render all as a list.
  "confidence_band": "low | null",         // current reality: low or null only. null → "not captured".
  "uncertainty_notes": [ "…", "…" ],       // why this is not settled; render all.
  "suggested_owner_question": "…?",        // routes interpretation back to the human; DISPLAY ONLY (no answer input this slice).
  "destination_hint": null,                // INERT in current reality. If ever non-null, render as attention-only, never a target/write.
  "created_from_summary_version": "derived-live@<iso>",  // provenance; may show as a small "as of" timestamp.
  "status": "contradicted | insufficient_evidence | needs_owner_clarification"  // (proposed is allowed by the contract but not emitted today)
}
```

### 3.3 `limitations[]` (render ALL, verbatim, non-removably)
The endpoint forwards the service's standing disclaimers:
```jsonc
[
  "Interpretation only — not confirmed Venue DNA.",
  "A candidate is HESTIA's evidence-bound suspicion, never a settled fact about the venue.",
  "Confidence is shown only as a word band — never a number, scale, or meter.",
  "Within one concept, saved reviews are a single thread — not independent corroboration.",
  "Contradictions are preserved side by side, never averaged or resolved by HESTIA.",
  "Only a human may ever confirm Venue DNA — HESTIA proposes, it never self-confirms."
]
```

### 3.4 Contract rules the UI must obey
- **Render only what the endpoint returns.** No client-side derivation, re-aggregation, re-scoring, percentage, ratio, count-toward-DNA, or re-classification. Strings are shown verbatim; lists are shown as lists.
- **`candidate_type` is closed at two values today.** Render a human label only for `contradiction_signal` and `missing_data_signal` (§4.3). If an unknown type ever arrives, render it neutrally as "Interpreted candidate" with the raw type shown as an opaque tag — never invent a themed label, never hide it.
- **`confidence_band` is `low` or `null`.** `null` renders "not captured" — never default to `low`, never invent a band, never up-render to medium/high. Label it "evidence strength (word band)", never "overall confidence", never a meter.
- **`destination_hint` is inert.** It is `null` today; the UI renders nothing for it. If a future service ever returns a value, it must read "owner attention only — not Venue DNA" and remain non-interactive — never a button, route, or write.
- **`concept_ref` and `candidate_id` are opaque.** Wayfinding may use a short id fragment as an explicit disambiguator (e.g. last 6 chars, labelled as an id fragment); it must never decode meaning from the UUID and never synthesize a venue name.
- **`note` and `limitations` are non-removable.** They render on every populated and empty state.
- **No second fetch.** This view never calls `/api/discovery-evidence-summary`, `/api/discovery-concept-drafts`, `/api/discovery-reviews`, or any row-level / DNA route. One endpoint, one read.

---

## 4. Allowed read-only UI states (exactly four)

The panel is a pure function of one fetch. It has exactly these states; no other state may write, mutate, or branch into a decision flow.

### 4.1 Loading
- Trigger: fetch in flight (initial expand, or an explicit owner-initiated retry).
- Render: a quiet "Reading HESTIA's interpreted candidates…" line in Palette B. No skeleton implying data exists; no spinner that reads as "processing/confirming".
- Forbidden: any copy implying scoring, verification, ranking, or DNA work is underway.

### 4.2 Empty (zero candidates)
- Trigger: `ok: true` with `candidates.length === 0` (the endpoint's honest base shape — a venue whose reviewed evidence has produced no contradiction or missing-data signal yet).
- Render: a calm explainer (§5.5) — interpreted candidates appear **only** when reviewed evidence creates a contradiction or a missing-data signal; until then there is nothing to interpret. Plus the persistent framing (§5.1), the `note`, and the `limitations`.
- Forbidden: fabricated sample candidates; any "fake insight"; a "get started → confirm your DNA" CTA; any nudge toward a confirmation/promotion action.

### 4.3 Populated
- Trigger: `ok: true` with `candidates.length > 0`.
- Render (read-only, in this priority):
  1. **Persistent framing** (§5.1) — the non-removable "interpreted candidates only / not confirmed Venue DNA / HESTIA cannot self-confirm" line, always first.
  2. **A candidate card per `candidates[]` entry**, in the endpoint's order (no client re-rank that implies priority). Each card renders, in order:
     - a **neutral type badge** — "Contradiction found" for `contradiction_signal`, "Missing evidence" for `missing_data_signal` (§5.4). Badge is neutral/textual, never green/success, never a meter.
     - a **status chip** — humane label for `status` (§5.4): `contradicted` → "Contradiction — unresolved"; `insufficient_evidence` → "Not enough evidence yet"; `needs_owner_clarification` → "Needs owner clarification".
     - `interpretation_title` (verbatim) and `interpretation_summary` (verbatim).
     - **Evidence strength** — `confidence_band` as a word with the caption "evidence strength — not certainty, not confirmation"; `null` → "not captured". Never a meter/percentage.
     - **Supporting evidence** — a count + a plain list of `supporting_evidence_refs` (each shown via `review_action` human label + `snapshot_signal` when present + `confidence_band` word + `created_at` date + a short `conversation_ref`/id fragment as an opaque disambiguator). Labelled "supporting saved reviews", never "corroboration", never "independent evidence".
     - **Conflicting evidence** — when `conflicting_evidence_refs` is non-empty, a clearly separated, equally-weighted list (same ref rendering) under "Conflicting saved reviews — preserved, not resolved". Never collapsed, hidden, or styled as lower-priority than the supporting side.
     - **Missing evidence** — every `missing_evidence` string as a plain bullet list under "What's missing / why this isn't settled".
     - **Uncertainty notes** — every `uncertainty_notes` string as a plain list.
     - **Suggested owner question** — `suggested_owner_question` rendered verbatim as *text*, prefaced "HESTIA would ask:" — **display only; no answer input, no submit** (the clarification write loop is a future slice).
     - **Provenance** — optional small "as of {created_from_summary_version timestamp}" caption.
  3. **`limitations`** — all lines, verbatim, at the foot.
- Forbidden: contradictions presented as resolved or averaged; any candidate presented as a verdict or as identity; any "ready to confirm / promote / approve" affordance; any client-computed score/percentage/ranking.

### 4.4 (Within populated) — per-field "not captured" / "none"
- A candidate with `confidence_band === null` renders "not captured" (never `low`). An empty `conflicting_evidence_refs` simply omits the conflicting section (no "no conflicts found" claim that implies resolution). A `null` `snapshot_signal` / `conversation_ref` renders as omitted, never fabricated.

### 4.5 Error
- Trigger: fetch rejects (network) or HTTP 400 `{ error }`.
- Render: a calm, reassuring line (§5.6) — "HESTIA could not load your interpreted candidates right now. **Nothing was changed.**" Offer a single read-only **Retry** that re-issues the same GET. No partial/garbled data shown.
- Forbidden: surfacing raw error internals as if they were evidence; implying any write was attempted or rolled back (none was — it is a read).

---

## 5. Exact wording / guardrail copy (binding)

These strings are the truth boundary. They are **non-removable** and must appear as specified. They reuse the EAE §12 approved phrasing and the Slice 2 framing pattern.

### 5.1 Always-present, non-removable framing (top of panel, every non-loading state)
> **Interpreted candidates — read-only signals, not confirmed Venue DNA.** These are HESTIA's
> evidence-bound *suspicions* about what your saved reviews may mean. Evidence suggests; it does not
> prove. Contradictions and missing data are preserved here, never resolved. HESTIA cannot confirm any
> of this on its own — only a human ever confirms Venue DNA, and there is no confirmation action in
> this view.

### 5.2 The endpoint `note` (render verbatim, never suppress)
> Interpreted candidates are evidence-bound signals only. They are not confirmed Venue DNA. HESTIA
> cannot self-confirm its own interpretation; contradictions and missing data are preserved, never
> resolved here.

### 5.3 The endpoint `limitations` (render all, verbatim, at the foot)
> - Interpretation only — not confirmed Venue DNA.
> - A candidate is HESTIA's evidence-bound suspicion, never a settled fact about the venue.
> - Confidence is shown only as a word band — never a number, scale, or meter.
> - Within one concept, saved reviews are a single thread — not independent corroboration.
> - Contradictions are preserved side by side, never averaged or resolved by HESTIA.
> - Only a human may ever confirm Venue DNA — HESTIA proposes, it never self-confirms.

### 5.4 Type / status / field labels (mandatory where they appear)
- `candidate_type === 'contradiction_signal'`: badge **"Contradiction found"**.
- `candidate_type === 'missing_data_signal'`: badge **"Missing evidence"**.
- `status === 'contradicted'`: chip **"Contradiction — unresolved"**.
- `status === 'insufficient_evidence'`: chip **"Not enough evidence yet"**.
- `status === 'needs_owner_clarification'`: chip **"Needs owner clarification"**.
- `confidence_band`: caption **"Evidence strength (word band) — not certainty, not confirmation."** `null` → **"not captured"**.
- `supporting_evidence_refs`: heading **"Supporting saved reviews"** (never "corroboration" / "independent evidence").
- `conflicting_evidence_refs`: heading **"Conflicting saved reviews — preserved, not resolved."**
- `suggested_owner_question`: prefix **"HESTIA would ask:"** (text only, no input).
- `destination_hint` (only if ever non-null): caption **"Owner attention only — not Venue DNA."**

### 5.5 Empty-state line
> No interpreted candidates yet. HESTIA only raises a candidate when your reviewed evidence creates a
> contradiction (you kept and rejected meanings for one concept) or a missing-data signal (a kept
> meaning that can't yet be corroborated). Until then, there is nothing to interpret here — and nothing
> here is Venue DNA.

### 5.6 Error-state line
> HESTIA could not load your interpreted candidates right now. Nothing was changed. [Retry]

---

## 6. Labels — allowed vs forbidden

### 6.1 Allowed
- "Interpreted candidate" / "Possible signal".
- "Evidence suggests …" / "… may …".
- "Needs owner clarification".
- "Contradiction found" / "Contradiction — unresolved".
- "Missing evidence" / "Not enough evidence yet".
- "Not confirmed Venue DNA" (the standing negative disclaimer).
- "Evidence-bound" / "Read-only".
- Plain `review_action` words (`captured / edited / held / rejected`) with their human labels.
- The **word band** (`low`; `null` → "not captured") shown as evidence strength, never a number.
- **Dates** from `created_at` / `created_from_summary_version`, formatted for humans.
- A short `concept_ref` / `conversation_ref` fragment as an explicit, opaque id disambiguator.

### 6.2 Forbidden
- ❌ "confirmed" (except inside the negative "not confirmed Venue DNA"), "approved", "canonical", "promoted", "verified", "DNA-ready", "official", "final identity".
- ❌ "truth" / "proven" / "the venue is…" stated as fact; any phrasing that asserts identity.
- ❌ "HESTIA knows" / "HESTIA has determined".
- ❌ Any **percentage / score / readiness meter / "X% to DNA" / progress bar / confidence meter**.
- ❌ A **synthesized venue name**, or any implication a concept is a real, named, or live venue.
- ❌ Any **decoding of meaning from the `concept_ref` / `candidate_id` UUID**.
- ❌ "corroborated" / "independent evidence" framing for the supporting refs (the service explicitly does not assert independence — EAE §6; the `limitations` say so).
- ❌ "overall confidence" for `confidence_band` (it is evidence strength, not an aggregate certainty).
- ❌ Any **celebratory** affordance (success green, checkmark-as-confirmed, confetti, "done").
- ❌ Any **control** that reads as a decision: confirm, approve, promote, "send to DNA", "make official", edit, or an **answer input** for `suggested_owner_question`.

---

## 7. Visual hierarchy (calm, premium, secondary)

- **Palette B (Editorial Light)** only — match the host `OwnerAIHome` and the sibling `EvidenceSummaryPanel` exactly; never mix palettes. Reuse the same neutral tokens already defined in the sibling panel (card / inset / subtle+emphasis borders / burgundy / amber / text scale) so the surface reads as one family.
- **Collapsed by default** via the same `<details>` posture as the sibling panels, and ordered **below** the Evidence Summary — clearly secondary, never the page's centre of gravity.
- **Textual caution over chrome.** Convey strength and state with **words and counts**, not graphics. Specifically forbidden: dashboard-style confidence meters, progress bars, score cards, gauges, donut/percent rings, and green "success/confirmed" styling. A neutral text badge/chip (no fill that signals success) is the only decoration, and only when backed by an actual API field (`candidate_type`, `status`).
- **Contradictions get equal visual weight** to supporting evidence — never minimized, never collapsed by default within an expanded card. Missing-evidence and uncertainty lists are always visible in the expanded card, not behind a further toggle.
- **No ranking styling.** Cards render in endpoint order with uniform weight; nothing implies one candidate is "stronger" or "closer to DNA".

---

## 8. Interaction rules (read-only)

This slice is strictly read-only. The only interactive elements permitted:
- **Expand / collapse** the panel and (optionally) individual candidate cards.
- **Retry** — re-issues the same `GET /api/discovery-interpreted-candidates` after an error. Nothing else.

Explicitly **forbidden** controls: approve button, confirm button, promote button, edit button, "send to DNA" / "make official", any answer/submit input for the owner question, and any write/mutation call (`apiPost`/`apiPut`/`apiPatch`/`apiDelete` or any `fetch` with a non-GET method) — none may exist on this surface, for any role.

---

## 9. Read / write boundaries

| Concern | Boundary |
|---|---|
| **Writes** | **None.** The panel issues exactly one HTTP method: `GET /api/discovery-interpreted-candidates`. No POST/PUT/PATCH/DELETE, ever, from this surface. |
| **Endpoints touched** | Exactly one (the Slice 3C candidates route). No row-level routes, no concept-draft routes, no evidence-summary route, no DNA routes. |
| **Roles** | Owner-facing; admin read-only mirror (inherited from `requireAuth('owner','admin')`). No role gains a write/confirm path here. |
| **Venue scope** | Inherited from the endpoint (`req.venueId`, `record_space='concept_draft'`). The client adds no venue logic and never sends a venue id in the body. |
| **State** | Local React state only (fetched candidates, loading/error flags). No `localStorage`, no global store mutation, no persistence. |
| **DNA contact** | None. The component imports nothing DNA-related; it never references `mergeVenueDna`, `venue_dna_json`, `venue_intelligence`, `venue_briefs`, or `venue_dna_enrichment`. |
| **Classification** | None on the client. The component never re-derives, re-groups, or re-classifies candidates; it renders the two server types as-is and adds no themed type. |

---

## 10. Explicitly OUT OF SCOPE (this slice does not do)

- **No implementation** — this is a design document; it ships no component, no code.
- **No endpoint change** — consumes only the shipped Slice 3C route; adds/changes no route, param, or field.
- **No service change** — `deriveInterpretedCandidatesForVenue` and the service file are untouched.
- **No schema / migration** — no DDL, no column, no table.
- **No persistence / registry** — no new table, no client registry, no `localStorage`, no caching layer.
- **No confirmation flow** — no confirm / approve / accept-as-DNA control of any kind.
- **No promotion flow** — no candidate-to-DNA promotion, by any route or button.
- **No owner-clarification write loop** — the `suggested_owner_question` is *displayed*; answering it (capturing new owner Memory) is EAE Slice 4A/4B, separately designed.
- **No `mergeVenueDna`** — not called, not imported, not referenced.
- **No Venue DNA mutation** — no write to any canonical DNA store; opening/viewing the panel writes nothing.
- **No AI call** — the panel calls no model; it renders deterministic endpoint output.
- **No fake / demo / sample data** — empty means empty; never seed illustrative candidates or insights.
- **No client-side inference / scoring** — no readiness, truth score, independence claim, ranking, decay, percentage, or confidence *increase*; the endpoint's `confidence_band` (low/null) is rendered as-is.
- **No themed classification expansion** — only `contradiction_signal` and `missing_data_signal` are rendered; no positioning/service-style/etc. type is introduced client-side.
- **No nav / PageRenderer change** — it mounts inside `OwnerAIHome` (Option A).
- **No new vocabulary** — no `confirmed`/`approved`/`promoted`/`canonical`/`verified`/`DNA-ready` string enters the codebase via this slice.

---

## 11. QA / verification checklist (for the FUTURE implementation — defined, not run here)

When this is built, the following must hold. Several are **assert-by-absence** (the Slice 1/2 test idiom).

**No writes / no mutation**
- [ ] The component's only network call is `GET /api/discovery-interpreted-candidates`. Grep the file: no `apiPost`/`apiPut`/`apiPatch`/`apiDelete`, no `fetch(...{method:!GET})`.
- [ ] Exercising every state (loading/empty/populated/error, including Retry) creates **zero** `discovery_candidate_reviews` and **zero** `discovery_candidate_review_events` rows.
- [ ] No `localStorage` / `sessionStorage` write; no global store mutation.

**No DNA / no confirmation / no promotion**
- [ ] The file imports nothing DNA-related; greps for `mergeVenueDna`, `venue_dna_json`, `venue_intelligence`, `venue_briefs`, `venue_dna_enrichment` → no matches.
- [ ] No `confirm` / `approve` / `promote` / `confirmation_ref` token in the component (control names or copy), except the negative phrase "not confirmed Venue DNA".
- [ ] No control element (button/link/toggle/input) routes anywhere or triggers any decision/write; the only interactive elements are expand/collapse and Retry (a re-GET). No input bound to `suggested_owner_question`.

**No schema / no registry / no reclassification**
- [ ] No DDL, no migration, no new table/column anywhere in the diff.
- [ ] No client-side persistence layer; no client re-grouping, re-scoring, or re-classification of candidates.
- [ ] Only `contradiction_signal` and `missing_data_signal` are given human labels; an unknown type renders neutrally without a fabricated themed label.

**Copy / truthfulness (copy-audit test)**
- [ ] The endpoint `note` and all `limitations` render verbatim and are non-removable.
- [ ] The §5.1 persistent framing renders in every non-loading state.
- [ ] Forbidden words (§6.2) do not appear: `verified`, `approved`, `confirmed` (except inside "not confirmed Venue DNA"), `canonical`, `promoted`, `DNA-ready`, `truth`, "HESTIA knows", "final identity"; no `%` / score / readiness meter / progress bar.
- [ ] `confidence_band` always carries the evidence-strength caption and never renders as a meter; `null` → "not captured".
- [ ] `conflicting_evidence_refs` (when present) are shown with equal weight; `missing_evidence` and `uncertainty_notes` are always visible in an expanded card.
- [ ] `suggested_owner_question` is text only, prefixed "HESTIA would ask:", with no answer/submit affordance.

**Behavioral correctness**
- [ ] Empty state shows when `candidates.length === 0`; no fabricated candidates or insights.
- [ ] Populated state renders only endpoint-provided strings/bands/dates; no client-computed percentage, ratio, or rank.
- [ ] A `null` `confidence_band` renders "not captured" (never `low`); a missing `snapshot_signal`/`conversation_ref` is omitted, never fabricated.
- [ ] Candidates render in endpoint order (no client re-rank implying priority).
- [ ] Error state shows the reassuring "Nothing was changed." line and a working read-only Retry; no partial data.
- [ ] `destination_hint` (inert null today) renders nothing; if ever non-null, it is non-interactive and labelled "owner attention only — not Venue DNA".

**Scope / regression**
- [ ] Owner and admin can load it; no other role reaches it (endpoint role gate unchanged).
- [ ] The Slice 3B service test, Slice 3C route test, and the Slice 1/2 service/route tests stay green, unchanged.
- [ ] `npm run build` and `npm run hestia:check` green.

---

## 12. Recommended implementation slice + future slices (after this design is approved)

- **Slice 3D-B — implement the read-only `InterpretedCandidatesPanel`.** A new `src/features/owner-intelligence/InterpretedCandidatesPanel.jsx` (Palette B, collapsible, collapsed by default) that issues one `apiGet('/api/discovery-interpreted-candidates')`, renders the four states of §4 with the §5 mandatory copy, §6 label rules, §7 visual restraint, and §8 interaction limits, mounted as a sibling after `<EvidenceSummaryPanel />` in `OwnerAIHome`. **Zero new endpoints, zero new tables, zero writers, zero DNA contact, zero new vocabulary.** Covered by the §11 checklist.
- **Slice 4A — owner clarification loop (DESIGN-ONLY, NOT NOW).** Design how an owner *answers* a candidate's `suggested_owner_question`. The answer is **new owner Memory**, captured like a fidelity review — it does **not** confirm DNA. Design phase writes nothing.
- **Slice 4B — owner clarification endpoint / write model (IF APPROVED LATER).** Only if 4A is approved: a guarded, audited write that stores the owner's clarification as Memory (never DNA), with its own guardrail doc. Not authorized here.
- **Later only — human-approved promotion (DESIGN-ONLY, FAR FUTURE).** The single path that may ever write canonical Venue DNA, strictly behind explicit owner confirmation, audit-first, admin permanently excluded. Must not be approached until candidates, their UI, and the clarification loop and their guardrail docs all exist. Not designed here.

---

*End of design / spec. No code, schema, tables, migrations, routes, services, prompts, UI, or
localStorage were changed in producing this document. No endpoint was added or modified — this slice
consumes the existing read-only `GET /api/discovery-interpreted-candidates`. No Venue DNA was read for
mutation or mutated; `mergeVenueDna` was not called; no confirmation, promotion, registry, owner-
clarification write loop, AI call, or new candidate type was introduced. The Interpreted Intelligence
Candidate is the AI ceiling — this UI displays it as an evidence-bound, read-only suspicion, captured
from Memory, never confirmed Venue DNA, and never self-confirmed by HESTIA.*
