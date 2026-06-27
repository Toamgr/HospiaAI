# HESTIA Owner Meaning Promotion — Read-only Candidate Queue API Contract (Slice 4F.2)

> **Status:** Slice 4F.2 — **docs-only API contract.** No application code, no backend route, no
> frontend UI, no service, no DB migration, no boot-time DDL, no proposal generation, no
> approve/reject/request-revision writer, no `mergeVenueDna` call, no Venue DNA mutation, no change
> to existing capture/read/compose behavior. This document is the **exact read-only API contract**
> a later implementation slice (4G) will build the two GET routes from. It is **not** an
> implementation. If anything here reads as if a route already exists, that is a documentation
> defect — report it, do not act on it.
>
> **Source of truth at authoring time:** `origin/main @ d317b84` — *docs: lock owner meaning
> promotion ddl contract*. HEAD == origin/main, working tree clean. The capture → read → compose
> chain (4D–4E.2) is complete and verified; the promotion layer is **not** started.
>
> **Binding parents (in precedence order — where this contract and a parent differ, the parent
> wins and this file is the bug):**
> 1. `docs/architecture/OWNER_MEANING_PROMOTION_REVIEW_DESIGN.md` (4F) — product/review/promotion
>    **doctrine**; the four-stage boundary; the forbidden/allowed copy lists.
> 2. `docs/architecture/VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_PLAN.md` — the standing decision to
>    DEFER any Venue DNA application; the `mergeVenueDna` safety review.
> 3. `docs/architecture/OWNER_MEANING_PROMOTION_DDL_CONTRACT.md` (4F.1) — exact **table shape,
>    column names, controlled vocabulary, status lifecycle**.
> 4. `docs/architecture/OWNER_MEANING_CAPTURE_DDL_CONTRACT.md` (4C.2) / `OWNER_MEANING_CAPTURE_DESIGN.md`
>    (4A) — the capture layer this API reads *from* but never writes.
>
> **Route precedent (mirror its posture exactly):** the existing owner-meaning capture read routes
> `GET /api/owner-meaning-captures` and `GET /api/owner-meaning-captures/:captureId`
> (`server.js`): `requireAuth('owner')` **plus** an explicit in-handler re-exclusion of the
> platform-admin global bypass (admin → 403); `req.venueId` scoping; list returns
> `{ ok: true, captures, pagination }`; detail returns `{ ok: true, capture, events }`; unknown or
> cross-venue id → identical safe `404 { ok: false, error }`.

---

## 1. Scope and non-goals

This document locks the **read-only** API behavior for the future Owner Meaning Promotion candidate
queue — stages 2–3 (proposal, approval) of the 4F model, **as observed, not as mutated.** It
defines exactly two GET endpoints and nothing else.

**This is a proposed future API only. Explicitly NOT in this slice:**

* **Not implemented yet** — no route exists after this commit.
* **No backend routes added.**
* **No UI added.**
* **No DB migration added** / **no runtime DDL wired.**
* **No service added** (no list/get reader functions are written here).
* **Read-only contract only** — two GETs.
* **No approval.** **No rejection.** **No revision request.** (Those are writer endpoints, a later
  slice.)
* **No Venue DNA mutation.** **No `mergeVenueDna`.** **No application to DNA.**

The two endpoints:

1. `GET /api/owner-meaning-promotion-candidates` — paginated, venue-scoped candidate queue.
2. `GET /api/owner-meaning-promotion-candidates/:candidateId` — a single candidate + its source
   captures + its audit events.

---

## 2. Relationship to 4F and 4F.1 (and precedence)

* **4F** (`OWNER_MEANING_PROMOTION_REVIEW_DESIGN.md`) defined the product/review/promotion doctrine:
  capture → proposal → approval → application, with application blocked.
* **4F.1** (`OWNER_MEANING_PROMOTION_DDL_CONTRACT.md`) locked the table shape:
  `owner_meaning_promotion_candidates` + `owner_meaning_promotion_events`, their columns, controlled
  vocabulary, and status lifecycle.
* **4F.2** (this document) locks the **read-only API behavior**: request contracts, response shapes,
  filtering, errors, pagination, and the read-only side-effect guarantee.

**Future implementation must follow all three.** Precedence when they appear to conflict:

1. **Security / non-mutation doctrine wins** (4F + Phase 7B). If any shape here seems to imply a
   write, application, or cross-venue read, the doctrine overrides it — the shape is the bug.
2. **The DDL contract (4F.1) wins for column names and status/vocabulary.** Where this document's
   *illustrative* JSON differs from 4F.1, 4F.1 is authoritative. Known reconciliations applied here:
   * `record_space` value is **`concept_draft`** (4F.1 §3), **not** `owner_meaning_promotion`.
   * `schema_version` is the **string `owner_meaning_promotion_v1`** (4F.1 §3 col 36), **not** an
     integer `1`.
   * `confidence.label` is **`low` | `medium` only** (4F.1 §6.3) — `high` is **not** produced from
     owner-meaning evidence in 4G; the API must not emit it.
3. **This API contract (4F.2) wins for route shapes** — endpoint paths, query params, response
   envelopes, pagination, and error bodies.

---

## 3. Endpoint: `GET /api/owner-meaning-promotion-candidates`

### 3.1 Request contract

* **Auth:** **owner-only** for now. `requireAuth('owner')` **plus** explicit in-handler admin
  re-exclusion.
* **Admin:** explicitly **blocked / re-excluded** (`req.user.role === 'admin'` → **403**), because
  `requireAuth` has a global admin bypass that must be neutralized in-route (exactly as the capture
  read routes do). Whether admin ever gets read access is OPEN (§14); default **blocked**.
* **Managers / bar managers:** **blocked** at `requireAuth('owner')` → 403.
* **Unauthenticated:** **blocked** → 401 (at `requireAuth`).
* **Venue scope:** the **server-resolved `req.venueId` only.** The client **cannot supply
  `venue_id`** (a body/query `venue_id` is ignored; it never widens scope).

#### Query params

| Param | Type | Default | Behavior |
|---|---|---|---|
| `limit` | int | **25** | Clamped to **[1, 100]**. Invalid / non-finite / `< 1` → default 25; `> 100` → clamped **down** to 100 (never widened). Mirrors `clampListLimit`. |
| `offset` | int | **0** | Invalid / negative / non-finite → **0**. Mirrors `clampListOffset`. |
| `status` | enum | none | Optional filter; must be a member of the §5 allowed candidate statuses. **Invalid value → 400** (see justification). |
| `target_path` | string | none | Optional exact-match filter on `proposed_target_path`. Must be a member of the server allow-list (4F.1 §6.2). Invalid value → 400 (allow-listed). |
| `confidence_label` | enum | none | Optional filter; `low` \| `medium` only. **Invalid value → 400.** |
| `include_counts` | bool | **true** | When true (default), the response includes the per-status `counts` object. Cheap single grouped query; see §11. |
| `include_source_preview` | bool | **true** | When true (default), each row's `evidence.source_preview` is populated with **short, labeled excerpts** (see justification + §8). When false, `source_preview` is `[]` and only counts/fingerprints are returned. |

**Invalid-query behavior (locked choices + justification):**

* **`limit` / `offset`** — **clamp/default safely, never 400.** Pagination bounds are operational,
  not security; a clumsy client should get a safe page, not an error. (Matches the capture list.)
* **`status` invalid value → 400** (not silently ignored). Justification: the status vocabulary is
  **closed and known to the client**; silently returning *all* rows for a typo'd `status=approvd`
  would misrepresent the queue (the owner could think nothing is approved). A precise 400 is safer
  than a misleading 200.
* **`confidence_label` invalid value → 400.** Same reasoning: a closed two-value vocabulary; a typo
  must not silently widen the result set.
* **`target_path` invalid value → 400** (allow-listed). An unknown path is not a real DNA target;
  returning everything would be misleading.
* **Unknown param *keys* (e.g. `?venue_id=`, `?foo=`) are ignored** and **must never widen access**
  or change venue scope. Ignoring an unknown *key* is safe; rejecting an unknown *value* for a known
  *filter* is the precise rule. A supplied `venue_id` key is ignored, not honored.

### 3.2 Response shape (`200`)

An **object, never a bare array.** (Bare arrays are forbidden — they prevent adding envelope fields
and invite client-side scope assumptions.)

```jsonc
{
  "ok": true,
  "candidates": [
    {
      "id": "…",
      "created_at": "…",
      "updated_at": "…",
      "status": "needs_owner_review",
      "status_reason": null,
      "proposed_target_path": "owner_notes",
      "proposed_target_label": "Owner notes",
      "proposed_meaning_summary": "Proposed reading of the owner's words (NOT confirmed).",
      "proposed_value_preview": "…short preview of proposed_value_json…",
      "proposal_rationale": "Why HESTIA drew this from the cited captures.",
      "confidence": {
        "label": "low",            // low | medium ONLY (never high in 4G)
        "score": null,             // internal-only; ALWAYS null in this contract (§10)
        "factors": {               // confidence_factors_json — the reasons, not decoration
          "evidence_count": 2,
          "recency": "most_recent_2026-06-25",
          "consistency": "consistent",
          "source_type": "owner_response",
          "contradictions": [],
          "missing_fields": ["no weekend corroboration"]
        }
      },
      "evidence": {
        "source_capture_count": 2,
        "source_capture_fingerprints": ["…", "…"],
        "source_preview": [        // EXCERPTS ONLY (≤160 chars), present when include_source_preview=true
          {
            "capture_id": "…",
            "created_at": "…",
            "owner_response_excerpt": "First 160 chars of the owner's words…",
            "is_excerpt": true,
            "question_text": "The question HESTIA asked."
          }
        ]
      },
      "review": {
        "reviewed_at": null,
        "reviewed_by_user_id": null,
        "owner_decision_note": null
      },
      "application": {
        "applied_at": null,
        "dna_application_ref": null,
        "blocked": true,
        "block_reason": "Venue DNA application is not enabled in this contract."
      }
    }
  ],
  "pagination": { "limit": 25, "offset": 0, "count": 1, "has_more": false },
  "counts": {
    "draft_suggestion": 0,
    "needs_owner_review": 1,
    "owner_approved": 0,
    "owner_rejected": 0,
    "revision_requested": 0,
    "superseded": 0,
    "expired": 0,
    "application_blocked": 0
  }
}
```

**Precision rules for the list:**

* **`confidence.score` is `null`** in this contract — the internal numeric is **never surfaced as a
  user-facing number** (4F.1 §6.3). The primary confidence value is `confidence.label`; the reasons
  are `confidence.factors`.
* **`owner_response` appears only as a short, labeled excerpt** (`owner_response_excerpt`,
  `is_excerpt: true`) in the list — **never** the full raw text. Full source evidence belongs to the
  **detail** endpoint (§4). Excerpts are **never rewritten or summarized**; they are a verbatim
  prefix of `owner_response_raw`, truncated at a fixed length (recommended ≤ 160 chars) with
  truncation made explicit.
* **`include_source_preview` default = `true`** (locked). Justification: the queue's job is to let
  the owner judge a proposal at a glance, and the evidence behind it is the most important context;
  short labeled excerpts deliver that cheaply. It is a default, not a mandate — a lighter client can
  pass `false`. (Listed as OPEN §14 in case product prefers `false`.)
* **`application.blocked` is always `true`** here; the owner sees that nothing is applied.

---

## 4. Endpoint: `GET /api/owner-meaning-promotion-candidates/:candidateId`

### 4.1 Request contract

* **Auth:** **owner-only.** `requireAuth('owner')` + in-handler admin re-exclusion (admin → 403).
* **Managers / bar managers:** blocked → 403. **Unauthenticated:** 401.
* **Venue scope:** server-resolved `req.venueId` only; **no client-supplied `venue_id`.**
* **Cross-venue candidate id → safe 404.** **Unknown candidate id → the same safe 404.** The two
  cases are **indistinguishable** (no existence leak), exactly like the capture detail route.

### 4.2 Response shape (`200`)

```jsonc
{
  "ok": true,
  "candidate": {
    "id": "…",
    // venue_id is OMITTED from the response (see §4.3 + §14) — it is an access boundary, not data.
    "record_space": "concept_draft",          // 4F.1 value (NOT "owner_meaning_promotion")
    "status": "needs_owner_review",
    "status_reason": null,
    "created_at": "…",
    "updated_at": "…",
    "proposed_target_path": "owner_notes",
    "proposed_target_label": "Owner notes",
    "current_value_snapshot_json": { /* the BEFORE: current DNA value at proposal time (historical) */ },
    "proposed_value_json": { /* the AFTER (bounded to the one field) */ },
    "proposed_meaning_summary": "Proposed reading (NOT confirmed).",
    "proposed_dna_patch_json": { /* bounded single-field delta — PROPOSED, not applied */ },
    "proposal_rationale": "…",
    "confidence": {
      "label": "medium",                       // low | medium only
      "score": null,                           // internal-only; null in response
      "factors": { "evidence_count": 2, "recency": "…", "consistency": "consistent", "source_type": "owner_response" },
      "contradictions": [],                    // contradictions_json
      "missing_evidence": ["…"]                // missing_evidence_json
    },
    "impact_note": "Which specialists read this DNA field.",
    "review": { "reviewed_at": null, "reviewed_by_user_id": null, "owner_decision_note": null,
                "approved_at": null, "rejected_at": null },
    "application": {
      "applied_at": null,
      "applied_by_user_id": null,
      "dna_application_ref": null,
      "blocked": true,
      "block_reason": "Venue DNA application is reserved for a future reviewed implementation."
    },
    "superseded_by_candidate_id": null,
    "candidate_fingerprint": "…",
    "schema_version": "owner_meaning_promotion_v1"   // 4F.1 string value (NOT integer 1)
  },
  "source_captures": [
    {
      "id": "…",
      "created_at": "…",
      "owner_response_raw": "…full verbatim owner words, byte-for-byte, NEVER rewritten…",
      "question_text": "…",
      "question_reason": "…",
      "candidate_snapshot_json": { /* the capture-time candidate snapshot — proposal context, NOT DNA */ },
      "candidate_fingerprint": "…",
      "event_count": 1
    }
  ],
  "events": [
    {
      "id": "…",
      "event_type": "candidate_created",
      "created_at": "…",
      "actor_type": "system",
      "actor_role": null,
      "previous_status": null,
      "next_status": "draft_suggestion",
      "target_path": "owner_notes",
      "event_payload_json": { /* … */ }
    }
  ],
  "allowed_actions": {
    "approve": false,
    "reject": false,
    "request_revision": false,
    "apply_to_dna": false
  }
}
```

### 4.3 Precision rules for the detail

* **`allowed_actions` are ALL `false`** in this read-only contract. They are a **forward-declared,
  read-only hint** so the future UI knows which controls *will* exist — they do **not** imply any
  writer exists today. A later writer slice may flip these to reflect real owner-only capability,
  but never to `true` in 4F.2.
* **No writer is implied.** The detail is observational only.
* **Application is blocked** — `application.blocked: true`, all `applied_*` / `dna_application_ref`
  null.
* **Source captures are evidence, not truth** — `owner_response_raw` is the owner's words, returned
  **verbatim and unmodified**; it is not confirmed identity.
* **`candidate_snapshot_json` is proposal context, not confirmed Venue DNA** — it is what HESTIA
  showed at capture time, frozen; it asserts nothing about DNA.
* **`venue_id` is omitted** from the response (locked choice — see §4.4). Justification: `venue_id`
  is purely the server-resolved access boundary (always equal to `req.venueId`); echoing it back
  adds no information the client lacks and slightly increases the chance a UI reasons about venues
  it shouldn't. Omitting it is a small tightening over the capture precedent (which does echo it).
  Listed as OPEN (§14) in case product wants it echoed for parity.

### 4.4 (reserved)

---

## 5. Status / filter vocabulary (reuse 4F.1 exactly)

### Allowed candidate `status` values (filterable + appear in `counts`)

`draft_suggestion`, `needs_owner_review`, `owner_approved`, `owner_rejected`, `revision_requested`,
`superseded`, `expired`, `application_blocked`.

### Reserved / future status (NOT active)

`applied_to_dna_future` — **reserved and unreachable** (4F.1 §5). In 4F.2:

* It is **not filterable** — a `?status=applied_to_dna_future` request → **400** (it cannot occur,
  so accepting it as a filter would imply it can).
* It **does not appear in `counts`** — including a perpetual `0` for a reserved state would imply
  the state is reachable. If the future application slice ever activates it, that slice adds it to
  the counts vocabulary then, not now.

### Allowed `confidence_label` values

`low`, `medium`. **`high` is not produced** from owner-meaning evidence in 4G and must not be
emitted or accepted as a filter (→ 400).

---

## 6. Error contract

All error bodies are objects of the form `{ "ok": false, "error": "<safe message>" }` (matching the
capture routes). No error body exposes whether a resource exists in another venue.

| Status | When | Body | Existence exposed? | Logging |
|---|---|---|---|---|
| **401** | Unauthenticated (no/invalid session) — at `requireAuth`. | `{ ok:false, error:"Authentication required." }` (route's standard) | No | Standard auth log; no candidate id detail. |
| **403** | Authenticated but role-blocked: admin (re-excluded), manager, bar_manager, any non-owner. | `{ ok:false, error:"Owner Meaning Promotion is owner-only." }` | No | Log actor + role + route; **no** candidate contents. |
| **404** | Unknown candidate id **or** a candidate belonging to another venue — **identical** response. | `{ ok:false, error:"No promotion candidate found for this venue." }` | **No** — the two cases are indistinguishable. | Log venue + id; never reveal foreign-venue existence. |
| **400** | Invalid filter value (`status`, `confidence_label`, `target_path`), or reserved `applied_to_dna_future` filter. | `{ ok:false, error:"<which filter was invalid>" }` | No | Log the rejected param; no row data. |
| **500** | Unexpected failure. | `{ ok:false, error:"Could not read promotion candidates." }` (generic, safe) | No | Log internally; **never** leak SQL, stack, or row contents to the client. |

**No cross-venue leakage** in any error path: a cross-venue id and an unknown id yield the byte-for-byte
same 404; a 403 never depends on whether the candidate exists.

---

## 7. Venue scoping and security

* **Server-resolved venue only** — every query filters on `req.venueId`; the active venue is the
  sole access boundary.
* **No client-supplied `venue_id`** — ignored everywhere; never honored as a filter or subject.
* **Candidate IDs are venue-scoped** — a candidate id is meaningless outside its venue; a foreign id
  → safe 404.
* **Source capture IDs resolved only within the same venue** — `source_capture_ids_json` is resolved
  against `owner_meaning_captures` filtered by the same `req.venueId`; a capture that does not
  resolve in-venue is represented as missing (§8), never fetched cross-venue.
* **Admin global bypass explicitly neutralized** — each route re-excludes admin in-handler
  (`req.user.role === 'admin'` → 403), because `requireAuth`'s bypass would otherwise grant access.
* **Owner-only read for now** — no manager / bar_manager read. Future read-access policy must be an
  explicit, audited decision (§14).
* **No source capture leakage** — captures are only ever resolved and returned within the owner's
  active venue.

---

## 8. Source capture resolution

* **`source_capture_ids_json` resolution** — the detail endpoint resolves each id against
  `owner_meaning_captures` **within `req.venueId`** and returns the verbatim record (id, created_at,
  `owner_response_raw`, `question_text`, `question_reason`, `candidate_snapshot_json`,
  `candidate_fingerprint`, `event_count`).
* **Missing source captures** — if a referenced capture id does not resolve in-venue (deleted,
  superseded out, or never existed in this venue), it is represented as a **placeholder**:
  `{ "id": "…", "missing": true }` — never silently dropped (the count of references stays honest)
  and never fetched from another venue.
* **Cross-venue source capture refs are blocked** — resolution is venue-scoped; a ref that would
  point outside the venue resolves as `missing: true`, not as foreign data.
* **List uses excerpts only** — `owner_response_excerpt` (verbatim prefix, ≤ 160 chars,
  `is_excerpt: true`). **Never** full raw text in the list.
* **Detail may include full `owner_response_raw`** — the complete verbatim words, **byte-for-byte**.
* **Raw text is never rewritten or summarized** in detail — the detail returns exactly what
  `owner_meaning_captures.owner_response_raw` stores (the capture layer already guarantees
  byte-for-byte storage; the read must not transform it).
* **Excerpts are clearly labeled** — `is_excerpt: true` so a UI never mistakes an excerpt for the
  full answer.

---

## 9. Diff shaping

The proposed change is shaped for the future review UI from these fields:

* `current_value_snapshot_json` — the **BEFORE** (current DNA value at proposal time; historical
  snapshot).
* `proposed_value_json` — the **AFTER** (bounded to the one field).
* `proposed_dna_patch_json` — the bounded single-field delta that *would* be applied if application
  were ever permitted.
* `proposed_target_path` / `proposed_target_label` — which field, and its owner-facing label.
* `impact_note` — which specialists read the field.

**The diff is PROPOSED ONLY.** The contract requires the response and any future UI to make this
unambiguous:

* the diff is **not applied**, **not confirmed**, and **no DNA write has occurred**;
* `application.blocked` is `true`;
* the UI should render **"not applied yet"** (4F allowed copy), never "updated" / "confirmed" /
  "HESTIA learned this".

---

## 10. Confidence shaping

* **`confidence.label`** is the **primary user-facing confidence value** — `low` | `medium` only.
* **`confidence.score`** is **internal-only** and is returned as **`null`** in this contract (never a
  user-facing number, meter, percentage, or ring). 4F.1 §6.3 recommends leaving it null in storage
  too; even if a future internal sort key is stored, the API still surfaces `null` here.
* **`confidence.factors`** (`confidence_factors_json`) is the **explanation** — evidence_count,
  recency, consistency, source_type, contradictions, missing_fields. Confidence must explain itself.
* **`confidence.contradictions`** (`contradictions_json`) and **`confidence.missing_evidence`**
  (`missing_evidence_json`) are surfaced honestly (detail endpoint).
* **No decorative confidence, no fake certainty** — no number dressed up as precision, no
  success-green "confirmed" state, no `high` from thin owner-meaning evidence.

---

## 11. Pagination and ordering

* **`limit`** default **25**, max **100** (clamped down, never widened).
* **`offset`** default **0** (negative/invalid → 0).
* **Deterministic order:** **`created_at DESC, id DESC`** (or `rowid DESC` as the secondary) — the
  secondary key breaks same-timestamp ties so the order is stable across calls and reproducible in
  tests (mirrors the capture list's `created_at DESC, rowid DESC`).
* **`pagination.count`** = the number of rows **in this page** (not the grand total).
* **`pagination.has_more`** = `offset + count < total` (there are more rows beyond this page).
* **Total count:** computed **internally** (a `COUNT(*)` for the venue+filters) to power `has_more`
  and the `counts` object, but **not surfaced as a top-level `total`** field. Justification: the
  owner-facing queue needs "are there more?" (`has_more`) and the per-status `counts`, not a raw
  grand total; omitting a separate `total` keeps the envelope lean and avoids implying pagination
  math the client must do. (If a future UI needs an explicit `total`, add it then — OPEN §14.)
* **`counts`** (per-status) is included when `include_counts` is true (default true) — a single
  `GROUP BY status` over the venue's candidates, reflecting the §5 allowed (non-reserved) statuses.

---

## 12. Read-only side-effect guarantee (binding)

Both GET routes **must be pure reads.** They:

* **perform no writes** (no INSERT/UPDATE/DELETE to any table);
* **create no events** — in particular, **`owner_review_opened` must NOT be emitted from a GET** in
  this contract (keep GET pure). If review-open telemetry is ever wanted, it is a **separate,
  explicit writer** (e.g. a future `POST …/opened`), never a side effect of reading;
* **change no status** (no `needs_owner_review` → anything);
* **generate no candidates** (reading the queue never drafts a proposal);
* **mutate no Venue DNA** and **call no `mergeVenueDna`**;
* **do not refresh candidate confidence** (reading never re-derives or rewrites
  `confidence_*` / derived fields);
* **do not mark reviewed / opened / approved** anything.

> A GET that writes — even "just an opened event" — is a contract violation. The queue can be read
> any number of times with zero state change.

---

## 13. Future implementation test contract

These tests **ship in the same slice as the read routes** (4G). They mirror the
`test:owner-meaning-capture-read-route-*` posture and register as
`scripts/test-owner-meaning-promotion-read-*` npm scripts.

* **owner can list** — owner GET list → 200, object envelope.
* **owner can detail** — owner GET detail → 200 with `candidate` + `source_captures` + `events`.
* **admin blocked** — admin GET list/detail → 403 (re-excluded), zero data returned.
* **manager / bar_manager blocked** — → 403.
* **unauthenticated blocked** — → 401.
* **no `venue_id` accepted** — a `?venue_id=other` (or body) is ignored; results stay in the active
  venue.
* **cross-venue list/detail leak impossible** — a foreign candidate id → safe 404 identical to an
  unknown id; list never returns another venue's candidates.
* **invalid filters safe** — invalid `status` / `confidence_label` / `target_path` → 400; invalid
  `limit`/`offset` clamp/default (no 400); unknown param keys ignored without widening.
* **pagination clamps** — `limit > 100` → 100; `limit < 1` / invalid → 25; negative `offset` → 0;
  `has_more` correct.
* **list returns an object, not a bare array** — top-level is `{ ok, candidates, pagination, counts }`.
* **detail includes source captures and events** — both arrays present and venue-scoped.
* **list uses excerpts, detail preserves raw** — list returns `owner_response_excerpt`
  (`is_excerpt: true`, ≤ 160 chars); detail returns full `owner_response_raw` byte-for-byte.
* **GET creates zero events / writes** — event + candidate row counts are identical before and after
  any number of GETs; **no `owner_review_opened`** is emitted.
* **GET does not call `mergeVenueDna`** — source-level guard on the read service.
* **GET does not mutate Venue DNA** — `venue_dna_json` unchanged by any read.
* **reserved application fields remain blocked** — `application.blocked: true`, `applied_*` null;
  `applied_to_dna_future` is not filterable (→ 400) and not in `counts`.
* **`allowed_actions` are all false / read-only** — detail never reports `true`.
* **confidence score not surfaced as a decorative number** — `confidence.score` is `null`;
  `confidence.label` ∈ {`low`,`medium`}.
* **proposed diff marked not applied** — `application.blocked: true`; no "applied/confirmed"
  language anywhere in the payload.

---

## 14. Open decisions (do NOT resolve silently)

| # | Open question | Recommended default (this contract) |
|---|---|---|
| 1 | Should admin ever get read-only access to the queue? | **No** — admin blocked, matching the capture read routes. Revisit only with an explicit, audited policy. |
| 2 | Should `include_source_preview` default true or false? | **True** (short labeled excerpts) — the queue is more useful at a glance; lighter clients can pass `false`. |
| 3 | Should `counts` always be included? | **Yes** by default (`include_counts=true`) — one cheap `GROUP BY`; disableable. |
| 4 | Should `confidence_score` be omitted entirely vs `null`? | **`null`** (key present, value null) for shape stability; never a number. |
| 5 | Should `target_path` filters be allow-listed? | **Yes** — allow-listed (4F.1 §6.2); an unknown path → 400. |
| 6 | Should detail expose `venue_id` or omit it? | **Omit** — it is an access boundary, not data. |
| 7 | Should GET detail create an `owner_review_opened` event later via an explicit POST instead? | **Yes, via explicit POST** — never as a GET side effect (§12). |
| 8 | Should source capture raw text ever be redacted? | **Not by default** — owner reading their own words in their own venue; redaction would be a separate, explicit policy. |

### Recommendation for the next slice (after 4F.2)

**4G.0 — a narrow implementation plan for the DDL + read-only queue service/routes only.** It should
sequence: the two-table DDL + boot wiring (4F.1), a deterministic read service
(`listOwnerMeaningPromotionCandidates` / `getOwnerMeaningPromotionCandidateById`), and the two GET
routes in this contract — **with the §13 tests in the same commit.** **No** approval writer, **no**
proposal generation, **no** DNA application yet.

---

## Final principle (restated)

> The promotion queue can be **read** — by the owner, within their venue, with admin and managers
> blocked — without changing a single byte of state. A read shows *proposed* changes, *referenced*
> (never rewritten) owner evidence, and *blocked* application. No GET writes, no GET applies, and no
> `allowed_actions` is ever `true` in this contract. HESTIA may show the proposal; only a future,
> separately-reviewed writer — and only the owner — may ever act on it.
