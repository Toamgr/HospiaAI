# Beverage UX System — Owner Brief & Report Memory (2026-07)

**Status:** UX + contract spec. Slice 1A of this document is implemented on branch
`feat/beverage-slice1a-owner-brief-inbox`; everything else is design memory for later slices.
**Doctrine companion:** `BEVERAGE_INTELLIGENCE_BRAIN_GAP_ANALYSIS_2026_07.md`

---

## 1. The beverage workflow, end-state (design memory)

The full loop HESTIA is building toward:

1. **Owner Beverage Direction Brief** — the owner states direction in their own words:
   intent, guest profile, flavor direction, constraints, price posture, staff capability,
   season. Highest-authority *aspiration* signal. (Slice 1A — built.)
2. **F&B Director review** — the professional layer: reviews the brief, annotates, adjusts as
   a *diff on top of* the owner's values, approves / declines / requests clarification.
   (Slice 1A — built.)
3. **Proposal work** — later: cocktail/menu proposals informed by the approved brief and the
   expert prior. AI may propose; humans approve. Never in Slice 1A.
4. **Report memory** — later: POS/Tabit sales reports land as raw Venue Memory evidence and are
   mapped, timelined, and attributed (see the gap analysis, §4). Sales reports may influence
   recommendations; they never rewrite Venue DNA, and "sold well" (fact) is never presented as
   "is loved" (hypothesis).
5. **Outcome loop** — later: decisions scored against subsequent evidence.

## 2. Slice 1A — Owner Beverage Brief → F&B Inbox (implemented)

### 2.1 Record classes

Two venue-scoped record classes plus one append-only audit table, all persisted in SQLite via
the standard service-module pattern (DDL exported from the service, booted in `server.js`,
dependency-injected `db`, deterministic, zero AI, zero network).

**`owner_beverage_briefs`** — the owner's direction, as typed.

- `id` (uuid), `venue_id` (access boundary, always server-resolved), `owner_user_id`
- `status`: `draft | submitted` (closed vocabulary, CHECK-constrained)
- Content fields (all nullable TEXT unless noted — an empty field is honest, never defaulted):
  `venue_type`, `service_style`, `intent_statement`, `guest_profile`, `flavor_direction`,
  `cocktail_count` (INTEGER), `zero_proof_stance`, `constraints`, `price_range`,
  `staff_capability_note`, `season_context`
- `field_provenance_json` — per-field map, values `owner_typed | empty`, **server-derived**
  from the stored values (never client-supplied)
- `created_at`, `updated_at`, `submitted_at`

**`fnb_brief_reviews`** — the F&B Director's review layer.

- `id`, `venue_id`, `owner_beverage_brief_id` (logical ref — no enforced FK, matching the
  audit-first pattern used by the owner-meaning tables), `reviewer_user_id`
- `status`: `in_review | approved | declined | clarification_requested`
- `notes` (TEXT)
- `field_adjustments_json` — a **diff/annotation layer**: per-field entries of the shape
  `{ owner_value, adjusted_value, note }`. `owner_value` is copied in at write time so the
  review is self-describing, and the brief row itself is never modified by a review.
- `created_at`, `decided_at`

**`beverage_brief_events`** — append-only audit.

- `id`, `venue_id`, `brief_id`, `review_id` (nullable), `event_type`, `event_payload_json`,
  `created_by`, `created_at`
- Event vocabulary (closed): `brief_created`, `brief_submitted`, `review_created`,
  `review_status_changed`, `review_adjustment_added`
- Audit-first write ordering (audit row inserted before the state row), mirroring
  `ownerMeaningCaptureService.js`. No FK, no `PRAGMA foreign_keys`.

### 2.2 Invariants (binding)

1. **The owner's words are immutable after submit.** A submitted brief accepts no field
   updates through any route. Draft edits are owner-only and self-only.
2. **F&B never overwrites.** Adjustments live only in `field_adjustments_json` on the review
   row. There is no code path that writes owner brief content fields from a review.
3. **Venue scope is server-side.** Every route uses `req.venueId` resolved by `requireAuth`;
   `venue_id` is never read from the client body. Cross-venue ids resolve to a safe 404.
4. **Role boundaries.** Owner: create/edit *own* draft, submit, read own venue's briefs.
   F&B Director: list submitted briefs, read them, create and decide reviews. The owner
   write routes exclude the platform-admin bypass explicitly (the owner is the author of
   direction — same posture as the owner-meaning capture routes); F&B routes follow the
   standard `requireAuth('fb_director')` pattern (admin bypass per existing repo convention).
5. **No fake anything.** No sample briefs, no seeded rows, no AI drafts, no fallback content,
   no fake success states. Empty inbox says so honestly.
6. **Venue DNA is untouched.** This slice never imports, reads for write, or mutates any
   Venue DNA store. Nothing here is "confirmed identity" — a brief is aspiration evidence.

### 2.3 Routes (implemented in Slice 1A)

| Route | Auth | Purpose |
| --- | --- | --- |
| `POST /api/owner-beverage-briefs` | owner (admin excluded) | create draft |
| `PUT /api/owner-beverage-briefs/:briefId` | owner (admin excluded, author-only) | edit own draft; 409 once submitted |
| `POST /api/owner-beverage-briefs/:briefId/submit` | owner (admin excluded, author-only) | draft → submitted (one-way) |
| `GET /api/owner-beverage-briefs` | owner | list own venue's briefs (with review status) |
| `GET /api/owner-beverage-briefs/:briefId` | owner | read one brief + events |
| `GET /api/fnb-beverage-brief-inbox` | fb_director | list submitted briefs + review state |
| `GET /api/fnb-beverage-brief-inbox/:briefId` | fb_director | read one submitted brief + review + events |
| `POST /api/fnb-brief-reviews` | fb_director | open a review (`in_review`) on a submitted brief |
| `PATCH /api/fnb-brief-reviews/:reviewId` | fb_director | add notes/adjustments and/or decide (approve / decline / request clarification) |

### 2.4 UI (implemented in Slice 1A)

Both screens follow the HESTIA UI design skill (Palette A — Operational Dark; one primary
action per screen; honest empty states; no dashboard bloat).

- **Owner — "Beverage Direction Brief"** (`beverageBrief` page, command area): a calm guided
  form over the eleven fields. Save draft (secondary), **Submit to the F&B Director**
  (primary). After submission the brief renders read-only with its submitted state stated
  plainly. Empty fields are visible and unpressured.
- **F&B Director — "Beverage Brief Inbox"** (`beverageBriefInbox` page, barManagement area,
  page-gated to `fb_director`): list of submitted briefs, newest first. Empty state:
  *"No beverage briefs waiting."* Opening a brief shows the owner's values verbatim, lets the
  director add notes and per-field adjustments (stored as a diff beside — never over — the
  owner's value), and one decision row: approve / decline / request clarification.

### 2.5 Explicitly not built in Slice 1A

Menu/cocktail generation, prefilled generation forms, images, POS upload, sales analysis,
improvement briefs, experiments, Academy integration, recipes, prep/SOP, costing changes,
notifications, owner-visible review outcomes (a later slice), multi-brief versioning beyond
draft→submit.

## 3. Report Memory (design memory only — nothing implemented)

When sales reports arrive (POS/Tabit), they enter as **raw Venue Memory**: file-level import
records with source, period, and hash; row-level items untouched. Interpretation (mapping,
attribution) is a separate, confidence-carrying Venue Intelligence layer, per the gap
analysis. The Owner Brief and the Report Memory eventually meet in recommendation surfaces —
"the owner asked for X; the evidence shows Y" — where aspiration and observation are shown
side by side and never collapsed. That surface is far out of scope here and must not be built
before evidence stages 1–5 exist.
