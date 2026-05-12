# HESTIA AI Architecture

## Product Frame

HESTIA AI is a hospitality operating system. The center of gravity is Shift Brain: the venue's operational memory, built from shift reports, service issues, manager actions, employee requests, staff progression, cocktail governance, event planning, and owner intelligence.

## Folder Structure

```text
src/
  App.jsx
  components/ui/
  config/
  data/
  data/academy/
  features/
    academy/
    auth/
    cocktail-lab/
    dashboard/
    events/
    notifications/
    owner-intelligence/
    shift-brain/
    staff/
    tasks/
  hooks/
  lib/
  prompts/
  services/
```

`App.jsx` is still the main composition file, but new work should move into `features`, `services`, `hooks`, and `components/ui` rather than adding more top-level code.

## Auth Flow

1. Users are seeded from `src/config/roleConfig.js`.
2. Runtime users are loaded and persisted through `src/services/userService.js`.
3. Login uses `src/services/authService.js`, which authenticates against the persisted user list.
4. The current session is stored in `STORAGE.currentUser`.
5. Disabled users cannot log in.

## Role System

Roles:

- `admin`: full access.
- `owner`: owner intelligence, system governance, user management, approvals.
- `manager`: shift operations, Event CRM, staff progression, academy, budget requests.
- `bar_manager`: manager-level operations plus Cocktail Lab when `canManageCocktails` is true.
- `employee`: employee home, academy, approved cocktails, issue reporting, employee requests.

Page permissions live in `src/config/navigationConfig.js`. Role helpers live in `src/config/roleConfig.js`.

## Data Layer

Current MVP persistence is mixed:

- Local-first service abstractions for users, tasks, academy progress, notifications, venues, cocktail generation fallback, and owner insights.
- Existing backend/SQLite endpoints for selected archival flows such as shift reports, event plans, and business memory.

The next backend migration should move feature-by-feature behind the service files:

- `authService.js`
- `userService.js`
- `venueService.js`
- `reportService.js`
- `taskService.js`
- `academyService.js`
- `cocktailService.js`
- `ownerInsightService.js`
- `notificationService.js`
- `shiftBrainService.js`

## Shift Brain Architecture

Shift Brain should aggregate:

- Daily shift reports.
- Service incidents.
- Manager action board.
- Employee operational requests.
- Event tasks.
- Business memory.
- Staff progression.
- Cocktail approval and practice.

The current foundation is `src/services/shiftBrainService.js`, which computes a basic operational snapshot and owner brief from real app data.

## AI Strategy

AI should not behave like a toy chatbot. It should behave like operational memory and expert hospitality reasoning.

Current Cocktail Lab strategy:

- Gemini is attempted first.
- If Gemini fails or quota is unavailable, HESTIA uses a local deterministic fallback generator.
- Fallback output is clearly marked and still includes a full recipe, scoring, strategic read, costing note, and approval-ready draft.

Future AI layers should use persisted venue data: repeated issues, staffing gaps, menu performance, event patterns, and owner follow-up.

## Refactor Rule

Do not add new large screens directly into `App.jsx`. New systems should start in feature folders and expose a small component/service boundary.
