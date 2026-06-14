# HESTIA Documentation Tree

This file explains the purpose of every folder under `docs/` and where future content should go.

---

## Mandatory Reading (Before Any Work)

These three files in `docs/` root are the **source of truth for HESTIA's current state**:

| File | Purpose |
|------|---------|
| `docs/HESTIA_MASTER_STATE.md` | What HESTIA is today — what is built, connected, missing |
| `docs/HESTIA_ARCHITECTURE_AUDIT.md` | Module-by-module audit, persistence map, dead code, critical risks |
| `docs/HESTIA_CTO_ROADMAP.md` | Official phased roadmap, sequencing rules, definitions of done |

Read all three before proposing any architecture change, feature, or roadmap item.

---

## Folder Map

### `docs/architecture/`
Technical architecture documentation: system maps, phase checkpoints, component specifications, refactoring guides, data model specs.

Referenced directly by `CLAUDE.md` and `AGENTS.md`. Do not move files from here without updating those references.

**Key files:**
- `HESTIA_PHASE_2_CHECKPOINT.md` — Phase 2 completion checkpoint
- `HESTIA_SHIFT_BRAIN_V1.md` — Shift Brain V1 specification
- `HESTIA_BAR_PRODUCT_FOUNDATION.md` — Bar product domain spec
- `HESTIA_COCKTAIL_LAB_EXPERIENCE_CHECKPOINT.md` — Cocktail Lab phase checkpoint
- `HOSPIA_SYSTEM_ARCHITECTURE.md` — System architecture reference
- `HESTIA_SKILL_ALIGNMENT_AUDIT.md` — Skill alignment audit (2026-06-08)
- `REPOSITORY_ARCHITECTURE_MAP.md` — Full repository map
- `REFACTORING_MASTER_PLAN.md` — Refactoring execution plan

### `docs/strategy/`
Core operational philosophy and product direction.

**Key files:**
- `HOSPIA_STRATEGY_FOUNDATION.md` — Core strategy document (referenced by CLAUDE.md)
- `HESTIA_AUDIT_AND_NEXT_PHASE.md` — Strategic audit and next phase analysis

### `docs/academy/`
All documentation relating to the HESTIA Academy platform — curriculum design, course structure, implementation plans, research synthesis, and video production workflows.

Before any academy work, also read: `skills/user/hestia-academy-design-curriculum/SKILL.md`

### `docs/cocktail-intelligence/`
Research and documentation for the Cocktail Intelligence module.

- `README.md` — Overview of the CI documentation
- `research/` — Research PDFs and master CI intelligence document

### `docs/data/`
Bar product data architecture — confidence rules, ingestion guides, data gap analysis, supplier price ingestion, and database foundations for the bar product domain.

### `docs/design/`
Design specifications for specific HESTIA features (currently: academy instructor design).

Before any UI work, read: `skills/user/hestia-ui-design/SKILL.md`

### `docs/event-design/`
Research for the Zohar Design Brief engine — visual DNA research, luxury event creative brief structures, event branding systems, and AI image-ready brief research.

These files informed the `zoharDesignBriefEngine.js` and `ZoharDesignBrief.jsx` components added 2026-06-14.

### `docs/research/`
Active theories, unresolved models, and category discovery. Not validated doctrine.

**Subfolders:**
- `category-discovery/` — Hypotheses about what HESTIA is at its most valuable
- `hospitality-expertise/` — Deep hospitality research not yet wired into product decisions
- `operational-memory/` — Memory architecture models and research
- `decision-systems/` — Decision support and intelligence research
- `organizational-learning/` — Team learning and knowledge compounding research
- `capability-development/` — Training, judgment transfer, and expertise acceleration

See `docs/research/README.md` for full guidance on what belongs here vs `memory/`.

### `docs/domains/`
Domain-specific intelligence and product thinking, organized by operational domain.

**Subfolders:**
- `events/` — Event operations, Zohar intelligence, event CRM product thinking
- `beverage/` — Bar program, cocktail intelligence, wine program product thinking
- `academy/` — Academy product thinking and capability development
- `operations/` — Shift operations, Shift Brain, handover, incident management
- `guest-experience/` — Guest journey, hospitality outcomes, service design
- `owner-intelligence/` — Owner-facing intelligence and business memory

*Note: Most domain intelligence currently lives in `docs/architecture/`, `docs/data/`, and `docs/academy/`. The `docs/domains/` structure is ready to receive consolidated domain content as it matures.*

### `docs/archive/`
Historical documents — superseded plans, old audits, previous session prompts, archived prototypes. Nothing here governs current development.

**Subfolders:**
- `project-audits/` — Historical audit documents and phase plans
- `prompts/` — Historical Claude session prompts and audit instructions
- `prototypes/` — Archived prototype code and documentation
- `owner-components/` — Archived owner component code (from Phase 2 dead-code removal)
- `scripts/` — Archived scripts

---

## What Does NOT Go in `docs/`

- **Validated institutional memory** → `memory/project_hestia_master_memory.md`
- **Agent operating instructions** → `CLAUDE.md`, `AGENTS.md`
- **Skill definitions** → `skills/user/`
- **In-source README files** → Stay with their code in `src/`
- **Runtime data** → `data/` (SQLite, creative images)

---

## Naming Conventions

- Source-of-truth files at `docs/` root: `HESTIA_[NAME].md`
- Architecture files: `docs/architecture/HESTIA_[NAME].md`
- Legacy "HOSPIA" filenames are preserved where CLAUDE.md or AGENTS.md reference them by name
- Archive files retain their original names for traceability
