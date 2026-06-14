# Domain: Events

Event operations domain — the Event CRM, Zohar Brief Engine, Event Architect, event cocktail menus, and the full event lifecycle from creation to post-event memory capture.

## Related Existing Documentation

- `docs/HESTIA_MASTER_STATE.md` — Event CRM section, Zohar section
- `docs/HESTIA_ARCHITECTURE_AUDIT.md` — Event Operations Audit section
- `docs/event-design/` — Zohar Design Brief research (visual DNA, creative brief structure)
- `skills/user/hestia-hospitality-intelligence/SKILL.md` — Event hospitality intelligence

## Current State (as of 2026-06-14)

**Production-ready:** Full Event CRM (8-tab EventDetail), Zohar Event Brief Engine (deterministic, 17 subtypes, 90 tests), Zohar Design Brief Engine, Event Calendar with daily briefing.

**Partially connected:** Event Architect still renders demo data. No post-event EOD trigger. EventTeam tab not connected to live schedule. Event cocktail menus not entering CI lifecycle.

**Phase 1 connections pending:** Zohar → Chef, Zohar → CI seeding, EventTeam → live schedule, Event cocktail menu → CI lifecycle, Chef event status in EventOverview.

## Future domain intelligence to place here

- Post-event memory capture models
- Event hospitality DNA (beyond current 17 subtypes)
- Guest journey maps for different event types
- Accessibility hospitality for events
- Service recovery planning for event failures
