# Domain: Guest Experience

Guest experience domain — the hospitality outcomes HESTIA must ultimately produce, the guest journey, service design, and the emotional register of every interaction.

## Related Existing Documentation

- `skills/user/hestia-hospitality-intelligence/SKILL.md` — **Primary reference for this domain**
- `docs/HESTIA_MASTER_STATE.md` — Guest Portal section
- `src/domain/hospitality/hospitalityOntologyREADME.md` — Hospitality ontology
- `src/domain/hospitality/` — Canonical vocabulary layer (hospitalityEntities.js, hospitalityOperationalLoops.js, etc.)

## The Six Hospitality Emotional Outcomes

Every HESTIA feature must ultimately produce one or more of:
**Welcome, Ease, Trust, Belonging, Status, Relief, Delight, Memory**

These are not cosmetic goals — they are the criteria by which hospitality decisions are judged.

## The Six Operational Loops

1. **Promise Loop** — what was committed to
2. **Readiness Loop** — what the team prepares before service
3. **Execution Loop** — what happens during service
4. **Recovery Loop** — how problems are handled in real time
5. **Memory Loop** — how operational facts are captured after service
6. **Learning Loop** — how captured facts improve future decisions

HESTIA currently covers Promise, Readiness, and partial Execution. The Memory and Learning loops are where the moat lives — and they are the least complete.

## Current State (as of 2026-06-14)

**Production-ready:** Guest Portal (token-based RSVP, unauthenticated), guest import/check-in, seating assignment, RSVP tracking.

**Missing:** Guest memory with preferences, allergies, VIP handling, recovery history. Memory recall at moments that matter (arrival, pre-shift briefing, event confirmation). Post-event guest feedback loops.

## Future domain intelligence to place here

- Guest journey maps (before arrival → arrival → welcome → experience → farewell → after-departure)
- Accessibility hospitality design
- Service recovery and trust-rebuilding framework
- Luxury standards: privacy, discretion, personalization, invisible preparation
- Guest memory model (sensitivity, confidence, recall moments)
