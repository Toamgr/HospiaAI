# HESTIA — Event Architect Demo-Data Contamination Audit

> **RESOLVED UPDATE** — PlanningSummary and BarProgramme primary trust risk was fixed by 257e5dd. Remaining demo-data findings are P2/P3 unless reclassified by a future audit. The body below is preserved as a historical pre-fix snapshot.

**Type:** Read-only audit. No source files modified.
**Date:** 2026-06-22
**Base:** origin/main @ f4b9963
**Scope:** All imports/references of `eventBrainDemoData` and the event flows that render them.
**Source file under audit:** `src/features/events/data/eventBrainDemoData.js`

The demo-data module is correctly self-labeled at the top:
> `// DEMO ONLY — all data in this file is illustrative simulation content...`
> Names (Cohen-Levi, Yael, Roni, ...), financial figures, and event details are fictional.

It exports: `EVENT_BRIEF`, `DEFAULT_TABLES`, `ZONE_LABELS`, `ZONE_NOTES`, `TABLE_NOTES`, `BAR_PROGRAMME`, `STAFF_NOTIFICATIONS`.

---

## 1. References found (source code only)

Docs/audits/memory references are excluded (not production code). Nine source references:

| # | File | Imports | Status |
|---|------|---------|--------|
| 1 | `src/features/events/EventBrain.jsx` | `DEFAULT_TABLES`, `EVENT_BRIEF` | Live — rendered |
| 2 | `src/features/events/components/PlanningSummary.jsx` | `EVENT_BRIEF` | Live — rendered |
| 3 | `src/features/events/components/BarProgramme.jsx` | `BAR_PROGRAMME` | Live — rendered |
| 4 | `src/features/events/components/StaffNotifications.jsx` | `STAFF_NOTIFICATIONS` | Live — rendered (labeled demo) |
| 5 | `src/features/events/components/ZoharPanel.jsx` | `ZONE_LABELS`, `TABLE_NOTES`, `ZONE_NOTES`, `EVENT_BRIEF` | Live — rendered (mostly fallback/static; 2 unused imports) |
| 6 | `src/features/events/components/EventArchitectPrintableBrief.jsx` | `BAR_PROGRAMME`, `STAFF_NOTIFICATIONS` | Live — export brief (labeled demo) |
| 7 | `src/features/events/utils/eventArchitectAdapter.js` | `EVENT_BRIEF` | Live — orientation fallback only (flagged) |
| 8 | `src/features/events/components/EventBriefCard.jsx` | `EVENT_BRIEF` | **Dead — never imported** |
| 9 | `src/features/events/components/SelectedTablePanel.jsx` | `ZONE_LABELS`, `ZONE_NOTES`, `TABLE_NOTES` | **Dead — never imported** |

> Note: `DailyBriefing.jsx` defines its own *local* `EventBriefCard` component (props-driven, real event data). It is unrelated to the orphaned `components/EventBriefCard.jsx` and does not touch demo data.

---

## 2. Per-reference risk classification

### #1 — EventBrain.jsx  (P3 — safe, honest fallback)
- **Production-visible:** yes (Event Architect Studio page).
- **Fallback-only:** yes. `eventBrief = architectBrief ?? EVENT_BRIEF`; `tables = savedPlan?.tables ?? DEFAULT_TABLES`.
- **Honesty surfaces:** CommandBar shows an `Event-linked` vs **`Demo`** badge; `PlanNotice` shows *"Demo architect plan shown — event data unavailable."* when no event is linked.
- **Mistakable as real?** Low. The demo state is explicitly badged.
- **Caveat:** `DEFAULT_TABLES` is used as the starting table layout **even for real linked events** (`deriveArchitectTablesFromEvent` returns the fallback unchanged). So a real event opens onto the demo's 17-table Kahi layout with demo waiter names (Yael, Roni…) until the user edits/saves. This is layout seed data, not presented as confirmed seating, but waiter names are fictional. **P3 (borderline P2).**

### #2 — PlanningSummary.jsx  (P1 — primary trust risk)
- **Production-visible:** yes. Rendered **unconditionally** in EventBrain bottom section (`<PlanningSummary />`, line 654) — including when a **real event is linked**.
- **Fallback-only:** no. Hardcoded `const b = EVENT_BRIEF`. Takes no props.
- **Demo label:** **none.** Titled *"AI Planning Summary / Resort Operations Plan"* with concrete staff/food/beverage/budget numbers derived from the demo's 186 guests @ ₪680pp.
- **Mistakable as real?** **Yes.** When an operator opens a real event in Event Architect, this card sits beside real event-linked intelligence and reads as AI planning for *that* event, but every figure is the Cohen-Levi demo. This is the strongest "looks like real venue/event intelligence" risk in the flow.

### #3 — BarProgramme.jsx  (P1 — primary trust risk)
- **Production-visible:** yes. Unconditional in EventBrain bottom section (line 655).
- **Fallback-only:** no. Hardcoded `BAR_PROGRAMME`. Takes no props.
- **Demo label:** **none.** Titled *"Bar Programme / Signature List"* listing Kahi Spritz, Garden Arak Fizz, etc., plus invented bar locations.
- **Mistakable as real?** **Yes.** Presents fictional cocktails as the event's signature bar list with no disclaimer, regardless of linked event.

### #4 — StaffNotifications.jsx  (P2 — labeled demo, low risk)
- **Production-visible:** yes. Unconditional in EventBrain bottom section (line 656).
- **Fallback-only:** no. Hardcoded `STAFF_NOTIFICATIONS`.
- **Demo label:** **yes — two.** A "Demo only" chip in the header and *"Demo only — no real messages are sent."* footer.
- **Mistakable as real?** Low — it is honestly labeled. Residual risk: the subject line hardcodes *"Cohen-Levi Wedding at Kahi · Sept 18, 2026"* even when a real event is open (visual mismatch, but disclaimed).

### #5 — ZoharPanel.jsx  (P3 — mostly static/fallback)
- **Production-visible:** yes (right column of Event Architect).
- **Usage:** `const b = eventBrief ?? EVENT_BRIEF` — but EventBrain always passes a non-null `eventBrief`, so the `?? EVENT_BRIEF` fallback is effectively dead. `ZONE_LABELS` are static UI zone names (Main Hall / Garden / Pool / VIP), not event facts.
- **Unused imports:** `TABLE_NOTES` and `ZONE_NOTES` are imported but **never referenced** in the file (dead imports).
- **Mistakable as real?** Low. Zohar's visible intelligence (risk/seating/coordination/timeline) is computed from real props, not from demo data.

### #6 — EventArchitectPrintableBrief.jsx  (P2 — labeled, but mixes demo into a real export)
- **Production-visible:** yes (Print/Export Brief modal).
- **Fallback-only:** no. `BAR_PROGRAMME` and `STAFF_NOTIFICATIONS` are hardcoded into the printable brief sections.
- **Demo label:** **yes** — explicit *"Demo-only Event Architect brief... Names, financial figures, and event details are fictional."* disclaimer at the foot of the brief.
- **Mistakable as real?** Medium-low. The brief header uses the real linked event (`eventBrief` prop), but the **Bar Programme** and **Staff Assignments** sections are always demo. A printed/exported artifact mixing a real event header with fictional bar+staff content is a more durable trust risk than on-screen, though the disclaimer mitigates it. **P2.**

### #7 — eventArchitectAdapter.js  (P3 — honest, flagged fallback)
- **Production-visible:** indirectly (its output feeds EventBrain).
- **Usage:** only `EVENT_BRIEF.budgetPerPerson` and `EVENT_BRIEF.currency`, used as an orientation fallback **explicitly flagged** with `budgetPerPersonFallback: true`. Comment: *"Never invents fake data."*
- **Mistakable as real?** Low — the fallback is self-declaring downstream.

### #8 — EventBriefCard.jsx  (P3 — dead code, not bundled into any route)
- **Production-visible:** **no.** Never imported anywhere. Orphaned component that would render full demo `EVENT_BRIEF` if it were ever wired.
- **Risk today:** none to users; latent risk if a future dev imports it assuming it is event-aware.

### #9 — SelectedTablePanel.jsx  (P3 — dead code)
- **Production-visible:** **no.** Never imported. Superseded by `EventArchitectTablePanel`. Uses static `ZONE_LABELS`/`ZONE_NOTES`/`TABLE_NOTES`.
- **Risk today:** none to users; latent only.

---

## 3. Event-flow coverage check

| Flow | Touches demo data? | Verdict |
|------|--------------------|---------|
| Event Manager landing (`DailyBriefing`) | No (own real-data `EventBriefCard`) | Clean |
| Event Calendar / Event List / Event Detail | No demo-data imports found | Clean |
| **Event Architect (`EventBrain`)** | Yes — #1–#6 render here | **Contaminated (P1 in bottom cards)** |
| Event Cocktail Menu Builder | No `eventBrainDemoData` import | Clean (separate audit per Cocktail memory) |
| Creative Preview / Vision Modal | No demo-data import | Clean |
| Printable / Export Brief | Yes — #6 (labeled demo) | P2 |

The contamination is contained to **Event Architect Studio (`EventBrain`)** and its child cards + export brief. Calendar, List, Detail, and the Event Manager landing are clean.

---

## 4. Disposition per reference

| Ref | Disposition |
|-----|-------------|
| #2 PlanningSummary | **Honest empty state / explicit demo gating.** Show only in demo mode, or label clearly + drive from real event when linked. |
| #3 BarProgramme | **Same** — gate behind demo state or add an unmissable demo label. |
| #4 StaffNotifications | **Safe to leave** (already labeled). Optional: hide when a real event is linked. |
| #1 EventBrain fallback | **Safe to leave** (badged). Optional later: stop seeding real events with demo waiter names. |
| #5 ZoharPanel | **Safe to leave.** Optional cleanup: drop unused `TABLE_NOTES`/`ZONE_NOTES` imports and the dead `?? EVENT_BRIEF`. |
| #6 PrintableBrief | **Safe to leave short-term** (disclaimed). Later: suppress demo bar/staff sections when a real event is linked. |
| #7 adapter | **Safe to leave** (flagged fallback). |
| #8 EventBriefCard (dead) | **Move to `prototypes/` or remove** — only with a backup, not in this slice. |
| #9 SelectedTablePanel (dead) | **Move to `prototypes/` or remove** — only with a backup, not in this slice. |

---

## 5. Recommended smallest safe first fix slice

**Target the two unlabeled, production-visible, real-event-contaminating cards: PlanningSummary (#2) and BarProgramme (#3).**

These are the only references that present fictional figures as current event intelligence **with no disclaimer**, in a flow an operator reaches with a real event open. StaffNotifications already shows the correct pattern (a "Demo only" chip + footer) and is the template to copy.

Smallest honest fix, in priority order — pick the least invasive that the team accepts:

1. **Minimum (lowest risk):** Add the same "Demo only" labeling pattern from `StaffNotifications.jsx` to `PlanningSummary.jsx` and `BarProgramme.jsx`. Pure additive UI; no data-flow change. Removes the misrepresentation immediately.
2. **Better:** Have EventBrain pass `isEventLinked` into the bottom-section cards and render them only in demo mode (`!isEventLinked`), with an honest empty/placeholder ("Planning summary appears once event data is connected") when a real event is linked. Prevents demo numbers from ever sitting beside a real event.

Do **not** delete the demo module, the dead components, or any imports in this slice. Dead-code removal (#8/#9) and the demo-waiter-seed cleanup (#1) are separate, backup-gated slices.

---

## 6. Files likely touched in the next implementation slice

- `src/features/events/components/PlanningSummary.jsx` — add demo label (and optionally accept `isEventLinked` / real props).
- `src/features/events/components/BarProgramme.jsx` — add demo label (same).
- `src/features/events/EventBrain.jsx` — only if option 2 is chosen (pass `isEventLinked` into the bottom-section cards / gate rendering). Lines 652–657.

Reference (do not change in this slice): `src/features/events/components/StaffNotifications.jsx` (label pattern to copy).

---

## 7. What NOT to touch

- `src/features/events/data/eventBrainDemoData.js` — leave the module; it is correctly self-labeled and still needed for the legitimate demo/fallback state.
- `eventArchitectAdapter.js` — fallback is honest and flagged.
- `EventBriefCard.jsx` / `SelectedTablePanel.jsx` — dead, but removal is a separate backup-gated slice, not part of the trust fix.
- ZoharPanel intelligence sections — computed from real props; do not touch beyond optional unused-import cleanup.
- No auth/roles/DB/provider/persistence changes. No deletion of imports in this slice.

---

## 8. Verification trail

- `git status --short`: only untracked docs present (this audit doc + two unrelated architecture docs already present pre-audit). No tracked source files modified.
- No imports removed, no refactors, no staging, no commits.
- The only file created by this audit is this document.
