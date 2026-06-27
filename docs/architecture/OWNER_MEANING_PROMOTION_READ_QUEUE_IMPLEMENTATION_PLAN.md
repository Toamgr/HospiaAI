# HESTIA Owner Meaning Promotion — Read-only Queue Implementation Plan (Slice 4G.0)

> **Status:** Slice 4G.0 — **docs-only implementation plan.** No application code, no backend route,
> no frontend UI, no service file, no DB migration, no boot-time DDL, no `db.exec`, no proposal
> generation, no approve/reject/request-revision writer, no `mergeVenueDna` call, no Venue DNA
> mutation, no change to existing capture/read/compose behavior. This document is the **build sheet**
> for the next *code* slice (**4G.1 — DDL + service + read routes + tests, read-only**). It exists so
> that 4G.1 writes code, not design. If anything here reads as if a table, route, or write already
> exists, that is a documentation defect — report it, do not act on it.
>
> **Source of truth at authoring time:** `origin/main @ d28aaf9` — *docs: lock owner meaning
> promotion read api contract*. HEAD == origin/main, working tree clean. The capture → read →
> compose chain (4D–4E.2) is complete and verified; the promotion layer is **not** started.
>
> **What 4G.1 builds (the slice this plan describes):** the two-table DDL (4F.1), idempotent server
> boot wiring, a deterministic **read-only** service
> (`src/services/venueIntelligence/ownerMeaningPromotionService.js`), and the **two GET routes** of
> the read API contract (4F.2) — **with their tests in the same commit.** It builds **no** proposal
> generator, **no** approval/rejection/revision writer, **no** DNA application.

---

## 1. Scope

**Plan only (in 4G.1):**

* **DDL constants** — `OWNER_MEANING_PROMOTION_CANDIDATES_DDL` + `OWNER_MEANING_PROMOTION_EVENTS_DDL`,
  exported from the new service (mirroring `OWNER_MEANING_CAPTURES_DDL` /
  `OWNER_MEANING_CAPTURE_EVENTS_DDL`).
* **Server boot wiring** — two idempotent `db.exec(...)` calls next to the existing capture DDL
  exec block in `server.js`.
* **Read-only service** — pure, dependency-injected `db`, SELECT-only methods (list, detail, events,
  source-capture resolution). No writer functions.
* **Two GET routes** — `GET /api/owner-meaning-promotion-candidates` and
  `GET /api/owner-meaning-promotion-candidates/:candidateId`, owner-only, read-only.
* **Tests** — persistence/service + route-behavior + route-audit scripts, registered as npm scripts,
  shipped in the same commit.

**Explicitly NOT in 4G.1 (firewall — see §10, §12):**

* **No product writer** — no INSERT/UPDATE/DELETE from any route or service path.
* **No approval.** **No rejection.** **No revision request.** (Those are a later writer slice.)
* **No proposal generation** — nothing in 4G.1 drafts a candidate; tests seed rows directly (§6).
* **No DNA mutation** — no write to `venue_intelligence` / `venue_dna_json` / `venue_briefs` /
  `venue_dna_enrichment` / `venue_intelligence_candidates`; **no `mergeVenueDna` import or call.**

The DDL constants are *declared and wired* (so the tables exist and the read service has something
to read), but **the only rows that ever enter those tables in 4G.1 come from test seeds** — there is
no production code path that writes a candidate. This is the same posture as a read API shipping
ahead of its writer: the schema exists, the reads work, the writes do not exist yet.

---

## 2. Binding source docs

Implementation **must** follow these, in the precedence order below. Summarized obligations:

### 2.1 `docs/architecture/OWNER_MEANING_PROMOTION_REVIEW_DESIGN.md` (4F — doctrine)

* The **four-stage boundary**: capture → proposal → approval → application. 4G.1 touches only the
  *read* surface over stages 2–3; it builds neither proposal nor approval nor application.
* **HESTIA must never silently convert evidence into truth.** A read changes nothing.
* **Owner-only**, admin re-excluded in-handler; managers/bar_managers a different trust class, never
  widened in.
* **Confidence is reasoned, never a number/meter/ring**; word bands only (`low` | `medium`).
* **Application (stage 4) is deferred** per Phase 7B; the read surface shows `application.blocked: true`.

### 2.2 `docs/architecture/OWNER_MEANING_PROMOTION_DDL_CONTRACT.md` (4F.1 — table shape)

* **Exactly two tables**: `owner_meaning_promotion_candidates` (36 cols, §3.1) and
  `owner_meaning_promotion_events` (15 cols, §4.1). The optional third table is intentionally NOT
  added.
* Column names, types, nullability, defaults, controlled vocabulary, status lifecycle, immutability
  rules, `record_space = 'concept_draft'`, `schema_version = 'owner_meaning_promotion_v1'`,
  `confidence_score` REAL internal-only (leave NULL in 4G), reserved/blocked `applied_*` fields.
* **No enforced FK; no `PRAGMA foreign_keys`** for these tables (audit-first ordering).

### 2.3 `docs/architecture/OWNER_MEANING_PROMOTION_READ_API_CONTRACT.md` (4F.2 — route shapes)

* The two GET routes: request contracts, response envelopes (object, never bare array), pagination,
  filtering, error bodies, source-capture resolution, the read-only side-effect guarantee.
* `allowed_actions` all `false`; `application.blocked: true`; `confidence.score: null`; list uses
  **excerpts** (≤160 chars), detail returns full `owner_response_raw` byte-for-byte; `venue_id`
  **omitted** from the detail response.
* Invalid closed-vocab filters → **400**; invalid `limit`/`offset` → **clamp/default** (never 400);
  unknown param keys ignored without widening; reserved `applied_to_dna_future` not filterable, not
  in `counts`.

### 2.4 Existing code conventions

* **`src/services/venueIntelligence/ownerMeaningCaptureService.js`** — mirror its module shape:
  exported DDL constants at top, `isNonEmptyString` / `isUuidLike` / `serializeJson` / `parseJson` /
  `badRequest` helpers, `clampListLimit` / `clampListOffset`, `shape*Row` read-shaping, the
  `{ rows, pagination: { limit, offset, count, has_more } }` list shape, ordering
  `created_at DESC, rowid DESC`, deterministic and AI-free.
* **`server.js` route precedent** — the capture read routes
  ([server.js:6738](../../server.js#L6738), [server.js:6755](../../server.js#L6755)):
  `requireAuth('owner')` **plus** the in-handler `if (req.user && req.user.role === 'admin') return res.status(403)…`
  re-exclusion; `req.venueId` only; `{ ok: true, ...result }` on success; safe 404 on missing/cross-venue.
* **`server.js` boot precedent** — the capture DDL exec block at
  [server.js:1217-1218](../../server.js#L1217-L1218).
* **Existing capture tests** — `scripts/test-owner-meaning-capture-read-route-behavior.js` /
  `-read-route-audit.js` / `-persistence.js` are the structural templates for the new scripts
  (in-memory `node:sqlite`, minimal express app mounting route handlers copied verbatim in shape, a
  faithful `requireAuth` model with the admin global bypass, before/after row-count assertions).

### 2.5 Precedence (resolve conflicts in this order)

1. **Security / non-mutation doctrine wins** (4F + Phase 7B). If any shape seems to imply a write,
   application, cross-venue read, or admin access, the doctrine overrides it — the shape is the bug.
2. **DDL contract (4F.1) wins** on tables, columns, types, status vocabulary, `record_space`,
   `schema_version`, `confidence_score` handling, reserved fields.
3. **Read API contract (4F.2) wins** on route shapes — paths, query params, response envelopes,
   pagination, error bodies.
4. **Existing code conventions win on style** (helpers, naming, file layout, test harness) **unless
   they conflict with security** — where the capture precedent echoes `venue_id` but 4F.2 §4.3 says
   omit it from the promotion detail, **4F.2 wins** (it is a deliberate tightening).

---

## 3. Implementation sequence (the future 4G.1 code slice)

**Recommended future code slice: 4G.1 — DDL + service + read routes + tests, read-only.** One
commit, in this order:

* **A. Create `src/services/venueIntelligence/ownerMeaningPromotionService.js`** — new file, header
  doc-block modeled on the capture service, deterministic, dependency-injected `db`, imports
  `node:crypto` only if needed for shaping (no `randomUUID` writes in 4G.1 service).
* **B. Export the two DDL constants** —
  * `OWNER_MEANING_PROMOTION_CANDIDATES_DDL`
  * `OWNER_MEANING_PROMOTION_EVENTS_DDL`
  Plus the controlled-vocabulary constants the reader validates filters against
  (`OWNER_MEANING_PROMOTION_STATUSES`, `OWNER_MEANING_PROMOTION_CONFIDENCE_LABELS`,
  `OWNER_MEANING_PROMOTION_EVENT_TYPES`, `OWNER_MEANING_PROMOTION_TARGET_PATHS` allow-list,
  `OWNER_MEANING_PROMOTION_RECORD_SPACE = 'concept_draft'`,
  `OWNER_MEANING_PROMOTION_SCHEMA_VERSION = 'owner_meaning_promotion_v1'`, list limit defaults).
* **C. Add idempotent boot wiring in `server.js`** — import the two DDL constants + the read service
  functions; add two `db.exec(...)` calls beside the capture DDL block ([server.js:1217](../../server.js#L1217)).
* **D. Add pure read service methods** (SELECT-only):
  * `listOwnerMeaningPromotionCandidates(db, venueId, options)`
  * `getOwnerMeaningPromotionCandidateById(db, venueId, candidateId)`
  * `listOwnerMeaningPromotionEvents(db, venueId, candidateId)`
  * `resolveSourceCapturesForPromotionCandidate(db, venueId, candidate)`
* **E. Add owner-only GET routes** in `server.js` (next to the capture read routes):
  * `GET /api/owner-meaning-promotion-candidates`
  * `GET /api/owner-meaning-promotion-candidates/:candidateId`
* **F. Add tests in the same commit** — persistence/service, route-behavior, route-audit scripts +
  npm script registrations in `package.json`.
* **G. Run existing regression tests** — the full `test:owner-meaning-capture-*` suite +
  `test:interpreted-candidates*`, to prove capture/read/compose boundaries are untouched.

---

## 4. Exact file plan

**Add:**

* `src/services/venueIntelligence/ownerMeaningPromotionService.js` — the read-only service + DDL
  constants + vocabulary constants.
* `scripts/test-owner-meaning-promotion-persistence.js` — DDL idempotency, table/index existence,
  seed-insert validity, vocab/CHECK rejection, list ordering/scope/pagination, detail resolution,
  cross-venue safety, read-does-not-mutate.
* `scripts/test-owner-meaning-promotion-read-route-behavior.js` — owner list/detail 200; admin 403;
  manager/bar_manager 403; unauth 401; invalid filters 400; pagination clamps; no client `venue_id`;
  cross-venue/unknown safe 404; response envelope; `allowed_actions` all false; `application.blocked`
  true; `confidence.score` null.
* `scripts/test-owner-meaning-promotion-read-route-audit.js` — no `mergeVenueDna` reference/call; no
  Venue DNA writes; no writes from GET routes; no approve/reject/revision route introduced; capture
  POST unchanged; composer UI unchanged; promotion route count is GET-only; no UI files changed.

**Change:**

* `server.js` — add two DDL imports + two `db.exec` lines; add the read-service imports; add the two
  GET route handlers.
* `package.json` — register the new `test:owner-meaning-promotion-*` npm scripts.

**Optional (only if service tests are split from persistence tests):**

* `scripts/test-owner-meaning-promotion-read.js` — pure service-level read tests (list/detail/events/
  source-capture shaping) separated from raw DDL/persistence tests, mirroring the capture layer's
  split between `test:owner-meaning-capture-persistence` and `test:owner-meaning-capture-read`.

**Do NOT touch UI files** — no `src/features/**`, no `*.jsx`, no `OwnerMeaningComposer*`, no
`PageRenderer.jsx`, no nav/route config. 4G.1 adds **zero** UI.

---

## 5. DDL implementation notes (from 4F.1)

**Exact table names:** `owner_meaning_promotion_candidates`, `owner_meaning_promotion_events`.

**Idempotent `CREATE TABLE IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS`** — running the DDL twice is
a no-op. Boot DDL must be idempotent (the same pattern as the capture DDL).

**Columns:** implement the full **36-column** candidate contract (4F.1 §3.1, cols 1–36) and the full
**15-column** events contract (4F.1 §4.1, cols 1–15) — names/types/nullability/defaults exactly as
specified. The reserved fields `applied_at`, `applied_by_user_id`, `dna_application_ref` **exist in
the schema** (so a future application slice needs no migration) but are **null in 4G** and written by
no code path here.

**Index names** (proposed, mirroring the capture index naming convention; the persistence test
verifies the ones it asserts):

* `idx_owner_meaning_promotion_candidates_venue_id` ON `(venue_id)`
* `idx_owner_meaning_promotion_candidates_venue_status` ON `(venue_id, status)`
* `idx_owner_meaning_promotion_candidates_venue_target_path` ON `(venue_id, proposed_target_path)`
* `idx_owner_meaning_promotion_candidates_venue_fingerprint` ON `(venue_id, candidate_fingerprint)`
* `idx_owner_meaning_promotion_candidates_created_at` ON `(created_at)`
* `idx_owner_meaning_promotion_events_venue_id` ON `(venue_id)`
* `idx_owner_meaning_promotion_events_candidate_id` ON `(candidate_id)`
* `idx_owner_meaning_promotion_events_created_at` ON `(created_at)`

**CHECK enum constraints** (cheap second wall behind service validation, mirroring the capture DDL):

* `record_space` CHECK `record_space = 'concept_draft'`.
* `status` CHECK ∈ the 8 active §5 statuses **plus** the reserved `applied_to_dna_future`
  (the CHECK allow-list may *contain* the reserved value so a future slice needs no migration, but
  **no 4G.1 code transitions into it** and the API never filters on it). Decide at implementation
  time per 4F.1 §5; safest is to include all nine in the CHECK and enforce reachability in code.
* `confidence_label` CHECK ∈ (`'low'`,`'medium'`).
* `created_by_actor_type` CHECK ∈ (`'hestia_suggestion'`,`'system'`).
* events `event_type` CHECK ∈ the §4.2 allow-list (including reserved `applied_to_dna_future` and
  `application_blocked`).
* events `actor_type` CHECK ∈ (`'owner'`,`'hestia_suggestion'`,`'system'`).

**`confidence_score`** — `REAL`, nullable, **internal-only, never rendered**; **leave NULL in 4G**
(4F.1 §6.3). The DDL declares the column so no future migration is needed; no 4G.1 path writes it.

**`record_space`** value — server-hard-coded `'concept_draft'` (NOT `'owner_meaning_promotion'`,
NOT `'live_venue'`). Reads filter on it.

**`schema_version`** value — `'owner_meaning_promotion_v1'` (the **string**, not integer 1).

**Application fields reserved/null** — `applied_at`, `applied_by_user_id`, `dna_application_ref`
declared, always NULL in 4G.1; the read API surfaces them as null under `application` with
`blocked: true`.

**No FK enforcement** — `owner_meaning_promotion_events.candidate_id` is a **logical** reference; do
**not** add a `FOREIGN KEY` clause and do **not** enable `PRAGMA foreign_keys` for these tables
(audit-first ordering precedent; matches the capture/discovery audit tables). The current repo
convention is FK-off for these audit-sibling tables, so this plan follows it.

**All reads venue-scoped** — every SELECT filters on `venue_id = ?` (and `record_space = 'concept_draft'`
for candidates).

**Boot DDL must be idempotent** — verified by the persistence test running the DDL twice.

---

## 6. Seeding strategy for tests

Because **no proposal generator exists** in 4G.1, the tests create their own fixtures — and this must
never look like a production writer:

* **Tests seed `owner_meaning_promotion_candidates` directly** — a small test-local
  `seedPromotionCandidate(db, { venueId, … })` helper that INSERTs a row with valid vocabulary, used
  **only inside the test scripts**, never exported from the service and never reachable from a route.
* **Tests may seed source `owner_meaning_captures` directly or through the existing capture service**
  (`createOwnerMeaningCapture`) where practical — preferred, so the source-capture resolution test
  exercises real capture rows and real `owner_response_raw`.
* **Tests must NOT create product writer behavior** — no `createOwnerMeaningPromotionCandidate`
  service export, no draft/propose/approve function. The seed helper lives in the test file; it is a
  fixture, not a product capability.
* **Tests must NOT use the composer UI to create promotion candidates** — the composer is untouched
  and cannot reach this table.
* **Tests must prove capture POST still cannot create promotion candidates** — a route-audit
  assertion: after `POST /api/owner-meaning-captures`, `SELECT COUNT(*) FROM owner_meaning_promotion_candidates`
  is unchanged (the capture writer touches only capture tables).

> **Guard against "seed looks like a writer."** Name the helper `seedPromotionCandidateForTest`,
> keep it in the test file, comment it as a fixture, and do **not** add any analogous function to the
> service. The service exports **read methods + DDL constants only.**

---

## 7. Read service shaping

Shape responses to the 4F.2 envelopes exactly. The service returns plain objects; the route wraps
them with `{ ok: true, … }`.

* **List candidate row** (per 4F.2 §3.2): `id`, `created_at`, `updated_at`, `status`,
  `status_reason`, `proposed_target_path`, `proposed_target_label`, `proposed_meaning_summary`,
  `proposed_value_preview` (short preview of `proposed_value_json`), `proposal_rationale`,
  `confidence` object, `evidence` object (count + fingerprints + `source_preview` excerpts when
  enabled), `review` object, `application` object. **No `venue_id`.**
* **Detail candidate row** (per 4F.2 §4.2): the full candidate object **with `venue_id` omitted**,
  including `record_space`, `current_value_snapshot_json` (parsed — the BEFORE), `proposed_value_json`
  (parsed — the AFTER), `proposed_dna_patch_json` (parsed — bounded delta, PROPOSED), `confidence`
  (with `contradictions` + `missing_evidence`), `impact_note`, `review`, `application`,
  `superseded_by_candidate_id`, `candidate_fingerprint`, `schema_version`.
* **Confidence object**: `{ label: 'low'|'medium', score: null, factors: {…} }` in the list; in
  detail add `contradictions` (from `contradictions_json`) and `missing_evidence` (from
  `missing_evidence_json`). **`score` is always `null`.** **`label` is never `high`.**
* **Evidence preview** (list only): `evidence.source_preview` = array of
  `{ capture_id, created_at, owner_response_excerpt, is_excerpt: true, question_text }`, the excerpt a
  **verbatim prefix** of `owner_response_raw` truncated to ≤160 chars (truncation made explicit).
  When `include_source_preview=false`, `source_preview` is `[]`.
* **Source captures** (detail only): `resolveSourceCapturesForPromotionCandidate` parses
  `source_capture_ids_json`, resolves each id against `owner_meaning_captures` **within `req.venueId`**,
  returns `{ id, created_at, owner_response_raw (full, byte-for-byte), question_text, question_reason,
  candidate_snapshot_json, candidate_fingerprint, event_count }`; an unresolved/cross-venue ref →
  `{ id, missing: true }` placeholder (never dropped, never fetched cross-venue).
* **Events** (detail only): `listOwnerMeaningPromotionEvents` returns the venue-scoped append-only
  trail newest-first (`created_at DESC, rowid DESC`), each row with parsed `event_payload`.
* **`allowed_actions` all false**: `{ approve: false, reject: false, request_revision: false,
  apply_to_dna: false }` — a forward-declared, read-only hint; never `true` in 4G.1.
* **Application blocked object**: `{ applied_at: null, applied_by_user_id: null,
  dna_application_ref: null, blocked: true, block_reason: '<safe message>' }`.
* **Pagination**: `{ limit, offset, count, has_more }` where `count` = rows in this page and
  `has_more` = `offset + count < total`. **No top-level `total`** (4F.2 §11).
* **Counts**: per-status object from a single `GROUP BY status` over the venue's candidates, covering
  the 8 active statuses only (reserved `applied_to_dna_future` excluded). Included when
  `include_counts=true` (default).
* **Excerpts vs raw**: list = excerpt only; **full raw `owner_response_raw` only in detail.**
* **Omission of `venue_id`**: the detail response omits `venue_id` entirely (access boundary, not
  data — 4F.2 §4.3). List rows also omit it.

---

## 8. Query handling

For `GET /api/owner-meaning-promotion-candidates` (4F.2 §3.1):

* **`limit`** — default **25**, clamped to **[1,100]**; invalid/non-finite/`<1` → 25; `>100` →
  clamped **down** to 100 (never widened). Reuse `clampListLimit`-style logic.
* **`offset`** — default **0**; invalid/negative/non-finite → 0. Reuse `clampListOffset`-style logic.
* **Invalid operational params clamp/default, never 400** — pagination bounds are operational, not
  security.
* **Invalid closed-vocab filters → 400** — a typo'd value for a *known* filter must not silently
  widen the result set:
  * **`status`** — optional; must be a member of the 8 active §5 statuses → else 400.
    `?status=applied_to_dna_future` → **400** (reserved, cannot occur).
  * **`target_path`** — optional exact-match on `proposed_target_path`; must be in the server
    allow-list (4F.1 §6.2) → else 400.
  * **`confidence_label`** — optional; `low` | `medium` only → else 400 (`high` → 400).
* **`include_counts`** — bool, default **true**; controls the `counts` object.
* **`include_source_preview`** — bool, default **true**; controls `evidence.source_preview`
  (excerpts) vs `[]`.
* **Unknown param *keys* ignored without widening access** — `?venue_id=…`, `?foo=…` are ignored;
  a client `venue_id` is **never** honored as a filter or subject; scope stays `req.venueId`.

> Distinction (locked): reject an unknown **value** for a known **filter** (400); ignore an unknown
> **key** (no error, no widening).

---

## 9. Route security

Both GET routes (modeled on [server.js:6738](../../server.js#L6738) /
[server.js:6755](../../server.js#L6755)):

* **`requireAuth('owner')`** at the route.
* **Explicit in-handler admin re-exclusion** — `if (req.user && req.user.role === 'admin') return
  res.status(403).json({ ok:false, error:'Owner Meaning Promotion is owner-only.' })`. `requireAuth`
  has a global admin bypass; it **must** be neutralized in-route so admin gets zero read access
  (admin-read is OPEN, default **blocked** — 4F.2 §14).
* **Managers / bar_managers blocked** at `requireAuth('owner')` → 403.
* **Unauthenticated → 401** at `requireAuth`.
* **No client `venue_id`** — never read from query/body; scope is **`req.venueId` only**.
* **Safe 404 for unknown / cross-venue detail** — `getOwnerMeaningPromotionCandidateById` returns
  null for an unknown id *or* a candidate under another venue; the route returns an **identical** safe
  404 `{ ok:false, error:'No promotion candidate found for this venue.' }` (no existence leak).
* **No source-capture leakage** — `source_capture_ids_json` resolved only within `req.venueId`;
  cross-venue refs render as `{ missing: true }`, never foreign data.
* **No writer side effects** — the handlers call read methods only (see §10).

Error bodies follow 4F.2 §6: `{ ok:false, error }`; 401/403/404/400/500 as specified; a cross-venue
id and an unknown id yield byte-for-byte the same 404.

---

## 10. Side-effect firewall

Both GET routes (and every service method they call) **must**:

* **not insert rows** (no INSERT to any table);
* **not update rows** (no UPDATE);
* **not create events** — in particular **`owner_review_opened` must NOT be emitted from a GET**
  (4F.2 §12). Review-open telemetry, if ever wanted, is a **separate explicit POST**, never a GET
  side effect;
* **not mark `owner_review_opened`** or reviewed/opened/approved anything;
* **not refresh confidence** — no re-derive/rewrite of `confidence_*` or any derived field;
* **not generate candidates** — reading the queue never drafts a proposal;
* **not call `mergeVenueDna`** — the service does not import it;
* **not mutate Venue DNA** — no write to `venue_intelligence`, `venue_dna_json`, `venue_briefs`,
  `venue_dna_enrichment`, `venue_intelligence_candidates`.

> A GET that writes — even "just an opened event" — is a contract violation. The queue can be read
> any number of times with zero state change (asserted by the route-audit test: candidate + event
> row counts identical before/after any number of GETs).

---

## 11. Tests required for future 4G.1

Three suites (optionally four if service tests are split), shipped in the same commit, registered as
`test:owner-meaning-promotion-*` npm scripts, each exiting 0/1.

### 11.1 Persistence / service tests (`test-owner-meaning-promotion-persistence.js`)

* **DDL idempotent** — running both DDL constants twice is a no-op.
* **Tables exist** — both tables present after exec.
* **Indexes exist where verifiable** — assert the asserted index names via
  `SELECT name FROM sqlite_master WHERE type='index'`.
* **Valid candidate insert succeeds in test seed** — the fixture INSERT with valid vocabulary lands.
* **Invalid status rejected** — a status outside the §5 set is rejected by the CHECK constraint
  (INSERT throws).
* **Invalid `confidence_score` rejected** — if written outside scale; in 4G.1 it is NULL, so assert a
  non-NULL out-of-range/`confidence_label` outside (`low`,`medium`) is rejected by CHECK.
* **List newest first** — `created_at DESC, id/rowid DESC`.
* **List respects venue scope** — venue_B candidates never appear for venue_A.
* **List pagination works** — limit/offset/`has_more` correct.
* **Detail returns source captures and events** — both arrays present and venue-scoped.
* **Cross-venue detail returns null/safe not-found** — foreign candidate id → null from the service.
* **Source capture raw text preserved in detail** — full `owner_response_raw` byte-for-byte.
* **List uses excerpt only** — `owner_response_excerpt` (`is_excerpt: true`, ≤160 chars), never full
  raw in the list.
* **GET / read service does not mutate data** — row + event counts identical before/after all reads.

### 11.2 Route behavior tests (`test-owner-meaning-promotion-read-route-behavior.js`)

* **owner can list** — 200, object envelope `{ ok, candidates, pagination, counts }`.
* **owner can detail** — 200 with `candidate` + `source_captures` + `events`.
* **admin blocked** — admin list/detail → 403, zero data.
* **manager / bar_manager blocked** — → 403.
* **unauthenticated blocked** — → 401.
* **invalid filters 400** — invalid `status` / `confidence_label` / `target_path` → 400;
  `?status=applied_to_dna_future` → 400.
* **pagination clamps** — `limit>100` → 100; `limit<1`/invalid → 25; negative `offset` → 0;
  `has_more` correct (no 400 for bad pagination).
* **no client `venue_id` accepted** — `?venue_id=other` ignored; results stay in active venue.
* **unknown / cross-venue detail safe 404** — foreign/unknown id → identical safe 404.
* **response object envelope** — top-level object, never a bare array.
* **`allowed_actions` all false** — detail `{ approve:false, reject:false, request_revision:false,
  apply_to_dna:false }`.
* **application blocked true** — `application.blocked: true`, `applied_*`/`dna_application_ref` null.
* **confidence score null / user-safe** — `confidence.score` null; `confidence.label` ∈ (`low`,`medium`).

### 11.3 Route audit tests (`test-owner-meaning-promotion-read-route-audit.js`)

* **no `mergeVenueDna` reference/call** — source-level grep of the service + route handlers: the
  string `mergeVenueDna` does not appear.
* **no Venue DNA writes** — `venue_dna_json` / `venue_intelligence` unchanged by any read.
* **no writes from GET routes** — candidate + event row counts identical before/after any number of
  GETs; no `owner_review_opened` emitted.
* **no approve/reject/revision routes introduced** — assert the server registers **no**
  `POST .../approve|reject|request-revision` for promotion in 4G.1.
* **capture POST unchanged** — `POST /api/owner-meaning-captures` still writes only capture tables;
  `owner_meaning_promotion_candidates` count unchanged after a capture POST.
* **composer UI unchanged** — no `OwnerMeaningComposer*` / `src/features/**` file changed in the diff.
* **server route count for promotion remains GET-only** — exactly two promotion routes, both GET.
* **no UI files changed** — the slice's diff touches no `*.jsx` / `src/features/**`.

### 11.4 Regression tests to run (must stay green)

* All owner meaning **capture** backend/read/UI/render tests:
  `test:owner-meaning-capture-persistence`, `-route-behavior`, `-route-audit`, `-read`,
  `-read-route-behavior`, `-read-route-audit`, `-composer-ui`, `-composer-render`.
* **Interpreted-candidates** UI regression: `test:interpreted-candidates`,
  `-route`, `-ui`.
* **Build** — only **optional**, recommended **if** `package.json` changes affect tooling or new
  route imports could affect server bundling. Since the frontend is untouched, a build is not
  required for 4G.1 unless something in the import graph changes; run it only if there is a real
  reason.

---

## 12. Explicitly excluded from future 4G.1

* **Proposal generation** — no draft/propose path; tests seed rows directly.
* **Approval writer** — no `POST .../approve`.
* **Rejection writer** — no `POST .../reject`.
* **Request-revision writer** — no `POST .../request-revision`.
* **UI queue** — no review-queue component, no diff view, no controls.
* **Apply to DNA** — no stage-4 application.
* **`mergeVenueDna`** — not imported, not called.
* **Venue DNA mutation** — no write to any DNA table.
* **Confidence recomputation** — reads never re-derive `confidence_*`.
* **`owner_review_opened` event on GET** — GET stays pure.
* **Admin read access** — admin blocked (OPEN, default blocked).
* **Arbitrary `target_path` patching** — `proposed_target_path` is an allow-listed read filter only;
  no patching of any kind in a read slice.

---

## 13. Acceptance criteria

4G.1 is complete **only if all** of the following hold:

* **DDL idempotent and tested** — both tables + indexes created; running the DDL twice is a no-op;
  persistence test passes.
* **Service read methods work** — list / detail / events / source-capture resolution return the
  shaped objects; venue-scoped; pagination correct.
* **GET routes match 4F.2 shapes** — envelopes, pagination, filtering, errors, excerpts vs raw,
  `allowed_actions` all false, `application.blocked` true, `confidence.score` null, `venue_id` omitted.
* **owner-only / admin-blocked verified** — owner 200; admin 403; manager/bar_manager 403; unauth 401.
* **no write side effects verified** — GET creates zero rows/events; no `owner_review_opened`.
* **no DNA mutation verified** — no `mergeVenueDna`; no DNA-table write (source-level + runtime).
* **existing capture/compose tests still pass** — full capture suite + interpreted-candidates green.
* **committed and pushed clean** — working tree clean; HEAD == origin/main after push.

---

## 14. Risks and mitigations

| # | Risk | Mitigation |
|---|---|---|
| 1 | **Adding DDL boot wiring could break startup.** | DDL is `CREATE TABLE/INDEX IF NOT EXISTS` (idempotent); place the two `db.exec` calls beside the proven capture block ([server.js:1217](../../server.js#L1217)); persistence test runs the DDL twice; smoke-start the server after wiring. |
| 2 | **Auth bypass may allow admin.** | `requireAuth('owner')` **plus** the explicit in-handler `role === 'admin' → 403` re-exclusion on **both** routes (the capture precedent); route-behavior test asserts admin 403 on list and detail. |
| 3 | **GET accidentally emits review events.** | No INSERT in any read path; route-audit test asserts event-row counts unchanged across many GETs and that no `owner_review_opened` exists; §10 firewall is explicit. |
| 4 | **Detail leaks cross-venue source captures.** | `resolveSourceCapturesForPromotionCandidate` filters captures by `req.venueId`; cross-venue refs render `{ missing: true }`; cross-venue candidate id → safe 404; tests seed a second venue and assert no leak. |
| 5 | **Confidence score becomes fake product certainty.** | `confidence_score` left NULL; API always returns `score: null`; `label` ∈ (`low`,`medium`), never `high`; tests assert null score + word-band label. |
| 6 | **Tests seed data in a way that looks like a product writer.** | Seed helper is test-file-local, named `seedPromotionCandidateForTest`, commented as a fixture; the service exports **read methods + DDL constants only**; route-audit test asserts no writer route/function exists and capture POST cannot create a candidate. |
| 7 | **New vitest tooling mixed with Node script tests.** | Keep the promotion tests as **Node scripts** (`node scripts/test-owner-meaning-promotion-*.js`), matching the capture backend tests; do **not** introduce vitest for these (vitest stays only for the existing `*.render.test.jsx`). |

---

## 15. Next after 4G.1

* **4G.2 — post-push verification.** Confirm HEAD == origin/main, re-run the full promotion + capture
  + interpreted-candidates suites on the pushed commit, smoke-start the server to confirm the two
  tables create cleanly and the two GET routes answer owner-only.
* **Then 4H or 4G.3 — read-only UI queue.** Build the owner-only Owner Review *read* surface
  (queue list + evidence drawer + proposed diff, all read-only, `allowed_actions` still false) over
  the 4G.1 routes — a depth layer, never the default landing, with the 4F allowed/forbidden copy.
* **Do NOT recommend the approval writer yet.** The approve / reject / request-revision writer must
  wait until the read-only queue exists and is verified, and even then approval stops at
  `owner_approved` (no DNA write) until the Phase 7B preconditions are independently delivered.

---

## Final principle (restated)

> 4G.1 makes the promotion queue **readable** — by the owner, within their venue, with admin and
> managers blocked — without making it **writable**. The two tables exist, the two GET routes answer,
> the tests prove zero state change, and no `allowed_actions` is ever `true`. HESTIA may show a
> *proposed* change and *referenced* (never rewritten) owner evidence with application *blocked*; no
> writer, no approval, and no byte of Venue DNA is touched in this slice.
