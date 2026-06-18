# Venue Memory & Venue DNA Guardrails

> **Status: CANONICAL.** Read before any work that reads, writes, or proposes changes to Venue Memory or Venue DNA.
> Created: 2026-06-18 (Phase 0).
> Parents: [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), [HESTIA_INTELLIGENCE_DOCTRINE_V1.md](./HESTIA_INTELLIGENCE_DOCTRINE_V1.md) (§5–§6, §11 Epistemic Hierarchy).
> Pairs with: [Conversational Intelligence Doctrine](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md), [Specialist Intelligence Pattern](./SPECIALIST_INTELLIGENCE_PATTERN.md), [Decision Ledger Doctrine](./DECISION_LEDGER_DOCTRINE.md).
> Source material (research only): "Venue Memory → Venue Intelligence → Venue DNA", "Epistemic Hierarchy & Guardrails", "Compounding Operational Memory", "Founder stable vs evolving layers", "Identity drift as a principle" — from the archived draft, used as input, not authority.

---

## 1. The three layers

1. **Venue Memory** — the raw institutional record: founder/owner conversation, evidence, captured signals, candidates, decisions, context, incidents, history. It accumulates; it is the substrate.
2. **Venue Intelligence** — the synthesized interpretation of Venue Memory: patterns, contradictions, confidence gaps, drift signals between stated identity and actual operation.
3. **Venue DNA** — the **confidence-calibrated, synthesized interpretation** of the venue. It is a living model with **stable** and **evolving** layers (see §5). It is reached only when HESTIA has sufficient, corroborated confidence — never from a single signal.

Current implementation reference (do not change behavior in Phase 0): `venue_intelligence` table (`venue_dna_json`), `mergeVenueDna` (monotonic confidence + deterministic floors + no-fabrication), `venue_dna_enrichment`, `venue_briefs`. These already embody much of this doctrine.

## 2. The cardinal rule

**Venue DNA is never automatically confirmed from weak evidence or a single AI output.** Confirmation requires corroboration across signals/turns and, for high-impact changes, **human approval**. Specialists and conversation may *propose* DNA candidates; only the Venue Intelligence layer, under these rules, may *confirm*.

## 3. Status taxonomy (every memory item carries one)

- **confirmed fact** — observed/verified; corroborated.
- **owner preference** — stated preference.
- **founder belief** — stable value/non-negotiable (Founder Intent Model).
- **AI inference** — HESTIA's reasoned conclusion (candidate).
- **assumption** — working assumption, must be surfaced (candidate).
- **candidate** — provisional, awaiting corroboration.
- **conflicting evidence** — contradicts existing memory; held as uncertainty, not silently overwritten.
- **missing data** — known unknown; drives the next question, never invented.

## 4. Provenance, confidence, and access — required on every write

Every memory/DNA write must carry:

- **venue boundary** — `venue_id`-scoped; **never** cross-venue.
- **provenance** — `owner_conversation | specialist_decision | sales_signal | ai_inference | operational_event`.
- **confidence** — 0–100, per source where relevant; monotonic (never silently regresses on a thin turn).
- **evidence label** — what supports the claim (and a ref where possible).
- **role access** — who may read it.
- **human approval** — required for high-impact changes (Venue DNA, Founder Intent, strategy).

## 5. Founder Intent Model — stable vs evolving

HESTIA preserves a **Founder Intent Model** (use this term, or "Founder/Owner Memory" — **not** the product-facing "Founder Digital Twin", which stays research-only):

- **Stable layer** — origin story, founding vision, values, brand promise, non-negotiables. Changes rarely and only with explicit owner confirmation.
- **Evolving layer** — current priorities, fears, commercial pressures, ambitions, focus areas. Updates as corroborated evidence accumulates.

Purpose: protect the venue from drifting away from its own identity — by making change **conscious**, not by blocking it. (Automated *identity-drift detection as a mechanism* is **research-only** until it has real evidence and these guardrails; the *principle* — surface drift, make change conscious — is doctrine.)

## 6. Memory model shape (target — do NOT build tables in Phase 0)

The shared envelope HESTIA should converge toward (defined here for doctrine; implemented later per the Master Plan §12):

```
MemoryEntry / DecisionEntry
  id, venue_id, created_at, created_by, role,
  kind, specialist, subject_ref,
  content,                 // structured payload
  evidence: [ { source, ref, excerpt? } ],
  provenance, confidence, status,
  assumptions[], missing_fields[],
  human_approval,          // null | approved_by/at | rejected
  validation_target        // future: what should confirm/contradict this
```

The six conceptual memory levels from the [Conversational Intelligence Doctrine](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md) (Session / Venue / Founder-Owner / Decision / Specialist / Uncertainty) all use this envelope.

## 7. Lifecycle

- **Capture** → as a candidate with status + provenance + confidence.
- **Corroborate** → repeated, consistent evidence raises confidence.
- **Promote** → a corroborated candidate may become confirmed Venue DNA (high-impact → human approval).
- **Conflict** → contradictions are stored as uncertainty, surfaced, never silently overwritten.
- **Decay** → stale, never-reinforced **candidates and assumptions** lose confidence over time. Confirmed, owner-stated facts do not decay automatically.

## 8. Absolute prohibitions

- No **fake Venue Memory**.
- No **fake Venue DNA**.
- No **fake KPIs**, no **fake economics**, no **fake sales/POS truth**, no **fake market truth**.
- No **automatic operational truth** of any kind.
- No **automatic Venue DNA mutation** from sales, a single approval, or a single AI output.
- No **cross-venue leakage**.
- No specialist writing **confirmed** Venue DNA directly (candidates only).

---

*Canonical. Any memory or DNA change that cannot satisfy §2 and §4 must not ship.*
