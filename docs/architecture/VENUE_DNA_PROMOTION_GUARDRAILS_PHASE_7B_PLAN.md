# Venue DNA Promotion Guardrails — Phase 7B Plan & Decision Gate

> **Status: PLAN / DECISION GATE (docs-only). No code changed.** The highest-sensitivity analysis in the program — it concerns the only path that could write canonical Venue DNA.
> Created: 2026-06-18.
> Governing doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md), [SPECIALIST_INTELLIGENCE_PATTERN.md](./SPECIALIST_INTELLIGENCE_PATTERN.md). Inputs: [VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md](./VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md) §8, [FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md](./FNB_TO_VENUE_INTELLIGENCE_CANDIDATE_FOUNDATION.md), [FNB_DECISION_LEDGER_FOUNDATION.md](./FNB_DECISION_LEDGER_FOUNDATION.md).

---

## 1. Executive Summary

"Promotion" = letting a candidate signal **mutate canonical Venue DNA** (`venue_intelligence.venue_dna_json`). It is dangerous because Venue DNA is the venue's institutional identity and the input every specialist reasons from; a wrong or untraceable mutation corrupts the whole system, and — as this analysis proves — **cannot currently be undone**.

Inspecting the real `mergeVenueDna` implementation surfaces **three decisive blockers** that make promotion unsafe today:
1. **Irreversible confidence.** `mergeVenueDna` confidence is **monotonic** (`Math.max(prior, incoming)`) with a **floor of 40**. The only safe DNA writer can *raise* confidence but **never lower it**. A bad promotion's confidence effect has **no reversal path**.
2. **No provenance separation.** `venue_dna_json` stores plain string arrays + integer confidence with **no per-signal provenance**. A promoted F&B signal becomes **indistinguishable from owner-stated founder intent** the moment it merges — untraceable contamination.
3. **No snapshot/history.** `venue_intelligence` holds only the current DNA (overwritten each turn). There is **no DNA history/audit table** → **no rollback target**.

Additionally, `mergeVenueDna`'s array merge is **replace-by-key** (not append), so any promotion payload touching an array would **overwrite** the owner's existing signals for that key unless the caller perfectly reconstructs the full array — fragile and high-risk.

**Conclusion (Decision Gate §15): DEFER promotion. Keep candidates as reviewed signals (Phase 7A).** Promotion cannot be made safe until snapshot/audit, per-signal provenance, a reversible/corrective confidence model, and an owner-confirmation workflow exist. None do today.

## 2. Current Protected DNA Writer

The canonical Venue DNA mutation path (the **only** one):
- **Route:** `POST /api/venue-intelligence/message`, `requireAuth('owner')` (owner-only). Also `POST /api/venue-intelligence/reset` (owner) clears it.
- **Function:** `mergeVenueDna(prior, incoming)` (server.js ~5733) → `UPDATE venue_intelligence SET ... venue_dna_json = ?` (server.js ~5825). Input `incoming` comes from the venue-learning LLM turn (`askVenueIntelligence`).
- **`mergeVenueDna` behavior (verified):**
  - **Arrays** (`hospitalityStyle, businessTypeSignals, guestExperienceSignals, beverageSignals, foodSignals, serviceSignals, trainingSignals, operationalPainPoints, ownerPriorities, emotionalDrivers, growthOpportunities, openQuestions`): if `incoming[key]` is an array, it is cleaned, de-duped, capped at 8, and **REPLACES** `base[key]`. (Not append.)
  - **Confidence** (`identity, operations, guest, training, commercial`, 0–100): **monotonic** — `base[dim] = max(prior, incoming)`. Never decreases.
  - **Floors:** any dimension with real signal is floored to **40** (never lowers a higher score; never fabricates).
  - **summary:** replaced if a string is provided.
  - **Provenance:** **none** — values carry no source attribution.
- **What makes it safe today:** a single writer; owner-only; the LLM proposes a *complete* DNA object each turn from the actual conversation; monotonic+floored confidence prevents thin turns from erasing understanding; no fabrication.
- **What must not be bypassed:** the owner-only gate; the single-writer property; the "complete object from real conversation" contract. **Do not add a second writer**, and **do not** feed `mergeVenueDna` partial array payloads that would silently overwrite owner signals.

## 3. Candidate Layer Reality

- **Schema** (`venue_intelligence_candidates`, isolated): `id`, `venue_id`, `source_domain` (`'fnb'`), `source_decision_id`, `candidate_type`, `candidate_summary`, compact JSON (`candidate_payload_json`, `evidence_json`, `provenance_json`, `confidence_json`), `status` (`candidate`/`superseded`/`archived`), `human_review_status` (`unreviewed`/`reviewed`/`accepted`/`rejected`/`needs_changes`), `reviewed_by`, `reviewed_at`, `review_note`, `created_at`/`updated_at`.
- **Current candidate types (derived):** only `taste_direction_signal`, `operational_constraint_signal` — from **explicit `cocktail_rejected` reasons only**. Generation/selection derive nothing. Confidence is **`low`** (single event); `medium` only on corroboration; **never `high`**.
- **How created:** Phase 6B, flag-gated (`ENABLE_FNB_VENUE_FEEDBACK_CANDIDATES`, default off), non-blocking, deduped, from real rejections only.
- **How reviewed:** Phase 7A, owner/admin-only PATCH sets `human_review_status` + audit fields.
- **Why `accepted` ≠ confirmed:** acceptance marks a *useful signal*; it does not change `status` (`candidate`), does not touch Venue DNA, and the underlying evidence is still typically a single low-confidence rejection. Acceptance is triage, not truth.

## 4. Promotion Definition

**Promotion** = a deliberate, owner-gated action that takes a reviewed candidate and **mutates canonical Venue DNA**. It is distinct from everything built so far:
- **Review** ≠ promotion (a human looked at it).
- **Acceptance** ≠ promotion (a human marked it a useful signal).
- **Promotion** = a **Venue DNA write** (`venue_dna_json`), which today only the owner conversation performs.

If it ever exists, promotion **must**: be **owner-gated** (at minimum), be **fully auditable** (who/what/when/before/after), and be **reversible or compensatable**. As §11 shows, the last requirement is currently **unmet**, which by itself forces deferral.

## 5. Evidence Thresholds (for any future promotion)

- **A single low-confidence F&B rejection may NEVER be promoted.** (Today, that is essentially all candidates.)
- **A generated menu may NEVER be promoted** (no candidate is even derived from it; it is circular evidence).
- **A selected cocktail may NEVER be promoted alone** (acceptance is too weak; no candidate derived in 6A).
- **Explicit owner confirmation is the strongest** signal and is **required** for promotion.
- **Repeated, corroborated candidates** (`medium`) may become *eligible for owner review*, but still require explicit owner approval — corroboration alone never auto-promotes.
- **Guest preference** requires **guest evidence** (not staff rejections).
- **Pricing truth** requires **verified sales/POS** (estimates are never financial truth; POS not integrated).
- **Venue identity** requires **broad, multi-source evidence** — never F&B-only, never a cocktail decision.

## 6. Candidate Type Eligibility

| candidate_type | Future eligibility | Rationale |
|---|---|---|
| `taste_direction_signal` | **Reserved** (not now) | Only loosely maps to `beverageSignals`; current evidence is single low-confidence; needs corroboration + provenance layer + safe mapping |
| `operational_constraint_signal` | **Reserved** (not now) | Maps to `operationalPainPoints` but array-replace + monotonic `operations` confidence make it unsafe to apply/reverse today |
| `guest_preference_signal` | **Never** (from F&B) | A staff rejection is not guest behavior; requires guest evidence |
| `menu_positioning_signal` | **Reserved** | Needs strong, multi-decision evidence |
| `pricing_sensitivity_signal` | **Never** (from estimates) | Requires verified sales/POS |
| `preparation_capacity_signal` | **Reserved** | Operational; needs corroboration; not derived yet |
| `service_complexity_signal` | **Reserved** | Same as above |
| `venue_identity_signal` | **Never** (from F&B) | Doctrine forbids inferring broad identity from a cocktail/menu decision |

**Net:** **no candidate type is eligible for promotion now.** Two are *reservable* for a future, properly-instrumented phase; the rest are never-from-F&B or reserved.

## 7. Candidate → Venue DNA Mapping

`venue_dna_json` shape (`emptyVenueDna`): 12 string-array signal groups + `confidence{identity,operations,guest,training,commercial}` + `summary` + `openQuestions`. There is **no taste/beverage-taste field**, no operational-capacity field, no per-signal provenance.

| Source candidate | Plausible DNA target | Required evidence | Confidence cap | Overwrite risk | Reversal |
|---|---|---|---|---|---|
| `taste_direction_signal` | `beverageSignals[]` (string) | corroborated + owner-confirmed | must not raise any confidence dim (no clean dim maps to "taste") | **High** — array merge **replaces** `beverageSignals`; would clobber owner-stated beverage signals unless full array reconstructed | **None** (no snapshot; monotonic confidence) |
| `operational_constraint_signal` | `operationalPainPoints[]` (string) | corroborated + owner-confirmed | `operations` confidence is monotonic+floored → can't be lowered later | **High** — same array-replace clobber risk | **None** |

**The mapping is unclear and unsafe:** there is no DNA field that cleanly represents a decimal/taste signal; applying to an array risks overwriting founder signals; and there is no confidence dimension that maps without triggering irreversible monotonic behavior. **Per the rule "if mapping is unclear, promotion must be deferred" → promotion must be deferred.**

## 8. Merge Path Options

**Option A — call `mergeVenueDna` directly with an owner-confirmed payload.**
- *Pros:* reuses the single disciplined writer.
- *Cons:* the caller must read current DNA, additively reconstruct the full target array (array-replace semantics), and avoid raising confidence; still no provenance, no snapshot, no reversal; risks becoming a second *caller* of the protected path with subtly wrong payloads.
- *Breakage risk:* High. *Doctrine fit:* Poor (no provenance/reversal). *Complexity:* Deceptively high.

**Option B — a separate promotion service that internally delegates to `mergeVenueDna`.**
- *Pros:* centralizes promotion logic + audit; single delegation point.
- *Cons:* does **not** solve the core problems (array-replace clobber, monotonic/irreversible confidence, no provenance, no snapshot). Adds surface without safety.
- *Breakage risk:* High. *Doctrine fit:* Poor until preconditions exist. *Complexity:* High.

**Option C — do NOT promote; keep candidates as reviewed intelligence signals (Phase 7A).**
- *Pros:* zero risk to canonical DNA; candidates remain useful (triage, future analysis, future owner-confirmation input); preserves the single-writer invariant; fully reversible (review status is reversible).
- *Cons:* candidates don't (yet) sharpen Venue DNA automatically — acceptable, because the safe channel for DNA change remains the owner conversation.
- *Breakage risk:* None. *Doctrine fit:* Strong. *Complexity:* None (already shipped in 7A).

**Recommendation: Option C — defer promotion.** A/B cannot be made safe without the §9/§11 infrastructure.

## 9. Audit Trail Requirements (hard precondition for any promotion)

Before promotion can exist, a **new audit + snapshot mechanism** is mandatory. A new table (e.g. `venue_dna_promotion_audit`) recording, per promotion:
- `candidate_id`, `venue_id`, `promoted_by`, `promoted_at`,
- **previous Venue DNA snapshot (full JSON or content hash)**,
- **proposed delta** and **applied delta**,
- `evidence_used` (candidate evidence + corroboration),
- `confidence_before` / `confidence_after`,
- `review_note`, **explicit owner confirmation** record,
- `rollback_note` / reversal reference.

**Decision: YES — a new audit table AND a DNA snapshot are required before any promotion.** They do not exist today. (Phase 7A's candidate review fields are not sufficient: they audit *review*, not *DNA mutation*.)

## 10. Role and Authority Model

- **Review:** owner/admin (Phase 7A: read = `CI_ROLES`, review-write = owner/admin).
- **Accept as signal:** owner/admin (Phase 7A).
- **Promote (future):** **owner only.** Admin is a *technical* role; rewriting venue identity is an *ownership* decision. Admin-alone promotion is **not** recommended.
- **Never promote:** manager, bar_manager, fb_director, events_manager, employee.
- **Dual confirmation:** recommended for promotion (e.g., explicit `confirm: true` + a typed acknowledgement, or owner + a second owner/admin), given irreversibility. At minimum, an explicit owner confirmation token distinct from a normal click.
- **Why managers must not promote:** prevents day-to-day F&B staff from silently reshaping founder/owner intent — a core doctrine guardrail.

## 11. Reversal / Correction Strategy (the deciding section)

**Reversal is not currently possible.** Specifically:
- **Monotonic confidence:** `mergeVenueDna` only ever raises confidence (`max(prior, incoming)`) and floors signal dims to 40. If a promotion raised `operations`/etc., **no subsequent `mergeVenueDna` call can lower it.** Correcting it would require a **raw write that bypasses `mergeVenueDna`** — i.e., a *second, unsafe DNA writer*, which is explicitly forbidden.
- **No snapshot:** there is no stored prior DNA to restore to.
- **Array clobber:** a promotion that replaced an array could have dropped owner-stated signals with no record to restore them.
- **Deleting the candidate does nothing** — the DNA mutation already happened and is not linked to anything reversible.

**Therefore reversal is unsafe → promotion must be deferred** until: (a) DNA snapshots/history exist (restore target), and (b) a sanctioned correction path exists that either restores a snapshot or lowers confidence *without* a raw second writer (e.g., an explicit corrective mode of `mergeVenueDna`, designed and reviewed separately).

## 12. API Plan If Promotion Is Later Approved (plan only — do NOT implement)

Only after §9 (audit+snapshot) and §11 (reversal) preconditions are met:
- **Endpoint:** `POST /api/venue-intelligence/candidates/:candidateId/promote`.
- **Auth:** **owner only** (+ dual-confirmation token).
- **Request body:** `{ confirm: true, confirmation_token, note }` (no free-form DNA — the server derives the bounded delta from the candidate + mapping).
- **Validation:** candidate exists + venue-scoped; `human_review_status === 'accepted'`; type eligible (§6); evidence threshold met (§5; corroborated/owner-confirmed); confidence cap enforced.
- **Audit write FIRST:** snapshot current DNA + record proposed delta + owner confirmation (so the audit exists even if the merge fails).
- **Merge:** read current DNA, **additively** reconstruct the single mapped array (preserving all existing entries), apply the **capped** delta, and call `mergeVenueDna` **once** (no raw write). Persist; record applied delta + confidence before/after.
- **Response:** `{ ok, candidate, dna_audit_id }` (no raw DNA dump beyond what's needed).
- **Errors:** 400 (ineligible/threshold/cap), 403 (not owner / bad token), 404 (cross-venue/missing), 409 (already promoted).
- **Cross-venue:** every read/write `req.venueId`-scoped; foreign id → 404.

## 13. Tests Required Before Any Promotion Implementation

- owner-only gating (admin/manager/etc. denied); dual-confirmation enforced.
- **no promotion from one weak/low-confidence candidate**; **no promotion from a generated menu**; **no promotion from a selected cocktail alone**.
- confidence cap enforced; promotion cannot push a dimension beyond the cap.
- candidate status remains traceable (`accepted` → a `promoted` state, reserved — introduced only with promotion).
- **audit row created** with prev snapshot/hash + proposed + applied delta + confidence before/after + owner confirmation.
- **`mergeVenueDna` used (no second raw DNA writer)**; array merge preserves existing owner signals (no clobber).
- **rollback/correction path works** (restore snapshot or sanctioned corrective lower).
- cross-venue denied (404); no UI/prompts/generation/Event/Lab changes.

## 14. Breakage Risks

| Risk | Likelihood (if built now) | Impact | Prevention | Verification | Rollback |
|---|---|---|---|---|---|
| Accidental second DNA writer | High | **Severe** | only `mergeVenueDna`; no raw `UPDATE venue_dna_json` outside it | static guard | revert |
| Weak signal becomes identity truth | High | Severe | thresholds (§5); type eligibility (§6); owner-only + dual confirm | derivation/threshold tests | defer |
| Founder intent overwritten (array clobber) | High | Severe | additive array reconstruction; never pass partial arrays to `mergeVenueDna` | clobber test | **none today** → defer |
| Confidence monotonicity blocks correction | **Certain** | Severe | requires reversible/corrective path that does not exist | n/a | **none today** → defer |
| Audit insufficient | High | Severe | mandatory audit table + snapshot before promotion | audit-row test | defer |
| Role access too broad | Med | Severe | owner-only promote; managers excluded | role tests | tighten |
| Cross-venue leakage | Low | High | `req.venueId` scoping; 404 foreign | isolation test | tighten |
| Acceptance confused with promotion | Med | High | distinct action/endpoint/status; explanation framing | label tests | doc |
| Irreversible bad promotion | **Certain today** | Severe | snapshot + correction path (absent) | n/a | **none** → defer |
| Future UI misrepresenting candidates as DNA | Med | Med | clear status vocabulary; explanation rules | label tests | doc |

## 15. Decision Gate

**DEFER promotion. Keep candidates as reviewed intelligence signals (Phase 7A).**

Promotion is blocked by three currently-unsolvable problems and one unclear mapping:
1. **Irreversibility** — `mergeVenueDna` confidence is monotonic+floored; no corrective path exists without an unsafe second writer.
2. **No provenance** — promoted signals would be indistinguishable from owner-stated founder intent.
3. **No snapshot/audit** — no rollback target and no DNA-mutation audit trail.
4. **Unsafe/unclear mapping** — array-replace semantics risk clobbering owner signals; no DNA field cleanly represents the F&B signals.

Per the program's rules, *any* of (1)–(4) mandates deferral; all four hold.

**Preconditions before promotion may be reconsidered (a separate future track, not Phase 7B):**
- a Venue DNA **snapshot/history + `venue_dna_promotion_audit` table**;
- **per-signal provenance** in Venue DNA (or a parallel "derived signals" layer kept distinct from owner-stated DNA);
- a **reversible/corrective confidence path** (sanctioned, not a raw writer);
- an **owner-confirmation workflow** (dual confirmation);
- **corroborated, non-trivial evidence** (no single low-confidence rejection) and a defined, safe **candidate_type → DNA mapping** with a confidence cap.

## 16. Final Recommendation

**Do not implement candidate → Venue DNA promotion. Defer it.** Phase 7A (review/approval as signals) already delivers the safe, useful capability. Candidates remain isolated, reviewable signals; canonical Venue DNA continues to change **only** through the owner conversation via the single, disciplined `mergeVenueDna` writer.

If/when promotion is revisited, it must be a **separate, owner-gated track** that first builds the snapshot/audit, provenance, and reversal infrastructure above — and only then implements the §12 API behind all §13 tests. Until then, the strong, conservative, doctrine-aligned answer is: **keep candidates as reviewed intelligence; do not promote.**

---

*End of Phase 7B plan. No code, schema, prompts, routes, services, UI, or live behavior were changed in producing this document. No Venue DNA was mutated; `mergeVenueDna` was inspected, not called.*
