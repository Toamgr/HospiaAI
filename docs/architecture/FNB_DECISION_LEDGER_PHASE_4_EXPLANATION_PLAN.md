# F&B Decision Ledger — Phase 4 Explanation Service Plan & Risk Review

> **Status: PLAN (docs-only). No code changed.** Pre-implementation plan for the read-only, role-gated on-demand "why?" explanation service.
> Created: 2026-06-18.
> Builds on: [FNB_DECISION_LEDGER_FOUNDATION.md](./FNB_DECISION_LEDGER_FOUNDATION.md) (Phase 2 + Phase 3 §10), [FNB_DECISION_LEDGER_PHASE_3_WIRING_PLAN.md](./FNB_DECISION_LEDGER_PHASE_3_WIRING_PLAN.md).
> Doctrine: [DECISION_LEDGER_DOCTRINE.md](./DECISION_LEDGER_DOCTRINE.md), [FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md](./FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md) (§7 "why?" on demand), [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md).

---

## 1. Executive Summary

Phase 4 adds a **read-only, role-gated** explanation capability that answers "why was this F&B decision made?" **strictly from recorded `fb_decisions` fields** — never from the AI, never from fabricated reasoning. A pure service turns one ledger row into a structured, plain-language explanation (basis, evidence, confidence, assumptions, missing info, future validation), and a thin read endpoint exposes it venue-scoped.

It matters because it delivers the doctrine's core promise — HESTIA can *explain its decisions from real understanding* — while changing **nothing** about generation, prompts, Venue DNA, or any other engine. If a decision lacks recorded basis, the service says so honestly; if confidence is low or absent, it says so; if no row exists, it returns an honest not-found. **No AI is introduced in Phase 4.**

## 2. Current Ledger Reality (what Phase 3 actually records)

Verified from the three write blocks in `server.js`. Fields populated **per decision_type**:

### `cocktail_menu_generated` (`POST /api/ci/generate`)
- **Populated:** `decision_type`, `source_engine='ci_omer'`, `decision_title` (`"CI generation: <flow_type>"`), `decision_payload` (`{flow_type, params:compact}`), `venue_dna_snapshot` (compact Bar-DNA dims — **null if no Bar DNA configured**), `menu_snapshot` (`{count, names, sections}` or `{keys}`), `evidence` (`[venue_dna, taste_dna, omer_brief:active|inactive]`), `provenance` (`{origin, route}`), `confidence` (`{omer:<n>}` **or null** when Omer inactive/no number), `explanation_basis` (`{omer_active, omer_confidence, flow_type}`).
- **Null:** `related_cocktail_id`, `related_menu_id`, `recipe_snapshot`, `subject_ref`, `taste_profile_target`, `venue_dna_hash`, `assumptions`, `missing_fields`, `future_validation_targets`, `decision_summary`.

### `cocktail_selected` (`POST /api/ci/cocktails`)
- **Populated:** `decision_type`, `source_engine`, `related_cocktail_id`, `related_menu_id` (or null), `decision_title` (`"Saved cocktail: <name>"`), `recipe_snapshot` (`{name, base_spirit, method, glass, garnish, ingredients}`), `decision_payload` (estimates **labelled `costing_basis:'estimate'`** — or null), `evidence` (`[costing:estimate]` or null), `provenance` (`{origin, action:'human_save', route}`).
- **Null:** `venue_dna_snapshot`, `confidence`, `explanation_basis`, `menu_snapshot`, `subject_ref`, `taste_profile_target`, `assumptions`, `missing_fields`, `future_validation_targets`, `venue_dna_hash`.

### `cocktail_rejected` (`POST /api/ci/rejections`)
- **Populated:** `decision_type`, `source_engine`, `subject_ref` (`{cocktail_name}`), `decision_title` (`"Rejected: <name>"`), `decision_payload` (`{reasons, base_spirit}`), `recipe_snapshot` (compact profile or null), `evidence` (`[rejection_history]`), `provenance` (`{origin, action:'human_reject', route}`).
- **Null:** `venue_dna_snapshot`, `confidence`, `explanation_basis`, `related_*`, `menu_snapshot`, `taste_profile_target`, `assumptions`, `missing_fields`, `future_validation_targets`, `venue_dna_hash`.

### Reliability summary
- **Reliable for explanation:** `decision_type`, `decision_title`, `provenance`, `evidence`, and the type-specific payloads (`menu_snapshot`/`recipe_snapshot`/`decision_payload`).
- **Reliable only for generation rows:** `explanation_basis` (omer active/confidence + flow_type), `confidence` (`{omer}` and only when active), `venue_dna_snapshot` (Bar DNA dims, when configured).
- **Never populated by Phase 3 (must be reported as "not recorded", never invented):** `assumptions`, `missing_fields`, `future_validation_targets`, `taste_profile_target`, `venue_dna_hash`.
- **Cannot be explained yet:** taste-profile rationale (decimal taste not in the CI path until Phase 5); specific venue_intelligence Venue DNA dimension reasoning (only Bar DNA snapshot + Omer active/confidence is captured); per-ingredient rationale; commercial/sales outcomes (POS not integrated). The service must state these as limits, not fabricate them.

## 3. Proposed Read-Only Endpoint(s)

**Primary:** `GET /api/ci/decisions/:decisionId/explanation`
- **Auth:** `requireAuth(...CI_ROLES)` → `owner, manager, bar_manager, admin, fb_director`. (See §6 for why employees and events_manager are excluded.)
- **Venue scoping:** the route reads the row via `getFbDecisionById(db, req.venueId, decisionId)` — a cross-venue id returns `null` → 404. The pure service never sees other venues' data.
- **Request params:** `decisionId` (path). No body. No query needed for v1.
- **Response (200):** the explanation object (§5).
- **Not-found (404):** `{ ok:false, error:'No decision found for this venue.', can_explain:false }` — honest, no fabrication.
- **Low-confidence / missing-evidence (still 200):** explanation returned with `confidence.level:'low'|'none'` and `warnings`/`explanation_limits` populated; `can_explain:true` but limited.
- **Errors:** 400 if `decisionId` missing/blank; 500 only on unexpected server error (the service itself is pure and should not throw).

**Companion (thin, optional but recommended):** `GET /api/ci/decisions` — venue-scoped list (id, decision_type, decision_title, created_at) via `listFbDecisionsForVenue`, so clients can discover decision IDs to explain. Same auth/scoping. Read-only. *Recommended because without it there is no API path to obtain a `decisionId`.* If we want to keep Phase 4 minimal, this can be deferred — but then explanations are only reachable by IDs obtained out-of-band.

Both endpoints sit beside the existing `/api/ci/*` read routes and follow their conventions.

## 4. Explanation Service Design

**New pure module:** `src/services/venueBridge/decisionExplanationService.js`. No db, no AI, no mutation, no Event/Lab imports — same purity rules as `decisionLedgerService`. It receives an already-fetched, already-venue-scoped ledger row (the route owns the db read) and returns a structured explanation.

Functions:
- `buildFbDecisionExplanation(decision)` → the full response object (§5). Returns an honest `{ can_explain:false, ... }` shape if `decision` is null/empty.
- `summarizeDecisionBasis(decision)` → plain-language `basis` derived from `decision_type` + `decision_title` + type-specific payload + `explanation_basis` (generation only) + `provenance`. For `cocktail_selected`/`cocktail_rejected`, basis honestly reflects a recorded human action ("a team member saved/rejected this") plus whatever payload exists — **not** invented strategic reasoning.
- `summarizeEvidence(decision)` → normalizes `evidence_json` into readable labels (`venue_dna`, `taste_dna`, `omer_brief:active`, `costing:estimate`, `rejection_history`); returns `[]` honestly when none.
- `summarizeConfidence(decision)` → reads `confidence_json`; maps to `{ level:'high'|'medium'|'low'|'none', detail }`; **`none`** when no confidence recorded (most selected/rejected rows). Never fabricates a number.
- `summarizeMissingInformation(decision)` → lists what is NOT recorded for this row (e.g., "no assumptions recorded", "no taste-profile target recorded", "no future validation targets recorded", "no Venue DNA snapshot recorded") so the limits are explicit.
- (internal) a small `composeAnswer(...)` that assembles a useful-but-not-overly-technical paragraph from the above.

## 5. Response Shape

```
{
  ok: true,
  decision_id,
  decision_type,                 // cocktail_menu_generated | cocktail_selected | cocktail_rejected
  title,                         // from decision_title
  summary,                       // short, from decision_summary or derived
  answer,                        // plain-language "why", assembled ONLY from recorded fields
  basis: {                       // structured, from summarizeDecisionBasis
    provenance,                  // e.g. { origin, route, action }
    drivers,                     // e.g. flow_type, bar-DNA dims used, reasons (rejected), recipe (selected)
    venue_context: {             // generation only; honest nulls otherwise
      omer_active, omer_confidence, bar_dna_dimensions
    }
  },
  evidence,                      // [] or labelled sources
  confidence: { level, detail }, // level: high|medium|low|none
  assumptions,                   // [] (Phase 3 records none → honest empty)
  missing_information,           // explicit list of what is not recorded
  future_validation_targets,     // [] / null (none recorded yet)
  warnings,                      // e.g. "costing figures are estimates, not verified"
  can_explain,                   // true if any real basis exists; false for not-found/empty
  explanation_limits             // e.g. "taste-profile rationale not recorded until Phase 5"
}
```

The `answer` is owner-readable: it states what was decided, the recorded reason(s), the evidence and its confidence, and — plainly — what is *not* known. It avoids decimal/technical dumps and internal model jargon.

## 6. Role Access and Safety

- **Allowed:** `owner, manager, bar_manager, admin, fb_director` (`CI_ROLES`) — the same roles that create these decisions.
- **Employees: excluded.** Explanations expose internal reasoning, provenance, and **cost estimates** (`costing_basis:'estimate'`) that are not employee-facing. Employees see published menus, not decision memory.
- **events_manager: excluded.** These are bar/restaurant F&B decisions; the events flow has its own surfaces. (If event-cocktail decisions later enter the ledger, revisit.)
- **Venue scoping is non-negotiable:** the route fetches by `req.venueId`; a decision id from another venue resolves to `null` → 404. The pure service is never handed cross-venue data.
- **No write path:** read-only; the service cannot mutate anything; the route performs only `SELECT`.

## 7. Tests Needed

Extend `scripts/test-fb-decision-ledger.js` (or add `scripts/test-fb-decision-explanation.js`; prefer one command). All pure/in-memory — no server boot, no network, no AI.

- Builds a coherent explanation from a `cocktail_menu_generated` row (uses `explanation_basis`, `confidence.omer`, `evidence`, bar-DNA snapshot).
- Builds an explanation from `cocktail_selected` (recipe summary; `warnings` flags cost as estimate; `confidence.level:'none'`).
- Builds an explanation from `cocktail_rejected` (reasons surfaced; honest limited basis).
- **Honest missing-basis:** null/empty decision → `{ can_explain:false }`, no throw, no fabricated reasoning.
- **Low/none confidence** → `confidence.level` correct; warning present; never invents a number.
- **Null fields do not crash** (every optional null handled).
- **assumptions / future_validation_targets always reported as empty/none** (never invented).
- **Cross-venue isolation** (route-level: fetch by other venue → 404; service never receives it).
- **Role-gated route** (static guard: `requireAuth(...CI_ROLES)`, no employee/events_manager).
- **No AI calls / no fetch** in the service (static grep).
- **No Venue DNA mutation / no Event Builder / Cocktail Lab imports** (static grep).
- **No generation changes** (server diff additive; existing CI route response shapes unchanged).

## 8. Breakage Risks

| Risk | Likelihood | Impact | Prevention | Verification | Rollback |
|---|---|---|---|---|---|
| Too-technical owner-facing reasoning | Med | Med | plain-language `answer`; technical detail only in structured fields; no decimal dumps | review sample outputs; test on each type | tune composer |
| Fabricating missing logic | Med | High | strict "recorded-fields-only" rule; `missing_information`/`explanation_limits` instead of invention | tests assert empty→honest, never invented | fix composer |
| Cross-venue decision leak | Low | High | route fetch by `req.venueId`; 404 on mismatch; service never gets other venues' rows | isolation test | tighten query |
| Relying on fields Phase 3 doesn't populate | Med | Med | §2 field map; treat `assumptions`/`missing_fields`/`validation_targets`/`taste_target` as always-absent | null-handling tests | adjust mapping |
| Accidental generation behavior change | Low | High | Phase 4 only adds read routes + pure service; no generation files touched | server diff additive; CI route shapes unchanged | revert route |
| Premature AI/prompt dependency | Low | High | **no AI in Phase 4**; deterministic composition only | grep no askGemini/fetch | n/a |
| Response shape instability | Med | Med | fixed shape (§5); all fields always present (honest nulls) | shape test across all types + not-found | version later |
| Role access mistake | Low | High | `requireAuth(...CI_ROLES)`; employees/events_manager excluded by design | route guard test | fix guard |
| Leaking cost estimates to employees | Low | Med | employees excluded; `warnings` labels estimates | role guard test | restrict |

## 9. Files Likely To Change In Phase 4

**Service files (new)**
- `src/services/venueBridge/decisionExplanationService.js` — pure explanation builder (no db, no AI).

**Route files (modified)**
- `server.js` — add `GET /api/ci/decisions/:decisionId/explanation` (and optional `GET /api/ci/decisions`). Additive only; imports `getFbDecisionById`/`listFbDecisionsForVenue` (already exported) + the new service. No changes to existing routes.

**Test files**
- `scripts/test-fb-decision-explanation.js` (new) **or** extend `scripts/test-fb-decision-ledger.js`. Add `test:fb-explanation` script if a new file.

**Docs**
- `docs/architecture/FNB_DECISION_LEDGER_FOUNDATION.md` (add a Phase 4 note) and the master plan completion note.

**Must NOT be touched**
- `src/services/geminiCocktailAgent.js`, `src/services/cocktailService.js` (Cocktail Lab).
- `src/services/eventCocktailMenuService.js`, `src/features/events/*` (Event Builder).
- `src/prompts/*` (prompts/contracts); `buildGenerationPrompt`/`askGemini`.
- Any Venue DNA writer (`mergeVenueDna`, `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment`).
- The three existing CI write routes' logic/response shapes; any UI; any POS code.

## 10. Acceptance Criteria ("green")

- `GET /api/ci/decisions/:decisionId/explanation` works, venue-scoped, role-gated; returns the §5 shape.
- Honest behavior: not-found → 404 `can_explain:false`; low/absent confidence → labelled; absent fields → reported as missing, never invented.
- **No AI calls; no prompt changes; no generation behavior change; no Venue DNA mutation; no UI; no POS; no Event Builder / Cocktail Lab changes; no third engine.**
- Existing CI route response shapes unchanged (server diff additive).
- `npm run test:fb-ledger` (+ explanation tests), `npm run test:beverage`, `npm run build`, `npm run hestia:check` all pass.

## 11. Final Recommendation

**Proceed to Phase 4 implementation as specified.** It is read-only, deterministic (no AI), additive, venue-scoped, and reversible. Two refinements to confirm at implementation time:
1. **Include the thin `GET /api/ci/decisions` list endpoint** so decision IDs are discoverable via the API (otherwise the explanation endpoint is unreachable in practice). If you prefer to keep Phase 4 to a single endpoint, we ship the explanation route only and obtain IDs out-of-band.
2. **Keep the explanation 100% deterministic.** An AI-phrased explanation is explicitly **out of scope** and would trigger the stop-and-alert rule; if desired later, it is a separate, approved phase that still reads only recorded fields.

**Stop-and-alert remains in force:** if implementation would require AI calls, prompt changes, generation changes, Venue DNA mutation, UI, Event Builder/Cocktail Lab changes, POS data, or any fabricated explanation, stop and report before writing code.

---

*End of Phase 4 plan. No code, routes, prompts, UI, services, or live behavior were changed in producing this document.*
