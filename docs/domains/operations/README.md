# Domain: Operations

Shift operations domain — Shift Brain, pre-shift briefing, handover, EOD reporting, incident management, Shift Organizer, and the daily operational rhythm of a hospitality venue.

## Related Existing Documentation

- `docs/architecture/HESTIA_SHIFT_BRAIN_V1.md` — Shift Brain V1 specification (referenced by CLAUDE.md)
- `docs/HESTIA_MASTER_STATE.md` — Shift Management section
- `docs/HESTIA_ARCHITECTURE_AUDIT.md` — Shift operations audit
- `skills/user/hestia-product-design-judgment/SKILL.md` — Operations product judgment

## Current State (as of 2026-06-14)

**Production-ready:** Shift lifecycle (pre-shift briefing, handover, EOD), carry-forward tasks, full backend persistence, Shift Brain V1 deterministic intelligence, Shift Organizer with AI scheduling.

**Phase 1 connection pending:** Daily briefing → Pre-shift briefing (highest ROI item: `events.events` already in App.jsx, one prop pass away). Shift Brain ← event load (currently event-blind). Shift Organizer ← event context.

**Shift Brain rules:**
- All intelligence lives in `shiftBrainService.js` — do not add intelligence logic to components or hooks
- `useShiftBrainState.js` is the only call site for `buildShiftIntelligence()`
- Components render; they do not compute intelligence inline

## Future domain intelligence to place here

- Shift Brain event integration design
- Post-event EOD trigger design
- Operational memory capture at shift close
- Incident pattern → coaching signal design
