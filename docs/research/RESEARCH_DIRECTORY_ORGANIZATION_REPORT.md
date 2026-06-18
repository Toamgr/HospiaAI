# HESTIA Research Directory Organization Report

**Date:** 2026-06-19
**Operation:** Documentation reorganization of `docs/research/` (Phase B — applied)
**Method:** `git mv` for tracked files; plain `mv` for untracked files (no git history existed to preserve)
**Scope:** Documentation only. No application code, schemas, config, or runtime assets were touched.

---

## 1. Final Folder Structure

```
docs/research/
├── README.md
├── RESEARCH_DIRECTORY_ORGANIZATION_REPORT.md   (this file)
├── capability-development/
│   └── README.md                               (no research files assigned)
├── category-discovery/
│   ├── README.md
│   ├── 2026-06-14_FOUNDER_MEMORY_AND_VENUE_DNA_DISCOVERY.md   (pre-existing)
│   └── FOUNDER INTELLIGENCE RESEARCH.md                       (moved)
├── category-venue-intelligence/                (new folder)
│   ├── THE VENUE INTELLIGENCE RESEARCH.md
│   ├── DIGITAL VENUE TWIN _ VENUE SIMULATION RESEARCH.md
│   ├── HESTIA STRATEGIC WHITE SPACE _ CATEGORY CREATION RESEARCH.md
│   ├── VENUE INTELLIGENCE GRAPH _ HOSPITALITY KNOWLEDGE GRAPH RESEARCH.md
│   └── HESTIA MULTI-VENUE HOSPITALITY GROUP INTELLIGENCE RESEARCH.md
├── cognitive-architecture/                     (left in place)
│   ├── README.md
│   ├── 02_MEMORY_EVOLUTION_AND_KNOWLEDGE_LIFECYCLE.md
│   ├── 05_INTELLIGENCE_ORCHESTRATION_AND_MULTI_AGENT_REASONING.md
│   ├── AGENTIC WORKFLOW DESIGN & TASK EXECUTION ARCHITECTURE.md
│   ├── Agentic workflow design & task execution architecture .md
│   ├── Anticipatory AI Architecture Research.md
│   ├── CONTEXT ENGINEERING & RETRIEVAL ARCHITECTURE.md
│   ├── Cognitive Architecture For Operational AI.md
│   ├── Conversational Intelligence & Real-Time Understanding for Long-Term Operational AI Systems.md
│   ├── Human state modeling & context-aware reasoning.md
│   └── Operational AI Governance Architecture.md
├── decision-systems/                           (new folder)
│   ├── README.md
│   ├── HESTIA_VENUE_DECISION_INTELLIGENCE_FRAMEWORK.md
│   ├── VENUE DECISION INTELLIGENCE RESEARCH.md
│   └── HESTIA UNCERTAINTY REDUCTION ENGINE RESEARCH.md
├── hospitality-expertise/
│   ├── README.md
│   ├── academy-training-intelligence/          (new folder)
│   │   └── Training Intelligence + Academy Brain research.md
│   ├── beverage-intelligence/                  (new folder)
│   │   └── HESTIA BEVERAGE INTELLIGENCE MASTER RESEARCH.md
│   ├── fnb-intelligence/                        (new folder)
│   │   └── F&B INTELLIGENCE BEVERAGE + MENU STRATEGY RESEARCH.md
│   ├── guest-intelligence/                      (new folder)
│   │   └── GUEST INTELLIGENCE RESEARCH.md
│   ├── hospitality-economics/                   (new folder)
│   │   └── HESTIA HOSPITALITY ECONOMICS INTELLIGENCE RESEARCH.md
│   ├── reputation-intelligence/                 (new folder)
│   │   └── REPUTATION INTELLIGENCE _ MARKET POSITIONING RESEARCH.md
│   └── service-guest-experience/                (new folder)
│       └── SERVICE INTELLIGENCE HOSPITALITY PSYCHOLOGY RESEARCH.md
├── intelligence-system-design/                 (left in place; one file added)
│   ├── FROM COGNITIVE RESEARCH TO PRODUCTION AI ARCHITECTURE.md
│   ├── HESTIA INTELLIGENCE INFRASTRUCTURE & MEMORY SYSTEM MASTER RESEARCH.md
│   ├── HESTIA SYSTEM ARCHITECTURE AND BEVERAGE INTELLIGENCE ONTOLOGY.md
│   ├── HESTIA Venue Intelligence Operating System Γאף Operational DecisionΓאª.md   (mojibake name — left as-is)
│   └── Hestia Venue Intelligence Architecture.md                                   (moved in)
├── operational-memory/                         (new folder)
│   ├── README.md
│   ├── ORGANIZATIONAL MEMORY _ VENUE MEMORY RESEARCH.md
│   ├── ORGANIZATIONAL VENUE MEMORY RESEARCH.md
│   └── ORGANIZATIONAL_MEMORY_VENUE_MEMORY_RESEARCH_SUPPLEMENT.md
├── organizational-learning/                    (new folder)
│   ├── README.md
│   ├── EMPLOYEE INTELLIGENCE STAFF DEVELOPMENT RESEARCH.md           (Hebrew)
│   └── HESTIA_EMPLOYEE_INTELLIGENCE_STAFF_DEVELOPMENT_RESEARCH.md    (English)
├── researches for Venue Intelligence/          (now near-empty — left in place)
│   ├── README.md
│   └── _archive/
│       └── HESTIA_Intelligence_Doctrine_v1_research_draft.md
└── fnb-intelligence/                           (now empty — left in place, untracked)
```

---

## 2. Every Moved File (old path → new path)

All source paths are relative to repo root.

### Moved with `git mv` (tracked — history preserved)

| Old path | New path |
|---|---|
| `docs/research/researches for Venue Intelligence/THE VENUE INTELLIGENCE RESEARCH.md` | `docs/research/category-venue-intelligence/THE VENUE INTELLIGENCE RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/DIGITAL VENUE TWIN _ VENUE SIMULATION RESEARCH.md` | `docs/research/category-venue-intelligence/DIGITAL VENUE TWIN _ VENUE SIMULATION RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/HESTIA STRATEGIC WHITE SPACE _ CATEGORY CREATION RESEARCH.md` | `docs/research/category-venue-intelligence/HESTIA STRATEGIC WHITE SPACE _ CATEGORY CREATION RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/VENUE INTELLIGENCE GRAPH _ HOSPITALITY KNOWLEDGE GRAPH RESEARCH.md` | `docs/research/category-venue-intelligence/VENUE INTELLIGENCE GRAPH _ HOSPITALITY KNOWLEDGE GRAPH RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/HESTIA MULTI-VENUE HOSPITALITY GROUP INTELLIGENCE RESEARCH.md` | `docs/research/category-venue-intelligence/HESTIA MULTI-VENUE HOSPITALITY GROUP INTELLIGENCE RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/FOUNDER INTELLIGENCE RESEARCH.md` | `docs/research/category-discovery/FOUNDER INTELLIGENCE RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/GUEST INTELLIGENCE RESEARCH.md` | `docs/research/hospitality-expertise/guest-intelligence/GUEST INTELLIGENCE RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/SERVICE INTELLIGENCE HOSPITALITY PSYCHOLOGY RESEARCH.md` | `docs/research/hospitality-expertise/service-guest-experience/SERVICE INTELLIGENCE HOSPITALITY PSYCHOLOGY RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/REPUTATION INTELLIGENCE _ MARKET POSITIONING RESEARCH.md` | `docs/research/hospitality-expertise/reputation-intelligence/REPUTATION INTELLIGENCE _ MARKET POSITIONING RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/F&B INTELLIGENCE BEVERAGE + MENU STRATEGY RESEARCH.md` | `docs/research/hospitality-expertise/fnb-intelligence/F&B INTELLIGENCE BEVERAGE + MENU STRATEGY RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/HESTIA HOSPITALITY ECONOMICS INTELLIGENCE RESEARCH.md` | `docs/research/hospitality-expertise/hospitality-economics/HESTIA HOSPITALITY ECONOMICS INTELLIGENCE RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/ORGANIZATIONAL MEMORY _ VENUE MEMORY RESEARCH.md` | `docs/research/operational-memory/ORGANIZATIONAL MEMORY _ VENUE MEMORY RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/ORGANIZATIONAL VENUE MEMORY RESEARCH.md` | `docs/research/operational-memory/ORGANIZATIONAL VENUE MEMORY RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/ORGANIZATIONAL_MEMORY_VENUE_MEMORY_RESEARCH_SUPPLEMENT.md` | `docs/research/operational-memory/ORGANIZATIONAL_MEMORY_VENUE_MEMORY_RESEARCH_SUPPLEMENT.md` |
| `docs/research/researches for Venue Intelligence/HESTIA_VENUE_DECISION_INTELLIGENCE_FRAMEWORK.md` | `docs/research/decision-systems/HESTIA_VENUE_DECISION_INTELLIGENCE_FRAMEWORK.md` |
| `docs/research/researches for Venue Intelligence/VENUE DECISION INTELLIGENCE RESEARCH.md` | `docs/research/decision-systems/VENUE DECISION INTELLIGENCE RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/HESTIA UNCERTAINTY REDUCTION ENGINE RESEARCH.md` | `docs/research/decision-systems/HESTIA UNCERTAINTY REDUCTION ENGINE RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/EMPLOYEE INTELLIGENCE STAFF DEVELOPMENT RESEARCH.md` | `docs/research/organizational-learning/EMPLOYEE INTELLIGENCE STAFF DEVELOPMENT RESEARCH.md` |
| `docs/research/researches for Venue Intelligence/HESTIA_EMPLOYEE_INTELLIGENCE_STAFF_DEVELOPMENT_RESEARCH.md` | `docs/research/organizational-learning/HESTIA_EMPLOYEE_INTELLIGENCE_STAFF_DEVELOPMENT_RESEARCH.md` |
| `docs/research/cognitive-architecture/Training Intelligence + Academy Brain research.md` | `docs/research/hospitality-expertise/academy-training-intelligence/Training Intelligence + Academy Brain research.md` |

### Moved with plain `mv` (were untracked — no git history existed)

| Old path | New path |
|---|---|
| `docs/research/hospitality-expertise/HESTIA BEVERAGE INTELLIGENCE MASTER RESEARCH.md` | `docs/research/hospitality-expertise/beverage-intelligence/HESTIA BEVERAGE INTELLIGENCE MASTER RESEARCH.md` |
| `docs/research/fnb-intelligence/Hestia Venue Intelligence Architecture.md` | `docs/research/intelligence-system-design/Hestia Venue Intelligence Architecture.md` |

**Total moved: 23 files.** All filenames preserved byte-for-byte (including spaces, `&`, `+`, `_`).

---

## 3. Files Left In Place

- All of `docs/research/cognitive-architecture/` except the Training/Academy file (10 cognitive/orchestration/governance research files + README).
- All pre-existing files in `docs/research/intelligence-system-design/` (production-architecture research).
- `docs/research/category-discovery/2026-06-14_FOUNDER_MEMORY_AND_VENUE_DNA_DISCOVERY.md`.
- All `README.md` files in every research subfolder (left with their folders).
- `docs/research/researches for Venue Intelligence/README.md` and `_archive/HESTIA_Intelligence_Doctrine_v1_research_draft.md` (the `_archive` draft carries a pre-existing, unrelated modification from before this task).
- **All of `docs/architecture/`** — these are doctrine, product authority, implementation specs, and phase plans, not research. Untouched.

---

## 4. Files Needing Future Review

- **`docs/research/intelligence-system-design/HESTIA Venue Intelligence Operating System Γאף Operational DecisionΓאª.md`** — filename contains mojibake/corrupted characters (a garbled em-dash). Left exactly as-is per instruction; rename deferred to a separate explicit task.
- **`capability-development/`** — currently holds only its README; no research file was assigned here. Confirm whether it should remain as a placeholder for future experimental capability research.

---

## 5. Duplicate / Overlap Candidates (kept separate — NOT merged, NOT deleted)

1. **Employee Intelligence pair** (now in `organizational-learning/`):
   - `EMPLOYEE INTELLIGENCE STAFF DEVELOPMENT RESEARCH.md` (Hebrew document)
   - `HESTIA_EMPLOYEE_INTELLIGENCE_STAFF_DEVELOPMENT_RESEARCH.md` (English document)
   Same topic, different documents/languages. Both retained.
2. **Organizational / Venue Memory trio** (now in `operational-memory/`):
   - `ORGANIZATIONAL MEMORY _ VENUE MEMORY RESEARCH.md`
   - `ORGANIZATIONAL VENUE MEMORY RESEARCH.md`
   - `ORGANIZATIONAL_MEMORY_VENUE_MEMORY_RESEARCH_SUPPLEMENT.md` (explicitly a supplement)
   Overlapping topic; all three retained separately.
3. **Agentic Workflow pair** (left in `cognitive-architecture/`):
   - `AGENTIC WORKFLOW DESIGN & TASK EXECUTION ARCHITECTURE.md` (uppercase)
   - `Agentic workflow design & task execution architecture .md` (lowercase, trailing space)
   Both retained; not moved.

---

## 6. Confirmation: No Files Deleted

No file was deleted. The operation consisted solely of directory creation and file moves. File count under `docs/research/` is conserved (every source file is accounted for at a new or original path).

## 7. Confirmation: No Content Rewritten

No document content was edited, rewritten, normalized, or merged. Moves preserve file contents byte-for-byte. The only content modification anywhere in `docs/research/` (`_archive/HESTIA_Intelligence_Doctrine_v1_research_draft.md`) pre-existed this task and was not made by this operation.

## 8. Confirmation: No Application Code Changed

No changes to `src/`, `server.js`, `package.json`, `.env`, database files, migrations, tests, or runtime assets. Pre-existing unstaged modifications to those files (visible in git status) are unrelated to this task and were not touched.

---

## 9. Empty Folders Left In Place

- **`docs/research/fnb-intelligence/`** — now empty (its single untracked file was moved to `intelligence-system-design/`). Left in place; not deleted (deletion not approved).
- **`docs/research/researches for Venue Intelligence/`** — now contains only `README.md` and `_archive/`. Left in place; not deleted.

(Empty directories do not appear in `git status` or `find -type f`; they remain on disk.)

---

## 10. Links / References That May Need Manual Review

- **Folder READMEs**: any README inside the moved-from/`researches for Venue Intelligence/` folder that lists or links the relocated files will now point to old locations. Review `docs/research/researches for Venue Intelligence/README.md` and the destination folder READMEs.
- **Cross-document links**: research documents that referenced the moved files by their old relative path will need link updates. No automated link rewriting was performed (content was not edited).
- **Doctrine index**: `docs/architecture/README_HESTIA_AI_DOCTRINE_INDEX.md` and other doctrine docs were not scanned for links into `docs/research/`; if any reference moved research paths, update them manually.

---

## 11. Final `git status --short`

```
R  "docs/research/researches for Venue Intelligence/FOUNDER INTELLIGENCE RESEARCH.md" -> "docs/research/category-discovery/FOUNDER INTELLIGENCE RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/DIGITAL VENUE TWIN _ VENUE SIMULATION RESEARCH.md" -> "docs/research/category-venue-intelligence/DIGITAL VENUE TWIN _ VENUE SIMULATION RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/HESTIA MULTI-VENUE HOSPITALITY GROUP INTELLIGENCE RESEARCH.md" -> "docs/research/category-venue-intelligence/HESTIA MULTI-VENUE HOSPITALITY GROUP INTELLIGENCE RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/HESTIA STRATEGIC WHITE SPACE _ CATEGORY CREATION RESEARCH.md" -> "docs/research/category-venue-intelligence/HESTIA STRATEGIC WHITE SPACE _ CATEGORY CREATION RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/THE VENUE INTELLIGENCE RESEARCH.md" -> "docs/research/category-venue-intelligence/THE VENUE INTELLIGENCE RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/VENUE INTELLIGENCE GRAPH _ HOSPITALITY KNOWLEDGE GRAPH RESEARCH.md" -> "docs/research/category-venue-intelligence/VENUE INTELLIGENCE GRAPH _ HOSPITALITY KNOWLEDGE GRAPH RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/HESTIA UNCERTAINTY REDUCTION ENGINE RESEARCH.md" -> "docs/research/decision-systems/HESTIA UNCERTAINTY REDUCTION ENGINE RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/HESTIA_VENUE_DECISION_INTELLIGENCE_FRAMEWORK.md" -> docs/research/decision-systems/HESTIA_VENUE_DECISION_INTELLIGENCE_FRAMEWORK.md
R  "docs/research/researches for Venue Intelligence/VENUE DECISION INTELLIGENCE RESEARCH.md" -> "docs/research/decision-systems/VENUE DECISION INTELLIGENCE RESEARCH.md"
R  "docs/research/cognitive-architecture/Training Intelligence + Academy Brain research.md" -> "docs/research/hospitality-expertise/academy-training-intelligence/Training Intelligence + Academy Brain research.md"
R  "docs/research/researches for Venue Intelligence/F&B INTELLIGENCE BEVERAGE + MENU STRATEGY RESEARCH.md" -> "docs/research/hospitality-expertise/fnb-intelligence/F&B INTELLIGENCE BEVERAGE + MENU STRATEGY RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/GUEST INTELLIGENCE RESEARCH.md" -> "docs/research/hospitality-expertise/guest-intelligence/GUEST INTELLIGENCE RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/HESTIA HOSPITALITY ECONOMICS INTELLIGENCE RESEARCH.md" -> "docs/research/hospitality-expertise/hospitality-economics/HESTIA HOSPITALITY ECONOMICS INTELLIGENCE RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/REPUTATION INTELLIGENCE _ MARKET POSITIONING RESEARCH.md" -> "docs/research/hospitality-expertise/reputation-intelligence/REPUTATION INTELLIGENCE _ MARKET POSITIONING RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/SERVICE INTELLIGENCE HOSPITALITY PSYCHOLOGY RESEARCH.md" -> "docs/research/hospitality-expertise/service-guest-experience/SERVICE INTELLIGENCE HOSPITALITY PSYCHOLOGY RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/ORGANIZATIONAL MEMORY _ VENUE MEMORY RESEARCH.md" -> "docs/research/operational-memory/ORGANIZATIONAL MEMORY _ VENUE MEMORY RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/ORGANIZATIONAL VENUE MEMORY RESEARCH.md" -> "docs/research/operational-memory/ORGANIZATIONAL VENUE MEMORY RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/ORGANIZATIONAL_MEMORY_VENUE_MEMORY_RESEARCH_SUPPLEMENT.md" -> docs/research/operational-memory/ORGANIZATIONAL_MEMORY_VENUE_MEMORY_RESEARCH_SUPPLEMENT.md
R  "docs/research/researches for Venue Intelligence/EMPLOYEE INTELLIGENCE STAFF DEVELOPMENT RESEARCH.md" -> "docs/research/organizational-learning/EMPLOYEE INTELLIGENCE STAFF DEVELOPMENT RESEARCH.md"
R  "docs/research/researches for Venue Intelligence/HESTIA_EMPLOYEE_INTELLIGENCE_STAFF_DEVELOPMENT_RESEARCH.md" -> docs/research/organizational-learning/HESTIA_EMPLOYEE_INTELLIGENCE_STAFF_DEVELOPMENT_RESEARCH.md
 M "docs/research/researches for Venue Intelligence/_archive/HESTIA_Intelligence_Doctrine_v1_research_draft.md"
```

Plus the two `mv`-relocated untracked files, which appear under untracked entries:
```
?? docs/research/hospitality-expertise/beverage-intelligence/
?? docs/research/intelligence-system-design/
```

> Note: Pre-existing unstaged changes to application files (`package.json`, `server.js`, `src/...`) and untracked `docs/architecture/*`, `docs/audits/`, `docs/plans/`, `scripts/*`, `src/domain/...`, `src/services/venueBridge/...` are unrelated to this task and were not modified. This report file itself will also appear as a new untracked file.

---

*End of report. No commit was made.*
