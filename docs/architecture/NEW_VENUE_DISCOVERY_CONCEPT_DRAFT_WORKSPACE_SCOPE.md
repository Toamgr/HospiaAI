# New Venue Discovery — Concept Draft Workspace / Concept Thread Persistence (Design / Spec)

> **Status: DESIGN / SPEC — DOCS-ONLY. No code, no DB tables, no migrations, no routes, no UI, no localStorage, no concept registry implementation, no Venue DNA contact, no `mergeVenueDna`, no 9D, no confirmation / approval / promotion / confirmed status, no AI-prompt or generation changes in this document.** This is the design step that follows the shipped Fidelity Review Persistence (Slice 1). It scopes the *next* layer only as a plan: how an owner can **return to saved concept drafts and their saved fidelity reviews** without ever confirming Venue DNA.
> Created: 2026-06-25.
> Governing plan lineage (reuse, do not contradict): [NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md](./NEW_VENUE_DISCOVERY_CANDIDATE_REVIEW_DESIGN.md) (fidelity vs identity, self-approval, §14 draft/concept space decision), [NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_PERSISTENCE_PLAN.md](./NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_PERSISTENCE_PLAN.md), [NEW_VENUE_DISCOVERY_PERSISTENCE_SCOPING_RESOLUTION.md](./NEW_VENUE_DISCOVERY_PERSISTENCE_SCOPING_RESOLUTION.md) (the `venue_id` / `concept_ref` / `record_space` triple-key doctrine), [NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_IMPLEMENTATION_SCOPE.md](./NEW_VENUE_DISCOVERY_FIDELITY_REVIEW_IMPLEMENTATION_SCOPE.md) (§13 `concept_ref` client lifecycle).
> Governing doctrine: [VENUE_MEMORY_AND_DNA_GUARDRAILS.md](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) (three layers, cardinal rule, required-on-every-write fields).
> Source code grounded in (the shipped Slice 1): `src/services/venueIntelligence/discoveryCandidateReviewService.js`, `src/features/owner-intelligence/CandidateReviewPanel.jsx`, `src/features/owner-intelligence/OwnerAIHome.jsx` (~L186–L217, the `concept_ref` mint + reload), `server.js` (DDL boot ~L1204–L1205; discovery-review routes ~L6503–L6564).

---

## 0. Hard doctrine (restated, non-negotiable, governs everything below)

Inherited verbatim from the whole discovery program; nothing here may weaken it:

- **Fidelity ≠ identity.** A saved concept draft is **Venue Memory** ("HESTIA captured what I meant, in a draft concept"). It is **never** confirmed **Venue DNA**.
- **The triple-key separation is sacred:** `venue_id` = access/security boundary only; `concept_ref` = the draft/concept thread identity; `record_space` = `'concept_draft'` (server-hard-coded, the only value this surface writes).
- **A concept draft must not become the live venue's confirmed identity.** Saved concept draft ≠ confirmed Venue DNA.
- **The single owner-conversation → `mergeVenueDna` path stays the only writer of canonical Venue DNA.** This layer adds no second writer, no `/promote`, no `/confirm`, no `confirmed`/`approved`/`promoted` vocabulary, no `confirmation_ref`.
- **No 9D**, no corroboration engine, no second-party confirmation in this layer.
- **The stored vocabulary makes confirmation impossible to express** (vocabulary, not vigilance). This layer must preserve that property.

If any line of the eventual build contradicts §0, the build is wrong — stop and re-scope.

---

## 1. Product purpose

### 1.1 The problem this solves (the Slice 1 re-entry gap)
Slice 1 shipped a **persistence asymmetry**, on purpose. Reviews are written durably into `discovery_candidate_reviews`, keyed by `concept_ref`. But `concept_ref` is **client-minted once per page load and never persisted** ([OwnerAIHome.jsx](../../src/features/owner-intelligence/OwnerAIHome.jsx#L192): `useState(() => crypto.randomUUID())`, no `localStorage`, no registry — by §13 of the implementation scope). On a hard refresh, `OwnerAIHome` mints a **new** `concept_ref` and calls `GET /api/discovery-reviews?concept_ref=<new>`, which returns nothing. The previously saved rows still exist in the DB — readable by their *old* `concept_ref` — but the UI has **no way to rediscover that id**.

Net effect today: **saved reviews are durable but orphaned.** The data survives; the owner's path back to it does not. The panel says this out loud ([CandidateReviewPanel.jsx:565](../../src/features/owner-intelligence/CandidateReviewPanel.jsx#L565)): *"This is a temporary draft thread … this on-screen thread won't reappear after a refresh."*

The **Concept Draft Workspace** closes that gap: it gives the owner a durable, honest way to **see** their saved concept drafts and **re-open** one to continue triaging its saved fidelity reviews — without minting venue identity, and without any path to confirmed Venue DNA.

### 1.2 Who uses it
- **Primary: the owner** (the chat-first `ownerHome` persona). Discovery and concept exploration are the owner's product surface.
- **Secondary: admin** — **read-only**, technical support, exactly as in Slice 1 (`GET` owner/admin, `PUT` owner-only; admin re-excluded at [server.js:6538](../../server.js#L6538)). Admin never authors or edits owner concept intent.
- No other role. Managers, F&B/events directors, chefs, employees do not see concept drafts.

### 1.3 What the owner should be able to *see*
- A **list of their saved concept drafts** (each draft = one `concept_ref` thread that has ≥1 saved fidelity review), within the current venue's access boundary.
- For each draft: a truthful, non-fabricated **label** (derived from saved signal snapshots, never an invented venue name), how many signals were reviewed, the spread of review actions (captured / edited / held / rejected), and when it was last touched.
- A **detail view** of one draft: its saved fidelity-review cards, reconstructed from the immutable snapshots — the same `CandidateReviewPanel` cards, in their saved state.
- A persistent, non-removable reminder that this is **Memory (concept draft), not confirmed Venue DNA**.

### 1.4 What the owner should be able to *continue later*
- **Re-open** a saved draft and resume fidelity triage: change a `captured` to `held`, revise an owner edit, re-route a destination — all the existing Slice 1 actions, now reachable after a refresh / new session / new device.
- Nothing more. The workspace **adds no new verbs.** It re-binds the owner to the saved reviews they already created; it does not introduce confirmation, promotion, or any DNA action.

---

## 2. Data model proposal — design only

### 2.1 Is a `concept_drafts` table needed? — **Not for the first build.** Derive first.
The cheapest, safest re-entry mechanism needs **zero new tables.** Every saved review row already carries `venue_id`, `concept_ref`, `record_space`, `created_at`, `updated_at`, and an immutable `candidate_snapshot_json`. A concept-draft list is therefore a **pure read-side aggregation** over `discovery_candidate_reviews`:

```
-- DESIGN SHAPE ONLY — illustrative, NOT DDL, NOT to ship from this doc
SELECT concept_ref,
       COUNT(*)            AS reviewed_signals,
       MIN(created_at)     AS first_saved_at,
       MAX(updated_at)     AS last_touched_at
FROM   discovery_candidate_reviews
WHERE  venue_id = ?              -- access boundary (req.venueId)
  AND  record_space = 'concept_draft'   -- conflation guard (never 'live_venue')
GROUP BY concept_ref
ORDER BY last_touched_at DESC
```

This yields the workspace list with **no new writer, no new state, no new identity store** — it is the same isolation posture Slice 1 already enforces, read back a different way. The list's per-draft label is derived from the saved snapshots (the highest-confidence `captured` signal, or a neutral "Concept draft · {first_saved_at}" fallback) — **never** a fabricated venue name (§5.6, §10).

**Recommended sequencing:** build the workspace as a derive-only read surface first (Slice 2a). Introduce a dedicated `concept_drafts` table **only** if and when a real need appears that aggregation cannot honestly serve — see §2.2.

### 2.2 If a `concept_drafts` table is later needed — what it would hold
A dedicated registry becomes justified only when the workspace must support things aggregation cannot:
- a **human-authored title** for a concept (so a draft is more than a UUID + derived label);
- a draft that exists **before any review is saved** (aggregation only "sees" a concept once it has ≥1 saved review);
- explicit **ordering / last-opened** metadata distinct from review timestamps;
- a soft **archive** flag (§6.6).

Design shape **if/when** that slice is approved (still design-only; not this doc):

```
-- DESIGN SHAPE ONLY — NOT DDL, deferred to a later, separately-approved slice
concept_drafts (
  concept_ref     TEXT PRIMARY KEY,   -- the SAME minted UUID; NOT a venue id
  venue_id        TEXT NOT NULL,      -- ACCESS BOUNDARY ONLY (never the subject)
  record_space    TEXT NOT NULL DEFAULT 'concept_draft',  -- server-hard-coded
  title           TEXT,               -- owner-authored label; NEVER a confirmed venue name
  status          TEXT NOT NULL DEFAULT 'draft',  -- 'draft' ONLY; NO 'confirmed'/'promoted' (§8)
  archived        INTEGER NOT NULL DEFAULT 0,      -- soft archive, never hard delete (§6.6)
  created_by      TEXT,
  created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at      TEXT DEFAULT CURRENT_TIMESTAMP
  -- NO confirmation_ref. NO confirmed enum. NO DNA pointer. NO promotion column.
);
```

`status` would carry a **single** legal value (`'draft'`). It exists for honesty/forward-shape, **not** to host a confirmation ladder — there is deliberately no `confirmed`, no `promoted`, no `live` value, mirroring the Slice 1 "vocabulary, not vigilance" principle.

### 2.3 How it relates to `discovery_candidate_reviews`
- **One concept draft → many reviews.** `concept_drafts.concept_ref` (or, in the derive-first build, a `DISTINCT concept_ref`) is the parent key; `discovery_candidate_reviews.concept_ref` is the child grouping. The relationship is a **logical reference**, not a DB-enforced FK (consistent with Slice 1's logical-ref / no-`PRAGMA foreign_keys` posture).
- The reviews remain the **source of truth for review content**; the registry (if built) holds only **thread-level metadata** (title, archive, ordering). The registry never duplicates or rewrites snapshot content.
- The append-only `discovery_candidate_review_events` audit is unchanged and untouched by this layer.

### 2.4 Does `concept_ref` remain the primary thread identity? — **Yes.**
`concept_ref` is, and remains, the **draft/concept thread identity** for the entire discovery program. The workspace does not introduce a new identity; it makes the existing `concept_ref` **rediscoverable** (today it is unrediscoverable because it is never persisted on the client and never listed). Whether derived-only or registry-backed, `concept_ref` stays the join key, the readback key, and the re-open key.

### 2.5 The difference between `concept_ref`, `venue_id`, and `record_space` (the load-bearing distinction)
Carried verbatim from the persistence scoping resolution (§3.1). **Conflating any two of these is the bug.**

| Field | Value | Meaning | Doctrine role |
|---|---|---|---|
| `venue_id` | `req.venueId` | **Access/security boundary only** — *which operator account may read/write this row.* It is **not** a claim that the concept *is* that venue. | Every read/write is `req.venueId`-scoped; `defaultVenueId()` is never called in a handler. |
| `concept_ref` | minted UUID | **The draft/concept thread identity** — the logical grouping of one discovery exploration's reviews. Not a venue. Not derived from `venue_id`, message index, or message text. | The subject of the record. The re-open / readback key. |
| `record_space` | `'concept_draft'` (only) | **Epistemic class** — declares the row is a *concept draft*, never live-venue truth. Server-hard-coded; `'live_venue'` is never written here. | The structural guard against conflation. |

**The reframe that the whole workspace depends on:** `venue_id` is the *operator boundary*, the *subject* is the *concept* (`concept_ref`), explicitly flagged as a *draft* (`record_space`). A draft can share venue X's access boundary while being unambiguously **not about venue X's live identity**.

---

## 3. Scoping doctrine

Binding, unchanged from the resolution doc, re-affirmed for this layer:

1. **`venue_id` remains the access/security boundary only.** It scopes who may read/write a draft. It never asserts that the draft *is* that venue. Never `defaultVenueId()` in a handler; a foreign `venue_id` → 404, never a foreign read/write.
2. **`concept_ref` remains the draft/concept identity.** It is the thread key the workspace lists and re-opens. It is never a venue id and must never reach `resolveVenueId` (it would correctly 403 — concepts are not access boundaries).
3. **`record_space` remains `'concept_draft'`.** The workspace reads only `record_space = 'concept_draft'` rows and (if a registry is ever built) writes only `'concept_draft'`. `'live_venue'` is reserved for a future, separate, explicitly-designated path and is **out of scope**.
4. **A concept draft must not become the live venue's confirmed identity.** There is no path in this layer from a draft to `venue_dna_json` / `venue_intelligence` / `venue_briefs` / `venue_dna_enrichment` / `mergeVenueDna`.
5. **Saved concept draft ≠ confirmed Venue DNA.** The workspace surfaces saved *Memory*; it never surfaces, implies, or produces confirmed *DNA*.
6. **Conflation guard (binding invariant):** any consumer that treats a row as describing the live venue MUST filter `record_space = 'live_venue'` — which this surface never writes — so no concept draft can ever be read as live-venue truth, even though it shares the venue's access boundary.

---

## 4. Lifecycle

### 4.1 When is a concept draft *created*?
Conceptually, a draft begins when the owner starts a New Venue Discovery exploration in `OwnerAIHome`. **Durably**, in the derive-first build, a draft becomes *real and listable* only at the **first saved fidelity review** for its `concept_ref` (that is the first row written to `discovery_candidate_reviews`). Before any save, the draft is purely an in-session intent with no durable footprint — exactly the Slice 1 posture.

### 4.2 When is `concept_ref` minted?
Unchanged from Slice 1 §13: **client-minted once per discovery thread**, held in React/session state, minted on first need for that thread. Not derived from `venue_id`, message index, or message text. No `localStorage`. No registry write at mint time. **Minting is free; durability happens only at save.**

### 4.3 What happens before first save?
Nothing durable. No DB row, no registry entry, no listable draft. A pre-save refresh mints a new `concept_ref` and the prior unsaved choices are gone — **acceptable, because nothing durable was orphaned** (the choices were never saved). This is the established, honest MVP behavior and the workspace does **not** change it.

### 4.4 What happens after the first saved review?
A durable `discovery_candidate_reviews` row now exists under `(venue_id, concept_ref, record_space='concept_draft')`. From this point the draft is **listable in the workspace** (derive-first: it appears in the aggregation; registry-backed: a `concept_drafts` row would be upserted on first save). The owner's saved reviews are now **rediscoverable** — the gap Slice 1 left open is closed.

### 4.5 What happens on refresh?
- **Today (Slice 1):** a new `concept_ref` is minted; saved rows for the old ref are orphaned (unreachable from the UI).
- **With the workspace:** refresh still mints a new *active* `concept_ref` for any *new* exploration, **but** the owner can now open the workspace, see their previously saved drafts (listed by their stored `concept_ref`), and **re-open** one — which sets the active `concept_ref` to that stored value and loads its reviews via the existing `GET /api/discovery-reviews?concept_ref=…`. The re-open path is the entire fix: it re-binds the UI to a stored `concept_ref` the owner explicitly selects, rather than relying on the client to remember it.

### 4.6 What happens when the owner starts a *new* concept?
A fresh `concept_ref` is minted for the new thread (client-side, as today). The new thread is independent; it does not inherit, merge with, or overwrite any prior draft. Each `concept_ref` is its own isolated grouping.

### 4.7 What happens when the owner switches venue?
The workspace is **strictly `venue_id`-scoped.** Switching venue (`X-HESTIA-Venue` → a different `req.venueId`) shows **only that venue's** concept drafts. A draft created under venue A is never visible under venue B (admin's all-venue read aside, and even that stays read-only). A `concept_ref` is only ever readable within the `venue_id` that owns it. This is the **venue-switch leakage** guard (§10).

---

## 5. UI proposal

### 5.1 Where should the workspace live? — options evaluated

| Option | Verdict | Reasoning |
|---|---|---|
| **A. Inside `OwnerAIHome`** (e.g. a collapsible "Your concept drafts" list at the top of the discovery surface) | **Viable; good as the entry point** | Keeps discovery + drafts in one chat-first surface (owner default landing is `ownerHome`). Low nav weight. Risk: clutter if the list grows; mitigated by collapse-by-default. |
| **B. New Concept Drafts panel** (a dedicated panel *within / adjacent to* `OwnerAIHome`, not a new top-level nav page) | **RECOMMENDED** | A distinct, list-first panel the owner opens from the discovery surface. Clear separation between "drafts I can return to" and the live chat, while staying inside the owner's home. Easy to make visually and semantically distinct from any live Venue DNA / Venue Intelligence surface. |
| **C. Venue Intelligence sub-tab** | **Rejected for now** | Dangerous adjacency: placing concept *drafts* beside live Venue *Intelligence* invites the exact conflation the doctrine guards against (draft read as live-venue truth). Only reconsider once the visual/semantic separation is proven elsewhere. |
| **D. Separate Draft Concepts page** (top-level nav) | **Deferred** | Heavier than the need. Fragments the chat-first owner experience and adds nav surface for what is still a small, early capability. Revisit only if drafts become numerous and first-class enough to warrant their own destination. |

**Recommendation: B — a dedicated Concept Drafts panel surfaced from within `OwnerAIHome`**, opened on demand (e.g. a "Your concept drafts" affordance near the discovery composer). It reuses Palette B (Editorial Light) to match the host, never mixes palettes, and is explicitly *not* a Venue DNA / Venue Intelligence surface.

### 5.2 What the list should show
For each concept draft (one `concept_ref`):
- a **derived, truthful label** (highest-confidence `captured` signal preview, or "Concept draft · {first_saved_at}") — **never** a fabricated venue name;
- **reviewed-signals count** and a compact action breakdown (e.g. "3 captured · 1 held · 1 rejected");
- **last touched** date;
- a quiet, persistent **"Memory · concept draft — not Venue DNA"** tag.
No completion meter, no "X% to DNA", no celebratory state.

### 5.3 What a detail view should show
- The draft's saved fidelity-review **cards**, reconstructed from the immutable snapshots — i.e. the existing `CandidateReviewPanel` cards in their saved state (the panel already renders from `savedByConvRef`).
- The mandatory, non-removable `FRAMING_LINE` ("Captured, not confirmed…") and the Slice 1 Memory note.
- The **dangling-snapshot honesty note** when the source conversation no longer resolves (already implemented at [CandidateReviewPanel.jsx:306](../../src/features/owner-intelligence/CandidateReviewPanel.jsx#L306)) — re-opening a draft restores the *saved snapshots*, not the original chat; that is honest and already handled.

### 5.4 How saved fidelity reviews should appear
Exactly as they are saved — `captured | edited | held | rejected`, the chosen destination, the owner-edit overlay, the coverage band, the provenance stamp. The owner can change them using the **existing** Slice 1 actions (which re-bind to the stored `concept_ref` on re-open). **No new action verbs are added.**

### 5.5 How it should explain "Memory, not confirmed Venue DNA"
The workspace must carry, persistently and non-removably:
- the `FRAMING_LINE` ("Captured, not confirmed. These are candidate signals from this conversation, not approved Venue DNA.");
- a list-level and detail-level **"Saved to Memory as concept-draft understanding — not confirmed Venue DNA"** line (consistent with the shipped `LOCAL_NOTE` copy);
- **no** affordance, label, color, icon, or copy that reads as "this is now true / live / confirmed DNA." Any such reading is a defect (§10).

### 5.6 Truthfulness constraints on derived labels
A `concept_ref` is a UUID; the workspace needs a human-readable label, but it must be **derived, not invented**. Allowed: a preview of a saved signal snapshot, or a date-stamped neutral label. **Forbidden:** synthesizing a venue name, implying the concept is a real/named venue, or presenting a derived label as a confirmed identity. The label is a wayfinding aid, not an identity claim.

---

## 6. Read / write boundaries

| Concern | Boundary |
|---|---|
| **Read-only** | The concept-draft **list** (aggregation or registry read) and the **review content** (snapshots) are read-only projections. The derive-first build is **entirely read-only** — it adds no writer at all. |
| **Owner-writable** | The existing Slice 1 fidelity-review writes (`PUT /api/discovery-reviews/:reviewId`, owner-only). Re-opening a draft lets the owner write *those* — nothing new. If a `concept_drafts` registry is ever built, owner-writable fields would be limited to `title` and `archived` — **never** any DNA-adjacent field. |
| **Admin read** | Admin may **read** the list and detail (owner/admin GET, exactly like Slice 1's `GET /api/discovery-reviews`). |
| **Can admin create or edit concept drafts?** | **No.** Admin never authors or edits owner concept intent — not the reviews, not a title, not an archive flag. Concept drafts are owner-intent material; admin is technical-support read only. (Slice 1 already re-excludes admin from the write path at [server.js:6538](../../server.js#L6538); the workspace preserves that exactly.) |
| **Should admin remain read-only?** | **Yes — strictly.** Admin writing into an owner's concept intent is a doctrine violation (§10: "admin writing owner intent"). |
| **Archive vs delete** | **Archive, never hard-delete.** A draft (and its reviews) is institutional Memory + an append-only audit; destroying it is destructive and unwound forensics. The workspace should offer (in a later registry-backed slice) a **soft `archived` flag** that hides a draft from the default list while preserving the rows and the audit trail. The derive-first build offers no delete at all. |

---

## 7. Intelligence boundaries

What HESTIA may and may not do with concept drafts:

- **What HESTIA can use from concept drafts (within this layer):** present them back to the owner for re-entry and continued *fidelity* triage. That is the whole job. The workspace is a wayfinding + readback surface, not an intelligence producer.
- **What should feed Venue Memory:** saved fidelity reviews already **are** Venue Memory (that is what Slice 1 writes). The workspace surfaces that Memory; it does not re-classify or upgrade it.
- **What may feed Venue Intelligence as weak / candidate evidence (future, not this slice):** a concept draft *could*, in a later and separately-approved step, be offered as **weak, clearly-labeled, owner-provenance candidate evidence** into Venue Intelligence synthesis — but only with permanent `owner_conversation` / `owner_edit` provenance, never as corroboration, never silently, and never as fact. **Not built here.** This layer does not wire drafts into any intelligence pipeline.
- **What must not feed canonical Venue DNA — yet (or here):** nothing in a concept draft may flow into `venue_dna_json` / `venue_intelligence` / `venue_briefs` / `venue_dna_enrichment`, may call `mergeVenueDna`, or may be treated as confirmed identity. A "Venue DNA"-routed earmark stays the inert boolean it is in Slice 1 (`dna_earmarked`) — a Memory note with structurally no DNA target. The self-approval problem (author = reviewer) is unchanged: a draft is one owner's paraphrase of one conversation; it can be captured (fidelity), never confirmed (identity).

---

## 8. Future 9D boundary

- **How 9D could later reference concept drafts:** when 9D is designed *separately*, it would own its **own** `venue_dna_confirmations` table that references a saved review's `id` (and, by extension, its `concept_ref`) **one-directionally** (9D → review). 9D reads the clean substrate this program built (provenance, evidence type, audit, immutable snapshots) and confirms *from* it under its own governance (corroboration over time, time/turn separation, typed acknowledgement).
- **What must remain deferred:** the entire confirmation tier — the `confirmed` store, the confirm action, corroboration evaluation, any second-party mode, any promotion into canonical DNA.
- **No `confirmation_ref` in this slice** — and not even as a future-only nullable column on the draft/review tables. Its absence makes the dangerous act impossible to express (the Slice 1 stance; the resolution doc §7 omitted it entirely, and this layer keeps it omitted).
- **No `confirmed` enum** anywhere — not on reviews, not on a future `concept_drafts.status` (which carries only `'draft'`).
- **No promotion** path; **no second Venue DNA writer.** The owner-conversation → `mergeVenueDna` path stays the only writer.

---

## 9. Refresh survival options — comparison & recommendation

The core capability the workspace must deliver is **surviving a refresh / new session so saved drafts are reachable.** Options:

| Option | What it is | Pros | Cons / Risks | Verdict |
|---|---|---|---|---|
| **Session-only (current)** | `concept_ref` minted per page load, never persisted ([OwnerAIHome.jsx:192](../../src/features/owner-intelligence/OwnerAIHome.jsx#L192)) | Zero new surface; honest about ephemerality | **Orphans saved reviews on refresh** — the exact gap to close | **Insufficient** — this is the problem |
| **localStorage** | Persist active `concept_ref` in the browser | Survives same-device refresh | Client-only; device/browser-bound; survives logout (leakage risk); **explicitly forbidden by Slice 1 §13** unless separately approved; no cross-device truth; no admin visibility | **Rejected** |
| **URL param with `concept_ref`** | Encode active `concept_ref` in the URL | Deep-linkable; survives that tab's refresh | Fragile (lost if URL not kept); leaks an internal id into history/sharing; gives **no list** of drafts; no discovery for a forgotten id | **Rejected as primary** (acceptable later as a *secondary* deep-link convenience only) |
| **DB-backed `concept_drafts` registry** | A server-side table of concept threads + metadata | Durable, cross-device, venue-scoped, owner-only, admin-readable, supports titles/archive | Adds a new table + a new (small) writer; more surface than strictly needed for pure re-entry | **Recommended later**, when titles / pre-save drafts / archive are genuinely needed |
| **Server-side owner workspace (derive-first)** | A read-only list aggregated from existing `discovery_candidate_reviews`, re-open by selecting a stored `concept_ref` | **Zero new tables, zero new writers**, durable, cross-device, `venue_id`-scoped, owner-only + admin-read, fully inside existing isolation | List only shows concepts with ≥1 saved review; labels are derived (no human titles yet) | **RECOMMENDED FIRST (safest next step)** |

### 9.1 Recommendation (required)
**Build refresh survival as a server-side, read-only Concept Drafts workspace derived from existing `discovery_candidate_reviews` (the "derive-first" path) — zero new tables, zero new writers.** It is the safest next step for HESTIA because:
1. it reuses the data and isolation Slice 1 already shipped, adding **no** new persistence and **no** new writer;
2. it is genuinely durable and **cross-device** (server-side, `venue_id`-scoped) — unlike `localStorage`;
3. it requires **no** new vocabulary, so it cannot regress the "confirmation impossible to express" property;
4. it gives the owner a **list + re-open**, which `localStorage` / URL-param alone cannot;
5. it defers the only real new state (a `concept_drafts` registry with titles/archive) until a concrete need proves it — keeping the first slice minimal and reversible.

**Reject `localStorage`** (forbidden, client-only, device-bound, logout leakage) and **reject URL-param-only** (fragile, no list, id leakage) as the *primary* mechanism. A registry table is the *right* eventual home, but only once titles / pre-save drafts / archive are needed — not in the first re-entry slice.

---

## 10. Risks

Each risk, its failure mode, and the mitigation this design relies on:

1. **Concept draft accidentally treated as live venue DNA.** — A reader joins drafts on `venue_id` and reads them as venue X's truth. *Mitigation:* the triple-key separation + the `record_space = 'concept_draft'` conflation guard (§3.6); the workspace never reads/writes `'live_venue'`; no DNA store is ever touched.
2. **Stale draft shown as current truth.** — An old snapshot is presented as the venue's present state. *Mitigation:* snapshots are explicitly *snapshots-as-reviewed* with a date and the dangling-snapshot note (already shipped); the workspace must never silently re-sync from a changed conversation, and must label drafts as drafts.
3. **Admin writing owner intent.** — Admin edits a review, a title, or an archive flag. *Mitigation:* admin stays strictly read-only (owner-only writes, with the explicit admin re-exclusion already in Slice 1); no admin write path exists in this layer.
4. **Venue-switch leakage.** — A draft from venue A surfaces under venue B. *Mitigation:* every read is `req.venueId`-scoped; `concept_ref` is only readable within its owning `venue_id`; no `defaultVenueId()` in handlers.
5. **`concept_ref` collision / malformed ids.** — A bad or colliding id corrupts the list or re-opens the wrong thread. *Mitigation:* `concept_ref` stays UUID-shaped and server-validated (the service already requires `isUuidLike`); it is treated as an opaque token scoped under `venue_id`; collisions across venues cannot cross the boundary; the workspace never derives meaning from the id.
6. **Refresh survival creating false permanence.** — A durable list makes a draft *feel* like a committed, confirmed thing. *Mitigation:* persistent "Memory · concept draft — not Venue DNA" framing; no confirmation vocabulary; no completion meter; derived labels never read as venue names.
7. **UI making a draft feel confirmed.** — A label, color, badge, or copy reads as "this is now Venue DNA." *Mitigation:* non-removable framing line; Palette B restraint (no success green, no celebratory affordance); explicit truthfulness constraints on labels (§5.6); no confidence-up control; no "promote"/"confirm" affordance anywhere.

---

## 11. Test plan (for the future implementation — defined, not run here)

When this is built, the following must be covered:

- **Concept draft creation / listability** — a saved review makes its `concept_ref` appear in the workspace list; zero saved reviews → not listed (derive-first); aggregation counts and timestamps are correct.
- **Owner-only writes** — only the owner can write reviews (and, if a registry is built, title/archive); non-owner write → denied.
- **Admin read-only** — admin can GET the list/detail; admin write (review, title, archive) → 403; an admin attempt creates **zero** rows / zero audit.
- **Venue scoping** — the list is filtered to `req.venueId`; a cross-venue `concept_ref` is not listed and cannot be re-opened; foreign id → 404.
- **Refresh readback** — after a simulated refresh (new active `concept_ref`), re-opening a stored `concept_ref` loads its saved reviews unchanged; snapshots are byte-stable.
- **Cross-venue isolation** — drafts created under venue A never appear under venue B; venue-switch shows only the switched venue's drafts.
- **No DNA mutation** — the workspace code path imports nothing DNA-related and touches no `venue_dna_json` / `venue_intelligence` / `venue_briefs` / `venue_dna_enrichment`; asserted by absence (the Slice 1 test idiom).
- **No confirmation vocabulary** — no `confirmed` / `approved` / `promoted` value is accepted, stored, or returned; a future `concept_drafts.status` accepts only `'draft'`.
- **No `mergeVenueDna`** — no code path reaches it; asserted by import-absence.
- **No promotion path** — no `/promote`, no `/confirm`, no route taking/writing a DNA payload.
- **UI copy truthfulness** — the framing line and "Memory, not Venue DNA" note are present and non-removable; derived labels never render a fabricated venue name; no "confirmed"/celebratory affordance exists; the dangling-snapshot note appears when the source no longer resolves.
- **Archive (if/when registry-backed)** — archive hides from the default list but preserves rows + audit; un-archive restores; no hard delete.
- **Regression** — the Slice 1 service/route tests and the candidate-signal-format/parser tests stay green, unchanged; `npm run build` + `npm run hestia:check` green.

---

## 12. Not allowed in the first build (explicit)

- **No 9D** — no confirmation tier, no `venue_dna_confirmations`, no confirm action, no corroboration engine, no second-party mode.
- **No confirmed Venue DNA** — no path from a draft to confirmed identity.
- **No candidate-to-DNA promotion** — none, by any route or button.
- **No `mergeVenueDna`** — the workspace calls it nowhere; it imports nothing DNA-related.
- **No second DNA writer** — the owner-conversation → `mergeVenueDna` path stays the only writer.
- **No admin owner-intent writes** — admin is strictly read-only; no admin path creates/edits reviews, titles, or archive flags.
- **No automatic DNA updates** — opening, listing, re-opening, or archiving a draft never writes any DNA store.
- **No fake evidence** — derived labels and previews come only from saved snapshots; the conservative `DEFAULT_EVIDENCE` is preserved verbatim; no fabricated venue names, signals, evidence, confidence, or destinations.
- **No silent conversion of draft to live venue identity** — `record_space` stays `'concept_draft'`; `'live_venue'` is never written; a "Venue DNA" route stays an inert earmark; no draft is ever quietly promoted into the operator's live venue.
- **No `confirmation_ref` column; no `confirmed`/`approved`/`promoted` enum** — the dangerous act remains impossible to express.
- **No `localStorage`; no concept registry implementation in the derive-first first slice** (a `concept_drafts` table is a *later, separately-approved* slice if a concrete need proves it).

---

## 13. What this document explicitly does NOT do

- No code, no DB tables, no migrations, no DDL (the §2.2 shape is *design shape*, not DDL), no routes, no services, no UI implementation, no tests written.
- No `localStorage`, no concept registry implementation.
- No `mergeVenueDna`; no write to any canonical Venue DNA store; no mutation of any live venue's DNA.
- No `confirmed` status, no 9D flow, no corroboration, no promotion, no second writer.
- No change to `venueIntelligenceIntent.js` gating, the `ownerCorrectionLoopFormat.js` / `candidateSignalFormat.js` output contract, the `candidateSignalParser.js` parse contract, the New Venue Discovery generation logic, or any AI prompt.
- No change to the shipped Slice 1 service, routes, or panel behavior.

---

## 14. Recommended next implementation slice

**Slice 2a — Concept Drafts Workspace (derive-first, read-only re-entry).**
A `GET /api/concept-drafts` (or `GET /api/discovery-reviews/concepts`) owner/admin route that returns the venue's concept-draft list by aggregating existing `discovery_candidate_reviews` (`WHERE venue_id = ? AND record_space = 'concept_draft' GROUP BY concept_ref`), plus a Concept Drafts **panel** in `OwnerAIHome` (Option B) that lists drafts and lets the owner **re-open** one — setting the active `concept_ref` so the existing `CandidateReviewPanel` loads its saved reviews. **Zero new tables, zero new writers, zero DNA contact, zero new vocabulary.** Defer the `concept_drafts` registry (titles, pre-save drafts, archive) to a later Slice 2b only if a concrete need proves it.

---

*End of design / spec. No code, schema, tables, migrations, routes, services, prompts, UI, localStorage, or live behavior were changed in producing this document. No concept registry was implemented. No Venue DNA was read for mutation or mutated; `mergeVenueDna` was not called; the New Venue Discovery generation logic, the discovery loop's output contract, and the shipped Slice 1 surfaces are unchanged. This document only scopes the next layer so a future, separate implementation slice can begin from settled decisions.*
