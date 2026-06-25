# New Venue Discovery — Fidelity Review Persistence (Slice 1) — Claude Code Implementation Prompt

> **What this is:** a ready-to-paste Claude Code prompt that builds the **first** fidelity-review persistence slice. It is the *build* the scope doc deliberately did not perform.
> **Governing scope (read it first, it is the contract):** [NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_IMPLEMENTATION_SCOPE.md](./NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_IMPLEMENTATION_SCOPE.md).
> Created: 2026-06-25. Repo baseline at authoring: `main` @ `7ee4d50`, clean tree.

---

## How to use

Open a fresh Claude Code session on this repo and paste everything in the fenced block below (§ "PROMPT — paste from here"). Do not paste this preamble.

---

## PROMPT — paste from here

```
You are implementing the FIRST persistence slice for New Venue Discovery fidelity review in HESTIA.

═══════════════════════════════════════════════════════════════════════
STEP 0 — MANDATORY READS BEFORE WRITING ANY CODE (do not skip)
═══════════════════════════════════════════════════════════════════════
Read, in order, and treat as binding:
  1. CLAUDE.md (root) — architecture posture, Phase 8 venue-scoping doctrine.
  2. docs/architecture/NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_IMPLEMENTATION_SCOPE.md
     — this is the literal spec for this slice. Sections §0, §2, §3.1–§3.20, §4, §5,
       §6, §7, §8, §10, §13 are the contract.
  3. docs/architecture/NEW_VENUE_DISCOVERY_PERSISTENCE_SCOPING_RESOLUTION.md
     — settled constraints (§3 dual-key + record_space, §4 earmark, §5 audit-first,
       §6 snapshot drift, §7 no confirmation_ref).
  4. docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md — the three-layer doctrine.

Then read the SHIPPED PRECEDENT you will mirror (do not invent new patterns):
  - src/services/venueBridge/fnbVenueFeedbackService.js
      • VENUE_INTELLIGENCE_CANDIDATES_DDL (exported DDL-constant pattern) ~L76
      • normalizeFnbCandidate / createVenueIntelligenceCandidate /
        listVenueIntelligenceCandidatesForVenue / getVenueIntelligenceCandidateById /
        markVenueIntelligenceCandidateReviewed (~L204–L361) — copy the shape, the
        venue-scoped existence check, the JSON serialize/parse idiom, the dependency-
        injected `db` signature.
  - server.js
      • DDL boot: the big db.exec(`CREATE TABLE IF NOT EXISTS …`) block starts ~L362.
      • additive ALTER TABLE in try/catch idiom: ~L1192.
      • candidate review route posture: app.patch('/api/venue-intelligence/candidates/
        :candidateId/review', requireAuth('owner','admin'), …) ~L6464; the candidate
        GET list/by-id routes ~L6425/L6453; import line for the service ~L23.
      • requireAuth / req.venueId posture (Phase 8): NEVER use defaultVenueId() in a handler.
  - src/features/owner-intelligence/CandidateReviewPanel.jsx — the shipped local action
    vocabulary (ACTION_LABEL), LOCAL_NOTE, FRAMING_LINE, allowedConfidence/saveEdit.
  - src/services/venueIntelligence/candidateSignalFormat.js — VALID_DESTINATION (7 values),
    DEFAULT_EVIDENCE, the 5-field shape (signal · evidence · confidence · status ·
    suggestedDestination). This is the ONLY signal source; do not re-derive or re-parse it.
  - scripts/test-fnb-venue-feedback.js — the in-memory (node:sqlite ':memory:') test
    pattern you will follow for the new service test.

═══════════════════════════════════════════════════════════════════════
HARD DOCTRINE — IF ANY LINE OF YOUR BUILD CONTRADICTS THIS, STOP
═══════════════════════════════════════════════════════════════════════
- Fidelity approval means "HESTIA captured what I meant." It is NOT "confirmed Venue DNA."
- NO `confirmed` / `approved` / `promoted` value, in any table, enum, or path. The stored
  vocabulary must make confirmation IMPOSSIBLE TO EXPRESS — vocabulary, not vigilance.
- NO `confirmation_ref` column anywhere.
- NO mergeVenueDna; NO write to venue_dna_json, venue_briefs, venue_dna_enrichment, or
  venue_intelligence. The new service must IMPORT NOTHING DNA-related (asserted by test).
- NO `/promote`, NO `/confirm`, NO route accepting a DNA payload, NO second Venue DNA writer.
- NO record_space='live_venue' write; record_space is server-hard-coded 'concept_draft'.
- "Suggested destination: Venue DNA" is an INERT earmark (boolean + display string in a
  concept_draft row). It has structurally NO DNA target. It is never a write path.
- NO defaultVenueId() in any handler; NO new venues row; NO PRAGMA foreign_keys=ON on these
  tables; NO db.transaction() (node:sqlite has none — rely on ordering + idempotency).
- Confidence may only be LOWERED, re-enforced server-side. Saving is never corroboration.
- NO change to: venueIntelligenceIntent.js gating; ownerCorrectionLoopFormat.js /
  candidateSignalFormat.js output contract; candidateSignalParser.js parse contract.

═══════════════════════════════════════════════════════════════════════
WHAT TO BUILD (Slice 1)
═══════════════════════════════════════════════════════════════════════
Persist the inline panel's existing fidelity-review choices
(captured | edited | held | rejected, plus re-route and owner-edit overlay) into an
isolated, owner-writable, fully provenance-stamped, append-only-audited Venue Memory table
with `confirmed` structurally unreachable and ZERO Venue DNA contact. Replace the panel's
ephemeral useState with durable, venue-/concept-scoped persistence, and flip the honesty
copy from "not saved yet" to "saved as captured, not confirmed."

────────────────────────────────────────────────────────────────────────
A. NEW SERVICE MODULE
   src/services/venueIntelligence/discoveryCandidateReviewService.js
   (dependency-injected `db`; deterministic; no AI, no prompts, no network; imports NOTHING
    DNA-related). Modeled on fnbVenueFeedbackService.js. It owns:

   1. Two exported DDL constants (single source of truth, shared with the in-memory test):
      DISCOVERY_CANDIDATE_REVIEWS_DDL and DISCOVERY_CANDIDATE_REVIEW_EVENTS_DDL.

      discovery_candidate_reviews:
        id                      TEXT PRIMARY KEY,        -- minted UUID, stable upsert key
        venue_id                TEXT NOT NULL,           -- ACCESS BOUNDARY ONLY
        concept_ref             TEXT NOT NULL,           -- minted draft/concept thread id
        record_space            TEXT NOT NULL DEFAULT 'concept_draft', -- server-hard-coded
        conversation_ref        TEXT,                    -- soft pointer; may dangle
        candidate_snapshot_json TEXT NOT NULL,           -- immutable 5-field snapshot
        snapshot_taken_at       TEXT,
        review_action           TEXT NOT NULL,           -- captured|edited|held|rejected
        chosen_destination      TEXT,
        dna_earmarked           INTEGER NOT NULL DEFAULT 0,
        owner_edit_json         TEXT,                    -- overlay; null unless edited
        provenance              TEXT NOT NULL,           -- owner_conversation|owner_edit (server-set)
        evidence_type           TEXT,
        reviewed_by             TEXT,
        reviewed_at             TEXT,
        created_at              TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at              TEXT DEFAULT CURRENT_TIMESTAMP
        -- confirmation_ref DELIBERATELY ABSENT
        -- indexes: (venue_id), (venue_id, concept_ref), (venue_id, record_space)

      discovery_candidate_review_events (append-only; one row per change):
        id               TEXT PRIMARY KEY,
        review_id        TEXT NOT NULL,   -- LOGICAL ref, NOT a DB-enforced FK
        venue_id         TEXT NOT NULL,
        concept_ref      TEXT,
        changed_by       TEXT,
        changed_at       TEXT DEFAULT CURRENT_TIMESTAMP,
        from_action      TEXT,
        to_action        TEXT,
        from_destination TEXT,
        to_destination   TEXT,
        edit_delta_json  TEXT,
        reason_note      TEXT
        -- indexes: (venue_id), (review_id), (venue_id, concept_ref)

   2. Constants:
        REVIEW_ACTIONS = Object.freeze(['captured','edited','held','rejected'])  // NO 'confirmed'
        PROVENANCE = Object.freeze(['owner_conversation','owner_edit'])
        CONFIDENCE_BANDS = Object.freeze(['low','medium','high'])  // band, never %
        (re-use VALID_DESTINATION + DEFAULT_EVIDENCE by importing candidateSignalFormat.js —
         that is NOT a DNA import; it is the signal contract.)

   3. normalizeDiscoveryReview(input, venueId):
        - throws (caller maps to 400) if review_action ∉ REVIEW_ACTIONS
          (so 'confirmed'/'approved'/'promoted' are rejected by absence).
        - sets provenance SERVER-SIDE: 'owner_edit' iff owner_edit overlay present, else
          'owner_conversation'. Never trust a client-sent provenance.
        - hard-codes record_space = 'concept_draft'. NEVER read it from the client.
        - confidence floor: if owner_edit.confidence_band rank > candidate_snapshot
          .confidence_band rank → REJECT (preferred — surfaces the bug). Raising = forbidden.
        - serializes candidate_snapshot_json / owner_edit_json; stores DEFAULT_EVIDENCE
          VERBATIM when that is what existed (never upgrade it).
        - sets dna_earmarked = (chosen_destination === 'Venue DNA') ? 1 : 0. That is the
          entire effect of a 'Venue DNA' route. No DNA target.

   4. upsertDiscoveryReview(db, venueId, conceptRef, input):
        - REQUIRE conceptRef: non-empty, UUID-shaped. Missing/malformed → throw (→400).
          NEVER substitute venue_id for concept_ref.
        - mint review.id (UUID) when absent.
        - AUDIT-FIRST ORDER (binding): (1) mint id, (2) INSERT the audit event row
          (from_action→to_action, from_destination→to_destination, edit_delta, changed_by,
          changed_at), (3) THEN idempotent upsert of the review row keyed on id within
          (venue_id, concept_ref) scope. If step 3 fails, the orphan audit event is benign;
          a state change must NEVER be un-audited. Do NOT reverse this order. Add a code
          comment stating audit-first is load-bearing and FKs must stay OFF.
        - immutable snapshot: on a subsequent action change for the same review.id, NEVER
          rewrite candidate_snapshot_json or snapshot_taken_at.
        - returns the shaped row.

   5. listDiscoveryReviewsForVenue(db, venueId, { concept_ref, limit }) and
      getDiscoveryReviewById(db, venueId, reviewId):
        - venue-scoped; WHERE venue_id = ? AND record_space = 'concept_draft'
          (+ optional AND concept_ref = ?); newest first.
        - cross-venue id → not found (mirror markVenueIntelligenceCandidateReviewed's
          venue-scoped existence check); NEVER a foreign write.
        - list = compact projection (no large JSON); by-id = full snapshot, JSON parsed.

────────────────────────────────────────────────────────────────────────
B. SERVER BOOT + ROUTES (server.js)
   - Import the new service + its two DDL constants next to the existing
     fnbVenueFeedbackService import (~L23).
   - Boot the two tables with db.exec(...DDL) inside / next to the existing DDL boot block
     (~L362). Any later field uses the additive ALTER TABLE … in try/catch idiom (~L1192).
   - Routes (mirror the candidate review route posture, ~L6424–L6477):
       GET  /api/discovery-reviews            requireAuth('owner','admin')  req.venueId-scoped,
            optional ?concept_ref=, compact list, record_space='concept_draft' filter.
       GET  /api/discovery-reviews/:reviewId  requireAuth('owner','admin')  req.venueId-scoped,
            full snapshot; cross-venue → 404.
       PUT  /api/discovery-reviews/:reviewId  requireAuth('owner')          req.venueId-scoped.
            Body carries ONLY fidelity fields (review_action, chosen_destination, owner_edit,
            candidate_snapshot for first save, conversation_ref, reason_note) + concept_ref.
            Server derives provenance, hard-codes record_space, mints/validates ids, writes
            audit-first. Foreign id → 404. Missing/malformed concept_ref → 400 (no write,
            no audit row).
   - Server-side invariants on every write: confidence never raised; review_action ∈ the
     four values; provenance server-set; record_space server-hard-coded; audit row before
     review upsert; NO path reaches mergeVenueDna or any DNA store.
   - DO NOT add /promote, /confirm, or any route taking/writing a DNA payload.
   - admin gets READ only here; admin is never a fidelity-saver.

────────────────────────────────────────────────────────────────────────
C. UI (src/features/owner-intelligence/CandidateReviewPanel.jsx + OwnerAIHome.jsx)
   - Thread concept_ref from discovery state through OwnerAIHome.jsx into the panel.
     Per scope §13: concept_ref is CLIENT-MINTED (UUID) once per discovery/candidate-review
     thread, held in component/session state (React state for the thread's lifetime),
     minted on first candidate-review render of the thread. DO NOT use localStorage. DO NOT
     persist concept_ref before an explicit save. DO NOT create a concept registry/table.
     A pre-save refresh minting a new ref is acceptable (unsaved choices are already ephemeral).
   - On mount: load saved reviews via GET /api/discovery-reviews?concept_ref=… and reconstruct
     per-candidate state, replacing the ephemeral useState seed. Optimistic local update is OK;
     the route is source of truth on reload.
   - On each action: call PUT /api/discovery-reviews/:reviewId.
   - Copy: flip LOCAL_NOTE from "…local in this first version and are not saved yet." to
     "Saved as captured, not confirmed." KEEP FRAMING_LINE ("Captured, not confirmed…")
     UNCHANGED and non-removable.
   - Snapshot honesty: when conversation_ref no longer resolves, show the dangling-snapshot
     note ("the source conversation is no longer available; this is the snapshot as you
     reviewed it on {date}"). NEVER silently re-sync from the conversation.
   - NO new page, NO palette change (Palette B / Editorial Light unchanged), NO confirmed/
     celebratory affordance, NO confidence-up control.

────────────────────────────────────────────────────────────────────────
D. TESTS
   - NEW service test: scripts/test-discovery-candidate-review-persistence.js
     (node:sqlite ':memory:', the exported DDL constants, no live server). Cover:
       • upsert idempotent on review.id (re-save converges; no duplicate row);
       • audit row written BEFORE review row; a simulated review-upsert failure leaves an
         orphan audit event and NO un-audited state change;
       • review_action outside {captured,edited,held,rejected} throws; confirmed/approved/
         promoted rejected;
       • owner_edit.confidence_band above snapshot rank rejected (never raised);
       • record_space always 'concept_draft' regardless of client input; 'live_venue' never written;
       • venue_id scoping: cross-venue read/write → not found, never foreign write;
       • dna_earmarked set for 'Venue DNA' route; assert by ABSENCE that the module imports
         nothing touching venue_dna_json/venue_briefs/venue_dna_enrichment/venue_intelligence/
         mergeVenueDna (e.g. read the source file and assert no such import string);
       • DEFAULT_EVIDENCE stored verbatim, never upgraded;
       • snapshot immutable across subsequent action changes; snapshot_taken_at preserved.
   - Route auth/scoping tests in the existing route-audit style: owner can write; admin
     read-only; non-owner roles denied; foreign venue → 404; no route accepts a DNA payload;
     missing/malformed concept_ref → 400.
   - REGRESSION (must stay green, unchanged output): scripts/test-owner-correction-loop-format.js,
     the candidate-signal-format/parser tests, any candidateSignalParser test.

────────────────────────────────────────────────────────────────────────
E. VERIFICATION GATE (must all pass; report actual output)
   - npm run build
   - npm run hestia:check
   - node scripts/test-discovery-candidate-review-persistence.js
   - the new route test
   - the regression tests above
   Fix any new FAIL before declaring done. If a guardrail and a test conflict, the guardrail
   wins — re-scope, do not weaken a guardrail to pass a test.

────────────────────────────────────────────────────────────────────────
F. COMMIT
   - Branch off main first (do not commit straight to main).
   - One focused commit (or a small, logical sequence): service+DDL, routes+boot, UI, tests.
   - Do NOT push unless asked.
   - End the commit message with:
       Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>

═══════════════════════════════════════════════════════════════════════
DEFINITION OF DONE
═══════════════════════════════════════════════════════════════════════
☐ Two isolated tables booted; service owns DDL constants; imports nothing DNA-related.
☐ Owner-only PUT, owner/admin GET routes, req.venueId-scoped, concept_ref required+validated.
☐ Audit-first write ordering with a load-bearing comment; FKs OFF; no transaction.
☐ Idempotent upsert on review.id; immutable snapshot; confidence only lowered (server-enforced).
☐ record_space hard-coded 'concept_draft'; no 'live_venue' write; 'Venue DNA' is inert earmark.
☐ NO confirmed/approved/promoted vocabulary anywhere; NO confirmation_ref column.
☐ NO mergeVenueDna / venue_dna_json / venue_briefs / venue_dna_enrichment / venue_intelligence write.
☐ Panel loads+saves through routes; LOCAL_NOTE flipped; FRAMING_LINE intact; dangle note present.
☐ concept_ref client-minted per thread, component/session state, no localStorage, no registry.
☐ New service test + route tests + regression green; npm run build + hestia:check green.
☐ Branched, committed, not pushed.
```

## END PROMPT

---

## Authoring notes (not part of the prompt)

- Source anchors were verified against the working tree at `7ee4d50`: the service-precedent
  file, panel, signal-format/parser, and `scripts/test-fnb-venue-feedback.js` all exist;
  `package.json` exposes `build` (`vite build`) and `hestia:check` (`node scripts/hestia-check.js`).
- One line-number correction vs. the scope doc: the `server.js` DDL boot `db.exec(...)` block
  starts at **~L362**, not L1189 (the scope doc's "~L1189" predates the current file). The
  additive `ALTER TABLE … review_note` idiom is at **L1192** and the candidate review route is
  at **L6464**, both as the scope doc states. The prompt uses the corrected anchors.
- This prompt is a faithful reduction of the scope doc to a buildable instruction set; if the
  two ever diverge, the scope doc (§0/§2/§3/§10/§13) governs.
