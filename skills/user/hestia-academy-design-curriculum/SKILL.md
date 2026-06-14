---
name: hestia-academy-design-curriculum
description: Design, structure, audit, and write HESTIA Academy volumes, topics, lessons, drills, assessments, instructor/video direction, and academy editorial worlds. Use when creating or reviewing any HESTIA Academy, Service School, Bar World Academy, Wine Academy, lesson curriculum, lesson player experience, instructor script, educational UI, or academy design system decision. Enforces HESTIA Academy as premium hospitality formation, not a generic LMS.
---

# HESTIA Academy Design And Curriculum

Use this skill whenever you design, write, structure, build, or review a HESTIA Academy volume.

HESTIA Academy is not an LMS. It is a professional formation environment for hospitality teams. It should feel like a Michelin-starred staff school, a private sommelier atlas, a bar journal, or a luxury hotel internal training room, depending on the world.

Every academy volume must teach real floor behavior. If a lesson cannot change what a staff member does during service, it does not belong.

## Required Context

Before academy UI work, also read:

- `skills/user/hestia-ui-design/SKILL.md`
- `skills/user/hestia-product-design-judgment/SKILL.md`
- `skills/user/hestia-hospitality-intelligence/SKILL.md`

When planning Service School or existing academy content, prefer these repo sources when present:

- `docs/academy/HESTIA_SERVICE_SCHOOL_5X5_CURRICULUM_PLAN.md`
- `docs/academy/HESTIA_SERVICE_SCHOOL_DESIGN_DIRECTION.md`
- `docs/academy/HESTIA_ACADEMY_VIDEO_PRODUCTION_WORKFLOW.md`
- `docs/design/HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`
- `docs/academy/HESTIA_SERVICE_SCHOOL_RESEARCH_SYNTHESIS.md`
- `docs/academy/research/GEMINI_ACADEMY_INTELLIGENCE_REPORT.md`

Use Wine Atlas and Classic Cocktails Magazine as internal visual benchmarks:

- `src/features/wine-atlas/`
- `src/features/magazine/`
- `src/features/employee/BarWorld.jsx`

## Academy Philosophy

HESTIA Academy teaches people who work the floor, the bar, the door, the pass, and the room.

Design for these outcomes:

- The learner feels treated like a professional.
- The lesson maps directly to a real service moment.
- The environment feels physical: room, atlas, journal, pass, bar, threshold, cellar, tasting room.
- The instructor feels like a named host, not a category label.
- The assessment tests judgment, timing, spatial behavior, recovery, and language under pressure.
- The learning produces operational memory: what should HESTIA remember, coach, or carry forward?

Never design for:

- Generic course grids.
- Corporate training portals.
- "Complete the module" LMS language.
- Childish progress bars, streaks, badges, points, confetti, leaderboards, or achievement theater.
- Basic multiple-choice checks as the main assessment.
- Repeated rectangle-card layouts with only text changed.
- SaaS dashboard density, KPI widgets, or colorful startup patterns.

## Volume Architecture

Every major academy volume uses a 5 x 5 structure:

- 5 topics.
- 5 lessons per topic.
- 25 lessons total.

Each topic must progress through the same five stages:

1. Foundation: the doctrine, language, and baseline standard.
2. Application: what the learner does in real service.
3. Judgment: how to choose under ambiguity.
4. Recovery / Pressure: what to do when service breaks or pressure rises.
5. Mastery: the composed professional standard and memory to carry forward.

Do not create sprawling 8, 10, or 20 lesson topic lists unless the user explicitly asks for an archive or extended curriculum. Employee-facing volumes should default to the 25-lesson canon.

## Topic Anatomy

Every topic needs:

- Topic title.
- Topic subtitle.
- Emotional promise.
- Physical environment or material metaphor.
- The five lesson titles in Foundation, Application, Judgment, Recovery / Pressure, Mastery order.
- The floor behavior the topic changes.
- The manager coaching theme.
- The operational memory theme.

Example topic progression:

- Foundation: "Front Door Authority"
- Application: "Seating The Room"
- Judgment: "VIP Recognition Without Labels"
- Recovery / Pressure: "The Honest Wait"
- Mastery: "The Invisible Handoff"

## Lesson Anatomy

Every lesson must include these fields:

- `title`
- `subtitle`
- `emotional_promise`
- `why_this_matters`
- `practical_outcome`
- `core_doctrine`
- `real_service_scenario`
- `physical_or_spatial_drill`
- `common_mistake_prevented`
- `manager_coaching_notes`
- `assessment_method`
- `memory_to_capture`
- `ideal_video_concept`
- `visual_ui_direction`

Write each field in hospitality-native language. Avoid abstract educational phrasing. A lesson is ready only when a manager can run the drill on the floor or in pre-shift.

### Field Standards

`emotional_promise` names what the learner will feel capable of doing.

`why_this_matters` connects the lesson to guest trust, ease, dignity, timing, service flow, or revenue honesty.

`practical_outcome` is observable behavior, not knowledge consumption.

`core_doctrine` is the professional principle the learner should remember under pressure.

`real_service_scenario` must describe a moment that actually happens in a restaurant, hotel, bar, event, or service operation.

`physical_or_spatial_drill` must involve movement, timing, room reading, handoff, language practice, table/guest simulation, station setup, tasting, calibration, or recovery roleplay.

`assessment_method` should prefer scenario response, roleplay, floor observation, sequencing, spatial allocation, tasting calibration, service language rewrite, or manager signoff. Use multiple-choice only as a secondary knowledge check.

`memory_to_capture` names what HESTIA should remember after the lesson or after the learner applies it: recurring mistakes, coaching needs, service strengths, guest handling insights, readiness signals, or drill outcomes.

`ideal_video_concept` gives production direction: lens, scene, movement, lighting, instructor posture, B-roll, macro detail, or floor reconstruction.

`visual_ui_direction` tells the builder what the learner sees and touches. It must reference the academy's world metaphor.

## Visual Language

Every academy world must have its own visual metaphor and physical environment.

Use these reference families as synthesis, not imitation:

- MasterClass: cinematic authority, instructor presence, quiet chrome.
- Monocle: adult editorial hierarchy, intelligent restraint.
- Kinfolk: warmth, silence, material calm.
- Louis Vuitton City Guides: place, folio, maps, type, travel intelligence.
- Aman: monastic restraint and atmosphere.
- Four Seasons: warmth, clarity, human welcome.
- World's 50 Best: editorial excellence without clutter.
- Premium magazines: covers, folios, issue logic, pull quotes, columns.
- Luxury hotel internal manuals: composed professionalism and standards.

Internal benchmarks:

- Wine Atlas: warm ivory/parchment, burgundy, amber, Cormorant Garamond, folios, maps, terroir, cinematic vineyard/cellar imagery, article spreads, tasting matrices.
- Classic Cocktails Magazine: scoped dark editorial shell, issue identity, mono kickers, Fraunces display, grain, hairline rules, reveal links, library/detail navigation, cocktail culture as publication.
- Bar World: in-world top navigation, dark shell, Bar Course as a world inside the bar context.

Visual worlds are not skins. They change materiality, image direction, lesson metaphors, drills, and UI primitives.

## Academy World Rules

For every new volume, define:

- World name.
- Palette relationship: Palette A, Palette B, or an approved room-specific accent inside HESTIA rules.
- Physical environment.
- Material anchors.
- Typography register.
- Image direction.
- Motion behavior.
- Primary interaction metaphor.
- What to avoid.

Examples:

- Wine Academy: atlas, cellar, map, tasting table, vineyard geography, structured tasting.
- Bar Course: bar journal, atelier, well, ice, brass, glassware, specs.
- Service Academy: dining room as choreography stage, tablecloths, porcelain, silver, quiet movement.
- Arrival & Host: threshold, ledger, floor plan, stone, door, room pacing.
- Coffee Program: espresso machine, grinder, crema, morning prep light.
- Culinary Intelligence: the pass as translation point, plate, kitchen-to-floor handoff.
- Hospitality Ethics & Privacy: quiet guardian, edge of room, dignity, discretion.

## Assessment Philosophy

Assessment in HESTIA Academy is proof of service judgment.

Prefer:

- Roleplay under time pressure.
- Branching recovery scenario.
- Spatial seating or station allocation.
- Silent video cue reading.
- Service language rewrite.
- Tasting or calibration comparison.
- Manager observed floor drill.
- Handoff simulation.
- Reflection that becomes coaching memory.

Avoid:

- Multiple-choice as the primary learning proof.
- Trivia.
- Abstract definitions without service application.
- Scores without coaching.
- "Correct / incorrect" feedback when the real skill is judgment.

Assessment copy should feel like coaching, not grading.

## Video And Instructor Direction

The instructor is the emotional center of the lesson.

Every lesson should have an ideal video concept even when no video exists yet. Do not mark video as ready unless a real, reviewed, playable embed URL exists in the video map.

Video direction should specify:

- Instructor persona and room.
- Opening shot.
- Core teaching scene.
- Service scenario reconstruction.
- Macro or spatial detail.
- Drill setup.
- Closing line.
- Estimated duration, usually 5 to 9 minutes.

Use HESTIA personas where established:

- Rafael for Bar Academy / Bar Course.
- Mira for Service Academy.
- Helene for Wine Academy.
- Theo for Coffee Academy.
- Daniel for Manager / Operations or some culinary contexts.
- Noa for Events / Arrival / Host when approved.

Do not invent celebrity instructors or real-person endorsements. Personas are data, not hard-coded UI strings.

## Interactive Drill Standards

Interactive drills must feel like hospitality practice, not games.

Good drill patterns:

- Floor map with arriving parties and server load.
- Bar station arrangement sequence.
- Pour angle or table clearing posture comparison.
- Audio cue recognition for coffee or dining room pressure.
- Guest language rewrite with banned generic adjectives removed.
- Recovery timeline choices.
- Wine tasting grid with evidence-based deduction.

Build custom interactive components only when the infrastructure exists and the user asks to implement them. Until then, document the drill as a practical roleplay, manager exercise, or future interactive spec. Do not ship placeholder sliders, fake meters, or toy simulations.

## Mobile-First Academy Behavior

Academy surfaces are often opened between prep, service, and shift handoff.

Mobile rules:

- One primary action per screen.
- Full-width lesson rows or editorial tiles.
- Touch targets at least 48px.
- No hover-only interactions.
- No horizontal overflow navigation.
- No tiny labels below readable size.
- Progress is shown as dots or "N of 5 lessons", never as a percentage bar.
- Video never auto-plays.
- Instructor, lesson title, drill, and continue action must be reachable without hunting.

If the learner has three minutes before service, they should know what to do within three seconds.

## Architecture Rules

Respect the HESTIA architecture.

- Do not modify `src/App.jsx` for feature logic.
- Hooks own state.
- Services own intelligence.
- Feature components own rendering.
- Do not rename `hospia.*` localStorage keys without a migration plan.
- Preserve lesson IDs because they map to progress.
- Bar Academy belongs in Bar World.
- Wine Academy belongs in Wine Atlas.
- Service School contains Service, Arrival & Host, Coffee, Culinary Intelligence, and Hospitality Ethics & Privacy.
- Event Operations and Manager/Shift Leadership are manager-only future paths unless explicitly approved.
- Do not wire fake data, fake video, fake progress, fake costs, fake menus, or fake operational records.

## How To Avoid Generic LMS Design

Reject a design if it contains:

- A generic card grid with identical rectangles.
- A dashboard header and metric widgets.
- Percentage progress bars.
- Course tiles that could belong to Udemy, Coursera, LinkedIn Learning, Notion, or an HR portal.
- Search/filter/sort controls as the main experience.
- "Start course", "complete module", "quiz passed", "earn badge", or "unlock achievement" language.
- Illustrations that look childish, isometric, flat SaaS, or gamified.
- Video placeholders, "coming soon" video tabs, or fake production states.

Replace with:

- A world-specific masthead or room entry.
- Editorial module covers.
- Folios, chapters, issue language, or physical-room navigation when appropriate.
- Dots and honest counts.
- Instructor-hosted lesson entrances.
- Drills connected to real service.
- Quiet progress and manager coaching.

## Volume Design Workflow

Follow this sequence:

1. Identify the academy world and the role using it.
2. Define the physical environment and visual metaphor.
3. Define the 5 topics.
4. Map each topic to Foundation, Application, Judgment, Recovery / Pressure, and Mastery.
5. Write all 25 lesson records using the required lesson anatomy.
6. Define the assessment pattern for each lesson.
7. Define the memory captured by each lesson.
8. Define video and instructor direction.
9. Define mobile behavior and the first screen.
10. Audit against HESTIA visual and product rules before code.

Do not start UI implementation until the world, curriculum, lesson anatomy, and assessment model are coherent.

## HESTIA Academy Audit

Use this audit before approving a new volume:

- Does it use exactly 5 topics and 25 lessons unless explicitly scoped otherwise?
- Does each topic progress Foundation, Application, Judgment, Recovery / Pressure, Mastery?
- Does every lesson have the required anatomy fields?
- Does every lesson connect to real floor behavior?
- Can a manager coach the drill without extra invention?
- Does the assessment test judgment or behavior, not trivia?
- Does the volume have a distinct physical environment?
- Does the UI feel like a HESTIA world rather than an LMS?
- Does it avoid fake progress, fake video, fake status, and fake metrics?
- Does it preserve Bar World, Wine Atlas, Service School, Event, and Manager ownership boundaries?
- Does it respect mobile use before or during service?
- Does it create useful operational memory?

If any answer is no, revise before building.

