# HESTIA Courses Redesign — Implementation Plan

**Status:** Planning Phase — No Implementation Yet  
**Date:** 2026-06-06  
**Phases covered:** 11B → 11G → 12  
**Classification:** Technical Implementation Authority Document

---

## Overview

This document defines the safe, phased implementation of the HESTIA Service School redesign. Each phase is scoped to be independently committable, independently testable, and independently reversible.

**Golden rule:** Every phase must leave the app in a shippable state. No phase should break existing functionality.

---

## Pre-Implementation Checklist

Before any phase begins:

- [ ] Design direction document reviewed and approved: `docs/academy/HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md`
- [ ] 5×5 curriculum plan reviewed and approved: `docs/academy/HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md`
- [ ] Open product questions resolved (see curriculum plan Section 11)
- [ ] Current `npm run hestia:check` passes
- [ ] Current `npm run build` passes
- [ ] Git working tree is clean before each phase begins

---

## Phase 11B — Courses Shell / Copy Refresh

**Goal:** Rename visible page copy to "HESTIA Service School." Remove bar/wine copy from employee-facing text. Touch nothing else.

**Scope:** Copy and string changes only. No routing. No data changes. No component restructuring.

### What changes

1. The page title visible to employees (heading, `<title>`, breadcrumb if any)
2. Any string literal "Courses," "HESTIA University," "University," or "LMS" in employee-facing UI
3. The short subtitle or description on the Courses hub page
4. Any nav label that says "Courses" that is visible to employees (update label text only — not the route key)

### What does NOT change

- Route path (e.g. `/courses` or `/employee/courses` — stays identical)
- `universityManifest.js` — not touched
- `universityExpansion.js` — not touched
- Academy card components — not redesigned yet
- Progress hook or localStorage keys
- `academyInstructorVideoMap.js`
- `LessonPlayer` and all sub-components
- `server.js`
- Bar World and Wine Atlas — untouched
- `courses.js` (COURSES array, SOP_SHEETS, SIMULATION_SCENARIOS) — not removed yet

### Files likely to change

| File | Change type |
|---|---|
| Courses hub page component | String replacement: "HESTIA Service School" heading |
| Navigation config or nav component | Label text only — route key unchanged |
| Any page `<title>` tag | String update |

### Files to protect (do not touch)

- `src/data/academy/universityManifest.js`
- `src/data/academy/universityExpansion.js`
- `src/data/courses.js`
- `src/features/academy/` — all lesson player components
- `src/hooks/` — all hooks
- `server.js`
- All routes

### Risks

| Risk | Mitigation |
|---|---|
| Nav label change breaks a route test | Only change the displayed label, not the route key or href |
| String search-replace hits unexpected places | Grep for "Courses" and "University" before changing; review each hit individually |

### Validation steps

1. `npm run hestia:check` — must pass
2. `npm run build` — must pass
3. Open the Courses page as an employee — heading reads "HESTIA Service School"
4. Navigate away and back — routing unchanged
5. Open a lesson — LessonPlayer unchanged
6. Check Bar World and Wine Atlas — visually unchanged
7. `git status` — only expected files changed

### hestia-check additions needed

None for this phase — it is string-only.

### Commit strategy

Single commit: `feat(courses): rename Courses shell to HESTIA Service School`

---

## Phase 11C — Premium Academy Card Redesign

**Goal:** Implement the editorial academy card design from the design direction document. Replace generic course list with the 5-academy card grid.

**Reference:** `HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md` — Sections D, E, H, G

**Scope:** Visual redesign of the Courses hub page and academy cards. No data or logic changes.

### What changes

1. **Hub page layout:** Hero section (masthead + headline + editorial statement), 5-academy card grid, "Continue Learning" section (conditional on real progress), Philosophy strip
2. **Academy card component:** New editorial card treatment matching Section E of design direction
3. **Typography:** Cormorant Garamond for academy names, Fraunces for card subtitles, Inter for body
4. **Progress display:** Replace any percentage bars with 5-dot row + "N of 5 lessons" count
5. **CTA buttons:** "Begin" (burgundy fill) / "Continue" (burgundy ghost) / "Review path" (muted ghost)

### What does NOT change

- Academy data source (reads from existing manifest — no manifest edits)
- Progress hook logic
- localStorage keys
- LessonPlayer
- Routing
- Bar World, Wine Atlas

### Files likely to change

| File | Change type |
|---|---|
| Courses hub page component | Major visual restructure — hero, grid, philosophy strip |
| Academy card component | Full visual redesign within existing component or new component alongside |
| Courses page CSS/styling | Palette B variables, editorial card styles |

### Implementation notes

- **Do not delete** the old card component immediately — rename it with a `_legacy` suffix until Phase 11C is confirmed stable
- Academy card reads from existing manifest data — no new data fetching
- "Continue Learning" section: query progress hook for `latestIncompleteLesson` — do not compute this inline in the component
- Progress dots: render 5 dots (always 5 for flagship view, regardless of total lesson count)
- The 5-academy grid shows these academies: `service-academy`, `hostess-academy`, `coffee-program`, `culinary-intelligence`, `ethics-privacy` — filter by academy ID, not by index

### Filtering bar-academy and wine-academy

The current employee Courses page should already filter these. Confirm this filter exists in the existing implementation. If not, add it in Phase 11C:

```javascript
const EMPLOYEE_ACADEMIES = [
  'service-academy',
  'hostess-academy',
  'coffee-program',
  'culinary-intelligence',
  'ethics-privacy',
];
```

This is a UI filter — the data for bar-academy and wine-academy still exists in the manifest.

### Palette B CSS variables (if not already present)

```css
--color-bg:           #F7F3EC;
--color-surface:      #FFFFFF;
--color-border:       #E0D8CC;
--color-border-em:    #C8BFB0;
--color-text-primary: #1A1612;
--color-text-sec:     #5A524A;
--color-text-ter:     #9A9088;
--color-burgundy:     #6B2737;
--color-amber:        #B8860B;
--color-amber-faint:  rgba(184, 134, 11, 0.10);
```

### Fonts (if not already loaded)

- Cormorant Garamond — weights 600, 700
- Fraunces — weights 500, 600
- Inter — weights 400, 500 (likely already present)

Confirm fonts are loaded in the app's font configuration before Phase 11C. Do not load redundant fonts.

### Risks

| Risk | Mitigation |
|---|---|
| Academy card redesign breaks lesson navigation | Keep card click-through logic identical; only visual wrapper changes |
| Progress dots show wrong count | Confirm progress hook returns per-academy progress before rendering dots |
| "Continue Learning" shows for users with no progress | Render section conditionally — `hasAnyProgress` guard |
| Font loading causes layout shift | Use `font-display: swap` and confirm fonts load before first paint |
| Filtering logic removes manager-only academies from employee view | Test with employee role — manager-academy, train-the-trainer must not appear |

### Validation steps

1. `npm run hestia:check` — must pass
2. `npm run build` — must pass
3. Open Courses page as employee — see 5 academy cards, editorial layout
4. Confirm bar-academy and wine-academy are not visible in employee view
5. Confirm progress dots reflect real data (test with and without existing progress)
6. "Continue Learning" section: appears only if real progress exists
7. CTA buttons: "Begin" for no progress, "Continue" for in-progress, "Review" for complete
8. Open a lesson from a card — LessonPlayer loads unchanged
9. Open Bar World — unchanged
10. Open Wine Atlas — unchanged
11. Mobile view: single-column cards, no overflow
12. `git status` — only expected files changed

### hestia-check additions needed

- Guard: employee-facing Courses page does not render `bar-academy` or `wine-academy`
- Guard: no percentage bar in Courses hub (search for `%` + progress-related class names)

### Commit strategy

Phase 11C may need 2–3 commits:
1. `feat(courses): implement Palette B hub layout and editorial hero`
2. `feat(courses): redesign academy cards with editorial treatment`
3. `feat(courses): implement progress dots and conditional Continue section`

Do not merge into one commit if any step is unstable.

---

## Phase 11D — 5×5 Curriculum View Model

**Goal:** Implement the flagship 5-lesson view per academy. Hide non-flagship lessons from default employee view. Preserve all progress.

**Reference:** `HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md` — Section 8 (progress preservation), Section 9 (flagship flagging)

**Scope:** Manifest data change (add `flagship` flag) + academy lesson list component (filter + new visual treatment).

### Step 1 — Add `flagship` flag to manifest

Open `src/data/academy/universityManifest.js` and `src/data/academy/universityExpansion.js`.

For each of the 5 Service School academies, add `flagship: true` to the 5 chosen lessons. All other lessons receive `flagship: false` (or simply omit the field — treat absence as `false`).

**Flagship lesson selections (from curriculum plan):**

```
service-academy:     service-001, service-003, service-005, service-008, service-010
hostess-academy:     host-001, host-003, host-004, host-007, host-008
coffee-program:      coffee-001, coffee-004, coffee-005, coffee-006, coffee-007
culinary-intelligence: culinary-001, culinary-003, culinary-004, culinary-005, culinary-006
ethics-privacy:      ethics-001, ethics-002, ethics-004, ethics-005, ethics-007
```

**Important:** Adding `flagship: true` to a lesson object must not break any existing lesson consumer that does not read this field. It is additive only.

### Step 2 — Implement flagship filter in academy lesson list

The academy page that lists lessons must:
1. Default to showing only `flagship === true` lessons
2. Sort them in the correct 5-lesson sequence
3. Provide a low-prominence "View full curriculum" expander that reveals all lessons

```javascript
// Flagship filter
const flagshipLessons = academy.lessons.filter(l => l.flagship === true);
const allLessons = academy.lessons;

const [showAll, setShowAll] = useState(false);
const visibleLessons = showAll ? allLessons : flagshipLessons;
```

### Step 3 — Implement the lesson row design

Each lesson row must match the design specification in `HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md` Section F.

Key requirements:
- Lesson number (1–5) in amber (Fraunces)
- Title (Fraunces, 1.05rem, weight 600)
- Short promise from lesson `objective` or a new `promise` field
- Format badge (VIDEO / VOICE / READING) — conditional on real video availability
- Lock/unlock/complete state from progress hook
- Row hover: `border-left: 3px solid #B8860B`

### What does NOT change in Phase 11D

- Lesson player routing — clicking a lesson opens the same LessonPlayer
- Progress keys — `hospia.progress.{academyId}:{lessonId}` unchanged
- All 10 lessons still exist in manifest (only display is filtered)
- Non-flagship lessons remain playable via the "View full curriculum" expander
- `academyInstructorVideoMap.js` — not changed yet

### Files likely to change

| File | Change type |
|---|---|
| `src/data/academy/universityManifest.js` | Add `flagship: true` to 25 lessons |
| `src/data/academy/universityExpansion.js` | Add `flagship: true` to expansion academy lessons |
| Academy lesson list component | Flagship filter, new lesson row design |

### Files to protect

- Progress hook — must not be modified
- LessonPlayer — must not be modified
- `academyInstructorVideoMap.js` — not modified here
- Routes — not changed

### Migration risk

Adding `flagship: true` to manifest objects is safe if:
- No component reads `lesson.flagship` as falsy and treats the absence differently
- The manifest is not validated against a strict schema that rejects unknown fields

**Pre-flight check:** Grep for all consumers of the lesson object before modifying the manifest.

```
grep -r "lesson\." src/ --include="*.js" --include="*.jsx"
```

Review each consumer — confirm none will break on an unexpected `flagship` field.

### Risks

| Risk | Mitigation |
|---|---|
| Adding `flagship` breaks a lesson consumer | Grep all lesson consumers before modifying manifest |
| Flagship filter hides a lesson that was in-progress | "View full curriculum" expander reveals it; progress is preserved in localStorage |
| Progress dots show 5 but total is actually 10 | Dots for flagship view always show 5; total progress count should be "N of 5 flagship lessons" not "N of 10 total" — confirm phrasing |
| coffee-001 (merged into CP-4) still shows in list | coffee-001 gets `flagship: false` — it remains in manifest but hidden in default view |

### Validation steps

1. `npm run hestia:check` — must pass
2. `npm run build` — must pass
3. Open each Service School academy — confirm exactly 5 lessons visible by default
4. Expand "View full curriculum" — confirm all 10 lessons appear
5. Complete a flagship lesson — progress key written correctly, dot updates
6. Complete a non-flagship lesson (via expander) — progress key written correctly
7. Return to hub — progress count reflects flagship lessons only in the card
8. `git status` — only expected files changed
9. Confirm Bar World, Wine Atlas, LessonPlayer unaffected

### hestia-check additions needed

- Guard: each Service School academy shows exactly 5 flagship lessons in default view
- Guard: no lesson ID was removed from the manifest (count should be 100 total)
- Guard: `flagship: true` appears exactly 25 times across all academy data files

### Commit strategy

1. `data(academy): add flagship flags to Service School 5x5 lessons`
2. `feat(courses): implement flagship lesson filter and lesson row redesign`

Commit 1 and Commit 2 separately — the data change and the UI change should be independently reviewable.

---

## Phase 11E — Video Production Metadata

**Goal:** Extend video status tracking to include the full lifecycle (`needs_script`, `script_ready`, `in_production`, `video_ready`). Confirm that Video mode only appears for `video_ready` lessons. Add internal production status indicators for the team (not visible to employees).

**Reference:** `HESTIA_ACADEMY_VIDEO_PRODUCTION_WORKFLOW.md`

### What changes

1. `academyInstructorVideoMap.js` — extend the status field to include `needs_script` and `script_ready` as valid values alongside existing `needs_video` and `video_ready`
2. LessonPlayer mode selector — confirm conditional: Video tab appears only when `status === 'video_ready'` and `embedUrl` is present and non-null
3. Optional: an internal admin/developer view that shows production status per lesson (not shown to employees)

### What does NOT change

- All existing `video_ready` lessons remain unchanged and functional
- TTS and Voice mode logic — not touched
- Employee-visible UI — Video mode still appears only for `video_ready` lessons
- Reading mode — still available for all lessons regardless of video status

### Resolving the `needs_video` → `needs_script` naming

The current `academyInstructorVideoMap.js` uses `needs_video` as the default status. The workflow document defines `needs_script` as the starting status.

**Decision:** Keep `needs_video` as a valid alias for backward compatibility. Internally, treat `needs_video` === `needs_script` in the status check logic. New entries should use `needs_script`. Document this in a comment in the map file.

### Files likely to change

| File | Change type |
|---|---|
| `src/features/academy/data/academyInstructorVideoMap.js` | Add new status entries; add `script_ready`, `in_production` values |
| LessonPlayer mode selector | Strengthen conditional for Video tab display |

### Files to protect

- All 3 existing `video_ready` lessons — must continue to work
- TTS/Voice logic — untouched
- Progress tracking — untouched

### Validation steps

1. `npm run hestia:check` — must pass
2. `npm run build` — must pass
3. Open `service-001` lesson — Video tab appears (existing video_ready)
4. Open `service-005` lesson — Video tab does NOT appear (needs_script)
5. Open `bar-001` lesson (Bar World) — Video tab appears (existing video_ready)
6. Voice mode works on a non-video lesson
7. Reading mode works on all lessons
8. `git status` — only video map and related files changed

### Commit strategy

Single commit: `feat(academy): extend video status lifecycle in academyInstructorVideoMap`

---

## Phase 11F — Lesson Player Visual Polish

**Goal:** Apply editorial visual polish to the LessonPlayer. Typography, spacing, progress dots, instructor panel. Do not modify any behavior.

**Reference:** `HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md` — Sections G, H, I  
**Reference:** `docs/design/HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md` — instructor panel design

**Scope:** Visual-only changes inside LessonPlayer and its children.

### What changes

1. **LessonPlayer layout** — apply article layout (max-width 680px, centered content column)
2. **Step content** — Inter body text, 1rem, line-height 1.8; section headers in Fraunces
3. **Progress dots** — replace any non-conforming progress UI with amber dot system
4. **Instructor panel** — apply design direction from `HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`
5. **Navigation buttons** — "Mark Complete & Continue" primary (burgundy fill), "Previous" ghost
6. **Typography** — confirm Cormorant Garamond for lesson title in player header

### What does NOT change

- TTS voice synthesis logic
- Script generation
- Progress key format
- Video embed logic
- Mode switching logic (Reading / Voice / Video)
- Lesson sequence / lock/unlock logic

### Anti-patterns to avoid in Phase 11F

- Do not change any function or state logic — this is CSS and layout only
- Do not add new state
- Do not add new data fetching
- Do not change button labels to anything other than what is spec'd in SKILL.md ("Mark Complete & Continue", "Previous" — never "Next")

### Files likely to change

| File | Change type |
|---|---|
| LessonPlayer component | Layout, typography, spacing — visual only |
| InstructorPanel / InstructorTalkingHead | Visual polish — sizing, font, persona color — no logic |
| Progress dots component | Amber dot style if not already applied |
| LessonPlayer CSS/styles | Editorial typography variables |

### Files to protect

- Any hook or service called by LessonPlayer
- `academyInstructorVideoMap.js`
- `academyInstructorScriptService.js`
- `academyInstructorPersonaResolver.js`
- `academyInstructorVideoProductionService.js`

### Validation steps

1. `npm run hestia:check` — must pass
2. `npm run build` — must pass
3. Complete a full lesson in Reading mode — all steps advance, completion registered
4. Complete a full lesson in Voice mode — TTS works, progress tracked
5. Open `service-001` in Video mode — video plays, progress tracked
6. Mark a lesson complete — progress key written to localStorage correctly
7. Return to academy view — progress dot updated
8. `git status` — only LessonPlayer-related files changed

### Commit strategy

1. `feat(lesson-player): apply editorial typography and layout`
2. `feat(lesson-player): apply amber progress dots and instructor panel polish`

---

## Phase 11G — Cleanup of Dead and Fake Artifacts

**Goal:** Remove or safely isolate legacy/unused code. Resolve the `LearningProgress.jsx` orphan. Decide `WineKnowledge.jsx` fate. Handle `KnowledgeLibrary` appropriately. Clean up the fake `COURSES` array if safe.

**Warning:** This phase carries the highest risk of accidental breakage. Each item must be investigated independently before action.

### Item 1 — The fake COURSES array in `src/data/courses.js`

**Current state:** `src/data/courses.js` exports `COURSES`, `SOP_SHEETS`, and `SIMULATION_SCENARIOS`.

**Before doing anything:**
1. Grep all consumers: `grep -r "courses" src/ --include="*.js" --include="*.jsx" -i`
2. Grep `SOP_SHEETS` consumers: `grep -r "SOP_SHEETS" src/`
3. Grep `SIMULATION_SCENARIOS` consumers: `grep -r "SIMULATION_SCENARIOS" src/`
4. Grep `COURSES` consumers: `grep -r "from.*courses" src/`

**Recommended action:**
- Do NOT delete `SOP_SHEETS` or `SIMULATION_SCENARIOS` until every consumer is confirmed safe or migrated
- The `COURSES` array with fake progress values may be removable if no component reads it
- If `COURSES` is read by any component still in use, flag for migration before removal
- Create a `courses.archived.js` backup before removing anything from `courses.js`

**Do not remove in Phase 11G** if any consumer is still active. Flag it as "pending removal" with a `// TODO(11G): remove after confirming no active consumers` comment.

### Item 2 — `LearningProgress.jsx` (orphaned)

**Current state:** Known to be orphaned per CLAUDE.md audit findings.

**Before doing anything:**
1. Confirm no import: `grep -r "LearningProgress" src/`
2. If no consumers: mark the file with a deletion comment, commit, then delete in a follow-up commit
3. If any consumer found: investigate before acting

**Safe removal sequence:**
1. Confirm zero consumers
2. Move file to `src/features/academy/_archive/LearningProgress.jsx` (preserve in archive before full deletion)
3. Commit: `refactor(academy): archive orphaned LearningProgress component`
4. After confirming no regressions: delete the archive copy

### Item 3 — `WineKnowledge.jsx` (stub)

**Current state:** Known to be a stub. Per CLAUDE.md: "should not be treated as the final Wine Academy."

**Options:**
A. Leave in place — it serves as a placeholder for Wine Atlas planning
B. Move to `_archive/` or `_stubs/`
C. Add a comment `// STUB — Wine Atlas redesign pending; see Wine Atlas planning docs`

**Recommended:** Option C — add comment, do not delete. Wine Atlas redesign is a separate initiative. Deleting the stub may break routing.

**Before acting:** Confirm `WineKnowledge.jsx` is referenced in routes or any nav config. If so, leave it in place with a comment.

### Item 4 — `KnowledgeLibrary`

**Current state:** Unknown — needs investigation before action.

1. `grep -r "KnowledgeLibrary" src/`
2. If referenced in routes: leave in place
3. If unreferenced: archive with same sequence as LearningProgress

### What must NOT happen in Phase 11G

- Do not delete `SOP_SHEETS` or `SIMULATION_SCENARIOS` without confirmed zero consumers
- Do not delete any lesson from the manifest
- Do not delete `WineKnowledge.jsx` if it is in a route
- Do not remove `bar-academy` data from the manifest — it is used by Bar World

### Files potentially affected

| File | Action |
|---|---|
| `src/data/courses.js` | Audit consumers; possibly add deprecated comment to COURSES array |
| `src/features/academy/LearningProgress.jsx` | Confirm orphaned; archive if confirmed |
| `src/features/wine/WineKnowledge.jsx` | Add stub comment; do not delete |
| `KnowledgeLibrary` (location TBD) | Audit; archive if confirmed orphaned |

### Validation steps

1. `npm run hestia:check` — must pass
2. `npm run build` — must pass
3. Navigate all active routes — none broken
4. Open Courses page — unchanged from Phase 11D/11E state
5. Open Wine Atlas / WineKnowledge — unchanged
6. `git status` — only expected files changed

### Commit strategy

One commit per item — do not batch removals:
1. `refactor(academy): archive orphaned LearningProgress component`
2. `refactor(courses): mark deprecated COURSES array pending removal`
3. `refactor(wine): add stub comment to WineKnowledge placeholder`

---

## Phase 12 — Bar World Academy Activation

**Goal:** Wire bar-academy lessons into the Bar World Academy tab. Reuse existing lesson/progress system. Do not create a parallel system.

**Status:** Deferred — do not implement until Phase 11B–11G are complete and stable.

**Scope planning (for future reference):**

1. Bar World already has an "Academy" tab structure
2. `bar-academy` exists in `universityManifest.js` with 10 lessons (bar-001 through bar-010)
3. Two lessons are already `video_ready` (bar-001, bar-002)
4. Progress keys for bar-academy lessons already exist if any employee has accessed them

**Key questions to resolve before Phase 12:**
- Does the Bar World Academy tab currently render the bar-academy lessons from the manifest?
- If not, what data source does it use?
- Is there risk of progress key collision if both Bar World and Courses could theoretically show the same lesson?
- Should bar-academy be flagged with `flagship: true` for the 5-lesson Bar World view, or does Bar World show all 10?

**Constraint:** Do not duplicate progress logic. The same `hospia.progress.bar-academy:bar-XXX` key format must be used whether a lesson is accessed from Bar World or from any legacy Courses path.

---

## Protected Files — Master List

The following files must not be modified in any phase without explicit product approval and a dedicated migration plan:

| File | Reason |
|---|---|
| `src/hooks/` — all hooks | Own all application state; any change requires full regression testing |
| Progress-related localStorage keys (`hospia.*`) | Renaming clears user data without migration |
| `src/data/academy/universityManifest.js` lesson IDs | Lesson ID changes invalidate all existing progress keys |
| `src/features/academy/services/academyInstructorScriptService.js` | TTS logic; do not modify in visual phases |
| `src/features/academy/instructor/InstructorTalkingHead.jsx` | TTS voice rendering; do not modify in visual phases |
| `academyInstructorVideoMap.js` video_ready entries | Removing or changing a real video URL breaks live video lessons |
| `server.js` | Backend — never touched in frontend phases |
| `.env` | Secrets — never touched in any phase |
| `package.json` | Dependencies — never touched without explicit need |
| `hestia-check.js` | Validation — only add new guards, never remove existing |

---

## Risks Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `flagship` flag breaks a manifest consumer | Low | Medium | Grep all consumers before modifying manifest; `flagship` is additive |
| Progress dots show wrong count if academy structure changes | Medium | Low | Always count flagship lessons independently from total |
| Font loading causes CLS (Cumulative Layout Shift) | Medium | Medium | Use `font-display: swap`; preload critical fonts |
| Bar-academy or wine-academy appear in employee Courses after Phase 11C | Low | High | Explicit ID filter in Phase 11C; add hestia-check guard |
| `LearningProgress.jsx` deletion breaks a route | Low | High | Grep all consumers before any deletion action |
| Phase 11F LessonPlayer changes break TTS | Medium | High | Do not touch any JavaScript logic — CSS/layout only in Phase 11F |
| `SOP_SHEETS` or `SIMULATION_SCENARIOS` deleted accidentally | Low | High | Do not touch `courses.js` until Phase 11G; confirm all consumers first |
| Video mode appears on `needs_script` lessons after Phase 11E | Low | High | Strengthen Video tab conditional; add hestia-check guard |
| `hospia.*` localStorage keys renamed accidentally | Very low | Critical | Never rename localStorage keys without a migration plan |

---

## hestia-check Additions by Phase

Add these guards to `hestia-check.js` progressively. Each addition should be its own commit within the relevant phase.

**Phase 11B:**
- `PASS: Courses hub heading contains "Service School"` — confirm rename visible

**Phase 11C:**
- `PASS: Employee Courses page does not render bar-academy`
- `PASS: Employee Courses page does not render wine-academy`
- `PASS: No percentage progress bar in Courses hub` (grep for aria-label="progress" or similar)

**Phase 11D:**
- `PASS: flagship: true appears exactly 25 times across academy data files`
- `PASS: Each Service School academy has exactly 5 flagship lessons`
- `PASS: Total lesson count in manifest is 100` (protect against accidental deletion)

**Phase 11E:**
- `PASS: Video mode only available when status === video_ready and embedUrl is present`
- `PASS: No lesson with status needs_script shows a Video tab in UI` (runtime test or static check)

**Phase 11G:**
- `PASS: LearningProgress component has zero active imports`
- `PASS: courses.js COURSES array has zero active imports` (if removed)

---

## Commit Checklist Per Phase

Before each phase commit:

- [ ] `npm run hestia:check` passes
- [ ] `npm run build` passes (no build errors, no TypeScript errors if applicable)
- [ ] All existing lessons still open and load correctly
- [ ] Progress tracking still writes to localStorage correctly
- [ ] Bar World unchanged
- [ ] Wine Atlas unchanged
- [ ] LessonPlayer unchanged (until Phase 11F)
- [ ] `git status` shows only expected files
- [ ] No `.env`, `secrets`, `server.js`, or `package.json` in the diff

---

## What Should Wait for Product Approval

The following decisions require explicit product sign-off before implementation begins:

1. **Flagship lesson selection** — the 25 lessons chosen in the curriculum plan must be reviewed by a hospitality professional, not just a developer
2. **"Full curriculum" expander** — should it exist in MVP, or should lessons 6–10 be invisible until a later phase?
3. **Instructor persona assignments** — Noa, Daniel, and the Ethics persona TBD in curriculum plan; resolve before Phase 11E
4. **coffee-001 + coffee-002 merge** — the CP-4 lesson merges two source lessons; decide ID strategy before Phase 11D
5. **event-academy fate** — not in Service School; confirm if it appears anywhere in employee routing
6. **Photography strategy** — before Phase 11C, decide: does the hero have a real photograph, or does it launch with pure typography?

---

*This document is a technical planning artifact. No source files were modified. All phases begin only after the relevant planning documents are approved and pre-implementation checks pass.*
