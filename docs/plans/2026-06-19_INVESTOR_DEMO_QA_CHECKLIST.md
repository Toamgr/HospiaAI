# Investor Demo — QA Checklist & Honest Demo Path (Phase 9C-5)

**Date:** 2026-06-19
**Scope:** Verify the honest investor demonstration path works cleanly and safely. This is QA + light nav polish only — no new product features.
**Build verified at:** `6ea474a` (+ this phase's polish).

---

## 0. One-line truth for the demo

> HESTIA is demonstrating a **read-only Venue DNA foundation**: deterministic completeness, honest empty states, and a locked Full Intelligence Mode. Nothing in the demo fabricates KPIs, sales, guests, or margins, and nothing mutates the venue profile.

---

## 1. Demo flow (exact order)

| # | Screen | Route | Status | What it proves |
|---|--------|-------|--------|----------------|
| 1 | **Operational Pulse** (owner default landing) | `/owner` | ✅ Live page | Stable owner home; real operational load / shift archive |
| 2 | **Owner AI Home** | `/owner/home` | ✅ Live page | Read-only Venue DNA completeness, honest foundation status |
| 3 | **Venue DNA Completeness** | (inside Owner AI Home) | ✅ Live | Deterministic coverage, "still learning", "awaiting confirmation" |
| 4 | **Venue Learning** (the real DNA builder) | `/intelligence` area → Venue Learning | ✅ Live page | Where Venue DNA is actually built by conversation |
| 5 | **Cocktail Intelligence** | `/intelligence` | ✅ Live page | AI beverage director surface |
| 6 | F&B Director Brief | `GET /api/ci/fnb-director-brief` | ⚠️ **API-only** | Backend complete; no dedicated UI yet |
| 7 | Menu Intelligence Snapshot | `GET /api/ci/menu-intelligence` | ⚠️ **API-only** | Backend complete; no dedicated UI yet |
| 8 | Decision Ledger | `GET /api/ci/decisions` | ⚠️ **API-only** | Backend complete; no dedicated UI yet |
| 9 | Candidate Signals / Review | `GET /api/venue-intelligence/candidates` (+ PATCH review) | ⚠️ **API-only** | Backend complete; no dedicated UI yet |

**Honest framing:** Items 6–9 exist as **verified, venue-scoped, read-only API endpoints** but do **not** yet have dedicated screens in the UI. Show them via API (curl / network tab) if asked, or describe them as "backend-complete, UI sequenced for a later phase." Do **not** invent a screen for them during the demo.

---

## 2. What to show & say honestly

**Owner AI Home (the centerpiece of this phase):**
- "This is the calm, AI-first owner surface. It reads a **deterministic** Venue DNA completeness model — not an AI confidence score."
- Point at **Foundation coverage %**: "Coverage reflects structured Venue DNA completeness, not performance or confidence." (this exact caveat is on screen).
- Point at **Still learning / Awaiting your confirmation**: "HESTIA refuses to mark identity-level facts as settled until the owner confirms them."
- Point at **Full Intelligence Mode: Locked**: "By design. HESTIA does not act on an unfinished venue identity."
- Point at the **inert input**: "Build Mode is intentionally inactive until confirmation checkpoints are connected — this is honesty, not a bug."

**Venue Learning:** "This is where the DNA is actually built, through conversation." (separate existing feature; writes DNA.)

---

## 3. What NOT to claim

- ❌ Do **not** call Foundation coverage "AI confidence", "venue score", "quality score", or "business score".
- ❌ Do **not** claim Full Intelligence Mode is active or available.
- ❌ Do **not** present Owner AI Home's chat input as working.
- ❌ Do **not** show or imply fake sales, POS, guests, margins, occupancy, or ROI.
- ❌ Do **not** claim F&B Director Brief / Menu Snapshot / Decision Ledger have finished screens.
- ❌ Do **not** suggest the page writes or mutates Venue DNA.

---

## 4. Route checklist

- [x] `/owner` → Operational Pulse (owner/admin) — **owner default landing, unchanged**
- [x] `/owner/home` → Owner AI Home (owner/admin) — reachable from the **Command → Intelligence** nav group
- [x] Owner AI Home nav label now resolves to **"Owner AI Home"** (was falling back to the raw key `ownerHome`)
- [x] `/intelligence` → Cocktail Intelligence (owner/manager/bar_manager/fb_director/admin)
- [x] Venue Learning + Venue Bridge Inspector under `venueIntelligence` (owner/admin)
- [x] No nav item points to a non-existent page
- [x] Owner default landing is still derived from `firstAllowedPage` → `operationalPulse` (NOT switched to `ownerHome`)

## 5. API checklist (read-only, venue-scoped)

- [x] `GET /api/venue-intelligence/completeness` → `{ ok: true, completeness }` (owner-gated)
- [x] `GET /api/venue-intelligence` → `{ state }` (owner-gated) — unchanged
- [x] `GET /api/ci/fnb-director-brief` (CI roles) — API-only
- [x] `GET /api/ci/menu-intelligence` (CI roles) — API-only
- [x] `GET /api/ci/decisions` (CI roles) — API-only
- [x] `GET /api/venue-intelligence/candidates` (CI roles) + PATCH review (owner/admin) — API-only

## 6. Safety checklist

- [x] Owner AI Home calls **only** `GET /api/venue-intelligence/completeness` (no POST/PATCH/DELETE)
- [x] Owner AI Home never references `mergeVenueDna` / `emptyVenueDna` / Venue DNA writer
- [x] Owner AI Home input is `disabled` + `aria-disabled` with intentional copy
- [x] `unlock_readiness` is read-only and always `false` (Full Intelligence Mode locked)
- [x] No fake KPI strings in Owner AI Home
- [x] No AI / OpenAI / Gemini / raw `fetch` from Owner AI Home
- [x] Empty / not-started DNA renders honest "HESTIA has not built enough Venue DNA yet"
- [x] Loading → "Reading Venue DNA foundation…"; Error → "could not read the foundation model right now"

---

## 7. Fallback plan if a screen fails mid-demo

1. **Owner AI Home fails to load** → it degrades to an honest error panel; pivot to **Operational Pulse** (`/owner`), the stable default.
2. **Completeness endpoint errors** → the page stays readable (no crash, no fake data); narrate the read-only design and move to Venue Learning.
3. **Any F&B API surface requested** → open the network tab / curl the endpoint rather than implying a finished screen.
4. **Anything unexpected** → Operational Pulse is the safe, always-stable owner screen.

---

## 8. Final pre-demo checklist (run these)

```
npm run test:venue-dna-completeness
npm run test:venue-dna-completeness-route
npm run test:owner-ai-home-completeness-ui
npm run test:investor-demo-readiness
npm run hestia:check
npm run build
```

- [ ] All six commands pass
- [ ] Logged in as owner/admin
- [ ] A venue is selected (X-HESTIA-Venue resolves)
- [ ] Operational Pulse loads
- [ ] Owner AI Home loads and shows a foundation status (even `not_started` is fine and honest)
- [ ] Full Intelligence Mode shows **Locked**
- [ ] Browser console shows no runtime errors

---

## 9. QA findings (this pass)

**Verified working / honest:**
- Owner AI Home reachable from nav, renders cleanly, reads only the completeness endpoint, handles `not_started` gracefully, keeps Full Intelligence Mode locked, inert input reads as intentional.
- Operational Pulse remains the owner default landing; route protection (owner/admin) intact.

**Issue found & fixed (minimal, low-risk):**
- The Owner AI Home nav item had **no label** in `textConfig.js`, so the sidebar displayed the raw key `ownerHome`. Added `ownerHome: 'Owner AI Home'` to the English `pages` block (the universal fallback). No routing or default-landing change.

**Honest gaps (not bugs — reported, not "fixed"):**
- F&B Director Brief, Menu Intelligence Snapshot, Decision Ledger, and Candidate Review are **API-only**; no dedicated screens exist yet. These are sequenced for a later UI phase and must not be presented as finished screens.
