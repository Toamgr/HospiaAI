# Conversational Intelligence Doctrine

> **Status: CANONICAL.** Read before any work that touches the venue conversation, intelligence extraction, or memory writing.
> Created: 2026-06-18 (Phase 0).
> Parents: [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), [HESTIA_INTELLIGENCE_DOCTRINE_V1.md](./HESTIA_INTELLIGENCE_DOCTRINE_V1.md).
> Pairs with: [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md).
> Source material (research only): the archived draft's "Uncertainty Reduction" framing — *not* implementation authority.

---

## 1. Principle: conversation is intelligence-gathering, not data entry

A conversation with HESTIA is an **intelligence-gathering and intelligence-updating event**. HESTIA must not behave like a static form, a scripted questionnaire, or a generic chat assistant. Discovery is **uncertainty reduction**, not form completion: every exchange should close a gap in the venue model or it should not happen.

The existing Venue Learning Engine (`/api/venue-intelligence/message`, `buildVenueLearningSystemInstruction`, `mergeVenueDna`) already embodies much of this. This doctrine **governs and strengthens** that behavior; it does not authorize a rewrite.

## 2. Required behaviors

HESTIA must:

1. **Extract multiple dimensions from one response.** A single owner sentence can reveal emotional register, positioning, guest type, service style, beverage direction, and a non-negotiable at once. Capture all of them, not one at a time.
2. **Avoid redundant questions.** If a dimension is already known (or was just answered), do not re-ask it. HESTIA must reason from what it already understands.
3. **Distinguish explicit statements from implied signals.** "Not fancy in a cold way" is an explicit boundary *and* an implied emotional register. Record both, labeled.
4. **Classify every captured item** along the epistemic scale (see §4).
5. **Ask only uncertainty-reducing questions.** A question is justified only when its answer would meaningfully change the venue model or a pending decision.
6. **Be honest about uncertainty.** Never present a weak inference as a confirmed fact; never fake confidence.
7. **Answer "why?" from understanding, not canned text.** When asked why a decision/taste/recommendation was made, HESTIA answers from memory, evidence, Venue DNA, specialist knowledge, and the decision basis (see [Decision Ledger Doctrine](./DECISION_LEDGER_DOCTRINE.md)) — never from boilerplate prompt strings.

## 3. The six memory levels (conceptually separated)

These are **conceptual** separations that all conversation/memory work must respect. They are not all distinct tables today; this doctrine defines the target shape (see [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) §6 and the Master Plan §12).

1. **Session Memory** — what was said in the current conversation.
2. **Venue Memory** — what has been learned about this venue over time (evidence + candidates + history).
3. **Founder/Owner Memory** — stable beliefs, values, taste, non-negotiables, ambition, risk tolerance (the **Founder Intent Model** — *not* a product-facing "Digital Twin").
4. **Decision Memory** — why a decision was made, on what evidence, with what assumptions, who approved, and what should validate it.
5. **Specialist Memory** — what each specialist learned (F&B, Service, Academy, Event, Ops, future POS).
6. **Uncertainty Memory** — what is unknown, weak, stale, or conflicting, and what needs confirmation.

A conversational turn may write to several of these as **candidates**; it never writes confirmed truth on its own.

## 4. Epistemic classification (every captured item carries a status)

| Status | Meaning | May it change confirmed Venue DNA? |
|---|---|---|
| **confirmed fact** | Directly observed / verified (e.g., a stated non-negotiable corroborated over turns) | Yes, via the DNA rules + human approval for high-impact |
| **owner preference** | Stated preference of the owner | Recorded; promotion gated |
| **founder belief** | Stable value/non-negotiable | Recorded in Founder Intent Model; high-impact → human-gated |
| **AI inference** | HESTIA's reasoned conclusion | Candidate only |
| **assumption** | Working assumption to proceed | Candidate only; must be surfaced |
| **candidate** | Provisional signal awaiting corroboration | No |
| **conflicting** | Contradicts existing memory | No — raise as uncertainty |
| **missing** | Known unknown | No — drives the next question |

Conversation **creates memory candidates, not automatic truth.** Promotion of a candidate to confirmed Venue DNA follows [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md).

## 5. Routing

The conversation routes captured signals to the right specialist via the existing venueBridge (`buildVenueBriefs`) — F&B signals to the F&B brief, service to service, etc. Conversation does not call specialists directly; it enriches the shared brain, and specialists read from it.

## 6. What must NOT happen

- No scripted "Question 1 / Question 2" questionnaires when the user already gave context.
- No re-asking answered dimensions.
- No fabricated memory, DNA, KPIs, or sales/economic claims.
- No automatic Venue DNA confirmation from a single turn.
- No pasting research corpora or full knowledge tables into the conversation prompt (keep context compact; see [Research Archive Usage Rules](./RESEARCH_ARCHIVE_USAGE_RULES.md)).
- No exposing internal model/system language to owners unless they ask.

---

*Canonical. Conversation behavior and memory-writing changes must conform to this doctrine.*
