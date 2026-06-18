# F&B → Venue Intelligence Feedback — Phase 6 Plan & Guardrail Review

> **Status: PLAN (docs-only). No code changed.** The most guardrail-sensitive phase so far — it approaches Venue DNA.
> Created: 2026-06-18.
> Governing doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [DECISION_LEDGER_DOCTRINE.md](./DECISION_LEDGER_DOCTRINE.md), [SPECIALIST_INTELLIGENCE_PATTERN.md](./SPECIALIST_INTELLIGENCE_PATTERN.md), [FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md](./FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md), [CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md). Foundation: [FNB_DECISION_LEDGER_FOUNDATION.md](./FNB_DECISION_LEDGER_FOUNDATION.md).

---

## 1. Executive Summary

Phase 6 lets HESTIA derive **candidate learning signals** from recorded F&B decisions — provenance-gated, confidence-labeled, venue-scoped, human-reviewable, reversible — so that, over time, real F&B activity can *propose* (never impose) sharper venue understanding.

It is sensitive because it is the first phase to point *toward* Venue DNA. The non-negotiables:
- **Phase 6 creates candidate signals only.** It **does not** confirm Venue DNA, **does not** mutate `venue_intelligence`, **does not** write any confirmed truth.
- It **does not** change generation behavior, prompts, or response shapes.
- It **does not** add UI or POS.
- It **does not** infer broad venue identity from one decision, and **does not** treat weak evidence as truth.

The candidate layer is **isolated** from canonical Venue DNA: a candidate is a proposal awaiting human review, stored separately, with zero write path into `venue_intelligence`.

## 2. Current Data Reality (verified)

**Venue Intelligence storage**
- `venue_intelligence` (PK `venue_id`): `stage`, `objective`, `messages_json`, **`venue_dna_json`** (the canonical, confidence-calibrated Venue DNA), `created_at`, `updated_at`.
- `venue_briefs` (PK `venue_id, brief_type`): derived specialist briefs (`brief_json`, `source_hash`, `confidence`, `status`).
- `venue_dna_enrichment` (PK `venue_id`): `signals_json`, `enrichment_json` — deterministic operational enrichment.

**How Venue DNA is updated (the cardinal fact):** canonical `venue_dna_json` is mutated **only** by the owner conversation — `POST /api/venue-intelligence/message` → `mergeVenueDna(prior, incoming)` → `UPDATE venue_intelligence ... SET venue_dna_json = ?`. `mergeVenueDna` (server.js ~5532) merges arrays (dedup, cap 8), keeps confidence **monotonic**, and applies deterministic **floors** — it does **not** introduce candidates. Enrichment (`deriveDnaEnrichment` + `applyConfidenceDeltas`, via `getOperationalIntelligence`) is applied **transiently** to build briefs (`enrichedDNA` passed to `buildVenueBriefs`) and persisted only to `venue_dna_enrichment` — it is **never** written back into `venue_dna_json`.

**No candidate/review layer exists.** A repo-wide search for `candidate|proposed_dna|dna_candidate|review.*dna` finds **nothing** for Venue Intelligence. The only review field anywhere is `fb_decisions.human_review_status` (the ledger's own field). → **There is no existing safe candidate layer to write into** (see §6 / §15).

**F&B ledger storage** (`fb_decisions`, venue-scoped; service `decisionLedgerService.js`): per [FNB_DECISION_LEDGER_FOUNDATION.md](./FNB_DECISION_LEDGER_FOUNDATION.md). Fields available after Phase 5 for derivation:
- `decision_type` ∈ {`cocktail_menu_generated`, `cocktail_selected`, `cocktail_rejected`}, `source_engine='ci_omer'`, `created_at`, `id`, `venue_id`.
- `decision_payload` — generated: `{flow_type, params}`; rejected: `{reasons, base_spirit}`; selected: `{costing_basis:'estimate', ...}` (estimates).
- `recipe_snapshot` (selected/rejected), `subject_ref` (rejected: `{cocktail_name}`), `related_cocktail_id`/`related_menu_id` (selected).
- `taste_profile_target` (generation, when flag on + resolved), `venue_dna_snapshot` (Bar DNA dims, generation), `evidence`, `provenance`, `explanation_basis`.
- **`taste_profile_result` is never recorded** (Phase 5 deferred decimal output).

**What is NOT available:** guest behavioral data, verified costs, POS/sales, repeated-pattern aggregates (would need querying multiple rows), confirmed taste outcomes.

## 3. Candidate Signal Definition

A **Venue Intelligence feedback candidate** is a *proposal* derived from F&B decisions, never confirmed truth. Proposed shape (shared-envelope-aligned, [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) §6):

```
venue_intelligence_candidate {
  id, venue_id,                       // always venue-scoped
  source_domain = 'fnb',
  source_decision_id,                 // FK → fb_decisions.id
  candidate_type,                     // controlled (§4)
  candidate_summary,                  // short plain text
  candidate_payload_json,             // structured proposal (compact)
  evidence_json,                      // what supports it (decision id, reason, etc.)
  provenance_json,                    // { origin:'specialist_decision', domain:'fnb', route }
  confidence_json,                    // { level:'low'|'medium', basis }  (never 'high' from one event)
  status,                             // 'candidate' (never 'confirmed')
  human_review_status,                // 'unreviewed' | 'accepted' | 'rejected' | 'needs_changes'
  created_at, updated_at
}
```

**A candidate is NOT confirmed Venue DNA.** Acceptance (human) does **not**, in Phase 6, write to `venue_dna_json` (see §9).

## 4. Candidate Types (conservative)

Core insight that drives conservatism: **generation is not new evidence about the venue** — it is HESTIA acting on existing understanding, and (post-Phase-5) its taste target was *derived from* Venue DNA, so deriving a venue signal back from it is **circular**. The real new evidence is **human action**: rejections (strongest, explicit) and selections (weak, acceptance).

| candidate_type | Strong enough evidence | Too weak | Phase 6? | Over-inference risk |
|---|---|---|---|---|
| `taste_direction_signal` | explicit rejection reason about taste (e.g. `too_sweet`, `too_bitter`); or repeated selections/rejections of a clear profile | a single generation; a single selection; injected taste target | **Include** (low confidence; medium only on repetition) | Medium — cap confidence; require explicit reason or repetition |
| `operational_constraint_signal` | explicit operational rejection reason (`too_complex`, prep/equipment) | inferring complexity from a recipe we generated | **Include** (low) | Low–Medium |
| `preparation_capacity_signal` | explicit prep/capacity rejection reason | a generated recipe's apparent complexity | **Reserve** (fold into operational_constraint for now) | Medium |
| `service_complexity_signal` | explicit service-speed rejection reason | recipe length | **Reserve** | Medium |
| `guest_preference_signal` | — (we have **no guest data**; a rejection is staff judgment, not guest behavior) | any single F&B decision | **Reserve** (do not label staff judgment as guest preference) | **High** |
| `menu_positioning_signal` | repeated, consistent selection/rejection pattern across many rows | one menu/selection | **Reserve** | High |
| `pricing_sensitivity_signal` | verified costs + POS (neither exists) | estimated costs | **Exclude** (estimates are not financial truth; no POS) | **High** |
| `venue_identity_signal` | broad, corroborated, owner-confirmed | any F&B decision | **Exclude** (doctrine: never infer broad identity from a cocktail/menu decision) | **Severe** |

**Phase 6 includes only:** `taste_direction_signal` and `operational_constraint_signal`, primarily from **explicit rejection reasons**, with low (single-event) confidence. Everything else is reserved or excluded.

## 5. Evidence Rules

- **One generated menu → weak / not evidence.** Generation acts on existing DNA; post-Phase-5 its taste target *came from* DNA → circular. **Do not** create taste candidates from `cocktail_menu_generated`.
- **One selected cocktail → weak (acceptance only).** May seed a low-confidence `taste_direction_signal` *only* as "this profile was accepted once"; never a confident claim.
- **Repeated selections/rejections → stronger.** Multiple consistent rows of a clear profile may raise confidence to medium. (Aggregation reads the ledger; see §8 — derive-on-read is the safer place for aggregates.)
- **Explicit rejection reason → strongest single-event evidence.** A recorded reason (`too_sweet`, `too_complex`, `off_brand`) is an explicit human signal → low-confidence candidate of the matching type. A rejection **without** an explicit reason → **no candidate**.
- **A generated taste target is NOT guest preference** and not proof of anything about the venue (it is HESTIA's own injected context).
- **Estimated costs are NOT verified financial truth** → never a pricing candidate.
- **POS data is absent** → no commercial candidates.
- **Confidence ceiling:** a single decision can yield at most **low** confidence; **medium** requires corroboration across multiple rows; **high is never assigned by Phase 6**.

## 6. Storage Strategy

Because **no candidate layer exists** and canonical `venue_dna_json` must never be touched, the options:

**Option A — reuse an existing candidate/review table.** ❌ Not viable: none exists. `venue_briefs`/`venue_dna_enrichment` are derived-artifact tables, not proposals; reusing them would conflate confirmed derivations with unreviewed proposals. **Reject.**

**Option B — new dedicated `venue_intelligence_candidates` table (candidate-only, isolated from `venue_intelligence`).**
- *Pros:* clean separation; persists candidates for later human review/aggregation/dedup; matches the shared memory envelope; **zero** write path to canonical DNA; reversible (drop table).
- *Cons:* a new table + pure service; slightly more surface than read-only.
- *Breakage risk:* Low — additive `CREATE TABLE IF NOT EXISTS`, node:sqlite-safe; never touches `venue_intelligence`.
- *Doctrine fit:* **Strong** — candidate ≠ confirmed; provenance/confidence/venue-scope enforced; human review gated.
- *Complexity:* Moderate. *Rollback:* drop table + delete service.

**Option C — store nothing new; derive candidates on-read from `fb_decisions` only (or stash inside `fb_decisions`).**
- *Pros:* zero new storage; lowest risk; fully reversible.
- *Cons:* no persistence/dedup/review state; can't accumulate corroboration cleanly; stuffing candidates into `fb_decisions` conflates *decisions* with *proposals about the venue* (doctrine-muddying).
- *Breakage risk:* Very low. *Doctrine fit:* OK for derive-on-read; poor if stuffed into the ledger. *Complexity:* Low.

**Recommendation: Option B**, with a **conservative rollout**: implement the isolated `venue_intelligence_candidates` table + a pure derivation/record service, write candidates **non-blocking after ledger creation** for the two included types only, and **defer human approval + any promotion-to-DNA** to a later phase. If we want to be maximally cautious first, a **B-minus** variant is acceptable: ship the **pure derivation service + tests now (derive-on-read, no writes)**, and add the table + non-blocking writes in Phase 6b once reviewed. (See §16.)

## 7. Service Design

New pure module: `src/services/venueBridge/fnbVenueFeedbackService.js` — deterministic, no db import for derivation, DI-`db` for any write (mirrors `decisionLedgerService`). No AI, no prompts, no Venue DNA mutation, no Event/Lab imports.

- `deriveFnbVenueCandidatesFromDecision(decision)` → `Candidate[]` (often `[]`). Pure. Applies §4/§5 rules: only `cocktail_rejected` with explicit reasons and (optionally) `cocktail_selected` produce candidates; `cocktail_menu_generated` produces **none**.
- `scoreFnbCandidateEvidence(candidate, context?)` → `{ level:'low'|'medium', basis }`. Single event → `low`; corroboration (if a small recent-rows context is passed) → up to `medium`. Never `high`.
- `normalizeFnbCandidate(candidate, venueId)` → shaped row with provenance/confidence/status defaults (`status:'candidate'`, `human_review_status:'unreviewed'`); preserves nulls; no fake defaults.
- `safeRecordVenueCandidate(db, venueId, candidate, onError)` *(only if Phase 6 writes)* → non-throwing wrapper around the insert; dedup-aware (§8); returns `{ok, id}` / `{ok:false}`.
- `listVenueCandidatesForReview(db, venueId, filters)` *(only if a read surface is needed)* → venue-scoped, compact.

## 8. Write Points

| Option | When | Safe? | Non-blocking | Dedup | Status | DNA mutation |
|---|---|---|---|---|---|---|
| Synchronous inside CI routes | during `/api/ci/*` | **Unsafe-ish** — adds work to the live generation/rejection path | would need try/catch | hard mid-request | n/a | none |
| **Non-blocking after ledger write** (recommended if writing) | right after `safeRecordFbDecision` in `/api/ci/rejections` (and optionally `/api/ci/cocktails`) | **Safe** — additive, wrapped, post-success | `safeRecordVenueCandidate(... onError)` never throws | dedup key `(venue_id, candidate_type, source_decision_id)` + optional `(type, normalized subject)` window | `'candidate'` | **none** |
| Manual via future review endpoint | on demand | Safe | n/a | n/a | n/a | none |
| **Derive-on-read only (no writes)** (most conservative) | when a future review screen asks | **Safest** | n/a | n/a | ephemeral | none |

**Recommendation:** if Phase 6 writes, use **non-blocking after ledger creation** on `cocktail_rejected` (explicit reasons) first; gate behind the **same** `ENABLE_VENUE_BEVERAGE_CONTEXT` flag is *optional* (candidates are not generation context, so a separate behavior is fine, but reusing the flag keeps everything off-by-default). Generation rows write **no** candidate. Dedup by `(venue_id, candidate_type, source_decision_id)` so the same decision never spawns duplicates. **No write path touches `venue_intelligence`.**

## 9. Review / Approval Boundary

- **Who may review:** `CI_ROLES` (owner/manager/bar_manager/admin/fb_director), consistent with F&B decisions. (Confirming Venue DNA, when that later phase exists, should be **owner/admin only**.)
- **What approval does (later phase, not Phase 6):** marks a candidate `human_review_status='accepted'`. **In Phase 6 this is the ceiling — acceptance changes only the candidate's own review status.**
- **What approval does NOT do:** it does **not** write to `venue_dna_json`, does **not** change confidence on canonical DNA, does **not** alter briefs. Promotion of an accepted candidate into Venue DNA is a **separate, later, owner-gated phase** that must route through `mergeVenueDna`'s discipline.
- **Why Phase 6 should not implement approval UI yet:** no UI in scope; and the promotion path (candidate → confirmed DNA) needs its own design + guardrail review. Phase 6 stops at *deriving and storing candidates*.

## 10. Explanation Integration

The Phase 4 explanation service may, optionally and later, mention candidates **with explicit candidate framing**:
- ✅ "This decision could become a venue-learning **candidate** (unreviewed)."
- ❌ Never "HESTIA has **learned** this as Venue DNA" / "the venue's DNA now reflects…".
- Any reference must show `status:'candidate'` + `human_review_status` and the confidence level. Phase 6 need not change the explanation service at all; if it does, only additive, clearly-labeled, and read-only.

## 11. Tests Needed

- `cocktail_menu_generated` → **derives no candidate** (circular/weak).
- `cocktail_selected` → at most a **low**-confidence `taste_direction_signal` (acceptance), or none.
- `cocktail_rejected` **with explicit reason** → a low-confidence candidate of the matching type; **without** a reason → **none**.
- Broad identity is **never** derived (`venue_identity_signal` never produced); pricing never derived from estimates.
- Missing/empty decision → `[]`, no crash, no fabrication.
- No fake defaults; absent fields stay null.
- **No Venue DNA mutation** (service has no `venue_intelligence`/`venue_dna_json`/`mergeVenueDna` write path — static guard).
- Cross-venue isolation; **dedup** prevents duplicate candidates from one decision.
- No AI calls; no prompt changes; no generation changes; no Event/Lab coupling (static guards).
- Confidence ceiling: single event never `high`.
- `test:fb-ledger` and `test:beverage` remain green.

## 12. Breakage Risks

| Risk | Likelihood | Impact | Prevention | Verification | Rollback |
|---|---|---|---|---|---|
| Accidental Venue DNA mutation | Low | **Severe** | service has zero `venue_intelligence`/`venue_dna_json` write; candidates in isolated table only | static guard test; code review | drop table / revert service |
| Over-inference from weak F&B evidence | Med | High | only rejection(explicit)/selection; no generation; confidence ≤ low single-event; identity/pricing excluded | derivation tests per type | tune rules |
| Fake venue facts | Low | High | derive only from recorded fields; no defaults; reasons must be explicit | no-fake-default tests | fix builder |
| Duplicate candidate spam | Med | Med | dedup key `(venue_id, type, source_decision_id)`; one decision → at most one per type | dedup test | add unique index |
| Cross-venue leakage | Low | High | every write/read `venue_id`-scoped from `req.venueId` | isolation test | tighten query |
| Approval-boundary confusion | Med | High | Phase 6 stops at candidate; acceptance ≠ DNA; documented in §9 | doc + test that accept ≠ DNA write | n/a |
| Route latency | Low | Med | non-blocking, post-success; tiny pure derivation | smoke timing | move to derive-on-read |
| Write failure affecting generation | Low | High | `safeRecordVenueCandidate` never throws; post-success placement | throw-safety test | remove call |
| Schema collision with Venue Intelligence tables | Low | High | **new** isolated table name; never alter `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment` | grep/schema check | drop new table |
| Future UI confusion (candidate vs confirmed) | Med | Med | explicit `status`/`human_review_status` labels; explanation framing rules (§10) | label tests | doc |
| Tests giving false confidence | Low | Med | test the *negative* cases (no candidate from generation/weak/empty) explicitly | negative-path tests | strengthen tests |

## 13. Files Likely To Change In Implementation

**Service (new)**
- `src/services/venueBridge/fnbVenueFeedbackService.js` — pure derivation (+ DI-`db` record/list if writing). DDL constant if Option B.

**Server / DB (modified, if writing)**
- `server.js` — add `venue_intelligence_candidates` table init (idempotent `CREATE TABLE IF NOT EXISTS` via the service's DDL); add a **non-blocking** `safeRecordVenueCandidate(...)` call after the `cocktail_rejected` ledger write (and optionally `cocktail_selected`). Optionally a read-only `GET /api/ci/venue-candidates` later. **No change to existing route logic/response shapes; no `venue_intelligence` writes.**

**Tests**
- `scripts/test-fb-decision-ledger.js` (extend) or `scripts/test-fnb-venue-feedback.js` (new) — derivation + dedup + isolation + static guards.

**Docs**
- this plan's implementation note + `FNB_DECISION_LEDGER_FOUNDATION.md` + master-plan completion note.

**Must NOT be touched**
- `venue_intelligence` / `mergeVenueDna` / `venue_briefs` / `venue_dna_enrichment` writers (no DNA mutation).
- Cocktail Lab (`geminiCocktailAgent.js`, `cocktailService.js`, `src/features/bar/*`); Event Builder (`eventCocktailMenuService.js`, `src/features/events/*`).
- `src/prompts/*`; `buildGenerationPrompt`; generation response shapes; integer flavor model; UI; POS.

## 14. Acceptance Criteria ("green" for the implementation phase)

- **Candidate-only**: every produced/stored row is `status:'candidate'`, evidence/provenance/confidence labeled, venue-scoped.
- **No confirmed Venue DNA / no Venue DNA mutation**: zero writes to `venue_intelligence`/`venue_dna_json`; static-guarded.
- Generation rows produce **no** candidate; rejections need an **explicit reason**; confidence never `high` from one event; no identity/pricing candidates.
- If any writes happen, they are **non-blocking** (never affect generation/save/rejection) and **deduplicated**.
- No prompts; no generation behavior change; no UI; no POS; no Event Builder/Cocktail Lab changes; no third engine.
- `test:fb-ledger`, `test:beverage`, `npm run build`, `npm run hestia:check`, `node --check server.js` all pass.

## 15. Stop-and-Alert Conditions

Stop and report before implementing if:
- delivering value would require writing into `venue_intelligence`/`venue_dna_json` (it must not — Phase 6 is isolated candidates only);
- any confirmed-truth write or Venue DNA mutation becomes necessary;
- UI, AI calls, or prompt changes become necessary;
- generation behavior or an existing route response shape must change;
- evidence is too weak to create even a low-confidence candidate safely (then prefer derive-on-read);
- candidate dedup cannot be designed safely;
- role/review boundaries are unclear;
- any Event Builder/Cocktail Lab file must be touched;
- any existing test must be weakened.

> Note: the precondition "existing Venue Intelligence schema has no safe candidate layer" is **already true** — which is exactly why the recommendation creates an **isolated** candidate table and **never** writes to `venue_intelligence`. This is the safe resolution, not a blocker.

## 16. Final Recommendation

**Proceed to Phase 6 implementation, conservatively, via Option B (isolated `venue_intelligence_candidates` table) — candidate-only, no approval/promotion, no Venue DNA mutation.** Scope the first implementation to:
1. a pure `fnbVenueFeedbackService` deriving **only** `taste_direction_signal` + `operational_constraint_signal`, **only** from `cocktail_rejected` rows with **explicit reasons** (and at most a low-confidence acceptance signal from `cocktail_selected`); **no** candidate from generation;
2. an isolated candidate table + **non-blocking** writes after the rejection ledger write, deduped by `(venue_id, type, source_decision_id)`;
3. **defer** human approval, any read UI, and any candidate→DNA promotion to later phases.

If you prefer maximum caution first, adopt the **B-minus** path: ship the **pure derivation service + tests (derive-on-read, no writes)** now, and add the table + non-blocking writes in **Phase 6b** after this derivation logic is reviewed. Either way, **acceptance never writes Venue DNA in Phase 6**, and canonical `venue_intelligence` is never touched.

**Stop-and-alert remains in force** for every condition in §15.

---

*End of Phase 6 plan. No code, schema, prompts, routes, services, UI, or live behavior were changed in producing this document.*
