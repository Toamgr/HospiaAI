# HESTIA Document Map

**Created:** 2026-06-14  
**Authority:** Reflects the real repository state as verified by direct filesystem inspection.  
**Scope:** All documentation files in `docs/` and `memory/`. Does not cover `src/`, `server.js`, or runtime artifacts.

---

## ⚠ Before Using This Map

This file was created after verifying the actual repository. It does not contain aspirational structure. Every path listed here was confirmed to exist on disk.

Authority files take precedence over this map. If this map conflicts with:
- `memory/project_hestia_master_memory.md`
- `docs/HESTIA_MASTER_STATE.md`
- `docs/HESTIA_ARCHITECTURE_AUDIT.md`
- `docs/HESTIA_CTO_ROADMAP.md`

Trust those files. Update this map.

---

## Authority Hierarchy

Documents are not equal. This hierarchy governs all conflicts.

```
Tier 1 — Institutional Memory (highest authority)
  memory/project_hestia_master_memory.md

Tier 2 — Current State & Roadmap (operational authority)
  docs/HESTIA_MASTER_STATE.md         ← what exists today
  docs/HESTIA_ARCHITECTURE_AUDIT.md   ← module-by-module audit
  docs/HESTIA_CTO_ROADMAP.md          ← official phased roadmap

Tier 3 — Architecture Reference (confirmed fact about how the system is built)
  docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md
  docs/architecture/HESTIA_PHASE_2_CHECKPOINT.md
  docs/architecture/HESTIA_SHIFT_BRAIN_V1.md
  docs/architecture/HESTIA_BAR_PRODUCT_FOUNDATION.md
  docs/architecture/HESTIA_COCKTAIL_LAB_EXPERIENCE_CHECKPOINT.md

Tier 4 — Strategy & Philosophy (directional, not prescriptive for current execution)
  docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md
  docs/strategy/HESTIA_AUDIT_AND_NEXT_PHASE.md

Tier 5 — Domain & Feature Docs (working documents, may be in progress)
  docs/academy/*, docs/data/*, docs/design/*, docs/cocktail-intelligence/*

Tier 6 — Research (input material, not conclusions)
  docs/research/*, docs/event-design/research/*, docs/cocktail-intelligence/research/*

Tier 7 — Archive (superseded; preserved for reference only)
  docs/archive/**
```

---

## Root-Level Documents

| File | Status | Purpose |
|---|---|---|
| `CLAUDE.md` | **Confirmed** | Agent operating instructions. Mandatory pre-read for all AI sessions. |
| `AGENTS.md` | **Confirmed** | Master memory authority declaration. Points to `memory/project_hestia_master_memory.md`. |
| `README.md` | **Confirmed** | Human-facing project overview. |

---

## Memory

| File | Status | Purpose |
|---|---|---|
| `memory/project_hestia_master_memory.md` | **Confirmed — Tier 1** | Primary institutional memory. Reasoning framework, not just facts. Supersedes all other context sources. Reconstructed 2026-06-14. |
| `memory/README.md` | **Confirmed** | Explains memory system usage. |

---

## docs/ — Tier 2: Current State & Roadmap

| File | Last Updated | Purpose |
|---|---|---|
| `docs/HESTIA_MASTER_STATE.md` | 2026-06-09 | Source of truth for current module status, persistence map, production-readiness per domain. |
| `docs/HESTIA_ARCHITECTURE_AUDIT.md` | 2026-06-09 | Full module-by-module audit (51 tables, 120+ routes). Identifies what is built, what is connected, what is demo data, what is dead. |
| `docs/HESTIA_CTO_ROADMAP.md` | 2026-06-09 | Official phased development roadmap. Defines Phase 1–4 sequencing, ROI rankings, exclusions. |
| `docs/README.md` | — | Docs directory overview. |

---

## docs/architecture/ — Tier 3: Architecture Reference

| File | Status | Purpose |
|---|---|---|
| `HOSPIA_SYSTEM_ARCHITECTURE.md` | **Confirmed** | Full system architecture. Hook/feature/service pattern. Event-driven design. AI orchestration layers. |
| `HESTIA_PHASE_2_CHECKPOINT.md` | **Confirmed** | Phase 2 completion record (2026-05-12). App.jsx contract, hook ownership, PageRenderer contract. |
| `HESTIA_SHIFT_BRAIN_V1.md` | **Confirmed** | Shift Brain V1 specification. shiftBrainService.js contract, intelligence rules, extension guide. |
| `HESTIA_BAR_PRODUCT_FOUNDATION.md` | **Confirmed** | Bar product schema layer. Costing utilities, pricing intelligence, supplier map, data model candidates. |
| `HESTIA_COCKTAIL_LAB_EXPERIENCE_CHECKPOINT.md` | **Confirmed** | Cocktail Lab costing honesty + interactive build guide checkpoint (2026-05-13). |
| `HESTIA_BAR_PRODUCT_DATA_MODEL.md` | **Confirmed** | Bar product data model for future DB migration. |
| `HESTIA_COCKTAIL_LAB_COSTING_MODEL.md` | **Confirmed** | Costing model rules for the Cocktail Lab. |
| `HESTIA_ACADEMY_INSTRUCTOR_AUDIT.md` | **Confirmed** | Academy instructor feature audit. |
| `HESTIA_ACADEMY_INSTRUCTOR_IMPLEMENTATION_PACKAGE.md` | **Confirmed** | Academy instructor implementation spec. |
| `HESTIA_SKILL_ALIGNMENT_AUDIT.md` | **Confirmed** | Skill alignment audit against roadmap. |
| `ARCHITECTURE.md` | **Confirmed** | Architecture reference (earlier draft; superseded by HOSPIA_SYSTEM_ARCHITECTURE.md for design decisions). |
| `CLAUDE_REFACTORING_EXECUTION_GUIDE.md` | **Confirmed** | Guide for executing refactoring work in Claude sessions. |
| `REFACTORING_MASTER_PLAN.md` | **Confirmed** | Master refactoring plan. |
| `REPOSITORY_ARCHITECTURE_MAP.md` | **Confirmed** | Repository structure map. |
| `MARKDOWN_DOCUMENTATION_AUDIT.md` | **Confirmed** | Audit of markdown documentation across the repo. |

---

## docs/strategy/ — Tier 4: Strategy & Philosophy

| File | Status | Purpose |
|---|---|---|
| `HOSPIA_STRATEGY_FOUNDATION.md` | **Confirmed** | Product philosophy, wedge strategy, category positioning, emotional design register, GTM direction. |
| `HESTIA_AUDIT_AND_NEXT_PHASE.md` | **Confirmed** | Strategic audit and next phase planning. |

---

## docs/academy/ — Academy Domain

| File | Purpose |
|---|---|
| `README.md` | Academy domain overview. |
| `BAR-001-What-Is-A-Bartender.md` | Course content. |
| `HESTIA_ACADEMY_AGENT_PROMPT_PACK.md` | AI prompt pack for academy content generation. |
| `HESTIA_ACADEMY_VIDEO_PRODUCTION_WORKFLOW.md` | Video production workflow spec. |
| `HESTIA_COURSES_REDESIGN_IMPLEMENTATION_PLAN.md` | Courses redesign plan. |
| `HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md` | 5×5 curriculum plan. |
| `HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md` | Service school visual/UX direction. |
| `HESTIA_SERVICE_SCHOOL_IMPLEMENTATION_READINESS.md` | Implementation readiness assessment. |
| `HESTIA_SERVICE_SCHOOL_RESEARCH_SYNTHESIS.md` | Research synthesis for service school. |
| `research/GEMINI_ACADEMY_INTELLIGENCE_REPORT.md` | Research report on academy design. |

---

## docs/data/ — Data Confidence & Bar Product Data

| File | Purpose |
|---|---|
| `HESTIA_BAR_CLAUDE_INGESTION_GUIDE.md` | How Claude should ingest and treat bar product data. |
| `HESTIA_BAR_DATA_CONFIDENCE_RULES.md` | Confidence level rules for bar data. No unverified price may be presented as fact. |
| `HESTIA_BAR_DATA_GAPS_AND_COLLECTION_PLAN.md` | Identified data gaps and collection plan. |
| `HESTIA_BAR_PRODUCT_DATABASE_FOUNDATION.md` | Database foundation for bar products. |
| `HESTIA_VERIFIED_SUPPLIER_PRICE_INGESTION.md` | Rules for ingesting verified supplier prices. |

---

## docs/cocktail-intelligence/ — Cocktail Intelligence Domain

| File | Purpose |
|---|---|
| `README.md` | Cocktail intelligence domain overview. |
| `research/HESTIA_Cocktail_Intelligence_Master.md` | Master research document for cocktail intelligence. |
| `research/AI Cocktail Menu Intelligence Research.pdf` | External research (read-only reference). |
| `research/[Hebrew title].pdf` | Hebrew-language cocktail intelligence report. |

---

## docs/design/ — Design

| File | Purpose |
|---|---|
| `HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md` | Academy instructor design specification. |

---

## docs/domains/ — Domain Placeholder Structure

Six domain directories, each with a `README.md`. These are structural placeholders for future domain documentation. Currently empty beyond READMEs.

- `docs/domains/academy/`
- `docs/domains/beverage/`
- `docs/domains/events/`
- `docs/domains/guest-experience/`
- `docs/domains/operations/`
- `docs/domains/owner-intelligence/`

---

## docs/event-design/ — Event Design Domain

| File | Purpose |
|---|---|
| `README.md` | Event design domain overview. |
| `research/*.pdf, *.png` | External research materials for event branding and brief systems (read-only). |

---

## docs/research/ — Strategic Research Layer

Research into what hospitality software is not yet capturing. Not implementation plans. These directories are currently structural (READMEs only) — the research layer is not yet populated with validated findings.

- `docs/research/README.md`
- `docs/research/capability-development/`
- `docs/research/category-discovery/`
- `docs/research/decision-systems/`
- `docs/research/hospitality-expertise/`
- `docs/research/operational-memory/`
- `docs/research/organizational-learning/`

---

## docs/archive/ — Preserved Superseded Material

Archive is not trash. Material here is preserved because it may contain useful reference, prototypes, or historical decisions. Do not delete. Do not treat as current.

**docs/archive/project-audits/**
- `HESTIA_CTO_AUDIT_2026-05-21.md` — Earlier CTO audit (superseded by current ARCHITECTURE_AUDIT)
- `HESTIA_FULL_PROJECT_AUDIT_2026-05-18.md` — Earlier full audit
- `HESTIA_PHASE_1_DATABASE_SCHEMA_PLAN.md` — Phase 1 DB schema plan (superseded)
- `HESTIA_REFACTOR_HANDOFF_2026-06-06.md` — Refactor handoff document
- `HESTIA_AUDIT_AND_NEXT_PHASE.docx` — Binary; original audit doc
- `ROADMAP_original.md` — First roadmap draft (superseded by HESTIA_CTO_ROADMAP.md)

**docs/archive/owner-components/_archived/**
- Removed Owner Intelligence components (BudgetApprovals, BusinessMRI, CommandCenter, ExecutiveOverview, etc.) — archived after audit confirmed they showed empty data

**docs/archive/prototypes/academy-video-instructor/**
- Prototype components for a video instructor feature — not yet approved for integration

**docs/archive/scripts/**
- `seed_noir.mjs` — Seed script, archived

**docs/archive/prompts/**
- `HESTIA_CI_CLAUDE_AUDIT_PLAN.md` — Earlier audit plan prompt
- `PROMPT1_AUDIT_2026-06-05.md` — Session prompt archive

---

## skills/

| Path | Purpose |
|---|---|
| `skills/user/` | User-defined Claude skills for HESTIA sessions (hestia-ui-design, hestia-cocktail-menu, hestia-marketing-strategist). Read SKILL.md before building any UI. |

---

## Epistemic Labels Used in HESTIA Docs

When evaluating any claim in HESTIA documentation, apply these labels:

| Label | Meaning |
|---|---|
| **Confirmed fact** | Directly observed in code, database, or runtime. Verifiable by reading the file. |
| **Observation** | Pattern observed across multiple sources but not formally tested. |
| **Inference** | Reasonable conclusion drawn from confirmed facts. State the basis. |
| **Hypothesis** | Working assumption. Must be tested before it governs implementation. |
| **Unknown** | Not yet determined. Do not fill with assumption. |

Tier 1–2 documents should contain only confirmed facts and clearly labeled observations. Research and strategy documents may contain hypotheses and inferences — they must be labeled as such.

---

## What This Map Is Not

- Not a substitute for reading the authority files.
- Not a claim about what HESTIA should build next (see HESTIA_CTO_ROADMAP.md).
- Not a claim about what works in production (see HESTIA_MASTER_STATE.md).
- Not a design system (see skills/user/hestia-ui-design/SKILL.md).
