# New Venue Discovery — Fidelity Review Persistence (Implementation Scope)

> **Status: IMPLEMENTATION SCOPE — DOCS-ONLY. No code, schema, DDL, migration, persistence, routes, services, prompts, UI, or Venue DNA mutation in this document.** This is the implementation-scoping step that turns the settled persistence design into a precise, buildable boundary for the *next* (separate) slice. It produces a build spec, not a build.
> Created: 2026-06-25.
> Governing plan (this scopes its build): [NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_PERSISTENCE_PLAN.md](./NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_PERSISTENCE_PLAN.md) (Decision Gate §13, First Implementation Boundary §14).
> Resolved constraints this inherits as settled: [NEW_VENUE_DISCOVERY_PERSISTENCE_SCOPING_RESOLUTION.md](./NEW_VENUE_DISCOVERY_PERSISTENCE_SCOPING_RESOLUTION.md) (§3 dual-key + `record_space`, §4 earmark, §5 audit-first, §6 snapshot drift, §7 no `confirmation_ref`).
> Governing doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) (three layers, cardinal rule, required-on-every-write fields), [NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md](./NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md) (fidelity vs identity, §10 status vocabulary).
> Source code grounded in: `src/services/venueBridge/fnbVenueFeedbackService.js` (the isolated-candidate DDL/storage/review precedent — Phase 6A/7A), `server.js` (DDL boot ~L1189, additive `ALTER TABLE` idiom ~L1192, the candidate review route ~L6464, `requireAuth`/`req.venueId` posture), `src/features/owner-intelligence/CandidateReviewPanel.jsx` (the shipped local action vocabulary), `src/features/owner-intelligence/candidateSignalParser.js` + `src/services/venueIntelligence/candidateSignalFormat.js` (the 5-field shape, the only signal source).

---

## 0. Hard doctrine (restated, non-negotiable, governs everything below)

- **Fidelity approval means "HESTIA captured what I meant."** It does **not** mean "this is confirmed Venue DNA."
- **No `confirmed` enum value, anywhere, by any path.** The stored vocabulary physically excludes confirmation (vocabulary, not vigilance).
- **No promotion. No 9D. No second Venue DNA writer. No `mergeVenueDna`. No canonical Venue DNA write** (`venue_dna_json`, `venue_briefs`, `venue_dna_enrichment`, `venue_intelligence`).
- **"Suggested destination: Venue DNA" remains inert metadata** — a display string + a boolean earmark note in a `concept_draft` Memory row. It is never a write path and has structurally no DNA target.

If any line of the eventual build contradicts §0, the build is wrong — stop and re-scope.

---

## 1. Objective

Persist the fidelity-review choices the inline panel already produces (`captured | edited | held | rejected` + re-route + owner edit overlay) into an **isolated Venue Memory table**, owner-writable, fully provenance-stamped, append-only audited, with `confirmed` structurally unreachable and **zero** Venue DNA contact. Replace the panel's ephemeral `useState` with durable, venue-/concept-scoped persistence — and flip the honesty copy from *"not saved yet"* to *"saved as captured, not confirmed."*

This is the Phase 7A pattern (`markVenueIntelligenceCandidateReviewed` persisted human review of a candidate signal without touching DNA), re-applied to the discovery source, with the discovery-specific tightening already settled in the scoping-resolution doc.

---

## 2. Implementation boundary

### 2.1 Allowed in the first build
- One new **isolated** review table + one new **append-only** audit table (DDL pattern: `fnbVenueFeedbackService.js`'s exported `*_DDL` constant, booted in `server.js` next to L1189; additive `ALTER TABLE … ADD COLUMN` in `try/catch` for any later field).
- A new dependency-injected **persistence service** (sibling of `fnbVenueFeedbackService.js`) owning DDL, validation, the audit-first write, the idempotent upsert, and venue-scoped reads.
- **Owner-only write + read** routes, `req.venueId`-scoped, mirroring the candidate review route posture (`server.js` ~L6464).
- A `concept_ref` minted once per discovery thread, carried in client discovery state, sent with every save (the table's logical thread key; never a venue id).
- Persisting `review_action` + `chosen_destination` + `dna_earmarked` + `owner_edit` overlay + permanent `provenance` + `evidence_type` + coverage `confidence_band` + an immutable `candidate_snapshot` + `snapshot_taken_at`.
- Server-side enforcement of: confidence-never-raised, provenance-set-server-side, `record_space` hard-coded `'concept_draft'`, audit-before-upsert.
- Updating `CandidateReviewPanel` to load + save through the routes, and updating its `LOCAL_NOTE` copy once writes land.

### 2.2 Explicitly NOT allowed in the first build
- No `confirmed` / `approved` / `promoted` status, by any path, in any table or enum.
- No `confirmation_ref` column (omitted entirely — resolution §7).
- No call to `mergeVenueDna`; no write to `venue_dna_json`, `venue_briefs`, `venue_dna_enrichment`, or `venue_intelligence`.
- No `'Venue DNA'`-routed earmark that writes DNA or targets a live venue's DNA; no `record_space = 'live_venue'` write.
- No second Venue DNA writer; no `/promote`; no `/confirm`; no route accepting a DNA payload.
- No raised confidence on any write; no fabricated evidence; no upgrade of the conservative `DEFAULT_EVIDENCE` default.
- No use of `defaultVenueId()` in any handler; no new `venues` row.
- No change to `venueIntelligenceIntent.js` exploration gating, or the `ownerCorrectionLoopFormat.js` / `candidateSignalFormat.js` output contract, or `candidateSignalParser.js` parse contract.
- No exposure to non-owner roles (admin **read** only; admin is never a fidelity-saver here).

### 2.3 Must remain design-only after this build
- 9D confirmation tier (`venue_dna_confirmations`, the confirm action, the `confirmed` store).
- Corroboration-over-time evaluation; any second-party confirmation mode.
- Promotion of any record into canonical DNA (Phase 7B preconditions unmet).
- A dedicated review *page* (the MVP stays inline under the Owner Correction Loop reply).

---

## 3. The twenty required definitions

This section answers, point by point, the twenty things the scope must pin down. Each is a **decision**, inherited from the settled design where one exists.

### 3.1 Exact data model proposal
Two records. The review record holds **current state + an immutable snapshot**; the audit record holds **history**. Shapes (design shape — **NOT DDL**; DDL form in §4):

```
DiscoveryCandidateReview              // Venue Memory record — one per reviewed candidate
  id                  // minted UUID — stable upsert key
  venue_id            // = req.venueId — ACCESS BOUNDARY ONLY (never the subject)
  concept_ref         // minted UUID — the draft/concept thread (logical grouping)
  record_space        // 'concept_draft' ONLY (server-hard-coded; client never sets it)
  conversation_ref    // soft, non-authoritative pointer (message-index/candidate-index); may dangle
  candidate_snapshot {              // immutable copy of the candidate AS REVIEWED
    signal, evidence,
    confidence_band,                // 'low'|'medium'|'high' — coverage, never raised
    dna_status_label,               // the candidate's own "Status" string, verbatim
    suggested_destination
  }
  snapshot_taken_at   // when the snapshot was captured (drift honesty)
  review_action       // 'captured' | 'edited' | 'held' | 'rejected'   (NO 'confirmed')
  chosen_destination  // owner's routed destination; 'Venue DNA' is an EARMARK STRING only
  dna_earmarked       // boolean; inert Memory note, never a DNA write
  owner_edit { signal?, evidence?, confidence_band? } | null   // present only when action === 'edited'; band may only LOWER
  provenance          // 'owner_conversation' | 'owner_edit' — permanent, server-set
  evidence_type       // taxonomy evidence type (owner_provided_fact|owner_provided_belief|inferred_signal|missing)
  reviewed_by, reviewed_at, created_at, updated_at
  // confirmation_ref DELIBERATELY ABSENT (resolution §7)
```

```
DiscoveryCandidateReviewEvent         // append-only; one row per change
  id                  // minted UUID
  review_id           // LOGICAL reference to review.id (NOT a DB-enforced FK — §3.16)
  venue_id            // scoped (access boundary)
  concept_ref         // carried for forensic scoping
  changed_by, changed_at
  from_action, to_action            // e.g. 'held' → 'rejected'; from_action null on first save
  from_destination, to_destination  // re-routes
  edit_delta          // what changed (signal/evidence/confidence-down), or null
  reason_note         // optional free text
```

The five candidate fields come verbatim from `candidateSignalFormat.js` (`signal · evidence · confidence · status · suggestedDestination`). Persistence wraps them; it never re-derives or re-parses them.

### 3.2 Required tables (design only)
**Two** new tables, both isolated siblings of `venue_intelligence_candidates` — never columns on `venue_intelligence` (that table *is* canonical DNA):
- `discovery_candidate_reviews` — current state + snapshot.
- `discovery_candidate_review_events` — append-only audit.

DDL lives as exported constants in the new service module (single source of truth shared by server boot and the in-memory test), exactly like `VENUE_INTELLIGENCE_CANDIDATES_DDL`.

### 3.3 Audit table: separate or same?
**Separate table.** The review row carries *current* state; the audit table carries *history*. This mirrors Phase 7B's audit posture and keeps the upsert (idempotent, mutable) cleanly distinct from the append-only event log. Never overwrite history in place; never store history as a JSON blob on the review row.

### 3.4 `concept_ref` minting strategy
- **Minted once per discovery thread**, client-side, when a discovery exploration begins — independent of whether the owner ever designates a real venue (resolution §3.3). UUID.
- Carried in client discovery state (alongside `vi.messages`); sent with every fidelity-review save for that thread.
- The server treats it as an **opaque token scoped under `venue_id`**: validates shape (non-empty string / UUID-ish), never derives meaning, never resolves it through `resolveVenueId` (it is **not** a venue id and would correctly 403 there).
- It creates **no `venues` row**. Nothing existing is reusable as `concept_ref` (the conversation has no durable id; candidates are parsed by index) — it **must** be minted.
- Open implementation question (flag, not a blocker): *where* in client discovery state the `concept_ref` is held and how it survives a page refresh for an in-progress thread. MVP-acceptable answer: persist it in the same client store that holds the discovery conversation; if the conversation is ephemeral, the `concept_ref` is ephemeral with it, and a reloaded thread mints a new one (older saved reviews remain readable by their stored `concept_ref`). This is honest and lossless for saved records.

### 3.5 `record_space = 'concept_draft'` enforcement
- `record_space` is a column with a controlled vocabulary, but the discovery write path **hard-codes `'concept_draft'` server-side and never accepts the value from the client**.
- `'live_venue'` is reserved for a future, separate, explicitly-designated path (9D-era) and is **out of scope**. This surface never writes it.
- **Conflation guard (binding):** any consumer that treats a row as describing the live venue MUST filter `record_space = 'live_venue'` — which this surface never writes — so no discovery review can ever be read as live-venue truth despite sharing the access boundary. Reads here default to `record_space = 'concept_draft'`.

### 3.6 `venue_id` as access boundary only
- `venue_id = req.venueId`, verbatim, on every read and write. It is the **operator access boundary**, not a claim that the concept *is* that venue.
- **Never** `defaultVenueId()` in a handler (Phase 8 doctrine). A foreign / cross-venue id → 404, never a foreign write (mirror `markVenueIntelligenceCandidateReviewed`'s venue-scoped existence check).
- The record's *subject* is the concept (`concept_ref` + `record_space`), not `venue_id`. This separation is the entire defense against re-introducing, one layer down in Memory, the contamination `venueIntelligenceIntent.js` exists to prevent.

### 3.7 Owner-only write / admin read permissions
| Role | See discovery reviews | Save fidelity review | Confirm to DNA (9D, later) |
|---|---|---|---|
| owner | ✅ | ✅ | ✅ (owner-only, later, + corroboration + separation) |
| admin | ✅ (technical support) | ❌ | ❌ (reserved 9D second party, not here) |
| manager / bar_manager / fb_director / events_manager / employee / chef | ❌ | ❌ | ❌ |

- **Write route:** `requireAuth('owner')` only.
- **Read route:** `requireAuth('owner', 'admin')` (admin read mirrors the candidate review route's owner/admin posture, but admin gets **no** write here).
- Persistence does not widen the audience beyond the design §11 table.

### 3.8 Allowed review statuses
`review_action ∈ { 'captured', 'edited', 'held', 'rejected' }` — a 1:1 map to the shipped panel actions (`ACTION_LABEL` keys in `CandidateReviewPanel.jsx`). Re-route is **not** a `review_action`; it is recorded as `chosen_destination ≠ candidate_snapshot.suggested_destination` (+ `dna_earmarked` when `'Venue DNA'`). The creation state is the first explicit action (there is no `unreviewed` default — a row exists only because the owner acted).

### 3.9 Forbidden statuses (especially `confirmed`)
**Forbidden, structurally, with no column/enum value able to express them:** `confirmed`, `approved`, `promoted`, `needs_confirmation`, `live_venue` (as a `record_space` write), and any confidence-*raised* state. The validator **throws** (400) on any `review_action` outside §3.8. `confirmed` cannot be a typo-away — it simply is not in the vocabulary.

### 3.10 Candidate snapshot structure
- `candidate_snapshot` is an **immutable** copy of the five fields **as reviewed**, stored as a compact JSON column (serialize-on-write / parse-on-read, per the `JSON_FIELDS` idiom).
- Snapshotted because the source (an assistant message in `vi.messages`) is not a stable, addressable record (no id; can be regenerated/cleared). The snapshot, not the source, is the record of truth.
- The conservative `DEFAULT_EVIDENCE` ("…specific supporting detail not yet captured.") is stored **verbatim** when that is what existed — never upgraded into real evidence.
- `snapshot_taken_at` records when it was frozen; drift never mutates it (§3.x snapshot drift, §6 of resolution).

### 3.11 Owner edit overlay structure
- When `review_action === 'edited'`, the record keeps **both**: the original `candidate_snapshot` (HESTIA's paraphrase) **and** the `owner_edit` overlay (the owner's words). They are **never merged** into one field.
- `owner_edit` is a JSON column `{ signal?, evidence?, confidence_band? } | null`. Only the fields the owner changed are present.
- This separation is load-bearing for self-approval prevention: HESTIA's paraphrase and the owner's correction stay permanently distinguishable, so a later reader can never mistake an owner edit for independent corroboration.
- `provenance` flips to `'owner_edit'` (server-set) when an overlay is present; otherwise `'owner_conversation'`.

### 3.12 Confidence-lowering rules
- `confidence_band ∈ {low, medium, high}` — coverage, never certainty; stored as the coarse band, never a percentage.
- **Server re-enforces "may only be lowered"** (the panel already enforces it client-side via `allowedConfidence` / `saveEdit`, but the server must never trust the client): a saved `owner_edit.confidence_band` whose rank exceeds `candidate_snapshot.confidence_band` is **rejected** (preferred — surfaces the bug) or floored to the snapshot band. Raising confidence is a fabricated evidence claim laundered through an API; it is forbidden.
- Ceilings carried from the design (orientation for any future writer, not re-derived here): `inferred_signal → low`; single-conversation `owner_provided_fact|belief → medium`; `high` essentially unreachable from one discovery pass and never invented by persistence.

### 3.13 Re-route handling
- `chosen_destination` ∈ the seven `VALID_DESTINATION` values (`candidateSignalFormat.js`). Defaults to the candidate's `suggested_destination`.
- `'Venue DNA'` as `chosen_destination` is stored **verbatim as a display string** + sets `dna_earmarked = true`. That is the entire effect: an inert note in a `concept_draft` row meaning "the owner wants this considered for a venue's DNA, later, under 9D." **No `mergeVenueDna`, no DNA store write, structurally no DNA target** (resolution §4).
- A re-route is audited as a `from_destination → to_destination` event; it does not change `review_action`.
- Default routing posture (design §8.1) — accepted candidates conceptually belong in Venue Memory; this whole table *is* Venue Memory, so a saved review is already in the honest home regardless of the earmark.

### 3.14 Audit-first write ordering
Per resolution §5.1, for every save:
1. **Mint `review.id`** (UUID) before either write — the audit references it, so it must exist as a value first.
2. **Write the append-only audit event FIRST** (`from_action → to_action`, `changed_by`, `changed_at`, deltas).
3. **Then upsert the review row** (current state), keyed on `review.id`.

Audit-first guarantees **no state change is ever un-audited**: if the second write fails, an orphan audit event exists (benign, forensically visible) but no un-audited state change. The rejected ordering (review-then-audit) could leave a state change with no history — forbidden.

### 3.15 Idempotency strategy
- **Idempotent upsert on stable `review.id`**: re-running the same save converges to the same row; a retry after partial failure is safe.
- The client owns `review.id` continuity per candidate within a `concept_ref` thread (mint once per candidate-review, reuse on subsequent saves of the same candidate). The server upserts on that id within `(venue_id, concept_ref)` scope.
- Repeated saves are recorded by the audit as **events, not as evidence weight** — re-saving never raises confidence or strengthens status (anti-self-approval defense #5).

### 3.16 Partial-failure behavior without `db.transaction()`
- `node:sqlite` has **no `db.transaction()`** (Phase 8 memory). The audit insert and the review upsert are two separate statements; consistency comes from ordering (§3.14) + idempotency (§3.15), not a transaction wrapper.
- `audit.review_id` is a **logical reference, not a DB-enforced FK** — specifically so audit-first ordering (audit written before the review row exists) is legal. The build must **not** enable `PRAGMA foreign_keys = ON` for these tables.
- **Read-path tolerance:** current-state reconstruction reads the **review** table as source of truth; any audit event with no matching review row is treated as a *did-not-land trace*, not as state. The audit stays a complete forensic record regardless.
- Append-only + idempotent + read-from-review-table means there is no destructive partial-write to reason about; undo is a new audit event, never a delete.

### 3.17 Readback behavior
- `GET` returns the venue's / concept's persisted reviews + current state: `WHERE venue_id = ? AND record_space = 'concept_draft'` (optionally `AND concept_ref = ?`), newest first.
- The panel reconstructs per-candidate review state from the returned rows on mount, replacing the ephemeral `useState` seed.
- **Snapshot is authoritative; the conversation pointer may dangle.** Readback must label rows as *snapshots as reviewed* and must **never** silently re-fetch/re-sync from the (possibly changed) conversation. When `conversation_ref` no longer resolves, surface an honest note — *"the source conversation is no longer available; this is the snapshot as you reviewed it on {date}"* — never hide the dangle or fabricate a re-link (resolution §6).
- A compact list projection (no large JSON in list responses) mirrors the candidate-list route; full snapshot on the single-record/by-concept read.

### 3.18 UI implications
- `CandidateReviewPanel.jsx` gains a persistence path: load saved reviews on mount (keyed by `concept_ref`), and on each action call the write route instead of (or in addition to) local `useState`. Optimistic local update is acceptable; the route is the source of truth on reload.
- **Copy change (required, exactly once writes land):** `LOCAL_NOTE` flips from *"Review choices are local in this first version and are not saved yet."* to an honest *"Saved as captured, not confirmed."* The mandatory `FRAMING_LINE` ("Captured, not confirmed…") is **unchanged and stays non-removable**.
- The `concept_ref` must be threaded from discovery state into `OwnerAIHome.jsx` → `CandidateReviewPanel` so the panel knows which thread it is saving under.
- No new palette, no new page, no celebratory/"confirmed" affordance, no confidence-up control. Palette B (Editorial Light), unchanged.
- A dangling-snapshot honesty note (§3.17) is added to the card when the pointer no longer resolves.

### 3.19 Tests required
Following the `scripts/test-fnb-venue-feedback.js` in-memory-db pattern (`node:sqlite` `:memory:`, the exported DDL constant, no live server):
- **Service unit tests** (`scripts/test-discovery-candidate-review-persistence.js`, new):
  - upsert is idempotent on `review.id` (re-save converges, no duplicate row);
  - audit row is written **before** the review row (audit-first); a simulated review-upsert failure leaves an orphan audit event and no un-audited state change;
  - `review_action` outside `{captured,edited,held,rejected}` throws; `confirmed`/`approved`/`promoted` rejected;
  - `owner_edit.confidence_band` above snapshot rank is rejected/floored (never raised);
  - `record_space` is always `'concept_draft'` on write regardless of client input; `'live_venue'` never written;
  - `venue_id` scoping: cross-venue read/write → not found, never foreign write;
  - `dna_earmarked` set for `'Venue DNA'` route; **no** code path touches `venue_dna_json`/`venue_briefs`/`venue_dna_enrichment`/`venue_intelligence`/`mergeVenueDna` (assert by absence — service imports none of them);
  - conservative `DEFAULT_EVIDENCE` stored verbatim, never upgraded;
  - snapshot immutable across subsequent action changes; `snapshot_taken_at` preserved.
- **Route tests** (extend the existing route-audit test style, e.g. `scripts/test-venue-intelligence-message-route-audit.js`): owner can write; admin read-only; non-owner roles denied; foreign venue → 404; no route accepts a DNA payload.
- **Regression (must stay green, unchanged expected output):** `scripts/test-owner-correction-loop-format.js`, the existing candidate-signal-format / parser tests, and any `candidateSignalParser` test — the output/parse contracts are untouched.
- **Gate:** `npm run build` and `npm run hestia:check` pass with no new FAILs.

### 3.20 Exact guardrails preventing any canonical Venue DNA mutation
1. The new service module **imports nothing** DNA-related (no `mergeVenueDna`, no `venue_intelligence`/`venue_briefs`/`venue_dna_enrichment` access) — verifiable by inspection, asserted by test (§3.19).
2. The stored **vocabulary excludes** `confirmed`/`approved`/`promoted` and has **no `confirmation_ref` column** — the dangerous act is *impossible to express*.
3. `record_space` is server-hard-coded `'concept_draft'`; `'live_venue'` is never written, so no row can be read as live-venue truth.
4. `'Venue DNA'` routing is a `dna_earmarked` boolean + display string in a `concept_draft` row — structurally no DNA target exists for it to reach (no live-venue DNA subject; the subject is `concept_ref`).
5. Confidence may only be **lowered**, re-enforced server-side; saving is never corroboration.
6. The single owner-conversation → `mergeVenueDna` path stays the **only** writer of canonical Venue DNA; this surface adds **no** writer, no `/promote`, no `/confirm`.
7. Routes reject any payload attempting to address a DNA store (not silently coerced).

---

## 4. Proposed schema (DESIGN-ONLY — not DDL to ship in this doc)

Illustrative DDL shape for review only, following `VENUE_INTELLIGENCE_CANDIDATES_DDL` conventions (`TEXT PRIMARY KEY`, `venue_id NOT NULL`, compact JSON columns, venue-scoped indexes, `CURRENT_TIMESTAMP` defaults). **This is design shape presented for review; the build slice writes the real DDL in the service module, not this document.**

```
-- DESIGN SHAPE ONLY — DO NOT SHIP FROM THIS DOC
discovery_candidate_reviews (
  id                    TEXT PRIMARY KEY,
  venue_id              TEXT NOT NULL,          -- access boundary only
  concept_ref           TEXT NOT NULL,          -- minted draft/concept thread id
  record_space          TEXT NOT NULL DEFAULT 'concept_draft',  -- server-hard-coded
  conversation_ref      TEXT,                   -- soft pointer; may dangle
  candidate_snapshot_json TEXT NOT NULL,        -- immutable 5-field snapshot
  snapshot_taken_at     TEXT,
  review_action         TEXT NOT NULL,          -- captured|edited|held|rejected (NO confirmed)
  chosen_destination    TEXT,
  dna_earmarked         INTEGER NOT NULL DEFAULT 0,
  owner_edit_json       TEXT,                   -- overlay; null unless edited
  provenance            TEXT NOT NULL,          -- owner_conversation|owner_edit (server-set)
  evidence_type         TEXT,
  reviewed_by           TEXT,
  reviewed_at           TEXT,
  created_at            TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at            TEXT DEFAULT CURRENT_TIMESTAMP
  -- confirmation_ref DELIBERATELY ABSENT
);
-- indexes: (venue_id), (venue_id, concept_ref), (venue_id, record_space)

discovery_candidate_review_events (
  id                 TEXT PRIMARY KEY,
  review_id          TEXT NOT NULL,             -- LOGICAL ref, not enforced FK
  venue_id           TEXT NOT NULL,
  concept_ref        TEXT,
  changed_by         TEXT,
  changed_at         TEXT DEFAULT CURRENT_TIMESTAMP,
  from_action        TEXT,
  to_action          TEXT,
  from_destination   TEXT,
  to_destination     TEXT,
  edit_delta_json    TEXT,
  reason_note        TEXT
);
-- indexes: (venue_id), (review_id), (venue_id, concept_ref)
```

---

## 5. API route proposal (DESIGN-ONLY — do not implement here)

Mirrors the candidate review route posture (`server.js` ~L6425–L6477); nothing built in this doc.

- **`GET /api/discovery-reviews`** — `requireAuth('owner', 'admin')`, `req.venueId`-scoped, optional `?concept_ref=`. Returns compact current-state rows (no large JSON in the list) filtered to `record_space = 'concept_draft'`.
- **`GET /api/discovery-reviews/:reviewId`** — `requireAuth('owner', 'admin')`, `req.venueId`-scoped, full snapshot; 404 cross-venue.
- **`PUT /api/discovery-reviews/:reviewId`** — `requireAuth('owner')`, `req.venueId`-scoped. Upsert a review's `review_action` / `chosen_destination` / `owner_edit`; body carries only fidelity fields; server derives `provenance`, hard-codes `record_space`, mints/validates ids, writes audit-first. Foreign id → 404.
- **Server-side invariants on every write:** confidence never raised; `review_action` ∈ §3.8; provenance server-set; `record_space` server-hard-coded; audit row before review upsert; no path reaches `mergeVenueDna` or any DNA store.
- **Explicitly NOT added:** any `/promote`, any `/confirm`, any route taking a DNA payload or writing `venue_dna_json`.

---

## 6. Service responsibilities (DESIGN-ONLY — do not implement here)

New module, e.g. `src/services/venueIntelligence/discoveryCandidateReviewService.js` (or under `venueBridge/`), dependency-injected `db`, modeled on `fnbVenueFeedbackService.js`:
- Owns the two `*_DDL` constants (single source of truth, shared with the in-memory test).
- `normalizeDiscoveryReview(input, venueId)` — validates `review_action`/`record_space`/destination/confidence, sets `provenance` server-side, floors/rejects raised confidence, serializes JSON columns, throws on invalid vocabulary.
- `upsertDiscoveryReview(db, venueId, conceptRef, input)` — mints id when absent, writes **audit event first**, then idempotent upsert; returns shaped row.
- `listDiscoveryReviewsForVenue(db, venueId, { concept_ref?, limit })` and `getDiscoveryReviewById(db, venueId, reviewId)` — venue-scoped, `record_space = 'concept_draft'`, shape JSON on read.
- **Imports nothing** from any Venue DNA store, `mergeVenueDna`, or `venue_intelligence`. Deterministic, no AI, no prompts, no network.
- Server boot adds `db.exec(...DDL)` next to L1189 and any later additive `ALTER TABLE` in `try/catch`.

---

## 7. UI changes (DESIGN-ONLY — do not implement here)

- `CandidateReviewPanel.jsx`: replace ephemeral `useState` seeding with load-on-mount from `GET /api/discovery-reviews?concept_ref=…`; on each action call `PUT`; keep optimistic local update.
- Thread `concept_ref` from discovery state through `OwnerAIHome.jsx` into the panel.
- Flip `LOCAL_NOTE` to *"Saved as captured, not confirmed."* once writes land; keep `FRAMING_LINE` unchanged and non-removable.
- Add the dangling-snapshot honesty note when `conversation_ref` no longer resolves.
- No new page, no palette change, no confirmed/celebratory affordance, no confidence-up control.

---

## 8. Test plan

See §3.19 for the enumerated cases. Summary: a new in-memory service test (idempotency, audit-first, vocabulary rejection, confidence-floor, scoping, no-DNA-import, snapshot immutability, verbatim default); route auth/scoping tests (owner-write, admin-read, role denial, cross-venue 404, no DNA payload); regression on the unchanged format/parser tests; `npm run build` + `npm run hestia:check` green.

---

## 9. Risks

1. **`concept_ref` lifecycle — RESOLVED (§13 addendum).** Formerly the one open caveat; now a settled decision: client-side per-thread UUID, held in component/session state, not persisted before an explicit save, no `localStorage` in the first build, no concept registry. Saved rows remain readable by their stored `concept_ref`; a pre-save refresh may mint a new ref, which is lossless because unsaved choices are already ephemeral. See §13 for the full ruleset and server-side validation requirements.
2. **Scope creep into confirmation.** The standing risk of the whole program: a "save" that quietly becomes a "confirm." Mitigated structurally by vocabulary (§3.9) and no `confirmation_ref` (§3.20.2), not by vigilance.
3. **Earmark leakage.** A `'Venue DNA'` route that silently merges into the live venue. Mitigated by `record_space`/`concept_ref` subject separation and the absence of any DNA target (§3.20.4).
4. **Audit-first/no-transaction subtlety.** A future maintainer enabling `PRAGMA foreign_keys = ON` or reordering writes would break audit-first. Mitigated by §3.16 + an explicit code comment requirement and a test asserting the orphan-audit case.
5. **Snapshot drift misread.** UI silently re-syncing from a changed conversation would corrupt the record's meaning. Mitigated by §3.17 (snapshot authoritative; visible dangle note; never re-sync).
6. **Confidence-raise via API.** Client bypass raising a band. Mitigated by server-side re-enforcement (§3.12), not client trust.

---

## 10. Explicitly NOT allowed in the first build (consolidated)

- No `confirmed` / `approved` / `promoted` status, by any path, in any table or enum.
- No `confirmation_ref` column.
- No `mergeVenueDna`; no write to `venue_dna_json`, `venue_briefs`, `venue_dna_enrichment`, `venue_intelligence`.
- No `record_space = 'live_venue'` write; no `'Venue DNA'` earmark that writes DNA or targets a live venue.
- No second Venue DNA writer; no `/promote`; no `/confirm`; no route accepting a DNA payload.
- No raised confidence on write; no fabricated evidence; no upgrade of `DEFAULT_EVIDENCE`.
- No `defaultVenueId()` in any handler; no new `venues` row; no `PRAGMA foreign_keys = ON` on these tables.
- No change to `venueIntelligenceIntent.js` gating, the `ownerCorrectionLoopFormat.js` / `candidateSignalFormat.js` output contract, or the `candidateSignalParser.js` parse contract.
- No exposure to non-owner write roles (admin read only).
- No 9D, corroboration engine, second-party confirmation, promotion, or dedicated review page.

---

## 11. Readiness for an actual implementation prompt

**Ready — no remaining caveats.** Every settled constraint (data model, two-table split, audit-first, idempotency, no-transaction handling, snapshot drift, scoping triple-key, no `confirmation_ref`, role posture, vocabulary) is pinned and grounded in shipped precedent (`fnbVenueFeedbackService.js`, the candidate review route). The previously-open item — the `concept_ref` client lifecycle — is now **closed by the §13 addendum** (client-minted per-thread UUID, component/session state only, not persisted before save, no `localStorage`, no registry; server requires and validates it, hard-codes `record_space`, never substitutes `venue_id`). The whole slice is buildable as specified.

---

## 12. What this document explicitly does NOT do

- No code, no table, no migration, no DDL shipped (the §4 shape is *design shape*, not DDL).
- No routes, services, prompts, or UI implementation.
- No `mergeVenueDna`; no write to any canonical Venue DNA store; no mutation of any live venue's DNA.
- No `confirmed` status, no 9D flow, no corroboration engine, no promotion, no second writer.
- No change to existing runtime behavior of any kind; the inline panel, the loop output contract, and the parser are untouched.

---

## 13. Addendum — `concept_ref` client lifecycle (DECISION, design-only)

> Added 2026-06-25. This closes the one remaining caveat from §11 (Risk #1). It is a **decision**, not an implementation. Docs-only: no code, DB, routes, persistence, UI, or Venue DNA contact.

### 13.1 Decision
For the first persistence slice, **`concept_ref` is minted client-side, once per New Venue Discovery / candidate-review thread, as a UUID.** It is the logical identity of the *draft/concept thread* — nothing more.

### 13.2 Rules (binding)
- `concept_ref` identifies the **draft/concept thread, not the live venue**.
- `venue_id` remains **only** the access/security boundary (§3.6).
- `record_space` remains **hard-coded `concept_draft` server-side** (§3.5).
- `concept_ref` must **not** be derived from `venue_id`.
- `concept_ref` must **not** be derived from message index.
- `concept_ref` must **not** be derived from message text.
- `concept_ref` must **not** imply confirmed Venue DNA.
- **A refresh before saving may mint a new `concept_ref`. That is acceptable for the MVP** because unsaved local review choices are already ephemeral — nothing durable is orphaned.
- **Once a fidelity review is saved (future slice), the saved row's `concept_ref` becomes the stable readback identifier** for that saved review.
- **Do not use `localStorage` in the first build** unless separately approved.
- **Do not persist `concept_ref` before the owner explicitly saves a fidelity review.** No mint = no write; minting is free and durable only at save time.
- **Do not create any concept registry/table in this slice.** `concept_ref` is an opaque token scoped under `venue_id`, not a row in a new table.

### 13.3 Implementation guidance (for the future slice — still design-only)
- The client may keep `concept_ref` in **component/session state** for the current `OwnerAIHome` discovery thread (e.g. minted on first candidate-review render of the thread, carried in React state for that thread's lifetime).
- The future save route **must require `concept_ref` in the request body**.
- The server **must validate `concept_ref` shape** (non-empty, UUID-shaped) and **never silently substitute `venue_id`** for it — a missing/malformed `concept_ref` is an error, not a fallback.
- The server **must hard-code `record_space = 'concept_draft'`** on write (never accept it from the client — §3.5).
- The server **must reject persistence if `concept_ref` is missing or malformed** (400; no write, no audit row).

### 13.4 Why this is safe
`concept_ref` carries no venue identity and no confirmation semantics — it cannot leak a concept into a live venue's DNA (the subject is the concept, the boundary is `venue_id`, the space is `concept_draft`; §3.5–§3.6). Minting only at save time, with no pre-save persistence and no registry, means the surface adds **zero** durable state until the owner explicitly acts, and adds **no** new identity store. This fully resolves Risk #1 without touching any boundary or schema decision elsewhere in this scope.

---

*End of implementation scope. No code, schema, migrations, prompts, routes, services, UI, or live behavior were changed in producing this document. No Venue DNA was read for mutation or mutated; the discovery loop's output contract and the shipped inline review surface are unchanged. This document only converts the settled persistence design into a precise, buildable boundary for a future, separate implementation slice.*
