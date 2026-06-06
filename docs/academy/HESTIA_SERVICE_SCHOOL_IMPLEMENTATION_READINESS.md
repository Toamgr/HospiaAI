# HESTIA Service School — Implementation Readiness

**Status:** Planning Phase — Not Yet Implemented  
**Date:** 2026-06-06  
**Phase:** Pre-Phase 11B  
**Classification:** Phase Gate Document — Must Be Read Before Implementation Begins

---

## 1. Purpose

This document defines the readiness state of HESTIA Service School before any code is written. It specifies what is complete, what is not ready, what must be decided, and what must be read before each implementation phase.

---

## 2. What Is Ready

### Documentation is complete and internally consistent

| Document | Status |
|---|---|
| `docs/academy/HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md` | Complete — 25 flagship lessons defined, Gemini integration added |
| `docs/academy/HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md` | Complete — visual system, components, academy visual worlds defined |
| `docs/academy/HESTIA_ACADEMY_VIDEO_PRODUCTION_WORKFLOW.md` | Complete — lifecycle, quality review, status normalization rules |
| `docs/academy/HESTIA_SERVICE_SCHOOL_RESEARCH_SYNTHESIS.md` | Complete — Gemini report evaluated, accept/modify/reject documented |
| `docs/academy/HESTIA_ACADEMY_AGENT_PROMPT_PACK.md` | Complete — AI agent configuration defined |
| `docs/academy/research/GEMINI_ACADEMY_INTELLIGENCE_REPORT.md` | Ingested — research source in place |
| `skills/user/hestia-ui-design/SKILL.md` | Stable — HESTIA design system is authoritative |

### Architecture is defined and stable

- Five employee-facing Service School academies confirmed (no additions or removals)
- Twenty-five flagship lessons defined with real existing lesson IDs
- Instructor personas confirmed: Mira (Service / Ethics), Theo (Coffee), Daniel (Culinary), Noa (Host)
- Progress key format confirmed: `hospia.progress.{academyId}:{lessonId}` — must not change
- Video status lifecycle confirmed: `needs_script → script_ready → in_production → video_ready`
- Academy visual worlds defined per academy (Service, Host, Coffee, Culinary, Ethics, Bar Course)

### One real video confirmed

- SA-1 (`service-001`): `video_ready` with confirmed Synthesia embed — **verify content matches SA-1 lesson direction before using as flagship**

---

## 3. What Is NOT Ready

### Video production has not started

- 24 of 25 flagship lessons have no narration script
- No HESTIA-produced narration scripts exist in `docs/academy/scripts/`
- No Synthesia submissions are confirmed for Service School lessons
- Bar World videos (`bar-001`, `bar-002`) exist but are separate from Service School scope

### Interactive drill infrastructure does not exist

- Spatial seating puzzle, acoustic coordination drills, and calibration simulators from the Gemini report require custom interactive UI
- No interactive drill components have been designed, prototyped, or built
- All current drills are described as role-play, written exercise, or discussion — these are correct for MVP

### Phase 11B–11F implementation has not started

- Service School shell/copy redesign (Phase 11B): not started
- Premium academy card redesign (Phase 11C): not started
- 5-lesson view model (Phase 11D): not started
- Video production metadata (Phase 11E): not started
- LessonPlayer visual polish (Phase 11F): not started

### Instructor persona gaps

- Arrival & Host Academy instructor persona is unresolved (Noa is the Events persona — a dedicated Host persona may be needed)
- Culinary Intelligence instructor persona is unresolved (Daniel is Manager persona — a dedicated culinary voice may be needed)
- Hospitality Ethics instructor persona is unresolved (Mira is assigned by default — a dedicated neutral Ethics persona may serve better)

### Real hospitality photography does not exist

- Service School currently has no real photography
- Phase 11C implementation should not add stock photography placeholders
- A photography art direction brief should be written before Phase 11C begins (see design direction Section N, point 1)

---

## 4. What Must Be Decided Before Code

### Decision 1: Instructor Persona for Arrival & Host Academy

Noa is listed as the Events persona in design docs. Using Noa for Arrival & Host may create confusion in Phase 12+ when Event Operations is implemented. Options:
- A: Use Noa for Arrival & Host Academy as a temporary assignment
- B: Create a dedicated Host persona (name TBD) in Phase 11E
- **Decide before Phase 11E (video production metadata)**

### Decision 2: Culinary Intelligence Persona

Daniel is the Manager persona in existing design docs. Using Daniel for Culinary Intelligence implies a managerial register that may not suit FOH food education. Options:
- A: Use Daniel with a modified brief ("Executive Chef Liaison and FOH Food Educator")
- B: Create a dedicated Culinary persona
- **Decide before Phase 11E**

### Decision 3: Ethics & Privacy Persona

The Ethics academy has the most neutral, authoritative, human register of all five academies. Mira (Service) is a reasonable default but the emotional register is different. Options:
- A: Use Mira across Service and Ethics
- B: Create a dedicated Ethics persona
- **Decide before Phase 11E**

### Decision 4: Flagship Flagging Method

Two options for marking flagship lessons in the manifest:
- A: `flagship: true` field on individual lesson objects
- B: `featuredLessons: ['lesson-001', ...]` array on the academy object
- **Decide before Phase 11D (data change)**

### Decision 5: Full Curriculum Toggle Behavior in MVP

Should lessons 6–10 appear at all in the Phase 11D employee UI?
- A: Hidden completely until Phase 12+
- B: Accessible via a low-prominence "Full curriculum" expander in MVP
- **Decide with product before Phase 11D**

### Decision 6: Coffee-001 + Coffee-002 Merge ID

CP-4 (Origins, Roasts, and Guest Language) merges two existing lesson IDs. The merged lesson needs a canonical ID:
- A: Reuse `coffee-001` (primary source)
- B: Create an alias (`coffee-001-merged`)
- C: Display alias only — no data change, no manifest change
- **Decide before Phase 11D**

### Decision 7: Service School URL

If the Courses page is renamed to HESTIA Service School, does `/courses` become `/service-school` or remain `/courses`?
- **Decide before Phase 11B** to avoid navigation breakage

### Decision 8: SA-1 Video Content Verification

The `service-001` Synthesia video was produced under an earlier title. Before marking it as the SA-1 flagship video, a human must review the video and confirm it matches the SA-1 lesson direction.
- **Decide before SA-1 is shown as a video lesson in the UI**

---

## 5. Which Docs Must Be Read Before Phase 11B

Phase 11B is the Service School shell and copy refresh. Minimum required reading before writing any code:

1. **`docs/academy/HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md`** — Section 3 (Product Philosophy) and Section 7 (25 flagship lessons) define copy direction
2. **`docs/academy/HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md`** — Sections A, B, D, G — design thesis, layout, typography
3. **`skills/user/hestia-ui-design/SKILL.md`** — Full read — palette, typography, component patterns
4. **`CLAUDE.md`** — Architecture rules; confirms what cannot be touched

**Phase 11B do-not-touch list:** `universityManifest.js`, `universityExpansion.js`, LessonPlayer components, video map, progress hook, routes (if URL decision is "no change"), TTS logic.

---

## 6. Which Docs Must Be Read Before UI Implementation (Phase 11C)

Phase 11C is the premium academy card redesign. Minimum required reading before writing any component code:

1. **`docs/academy/HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md`** — Full document
2. **`skills/user/hestia-ui-design/SKILL.md`** — Full document
3. **`docs/academy/HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md`** — Section 7 (for lesson card content)
4. **`docs/academy/HESTIA_ACADEMY_VIDEO_PRODUCTION_WORKFLOW.md`** — Section 2 (video status) — confirms what Video tab conditions are

**Phase 11C do-not-touch list:** Manifest files, progress hook, LessonPlayer, video map, progress key format, Bar World, Wine Atlas.

---

## 7. Which Docs Must Be Read Before Video Implementation (Phase 11E)

Phase 11E is video production metadata. Minimum required reading before making any changes to `academyInstructorVideoMap.js`:

1. **`docs/academy/HESTIA_ACADEMY_VIDEO_PRODUCTION_WORKFLOW.md`** — Full document — every section
2. **`docs/academy/HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md`** — Section 7 lesson definitions (video concepts, estimated lengths)
3. **`docs/design/HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`** — Persona voice specs (if exists; check before writing scripts)
4. **`src/features/academy/data/academyInstructorVideoMap.js`** — Read current state before any update

---

## 8. Recommended Next Phases

### Phase 11A — Documentation Finalization (Complete as of 2026-06-06)
- All planning docs in place
- Gemini report ingested and synthesized
- Academy visual worlds defined
- Video normalization rules documented
- Agent prompt pack created

### Phase 11B — Service School Shell / Copy Refresh
**Prerequisite:** Decision 7 (URL) resolved  
**Target:** Rename visible copy to "HESTIA Service School". Update page title. No data or route changes.  
**Files likely to change:** Courses page component (string literals only)  
**Files to protect:** All manifest, hook, player, and route files

### Phase 11C — Premium Academy Card Redesign
**Prerequisite:** Phase 11B complete; Decision 8 (SA-1 video) resolved  
**Target:** Editorial academy cards matching design direction Section E  
**Files likely to change:** Academy card component, Courses hub layout  
**Files to protect:** Progress logic, manifest files, LessonPlayer

### Phase 11D — 5-Lesson View Model
**Prerequisite:** Phase 11C complete; Decisions 4 and 5 resolved  
**Target:** Flagship filter in academy view; optional full curriculum expander  
**Files likely to change:** Manifest (add `flagship` flag), academy lesson list component  
**Files to protect:** Progress hook, video map, LessonPlayer

### Phase 11E — Video Production Metadata + Persona Decisions
**Prerequisite:** Phase 11D complete; Decisions 1, 2, 3 resolved  
**Target:** Video status metadata correct in video map; Persona assignments confirmed  
**Files likely to change:** `academyInstructorVideoMap.js` (status fields only); lesson components (Video tab conditional)  
**Files to protect:** All video embed logic, TTS logic, progress tracking

### Phase 11F — LessonPlayer Visual Polish
**Prerequisite:** Phase 11E complete  
**Target:** Editorial polish on lesson player — typography, spacing, progress dots, instructor panel  
**Files likely to change:** LessonPlayer component and children  
**Files to protect:** TTS logic, script generation, progress key format, video embed logic

### Phase 12+ — Interactive Drill Infrastructure
**Not started; not planned for current phases**  
This is where Gemini's interactive drill concepts (floor grid puzzles, audio matchers, calibration sliders) would be implemented. Do not start until Phase 11 is complete.

---

## 9. What Should Be Committed Separately

When implementation begins, commits should be scoped as follows:

| Commit scope | Phase | Contents |
|---|---|---|
| `docs: ingest Gemini Academy Intelligence Report` | 11A | `docs/academy/research/` + 6 updated planning docs |
| `feat(academy): service school copy refresh` | 11B | String literal changes in Courses page only |
| `feat(academy): editorial card redesign` | 11C | Academy card component + hub layout |
| `feat(academy): 5-lesson flagship filter` | 11D | Manifest flag + lesson list filter |
| `feat(academy): video status metadata` | 11E | Video map status updates |
| `feat(academy): lesson player visual polish` | 11F | LessonPlayer visual changes only |

**Do not bundle documentation and code in the same commit.** Docs are planning artifacts. Code is implementation.

---

## 10. Do-Not-Build-Until Checklist

Before writing any implementation code for Service School, confirm:

- [ ] All eight decisions in Section 4 are resolved (or confirmed as post-Phase-11B)
- [ ] Phase gate document (this file) has been reviewed by the product owner
- [ ] Design direction has been reviewed and approved (not just read)
- [ ] Curriculum plan has been reviewed and approved
- [ ] No video mode will appear unless a real embed URL exists
- [ ] No fake progress statistics will appear
- [ ] No gamification elements are in the implementation plan
- [ ] Bar World and Wine Atlas are confirmed as untouched by Phase 11B–11F
- [ ] Progress key format (`hospia.progress.*`) is confirmed as unchanged
- [ ] npm run hestia:check passes before and after every phase
- [ ] npm run build passes before and after every phase

---

*This document is a planning artifact. It is a phase gate — no implementation begins without this document being reviewed. Update it as decisions are made.*
