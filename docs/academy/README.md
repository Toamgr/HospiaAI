# HESTIA Academy — Planning Documents

This folder contains the official planning package for the HESTIA Service School redesign.

All documents are planning artifacts. No source files have been modified.

---

## Documents

### [HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md](./HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md)
**Curriculum and product decisions.** Defines the 5 flagship academies and 25 flagship lessons for HESTIA Service School. Includes full lesson detail sheets (purpose, scenario, drill, instructor, video status, source lessons). Covers progress preservation strategy, lesson archiving approach, and 10 open product questions that must be resolved before implementation.

### [HESTIA_ACADEMY_VIDEO_PRODUCTION_WORKFLOW.md](./HESTIA_ACADEMY_VIDEO_PRODUCTION_WORKFLOW.md)
**Video production process.** Defines the full lifecycle from lesson outline → narration script → production script → Synthesia submission → quality review → final video mapping. Includes the metadata shape for `academyInstructorVideoMap.js`, file structure for scripts, the honesty rule (no fake videos), and a production status table for all 25 flagship lessons.

### [HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md](./HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md)
**Visual and UX authority document.** Defines what HESTIA Service School must look and feel like — editorial principles extracted from MasterClass, 50 Best, Michelin, Monocle, and luxury hospitality brands, then translated into HESTIA's own language. Covers page structure, academy card design, lesson row design, typography, color, motion, and mobile behavior. Includes a self-critique section. Mandatory reference before any Phase 11 UI implementation.

### [HESTIA_COURSES_REDESIGN_IMPLEMENTATION_PLAN.md](./HESTIA_COURSES_REDESIGN_IMPLEMENTATION_PLAN.md)
**Safe implementation roadmap.** Defines six implementation phases (11B → 11G → 12), each independently committable and testable. Includes files likely to change, files to protect, risk register, hestia-check additions, commit strategy, and a list of decisions requiring product approval before implementation begins.

---

## Phase Summary

| Phase | Goal | Status |
|---|---|---|
| 11B | Shell/copy: rename Courses to HESTIA Service School | Not started |
| 11C | Academy card redesign — editorial Palette B treatment | Not started |
| 11D | 5×5 curriculum view — flagship lesson filter | Not started |
| 11E | Video production metadata — extend status lifecycle | Not started |
| 11F | LessonPlayer visual polish — typography and spacing | Not started |
| 11G | Cleanup dead/fake artifacts — safe archiving | Not started |
| 12 | Bar World Academy activation — wire bar-academy to Bar World | Deferred |

---

## Key Decisions Made

- HESTIA Courses becomes **HESTIA Service School**
- Bar Academy stays in **Bar World**. Wine Academy stays in **Wine Atlas**. Neither re-enters Courses.
- Five employee-facing academies: Service, Arrival & Host, Coffee, Culinary Intelligence, Ethics & Privacy
- Five flagship lessons per academy = 25 total flagship lessons
- Existing lesson IDs and progress keys are preserved — no migration required
- Video mode appears only for real `video_ready` lessons — no fakes, no placeholders
- All 10 original lessons per academy are preserved in data — hidden by UI filter, not deleted

## Key Decisions Pending

See [HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md](./HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md) Section 11 for the full list of 10 open product questions.

---

## Research Sources Used

- `docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_AUDIT.md`
- `docs/architecture/HESTIA_ACADEMY_INSTRUCTOR_IMPLEMENTATION_PACKAGE.md`
- `docs/design/HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`
- `docs/archive/prototypes/academy-video-instructor/ACADEMY_STRUCTURE_AUDIT.md`
- `src/data/academy/serviceDoctrine.js`
- `src/data/academy/hospitalityPhilosophy.js`
- `src/data/academy/coffeeDoctrine.js`
- `src/data/academy/culinaryDoctrine.js`
- `src/data/academy/ethicsDoctrine.js`
- `src/features/academy/data/academyInstructorVideoMap.js`
- `skills/user/hestia-ui-design/SKILL.md`

**Research not found in repo (should be attached before Phase 11C):**
- MasterClass UX/design formal analysis
- 50 Best / Michelin editorial design research
- Wine Atlas / WSET curriculum audit
