# HESTIA AI

HESTIA AI is the AI operating system for hospitality teams: restaurants, cocktail bars, boutique venues, and service-led hospitality groups.

The product is built around one principle: guests are hosted, not processed. AI supports human warmth, operational memory, service discipline, training, and better manager decisions.

## Current MVP Shape

- Role-based login for employee, manager, bar manager, owner, and admin.
- Owner/admin user management with persisted user creation, role editing, venue/team assignment, Cocktail Lab permission, and disable flow.
- Shift operations control tower, service issue reporting, employee requests, budget requests, Event CRM, staff progression, academy, approved cocktail training, and owner intelligence.
- Cocktail Lab / Flavor Brain with Gemini generation and a local fallback generator so the workflow does not fail silently when AI quota or connectivity is unavailable.
- HESTIA University with Service, Bar, Wine, Coffee, Culinary Intelligence, Hostess, Manager, Event, Ethics, and Train-the-Trainer academies.

## Run Locally

```bash
npm install
npm run dev
```

The frontend usually opens at:

```bash
http://localhost:5173
```

To run the local Express backend alongside the frontend:

```bash
npm start
```

To validate the frontend build:

```bash
npm run build
```

## Demo Users

| Username | Password | Role | Notes |
| --- | --- | --- | --- |
| Peleg naim | 0000 | employee | Employee workflow |
| Saar wax | 0000 | employee | Employee workflow |
| Omer Sadot | 0000 | manager | Cocktail Lab permission |
| Zohar Zach | 0000 | manager | Manager operations |
| Tal millo | 0357 | owner | Owner intelligence and user management |
| Toam Griffel | 0000 | admin | Full access |

Owner/admin can create additional users from `System -> User Management`.

## Architecture Overview

- `src/App.jsx`: current composition layer, routing state, top-level state, and legacy components.
- `src/config`: system, role, navigation, and text configuration.
- `src/data`: static academy, cocktail, event, staff, business memory, and seed data.
- `src/services`: service boundaries for auth, users, cocktails, reports, tasks, notifications, venues, academy progress, owner insights, and Shift Brain.
- `src/lib`: shared utility infrastructure such as local persistence helpers.
- `src/features`: reserved feature-module folders for the ongoing extraction away from the large `App.jsx`.

## Persistence Strategy

The current MVP uses browser persistence behind service abstractions for the flows that are not yet migrated to backend APIs. Existing backend/SQLite endpoints remain available for archival data, but the frontend now has cleaner service boundaries so feature-by-feature migration can happen without rewriting screens.

## Product Direction

HESTIA should become the memory of the venue: shifts, incidents, recurring issues, staff growth, guest experience signals, cocktail approvals, owner briefings, and operational follow-up should connect into one daily rhythm.
