# Research Archive Usage Rules

> **Status: CANONICAL.** Read before using ANY material from `docs/research/` (including uploaded research) in architecture, modules, prompts, or implementation.
> Created: 2026-06-18 (Phase 0).
> Parents: [North Star Doctrine](./HESTIA_AI_NORTH_STAR_DOCTRINE.md), [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md).
> Complements: [docs/KNOWLEDGE_GOVERNANCE.md](../KNOWLEDGE_GOVERNANCE.md) (the broader rules for how knowledge is created, classified, challenged, and retired). This document is the **research-specific** subset; where they overlap, both apply.

---

## 1. Research is supporting material, not doctrine

The research archive (`docs/research/`, including `docs/research/researches for Venue Intelligence/` and its `_archive/`) is **supporting source material**. It is **not** canonical doctrine and **not** implementation authority.

- **Archived drafts are not canonical.** Example: `docs/research/researches for Venue Intelligence/_archive/HESTIA_Intelligence_Doctrine_v1_research_draft.md` is an archived draft; the canonical doctrine is [HESTIA_INTELLIGENCE_DOCTRINE_V1.md](./HESTIA_INTELLIGENCE_DOCTRINE_V1.md) plus the Phase 0 doctrine set indexed in [README_HESTIA_AI_DOCTRINE_INDEX.md](./README_HESTIA_AI_DOCTRINE_INDEX.md).
- A document being detailed, confident, or well-cited does **not** make it authoritative.

## 2. Research informs architecture; it is never pasted into prompts

- Research should **inform** doctrine, architecture, schemas, and guardrails.
- Research must **never** be pasted into model prompts as bulk context. Prompt context is **compact and relevant only** (the `buildKnowledgeContext` / `formatVenueBeveragePromptBlock` pattern).
- The pathway is: **research → doctrine and/or structured module → guarded implementation** — never research → prompt, and never research → code without doctrine.

## 3. Conversion pipeline (what research must become before it ships)

Before any research idea becomes behavior, convert it into one of:

- **doctrine** (a canonical doc under `docs/architecture/`);
- **a structured knowledge module** (pure, testable data + lookups under `src/domain/...`, the beverage foundation being the template);
- **a memory/data schema** (per [Venue Memory & DNA Guardrails](./VENUE_MEMORY_AND_DNA_GUARDRAILS.md) §6);
- **a specialist context adapter** (a `*ContextService` producing compact context);
- **a confidence/provenance/guardrail rule.**

## 4. Mandatory guardrail gate

Any research-derived automation must pass **all** of:

- **provenance** — labeled source of every claim;
- **confidence** — calibrated, never overstated;
- **role access** — correct `requireAuth`;
- **venue boundaries** — `venue_id`-scoped, no cross-venue;
- **evidence labels** — verified vs benchmark vs assumption;
- **human approval for high-impact decisions** — Venue DNA, strategy;
- **no fake intelligence.**

If a research idea cannot pass this gate, it stays research-only.

## 5. Research must NEVER authorize

- fake **Venue Memory**;
- fake **Venue DNA**;
- fake **KPIs**;
- fake **economics**;
- fake **sales** / fake **POS truth**;
- fake **market/reputation truth**;
- **automatic operational truth** of any kind;
- **automatic Venue DNA mutation** from weak evidence or a single AI output.

## 6. Specific research-only items (concept may inform; mechanism stays research)

Per the Master Plan and the archived draft review, these remain **research-only** until they pass §4 with real evidence:

- **"Founder Digital Twin"** as a product-facing term → use **Founder Intent Model** / Founder-Owner Memory instead.
- **Automated Identity Drift Detection** as a mechanism → the *principle* ("make change conscious") is doctrine; the automated detector is research-only.
- **Operational Climate / Service Climate scoring** → research-only (risks fake metrics / staff judgment).
- **Atmosphere auto-calibration** without real sensor/evidence data → research-only.

## 7. Handling new uploaded research

- Place it under `docs/research/` (archive drafts under an `_archive/` subfolder).
- Give it a name that **cannot be confused** with canonical doctrine; add a non-canonical banner.
- Do **not** rename or promote it into a canonical doctrine filename.
- Extract useful ideas into Phase 0+ doctrine and structured modules per §3.

---

*Canonical. Research is fuel for doctrine and modules — never fuel for prompts, and never authority for fake truth.*
