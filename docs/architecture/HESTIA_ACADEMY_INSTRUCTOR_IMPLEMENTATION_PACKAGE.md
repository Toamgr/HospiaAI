# HESTIA Academy — AI Instructor Experience
## Implementation-Ready Work Package for Claude Code

**Companion to:** `docs/design/HESTIA_ACADEMY_INSTRUCTOR_DESIGN.md`
**Status:** Execution plan — audit-first, MVP-scoped, no code yet
**Owner:** Toam Griffel
**Date:** 2026-05-19
**Audience:** Claude Code (the implementer) and any human reviewing the plan before build kicks off.

---

## How to use this document

This package translates the design specification into a build plan. It is structured for a single Claude Code session that should run in this order:

1. **Read** sections 1–3 to internalize the strategy, MVP scope, and architecture.
2. **Run** the repo audit in section 4 and report findings before writing any code.
3. **Map** the current lesson data per section 5.
4. **Treat** section 6 (Narration Script Layer) as a non-negotiable contract.
5. **Follow** the implementation order in section 9, with the acceptance criteria in section 10 as the "done" line.
6. **Surface** every item in section 11 back to Toam before closing the session.

There are eleven sections. Each one stands alone but they compound — skipping ahead corrupts the build.

---

# 1. Product Strategy Review

A senior architect's read on the design spec.

## 1.1 What the design gets right (and must be protected)

**The persona-character system is the single largest leverage point.** Naming the instructor — Rafael, Mira, Hélène, Daniel, Noa, Theo — does more than "humanize an AI." It converts every fallback from a deficit into a hosting moment. "Voice with Rafael" is not lipstick on a TTS engine; it is a category change. The learner builds a relationship with a named mentor, and that relationship is what makes the room feel premium even when the underlying technology is a plain browser speech API.

**The seven design principles are operationally enforceable, not abstract.** Each one — hosted not delivered, calm over busy, one voice at a time, earnable trust, hospitality grammar, material honesty, future-readiness without compromise — produces a clear yes/no answer when a design or code question arises. That is what good principles look like.

**The brass underline on the active transcript sentence is the emotional center.** It is the visible thread between the instructor's voice and the learner's reading eye. It must work in all three modes (video, voice, reader). If this single detail does not render smoothly and synchronously, the entire experience falls apart. It is the make-or-break interaction.

**ReaderMode as a dignified, designed surface — not an error state — is a senior product decision.** Most products would have skipped this and shown "audio unavailable." HESTIA instead treats absence as an opportunity to host the learner with typography. This will pay back across every device, every meeting room, every staff member in a noisy kitchen.

**The honesty rules ("no fabrication, no provider error codes, no LMS language") align with HESTIA's broader DNA** — the same principles enforced in the Cocktail Lab costing layer (verified vs. benchmark) and the bar product foundation (market-reference candidates only). The Academy inherits and extends a coherent product ethic.

## 1.2 What makes this different from normal e-learning

| Generic e-learning pattern | HESTIA's choice |
|---|---|
| "Course → module → lesson → quiz" hierarchy | One screen, one room, one host, one moment |
| Robot avatar or stock instructor photo | Hand-drawn editorial portrait in a specific room |
| "Speak now" / "TTS" affordances | "Voice with Rafael" — the technology is invisible |
| Progress percentage, completion ring, XP | A 2px brass thread under the stage. No number. |
| Multiple-choice quiz with score | Reflective prompts with a quiet brass tick |
| Auto-play next lesson at end | Lesson ends on the persona's closing phrase. Silence. |
| Native iframe / native video controls | HESTIA stage frame. Provider branding hidden. |
| Bouncing equalizer when audio plays | Single ambient ink waveform that breathes |
| "Loading..." text on every state | Every state has a designed, voiced moment |

The product is hosted-by-a-named-person, not delivered-by-a-platform. That is the entire difference.

## 1.3 What could make the experience feel cheap, robotic, or generic

These are the failure modes a builder must actively avoid. Each one is recoverable individually but compounds catastrophically.

1. **The TTS voice sounds robotic on the target devices.** Mitigation: voice candidate lists per persona, per-OS, audited on real staff phones before launch. If iOS Safari delivers a usable Hebrew or English voice for Rafael, ship it. If not, ship Bar Academy in ReaderMode with dignity, not in a flat synthetic voice.
2. **The iframe leaks provider chrome.** Synthesia logos, share buttons, end-screen suggestions, or native video controls visible at any point will collapse the spell. The stage frame must own the surface fully.
3. **The brass underline animates jerkily.** A janky underline reads as "broken animation," not "premium feature." Use CSS transforms, not width animation, to avoid layout thrash.
4. **The portrait is an "AI avatar" stock image.** A generic stock illustration of a smiling bartender will sink the entire experience. If hand-drawn portraits aren't yet commissioned, ship a high-quality silhouette per persona before shipping a generic face.
5. **Copy slides into LMS language.** "Start course," "Complete module," "Submit quiz," "Earn points" anywhere in the UI is an immediate failure of P5 (Hospitality grammar). Brand review every string.
6. **An error message shows a stack trace or provider code.** Every failure mode must have a voiced fallback line in the persona's words. There is no "default" error in this surface.
7. **Auto-play kicks in.** Auto-starting the next lesson is binge-content grammar, not hospitality grammar. Each lesson is a moment.
8. **The transcript becomes a hidden accessibility-only feature.** It must be co-equal with the stage. If the transcript panel is hidden on desktop or feels like an afterthought, the calm-reading half of the experience is lost.

## 1.4 The emotional center

The portrait + the active sentence + the voice form a single triangle. The brass underline on the active sentence is the visible side of that triangle. If a builder is forced to cut something to ship, cut anything except this triangle.

Concretely: a working portrait + a working voice (or video) + a working transcript with active-sentence highlighting is a complete first vertical slice. Without any one of those three, the experience fails its core promise.

## 1.5 Why the persona system matters

A persona converts repeated lessons into a relationship. Rafael becomes a person Toam's staff know. After three Bar lessons, the team member opens lesson four expecting Rafael, not a feature. That continuity is what makes the Academy feel like a place rather than a feature.

It also makes voice mode commercially viable today. Without a persona, "TTS lesson" is a fallback experience. With a persona, "Voice with Rafael" is a complete experience that can ship before any professional video is recorded — and persist as a valid mode even after every lesson has video, because some learners will prefer voice in their environment.

## 1.6 Honest assessment — what is too ambitious for the first build

The design spec, taken as a whole, is a 9–12 month vision. The first build cannot be everything. The following are too ambitious for MVP and must be cut explicitly to protect the polish of what does ship:

- **Six fully produced personas with bespoke portraits and per-OS voice candidate lists.** Ship one (Bar / Rafael) fully realized for MVP. Add others persona-by-persona.
- **All 16 screen states (S0–S15) polished.** MVP must implement S0, S1, S2, S3, S5, S6, S8, S10 to a finished level. S4, S9, S11–S15 can ship with simpler designed states and be deepened in follow-up.
- **Sentence-level timing synchronized to TTS audio events.** Browser TTS does not reliably emit sentence-boundary events on all targets. MVP should estimate timing from character count and adjust on actual `boundary` events when available. Perfect frame-accurate sync is a future polish task.
- **The full mode switcher with provider auto-fallback chains.** MVP should support exactly two modes per lesson (voice xor video) and ReaderMode as deep fallback. The visible mode switcher (§7.8 in design) can be hidden in MVP if no lesson has both modes available.
- **Hand-drawn portraits for all six personas.** Out of scope for MVP. Commission Rafael only.
- **Telemetry events.** Defer. The instrumentation is valuable but not on the critical path for proving the experience.

This is not pessimism; it is the discipline that lets the first thing shipped be excellent.

---

# 2. MVP Scope — First Vertical Slice

## 2.1 What the MVP is

**One academy. One persona. One lesson screen. Two playback paths. Three honesty rails.**

- **Academy:** Bar Academy.
- **Persona:** Rafael.
- **Lesson screen:** the full `AcademyLessonScreen` per the design spec, scoped to Bar.
- **Playback paths:**
  - Video path (proves the VideoStage frame, control bar, transcript sync on a real video) — uses whatever single video-capable lesson exists in the current repo. If `service-001` exists with a Synthesia embed, we use it even though it's a Service lesson — but we render it under Bar Academy's stage motif for MVP only if a Bar video exists; otherwise we use it as-is and document the cross-academy MVP setup.
  - Voice path (proves the PortraitStage, TTS, narration script layer, ReaderMode fallback) — uses one Bar lesson with structured fields suitable for narration.
- **Honesty rails:**
  - No fabricated transcript, takeaways, or review questions.
  - No provider branding visible to the learner.
  - No e-learning language anywhere in the UI.

## 2.2 What MVP includes (in order of priority)

| # | Item | Why this is in MVP |
|---|---|---|
| 1 | `AcademyLessonScreen` component, mounted at a route that can be reached from the existing Academy navigation | The screen must exist before any panel can be tested |
| 2 | `LessonHeader` with academy badge, lesson title, and persona greeting line | The first instructor presence must precede the stage |
| 3 | `StageFrame` (shared between VideoStage and PortraitStage) | The brand-defining visual container |
| 4 | `VideoStage` rendering the existing video-capable lesson with native controls hidden | Proves the iframe-ownership rules |
| 5 | `PortraitStage` rendering Rafael's portrait with the breathing animation and ambient waveform line | Proves the voice mode feels premium |
| 6 | `LessonControlBar` with play, pause, restart, back | Minimum viable controls |
| 7 | `TranscriptPanel` with past/active/upcoming sentence styling and the brass underline on active | The emotional center |
| 8 | `useAcademyInstructorSession` hook owning playback state | Architecture compliance |
| 9 | `academyInstructorService` resolving mode, sentences, takeaways | Architecture compliance |
| 10 | `instructorVoiceProvider` wrapping `window.speechSynthesis` for Rafael's voice profile | Voice path |
| 11 | `instructorVideoProvider` wrapping the existing video element / Synthesia iframe | Video path |
| 12 | `instructorNarrationScriptService` building Rafael's spoken narration from structured fields (see §6) | Honesty rail |
| 13 | `KeyTakeawaysPanel` rendering up to 5 takeaways from structured fields only | Honesty rail |
| 14 | `ReviewQuestionsPanel` rendering up to 4 questions as reflective prompts | Honesty rail |
| 15 | `ProgressIndicator` as the 2px brass thread under the stage | Calm progress signaling |
| 16 | ReaderMode fallback when neither voice nor video can run | Dignified deep fallback |
| 17 | `prefers-reduced-motion` support — static portrait, no waveform animation, instant fades | Accessibility floor |
| 18 | Resume point persistence keyed by `hospia.academy.instructor.{lessonId}.lastSentenceIndex` | Real learner ergonomics |
| 19 | Rafael persona record in `src/domain/academy/personas/barRafael.js` | The data behind the character |
| 20 | Bar Academy stage backdrop motif token (one academy only in MVP) | Visual identity |

## 2.3 What MVP excludes (explicitly)

These must not appear in the MVP build, not even partially. Half-built features pollute the experience.

- Two-way conversation with the instructor.
- AI-generated lesson content (the narration script is a transform of existing fields, not a generator of new claims — see §6).
- Five of the six personas. **Only Bar / Rafael ships in MVP.**
- Custom voice cloning.
- Paid avatar providers (HeyGen, D-ID) as required dependencies.
- Multi-language transcripts or narration.
- Certificates, badges, XP, streaks, completion percentages, any LMS chrome.
- Telemetry events. Code can be instrumented later; first build is silent.
- Native mobile gestures beyond tap.
- Scrubbable timeline.
- End-of-lesson "next lesson" suggestion.
- In-lesson notes or highlighting.
- The mode-switch confirm flow when both modes exist for a single lesson — MVP lessons have only one mode each.
- The full S4 (buffering), S9 (connection lost), S11 (restart confirm), S12 (step-away confirm), S13–S15 (visit-state variants) polished states. MVP ships simpler equivalents that meet the honesty rails but can be polished later.
- Broad redesign of the Academy catalog, navigation, or other lesson surfaces.

## 2.4 Definition of done for MVP

The MVP is done when **all** of the following are true. This is the checklist the build must pass before being called complete.

1. **Bar Academy entry exists.** A learner can navigate from the existing Academy navigation to a Bar Academy lesson and reach the new instructor screen.
2. **Rafael greets first.** The lesson header shows the academy badge, lesson title, and Rafael's greeting line before the stage finishes loading.
3. **The video path works.** Opening the chosen video-capable lesson plays it inside the HESTIA stage frame with no visible iframe chrome, no provider logo, no native video controls. HESTIA's control bar drives playback.
4. **The voice path works.** Opening a voice-only Bar lesson plays Rafael's narration with the breathing portrait, the ambient waveform line, the active sentence caption, and the transcript scrolling with brass-underlined active sentence.
5. **The transcript active sentence brass underline animates smoothly** across the speech duration of that sentence. No jank, no layout thrash.
6. **Pause, resume, restart, and back behave as specified**, with at minimum a simple confirm on restart and back when playback is in progress (full step-away copy can be MVP-light).
7. **Key Takeaways render only from structured fields** (objective, practical_execution, guest_application, drill) — never invented. If fewer than 3 are available, the empty case shows Rafael's voiced empty line.
8. **Review Questions render as reflective prompts** from `assessment_questions`. No scoring chrome. If empty, Rafael's voiced empty prompt shows.
9. **ReaderMode triggers correctly** when `window.speechSynthesis` is unavailable, when no voice can match Rafael's profile, and when the video provider fails. The reader-mode surface is dignified — the lesson is laid out as a typographic document with Rafael's "Reading with Rafael today" caption.
10. **Reduced motion is honored.** A user with `prefers-reduced-motion: reduce` sees a still portrait, a static waveform line, no fades, and a static brass highlight on the active sentence.
11. **Resume works.** Closing the screen and returning resumes at the last completed sentence boundary, not at zero.
12. **Architecture rules are honored.** No state in `App.jsx`. All state in `useAcademyInstructorSession`. All intelligence in services. Components are stateless except for local input.
13. **No copy in the build uses forbidden language** ("TTS," "AI voice," "module," "complete," "XP," "earn," exclamation marks, emoji).
14. **No code path fabricates content** — no transcript invention, no takeaway invention, no review-question invention.
15. **Existing Academy lessons still work.** Anything not on the new instructor route renders exactly as it did before MVP.

---

# 3. Architecture Plan

## 3.1 Folder map

```
src/
├── App.jsx                                  ← UNTOUCHED in MVP
├── design/
│   └── tokens.js                            ← may extend if tokens exist; else create
├── domain/
│   └── academy/
│       └── personas/
│           ├── index.js                     ← persona registry (only Rafael in MVP)
│           └── barRafael.js                 ← persona record
├── features/
│   └── academy/
│       └── instructor/
│           ├── AcademyLessonScreen.jsx
│           ├── LessonHeader.jsx
│           ├── InstructorStage.jsx          ← thin router between Video/Portrait
│           ├── StageFrame.jsx               ← shared frame, brand-defining
│           ├── VideoStage.jsx
│           ├── PortraitStage.jsx
│           ├── AmbientWaveformLine.jsx
│           ├── SpokenCaption.jsx
│           ├── LessonControlBar.jsx
│           ├── TranscriptPanel.jsx
│           ├── TranscriptSentence.jsx
│           ├── KeyTakeawaysPanel.jsx
│           ├── ReviewQuestionsPanel.jsx
│           ├── ProgressIndicator.jsx
│           ├── ModeSwitcher.jsx             ← hidden in MVP, scaffolded for future
│           └── ReaderMode.jsx               ← deep fallback surface
├── hooks/
│   └── useAcademyInstructorSession.js
└── services/
    ├── academyInstructorService.js
    ├── instructorVoiceProvider.js
    ├── instructorVideoProvider.js
    └── instructorNarrationScriptService.js
```

## 3.2 Files to create (and what each owns)

| File | Responsibility | Stateless? |
|---|---|---|
| `AcademyLessonScreen.jsx` | Top-level composition, wires hook + components | Yes |
| `LessonHeader.jsx` | Renders back, academy badge, title, greeting | Yes |
| `InstructorStage.jsx` | Chooses VideoStage vs PortraitStage based on resolved mode | Yes |
| `StageFrame.jsx` | The shared frame (border, brass glow, corners). No content. | Yes |
| `VideoStage.jsx` | Mounts the video provider inside StageFrame | Yes |
| `PortraitStage.jsx` | Renders portrait, waveform, caption | Yes |
| `AmbientWaveformLine.jsx` | The single horizontal ink stroke that breathes with voice | Yes |
| `SpokenCaption.jsx` | The current sentence as a typographic moment over the stage | Yes |
| `LessonControlBar.jsx` | Play / pause / restart / back / mode switch | Yes |
| `TranscriptPanel.jsx` | Lays out all transcript sentences and handles scroll-to-active | Yes |
| `TranscriptSentence.jsx` | Single sentence with state-driven styling | Yes |
| `KeyTakeawaysPanel.jsx` | Renders up to 5 takeaways from props | Yes |
| `ReviewQuestionsPanel.jsx` | Renders reflective prompts; local input state allowed | Local only |
| `ProgressIndicator.jsx` | The 2px brass thread | Yes |
| `ModeSwitcher.jsx` | The mode disclosure (hidden in MVP but built) | Yes |
| `ReaderMode.jsx` | The dignified document fallback | Yes |
| `useAcademyInstructorSession.js` | Owns playback state, mode, current sentence, persistence | — |
| `academyInstructorService.js` | Mode resolution, sentence timing, takeaway selection, review prompt mapping | — |
| `instructorVoiceProvider.js` | Wraps `speechSynthesis` behind speakSentence/pause/resume/cancel | — |
| `instructorVideoProvider.js` | Wraps iframe/`<video>` behind mount/play/pause/destroy | — |
| `instructorNarrationScriptService.js` | Builds the segment array from lesson structured fields + persona record | — |
| `barRafael.js` | Persona record (data only) | — |
| `personas/index.js` | Registry that returns persona by id | — |

## 3.3 Files that may need to be touched

Claude Code must audit before touching any of these. Touch only if the audit confirms it is needed.

- **Existing Academy navigation/router.** A new route or entry point is needed to reach `AcademyLessonScreen`. The minimal touch: add one route. Do not refactor the broader navigation.
- **Existing Academy lesson list/catalog component.** Possibly add a small visual signal that a lesson is hosted (e.g., "Voice with Rafael · 4 minutes"). If touching this file risks broad changes, defer the catalog signal to a follow-up and ship the instructor screen reachable from a single test entry point.
- **Existing design token file (if one exists).** Extend with the brass / academy / motion tokens proposed in the design spec. If no token system exists, create `src/design/tokens.js` fresh.
- **Existing lesson data file/loader.** If lesson records do not currently expose `persona_id` or the structured fields the narration layer needs, do not mutate the data file — the narration service must read what exists and degrade gracefully when fields are absent.

## 3.4 Files that must NOT be touched

- `App.jsx` — composition only, per CLAUDE.md.
- Any hook outside the academy instructor scope.
- `shiftBrainService.js` and Shift Brain components.
- The hospitality ontology layer (`src/domain/hospitality/`).
- The bar product foundation (`src/domain/hospitality/bar/`).
- Any Cocktail Lab files (`cocktailLabPricingAdapter.js`, `CocktailLabStudio.jsx`, `CocktailBuildExperience.jsx`, `cocktailBuildExperienceUtils.js`).
- `hospia.*` localStorage keys outside the new instructor keys.
- The `X-HOSPIA-Role` header.

## 3.5 State ownership rules (mandatory, from CLAUDE.md)

- All playback state lives in `useAcademyInstructorSession`.
- The hook accepts injected callbacks (e.g., from the existing Academy completion handler) — it does not import other hooks.
- All deterministic intelligence lives in `academyInstructorService.js`.
- All AI/provider calls live in the provider services. The hook orchestrates; it does not call providers directly outside the provider interface.
- Components receive props and call back through callbacks. No `useState` for anything beyond local input (review question reflection text).
- No `useEffect` in `App.jsx`. No feature UI in `App.jsx`.

## 3.6 How the feature connects to the existing Academy

Minimal contact surface. The new instructor screen receives a `lessonId` (and optionally `personaId` if the lesson record does not yet carry one). All other data is loaded via the hook, which calls the academy instructor service, which reads the existing lesson record and the persona registry.

Returning from the screen calls back to the existing Academy navigation. No completion event firing in MVP — completion can wire later when the existing Academy completion handler is audited.

---

# 4. Current Repo Audit Instructions

Claude Code must perform this audit and report findings **before** writing any code. The audit answers the questions necessary to ship the MVP without breaking what exists.

## 4.1 Audit checklist

Each item must produce a written finding: `present`, `absent`, `present-but-different`, or `unclear — needs Toam`. Where possible, paste the relevant file path and 1–2 lines of evidence.

### Routing & navigation
- [ ] Is there an existing Academy route in the app? Path? Component file?
- [ ] How is a learner currently moved from the Academy catalog to a lesson? (Router? State? Direct render?)
- [ ] What is the minimum-touch way to add a new entry point for the new instructor screen?

### Existing lesson player
- [ ] Does an existing `LessonScreen` / `LessonPlayer` / `AcademyLessonView` component already exist? Where?
- [ ] If yes — what does it render today? What state does it own? What hooks does it use?
- [ ] Is it safe to leave it untouched and add the new instructor screen alongside it for MVP?

### Lesson data shape
- [ ] Where are lesson records stored? (Static file, fixtures, fetched, generated?)
- [ ] What is the **actual** shape of a lesson record today? Paste a real example.
- [ ] Does any lesson have a `persona_id` field today? If not, how should MVP attach Rafael to the chosen Bar lesson?
- [ ] Does any lesson have a video source field? What is it called? What provider?

### Specifically: `service-001`
- [ ] Does `service-001` exist as a lesson ID in the current data? File path?
- [ ] Does it have a Synthesia (or any video) embed configured? Source URL or embed code?
- [ ] If yes — under which academy is it currently filed?
- [ ] If `service-001` does not exist or has no video, identify the single most video-capable lesson in the repo to serve MVP's video path.

### Structured lesson fields
For each of these fields, report whether **any** lesson currently has it populated, and provide a real example value (or 1–2 lines) so the narration layer can be calibrated against real data, not hypotheticals:
- [ ] `objective`
- [ ] `technical_depth`
- [ ] `taxonomy`
- [ ] `terminology`
- [ ] `common_failures`
- [ ] `practical_execution`
- [ ] `guest_application`
- [ ] `drill`
- [ ] `assessment_questions`

### Lessons suitable for MVP
- [ ] Identify **one** Bar Academy lesson whose structured fields are rich enough to host Rafael's voice narration. Paste the lesson ID and a summary of its fields.
- [ ] If no Bar lesson is rich enough, identify the single richest lesson in the repo and report which academy it belongs to — Toam will decide whether MVP shifts to that academy.

### Styling & tokens
- [ ] Is there a design token file or theme system today? Path?
- [ ] What color, typography, and spacing primitives already exist? Paste a sample.
- [ ] Is CSS-in-JS, Tailwind, or vanilla CSS in use?
- [ ] If a token system exists, the MVP must extend it. If not, create `src/design/tokens.js` per the architecture plan.

### LocalStorage conventions
- [ ] Confirm `hospia.*` prefix is used for all current localStorage keys.
- [ ] Are there existing `hospia.academy.*` keys? List them.
- [ ] Confirm the MVP keys (`hospia.academy.instructor.{lessonId}.lastSentenceIndex`, `hospia.academy.instructor.{lessonId}.reflected.{questionId}`, `hospia.academy.instructor.preferredMode`) do not collide.

### Component & hook patterns
- [ ] List the hooks in `src/hooks/` and their responsibilities (one line each). This confirms the Phase 2 architecture from CLAUDE.md.
- [ ] List the feature folders in `src/features/`.
- [ ] Confirm `App.jsx` is composition-only (per CLAUDE.md) — paste the imports section.

### Reduced-motion
- [ ] Is `prefers-reduced-motion` already handled anywhere in the app? If yes, what pattern?

### Browser speech synthesis
- [ ] Is `window.speechSynthesis` already used anywhere in the app? If yes, list files.

## 4.2 Audit output format

Claude Code must produce the audit as a single markdown report titled `HESTIA_ACADEMY_INSTRUCTOR_AUDIT.md` in `docs/architecture/`. The report must answer every item above and end with three lists:

- **Green lights** — items that match assumptions and unblock the build as planned.
- **Yellow lights** — items that require a minor adjustment (a different folder, a different lesson ID, a different field name) but do not block.
- **Red lights** — items that contradict the plan and require Toam's decision before code begins.

No code is written until Toam reviews the audit.

---

# 5. Data Mapping

This section maps the design's data needs onto the lesson record shape. It assumes the structured fields named in CLAUDE.md exist; the audit (§4) will confirm.

## 5.1 Field → use mapping

| Lesson field | Used for | Honesty rule |
|---|---|---|
| `objective` | Narration opening (after persona greeting). Also surfaced in ReaderMode as the lesson's intro paragraph. | Use the field text verbatim or with minor connective rewording. Do not add new claims. |
| `technical_depth` | Narration mid-section. Surfaced as a "What's underneath" section in ReaderMode. | Verbatim or paraphrased. Never extend with invented technique. |
| `taxonomy` | Surfaced in ReaderMode as a definition list. Not narrated unless short. | Verbatim only. |
| `terminology` | Same as taxonomy. Optionally narrated as "A few words you'll hear..." | Verbatim only. |
| `common_failures` | Narration mid-section ("Here is where people usually slip..."). Strong candidate. | Verbatim or close paraphrase. |
| `practical_execution` | **Primary source of Key Takeaways.** Also narrated as "How to do it..." | Verbatim. Never invent steps. |
| `guest_application` | **Secondary source of Key Takeaways.** Narrated as "What the guest feels..." | Verbatim. |
| `drill` | One takeaway line (the practice instruction). Narrated as the lesson's closing practice direction. | Verbatim. |
| `assessment_questions` | **Source of Review Questions.** | Render as reflective prompts. Do not score. Verbatim wording. |

## 5.2 Lessons suitable for MVP

Two lessons are needed:

- **One voice-mode lesson:** a Bar Academy lesson with at least:
  - `objective` populated
  - one of {`practical_execution`, `guest_application`, `drill`} populated
  - 2+ `assessment_questions`
  - no video source required
- **One video-mode lesson:** any lesson in the repo with a working video embed (Synthesia or `<video>` source). The audit identifies which.

If no Bar lesson meets the voice-mode threshold, two paths exist:
1. Toam selects a Bar lesson and provides editorial content for the missing fields (preferred — keeps MVP cleanly in Bar Academy).
2. MVP slips to a different academy whose richest lesson meets the threshold — but this requires that academy's persona to be built, breaking the "one persona in MVP" rule.

The audit must surface this decision early.

## 5.3 Lessons NOT suitable yet

Any lesson with **only** `objective` populated is too thin for MVP voice narration. The narration would consist of one source-derived segment plus persona greeting and closing — too short, too thin, will not feel like a lesson. These lessons can remain visible in the Academy catalog and use the existing (pre-MVP) lesson surface until they have editorial content.

## 5.4 What must not be invented

Repeating because it cannot be over-stated:

- **Transcripts** — for voice mode we do not call it a transcript at all; we call it an "Instructor Script" or "Guided Narration." See §6.
- **Takeaways** — never invented from prose. Sourced only from structured fields.
- **Review questions** — never invented. Sourced only from `assessment_questions`. Empty state is a reflective prompt voiced by the persona, never a fake question.
- **Professional standards** (e.g., specific service rules, technique parameters, recipes, wine facts) — never invented. The persona's voice can warm transitions but cannot introduce technical content.
- **The persona's biography or credentials** — the persona's `short_bio` and `signature_phrase` come from the persona record. They are written by Toam (or this design package), not generated.

---

# 6. Instructor Narration Script Layer

The most important new layer in MVP. Its job is to turn existing lesson content into spoken narration that sounds like Rafael — without inventing facts.

## 6.1 Naming

The output is called **"Instructor Script"** or **"Guided Narration."** It is **not** called a transcript unless the source is true recorded audio/video.

Rationale: a transcript implies fidelity to a recorded performance. The narration script is a derived artifact assembled from structured lesson fields and persona phrases. Calling it a transcript would be a small fabrication. We are honest about what it is.

## 6.2 What the narration layer may do

- Use existing lesson field text verbatim or with minor connective rewording (e.g., joining two structured fragments with a transition).
- Add persona greeting phrases from the persona record at the start of the script.
- Add persona closing phrases from the persona record at the end of the script.
- Add short hospitality-voiced connective phrases between source segments: "Let's begin," "Hold this thought," "Now bring it to the floor," "This is the part to practice," "One more thought before we close." These phrases come from a small fixed library per persona — they are not generated.
- Estimate per-sentence duration in milliseconds (from character count or, when available, real `boundary` events from the speech engine).
- Mark each segment with its `sourceField` for traceability.

## 6.3 What the narration layer may NOT do

- Add new technical claims (no new steps, no new parameters, no new ingredients, no new service rules).
- Add new facts about products, ingredients, wines, methods, equipment, history, geography.
- Add new recipes or modify existing recipe content.
- Add new operational standards.
- Add new persona biography content beyond what is in the persona record.
- Compose more than a single connective phrase between two structured segments.
- Run any LLM call at runtime to fill content. The narration is deterministic: same lesson + same persona → same script.

## 6.4 Segment shape

```js
{
  id: "segment-001",                          // unique within lesson
  sourceField: "objective"                     // canonical field name in the lesson, or null for greeting/closing/transition
                  | "technical_depth"
                  | "common_failures"
                  | "practical_execution"
                  | "guest_application"
                  | "drill"
                  | "assessment_questions"
                  | null,
  type: "greeting"                             // mandatory taxonomy
        | "source-derived"
        | "transition"
        | "closing",
  text: "Welcome behind the bar. Today we will focus on a calm Martini.",
  estimatedDurationMs: 4200,                   // computed by service; updated at runtime when boundary events fire
  personaId: "bar-rafael"
}
```

Notes:
- `sourceField` is `null` only for `greeting`, `closing`, and `transition` types. Every `source-derived` segment must point back to a real lesson field.
- `text` for `source-derived` segments must be derivable from the source field. If text is rewritten for flow, the rewrite must preserve every claim and must not add any new claim.
- `estimatedDurationMs` is an initial estimate (≈ 60ms per character, clamped to 800–12000ms per segment). It is refined at runtime when the speech engine emits `boundary` events.

## 6.5 Script assembly algorithm (deterministic)

The `instructorNarrationScriptService` implements this. Pseudocode:

```
buildScript(lesson, persona) → segments[]:

  segments = []

  segments.push({ type: "greeting", text: pickFromPool(persona.greeting_phrases, lesson.id) })

  if lesson.objective:
    segments.push({ type: "source-derived", sourceField: "objective", text: lesson.objective })

  if lesson.terminology AND length(terminology) <= 4 short items:
    segments.push({ type: "transition", text: persona.transition_to_terminology })
    segments.push({ type: "source-derived", sourceField: "terminology", text: format(lesson.terminology) })

  if lesson.technical_depth:
    segments.push({ type: "transition", text: persona.transition_to_depth })
    segments.push({ type: "source-derived", sourceField: "technical_depth", text: lesson.technical_depth })

  if lesson.common_failures:
    segments.push({ type: "transition", text: persona.transition_to_failures })
    segments.push({ type: "source-derived", sourceField: "common_failures", text: lesson.common_failures })

  if lesson.practical_execution:
    segments.push({ type: "transition", text: persona.transition_to_practice })
    segments.push({ type: "source-derived", sourceField: "practical_execution", text: lesson.practical_execution })

  if lesson.guest_application:
    segments.push({ type: "transition", text: persona.transition_to_guest })
    segments.push({ type: "source-derived", sourceField: "guest_application", text: lesson.guest_application })

  if lesson.drill:
    segments.push({ type: "transition", text: persona.transition_to_drill })
    segments.push({ type: "source-derived", sourceField: "drill", text: lesson.drill })

  segments.push({ type: "closing", text: pickFromPool(persona.closing_phrases, lesson.id) })

  for each segment:
    segment.estimatedDurationMs = estimateDuration(segment.text)
    segment.personaId = persona.id
    segment.id = "segment-" + indexZeroPadded

  return segments
```

`pickFromPool(pool, seed)` chooses deterministically (e.g., `pool[hash(seed) % pool.length]`) so a learner returning to a lesson hears the same greeting.

Each segment is broken into one or more **sentences** by the service for transcript rendering. Sentence-level timing within a segment is the speech engine's responsibility; the service supplies the segment, the engine speaks it, and the UI tracks the active sentence boundary.

## 6.6 Transition phrase library per persona (MVP — Rafael only)

```
barRafael.transitions = {
  to_terminology:      "A few words before we begin.",
  to_depth:            "Here is what is underneath.",
  to_failures:         "Here is where most pours go wrong.",
  to_practice:         "Now, the part that matters.",
  to_guest:            "And from the guest's side—",
  to_drill:            "Tonight, practice it once. Just once.",
}
```

These are written, not generated. They live in the persona record.

## 6.7 Storage

The narration script is built **at runtime**, not stored. Inputs are deterministic (lesson record + persona record), so the same script is produced every time. This keeps lesson editing simple — when Toam improves a lesson's `practical_execution`, the narration updates automatically next session, no migration needed.

If runtime build is too slow for some lesson (extremely unlikely at expected lesson sizes), the service may cache the assembled script in memory for the session. It is never persisted to disk or localStorage.

## 6.8 What happens when content is too thin

If `buildScript(lesson, persona)` produces fewer than 3 `source-derived` segments, the service returns a flag `editorialNeeded: true` and an array containing only the greeting and a single voiced apology segment:

```
"This lesson is still being prepared. Step back in when Rafael has more to teach."
```

The UI shows the persona greeting, the apology segment, and the closing. **No invention. No fake content.** The lesson is marked in the catalog as "in preparation" (out of MVP scope but the data flag must be present so the catalog can pick it up later).

## 6.9 Translation between segments and transcript sentences

The TranscriptPanel needs sentence-level granularity for the brass underline. The service produces:

- A flat array of **sentences**, each with: `{ text, segmentId, sourceField, isFirstInSegment, estimatedDurationMs }`.
- A parallel **segment-to-sentence map** for telemetry and source-back traceability.

Sentence splitting uses a conservative regex (split on `. ` / `? ` / `! ` with abbreviation handling). For MVP, simple sentence splitting is acceptable — perfect natural-language sentence segmentation is a future polish.

---

# 7. QA Plan

A QA planner's view of how to verify MVP without an exhaustive test suite. Manual smoke tests plus a small set of automated unit tests.

## 7.1 Manual smoke test script

Run these in order on a clean browser session. Each is pass/fail.

**A. Bar voice lesson — happy path**
1. Open the Bar Academy voice MVP lesson.
2. Confirm header shows: back affordance, `BAR ACADEMY · LESSON [N]` badge, lesson title, Rafael's greeting on its own line.
3. Confirm stage shows Rafael's portrait with a slow breathing animation.
4. Press Play.
5. Confirm voice begins speaking after Rafael's greeting.
6. Confirm caption appears above the waveform line and updates per sentence.
7. Confirm transcript active sentence has a brass underline that grows left-to-right with the speech.
8. Confirm the transcript auto-scrolls so the active sentence stays vertically centered.
9. Pause. Confirm voice stops, portrait keeps breathing, caption holds last sentence.
10. Resume. Confirm playback continues from the paused sentence boundary.
11. Restart (with progress > 50%). Confirm a quiet confirm appears.
12. Back. Confirm a quiet step-away confirm appears.
13. Reach end. Confirm closing phrase shows; key takeaways panel gains a brass top border; review questions panel becomes reachable.

**B. Video lesson — happy path**
1. Open the MVP video lesson.
2. Confirm no Synthesia logo, no native iframe chrome, no native video controls visible.
3. Play. Confirm video plays inside the HESTIA stage frame.
4. Confirm HESTIA's control bar drives play/pause/restart.
5. Confirm the transcript panel still updates if transcript timing is available.

**C. ReaderMode triggered by missing voice**
1. In a browser/device where `speechSynthesis` is unavailable (or test by stubbing it to `undefined`).
2. Open the voice MVP lesson.
3. Confirm ReaderMode loads: paper surface, still portrait, lesson laid out as a typographic document, caption "Reading with Rafael today."
4. Confirm Key Takeaways and Review Questions still render.

**D. ReaderMode triggered by failed video**
1. With a deliberately bad video source.
2. Open the video MVP lesson.
3. Confirm fallback to ReaderMode (since no voice exists for this lesson in MVP) with the "Video is resting" caption.

**E. Resume**
1. Play the voice lesson until 3 sentences in.
2. Refresh the page.
3. Confirm resume offers to continue at the last completed sentence boundary, not at zero.

**F. Reduced motion**
1. Enable `prefers-reduced-motion: reduce` in the OS or browser.
2. Open the voice lesson.
3. Confirm portrait is still, waveform is static, no fades, brass highlight on active sentence is static (no growing-bar animation).

**G. Empty takeaways**
1. Identify a lesson where structured fields produce no eligible takeaways (or stub the data).
2. Open the lesson.
3. Confirm the Key Takeaways panel shows Rafael's voiced empty line, never a blank panel or invented content.

**H. Empty review questions**
1. Identify a lesson where `assessment_questions` is empty.
2. Confirm the Review Questions panel shows Rafael's reflective empty prompt.

**I. Honesty audit**
1. Read every visible string in the rendered MVP. Confirm none of the forbidden words/phrases appear: "TTS," "AI voice," "synthesized," "module," "course," "earn," "XP," "complete the course," "submit," exclamation marks, emoji.
2. Confirm no fabricated content — every spoken segment maps to a structured field or a persona phrase.

**J. Existing Academy regression**
1. Navigate to any other Academy lesson (not the MVP target).
2. Confirm it renders exactly as it did before MVP — no visual changes, no broken navigation.

## 7.2 Automated unit tests (recommended minimum)

These are not optional even in MVP because they protect the honesty rails.

- `instructorNarrationScriptService.buildScript()` — given a synthetic lesson with each field present and absent, asserts:
  - Returns the expected number of segments.
  - Returns `editorialNeeded: true` when fewer than 3 source-derived segments are produced.
  - Never invents a sentence not derivable from a field or persona record.
  - `sourceField` is correctly set on every source-derived segment.
- `academyInstructorService.selectTakeaways()` — given a lesson with various combinations of structured fields, asserts:
  - Never returns more than 5 takeaways.
  - Never returns content not present in the source fields.
  - Returns the persona-voiced empty line when no eligible takeaways exist.
- `instructorVoiceProvider.pickVoice()` — given a persona's voice profile and a list of available system voices, asserts:
  - Returns the first matching candidate.
  - Returns `null` (not a fallback voice) when no candidate matches — this triggers ReaderMode upstream.

A handful of snapshot or render tests for the `TranscriptPanel` active/past/upcoming states is useful but not mandatory for MVP.

---

# 8. Risk Audit

What could go wrong, ranked.

## 8.1 High risk

**R1. Browser TTS voices are unusable on Toam's target devices.**
- Likelihood: medium-high. iOS Safari and Chrome on Android both expose limited voice sets.
- Impact: voice mode falls to ReaderMode for many lessons. The product is still complete (ReaderMode is dignified), but the demo of "voice with Rafael" loses some power.
- Mitigation: audit available voices on the actual target devices before final voice profile selection. If iOS voices are too thin, consider commissioning a single recorded narration sample for Rafael (out of MVP scope but a possible polish task) to demo the voice path with real audio while keeping the architecture identical.

**R2. The active-sentence brass underline animates janky on lower-end devices.**
- Likelihood: medium. Animating layout width is the trap; animating `transform: scaleX` against a 1px-tall element on the GPU is fine.
- Impact: shatters the emotional center. Visible failure of the most important interaction.
- Mitigation: use transform-based animation. Test on a mid-tier Android. Use `prefers-reduced-motion` to skip animation if devices report poorly. Have a non-animated brass bar as a hard fallback.

**R3. The MVP lesson chosen for the voice path has too thin structured fields.**
- Likelihood: medium. The audit will reveal.
- Impact: the voice MVP lesson sounds like a 30-second greeting + apology + closing. Demo fails.
- Mitigation: the audit (§4) catches this. Toam either populates a Bar lesson's fields, or selects a different lesson, before code begins.

## 8.2 Medium risk

**R4. The existing Academy navigation requires more than a minimal touch to add the new route.**
- Likelihood: medium.
- Impact: scope creep into the Academy router.
- Mitigation: the audit (§4) reports the routing pattern. If integration is non-trivial, MVP ships with a temporary direct entry point (e.g., a query parameter or a single button on the existing lesson page) and the full catalog integration becomes a follow-up.

**R5. Synthesia (or whichever video provider) emits chrome that the iframe cannot fully suppress.**
- Likelihood: medium for Synthesia (provider-controlled chrome is real).
- Impact: provider branding leaks, breaking the premium frame.
- Mitigation: review the provider's embed configuration options. Use a 1px brass-toned overlay strip in the corner where the provider logo appears, masking it. If no clean suppression is possible, escalate to Toam — switching providers is a business decision, not a code decision.

**R6. Resume point persistence is wrong on first run after a deploy that changes sentence splitting.**
- Likelihood: low-medium.
- Impact: a learner resumes at the wrong sentence.
- Mitigation: include a version number in the persistence key (e.g., `hospia.academy.instructor.{lessonId}.v1.lastSentenceIndex`). When the sentence-splitting changes, bump the version and the saved index is invalidated cleanly.

## 8.3 Low risk

**R7. The hand-drawn portrait of Rafael is not commissioned in time for MVP.**
- Likelihood: high. Real illustrators take real time.
- Impact: low if mitigated. Ship a single high-quality silhouette in brass on dark — less identity but premium feel — until the real portrait arrives.
- Mitigation: silhouette is good enough for MVP. Replacement portrait swaps in as data, no code change.

**R8. The transition phrases between segments feel scripted or repetitive.**
- Likelihood: low if Toam writes them with care.
- Impact: low; tunable in the persona record.
- Mitigation: limit MVP to one transition phrase per source field (six in total). Multi-phrase rotation is a future tuning.

**R9. Reduced-motion implementation breaks something else.**
- Likelihood: low.
- Impact: low — reduced-motion users get a more static experience but content is preserved.
- Mitigation: keep reduced-motion handling in CSS media queries primarily, not in JS, to minimize bug surface.

---

# 9. Implementation Order (sequenced for one Claude Code session)

Each step has a deliverable and a check. Steps are sequential — do not parallelize unless explicitly noted.

| Step | Deliverable | Check before next step |
|---|---|---|
| 0 | **Audit** (§4) → `HESTIA_ACADEMY_INSTRUCTOR_AUDIT.md` | Toam reviews and unblocks |
| 1 | Persona record: `src/domain/academy/personas/barRafael.js` and `personas/index.js` | Exports load, no runtime errors |
| 2 | Tokens: extend existing token file or create `src/design/tokens.js` with HESTIA base + Bar accents + motion + type tokens | Tokens importable; no visual regression on other pages |
| 3 | Narration service: `instructorNarrationScriptService.js` + unit tests | `buildScript()` passes tests; outputs verified by hand for the MVP voice lesson |
| 4 | Instructor service: `academyInstructorService.js` (mode resolution, takeaway selection, review prompt mapping) + unit tests | Tests pass; outputs verified for the MVP lesson |
| 5 | Voice provider: `instructorVoiceProvider.js` | Smoke: calling `speakSentence` on a real browser plays audio; `pickVoice` returns null on a stub with no matching voices |
| 6 | Video provider: `instructorVideoProvider.js` | Smoke: mounts the existing video lesson inside a stub container |
| 7 | Hook: `useAcademyInstructorSession.js` (no UI yet) | Hook compiles; orchestrates the services through manual console wiring |
| 8 | Components scaffold: all files in `src/features/academy/instructor/` with prop interfaces and TODO bodies | Components render placeholder text |
| 9 | `StageFrame` + `LessonHeader` + `ProgressIndicator` first to set the visual frame | Looks right on desktop and mobile |
| 10 | `VideoStage` wired to the video provider | Video lesson plays inside the frame, no native chrome visible |
| 11 | `PortraitStage` (portrait, waveform, caption) wired to the voice provider | Voice lesson speaks; portrait breathes; caption updates |
| 12 | `TranscriptPanel` + `TranscriptSentence` with active-sentence brass underline | Underline grows smoothly with speech |
| 13 | `LessonControlBar` — play, pause, restart, back with minimal confirms | All four controls work; existing Academy navigation still works |
| 14 | `KeyTakeawaysPanel` and `ReviewQuestionsPanel` reading from service outputs | Both render only from structured fields; empty cases show Rafael's voiced lines |
| 15 | `ReaderMode` deep fallback | Triggers when voice and video are unavailable |
| 16 | Reduced-motion handling end-to-end | Manual smoke test F passes |
| 17 | Resume point persistence | Manual smoke test E passes |
| 18 | Pass the entire smoke test script (§7.1) | Every test green |
| 19 | Update `CLAUDE.md` with a one-paragraph checkpoint noting the MVP scope and which persona shipped | Toam reviews |

## 9.1 Notes on sequencing

- Steps 1–7 are services/data and produce no visible UI. They are the foundation. Resist the temptation to start with components.
- The Narration service (step 3) **must** come before the Voice provider (step 5). The provider only needs sentences to speak — the script comes from the service.
- The `StageFrame` (step 9) is shared between Video and Portrait stages; build it once and reuse.
- Steps 10 and 11 (Video and Portrait) can be parallelized in two sub-sessions if Toam prefers, but the same Claude Code session should do both consecutively to keep style consistent.

---

# 10. Acceptance Criteria

The single bar Claude Code must clear before the MVP is called complete. Reused from §2.4 with added technical precision.

1. **Routing.** A reachable path leads from the existing Academy entry point to the new `AcademyLessonScreen` for the MVP Bar lesson(s). No other Academy navigation is broken.
2. **Persona-first greeting.** `LessonHeader` displays the academy badge, lesson title, and a greeting line attributed to Rafael, **before** the stage finishes loading. This is testable: with a network throttle, the greeting appears first.
3. **Stage frame visible and consistent.** Both Video and Portrait stages render inside the same `StageFrame`. No iframe-default border, no provider logo, no native controls.
4. **Video path.** The chosen video lesson plays inside the frame. HESTIA's controls drive playback. Pause, resume, restart, and back work.
5. **Voice path.** The chosen voice lesson speaks Rafael's narration. Portrait breathes. Waveform animates softly. Caption updates per sentence.
6. **Brass underline.** The active transcript sentence has a brass underline that animates left-to-right across the speech duration of that sentence. Smooth on a mid-tier device.
7. **Transcript scroll.** Active sentence stays vertically centered in the transcript panel as playback advances.
8. **Honesty: narration.** Every spoken segment is either a persona phrase (greeting, closing, transition) or derives from a real lesson field. The narration service unit tests pass.
9. **Honesty: takeaways.** Up to 5 takeaways, sourced only from structured fields. Empty case shows Rafael's voiced empty line.
10. **Honesty: review questions.** Up to 4 reflective prompts, sourced only from `assessment_questions`. Empty case shows Rafael's reflective empty prompt. No scoring chrome anywhere.
11. **ReaderMode.** Triggers when neither voice nor video can play. Surface is dignified — typographic document with the "Reading with Rafael today" caption.
12. **Reduced motion.** With `prefers-reduced-motion: reduce`, portrait is still, waveform is static, transitions are instant, brass underline is a static highlight not an animation.
13. **Resume.** Closing the screen mid-lesson and returning resumes at the last completed sentence boundary, keyed in localStorage as `hospia.academy.instructor.{lessonId}.v1.lastSentenceIndex`.
14. **Architecture compliance.** `App.jsx` is untouched. All state lives in `useAcademyInstructorSession`. All intelligence lives in services. Components are stateless except for the review question reflection local input.
15. **No forbidden language.** A grep of the rendered MVP for "TTS," "AI voice," "synthesized," "module," "complete the course," "earn," "XP," exclamation marks, and emoji returns zero hits in user-facing copy.
16. **No regression.** Every other Academy lesson and every other surface in the app renders exactly as before.
17. **Audit document.** `HESTIA_ACADEMY_INSTRUCTOR_AUDIT.md` exists, lists findings, and was reviewed by Toam before code began.

---

# 11. Open questions for Toam

These block or shape the build. Answers are needed before, or at the earliest moment of, Claude Code's first session.

1. **Final persona name confirmation for Bar Academy.** Is "Rafael" the right name for MVP, or should the first persona to ship be a different academy's instructor (e.g., Mira / Service, given that `service-001` may be the only video-capable lesson today)? If Service ships first, this changes the persona record built in MVP.

2. **Voice mode lesson selection.** The audit (§4) will list candidate Bar Academy lessons. Toam must pick one — or commit to populating structured fields for a chosen Bar lesson before code begins.

3. **Video mode lesson selection.** If `service-001` is the only video-capable lesson and the MVP persona is Rafael (Bar), does Toam want the MVP to:
   - (a) skip a video lesson and demo MVP as voice-only (Bar/Rafael), OR
   - (b) ship a cross-academy MVP (Service video + Bar voice) with two personas live, OR
   - (c) move MVP persona to Mira / Service to keep one persona one academy?
   This is a Toam-level product call. The MVP scope changes meaningfully across the three options.

4. **Portrait commission.** Is Toam commissioning a hand-drawn portrait of Rafael (or whoever ships first) before MVP, or does MVP ship with a brass silhouette as the placeholder portrait? Either is acceptable design-wise; the choice affects MVP timeline.

5. **Voice candidate audit.** Will Toam run a one-page check of available `speechSynthesis` voices on staff phones (the audit script is one line of JS) before the voice provider is built? If not, the voice profile candidate list will be best-guess and may produce ReaderMode more often than expected.

6. **ReaderMode as a chosen preference.** Should the learner be able to choose ReaderMode as a default (e.g., for silent environments) in MVP, or only as a fallback? Design recommendation: defer to follow-up.

7. **Existing Academy completion handler.** When a lesson ends in MVP, should it call the existing Academy completion handler (if one exists), or should completion wiring wait for a follow-up? Design recommendation: defer wiring until the audit confirms the existing handler's shape.

8. **Transition phrase library.** §6.6 contains a proposed set of six transition phrases for Rafael. Does Toam approve them as-is, or rewrite before MVP? They are written, not generated; they ship as data.

---

## Final note

The MVP is a vertical slice on purpose. It is not a stub or a prototype — every part of what ships must be excellent. Ship one lesson screen, with one persona, that proves "hospitality, not e-learning." When it works, the rest of the personas, academies, screen states, and polish unfold naturally on the same architecture.

The next session after MVP can then either (a) add a second persona, (b) deepen the screen-state polish, or (c) build the Academy catalog signal that lessons are hosted. None of those require revisiting the foundation laid in MVP.

Until then, the build job is to make one room feel like a room.
