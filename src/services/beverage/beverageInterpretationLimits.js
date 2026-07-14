// HESTIA Beverage Interpretation Engine — centralized limits (remediation F-04).
//
// Single source of truth for every size / count bound in the interpretation kernel. No other
// kernel module may hard-code a magic bound; import from here instead. These are PROTOTYPE
// bounds chosen for a reviewable review-only kernel — they are deliberately conservative and are
// NOT final production limits. Production sizing must be revisited before a live provider or
// persistence is connected (see the Review Guide "remaining blockers").
//
// Size bounds are measured in UTF-8 BYTES (byteLength), never JavaScript string length, so that
// multi-byte content cannot smuggle past a length check.

export function utf8ByteLength(value) {
  return Buffer.byteLength(String(value), 'utf8')
}

export const BEVERAGE_INTERPRETATION_LIMITS = Object.freeze({
  // ── Source registry (context stage) ──────────────────────────────────────
  MAX_SOURCE_COUNT: 200,
  MAX_SOURCE_ID_LENGTH: 300, // aligned with per-claim citation limit so a registrable id is always citable
  MAX_SOURCE_LABEL_LENGTH: 300,
  MAX_SOURCE_VALUE_LENGTH: 12000, // characters (owner/F&B/evidence text)
  MAX_PROVENANCE_SERIALIZED_LENGTH: 4000, // bytes of JSON.stringify(provenance)
  MAX_TOTAL_SOURCE_REGISTRY_BYTES: 512 * 1024, // 512 KB serialized registry

  // ── Prompt / completion (engine stage) ───────────────────────────────────
  MAX_PROMPT_BYTES: 1024 * 1024, // 1 MB assembled prompt
  MAX_COMPLETION_BYTES: 1024 * 1024, // 1 MB raw model response, checked BEFORE JSON.parse

  // ── Output contract (validator stage) ────────────────────────────────────
  MAX_CLAIM_COUNT: 40,
  MAX_CLAIM_STATEMENT_LENGTH: 1200,
  MAX_CLAIM_RATIONALE_LENGTH: 1600,
  MAX_SOURCE_REFERENCES_PER_CLAIM: 20,
  MAX_ASSUMPTIONS_PER_CLAIM: 12,
  MAX_ASSUMPTION_LENGTH: 500,
  MAX_PLAN_ITEM_COUNT: 20,
  MAX_MISSING_ITEM_COUNT: 20,
  MAX_MISSING_QUESTION_LENGTH: 1000,
  MAX_MISSING_REASON_LENGTH: 1200,

  // ── Run metadata ─────────────────────────────────────────────────────────
  MAX_RUN_ID_LENGTH: 200,
})
