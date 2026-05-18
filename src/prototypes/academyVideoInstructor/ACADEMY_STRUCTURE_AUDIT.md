# Academy Video Instructor Prototype - Academy Structure Audit

Audit time: 2026-05-18 19:50 Asia/Jerusalem.

## Files inspected

- `src/App.jsx`
- `src/features/academy/Courses.jsx`
- `src/features/academy/LessonPlayer.jsx`
- `src/features/academy/KnowledgeLibrary.jsx`
- `src/features/academy/LearningProgress.jsx`
- `src/features/academy/WineKnowledge.jsx`
- `src/hooks/useStaffAcademyState.js`
- `src/utils/academy.js`
- `src/data/academy/universityManifest.js`
- `src/data/academy/universityExpansion.js`
- `src/data/courses.js`
- `server.js` academy route references were found but not modified.

## Where the Academy lives

The production HESTIA Academy feature lives under `src/features/academy/`.

The main Academy entry is `Courses.jsx`, which renders HESTIA University academy cards. The lesson experience is `LessonPlayer.jsx`. Progress views and companion knowledge screens are split into `LearningProgress.jsx`, `KnowledgeLibrary.jsx`, `SOPSheets.jsx`, `Simulation.jsx`, and `WineKnowledge.jsx`.

Application routing is not URL-router based. `src/App.jsx` imports `Courses` and `LessonPlayer` directly and renders them through the `PageRenderer` page map. The active lesson page key is `lessonPlayer`.

## Where lesson data lives

The real curriculum is defined in `src/data/academy/universityManifest.js` and expanded by `src/data/academy/universityExpansion.js`.

`universityManifest.js` exports `UNIVERSITY_MANIFEST`. It starts with `RAW_UNIVERSITY_MANIFEST`, appends `ADDITIONAL_UNIVERSITY_ACADEMIES`, and maps every academy through `flattenAcademy`.

## Lesson structure found

The local lesson factory accepts `id`, `title`, `duration`, `objective`, `doctrine`, `technical_depth`, `standards`, `taxonomy`, `terminology`, `operational_consequences`, `common_failures`, `amateur`, `pro`, `recovery_logic`, `professional_standard`, `real_service_context`, `practical_execution`, `guest_application`, `manager_notes`, `drill`, and `assessment_questions`.

The factory stores most teaching fields inside `content`. `flattenAcademy` then creates a flat `academy.lessons` array and spreads `item.content` onto each lesson, adding `moduleId` and `moduleTitle`.

There are no transcript-like fields in the current lesson model. Review questions exist as `assessment_questions`. There is no embedded video field, video provider field, or avatar field in the production lesson schema.

## Current Lesson Player rendering

`LessonPlayer.jsx` builds guided steps from real lesson fields with `buildSteps(lesson)`:

- Introduction: `objective`, `doctrine`
- Core Knowledge: `technical_depth`, `standards`
- Vocabulary: `terminology`, `taxonomy`
- What Goes Wrong: `common_failures`, `operational_consequences`, `amateur_vs_pro`
- Service Application: `practical_execution`, `guest_application`, `real_service_context`
- Recovery & Standards: `recovery_logic`, `professional_standard`
- Manager Notes: `manager_notes`
- Practice Prompt: `drill`, `assessment_questions`
- Recap: derived from `objective`, `professional_standard`, and `doctrine`

The player shows a lesson path sidebar, locked/open/complete states, step dots, instructor notes, lesson field cards, previous/next step controls, mark-complete behavior, and next lesson unlock behavior.

## Progress and navigation

`useStaffAcademyState.js` stores `academyProgress`, `selectedAcademyId`, and `selectedLessonId`.

It persists progress and selected lesson values in `localStorage` using keys from `src/config/systemConfig.js`. Opening a lesson sets selected academy and lesson, then calls `goToPage('lessonPlayer')`. Completing a lesson writes local progress and posts to `/api/staff-progress` when a user id exists.

`src/utils/academy.js` controls role visibility, completion keys, lesson unlock sequence, completed counts, and expanded-content detection.

## Real Academy topics found

- Bar Academy: ice systems, shaking, stirring, carbonation, acid/syrup balance, spirits, batching, garnish, station ergonomics, menu engineering/costing/responsible service.
- Wine Academy: tasting, structure, faults, service temperature, glassware, climate, grapes, sparkling/fortified wine, pairing, recommendation language.
- Service Academy: first 30 seconds, sequence of service, body language, table maintenance, guest reading, food knowledge, upselling, complaint recovery, VIP service, farewell rituals.
- Hostess Academy: first impression, reservations, seating, waitlists, walk-ins, phone etiquette, VIP recognition, handoffs, preference notes, host metrics.
- Manager Academy: pre-shift briefing, pressure mapping, recovery leadership, handoff logs, communication, labor control, coaching, P&L, approvals, escalation.
- Event Academy: BEOs, event types, banquet setup, synchronized service, buffet flow, staffing, wine scale, cocktail service at scale, client communication, breakdown.
- Coffee Program: origin, roast, grind/water/extraction, espresso, milk texture, coffee hospitality timing, workflow, brewing, sensory training, profitability.
- Culinary Intelligence: ingredients, cooking methods, allergens, flavor structure, menu fluency, FOH/BOH communication, pairing, waste, substitutions, recovery.
- Hospitality Ethics & Privacy: dignity, responsible alcohol, allergies, VIP privacy, de-escalation, boundaries, data privacy, inclusion, documentation, ethical recovery.
- Train-the-Trainer: selection, orientation, shadowing, microlearning, roleplay, pre-shift lineups, correction, readiness scoring, coaching logs, calibration.

## Selected prototype candidate

Selected source lesson: `service-001`, Service Academy, "First 30 Seconds And Kinetic Greeting Protocol".

Reason: The provided Synthesia demo transcript is about welcoming a guest, calm confidence, recognition, eye contact, and reading the guest. The closest real production lesson is `service-001`, whose objective is to create immediate trust, recognition, and service authority at first contact. The Bar Academy has real bar and cocktail lessons, but the current Bar Academy content is mostly technical craft, production, station flow, costing, and responsible service rather than the first guest welcome.

## Assumptions made

- The prototype may use a bar-facing video script while mapping to `service-001`, because the lesson theme is hospitality first contact and can later be adapted for a bar station context.
- The transcript is marked `prototypeTranscriptOnly` because the production lesson has structured content but no transcript field.
- The prototype stores provider metadata separately from lesson data to avoid forcing Synthesia into the production curriculum schema.

## Must confirm before production integration

- Whether video instructor metadata belongs on each lesson, in a separate provider map, or behind a lesson enhancement service.
- Whether watch state should feed the existing `academyProgress` completion model or a new video-specific progress object.
- Whether scripts should be generated from structured lesson fields, manually approved, or authored separately.
- Which provider adapters are approved for production and where trusted provider URL policies should live.
- Whether the video instructor appears inside the current `LessonPlayer` step flow, before it, or as an optional side panel.
