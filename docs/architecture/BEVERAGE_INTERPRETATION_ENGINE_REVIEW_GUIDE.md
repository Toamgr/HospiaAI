# HESTIA Beverage Interpretation Engine — Review Guide

**Status:** Review-only kernel. Not wired to production routes, UI, persistence, or a live model.

## Purpose

This slice creates the smallest auditable form of the proposed HESTIA beverage model:

`submitted owner brief + approved F&B review + explicitly supplied evidence`

→ closed source registry

→ provider-neutral model prompt

→ strict cited JSON

→ deterministic validation and audit hashes

The implementation is intentionally reviewable before it is connected to production. It makes
no database writes, does not update Venue DNA, does not generate cocktails, and cannot approve or
execute a recommendation.

## Files reviewers should inspect

1. `beverageInterpretationContext.js`
   - Requires a submitted owner brief and approved F&B review.
   - Preserves the owner's original value as a source even when an approved F&B adjustment becomes
     the effective working value.
   - Creates a closed source registry. The model is not allowed to cite anything else.

2. `beverageInterpretationEngine.js`
   - Builds the exact prompt.
   - Uses a dependency-injected completion adapter; no provider is hard-coded.
   - Computes SHA-256 hashes for context, source registry, prompt, and raw output.
   - Rejects markdown-wrapped or malformed JSON instead of repairing it.
   - Returns no side effects.

3. `beverageInterpretationContract.js`
   - Treats model output as untrusted input.
   - Rejects unknown keys, unknown source ids, duplicate ids, invalid plan references, and invalid
     claim types.
   - Requires human review for every hypothesis and recommendation.
   - Prevents an expert-prior-only statement from being classified as a venue fact.

4. `scripts/test-beverage-interpretation-engine.js`
   - Offline deterministic checks covering approval gating, immutability, source citation,
     human-review rules, expert-prior boundaries, hashes, and no silent repair.

5. `scripts/run-beverage-interpretation-demo.js`
   - Offline demonstration using a deterministic fixture model.
   - Prints the exact review payload and audit metadata.

## How to run

```bash
npm run test:beverage-interpretation-engine     # 9 offline kernel checks (node)
npm run test:beverage-interpretation-security    # 47 Vitest regression cases for the audit findings
npm run demo:beverage-interpretation-engine
```

None of these calls an external provider or writes to the database. The security suite also runs
as part of `npx vitest run`.

## Threat model (short)

The kernel sits between two trust boundaries. **Trusted:** the approved owner brief and F&B review
records (venue-scoped, immutable post-decision). **Untrusted:** (a) any externally supplied
evidence, and (b) the model completion itself. The kernel's job is to keep untrusted inputs from
corrupting the closed source registry, from crossing venue boundaries, from steering the model via
injected instructions, and from producing output that the application would treat as verified fact.
It does **not** attempt to prove that a cited source semantically supports a claim (see below).

## Security posture (implemented)

- **Closed registry, genuinely closed (F-01).** The source registry is canonicalized once,
  deep-cloned, and deep-frozen into a private snapshot before the model runs. The hash and the
  validator use only that snapshot. The completion adapter receives a separate detached copy, so an
  adapter that pushes, relabels, or edits its argument cannot inject or launder a source. The hash
  is re-verified after the call.
- **Venue binding (F-02).** Every source carries a `scope`. Owner/F&B sources are stamped
  `scope:'venue'` + the brief's venue_id (from the record, never from input). External evidence must
  declare `scope`; `scope:'venue'` requires a `venue_id` equal to the brief's venue; `scope:'global'`
  is limited to `expert_prior` and may not carry a venue_id. Cross-venue evidence is rejected without
  echoing the foreign id. Vocabulary: `SOURCE_SCOPES = ['venue','global']`.
- **Size limits (F-04).** All bounds live in `beverageInterpretationLimits.js` and are measured in
  UTF-8 bytes. Guards fire at the context stage (source count, id/label/value/provenance, total
  registry bytes), before prompt assembly (prompt bytes), and before `JSON.parse` (completion bytes).
  These are **prototype** bounds, not final production limits.
- **Prompt injection containment (F-05).** The prompt separates `# SYSTEM RULES` from a delimited
  `<<<HESTIA_UNTRUSTED_EVIDENCE_BEGIN>>>…END>>>` block containing JSON-serialized evidence, with an
  explicit instruction to treat that block as data only. This is **containment, not a guarantee** —
  the real enforcement is the post-response validator.
- **Privacy of raw output (F-06).** The default result contains no raw model text. Raw text is
  available only via `includeRawOutput: true` under `result.debug` (internal/debug only, never for
  production/logging). Errors do not echo raw completions or owner/F&B source content.
- **Robustness (F-07/F-08).** `run_id` and `now()` are validated with classified errors; circular
  provenance is rejected as `BAD_REQUEST` rather than crashing.

## What the validator proves — and does not (F-03)

The output validator performs **citation reference validation**, not **semantic evidence
verification**. The audit metadata says so explicitly: `citation_validation: 'reference_existence_only'`,
`semantic_support_verified: false`.

Can prove: the cited source id exists in the closed registry; the source type is permitted for the
claim; the source scope is correct; the claim shape is legal; a human-review flag is present where
required (every `derived_observation`, `hypothesis`, and `recommendation` must set
`human_review_required=true`).

Cannot prove (OPEN): that a cited source actually supports the statement; that causal wording is
correct; that a number matches its source file; that the model did not phrase a misleading claim;
that a human reviewer performed a real review. An `owner_aspiration` is not a fact about venue
performance, a `professional_review` is not a fact about guest behavior, and an `expert_prior` is
not a venue fact — the kernel enforces the last of these at the class level only.

## Binding invariants

- Owner words remain immutable and separately attributable.
- F&B adjustments are a review layer, not an overwrite.
- A review must be `approved` before the model can run.
- Every claim cites one or more exact source ids from the closed, frozen registry.
- Facts, observations, hypotheses, and recommendations stay distinct.
- Every non-fact claim (derived_observation, hypothesis, recommendation) requires human review.
- Every source is venue-scoped or an explicitly global expert prior; no cross-venue evidence.
- No fake fallback output; malformed model output fails honestly.
- No raw model output in the default result.
- No Venue DNA writes.
- No persistence or production route in this slice.
- No claim about sales, guest preference, cost, profitability, or performance without explicit
  evidence supplied to the registry.

## Remaining blockers

- **Before connecting a provider:** authorization proof for evidence import; provider/model coverage
  inside the audit hash + trusted/signed hash storage; timeout / abort-signal around the live call.
- **Before persisting model output:** retention, encryption at rest, access control, deletion policy,
  and log suppression for prompts and raw completions.
- **Before production:** run/view/approve authorization policy; an enforceable human-review gate
  (beyond the output Boolean) blocking any downstream action until a human decision is recorded.
- **Semantic layer (F-03, OPEN):** an independent claim-evidence verifier. Deliberately not built
  here.
- **Venue DNA promotion:** last in sequence.

See `docs/audits/BEVERAGE_INTERPRETATION_ENGINE_INDEPENDENT_AUDIT_2026_07.md` (findings) and
`docs/audits/BEVERAGE_INTERPRETATION_ENGINE_REMEDIATION_2026_07.md` (fixes).

## Review questions

1. Is `approved` the correct trigger, or should a separate explicit "send to interpretation" action
   exist after approval?
2. Should approved F&B adjustments become the effective direction automatically, or should each
   adjustment require a separate owner acknowledgment?
3. Are the four claim classes sufficient, or should deterministic calculations have their own
   class?
4. Should the raw model output be returned to application code, or retained only in a restricted
   audit store?
5. Which roles may run, view, and approve an interpretation?
6. What evidence classes can enter the first production version?
7. What retention and redaction rules should apply to prompts and raw completions?

## Deliberately deferred

- Live provider adapter and backend route.
- Authentication and authorization policy for running the engine.
- Database tables for interpretation runs and human decisions.
- UI review surface.
- Cocktails, menu generation, costing, POS/Tabit, attribution, RAG, and outcome scoring.
- Venue DNA promotion.

Those should be implemented only after this kernel is reviewed and its contracts are accepted.
