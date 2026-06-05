# Academy Video Instructor Prototype

This is an isolated prototype for an AI video instructor layer for HESTIA Academy. It is intentionally not connected to production routes, navigation, Academy state, LessonPlayer, or lesson data.

## What this prototype does

- Renders a premium HESTIA Academy instructor-video screen.
- Uses a controlled iframe component with trusted embed URL validation.
- Maps the demo to a real Academy lesson: `service-001`, "First 30 Seconds And Kinetic Greeting Protocol".
- Shows transcript, original lesson topics, key takeaways, review questions, provider notes, and local-only lesson controls.
- Provides a placeholder for a future local browser-based talking avatar mode.

## What it does not do

- It does not modify the real Academy.
- It does not modify `LessonPlayer`.
- It does not add routes or navigation.
- It does not persist to the backend.
- It does not call Synthesia, HeyGen, D-ID, or any paid API.
- It does not add API keys or `.env` values.
- It does not render raw iframe HTML from lesson content.

## Relationship to the real Academy

The production Academy is rendered from `src/App.jsx` through the `PageRenderer` page map. Academy UI files live in `src/features/academy/`, and the lesson curriculum lives in `src/data/academy/`.

The production lesson data is structured around fields such as `objective`, `technical_depth`, `taxonomy`, `terminology`, `common_failures`, `practical_execution`, `guest_application`, `drill`, and `assessment_questions`. `LessonPlayer.jsx` turns those fields into guided steps.

This prototype keeps video instructor data separate so Claude Code can later decide whether to connect video metadata directly to lessons or through a provider/enrichment map.

## Real Academy files inspected

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
- `server.js`

## Selected real lesson

Selected lesson: `service-001`, Service Academy, "First 30 Seconds And Kinetic Greeting Protocol".

This lesson was selected because the Synthesia demo script focuses on welcoming guests, calm presence, recognition, eye contact, and trust at first contact. The Bar Academy exists and is rich, but its current lessons focus on cocktail technique, bar operations, costing, batching, station ergonomics, and responsible service. The closest real structure for the demo is therefore the first Service Academy lesson.

## Synthesia usage

The prototype uses this public Synthesia demo as an embedded provider reference:

- Public URL: `https://share.synthesia.io/05d5dfcf-ad20-498b-8607-4045f1ff180b`
- Embed URL: `https://share.synthesia.io/embeds/videos/05d5dfcf-ad20-498b-8607-4045f1ff180b`

Synthesia is treated only as a temporary prototype provider. The lesson data stores a trusted embed URL, not raw iframe HTML.

## Provider architecture

`instructorProviderTypes.js` defines provider modes: `embedded`, `uploaded-video`, `local-browser-avatar`, `synthesia-future-api`, `heygen-future-api`, `did-future-api`, and `none`.

Only `https://share.synthesia.io/embeds/videos/` is trusted for iframe rendering in this prototype. Future providers are placeholders only.

## How Claude Code can connect this later

1. Keep `AcademyEmbeddedVideoPlayer` or an equivalent safe embed component separate from lesson content.
2. Add a production video metadata map keyed by `academyId` and `lessonId`, or extend the lesson schema after approval.
3. Feed real lesson fields into transcript/script generation only after deciding the authoring and review workflow.
4. Add video state to the existing lesson progress model only if the product wants watched-state to affect unlock or completion.
5. Mount the instructor layer inside `LessonPlayer` as an optional section or side panel without changing existing lesson field rendering.

## Future integration plan

- Embedded video: allow approved providers through an allowlist and never render raw iframe HTML.
- Uploaded MP4: render through a controlled `<video>` component with approved file metadata.
- Local browser avatar: read real lesson data and speak through browser TTS or a local adapter.
- Future provider APIs: add Synthesia, HeyGen, or D-ID adapters behind a provider interface, with credentials handled outside lesson data.

## Safety notes

- No API keys.
- No `.env` changes.
- No paid API calls.
- No package changes.
- No raw HTML injection.
- No `dangerouslySetInnerHTML`.
- Trusted embed validation is required before rendering an iframe.
