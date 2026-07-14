# HESTIA Beverage Interpretation Engine — Remediation Record (2026-07)

**Companion to:** `docs/audits/BEVERAGE_INTERPRETATION_ENGINE_INDEPENDENT_AUDIT_2026_07.md` (the independent audit — preserved unchanged as the historical record of the vulnerabilities).
**Base:** `origin/main` @ `7e2fdfa207312b04acfc0927bc559d13c630b98d`
**Worktree branch:** `audit/beverage-interpretation-kernel-20260714-034034`
**Scope:** Fix the P0/P1 findings (and the cheap P4 correctness items surfaced alongside them), add formal regression tests, and prepare for a Draft PR. No provider, persistence, route, UI, or Venue DNA work. No behavior change to Owner Beverage Brief or F&B Review services.

---

## Summary of status

| Finding | Severity | Status | One-line resolution |
|---|---|---|---|
| F-01 — closed registry mutation bypass | High | **CLOSED** | Private canonical deep-clone + deep-freeze snapshot; adapter gets a detached copy; hash re-verified. |
| F-02 — missing venue binding for evidence | High | **CLOSED** | Mandatory `scope` + venue-id match against the trusted brief venue; global limited to expert_prior. |
| F-04 — missing input/output size limits | Medium | **CLOSED** | Central `beverageInterpretationLimits.js`; byte-based guards at context, prompt, and completion. |
| F-05 — prompt injection containment | Medium | **PARTIALLY MITIGATED** | Structured prompt with an explicit UNTRUSTED-DATA block + post-response validation. Not a guarantee. |
| F-06 — raw output privacy | Medium | **CLOSED (for this kernel)** | Raw text removed from the default result; opt-in internal debug only; errors no longer leak raw/source text. |
| F-03 — citation existence ≠ support | Medium | **PARTIALLY MITIGATED** | Every non-fact claim forced to human review; honest labeling. Semantic entailment remains OPEN by design. |
| F-07 — run id / clock validation | Low | **CLOSED** | `run_id` and `now()` validated with controlled errors. |
| F-08 — circular provenance crash | Low | **CLOSED** | Controlled `BAD_REQUEST` instead of raw `TypeError`. |
| F-09 — id length mismatch (300 vs 500) | Low | **CLOSED** | Single `MAX_SOURCE_ID_LENGTH = 300` used for both registration and citation. |
| F-10 — tests not formal | Informational | **CLOSED** | 47 Vitest regression cases now run under `npx vitest run`. |

---

## Per-finding detail

### F-01 — Closed registry is now genuinely closed  **CLOSED**
**File:** `src/services/beverage/beverageInterpretationEngine.js`
**How:**
- `prepareBeverageInterpretationRun` now canonicalizes the registry **once**, deep-clones it (`detachedClone`), and **deep-freezes** it into a private `registry_snapshot`. The source hash is computed from this snapshot, and the validator runs against this snapshot only.
- `executeBeverageInterpretation` hands the completion adapter a **separate** detached, deep-frozen copy (`adapterRegistry`) — never `run.registry_snapshot`. An adapter that pushes, relabels, or edits its argument cannot affect the snapshot, the hash, or validation.
- After the adapter returns, the engine re-verifies `sha256(canonicalJson(registry_snapshot)) === source_registry_sha256` and throws `REGISTRY_INTEGRITY_ERROR` on any mismatch (defense in depth).
- `deepFreeze` is recursive (nested arrays/objects/provenance/values), not a shallow `Object.freeze`.
**Tests added (engine):** pushed source cannot be cited (`unknown source id`); nested class/value mutation does not change hash or validation; adapter reference ≠ validator snapshot and is frozen; recorded hash equals a fresh independent computation; `deepFreeze` proven deep; no uncontrolled crash (adapter mutation is caught and isolated).

### F-02 — Full venue binding for external evidence  **CLOSED**
**File:** `src/services/beverage/beverageInterpretationContext.js`
**How:**
- New `SOURCE_SCOPES = ['venue','global']`. Every external evidence item must declare a `scope`.
- `scope:'venue'` requires a non-empty `venue_id` that **equals `brief.venue_id`** (the trusted venue read from the brief record, never from external input). Cross-venue evidence is rejected; the error does **not** echo the foreign venue id.
- `scope:'global'` is allowed **only** for `expert_prior` and must **not** carry a `venue_id`, so a prior can never masquerade as venue evidence.
- Owner-brief and F&B sources are stamped `scope:'venue'` + `venue_id` from the records themselves.
- Nothing is auto-attributed or auto-corrected.
**Tests added (context):** cross-venue → rejected; error hides foreign id; missing/empty venue_id → rejected; missing scope → rejected; global expert prior → accepted (venue_id null); non-expert-prior global → rejected; global-with-venue_id → rejected; matching venue evidence → accepted.

### F-04 — Central, byte-based size limits  **CLOSED**
**Files:** new `src/services/beverage/beverageInterpretationLimits.js`; consumed by context, contract, engine.
**How:** one frozen `BEVERAGE_INTERPRETATION_LIMITS` object (no scattered magic numbers). UTF-8 **byte** measurement (`utf8ByteLength`) for all payload/size checks. Guards: source count, id/label/value length, provenance bytes, total registry bytes (context); prompt bytes (before `complete()`); completion bytes (**before `JSON.parse`**); claim/reference/plan/assumption counts (validator); run-id length. All reject with classified domain errors, no silent truncation, no fallback. Limits are documented as **prototype** bounds, not final production values.
**Tests added:** >MAX_SOURCE_COUNT rejected; oversized id/provenance/total-registry rejected; oversized completion rejected before parse; oversized run id rejected.

### F-05 — Prompt injection containment  **PARTIALLY MITIGATED**
**File:** `src/services/beverage/beverageInterpretationEngine.js`
**How:** the prompt is now sectioned — `# SYSTEM RULES` (trusted) and `# UNTRUSTED-DATA HANDLING` appear **before** the evidence, which is wrapped in explicit `<<<HESTIA_UNTRUSTED_EVIDENCE_BEGIN>>>` / `END` markers and serialized as compact JSON (not free-text interpolation), so marker-like text inside a value is escaped and cannot close the block. An explicit instruction tells the model to treat the block as data and never obey embedded commands, and never to invent source ids. This is **containment**, not a guarantee: the real enforcement remains the post-response validator (unknown source ids, strict JSON, class rules). Documented as such.
**Tests added:** rules precede the untrusted block; block is marked untrusted; injected owner text is preserved only inside the block; injection asking for a new source id still fails validation.

### F-06 — Raw output privacy  **CLOSED (for this kernel)**
**File:** `src/services/beverage/beverageInterpretationEngine.js`
**How:** the default public result no longer contains `raw_output_text`. It is available only when `includeRawOutput: true` is passed, and then only under `result.debug = { internal_only: true, raw_output_text }` — documented as internal/debug only, default off, never for production or logging. `audit` keeps `raw_output_sha256` and adds `raw_output_byte_length` without the text. The malformed-JSON error no longer interpolates V8's parser message (which embeds an input snippet), and validation errors reference ids/field names only — not source content.
**Tests added:** default result lacks raw text and debug and does not echo owner text; opt-in debug carries it; malformed-JSON error hides the raw payload; validation error does not echo owner/F&B content.
**Still out of scope (documented):** retention, encryption at rest, access control, deletion policy — these belong to the persistence phase, which remains deferred.

### F-03 — Citation existence vs. support  **PARTIALLY MITIGATED (semantic entailment OPEN by design)**
**File:** `src/services/beverage/beverageInterpretationContract.js`
**How:** no second model / no regex theater. Structural tightening only: every `derived_observation`, `hypothesis`, and `recommendation` must set `human_review_required=true` (previously only hypothesis/recommendation) — a causal claim mislabeled as `derived_observation` can no longer slip through without review. Naming/docs clarified: this is **citation reference validation**, not **semantic evidence verification**; the audit exposes `citation_validation: 'reference_existence_only'` and `semantic_support_verified: false`.
**What the system can prove:** the source id exists; the source type is permitted; the source scope is correct; the claim shape is legal; a human-review flag is present where required.
**What it still cannot prove (OPEN):** that the source actually supports the statement; that causality is correct; that a number matches its source file; that the model did not phrase a misleading claim; that a human reviewer performed a quality review. `owner_aspiration` is not a fact about performance; `professional_review` is not a fact about guest behavior; `expert_prior` is not a venue fact; numeric venue facts should come from structured operational evidence — these are documented expectations a future independent verifier must enforce.
**Tests added:** every non-fact claim without review is rejected; causal derived_observation without review rejected; deterministic fact still allowed; unrelated-but-valid citation still validates (documented limitation); expert-prior-only fact still rejected.

### F-07 / F-08 / F-09 / F-10  **CLOSED**
- **F-07:** `assertValidRunId` (non-empty string, bounded length) and `assertGeneratedAt` (valid `Date`) throw `INVALID_RUN_ID` / `INVALID_CLOCK` instead of accepting `null` or throwing a raw `TypeError`.
- **F-08:** `serializeProvenance` catches non-serializable/circular provenance and throws `BAD_REQUEST`.
- **F-09:** `MAX_SOURCE_ID_LENGTH = 300` is the single bound for both registration and citation.
- **F-10:** the temporary `scripts/audit-adversarial-tests.mjs` was converted into 47 formal Vitest cases across three `src/services/beverage/*.test.js` files (picked up by `npx vitest run`) and a `test:beverage-interpretation-security` script; the temp file was then deleted.

---

## Files changed

**New**
- `src/services/beverage/beverageInterpretationLimits.js`
- `src/services/beverage/beverageInterpretationContext.test.js`
- `src/services/beverage/beverageInterpretationContract.test.js`
- `src/services/beverage/beverageInterpretationEngine.test.js`
- `docs/audits/BEVERAGE_INTERPRETATION_ENGINE_REMEDIATION_2026_07.md` (this file)

**Modified**
- `src/services/beverage/beverageInterpretationContext.js` (F-02, F-04, F-08)
- `src/services/beverage/beverageInterpretationContract.js` (F-03, F-04, F-09)
- `src/services/beverage/beverageInterpretationEngine.js` (F-01, F-04, F-05, F-06, F-07)
- `scripts/test-beverage-interpretation-engine.js` (fixtures: `scope:'global'`, non-fact human review)
- `scripts/run-beverage-interpretation-demo.js` (fixture: `scope:'global'`)
- `docs/architecture/BEVERAGE_INTERPRETATION_ENGINE_REVIEW_GUIDE.md` (threat model + remediation posture)
- `package.json` (add `test:beverage-interpretation-security`)

**Deleted**
- `scripts/audit-adversarial-tests.mjs` (temporary; cases preserved as Vitest regressions)

**Untouched (verified):** `ownerBeverageBriefService.js`, `fnbBriefReviewService.js`, `server.js`, provider adapters, Venue DNA / Venue Intelligence, decision ledger. No DB access, no network, no Venue DNA write added.

---

## What remains unresolved (blockers by phase)

- **Before a live provider:** independent authorization proof for evidence import; provider/model coverage inside the audit hash + signed/trusted hash storage; timeout / abort-signal around the provider call (the size guards are in, but there is no live-call cancellation yet).
- **Before persistence:** retention, encryption at rest, access control, deletion policy, and log suppression for prompts and raw completions (F-06 residual).
- **Before production:** run/view/approve authorization policy; an enforceable human-review gate (beyond the output Boolean) preventing any downstream action until a human decision is recorded.
- **Semantic layer (F-03, OPEN):** an independent claim-evidence verifier (deterministic structured claims for known data, type-specific source requirements, exact-quote display for human review, rejection of unsupported numeric/causal claims). Deliberately not attempted here.
- **Venue DNA promotion:** last in sequence; not before all of the above are reviewed.
