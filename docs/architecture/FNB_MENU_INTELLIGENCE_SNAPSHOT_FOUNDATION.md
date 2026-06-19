# F&B Menu Intelligence Snapshot — Foundation (Phase 8F)

**Status:** Complete · read-only · deterministic · venue-scoped
**Service:** `src/services/venueBridge/menuIntelligenceService.js`
**Route:** `GET /api/ci/menu-intelligence`
**Tests:** `scripts/test-menu-intelligence.js` (`npm run test:menu-intelligence`)

---

## 1. What this is

A safe, **read-only intelligence layer** that lets HESTIA reason about a venue's
current cocktail/beverage menu as a **portfolio** rather than as isolated cocktails.

It answers questions such as:

- What does the current menu contain?
- Which base spirits / categories are over- or under-represented?
- Is the menu balanced across classics and signatures?
- Is there low-proof / zero-proof coverage?
- Are there service-speed or prep-complexity risks?
- Is pricing data present, and what is its range?
- **What data is missing, and what should a human review next?**

It is honest about uncertainty: missing data is reported as `null`, `unknown`,
`available: false`, or listed in `_missing_fields` — **never fabricated**.

## 2. What this is NOT

- **Not** a generation feature (no recipes, no menus produced).
- **Not** a Venue DNA feature (reads nothing from and writes nothing to Venue DNA).
- **Not** an AI agent (no model calls, no prompts, no network).
- **Not** a promotion path (no candidate→DNA logic, no escalation of any signal).
- **Not** a third cocktail engine (it only reads existing tables).

## 3. Data source & venue scoping

Cocktails carry **no `venue_id`** of their own. The venue anchor is **menu
membership**: a venue's menu items are the rows in `cocktails` whose `menu_id`
points to a `cocktail_menus` row for that venue.

```
SELECT c.* FROM cocktails c
JOIN cocktail_menus m ON c.menu_id = m.id
WHERE m.venue_id = ? AND m.status = 'active' AND c.is_active = 1
```

Tables read (read-only): `cocktail_menus`, `cocktails`. No other table is touched.
Cross-venue items and inactive items never enter a venue's snapshot.

## 4. Snapshot shape (top level)

```
venue_id, generated_at
source:                { type:'read_only_menu_snapshot', tables_used, ai_used:false, writes_performed:false }
confidence:            { overall:'low|medium|high', reason, missing_data[] }
menu:                  { total_items, active_items, item_ids[], item_names[] }
coverage:              { base_spirits, cocktail_families, classics_vs_signatures, low_proof, zero_proof }
taste_distribution:    { available, dimensions, missing_profiles_count, flavor_model_present, notes[] }
operational_profile:   { prep/service/staff distributions|null, staff_skill_risks[], missing_operational_fields[] }
pricing_profile:       { available, basis, price_range|null, cost_range|null, margin_range|null, missing_pricing_fields[] }
risks:                 [ { type, severity, evidence, recommendation, confidence } ]
recommended_human_review: [ ... ]
_missing_fields:       [ ... ]
_assumptions:          [ ... ]
```

## 5. Data-honesty rules (enforced)

- No active menu → **safe empty snapshot** (not an error).
- Cocktails without taste profiles → taste `available:false`, missing count reported.
- No price/cost/margin fields → `pricing_profile.available:false`, ranges `null`.
- No ABV field → low-proof unavailable (never guessed from the name).
- Zero-proof counted **only** from an explicit category/tag/base-spirit marker; a
  zero count is reported as *marker absence*, not as a claim that none exists.
- **No POS/sales** → no popularity inference. **No guest data** → no preference
  inference. **No inventory** → no bottle-availability inference.
- The decimal taste model and the integer flavor model are kept **separate**.
- Pricing fields are stored **estimates**, surfaced as such — never verified truth.

## 6. Risks

Every risk is **evidence-based** and carries `{ type, severity, evidence,
recommendation, confidence }`. Risks are emitted only when evidence exists, e.g.
`spirit_overconcentration`, `missing_base_spirit_data`, `low_category_diversity`,
`missing_taste_profiles`, `missing_operational_data`, `missing_pricing_data`,
`no_zero_proof_marker`. Missing-data observations carry `high` confidence (the
absence is a fact); inferential risks (e.g. overconcentration) are capped lower.

## 7. The endpoint

`GET /api/ci/menu-intelligence`

- `requireAuth(...CI_ROLES)` — the same roles as `/api/ci/decisions`.
- Venue-scoped via `req.venueId`.
- Read-only: no writes, no AI, no Venue DNA mutation.

**Feature flag decision:** none. The route is purely read-only and deterministic,
mirroring its sibling read-only CI route `/api/ci/decisions`, which is always-on
(only *writes* are flag-gated elsewhere in the codebase). Adding a flag would be
inconsistent with that established convention for read-only CI intelligence reads.

## 8. Guardrails (verified by tests)

- Service performs **no** `INSERT`/`UPDATE`/`DELETE`.
- No `mergeVenueDna`; no writes to `venue_intelligence` / `venue_briefs` /
  `venue_dna_enrichment` / `venue_intelligence_candidates`.
- No AI/network imports; no Cocktail Lab / Event Builder imports.
- No exported promotion / candidate-to-DNA function.
- Cross-venue isolation, inactive-item exclusion, and empty-state safety covered.
