# HESTIA AI North Star Doctrine

> **Status: CANONICAL.** Read this first before any HESTIA AI intelligence work.
> Created: 2026-06-18 (Phase 0 of the [Master Execution Plan](../plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md)).
> Relation to existing doctrine: this is the **product North Star** for HESTIA *as an AI intelligence system*. It sits alongside — and does not replace — [HESTIA_INTELLIGENCE_DOCTRINE_V1.md](./HESTIA_INTELLIGENCE_DOCTRINE_V1.md) (the broader product/operating doctrine). Where this document is more specific about AI/intelligence behavior, follow it; where the v1 doctrine covers operating detail this does not, that remains authoritative.
> Doctrine index: [README_HESTIA_AI_DOCTRINE_INDEX.md](./README_HESTIA_AI_DOCTRINE_INDEX.md).

---

## 1. The one sentence

**HESTIA is a Venue Operating Intelligence system: a single, evolving understanding of one physical hospitality venue that turns venue identity into professional operational decisions, and grows more intelligent every time a decision is made and met by reality.**

## 2. What HESTIA is

- **A Venue Operating Intelligence system.** Its job is to understand one venue as a living environment — founder belief, Venue DNA, emotional register, guest profile, service philosophy, price positioning, atmosphere, operational constraints, staff capability, F&B identity, business model, the memory of decisions, and the uncertainty around all of it.
- **Centered on Venue Intelligence — the central brain.** Everything else orbits one shared understanding of the venue.
- **Served by specialist intelligences — domain brains.** F&B, Service, Academy/Training, Event, Owner, Operations, and (future) POS/Sales, Guest, Reputation, Decision intelligences. Each is a specialist *over the shared brain*, never a standalone tool.
- **Held together by memory — the connective tissue.** Session, Venue, Founder/Owner, Decision, Specialist, and Uncertainty memory are what make HESTIA *understand* rather than merely *respond*.
- **Driven by conversation as an intelligence-gathering interface.** A conversation is not UI; it is an intelligence-gathering and intelligence-updating event (see [Conversational Intelligence Doctrine](./CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md)).
- **A system that remembers decisions, not just outputs.** Why a decision was made, on what evidence, with what assumptions, and what should later validate it (see [Decision Ledger Doctrine](./DECISION_LEDGER_DOCTRINE.md)).

## 3. What HESTIA is NOT

- **Not a generic BI/analytics dashboard.** It does not exist to render charts of someone else's data.
- **Not a generic chatbot or chat wrapper.** It does not improvise from a blank context; it reasons from venue memory and evidence.
- **Not a cocktail generator.** F&B Intelligence is a professional F&B Director brain, not a recipe vending machine (see [F&B Director Intelligence Doctrine](./FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md)).
- **Not a collection of disconnected tools.** Every feature is a specialist over shared Venue Intelligence; a feature that cannot consume or enrich the shared brain does not belong.
- **Not a POS/PMS clone, CRM, or generic LMS.** It is the intelligence layer *above* transactional systems.
- **Not a replacement for hospitality judgment.** It makes judgment more consistent, informed, and remembered — it does not automate it away.

## 4. The product goal

**Make a venue feel understood, and turn that understanding into operational decisions that are professional, explainable, and improving over time.** Success is when an owner feels HESTIA *knows their venue*, a specialist decision is *defensible from real evidence*, and every decision's outcome makes the next decision sharper.

## 5. The bidirectional law

Intelligence flows **both ways**:

```
Venue Intelligence → specialist context → specialist decision
        ↑                                          │
   candidate update  ←  decision memory + outcome  ┘   (provenance-gated, never auto-confirmed)
```

- Venue Intelligence **feeds** every specialist.
- Every specialist **feeds back** decision memory, discovered constraints, assumptions, and validation targets — as **candidates**, never as confirmed truth.
- Venue Intelligence is the **only** place where understanding is *confirmed* (see [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md)).

## 6. Future POS/sales signals are validation, not current truth

When sales/POS data eventually exists, it **confirms or contradicts** past decisions and **proposes** confidence changes to Venue DNA. It never becomes operational truth automatically, never invents numbers, and never bypasses provenance/confidence/human-approval rules. Prepare for it; do not build it yet.

## 7. The standing risk this doctrine exists to prevent

The current risk is **fragmentation, not absence**. HESTIA already has a real Venue Intelligence spine. The failure modes to prevent:

- building a **third F&B/cocktail engine** instead of converging existing ones;
- wiring new intelligence (e.g. decimal taste) into an **isolated** path instead of the venue-aware one;
- **mutating Venue DNA automatically** from weak evidence or a single AI output;
- producing **fake intelligence** (fake memory, fake DNA, fake KPIs, fake economics, fake sales/POS truth);
- letting specialists become **silos** that neither read nor enrich the shared brain;
- **prompt bloat** from pasting research/knowledge corpora into model calls.

Every later phase must be measured against this doctrine.

## 8. Non-negotiables (apply everywhere)

1. Venue-scoped always; never leak across venues.
2. Provenance + confidence + evidence labels on every claim.
3. Human approval for high-impact changes (Venue DNA, strategy).
4. No fabrication of any operational truth.
5. Converge, don't duplicate.
6. Additive and reversible; live behavior changes only behind flags with regression checks.

---

*Canonical North Star. If a proposed change contradicts this document, the change is wrong until this document is deliberately revised.*
