# Domain: Owner Intelligence

Owner-facing intelligence domain — business memory, operational reports, the owner command center, and decision support for venue owners.

## Related Existing Documentation

- `docs/HESTIA_MASTER_STATE.md` — Owner Intelligence section
- `docs/HESTIA_ARCHITECTURE_AUDIT.md` — Owner Intelligence audit
- `docs/HESTIA_CTO_ROADMAP.md` — Phase 2 and 3 activation plan

## Current State (as of 2026-06-14)

**All 10 Owner Intelligence feature flags are currently `false`.**

Two pages have real data and can be activated in **Phase 2** (after Phase 1 creates data):
- `OwnerReport` — has real data
- `BusinessMemoryPage` — has real data

Three pages will show empty lists until their backend tables exist (**Phase 3**):
- `BudgetApprovals` — no backend table
- `OwnerOperationalRequests` — no backend table
- Assigned tasks — no backend table

**Critical:** Import files in `owner/` proxy to `owner/wip/` (stubs) instead of `owner/legacy/` (real implementations). The redirects are backwards and must be fixed when activating.

## Do Not Activate Until Phase 1 is Complete

Owner Intelligence pages are feature-flagged off for a reason: they need data created by Phase 1 connections (shift events flowing into briefs, Zohar briefs seeding CI, etc.) before they have anything meaningful to show.

Activating them early produces empty pages that undermine the product's credibility.

## Future domain intelligence to place here

- Owner briefing design (what should an owner see, when, and in what form)
- Business memory model (what operational facts are worth preserving for ownership-level decisions)
- Owner Intelligence activation plan (when and in what order to enable pages)
- Decision support framework for owner-level choices
