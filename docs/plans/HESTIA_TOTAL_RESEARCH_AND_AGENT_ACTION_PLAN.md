# HESTIA Total Research & Agent Action Plan

**Created:** 2026-06-21
**Mode:** Read-only research / doctrine / agent-planning audit (no production code touched)
**Author:** Claude Code (Opus 4.8)
**Label legend used throughout:** `Verified in repo` · `Verified in docs only` · `Inferred` · `Strategic recommendation` · `Unverified` · `Missing` · `Stale` · `Dangerous if treated as implementation truth`

> This document is a planning artifact. It is **not** doctrine, **not** a roadmap override, and **not** an implementation. Nothing here promotes itself above the existing authority hierarchy in `docs/KNOWLEDGE_GOVERNANCE.md`. Where it recommends, it labels the recommendation as such.

---

## 0. Git / Repo State

| Item | Value |
|---|---|
| Branch | `main` |
| Latest commit | `e77974f` — `docs: correct AI provider and VITE Gemini risk claims` |
| HEAD vs origin/main | **Identical.** `git rev-parse HEAD` == `git rev-parse origin/main` == `e77974fa5a7c2094c261a9aba054bbd34406c3f0`. Local matches origin exactly. |
| Working tree before this task | One untracked file only: `docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md` |
| Untracked files (before) | `docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md` (untracked, not yet committed) |
| `docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md` | Exists; **untracked** (`git ls-files` returns empty for it). **Left untouched** by this task — read only. |
| `docs/plans/HESTIA_TOTAL_RESEARCH_AND_AGENT_ACTION_PLAN.md` (this file) | Did **not** exist before; created by this task. |
| Files created by this task | This file only. |
| Files modified by this task | None. |
| Production code touched | **None.** No `src/`, `server.js`, `package.json`, `package-lock.json`, auth, venue scoping, role logic, DB migrations, or Venue DNA logic modified. |
| Working tree after this task | Two untracked files: the pre-existing audit + this new plan. No tracked files changed. |

---

## 1. Executive Summary

**Overall state:** HESTIA's research/doctrine/agent layer is **unusually rich and unusually disciplined** — and **over-documented relative to what is wired.** The thinking is strong. The governance is real. The code lags the doctrine by design, but the gap between "documented as a system" and "executable as a system" is the central risk.

**Coherent or fragmented?** Coherent in *intent*, fragmented in *authority surface*. There are at least nine overlapping authority layers (master memory → master state/audit/roadmap → CLAUDE.md/AGENTS.md → architecture doctrine set → gem packs → KNOWLEDGE_GOVERNANCE → skills → external `.agents` → settings.local.json). Each is individually good. Together they create real navigation cost and at least one live truth conflict (see below).

**Under-built, under-connected, over-documented, or under-governed?** HESTIA is **under-connected and over-documented, not under-built.** This is the founder's own confirmed conclusion (`memory/project_hestia_master_memory.md` A5: "The codebase is under-connected, not under-built"). The doctrine layer has now grown faster than the connection work it was meant to guide. Governance exists in prose but is **under-*enforced*** — almost nothing is mechanically checked.

**The single live truth conflict (must be resolved):** Two roadmaps both claim authority.
- `docs/HESTIA_CTO_ROADMAP.md` (2026-06-09): connect-before-build, Phase 1 = operational connection layer. Referenced as source-of-truth by `CLAUDE.md`, `HESTIA_MASTER_STATE.md`, and `master_memory`.
- `docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md` (2026-06-21): reframes HESTIA as an **AI Bar Intelligence platform** with role-based nav and a chat-first owner home. The gem master index calls this **"Current product source of truth"** and says it *supersedes the CTO roadmap for product direction*. Commit `d1527b8` already shipped its Phase 1 nav re-skin.

So the master memory (2026-06-14) and master state (2026-06-09) now **predate and partially contradict** the current product framing. This is a `Stale` condition in Tier-1/Tier-2 documents — the most authoritative files are the most out of date. **This is the highest-priority doctrine fix.**

**The single biggest missing bridge:** an **executable Evidence → Recommendation → Human Decision → Outcome → Memory ledger** — the chain the prior Agent OS audit already named. It is heavily *documented* (Bar Intelligence Roadmap §19, `VENUE_MEMORY_AND_DNA_GUARDRAILS`, `DECISION_LEDGER_DOCTRINE`, `SPECIALIST_INTELLIGENCE_PATTERN`) and *partially* built (`decisionLedgerService.js`, `venue_intelligence_candidates`, `mergeVenueDna`) but there is **no unified evidence/outcome/agent-run contract**. The bridge is half-built on the F&B side and absent elsewhere.

**Direct verdict:** The research and doctrine are an asset, not a liability — *if* treated as research and doctrine. The danger is the volume creating an illusion that the intelligence backbone is built. It is not. The next moves are **truth-cleanup + small executable enforcement**, not more research and not a big intelligence build.

---

## 2. Source Map — What Exists

> Classification per the task vocabulary. "Trust level" = how much an agent should rely on it as *current implementation truth*. This is a curated map of the high-signal files, not an exhaustive line listing (the repo has ~150+ HESTIA docs; full file list captured in §18).

### 2A. Current-state / source-of-truth

| File / folder | Type | Topic | Currentness | Trust | Should be used as | Notes |
|---|---|---|---|---|---|---|
| `memory/project_hestia_master_memory.md` | Institutional memory | Vision, philosophy, roadmap, discoveries, open question | 2026-06-14 — **partially stale** (predates Bar Intelligence pivot) | High for *thinking*, medium for *current product framing* | canonical current source (reasoning) | Tier-1 authority. Still says "Phase 1 = operational connection layer pending." Needs a pivot note. |
| `docs/HESTIA_MASTER_STATE.md` | State doc | What's built/connected/missing | 2026-06-09 — **stale on product direction** | High for module status, low for nav/owner-home posture | canonical current source (module status) | Multi-venue note (Phase 8) is newer than the doc's own date — internal drift. |
| `docs/HESTIA_ARCHITECTURE_AUDIT.md` | Audit | Module-by-module, persistence map | Referenced as SoT; not re-read here | High | canonical current source | Not opened in this pass; trusted via cross-refs. |
| `docs/HESTIA_CTO_ROADMAP.md` | Roadmap | Connect-before-build phased plan | 2026-06-09 — **superseded for product direction** | Medium | roadmap (engineering connection layer only) | Still authoritative for *how to wire connections*; not for *what HESTIA is now*. |
| `CLAUDE.md` | Operating instructions | Architecture rules, nav posture | Current (synced Phase 1 nav, commit `6f5f2c5`) | High | canonical current source (agent rules) | Most up-to-date on nav posture. Good anchor. |
| `AGENTS.md` | Operating instructions | Codex/agent session rules | Current-ish; references old App.jsx line count (352 vs CLAUDE's 377) | Medium-high | current support doc | Minor drift vs CLAUDE.md. |
| `docs/KNOWLEDGE_GOVERNANCE.md` | Governance | Authority hierarchy, epistemic labels | 2026-06-14 | High | canonical current source (governance) | Strong. The 8-tier hierarchy is the single best ordering doc. |
| `docs/DOCUMENT_MAP.md` | Navigation | Doc index | Current | Medium | current support doc | Navigation only. |

### 2B. Doctrine (canonical AI-systems layer)

| File | Type | Currentness | Trust | Use as | Notes |
|---|---|---|---|---|---|
| `docs/architecture/README_HESTIA_AI_DOCTRINE_INDEX.md` | Doctrine index | 2026-06-18 | High | canonical reading order | Phase 0 of Master Execution Plan. |
| `docs/architecture/HESTIA_AI_NORTH_STAR_DOCTRINE.md` | Doctrine | Current | High | canonical | "Read first" for AI work. |
| `docs/architecture/VENUE_MEMORY_AND_DNA_GUARDRAILS.md` | Doctrine | Current | High | canonical (safety) | `mergeVenueDna` = only sanctioned writer; candidate≠confirmed; no auto-mutation. **Verified in repo** (see §5). |
| `docs/architecture/CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md` | Doctrine | Current | High | canonical | Conversation = uncertainty reduction. |
| `docs/architecture/SPECIALIST_INTELLIGENCE_PATTERN.md` | Doctrine | Current | High | canonical | consume→decide→record→feedback contract. |
| `docs/architecture/FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md` | Doctrine | Current | High | canonical | CI/Omer = the F&B Director; no third engine. |
| `docs/architecture/DECISION_LEDGER_DOCTRINE.md` + `FNB_DECISION_LEDGER_*` | Doctrine + spec | Current | High (partially implemented) | implementation-relevant spec | Ledger is real (`decisionLedgerService.js`). |
| `docs/architecture/HESTIA_INTELLIGENCE_DOCTRINE_V1.md` | Doctrine | Current | High | canonical (broad) | Complements Phase 0 set. |
| `docs/architecture/RESEARCH_ARCHIVE_USAGE_RULES.md` | Governance | Current | High | canonical (gate) | "Do not implement from research directly." |

### 2C. Venue DNA / Owner AI specs (the active build frontier)

| File | Type | Currentness | Trust | Use as | Notes |
|---|---|---|---|---|---|
| `docs/architecture/VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md` | Spec | Current | Medium (docs-only / 9E-3A) | implementation-relevant spec | 35-dim taxonomy → deterministic statuses. **Not yet runtime constants.** |
| `docs/architecture/VENUE_DNA_COMPLETENESS_MODEL_PHASE_9C_SPEC.md` | Spec | Current | Medium-high (partially implemented) | implementation-relevant spec | Evaluator built + tested (`venueDnaCompletenessEvaluator.js`). |
| `docs/architecture/VENUE_DNA_PROMOTION_GUARDRAILS_PHASE_7B_*` | Audit + plan | Current | Medium | implementation-relevant spec | Promotion guardrails. |
| `docs/architecture/VENUE_INTELLIGENCE_CANDIDATE_REVIEW_PHASE_7_PLAN.md` | Plan | Current | Medium | roadmap | Candidate review (7A wired). |
| `docs/architecture/OWNER_AI_HOME_AND_VENUE_DNA_BUILD_MODE_PHASE_9A_SPEC.md` | Spec | Current | Medium (research/spec) | implementation-relevant spec | Build Mode vs Full Intelligence Mode. |
| `docs/architecture/OWNER_AI_HOME_PHASE_9B_STATIC_SHELL.md` | Spec | Current | Medium (partially implemented) | implementation-relevant spec | `OwnerAIHome.jsx` exists. |
| `docs/research/venue-dna/2026-06-20_..._COMPLETION_MODEL.md` | Research | Current | research_only | research_only | Source for 9E-3 taxonomy. |

### 2D. Research corpus (`docs/research/**`, `docs/gems/**`)

| File / cluster | Type | Topic | Trust | Use as | Notes |
|---|---|---|---|---|---|
| `docs/gems/hestia-research-brain/00`–`07` | Gem packs | Consolidated research brain | research_only (packs), but `01` & `06` carry current-state | inspiration_only / research_only | `00` index is the best single map of the research corpus. Pack `06` lists doctrine — treat doctrine via the architecture files, not the pack. |
| `docs/research/cognitive-architecture/*` (~12 files) | Research | Cognitive/agentic/memory architecture | research_only | inspiration_only | Abstract. Several near-duplicates (two "Agentic workflow…" files). `Dangerous if treated as implementation truth` — multi-agent/anticipatory content. |
| `docs/research/category-venue-intelligence/*` | Research | Category creation, venue twin, knowledge graph, multi-venue | research_only | inspiration_only | Digital twin / knowledge graph = explicit future tracks. |
| `docs/research/operational-memory/*` | Research | Venue memory / "hospitality amnesia" | research_only | research_only | Strong framing of the moat. |
| `docs/research/decision-systems/*` | Research | Uncertainty reduction, decision intelligence | research_only | research_only | Epistemic framing feeds doctrine. |
| `docs/research/hospitality-expertise/*` | Research | F&B, beverage, service, guest, staff, economics | research_only | research_only / convert to PRD | The most product-convertible research. |
| `docs/research/category-discovery/*` | Research | Founder intelligence, founder memory | research_only | research_only | "Founder Digital Twin" = speculative. |
| `docs/research/product-strategy/2026-06-19_HONEST_INVESTOR_DEMO_*` | Research | Honesty-as-architecture, data-state ladder | research_only | convert to PRD | The data-state maturity ladder is directly product-relevant. |
| `docs/cocktail-intelligence/research/*`, `docs/event-design/research/*`, `docs/academy/research/*` | Research (incl. PDFs) | Domain research | research_only | inspiration_only | PDFs not parsed in this pass. |

### 2E. Plans / roadmaps

| File | Type | Trust | Use as | Notes |
|---|---|---|---|---|
| `docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md` | Roadmap | High (current product direction) | roadmap (current product) | The active product framing. Phase 1 nav shipped. |
| `docs/plans/HESTIA_AI_MASTER_EXECUTION_PLAN.md` | Master plan | Medium-high (through ~8F) | roadmap | Venue Operating Intelligence + Decision Ledger keystone. |
| `docs/plans/2026-06-19_RESEARCH_TO_IMPLEMENTATION_SYNTHESIS_INVESTOR_READY_PLAN.md` | Plan | Medium | roadmap | Synthesis plan. |
| `docs/plans/2026-06-19_INVESTOR_DEMO_QA_CHECKLIST.md` | QA | Medium | reference | Demo QA. |
| `docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_CODEBASE_AUDIT_2026-06-21.md` (in `docs/audits/`) | Audit | Medium | audit artifact | Codebase audit behind the nav re-skin. |

### 2F. Agent / skill / governance layer

| File / folder | Type | Trust | Use as | Notes |
|---|---|---|---|---|
| `skills/user/` (14 skills) | HESTIA skill pack | High (doctrine), prose-only | current support doc / convert to checks | Strong & aligned. See §10. |
| `.agents/skills/` (2 external taste skills) | External skills | Low for HESTIA | external / manual-only | `Leonxlnx/taste-skill`. Conflict with HESTIA UI doctrine. |
| `.claude/settings.local.json` | Local permissions | N/A | external / manual-only | **Dangerous if shared as project policy** — allows git push/commit, broad shell. Local machine config only. |
| `skills-lock.json` | Provenance lock | Safe | reference | Proves `.agents` skills are external. |
| `scripts/hestia-check.js` | QA script | Medium | current support doc | Real but partial (git state, build, critical files, secret scan). Not an Agent OS gate. |
| `docs/design/HESTIA_SKILLS_PIPELINE_RESEARCH.md` | Governance | Medium | current support doc | Best rationale for gated skill sequence. |
| `docs/architecture/HESTIA_SKILL_ALIGNMENT_AUDIT.md` | Audit | Medium | audit artifact | Skill alignment. |
| `docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md` | Audit | Medium | audit artifact (untracked) | The prior Agent OS audit. This plan extends it. |

### 2G. Duplicates / consolidation candidates

- Two `Agentic workflow design…` files (case-different names) in `cognitive-architecture/` — `duplicate / needs consolidation`.
- `ORGANIZATIONAL MEMORY _ VENUE MEMORY RESEARCH.md` + `ORGANIZATIONAL VENUE MEMORY RESEARCH.md` + `..._SUPPLEMENT.md` — overlapping; consolidate references.
- `docs/research/researches for Venue Intelligence/_archive/HESTIA_Intelligence_Doctrine_v1_research_draft.md` — explicitly `NON-CANONICAL` (per doctrine index §4). `stale`.
- `src/data/systemConfig.js` vs `src/config/systemConfig.js` — duplicate (roadmap Phase 4 cleanup).

---

## 3. Canonical Reading Order (by task type)

> This is the **proposed** routing, harmonized with `KNOWLEDGE_GOVERNANCE.md` §2 and the doctrine index. The universal preamble applies to every task.

**Universal preamble (every task):**
1. `memory/project_hestia_master_memory.md` (Tier 1 — thinking + constraints)
2. `docs/KNOWLEDGE_GOVERNANCE.md` (authority hierarchy + epistemic labels)
3. `CLAUDE.md` (current agent rules + nav posture)

Then, per task:

### Production code change
- **Required:** `HESTIA_MASTER_STATE.md`, `HESTIA_ARCHITECTURE_AUDIT.md`, `HESTIA_CTO_ROADMAP.md`, `HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md` (reconcile the two — see §1), `AGENTS.md`.
- **Optional:** relevant `docs/architecture/*` checkpoint for the module.
- **Avoid / inspiration-only:** `docs/research/**`, `.agents/**`.
- **Skills:** `hestia-skills-orchestrator` first, then `hestia-product-design-judgment`, then the domain skill.
- **Checks:** `npm run hestia:check`; `npm run build`; relevant `scripts/test-*.js`.

### Read-only audit
- **Required:** the three SoT docs + this plan + the prior Agent OS audit.
- **Avoid:** running `npm run build` / `hestia:check` (they can write `dist/`) unless the user approves. Read-only audits must not mutate the tree.
- **Skills:** `hestia-skills-orchestrator`, `hestia-venue-memory-provenance`.

### UI / design task
- **Required:** `skills/user/hestia-ui-design/SKILL.md` (mandatory per CLAUDE.md), `hestia-product-design-judgment`.
- **Optional:** the domain UI skill (operational / venue-intelligence / event-manager / beverage / academy).
- **Inspiration-only:** `.agents/skills/high-end-visual-design`, `imagegen-frontend-web` — **never** production authority.
- **Checks:** manual 2 AM / mobile / role-visibility review.

### Venue Intelligence task
- **Required:** `VENUE_MEMORY_AND_DNA_GUARDRAILS.md`, `CONVERSATIONAL_INTELLIGENCE_DOCTRINE.md`, `VENUE_DNA_COMPLETENESS_MODEL_PHASE_9C_SPEC.md`, `VENUE_DNA_TAXONOMY_IMPLEMENTATION_SPEC_PHASE_9E3.md`, `hestia-venue-intelligence-ui`, `hestia-venue-memory-provenance`.
- **Avoid:** mutating `mergeVenueDna` callers; any candidate→DNA auto-path.
- **Checks:** `scripts/test-venue-dna-completeness*.js`, `scripts/test-venue-intelligence-*.js`, `scripts/inspect-current-venue-dna-state.js`.

### Event Manager task
- **Required:** `hestia-event-manager-ui`, `HESTIA_MASTER_STATE.md` (event status), the Zohar discoveries in master memory A5.
- **Avoid:** touching `buildZoharBrief()` / `useEventState` (locked systems); rendering `eventBrainDemoData` when a real event is linked.
- **Checks:** `npm run build`.

### F&B / Beverage task
- **Required:** `FNB_DIRECTOR_INTELLIGENCE_DOCTRINE.md`, `DECISION_LEDGER_DOCTRINE.md`, `SPECIALIST_INTELLIGENCE_PATTERN.md`, `VENUE_MEMORY_AND_DNA_GUARDRAILS.md`, `hestia-beverage-intelligence-ui`, bar foundation docs.
- **Avoid:** fake prices/margins/suppliers; using benchmark costs as verified.
- **Checks:** `scripts/test-beverage-intelligence-foundation.js`, `scripts/test-fb-decision-ledger.js`, `scripts/test-menu-intelligence.js`, `scripts/test-fnb-*.js`.

### Academy task
- **Required:** `hestia-academy-design-curriculum`, `hestia-academy-experience`, academy docs in `docs/academy/`.
- **Avoid:** treating completion as capability; LMS/gamification patterns; renaming instructors (Mira/Theo/Daniel/Noa are fixed).
- **Checks:** manual capability-vs-completion review.

### Owner AI task
- **Required:** `OWNER_AI_HOME_*` specs, `hestia-operational-intelligence-ui`, `HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md` (owner nav), `VENUE_MEMORY_AND_DNA_GUARDRAILS.md`.
- **Avoid:** fake KPIs; activating owner pages whose data source is empty (roadmap rule).
- **Checks:** `scripts/test-owner-ai-home-completeness-ui.js`.

### Research / strategy task
- **Required:** `RESEARCH_ARCHIVE_USAGE_RULES.md`, `KNOWLEDGE_GOVERNANCE.md`, master memory A10/A12 (modes).
- **Mode discipline:** declare Mode 2 (strategic) / Mode 3 (research). Preserve uncertainty. Output = hypotheses, not decisions.
- **Avoid:** converting research to roadmap silently.

### Skill / agent / governance task
- **Required:** this plan, the prior Agent OS audit, `HESTIA_SKILLS_PIPELINE_RESEARCH.md`, `skills-lock.json`, `.claude/settings.local.json` (review, do not copy).
- **Avoid:** copying external `.agents` skills into `skills/user/` as authority; sharing settings.local.json as policy.

---

## 4. Research Quality Assessment

> For each pack: what's valuable / relevant / too abstract / implementation-ready / speculative / missing evidence / convert-to-PRD / convert-to-code / leave-as-research.

### Research Brain Gem packs (`docs/gems/00`–`07`)
- **Valuable:** the consolidation + the `00` index + the hard rule that research-archive notes travel with every conclusion.
- **Implementation-ready:** none directly — they are a *map*, not a spec.
- **Speculative:** the multi-agent and digital-twin entries.
- **Convert:** keep as the Gemini Gem knowledge base. Do **not** treat pack `06`'s "doctrine" entries as authority — go to the architecture files. **Leave as research/reference.**

### Cognitive architecture (`docs/research/cognitive-architecture/`)
- **Valuable:** memory lifecycle (candidate→corroborated→stable), context engineering, governance postures (automated/co-created/advisory/exclusive-human), anticipatory-AI pathologies.
- **Too abstract:** most of it for an MVP. **Dangerous if treated as implementation truth:** multi-agent orchestration, anticipatory utility functions.
- **Convert to code/schema:** the memory-lifecycle states and the 4 governance postures → these belong in the EvidenceItem/Recommendation contracts (§12). **The rest stays research.**

### Venue DNA / Owner Discovery
- **Valuable & implementation-ready:** the 35-dimension taxonomy + 9 deterministic statuses (9E-3 spec). This is the most build-ready research-derived artifact in the repo.
- **Convert to code (gated):** taxonomy → pure constants + tests (Phase 3 of §13). **Not** runtime-wired until the contract layer exists.
- **Speculative:** "Founder Digital Twin" — leave as research.

### F&B / Service / Guest / Staff
- **Valuable & most product-convertible:** menu engineering (Stars/Plowhorses/Puzzles/Dogs), pour-cost discipline, the "AI owns deterministic math, proposes inference, never decides taste" rule, the 6-verb guest/staff models.
- **Convert to PRD:** menu engineering surfaces; staff-development "ability to create experience" metric.
- **Missing evidence:** all of it lacks *this venue's* operational data — which is exactly why the Tabit upload + evidence ledger matters.

### Market positioning / category creation
- **Valuable:** the structural-fragmentation thesis (semantic layer above legacy systems) and the **data-state maturity ladder** (Known/Unknown/Inferred/Candidate/Reviewed/Not-Activated).
- **Convert to PRD:** the maturity ladder → it should govern every owner-facing surface (honesty-as-architecture). **Strategic recommendation.**
- **Speculative:** category-name claims — leave as strategy.

### Academy research
- **Valuable:** judgment-not-scripts, scenario-first, capability≠completion, live sync between Venue Intelligence and training.
- **Convert to code:** capability-vs-completion distinction → an evidence-typed field, not a boolean. **The rest is curriculum doctrine** (already in skills).

### Event / Zohar research
- **Valuable & largely implemented:** Zohar is a deterministic engine (90 tests). The event-design research (Visual DNA, creative brief) is `research_only` and partly speculative (image generation).
- **Convert:** nothing new — Zohar is built. **Leave design research as inspiration.**

### Bar / Beverage / Omer research
- **Valuable & partly implemented:** beverage ontology, costing honesty (live in Cocktail Lab). Supplier maps are `market_reference_only`.
- **Convert to code:** already partly done. **Guard:** no costing on unsourced data.

### Owner AI / Business Memory / Operational Intelligence research
- **Valuable:** the bidirectional law (decision→memory→candidate DNA, never auto-confirmed) and the decision-ledger keystone.
- **Implementation-ready & partly built:** Decision Ledger. **Convert to code:** extend the ledger to the unified contract (§12).

### Design / luxury UX research
- **Valuable:** Palette A/B split, editorial-vs-operational worlds, anti-dashboard language.
- **Risk:** "HESTIA is a world they inhabit" can over-design. **Leave as design doctrine** (skills), gate behind product-judgment.

### Skills / Agent OS research
- **Valuable:** the gated skill sequence. **Convert to checks:** the no-fake-data / provenance rules → `hestia-agent-os-check.js` (§11).

---

## 5. Codebase Reality Check

> **No implementation is claimed unless verified by reading the code in this pass.** Verifications below are grounded in `server.js`, `src/services/venueBridge/`, `src/services/venueIntelligence/`, and `src/features/`.

| Claim | Source doc | Code evidence | Status | Risk | Notes |
|---|---|---|---|---|---|
| `mergeVenueDna` is the only sanctioned Venue DNA writer | VENUE_MEMORY_AND_DNA_GUARDRAILS | `server.js:5799` def, `:5905` sole caller; review path explicitly "NEVER calls mergeVenueDna" (`:5948`) | **implemented** | Low | Strong. Single writer confirmed. |
| `venue_intelligence_candidates` exists, signal-only, no candidate→DNA auto-path | Phase 7 plan / guardrails | `server.js:1190`, `:5946-5950` route comments; review = owner/admin only | **implemented** (7A) | Low | Candidates are reviewable but **not** promotable to DNA in code. Promotion tier still `Missing`. |
| F&B Decision Ledger (write-only-first, provenance, candidate-only feedback) | DECISION_LEDGER_DOCTRINE | `src/services/venueBridge/decisionLedgerService.js` — DI db, no AI, no DNA writes, 3 live write points | **partially implemented** | Low | Best-built piece of the backbone. Many decision types "reserved" not yet wired. |
| Menu Intelligence Snapshot | FNB_MENU_INTELLIGENCE_SNAPSHOT_FOUNDATION | `menuIntelligenceService.js` present | **partially implemented** | Medium | Existence verified; depth not audited this pass. |
| F&B → Venue Intelligence feedback candidates | FNB_TO_VENUE_INTELLIGENCE_*_FOUNDATION | `fnbVenueFeedbackService.js` present | **partially implemented** | Medium | Candidate generation path. |
| Venue DNA completeness model (deterministic, code-computed, no LLM declaration) | Phase 9C spec | `venueDnaCompletenessEvaluator.js` + `scripts/test-venue-dna-completeness*.js` | **partially implemented** | Low | Evaluator built + tested. |
| Owner AI Home (chat-first owner landing) | Phase 9A/9B + Bar Roadmap | `OwnerAIHome.jsx`; nav re-skin commit `d1527b8` | **partially implemented** | Medium | Static shell + landing wired; "Full Intelligence Mode" partial. |
| Owner default landing = `ownerHome` | CLAUDE.md Phase 1 nav | `navigationConfig.js` / `roleConfig.js` (per CLAUDE.md) | **implemented** | Low | Confirmed via CLAUDE.md; route gating in nav config. |
| Venue Memory as a unified store | Bar Roadmap §18, research | **No `venue_memory` table.** Distributed across `business_memory`, `venue_intelligence`, `venue_briefs`, `venue_dna_enrichment` | **documented only / missing as a unified layer** | **High** | "Venue Memory" is a *concept*, not a single implemented store. Do not describe it as a built subsystem. |
| Event Manager / Zohar brief engine | Master state | `buildZoharBrief()` (locked), `EventZohar.jsx` | **implemented** | Low | Deterministic, 90 tests (per docs). |
| Academy platform (130+ lessons) | Master state | Academy features present; no assessment engine | **partially implemented** | Low | Completion≠capability; no quiz runner. |
| Service / Shift Intelligence (Shift Brain V1, event-blind) | Shift Brain V1 | `shiftBrainService.js`; event-load signal is Phase 1 item 1.2 (not yet wired) | **partially implemented** | Low | Deterministic core built; event-aware not yet. |
| Business Memory | Master state | `business_memory` table (`server.js:413`); `addBusinessMemoryEvent` | **partially implemented** | Medium | Table exists; post-event memory write is Phase 2 (not yet). |
| AI providers | master memory A7 / commit `e77974f` | Two providers: OpenAI (flagship visual/menu) + Gemini. `VITE_GEMINI_API_KEY` flagged | **implemented** | **Security: medium-high** | `e77974f` corrected docs: flagship flows use OpenAI gpt-4o-mini; `VITE_GEMINI_API_KEY` code-remediated but needs local `.env` operator verification. **Not inspected here (no secrets read).** |
| Role / venue scoping (`X-HESTIA-Venue`, `requireAuth` → `req.venueId`) | Phase 8 | `requireAuth` + venue-scoped routes; candidate review role-gated | **implemented** | Low | Multi-venue scoping live. |
| Fake/demo data risk (`eventBrainDemoData`) | master memory A5 | **10 files** import demo data (Cohen-Levi Wedding) incl. `ZoharPanel`, `BarProgramme`, `StaffNotifications`, `EventArchitectPrintableBrief`, `PlanningSummary`, `EventBriefCard`, `SelectedTablePanel`, `eventArchitectAdapter` | **contradicted by code (still present)** | **High** | Phase 2 de-mock not done. Highest credibility risk. |
| localStorage risks (Cocktail Lab, budget/employee/assigned tasks, owner notes) | master state | Documented; not re-verified this pass | **documented only** | Medium | Phase 3 migrations. |
| HOSPIA legacy naming (`hospia.*` keys, `X-HOSPIA-Role`?) | CLAUDE.md / master memory A7 | CLAUDE.md says `X-HOSPIA-Role`; Phase 8 doc says `X-HESTIA-Venue`. **Two header conventions coexist** | **partially migrated** | Medium | Role header still `HOSPIA`; venue header is `HESTIA`. Migration debt confirmed. |
| Tabit / POS ingestion | Bar Roadmap §16 | No Tabit upload code found this pass | **missing (planned)** | Low | Explicitly MVP-future. Must follow evidence contracts first. |
| Full Intelligence Mode | Phase 9A spec / OwnerAIHome | Referenced in `OwnerAIHome.jsx` + spec | **partially implemented (gated)** | Medium | Must stay gated; not an early unlock. |
| 9E-3 taxonomy as runtime constants | 9E-3 spec | **No taxonomy constants module found** | **missing (docs-only / 9E-3A)** | Low | Spec is docs-only by design. |
| 9D confirmation tier | (referenced in task) | **No explicit 9D confirmation-tier code found** | **missing** | Medium | The human-confirmation tier between candidate and DNA is not built. |
| candidate → DNA promotion | guardrails | Explicitly **absent** by design (`:5949` "HAS NO candidate→DNA path") | **intentionally missing** | Low (this is correct) | Must not be added before a confirmation tier. |

**Net reality:** The F&B/Venue-DNA backbone is the **most real** part (ledger + candidates + completeness evaluator + single DNA writer). "Venue Memory" as one store, the unified evidence/outcome/agent-run contract, the 9D confirmation tier, candidate→DNA promotion, and Tabit ingestion are **not built**. Demo-data contamination is **still live**. The doctrine is ahead of the code — correctly, but the gap must not be narrated as built.

---

## 6. What Is Good

**Product vision strengths**
- A genuinely operator-grounded thesis (founder is a working bartender/consultant). Memory-as-moat, exception-not-dashboard, hospitality-native language. The "what HESTIA is NOT" list is sharp and consistently applied.
- The open strategic question (A10) is preserved honestly instead of being prematurely answered.

**Architecture strengths** (`Verified in repo`)
- Clean composition: App.jsx orchestration-only, hooks own state, features own UI, services own intelligence.
- A single sanctioned Venue DNA writer (`mergeVenueDna`) with an explicit "review never mutates DNA" guarantee — rare discipline.
- Venue-scoped multi-tenant request model already live (`req.venueId`).
- A real, dependency-injected, AI-free **Decision Ledger** service — the keystone the doctrine calls for, actually started.

**Intelligence strengths**
- Deterministic engines first (Zohar 90 tests, Shift Brain, costing honesty, DNA completeness evaluator). AI augments, never replaces.
- Candidate ≠ confirmed is enforced in code, not just prose.

**UX / design strengths**
- A complete, opinionated design system (Palette A/B, editorial-vs-operational worlds, 2 AM test). Anti-generic-SaaS doctrine is explicit.

**Agent / skill strengths**
- 14 HESTIA-specific skills that are directionally correct and hospitality-bound. A skills orchestrator that gates work. External taste skills correctly quarantined by provenance lock.

**QA strengths**
- `hestia-check.js` exists and guards git state, build, critical files, and secret patterns. ~15 domain test scripts (`scripts/test-*.js`) exist for beverage, ledger, DNA completeness, owner-home, investor-demo, venue-intelligence chat.

**Doctrine strengths**
- A real authority hierarchy (`KNOWLEDGE_GOVERNANCE`) with epistemic labels. A doctrine index with explicit reading order. Research-archive usage rules that forbid implementing from research directly. This is better governance than most early-stage products ever build.

---

## 7. What Is Weak / Risky

**Repo / code risks**
- Demo-data contamination still live in **10 event files** (`eventBrainDemoData`). `High` — most credibility-damaging gap.
- Two header conventions coexist (`X-HOSPIA-Role` + `X-HESTIA-Venue`). Migration debt.
- localStorage-only domains (Cocktail Lab, budget/employee/assigned/owner-notes) — persistence risk.
- "Venue Memory" described as a subsystem but **not implemented as a unified store** — risk of narrating a concept as a built feature.

**Documentation truth risks** (the biggest category)
- **Two competing roadmaps**; Tier-1/Tier-2 docs (master memory, master state) are stale on product direction. An agent reading them in good faith will build the wrong thing.
- Nine overlapping authority layers; minor drift even within them (App.jsx 352 vs 377 lines; master state's own date vs its Phase 8 note).
- Research that "sounds implementation-ready" (cognitive architecture, multi-agent) sitting next to specs that are.

**Agent / skill risks**
- Guardrails are **prose, not enforcement.** A non-compliant agent can ignore all of it.
- 14 skills + 9 doc layers = real risk the orchestrator becomes ceremonial or is skipped.
- Manual-only skills (3D, story-carousel, owner-threshold) live beside auto-use skills; misuse risk if the manual-only boundary isn't enforced.

**Design risks**
- External `.agents` taste skills conflict with HESTIA UI doctrine (Lucide ban, huge spacing, orbs/glass) and could trigger broad UI rewrites if invoked by default.
- "Premium world" language can overpower operational truth.

**Data / provenance risks**
- No mechanical fake-data scan across the repo. Provenance is enforced by author discipline, not tests.
- No enforced output contract (sources/confidence/missing-data) on intelligence surfaces.

**Security risks**
- `VITE_GEMINI_API_KEY` history: code-remediated but requires **local `.env` operator verification** (not checkable here without reading secrets — and we must not).
- `.claude/settings.local.json` allows git push/commit + broad shell; dangerous if ever treated as shared policy.

**Product risks**
- Risk of activating owner pages with empty data (roadmap explicitly warns).
- Risk of "fake intelligence" if Tabit ingestion or recommendations ship before the evidence contract.

**Execution risks**
- Early multi-agent orchestration is repeatedly cautioned against and would be premature.
- Doctrine volume can crowd out the small connection work that actually moves the product.

---

## 8. The Missing Bridge

**Candidates evaluated:**

| Candidate | Verdict |
|---|---|
| Agent OS Adoption Plan | Useful, but it governs *how agents work*, not *how HESTIA learns*. Necessary, not the primary bridge. |
| **Evidence → Recommendation → Outcome Ledger** | **Primary bridge.** It is the chain every doctrine names and the only one that connects F&B, Owner, Event, Academy, Service into one learning loop. Half-built (Decision Ledger) — the rest is the gap. |
| Venue DNA Taxonomy | Important, but a *downstream consumer* of evidence. Building taxonomy first risks DNA with no evidence to feed it. |
| Intelligence Backbone / "Nervous System" | Same thing as the ledger, larger-sounding. Avoid the grand framing. |
| Unified Memory Contract | This *is* the ledger's data contract. Part of the bridge, not separate. |
| Agent Run Log / Governance Layer | Supports trust; secondary to the evidence chain. |

**Primary bridge (chosen): the Evidence → Recommendation → Human Decision → Outcome → Memory Ledger — extended from the existing F&B Decision Ledger into a venue-wide, evidence-typed, human-gated contract.**

Why: HESTIA's confirmed moat is *memory that compounds*. Today, nothing closes the loop end-to-end. The Decision Ledger already proves the pattern is buildable safely (DI db, no AI, no DNA writes, provenance-typed). Extending **that** — rather than inventing a new "nervous system" — is the smallest change that makes the moat real and keeps every guardrail intact.

**Dependency order (smallest safe foundation, not a giant build):**
1. **Truth cleanup** (docs-only): reconcile the two roadmaps; mark stale Tier-1/2 content. *Nothing else is safe until an agent reading the SoT builds the right thing.*
2. **Agent OS adoption + check proposal** (docs-only): make the guardrails enforceable on paper.
3. **Data contracts** (docs-only schemas): EvidenceItem, Recommendation, HumanDecision, Outcome, MemoryCandidate, VenueDnaChangeRequest, AgentRunLog — drafts only.
4. **Evidence/MemoryCandidate contract** in code (no DNA mutation): one vertical slice (e.g. an EOD report → evidence item).
5. **Recommendation → Decision → Outcome** small vertical path.
6. **Human confirmation tier (9D)** — only after 4–5.
7. **candidate → DNA promotion** — only after 6.
8. **Full Intelligence / Tabit ingestion** — last.

---

## 9. Agent / Skill Operating Model

> For each: what it reads, may write, may never touch, output format, and stop-and-ask trigger. These are **roles agents/skills should play** — not a recommendation to spin up an autonomous fleet (see §14).

### Core Operating Gate — `hestia-skills-orchestrator` (always first)
- **Decides:** task type → required reading order (§3) → which domain skill → whether the task is allowed read-only vs write.
- **Blocks:** generic redesign, fake data, visual-first work, prototype shortcuts, research-as-implementation, unscoped intelligence, work that skips the SoT read.
- **Reads:** this plan, KNOWLEDGE_GOVERNANCE, CLAUDE.md. **Writes:** nothing (router). **Never:** approves DNA/auth/role changes. **Output:** a short routing decision + checklist. **Stop-and-ask:** any task that would touch auth/venue/role/DB/DNA.

### Product Architect Agent
- **Owns:** product coherence, hospitality-OS fit, anti-generic-SaaS, MVP-vs-later, module-connection-first.
- **Reads:** master memory, SoT trio, both roadmaps, `hestia-product-design-judgment`. **Writes:** plans/docs only. **Never:** code in this role. **Output:** feature-fit verdict (the 7-question test). **Stop:** feature that doesn't map to a role+workflow.

### Architecture / Repo Auditor Agent
- **Owns:** verifying implementation against docs; auth/venue/role/DB risk; source-of-truth separation; no fake-implementation claims.
- **Reads:** code + SoT. **Writes:** audit docs only (`docs/audits/`). **Never:** production code, build output in read-only mode. **Output:** claim→evidence→status table (like §5). **Stop:** found drift between doc and code → report, don't fix silently.

### Evidence & Memory Agent
- **Owns:** Venue Memory / Business Memory, EvidenceItem schema, confidence, missing-data, provenance.
- **Reads:** VENUE_MEMORY_AND_DNA_GUARDRAILS, `hestia-venue-memory-provenance`. **Writes (when built):** evidence/memory candidates only. **Never:** mutate Venue DNA directly; fabricate evidence. **Output:** evidence items with source+confidence+missing-data. **Stop:** any direct DNA write.

### Venue Intelligence / DNA Agent
- **Owns:** DNA candidates, 9C/9E/9D, taxonomy, next-best-question, confirmation tier, mutation rules.
- **Reads:** the DNA spec set + completeness evaluator. **Writes (when built):** candidates + `VenueDnaChangeRequest` drafts. **Never:** call `mergeVenueDna` without an owner-confirmed change request; add a candidate→DNA auto-path. **Output:** candidate + missing dimensions + next question. **Stop:** before any promotion.

### Owner AI / Business Intelligence Agent
- **Owns:** Owner AI Home, operational truth, decision support, recommendation ledger, no fake KPIs.
- **Reads:** OWNER_AI_HOME specs, Bar Roadmap §4, `hestia-operational-intelligence-ui`. **Writes:** owner-facing surfaces (UI) per design gate. **Never:** show a metric without a source; activate empty-data pages. **Output:** exception-first, ≤3 decisions, source-labeled. **Stop:** unsourced KPI.

### Event Manager / Zohar Agent
- **Owns:** event lifecycle, calendar, creative/production/programme handoffs, event→shift bridge.
- **Reads:** `hestia-event-manager-ui`, master memory event discoveries. **Writes:** event features (not `buildZoharBrief`). **Never:** edit locked Zohar utilities; render demo data for real events; auto-send handoffs (drafts until accepted). **Output:** handoff drafts with accept/edit/send. **Stop:** touching `useEventState`/`buildZoharBrief`.

### F&B / Beverage / Omer Agent
- **Owns:** Cocktail Intelligence, cost/source confidence, menu intelligence, staff readiness, event cocktail menus.
- **Reads:** FNB doctrine set, `hestia-beverage-intelligence-ui`, bar foundation. **Writes:** CI/ledger features. **Never:** fake pricing/margins/suppliers; costing on unsourced data. **Output:** cost with `cost_status`+`confidence_level`. **Stop:** missing source for any money figure.

### Academy Agent
- **Owns:** learning loops, lesson design, capability-vs-completion, training recommendations with evidence, venue standards.
- **Reads:** `hestia-academy-design-curriculum`, `hestia-academy-experience`. **Writes:** academy content/UI. **Never:** treat completion as capability; LMS/gamification; rename instructors. **Output:** scenario-first lessons; capability claims evidence-typed. **Stop:** a capability claim with no evidence.

### Service / Shift Intelligence Agent
- **Owns:** shift notes, incidents, service recovery, pre/post-shift, operational learning.
- **Reads:** Shift Brain V1 doc, `shiftBrainService.js`. **Writes:** shift features (intelligence logic stays in the service). **Never:** compute intelligence in components; add AI to hooks. **Output:** deterministic snapshot + optional editable AI. **Stop:** intelligence logic leaking out of the service.

### Design Critic Agent
- **Owns:** HESTIA visual doctrine, premium-but-operational, no generic SaaS, no fake luxury.
- **Reads:** `hestia-ui-design`, `hestia-product-design-judgment`. **Writes:** design feedback only. **Never:** adopt `.agents` taste skills as authority. **Output:** pass/fail vs HESTIA design rules + 2 AM/mobile/role checks. **Stop:** any external taste skill proposed as production authority.

### QA / Safety Agent
- **Owns:** no secrets, no prototype imports, no new localStorage without plan, no unapproved auth/DB/role changes, no direct DNA mutation, no fake data, test recommendations.
- **Reads:** `hestia-check.js`, this plan §11. **Writes:** QA reports + (when approved) the proposed check script. **Never:** run build in read-only mode; print secrets. **Output:** PASS/WARN/FAIL rows. **Stop:** any FAIL on auth/DNA/secrets.

### Codex Use Policy
Codex (when Claude Code usage is exhausted) may produce: **safe docs, read-only audits, skills, research packs, add-on proposals, prototype snippets — inspiration only.** Codex must **not**: change production-critical code, auth/venue/role/DB, Venue DNA logic, or commit/push production changes. Codex output is a *draft for Claude Code to verify against the live repo.*

### Claude Code Use Policy
Claude Code owns: **real repo work** — implementation, architecture changes, tests, production fixes, and code audits against the *current* repo. Claude Code must still: read SoT first, respect the gate, and stop-and-ask before auth/venue/role/DB/DNA changes. Critical code changes require explicit founder approval even for Claude Code.

---

## 10. Skill Pack Adoption

| Skill | Verdict | Rationale |
|---|---|---|
| `hestia-skills-orchestrator` | **Keep + promote to first.** Consider rename → `hestia-agent-operating-gate`. Add a machine-checkable routing checklist. | The gate. |
| `hestia-product-design-judgment` | **Keep (core).** | Product fit test. |
| `hestia-venue-memory-provenance` | **Keep + convert core concepts to schema/tests.** Consider rename → `hestia-evidence-and-memory-contract`. | Becomes the §12 contract's doctrine. |
| `hestia-hospitality-intelligence` | **Keep.** Split only if size hurts routing. | Domain reasoning. |
| `hestia-ui-design` | **Keep (production design authority).** Refresh stale component/font refs. | Mandatory per CLAUDE.md. |
| `hestia-operational-intelligence-ui` | **Keep.** Add fixtures vs OwnerAIHome/OperationalPulse. | Owner/ops UI. |
| `hestia-event-manager-ui` | **Keep.** Verify against real EventDetail tab state. | Event handoffs. |
| `hestia-beverage-intelligence-ui` | **Keep.** **Fix stale path** (`cocktailLabPricingAdapter.js` lives in features/services, not `src/domain/hospitality/bar/`). | Cost honesty. |
| `hestia-venue-intelligence-ui` | **Keep.** Add DNA-change-request reference. | DNA candidates. |
| `hestia-academy-design-curriculum` | **Keep.** | Curriculum. |
| `hestia-academy-experience` | **Keep.** | Capability≠completion. |
| `hestia-owner-threshold` | **Keep manual-only. Consider merging** the 3 experimental skills into one "experimental experience policy." | Prototype-only. |
| `hestia-story-carousel` | **Keep manual-only** (merge candidate). | Prototype-only. |
| `hestia-3d-experience` | **Keep manual-only** (merge candidate). | Prototype-only. |
| `hestia-product-design-judgment` / `hestia-skills-orchestrator` / `hestia-venue-memory-provenance` | **Treat as the core Agent OS triad;** everything else = domain plugins. | Simplify authority. |

**`.agents/` (external taste skills):** **Quarantine — manual-only, inspiration-only.** Never copy into `skills/user/` as authority. Keep `skills-lock.json` as provenance proof.

**`.claude/settings.local.json`:** **Local-only. Do not share as project policy.** It grants git push/commit + broad shell. If a shared policy is ever needed, author a *separate, tighter* file without write/push permissions.

**`skills-lock.json`:** **Keep as-is.** It is the evidence that `.agents` skills are external.

**`docs/design/HESTIA_SKILLS_PIPELINE_RESEARCH.md`:** **Keep as governance rationale.**

> Do not actually modify any of these in this task. All of the above are recommendations pending approval.

---

## 11. Proposed Checks / Hooks / QA Gates — `scripts/hestia-agent-os-check.js` (design only, not implemented)

| # | Check | Files scanned | Severity | False positives | Hook or manual |
|---|---|---|---|---|---|
| 1 | No `.env` staged | git index | FAIL | none | hook (pre-commit) |
| 2 | No secret values in tracked files | tracked text files | FAIL | base64 blobs, test fixtures | hook + manual triage |
| 3 | No production imports from `prototypes/` | `src/**` imports | FAIL | none | hook |
| 4 | No fake/demo data in production intelligence | `src/features/**`, `src/services/**` | WARN→FAIL | legit fixtures | hook + allowlist |
| 5 | No `eventBrainDemoData` in production UI (except approved fallback) | `src/features/events/**` | WARN (until Phase 2), then FAIL | adapter fallback files | hook + allowlist of the fallback path |
| 6 | No new `localStorage` keys outside approved config/migration plan | `src/**` | WARN | roadmapped keys | hook + allowlist (`STORAGE` config) |
| 7 | No auth/venue/role/DB changes without an explicit approval marker | `server.js`, `src/config/roleConfig.js`, migrations | FAIL | refactors | hook requiring `APPROVED-BY:` token in commit |
| 8 | No direct Venue DNA mutation path | grep `mergeVenueDna` callers | FAIL on new caller | none | hook (caller-count baseline) |
| 9 | No new `mergeVenueDna` caller without approval | same | FAIL | none | hook (count must equal baseline=1) |
| 10 | No candidate→DNA promotion without confirmation tier | candidate/review routes | FAIL | none | manual + hook (forbidden-pattern) |
| 11 | No external `.agents` skill copied into `skills/user/` as authority | `skills/user/**` vs `skills-lock.json` hashes | FAIL | none | hook |
| 12 | No unsourced recommendation/cost/profit output | money/recommendation render sites | WARN | labeled benchmarks | manual (too semantic for full automation) |
| 13 | No role visibility leaks | route role guards | FAIL | none | manual + targeted test |
| 14 | No unscoped intelligence routes | `app.get/post` intelligence routes missing `req.venueId` | FAIL | public endpoints (RSVP) | hook + allowlist |
| 15 | HOSPIA naming allowlist vs user-facing rename policy | tracked text | WARN | technical identifiers (`hospia.*`, `X-HOSPIA-Role`) | hook + allowlist |
| 16 | Stale path detection inside skills | `skills/user/**` referenced paths | WARN | moved files | hook |
| 17 | Read-only audit mode (no build, no `dist/` writes) | runner flag | INFO | n/a | flag on the script itself |

**Design principles:** (a) read-only by default — never run `npm run build` in audit mode; (b) every FAIL needs an explicit, documented override token, never a silent bypass; (c) semantic checks (12, 13) stay manual — automating them produces false confidence. This **extends** `hestia-check.js`; it does not replace it.

---

## 12. Draft Data Contracts — Docs Only

> **These schemas do NOT exist in code.** They are drafts. Examples use placeholders only — no fake venue data. The F&B `decisionLedgerService.js` is the closest existing analog and should be the implementation reference.

### EvidenceItem
- **Fields:** `id`, `venue_id` (req), `source_type` (req: `eod_report|tabit_item_sales|tabit_employee_sales|manager_note|review|invoice|user_confirmed|system_observation`), `source_ref` (req), `evidence_type` (req), `payload_json` (req, raw), `confidence` (req: `low|medium|high`), `captured_at` (req), `captured_by`, `missing_fields` (array), `interpretation_separate` (bool, req — raw ≠ interpretation).
- **Created by:** ingestion (EOD submit, Tabit upload, review connector). **Approved by:** n/a (raw evidence is not "approved," it is recorded). **Could persist:** new `evidence_items` table, venue-scoped. **Never:** store interpretation in the raw payload; fabricate a missing field.

### Signal
- **Fields:** `id`, `venue_id`, `derived_from` (evidence ids, req), `signal_type`, `summary`, `strength` (`early|repeated|trend`), `created_at`. **Created by:** deterministic services (Shift Brain pattern). **Never:** call one report a trend.

### Interpretation
- **Fields:** `id`, `venue_id`, `signal_ids` (req), `hypothesis` (req), `is_root_cause_hypothesis` (bool), `confidence`, `assumptions` (array), `created_by` (deterministic|ai). **Never:** present a hypothesis as fact; AI interpretation without evidence link.

### Recommendation
- **Fields:** `id`, `venue_id`, `interpretation_ids`, `recommended_action` (req), `rationale` (req), `evidence_refs` (req), `confidence` (req), `target_role` (req), `status` (`draft|surfaced|accepted|rejected|expired`), `created_at`. **Created by:** specialist agents (F&B/Owner/Academy). **Approved by:** the target role / owner. **Never:** surface without evidence_refs; auto-execute.

### HumanDecision
- **Fields:** `id`, `venue_id`, `recommendation_id` (req), `decision` (`accept|reject|edit|defer`, req), `decided_by` (req, role-checked), `decided_at`, `edit_payload`, `note`. **Created by:** Decision Center. **Approved by:** is the approval. **Never:** record a decision by a role lacking authority (DNA = owner/founder only).

### Outcome
- **Fields:** `id`, `venue_id`, `decision_id` (req), `observed_effect`, `evidence_refs` (later evidence), `result` (`improved|no_change|worse|unknown`), `observed_at`. **Created by:** later evidence linking back. **Never:** invent an outcome; without outcomes, recommendations don't learn.

### MemoryCandidate
- **Fields:** `id`, `venue_id`, `derived_from` (evidence/decision/outcome ids), `candidate_summary` (req), `candidate_type`, `confidence`, `human_review_status` (`pending|approved|rejected`), `is_dna_candidate` (bool). **Created by:** Evidence & Memory Agent. **Approved by:** owner/admin (matches existing `venue_intelligence_candidates` review). **Never:** auto-write to Venue DNA.

### VenueDnaChangeRequest
- **Fields:** `id`, `venue_id`, `dimension` (req), `current_value`, `proposed_value` (req), `evidence_refs` (req), `confidence`, `requested_by`, `status` (`pending_owner_confirmation|confirmed|rejected`), `confirmed_by` (owner/founder only). **Created by:** Venue Intelligence/DNA Agent. **Approved by:** owner/founder **only**. **Could persist:** gates the single `mergeVenueDna` caller. **Never:** confirm without owner; bypass the single-writer; auto-promote a MemoryCandidate.

### AgentRunLog
- **Fields:** `id`, `venue_id`, `agent_role`, `task_type`, `files_read` (array), `inferences` (array), `writes_proposed` (array), `writes_made` (array), `skipped` (array), `started_at`, `ended_at`, `stopped_for_approval` (bool). **Created by:** the harness/agent itself. **Approved by:** n/a (audit record). **Could persist:** `docs/audits/` or a log table. **Never:** claim a write was made when it was only proposed; omit a DNA/auth touch.

> All seven extend the proven Decision Ledger pattern: dependency-injected db, venue-scoped, no AI in the persistence layer, NULL (not fake `{}`) for absent fields, raw evidence separated from interpretation.

---

## 13. Recommended Action Plan

> Smallest safe foundation sequence. Each phase has an owner agent, executor (Claude Code vs Codex), files likely touched, risks, tests, stop conditions, commit policy. **No phase past 2 begins without founder approval.**

### Phase 0 — Truth cleanup / source order (docs only)
- **Objective:** Resolve the two-roadmap conflict; mark stale Tier-1/2 content; one canonical reading order.
- **Owner agent:** Product Architect + Architecture Auditor. **Executor:** Claude Code (docs) or Codex (safe).
- **Files:** `HESTIA_MASTER_STATE.md`, `master_memory` (add pivot note), `HESTIA_CTO_ROADMAP.md` (mark scope = connection-layer engineering), a one-line authority note pointing to the Bar Intelligence Roadmap as current product direction; `DOCUMENT_MAP.md`.
- **Risks:** editing Tier-1 files (governance requires confirmed facts + founder approval). **Tests:** none (docs). **Stop:** any change to Tier-1 master memory beyond an additive pivot note → ask founder. **Commit:** one docs commit, after founder approval.

### Phase 1 — Agent OS Adoption Plan (docs only)
- **Objective:** Turn §9/§10 into an adopted operating model: core triad + plugins, skill rename/merge decisions, manual-only enforcement note.
- **Owner:** skill/governance. **Executor:** Claude Code or Codex. **Files:** new `docs/plans/HESTIA_AGENT_OS_ADOPTION_PLAN.md`; skill front-matter only if approved. **Risks:** low. **Tests:** none. **Stop:** before editing skill *bodies*. **Commit:** one docs commit.

### Phase 2 — `hestia-agent-os-check.js` proposal (docs/check proposal only)
- **Objective:** Specify §11 checks as a buildable script spec (not yet wired into `package.json`).
- **Owner:** QA/Safety. **Executor:** Claude Code. **Files:** `docs/plans/` spec; optionally a *non-wired* script draft. **Risks:** none if not added to `npm scripts`. **Tests:** dry-run against repo. **Stop:** before adding to `package.json` or hooks. **Commit:** docs/spec commit.

### Phase 3 — 9E-3B Venue DNA Taxonomy constants (only after plan approval)
- **Objective:** Pure constants + tests from the 9E-3 spec. **No runtime wiring.**
- **Owner:** Venue Intelligence/DNA. **Executor:** Claude Code only. **Files:** a new constants module under `src/domain/hospitality/` (dormant) + a `scripts/test-*.js`. **Risks:** accidental wiring. **Tests:** new unit tests; `hestia:check`. **Stop:** any import of the constants into a page/hook/service. **Commit:** after green tests + approval.

### Phase 4 — Evidence mapping / MemoryCandidate contracts (no DNA mutation)
- **Objective:** One vertical: EOD report → EvidenceItem (recorded, venue-scoped), reusing the ledger pattern.
- **Owner:** Evidence & Memory. **Executor:** Claude Code. **Files:** new service + table (idempotent `CREATE TABLE`), a test script. **Risks:** schema churn. **Tests:** write/read venue-scoped. **Stop:** any DNA write. **Commit:** after tests.

### Phase 5 — Recommendation / Decision / Outcome ledger (small vertical)
- **Objective:** One recommendation → Decision Center accept/reject → outcome link.
- **Owner:** Owner AI + Evidence. **Executor:** Claude Code. **Files:** ledger extension + Decision Center UI. **Risks:** owner UX scope creep. **Tests:** accept/reject/outcome. **Stop:** auto-execution. **Commit:** after tests + design gate.

### Phase 6 — Human confirmation tier (9D) — only after 4–5
- **Objective:** The gate between MemoryCandidate and any DNA change. **Owner:** Venue DNA. **Executor:** Claude Code. **Files:** `VenueDnaChangeRequest` table + owner-only confirm route. **Risks:** bypassing the single writer. **Tests:** owner-only enforcement. **Stop:** confirm by non-owner. **Commit:** after security test.

### Phase 7 — candidate → DNA promotion — only after confirmation tier
- **Objective:** Confirmed change request → single `mergeVenueDna` caller. **Owner:** Venue DNA. **Executor:** Claude Code. **Files:** the one gated promotion path. **Risks:** highest in the plan. **Tests:** no promotion without a confirmed request; writer count stays 1+gate. **Stop:** any auto-path. **Commit:** after full review + founder approval.

### Phase 8 — Full Intelligence Mode unlock (last)
- **Objective:** Unlock once evidence→outcome→memory→confirmed-DNA is real. **Owner:** Owner AI. **Executor:** Claude Code. **Risks:** premature unlock = fake intelligence. **Stop:** any pillar above unproven. **Commit:** after end-to-end demo.

---

## 14. What To Avoid (hard no's)

- No autonomous multi-agent fleet yet. The "agents" in §9 are *roles*, not running daemons.
- No production 3D / cinematic owner threshold.
- No external taste-skill production rewrite; no `.agents` skill as production authority.
- No fake dashboards, no fake KPIs, no invented costs/margins/suppliers.
- No Tabit/POS ingestion before the evidence contract exists.
- No Full Intelligence Mode unlock early.
- No candidate→DNA promotion before the 9D confirmation tier.
- No new `mergeVenueDna` caller without an owner-confirmed `VenueDnaChangeRequest`.
- No HOSPIA technical rename (`hospia.*` keys, `X-HOSPIA-Role`) without a coordinated migration.
- No auth/venue/role/DB changes bundled with docs work.
- No new "AI persona" unless it reads/writes the shared brain (the ledger), not a private store.
- No treating research as implementation; no treating Tier-1/2 stale docs as current product direction without reconciling §1.

---

## 15. Highest-Leverage Next Task

**Chosen next task: Phase 0 — Truth cleanup (reconcile the two roadmaps + mark stale Tier-1/2 content), docs-only.**

**Why this and not the others:**
- The single biggest *current* threat is not missing code — it's that the **most authoritative documents are stale on product direction.** Until that is fixed, every other task (including building the evidence ledger) risks being aimed at the wrong product framing. An agent that reads master memory in good faith today will plan "Phase 1 operational connection layer" while the live product is the AI Bar Intelligence platform.
- It is zero-risk (docs-only), fast, and unblocks everything downstream.
- The `hestia-agent-os-check.js` proposal and the 9E-3 constants are valuable but *premature* until the source-of-truth is internally consistent — building enforcement on top of conflicting doctrine encodes the conflict.

**What NOT to mix with it:** no skill edits, no check-script code, no taxonomy constants, no auth/role/DB/DNA touches, no committing this plan in the same change. Truth cleanup is a clean, isolated docs commit that requires founder sign-off on any Tier-1 edit.

---

## 16. Claude Code / Codex Prompt Library

> Each prompt opens with the same state preamble and explicit read/write limits.

**Shared preamble (paste at top of every prompt):**
```
Run first and paste output:
  git status --short
  git branch --show-current
  git log --oneline -5
Read before acting: memory/project_hestia_master_memory.md, docs/KNOWLEDGE_GOVERNANCE.md, CLAUDE.md.
Do not read or print .env / secret values. Do not commit or push unless this prompt says to.
```

**1. Codex read-only research audit**
```
[preamble] Mode: READ-ONLY audit. Do NOT run npm build/hestia:check (they write dist/).
Scope: docs/** and skills/** only. Map: what's current, stale, research-only, dangerous-if-treated-as-truth.
Write limit: may create ONE file under docs/audits/. No src/, no server.js, no config.
Report format: claim → source → status (use the §5 vocabulary). No-commit, no-push.
```

**2. Claude Code implementation slice**
```
[preamble] Read the SoT trio + the domain doctrine for this slice + the relevant skill.
Task: <one vertical slice>. Files allowed: <explicit list>. 
Never touch: auth, venue scoping, roleConfig, DB migrations, mergeVenueDna, buildZoharBrief, useEventState.
Run: npm run build + the relevant scripts/test-*.js. 
Report: files changed/read, what improved, what left unchanged, risks, validation, next step, suggested commit msg.
Stop-and-ask before any auth/venue/role/DB/DNA change. Do not commit until I approve.
```

**3. Claude Code post-change QA**
```
[preamble] Run: npm run hestia:check ; npm run build ; relevant scripts/test-*.js.
Audit the diff for: fake/demo data, new localStorage keys, prototype imports, unsourced cost/recommendation output,
role-visibility leaks, unscoped intelligence routes, new mergeVenueDna callers.
Report PASS/WARN/FAIL per item. No fixes without my approval. No-commit.
```

**4. Design review**
```
[preamble] Read skills/user/hestia-ui-design + hestia-product-design-judgment.
Review <screen/diff> against HESTIA design doctrine: Palette A/B, 2 AM test, mobile-first, role visibility, no generic SaaS, no fake luxury.
Treat .agents/skills/* as INSPIRATION ONLY — never authority. Report pass/fail + specific fixes. No-commit.
```

**5. Venue DNA safety review**
```
[preamble] Read VENUE_MEMORY_AND_DNA_GUARDRAILS + the 9C/9E specs + hestia-venue-memory-provenance.
Verify: candidate≠confirmed; mergeVenueDna remains the SINGLE writer; no candidate→DNA auto-path; owner-only confirmation.
Grep mergeVenueDna callers and report count vs baseline (1). Report any violation as FAIL. Read-only. No-commit.
```

**6. Event Manager handoff review**
```
[preamble] Read hestia-event-manager-ui + master memory event discoveries.
Verify: Zohar recommends, Event Manager decides; handoffs are drafts until accepted/edited/sent; no eventBrainDemoData for real events;
buildZoharBrief/useEventState untouched. Report findings. Read-only unless I scope a fix. No-commit.
```

**7. F&B cost/provenance review**
```
[preamble] Read FNB_DIRECTOR_INTELLIGENCE_DOCTRINE + DECISION_LEDGER_DOCTRINE + hestia-beverage-intelligence-ui.
Verify every money figure carries cost_status + confidence_level; no benchmark shown as verified; no fake suppliers/margins;
ledger writes are provenance-typed. Run scripts/test-fb-decision-ledger.js + test-menu-intelligence.js. Report. No-commit.
```

**8. Academy capability-vs-completion review**
```
[preamble] Read hestia-academy-design-curriculum + hestia-academy-experience.
Verify: completion = exposure, not capability; capability claims are evidence-typed; no LMS/gamification; instructors unchanged (Mira/Theo/Daniel/Noa).
Report any place completion is treated as capability. Read-only. No-commit.
```

**9. Agent OS check proposal**
```
[preamble] Read docs/plans/HESTIA_TOTAL_RESEARCH_AND_AGENT_ACTION_PLAN.md §11 + scripts/hestia-check.js.
Produce a BUILD SPEC for scripts/hestia-agent-os-check.js (read-only mode, override tokens, extends hestia-check.js).
Do NOT wire it into package.json or hooks. Write limit: docs/plans/ only. No-commit.
```

**10. Push verification**
```
[preamble] Confirm: branch, HEAD == origin/main?, working tree clean?, only intended files changed?
Run npm run build + hestia:check. Summarize what will be pushed. 
Only push if I explicitly say "push now" in my reply. Otherwise stop and report.
```

---

## 17. Final Verdict

- **Is the research layer usable?** Yes — as research. It is rich, well-indexed, and correctly fenced by `RESEARCH_ARCHIVE_USAGE_RULES`. Danger is volume creating an illusion of built systems.
- **Is the agent layer usable?** Yes, with changes. The HESTIA skill pack is strong; it needs the core-triad simplification, stale-path fixes, and (eventually) executable enforcement. External `.agents` stay quarantined.
- **Is the design layer safe?** Yes, if the product gate runs before the visual gate and `.agents` stays inspiration-only.
- **Is HESTIA coherent enough to continue?** Yes. The architecture, doctrine, and partial backbone (Decision Ledger, candidates, single DNA writer, completeness evaluator) are coherent and disciplined. The incoherence is in the *document authority surface*, not the product.
- **Biggest current threat:** stale Tier-1/2 source-of-truth docs + two competing roadmaps → an agent builds the wrong thing in good faith. Second: demo-data contamination still live in 10 event files.
- **Biggest opportunity:** extend the proven Decision Ledger into the venue-wide Evidence→Recommendation→Decision→Outcome→Memory ledger — the moat the founder already believes in, finally closed end-to-end.
- **Next safe step:** Phase 0 truth cleanup (docs-only, founder-approved). Nothing else first.

---

## 18. Commands Run / Files Inspected / Changes Made

**Commands run (representative):**
```
git status --short ; git branch --show-current ; git log --oneline -5
git rev-parse HEAD ; git rev-parse origin/main
ls docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md ; git ls-files <same>
find docs|memory|skills|.agents|.claude -type f (structure map)
ls src/{services,hooks,features,config} ; ls scripts
rg "mergeVenueDna|venue_intelligence_candidates|decision_ledger|eventBrainDemoData|CREATE TABLE|..." server.js src/**
(read tools for the files below; no build, no tests run, no secrets read)
```

**Files inspected (read in full or in part this pass):**
```
docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md
docs/HESTIA_MASTER_STATE.md ; docs/HESTIA_CTO_ROADMAP.md ; docs/KNOWLEDGE_GOVERNANCE.md
memory/project_hestia_master_memory.md
AGENTS.md ; CLAUDE.md (context) ; .claude/settings.local.json ; skills-lock.json
docs/gems/hestia-research-brain/00_HESTIA_RESEARCH_MASTER_INDEX.md
docs/architecture/README_HESTIA_AI_DOCTRINE_INDEX.md
docs/plans/HESTIA_AI_BAR_INTELLIGENCE_ROADMAP_2026-06-21.md
server.js (schema/table region, mergeVenueDna region, candidate-review region)
scripts/hestia-check.js (header) ; src/services/venueBridge/decisionLedgerService.js (header)
directory listings: src/services/venueIntelligence + venueBridge, src/features, scripts
grep verifications across src/** and server.js (mergeVenueDna, candidates, demo data)
```
(The broader research corpus was mapped via the verified gem master index `00` summaries + directory listing, not re-read line-by-line; this is labeled `Verified in docs only` where used.)

**Files created/modified:**
- Created: `docs/plans/HESTIA_TOTAL_RESEARCH_AND_AGENT_ACTION_PLAN.md` (this file).
- Modified: none.

**Production code changed:** None.
**Tests/build run:** None (read-only; build/tests intentionally avoided to keep `dist/` untouched).
**`docs/audits/HESTIA_AGENT_OS_FOLDER_DEEP_QA_AUDIT.md`:** read only, **left untouched** (still untracked).
**Working tree after:** two untracked files (the pre-existing audit + this plan); no tracked files changed.
**Safe to commit:** Yes — this is a docs-only addition. Commit only on your instruction (the task says do not commit).
**Push recommended:** Not by this task. Defer to founder.

---

*End of plan. This document is a planning artifact and does not supersede the authority hierarchy in `docs/KNOWLEDGE_GOVERNANCE.md`. Recommendations remain recommendations until the founder approves them.*
