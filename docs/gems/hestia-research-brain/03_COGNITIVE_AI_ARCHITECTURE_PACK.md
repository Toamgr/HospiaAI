# 03 — Cognitive & AI-System Architecture Pack

**Scope:** Consolidates HESTIA's cognitive-architecture and AI-system-design research: cognitive architecture for operational AI, context engineering, retrieval, memory evolution, knowledge lifecycle, anticipatory AI, human-state modeling, operational governance, agentic workflows, multi-agent orchestration, and uncertainty reduction — and how each applies to HESTIA.

**Status of this material:** This is **supporting research**, not production behavior or doctrine. Every source file in `docs/research/cognitive-architecture/` carries the archive note: *"not canonical product doctrine, current production behavior, or implementation authority. Do not implement directly without HESTIA's provenance, confidence, role-access, venue-boundary, evidence, and human-approval guardrails. Must not be used to create fake intelligence, fake Venue Memory, fake Venue DNA, fake KPIs, or automatic operational truth."* Treat the frameworks below as a design vocabulary to be filtered through HESTIA's guardrails — not a build spec.

---

## 1. Cognitive Architecture for Operational AI

Long-term operational AI (multi-year, high-stakes) requires a departure from stateless, reactive models. The research defines **14 tightly-coupled capabilities** flowing bidirectionally through five layers:

1. **Perception & Semantic Ingestion** — Conversational Understanding + Real-Time Meaning Extraction (dialogue → subject-relation-value triples).
2. **Context & Epistemic Assembly** — Human State Modeling + Context-Aware Reasoning + Confidence Scoring + Evidence Tracking.
3. **Cognitive Storage & Lifecycle** — Long-Term Memory + Knowledge Evolution + Contradiction Handling.
4. **Multi-Domain Orchestration & Resolution** — Intelligence Orchestration + Recommendation Generation + Decision Rights.
5. **Action Execution & Governance** — Action Routing + Human-in-the-Loop Governance.

**HESTIA mapping (synthesis):** Zohar + Shift Brain + the deterministic completeness/checkmark engines are HESTIA's "Context & Epistemic Assembly." `mergeVenueDna` + the candidate system are "Cognitive Storage & Lifecycle." The Specialist Pattern + Decision Ledger are "Orchestration." Owner confirmation + candidate review are "Governance." HESTIA deliberately keeps Action Routing human-gated.

## 2. Context Engineering & Retrieval Architecture

Context is **not** static text injected into a prompt — it is a high-dimensional, time-varying working-memory state. Relevance is **causal utility to the active task**, not vector similarity (the "Search Assumption" fallacy). It is a function of: semantic alignment, temporal recency, structural salience, procedural necessity.

**Two failure modes (asymmetric degradation):**
- **Context bloat** — too much context → attention dilution, "lost in the middle," context poisoning (semantically similar but outdated/contradictory facts), non-terminating reasoning.
- **Contextual tunneling/isolation** — too little context → decisions in a vacuum, broken multi-hop reasoning, violated implicit constraints.

**Nine contextual dimensions** to isolate: Immediate Conversation · Long-Term Memory · User Profile · Organizational Memory · Task Context · Rules & Policies · Historical Precedent · Current Operational State · External Environment.

**Retrieval modalities** (each with strengths/failure modes): keyword (exact IDs), vector (semantic, risk: poisoning), hybrid, graph (multi-hop, high latency), episodic (event recall, risk: stale-failure pollution), semantic (concepts), rule (deterministic bounds), policy (RBAC/access).

**HESTIA application:** The master execution plan is explicit — **one compact context block per specialist, measured for size, flag-gated; never paste the research corpus or full tables into prompts.** Graph/GraphRAG is a *future* track, used only if compact injection + SQLite/JSON is demonstrably outgrown. This pack itself is a context-engineering artifact: summarized, not pasted.

## 3. Memory Evolution & Knowledge Lifecycle

Knowledge has a lifecycle with distinct persistence semantics: episodic memories may decay; semantic assertions may be archived or superseded by newer evidence. The HESTIA-shaped version (from the Venue Memory & DNA Guardrails + master plan §7):

- **Remember:** stable identity/positioning/guest/service/F&B signals; founder beliefs/non-negotiables; decisions and outcomes.
- **Keep temporary (candidates):** single-mention inferences, AI guesses, weak signals — never auto-promoted.
- **Require human approval:** any *confirmed* DNA change driven by specialist decisions or sales evidence.
- **Decay:** stale candidates / outdated assumptions lose confidence if never reinforced (decay applies to candidates only, **never** to owner-confirmed facts).
- **Become stable DNA:** signals corroborated across multiple turns/sources (+ optional human confirmation).
- **Forbidden:** fake memory, automatic truth mutation.

**Contradiction handling** uses non-monotonic belief revision: detect logical conflicts between new input and history, flag and hold as uncertainty, **never silently overwrite**.

## 4. Anticipatory (Proactive) AI

A proactive system holds an internal predictive model and acts before the human experiences overload. Intervention utility is a cost-benefit calculation:

`U(a) = P(goal | state, a) · Gain(a) − Cost(a)`

— intervene only when expected goal-probability × gain exceeds the interruption cost.

**Pathologies to avoid:** annoyance/disruption (erosion of autonomy, attentional disruption, contextual incongruence) and **safety dangers** of over-reliable proactivity — automation complacency, the "lullaby effect" (sustained accuracy shifts the operator from System-2 verification to passive System-1), vigilance degradation, and the dependency loop.

**Expert speaking protocols:** continuous environmental scanning; intervene only when a safety boundary is threatened; conversational grounding before speaking.

**HESTIA application (synthesis):** This is exactly why HESTIA's AI is "a professional embedded in a workflow," is exception-based, keeps sources visible, and never lulls the operator with unexplained confidence. Proactive surfacing must pass the cost-benefit bar and the 2 AM test.

## 5. Human-State Modeling & Context-Aware Reasoning

Track the user's emotional state, cognitive load, professional role, and decision-making style to (a) shape conversational understanding and (b) gate decision rights and intervention timing. In HESTIA terms: role-aware output (owner vs bar manager vs bartender), respecting relational distance, and never dumping technical detail on an owner by default.

## 6. Operational AI Governance (Decision Rights & HITL)

Decisions are classified across **eight risk vectors** (Risk, Reversibility, Financial, Human, Privacy, Operational, Reputational, Strategic) and mapped to **four execution postures**:

1. **Automated Execution** — reversible, low-risk only.
2. **Co-Created Recommendation** — AI proposes, human approves/modifies.
3. **Advisory Flagging** — AI flags anomalies; human designs the decision.
4. **Exclusive Human Ownership** — AI renders raw data only; no inference/generation.

**HITL caveats:** naïve "human in the loop" can create **"moral crumple zones"** (the operator absorbs blame without real power) and **algorithm aversion** (humans under-use even superior AI when autonomy is threatened). Design for *augmentation*, not replacement.

**HESTIA application:** HESTIA operates almost entirely in postures 2–3. High-impact DNA mutations are co-created and human-gated; the F&B feedback loop emits candidates only; nothing auto-mutates Venue DNA. This is the governance backbone of the whole product.

## 7. Agentic Workflows & Multi-Agent Orchestration

Agentic design = task decomposition into execution graphs (directed conditional graphs / runtime state machines), with sub-tasks routed to specialized reasoners and outputs synthesized. Multi-agent orchestration routes complex sub-tasks to domain brains and arbitrates their results.

**HESTIA application:** The **Specialist Intelligence Pattern** is HESTIA's disciplined version: every specialist (F&B, Service, Academy, Event, Owner, Operations, future POS/Guest/Reputation) follows one contract — **consume** shared understanding via unified context/briefs, **decide**, **record** in the Decision Ledger, **feed back** a provenance-gated candidate. All reads go through unified context; all writes go through the shared envelope — preventing silos and ensuring Venue Intelligence is the only place "truth" is confirmed.

## 8. Uncertainty Reduction (Epistemic OS)

A venue is a non-ergodic socio-technical system; decisions are compromised by incomplete, decaying information. The Uncertainty Reduction Engine distinguishes **aleatoric** uncertainty (irreducible physical randomness/noise) from **epistemic** uncertainty (reducible knowledge deficits). HESTIA's job is to **reduce** epistemic uncertainty, not pretend to eliminate it.
> Guardrail (from the source): uncertainty scores, confidence labels, memory candidates, and Venue DNA candidates are **not confirmed truth**. The engine reduces uncertainty; it does not eliminate it.

**HESTIA application:** Confidence is *coverage*, not certainty. Conversation = uncertainty reduction (Conversational Intelligence Doctrine). The next-best-question engine is an uncertainty-reduction policy (ask the one question that most reduces epistemic gap).

## 9. The Shared Memory/Provenance Envelope (the convergence target)

The master execution plan defines one envelope all of the above converge on (define now, adopt incrementally, **do not build a graph DB yet** — SQLite + JSON payloads suffice):

```
MemoryEntry / DecisionEntry
  id, venue_id, created_at, created_by, role,
  kind,            // memory_candidate | decision | feedback_candidate | ...
  specialist,      // fb | service | academy | event | owner | ops | pos
  subject_ref, content, evidence:[{source,ref,excerpt?}],
  provenance,      // owner_conversation | specialist_decision | sales_signal | ai_inference
  confidence,      // 0-100, per-source where relevant
  status,          // confirmed | candidate | assumption | conflicting | missing | decayed
  assumptions:[...], missing_fields:[...],
  human_approval, validation_target,
  venue_boundary,  // always venue_id-scoped; never cross-venue
  role_access
```

## 10. How This Pack Applies to HESTIA — Summary Rules

- Engineer **context**, don't dump it: one compact, measured, flag-gated block per specialist.
- Treat **memory** as a lifecycle: candidate → corroborated → confirmed (human-gated) → decay (candidates only).
- Make **governance** explicit: classify by risk, stay in co-created/advisory postures, keep humans in real control (avoid moral crumple zones).
- Be **anticipatory carefully**: pass the `U(a)` bar, avoid the lullaby effect, keep sources visible.
- Reduce **uncertainty**, never fake certainty: confidence = coverage; candidates ≠ truth.
- Orchestrate via the **Specialist Pattern + shared envelope**; no silos, no second writers, no graph DB until outgrown.
- Everything here is **research direction**, gated by HESTIA's provenance/confidence/role-access/venue-boundary/evidence/human-approval rules. None of it licenses fabricated intelligence.

---

### Sources
`docs/research/cognitive-architecture/Cognitive Architecture For Operational AI.md` · `CONTEXT ENGINEERING & RETRIEVAL ARCHITECTURE.md` · `02_MEMORY_EVOLUTION_AND_KNOWLEDGE_LIFECYCLE.md` · `Anticipatory AI Architecture Research.md` · `Operational AI Governance Architecture.md` · `Human state modeling & context-aware reasoning.md` · `AGENTIC WORKFLOW DESIGN & TASK EXECUTION ARCHITECTURE.md` · `05_INTELLIGENCE_ORCHESTRATION_AND_MULTI_AGENT_REASONING.md` · `Conversational Intelligence & Real-Time Understanding...md` · `2026-06-19_HOSPITALITY_CONVERSATION_INTELLIGENCE_RESEARCH.md` · `docs/research/decision-systems/HESTIA UNCERTAINTY REDUCTION ENGINE RESEARCH.md` · `docs/research/intelligence-system-design/01–03 + Hestia Venue Intelligence Architecture.md` · doctrine: `docs/architecture/CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md`, `SPECIALIST_INTELLIGENCE_PATTERN.md`, `VENUE_MEMORY_AND_DNA_GUARDRAILS.md`, master execution plan §11–§12.
