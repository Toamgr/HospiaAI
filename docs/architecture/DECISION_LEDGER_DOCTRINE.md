# Decision Ledger Doctrine

> **Status: CANONICAL.** Read before designing or implementing the F&B Decision Ledger (Master Plan Phases 1–3) or any specialist decision memory.
> Created: 2026-06-18 (Phase 0).
> Parents: [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), [Specialist Intelligence Pattern](./SPECIALIST_INTELLIGENCE_PATTERN.md), [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md).
> Source material (research only): "Compounding Operational Memory" / append-only event store (Raw → Synthesized → Compounding) — used as input, not authority.
> **This doctrine defines WHY the ledger exists. It does NOT create a table or service. Implementation is later phases.**

---

## 1. Why it exists

HESTIA today remembers **conversations** (`venue_intelligence`) and stores **outcomes** (`cocktail_sales`), but it does **not remember decisions** — *why* a menu/drink was chosen, on what evidence, with what assumptions. Without that record:

- "why does this fit my venue?" can only be answered from prompt text (not understanding);
- decision outcomes can never validate the reasoning that produced them;
- the F&B → Venue Intelligence feedback loop has nothing concrete to feed back.

**The Decision Ledger is the keystone** that makes specialist intelligence explainable and self-improving. It is the append-only memory of *decisions and their rationale*.

## 2. What it stores

For each decision (e.g., a generated menu/drink, a replacement, an approval/rejection/edit):

- **what** — decision type + subject reference;
- **why** — rationale / explanation basis;
- **evidence** — sources used (Venue DNA, Taste DNA, briefs, calibration, costing), with refs;
- **DNA snapshot reference** — the Venue DNA version (e.g., a hash) at decision time;
- **dimensions used** — which DNA dimensions/signals drove it;
- **targets** — e.g., target taste profile range; resulting decimal taste profile;
- **constraints** — operational constraints applied (staff skill, equipment, prep capacity);
- **assumptions** — explicit, honest;
- **confidence** — overall + per-source;
- **human action** — approved / rejected / edited (+ correction notes);
- **future validation target** — what later evidence (e.g., sales) should confirm/contradict it;
- **provenance, role, venue_id** — always.

It uses the shared memory envelope from [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) §6.

## 3. What it does NOT store / is NOT

- It is **not confirmed Venue DNA.** A ledger entry is a record of a decision, not an update to the venue's identity. It may *emit candidates*; it never confirms.
- It does **not** store fabricated reasoning, invented costs/KPIs/economics/sales, or owner-facing prose.
- It does **not** store anything not actually used in the decision.
- It is **not** a chat log, an analytics table, or a generic audit-everything log.

## 4. What it enables

1. **On-demand explanations** — "why this drink / taste / family / fit" answered from recorded basis + Venue DNA + confidence (see [F&B Director Doctrine](./FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md) §7).
2. **Feedback candidates** — approvals/edits/outcomes become *candidate* Venue/Taste DNA updates (never auto-confirmed).
3. **Future POS validation** — join ledger ↔ `cocktail_sales` so real sales confirm/contradict past decisions (POS prepared for, not built).

## 5. Implementation discipline

- **Write-only at first.** In its first implementation, nothing reads the ledger back into prompts or generation. It only records. This guarantees:
  - **no live generation behavior changes** when it is first added;
  - real decision history accumulates before anything depends on it;
  - the change is fully reversible (drop the table, remove the write).
- **Writes must never block generation.** A ledger write failure must be caught and ignored so it can never break `/api/ci/generate` or any specialist.
- **Venue-scoped + role-gated** on every read/write.
- **No automatic Venue DNA mutation** from a ledger entry.
- **No fake evidence** — if a source was not used, it is not listed.
- **Architectural home:** a pure service in `src/services/venueBridge/` (a decision is a venue-intelligence artifact, not a cocktail artifact), with a venue-scoped table written from existing endpoints. (Design/spec in later phases; not here.)

## 6. Relationship to existing storage

- `business_memory` is event-log grade (type/title/detail/date) — **not** a decision record; the ledger is distinct.
- `cocktail_taste_dna` learns rejection/approval patterns — the ledger records the **decisions** those patterns come from.
- `cocktail_sales` is outcome data — the ledger is what sales later **validate**.

---

*Canonical. The ledger is the memory of decisions. It records reasoning, emits candidates, and never confirms truth on its own.*
