# 00 — HESTIA Research Master Index

**Purpose:** A single navigable index of HESTIA's research and architecture corpus, consolidated for the `HESTIA Research Brain` Gemini Gem.

**How to read this file:** Each entry summarizes one source document or document cluster, states its domain, key conclusions, product/implementation implications, status, related modules, and whether it should be uploaded to the Gem directly or consumed through one of the consolidated packs (`02`–`06`).

**Status vocabulary:**
- `research_only` — supporting research; not built, not doctrine.
- `partially_implemented` — some of it is live; the rest is spec/research.
- `implemented` — built and in the codebase.
- `superseded` — replaced by a newer document.
- `open` — an unresolved question or a forward plan.

**Hard rule for the Gem:** Everything in `docs/research/**` carries a research-archive note ("supporting research… not canonical product doctrine… must not create fake intelligence, fake Venue Memory, fake Venue DNA, fake KPIs, or automatic operational truth"). That note travels with every conclusion drawn from those files. Doctrine and current-state authority live in `docs/architecture/**`, `docs/plans/**`, and `docs/HESTIA_*` — not in the research corpus.

> Synthesis note: Summaries below are condensed by Claude Code from the named source files. Where a summary generalizes beyond a single document it is marked **(synthesis)**. No research conclusions were invented.

---

## A. Current-State & Source-of-Truth Documents (upload via pack `01`)

| Path | Domain | Summary | Status | Upload? |
|---|---|---|---|---|
| `docs/HESTIA_MASTER_STATE.md` | Current state | What HESTIA is/is not today; production-ready vs partially-connected vs localStorage-only systems; multi-venue (Phase 8) note. Dated 2026-06-09 — predates the Owner AI Home / Venue DNA taxonomy / Bar Intelligence work. | implemented (state doc) | via pack 01 |
| `docs/HESTIA_CTO_ROADMAP.md` | Roadmap | Connect-before-build phased roadmap (Phase 1 connection layer → Phase 4 hardening). Superseded for *product direction* by the 2026-06-21 Bar Intelligence Roadmap but still authoritative for the connection-layer engineering. | partially_implemented | via pack 06 |
| `docs/HESTIA_ARCHITECTURE_AUDIT.md` | Architecture | Module-by-module audit, persistence map, dead code, demo-data risks. (Referenced as source-of-truth; not re-summarized line-by-line here.) | implemented | reference |
| `memory/project_hestia_master_memory.md` | Institutional memory | The reasoning framework: founder context, vision, philosophy (8 principles), product domains, key discoveries, open strategic question (A10), operating modes. **The single most important orientation file.** | implemented | via pack 01 |
| `docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md` | Strategy | Operational philosophy / product direction foundation. | reference | reference |
| `docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md` | Architecture | System architecture reference (~1047 lines). | reference | reference |

---

## B. Venue DNA, Owner Discovery & Founder Intelligence (consolidated in pack `02`)

| Path | Domain | Key conclusions | Status | Upload? |
|---|---|---|---|---|
| `docs/research/venue-dna/2026-06-20_HESTIA_VENUE_DNA_TAXONOMY_AND_OWNER_DISCOVERY_COMPLETION_MODEL.md` | Venue DNA | The 35-dimension Venue DNA taxonomy; DNA ≠ brand; 8 pillars; conversation-as-discovery (not forms); answered/partial/missing/needs-confirmation states. **Core source for pack 02.** | research_only → spec'd in 9E-3 | via pack 02 |
| `docs/architecture/VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md` | Venue DNA spec | Converts the taxonomy into buildable logic: dimension contract, 9 deterministic statuses, evidence model, Working Draft threshold (OR-groups), confirmation threshold, checkmark engine, next-best-question engine, backstage UI. | research_only (spec, 9E-3A docs-only) | via pack 02 + 06 |
| `docs/architecture/VENUE_DNA_COMPLETENESS_MODEL_PHASE_9C_SPEC.md` | Venue DNA spec | Deterministic completeness model over the *current* 16-dim DNA shape (11 signal arrays + 5 confidence dims); foundation readiness computed by code, never declared by the LLM; no percentages on the main surface. Evaluator built + heavily tested. | partially_implemented | via pack 06 |
| `docs/research/category-discovery/FOUNDER INTELLIGENCE RESEARCH.md` | Founder intel | Across 10 great hospitality founders: a non-negotiable emotional standard, people-first sequence, and instinct for what NOT to do. Proposes a "Founder Digital Twin" decision filter. | research_only | via pack 02 |
| `docs/research/category-discovery/2026-06-14_FOUNDER_MEMORY_AND_VENUE_DNA_DISCOVERY.md` | Founder/DNA | Founder memory and Venue DNA discovery mechanics. | research_only | via pack 02 |
| `docs/research/category-venue-intelligence/THE VENUE INTELLIGENCE RESEARCH.md` | Venue intel | Venue as a sociotechnical "unified hospitality organism" (sensory/spatial + behavioral/human domains); understanding beyond financial lagging indicators. | research_only | via pack 02 |
| `docs/research/intelligence-system-design/Hestia Venue Intelligence Architecture.md` | Venue intel | Large architecture synthesis (~1534 lines) tying venue understanding to production AI. | research_only | via pack 02/03 |
| `docs/research/operational-memory/ORGANIZATIONAL MEMORY _ VENUE MEMORY RESEARCH.md` | Venue memory | "Hospitality amnesia": 7 vectors of knowledge loss (inter-shift, tacit, management transition, founder isolation, unconnected patterns…). Memory is the moat. | research_only | via pack 02 |
| `docs/research/operational-memory/ORGANIZATIONAL VENUE MEMORY RESEARCH.md` + `..._SUPPLEMENT.md` | Venue memory | Companion + supplement on the venue memory layer. | research_only | via pack 02 |
| `docs/research/decision-systems/HESTIA UNCERTAINTY REDUCTION ENGINE RESEARCH.md` | Decision/epistemics | Venue intelligence as an epistemic OS: aleatoric vs epistemic uncertainty; reduce (not eliminate) uncertainty; candidates ≠ confirmed truth. | research_only | via pack 02/03 |
| `docs/research/decision-systems/HESTIA_VENUE_DECISION_INTELLIGENCE_FRAMEWORK.md` + `VENUE DECISION INTELLIGENCE RESEARCH.md` | Decision | Venue decision intelligence framework + research. | research_only | via pack 02/03 |

---

## C. Cognitive & AI-System Architecture (consolidated in pack `03`)

| Path | Domain | Key conclusions | Status | Upload? |
|---|---|---|---|---|
| `docs/research/cognitive-architecture/Cognitive Architecture For Operational AI.md` | Cognitive arch | 14 tightly-coupled capabilities for long-term operational AI (perception → epistemic assembly → memory lifecycle → orchestration → governed action). | research_only | via pack 03 |
| `docs/research/cognitive-architecture/CONTEXT ENGINEERING & RETRIEVAL ARCHITECTURE.md` | Context eng | Context as a time-varying state space; 9 contextual dimensions; context bloat vs tunneling; retrieval-modality comparison (keyword/vector/hybrid/graph/episodic/semantic/rule/policy). | research_only | via pack 03 |
| `docs/research/cognitive-architecture/02_MEMORY_EVOLUTION_AND_KNOWLEDGE_LIFECYCLE.md` | Memory | Knowledge lifecycle: candidate → corroborated → stable; decay of weak signals; contradiction handling. | research_only | via pack 03 |
| `docs/research/cognitive-architecture/Anticipatory AI Architecture Research.md` | Anticipatory AI | Proactivity utility `U(a)=P(goal|state,a)·Gain(a)−Cost(a)`; pathology of annoyance; automation complacency / "lullaby effect". | research_only | via pack 03 |
| `docs/research/cognitive-architecture/Operational AI Governance Architecture.md` | Governance | 8 decision risk vectors → 4 execution postures (automated / co-created / advisory / exclusive-human); HITL "moral crumple zones". | research_only | via pack 03 |
| `docs/research/cognitive-architecture/Human state modeling & context-aware reasoning.md` | Human state | Modeling user emotion, cognitive load, role, decision style to gate intervention. | research_only | via pack 03 |
| `docs/research/cognitive-architecture/AGENTIC WORKFLOW DESIGN & TASK EXECUTION ARCHITECTURE.md` + `Agentic workflow design & task execution architecture .md` | Agentic | Task decomposition, execution graphs, multi-step agent orchestration. (Two near-duplicate files.) | research_only | via pack 03 |
| `docs/research/cognitive-architecture/05_INTELLIGENCE_ORCHESTRATION_AND_MULTI_AGENT_REASONING.md` | Multi-agent | Routing sub-tasks to specialist reasoners; synthesizing outputs. | research_only | via pack 03 |
| `docs/research/cognitive-architecture/Conversational Intelligence & Real-Time Understanding...md` + `2026-06-19_HOSPITALITY_CONVERSATION_INTELLIGENCE_RESEARCH.md` | Conversation | Real-time meaning extraction; multi-dimension-per-turn; uncertainty classification. Feeds the Conversational Intelligence Doctrine. | research_only | via pack 03 |
| `docs/research/intelligence-system-design/01_FROM_COGNITIVE_RESEARCH_TO_PRODUCTION_AI_ARCHITECTURE.md` | Bridge | How to convert cognitive research into a production architecture under HESTIA guardrails. | research_only | via pack 03 |
| `docs/research/intelligence-system-design/02_HESTIA_INTELLIGENCE_INFRASTRUCTURE_AND_MEMORY_SYSTEM.md` | Infra/memory | HESTIA-specific intelligence infrastructure + memory system design. | research_only | via pack 03 |
| `docs/research/intelligence-system-design/03_HESTIA_OPERATIONAL_DECISION_AND_WORKFLOW_INTELLIGENCE.md` | Decision/workflow | Operational decision + workflow intelligence. | research_only | via pack 03 |

---

## D. Hospitality Domain Intelligence — F&B, Service, Guest, Staff, Academy (consolidated in pack `04`)

| Path | Domain | Key conclusions | Status | Upload? |
|---|---|---|---|---|
| `docs/research/hospitality-expertise/fnb-intelligence/F&B INTELLIGENCE BEVERAGE + MENU STRATEGY RESEARCH.md` | F&B | F&B as orchestration of 9 competing forces; menu engineering (Stars/Plowhorses/Puzzles/Dogs) + labor; pour-cost discipline; zero-proof; Israeli-market structural constraints. AI owns deterministic math, *proposes* inference, never decides taste. | research_only | via pack 04 |
| `docs/research/hospitality-expertise/beverage-intelligence/HESTIA BEVERAGE INTELLIGENCE MASTER RESEARCH.md` | Beverage | Beverage intelligence as a chemical + financial + behavioral system; recipe DB → structural template → operations. | research_only | via pack 04 |
| `docs/research/hospitality-expertise/beverage-intelligence/02_HESTIA_BEVERAGE_INTELLIGENCE_ONTOLOGY_AND_KNOWLEDGE_ARCHITECTURE.md` | Beverage ontology | Beverage knowledge architecture / ontology. | research_only | via pack 04 |
| `docs/research/hospitality-expertise/service-guest-experience/SERVICE INTELLIGENCE HOSPITALITY PSYCHOLOGY RESEARCH.md` | Service | Hospitality as a relational OS, not a script engine; warmth+competence in first 30s; functional/mechanic/humanic clues; recovery as emotional repair; service style by venue/occasion. | research_only | via pack 04 |
| `docs/research/hospitality-expertise/guest-intelligence/GUEST INTELLIGENCE RESEARCH.md` | Guest | Guest as "person-in-occasion," not a segment; 6 verbs (Learn/Store/Connect/Forget/Protect/Update); confidence + expiry + minimization; absence of complaint ≠ satisfaction. | research_only | via pack 04 |
| `docs/research/organizational-learning/HESTIA_EMPLOYEE_INTELLIGENCE_STAFF_DEVELOPMENT_RESEARCH.md` | Staff | Measure "ability to create experience," not task compliance; 6 verbs (Learn/Observe/Remember/Coach/Protect/Escalate); anti-surveillance governance. | research_only | via pack 04 |
| `docs/research/organizational-learning/EMPLOYEE INTELLIGENCE STAFF DEVELOPMENT RESEARCH.md` | Staff | Companion staff-development research. | research_only | via pack 04 |
| `docs/research/hospitality-expertise/academy-training-intelligence/Training Intelligence + Academy Brain research.md` | Academy | Academy Brain that teaches judgment, not scripts; live sync between Venue Intelligence and adaptive training modules; scenario-first. | research_only | via pack 04 |
| `docs/research/hospitality-expertise/hospitality-economics/HESTIA HOSPITALITY ECONOMICS INTELLIGENCE RESEARCH.md` | Economics | "Virtuous cycle": invest in staff → lower turnover → loyal guests → pricing power; yield per sq ft / GOPPAR; economics guardrail (no invented costs/margins). | research_only | via pack 04 |

---

## E. Market Positioning, Category Creation & Reputation (consolidated in pack `05`)

| Path | Domain | Key conclusions | Status | Upload? |
|---|---|---|---|---|
| `docs/research/category-venue-intelligence/HESTIA STRATEGIC WHITE SPACE _ CATEGORY CREATION RESEARCH.md` | Category | Hospitality tech is structurally fragmented (POS/PMS/CRM/WFM siloed; ~286 hrs/yr lost). Category-creation case studies (Salesforce, Palantir, Toast, Mews…). HESTIA's wedge = the semantic/ontology layer above legacy systems. | research_only | via pack 05 |
| `docs/research/hospitality-expertise/reputation-intelligence/REPUTATION INTELLIGENCE _ MARKET POSITIONING RESEARCH.md` | Reputation | Reputation as an operational asset (sum of touchpoints); brand identity (monologue) vs public reputation (dialogue); owner vs guest semantic taxonomies. | research_only | via pack 05 |
| `docs/research/product-strategy/2026-06-19_HONEST_INVESTOR_DEMO_NARRATIVE_AND_PRODUCT_PROOF_RESEARCH.md` | Investor narrative | Honesty as architecture: data-state maturity ladder (Known/Unknown/Inferred/Candidate/Reviewed/Not-Activated); 5 compounding defensibility layers; the demo flow to show. | research_only | via pack 05 + 06 |
| `docs/research/category-venue-intelligence/HESTIA MULTI-VENUE HOSPITALITY GROUP INTELLIGENCE RESEARCH.md` | Multi-venue | Group/federated identity intelligence across venues (strict tenant isolation; future track). | research_only | via pack 05 |
| `docs/research/category-venue-intelligence/DIGITAL VENUE TWIN _ VENUE SIMULATION RESEARCH.md` | Digital twin | Venue simulation / digital-twin research (future track). | research_only | via pack 05 |
| `docs/research/category-venue-intelligence/VENUE INTELLIGENCE GRAPH _ HOSPITALITY KNOWLEDGE GRAPH RESEARCH.md` | Knowledge graph | Hospitality knowledge-graph / GraphRAG research — explicitly a *future* track, not for current prompt injection. | research_only | via pack 05 |

---

## F. Doctrine, Implementation Specs & Roadmap (consolidated in pack `06`)

| Path | Domain | Key conclusions | Status | Upload? |
|---|---|---|---|---|
| `docs/plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md` | Master plan | Venue Operating Intelligence vision; the F&B Decision Ledger keystone; phases 0–9; completion notes through Phase 8F (menu intelligence snapshot). Bidirectional law: decision → memory → candidate DNA update (never auto-confirmed). | partially_implemented (through ~8F) | via pack 06 |
| `docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md` | Product roadmap | **Current product source of truth.** HESTIA = AI Bar Intelligence platform; chat-is-home owner experience; Active Bar Programme, Prep Library, Recipe Book, Training Gantt, Academy Intelligence, Manual Tabit Upload, Venue Memory, Evidence Lifecycle. | open/forward plan | via pack 06 (upload directly) |
| `docs/plans/2026-06-19_RESEARCH_TO_IMPLEMENTATION_SYNTHESIS_INVESTOR_READY_PLAN.md` | Synthesis plan | Research → implementation synthesis for an investor-ready build. | open | via pack 06 |
| `docs/plans/2026-06-19_INVESTOR_DEMO_QA_CHECKLIST.md` | QA | Investor-demo QA checklist. | reference | via pack 06 |
| `docs/architecture/HESTIA_AI_NORTH_STAR_DOCTRINE.md` | Doctrine | Single statement of what HESTIA is (Venue OS, bidirectional, memory-centric). Canonical. | implemented (doctrine) | via pack 06 |
| `docs/architecture/CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md` | Doctrine | Conversation = uncertainty reduction; multi-dimension extraction; no redundant questions; candidates not truth. Canonical. | implemented | via pack 06 |
| `docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md` | Doctrine | Candidate vs confirmed; decay; human approval; no fabrication; no auto-mutation; `mergeVenueDna` is the only sanctioned writer. Canonical. | implemented | via pack 06 |
| `docs/architecture/SPECIALIST_INTELLIGENCE_PATTERN.md` | Doctrine | consume → decide → record → feedback contract for every specialist. Canonical. | implemented | via pack 06 |
| `docs/architecture/FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md` | Doctrine | CI/Omer is the F&B Director; Cocktail Lab is a studio over the same brain; decimal taste + ledger; no third engine. Canonical. | implemented | via pack 06 |
| `docs/architecture/DECISION_LEDGER_DOCTRINE.md` + `FNB_DECISION_LEDGER_*` | Doctrine/spec | Decision Ledger shape, write-points, provenance, candidate-only feedback, write-only-first; implementation spec + phase plans + foundation. | partially_implemented | via pack 06 |
| `docs/architecture/OWNER_AI_HOME_AND_VENUE_DNA_BUILD_MODE_PHASE_9A_SPEC.md` | Owner UX spec | AI-first Owner Home; Build Mode vs Full Intelligence Mode; OperationalPulse becomes a destination; Palette B editorial light. | research_only (spec) | via pack 06 |
| `docs/architecture/OWNER_AI_HOME_PHASE_9B_STATIC_SHELL.md` | Owner UX spec | Static shell for the Owner AI Home. | partially_implemented | via pack 06 |
| `docs/architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md` | Doctrine | Broad intelligence doctrine V1 (complements North Star set). | implemented | via pack 06 |
| `docs/architecture/HESTIA_AI_NORTH_STAR_AND_FNB_INTELLIGENCE_RECOMMENDATION.md` | Recommendation | North Star + F&B intelligence recommendation (identifies the missing decision-memory/write-back loop). | implemented | via pack 06 |
| `docs/architecture/BEVERAGE_INTELLIGENCE_FOUNDATION_LAYER.md`, `HESTIA_BAR_PRODUCT_FOUNDATION.md`, `HESTIA_BAR_PRODUCT_DATA_MODEL.md`, `HESTIA_COCKTAIL_LAB_COSTING_MODEL.md`, `HESTIA_COCKTAIL_LAB_EXPERIENCE_CHECKPOINT.md` | Bar foundation | Bar product schemas, costing-honesty model, cocktail lab experience. | partially_implemented | reference / via pack 04 |
| `docs/architecture/HESTIA_PHASE_2_CHECKPOINT.md`, `HESTIA_PHASE_8_MULTI_VENUE.md`, `HESTIA_SHIFT_BRAIN_V1.md` | Architecture | App.jsx decomposition (internal Phase 2); multi-venue (Phase 8); Shift Brain V1. | implemented | via pack 01 |
| `docs/architecture/HESTIA_PROJECT_INTELLIGENCE_AUDIT.md`, `REPOSITORY_ARCHITECTURE_MAP.md`, `REFACTORING_MASTER_PLAN.md`, `ARCHITECTURE.md` | Architecture | Intelligence audit, repo map, refactoring plan, architecture overview. | implemented | reference |
| `docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_*`, `FNB_DIRECTOR_BRIEF_FOUNDATION.md`, `FNB_MENU_INTELLIGENCE_SNAPSHOT_FOUNDATION.md`, `FNB_TO_VENUE_INTELLIGENCE_*` | Specs | Academy instructor package + audit; F&B director brief; menu intelligence snapshot; F&B→Venue feedback candidate foundation. | partially_implemented | reference / via pack 04/06 |
| `docs/KNOWLEDGE_GOVERNANCE.md`, `docs/architecture/RESEARCH_ARCHIVE_USAGE_RULES.md` | Governance | How research becomes doctrine/modules, never prompt fuel; guardrails before code. Canonical. | implemented | via pack 06 + 07 |

---

## G. Intentionally Excluded From Direct Upload

These exist in the repo but are **not** consolidated into the Gem packs (rationale in pack `00`/final report):

- README/organization files (`docs/research/README.md`, `RESEARCH_DIRECTORY_ORGANIZATION_REPORT.md`, per-folder `README.md`, `MARKDOWN_DOCUMENTATION_AUDIT.md`, `docs/DOCUMENT_MAP.md`) — navigation only, no research content.
- Near-duplicate files (the two `Agentic workflow design…` files; the archived `_archive/HESTIA_Intelligence_Doctrine_v1_research_draft.md`) — superseded/duplicated; summarized once above.
- `docs/architecture/HESTIA_SKILL_ALIGNMENT_AUDIT.md`, `CLAUDE_REFACTORING_EXECUTION_GUIDE.md` — internal process docs, not research.
- Any `.env`, database, build, or runtime artifacts — never included (secrets/PII rule).

---

## Recommended Gem upload set

For the leanest, highest-signal Gem, upload **these eight files only** (this folder):
`00`–`07`. They consolidate the corpus. If the Gem needs primary depth on a specific track, additionally attach the single source doc named in the relevant pack's source list (e.g. the 2026-06-20 Venue DNA taxonomy research, or the 2026-06-21 Bar Intelligence Roadmap).
