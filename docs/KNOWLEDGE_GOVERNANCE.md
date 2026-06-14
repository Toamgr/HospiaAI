# HESTIA Knowledge Governance

**Created:** 2026-06-14  
**Authority:** Operational rules for how knowledge is created, classified, challenged, and retired in the HESTIA repository.  
**Verified:** Repository root confirmed at `HOSPIA_LOCAL_APP/`. All authority files confirmed to exist.

---

## 1. Repository Root Is Confirmed

The HESTIA repository root is:

```
C:\Users\toamg\Desktop\Hospia AI 01.05.2026\HOSPIA_LOCAL_APP\
```

The following files were confirmed to exist as of 2026-06-14:

| File | Status |
|---|---|
| `CLAUDE.md` | ✅ Confirmed |
| `AGENTS.md` | ✅ Confirmed |
| `memory/project_hestia_master_memory.md` | ✅ Confirmed |
| `docs/HESTIA_MASTER_STATE.md` | ✅ Confirmed |
| `docs/HESTIA_ARCHITECTURE_AUDIT.md` | ✅ Confirmed |
| `docs/HESTIA_CTO_ROADMAP.md` | ✅ Confirmed |
| `docs/strategy/HOSPIA_STRATEGY_FOUNDATION.md` | ✅ Confirmed |
| `docs/architecture/HOSPIA_SYSTEM_ARCHITECTURE.md` | ✅ Confirmed |

Any document claiming these files are missing is incorrect and should be updated or discarded.

---

## 2. Authority Hierarchy

Not all knowledge is equal. When sources conflict, this hierarchy resolves the conflict.

```
1. memory/project_hestia_master_memory.md
   ↓ supersedes all other context sources

2. docs/HESTIA_MASTER_STATE.md
   docs/HESTIA_ARCHITECTURE_AUDIT.md
   docs/HESTIA_CTO_ROADMAP.md
   ↓ govern all architecture, roadmap, and feature decisions

3. CLAUDE.md + AGENTS.md
   ↓ govern agent behavior and session operating rules

4. docs/architecture/* (checkpoint and spec files)
   ↓ confirmed facts about how modules are built

5. docs/strategy/* (philosophy and direction)
   ↓ directional; inform but do not override Tier 2

6. Working documents (domain docs, design, data)
   ↓ may be in progress; label epistemic status

7. Research (external and internal)
   ↓ input material; not conclusions; never silently used as fact

8. docs/archive/**
   ↓ superseded; preserved; never acted on as current
```

---

## 3. Memory vs. Research — A Critical Distinction

HESTIA operates with two separate knowledge flows that must never be conflated.

### Memory
Memory is what HESTIA knows as institutional fact.

- Source: confirmed operational data, verified invoices, code-confirmed behavior, decisions formally recorded in Tier 1–2 docs.
- Persistence: `memory/project_hestia_master_memory.md`, backend database, committed documentation.
- Rule: Memory may only be updated with confirmed facts. Hypotheses do not become memory until tested.

### Research
Research is what HESTIA is investigating.

- Source: external reports, competitive analysis, domain expertise interviews, prototype learnings, open strategic questions.
- Location: `docs/research/`, `docs/cocktail-intelligence/research/`, `docs/event-design/research/`, `docs/academy/research/`.
- Rule: Research informs hypotheses. It must be labeled. It cannot silently become a product decision.

**The failure mode to avoid:** treating research conclusions as confirmed facts and building features on them before they are validated by real operational data.

---

## 4. Epistemic Labels

Every knowledge claim in HESTIA documentation should carry an epistemic label when it is not obviously a confirmed fact (e.g., from reading the code directly).

| Label | When to use |
|---|---|
| **Confirmed fact** | Directly verified by reading the file, running the code, or observing the database. |
| **Observation** | Pattern noted across multiple sources; credible but not formally tested. |
| **Inference** | Logical conclusion from confirmed facts. State which facts support it. |
| **Hypothesis** | Working assumption that drives investigation. Must be validated before governing implementation. |
| **Unknown** | Not yet determined. Never fill with assumption. Write "unknown" explicitly. |

Tier 1–2 documents (master memory, master state, audit, roadmap) must contain only confirmed facts and clearly labeled observations. Research documents may contain hypotheses and inferences — they must be labeled as such. An unlabeled claim in a Tier 6–7 document should be treated as **hypothesis** by default.

---

## 5. Documentation Rules

### 5.1 No Generic README Sprawl
A `README.md` is only useful if it contains real, specific, current information. Placeholder READMEs (e.g., "This folder will contain X") add no value and create false impressions of documentation depth. Prefer an empty directory over a content-free README.

Exception: the `docs/domains/` and `docs/research/` README files exist to signal the intent of a structural layer. They are acceptable as structural anchors while content is being developed.

### 5.2 Archive, Never Delete
Superseded documents must be moved to `docs/archive/` with a subdirectory that explains their origin. The archive path pattern is:

```
docs/archive/<category>/<original-filename>
```

Categories in use: `project-audits`, `prototypes`, `scripts`, `prompts`, `owner-components`.

Do not delete documentation. Do not permanently delete archived prototypes. Deletion destroys decision history.

### 5.3 No False Claims About Missing Files
Documentation must not assert that authority files are missing unless they have been checked in the actual filesystem at runtime. A prior session's assumption that files were missing is not a fact.

If a prior document contains a false claim about the repository state, that document must be updated or moved to archive.

### 5.4 Source Attribution for Costs and Prices
No cost, price, or financial figure may appear in HESTIA documentation or UI without source attribution. The categories are:

- `verified_invoice` — confirmed from actual supplier invoice
- `venue_entered` — manually confirmed by the venue operator
- `benchmark_estimate` — market reference, must be labeled as such and may not be used for pricing decisions silently

This rule applies to all bar product costing documentation in `docs/data/` and `docs/architecture/`.

### 5.5 Docs/intelligence as a Validated Knowledge Layer
The `docs/intelligence/` directory does not yet exist. When it is created, it should serve as a validated knowledge architecture layer — confirmed patterns and mechanisms extracted from research and operational data. It is distinct from `docs/research/` (input) and `docs/architecture/` (implementation). Nothing should be added to `docs/intelligence/` that has not been validated against real operational behavior.

---

## 6. Change Protocol

### Adding New Documentation
1. Identify the correct tier for the document (see Section 2).
2. Choose the correct directory.
3. Label epistemic status of all claims that are not confirmed facts.
4. If the document supersedes an existing document, move the old one to `docs/archive/`.
5. Update `docs/DOCUMENT_MAP.md` to reflect the new file.

### Updating Authority Files (Tier 1–2)
Authority files may only be updated based on confirmed facts from:
- Direct code inspection
- Database observation
- Explicit founder decision recorded in session

Do not update Tier 1–2 files based on inference from other sessions' outputs.

### Retiring Superseded Documents
1. Move to `docs/archive/<category>/`.
2. Do not modify content on the way out — preserve the original.
3. Update `docs/DOCUMENT_MAP.md` to reflect the move.

---

## 7. What This Governance Does Not Cover

- Application code (`src/`, `server.js`) — governed by CLAUDE.md and architecture docs.
- Database schema — governed by `docs/HESTIA_ARCHITECTURE_AUDIT.md` and `docs/data/`.
- UI design system — governed by `skills/user/hestia-ui-design/SKILL.md`.
- AI agent behavior — governed by `CLAUDE.md` and `AGENTS.md`.

This document covers documentation and knowledge claims only.

---

## 8. When to Update This Document

Update this document when:
- New knowledge categories are introduced that don't fit the current hierarchy.
- A new archive category is needed.
- Epistemic label definitions need expansion.
- The authority hierarchy changes (requires founder approval).

Do not update this document to reflect wishful architecture. Update it to reflect the governance that is actually being practiced.
