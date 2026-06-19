# HESTIA Phase 7B — Venue DNA Promotion Guardrails Audit

> **Status: CANONICAL — Phase 7B decision-gate checkpoint.**
> Created: 2026-06-19.
> Scope: read-only audit of the current implementation and governing doctrine. No application code, schema, routes, tests, or Venue DNA were changed in producing this record.
> Audited HEAD: `9dba5c7` (working tree clean; local `main` matched `origin/main`).
> Governing doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md), [SPECIALIST_INTELLIGENCE_PATTERN.md](./SPECIALIST_INTELLIGENCE_PATTERN.md), [DECISION_LEDGER_DOCTRINE.md](./DECISION_LEDGER_DOCTRINE.md).
> Decision-gate plan inspected: [VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md](./VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md). Foundation: [FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md](./FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md), [VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md](./VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md).

---

## Status

`AUDIT COMPLETE — PROMOTION DEFERRED`

The read-only Phase 7B audit is finished. No candidate-to-Venue-DNA promotion is implemented, and none is implemented as a result of this checkpoint. This document formally records the audit findings and defers promotion.

---

## Executive Decision

HESTIA will **not** implement candidate-to-Venue-DNA promotion at this time. F&B-derived candidates remain **reviewed intelligence signals only**. A candidate — whether unreviewed, reviewed, accepted, rejected, or marked `needs_changes` — does not become Venue DNA, and no F&B feedback signal, AI output, or Decision Ledger entry may automatically mutate Venue DNA. The current Phase 7A review model is retained unchanged. Future promotion is **conditional**, requires safety infrastructure that does not exist today, and **may never be built** unless every precondition in this document is met first.

---

## Why This Matters

Venue DNA (`venue_intelligence.venue_dna_json`) is **identity-level memory**. It is the confidence-calibrated, synthesized model of the venue that every specialist reasons from. A wrong or untraceable mutation does not corrupt one feature — it corrupts the institutional understanding the whole system inherits.

Venue DNA must not be polluted by:

- weak signals (a single low-confidence rejection),
- single decisions (one cocktail rejected, one menu generated, one cocktail selected),
- AI inference presented as fact,
- staff-level action standing in for owner intent.

The cost of a bad promotion is not a bug; it is a silent, possibly irreversible drift of the venue away from its own stated identity. That asymmetry — cheap to corrupt, expensive (today impossible) to undo — is the reason promotion is gated behind explicit, owner-level confirmation and reversal infrastructure.

---

## Current Safe Boundary

The lifecycle that is **implemented and safe** today:

```
F&B feedback → Decision Ledger → Candidate Signal → Human Review → Reviewed Signal
```

The transition that is **explicitly rejected** and does not exist in code:

```
F&B feedback → Candidate → Venue DNA
```

Acceptance is the terminal state of the safe lifecycle. `accepted` means "accepted as a useful signal" — it is triage, not truth, and not a Venue DNA write. The only sanctioned channel for Venue DNA change remains the owner conversation.

---

## Doctrine Constraints

The canonical constraints Phase 7B obeys (from [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) and related doctrine):

1. **Venue DNA is never automatically confirmed** from weak evidence or a single AI output. Confirmation requires corroboration across signals/turns and, for high-impact changes, human approval.
2. **Candidates are provisional evidence, not truth.** A candidate is a proposal awaiting human review.
3. **The protected hierarchy** Venue Memory → Venue Intelligence → Venue DNA must be preserved. Candidates live in the Memory/Intelligence layer; DNA is the protected apex.
4. **Specialists may generate candidates/signals, never confirmed DNA directly.** No specialist writes confirmed Venue DNA.
5. **`mergeVenueDna` is the only sanctioned DNA writer.** A second writer is forbidden. The single-writer, owner-only, "complete object from real conversation" contract must not be bypassed.
6. **Every memory/DNA write must carry** venue boundary, provenance, confidence, evidence label, role access, and (for high-impact changes) human approval.
7. **No automatic Venue DNA mutation** from sales, a single approval, or a single AI output. No cross-venue leakage. No fake DNA.
8. **If the mapping is unclear, defer.** A promotion whose candidate-type → DNA mapping is ambiguous or unsafe must not ship.

---

## Current Implementation Findings

Verified by direct inspection of the code (not from prior summaries):

- F&B feedback candidates are stored in an **isolated** table, `venue_intelligence_candidates`, created idempotently at boot. It has no foreign keys, no triggers, and alters no existing table.
- Candidate **writes are flag-gated** (`ENABLE_FNB_VENUE_FEEDBACK_CANDIDATES` / `FEATURE_FLAGS.fnbVenueFeedbackCandidates`), **default OFF**, non-blocking, and occur at exactly one route: `POST /api/ci/rejections`, after the Decision Ledger write, keyed to a real ledger decision id for dedupe.
- Candidate **review supports** `reviewed`, `accepted`, `rejected`, `needs_changes` (`REVIEW_ACTION_STATUSES`); the creation default is `unreviewed`. There is deliberately **no** `promoted_to_dna` status.
- **Review writes only review fields** — `human_review_status`, `reviewed_by`, `reviewed_at`, `review_note`, `updated_at`. Candidate content (type, payload, evidence, provenance, confidence) is never altered by review.
- **Candidates are venue-scoped** — every query filters on `venue_id`; a foreign id returns 404 / null. No cross-venue read or write is possible.
- **Read routes use CI roles** (`owner`, `manager`, `bar_manager`, `admin`, `fb_director`). The **review PATCH is owner/admin only.**
- **No candidate path writes Venue DNA.** No accepted candidate mutates Venue DNA. No hidden promotion path exists.
- **`mergeVenueDna` remains the single owner-only DNA writer**, reached only from the owner conversation route (`POST /api/venue-intelligence/message`) and cleared only by the owner reset route. It is monotonic (confidence-raising) with deterministic floors and no fabrication.

---

## Candidate Review Model Today

- **Statuses:** `unreviewed` (default) → one of `reviewed`, `accepted`, `rejected`, `needs_changes`. Transitions are reversible (e.g. `accepted ↔ rejected` on re-review). The action set cannot revert to `unreviewed`.
- **`accepted` = useful signal only.** It does not change the candidate's `status` (stays `candidate`), does not touch candidate content, and does not write Venue DNA.
- **Audit fields:** `reviewed_by`, `reviewed_at`, and optional `review_note` are recorded on every review. Review is fully auditable and fully reversible.
- **Confidence is capped** at `medium`; F&B feedback never yields `high`. A single decision is at most `low`.
- **Provenance preserved:** `provenance_json`, `evidence_json`, and `source_decision_id` are never altered by review.

---

## Confirmation: No Venue DNA Mutation Path Exists

Confirmed at three independent levels — code, routes, and tests:

- **No real promotion path exists.** The candidate service and routes contain no function that writes Venue DNA.
- **No `promoted_to_dna` status exists** in any vocabulary, and none can be set via the review action.
- **No candidate route writes `venue_dna_json`.** The only writers of `venue_dna_json` are the owner-only conversation and reset routes.
- **No service writes `venue_intelligence`, `venue_briefs`, or `venue_dna_enrichment`** from the candidate layer.
- **`mergeVenueDna` is defined once and called once**, inside the owner-only message route — the single-writer invariant holds.
- The word **"promotion" appears only in doctrine, planning, and test-guard context** — never as live mutation logic. A static test guard asserts the server source contains no promotion vocabulary.

**Conclusion: the current system does not, and cannot via any existing path, mutate Venue DNA from a candidate, an accepted candidate, an AI output, or a Decision Ledger entry.**

---

## Promotion Blockers

Each blocker independently forces deferral; all hold today.

1. **Monotonic / confidence-raising merge.** `mergeVenueDna` only ever raises confidence (`max(prior, incoming)`) and floors signalled dimensions. A bad promotion's confidence effect **cannot be lowered** through any sanctioned path. *Why it matters:* there is no way to correct an over-confident promotion without an illegal second writer.
2. **No per-signal provenance in Venue DNA.** `venue_dna_json` stores plain string arrays and integer confidence with no source attribution. *Why it matters:* a promoted F&B signal becomes indistinguishable from owner-stated founder intent — untraceable contamination.
3. **No snapshot / history / rollback infrastructure.** `venue_intelligence` holds only the current DNA, overwritten each turn. *Why it matters:* there is no prior state to restore — no rollback target exists.
4. **Array merge could clobber owner-stated signals.** DNA array merge is replace-by-key, not append. *Why it matters:* a promotion payload touching an array could silently drop owner-stated signals unless the full array is perfectly reconstructed.
5. **Candidate-type → DNA mapping is unclear / unsafe.** No DNA field cleanly represents a taste/decimal or operational-capacity signal, and no confidence dimension maps without triggering the irreversible monotonic behavior. *Why it matters:* doctrine requires deferral whenever the mapping is unclear.
6. **Current evidence is weak and often single-event.** Today essentially all candidates are single low-confidence rejections. *Why it matters:* doctrine forbids inferring venue identity — or mutating DNA — from one F&B decision.
7. **Confidence cannot be safely lowered or corrected.** There is no sanctioned corrective path that reduces confidence without a raw second writer. *Why it matters:* reversal is currently impossible, which alone forbids an irreversible operation.

---

## Phase 7B Decision Gate

- **Promotion is deferred.**
- **No promotion endpoint** is added.
- **No promotion table** is added.
- **No automatic mutation** of Venue DNA from candidates, accepted candidates, AI output, or Decision Ledger entries.
- **No specialist-to-DNA write.**
- **No AI-to-DNA write.**

The Phase 7A review model is retained exactly as-is. Candidates remain isolated, reviewable intelligence signals.

---

## Future Promotion Preconditions

Promotion may be **reconsidered** — as a separate, later, owner-gated track, and only if it is ever warranted — once **all** of the following exist:

1. **Venue DNA snapshot / history** (a concrete rollback target).
2. **Per-signal provenance** in Venue DNA (or a parallel "derived signals" layer kept distinct from owner-stated DNA).
3. **An append-only promotion audit ledger** (`venue_dna_promotion_audit`) recording who/what/when, prior snapshot, proposed and applied delta, evidence used, confidence before/after, and owner confirmation.
4. **A sanctioned reversible / corrective confidence path** that lowers or restores confidence without a raw second writer.
5. **A safe, bounded candidate-type → DNA mapping** with a confidence cap (never asserts `high`, never raises a dimension beyond a small bounded delta) and additive array reconstruction (never clobbers owner signals).
6. **An owner-only dual-confirmation workflow** (explicit confirmation token distinct from a normal click).
7. **Tests proving no automatic mutation** — that acceptance, rejection, `needs_changes`, AI output, and Decision Ledger entries never write Venue DNA, and that any future promotion is owner-gated, evidence-thresholded, audited, and reversible.

Meeting these preconditions is **necessary but not sufficient**: even with the infrastructure, promotion remains optional and subject to a future, explicit product decision.

---

## Future Data Model Direction

- **Keep the current `venue_intelligence_candidates` table for now.** It correctly stores candidates as isolated, reviewable signals.
- **Before any DNA mutation from candidates is contemplated**, introduce an **append-only `venue_dna_promotion_audit`** ledger first. It must be written before any merge so the trail exists even if the merge fails, and it must record the prior DNA snapshot (full JSON or content hash), the proposed and applied delta, evidence used, confidence before/after, owner confirmation, and any rollback reference.
- **Do not introduce a direct promotion / DNA-mutation table** until per-signal provenance and DNA snapshot/history exist. A promotion mechanism without provenance and a rollback target is unsafe by construction.

---

## Future API Direction

- **No write endpoint now.** No promotion route is added in Phase 7B.
- **Optional future read-only eligibility endpoint.** A candidate-promotion-eligibility explanation could be considered later. It must be **read-only**, must **explain why a candidate is not promotable** (deterministic doctrine reasons), and must **never write Venue DNA**.
- **Owner-only promotion only in a later phase, if ever implemented.** A `POST /api/venue-intelligence/candidates/:id/promote` endpoint **remains forbidden** until every precondition above exists. If it is ever built, it must be owner-only with dual confirmation, derive a bounded delta server-side (no free-form DNA in the payload), write the audit row first, call `mergeVenueDna` exactly once with additive array reconstruction, and be covered by all tests below.

---

## Test Requirements Before Any Future Promotion

Required before promotion may be implemented (none are required for Phase 7B, which adds nothing):

1. An accepted candidate does **not** mutate Venue DNA (`venue_dna_json` byte-identical before/after).
2. A rejected candidate does **not** mutate Venue DNA.
3. A `needs_changes` candidate does **not** mutate Venue DNA.
4. A non-owner (admin / manager / bar_manager / fb_director / employee) **cannot** approve a canonical promotion.
5. A cross-venue candidate **cannot** be read or promoted (404).
6. Promotion **requires corroborated evidence** — a single low-confidence rejection is rejected.
7. Promotion **requires explicit human / owner confirmation** (dual-confirmation token).
8. Promotion **writes an audit row** with prior snapshot, proposed and applied delta, and confidence before/after.
9. **AI cannot directly write promotion** (no AI call in the promotion path; static guard).
10. Promotion is **explainable** (eligibility / explanation returns deterministic reasons).
11. **Conflicting evidence blocks or lowers** confidence (no silent overwrite).
12. **No writes to forbidden tables** (`venue_intelligence` / `venue_briefs` / `venue_dna_enrichment`) except via the sanctioned owner-approved route; `mergeVenueDna` used once; array merge preserves existing owner signals.
13. A **rollback / correction path** restores the snapshot or applies a sanctioned corrective lowering — no raw second writer.

Existing suites (`test:fnb-feedback`, `test:fb-ledger`, `test:beverage`), `npm run hestia:check`, and `npm run build` must remain green.

---

## Files Audited

- `server.js` — `mergeVenueDna`, owner-only Venue DNA routes, candidate review routes, candidate write point at `POST /api/ci/rejections`, candidate DDL boot.
- `src/services/venueBridge/fnbVenueFeedbackService.js` — candidate derivation, normalization, storage, review function, vocabularies.
- `src/config/featureFlags.js` — candidate write flag resolution.
- `scripts/test-fnb-venue-feedback.js` — promotion-absence and DNA-untouched static guards.
- Doctrine and plan documents listed at the top of this record.

---

## Files That Must Remain Untouched

- `mergeVenueDna` and the owner-only Venue DNA conversation / reset routes in `server.js`.
- `venue_intelligence` / `venue_dna_json`, `venue_briefs`, `venue_dna_enrichment`.
- Cocktail Lab (`geminiCocktailAgent.js`, `cocktailService.js`, `src/features/bar/*`).
- Event Builder (`eventCocktailMenuService.js`, `src/features/events/*`).
- `src/prompts/*`, generation routes and response shapes, UI, POS.
- `.env`, database files, migrations.

The concepts that must remain untouched: the single-writer invariant, the owner-only DNA gate, candidate isolation, and the absence of any candidate-to-DNA path.

---

## Final Decision

**Phase 7B closes as a guardrail checkpoint. Promotion is intentionally deferred.**

Candidate intelligence remains reviewed signal intelligence only. Canonical Venue DNA continues to change exclusively through the owner conversation via the single, disciplined `mergeVenueDna` writer. Promotion will not be implemented unless and until every safety precondition recorded here is met — and even then only by an explicit, separate, owner-gated decision.

---

*End of Phase 7B audit. No application code, schema, routes, tests, prompts, UI, or live behavior were changed in producing this document. No Venue DNA was mutated; `mergeVenueDna` was inspected, not called.*
