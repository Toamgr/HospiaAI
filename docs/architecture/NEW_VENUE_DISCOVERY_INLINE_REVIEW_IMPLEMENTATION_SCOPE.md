# New Venue Discovery — Inline Candidate Review Surface (Implementation Scope)

> **Status: IMPLEMENTATION SCOPE — DOCS-ONLY. No code, schema, persistence, routes, prompts, UI, or Venue DNA mutation in this document.** This is the implementation-scoping step that follows the candidate review design.
> Created: 2026-06-25. Founder-approved decisions baked in (see §3, §4, §8).
> Governing design: [NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md](./NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md) (Decision Gate §12, First Implementation Boundary §15).
> Governing doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md](./VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md).
> Source code grounded in: `src/services/venueIntelligence/ownerCorrectionLoopFormat.js`, `server.js` (Owner Correction Loop turn, ~line 6336), `src/features/owner-intelligence/OwnerAIHome.jsx`.

---

## 1. Objective

Render the 5-field candidate signals already present in an Owner Correction Loop reply as an interactive, **fidelity-level** triage surface inline beneath the assistant message, with **reversible, local-only** actions and **zero persistence / zero DNA mutation.**

This delivers the design's "Allowed in the first implementation" slice (design §15) and nothing beyond it.

---

## 2. Current code reality (what exists today)

- The Owner Correction Loop reply is a **plain text string**. `ensureStructuredCandidateSignals()` in `ownerCorrectionLoopFormat.js` deterministically rewrites the "Candidate Venue DNA signals" bucket into canonical 5-field lines (`- Signal: …; Evidence: …; Confidence: …; Status: …; Suggested destination: …`) at the Owner Correction Loop turn in `server.js` (~line 6344).
- That string lands in `vi.messages` and renders as raw text inside `MessageBubble` (`whitespace-pre-wrap`) in `OwnerAIHome.jsx`. **No structured parsing happens client-side yet** — the five fields are present in the text but invisible to the UI as structure.
- The deterministic read primitives already exist server-side in `ownerCorrectionLoopFormat.js`: `locateCandidateSection`, `readField`, `normalizeConfidence`, `normalizeStatus`, `normalizeDestination` (currently exported under `__testing`). The five field labels and the valid value sets (`VALID_CONFIDENCE`, `VALID_STATUS`, `VALID_DESTINATION`) live there too.

So the inline review surface is a **read → render → locally-act** layer over the assistant message. It does not change how the reply is produced.

---

## 3. Decision 1 — Shared pure parser (no duplication)

**Decision: extract a shared, dependency-free pure module.**

Extract only the **read / parse / normalize** helpers needed by both server and client into a shared module. This prevents drift between `ownerCorrectionLoopFormat.js` (which writes the structure) and the future client parser (which reads it).

Hard constraints on the shared module:
- **Dependency-free.** It must NOT import: any DB, `server.js`, server-only modules, React, routes, auth, `localStorage`, `window`, `document`, or any browser API.
- **Pure and stateless.** No I/O, no side effects, no fabrication of signals or evidence (same honesty contract as today's `ownerCorrectionLoopFormat.js`).
- It contains only: the field-label constants, the valid value sets, `escapeRegExp`, `readField`, `normalizeConfidence`, `normalizeStatus`, `normalizeDestination`, and `locateCandidateSection`.
- `ownerCorrectionLoopFormat.js` is refactored to **import** these from the shared module instead of defining them locally. Its public contract (`ensureStructuredCandidateSignals`, `candidateSignalsAreStructured`) and output text are **unchanged** — this is a pure internal extraction, behavior-preserving, covered by the existing `scripts/test-owner-correction-loop-format.js`.

> Note: the shared-module extraction is a refactor of existing code, not new behavior. It is part of the *future implementation slice*, not this doc. It is scoped here, not performed here.

---

## 4. Decision 2 — Ephemeral state, honest about it

**Decision: local-only, refresh-discarded review state is accepted for the first slice — and the UI must say so.**

- Review state (per-candidate status / edits / chosen destination) lives in the review panel's `useState`, keyed by message index + candidate index.
- It is **not** persisted, **not** sent to any route, **not** lifted into `useVenueIntelligence`. A refresh discards it.
- The UI must carry a **visible honesty note**, e.g.:

  > *"Review choices are local in this first version and are not saved yet."*

- This note is in addition to the mandatory epistemic framing line ("captured, not confirmed") from design §4.1. Both are required and non-removable.

---

## 5. Files

### New files (2)

**1. `src/services/venueIntelligence/candidateSignalRead.js`** (or equivalent shared location) — the shared pure read/parse/normalize module from §3. Dependency-free. Imported by both `ownerCorrectionLoopFormat.js` (server) and the client parser below.

**2. `src/features/owner-intelligence/CandidateReviewPanel.jsx`** — presentation + local interaction.
- Props: parsed `candidates` only; no cross-domain props, no hooks.
- Renders the **mandatory framing line** ("captured, not confirmed", design §4.1) — non-removable.
- Renders the **local-not-saved honesty note** (§4) — non-removable.
- Per-candidate card: Signal (headline), Evidence (verbatim, including the conservative `DEFAULT_EVIDENCE` default — never dressed up as real evidence), Confidence as a coarse band + tooltip (coverage, not certainty), Status, Suggested destination as a changeable chip.
- Grouped by destination, foundation-first; confidence descending within group (design §4.3).
- Actions per card: **accept-as-captured · edit (Signal/Evidence; confidence *down* only) · reject · hold · re-route** — all reversible (design §5).
- Provenance stamp `owner_conversation` / `owner_edit` visible on every card.
- Palette A (operational dark), per `skills/user/hestia-ui-design/SKILL.md` (to be read before writing the component).

A thin client parser (`parseCandidateSignals(messageContent)`) may live alongside the panel or as a small file in the same feature folder; it composes the shared §3 primitives and returns `{ candidates: [...] } | null`. Returns `null` when no candidate bucket exists (the common case), so the panel renders nothing for ordinary messages.

### Touched file (1)

**`src/features/owner-intelligence/OwnerAIHome.jsx`** — minimal.
- In the `messages.map` render, for `role === 'model'` messages only, call `parseCandidateSignals(m.content)`; when non-null, render `<CandidateReviewPanel candidates={…} />` directly under that `MessageBubble`.
- No change to `MessageBubble` itself, no change to the hook, no change to the message text.

---

## 6. State model — ephemeral, component-local only

- All review state is held in `CandidateReviewPanel` via `useState`, keyed by message index + candidate index.
- Not persisted, not routed, not lifted. Refresh discards it (§4).
- Editing rules enforced in-component: confidence may only move **down** the band; Signal/Evidence edits stamp provenance `owner_edit`; no edit can produce a confirmation-flavored status.

---

## 7. Test posture (for the future slice)

- The shared-module extraction (§3) must keep `scripts/test-owner-correction-loop-format.js` green with no changes to expected output (behavior-preserving refactor).
- A new pure-parser test should assert: real loop replies parse to the right 5 fields; ordinary replies parse to `null`; the conservative `DEFAULT_EVIDENCE` survives verbatim; confidence/status/destination normalization matches the server's.
- `npm run build` and `npm run hestia:check` must pass with no new FAILs.

---

## 8. Implementation Boundary

**Allowed (first slice):**
- Read existing assistant message text.
- Parse structured candidate signals from that text using the shared pure module.
- Render an inline review panel beneath the assistant message.
- Local-only, reversible actions (accept-as-captured / edit / reject / hold / re-route).

**Not allowed:**
- Persistence of any kind.
- DB migration or new tables.
- New routes or services.
- Canonical Venue DNA writes (`mergeVenueDna`, `venue_dna_json`, `venue_briefs`, `venue_dna_enrichment`).
- `confirmed` status by any path.
- 9D confirmation flow.
- Candidate → DNA promotion.
- A second Venue DNA writer.
- Any change to `venueIntelligenceIntent.js` exploration gating or the `ownerCorrectionLoopFormat.js` output contract.
- Exposure to non-owner roles.

**Required honesty:**
- "Captured, not confirmed" framing line is always present (design §4.1).
- "Review choices are local in this first version and are not saved yet" note is always present (§4).
- Conservative default evidence shown verbatim; no fabricated evidence, confidence, or destinations.

**Risk:**
- The UI must never imply that accepting a candidate means it is confirmed Venue DNA. Approval here is **fidelity** (HESTIA captured what the owner meant), never **identity confirmation**. Any label, color, icon, or copy that reads as "this is now true DNA" is a defect.

---

## 9. What this document explicitly does NOT do

- No code, no component, no parser, no shared-module extraction performed here.
- No persistence, DB, routes, prompts, or UI implementation.
- No `mergeVenueDna`; no write to any canonical Venue DNA store.
- No `confirmed` status, no 9D, no promotion, no second writer.
- No change to existing runtime behavior of any kind.

---

*End of implementation scope. No code changed. The Owner Correction Loop output contract is unchanged; no Venue DNA was read for mutation or mutated.*
