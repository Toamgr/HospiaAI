# Specialist Intelligence Pattern

> **Status: CANONICAL.** Read before building or modifying ANY specialist intelligence (F&B, Service, Academy, Event, Owner, Operations, future POS/Sales, Guest, Reputation).
> Created: 2026-06-18 (Phase 0).
> Parents: [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md), [Decision Ledger Doctrine](./DECISION_LEDGER_DOCTRINE.md).
> Implementation reference: the existing venueBridge layer (`buildVenueBriefs`, `assembleUnifiedContext`, the `*ContextService` modules) is the canonical pattern's current home.

---

## 1. Why one pattern

Specialists must **not become silos**. The single greatest architectural risk after fragmentation is each new intelligence inventing its own venue understanding, its own memory, and its own truth. The pattern below guarantees every specialist is a domain brain *over the shared Venue Intelligence*, reading and enriching the same understanding.

## 2. The contract (every specialist follows it)

Every specialist intelligence must:

1. **Consume Venue Intelligence** — read the shared understanding through the venueBridge / unified context (never re-profile the venue itself, never read raw DNA in a private second reader).
2. **Operate inside its domain** — produce only domain-appropriate output.
3. **Produce a decision or recommendation** — concrete, domain-specific.
4. **Record a decision memory** — write to the Decision Ledger (what + why + evidence + assumptions + constraints + confidence).
5. **Preserve an explanation basis** — enough recorded reasoning to answer "why?" on demand from understanding, not canned text.
6. **Create feedback candidates to Venue Intelligence** — discovered constraints, revealed preferences, confidence deltas — as **candidates only**.
7. **Never mutate Venue DNA directly** — proposals go through the [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md); confirmation is human-gated for high impact.
8. **Respect role access and venue boundaries** — `requireAuth` + `req.venueId` on every read/write; never cross-venue.
9. **Be testable and auditable** — pure/deterministic where possible; decisions traceable in the ledger.

```
consume → operate → produce → record (ledger) → preserve explanation → feedback candidate
   ▲                                                                         │
   └──────────────────── Venue Intelligence (confirms, human-gated) ◄────────┘
```

## 3. Shared guardrails (all specialists)

- Provenance + confidence + evidence labels on every output and every feedback candidate.
- No fabrication (no fake data, KPIs, economics, sales, emotions, grades).
- No staff surveillance or personality/emotion judgments.
- Compact context only; no research-corpus or full-table prompt injection.
- Additive, flag-gated, reversible when touching live behavior.

## 4. Applying the pattern per specialist

| Specialist | Consumes | Produces | Feeds back (candidate) | Decision memory | Specific guardrails |
|---|---|---|---|---|---|
| **F&B** (the wedge — see [F&B Director Doctrine](./FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md)) | DNA, fb/service briefs, Bar DNA, Taste DNA | venue-aware menus, recipes, decimal taste targets | discovered constraints, taste direction, guest-risk tolerance | menu/drink generation, approval, edit, outcome | no fake costs/KPIs; decimal taste honest; kosher conditional |
| **Service** | service/guest briefs, DNA | service standards, recovery playbooks | observed service pain, real pace | standard set/change | no staff surveillance; evidence-labeled |
| **Academy/Training** | training brief, capability signals (`academyContextService`) | learning order, lesson routing (existing manifest only) | capability gaps revealed | recommended path chosen | exposure ≠ capability; manager-verified readiness; no invented lessons |
| **Event** | event brief, DNA | event menus/timelines | event patterns, constraints | event plan decisions | keep separate from bar F&B for now; second priority |
| **Owner** | full unified context (`selectOwnerIntelligence`) | strategic narrative, Operational Pulse | corrected priorities | strategic decisions | owner-only; exception-based; no fake KPIs |
| **Operations** | ops signals/enrichment | operational recommendations | recurring pains, capacity limits | ops decisions | real data only; no fake metrics |
| **POS/Sales (future)** | Decision Ledger + sales | validation verdicts | confidence deltas to DNA | which decisions validated/contradicted | nullable + `source`-tagged; candidate-only; never invents sales |
| **Guest (future)** | guest/reputation signals | guest-experience guidance | guest-profile refinements | guest decisions | privacy; no emotion diagnosis; no fabricated segments |
| **Reputation (future)** | external signals (later) | positioning guidance | market-position candidates | positioning decisions | external provenance required; no fake market truth |

## 5. Rollout discipline

- **F&B first** (data already exists: Bar DNA, Taste DNA, sales). Prove the full loop there.
- **Then reuse the exact pattern** for the next specialist (Academy is closest, its context adapter already exists). Do not build all specialists at once. Do not start multi-venue group intelligence without tenant isolation + permissions.

---

*Canonical. A specialist that cannot satisfy the §2 contract does not ship.*
