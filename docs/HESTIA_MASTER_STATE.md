# HESTIA Master State

> ⚠️ **PARTIALLY SUPERSEDED** — verified 2026-06-22.
> This document remains useful for historical context and original sequencing, but some hard facts are stale.
> For current repo reality, prefer:
>
> - `docs/audits/HESTIA_FULL_APP_DEEP_QA_AUDIT.md`
> - `docs/gems/hestia-research-brain/01_HESTIA_CURRENT_STATE.md`
> - `docs/architecture/HESTIA_PHASE_8_MULTI_VENUE.md` where multi-venue status matters
>
> Known stale areas may include: server.js line count, DB table count, AI provider reality (OpenAI is primary, not Gemini), and single-venue vs multi-venue framing (multi-venue shipped Phase 8).
> Do not treat this document as the sole source of truth for current implementation state.

**Last updated:** 2026-06-09
**Status:** Active development — Phase 1 (Operational Connection Layer) pending execution
**Authority:** This document is the source of truth for what HESTIA is today.

---

## ⚠ Project Isolation Warning

HESTIA is a standalone hospitality management platform.

It is **entirely separate** from any other AI startup project, EventSheet product, or external codebase. Do not import code, architecture, routing patterns, naming conventions, database schemas, documentation structures, or roadmap decisions from any other project into HESTIA.

If you are an AI agent operating in this repository: this warning applies to you. Do not cross-reference other projects. Do not mix product logic. Do not suggest architectural patterns from other contexts.

---

## What HESTIA Is

HESTIA is a **hospitality operating system** for premium venues. It is designed to help hospitality teams run service with more operational clarity, memory, and coordination. It is not a generic business SaaS product.

HESTIA serves real operational roles:
- Owner
- Manager
- F&B Director
- Events Manager
- Chef
- Bar Manager
- Employee / Bartender / Waiter

Every module in HESTIA must help at least one of these roles do real hospitality work.

---

## What HESTIA Is Not

- Not a chatbot application
- Not a generic admin panel
- Not a dashboard for KPIs
- Not a task management tool for software teams
- Not an event ticketing platform
- Not a POS system
- Not a CRM for sales leads
- Not a generic SaaS product

---

## Multi-Venue Foundation (Phase 8 — 2026-06-14)

HESTIA is now **venue-scoped**: a venue is the memory unit, a user is the operator.
Each venue has fully isolated DNA, briefs, Omer/Academy/Owner Intelligence, and
operations. Venue context is carried per request via the `X-HESTIA-Venue` header,
resolved against `venue_members` (Platform Admin sees all; other roles see only
assigned venues). Missing header falls back to the user's default venue; an
unauthorized explicit venue is rejected (403). A venue selector appears only when
a user can reach more than one venue — single-venue installs are unchanged. Full
detail: `docs/architecture/HESTIA_PHASE_8_MULTI_VENUE.md`.

---

## Current Maturity Status

HESTIA is a **partially operational hospitality platform** with production-grade infrastructure and uneven module completion.

The system already contains:
- A real SQLite backend with 51 tables and 120+ API routes
- Server-side JWT authentication with bcrypt, sessions, and idle timeout
- A full Event CRM with guests, seating, tasks, timeline, and calendar
- Zohar: a deterministic event brief engine generating real hospitality intelligence
- Cocktail Intelligence: ~120 backend routes for bar program management
- A Chef module with AI food menu generation and two-stage approval
- A Shift Organizer with AI-powered scheduling and employee visibility
- A Shift Brain deterministic intelligence engine
- An Academy platform with 130+ structured lessons across 6 academies
- A Wine Atlas (full standalone editorial experience)
- A notification system that is backend-persisted and role-targeted
- User management with role-based access control

**The current problem is not lack of modules.**

**The current problem is incomplete cross-module orchestration.**

Modules exist but are not fully connected. Event briefs exist but do not seed the bar and kitchen departments. The pre-shift briefing does not know about tonight's event. The Shift Organizer does not know an 80-guest wedding is happening. Post-event data is not captured. Owner Intelligence pages are built but disabled. Several approval chains still use localStorage instead of the backend.

---

## Completed Major Systems

| System | Status | Notes |
|---|---|---|
| Authentication (JWT, bcrypt, sessions) | Production Ready | 7-day token, idle timeout, silent restore |
| Event CRM (create/guests/seating/tasks/timeline) | Production Ready | Full backend CRUD, auto-task creation |
| Zohar Event Brief Engine | Production Ready | Deterministic, 17 subtypes, structured signals |
| Zohar Hospitality DNA | Production Ready | 90 deterministic tests passing |
| Event Calendar (monthly view, health scoring) | Production Ready | Calendar Intelligence, daily briefing, ICS export |
| Cocktail Intelligence (CI) Dashboard | Production Ready | ~120 routes, menus, DNA, sales, lifecycle, exports |
| Chef Module (food menu, AI, approval) | Production Ready | Two-stage FB Director + Owner approval |
| Shift Management (pre-shift, handover, EOD) | Production Ready | Full backend, lifecycle, carry-forward |
| Shift Brain V1 | Production Ready | Deterministic intelligence, real operational data |
| Academy Platform | Production Ready (platform) | 130+ lessons; 2 Synthesia videos live |
| Wine Atlas | Production Ready | Full standalone editorial experience |
| Notification System | Production Ready | Backend-persisted, role-targeted |
| User Management | Production Ready | Full CRUD, roles, enable/disable |
| Guest Portal (RSVP) | Production Ready | Token-based, unauthenticated RSVP |
| Calendar ICS Export | Production Ready | RFC 5545, Google/Outlook/Apple compatible |

---

## Partially Connected Systems

| System | What Exists | What Is Missing |
|---|---|---|
| Zohar → Cocktail Intelligence | Bar brief generated | No "Seed to CI" action; bar brief is clipboard-only |
| Zohar → Chef / Food | Food brief generated | No "Generate Event Food Menu" button; food brief has no action path |
| Pre-Shift Briefing | Full briefing screen | Does not receive today's events; event context is absent |
| Shift Brain | Deterministic scoring | Does not receive upcoming event data; is event-blind |
| Shift Organizer | AI schedule generation | Event date/guest count not passed to Gemini prompt |
| Event Architect | Links to real events | 8 sub-components still render demo data |
| EventTeam tab | Exists | Hardcoded role suggestions; no connection to Shift Organizer |
| Post-event workflow | Events can be marked complete | No EOD trigger; no operational memory capture |
| Owner Intelligence | Backend routes exist | Most pages feature-flagged off; 2 of 5 legacy pages have empty data |
| CI ← Event menus | CI routes exist | Approved event cocktail menus do not enter CI lifecycle |

---

## Known Incomplete Systems

| System | Current State | Blocker |
|---|---|---|
| Cocktail Lab backend persistence | localStorage only | ID scheme conflict (string vs integer); documented migration plan exists |
| Budget requests | localStorage only | No backend table |
| Employee requests | localStorage only | No backend table |
| Assigned tasks (manager → employee) | localStorage only | No backend table |
| Owner notes | localStorage only | No backend table |
| WhatsApp messaging | Simulation mode (logs to DB, not delivered) | No real delivery integration |
| PDF export (Visual Menu Builder) | Prototype | Puppeteer render not yet implemented |
| Post-event EOD capture | Missing | No "Close this event" action or EOD seeding |
| Weekly Summary / Profit Leaks / BusinessMRI | WIP stubs | Require 4+ weeks of live operational data |
| EventTeam → Staffing | Static placeholder | Requires Shift Organizer connection |

---

## Current Highest-Priority Product Direction

Transform HESTIA from a collection of connected modules into a **unified hospitality operating system** by connecting existing systems to each other — without building new modules.

The most important connections to make:
1. Zohar event brief → Cocktail Intelligence (event bar brief seeds the AI bar director)
2. Zohar event brief → Chef module (event food brief generates a food menu)
3. Daily briefing → Pre-shift briefing (manager sees tonight's events at shift start)
4. Event load → Shift Organizer (schedule generation is event-aware)
5. Event lifecycle → EOD and operational memory (completed events are remembered)

All of these use infrastructure that already exists. None require building new modules.

---

## Current Development Phases

Full detail in: `docs/HESTIA_CTO_ROADMAP.md`

| Phase | Theme | Status |
|---|---|---|
| Phase 1 | Operational Connection Layer | **Pending — ready to start** |
| Phase 2 | Close the Loop and Fix the Flagship | Pending Phase 1 |
| Phase 3 | Data Persistence and Complete Operations | Pending Phase 2 |
| Phase 4 | Technical Hardening | Pending Phase 3 |

---

## What Should Not Be Rebuilt

The following systems are complete and working. Do not duplicate, replace, or refactor them unless a specific bug is being fixed:

- `buildZoharBrief()` and all Zohar intelligence utilities — these are deterministic engines, not placeholders
- The Event CRM tab structure (EventDetail with 8 tabs)
- `useEventState` hook — fully wired, backend-persisted
- Cocktail Intelligence Dashboard and its ~120 backend routes
- The Chef module approval workflow
- The Academy lesson player and course manifest
- The Shift Brain intelligence engine (`shiftBrainService.js`)
- The notification system (backend-persisted, role-targeted)
- The authentication system (JWT, bcrypt, sessions)
- The calendar ICS export utility
- The Wine Atlas

---

## What Agents Must Read Before Suggesting Changes

Before proposing any architecture change, new module, roadmap change, major feature, or refactor in HESTIA, an agent must read:

1. **`docs/HESTIA_MASTER_STATE.md`** (this file) — what exists today
2. **`docs/HESTIA_ARCHITECTURE_AUDIT.md`** — detailed module-by-module audit
3. **`docs/HESTIA_CTO_ROADMAP.md`** — validated development roadmap

These three files are the current source of truth for HESTIA.

Additionally:
- Read `CLAUDE.md` for architecture rules and design system requirements
- Read `skills/user/hestia-ui-design/SKILL.md` before any UI work
- Read `skills/user/hestia-hospitality-intelligence/SKILL.md` before any hospitality logic
- Read `skills/user/hestia-product-design-judgment/SKILL.md` before any product decisions

Do not propose building something that already exists. Do not propose connecting systems that are already connected. Verify against the audit before suggesting work.

---

## LocalStorage vs Backend — Quick Reference

| Data Domain | Persistence | Priority |
|---|---|---|
| Events, guests, tables, tasks, timeline | SQLite backend | Stable |
| Auth, sessions, users | SQLite backend | Stable |
| Shift reports, actions, incidents | SQLite backend | Stable |
| Cocktail Intelligence | SQLite backend | Stable |
| Chef menus | SQLite backend | Stable |
| Academy progress | SQLite backend | Stable |
| Notifications | SQLite backend | Stable |
| Cocktail Lab (drafts, approved, archived, practice) | localStorage | Phase 3 migration |
| Budget requests | localStorage | Phase 3 migration |
| Employee requests | localStorage | Phase 3 migration |
| Assigned tasks | localStorage | Phase 3 migration |
| Owner notes | localStorage | Phase 3 migration |
| Employee performance | localStorage | Phase 3 migration |

---

*This document reflects the state of the repository as of June 9, 2026, following a full codebase audit and roadmap validation.*
