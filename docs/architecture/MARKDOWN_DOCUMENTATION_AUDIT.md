# HESTIA — Markdown Documentation Audit

**Date:** 2026-06-05  
**Auditor:** Claude Code  
**Scope:** All `.md` files in the repository, excluding `node_modules` and `.git`

---

## Summary

| Status | Count |
|--------|-------|
| Keep | 22 |
| Update recommended | 5 |
| Archive | 3 |
| Delete | 1 |
| New (created this session) | 4 |

---

## Complete Inventory

---

### Root-level files

---

**`CLAUDE.md`**  
- **Purpose:** Project instructions for Claude Code — defines architecture rules, brand conventions, hook patterns, and feature boundaries.
- **Status:** Keep
- **Risk:** High — this file governs Claude's behavior in all future sessions. It must stay accurate.
- **Notes:** Currently references `HOSPIA_STRATEGY_FOUNDATION.md` and `HOSPIA_SYSTEM_ARCHITECTURE.md` by filename. If those files are renamed, update the paths here.

---

**`PROMPT1.md`**  
- **Purpose:** The audit prompt that initiated this session. Not architecture documentation.
- **Status:** Archive → move to `docs/archive/prompts/PROMPT1_AUDIT_2026-06-05.md`
- **Risk:** Low — no other file references this.
- **Notes:** Useful to keep as a historical reference for how this refactoring audit was scoped.

---

**`README.md`**  
- **Purpose:** Project README. Likely contains setup and run instructions.
- **Status:** Update recommended
- **Risk:** Low
- **Notes:** Should be reviewed to ensure setup instructions reflect the current Node 22+ requirement, the correct run commands (`npm run start`), and the current `.env` variables needed.

---

### `docs/architecture/` — Architecture documentation

---

**`docs/architecture/ARCHITECTURE.md`**
- **Purpose:** General architecture overview (older document).
- **Status:** Update recommended — likely superseded by the new `REPOSITORY_ARCHITECTURE_MAP.md` created in this session.
- **Risk:** Low
- **Notes:** Should be reviewed to see if its content is still accurate. If it duplicates `REPOSITORY_ARCHITECTURE_MAP.md`, consolidate or remove it. If it contains unique detail, merge the relevant parts into the new map.

---

**`docs/architecture/CLAUDE_REFACTORING_EXECUTION_GUIDE.md`** ← New
- **Purpose:** Working method and protocol for Claude Code during the refactoring effort.
- **Status:** Keep
- **Risk:** High — this governs how future coding sessions should operate.

---

**`docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_AUDIT.md`**
- **Purpose:** Audit of the academy instructor feature — what was built, what issues were found.
- **Status:** Keep — valuable implementation history.
- **Risk:** Low to read, low to keep.
- **Notes:** Could be moved to `docs/archive/project-audits/` when the instructor feature is fully stable.

---

**`docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_IMPLEMENTATION_PACKAGE.md`**
- **Purpose:** Implementation package for the academy instructor feature — specs, decisions, how it was built.
- **Status:** Keep
- **Risk:** Low
- **Notes:** Useful for anyone picking up the instructor feature later.

---

**`docs/architecture/HESTIA_BAR_PRODUCT_DATA_MODEL.md`**
- **Purpose:** Bar product data model specification — relates to `src/domain/hospitality/bar/`.
- **Status:** Keep
- **Risk:** Low
- **Notes:** Referenced by CLAUDE.md via `HESTIA_BAR_PRODUCT_FOUNDATION.md`. Keep both.

---

**`docs/architecture/HESTIA_BAR_PRODUCT_FOUNDATION.md`**
- **Purpose:** Full specification for the bar product domain layer. Referenced in CLAUDE.md as an authoritative source.
- **Status:** Keep — CLAUDE.md references this file by name.
- **Risk:** High — if this file moves or is renamed, update CLAUDE.md.

---

**`docs/architecture/HESTIA_COCKTAIL_LAB_COSTING_MODEL.md`**
- **Purpose:** Documents the cocktail costing model, confidence levels, and data sources.
- **Status:** Keep
- **Risk:** Low
- **Notes:** Supplements the Cocktail Lab checkpoint document.

---

**`docs/architecture/HESTIA_COCKTAIL_LAB_EXPERIENCE_CHECKPOINT.md`**
- **Purpose:** Checkpoint document for Phase 2 Cocktail Lab features — costing honesty and build guide. Referenced in CLAUDE.md.
- **Status:** Keep — CLAUDE.md references this file.
- **Risk:** High — if renamed, update CLAUDE.md.

---

**`docs/architecture/HESTIA_PHASE_1_DATABASE_SCHEMA_PLAN.md`**
- **Purpose:** Phase 1 database schema planning document. Historical.
- **Status:** Archive → move to `docs/archive/project-audits/`
- **Risk:** Low — this plan has been executed. The schema is now in `server.js`.
- **Notes:** Keep as historical record of schema decisions.

---

**`docs/architecture/HESTIA_PHASE_2_CHECKPOINT.md`**
- **Purpose:** Full checkpoint for Phase 2 completion (2026-05-12). Referenced in CLAUDE.md.
- **Status:** Keep — CLAUDE.md references this file.
- **Risk:** High — if renamed, update CLAUDE.md.

---

**`docs/architecture/HESTIA_SHIFT_BRAIN_V1.md`**
- **Purpose:** Full documentation for Shift Brain V1. Referenced in CLAUDE.md.
- **Status:** Keep — CLAUDE.md references this file.
- **Risk:** High — if renamed, update CLAUDE.md.

---

**`docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md`**
- **Purpose:** System architecture document. Referenced in CLAUDE.md as a core strategic document.
- **Status:** Keep — CLAUDE.md references this file.
- **Risk:** High — if renamed, update CLAUDE.md. Note: the filename uses the old "HOSPIA" brand. Per CLAUDE.md, this file can be renamed only if CLAUDE.md paths are updated simultaneously.

---

**`docs/architecture/REFACTORING_MASTER_PLAN.md`** ← New
- **Purpose:** The full refactoring plan with phases, tasks, and validation checklists.
- **Status:** Keep
- **Risk:** High — this governs the refactoring effort.

---

**`docs/architecture/REPOSITORY_ARCHITECTURE_MAP.md`** ← New
- **Purpose:** Comprehensive map of the current repository structure, routing, state, security, and architecture.
- **Status:** Keep
- **Risk:** High — must be updated when architecture changes.

---

### `docs/archive/project-audits/`

---

**`docs/archive/project-audits/HESTIA_CTO_AUDIT_2026-05-21.md`**
- **Purpose:** CTO-level audit from 2026-05-21. Contains architectural observations and risk assessment.
- **Status:** Keep — valuable historical context and cross-reference for this refactoring effort.
- **Risk:** Low. Already archived.

---

**`docs/archive/project-audits/HESTIA_FULL_PROJECT_AUDIT_2026-05-18.md`**
- **Purpose:** Full project audit from 2026-05-18.
- **Status:** Keep — historical record.
- **Risk:** Low. Already archived.

---

### `docs/cocktail-intelligence/`

---

**`docs/cocktail-intelligence/CLAUDE_PREVIOUS_AUDIT_PLAN.md`**
- **Purpose:** A previous Claude session audit plan for the cocktail intelligence module.
- **Status:** Archive → move to `docs/archive/prompts/`
- **Risk:** Low — this is a previous session plan, superseded by the current audit.
- **Notes:** May contain useful context about how the CI module was designed. Keep in archive.

---

**`docs/cocktail-intelligence/docs/cocktail-intelligence/README.md`**
- **Purpose:** README for the cocktail intelligence research folder.
- **Status:** Update recommended — this file lives at an odd nested path (`docs/cocktail-intelligence/docs/cocktail-intelligence/`). The nesting looks like a copy/paste error.
- **Risk:** Low
- **Notes:** Consider moving to `docs/cocktail-intelligence/README.md` and deleting the oddly-nested duplicate path.

---

**`docs/cocktail-intelligence/docs/cocktail-intelligence/research/HESTIA_Cocktail_Intelligence_Master.md`**
- **Purpose:** Research document for cocktail intelligence — the master design and intelligence spec.
- **Status:** Keep — valuable research document.
- **Risk:** Low — nested in an odd path, but the content is valuable.
- **Notes:** When the path is cleaned up (above), move this to `docs/cocktail-intelligence/research/`.

---

### `docs/data/`

---

**`docs/data/HESTIA_BAR_CLAUDE_INGESTION_GUIDE.md`**
- **Purpose:** Guide for Claude on how to ingest bar product data correctly.
- **Status:** Keep
- **Risk:** Low
- **Notes:** Relevant when working with bar product data entry or pricing ingestion.

---

**`docs/data/HESTIA_BAR_DATA_CONFIDENCE_RULES.md`**
- **Purpose:** Rules for confidence levels in bar product data.
- **Status:** Keep
- **Risk:** Low

---

**`docs/data/HESTIA_BAR_DATA_GAPS_AND_COLLECTION_PLAN.md`**
- **Purpose:** Documents data gaps in the bar product domain and the plan to collect missing data.
- **Status:** Update recommended — data gaps and collection plans change over time.
- **Risk:** Low
- **Notes:** Review whether the identified gaps are still accurate.

---

**`docs/data/HESTIA_BAR_PRODUCT_DATABASE_FOUNDATION.md`**
- **Purpose:** Foundation document for the bar product database structure.
- **Status:** Keep
- **Risk:** Low

---

**`docs/data/HESTIA_VERIFIED_SUPPLIER_PRICE_INGESTION.md`**
- **Purpose:** Process documentation for ingesting verified supplier prices.
- **Status:** Keep
- **Risk:** Low

---

### `docs/design/`

---

**`docs/design/HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`**
- **Purpose:** Design spec for the academy instructor feature — visual and UX design decisions.
- **Status:** Keep
- **Risk:** Low

---

### `docs/roadmap/`

---

**`docs/roadmap/ROADMAP.md`**
- **Purpose:** Product roadmap.
- **Status:** Update recommended — roadmap should reflect current priorities including the refactoring phases described in this session.
- **Risk:** Low

---

### `docs/strategy/`

---

**`docs/strategy/HESTIA_AUDIT_AND_NEXT_PHASE.md`**
- **Purpose:** Strategic audit and next phase planning document.
- **Status:** Update recommended — should be reviewed against the new refactoring plan.
- **Risk:** Low

---

**`docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md`**
- **Purpose:** Core strategy document. Referenced in CLAUDE.md as one of the two core strategic documents.
- **Status:** Keep — CLAUDE.md references this file by name.
- **Risk:** High — if renamed, update CLAUDE.md. Note: filename uses old "HOSPIA" brand.

---

### `src/` — In-source documentation

---

**`src/components/ui/README.md`**
- **Purpose:** Documents the UI component system.
- **Status:** Keep
- **Risk:** Low

---

**`src/domain/hospitality/bar/README.md`**
- **Purpose:** Documents the bar domain layer. Referenced by CLAUDE.md implicitly through the bar foundation docs.
- **Status:** Keep
- **Risk:** Low

---

**`src/domain/hospitality/hospitalityOntologyREADME.md`**
- **Purpose:** Documents the hospitality ontology layer (`src/domain/hospitality/`).
- **Status:** Keep
- **Risk:** Low

---

**`src/features/README.md`**
- **Purpose:** Documents the features folder convention.
- **Status:** Keep
- **Risk:** Low

---

**`src/features/owner/_archived/README.md`**
- **Purpose:** Explains why the `_archived/` folder exists and what it contains.
- **Status:** Keep — this README explains the purpose of the archive.
- **Risk:** Low
- **Notes:** When the folder is renamed to `_archive/`, update this README's header accordingly.

---

**`src/features/owner/legacy/README.md`**
- **Purpose:** Explains the `legacy/` folder.
- **Status:** Keep
- **Risk:** Low

---

**`src/hooks/README.md`**
- **Purpose:** Documents the hooks architecture and conventions.
- **Status:** Keep — important for developers understanding the hook-based state model.
- **Risk:** Low

---

**`src/prototypes/academyVideoInstructor/ACADEMY_STRUCTURE_AUDIT.md`**
- **Purpose:** Audit of the academy structure done as part of prototype work.
- **Status:** Archive → when `src/prototypes/` is moved to `docs/archive/prototypes/`, this file goes with it.
- **Risk:** Low

---

**`src/prototypes/academyVideoInstructor/README.md`**
- **Purpose:** Documents the academy video instructor prototype.
- **Status:** Archive → moves with the prototype folder.
- **Risk:** Low

---

### Stray path — `tmphestia-atlas-whispers/`

---

**`tmphestia-atlas-whispers/src/routes/README.md`**
- **Purpose:** Unknown. The folder `tmphestia-atlas-whispers/` is a temporary or stray directory in the project root.
- **Status:** Delete — this entire folder appears to be a temporary working directory that was not cleaned up.
- **Risk:** Low — it is not referenced by any runtime code. Verify it is not referenced before deleting.
- **Notes:** The folder name suggests it may have been created during a temporary worktree or branch operation. Safe to delete if no other file imports from it.

---

## Documentation Gaps to Fill

The following documentation does not currently exist and would be valuable to create in the future:

1. **API endpoint reference** — a simple list of all `/api/*` routes with their required roles, request shape, and response shape. Currently, this exists only in `server.js`.

2. **Environment setup guide** — a clear document for how to set up the `.env` file for a new developer. The `.env.example` covers the basics but could be expanded with explanations for each key.

3. **Role guide** — a plain-language explanation of what each role can see and do. Currently the role rules live in `src/config/roleConfig.js` which is not human-readable.

4. **Deployment guide** — how to deploy HESTIA to a production server. Currently the app has no production deployment documentation.

5. **Data backup and recovery** — what data is in the SQLite database, how to back it up, and how to recover from a corrupted database.

---

## After the Audit — Action Summary

### Markdown files kept (no action needed)

- `CLAUDE.md`
- `docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_AUDIT.md`
- `docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_IMPLEMENTATION_PACKAGE.md`
- `docs/architecture/HESTIA_BAR_PRODUCT_DATA_MODEL.md`
- `docs/architecture/HESTIA_BAR_PRODUCT_FOUNDATION.md`
- `docs/architecture/HESTIA_COCKTAIL_LAB_COSTING_MODEL.md`
- `docs/architecture/HESTIA_COCKTAIL_LAB_EXPERIENCE_CHECKPOINT.md`
- `docs/architecture/HESTIA_PHASE_2_CHECKPOINT.md`
- `docs/architecture/HESTIA_SHIFT_BRAIN_V1.md`
- `docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md`
- `docs/archive/project-audits/HESTIA_CTO_AUDIT_2026-05-21.md`
- `docs/archive/project-audits/HESTIA_FULL_PROJECT_AUDIT_2026-05-18.md`
- `docs/cocktail-intelligence/docs/cocktail-intelligence/research/HESTIA_Cocktail_Intelligence_Master.md`
- `docs/data/HESTIA_BAR_CLAUDE_INGESTION_GUIDE.md`
- `docs/data/HESTIA_BAR_DATA_CONFIDENCE_RULES.md`
- `docs/data/HESTIA_BAR_PRODUCT_DATABASE_FOUNDATION.md`
- `docs/data/HESTIA_VERIFIED_SUPPLIER_PRICE_INGESTION.md`
- `docs/design/HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`
- `docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md`
- `src/components/ui/README.md`
- `src/domain/hospitality/bar/README.md`
- `src/domain/hospitality/hospitalityOntologyREADME.md`
- `src/features/README.md`
- `src/features/owner/_archived/README.md`
- `src/features/owner/legacy/README.md`
- `src/hooks/README.md`

### Markdown files recommended for update

- `README.md` — update setup instructions and Node 22 requirement
- `docs/architecture/ARCHITECTURE.md` — review against new `REPOSITORY_ARCHITECTURE_MAP.md`; consolidate or remove
- `docs/cocktail-intelligence/docs/cocktail-intelligence/README.md` — fix nested path
- `docs/data/HESTIA_BAR_DATA_GAPS_AND_COLLECTION_PLAN.md` — review current gaps
- `docs/roadmap/ROADMAP.md` — add refactoring as a current initiative
- `docs/strategy/HESTIA_AUDIT_AND_NEXT_PHASE.md` — review against current state

### Markdown files to archive

- `PROMPT1.md` → `docs/archive/prompts/PROMPT1_AUDIT_2026-06-05.md`
- `docs/cocktail-intelligence/CLAUDE_PREVIOUS_AUDIT_PLAN.md` → `docs/archive/prompts/`
- `docs/architecture/HESTIA_PHASE_1_DATABASE_SCHEMA_PLAN.md` → `docs/archive/project-audits/`
- `src/prototypes/academyVideoInstructor/ACADEMY_STRUCTURE_AUDIT.md` → with prototype folder
- `src/prototypes/academyVideoInstructor/README.md` → with prototype folder

### Markdown files to delete

- `tmphestia-atlas-whispers/src/routes/README.md` — with the stray `tmphestia-atlas-whispers/` directory

### New files created this session

- `docs/architecture/REPOSITORY_ARCHITECTURE_MAP.md`
- `docs/architecture/REFACTORING_MASTER_PLAN.md`
- `docs/architecture/CLAUDE_REFACTORING_EXECUTION_GUIDE.md`
- `docs/architecture/MARKDOWN_DOCUMENTATION_AUDIT.md` (this file)
