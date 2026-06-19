# F&B Director Brief — Foundation (Phase 8G)

**Status:** Complete · read-only · deterministic · venue-scoped
**Service:** `src/services/venueBridge/fnbDirectorBriefService.js`
**Route:** `GET /api/ci/fnb-director-brief`
**Tests:** `scripts/test-fnb-director-brief.js` (`npm run test:fnb-director-brief`)

---

## 1. What this is

A safe, **read-only intelligence brief** that composes existing F&B intelligence
into one compact operational summary for an F&B / Beverage Director (CI roles:
owner, manager, bar_manager, admin, fb_director).

It answers, from real stored data only:

- What is happening in the current F&B / beverage program?
- What does the current menu snapshot show?
- What recent F&B decisions were generated, selected, or rejected?
- What rejection patterns are emerging?
- What candidate learning signals exist, and what is their review status?
- What requires human review?
- What is missing or unknown?
- What should the F&B Director test next?

## 2. What it composes (sources)

It is a *composition* layer — it owns no new table and re-reads nothing directly.
It calls only the **read/list** functions of three existing, already-safe services:

| Source | Function | Contributes |
|---|---|---|
| F&B Menu Intelligence Snapshot | `buildMenuIntelligenceSnapshot(db, venueId, { now })` | `menu_snapshot_summary`, `operational_warnings`, coverage notes |
| F&B Decision Ledger | `listFbDecisionsForVenue(db, venueId, { limit, since })` | `decision_activity` (generated/selected/rejected counts, recent list, rejection patterns) |
| Venue Intelligence Candidates | `listVenueIntelligenceCandidatesForVenue(db, venueId, { limit })` | `candidate_signals` grouped by review status, review backlog |

`buildFbDecisionExplanation` is **not** called per row — the brief stays compact;
per-decision "why?" remains the separate `/api/ci/decisions/:id/explanation` route.

## 3. What it does NOT do

- **Not** an AI feature (no model calls, no prompts, no network — `ai_used:false`).
- **Not** a generation feature (produces no recipes, menus, or drinks).
- **Not** a Venue DNA feature (reads nothing from and writes nothing to Venue DNA).
- **Not** a promotion path (a candidate — even an accepted one — is a reviewable
  learning signal only, never confirmed venue identity, never escalated to DNA).
- **No writes** of any kind (`writes_performed:false`). It never writes to
  `fb_decisions`, `venue_intelligence`, `venue_briefs`, `venue_dna_enrichment`, or
  `venue_intelligence_candidates`. It never calls `mergeVenueDna`.
- **Not** a third cocktail engine; it imports no Cocktail Lab / Event Builder code.

## 4. Honesty rules (enforced + tested)

- **Overall confidence is forced LOW** when: a source failed, there is no active
  menu, the decision sample is tiny (`< 3`), or there are no candidate signals.
  `high` requires a structured menu snapshot plus a healthy decision history
  (`>= 10`). Otherwise `medium`.
- **Rejection patterns require corroboration:** a reason is only a "pattern" when it
  recurs across `>= 2` rejected decisions. A single rejection is reported under
  `anecdotal_rejection_reasons`, never as a pattern.
- **Accepted candidates** are labeled reviewable signals — never confirmed Venue
  DNA or confirmed identity.
- **Recommended next tests** are derived only from real recorded gaps (missing
  taste/pricing/zero-proof fields) and emerging rejection patterns. They never
  invent guest behavior, sales outcomes, or commercial KPIs.
- **Missing data is reported, never fabricated.** `not_enough_data` always lists the
  unavailable commercial classes: POS/sales, guest preferences, inventory, and
  verified margins (pricing on menu items is a stored *estimate*, not verified).

## 5. Graceful degradation

Each source is read inside its own try/catch. A single failing source becomes a
`warnings[]` entry plus an empty contribution and lowers overall confidence; the
remaining sources still produce their part of the brief. Only a fully unusable `db`
would surface as a 500 at the route.

## 6. The endpoint

`GET /api/ci/fnb-director-brief`

- `requireAuth(...CI_ROLES)` — identical gate to `/api/ci/decisions` and
  `/api/ci/menu-intelligence`.
- Venue-scoped via `req.venueId`.
- Optional query params: `limit` (display count for recent decisions / notable
  signals) and `since` (decision window lower bound).
- Read-only: no writes, no AI, no Venue DNA mutation. Returns `{ ok: true, brief }`.

**Feature flag decision:** none. The route is purely read-only and deterministic,
mirroring its read-only CI siblings, which are always-on (only *writes* are
flag-gated elsewhere). A flag on a pure read would be inconsistent with that
convention.

## 7. Brief shape (top level)

```
venue_id, generated_at
source:                { type:'fnb_director_brief', ai_used:false, writes_performed:false, sources_used[] }
confidence:            { overall:'low|medium|high', reason, missing_data[] }
executive_summary:     { status, key_points[] }
menu_snapshot_summary: { total_items, confidence, key_risks[], coverage_notes[], missing_data[] }
decision_activity:     { window{since,limit_applied,counted}, generated_count, selected_count,
                         rejected_count, recent_decisions[], rejection_patterns[], anecdotal_rejection_reasons[] }
candidate_signals:     { counts_by_review_status{...}, notable_signals[], review_backlog, total, note }
operational_warnings:  [ { type, severity, evidence, confidence } ]
recommended_human_review: [ ... ]
recommended_next_tests:   [ ... ]
not_enough_data:          [ ... ]
forbidden_inferences_avoided: [ ... ]
warnings:                 [ ... ]
```

## 8. Guardrails (verified by tests)

- Service performs **no** `INSERT`/`UPDATE`/`DELETE`, no `mergeVenueDna`, no
  AI/network calls, no Event/Lab/prompt imports.
- Imports only the **read/list** functions of the composed services (never their
  create/record/review entry points).
- Exports no promotion / candidate-to-DNA function.
- Empty-state safety, venue scoping, cross-venue isolation, deterministic counts,
  pattern thresholds, candidate grouping, missing-data honesty, no-writes, and
  graceful degradation are all covered.
