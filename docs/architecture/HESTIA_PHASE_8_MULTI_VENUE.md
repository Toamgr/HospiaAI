# HESTIA Phase 8 — Multi-Venue Intelligence Foundation

**Status:** Complete — 2026-06-14
**Scope:** Memory boundaries + venue context transport. The intelligence brain
(Phases 1–7) was **not** redesigned, rebuilt, or replaced.

---

## Strategic model

- **User** = the operator (identity = `auth_users.id`).
- **Venue** = the memory unit. Each venue has fully isolated DNA, Venue Learning,
  briefs, Omer F&B context, Academy context, Owner Intelligence, operations,
  events, and staff data.
- **Owner** can operate multiple venues. **Platform Admin** (`role = 'admin'`)
  manages HESTIA itself (support/debug) and is documented as Platform Admin —
  **not** a venue admin.
- **Account / Group portfolio** = a future phase (not built here).

> Venue is the memory unit. User is the operator. Never share DNA or memory
> across venues.

## What changed

The intelligence layer already accepted `venueId` everywhere; the only
single-venue assumption was the hardcoded `defaultVenueId()` → `"venue-main"`.

1. **`venue_members` table** — `(user_id → auth_users.id, venue_id, venue_role,
   active, created_at)`, `UNIQUE(user_id, venue_id)`. Maps operators to the
   venues they may access and the role they hold *inside* that venue. Idempotent
   backfill grants every existing non-admin user membership of `venue-main`, so
   legacy installs are unchanged.
2. **Per-request venue resolution** — `requireAuth()` (the chokepoint every
   venue-scoped route passes) now sets `req.venueId = resolveVenueId(req)`:
   - **Missing `X-HESTIA-Venue`** → silent fallback to the user's default/first
     accessible venue (legacy single-venue behavior, zero friction).
   - **Present but not accessible** → **403** (never a silent redirect — that
     could make the UI believe it writes Venue B while the backend writes A).
   - Bootstrap/discovery endpoints (`/api/auth/me`, `GET /api/venues`) fall back
     instead of 403 so the client can always recover from a stale venue header.
3. **`defaultVenueId()` retired from handlers** — 134 in-handler call sites now
   use `req.venueId`. `defaultVenueId()` remains only as the seed/bootstrap
   constant and the ultimate fallback (seeding, empty installs, platform-admin
   with no venues, and the `seedCocktailIntelligence()` bootstrap).
4. **Venue endpoints** — `GET /api/venues` (membership-scoped list +
   `currentVenueId`), `POST /api/venues` (owner/admin create; auto-assigns the
   creator as venue owner).
5. **Frontend** — `X-HESTIA-Venue` header injected by `src/services/api/client.js`;
   `useVenueState` hook owns the selected venue (persisted in localStorage);
   `VenueSelector` renders in `TopNav` **only when `venues.length > 1`**, with an
   owner/admin "New venue" affordance. Switching a venue persists + reloads so
   every venue-scoped hook refetches against the new memory unit (no UI leakage).

## Access rules (venue selector)

| Role | Venues visible |
|---|---|
| Platform Admin (`admin`) | All venues (bypasses membership) |
| Owner | Venues they own / are members of |
| F&B Director / Manager / Events Manager / Chef / Bar Manager / Employee | Only assigned venues |

Single accessible venue → no selector, no header required, identical to pre-Phase-8.

## Files changed

- `server.js` — CORS allow-header; `venue_members` table + backfill; `venues.description`
  column; `venuesForUser` / `defaultVenueForUser` / `resolveVenueId`; `req.venueId`
  in `requireAuth`; `GET`/`POST /api/venues`; 134 handler `defaultVenueId()` → `req.venueId`.
- `src/services/api/client.js` — venue header injection.
- `src/services/api/venuesApi.js` — new.
- `src/hooks/useVenueState.js` — new.
- `src/features/shell/VenueSelector.jsx` — new.
- `src/features/shell/TopNav.jsx` — selector wiring.
- `src/App.jsx` — `useVenueState` wiring (composition only).
- `src/config/systemConfig.js` — `STORAGE.currentVenue`.

## Verification (2026-06-14)

- `npm run build` — PASS. `npm run hestia:check` — PASS (no FAIL; pre-existing WARNs only).
- Live two-venue test (Venue A: Luxury Cocktail Bar; Venue B: Hotel Restaurant):
  - Owner initially sees 1 venue (`venue-main`); after creating A & B, sees 3.
  - A note written under A is invisible under B and vice-versa — **no cross-venue leak**.
  - Bridge/owner-intelligence/academy/operations/context all respond per-venue (200).
  - Manager (member of `venue-main` only): no header → 200 (`venue-main`);
    header for Venue A → **403** ("You do not have access to the requested venue").

## Known limitations

- **No membership-management UI** — assigning *existing* users to *additional*
  venues is a follow-up; venue creation auto-assigns only the creator.
- **No invitations, portfolio analytics, group reporting, or billing** — out of scope.
- **`auth_users` vs `hospia_users` not unified** — the user-management UI
  (`hospia_users`, free-text `venue`) is still separate from the membership model
  (`venue_members` keyed on `auth_users.id`). Documented for a future cleanup.
- **AI-driven DNA divergence** (distinct Venue Learning conversations per venue)
  exercises the same venue-keyed storage/read paths but requires live model keys
  to demonstrate end-to-end; the isolation mechanism itself is verified deterministically.

## Recommended Phase 9

1. **Membership-management UI** — owners/admins assign users to venues and set
   per-venue roles (`venue_members` already supports this).
2. **Unify `auth_users` + `hospia_users`** into one operator model.
3. **Account / Group layer** — the portfolio above venues (the future "Account is
   the portfolio" tier), only once membership management is in place.
