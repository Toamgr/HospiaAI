# HESTIA Memory — What Belongs Here

## Primary File

`memory/project_hestia_master_memory.md`

This is the **institutional memory for HESTIA** — the highest-authority document in the repository.
It transfers the thinking required to work on this project, not just facts about the software.

Every Claude session must read this file before doing any strategic, architectural, product, or development work.
If a conflict exists between this file and any other document, this file wins.

---

## What Belongs in `memory/`

Memory files contain **validated institutional knowledge** — things that have been tested against real work, confirmed by the founder, or derived from architectural fact.

Ask: "Is this settled enough to guide future decisions without qualification?"
- If yes → it belongs in `memory/`
- If no → it belongs in `docs/research/`

**Examples of memory-appropriate content:**
- Confirmed architectural decisions (the 10-hook model, App.jsx composition-only rule)
- Confirmed product discoveries (events_manager CAN approve, Cocktail Lab migration is blocked)
- Core philosophy and product constraints
- Technical identifiers that must not be renamed
- Live user roster and operating context
- Established operating rules for Claude sessions

**Examples of content that does NOT belong in `memory/`:**
- Active hypotheses about what HESTIA is becoming
- Unresolved strategic questions
- Research findings not yet validated against real operator behavior
- Speculative roadmap ideas outside the confirmed phases
- Category-discovery theories

These belong in `docs/research/`.

---

## What Belongs in `docs/research/`

Research files contain **active theories, unresolved models, and category discovery** — things still being investigated.

See `docs/research/README.md` for the research folder structure.

---

## File Count

This folder should stay small and authoritative.
If `project_hestia_master_memory.md` grows beyond what a single Claude session can read and apply, consider whether some content should be extracted into a separate structured doc under `docs/`.

The master memory file is not a log. It is a transfer of thinking.
