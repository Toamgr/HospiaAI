# Venue Intelligence Candidate Review — Phase 7 Plan & Guardrail Review

> **Status: PLAN (docs-only). No code changed.** The highest-sensitivity phase so far — it sits one step away from canonical Venue DNA.
> Created: 2026-06-18.
> Governing doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md), [SPECIALIST_INTELLIGENCE_PATTERN.md](./SPECIALIST_INTELLIGENCE_PATTERN.md), [DECISION_LEDGER_DOCTRINE.md](./DECISION_LEDGER_DOCTRINE.md). Foundations: [FNB_TO_VENUE_INTELLIGENCE_FEEDBACK_PHASE_6_PLAN.md](./FNB_TO_VENUE_INTELLIGENCE_FEEDBACK_PHASE_6_PLAN.md), [FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md](./FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md).

---

## 1. Executive Summary

Phase 7 gives humans a way to **review and approve/reject Venue Intelligence candidates** — the F&B-derived feedback signals from Phase 6. It is sensitive because it is the closest the system has come to canonical **Venue DNA**, and a careless design could let weak F&B evidence (a single cocktail rejection) or a manager-level click silently rewrite founder/owner identity.

The plan's stance:
- **Candidates are not truth.** Reviewing or approving a candidate marks it as a *useful learning signal* — it is **not** Venue DNA.
- **Approval ≠ promotion.** Approving a candidate does **not** automatically change `venue_dna_json` unless a *separate, later, owner-gated* promotion phase is explicitly designed and approved.
- **Any future promotion must be owner/admin-gated, evidence-thresholded, traceable, and reversible**, routed through the existing `mergeVenueDna` discipline.

**Strong recommendation (see §8/§17): implement Phase 7A — review/approval status only. Defer candidate→Venue DNA promotion to a later phase.**

## 2. Current Candidate Reality (verified)

`venue_intelligence_candidates` ([fnbVenueFeedbackService.js](../../src/services/venueBridge/fnbVenueFeedbackService.js), created in [server.js](../../server.js)):
- Fields: `id`, `venue_id`, `source_domain` (`'fnb'`), `source_decision_id` (→ `fb_decisions.id`), `candidate_type`, `candidate_summary`, compact JSON (`candidate_payload_json`, `evidence_json`, `provenance_json`, `confidence_json`), `status` (default `'candidate'`), **`human_review_status` (default `'unreviewed'`)**, **`reviewed_by`**, **`reviewed_at`**, `created_at`/`updated_at`. Indexes incl. `(venue_id, human_review_status)`.
- Vocabularies (already defined): `CANDIDATE_STATUSES = ['candidate','superseded','archived']`; `HUMAN_REVIEW_STATUSES = ['unreviewed','accepted','rejected','needs_changes']`; `CONFIDENCE_LEVELS = ['low','medium']` (never `high`).
- **Review fields exist, but there is NO review-update function yet** — the service exports `derive…`, `score…`, `normalize…`, `create…`, `get…ById`, `list…ForVenue`, `safeRecord…`. Nothing mutates an existing candidate's review status. → Phase 7 must add one.
- **Write path (Phase 6B):** `POST /api/ci/rejections` only, flag-gated (`ENABLE_FNB_VENUE_FEEDBACK_CANDIDATES`, default off), non-blocking, deduped by `(venue_id, candidate_type, source_decision_id)`, requires a real ledger decision id.
- **Derivation rules:** only `cocktail_rejected` with explicit mapped reasons → `taste_direction_signal` / `operational_constraint_signal`; generation and selection produce nothing; confidence never `high`.
- **Evidence today:** explicit single-rejection signals (low confidence). **Weak evidence:** any single decision. **Reserved types (never derived yet):** `guest_preference_signal`, `menu_positioning_signal`, `pricing_sensitivity_signal`, `preparation_capacity_signal`, `service_complexity_signal`, `venue_identity_signal`.

→ **The schema can safely record review state already** (no migration needed for status; an optional additive `review_note` column is the only possible addition). Stop-condition "schema cannot safely record review state" is **not** triggered.

## 3. Current Venue DNA Reality (verified)

- `venue_intelligence` (PK `venue_id`): `stage`, `objective`, `messages_json`, **`venue_dna_json`** (canonical Venue DNA), `created_at`, `updated_at`.
- **Only mutation path:** `mergeVenueDna(prior, incoming)` (server.js ~5731) → `UPDATE venue_intelligence ... SET venue_dna_json = ?` inside `POST /api/venue-intelligence/message` (server.js ~5825), `requireAuth('owner')`. Reset path `POST /api/venue-intelligence/reset` (owner). `GET /api/venue-intelligence` (owner). **All Venue DNA routes are owner-only.**
- `mergeVenueDna` discipline: merges array signals (dedup, cap 8), keeps confidence **monotonic** (never regresses on a thin turn), applies deterministic **floors**, fabricates nothing.
- **There is NO existing promotion path** from candidates (or anything else) into `venue_dna_json` — only the owner conversation writes it.
- **Must not be touched in Phase 7:** `mergeVenueDna`, `venue_dna_json`, `venue_briefs`, `venue_dna_enrichment`, and the owner-only conversation routes.

## 4. Review vs Approval vs Promotion (three distinct concepts)

- **Review** — a human has *looked at* the candidate. (`human_review_status: 'unreviewed' → reviewed`-equivalent; records `reviewed_by`/`reviewed_at`.)
- **Approval** — a human *agrees the candidate is a valid/useful learning signal*. It stays an isolated candidate; **it is not Venue DNA.** (`human_review_status: 'accepted'`.)
- **Promotion** — a candidate *influences canonical Venue DNA*. (Writes `venue_dna_json` via `mergeVenueDna`.)

**Phase 7 scope: Review + Approval only.** Promotion is a separate, later, owner-gated phase. **Approving a candidate must not rewrite Venue DNA.** (We reuse the existing `human_review_status` vocabulary; `accepted` = "approved as a learning signal", `needs_changes` = "needs more evidence", `rejected` = "dismissed". No new `promoted` status is introduced in Phase 7 — it is reserved.)

## 5. Role Boundary

| Role | List/read candidates | Review (mark reviewed / needs_changes) | Approve (`accepted`) / Reject | Promote to Venue DNA |
|---|---|---|---|---|
| owner | ✅ | ✅ | ✅ | ❌ (deferred phase; owner-only when it exists) |
| admin | ✅ | ✅ | ✅ | ❌ (deferred) |
| manager | ✅ (read) | optional: `needs_changes` only | ❌ | ❌ |
| bar_manager | ✅ (read) | optional: `needs_changes` only | ❌ | ❌ |
| fb_director | ✅ (read) | optional: `needs_changes` only | ❌ | ❌ |
| employee | ❌ | ❌ | ❌ | ❌ |
| events_manager | ❌ (F&B venue candidates; not the events flow) | ❌ | ❌ | ❌ |

**Recommended conservative default:** **read = `CI_ROLES`** (owner, manager, bar_manager, admin, fb_director — they create the F&B decisions these derive from); **review-write (any status change) = owner/admin only.** This keeps approval authority high and unambiguous, and prevents "manager-level approval silently shaping founder/owner DNA" (especially important once promotion exists). An optional finer split (managers may set only `needs_changes`) is possible but adds complexity — defer unless requested.

**Role risks:** broad read is low-risk (isolated candidates, labeled). The real risk is write authority — keep it owner/admin. Employees/events_manager excluded (internal F&B reasoning; not their surface).

## 6. Candidate Review API Plan

Namespace: **`/api/venue-intelligence/candidates`** (these are Venue Intelligence artifacts). Per-route `requireAuth` (do **not** inherit the owner-only default of the conversation routes for reads).

| Endpoint | Method | Auth | Venue scope | Request | Response | Notes |
|---|---|---|---|---|---|---|
| `/api/venue-intelligence/candidates` | GET | `CI_ROLES` | `listVenueIntelligenceCandidatesForVenue(db, req.venueId, filters)` | query: `candidate_type?`, `human_review_status?`, `status?`, `limit?` | `{ ok, candidates: [...] }` (compact; no oversized JSON if we choose to trim) | read-only |
| `/api/venue-intelligence/candidates/:candidateId` | GET | `CI_ROLES` | `getVenueIntelligenceCandidateById(db, req.venueId, id)` | — | candidate object or **404** | cross-venue → 404 |
| `/api/venue-intelligence/candidates/:candidateId/review` | PATCH | **owner/admin** | scoped update | `{ human_review_status, review_note? }` | updated candidate or **404** | the only write; validates transition (§7) |

- **Error behavior:** 400 on invalid `human_review_status`/transition; 404 if candidate not found for `req.venueId` (no leaked metadata); 403 via `requireAuth` for disallowed roles.
- **Cross-venue:** every query filters on `req.venueId`; a foreign id → 404.
- **Audit fields set on PATCH:** `reviewed_by = req.user...`, `reviewed_at = now`, `human_review_status`, optional `review_note`, `updated_at`.

## 7. Status Transition Contract

**Phase 7 may update `human_review_status` only.** It does **not** change `status` (`candidate`/`superseded`/`archived` stay as Phase 6 set them) and does **not** introduce a `promoted` status.

`human_review_status` transitions (from the existing vocabulary):
```
unreviewed → accepted        (approve as learning signal)
unreviewed → rejected        (dismiss)
unreviewed → needs_changes   (needs more evidence)
needs_changes → accepted | rejected
accepted → rejected          (reversible; re-review)
rejected → accepted          (reversible; re-review)
```
- **Updatable in Phase 7:** `human_review_status` ∈ `{unreviewed, accepted, rejected, needs_changes}` + `reviewed_by`/`reviewed_at`/`review_note`.
- **Reserved (NOT in Phase 7):** any `status` change to a `promoted`-like value, and any field implying Venue DNA influence. Promotion status/fields are reserved for the later promotion phase.
- **Mapping clarity:** `accepted` = approved **as a signal**, **not** promoted to DNA.

## 8. Candidate → Venue DNA Promotion Analysis (the critical section)

**Recommendation: DO NOT implement promotion in Phase 7.** Defer it.

Why promotion is unsafe to implement now:
- **It would touch the protected path.** Promotion must write `venue_dna_json` via `mergeVenueDna` — today only the **owner conversation** does that. Wiring a second writer is a material risk to the system's single, disciplined DNA-mutation path.
- **Evidence is too weak.** Current candidates are single explicit rejections at **low** confidence. Doctrine forbids inferring broad venue identity from one F&B decision; a low-confidence taste/operational signal is not grounds to mutate confirmed DNA.
- **No owner-confirmation workflow exists** that ties a candidate's acceptance to a deliberate owner decision about *which DNA dimension* changes and *how*.
- **The mapping is non-trivial.** `venue_dna_json` is an array-of-signals + per-dimension confidence object. There is no defined, safe mapping from `taste_direction_signal`/`operational_constraint_signal` into specific DNA arrays/confidence without risking overwriting founder/owner intent or breaking `mergeVenueDna`'s monotonic/floored invariants.
- **Reversibility is unproven.** DNA is the system's institutional memory; an irreversible or hard-to-audit overwrite is a severe failure mode.

**What must exist before promotion (a future phase):**
1. An **owner/admin-only** promotion action, distinct from approval.
2. A defined, conservative **candidate_type → DNA field** mapping, with a **confidence cap** (promotion never asserts `high`; never raises a dimension beyond a small, bounded delta).
3. **Evidence thresholds** (e.g., corroborated/`medium` candidates only; never a single low-confidence rejection).
4. A **full audit trail** (who promoted, which candidate, what DNA delta, when) and a **reversal path**.
5. Routing **through `mergeVenueDna`** (never a raw `UPDATE`), preserving monotonic confidence + floors + no-fabrication, and **never** overwriting owner-stated facts.

**Phase 7 implements instead:** review/approval status + audit, leaving an accepted candidate as a clearly-labeled, isolated signal awaiting a future, owner-gated promotion design.

## 9. Evidence Thresholds

- **One rejection is not enough to update Venue DNA** (Phase 7 doesn't update DNA at all; this also governs the future promotion phase).
- **Repeated, corroborated candidate patterns** may justify stronger review (and, later, promotion eligibility) — never a single event.
- **Explicit owner confirmation is the strongest** signal; **manager/bar_manager action is useful but weaker** than owner confirmation (hence write authority = owner/admin).
- **No guest preference** without guest evidence; **no pricing truth** without verified sales/POS; **no venue identity update** from an F&B rejection alone. These remain hard exclusions.

## 10. Audit Trail and Reversibility

- Set on every PATCH: `reviewed_by`, `reviewed_at`, `human_review_status`, and an optional **`review_note`** (recommend adding via idempotent `ALTER TABLE venue_intelligence_candidates ADD COLUMN review_note TEXT` — additive, node:sqlite-safe; the only schema change Phase 7 might need).
- **Reversibility:** review status is freely re-settable (transitions in §7); nothing is destructive. No separate audit table is required for Phase 7 (the row + review fields suffice); a dedicated audit table becomes relevant only when **promotion** exists (to record DNA deltas).
- **Provenance preserved:** the candidate's `provenance_json`/`evidence_json`/`source_decision_id` are never altered by review — only the review fields change.

## 11. Explanation Integration

The Phase 4 "why?" explanation may, optionally, reference a candidate's review state with explicit framing:
- ✅ "This rejection produced a venue-learning **candidate** (status: unreviewed/accepted-as-signal/rejected)."
- ❌ Never "HESTIA updated the venue's DNA" / "the venue now prefers…".
- Must **distinguish an approved signal from confirmed DNA** and show `human_review_status`. Phase 7 need not change the explanation service; if it does, additive + read-only + clearly labeled.

## 12. Tests Needed

- list candidates venue-scoped; filters validated.
- read candidate venue-scoped; cross-venue → null/404.
- review PATCH updates `human_review_status` + `reviewed_by`/`reviewed_at` (+ `review_note`).
- invalid `human_review_status` / invalid transition rejected.
- **role boundary**: read allowed for `CI_ROLES`; review-write allowed only for owner/admin (others 403); employee/events_manager denied.
- cross-venue review → 404 (no foreign mutation).
- **no Venue DNA mutation**: review never writes `venue_intelligence`/`venue_dna_json`; **no `mergeVenueDna` call** anywhere in the new code (static guard).
- approval (`accepted`) does **not** change `venue_dna_json` (assert canonical DNA untouched).
- no AI calls; no prompt changes; no generation behavior change; no Event Builder/Cocktail Lab coupling.
- existing suites (`test:fnb-feedback`, `test:fb-ledger`, `test:beverage`) remain green.

## 13. Breakage Risks

| Risk | Likelihood | Impact | Prevention | Verification | Rollback |
|---|---|---|---|---|---|
| Accidental Venue DNA mutation | Low | **Severe** | Phase 7 has **no** DNA write; review touches only candidate review fields; static guard (no `mergeVenueDna`, no `venue_dna_json` write) | guard tests; code review | revert review route/fn |
| Approval confused with promotion | Med | High | doctrine + naming: `accepted` = signal, not DNA; explanation framing rules (§11); no `promoted` status | label + DNA-untouched tests | clarify docs |
| Role access too broad | Med | High | write = owner/admin only; read = CI_ROLES; employees/events_manager denied | role-boundary tests | tighten `requireAuth` |
| Weak F&B evidence → identity truth | Low (no promotion) | High | no promotion in 7; thresholds in §9; identity types never derived | derivation tests (6A) | n/a |
| Cross-venue candidate leakage | Low | High | every query `req.venueId`-scoped; foreign id → 404 | isolation test | tighten query |
| Irreversible DNA overwrite | Low (no promotion) | Severe | promotion deferred; review is reversible | n/a in 7 | n/a |
| `mergeVenueDna` misuse | Low | Severe | not called/imported by Phase 7 code | static guard | revert |
| UI confusion later | Med | Med | clear status vocabulary + audit fields; explanation labels | doc | doc |
| Audit trail insufficient | Low | Med | `reviewed_by`/`reviewed_at`/`review_note`; reversible transitions | audit-field test | add audit table later (promotion) |
| False confidence | Low | Med | confidence stays ≤ `medium`; review ≠ truth | confidence tests | n/a |

## 14. Files Likely To Change In Implementation (Phase 7A)

**Service (modified)**
- `src/services/venueBridge/fnbVenueFeedbackService.js` — add `markVenueIntelligenceCandidateReviewed(db, venueId, candidateId, { human_review_status, reviewed_by, review_note })` (pure, DI-`db`, venue-scoped, validates transition, sets audit fields). No DNA, no AI, no promotion.

**Server / routes (modified)**
- `server.js` — add `GET /api/venue-intelligence/candidates`, `GET /api/venue-intelligence/candidates/:id`, `PATCH /api/venue-intelligence/candidates/:id/review` (per-route auth per §5/§6). Optional idempotent `ALTER TABLE … ADD COLUMN review_note TEXT`. **No** change to existing routes / response shapes; **no** DNA writes.

**Tests**
- `scripts/test-fnb-venue-feedback.js` (extend) — review function + transitions + role/route static guards. (Route-level role behavior is asserted statically; service behavior unit-tested in-memory.)

**Docs**
- `FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md` (Phase 7A note) + master-plan completion note.

**Must NOT be touched**
- `mergeVenueDna`, `venue_intelligence`/`venue_dna_json`, `venue_briefs`, `venue_dna_enrichment`, and the owner-only conversation routes.
- Cocktail Lab (`geminiCocktailAgent.js`, `cocktailService.js`, `src/features/bar/*`); Event Builder (`eventCocktailMenuService.js`, `src/features/events/*`).
- `src/prompts/*`; generation routes/response shapes; UI; POS.

## 15. Acceptance Criteria ("green" for the safest Phase 7A)

- Candidates can be **listed/read** (venue-scoped, `CI_ROLES`) and **reviewed/approved/rejected as signals** (owner/admin only) with audit fields (`reviewed_by`/`reviewed_at`/optional `review_note`).
- **No Venue DNA mutation**; **no `mergeVenueDna` call**; no writes to `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment`.
- **No promotion** (no `venue_dna_json` influence); `accepted` is a labeled signal only.
- Venue-scoped + role-gated; cross-venue → 404; invalid transitions rejected.
- No prompts, no generation changes, no UI, no POS, no Event Builder/Cocktail Lab changes, no third engine.
- `test:fnb-feedback`, `test:fb-ledger`, `test:beverage`, `npm run build`, `npm run hestia:check`, `node --check server.js` all pass.

## 16. Stop-and-Alert Conditions

Stop and report before implementing if:
- the schema cannot safely record review state (it **can** — fields exist; not triggered);
- approval would require any Venue DNA mutation;
- promotion seems necessary to make the feature useful (it is not — review/approval is independently useful);
- the role boundary is ambiguous (resolved here: read = CI_ROLES, write = owner/admin);
- the audit trail is insufficient (resolved: reviewed_by/at + optional review_note);
- `mergeVenueDna` would need changes;
- weak evidence would become confirmed DNA;
- UI, AI, or prompt changes become necessary;
- generation behavior must change;
- any Event Builder/Cocktail Lab file must be touched;
- any existing test must be weakened.

## 17. Final Recommendation

**Proceed with Phase 7A: review/approval status only — NO promotion.** Implement the three venue-scoped, role-gated candidate review endpoints + a pure `markVenueIntelligenceCandidateReviewed` service function + audit fields, reusing the existing `human_review_status` vocabulary (`accepted` = approved-as-signal). **Do not** implement candidate→Venue DNA promotion; defer it to a later, owner-gated phase that satisfies §8's preconditions (mapping, thresholds, audit, reversibility, `mergeVenueDna` routing).

This delivers real value (humans can triage F&B feedback signals) at near-zero risk, and leaves the single disciplined Venue DNA mutation path (owner conversation) untouched. The stop-and-alert conditions in §16 remain in force.

---

*End of Phase 7 plan. No code, schema, prompts, routes, services, UI, or live behavior were changed in producing this document.*
